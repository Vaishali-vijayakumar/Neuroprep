import React, { useState, useEffect } from 'react';
import { calculatePlacementReadiness, getAdaptiveInterviewSettings } from '../services/aiEngine';
import { dbService } from '../services/db';
import PlacementFlashGauntlet from './PlacementFlashGauntlet';
import PlacementResourceRAG from './PlacementResourceRAG';
import { Check, TrendingUp, TrendingDown, Plane, CheckCircle2, Circle, Flame, Sparkles, ArrowRight, Target, Clock, ShieldCheck } from 'lucide-react';

export default function Dashboard({ 
  profile = {}, 
  moodState, 
  setMoodState,
  journalEntries = [],
  setJournalEntries,
  interviewState = {}, 
  codingState = {}, 
  aptitudeState = {},
  setActiveTab,
  setSelectedDistortion
}) {
  const [gamificationTick, setGamificationTick] = useState(0);

  // Listen for global real-time gamification updates
  useEffect(() => {
    const handleGamificationUpdate = () => {
      setGamificationTick(prev => prev + 1);
    };
    window.addEventListener('neuroprep-gamification-update', handleGamificationUpdate);
    return () => window.removeEventListener('neuroprep-gamification-update', handleGamificationUpdate);
  }, []);

  const aptiScore = aptitudeState?.score || 0;
  const hasTakenAnyTest = (codingState.score > 0 || interviewState.lastScore > 0 || aptiScore > 0 || moodState.stress > 0);
  const [prevReport, setPrevReport] = useState(null);

  // Load previous report asynchronously
  useEffect(() => {
    let cancelled = false;
    dbService.getReportHistory(profile?.email || 'guest')
      .then(({ previousReport }) => { if (!cancelled) setPrevReport(previousReport); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [profile?.email]);

  const readinessScore = hasTakenAnyTest ? calculatePlacementReadiness({
    codingScore: codingState.score || 0,
    interviewScore: interviewState.lastScore || 0,
    aptitudeScore: aptiScore,
    profileCompletion: profile.email ? 85 : 50,
    stressManagement: moodState.stress > 0 && moodState.stress <= 5 ? 75 : (moodState.stress > 5 ? 40 : 0)
  }) : 0;

  const adaptiveSettings = getAdaptiveInterviewSettings(moodState.stress, moodState.confidence);

  // Daily Flight Plan state with per-day localStorage persistence
  const todayDateKey = new Date().toISOString().split('T')[0];
  const flightStorageKey = `neuroprep_flight_plan_${(profile?.email || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${todayDateKey}`;

  const [flightMissions, setFlightMissions] = useState(() => {
    try {
      const saved = localStorage.getItem(flightStorageKey);
      if (saved) return JSON.parse(saved);
    } catch (_) {}
    return {
      dsa: Boolean(codingState?.score > 0 || codingState?.solvedCount > 0),
      mock: Boolean(interviewState?.lastScore > 0 || interviewState?.totalCompleted > 0),
      apti: Boolean(aptitudeState?.score > 0 || aptitudeState?.totalTests > 0),
      resilience: Boolean(moodState?.stress > 0 || (journalEntries && journalEntries.length > 0))
    };
  });

  const toggleMission = (key) => {
    setFlightMissions(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(flightStorageKey, JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  const completedCount = Object.values(flightMissions).filter(Boolean).length;
  const flightPercentage = Math.round((completedCount / 4) * 100);

  const flightMissionList = [
    {
      key: 'dsa',
      tag: 'Problem Solving',
      tagBg: 'rgba(82, 98, 87, 0.1)',
      tagColor: 'var(--btn-sage)',
      xp: '+50 XP',
      title: 'Solve 1 Medium Pattern Question',
      description: 'Strengthen algorithmic intuition on Sliding Window, Two Pointers, or Binary Search.',
      actionText: 'Launch Solver',
      targetTab: 'coding'
    },
    {
      key: 'mock',
      tag: 'Mock Interview',
      tagBg: 'rgba(82, 98, 87, 0.1)',
      tagColor: 'var(--btn-sage)',
      xp: '+40 XP',
      title: 'Practice 90-Sec Elevator Intro & Defense',
      description: 'Refine technical speech pacing, project articulation, and executive poise.',
      actionText: 'Enter Mock Room',
      targetTab: 'mock'
    },
    {
      key: 'apti',
      tag: 'Aptitude Speed',
      tagBg: 'rgba(154, 104, 84, 0.1)',
      tagColor: 'var(--accent-terracotta)',
      xp: '+30 XP',
      title: 'Complete 5-Question Quant & Logic Sprint',
      description: 'Boost numerical reasoning speed and accuracy for corporate screening tests.',
      actionText: 'Start Drill',
      targetTab: 'aptitude'
    },
    {
      key: 'resilience',
      tag: 'Mindset & Calm',
      tagBg: 'rgba(82, 98, 87, 0.1)',
      tagColor: 'var(--btn-sage)',
      xp: '+25 XP',
      title: 'Pre-Placement Grounding & Thought Log',
      description: 'Release performance anxiety, log daily takeaways, or do 2-min box breathing.',
      actionText: 'Open Journal',
      targetTab: 'journal'
    }
  ];

  let flightStatusTitle = 'Preparing for Takeoff';
  let flightStatusDesc = 'Complete your first sprint to initiate daily placement momentum.';
  if (completedCount === 1) {
    flightStatusTitle = 'Ascending • Gaining Altitude';
    flightStatusDesc = 'Great start! 1 mission cleared. Keep the momentum building today.';
  } else if (completedCount === 2) {
    flightStatusTitle = 'Cruising Altitude • Steady Pace';
    flightStatusDesc = 'Halfway through today’s flight plan! Placement consistency is compounding.';
  } else if (completedCount === 3) {
    flightStatusTitle = 'Optimal Flight Level • High Velocity';
    flightStatusDesc = 'Almost clear! Just 1 more micro-mission to complete today.';
  } else if (completedCount === 4) {
    flightStatusTitle = 'Mission Accomplished • Drive Ready';
    flightStatusDesc = 'All 4 flight missions completed! Outstanding placement consistency today.';
  }

  return (
    <div style={{ flex: 1, padding: '36px 32px', maxWidth: '1280px', margin: '0 auto', width: '100%', fontFamily: 'var(--font-main)' }}>
      
      {/* 1. Friendly Personal Diary & Mood Enhancer Banner */}
      <section style={{ marginBottom: '28px' }}>
        <div className="saas-card-spec" style={{
          padding: '24px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap'
        }}>
          <div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--main-heading)', margin: 0, letterSpacing: '-0.3px' }}>
              Hey {profile.name || 'Friend'}, how was your day?
            </h1>
            <p style={{ fontSize: '0.94rem', color: 'var(--body-text)', margin: '6px 0 0 0', lineHeight: 1.5 }}>
              Take a gentle pause to write in your personal placement diary. Share your wins, vent out stress, or reflect on your growth today.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('journal')} 
            className="btn-primary-spec" 
            style={{ 
              padding: '12px 24px', 
              fontSize: '0.9rem', 
              borderRadius: '12px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            Write Today's Diary Entry
          </button>
        </div>
      </section>

      {/* 2. DAILY FLIGHT PLAN (Replaced Placement Score Board) */}
      <section style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '24px', margin: '0 0 4px 0' }}>
              Daily Flight Plan
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0 }}>
              Your guided daily micro-missions. Complete quick sprints to build steady, compound placement momentum.
            </p>
          </div>

          {/* Flight Momentum & Streak Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="pill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0, color: 'var(--accent-terracotta)' }}>
              <Flame style={{ width: '13px', height: '13px', color: 'var(--accent-terracotta)' }} />
              Daily Momentum Active
            </span>

            <span className="pill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0, color: 'var(--btn-sage)' }}>
              <CheckCircle2 style={{ width: '13px', height: '13px', color: 'var(--btn-sage)' }} />
              {completedCount} of 4 Missions Cleared
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: '24px' }}>
          
          {/* LEFT: 4 Actionable Mission Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {flightMissionList.map((m) => {
              const isDone = flightMissions[m.key];
              return (
                <div 
                  key={m.key} 
                  className="saas-card-spec"
                  style={{
                    padding: '16px 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '16px',
                    transition: 'all 0.2s ease',
                    backgroundColor: isDone ? 'rgba(235, 245, 238, 0.45)' : 'var(--bg-card-solid)',
                    border: isDone ? '1px solid rgba(82, 98, 87, 0.3)' : '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: 0 }}>
                    <button
                      onClick={() => toggleMission(m.key)}
                      title={isDone ? 'Mark as incomplete' : 'Mark as completed'}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        marginTop: '2px',
                        color: isDone ? 'var(--btn-sage)' : 'var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {isDone ? (
                        <CheckCircle2 style={{ width: '22px', height: '22px', color: 'var(--btn-sage)' }} />
                      ) : (
                        <Circle style={{ width: '22px', height: '22px' }} />
                      )}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          padding: '2px 8px',
                          borderRadius: '12px',
                          backgroundColor: m.tagBg,
                          color: m.tagColor
                        }}>
                          {m.tag}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {m.xp}
                        </span>
                      </div>

                      <h4 style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: isDone ? 'var(--text-muted)' : 'var(--main-heading)',
                        textDecoration: isDone ? 'line-through' : 'none',
                        margin: '0 0 2px 0',
                        lineHeight: 1.3
                      }}>
                        {m.title}
                      </h4>

                      <p style={{
                        fontSize: '12.5px',
                        color: 'var(--body-text)',
                        margin: 0,
                        lineHeight: 1.4,
                        opacity: isDone ? 0.75 : 1
                      }}>
                        {m.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab(m.targetTab)}
                    className="btn-primary-spec"
                    style={{
                      padding: '7px 14px',
                      fontSize: '12px',
                      flexShrink: 0,
                      gap: '4px',
                      borderRadius: '8px'
                    }}
                  >
                    <span>{m.actionText}</span>
                    <ArrowRight style={{ width: '13px', height: '13px' }} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* RIGHT: Flight Telemetry & Readiness Trajectory */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* 1. Daily Flight Status & Altitude Gauge */}
            <div className="saas-card-spec" style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span className="pill-tag" style={{ margin: 0 }}>Flight Telemetry</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--main-heading)' }}>
                  {flightPercentage}% Altitude
                </span>
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--main-heading)', marginBottom: '6px' }}>
                {flightStatusTitle}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--body-text)', margin: '0 0 16px 0', lineHeight: 1.45 }}>
                {flightStatusDesc}
              </p>

              {/* Altitude Multi-Step Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    style={{
                      flex: 1,
                      height: '7px',
                      borderRadius: '4px',
                      backgroundColor: completedCount >= step ? 'var(--btn-sage)' : 'rgba(216, 210, 206, 0.45)',
                      transition: 'background-color 0.3s ease'
                    }}
                  />
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>Runway</span>
                <span>Ascending</span>
                <span>Cruising</span>
                <span>Drive Ready</span>
              </div>
            </div>

            {/* 2. Target Destination Card */}
            <div className="saas-card-spec" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Target style={{ width: '16px', height: '16px', color: 'var(--btn-sage)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                  Target Destination
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--main-heading)', margin: 0 }}>
                  {profile?.targetCompany || 'Top Tech Recruiters'}
                </h4>
                <span style={{ fontSize: '12px', color: 'var(--btn-sage)', fontWeight: 700 }}>
                  {profile?.graduationYear || profile?.graduation_year || 2026} Campus Drive
                </span>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--body-text)', margin: '0 0 12px 0' }}>
                Aiming for: <strong style={{ color: 'var(--secondary-heading)' }}>{profile?.targetRole || 'Software Development Engineer'}</strong>
              </p>

              <button
                onClick={() => setActiveTab('company')}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: 'var(--btn-sage)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer'
                }}
              >
                <span>Review Company Interview Patterns</span>
                <ArrowRight style={{ width: '13px', height: '13px' }} />
              </button>
            </div>

            {/* 3. Daily Mentor Flight Pro-Tip */}
            <div className="saas-card-spec" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck style={{ width: '16px', height: '16px', color: 'var(--btn-sage)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Coach Flight Pro-Tip
                </span>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--body-text)', margin: 0, lineHeight: 1.5 }}>
                "Explaining your thought process out loud before typing code yields higher interview marks than writing code in silence. Interviewers prioritize your reasoning path over pure syntax speed."
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 3. PREPARATION & PRACTICE HUBS */}
      <section style={{ marginBottom: '36px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 className="section-title" style={{ fontSize: '24px', margin: '0 0 4px 0' }}>
            Preparation & Practice Hubs
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0 }}>
            Direct access to DSA coding compiler, aptitude MCQs, company exam patterns, and mock interviews.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          
          <div className="saas-card-spec" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="pill-tag" style={{ marginBottom: '12px', display: 'inline-block' }}>01</span>
              <h3 className="card-title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--secondary-heading)', marginBottom: '8px', marginTop: '0px', lineHeight: 1.3 }}>Programming & DSA</h3>
              <p className="card-desc" style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--body-text)', marginBottom: '20px' }}>
                Solve Java, Python, C++ problems with test case runners and AST complexity checks.
              </p>
            </div>
            <button onClick={() => setActiveTab('coding')} className="btn-primary-spec" style={{ width: '100%', justifyContent: 'center', fontSize: '14px', padding: '10px 16px', fontWeight: 600 }}>
              Launch Compiler
            </button>
          </div>

          <div className="saas-card-spec" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="pill-tag" style={{ marginBottom: '12px', display: 'inline-block' }}>02</span>
              <h3 className="card-title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--secondary-heading)', marginBottom: '8px', marginTop: '0px', lineHeight: 1.3 }}>Aptitude & Reasoning</h3>
              <p className="card-desc" style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--body-text)', marginBottom: '20px' }}>
                Practice Quantitative Aptitude, Logical Reasoning, Verbal, and Data Interpretation.
              </p>
            </div>
            <button onClick={() => setActiveTab('aptitude')} className="btn-primary-spec" style={{ width: '100%', justifyContent: 'center', fontSize: '14px', padding: '10px 16px', fontWeight: 600 }}>
              Start Aptitude
            </button>
          </div>

          <div className="saas-card-spec" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="pill-tag" style={{ marginBottom: '12px', display: 'inline-block' }}>03</span>
              <h3 className="card-title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--secondary-heading)', marginBottom: '8px', marginTop: '0px', lineHeight: 1.3 }}>Adaptive Mock Interview</h3>
              <p className="card-desc" style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--body-text)', marginBottom: '20px' }}>
                Simulate technical and HR interviews with real-time stress scaling (120-180 WPM).
              </p>
            </div>
            <button onClick={() => setActiveTab('mock')} className="btn-primary-spec" style={{ width: '100%', justifyContent: 'center', fontSize: '14px', padding: '10px 16px', fontWeight: 600 }}>
              Start Interview
            </button>
          </div>

          <div className="saas-card-spec" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="pill-tag" style={{ marginBottom: '12px', display: 'inline-block' }}>04</span>
              <h3 className="card-title" style={{ fontSize: '18px', fontWeight: 700, color: 'var(--secondary-heading)', marginBottom: '8px', marginTop: '0px', lineHeight: 1.3 }}>Company Exam Patterns</h3>
              <p className="card-desc" style={{ fontSize: '14px', lineHeight: 1.5, color: 'var(--body-text)', marginBottom: '20px' }}>
                Targeted exam format practice for TCS NQT, Infosys, Zoho, and Amazon tests.
              </p>
            </div>
            <button onClick={() => setActiveTab('company')} className="btn-primary-spec" style={{ width: '100%', justifyContent: 'center', fontSize: '14px', padding: '10px 16px', fontWeight: 600 }}>
              Open Company Hub
            </button>
          </div>

        </div>
      </section>

      {/* 4. DAILY 5-MINUTE PLACEMENT CHALLENGE */}
      <section style={{ marginBottom: '36px' }}>
        <PlacementFlashGauntlet 
          userEmail={profile?.email || 'guest'} 
          onVictory={() => setGamificationTick(prev => prev + 1)}
          setActiveTab={setActiveTab}
        />
      </section>

      {/* 5. PERSONALIZED PLACEMENT ANALYTICS & PROGRESS REPORT */}
      <section style={{ marginBottom: '36px' }}>
        <div className="saas-card-spec" style={{ padding: '32px' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="pill-tag">
                  Personalized Performance Audit
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--secondary-heading)', margin: 0 }}>
                Personalized Placement Analytics & Progress Report
              </h3>
            </div>

            <button 
              onClick={() => setActiveTab('reports')} 
              className="btn-primary-spec" 
              style={{ fontSize: '13px', padding: '9px 20px', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              Open Full Reports
            </button>
          </div>

          {/* 3 Personalized Multi-Module Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            
            {/* Card 1: 99 DSA Patterns Mastery */}
            <div className="saas-card-spec" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    99 DSA Patterns Mastery
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: ((codingState.score || 0) >= (prevReport?.codingScore || 0)) ? '#68705F' : '#9A6854',
                    backgroundColor: '#FCF9F6',
                    border: '1px solid #D8D2CE',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    {((codingState.score || 0) >= (prevReport?.codingScore || 0)) ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    {prevReport ? `${(codingState.score || 0) - (prevReport.codingScore || 0) >= 0 ? '+' : ''}${(codingState.score || 0) - (prevReport.codingScore || 0)}% vs prev` : 'Baseline'}
                  </span>
                </div>

                <p style={{ fontSize: '26px', fontWeight: 800, color: 'var(--main-heading)', margin: '4px 0' }}>
                  {codingState.score || 0}% <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Competency</span>
                </p>
                <p style={{ fontSize: '12px', color: 'var(--body-text)', margin: 0 }}>
                  <strong>{codingState.solvedCount || 0} Problems Solved</strong> across 16 algorithmic pattern categories.
                </p>
              </div>

              <div style={{ marginTop: '14px', borderTop: '1px solid #D8D2CE', paddingTop: '10px', fontSize: '11px', color: 'var(--secondary-olive)', fontWeight: 600 }}>
                High-Frequency: Two Pointers, Sliding Window, Tree BFS/DFS
              </div>
            </div>

            {/* Card 2: AI Mock Interview & Speech Telemetry */}
            <div className="saas-card-spec" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    AI Mock Interview & Speech
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: ((interviewState.lastScore || 0) >= (prevReport?.interviewScore || 0)) ? '#68705F' : '#9A6854',
                    backgroundColor: '#FCF9F6',
                    border: '1px solid #D8D2CE',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}>
                    {((interviewState.lastScore || 0) >= (prevReport?.interviewScore || 0)) ? (
                      <TrendingUp size={12} />
                    ) : (
                      <TrendingDown size={12} />
                    )}
                    {prevReport ? `${(interviewState.lastScore || 0) - (prevReport.interviewScore || 0) >= 0 ? '+' : ''}${(interviewState.lastScore || 0) - (prevReport.interviewScore || 0)}% vs prev` : 'Baseline'}
                  </span>
                </div>

                <p style={{ fontSize: '26px', fontWeight: 800, color: 'var(--main-heading)', margin: '4px 0' }}>
                  {interviewState.lastScore || 0}% <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Interview Score</span>
                </p>
                <p style={{ fontSize: '12px', color: 'var(--body-text)', margin: 0 }}>
                  <strong>{interviewState.totalCompleted || 0} Sessions Completed</strong> with speech rate & gaze telemetry.
                </p>
              </div>

              <div style={{ marginTop: '14px', borderTop: '1px solid #D8D2CE', paddingTop: '10px', fontSize: '11px', color: 'var(--btn-sage)', fontWeight: 600 }}>
                Telemetry: Vocal Clarity 142 WPM (Optimal) • Eye Focus 92%
              </div>
            </div>

            {/* Card 3: Aptitude Practice & Cognitive Resilience */}
            <div className="saas-card-spec" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Aptitude & Mind Resilience
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: 'var(--secondary-olive)',
                    backgroundColor: '#FCF9F6',
                    border: '1px solid #D8D2CE',
                    padding: '2px 8px',
                    borderRadius: '6px'
                  }}>
                    Stress {moodState.stress || 0}/10
                  </span>
                </div>

                <p style={{ fontSize: '26px', fontWeight: 800, color: 'var(--main-heading)', margin: '4px 0' }}>
                  {aptiScore}% <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)' }}>Aptitude Accuracy</span>
                </p>
                <p style={{ fontSize: '12px', color: 'var(--body-text)', margin: 0 }}>
                  <strong>{aptitudeState.totalTests || (aptiScore > 0 ? 1 : 0)} Tests Taken</strong> • {journalEntries.length} Reflections logged with NeuroCoach.
                </p>
              </div>

              <div style={{ marginTop: '14px', borderTop: '1px solid #D8D2CE', paddingTop: '10px', fontSize: '11px', color: 'var(--accent-terracotta)', fontWeight: 600 }}>
                Placement Threshold: Requires 65%+ across all modules
              </div>
            </div>

          </div>

          {/* AI Priority Recommendation Banner */}
          <div className="saas-card-spec" style={{
            padding: '16px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--main-heading)', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '2px' }}>
                AI Suggested Next Priority:
              </span>
              <span style={{ fontSize: '13px', color: 'var(--body-text)', lineHeight: 1.4 }}>
                {(codingState.score || 0) < 60 
                  ? `Focus on 99 DSA Patterns (Two Pointers & Sliding Window) to raise your coding score from ${codingState.score || 0}% to meet the 65% interview readiness benchmark.`
                  : (interviewState.lastScore || 0) < 70
                    ? `Take 1 full Technical Mock Interview round to sharpen vocal cadence and system architecture communication.`
                    : `Keep up daily consistency! Solve 1 Featured Problem and log a reflection with NeuroCoach to stay in peak flow.`
                }
              </span>
            </div>

            <button
              onClick={() => setActiveTab((codingState.score || 0) < 60 ? 'coding' : ((interviewState.lastScore || 0) < 70 ? 'mock' : 'reports'))}
              className="btn-secondary-spec"
              style={{ fontSize: '12px', padding: '8px 16px', fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              {(codingState.score || 0) < 60 ? 'Practice DSA Patterns' : ((interviewState.lastScore || 0) < 70 ? 'Start Mock Round' : 'View Full Audit')}
            </button>
          </div>

        </div>
      </section>

      {/* 6. PLACEMENT LEARNING RESOURCES & STUDY HUB */}
      <section style={{ marginBottom: '36px' }}>
        <div className="saas-card-spec" style={{ padding: '32px' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '14px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="pill-tag">
                  Smart Study Hub
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Personalized Learning Roadmaps
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--secondary-heading)', margin: 0 }}>
                Placement Learning Resources & Study Hub
              </h3>
            </div>

            <button 
              onClick={() => setActiveTab('placer-rag')} 
              className="btn-primary-spec" 
              style={{ fontSize: '13px', padding: '9px 20px', display: 'flex', alignItems: 'center' }}
            >
              Open Full Study Hub
            </button>
          </div>

          {/* 3 Practical Learning Roadmaps */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>
            
            {/* Card 1: Fast-Track Technical Concepts */}
            <div className="saas-card-spec" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Core Technical Concepts
                  </span>
                </div>

                <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--main-heading)', margin: '4px 0 2px 0' }}>
                  Fast-Track Core Fundamentals
                </p>
                <p style={{ fontSize: '13px', color: 'var(--body-text)', margin: 0, lineHeight: 1.45 }}>
                  Quickly understand key database, SQL, and core computer science questions with clear examples and short revision notes.
                </p>
              </div>

              <div style={{ marginTop: '14px', borderTop: '1px solid #D8D2CE', paddingTop: '10px', fontSize: '11px', color: 'var(--secondary-olive)', fontWeight: 600 }}>
                Includes: 15-Min Video Breakdown • 5-Min Summary • Quick Quiz
              </div>
            </div>

            {/* Card 2: Step-by-Step Coding Patterns */}
            <div className="saas-card-spec" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Coding & Problem Solving
                  </span>
                </div>

                <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--main-heading)', margin: '4px 0 2px 0' }}>
                  Step-by-Step Coding Patterns
                </p>
                <p style={{ fontSize: '13px', color: 'var(--body-text)', margin: 0, lineHeight: 1.45 }}>
                  Learn how to break down tricky problems, spot the right approach instantly, and write clean solutions with confidence.
                </p>
              </div>

              <div style={{ marginTop: '14px', borderTop: '1px solid #D8D2CE', paddingTop: '10px', fontSize: '11px', color: 'var(--btn-sage)', fontWeight: 600 }}>
                Includes: Visual Walkthroughs • 3 Handpicked Practice Problems
              </div>
            </div>

            {/* Card 3: Interview Q&A & Communication */}
            <div className="saas-card-spec" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Interview Communication
                  </span>
                </div>

                <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--main-heading)', margin: '4px 0 2px 0' }}>
                  HR & Technical Q&A Mastery
                </p>
                <p style={{ fontSize: '13px', color: 'var(--body-text)', margin: 0, lineHeight: 1.45 }}>
                  Master how to explain your projects, answer situational interview questions, and speak with confidence under pressure.
                </p>
              </div>

              <div style={{ marginTop: '14px', borderTop: '1px solid #D8D2CE', paddingTop: '10px', fontSize: '11px', color: 'var(--accent-terracotta)', fontWeight: 600 }}>
                Includes: Sample Model Answers • Recruiter Tips & Traps
              </div>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
}
