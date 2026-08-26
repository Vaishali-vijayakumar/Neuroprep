import React, { useState } from 'react';
import { calculatePlacementReadiness } from '../services/aiEngine';
import { Download, TrendingUp, Brain, Code2, Mic2, Smile, BarChart2 } from 'lucide-react';

export default function Reports({ profile, moodState, interviewState, codingState, aptitudeState, setActiveTab }) {

  const readiness = calculatePlacementReadiness({
    codingScore: codingState.score,
    interviewScore: interviewState.lastScore,
    aptitudeScore: aptitudeState?.score || 0,
    communicationScore: interviewState.commScore,
    profileCompletion: profile?.name ? 80 : 40,
    stressManagement: moodState.stress > 0 ? Math.max(0, 100 - moodState.stress * 10) : 50
  });

  const METRICS = [
    { 
      label: 'Coding Score', 
      value: codingState.score || 0, 
      icon: Code2, 
      color: '#0284C7', 
      labelColor: '#0369A1', 
      cardBg: '#F0F9FF', 
      border: '#BAE6FD', 
      iconBg: '#E0F2FE',
      weight: '35%', 
      desc: `${codingState.solvedCount || 0} problems solved` 
    },
    { 
      label: 'Interview Score', 
      value: interviewState.lastScore || 0, 
      icon: Mic2, 
      color: '#9333EA', 
      labelColor: '#7E22CE', 
      cardBg: '#FAF5FF', 
      border: '#E9D5FF', 
      iconBg: '#F3E8FF',
      weight: '25%', 
      desc: `${interviewState.totalCompleted || 0} sessions completed` 
    },
    { 
      label: 'Aptitude & Reasoning', 
      value: aptitudeState?.score || 0, 
      icon: Brain, 
      color: '#059669', 
      labelColor: '#047857', 
      cardBg: '#ECFDF5', 
      border: '#A7F3D0', 
      iconBg: '#D1FAE5',
      weight: '20%', 
      desc: `${aptitudeState?.totalTests || 0} mock tests completed` 
    },
    { 
      label: 'Stress Management', 
      value: moodState.stress > 0 ? Math.max(0, 100 - moodState.stress * 10) : 0, 
      icon: Smile, 
      color: '#D97706', 
      labelColor: '#B45309', 
      cardBg: '#FFFBEB', 
      border: '#FDE68A', 
      iconBg: '#FEF3C7',
      weight: '10%', 
      desc: moodState.label || 'Not checked in' 
    },
  ];

  const getGrade = (score) => {
    if (score >= 85) return { grade: 'A', color: '#15803D', bg: '#DCFCE7', border: '#86EFAC' };
    if (score >= 70) return { grade: 'B', color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE' };
    if (score >= 55) return { grade: 'C', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A' };
    return { grade: 'D', color: '#9F1239', bg: '#FFE4E6', border: '#FECDD3' };
  };

  const readinessGrade = getGrade(readiness);

  const handleExport = () => {
    const report = {
      generated: new Date().toLocaleString(),
      candidate: profile?.name || 'Student',
      college: profile?.college || 'N/A',
      targetCompany: profile?.targetCompany || 'N/A',
      placementReadiness: readiness,
      grade: readinessGrade.grade,
      codingScore: codingState.score || 0,
      problemsSolved: codingState.solvedCount || 0,
      interviewScore: interviewState.lastScore || 0,
      interviewsCompleted: interviewState.totalCompleted || 0,
      communicationScore: interviewState.commScore || 0,
      moodStatus: moodState.label || 'N/A',
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuroprep_report_${Date.now()}.json`;
    a.click();
  };

  const RECOMMENDATIONS = [];
  if (!codingState.score || codingState.score < 60) RECOMMENDATIONS.push({ area: 'Coding Practice', tip: 'Solve at least 2 DSA problems daily. Focus on Arrays, Strings, and Linked Lists first.', tab: 'coding', priority: 'High' });
  if (!interviewState.lastScore || interviewState.lastScore < 70) RECOMMENDATIONS.push({ area: 'Mock Interviews', tip: 'Practice at least 3 mock interview rounds per week to build confidence and fluency.', tab: 'mock', priority: 'High' });
  if (moodState.stress >= 7) RECOMMENDATIONS.push({ area: 'Stress Management', tip: 'Your stress level is elevated. Try the Box Breathing or 5-4-3-2-1 Grounding exercises.', tab: 'recovery', priority: 'Medium' });
  if (RECOMMENDATIONS.length === 0) RECOMMENDATIONS.push({ area: 'Keep Going!', tip: 'You are on the right track. Maintain consistency and review weak topics periodically.', tab: 'dashboard', priority: 'Low' });

  return (
    <div style={{ padding: '36px 28px', maxWidth: 1080, margin: '0 auto', fontFamily: 'var(--font-inter)' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '1.75rem', color: '#0F172A', letterSpacing: '-0.5px', margin: 0 }}>
            Placement Readiness Report
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem', marginTop: 4, margin: 0 }}>
            Comprehensive psychological and technical analysis of your campus placement progress.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={() => setActiveTab && setActiveTab('dashboard')} 
            className="btn-secondary-spec"
            style={{ padding: '9px 18px', fontSize: '0.84rem', fontWeight: 600 }}
          >
            ← Back to Dashboard
          </button>
          <button onClick={handleExport} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '9px 18px',
            borderRadius: 8, border: '1.5px solid #E2E8F0', background: '#FFFFFF',
            cursor: 'pointer', fontWeight: 600, fontSize: '0.84rem', color: '#334155'
          }}>
            <Download size={15} /> Export JSON
          </button>
        </div>
      </div>

      {/* Overall Score Pastel Banner */}
      <div style={{ 
        background: 'linear-gradient(135deg, #F0FDF4 0%, #FFFFFF 50%, #EFF6FF 100%)', 
        border: '1.5px solid #CBD5E1', 
        borderRadius: 20, 
        padding: '32px 36px', 
        marginBottom: 28, 
        display: 'flex', 
        gap: 36, 
        alignItems: 'center', 
        flexWrap: 'wrap',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.03)'
      }}>
        <div style={{ textAlign: 'center', minWidth: '150px' }}>
          <div style={{ fontSize: '3.8rem', fontWeight: 900, color: '#0F172A', lineHeight: 1 }}>{readiness}%</div>
          <div style={{ color: '#64748B', fontSize: '0.82rem', fontWeight: 700, marginTop: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall Readiness</div>
          <div style={{
            display: 'inline-block', marginTop: 10, padding: '4px 16px',
            borderRadius: 20, background: readinessGrade.bg,
            border: `1px solid ${readinessGrade.border}`,
            color: readinessGrade.color, fontWeight: 800, fontSize: '0.95rem'
          }}>
            Grade {readinessGrade.grade}
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '1rem', marginBottom: 10 }}>Score Breakdown</div>
          <div style={{ height: 10, background: '#E2E8F0', borderRadius: 5, marginBottom: 16, overflow: 'hidden' }}>
            <div style={{ width: `${readiness}%`, height: '100%', background: readinessGrade.color, borderRadius: 5, transition: 'width 0.6s ease' }} />
          </div>
          <div style={{ color: '#475569', fontSize: '0.86rem', lineHeight: 1.8, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '6px' }}>
            <div>Candidate: <strong style={{ color: '#0F172A' }}>{profile?.name || 'Student'}</strong></div>
            <div>College: <strong style={{ color: '#0F172A' }}>{profile?.college || 'Not set'}</strong></div>
            <div>Target: <strong style={{ color: '#0F172A' }}>{profile?.targetCompany || 'Not set'} ({profile?.targetRole || 'SDE'})</strong></div>
            <div>Generated: <strong style={{ color: '#0F172A' }}>{new Date().toLocaleDateString()}</strong></div>
          </div>
        </div>
      </div>

      {/* Module Scores in Pastel Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18, marginBottom: 28 }}>
        {METRICS.map(m => {
          const Icon = m.icon;
          return (
            <div 
              key={m.label} 
              style={{ 
                background: m.cardBg, 
                border: `1.5px solid ${m.border}`, 
                borderRadius: 16, 
                padding: '22px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: m.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon size={18} color={m.color} />
                    </div>
                    <span style={{ fontWeight: 800, fontSize: '0.88rem', color: m.labelColor }}>{m.label}</span>
                  </div>
                  <span style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 700 }}>w: {m.weight}</span>
                </div>

                <div style={{ fontSize: '2.2rem', fontWeight: 900, color: m.value > 0 ? '#0F172A' : '#94A3B8', marginBottom: 8, lineHeight: 1 }}>
                  {m.value > 0 ? `${m.value}%` : '—'}
                </div>
              </div>

              <div>
                <div style={{ height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ width: `${m.value}%`, height: '100%', background: m.color, borderRadius: 3, transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ fontSize: '0.76rem', color: '#64748B', marginTop: 10, fontWeight: 600 }}>{m.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations with Pastel Badges */}
      <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: 18, padding: 28, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)' }}>
        <h2 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A', margin: '0 0 18px 0', letterSpacing: '-0.3px' }}>
          Actionable Recommendations & Next Steps
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {RECOMMENDATIONS.map((rec, i) => {
            const isHigh = rec.priority === 'High';
            const isMed = rec.priority === 'Medium';
            return (
              <div 
                key={i} 
                style={{
                  display: 'flex', 
                  gap: 16, 
                  padding: '16px 20px', 
                  borderRadius: 12,
                  border: '1.5px solid #E2E8F0', 
                  alignItems: 'center', 
                  background: '#F8FAFC',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                  <div style={{
                    padding: '4px 10px', 
                    borderRadius: 20, 
                    fontSize: '0.72rem', 
                    fontWeight: 800, 
                    flexShrink: 0,
                    background: isHigh ? '#FFE4E6' : isMed ? '#FEF3C7' : '#ECFDF5',
                    border: `1px solid ${isHigh ? '#FECDD3' : isMed ? '#FDE68A' : '#A7F3D0'}`,
                    color: isHigh ? '#9F1239' : isMed ? '#92400E' : '#065F46'
                  }}>
                    {rec.priority} Priority
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A', marginBottom: 2 }}>{rec.area}</div>
                    <div style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5 }}>{rec.tip}</div>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab(rec.tab)} 
                  className="btn-primary-spec"
                  style={{
                    padding: '8px 16px', 
                    borderRadius: 8, 
                    fontWeight: 700, 
                    fontSize: '0.8rem', 
                    flexShrink: 0 
                  }}
                >
                  Start Practice →
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

