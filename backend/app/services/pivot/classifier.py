"""
classifier.py
===============================================================================
Mindset and Support Need Classifier for Pivot.
Identifies the tentative support category and user need.
This is a heuristic routing hint, NOT a clinical or psychological diagnosis.
===============================================================================
"""

import re
from typing import Dict, Any, List
from app.schemas.pivot import SupportCategory, ChatMessage

CATEGORY_KEYWORDS = {
    "rejection_recovery": [
        "rejected", "rejection", "failed", "didn't clear", "did not clear", 
        "eliminated", "dropped", "round 2", "round 1", "oa failed", "screened out"
    ],
    "peer_comparison": [
        "friends", "peers", "classmates", "batchmates", "everyone got", 
        "everyone is placed", "falling behind", "left behind", "comparing", 
        "product company offers", "higher package", "less package"
    ],
    "interview_anxiety": [
        "panic", "panicked", "froze", "blank", "shivering", "nervous", 
        "scared", "fear", "anxious", "interviewer asked", "timer", "choked", "changed the problem"
    ],
    "self_doubt": [
        "not good enough", "imposter", "incapable", "worthless", "not smart", 
        "maybe i'm not", "maybe i am not", "degree wasted", "unqualified"
    ],
    "overthinking": [
        "what if", "can't stop thinking", "loop", "imagining", "worst case", 
        "spiral", "ruminating", "overthinking"
    ],
    "burnout_or_fatigue": [
        "burnout", "exhausted", "tired", "cannot study", "no energy", 
        "drained", "can't focus", "headache", "giving up"
    ],
    "planning_support": [
        "what next", "roadmap", "what should i do", "how to prepare", 
        "study plan", "where to start", "next step", "schedule"
    ]
}

class MindsetClassifier:
    @staticmethod
    def classify(message: str, history: List[ChatMessage] = None, preferred_support: str = None) -> Dict[str, Any]:
        """
        Estimates the primary support category and immediate support need.
        Returns dictionary with: category, confidence, support_need, reason.
        """
        if not message:
            return {
                "category": "general_venting",
                "confidence": 0.5,
                "support_need": "listening",
                "reason": "Empty or baseline message."
            }

        text = message.lower()

        # Check keyword matches
        scores = {}
        matched_words = {}
        for cat, keywords in CATEGORY_KEYWORDS.items():
            matches = [kw for kw in keywords if kw in text]
            if matches:
                scores[cat] = len(matches)
                matched_words[cat] = matches

        if not scores:
            # Check context from immediate prior user message if available
            return {
                "category": "general_venting",
                "confidence": 0.60,
                "support_need": preferred_support or "listening",
                "reason": "General open-ended expression without narrow category keywords."
            }

        # Highest scored category
        primary_cat = max(scores, key=scores.get)
        match_count = scores[primary_cat]
        confidence = min(0.92, 0.65 + (match_count * 0.08))

        # Determine support need
        if preferred_support:
            support_need = preferred_support
        elif primary_cat in ["interview_anxiety", "planning_support"]:
            support_need = "practical_guidance"
        elif primary_cat in ["rejection_recovery", "peer_comparison"]:
            support_need = "reframe_and_action"
        elif primary_cat in ["burnout_or_fatigue"]:
            support_need = "rest_and_pacing"
        elif primary_cat in ["self_doubt", "overthinking"]:
            support_need = "perspective_shift"
        else:
            support_need = "listening"

        matched_terms = ", ".join(matched_words.get(primary_cat, [])[:3])
        reason = f"Detected themes related to {primary_cat.replace('_', ' ')} (e.g., '{matched_terms}')."

        return {
            "category": primary_cat,
            "confidence": round(confidence, 2),
            "support_need": support_need,
            "reason": reason
        }
