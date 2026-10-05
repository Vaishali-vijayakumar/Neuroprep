/**
 * CandidateBaselineTracker — 45-Second Warm-up Baseline Calibration
 * Collects HR and HRV samples and computes a personal baseline.
 */

import { computeTrimmedMean } from './dspFilters.js';

export class CandidateBaselineTracker {
  constructor({ targetSeconds = 45, fps = 30 } = {}) {
    this.targetSeconds = targetSeconds;
    this.startTime     = Date.now();
    this.isCalibrated  = false;
    this.calibrationProgress = 0;
    this.baseline = { hr: 72, hrv: 45, glabellaDist: 0.45 };
    this.samples  = { hr: [], hrv: [], glabellaDist: [] };
  }

  reset() {
    this.startTime = Date.now();
    this.isCalibrated = false;
    this.calibrationProgress = 0;
    this.samples = { hr: [], hrv: [], glabellaDist: [] };
  }

  collectSample({ hrBpm, hrvMs, glabellaDist } = {}, isWarmupPhase = true) {
    if (this.isCalibrated || !isWarmupPhase) return;

    if (hrBpm  && hrBpm  >= 40 && hrBpm  <= 160) this.samples.hr.push(hrBpm);
    if (hrvMs  && hrvMs  >= 5  && hrvMs  <= 150)  this.samples.hrv.push(hrvMs);
    if (glabellaDist && glabellaDist > 0.05 && glabellaDist < 1.0) {
      this.samples.glabellaDist.push(glabellaDist);
    }

    const elapsed      = (Date.now() - this.startTime) / 1000;
    const timeProgress = (elapsed / this.targetSeconds) * 100;
    const sampProgress = (this.samples.hr.length / 300) * 100;
    this.calibrationProgress = Math.min(99, Math.round(Math.max(timeProgress, sampProgress)));

    if (elapsed >= this.targetSeconds || this.samples.hr.length >= 300) {
      this.finalizeCalibration();
    }
  }

  finalizeCalibration() {
    this.baseline.hr  = this.samples.hr.length  > 0
      ? Math.round(computeTrimmedMean(this.samples.hr,  0.10)) || 72
      : 72;
    this.baseline.hrv = this.samples.hrv.length > 0
      ? Math.round(computeTrimmedMean(this.samples.hrv, 0.10)) || 45
      : 45;
    this.baseline.glabellaDist = this.samples.glabellaDist.length > 0
      ? Number(computeTrimmedMean(this.samples.glabellaDist, 0.10).toFixed(3)) || 0.45
      : 0.45;
    this.isCalibrated        = true;
    this.calibrationProgress = 100;
  }

  getNormalizedDeltas(currentHr, currentHrv) {
    const hr  = currentHr  || this.baseline.hr;
    const hrv = currentHrv || this.baseline.hrv;
    return {
      hrDeltaRatio:  Math.max(0, (hr  - this.baseline.hr)  / (this.baseline.hr  + 1e-5)),
      hrvDropRatio:  Math.max(0, (this.baseline.hrv - hrv) / (this.baseline.hrv + 1e-5)),
      baselineHr:    this.baseline.hr,
      baselineHrv:   this.baseline.hrv,
      isCalibrated:  this.isCalibrated,
    };
  }
}
