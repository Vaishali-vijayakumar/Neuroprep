/**
 * StressScorer — Multi-Modal Cognitive Load & Stress Fusion Engine (0–100)
 *
 * ── Signal Streams & Weights ────────────────────────────────────────────────
 * 1. Face & Micro-Expressions (35%):
 *    - FACS Action Units (AU4 brow furrow, AU7 eye strain, AU1 worry, AU17 anxiety)
 *    - Blink Rate anomalies (<8/min = freeze, >26/min = acute anxiety)
 *    - Real-time rPPG autonomic elevation (when available)
 *
 * 2. Audio & Vocal Acoustics (35%):
 *    - Speech Pace: WPM > 180 (anxious rushing) or < 60 (cognitive block)
 *    - Volume instability: Mumbling (< 10%) or vocal strain (> 75%)
 *    - Cognitive freeze / hesitation: Silence > 4s (+20), > 8s (+38)
 *
 * 3. Behavioral & Proctoring Anomaly Stream (30%):
 *    - Phone reading detection: Eye contact < 55% + Head tilted down + Active speech
 *    - Monotonic reading cadence: High WPM with zero hesitation/fillers
 *    - Avoidance / Gaze aversion
 *
 * ── Diagnostic Cognitive Load Tiers ─────────────────────────────────────────
 *  0–30   Calm / Low Load       — Resting baseline autonomic state
 *  31–55  Engaged / Focused     — Optimal cognitive performance zone
 *  56–75  High Strain           — Sympathetic arousal / high cognitive burden
 *  76–100 Acute / Proctor Alert — Fight-or-flight freeze or phone-reading anomaly
 */

export class StressScorer {
  constructor({ onScore } = {}) {
    this.onScore     = onScore || (() => {});
    this.history     = [];
    this.WINDOW      = 8; // Responsive 8-step smoothing

    this.faceData    = null;
    this.audioData   = null;
    this.contextData = { fillerCount: 0, avgAnswerLength: 0, questionComplexity: 'Medium' };
  }

  updateFace(data)    { this.faceData    = data; return this._compute(); }
  updateAudio(data)   { this.audioData   = data; return this._compute(); }
  updateContext(data) { this.contextData = { ...this.contextData, ...data }; }

