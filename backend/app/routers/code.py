"""
Code Router — run and evaluate code via Judge0.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import CodeRunRequest, CodeRunResponse
from app.services import code_service, interview_memory

router = APIRouter(tags=["code"])


@router.post("/run", response_model=CodeRunResponse)
async def run_code(req: CodeRunRequest):
    sess = interview_memory.get_session(req.session_id)
    if not sess:
        raise HTTPException(status_code=404, detail="Session not found")

    # Execute code
    result = await code_service.run_code(req.source_code, req.language, req.stdin)

    # Static complexity analysis
    complexity = await code_service.analyze_complexity(req.source_code, req.language)

    return CodeRunResponse(**result, complexity=complexity)


@router.post("/analyze")
async def analyze_code(req: CodeRunRequest):
    """Static analysis only — no execution."""
    complexity = await code_service.analyze_complexity(req.source_code, req.language)
    return complexity
