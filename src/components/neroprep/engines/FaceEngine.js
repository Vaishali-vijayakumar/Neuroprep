/**
 * FaceEngine — MediaPipe FaceMesh + Hybrid Spatiotemporal FaceStressModel
 *
 * Emits CognitiveTelemetry on every processed frame:
 * {
 *   faceDetected      boolean
 *   blinkRate         number   blinks/min (60-second rolling window)
 *   headPose          string   'forward' | 'left' | 'right' | 'up' | 'down'
 *   eyeContact        number   0–100  % of frames looking forward
 *   stressScore       number   0–100  smoothed composite spatiotemporal stress
 *   hrBpm             number   rPPG heart rate in BPM
 *   hrvMs             number   rPPG HRV (RMSSD) in ms
 *   actionUnits       object   { au1, au2, au4, au7, au9, au12, au17, au25, composite }
 *   cognitiveLoad     string   'Low' | 'Moderate' | 'High'
 *   microExpression   number   0–100 temporal-attention micro-expression intensity
 *   stressMarkers     string[] active stress signal descriptions for UI
 * }
 */

import { FaceStressModel } from './FaceStressModel';

export class FaceEngine {
  constructor(videoEl, canvasEl, { onTelemetry } = {}) {
    this.videoEl     = videoEl;
    this.canvasEl    = canvasEl;
    this.onTelemetry = onTelemetry || (() => {});
    this.running     = false;

    // Spatiotemporal + rPPG model
    this.stressModel = new FaceStressModel({ windowSeconds: 4, fps: 30 });

    // Blink tracking
    this.eyeOpenPrev     = true;
    this.lastBlinkTime   = 0;
    this.blinkTimestamps = [];

    // Eye contact & gaze (rolling window for instant sensitivity)
    this.eyeContactFrames = 0;
    this.totalFrames      = 0;
    this.gazeWindow       = [];

    // Smoothing
    this.stressHistory = [];

    this._init();
  }

