"""
WebSocket Interview Conductor
Real-time bidirectional communication between browser and AI engine.

Message Protocol:
  Browser → Backend:
    { type: "answer",    session_id, payload: { question, answer } }
    { type: "telemetry", session_id, payload: { stress, blink_rate, head_pose, ... } }
    { type: "end",       session_id, payload: {} }
    { type: "ping",      session_id, payload: {} }

  Backend → Browser:
    { type: "question",   text, stress_index, adaptation }
    { type: "followup",   text, stress_index }
    { type: "eval",       rubric: {...} }
    { type: "adaptation", text, action }
    { type: "report",     data: { report_object } }
    { type: "pong",       text: "pong" }
    { type: "error",      text: "error message" }
"""
import json
import asyncio
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter

from app.services import interview_memory, ai_brain, stress_service

router = APIRouter(tags=["websocket"])

# Track active WebSocket connections per session
_connections: dict[str, WebSocket] = {}


async def _send(ws: WebSocket, msg: dict):
    """Helper to send a JSON message safely."""
    try:
        await ws.send_text(json.dumps(msg))
    except Exception:
        pass


@router.websocket("/ws/{session_id}")
async def interview_websocket(websocket: WebSocket, session_id: str):
    await websocket.accept()
    _connections[session_id] = websocket

    sess = interview_memory.get_session(session_id)
    if not sess:
        await _send(websocket, {"type": "error", "text": f"Session {session_id} not found."})
        await websocket.close()
        return

    scorer = stress_service.get_scorer(session_id)
    config = sess["config"]
    current_question: list[str] = [""]  # mutable container for current Q

    print(f"[WS] Client connected: {session_id}")

    try:
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
            except json.JSONDecodeError:
                await _send(websocket, {"type": "error", "text": "Invalid JSON"})
                continue

            msg_type   = msg.get("type", "")
            payload    = msg.get("payload", {})

            # ── PING ──────────────────────────────────────────────
            if msg_type == "ping":
                await _send(websocket, {"type": "pong", "text": "pong"})

            # ── TELEMETRY ─────────────────────────────────────────
            elif msg_type == "telemetry":
                stress = scorer.compute(
                    face_detected    = payload.get("face_detected", True),
                    blink_rate       = payload.get("blink_rate", 15),
                    head_pose        = payload.get("head_pose", "forward"),
                    eye_contact      = payload.get("eye_contact", 85),
                    volume           = payload.get("volume", 50),
                    wpm              = payload.get("wpm", 0),
                    silence_duration_ms = payload.get("silence_duration", 0),
                    filler_count     = payload.get("filler_count", 0),
                    answer_length_words = payload.get("answer_length", 50),
                )
                interview_memory.append_telemetry(session_id, {**payload, "stress": stress})

                adaptation = stress_service.StressFusionService.get_adaptation(stress)
                response   = {"type": "telemetry_ack", "stress_index": stress}
                if adaptation:
                    response["adaptation"] = adaptation
                await _send(websocket, response)

            # ── ANSWER ────────────────────────────────────────────
            elif msg_type == "answer":
                question    = payload.get("question", current_question[0])
                answer_text = payload.get("answer", "").strip()
                code_snippet = payload.get("codeSnippet", "").strip()

                if not answer_text and not code_snippet:
                    await _send(websocket, {"type": "error", "text": "Empty answer received"})
                    continue
                
                if code_snippet:
                    answer_text = f"{answer_text}\n\n[Candidate's Current Code]:\n```\n{code_snippet}\n```".strip()

                # Record in memory
                interview_memory.append_message(session_id, "user", answer_text)
                interview_memory.record_answer(session_id, question, answer_text)

                current_stress = sess.get("last_stress", 0)
                history  = interview_memory.get_conversation_history(session_id)
                q_count  = sess.get("question_count", 0)
                strong_topics = sess.get("strong_topics", [])
                weak_topics = sess.get("weak_topics", [])

                await _send(websocket, {"type": "thinking", "text": "AI is thinking..."})

                # ── Run evaluation + next-question IN PARALLEL ──
                # Cuts wait time from (eval + question + 0.8s) → max(eval, question)
                next_q, rubric = await asyncio.gather(
                    ai_brain.get_next_question(
                        session_id=session_id,
                        conversation_history=history,
                        config=config,
                        stress_index=current_stress,
                        question_count=q_count,
                        is_first=False,
                        strong_topics=strong_topics,
                        weak_topics=weak_topics,
                    ),
                    ai_brain.evaluate_answer(question, answer_text, config, current_stress),
                )

                # Store rubric result
                interview_memory.append_rubric(session_id, rubric)
                await _send(websocket, {"type": "eval", "rubric": rubric})

                current_question[0] = next_q
                interview_memory.append_message(session_id, "ai", next_q)
                
                # Update adaptive state
                new_strong = rubric.get("topics_demonstrated_well", [])
                new_weak = rubric.get("topics_struggled_with", [])
                
                merged_strong = list(set(strong_topics + new_strong))[-5:]
                merged_weak = list(set(weak_topics + new_weak))[-5:]
                
                interview_memory.update_session(session_id, {
                    "question_count": q_count + 1,
                    "strong_topics": merged_strong,
                    "weak_topics": merged_weak
                })

                await _send(websocket, {
                    "type":         "question",
                    "text":         next_q,
                    "stress_index": current_stress,
                    "question_num": q_count + 1,
                })


            # ── END ───────────────────────────────────────────────
            elif msg_type == "end":
                interview_memory.end_session(session_id)
                sess = interview_memory.get_session(session_id)

                await _send(websocket, {"type": "generating_report", "text": "Generating your interview report..."})
                report = await ai_brain.generate_report(sess)
                interview_memory.update_session(session_id, {"final_report": report})

                await _send(websocket, {"type": "report", "data": report})
                stress_service.cleanup_scorer(session_id)
                break

            else:
                await _send(websocket, {"type": "error", "text": f"Unknown message type: {msg_type}"})

    except WebSocketDisconnect:
        print(f"[WS] Client disconnected: {session_id}")
    except Exception as e:
        print(f"[WS] Error in session {session_id}: {e}")
        try:
            await _send(websocket, {"type": "error", "text": str(e)})
        except Exception:
            pass
    finally:
        _connections.pop(session_id, None)


