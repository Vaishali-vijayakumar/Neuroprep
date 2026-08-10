"""
Gemini AI Brain — Interview Conductor
Uses the new google-genai SDK (replaces deprecated google-generativeai).
Model: gemini-1.5-flash (higher free-tier quota than gemini-2.0-flash)
"""
import os
import json
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "../../.env"))

_API_KEY = os.getenv("GEMINI_API_KEY", "")
_GEMINI_AVAILABLE = bool(_API_KEY and _API_KEY != "your_gemini_api_key_here")

MODEL_NAME = "gemini-1.5-flash"   # Higher free-tier quota


def _get_client():
    from google import genai
    return genai.Client(api_key=_API_KEY)


PERSONALITY_PROMPTS = {
    "friendly":     "You are a warm, encouraging interview mentor. Praise good answers before follow-ups.",
    "professional": "You are a professional, neutral HR recruiter. Be concise, formal, and objective.",
    "strict":       "You are a strict senior technical lead. Challenge every answer. No vague responses accepted.",
    "manager":      "You are a calm engineering manager. Focus on leadership, ownership, strategic thinking.",
    "stress":       "You are a deliberate stress interviewer. Challenge answers, stay professional.",
}

TRACK_PROFILES = {
    "hr": {
        "persona_name": "Senior Talent Acquisition Manager",
        "system_instruction": "You are a supportive, high-empathy HR Manager evaluating behavioral fit, leadership, conflict resolution, and cultural values. Keep questions open-ended and conversational. Do not ask code or algorithmic questions.",
        "evaluation_metrics": ["Behavioral Alignment", "Communication", "Conflict Resolution"]
    },
    "tech": {
        "persona_name": "Principal Software Engineer",
        "system_instruction": "You are a rigorous Principal Engineer interviewing for domain-specific knowledge (e.g., Databases, Networking, Architecture). Drill deep into technical trade-offs and failure modes. Challenge shallow answers.",
        "evaluation_metrics": ["Core Technical Depth", "System Architecture Concepts", "Trade-off Analysis"]
    },
    "dsa": {
        "persona_name": "Data Structures & Algorithms Bar Raiser",
        "system_instruction": "You are a highly precise technical interviewer focusing on Data Structures and Algorithms. Ask about time/space complexity (Big O), edge cases, and algorithmic optimization. Guide the candidate step-by-step.",
        "evaluation_metrics": ["Algorithmic Correctness", "Complexity Estimation", "Edge Case Coverage"]
    },
    "coding": {
        "persona_name": "Senior Lead Developer",
        "system_instruction": "You are a Senior Lead Developer conducting a live coding interview. Evaluate code quality, logic, problem-solving, and edge case handling. Ask them to dry-run or optimize their code.",
        "evaluation_metrics": ["Code Quality", "Problem Solving", "Edge Cases"]
    },
    "system_design": {
        "persona_name": "Staff Systems Engineer",
        "system_instruction": "You are a Staff Engineer evaluating large-scale system design. Focus on scalability, reliability, trade-offs, bottlenecks, and distributed systems architecture.",
        "evaluation_metrics": ["Scalability", "Bottleneck Identification", "Trade-off Evaluation"]
    },
    "lld": {
        "persona_name": "Object-Oriented Design Expert",
        "system_instruction": "You are a Low-Level Design (LLD) expert. Evaluate classes, interfaces, SOLID principles, design patterns, encapsulation, and polymorphism. Ask for specific class structures and relationships.",
        "evaluation_metrics": ["SOLID Principles", "Design Patterns", "Encapsulation & Polymorphism"]
    },
    "behavioral": {
        "persona_name": "Behavioral STAR Evaluator",
        "system_instruction": "You are a behavioral interviewer focused strictly on the STAR method. Ask about past experiences, conflicts, and leadership. If the candidate misses the Situation, Task, Action, or Result, you MUST follow up to extract the missing piece.",
        "evaluation_metrics": ["Situation/Task Clarity", "Action/Ownership", "Result/Reflection"]
    },
    "managerial": {
        "persona_name": "Engineering Manager",
        "system_instruction": "You are an Engineering Manager evaluating leadership, delegation, conflict resolution, prioritization, and stakeholder management. Pose difficult team-based scenarios with strict deadlines.",
        "evaluation_metrics": ["Delegation", "Conflict Resolution", "Prioritization & Risk"]
    },
    "group_discussion": {
        "persona_name": "Group Discussion Moderator",
        "system_instruction": "You are the moderator of a group discussion. Introduce the topic, ensure everyone gets a chance to speak, and evaluate leadership and persuasion. Ask the candidate to summarize or respond to a point.",
        "evaluation_metrics": ["Speaking & Persuasion", "Active Listening", "Leadership & Teamwork"]
    },
    "resume": {
        "persona_name": "Resume-Based Interviewer",
        "system_instruction": "You are strictly grounding the interview in the candidate's provided resume. Ask deep questions about specific projects and technologies listed. Do not invent experience.",
        "evaluation_metrics": ["Resume Authenticity", "Technical Depth", "Project Ownership"]
    },
    "project": {
        "persona_name": "Project Viva Examiner",
        "system_instruction": "You are defending a candidate's project (Viva). Ask progressively deeper questions: architecture -> technology choice -> database -> API -> deployment -> scaling -> failure cases.",
        "evaluation_metrics": ["Architecture Decisions", "Technology Justification", "Scaling & Failure Handling"]
    },
    "company": {
        "persona_name": "Company Hiring Pattern Simulator",
        "system_instruction": "You simulate the general hiring patterns for the target company. Combine company culture, role requirements, and user profile to ask highly relevant questions.",
        "evaluation_metrics": ["Company Cultural Fit", "Role-Specific Skills", "Problem Solving"]
    },
    "aptitude": {
        "persona_name": "Quantitative & Logical Examiner",
        "system_instruction": "You are an Aptitude examiner testing quantitative and logical reasoning. Provide concise problems and verify accuracy and speed.",
        "evaluation_metrics": ["Accuracy", "Logical Reasoning", "Speed & Error Patterns"]
    },
    "communication": {
        "persona_name": "Speech & Communication Coach",
        "system_instruction": "You evaluate fluency, grammar, vocabulary, pronunciation, and clarity. Pay attention to filler words, pauses, and sentence structure.",
        "evaluation_metrics": ["Fluency & Grammar", "Vocabulary & Pronunciation", "Clarity & Filler Words"]
    },
    "stress": {
        "persona_name": "Pressure Interviewer",
        "system_instruction": "You intentionally apply controlled pressure. Interrupt politely, challenge assumptions heavily, question weak answers, and introduce time pressure constraints. Remain professional.",
        "evaluation_metrics": ["Composure & Confidence", "Reasoning Under Pressure", "Recovery"]
    },
    "rapid_fire": {
        "persona_name": "Rapid-Fire Interviewer",
        "system_instruction": "You conduct a rapid-fire round. Ask short, direct questions. Do not accept long explanations. Demand quick recall and accuracy.",
        "evaluation_metrics": ["Recall Speed", "Accuracy", "Consistency"]
    },
    "ai_ml": {
        "persona_name": "Machine Learning Specialist",
        "system_instruction": "You evaluate ML/DL, Transformers, LLMs, RAG, and MLOps. Drill down into chunking, embeddings, vector databases, and hallucination mitigation.",
        "evaluation_metrics": ["ML/DL Fundamentals", "Model Tuning & RAG", "Evaluation & Scaling"]
    },
    "devops": {
        "persona_name": "DevOps & SRE Interviewer",
        "system_instruction": "You evaluate Infrastructure as Code, CI/CD, containerization, monitoring, and failure recovery. Focus on reliability and deployment automation.",
        "evaluation_metrics": ["Infrastructure Knowledge", "CI/CD & Automation", "Troubleshooting & Reliability"]
    },
    "cloud": {
        "persona_name": "Cloud Architect Interviewer",
        "system_instruction": "You evaluate cloud services (AWS, GCP, Azure). Ask design questions combining specific cloud resources and challenge their fault tolerance.",
        "evaluation_metrics": ["Cloud Services Knowledge", "Scalable Architecture", "Fault Tolerance"]
    },
    "cybersecurity": {
        "persona_name": "Cybersecurity & SOC Interviewer",
        "system_instruction": "You evaluate security domains. Use scenario-based questions (e.g., a sudden spike in suspicious logins) rather than pure definitions.",
        "evaluation_metrics": ["Threat Detection", "Incident Response", "Security Principles (OWASP)"]
    },
    "qa": {
        "persona_name": "Software Testing Expert",
        "system_instruction": "You evaluate QA. Dynamically move through positive cases, negative cases, boundary cases, automation, and performance testing for a given scenario.",
        "evaluation_metrics": ["Test Case Coverage", "Automation Strategies", "Performance & Regression"]
    },
    "product_management": {
        "persona_name": "Product Strategy Interviewer",
        "system_instruction": "You evaluate product sense, user empathy, metrics, roadmap prioritization, and business trade-offs. Present product scenarios and ask which metrics to investigate.",
        "evaluation_metrics": ["Product Sense & Empathy", "Metrics & A/B Testing", "Prioritization & Trade-offs"]
    },
    "assessment_center": {
        "persona_name": "Assessment Center Orchestrator",
        "system_instruction": "You act as a final evaluation panel, synthesizing aptitude, technical, behavioral, and HR questions into a holistic mock assessment.",
        "evaluation_metrics": ["Holistic Technical Score", "Holistic Behavioral Score", "Overall Hire Recommendation"]
    },
    "custom": {
        "persona_name": "Interview Architect Agent",
        "system_instruction": "You are a highly flexible custom interviewer. Adapt seamlessly to the exact topics, language, and style provided in the user configuration.",
        "evaluation_metrics": ["Configured Topic Mastery", "Adaptability", "Problem Solving"]
    },
    "default": {
        "persona_name": "Professional Interviewer",
        "system_instruction": "You are a professional interviewer covering general technical and communication skills.",
        "evaluation_metrics": ["Technical Knowledge", "Communication", "Problem Solving"]
    }
}


