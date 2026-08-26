"""
Interview Session Memory Service — 4-Level Knowledge State
===========================================================
Stores all session state in-memory (swap dict for Redis in production).

Level 1 — Exact Question Memory     : question_records[].question_text
Level 2 — Semantic Embedding Memory : question_records[].embedding (384-dim MiniLM)
Level 3 — Topic Coverage Matrix     : topic_turn_counts {topic: int}
Level 4 — Concept Coverage Graph    : knowledge_graph {topic→subtopic→concept→{mastery,dims}}
"""
import uuid
import re
from datetime import datetime
from typing import Any, Optional

# Global in-memory store: session_id → session_data
_sessions: dict[str, dict] = {}


def _slugify(text: str) -> str:
    return re.sub(r"\s+", "_", text.lower().strip())


def create_session(config: dict) -> str:
    session_id = f"sess_{uuid.uuid4().hex[:12]}"
    _sessions[session_id] = {
        "session_id":     session_id,
        "config":         config,
        "created_at":     datetime.utcnow().isoformat(),
        "status":         "active",          # active | ended

        # ── Conversation ──────────────────────────────────────────────────────
        "conversation":   [],                # [{role, text, timestamp}]
        "answers":        [],                # [{question, answer, timestamp}]
        "telemetry":      [],                # [{stress, blink, headPose, wpm, ...}]
        "rubric_scores":  [],                # per-answer rubric evaluations
        "audio_analyses": [],                # [{transcript, text_emotion, acoustic, ...}]
        "final_report":   None,

        # ── Counter ───────────────────────────────────────────────────────────
        "question_count": 0,

        # ── Level 1 & 2: Exact + Semantic question records ────────────────────
        # Each entry: {
        #   turn_number, question_text, topic, subtopic, concept,
        #   cognitive_dimension, difficulty, embedding (list|None),
        #   concepts_tested (list[str]), performance_score (int|None)
        # }
        "question_records": [],

        # ── Level 3: Topic Coverage Matrix ───────────────────────────────────
        # {topic_name: number_of_turns}
        "topic_turn_counts": {},

        # ── Level 4: Concept Coverage Graph ──────────────────────────────────
        # {topic → {subtopic → {concept_slug → {count, mastery, dimensions_used}}}}
        "knowledge_graph": {},

        # Flat concept counts for O(1) saturation lookup
        "concept_counts": {},   # {concept_slug: int}

        # ── Adaptive State (preserved from v1) ────────────────────────────────
        "strong_topics":  [],
        "weak_topics":    [],
        "last_stress":    0,
    }
    return session_id


def get_session(session_id: str) -> Optional[dict]:
    return _sessions.get(session_id)


def update_session(session_id: str, updates: dict) -> None:
    if session_id in _sessions:
        _sessions[session_id].update(updates)


# ── Message / Conversation ─────────────────────────────────────────────────────

def append_message(session_id: str, role: str, text: str) -> None:
    if session_id in _sessions:
        _sessions[session_id]["conversation"].append({
            "role":      role,
            "text":      text,
            "timestamp": datetime.utcnow().isoformat(),
        })


def append_telemetry(session_id: str, snapshot: dict) -> None:
    if session_id in _sessions:
        _sessions[session_id]["telemetry"].append({
            **snapshot,
            "timestamp": datetime.utcnow().isoformat(),
        })


def append_rubric(session_id: str, rubric: dict) -> None:
    if session_id in _sessions:
        _sessions[session_id]["rubric_scores"].append(rubric)


def record_answer(session_id: str, question: str, answer: str) -> None:
    if session_id in _sessions:
        _sessions[session_id]["answers"].append({
            "question":  question,
            "answer":    answer,
            "timestamp": datetime.utcnow().isoformat(),
        })
        _sessions[session_id]["question_count"] += 1


def get_conversation_history(session_id: str) -> list:
    sess = _sessions.get(session_id)
    return sess["conversation"] if sess else []


def get_all_answers(session_id: str) -> list:
    sess = _sessions.get(session_id)
    return sess["answers"] if sess else []


def append_audio_analysis(session_id: str, result: dict) -> None:
    """Store Whisper+RoBERTa+Librosa audio analysis result for this chunk."""
    if session_id in _sessions:
        _sessions[session_id]["audio_analyses"].append({
            **result,
            "timestamp": datetime.utcnow().isoformat(),
        })


# ── Level 1 & 2: Question Record Registry ─────────────────────────────────────

