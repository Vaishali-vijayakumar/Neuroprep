import React, { useState, useEffect } from 'react';
import { calculatePlacementReadiness, getAdaptiveInterviewSettings } from '../services/aiEngine';
import { getGamificationData } from '../services/gamificationService';
import { dbService } from '../services/db';
import PlacementFlashGauntlet from './PlacementFlashGauntlet';
import PlacementResourceRAG from './PlacementResourceRAG';
import { Check, TrendingUp, TrendingDown } from 'lucide-react';

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
  const prevReport = dbService.getReportHistory(profile?.email || 'guest')?.previousReport;

  // Live gamification data derived strictly from real activity & multi-module cognitive state
  const gamification = getGamificationData(profile?.email || 'guest', {
    name: profile?.name || 'You',
    college: profile?.college || 'Engineering Student',
    solvedCount: codingState.solvedCount || 0,
    codingScore: codingState.score || 0,
    interviewCount: interviewState.totalCompleted || 0,
    lastInterviewScore: interviewState.lastScore || 0,
    aptitudeTestsCount: aptitudeState.totalTests || aptitudeState.testsTaken || (aptiScore > 0 ? 1 : 0),
    journalCount: journalEntries.length || 0,
    stress: moodState.stress || 0,
    moodState,
    codingState,
    interviewState,
    aptitudeState
  });

  const readinessScore = hasTakenAnyTest ? calculatePlacementReadiness({
    codingScore: codingState.score || 0,
    interviewScore: interviewState.lastScore || 0,
    aptitudeScore: aptiScore,
    profileCompletion: profile.email ? 85 : 50,
    stressManagement: moodState.stress > 0 && moodState.stress <= 5 ? 75 : (moodState.stress > 5 ? 40 : 0)
  }) : 0;

  const adaptiveSettings = getAdaptiveInterviewSettings(moodState.stress, moodState.confidence);

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

      {/* 2. PLACEMENT SCORE BOARD */}
      <section style={{ marginBottom: '36px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 className="section-title" style={{ fontSize: '24px', margin: '0 0 4px 0' }}>
            Placement Score Board
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0 }}>
            Real-time performance evaluation across coding, speech, profile, and stress control.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
          
          {/* Main Gauge Card */}
          <div className="saas-card-spec" style={{ padding: '28px' }}>
            <span className="pill-tag" style={{ marginBottom: '12px' }}>Overall Readiness</span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--secondary-heading)', marginBottom: '20px' }}>
              Placement Readiness Score
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                background: readinessScore > 0 
                  ? `conic-gradient(#526257 ${readinessScore * 3.6}deg, #D8D2CE 0deg)`
                  : '#D8D2CE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 3px 10px rgba(82, 98, 87, 0.15)'
              }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: '#FCF9F6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: 'inset 0 2px 4px rgba(52, 52, 58, 0.05)'
                }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--main-heading)' }}>
                    {readinessScore}%
                  </span>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                {readinessScore === 0 ? (
                  <>
                    <p style={{ fontSize: '13px', color: 'var(--body-text)', marginBottom: '12px', lineHeight: 1.5 }}>
                      No test scores recorded yet. Take an assessment to evaluate your placement readiness baseline.
                    </p>
                    <button 
                      onClick={() => setActiveTab('mock')} 
                      className="btn-primary-spec" 
                      style={{ padding: '8px 18px', fontSize: '13px' }}
                    >
                      Take Test
                    </button>
                  </>
                ) : (
                  <>
                    <p style={{ fontSize: '14px', color: 'var(--body-text)', marginBottom: '8px', lineHeight: 1.5 }}>
                      Weighted Formula: Coding (35%), Interview (30%), Speech (15%), Profile (10%), Stress Management (10%).
                    </p>
                    <span style={{ fontSize: '14px', color: 'var(--main-heading)', fontWeight: 700 }}>
                      Latest score updated from active tests
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown Score Cards with Circular Progress Rings & Green Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            
            {/* 1. Coding Score */}
            <div className="saas-card-spec" style={{ padding: '20px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Coding Score</span>
                
                {/* Circular Progress Ring */}
                <div style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: `conic-gradient(#526257 ${(codingState.score || 0) * 3.6}deg, #D8D2CE 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '14px auto',
                  boxShadow: '0 3px 8px rgba(82, 98, 87, 0.15)'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#FCF9F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 1px 3px rgba(52, 52, 58, 0.06)'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--main-heading)' }}>
                      {codingState.score || 0}%
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveTab('coding')} className="btn-primary-spec" style={{ fontSize: '11px', padding: '8px 12px', marginTop: '8px', justifyContent: 'center', width: '100%' }}>
                Take Coding Test
              </button>
            </div>

            {/* 2. Interview Score */}
            <div className="saas-card-spec" style={{ padding: '20px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Interview Score</span>
                
                {/* Circular Progress Ring */}
                <div style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: `conic-gradient(#526257 ${(interviewState.lastScore || 0) * 3.6}deg, #D8D2CE 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '14px auto',
                  boxShadow: '0 3px 8px rgba(82, 98, 87, 0.15)'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#FCF9F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 1px 3px rgba(52, 52, 58, 0.06)'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--main-heading)' }}>
                      {interviewState.lastScore || 0}%
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveTab('mock')} className="btn-primary-spec" style={{ fontSize: '11px', padding: '8px 12px', marginTop: '8px', justifyContent: 'center', width: '100%' }}>
                Take Mock Test
              </button>
            </div>

            {/* 3. Aptitude Score */}
            <div className="saas-card-spec" style={{ padding: '20px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Aptitude Score</span>
                
                {/* Circular Progress Ring */}
                <div style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: `conic-gradient(#526257 ${(aptitudeState?.score || 0) * 3.6}deg, #D8D2CE 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '14px auto',
                  boxShadow: '0 3px 8px rgba(82, 98, 87, 0.15)'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#FCF9F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 1px 3px rgba(52, 52, 58, 0.06)'
                  }}>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--main-heading)' }}>
                      {aptitudeState?.score || 0}%
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveTab('aptitude')} className="btn-primary-spec" style={{ fontSize: '11px', padding: '8px 12px', marginTop: '8px', justifyContent: 'center', width: '100%' }}>
                Take Apti Test
              </button>
            </div>

            {/* 4. Stress Level */}
            <div className="saas-card-spec" style={{ padding: '20px 16px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 600 }}>Stress Level</span>
                
                {/* Circular Progress Ring */}
                <div style={{
                  width: '74px',
                  height: '74px',
                  borderRadius: '50%',
                  background: `conic-gradient(${(moodState.stress || 0) > 6 ? '#9A6854' : '#526257'} ${Math.min(100, ((moodState.stress || 0) / 10) * 100) * 3.6}deg, #D8D2CE 0deg)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '14px auto',
                  boxShadow: '0 3px 8px rgba(82, 98, 87, 0.15)'
                }}>
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#FCF9F6',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 'inset 0 1px 3px rgba(52, 52, 58, 0.06)'
                  }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--main-heading)' }}>
                      {moodState.stress || 0}/10
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setActiveTab('mood')} className="btn-primary-spec" style={{ fontSize: '11px', padding: '8px 12px', marginTop: '8px', justifyContent: 'center', width: '100%' }}>
                Take Mood Check
              </button>
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
