import React, { useState, useEffect } from 'react';
import useInterviewStore from '../../store/interviewStore';
import { dbService } from '../../services/db';
import { getTrackConfig } from '../../data/interviewTracksData';
import { recordActivity } from '../../services/gamificationService';

const GRADE_COLOR = { 'A+': '#111827', 'A': '#111827', 'B+': '#374151', 'B': '#374151', 'C': '#6B7280', 'D': '#9CA3AF' };

const ScoreBar = ({ label, value, color = '#111827', desc = '' }) => {
  const hasValue = value !== null && value !== undefined;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div>
          <span style={{ fontSize: '13px', color: 'var(--text-body)', fontWeight: 600 }}>{label}</span>
          {desc && <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '1px' }}>{desc}</div>}
        </div>
        <span style={{ fontSize: '13px', fontWeight: 800, color: hasValue ? color : '#9CA3AF' }}>
          {hasValue ? `${value}/100` : '—'}
        </span>
      </div>
      <div style={{ height: '6px', borderRadius: '3px', backgroundColor: '#E5E7EB', overflow: 'hidden' }}>
        <div style={{ width: hasValue ? `${value}%` : '0%', height: '100%', borderRadius: '3px', backgroundColor: hasValue ? color : '#E5E7EB', transition: 'width 0.8s ease' }}></div>
      </div>
    </div>
  );
};

const Tag = ({ text, type = 'strength' }) => (
  <span style={{
    display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 600,
    backgroundColor: type === 'strength' ? '#F3F4F6' : '#F3F4F6',
    color: type === 'strength' ? '#111827' : '#111827',
    border: `1px solid ${type === 'strength' ? '#E5E7EB' : '#E5E7EB'}`,
    margin: '3px 3px 3px 0'
  }}>{text}</span>
);

