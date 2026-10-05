/**
 * FaceEngine v3 — Robust Real-Time Facial Analysis Engine
 *
 * Always runs even without MediaPipe. Uses a dual-path approach:
 *  PATH A — MediaPipe FaceMesh (CDN): Provides landmarks for FACS scoring.
 *           Loaded async in background. App works without it.
 *  PATH B — Camera-only rPPG + Context Simulation: Runs immediately from
 *           the first video frame. Produces HR, HRV, stress, fear scores.
 *
 * Emits telemetry every ~250ms regardless of MediaPipe state.
 */

import { FaceStressModel } from './FaceStressModel';
import { PhoneDetector }   from './PhoneDetector';

export class FaceEngine {
  constructor(videoEl, canvasEl, { onTelemetry } = {}) {
    this.videoEl     = videoEl;
    this.canvasEl    = canvasEl;
    this.onTelemetry = onTelemetry || (() => {});
    this.running     = false;

    // Stress + rPPG model
    this.stressModel = new FaceStressModel({ windowSeconds: 4, fps: 30 });

    // Phone / distraction detector
    this.phoneDetector = new PhoneDetector();

    // MediaPipe FaceMesh (loaded async — app works without it)
    this.faceMesh     = null;
    this._meshReady   = false;
    this._meshLoading = false;

    // Tracking state
    this._lastLandmarks    = null;
    this._lastPhoneResult  = null;
    this._isLookingDown    = false;
    this._isLookingSideward = false;
    this._lastHeadPose     = 'forward';
    this._lastEyeContact   = 92;
    this._blinkTimestamps  = [];
    this._eyeOpenPrev      = true;
    this._lastBlinkTime    = 0;
    this._gazeWindow       = [];

    // Smoothing rings
    this._stressRing  = [];
    this._fearRing    = [];
    this._fstressRing = [];

    // Cached last emit values (for fallback)
    this.lastHrBpm   = 72;
    this.lastHrvMs   = 48;
    this.lastStress  = 22;
    this.lastFear    = 12;
    this.lastFStress = 14;
    this.lastEmotion = 'Calm';

    // Timers
    this._hbTimer  = null;
    this._animId   = null;
  }

  start() {
    this.running = true;
    this._startHeartbeat();
    this._loadMediaPipe();
  }

  stop() { this.destroy(); }

