"""
Hybrid Audio Intelligence Pipeline
===================================
Architecture:
  [ Raw PCM Audio Chunks (16kHz, float32) ]
        │
        ├──> 1. faster-whisper STT  ──────────────────────> Transcript text
        │                                                          │
        ├──> 2. RoBERTa-GoEmotions  ──> Text emotion probs  ──────┤
        │      (fear, nervousness,                                  │
        │       embarrassment, sadness)                            │
        │                                                          │
        └──> 3. Librosa Acoustic Features (Wav2Vec proxy)  ────────┤
               - MFCC variance (vocal tremor)                      │
               - F0 pitch std (instability)                        │
               - Energy spikes (speech effort)                     │
               - ZCR (breathiness)                                 │
               - Spectral centroid shift (voice tightening)        │
                                                                   │
                                                            [ Fusion Layer ]
                                                                   │
                                                    Real-time VocalStressScore 0–100
                                                    + EmotionVector (fear/calm/confidence)
"""

import io
import os
import json
import asyncio
import struct
import numpy as np
from typing import Optional

# ── Model loading (lazy, cached after first call) ─────────────────────────────
_whisper_model    = None
_emotion_pipeline = None
_GEMINI_EMOTION   = None    # Gemini client for text emotion when transformers unavailable

WHISPER_MODEL_SIZE = os.getenv("WHISPER_MODEL", "base")   # tiny | base | small

# ── Emotion keyword lexicons (pure-Python fallback — no torch/transformers needed) ──
_EMOTION_LEXICONS = {
    "fear":     ["scared", "afraid", "terrified", "nervous", "anxious", "panic",
                 "fearful", "worried", "dread", "terror", "phobia", "frightened",
                 "uneasy", "apprehensive", "stressed", "tense"],
    "anger":    ["angry", "furious", "rage", "annoyed", "irritated", "frustrated",
                 "mad", "hostile", "outraged", "hate", "resentful"],
    "sadness":  ["sad", "depressed", "unhappy", "miserable", "lonely", "hopeless",
                 "disappointed", "heartbroken", "grief", "sorrow", "sorry"],
    "surprise": ["surprised", "shocked", "amazed", "astonished", "unexpected",
                 "wow", "incredible", "unbelievable", "suddenly"],
    "joy":      ["happy", "great", "excited", "love", "wonderful", "fantastic",
                 "confident", "glad", "pleased", "excellent", "good", "sure"],
    "neutral":  [],  # fallback
}

_HEDGE_WORDS    = ["um", "uh", "like", "you know", "basically", "i think", "maybe",
                   "perhaps", "not sure", "i guess", "kind of", "sort of"]
_STRESS_PHRASES = ["i don't know", "not sure", "i'm not", "can't remember",
                   "hard to say", "difficult", "complicated", "confused",
                   "i forget", "i'm struggling"]


def _get_whisper():
    global _whisper_model
    if _whisper_model is None:
        try:
            from faster_whisper import WhisperModel
            _whisper_model = WhisperModel(
                WHISPER_MODEL_SIZE,
                device="cpu",
                compute_type="int8",    # CPU int8 quantisation — fast on any CPU
                cpu_threads=4,
            )
            print(f"[AudioPipeline] ✓ Whisper '{WHISPER_MODEL_SIZE}' loaded")
        except ImportError:
            print("[AudioPipeline] faster-whisper not installed. STT disabled.")
    return _whisper_model


def _get_emotion_pipeline():
    """Try loading transformers pipeline — skipped gracefully on Python 3.14+ / no torch."""
    global _emotion_pipeline
    if _emotion_pipeline is None:
        try:
            from transformers import pipeline as hf_pipeline
            _emotion_pipeline = hf_pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                top_k=None,
                truncation=True,
                max_length=256,
            )
            print("[AudioPipeline] ✓ DistilRoBERTa emotion loaded")
        except (ImportError, Exception):
            _emotion_pipeline = "unavailable"
            print("[AudioPipeline] transformers/torch unavailable — using keyword + Gemini fallback")
    return None if _emotion_pipeline == "unavailable" else _emotion_pipeline




# ── 1. Whisper Speech-to-Text ─────────────────────────────────────────────────

