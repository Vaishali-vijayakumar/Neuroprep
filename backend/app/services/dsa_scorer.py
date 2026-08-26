"""
DSA Scoring Engine — Constraint-Aware Weighted Rubric + Gemini AI Review.

Scoring categories and weights:
  Correctness         40%
  Time Complexity     20%
  Space Complexity    10%
  Test Cases          10%
  Code Quality        10%
  Edge Cases           5%
  Explanation          5%
  Total              100%

Key principle: O(n²) is NOT automatically penalised.
  The engine reads n_upper from problem metadata:
    n <= 1,000        → O(n²) acceptable (full time score)
    n <= 100,000      → O(n²) penalised (half time score)
    n > 100,000       → O(n²) severely penalised (minimum time score)
"""
import os
import re
from typing import Dict, Any, Optional
import google.generativeai as genai
from app.services.code_service import analyze_complexity

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")


async def score_submission(
    source_code: str,
    language: str,
    problem: Dict[str, Any],
    test_result: Dict[str, Any],
    candidate_explanation: str = "",
) -> Dict[str, Any]:
    """
    Main entry point — returns a full DSA score dict with weighted breakdown,
    AI analysis, and adaptive follow-up question.
    """
    n_upper = problem.get("n_upper", 100_000)
    expected_tc = problem.get("expectedComplexity", {}).get("time", "O(n)")
    acceptable_tcs = problem.get("acceptableComplexities", ["O(n)"])
    brute_force_tc = problem.get("bruteForceComplexity", {}).get("time", "O(n²)")

    tests_passed = test_result.get("testsPassed", 0)
    tests_total  = test_result.get("testsTotal", 1)
    pass_rate    = test_result.get("passRate", 0.0)
    failed_cases = test_result.get("failedCases", [])
    runtime_ms   = test_result.get("runtime_avg_ms")
    memory_kb    = test_result.get("memory_peak_kb")

    # ── 1. Deterministic complexity analysis ────────────────────────────────────
    complexity = await analyze_complexity(source_code, language)
    detected_tc = complexity.get("time_complexity", "")
    detected_sc = complexity.get("space_complexity", "")
    nesting     = complexity.get("nesting_depth", 0)

    # ── 2. Correctness score (0–40) ─────────────────────────────────────────────
    correctness_score = round(pass_rate * 40)

    # ── 3. Time Complexity score (0–20) ─────────────────────────────────────────
    tc_score = _score_time_complexity(detected_tc, acceptable_tcs, brute_force_tc, n_upper)

    # ── 4. Space Complexity score (0–10) ────────────────────────────────────────
    sc_score = _score_space_complexity(detected_sc, expected_tc, complexity)

    # ── 5. Test Cases score (0–10) ──────────────────────────────────────────────
    test_score = round(pass_rate * 10)

    # ── 6. Code Quality score (0–10) ────────────────────────────────────────────
    # AI-based + static signals
    quality_score = _static_code_quality(source_code, language, nesting, complexity)

    # ── 7. Edge Cases score (0–5) ───────────────────────────────────────────────
    # Check if failed cases were edge cases (empty, single element, negatives)
    edge_score = _score_edge_cases(failed_cases, pass_rate)

    # ── 8. AI Review — explanation, approach, follow-up (0–5) ──────────────────
    ai_review = await _gemini_code_review(
        source_code,
        language,
        problem,
        detected_tc,
        acceptable_tcs,
        pass_rate,
        failed_cases,
        candidate_explanation,
        n_upper,
    )
    explanation_score = ai_review.get("explanation_score", 3)

    # ── 9. Final Weighted Total ─────────────────────────────────────────────────
    total = (
        correctness_score +
        tc_score +
        sc_score +
        test_score +
        quality_score +
        edge_score +
        explanation_score
    )
    total = max(0, min(100, total))

    # ── 10. Outcome verdict ─────────────────────────────────────────────────────
    is_optimal   = tc_score >= 17 and correctness_score >= 36
    is_correct   = correctness_score >= 32 and tests_passed == tests_total
    is_partial   = 0 < tests_passed < tests_total
    is_incorrect = tests_passed == 0

    if is_optimal:
        outcome = "optimal"
    elif is_correct:
        outcome = "correct_nonoptimal"
    elif is_partial:
        outcome = "partially_correct"
    else:
        outcome = "incorrect"

    return {
        "total":             total,
        "outcome":           outcome,
        "breakdown": {
            "correctness":      correctness_score,
            "max_correctness":  40,
            "time_complexity":  tc_score,
            "max_time":         20,
            "space_complexity": sc_score,
            "max_space":        10,
            "test_cases":       test_score,
            "max_tests":        10,
            "code_quality":     quality_score,
            "max_quality":      10,
            "edge_cases":       edge_score,
            "max_edge":         5,
            "explanation":      explanation_score,
            "max_explanation":  5,
        },
        "complexity_analysis": {
            "detected_time":  detected_tc,
            "detected_space": detected_sc,
            "expected_time":  expected_tc,
            "acceptable":     acceptable_tcs,
            "brute_force":    brute_force_tc,
            "n_upper":        n_upper,
        },
        "test_summary": {
            "passed":       tests_passed,
            "total":        tests_total,
            "pass_rate":    pass_rate,
            "runtime_ms":   runtime_ms,
            "memory_kb":    memory_kb,
            "failed_cases": failed_cases[:3],   # show max 3
        },
        "ai_verdict":      ai_review.get("verdict", ""),
        "ai_analysis":     ai_review.get("analysis", ""),
        "followup_prompt": ai_review.get("followup_prompt", ""),
        "is_brute_force":  tc_score < 12 and is_correct,
        "optimization_hint": problem.get("optimalHint", ""),
    }


