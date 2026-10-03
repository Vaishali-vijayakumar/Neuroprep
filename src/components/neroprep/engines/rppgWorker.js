/**
 * rppgWorker.js — Web Worker for Background rPPG & DSP Processing
 * ───────────────────────────────────────────────────────────────
 * Offloads POS matrix calculations, Butterworth bandpass filtering,
 * and peak detection off the main UI thread to prevent UI micro-stutters.
 */

// Simple self-contained Butterworth bandpass filter for Web Worker context
class WorkerButterworth {
  constructor() {
    // 4th-order 0.75 - 3.5 Hz @ 30 FPS coefficients
    this.b1 = [0.067455, 0.0, -0.13491, 0.0, 0.067455];
    this.a1 = [1.0, -2.85437, 3.25368, -1.75841, 0.38421];
    this.w1 = [0, 0, 0, 0, 0];
  }

  process(signal) {
    if (!signal || signal.length < 5) return signal || [];
    const N = signal.length;
    const out = new Float64Array(N);
    this.w1.fill(0);

    for (let i = 0; i < N; i++) {
      const x = signal[i];
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

class WorkerPOS {
  constructor(windowSize = 120, fps = 30) {
    this.windowSize = windowSize;
    this.fps = fps;
    this.rgbBuffer = [];
    this.filter = new WorkerButterworth();
    this.hrHistory = [];
    this.hrvHistory = [];
  }

  update(rgb) {
    if (!rgb) return null;
    this.rgbBuffer.push(rgb);
    if (this.rgbBuffer.length > this.windowSize) {
      this.rgbBuffer.shift();
    }

    const N = this.rgbBuffer.length;
    if (N < 45) return { hrBpm: null, hrvMs: null, bvp: [] };

    const mean = arr => arr.reduce((a, b) => a + b, 0) / arr.length;
    const std = arr => {
      const m = mean(arr);
      return Math.sqrt(arr.reduce((a, b) => a + (b - m) ** 2, 0) / arr.length) + 1e-9;
    };

    const R = this.rgbBuffer.map(c => c[0]);
    const G = this.rgbBuffer.map(c => c[1]);
    const B = this.rgbBuffer.map(c => c[2]);

    const mR = mean(R), mG = mean(G), mB = mean(B);
    if (mR < 1 || mG < 1 || mB < 1) return { hrBpm: null, hrvMs: null, bvp: [] };

    const nR = R.map(v => v / mR - 1);
    const nG = G.map(v => v / mG - 1);
    const nB = B.map(v => v / mB - 1);

    // Plane-Orthogonal-to-Skin projection
    const S1 = nG.map((g, i) => g - nB[i]);
    const S2 = nG.map((g, i) => g + nB[i] - 2 * nR[i]);
    const alpha = std(S1) / std(S2);
    const rawBvp = S1.map((s, i) => s + alpha * S2[i]);

    // Apply Butterworth bandpass filtering (0.75Hz - 3.5Hz)
    const cleanBvp = this.filter.process(rawBvp);

    // Moving average detrending
    const bvpMean = mean(cleanBvp);
    const bvpStd = std(cleanBvp);
    const threshold = bvpMean + 0.30 * bvpStd;
    const minGap = Math.round(this.fps * 0.40); // min 400ms between beats

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

    if (peaks.length < 2) {
      return {
        hrBpm: this.hrHistory.length > 0 ? Math.round(mean(this.hrHistory)) : null,
        hrvMs: this.hrvHistory.length > 0 ? Math.round(mean(this.hrvHistory)) : null,
        bvp: cleanBvp
      };
    }

    const ibis = [];
    for (let i = 1; i < peaks.length; i++) {
      const ibiMs = ((peaks[i] - peaks[i-1]) / this.fps) * 1000;
      if (ibiMs >= 350 && ibiMs <= 1800) {
        ibis.push(ibiMs);
      }
    }

    if (ibis.length === 0) {
      return { hrBpm: null, hrvMs: null, bvp: cleanBvp };
    }

    const avgIbi = mean(ibis);
    const rawHr = Math.round(60000 / avgIbi);

    let rawHrv = null;
    if (ibis.length > 1) {
      let ssd = 0;
      for (let i = 1; i < ibis.length; i++) {
        ssd += (ibis[i] - ibis[i-1]) ** 2;
      }
      rawHrv = Math.round(Math.sqrt(ssd / (ibis.length - 1)));
    }

    this.hrHistory.push(rawHr);
    if (this.hrHistory.length > 8) this.hrHistory.shift();
    if (rawHrv !== null) {
      this.hrvHistory.push(rawHrv);
      if (this.hrvHistory.length > 8) this.hrvHistory.shift();
    }

    return {
      hrBpm: Math.round(mean(this.hrHistory)),
      hrvMs: this.hrvHistory.length > 0 ? Math.round(mean(this.hrvHistory)) : null,
      bvp: cleanBvp
    };
  }
}

const pos = new WorkerPOS(120, 30);

self.onmessage = (e) => {
  const { type, rgb, timestamp } = e.data;
  if (type === 'PROCESS_FRAME') {
    const result = pos.update(rgb);
    self.postMessage({
      ...result,
      timestamp
    });
  }
};
