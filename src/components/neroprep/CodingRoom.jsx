import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { executeCodeOnline } from '../../services/compilerService';
import { getProblemData } from '../../data/problemData';
import { DSA_CATEGORIES } from '../../data/dsaPatternsData';
import useInterviewStore from '../../store/interviewStore';
import { DSAScoringEngine } from './engines/DSAScoringEngine';
import CodingFeedback from './CodingFeedback';
import VideoFeed from './VideoFeed';
import { FaceEngine } from './engines/FaceEngine';
import { CodeIntegrityModel } from './engines/CodeIntegrityModel';

// ── Collect all 396 DSA Pattern Sheet Questions ─────────────────────────────
const ALL_DSA_PATTERN_QUESTIONS = [];
DSA_CATEGORIES.forEach((cat) => {
 cat.patterns.forEach((pat) => {
 pat.questions.forEach((q) => {
 ALL_DSA_PATTERN_QUESTIONS.push({
 ...q,
 patternId: pat.id,
 patternName: pat.name,
 patternDescription: pat.description,
 categoryId: cat.id,
 categoryName: cat.name,
 complexity: pat.complexity || { time: 'O(N)', space: 'O(1)' },
 });
 });
 });
});

// ── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
 bg: '#FFFFFF',
 bgPage: '#F9FAFB',
 bgCard: '#F3F4F6',
 border: '#E5E7EB',
 borderDark: '#D1D5DB',
 textMain: '#111827',
 textBody: '#374151',
 textMuted: '#6B7280',
 textLight: '#9CA3AF',
 btnGrey: '#475569',
 btnGreyHover: '#334155',
 mono: 'JetBrains Mono, Consolas, monospace',
 sans: 'Inter, system-ui, sans-serif',
};

const LANGS = ['Python', 'Java', 'C++', 'JavaScript'];
const LANG_KEY = { Python: 'python', Java: 'java', 'C++': 'cpp', JavaScript: 'javascript' };
const LANG_CODE_KEY = { Python: 'Python', Java: 'Java', 'C++': 'Cpp', JavaScript: 'JavaScript' };

// ── Timer Component ──────────────────────────────────────────────────────────
function ProblemTimer({ limitMinutes, currentIdx, onExpire }) {
 const [secs, setSecs] = useState(limitMinutes * 60);
 const onExpireRef = useRef(onExpire);
 onExpireRef.current = onExpire;

 // Reset timer on problem change
 useEffect(() => {
 setSecs(limitMinutes * 60);
 }, [limitMinutes, currentIdx]);

 useEffect(() => {
 const timer = setInterval(() => {
 setSecs((prev) => {
 if (prev <= 1) {
 clearInterval(timer);
 onExpireRef.current?.();
 return 0;
 }
 return prev - 1;
 });
 }, 1000);

 return () => clearInterval(timer);
 }, [limitMinutes, currentIdx]);

 const m = Math.floor(secs / 60).toString().padStart(2, '0');
 const s = (secs % 60).toString().padStart(2, '0');
 const isWarn = secs < 120;

 return (
 <span style={{
 fontFamily: C.mono,
 fontSize: '13px',
 fontWeight: 700,
 color: isWarn ? '#B45309' : C.textMain,
 padding: '4px 10px',
 borderRadius: '6px',
 backgroundColor: isWarn ? '#FFFBEB' : '#F1F5F9',
 border: `1px solid ${isWarn ? '#FDE68A' : '#CBD5E1'}`,
 }}>
 {m}:{s}
 </span>
 );
}