  async _init() {
    try {
      const { FaceMesh } = await import('@mediapipe/face_mesh');
      const { Camera }   = await import('@mediapipe/camera_utils');

      this.faceMesh = new FaceMesh({
        locateFile: (file) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      this.faceMesh.setOptions({
        maxNumFaces:             1,
        refineLandmarks:         true,
        minDetectionConfidence:  0.5,
        minTrackingConfidence:   0.5,
      });

      this.faceMesh.onResults((res) => this._processResults(res));

      this.camera = new Camera(this.videoEl, {
        onFrame: async () => {
          if (this.running && this.videoEl.readyState >= 2) {
            // Sync canvas pixel size to video display size once
            this._syncCanvasSize();
            await this.faceMesh.send({ image: this.videoEl });
          }
        },
        width: 1280, height: 720,   // request HD from camera
      });

      this.running = true;
      this.camera.start();
    } catch (err) {
      console.warn('[FaceEngine] MediaPipe failed to load:', err.message);
    }
  }

  /**
   * Sync canvas PIXEL dimensions to the video element's rendered display size.
   * Without this the canvas defaults to 300×150px and landmark dots are placed
   * incorrectly, and any accidental drawImage call would be scaled up blurry.
   */
  _syncCanvasSize() {
    const el = this.canvasEl;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dpr  = window.devicePixelRatio || 1;
    const w = Math.round(rect.width  * dpr);
    const h = Math.round(rect.height * dpr);
    if (el.width !== w || el.height !== h) {
      el.width  = w;
      el.height = h;
    }
  }

  _processResults(results) {
    // ── Canvas: TRANSPARENT overlay only — never draw the video frame here.
    //    The <video> element beneath renders the crisp live feed.
    //    We only draw lightweight landmark dots on the transparent canvas.
    const ctx = this.canvasEl?.getContext('2d');
    if (ctx && this.canvasEl) {
      // Clear to fully transparent each frame
      ctx.clearRect(0, 0, this.canvasEl.width, this.canvasEl.height);
    }

    this.totalFrames++;
    const now = Date.now();

    if (!results.multiFaceLandmarks?.length) {
      this._emit({ faceDetected: false });
      return;
    }

    const lm = results.multiFaceLandmarks[0]; // 468 NormalizedLandmarks

    // ── Draw subtle landmark dots over transparent canvas ──
    if (ctx && this.canvasEl) {
      const cw = this.canvasEl.width;
      const ch = this.canvasEl.height;
      ctx.save();
      // Mirror to match the CSS scaleX(-1) on the canvas element
      ctx.scale(-1, 1);
      ctx.translate(-cw, 0);

      // Key landmark clusters: eyes, brows, nose, mouth contour
      const KEY_LM = [
        // Left eye
        33, 133, 159, 145, 160, 144, 161, 246,
        // Right eye
        263, 362, 386, 374, 387, 373, 388, 466,
        // Eyebrows
        55, 70, 285, 300, 107, 336,
        // Nose bridge + tip
        6, 4, 197, 195, 5,
        // Mouth
        61, 291, 13, 14, 17, 0, 267, 37,
        // Face oval (sparse)
        10, 338, 297, 332, 284, 251, 389, 356,
        109, 67, 103, 54, 21, 162, 127, 234,
      ];

      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)'; // monochrome dots
      KEY_LM.forEach((idx) => {
        const p = lm[idx];
        if (!p) return;
        ctx.beginPath();
        ctx.arc(p.x * cw, p.y * ch, 1.8, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    // ── 1. Blink Detection (Eye Aspect Ratio) ──
    const leftEAR = Math.abs(lm[159].y - lm[145].y) /
                   (Math.abs(lm[33].x  - lm[133].x) + 1e-6);
    const eyeOpen = leftEAR > 0.15;

    if (this.eyeOpenPrev && !eyeOpen && (now - this.lastBlinkTime) > 150) {
      this.lastBlinkTime = now;
      this.blinkTimestamps.push(now);
    }
    this.eyeOpenPrev = eyeOpen;
    this.blinkTimestamps = this.blinkTimestamps.filter(t => now - t < 60_000);
    const blinkRate = this.blinkTimestamps.length; // blinks per minute

    // ── 2. Head Pose & Scale-Invariant 3D Pitch ──
    const noseTip    = lm[4];
    const leftCheek  = lm[234];
    const rightCheek = lm[454];
    const forehead   = lm[10];
    const chin       = lm[152];

    const faceHeight = Math.hypot(chin.x - forehead.x, chin.y - forehead.y) + 1e-6;
    const faceWidth  = Math.hypot(rightCheek.x - leftCheek.x, rightCheek.y - leftCheek.y) + 1e-6;

    const cx = (leftCheek.x + rightCheek.x) / 2;
    const cy = (leftCheek.y + rightCheek.y) / 2;

    const dx = (noseTip.x - cx) / faceWidth;
    const dy = (noseTip.y - cy) / faceHeight;

    const eyeMidY = (lm[33].y + lm[263].y) / 2;
    const eyeToNose = noseTip.y - eyeMidY;
    const noseToChin = chin.y - noseTip.y;
    const verticalRatio = eyeToNose / (noseToChin + 1e-6);

    // ── 3. Iris Gaze Vector Classifier (MediaPipe Refined Landmarks 468 & 473) ──
    let isGazeDown = false;
    if (lm[468] && lm[473]) {
      const leftIrisDown  = (lm[468].y - lm[159].y) / (lm[145].y - lm[159].y + 1e-6);
      const rightIrisDown = (lm[473].y - lm[386].y) / (lm[374].y - lm[386].y + 1e-6);
      const avgIrisDown   = (leftIrisDown + rightIrisDown) / 2;
      // High threshold (0.74) to avoid false positives from natural laptop camera angle
      if (avgIrisDown > 0.74) isGazeDown = true;
    }

    let headPose = 'forward';
    if (Math.abs(dx) > 0.18) {
      headPose = dx < 0 ? 'right' : 'left';
    } else if (dy > 0.16 || verticalRatio > 0.76 || isGazeDown) {
      headPose = 'down';
    } else if (dy < -0.14 || verticalRatio < 0.28) {
      headPose = 'up';
    }

    const isLookingDown = headPose === 'down' || isGazeDown;

    // ── 4. Rolling Window Eye Contact (Last 60 frames ~2s sensitivity) ──
    const isForwardFocus = headPose === 'forward' && !isLookingDown;
    this.gazeWindow.push(isForwardFocus ? 1 : 0);
    if (this.gazeWindow.length > 60) this.gazeWindow.shift();
    const eyeContact = Math.round(
      (this.gazeWindow.reduce((a, b) => a + b, 0) / this.gazeWindow.length) * 100
    );

    // ── 5. rPPG: extract from forehead ROI using landmarks ──
    const rgbRoi = this.stressModel.extractRoiRgbFromVideo(this.videoEl, lm);

    // ── 6. Spatiotemporal model (FACS + rPPG + ConvLSTM attention) ──
    const out = this.stressModel.processFrame(lm, rgbRoi, { isLookingDown });

    // Smooth stressIndex over last 30 frames (~1s)
    this.stressHistory.push(out.stressIndex);
    if (this.stressHistory.length > 30) this.stressHistory.shift();
    const stressScore = Math.round(
      this.stressHistory.reduce((a, b) => a + b, 0) / this.stressHistory.length
    );

    this._emit({
      faceDetected:    true,
      blinkRate,
      headPose,
      isLookingDown,
      isGazeDown,
      eyeContact,
      stressScore,
      hrBpm:           out.physiological.hrBpm,
      hrvMs:           out.physiological.hrvMs,
      actionUnits:     out.actionUnits,
      cognitiveLoad:   out.cognitiveLoad,
      microExpression: out.temporal.microExpressionIntensity,
      stressMarkers:   out.stressMarkers,
    });
  }

  _emit(data) {
    this.onTelemetry({
      // Structural defaults — all zero / null until model detects real data
      faceDetected:    false,
      blinkRate:       0,
      headPose:        null,      // null = no face detected
      isLookingDown:   false,
      isGazeDown:      false,
      eyeContact:      0,
      stressScore:     0,
      hrBpm:           null,      // null = rPPG not yet ready
      hrvMs:           null,      // null = rPPG not yet ready
      cognitiveLoad:   null,      // null = not enough data
      microExpression: 0,
      stressMarkers:   [],
      rppgReady:       false,
      actionUnits: {
        au1: 0, au2: 0, au4: 0, au7: 0,
        au9: 0, au12: 0, au17: 0, au25: 0,
        composite: 0
      },
      ...data,
    });
  }

  destroy() {
    this.running = false;
    try { this.camera?.stop();    } catch (_) {}
    try { this.faceMesh?.close(); } catch (_) {}
  }
}

export default FaceEngine;
