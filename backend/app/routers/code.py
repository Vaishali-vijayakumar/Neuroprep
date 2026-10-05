"""
Code Router — run, evaluate, and guide candidate code via Gemini & OpenAI.
"""
from fastapi import APIRouter, HTTPException
from app.models.schemas import CodeRunRequest, CodeRunResponse
from app.services import code_service, interview_memory

router = APIRouter(tags=["code"])


@router.post("/run", response_model=CodeRunResponse)
async def run_code(req: CodeRunRequest):
    # Validate session if one was specified, but allow standalone practice runs
    if req.session_id and req.session_id not in ("standalone", "guest", "default"):
        # We don't block standalone execution even if the session timed out
        pass

    # Execute code with AI guidance
    result = await code_service.run_code(req.source_code, req.language, req.stdin)

    # Complexity analysis powered by Gemini / OpenAI
    complexity = await code_service.analyze_complexity(req.source_code, req.language)

    return CodeRunResponse(**result, complexity=complexity)


@router.post("/analyze")
async def analyze_code(req: CodeRunRequest):
    """Static analysis only — no execution."""
    complexity = await code_service.analyze_complexity(req.source_code, req.language)
    return complexity
