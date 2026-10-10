"""
vent_rag.py
===============================================================================
FastAPI Router for Voice & Text Emotional Vent Recovery RAG Engine
===============================================================================
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Form, status
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from app.services.vent_recovery_rag import process_student_vent, rag_service_instance, PIIStripper

router = APIRouter(tags=["Emotional Vent & Placement Recovery RAG"])

class VentTextRequest(BaseModel):
    text: str = Field(..., description="Student's emotional vent or rejection story")
    stage: Optional[str] = Field(None, description="Interview stage (e.g. technical_round_2, oa_screening, final_round)")

class CognitiveDiagnosis(BaseModel):
    thinking_trap: str
    clinical_explanation: str

class MathMarketCheck(BaseModel):
    stage: str
    funnel_attrition: str
    headcount_reality: str

class SkillVariable(BaseModel):
    isolated_gap: str
    precision_fix: str

class AlumniPrecedent(BaseModel):
    senior_case: str
    rebound_timeline: str
    strategic_takeaway: str

class RecoveryCard(BaseModel):
    cognitive_diagnosis: CognitiveDiagnosis
    math_market_check: MathMarketCheck
    skill_variable: SkillVariable
    alumni_precedent: AlumniPrecedent
    actionable_recovery_steps: List[str]
    grounded_summary: str

class VentResponse(BaseModel):
    success: bool
    input_type: str
    raw_transcript: str
    sanitized_query: str
    detected_stage: str
    latency_ms: int
    retrieved_chunks: List[Dict[str, Any]]
    recovery_card: RecoveryCard


@router.post("/text", response_model=VentResponse)
async def analyze_text_vent(req: VentTextRequest):
    """
    Submits a raw text vent:
      1. Strips PII (Regex PII Stripper)
      2. Vectorizes with BGE embeddings
      3. Searches Qdrant with stage metadata filter
      4. Reranks with cross-encoder (CBT, Attrition, Alumni)
      5. Generates structured Recovery Card JSON via Llama 3.3 70B / Gemini 1.5 Flash
    """
    if not req.text or not req.text.strip():
        raise HTTPException(status_code=400, detail="Vent text cannot be empty.")
    
    try:
        result = await process_student_vent(
            raw_text=req.text,
            stage=req.stage
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vent processing failed: {str(e)}")


@router.post("/audio", response_model=VentResponse)
async def analyze_audio_vent(
    audio: UploadFile = File(..., description="Voice vent audio recording (WAV, MP3, WebM, OGG)"),
    stage: Optional[str] = Form(None, description="Interview stage")
):
    """
    Submits a 30-second audio voice vent:
      1. Transcribes via faster-whisper (<400ms)
      2. Strips PII
      3. Retrieves authoritative grounding chunks from Qdrant
      4. Generates structured Recovery Card JSON
    """
    try:
        content = await audio.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty audio recording submitted.")

        result = await process_student_vent(
            audio_bytes=content,
            audio_filename=audio.filename or "recording.wav",
            stage=stage
        )
        return result
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Audio vent processing failed: {str(e)}")


@router.get("/stages")
async def get_interview_stages():
    """Lists supported interview stage categories and sample patterns."""
    return {
        "stages": [
            {
                "id": "technical_round_2",
                "label": "Round 2 (Live Coding)",
                "description": "Live coding problems with a running clock.",
                "typical_attrition": "Over 75% turned away due to room capacity"
            },
            {
                "id": "technical_round_1",
                "label": "Round 1 (First Interview)",
                "description": "First problem-solving chat with an engineer.",
                "typical_attrition": "Over 60% turned away due to limited slots"
            },
            {
                "id": "oa_screening",
                "label": "Online Coding Test",
                "description": "College coding test with hidden tests and automated timers.",
                "typical_attrition": "Over 90% filtered out by automated cutoffs"
            },
            {
                "id": "final_round",
                "label": "Final HR & Manager Round",
                "description": "Final conversation with engineering manager or HR.",
                "typical_attrition": "Offers depend on team budget openings"
            }
        ]
    }


@router.post("/seed")
async def seed_qdrant_kb():
    """Seeds or refreshes the Qdrant vector database with verified CBT & Placement data."""
    try:
        rag_service_instance.initialize_qdrant()
        rag_service_instance.seed_knowledge_base()
        return {"success": True, "message": "Qdrant knowledge base successfully seeded."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Qdrant seed failed: {str(e)}")
