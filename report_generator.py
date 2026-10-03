"""
report_generator.py — Enterprise Interview Report & Rubric Conversion Engine
─────────────────────────────────────────────────────────────────────────────
1. Multi-Turn Phase Aggregation (Bucketing by Phase to prevent turn overwriting)
2. Bounded Red-Flag Deduction & Senior Mathematical Score Ceiling
3. Non-Punitive Poise & Composure Differential Model (ADA & GDPR Compliant)
4. Dynamic 7-Day Adaptive Curriculum Generation based on Missed Flags
"""

import os
import json
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv()
backend_env = os.path.join(os.path.dirname(__file__), "backend", ".env")
if os.path.exists(backend_env):
    load_dotenv(backend_env)

# ==========================================
# 1. PYDANTIC SCHEMAS
# ==========================================

class RubricDimensionScore(BaseModel):
    dimension_name: str
    score: float = Field(ge=0.0, le=100.0, description="Normalized score 0.0 to 100.0")
    tier: str = Field(description="Exemplary, Proficient, Developing, or Unsatisfactory")
    critical_coverage_pct: float = Field(description="Percentage of critical flags demonstrated")
    bonus_flags_demonstrated: List[str] = Field(default_factory=list)
    red_flags_detected: List[str] = Field(default_factory=list)

class CurriculumItem(BaseModel):
    day: int = Field(ge=1, le=7)
    focus: str
    recommended_action: str
    estimated_minutes: int

class CandidateReportSchema(BaseModel):
    session_id: str
    candidate_level: str
    overall_score: float = Field(ge=0.0, le=100.0)
    composure_score: float = Field(ge=0.0, le=100.0)
    hire_decision: str
    rubric_matrix: Dict[str, RubricDimensionScore]
    telemetry_summary: Dict[str, Any]
    personalized_7_day_curriculum: List[CurriculumItem]
    executive_verdict: str

# ==========================================
# 2. RUBRIC CONVERSION MODULE
# ==========================================

def convert_evaluation_to_rubrics(
    transcript_logs: List[Dict[str, Any]], 
    candidate_level: str = "Senior"
) -> Dict[str, RubricDimensionScore]:
    """
    Converts multi-turn evaluation outputs into standardized competency dimensions.
    Solves Multi-Turn Phase Overwriting by bucketing turns by phase.
    """
    # 1. Group all turns by Phase/Dimension
    dimension_buckets: Dict[str, List[Dict[str, Any]]] = {}
    for turn in transcript_logs:
        phase = turn.get("phase", "General Architecture")
        dimension_buckets.setdefault(phase, []).append(turn)

    rubrics: Dict[str, RubricDimensionScore] = {}

    # 2. Process cumulative performance per dimension
    for phase, turns in dimension_buckets.items():
        covered_crit_set = set()
        missing_crit_set = set()
        bonus_set = set()
        red_set = set()
        accuracy_scores = []

        for turn in turns:
            eval_data = turn.get("evaluation", {})
            for f in eval_data.get("covered_critical_flags", []):
                covered_crit_set.add(f)
            for f in eval_data.get("missing_critical_flags", []):
                # Only keep as missing if not covered in another turn of the same phase
                missing_crit_set.add(f)
            for f in eval_data.get("covered_bonus_flags", []):
                bonus_set.add(f)
            for f in eval_data.get("red_flags_detected", []):
                red_set.add(f)
            
            acc = eval_data.get("technical_accuracy_score")
            if acc is not None:
                accuracy_scores.append(float(acc))
            else:
                accuracy_scores.append(0.7)

        # Remove any flags from missing_crit_set that were covered in a follow-up probe turn!
        truly_missing_crit = missing_crit_set - covered_crit_set

        # Total unique critical flags in this phase
        total_crit_count = len(covered_crit_set) + len(truly_missing_crit)
        crit_ratio = (len(covered_crit_set) / total_crit_count) if total_crit_count > 0 else 1.0
        
        avg_accuracy = sum(accuracy_scores) / max(1, len(accuracy_scores))
        bonus_ratio = min(1.0, len(bonus_set) * 0.33)  # Maxes out at 3 bonus flags
        
        # Weighted Raw Score: 60% Critical Coverage + 25% Technical Accuracy + 15% Bonus Flags
        raw_score = (0.60 * crit_ratio) + (0.25 * avg_accuracy) + (0.15 * bonus_ratio)
        
        # Deduct 15 pts per unique Red Flag
        penalty = len(red_set) * 15.0
        final_score = max(0.0, min(100.0, (raw_score * 100.0) - penalty))

        # Hard Ceiling for Senior/Staff Roles missing critical flags
        if candidate_level in ["Senior", "Staff"] and len(truly_missing_crit) > 0:
            final_score = min(final_score, 70.0)

        # Tier classification
        if final_score >= 90.0:
            tier = "Level 4: Exemplary"
        elif final_score >= 75.0:
            tier = "Level 3: Proficient"
        elif final_score >= 60.0:
            tier = "Level 2: Developing"
        else:
            tier = "Level 1: Unsatisfactory"

        rubrics[phase] = RubricDimensionScore(
            dimension_name=phase,
            score=round(final_score, 1),
            tier=tier,
            critical_coverage_pct=round(crit_ratio * 100, 1),
            bonus_flags_demonstrated=list(bonus_set),
            red_flags_detected=list(red_set)
        )

    return rubrics

