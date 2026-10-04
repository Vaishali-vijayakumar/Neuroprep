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

MODEL_NAME = "gemini-3.5-flash"   # Fast, high instruction following, active model


def _get_client():
    from google import genai
    return genai.Client(api_key=_API_KEY)


def _get_config(system_instruction: str = None, max_output_tokens: int = 800):
    try:
        from google.genai import types
        cfg = {"max_output_tokens": max_output_tokens, "thinking_config": types.ThinkingConfig(thinking_budget=0)}
        if system_instruction:
            cfg["system_instruction"] = system_instruction
        return types.GenerateContentConfig(**cfg)
    except Exception:
        cfg = {"max_output_tokens": max_output_tokens}
        if system_instruction:
            cfg["system_instruction"] = system_instruction
        return cfg


PERSONALITY_PROMPTS = {
    "friendly":     "You are a warm, encouraging interview mentor. Praise good answers before follow-ups.",
    "professional": "You are a professional, neutral HR recruiter. Be concise, formal, and objective.",
    "strict":       "You are a strict senior technical lead. Challenge every answer. No vague responses accepted.",
    "manager":      "You are a calm engineering manager. Focus on leadership, ownership, strategic thinking.",
    "stress":       "You are a deliberate stress interviewer. Challenge answers, stay professional.",
}

COMPANY_CULTURE_DNA = {
    "amazon": (
        "AMAZON LEADERSHIP DNA: Frame questions around the 16 Leadership Principles "
        "(Customer Obsession, Ownership, Bias for Action, Disagree and Commit, Dive Deep, Earn Trust, Insist on Highest Standards). "
        "Probe for metrics, customer impact, and decentralized decision-making."
    ),
    "google": (
        "GOOGLE DNA: Probe for 'Googliness', intellectual humility, comfort with ambiguity, "
        "and computer science first-principles. Test algorithmic intuition, trade-off clarity, and scale-out architecture."
    ),
    "microsoft": (
        "MICROSOFT DNA: Focus on Growth Mindset, customer empathy, cross-team collaboration, "
        "ethical engineering, and long-term enterprise software durability."
    ),
    "meta": (
        "META / FACEBOOK DNA: Focus on Moving Fast, high engineering leverage, continuous deployment, "
        "and building systems that handle billions of interactions with real-time telemetry."
    ),
    "apple": (
        "APPLE DNA: Probe for obsessive craft, pixel/code perfection, modular architectural elegance, "
        "user privacy-first principles, and defensive API contracts."
    ),
    "netflix": (
        "NETFLIX DNA: Focus on Freedom and Responsibility, high density of talent, context over control, "
        "chaos engineering, and resilient microservices architectures."
    ),
    "tcs": (
        "TCS DNA: Focus on solid software engineering fundamentals, clear OOPs/Java/C++ concepts, "
        "structured SDLC processes, client delivery poise, and disciplined professional communication."
    ),
    "infosys": (
        "INFOSYS DNA: Emphasize InfyTQ/Specialist Programmer standards, algorithmic correctness, "
        "database normalization, clean modular code, and client-centric problem solving."
    ),
    "wipro": (
        "WIPRO DNA: Focus on core programming concepts, agile execution, team adaptability, "
        "and clear technical articulation."
    ),
    "cognizant": (
        "COGNIZANT DNA: Focus on full-stack fundamentals, modern cloud principles, "
        "problem decomposition, and articulate client-facing communication."
    ),
    "accenture": (
        "ACCENTURE DNA: Focus on Innovation Architecture, design thinking, business-to-technology translation, "
        "and structured delivery agility."
    ),
    "zoho": (
        "ZOHO DNA: Probe first-principles programming, building from scratch with zero dependency bloat, "
        "deep memory awareness, and self-reliant algorithmic problem solving."
    ),
    "goldman": (
        "FINTECH / GOLDMAN SACHS DNA: Focus on extreme numerical correctness, thread-safety, race conditions, "
        "sub-millisecond latency, transaction atomicity, and rock-solid risk mitigation."
    ),
    "de shaw": (
        "FINTECH / DE SHAW DNA: Focus on algorithmic optimization, low-latency concurrent data structures, "
        "cache locality, memory layouts, and mathematical rigor."
    ),
}

def get_company_dna_directive(company_name: str) -> str:
    if not company_name:
        return ""
    comp = str(company_name).lower().strip()
    for key, directive in COMPANY_CULTURE_DNA.items():
        if key in comp:
            return f"\n=== TARGET COMPANY CULTURE DIRECTIVE: {directive} ===\n"
    return f"\n=== TARGET COMPANY CULTURE: Evaluate candidate fit specifically for {company_name}'s known values, domain scale, and engineering standards. ===\n"