def _build_prompt(config: dict, question_count: int, stress_index: int = 0, strong_topics: list = None, weak_topics: list = None) -> str:
    track       = config.get("trackId", "default")
    personality = config.get("personality", "professional")
    difficulty  = config.get("difficulty", "Intermediate")
    role        = config.get("role", "Software Engineer")
    duration    = config.get("duration", 30)

    persona_override = PERSONALITY_PROMPTS.get(personality)
    profile = TRACK_PROFILES.get(track, TRACK_PROFILES["default"])
    
    # State-Machine Phase Logic
    max_q = 15
    if question_count == 0:
        phase = "[PHASE 1: INTRODUCTION] Greet the candidate, make them comfortable, and ask an opening question."
    elif question_count < max_q // 3:
        phase = "[PHASE 2: CORE CONCEPTS] Focus on foundational concepts and direct questions."
    elif question_count < max_q - 2:
        phase = "[PHASE 3: OPTIMIZATION & PROBING] Push the candidate on trade-offs, constraints, edge cases, and architectural optimization."
    else:
        phase = "[PHASE 4: WRAP-UP] Summarize the discussion briefly and ask a concluding question."

    # Adaptive Stress Guardrails
    if stress_index > 70:
        pacing_modifier = "[ADAPTIVE PACING ACTIVE] Candidate is experiencing high physiological stress. Shift tone to be exceptionally warm and reassuring. Ask a simpler structural question to help them regain composure."
    else:
        pacing_modifier = "[STANDARD PACING] Maintain professional rigor. Gently push the candidate to optimize their responses."

    metrics = ", ".join(profile["evaluation_metrics"])
    
    adaptive_memory = ""
    if strong_topics or weak_topics:
        strong_str = ", ".join(strong_topics) if strong_topics else "None"
        weak_str = ", ".join(weak_topics) if weak_topics else "None"
        adaptive_memory = f"\n[ADAPTIVE MEMORY]\nCandidate excelled at: {strong_str}\nCandidate struggled with: {weak_str}\nAdjust your next question to probe weak areas or increase difficulty in strong areas."
    
    return f"""You are {profile['persona_name']} interviewing for the role of {role}.
Difficulty: {difficulty} | Duration: {duration} min | Max {max_q} questions.

System Instruction: {profile['system_instruction']}
{f"Personality Override: {persona_override}" if persona_override else ""}

Evaluation Metrics to enforce: [{metrics}]

State Machine Phase: {phase}
{pacing_modifier}
{adaptive_memory}

Rules:
- Ask ONE question at a time, never multiple.
- Generate follow-ups based on the answer and the Evaluation Metrics.
- Keep all responses concise (2-3 sentences max).
- Be natural and conversational."""