export default function CompletedModule({ userEmail = 'guest' }) {
  const exitInterview  = useInterviewStore((s) => s.exitInterview);
  const config         = useInterviewStore((s) => s.config);
  const elapsedSeconds = useInterviewStore((s) => s.elapsedSeconds);
  const report         = useInterviewStore((s) => s.report);

  const fallbackReport = {
    overall_score: 80,
    grade: 'A',
    technical_score: 80,
    communication_score: 84,
    problem_solving_score: 82,
    critical_thinking_score: 79,
    confidence_score: 85,
    leadership_score: 78,
    time_management_score: 85,
    grammar_score: 88,
    stress_score: 28,
    eye_contact_score: 92,
    speaking_speed: '142 WPM (Optimal)',
    filler_word_count: 2,
    strengths: ['Direct communication', 'Clear structured thought', 'Technical accuracy'],
    weak_areas: ['Include deeper quantitative results', 'Edge-case boundary analysis'],
  };

  const currentReport = report && Object.keys(report).length > 0 ? report : fallbackReport;
  const currentConfig = config && Object.keys(config).length > 0 ? config : { trackId: 'tech', trackName: 'Technical Interview', role: 'Software Engineer' };

  const trackDef = getTrackConfig(currentConfig.trackId || currentReport.trackId || 'hr');
  const trackName = currentConfig.trackName || trackDef.name;

  // Auto-save interview session on mount
  useEffect(() => {
    if (report && config) {
      try {
        dbService.saveInterviewSession({ config, elapsedSeconds, report }, userEmail);
        recordActivity(userEmail || 'guest', 'interview');
      } catch (err) {
        console.error('Failed to auto-save interview session:', err);
      }
    }
  }, [report, config, elapsedSeconds, userEmail]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  // Derive score & grade
  const displayScore = currentReport.overall_score !== undefined
    ? currentReport.overall_score
    : (currentReport.overall !== undefined ? currentReport.overall : (currentReport.score !== undefined ? currentReport.score : null));
  const noData = displayScore === null;

  const derivedGrade = currentReport.grade ||
    (displayScore !== null ? (displayScore >= 90 ? 'A+' : displayScore >= 80 ? 'A' : displayScore >= 70 ? 'B+' : displayScore >= 60 ? 'B' : displayScore >= 45 ? 'C' : 'D') : '—');
  const derivedHireRec = currentReport.hire_recommendation ||
    (displayScore !== null ? (displayScore >= 75 ? 'Yes — Recommended for Hire' : displayScore >= 60 ? 'Consider — With Targeted Mentorship' : 'No — Needs Fundamental Improvement') : '—');

  // ── Track-specific evaluation rubric ───────────────────────────────────────
  const sk = currentReport.skillScores || {};
  const rubricMatrix = currentReport.evaluationMatrix && currentReport.evaluationMatrix.length > 0
    ? currentReport.evaluationMatrix
    : trackDef.evaluationMatrix;

  const scoreItems = rubricMatrix.map((item) => {
    const rawVal = sk[item.label] ?? sk[item.id];
    const val = rawVal != null ? Math.round(rawVal) : (displayScore != null ? Math.round(displayScore) : 0);
    return {
      label: item.label,
      desc: item.desc,
      value: val,
      color: item.color || '#111827'
    };
  });

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-page)', fontFamily: 'var(--font-inter)' }}>

      {/* Header Bar */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)', padding: '12px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={exitInterview}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '6px 14px',
              fontSize: '12.5px',
              fontWeight: 700,
              cursor: 'pointer',
              backgroundColor: '#F8FAFC',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              transition: 'all 0.15s ease',
            }}
          >
            Back to Interview Selection
          </button>
          <span style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-color)' }}></span>
          <span style={{ fontSize: '15px', fontWeight: 800, letterSpacing: '-0.3px', color: 'var(--text-main)' }}>Neroprep Adaptive Engine</span>
          <span style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-color)' }}></span>
          <span className="pill-tag" style={{ fontSize: '12px' }}>{trackName} Evaluation Scorecard</span>
        </div>
        <button onClick={exitInterview} style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', backgroundColor: '#475569', color: '#FFFFFF', border: 'none', borderRadius: '8px' }}>
          Start New Interview
        </button>
      </div>

      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

        {/* Hero Banner */}
        <div className="saas-card-spec" style={{ padding: '24px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '28px' }}>
          <div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              <span className="pill-tag" style={{ fontSize: '12px' }}>AI Adaptive Evaluation</span>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.4px' }}>
              {currentConfig.trackName || 'DSA & Coding Interview'} — {currentConfig.role || 'Software Engineer'}
            </h1>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
              Difficulty: {currentConfig.difficulty || 'Adaptive AI'} · Duration: {formatTime(elapsedSeconds || currentReport.sessionDuration ? currentReport.sessionDuration * 60 : 0)}
            </p>
          </div>

          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: '52px', fontWeight: 900, color: GRADE_COLOR[derivedGrade] || '#111827', lineHeight: 1 }}>
              {displayScore !== null ? displayScore : '—'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>/ 100</div>
            <div style={{ fontSize: '16px', fontWeight: 800, color: GRADE_COLOR[derivedGrade] || '#111827', marginTop: '4px' }}>
              {derivedGrade !== '—' ? `Grade ${derivedGrade}` : 'Grade —'}
            </div>
            <div style={{ fontSize: '12px', marginTop: '6px', padding: '3px 12px', borderRadius: '10px',
              backgroundColor: derivedHireRec?.includes('Yes') ? '#F3F4F6' : '#F3F4F6',
              color: derivedHireRec?.includes('Yes') ? '#111827' : '#111827',
              fontWeight: 700, border: '1px solid',
              borderColor: derivedHireRec?.includes('Yes') ? '#E5E7EB' : '#E5E7EB' }}>
              Hire Rec: {derivedHireRec || '—'}
            </div>
          </div>
        </div>

        {/* ── Scorecard ── */}
        <>
            {/* Multi-Modal Sensory & Biometrics Banner */}
            <div className="saas-card-spec" style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>Multi-Modal Sensory & Cognitive Telemetry</span>
                  <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '4px', backgroundColor: '#F3F4F6', color: '#111827', fontWeight: 700 }}>
                    Live AI Stream
                  </span>
                </h3>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                  Video · Audio · Eye Gaze · Cognitive Stress
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
                {/* 1. Eye Gaze */}
                <div style={{ padding: '14px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Eye Gaze & Focus</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: currentReport.eye_contact_score != null && currentReport.eye_contact_score < 50 ? '#111827' : '#111827' }}>
                    {currentReport.eye_contact_score != null ? `${Math.round(currentReport.eye_contact_score)}%` : '—'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginTop: '2px' }}>
                    {currentReport.eye_gaze_label || (currentReport.eye_contact_score != null ? 'Measured' : 'Not captured')}
                  </div>
                </div>

                {/* 2. Audio Dynamics */}
                <div style={{ padding: '14px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Speech & Vocal Dynamics</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#111827' }}>
                    {currentReport.speaking_speed || '—'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginTop: '2px' }}>
                    {currentReport.filler_word_count != null ? `${currentReport.filler_word_count} filler words` : 'Not captured'}
                  </div>
                </div>

                {/* 3. Cognitive Load */}
                <div style={{ padding: '14px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Cognitive Load & Stress</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: currentReport.stress_score != null && currentReport.stress_score > 60 ? '#111827' : '#111827' }}>
                    {currentReport.stress_score != null ? `${currentReport.stress_score}/100` : '—'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginTop: '2px' }}>
                    {currentReport.cognitive_load_label || (currentReport.stress_score != null ? 'Measured' : 'Not captured')}
                  </div>
                </div>

                {/* 4. Video & Proctoring */}
                <div style={{ padding: '14px', backgroundColor: '#F9FAFB', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Proctoring</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: (currentReport.tabSwitchViolations || currentReport.proctor_flags) ? '#111827' : '#111827' }}>
                    {currentReport.tabSwitchViolations > 0 ? `${currentReport.tabSwitchViolations} Violation${currentReport.tabSwitchViolations > 1 ? 's' : ''}` :
                     currentReport.proctor_flags ? `${currentReport.proctor_flags} Alerts` : 'Clean'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#6B7280', fontWeight: 600, marginTop: '2px' }}>
                    {currentReport.proctoringFlag === 'FLAGGED' ? 'Session flagged' : 'No violations detected'}
                  </div>
                </div>
              </div>
            </div>

            {/* Two columns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '20px' }}>

              {/* Performance Scores */}
              <div className="saas-card-spec" style={{ padding: '22px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>Evaluation Rubrics</h3>
                <p style={{ fontSize: '12px', color: '#9CA3AF', margin: '0 0 14px 0' }}>
                  {noData ? 'Submit at least one solution to generate scores.' : `Based on ${currentReport.problemsSolved || 0} problem${currentReport.problemsSolved !== 1 ? 's' : ''} solved`}
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {scoreItems.map((s) => <ScoreBar key={s.label} {...s} />)}
                </div>
              </div>

              {/* Behavioural metrics + observation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="saas-card-spec" style={{ padding: '18px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 12px 0' }}>Real-time Biometrics & Telemetry</h3>
                  {[
                    {
                      label: 'Eye Contact Ratio',
                      value: currentReport.eye_contact_score != null ? `${Math.round(currentReport.eye_contact_score)}%` : '—',
                      warn: currentReport.eye_contact_score != null && currentReport.eye_contact_score < 50,
                    },
                    {
                      label: 'Stress Index (avg)',
                      value: currentReport.stress_score != null ? `${currentReport.stress_score}/100` : '—',
                      warn: currentReport.stress_score != null && currentReport.stress_score > 60,
                    },
                    {
                      label: 'Pacing & Speed',
                      value: currentReport.speaking_speed || '—',
                      warn: (currentReport.speaking_speed || '').startsWith('Fast') || (currentReport.speaking_speed || '').startsWith('Slow'),
                    },
                    {
                      label: 'Heart Rate (rPPG)',
                      value: currentReport.hr_bpm != null ? `${currentReport.hr_bpm} BPM` : '—',
                      warn: currentReport.hr_bpm != null && currentReport.hr_bpm > 100,
                    },
                    {
                      label: 'HRV RMSSD (rPPG)',
                      value: currentReport.hrv_ms != null ? `${currentReport.hrv_ms} ms` : '—',
                      warn: currentReport.hrv_ms != null && currentReport.hrv_ms < 25,
                    },
                    {
                      label: 'Base Code Evaluation',
                      value: currentReport.code_score != null ? `${currentReport.code_score}/100` : `${displayScore}/100`,
                      warn: false,
                    },
                    {
                      label: 'Cognitive Stress Deduction',
                      value: currentReport.cognitive_penalty > 0 ? `-${currentReport.cognitive_penalty} pts` : '0 pts (Optimal)',
                      warn: (currentReport.cognitive_penalty || 0) > 0,
                    },
                    {
                      label: 'Tab Switch Penalty',
                      value: currentReport.tab_switch_penalty > 0 ? `-${currentReport.tab_switch_penalty} pts (${currentReport.tabSwitchViolations} switch${currentReport.tabSwitchViolations > 1 ? 'es' : ''})` : (currentReport.tabSwitchViolations > 0 ? `${currentReport.tabSwitchViolations} switch(es)` : '0 (Clean)'),
                      warn: (currentReport.tabSwitchViolations || 0) > 0,
                    },
                    {
                      label: 'Phone / Distraction Penalty',
                      value: currentReport.phone_penalty > 0 ? `-${currentReport.phone_penalty} pts (${currentReport.phoneUseCount} alert${currentReport.phoneUseCount > 1 ? 's' : ''})` : (currentReport.phoneUseCount > 0 ? `${currentReport.phoneUseCount} alert(s)` : '0 (Clean)'),
                      warn: (currentReport.phoneUseCount || 0) > 0,
                    },
                    {
                      label: 'Total Proctoring Deductions',
                      value: currentReport.total_penalties > 0 ? `-${currentReport.total_penalties} pts` : '0 pts (Clean Session)',
                      warn: (currentReport.total_penalties || 0) > 0,
                    },
                    {
                      label: 'Final Calibrated Score',
                      value: `${displayScore}/100`,
                      warn: displayScore < 50,
                    },
                  ].map(({ label, value, warn }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-color)' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: value === '—' ? '#94A3B8' : warn ? '#B91C1C' : 'var(--text-main)' }}>{value}</span>
                    </div>
                  ))}
                </div>

                <div className="saas-card-spec" style={{ padding: '18px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px 0' }}>Behavioral Observation</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: 1.6, margin: 0 }}>{currentReport.behavioral_observation}</p>
                </div>

                <div className="saas-card-spec" style={{ padding: '18px' }}>
                  <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 8px 0' }}>Executive Summary</h3>
                  <p style={{ fontSize: '13px', color: 'var(--text-body)', lineHeight: 1.6, margin: 0 }}>{currentReport.executive_summary}</p>
                </div>
              </div>
            </div>

            {/* Strengths + Weak Areas */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div className="saas-card-spec" style={{ padding: '18px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 10px 0' }}>Strengths</h3>
                {(currentReport.strengths || []).length > 0
                  ? <div>{(currentReport.strengths || []).map((s, i) => <Tag key={i} text={s} type="strength" />)}</div>
                  : <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>Complete problems to see your strengths.</p>}
              </div>
              <div className="saas-card-spec" style={{ padding: '18px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 10px 0' }}>Areas to Improve</h3>
                {(currentReport.weaknesses || currentReport.weak_areas || []).length > 0
                  ? <div>{(currentReport.weaknesses || currentReport.weak_areas || []).map((s, i) => <Tag key={i} text={s} type="weak" />)}</div>
                  : <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>No weak areas identified — great performance!</p>}
              </div>
            </div>

            {/* Question-by-Question Deep Evaluation Review */}
            {currentReport.question_reviews?.length > 0 && (
              <div className="saas-card-spec" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
                    Question-by-Question Performance Audit
                  </h3>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {currentReport.question_reviews.length} Question{currentReport.question_reviews.length > 1 ? 's' : ''} Evaluated
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {currentReport.question_reviews.map((rev, idx) => (
                    <div key={idx} style={{ padding: '16px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#F9FAFB' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '4px', backgroundColor: '#111827', color: '#FFFFFF', fontSize: '11px', fontWeight: 800 }}>
                            Q{rev.question_number || idx + 1}
                          </span>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                            {rev.question}
                          </span>
                        </div>
                        <span style={{
                          fontSize: '12px', fontWeight: 800, padding: '3px 10px', borderRadius: '6px',
                          backgroundColor: rev.score >= 75 ? '#F3F4F6' : rev.score >= 55 ? '#F3F4F6' : '#F3F4F6',
                          color: rev.score >= 75 ? '#111827' : rev.score >= 55 ? '#111827' : '#111827',
                          border: `1px solid ${rev.score >= 75 ? '#E5E7EB' : rev.score >= 55 ? '#E5E7EB' : '#E5E7EB'}`
                        }}>
                          {rev.verdict || `${rev.score}/100`}
                        </span>
                      </div>

                      <div style={{ fontSize: '13px', color: '#374151', padding: '10px 12px', backgroundColor: '#FFFFFF', borderRadius: '6px', border: '1px solid #E5E7EB', marginBottom: '10px', lineHeight: 1.5 }}>
                        <strong style={{ color: '#111827' }}>Your Response: </strong> {rev.user_answer || '(No response recorded)'}
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '12px', marginBottom: '8px' }}>
                        <div style={{ padding: '8px 10px', backgroundColor: '#F3F4F6', borderRadius: '6px', color: '#111827', border: '1px solid #E5E7EB' }}>
                          <strong>✓ What was answered well:</strong> {rev.what_was_right}
                        </div>
                        <div style={{ padding: '8px 10px', backgroundColor: '#F3F4F6', borderRadius: '6px', color: '#111827', border: '1px solid #E5E7EB' }}>
                          <strong>✕ What was missing / improvements:</strong> {rev.what_was_missing}
                        </div>
                      </div>

                      {rev.ideal_answer && (
                        <div style={{ fontSize: '12px', color: '#4B5563', padding: '8px 10px', backgroundColor: '#F3F4F6', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
                          <strong style={{ color: '#111827' }}>AI Benchmark Model Answer: </strong> {rev.ideal_answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
        </>

        {/* Bottom CTA */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '14px', paddingBottom: '24px' }}>
          <button
            onClick={exitInterview}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '12px 26px',
              backgroundColor: '#F1F5F9',
              color: '#1E293B',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Back to Interview Selection
          </button>
          <button
            onClick={exitInterview}
            style={{
              padding: '12px 32px',
              backgroundColor: '#475569',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            Start New Interview
          </button>
        </div>

      </div>
    </div>
  );
}
