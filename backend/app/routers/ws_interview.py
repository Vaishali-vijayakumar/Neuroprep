"""
WebSocket Interview Conductor — v2 (Blueprint + Sequential State)
=================================================================
Real-time bidirectional communication between browser and AI engine.

Key changes from v1:
  - asyncio.gather() race condition ELIMINATED for state-critical calls.
  - Sequential execution order enforced:
      1. Evaluate answer (rubric scoring)       ← parallel safe with sensory
      2. Update 4-level knowledge state         ← sync, must complete first
      3. Blueprint Engine selects next concept  ← deterministic, uses fresh state
      4. Gemini phrases the question            ← async, uses blueprint
      5. 3-Tier Similarity Gate validates       ← up to 3 regeneration attempts
  - Biometric + audio analysis remain fully parallel to steps 1–5 (no state dependency).

Message Protocol:
  Browser → Backend:
    { type: "answer",    session_id, payload: { question, answer, codeSnippet? } }
    { type: "telemetry", session_id, payload: { stress, blink_rate, head_pose, ... } }
    { type: "end",       session_id, payload: {} }
    { type: "ping",      session_id, payload: {} }

  Backend → Browser:
    { type: "question",          text, stress_index, question_num, blueprint_meta? }
    { type: "eval",              rubric: {...} }
    { type: "thinking",          text }
    { type: "adaptation",        text, action }
    { type: "telemetry_ack",     stress_index, adaptation? }
    { type: "generating_report", text }
    { type: "report",            data: { report_object } }
    { type: "pong",              text: "pong" }
    { type: "error",             text: "error message" }
"""
import json
import asyncio
import logging
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter

from app.services import interview_memory, ai_brain, stress_service
from app.services.question_blueprint import get_blueprint_engine, cleanup_engine
from app.services.semantic_gate import similarity_gate

logger = logging.getLogger(__name__)
router = APIRouter(tags=["websocket"])

# Track active WebSocket connections per session
_connections: dict[str, WebSocket] = {}

MAX_GATE_RETRIES = 3   # How many times Gemini can be re-prompted before accepting fallback


async def _send(ws: WebSocket, msg: dict):
    """Helper to send a JSON message safely."""
    try:
        await ws.send_text(json.dumps(msg))
    except Exception:
        pass


async def _generate_and_gate(
    session_id: str,
    config: dict,
    conversation_history: list,
    question_count: int,
    current_stress: int,
    strong_topics: list,
    weak_topics: list,
    blueprint: dict,
    question_records: list,
    concept_counts: dict,
) -> tuple:
    """
    Attempt to generate a question that passes the 3-tier similarity gate.
    Regenerates up to MAX_GATE_RETRIES times with incrementally stronger rejection prompts.
    Returns (question_text, embedding|None, accepted_blueprint).
    Falls back to best attempt if gate never passes.
    """
    best_result = None

    for attempt in range(MAX_GATE_RETRIES):
        # On retries, intensify rejection hint in blueprint instruction
        effective_blueprint = dict(blueprint)
        if attempt > 0:
            effective_blueprint["instruction"] = (
                f"[RETRY ATTEMPT {attempt + 1}] Previous question was rejected by "
                f"similarity gate. {blueprint.get('instruction', '')}\n"
                f"You MUST choose a COMPLETELY DIFFERENT phrasing AND test a different "
                f"aspect of '{blueprint.get('concept')}' at '{blueprint.get('dimension')}' level."
            )

        question = await ai_brain.get_next_question(
            session_id=session_id,
            conversation_history=conversation_history,
            config=config,
            stress_index=current_stress,
            question_count=question_count,
            is_first=False,
            strong_topics=strong_topics,
            weak_topics=weak_topics,
            blueprint=effective_blueprint,
            question_records=question_records,
        )

        new_concepts = [blueprint.get("concept", "")]
        accepted, reason, embedding = similarity_gate.check(
            new_question=question,
            question_records=question_records,
            concept_counts=concept_counts,
            new_concepts=new_concepts,
        )

        if accepted:
            logger.info(f"[Gate] ✓ ACCEPTED (attempt {attempt + 1}): {question[:80]}")
            return question, embedding, effective_blueprint

        logger.warning(f"[Gate] ✗ REJECTED (attempt {attempt + 1}): {reason} | Q: {question[:80]}")
        best_result = (question, None, effective_blueprint)

    # All retries exhausted — use last generated question anyway
    logger.warning(f"[Gate] All {MAX_GATE_RETRIES} attempts failed — accepting best attempt.")
    return best_result


