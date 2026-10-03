# -*- coding: utf-8 -*-
"""
Master Assembler & Validator for 800 Placement Aptitude Questions
"""

import json
import os
import random
import sys

# Seed for reproducible high-entropy option shuffling
random.seed(2026)

def make_q(q_id, section, difficulty, question, correct_opt, d1, d2, d3, explanation):
    distractors = []
    for d in [d1, d2, d3]:
        d_str = str(d).strip()
        if d_str != str(correct_opt).strip() and d_str not in distractors:
            distractors.append(d_str)
            
    c = 1
    while len(distractors) < 3:
        cand = f"None of these ({c})"
        if cand not in distractors:
            distractors.append(cand)
        c += 1
        
    target_idx = random.randint(0, 3)
    options = []
    d_ptr = 0
    for i in range(4):
        if i == target_idx:
            options.append(str(correct_opt).strip())
        else:
            options.append(distractors[d_ptr])
            d_ptr += 1
            
    return {
        "id": q_id,
        "section": section,
        "difficulty": difficulty,
        "question": question.strip(),
        "options": options,
        "correctIndex": target_idx,
        "explanation": explanation.strip()
    }

# Import tier generators
from gen_easy import get_easy_tests
from gen_medium import get_medium_tests
from gen_hard import get_hard_tests
from gen_complex import get_complex_tests

def main():
    print("--- Starting 800-Question Bank Build & Verification ---")
    easy_tests = get_easy_tests(make_q)
    medium_tests = get_medium_tests(make_q)
    hard_tests = get_hard_tests(make_q)
    complex_tests = get_complex_tests(make_q)
    
    all_tests = easy_tests + medium_tests + hard_tests + complex_tests
    
    print(f"Total Tests Created: {len(all_tests)}")
    assert len(all_tests) == 20, f"Expected 20 tests, got {len(all_tests)}"
    
    total_questions = 0
    all_q_ids = set()
    all_q_texts = set()
    correct_idx_distribution = {0: 0, 1: 0, 2: 0, 3: 0}
    section_counts = {}
    
    for t_idx, test in enumerate(all_tests):
        qs = test["questions"]
        assert len(qs) == 40, f"Test {test['id']} has {len(qs)} questions (expected 40)"
        total_questions += len(qs)
        
        # Verify section breakdown
        test_sec_counts = {"Quant": 0, "Logical": 0, "Verbal": 0, "NonVerbal": 0, "DI": 0}
        for q in qs:
            q_id = q["id"]
            assert q_id not in all_q_ids, f"Duplicate question ID: {q_id}"
            all_q_ids.add(q_id)
            
            q_text = q["question"]
            assert q_text not in all_q_texts, f"Duplicate question stem in {q_id}: {q_text[:40]}"
            all_q_texts.add(q_text)
            
            assert len(q["options"]) == 4, f"Options length != 4 in {q_id}"
            assert len(set(q["options"])) == 4, f"Duplicate options within question {q_id}: {q['options']}"
            
            c_idx = q["correctIndex"]
            assert 0 <= c_idx <= 3, f"Invalid correctIndex {c_idx} in {q_id}"
            correct_idx_distribution[c_idx] += 1
            
            sec = q["section"]
            test_sec_counts[sec] += 1
            section_counts[sec] = section_counts.get(sec, 0) + 1
            
            assert len(q["explanation"].strip()) > 0, f"Empty explanation in {q_id}"
            
        assert test_sec_counts["Quant"] == 12, f"Test {test['id']} Quant count != 12"
        assert test_sec_counts["Logical"] == 10, f"Test {test['id']} Logical count != 10"
        assert test_sec_counts["Verbal"] == 10, f"Test {test['id']} Verbal count != 10"
        assert test_sec_counts["NonVerbal"] == 4, f"Test {test['id']} NonVerbal count != 4"
        assert test_sec_counts["DI"] == 4, f"Test {test['id']} DI count != 4"
        
    print(f"Total Questions Verified: {total_questions} (Expected 800)")
    print(f"Correct Index Distribution (A/B/C/D): {correct_idx_distribution}")
    print(f"Total Section Breakdown: {section_counts}")
    
    # Categories definition
    categories = [
        {
            "id": 'foundation',
            "title": 'Foundation Level Tests',
            "level": 'Foundation',
            "badgeColor": '#ECFDF5',
            "borderColor": '#A7F3D0',
            "textColor": '#065F46',
            "desc": 'Core arithmetic, elementary logical deduction, basic verbal grammar, and foundational problem solving.'
        },
        {
            "id": 'intermediate',
            "title": 'Intermediate Level Tests',
            "level": 'Intermediate',
            "badgeColor": '#EFF6FF',
            "borderColor": '#BFDBFE',
            "textColor": '#1E40AF',
            "desc": 'Standard commercial arithmetic, speed calculations, data analysis, and multi-step reasoning drills.'
        },
        {
            "id": 'advanced',
            "title": 'Advanced Level Tests',
            "level": 'Advanced',
            "badgeColor": '#FFFBEB',
            "borderColor": '#FDE68A',
            "textColor": '#92400E',
            "desc": 'Complex permutations, probability distributions, matrix puzzles, abstract syllogisms, and multi-chart DI.'
        },
        {
            "id": 'expert',
            "title": 'Expert Level Tests',
            "level": 'Expert',
            "badgeColor": '#FFF1F2',
            "borderColor": '#FECDD3',
            "textColor": '#9F1239',
            "desc": 'Full-length high-rigour placement assessment simulations with stringent timing and comprehensive all-topic coverage.'
        }
    ]

    definitions = [
        {"id": t["id"], "sectionId": t["sectionId"], "title": t["title"], "level": t["level"], "focus": t["focus"], "difficulty": t["difficulty"]}
        for t in all_tests
    ]
    
    # Format JavaScript output
    js_content = "// 20 Mock Tests Dataset (800 Unique Verified Placement Questions)\n"
    js_content += "// Generated and verified across Foundation (Easy), Intermediate (Medium), Advanced (Hard), and Expert (Complex) tiers.\n\n"
    js_content += "export const MOCK_TEST_CATEGORIES = " + json.dumps(categories, indent=2) + ";\n\n"
    js_content += "export const MOCK_TEST_DEFINITIONS = " + json.dumps(definitions, indent=2) + ";\n\n"
    js_content += "export const MOCK_TESTS_CATALOG = " + json.dumps(all_tests, indent=2) + ";\n"
    
    out_path = os.path.join(os.path.dirname(__file__), "..", "src", "data", "mockTestsData.js")
    with open(out_path, "w", encoding="utf-8") as f:
        f.write(js_content)
        
    print(f"Successfully wrote 800 unique questions to: {out_path}")
    print("ALL ASSERTIONS PASSED SUCCESSFULLY!")

if __name__ == '__main__':
    main()