  _compute() {
    let faceScore    = 0;
    let audioScore   = 0;
    let anomalyScore = 0;

    // ── 1. Face & Biometric Stream (35%) ────────────────────────────────────
    if (this.faceData) {
      const {
        blinkRate    = 15,
        headPose     = 'forward',
        eyeContact   = 90,
        faceDetected = true,
        stressScore  = null,
        actionUnits  = null,
      } = this.faceData;

      if (!faceDetected) {
        faceScore += 45; // Candidate left frame / obscured camera
      } else {
        // Core facial strain score from FaceStressModel
        if (stressScore != null && stressScore > 0) {
          faceScore += stressScore * 0.60;
        }

        // Direct Action Unit weighting if raw AUs are present
        if (actionUnits) {
          if (actionUnits.au4 > 0.35) faceScore += actionUnits.au4 * 25; // Brow tension
          if (actionUnits.au7 > 0.35) faceScore += actionUnits.au7 * 20; // Eye fatigue
          if (actionUnits.au1 > 0.40) faceScore += actionUnits.au1 * 15; // Worry
        }

        // Blink rate extremes
        if (blinkRate > 28) {
          faceScore += Math.min(30, (blinkRate - 25) * 3); // Rapid anxious blinking
        } else if (blinkRate > 0 && blinkRate < 6) {
          faceScore += 22; // Cognitive freeze / hyper-fixation
        }
      }
    }

    // ── 2. Audio & Acoustic Stream (35%) ────────────────────────────────────
    if (this.audioData) {
      const { volume = 0, wpm = 0, silenceDuration = 0, isVoice = false } = this.audioData;

      if (volume > 0) {
        if (volume < 8)       audioScore += 24; // Mumbling / confidence loss
        else if (volume > 82) audioScore += 20; // Vocal strain / shouting
      }

      if (wpm > 0) {
        if (wpm > 185)      audioScore += Math.min(35, (wpm - 170) * 0.8); // Rushing panic
        else if (wpm < 55)  audioScore += 26; // Severe word-retrieval hesitation
      }

      if (silenceDuration > 8000)      audioScore += 45; // 8s+ cognitive freeze
      else if (silenceDuration > 4000) audioScore += 28; // 4s+ block
      else if (silenceDuration > 2000) audioScore += 12;
    }

    // ── 3. Behavioral & Downward Gaze Anomaly Stream (30%) ──────────────────
    const eyeContact    = this.faceData?.eyeContact ?? 90;
    const headPose      = this.faceData?.headPose ?? 'forward';
    const isLookingDown = Boolean(
      this.faceData?.isLookingDown ||
      (headPose === 'down' && eyeContact < 40)
    );
    const isSpeaking = (this.audioData?.volume ?? 0) > 10;
    const currentWpm = this.audioData?.wpm ?? 0;

    let phoneReadingDetected  = false;
    let downwardFocusDetected = false;

    // Pattern 1: Speaking while looking down → Proctor Alert (Phone / Off-Screen Reading)
    // Pattern 2: Silent while looking down → Elevated Cognitive Load (Deep thinking / notes / problem reading)
    if (isLookingDown) {
      if (isSpeaking) {
        anomalyScore += 45;
        phoneReadingDetected = true;
      } else {
        anomalyScore += 30;
        downwardFocusDetected = true;
      }
    } else if (eyeContact < 40) {
      anomalyScore += Math.max(0, (50 - eyeContact) * 0.8);
    }

    // Unnatural monotonic reading fluency: fast speech (WPM > 130) with 0 fillers on complex topics
    if (currentWpm > 130 && this.contextData.fillerCount === 0 && phoneReadingDetected) {
      anomalyScore += 25;
    }

    // Frequent filler words indicating high cognitive uncertainty
    if (this.contextData.fillerCount > 0) {
      anomalyScore += Math.min(25, this.contextData.fillerCount * 5);
    }

    // ── Multi-Modal Fusion ──────────────────────────────────────────────────
    const rawIndex = faceScore * 0.35 + audioScore * 0.35 + anomalyScore * 0.30;
    const finalScore = Math.round(Math.min(100, Math.max(0, rawIndex)));

    this.history.push(finalScore);
    if (this.history.length > this.WINDOW) this.history.shift();

    const smoothed = Math.round(
      this.history.reduce((a, b) => a + b, 0) / this.history.length
    );

    let cognitiveLoad = 'Low';
    if (smoothed >= 56 || phoneReadingDetected) cognitiveLoad = 'High';
    else if (smoothed >= 31 || downwardFocusDetected) cognitiveLoad = 'Moderate';

    const result = {
      score: smoothed,
      cognitiveLoad,
      phoneReadingDetected,
      downwardFocusDetected,
      details: this.getLabel(smoothed, phoneReadingDetected, downwardFocusDetected),
    };

    this.onScore(smoothed);
    return result;
  }

  /**
   * Returns display label, clinical tier, and badge color for a given score.
   */
  getLabel(score, phoneReadingDetected = false, downwardFocusDetected = false) {
    if (phoneReadingDetected) {
      return {
        label: 'Proctor Alert',
        tier: 'Gaze / Phone Anomaly',
        cognitiveLoad: 'High',
        color: '#111827',
        bg: '#F3F4F6',
        description: 'Downward gaze / off-screen reading detected',
      };
    }

    if (downwardFocusDetected) {
      return {
        label: 'Downward Focus',
        tier: 'Cognitive Processing',
        cognitiveLoad: score >= 50 ? 'High' : 'Moderate',
        color: '#111827',
        bg: '#F3F4F6',
        description: 'Downward gaze — heavy cognitive burden / off-screen focus',
      };
    }

    if (score <= 35) {
      return {
        label: 'Calm',
        tier: 'Baseline',
        cognitiveLoad: 'Low',
        color: '#111827',
        bg: '#F3F4F6',
        description: 'Resting physiological baseline',
      };
    }

    if (score <= 55) {
      return {
        label: 'Focused',
        tier: 'Optimal Engagement',
        cognitiveLoad: 'Moderate',
        color: '#111827',
        bg: '#F0F9FF',
        description: 'Moderate cognitive challenge — optimal focus',
      };
    }

    if (score <= 75) {
      return {
        label: 'High Load',
        tier: 'Sympathetic Strain',
        cognitiveLoad: 'High',
        color: '#111827',
        bg: '#F3F4F6',
        description: 'Elevated cognitive load & vocal tension',
      };
    }

    return {
      label: 'Acute Stress',
      tier: 'Distress Response',
      cognitiveLoad: 'High',
      color: '#111827',
      bg: '#F3F4F6',
      description: 'Severe strain or cognitive block detected',
    };
  }
}

export default StressScorer;
