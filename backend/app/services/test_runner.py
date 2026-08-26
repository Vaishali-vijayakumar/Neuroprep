"""
Test Runner — Executes sample and hidden test cases against Judge0.

Runs each test case independently and collects:
- Pass/fail per test
- Runtime (ms) and memory (KB)
- Failed case details (expected vs actual)
"""
import asyncio
from typing import List, Dict, Any
from app.services import code_service


async def run_tests(
    source_code: str,
    language: str,
    tests: List[Dict[str, str]],
    mode: str = "sample",  # "sample" | "hidden"
) -> Dict[str, Any]:
    """
    Run a list of test cases against the given source code via Judge0.
    Returns aggregated results.
    """
    if not tests:
        return {
            "testsPassed": 0,
            "testsTotal": 0,
            "passRate": 0.0,
            "failedCases": [],
            "runtime_avg_ms": None,
            "memory_peak_kb": None,
        }

    results = []
    tasks = [
        _run_single_test(source_code, language, t["stdin"], t["expected"])
        for t in tests
    ]
    results = await asyncio.gather(*tasks)

    passed     = sum(1 for r in results if r["passed"])
    total      = len(results)
    runtimes   = [r["runtime_ms"] for r in results if r["runtime_ms"] is not None]
    memories   = [r["memory_kb"] for r in results if r["memory_kb"] is not None]

    failed_cases = []
    for i, r in enumerate(results):
        if not r["passed"]:
            failed_case = {
                "index": i + 1,
                "stdin": tests[i]["stdin"],
                "expected": tests[i]["expected"],
                "actual": r["actual_output"],
                "error": r.get("error", ""),
                "status": r.get("status", ""),
            }
            # In hidden mode don't reveal expected output
            if mode == "hidden":
                failed_case.pop("expected", None)
            failed_cases.append(failed_case)

    return {
        "testsPassed":    passed,
        "testsTotal":     total,
        "passRate":       round(passed / total, 3) if total > 0 else 0.0,
        "failedCases":    failed_cases,
        "runtime_avg_ms": round(sum(runtimes) / len(runtimes), 1) if runtimes else None,
        "memory_peak_kb": max(memories) if memories else None,
    }


async def _run_single_test(
    source_code: str,
    language: str,
    stdin: str,
    expected: str,
) -> Dict[str, Any]:
    """Run one test case and compare output."""
    try:
        exec_result = await code_service.run_code(source_code, language, stdin)
    except Exception as e:
        return {
            "passed": False,
            "actual_output": "",
            "runtime_ms": None,
            "memory_kb": None,
            "error": str(e),
            "status": "Internal Error",
        }

    status     = exec_result.get("status", "")
    stdout     = (exec_result.get("stdout") or "").strip()
    stderr     = (exec_result.get("stderr") or "").strip()
    compile_err = (exec_result.get("compile_output") or "").strip()

    # Compilation failure
    if compile_err or "Compilation Error" in status:
        return {
            "passed": False,
            "actual_output": f"Compilation Error: {compile_err or stderr}",
            "runtime_ms": None,
            "memory_kb": None,
            "error": compile_err or stderr,
            "status": "Compilation Error",
        }

    # Runtime error
    if stderr and not stdout:
        return {
            "passed": False,
            "actual_output": f"Runtime Error: {stderr[:200]}",
            "runtime_ms": None,
            "memory_kb": None,
            "error": stderr,
            "status": "Runtime Error",
        }

    # Normalise and compare
    actual   = _normalise(stdout)
    expected_n = _normalise(expected)
    passed   = actual == expected_n

    # Parse runtime/memory from Judge0 response
    runtime_ms = None
    memory_kb  = None
    try:
        t = exec_result.get("time")
        if t:
            runtime_ms = round(float(t) * 1000, 1)
        m = exec_result.get("memory")
        if m:
            memory_kb = int(m)
    except Exception:
        pass

    return {
        "passed":       passed,
        "actual_output": stdout[:500],
        "runtime_ms":   runtime_ms,
        "memory_kb":    memory_kb,
        "error":        stderr[:200] if not passed and stderr else "",
        "status":       status,
    }


def _normalise(text: str) -> str:
    """Normalise output for comparison: strip whitespace, lowercase."""
    if text is None:
        return ""
    # Collapse all whitespace within each line, strip each line, ignore blank lines
    lines = [" ".join(line.split()) for line in text.strip().splitlines()]
    lines = [l for l in lines if l]
    return "\n".join(lines).lower()