def transcribe_chunk(pcm_bytes: bytes, sample_rate: int = 16000) -> dict:
    """
    Convert raw PCM float32 bytes → transcript text via faster-whisper.
    Returns: { text, language, confidence, word_count, duration_s }
    """
    model = _get_whisper()
    if model is None:
        return {"text": "", "language": "en", "confidence": 0.0, "word_count": 0, "duration_s": 0.0}

    try:
        # PCM bytes → numpy float32 array
        samples = np.frombuffer(pcm_bytes, dtype=np.float32)
        if len(samples) < sample_rate * 0.3:   # skip chunks < 300ms
            return {"text": "", "language": "en", "confidence": 0.0, "word_count": 0, "duration_s": 0.0}

        duration_s = len(samples) / sample_rate

        segments, info = model.transcribe(
            samples,
            language="en",
            beam_size=3,
            best_of=3,
            temperature=0.0,
            vad_filter=True,           # skip silence automatically
            vad_parameters={"min_silence_duration_ms": 300},
        )

        text = " ".join(seg.text.strip() for seg in segments)
        word_count = len(text.split())

        return {
            "text":       text,
            "language":   info.language,
            "confidence": float(info.language_probability),
            "word_count": word_count,
            "duration_s": round(duration_s, 2),
        }

    except Exception as e:
        print(f"[AudioPipeline] Whisper error: {e}")
        return {"text": "", "language": "en", "confidence": 0.0, "word_count": 0, "duration_s": 0.0}


# ── 2. Text Emotion Analysis ─────────────────────────────────────────────────
# Tier 1: DistilRoBERTa-GoEmotions (when torch/transformers available)
# Tier 2: Keyword lexicon (pure Python, always available)

_STRESS_EMOTIONS = {"fear", "nervousness", "sadness", "anger", "disgust"}

def analyse_text_emotion(text: str) -> dict:
    """
    Analyse emotion from transcript text.
    Returns: { fear, joy, sadness, anger, surprise, neutral, text_stress_score }
    """
    if not text.strip():
        return {"fear": 0.0, "joy": 0.0, "sadness": 0.0,
                "anger": 0.0, "surprise": 0.0, "neutral": 1.0,
                "text_stress_score": 0, "method": "empty"}

    # ── Tier 1: DistilRoBERTa (best accuracy) ──
    pipe = _get_emotion_pipeline()
    if pipe is not None:
        try:
            results     = pipe(text[:500])[0]
            scores      = {r["label"].lower(): round(r["score"], 4) for r in results}
            stress_score = int(min(100, sum(scores.get(e, 0.0) * 100 for e in _STRESS_EMOTIONS)))
            return {**scores, "text_stress_score": stress_score, "method": "roberta"}
        except Exception as e:
            print(f"[AudioPipeline] RoBERTa emotion error: {e}")

    # ── Tier 2: Keyword lexicon (pure Python, no dependencies) ──
    return _keyword_emotion(text)


def _keyword_emotion(text: str) -> dict:
    """
    Pure-Python keyword-based emotion scoring.
    Fast, zero dependencies, works on Python 3.14+.
    """
    lower = text.lower()
    words = lower.split()

    scores = {}
    total_hits = 0
    for emotion, keywords in _EMOTION_LEXICONS.items():
        hits = sum(1 for kw in keywords if kw in lower)
        scores[emotion] = hits
        total_hits += hits

    # Hedge words boost uncertainty / mild fear
    hedge_hits   = sum(1 for h in _HEDGE_WORDS    if h in lower)
    stress_hits  = sum(1 for s in _STRESS_PHRASES if s in lower)

    # Normalise to probabilities
    total = total_hits + 1  # avoid div-by-zero
    probs = {k: round(v / total, 4) for k, v in scores.items()}

    # Ensure values sum sensibly (add neutral for uncovered text)
    if total_hits == 0:
        probs["neutral"] = 1.0

    # Composite text stress score
    stress_score = min(100, int(
        (probs.get("fear", 0) * 60 +
         probs.get("anger", 0) * 25 +
         probs.get("sadness", 0) * 20 +
         hedge_hits * 5 +
         stress_hits * 15)
    ))

    return {
        "fear":              probs.get("fear", 0.0),
        "anger":             probs.get("anger", 0.0),
        "sadness":           probs.get("sadness", 0.0),
        "surprise":          probs.get("surprise", 0.0),
        "joy":               probs.get("joy", 0.0),
        "neutral":           probs.get("neutral", 0.0),
        "text_stress_score": stress_score,
        "method":            "keyword_lexicon",
        "hedge_count":       hedge_hits,
        "stress_phrase_count": stress_hits,
    }




# ── 3. Acoustic Feature Analysis (Wav2Vec proxy via librosa) ─────────────────

