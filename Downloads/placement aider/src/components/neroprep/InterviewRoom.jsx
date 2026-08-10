import React, { useEffect, useRef, useState, useCallback } from 'react';
import useInterviewStore from '../../store/interviewStore';
import VideoFeed from './VideoFeed';
import MonacoEditorPanel from './MonacoEditorPanel';
import SidePanel from './SidePanel';

import { VoiceEngine }             from './engines/VoiceEngine';
import { AudioAnalyser }           from './engines/AudioAnalyser';
import { FaceEngine }              from './engines/FaceEngine';
import { VocalIntelligenceEngine } from './engines/VocalIntelligenceEngine';
import { useInterviewSocket, startInterviewSession } from './useInterviewSocket';

const FALLBACK_QUESTIONS = {
  hr: [
    "What are your greatest strengths?",
    "Why are you interested in this role?",
    "Describe a challenging situation at work or university and how you overcame it.",
    "Where do you see yourself in five years?",
    "Do you prefer working individually or as part of a team, and why?"
  ],
  tech: [
    "Explain the four pillars of Object-Oriented Programming (OOP).",
    "What is the difference between a process and a thread?",
    "Can you explain the ACID properties of a database transaction?",
    "What is the difference between SQL and NoSQL databases?",
    "Explain the concepts of RESTful APIs and how they differ from GraphQL."
  ],
  dsa: [
    "What is the time complexity of binary search, and how does it achieve it?",
    "How does a hash table handle key collisions?",
    "Explain the difference between depth-first search (DFS) and breadth-first search (BFS).",
    "What is dynamic programming, and when should it be used?",
    "Explain how a binary search tree works and its worst-case time complexity."
  ],
  coding: [
    "How would you design a function to reverse a string in-place?",
    "How do you find the two numbers in an array that sum to a specific target?",
    "Explain how you would implement an LRU (Least Recently Used) cache.",
    "Describe how you would check if a given string is a valid palindrome.",
    "How do you detect if a linked list contains a cycle?"
  ],
  default: [
    "What are your greatest strengths?",
    "Describe a complex project you worked on and the challenges you faced.",
    "What motivates you to perform your best work?",
    "How do you handle conflict or differing opinions within a team?",
    "Where do you see yourself in five years?"
  ]
};