def record_question_metadata(session_id: str, record: dict) -> None:
    """
    Persist a full question record after gate acceptance.
    Expected keys:
      turn_number, question_text, topic, subtopic, concept,
      cognitive_dimension, difficulty, embedding (list|None), concepts_tested
    """
    if session_id not in _sessions:
        return

    sess = _sessions[session_id]

    # Store the record
    sess["question_records"].append({
        **record,
        "timestamp":        datetime.utcnow().isoformat(),
        "performance_score": None,   # filled later via update_concept_mastery
    })

    # ── Level 3: increment topic turn count ──────────────────────────────────
    topic = record.get("topic", "")
    if topic:
        sess["topic_turn_counts"][topic] = sess["topic_turn_counts"].get(topic, 0) + 1

    # ── Level 4: update concept graph — mark concept as tested ───────────────
    subtopic  = record.get("subtopic", "")
    concept   = record.get("concept", "")
    dimension = record.get("cognitive_dimension", "concept")

    if topic and subtopic and concept:
        c_slug = _slugify(concept)
        graph  = sess["knowledge_graph"]
        graph.setdefault(topic, {}).setdefault(subtopic, {}).setdefault(c_slug, {
            "count":           0,
            "mastery":         None,
            "dimensions_used": [],
        })
        entry = graph[topic][subtopic][c_slug]
        entry["count"] += 1
        if dimension not in entry["dimensions_used"]:
            entry["dimensions_used"].append(dimension)

    # ── Flat concept counts update ───────────────────────────────────────────
    for c in record.get("concepts_tested", []):
        slug = _slugify(c)
        sess["concept_counts"][slug] = sess["concept_counts"].get(slug, 0) + 1

    # Also count the blueprint concept itself
    if concept:
        c_slug = _slugify(concept)
        sess["concept_counts"][c_slug] = sess["concept_counts"].get(c_slug, 0) + 1


def get_question_records(session_id: str) -> list:
    sess = _sessions.get(session_id)
    return sess.get("question_records", []) if sess else []


def get_knowledge_graph(session_id: str) -> dict:
    sess = _sessions.get(session_id)
    return sess.get("knowledge_graph", {}) if sess else {}


# ── Level 4: Concept Mastery Update ───────────────────────────────────────────

def update_concept_mastery(session_id: str, rubric: dict) -> None:
    """
    Called AFTER rubric evaluation to update concept mastery scores and
    strong/weak topic lists. This must complete BEFORE the next blueprint
    is generated (enforced sequentially in ws_interview.py).

    rubric fields consumed:
      overall (int), topics_demonstrated_well (list), topics_struggled_with (list),
      concepts_tested (list), cognitive_dimension_assessed (str)
    """
    if session_id not in _sessions:
        return

    sess  = _sessions[session_id]
    graph = sess["knowledge_graph"]
    score = rubric.get("overall", 70)

    # Match score back to the most recent question record
    records = sess["question_records"]
    if records:
        last = records[-1]
        last["performance_score"] = score
        topic    = last.get("topic", "")
        subtopic = last.get("subtopic", "")
        concept  = last.get("concept", "")
        if topic and subtopic and concept:
            c_slug = _slugify(concept)
            entry  = graph.get(topic, {}).get(subtopic, {}).get(c_slug)
            if entry is not None:
                # Exponential moving average for mastery
                prev = entry["mastery"]
                if prev is None:
                    entry["mastery"] = score
                else:
                    entry["mastery"] = int(0.6 * prev + 0.4 * score)

    # ── Update strong / weak topic lists ─────────────────────────────────────
    new_strong = rubric.get("topics_demonstrated_well", [])
    new_weak   = rubric.get("topics_struggled_with", [])

    merged_strong = list(set(sess.get("strong_topics", []) + new_strong))[-5:]
    merged_weak   = list(set(sess.get("weak_topics",   []) + new_weak))[-5:]

    sess["strong_topics"] = merged_strong
    sess["weak_topics"]   = merged_weak


# ── Getters for Blueprint Engine ──────────────────────────────────────────────

def get_concept_counts(session_id: str) -> dict:
    sess = _sessions.get(session_id)
    return sess.get("concept_counts", {}) if sess else {}


def get_topic_turn_counts(session_id: str) -> dict:
    sess = _sessions.get(session_id)
    return sess.get("topic_turn_counts", {}) if sess else {}


# ── Session Lifecycle ─────────────────────────────────────────────────────────

def end_session(session_id: str) -> None:
    if session_id in _sessions:
        _sessions[session_id]["status"]   = "ended"
        _sessions[session_id]["ended_at"] = datetime.utcnow().isoformat()


def all_sessions() -> list:
    return list(_sessions.values())
