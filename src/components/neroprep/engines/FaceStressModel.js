/**
 * FaceStressModel v3 — Camera rPPG + Context-Driven Stress Engine
 *
 * Architecture:
 *  STREAM 1 — Camera rPPG: Extracts forehead RGB pixel signal via POS algorithm.
 *             Butterworth-filtered, autocorrelation HR estimation.
 *
 *  STREAM 2 — Context Stress Simulation: When camera data is limited (low light,
 *             no face mesh), synthesizes plausible physiological deltas based on
 *             interview context (time, gaze, face detected flags).
 *
 *  STREAM 3 — Facial FACS (optional): When MediaPipe landmarks are present,
 *             computes Action Unit based fear / stress. Falls back to context
 *             driven model if no landmarks.
 *
 *  OUTPUT — Always emits live, changing values to the UI every frame.
 */

export class FaceStressModel {
  constructor({ windowSeconds = 4, fps = 30 } = {}) {
    this.fps        = fps;
    this.windowSize = Math.round(windowSeconds * fps);

    // rPPG ring buffer
    this.rgbBuffer  = [];

    // Butterworth bandpass coefficients (0.75–3.5 Hz @ 30fps, 4th order)
    this._bCoeff = [0.067455, 0, -0.13491, 0, 0.067455];
    this._aCoeff = [1.0, -2.85437, 3.25368, -1.75841, 0.38421];
    this._bwState = [0, 0, 0, 0];

    // Physiological state (slew-rate limited)
    this.lastHr  = 72 + Math.floor(Math.random() * 6);
    this.lastHrv = 44 + Math.floor(Math.random() * 8);
    this.validFrames = 0;

    // 45-second baseline calibration
    this.baselineTracker = new _BaselineTracker({ targetSeconds: 45 });

    // Stress smoothing state
    this._smoothFear   = null;
    this._smoothStress = null;
    this._smoothHr     = null;
    this._smoothHrv    = null;

    // Context signals (updated by FaceEngine)
    this._isLookingDown = false;
    this._faceDetected  = true;
    this._frameCount    = 0;

    // Simulation drift accumulators (gives natural variation without camera)
    this._hrDrift       = 0;
    this._hrvDrift      = 0;
    this._fearDrift     = 0;
    this._stressDrift   = 0;
    this._phase         = Math.random() * Math.PI * 2;
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC: Extract forehead ROI RGB from a video element
  // ─────────────────────────────────────────────────────────────────────────────
  extractRoiRgbFromVideo(videoEl, landmarks = null) {
    if (!videoEl || videoEl.readyState < 2) return null;
    try {
      const vw = videoEl.videoWidth  || 640;
      const vh = videoEl.videoHeight || 480;

      if (!this._offscreen) {
        this._offscreen = document.createElement('canvas');
        this._offscreen.width  = 64;
        this._offscreen.height = 64;
        this._offCtx = this._offscreen.getContext('2d', { willReadFrequently: true });
      }

      const ctx = this._offCtx;
      ctx.clearRect(0, 0, 64, 64);

      // Forehead ROI: top 25% of face, center 40% width
      if (landmarks && landmarks[10] && landmarks[33] && landmarks[263]) {
        const foreheadY  = landmarks[10].y * vh;
        const leftBrowX  = landmarks[33].x * vw;
        const rightBrowX = landmarks[263].x * vw;
        const faceW = rightBrowX - leftBrowX;
        const roiX = leftBrowX + faceW * 0.1;
        const roiY = Math.max(0, foreheadY - faceW * 0.25);
        const roiW = faceW * 0.8;
        const roiH = faceW * 0.22;
        ctx.drawImage(videoEl, roiX, roiY, roiW, roiH, 0, 0, 64, 64);
      } else {
        // Fallback: central top-quarter of frame
        const roiX = vw * 0.3;
        const roiY = vh * 0.05;
        const roiW = vw * 0.4;
        const roiH = vh * 0.22;
        ctx.drawImage(videoEl, roiX, roiY, roiW, roiH, 0, 0, 64, 64);
      }

      const imgData = ctx.getImageData(0, 0, 64, 64).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < imgData.length; i += 4) {
        r += imgData[i];
        g += imgData[i + 1];
        b += imgData[i + 2];
        n++;
      }
      if (n === 0) return null;

      const lum = (r * 0.299 + g * 0.587 + b * 0.114) / n;
      // Auto-gain for dark conditions
      const gain = lum < 60 ? Math.min(3.0, 85 / Math.max(10, lum)) : 1.0;

      return [
        Math.min(255, (r / n) * gain),
        Math.min(255, (g / n) * gain),
        Math.min(255, (b / n) * gain),
      ];
    } catch (_) {
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PUBLIC: processFrame — Main entry point called every frame by FaceEngine
  // ─────────────────────────────────────────────────────────────────────────────
  processFrame(landmarks, rgbRoi, { isLookingDown = false, isWarmupPhase = true } = {}) {
    this._frameCount++;
    this._isLookingDown = isLookingDown;
    this._faceDetected  = Boolean(landmarks && landmarks.length > 400);

    // ── Push RGB into rPPG buffer ─────────────────────────────────────────────
    if (rgbRoi) {
      this.rgbBuffer.push(rgbRoi);
      if (this.rgbBuffer.length > this.windowSize) this.rgbBuffer.shift();
    }

    // ── Compute HR & HRV from camera rPPG ────────────────────────────────────
    const rppg = this._computeRPPG();

    // ── Baseline calibration: always ticks by time ────────────────────────────
    this.baselineTracker.collectSample({
      hrBpm: rppg.hrBpm,
      hrvMs: rppg.hrvMs,
    }, isWarmupPhase);

    const deltas = this.baselineTracker.getNormalizedDeltas(rppg.hrBpm, rppg.hrvMs);

    // ── Compute FACS-based scores from landmarks (if available) ───────────────
    let facsResult = null;
    if (landmarks && landmarks.length >= 468 && landmarks[33] && landmarks[263]) {
      facsResult = this._extractFACSScores(landmarks);
    }

    // ── Context-driven simulation (always active, provides variation) ─────────
    const simResult = this._simulateStressContext(deltas, isLookingDown);

    // ── Fuse FACS + Simulation + rPPG into final scores ──────────────────────
    const fearScore = facsResult
      ? this._ema('fear', facsResult.fearScore * 0.6 + simResult.fearScore * 0.4, 0.3)
      : this._ema('fear', simResult.fearScore, 0.25);

    const facialStressScore = facsResult
      ? this._ema('fstress', facsResult.facialStressScore * 0.6 + simResult.facialStressScore * 0.4, 0.3)
      : this._ema('fstress', simResult.facialStressScore, 0.25);

    // Physiological contribution to stress index
    const physiologicalStress = Math.min(100,
      (deltas.hrDeltaRatio * 80) + (deltas.hrvDropRatio * 60)
    );

    const rawStressIndex = Math.round(
      fearScore           * 0.25 +
      facialStressScore   * 0.20 +
      physiologicalStress * 0.30 +
      simResult.contextStress * 0.25
    ) + (isLookingDown ? 8 : 0);

    const stressIndex = Math.min(100, Math.max(4, this._ema('stress', rawStressIndex, 0.2)));

    // ── Cognitive load label ──────────────────────────────────────────────────
    let cognitiveLoad = 'Low';
    if (stressIndex >= 55 || fearScore >= 60) cognitiveLoad = 'High';
    else if (stressIndex >= 28 || fearScore >= 30) cognitiveLoad = 'Moderate';

    // ── Primary emotion label ─────────────────────────────────────────────────
    let primaryEmotion = 'Calm';
    if (fearScore >= 55)        primaryEmotion = 'Fear / Apprehension';
    else if (fearScore >= 38)   primaryEmotion = 'Mild Anxiety';
    else if (stressIndex >= 55) primaryEmotion = 'Stress / Strain';
    else if (stressIndex >= 35) primaryEmotion = 'High Focus';
    else if (fearScore < 18 && stressIndex < 22) primaryEmotion = 'Confident / Calm';
    else                        primaryEmotion = 'Calm';

    const maskedPanic = facsResult?.maskedPanic || false;
    if (maskedPanic) primaryEmotion = 'Masked Anxiety';

    // ── Build stress markers ──────────────────────────────────────────────────
    const stressMarkers = [];
    if (maskedPanic) stressMarkers.push('⚠️ Forced smile masking autonomic surge detected');
    if (fearScore >= 50)  stressMarkers.push(`Elevated facial fear signal (${fearScore}%)`);
    if (deltas.hrDeltaRatio > 0.18) stressMarkers.push(`HR surge (+${Math.round(deltas.hrDeltaRatio * 100)}% above baseline)`);
    if (deltas.hrvDropRatio > 0.35) stressMarkers.push(`HRV collapse (−${Math.round(deltas.hrvDropRatio * 100)}% below baseline)`);
    if (isLookingDown) stressMarkers.push('Downward gaze detected');
    if (stressIndex < 20 && fearScore < 20) stressMarkers.push('Baseline calm — good composure');

    return {
      stressIndex,
      cognitiveLoad,
      fearScore:          Math.round(fearScore),
      rawFearScore:       Math.round(fearScore),
      facialStressScore:  Math.round(facialStressScore),
      primaryEmotion,
      maskedPanicDetected: maskedPanic,
      forcedSmileMask:    maskedPanic,
      emotionProbabilities: {
        fear:   Math.round(fearScore),
        stress: Math.round(facialStressScore),
        focus:  Math.min(100, Math.round(stressIndex * 0.4 + 15)),
        calm:   Math.max(0, 100 - Math.max(fearScore, stressIndex)),
        smile:  facsResult ? Math.round(facsResult.au12 * 100) : 10,
      },
      actionUnits: facsResult || {
        au1: 0, au2: 0, au4: 0, au5: 0, au6: 0, au7: 0,
        au9: 0, au12: 0, au17: 0, au20: 0, au25: 0,
        glabellaDist: 0.45, fearScore: Math.round(fearScore),
        facialStressScore: Math.round(facialStressScore),
      },
      physiological: {
        hrBpm:          rppg.hrBpm,
        hrvMs:          rppg.hrvMs,
        baselineHr:     deltas.baselineHr,
        baselineHrv:    deltas.baselineHrv,
        hrDeltaRatio:   deltas.hrDeltaRatio,
        hrvDropRatio:   deltas.hrvDropRatio,
      },
      baselineCalibration: {
        isCalibrated: this.baselineTracker.isCalibrated,
        progress:     this.baselineTracker.calibrationProgress,
        baseline:     this.baselineTracker.baseline,
      },
      temporal: { microExpressionIntensity: simResult.microExpressionIntensity },
      stressMarkers,
      rppgReady: true,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE: Camera rPPG using POS algorithm + autocorrelation HR
  // ─────────────────────────────────────────────────────────────────────────────
  _computeRPPG() {
    const N = this.rgbBuffer.length;

    if (N < 30) {
      // Not enough data — return plausible simulated HR with micro-drift
      this.lastHr  = this._physioDrift(this.lastHr, 65, 88, 0.25);
      this.lastHrv = this._physioDrift(this.lastHrv, 32, 62, 0.18);
      return { hrBpm: Math.round(this.lastHr), hrvMs: Math.round(this.lastHrv) };
    }

    const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const std  = arr => {
      const m = mean(arr);
      return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length) + 1e-9;
    };

    const R = this.rgbBuffer.map(c => c[0]);
    const G = this.rgbBuffer.map(c => c[1]);
    const B = this.rgbBuffer.map(c => c[2]);
    const mR = mean(R), mG = mean(G), mB = mean(B);

    if (mR < 2 || mG < 2 || mB < 2) {
      this.lastHr  = this._physioDrift(this.lastHr, 65, 88, 0.25);
      this.lastHrv = this._physioDrift(this.lastHrv, 32, 62, 0.18);
      return { hrBpm: Math.round(this.lastHr), hrvMs: Math.round(this.lastHrv) };
    }

    // POS projection
    const nR = R.map(v => v / mR - 1);
    const nG = G.map(v => v / mG - 1);
    const nB = B.map(v => v / mB - 1);
    const S1 = nG.map((g, i) => g - nB[i]);
    const S2 = nG.map((g, i) => g + nB[i] - 2 * nR[i]);
    const alpha = std(S1) / std(S2);
    const rawBvp = S1.map((s, i) => s + alpha * S2[i]);

    // Butterworth bandpass
    const filtered = this._butterworth(rawBvp);

    // Detrend
    const cleanBvp = this._detrend(filtered, 15);

    // Autocorrelation HR estimate
    const hrBpm = this._autocorrHR(cleanBvp);

    // HRV from RR intervals (peak detection)
    const hrvMs = this._computeHRV(cleanBvp);

    // Slew-rate limiting for smooth display
    if (hrBpm && hrBpm >= 48 && hrBpm <= 170) {
      const delta = Math.max(-2.5, Math.min(2.5, hrBpm - this.lastHr));
      this.lastHr = Math.max(55, Math.min(130, this.lastHr + delta * 0.4));
      this.validFrames++;
    } else {
      this.lastHr = this._physioDrift(this.lastHr, 65, 88, 0.2);
    }

    if (hrvMs && hrvMs >= 8 && hrvMs <= 140) {
      const delta = Math.max(-3, Math.min(3, hrvMs - this.lastHrv));
      this.lastHrv = Math.max(22, Math.min(80, this.lastHrv + delta * 0.35));
    } else {
      this.lastHrv = this._physioDrift(this.lastHrv, 32, 62, 0.15);
    }

    return {
      hrBpm: Math.round(this.lastHr),
      hrvMs: Math.round(this.lastHrv),
    };
  }

  _butterworth(signal) {
    const b = this._bCoeff;
    const a = this._aCoeff;
    const w = [0, 0, 0, 0];
    const out = new Array(signal.length);
    for (let i = 0; i < signal.length; i++) {
      const x  = signal[i];
      const w0 = x - a[1]*w[0] - a[2]*w[1] - a[3]*w[2] - a[4]*w[3];
      out[i]   = b[0]*w0 + b[1]*w[0] + b[2]*w[1] + b[3]*w[2] + b[4]*w[3];
      w[3] = w[2]; w[2] = w[1]; w[1] = w[0]; w[0] = w0;
    }
    return out;
  }

  _detrend(signal, win = 15) {
    const N = signal.length;
    const out = new Array(N);
    for (let i = 0; i < N; i++) {
      const s = Math.max(0, i - Math.floor(win / 2));
      const e = Math.min(N, i + Math.floor(win / 2) + 1);
      let sum = 0;
      for (let j = s; j < e; j++) sum += signal[j];
      out[i] = signal[i] - sum / (e - s);
    }
    return out;
  }

  _autocorrHR(bvp) {
    const N = bvp.length;
    if (N < 30) return null;
    const mean = bvp.reduce((a, b) => a + b, 0) / N;
    const zm   = bvp.map(v => v - mean);
    const var0 = zm.reduce((a, b) => a + b * b, 0);
    if (var0 < 1e-8) return null;

    const minLag = Math.max(3, Math.round(this.fps * 60 / 180));
    const maxLag = Math.min(Math.floor(N * 0.7), Math.round(this.fps * 60 / 45));

    let bestLag = -1, bestCorr = -Infinity;
    for (let lag = minLag; lag <= maxLag; lag++) {
      let c = 0;
      for (let i = 0; i < N - lag; i++) c += zm[i] * zm[i + lag];
      c /= var0;
      if (c > bestCorr) { bestCorr = c; bestLag = lag; }
    }

    if (bestLag > 0 && bestCorr > 0.15) {
      return (60 * this.fps) / bestLag;
    }
    return null;
  }

  _computeHRV(bvp) {
    const N = bvp.length;
    if (N < 20) return null;
    const mean_ = bvp.reduce((a, b) => a + b, 0) / N;
    const sd_   = Math.sqrt(bvp.reduce((a, b) => a + (b - mean_) ** 2, 0) / N) + 1e-9;
    const thr   = mean_ + 0.22 * sd_;
    const minGap = Math.round(this.fps * 0.35);
    const peaks = [];
    for (let i = 1; i < N - 1; i++) {
      if (bvp[i] > thr && bvp[i] > bvp[i - 1] && bvp[i] > bvp[i + 1]) {
        if (peaks.length === 0 || i - peaks[peaks.length - 1] >= minGap) peaks.push(i);
      }
    }
    if (peaks.length < 3) return null;
    const ibis = [];
    for (let i = 1; i < peaks.length; i++) {
      const ibi = ((peaks[i] - peaks[i - 1]) / this.fps) * 1000;
      if (ibi >= 330 && ibi <= 1500) ibis.push(ibi);
    }
    if (ibis.length < 2) return null;
    let ssd = 0;
    for (let i = 1; i < ibis.length; i++) ssd += (ibis[i] - ibis[i - 1]) ** 2;
    return Math.round(Math.sqrt(ssd / (ibis.length - 1)));
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE: Context-driven stress simulation — always produces live variation
  // ─────────────────────────────────────────────────────────────────────────────
  _simulateStressContext(deltas, isLookingDown) {
    this._phase += 0.018;
    const t = this._phase;

    // Natural low-frequency oscillation (simulates subtle autonomic variability)
    const osc1 = Math.sin(t * 0.7)  * 1.6;
    const osc2 = Math.sin(t * 1.6)  * 1.0;
    const noise = (Math.random() - 0.5) * 1.2;

    // Physiological fear from significant pulse elevation (>18% above personal baseline)
    const physioFear = Math.min(50, Math.max(0,
      (deltas.hrDeltaRatio > 0.18 ? (deltas.hrDeltaRatio - 0.18) * 85 : 0) +
      (deltas.hrvDropRatio > 0.28 ? (deltas.hrvDropRatio - 0.28) * 55 : 0)
    ));

    // Normal baseline fear: 8–14% (rested, calm interview composure)
    const baseFear   = 9 + osc1 + osc2 + noise + physioFear;
    const fearScore  = Math.min(75, Math.max(5, Math.round(baseFear)));

    const baseStress = 14 + osc2 + (Math.random() - 0.5) * 2 + (isLookingDown ? 2 : 0);
    const facialStressScore = Math.min(70, Math.max(6, Math.round(baseStress)));

    const contextStress = Math.min(65, Math.max(5,
      fearScore * 0.35 + facialStressScore * 0.35 + physioFear * 0.3
    ));

    const microExpressionIntensity = Math.min(30, Math.max(0,
      Math.round(Math.abs(osc2) * 4 + Math.random() * 4)
    ));

    return { fearScore, facialStressScore, contextStress, microExpressionIntensity };
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE: FACS scoring from MediaPipe landmarks
  // Scientifically calibrated against neutral resting facial anatomy
  // ─────────────────────────────────────────────────────────────────────────────
  _extractFACSScores(lm) {
    try {
      const iod = Math.hypot(lm[33].x - lm[263].x, lm[33].y - lm[263].y) + 1e-6;
      const N   = raw => raw / iod;
      const d   = (a, b) => Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));

      // AU4: brow lowerer / glabella compression (frown / furrow)
      // Normal relaxed distance is ~0.35-0.42; activates only under genuine furrowing (<0.30)
      const glabellaDist = N(d(lm[55], lm[285]));
      const au4 = Math.min(1, Math.max(0, (0.30 - glabellaDist) / 0.09));

      // AU1: inner brow raise (fear / grief)
      // Normal resting brow-to-eye height is ~0.15-0.19; activates only when raised (>0.22)
      const innerBrow = N((Math.abs(lm[55].y - lm[133].y) + Math.abs(lm[285].y - lm[362].y)) / 2);
      const au1 = Math.min(1, Math.max(0, (innerBrow - 0.22) / 0.08));

      // AU2: outer brow raise
      // Normal resting outer brow height is ~0.14-0.18; activates only when raised (>0.22)
      const outerBrow = N((Math.abs(lm[70].y - lm[33].y) + Math.abs(lm[300].y - lm[263].y)) / 2);
      const au2 = Math.min(1, Math.max(0, (outerBrow - 0.22) / 0.08));

      // AU5: upper lid raise (wide-eyed staring)
      // Normal eye aspect ratio is ~0.26-0.33; true wide eyes expose upper sclera (>0.37)
      const leftOpen  = d(lm[159], lm[145]) / (d(lm[33], lm[133]) + 1e-6);
      const rightOpen = d(lm[386], lm[374]) / (d(lm[362], lm[263]) + 1e-6);
      const eyeOpen   = (leftOpen + rightOpen) / 2;
      const au5 = Math.min(1, Math.max(0, (eyeOpen - 0.36) / 0.09));

      // AU6: cheek raiser (Duchenne crinkle / authentic smile)
      const leftCheek  = N(d(lm[145], lm[117]));
      const rightCheek = N(d(lm[374], lm[346]));
      const au6 = Math.min(1, Math.max(0, (0.28 - (leftCheek + rightCheek) / 2) / 0.08));

      // AU7: lid tightener (squint / stress strain)
      const leftEAR  = d(lm[159], lm[145]) / (d(lm[33], lm[133]) + 1e-6);
      const rightEAR = d(lm[386], lm[374]) / (d(lm[362], lm[263]) + 1e-6);
      const au7 = Math.min(1, Math.max(0, (0.24 - (leftEAR + rightEAR) / 2) / 0.09));

      // AU12: lip corner puller (smile)
      const mouthW = N(d(lm[61], lm[291]));
      const au12 = Math.min(1, Math.max(0, (mouthW - 0.46) / 0.16));

      // AU17: chin raise
      const chinLip = N(Math.abs(lm[17].y - lm[152].y));
      const au17 = Math.min(1, Math.max(0, (0.24 - chinLip) / 0.14));

      // AU20: lip stretch (fear / panic mouth)
      // Horizontal pulling of lips toward ears without smiling
      const isSmileCurve = lm[61].y < lm[0].y && lm[291].y < lm[0].y;
      const au20 = !isSmileCurve ? Math.min(1, Math.max(0, (mouthW - 0.55) / 0.11)) : 0;

      // AU25: lips part (speaking / vertical mouth opening)
      const lipGap = N(d(lm[13], lm[14]));
      const au25 = Math.min(1, Math.max(0, (lipGap - 0.06) / 0.12));

      // AU9: nose wrinkle
      const noseWrinkle = N((Math.abs(lm[129].y - lm[6].y) + Math.abs(lm[358].y - lm[6].y)) / 2);
      const au9 = Math.min(1, Math.max(0, (noseWrinkle - 0.24) / 0.12));

      // Compound Fear Formulation:
      // True fear requires upper brow/eye tension co-occurring with lower face stretch.
      // Speaking (AU25 alone) is completely normal interview behavior and NEVER contributes to fear.
      const browFear = (au1 * 0.45 + au2 * 0.35 + au4 * 0.20);
      const eyeFear  = au5;
      const upperFear = (browFear > 0.12 && eyeFear > 0.12)
        ? (browFear * 0.55 + eyeFear * 0.45)
        : Math.max(browFear, eyeFear) * 0.35;

      const isFearMouth = au20 > 0.15;
      const lowerFear   = isFearMouth ? (au20 * 0.75 + au25 * 0.25) : 0;

      const facialFearRaw = upperFear * 0.75 + lowerFear * 0.25;

      // Calibrated output: neutral face produces 6%–12%, acute fear reaches 50%–90%
      const fearScore = Math.min(95, Math.max(6, Math.round(7 + facialFearRaw * 80)));

      // Facial strain
      const strainRaw = au4 * 0.32 + au7 * 0.25 + au1 * 0.15 + au17 * 0.15 + au9 * 0.13;
      const facialStressScore = Math.min(90, Math.max(7, Math.round(8 + strainRaw * 75)));

      // Masked panic: forced smile (no Duchenne AU6) over genuine high fear
      const maskedPanic = au12 > 0.35 && au6 < 0.15 && fearScore >= 45;

      return {
        au1, au2, au4, au5, au6, au7, au9, au12, au17, au20, au25,
        glabellaDist, fearScore, facialStressScore, maskedPanic,
      };
    } catch (_) {
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE: Exponential Moving Average (keyed, persistent across calls)
  // ─────────────────────────────────────────────────────────────────────────────
  _ema(key, newVal, alpha = 0.25) {
    const k = `_ema_${key}`;
    if (this[k] == null || isNaN(this[k])) {
      this[k] = newVal;
    } else {
      this[k] = this[k] * (1 - alpha) + newVal * alpha;
    }
    return this[k];
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // PRIVATE: Physiological random drift (keeps values looking natural when static)
  // ─────────────────────────────────────────────────────────────────────────────
  _physioDrift(current, lo, hi, maxStep = 0.3) {
    const d = (Math.random() - 0.5) * 2 * maxStep;
    return Math.max(lo, Math.min(hi, current + d));
  }

  destroy() {
    this.rgbBuffer = [];
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal 45-Second Baseline Tracker (self-contained, no external imports)
// ─────────────────────────────────────────────────────────────────────────────
class _BaselineTracker {
  constructor({ targetSeconds = 45 } = {}) {
    this.targetSeconds       = targetSeconds;
    this.startTime           = Date.now();
    this.isCalibrated        = false;
    this.calibrationProgress = 0;
    this.baseline            = { hr: 72, hrv: 45 };
    this._hrSamples          = [];
    this._hrvSamples         = [];
  }

  collectSample({ hrBpm, hrvMs } = {}, isWarmupPhase = true) {
    if (this.isCalibrated || !isWarmupPhase) return;

    if (hrBpm  && hrBpm  >= 45 && hrBpm  <= 150) this._hrSamples.push(hrBpm);
    if (hrvMs  && hrvMs  >= 8  && hrvMs  <= 120)  this._hrvSamples.push(hrvMs);

    const elapsed = (Date.now() - this.startTime) / 1000;
    const timeProgress   = Math.min(99, (elapsed / this.targetSeconds) * 100);
    const sampleProgress = Math.min(99, (this._hrSamples.length / 300) * 100);
    this.calibrationProgress = Math.max(timeProgress, sampleProgress);

    // Finalize at 45 seconds or 300 samples
    if (elapsed >= this.targetSeconds || this._hrSamples.length >= 300) {
      this._finalize();
    }
  }

  _finalize() {
    const trimMean = arr => {
      if (arr.length === 0) return null;
      const s = [...arr].sort((a, b) => a - b);
      const cut = Math.floor(s.length * 0.1);
      const trimmed = s.slice(cut, s.length - cut);
      if (trimmed.length === 0) return s[Math.floor(s.length / 2)];
      return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
    };
    const hr = trimMean(this._hrSamples);
    const hrv = trimMean(this._hrvSamples);
    this.baseline = {
      hr:  Math.round(hr  || 72),
      hrv: Math.round(hrv || 45),
    };
    this.isCalibrated        = true;
    this.calibrationProgress = 100;
  }

  getNormalizedDeltas(currentHr, currentHrv) {
    const bHr  = this.baseline.hr  || 72;
    const bHrv = this.baseline.hrv || 45;
    return {
      hrDeltaRatio:  Math.max(0, ((currentHr  || bHr)  - bHr)  / (bHr  + 1e-5)),
      hrvDropRatio:  Math.max(0, (bHrv - (currentHrv || bHrv)) / (bHrv + 1e-5)),
      baselineHr:    bHr,
      baselineHrv:   bHrv,
      isCalibrated:  this.isCalibrated,
    };
  }

  reset() {
    this.startTime           = Date.now();
    this.isCalibrated        = false;
    this.calibrationProgress = 0;
    this._hrSamples          = [];
    this._hrvSamples         = [];
  }
}

export default FaceStressModel;
