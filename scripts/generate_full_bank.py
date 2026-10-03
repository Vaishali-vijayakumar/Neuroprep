# -*- coding: utf-8 -*-
"""
Generator script to build and validate all 800 unique placement aptitude questions
across 20 Mock Tests (Easy, Medium, Hard, Complex).
"""

import json
import os
import random

def make_q(q_id, section, difficulty, question, correct_opt, dist1, dist2, dist3, explanation, target_idx=None):
    if target_idx is None:
        target_idx = random.randint(0, 3)
    
    distractors = [dist1, dist2, dist3]
    options = []
    d_idx = 0
    for i in range(4):
        if i == target_idx:
            options.append(str(correct_opt))
        else:
            options.append(str(distractors[d_idx]))
            d_idx += 1
            
    assert len(set(options)) == 4, f"Duplicate options in {q_id}: {options}"
    return {
        "id": q_id,
        "section": section,
        "difficulty": difficulty,
        "question": question.strip(),
        "options": options,
        "correctIndex": target_idx,
        "explanation": explanation.strip()
    }

print("make_q initialized.")
