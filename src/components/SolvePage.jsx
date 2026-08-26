import React, { useState, useCallback, useRef, useEffect } from 'react';
import { executeCodeOnline } from '../services/compilerService';
import { getProblemData } from '../data/problemData';
import { recordActivity } from '../services/gamificationService';

// ── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:      '#FFFFFF',
  bgPage:  '#F9FAFB',
  bgDark:  '#111827',
  bgCard:  '#F3F4F6',
  border:  '#E5E7EB',
  bdark:   '#374151',
  black:   '#111827',
  body:    '#374151',
  muted:   '#6B7280',
  light:   '#9CA3AF',
  mono:    'JetBrains Mono, Consolas, monospace',
  sans:    'Inter, system-ui, sans-serif',
};

const DIFF_BADGE = {
  Easy:   { color: '#111827', bg: '#F3F4F6', border: '#E5E7EB' },
  Medium: { color: '#111827', bg: '#F3F4F6', border: '#E5E7EB' },
  Hard:   { color: '#111827', bg: '#F3F4F6', border: '#E5E7EB' },
};

const LANGS = ['Python', 'Java', 'C++', 'JavaScript'];
const LANG_KEY = { Python: 'python', Java: 'java', 'C++': 'cpp', JavaScript: 'javascript' };
const LANG_CODE_KEY = { Python: 'Python', Java: 'Java', 'C++': 'Cpp', JavaScript: 'JavaScript' };

// ── Tab Button ───────────────────────────────────────────────────────────────
function Tab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '8px 16px',
      fontSize: '13px',
      fontWeight: 600,
      fontFamily: C.sans,
      background: 'none',
      border: 'none',
      borderBottom: active ? `2px solid ${C.black}` : '2px solid transparent',
      color: active ? C.black : C.muted,
      cursor: 'pointer',
      transition: 'all 0.15s',
    }}>{label}</button>
  );
}

// ── Language Tab ─────────────────────────────────────────────────────────────
function LangBtn({ lang, active, onClick }) {
  return (
    <button onClick={() => onClick(lang)} style={{
      padding: '5px 13px',
      fontSize: '12px',
      fontWeight: 600,
      fontFamily: C.sans,
      borderRadius: '5px',
      border: active ? '1px solid #475569' : `1px solid ${C.border}`,
      backgroundColor: active ? '#475569' : C.bg,
      color: active ? '#FFF' : C.body,
      cursor: 'pointer',
    }}>{lang}</button>
  );
}

