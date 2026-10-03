# -*- coding: utf-8 -*-
"""
Comprehensive 800-Question Generator for Placement Aider Aptitude Module
Generates 20 complete mock tests (Tests 1 to 20):
- Tests 1-5: Foundation Level (Easy) -> 200 Qs
- Tests 6-10: Intermediate Level (Medium) -> 200 Qs
- Tests 11-15: Advanced Level (Hard) -> 200 Qs
- Tests 16-20: Expert Level (Complex) -> 200 Qs
"""

import json
import math
import os
import random

random.seed(1337)

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

print("Base setup ready.")