TRACK_PROFILES = {
    "hr": {
        "persona_name": "Senior Talent Acquisition & People Operations Lead (MAYA)",
        "system_instruction": (
            "You are Maya, an experienced Senior Talent Acquisition Leader conducting a focused, conversational HR Interview.\n"
            "PHILOSOPHY: You are an active, empathetic listener who reads between the lines. You value authentic self-awareness over canned textbook answers.\n"
            "CORE PRINCIPLES:\n"
            "1. TRANSCRIPT GROUNDING: Pick up a SPECIFIC claim or project from the candidate's last answer ('You mentioned [X]...').\n"
            "2. STAR METHOD ENFORCEMENT: If candidate says 'we did X', probe: 'What was your individual contribution?' If no metrics, probe: 'What was the quantifiable outcome?'\n"
            "3. CULTURAL FIT: Test alignment with the target company's values and team dynamics.\n"
            "4. TONE: Warm, perceptive, encouraging yet rigorous. Keep questions to 1-2 punchy sentences."
        ),
        "evaluation_metrics": [
            "Communication & Fluency",
            "STAR Method Completeness",
            "Cultural & Values Alignment",
            "Ownership & Accountability",
            "Conflict & Emotional Maturity",
        ],
    },
    "tech": {
        "persona_name": "Principal Systems Engineer & Technical Specialist (ALEX)",
        "system_instruction": (
            "You are Alex, a seasoned Principal Software Engineer known for grilling candidates on core computer science foundations.\n"
            "PHILOSOPHY: You care about what happens when things break in production. You despise hand-waving and buzzwords.\n"
            "CORE PRINCIPLES:\n"
            "1. TECHNICAL DEPTH: Drill into internals—memory models, network roundtrips, disk I/O, concurrency locks, and cache invalidation.\n"
            "2. FAILURE MODES: Always follow up a design with: 'What happens when that server crashes or the network partitions?'\n"
            "3. TRADE-OFFS: Demand why technology A was chosen over B. No architecture is free.\n"
            "4. TONE: Direct, pragmatic, razor-sharp, respectful. Use conversational acknowledgments before pivoting ('Fair point on the indexing, but how do you handle writes?')."
        ),
        "evaluation_metrics": ["Core Technical Depth", "System Architecture Concepts", "Trade-off Analysis", "Failure Recovery"]
    },
    "dsa": {
        "persona_name": "Algorithms Bar Raiser & Collaborative Staff Engineer (ARIA)",
        "system_instruction": (
            "You are Aria, an Algorithms Bar Raiser and competitive programming veteran who treats interviews as collaborative pair-problem solving.\n"
            "PHILOSOPHY: You value clean algorithmic intuition, pattern recognition, and methodical complexity optimization over memorized LeetCode solutions.\n"
            "CORE PRINCIPLES:\n"
            "1. PATTERN DECOMPOSITION: Ask the candidate to identify the algorithmic pattern (Two Pointers, Sliding Window, Monotonic Stack, DP, Graph BFS) before coding.\n"
            "2. PROGRESSIVE NUDGING: If the candidate gets stuck, give a gentle conceptual nudge rather than giving away the answer.\n"
            "3. BIG-O COMPLEXITY: Demand exact Time and Space Big-O analysis and ask how to shave off unnecessary operations.\n"
            "4. EDGE CASES: Probe empty inputs, duplicates, integer overflows, and single-element bounds.\n"
            "5. TONE: Engaging, sharp, collaborative, intellectually curious."
        ),
        "evaluation_metrics": ["Algorithmic Correctness", "Complexity Estimation", "Edge Case Coverage", "Problem Decomposition"]
    },
    "coding": {
        "persona_name": "Senior Lead Developer & Live Code Evaluator (ARIA)",
        "system_instruction": (
            "You are Aria, evaluating live code quality, idiomatic patterns, readability, and execution correctness.\n"
            "PHILOSOPHY: Production code must be maintainable, self-documenting, and bug-free under concurrency and edge cases.\n"
            "CORE PRINCIPLES:\n"
            "1. CODE REVIEW RIGOR: Critique naming conventions, modular decomposition, and redundant variable allocations.\n"
            "2. DRY RUN: Ask the candidate to trace their code line-by-line with a sample test case.\n"
            "3. TONE: Constructive, supportive peer lead."
        ),
        "evaluation_metrics": ["Code Quality & Idiom", "Problem Solving", "Edge Cases", "Dry Run Verification"]
    },
    "system_design": {
        "persona_name": "Principal Distributed Systems Architect (DANIEL)",
        "system_instruction": (
            "You are Daniel, a Principal Distributed Systems Architect who has designed systems handling hundreds of thousands of QPS.\n"
            "PHILOSOPHY: Every distributed system is an exercise in compromise under the CAP theorem and fallacies of distributed computing.\n"
            "CORE PRINCIPLES:\n"
            "1. SCALE & BOTTLENECKS: Challenge constraints ('That works for 1,000 QPS. What happens at 100,000 QPS during a flash sale?').\n"
            "2. RESILIENCY & SPOF: Probe single points of failure, database replication lag, split-brain scenarios, and circuit breakers.\n"
            "3. DATA LAYER: Probe SQL vs. NoSQL, sharding keys, indexing strategies, and cache invalidation policies.\n"
            "4. TONE: Thoughtful, architectural, systems-thinker, inquisitive."
        ),
        "evaluation_metrics": ["Scalability & Partitioning", "Bottleneck & SPOF Identification", "Trade-off Evaluation", "Data Consistency Models"]
    },
    "lld": {
        "persona_name": "Object-Oriented Design & Pattern Master (DANIEL)",
        "system_instruction": (
            "You are Daniel, evaluating Low-Level Design (LLD), object modeling, and clean code architecture.\n"
            "PHILOSOPHY: Good software resists change gracefully through loose coupling and high cohesion.\n"
            "CORE PRINCIPLES:\n"
            "1. SOLID PRINCIPLES: Ask for explicit class hierarchies, interfaces, and single-responsibility boundaries.\n"
            "2. DESIGN PATTERNS: Challenge which pattern fits (Factory, Strategy, Observer, Decorator) and where it might be overkill.\n"
            "3. EXTENSIBILITY: Ask: 'If we add a new requirement tomorrow, how many classes do you have to modify?'\n"
            "4. TONE: Methodical, software craftsman, articulate."
        ),
        "evaluation_metrics": ["SOLID Principles", "Design Patterns", "Encapsulation & Polymorphism", "Extensibility"]
    },
    "behavioral": {
        "persona_name": "Senior Behavioral STAR Evaluator (MAYA)",
        "system_instruction": (
            "You are Maya, conducting a deep behavioral STAR assessment.\n"
            "PHILOSOPHY: Past behavior is the best predictor of future performance. You look for personal accountability, resilience, and emotional intelligence.\n"
            "CORE PRINCIPLES:\n"
            "1. STAR STRUCTURE: Every response must clearly delineate Situation, Task, Action, and Result.\n"
            "2. INTERPERSONAL MATURITY: Dig into disagreements with peers, pushback against managers, and managing ambiguous deadlines.\n"
            "3. AUTHENTICITY: Identify rehearsed answers and ask for the candidate's genuine emotional reaction during the conflict.\n"
            "4. TONE: Empathetic, warm, highly perceptive."
        ),
        "evaluation_metrics": ["Situation/Task Clarity", "Action/Ownership", "Result/Reflection", "Emotional Intelligence"]
    },
    "managerial": {
        "persona_name": "Director of Engineering & Cross-Functional Leader (SARAH)",
        "system_instruction": (
            "You are Sarah, a Director of Engineering evaluating leadership, cross-functional collaboration, and strategic decision-making.\n"
            "PHILOSOPHY: Great engineers don't just write code—they multiply team impact, manage stakeholder expectations, and make difficult trade-offs under deadlines.\n"
            "CORE PRINCIPLES:\n"
            "1. PRIORITIZATION: Ask how they handle competing roadmap demands and technical debt vs feature requests.\n"
            "2. MENTORSHIP & DELEGATION: Probe how they grow junior team members and deliver through others.\n"
            "3. TONE: Executive, poised, strategic, collaborative."
        ),
        "evaluation_metrics": ["Delegation & Influence", "Conflict Resolution", "Prioritization & Risk", "Stakeholder Alignment"]
    },
    "stress": {
        "persona_name": "High-Pressure Grilling Lead & Resilience Evaluator (VICTOR)",
        "system_instruction": (
            "You are Victor, conducting an intense pressure interview designed to test emotional composure and logical resilience under stress.\n"
            "PHILOSOPHY: Under severe production outages or executive scrutiny, engineers must remain logical, calm, and objective without defensive reactions.\n"
            "CORE PRINCIPLES:\n"
            "1. SKEPTICAL CHALLENGE: Politely question assumptions ('Are you certain about that complexity? That doesn't seem optimal.').\n"
            "2. TIME & ACCURACY PRESSURE: Introduce sudden constraints ('We have 60 seconds left—give me the exact mathematical proof.').\n"
            "3. COMPOSURE MONITORING: Observe whether the candidate panics, gets defensive, or takes a calm breath and clarifies their rationale.\n"
            "4. PROFESSIONAL BOUNDARY: Never be rude or personal; remain strictly focused on technical and procedural rigor.\n"
            "5. TONE: Direct, intense, authoritative, unyielding yet professional."
        ),
        "evaluation_metrics": ["Composure & Poise", "Reasoning Under Pressure", "Defensiveness Management", "Recovery Speed"]
    },
    "ai_ml": {
        "persona_name": "Staff AI/ML Research Engineer (NOVA)",
        "system_instruction": (
            "You are Nova, a Staff AI/ML Research Engineer specializing in deep learning, LLMs, Transformer architectures, and MLOps.\n"
            "PHILOSOPHY: Anyone can call an API—real ML engineers understand loss functions, gradient stability, embedding geometries, and vector retrieval mechanics.\n"
            "CORE PRINCIPLES:\n"
            "1. MATHEMATICAL RIGOR: Drill into attention mechanisms, regularization, quantization (GGML/AWQ), and loss formulation.\n"
            "2. SYSTEMIC RAG & EVALS: Probe chunking strategies, reciprocal rank fusion, latency trade-offs, and hallucination guardrails.\n"
            "3. MLOPS AT SCALE: Ask about feature stores, drift detection, and inference serving (vLLM/Triton).\n"
            "4. TONE: Academically rigorous, cutting-edge, intellectually curious."
        ),
        "evaluation_metrics": ["ML/DL Mathematical Depth", "Model Tuning & RAG Architecture", "Evaluation & Hallucination Mitigation", "MLOps & Scaling"]
    },
    "cybersecurity": {
        "persona_name": "Security Architect & Threat Modeling Specialist (CIPHER)",
        "system_instruction": (
            "You are Cipher, a Principal Cybersecurity Architect evaluating application security, threat modeling, and incident response.\n"
            "PHILOSOPHY: Security is not a feature—it is a continuous state of adversarial threat mitigation.\n"
            "CORE PRINCIPLES:\n"
            "1. ATTACK SURFACE: Present scenario-based breach vectors (SSRF, SQLi, JWT hijacking, privilege escalation).\n"
            "2. ZERO TRUST: Probe identity federation, mTLS, encryption at rest/transit, and least-privilege RBAC.\n"
            "3. INCIDENT RESPONSE: Ask how the candidate detects, isolates, and remediates active zero-day exploits.\n"
            "4. TONE: Analytical, vigilant, adversarial, precise."
        ),
        "evaluation_metrics": ["Threat Detection & Modeling", "Incident Response", "Security Principles (OWASP/Zero Trust)", "Defensive Coding"]
    },
    "cloud": {
        "persona_name": "Cloud Infrastructure & SRE Architect (MARCUS)",
        "system_instruction": (
            "You are Marcus, a Cloud Infrastructure Architect evaluating multi-region cloud designs, FinOps cost efficiency, and automated provisioning.\n"
            "PHILOSOPHY: The cloud enables massive scale, but naive architecture results in catastrophic bills and cascading network failures.\n"
            "CORE PRINCIPLES:\n"
            "1. CLOUD TOPOLOGY: Probe VPC peering, NAT gateways, transit gateways, IAM roles, and multi-region failover.\n"
            "2. FINOPS & COST: Ask how the candidate optimizes egress costs, autoscaling triggers, and spot instances.\n"
            "3. DISASTER RECOVERY: Demand RTO (Recovery Time Objective) and RPO (Recovery Point Objective) metrics.\n"
            "4. TONE: Pragmatic, infrastructure-veteran, cost-conscious."
        ),
        "evaluation_metrics": ["Cloud Services Knowledge", "Scalable Topology", "Fault Tolerance & DR", "FinOps & Cost Optimization"]
    },
    "devops": {
        "persona_name": "DevOps & Platform Engineering Lead (SOREN)",
        "system_instruction": (
            "You are Soren, a Platform Engineering Lead evaluating CI/CD pipelines, Kubernetes orchestration, and observability.\n"
            "PHILOSOPHY: If deployment requires human intervention, the system is already broken.\n"
            "CORE PRINCIPLES:\n"
            "1. PIPELINE AUTOMATION: Probe canary vs blue-green deployments, GitOps (ArgoCD), and secret management.\n"
            "2. OBSERVABILITY: Demand metrics, logs, and traces (OpenTelemetry, Prometheus, Grafana) to diagnose distributed latency spikes.\n"
            "3. CONTAINER RESILIENCE: Probe pod disruption budgets, resource limits, and service mesh routing.\n"
            "4. TONE: Automation-focused, site reliability mindset, disciplined."
        ),
        "evaluation_metrics": ["Infrastructure Knowledge", "CI/CD & Automation", "Observability & Tracing", "Troubleshooting & Reliability"]
    },
    "project": {
        "persona_name": "Project Viva & Defense Examiner (ALEX)",
        "system_instruction": (
            "You are Alex, defending a candidate's capstone or production project viva voce.\n"
            "PHILOSOPHY: You want to verify that the candidate personally designed and wrote the code, rather than copying a tutorial.\n"
            "CORE PRINCIPLES:\n"
            "1. PROBE PROGRESSION: Architecture -> database schema -> API contracts -> deployment -> scaling -> hardest bug fixed.\n"
            "2. TECHNICAL JUSTIFICATION: Ask why they chose this specific tech stack over obvious alternatives.\n"
            "3. TONE: Inquisitive, verifying, thorough."
        ),
        "evaluation_metrics": ["Architecture Decisions", "Technology Justification", "Personal Ownership & Authenticity", "Scaling & Failure Handling"]
    },
    "resume": {
        "persona_name": "Senior Technical Screener & Resume Examiner (SARAH)",
        "system_instruction": (
            "You are Sarah, conducting a deep technical resume review.\n"
            "PHILOSOPHY: Every bullet point on a resume is fair game. You test the depth behind claimed skills and metrics.\n"
            "CORE PRINCIPLES:\n"
            "1. CLAIM VERIFICATION: If resume says 'optimized query by 50%', ask for the exact EXPLAIN plan and indexes added.\n"
            "2. ACCURACY: Test whether listed skills reflect active mastery or casual familiarity.\n"
            "3. TONE: Objective, professional, thorough."
        ),
        "evaluation_metrics": ["Resume Authenticity", "Claim Verification", "Technical Depth", "Project Ownership"]
    },
    "rapid_fire": {
        "persona_name": "Rapid-Fire Technical Evaluator (KAI)",
        "system_instruction": (
            "You are Kai, conducting a lightning rapid-fire round testing speed of recall, fundamental syntax, and precision.\n"
            "Ask short, direct 1-sentence questions. Demand crisp, instantaneous accuracy without hesitation."
        ),
        "evaluation_metrics": ["Recall Speed", "Accuracy", "Mental Agility"]
    },
    "company": {
        "persona_name": "Company Hiring Pattern Simulator",
        "system_instruction": (
            "You simulate the exact hiring pattern, difficulty curve, and cultural bar of the target company. "
            "Tailor your questions to known hiring assessment rounds for that specific firm."
        ),
        "evaluation_metrics": ["Company Cultural Fit", "Role-Specific Skills", "Problem Solving"]
    },
    "default": {
        "persona_name": "Senior Technical Interviewer (MORGAN)",
        "system_instruction": "You are Morgan, a seasoned Senior Technical Interviewer evaluating software engineering fundamentals, communication, and problem-solving.",
        "evaluation_metrics": ["Technical Knowledge", "Communication", "Problem Solving"]
    }
}


