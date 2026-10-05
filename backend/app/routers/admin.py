"""
Admin Router — Protected Administrative Endpoints.
Requires valid administrative authentication via require_admin guard.
"""
import os
import sys
import psutil
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from typing import Dict, Any, List
from app.services.auth_guard import require_admin
from app.services import interview_memory

router = APIRouter(tags=["admin"])


@router.get("/overview")
async def get_admin_overview(admin: Dict[str, Any] = Depends(require_admin)):
    """Return protected administrative health and resource metrics."""
    process = psutil.Process()
    mem_info = process.memory_info()

    return {
        "status": "secure",
        "admin_user": admin.get("email"),
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "system": {
            "python_version": sys.version.split(" ")[0],
            "process_memory_mb": round(mem_info.rss / (1024 * 1024), 2),
            "cpu_percent": psutil.cpu_percent(interval=None),
        },
        "sessions": {
            "active_interview_sessions": len(interview_memory.ACTIVE_SESSIONS) if hasattr(interview_memory, "ACTIVE_SESSIONS") else 0,
        }
    }


@router.get("/sessions")
async def list_active_sessions(admin: Dict[str, Any] = Depends(require_admin)):
    """List all currently active interview sessions for proctoring/oversight."""
    active = getattr(interview_memory, "ACTIVE_SESSIONS", {})
    sanitized_sessions = []
    for sid, sdata in list(active.items()):
        sanitized_sessions.append({
            "session_id": sid,
            "created_at": sdata.get("created_at"),
            "question_count": sdata.get("question_count", 0),
            "track_id": sdata.get("config", {}).get("trackId", "hr"),
            "role": sdata.get("config", {}).get("role", "Software Engineer"),
            "company": sdata.get("config", {}).get("company", "Tech"),
        })
    return {"count": len(sanitized_sessions), "sessions": sanitized_sessions}


@router.post("/terminate-session/{session_id}")
async def force_terminate_session(session_id: str, admin: Dict[str, Any] = Depends(require_admin)):
    """Administratively terminate an interview session."""
    active = getattr(interview_memory, "ACTIVE_SESSIONS", {})
    if session_id in active:
        interview_memory.end_session(session_id)
        return {"status": "success", "message": f"Session {session_id} terminated by administrator {admin.get('email')}."}
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Session {session_id} not found.")