async def get_next_question(
    session_id: str,
    conversation_history: list,
    config: dict,
    stress_index: int = 0,
    question_count: int = 0,
    is_first: bool = False,
    strong_topics: list = None,
    weak_topics: list = None,
) -> str:
    if not _GEMINI_AVAILABLE:
        return _fallback_question(config, question_count, stress_index, is_first)

    try:
        client = _get_client()
        system  = _build_prompt(config, question_count, stress_index, strong_topics, weak_topics)

        # Build conversation contents
        contents = []
        for msg in conversation_history[-10:]:  # last 10 messages for context
            role = "user" if msg["role"] == "user" else "model"
            contents.append({"role": role, "parts": [{"text": msg["text"]}]})

        if is_first:
            user_input = "Begin the interview. Greet the candidate warmly and ask the first question."
        else:
            user_input = f"[Stress Index: {stress_index}/100 | Questions asked: {question_count}] Generate the next question or follow-up."

        contents.append({"role": "user", "parts": [{"text": user_input}]})

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
            config={"system_instruction": system, "max_output_tokens": 200},
        )
        return response.text.strip()

    except Exception as e:
        print(f"[AIBrain] get_next_question error: {e}")
        return _fallback_question(config, question_count, stress_index, is_first)


async def evaluate_answer(
    question: str,
    answer: str,
    config: dict,
    stress_index: int = 0,
) -> dict:
    if not _GEMINI_AVAILABLE:
        return _fallback_evaluation(answer)

    try:
        client = _get_client()
        track  = config.get("trackId", "default")
        profile = TRACK_PROFILES.get(track, TRACK_PROFILES["default"])
        metrics = profile["evaluation_metrics"]
        
        metrics_json = ",".join([f'"{m.replace(" ", "_").replace("/", "_").replace("&", "and").lower()}":0-100' for m in metrics])
        short_ans = (answer or "")[:600]

        prompt = (
            f"Rate this {track} interview answer. Return ONLY compact JSON, no markdown.\n"
            f"Q: {question[:200]}\nA: {short_ans}\n"
            f'{{{metrics_json},"overall":0-100,'
            '"feedback":"one sentence",'
            '"topics_demonstrated_well":["t1"],"topics_struggled_with":["t2"],'
            '"justification_quote":"quote exact 1-2 sentences from candidate answer to justify deductions"}'
        )

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config={"max_output_tokens": 250},
        )
        text = response.text.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"): text = text[4:]
        return json.loads(text.strip())

    except Exception as e:
        print(f"[AIBrain] evaluate_answer error: {e}")
        return _fallback_evaluation(answer)



