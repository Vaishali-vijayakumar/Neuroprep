import os
import re
import json
import html
import pandas as pd
from typing import Dict, List, Optional, Literal, TypedDict
from pydantic import BaseModel, Field
from dotenv import load_dotenv

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langgraph.graph import StateGraph, END

# Load environment variables
load_dotenv()
backend_env = os.path.join(os.path.dirname(__file__), "backend", ".env")
if os.path.exists(backend_env):
    load_dotenv(backend_env)

# ==========================================
# 1. DATA MODELS & ENHANCED SCHEMAS
# ==========================================

class QuestionItem(BaseModel):
    question_id: str
    module_type: str
    phase: str
    difficulty: str
    question_text: str
    critical_flags: List[str]
    bonus_flags: List[str]
    red_flags: List[str]
    follow_up_probes: List[str]

class EnhancedEvaluationOutput(BaseModel):
    technical_accuracy_score: float = Field(
        description="0.0 to 1.0 accuracy score based on factual correctness."
    )
    covered_critical_flags: List[str] = Field(
        default_factory=list,
        description="Critical green flags explicitly covered by candidate."
    )
    missing_critical_flags: List[str] = Field(
        default_factory=list,
        description="Critical flags that candidate failed to address."
    )
    covered_bonus_flags: List[str] = Field(
        default_factory=list,
        description="Advanced/bonus green flags covered."
    )
    red_flags_detected: List[str] = Field(
        default_factory=list,
        description="Technical errors, anti-patterns, or hallucinations detected."
    )
    overall_score: float = Field(
        description="Final weighted score reflecting candidate seniority expectations (0.0 to 1.0)."
    )
    decision: Literal["PROBE", "ADVANCE"] = Field(
        description="PROBE if critical flags are missing and probe_count < 2; else ADVANCE."
    )
    next_statement: str = Field(
        description="Natural, professional interviewer dialogue for the next turn."
    )

class InterviewerState(TypedDict):
    module_type: str                  # Current active module (e.g. RAG_CORE)
    candidate_level: str              # Junior, Mid-Level, Senior
    current_phase_index: int          # 0 to 5 for the 6 phases
    current_question: Optional[dict]  # Loaded CSV question row
    probe_count: int                  # Active probes for the current question (max 2)
    candidate_response: str           # Raw latest input from candidate
    sanitized_response: str           # Cleaned input after Stage 1 guardrails
    interviewer_output: str           # Dialogue spoken back to user
    transcript_logs: List[dict]       # Historical turns with question_id & evaluations
    session_completed: bool           # True when all phases finish

# ==========================================
# 2. STAGE 1: INPUT SANITIZATION & GUARDRAILS
# ==========================================

INJECTION_PATTERNS = [
    r"ignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts)",
    r"system\s+instruction\s+override",
    r"you\s+are\s+now\s+(an?|the)",
    r"output\s+json\s*:",
    r"give\s+me\s+a\s+score\s+of\s+1",
    r"set\s+decision\s*=\s*['\"]?advance",
    r"bypass\s+(guardrails?|evaluation)"
]

def sanitize_candidate_input(raw_text: str) -> tuple[str, Optional[str]]:
    """
    Stage 1 Security Shield:
    1. Unescapes HTML entities and strips HTML/XML boundary tags to prevent delimiter escapes.
    2. Runs regex guardrail classifier to detect adversarial prompt injection attempts.
    Returns: (cleaned_text, attack_warning)
    """
    # 1. Normalize and strip tags
    clean_text = html.unescape(raw_text or "")
    clean_text = re.sub(r"</?[a-zA-Z0-9_\-\s\"'=]+>", " ", clean_text)  # Strip tags like </candidate_response>
    clean_text = clean_text.replace("<", " ").replace(">", " ")          # Neutralize lone brackets
    clean_text = " ".join(clean_text.split())

    # 2. Guardrail injection check
    for pattern in INJECTION_PATTERNS:
        if re.search(pattern, clean_text, re.IGNORECASE):
            return clean_text, f"Prompt Injection attempt detected matching pattern: {pattern}"

    return clean_text, None

