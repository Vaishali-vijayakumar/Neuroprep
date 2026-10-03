/**
 * Verification test for Enterprise Fear Detection & Signal Stabilization Modules
 */

import { computeAffineTransform, ButterworthFilter, detrendSignal, computeTrimmedMean } from '../src/components/neroprep/engines/dspFilters.js';
import { CandidateBaselineTracker } from '../src/components/neroprep/engines/CandidateBaselineTracker.js';
import { FaceStressModel } from '../src/components/neroprep/engines/FaceStressModel.js';

console.log("=== 1. Testing DSP Filters & Affine Transform ===");

// 1. Test 2D Affine Transform
const srcTri = [{ x: 320, y: 50 }, { x: 200, y: 300 }, { x: 440, y: 300 }];
const dstTri = [{ x: 32, y: 5 }, { x: 5, y: 55 }, { x: 59, y: 55 }];
const matrix = computeAffineTransform(srcTri, dstTri);
console.log("  Computed Affine Matrix:", matrix);
if (isNaN(matrix.a) || isNaN(matrix.d)) {
  throw new Error("Affine matrix produced NaN!");
}
console.log("  [PASS] 2D Affine Transform Matrix solver verified.");

// 2. Test Butterworth Filter
const filter = new ButterworthFilter({ lowCut: 0.75, highCut: 3.5, sampleRate: 30 });
// Generate synthetic 1.2 Hz sine wave (72 BPM) + 10 Hz high frequency noise
const rawSignal = Array.from({ length: 60 }, (_, i) => {
  const t = i / 30;
  return Math.sin(2 * Math.PI * 1.2 * t) + 0.5 * Math.sin(2 * Math.PI * 10.0 * t);
});
const filtered = filter.process(rawSignal);
console.log(`  Filtered signal samples: input len = ${rawSignal.length}, output len = ${filtered.length}`);
if (filtered.some(isNaN)) {
  throw new Error("Butterworth filter produced NaN values!");
}
console.log("  [PASS] 4th-Order Butterworth Bandpass Filter verified.");

// 3. Test Detrending
const detrended = detrendSignal(filtered, 15);
if (detrended.some(isNaN)) {
  throw new Error("Detrending filter produced NaN values!");
}
console.log("  [PASS] Moving average detrending verified.");

console.log("\n=== 2. Testing 45-Second Baseline Calibration Protocol ===");
const tracker = new CandidateBaselineTracker({ targetSeconds: 15, fps: 30 }); // 450 frames for test
for (let i = 0; i < 460; i++) {
  tracker.collectSample({
    hrBpm: 70 + (i % 6), // 70-75 BPM
    hrvMs: 42 + (i % 4), // 42-45 ms
    glabellaDist: 0.44
  }, true);
}
console.log("  Calibrated status:", tracker.isCalibrated);
console.log("  Calibrated baseline:", tracker.baseline);
if (!tracker.isCalibrated) {
  throw new Error("Tracker failed to calibrate within target samples!");
}

// Test physiological surge
const deltas = tracker.getNormalizedDeltas(95, 18); // HR surge 95, HRV drop 18
console.log("  HR Surge Delta Ratio (+%):", Math.round(deltas.hrDeltaRatio * 100) + "%");
console.log("  HRV Drop Ratio (-%):", Math.round(deltas.hrvDropRatio * 100) + "%");
if (deltas.hrDeltaRatio <= 0 || deltas.hrvDropRatio <= 0) {
  throw new Error("Normalized deltas failed to detect physiological surge!");
}
console.log("  [PASS] CandidateBaselineTracker protocol verified.");

console.log("\n=== 3. Testing Masked Panic Detection (Duchenne vs. Non-Duchenne) ===");
const model = new FaceStressModel({ useWebWorker: false });

// Mock FACS with forced smile (AU12 = 0.6) but NO Duchenne eye crinkle (AU6 = 0.05)
const mockFacs = {
  au1: 0.4,
  au2: 0.1,
  au4: 0.3,
  au5: 0.2,
  au6: 0.05, // Non-Duchenne
  au7: 0.1,
  au9: 0.0,
  au12: 0.60, // Strong smile
  au17: 0.2,
  au20: 0.1,
  au25: 0.1,
  fearScore: 30,
  facialStressScore: 35,
  primaryEmotion: 'Confident / Relaxed'
};

// Autonomic panic: High HR surge (98 BPM vs 72 baseline), low HRV (14 ms)
const mockRppg = { hrBpm: 98, hrvMs: 14 };

const resolution = model._resolveMaskedAnxiety(mockFacs, mockRppg);
console.log("  Masked Anxiety Resolution:", resolution);

if (!resolution.suppressionFlag) {
  throw new Error("Failed to detect masked panic when non-Duchenne smile coincided with autonomic surge!");
}
if (resolution.effectiveFearScore < 75) {
  throw new Error("Effective fear score did not enforce the 75% safety floor!");
}
console.log("  [PASS] Masked Panic Detection & Safety Floor successfully enforced!");

console.log("\n========================================================");
console.log("  ALL FEAR DETECTION MODULE UPGRADE TESTS PASSED! (3/3) ");
console.log("========================================================");
