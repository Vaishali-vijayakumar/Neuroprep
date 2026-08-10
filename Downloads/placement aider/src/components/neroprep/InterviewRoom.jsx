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

// ── Monochrome design tokens ──────────────────────────────────────────────────
const BLACK  = '#111111';
const GREY   = '#6B7280';
const BORDER = '#E5E7EB';
const BG     = '#F9FAFB';

// ── Persona & Stage definitions per track ─────────────────────────────────────
const TRACK_PERSONAS = {
  hr:                { name: "MAYA",    title: "HR Talent Lead" },
  tech:              { name: "ALEX",    title: "Technical Specialist" },
  dsa:               { name: "ARIA",    title: "DSA Evaluator" },
  coding:            { name: "ARIA",    title: "Live Coding Lead" },
  system_design:     { name: "DANIEL",  title: "System Architect" },
  lld:               { name: "DANIEL",  title: "LLD Expert" },
  behavioral:        { name: "MAYA",    title: "Behavioral Evaluator" },
  managerial:        { name: "SARAH",   title: "Engineering Manager" },
  project:           { name: "ALEX",    title: "Project Viva Examiner" },
  resume:            { name: "SARAH",   title: "Resume Examiner" },
  stress:            { name: "VICTOR",  title: "Stress Interviewer" },
  ai_ml:             { name: "NOVA",    title: "AI / ML Specialist" },
  cybersecurity:     { name: "CIPHER",  title: "Security Specialist" },
  cloud:             { name: "MARCUS",  title: "Cloud Architect" },
  devops:            { name: "SOREN",   title: "DevOps Engineer" },
  default:           { name: "MORGAN",  title: "AI Interviewer" },
};

const TRACK_STAGES = {
  hr:            ["Introduction", "Background", "Experience", "Behavioral", "Career Goals", "Company Fit", "Final"],
  dsa:           ["Warm-up", "Concept", "Problem", "Optimization", "Complexity", "Follow-up"],
  coding:        ["Warm-up", "Concept", "Problem", "Optimization", "Complexity", "Follow-up"],
  system_design: ["Requirements", "Scale", "API Design", "Database", "Bottlenecks", "Trade-offs", "Failure Handling"],
  lld:           ["Overview", "Classes & Design", "SOLID Principles", "Design Patterns", "Relationships", "Wrap-up"],
  behavioral:    ["Situation", "Task", "Action", "Result", "Leadership", "Reflection"],
  project:       ["Overview", "Architecture", "Technology", "Database", "API", "Deployment", "Challenges"],
  resume:        ["Introduction", "Resume Deep Dive", "Project Ownership", "Skills Verification", "Final"],
  managerial:    ["Team Context", "Delegation", "Conflict Resolution", "Prioritization", "Risk Management", "Wrap-up"],
  ai_ml:         ["Fundamentals", "Model Architecture", "Training & Tuning", "Vector DB & RAG", "Evaluation", "Wrap-up"],
  cloud:         ["Architecture", "Services", "Scalability", "Fault Tolerance", "Security", "Wrap-up"],
  devops:        ["CI/CD Pipeline", "Containers", "Kubernetes", "Monitoring", "Disaster Recovery", "Wrap-up"],
  default:       ["Intro", "Core Concepts", "Deep Dive", "Trade-offs", "Optimization", "Wrap-up"],
};

const FALLBACK_QUESTIONS = {
  hr:      ["Tell me about yourself and your career motivation.", "Why are you interested in this position?", "Describe a challenging situation and how you handled it."],
  tech:    ["Explain the core pillars of Object-Oriented Programming.", "What is the difference between a process and a thread?", "Explain ACID properties in relational databases."],
  dsa:     ["What is the time complexity of binary search and why?", "How does a hash table resolve key collisions?", "Explain Depth-First Search vs Breadth-First Search."],
  coding:  ["How would you reverse a string in place?", "How do you find two numbers in an array that sum to a target?", "Explain how an LRU cache works."],
  default: ["Tell me about yourself and your background.", "Describe a challenging project you worked on recently.", "Where do you see yourself professionally in three years?"],
};