# ==========================================
# 3. CSV RETRIEVAL & QUESTION REGISTRY
# ==========================================

MODULE_PHASES = [
    "Phase 1: Architecture",
    "Phase 2: Ingestion",
    "Phase 3: Retrieval",
    "Phase 4: Synthesis",
    "Phase 5: Evaluation",
    "Phase 6: Production"
]

class QuestionRetriever:
    def __init__(self, csv_path: str):
        if not os.path.exists(csv_path):
            raise FileNotFoundError(f"Questions CSV file not found at: {csv_path}")
        self.df = pd.read_csv(csv_path)

    def get_question(self, module_type: str, phase: str, difficulty: str) -> dict:
        filtered = self.df[
            (self.df['module_type'] == module_type) &
            (self.df['phase'] == phase) &
            (self.df['difficulty'] == difficulty)
        ]
        
        # Fallback to any difficulty if exact match isn't available
        if filtered.empty:
            filtered = self.df[
                (self.df['module_type'] == module_type) & 
                (self.df['phase'] == phase)
            ]
            
        if filtered.empty:
            raise ValueError(f"No questions found in CSV for module={module_type}, phase={phase}")
            
        row = filtered.sample(1).to_dict(orient="records")[0]
        
        # Helper to parse pipe-separated values
        def parse_pipes(key: str, fallback_key: Optional[str] = None) -> List[str]:
            val = row.get(key)
            if (val is None or pd.isna(val)) and fallback_key:
                val = row.get(fallback_key)
            if not val or pd.isna(val):
                return []
            return [x.strip() for x in str(val).split("|") if x.strip()]

        return {
            "question_id": str(row["question_id"]),
            "module_type": str(row["module_type"]),
            "phase": str(row["phase"]),
            "difficulty": str(row["difficulty"]),
            "question_text": str(row["question_text"]),
            "critical_flags": parse_pipes("critical_flags", "expected_green_flags"),
            "bonus_flags": parse_pipes("bonus_flags"),
            "red_flags": parse_pipes("red_flags"),
            "follow_up_probes": parse_pipes("follow_up_probes")
        }

# ==========================================
# 4. ENHANCED EVALUATION PROMPT & LLM JUDGE
# ==========================================

ENHANCED_EVALUATION_PROMPT = ChatPromptTemplate.from_template("""
You are a Staff Technical Interviewer evaluating a {candidate_level} candidate in the **{module_type}** module.

[CONTEXT & QUESTION]:
Phase: {phase}
Primary Question: {question_text}

[EVALUATION RUBRIC]:
Critical (Must-Have) Flags: {critical_flags}
Bonus (Advanced) Flags: {bonus_flags}
Red Flags / Anti-Patterns: {red_flags}
Available Probes for this topic: {follow_up_probes}

[CANDIDATE INPUT HISTORY]:
{combined_candidate_context}

INSTRUCTIONS:
1. Compare the cumulative candidate statements against Critical and Bonus flags.
2. Identify any technical Red Flags, misconceptions, or hallucinations.
3. Compute 'overall_score' (0.0 to 1.0):
   - If ANY Critical Flag is missing for a Senior role, overall_score MUST NOT exceed 0.70.
   - Deduct heavily for any Red Flags detected.
4. Decision Logic:
   - If overall_score < 0.75 AND probe_count < 2: Set decision = "PROBE". Choose or tailor a focused follow-up probe testing the missing critical concepts.
   - Otherwise: Set decision = "ADVANCE".
5. Write natural, conversational interviewer dialogue in 'next_statement'. Acknowledge good points briefly, then deliver the probe or transition.
""")