// ── Curated 2-Question Interview Sets from DSA Pattern Sheet ─────────────────
const CURATED_DSA_INTERVIEW_SETS = [
 {
 setName: 'Set 1: Arrays, Pointers & Container Optimization',
 problems: [
 { title: 'Two Sum', patternId: 'two-pointers', patternName: 'Two Pointers', categoryId: 'two-pointers', categoryName: 'Two Pointers', difficulty: 'Easy' },
 { title: 'Container With Most Water', patternId: 'two-pointers', patternName: 'Two Pointers', categoryId: 'two-pointers', categoryName: 'Two Pointers', difficulty: 'Medium' },
 ],
 },
 {
 setName: 'Set 2: Substrings, Windows & Maximum Subarray',
 problems: [
 { title: 'Longest Substring Without Repeating Characters', patternId: 'sliding-window', patternName: 'Sliding Window', categoryId: 'sliding-window', categoryName: 'Sliding Window', difficulty: 'Medium' },
 { title: 'Maximum Subarray', patternId: 'sliding-window', patternName: 'Sliding Window', categoryId: 'sliding-window', categoryName: 'Sliding Window', difficulty: 'Medium' },
 ],
 },
 {
 setName: 'Set 3: Pointer Cycles & Linked Structures',
 problems: [
 { title: 'Linked List Cycle', patternId: 'fast-slow-pointers', patternName: 'Fast & Slow Pointers', categoryId: 'fast-slow-pointers', categoryName: 'Fast & Slow Pointers', difficulty: 'Easy' },
 { title: 'Middle of the Linked List', patternId: 'fast-slow-pointers', patternName: 'Fast & Slow Pointers', categoryId: 'fast-slow-pointers', categoryName: 'Fast & Slow Pointers', difficulty: 'Easy' },
 ],
 },
 {
 setName: 'Set 4: Rotated Search & Boundary Convergence',
 problems: [
 { title: 'Search in Rotated Sorted Array', patternId: 'binary-search', patternName: 'Binary Search', categoryId: 'binary-search', categoryName: 'Binary Search', difficulty: 'Medium' },
 { title: 'Find Minimum in Rotated Sorted Array', patternId: 'binary-search', patternName: 'Binary Search', categoryId: 'binary-search', categoryName: 'Binary Search', difficulty: 'Medium' },
 ],
 },
 {
 setName: 'Set 5: Monotonic Stack & Bracket Balancing',
 problems: [
 { title: 'Valid Parentheses', patternId: 'monotonic-stack', patternName: 'Monotonic Stack', categoryId: 'monotonic-stack', categoryName: 'Monotonic Stack', difficulty: 'Easy' },
 { title: 'Daily Temperatures', patternId: 'monotonic-stack', patternName: 'Monotonic Stack', categoryId: 'monotonic-stack', categoryName: 'Monotonic Stack', difficulty: 'Medium' },
 ],
 },
 {
 setName: 'Set 6: Binary Tree Hierarchies & Inversion',
 problems: [
 { title: 'Maximum Depth of Binary Tree', patternId: 'tree-dfs', patternName: 'Tree Depth First Search', categoryId: 'tree-dfs', categoryName: 'Tree DFS', difficulty: 'Easy' },
 { title: 'Invert Binary Tree', patternId: 'tree-dfs', patternName: 'Tree Depth First Search', categoryId: 'tree-dfs', categoryName: 'Tree DFS', difficulty: 'Easy' },
 ],
 },
 {
 setName: 'Set 7: Dynamic State Transition & Optimal Substructure',
 problems: [
 { title: 'Climbing Stairs', patternId: 'dp-1d', patternName: '1D Dynamic Programming', categoryId: 'dynamic-programming', categoryName: 'Dynamic Programming', difficulty: 'Easy' },
 { title: 'House Robber', patternId: 'dp-1d', patternName: '1D Dynamic Programming', categoryId: 'dynamic-programming', categoryName: 'Dynamic Programming', difficulty: 'Medium' },
 ],
 },
 {
 setName: 'Set 8: Palindrome Symmetry & Triple Sums',
 problems: [
 { title: 'Valid Palindrome', patternId: 'two-pointers', patternName: 'Two Pointers', categoryId: 'two-pointers', categoryName: 'Two Pointers', difficulty: 'Easy' },
 { title: '3Sum', patternId: 'two-pointers', patternName: 'Two Pointers', categoryId: 'two-pointers', categoryName: 'Two Pointers', difficulty: 'Medium' },
 ],
 },
 {
 setName: 'Set 9: Grid Exploration & Island Traversal',
 problems: [
 { title: 'Number of Islands', patternId: 'matrix-traversal', patternName: 'Matrix Traversal', categoryId: 'matrix-traversal', categoryName: 'Matrix Traversal', difficulty: 'Medium' },
 { title: 'Max Area of Island', patternId: 'matrix-traversal', patternName: 'Matrix Traversal', categoryId: 'matrix-traversal', categoryName: 'Matrix Traversal', difficulty: 'Medium' },
 ],
 },
 {
 setName: 'Set 10: Top-K Priority Queues & Frequencies',
 problems: [
 { title: 'Kth Largest Element in an Array', patternId: 'top-k-elements', patternName: 'Top K Elements', categoryId: 'top-k-elements', categoryName: 'Top K Elements', difficulty: 'Medium' },
 { title: 'Top K Frequent Elements', patternId: 'top-k-elements', patternName: 'Top K Elements', categoryId: 'top-k-elements', categoryName: 'Top K Elements', difficulty: 'Medium' },
 ],
 },
];

