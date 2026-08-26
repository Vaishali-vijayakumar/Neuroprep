/**
 * VocalIntelligenceEngine
 * ========================
 * Hybrid audio intelligence pipeline — browser side.
 *
 * Architecture:
 *   MediaStream (mic) ──► AudioWorklet (PCM capture)
 *        │                       │
 *        │              Float32 PCM frames (16kHz)
 *        │                       │
 *        │               WebSocket binary stream
 *        │                       │
 *        │              Backend: Whisper + RoBERTa + Librosa
 *        │                       │
 *        └──► Web Speech API ────┴──► onResults callback
 *              (interim text)         (full analysis)
 *
 * Emits via onAnalysis(result):
 * {
 *   transcript:   { text, confidence, word_count, duration_s }
 *   text_emotion: { fear, joy, sadness, anger, ..., text_stress_score }
 *   acoustic:     { mfcc_variance, pitch_std_hz, jitter, acoustic_stress_score }
 *   vocal_stress: { vocal_stress_score, tier, components }
 *   filler_words: ['um', 'like', ...]
 * }
 */

const SAMPLE_RATE     = 16000;  // Whisper expects 16kHz
const BUFFER_SIZE     = 4096;   // AudioWorklet buffer size
const WS_BASE         = import.meta.env.VITE_WS_URL || 'ws://localhost:8000';

// ── Inline AudioWorklet processor code (runs in audio thread) ────────────────
const WORKLET_CODE = `
class PcmCapture extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buf = [];
    this._targetRate = 16000;
    this._srcRate = sampleRate;   // browser's native sample rate
  }

  process(inputs) {
    const ch = inputs[0]?.[0];
    if (!ch) return true;

    // Downsample to 16kHz if needed
    if (this._srcRate !== this._targetRate) {
      const ratio    = this._srcRate / this._targetRate;
      const outLen   = Math.floor(ch.length / ratio);
      const resampled = new Float32Array(outLen);
      for (let i = 0; i < outLen; i++) {
        resampled[i] = ch[Math.floor(i * ratio)];
      }
      this._buf.push(...resampled);
    } else {
      this._buf.push(...ch);
    }

    // Flush in ~500ms chunks (8000 samples at 16kHz)
    if (this._buf.length >= 8000) {
      const chunk = new Float32Array(this._buf.splice(0, 8000));
      this.port.postMessage({ pcm: chunk.buffer }, [chunk.buffer]);
    }
    return true;
  }
}
registerProcessor('pcm-capture', PcmCapture);
`;

export class VocalIntelligenceEngine {
  /**
   * @param {MediaStream} stream  — mic MediaStream
   * @param {string}      sessionId
   * @param {object}      options
   * @param {Function}    options.onAnalysis  — called with full pipeline result
   * @param {Function}    options.onTranscript — called with interim/final transcript text
   * @param {Function}    options.onError
   */
  constructor(stream, sessionId, { onAnalysis, onTranscript, onError } = {}) {
    this.stream       = stream;
    this.sessionId    = sessionId;
    this.onAnalysis   = onAnalysis   || (() => {});
    this.onTranscript = onTranscript || (() => {});
    this.onError      = onError      || console.warn;

    this._ws          = null;
    this._audioCtx    = null;
    this._workletNode = null;
    this._source      = null;
    this._running     = false;
    this._faceStress  = 0;   // updated externally via setFaceStress()

    // Web Speech API for immediate interim display (while Whisper processes)
    this._stt         = null;
    this._interimText = '';
    this._finalText   = '';

    this._latestAnalysis = null;
  }

  // ── Public API ──────────────────────────────────────────────────────────────

  async start() {
    if (this._running) return;
    try {
      await this._connectWebSocket();
      await this._startAudioCapture();
      this._startWebSpeechFallback();
      this._running = true;
    } catch (err) {
      this.onError(`[VocalEngine] start failed: ${err.message}`);
    }
  }