# ── Internal Scoring Functions ─────────────────────────────────────────────────

def _score_time_complexity(
    detected: str,
    acceptable: list,
    brute_force: str,
    n_upper: int,
) -> int:
    """Constraint-aware time complexity scoring."""
    det_lower = detected.lower()

    # Map detected to canonical big-O
    is_log       = "log" in det_lower
    is_n2        = "n²" in det_lower or "n^2" in det_lower or ("nested" in det_lower and "loop" in det_lower)
    is_n_log_n   = "n log" in det_lower or "n*log" in det_lower
    is_linear    = "o(n)" in det_lower or ("estimated" in det_lower and "o(n)" in det_lower)
    is_constant  = "o(1)" in det_lower and "loop" not in det_lower
    is_exp       = "2^n" in det_lower or "exponential" in det_lower

    # Exponential: always fail
    if is_exp:
        return 2

    # O(n²) — context-sensitive
    if is_n2:
        if n_upper <= 1_000:
            return 18   # Acceptable for small n
        elif n_upper <= 10_000:
            return 12   # Marginal
        elif n_upper <= 100_000:
            return 8    # Penalised
        else:
            return 2    # Unacceptable

    # O(n log n) — usually acceptable
    if is_n_log_n:
        if "O(n)" in acceptable or "O(n log n)" in acceptable:
            return 16
        return 14

    # O(n) — usually optimal
    if is_linear:
        return 20

    # O(log n)
    if is_log and not is_linear:
        return 20

    # O(1) — great if truly constant
    if is_constant:
        return 19

    # Unknown / recursive — partial credit
    return 10


def _score_space_complexity(detected: str, expected_time: str, complexity: dict) -> int:
    det_lower = detected.lower()
    if "o(1)" in det_lower:
        return 10
    if "o(n)" in det_lower:
        return 8
    if "o(n²)" in det_lower or "n^2" in det_lower:
        return 4
    return 6   # default for recursive/unknown


def _static_code_quality(code: str, language: str, nesting: int, complexity: dict) -> int:
    score = 10
    lines = [l for l in code.split("\n") if l.strip()]

    # Penalise: excessive nesting (>= 4 levels)
    if nesting >= 4:
        score -= 2

    # Penalise: magic numbers
    magic = re.findall(r'\b(?<!\.)\d{3,}\b', code)
    if len(magic) > 3:
        score -= 1

    # Penalise: very long single lines
    if any(len(l) > 120 for l in lines):
        score -= 1

    # Penalise: no variable naming (single-letter vars everywhere)
    single_letter = re.findall(r'\b[a-df-wyz]\b', code)
    if len(single_letter) > 15:
        score -= 1

    # Penalise: TODO/FIXME left in
    if "TODO" in code or "FIXME" in code:
        score -= 1

    # Reward: functions/methods used
    fn_count = code.count("def ") + code.count("function ") + code.count("void ") + code.count("int ") + code.count("boolean ")
    if fn_count >= 2:
        score = min(10, score + 1)

    return max(0, score)