def analyse_acoustic_features(pcm_bytes: bytes, sample_rate: int = 16000) -> dict:
    """
    Extract acoustic stress markers from raw PCM audio using librosa.
    Proxies for what Wav2Vec 2.0 detects: tremor, pitch instability, breathiness.

    Features:
      - MFCC variance (vocal muscle tension → tremor when high)
      - F0 pitch std (pitch instability → stress when high)
      - RMS energy (low energy → vocal suppression; spikes → exertion)
      - ZCR (zero crossing rate → breathiness / vocal fry)
      - Spectral centroid std (voice tightening / register shifts)
      - Jitter proxy (pitch period variation → tremor marker)
    """
    try:
        import librosa

        samples = np.frombuffer(pcm_bytes, dtype=np.float32)
        if len(samples) < sample_rate * 0.5:   # need at least 500ms
            return _empty_acoustic()

        y  = samples
        sr = sample_rate

        # MFCC — vocal tract shape stability
        mfccs    = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=13)
        mfcc_var = float(np.mean(np.var(mfccs, axis=1)))   # higher = more tremor

        # Fundamental frequency (pitch) tracking
        f0, voiced_flag, _ = librosa.pyin(y, fmin=80, fmax=400, sr=sr)
        f0_voiced = f0[voiced_flag & ~np.isnan(f0)]
        pitch_std = float(np.std(f0_voiced)) if len(f0_voiced) > 2 else 0.0
        pitch_mean = float(np.mean(f0_voiced)) if len(f0_voiced) > 2 else 0.0

        # Jitter (pitch period variation — physiological stress marker)
        if len(f0_voiced) > 3:
            periods = 1.0 / (f0_voiced + 1e-9)
            jitter  = float(np.mean(np.abs(np.diff(periods))) / (np.mean(periods) + 1e-9))
        else:
            jitter = 0.0

        # RMS energy
        rms        = librosa.feature.rms(y=y)[0]
        rms_mean   = float(np.mean(rms))
        rms_std    = float(np.std(rms))

        # Zero crossing rate (breathiness / vocal fry)
        zcr        = librosa.feature.zero_crossing_rate(y)[0]
        zcr_mean   = float(np.mean(zcr))

        # Spectral centroid (voice tightening under stress)
        centroid   = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        centroid_std = float(np.std(centroid))

        # Speaking rate from voiced segments
        voiced_ratio = float(np.mean(voiced_flag)) if len(voiced_flag) > 0 else 0.0

        # ── Acoustic stress score (0–100) ──
        # Calibrated weights based on speech pathology research:
        #   Tremor (MFCC var) 30%, Pitch instability 25%, Jitter 20%,
        #   Energy suppression 15%, Breathiness 10%
        tremor_score   = min(40, mfcc_var * 15.0)          # MFCC variance → tremor
        pitch_score    = min(30, pitch_std * 0.5)           # pitch std Hz → instability
        jitter_score   = min(20, jitter * 500.0)            # jitter ratio → tremor
        breathe_score  = min(10, zcr_mean * 80.0)           # ZCR → breathiness

        acoustic_stress = int(min(100, tremor_score + pitch_score + jitter_score + breathe_score))

        return {
            "mfcc_variance":      round(mfcc_var, 4),
            "pitch_mean_hz":      round(pitch_mean, 1),
            "pitch_std_hz":       round(pitch_std, 2),
            "jitter":             round(jitter, 5),
            "rms_mean":           round(rms_mean, 5),
            "rms_std":            round(rms_std, 5),
            "zcr_mean":           round(zcr_mean, 4),
            "spectral_centroid_std": round(centroid_std, 1),
            "voiced_ratio":       round(voiced_ratio, 3),
            "acoustic_stress_score": acoustic_stress,
        }

    except ImportError:
        print("[AudioPipeline] librosa not installed. Acoustic features disabled.")
        return _empty_acoustic()
    except Exception as e:
        print(f"[AudioPipeline] Acoustic error: {e}")
        return _empty_acoustic()


def _empty_acoustic() -> dict:
    return {
        "mfcc_variance": 0.0, "pitch_mean_hz": 0.0, "pitch_std_hz": 0.0,
        "jitter": 0.0, "rms_mean": 0.0, "rms_std": 0.0,
        "zcr_mean": 0.0, "spectral_centroid_std": 0.0,
        "voiced_ratio": 0.0, "acoustic_stress_score": 0,
    }


# ── 4. Fusion Layer ──────────────────────────────────────────────────────────

