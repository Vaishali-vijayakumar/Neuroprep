import React, { useState, useEffect } from 'react';
import { calculatePlacementReadiness, getAdaptiveInterviewSettings } from '../services/aiEngine';
import { getGamificationData } from '../services/gamificationService';
import { Flame, Trophy, Zap, Target, Code2, Award, CheckCircle2, Check, X } from 'lucide-react';

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

  // Live gamification data derived strictly from real activity
  const gamification = getGamificationData(profile?.email || 'guest', {
    name: profile?.name || 'You',
    college: profile?.college || 'Engineering Student',
    solvedCount: codingState.solvedCount || 0,
    interviewCount: interviewState.totalCompleted || 0,
    lastInterviewScore: interviewState.lastScore || 0,
    aptitudeTestsCount: aptitudeState.totalTests || aptitudeState.testsTaken || (aptiScore > 0 ? 1 : 0),
    journalCount: journalEntries.length || 0
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
    <div style={{ flex: 1, padding: '36px 32px', maxWidth: '1280px', margin: '0 auto', width: '100%', fontFamily: 'var(--font-inter)' }}>
      
      {/* Friendly Personal Diary & Mood Enhancer Banner */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '18px',
          padding: '24px 32px',
          border: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)'
        }}>
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
              Hey {profile.name || 'Friend'}, how was your day?
            </h1>
            <p style={{ fontSize: '0.92rem', color: '#4B5563', margin: '6px 0 0 0', lineHeight: 1.5 }}>
              Take a gentle pause to write in your personal placement diary. Share your wins, vent out stress, or reflect on your growth today.
            </p>
          </div>
          <button 
            onClick={() => setActiveTab('journal')} 
            className="btn-primary-spec" 
            style={{ 
              padding: '12px 24px', 
              fontSize: '0.9rem', 
              borderRadius: '10px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}
          >
            Write Today's Diary Entry
          </button>
        </div>
      </section>

      {/* ==========================================
          SCORE BOARD
         ========================================== */}
      <section style={{ marginBottom: '36px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 className="section-title" style={{ fontSize: '24px' }}>
            Placement Score Board
          </h2>
          <p style={{ color: '#6B7280', fontSize: '15px' }}>
            Real-time performance evaluation across coding, speech, profile, and stress control.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
          
          {/* Main Gauge Card */}
          <div className="saas-card-spec" style={{ padding: '28px' }}>
            <span className="pill-tag" style={{ marginBottom: '12px' }}>Overall Readiness</span>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '20px' }}>
              Placement Readiness Score
            </h3>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <div style={{
                width: '110px',
                height: '110px',
                borderRadius: '50%',
                background: readinessScore > 0 
                  ? `conic-gradient(#111827 ${readinessScore * 3.6}deg, #E5E7EB 0deg)`
                  : '#E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div style={{
                  width: '90px',
                  height: '90px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#111827' }}>
                    {readinessScore}%
                  </span>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                {readinessScore === 0 ? (
                  <>
                    <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px', lineHeight: 1.5 }}>
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
                    <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '8px', lineHeight: 1.5 }}>
                      Weighted Formula: Coding (35%), Interview (30%), Speech (15%), Profile (10%), Stress Management (10%).
                    </p>
                    <span style={{ fontSize: '14px', color: '#111827', fontWeight: 700 }}>
                      Latest score updated from active tests
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Breakdown Score Cards with "Take Test" buttons when 0 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
            
            <div className="saas-card-spec" style={{ padding: '18px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>Coding Score</span>
                <div style={{ fontSize: '30px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>
                  {codingState.score || 0}%
                </div>
              </div>
              <button onClick={() => setActiveTab('coding')} className="btn-secondary-spec" style={{ fontSize: '11px', padding: '4px 8px', marginTop: '10px', justifyContent: 'center' }}>
                Take Coding Test
              </button>
            </div>

            <div className="saas-card-spec" style={{ padding: '18px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>Interview Score</span>
                <div style={{ fontSize: '30px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>
                  {interviewState.lastScore || 0}%
                </div>
              </div>
              <button onClick={() => setActiveTab('mock')} className="btn-secondary-spec" style={{ fontSize: '11px', padding: '4px 8px', marginTop: '10px', justifyContent: 'center' }}>
                Take Mock Test
              </button>
            </div>

            <div className="saas-card-spec" style={{ padding: '18px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>Aptitude Score</span>
                <div style={{ fontSize: '30px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>
                  {aptitudeState?.score || 0}%
                </div>
              </div>
              <button onClick={() => setActiveTab('aptitude')} className="btn-secondary-spec" style={{ fontSize: '11px', padding: '4px 8px', marginTop: '10px', justifyContent: 'center' }}>
                Take Apti Test
              </button>
            </div>

            <div className="saas-card-spec" style={{ padding: '18px', textAlign: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>Stress Level</span>
                <div style={{ fontSize: '30px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>
                  {moodState.stress}/10
                </div>
              </div>
              <button onClick={() => setActiveTab('mood')} className="btn-secondary-spec" style={{ fontSize: '11px', padding: '4px 8px', marginTop: '10px', justifyContent: 'center' }}>
                Take Mood Check
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* STEP 3: CORE PRACTICE HUBS */}
      <section style={{ marginBottom: '36px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h2 className="section-title" style={{ fontSize: '24px' }}>
            Preparation & Practice Hubs
          </h2>
          <p style={{ color: '#6B7280', fontSize: '15px' }}>
            Direct access to DSA coding compiler, aptitude MCQs, company exam patterns, and mock interviews.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          
          <div className="saas-card-spec" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <span className="pill-tag" style={{ marginBottom: '12px', display: 'inline-block' }}>01</span>
              <h3 className="card-title" style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px', marginTop: '0px', lineHeight: 1.3 }}>Programming & DSA</h3>
              <p className="card-desc" style={{ fontSize: '14px', lineHeight: 1.5, color: '#4B5563', marginBottom: '20px' }}>
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
              <h3 className="card-title" style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px', marginTop: '0px', lineHeight: 1.3 }}>Aptitude & Reasoning</h3>
              <p className="card-desc" style={{ fontSize: '14px', lineHeight: 1.5, color: '#4B5563', marginBottom: '20px' }}>
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
              <h3 className="card-title" style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px', marginTop: '0px', lineHeight: 1.3 }}>Adaptive Mock Interview</h3>
              <p className="card-desc" style={{ fontSize: '14px', lineHeight: 1.5, color: '#4B5563', marginBottom: '20px' }}>
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
              <h3 className="card-title" style={{ fontSize: '18px', fontWeight: 700, color: '#111827', marginBottom: '8px', marginTop: '0px', lineHeight: 1.3 }}>Company Exam Patterns</h3>
              <p className="card-desc" style={{ fontSize: '14px', lineHeight: 1.5, color: '#4B5563', marginBottom: '20px' }}>
                Targeted exam format practice for TCS NQT, Infosys, Zoho, and Amazon tests.
              </p>
            </div>
            <button onClick={() => setActiveTab('company')} className="btn-primary-spec" style={{ width: '100%', justifyContent: 'center', fontSize: '14px', padding: '10px 16px', fontWeight: 600 }}>
              Open Company Hub
            </button>
          </div>

        </div>
      </section>

      {/* STEP 4: DAILY CHALLENGES & XP STREAK TRACKER */}
      <section style={{ marginBottom: '36px' }}>
        <div className="saas-card-spec" style={{ padding: '28px', backgroundColor: '#F8F9FA' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="pill-tag" style={{ backgroundColor: '#F3F4F6', color: '#111827', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <Zap size={13} color="#111827" /> Daily Momentum
                </span>
                <span style={{ fontSize: '12px', color: '#6B7280', fontWeight: 600 }}>
                  Rank: <strong style={{ color: gamification.currentTier.color }}>{gamification.currentTier.name}</strong> ({gamification.currentTier.badge})
                </span>
              </div>
              <h3 style={{ fontSize: '20px', fontWeight: 800, color: '#111827', margin: 0 }}>
                Daily Challenges & Streak Tracker
              </h3>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => setActiveTab('gamification')} 
                className="btn-primary-spec" 
                style={{ fontSize: '13px', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Trophy size={14} /> Full Achievements & Leaderboard
              </button>
            </div>
          </div>

          {/* 3 Core Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '18px', marginBottom: '20px' }}>
            
            {/* Card 1: Active Streak */}
            <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Daily Practice Streak
                  </span>
                  <Flame size={18} color={gamification.activeStreak > 0 ? '#111827' : '#9CA3AF'} />
                </div>
                <p style={{ fontSize: '26px', fontWeight: 900, color: '#111827', margin: '6px 0 2px 0' }}>
                  {gamification.activeStreak} {gamification.activeStreak === 1 ? 'Day' : 'Days'} Streak
                </p>
                <p style={{ fontSize: '12px', color: '#4B5563', margin: 0 }}>
                  {gamification.activeStreak > 0 
                    ? 'Great consistency! Active streak earns bonus experience on all practice.' 
                    : 'Complete a coding problem, quiz, interview, or diary entry today to start your streak.'}
                </p>
              </div>

              {/* Current Week Activity Tracker in Weekdays Order (Mon to Sun) */}
              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                {gamification.currentWeekDays.map((item, idx) => {
                  let iconElement = null;
                  if (item.isDone) {
                    iconElement = <Check size={12} strokeWidth={3} />;
                  } else if (item.isToday) {
                    iconElement = <span style={{ fontSize: '14px', lineHeight: 1 }}>•</span>;
                  } else if (item.isPast) {
                    iconElement = <X size={12} strokeWidth={2.5} />;
                  }

                  return (
                    <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                      <div 
                        title={`${item.day}: ${item.isDone ? 'Completed' : (item.isToday ? 'Today (Pending)' : (item.isPast ? 'Missed' : 'Upcoming'))}`}
                        style={{
                          height: '24px',
                          borderRadius: '6px',
                          backgroundColor: item.isDone ? '#111827' : (item.isToday ? '#FFFFFF' : '#F9FAFB'),
                          border: item.isDone ? '1px solid #111827' : (item.isToday ? '1.5px dashed #111827' : '1px solid #E5E7EB'),
                          color: item.isDone ? '#FFFFFF' : (item.isToday ? '#111827' : '#9CA3AF'),
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: '4px'
                        }}
                      >
                        {iconElement}
                      </div>
                      <span style={{ fontSize: '10px', color: item.isToday ? '#111827' : '#6B7280', fontWeight: item.isToday ? 700 : 500 }}>
                        {item.day}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Card 2: Total XP & Level */}
            <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Experience Points
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#111827', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: '6px' }}>
                    Level {gamification.level}
                  </span>
                </div>
                <p style={{ fontSize: '26px', fontWeight: 900, color: '#111827', margin: '6px 0 2px 0' }}>
                  {gamification.totalXp} <span style={{ fontSize: '14px', fontWeight: 600, color: '#6B7280' }}>XP</span>
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#6B7280', marginTop: '6px' }}>
                  <span>Progress to Level {gamification.level + 1}</span>
                  <span style={{ fontWeight: 700, color: '#111827' }}>{gamification.xpInLevel} / 250 XP</span>
                </div>
                <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '3px', marginTop: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${gamification.xpProgress}%`, height: '100%', backgroundColor: '#111827', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                </div>
              </div>

              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#4B5563', borderTop: '1px solid #F3F4F6', paddingTop: '10px' }}>
                <span>{gamification.solvedCount} Problems Solved</span>
                <span>{gamification.unlockedBadges.length} Badges Earned</span>
              </div>
            </div>

            {/* Card 3: Today's Featured Challenge */}
            <div style={{ padding: '20px', borderRadius: '14px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Today's Challenge
                  </span>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: '#F3F4F6',
                    color: '#111827'
                  }}>
                    {gamification.dailyChallenge.difficulty}
                  </span>
                </div>
                <p style={{ fontSize: '16px', fontWeight: 800, color: '#111827', margin: '8px 0 2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {gamification.dailyChallenge.title}
                </p>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>
                  Topic: <strong>{gamification.dailyChallenge.category || 'Data Structures'}</strong>
                </p>
              </div>

              <button 
                onClick={() => setActiveTab('daily-challenge')} 
                className="btn-primary-spec" 
                style={{ marginTop: '14px', fontSize: '13px', padding: '8px 14px', width: '100%', justifyContent: 'center' }}
              >
                Start Challenge (+{gamification.dailyChallenge.xpReward} XP)
              </button>
            </div>

          </div>

          {/* Daily Quests Mini Bar */}
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 12, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target size={18} color="#111827" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#111827' }}>
                  Daily Practice Goals ({gamification.completedQuestsCount}/3 Completed)
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  Complete all 3 daily practice goals for a +50 XP Daily Champion Bonus
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {gamification.dailyQuests.map((quest) => (
                <div 
                  key={quest.id}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: quest.completed ? '#F3F4F6' : '#F9FAFB',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '12px',
                    fontWeight: 600,
                    color: quest.completed ? '#111827' : '#4B5563'
                  }}
                >
                  {quest.completed ? <Check size={13} color="#111827" /> : <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', backgroundColor: '#9CA3AF' }} />}
                  <span>{quest.title} (+{quest.xp} XP)</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* STEP 5: BOTTOM SECTION - ANALYTICS & REPORTS */}
      <section style={{ marginBottom: '24px' }}>
        <div className="saas-card-spec" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <span className="pill-tag" style={{ marginBottom: '8px' }}>Performance Insights</span>
              <h3 style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                Analytics & Institutional Progress Reports
              </h3>
            </div>
            <button onClick={() => setActiveTab('reports')} className="btn-primary-spec" style={{ fontSize: '14px', padding: '8px 18px' }}>
              Open Full Reports
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
            <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Technical Competency</h4>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                Data Structures: <strong>0%</strong> • Algorithms: <strong>0%</strong> • SQL & DBMS: <strong>0%</strong>
              </p>
            </div>

            <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Stress Adaptation Log</h4>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                Average Stress Index: <strong>{moodState.stress}/10</strong> • CBT Exercises Completed: <strong>{journalEntries.length} Worksheets</strong>
              </p>
            </div>

            <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB' }}>
              <h4 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Placement Probability</h4>
              <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '12px' }}>
                Target: <strong>{profile.targetCompany || 'TCS'}</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

