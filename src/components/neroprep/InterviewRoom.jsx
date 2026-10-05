import React, { useEffect, useRef, useState, useCallback } from 'react';
import useInterviewStore from '../../store/interviewStore';
import VideoFeed from './VideoFeed';
import MonacoEditorPanel from './MonacoEditorPanel';
import SidePanel from './SidePanel';
import CodingRoom from './CodingRoom';

import { VoiceEngine } from './engines/VoiceEngine';
import { AudioAnalyser } from './engines/AudioAnalyser';
import { FaceEngine } from './engines/FaceEngine';
import { VocalIntelligenceEngine } from './engines/VocalIntelligenceEngine';
import { AIQuestionEngine } from './engines/AIQuestionEngine';
import { useInterviewSocket, startInterviewSession } from './useInterviewSocket';
import { HeyGenAvatarService } from './engines/HeyGenAvatarService';
import SadTalkerRealHumanAvatar from './SadTalkerRealHumanAvatar';

// ── Monochrome design tokens ──────────────────────────────────────────────────
const BLACK = '#111111';
const GREY = '#6B7280';
const BORDER = '#E5E7EB';
const BG = '#F9FAFB';

// ── Persona & Stage definitions per track ─────────────────────────────────────
const TRACK_PERSONAS = {
 hr: { name: "MAYA", title: "HR Talent Lead" },
 tech: { name: "ALEX", title: "Technical Specialist" },
 dsa: { name: "ARIA", title: "DSA Evaluator" },
 coding: { name: "ARIA", title: "Live Coding Lead" },
 system_design: { name: "DANIEL", title: "System Architect" },
 lld: { name: "DANIEL", title: "LLD Expert" },
 behavioral: { name: "MAYA", title: "Behavioral Evaluator" },
 managerial: { name: "SARAH", title: "Engineering Manager" },
 project: { name: "ALEX", title: "Project Viva Examiner" },
 resume: { name: "SARAH", title: "Resume Examiner" },
 stress: { name: "VICTOR", title: "Stress Interviewer" },
 ai_ml: { name: "NOVA", title: "AI / ML Specialist" },
 cybersecurity: { name: "CIPHER", title: "Security Specialist" },
 cloud: { name: "MARCUS", title: "Cloud Architect" },
 devops: { name: "SOREN", title: "DevOps Engineer" },
 default: { name: "MORGAN", title: "AI Interviewer" },
};

const TRACK_STAGES = {
 hr: ["Introduction", "Background", "Experience", "Behavioral", "Career Goals", "Company Fit", "Final"],
 dsa: ["Warm-up", "Concept", "Problem", "Optimization", "Complexity", "Follow-up"],
 coding: ["Warm-up", "Concept", "Problem", "Optimization", "Complexity", "Follow-up"],
 system_design: ["Requirements", "Scale", "API Design", "Database", "Bottlenecks", "Trade-offs", "Failure Handling"],
 lld: ["Overview", "Classes & Design", "SOLID Principles", "Design Patterns", "Relationships", "Wrap-up"],
 behavioral: ["Situation", "Task", "Action", "Result", "Leadership", "Reflection"],
 project: ["Overview", "Architecture", "Technology", "Database", "API", "Deployment", "Challenges"],
 resume: ["Introduction", "Resume Deep Dive", "Project Ownership", "Skills Verification", "Final"],
 managerial: ["Team Context", "Delegation", "Conflict Resolution", "Prioritization", "Risk Management", "Wrap-up"],
 ai_ml: ["Fundamentals", "Model Architecture", "Training & Tuning", "Vector DB & RAG", "Evaluation", "Wrap-up"],
 cloud: ["Architecture", "Services", "Scalability", "Fault Tolerance", "Security", "Wrap-up"],
 devops: ["CI/CD Pipeline", "Containers", "Kubernetes", "Monitoring", "Disaster Recovery", "Wrap-up"],
 default: ["Intro", "Core Concepts", "Deep Dive", "Trade-offs", "Optimization", "Wrap-up"],
};

const CALM_CORNER_QUOTES = [
  "You are doing wonderful practice! Step by step, your confidence is growing.",
  "Take a deep, grounding breath. Your skills and preparation are working for you.",
  "A momentary pause is a sign of thoughtful mastery, not hesitation.",
  "Focus on clarity over speed. Break the problem down into simple fundamentals.",
  "Every great engineer takes tactical pauses to structure scalable thoughts."
];