def _score_edge_cases(failed_cases: list, pass_rate: float) -> int:
    if pass_rate == 1.0:
        return 5
    # Check if failures are on edge-case inputs
    edge_patterns = ["empty", "single", "0", "-1", "negative", "1\n"]
    edge_failures = sum(
        1 for f in failed_cases
        if any(p in str(f.get("stdin", "")).lower() for p in edge_patterns)
    )
    if edge_failures == 0 and pass_rate >= 0.8:
        return 4
    if edge_failures > 0:
        return max(0, 3 - edge_failures)
    return max(0, round(pass_rate * 5))


# ── Gemini AI Code Review ──────────────────────────────────────────────────────

async def _gemini_code_review(
    code: str,
    language: str,
    problem: dict,
    detected_tc: str,
    acceptable_tcs: list,
    pass_rate: float,
    failed_cases: list,
    explanation: str,
    n_upper: int,
) -> dict:
    """Use Gemini to generate a qualitative code review, verdict, and follow-up."""

    is_optimal_tc = any(t in detected_tc for t in ["O(n)", "O(1)", "O(log"])
    correct       = pass_rate >= 0.9

    failed_summary = ""
    if failed_cases:
        fc = failed_cases[0]
        failed_summary = (
            f"First failing test — Input: {fc.get('stdin', '?')[:100]}, "
            f"Got: {fc.get('actual', '?')[:80]}, Status: {fc.get('status', '?')}"
        )

    brute_message = ""
    if not is_optimal_tc and correct and n_upper > 10_000:
        brute_message = (
            f"The candidate's solution appears to be O(n²) or higher. "
            f"An O(n) or O(n log n) approach is expected. "
            f"After the review, ask: 'Can you optimise your solution?'"
        )

    prompt = f"""
You are a senior software engineer conducting a live DSA interview code review.

Problem: {problem['title']} ({problem['difficulty']})
Constraints: n <= {n_upper}
Expected optimal complexity: {', '.join(acceptable_tcs)}
Candidate's detected complexity: {detected_tc}
Tests passed: {round(pass_rate * 100)}%
{failed_summary}
{brute_message}

Candidate's {language} code:
```{language}
{code[:1500]}
```

Candidate explanation (if any): "{explanation or 'None provided'}"

Your task — respond in this exact JSON format:
{{
  "verdict": "<one sentence verdict>",
  "analysis": "<2-3 sentences: correctness, approach quality, what was done well>",
  "followup_prompt": "<one targeted follow-up question for the candidate>",
  "explanation_score": <integer 0-5>
}}

Rules:
- If O(n²) but n <= 1000: do NOT penalise complexity, say it's acceptable
- If brute force but n > 100,000: note it and ask candidate to optimise
- If tests failed: ask a diagnostic question pointing at the type of failure (edge case / logic / input parsing)
- If optimal: acknowledge and ask a deeper conceptual follow-up
- Keep verdict concise, analysis honest but encouraging, followup_prompt actionable
"""

    fallback = {
        "verdict": "Solution reviewed.",
        "analysis": "Code has been received and executed against test cases.",
        "followup_prompt": "Can you walk me through your overall approach and time complexity?",
        "explanation_score": 3,
    }

    try:
        model = genai.GenerativeModel(model_name=_MODEL)
        response = model.generate_content(prompt)
        text = response.text.strip()

        # Extract JSON block
        import json
        json_match = re.search(r'\{[\s\S]*\}', text)
        if json_match:
            data = json.loads(json_match.group())
            # Clamp explanation_score
            data["explanation_score"] = max(0, min(5, int(data.get("explanation_score", 3))))
            return data
        return fallback
    except Exception as e:
        return fallback