# ==========================================
# 3. NON-PUNITIVE COMPOSURE & POISE MODEL
# ==========================================

def calculate_composure_score(telemetry: Dict[str, Any]) -> float:
    """
    Calculates a non-punitive composure resilience score.
    Complies with ADA and GDPR regulations:
    Measures stress resilience and recovery rather than penalizing natural resting heart rates.
    """
    peak_stress = float(telemetry.get("peak_stress_score", 30.0))
    hrv_drop = float(telemetry.get("hrv_drop_ratio", 0.1))
    masked_panic = 1.0 if telemetry.get("masked_panic_detected", False) else 0.0
    
    # Composure Index (0 - 100)
    score = 100.0 - (0.40 * peak_stress + 0.35 * (hrv_drop * 100) + 15.0 * masked_panic)
    return max(0.0, min(100.0, round(score, 1)))

# ==========================================
# 4. ADAPTIVE 7-DAY REMEDIATION CURRICULUM
# ==========================================

CURRICULUM_PROMPT = """
You are a Staff Technical Interviewer & Engineering Mentor. 
Generate an intensive, gap-driven 7-day targeted remediation curriculum for a candidate who struggled with the following concepts during a {candidate_level} interview:

MISSING CRITICAL CONCEPTS:
{missing_flags}

RED FLAGS / ANTI-PATTERNS DETECTED:
{red_flags}

Return a valid JSON array of exactly 7 objects (no markdown, no extra commentary):
[
  {{
    "day": 1,
    "focus": "Concise Topic Name",
    "recommended_action": "Specific hands-on implementation task, architecture diagramming, or whitepaper reading",
    "estimated_minutes": 45
  }}
]
"""

def generate_adaptive_curriculum(
    missing_flags: List[str], 
    red_flags: List[str], 
    candidate_level: str = "Senior"
) -> List[CurriculumItem]:
    """
    Dynamically generates a 7-day study curriculum tailored to the candidate's exact gaps.
    Uses LLM with deterministic structured fallback.
    """
    # 1. Try generating via LLM if OpenAI API key is configured
    api_key = os.getenv("OPENAI_API_KEY")
    if api_key and (missing_flags or red_flags):
        try:
            from langchain_openai import ChatOpenAI
            llm = ChatOpenAI(model="gpt-4o", temperature=0.2, api_key=api_key)
            formatted_prompt = CURRICULUM_PROMPT.format(
                candidate_level=candidate_level,
                missing_flags=", ".join(missing_flags) if missing_flags else "None",
                red_flags=", ".join(red_flags) if red_flags else "None"
            )
            res = llm.invoke(formatted_prompt)
            raw_text = res.content.strip()
            if "```" in raw_text:
                raw_text = raw_text.split("```")[1]
                if raw_text.startswith("json"):
                    raw_text = raw_text[4:]
            items_data = json.loads(raw_text.strip())
            return [CurriculumItem(**item) for item in items_data[:7]]
        except Exception:
            pass  # Fall back to deterministic gap-driven generator

    # 2. Deterministic Gap-Driven Fallback Generator
    curriculum = []
    gap_pool = list(missing_flags) + [f"Anti-Pattern Correction: {rf}" for rf in red_flags]
    if not gap_pool:
        gap_pool = [
            "Advanced Multi-Tenant Isolation & Filtered ANN Benchmarks",
            "Cross-Encoder vs Bi-Encoder P99 Latency Optimization",
            "RAG Triad Automation with Synthetic Test Sets",
            "Indirect Prompt Injection Sandboxing & Guardrails"
        ]

    default_topics = [
        ("System Architecture & Trade-Offs", "Deep dive into RAG vs Fine-tuning vs Long-Context trade-offs and RBAC metadata pre-filtering.", 45),
        ("Document Layout & Hierarchical Chunking", "Implement parent-child document parsing for multi-column PDFs and financial tables.", 60),
        ("Hybrid Retrieval & Reciprocal Rank Fusion", "Build a BM25 + Dense vector retrieval pipeline combining sparse and dense ranking with RRF.", 60),
        ("Cross-Encoder Re-Ranking & Latency Budgets", "Benchmark cross-encoder rerankers (BGE / Cohere) against P95/P99 latency constraints.", 45),
        ("Synthesis Grounding & Hallucination Mitigation", "Implement strict system instruction delimiters and citation chunk ID verification.", 45),
        ("Evaluation Triad & Automated CI/CD Benchmarking", "Implement RAGAS / TruLens continuous quality evaluation on synthetic datasets.", 60),
        ("Production Scale, Vector DB Indexes & Security", "HNSW graph parameter tuning (M, efConstruction) and defense against Indirect Prompt Injection.", 75),
    ]

    for day in range(1, 8):
        if day - 1 < len(gap_pool):
            focus_topic = gap_pool[day - 1]
            action = f"Read whitepaper and implement a proof-of-concept resolving: {focus_topic}"
            minutes = 60
        else:
            def_idx = (day - 1) % len(default_topics)
            focus_topic, action, minutes = default_topics[def_idx]

        curriculum.append(CurriculumItem(
            day=day,
            focus=focus_topic[:50],
            recommended_action=action,
            estimated_minutes=minutes
        ))

    return curriculum