  stop() {
    this._running = false;
    this._flushBuffer();
    this._teardownAudio();
    this._teardownWebSpeech();
    if (this._ws?.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ type: 'end' }));
      this._ws.close();
    }
  }

  /** Call whenever FaceEngine emits a new stress score */
  setFaceStress(score) {
    this._faceStress = score;
    if (this._ws?.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ type: 'face_stress', stress: score }));
    }
  }

  /** Get latest full analysis result */
  getLatestAnalysis() {
    return this._latestAnalysis;
  }

  // ── WebSocket ───────────────────────────────────────────────────────────────

  async _connectWebSocket() {
    return new Promise((resolve, reject) => {
      const url = `${WS_BASE}/ws/audio/${this.sessionId}`;
      this._ws  = new WebSocket(url);
      this._ws.binaryType = 'arraybuffer';

      const timeout = setTimeout(() => reject(new Error('WS connect timeout')), 5000);

      this._ws.onopen = () => {
        clearTimeout(timeout);
        console.log('[VocalEngine] WebSocket connected:', url);
        resolve();
      };

      this._ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'audio_analysis') {
            this._latestAnalysis = msg;
            this.onAnalysis(msg);
            // Update interim transcript from Whisper result
            if (msg.transcript?.text?.trim()) {
              this.onTranscript(msg.transcript.text, 'final');
            }
          }
        } catch (_) {}
      };

      this._ws.onerror = (ev) => {
        clearTimeout(timeout);
        this.onError('[VocalEngine] WebSocket error — falling back to Web Speech API only');
        reject(new Error('WebSocket failed'));
      };

      this._ws.onclose = () => {
        console.log('[VocalEngine] WebSocket closed');
      };
    });
  }

  // ── AudioWorklet PCM capture ────────────────────────────────────────────────

  async _startAudioCapture() {
    this._audioCtx = new (window.AudioContext || window.webkitAudioContext)({
      sampleRate: SAMPLE_RATE,   // request 16kHz directly when possible
    });

    // Load the worklet inline (no extra file needed)
    const blob = new Blob([WORKLET_CODE], { type: 'application/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    await this._audioCtx.audioWorklet.addModule(blobUrl);
    URL.revokeObjectURL(blobUrl);

    this._source      = this._audioCtx.createMediaStreamSource(this.stream);
    this._workletNode = new AudioWorkletNode(this._audioCtx, 'pcm-capture');

    this._workletNode.port.onmessage = (ev) => {
      if (!this._running) return;
      if (this._ws?.readyState === WebSocket.OPEN) {
        // Send raw PCM as binary to backend
        this._ws.send(ev.data.pcm);
      }
    };

    this._source.connect(this._workletNode);
    // Do NOT connect to destination — we only want to process, not play back
    console.log('[VocalEngine] AudioWorklet PCM capture started');
  }

  _flushBuffer() {
    if (this._ws?.readyState === WebSocket.OPEN) {
      this._ws.send(JSON.stringify({ type: 'flush' }));
    }
  }

  _teardownAudio() {
    try {
      this._workletNode?.disconnect();
      this._source?.disconnect();
      this._audioCtx?.close();
    } catch (_) {}
  }

  // ── Web Speech API (instant interim text display only) ────────────────────
  // Whisper runs every 3s; Web Speech fills the gap with instant interim text.

  _startWebSpeechFallback() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    this._stt = new SpeechRecognition();
    this._stt.continuous      = true;
    this._stt.interimResults  = true;
    this._stt.lang            = 'en-US';
    this._stt.maxAlternatives = 1;

    this._stt.onresult = (event) => {
      let interim = '';
      let final   = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) final += t;
        else interim += t;
      }
      // Only emit interim here — Whisper provides the authoritative final text
      if (interim) this.onTranscript(interim, 'interim');
    };

    this._stt.onerror = () => {};   // silent — Whisper is the primary

    this._stt.onend = () => {
      if (this._running) {
        try { this._stt?.start(); } catch (_) {}
      }
    };

    try {
      this._stt.start();
    } catch (_) {}
  }

  _teardownWebSpeech() {
    try { this._stt?.stop(); } catch (_) {}
    this._stt = null;
  }
}

export default VocalIntelligenceEngine;
