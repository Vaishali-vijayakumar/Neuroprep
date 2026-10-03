import os
from interviewer_engine import QuestionRetriever, MODULE_PHASES, build_interviewer_graph, get_llm, EvaluationOutput

def test_engine():
    print("1. Testing QuestionRetriever...")
    retriever = QuestionRetriever("interview_questions.csv")
    for phase in MODULE_PHASES:
        q = retriever.get_question("RAG_CORE", phase, "Senior")
        print(f"  [OK] {phase}: {q['question_id']} -> {q['question_text'][:50]}...")
        assert len(q["expected_green_flags"]) > 0
        assert len(q["follow_up_probes"]) > 0

    print("\n2. Testing Graph compilation...")
    llm = get_llm()
    structured_evaluator = llm.with_structured_output(EvaluationOutput)
    graph = build_interviewer_graph(retriever, structured_evaluator)
    print("  [OK] LangGraph compiled successfully!")

    print("\nAll component tests passed successfully!")

if __name__ == "__main__":
    test_engine()
