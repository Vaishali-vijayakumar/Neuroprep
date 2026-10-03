# -*- coding: utf-8 -*-
"""
Full Generator for 800 Placement Aptitude Questions
Tests 1 to 20 across Foundation (Easy), Intermediate (Medium), Advanced (Hard), and Expert (Complex)
"""

import json
import math
import os
import random

# Seed for reproducible high-entropy option shuffling
random.seed(42)

def gcd(a, b):
    while b:
        a, b = b, a % b
    return a

def lcm(a, b):
    return (a * b) // gcd(a, b)

def format_q(q_id, section, difficulty, question, correct_opt, d1, d2, d3, explanation):
    distractors = []
    for d in [d1, d2, d3]:
        d_str = str(d).strip()
        if d_str != str(correct_opt).strip() and d_str not in distractors:
            distractors.append(d_str)
            
    # Guarantee 3 unique distractors
    c = 1
    while len(distractors) < 3:
        cand = f"{correct_opt} (Alt {c})"
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

print("Generator functions defined.")
