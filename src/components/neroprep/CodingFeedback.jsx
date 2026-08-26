import React, { useState } from 'react';

// ── Shared tokens matching the app's index.css design system ─────────────────
const T = {
  bg:         '#FFFFFF',
  bgPage:     '#F8F9FA',
  bgCard:     '#F3F4F6',
  border:     '#E5E7EB',
  borderDark: '#D1D5DB',
  textMain:   '#111827',
  textBody:   '#374151',
  textMuted:  '#6B7280',
  textLight:  '#9CA3AF',
  black:      '#111827',
  shadow:     '0 1px 3px rgba(0,0,0,0.06)',
};

/** ── Weighted score bar ──────────────────────────────────────────────────── */
function ScoreBar({ label, score, max }) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const barColor = pct >= 75 ? '#111827' : pct >= 50 ? '#4B5563' : '#9CA3AF';
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
        <span style={{ fontSize: '13px', color: T.textBody, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: '13px', color: T.textMuted, fontFamily: 'JetBrains Mono, monospace' }}>
          {score}/{max}
        </span>
      </div>
      <div style={{ height: '4px', borderRadius: '2px', backgroundColor: T.border }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          backgroundColor: barColor,
          borderRadius: '2px',
          transition: 'width 0.7s ease',
        }} />
      </div>
    </div>
  );
}

