import uuid
from datetime import datetime
from fastapi import FastAPI, UploadFile, File, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any

# ── Existing ATS services ──────────────────────────────────────────────────────
from app.services.pdf_extractor import extract_pdf_text
from app.services.entity_parser import parse_resume_via_apilayer, map_apilayer_to_profile
from app.services.ats_evaluator import evaluate_ats_score
from app.services.session_manager import save_session

# ── AI Interview Engine routers ────────────────────────────────────────────────
from app.routers import interview as interview_router
from app.routers import evaluate as evaluate_router
from app.routers import report as report_router
from app.routers import code as code_router
from app.routers import stress_analysis as stress_router
from app.routers import dsa_interview as dsa_router  # Live DSA compiler + AI code review
from app.routers import ws_interview
from app.routers import ws_audio          # Hybrid audio pipeline WebSocket

app = FastAPI(
    title="Neroprep — AI Placement Platform",
    description="ATS Resume Analysis + Real-Time AI Mock Interview Engine powered by Gemini 2.0.",
    version="2.0.0"
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:5173",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount AI Interview Engine routers ─────────────────────────────────────────
app.include_router(interview_router.router, prefix="/api/interview")
app.include_router(evaluate_router.router, prefix="/api/evaluate")
app.include_router(report_router.router,   prefix="/api/report")
app.include_router(code_router.router,     prefix="/api/code")
app.include_router(dsa_router.router,      prefix="/api/dsa")   # Live DSA compiler
app.include_router(stress_router.router)    # Spatiotemporal & rPPG Stress API
app.include_router(ws_interview.router)   # WebSocket at /ws/{session_id}
app.include_router(ws_audio.router)       # Audio pipeline at /ws/audio/{session_id}


# ══════════════════════════════════════════════════════════════════════════════
# EXISTING ATS / Resume endpoints (preserved from v1)
# ══════════════════════════════════════════════════════════════════════════════

class ContactInfo(BaseModel):
    github: str = ""
    linkedin: str = ""

class TechSkills(BaseModel):
    languages: List[str] = []
    frameworks: List[str] = []
    tools_cloud: List[str] = []

class ProjectItem(BaseModel):
    title: str
    technologies: List[str] = []
    has_metrics: bool
    raw_text: str

class EduItem(BaseModel):
    degree: str
    year: str

class ParsedProfile(BaseModel):
    contact: ContactInfo
    technical_skills: TechSkills
    projects: List[ProjectItem] = []
    experience_level: str
    education: List[EduItem] = []

class AtsSummary(BaseModel):
    overall_score: int
    keyword_alignment_score: int
    quantifiable_impact_score: int
    formatting_readability_score: int

class AtsInsights(BaseModel):
    missing_high_priority_keywords: List[str] = []
    detected_strong_domains: List[str] = []
    actionable_resume_improvements: List[str] = []

class SessionStartResponse(BaseModel):
    status: str = "success"
    session_id: str
    created_at: str
    ats_summary: AtsSummary
    parsed_profile: ParsedProfile
    ats_insights: AtsInsights


@app.get("/api/health")
def health_check():
    return {
        "status":  "healthy",
        "service": "Neroprep AI Platform",
        "version": "2.0.0",
        "modules": ["ATS Resume Analysis", "AI Mock Interview Engine", "Gemini 2.0 Brain", "WebSocket"]
    }


@app.post("/api/v1/session/start-from-resume", response_model=SessionStartResponse)
async def start_session_from_resume(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF resume files are supported.")

    try:
        file_bytes = await file.read()
        raw_text, blocks = extract_pdf_text(file_bytes)

        if not raw_text.strip():
            raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Could not extract readable text from the uploaded PDF.")

        apilayer_data = parse_resume_via_apilayer(file_bytes)
        if not apilayer_data:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail="Resume Parser API failed. Please verify your API key.")

        parsed_data = map_apilayer_to_profile(apilayer_data)
        exp_entries = apilayer_data.get("experience", [])
        target_role = exp_entries[0].get("job_title", "Software Engineer") if exp_entries else "Software Engineer"

        ats_evaluation = evaluate_ats_score(raw_text, parsed_data, target_role)

        session_id = f"sess_{uuid.uuid4().hex}"
        created_at = datetime.utcnow().isoformat() + "Z"
        session_payload = {
            "session_id": session_id,
            "created_at": created_at,
            "ats_summary": ats_evaluation["summary"],
            "parsed_profile": parsed_data,
            "ats_insights": ats_evaluation["insights"]
        }
        save_session(session_id, session_payload)

        return SessionStartResponse(
            session_id=session_id,
            created_at=created_at,
            ats_summary=AtsSummary(**ats_evaluation["summary"]),
            parsed_profile=ParsedProfile(**parsed_data),
            ats_insights=AtsInsights(**ats_evaluation["insights"])
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Error during resume parsing: {str(e)}")
