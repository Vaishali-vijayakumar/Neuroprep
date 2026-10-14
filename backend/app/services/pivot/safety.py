"""
safety.py
===============================================================================
Safety Layer for Pivot Placement Recovery.
Responsibilities:
  1. Detect urgent safety concerns (self-harm, crisis, imminent danger)
  2. Provide priority crisis support responses without generic RAG
  3. Strip student PII (roll numbers, emails, CGPA, recruiter names)
===============================================================================
"""

import re
from typing import Optional, Tuple

CRISIS_PATTERNS = [
    r"\b(suicide|suicidal|kill myself|want to die|end my life|end it all|better off dead)\b",
    r"\b(harm myself|hurting myself|self harm|cut myself|hang myself)\b",
    r"\b(can't go on living|no reason to live|don't want to live anymore)\b",
    r"\b(worthless to live|take my own life)\b",
]

CRISIS_RESPONSE_TEXT = (
    "I can hear how overwhelmed and exhausted you are feeling right now, and I want you to know "
    "that your safety and life matter deeply. Placement setbacks can cause immense pain, but you do not "
    "have to carry this weight alone.\n\n"
    "Please connect right now with someone who can support you:\n"
    "• Call or text a trusted friend, family member, or college counselor who can be physically with you.\n"
    "• Tele-MANAS (India): Dial 14416 or 1800-891-4416 (24/7 toll-free mental health support)\n"
    "• Vandrevala Foundation: +91 9999 666 555 (Free 24/7 counseling)\n"
    "• 988 Suicide & Crisis Lifeline (US/Canada): Call or text 988\n"
    "• International: If you are in immediate physical danger, please contact local emergency services immediately.\n\n"
    "Please step away from placement prep tonight and reach out to one of these resources right away."
)

class PivotSafetyService:
    @staticmethod
    def check_urgent_safety(message: str) -> Tuple[bool, Optional[str]]:
        """
        Scans message for expressions of imminent danger or self-harm.
        Returns (is_urgent, safety_response).
        """
        if not message:
            return False, None

        lower = message.lower()
        for pattern in CRISIS_PATTERNS:
            if re.search(pattern, lower):
                return True, CRISIS_RESPONSE_TEXT

        return False, None

    @staticmethod
    def scrub_pii(text: str) -> str:
        """Scrubs sensitive student PII (IDs, CGPA, emails, phone numbers, recruiter names)."""
        if not text:
            return ""

        clean = text
        # Roll numbers / Student IDs
        clean = re.sub(r"\b([0-9]{2,4}[A-Za-z]{2,5}[0-9]{3,6}|[0-9]{6,12}|[A-Za-z]{2,4}-[0-9]{4}-[0-9]{3})\b", "[STUDENT_ID]", clean)
        # CGPA / Marks / Percentages
        clean = re.sub(r"\b(\d+(\.\d+)?)\s*(cgpa|gpa|marks|percent|%)\b", "[METRIC]", clean, flags=re.IGNORECASE)
        clean = re.sub(r"\b(cgpa|gpa)\s*(of|is|=|:)?\s*(\d+(\.\d+)?)\b", "[METRIC]", clean, flags=re.IGNORECASE)
        # Emails
        clean = re.sub(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b", "[EMAIL]", clean)
        # Phone numbers
        clean = re.sub(r"\b(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b", "[PHONE]", clean)
        # Recruiter names
        clean = re.sub(r"\b(recruiter|interviewer|hr|panelist)\s+(mr\.|ms\.|mrs\.)?\s*([A-Z][a-z]+)\b", r"\1 [NAME]", clean, flags=re.IGNORECASE)

        return clean.strip()
