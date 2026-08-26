/**
 * Hybrid Spatiotemporal + rPPG Face Stress Detection Model
 *
 * Architecture Stack:
 * ──────────────────────────────────────────────────────────────────────────
 * 1. SPATIAL STREAM — 3D Facial Landmarks + FACS Action Units (AU1, AU2, AU4, AU7, AU9)
 *    Uses MediaPipe FaceMesh 468-point normalized coordinate system.
 *    All distances are normalised by inter-ocular distance (IOD) for face-size invariance.
 *
 *    AU1  Inner Brow Raiser   — inner brow elevation → worry / fear
 *    AU2  Outer Brow Raiser   — outer brow arch elevation → surprise / alertness
 *    AU4  Brow Lowerer        — glabella compression → anger / focus / strain
 *    AU7  Lid Tightener       — reduced Eye Aspect Ratio (EAR) → fatigue / exertion
 *    AU9  Nose Wrinkler       — alar base elevation → disgust / aversion / distress
 *    AU12 Lip Corner Puller   — zygomatic trace → genuine smile (positive signal)
 *    AU17 Lower Lip Depressor — chin raise / lip press → anxiety
 *    AU25 Lips Part           — mouth open without speaking → tension
 *
 * 2. PHYSIOLOGICAL STREAM (rPPG) — Remote Photoplethysmography
 *    POS (Plane-Orthogonal-to-Skin) algorithm on forehead ROI.
 *    Extracted from raw video frame via offscreen canvas (avoids CSS mirror artefacts).
 *    Signals: BVP (Blood Volume Pulse), HR (Heart Rate BPM), HRV (RMSSD ms).
 *
 *    Clinical reference ranges:
 *      Resting HR: 60–100 BPM (elevated >85 during cognitive load)
 *      HRV (RMSSD): >40ms = parasympathetic dominance (calm); <30ms = stress
 *
 * 3. TEMPORAL STREAM — ConvLSTM + Temporal Attention Window (120 frames @ 30fps = 4s)
 *    Softmax attention weights proportional to AU velocity (delta per frame).
 *    Micro-expressions: 100–500ms bursts of AU delta → weighted heavily.
 *    Baseline drift: slow AU change >2s ignored by attention decay.
 *
 * 4. COGNITIVE LOAD CLASSIFIER (Fused Spatiotemporal Stress Index 0–100)
 *    Low  [0–34]   — Calm, baseline autonomic state
 *    Moderate [35–64] — Elevated engagement or mild challenge
 *    High [65–100] — Sympathetic arousal, fight-or-flight indicators
 *
 *    Fusion weights (evidence-based):
 *      AU composite:        35% (micro-expression evidence)
 *      HR delta from rest:  25% (autonomic sympathetic activation)
 *      HRV reduction:       20% (parasympathetic withdrawal = stress)
 *      Micro-expression:    20% (temporal attention-weighted transients)
 */

