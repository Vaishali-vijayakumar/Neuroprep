"""
DSA Interview Router — Live compiler + AI code review + Pattern-based sequencing.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from app.services import problem_db, test_runner, dsa_scorer, pattern_manager

router = APIRouter(tags=["dsa"])


# ── Request / Response Models ──────────────────────────────────────────────────

class CodeRunRequest(BaseModel):
    source_code: str
    language:    str = "python"
    problem_id:  str
    session_id:  Optional[str] = None

class CodeSubmitRequest(BaseModel):
    source_code:             str
    language:                str = "python"
    problem_id:              str
    session_id:              Optional[str] = None
    candidate_explanation:   str = ""

class FollowupRequest(BaseModel):
    problem_id:  str
    source_code: str
    language:    str = "python"
    score_total: int = 0
    outcome:     str = ""   # optimal | correct_nonoptimal | partially_correct | incorrect


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/problems")
async def list_problems(difficulty: Optional[str] = None, topic: Optional[str] = None):
    """List problems filtered by difficulty or topic."""
    return {"problems": problem_db.list_problems(difficulty, topic)}


@router.get("/problem/{problem_id}")
async def get_problem(problem_id: str):
    """Fetch a single problem by ID (hides hidden test cases)."""
    problem = problem_db.get_problem(problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem '{problem_id}' not found.")
    # Return problem without hidden tests
    safe = {k: v for k, v in problem.items() if k != "hiddenTests"}
    return safe


@router.get("/session-problems")
async def get_session_problems(difficulty: str = "Mixed", count: int = 3):
    """Pick a balanced set of problems for a DSA interview session."""
    problems = problem_db.get_problems_for_session(difficulty, count)
    return {"problems": [{k: v for k, v in p.items() if k != "hiddenTests"} for p in problems]}


@router.post("/run")
async def run_code_sample(req: CodeRunRequest):
    """
    Run code against SAMPLE (visible) test cases only.
    Used when candidate clicks the [Run] button.
    """
    problem = problem_db.get_problem(req.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem '{req.problem_id}' not found.")

    sample_tests = problem.get("sampleTests", [])
    result = await test_runner.run_tests(
        req.source_code, req.language, sample_tests, mode="sample"
    )
    return {
        "mode":         "sample",
        "problem_id":   req.problem_id,
        "testsPassed":  result["testsPassed"],
        "testsTotal":   result["testsTotal"],
        "passRate":     result["passRate"],
        "failedCases":  result["failedCases"],
        "runtime_ms":   result["runtime_avg_ms"],
        "memory_kb":    result["memory_peak_kb"],
    }


@router.post("/submit")
async def submit_code(req: CodeSubmitRequest):
    """
    Submit code for final evaluation against HIDDEN test cases + AI scoring.
    Used when candidate clicks [Submit].
    Returns full DSA score breakdown + AI review + follow-up prompt.
    """
    problem = problem_db.get_problem(req.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem '{req.problem_id}' not found.")

    # Run ALL tests (sample + hidden combined)
    all_tests = problem.get("sampleTests", []) + problem.get("hiddenTests", [])
    test_result = await test_runner.run_tests(
        req.source_code, req.language, all_tests, mode="hidden"
    )

    # Score submission with constraint-aware weighted rubric
    score_result = await dsa_scorer.score_submission(
        source_code=req.source_code,
        language=req.language,
        problem=problem,
        test_result=test_result,
        candidate_explanation=req.candidate_explanation,
    )

    return {
        "problem_id": req.problem_id,
        "problem_title": problem["title"],
        **score_result,
    }


@router.post("/followup")
async def get_followup(req: FollowupRequest):
    """
    Generate an adaptive follow-up question based on submission outcome.
    Called after submit to continue the interview flow.
    """
    problem = problem_db.get_problem(req.problem_id)
    if not problem:
        raise HTTPException(status_code=404, detail=f"Problem '{req.problem_id}' not found.")

    outcome   = req.outcome
    title     = problem["title"]
    hint      = problem.get("optimalHint", "")
    approach  = problem.get("optimalApproach", "")
    n_upper   = problem.get("n_upper", 100_000)

    if outcome == "optimal":
        followup = (
            f"Excellent — your solution to '{title}' is correct and optimal. "
            f"Can you explain why the {approach} approach gives O(n) and not O(n²)?"
        )
    elif outcome == "correct_nonoptimal":
        followup = (
            f"Your solution to '{title}' passes all test cases, "
            f"but it is running at higher than expected time complexity for n <= {n_upper:,}. "
            f"{hint} Can you refactor it to achieve a better time complexity?"
        )
    elif outcome == "partially_correct":
        followup = (
            f"Your solution to '{title}' passes some but not all test cases. "
            f"Review your edge case handling — what happens when the input is empty or has a single element?"
        )
    else:
        followup = (
            f"Let's debug your solution to '{title}' together. "
            f"Can you trace through your code step by step with the first sample input?"
        )

    return {
        "problem_id":     req.problem_id,
        "outcome":        outcome,
        "followup_prompt": followup,
    }


# ── Pattern-Based Endpoints ────────────────────────────────────────────────────

@router.get("/patterns")
async def list_patterns():
    """
    List all DSA patterns with metadata.
    Used to render the pattern overview on the frontend.
    """
    return {"patterns": pattern_manager.get_all_patterns()}


@router.get("/pattern-session")
async def get_pattern_session(difficulty: str = "Mixed", patterns: str = ""):
    """
    Build a full pattern-ordered session.
    Returns one entry-level problem per pattern, sequenced by difficulty.
    Optional ?patterns=HashMap,Sliding Window,... to restrict to specific patterns.
    """
    selected = [p.strip() for p in patterns.split(",")] if patterns else None
    session  = pattern_manager.build_pattern_session(
        difficulty=difficulty,
        patterns_requested=selected,
    )
    return {
        "mode":    "pattern",
        "session": session,
        "total":   len(session),
    }


class PatternNextRequest(BaseModel):
    pattern_id:    str
    pattern_score: float        # 0–100 weighted score from last submission
    seen_problem_ids: List[str] = []


@router.post("/pattern-next")
async def pattern_next_action(req: PatternNextRequest):
    """
    After a submission in pattern mode, decide what happens next:
    - Score >= 80  → move to next pattern
    - Score 60–79  → give a harder problem in same pattern
    - Score < 60   → show key insight + move on (mark as weakness)
    """
    pat = pattern_manager.get_pattern(req.pattern_id)
    if not pat:
        raise HTTPException(status_code=404, detail=f"Pattern '{req.pattern_id}' not found.")

    result = pattern_manager.decide_next_action(
        pattern_id=req.pattern_id,
        pattern_score=req.pattern_score,
        already_seen=req.seen_problem_ids,
    )

    # Resolve next_pattern details if available
    if result.get("next_pattern"):
        next_pat = pattern_manager.get_pattern(result["next_pattern"])
        result["next_pattern_detail"] = {
            "id":          next_pat["id"],
            "name":        next_pat["name"],
            "description": next_pat["description"],
            "keyInsight":  next_pat["keyInsight"],
        } if next_pat else None

    return result
