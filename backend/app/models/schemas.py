"""
Pydantic models for the Neroprep AI Interview Engine API.
"""
from pydantic import BaseModel, Field
from typing import Optional


# ── Session ──────────────────────────────────────────────

class InterviewConfig(BaseModel):
    trackId:     str  = Field(default="default", max_length=100)
    trackName:   str  = Field(default="General Interview", max_length=200)
    difficulty:  str  = Field(default="Intermediate", max_length=50)
    personality: str  = Field(default="professional", max_length=50)
    duration:    int  = Field(default=30, ge=1, le=180)
    role:        str  = Field(default="Software Engineer", max_length=100)
    company:     str  = Field(default="General Track", max_length=100)
    mode:        str  = Field(default="voice", max_length=20)
    language:    str  = Field(default="English", max_length=50)
    codingLang:  str  = Field(default="Python", max_length=50)
    numQ:        int  = Field(default=10, ge=1, le=50)
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
    stress:                 int   = 0
    blink_rate:             float = 15.0
    head_pose:              str   = "forward"
    eye_contact:            float = 85.0
    volume:                 float = 50.0
    wpm:                    float = 0.0
    silence_duration:       float = 0.0
    filler_count:           int   = 0
    face_detected:          bool  = True
    phone_detected:         bool  = False
    phone_object_visible:   bool  = False
    phone_reading_detected: bool  = False
    downward_seconds:       int   = 0
    phone_alerts:           int   = 0
    distraction_score:      int   = 0



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
    session_id:   str = Field(..., max_length=128)
    question:     str = Field(..., max_length=5000)
    answer:       str = Field(..., max_length=15000)
    stress_index: int = Field(default=0, ge=0, le=100)


class RubricScore(BaseModel):
    technical_accuracy:   int = Field(ge=0, le=100)
    communication:        int = Field(ge=0, le=100)
    grammar:              int = Field(ge=0, le=100)
    problem_solving:      int = Field(ge=0, le=100)
    star_depth:           int = Field(ge=0, le=100)
    confidence:           int = Field(ge=0, le=100)
    leadership_ownership: int = Field(ge=0, le=100)
    critical_thinking:    int = Field(ge=0, le=100)
    time_management:      int = Field(ge=0, le=100)
    overall:              int = Field(ge=0, le=100)
    feedback:             str = Field(default="", max_length=5000)
    strengths:            list[str] = []
    improvements:         list[str] = []


# ── Code ─────────────────────────────────────────────────

class CodeRunRequest(BaseModel):
    session_id:  Optional[str] = Field(default="standalone", max_length=128)
    source_code: str = Field(..., max_length=100000)
    language:    str = Field(default="python", max_length=50)
    stdin:       str = Field(default="", max_length=10000)


class CodeRunResponse(BaseModel):
    status:          str
    stdout:          str = ""
    stderr:          str = ""
    compile_output:  str = ""
    time:            Optional[str] = None
    memory:          Optional[int] = None
    complexity:      Optional[dict] = None
    ai_guidance:     Optional[str] = None


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