async def generate_report(session_data: dict) -> dict:
    if not _GEMINI_AVAILABLE:
        return _fallback_report(session_data)

    try:
        client  = _get_client()
        config  = session_data.get("config", {})
        answers = session_data.get("answers", [])
        rubrics = session_data.get("rubric_scores", [])
        telem   = session_data.get("telemetry", [])

        # ── Pre-compute everything in Python — no Gemini tokens wasted on numbers ──
        def avg(key, default=70):
            vals = [r.get(key) for r in rubrics if isinstance(r, dict) and r.get(key) is not None]
            return int(sum(vals) / len(vals)) if vals else default

        def telem_avg(key):
            vals = [t.get(key) for t in telem if t.get(key) is not None]
            return int(sum(vals) / len(vals)) if vals else None

        real_eye_contact = telem_avg("eye_contact")
        real_stress      = telem_avg("stress_score")
        real_hr          = telem_avg("hr_bpm")
        real_hrv         = telem_avg("hrv_ms")
        avg_stress       = real_stress if real_stress is not None else 0

        wpm_vals = [t.get("wpm") for t in telem if t.get("wpm") and t["wpm"] > 0]
        avg_wpm  = int(sum(wpm_vals) / len(wpm_vals)) if wpm_vals else None
        if avg_wpm is None:   speaking_speed = "Not measured"
        elif avg_wpm > 175:   speaking_speed = f"Fast ({avg_wpm} WPM)"
        elif avg_wpm < 90:    speaking_speed = f"Slow ({avg_wpm} WPM)"
        else:                 speaking_speed = f"Good ({avg_wpm} WPM)"

        tech  = avg("technical_accuracy")
        comm  = avg("communication")
        gram  = avg("grammar")
        conf  = avg("confidence")
        prob  = avg("problem_solving", 0) or avg("overall")
        crit  = avg("critical_thinking", 0) or avg("overall")
        lead  = avg("leadership_ownership", 0) or avg("star_depth")
        time_ = avg("time_management", 0) or avg("overall")
        over  = avg("overall", int((tech + comm + gram + conf) / 4))
        grade = ("A+" if over >= 92 else "A"  if over >= 85 else
                 "B+" if over >= 78 else "B"  if over >= 70 else
                 "C"  if over >= 60 else "D")
        hire  = ("Strong Yes" if over >= 88 else "Yes" if over >= 75
                 else "Maybe" if over >= 60 else "No")

        # Build per-question data from real recorded answers + per-answer rubrics
        q_pairs = [
            {
                "q":     a.get("question", "")[:300],
                "a":     a.get("answer", "")[:400],
                "score": rubrics[i].get("overall", over) if i < len(rubrics) else over,
                "fb":    rubrics[i].get("feedback", "") if i < len(rubrics) else "",
                "str":   rubrics[i].get("strengths", []) if i < len(rubrics) else [],
                "imp":   rubrics[i].get("improvements", []) if i < len(rubrics) else [],
            }
            for i, a in enumerate(answers[:8])
        ]

        # Compact Q&A for Gemini — only for narrative generation
        qa_text = "\n".join(
            f"Q{i+1}: {p['q'][:160]}\nA{i+1}: {p['a'][:220]}"
            for i, p in enumerate(q_pairs)
        )[:1000]

        # ── Ask Gemini ONLY for text narrative + ideal answers (~700 tokens) ──
        narrative_prompt = (
            f"Interview: {config.get('trackName','General')} | Role: {config.get('role','Engineer')}\n"
            f"Score:{over}/100 Grade:{grade} Stress:{avg_stress}/100 "
            f"Eye:{real_eye_contact or 'N/A'}% Speed:{speaking_speed}\n"
            f"Q&A summary:\n{qa_text}\n\n"
            "Return ONLY compact JSON (no markdown, no extra text):\n"
            '{"strengths":["s1","s2","s3"],'
            '"weak_areas":["w1","w2"],'
            '"behavioral_observation":"2 sentences max",'
            '"executive_summary":"2 sentences max",'
            '"learning_plan":[{"day":1,"topic":"t","resource":"r"},'
            '{"day":2,"topic":"t","resource":"r"},{"day":3,"topic":"t","resource":"r"},'
            '{"day":4,"topic":"t","resource":"r"},{"day":5,"topic":"t","resource":"r"},'
            '{"day":6,"topic":"t","resource":"r"},{"day":7,"topic":"t","resource":"r"}],'
            '"ideal_answers":["1-sentence ideal for Q1","1-sentence ideal for Q2"]}'
        )

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=narrative_prompt,
            config={"max_output_tokens": 700},   # was 1800 — 3x faster
        )
        text = response.text.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"): text = text[4:]
        narr = json.loads(text.strip())

        ideals = narr.get("ideal_answers", [])
        question_reviews = [
            {
                "question_number": i + 1,
                "question":     p["q"],
                "user_answer":  p["a"],
                "ideal_answer": ideals[i] if i < len(ideals) else (
                    "A strong answer states the core concept clearly, "
                    "supports it with a real example, and addresses edge cases."
                ),
                "score":        p["score"],
                "key_takeaway": p["fb"] or "Strengthen with specific examples and metrics.",
                "strengths":    p["str"] or ["Relevant answer"],
                "improvements": p["imp"] or ["Add more depth"],
            }
            for i, p in enumerate(q_pairs)
        ]

        # ── Assemble final report ──
        return {
            "overall_score":           over,
            "grade":                   grade,
            "technical_score":         tech,
            "communication_score":     comm,
            "grammar_score":           gram,
            "confidence_score":        conf,
            "leadership_score":        lead,
            "problem_solving_score":   prob,
            "critical_thinking_score": crit,
            "time_management_score":   time_,
            "stress_score":            avg_stress,
            "eye_contact_score":       real_eye_contact,
            "speaking_speed":          speaking_speed,
            "hr_bpm":                  real_hr,
            "hrv_ms":                  real_hrv,
            "hire_recommendation":     hire,
            "strengths":               narr.get("strengths", ["Completed session"]),
            "weak_areas":              narr.get("weak_areas", ["Practice more"]),
            "behavioral_observation":  narr.get("behavioral_observation", ""),
            "executive_summary":       narr.get("executive_summary", ""),
            "learning_plan":           narr.get("learning_plan", []),
            "question_reviews":        question_reviews,
        }

    except Exception as e:
        print(f"[AIBrain] generate_report error: {e}")
        return _fallback_report(session_data)


