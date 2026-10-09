import React, { useState, useEffect } from 'react';
import { calculatePlacementReadiness, getAdaptiveInterviewSettings } from '../services/aiEngine';
import { dbService } from '../services/db';
import PlacementFlashGauntlet from './PlacementFlashGauntlet';
import PlacementResourceRAG from './PlacementResourceRAG';
import { Check, TrendingUp, TrendingDown, Plane, CheckCircle2, Circle, Flame, Sparkles, ArrowRight, Target, Clock, ShieldCheck, Plus, Trash2, X } from 'lucide-react';
import { getGamificationData, recordActivity } from '../services/gamificationService';

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

  // Real-time ticker for per-task 24-hour countdowns
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Gamification & Active Streak calculation
  const gamificationData = getGamificationData(profile?.email || 'guest', {
    solvedCount: codingState?.solvedCount || 0,
    lastInterviewScore: interviewState?.lastScore || 0,
    interviewCount: interviewState?.totalCompleted || 0,
    journalCount: journalEntries?.length || 0,
    aptitudeTestsCount: aptitudeState?.totalTests || 0,
    name: profile?.name,
    college: profile?.college
  });
  const currentStreak = Math.max(gamificationData?.activeStreak || 0, 1);

  // User Customizable Goals storage (no fixed/default tasks)
  const userSafeKey = (profile?.email || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const goalsStorageKey = `neuroprep_user_tasks_${userSafeKey}`;

  const [dailyGoals, setDailyGoals] = useState(() => {
    try {
      const saved = localStorage.getItem(goalsStorageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}
    return [];
  });

  const saveDailyGoals = (newGoals) => {
    setDailyGoals(newGoals);
    try {
      localStorage.setItem(goalsStorageKey, JSON.stringify(newGoals));
    } catch (_) {}
  };

  // Helper to compute remaining 24-hour time for each task from its creation timestamp
  const getTaskTimeRemaining = (createdAt, isDone, completedAt) => {
    const created = createdAt || Date.now();
    const deadline = created + (24 * 60 * 60 * 1000);

    if (isDone) {
      const wasInTime = completedAt ? (completedAt <= deadline) : true;
      return {
        status: 'completed',
        text: wasInTime ? 'Completed within 24h' : 'Completed after 24h',
        badgeColor: 'var(--btn-sage)',
        badgeBg: 'rgba(82, 98, 87, 0.1)'
      };
    }

    const diff = deadline - currentTime;
    if (diff <= 0) {
      return {
        status: 'expired',
        text: 'Expired (24h exceeded)',
        badgeColor: 'var(--accent-terracotta)',
        badgeBg: 'rgba(154, 104, 84, 0.1)'
      };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    return {
      status: 'active',
      hours,
      minutes,
      seconds,
      text: `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s left`,
      badgeColor: hours < 4 ? 'var(--accent-terracotta)' : 'var(--btn-sage)',
      badgeBg: hours < 4 ? 'rgba(154, 104, 84, 0.1)' : 'rgba(82, 98, 87, 0.1)'
    };
  };

  const toggleGoal = (id) => {
    const now = Date.now();
    const updated = dailyGoals.map(g => {
      if (g.id === id) {
        const nextDone = !g.isDone;
        if (nextDone) {
          try {
            recordActivity(profile?.email || 'guest', 'daily_goal', 25);
          } catch (_) {}
        }
        return { 
          ...g, 
          isDone: nextDone, 
          completedAt: nextDone ? now : null 
        };
      }
      return g;
    });
    saveDailyGoals(updated);
  };

  const deleteGoal = (id) => {
    const updated = dailyGoals.filter(g => g.id !== id);
    saveDailyGoals(updated);
  };

  // State for adding custom goals
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTag, setNewGoalTag] = useState('Study & Notes');
  const [newGoalDesc, setNewGoalDesc] = useState('');

  const handleAddCustomGoal = (e) => {
    if (e) e.preventDefault();
    if (!newGoalTitle.trim()) return;

    const now = Date.now();
    const newGoal = {
      id: `task_${now}_${Math.random().toString(36).substr(2, 5)}`,
      tag: newGoalTag || 'Personal Goal',
      tagBg: 'rgba(82, 98, 87, 0.1)',
      tagColor: 'var(--btn-sage)',
      points: '+25 Points',
      title: newGoalTitle.trim(),
      description: newGoalDesc.trim() || '',
      createdAt: now,
      expiresAt: now + (24 * 60 * 60 * 1000),
      isDone: false,
      completedAt: null
    };

    saveDailyGoals([newGoal, ...dailyGoals]);
    setNewGoalTitle('');
    setNewGoalDesc('');
    setShowAddGoalModal(false);
  };

  const totalGoalsCount = dailyGoals.length;
  const completedGoalsCount = dailyGoals.filter(g => g.isDone).length;
  const activeGoalsCount = dailyGoals.filter(g => !g.isDone && (currentTime < (g.createdAt + 24 * 60 * 60 * 1000))).length;
  const expiredGoalsCount = dailyGoals.filter(g => !g.isDone && (currentTime >= (g.createdAt + 24 * 60 * 60 * 1000))).length;
  const progressPercent = totalGoalsCount > 0 ? Math.round((completedGoalsCount / totalGoalsCount) * 100) : 0;

  let progressStatusTitle = 'Ready When You Are';
  let progressStatusDesc = 'Add your first task above. You get exactly 24 hours to complete it!';
  if (totalGoalsCount > 0) {
    if (completedGoalsCount === totalGoalsCount) {
      progressStatusTitle = 'All Tasks Completed!';
      progressStatusDesc = 'Great job! You finished your tasks and kept your study streak safe.';
    } else if (expiredGoalsCount > 0 && activeGoalsCount === 0) {
      progressStatusTitle = 'Tasks Expired';
      progressStatusDesc = 'Some tasks passed their 24-hour limit. Add a new goal to restart your momentum.';
    } else {
      progressStatusTitle = 'Practice in Progress';
      progressStatusDesc = 'Complete your tasks before their 24-hour countdowns expire to protect your streak.';
    }
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
              fontWeight: 600,
              borderRadius: '12px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
              backgroundColor: 'var(--btn-sage)',
              color: '#ffffff',
              border: '1px solid var(--btn-sage-hover)',
              cursor: 'pointer'
            }}
          >
            <span style={{ color: '#ffffff' }}>Write Today's Diary Entry</span>
          </button>
        </div>
      </section>

      {/* 2. USER'S DAILY GOALS & 24-HOUR STREAK TRACKER */}
      <section style={{ marginBottom: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
          <div>
            <h2 className="section-title" style={{ fontSize: '24px', margin: '0 0 4px 0' }}>
              Your Tasks for Today
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0 }}>
              Add your personal goals. Each task gives you 24 hours from creation to complete it and maintain your streak.
            </p>
          </div>

          {/* Streak & Active Count Badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <span className="pill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0, color: 'var(--accent-terracotta)' }}>
              <Flame style={{ width: '13px', height: '13px', color: 'var(--accent-terracotta)' }} />
              {currentStreak} Day Streak Active
            </span>

            <span className="pill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0, color: 'var(--btn-sage)' }}>
              <Clock style={{ width: '13px', height: '13px', color: 'var(--btn-sage)' }} />
              {activeGoalsCount} Active (24h Window)
            </span>

            <span className="pill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', margin: 0, color: 'var(--secondary-heading)' }}>
              <CheckCircle2 style={{ width: '13px', height: '13px', color: 'var(--btn-sage)' }} />
              {completedGoalsCount} of {totalGoalsCount} Completed
            </span>
          </div>
        </div>

        {/* 2-Column Responsive Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.45fr) minmax(0, 1fr)', gap: '24px' }}>
          
          {/* LEFT: User's Tasks & Add Goal Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            {/* Top Bar with Add Goal Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
              <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Your Custom Tasks
              </span>
              <button
                onClick={() => setShowAddGoalModal(!showAddGoalModal)}
                className="btn-primary-spec"
                style={{
                  padding: '8px 16px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: 'var(--btn-sage)',
                  color: '#ffffff',
                  border: '1px solid var(--btn-sage-hover)',
                  cursor: 'pointer'
                }}
              >
                {showAddGoalModal ? <X style={{ width: '13px', height: '13px', color: '#ffffff' }} /> : <Plus style={{ width: '13px', height: '13px', color: '#ffffff' }} />}
                <span style={{ color: '#ffffff' }}>{showAddGoalModal ? 'Cancel' : 'Add a Personal Goal'}</span>
              </button>
            </div>

            {/* Inline Add Goal Form */}
            {showAddGoalModal && (
              <form 
                onSubmit={handleAddCustomGoal}
                className="saas-card-spec"
                style={{
                  padding: '20px',
                  backgroundColor: 'rgba(235, 245, 238, 0.3)',
                  border: '1.5px dashed var(--btn-sage)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: 'var(--main-heading)' }}>
                    Add a New Task
                  </h4>
                  <span style={{ fontSize: '11px', color: 'var(--btn-sage)', fontWeight: 600 }}>
                    24-Hour Timer Starts Now
                  </span>
                </div>

                <input
                  type="text"
                  placeholder="What would you like to achieve? (e.g., Solve 2 practice questions, review resume)"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px',
                    fontFamily: 'inherit',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--main-heading)',
                    outline: 'none'
                  }}
                  autoFocus
                />

                {/* Quick Category Selector */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>Category:</span>
                  {['Study & Notes', 'Coding', 'Interview', 'Puzzles', 'Self-Care', 'Other'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setNewGoalTag(cat)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 600,
                        border: newGoalTag === cat ? '1px solid var(--btn-sage)' : '1px solid var(--border-color)',
                        backgroundColor: newGoalTag === cat ? 'var(--btn-sage)' : 'transparent',
                        color: newGoalTag === cat ? '#ffffff' : 'var(--body-text)',
                        cursor: 'pointer'
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <input
                  type="text"
                  placeholder="Optional details or reminder notes..."
                  value={newGoalDesc}
                  onChange={(e) => setNewGoalDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    fontSize: '12px',
                    fontFamily: 'inherit',
                    backgroundColor: 'var(--bg-main)',
                    color: 'var(--main-heading)',
                    outline: 'none'
                  }}
                />

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddGoalModal(false)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'transparent',
                      color: 'var(--body-text)',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary-spec"
                    style={{
                      padding: '8px 18px',
                      fontSize: '12.5px',
                      fontWeight: 600,
                      borderRadius: '8px',
                      backgroundColor: 'var(--btn-sage)',
                      color: '#ffffff',
                      border: '1px solid var(--btn-sage-hover)',
                      cursor: 'pointer'
                    }}
                  >
                    <span style={{ color: '#ffffff' }}>Add Task (Start 24h Timer)</span>
                  </button>
                </div>
              </form>
            )}

            {/* List of User Goals */}
            {dailyGoals.length === 0 ? (
              <div className="saas-card-spec" style={{ padding: '36px 24px', textAlign: 'center' }}>
                <Clock style={{ width: '28px', height: '28px', color: 'var(--btn-sage)', margin: '0 auto 10px auto' }} />
                <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: 'var(--main-heading)' }}>
                  No tasks added yet
                </h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '13.5px', margin: '0 0 16px 0', maxWidth: '380px', marginInline: 'auto', lineHeight: 1.45 }}>
                  Click "Add a Personal Goal" to set a task. You will get an exact 24-hour countdown from the moment you add it to complete it and build your streak!
                </p>
                <button
                  onClick={() => setShowAddGoalModal(true)}
                  className="btn-primary-spec"
                  style={{
                    fontSize: '12.5px',
                    fontWeight: 600,
                    padding: '8px 18px',
                    margin: '0 auto',
                    borderRadius: '8px',
                    backgroundColor: 'var(--btn-sage)',
                    color: '#ffffff',
                    border: '1px solid var(--btn-sage-hover)',
                    cursor: 'pointer'
                  }}
                >
                  <Plus style={{ width: '13px', height: '13px', marginRight: '4px', color: '#ffffff' }} />
                  <span style={{ color: '#ffffff' }}>Add Your First Task</span>
                </button>
              </div>
            ) : (
              dailyGoals.map((g) => {
                const isDone = Boolean(g.isDone);
                const timeInfo = getTaskTimeRemaining(g.createdAt, isDone, g.completedAt);
                return (
                  <div 
                    key={g.id} 
                    className="saas-card-spec"
                    style={{
                      padding: '16px 20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                      transition: 'all 0.2s ease',
                      backgroundColor: isDone ? 'rgba(235, 245, 238, 0.45)' : 'var(--bg-card-solid)',
                      border: isDone ? '1px solid rgba(82, 98, 87, 0.3)' : (timeInfo.status === 'expired' ? '1px solid rgba(154, 104, 84, 0.4)' : '1px solid var(--border-color)')
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1, minWidth: 0 }}>
                      <button
                        onClick={() => toggleGoal(g.id)}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            letterSpacing: '0.02em',
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: g.tagBg || 'rgba(82, 98, 87, 0.1)',
                            color: g.tagColor || 'var(--btn-sage)'
                          }}>
                            {g.tag}
                          </span>

                          {/* 24-Hour Timer Badge for this task */}
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 700,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            backgroundColor: timeInfo.badgeBg,
                            color: timeInfo.badgeColor,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <Clock style={{ width: '11px', height: '11px' }} />
                            {timeInfo.text}
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
                          {g.title}
                        </h4>

                        {g.description && (
                          <p style={{
                            fontSize: '12.5px',
                            color: 'var(--body-text)',
                            margin: 0,
                            lineHeight: 1.4,
                            opacity: isDone ? 0.75 : 1
                          }}>
                            {g.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <button
                        onClick={() => toggleGoal(g.id)}
                        className="btn-primary-spec"
                        style={{
                          padding: '7px 15px',
                          fontSize: '12px',
                          fontWeight: 600,
                          gap: '5px',
                          borderRadius: '8px',
                          backgroundColor: isDone ? 'rgba(82, 98, 87, 0.2)' : 'var(--btn-sage)',
                          color: isDone ? 'var(--btn-sage)' : '#ffffff',
                          border: isDone ? '1px solid rgba(82, 98, 87, 0.35)' : '1px solid var(--btn-sage-hover)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center'
                        }}
                      >
                        <span style={{ color: isDone ? 'var(--btn-sage)' : '#ffffff' }}>
                          {isDone ? 'Completed' : 'Mark Done'}
                        </span>
                        <Check style={{ width: '13px', height: '13px', color: isDone ? 'var(--btn-sage)' : '#ffffff' }} />
                      </button>

                      {/* Delete button */}
                      <button
                        onClick={() => deleteGoal(g.id)}
                        title="Remove Task"
                        style={{
                          background: 'none',
                          border: 'none',
                          padding: '6px',
                          cursor: 'pointer',
                          color: 'var(--text-muted)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '6px',
                          transition: 'color 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--accent-terracotta)'}
                        onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
                      >
                        <Trash2 style={{ width: '15px', height: '15px' }} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT: Task Progress & 24-Hour Rule Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* 1. Task Progress & Milestone Tracker */}
            <div className="saas-card-spec" style={{ padding: '22px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <span className="pill-tag" style={{ margin: 0 }}>Task Progress</span>
                <span style={{ fontSize: '13px', fontWeight: 800, color: 'var(--main-heading)' }}>
                  {progressPercent}% Complete
                </span>
              </div>

              <h3 style={{ fontSize: '17px', fontWeight: 800, color: 'var(--main-heading)', marginBottom: '6px' }}>
                {progressStatusTitle}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--body-text)', margin: '0 0 16px 0', lineHeight: 1.45 }}>
                {progressStatusDesc}
              </p>

              {/* Progress 4-Step Indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
                {[1, 2, 3, 4].map((step) => {
                  const targetThreshold = step * 25;
                  const isReached = progressPercent >= targetThreshold || (step === 1 && completedGoalsCount > 0);
                  return (
                    <div
                      key={step}
                      style={{
                        flex: 1,
                        height: '7px',
                        borderRadius: '4px',
                        backgroundColor: isReached ? 'var(--btn-sage)' : 'rgba(216, 210, 206, 0.45)',
                        transition: 'background-color 0.3s ease'
                      }}
                    />
                  );
                })}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)' }}>
                <span>Start</span>
                <span>In Progress</span>
                <span>Almost There</span>
                <span>Streak Safe</span>
              </div>

              {/* Summary Stats Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--main-heading)' }}>{totalGoalsCount}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Total Tasks</div>
                </div>
                <div style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--btn-sage)' }}>{completedGoalsCount}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Completed</div>
                </div>
                <div style={{ flex: 1, padding: '10px 12px', borderRadius: '8px', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--accent-terracotta)' }}>{activeGoalsCount}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>In 24h Window</div>
                </div>
              </div>
            </div>

            {/* 2. 24-Hour Streak Rule Card */}
            <div className="saas-card-spec" style={{ padding: '20px 22px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                <Clock style={{ width: '16px', height: '16px', color: 'var(--btn-sage)' }} />
                <span style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-muted)' }}>
                  24-Hour Task Rule
                </span>
              </div>

              <p style={{ fontSize: '13px', color: 'var(--body-text)', margin: '0 0 14px 0', lineHeight: 1.5 }}>
                Each task starts an exact 24-hour countdown the moment you add it. Complete your tasks before their time runs out to protect and grow your daily practice streak.
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                backgroundColor: 'rgba(154, 104, 84, 0.08)'
              }}>
                <Flame style={{ width: '16px', height: '16px', color: 'var(--accent-terracotta)', flexShrink: 0 }} />
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--accent-terracotta)' }}>
                  {currentStreak} Day Practice Streak Active
                </span>
              </div>
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