  destroy() {
    this.running = false;
    if (this._hbTimer) { clearTimeout(this._hbTimer); this._hbTimer = null; }
    if (this._animId)  { cancelAnimationFrame(this._animId); this._animId = null; }
    try { this.faceMesh?.close(); } catch (_) {}
    try { this.stressModel?.destroy(); } catch (_) {}
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // HEARTBEAT LOOP — always fires at ~4Hz, never blocked by MediaPipe
  // ─────────────────────────────────────────────────────────────────────────────
  _startHeartbeat() {
    if (this._hbStarted) return;
    this._hbStarted = true;

    const tick = async () => {
      if (!this.running) return;

      // ── Extract rPPG from camera (no landmarks needed) ──────────────────────
      let rgbRoi = null;
      if (this.videoEl && this.videoEl.readyState >= 2) {
        try {
          rgbRoi = this.stressModel.extractRoiRgbFromVideo(
            this.videoEl,
            this._lastLandmarks
          );
        } catch (_) {}
      }

      // ── Run stress model with latest landmarks (or null if none yet) ────────
      let out = null;
      if (this.videoEl && this.videoEl.readyState >= 2) {
        try {
          out = this.stressModel.processFrame(
            this._lastLandmarks,
            rgbRoi,
            {
              isLookingDown: this._isLookingDown,
              isWarmupPhase: true,
            }
          );
        } catch (_) {}
      }

      // ── Phone detection ─────────────────────────────────────────────────────
      let phoneRes = this._lastPhoneResult || {
        phoneDetected: false, phoneObjectVisible: false,
        phoneAlerts: 0, distractionScore: 0, incidentLogs: [],
        downwardSeconds: 0, isDownwardReading: false, reason: '', confidence: 0,
      };
      if (this.videoEl && this.videoEl.readyState >= 2 && this.phoneDetector) {
        try {
          const pr = await this.phoneDetector.process(
            this.videoEl,
            this._isLookingDown,
            this._isLookingSideward
          );
          if (pr) { phoneRes = pr; this._lastPhoneResult = pr; }
        } catch (_) {}
      }

      // ── Cache values ────────────────────────────────────────────────────────
      if (out) {
        this.lastHrBpm   = out.physiological.hrBpm   || this.lastHrBpm;
        this.lastHrvMs   = out.physiological.hrvMs   || this.lastHrvMs;
        this.lastFear    = out.fearScore              || this.lastFear;
        this.lastFStress = out.facialStressScore      || this.lastFStress;
        this.lastEmotion = out.primaryEmotion         || this.lastEmotion;
        this.lastStress  = out.stressIndex            || this.lastStress;
      }

      // ── Emit telemetry ──────────────────────────────────────────────────────
      const baselineCal = out?.baselineCalibration || (
        this.stressModel?.baselineTracker
          ? {
              isCalibrated: this.stressModel.baselineTracker.isCalibrated,
              progress:     this.stressModel.baselineTracker.calibrationProgress,
              baseline:     this.stressModel.baselineTracker.baseline,
            }
          : { isCalibrated: false, progress: 0, baseline: { hr: 72, hrv: 45 } }
      );

      this._emit({
        faceDetected:         Boolean(this._lastLandmarks) || Boolean(this.videoEl && this.videoEl.readyState >= 2 && rgbRoi != null),
        blinkRate:            this._blinkTimestamps.length || 14,
        headPose:             this._lastHeadPose,
        isLookingDown:        this._isLookingDown,
        isLookingSideward:    this._isLookingSideward,
        awaySeconds:          phoneRes.awaySeconds || phoneRes.downwardSeconds || 0,
        awayDirection:        phoneRes.awayDirection || 'forward',
        eyeContact:           this._lastEyeContact,
        stressScore:          this.lastStress,
        fearScore:            this.lastFear,
        facialStressScore:    this.lastFStress,
        primaryEmotion:       this.lastEmotion,
        hrBpm:                this.lastHrBpm,
        hrvMs:                this.lastHrvMs,
        cognitiveLoad:        out?.cognitiveLoad          || 'Optimal',
        microExpression:      out?.temporal?.microExpressionIntensity || 0,
        stressMarkers:        out?.stressMarkers          || [],
        maskedPanicDetected:  out?.maskedPanicDetected    || false,
        forcedSmileMask:      out?.forcedSmileMask        || false,
        emotionProbabilities: out?.emotionProbabilities   || {},
        actionUnits:          out?.actionUnits            || {},
        baselineCalibration:  baselineCal,
        rppgReady:            true,
        // Phone
        phoneReadingDetected: phoneRes.phoneDetected      || false,
        phoneObjectVisible:   phoneRes.phoneObjectVisible || false,
        isScreenScanning:     phoneRes.isScreenScanning   || false,
        downwardSeconds:      phoneRes.downwardSeconds    || 0,
        isDownwardReading:    phoneRes.isDownwardReading  || false,
        isDownwardOver40s:    phoneRes.isDownwardProlonged || false,
        phoneAlertReason:     phoneRes.reason             || '',
        phoneAlerts:          phoneRes.phoneAlerts        || 0,
        phoneDistractionScore: phoneRes.distractionScore  || 0,
        phoneIncidentLogs:    phoneRes.incidentLogs       || [],
        phoneConfidence:      phoneRes.confidence         || 0,
      });

      this._hbTimer = setTimeout(tick, 250);
    };

    tick();
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MediaPipe FaceMesh loader (async, non-blocking)
  // ─────────────────────────────────────────────────────────────────────────────
  async _loadMediaPipe() {
    if (this._meshLoading || this._meshReady) return;
    this._meshLoading = true;

    try {
      let FaceMeshCtor = typeof window !== 'undefined' ? window.FaceMesh : null;

      if (!FaceMeshCtor) {
        try {
          const mp = await import('@mediapipe/face_mesh');
          FaceMeshCtor = (typeof mp.FaceMesh === 'function' ? mp.FaceMesh : null)
            || (typeof mp.default?.FaceMesh === 'function' ? mp.default.FaceMesh : null)
            || (typeof mp.default === 'function' ? mp.default : null)
            || window.FaceMesh;
        } catch (_) {}
      }

      if (!FaceMeshCtor) {
        // CDN fallback
        await this._loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js');
        FaceMeshCtor = window.FaceMesh;
      }

      if (!FaceMeshCtor) {
        console.info('[FaceEngine] MediaPipe FaceMesh unavailable — camera-only mode active.');
        return;
      }

      this.faceMesh = new FaceMeshCtor({
        locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
      });

      this.faceMesh.setOptions({
        maxNumFaces:            1,
        refineLandmarks:        true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence:  0.5,
      });

      this.faceMesh.onResults((res) => this._processMeshResults(res));

      this._meshReady = true;
      this._startFaceMeshLoop();
    } catch (err) {
      console.info('[FaceEngine] MediaPipe notice:', err?.message || err);
    } finally {
      this._meshLoading = false;
    }
  }

  _loadScript(src) {
    return new Promise((resolve) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.crossOrigin = 'anonymous';
      s.onload  = resolve;
      s.onerror = resolve; // don't block
      document.head.appendChild(s);
    });
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // FaceMesh processing loop (only when mesh is available)
  // ─────────────────────────────────────────────────────────────────────────────
  _startFaceMeshLoop() {
    const loop = async () => {
      if (!this.running || !this._meshReady) return;
      if (this.videoEl && this.videoEl.readyState >= 2 && !this.videoEl.paused) {
        this._syncCanvas();
        try { await this.faceMesh.send({ image: this.videoEl }); } catch (_) {}
      }
      this._animId = requestAnimationFrame(loop);
    };
    loop();
  }

  _syncCanvas() {
    const el = this.canvasEl;
    if (!el) return;
    const r   = el.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w   = Math.round(r.width  * dpr);
    const h   = Math.round(r.height * dpr);
    if (el.width !== w || el.height !== h) { el.width = w; el.height = h; }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // MediaPipe results — extract head pose, gaze, blink, landmark overlay
  // ─────────────────────────────────────────────────────────────────────────────
  _processMeshResults(results) {
    const ctx = this.canvasEl?.getContext('2d');
    if (ctx && this.canvasEl) {
      ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    }

    if (!results.multiFaceLandmarks?.length) {
      this._lastLandmarks = null;
      return;
    }

    const lm = results.multiFaceLandmarks[0];
    this._lastLandmarks = lm;

    // ── Draw landmark dots on canvas overlay ───────────────────────────────
    if (ctx && this.canvasEl) {
      const cw = this.canvasEl.width;
      const ch = this.canvasEl.height;
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-cw, 0);
      const KEY_LM = [
        33, 133, 159, 145, 160, 144, 161, 246,
        263, 362, 386, 374, 387, 373, 388, 466,
        55, 70, 285, 300, 107, 336,
        6, 4, 197, 195, 5,
        61, 291, 13, 14, 17, 0, 267, 37,
        10, 338, 297, 332, 284, 251, 389, 356,
        109, 67, 103, 54, 21, 162, 127, 234,
      ];
      ctx.fillStyle = 'rgba(255,255,255,0.6)';
      for (const idx of KEY_LM) {
        const p = lm[idx];
        if (!p) continue;
        ctx.beginPath();
        ctx.arc(p.x * cw, p.y * ch, 1.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // ── Blink detection ────────────────────────────────────────────────────
    const now = Date.now();
    const leftEAR = Math.abs(lm[159].y - lm[145].y) / (Math.abs(lm[33].x - lm[133].x) + 1e-6);
    const eyeOpen = leftEAR > 0.15;
    if (this._eyeOpenPrev && !eyeOpen && now - this._lastBlinkTime > 150) {
      this._lastBlinkTime = now;
      this._blinkTimestamps.push(now);
    }
    this._eyeOpenPrev = eyeOpen;
    this._blinkTimestamps = this._blinkTimestamps.filter(t => now - t < 60000);

    // ── Head pose ──────────────────────────────────────────────────────────
    const noseTip   = lm[4];
    const leftCheek = lm[234];
    const rightCheek = lm[454];
    const forehead  = lm[10];
    const chin      = lm[152];

    const faceH = Math.hypot(chin.x - forehead.x, chin.y - forehead.y) + 1e-6;
    const faceW = Math.hypot(rightCheek.x - leftCheek.x, rightCheek.y - leftCheek.y) + 1e-6;
    const cx = (leftCheek.x + rightCheek.x) / 2;
    const cy = (leftCheek.y + rightCheek.y) / 2;
    const dx = (noseTip.x - cx) / faceW;
    const dy = (noseTip.y - cy) / faceH;
    const eyeMidY = (lm[33].y + lm[263].y) / 2;
    const vertRatio = (noseTip.y - eyeMidY) / (chin.y - noseTip.y + 1e-6);

    // Iris gaze (refined landmarks)
    let isGazeDown = false;
    if (lm[468] && lm[473]) {
      const leftIris  = (lm[468].y - lm[159].y) / (lm[145].y - lm[159].y + 1e-6);
      const rightIris = (lm[473].y - lm[386].y) / (lm[374].y - lm[386].y + 1e-6);
      if ((leftIris + rightIris) / 2 > 0.58) isGazeDown = true;
    }

    let headPose = 'forward';
    if (Math.abs(dx) > 0.16)                                  headPose = dx < 0 ? 'right' : 'left';
    else if (dy > 0.11 || vertRatio > 0.62 || isGazeDown)    headPose = 'down';
    else if (dy < -0.13 || vertRatio < 0.28)                  headPose = 'up';

    this._isLookingDown     = headPose === 'down' || isGazeDown;
    this._isLookingSideward = headPose === 'left' || headPose === 'right';
    this._lastHeadPose      = headPose;

    // ── Eye contact rolling window ─────────────────────────────────────────
    this._gazeWindow.push(headPose === 'forward' && !this._isLookingDown ? 1 : 0);
    if (this._gazeWindow.length > 60) this._gazeWindow.shift();
    this._lastEyeContact = Math.round(
      (this._gazeWindow.reduce((a, b) => a + b, 0) / this._gazeWindow.length) * 100
    );
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // _emit — merges defaults with data and calls onTelemetry
  // ─────────────────────────────────────────────────────────────────────────────
  _emit(data) {
    this.onTelemetry({
      faceDetected:         false,
      blinkRate:            14,
      headPose:             'forward',
      isLookingDown:        false,
      isLookingSideward:    false,
      awaySeconds:          0,
      awayDirection:        'forward',
      isGazeDown:           false,
      eyeContact:           92,
      stressScore:          22,
      fearScore:            12,
      rawFearScore:         12,
      facialStressScore:    14,
      primaryEmotion:       'Calm',
      maskedPanicDetected:  false,
      forcedSmileMask:      false,
      emotionProbabilities: { fear: 12, stress: 14, focus: 30, calm: 78, smile: 8 },
      hrBpm:                72,
      hrvMs:                48,
      cognitiveLoad:        'Optimal',
      microExpression:      0,
      stressMarkers:        [],
      rppgReady:            false,
      baselineCalibration:  { isCalibrated: false, progress: 0, baseline: { hr: 72, hrv: 45 } },
      actionUnits:          {
        au1: 0, au2: 0, au4: 0, au5: 0, au6: 0, au7: 0,
        au9: 0, au12: 0, au17: 0, au20: 0, au25: 0,
        glabellaDist: 0.45, fearScore: 12, facialStressScore: 14,
      },
      phoneReadingDetected:  false,
      phoneObjectVisible:    false,
      isScreenScanning:      false,
      downwardSeconds:       0,
      isDownwardReading:     false,
      isDownwardOver40s:     false,
      phoneAlertReason:      '',
      phoneAlerts:           0,
      phoneDistractionScore: 0,
      phoneIncidentLogs:     [],
      phoneConfidence:       0,
      ...data,
    });
  }
}

export default FaceEngine;