@router.websocket("/ws/{session_id}")
async def interview_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    _connections[session_id] = websocket

    sess = interview_memory.get_session(session_id)
    if not sess:
        await _send(websocket, {"type": "error", "text": f"Session {session_id} not found."})
        await websocket.close()
        return

    scorer           = stress_service.get_scorer(session_id)
    config           = sess["config"]
    track            = config.get("trackId", "default")
    blueprint_engine = get_blueprint_engine(session_id, track)

    current_question:  list[str]  = [""]   # mutable container for current Q
    current_blueprint: list[dict] = [{}]   # mutable container for current blueprint

    logger.info(f"[WS] Client connected: {session_id} | track={track}")

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await _send(websocket, {"type": "error", "text": "Invalid JSON"})
                continue

            msg_type = msg.get("type", "")
            payload  = msg.get("payload", {})

            # ── PING ──────────────────────────────────────────────────────────
            if msg_type == "ping":
                await _send(websocket, {"type": "pong", "text": "pong"})

            # ── TELEMETRY ─────────────────────────────────────────────────────
            elif msg_type == "telemetry":
                stress = scorer.compute(
                    face_detected       = payload.get("face_detected", True),
                    blink_rate          = payload.get("blink_rate", 15),
                    head_pose           = payload.get("head_pose", "forward"),
                    eye_contact         = payload.get("eye_contact", 85),
                    volume              = payload.get("volume", 50),
                    wpm                 = payload.get("wpm", 0),
                    silence_duration_ms = payload.get("silence_duration", 0),
                    filler_count        = payload.get("filler_count", 0),
                    answer_length_words = payload.get("answer_length", 50),
                )
                interview_memory.append_telemetry(session_id, {**payload, "stress": stress})
                interview_memory.update_session(session_id, {"last_stress": stress})

                adaptation = stress_service.StressFusionService.get_adaptation(stress)
                response   = {"type": "telemetry_ack", "stress_index": stress}
                if adaptation:
                    response["adaptation"] = adaptation
                await _send(websocket, response)

            # ── ANSWER ────────────────────────────────────────────────────────
            elif msg_type == "answer":
                try:
                    question     = payload.get("question", current_question[0])
                    answer_text  = payload.get("answer", "").strip()
                    code_snippet = payload.get("codeSnippet", "").strip()
                    active_bp    = current_blueprint[0] or {}

                    if not answer_text and not code_snippet:
                        await _send(websocket, {"type": "error", "text": "Empty answer received"})
                        continue

                    if code_snippet:
                        answer_text = (
                            f"{answer_text}\n\n[Candidate's Current Code]:\n"
                            f"```\n{code_snippet}\n```"
                        ).strip()

                    # Record raw answer + add to conversation
                    interview_memory.append_message(session_id, "user", answer_text)
                    interview_memory.record_answer(session_id, question, answer_text)

                    sess           = interview_memory.get_session(session_id) or {}
                    current_stress = sess.get("last_stress", 0)
                    history        = interview_memory.get_conversation_history(session_id)
                    q_count        = sess.get("question_count", 0)
                    total_turns    = q_count + 1

                    await _send(websocket, {"type": "thinking", "text": "AI is thinking..."})

                    # ═══════════════════════════════════════════════════════════════
                    # PHASE A — EVALUATION
                    # ═══════════════════════════════════════════════════════════════
                    try:
                        rubric = await asyncio.wait_for(
                            ai_brain.evaluate_answer(
                                question, answer_text, config, current_stress, blueprint=active_bp
                            ),
                            timeout=8.0
                        )
                    except Exception as e_eval:
                        logger.warning(f"[WS] evaluate_answer fallback triggered: {e_eval}")
                        rubric = ai_brain._fallback_evaluation(answer_text, blueprint=active_bp, question=question, config=config)

                    # ═══════════════════════════════════════════════════════════════
                    # PHASE B — SYNCHRONOUS STATE UPDATE
                    # ═══════════════════════════════════════════════════════════════
                    try:
                        interview_memory.append_rubric(session_id, rubric)
                        interview_memory.update_concept_mastery(session_id, rubric)
                    except Exception as e_mem:
                        logger.warning(f"[WS] memory update error: {e_mem}")

                    # Send rubric to frontend immediately
                    await _send(websocket, {"type": "eval", "rubric": rubric})

                    # ═══════════════════════════════════════════════════════════════
                    # PHASE C — BLUEPRINT SELECTION
                    # ═══════════════════════════════════════════════════════════════
                    try:
                        sess_fresh        = interview_memory.get_session(session_id) or {}
                        knowledge_graph   = interview_memory.get_knowledge_graph(session_id)
                        concept_counts    = interview_memory.get_concept_counts(session_id)
                        topic_turn_counts = interview_memory.get_topic_turn_counts(session_id)
                        question_records  = interview_memory.get_question_records(session_id)
                        strong_topics     = sess_fresh.get("strong_topics", [])
                        weak_topics       = sess_fresh.get("weak_topics", [])

                        blueprint = blueprint_engine.select(
                            knowledge_graph   = knowledge_graph,
                            concept_counts    = concept_counts,
                            topic_turn_counts = topic_turn_counts,
                            total_turns       = total_turns,
                            stress_index      = current_stress,
                            difficulty        = config.get("difficulty", "Intermediate"),
                        )
                    except Exception as e_bp:
                        logger.warning(f"[WS] blueprint select fallback: {e_bp}")
                        blueprint = {"topic": "General", "subtopic": "Core", "concept": "General", "dimension": "concept", "rationale": "Adaptive continuation"}

                    # ═══════════════════════════════════════════════════════════════
                    # PHASE D — GEMINI PHRASING + 3-TIER GATE (with fallback)
                    # ═══════════════════════════════════════════════════════════════
                    try:
                        next_q, embedding, accepted_blueprint = await asyncio.wait_for(
                            _generate_and_gate(
                                session_id           = session_id,
                                config               = config,
                                conversation_history = history,
                                question_count       = total_turns,
                                current_stress       = current_stress,
                                strong_topics        = strong_topics,
                                weak_topics          = weak_topics,
                                blueprint            = blueprint,
                                question_records     = question_records if 'question_records' in locals() else [],
                                concept_counts       = concept_counts if 'concept_counts' in locals() else {},
                            ),
                            timeout=9.0
                        )
                    except Exception as e_gen:
                        logger.warning(f"[WS] _generate_and_gate fallback: {e_gen}")
                        next_q = ai_brain._fallback_question(config, total_turns, current_stress, is_first=False)
                        embedding = None
                        accepted_blueprint = blueprint

                    # ═══════════════════════════════════════════════════════════════
                    # PHASE E — PERSIST & DELIVER ACCEPTED QUESTION
                    # ═══════════════════════════════════════════════════════════════
                    try:
                        interview_memory.append_message(session_id, "ai", next_q)
                        interview_memory.record_question_metadata(session_id, {
                            "turn_number":         total_turns,
                            "question_text":       next_q,
                            "topic":               accepted_blueprint.get("topic", ""),
                            "subtopic":            accepted_blueprint.get("subtopic", ""),
                            "concept":             accepted_blueprint.get("concept", ""),
                            "cognitive_dimension": accepted_blueprint.get("dimension", "concept"),
                            "difficulty":          accepted_blueprint.get("difficulty", "Intermediate"),
                            "embedding":           embedding.tolist() if embedding is not None else None,
                            "concepts_tested":     [accepted_blueprint.get("concept", "")],
                        })
                    except Exception as e_rec:
                        logger.warning(f"[WS] record metadata error: {e_rec}")

                    current_question[0]  = next_q
                    current_blueprint[0] = accepted_blueprint

                    await _send(websocket, {
                        "type":           "question",
                        "text":           next_q,
                        "stress_index":   current_stress,
                        "question_num":   total_turns,
                        "blueprint_meta": {
                            "topic":     accepted_blueprint.get("topic"),
                            "concept":   accepted_blueprint.get("concept"),
                            "dimension": accepted_blueprint.get("dimension"),
                            "rationale": accepted_blueprint.get("rationale"),
                        },
                    })

                except Exception as e_outer:
                    logger.error(f"[WS] Uncaught error in answer handler: {e_outer}", exc_info=True)
                    fallback_q = ai_brain._fallback_question(config, (sess.get("question_count", 0) + 1 if 'sess' in locals() and sess else 1), 0, False)
                    await _send(websocket, {
                        "type":         "question",
                        "text":         fallback_q,
                        "stress_index": 0,
                        "question_num": (sess.get("question_count", 0) + 1 if 'sess' in locals() and sess else 1),
                    })

            # ── END ───────────────────────────────────────────────────────────
            elif msg_type == "end":
                interview_memory.end_session(session_id)
                sess = interview_memory.get_session(session_id)

                await _send(websocket, {
                    "type": "generating_report",
                    "text": "Generating your interview report..."
                })
                report = await ai_brain.generate_report(sess)
                interview_memory.update_session(session_id, {"final_report": report})

                await _send(websocket, {"type": "report", "data": report})

                # Cleanup per-session resources
                stress_service.cleanup_scorer(session_id)
                cleanup_engine(session_id)
                break

            else:
                await _send(websocket, {
                    "type": "error",
                    "text": f"Unknown message type: {msg_type}"
                })

    except WebSocketDisconnect:
        logger.info(f"[WS] Client disconnected: {session_id}")
    except Exception as e:
        logger.error(f"[WS] Error in session {session_id}: {e}", exc_info=True)
        try:
            await _send(websocket, {"type": "error", "text": str(e)})
        except Exception:
            pass
    finally:
        _connections.pop(session_id, None)
