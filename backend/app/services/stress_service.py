"""
Stress Fusion Service
Combines face telemetry + audio metrics + contextual signals
into a single 0-100 Cognitive Stress Index.
"""
from collections import deque


class StressFusionService:
    """
    Stateful per-session stress scorer.
    Weights:
      Face signals  → 40%
      Audio signals → 40%
      Context       → 20%
    """
    WINDOW = 15  # rolling window size

    def __init__(self):
        self._history: deque = deque(maxlen=self.WINDOW)
        self.filler_count = 0

    def compute(
        self,
        *,
        # Face
        face_detected: bool = True,
        blink_rate: float = 15.0,       # blinks/min (normal 12-20)
        head_pose: str = "forward",
        eye_contact: float = 85.0,      # 0-100%
        # Audio
        volume: float = 50.0,           # 0-100
        wpm: float = 130.0,             # words per minute
        silence_duration_ms: float = 0, # ms of silence
        # Context
        filler_count: int = 0,
        answer_length_words: int = 50,
    ) -> int:
        score = 0.0

        # ── Face (40%) ──
        if not face_detected:
            score += 25
        else:
            # Blink anomaly: high (>25) or low (<8) both indicate stress
            if blink_rate > 25:
                score += 18
            elif blink_rate < 8:
                score += 10
            # Head pose
            if head_pose == "down":
                score += 24  # Downward gaze / off-screen reading or cognitive load
            elif head_pose != "forward":
                score += 15
            # Eye contact
            score += max(0, (100 - eye_contact) * 0.25)
        face_contribution = score * 0.4

        # ── Audio (40%) ──
        audio = 0.0
        if volume < 5:
            audio += 18   # mumbling
        elif volume > 85:
            audio += 10   # shouting/panic
        if wpm > 190:
            audio += 22   # racing speech
        elif wpm < 50 and wpm > 0:
            audio += 18   # halting speech
        if silence_duration_ms > 8000:
            audio += 25
        elif silence_duration_ms > 4000:
            audio += 12
        audio_contribution = audio * 0.4

        # ── Context (20%) ──
        ctx = 0.0
        self.filler_count = filler_count
        ctx += min(30, filler_count * 4)
        if answer_length_words < 10:
            ctx += 10     # extremely short answers
        ctx_contribution = ctx * 0.2

        raw = face_contribution + audio_contribution + ctx_contribution
        raw = max(0.0, min(100.0, raw))

        self._history.append(int(raw))
        smoothed = int(sum(self._history) / len(self._history))
        return smoothed

    @staticmethod
    def get_label(score: int) -> dict:
        if score < 20:   return {"label": "Relaxed",        "color": "#16A34A", "bg": "#F0FDF4"}
        if score < 40:   return {"label": "Comfortable",    "color": "#4ADE80", "bg": "#F0FDF4"}
        if score < 60:   return {"label": "Moderate Load",  "color": "#D97706", "bg": "#FFFBEB"}
        if score < 80:   return {"label": "High Load",      "color": "#EA580C", "bg": "#FFF7ED"}
        return               {"label": "Very High Load",    "color": "#DC2626", "bg": "#FEF2F2"}

    @staticmethod
    def get_adaptation(score: int) -> dict | None:
        if score >= 80:
            return {
                "type": "stress_very_high",
                "message": "Take a slow, deep breath. You are doing well. The AI has lowered the difficulty.",
                "action": "lower_difficulty",
            }
        if score >= 60:
            return {
                "type": "stress_high",
                "message": "You are performing well. Take your time — there is no rush to answer.",
                "action": "encourage",
            }
        return None


# Per-session instances
_instances: dict[str, StressFusionService] = {}

def get_scorer(session_id: str) -> StressFusionService:
    if session_id not in _instances:
        _instances[session_id] = StressFusionService()
    return _instances[session_id]

def cleanup_scorer(session_id: str) -> None:
    _instances.pop(session_id, None)
