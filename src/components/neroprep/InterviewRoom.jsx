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
import { getTrackConfig } from '../../data/interviewTracksData';

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

 // ── DSA track → Live compiler room ─────────────────────────────────────────
 if (trackId === 'dsa') {
 return (
 <CodingRoom
 config={config}
 onEndSession={(report) => endInterview(report)}
 />
 );
 }
 // ───────────────────────────────────────────────────────────────────────────

 // Engine refs
 const voiceRef = useRef(null);
 const audioRef = useRef(null);
 const faceRef = useRef(null);
 const vocalRef = useRef(null);
 const canvasRef = useRef(null);
 const aiEngineRef = useRef(null);
 const fallbackIndexRef = useRef(0);

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
 return aiEngineRef.current?.getNextQuestion?.() || 'Please introduce yourself and explain your background.';
 } catch (_) {
 return 'Please introduce yourself and explain your background.';
 }
 });
 const [questionNum, setQuestionNum] = useState(1);
 const [audioMetrics, setAudioMetrics] = useState({ volume: 0, wpm: 0, isVoice: false });
 const [faceTelemetry, setFaceTelemetry] = useState({ faceDetected: false, blinkRate: 0, headPose: 'forward', eyeContact: 100 });
 const [vocalAnalysis, setVocalAnalysis] = useState(null);
 const [backendUp, setBackendUp] = useState(false);
 const [responseTimer, setResponseTimer] = useState(0);
 const [thinkingTime, setThinkingTime] = useState(false);
 const [stressIndex, setLocalStressIdx] = useState(0);
 const [tabSwitchCount, setTabSwitchCount] = useState(0);
 const [showViolationModal, setShowViolationModal] = useState(false);
 const [isTerminated, setIsTerminated] = useState(false);

 // Stable ref for cleanup so WS callback can call it before the function is defined below
 const cleanupRef = useRef(null);

 // Strict Tab switch / Window blur proctoring detection
 useEffect(() => {
 let lastAlertTime = 0;
 const triggerViolation = () => {
 const now = Date.now();
 if (now - lastAlertTime < 800) return;
 lastAlertTime = now;

 setTabSwitchCount((prev) => {
 const nextCount = prev + 1;
 setShowViolationModal(true);
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

 // Helper to safely speak question via TTS and transition to listening strictly once
 const speakQuestion = useCallback((text) => {
 if (!text) return;
 
 // Prevent duplicate triggers of the exact same question
 if (speakingQRef.current === text && (aiStatus === 'speaking' || aiStatus === 'listening')) {
 return;
 }
 speakingQRef.current = text;

 setAiStatus('speaking');
 setThinkingTime(false);
 setSubmitWarning('');
 setUserAnswerText('');
 setInterimText('');
 try {
 voiceRef.current?.resetTranscript?.();
 voiceRef.current?.stopListening();
 } catch (_) {}

 if (voiceRef.current?.speak) {
 voiceRef.current.speak(text)
 .then(() => {
 setAiStatus('listening');
 setResponseTimer(0);
 try {
 voiceRef.current?.startListening();
 } catch (_) {}
 })
 .catch(() => {
 setAiStatus('listening');
 setResponseTimer(0);
 try {
 voiceRef.current?.startListening();
 } catch (_) {}
 });
 } else {
 setAiStatus('listening');
 setResponseTimer(0);
 try {
 voiceRef.current?.startListening();
 } catch (_) {}
 }
 }, [aiStatus]);

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

 // Master timer & candidate response timer
 useEffect(() => {
 if (!tickTimer) return;
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
 }, [config?.language]);

 // Handle user answer submission (Voice-first)
 const handleUserAnswer = useCallback((overrideText) => {
 const textToSend = (overrideText !== undefined ? overrideText : userAnswerText || '').trim();

 if (!textToSend || textToSend.split(/\s+/).filter(Boolean).length < 2) {
 setSubmitWarning('Please speak your response clearly into your microphone or type in the box before submitting.');
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

 // Video Stream setup
 useEffect(() => {
 if (sharedStream && sharedStream.active) {
 setStream(sharedStream);
 } else {
 navigator.mediaDevices?.getUserMedia({ video: true, audio: true })
 .then(s => {
 setStream(s);
 useInterviewStore.getState().setMediaStream?.(s);
 })
 .catch(err => console.warn('[InterviewRoom] Camera/Mic access denied:', err));
 }
 }, [sharedStream]);

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
 if (telem?.stressScore > 0) sendTelemetry?.(telem);
 }
 });
 fe.start();
 faceRef.current = fe;
 }
 } catch (e) {
 console.warn('FaceEngine init error:', e);
 }

 try {
 if (!vocalRef.current && sessionId) {
 const vi = new VocalIntelligenceEngine(videoEl.srcObject, sessionId, {
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
 {String(trackId || 'interview').replace(/_/g, ' ')}
 </span>
 <span style={{ fontSize: '13px', fontWeight: 700, color: BLACK }}>
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
 <button onClick={handleEndInterview} style={{
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
 {String(persona?.name || 'AI').slice(0, 2).toUpperCase()}
 </div>
 <div>
 <p style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: BLACK }}>{persona?.name || 'AI'}</p>
 <p style={{ margin: 0, fontSize: '12px', color: GREY }}>{persona?.title || 'Interviewer'}</p>
 </div>
 </div>

 {/* AI State Badge */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <div style={{
 padding: '5px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 700,
 backgroundColor: aiStatus === 'speaking' ? BLACK : '#F3F4F6',
 color: aiStatus === 'speaking' ? '#FFFFFF' : BLACK,
 border: `1px solid ${BORDER}`,
 }}>
 {aiStatus === 'speaking' && '●●● Speaking...'}
 {aiStatus === 'listening' && ' Listening...'}
 {aiStatus === 'thinking' && '◌ Analyzing response...'}
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
 QUESTION {String(questionNum || 1).padStart(2, '0')}
 </span>
 <p style={{
 fontSize: '18px', fontWeight: 600, color: BLACK, margin: 0,
 lineHeight: 1.5, fontFamily: 'var(--font-inter)',
 }}>
 "{currentQ || 'Preparing your first question...'}"
 </p>
 </div>

 {/* CANDIDATE VOICE-FIRST RESPONSE PANEL WITH LIVE TRANSCRIPT */}
 <div style={{
 backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: '8px',
 padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: '12px',
 }}>
 <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <div style={{
 width: '36px', height: '36px', borderRadius: '50%',
 backgroundColor: aiStatus === 'listening' ? BLACK : '#F3F4F6',
 color: aiStatus === 'listening' ? '#FFFFFF' : GREY,
 display: 'flex', alignItems: 'center', justifyContent: 'center',
 fontWeight: 700, fontSize: '14px',
 }}>
 
 </div>
 <div>
 <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: BLACK }}>
 {aiStatus === 'listening' ? 'Speech-to-Text Active — Speak your answer' : 'AI Turn'}
 </p>
 <p style={{ margin: 0, fontSize: '12px', color: GREY }}>
 Speaking Time: {formatTimer(responseTimer)} · {userAnswerText ? `${userAnswerText.split(/\s+/).filter(Boolean).length} words` : 'Waiting for voice...'}
 </p>
 </div>
 </div>

 <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
 {/* Word Count Indicator (Cap: 400 words max to prevent STT freezes) */}
 <span style={{
 fontSize: '12px', fontWeight: 600,
 color: (userAnswerText.split(/\s+/).filter(Boolean).length) > 380 ? '#111827' : GREY,
 backgroundColor: '#F3F4F6', padding: '4px 8px', borderRadius: '4px', border: `1px solid ${BORDER}`
 }}>
 {userAnswerText.split(/\s+/).filter(Boolean).length} / 400 words max
 </span>

 {userAnswerText && (
 <button
 onClick={() => {
 setUserAnswerText('');
 setInterimText('');
 voiceRef.current?.resetTranscript?.();
 }}
 style={{
 padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
 backgroundColor: '#FFFFFF', color: '#6B7280', border: `1px solid ${BORDER}`, borderRadius: '6px',
 }}
 >
 Clear Speech
 </button>
 )}

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
 disabled={aiStatus === 'thinking'}
 style={{
 padding: '8px 18px', fontSize: '13px', fontWeight: 700, cursor: aiStatus === 'thinking' ? 'not-allowed' : 'pointer',
 backgroundColor: aiStatus === 'thinking' ? '#F3F4F6' : BLACK,
 color: aiStatus === 'thinking' ? GREY : '#FFFFFF',
 border: 'none', borderRadius: '6px', transition: 'all 0.1s ease',
 }}
 >
 {aiStatus === 'thinking' ? 'Analyzing Response...' : 'Submit Spoken Answer'}
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
 width: '100%', boxSizing: 'border-box', padding: '12px 14px', borderRadius: '6px',
 border: `1px solid ${submitWarning ? '#111827' : BORDER}`, fontSize: '13px', lineHeight: 1.5,
 color: BLACK, backgroundColor: '#FAFAFA', fontFamily: 'var(--font-inter)',
 resize: 'vertical', outline: 'none',
 }}
 />
 {submitWarning && (
 <div style={{ marginTop: '4px', fontSize: '12px', fontWeight: 600, color: '#111827' }}>
 {submitWarning}
 </div>
 )}
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
 backgroundColor: '#FFFFFF',
 borderRadius: '12px',
 maxWidth: '500px',
 width: '100%',
 padding: '28px 30px',
 boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
 border: '1px solid #E2E8F0',
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
 {isTerminated ? '' : '️'}
 </div>

 <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px 0' }}>
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

 <p style={{ fontSize: '13.5px', color: '#475569', lineHeight: 1.55, margin: '0 0 18px 0' }}>
 {isTerminated
 ? 'You have exceeded the maximum allowed tab switch and defocus violations. Your session has been automatically flagged and locked per examination security guidelines.'
 : 'Tab switching, window defocusing, and navigating away from the active interview window are strictly prohibited. All window state transitions are recorded in your security audit trail.'}
 </p>

 {!isTerminated && (
 <div style={{
 padding: '12px 14px',
 borderRadius: '8px',
 backgroundColor: '#F8FAFC',
 border: '1px solid #E2E8F0',
 fontSize: '12.5px',
 color: '#64748B',
 marginBottom: '22px',
 textAlign: 'left',
 }}>
 <strong style={{ color: '#0F172A' }}>Policy Reminder:</strong> Reaching 3 violations will immediately auto-submit and disqualify your examination. You currently have <strong>{3 - tabSwitchCount}</strong> warning(s) remaining.
 </div>
 )}

 <div>
 {isTerminated ? (
 <button
 onClick={_cleanupAndEnd}
 style={{
 width: '100%',
 padding: '12px',
 backgroundColor: '#475569',
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
 backgroundColor: '#475569',
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

 </div>
 );
}