export default function InterviewRoom() {
  const config            = useInterviewStore((s) => s.config);
  const elapsedSeconds    = useInterviewStore((s) => s.elapsedSeconds);
  const tickTimer         = useInterviewStore((s) => s.tickTimer);
  const endInterview      = useInterviewStore((s) => s.endInterview);
  const exitInterview     = useInterviewStore((s) => s.exitInterview);
  const addTranscriptLine = useInterviewStore((s) => s.addTranscriptLine);
  const setStressIndex    = useInterviewStore((s) => s.setStressIndex);
  const sharedStream      = useInterviewStore((s) => s.mediaStream);

  const trackId  = config?.trackId || 'default';
  const persona  = TRACK_PERSONAS[trackId] || TRACK_PERSONAS.default;
  const stages   = TRACK_STAGES[trackId]   || TRACK_STAGES.default;
  const isCoding = trackId === 'coding'    || trackId === 'dsa';

  // Engine refs
  const voiceRef  = useRef(null);
  const audioRef  = useRef(null);
  const faceRef   = useRef(null);
  const vocalRef  = useRef(null);
  const canvasRef = useRef(null);
  const fallbackIndexRef = useRef(0);

  // Local UI state
  const [stream,         setStream]         = useState(null);
  const [sessionId,      setSessionId]      = useState(null);
  const [aiStatus,       setAiStatus]       = useState('connecting'); // 'connecting' | 'speaking' | 'listening' | 'thinking'
  const [micEnabled,     setMicEnabled]     = useState(true);
  const [camEnabled,     setCamEnabled]     = useState(true);
  const [interimText,    setInterimText]    = useState('');
  const [userAnswerText, setUserAnswerText] = useState('');
  const [currentCode,    setCurrentCode]    = useState('');
  const [currentQ,       setCurrentQ]       = useState('');
  const [questionNum,    setQuestionNum]    = useState(1);
  const [adaptation,     setAdaptation]     = useState(null);
  const [audioMetrics,   setAudioMetrics]   = useState({ volume: 0, wpm: 0, isVoice: false });
  const [faceTelemetry,  setFaceTelemetry]  = useState({ faceDetected: false, blinkRate: 0, headPose: 'forward', eyeContact: 100 });
  const [vocalAnalysis,  setVocalAnalysis]  = useState(null);
  const [backendUp,      setBackendUp]      = useState(true);
  const [responseTimer,  setResponseTimer]  = useState(0);
  const [thinkingTime,   setThinkingTime]   = useState(false);

  // WebSocket
  const { sendAnswer, sendTelemetry } = useInterviewSocket({
    sessionId,
    onQuestion: (text, qNum) => {
      if (text === '...') { setAiStatus('thinking'); return; }
      setCurrentQ(text);
      if (qNum) setQuestionNum(qNum);
      addTranscriptLine({ role: 'ai', text });
      setAiStatus('speaking');
      setThinkingTime(false);
      voiceRef.current?.speak(text).then(() => {
        setAiStatus('listening');
        setResponseTimer(0);
        voiceRef.current?.startListening();
      });
    },
    onEval:         (rubric) => useInterviewStore.getState().setLastRubric?.(rubric),
    onReport:       (report) => {
      useInterviewStore.getState().setReport?.(report);
      _cleanupAndEnd();
    },
    onAdaptation:   (adpt)  => setAdaptation(adpt),
    onStressUpdate: (score) => setStressIndex(score),
  });

  // Master timer & candidate response timer
  useEffect(() => {
    const t = setInterval(tickTimer, 1000);
    return () => clearInterval(t);
  }, [tickTimer]);

  useEffect(() => {
    let rt;
    if (aiStatus === 'listening') {
      rt = setInterval(() => setResponseTimer(s => s + 1), 1000);
    }
    return () => clearInterval(rt);
  }, [aiStatus]);

  // Handle user answer submission (Voice-first)
  const handleUserAnswer = useCallback((overrideText) => {
    const textToSend = overrideText || userAnswerText || interimText;
    if (!textToSend.trim()) return;

    voiceRef.current?.stopListening();
    addTranscriptLine({ role: 'user', text: textToSend });
    setAiStatus('thinking');

    if (backendUp && sessionId) {
      sendAnswer(textToSend, currentCode);
    } else {
      setTimeout(() => {
        const list = FALLBACK_QUESTIONS[trackId] || FALLBACK_QUESTIONS.default;
        const nextQ = list[fallbackIndexRef.current % list.length];
        fallbackIndexRef.current += 1;
        setQuestionNum(n => n + 1);
        setCurrentQ(nextQ);
        addTranscriptLine({ role: 'ai', text: nextQ });
        setAiStatus('speaking');
        voiceRef.current?.speak(nextQ).then(() => {
          setAiStatus('listening');
          setResponseTimer(0);
          voiceRef.current?.startListening();
        });
      }, 1000);
    }

    setUserAnswerText('');
    setInterimText('');
  }, [userAnswerText, interimText, currentCode, backendUp, sessionId, trackId, addTranscriptLine, sendAnswer]);

  // Initializing session and engines
  useEffect(() => {
    let isMounted = true;
    startInterviewSession(config)
      .then(sess => {
        if (!isMounted) return;
        setSessionId(sess.session_id);
        if (sess.first_question) {
          setCurrentQ(sess.first_question);
          addTranscriptLine({ role: 'ai', text: sess.first_question });
        }
      })
      .catch(err => {
        console.warn('[InterviewRoom] Backend offline, using local mode:', err);
        setBackendUp(false);
        const list = FALLBACK_QUESTIONS[trackId] || FALLBACK_QUESTIONS.default;
        setCurrentQ(list[0]);
        fallbackIndexRef.current = 1;
        addTranscriptLine({ role: 'ai', text: list[0] });
      });
    return () => { isMounted = false; };
  }, []);

  // Voice Engine setup
  useEffect(() => {
    const ve = new VoiceEngine({
      onInterimText: (t) => { setInterimText(t); setUserAnswerText(t); },
      onFinalText:   (t) => { setUserAnswerText(t); setInterimText(''); },
    });
    voiceRef.current = ve;

    if (currentQ) {
      setAiStatus('speaking');
      ve.speak(currentQ).then(() => {
        setAiStatus('listening');
        setResponseTimer(0);
        ve.startListening();
      });
    }

    return () => ve.destroy();
  }, [currentQ]);

  // Video Stream setup
  useEffect(() => {
    let localStream = null;
    if (sharedStream) {
      setStream(sharedStream);
      streamRef.current = sharedStream;
    } else {
      navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
        .then(s => {
          setStream(s);
          streamRef.current = s;
          useInterviewStore.getState().setMediaStream(s);
        })
        .catch(err => console.warn('[InterviewRoom] Camera/Mic access denied:', err));
    }
    return () => {
      if (streamRef.current && !sharedStream) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, [sharedStream]);

  // Video Ready
  const onVideoReady = useCallback((videoEl) => {
    if (!videoEl) return;
    if (audioRef.current) audioRef.current.destroy();
    const aa = new AudioAnalyser(videoEl.srcObject, (m) => setAudioMetrics(m));
    audioRef.current = aa;

    if (canvasRef.current && !faceRef.current) {
      const fe = new FaceEngine(videoEl, canvasRef.current, (telem) => {
        setFaceTelemetry(telem);
        if (telem.stressScore > 0) sendTelemetry(telem);
      });
      fe.start();
      faceRef.current = fe;
    }

    if (!vocalRef.current) {
      const vi = new VocalIntelligenceEngine(videoEl.srcObject, (analysis) => {
        setVocalAnalysis(analysis);
      });
      vi.start(3000);
      vocalRef.current = vi;
    }
  }, [sendTelemetry]);

  // Cleanup & End
  const _cleanupAndEnd = () => {
    voiceRef.current?.destroy();
    audioRef.current?.destroy();
    faceRef.current?.stop();
    vocalRef.current?.stop();
    endInterview();
  };

  const handleExit = () => {
    voiceRef.current?.destroy();
    audioRef.current?.destroy();
    faceRef.current?.stop();
    vocalRef.current?.stop();
    exitInterview();
  };

  const toggleMic = () => {
    if (stream) {
      stream.getAudioTracks().forEach(t => { t.enabled = !micEnabled; });
      setMicEnabled(!micEnabled);
    }
  };

  const toggleCam = () => {
    if (stream) {
      stream.getVideoTracks().forEach(t => { t.enabled = !camEnabled; });
      setCamEnabled(!camEnabled);
    }
  };

  const replayQuestion = () => {
    if (currentQ) {
      voiceRef.current?.stopListening();
      setAiStatus('speaking');
      voiceRef.current?.speak(currentQ).then(() => {
        setAiStatus('listening');
        voiceRef.current?.startListening();
      });
    }
  };

  // Stepper active index (0 to stages.length - 1)
  const activeStageIdx = Math.min(questionNum - 1, stages.length - 1);

  const formatTimer = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      backgroundColor: '#FFFFFF', fontFamily: 'var(--font-inter)', overflow: 'hidden',
    }}>

      {/* ── 1. TOP HEADER: Stepper & Controls ─────────────────────────────── */}
      <div style={{
        backgroundColor: '#FFFFFF', borderBottom: `1px solid ${BORDER}`,
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0, height: '60px',
      }}>
        {/* Left: Track title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{
            fontSize: '11px', fontWeight: 700, padding: '3px 9px', borderRadius: '4px',
            backgroundColor: BLACK, color: '#FFFFFF', textTransform: 'uppercase', letterSpacing: '0.6px',
          }}>
            {trackId.replace('_', ' ')}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: BLACK }}>
            {persona.name} ({persona.title})
          </span>
        </div>

        {/* Center: Stage Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {stages.map((stg, i) => {
            const isDone   = i < activeStageIdx;
            const isActive = i === activeStageIdx;
            return (
              <React.Fragment key={stg}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    backgroundColor: isActive ? BLACK : isDone ? BLACK : BORDER,
                    border: isActive ? `2px solid ${BLACK}` : 'none',
                  }} />
                  <span style={{
                    fontSize: '11px', fontWeight: isActive ? 700 : 500,
                    color: isActive ? BLACK : isDone ? BLACK : GREY,
                  }}>
                    {stg}
                  </span>
                </div>
                {i < stages.length - 1 && (
                  <div style={{ width: '16px', height: '1px', backgroundColor: BORDER, margin: '0 2px' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right: Master Timer & Exit */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: BLACK, fontFamily: 'monospace' }}>
            {formatTimer(elapsedSeconds)}
          </span>
          <button onClick={handleExit} style={{
            padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
            backgroundColor: '#FFFFFF', color: GREY, border: `1px solid ${BORDER}`, borderRadius: '5px',
          }}>
            Exit
          </button>
          <button onClick={_cleanupAndEnd} style={{
            padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
            backgroundColor: BLACK, color: '#FFFFFF', border: 'none', borderRadius: '5px',
          }}>
            End Interview
          </button>
        </div>
      </div>

      {/* ── 2. MAIN BODY (Left Content + Right Panel) ─────────────────────── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

        {/* Left View: Question + AI Persona + Video / Code */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: BG }}>

          {/* AI INTERVIEWER CARD & STATUS */}
          <div style={{
            backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: '8px',
            padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Avatar circle */}
              <div style={{
                width: '44px', height: '44px', borderRadius: '50%', backgroundColor: BLACK,
                color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, fontSize: '14px', letterSpacing: '1px',
              }}>
                {persona.name.slice(0, 2)}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: BLACK }}>{persona.name}</p>
                <p style={{ margin: 0, fontSize: '12px', color: GREY }}>{persona.title}</p>
              </div>
            </div>

            {/* AI State Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700,
                backgroundColor: aiStatus === 'speaking' ? BLACK : '#F3F4F6',
                color:           aiStatus === 'speaking' ? '#FFFFFF' : BLACK,
                border: `1px solid ${BORDER}`,
              }}>
                {aiStatus === 'speaking'   && '●●● Speaking...'}
                {aiStatus === 'listening'  && '🎙 Listening...'}
                {aiStatus === 'thinking'   && '◌ Analyzing response...'}
                {aiStatus === 'connecting' && '● Connecting...'}
              </div>
              <button onClick={replayQuestion} style={{
                padding: '5px 10px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                backgroundColor: '#FFFFFF', color: BLACK, border: `1px solid ${BORDER}`, borderRadius: '4px',
              }}>
                Replay Question
              </button>
            </div>
          </div>

          {/* LARGE QUESTION CARD */}
          <div style={{
            backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: '8px',
            padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: '10px',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: GREY, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              QUESTION {String(questionNum).padStart(2, '0')}
            </span>
            <p style={{
              fontSize: '18px', fontWeight: 600, color: BLACK, margin: 0,
              lineHeight: 1.5, fontFamily: 'var(--font-inter)',
            }}>
              "{currentQ || 'Preparing your first question...'}"
            </p>
          </div>

          {/* CANDIDATE VOICE-FIRST RESPONSE PANEL */}
          <div style={{
            backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: '8px',
            padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                backgroundColor: aiStatus === 'listening' ? BLACK : '#F3F4F6',
                color:           aiStatus === 'listening' ? '#FFFFFF' : GREY,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: '14px',
              }}>
                🎙
              </div>
              <div>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: BLACK }}>
                  {aiStatus === 'listening' ? 'Candidate Responding...' : 'AI is turn holder'}
                </p>
                <p style={{ margin: 0, fontSize: '12px', color: GREY }}>
                  Response Duration: {formatTimer(responseTimer)}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              {isCoding && (
                <button onClick={() => setThinkingTime(!thinkingTime)} style={{
                  padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  backgroundColor: '#FFFFFF', color: BLACK, border: `1px solid ${BORDER}`, borderRadius: '6px',
                }}>
                  {thinkingTime ? 'Resume Speaking' : 'Thinking Time'}
                </button>
              )}
              <button
                onClick={() => handleUserAnswer()}
                disabled={aiStatus !== 'listening'}
                style={{
                  padding: '8px 18px', fontSize: '13px', fontWeight: 700, cursor: aiStatus === 'listening' ? 'pointer' : 'default',
                  backgroundColor: aiStatus === 'listening' ? BLACK : '#F3F4F6',
                  color:           aiStatus === 'listening' ? '#FFFFFF' : GREY,
                  border: 'none', borderRadius: '6px', transition: 'all 0.1s ease',
                }}
              >
                Finish Answer →
              </button>
            </div>
          </div>

          {/* WORKSPACE AREA: Code Editor (if coding) + Video Feed */}
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: isCoding ? '1fr 340px' : '1fr', gap: '16px', minHeight: '300px' }}>

            {/* Monaco Code Editor (for DSA / Live Coding) */}
            {isCoding && (
              <div style={{ border: `1px solid ${BORDER}`, borderRadius: '8px', overflow: 'hidden', backgroundColor: '#FFFFFF' }}>
                <MonacoEditorPanel
                  language={config?.codingLang || 'javascript'}
                  onCodeChange={(code) => setCurrentCode(code)}
                />
              </div>
            )}

            {/* Video Feed Box */}
            <div style={{
              border: `1px solid ${BORDER}`, borderRadius: '8px', overflow: 'hidden',
              backgroundColor: BLACK, position: 'relative', minHeight: '260px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {camEnabled ? (
                <VideoFeed stream={stream} muted onVideoReady={onVideoReady} style={{
                  width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)', display: 'block',
                }} />
              ) : (
                <div style={{ textAlign: 'center', color: '#9CA3AF' }}>
                  <p style={{ fontSize: '13px', margin: 0, fontWeight: 600 }}>Camera is off</p>
                </div>
              )}

              {/* Hidden FaceMesh Canvas */}
              <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', transform: 'scaleX(-1)' }} />

              {/* Mic / Cam Toggles overlay bottom right */}
              <div style={{ position: 'absolute', bottom: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                <button onClick={toggleMic} style={{
                  padding: '6px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                  backgroundColor: micEnabled ? 'rgba(0,0,0,0.75)' : '#DC2626',
                  color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px',
                }}>
                  {micEnabled ? 'Mic On' : 'Mic Off'}
                </button>
                <button onClick={toggleCam} style={{
                  padding: '6px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                  backgroundColor: camEnabled ? 'rgba(0,0,0,0.75)' : '#DC2626',
                  color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px',
                }}>
                  {camEnabled ? 'Cam On' : 'Cam Off'}
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* Right View: Pure Monochrome SidePanel */}
        <div style={{ width: '340px', flexShrink: 0 }}>
          <SidePanel
            faceTelemetry={faceTelemetry}
            audioMetrics={audioMetrics}
            vocalAnalysis={vocalAnalysis}
            userAnswerText={userAnswerText}
            interimText={interimText}
            onSendAnswer={handleUserAnswer}
            aiStatus={aiStatus}
            elapsedSeconds={elapsedSeconds}
          />
        </div>

      </div>

    </div>
  );
}