// ── Main CodingRoom Component ────────────────────────────────────────────────
export default function CodingRoom({ config = {}, onEndSession }) {
 const setReport = useInterviewStore((s) => s.setReport);
 const tickTimer = useInterviewStore((s) => s.tickTimer);
 const sharedStream = useInterviewStore((s) => s.mediaStream);

 useEffect(() => {
 const timer = setInterval(() => tickTimer(), 1000);
 return () => clearInterval(timer);
 }, [tickTimer]);

 const timeLimitMin = parseInt(config?.timeLimitPerProblem || '25', 10);
 const problemCount = 2; // Fixed to exactly 2 problems per user requirement
 const evalFocus = config?.evaluationFocus || 'Balanced FAANG Standard';
 const complexityReq = config?.complexityRequirement || 'Include Time & Space Analysis';
 const proctoringMode = config?.proctoringMode || 'Standard Real-Time Feedback';
 const maxViolations = proctoringMode === 'Strict Anti-Cheat Mode' ? 2 : 3;
 const isVideoEnabled = config?.enableVideo !== false;
 const isMicEnabled = config?.enableMic !== false;

 // ── Build Question Session from DSA Pattern Sheet ──────────────────────────
 const [sessionList, setSessionList] = useState([]);
 const [currentIdx, setCurrentIdx] = useState(0);

 // Current problem states
 const [currentQ, setCurrentQ] = useState(null);
 const [problemData, setProblemData] = useState(null);
 const [language, setLanguage] = useState(config?.codingLang || 'Python');
 const [code, setCode] = useState('');
 const [leftTab, setLeftTab] = useState('problem');
 const [bottomTab, setBottomTab] = useState('testcases');
 const [activeCaseId, setActiveCaseId] = useState(1);

 // Execution & Submissions
 const [running, setRunning] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [testResults, setTestResults] = useState([]);
 const [consoleOutput, setConsoleOutput] = useState('');
 const [submitResult, setSubmitResult] = useState(null);
 const [isCompleted, setIsCompleted] = useState(false);
 const [tabSwitchCount, setTabSwitchCount] = useState(0);
 const [showViolationModal, setShowViolationModal] = useState(false);
 const [isTerminated, setIsTerminated] = useState(false);

 // Video Telemetry & Cognitive Load Tracking
 const faceEngineRef = useRef(null);
 const canvasRef = useRef(null);
 const stressSamples = useRef([]);
 const consecutiveDownFrames = useRef(0);
 const lastPhoneAlertTime = useRef(0);

 const [faceData, setFaceData] = useState({
 faceDetected: false,
 eyeContact: 92,
 stressScore: 28,
 headPose: 'forward',
 hrBpm: 72,
 hrvMs: 48,
 });
 const [phoneUseCount, setPhoneUseCount] = useState(0);

 const handleVideoReady = useCallback((videoEl) => {
 if (!videoEl || faceEngineRef.current) return;
 try {
 faceEngineRef.current = new FaceEngine(videoEl, canvasRef.current, {
 onTelemetry: (telemetry) => {
 if (!telemetry) return;
 if (telemetry.stressScore != null) {
 stressSamples.current.push(telemetry.stressScore);
 }
 if (telemetry.headPose === 'down' || telemetry.isLookingDown) {
 consecutiveDownFrames.current += 1;
 // ~2.5s continuous downward gaze triggers phone/distraction alert
 if (consecutiveDownFrames.current > 75 && Date.now() - lastPhoneAlertTime.current > 5000) {
 lastPhoneAlertTime.current = Date.now();
 setPhoneUseCount((prev) => prev + 1);
 }
 } else if (telemetry.headPose === 'forward') {
 consecutiveDownFrames.current = 0;
 }
 setFaceData((prev) => ({ ...prev, ...telemetry }));
 },
 });
 } catch (err) {
 console.warn('[CodingRoom] FaceEngine initialization error:', err);
 }
 }, []);

 useEffect(() => {
 return () => {
 try { faceEngineRef.current?.stop?.(); } catch (_) {}
 };
 }, []);

 const scoringEngine = useRef(new DSAScoringEngine());
 const editorRef = useRef(null);

 // Strict Tab switch / Window blur proctoring detection
 useEffect(() => {
 let lastAlertTime = 0;
 const triggerViolation = (reason) => {
 const now = Date.now();
 // Debounce within 800ms
 if (now - lastAlertTime < 800) return;
 lastAlertTime = now;

 setTabSwitchCount((prev) => {
 const nextCount = prev + 1;
 setShowViolationModal(true);
 if (nextCount >= maxViolations) {
 setIsTerminated(true);
 scoringEngine.current.recordViolation?.(reason);
 }
 return nextCount;
 });
 };

 const handleVis = () => {
 if (document.hidden) {
 triggerViolation('Tab Switch / Hidden Browser Tab Detected');
 }
 };

 const handleBlur = () => {
 triggerViolation('Window Focus Lost / Desktop Navigation Detected');
 };

 document.addEventListener('visibilitychange', handleVis);
 window.addEventListener('blur', handleBlur);

 return () => {
 document.removeEventListener('visibilitychange', handleVis);
 window.removeEventListener('blur', handleBlur);
 };
 }, [maxViolations]);

 // Select ONE fixed set of 2 problems for the entire interview session
 const fixedSetRef = useRef(null);
 if (!fixedSetRef.current) {
 let sets = CURATED_DSA_INTERVIEW_SETS;
 if (config?.difficulty && config.difficulty !== 'Mixed' && config.difficulty !== 'Adaptive AI') {
 const diffSets = sets.filter((s) => s.problems.some((p) => p.difficulty?.toLowerCase() === config.difficulty.toLowerCase()));
 if (diffSets.length > 0) sets = diffSets;
 }
 fixedSetRef.current = sets[Math.floor(Math.random() * sets.length)];
 }

 // Initialize the fixed set exactly once
 useEffect(() => {
 const selected = fixedSetRef.current.problems;
 setSessionList(selected);
 setCurrentIdx(0);
 _loadProblem(selected[0], config?.codingLang || 'Python');
 }, []);

 const _loadProblem = (qItem, lang = 'Python') => {
 if (!qItem) return;
 setCurrentQ(qItem);
 const pData = getProblemData(qItem.title, { id: qItem.patternId, name: qItem.patternName }, { id: qItem.categoryId, name: qItem.categoryName });
 setProblemData(pData);

 const langKey = LANG_CODE_KEY[lang] || 'Python';
 const initCode = qItem.starterCode?.[langKey] || pData.starterCode?.[langKey] || `// Write your ${lang} solution here`;
 setCode(initCode);

 setTestResults([]);
 setConsoleOutput('Ready to test. Click "Run Code" or "Submit Solution".');
 setSubmitResult(null);
 setIsCompleted(false);
 setLeftTab('problem');
 setBottomTab('testcases');
 setActiveCaseId(1);
 };

 const handleLanguageChange = (newLang) => {
 setLanguage(newLang);
 if (!currentQ || !problemData) return;
 const langKey = LANG_CODE_KEY[newLang] || 'Python';
 const newCode = currentQ.starterCode?.[langKey] || problemData.starterCode?.[langKey] || `// Write your ${newLang} solution here`;
 setCode(newCode);
 setTestResults([]);
 setConsoleOutput('');
 };

 // ── Test Cases Runner ──────────────────────────────────────────────────────
 const runAllTestCases = useCallback(async () => {
 if (!problemData) return [];
 const testCases = problemData.testCases || [];
 const langKey = LANG_KEY[language] || 'python';

 const normalize = (s) => String(s || '')
 .trim()
 .replace(/\s+/g, '')
 .replace(/,\s*/g, ',')
 .toLowerCase();

 const results = await Promise.all(testCases.map(async (tc) => {
 try {
 const res = await executeCodeOnline(code, langKey, tc.input, currentQ);
 if (res.error && !res.output) {
 return { id: tc.id, passed: false, actual: res.error, executionTime: res.executionTime };
 }
 const actual = (res.output || '').trim();
 const normActual = normalize(actual);
 const normExpected = normalize(tc.expected);
 const passed = normActual === normExpected || normActual.includes(normExpected);
 return { id: tc.id, passed, actual: actual || '(no output)', executionTime: res.executionTime };
 } catch (err) {
 return { id: tc.id, passed: false, actual: `Error: ${err.message}` };
 }
 }));

 return results;
 }, [code, language, problemData, currentQ]);

 // ── Run Code ───────────────────────────────────────────────────────────────
 const handleRun = async () => {
 if (running || !code.trim() || !problemData) return;
 setRunning(true);
 setBottomTab('testcases');
 setConsoleOutput('Compiling and evaluating against DSA pattern test cases...');

 try {
 const results = await runAllTestCases();
 setTestResults(results);
 const passed = results.filter((r) => r.passed).length;
 const total = results.length;
 setConsoleOutput(`Execution complete: ${passed} / ${total} test cases passed.`);
 if (results.length > 0) setActiveCaseId(results[0].id);
 } catch (e) {
 setConsoleOutput(`Execution Error: ${e.message}`);
 } finally {
 setRunning(false);
 }
 };

 // ── Submit Solution ────────────────────────────────────────────────────────
 const handleSubmit = async () => {
 if (submitting || !problemData) return;
 setSubmitting(true);
 setBottomTab('feedback');
 setConsoleOutput('Evaluating solution integrity, executing dynamic edge cases, and computing rubric feedback...');

 try {
 // 1. Run all standard test cases
 const results = await runAllTestCases();
 setTestResults(results);
 const passed = results.filter((r) => r.passed).length;
 const total = Math.max(results.length, 1);
 const passRate = Math.round((passed / total) * 100);

 // 2. Run Code Integrity & Anti-Cheat Model (Static Scanner + Dynamic Stress Edge Cases)
 const integrity = await CodeIntegrityModel.evaluateIntegrity({
 code,
 language,
 problemTitle: currentQ?.title || '',
 problemData,
 testCases: problemData?.testCases || [],
 });

 const allPassed = passed === total && total > 0 && !integrity.isCheatDetected;
 setIsCompleted(allPassed);

 // Check if candidate actually wrote meaningful code
 const lines = (code || '').split('\n').filter((l) => l.trim() && !l.trim().startsWith('//')).length;
 const cleanCode = (code || '')
 .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // remove comments
 .replace(/\b(def|function|class|public|static|void|int|return|import|include)\b/g, '')
 .trim();
 const hasMeaningfulCode = cleanCode.length > 10 && lines > 1;

 // Rubric dimensions calculation
 let correctness = total > 0 ? Math.round((passed / total) * 30) : 0;
 let time_complexity = allPassed ? 20 : passed > 0 ? Math.round((passed / total) * 15) : 0;
 let space_complexity = allPassed ? 15 : passed > 0 ? Math.round((passed / total) * 12) : 0;
 let code_quality = hasMeaningfulCode ? (allPassed ? 20 : passed > 0 ? Math.min(20, Math.max(8, lines * 2)) : (lines > 3 ? 5 : 0)) : 0;
 let edge_cases = allPassed ? Math.round((integrity.edgeCaseScore / 100) * 10) : passed > 0 ? Math.round((integrity.edgeCaseScore / 100) * 6) : 0;

 // Invalidate marks if cheating or hardcoded returns detected
 if (integrity.isCheatDetected || !hasMeaningfulCode || passed === 0) {
 correctness = 0;
 time_complexity = 0;
 space_complexity = 0;
 edge_cases = 0;
 if (!hasMeaningfulCode || integrity.isCheatDetected) {
 code_quality = 0;
 }
 }

 const totalScore = Math.min(100, correctness + time_complexity + space_complexity + code_quality + edge_cases);
 const outcome = integrity.isCheatDetected
 ? 'cheating_detected'
 : allPassed
 ? 'optimal'
 : (passed > 0 && passRate >= 50)
 ? 'partially_correct'
 : 'incorrect';

 const submitData = {
 outcome,
 total: totalScore,
 isCheatDetected: integrity.isCheatDetected,
 cheatVerdict: integrity.verdict,
 cheatViolations: integrity.violations,
 edgeCaseScore: integrity.edgeCaseScore,
 breakdown: {
 correctness,
 max_correctness: 30,
 time_complexity,
 max_time: 20,
 space_complexity,
 max_space: 15,
 test_cases: passed,
 max_tests: total,
 code_quality,
 max_quality: 20,
 edge_cases,
 max_edge: 10,
 },
 test_summary: {
 passed: integrity.isCheatDetected ? 0 : passed,
 total,
 failed_cases: results.filter((r) => !r.passed).map((r, i) => ({ index: i + 1, stdin: '(hidden input)', actual: r.actual })),
 },
 ai_verdict: integrity.isCheatDetected
 ? integrity.verdict
 : !hasMeaningfulCode
 ? `No working implementation submitted. Score: 0/100.`
 : allPassed
 ? `All test cases and dynamic edge cases passed! Clean algorithmic implementation with optimal execution.`
 : `${passed}/${total} test cases passed (Edge case integrity: ${integrity.edgeCaseScore}%). Solution needs refinement.`,
 ai_analysis: integrity.isCheatDetected
 ? `Anti-Cheat System Alert: Hardcoded test-case conditionals, static table returns, or mock outputs were detected. Candidates must construct generalizable algorithms with appropriate loops, data structures, and edge-case invariants.`
 : !hasMeaningfulCode
 ? `No executable algorithm was provided for "${currentQ.title}". Please write your code solution and test against the test cases.`
 : allPassed
 ? `Excellent solution for "${currentQ.title}". Your algorithm passes both visible test cases and unseen dynamic edge cases with optimal time and space bounds.`
 : `For "${currentQ.title}", your code resolved ${passed}/${total} test cases. Edge-case test robustness score is ${integrity.edgeCaseScore}%. Review boundary conditions and dynamic inputs.`,
 followup_prompt: allPassed
 ? `Can you explain how this approach scales if input size grows to 10^7? What are the memory trade-offs?`
 : `Walk through the failing test case step-by-step to identify the constraint mismatch.`,
 };

 setSubmitResult(submitData);

 scoringEngine.current.recordSubmission({
 problemId: currentQ.title,
 problemTitle: currentQ.title,
 difficulty: currentQ.difficulty,
 score: totalScore,
 breakdown: submitData.breakdown,
 outcome: submitData.outcome,
 pattern: currentQ.patternName,
 });

 if (allPassed) {
 setConsoleOutput(`Accepted! All ${total}/${total} test cases passed.`);
 } else {
 setConsoleOutput(`Submitted: ${passed}/${total} test cases passed.`);
 }
 } catch (e) {
 setConsoleOutput(`Submission Error: ${e.message}`);
 } finally {
 setSubmitting(false);
 }
 };

 const handleNextProblem = () => {
 const nextIdx = currentIdx + 1;
 if (nextIdx < sessionList.length) {
 setCurrentIdx(nextIdx);
 _loadProblem(sessionList[nextIdx], language);
 } else {
 handleFinishSession();
 }
 };

 const handleFinishSession = async () => {
 // If the candidate wrote code for the current problem but hasn't submitted yet, evaluate it
 const existingProblem = (scoringEngine.current.submissions || []).find((s) => s.problemTitle === currentQ?.title);
 if (!existingProblem && code && problemData) {
 try {
 const results = await runAllTestCases();
 const passed = results.filter((r) => r.passed).length;
 const total = Math.max(results.length, 1);
 const integrity = await CodeIntegrityModel.evaluateIntegrity({
 code,
 language,
 problemTitle: currentQ?.title || '',
 problemData,
 testCases: problemData?.testCases || [],
 });
 const allPassed = passed === total && total > 0 && !integrity.isCheatDetected;
 const lines = (code || '').split('\n').filter((l) => l.trim() && !l.trim().startsWith('//')).length;
 const hasMeaningfulCode = (code || '').trim().length > 10 && lines > 1;

 let correctness = total > 0 ? Math.round((passed / total) * 30) : 0;
 let time_complexity = allPassed ? 20 : passed > 0 ? Math.round((passed / total) * 15) : 0;
 let space_complexity = allPassed ? 15 : passed > 0 ? Math.round((passed / total) * 12) : 0;
 let code_quality = hasMeaningfulCode ? (allPassed ? 20 : passed > 0 ? Math.min(20, Math.max(8, lines * 2)) : (lines > 3 ? 5 : 0)) : 0;
 let edge_cases = allPassed ? Math.round((integrity.edgeCaseScore / 100) * 10) : passed > 0 ? Math.round((integrity.edgeCaseScore / 100) * 6) : 0;

 if (integrity.isCheatDetected || !hasMeaningfulCode || passed === 0) {
 correctness = 0; time_complexity = 0; space_complexity = 0; edge_cases = 0;
 if (!hasMeaningfulCode || integrity.isCheatDetected) code_quality = 0;
 }

 const totalScore = Math.min(100, correctness + time_complexity + space_complexity + code_quality + edge_cases);
 scoringEngine.current.recordSubmission({
 problemId: currentQ.title,
 problemTitle: currentQ.title,
 difficulty: currentQ.difficulty,
 score: totalScore,
 breakdown: { correctness, time_complexity, space_complexity, code_quality, edge_cases },
 outcome: allPassed ? 'optimal' : passed > 0 ? 'partially_correct' : 'incorrect',
 pattern: currentQ.patternName,
 });
 } catch (_) {}
 }

 const report = scoringEngine.current.generateReport();
 
 // 1. Raw code performance score from testcases and algorithmic evaluation matrix
 const codeScore = report.overall !== undefined ? report.overall : 0;

 // 2. Cognitive load modifier from real-time biometric video feed
 const avgStress = stressSamples.current.length > 0
 ? Math.round(stressSamples.current.reduce((a, b) => a + b, 0) / stressSamples.current.length)
 : (faceData.stressScore || 28);
 const cognitivePenalty = avgStress > 70 ? 8 : avgStress > 45 ? 4 : 0;

 // 3. Tab switch penalty (-10 marks per switch)
 const tabSwitchPenalty = tabSwitchCount * 10;

 // 4. Phone use / suspicious downward gaze penalty (-12 marks per alert)
 const phonePenalty = phoneUseCount * 12;

 const totalPenalties = cognitivePenalty + tabSwitchPenalty + phonePenalty;
 const finalScore = Math.max(0, Math.min(100, codeScore - totalPenalties));

 const grade = finalScore >= 90 ? 'A+' : finalScore >= 80 ? 'A' : finalScore >= 70 ? 'B+' : finalScore >= 60 ? 'B' : finalScore >= 45 ? 'C' : 'D';
 const hireRec = finalScore >= 75
 ? 'Strong Yes — Recommended for Hire'
 : finalScore >= 55
 ? 'Consider — With Targeted Mentorship'
 : 'No — Needs Fundamental Improvement';

 // Stop video hardware
 try {
 if (faceEngineRef.current) faceEngineRef.current.stop();
 if (sharedStream) sharedStream.getTracks().forEach(t => t.stop());
 } catch (_) {}

 const questionReviews = (sessionList || []).map((q, idx) => {
 const att = (report.problems || []).find((p) => p.title === q.title) || {};
 const score = att.score ?? 0;
 return {
 question_number: idx + 1,
 question: `${q.title} (${q.difficulty || 'Medium'})`,
 user_answer: att.score !== undefined ? `Submitted solution: ${att.outcome || 'Evaluated'} (${score}/100)` : 'No submission recorded before session conclusion.',
 score: score,
 verdict: score >= 80 ? 'Optimal Solution' : score >= 40 ? 'Partial Solution' : 'Incomplete / 0 Marks',
 what_was_right: score >= 80 ? 'Passed test cases with optimal data structure state management.' : score > 0 ? 'Handled primary case logic.' : 'Attempted problem space formulation.',
 what_was_missing: score >= 80 ? 'None — optimal implementation.' : 'Edge-case handling, full testcase coverage, and asymptotic runtime bounds.',
 ideal_answer: `Apply standard optimal pattern with optimal asymptotic time and space bounds.`,
 };
 });

 const enriched = {
 ...report,
 overall_score: finalScore,
 code_score: codeScore,
 cognitive_penalty: cognitivePenalty,
 tab_switch_penalty: tabSwitchPenalty,
 phone_penalty: phonePenalty,
 total_penalties: totalPenalties,
 grade,
 hire_recommendation: hireRec,
 tabSwitchViolations: tabSwitchCount,
 phoneUseCount: phoneUseCount,
 stress_score: avgStress,
 eye_contact_score: Math.round(faceData.eyeContact || 92),
 hr_bpm: faceData.hrBpm || 74,
 hrv_ms: faceData.hrvMs || 48,
 cognitive_load_label: avgStress > 70 ? 'High Cognitive Stress' : avgStress > 40 ? 'Moderate Load' : 'Optimal Flow',
 proctoringFlag: (tabSwitchCount >= maxViolations || phoneUseCount > 1) ? 'FLAGGED' : 'CLEAN',
 evaluationFocus: evalFocus,
 complexityRequirement: complexityReq,
 proctoringMode: proctoringMode,
 targetLanguage: language,
 trackId: 'dsa',
 trackName: 'DSA & Coding Interview',
 role: 'Software Engineer',
 difficulty: config?.difficulty || 'Adaptive AI',
 sessionDuration: Math.max(1, Math.round((timeLimitMin * (currentIdx + 1)) / 2)),
 skillScores: report.skillScores || {},
 evaluationMatrix: [
 { label: 'Problem Understanding', desc: 'Understanding requirements and edge constraints' },
 { label: 'Coding Accuracy', desc: 'Syntax precision and logic correctness' },
 { label: 'Data Structures', desc: 'Selection and optimal data structure usage' },
 { label: 'Algorithms', desc: 'Pattern mastery and computational efficiency' },
 { label: 'Optimization', desc: 'Rate of optimal solution formulation' },
 { label: 'Time Complexity', desc: 'Asymptotic runtime optimization' },
 { label: 'Space Complexity', desc: 'Auxiliary memory management' },
 { label: 'Edge Cases', desc: 'Handling boundary conditions and edge inputs' },
 { label: 'Code Quality', desc: 'Modularity, readability, and clean style' },
 { label: 'Debugging', desc: 'Systematic error identification and fixes' },
 ],
 strengths: report.strengths?.length > 0 ? report.strengths : ['Algorithmic formulation', 'Clean syntax and structure'],
 weak_areas: [
 ...(report.weaknesses || []),
 ...(tabSwitchCount > 0 ? [`Score deducted due to ${tabSwitchCount} tab switch violation(s)`] : []),
 ...(phoneUseCount > 0 ? [`Score deducted due to ${phoneUseCount} phone distraction alert(s)`] : []),
 ...(avgStress > 70 ? ['Elevated cognitive stress impacted problem execution'] : []),
 ],
 executive_summary: finalScore >= 70
 ? `Candidate demonstrated solid algorithmic execution in ${language} (Code Score: ${codeScore}/100, Final Calibrated Score: ${finalScore}/100 with ${totalPenalties} penalty points).`
 : `Candidate achieved ${codeScore}/100 code accuracy with ${totalPenalties} penalty points applied (Final Score: ${finalScore}/100). Focus on test case verification and minimizing distractions.`,
 behavioral_observation: `Maintained ${Math.round(faceData.eyeContact || 92)}% eye contact with cognitive stress of ${avgStress}/100. Recorded ${tabSwitchCount} tab switch(es) and ${phoneUseCount} phone distraction alert(s).`,
 question_reviews: questionReviews,
 };

 setReport(enriched);
 useInterviewStore.getState().endInterview(enriched);
 if (onEndSession) onEndSession(enriched);
 };

 const activeTestCase = (problemData?.testCases || []).find((tc) => tc.id === activeCaseId) || (problemData?.testCases?.[0]);
 const activeResult = testResults.find((r) => r.id === activeCaseId);

 return (
 <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', backgroundColor: '#F9FAFB', fontFamily: C.sans, overflow: 'hidden' }}>

 {/* ── Top Header Bar ─────────────────────────────────────────────────── */}
 <div style={{
 height: '52px',
 backgroundColor: '#FFFFFF',
 borderBottom: `1px solid ${C.border}`,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 padding: '0 20px',
 flexShrink: 0,
 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 <span style={{ fontSize: '15px', fontWeight: 800, color: C.textMain }}>
 DSA &amp; Coding Interview
 </span>
 <span style={{ color: C.border }}>|</span>
 <span style={{ fontSize: '13.5px', fontWeight: 700, color: C.textBody }}>
 {currentQ?.title || 'Loading Question...'}
 </span>
 {currentQ?.difficulty && (
 <span style={{
 fontSize: '11px',
 fontWeight: 700,
 padding: '2px 8px',
 borderRadius: '4px',
 backgroundColor: currentQ.difficulty === 'Hard' ? '#FFF1F2' : currentQ.difficulty === 'Medium' ? '#FFFBEB' : '#ECFDF5',
 border: `1px solid ${currentQ.difficulty === 'Hard' ? '#FECDD3' : currentQ.difficulty === 'Medium' ? '#FDE68A' : '#A7F3D0'}`,
 color: currentQ.difficulty === 'Hard' ? '#9F1239' : currentQ.difficulty === 'Medium' ? '#92400E' : '#065F46',
 }}>
 {currentQ.difficulty}
 </span>
 )}
 <span style={{
 fontSize: '11px',
 fontWeight: 700,
 padding: '2px 8px',
 borderRadius: '4px',
 backgroundColor: '#F1F5F9',
 border: '1px solid #CBD5E1',
 color: '#334155',
 }}>
 Focus: {evalFocus}
 </span>
 <span style={{
 fontSize: '11px',
 fontWeight: 700,
 padding: '2px 8px',
 borderRadius: '4px',
 backgroundColor: '#F0FDF4',
 border: '1px solid #BBF7D0',
 color: '#166534',
 }}>
 ● {isVideoEnabled ? 'Live Proctoring' : 'Code Proctoring'}
 </span>
 </div>

 <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
 <ProblemTimer
 limitMinutes={timeLimitMin}
 currentIdx={currentIdx}
 onExpire={() => setConsoleOutput('Time limit reached for this problem. You may submit or advance.')}
 />
 <span style={{ fontSize: '12px', fontWeight: 600, color: C.textMuted }}>
 Question {currentIdx + 1} of {Math.max(sessionList.length, 1)}
 </span>
 <button
 onClick={handleFinishSession}
 style={{
 padding: '6px 14px',
 borderRadius: '6px',
 fontSize: '12px',
 fontWeight: 600,
 backgroundColor: '#F1F5F9',
 color: '#334155',
 border: '1px solid #CBD5E1',
 cursor: 'pointer',
 }}
 >
 End Interview
 </button>
 </div>
 </div>

 {/* ── Main Split View ────────────────────────────────────────────────── */}
 <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>

 {/* ── Left Panel: Problem Statement & Constraints ──────────────────── */}
 <div style={{
 width: '42%',
 minWidth: '340px',
 backgroundColor: '#FFFFFF',
 borderRight: `1px solid ${C.border}`,
 display: 'flex',
 flexDirection: 'column',
 overflow: 'hidden',
 }}>
 {/* Panel Header */}
 <div style={{
 padding: '12px 20px',
 borderBottom: `1px solid ${C.border}`,
 backgroundColor: '#F8FAFC',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 }}>
 <span style={{ fontSize: '13px', fontWeight: 700, color: C.textMain }}>Problem Statement</span>
 <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 600 }}>Analysis: {complexityReq}</span>
 </div>

 {/* Problem Content Area */}
 <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
 <h3 style={{ fontSize: '18px', fontWeight: 800, color: C.textMain, margin: '0 0 12px 0' }}>
 {currentQ?.title}
 </h3>
 <div style={{ fontSize: '14px', lineHeight: '1.7', color: C.textBody, marginBottom: '20px', whiteSpace: 'pre-line' }}>
 {problemData?.description || currentQ?.description || 'Read the problem statement and formulate your optimal solution.'}
 </div>

 {/* Examples */}
 {problemData?.examples && problemData.examples.length > 0 && (
 <div style={{ marginBottom: '22px' }}>
 <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '10px' }}>
 Examples
 </div>
 {problemData.examples.map((ex, idx) => (
 <div key={idx} style={{ padding: '12px 14px', backgroundColor: '#F8FAFC', border: `1px solid ${C.border}`, borderRadius: '8px', marginBottom: '10px', fontFamily: C.mono, fontSize: '12.5px' }}>
 <div style={{ fontWeight: 700, color: C.textMain, marginBottom: '4px', fontFamily: C.sans, fontSize: '11px' }}>Example {idx + 1}</div>
 <div style={{ color: C.textBody }}>Input: <span style={{ color: C.textMain }}>{ex.input}</span></div>
 <div style={{ color: C.textBody, marginTop: '2px' }}>Output: <span style={{ color: '#15803D', fontWeight: 700 }}>{ex.output}</span></div>
 {ex.explanation && (
 <div style={{ color: C.textMuted, fontSize: '11.5px', marginTop: '4px', fontFamily: C.sans }}>Explanation: {ex.explanation}</div>
 )}
 </div>
 ))}
 </div>
 )}

 {/* Constraints */}
 {problemData?.constraints && (
 <div style={{ marginBottom: '22px' }}>
 <div style={{ fontSize: '11px', fontWeight: 700, color: C.textMuted, textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
 Constraints
 </div>
 {Object.entries(problemData.constraints).map(([k, v]) => (
 <div key={k} style={{ fontSize: '12.5px', color: C.textMuted, marginBottom: '4px' }}>
 • <code style={{ color: C.textMain, fontFamily: C.mono, backgroundColor: '#F1F5F9', padding: '1px 6px', borderRadius: '4px' }}>{v}</code>
 </div>
 ))}
 </div>
 )}

 {/* Live Proctoring Webcam Feed */}
 {isVideoEnabled && sharedStream && (
 <div style={{
 marginTop: '16px',
 padding: '12px 14px',
 borderRadius: '10px',
 backgroundColor: '#0F172A',
 border: '1px solid #334155',
 color: '#FFFFFF',
 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
 <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#CBD5E1', letterSpacing: '0.3px' }}>Candidate Video Feed</span>
 <span style={{ fontSize: '11px', fontWeight: 700, color: faceData.faceDetected ? '#4ADE80' : '#FBBF24' }}>
 ● {faceData.faceDetected ? 'Face Verified' : 'Searching Face'}
 </span>
 </div>
 <div style={{ height: '110px', borderRadius: '6px', overflow: 'hidden', backgroundColor: '#000000', position: 'relative' }}>
 <VideoFeed stream={sharedStream} muted={true} onVideoReady={handleVideoReady} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
 <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }} />
 </div>
 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94A3B8', marginTop: '8px' }}>
 <span>Stress: <strong style={{ color: '#FFFFFF' }}>{faceData.stressScore || 28}/100</strong></span>
 <span>Eye Contact: <strong style={{ color: '#FFFFFF' }}>{Math.round(faceData.eyeContact || 92)}%</strong></span>
 {phoneUseCount > 0 && <span style={{ color: '#F87171', fontWeight: 700 }}>️ {phoneUseCount} Phone Alert{phoneUseCount > 1 ? 's' : ''}</span>}
 </div>
 </div>
 )}
 </div>
 </div>

 {/* ── Right Panel: Code Editor + Test Case Console ─────────────────── */}
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

 {/* Editor Language & Action Bar */}
 <div style={{
 height: '46px',
 backgroundColor: '#F8FAFC',
 borderBottom: `1px solid ${C.border}`,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'space-between',
 padding: '0 16px',
 flexShrink: 0,
 }}>
 {/* Language Tabs */}
 <div style={{ display: 'flex', gap: '6px' }}>
 {LANGS.map((lang) => (
 <button
 key={lang}
 onClick={() => handleLanguageChange(lang)}
 style={{
 padding: '4px 12px',
 borderRadius: '6px',
 fontSize: '12px',
 fontWeight: 600,
 cursor: 'pointer',
 border: language === lang ? '1px solid #475569' : `1px solid ${C.border}`,
 backgroundColor: language === lang ? '#475569' : '#FFFFFF',
 color: language === lang ? '#FFFFFF' : C.textBody,
 }}
 >
 {lang}
 </button>
 ))}
 </div>

 {/* Run / Submit / Next */}
 <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
 <button
 onClick={handleRun}
 disabled={running}
 style={{
 padding: '6px 16px',
 borderRadius: '6px',
 fontSize: '12px',
 fontWeight: 600,
 backgroundColor: '#F1F5F9',
 color: running ? C.textLight : '#334155',
 border: '1px solid #CBD5E1',
 cursor: running ? 'not-allowed' : 'pointer',
 }}
 >
 {running ? 'Running...' : 'Run Code'}
 </button>

 <button
 onClick={handleSubmit}
 disabled={submitting}
 style={{
 padding: '6px 18px',
 borderRadius: '6px',
 fontSize: '12px',
 fontWeight: 700,
 backgroundColor: submitting ? '#94A3B8' : C.btnGrey,
 color: '#FFFFFF',
 border: 'none',
 cursor: submitting ? 'not-allowed' : 'pointer',
 }}
 >
 {submitting ? 'Evaluating...' : 'Submit Solution'}
 </button>

 {currentIdx + 1 < sessionList.length && (
 <button
 onClick={handleNextProblem}
 style={{
 padding: '6px 14px',
 borderRadius: '6px',
 fontSize: '12px',
 fontWeight: 600,
 backgroundColor: '#F1F5F9',
 color: '#334155',
 border: '1px solid #CBD5E1',
 cursor: 'pointer',
 }}
 >
 Next Problem
 </button>
 )}
 </div>
 </div>

 {/* Monaco Editor */}
 <div style={{ flex: 1, overflow: 'hidden' }}>
 <Editor
 height="100%"
 language={LANG_KEY[language] || 'python'}
 theme="vs-dark"
 value={code}
 onChange={(val) => setCode(val || '')}
 onMount={(editor) => { editorRef.current = editor; }}
 options={{
 minimap: { enabled: false },
 fontSize: 13.5,
 fontFamily: C.mono,
 padding: { top: 12 },
 lineNumbersMinChars: 3,
 scrollBeyondLastLine: false,
 tabSize: 4,
 automaticLayout: true,
 }}
 />
 </div>

 {/* Bottom Test Cases & Evaluation Panel */}
 <div style={{
 height: '240px',
 backgroundColor: '#FFFFFF',
 borderTop: `1px solid ${C.border}`,
 display: 'flex',
 flexDirection: 'column',
 flexShrink: 0,
 }}>
 {/* Panel Tabs */}
 <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, padding: '0 16px', backgroundColor: '#F8FAFC' }}>
 {[
 { id: 'testcases', label: 'Test Cases' },
 { id: 'console', label: 'Console Output' },
 { id: 'feedback', label: 'AI Evaluation & Feedback' },
 ].map((t) => (
 <button
 key={t.id}
 onClick={() => setBottomTab(t.id)}
 style={{
 padding: '8px 14px',
 fontSize: '12.5px',
 fontWeight: bottomTab === t.id ? 700 : 500,
 color: bottomTab === t.id ? C.textMain : C.textMuted,
 border: 'none',
 borderBottom: bottomTab === t.id ? '2px solid #0F172A' : '2px solid transparent',
 backgroundColor: 'transparent',
 cursor: 'pointer',
 }}
 >
 {t.label}
 </button>
 ))}
 </div>

 {/* Panel Body */}
 <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
 {bottomTab === 'testcases' && (
 <div>
 {/* Case Pill Selector */}
 <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
 {(problemData?.testCases || [{ id: 1 }]).map((tc) => {
 const res = testResults.find((r) => r.id === tc.id);
 return (
 <button
 key={tc.id}
 onClick={() => setActiveCaseId(tc.id)}
 style={{
 padding: '4px 12px',
 borderRadius: '6px',
 fontSize: '12px',
 fontWeight: 600,
 cursor: 'pointer',
 backgroundColor: activeCaseId === tc.id ? '#F1F5F9' : '#FFFFFF',
 border: activeCaseId === tc.id ? '1px solid #334155' : `1px solid ${C.border}`,
 color: res ? (res.passed ? '#15803D' : '#DC2626') : C.textBody,
 }}
 >
 Case {tc.id} {res ? (res.passed ? '' : '') : ''}
 </button>
 );
 })}
 </div>

 {/* Active Case Details */}
 {activeTestCase && (
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', fontSize: '12px', fontFamily: C.mono }}>
 <div style={{ padding: '8px 10px', backgroundColor: '#F8FAFC', border: `1px solid ${C.border}`, borderRadius: '6px' }}>
 <div style={{ fontWeight: 700, color: C.textMuted, fontFamily: C.sans, marginBottom: '2px' }}>Input</div>
 <div style={{ color: C.textMain }}>{activeTestCase.input}</div>
 </div>
 <div style={{ padding: '8px 10px', backgroundColor: '#F8FAFC', border: `1px solid ${C.border}`, borderRadius: '6px' }}>
 <div style={{ fontWeight: 700, color: C.textMuted, fontFamily: C.sans, marginBottom: '2px' }}>Expected</div>
 <div style={{ color: '#15803D', fontWeight: 700 }}>{activeTestCase.expected}</div>
 </div>
 <div style={{ padding: '8px 10px', backgroundColor: activeResult ? (activeResult.passed ? '#F0FDF4' : '#FEF2F2') : '#F8FAFC', border: `1px solid ${activeResult ? (activeResult.passed ? '#BBF7D0' : '#FECDD3') : C.border}`, borderRadius: '6px' }}>
 <div style={{ fontWeight: 700, color: activeResult ? (activeResult.passed ? '#15803D' : '#DC2626') : C.textMuted, fontFamily: C.sans, marginBottom: '2px' }}>
 Actual Got {activeResult ? (activeResult.passed ? '(Passed)' : '(Failed)') : ''}
 </div>
 <div style={{ color: activeResult ? (activeResult.passed ? '#15803D' : '#DC2626') : C.textLight }}>
 {activeResult?.actual || '(Run code to see output)'}
 </div>
 </div>
 </div>
 )}
 </div>
 )}

 {bottomTab === 'console' && (
 <pre style={{ margin: 0, fontSize: '12.5px', fontFamily: C.mono, color: C.textBody, whiteSpace: 'pre-wrap' }}>
 {consoleOutput || 'Console output will appear here after code execution.'}
 </pre>
 )}

 {bottomTab === 'feedback' && (
 <div>
 {submitResult ? (
 <CodingFeedback
 result={submitResult}
 onOptimize={() => { setBottomTab('testcases'); }}
 onNextProblem={currentIdx + 1 < sessionList.length ? handleNextProblem : null}
 onEndSession={handleFinishSession}
 />
 ) : (
 <div style={{
 padding: '30px 20px',
 textAlign: 'center',
 backgroundColor: '#F8FAFC',
 borderRadius: '8px',
 border: `1px dashed ${C.border}`,
 }}>
 <div style={{ fontSize: '14px', fontWeight: 700, color: C.textMain, marginBottom: '6px' }}>
 Ready for AI Evaluation?
 </div>
 <div style={{ fontSize: '13px', color: C.textMuted, maxWidth: '440px', margin: '0 auto 16px auto', lineHeight: 1.5 }}>
 Click <strong>Submit Solution</strong> to execute all comprehensive test cases, perform algorithmic analysis, and generate your live interview scorecard.
 </div>
 <button
 onClick={handleSubmit}
 disabled={submitting}
 style={{
 padding: '8px 20px',
 borderRadius: '6px',
 fontSize: '13px',
 fontWeight: 700,
 backgroundColor: '#475569',
 color: '#FFFFFF',
 border: 'none',
 cursor: submitting ? 'not-allowed' : 'pointer',
 }}
 >
 {submitting ? 'Evaluating...' : 'Submit Solution Now'}
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 </div>

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
 onClick={handleFinishSession}
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
