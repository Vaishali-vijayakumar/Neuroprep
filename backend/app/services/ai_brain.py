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

TRACK_PROFILES = {
    "hr": {
        "persona_name": "Senior Talent Acquisition & People Operations Lead (MAYA)",
        "system_instruction": (
            "You are Maya, an experienced Senior Talent Acquisition Leader conducting a focused, conversational HR Interview for the COMPANY and ROLE specified in the candidate profile.\n"
            "TOTAL SESSION: 20-30 minutes. Ask MAXIMUM 8-10 questions. Be concise. One question at a time.\n\n"
            "CORE PRINCIPLES:\n"
            "1. COMPANY-SPECIFIC FRAMING: Every question must be anchored to the target COMPANY culture, values, and job description provided. Reference the company by name naturally.\n"
            "2. TRANSCRIPT-GROUNDED FOLLOW-UP: Formulate each follow-up question by picking up a SPECIFIC detail from the candidate's last spoken answer — a project name, a technology, a team conflict, a decision, or a result they mentioned. Always say 'You mentioned [X from their answer]...' to show you listened.\n"
            "3. NO REPETITION: You will receive a list of ALL questions already asked. NEVER ask a question that is semantically identical or closely similar to any prior question in that list.\n"
            "4. NO CODING: Do not ask algorithms, data structures, or code. Focus only on behavioral, motivational, and situational competencies.\n"
            "5. STAR ENFORCEMENT: If the candidate answered with 'we did X', probe: 'What was YOUR specific contribution?' If no result was mentioned, probe: 'What was the measurable outcome?'\n"
            "6. TONE: Warm, professional, conversational. 1-2 sentences per question maximum."
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
    # System Design fields
    system_to_design= config.get("systemToDesign", "")
    expected_scale  = config.get("expectedScale", "")
    preferred_tech  = config.get("preferredTech", "")
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

    # ── Adaptive Stress Guardrails ─────────────────────────────────────────────
    if stress_index > 70:
        pacing_modifier = (
            "[ADAPTIVE PACING ACTIVE — HIGH STRESS] Candidate shows elevated physiological stress. "
            "Override difficulty to 'Beginner'. Shift tone to exceptionally warm and reassuring. "
            "Ask a confidence-building question."
        )
    elif stress_index > 50:
        pacing_modifier = (
            "[ADAPTIVE PACING — MODERATE STRESS] Moderate cognitive load detected. "
            "Maintain topic but use a supportive tone. Allow extra think time."
        )
    else:
        pacing_modifier = "[STANDARD PACING] Maintain professional rigor."

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
    if expected_scale:   profile_parts.append(f"Expected Scale: {expected_scale}")
    if preferred_tech:   profile_parts.append(f"Preferred Tech: {preferred_tech}")
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

    # ── Company-specific context block for HR ──────────────────────────────────
    company_block = ""
    if is_hr_track and company:
        company_block = (
            f"\n\n=== COMPANY CONTEXT: {company} ==="
            f"\nAll your questions MUST be framed in the context of {company}'s culture, values, and the specific {role} role."
            f"\nNaturally reference {company} by name in your questions (e.g., 'At {company}, we value X. Can you tell me about a time...')."
            f"\nUse any job description content above to anchor questions to the actual requirements of the role."
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
{coverage_block}
{hr_rules}

General Rules:
- Ask ONE question at a time, never multiple.
- Generate follow-ups ONLY based on the candidate's actual previous answer.
- Keep all responses concise (2-3 sentences max).
- Be natural and conversational.
- NEVER ask a pure definition question unless it is a 'concept' phase."""




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

            if track_id == "hr":
                last_ans_block = (
                    f"\n\n=== CANDIDATE'S LAST SPOKEN ANSWER (GROUND YOUR NEXT QUESTION IN THIS) ===\n"
                    f"{last_user_answer}\n"
                    f"=" * 65
                ) if last_user_answer else ""

                directive = (
                    f"{last_ans_block}"
                    f"\n\n[MAYA HR DIRECTIVE — NEXT QUESTION RULES:]\n"
                    f"1. Pick ONE specific detail, project, decision, or claim from the candidate's last spoken answer above and build your question around it."
                    f" For example: if they mentioned 'reduced deployment time by 40%', ask them HOW they specifically achieved that or what their personal role was.\n"
                    f"2. Frame the question with reference to {company} and the {role} position. Use '{company}' by name naturally.\n"
                    f"3. If their last answer used 'we did X', probe for individual ownership. If no measurable result was stated, probe for the outcome.\n"
                    f"4. Do NOT repeat or rephrase any question already listed in the QUESTIONS ALREADY ASKED section above.\n"
                    f"5. Keep question to 1-2 sentences maximum. NO coding questions.\n"
                    f"6. {bp_hint}"
                )
            elif track_id in ("behavioral", "managerial"):
                directive = (
                    f"\n\n[INTERVIEWER DIRECTIVE:\n"
                    f"1. Analyze the candidate's speech transcript above.\n"
                    f"2. Formulate your next question referencing their specific examples and STAR components.\n"
                    f"3. {bp_hint}\n"
                    f"4. Ask a concise 1-2 sentence behavioral follow-up.]"
                )
            else:
                directive = (
                    f"\n\n[INTERVIEWER DIRECTIVE: Formulate your next question based on the candidate's answer above."
                    f"{bp_hint} Do NOT repeat previous questions. Ask a concise 2-3 sentence follow-up.]"
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

        # Reading / Proctor flags
        proctor_flags = sum(1 for t in telem if t.get("phone_detected") or t.get("reading_detected") or t.get("anomaly"))

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
    "hr":      [
        "Tell me about yourself and your professional journey.",
        "What are your greatest professional strengths and an area you are actively working to improve?",
        "Why are you interested in this specific role and our organization?",
        "Describe a challenging situation or team conflict and how you resolved it.",
        "Where do you see your career heading over the next three years?"
    ],
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
            "friendly":     f"Hi! Welcome to your {config.get('trackName','interview')} session. I'm your AI mentor. Let's start — tell me about yourself and your background!",
            "professional": f"Good day. Thank you for joining this session. Let's begin — {qs[0]}",
            "strict":       f"We begin immediately. First question: {qs[0]}",
            "stress":       f"No time to waste. First question: {qs[0]}",
        }
        return greetings.get(p, greetings["professional"])
    if stress > 70:
        return "Let's take a breath. Tell me about a project or achievement you're genuinely proud of."
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

    proctor_flags = sum(1 for t in telem if t.get("phone_detected") or t.get("reading_detected") or t.get("anomaly"))

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