// ── Render description with inline code and bold ──────────────────────────────
function ProblemDesc({ text }) {
  const parts = (text || '').split('\n');
  return (
    <div style={{ fontSize: '13.5px', color: C.body, lineHeight: 1.75 }}>
      {parts.map((line, i) => {
        const segments = line.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
        return (
          <p key={i} style={{ margin: '0 0 8px' }}>
            {segments.map((seg, j) => {
              if (seg.startsWith('`') && seg.endsWith('`')) {
                return (
                  <code key={j} style={{
                    fontFamily: C.mono, fontSize: '12.5px',
                    backgroundColor: '#F3F4F6', padding: '1px 5px',
                    borderRadius: '4px', color: C.black,
                  }}>
                    {seg.slice(1, -1)}
                  </code>
                );
              }
              if (seg.startsWith('**') && seg.endsWith('**')) {
                return <strong key={j} style={{ color: C.black }}>{seg.slice(2, -2)}</strong>;
              }
              return <span key={j}>{seg}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

// ── Test Case Result Badge ────────────────────────────────────────────────────
function StatusBadge({ result }) {
  if (!result) return (
    <span style={{ fontSize: '11px', fontWeight: 600, color: C.light, padding: '2px 7px', border: `1px solid ${C.border}`, borderRadius: '4px', backgroundColor: C.bg }}>
      Pending
    </span>
  );
  return (
    <span style={{
      fontSize: '11px', fontWeight: 700, padding: '2px 8px',
      borderRadius: '4px',
      backgroundColor: result.passed ? '#F3F4F6' : '#F3F4F6',
      color: result.passed ? '#111827' : '#111827',
      border: `1px solid ${result.passed ? '#E5E7EB' : '#E5E7EB'}`,
    }}>
      {result.passed ? 'Passed' : 'Failed'}
    </span>
  );
}

// ── Test Case Row ─────────────────────────────────────────────────────────────
function TestCaseRow({ tc, result, isActive, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '10px 14px',
        borderRadius: '8px',
        border: `1px solid ${isActive ? C.bdark : C.border}`,
        backgroundColor: isActive ? C.bgCard : C.bg,
        cursor: 'pointer',
        marginBottom: '8px',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: C.black }}>
          Case {tc.id}
        </span>
        <StatusBadge result={result} />
      </div>

      {isActive && (
        <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div style={{ fontFamily: C.mono, fontSize: '12px' }}>
            <span style={{ color: C.muted, fontWeight: 600, fontFamily: C.sans }}>Input: </span>
            <code style={{ color: C.black, backgroundColor: C.bgCard, padding: '1px 6px', borderRadius: '3px' }}>
              {tc.input}
            </code>
          </div>
          <div style={{ fontFamily: C.mono, fontSize: '12px' }}>
            <span style={{ color: C.muted, fontWeight: 600, fontFamily: C.sans }}>Expected: </span>
            <code style={{ color: C.black, backgroundColor: C.bgCard, padding: '1px 6px', borderRadius: '3px' }}>
              {tc.expected}
            </code>
          </div>
          {result && (
            <div style={{ fontFamily: C.mono, fontSize: '12px' }}>
              <span style={{ color: result.passed ? '#111827' : '#111827', fontWeight: 600, fontFamily: C.sans }}>Got: </span>
              <code style={{
                color: result.passed ? '#111827' : '#111827',
                backgroundColor: result.passed ? '#F3F4F6' : '#F3F4F6',
                padding: '1px 6px', borderRadius: '3px'
              }}>
                {result.actual || '(no output)'}
              </code>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Approach & Intuition Section (Displayed Before Solution Code) ──────────────
function ApproachSection({ problemData, pattern, question }) {
  const approachText = problemData.approach || pattern?.description || 'Apply optimal pattern-based algorithm strategy.';
  const timeComp = problemData.complexity?.time || pattern?.complexity?.time || 'O(N)';
  const spaceComp = problemData.complexity?.space || pattern?.complexity?.space || 'O(1)';

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Section Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: 800, color: C.black }}>
            💡 Approach & Intuition
          </span>
          {pattern?.name && (
            <span style={{
              fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px',
              backgroundColor: '#F3F4F6', color: '#111827', border: '1px solid #E5E7EB'
            }}>
              {pattern.name}
            </span>
          )}
        </div>
      </div>

      {/* Core Strategy Card */}
      <div style={{
        backgroundColor: C.bgCard,
        border: `1px solid ${C.border}`,
        borderRadius: '8px',
        padding: '14px 16px',
        marginBottom: '14px',
        lineHeight: 1.7,
      }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: C.black, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
          Intuition & Core Strategy:
        </div>
        <ProblemDesc text={approachText} />
      </div>

      {/* Complexity Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
        <div style={{
          backgroundColor: '#F3F4F6',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '10px 14px',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>
            ⏱ Time Complexity
          </div>
          <div style={{ fontFamily: C.mono, fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>
            {timeComp}
          </div>
          <div style={{ fontSize: '11.5px', color: '#111827', marginTop: '2px' }}>
            Optimal single-pass or logarithmic scaling
          </div>
        </div>

        <div style={{
          backgroundColor: '#F3F4F6',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          padding: '10px 14px',
        }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#111827', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '3px' }}>
            💾 Space Complexity
          </div>
          <div style={{ fontFamily: C.mono, fontSize: '13.5px', fontWeight: 700, color: '#111827' }}>
            {spaceComp}
          </div>
          <div style={{ fontSize: '11.5px', color: '#111827', marginTop: '2px' }}>
            Auxiliary memory allocation
          </div>
        </div>
      </div>

      {/* Step-by-Step Algorithm Execution */}
      <div style={{
        backgroundColor: '#F9FAFB',
        border: `1px solid ${C.border}`,
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '16px',
      }}>
        <div style={{ fontSize: '12px', fontWeight: 700, color: C.black, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
          Step-by-Step Algorithm Walkthrough:
        </div>
        <ol style={{ margin: 0, paddingLeft: '18px', color: C.body, fontSize: '13px', lineHeight: 1.7 }}>
          <li><strong>Initialization:</strong> Set up required pointers, hash map, or frequency counters.</li>
          <li><strong>Traversal & Invariants:</strong> Loop through the input while maintaining the pattern properties and boundary limits.</li>
          <li><strong>Condition Trigger:</strong> Check target matches or update optimal running values upon satisfying conditions.</li>
          <li><strong>Return:</strong> Return the aggregated answer or formatted collection once iteration terminates.</li>
        </ol>
      </div>

      {/* Edge Cases */}
      <div style={{
        backgroundColor: '#F3F4F6',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '12.5px',
        color: '#111827',
        lineHeight: 1.6,
      }}>
        <strong>⚠️ Edge Cases to Consider:</strong> Empty inputs, single-element collections, duplicate values, negative numbers, and boundary overflow limits.
      </div>
    </div>
  );
}

// ── Main SolvePage ─────────────────────────────────────────────────────────────
export default function SolvePage({ question, pattern, onBack, onComplete, isSolved: initialSolved }) {
  const problemData = getProblemData(question.title, question, pattern);
  // Ensure all testcases are transparent public cases
  const testCases = (problemData.testCases || []).map((tc, idx) => ({
    ...tc,
    id: idx + 1,
    isPublic: true,
  }));

  const userEmail = localStorage.getItem('neuroprep_user_session')
    ? JSON.parse(localStorage.getItem('neuroprep_user_session')).email
    : 'guest';
  const LOCAL_STORAGE_KEY = `neuroprep_dsa_solved_${userEmail.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;

  const [isCompleted, setIsCompleted] = useState(() => {
    if (initialSolved) return true;
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw);
        return !!saved[question.title];
      }
    } catch (_) {}
    return false;
  });

  const [leftTab,  setLeftTab]  = useState('problem'); // 'problem' | 'solution'
  const [rightTab, setRightTab] = useState('code');    // 'code' | 'testcases'

  const [language, setLanguage] = useState('Python');
  const [code,     setCode]     = useState(() => {
    const key = LANG_CODE_KEY['Python'];
    return question.starterCode?.[key] || problemData.starterCode?.[key] || `# Write your solution here\npass`;
  });

  const [running,        setRunning]        = useState(false);
  const [submitting,     setSubmitting]     = useState(false);
  const [testResults,    setTestResults]    = useState([]);
  const [activeCase,     setActiveCase]     = useState(testCases[0]?.id ?? 1);
  const [consoleOutput,  setConsoleOutput]  = useState('');
  const [solutionLang,   setSolutionLang]   = useState('Python');
  const [solCopied,      setSolCopied]      = useState(false);
  const [submitSuccess,  setSubmitSuccess]  = useState(false);

  const textareaRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [question?.title]);

  const handleCopySol = useCallback((codeText) => {
    if (!codeText) return;
    try {
      navigator.clipboard.writeText(codeText);
      setSolCopied(true);
      setTimeout(() => setSolCopied(false), 2000);
    } catch (_) {}
  }, []);

  const handleClearOutput = useCallback(() => {
    setTestResults([]);
    setConsoleOutput('');
    setSubmitSuccess(false);
  }, []);

  const handleLangChange = useCallback((lang) => {
    setLanguage(lang);
    const key = LANG_CODE_KEY[lang];
    setCode(question.starterCode?.[key] || problemData.starterCode?.[key] || `// Write your ${lang} solution here`);
    setTestResults([]);
    setConsoleOutput('');
  }, [question, problemData]);

  // Execute test cases
  const runAllTestCases = useCallback(async () => {
    const langKey = LANG_KEY[language] || 'python';
    const normalize = (s) => String(s || '')
      .trim()
      .replace(/\s+/g, '')
      .replace(/,\s*/g, ',')
      .toLowerCase();

    const results = await Promise.all(testCases.map(async (tc) => {
      try {
        const res = await executeCodeOnline(code, langKey, tc.input, question);

        if (res.error && !res.output) {
          return { id: tc.id, passed: false, actual: res.error, executionTime: res.executionTime, memory: res.memory };
        }

        const actual = (res.output || '').trim();
        const normActual   = normalize(actual);
        const normExpected = normalize(tc.expected);
        const passed = normActual === normExpected || normActual.includes(normExpected);

        return { id: tc.id, passed, actual: actual || '(no output)', executionTime: res.executionTime, memory: res.memory };
      } catch (err) {
        return { id: tc.id, passed: false, actual: `Error: ${err.message}` };
      }
    }));

    return results;
  }, [code, language, testCases, question]);

  // Run button handler
  const handleRun = useCallback(async () => {
    if (running || !code.trim()) return;
    setRunning(true);
    setRightTab('testcases');
    setConsoleOutput('Compiling and running against all test cases...');
    setTestResults([]);

    try {
      const results = await runAllTestCases();
      setTestResults(results);
      const passed = results.filter(r => r.passed).length;
      const total  = results.length;
      setConsoleOutput(`${passed} / ${total} test cases passed.`);
      if (results.length > 0) setActiveCase(results[0].id);
    } catch (e) {
      setConsoleOutput(`Execution Error: ${e.message}`);
    } finally {
      setRunning(false);
    }
  }, [code, running, runAllTestCases]);

  // Submit button handler: runs all test cases and marks question as completed when all pass
  const handleSubmit = useCallback(async () => {
    if (submitting || !code.trim()) return;
    setSubmitting(true);
    setRightTab('testcases');
    setConsoleOutput('Submitting solution to LeetCode Judge engine...');
    setSubmitSuccess(false);

    try {
      const results = await runAllTestCases();
      setTestResults(results);
      const passed = results.filter(r => r.passed).length;
      const total  = results.length;

      if (passed === total && total > 0) {
        // Mark as completed
        setIsCompleted(true);
        setSubmitSuccess(true);
        try {
          const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
          const saved = raw ? JSON.parse(raw) : {};
          saved[question.title] = true;
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(saved));
          recordActivity(userEmail, 'dsa');
        } catch (_) {}

        if (onComplete) {
          onComplete(question.title);
        }

        setConsoleOutput(`🎉 Accepted! All ${total}/${total} test cases passed. Question set as Completed ✓`);
      } else {
        setConsoleOutput(`Wrong Answer: ${passed} / ${total} test cases passed. Review your logic and edge cases.`);
      }

      if (results.length > 0) setActiveCase(results[0].id);
    } catch (e) {
      setConsoleOutput(`Submission Error: ${e.message}`);
    } finally {
      setSubmitting(false);
    }
  }, [code, submitting, runAllTestCases, question.title, LOCAL_STORAGE_KEY, onComplete]);

  const diff = DIFF_BADGE[question.difficulty] || DIFF_BADGE.Medium;
  const passedCount = testResults.filter(r => r.passed).length;
  const totalCount  = testResults.length;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#F3F4F6',
      fontFamily: C.sans,
      overflow: 'hidden',
    }}>

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div style={{
        height: '46px',
        backgroundColor: C.bg,
        borderBottom: `1px solid ${C.border}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        gap: '12px',
        flexShrink: 0,
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      }}>
        <button onClick={() => onBack && onBack(isCompleted ? question.title : null)} style={{
          display: 'flex', alignItems: 'center', gap: '5px',
          padding: '5px 12px', borderRadius: '6px',
          border: `1px solid ${C.border}`, backgroundColor: C.bg,
          fontSize: '12px', fontWeight: 600, color: C.body, cursor: 'pointer',
        }}>
          Practice Sheet
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
          <span style={{ fontSize: '13.5px', fontWeight: 700, color: C.black, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {question.title}
          </span>
          <span style={{
            padding: '2px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
            flexShrink: 0,
            backgroundColor: diff.bg, color: diff.color, border: `1px solid ${diff.border}`,
          }}>
            {question.difficulty}
          </span>
          {isCompleted && (
            <span style={{
              padding: '2px 9px', borderRadius: '12px', fontSize: '11px', fontWeight: 700,
              flexShrink: 0,
              backgroundColor: '#E2E8F0', color: '#475569', border: '1px solid #CBD5E1',
            }}>
              Completed ✓
            </span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {question.url && (
            <a href={question.url} target="_blank" rel="noopener noreferrer" style={{
              padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
              border: `1px solid ${C.border}`, backgroundColor: C.bg, color: C.body,
              textDecoration: 'none',
            }}>
              LeetCode
            </a>
          )}
          <button onClick={handleRun} disabled={running || submitting} style={{
            padding: '6px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 700,
            border: `1px solid ${C.border}`, backgroundColor: C.bg,
            color: (running || submitting) ? C.muted : C.black, cursor: (running || submitting) ? 'not-allowed' : 'pointer',
          }}>
            {running ? 'Running...' : 'Run'}
          </button>
          <button onClick={handleSubmit} disabled={submitting || running} style={{
            padding: '6px 20px', borderRadius: '6px', fontSize: '13px', fontWeight: 700,
            border: 'none', backgroundColor: '#475569',
            color: '#FFF', cursor: (submitting || running) ? 'not-allowed' : 'pointer',
            opacity: (submitting || running) ? 0.7 : 1,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}>
            {submitting ? 'Submitting...' : 'Submit'}
          </button>
        </div>
      </div>

      {/* ── Main Body ───────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, display: 'flex', gap: '16px', padding: '16px 20px', overflow: 'hidden' }}>

        {/* ── Left Panel ─────────────────────────────────────────────────── */}
        <div style={{
          width: '42%', minWidth: '340px', backgroundColor: C.bg,
          borderRadius: '10px', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          border: `1px solid ${C.border}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          {/* Tabs */}
          <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, padding: '0 14px', flexShrink: 0 }}>
            <Tab label="Problem" active={leftTab === 'problem'} onClick={() => setLeftTab('problem')} />
            <Tab label="Solution" active={leftTab === 'solution'} onClick={() => setLeftTab('solution')} />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>

            {leftTab === 'problem' && (
              <>
                {/* Title + difficulty */}
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: C.black, marginBottom: '8px' }}>
                  {question.title}
                </h2>

                {/* Pattern tag */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px',
                    backgroundColor: C.bgCard, color: C.muted, border: `1px solid ${C.border}`,
                  }}>
                    {pattern?.name}
                  </span>
                  {pattern?.complexity && (
                    <>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px', backgroundColor: C.bgCard, color: C.muted, border: `1px solid ${C.border}` }}>
                        Time: {pattern.complexity.time}
                      </span>
                      <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '12px', backgroundColor: C.bgCard, color: C.muted, border: `1px solid ${C.border}` }}>
                        Space: {pattern.complexity.space}
                      </span>
                    </>
                  )}
                </div>

                {/* Description */}
                <ProblemDesc text={problemData.description} />

                {/* Examples */}
                {problemData.examples && problemData.examples.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    {problemData.examples.map((ex, i) => (
                      <div key={i} style={{ marginBottom: '16px' }}>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: C.black, marginBottom: '8px' }}>
                          Example {i + 1}
                        </div>
                        <div style={{
                          backgroundColor: C.bgCard, border: `1px solid ${C.border}`,
                          borderRadius: '8px', padding: '12px 14px',
                          fontSize: '12.5px', fontFamily: C.mono, color: C.body,
                          lineHeight: 1.6,
                        }}>
                          <div><strong style={{ color: C.muted }}>Input:</strong> {ex.input}</div>
                          <div><strong style={{ color: C.muted }}>Output:</strong> {ex.output}</div>
                          {ex.explanation && (
                            <div style={{ marginTop: '6px', color: C.muted, fontSize: '12px', fontFamily: C.sans }}>
                              <strong>Explanation:</strong> {ex.explanation}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Constraints */}
                {problemData.constraints && problemData.constraints.length > 0 && (
                  <div style={{ marginTop: '20px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: C.black, marginBottom: '8px' }}>
                      Constraints
                    </div>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '12.5px', color: C.body, lineHeight: 1.8 }}>
                      {problemData.constraints.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {leftTab === 'solution' && (
              <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      {LANGS.map(l => (
                        <button
                          key={l}
                          onClick={() => setSolutionLang(l)}
                          style={{
                            padding: '4px 10px', fontSize: '11.5px', fontWeight: 600,
                            borderRadius: '4px', cursor: 'pointer',
                            border: solutionLang === l ? '1px solid #475569' : `1px solid ${C.border}`,
                            backgroundColor: solutionLang === l ? '#475569' : C.bg,
                            color: solutionLang === l ? '#FFF' : C.body,
                          }}
                        >{l}</button>
                      ))}
                    </div>
                    <button
                      onClick={() => handleCopySol(problemData.solutionCode?.[LANG_CODE_KEY[solutionLang]] || '')}
                      style={{
                        padding: '4px 10px', fontSize: '11.5px', fontWeight: 600,
                        borderRadius: '4px', cursor: 'pointer',
                        border: `1px solid ${C.border}`, backgroundColor: C.bg,
                        color: solCopied ? '#111827' : C.body,
                      }}
                    >
                      {solCopied ? 'Copied ✓' : 'Copy Code'}
                    </button>
                  </div>

                  <pre style={{
                    margin: 0, padding: '14px',
                    backgroundColor: '#1E293B',
                    border: `1px solid ${C.border}`,
                    borderRadius: '8px',
                    fontFamily: C.mono, fontSize: '12.5px',
                    lineHeight: 1.6, color: '#F8FAFC',
                    overflowX: 'auto',
                  }}>
                    {problemData.solutionCode?.[LANG_CODE_KEY[solutionLang]] || '// Solution code available'}
                  </pre>
              </div>
            )}
          </div>
        </div>

        {/* ── Right Panel ────────────────────────────────────────────────── */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          backgroundColor: C.bg, borderRadius: '10px',
          overflow: 'hidden', border: `1px solid ${C.border}`,
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
        }}>
          {/* Top Bar: Language Select */}
          <div style={{
            height: '42px', borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 14px', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              {LANGS.map(l => (
                <LangBtn key={l} lang={l} active={language === l} onClick={handleLangChange} />
              ))}
              <button
                onClick={() => {
                  const key = LANG_CODE_KEY[language];
                  setCode(question.starterCode?.[key] || problemData.starterCode?.[key] || `// Write your ${language} solution here`);
                  handleClearOutput();
                }}
                title="Reset code template"
                style={{
                  padding: '3px 8px',
                  borderRadius: '5px',
                  border: `1px solid ${C.border}`,
                  backgroundColor: C.bg,
                  color: C.muted,
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginLeft: '4px'
                }}
              >
                Reset Template
              </button>
            </div>

            {submitSuccess && (
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827' }}>
                ✓ Completed & Solved
              </span>
            )}
          </div>

          {/* Code Editor */}
          <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
            <textarea
              ref={textareaRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Write your code here..."
              spellCheck={false}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                outline: 'none',
                padding: '16px',
                fontFamily: C.mono,
                fontSize: '13.5px',
                lineHeight: 1.6,
                backgroundColor: C.bg,
                color: C.black,
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Test cases & Output Drawer */}
          <div style={{
            height: '240px', borderTop: `1px solid ${C.border}`,
            display: 'flex', flexDirection: 'column',
            backgroundColor: C.bg, overflow: 'hidden', flexShrink: 0,
          }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, padding: '0 14px', flexShrink: 0, alignItems: 'center' }}>
              <Tab label="Test Cases" active={rightTab === 'testcases'} onClick={() => setRightTab('testcases')} />
              <Tab label="Console" active={rightTab === 'console'} onClick={() => setRightTab('console')} />
              
              <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                {(testResults.length > 0 || consoleOutput) && (
                  <button
                    onClick={handleClearOutput}
                    title="Clear test results and console output"
                    style={{
                      padding: '3px 8px',
                      borderRadius: '5px',
                      border: `1px solid ${C.border}`,
                      backgroundColor: C.bgCard,
                      color: C.muted,
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Clear Output
                  </button>
                )}
                {testResults.length > 0 && (
                  <span style={{
                    fontSize: '12px', fontWeight: 700,
                    color: passedCount === totalCount ? '#111827' : '#111827',
                  }}>
                    {passedCount} / {totalCount} passed
                  </span>
                )}
              </div>
            </div>

            <div style={{ flex: 1, overflow: 'auto', padding: '12px 14px' }}>
              {rightTab === 'testcases' ? (
                <div style={{ display: 'flex', gap: '12px', height: '100%' }}>
                  {/* Case list */}
                  <div style={{ width: '120px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
                    {testCases.map(tc => {
                      const result = testResults.find(r => r.id === tc.id);
                      const isActive = activeCase === tc.id;
                      return (
                        <button
                          key={tc.id}
                          onClick={() => setActiveCase(tc.id)}
                          style={{
                            padding: '6px 10px', borderRadius: '6px', textAlign: 'left',
                            border: `1px solid ${isActive ? C.bdark : C.border}`,
                            backgroundColor: isActive ? C.bgCard : C.bg,
                            cursor: 'pointer', fontSize: '12px', fontWeight: 600,
                            color: !result ? C.muted : result.passed ? '#111827' : '#111827',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          }}
                        >
                          <span>Case {tc.id}</span>
                          {result && (
                            <span style={{ fontSize: '10px' }}>
                              {result.passed ? '●' : '○'}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Case detail */}
                  <div style={{ flex: 1, overflow: 'auto' }}>
                    {(() => {
                      const tc = testCases.find(t => t.id === activeCase) || testCases[0];
                      const result = testResults.find(r => r.id === activeCase);
                      if (!tc) return <div style={{ fontSize: '13px', color: C.light }}>Select a test case.</div>;
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Input</div>
                            <pre style={{ margin: 0, fontFamily: C.mono, fontSize: '12.5px', backgroundColor: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '6px 10px', color: C.black, whiteSpace: 'pre-wrap' }}>{tc.input}</pre>
                          </div>
                          <div>
                            <div style={{ fontSize: '11px', fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Expected Output</div>
                            <pre style={{ margin: 0, fontFamily: C.mono, fontSize: '12.5px', backgroundColor: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '6px', padding: '6px 10px', color: C.black, whiteSpace: 'pre-wrap' }}>{tc.expected}</pre>
                          </div>
                          {result && (
                            <div>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: result.passed ? '#111827' : '#111827', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
                                Your Output ({result.passed ? 'Accepted' : 'Wrong Answer'})
                              </div>
                              <pre style={{
                                margin: 0,
                                fontFamily: C.mono,
                                fontSize: '12.5px',
                                backgroundColor: result.passed ? '#F3F4F6' : '#F3F4F6',
                                border: `1px solid ${result.passed ? '#E5E7EB' : '#E5E7EB'}`,
                                borderRadius: '6px',
                                padding: '6px 10px',
                                color: result.passed ? '#111827' : '#111827',
                                whiteSpace: 'pre-wrap'
                              }}>
                                {result.actual || '(no output)'}
                              </pre>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              ) : (
                <pre style={{
                  margin: 0, fontFamily: C.mono, fontSize: '12.5px',
                  color: C.body, whiteSpace: 'pre-wrap', lineHeight: 1.5,
                }}>
                  {consoleOutput || 'Press Run or Submit to execute your code against the LeetCode test suite.'}
                </pre>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
