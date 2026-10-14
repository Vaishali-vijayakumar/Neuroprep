"""
curated_chunks.py
===============================================================================
Curated Knowledge Collection for Pivot Placement Recovery RAG.
Contains 4 categories of verified, grounded material:
  A. Coping and reframing techniques
  B. Placement recovery guides
  C. Action templates (including RESET-17, constraint modification, etc.)
  D. Verified placement facts (grounded, dated, limitations explicit)
===============================================================================
"""

CURATED_KNOWLEDGE_CHUNKS = [
    # ── A. COPING & REFRAMING TECHNIQUES ──
    {
        "id": "reframe_dichotomous_thinking_001",
        "category": "rejection_recovery",
        "support_type": "coping_technique",
        "source_title": "Cognitive Reappraisal in Career Setbacks",
        "source_url": None,
        "verified": True,
        "version": 1,
        "title": "Separating Performance from Potential",
        "text": (
            "A single interview outcome is a data point about a 45-minute conversation under timed conditions, "
            "not a comprehensive evaluation of your engineering competence. Rejection indicates that one solution, "
            "timing window, or communication format did not match that specific panel's benchmark on that specific day. "
            "Distinguish between 'I did not clear this specific interview' and 'I am incapable of getting placed.'"
        )
    },
    {
        "id": "peer_comparison_perspective_002",
        "category": "peer_comparison",
        "support_type": "coping_technique",
        "source_title": "Campus Placement Social Comparison Framework",
        "source_url": None,
        "verified": True,
        "version": 1,
        "title": "Decoupling Personal Progress from Peer Timelines",
        "text": (
            "During campus drives, peer offers are highly visible, creating an illusion that everyone else has succeeded. "
            "In practice, hiring happens in staggered hiring waves across company tiers, sectors, and off-campus pipelines. "
            "Another student receiving an offer does not eliminate your available openings or invalidate the technical preparation "
            "you have completed so far. Focus your energy on factors within your direct agency."
        )
    },
    {
        "id": "self_doubt_controllable_grid_003",
        "category": "self_doubt",
        "support_type": "coping_technique",
        "source_title": "Locus of Control in Technical Interviews",
        "source_url": None,
        "verified": True,
        "version": 1,
        "title": "Controllable vs Uncontrollable Placement Variables",
        "text": (
            "Interview outcomes are governed by two distinct variable sets: Controllable variables (code structure, "
            "clarifying questions, time allocation, edge case identification) and Uncontrollable variables (interviewer "
            "fatigue, problem selection variance, pre-allocated headcount limits, team-specific openings). "
            "Self-doubt often arises when students take full personal blame for uncontrollable hiring factors."
        )
    },
    {
        "id": "anxiety_physiological_fog_004",
        "category": "interview_anxiety",
        "support_type": "coping_technique",
        "source_title": "Performance Anxiety & Working Memory",
        "source_url": None,
        "verified": True,
        "version": 1,
        "title": "Working Memory Reset During Live Coding",
        "text": (
            "When experiencing acute interview pressure, elevated adrenaline temporarily restricts working memory retrieval, "
            "often causing a candidate to go blank on familiar algorithms. This is a biological stress response, not a failure "
            "of intelligence. A 30-second pause to take slow breaths, write out inputs on scratchpad, and state thoughts aloud "
            "restores prefrontal cortical access and allows structured problem-solving to resume."
        )
    },
    {
        "id": "burnout_recovery_pacing_005",
        "category": "burnout_or_fatigue",
        "support_type": "coping_technique",
        "source_title": "Sustained Cognitive Performance & Rest",
        "source_url": None,
        "verified": True,
        "version": 1,
        "title": "Cognitive Satiation and Recovery Pacing",
        "text": (
            "Extended placement preparation without structured recovery leads to diminishing cognitive returns and heightened "
            "irritability. Solving zero problems with high restorative rest produces superior retention compared to forcing "
            "sub-optimal practice sessions when mentally depleted. Taking a full 24-hour break from placement chat groups and IDEs "
            "is an active recovery strategy, not procrastination."
        )
    },

    # ── B. PLACEMENT RECOVERY GUIDES ──
    {
        "id": "rejection_review_protocol_006",
        "category": "rejection_recovery",
        "support_type": "placement_guide",
        "source_title": "Pivot Placement Recovery Guide",
        "source_url": None,
        "verified": True,
        "version": 1,
        "title": "Objective Post-Interview Deconstruction",
        "text": (
            "After a rejection, write down the round, the questions asked, what you answered, where you became uncertain, "
            "and what you can practise next. Separate observed facts from guesses about why the decision was made. "
            "Focus specifically on whether the friction point was problem modeling, edge case verification, language syntax, "
            "or verbal articulation under time constraints."
        )
    },
    {
        "id": "interview_pivot_strategy_007",
        "category": "interview_anxiety",
        "support_type": "placement_guide",
        "source_title": "Interactive Interview Problem Adaptation",
        "source_url": None,
        "verified": True,
        "version": 1,
        "title": "Managing Mid-Interview Constraint Changes",
        "text": (
            "When an interviewer introduces a new constraint (e.g. changing an array from sorted to unsorted, or reducing time "
            "complexity from O(N^2) to O(N)), interviewers evaluate how you adapt under ambiguity, not whether you immediately produce "
            "perfect code. Do not start coding immediately: pause, restate the new constraint, write down two small sample test cases, "
            "and discuss trade-offs before altering your data structures."
        )
    },
    {
        "id": "oa_failure_analysis_008",
        "category": "planning_support",
        "support_type": "placement_guide",
        "source_title": "Online Assessment Triage & Debugging",
        "source_url": None,
        "verified": True,
        "version": 1,
        "title": "Diagnosing Automated Test Drop-offs",
        "text": (
            "Online assessment (OA) failures typically stem from three isolated failure modes: 1. Time Limit Exceeded (TLE) "
            "due to suboptimal asymptotic complexity; 2. Hidden corner case failures (null inputs, duplicate values, 64-bit integer "
            "overflow); or 3. Platform timer pressure causing rushed logic. Review past test questions against this 3-factor rubric "
            "rather than doing unstructured random problem grinding."
        )
    },

    # ── C. ACTION TEMPLATES ──
    {
        "id": "action_reset_17_009",
        "category": "rejection_recovery",
        "support_type": "action_template",
        "source_title": "Pivot Protocol Standards",
        "source_url": None,
        "verified": True,
        "version": 1,
        "title": "Exercise RESET-17: Objective Difficulty Audit",
        "text": (
            "The Pivot recovery exercise called RESET-17 asks the student to record one observed interview difficulty "
            "and one controllable next step. This prevents overgeneralization and anchors the recovery plan in a concrete, "
            "manageable action that takes fewer than 10 minutes to execute."
        )
    },
    {
        "id": "action_constraint_shift_010",
        "category": "interview_anxiety",
        "support_type": "action_template",
        "source_title": "Adaptive Technical Rehearsal",
        "source_url": None,
        "verified": True,
        "version": 1,
        "title": "15-Minute Constraint Variation Exercise",
        "text": (
            "Take one algorithmic problem you have already solved previously. Introduce one artificial modification: "
            "for example, replace unique elements with duplicate elements, or require O(1) auxiliary space instead of O(N). "
            "Spend 15 minutes explaining out loud how your data structures and invariants must adjust, without rushing to write full code."
        )
    },
    {
        "id": "action_edge_case_checklist_011",
        "category": "planning_support",
        "support_type": "action_template",
        "source_title": "Code Robustness Rehearsal",
        "source_url": None,
        "verified": True,
        "version": 1,
        "title": "The 4-Point Submission Checklist",
        "text": (
            "Before submitting any coding test solution, run manual dry-runs against four mandatory edge cases: "
            "1. Empty/Null or Single-element input; 2. All identical elements; 3. Maximum value bounds (e.g. integer overflow beyond 2^31 - 1); "
            "4. Negative numbers or zero. Dedicate 3 minutes exclusively to this verification step."
        )
    },
    {
        "id": "action_box_breathing_reset_012",
        "category": "interview_anxiety",
        "support_type": "action_template",
        "source_title": "Autonomic Nervous System Regulation",
        "source_url": None,
        "verified": True,
        "version": 1,
        "title": "3-Minute Pre-Interview Physiological Reset",
        "text": (
            "Sit upright with uncrossed legs 5 minutes before joining the video call. Inhale through your nose for 4 counts, "
            "hold for 4 counts, exhale smoothly through your mouth for 4 counts, and hold empty for 4 counts. "
            "Repeat for 4 full cycles to down-regulate sympathetic arousal and reduce vocal tremors."
        )
    },

    # ── D. VERIFIED PLACEMENT FACTS ──
    {
        "id": "verified_placement_calendar_013",
        "category": "peer_comparison",
        "support_type": "verified_fact",
        "source_title": "Campus Recruitment Seasonality Report",
        "source_url": None,
        "verified": True,
        "version": 1,
        "title": "Multi-Wave Campus Placement Timelines",
        "text": (
            "Campus placement cycles operate in sequential seasonal waves: Wave 1 (August to October) primarily features early-slot "
            "marquee recruiters, while Wave 2 (November to February) and Wave 3 (March to May) account for substantial hiring volumes "
            "across mid-tier, specialized product, and off-campus roles. An unplaced status during Wave 1 reflects the recruitment calendar's "
            "phased timeline rather than an endpoint."
        )
    },
    {
        "id": "verified_headcount_funnel_014",
        "category": "rejection_recovery",
        "support_type": "verified_fact",
        "source_title": "Technical Hiring Committee Allocation Practices",
        "source_url": None,
        "verified": True,
        "version": 1,
        "title": "Panel Slot Allocations vs Candidate Competence",
        "text": (
            "In high-volume recruitment drives, companies often have strict headcount limits per college campus. When 25 candidates "
            "clear Round 1 with competent solutions but the hiring budget is capped at 5 offers, interview panels are forced to select "
            "based on minor marginal preferences or interview slot order. Rejection in final rounds frequently reflects quota ceilings "
            "rather than technical disqualification."
        )
    },
    {
        "id": "verified_lateral_hiring_015",
        "category": "self_doubt",
        "support_type": "verified_fact",
        "source_title": "Software Engineering Early-Career Market Dynamics",
        "source_url": None,
        "verified": True,
        "version": 1,
        "title": "Continuous Off-Campus Lateral Hiring Reality",
        "text": (
            "Unlike fixed campus placement windows, off-campus entry-level and junior software engineer hiring operates continuously "
            "throughout the year. Evaluation off-campus places higher weight on public repositories, reproducible side projects, and verifiable "
            "system proficiency than on single 45-minute timed algorithm rounds."
        )
    }
]
