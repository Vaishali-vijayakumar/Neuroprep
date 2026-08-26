/**
 * AudioAnalyser — Uses the Web Audio API to analyse the user's microphone stream
 * for voice metrics: volume, estimated pitch (frequency), and speaking speed.
 * These signals feed into the cognitive stress scoring model.
 */
export class AudioAnalyser {
  constructor(stream, { onMetrics } = {}) {
    this.onMetrics     = onMetrics || (() => {});
    this.animFrame     = null;
    this.wordTimings   = [];   // timestamps of detected voice activity starts
    this.silenceStart  = null;
    this.isSpeaking    = false;
    this.fillerWords   = ['um', 'uh', 'like', 'you know', 'basically', 'literally', 'actually', 'so', 'well'];
    this.fillerCount   = 0;

    try {
      this.context  = new (window.AudioContext || window.webkitAudioContext)();
      const source  = this.context.createMediaStreamSource(stream);

      // Analyser for volume + frequency
      this.analyser = this.context.createAnalyser();
      this.analyser.fftSize           = 2048;
      this.analyser.smoothingTimeConstant = 0.8;
      source.connect(this.analyser);

      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
      this._loop();
    } catch (err) {
      console.warn('AudioAnalyser: Could not initialise AudioContext:', err.message);
    }
  }

  _loop() {
    this.animFrame = requestAnimationFrame(() => this._loop());
    if (!this.analyser) return;

    this.analyser.getByteFrequencyData(this.dataArray);

    // Volume (0–100)
    const volume = Math.round((this.dataArray.reduce((a, b) => a + b, 0) / this.dataArray.length) * (100 / 255));

    // Voice Activity Detection (simple energy threshold)
    const isVoice = volume > 8;
    const now     = Date.now();

    if (isVoice && !this.isSpeaking) {
      this.isSpeaking    = true;
      this.wordTimings.push(now);
      if (this.wordTimings.length > 30) this.wordTimings.shift(); // keep last 30
    } else if (!isVoice && this.isSpeaking) {
      this.isSpeaking   = false;
      this.silenceStart = now;
    }

    // Speaking speed — words per minute approximation
    const recentWords = this.wordTimings.filter(t => now - t < 60_000);
    const wpm         = recentWords.length;  // bursts per minute as proxy

    // Dominant frequency (pitch estimate)
    let maxVal = 0, maxIndex = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      if (this.dataArray[i] > maxVal) { maxVal = this.dataArray[i]; maxIndex = i; }
    }
    const pitch = Math.round((maxIndex * this.context.sampleRate) / this.analyser.fftSize);

    // Silence duration (ms) — long silences → stress indicator
    const silenceDuration = (!isVoice && this.silenceStart) ? now - this.silenceStart : 0;

    this.onMetrics({ volume, pitch, wpm, silenceDuration, isVoice });
  }

  checkForFillers(transcript) {
    const lower = transcript.toLowerCase();
    const found = this.fillerWords.filter(f => lower.includes(f));
    this.fillerCount += found.length;
    return { fillerCount: this.fillerCount, found };
  }

  destroy() {
    if (this.animFrame) cancelAnimationFrame(this.animFrame);
    try { this.context?.close(); } catch (_) {}
  }
}

export default AudioAnalyser;
