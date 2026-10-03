# -*- coding: utf-8 -*-
"""
Full Dataset Generator for 800 Unique, Verified Placement Aptitude Questions
Difficulty Tiers:
- Tests 1-5: Foundation (Easy) -> 200 Questions
- Tests 6-10: Intermediate (Medium) -> 200 Questions
- Tests 11-15: Advanced (Hard) -> 200 Questions
- Tests 16-20: Expert (Complex) -> 200 Questions
Total: 20 Tests * 40 Questions = 800 Questions
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

print("q() function ready.")
