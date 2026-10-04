/**
 * Hybrid Spatiotemporal + rPPG Face Stress & Fear Detection Model
 * Enterprise Production Edition
 *
 * 1. SPATIAL STREAM — 3D Facial Landmarks + FACS Action Units
 *    (AU1, AU2, AU4, AU5, AU6 [Duchenne], AU7, AU9, AU12, AU17, AU20, AU25)
 *    Affine Homography Matrix Warp for Forehead ROI Stabilization (64x64)
 *
 * 2. PHYSIOLOGICAL STREAM (rPPG) — Remote Photoplethysmography
 *    - Plane-Orthogonal-to-Skin (POS) projection
 *    - 4th-Order Butterworth Bandpass Filter (0.75 - 3.5 Hz) + Detrending
 *    - Offloaded to dedicated Web Worker thread with graceful inline fallback
 *
 * 3. MASKED PANIC DETECTION (Duchenne vs. Non-Duchenne Filter)
 *    - Social masking resolution: detects forced smiles masking acute panic
 *    - Enforces safety floor on fearScore when autonomic panic is confirmed
 *
 * 4. 45-SECOND PSYCHOLOGICAL BASELINE CALIBRATION
 *    - CandidateBaselineTracker with trimmed mean normalization
 *    - Computes relative physiological expansion & collapse ratios
 *
 * 5. UPGRADED MULTIMODAL STRESS & FEAR INDEX
 *    StressIndex = 0.20*FACS_fear + 0.15*Micro_bursts + 0.35*(ΔHR_ratio + HRV_drop_ratio)*50 + 0.30*FacialStrain
 */

import { 
  computeAffineTransform, 
  ButterworthFilter, 
  detrendSignal,
  computeMedian,
  estimateDominantFrequency,
  slewRateLimit
} from './dspFilters.js';
import { CandidateBaselineTracker } from './CandidateBaselineTracker.js';

export class FaceStressModel {
  constructor({ windowSeconds = 4, fps = 30, useWebWorker = true } = {}) {
    this.fps        = fps;
    this.windowSize = Math.round(windowSeconds * fps); // 120 frames

    // Rolling buffers
    this.auBuffer      = [];   // FACS AU time-series
    this.rppgRgbBuffer = [];   // [R, G, B] per-frame mean skin colour
    this.bvpBuffer     = [];   // Latest BVP signal

    // Offscreen canvas for Affine Stabilized Forehead Patch (64x64)
    this._offscreen    = null;
    this._offCtx       = null;
    this.patchSize     = 64;

    // DSP Filter & Baseline Tracker
    this.butterworth     = new ButterworthFilter({ lowCut: 0.75, highCut: 3.5, sampleRate: fps });
    this.baselineTracker = new CandidateBaselineTracker({ targetSeconds: 45, fps: fps });

    // Temporal attention scaling
    this.gamma = 3.5;

    // Physiological smoothing & resting state
    this._hrHistory  = [];
    this._hrvHistory = [];
    this.lastStableHr = 72;
    this.lastStableHrv = 48;
    this.validFramesCount = 0;
    this._latestWorkerResult = null;

    // Temporal EMA smoothing filters for low-light stabilization
    this.smoothedMetrics = {};
    this.smoothedFear = null;
    this.smoothedFacialStress = null;
    this.smoothedStressIndex = null;

    // Web Worker Initialization
    this.useWebWorker = useWebWorker;
    this.worker = null;
    this._initWorker();
  }

