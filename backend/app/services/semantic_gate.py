"""
Semantic Similarity Gate
=========================
3-tier question validation before any generated question is delivered to the candidate:

  Tier 1 — Exact / Near-Exact String Match  (Levenshtein token-set ratio > 90%)
  Tier 2 — Semantic Cosine Similarity       (all-MiniLM-L6-v2 embeddings > 0.78)
  Tier 3 — Concept Saturation               (concept appeared >= 2 times in session)

Uses `sentence-transformers` which is already in requirements.txt.
Falls back gracefully to Tier-1-only if the model cannot be loaded.
"""

from __future__ import annotations
import re
import math
import logging
from typing import Optional

import numpy as np

logger = logging.getLogger(__name__)

# ── Lazy-loaded embedding model ────────────────────────────────────────────────
_encoder = None
_ENCODER_AVAILABLE = False

def _get_encoder():
    global _encoder, _ENCODER_AVAILABLE
    if _encoder is not None:
        return _encoder
    try:
        from sentence_transformers import SentenceTransformer
        _encoder = SentenceTransformer("all-MiniLM-L6-v2")
        _ENCODER_AVAILABLE = True
        logger.info("[SemanticGate] ✓ all-MiniLM-L6-v2 loaded")
    except Exception as e:
        logger.warning(f"[SemanticGate] Embedding model unavailable: {e}. Falling back to string-only gate.")
        _encoder = None
        _ENCODER_AVAILABLE = False
    return _encoder


# ── Utility helpers ────────────────────────────────────────────────────────────

def _normalise(text: str) -> str:
    """Lowercase, strip punctuation, collapse whitespace."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def _token_set(text: str) -> set[str]:
    return set(_normalise(text).split())


def _token_set_ratio(a: str, b: str) -> float:
    """Simple Jaccard token-set overlap ratio (0–1)."""
    sa, sb = _token_set(a), _token_set(b)
    if not sa or not sb:
        return 0.0
    intersection = len(sa & sb)
    union = len(sa | sb)
    return intersection / union if union > 0 else 0.0


def _cosine(a: np.ndarray, b: np.ndarray) -> float:
    """Cosine similarity between two 1-D numpy arrays."""
    norm_a = np.linalg.norm(a)
    norm_b = np.linalg.norm(b)
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return float(np.dot(a, b) / (norm_a * norm_b))


def encode(text: str) -> Optional[np.ndarray]:
    """Encode a single text string to a 384-dim embedding. Returns None if unavailable."""
    enc = _get_encoder()
    if enc is None:
        return None
    try:
        vec = enc.encode(text, convert_to_numpy=True, normalize_embeddings=True)
        return vec.astype(np.float32)
    except Exception as e:
        logger.warning(f"[SemanticGate] encode error: {e}")
        return None


# ── Main Gate ─────────────────────────────────────────────────────────────────

class SimilarityGate:
    """
    Stateless gate — call check() with the new question text and
    the session's existing question_records list.

    Returns (accepted: bool, reason: str, new_embedding: np.ndarray | None)
    """

    # Thresholds — tunable
    EXACT_THRESHOLD:   float = 0.90   # Jaccard token-set ratio
    SEMANTIC_THRESHOLD: float = 0.78  # cosine similarity (384-dim MiniLM)
    MAX_CONCEPT_HITS:  int   = 2      # max times one concept may be tested

    @classmethod
    def check(
        cls,
        new_question: str,
        question_records: list[dict],
        concept_counts: dict[str, int],
        new_concepts: list[str],
    ) -> tuple[bool, str, Optional[np.ndarray]]:
        """
        Args:
            new_question    — candidate question text from Gemini
            question_records — list of {text, embedding, concepts, ...} from session memory
            concept_counts  — {concept_slug: int} saturation counter
            new_concepts    — concepts the new question is expected to test
                              (from blueprint or Gemini rubric extraction)

        Returns:
            (accepted, reason, embedding_vector_or_None)
        """

        # ── Tier 1: Exact / near-exact string gate ──────────────────────────
        for rec in question_records:
            ratio = _token_set_ratio(new_question, rec.get("question_text", ""))
            if ratio >= cls.EXACT_THRESHOLD:
                return (
                    False,
                    f"TIER1_EXACT: Token-set ratio {ratio:.2f} >= {cls.EXACT_THRESHOLD} "
                    f"with Q#{rec.get('turn_number', '?')}",
                    None,
                )

        # ── Tier 2: Semantic cosine similarity gate ──────────────────────────
        new_embedding = encode(new_question)
        if new_embedding is not None:
            for rec in question_records:
                old_emb = rec.get("embedding")
                if old_emb is None:
                    continue
                old_arr = np.array(old_emb, dtype=np.float32)
                sim = _cosine(new_embedding, old_arr)
                if sim >= cls.SEMANTIC_THRESHOLD:
                    return (
                        False,
                        f"TIER2_SEMANTIC: Cosine {sim:.3f} >= {cls.SEMANTIC_THRESHOLD} "
                        f"with Q#{rec.get('turn_number', '?')} "
                        f"('{rec.get('question_text','')[:60]}...')",
                        None,
                    )
        else:
            # Fallback — enhanced Jaccard with a lower threshold for safety
            for rec in question_records:
                ratio = _token_set_ratio(new_question, rec.get("question_text", ""))
                if ratio >= 0.65:
                    return (
                        False,
                        f"TIER2_FALLBACK_JACCARD: ratio {ratio:.2f} >= 0.65",
                        None,
                    )

        # ── Tier 3: Concept saturation gate ─────────────────────────────────
        for concept in (new_concepts or []):
            slug = _normalise(concept).replace(" ", "_")
            count = concept_counts.get(slug, 0)
            if count >= cls.MAX_CONCEPT_HITS:
                return (
                    False,
                    f"TIER3_CONCEPT_SATURATED: '{concept}' already tested {count} times "
                    f"(max {cls.MAX_CONCEPT_HITS})",
                    None,
                )

        return (True, "PASS", new_embedding)


# Singleton instance for import convenience
similarity_gate = SimilarityGate()