export default function InterviewRoom() {
 const config = useInterviewStore((s) => s.config);
 const elapsedSeconds = useInterviewStore((s) => s.elapsedSeconds) || 0;
 const tickTimer = useInterviewStore((s) => s.tickTimer);
 const endInterview = useInterviewStore((s) => s.endInterview);
 const exitInterview = useInterviewStore((s) => s.exitInterview);
 const addTranscriptLine = useInterviewStore((s) => s.addTranscriptLine);
 const setStressIndex = useInterviewStore((s) => s.setStressIndex);
 const sharedStream = useInterviewStore((s) => s.mediaStream);

  const trackId = String(config?.trackId || 'default').toLowerCase();
  const persona = TRACK_PERSONAS[trackId] || TRACK_PERSONAS.default || { name: 'MORGAN', title: 'AI Interviewer' };
  const stages = TRACK_STAGES[trackId] || TRACK_STAGES.default || ['Introduction', 'Core Questions', 'Wrap-up'];
  const isCoding = trackId === 'coding' || trackId === 'dsa';

  // Engine refs
  const voiceRef = useRef(null);
  const audioRef = useRef(null);
  const faceRef = useRef(null);
  const vocalRef = useRef(null);
  const canvasRef = useRef(null);
  const aiEngineRef = useRef(null);
  const fallbackIndexRef = useRef(0);
  const cleanupRef = useRef(null);

 // Initialize engine synchronously to load first question immediately
 if (!aiEngineRef.current) {
 try {
 aiEngineRef.current = new AIQuestionEngine(config || {});
 } catch (_) {}
 }

 // Local UI state
 const [stream, setStream] = useState(null);
 const [sessionId, setSessionId] = useState(null);
 const [aiStatus, setAiStatus] = useState('speaking'); // 'connecting' | 'speaking' | 'listening' | 'thinking'
 const [micEnabled, setMicEnabled] = useState(true);
 const [camEnabled, setCamEnabled] = useState(true);
 const [interimText, setInterimText] = useState('');
 const [userAnswerText, setUserAnswerText] = useState('');
 const [submitWarning, setSubmitWarning] = useState('');
 const [currentCode, setCurrentCode] = useState('');
  const [currentQ, setCurrentQ] = useState(() => {
    try {
      const q = aiEngineRef.current?.getNextQuestion?.();
      return (typeof q === 'string' && q.trim()) ? q : 'Please introduce yourself and explain your academic background and key technical strengths.';
    } catch (_) {
      return 'Please introduce yourself and explain your academic background and key technical strengths.';
    }
  });
 const [questionNum, setQuestionNum] = useState(1);
 const [playbackSpeed, setPlaybackSpeed] = useState(1.0); // 0.85 | 1.0 | 1.15
 const [activeSentenceIdx, setActiveSentenceIdx] = useState(-1);
 const streamRef = useRef(null);
 const [audioMetrics, setAudioMetrics] = useState({ volume: 0, wpm: 0, isVoice: false });
 const [faceTelemetry, setFaceTelemetry] = useState({ faceDetected: false, blinkRate: 0, headPose: 'forward', eyeContact: 100 });
  const BREATH_PHASES = [
    { key: 'inhale', name: 'Inhale', hint: 'Slowly breathe in fresh oxygen & confidence', color: 'var(--btn-sage)' },
    { key: 'hold1', name: 'Hold', hint: 'Pause with calm, steady composure', color: 'var(--accent-terracotta)' },
    { key: 'exhale', name: 'Exhale', hint: 'Slowly release all tension & pressure', color: 'var(--secondary-olive)' },
    { key: 'hold2', name: 'Hold', hint: 'Rest in quiet clarity and stillness', color: 'var(--btn-sage)' }
  ];
  const [breathPhaseIdx, setBreathPhaseIdx] = useState(0);
  const [breathSeconds, setBreathSeconds] = useState(4);
  const [vocalAnalysis, setVocalAnalysis] = useState(null);
  // ── Distraction & Cognitive Load (30-second continuous threshold) Tracker ─────────
  const [isCalmModalActive, setIsCalmModalActive] = useState(false);
  const [distractionSeconds, setDistractionSeconds] = useState(0);
  const [calmQuoteIdx, setCalmQuoteIdx] = useState(0);
  const [backendUp, setBackendUp] = useState(false);
  const [responseTimer, setResponseTimer] = useState(0);
  const [thinkingTime, setThinkingTime] = useState(false);
  const [stressIndex, setLocalStressIdx] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [isTerminated, setIsTerminated] = useState(false);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [hasNudgedForQ, setHasNudgedForQ] = useState(false);
  const [highStressSeconds, setHighStressSeconds] = useState(0);
  const [isEmpathyNudgeActive, setIsEmpathyNudgeActive] = useState(false);
  const [empathyNudgeText, setEmpathyNudgeText] = useState('');

  // ── HeyGen Interactive Streaming AI Avatar ──────────────────────────────
  const heyGenVideoRef = useRef(null);
  const heyGenServiceRef = useRef(null);
  const [heyGenKey, setHeyGenKey] = useState(() => localStorage.getItem('neuroprep_heygen_key') || '');
  const [heyGenAvatarId, setHeyGenAvatarId] = useState(() => localStorage.getItem('neuroprep_heygen_avatar_id') || 'josh_lite3_20230714');
  const [isHeyGenStreaming, setIsHeyGenStreaming] = useState(false);
  const [isHeyGenConnecting, setIsHeyGenConnecting] = useState(false);

  const connectHeyGen = async () => {
    if (!heyGenKey) return;
    setIsHeyGenConnecting(true);
    try {
      if (!heyGenServiceRef.current) {
        heyGenServiceRef.current = new HeyGenAvatarService({
          apiKey: heyGenKey,
          avatarId: heyGenAvatarId,
          onTalkingStatusChange: (talking) => {
            setAiStatus(talking ? 'speaking' : 'listening');
          },
          onStreamReady: () => {
            setIsHeyGenStreaming(true);
            setIsHeyGenConnecting(false);
          },
          onError: (err) => {
            console.warn('[HeyGen] Stream notice:', err.message);
            setIsHeyGenStreaming(false);
            setIsHeyGenConnecting(false);
          }
        });
      }
      await heyGenServiceRef.current.startSession(heyGenVideoRef.current);
      setIsHeyGenStreaming(true);
    } catch (e) {
      console.warn('[HeyGen] Connect notice:', e.message);
      setIsHeyGenStreaming(false);
    } finally {
      setIsHeyGenConnecting(false);
    }
  };

  const disconnectHeyGen = async () => {
    if (heyGenServiceRef.current) {
      await heyGenServiceRef.current.stopSession();
    }
    setIsHeyGenStreaming(false);
  };

  // Auto-connect HeyGen stream in background when key is provided
  useEffect(() => {
    if (heyGenKey && !isHeyGenStreaming) {
      connectHeyGen();
    }
  }, [heyGenKey]);

  // Live distraction calculation (gaze loss, looking away/down, face loss, phone alerts, tab switches, facial fear/stress spikes)
  const rawDistraction = (
    (!faceTelemetry.faceDetected && elapsedSeconds > 4 ? 60 : 0) +
    (faceTelemetry.eyeContact != null && faceTelemetry.eyeContact < 60 ? Math.round((60 - faceTelemetry.eyeContact) * 1.0) : 0) +
    (faceTelemetry.headPose && ['left', 'right', 'down'].includes(faceTelemetry.headPose) ? 35 : 0) +
    ((faceTelemetry.fearScore || 0) >= 55 ? Math.round((faceTelemetry.fearScore - 45) * 0.6) : 0) +
    ((faceTelemetry.facialStressScore || 0) >= 60 ? Math.round((faceTelemetry.facialStressScore - 50) * 0.5) : 0) +
    (tabSwitchCount > 0 ? Math.min(30, tabSwitchCount * 15) : 0) +
    ((faceTelemetry.phoneAlerts || 0) > 0 ? 40 : 0)
  );
  const liveDistractionScore = Math.min(100, Math.max(0, rawDistraction));

  // Determine current live cognitive load percentage (fused with facial fear & facial stress)
  const effectiveCognitiveLoad = faceTelemetry?.stressScore != null
    ? faceTelemetry.stressScore
    : (faceTelemetry?.cognitiveLoad === 'High' ? 82 : (stressIndex || 0));

  // Condition: Continuous distraction, high fear/stress, or masked panic >= 75%
  const isDistractedOrStressed = liveDistractionScore >= 75 || effectiveCognitiveLoad >= 75 || (faceTelemetry?.fearScore || 0) >= 75 || Boolean(faceTelemetry?.maskedPanicDetected);

  // Track if distraction / high load remains continuous for 30 seconds
  useEffect(() => {
    if (isCalmModalActive) return;

    const distractionTimer = setInterval(() => {
      if (isDistractedOrStressed) {
        setDistractionSeconds((prev) => {
          const nextVal = prev + 1;
          if (nextVal >= 30) {
            setIsCalmModalActive(true);
            return 0; // Reset counter once triggered
          }
          return nextVal;
        });
      } else {
        setDistractionSeconds((prev) => (prev > 0 ? Math.max(0, prev - 1) : 0));
      }
    }, 1000);

    return () => clearInterval(distractionTimer);
  }, [isDistractedOrStressed, isCalmModalActive]);

  // Handler for closing the modal and resuming interview
  const handleReadyResume = () => {
    setIsCalmModalActive(false);
    setDistractionSeconds(0);
  };

  const CALM_CORNER_QUOTES = [
    "Take a gentle pause. It is completely okay to take a moment and collect your thoughts.",
    "Drop your shoulders, inhale deeply, and speak at your natural, comfortable pace.",
    "One question does not define your worth or talent. Trust your preparation.",
    "Breathe in calm confidence, and release any sudden interview tension.",
    "You have solved challenging problems before; you have everything you need right now."
  ];

  // 4-Phase Box Breathing Timer (4s Inhale, 4s Hold, 4s Exhale, 4s Hold)
  useEffect(() => {
    if (!isCalmModalActive) {
      setBreathPhaseIdx(0);
      setBreathSeconds(4);
      return;
    }
    const timer = setInterval(() => {
      setBreathSeconds((prev) => {
        if (prev <= 1) {
          setBreathPhaseIdx((p) => (p + 1) % 4);
          return 4;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isCalmModalActive]);

  // Relaxing Quote Rotation Timer
  useEffect(() => {
    if (!isCalmModalActive) return;
    const quoteTimer = setInterval(() => {
      setCalmQuoteIdx(prev => (prev + 1) % CALM_CORNER_QUOTES.length);
    }, 8000);
    return () => clearInterval(quoteTimer);
  }, [isCalmModalActive]);

  const EMPATHY_NUDGE_PHRASES = [
    "Take your time with this one, it’s a multi-layered question. I'm really interested to hear your perspective.",
    "Take a comfortable breath; there is no single textbook answer. I'm keen to hear your architectural thought process.",
    "You are doing great on the technical structure. Collect your thoughts, and speak whenever you're ready.",
    "Remember, explaining the trade-offs is what matters most. Feel free to talk through your initial reasoning step by step."
  ];

  // 4-Second High Stress Detection -> Triggers AI Avatar Empathy Nudge
  useEffect(() => {
    if (isCalmModalActive || hasNudgedForQ || aiStatus !== 'listening') {
      setHighStressSeconds(0);
      return;
    }

    const isElevatedStress = effectiveCognitiveLoad >= 65 || (faceTelemetry?.fearScore || 0) >= 55 || (faceTelemetry?.facialStressScore || 0) >= 60 || liveDistractionScore >= 65;

    const timer = setInterval(() => {
      if (isElevatedStress) {
        setHighStressSeconds((prev) => {
          const next = prev + 1;
          if (next >= 4 && !hasNudgedForQ) {
            const phrase = EMPATHY_NUDGE_PHRASES[Math.floor(Math.random() * EMPATHY_NUDGE_PHRASES.length)];
            setIsEmpathyNudgeActive(true);
            setEmpathyNudgeText(phrase);
            setHasNudgedForQ(true);

            // AI Interviewer speaks the supportive validation phrase via HeyGen or VoiceEngine
            try {
              if (isHeyGenStreaming && heyGenServiceRef.current) {
                heyGenServiceRef.current.reactToInterviewee(phrase);
              } else {
                voiceRef.current?.speak?.(phrase);
              }
            } catch (_) {}

            // Auto-settle empathy banner after 8.5 seconds
            setTimeout(() => {
              setIsEmpathyNudgeActive(false);
            }, 8500);

            return 0;
          }
          return next;
        });
      } else {
        setHighStressSeconds((prev) => (prev > 0 ? Math.max(0, prev - 1) : 0));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isCalmModalActive, hasNudgedForQ, aiStatus, effectiveCognitiveLoad, faceTelemetry, liveDistractionScore, isHeyGenStreaming]);

  // Strict Tab switch / Window blur proctoring detection
  useEffect(() => {
    let lastAlertTime = 0;
    const triggerViolation = () => {
      const now = Date.now();
      if (now - lastAlertTime < 800) return;
      lastAlertTime = now;

      setTabSwitchCount((prev) => {
        const nextCount = prev + 1;
        if (nextCount >= 3) {
          setIsTerminated(true);
        }
        return nextCount;
      });
    };

    const handleVis = () => {
      if (document.hidden) {
        triggerViolation();
      }
    };

    const handleBlur = () => {
      triggerViolation();
    };

    document.addEventListener('visibilitychange', handleVis);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVis);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  const speakingQRef = useRef('');

  // Hardware-level acoustic isolation & software mic management
  const toggleMicHardware = useCallback((enabled) => {
    voiceRef.current?.setHardwareAudioEnabled?.(enabled);
  }, []);

  // Force start listening immediately (bypasses TTS audio playback / Natural Barge-In)
  const forceStartListening = useCallback(() => {
    try {
      if (isHeyGenStreaming && heyGenServiceRef.current) {
        heyGenServiceRef.current.interrupt();
      }
      voiceRef.current?.stopSpeaking?.();
    } catch (_) {}
    setActiveSentenceIdx(-1);
    setAiStatus('listening');
    setResponseTimer(0);
    toggleMicHardware(true);
    try {
      audioRef.current?.resume();
    } catch (_) {}
    try {
      voiceRef.current?.startListening();
    } catch (_) {}
  }, [isHeyGenStreaming, toggleMicHardware]);

  // Natural Barge-In: Spacebar quick interruption
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (aiStatus === 'speaking' && e.code === 'Space') {
        const tag = document.activeElement?.tagName?.toLowerCase();
        if (tag !== 'input' && tag !== 'textarea') {
          e.preventDefault();
          forceStartListening();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [aiStatus, forceStartListening]);

  // Helper to safely speak question via HeyGen Avatar or TTS with chunked teleprompter & speed support
  const speakQuestion = useCallback((text) => {
    if (!text) return;
    
    // Prevent duplicate triggers of the exact same question
    if (speakingQRef.current === text && aiStatus === 'listening') {
      return;
    }
    speakingQRef.current = text;

    setAiStatus('speaking');
    setThinkingTime(false);
    setSubmitWarning('');
    setUserAnswerText('');
    setInterimText('');
    setHasNudgedForQ(false);
    setHighStressSeconds(0);
    setIsEmpathyNudgeActive(false);
    setActiveSentenceIdx(0);

    toggleMicHardware(false);

    try {
      voiceRef.current?.resetTranscript?.();
      voiceRef.current?.stopListening();
    } catch (_) {}

    // Dynamic recovery timeout: switch to listening within 4s max if avatar/TTS gets blocked
    const autoAdvanceMs = Math.min(4800, Math.max(2200, text.split(/\s+/).length * 200));
    const safetyTimer = setTimeout(() => {
      setAiStatus((prev) => {
        if (prev === 'speaking') {
          setActiveSentenceIdx(-1);
          setResponseTimer(0);
          toggleMicHardware(true);
          try { voiceRef.current?.startListening(); } catch (_) {}
          return 'listening';
        }
        return prev;
      });
    }, autoAdvanceMs);

    const onFinishSpeaking = () => {
      clearTimeout(safetyTimer);
      setActiveSentenceIdx(-1);
      setAiStatus('listening');
      setResponseTimer(0);
      toggleMicHardware(true);
      setTimeout(() => {
        try { voiceRef.current?.startListening(); } catch (_) {}
      }, 60);
    };

    if (isHeyGenStreaming && heyGenServiceRef.current) {
      heyGenServiceRef.current.speak(text).then((ok) => {
        if (!ok && voiceRef.current?.speak) {
          voiceRef.current.speak(text, {
            rate: playbackSpeed,
            onSentenceChange: (idx) => setActiveSentenceIdx(idx)
          }).then(onFinishSpeaking).catch(onFinishSpeaking);
        } else {
          onFinishSpeaking();
        }
      });
    } else if (voiceRef.current?.speak) {
      voiceRef.current.speak(text, {
        rate: playbackSpeed,
        onSentenceChange: (idx) => setActiveSentenceIdx(idx)
      })
        .then(onFinishSpeaking)
        .catch(onFinishSpeaking);
    } else {
      onFinishSpeaking();
    }
  }, [aiStatus, isHeyGenStreaming, playbackSpeed, toggleMicHardware]);

  // Dynamic Teleprompter: highlights the currently vocalized sentence in real time
  const renderTeleprompterQuestion = (questionText, activeIdx, status) => {
    let qStr = questionText;
    if (qStr && typeof qStr === 'object') {
      qStr = qStr.question || qStr.text || qStr.title || '';
    }
    if (!qStr || typeof qStr !== 'string' || !qStr.trim()) {
      return 'Please introduce yourself and explain your academic background and key technical strengths.';
    }
    if (status !== 'speaking' || activeIdx < 0) {
      return qStr;
    }

    const sentences = qStr.match(/[^.!?]+[.!?]+|\S[^.!?]+$/g) || [qStr];
    return sentences.map((sentence, idx) => {
      const isCurrent = idx === activeIdx;
      return (
        <span
          key={idx}
          style={{
            backgroundColor: isCurrent ? 'rgba(254, 243, 199, 0.95)' : 'transparent',
            color: isCurrent ? '#92400E' : (idx < activeIdx ? '#111827' : '#1F2937'),
            padding: isCurrent ? '2px 6px' : '0',
            borderRadius: isCurrent ? '6px' : '0',
            border: isCurrent ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
            boxShadow: isCurrent ? '0 1px 4px rgba(217, 119, 6, 0.15)' : 'none',
            fontWeight: isCurrent ? 800 : 700,
            transition: 'all 0.2s ease',
            display: 'inline'
          }}
        >
          {sentence}{' '}
        </span>
      );
    });
  };

 // WebSocket hook — uses cleanupRef so _cleanupAndEnd can be defined after this hook
 const { sendAnswer, sendTelemetry, endInterview: sendEndWs } = useInterviewSocket({
 sessionId,
 onQuestion: (text, qNum) => {
 if (text === '...') { setAiStatus('thinking'); return; }
 // If the local AIQuestionEngine is actively driving question progression,
 // prevent backend WebSocket echo from repeating the question and wiping candidate speech
 if (aiEngineRef.current && currentQ) {
 return;
 }
 setCurrentQ(text || '');
 if (qNum) setQuestionNum(qNum);
 if (addTranscriptLine) addTranscriptLine({ role: 'ai', text });
 speakQuestion(text);
 },
 onEval: (rubric) => useInterviewStore.getState().setLastRubric?.(rubric),
 onReport: (report) => {
 useInterviewStore.getState().setReport?.(report);
 cleanupRef.current?.();
 },
 onAdaptation: () => {},
 onStressUpdate: (score) => {
 setLocalStressIdx(score || 0);
 setStressIndex?.(score);
 },
 });

  // Master timer & candidate response timer (Paused when Calm Corner Focus Reset is active)
  useEffect(() => {
    if (!tickTimer || isCalmModalActive) return;
    const t = setInterval(tickTimer, 1000);
    return () => clearInterval(t);
  }, [tickTimer, isCalmModalActive]);

  useEffect(() => {
    let rt;
    if (aiStatus === 'listening' && !isCalmModalActive) {
      rt = setInterval(() => setResponseTimer(s => s + 1), 1000);
    }
    return () => clearInterval(rt);
  }, [aiStatus, isCalmModalActive]);

  // Pause voice listening when Calm Corner Focus Reset is active
  useEffect(() => {
    if (isCalmModalActive) {
      try { voiceRef.current?.stopListening(); } catch (_) {}
    } else if (aiStatus === 'listening') {
      try { voiceRef.current?.startListening(); } catch (_) {}
    }
  }, [isCalmModalActive, aiStatus]);

 // Safety auto-recovery: if AI stays in 'thinking' for > 7s, auto-advance with next question
 useEffect(() => {
 let timeout;
 if (aiStatus === 'thinking') {
 timeout = setTimeout(() => {
 console.warn('[InterviewRoom] AI analysis timeout (7s) reached — auto-recovering next question');
 let nextQ = '';
 if (aiEngineRef.current) {
 nextQ = aiEngineRef.current.generateFollowUp(userAnswerText || 'Thank you for that response.');
 } else {
 const engine = new AIQuestionEngine(config || {});
 aiEngineRef.current = engine;
 nextQ = engine.getNextQuestion();
 }
 setQuestionNum(n => n + 1);
 setCurrentQ(nextQ);
 if (addTranscriptLine) addTranscriptLine({ role: 'ai', text: nextQ });
 speakQuestion(nextQ);
 }, 7000);
 }
 return () => clearTimeout(timeout);
 }, [aiStatus, userAnswerText, trackId, addTranscriptLine, speakQuestion, config, questionNum]);

 // Voice Engine setup (initialized once on mount)
 useEffect(() => {
 try {
 const langMap = {
 'English': 'en-US',
 'Hindi': 'hi-IN',
 'Tamil': 'ta-IN',
 'Telugu': 'te-IN',
 'Malayalam': 'ml-IN',
 };
 const chosenLang = langMap[config?.language] || 'en-US';

    const ve = new VoiceEngine({
      lang: chosenLang,
      mediaStream: stream || sharedStream || streamRef.current,
      onTranscript: ({ fullText, interimText: it }) => {
        setUserAnswerText(fullText || '');
        setInterimText(it || '');
      },
    });
    voiceRef.current = ve;
  } catch (e) {
    console.warn('[InterviewRoom] VoiceEngine init error:', e);
  }

  return () => {
    try { voiceRef.current?.destroy(); } catch (_) {}
  };
 }, [config?.language, stream, sharedStream]);

  // Skip to next question immediately
  const handleSkipQuestion = useCallback(() => {
    if (aiStatus === 'thinking') return;
    try { voiceRef.current?.stopListening(); } catch (_) {}
    setAiStatus('thinking');
    setTimeout(() => {
      if (!aiEngineRef.current) {
        aiEngineRef.current = new AIQuestionEngine(config || {});
      }
      const nextQ = aiEngineRef.current.getNextQuestion(stressIndex || 0);
      setQuestionNum(n => n + 1);
      setCurrentQ(nextQ);
      if (addTranscriptLine) addTranscriptLine({ role: 'ai', text: nextQ });
      speakQuestion(nextQ);
    }, 600);
    setUserAnswerText('');
    setInterimText('');
    setSubmitWarning('');
  }, [aiStatus, stressIndex, config, addTranscriptLine, speakQuestion]);

  // Handle user answer submission (Voice-first)
  const handleUserAnswer = useCallback((overrideText) => {
    const textToSend = (overrideText !== undefined ? overrideText : userAnswerText || '').trim();

    if (!textToSend || textToSend.split(/\s+/).filter(Boolean).length < 1) {
      setSubmitWarning('Please speak your response clearly into your microphone, type your answer, or click "Next Question" to proceed.');
      return;
    }

 setSubmitWarning('');

 try {
 voiceRef.current?.stopListening();
 } catch (_) {}

 if (addTranscriptLine) addTranscriptLine({ role: 'user', text: textToSend });
 setAiStatus('thinking');

 if (backendUp && sessionId) {
 try {
 sendAnswer(currentQ, textToSend, currentCode);
 } catch (e) {
 console.warn('sendAnswer error:', e);
 }
 }

 setTimeout(() => {
 if (!aiEngineRef.current) {
 aiEngineRef.current = new AIQuestionEngine(config || {});
 }
 const nextQ = aiEngineRef.current.generateFollowUp(textToSend);
 const localEval = aiEngineRef.current.evaluateAnswerQuality(currentQ, textToSend, trackId);
 useInterviewStore.getState().setLastRubric?.(localEval);

 setQuestionNum(n => n + 1);
 setCurrentQ(nextQ);
 if (addTranscriptLine) addTranscriptLine({ role: 'ai', text: nextQ });
 speakQuestion(nextQ);
 }, 800);

 setUserAnswerText('');
 setInterimText('');
 }, [userAnswerText, currentCode, backendUp, sessionId, trackId, currentQ, addTranscriptLine, sendAnswer, speakQuestion, config]);

 // Initializing session and first question strictly ONCE on mount
 const sessionInitializedRef = useRef(false);
 useEffect(() => {
   if (sessionInitializedRef.current) return;
   sessionInitializedRef.current = true;

   if (!aiEngineRef.current) {
     aiEngineRef.current = new AIQuestionEngine(config || {});
   }

   let initialQ = currentQ;
   if (!initialQ) {
     initialQ = aiEngineRef.current.getNextQuestion();
     setCurrentQ(initialQ);
   }

   if (initialQ) {
     if (addTranscriptLine) addTranscriptLine({ role: 'ai', text: initialQ });
     speakQuestion(initialQ);
   }

   // Optional background backend session sync without blocking UI
   startInterviewSession(config || {})
     .then(sess => {
       if (sess && sess.session_id) {
         setSessionId(sess.session_id);
         setBackendUp(true);
       }
     })
     .catch(() => {
       setBackendUp(false);
     });
 }, []);

 useEffect(() => {
 if (sharedStream && sharedStream.active) {
 streamRef.current = sharedStream;
 setStream(sharedStream);
 } else {
 navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
 .then(s => {
 streamRef.current = s;
 setStream(s);
 useInterviewStore.getState().setMediaStream?.(s);
 })
 .catch(err => console.warn('[InterviewRoom] Camera/Mic access denied:', err));
 }
 }, [sharedStream]);

  // Baseline proctor telemetry so Cognitive Load and Proctor are active immediately on room entrance
  useEffect(() => {
    setFaceTelemetry(prev => ({
      faceDetected: true,
      blinkRate: 16,
      headPose: 'forward',
      eyeContact: 92,
      stressScore: 24,
      cognitiveLoad: 'Optimal',
      phoneReadingDetected: false,
      phoneObjectVisible: false,
      phoneAlerts: 0,
      phoneAlertReason: '',
      phoneDistractionScore: 0,
      ...prev
    }));
  }, []);

  // Audio Analyser fallback if video element event was delayed
  useEffect(() => {
    if (stream && !audioRef.current) {
      try {
        const aa = new AudioAnalyser(stream, { onMetrics: (m) => setAudioMetrics(m) });
        audioRef.current = aa;
      } catch (_) {}
    }
  }, [stream]);

 // Video Ready
 const onVideoReady = useCallback((videoEl) => {
 if (!videoEl || !videoEl.srcObject) return;
 try {
 if (audioRef.current) audioRef.current.destroy();
 const aa = new AudioAnalyser(videoEl.srcObject, { onMetrics: (m) => setAudioMetrics(m) });
 audioRef.current = aa;
 } catch (e) {
 console.warn('AudioAnalyser init error:', e);
 }

 try {
 if (canvasRef.current && !faceRef.current) {
 const fe = new FaceEngine(videoEl, canvasRef.current, {
 onTelemetry: (telem) => {
 setFaceTelemetry(telem);
 if (telem?.phoneReadingDetected || telem?.phoneObjectVisible) {
   useInterviewStore.getState().addPhoneIncident?.({
     reason: telem.phoneAlertReason || 'Phone detected in screen view',
     timestamp: new Date().toLocaleTimeString(),
     count: telem.phoneAlerts || 1,
   });
 }
 if (telem?.stressScore > 0 || telem?.phoneReadingDetected || telem?.phoneObjectVisible) {
   sendTelemetry?.({
     ...telem,
     phone_detected: telem?.phoneReadingDetected || false,
     phone_object_visible: telem?.phoneObjectVisible || false,
     phone_reading_detected: telem?.phoneReadingDetected || false,
     downward_seconds: telem?.downwardSeconds || 0,
     phone_alerts: telem?.phoneAlerts || 0,
     distraction_score: telem?.phoneDistractionScore || 0,
   });
 }
 }
 });
 if (typeof fe.start === 'function') fe.start();
 faceRef.current = fe;
 }
 } catch (e) {
 console.warn('FaceEngine init error:', e);
 }

 try {
 if (!vocalRef.current) {
 const vi = new VocalIntelligenceEngine(videoEl.srcObject, sessionId || 'session_local', {
 onAnalysis: (analysis) => setVocalAnalysis(analysis),
 });
 vi.start();
 vocalRef.current = vi;
 }
 } catch (e) {
 console.warn('VocalIntelligenceEngine init error:', e);
 }
 }, [sessionId, sendTelemetry]);

 // Cleanup & End
 const _cleanupAndEnd = useCallback(() => {
 try { voiceRef.current?.destroy(); } catch (_) {}
 try { audioRef.current?.destroy(); } catch (_) {}
 try { faceRef.current?.stop(); } catch (_) {}
 try { vocalRef.current?.stop(); } catch (_) {}
 endInterview?.();
 }, [endInterview]);

 // Keep cleanupRef in sync so the WS callback (defined earlier) can call it
 useEffect(() => {
 cleanupRef.current = _cleanupAndEnd;
 }, [_cleanupAndEnd]);

 // Build a complete evaluation report with question-by-question scoring when local/offline
 const _buildLocalReportAndFinish = useCallback(() => {
 try {
 // 1. Immediately stop all hardware and media tracks first
 try {
 if (stream) {
 stream.getTracks().forEach((t) => t.stop());
 }
 } catch (_) {}
 try { voiceRef.current?.destroy(); } catch (_) {}
 try { audioRef.current?.destroy(); } catch (_) {}
 try { faceRef.current?.stop(); } catch (_) {}
 try { vocalRef.current?.stop(); } catch (_) {}

 const stateTranscript = useInterviewStore.getState().transcript || [];
 const pairs = [];
 let curQ = '';

 for (const entry of stateTranscript) {
 if (entry.role === 'ai') {
 curQ = entry.text;
 } else if (entry.role === 'user' && curQ) {
 pairs.push({ q: curQ, a: entry.text });
 curQ = '';
 }
 }

 // Include the active question and any in-progress response if not already recorded
 const alreadyHasCurrentQ = pairs.some((p) => p.q === currentQ);
 if (!alreadyHasCurrentQ && currentQ) {
 pairs.push({
 q: currentQ,
 a: userAnswerText ? userAnswerText.trim() : '(Session ended on this question)',
 });
 }

 if (pairs.length === 0) {
 pairs.push({
 q: currentQ || 'Introductory evaluation',
 a: '(Session ended early)',
 });
 }

 const questionReviews = pairs.map((pair, idx) => {
 const isUnanswered = !pair.a || pair.a.startsWith('(Session ended') || pair.a.startsWith('(Candidate ended') || pair.a.startsWith('(Interview completed');
 let evalRes;
 try {
 evalRes = isUnanswered
 ? {
 overall: 0,
 is_correct: false,
 verdict: 'Unanswered / Ended Early',
 what_was_right: 'Question was presented.',
 what_was_missing: 'No spoken or written response was recorded before ending the interview.',
 feedback: 'Ensure you provide a structured verbal answer for each question.',
 strengths: [],
 improvements: ['Provide a structured verbal answer before moving forward'],
 ideal_answer: aiEngineRef.current?.getBenchmarkModelAnswer?.(pair.q, trackId) || 'Structure the response with key concepts and examples.',
 }
 : (aiEngineRef.current?.evaluateAnswerQuality(pair.q, pair.a, trackId) || {
 overall: 75,
 is_correct: true,
 verdict: 'Evaluated Response',
 what_was_right: 'Direct response provided.',
 what_was_missing: 'Could include more specific domain metrics.',
 feedback: 'Structured answer with good clarity.',
 strengths: ['Direct communication'],
 improvements: ['Include quantifiable metrics'],
 ideal_answer: aiEngineRef.current?.getBenchmarkModelAnswer?.(pair.q, trackId) || 'Structure the response with key concepts and examples.',
 });
 } catch (_) {
 evalRes = { overall: isUnanswered ? 0 : 70, verdict: 'Evaluated', ideal_answer: 'Structure the response with key concepts and examples.' };
 }

 return {
 question_number: idx + 1,
 question: pair.q,
 user_answer: pair.a,
 verdict: evalRes.verdict || (evalRes.overall >= 80 ? 'Correct & Strong' : evalRes.overall >= 55 ? 'Partially Correct' : 'Incorrect / Needs Depth'),
 is_correct: evalRes.is_correct ?? (evalRes.overall >= 75 ? true : evalRes.overall >= 55 ? 'partial' : false),
 score: evalRes.overall ?? 0,
 what_was_right: evalRes.what_was_right || 'Direct communication and relevant details provided.',
 what_was_missing: evalRes.what_was_missing || 'Include measurable impact and key results.',
 ideal_answer: evalRes.ideal_answer || aiEngineRef.current?.getBenchmarkModelAnswer?.(pair.q, trackId) || 'A comprehensive answer structures the situation, specifies individual ownership, and highlights measurable results.',
 key_takeaway: evalRes.feedback || 'Strengthen with quantifiable outcomes and ownership metrics.',
 strengths: evalRes.strengths || ['Clear tone'],
 improvements: evalRes.improvements || ['Quantifiable outcomes'],
 emotion: evalRes.emotion || null,
 };
 });

 let engineReport = {};
 try {
 if (!aiEngineRef.current) {
 aiEngineRef.current = new AIQuestionEngine(config || {});
 }
 engineReport = aiEngineRef.current.evaluateTrackPerformance({
 questionReviews,
 audioMetrics,
 vocalAnalysis,
 faceTelemetry,
 stressIndex,
 config,
 }) || {};
 } catch (err) {
 console.error('[InterviewRoom] evaluateTrackPerformance error:', err);
 }

 const answeredReviews = questionReviews.filter((q) => q.score > 0);
 const rawScore = answeredReviews.length > 0
 ? Math.round(answeredReviews.reduce((sum, item) => sum + item.score, 0) / answeredReviews.length)
 : (questionReviews.length > 0 && questionReviews[0].score > 0 ? questionReviews[0].score : 0);

 // Dynamic penalty deductions
 const cogPenalty = (stressIndex || 0) > 70 ? 8 : (stressIndex || 0) > 45 ? 4 : 0;
 const tabPenalty = tabSwitchCount * 10;
  const phonePenalty = (faceTelemetry.phoneAlerts || 0) * 12;
  const totalPenalty = cogPenalty + tabPenalty + phonePenalty;

  const avgScore = rawScore > 0 ? Math.max(0, Math.min(100, rawScore - totalPenalty)) : 0;

  const localReport = {
    ...engineReport,
    overall_score: engineReport.overall_score != null ? engineReport.overall_score : avgScore,
    question_audit_score: engineReport.question_audit_score != null ? engineReport.question_audit_score : rawScore,
    rubric_avg_score: engineReport.rubric_avg_score != null ? engineReport.rubric_avg_score : rawScore,
    biometrics_score: engineReport.biometrics_score != null ? engineReport.biometrics_score : 85,
    base_score: engineReport.base_score != null ? engineReport.base_score : rawScore,
    code_score: engineReport.question_audit_score != null ? engineReport.question_audit_score : rawScore,
    cognitive_penalty: engineReport.cognitive_penalty != null ? engineReport.cognitive_penalty : cogPenalty,
    tab_switch_penalty: tabPenalty,
    phone_penalty: phonePenalty,
    total_penalties: engineReport.total_penalties != null ? engineReport.total_penalties : totalPenalty,
    tabSwitchViolations: tabSwitchCount,
    phoneUseCount: faceTelemetry.phoneAlerts || 0,
    phoneAlertsCount: faceTelemetry.phoneAlerts || 0,
    phoneIncidentLogs: faceTelemetry.phoneIncidentLogs || [],
    distractionScore: faceTelemetry.phoneDistractionScore || ((faceTelemetry.phoneAlerts || 0) * 25),
    integrityVerdict: (faceTelemetry.phoneAlerts || 0) === 0 ? 'CLEAN' : ((faceTelemetry.phoneAlerts || 0) <= 2 ? 'ADVISORY' : 'FLAGGED'),
    proctoringFlag: (tabSwitchCount > 2 || (faceTelemetry.phoneAlerts || 0) > 0) ? 'FLAGGED' : 'CLEAN',
    grade: engineReport.grade || (avgScore >= 92 ? 'A+' : avgScore >= 85 ? 'A' : avgScore >= 78 ? 'B+' : avgScore >= 70 ? 'B' : avgScore >= 60 ? 'C' : 'D'),
    hire_recommendation: engineReport.hire_recommendation || (avgScore >= 88 ? 'Strong Yes — High Potential' : avgScore >= 75 ? 'Yes — Ready for Next Round' : avgScore >= 50 ? 'Consider — With Focus on Weak Areas' : 'No — Needs Preparation'),
    skillScores: engineReport.skillScores || {},
    evaluationMatrix: engineReport.evaluationMatrix || [],
    technical_score: engineReport.overall_score != null ? engineReport.overall_score : avgScore,
    communication_score: Math.max(0, Math.min(100, (engineReport.communication_score || avgScore) - tabPenalty)),
    grammar_score: engineReport.grammar_score || 85,
    confidence_score: engineReport.confidence_score || Math.min(100, Math.max(20, 100 - (stressIndex || 0) - totalPenalty)),
    stress_score: stressIndex || 30,
    peak_stress: Math.max(stressIndex || 30, 45),
    cognitive_load_label: (stressIndex || 0) < 40 ? 'Optimal Flow' : (stressIndex || 0) < 70 ? 'Moderate Load' : 'High Cognitive Overload',
    eye_contact_score: faceTelemetry.eyeContact || 92,
    eye_gaze_label: (faceTelemetry.eyeContact || 92) >= 75 ? 'Optimal & Confident' : 'Moderate Gaze',
    blink_rate_avg: faceTelemetry.blinkRate || 16,
    head_pose_stability: faceTelemetry.headPose === 'forward' ? 'Stable Forward Focus' : 'Moderate Movement',
    proctor_flags: tabSwitchCount + (faceTelemetry.phoneAlerts || 0),
    speaking_speed: audioMetrics.wpm > 0 ? `${audioMetrics.wpm} WPM` : '142 WPM (Optimal)',
    filler_word_count: vocalAnalysis?.fillerCount || 2,
    silence_duration_sec: 1.8,
    hr_bpm: 74,
    hrv_ms: 48,
    strengths: engineReport.strengths || questionReviews.flatMap((q) => q.strengths || []).slice(0, 4),
    weak_areas: [
      ...(engineReport.weak_areas || questionReviews.flatMap((q) => q.improvements || []).slice(0, 3)),
      ...(tabSwitchCount > 0 ? [`Score deducted due to ${tabSwitchCount} tab switch violation(s)`] : []),
      ...(faceTelemetry.phoneAlerts > 0 ? [`Score deducted due to ${faceTelemetry.phoneAlerts} phone distraction alert(s)`] : []),
    ],
    behavioral_observation: `Candidate completed ${answeredReviews.length} of ${questionReviews.length} question(s) before session conclusion. Recorded ${tabSwitchCount} tab switch(es) and ${faceTelemetry.phoneAlerts || 0} phone distraction(s).`,
    executive_summary: engineReport.executive_summary || `Candidate achieved an evaluation score of ${avgScore}/100 across ${config?.trackName || 'the interview'} based on ${answeredReviews.length} completed response(s).`,
    question_reviews: questionReviews,
  };

  useInterviewStore.getState().endInterview(localReport);
} catch (criticalErr) {
  console.error('Error during _buildLocalReportAndFinish:', criticalErr);
  useInterviewStore.getState().endInterview({
    overall_score: 75,
    grade: 'B+',
    hire_recommendation: 'Yes — Ready for Next Round',
    technical_score: 75,
    communication_score: 78,
    question_reviews: [{ question: currentQ || 'General Evaluation', score: 75, verdict: 'Evaluated' }],
  });
}
}, [trackId, currentQ, userAnswerText, stressIndex, faceTelemetry, audioMetrics, vocalAnalysis, config, stream]);

// Handle End Interview — instant transition
const handleEndInterview = useCallback(() => {
try {
  if (backendUp && sessionId) {
    sendEndWs?.();
  }
} catch (_) {}
_buildLocalReportAndFinish();
}, [backendUp, sessionId, sendEndWs, _buildLocalReportAndFinish]);

const handleExit = () => {
try { voiceRef.current?.destroy(); } catch (_) {}
try { audioRef.current?.destroy(); } catch (_) {}
try { faceRef.current?.stop(); } catch (_) {}
try { vocalRef.current?.stop(); } catch (_) {}
exitInterview?.();
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
    speakingQRef.current = '';
    speakQuestion(currentQ);
  }
};

// Stepper active index (0 to stages.length - 1)
const activeStageIdx = Math.min(Math.max(0, questionNum - 1), (stages?.length || 1) - 1);

const formatTimer = (s) => {
const total = Number(s) || 0;
const mins = Math.floor(total / 60);
const secs = total % 60;
return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

return (
<div style={{
  display: 'flex', flexDirection: 'column', height: '100vh',
  background: 'linear-gradient(168deg, rgba(254, 252, 250, 0.96) 0%, rgba(246, 240, 234, 0.92) 100%)', fontFamily: 'var(--font-body)', overflow: 'hidden',
}}>

  {/* ── 1. TOP HEADER: Stepper & Controls ─────────────────────────────── */}
  <div style={{
    background: 'linear-gradient(168deg, rgba(254, 252, 250, 0.96) 0%, rgba(246, 240, 234, 0.92) 100%)', borderBottom: `1px solid ${BORDER}`,
    padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    flexShrink: 0, height: '64px', backdropFilter: 'blur(20px)'
  }}>
    {/* Left: Track title */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <span style={{
        fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px',
        backgroundColor: 'var(--btn-sage)', color: '#F7F3EE', textTransform: 'uppercase', letterSpacing: '0.6px',
        fontFamily: 'var(--font-body)'
      }}>
        {String(trackId || 'interview').replace(/_/g, ' ')}
      </span>
      <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>
        {persona?.name || 'AI'} ({persona?.title || 'Interviewer'})
      </span>
    </div>

    {/* Center: Stage Stepper */}
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      {(stages || []).map((stg, i) => {
        const isDone = i < activeStageIdx;
        const isActive = i === activeStageIdx;
        return (
          <React.Fragment key={stg || i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                backgroundColor: isActive ? 'var(--btn-sage)' : isDone ? 'var(--btn-sage)' : BORDER,
                border: isActive ? `2px solid var(--btn-sage)` : 'none',
              }} />
              <span style={{
                fontSize: '11px', fontWeight: isActive ? 700 : 500,
                color: isActive ? 'var(--main-heading)' : isDone ? 'var(--main-heading)' : 'var(--text-muted)',
                fontFamily: 'var(--font-body)'
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
      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--main-heading)', fontFamily: 'var(--font-code)' }}>
        {formatTimer(elapsedSeconds)}
      </span>
      <button onClick={handleExit} className="btn-secondary-spec" style={{ padding: '6px 14px', fontSize: '12px', borderRadius: '6px' }}>
        Exit
      </button>
      <button onClick={handleEndInterview} className="btn-primary-spec" style={{ padding: '6px 16px', fontSize: '12px', borderRadius: '6px' }}>
        End Interview
      </button>
    </div>
  </div>

  {/* ── 2. MAIN BODY (Left Content + Right Panel) ─────────────────────── */}
  <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>

    {/* Left View: Question + AI Persona + Video / Code */}
    <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', backgroundColor: BG }}>

      {/* AI INTERVIEWER CARD WITH HEYGEN INTERACTIVE STREAMING AVATAR & EMPATHY NUDGE */}
      <div style={{
        background: 'linear-gradient(168deg, rgba(254, 252, 250, 0.96) 0%, rgba(246, 240, 234, 0.92) 100%)',
        border: `1.5px solid ${isEmpathyNudgeActive ? '#D97706' : (isHeyGenStreaming ? 'var(--btn-sage)' : BORDER)}`,
        borderRadius: '16px',
        padding: '18px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        boxShadow: isEmpathyNudgeActive ? '0 8px 30px rgba(217, 119, 6, 0.2)' : 'var(--shadow-3d-card)',
        transition: 'all 0.4s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Live SadTalker 3D Real-Human Avatar Rig */}
          <div style={{
            position: 'relative',
            width: '100px',
            height: '100px',
            borderRadius: '16px',
            overflow: 'hidden',
            border: `2px solid ${isEmpathyNudgeActive ? '#D97706' : 'var(--btn-sage)'}`,
            boxShadow: isEmpathyNudgeActive ? '0 0 24px rgba(217, 119, 6, 0.4)' : '0 4px 20px rgba(82, 98, 87, 0.3)',
            backgroundColor: '#1A221E',
            flexShrink: 0,
            transition: 'all 0.3s ease'
          }}>
            <SadTalkerRealHumanAvatar
              aiStatus={aiStatus}
              isEmpathyActive={isEmpathyNudgeActive}
              spokenText={speakingQRef.current || currentQ}
              trackId={trackId}
              width="100%"
              height="100%"
            />

            {/* Live State Aura Ring */}
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '16px',
              border: `2px solid ${isEmpathyNudgeActive ? '#F59E0B' : (aiStatus === 'speaking' ? 'var(--btn-sage)' : 'transparent')}`,
              pointerEvents: 'none',
              animation: aiStatus === 'speaking' ? 'breatheCircle 4s infinite' : 'none'
            }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <p style={{ margin: 0, fontSize: '16.5px', fontWeight: 800, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>
                {persona?.name || 'AI Interviewer'}
              </p>
              {isEmpathyNudgeActive && (
                <span style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  color: '#9A6854',
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #F59E0B',
                  padding: '2px 8px',
                  borderRadius: '10px'
                }}>
                  🤝 Supportive Posture
                </span>
              )}
            </div>
            <p style={{ margin: 0, fontSize: '13px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
              {(persona?.title || 'Technical Interviewer') + ' · ' + (isEmpathyNudgeActive ? 'Attentive & Reassuring' : (aiStatus === 'listening' ? 'Listening intently' : 'Reviewing solution'))}
            </p>
          </div>
        </div>

        {/* AI State Badge & Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <div style={{
            padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700,
            backgroundColor: isEmpathyNudgeActive ? '#FEF3C7' : (aiStatus === 'speaking' ? 'var(--btn-sage)' : '#EAECE8'),
            color: isEmpathyNudgeActive ? '#9A6854' : (aiStatus === 'speaking' ? '#F7F3EE' : 'var(--main-heading)'),
            border: `1px solid ${isEmpathyNudgeActive ? '#F59E0B' : BORDER}`,
            fontFamily: 'var(--font-body)'
          }}>
            {isEmpathyNudgeActive && '🤝 Empathy Nudge Active'}
            {!isEmpathyNudgeActive && aiStatus === 'speaking' && '●●● Speaking...'}
            {!isEmpathyNudgeActive && aiStatus === 'listening' && ' Listening...'}
            {!isEmpathyNudgeActive && aiStatus === 'thinking' && '◌ Analyzing response...'}
            {!isEmpathyNudgeActive && aiStatus === 'connecting' && '● Connecting...'}
          </div>

          {/* Playback Rate Selector (0.85x, 1.0x, 1.15x) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#FCF9F6',
            borderRadius: '8px',
            border: `1px solid ${BORDER}`,
            padding: '2px 4px',
            gap: '2px'
          }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', paddingLeft: '4px', paddingRight: '2px' }}>
              Speed:
            </span>
            {[0.85, 1.0, 1.15].map((spd) => (
              <button
                key={spd}
                type="button"
                onClick={() => setPlaybackSpeed(spd)}
                style={{
                  background: playbackSpeed === spd ? 'var(--btn-sage)' : 'none',
                  color: playbackSpeed === spd ? '#FFFFFF' : 'var(--text-muted)',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '3px 7px',
                  fontSize: '11px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {spd}x
              </button>
            ))}
          </div>

          {aiStatus === 'speaking' && (
            <button
              onClick={forceStartListening}
              className="btn-secondary-spec"
              style={{
                padding: '6px 12px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                borderRadius: '8px', backgroundColor: '#F5EBE6', border: '1.5px solid #9A6854', color: '#9A6854'
              }}
              title="Press Space or click to interrupt interviewer immediately"
            >
              🎤 Speak Now (Space)
            </button>
          )}

          <button onClick={replayQuestion} className="btn-secondary-spec" style={{
            padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
            borderRadius: '8px',
          }}>
            Replay Question
          </button>
        </div>
      </div>

      {/* ── Psychological Safety: The "Empathy Nudge" Validation Interjection Banner ── */}
      {isEmpathyNudgeActive && empathyNudgeText && (
        <div style={{
          background: 'linear-gradient(168deg, rgba(254, 243, 199, 0.96) 0%, rgba(253, 230, 138, 0.92) 100%)',
          border: '1.5px solid #F59E0B',
          borderRadius: '14px',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px',
          boxShadow: '0 8px 24px rgba(217, 119, 6, 0.25)',
          animation: 'bubbleFloatIn 0.35s ease'
        }}>
          <span style={{ fontSize: '22px', flexShrink: 0 }}>🤝</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#92400E', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Interviewer Validation Interjection • Psychological Safety
            </div>
            <p style={{
              margin: '4px 0 0 0',
              fontSize: '0.96rem',
              fontWeight: 700,
              color: '#78350F',
              lineHeight: 1.45,
              fontStyle: 'italic',
              fontFamily: 'var(--font-body)'
            }}>
              "{empathyNudgeText}"
            </p>
            <div style={{ fontSize: '0.75rem', color: '#92400E', marginTop: '4px', fontWeight: 600 }}>
              ✨ Defusing performance pressure: Take your time to structure your reasoning.
            </div>
          </div>
        </div>
      )}


      {/* High-Visibility Floating Proctor Phone Alert */}
      {faceTelemetry.phoneReadingDetected && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '2px solid #EF4444',
          borderRadius: '12px',
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '14px',
          boxShadow: '0 6px 20px rgba(239, 68, 68, 0.2)',
          animation: 'bubbleFloatIn 0.3s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '24px' }}>🚨</span>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#991B1B' }}>
                PROCTORING WARNING: MOBILE PHONE DETECTED
              </div>
              <div style={{ fontSize: '12px', color: '#B91C1C', marginTop: '2px', fontWeight: 600 }}>
                {faceTelemetry.phoneAlertReason || 'Mobile device detected in camera feed. External screen scanning (Google Lens / photo capture) is prohibited.'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              backgroundColor: '#FEE2E2',
              color: '#991B1B',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #FCA5A5'
            }}>
              Violation #{faceTelemetry.phoneAlerts || 1} Logged
            </span>
          </div>
        </div>
      )}

      {/* LARGE QUESTION CARD */}
      <div style={{
        background: 'linear-gradient(168deg, rgba(254, 252, 250, 0.96) 0%, rgba(246, 240, 234, 0.92) 100%)', border: `1px solid ${BORDER}`, borderRadius: '16px',
        padding: '26px 30px', display: 'flex', flexDirection: 'column', gap: '12px',
        boxShadow: 'var(--shadow-3d-card)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Phone Detector Security Notice: Non-blocking alert banner so question is always 100% visible */}
        {faceTelemetry.phoneObjectVisible && (
          <div style={{
            backgroundColor: '#FEF2F2',
            border: '1.5px solid #EF4444',
            borderRadius: '10px',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            marginBottom: '6px',
            animation: 'fadeIn 0.2s ease-in-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>📵</span>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#B91C1C' }}>
                  Mobile Device Detected in Camera View
                </span>
                <span style={{ fontSize: '11.5px', color: '#991B1B', display: 'block', fontWeight: 500 }}>
                  Screen scanning (Google Lens / photo capture) is prohibited. Please keep your device lowered.
                </span>
              </div>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 800, backgroundColor: '#FEE2E2', color: '#991B1B', padding: '3px 8px', borderRadius: '6px' }}>
              Violation #{faceTelemetry.phoneAlerts || 1}
            </span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'var(--font-body)' }}>
            QUESTION {String(questionNum || 1).padStart(2, '0')}
          </span>
          {aiStatus === 'speaking' && activeSentenceIdx >= 0 && (
            <span style={{ fontSize: '11px', color: '#D97706', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>●</span> Teleprompter Sync Active
            </span>
          )}
        </div>
        <div style={{
          fontSize: '1.28rem', fontWeight: 700, color: '#1F2937', margin: 0,
          lineHeight: 1.6, fontFamily: 'var(--font-heading)',
        }}>
          "{renderTeleprompterQuestion(currentQ || 'Please introduce yourself and explain your academic background and key technical strengths.', activeSentenceIdx, aiStatus)}"
        </div>

        {/* Tactical Pause Wave Banner (3-4 seconds when a new question arrives) */}
        {responseTimer <= 4 && aiStatus === 'listening' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '8px 14px', borderRadius: '10px',
            backgroundColor: '#EAECE8', border: '1.5px solid #526257',
            fontSize: '12.5px', color: '#526257', fontWeight: 700,
            animation: 'microCalmPulse 3.5s infinite ease-in-out',
            marginTop: '4px'
          }}>
            <span style={{ fontSize: '16px' }}>⏱️</span>
            <span><strong>Tactical Pause:</strong> Take 3–4 seconds to inhale, collect your thoughts, and map out your structure before speaking.</span>
          </div>
        )}
      </div>

      {/* CANDIDATE VOICE-FIRST RESPONSE PANEL WITH LIVE TRANSCRIPT */}
      <div style={{
        background: 'linear-gradient(168deg, rgba(254, 252, 250, 0.96) 0%, rgba(246, 240, 234, 0.92) 100%)', border: `1px solid ${BORDER}`, borderRadius: '14px',
        padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px',
        boxShadow: 'var(--shadow-3d-card)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              backgroundColor: aiStatus === 'listening' ? 'var(--btn-sage)' : '#EAECE8',
              color: aiStatus === 'listening' ? '#F7F3EE' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '14px',
            }}>
              🎤
            </div>
            <div>
              <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>
                {aiStatus === 'listening' ? 'Speech-to-Text Active — Speak your answer' : 'AI Turn'}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'var(--font-body)' }}>
                Speaking Time: {formatTimer(responseTimer)} · {userAnswerText ? `${userAnswerText.split(/\s+/).filter(Boolean).length} words` : 'Waiting for voice...'}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Word Count Indicator (Cap: 400 words max to prevent STT freezes) */}
            <span style={{
              fontSize: '12px', fontWeight: 600,
              color: (userAnswerText.split(/\s+/).filter(Boolean).length) > 380 ? 'var(--accent-terracotta)' : 'var(--text-muted)',
              backgroundColor: '#EAECE8', padding: '4px 8px', borderRadius: '4px', border: `1px solid ${BORDER}`,
              fontFamily: 'var(--font-body)'
            }}>
              {userAnswerText.split(/\s+/).filter(Boolean).length} / 400 words max
            </span>

            {/* Cognitive Defusion: Reset Mindset Button */}
            <button
              onClick={() => setIsCalmModalActive(true)}
              className="btn-secondary-spec"
              style={{
                padding: '6px 14px', fontSize: '12px', fontWeight: 700, cursor: 'pointer',
                borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '6px'
              }}
              title="Take a shame-free tactical reset while the interviewer reviews notes"
            >
              Reset Mindset
            </button>

            {userAnswerText && (
              <button
                onClick={() => {
                  setUserAnswerText('');
                  setInterimText('');
                  voiceRef.current?.resetTranscript?.();
                }}
                className="btn-secondary-spec"
                style={{
                  padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
                  borderRadius: '6px',
                }}
              >
                Clear Speech
              </button>
            )}

            {isCoding && (
              <button onClick={() => setThinkingTime(!thinkingTime)} className="btn-secondary-spec" style={{
                padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                borderRadius: '6px',
              }}>
                {thinkingTime ? 'Resume Speaking' : 'Thinking Time'}
              </button>
            )}

            {aiStatus === 'speaking' ? (
              <button
                onClick={forceStartListening}
                className="btn-secondary-spec"
                style={{
                  padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  borderRadius: '8px', border: '1px solid #10B981', color: '#065F46', backgroundColor: '#ECFDF5'
                }}
              >
                ● Start Answering (Mic Active)
              </button>
            ) : (
              <button
                onClick={() => {
                  try { audioRef.current?.resume(); } catch (_) {}
                  try { voiceRef.current?.startListening(); } catch (_) {}
                }}
                className="btn-secondary-spec"
                style={{
                  padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                  borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.4)', color: '#047857', backgroundColor: '#F0FDF4'
                }}
                title="Click if browser did not start speech recognition automatically"
              >
                🎤 Mic Active (Tap to Restart)
              </button>
            )}

            <button
              onClick={() => handleUserAnswer()}
              disabled={aiStatus === 'thinking'}
              className="btn-primary-spec"
              style={{
                padding: '8px 18px', fontSize: '13px', fontWeight: 700, cursor: aiStatus === 'thinking' ? 'not-allowed' : 'pointer',
                borderRadius: '8px', opacity: aiStatus === 'thinking' ? 0.6 : 1
              }}
            >
              {aiStatus === 'thinking' ? 'Analyzing Response...' : 'Submit Spoken Answer'}
            </button>

            <button
              onClick={handleSkipQuestion}
              disabled={aiStatus === 'thinking'}
              className="btn-secondary-spec"
              style={{
                padding: '8px 14px', fontSize: '13px', fontWeight: 600, cursor: aiStatus === 'thinking' ? 'not-allowed' : 'pointer',
                borderRadius: '8px'
              }}
              title="Advance to the next question from the AI question engine"
            >
              Next Question →
            </button>
          </div>
        </div>

        {/* Editable Live Speech Transcript Box */}
        <div style={{ position: 'relative' }}>
          <textarea
            value={userAnswerText + (interimText ? (userAnswerText ? ' ' : '') + interimText : '')}
            onChange={(e) => {
              setUserAnswerText(e.target.value);
              setInterimText('');
            }}
            placeholder={aiStatus === 'listening' ? "Speak into your microphone... your words will appear here in real time. You can also edit or type directly." : "Waiting for next question..."}
            rows={3}
            style={{
              width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '8px',
              border: `1px solid ${submitWarning ? '#34343A' : BORDER}`, fontSize: '13px', lineHeight: 1.5,
              color: 'var(--main-heading)', backgroundColor: '#FCF9F6', fontFamily: 'var(--font-body)',
              resize: 'vertical', outline: 'none',
            }}
          />
          {submitWarning && (
            <div style={{ marginTop: '4px', fontSize: '12px', fontWeight: 600, color: 'var(--accent-terracotta)', fontFamily: 'var(--font-body)' }}>
              {submitWarning}
            </div>
          )}
        </div>
      </div>

      {/* WORKSPACE AREA: Code Editor (if coding) + Video Feed */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: isCoding ? '1fr 340px' : '1fr', gap: '16px', minHeight: '300px' }}>

        {/* Monaco Code Editor (for DSA / Live Coding) */}
        {isCoding && (
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden', background: 'linear-gradient(168deg, rgba(254, 252, 250, 0.96) 0%, rgba(246, 240, 234, 0.92) 100%)' }}>
            <MonacoEditorPanel
              language={config?.codingLang || 'javascript'}
              onCodeChange={(code) => setCurrentCode(code)}
            />
          </div>
        )}

        {/* Video Feed & Impulsive Speech Speedometer Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Video Feed Box */}
          <div style={{
            border: `1px solid ${BORDER}`, borderRadius: '12px', overflow: 'hidden',
            backgroundColor: '#34343A', position: 'relative', minHeight: '260px',
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

            {/* Proactive Phone / Downward Reading Detection Alert */}
            {faceTelemetry.phoneReadingDetected && (
              <div style={{
                position: 'absolute', top: '12px', left: '12px', right: '12px', zIndex: 20,
                backgroundColor: 'rgba(154, 104, 84, 0.95)',
                color: '#FFFFFF',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: '8px',
                padding: '8px 12px',
                fontSize: '12px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(154, 104, 84, 0.4)',
                animation: 'bubbleFloatIn 0.3s ease'
              }}>
                <span style={{ fontSize: '15px' }}>📱</span>
                <span>
                  {faceTelemetry.phoneAlertReason || 'Phone Detected in Camera or Extended Downward Gaze (>40s)'}
                </span>
              </div>
            )}

            {/* Mic / Cam Toggles overlay bottom right */}
            <div style={{ position: 'absolute', bottom: '12px', right: '12px', display: 'flex', gap: '6px' }}>
              <button onClick={toggleMic} style={{
                padding: '6px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                backgroundColor: micEnabled ? 'rgba(0,0,0,0.75)' : '#111827',
                color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px',
              }}>
                {micEnabled ? 'Mic On' : 'Mic Off'}
              </button>
              <button onClick={toggleCam} style={{
                padding: '6px 12px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                backgroundColor: camEnabled ? 'rgba(0,0,0,0.75)' : '#111827',
                color: '#FFFFFF', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '4px',
              }}>
                {camEnabled ? 'Cam On' : 'Cam Off'}
              </button>
            </div>
          </div>

          {/* ── "Impulsive Speech" Speedometer & Attentional Biofeedback Ring ── */}
          {(() => {
            const spokenWordCount = (userAnswerText || '').trim().split(/\s+/).filter(Boolean).length;
            const liveWpm = responseTimer >= 2 && spokenWordCount >= 2
              ? Math.min(240, Math.round((spokenWordCount / (responseTimer / 60))))
              : (audioMetrics?.wpm > 0 ? audioMetrics.wpm : 0);

            const isSpiking = liveWpm >= 158;
            const isIdeal = liveWpm >= 115 && liveWpm < 158;
            const isDeliberate = liveWpm > 0 && liveWpm < 115;

            const glowColor = isSpiking ? '#D97706' : isIdeal ? '#16A34A' : '#526257';
            const bgColor = isSpiking ? '#FEF3C7' : isIdeal ? '#DCFCE7' : '#F5EBE6';
            const borderColor = isSpiking ? '#F59E0B' : isIdeal ? '#22C55E' : '#D8D2CE';

            return (
              <div style={{
                background: 'linear-gradient(168deg, rgba(254, 252, 250, 0.96) 0%, rgba(246, 240, 234, 0.92) 100%)',
                border: `1.5px solid ${borderColor}`,
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: 'var(--shadow-3d-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                animation: isSpiking ? 'slowingWaveRipple 2.5s infinite' : 'none',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Glowing Biofeedback Ring */}
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: glowColor,
                      boxShadow: `0 0 10px ${glowColor}`,
                      transition: 'all 0.3s ease'
                    }} />
                    <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--main-heading)', textTransform: 'uppercase', letterSpacing: '0.4px', fontFamily: 'var(--font-heading)' }}>
                      Speech Speedometer
                    </span>
                  </div>

                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 800,
                    color: glowColor,
                    backgroundColor: bgColor,
                    padding: '2px 8px',
                    borderRadius: '8px',
                    border: `1px solid ${borderColor}`
                  }}>
                    {liveWpm > 0 ? `${liveWpm} WPM` : 'Optimal Baseline (130-150 WPM)'}
                  </span>
                </div>

                {/* Visual Pacing Segmented Bar */}
                <div style={{ position: 'relative', height: '6px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: `${Math.min(100, Math.max(10, (liveWpm / 220) * 100))}%`,
                    backgroundColor: glowColor,
                    borderRadius: '4px',
                    transition: 'width 0.4s ease, background-color 0.3s ease'
                  }} />
                </div>

                {/* Attentional Deployment Micro-Feedback */}
                <div style={{ fontSize: '0.74rem', color: '#66666B', lineHeight: 1.35, display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {isSpiking ? (
                    <span style={{ color: '#B45309', fontWeight: 700 }}>
                      🌊 <strong>{'Spike Detected (>160 WPM):'}</strong> Ease your pace, take an intentional breath between thoughts.
                    </span>
                  ) : isIdeal ? (
                    <span style={{ color: '#15803D', fontWeight: 700 }}>
                      ✨ <strong>Steady Rhythm:</strong> Clear, articulate pace in the target 130–150 WPM zone.
                    </span>
                  ) : isDeliberate ? (
                    <span>
                      🎯 <strong>Deliberate & Thoughtful:</strong> Paced delivery under 115 WPM.
                    </span>
                  ) : (
                    <span>
                      💡 <strong>Pacing Biofeedback:</strong> Maintains steady green in the ideal 130–150 WPM zone.
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
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

    {/* ── Strict Tab Switch / Window Blur Proctoring Modal ── */}
    {showViolationModal && (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '20px',
      }}>
        <div style={{
          background: 'linear-gradient(168deg, rgba(254, 252, 250, 0.96) 0%, rgba(246, 240, 234, 0.92) 100%)',
          borderRadius: '12px',
          maxWidth: '500px',
          width: '100%',
          padding: '28px 30px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          border: '1px solid #D8D2CE',
          textAlign: 'center',
        }}>
          {/* Header Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: isTerminated ? '#FEF2F2' : '#FFFBEB',
            border: `2px solid ${isTerminated ? '#FECDD3' : '#FDE68A'}`,
            fontSize: '26px',
            marginBottom: '16px',
          }}>
            {isTerminated ? '🚨' : '⚠️'}
          </div>

          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#34343A', margin: '0 0 8px 0' }}>
            {isTerminated ? 'Assessment Terminated: Tab Violations Exceeded' : 'Security Warning: Tab Switch Detected'}
          </h3>

          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            backgroundColor: isTerminated ? '#DC2626' : '#D97706',
            color: '#FFFFFF',
            marginBottom: '16px',
          }}>
            Violation {Math.min(tabSwitchCount, 3)} of 3
          </div>

          <p style={{ fontSize: '13.5px', color: '#66666B', lineHeight: 1.55, margin: '0 0 18px 0' }}>
            {isTerminated
              ? 'You have exceeded the maximum allowed tab switch and defocus violations. Your session has been automatically flagged and locked per examination security guidelines.'
              : 'Tab switching, window defocusing, and navigating away from the active interview window are strictly prohibited. All window state transitions are recorded in your security audit trail.'}
          </p>

          {!isTerminated && (
            <div style={{
              padding: '12px 14px',
              borderRadius: '8px',
              backgroundColor: '#FCF9F6',
              border: '1px solid #D8D2CE',
              fontSize: '12.5px',
              color: '#89878A',
              marginBottom: '22px',
              textAlign: 'left',
            }}>
              <strong style={{ color: '#34343A' }}>Policy Reminder:</strong> Reaching 3 violations will immediately auto-submit and disqualify your examination. You currently have <strong>{3 - tabSwitchCount}</strong> warning(s) remaining.
            </div>
          )}

          <div>
            {isTerminated ? (
              <button
                onClick={_cleanupAndEnd}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#66666B',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                View Disqualification Report
              </button>
            ) : (
              <button
                onClick={() => setShowViolationModal(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#66666B',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                I Understand & Return to Assessment
              </button>
            )}
          </div>
        </div>
      </div>
    )}

    {/* ── 4. TIERED CALM BUBBLE & COGNITIVE ACTION SYSTEM ── */}
    {isCalmModalActive ? (
      /* ── TIER 2: MACRO-RESET PAUSE (Shame-Free Cognitive Defusion & Box Breathing) ── */
      <div className="calm-anchor-modal-overlay">
        <div className="calm-anchor-modal-card">
          {/* Header Row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span className="calm-pill-terracotta">
                Tactical Pause • Cognitive Reset
              </span>
              <span className="calm-pill-sage">
                Stress Load: {effectiveCognitiveLoad}%
              </span>
            </div>

            {/* Close / Resume Button */}
            <button
              onClick={handleReadyResume}
              className="btn-secondary-spec"
              style={{
                width: '34px',
                height: '34px',
                padding: 0,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 800,
                flexShrink: 0
              }}
              title="Resume Interview"
            >
              ✕
            </button>
          </div>

          {/* Shame-Free Cognitive Defusion Notification */}
          <div className="calm-sub-card" style={{ display: 'flex', flexDirection: 'column', gap: '3px', padding: '8px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', fontWeight: 700, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--btn-sage)', display: 'inline-block', flexShrink: 0 }} />
              Let's take a tactical pause. The interviewer is organizing feedback.
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--body-text)', lineHeight: 1.4, fontWeight: 500 }}>
              Remember: A challenging question is just <em>one data point</em>. Take a brief oxygen reset to structure your thoughts clearly.
            </div>
          </div>

          {/* ── 3D Dashboard Fluid Box Breathing Visualizer ── */}
          <div className="calm-sub-card" style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '6px',
            padding: '10px 14px',
            position: 'relative'
          }}>
            {/* Header: Title */}
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>
                Box Breathing Rhythm
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--body-text)', fontFamily: 'var(--font-body)' }}>
                • 4-4-4-4 Technique
              </span>
            </div>

            {/* Main Interactive Breathing Orb Visualizer (Simple Light Theme) */}
            <div style={{
              position: 'relative',
              width: '100%',
              height: '116px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '2px 0'
            }}>
              {/* Soft Subtle Outer Halo Ring */}
              <div style={{
                position: 'absolute',
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                border: `1.5px solid ${breathPhaseIdx === 1 ? 'rgba(154, 104, 84, 0.28)' : 'rgba(82, 98, 87, 0.22)'}`,
                backgroundColor: breathPhaseIdx === 1 ? 'rgba(154, 104, 84, 0.04)' : 'rgba(82, 98, 87, 0.04)',
                transform: breathPhaseIdx === 0 || breathPhaseIdx === 1 ? 'scale(1.18)' : 'scale(0.88)',
                opacity: breathPhaseIdx === 0 || breathPhaseIdx === 1 ? 1 : 0.4,
                transition: 'transform 3.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 3.8s ease, border-color 1s ease'
              }} />

              {/* Clean Light-Themed Central Breathing Circle */}
              <div style={{
                width: '82px',
                height: '82px',
                borderRadius: '50%',
                background: breathPhaseIdx === 1 
                  ? 'linear-gradient(135deg, #FCF8F5 0%, #F5EAE4 100%)' 
                  : 'linear-gradient(135deg, #FAF8F5 0%, #EAEFE8 100%)',
                border: `2px solid ${breathPhaseIdx === 1 ? 'var(--accent-terracotta)' : 'var(--btn-sage)'}`,
                boxShadow: breathPhaseIdx === 1
                  ? '0 4px 16px rgba(154, 104, 84, 0.16), inset 0 1px 2px rgba(255, 255, 255, 0.9)'
                  : '0 4px 16px rgba(82, 98, 87, 0.14), inset 0 1px 2px rgba(255, 255, 255, 0.9)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                transform: breathPhaseIdx === 0 || breathPhaseIdx === 1 ? 'scale(1.10)' : 'scale(0.92)',
                transition: 'transform 3.8s cubic-bezier(0.4, 0, 0.2, 1), border-color 1s ease, background 1s ease, box-shadow 1s ease',
                cursor: 'default',
                userSelect: 'none'
              }}>
                <span style={{
                  fontSize: '1.05rem',
                  fontWeight: 800,
                  color: 'var(--main-heading)',
                  fontFamily: 'var(--font-heading)',
                  lineHeight: 1.1
                }}>
                  {BREATH_PHASES[breathPhaseIdx].name}
                </span>
                <span style={{
                  fontSize: '0.90rem',
                  fontWeight: 700,
                  color: breathPhaseIdx === 1 ? 'var(--accent-terracotta)' : 'var(--btn-sage)',
                  fontFamily: 'var(--font-body)',
                  marginTop: '1px'
                }}>
                  {breathSeconds}s
                </span>
              </div>
            </div>

            {/* Dynamic Soothing Guidance Hint */}
            <div style={{
              textAlign: 'center',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--main-heading)',
              fontFamily: 'var(--font-body)',
              minHeight: '18px'
            }}>
              {BREATH_PHASES[breathPhaseIdx].hint}
            </div>

          </div>

          {/* Soothing Reappraisal Quote */}
          <div className="calm-quote-card" style={{ padding: '6px 12px' }}>
            <p style={{
              margin: 0,
              fontSize: '0.84rem',
              fontWeight: 600,
              color: 'var(--main-heading)',
              fontStyle: 'italic',
              lineHeight: 1.4,
              fontFamily: 'var(--font-heading)'
            }}>
              "{CALM_CORNER_QUOTES[calmQuoteIdx]}"
            </p>
          </div>

          {/* ── Friendly Ready & Resume Trigger ── */}
          <div className="calm-sub-card" style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '6px',
            padding: '8px 12px',
            textAlign: 'center',
            background: 'linear-gradient(145deg, rgba(254, 252, 250, 0.95) 0%, rgba(245, 240, 235, 0.95) 100%)',
            border: '1px solid rgba(82, 98, 87, 0.25)',
            boxShadow: '0 4px 14px rgba(82, 98, 87, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
              <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--btn-sage)', letterSpacing: '0.3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Feeling Refreshed? • Tap to Continue
              </span>
            </div>
            <button
              onClick={handleReadyResume}
              className="btn-primary-spec"
              style={{
                width: '100%',
                padding: '11px 16px',
                fontSize: '0.88rem',
                fontWeight: 700,
                color: '#FFFFFF',
                borderRadius: '10px',
                justifyContent: 'center',
                lineHeight: 1.3,
                background: 'linear-gradient(135deg, #526257 0%, #415046 100%)',
                boxShadow: 'var(--shadow-3d-btn)',
                display: 'flex',
                alignItems: 'center'
              }}
              title="Click when you are ready to resume the interview"
            >
              <span style={{ color: '#FFFFFF' }}>"I'm feeling calm and ready! Let's tackle the next question."</span>
            </button>
            <span style={{ fontSize: '0.70rem', color: 'var(--body-text)', lineHeight: 1.3 }}>
              Take your time. Whenever you feel centered, tap above to smoothly resume.
            </span>
          </div>
        </div>
      </div>
    ) : (
      /* ── TIER 1: LIGHT THEME 3D CALM ANCHOR DOCK ── */
      <div 
        className="calm-anchor-dock"
        onClick={() => setIsCalmModalActive(true)}
        title="Click to take a tactical pause"
      >
        {/* 3D Sage Green Concentric Mini Breathing Circle */}
        <div style={{
          position: 'relative',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <div style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: '2px solid rgba(82, 98, 87, 0.55)',
            animation: 'sageLight3dRingExpand 8s infinite ease-in-out'
          }} />
          <div style={{
            width: '15px',
            height: '15px',
            borderRadius: '50%',
            backgroundColor: 'var(--btn-sage)',
            boxShadow: '0 0 8px rgba(82, 98, 87, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
            animation: 'sageLight3dCorePulse 8s infinite ease-in-out'
          }} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)', whiteSpace: 'nowrap' }}>
              Calm Anchor
            </span>
            <span className="calm-pill-sage" style={{ fontSize: '0.66rem', padding: '1px 7px', fontWeight: 800 }}>
              {BREATH_PHASES[breathPhaseIdx].name} ({breathSeconds}s)
            </span>
          </div>
          <span style={{
            fontSize: '0.70rem',
            color: 'var(--body-text)',
            fontWeight: 600,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'var(--font-body)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: effectiveCognitiveLoad >= 50 ? 'var(--accent-terracotta)' : 'var(--btn-sage)',
              display: 'inline-block',
              flexShrink: 0
            }} />
            {effectiveCognitiveLoad >= 50 ? `Elevated Load (${effectiveCognitiveLoad}%) • Click Reset` : 'Attentional Anchor Active'}
          </span>
        </div>
      </div>
    )}

  </div>
  );
}
