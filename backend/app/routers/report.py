"""
Report Router — generates the full AI-powered interview report.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import ReportRequest
from app.services import interview_memory, ai_brain

router = APIRouter(tags=["report"])


@router.post("/generate")
async def generate_report(req: ReportRequest):
    sess = interview_memory.get_session(req.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")

    report = await ai_brain.generate_report(sess)

    # Cache report in session
    interview_memory.update_session(req.session_id, {"final_report": report})

    return report


@router.get("/{session_id}")
async def get_report(session_id: str):
    sess = interview_memory.get_session(session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")
    report = sess.get("final_report")
    if not report:
        raise HTTPException(status_code=404, detail="Report not yet generated. Call POST /report/generate first.")
    return report
