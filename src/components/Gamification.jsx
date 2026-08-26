import React, { useState, useEffect } from 'react';
import { 
  Trophy, Star, Zap, Target, Code2, Mic2, BookOpen, Award, Lock, 
  Flame, CheckCircle2, Shield, Brain, Briefcase, Gift, ArrowRight,
  TrendingUp, Sparkles, Download, Check, FileText, Cpu, ArrowLeft, X,
  ChevronRight, Compass, Crown, Swords, Rocket
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
  const [activeTab, setLocalTab] = useState('quests'); // 'quests' | 'achievements' | 'leaderboard' | 'rewards'
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
    solvedCount: codingState?.solvedCount || 0,
    codingScore: codingState?.score || 0,
    interviewCount: interviewState?.totalCompleted || 0,
    lastInterviewScore: interviewState?.lastScore || 0,
    aptitudeTestsCount: aptitudeState?.totalTests || aptitudeState?.testsTaken || (aptitudeState?.score > 0 ? 1 : 0),
    journalCount: journalEntries?.length || 0
  });

  const handleClaimQuest = (questId, xpAmount, title) => {
    claimQuestReward(userEmail, questId, xpAmount);
    setClaimToast(`+${xpAmount} XP Claimed for completing ${title}! Leveling up!`);
    setTimeout(() => setClaimToast(null), 4000);
  };

  const handleClaimReward = (rewardId, title) => {
    setClaimedRewards(prev => ({ ...prev, [rewardId]: true }));
    setClaimToast(`Unlocked ${title}! Added to your placement kit.`);
    setTimeout(() => setClaimToast(null), 4000);
  };

  // Filtered badges
  const allBadgesList = data.unlockedBadges.concat(data.lockedBadges);
  const displayedBadges = allBadgesList.filter(b => {
    const isUnlocked = data.unlockedBadges.some(ub => ub.id === b.id);
    if (badgeFilter === 'unlocked') return isUnlocked;
    if (badgeFilter === 'locked') return !isUnlocked;
    return true;
  });

  const renderBadgeIcon = (iconName, isUnlocked) => {
    const props = { size: 24, color: isUnlocked ? '#111827' : '#9CA3AF' };
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
      case 'Flame': return <Flame {...props} />;
      case 'CheckCircle2': return <CheckCircle2 {...props} />;
      default: return <Award {...props} />;
    }
  };

  // Career Perks & Loot Items
  const CAREER_LOOT = [
    {
      id: 'loot_1',
      title: 'Top 50 Campus Coding Sheet',
      reqLevel: 2,
      desc: 'Handpicked list of high-frequency interview coding problems for product and service companies.',
      type: 'Study Guide',
      icon: FileText
    },
    {
      id: 'loot_2',
      title: 'STAR Method Interview Cheatsheet',
      reqLevel: 4,
      desc: 'Proven behavioral answers and speaking frameworks to clear HR & Managerial rounds with confidence.',
      type: 'Interview Kit',
      icon: Mic2
    },
    {
      id: 'loot_3',
      title: 'System Design & OOP Blueprint',
      reqLevel: 7,
      desc: 'Quick revision cards on database indexing, microservices, and design patterns.',
      type: 'Technical Guide',
      icon: Cpu
    },
    {
      id: 'loot_4',
      title: 'Mock Interview VIP Pass',
      reqLevel: 10,
      desc: 'Unlimited high-intensity technical interview rounds with detailed question-by-question breakdown.',
      type: 'VIP Unlock',
      icon: Crown
    }
  ];

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1060, margin: '0 auto', fontFamily: 'var(--font-inter)' }}>
      
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
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          zIndex: 1000,
          fontSize: '0.9rem',
          fontWeight: 700
        }}>
          <Sparkles size={18} color="#FFFFFF" />
          <span>{claimToast}</span>
        </div>
      )}

      {/* Hero Header & Level Banner */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #E5E7EB',
        borderRadius: 22,
        padding: '30px 34px',
        marginBottom: 26,
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: 24,
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)'
      }}>
        <div>
          {/* Rank Badge */}
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
            <span style={{ fontSize: '0.95rem', fontWeight: 900, color: '#111827' }}>
              {data.currentTier.name}
            </span>
            <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>
              Level {data.level}
            </span>
          </div>

          <h1 style={{ fontSize: '1.85rem', fontWeight: 900, color: '#111827', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
            Placement Quest & Adventure Arena
          </h1>
          <p style={{ color: '#4B5563', fontSize: '0.9rem', margin: 0, lineHeight: 1.4 }}>
            Level up your career skills every day! Complete quests, build your streak, unlock badges, and get placement ready.
          </p>

          {/* XP Progress Bar */}
          <div style={{ marginTop: 18, maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', fontWeight: 700, color: '#111827', marginBottom: 6 }}>
              <span>{data.totalXp} Total XP Earned</span>
              {data.nextTier ? (
                <span style={{ color: '#6B7280' }}>
                  {data.nextTier.minXp - data.totalXp} XP to {data.nextTier.name}
                </span>
              ) : (
                <span style={{ color: '#15803D' }}>Max Placement Rank!</span>
              )}
            </div>
            <div style={{ height: 10, backgroundColor: '#F3F4F6', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${data.xpProgress}%`,
                backgroundColor: '#111827',
                borderRadius: 10,
                transition: 'width 0.5s ease'
              }} />
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: '0.82rem', fontWeight: 700, color: '#4B5563' }}>
            <span>{data.solvedCount} Problems Solved</span>
            <span>•</span>
            <span>{data.interviewCount} Mocks Taken</span>
            <span>•</span>
            <span>{data.unlockedBadges.length} Badges Unlocked</span>
          </div>
        </div>

        {/* Right side: Streak & Back Button */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 14 }}>
          <button 
            onClick={() => setActiveTab && setActiveTab('dashboard')} 
            className="btn-secondary-spec"
            style={{ padding: '8px 18px', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </button>

          {/* Daily Streak Card */}
          <div style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: 16,
            padding: '16px 20px',
            textAlign: 'center',
            width: '100%',
            maxWidth: 280
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <Flame size={22} color={data.activeStreak > 0 ? '#111827' : '#9CA3AF'} />
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: data.activeStreak > 0 ? '#111827' : '#6B7280' }}>
                {data.activeStreak} Day {data.activeStreak === 1 ? 'Streak' : 'Streak'}
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>
              All-Time Best: <strong>{data.bestStreak} Days</strong>
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

      {/* Main Navigation Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, borderBottom: '1px solid #E5E7EB', paddingBottom: 12 }}>
        {[
          ['quests', 'Daily Quests & Streaks'],
          ['achievements', `Trophy Hall (${data.unlockedBadges.length}/${allBadgesList.length})`],
          ['leaderboard', 'Campus Leaderboard'],
          ['rewards', 'Career Loot & Unlocks']
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
          {/* Today's Featured Problem Card */}
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
                  FEATURED CODE BOSS OF THE DAY
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
                Category: <strong>{data.dailyChallenge.category}</strong> • Defeat this problem to boost your placement score.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('coding')}
              className="btn-primary-spec"
              style={{ padding: '12px 28px', fontSize: '0.92rem', borderRadius: 10 }}
            >
              Solve Problem (+{data.dailyChallenge.xpReward} XP)
            </button>
          </div>

          {/* 3 Interactive Daily Quests */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                  Today's 3 Daily Quests
                </h3>
                <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '2px 0 0 0' }}>
                  Resets every 24 hours. Complete all 3 quests to claim the Triple Crown Bonus (+50 XP).
                </p>
              </div>

              {data.isTripleCrownClaimable && (
                <button
                  onClick={() => handleClaimQuest('triple_crown', 50, 'Triple Crown Champion')}
                  className="btn-primary-spec"
                  style={{ backgroundColor: '#15803D', color: '#FFFFFF', border: 'none', fontSize: '0.82rem', padding: '8px 16px', borderRadius: 8 }}
                >
                  Claim +50 XP Triple Crown Bonus
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {data.dailyQuests.map((quest) => (
                <div 
                  key={quest.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: quest.completed ? '1.5px solid #86EFAC' : '1px solid #E5E7EB',
                    borderRadius: 16,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        color: quest.completed ? '#15803D' : '#6B7280',
                        backgroundColor: quest.completed ? '#DCFCE7' : '#F3F4F6',
                        padding: '2px 8px',
                        borderRadius: '4px'
                      }}>
                        {quest.completed ? '✓ Quest Completed' : 'In Progress'}
                      </span>
                      <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#111827', backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: 6 }}>
                        +{quest.xp} XP
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.02rem', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
                      {quest.title}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#4B5563', margin: 0, lineHeight: 1.4 }}>
                      {quest.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: 18 }}>
                    {quest.claimable ? (
                      <button
                        onClick={() => handleClaimQuest(quest.id, quest.xp, quest.title)}
                        className="btn-primary-spec"
                        style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '9px 14px', backgroundColor: '#15803D', color: '#FFFFFF', border: 'none' }}
                      >
                        Claim +{quest.xp} XP
                      </button>
                    ) : quest.claimed ? (
                      <div style={{ textAlign: 'center', fontSize: '0.82rem', fontWeight: 700, color: '#15803D', padding: '6px' }}>
                        ✓ Reward Claimed
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveTab(quest.targetTab || 'coding')}
                        className="btn-secondary-spec"
                        style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem', padding: '8px 14px' }}
                      >
                        Start Quest ➔
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 30-Day Practice Consistency Grid */}
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
                  30-Day Consistency Journey
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '2px 0 0 0' }}>
                  Every day you solve problems or practice mock interviews, your consistency trail lights up.
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: '#6B7280' }}>
                <span>Less Active</span>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, backgroundColor: '#E5E7EB' }} />
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 2, backgroundColor: '#111827' }} />
                <span>Active</span>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: 6 }}>
              {data.heatmap.map((cell, idx) => (
                <div 
                  key={idx}
                  title={`${cell.date}: ${cell.count} activities`}
                  style={{
                    height: 24,
                    borderRadius: 4,
                    backgroundColor: cell.count > 0 ? '#111827' : '#F3F4F6',
                    border: cell.isToday ? '1.5px solid #111827' : '1px solid #E5E7EB',
                    cursor: 'pointer'
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TROPHY HALL & BADGES */}
      {activeTab === 'achievements' && (
        <div>
          {/* Badge Filter Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                Trophy Hall & Placement Badges
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '2px 0 0 0' }}>
                Unlock achievements as you practice coding, complete mock tests, and grow your consistency.
              </p>
            </div>

            <div style={{ display: 'flex', gap: 6 }}>
              {[
                ['all', 'All Badges'],
                ['unlocked', 'Unlocked'],
                ['locked', 'In Progress']
              ].map(([id, label]) => (
                <button
                  key={id}
                  onClick={() => setBadgeFilter(id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: '1px solid #E5E7EB',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: badgeFilter === id ? '#111827' : '#FFFFFF',
                    color: badgeFilter === id ? '#FFFFFF' : '#4B5563'
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Badges Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {displayedBadges.map((badge) => {
              const isUnlocked = data.unlockedBadges.some(ub => ub.id === badge.id);
              return (
                <div
                  key={badge.id}
                  style={{
                    backgroundColor: isUnlocked ? '#FFFFFF' : '#F9FAFB',
                    border: isUnlocked ? '1.5px solid #111827' : '1px solid #E5E7EB',
                    borderRadius: 16,
                    padding: 20,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: isUnlocked ? '0 4px 14px rgba(0, 0, 0, 0.04)' : 'none',
                    opacity: isUnlocked ? 1 : 0.75
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 12,
                        backgroundColor: isUnlocked ? '#F3F4F6' : '#E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        {renderBadgeIcon(badge.iconName, isUnlocked)}
                      </div>
                      <span style={{
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 6,
                        backgroundColor: isUnlocked ? '#DCFCE7' : '#F3F4F6',
                        color: isUnlocked ? '#15803D' : '#6B7280'
                      }}>
                        {isUnlocked ? '✓ Unlocked' : 'Locked'}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: isUnlocked ? '#111827' : '#6B7280', margin: '0 0 4px 0' }}>
                      {badge.title}
                    </h4>
                    <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: 0, lineHeight: 1.4 }}>
                      {badge.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: 14, fontSize: '0.78rem', fontWeight: 700, color: '#111827' }}>
                    Reward: +{badge.xpReward} XP
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CAMPUS LEADERBOARD */}
      {activeTab === 'leaderboard' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: 18, border: '1px solid #E5E7EB', padding: 24 }}>
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              Campus Placement Leaderboard
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '2px 0 0 0' }}>
              Friendly peer standings based on total practice XP earned.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.leaderboard.map((user) => (
              <div
                key={user.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '14px 18px',
                  borderRadius: 12,
                  backgroundColor: user.isUser ? '#111827' : '#F9FAFB',
                  color: user.isUser ? '#FFFFFF' : '#111827',
                  border: user.isUser ? 'none' : '1px solid #E5E7EB'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <span style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: user.isUser ? '#374151' : '#E5E7EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem',
                    fontWeight: 800,
                    color: user.isUser ? '#FFFFFF' : '#111827'
                  }}>
                    {user.rank}
                  </span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>
                      {user.name} {user.isUser && '(You)'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: user.isUser ? '#9CA3AF' : '#6B7280' }}>
                      {user.college} • {user.tier}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 900, fontSize: '1rem' }}>
                    {user.xp} XP
                  </div>
                  <div style={{ fontSize: '0.75rem', color: user.isUser ? '#9CA3AF' : '#6B7280' }}>
                    {user.streak} Day Streak
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CAREER LOOT & UNLOCKS */}
      {activeTab === 'rewards' && (
        <div>
          <div style={{ marginBottom: 18 }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              Career Loot & Placement Resources
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#6B7280', margin: '2px 0 0 0' }}>
              Unlock high-yield preparation guides and VIP mock tools as you level up your rank.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
            {CAREER_LOOT.map((loot) => {
              const isUnlocked = data.level >= loot.reqLevel;
              const isClaimed = claimedRewards[loot.id];
              const Icon = loot.icon;

              return (
                <div
                  key={loot.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: isUnlocked ? '1.5px solid #111827' : '1px solid #E5E7EB',
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
                        borderRadius: 12,
                        backgroundColor: isUnlocked ? '#F3F4F6' : '#E5E7EB',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <Icon size={22} color="#111827" />
                      </div>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        padding: '2px 8px',
                        borderRadius: 6,
                        backgroundColor: isUnlocked ? '#DCFCE7' : '#F3F4F6',
                        color: isUnlocked ? '#15803D' : '#6B7280'
                      }}>
                        {isUnlocked ? 'Unlocked' : `Requires Level ${loot.reqLevel}`}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
                      {loot.title}
                    </h4>
                    <p style={{ fontSize: '0.82rem', color: '#4B5563', margin: 0, lineHeight: 1.4 }}>
                      {loot.desc}
                    </p>
                  </div>

                  <div style={{ marginTop: 18 }}>
                    {isUnlocked ? (
                      <button
                        onClick={() => handleClaimReward(loot.id, loot.title)}
                        className="btn-primary-spec"
                        style={{ width: '100%', justifyContent: 'center', fontSize: '0.85rem', padding: '9px 14px' }}
                      >
                        {isClaimed ? '✓ In Your Vault (Download)' : 'Access Resource ➔'}
                      </button>
                    ) : (
                      <div style={{
                        textAlign: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        color: '#6B7280',
                        padding: '8px',
                        backgroundColor: '#F9FAFB',
                        borderRadius: 8
                      }}>
                        Earn {loot.reqLevel * 250 - data.totalXp} more XP to Unlock
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