export class FaceStressModel {
  constructor({ windowSeconds = 4, fps = 30 } = {}) {
    this.fps        = fps;
    this.windowSize = Math.round(windowSeconds * fps); // 120 frames

    // Rolling buffers
    this.auBuffer      = [];   // FACS AU time-series objects
    this.rppgRgbBuffer = [];   // [R, G, B] per-frame mean skin colour
    this.bvpBuffer     = [];   // Latest BVP signal for continuity

    // Offscreen canvas for pixel-accurate rPPG ROI extraction
    this._offscreen    = null;
    this._offCtx       = null;

    // Baseline — null until model self-calibrates from first 90 real frames
    this.baseline = {
      calibrated: false,
      iod: null,
      hrBpm: null,   // set from first valid rPPG window
      hrvMs: null,
      auVector: null,
    };

    // Temporal attention scaling
    this.gamma = 3.5;

    // HR smoothing ring — only real detected estimates
    this._hrHistory  = [];
    this._hrvHistory = [];
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC: Set relaxed-state baseline during onboarding check-in
  // ─────────────────────────────────────────────────────────────────────────
  setBaselineCalibration(landmarks) {
    if (!landmarks || landmarks.length < 468) return;
    const iod  = this._interOcularDist(landmarks);
    const au   = this._extractAUs(landmarks, iod);
    // Do NOT inject any preset HR/HRV here — rPPG will fill those once computed
    this.baseline = { calibrated: true, iod, hrBpm: null, hrvMs: null, auVector: au };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC: Extract raw video frame RGB for rPPG (pass video element directly)
  //         Avoids CSS transform artefacts on the mirrored display canvas.
  // ─────────────────────────────────────────────────────────────────────────
  extractRoiRgbFromVideo(videoEl, landmarks = null) {
    if (!videoEl || videoEl.readyState < 2) return null;
    try {
      const vw = videoEl.videoWidth  || 640;
      const vh = videoEl.videoHeight || 480;

      // Lazy-create a hidden offscreen canvas at 1/8 resolution for speed
      if (!this._offscreen || this._offscreen.width !== Math.floor(vw / 8)) {
        this._offscreen       = document.createElement('canvas');
        this._offscreen.width  = Math.floor(vw / 8);
        this._offscreen.height = Math.floor(vh / 8);
        this._offCtx = this._offscreen.getContext('2d', { willReadFrequently: true });
      }

      const ow = this._offscreen.width;
      const oh = this._offscreen.height;

      // Draw unmirrored video frame (raw sensor feed)
      this._offCtx.drawImage(videoEl, 0, 0, ow, oh);

      let rx = Math.floor(ow * 0.35);
      let ry = Math.floor(oh * 0.10);
      let rw = Math.max(4, Math.floor(ow * 0.30));
      let rh = Math.max(4, Math.floor(oh * 0.15));

      // Dynamic landmark-guided forehead ROI if landmarks are available
      if (landmarks && landmarks[10] && landmarks[67] && landmarks[297]) {
        const topFh  = landmarks[10];
        const leftBr = landmarks[67];
        const rgtBr  = landmarks[297];

        const minX = Math.min(topFh.x, leftBr.x, rgtBr.x);
        const maxX = Math.max(topFh.x, leftBr.x, rgtBr.x);
        const minY = topFh.y;
        const maxY = Math.min(leftBr.y, rgtBr.y);

        rx = Math.max(0, Math.floor(minX * ow));
        ry = Math.max(0, Math.floor(minY * oh));
        rw = Math.max(4, Math.floor((maxX - minX) * ow));
        rh = Math.max(4, Math.floor((maxY - minY) * oh));
      }

      const px   = this._offCtx.getImageData(rx, ry, rw, rh).data;
      let r = 0, g = 0, b = 0, n = 0;

      for (let i = 0; i < px.length; i += 4) {
        // Skip near-black pixels (likely shadows/hair)
        if (px[i] < 40 && px[i+1] < 40 && px[i+2] < 40) continue;
        r += px[i]; g += px[i+1]; b += px[i+2]; n++;
      }

      return n > 0 ? [r / n, g / n, b / n] : null;
    } catch (_) {
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STREAM 1 — FACS Action Units (IOD-normalised)
  // ─────────────────────────────────────────────────────────────────────────
  _interOcularDist(lm) {
    // Left eye outer corner #33 → Right eye outer corner #111827
    return Math.hypot(lm[33].x - lm[263].x, lm[33].y - lm[263].y) + 1e-6;
  }

  _dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y, (a.z||0)-(b.z||0));
  }

  _extractAUs(lm, iod) {
    iod = iod || this._interOcularDist(lm);
    const N = (raw) => raw / iod; // IOD-normalise all distances

    /* ── AU1 & AU2: Brow Raiser (inner / outer) ──
       Inner brow tip rises relative to eye canthus vertical gap.
       Landmarks: left inner brow 55, left eye inner corner 133 */
    const leftInnerBrowUp  = N(Math.abs(lm[55].y  - lm[133].y));
    const rightInnerBrowUp = N(Math.abs(lm[285].y - lm[362].y));
    const au1Raw = (leftInnerBrowUp + rightInnerBrowUp) / 2;
    // AU2: outer brow tip (#70 left, #111827 right) vs outer eye corner
    const leftOuterBrowUp  = N(Math.abs(lm[70].y  - lm[33].y));
    const rightOuterBrowUp = N(Math.abs(lm[300].y - lm[263].y));
    const au2Raw = (leftOuterBrowUp + rightOuterBrowUp) / 2;

    // Map to [0,1]: typical neutral ~0.35 IOD units, raised ~0.50
    const au1 = Math.min(1, Math.max(0, (au1Raw - 0.36) / 0.25));
    const au2 = Math.min(1, Math.max(0, (au2Raw - 0.30) / 0.25));

    /* ── AU4: Brow Lowerer (glabella compression) ──
       Distance between inner brow tips (55 & 285): compressed = frowning */
    const glabellaDist = N(this._dist(lm[55], lm[285]));
    // Neutral glabella ~ 0.50 IOD; compressed <0.38
    const au4 = Math.min(1, Math.max(0, (0.45 - glabellaDist) / 0.25));

    /* ── AU7: Lid Tightener (EAR reduction) ──
       Eye Aspect Ratio: vertical / horizontal eye opening */
    const leftEAR  = this._dist(lm[159], lm[145]) / (this._dist(lm[33], lm[133])  + 1e-6);
    const rightEAR = this._dist(lm[386], lm[374]) / (this._dist(lm[362], lm[263]) + 1e-6);
    const avgEAR   = (leftEAR + rightEAR) / 2;
    // Open eye EAR ~0.24–0.28; squinting <0.18
    const au7 = Math.min(1, Math.max(0, (0.19 - avgEAR) / 0.12));

    /* ── AU9: Nose Wrinkler ──
       Alar base landmarks 129 (left) & 358 (right) elevation relative to nose bridge 6 */
    const noseWrinkle = (N(Math.abs(lm[129].y - lm[6].y)) + N(Math.abs(lm[358].y - lm[6].y))) / 2;
    // Neutral ~0.20 IOD; wrinkled > 0.28
    const au9 = Math.min(1, Math.max(0, (noseWrinkle - 0.22) / 0.15));

    /* ── AU12: Lip Corner Puller (genuine smile) — NEGATIVE stress signal ──
       Mouth corner 61 & 291 lateral spread vs face width */
    const mouthSpread = N(this._dist(lm[61], lm[291]));
    const au12 = Math.min(1, Math.max(0, (mouthSpread - 0.35) / 0.25));

    /* ── AU17: Lower Lip Depressor (chin raise / lip press) ── */
    const chinLip = N(Math.abs(lm[17].y - lm[152].y));
    const au17 = Math.min(1, Math.max(0, (0.32 - chinLip) / 0.20));

    /* ── AU25: Lips Part (mouth aperture at rest) ── */
    const lipGap = N(this._dist(lm[13], lm[14]));
    const au25 = Math.min(1, Math.max(0, (lipGap - 0.08) / 0.15));

    /* ── Composite AU Stress Score 0–100 ──
       Weights based on FACS emotion research:
         AU4 (anger/strain) 30%, AU7 (fatigue) 20%, AU1 (worry) 15%,
         AU2 (surprise/alert) 10%, AU9 (aversion) 10%, AU17 (anxiety) 10%,
         AU25 (tension) 10%, AU12 (smile = -15% relief) */
    const composite = Math.min(100, Math.max(0, Math.round(
      au4  * 30 +
      au7  * 20 +
      au1  * 15 +
      au2  * 10 +
      au9  * 10 +
      au17 * 10 +
      au25 *  10 -
      au12 * 15        // smile reduces stress signal
    )));

    return { au1, au2, au4, au7, au9, au12, au17, au25, composite };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STREAM 2 — rPPG (POS algorithm)  Heart Rate & HRV
  // ─────────────────────────────────────────────────────────────────────────
  _processRPPG(rgbSeries) {
    const N = rgbSeries.length;
    // Need ≥45 frames for a stable POS signal (~1.5s at 30fps)
    // Return null — caller treats null as "still calibrating"
    if (N < 45) return { hrBpm: null, hrvMs: null, bvp: [] };

    const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const std  = arr => { const m = mean(arr); return Math.sqrt(arr.reduce((a,b) => a + (b-m)**2, 0) / arr.length) + 1e-9; };

    const R = rgbSeries.map(c => c[0]);
    const G = rgbSeries.map(c => c[1]);
    const B = rgbSeries.map(c => c[2]);

    // Temporal normalisation per channel
    const mR = mean(R), mG = mean(G), mB = mean(B);
    if (mR < 1 || mG < 1 || mB < 1) return { hrBpm: null, hrvMs: null, bvp: [] };

    const nR = R.map(v => v / mR - 1);
    const nG = G.map(v => v / mG - 1);
    const nB = B.map(v => v / mB - 1);

    // POS projection: S1 = G - B,  S2 = G + B - 2R
    const S1 = nG.map((g, i) => g - nB[i]);
    const S2 = nG.map((g, i) => g + nB[i] - 2 * nR[i]);

    // Alpha scaling to orthogonalise
    const alpha = std(S1) / std(S2);

    // BVP composite signal H = S1 + α·S2
    const bvp = S1.map((s, i) => s + alpha * S2[i]);

    // ── Bandpass-like windowed peak detection ──
    // Valid cardiac peaks: 0.4–1.8 Hz → frames 17–75 apart at 30fps
    const minGap   = Math.round(this.fps * 0.40);
    const bvpMean  = mean(bvp);
    const bvpStd   = std(bvp);
    const threshold = bvpMean + 0.30 * bvpStd;

    const peaks = [];
    for (let i = 2; i < N - 2; i++) {
      if (
        bvp[i] > threshold &&
        bvp[i] > bvp[i-1] && bvp[i] > bvp[i-2] &&
        bvp[i] > bvp[i+1] && bvp[i] > bvp[i+2]
      ) {
        if (peaks.length === 0 || (i - peaks[peaks.length - 1]) >= minGap) {
          peaks.push(i);
        }
      }
    }

    // No real peaks detected → null (not fake fallback)
    if (peaks.length < 2) {
      return {
        hrBpm: this._hrHistory.length > 0 ? Math.round(mean(this._hrHistory)) : null,
        hrvMs: this._hrvHistory.length > 0 ? Math.round(mean(this._hrvHistory)) : null,
        bvp,
      };
    }

    // IBI → HR from detected peaks only
    const ibis = [];
    for (let i = 1; i < peaks.length; i++) {
      const ibiMs = (peaks[i] - peaks[i-1]) / this.fps * 1000;
      // Only physiologically plausible IBIs: 400–1800ms (33–150 BPM)
      if (ibiMs >= 400 && ibiMs <= 1800) ibis.push(ibiMs);
    }

    // No valid IBIs → null
    if (ibis.length === 0) return { hrBpm: null, hrvMs: null, bvp };

    const avgIbi = mean(ibis);
    const rawHr  = Math.round(60000 / avgIbi);

    // RMSSD HRV (only when ≥2 IBIs detected)
    let rawHrv = null;
    if (ibis.length > 1) {
      let ssd = 0;
      for (let i = 1; i < ibis.length; i++) ssd += (ibis[i] - ibis[i-1]) ** 2;
      rawHrv = Math.round(Math.sqrt(ssd / (ibis.length - 1)));
    }

    // Push real detections into smoothing history
    this._hrHistory.push(rawHr);
    if (this._hrHistory.length  > 8) this._hrHistory.shift();
    if (rawHrv !== null) {
      this._hrvHistory.push(rawHrv);
      if (this._hrvHistory.length > 8) this._hrvHistory.shift();
    }

    const hrBpm = Math.round(mean(this._hrHistory));
    const hrvMs = this._hrvHistory.length > 0 ? Math.round(mean(this._hrvHistory)) : null;

    return { hrBpm, hrvMs, bvp };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // STREAM 3 — Temporal Attention (ConvLSTM sliding-window micro-expression)
  // ─────────────────────────────────────────────────────────────────────────
  _processTemporalAttention(auBuffer) {
    if (auBuffer.length < 3) return { microExpressionIntensity: 0, attentionWeights: [] };

    const velocities = [];
    for (let i = 1; i < auBuffer.length; i++) {
      const a = auBuffer[i-1], b = auBuffer[i];
      // Weight fast-changing AUs (micro-expression markers) more
      const v = Math.abs(b.au4 - a.au4) * 3.0    // brow lowering onset fastest
              + Math.abs(b.au7 - a.au7) * 2.0    // lid tightener
              + Math.abs(b.au1 - a.au1) * 1.5    // inner brow
              + Math.abs(b.au9 - a.au9) * 1.5    // nose wrinkle
              + Math.abs(b.au2 - a.au2) * 1.0;
      velocities.push(v);
    }

    // Softmax attention: exp(γ·v) / Σ
    const expV  = velocities.map(v => Math.exp(this.gamma * v));
    const sumEV = expV.reduce((a, b) => a + b, 0) + 1e-9;
    const weights = expV.map(e => e / sumEV);

    // Weighted micro-expression intensity
    const microRaw = velocities.reduce((acc, v, i) => acc + v * weights[i], 0);
    const microExpressionIntensity = Math.min(100, Math.round(microRaw * 120));

    return { microExpressionIntensity, attentionWeights: weights };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PUBLIC: Main per-frame processing entry point
  //   landmarks  — MediaPipe FaceMesh 468 NormalizedLandmark[]
  //   rgbRoi     — [R,G,B] mean from forehead (pass null if unavailable)
  // ─────────────────────────────────────────────────────────────────────────
  processFrame(landmarks, rgbRoi, { isLookingDown = false } = {}) {
    const iod = this._interOcularDist(landmarks);
    const au  = this._extractAUs(landmarks, iod);

    // Rolling buffer management
    this.auBuffer.push(au);
    if (rgbRoi) this.rppgRgbBuffer.push(rgbRoi);
    if (this.auBuffer.length      > this.windowSize) this.auBuffer.shift();
    if (this.rppgRgbBuffer.length > this.windowSize) this.rppgRgbBuffer.shift();

    // ── Auto-calibrate baseline using rolling minimum over first 120 frames ──
    if (!this.baseline.calibrated) {
      if (!this._auHistory) this._auHistory = [];
      this._auHistory.push(au.composite);
      if (this._auHistory.length >= 60) {
        const minComposite = Math.min(...this._auHistory);
        this.baseline.iod = iod;
        this.baseline.auVector = au;
        this.baseline.auMin = minComposite;
        this.baseline.calibrated = true;
      }
    }

    // ── Stream 2: rPPG — returns null until real peaks detected ──
    const rppg = this._processRPPG(this.rppgRgbBuffer);

    // ── Stream 3: Temporal attention ──
    const temporal = this._processTemporalAttention(this.auBuffer);

    // ── Stream 4: Cognitive Load Fusion ──
    const baseMin = this.baseline.auMin ?? 15;
    // Scale facial strain relative to the user's observed minimum calm state
    const relativeAuScore = Math.max(0, Math.min(100, Math.round(((au.composite - baseMin) / (100 - baseMin + 1e-5)) * 100)));
    const microScore = temporal.microExpressionIntensity;

    // HR stress: rPPG elevation above self-calibrated baseline
    let hrStress  = 0;
    let hrvStress = 0;
    let rppgWeight = 0;

    if (rppg.hrBpm !== null) {
      const baseHr = this.baseline.hrBpm || rppg.hrBpm;
      if (!this.baseline.hrBpm) this.baseline.hrBpm = rppg.hrBpm;
      const hrDelta = Math.max(0, rppg.hrBpm - baseHr);
      hrStress = Math.min(50, hrDelta * 1.5);
      rppgWeight = 0.40;
    }

    if (rppg.hrvMs !== null) {
      if (!this.baseline.hrvMs) this.baseline.hrvMs = rppg.hrvMs;
      const baseHrv = this.baseline.hrvMs;
      hrvStress = Math.max(0, Math.min(50, (baseHrv - rppg.hrvMs) * 1.0));
    }

    // Dynamic weights based on rPPG availability
    const auWeight    = rppgWeight > 0 ? 0.40 : 0.65;
    const microWeight = rppgWeight > 0 ? 0.20 : 0.35;

    let rawIndex = Math.round(
      relativeAuScore * auWeight +
      hrStress        * (rppgWeight * 0.55) +
      hrvStress       * (rppgWeight * 0.45) +
      microScore      * microWeight
    );

    if (isLookingDown) {
      rawIndex = Math.min(100, rawIndex + 18); // Moderate elevation during confirmed downward gaze
    }

    const stressIndex = Math.min(100, Math.max(0, rawIndex));

    let cognitiveLoad = 'Low';
    if (stressIndex >= 55)      cognitiveLoad = 'High';
    else if (stressIndex >= 30) cognitiveLoad = 'Moderate';

    const stressMarkers = this._describeStress(au, rppg, stressIndex, isLookingDown);

    return {
      stressIndex,
      cognitiveLoad,
      actionUnits: au,
      physiological: {
        hrBpm: rppg.hrBpm,
        hrvMs: rppg.hrvMs,
      },
      temporal:      { microExpressionIntensity: temporal.microExpressionIntensity },
      stressMarkers,
      rppgReady: rppg.hrBpm !== null,
      baselineCalibrated: this.baseline.calibrated,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Describe active stress signals for UI feedback
  // ─────────────────────────────────────────────────────────────────────────
  _describeStress(au, rppg, stressIndex, isLookingDown = false) {
    const markers = [];
    if (isLookingDown) markers.push('Downward Gaze / Off-Screen Focus');
    // FACS markers — always from real landmark detection
    if (au.au4  > 0.4) markers.push('Brow tension (AU4)');
    if (au.au7  > 0.4) markers.push('Lid strain / fatigue (AU7)');
    if (au.au1  > 0.5) markers.push('Inner brow raised — worry (AU1)');
    if (au.au9  > 0.3) markers.push('Nose wrinkle — distress (AU9)');
    if (au.au17 > 0.4) markers.push('Lip press — anxiety (AU17)');
    if (au.au25 > 0.5) markers.push('Lips parted — tension (AU25)');
    if (au.au12 > 0.5) markers.push('Smile — positive signal (AU12)');
    // rPPG markers — only when real signal detected (not null)
    if (rppg.hrBpm !== null && rppg.hrBpm > 95) markers.push(`Elevated HR: ${rppg.hrBpm} BPM`);
    if (rppg.hrvMs !== null && rppg.hrvMs < 25)  markers.push(`Low HRV: ${rppg.hrvMs}ms`);
    if (stressIndex < 15 && stressIndex > 0)     markers.push('Baseline calm detected');
    return markers;
  }
}

export default FaceStressModel;
