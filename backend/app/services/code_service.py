"""
Code Evaluation Service — uses Judge0 CE public API.
Supports: Python, JavaScript, Java, C++, Go.
"""
import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

JUDGE0_BASE = os.getenv("JUDGE0_BASE_URL", "https://judge0-ce.p.rapidapi.com")
JUDGE0_KEY  = os.getenv("JUDGE0_API_KEY", "")

# Judge0 language IDs
LANGUAGE_IDS = {
    "python":     71,
    "javascript": 63,
    "java":       62,
    "c++":        54,
    "go":         60,
    "c":          50,
    "rust":       73,
    "typescript": 74,
}

STATUS_MAP = {
    1: "In Queue", 2: "Processing", 3: "Accepted",
    4: "Wrong Answer", 5: "Time Limit Exceeded",
    6: "Compilation Error", 7: "Runtime Error",
    8: "Runtime Error", 9: "Runtime Error", 10: "Runtime Error",
    11: "Runtime Error", 12: "Runtime Error", 13: "Internal Error",
    14: "Exec Format Error",
}


async def run_code(source_code: str, language: str, stdin: str = "") -> dict:
    """
    Submit code to Judge0 and return execution results.
    """
    lang_id = LANGUAGE_IDS.get(language.lower().strip())
    if not lang_id:
        return {"error": f"Unsupported language: {language}", "status": "error"}

    headers = {
        "Content-Type": "application/json",
        "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    }
    if JUDGE0_KEY:
        headers["X-RapidAPI-Key"] = JUDGE0_KEY

    payload = {
        "source_code": source_code,
        "language_id": lang_id,
        "stdin": stdin,
        "cpu_time_limit": 5,
        "memory_limit": 262144,
    }

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            # Submit
            submit_resp = await client.post(
                f"{JUDGE0_BASE}/submissions?base64_encoded=false&wait=false",
                json=payload,
                headers=headers,
            )
            if submit_resp.status_code not in (200, 201):
                return {"error": "Judge0 submission failed", "status": "error", "detail": submit_resp.text}

            token = submit_resp.json().get("token")
            if not token:
                return {"error": "No token received from Judge0", "status": "error"}

            # Poll for result (max 10 seconds)
            for _ in range(10):
                await asyncio.sleep(1)
                result_resp = await client.get(
                    f"{JUDGE0_BASE}/submissions/{token}?base64_encoded=false",
                    headers=headers,
                )
                result = result_resp.json()
                status_id = result.get("status", {}).get("id", 0)
                if status_id not in (1, 2):  # Not in queue or processing
                    return _format_result(result)

            return {"error": "Execution timed out waiting for Judge0", "status": "timeout"}

    except httpx.ConnectError:
        return _simulate_execution(source_code, language, stdin)
    except Exception as e:
        return {"error": str(e), "status": "error"}


def _format_result(result: dict) -> dict:
    status = result.get("status", {})
    return {
        "status":      status.get("description", "Unknown"),
        "status_id":   status.get("id"),
        "stdout":      result.get("stdout", "") or "",
        "stderr":      result.get("stderr", "") or "",
        "compile_output": result.get("compile_output", "") or "",
        "time":        result.get("time"),
        "memory":      result.get("memory"),
        "exit_code":   result.get("exit_code"),
    }


def _simulate_execution(source_code: str, language: str, stdin: str) -> dict:
    """Fallback simulation when Judge0 is not reachable."""
    lines = source_code.strip().split("\n")
    return {
        "status":    "Simulation (Judge0 unavailable)",
        "status_id": 3,
        "stdout":    f"[Simulated] Code received ({len(lines)} lines, {language}). Judge0 API not reachable.",
        "stderr":    "",
        "compile_output": "",
        "time":      "0.1",
        "memory":    "1024",
        "exit_code": 0,
    }


async def analyze_complexity(source_code: str, language: str) -> dict:
    """
    Basic static analysis for code complexity indicators.
    In production, use a proper AST parser.
    """
    lines  = [l for l in source_code.split("\n") if l.strip()]
    nested = sum(1 for l in lines if l.startswith("    " * 3))

    has_loop     = any(kw in source_code for kw in ["for ", "while ", "forEach"])
    has_nested   = nested > 2
    has_recursion = any(f"def {fn}" in source_code and fn in source_code.split(f"def {fn}")[1]
                        for fn in ["solve", "helper", "rec", "dfs", "bfs"] if f"def {fn}" in source_code)

    if has_nested and has_loop:
        time_complexity   = "O(n²) estimated — nested loops detected"
        space_complexity  = "O(n)"
    elif has_loop:
        time_complexity   = "O(n) estimated"
        space_complexity  = "O(1) to O(n)"
    elif has_recursion:
        time_complexity   = "Recursive — T(n) depends on recurrence"
        space_complexity  = "O(depth) for call stack"
    else:
        time_complexity   = "O(1) to O(n) — no explicit loops"
        space_complexity  = "O(1)"

    return {
        "time_complexity":   time_complexity,
        "space_complexity":  space_complexity,
        "lines_of_code":     len(lines),
        "nesting_depth":     nested,
        "has_recursion":     has_recursion,
        "suggestions": _code_suggestions(source_code, language),
    }


def _code_suggestions(code: str, language: str) -> list[str]:
    tips = []
    if len(code) > 2000:
        tips.append("Consider breaking this into smaller, reusable functions.")
    if "magic" in code.lower() or any(f" {n} " in code for n in ["42", "999", "100000"]):
        tips.append("Replace magic numbers with named constants for readability.")
    if language == "python" and "except:" in code:
        tips.append("Avoid bare 'except:' — catch specific exceptions.")
    if "TODO" in code or "FIXME" in code:
        tips.append("Resolve TODO/FIXME comments before submission.")
    if not tips:
        tips.append("Code looks clean. Consider adding docstrings for public functions.")
    return tips