def get_llm():
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set. Please add it to your .env file.")
    # Uses gpt-4o or gpt-4o-mini with low temperature for consistent evaluation
    return ChatOpenAI(model="gpt-4o", temperature=0.1, api_key=api_key)

# ==========================================
# 5. STATE MACHINE NODES
# ==========================================

def initialize_session_node(state: InterviewerState, retriever: QuestionRetriever) -> Dict:
    """Selects the initial question for Phase 1 and resets state."""
    first_phase = MODULE_PHASES[0]
    question = retriever.get_question(
        module_type=state["module_type"],
        phase=first_phase,
        difficulty=state["candidate_level"]
    )
    
    return {
        "current_phase_index": 0,
        "current_question": question,
        "probe_count": 0,
        "candidate_response": "",
        "sanitized_response": "",
        "interviewer_output": f"Welcome! Let's begin the **{state['module_type']}** evaluation.\n\n{question['question_text']}",
        "session_completed": False,
        "transcript_logs": []
    }

def evaluate_response_node(state: InterviewerState, retriever: QuestionRetriever, structured_evaluator) -> Dict:
    """
    Enhanced Evaluation Node:
    - Stage 1: Input sanitization & injection guardrail
    - Stage 2: Cumulative Context Assembly across active probes
    - Stage 3: LLM Judge with weighted scoring rubric
    - Stage 4: Mathematical score floor & FSM State Transitions
    """
    q = state["current_question"]
    raw_response = state["candidate_response"]
    probe_count = state["probe_count"]

    # ----------------------------------------------------
    # STAGE 1: Sanitization & Pre-LLM Guardrail Defense
    # ----------------------------------------------------
    sanitized_response, injection_warning = sanitize_candidate_input(raw_response)

    if injection_warning:
        # Prompt injection detected: immediate adversarial mitigation
        eval_result = EnhancedEvaluationOutput(
            technical_accuracy_score=0.0,
            covered_critical_flags=[],
            missing_critical_flags=q["critical_flags"],
            covered_bonus_flags=[],
            red_flags_detected=["Adversarial Prompt Injection / Delimiter Escape Attempt"],
            overall_score=0.0,
            decision="PROBE" if probe_count < 2 else "ADVANCE",
            next_statement="Please provide a direct technical explanation addressing the question rather than instructions or meta-prompts."
        )
    else:
        # ----------------------------------------------------
        # STAGE 2: Cumulative Context Assembly
        # ----------------------------------------------------
        if probe_count > 0:
            current_q_id = q["question_id"]
            prior_turns = [t for t in state["transcript_logs"] if t.get("question_id") == current_q_id]
            history_blocks = []
            for idx, pt in enumerate(prior_turns, 1):
                prev_cand = pt.get("candidate_response", "")
                prev_interviewer = pt.get("evaluation", {}).get("next_statement", "")
                history_blocks.append(
                    f"[Turn {idx} Candidate Response]: \"{prev_cand}\"\n"
                    f"[Interviewer Probe]: \"{prev_interviewer}\""
                )
            history_blocks.append(f"[Current Candidate Follow-Up Response]: \"{sanitized_response}\"")
            combined_candidate_context = "\n\n".join(history_blocks)
        else:
            combined_candidate_context = f"[Candidate Response]: \"{sanitized_response}\""

        # ----------------------------------------------------
        # STAGE 3: Structured Evaluation Execution
        # ----------------------------------------------------
        prompt_args = {
            "module_type": state["module_type"],
            "candidate_level": state["candidate_level"],
            "phase": q["phase"],
            "question_text": q["question_text"],
            "critical_flags": ", ".join(q["critical_flags"]) if q["critical_flags"] else "None",
            "bonus_flags": ", ".join(q["bonus_flags"]) if q["bonus_flags"] else "None",
            "red_flags": ", ".join(q["red_flags"]) if q["red_flags"] else "None",
            "follow_up_probes": ", ".join(q["follow_up_probes"]) if q["follow_up_probes"] else "None",
            "combined_candidate_context": combined_candidate_context
        }

        try:
            eval_result: EnhancedEvaluationOutput = structured_evaluator.invoke(
                ENHANCED_EVALUATION_PROMPT.format(**prompt_args)
            )
        except Exception as e:
            # Fallback in case of external API rate limits or network issues
            print(f"[Warning] Structured Evaluator Error: {e}. Applying resilient fallback evaluation.")
            eval_result = _fallback_rule_evaluator(sanitized_response, q, state["candidate_level"], probe_count)

    # ----------------------------------------------------
    # STAGE 4: Mathematical Score Floor & FSM Decision Logic
    # ----------------------------------------------------
    # Hard Ceiling: If any Critical Flag is missing for Senior level, cap overall_score at 0.70
    if state["candidate_level"] == "Senior" and len(eval_result.missing_critical_flags) > 0:
        eval_result.overall_score = min(eval_result.overall_score, 0.70)

    # Circuit Breaker: Max 2 probes per primary question
    decision = eval_result.decision
    if decision == "PROBE" and probe_count >= 2:
        decision = "ADVANCE"

    logs = list(state["transcript_logs"])
    logs.append({
        "question_id": q["question_id"],
        "phase": q["phase"],
        "turn": probe_count + 1,
        "question": q["question_text"],
        "candidate_response": raw_response,
        "sanitized_response": sanitized_response,
        "evaluation": eval_result.model_dump()
    })

    if decision == "PROBE":
        return {
            "probe_count": probe_count + 1,
            "sanitized_response": sanitized_response,
            "interviewer_output": eval_result.next_statement,
            "transcript_logs": logs
        }
    else:
        # ADVANCE to next phase in funnel
        next_phase_idx = state["current_phase_index"] + 1

        if next_phase_idx < len(MODULE_PHASES):
            next_phase_name = MODULE_PHASES[next_phase_idx]
            next_q = retriever.get_question(
                module_type=state["module_type"],
                phase=next_phase_name,
                difficulty=state["candidate_level"]
            )
            combined_statement = f"{eval_result.next_statement}\n\nLet's move to **{next_phase_name}**:\n{next_q['question_text']}"
            return {
                "current_phase_index": next_phase_idx,
                "current_question": next_q,
                "probe_count": 0,
                "sanitized_response": sanitized_response,
                "interviewer_output": combined_statement,
                "transcript_logs": logs
            }
        else:
            # Funnel Complete
            return {
                "session_completed": True,
                "sanitized_response": sanitized_response,
                "interviewer_output": f"{eval_result.next_statement}\n\nThat concludes all 6 evaluation phases! Generating your final scorecard...",
                "transcript_logs": logs
            }