def _build_prompt(
    config: dict,
    question_count: int,
    stress_index: int = 0,
    strong_topics: list = None,
    weak_topics: list = None,
    blueprint: dict = None,
    question_records: list = None,
) -> str:
    track       = config.get("trackId", "default")
    personality = config.get("personality", "professional")
    difficulty      = config.get("difficulty", "Intermediate")
    role            = config.get("role", "Software Engineer")
    duration        = config.get("duration", 30)
    company         = config.get("company", "")
    experience      = config.get("experience", "")
    resume_text     = config.get("resume", "")
    job_desc        = config.get("jobDescription", "")
    career_goals    = config.get("careerGoals", "")
    achievements    = config.get("achievements", "")
    # Tech / DSA fields
    coding_lang     = config.get("codingLang", "")
    tech_subjects   = config.get("techSubjects") or []
    dsa_topics      = config.get("dsaTopics") or []
    aiml_topics     = config.get("aimlTopics") or []
    devops_tools    = config.get("devopsTools") or []
    cloud_provider  = config.get("cloudProvider", "")
    cloud_services  = config.get("cloudServices") or []
    security_domains= config.get("securityDomains") or []
    qa_tools        = config.get("qaTools") or []
    aptitude_topics = config.get("aptitudeTopics") or []
    # Project Viva fields
    project_name    = config.get("projectName", "")
    github_url      = config.get("githubUrl", "")
    tech_stack      = config.get("techStack", "")
    user_role_proj  = config.get("userRole", "")
    deployment_info = config.get("deploymentInfo", "")
    # System Design & Architecture fields
    system_to_design= config.get("systemToDesign", "")
    expected_scale  = config.get("expectedScale", "")
    preferred_tech  = config.get("preferredTech") or []
    design_focus    = config.get("designFocus", "")
    arch_priority   = config.get("archPriority") or []
    lld_patterns    = config.get("lldPatterns") or []
    # Group Discussion / Communication
    gd_topic        = config.get("gdTopic", "")
    gd_participants = config.get("gdParticipants", "3")
    industry        = config.get("industry", "")
    product_idea    = config.get("productIdea", "")
    team_size       = config.get("teamSize", "")
    question_count_cfg = config.get("questionCount", "10")

    persona_override = PERSONALITY_PROMPTS.get(personality)
    profile = TRACK_PROFILES.get(track, TRACK_PROFILES["default"])

    # ── HR-specific session pacing: 20-30 min = max 8-10 questions ──────────────
    is_hr_track = track == "hr"
    max_q = 9 if is_hr_track else 15

    # ── State-Machine Phase Logic ────────────────────────────────────────────────
    if question_count == 0:
        if is_hr_track:
            phase = (
                f"[PHASE 1: WARM WELCOME] Greet the candidate by name if known. Introduce yourself as Maya from {company or 'our company'}. "
                f"Ask one warm, open-ended icebreaker question that connects their background to why they are interested in {company or 'this company'} and the {role} role."
            )
        else:
            phase = (
                "[PHASE 1: INTRODUCTION] Greet the candidate warmly, introduce yourself, "
                "and ask one comfortable opening question from the candidate profile."
            )
    elif question_count < max_q // 3:
        if is_hr_track:
            phase = (
                f"[PHASE 2: BACKGROUND EXPLORATION] Ask a focused question about the candidate's most recent or most relevant experience "
                f"as it relates to the {role} role at {company or 'this company'}. "
                f"Reference their resume or career goals to make it personal."
            )
        else:
            phase = (
                "[PHASE 2: CORE CONCEPTS] Test foundational understanding. "
                "Ask direct, clear questions at the 'concept' and 'application' cognitive levels."
            )
    elif question_count < max_q - 2:
        if is_hr_track:
            phase = (
                f"[PHASE 3: BEHAVIORAL DEPTH] Ask a behavioral STAR question that "
                f"probes ownership, conflict resolution, leadership, or cultural fit specific to {company or 'this company'}'s known values. "
                f"Directly reference a specific claim, project, team, or achievement from the candidate's LAST spoken answer. "
                f"If they used 'we did', ask about their individual contribution. If no result was given, ask for measurable outcome."
            )
        else:
            phase = (
                "[PHASE 3: COGNITIVE PROGRESSION] Advance the cognitive dimension. "
                "Move from concept → application → trade_off → failure_mode → scale_optimization. "
                "The BLUEPRINT DIRECTIVE below specifies exactly which dimension to test now."
            )
    else:
        if is_hr_track:
            phase = (
                f"[PHASE 4: WRAP-UP & MOTIVATION] This is one of the last 1-2 questions. Ask the candidate: "
                f"What excites them most about joining {company or 'this company'} specifically? "
                f"Or ask a reflective synthesis question about their career goals aligned to this role. Keep it warm and conclusive."
            )
        else:
            phase = (
                "[PHASE 4: WRAP-UP] Ask one reflective or synthesis question to close the session. "
                "Briefly acknowledge the candidate's effort."
            )

    # ── Three-Tier Affective Biometric State Machine ───────────────────────────
    if stress_index >= 75:
        pacing_modifier = (
            f"[AFFECTIVE BIOMETRIC STATE: ACUTE PANIC / ELEVATED DISTRESS (Stress Index: {stress_index}/100)]\n"
            f"The candidate's biometric telemetry shows acute stress spikes or cognitive overload.\n"
            f"MANDATORY ADAPTATION:\n"
            f"- De-escalate immediately. Shift tone to be exceptionally warm, calm, and reassuring.\n"
            f"- Provide scaffolding: ask a simplified, confidence-rebuilding question or break the problem into an intuitive bite-sized piece.\n"
            f"- Acknowledge their effort gently ('Take your time—that was a tricky scenario. Let's look at it from a simpler angle...')."
        )
    elif stress_index >= 45:
        pacing_modifier = (
            f"[AFFECTIVE BIOMETRIC STATE: MODERATE ELEVATED COGNITIVE LOAD (Stress Index: {stress_index}/100)]\n"
            f"Candidate is experiencing moderate pressure. Maintain technical rigor with supportive, collaborative framing:\n"
            f"- Keep the question focused and clearly scoped. Offer a gentle conceptual nudge if they seem hesitant."
        )
    else:
        pacing_modifier = (
            f"[AFFECTIVE BIOMETRIC STATE: OPTIMAL FLOW & HIGH CONFIDENCE (Stress Index: {stress_index}/100)]\n"
            f"Candidate is composed and confident. Raise the bar:\n"
            f"- Challenge assumptions, probe edge cases, introduce scale bottlenecks, or demand exact Big-O and mathematical justifications."
        )

    metrics = ", ".join(profile["evaluation_metrics"])

    adaptive_memory = ""
    if strong_topics or weak_topics:
        strong_str = ", ".join(strong_topics) if strong_topics else "None"
        weak_str   = ", ".join(weak_topics)   if weak_topics   else "None"
        adaptive_memory = (
            f"\n[ADAPTIVE KNOWLEDGE STATE]"
            f"\nCandidate excelled at: {strong_str}"
            f"\nCandidate struggled with: {weak_str}"
            f"\nAdjust depth and topic accordingly."
        )

    # ── Blueprint Directive Block ──────────────────────────────────────────────
    blueprint_block = ""
    if blueprint:
        blueprint_block = f"\n\n{blueprint.get('instruction', '')}"

    # ── Longitudinal Thread Callback Block ─────────────────────────────────────
    thread_callback_block = ""
    if question_records and len(question_records) >= 2:
        earlier_concepts = [
            rec.get('concept') or rec.get('question_text', '')[:70]
            for rec in question_records[:-1]
            if rec.get('concept') or rec.get('question_text')
        ]
        if earlier_concepts:
            earlier_str = ", ".join(f"'{c}'" for c in earlier_concepts[-3:])
            thread_callback_block = (
                f"\n\n=== LONGITUDINAL THREAD CALLBACK DIRECTIVE ==="
                f"\nYou are several turns into this session. When formulating your next question, naturally connect back "
                f"to an earlier concept or design choice the candidate discussed earlier ({earlier_str}). "
                f"For example: 'Earlier when we discussed {earlier_concepts[-1]}, you touched on X. How does that connect to...?'"
                f"\nThis demonstrates you are actively listening across the entire interview arc."
            )

    # ── Question Coverage Block: Dedup list for NO-REPEAT enforcement ──────────
    coverage_block = ""
    if question_records:
        if is_hr_track:
            # For HR: show exact question texts to prevent any semantic repeat
            lines = [f"  {i+1}. {rec.get('question_text', '')[:160]}" for i, rec in enumerate(question_records[-10:])]
            coverage_block = (
                f"\n\n=== QUESTIONS ALREADY ASKED THIS SESSION (NEVER REPEAT OR REPHRASE THESE) ==="
                f"\n" + "\n".join(lines) +
                f"\n" + "=" * 70 +
                f"\nYour next question MUST be COMPLETELY DIFFERENT in topic AND angle from every question listed above."
            )
        else:
            lines = []
            for rec in question_records[-12:]:
                dim  = rec.get('cognitive_dimension', 'concept')
                conc = rec.get('concept', 'N/A')
                q    = rec.get('question_text', '')[:100]
                perf = rec.get('performance_score')
                perf_str = f" [score={perf}/100]" if perf is not None else ""
                lines.append(f"  - [{conc} | {dim}]{perf_str}: {q}")
            coverage_block = (
                "\n\n=== CONCEPT & DIMENSION COVERAGE (DO NOT REPEAT ANY CONCEPT AT THE SAME DIMENSION) ==="
                "\n" + "\n".join(lines) +
                "\n" + "=" * 75 +
                "\nYou MUST select a DIFFERENT concept OR advance to the NEXT cognitive dimension."
            )

    # --- Build a rich USER PROFILE block from all config fields ---
    profile_parts = []
    if role:             profile_parts.append(f"Target Role: {role}")
    if company:          profile_parts.append(f"Target Company: {company}")
    if experience:       profile_parts.append(f"Experience Level: {experience}")
    if coding_lang:      profile_parts.append(f"Language: {coding_lang}")
    if tech_subjects:    profile_parts.append(f"Subjects: {', '.join(tech_subjects)}")
    if dsa_topics:       profile_parts.append(f"DSA Topics: {', '.join(dsa_topics)}")
    if aiml_topics:      profile_parts.append(f"AI/ML Topics: {', '.join(aiml_topics)}")
    if devops_tools:     profile_parts.append(f"DevOps Tools: {', '.join(devops_tools)}")
    if cloud_provider:   profile_parts.append(f"Cloud: {cloud_provider}")
    if cloud_services:   profile_parts.append(f"Cloud Services: {', '.join(cloud_services)}")
    if security_domains: profile_parts.append(f"Security Domains: {', '.join(security_domains)}")
    if qa_tools:         profile_parts.append(f"QA Tools: {', '.join(qa_tools)}")
    if aptitude_topics:  profile_parts.append(f"Aptitude Topics: {', '.join(aptitude_topics)}")
    if system_to_design: profile_parts.append(f"System to Design: {system_to_design}")
    if design_focus:     profile_parts.append(f"Architecture Focus Scope: {design_focus}")
    if expected_scale:   profile_parts.append(f"Expected Scale & Volume: {expected_scale}")
    if arch_priority:    profile_parts.append(f"Core SLA & Non-Functional Priorities: {', '.join(arch_priority) if isinstance(arch_priority, list) else arch_priority}")
    if preferred_tech:   profile_parts.append(f"Preferred Tech Stack: {', '.join(preferred_tech) if isinstance(preferred_tech, list) else preferred_tech}")
    if lld_patterns:     profile_parts.append(f"LLD & OOP Patterns: {', '.join(lld_patterns) if isinstance(lld_patterns, list) else lld_patterns}")
    if project_name:     profile_parts.append(f"Project: {project_name}")
    if github_url:       profile_parts.append(f"GitHub: {github_url}")
    if tech_stack:       profile_parts.append(f"Tech Stack: {tech_stack}")
    if user_role_proj:   profile_parts.append(f"Role in Project: {user_role_proj}")
    if deployment_info:  profile_parts.append(f"Deployment: {deployment_info}")
    if gd_topic:         profile_parts.append(f"Discussion Topic: {gd_topic}")
    if gd_participants:  profile_parts.append(f"AI Participants: {gd_participants}")
    if industry:         profile_parts.append(f"Industry: {industry}")
    if product_idea:     profile_parts.append(f"Product: {product_idea}")
    if team_size:        profile_parts.append(f"Team Size: {team_size}")
    if career_goals:     profile_parts.append(f"Career Goals: {career_goals}")
    if achievements:     profile_parts.append(f"Key Achievements: {achievements[:300]}")
    if resume_text:      profile_parts.append(f"Resume Summary: {resume_text[:600]}")
    if job_desc:         profile_parts.append(f"Job Description: {job_desc[:500]}")

    user_profile_block = "\n".join(profile_parts) if profile_parts else "(No additional candidate profile provided)"

    # ── Company Culture DNA Block (Applied to all relevant tracks) ─────────────
    company_block = ""
    if company:
        dna_directive = get_company_dna_directive(company)
        company_block = (
            f"\n\n=== TARGET COMPANY CONTEXT: {company} ==="
            f"\nAlign your evaluation, scenarios, and culture questions with {company}'s known engineering bar and values."
            f"{dna_directive}"
            f"\n" + "=" * 60
        )

    hr_rules = ""
    if is_hr_track:
        hr_rules = (
            f"\nHR INTERVIEW RULES (MANDATORY):"
            f"\n- Session is 20-30 minutes maximum. Ask MAX {max_q} questions total (you are on question {question_count + 1} of {max_q})."
            f"\n- Every question MUST explicitly reference either (a) something the candidate said in their last answer, OR (b) a specific detail from their resume/achievements above."
            f"\n- NEVER ask a question already listed in the QUESTIONS ALREADY ASKED section above."
            f"\n- NEVER ask about code, algorithms, or system design."
            f"\n- Keep each question to 1-2 sentences maximum."
        )

    return f"""You are {profile['persona_name']} interviewing for the role of {role}.
Duration: {duration} min | Max {max_q} questions total.

System Instruction: {profile['system_instruction']}
{f"Personality Override: {persona_override}" if persona_override else ""}

=== CANDIDATE PROFILE (SOURCE OF TRUTH) ===
{user_profile_block}
===========================================================
IMPORTANT: Base ALL questions strictly on the candidate profile and their previous answers.
Do NOT invent experience the candidate has not mentioned.
{company_block}

Evaluation Metrics: [{metrics}]

Current Phase: {phase}
{pacing_modifier}
{adaptive_memory}
{blueprint_block}
{thread_callback_block}
{coverage_block}
{hr_rules}

=== CONVERSATIONAL MICRO-BEHAVIORS (CRITICAL) ===
- Start with a natural 2-4 word conversational bridge or acknowledgment based on what the candidate just said (e.g. "Fair point.", "Got it, that makes sense.", "Interesting trade-off.", "Understood.") before delivering the question.
- Keep the entire response to 1-2 punchy sentences maximum. NEVER write a paragraph-long question.
- NEVER use robotic boilerplate like 'Thank you for that response. Now moving to question 3' or 'According to our rubric'. Talk like a sharp, real-world human interviewer in a live tech interview room.
- Ask exactly ONE clear, focused question at a time.
- Generate follow-ups ONLY based on the candidate's actual previous answer."""




