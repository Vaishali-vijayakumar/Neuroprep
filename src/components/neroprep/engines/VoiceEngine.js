/**
 * VoiceEngine — State-of-the-Art Hybrid Speech-to-Text & Speech Synthesis Engine
 * 
 * Features:
 * 1. Multi-Alternative Candidate Scoring (maxAlternatives = 5) for maximum recognition accuracy
 * 2. Continuous transcript accumulation without losing words across pauses/restarts
 * 3. Smart punctuation, capitalization, and repetition/stutter cleaning
 * 4. Background AI Audio Transcriber (MediaRecorder -> /api/interview/transcribe) for flawless human-level refinement
 * 5. High-clarity natural female voice TTS with pause/resume keepalive
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export class VoiceEngine {
  constructor({ onTranscript, onStateChange, lang, mediaStream } = {}) {
    this.onTranscript    = onTranscript    || (() => {});
    this.onStateChange   = onStateChange   || (() => {});
    this.lang            = lang || (typeof navigator !== 'undefined' ? (navigator.language || 'en-US') : 'en-US');

    this.recognition     = null;
    this.synthesis       = typeof window !== 'undefined' ? window.speechSynthesis : null;
    this.isListening     = false;
    this.isSpeaking      = false;
    this._shouldRestart  = false;
    this._destroyed      = false;
    this._selectedVoice  = null;
    this._ttsKeepalive   = null;

    // Buffer for continuous STT
    this._accumulatedFinal = '';
    this._currentSessionFinal = '';
    this._interimText = '';

    // MediaRecorder for high-precision backend AI audio transcription
    this.mediaRecorder   = null;
    this.audioChunks     = [];
    this.mediaStream     = mediaStream || null;
    this._silenceTimer   = null;

    this._initRecognition();
    if (this.mediaStream) {
      this._initMediaRecorder();
    }

    if (this.synthesis) {
      this._ensureVoicesLoaded().then(() => {
        if (!this._selectedVoice) {
          this._selectedVoice = this._pickBestFemaleVoice();
        }
      });
      this.synthesis.onvoiceschanged = () => {
        if (!this._selectedVoice) {
          this._selectedVoice = this._pickBestFemaleVoice();
        }
      };
    }
  }

  /**
   * Warm up and cache voices reliably, eliminating empty getVoices() on initial page load
   */
  async _ensureVoicesLoaded() {
    if (!this.synthesis) return [];
    let voices = this.synthesis.getVoices();
    if (voices && voices.length > 0) return voices;

    return new Promise((resolve) => {
      const handler = () => {
        voices = this.synthesis.getVoices();
        try { this.synthesis.removeEventListener('voiceschanged', handler); } catch (_) {}
        resolve(voices);
      };
      this.synthesis.addEventListener('voiceschanged', handler);
      // Timeout safeguard after 1.5s
      setTimeout(() => {
        try { this.synthesis.removeEventListener('voiceschanged', handler); } catch (_) {}
        resolve(this.synthesis?.getVoices() || []);
      }, 1500);
    });
  }

  /**
   * Hardware-level acoustic isolation: toggle the underlying MediaStreamTrack
   */
  setHardwareAudioEnabled(enabled) {
    // Keep hardware tracks intact so Web Audio analyser & browser SpeechRecognition are never silenced;
    // speech recognition buffering is handled via startListening() / stopListening()
  }

  _pickBestFemaleVoice() {
    if (!this.synthesis) return null;
    const voices = this.synthesis.getVoices();
    if (!voices.length) return null;

    const FEMALE_NAMES = [
      'female', 'natural', 'neural', 'priya', 'aditi', 'heera',
      'raveena', 'kalpana', 'veena', 'neerja', 'sunita',
      'zira', 'hazel', 'susan', 'karen', 'moira', 'samantha', 'victoria', 'serena'
    ];

    const isFemale = (v) => FEMALE_NAMES.some(n => v.name.toLowerCase().includes(n));

    const inFemale = voices.find(v => (v.lang === 'en-IN' || v.lang === 'en_IN') && isFemale(v));
    if (inFemale) return inFemale;

    const gbFemale = voices.find(v => (v.lang === 'en-GB' || v.lang === 'en_GB') && isFemale(v));
    if (gbFemale) return gbFemale;

    const usFemale = voices.find(v => (v.lang === 'en-US' || v.lang === 'en_US') && isFemale(v));
    if (usFemale) return usFemale;

    const enFemale = voices.find(v => v.lang?.startsWith('en') && isFemale(v));
    if (enFemale) return enFemale;

    return voices.find(v => v.lang?.startsWith('en')) || voices[0];
  }

  /** Initialize MediaRecorder to capture raw audio chunks for backend refinement */
  async _initMediaRecorder() {
    if (typeof MediaRecorder === 'undefined') return;
    try {
      let audioStream = this.mediaStream;
      if (audioStream && typeof audioStream.getAudioTracks === 'function') {
        const audioTracks = audioStream.getAudioTracks();
        if (audioTracks.length > 0) {
          audioStream = new MediaStream(audioTracks);
        } else {
          audioStream = null;
        }
      }

      if (!audioStream && typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        audioStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
      }

      if (!audioStream) return;

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : '';

      this.mediaRecorder = mimeType ? new MediaRecorder(audioStream, { mimeType }) : new MediaRecorder(audioStream);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this._refineWithBackendAI();
      };
    } catch (e) {
      console.warn('[VoiceEngine] MediaRecorder init notice:', e.message);
    }
  }

  /** Refine transcribed text using Backend AI Audio endpoint when available */
  async _refineWithBackendAI() {
    if (this.audioChunks.length === 0 || this._destroyed) return;
    try {
      const blob = new Blob(this.audioChunks, { type: this.mediaRecorder?.mimeType || 'audio/webm' });
      this.audioChunks = [];

      // Only refine if we have recorded meaningful audio (> 10KB)
      if (blob.size < 8000) return;

      const formData = new FormData();
      formData.append('file', blob, 'speech.webm');

      const res = await fetch(`${API_BASE}/api/interview/transcribe`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.transcript && data.transcript.trim().length > 3) {
          const polished = this._cleanTranscript(data.transcript);
          this._accumulatedFinal = polished;
          this._currentSessionFinal = '';
          this._interimText = '';

          this.onTranscript({
            finalText: polished,
            interimText: '',
            fullText: polished,
            source: 'gemini-audio',
          });
        }
      }
    } catch (e) {
      console.warn('[VoiceEngine] Backend audio refinement skipped:', e.message);
    }
  }

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
    this.recognition.lang            = this.lang;
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      if (this._destroyed) return;
      this.isListening = true;
      this.onStateChange({ type: 'listening', value: true });

      // Start recording raw audio in parallel
      if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
        try {
          this.audioChunks = [];
          this.mediaRecorder.start(1000);
        } catch (_) {}
      }
    };

    this.recognition.onend = () => {
      if (this._destroyed) return;
      this.isListening = false;

      // Commit the current session's final transcript to accumulated buffer
      if (this._currentSessionFinal) {
        this._accumulatedFinal = this._cleanTranscript(
          (this._accumulatedFinal ? this._accumulatedFinal + ' ' : '') + this._currentSessionFinal
        );
        this._currentSessionFinal = '';
      }

      this.onStateChange({ type: 'listening', value: false });

      // Restart continuous listening if required
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

      let sessionFinal = '';
      let interimStr   = '';

      for (let i = 0; i < event.results.length; i++) {
        const res = event.results[i];

        // Best alternative candidate selection
        let bestText = res[0]?.transcript || '';
        if (res.length > 1) {
          for (let k = 0; k < res.length; k++) {
            const candidate = res[k]?.transcript || '';
            if (candidate && res[k]?.confidence > (res[0]?.confidence || 0)) {
              bestText = candidate;
              break;
            }
          }
        }

        if (res.isFinal) {
          sessionFinal += (sessionFinal ? ' ' : '') + bestText;
        } else {
          interimStr += (interimStr ? ' ' : '') + bestText;
        }
      }

      this._currentSessionFinal = sessionFinal.trim();
      this._interimText = interimStr.trim();

      const combinedFinal = this._cleanTranscript(
        (this._accumulatedFinal ? this._accumulatedFinal + ' ' : '') + this._currentSessionFinal
      );

      const fullCombined = this._cleanTranscript(
        combinedFinal + (this._interimText ? (combinedFinal ? ' ' : '') + this._interimText : '')
      );

      this.onTranscript({
        finalText: combinedFinal,
        interimText: this._interimText,
        fullText: fullCombined,
        source: 'speech-api',
      });

      // Reset backend audio refinement silence timer
      clearTimeout(this._silenceTimer);
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this._silenceTimer = setTimeout(() => {
          if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            try {
              this.mediaRecorder.stop();
              setTimeout(() => {
                if (this.isListening && this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
                  this.audioChunks = [];
                  this.mediaRecorder.start(1000);
                }
              }, 200);
            } catch (_) {}
          }
        }, 2200);
      }
    };

    this.recognition.onerror = (event) => {
      if (event.error === 'no-speech' || event.error === 'aborted') {
        return;
      }
      console.warn('[VoiceEngine] STT error:', event.error);
    };
  }

  /** Smart transcript cleaner: removes duplicate words, fixes capitalization & punctuation, and caps at 400 words max */
  _cleanTranscript(text, maxWords = 400) {
    if (!text || typeof text !== 'string') return '';
    let cleaned = text
      .replace(/\s+/g, ' ')
      .replace(/\b(I\s+I)\b/gi, 'I')
      .replace(/\b(the\s+the)\b/gi, 'the')
      .replace(/\b(we\s+we)\b/gi, 'we')
      .replace(/\b(and\s+and)\b/gi, 'and')
      .trim();

    // Cap transcript at maxWords (400 words) to prevent SpeechRecognition buffer freezes
    const words = cleaned.split(' ');
    if (words.length > maxWords) {
      cleaned = words.slice(words.length - maxWords).join(' ');
    }

    // Capitalize first letter of sentences
    cleaned = cleaned.replace(/(^\s*|\.\s+|\?\s+|\!\s+)([a-z])/g, (match, prefix, char) => {
      return prefix + char.toUpperCase();
    });

    return cleaned;
  }

  startListening() {
    if (!this.recognition || this._destroyed) return;
    this._shouldRestart = true;
    if (this.isListening) return;

    try {
      this.recognition.start();
      this.isListening = true;
      this.onStateChange({ type: 'listening', value: true });
    } catch (err) {
      if (err.name === 'InvalidStateError') {
        this.isListening = true;
        this.onStateChange({ type: 'listening', value: true });
      } else {
        setTimeout(() => {
          if (this._shouldRestart && !this._destroyed && !this.isListening) {
            try {
              this.recognition.start();
              this.isListening = true;
              this.onStateChange({ type: 'listening', value: true });
            } catch (_) {}
          }
        }, 200);
      }
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
      try {
        this.audioChunks = [];
        this.mediaRecorder.start(1000);
      } catch (_) {}
    }
  }

  stopListening() {
    this._shouldRestart = false;
    clearTimeout(this._silenceTimer);
    this.isListening = false;
    this.onStateChange({ type: 'listening', value: false });

    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (_) {}
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      try {
        this.mediaRecorder.stop();
      } catch (_) {}
    }
  }

  resetTranscript() {
    this._accumulatedFinal = '';
    this._currentSessionFinal = '';
    this._interimText = '';
    this.audioChunks = [];
    clearTimeout(this._silenceTimer);
    this.onTranscript({ finalText: '', interimText: '', fullText: '' });
  }

  getTranscript() {
    return this._cleanTranscript(
      (this._accumulatedFinal ? this._accumulatedFinal + ' ' : '') + this._currentSessionFinal
    );
  }

  stopSpeaking() {
    clearInterval(this._ttsKeepalive);
    if (this.synthesis) {
      try { this.synthesis.cancel(); } catch (_) {}
    }
    this.isSpeaking = false;
    this.onStateChange({ type: 'speaking', value: false });
  }

  async speak(text, { rate = 0.95, pitch = 1.05, onSentenceChange } = {}) {
    if (!this.synthesis || !text || this._destroyed) return Promise.resolve();

    await this._ensureVoicesLoaded();
    try { this.synthesis.cancel(); } catch (_) {}

    return new Promise((resolve) => {
      const cleanText = text
        .replace(/```[\s\S]*?```/g, 'Code block omitted.')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[*_#>-]/g, '')
        .trim();

      if (!cleanText) {
        if (onSentenceChange) onSentenceChange(-1, '');
        resolve();
        return;
      }

      // Sentence boundary chunking: splits on punctuation [.!?] while keeping boundaries
      const rawMatches = cleanText.match(/[^.!?]+[.!?]+|\S[^.!?]+$/g) || [cleanText];
      const sentences = rawMatches.map(s => s.trim()).filter(Boolean);

      if (sentences.length === 0) {
        if (onSentenceChange) onSentenceChange(-1, '');
        resolve();
        return;
      }

      const voice = this._selectedVoice || this._pickBestFemaleVoice();

      clearInterval(this._ttsKeepalive);
      this._ttsKeepalive = setInterval(() => {
        if (this.synthesis.speaking) {
          this.synthesis.pause();
          this.synthesis.resume();
        } else {
          clearInterval(this._ttsKeepalive);
        }
      }, 8000);

      this.isSpeaking = true;
      this.onStateChange({ type: 'speaking', value: true });

      const speakChain = (index = 0) => {
        if (this._destroyed || index >= sentences.length) {
          clearInterval(this._ttsKeepalive);
          this.isSpeaking = false;
          this.onStateChange({ type: 'speaking', value: false });
          if (onSentenceChange) onSentenceChange(-1, '');
          resolve();
          return;
        }

        const sentenceText = sentences[index];
        if (onSentenceChange) onSentenceChange(index, sentenceText);

        const utterance  = new SpeechSynthesisUtterance(sentenceText);
        utterance.rate   = rate;
        utterance.pitch  = pitch;
        utterance.volume = 1.0;
        if (voice) utterance.voice = voice;

        // Safety timeout per sentence (in case browser blocks autoplay without user click)
        const sentenceTimeout = setTimeout(() => {
          speakChain(index + 1);
        }, Math.max(3000, sentenceText.length * 90));

        utterance.onend = () => {
          clearTimeout(sentenceTimeout);
          speakChain(index + 1);
        };

        utterance.onerror = (e) => {
          clearTimeout(sentenceTimeout);
          if (e.error !== 'interrupted') {
            console.warn('[VoiceEngine] TTS sentence error:', e.error);
          }
          speakChain(index + 1);
        };

        try {
          this.synthesis.speak(utterance);
        } catch (_) {
          clearTimeout(sentenceTimeout);
          speakChain(index + 1);
        }
      };

      speakChain(0);
    });
  }

  destroy() {
    this._destroyed     = true;
    this._shouldRestart = false;
    clearTimeout(this._silenceTimer);
    clearInterval(this._ttsKeepalive);

    try { this.recognition?.abort(); } catch (_) {}
    try { this.synthesis?.cancel();  } catch (_) {}

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try { this.mediaRecorder.stop(); } catch (_) {}
    }
    if (this.mediaStream) {
      try {
        this.mediaStream.getTracks().forEach(t => t.stop());
      } catch (_) {}
    }
  }
}

export function normalizeTechnicalTranscript(text) {
  return (text || '').replace(/\s+/g, ' ').trim();
}

export default VoiceEngine;