/** ── Test case result row ────────────────────────────────────────────────── */
function TestCaseTable({ testsPassed, testsTotal, failedCases = [] }) {
  const allPassed = testsPassed === testsTotal;
  return (
    <div>
      {/* Summary */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px',
        padding: '14px 16px',
        borderRadius: '8px',
        backgroundColor: allPassed ? '#F9FAFB' : '#F3F4F6',
        border: `1px solid ${T.border}`,
        marginBottom: '14px',
      }}>
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          backgroundColor: allPassed ? '#111827' : '#9CA3AF',
          flexShrink: 0,
        }} />
        <div>
          <div style={{ fontWeight: 700, fontSize: '14px', color: T.textMain }}>
            {testsPassed} / {testsTotal} test cases passed
          </div>
          {!allPassed && (
            <div style={{ fontSize: '12px', color: T.textMuted, marginTop: '2px' }}>
              {testsTotal - testsPassed} case{testsTotal - testsPassed > 1 ? 's' : ''} failed
            </div>
          )}
        </div>
      </div>

      {/* Failed case details */}
      {failedCases.length > 0 && (
        <div>
          <div style={{
            fontSize: '11px', fontWeight: 700, color: T.textLight,
            textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px',
          }}>
            Failed Cases
          </div>
          {failedCases.map((fc, i) => (
            <div key={i} style={{
              padding: '10px 14px',
              borderRadius: '6px',
              backgroundColor: T.bgCard,
              border: `1px solid ${T.border}`,
              marginBottom: '6px',
              fontSize: '13px',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              <div style={{ color: T.textMuted, fontFamily: 'Inter, sans-serif', marginBottom: '6px', fontSize: '12px' }}>
                Case #{fc.index}
              </div>
              <div style={{ color: T.textBody }}>Input: {fc.stdin || '(empty)'}</div>
              <div style={{ color: T.textMain, fontWeight: 600 }}>Got: {fc.actual || '(no output)'}</div>
              {fc.error && (
                <div style={{ color: T.textMuted, marginTop: '4px', fontSize: '12px' }}>
                  {fc.error.slice(0, 120)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** ── Main CodingFeedback component ─────────────────────────────────────── */
export default function CodingFeedback({ result, onOptimize, onNextProblem, onEndSession }) {
  const [tab, setTab] = useState('score');

  if (!result) return null;

  const {
    outcome, total = 0, breakdown = {}, test_summary = {},
    ai_verdict, ai_analysis, followup_prompt,
    is_brute_force, optimization_hint, complexity_analysis,
    isCheatDetected = false, cheatVerdict, cheatViolations = [], edgeCaseScore = 100,
  } = result;

  const OUTCOME_LABELS = {
    optimal:            'Optimal',
    correct_nonoptimal: 'Correct — Not Optimal',
    partially_correct:  'Partially Correct',
    incorrect:          'Incorrect',
    cheating_detected:  '⚠️ Integrity Flag: Hardcoded / Non-Algorithmic',
  };

  const TABS = [
    { id: 'score',  label: 'Score' },
    { id: 'tests',  label: 'Test Cases' },
    { id: 'review', label: 'AI Review' },
  ];

  return (
    <div style={{
      height: '100%', overflowY: 'auto',
      fontFamily: 'Inter, system-ui, sans-serif',
      backgroundColor: T.bg,
    }}>

      {/* ── Anti-Cheat Banner ─────────────────────────────────────────────── */}
      {isCheatDetected && (
        <div style={{
          backgroundColor: '#FFF1F2',
          borderBottom: '1px solid #FECDD3',
          padding: '14px 20px',
          color: '#9F1239',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '13.5px' }}>
            <span>⚠️ Anti-Cheat Evaluation Alert: Hardcoded Solution Detected</span>
          </div>
          <div style={{ fontSize: '12.5px', marginTop: '4px', lineHeight: 1.5, color: '#BE123C' }}>
            {cheatVerdict || 'Solution directly matches static test-case inputs or returns constant stubs without executing generalizable algorithmic logic.'}
          </div>
          {cheatViolations.length > 0 && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: '#881337', backgroundColor: '#FFE4E6', padding: '8px 12px', borderRadius: '6px' }}>
              <strong>Detected Signatures:</strong>
              <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                {cheatViolations.map((v, i) => (
                  <li key={i} style={{ marginBottom: '2px' }}>{v}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div style={{
        padding: '16px 20px',
        borderBottom: `1px solid ${T.border}`,
        display: 'flex', alignItems: 'center', gap: '14px',
      }}>
        {/* Score ring */}
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          border: isCheatDetected ? '2px solid #E11D48' : '2px solid #111827',
          backgroundColor: isCheatDetected ? '#FFF1F2' : 'transparent',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{ fontSize: '16px', fontWeight: 800, color: isCheatDetected ? '#E11D48' : T.textMain }}>{total}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: isCheatDetected ? '#E11D48' : T.textMain }}>
            {OUTCOME_LABELS[outcome] || 'Result'}
          </div>
          {ai_verdict && (
            <div style={{ fontSize: '13px', color: T.textMuted, marginTop: '2px', lineHeight: 1.5 }}>
              {ai_verdict}
            </div>
          )}
        </div>
      </div>

      {/* ── Tab Bar ───────────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', borderBottom: `1px solid ${T.border}`,
        padding: '0 20px',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '10px 0', marginRight: '20px',
            fontSize: '13px', fontWeight: 600,
            border: 'none', cursor: 'pointer', background: 'transparent',
            color: tab === t.id ? T.textMain : T.textMuted,
            borderBottom: tab === t.id ? `2px solid ${T.textMain}` : '2px solid transparent',
            transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{ padding: '18px 20px' }}>

        {/* ── Score Tab ──────────────────────────────────────────────────── */}
        {tab === 'score' && breakdown && (
          <div>
            <div style={{
              fontSize: '11px', fontWeight: 700, color: T.textLight,
              textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '14px',
            }}>
              Score Breakdown
            </div>
            {breakdown.max_correctness  > 0 && <ScoreBar label="Correctness"      score={breakdown.correctness}      max={breakdown.max_correctness} />}
            {breakdown.max_time         > 0 && <ScoreBar label="Time Complexity"  score={breakdown.time_complexity}  max={breakdown.max_time} />}
            {breakdown.max_space        > 0 && <ScoreBar label="Space Complexity" score={breakdown.space_complexity} max={breakdown.max_space} />}
            {breakdown.max_tests        > 0 && <ScoreBar label="Test Cases"       score={breakdown.test_cases}       max={breakdown.max_tests} />}
            {breakdown.max_quality      > 0 && <ScoreBar label="Code Quality"     score={breakdown.code_quality}     max={breakdown.max_quality} />}
            {breakdown.max_edge         > 0 && <ScoreBar label="Edge Cases"       score={breakdown.edge_cases}       max={breakdown.max_edge} />}
            {breakdown.max_explanation  > 0 && <ScoreBar label="Explanation"      score={breakdown.explanation}      max={breakdown.max_explanation} />}

            {complexity_analysis && (
              <div style={{
                marginTop: '16px', padding: '12px 14px',
                borderRadius: '8px', backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`, fontSize: '13px',
              }}>
                <div style={{ fontWeight: 600, marginBottom: '6px', color: T.textMain }}>
                  Complexity Analysis
                </div>
                <div style={{ color: T.textMuted, lineHeight: 1.8, fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}>
                  <div>Detected: <span style={{ color: T.textMain }}>{complexity_analysis.detected_time}</span></div>
                  <div>Expected: <span style={{ color: T.textMain }}>{complexity_analysis.expected_time}</span></div>
                  <div style={{ fontFamily: 'Inter, sans-serif', fontSize: '12px' }}>
                    n limit: {complexity_analysis.n_upper?.toLocaleString()}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tests Tab ──────────────────────────────────────────────────── */}
        {tab === 'tests' && test_summary && (
          <TestCaseTable
            testsPassed={test_summary.passed}
            testsTotal={test_summary.total}
            failedCases={test_summary.failed_cases || []}
          />
        )}

        {/* ── AI Review Tab ──────────────────────────────────────────────── */}
        {tab === 'review' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ai_analysis && (
              <div style={{
                padding: '14px 16px',
                borderRadius: '8px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                fontSize: '13px', lineHeight: '1.7', color: T.textBody,
              }}>
                <div style={{
                  fontSize: '11px', fontWeight: 700, color: T.textLight,
                  textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px',
                }}>
                  Analysis
                </div>
                {ai_analysis}
              </div>
            )}

            {followup_prompt && (
              <div style={{
                padding: '14px 16px',
                borderRadius: '8px',
                backgroundColor: '#F9FAFB',
                border: `1px solid ${T.borderDark}`,
                fontSize: '13px', lineHeight: '1.7', color: T.textBody,
              }}>
                <div style={{
                  fontSize: '11px', fontWeight: 700, color: T.textLight,
                  textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px',
                }}>
                  Follow-up Question
                </div>
                {followup_prompt}
              </div>
            )}

            {optimization_hint && is_brute_force && (
              <div style={{
                padding: '14px 16px',
                borderRadius: '8px',
                backgroundColor: T.bgCard,
                border: `1px solid ${T.border}`,
                fontSize: '13px', lineHeight: '1.7', color: T.textMuted,
              }}>
                <div style={{
                  fontSize: '11px', fontWeight: 700, color: T.textLight,
                  textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '6px',
                }}>
                  Hint
                </div>
                {optimization_hint}
              </div>
            )}
          </div>
        )}

      </div>

      {/* ── Action Buttons ─────────────────────────────────────────────── */}
      <div style={{
        display: 'flex', gap: '8px', padding: '0 20px 20px',
        flexWrap: 'wrap',
      }}>
        {is_brute_force && onOptimize && (
          <button onClick={onOptimize} style={{
            padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            backgroundColor: T.black, color: '#FFFFFF',
            border: 'none', cursor: 'pointer', flex: 1, minWidth: '120px',
          }}>
            Try to Optimize
          </button>
        )}
        {onNextProblem && (
          <button onClick={onNextProblem} style={{
            padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            backgroundColor: T.black, color: '#FFFFFF',
            border: 'none', cursor: 'pointer', flex: 1, minWidth: '120px',
          }}>
            Next Problem
          </button>
        )}
        {onEndSession && (
          <button onClick={onEndSession} style={{
            padding: '9px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600,
            backgroundColor: T.bg, color: T.textBody,
            border: `1px solid ${T.border}`, cursor: 'pointer',
          }}>
            End Session
          </button>
        )}
      </div>
    </div>
  );
}