def _fallback_rule_evaluator(candidate_text: str, q: dict, candidate_level: str, probe_count: int) -> EnhancedEvaluationOutput:
    """Deterministic fallback evaluator when LLM quota is unavailable."""
    lower_text = candidate_text.lower()
    covered_crit = [f for f in q["critical_flags"] if any(w.lower() in lower_text for w in f.split("/"))]
    missing_crit = [f for f in q["critical_flags"] if f not in covered_crit]
    covered_bonus = [f for f in q["bonus_flags"] if any(w.lower() in lower_text for w in f.split("/"))]
    reds = [f for f in q["red_flags"] if any(w.lower() in lower_text for w in f.split()[:2])]

    ratio = len(covered_crit) / max(len(q["critical_flags"]), 1)
    base_score = 0.5 * ratio + (0.3 if not reds else 0.0) + 0.2 * (len(covered_bonus) / max(len(q["bonus_flags"]), 1))
    if candidate_level == "Senior" and missing_crit:
        base_score = min(base_score, 0.70)

    decision = "PROBE" if (base_score < 0.75 and probe_count < 2 and q["follow_up_probes"]) else "ADVANCE"
    if decision == "PROBE" and q["follow_up_probes"]:
        probe = q["follow_up_probes"][min(probe_count, len(q["follow_up_probes"]) - 1)]
        dialogue = f"Understood. Probing deeper: {probe}"
    else:
        dialogue = "Good points covered. Let's proceed to the next topic."

    return EnhancedEvaluationOutput(
        technical_accuracy_score=round(base_score, 2),
        covered_critical_flags=covered_crit,
        missing_critical_flags=missing_crit,
        covered_bonus_flags=covered_bonus,
        red_flags_detected=reds,
        overall_score=round(base_score, 2),
        decision=decision,
        next_statement=dialogue
    )

