import React, { useState, useEffect } from 'react';
import { 
  Trophy, Star, Zap, Target, Code2, Mic2, BookOpen, Award, Lock, 
  Flame, CheckCircle2, Shield, Brain, Briefcase, Smile, Gift, ArrowRight,
  TrendingUp, Sparkles, Download, Check, FileText, Cpu, ArrowLeft, X
} from 'lucide-react';
import { 
  getGamificationData, 
  claimQuestReward, 
  XP_REWARDS,
  RANK_TIERS 
} from '../services/gamificationService';

export default function Gamification({ 
  profile = {},
  codingState = {}, 
  interviewState = {}, 
  aptitudeState = {},
  journalEntries = [],
  userEmail = 'guest', 
  setActiveTab 
}) {
  const [activeTab, setLocalTab] = useState('quests');
  const [badgeFilter, setBadgeFilter] = useState('all');
  const [claimToast, setClaimToast] = useState(null);
  const [claimedRewards, setClaimedRewards] = useState({});
  const [refreshTick, setRefreshTick] = useState(0);

  // Listen for real-time gamification updates
  useEffect(() => {
    const handleGamificationUpdate = () => {
      setRefreshTick(prev => prev + 1);
    };
    window.addEventListener('neuroprep-gamification-update', handleGamificationUpdate);
    return () => window.removeEventListener('neuroprep-gamification-update', handleGamificationUpdate);
  }, []);

  // Fetch live gamification data strictly from real activity
  const data = getGamificationData(userEmail, {
    name: profile?.name || 'You',
    college: profile?.college || 'Engineering Student',
    solvedCount: codingState.solvedCount || 0,
    interviewCount: interviewState.totalCompleted || 0,
    lastInterviewScore: interviewState.lastScore || 0,
    aptitudeTestsCount: aptitudeState?.totalTests || aptitudeState?.testsTaken || (aptitudeState?.score > 0 ? 1 : 0),
    journalCount: journalEntries.length || 0
  });

  const handleClaimQuest = (questId, xpAmount, title) => {
    claimQuestReward(userEmail, questId, xpAmount);
    setClaimToast(`Claimed +${xpAmount} XP for ${title}`);
    setTimeout(() => setClaimToast(null), 4000);
  };

  const handleClaimReward = (rewardId, title) => {
    setClaimedRewards(prev => ({ ...prev, [rewardId]: true }));
    setClaimToast(`Unlocked ${title}. Saved to your resources.`);
    setTimeout(() => setClaimToast(null), 4000);
  };

  // Filtered badges
  const displayedBadges = data.unlockedBadges.concat(data.lockedBadges).filter(b => {
    const isUnlocked = data.unlockedBadges.some(ub => ub.id === b.id);
    if (badgeFilter === 'unlocked') return isUnlocked;
    if (badgeFilter === 'locked') return !isUnlocked;
    return true;
  });

  // Render dynamic badge icon
  const renderBadgeIcon = (iconName, color, isUnlocked) => {
    const props = { size: 24, color: isUnlocked ? color : '#9CA3AF' };
    switch (iconName) {
      case 'Code2': return <Code2 {...props} />;
      case 'Star': return <Star {...props} />;
      case 'Award': return <Award {...props} />;
      case 'Trophy': return <Trophy {...props} />;
      case 'Mic2': return <Mic2 {...props} />;
      case 'Briefcase': return <Briefcase {...props} />;
      case 'Zap': return <Zap {...props} />;
      case 'Brain': return <Brain {...props} />;
      case 'Target': return <Target {...props} />;
      case 'BookOpen': return <BookOpen {...props} />;
      case 'Smile': return <Smile {...props} />;
      case 'Flame': return <Flame {...props} />;
      case 'CheckCircle2': return <CheckCircle2 {...props} />;
      default: return <Award {...props} />;
    }
  };

  // Render reward icon
  const renderRewardIcon = (iconName) => {
    const props = { size: 24, color: '#111827' };
    switch (iconName) {
      case 'FileText': return <FileText {...props} />;
      case 'Target': return <Target {...props} />;
      case 'Cpu': return <Cpu {...props} />;
      case 'Mic2': return <Mic2 {...props} />;
      default: return <Award {...props} />;
    }
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1040, margin: '0 auto', fontFamily: 'var(--font-inter)' }}>
      
      {/* Toast Notification */}
      {claimToast && (
        <div style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          backgroundColor: '#111827',
          color: '#FFFFFF',
          padding: '14px 22px',
          borderRadius: 12,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 1000
        }}>
          <Sparkles size={18} color="#FFFFFF" />
          <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{claimToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #E5E7EB',
        borderRadius: 20,
        padding: '28px 32px',
        marginBottom: 28,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <span style={{
              backgroundColor: '#111827',
              color: '#FFFFFF',
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '3px 10px',
              borderRadius: 20,
              letterSpacing: '0.5px'
            }}>
              {data.currentTier.badge}
            </span>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: data.currentTier.color }}>
              {data.currentTier.name}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>
              Level {data.level}
            </span>
          </div>

          <h1 style={{ fontSize: '1.9rem', fontWeight: 900, color: '#111827', margin: '0 0 8px 0', letterSpacing: '-0.5px' }}>
            Daily Challenges, Streaks & Achievements
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.92rem', margin: 0 }}>
            Track your daily practice consistency, earn experience points, and prepare for campus placement success.
          </p>

          {/* XP Progress Bar */}
          <div style={{ marginTop: 18, maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', fontWeight: 700, color: '#111827', marginBottom: 6 }}>
              <span>{data.totalXp} XP Total</span>
              {data.nextTier ? (
                <span style={{ color: '#6B7280' }}>
                  {data.nextTier.minXp - data.totalXp} XP to {data.nextTier.name}
                </span>
              ) : (
                <span style={{ color: '#111827' }}>Highest Rank Achieved</span>
              )}
            </div>
            <div style={{ height: 10, backgroundColor: '#F3F4F6', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${data.xpProgress}%`,
                backgroundColor: '#111827',
                borderRadius: 10,
                transition: 'width 0.4s ease'
              }} />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: '0.82rem', fontWeight: 600, color: '#6B7280' }}>
            <span>{data.solvedCount} Problems Solved</span>
            <span>{data.interviewCount} Interviews Taken</span>
            <span>{data.unlockedBadges.length} Badges Earned</span>
          </div>
        </div>

        {/* Right side: Back to Dashboard & Streak Box */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
          <button 
            onClick={() => setActiveTab && setActiveTab('dashboard')} 
            className="btn-secondary-spec"
            style={{ padding: '8px 18px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>

          <div style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            padding: '16px 20px',
            textAlign: 'center',
            minWidth: 260
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
              <Flame size={24} color={data.activeStreak > 0 ? '#111827' : '#9CA3AF'} />
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 900, color: data.activeStreak > 0 ? '#111827' : '#6B7280' }}>
              {data.activeStreak} {data.activeStreak === 1 ? 'Day' : 'Days'} Streak
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 2, fontWeight: 600 }}>
              All-Time Best: {data.bestStreak} {data.bestStreak === 1 ? 'Day' : 'Days'}
            </div>

            {/* 7-Day Week Indicator */}
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
              {data.currentWeekDays.map((item, idx) => {
                let iconElement = null;
                if (item.isDone) {
                  iconElement = <Check size={11} strokeWidth={3} />;
                } else if (item.isToday) {
                  iconElement = <span style={{ fontSize: '13px', lineHeight: 1 }}>•</span>;
                } else if (item.isPast) {
                  iconElement = <X size={11} strokeWidth={2.5} />;
                }

                return (
                  <div key={idx} style={{ textAlign: 'center', flex: 1 }}>
                    <div 
                      title={`${item.day}: ${item.isDone ? 'Completed' : (item.isToday ? 'Today (Pending)' : (item.isPast ? 'Missed' : 'Upcoming'))}`}
                      style={{
                        height: '22px',
                        borderRadius: '5px',
                        backgroundColor: item.isDone ? '#111827' : (item.isToday ? '#FFFFFF' : '#FFFFFF'),
                        border: item.isDone ? '1px solid #111827' : (item.isToday ? '1.5px dashed #111827' : '1px solid #D1D5DB'),
                        color: item.isDone ? '#FFFFFF' : (item.isToday ? '#111827' : '#9CA3AF'),
                        fontSize: '10px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '3px'
                      }}
                    >
                      {iconElement}
                    </div>
                    <span style={{ fontSize: '9px', color: item.isToday ? '#111827' : '#6B7280', fontWeight: item.isToday ? 700 : 500 }}>
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #E5E7EB', paddingBottom: 12 }}>
        {[
          ['quests', 'Daily Goals & Streaks'],
          ['achievements', `Achievement Badges (${data.unlockedBadges.length}/${data.unlockedBadges.length + data.lockedBadges.length})`],
          ['leaderboard', 'Campus Leaderboard'],
          ['rewards', 'Career Resources']
        ].map(([id, label]) => (
          <button 
            key={id} 
            onClick={() => setLocalTab(id)} 
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
              background: activeTab === id ? '#111827' : '#F1F5F9',
              color: activeTab === id ? '#FFFFFF' : '#475569',
              fontWeight: 700,
              fontSize: '0.85rem',
              transition: 'all 0.2s ease'
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* TAB 1: DAILY QUESTS & STREAKS */}
      {activeTab === 'quests' && (
        <div>
          {/* Today's Featured Challenge Card */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 18,
            padding: '24px 28px',
            marginBottom: 24,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 20,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '3px 10px', borderRadius: 20, backgroundColor: '#F3F4F6', color: '#111827' }}>
                  TODAY'S FEATURED PROBLEM
                </span>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 6,
                  backgroundColor: '#F3F4F6',
                  color: '#111827'
                }}>
                  {data.dailyChallenge.difficulty}
                </span>
              </div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
                {data.dailyChallenge.title}
              </h2>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: 0 }}>
                Topic: <strong>{data.dailyChallenge.category}</strong>
              </p>
            </div>

            <button
              onClick={() => setActiveTab('daily-challenge')}
              className="btn-primary-spec"
              style={{ padding: '12px 28px', fontSize: '0.92rem', borderRadius: 10 }}
            >
              Solve in Challenge Arena (+{data.dailyChallenge.xpReward} XP)
            </button>
          </div>

          {/* 3 Interactive Daily Quests */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Today's Placement Goals
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '2px 0 0 0' }}>
                  Resets daily. Complete all 3 goals to claim an extra +50 XP bonus.
                </p>
              </div>

              {data.isTripleCrownClaimable && (
                <button
                  onClick={() => handleClaimQuest('triple_crown', 50, 'Daily Champion Goals')}
                  className="btn-primary-spec"
                  style={{ backgroundColor: '#475569', color: '#FFFFFF', border: 'none', fontSize: '0.82rem', padding: '8px 16px', borderRadius: 8 }}
                >
                  Claim +50 XP Daily Champion Bonus
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {data.dailyQuests.map((quest) => (
                <div 
                  key={quest.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: 14,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: quest.completed ? '#111827' : '#6B7280', textTransform: 'uppercase' }}>
                        {quest.completed ? 'Goal Completed' : 'In Progress'}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#111827', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: 6 }}>
                        +{quest.xp} XP
                      </span>
                    </div>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: '0 0 4px 0' }}>
                      {quest.title}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
                      {quest.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: 18 }}>
                    {quest.claimable ? (
                      <button
                        onClick={() => handleClaimQuest(quest.id, quest.xp, quest.title)}
                        className="btn-primary-spec"
                        style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '8px 14px', backgroundColor: '#475569', color: '#FFFFFF', border: 'none' }}
                      >
                        Claim +{quest.xp} XP
                      </button>
                    ) : quest.claimed ? (
                      <div style={{ textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#111827', padding: '6px' }}>
                        Reward Claimed ✓
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (quest.id === 'dsa_quest') setActiveTab('daily-challenge');
                          else if (quest.id === 'aptitude_quest') setActiveTab('aptitude');
                          else if (quest.id === 'journal_quest') setActiveTab('journal');
                        }}
                        className="btn-secondary-spec"
                        style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '8px 14px' }}
                      >
                        Start Goal
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 30-Day Activity Calendar */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 18,
            padding: '24px 28px',
            marginBottom: 24
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  30-Day Practice Consistency
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '2px 0 0 0' }}>
                  Real activity matrix tracking consistency across coding, aptitude tests, mock interviews, and personal diary reflections.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#6B7280' }}>
                <span>Less</span>
                <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#F3F4F6' }} />
                <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#E5E7EB' }} />
                <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#111827' }} />
                <div style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: '#111827' }} />
                <span>More</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 6 }}>
              {data.heatmap.map((item, idx) => {
                const bgColors = ['#F3F4F6', '#E5E7EB', '#111827', '#111827'];
                return (
                  <div
                    key={idx}
                    title={`${item.date}: ${item.count} activities`}
                    style={{
                      height: 32,
                      borderRadius: 6,
                      backgroundColor: bgColors[item.level],
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: item.level >= 2 ? '#FFFFFF' : '#4B5563',
                      cursor: 'pointer'
                    }}
                  >
                    {item.date.slice(8)}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ACHIEVEMENTS & BADGES */}
      {activeTab === 'achievements' && (
        <div>
          {/* Badge Filter Pills */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {[
              ['all', `All Badges (${displayedBadges.length})`],
              ['unlocked', `Unlocked (${data.unlockedBadges.length})`],
              ['locked', `Locked (${data.lockedBadges.length})`]
            ].map(([val, label]) => (
              <button
                key={val}
                onClick={() => setBadgeFilter(val)}
                style={{
                  padding: '6px 16px',
                  borderRadius: 20,
                  border: '1px solid',
                  borderColor: badgeFilter === val ? '#475569' : '#E5E7EB',
                  backgroundColor: badgeFilter === val ? '#475569' : '#FFFFFF',
                  color: badgeFilter === val ? '#FFFFFF' : '#4B5563',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
            {displayedBadges.map(badge => {
              const isUnlocked = data.unlockedBadges.some(ub => ub.id === badge.id);
              return (
                <div 
                  key={badge.id}
                  style={{
                    backgroundColor: isUnlocked ? '#FFFFFF' : '#F9FAFB',
                    border: isUnlocked ? `2px solid ${badge.color}` : '1px dashed #E5E7EB',
                    borderRadius: 16,
                    padding: 22,
                    textAlign: 'center',
                    opacity: isUnlocked ? 1 : 0.65,
                    boxShadow: isUnlocked ? '0 4px 12px rgba(0, 0, 0, 0.04)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: '50%',
                      backgroundColor: isUnlocked ? '#F3F4F6' : '#F3F4F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 12px auto'
                    }}>
                      {renderBadgeIcon(badge.iconName, badge.color, isUnlocked)}
                    </div>
                    
                    <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
                      {badge.category}
                    </span>
                    <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: isUnlocked ? '#111827' : '#6B7280', margin: '4px 0 6px 0' }}>
                      {badge.title}
                    </h4>
                    <p style={{ fontSize: '0.75rem', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
                      {badge.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                    <span style={{ fontWeight: 700, color: '#111827' }}>+{badge.xpReward} XP</span>
                    <span style={{ fontWeight: 800, color: isUnlocked ? badge.color : '#9CA3AF' }}>
                      {isUnlocked ? 'Earned' : 'Locked'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div>
          <div style={{ backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: 18, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Campus Placement Leaderboard
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '2px 0 0 0' }}>
                  Peer rankings based on total experience points and practice consistency.
                </p>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div>
              {data.leaderboard.map((entry, idx) => (
                <div 
                  key={entry.id || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '16px 24px',
                    borderBottom: idx < data.leaderboard.length - 1 ? '1px solid #F3F4F6' : 'none',
                    backgroundColor: entry.isUser ? '#F3F4F6' : (entry.rank <= 3 ? '#FFFFFF' : '#FFFFFF'),
                    borderLeft: entry.isUser ? '4px solid #111827' : 'none'
                  }}
                >
                  <div style={{ fontSize: '1.1rem', width: 44, textAlign: 'center', fontWeight: 800, color: entry.rank <= 3 ? '#111827' : '#6B7280' }}>
                    {entry.rankBadge}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#111827' }}>
                        {entry.name} {entry.isUser ? '(You)' : ''}
                      </span>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '1px 6px', borderRadius: 4, backgroundColor: '#F3F4F6', color: '#111827' }}>
                        {entry.tier}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 2 }}>
                      {entry.college} • {entry.streak} {entry.streak === 1 ? 'Day' : 'Days'} Streak
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.1rem', color: '#111827' }}>
                      {entry.xp.toLocaleString()} <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>XP</span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#111827', fontWeight: 700 }}>
                      {entry.score} Readiness
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: XP MILESTONE REWARDS */}
      {activeTab === 'rewards' && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              Career Preparation Resources
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '2px 0 0 0' }}>
              Level up and earn experience points to unlock curated interview guides, ATS resume tools, and passes.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {XP_REWARDS.map(reward => {
              const isUnlocked = data.totalXp >= reward.xpReq;
              const isClaimed = claimedRewards[reward.id];
              return (
                <div
                  key={reward.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: isUnlocked ? '1px solid #E5E7EB' : '1px dashed #E5E7EB',
                    borderRadius: 16,
                    padding: 22,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isUnlocked ? '0 4px 14px rgba(0, 0, 0, 0.04)' : 'none',
                    opacity: isUnlocked ? 1 : 0.7
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 10,
                        backgroundColor: '#F3F4F6',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {renderRewardIcon(reward.iconName)}
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '2px 8px',
                        borderRadius: 6,
                        backgroundColor: '#F3F4F6',
                        color: isUnlocked ? '#111827' : '#9CA3AF'
                      }}>
                        {reward.xpReq} XP Required
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
                      {reward.title}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
                      {reward.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: 20 }}>
                    {isClaimed ? (
                      <div style={{ textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#111827', padding: '8px' }}>
                        Resource Saved ✓
                      </div>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => handleClaimReward(reward.id, reward.title)}
                        className="btn-primary-spec"
                        style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '9px 16px', backgroundColor: '#475569', color: '#FFFFFF', border: 'none' }}
                      >
                        <Download size={14} style={{ marginRight: 6 }} /> Access Resource
                      </button>
                    ) : (
                      <div style={{ textAlign: 'center', fontSize: '0.8rem', color: '#9CA3AF', fontWeight: 600, padding: '8px', backgroundColor: '#F9FAFB', borderRadius: 8 }}>
                        Reach {reward.xpReq} XP to Unlock
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