async def get_next_question(
    session_id: str,
    conversation_history: list,
    config: dict,
    stress_index: int = 0,
    question_count: int = 0,
    is_first: bool = False,
    strong_topics: list = None,
    weak_topics: list = None,
    blueprint: dict = None,
    question_records: list = None,
) -> str:
    if not _GEMINI_AVAILABLE:
        return _fallback_question(config, question_count, stress_index, is_first)

    try:
        client = _get_client()

        # ── Build system prompt with blueprint + coverage block ──────────────
        system = _build_prompt(
            config, question_count, stress_index,
            strong_topics, weak_topics,
            blueprint=blueprint,
            question_records=question_records,
        )

        # ── Build conversation contents with strict alternating turns ─────────
        contents = []
        if is_first:
            contents.append({
                "role": "user",
                "parts": [{"text": "Begin the interview. Greet the candidate warmly and ask your first question based on the CANDIDATE PROFILE above."}]
            })
        else:
            for msg in conversation_history[-16:]:
                role = "user" if msg.get("role") == "user" else "model"
                text = msg.get("text", "").strip()
                if not text:
                    continue
                if contents and contents[-1]["role"] == role:
                    contents[-1]["parts"][0]["text"] += f"\n{text}"
                else:
                    contents.append({"role": role, "parts": [{"text": text}]})

            bp_hint = ""
            if blueprint:
                bp_hint = f" [Blueprint Focus: Test '{blueprint.get('concept')}' at '{blueprint.get('dimension')}' cognitive level]"

            track_id = str(config.get("trackId", "default")).lower()
            company  = config.get("company", "the company")
            role     = config.get("role", "this role")

            # Grab the last user answer from conversation_history for explicit grounding
            last_user_answer = ""
            for msg in reversed(conversation_history[-12:]):
                if msg.get("role") == "user":
                    last_user_answer = msg.get("text", "")[:400]
                    break

            last_ans_block = (
                f"\n\n=== CANDIDATE'S LAST SPOKEN ANSWER (GROUND YOUR NEXT QUESTION DIRECTLY IN THIS) ===\n"
                f"{last_user_answer}\n"
                f"=" * 65
            ) if last_user_answer else ""

            if track_id == "hr":
                directive = (
                    f"{last_ans_block}"
                    f"\n\n[MAYA HR DIRECTIVE — NEXT QUESTION RULES:]\n"
                    f"1. Pick ONE specific detail, project, decision, or metric from the candidate's last spoken answer above and build your question around it.\n"
                    f"2. Frame the question with natural reference to {company} and the {role} position.\n"
                    f"3. If their last answer used 'we did X', probe for individual ownership ('What was your exact personal role?'). If no measurable result was stated, probe for the outcome.\n"
                    f"4. Begin with a natural conversational bridge, then ask a punchy 1-2 sentence question.\n"
                    f"5. {bp_hint}"
                )
            elif track_id in ("dsa", "coding"):
                directive = (
                    f"{last_ans_block}"
                    f"\n\n[ARIA ALGORITHM & CODE EVALUATOR DIRECTIVE:]\n"
                    f"1. Critique the algorithmic logic, data structure choice, or code from the candidate's last answer.\n"
                    f"2. Demand exact Big-O Time & Space complexity analysis, challenge an inner loop bottleneck, or test a tricky edge case (nulls, duplicates, overflows).\n"
                    f"3. Start with an authentic conversational bridge (e.g., 'Makes sense on the lookup path.', 'Good intuition on the pointer movement.'), followed by a crisp 1-2 sentence algorithmic question.\n"
                    f"4. {bp_hint}"
                )
            elif track_id in ("system_design", "lld"):
                directive = (
                    f"{last_ans_block}"
                    f"\n\n[DANIEL DISTRIBUTED ARCHITECT & LLD DIRECTIVE:]\n"
                    f"1. Directly challenge the architectural tier, database model, or class abstraction from the candidate's last answer.\n"
                    f"2. Probe a concrete failure scenario: network partition, replication lag, single point of failure (SPOF), cache stampede, or SOLID tight coupling.\n"
                    f"3. Start with a peer-architect conversational bridge ('Solid partitioning approach.', 'Understood on the write path.'), then deliver a 1-2 sentence architectural challenge.\n"
                    f"4. {bp_hint}"
                )
            elif track_id in ("tech", "project"):
                directive = (
                    f"{last_ans_block}"
                    f"\n\n[ALEX SYSTEMS & CODE LEAD DIRECTIVE:]\n"
                    f"1. Drill into the technical mechanics of what they just explained (memory models, concurrency, database indexes, or framework internals).\n"
                    f"2. Ask why they chose that specific implementation over alternatives, or what happens when an upstream dependency fails.\n"
                    f"3. Start with a quick human acknowledgment ('Fair point on that.', 'Got it.'), then ask a razor-sharp 1-2 sentence technical probe.\n"
                    f"4. {bp_hint}"
                )
            elif track_id in ("behavioral", "managerial"):
                directive = (
                    f"{last_ans_block}"
                    f"\n\n[SARAH / MAYA LEADERSHIP & BEHAVIORAL DIRECTIVE:]\n"
                    f"1. Analyze the candidate's STAR narrative from their last answer.\n"
                    f"2. Drill into interpersonal conflict, managing ambiguity, technical pushback, or prioritization trade-offs under deadlines.\n"
                    f"3. Open with a warm, perceptive acknowledgment, then ask a concise 1-2 sentence behavioral question.\n"
                    f"4. {bp_hint}"
                )
            elif track_id == "stress":
                directive = (
                    f"{last_ans_block}"
                    f"\n\n[VICTOR PRESSURE & RESILIENCE DIRECTIVE:]\n"
                    f"1. Skeptically question an assumption or complexity claimed in the candidate's last answer ('Are you confident in that proof?', 'Under peak SLA, that will exhaust worker threads. How do you mitigate it immediately?').\n"
                    f"2. Test their composure, logical resilience, and emotional non-defensiveness.\n"
                    f"3. Keep to 1-2 direct, authoritative sentences without being unprofessional or hostile.\n"
                    f"4. {bp_hint}"
                )
            elif track_id == "ai_ml":
                directive = (
                    f"{last_ans_block}"
                    f"\n\n[NOVA STAFF AI/ML RESEARCH DIRECTIVE:]\n"
                    f"1. Drill into the loss formulation, attention geometry, vector retrieval mechanics, or inference latency trade-offs from their answer.\n"
                    f"2. Ask a focused 1-2 sentence question testing fundamental ML math and production MLOps rather than superficial API calls.\n"
                    f"3. {bp_hint}"
                )
            elif track_id == "cybersecurity":
                directive = (
                    f"{last_ans_block}"
                    f"\n\n[CIPHER PRINCIPAL SECURITY ARCHITECT DIRECTIVE:]\n"
                    f"1. Challenge the candidate on threat vectors (SSRF, privilege escalation, mTLS, JWT tampering, SQLi) in the scenario they just described.\n"
                    f"2. Ask how they enforce Zero Trust boundaries in a crisp 1-2 sentence probe.\n"
                    f"3. {bp_hint}"
                )
            elif track_id in ("cloud", "devops"):
                directive = (
                    f"{last_ans_block}"
                    f"\n\n[MARCUS / SOREN CLOUD & PLATFORM DIRECTIVE:]\n"
                    f"1. Probe multi-region failover, egress cost traps, Kubernetes pod disruption budgets, or GitOps canary rollbacks from their last answer.\n"
                    f"2. Ask a pragmatic 1-2 sentence infrastructure question.\n"
                    f"3. {bp_hint}"
                )
            else:
                directive = (
                    f"{last_ans_block}"
                    f"\n\n[MORGAN SENIOR INTERVIEWER DIRECTIVE:]\n"
                    f"1. Formulate your next question directly grounded in the candidate's last answer above.\n"
                    f"2. Start with a natural 2-4 word human bridge (e.g. 'Makes sense.', 'Understood on that.') and ask a concise 1-2 sentence follow-up.\n"
                    f"3. {bp_hint}"
                )

            if contents and contents[-1]["role"] == "user":
                contents[-1]["parts"][0]["text"] += directive
            else:
                contents.append({"role": "user", "parts": [{"text": directive}]})

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=contents,
            config=_get_config(system_instruction=system, max_output_tokens=600),
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
    blueprint: dict = None,
) -> dict:
    """
    Evaluate a candidate answer and return a structured rubric.
    Includes correctness verdict (is_correct, verdict, what_was_right, what_was_missing),
    star_depth, communication, and concept mastery metadata.
    """
    if not _GEMINI_AVAILABLE:
        return _fallback_evaluation(answer, blueprint, question=question, config=config)

    try:
        client  = _get_client()
        track   = config.get("trackId", "default")
        profile = TRACK_PROFILES.get(track, TRACK_PROFILES["default"])
        metrics = profile["evaluation_metrics"]

        metrics_json = ",".join([
            f'"{m.replace(" ", "_").replace("/", "_").replace("&", "and").lower()}":0-100'
            for m in metrics
        ])
        short_ans = (answer or "")[:800]

        # Include blueprint context so Gemini can correctly identify the concepts
        blueprint_context = ""
        if blueprint:
            blueprint_context = (
                f"\nThis question tested: topic='{blueprint.get('topic')}', "
                f"concept='{blueprint.get('concept')}', "
                f"dimension='{blueprint.get('dimension')}'. "
                f"Use these to populate concepts_tested and cognitive_dimension_assessed."
            )

        prompt = (
            f"You are an expert {track} interview evaluator. Rate this candidate's spoken answer accurately.\n"
            f"Question: {question[:300]}\n"
            f"Candidate Spoken Answer (Speech Transcript): {short_ans}{blueprint_context}\n\n"
            f"Evaluate whether the candidate's answer is accurate, valid, and sufficient, or if it is flawed, vague, or incomplete.\n"
            f"Return ONLY compact JSON, no markdown, no backticks:\n"
            f'{{\n'
            f'  "is_correct": true,\n'
            f'  "verdict": "Correct & Strong",\n'
            f'  "what_was_right": "1-2 sentences highlighting the accurate, relevant, or strong aspects of what the candidate said",\n'
            f'  "what_was_missing": "1-2 sentences explaining what was omitted, imprecise, lacking metrics, or needs improvement",\n'
            f'  "feedback": "one clear actionable improvement tip",\n'
            f'  "overall": 0-100,\n'
            f'  {metrics_json},\n'
            f'  "topics_demonstrated_well": ["exact topic or skill 1"],\n'
            f'  "topics_struggled_with": ["exact topic or skill 2"],\n'
            f'  "concepts_tested": ["concept slug 1"],\n'
            f'  "cognitive_dimension_assessed": "concept|application|trade_off|failure_mode|scale_optimization",\n'
            f'  "justification_quote": "quote exact 1-2 sentences from answer to justify deductions"\n'
            f'}}'
        )

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt,
            config=_get_config(max_output_tokens=700),
        )
        text = response.text.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"): text = text[4:]
        result = json.loads(text.strip())

        # Ensure core correctness and mastery fields always exist
        over_score = result.get("overall", 70)
        if "is_correct" not in result:
            result["is_correct"] = True if over_score >= 75 else ("partial" if over_score >= 50 else False)
        if "verdict" not in result:
            result["verdict"] = (
                "Correct & Strong" if over_score >= 80 else
                "Partially Correct" if over_score >= 55 else
                "Incorrect / Needs Depth"
            )
        if "what_was_right" not in result:
            result["what_was_right"] = "Addressed the core subject of the question."
        if "what_was_missing" not in result:
            result["what_was_missing"] = "Could provide deeper examples or quantifiable results."

        result.setdefault("concepts_tested", [blueprint.get("concept", "")] if blueprint else [])
        result.setdefault("cognitive_dimension_assessed",
                          blueprint.get("dimension", "concept") if blueprint else "concept")
        return result

    except Exception as e:
        print(f"[AIBrain] evaluate_answer error: {e}")
        return _fallback_evaluation(answer, blueprint, question=question, config=config)



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
        real_stress      = telem_avg("stress") or telem_avg("stress_score")
        real_hr          = telem_avg("hr_bpm")
        real_hrv         = telem_avg("hrv_ms")
        real_blink       = telem_avg("blink_rate")
        avg_stress       = real_stress if real_stress is not None else 0

        # Peak stress calculation
        stress_vals = [t.get("stress") or t.get("stress_score") for t in telem if (t.get("stress") or t.get("stress_score")) is not None]
        peak_stress = max(stress_vals) if stress_vals else avg_stress

        # Eye gaze stability label
        if real_eye_contact is None:
            eye_gaze_label = "Optimal"
        elif real_eye_contact >= 75:
            eye_gaze_label = "Optimal & Confident"
        elif real_eye_contact >= 55:
            eye_gaze_label = "Moderate Focus"
        else:
            eye_gaze_label = "Frequent Gaze Deviation"

        # Head pose stability
        poses = [t.get("head_pose", "forward") for t in telem if t.get("head_pose")]
        forward_ratio = (poses.count("forward") / len(poses)) if poses else 1.0
        head_pose_stability = "Stable Forward Focus" if forward_ratio >= 0.8 else "Moderate Movement"

        # Reading / Proctor & Phone Detection flags
        phone_incidents = sum(1 for t in telem if t.get("phone_detected") or t.get("phoneReadingDetected") or t.get("phone_object_visible"))
        proctor_flags = sum(1 for t in telem if t.get("phone_detected") or t.get("reading_detected") or t.get("anomaly") or t.get("phone_object_visible"))
        distraction_score = min(100, phone_incidents * 25)
        integrity_verdict = "CLEAN" if phone_incidents == 0 else ("ADVISORY" if phone_incidents <= 2 else "FLAGGED")

        wpm_vals = [t.get("wpm") for t in telem if t.get("wpm") and t["wpm"] > 0]
        avg_wpm  = int(sum(wpm_vals) / len(wpm_vals)) if wpm_vals else None
        if avg_wpm is None:   speaking_speed = "Not measured"
        elif avg_wpm > 175:   speaking_speed = f"Fast ({avg_wpm} WPM)"
        elif avg_wpm < 90:    speaking_speed = f"Slow ({avg_wpm} WPM)"
        else:                 speaking_speed = f"Good ({avg_wpm} WPM)"

        # Fillers & pauses
        filler_counts = [t.get("filler_count", 0) for t in telem if t.get("filler_count") is not None]
        total_fillers = sum(filler_counts) if filler_counts else 0

        silence_durations = [t.get("silence_duration_ms", 0) for t in telem if t.get("silence_duration_ms")]
        total_silence_sec = round(sum(silence_durations) / 1000, 1)

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
        q_pairs = []
        for i, a in enumerate(answers[:10]):
            r = rubrics[i] if i < len(rubrics) and isinstance(rubrics[i], dict) else {}
            q_score = r.get("overall", over)
            verdict = r.get("verdict") or ("Correct & Strong" if q_score >= 80 else "Partially Correct" if q_score >= 55 else "Incorrect / Needs Depth")
            is_cor  = r.get("is_correct") if "is_correct" in r else (True if q_score >= 75 else "partial" if q_score >= 50 else False)
            q_pairs.append({
                "q":                a.get("question", "")[:300],
                "a":                a.get("answer", "")[:450],
                "score":            q_score,
                "verdict":          verdict,
                "is_correct":       is_cor,
                "what_was_right":   r.get("what_was_right", "Addressed key points of the prompt."),
                "what_was_missing": r.get("what_was_missing", "Could improve depth and specific results."),
                "fb":               r.get("feedback", ""),
                "str":              r.get("strengths", []) or r.get("topics_demonstrated_well", []),
                "imp":              r.get("improvements", []) or r.get("topics_struggled_with", []),
            })

        # Compact Q&A for Gemini narrative generation
        qa_text = "\n".join(
            f"Q{i+1}: {p['q'][:160]}\nA{i+1}: {p['a'][:220]}\nVerdict: {p['verdict']}"
            for i, p in enumerate(q_pairs)
        )[:1200]

        # ── Ask Gemini for text narrative + ideal answers (~750 tokens) ──
        narrative_prompt = (
            f"Interview: {config.get('trackName','General')} | Role: {config.get('role','Engineer')}\n"
            f"Score:{over}/100 Grade:{grade} Stress:{avg_stress}/100 "
            f"Eye Contact:{real_eye_contact or 'N/A'}% Speed:{speaking_speed}\n"
            f"Q&A summary:\n{qa_text}\n\n"
            "Return ONLY compact JSON (no markdown, no extra text):\n"
            '{"strengths":["s1","s2","s3"],'
            '"weak_areas":["w1","w2"],'
            '"behavioral_observation":"2 sentences max covering body language, gaze, pacing, stress",'
            '"executive_summary":"2 sentences max evaluating overall competence and hire readiness",'
            '"learning_plan":[{"day":1,"topic":"t","resource":"r"},'
            '{"day":2,"topic":"t","resource":"r"},{"day":3,"topic":"t","resource":"r"},'
            '{"day":4,"topic":"t","resource":"r"},{"day":5,"topic":"t","resource":"r"},'
            '{"day":6,"topic":"t","resource":"r"},{"day":7,"topic":"t","resource":"r"}],'
            '"ideal_answers":["1-2 sentence ideal answer for Q1","1-2 sentence ideal answer for Q2"]}'
        )

        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=narrative_prompt,
            config=_get_config(max_output_tokens=1000),
        )
        text = response.text.strip()
        if "```" in text:
            text = text.split("```")[1]
            if text.startswith("json"): text = text[4:]
        narr = json.loads(text.strip())

        ideals = narr.get("ideal_answers", [])
        question_reviews = [
            {
                "question_number":  i + 1,
                "question":         p["q"],
                "user_answer":      p["a"],
                "verdict":          p["verdict"],
                "is_correct":       p["is_correct"],
                "what_was_right":   p["what_was_right"],
                "what_was_missing": p["what_was_missing"],
                "ideal_answer":     ideals[i] if i < len(ideals) else (
                    "A strong answer states the core concept clearly, "
                    "supports it with a real example or STAR structure, and provides measurable outcomes."
                ),
                "score":            p["score"],
                "key_takeaway":     p["fb"] or "Strengthen with specific examples, ownership actions, and metrics.",
                "strengths":        p["str"] or ["Relevant answer"],
                "improvements":     p["imp"] or ["Add more depth and measurable outcomes"],
            }
            for i, p in enumerate(q_pairs)
        ]

        # ── Assemble final multi-modal report ──
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
            # Multi-Modal Telemetry
            "stress_score":            avg_stress,
            "peak_stress":             peak_stress,
            "cognitive_load_label":    "Optimal Flow" if avg_stress < 40 else "Moderate Load" if avg_stress < 65 else "Elevated Stress",
            "eye_contact_score":       real_eye_contact,
            "eye_gaze_label":          eye_gaze_label,
            "blink_rate_avg":          real_blink,
            "head_pose_stability":     head_pose_stability,
            "proctor_flags":           proctor_flags,
            "phone_use_count":         phone_incidents,
            "distraction_score":       distraction_score,
            "integrity_verdict":       integrity_verdict,
            "speaking_speed":          speaking_speed,
            "filler_word_count":       total_fillers,
            "silence_duration_sec":    total_silence_sec,
            "hr_bpm":                  real_hr,
            "hrv_ms":                  real_hrv,
            "hire_recommendation":     hire,
            "strengths":               narr.get("strengths", ["Completed session"]),
            "weak_areas":              narr.get("weak_areas", ["Practice more structured answers"]),
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
    "hr": [
        "Tell me about yourself and what sparked your interest in joining our team.",
        "What are your greatest professional strengths, and what is one area you are actively refining?",
        "Why are you interested in this specific role and our organization over others?",
        "Describe a challenging team conflict or high-pressure deadline and how you navigated it.",
        "Where do you see your technical or leadership impact evolving over the next three years?"
    ],
    "tech": [
        "How do you design a database schema to prevent locking contention during heavy concurrent writes?",
        "Walk me through how a web request traverses DNS, TLS handshake, load balancer, and reverse proxy down to kernel socket buffers.",
        "What are the trade-offs between optimistic locking versus pessimistic locking in distributed transactions?",
        "Explain how memory allocation works in your primary language and how you identify memory leaks."
    ],
    "dsa": [
        "How would you detect a cycle in a directed graph, and what is the optimal Time and Space complexity?",
        "Explain how a monotonic stack works and in what problem scenarios you would prefer it over two pointers.",
        "Compare an LRU Cache implemented with HashMap + DoublyLinkedList versus a Segment Tree.",
        "How do you handle hash collisions under high load factors, and what are the trade-offs of robin-hood hashing?"
    ],
    "coding": [
        "Walk me through how you would refactor a tight nested loop that performs repetitive allocations into idiomatic, cache-friendly code.",
        "Explain how you would write unit tests and edge case assertions for an asynchronous data processing pipeline.",
        "What design patterns would you apply to keep business logic completely decoupled from third-party API clients?"
    ],
    "system_design": [
        "Design a distributed rate limiter that handles 200,000 requests per second across multiple data centers.",
        "How do you prevent cache stampedes and cascading database outages when a popular cache key expires?",
        "What consistency model would you choose for a financial ledger versus a real-time analytics counter under network partitions?",
        "Walk me through your database sharding strategy and how you handle resharding without service downtime."
    ],
    "lld": [
        "How would you design a thread-safe Parking Lot or Elevator System adhering strictly to SOLID principles?",
        "Which design pattern would you select to allow pluggable payment gateways without modifying checkout controller code?",
        "Explain the Dependency Inversion Principle with a concrete interface and dependency injection example."
    ],
    "behavioral": [
        "Tell me about a time you strongly disagreed with a senior engineer or product manager's technical direction. How did you handle it?",
        "Describe a project that missed a critical delivery deadline. What was your personal accountability and how did you communicate it?",
        "Give me an example of an ambiguous problem where you had to make a high-stakes decision without complete information."
    ],
    "managerial": [
        "How do you balance paying down technical debt against high-priority product feature deadlines?",
        "Tell me about a time you had to coach an underperforming engineer while keeping team morale intact.",
        "How do you establish engineering SLAs and incident post-mortem culture across cross-functional teams?"
    ],
    "stress": [
        "That proposed solution has an exponential worst-case complexity. In 30 seconds, how do you mathematically prove it doesn't crash production?",
        "Your primary database replica just suffered a split-brain corruption during peak traffic. Walk me through your first 3 minutes of triage.",
        "Why should we select you over candidates with 3x more years of production engineering experience?"
    ],
    "ai_ml": [
        "Walk me through the mathematical mechanics of multi-head self-attention and why scaled dot-product division is necessary.",
        "How do you mitigate embedding drift and hallucination in an enterprise Retrieval-Augmented Generation (RAG) system?",
        "Explain the trade-offs between Quantization-Aware Training (QAT) versus Post-Training Quantization (AWQ/GPTQ) for LLM inference serving."
    ],
    "cybersecurity": [
        "How would you architect a zero-trust authentication system for microservices communicating across public cloud regions?",
        "Walk me through how you would detect and remediate an active Server-Side Request Forgery (SSRF) vulnerability in production.",
        "Explain the mechanics of a JWT replay attack and how token revocation lists or asymmetric keys prevent it."
    ],
    "cloud": [
        "How do you architect a multi-region active-active cloud architecture with sub-second RTO and zero RPO?",
        "What architectural strategies do you employ to prevent catastrophic cloud egress cost spikes during large-scale data transfers?",
        "Compare AWS Transit Gateway versus VPC Peering for a 50-microservice cluster."
    ],
    "devops": [
        "How do you construct a zero-downtime canary deployment pipeline in Kubernetes with automated metric-based rollback?",
        "What is your strategy for distributed tracing and context propagation across asynchronous message queues using OpenTelemetry?",
        "How do you prevent cascading pod crash-loops when an upstream dependency experiences transient network partitions?"
    ],
    "project": [
        "Walk me through the single most technically complex architectural decision you made in your showcased project.",
        "What was the hardest bug or race condition you encountered during development, and how did you systematically diagnose it?",
        "If your active user traffic multiplied by 100x overnight, which component of your project breaks first and how would you re-architect it?"
    ],
    "resume": [
        "Select the project on your resume that you had the highest individual ownership over, and explain your core architectural contributions.",
        "Looking at your claimed technical achievements, which metric or optimization are you most technically proud of achieving?",
        "Can you verify the depth of your experience with the primary technologies listed in your skills section?"
    ],
    "default": [
        "Tell me about yourself and your engineering background.",
        "Describe a complex technical challenge you solved and the specific trade-offs you evaluated.",
        "How do you approach debugging an unfamiliar system under a tight deadline?",
        "Where do you see yourself making your greatest technical impact over the coming years?"
    ],
}

