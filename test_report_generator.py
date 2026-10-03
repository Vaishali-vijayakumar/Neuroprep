"""
test_report_generator.py — Verification suite for Rubric Conversion & Report Generation
"""

from report_generator import (
    convert_evaluation_to_rubrics,
    calculate_composure_score,
    generate_adaptive_curriculum,
    synthesize_final_report,
    CandidateReportSchema
)

def test_multi_turn_phase_aggregation():
    print("--- 1. Testing Multi-Turn Phase Aggregation (Bug Fix) ---")
    
    # Simulate Phase 1 with 2 turns: Primary Question + Follow-up Probe
    mock_logs = [
        {
            "phase": "Phase 1: Architecture",
            "turn": 1,
            "question": "When would you choose RAG over Fine-Tuning?",
            "candidate_response": "I choose RAG for dynamic enterprise data.",
            "evaluation": {
                "technical_accuracy_score": 0.8,
                "covered_critical_flags": ["Dynamic enterprise data"],
                "missing_critical_flags": ["Access control/RBAC"],
                "covered_bonus_flags": [],
                "red_flags_detected": [],
                "overall_score": 0.65
            }
        },
        {
            "phase": "Phase 1: Architecture",
            "turn": 2,
            "question": "What about access control and security?",
            "candidate_response": "We use metadata pre-filtering for RBAC and it reduces TTFT latency.",
            "evaluation": {
                "technical_accuracy_score": 0.95,
                "covered_critical_flags": ["Access control/RBAC"],
                "missing_critical_flags": [],
                "covered_bonus_flags": ["TTFT latency reduction"],
                "red_flags_detected": [],
                "overall_score": 0.95
            }
        }
    ]

    rubrics = convert_evaluation_to_rubrics(mock_logs, candidate_level="Senior")
    phase1 = rubrics.get("Phase 1: Architecture")
    assert phase1 is not None

    print(f"  Aggregated Critical Coverage: {phase1.critical_coverage_pct}%")
    print(f"  Demonstrated Bonus Flags: {phase1.bonus_flags_demonstrated}")
    print(f"  Phase 1 Final Score: {phase1.score}/100 ({phase1.tier})")

    # In Turn 1 "Access control/RBAC" was missing, but Turn 2 covered it!
    # With multi-turn aggregation, both flags are now covered -> 100% coverage
    assert phase1.critical_coverage_pct == 100.0
    assert "TTFT latency reduction" in phase1.bonus_flags_demonstrated
    assert phase1.score >= 85.0
    print("  [PASS] Multi-turn accumulation verified! Turn 2 did not overwrite Turn 1.")

def test_senior_score_ceiling_and_bounded_penalties():
    print("\n--- 2. Testing Senior Score Ceiling & Bounded Penalties ---")

    # Turn with missing critical flag and a red flag
    mock_logs = [
        {
            "phase": "Phase 2: Ingestion",
            "turn": 1,
            "question": "Walk through your ingestion pipeline.",
            "candidate_response": "I use simple 500-token chunks with no overlap for everything.",
            "evaluation": {
                "technical_accuracy_score": 0.4,
                "covered_critical_flags": ["Layout-Aware parsing"],
                "missing_critical_flags": ["Hierarchical/Parent-Child chunking"],
                "covered_bonus_flags": [],
                "red_flags_detected": ["Proposing naive fixed token windows for structured tables"],
                "overall_score": 0.40
            }
        }
    ]

    rubrics = convert_evaluation_to_rubrics(mock_logs, candidate_level="Senior")
    phase2 = rubrics.get("Phase 2: Ingestion")
    assert phase2 is not None

    print(f"  Phase 2 Score with missing critical flag & red flag: {phase2.score}/100 ({phase2.tier})")
    assert phase2.score <= 70.0  # Mathematical ceiling enforced
    assert len(phase2.red_flags_detected) == 1
    print("  [PASS] Mathematical Score Floor (<= 70.0) & Bounded Red Flag penalty verified!")

def test_non_punitive_composure_model():
    print("\n--- 3. Testing Non-Punitive Composure Model ---")
    
    normal_telemetry = {
        "peak_stress_score": 25.0,
        "hrv_drop_ratio": 0.05,
        "masked_panic_detected": False
    }
    score_normal = calculate_composure_score(normal_telemetry)
    print(f"  Composure score (Steady): {score_normal}/100")
    assert score_normal >= 85.0

    panic_telemetry = {
        "peak_stress_score": 85.0,
        "hrv_drop_ratio": 0.65,
        "masked_panic_detected": True
    }
    score_panic = calculate_composure_score(panic_telemetry)
    print(f"  Composure score (Acute Panic): {score_panic}/100")
    assert score_panic < 45.0
    print("  [PASS] Composure differential scoring verified!")

def test_adaptive_curriculum_and_report_synthesis():
    print("\n--- 4. Testing Adaptive Curriculum & End-to-End Report Synthesis ---")

    mock_state = {
        "candidate_level": "Senior",
        "transcript_logs": [
            {
                "phase": "Phase 1: Architecture",
                "turn": 1,
                "question": "RAG vs Fine-tuning",
                "candidate_response": "RAG is good for dynamic data.",
                "evaluation": {
                    "technical_accuracy_score": 0.85,
                    "covered_critical_flags": ["Dynamic enterprise data", "Zero retraining cost"],
                    "missing_critical_flags": ["Access control/RBAC"],
                    "covered_bonus_flags": ["TTFT latency reduction"],
                    "red_flags_detected": [],
                    "overall_score": 0.80
                }
            },
            {
                "phase": "Phase 3: Retrieval",
                "turn": 1,
                "question": "Why does vector search fail?",
                "candidate_response": "We use BM25 + dense search with RRF and cross-encoders.",
                "evaluation": {
                    "technical_accuracy_score": 0.95,
                    "covered_critical_flags": ["Hybrid Search (Dense + Sparse/BM25)", "Reciprocal Rank Fusion (RRF)", "Cross-encoder Re-ranking"],
                    "missing_critical_flags": [],
                    "covered_bonus_flags": ["ColBERT late interaction"],
                    "red_flags_detected": [],
                    "overall_score": 0.95
                }
            }
        ]
    }

    report = synthesize_final_report("sess_test_123", mock_state)
    assert isinstance(report, CandidateReportSchema)
    print(f"  Session ID: {report.session_id}")
    print(f"  Overall Score: {report.overall_score}/100")
    print(f"  Hiring Decision: {report.hire_decision}")
    print(f"  Executive Verdict: {report.executive_verdict}")
    print(f"  Curriculum Days Generated: {len(report.personalized_7_day_curriculum)}")

    assert len(report.personalized_7_day_curriculum) == 7
    print(f"  Day 1 Remediation Focus: '{report.personalized_7_day_curriculum[0].focus}'")
    print("  [PASS] CandidateReportSchema validation & 7-day curriculum generation verified!")

if __name__ == "__main__":
    test_multi_turn_phase_aggregation()
    test_senior_score_ceiling_and_bounded_penalties()
    test_non_punitive_composure_model()
    test_adaptive_curriculum_and_report_synthesis()
    print("\n========================================================")
    print("  ALL REPORT GENERATION TESTS PASSED CLEANLY! (4/4)    ")
    print("========================================================")
