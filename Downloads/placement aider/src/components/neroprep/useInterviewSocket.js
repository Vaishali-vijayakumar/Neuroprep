/**
 * useInterviewSocket — WebSocket client for the Neroprep AI Interview Engine.
 *
 * Connects to ws://localhost:8000/ws/{sessionId} and provides:
 *   - sendAnswer(question, answer)  → triggers AI follow-up
 *   - sendTelemetry(data)           → sends face/audio metrics → stress score back
 *   - endInterview()                → triggers report generation
 *   - status, lastMessage, report, stressIndex
 */
import { useState, useEffect, useRef, useCallback } from 'react';

const WS_BASE = 'ws://localhost:8000';
const API_BASE = 'http://localhost:8000';

export function useInterviewSocket({ sessionId, onQuestion, onEval, onReport, onAdaptation, onStressUpdate }) {
  const wsRef         = useRef(null);
  const pingRef       = useRef(null);
  const [status,      setStatus]      = useState('disconnected'); // disconnected | connecting | connected | error
  const [lastMessage, setLastMessage] = useState(null);

  const _send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    setStatus('connecting');

    const ws = new WebSocket(`${WS_BASE}/ws/${sessionId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setStatus('connected');
      // Keep-alive ping every 20 seconds
      pingRef.current = setInterval(() => {
        _send({ type: 'ping', session_id: sessionId, payload: {} });
      }, 20_000);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setLastMessage(msg);
        _handleMessage(msg);
      } catch (e) {
        console.error('[WS] Parse error:', e);
      }
    };

    ws.onerror = (e) => {
      console.error('[WS] Error:', e);
      setStatus('error');
    };

    ws.onclose = () => {
      setStatus('disconnected');
      clearInterval(pingRef.current);
    };

    return () => {
      clearInterval(pingRef.current);
      ws.close();
    };
  }, [sessionId]);

  const _handleMessage = useCallback((msg) => {
    switch (msg.type) {
      case 'question':
      case 'followup':
        onQuestion?.(msg.text, msg.question_num);
        break;
      case 'eval':
        onEval?.(msg.rubric);
        break;
      case 'report':
        onReport?.(msg.data);
        break;
      case 'adaptation':
        onAdaptation?.(msg.adaptation);
        break;
      case 'telemetry_ack':
        onStressUpdate?.(msg.stress_index, msg.adaptation);
        if (msg.adaptation) onAdaptation?.(msg.adaptation);
        break;
      case 'thinking':
        onQuestion?.('...', null); // show typing indicator
        break;
      case 'pong':
        break; // keep-alive ack
      case 'error':
        console.warn('[WS] Server error:', msg.text);
        break;
      default:
        break;
    }
  }, [onQuestion, onEval, onReport, onAdaptation, onStressUpdate]);

  const sendAnswer = useCallback((question, answer, codeSnippet) => {
    _send({
      type:       'answer',
      session_id: sessionId,
      payload:    { question, answer, codeSnippet },
    });
  }, [sessionId, _send]);

  const sendTelemetry = useCallback((data) => {
    _send({
      type:       'telemetry',
      session_id: sessionId,
      payload:    data,
    });
  }, [sessionId, _send]);

  const endInterview = useCallback(() => {
    _send({ type: 'end', session_id: sessionId, payload: {} });
  }, [sessionId, _send]);

  return { status, lastMessage, sendAnswer, sendTelemetry, endInterview };
}


/**
 * startInterviewSession — REST call to POST /api/interview/start.
 * Returns { session_id, greeting } or null on failure.
 */
export async function startInterviewSession(config) {
  try {
    const res = await fetch(`${API_BASE}/api/interview/start`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ config }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('[API] startInterviewSession failed:', e.message);
    return null;
  }
}

/**
 * runCode — REST call to POST /api/code/run.
 */
export async function runCode(sessionId, sourceCode, language, stdin = '') {
  try {
    const res = await fetch(`${API_BASE}/api/code/run`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ session_id: sessionId, source_code: sourceCode, language, stdin }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('[API] runCode failed:', e.message);
    return { status: 'error', error: e.message };
  }
}

/**
 * fetchReport — REST call to GET /api/report/{session_id}.
 */
export async function fetchReport(sessionId) {
  try {
    const res = await fetch(`${API_BASE}/api/report/${sessionId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    return null;
  }
}

export default useInterviewSocket;