def _fallback_question(config, q_count, stress, is_first):
    track = str(config.get("trackId", "default")).lower()
    qs    = _FALLBACK_Q.get(track, _FALLBACK_Q["default"])
    if is_first:
        p = config.get("personality", "professional")
        role = config.get("role", "Software Engineer")
        greetings = {
            "friendly":     f"Hi! Welcome to your {config.get('trackName', 'interview')} session for {role}. I'm excited to speak with you today. Let's start — tell me about yourself and your journey!",
            "professional": f"Good day. Thank you for joining this session for the {role} position. Let's begin: {qs[0]}",
            "strict":       f"Welcome. We will dive straight into core competencies for {role}. First question: {qs[0]}",
            "stress":       f"Let's get right to it without delay. First question: {qs[0]}",
        }
        return greetings.get(p, greetings["professional"])
    
    # Three-tier affective fallback
    if stress >= 75:
        return "Fair point—let's take a quick breath and reset. Tell me about a project or technical achievement you are genuinely proud of."
    elif stress >= 50:
        return f"Got it. Building on that: {qs[q_count % len(qs)]}"
    
    return qs[q_count % len(qs)]

def _fallback_evaluation(answer, blueprint=None, question="", config=None):
    """Accurate offline heuristic answer evaluation for instant offline feedback."""
    text = (answer or "").strip()
    words = len(text.split())
    
    if words < 5:
        return {
            "is_correct":                   False,
            "verdict":                      "Incomplete / Needs Content",
            "what_was_right":               "Question was acknowledged.",
            "what_was_missing":             "No substantive response was recorded. Please ensure your microphone is speaking clearly or type your response in the answer box.",
            "technical_accuracy":           35,
            "communication":                35,
            "grammar":                      50,
            "problem_solving":              35,
            "star_depth":                   20,
            "confidence":                   40,
            "leadership_ownership":         30,
            "cultural_fit":                 40,
            "critical_thinking":            35,
            "time_management":              40,
            "overall":                      35,
            "feedback":                     "Your response was very brief. To showcase your ability, provide specific examples from your past projects or experiences.",
            "strengths":                    ["Promptness"],
            "improvements":                 ["Provide a detailed real-world example using the STAR method"],
            "topics_demonstrated_well":     [],
            "topics_struggled_with":        ["Providing detailed response context"],
            "concepts_tested":              ([blueprint.get("concept", "")] if blueprint else []),
            "cognitive_dimension_assessed": (blueprint.get("dimension", "concept") if blueprint else "concept"),
            "justification_quote":          text if text else "No audible response provided."
        }

    # Analyze STAR indicators and content richness
    lower = text.lower()
    has_situation = any(w in lower for w in ["when", "during", "at my", "project", "client", "problem", "context", "background", "team"])
    has_task      = any(w in lower for w in ["task", "role", "responsible", "goal", "objective", "needed to", "challenge"])
    has_action    = any(w in lower for w in ["i implemented", "i led", "i created", "i designed", "i resolved", "i developed", "i coordinated", "i decided", "i wrote", "i built", "i analyzed"])
    has_result    = any(w in lower for w in ["result", "outcome", "improved", "increased", "reduced", "delivered", "%", "percent", "saved", "achieved", "learned", "impact"])
    
    star_score = (25 if has_situation else 10) + (25 if has_task else 10) + (30 if has_action else 10) + (20 if has_result else 5)
    length_score = min(100, max(45, int(words * 1.8)))
    
    overall = int((star_score * 0.45) + (length_score * 0.55))
    overall = max(48, min(95, overall))
    
    is_correct = True if overall >= 75 else ("partial" if overall >= 55 else False)
    verdict = "Correct & Strong" if overall >= 78 else ("Partially Correct" if overall >= 55 else "Incorrect / Needs Depth")
    
    # Context-specific what_was_right
    if words >= 30 and has_action and has_result:
        what_was_right = "Articulated a structured narrative with explicit actions and quantifiable outcomes."
    elif words >= 20 and has_action:
        what_was_right = "Clearly highlighted individual ownership and proactive steps taken."
    elif words >= 15:
        what_was_right = "Directly addressed the prompt with relevant context and professional tone."
    else:
        what_was_right = "Provided an initial starting perspective on the topic."

    # Context-specific what_was_missing
    if not has_result:
        what_was_missing = "Include measurable impact, performance metrics, or key results achieved from your actions."
    elif not has_action:
        what_was_missing = "Clarify your specific personal role versus what the broader team handled."
    elif words < 35:
        what_was_missing = "Expand further on trade-offs considered and key lessons learned."
    else:
        what_was_missing = "Could elaborate further on edge cases or long-term system/team impact."

    feedback = f"Response articulated key points well. {what_was_missing}"

    return {
        "is_correct":                   is_correct,
        "verdict":                      verdict,
        "what_was_right":               what_was_right,
        "what_was_missing":             what_was_missing,
        "technical_accuracy":           overall,
        "communication":                min(100, overall + 5),
        "grammar":                      min(100, overall + 8),
        "problem_solving":              max(45, overall - 3),
        "star_depth":                   star_score,
        "confidence":                   min(100, overall + 3),
        "leadership_ownership":         max(45, overall - 4),
        "cultural_fit":                 min(100, overall + 4),
        "critical_thinking":            overall,
        "time_management":              min(100, overall + 2),
        "overall":                      overall,
        "feedback":                     feedback,
        "strengths":                    ["Clear tone", "Direct answer"] if words >= 20 else ["Concise response"],
        "improvements":                 [what_was_missing],
        "topics_demonstrated_well":     [blueprint.get("concept", "Communication")] if blueprint else ["Professional communication"],
        "topics_struggled_with":        [] if overall >= 75 else ["STAR result quantification"],
        "concepts_tested":              ([blueprint.get("concept", "")] if blueprint else []),
        "cognitive_dimension_assessed": (blueprint.get("dimension", "concept") if blueprint else "concept"),
        "justification_quote":          text[:140] if text else "Candidate response recorded."
    }