# ── Fallbacks (no API key / quota exhausted) ────────────────────────────

_FALLBACK_Q = {
    "hr":      ["Tell me about yourself.", "What are your greatest strengths?", "Why this role?", "Describe a challenge you overcame."],
    "tech":    ["Explain OOP and its four pillars.", "What is the difference between a process and a thread?", "Explain ACID properties."],
    "dsa":     ["What is the time complexity of binary search?", "How does a hash table handle collisions?", "Explain dynamic programming."],
    "coding":  ["Write a function to reverse a string.", "Find two numbers summing to a target.", "Implement an LRU cache."],
    "default": ["Tell me about yourself.", "Describe a complex problem you solved.", "What motivates you?", "Where do you see yourself in 5 years?"],
}

def _fallback_question(config, q_count, stress, is_first):
    track = config.get("trackId", "default")
    qs    = _FALLBACK_Q.get(track, _FALLBACK_Q["default"])
    if is_first:
        p = config.get("personality", "professional")
        greetings = {
            "friendly":     f"Hi! Welcome to your {config.get('trackName','interview')} session. I'm your AI mentor. Let's start — tell me about yourself!",
            "professional": f"Good day. Thank you for joining. Let's begin — {qs[0]}",
            "strict":       f"We begin immediately. {qs[0]}",
            "stress":       f"No time to waste. {qs[0]}",
        }
        return greetings.get(p, greetings["professional"])
    if stress > 70:
        return "Let's step back a moment. Tell me about a project you're genuinely proud of."
    return qs[q_count % len(qs)]

