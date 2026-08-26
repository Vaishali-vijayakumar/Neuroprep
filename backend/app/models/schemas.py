"""
Pydantic models for the Neroprep AI Interview Engine API.
"""
from pydantic import BaseModel, Field
from typing import Any, Optional


# ── Session ──────────────────────────────────────────────

class InterviewConfig(BaseModel):
    trackId:     str  = "default"
    trackName:   str  = "General Interview"
    difficulty:  str  = "Intermediate"
    personality: str  = "professional"
    duration:    int  = 30
    role:        str  = "Software Engineer"
    company:     str  = "General Track"
    mode:        str  = "voice"
    language:    str  = "English"
    codingLang:  str  = "Python"
    numQ:        int  = 10
    enableVideo: bool = True
    enableMic:   bool = True
    enableHints: bool = True


class StartSessionRequest(BaseModel):
    config: InterviewConfig


class StartSessionResponse(BaseModel):
    session_id: str
    greeting:   str
    status:     str = "started"


# ── WebSocket message types ──────────────────────────────

class WSClientMessage(BaseModel):
    """Message sent from browser → backend over WebSocket."""
    type: str   # "answer" | "telemetry" | "end" | "ping"
    session_id: str
    payload:    dict = {}


class WSTelemetryPayload(BaseModel):
    stress:           int   = 0
    blink_rate:       float = 15.0
    head_pose:        str   = "forward"
    eye_contact:      float = 85.0
    volume:           float = 50.0
    wpm:              float = 0.0
    silence_duration: float = 0.0
    filler_count:     int   = 0
    face_detected:    bool  = True


class WSServerMessage(BaseModel):
    """Message sent from backend → browser over WebSocket."""
    type:        str   # "question" | "followup" | "eval" | "adaptation" | "end" | "pong"
    text:        str   = ""
    stress_index: int  = 0
    adaptation:  Optional[dict] = None
    rubric:      Optional[dict] = None
    data:        dict  = {}


# ── Evaluation ───────────────────────────────────────────

class EvaluateRequest(BaseModel):
    session_id:   str
    question:     str
    answer:       str
    stress_index: int = 0


class RubricScore(BaseModel):
    technical_accuracy:   int
    communication:        int
    grammar:              int
    problem_solving:      int
    star_depth:           int
    confidence:           int
    leadership_ownership: int
    critical_thinking:    int
    time_management:      int
    overall:              int
    feedback:             str
    strengths:            list[str] = []
    improvements:         list[str] = []


# ── Code ─────────────────────────────────────────────────

class CodeRunRequest(BaseModel):
    session_id:  str
    source_code: str
    language:    str = "python"
    stdin:       str = ""


class CodeRunResponse(BaseModel):
    status:          str
    stdout:          str = ""
    stderr:          str = ""
    compile_output:  str = ""
    time:            Optional[str] = None
    memory:          Optional[int] = None
    complexity:      Optional[dict] = None


# ── Report ───────────────────────────────────────────────

class ReportRequest(BaseModel):
    session_id: str


class LearningDay(BaseModel):
    day:      int
    topic:    str
    resource: str


class InterviewReport(BaseModel):
    overall_score:          int
    grade:                  str
    technical_score:        int
    communication_score:    int
    grammar_score:          int
    confidence_score:       int
    leadership_score:       int
    problem_solving_score:  int
    critical_thinking_score: int
    time_management_score:  int
    stress_score:           int
    eye_contact_score:      int
    speaking_speed:         str
    strengths:              list[str]
    weak_areas:             list[str]
    behavioral_observation: str
    executive_summary:      str
    learning_plan:          list[LearningDay]
    hire_recommendation:    str
