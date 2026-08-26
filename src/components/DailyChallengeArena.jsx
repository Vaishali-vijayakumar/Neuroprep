import React, { useState, useEffect } from 'react';
import { executeCodeOnline } from '../services/compilerService';
import { getDailyChallenge, recordActivity } from '../services/gamificationService';
import { getProblemData } from '../data/problemData';
import { dbService } from '../services/db';
import { 
  Code2, Play, CheckCircle2, BookOpen, Lightbulb, 
  Clock, Shield, Award, Sparkles, Check, Copy, Terminal, Zap, ArrowLeft, XCircle, RotateCcw, Trash2
} from 'lucide-react';

const LANG_STARTER_KEYS = {
  Python: 'Python',
  Java: 'Java',
  'C++': 'Cpp',
  JavaScript: 'JavaScript'
};

const LANG_KEY_MAP = {
  Python: 'python',
  Java: 'java',
  'C++': 'cpp',
  JavaScript: 'javascript'
};

export default function DailyChallengeArena({ userEmail = 'guest', setActiveTab, onProblemSolved }) {
  const challenge = getDailyChallenge();
  const problemMeta = getProblemData(challenge.title);

  const cleanUser = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const STORAGE_KEY = `neuroprep_dsa_solved_${cleanUser}`;

  const [isSolved, setIsSolved] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        return Boolean(saved[challenge.title]);
      }
    } catch (e) {}
    return false;
  });

  const [activeTabLeft, setActiveTabLeft] = useState('description'); // 'description' | 'approach' | 'solution'
  const [activeTabRight, setActiveTabRight] = useState('code'); // 'code' | 'results'
  const [language, setLanguage] = useState('Python');
  const [code, setCode] = useState(() => {
    const key = LANG_STARTER_KEYS['Python'];
    return challenge.starterCode?.[key] || problemMeta.starterCode?.[key] || '# Write your solution here\n';
  });

  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState([]);
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);
  const [consoleOutput, setConsoleOutput] = useState('');
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const [copiedSolution, setCopiedSolution] = useState(false);

  // Update starter code on language switch
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    const key = LANG_STARTER_KEYS[newLang];
    const starter = challenge.starterCode?.[key] || problemMeta.starterCode?.[key] || '';
    if (starter) setCode(starter);
  };

  // Normalise test cases from problem meta
  const rawCases = problemMeta.testCases && problemMeta.testCases.length > 0 ? problemMeta.testCases : [
    { id: 1, input: '[2,7,11,15]\n9', expected: '[0,1]' },
    { id: 2, input: '[3,2,4]\n6', expected: '[1,2]' },
    { id: 3, input: '[3,3]\n6', expected: '[0,1]' }
  ];

  const testCases = rawCases.map((tc, idx) => ({
    id: tc.id || idx + 1,
    input: tc.input || '',
    expected: tc.expected || tc.expectedOutput || ''
  }));

  const normalize = (s) => String(s || '')
    .trim()
    .replace(/\s+/g, '')
    .replace(/,\s*/g, ',')
    .toLowerCase();

  // Run Code against selected/first testcase
  const handleRunCode = async () => {
    if (isRunning || isSubmitting) return;
    setIsRunning(true);
    setActiveTabRight('results');
    setConsoleOutput('Running your code against test cases...');

    try {
      const tc = testCases[activeCaseIdx] || testCases[0];
      const langKey = LANG_KEY_MAP[language] || 'python';
      const res = await executeCodeOnline(code, langKey, tc.input, challenge);
      
      const actual = (res.output || '').trim();
      const normActual = normalize(actual);
      const normExpected = normalize(tc.expected);
      const isPassed = !res.error && (normActual === normExpected || (normExpected && normActual.includes(normExpected)));

      setTestResults([
        {
          id: tc.id,
          input: tc.input,
          expected: tc.expected,
          actual: actual || (res.error ? `Error: ${res.error}` : 'No output'),
          passed: isPassed,
          executionTime: res.executionTime || '35ms'
        }
      ]);

      if (res.error) {
        setConsoleOutput(`Notice:\n${res.error}`);
      } else {
        setConsoleOutput(`Execution complete (${res.executionTime || '35ms'}).\nResult: ${actual || 'No output'}`);
      }
    } catch (e) {
      setConsoleOutput(`Execution could not complete: ${e.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Solution against all test cases
  const handleSubmitCode = async () => {
    if (isSubmitting || isRunning) return;
    setIsSubmitting(true);
    setActiveTabRight('results');
    setConsoleOutput('Validating your solution across all test cases...');

    try {
      const results = [];
      let allPassed = true;
      const langKey = LANG_KEY_MAP[language] || 'python';

      for (const tc of testCases) {
        const res = await executeCodeOnline(code, langKey, tc.input, challenge);
        const actual = (res.output || '').trim();
        const normActual = normalize(actual);
        const normExpected = normalize(tc.expected);
        const isPassed = !res.error && (normActual === normExpected || (normExpected && normActual.includes(normExpected)));

        if (!isPassed) allPassed = false;

        results.push({
          id: tc.id,
          input: tc.input,
          expected: tc.expected,
          actual: actual || (res.error ? `Error: ${res.error}` : 'No output'),
          passed: isPassed,
          executionTime: res.executionTime || '30ms'
        });
      }

      setTestResults(results);

      if (allPassed && results.length > 0) {
        setIsSolved(true);
        setShowSuccessBanner(true);
        setConsoleOutput(`Success! All ${results.length} of ${results.length} test cases passed.\n+${challenge.xpReward} XP earned and added to your profile!`);

        // Record in localStorage
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          const saved = raw ? JSON.parse(raw) : {};
          saved[challenge.title] = true;
          localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        } catch (e) {}

        // Record gamification activity
        recordActivity(userEmail, 'dsa');

        // Update coding score in db
        try {
          const existingScore = dbService.getTestScore('coding', userEmail);
          const newCount = (existingScore?.solvedCount || 0) + 1;
          const newPct = Math.min(100, Math.round((newCount / 396) * 100));
          dbService.saveTestScore('coding', newPct, userEmail, { solvedCount: newCount });
        } catch (e) {}

        if (onProblemSolved) {
          onProblemSolved();
        }
      } else {
        const passedCount = results.filter(r => r.passed).length;
        setConsoleOutput(`Check Required: ${passedCount} of ${results.length} test cases matched. Review edge cases and try again.`);
      }
    } catch (e) {
      setConsoleOutput(`Submission error: ${e.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopySolution = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedSolution(true);
    setTimeout(() => setCopiedSolution(false), 3000);
  };

  return (
    <div style={{ flex: 1, backgroundColor: '#F8FAFC', minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', fontFamily: 'var(--font-inter)' }}>
      
      {/* Top Header Bar */}
      <header style={{
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid #E2E8F0',
        padding: '14px 28px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="btn-secondary-spec"
            style={{ padding: '7px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>

          <div style={{ height: 24, width: 1, backgroundColor: '#E2E8F0' }} />

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '2px 8px', borderRadius: 4, backgroundColor: '#F3F4F6', color: '#111827' }}>
                DAILY SPOTLIGHT
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, backgroundColor: '#F3F4F6', color: '#111827' }}>
                {challenge.difficulty}
              </span>
              {isSolved && (
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: 4, backgroundColor: '#111827', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Check size={12} strokeWidth={3} /> Completed
                </span>
              )}
            </div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 0 0' }}>
              {challenge.title}
            </h1>
          </div>
        </div>

        {/* Right Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'right', marginRight: 8 }}>
            <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, display: 'block' }}>REWARD</span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827' }}>+{challenge.xpReward} XP</span>
          </div>

          <button
            onClick={handleRunCode}
            disabled={isRunning || isSubmitting}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: '1px solid #CBD5E1',
              backgroundColor: '#FFFFFF',
              color: '#334155',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: (isRunning || isSubmitting) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6
            }}
          >
            <Play size={14} /> {isRunning ? 'Running...' : 'Run Code'}
          </button>

          <button
            onClick={handleSubmitCode}
            disabled={isSubmitting || isRunning}
            style={{
              padding: '8px 22px',
              borderRadius: 8,
              border: 'none',
              backgroundColor: '#475569',
              color: '#FFFFFF',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: (isSubmitting || isRunning) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)'
            }}
          >
            <CheckCircle2 size={14} /> {isSubmitting ? 'Checking...' : 'Submit Solution'}
          </button>
        </div>
      </header>

      {/* Success Notification Banner */}
      {showSuccessBanner && (
        <div style={{
          backgroundColor: '#F3F4F6',
          borderBottom: '1px solid #E5E7EB',
          padding: '12px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <CheckCircle2 size={18} color="#475569" />
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1E293B' }}>
              Challenge Completed! All test cases passed. +{challenge.xpReward} XP has been awarded.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('gamification')}
            style={{
              padding: '6px 14px',
              fontSize: '0.8rem',
              fontWeight: 700,
              backgroundColor: '#475569',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer'
            }}
          >
            View Streaks & Badges
          </button>
        </div>
      )}

      {/* Main Split Layout */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: 12, gap: 12 }}>
        
        {/* Left Side: Problem & Approach Tabs */}
        <div style={{
          flex: 1,
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          {/* Left Panel Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #E2E8F0',
            backgroundColor: '#F8FAFC',
            padding: '0 16px'
          }}>
            {[
              ['description', 'Problem Statement'],
              ['approach', 'Strategy & Guidance'],
              ['solution', 'Reference Solution']
            ].map(([id, label]) => (
              <button
                key={id}
                onClick={() => setActiveTabLeft(id)}
                style={{
                  padding: '12px 18px',
                  fontSize: '0.85rem',
                  fontWeight: activeTabLeft === id ? 700 : 500,
                  color: activeTabLeft === id ? '#111827' : '#64748B',
                  borderBottom: activeTabLeft === id ? '2px solid #111827' : '2px solid transparent',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Left Panel Content */}
          <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
            
            {/* Description Tab */}
            {activeTabLeft === 'description' && (
              <div>
                <div style={{ display: 'flex', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.78rem', color: '#475569', backgroundColor: '#F1F5F9', padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}>
                    Topic: {challenge.category}
                  </span>
                  <span style={{ fontSize: '0.78rem', color: '#475569', backgroundColor: '#F1F5F9', padding: '4px 10px', borderRadius: 6, fontWeight: 600 }}>
                    Frequent In: {challenge.company || 'Top Tech Companies'}
                  </span>
                </div>

                <div style={{ fontSize: '0.92rem', color: '#334155', lineHeight: 1.7, marginBottom: 24, whiteSpace: 'pre-line' }}>
                  {problemMeta.description}
                </div>

                {/* Examples */}
                {problemMeta.examples && problemMeta.examples.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: 12 }}>
                      Examples
                    </h3>
                    {problemMeta.examples.map((ex, idx) => (
                      <div key={idx} style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                        <div style={{ fontSize: '0.85rem', color: '#0F172A', fontWeight: 700, marginBottom: 4 }}>Example {idx + 1}:</div>
                        <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-code)', color: '#334155', marginBottom: 4 }}>
                          <strong>Input:</strong> {ex.input}
                        </div>
                        <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-code)', color: '#334155', marginBottom: 4 }}>
                          <strong>Output:</strong> {ex.output}
                        </div>
                        {ex.explanation && (
                          <div style={{ fontSize: '0.8rem', color: '#64748B', marginTop: 4 }}>
                            <strong>Explanation:</strong> {ex.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {problemMeta.constraints && (
                  <div>
                    <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: 10 }}>
                      Constraints
                    </h3>
                    <ul style={{ paddingLeft: 20, fontSize: '0.82rem', color: '#475569', lineHeight: 1.8 }}>
                      {problemMeta.constraints.map((c, idx) => (
                        <li key={idx} style={{ fontFamily: 'var(--font-code)' }}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Approach Tab */}
            {activeTabLeft === 'approach' && (
              <div>
                <div style={{ backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <Lightbulb size={18} color="#111827" />
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827' }}>Intuition & Key Idea</span>
                  </div>
                  <p style={{ fontSize: '0.88rem', color: '#111827', lineHeight: 1.6, margin: 0 }}>
                    {problemMeta.approach || 'Analyze the constraints, understand the problem invariant, and choose the most optimal data structure.'}
                  </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                  <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Time Complexity</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: 4 }}>O(N) Optimal</div>
                  </div>
                  <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 14 }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Space Complexity</div>
                    <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', marginTop: 4 }}>O(1) Auxiliary</div>
                  </div>
                </div>

                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', marginBottom: 8 }}>
                    Important Edge Cases
                  </h3>
                  <ul style={{ paddingLeft: 20, fontSize: '0.85rem', color: '#475569', lineHeight: 1.8 }}>
                    <li>Empty or single-element inputs</li>
                    <li>Negative numbers and zero</li>
                    <li>Duplicate values matching target sums</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Solution Tab */}
            {activeTabLeft === 'solution' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                    Reference {language} Solution
                  </h3>
                  <button
                    onClick={() => handleCopySolution(problemMeta.solutionCode?.[LANG_STARTER_KEYS[language]] || problemMeta.solutionCode?.Python || '')}
                    className="btn-secondary-spec"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                  >
                    {copiedSolution ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedSolution ? 'Copied' : 'Copy Solution'}</span>
                  </button>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 16 }}>
                  <pre style={{
                    margin: 0,
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-code)',
                    color: '#0F172A',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-wrap'
                  }}>
                    {problemMeta.solutionCode?.[LANG_STARTER_KEYS[language]] || problemMeta.solutionCode?.Python || '// Reference solution available'}
                  </pre>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Right Side: Code Editor & Execution Results */}
        <div style={{
          flex: 1.1,
          backgroundColor: '#FFFFFF',
          borderRadius: 14,
          border: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
        }}>
          {/* Top Language & Panel Switcher */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
            padding: '8px 16px'
          }}>
            {/* Language Selector */}
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              {['Python', 'Java', 'C++', 'JavaScript'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageChange(lang)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid',
                    borderColor: language === lang ? '#475569' : '#E2E8F0',
                    backgroundColor: language === lang ? '#475569' : '#FFFFFF',
                    color: language === lang ? '#FFFFFF' : '#475569',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  {lang}
                </button>
              ))}

              <button
                onClick={() => {
                  const key = LANG_STARTER_KEYS[language];
                  const starter = challenge.starterCode?.[key] || problemMeta.starterCode?.[key] || '';
                  if (starter) setCode(starter);
                  setTestResults([]);
                  setConsoleOutput('');
                }}
                title="Reset code to original template"
                style={{
                  padding: '6px 10px',
                  borderRadius: 6,
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#FFFFFF',
                  color: '#64748B',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <RotateCcw size={12} /> Reset Template
              </button>
            </div>

            {/* Right Tabs */}
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => setActiveTabRight('code')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: activeTabRight === 'code' ? '#E2E8F0' : 'transparent',
                  color: '#0F172A',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Editor
              </button>
              <button
                onClick={() => setActiveTabRight('results')}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  backgroundColor: activeTabRight === 'results' ? '#E2E8F0' : 'transparent',
                  color: '#0F172A',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Test Results
              </button>
            </div>
          </div>

          {/* Editor Area */}
          {activeTabRight === 'code' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
              <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                spellCheck={false}
                placeholder="Write your code here..."
                style={{
                  flex: 1,
                  width: '100%',
                  height: '100%',
                  padding: '18px 20px',
                  border: 'none',
                  outline: 'none',
                  resize: 'none',
                  fontSize: '0.9rem',
                  fontFamily: 'var(--font-code)',
                  color: '#0F172A',
                  backgroundColor: '#FFFFFF',
                  lineHeight: 1.6
                }}
              />
            </div>
          )}

          {/* Results Area */}
          {activeTabRight === 'results' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: 20 }}>
              
              {/* Test Cases Selector Pills & Clear Button */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 8 }}>
                  {testCases.map((tc, idx) => {
                    const res = testResults.find(r => r.id === tc.id);
                    return (
                      <button
                        key={tc.id}
                        onClick={() => setActiveCaseIdx(idx)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: 6,
                          border: '1px solid',
                          borderColor: activeCaseIdx === idx ? '#111827' : '#E2E8F0',
                          backgroundColor: activeCaseIdx === idx ? '#F3F4F6' : '#F8FAFC',
                          color: res ? (res.passed ? '#111827' : '#111827') : (activeCaseIdx === idx ? '#111827' : '#475569'),
                          fontSize: '0.8rem',
                          fontWeight: 700,
                          cursor: 'pointer'
                        }}
                      >
                        Case {idx + 1} {res ? (res.passed ? '✓' : '✕') : ''}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => {
                    setTestResults([]);
                    setConsoleOutput('');
                  }}
                  title="Clear test output and console logs"
                  style={{
                    padding: '5px 10px',
                    borderRadius: 6,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    color: '#64748B',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                >
                  <Trash2 size={12} /> Clear Output
                </button>
              </div>

              {/* Selected Case Breakdown */}
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: 4 }}>INPUT:</div>
                <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-code)', color: '#0F172A', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: 10, borderRadius: 6, marginBottom: 12 }}>
                  {testCases[activeCaseIdx]?.input}
                </div>

                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#64748B', marginBottom: 4 }}>EXPECTED OUTPUT:</div>
                <div style={{ fontSize: '0.82rem', fontFamily: 'var(--font-code)', color: '#0F172A', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', padding: 10, borderRadius: 6 }}>
                  {testCases[activeCaseIdx]?.expected}
                </div>
              </div>

              {/* Console Output Block */}
              <div style={{ flex: 1, backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 10, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#475569', marginBottom: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Terminal size={14} /> EXECUTION DETAILS
                  </div>
                  {consoleOutput && (
                    <button
                      onClick={() => setConsoleOutput('')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748B',
                        cursor: 'pointer',
                        fontSize: '0.72rem',
                        fontWeight: 600
                      }}
                    >
                      Clear Log
                    </button>
                  )}
                </div>
                <pre style={{
                  margin: 0,
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-code)',
                  color: '#1E293B',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap'
                }}>
                  {consoleOutput || 'Click "Run Code" or "Submit Solution" to test your solution.'}
                </pre>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