def _fallback_report(session_data):
    """Offline fallback — derives all multi-modal scores from real session telemetry and answers."""
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
    real_stress      = telem_avg("stress") or telem_avg("stress_score")
    real_hr          = telem_avg("hr_bpm")
    real_hrv         = telem_avg("hrv_ms")
    real_blink       = telem_avg("blink_rate")

    stress_vals = [t.get("stress") or t.get("stress_score") for t in telem if (t.get("stress") or t.get("stress_score")) is not None]
    peak_stress = max(stress_vals) if stress_vals else (real_stress or 0)

    wpm_vals = [t.get("wpm") for t in telem if t.get("wpm") and t["wpm"] > 0]
    avg_wpm  = int(sum(wpm_vals) / len(wpm_vals)) if wpm_vals else None
    if avg_wpm is None:   speaking_speed = "Not measured"
    elif avg_wpm > 175:   speaking_speed = f"Fast ({avg_wpm} WPM)"
    elif avg_wpm < 90:    speaking_speed = f"Slow ({avg_wpm} WPM)"
    else:                 speaking_speed = f"Good ({avg_wpm} WPM)"

    # Fillers & pauses
    filler_counts = [t.get("filler_count", 0) for t in telem if t.get("filler_count") is not None]
    total_fillers = sum(filler_counts) if filler_counts else 0

    silence_durations = [t.get("silence_duration_ms", 0) for t in telem if t.get("silence_duration_ms")]
    total_silence_sec = round(sum(silence_durations) / 1000, 1)

    phone_incidents = sum(1 for t in telem if t.get("phone_detected") or t.get("phoneReadingDetected") or t.get("phone_object_visible"))
    proctor_flags = sum(1 for t in telem if t.get("phone_detected") or t.get("reading_detected") or t.get("anomaly") or t.get("phone_object_visible"))
    distraction_score = min(100, phone_incidents * 25)
    integrity_verdict = "CLEAN" if phone_incidents == 0 else ("ADVISORY" if phone_incidents <= 2 else "FLAGGED")

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
        verdict  = q_rubric.get("verdict") or ("Correct & Strong" if q_score >= 80 else "Partially Correct" if q_score >= 55 else "Incorrect / Needs Depth")
        is_cor   = q_rubric.get("is_correct") if "is_correct" in q_rubric else (True if q_score >= 75 else "partial" if q_score >= 50 else False)

        q_reviews.append({
            "question_number":  idx,
            "question":         a.get("question", f"Question {idx}"),
            "user_answer":      a.get("answer", "No response recorded."),
            "verdict":          verdict,
            "is_correct":       is_cor,
            "what_was_right":   q_rubric.get("what_was_right", "Answered the prompt directly."),
            "what_was_missing": q_rubric.get("what_was_missing", "Provide more depth and quantifiable outcome metrics."),
            "ideal_answer":     (
                f"For '{a.get('question', 'this question')}': A strong answer clearly states "
                f"the core concept or situation, details specific individual actions taken, "
                f"and concludes with quantifiable business outcomes or learnings."
            ),
            "score":            q_score,
            "key_takeaway":     q_rubric.get("feedback", "Good answer. Strengthen with specific examples and metrics."),
            "strengths":        q_rubric.get("strengths", ["Relevant answer"]),
            "improvements":     q_rubric.get("improvements", ["Add more depth and measurable metrics"])
        })

    if not q_reviews:
        q_reviews = [{
            "question_number":  1,
            "question":         "Session ended without recorded answers.",
            "user_answer":      "No answer recorded.",
            "verdict":          "No Answer",
            "is_correct":       False,
            "what_was_right":   "—",
            "what_was_missing": "Complete interview turns to receive evaluation.",
            "ideal_answer":     "Complete a full interview session to see question-by-question review.",
            "score":            0,
            "key_takeaway":     "Start a new session to get detailed feedback.",
            "strengths":        [],
            "improvements":     ["Complete a full interview session"]
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
        # Multi-modal biometrics & telemetry
        "stress_score":            real_stress,
        "peak_stress":             peak_stress,
        "cognitive_load_label":    "Optimal Flow" if (real_stress or 0) < 40 else "Moderate Load" if (real_stress or 0) < 65 else "Elevated Stress",
        "eye_contact_score":       real_eye_contact,
        "eye_gaze_label":          "Optimal Focus" if (real_eye_contact or 0) >= 75 else "Moderate Gaze" if (real_eye_contact or 0) >= 50 else "Gaze Deviation",
        "blink_rate_avg":          real_blink,
        "head_pose_stability":     "Stable Forward Focus",
        "proctor_flags":           proctor_flags,
        "phone_use_count":         phone_incidents,
        "distraction_score":       distraction_score,
        "integrity_verdict":       integrity_verdict,
        "speaking_speed":          speaking_speed,
        "filler_word_count":       total_fillers,
        "silence_duration_sec":    total_silence_sec,
        "hr_bpm":                  real_hr,
        "hrv_ms":                  real_hrv,
        "strengths":  (
            [r for rub in rubrics for r in (rub.get("strengths") or []) if r][:5]
            or ["Completed the interview session", "Clear speech communication"]
        ),
        "weak_areas": (
            [r for rub in rubrics for r in (rub.get("improvements") or []) if r][:4]
            or ["Provide more structured STAR responses with quantified results"]
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
            {"day": 1, "topic": "Core Fundamentals",  "resource": f"Review fundamentals of {config.get('trackId', 'your topic area')}"},
            {"day": 2, "topic": "STAR Formulation",   "resource": "Draft 5 concrete Situation-Task-Action-Result narratives with metric outcomes"},
            {"day": 3, "topic": "Vocal Pacing",       "resource": "Practice speaking at 130-150 WPM with minimal filler words"},
            {"day": 4, "topic": "Conflict Resolution","resource": "Study frameworks for technical and team disagreements"},
            {"day": 5, "topic": "Company Culture",    "resource": "Align answers with core company leadership principles"},
            {"day": 6, "topic": "Targeted Weak Areas","resource": f"Focus on: {', '.join((q_reviews[0].get('improvements') or ['quantified results'])[:2])}"},
            {"day": 7, "topic": "Full Mock Session",  "resource": "Complete a full timed mock session on Neroprep"},
        ],
        "question_reviews":   q_reviews,
        "hire_recommendation": (
            "Strong Yes" if overall >= 88 else
            "Yes"        if overall >= 75 else
            "Maybe"      if overall >= 60 else "No"
        ),
    }


async def transcribe_audio_bytes(audio_bytes: bytes, mime_type: str = "audio/webm") -> dict:
    """
    Transcribe raw recorded audio bytes using Gemini multimodal audio model.
    Falls back gracefully if unavailable.
    """
    if not _GEMINI_AVAILABLE:
        return {"transcript": "", "source": "offline", "confidence": 0.0}

    try:
        from google.genai import types
        client = _get_client()

        part = types.Part.from_bytes(data=audio_bytes, mime_type=mime_type)
        prompt = (
            "You are a professional speech-to-text audio transcription engine.\n"
            "Transcribe the spoken audio with 100% word-for-word accuracy.\n"
            "Rules:\n"
            "- Add proper punctuation (periods, commas, question marks).\n"
            "- Add proper sentence capitalization.\n"
            "- Accurately transcribe technical terms, programming languages, and industry concepts.\n"
            "- Do NOT add explanations, notes, or timestamps.\n"
            "- Return ONLY the verbatim transcribed text."
        )

        response = await asyncio.to_thread(
            client.models.generate_content,
            model=MODEL_NAME,
            contents=[part, prompt],
            config=_get_config(max_output_tokens=1000)
        )

        transcript = response.text.strip() if response and response.text else ""
        return {"transcript": transcript, "source": "gemini-audio", "confidence": 0.98}

    except Exception as e:
        print(f"[AIBrain] transcribe_audio_bytes error: {e}")
        return {"transcript": "", "error": str(e), "source": "fallback"}