export default function InterviewRoom() {
  const config          = useInterviewStore((s) => s.config);
  const elapsedSeconds  = useInterviewStore((s) => s.elapsedSeconds);
  const tickTimer       = useInterviewStore((s) => s.tickTimer);
  const endInterview    = useInterviewStore((s) => s.endInterview);
  const exitInterview   = useInterviewStore((s) => s.exitInterview);
  const addTranscriptLine = useInterviewStore((s) => s.addTranscriptLine);
  const setStressIndex  = useInterviewStore((s) => s.setStressIndex);
  const setMediaStream  = useInterviewStore((s) => s.setMediaStream);

  // ── Get the shared stream from the store (set in DeviceCheckModule) ──
  const sharedStream = useInterviewStore((s) => s.mediaStream);

  const isCoding = config?.trackId === 'coding' || config?.trackId === 'dsa';

  // ── Engine refs ──
  const voiceRef  = useRef(null);
  const audioRef  = useRef(null);
  const faceRef   = useRef(null);
  const vocalRef  = useRef(null);   // Hybrid Whisper+RoBERTa+Librosa engine
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // Keep track of fallback question index for offline mode
  const fallbackQIndexRef = useRef(0);

  // ── Local UI state ──
  const [stream,        setStream]        = useState(null);
  const [sessionId,     setSessionId]     = useState(null);
  const [aiStatus,      setAiStatus]      = useState('connecting');
  const [micEnabled,    setMicEnabled]    = useState(true);
  const [camEnabled,    setCamEnabled]    = useState(true);
  const [interimText,   setInterimText]   = useState('');
  const [userAnswerText, setUserAnswerText] = useState('');
  const [currentCode,   setCurrentCode]   = useState('');
  const [currentQ,      setCurrentQ]      = useState('');
  const [adaptation,    setAdaptation]    = useState(null);
  const [audioMetrics,  setAudioMetrics]  = useState({ volume: 0, wpm: 0, isVoice: false });
  const [faceTelemetry, setFaceTelemetry] = useState({ faceDetected: false, blinkRate: 0, headPose: 'forward', eyeContact: 100 });
  const [vocalAnalysis, setVocalAnalysis] = useState(null);   // Whisper+RoBERTa+Librosa result
  const [backendUp,     setBackendUp]     = useState(true);



  // ── WebSocket ──
  const { status: wsStatus, sendAnswer, sendTelemetry, endInterview: wsEnd } = useInterviewSocket({
    sessionId,
    onQuestion: (text, qNum) => {
      if (text === '...') { setAiStatus('thinking'); return; }
      setCurrentQ(text);
      addTranscriptLine({ role: 'ai', text });
      setAiStatus('speaking');
      voiceRef.current?.speak(text).then(() => {
        setAiStatus('listening');
        voiceRef.current?.startListening();
      });
    },
    onEval:        (rubric)  => useInterviewStore.getState().setLastRubric?.(rubric),
    onReport:      (report)  => {
      useInterviewStore.getState().setReport?.(report);
      _cleanupAndEnd();
    },
    onAdaptation:  (adpt)   => setAdaptation(adpt),
    onStressUpdate:(score)  => setStressIndex(score),
  });

  // ── Timer ──
  useEffect(() => {
    const t = setInterval(tickTimer, 1000);
    return () => clearInterval(t);
  }, [tickTimer]);

  // ── Use shared stream from DeviceCheck, or request fresh if missing ──
  useEffect(() => {
    if (sharedStream && sharedStream.active) {
      // Great — use the already-open stream
      streamRef.current = sharedStream;
      setStream(sharedStream);
    } else {
      // Fallback: request a fresh stream (e.g. if user refreshed mid-session)
      navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 },
      }).then((ms) => {
        streamRef.current = ms;
        setMediaStream(ms);
        setStream(ms);
      }).catch((err) => {
        console.error('[InterviewRoom] Media error:', err);
        setStream(null);
      });
    }

    return () => {
      // Stop stream on interview end
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, []);

  // ── Initialise AI engines once stream is ready ──
  useEffect(() => {
    if (!stream) return;

    // 1. Audio Analyser (local energy/pitch/WPM — stays for speed)
    audioRef.current = new AudioAnalyser(stream, {
      onMetrics: (m) => setAudioMetrics(m),
    });

    // 2. Voice Engine (STT display + TTS)
    voiceRef.current = new VoiceEngine({
      onInterimResult: setInterimText,
      onFinalResult:   (text) => {
        setUserAnswerText(prev => prev ? prev + ' ' + text : text);
        setInterimText('');
      },
      onStateChange:   (s) => {
        if (s.type === 'listening') setAiStatus(s.value ? 'listening' : 'thinking');
        if (s.type === 'speaking')  setAiStatus(s.value ? 'speaking'  : 'listening');
      },
    });

    // 3. Start backend session
    startInterviewSession(config).then((data) => {
      if (data?.session_id) {
        setSessionId(data.session_id);
        setBackendUp(true);

        // 4. Vocal Intelligence Engine (Whisper+RoBERTa+Librosa) — starts after session_id known
        vocalRef.current = new VocalIntelligenceEngine(stream, data.session_id, {
          onAnalysis:   (result) => setVocalAnalysis(result),
          onTranscript: (text, type) => {
            if (type === 'interim') {
              setInterimText(text);
            } else if (type === 'final') {
              setUserAnswerText(prev => prev ? prev + ' ' + text : text);
              setInterimText('');
            }
          },
          onError: (msg) => console.warn('[VocalEngine]', msg),
        });
        vocalRef.current.start().catch(console.warn);


        if (data.greeting) {
          addTranscriptLine({ role: 'ai', text: data.greeting });
          setCurrentQ(data.greeting);
          setAiStatus('speaking');
          voiceRef.current?.speak(data.greeting).then(() => {
            setAiStatus('listening');
            voiceRef.current?.startListening();
          });
        }
      } else {
        _startFallbackMode();
      }
    });

    return () => {
      voiceRef.current?.destroy();
      audioRef.current?.destroy();
      vocalRef.current?.stop();
    };
  }, [stream]);

  const _startFallbackMode = () => {
    setBackendUp(false);
    const greeting = "Welcome! Let's begin the interview. Please tell me about yourself.";
    addTranscriptLine({ role: 'ai', text: greeting });
    setCurrentQ(greeting);
    setAiStatus('speaking');
    voiceRef.current?.speak(greeting).then(() => {
      setAiStatus('listening');
      voiceRef.current?.startListening();
    });
  };

  // ── Wire FaceEngine to the video element ──
  const onVideoReady = useCallback((videoEl) => {
    if (!videoEl || faceRef.current) return;
    faceRef.current = new FaceEngine(videoEl, canvasRef.current, {
      onTelemetry: (data) => {
        setFaceTelemetry(data);
        // Forward face stress to vocal fusion engine
        if (data.stressScore != null) {
          vocalRef.current?.setFaceStress(data.stressScore);
        }
      },
    });
  }, []);


  // ── Send full real biometric telemetry to backend every 2 seconds ──
  useEffect(() => {
    if (!sessionId) return;
    const t = setInterval(() => {
      sendTelemetry({
        // Face / gaze signals
        face_detected:    faceTelemetry.faceDetected,
        blink_rate:       faceTelemetry.blinkRate       ?? 0,
        head_pose:        faceTelemetry.headPose        ?? 'unknown',
        eye_contact:      faceTelemetry.eyeContact      ?? 0,
        // rPPG physiological (null = still calibrating)
        hr_bpm:           faceTelemetry.hrBpm           ?? null,
        hrv_ms:           faceTelemetry.hrvMs           ?? null,
        // Spatiotemporal stress signals
        stress_score:     faceTelemetry.stressScore     ?? 0,
        cognitive_load:   faceTelemetry.cognitiveLoad   ?? null,
        micro_expression: faceTelemetry.microExpression ?? 0,
        au_composite:     faceTelemetry.actionUnits?.composite ?? 0,
        // Audio signals
        volume:           audioMetrics.volume           ?? 0,
        wpm:              audioMetrics.wpm              ?? 0,
        silence_duration: 0,
        filler_count:     0,
      });
    }, 2000);
    return () => clearInterval(t);
  }, [sessionId, faceTelemetry, audioMetrics, sendTelemetry]);


  const handleUserAnswer = useCallback((text) => {
    if (!text?.trim()) return;
    voiceRef.current?.stopListening();
    setInterimText('');
    addTranscriptLine({ role: 'user', text });
    setAiStatus('thinking');

    if (sessionId && wsStatus === 'connected') {
      sendAnswer(currentQ, text, currentCode);
    } else {
      // Offline fallback: cycle through track-specific fallback questions
      setTimeout(() => {
        const track = config?.trackId || 'default';
        const qList = FALLBACK_QUESTIONS[track] || FALLBACK_QUESTIONS.default;
        const idx = fallbackQIndexRef.current;
        const resp = qList[idx % qList.length];
        fallbackQIndexRef.current = idx + 1;

        addTranscriptLine({ role: 'ai', text: resp });
        setCurrentQ(resp);
        setAiStatus('speaking');
        voiceRef.current?.speak(resp).then(() => {
          setAiStatus('listening');
          voiceRef.current?.startListening();
        });
      }, 1200);
    }
  }, [sessionId, wsStatus, currentQ, currentCode, sendAnswer, config]);

  const _cleanupAndEnd = () => {
    voiceRef.current?.destroy();
    faceRef.current?.destroy();
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setMediaStream(null);
    endInterview();
  };

  const toggleMic = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setMicEnabled(p => {
      if (p) voiceRef.current?.stopListening();
      else   voiceRef.current?.startListening();
      return !p;
    });
  };
  const toggleCam = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(t => { t.enabled = !t.enabled; });
    }
    setCamEnabled(p => !p);
  };

  const handleEnd = () => {
    if (sessionId && wsStatus === 'connected') {
      wsEnd(); // backend generates report → onReport fires → _cleanupAndEnd
    } else {
      _cleanupAndEnd();
    }
  };
  const handleExit = () => {
    voiceRef.current?.destroy(); faceRef.current?.destroy();
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setMediaStream(null);
    exitInterview();
  };

  const fmt = (s) => {
    const h   = Math.floor(s / 3600).toString().padStart(2, '0');
    const m   = Math.floor((s % 3600) / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  const isCamOn = camEnabled && !!stream;

  const AI_STATUS = {
    connecting: { label: 'Connecting', color: '#6B7280' },
    thinking:   { label: 'Thinking',   color: '#D97706' },
    speaking:   { label: 'Speaking',   color: '#2563EB' },
    listening:  { label: 'Listening',  color: '#16A34A' },
    idle:       { label: 'Idle',       color: '#6B7280' },
  };
  const aiInfo = AI_STATUS[aiStatus] || AI_STATUS.idle;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', backgroundColor: 'var(--bg-page)', fontFamily: 'var(--font-inter)', overflow: 'hidden' }}>

      {/* ── Header ── */}
      <header style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text-main)' }}>Neroprep</span>
          <span style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-color)' }}></span>
          <span className="pill-tag" style={{ fontSize: '12px' }}>{config?.trackName || 'Mock Interview'} — {config?.difficulty || 'Adaptive AI'}</span>
          {!backendUp && <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '6px', backgroundColor: '#FEF3C7', color: '#92400E', fontWeight: 600 }}>Offline Mode</span>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: aiInfo.color, animation: 'pulseDot 1.4s ease-in-out infinite' }}></div>
            <span style={{ fontSize: '13px', fontWeight: 600, color: aiInfo.color }}>AI {aiInfo.label}</span>
          </div>
          <span style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-color)' }}></span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#DC2626', animation: 'pulseDot 1.2s ease-in-out infinite' }}></div>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#DC2626', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Live</span>
          </div>
          <span style={{ padding: '4px 12px', borderRadius: '6px', backgroundColor: '#F3F4F6', border: '1px solid var(--border-color)', fontSize: '13px', fontWeight: 700, fontVariantNumeric: 'tabular-nums', letterSpacing: '1px', color: 'var(--text-main)' }}>
            {fmt(elapsedSeconds)}
          </span>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

        {/* Main panel */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden', borderRight: '1px solid var(--border-color)' }}>
          {isCoding ? (
            <MonacoEditorPanel sessionId={sessionId} onCodeChange={setCurrentCode} />
          ) : (
            <div style={{ width: '100%', height: '100%', backgroundColor: '#0F172A', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

              {/* Candidate video */}
              {isCamOn
                ? <VideoFeed stream={stream} muted onVideoReady={onVideoReady} style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' }} />
                : (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '72px', height: '72px', borderRadius: '50%', backgroundColor: '#1E293B', border: '1px solid #334155', margin: '0 auto 12px auto' }}></div>
                    <p style={{ color: '#64748B', fontSize: '14px', margin: 0 }}>Camera is off</p>
                  </div>
                )
              }

              {/* Face mesh canvas */}
              <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', transform: 'scaleX(-1)' }} />

              {/* AI PiP — top right */}
              <div style={{ position: 'absolute', top: '16px', right: '16px', width: '210px', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#0F172A', border: '1px solid #1E293B', boxShadow: '0 8px 32px rgba(0,0,0,0.6)' }}>
                <div style={{ height: '130px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '50%', backgroundColor: '#1E293B', border: `2px solid ${aiInfo.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'border-color 0.4s' }}>
                    <div style={{ width: '26px', height: '26px', borderRadius: '50%', backgroundColor: '#334155' }}></div>
                  </div>
                  <div style={{ display: 'flex', gap: '3px', alignItems: 'center', height: '20px' }}>
                    {[6, 12, 18, 14, 10, 16, 8].map((h, i) => (
                      <div key={i} style={{ width: '3px', borderRadius: '2px', backgroundColor: aiStatus === 'speaking' ? '#38BDF8' : '#334155', height: `${aiStatus === 'speaking' ? h : 4}px`, transition: 'height 0.2s', animation: aiStatus === 'speaking' ? `barWave 0.6s ease-in-out ${i * 0.08}s infinite alternate` : 'none' }} />
                    ))}
                  </div>
                </div>
                <div style={{ padding: '8px 12px', borderTop: '1px solid #1E293B', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8' }}>AI Interviewer</span>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: aiInfo.color }}>{aiInfo.label}</span>
                </div>
              </div>

              {/* Current question subtitle */}
              {currentQ && currentQ !== '...' && (
                <div style={{ position: 'absolute', top: '16px', left: '16px', right: '240px', backgroundColor: 'rgba(15,23,42,0.85)', borderRadius: '8px', padding: '10px 14px', border: '1px solid #1E293B' }}>
                  <p style={{ color: '#E2E8F0', fontSize: '13px', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>
                    {currentQ.length > 120 ? currentQ.slice(0, 120) + '…' : currentQ}
                  </p>
                </div>
              )}

              {/* Interim STT transcript */}
              {interimText && (
                <div style={{ position: 'absolute', bottom: '72px', left: 0, right: 0, display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
                  <div style={{ backgroundColor: 'rgba(0,0,0,0.75)', borderRadius: '8px', padding: '8px 16px', maxWidth: '70%' }}>
                    <p style={{ color: '#F9FAFB', fontSize: '14px', margin: 0, fontStyle: 'italic', lineHeight: 1.5 }}>{interimText}</p>
                  </div>
                </div>
              )}

              {/* Mic/Cam status pills */}
              <div style={{ position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px' }}>
                {[
                  { label: `Mic ${micEnabled ? 'On' : 'Off'}`,   active: micEnabled },
                  { label: `Cam ${camEnabled ? 'On' : 'Off'}`,   active: camEnabled },
                  ...(audioMetrics.isVoice ? [{ label: 'Speaking', active: true }] : []),
                ].map((b, i) => (
                  <span key={i} style={{ padding: '5px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, backgroundColor: b.active ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)', color: b.active ? '#16A34A' : '#DC2626', border: `1px solid ${b.active ? '#16A34A' : '#DC2626'}` }}>
                    {b.label}
                  </span>
                ))}
              </div>

              {/* Adaptation hint */}
              {adaptation && (
                <div style={{ position: 'absolute', bottom: '60px', left: '16px', right: '16px', backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '8px', padding: '10px 14px' }}>
                  <p style={{ fontSize: '13px', color: '#92400E', margin: 0, lineHeight: 1.5 }}>{adaptation.message}</p>
                </div>
              )}
            </div>
          )}

          {isCoding && isCamOn && (
            <div style={{ position: 'absolute', bottom: '80px', right: '8px', width: '160px', height: '110px', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden', zIndex: 5 }}>
              <VideoFeed stream={stream} muted style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
            </div>
          )}
        </div>

        {/* Side Panel */}
        <div style={{ width: '360px', flexShrink: 0 }}>
          <SidePanel
            faceTelemetry={faceTelemetry}
            audioMetrics={audioMetrics}
            vocalAnalysis={vocalAnalysis}
            userAnswerText={userAnswerText}
            setUserAnswerText={setUserAnswerText}
            interimText={interimText}
            onSendAnswer={handleUserAnswer}
          />
        </div>

      </div>

      {/* ── Footer Controls ── */}
      <div style={{ flexShrink: 0, backgroundColor: '#FFFFFF', borderTop: '1px solid var(--border-color)', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>Volume</span>
          <div style={{ width: '80px', height: '6px', backgroundColor: 'var(--bg-secondary)', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
            <div style={{ width: `${audioMetrics.volume}%`, height: '100%', backgroundColor: audioMetrics.isVoice ? '#16A34A' : '#D1D5DB', transition: 'width 0.1s ease' }}></div>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {faceTelemetry.headPose !== 'forward' ? `Head: ${faceTelemetry.headPose}` : 'Head OK'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={toggleMic} style={{ padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: micEnabled ? '1px solid #111827' : '1px solid #DC2626', backgroundColor: micEnabled ? '#111827' : '#FEF2F2', color: micEnabled ? '#FFFFFF' : '#DC2626', transition: 'all 0.15s' }}>
            {micEnabled ? 'Mute Mic' : 'Unmute Mic'}
          </button>
          <button onClick={toggleCam} style={{ padding: '8px 18px', borderRadius: '20px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', border: camEnabled ? '1px solid #111827' : '1px solid #DC2626', backgroundColor: camEnabled ? '#111827' : '#FEF2F2', color: camEnabled ? '#FFFFFF' : '#DC2626', transition: 'all 0.15s' }}>
            {camEnabled ? 'Turn Off Cam' : 'Turn On Cam'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExit} style={{ padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', backgroundColor: '#FFFFFF', color: 'var(--text-muted)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>Exit</button>
          <button onClick={handleEnd} style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', backgroundColor: '#111827', color: '#FFFFFF', border: 'none', borderRadius: '8px' }}>End Interview</button>
        </div>
      </div>

      <style>{`
        @keyframes barWave { from { transform: scaleY(0.4); } to { transform: scaleY(1.5); } }
        @keyframes pulseDot { 0%,100% { opacity:1; } 50% { opacity:0.35; } }
      `}</style>
    </div>
  );
}
