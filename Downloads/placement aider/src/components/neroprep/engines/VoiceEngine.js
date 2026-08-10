/**
 * VoiceEngine — Web Speech API wrapper for real-time STT + TTS.
 * TTS: Indian English female voice (en-IN) with auto-fallback chain.
 */
export class VoiceEngine {
  constructor({ onInterimResult, onFinalResult, onStateChange } = {}) {
    this.onInterimResult = onInterimResult || (() => {});
    this.onFinalResult   = onFinalResult   || (() => {});
    this.onStateChange   = onStateChange   || (() => {});

    this.recognition     = null;
    this.synthesis       = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isListening     = false;
    this.isSpeaking      = false;
    this._shouldRestart  = false;
    this._destroyed      = false;
    this._selectedVoice  = null;   // cached after first resolve

    this._initRecognition();

    // Pre-load voices as soon as the engine starts (async in Chrome)
    if (this.synthesis) {
      if (this.synthesis.getVoices().length > 0) {
        this._selectedVoice = this._pickIndianFemale();
      }
      this.synthesis.onvoiceschanged = () => {
        if (!this._selectedVoice) {
          this._selectedVoice = this._pickIndianFemale();
        }
      };
    }
  }

  // ── Voice selection: Indian English female ─────────────────────────────────
  /**
   * Priority order for Indian English female voices:
   * 1. Exact match: en-IN + female name keywords
   * 2. Any en-IN voice
   * 3. en-GB female (closest accent family)
   * 4. Any female-named English voice
   * 5. Default system voice
   */
  _pickIndianFemale() {
    if (!this.synthesis) return null;
    const voices = this.synthesis.getVoices();
    if (!voices.length) return null;

    const FEMALE_NAMES = ['female', 'woman', 'girl', 'priya', 'aditi', 'heera',
                          'raveena', 'kalpana', 'veena', 'neerja', 'sunita',
                          'zira', 'hazel', 'susan', 'karen', 'moira', 'samantha'];

    const isFemale = (v) => FEMALE_NAMES.some(n => v.name.toLowerCase().includes(n));

    // 1. en-IN female
    const inFemale = voices.find(v => v.lang === 'en-IN' && isFemale(v));
    if (inFemale) { console.log('[VoiceEngine] ✓ Voice:', inFemale.name); return inFemale; }

    // 2. any en-IN
    const inAny = voices.find(v => v.lang === 'en-IN');
    if (inAny)   { console.log('[VoiceEngine] ✓ Voice:', inAny.name); return inAny; }

    // 3. en-GB female (closest to Indian English cadence)
    const gbFemale = voices.find(v => v.lang === 'en-GB' && isFemale(v));
    if (gbFemale) { console.log('[VoiceEngine] ✓ Voice:', gbFemale.name); return gbFemale; }

    // 4. any English female
    const enFemale = voices.find(v => v.lang?.startsWith('en') && isFemale(v));
    if (enFemale) { console.log('[VoiceEngine] ✓ Voice:', enFemale.name); return enFemale; }

    // 5. fallback
    const fallback = voices.find(v => v.lang?.startsWith('en')) || voices[0];
    console.log('[VoiceEngine] fallback voice:', fallback?.name);
    return fallback;
  }

  // ── STT Setup ──────────────────────────────────────────────────────────────
  _initRecognition() {
    if (typeof window === 'undefined') return;

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      console.warn('[VoiceEngine] SpeechRecognition not supported in this browser.');
      return;
    }

    this.recognition = new SR();
    this.recognition.continuous      = true;
    this.recognition.interimResults  = true;
    this.recognition.lang            = 'en-IN';   // Use Indian English for STT too
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      if (this._destroyed) return;
      this.isListening = true;
      this.onStateChange({ type: 'listening', value: true });
    };

    this.recognition.onend = () => {
      if (this._destroyed) return;
      this.isListening = false;
      this.onStateChange({ type: 'listening', value: false });
      if (this._shouldRestart && !this._destroyed) {
        setTimeout(() => {
          if (this._shouldRestart && !this._destroyed && !this.isListening) {
            try {
              this.recognition.start();
            } catch (_) {}
          }
        }, 100);
      }
    };

    this.recognition.onresult = (event) => {
      if (this._destroyed) return;
      let interim = '';
      let final   = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const text = event.results[i][0].transcript;
        if (event.results[i].isFinal) final   += text;
        else                          interim += text;
      }
      if (interim) this.onInterimResult(interim);
      if (final)   this.onFinalResult(final.trim());
    };

    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        // Normal pause or interruption — recognition will restart on onend
        return;
      }
      console.warn('[VoiceEngine] STT error:', event.error);
    };
  }

  // ── Public STT API ─────────────────────────────────────────────────────────
  startListening() {
    if (!this.recognition || this._destroyed) return;
    this._shouldRestart = true;
    if (this.isListening) return;
    try {
      this.recognition.start();
    } catch (_) {}
  }

  stopListening() {
    this._shouldRestart = false;
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }
  }

  // ── TTS: Indian English female ─────────────────────────────────────────────
  /**
   * Speak text with Indian English female voice.
   * Rate 0.92 + pitch 1.1 give a natural, clear cadence close to Indian English.
   */
  speak(text, { rate = 0.92, pitch = 1.1 } = {}) {
    if (!this.synthesis || !text || this._destroyed) return Promise.resolve();

    this.synthesis.cancel();

    return new Promise((resolve) => {
      const utterance  = new SpeechSynthesisUtterance(text);
      utterance.lang   = 'en-IN';
      utterance.rate   = rate;
      utterance.pitch  = pitch;
      utterance.volume = 1.0;

      // Assign the best available Indian English female voice
      const voice = this._selectedVoice || this._pickIndianFemale();
      if (voice) utterance.voice = voice;

      utterance.onstart = () => {
        if (this._destroyed) { this.synthesis.cancel(); resolve(); return; }
        this.isSpeaking = true;
        this.onStateChange({ type: 'speaking', value: true });
      };
      utterance.onend = () => {
        this.isSpeaking = false;
        this.onStateChange({ type: 'speaking', value: false });
        resolve();
      };
      utterance.onerror = (e) => {
        if (e.error !== 'interrupted') console.warn('[VoiceEngine] TTS error:', e.error);
        this.isSpeaking = false;
        this.onStateChange({ type: 'speaking', value: false });
        resolve();
      };

      // Chrome bug: speechSynthesis can pause itself — keepalive workaround
      this._ttsKeepalive = setInterval(() => {
        if (this.synthesis.speaking) {
          this.synthesis.pause();
          this.synthesis.resume();
        } else {
          clearInterval(this._ttsKeepalive);
        }
      }, 10000);

      this.synthesis.speak(utterance);
    });
  }

  getVoices() {
    return this.synthesis?.getVoices() || [];
  }

  destroy() {
    this._destroyed     = true;
    this._shouldRestart = false;
    clearInterval(this._ttsKeepalive);
    try { this.recognition?.abort(); } catch (_) {}
    try { this.synthesis?.cancel();  } catch (_) {}
  }
}

export default VoiceEngine;