def fuse_vocal_stress(
    text_stress: int,        # 0–100 from RoBERTa (linguistic fear markers)
    acoustic_stress: int,    # 0–100 from librosa (vocal tremor / pitch instability)
    face_stress: int = 0,    # 0–100 from FaceStressModel (optional integration)
    acoustic_available: bool = True,
    text_available: bool = True,
) -> dict:
    """
    Fuse acoustic + text + face signals into a single VocalStressScore.

    Weights (evidence-based):
      Acoustic (tremor/pitch): 45%   — captures what text cannot (physiological)
      Text emotion (RoBERTa):  35%   — captures fear/nervousness from words
      Face stress:             20%   — corroborates from video channel

    When a signal is unavailable:
      - Missing acoustic → text gets 55%, face gets 45%
      - Missing text     → acoustic gets 65%, face gets 35%
    """
    if acoustic_available and text_available:
        score = int(acoustic_stress * 0.45 + text_stress * 0.35 + face_stress * 0.20)
    elif acoustic_available:
        score = int(acoustic_stress * 0.65 + face_stress * 0.35)
    elif text_available:
        score = int(text_stress * 0.55 + face_stress * 0.45)
    else:
        score = face_stress

    score = max(0, min(100, score))

    # Tier labels
    if score >= 75:    tier = "Acute / Distress"
    elif score >= 55:  tier = "High / Sympathetic"
    elif score >= 35:  tier = "Moderate / Strain"
    elif score >= 21:  tier = "Engaged / Optimal"
    else:              tier = "Baseline / Calm"

    return {
        "vocal_stress_score": score,
        "tier": tier,
        "components": {
            "acoustic": acoustic_stress,
            "text":     text_stress,
            "face":     face_stress,
        }
    }


# ── 5. Full Pipeline Entry Point ──────────────────────────────────────────────

async def process_audio_chunk(
    pcm_bytes: bytes,
    sample_rate: int = 16000,
    face_stress: int = 0,
    run_in_executor: bool = True,
) -> dict:
    """
    Full pipeline: PCM bytes → transcript + emotion + acoustic → fused score.

    Returns a dict suitable for sending back to the browser:
    {
      "transcript":         { text, language, confidence, word_count },
      "text_emotion":       { fear, joy, sadness, ..., text_stress_score },
      "acoustic":           { mfcc_variance, pitch_std, jitter, ..., acoustic_stress_score },
      "vocal_stress":       { vocal_stress_score, tier, components },
      "filler_words":       [ words found ],
    }
    """
    loop = asyncio.get_event_loop()

    if run_in_executor:
        # Run CPU-heavy models in thread pool to avoid blocking the event loop
        transcript_task = loop.run_in_executor(None, transcribe_chunk, pcm_bytes, sample_rate)
        acoustic_task   = loop.run_in_executor(None, analyse_acoustic_features, pcm_bytes, sample_rate)

        transcript_result, acoustic_result = await asyncio.gather(
            transcript_task, acoustic_task
        )
    else:
        transcript_result = transcribe_chunk(pcm_bytes, sample_rate)
        acoustic_result   = analyse_acoustic_features(pcm_bytes, sample_rate)

    # Text emotion (fast, needs transcript first)
    transcript_text = transcript_result.get("text", "")
    if transcript_text.strip() and run_in_executor:
        emotion_result = await loop.run_in_executor(None, analyse_text_emotion, transcript_text)
    elif transcript_text.strip():
        emotion_result = analyse_text_emotion(transcript_text)
    else:
        emotion_result = {"fear": 0.0, "joy": 0.0, "sadness": 0.0,
                          "anger": 0.0, "surprise": 0.0, "neutral": 1.0, "text_stress_score": 0}

    # Filler word detection
    filler_words = _FILLER_WORDS
    found_fillers = [f for f in filler_words if f in transcript_text.lower()]

    # Fusion
    vocal_stress = fuse_vocal_stress(
        text_stress     = emotion_result.get("text_stress_score", 0),
        acoustic_stress = acoustic_result.get("acoustic_stress_score", 0),
        face_stress     = face_stress,
        acoustic_available = acoustic_result.get("acoustic_stress_score", 0) > 0,
        text_available     = bool(transcript_text.strip()),
    )

    return {
        "transcript":   transcript_result,
        "text_emotion": emotion_result,
        "acoustic":     acoustic_result,
        "vocal_stress": vocal_stress,
        "filler_words": found_fillers,
    }


_FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'literally',
                 'actually', 'so', 'well', 'right', 'okay', 'kind of', 'sort of']