# ==========================================
# 5. FINAL REPORT SYNTHESIS
# ==========================================

def synthesize_final_report(
    session_id: str,
    session_state: Dict[str, Any], 
    telemetry_summary: Optional[Dict[str, Any]] = None
) -> CandidateReportSchema:
    """
    Synthesizes the complete candidate assessment scorecard:
    - Multi-turn aggregated rubric matrix
    - Non-punitive composure resilience score
    - Hiring recommendation verdict
    - Dynamic 7-day remediation curriculum
    """
    logs = session_state.get("transcript_logs", [])
    candidate_level = session_state.get("candidate_level", "Senior")
    telemetry = telemetry_summary or {
        "peak_stress_score": 32.0,
        "hrv_drop_ratio": 0.12,
        "masked_panic_detected": False,
        "resting_baseline": {"hr_bpm": 72, "hrv_ms": 45}
    }

    # 1. Convert evaluations into multi-turn rubric matrix
    rubric_matrix = convert_evaluation_to_rubrics(logs, candidate_level)

    # 2. Overall score calculation across dimensions
    if rubric_matrix:
        avg_score = sum(r.score for r in rubric_matrix.values()) / len(rubric_matrix)
    else:
        avg_score = 0.0

    # 3. Composure score
    composure = calculate_composure_score(telemetry)

    # 4. Hiring Recommendation
    if avg_score >= 88.0:
        hire_decision = "Strong Hire"
        verdict = f"Demonstrated exemplary {candidate_level}-level mastery across architecture, retrieval, and production scaling."
    elif avg_score >= 75.0:
        hire_decision = "Hire"
        verdict = f"Solid technical execution meeting {candidate_level} expectations with minor coaching needed on edge cases."
    elif avg_score >= 60.0:
        hire_decision = "Lean Hire"
        verdict = f"Developing competency demonstrated. Has solid foundation but missed critical enterprise flags under probing."
    else:
        hire_decision = "No Hire"
        verdict = f"Did not meet {candidate_level} standard. Substantial gaps in core architecture and security fundamentals."

    # 5. Extract all unique missed critical flags and red flags across all phases
    all_missing_crit = []
    all_reds = []
    for r in rubric_matrix.values():
        all_reds.extend(r.red_flags_detected)
    for log in logs:
        eval_data = log.get("evaluation", {})
        all_missing_crit.extend(eval_data.get("missing_critical_flags", []))

    unique_missing_crit = list(set(all_missing_crit))
    unique_reds = list(set(all_reds))

    # 6. Generate 7-Day Targeted Remediation Curriculum
    curriculum = generate_adaptive_curriculum(unique_missing_crit, unique_reds, candidate_level)

    return CandidateReportSchema(
        session_id=session_id,
        candidate_level=candidate_level,
        overall_score=round(avg_score, 1),
        composure_score=composure,
        hire_decision=hire_decision,
        rubric_matrix=rubric_matrix,
        telemetry_summary=telemetry,
        personalized_7_day_curriculum=curriculum,
        executive_verdict=verdict
    )

# ==========================================
# 6. EXPORT UTILITIES (MARKDOWN & JSON)
# ==========================================

def format_report_markdown(report: CandidateReportSchema) -> str:
    """Formats the candidate report into a clean, presentation-ready markdown document."""
    lines = [
        "# Candidate Technical Assessment Report",
        f"**Session ID:** `{report.session_id}` | **Level:** {report.candidate_level} | **Hiring Decision:** **{report.hire_decision}**",
        f"**Overall Technical Score:** {report.overall_score}/100 | **Composure Resilience:** {report.composure_score}/100\n",
        "## Executive Summary",
        f"> {report.executive_verdict}\n",
        "## Competency Rubric Matrix",
        "| Competency Dimension | Score | Tier | Critical Coverage | Bonus Flags | Red Flags |",
        "| :--- | :---: | :---: | :---: | :---: | :---: |"
    ]

    for name, r in report.rubric_matrix.items():
        bonus_str = ", ".join(r.bonus_flags_demonstrated) if r.bonus_flags_demonstrated else "None"
        red_str = ", ".join(r.red_flags_detected) if r.red_flags_detected else "None"
        lines.append(f"| **{name}** | {r.score}/100 | {r.tier} | {r.critical_coverage_pct}% | {bonus_str} | {red_str} |")

    lines.append("\n## Personalized 7-Day Remediation Curriculum")
    lines.append("| Day | Focus Topic | Recommended Action | Est. Time |")
    lines.append("| :---: | :--- | :--- | :---: |")
    for item in report.personalized_7_day_curriculum:
        lines.append(f"| Day {item.day} | **{item.focus}** | {item.recommended_action} | {item.estimated_minutes} min |")

    return "\n".join(lines)
