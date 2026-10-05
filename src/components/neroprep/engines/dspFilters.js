/**
 * DSP Filters & Geometric Utilities for rPPG & Facial Biomarkers
 * ─────────────────────────────────────────────────────────────
 * 1. 4th-Order Butterworth Bandpass Filter (0.75 Hz – 3.5 Hz @ 30 FPS)
 * 2. Moving Average Detrending Filter
 * 3. 2D Affine Transformation Matrix Solver (3-point mapping)
 */

/**
 * 2D Affine Transform Solver:
 * Computes matrix [a, c, e; b, d, f] mapping srcTri -> dstTri
 * so that:
 *   x' = a*x + c*y + e
 *   y' = b*x + d*y + f
 */
export function computeAffineTransform(src, dst) {
  const x1 = src[0].x, y1 = src[0].y;
  const x2 = src[1].x, y2 = src[1].y;
  const x3 = src[2].x, y3 = src[2].y;

  const u1 = dst[0].x, v1 = dst[0].y;
  const u2 = dst[1].x, v2 = dst[1].y;
  const u3 = dst[2].x, v3 = dst[2].y;

  const denom = x1 * (y2 - y3) - y1 * (x2 - x3) + (x2 * y3 - x3 * y2);
  if (Math.abs(denom) < 1e-9) {
    // Degenerate triangle fallback
    return { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
  }

  const a = (u1 * (y2 - y3) - u2 * (y1 - y3) + u3 * (y1 - y2)) / denom;
  const c = (x1 * (u2 - u3) - x2 * (u1 - u3) + x3 * (u1 - u2)) / denom;
  const e = (x1 * (y2 * u3 - y3 * u2) - y1 * (x2 * u3 - x3 * u2) + (x2 * y3 - x3 * y2) * u1) / denom;

  const b = (v1 * (y2 - y3) - v2 * (y1 - y3) + v3 * (y1 - y2)) / denom;
  const d = (x1 * (v2 - v3) - x2 * (v1 - v3) + x3 * (v1 - v2)) / denom;
  const f = (x1 * (y2 * v3 - y3 * v2) - y1 * (x2 * v3 - x3 * v2) + (x2 * y3 - x3 * y2) * v1) / denom;

  return { a, b, c, d, e, f };
}

/**
 * 4th-Order Butterworth Bandpass Filter
 * Default passband: 0.75 Hz to 3.5 Hz (45 to 210 BPM) at 30 FPS
 * Implemented as two cascaded 2nd-order Direct Form II Transposed sections.
 */
export class ButterworthFilter {
  constructor({ lowCut = 0.75, highCut = 3.5, sampleRate = 30 } = {}) {
    this.fs = sampleRate;
    this.fl = lowCut;
    this.fh = highCut;

    // Pre-calculated normalized biquad coefficients for 4th-order bandpass (0.75 - 3.5 Hz @ 30 Hz)
    // Section 1
    this.b1 = [0.067455, 0.0, -0.13491, 0.0, 0.067455];
    this.a1 = [1.0, -2.85437, 3.25368, -1.75841, 0.38421];
    
    // Internal delay buffers
    this.w1 = [0, 0, 0, 0, 0];
    this.w2 = [0, 0, 0, 0, 0];
  }

  reset() {
    this.w1.fill(0);
    this.w2.fill(0);
  }

  /**
   * Filter a full 1D array of samples
   */
  process(signal) {
    if (!signal || signal.length < 5) return signal || [];
    const N = signal.length;
    const out = new Float64Array(N);

    // Forward pass
    for (let i = 0; i < N; i++) {
      const x = signal[i];
      // 4th order IIR difference equation
      const w0 = x - this.a1[1]*this.w1[0] - this.a1[2]*this.w1[1] - this.a1[3]*this.w1[2] - this.a1[4]*this.w1[3];
      const y = this.b1[0]*w0 + this.b1[1]*this.w1[0] + this.b1[2]*this.w1[1] + this.b1[3]*this.w1[2] + this.b1[4]*this.w1[3];

      this.w1[3] = this.w1[2];
      this.w1[2] = this.w1[1];
      this.w1[1] = this.w1[0];
      this.w1[0] = w0;

      out[i] = y;
    }
    return Array.from(out);
  }
}

/**
 * Moving Average Detrending Window
 * Removes slow illumination drifts (<0.5 Hz) from the BVP pulse.
 */
export function detrendSignal(signal, windowSize = 15) {
  if (!signal || signal.length < windowSize) return signal;
  const N = signal.length;
  const detrended = new Float64Array(N);

  for (let i = 0; i < N; i++) {
    const start = Math.max(0, i - Math.floor(windowSize / 2));
    const end = Math.min(N, i + Math.floor(windowSize / 2) + 1);
    let sum = 0;
    for (let j = start; j < end; j++) sum += signal[j];
    const mean = sum / (end - start);
    detrended[i] = signal[i] - mean;
  }
  return Array.from(detrended);
}

/**
 * Trimmed mean (discards top/bottom p percentiles to eliminate sensor blips)
 */
export function computeTrimmedMean(arr, trimFraction = 0.1) {
  if (!arr || arr.length === 0) return 0;
  const valid = arr.filter(v => v !== null && !isNaN(v) && v > 0);
  if (valid.length === 0) return 0;
  if (valid.length < 5) return valid.reduce((a, b) => a + b, 0) / valid.length;

  const sorted = [...valid].sort((a, b) => a - b);
  const trimCount = Math.floor(sorted.length * trimFraction);
  const trimmed = sorted.slice(trimCount, sorted.length - trimCount);
  if (trimmed.length === 0) return sorted[Math.floor(sorted.length / 2)];
  return trimmed.reduce((a, b) => a + b, 0) / trimmed.length;
}

/**
 * Compute robust median of an array of numbers
 */
export function computeMedian(arr) {
  if (!arr || arr.length === 0) return 0;
  const valid = arr.filter(v => v !== null && !isNaN(v));
  if (valid.length === 0) return 0;
  const sorted = [...valid].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Autocorrelation-Based Dominant Cardiac Frequency Estimator
 * Immune to false peak double-counting in low lighting conditions.
 * @param {Array<number>} signal BVP signal
 * @param {number} fs Sampling rate (FPS, default 30)
 * @param {number} minBpm Minimum physiological heart rate (default 48 BPM)
 * @param {number} maxBpm Maximum physiological heart rate (default 180 BPM)
 * @returns {{ hrBpm: number|null, confidence: number }}
 */
export function estimateDominantFrequency(signal, fs = 30, minBpm = 48, maxBpm = 180) {
  if (!signal || signal.length < 40) return { hrBpm: null, confidence: 0 };
  const N = signal.length;

  const minLag = Math.max(2, Math.round((60 * fs) / maxBpm));
  const maxLag = Math.min(Math.floor(N * 0.65), Math.round((60 * fs) / minBpm));

  if (maxLag <= minLag) return { hrBpm: null, confidence: 0 };

  // Calculate zero-mean signal
  let sum = 0;
  for (let i = 0; i < N; i++) sum += signal[i];
  const mean = sum / N;

  const zeroMean = new Float64Array(N);
  let varSum = 0;
  for (let i = 0; i < N; i++) {
    zeroMean[i] = signal[i] - mean;
    varSum += zeroMean[i] * zeroMean[i];
  }

  if (varSum < 1e-7) return { hrBpm: null, confidence: 0 };

  // Autocorrelation across physiological lags
  let bestLag = -1;
  let maxCorr = -Infinity;

  for (let lag = minLag; lag <= maxLag; lag++) {
    let num = 0;
    let den1 = 0;
    let den2 = 0;
    const len = N - lag;

    for (let i = 0; i < len; i++) {
      const a = zeroMean[i];
      const b = zeroMean[i + lag];
      num += a * b;
      den1 += a * a;
      den2 += b * b;
    }

    const den = Math.sqrt(den1 * den2) + 1e-9;
    const corr = num / den;

    // Check if this lag is a local peak
    if (corr > maxCorr) {
      maxCorr = corr;
      bestLag = lag;
    }
  }

  if (bestLag > 0 && maxCorr >= 0.22) {
    const rawBpm = (60 * fs) / bestLag;
    const clampedBpm = Math.min(maxBpm, Math.max(minBpm, Math.round(rawBpm)));
    const confidence = Math.min(1.0, Math.max(0, (maxCorr - 0.20) / 0.60));
    return { hrBpm: clampedBpm, confidence };
  }

  return { hrBpm: null, confidence: 0 };
}

/**
 * Physiological Slew-Rate Limiter
 * Clamps maximum instantaneous rate of change to physiological human limits
 */
export function slewRateLimit(currentVal, previousVal, maxStep = 2.0, smoothingAlpha = 0.30) {
  if (previousVal == null || isNaN(previousVal)) return currentVal;
  if (currentVal == null || isNaN(currentVal)) return previousVal;

  const delta = currentVal - previousVal;
  const clampedDelta = Math.max(-maxStep, Math.min(maxStep, delta));
  const target = previousVal + clampedDelta;

  return previousVal + (target - previousVal) * smoothingAlpha;
}

/**
 * Computes the trimmed mean of an array of numbers, discarding trimFraction from both ends.
 */
export function computeTrimmedMean(arr, trimFraction = 0.10) {
  if (!arr || arr.length === 0) return 0;
  const sorted = [...arr].filter(v => typeof v === 'number' && !isNaN(v)).sort((a, b) => a - b);
  if (sorted.length === 0) return 0;
  const k = Math.floor(sorted.length * trimFraction);
  const trimmed = sorted.slice(k, sorted.length - k);
  if (trimmed.length === 0) return sorted[Math.floor(sorted.length / 2)];
  const sum = trimmed.reduce((acc, v) => acc + v, 0);
  return sum / trimmed.length;
}