  _initWorker() {
    if (!this.useWebWorker || typeof window === 'undefined' || typeof Worker === 'undefined') {
      return;
    }
    try {
      // Create inline worker from blob or URL
      this.worker = new Worker(new URL('./rppgWorker.js', import.meta.url), { type: 'module' });
      this.worker.onmessage = (e) => {
        this._latestWorkerResult = e.data;
      };
      this.worker.onerror = (err) => {
        console.warn('[FaceStressModel] rPPG Worker notice, falling back to main thread:', err.message);
        this.worker = null;
      };
    } catch (_) {
      this.worker = null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1. AFFINE HOMOGRAPHY MATRIX WARP FOREHEAD STABILIZATION
  // ─────────────────────────────────────────────────────────────────────────
  extractRoiRgbFromVideo(videoEl, landmarks = null) {
    if (!videoEl || videoEl.readyState < 2) return null;
    try {
      const vw = videoEl.videoWidth  || 640;
      const vh = videoEl.videoHeight || 480;

      // Lazy-create 64x64 Offscreen Canvas for stabilized patch
      if (!this._offscreen) {
        this._offscreen = document.createElement('canvas');
        this._offscreen.width  = this.patchSize;
        this._offscreen.height = this.patchSize;
        this._offCtx = this._offscreen.getContext('2d', { willReadFrequently: true });
      }

      const ctx = this._offCtx;
      const ps = this.patchSize;

      // If landmarks are available, perform 2D Affine Homography transformation
      if (landmarks && landmarks[10] && landmarks[33] && landmarks[263]) {
        // Source anchors in video pixel space
        const srcTri = [
          { x: landmarks[10].x * vw,  y: landmarks[10].y * vh },  // Forehead top
          { x: landmarks[33].x * vw,  y: landmarks[33].y * vh },  // Left eye canthus / temple
          { x: landmarks[263].x * vw, y: landmarks[263].y * vh }  // Right eye canthus / temple
        ];

        // Fixed stabilized destination coordinates on 64x64 patch
        const dstTri = [
          { x: ps * 0.50, y: ps * 0.12 },  // Top center
          { x: ps * 0.12, y: ps * 0.88 },  // Bottom left
          { x: ps * 0.88, y: ps * 0.88 }   // Bottom right
        ];

        // Solve Affine Transform Matrix
        const M = computeAffineTransform(srcTri, dstTri);

        ctx.save();
        ctx.clearRect(0, 0, ps, ps);
        ctx.setTransform(M.a, M.b, M.c, M.d, M.e, M.f);
        ctx.drawImage(videoEl, 0, 0, vw, vh);
        ctx.restore();
      } else {
        // Simple bounding box fallback
        ctx.drawImage(videoEl, vw * 0.35, vh * 0.10, vw * 0.30, vh * 0.15, 0, 0, ps, ps);
      }

      // Sample central forehead region of stabilized patch
      const subX = Math.floor(ps * 0.25);
      const subY = Math.floor(ps * 0.15);
      const subW = Math.floor(ps * 0.50);
      const subH = Math.floor(ps * 0.45);

      const imgData = ctx.getImageData(subX, subY, subW, subH);
      const px = imgData.data;

      // First pass: compute average patch luminance to assess ambient lighting
      let patchLumSum = 0;
      const totalPixels = px.length / 4;
      for (let i = 0; i < px.length; i += 4) {
        patchLumSum += px[i] * 0.299 + px[i+1] * 0.587 + px[i+2] * 0.114;
      }
      const avgPatchLum = patchLumSum / (totalPixels + 1e-6);

      // Low-light adaptation: dynamically lower floor when lighting is dim
      const minLum = avgPatchLum < 50 ? Math.max(8, avgPatchLum * 0.40) : 45;
      const maxLum = avgPatchLum < 50 ? Math.min(252, Math.max(160, avgPatchLum * 2.5)) : 245;

      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < px.length; i += 4) {
        const lum = px[i]*0.299 + px[i+1]*0.587 + px[i+2]*0.114;
        if (lum < minLum || lum > maxLum) continue;
        r += px[i];
        g += px[i+1];
        b += px[i+2];
        n++;
      }

      // If forehead region is occluded or shadowed (n < 20), fallback to bilateral cheeks
      if (n < 20 && landmarks && landmarks[117] && landmarks[346]) {
        const cheekPoints = [landmarks[117], landmarks[346]];
        for (const pt of cheekPoints) {
          const cx = Math.max(10, Math.min(vw - 20, Math.round(pt.x * vw - 10)));
          const cy = Math.max(10, Math.min(vh - 20, Math.round(pt.y * vh - 10)));
          ctx.clearRect(0, 0, 20, 20);
          ctx.drawImage(videoEl, cx, cy, 20, 20, 0, 0, 20, 20);
          const cImg = ctx.getImageData(0, 0, 20, 20);
          const cPx = cImg.data;
          for (let j = 0; j < cPx.length; j += 4) {
            const cLum = cPx[j]*0.299 + cPx[j+1]*0.587 + cPx[j+2]*0.114;
            if (cLum < minLum || cLum > maxLum) continue;
            r += cPx[j];
            g += cPx[j+1];
            b += cPx[j+2];
            n++;
          }
        }
      }

      if (n === 0) return null;

      // Software auto-gain: normalize dark frames so rPPG pulsatile component remains strong
      const sampleLum = (r * 0.299 + g * 0.587 + b * 0.114) / n;
      const gain = sampleLum < 65 ? Math.min(3.2, 95 / Math.max(15, sampleLum)) : 1.0;

      return [
        Math.min(255, (r / n) * gain),
        Math.min(255, (g / n) * gain),
        Math.min(255, (b / n) * gain)
      ];
    } catch (_) {
      return null;
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. FACS ACTION UNITS WITH DUCHENNE (AU6) & COMPOUND FEAR
  // ─────────────────────────────────────────────────────────────────────────
  _interOcularDist(lm) {
    return Math.hypot(lm[33].x - lm[263].x, lm[33].y - lm[263].y) + 1e-6;
  }

  _dist(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
  }

  _smoothMetric(key, val, alpha = 0.35) {
    if (this.smoothedMetrics[key] == null || isNaN(this.smoothedMetrics[key])) {
      this.smoothedMetrics[key] = val;
    } else {
      this.smoothedMetrics[key] = this.smoothedMetrics[key] * (1 - alpha) + val * alpha;
    }
    return this.smoothedMetrics[key];
  }

  _extractAUs(lm, iod) {
    iod = iod || this._interOcularDist(lm);
    const N = (raw) => raw / iod;

    // AU1 & AU2: Brow Raisers
    const leftInnerBrowUp  = N(Math.abs(lm[55].y  - lm[133].y));
    const rightInnerBrowUp = N(Math.abs(lm[285].y - lm[362].y));
    const au1Raw = (leftInnerBrowUp + rightInnerBrowUp) / 2;

    const leftOuterBrowUp  = N(Math.abs(lm[70].y  - lm[33].y));
    const rightOuterBrowUp = N(Math.abs(lm[300].y - lm[263].y));
    const au2Raw = (leftOuterBrowUp + rightOuterBrowUp) / 2;

    // Temporal smoothing to suppress low-light camera sensor pixel jitter
    const smAu1 = this._smoothMetric('au1', au1Raw, 0.35);
    const smAu2 = this._smoothMetric('au2', au2Raw, 0.35);

    const au1 = Math.min(1, Math.max(0, (smAu1 - 0.46) / 0.18));
    const au2 = Math.min(1, Math.max(0, (smAu2 - 0.40) / 0.18));

    // AU4: Brow Lowerer (glabella distance compression)
    const glabellaDist = N(this._dist(lm[55], lm[285]));
    const smGlabella = this._smoothMetric('glabella', glabellaDist, 0.35);
    const au4 = Math.min(1, Math.max(0, (0.42 - smGlabella) / 0.18));

    // AU5: Upper Lid Raiser (Wide-eyed startled / panic)
    const leftEyeOpening  = this._dist(lm[159], lm[145]) / (this._dist(lm[33], lm[133]) + 1e-6);
    const rightEyeOpening = this._dist(lm[386], lm[374]) / (this._dist(lm[362], lm[263]) + 1e-6);
    const avgEyeOpening   = (leftEyeOpening + rightEyeOpening) / 2;
    const smEyeOpening = this._smoothMetric('eyeOpening', avgEyeOpening, 0.35);
    const au5 = Math.min(1, Math.max(0, (smEyeOpening - 0.34) / 0.12));

    // AU6: Cheek Raiser & Duchenne Eye Crinkle (Orbicularis Oculi)
    // Measures distance between infraorbital lower eyelid and zygomatic cheek apex
    const leftCheekRise  = N(this._dist(lm[145], lm[117]));
    const rightCheekRise = N(this._dist(lm[374], lm[346]));
    const avgCheekRise   = (leftCheekRise + rightCheekRise) / 2;
    const smCheekRise = this._smoothMetric('cheekRise', avgCheekRise, 0.35);
    const au6 = Math.min(1, Math.max(0, (0.28 - smCheekRise) / 0.10));

    // AU7: Lid Tightener (squint / EAR reduction)
    const leftEAR  = this._dist(lm[159], lm[145]) / (this._dist(lm[33], lm[133]) + 1e-6);
    const rightEAR = this._dist(lm[386], lm[374]) / (this._dist(lm[362], lm[263]) + 1e-6);
    const avgEAR   = (leftEAR + rightEAR) / 2;
    const smEAR = this._smoothMetric('ear', avgEAR, 0.35);
    const au7 = Math.min(1, Math.max(0, (0.17 - smEAR) / 0.10));

    // AU9: Nose Wrinkler
    const noseWrinkle = (N(Math.abs(lm[129].y - lm[6].y)) + N(Math.abs(lm[358].y - lm[6].y))) / 2;
    const smNose = this._smoothMetric('nose', noseWrinkle, 0.35);
    const au9 = Math.min(1, Math.max(0, (smNose - 0.26) / 0.14));

    // AU12: Lip Corner Puller (Zygomaticus major - Smile)
    const mouthSpread = N(this._dist(lm[61], lm[291]));
    const smMouthSpread = this._smoothMetric('mouthSpread', mouthSpread, 0.35);
    const au12 = Math.min(1, Math.max(0, (smMouthSpread - 0.46) / 0.18));

    // AU17: Lower Lip Depressor (chin raise / anxiety clench)
    const chinLip = N(Math.abs(lm[17].y - lm[152].y));
    const smChinLip = this._smoothMetric('chinLip', chinLip, 0.35);
    const au17 = Math.min(1, Math.max(0, (0.28 - smChinLip) / 0.18));

    // AU20: Lip Stretcher (horizontal mouth stretch in fear/panic)
    const isSmileCurve = (lm[61].y < lm[0].y && lm[291].y < lm[0].y);
    const au20 = !isSmileCurve ? Math.min(1, Math.max(0, (smMouthSpread - 0.50) / 0.16)) : 0;

    // AU25: Lips Parted
    const lipGap = N(this._dist(lm[13], lm[14]));
    const smLipGap = this._smoothMetric('lipGap', lipGap, 0.35);
    const au25 = Math.min(1, Math.max(0, (smLipGap - 0.14) / 0.18));

    // Compound Fear Expression (Ekman FACS: AU1/AU2/AU4 + AU5 + AU20)
    // Low-light sensor noise or conversational gestures must not trigger fear spikes.
    // True fear demands simultaneous upper-face co-activation:
    // (AU1 + AU5) or (AU1 + AU4) or high-intensity AU5, verified with mouth tension (AU20/AU25).
    let compoundUpperFear = 0;
    if (au1 > 0.28 && au5 > 0.25) {
      compoundUpperFear = (au1 * 0.55 + au5 * 0.45);
    } else if (au1 > 0.35 && au4 > 0.30) {
      compoundUpperFear = (au1 * 0.50 + au4 * 0.40);
    } else if (au5 > 0.65) {
      // Acute wide-eyed startle
      compoundUpperFear = au5 * 0.70;
    }

    let fearRaw = 0;
    if (compoundUpperFear > 0.28) {
      const lowerMultiplier = au20 > 0.28 ? 1.25 : (au25 > 0.30 ? 1.05 : 0.85);
      fearRaw = Math.min(1.0, compoundUpperFear * lowerMultiplier);
    }
    const fearScore = Math.min(100, Math.max(0, Math.round(fearRaw * 100)));

    // Facial Strain Score (excluding AU12 to decouple genuine smiles)
    const facialStressRaw = (
      au4  * 0.30 +
      au7  * 0.20 +
      au1  * 0.15 +
      au17 * 0.15 +
      au9  * 0.10 +
      au25 * 0.10
    );
    const facialStressScore = Math.min(100, Math.max(0, Math.round(facialStressRaw * 100)));

    return {
      au1, au2, au4, au5, au6, au7, au9, au12, au17, au20, au25,
      glabellaDist,
      fearScore,
      facialStressScore
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. MASKED PANIC RESOLUTION (Duchenne vs Non-Duchenne Filter)
  // ─────────────────────────────────────────────────────────────────────────
  _resolveMaskedAnxiety(facs, rppg) {
    const isSmileActive = facs.au12 > 0.35;
    const isDuchenneEyeCrinkle = facs.au6 > 0.25;

    // Non-Duchenne smile detected (social mask)
    const isForcedMask = isSmileActive && !isDuchenneEyeCrinkle;

    // Check physiological surge relative to calibrated baseline
    const deltas = this.baselineTracker.getNormalizedDeltas(rppg.hrBpm, rppg.hrvMs);
    const hrSurge = (rppg.hrBpm !== null && (rppg.hrBpm - this.baselineTracker.baseline.hr) > 15) || deltas.hrDeltaRatio > 0.20;
    const hrvPlummet = (rppg.hrvMs !== null && rppg.hrvMs < 20) || deltas.hrvDropRatio > 0.50;
    const isAutonomicPanic = hrSurge || hrvPlummet;

    if (isForcedMask && isAutonomicPanic) {
      return {
        effectiveFearScore: Math.max(facs.fearScore, 75), // Enforce safety floor
        cognitiveState: 'Masked Panic / Severe Anxiety',
        suppressionFlag: true,
        forcedSmileMask: true
      };
    }

    let primary = 'Calm';
    if (facs.fearScore >= 50) primary = 'Fear / Apprehension';
    else if (facs.facialStressScore >= 50) primary = 'Stress / Strain';
    else if (facs.au4 >= 0.35 || facs.au7 >= 0.35) primary = 'High Focus / Concentration';
    else if (isSmileActive && isDuchenneEyeCrinkle) primary = 'Confident / Genuine Smile';

    return {
      effectiveFearScore: facs.fearScore,
      cognitiveState: primary,
      suppressionFlag: false,
      forcedSmileMask: false
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. INLINE rPPG POS + BUTTERWORTH FALLBACK
  // ─────────────────────────────────────────────────────────────────────────
  _processRPPGInline(rgbSeries) {
    const N = rgbSeries.length;
    if (N < 40) {
      return {
        hrBpm: this.validFramesCount > 10 ? this.lastStableHr : null,
        hrvMs: this.validFramesCount > 10 ? this.lastStableHrv : null,
        bvp: []
      };
    }

    const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const std = arr => {
      const m = mean(arr);
      return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length) + 1e-9;
    };

    const R = rgbSeries.map(c => c[0]);
    const G = rgbSeries.map(c => c[1]);
    const B = rgbSeries.map(c => c[2]);

    const mR = mean(R), mG = mean(G), mB = mean(B);
    if (mR < 1 || mG < 1 || mB < 1) {
      return {
        hrBpm: this.validFramesCount > 10 ? this.lastStableHr : null,
        hrvMs: this.validFramesCount > 10 ? this.lastStableHrv : null,
        bvp: []
      };
    }

    const nR = R.map(v => v / mR - 1);
    const nG = G.map(v => v / mG - 1);
    const nB = B.map(v => v / mB - 1);

    const S1 = nG.map((g, i) => g - nB[i]);
    const S2 = nG.map((g, i) => g + nB[i] - 2 * nR[i]);
    const alpha = std(S1) / std(S2);
    const rawBvp = S1.map((s, i) => s + alpha * S2[i]);

    // Apply Butterworth bandpass filter & moving average detrending
    const filteredBvp = this.butterworth.process(rawBvp);
    const cleanBvp = detrendSignal(filteredBvp, 15);

    // 1. Dominant Frequency Estimation via Autocorrelation (High SNR)
    const autocorr = estimateDominantFrequency(cleanBvp, this.fps, 48, 180);
    const autocorrBpm = autocorr.hrBpm;

    // 2. Time-Domain Peak Detection with Adaptive Threshold
    const minGap = Math.round(this.fps * 0.38); // min 380ms between beats (<=158 BPM)
    const bvpMean = mean(cleanBvp);
    const bvpStd = std(cleanBvp);
    const threshold = bvpMean + 0.28 * bvpStd;

    const peaks = [];
    for (let i = 2; i < N - 2; i++) {
      if (
        cleanBvp[i] > threshold &&
        cleanBvp[i] > cleanBvp[i-1] && cleanBvp[i] > cleanBvp[i-2] &&
        cleanBvp[i] > cleanBvp[i+1] && cleanBvp[i] > cleanBvp[i+2]
      ) {
        if (peaks.length === 0 || (i - peaks[peaks.length - 1]) >= minGap) {
          peaks.push(i);
        }
      }
    }

    let calculatedHr = null;
    let calculatedHrv = null;

    if (peaks.length >= 2) {
      const rawIbis = [];
      for (let i = 1; i < peaks.length; i++) {
        const ibiMs = ((peaks[i] - peaks[i-1]) / this.fps) * 1000;
        if (ibiMs >= 360 && ibiMs <= 1500) {
          rawIbis.push(ibiMs);
        }
      }

      if (rawIbis.length > 0) {
        // Robust Median IBI outlier rejection for low light / ectopic beats
        const medianIbi = computeMedian(rawIbis);
        const validIbis = rawIbis.filter(ibi => Math.abs(ibi - medianIbi) <= 0.28 * medianIbi);

        if (validIbis.length > 0) {
          const avgIbi = mean(validIbis);
          const peakDerivedBpm = 60000 / avgIbi;

          // Cross-verify with Autocorrelation
          if (autocorrBpm && Math.abs(peakDerivedBpm - autocorrBpm) <= 18) {
            calculatedHr = peakDerivedBpm * 0.65 + autocorrBpm * 0.35;
          } else if (autocorrBpm) {
            calculatedHr = autocorrBpm;
          } else {
            calculatedHr = peakDerivedBpm;
          }

          // HRV RMSSD calculation
          if (validIbis.length > 1) {
            let ssd = 0;
            for (let i = 1; i < validIbis.length; i++) {
              ssd += (validIbis[i] - validIbis[i-1]) ** 2;
            }
            calculatedHrv = Math.round(Math.sqrt(ssd / (validIbis.length - 1)));
          }
        }
      }
    }

    if (calculatedHr === null && autocorrBpm !== null) {
      calculatedHr = autocorrBpm;
    }

    // Physiological Slew-Rate Limiter (Maximum delta of 1.8 BPM per update)
    if (calculatedHr !== null && calculatedHr >= 48 && calculatedHr <= 175) {
      this.lastStableHr = Math.round(slewRateLimit(calculatedHr, this.lastStableHr, 1.8, 0.35));
      this._hrHistory.push(this.lastStableHr);
      if (this._hrHistory.length > 15) this._hrHistory.shift();
      this.validFramesCount++;
    }

    // Slew-Rate Limiter for HRV RMSSD
    if (calculatedHrv !== null && calculatedHrv >= 8 && calculatedHrv <= 160) {
      this.lastStableHrv = Math.round(slewRateLimit(calculatedHrv, this.lastStableHrv, 2.5, 0.30));
      this._hrvHistory.push(this.lastStableHrv);
      if (this._hrvHistory.length > 15) this._hrvHistory.shift();
    }

    return {
      hrBpm: this.validFramesCount > 10 ? this.lastStableHr : null,
      hrvMs: this.validFramesCount > 10 ? this.lastStableHrv : null,
      bvp: cleanBvp
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. TEMPORAL MICRO-EXPRESSION ATTENTION WINDOW
  // ─────────────────────────────────────────────────────────────────────────
  _processTemporalAttention(auBuffer) {
    if (auBuffer.length < 3) return { microExpressionIntensity: 0, attentionWeights: [] };

    const velocities = [];
    for (let i = 1; i < auBuffer.length; i++) {
      const a = auBuffer[i-1], b = auBuffer[i];
      const v = Math.abs(b.au4 - a.au4) * 3.0 +
                Math.abs(b.au7 - a.au7) * 2.0 +
                Math.abs(b.au1 - a.au1) * 1.5 +
                Math.abs(b.au9 - a.au9) * 1.5 +
                Math.abs(b.au2 - a.au2) * 1.0;
      velocities.push(v);
    }

    const expV = velocities.map(v => Math.exp(this.gamma * v));
    const sumEV = expV.reduce((a, b) => a + b, 0) + 1e-9;
    const weights = expV.map(e => e / sumEV);

    const microRaw = velocities.reduce((acc, v, i) => acc + v * weights[i], 0);
    const microExpressionIntensity = Math.min(100, Math.round(microRaw * 120));

    return { microExpressionIntensity, attentionWeights: weights };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. MAIN PROCESS FRAME ENTRY POINT
  // ─────────────────────────────────────────────────────────────────────────
  processFrame(landmarks, rgbRoi, { isLookingDown = false, isWarmupPhase = false, acousticTremor = 0 } = {}) {
    const iod = this._interOcularDist(landmarks);
    const au  = this._extractAUs(landmarks, iod);

    this.auBuffer.push(au);
    if (rgbRoi) this.rppgRgbBuffer.push(rgbRoi);
    if (this.auBuffer.length > this.windowSize) this.auBuffer.shift();
    if (this.rppgRgbBuffer.length > this.windowSize) this.rppgRgbBuffer.shift();

    // ── Offload rPPG to Worker or use inline POS ──
    let rppg = { hrBpm: null, hrvMs: null, bvp: [] };
    if (this.worker && rgbRoi) {
      this.worker.postMessage({
        type: 'PROCESS_FRAME',
        rgb: rgbRoi,
        timestamp: Date.now()
      });
      if (this._latestWorkerResult) {
        rppg = this._latestWorkerResult;
      }
    } else {
      rppg = this._processRPPGInline(this.rppgRgbBuffer);
    }

    // ── 45-Second Baseline Calibration Protocol ──
    this.baselineTracker.collectSample({
      hrBpm: rppg.hrBpm,
      hrvMs: rppg.hrvMs,
      glabellaDist: au.glabellaDist
    }, isWarmupPhase);

    const deltas = this.baselineTracker.getNormalizedDeltas(rppg.hrBpm, rppg.hrvMs);

    // ── Temporal Micro-Expression Stream ──
    const temporal = this._processTemporalAttention(this.auBuffer);

    // ── Social Masking & Duchenne Resolution ──
    const maskingResolution = this._resolveMaskedAnxiety(au, rppg);
    const effectiveFear = maskingResolution.effectiveFearScore;

    // Temporal EMA smoothing for low-light stability (prevents frame flutter)
    this.smoothedFear = this.smoothedFear !== null
      ? Math.round(this.smoothedFear * 0.78 + effectiveFear * 0.22)
      : effectiveFear;
    const steadyFear = this.smoothedFear;

    this.smoothedFacialStress = this.smoothedFacialStress !== null
      ? Math.round(this.smoothedFacialStress * 0.75 + au.facialStressScore * 0.25)
      : au.facialStressScore;
    const steadyFacialStress = this.smoothedFacialStress;

    // ── Upgraded Relative Stress Index Formulation ──
    // StressIndex = (0.20*FACS_fear) + (0.15*Micro_bursts) + (0.35*(ΔHR_ratio + HRV_drop_ratio)*50) + (0.30*Acoustic_tremor)
    const physiologicalShift = Math.min(100, (deltas.hrDeltaRatio + deltas.hrvDropRatio) * 50);
    const acousticFactor = Math.min(100, Math.max(0, acousticTremor > 0 ? acousticTremor : steadyFacialStress));

    let rawStressIndex = Math.round(
      steadyFear                   * 0.20 +
      temporal.microExpressionIntensity * 0.15 +
      physiologicalShift           * 0.35 +
      acousticFactor               * 0.30
    );

    if (isLookingDown) {
      rawStressIndex = Math.min(100, rawStressIndex + 12);
    }

    const instantStressIndex = Math.min(100, Math.max(0, rawStressIndex));
    this.smoothedStressIndex = this.smoothedStressIndex !== null
      ? Math.round(this.smoothedStressIndex * 0.80 + instantStressIndex * 0.20)
      : instantStressIndex;
    const stressIndex = this.smoothedStressIndex;

    let cognitiveLoad = 'Low';
    if (stressIndex >= 55 || steadyFear >= 60 || maskingResolution.suppressionFlag) {
      cognitiveLoad = 'High';
    } else if (stressIndex >= 30 || steadyFear >= 35) {
      cognitiveLoad = 'Moderate';
    }

    const stressMarkers = this._describeStress(au, rppg, stressIndex, steadyFear, maskingResolution, deltas);

    return {
      stressIndex,
      cognitiveLoad,
      fearScore: steadyFear,
      rawFearScore: au.fearScore,
      facialStressScore: steadyFacialStress,
      primaryEmotion: maskingResolution.cognitiveState,
      maskedPanicDetected: maskingResolution.suppressionFlag,
      forcedSmileMask: maskingResolution.forcedSmileMask,
      emotionProbabilities: {
        fear: steadyFear,
        stress: steadyFacialStress,
        focus: Math.min(100, Math.round((au.au4 * 0.6 + au.au7 * 0.4) * 100)),
        calm: Math.max(0, 100 - Math.max(steadyFear, stressIndex)),
        smile: Math.round(au.au12 * 100)
      },
      actionUnits: au,
      physiological: {
        hrBpm: rppg.hrBpm,
        hrvMs: rppg.hrvMs,
        baselineHr: deltas.baselineHr,
        baselineHrv: deltas.baselineHrv,
        hrDeltaRatio: deltas.hrDeltaRatio,
        hrvDropRatio: deltas.hrvDropRatio
      },
      baselineCalibration: {
        isCalibrated: this.baselineTracker.isCalibrated,
        progress: this.baselineTracker.calibrationProgress,
        baseline: this.baselineTracker.baseline
      },
      temporal: { microExpressionIntensity: temporal.microExpressionIntensity },
      stressMarkers,
      rppgReady: rppg.hrBpm !== null
    };
  }

  _describeStress(au, rppg, stressIndex, fearScore, masking, deltas) {
    const markers = [];
    if (masking.suppressionFlag) {
      markers.push('⚠️ Masked Panic Detected (Non-Duchenne Smile + Autonomic Surge)');
    }
    if (fearScore >= 50) {
      markers.push(`Facial Fear / Startle Response (${fearScore}%)`);
    }
    if (au.au4 > 0.35) markers.push('Brow furrow / concentrated strain (AU4)');
    if (au.au5 > 0.35) markers.push('Wide startled eyes / upper lid raise (AU5)');
    if (au.au7 > 0.35) markers.push('Lid strain / squint (AU7)');
    if (au.au1 > 0.45) markers.push('Inner brow elevation — worry / apprehension (AU1)');
    if (au.au20 > 0.35) markers.push('Lip stretch tension (AU20)');
    if (au.au6 > 0.30 && au.au12 > 0.35) markers.push('Genuine Duchenne Smile (Calm/Reassurance)');

    if (rppg.hrBpm !== null && deltas.hrDeltaRatio > 0.20) {
      markers.push(`Elevated HR Surge (+${Math.round(deltas.hrDeltaRatio * 100)}% over baseline)`);
    }
    if (rppg.hrvMs !== null && deltas.hrvDropRatio > 0.40) {
      markers.push(`Parasympathetic HRV Collapse (-${Math.round(deltas.hrvDropRatio * 100)}%)`);
    }
    if (stressIndex < 20 && fearScore < 20 && !masking.suppressionFlag) {
      markers.push('Baseline calm detected');
    }
    return markers;
  }

  destroy() {
    if (this.worker) {
      try { this.worker.terminate(); } catch (_) {}
      this.worker = null;
    }
  }
}

export default FaceStressModel;
