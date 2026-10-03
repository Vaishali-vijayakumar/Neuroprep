/**
 * CandidateBaselineTracker
 * ────────────────────────
 * Implements a 45-Second Warm-up Baseline Calibration Protocol:
 * - Collects steady-state samples of Heart Rate, HRV (RMSSD), and Glabella Brow Distance.
 * - Computes trimmed means (discards top/bottom 10% movement blips).
 * - Computes relative physiological expansion/collapse ratios:
 *     ΔHR_ratio    = max(0, (current.hr - baseline.hr) / baseline.hr)
 *     HRV_drop_ratio = max(0, (baseline.hrv - current.hrv) / baseline.hrv)
 */

import { computeTrimmedMean } from './dspFilters.js';

export class CandidateBaselineTracker {
  constructor({ targetSeconds = 45, fps = 30 } = {}) {
    this.targetSamples = Math.round(targetSeconds * fps); // 1350 frames
    this.samples = {
      hr: [],
      hrv: [],
      glabellaDist: []
    };
    this.isCalibrated = false;
    this.calibrationProgress = 0; // 0 to 100%

    // Clinical default baseline prior to calibration
    this.baseline = {
      hr: 72,
      hrv: 45,
      glabellaDist: 0.45
    };
  }

  reset() {
    this.samples = { hr: [], hrv: [], glabellaDist: [] };
    this.isCalibrated = false;
    this.calibrationProgress = 0;
  }

  /**
   * Feed a frame sample into the calibration pool
   */
  collectSample({ hrBpm, hrvMs, glabellaDist }, isWarmupPhase = true) {
    if (this.isCalibrated || !isWarmupPhase) return;

    if (hrBpm && hrBpm >= 40 && hrBpm <= 160) {
      this.samples.hr.push(hrBpm);
    }
    if (hrvMs && hrvMs >= 5 && hrvMs <= 150) {
      this.samples.hrv.push(hrvMs);
    }
    if (glabellaDist && glabellaDist > 0.1 && glabellaDist < 1.0) {
      this.samples.glabellaDist.push(glabellaDist);
    }

    const currentLen = Math.max(this.samples.glabellaDist.length, this.samples.hr.length);
    this.calibrationProgress = Math.min(100, Math.round((currentLen / this.targetSamples) * 100));

    // Complete calibration if target samples reached or at least 450 valid samples (~15s) in short tests
    if (this.samples.hr.length >= this.targetSamples || (this.samples.hr.length >= 600 && this.calibrationProgress >= 90)) {
      this.finalizeCalibration();
    }
  }

  finalizeCalibration() {
    if (this.samples.hr.length > 0) {
      this.baseline.hr = Math.round(computeTrimmedMean(this.samples.hr, 0.10)) || 72;
    }
    if (this.samples.hrv.length > 0) {
      this.baseline.hrv = Math.round(computeTrimmedMean(this.samples.hrv, 0.10)) || 45;
    }
    if (this.samples.glabellaDist.length > 0) {
      this.baseline.glabellaDist = Number(computeTrimmedMean(this.samples.glabellaDist, 0.10).toFixed(3)) || 0.45;
    }
    this.isCalibrated = true;
    this.calibrationProgress = 100;
  }

  /**
   * Computes normalized physiological deltas relative to candidate's own baseline
   */
  getNormalizedDeltas(currentHr, currentHrv) {
    const hr = currentHr || this.baseline.hr;
    const hrv = currentHrv || this.baseline.hrv;

    // Relative HR surge ratio (0.0 to 1.0+)
    const hrDeltaRatio = Math.max(0, (hr - this.baseline.hr) / (this.baseline.hr + 1e-5));

    // Relative HRV collapse ratio (parasympathetic withdrawal: 0.0 to 1.0)
    const hrvDropRatio = Math.max(0, (this.baseline.hrv - hrv) / (this.baseline.hrv + 1e-5));

    return {
      hrDeltaRatio,
      hrvDropRatio,
      baselineHr: this.baseline.hr,
      baselineHrv: this.baseline.hrv,
      isCalibrated: this.isCalibrated
    };
  }
}
