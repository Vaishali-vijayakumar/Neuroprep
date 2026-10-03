# -*- coding: utf-8 -*-
"""
Generate 800 fully unique, verified questions across 20 Mock Tests:
- Foundation / Easy (Tests 1-5, 200 Qs)
- Intermediate / Medium (Tests 6-10, 200 Qs)
- Advanced / Hard (Tests 11-15, 200 Qs)
- Expert / Complex (Tests 16-20, 200 Qs)

Sections per test:
- Quant: 12 questions
- Logical: 10 questions
- Verbal: 10 questions
- NonVerbal: 4 questions
- DI: 4 questions
Total per test = 40 questions.
"""

import json
import os
import random
import math

def q(q_id, section, difficulty, question, options, correct_idx, explanation):
    assert len(options) == 4, f"Options length is not 4 for {q_id}"
    assert len(set(options)) == 4, f"Duplicate options in {q_id}: {options}"
    assert 0 <= correct_idx <= 3, f"Invalid correct_idx in {q_id}: {correct_idx}"
    assert len(question.strip()) > 0, f"Empty question in {q_id}"
    assert len(explanation.strip()) > 0, f"Empty explanation in {q_id}"
    return {
        "id": q_id,
        "section": section,
        "difficulty": difficulty,
        "question": question.strip(),
        "options": [str(x) for x in options],
        "correctIndex": correct_idx,
        "explanation": explanation.strip()
    }

# We will generate tests 1 to 20 systematically
print("generate_all_20_tests script template ready.")
