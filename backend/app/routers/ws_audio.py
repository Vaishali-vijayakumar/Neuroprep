"""
WebSocket Audio Stream Handler
================================
Browser → Backend:  Binary PCM float32 audio frames (16kHz, mono)
                    or JSON control messages: { type: "config"|"ping"|"end", ... }

Backend → Browser:  JSON results per chunk:
  {
    type: "audio_analysis",
    transcript:   { text, language, confidence, word_count, duration_s },
    text_emotion: { fear, joy, sadness, anger, surprise, neutral, text_stress_score },
    acoustic:     { mfcc_variance, pitch_std_hz, jitter, acoustic_stress_score, ... },
    vocal_stress: { vocal_stress_score, tier, components },
    filler_words: [ ... ],
  }

Usage: Connect to ws://localhost:8000/ws/audio/{session_id}
"""

import json
import asyncio
import io
import struct
import numpy as np
from fastapi import WebSocket, WebSocketDisconnect
from fastapi.routing import APIRouter

from app.services import audio_pipeline, interview_memory

router = APIRouter(tags=["audio-websocket"])

# Track active connections and accumulated PCM per session
_connections: dict[str, WebSocket] = {}
_pcm_buffers: dict[str, bytearray] = {}

CHUNK_WINDOW_MS  = 3000   # Process every 3 seconds of audio
SAMPLE_RATE      = 16000
BYTES_PER_SAMPLE = 4       # float32
CHUNK_BYTES      = int(SAMPLE_RATE * (CHUNK_WINDOW_MS / 1000) * BYTES_PER_SAMPLE)


async def _send(ws: WebSocket, msg: dict):
    try:
        await ws.send_text(json.dumps(msg))
    except Exception:
        pass


@router.websocket("/ws/audio/{session_id}")
async def audio_websocket(websocket: WebSocket, session_id: str):
    """
    Receives raw PCM float32 audio chunks from the browser.
    Runs the full Whisper + RoBERTa + Librosa pipeline.
    Streams back transcripts, emotion scores, and acoustic stress metrics.
    """
    await websocket.accept()
    _connections[session_id] = websocket
    _pcm_buffers[session_id] = bytearray()

    face_stress = 0   # will be updated via JSON messages

    print(f"[AudioWS] Connected: {session_id}")

    try:
        while True:
            data = await websocket.receive()

            # ── Binary: raw PCM audio frame ──────────────────────────────
            if "bytes" in data and data["bytes"]:
                pcm_chunk = data["bytes"]
                _pcm_buffers[session_id].extend(pcm_chunk)

                # Process when we've accumulated enough audio
                if len(_pcm_buffers[session_id]) >= CHUNK_BYTES:
                    chunk_bytes = bytes(_pcm_buffers[session_id][:CHUNK_BYTES])
                    _pcm_buffers[session_id] = _pcm_buffers[session_id][CHUNK_BYTES:]

                    result = await audio_pipeline.process_audio_chunk(
                        pcm_bytes   = chunk_bytes,
                        sample_rate = SAMPLE_RATE,
                        face_stress = face_stress,
                    )

                    # Store in interview memory for report generation
                    interview_memory.append_audio_analysis(session_id, result)

                    await _send(websocket, {
                        "type":       "audio_analysis",
                        **result,
                    })

            # ── Text: control / config messages ──────────────────────────
            elif "text" in data and data["text"]:
                try:
                    msg = json.loads(data["text"])
                except json.JSONDecodeError:
                    continue

                msg_type = msg.get("type", "")

                if msg_type == "ping":
                    await _send(websocket, {"type": "pong"})

                elif msg_type == "face_stress":
                    # Frontend sends current face stress so fusion can include it
                    face_stress = int(msg.get("stress", 0))

                elif msg_type == "flush":
                    # Process any remaining buffered audio < CHUNK_BYTES
                    remaining = bytes(_pcm_buffers.get(session_id, b""))
                    if len(remaining) > SAMPLE_RATE * BYTES_PER_SAMPLE * 0.5:  # > 500ms
                        result = await audio_pipeline.process_audio_chunk(
                            pcm_bytes   = remaining,
                            sample_rate = SAMPLE_RATE,
                            face_stress = face_stress,
                        )
                        interview_memory.append_audio_analysis(session_id, result)
                        await _send(websocket, {"type": "audio_analysis", **result})
                    _pcm_buffers[session_id] = bytearray()

                elif msg_type == "end":
                    await _send(websocket, {"type": "audio_done"})
                    break

    except WebSocketDisconnect:
        print(f"[AudioWS] Disconnected: {session_id}")
    except Exception as e:
        print(f"[AudioWS] Error [{session_id}]: {e}")
        try:
            await _send(websocket, {"type": "error", "text": str(e)})
        except Exception:
            pass
    finally:
        _connections.pop(session_id, None)
        _pcm_buffers.pop(session_id, None)