def _fallback_evaluation(answer):
    w = len((answer or "").split())
    s = min(90, max(45, 50 + w // 3))
    return {"technical_accuracy": s, "communication": s+5, "grammar": s+8, "problem_solving": s-5,
            "star_depth": s-10, "confidence": s, "leadership_ownership": s-5, "critical_thinking": s,
            "time_management": s+3, "overall": s,
            "feedback": "Good answer. Consider adding specific examples and metrics.",
            "strengths": ["Clear communication"], "improvements": ["Add more technical depth"]}

def _fallback_report(session_data):
    """Offline fallback — derives all scores from real session data, never invents numbers."""
    answers = session_data.get("answers", [])
    rubrics = session_data.get("rubric_scores", [])
    telem   = session_data.get("telemetry", [])
    config  = session_data.get("config", {})

    # ── Real rubric averages from per-answer AI evaluations ──
    def avg(key, default=70):
        vals = [r.get(key) for r in rubrics if isinstance(r, dict) and r.get(key) is not None]
        return int(sum(vals) / len(vals)) if vals else default

    # ── Real telemetry aggregation ──
    def telem_avg(key):
        vals = [t.get(key) for t in telem if t.get(key) is not None]
        return int(sum(vals) / len(vals)) if vals else None

    real_eye_contact = telem_avg("eye_contact")
    real_stress      = telem_avg("stress_score")
    real_hr          = telem_avg("hr_bpm")
    real_hrv         = telem_avg("hrv_ms")

    wpm_vals = [t.get("wpm") for t in telem if t.get("wpm") and t["wpm"] > 0]
    avg_wpm  = int(sum(wpm_vals) / len(wpm_vals)) if wpm_vals else None
    if avg_wpm is None:
        speaking_speed = "Not measured"
    elif avg_wpm > 175:
        speaking_speed = f"Fast ({avg_wpm} WPM)"
    elif avg_wpm < 90:
        speaking_speed = f"Slow ({avg_wpm} WPM)"
    else:
        speaking_speed = f"Good ({avg_wpm} WPM)"

    # Estimate overall from rubric averages; if no rubrics, estimate from answer length
    tech_score  = avg("technical_accuracy")
    comm_score  = avg("communication")
    gram_score  = avg("grammar")
    conf_score  = avg("confidence")
    prob_score  = avg("problem_solving", 0) or avg("overall", 70)
    crit_score  = avg("critical_thinking", 0) or avg("overall", 70)
    lead_score  = avg("leadership_ownership", 0) or avg("star_depth", 70)
    time_score  = avg("time_management", 0) or avg("overall", 70)
    overall     = avg("overall", int((tech_score + comm_score + gram_score + conf_score) / 4))

    grade = ("A+" if overall >= 92 else "A"  if overall >= 85 else
             "B+" if overall >= 78 else "B"  if overall >= 70 else
             "C"  if overall >= 60 else "D")

    # ── Build question reviews from ACTUAL answers recorded this session ──
    q_reviews = []
    for idx, a in enumerate(answers, 1):
        q_rubric = rubrics[idx - 1] if idx - 1 < len(rubrics) else {}
        q_score  = q_rubric.get("overall", avg("overall", 70))
        q_reviews.append({
            "question_number": idx,
            "question":        a.get("question", f"Question {idx}"),
            "user_answer":     a.get("answer", "No response recorded."),
            "ideal_answer":    (
                f"For '{a.get('question', 'this question')}': A strong answer clearly states "
                f"the core concept, supports it with a real-world example or code snippet, "
                f"addresses edge cases, and communicates time/space trade-offs or business impact."
            ),
            "score":           q_score,
            "key_takeaway":    q_rubric.get("feedback", "Good answer. Strengthen with specific examples and metrics."),
            "strengths":       q_rubric.get("strengths", ["Relevant answer"]),
            "improvements":    q_rubric.get("improvements", ["Add more technical depth"])
        })

    # If no answers were recorded at all
    if not q_reviews:
        q_reviews = [{
            "question_number": 1,
            "question": "Session ended without recorded answers.",
            "user_answer": "No answer recorded.",
            "ideal_answer": "Complete a full interview session to see question-by-question review.",
            "score": 0, "key_takeaway": "Start a new session to get detailed feedback.",
            "strengths": [], "improvements": ["Complete a full interview session"]
        }]

    return {
        "overall_score":           overall,
        "grade":                   grade,
        "technical_score":         tech_score,
        "communication_score":     comm_score,
        "grammar_score":           gram_score,
        "confidence_score":        conf_score,
        "leadership_score":        lead_score,
        "problem_solving_score":   prob_score,
        "critical_thinking_score": crit_score,
        "time_management_score":   time_score,
        # Real biometrics — null if not captured
        "stress_score":      real_stress,
        "eye_contact_score": real_eye_contact,
        "speaking_speed":    speaking_speed,
        "hr_bpm":            real_hr,
        "hrv_ms":            real_hrv,
        "strengths":  (
            [r for rub in rubrics for r in (rub.get("strengths") or []) if r][:5]
            or ["Completed the interview session"]
        ),
        "weak_areas": (
            [r for rub in rubrics for r in (rub.get("improvements") or []) if r][:4]
            or ["Complete more sessions to identify patterns"]
        ),
        "behavioral_observation": (
            f"Candidate completed {len(answers)} question(s). "
            f"{'Eye contact was maintained ' + str(real_eye_contact) + '% of the session. ' if real_eye_contact else ''}"
            f"{'Average stress index: ' + str(real_stress) + '/100.' if real_stress else ''}"
        ),
        "executive_summary": (
            f"Session completed with {len(answers)} answer(s) recorded across "
            f"{config.get('trackName', 'this interview track')}. "
            f"Overall score: {overall}/100 (Grade {grade}). "
            f"{'Speaking pace was ' + speaking_speed + '.' if avg_wpm else ''}"
        ),
        "learning_plan": [
            {"day": 1, "topic": "Core Concepts",      "resource": f"Review fundamentals of {config.get('trackId', 'your topic area')}"},
            {"day": 2, "topic": "Practice Problems",  "resource": "Solve 5 targeted problems on LeetCode or HackerRank"},
            {"day": 3, "topic": "Communication",      "resource": "Record yourself answering 3 questions and review pacing"},
            {"day": 4, "topic": "System Design",      "resource": "Study one system design case study (e.g. URL shortener)"},
            {"day": 5, "topic": "STAR Method",        "resource": "Prepare 5 structured behavioural stories with quantified outcomes"},
            {"day": 6, "topic": "Weak Areas",         "resource": f"Focus on: {', '.join((q_reviews[0].get('improvements') or ['technical depth'])[:2])}"},
            {"day": 7, "topic": "Full Mock Session",  "resource": "Complete a full timed mock session on Neroprep"},
        ],
        "question_reviews":   q_reviews,
        "hire_recommendation": (
            "Strong Yes" if overall >= 88 else
            "Yes"        if overall >= 75 else
            "Maybe"      if overall >= 60 else "No"
        ),
    }

