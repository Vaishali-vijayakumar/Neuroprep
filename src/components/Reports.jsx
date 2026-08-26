import React, { useState, useEffect } from 'react';
import { calculatePlacementReadiness } from '../services/aiEngine';
import { dbService } from '../services/db';
import { 
  Download, 
  TrendingUp, 
  TrendingDown,
  Brain, 
  Code2, 
  Mic2, 
  Smile, 
  BarChart2, 
  CheckCircle2, 
  AlertCircle, 
  Target, 
  Layers, 
  Zap, 
  Award,
  ArrowRight
} from 'lucide-react';

export default function Reports({ profile = {}, moodState = {}, interviewState = {}, codingState = {}, aptitudeState = {}, setActiveTab }) {
  const userEmail = profile?.email || 'guest';
  const targetCompany = profile?.targetCompany || 'TCS';

  // Calculate current placement readiness score
  const readiness = calculatePlacementReadiness({
    codingScore: codingState?.score || 0,
    interviewScore: interviewState?.lastScore || 0,
    aptitudeScore: aptitudeState?.score || 0,
    communicationScore: interviewState?.commScore || 0,
    profileCompletion: profile?.name ? 85 : 50,
    stressManagement: moodState?.stress > 0 ? Math.max(0, 100 - moodState.stress * 10) : 50
  });

  // Load Report Snapshots & Previous Performance History
  const [reportHistory, setReportHistory] = useState(() => dbService.getReportHistory(userEmail));

  useEffect(() => {
    // Snapshot current report to db for historical tracking if tests were taken
    const hasActivity = (codingState?.score > 0 || interviewState?.lastScore > 0 || aptitudeState?.score > 0 || moodState?.stress > 0);
    if (hasActivity) {
      const currentSnapshot = {
        readiness,
        codingScore: codingState?.score || 0,
        solvedCount: codingState?.solvedCount || 0,
        interviewScore: interviewState?.lastScore || 0,
        aptitudeScore: aptitudeState?.score || 0,
        stress: moodState?.stress || 0,
        targetCompany
      };
      dbService.saveReportSnapshot(currentSnapshot, userEmail);
      setReportHistory(dbService.getReportHistory(userEmail));
    }
  }, [userEmail, readiness, codingState?.score, interviewState?.lastScore, aptitudeState?.score, moodState?.stress]);

  const prev = reportHistory.previousReport;

  // Calculate Improvement or Decrement Deltas
  const readinessDelta = prev ? readiness - (prev.readiness || 0) : 0;
  const codingDelta = prev ? (codingState?.score || 0) - (prev.codingScore || 0) : 0;
  const interviewDelta = prev ? (interviewState?.lastScore || 0) - (prev.interviewScore || 0) : 0;
  const aptitudeDelta = prev ? (aptitudeState?.score || 0) - (prev.aptitudeScore || 0) : 0;
  const stressDelta = prev ? (prev.stress || 0) - (moodState?.stress || 0) : 0; // Positive means stress decreased (improvement!)

  const getGrade = (score) => {
    if (score >= 85) return { grade: 'A', color: '#15803D', bg: '#DCFCE7', border: '#86EFAC', label: 'Placement Ready (Top Tier)' };
    if (score >= 70) return { grade: 'B', color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE', label: 'Strong Contender' };
    if (score >= 50) return { grade: 'C', color: '#B45309', bg: '#FEF3C7', border: '#FDE68A', label: 'Moderate Preparation' };
    return { grade: 'D', color: '#9F1239', bg: '#FFE4E6', border: '#FECDD3', label: 'Needs Structured Practice' };
  };

  const readinessGrade = getGrade(readiness);

  // Target Company Benchmarks
  const COMPANY_BENCHMARKS = {
    'TCS': { targetScore: 65, codingReq: 60, interviewReq: 65, aptiReq: 65 },
    'Infosys': { targetScore: 68, codingReq: 65, interviewReq: 65, aptiReq: 70 },
    'Wipro': { targetScore: 62, codingReq: 55, interviewReq: 60, aptiReq: 65 },
    'Cognizant': { targetScore: 65, codingReq: 60, interviewReq: 65, aptiReq: 65 },
    'Amazon': { targetScore: 85, codingReq: 85, interviewReq: 85, aptiReq: 80 },
    'Google': { targetScore: 90, codingReq: 90, interviewReq: 90, aptiReq: 85 },
    'Microsoft': { targetScore: 88, codingReq: 88, interviewReq: 85, aptiReq: 80 },
    'Goldman Sachs': { targetScore: 85, codingReq: 85, interviewReq: 80, aptiReq: 90 }
  };

  const targetBenchmark = COMPANY_BENCHMARKS[targetCompany] || COMPANY_BENCHMARKS['TCS'];
  const isTargetAchieved = readiness >= targetBenchmark.targetScore;

  // JSON Export Handler
  const handleExport = () => {
    const report = {
      reportType: 'Personalized Placement Readiness & Cognitive Audit',
      generated: new Date().toLocaleString(),
      candidate: profile?.name || 'Student',
      college: profile?.college || 'Engineering Student',
      targetCompany: targetCompany,
      overallReadiness: `${readiness}%`,
      readinessGrade: readinessGrade.grade,
      comparisonWithPrevious: {
        readinessDelta: `${readinessDelta >= 0 ? '+' : ''}${readinessDelta}%`,
        codingDelta: `${codingDelta >= 0 ? '+' : ''}${codingDelta}%`,
        interviewDelta: `${interviewDelta >= 0 ? '+' : ''}${interviewDelta}%`,
        aptitudeDelta: `${aptitudeDelta >= 0 ? '+' : ''}${aptitudeDelta}%`,
        stressReductionDelta: `${stressDelta >= 0 ? '+' : ''}${stressDelta} pts`
      },
      performanceBreakdown: {
        dsaPatterns: {
          score: `${codingState?.score || 0}%`,
          problemsSolved: codingState?.solvedCount || 0
        },
        mockInterview: {
          score: `${interviewState?.lastScore || 0}%`,
          completedRounds: interviewState?.totalCompleted || 0,
          communicationClarity: `${interviewState?.commScore || 0}%`
        },
        aptitudePractice: {
          accuracy: `${aptitudeState?.score || 0}%`,
          testsCompleted: aptitudeState?.totalTests || 0
        },
        cognitiveAndStress: {
          stressLevel: `${moodState?.stress || 0}/10`,
          status: moodState?.label || 'Calm'
        }
      }
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuroprep_personalized_report_${Date.now()}.json`;
    a.click();
  };

  // Dynamic Tailored Recommendations
  const RECOMMENDATIONS = [];
  if (!codingState?.score || codingState?.score < targetBenchmark.codingReq) {
    RECOMMENDATIONS.push({
      area: '99 DSA Patterns Mastery',
      priority: 'High',
      gap: `${Math.max(0, targetBenchmark.codingReq - (codingState?.score || 0))}% gap to target`,
      tip: `Focus on high-frequency patterns: Two Pointers, Sliding Window, and Tree Traversals. Solving 3 more problems will boost your coding score to meet ${targetCompany}'s hiring benchmark.`,
      tab: 'coding'
    });
  }
  if (!interviewState?.lastScore || interviewState?.lastScore < targetBenchmark.interviewReq) {
    RECOMMENDATIONS.push({
      area: 'Technical Mock Interview & Speech Precision',
      priority: 'High',
      gap: `${Math.max(0, targetBenchmark.interviewReq - (interviewState?.lastScore || 0))}% gap to target`,
      tip: `Complete at least 2 full Adaptive AI mock sessions. Focus on vocal cadence (130-150 WPM) and structuring answers using the STAR method.`,
      tab: 'mock'
    });
  }
  if (!aptitudeState?.score || aptitudeState?.score < targetBenchmark.aptiReq) {
    RECOMMENDATIONS.push({
      area: 'Aptitude & Speed Reasoning',
      priority: 'Medium',
      gap: `${Math.max(0, targetBenchmark.aptiReq - (aptitudeState?.score || 0))}% gap to target`,
      tip: `Practice timed Quantitative and Logical Reasoning drills to improve problem-solving speed under exam time pressure.`,
      tab: 'aptitude'
    });
  }
  if (moodState?.stress >= 6) {
    RECOMMENDATIONS.push({
      area: 'Stress Regulation & Mind Recovery',
      priority: 'High',
      gap: 'Elevated stress detected',
      tip: `Your cognitive stress is high (${moodState.stress}/10). Spend 3 minutes in Box Breathing or share your thoughts with NeuroCoach in your Placement Diary to clear anxiety.`,
      tab: 'journal'
    });
  }

  if (RECOMMENDATIONS.length === 0) {
    RECOMMENDATIONS.push({
      area: 'Placement Flow State',
      priority: 'Low',
      gap: 'All benchmarks satisfied',
      tip: `Outstanding progress! All your preparation scores exceed the benchmark for ${targetCompany}. Maintain daily consistency with 1 problem and 1 mock round.`,
      tab: 'coding'
    });
  }

  return (
    <div style={{ padding: '36px 28px', maxWidth: 1100, margin: '0 auto', fontFamily: 'var(--font-inter)' }}>
      
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="pill-tag" style={{ backgroundColor: '#F3F4F6', color: '#111827', fontWeight: 800, fontSize: '0.75rem' }}>
              Personalized Progress Audit
            </span>
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.75rem', color: '#111827', letterSpacing: '-0.5px', margin: 0 }}>
            Placement Readiness & Performance Analytics
          </h1>
          <p style={{ color: '#4B5563', fontSize: '0.9rem', marginTop: 4, margin: 0 }}>
            Comprehensive personalized evaluation across 99 DSA Patterns, AI Mock Interviews, Aptitude, and Cognitive Resilience.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button 
            onClick={() => setActiveTab && setActiveTab('dashboard')} 
            className="btn-secondary-spec"
            style={{ padding: '9px 18px', fontSize: '0.85rem', fontWeight: 600 }}
          >
            ← Back to Dashboard
          </button>
          <button 
            onClick={handleExport}
            className="btn-primary-spec"
            style={{ padding: '9px 18px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Download size={15} /> Export Audit Report (JSON)
          </button>
        </div>
      </div>

      {/* Main Overview & Performance Delta Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #E5E7EB',
        borderRadius: 20,
        padding: '30px 34px',
        marginBottom: 28,
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
        display: 'grid',
        gridTemplateColumns: '1.2fr 2fr',
        gap: '30px',
        alignItems: 'center'
      }}>
        
        {/* Left: Overall Readiness & Grade */}
        <div style={{ borderRight: '1px solid #F3F4F6', paddingRight: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Overall Placement Readiness
              </span>
              <div style={{ fontSize: '3.6rem', fontWeight: 900, color: '#111827', lineHeight: 1.1, margin: '6px 0' }}>
                {readiness}%
              </div>
            </div>
            <div style={{
              padding: '6px 14px',
              borderRadius: '20px',
              backgroundColor: readinessGrade.bg,
              border: `1px solid ${readinessGrade.border}`,
              color: readinessGrade.color,
              fontWeight: 800,
              fontSize: '0.9rem'
            }}>
              Grade {readinessGrade.grade}
            </div>
          </div>

          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: readinessGrade.color, marginBottom: '12px' }}>
            {readinessGrade.label}
          </div>

          {/* Previous Report Delta Indicator */}
          <div style={{
            padding: '10px 14px',
            borderRadius: '10px',
            backgroundColor: readinessDelta >= 0 ? '#F0FDF4' : '#FEF2F2',
            border: `1px solid ${readinessDelta >= 0 ? '#BBF7D0' : '#FECACA'}`,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            {readinessDelta >= 0 ? (
              <TrendingUp size={16} color="#15803D" />
            ) : (
              <TrendingDown size={16} color="#991B1B" />
            )}
            <div style={{ fontSize: '0.82rem', color: readinessDelta >= 0 ? '#166534' : '#991B1B', fontWeight: 600 }}>
              {prev ? (
                <span>
                  <strong>{readinessDelta >= 0 ? `+${readinessDelta}% Improvement` : `${readinessDelta}% Decrement`}</strong> compared to previous evaluation report
                </span>
              ) : (
                <span>Baseline evaluation recorded · Future practice will track growth deltas</span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Target Company Gap Analysis */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase' }}>
                Target Company Benchmark
              </span>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: '2px 0 0 0' }}>
                {targetCompany} Readiness Threshold
              </h3>
            </div>
            <div style={{
              padding: '4px 10px',
              borderRadius: '6px',
              backgroundColor: isTargetAchieved ? '#DCFCE7' : '#FEF3C7',
              color: isTargetAchieved ? '#166534' : '#92400E',
              fontSize: '0.78rem',
              fontWeight: 800
            }}>
              {isTargetAchieved ? '✓ Benchmark Met' : 'In Progress'}
            </div>
          </div>

          {/* Progress Bar towards target */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: '#4B5563', marginBottom: '4px' }}>
              <span>Your Readiness: <strong>{readiness}%</strong></span>
              <span>Target Benchmark: <strong>{targetBenchmark.targetScore}%</strong></span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                width: `${Math.min(100, Math.round((readiness / targetBenchmark.targetScore) * 100))}%`,
                height: '100%',
                backgroundColor: isTargetAchieved ? '#15803D' : '#111827',
                borderRadius: '4px',
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Candidate Profile Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', fontSize: '0.82rem', color: '#6B7280', borderTop: '1px solid #F3F4F6', paddingTop: '10px' }}>
            <div>Candidate: <strong style={{ color: '#111827', display: 'block' }}>{profile?.name || 'Student'}</strong></div>
            <div>College: <strong style={{ color: '#111827', display: 'block' }}>{profile?.college || 'Engineering'}</strong></div>
            <div>Evaluation Date: <strong style={{ color: '#111827', display: 'block' }}>{new Date().toLocaleDateString()}</strong></div>
          </div>
        </div>

      </div>

      {/* 4 Core Pillars Breakdown Grid */}
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 16px 0' }}>
        Personalized Performance Breakdown Across 4 Core Pillars
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '18px', marginBottom: '28px' }}>
        
        {/* Pillar 1: 99 DSA Patterns */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E5E7EB', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Code2 size={16} color="#111827" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#111827' }}>99 DSA Patterns</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280' }}>Weight: 35%</span>
            </div>

            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#111827', lineHeight: 1, margin: '6px 0' }}>
              {codingState?.score || 0}%
            </div>

            {/* Delta vs Previous */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: codingDelta >= 0 ? '#15803D' : '#991B1B', fontWeight: 700, marginBottom: '10px' }}>
              {codingDelta >= 0 ? `▲ +${codingDelta}% vs prev report` : `▼ ${codingDelta}% vs prev report`}
            </div>

            <p style={{ fontSize: '0.82rem', color: '#4B5563', margin: 0 }}>
              {codingState?.solvedCount || 0} Problems Solved across 16 algorithmic pattern categories.
            </p>
          </div>

          <button 
            type="button"
            onClick={() => setActiveTab && setActiveTab('coding')}
            className="btn-secondary-spec"
            style={{ marginTop: '16px', fontSize: '0.8rem', padding: '7px 12px', width: '100%', justifyContent: 'center' }}
          >
            Practice DSA Patterns →
          </button>
        </div>

        {/* Pillar 2: AI Mock Interview */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E5E7EB', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mic2 size={16} color="#111827" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#111827' }}>AI Mock Interview</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280' }}>Weight: 25%</span>
            </div>

            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#111827', lineHeight: 1, margin: '6px 0' }}>
              {interviewState?.lastScore || 0}%
            </div>

            {/* Delta vs Previous */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: interviewDelta >= 0 ? '#15803D' : '#991B1B', fontWeight: 700, marginBottom: '10px' }}>
              {interviewDelta >= 0 ? `▲ +${interviewDelta}% vs prev report` : `▼ ${interviewDelta}% vs prev report`}
            </div>

            <p style={{ fontSize: '0.82rem', color: '#4B5563', margin: 0 }}>
              {interviewState?.totalCompleted || 0} Mock Sessions completed with speech biometrics & gaze telemetry.
            </p>
          </div>

          <button 
            type="button"
            onClick={() => setActiveTab && setActiveTab('mock')}
            className="btn-secondary-spec"
            style={{ marginTop: '16px', fontSize: '0.8rem', padding: '7px 12px', width: '100%', justifyContent: 'center' }}
          >
            Take AI Mock Test →
          </button>
        </div>

        {/* Pillar 3: Aptitude & Reasoning */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E5E7EB', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Brain size={16} color="#111827" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#111827' }}>Aptitude & Logic</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280' }}>Weight: 20%</span>
            </div>

            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#111827', lineHeight: 1, margin: '6px 0' }}>
              {aptitudeState?.score || 0}%
            </div>

            {/* Delta vs Previous */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: aptitudeDelta >= 0 ? '#15803D' : '#991B1B', fontWeight: 700, marginBottom: '10px' }}>
              {aptitudeDelta >= 0 ? `▲ +${aptitudeDelta}% vs prev report` : `▼ ${aptitudeDelta}% vs prev report`}
            </div>

            <p style={{ fontSize: '0.82rem', color: '#4B5563', margin: 0 }}>
              {aptitudeState?.totalTests || 0} Practice Tests completed across Quantitative & Logical modules.
            </p>
          </div>

          <button 
            type="button"
            onClick={() => setActiveTab && setActiveTab('aptitude')}
            className="btn-secondary-spec"
            style={{ marginTop: '16px', fontSize: '0.8rem', padding: '7px 12px', width: '100%', justifyContent: 'center' }}
          >
            Practice Aptitude →
          </button>
        </div>

        {/* Pillar 4: Stress & Cognitive Resilience */}
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E5E7EB', padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smile size={16} color="#111827" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#111827' }}>Stress & Mind State</span>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280' }}>Weight: 20%</span>
            </div>

            <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#111827', lineHeight: 1, margin: '6px 0' }}>
              {moodState?.stress || 0}<span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#6B7280' }}>/10</span>
            </div>

            {/* Delta vs Previous */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.78rem', color: stressDelta >= 0 ? '#15803D' : '#991B1B', fontWeight: 700, marginBottom: '10px' }}>
              {stressDelta >= 0 ? `▲ -${stressDelta} pts stress relief` : `▼ +${Math.abs(stressDelta)} pts stress increase`}
            </div>

            <p style={{ fontSize: '0.82rem', color: '#4B5563', margin: 0 }}>
              Status: <strong>{moodState?.label || 'Calm'}</strong>. Cognitive reframing active with NeuroCoach.
            </p>
          </div>

          <button 
            type="button"
            onClick={() => setActiveTab && setActiveTab('journal')}
            className="btn-secondary-spec"
            style={{ marginTop: '16px', fontSize: '0.8rem', padding: '7px 12px', width: '100%', justifyContent: 'center' }}
          >
            Placement Diary →
          </button>
        </div>

      </div>

      {/* Actionable Recommendations & Step-by-Step Improvement Roadmap */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #E5E7EB', borderRadius: 20, padding: 28, boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
          <div>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              AI Targeted Guidance
            </span>
            <h2 style={{ fontWeight: 800, fontSize: '1.25rem', color: '#111827', margin: '2px 0 0 0' }}>
              Personalized Action Plan to Meet {targetCompany}'s Hiring Bar
            </h2>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {RECOMMENDATIONS.map((rec, i) => {
            const isHigh = rec.priority === 'High';
            const isMed = rec.priority === 'Medium';
            return (
              <div 
                key={i} 
                style={{
                  display: 'flex', 
                  gap: 16, 
                  padding: '18px 20px', 
                  borderRadius: 14,
                  border: '1px solid #E5E7EB', 
                  alignItems: 'center', 
                  backgroundColor: '#F9FAFB',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1, minWidth: '280px' }}>
                  <div style={{
                    padding: '4px 10px', 
                    borderRadius: 20, 
                    fontSize: '0.72rem', 
                    fontWeight: 800, 
                    flexShrink: 0,
                    backgroundColor: isHigh ? '#FEF2F2' : (isMed ? '#FEF3C7' : '#ECFDF5'),
                    border: `1px solid ${isHigh ? '#FECACA' : (isMed ? '#FDE68A' : '#A7F3D0')}`,
                    color: isHigh ? '#991B1B' : (isMed ? '#92400E' : '#065F46')
                  }}>
                    {rec.priority} Priority
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 4 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827' }}>{rec.area}</span>
                      <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>({rec.gap})</span>
                    </div>
                    <div style={{ fontSize: '0.86rem', color: '#4B5563', lineHeight: 1.5 }}>
                      {rec.tip}
                    </div>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={() => setActiveTab(rec.tab)} 
                  className="btn-primary-spec"
                  style={{
                    padding: '9px 18px', 
                    borderRadius: 8, 
                    fontWeight: 700, 
                    fontSize: '0.84rem', 
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Start Practice <ArrowRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
