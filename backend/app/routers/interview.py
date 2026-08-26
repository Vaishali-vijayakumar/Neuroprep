"""
Interview Router — REST endpoints for session management.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import StartSessionRequest, StartSessionResponse, ReportRequest
from app.services import interview_memory, ai_brain

router = APIRouter(tags=["interview"])


@router.post("/start", response_model=StartSessionResponse)
async def start_interview(req: StartSessionRequest):
    """Create a new interview session and return the AI greeting."""
    config     = req.config.model_dump()
    session_id = interview_memory.create_session(config)

    # Generate greeting via Gemini
    greeting = await ai_brain.get_next_question(
        session_id=session_id,
        conversation_history=[],
        config=config,
        stress_index=0,
        question_count=0,
        is_first=True,
    )

    interview_memory.append_message(session_id, "ai", greeting)

    return StartSessionResponse(session_id=session_id, greeting=greeting)


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Retrieve current session state."""
    sess = interview_memory.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    return sess


@router.post("/end/{session_id}")
async def end_interview(session_id: str):
    """Mark session as ended."""
    sess = interview_memory.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    interview_memory.end_session(session_id)
    return {"status": "ended", "session_id": session_id}


from fastapi import UploadFile, File

@router.post("/transcribe")
async def transcribe_audio_endpoint(file: UploadFile = File(...)):
    """Transcribe spoken audio with high-precision AI speech recognition."""
    audio_bytes = await file.read()
    mime_type = file.content_type or "audio/webm"
    result = await ai_brain.transcribe_audio_bytes(audio_bytes, mime_type=mime_type)
    return result