# ==========================================
# 6. GRAPH CONSTRUCTION
# ==========================================

def build_interviewer_graph(retriever: QuestionRetriever, structured_evaluator):
    workflow = StateGraph(InterviewerState)
    workflow.add_node("evaluate", lambda s: evaluate_response_node(s, retriever, structured_evaluator))
    workflow.set_entry_point("evaluate")
    workflow.add_edge("evaluate", END)
    return workflow.compile()

# ==========================================
# 7. INTERACTIVE RUNNER & SCORECARD
# ==========================================

def run_interview():
    csv_file = os.path.join(os.path.dirname(__file__), "interview_questions.csv")
    retriever = QuestionRetriever(csv_file)
    
    try:
        llm = get_llm()
        structured_evaluator = llm.with_structured_output(EnhancedEvaluationOutput)
    except Exception as e:
        print(f"[Note] Running with resilient rule-based evaluator: {e}")
        structured_evaluator = None

    graph = build_interviewer_graph(retriever, structured_evaluator)
    
    session_state: InterviewerState = {
        "module_type": "RAG_CORE",
        "candidate_level": "Senior",
        "current_phase_index": 0,
        "current_question": None,
        "probe_count": 0,
        "candidate_response": "",
        "sanitized_response": "",
        "interviewer_output": "",
        "transcript_logs": [],
        "session_completed": False
    }

    init_update = initialize_session_node(session_state, retriever)
    session_state.update(init_update)
    
    print("\n" + "="*60)
    print("      AI INTERVIEWER ENGINE (ENHANCED EVALUATOR ACTIVE)   ")
    print("="*60)
    print(f"\nInterviewer: {session_state['interviewer_output']}\n")

    while not session_state["session_completed"]:
        try:
            user_input = input("Candidate Response: ")
        except (EOFError, KeyboardInterrupt):
            print("\nSession ended by user.")
            break
            
        if user_input.strip().lower() in ["exit", "quit"]:
            print("\nExiting session.")
            break

        session_state["candidate_response"] = user_input
        result = graph.invoke(session_state)
        session_state.update(result)

        print(f"\nInterviewer: {session_state['interviewer_output']}\n")

    # Generate Final Report & Multi-Turn Rubric Matrix
    if session_state["transcript_logs"]:
        from report_generator import synthesize_final_report, format_report_markdown
        import uuid
        
        session_id = f"sess_{uuid.uuid4().hex[:8]}"
        final_report = synthesize_final_report(
            session_id=session_id,
            session_state=session_state,
            telemetry_summary={
                "peak_stress_score": 28.0,
                "hrv_drop_ratio": 0.08,
                "masked_panic_detected": False,
                "resting_baseline": {"hr_bpm": 72, "hrv_ms": 45}
            }
        )

        # Print Executive Markdown Report
        print("\n" + "="*65)
        print(format_report_markdown(final_report))
        print("="*65)

        # Persist report to JSON artifact
        report_file = os.path.join(os.path.dirname(__file__), "latest_candidate_report.json")
        with open(report_file, "w", encoding="utf-8") as f:
            f.write(json.dumps(final_report.model_dump(), indent=2))
        print(f"\n[Report Exported] Saved full candidate report to: {report_file}")

if __name__ == "__main__":
    run_interview()
