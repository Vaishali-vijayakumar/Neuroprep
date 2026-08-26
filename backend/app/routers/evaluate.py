"""
Evaluation Router — per-answer rubric evaluation via Gemini.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import EvaluateRequest
from app.services import interview_memory, ai_brain

router = APIRouter(tags=["evaluate"])


@router.post("/answer")
async def evaluate_answer(req: EvaluateRequest):
    sess = interview_memory.get_session(req.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")

    rubric = await ai_brain.evaluate_answer(
        question=req.question,
        answer=req.answer,
        config=sess["config"],
        stress_index=req.stress_index,
    )

    interview_memory.append_rubric(req.session_id, rubric)
    interview_memory.record_answer(req.session_id, req.question, req.answer)

    return rubric
