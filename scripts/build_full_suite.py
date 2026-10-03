# -*- coding: utf-8 -*-
"""
Full Suite Builder for 800 Placement Aptitude Questions
Tests 1-5: Easy / Foundation (200 Qs)
Tests 6-10: Medium / Intermediate (200 Qs)
Tests 11-15: Hard / Advanced (200 Qs)
Tests 16-20: Complex / Expert (200 Qs)
"""

import json
import os
import random

def create_q(q_id, section, difficulty, question, options, correct_index, explanation):
    assert len(options) == 4, f"Question {q_id} must have exactly 4 options"
    assert 0 <= correct_index <= 3, f"Question {q_id} correct_index {correct_index} out of range"
    assert len(set(options)) == 4, f"Question {q_id} has duplicate options: {options}"
    assert len(question.strip()) > 0, f"Question {q_id} text is empty"
    assert len(explanation.strip()) > 0, f"Question {q_id} explanation is empty"
    return {
        "id": q_id,
        "section": section,
        "difficulty": difficulty,
        "question": question.strip(),
        "options": [str(opt) for opt in options],
        "correctIndex": correct_index,
        "explanation": explanation.strip()
    }

print("create_q validated.")
