// gamificationService.js - Centralized Gamification, XP, Streaks & Daily Quests Service

import { DSA_CATEGORIES } from '../data/dsaPatternsData';

const STORAGE_KEY_PREFIX = 'neuroprep_gamification_';

// Rank Tiers definitions (Clean, professional titles)
export const RANK_TIERS = [
  { id: 'novice', name: 'Starter', minXp: 0, maxXp: 499, color: '#6B7280', badge: 'Tier 1', levelRange: 'Level 1 - 2' },
  { id: 'explorer', name: 'Active Learner', minXp: 500, maxXp: 1499, color: '#111827', badge: 'Tier 2', levelRange: 'Level 3 - 6' },
  { id: 'contender', name: 'Placement Contender', minXp: 1500, maxXp: 2999, color: '#111827', badge: 'Tier 3', levelRange: 'Level 7 - 12' },
  { id: 'specialist', name: 'Interview Ready', minXp: 3000, maxXp: 4999, color: '#111827', badge: 'Tier 4', levelRange: 'Level 13 - 20' },
  { id: 'grandmaster', name: 'Placement Master', minXp: 5000, maxXp: Infinity, color: '#111827', badge: 'Tier 5', levelRange: 'Level 21+' }
];

// 16 Comprehensive Badges with clear, easy-to-understand descriptions
export const ALL_BADGES = [
  {
    id: 'first_solve',
    title: 'First Problem Solved',
    category: 'Coding Practice',
    desc: 'Solve your very first coding problem',
    color: '#111827',
    iconName: 'Code2',
    xpReward: 50,
    check: (stats) => (stats.solvedCount || 0) >= 1
  },
  {
    id: 'dsa_novice',
    title: '5 Problems Milestone',
    category: 'Coding Practice',
    desc: 'Solve 5 coding problems successfully',
    color: '#111827',
    iconName: 'Star',
    xpReward: 100,
    check: (stats) => (stats.solvedCount || 0) >= 5
  },
  {
    id: 'dsa_pro',
    title: '15 Problems Milestone',
    category: 'Coding Practice',
    desc: 'Solve 15 coding problems successfully',
    color: '#111827',
    iconName: 'Award',
    xpReward: 250,
    check: (stats) => (stats.solvedCount || 0) >= 15
  },
  {
    id: 'dsa_master',
    title: 'Problem Solving Champion',
    category: 'Coding Practice',
    desc: 'Solve 30 or more coding problems across all topics',
    color: '#111827',
    iconName: 'Trophy',
    xpReward: 500,
    check: (stats) => (stats.solvedCount || 0) >= 30
  },
  {
    id: 'first_interview',
    title: 'First Mock Interview',
    category: 'Interview Practice',
    desc: 'Complete your first mock interview session',
    color: '#111827',
    iconName: 'Mic2',
    xpReward: 100,
    check: (stats) => (stats.interviewCount || 0) >= 1
  },
  {
    id: 'interview_pro',
    title: 'Interview Veteran',
    category: 'Interview Practice',
    desc: 'Complete 5 mock interview sessions',
    color: '#111827',
    iconName: 'Briefcase',
    xpReward: 250,
    check: (stats) => (stats.interviewCount || 0) >= 5
  },
  {
    id: 'high_scorer',
    title: 'Top Interview Score',
    category: 'Interview Practice',
    desc: 'Score 85% or higher in a mock interview session',
    color: '#111827',
    iconName: 'Zap',
    xpReward: 200,
    check: (stats) => (stats.lastInterviewScore || 0) >= 85
  },
  {
    id: 'aptitude_starter',
    title: 'Aptitude Starter',
    category: 'Aptitude & Logic',
    desc: 'Complete your first aptitude practice test',
    color: '#111827',
    iconName: 'Brain',
    xpReward: 60,
    check: (stats) => (stats.aptitudeTestsCount || 0) >= 1
  },
  {
    id: 'aptitude_whiz',
    title: 'Aptitude Achiever',
    category: 'Aptitude & Logic',
    desc: 'Complete 5 aptitude and reasoning practice quizzes',
    color: '#111827',
    iconName: 'Target',
    xpReward: 180,
    check: (stats) => (stats.aptitudeTestsCount || 0) >= 5
  },
  {
    id: 'journal_starter',
    title: 'First Diary Entry',
    category: 'Daily Consistency',
    desc: 'Write your first placement diary entry',
    color: '#111827',
    iconName: 'BookOpen',
    xpReward: 50,
    check: (stats) => (stats.journalCount || 0) >= 1
  },
  {
    id: 'journal_zen',
    title: 'Mindful Growth',
    category: 'Daily Consistency',
    desc: 'Write 3 or more placement diary reflections',
    color: '#111827',
    iconName: 'Smile',
    xpReward: 150,
    check: (stats) => (stats.journalCount || 0) >= 3
  },
  {
    id: 'streak_3',
    title: '3-Day Consistency',
    category: 'Daily Consistency',
    desc: 'Practice for 3 consecutive days in a row',
    color: '#111827',
    iconName: 'Flame',
    xpReward: 120,
    check: (stats) => (stats.activeStreak || 0) >= 3
  },
  {
    id: 'streak_7',
    title: '7-Day Champion',
    category: 'Daily Consistency',
    desc: 'Maintain an unbroken 7-day practice streak',
    color: '#111827',
    iconName: 'Flame',
    xpReward: 300,
    check: (stats) => (stats.activeStreak || 0) >= 7
  },
  {
    id: 'streak_14',
    title: '14-Day Focus',
    category: 'Daily Consistency',
    desc: 'Maintain a 14-day unbroken practice streak',
    color: '#111827',
    iconName: 'Flame',
    xpReward: 600,
    check: (stats) => (stats.activeStreak || 0) >= 14
  },
  {
    id: 'daily_challenge_triad',
    title: 'Triple Goal Achiever',
    category: 'Daily Goals',
    desc: 'Complete all 3 daily practice goals in a single day',
    color: '#111827',
    iconName: 'CheckCircle2',
    xpReward: 150,
    check: (stats) => Boolean(stats.completedAllDailyQuestsToday)
  },
  {
    id: 'grandmaster_club',
    title: 'Master Placement Club',
    category: 'Milestones',
    desc: 'Reach 5,000 Total Experience Points (XP)',
    color: '#111827',
    iconName: 'Award',
    xpReward: 1000,
    check: (stats) => (stats.totalXp || 0) >= 5000
  }
];

// Institutional Benchmarks (Clean typography)
export const INSTITUTIONAL_BENCHMARKS = [
  { id: 'b1', name: 'Priya Sundaram', college: 'NIT Trichy', score: '98%', xp: 6420, streak: 28, rankBadge: '1st', tier: 'Placement Master' },
  { id: 'b2', name: 'Arjun Krishnan', college: 'PSG Tech Coimbatore', score: '95%', xp: 5890, streak: 21, rankBadge: '2nd', tier: 'Placement Master' },
  { id: 'b3', name: 'Divya Mohan', college: 'Coimbatore Inst. of Tech', score: '92%', xp: 4760, streak: 16, rankBadge: '3rd', tier: 'Interview Ready' },
  { id: 'b4', name: 'Rahul Varma', college: 'Thiagarajar College of Engg', score: '89%', xp: 3950, streak: 12, rankBadge: '4th', tier: 'Interview Ready' },
  { id: 'b5', name: 'Sneha Rangarajan', college: 'SSN College of Engineering', score: '88%', xp: 3410, streak: 9, rankBadge: '5th', tier: 'Interview Ready' },
  { id: 'b6', name: 'Karthik Raja', college: 'CEG Anna University', score: '86%', xp: 2980, streak: 8, rankBadge: '6th', tier: 'Placement Contender' },
  { id: 'b7', name: 'Ananya Sharma', college: 'Vellore Inst. of Tech', score: '84%', xp: 2650, streak: 6, rankBadge: '7th', tier: 'Placement Contender' },
  { id: 'b8', name: 'Vikram Seth', college: 'Amrita Vishwa Vidyapeetham', score: '82%', xp: 2120, streak: 5, rankBadge: '8th', tier: 'Placement Contender' }
];

// Career Resources Unlockables
export const XP_REWARDS = [
  { id: 'r1', title: 'Top 50 Coding Interview Patterns Guide', xpReq: 500, type: 'Study Guide', iconName: 'FileText', unlocked: false, desc: 'Essential patterns with practical explanations and solution templates.' },
  { id: 'r2', title: 'ATS Resume Keyword Toolkit', xpReq: 1200, type: 'Resume Tool', iconName: 'Target', unlocked: false, desc: 'Action verbs and project descriptions proven to pass company resume screening.' },
  { id: 'r3', title: 'System Design Foundation Primer', xpReq: 2500, type: 'Master Guide', iconName: 'Cpu', unlocked: false, desc: 'A clear guide to cracking high-level and low-level technical design rounds.' },
  { id: 'r4', title: 'Unlimited Mock Interview Pass', xpReq: 4000, type: 'Interview Pass', iconName: 'Mic2', unlocked: false, desc: 'Unlimited AI behavioral and technical interview simulations with detailed reports.' },
  { id: 'r5', title: 'Verified Placement Readiness Certificate', xpReq: 5000, type: 'Certificate', iconName: 'Award', unlocked: false, desc: 'Official placement readiness credential highlighting your completed preparation.' }
];

/**
 * Get local calendar date string (YYYY-MM-DD)
 */
export function getLocalDateString(dateObj = new Date()) {
  const d = new Date(dateObj);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get formatted storage key for user
 */
function getStorageKey(userEmail = 'guest') {
  const cleanEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  return `${STORAGE_KEY_PREFIX}${cleanEmail}`;
}

/**
 * Get deterministic daily problem based on current calendar date
 */
export function getDailyChallenge() {
  const todayStr = getLocalDateString();
  
  // Extract all questions from DSA_CATEGORIES
  const allQuestions = [];
  if (Array.isArray(DSA_CATEGORIES)) {
    DSA_CATEGORIES.forEach(cat => {
      cat.patterns?.forEach(pat => {
        pat.questions?.forEach(q => {
          allQuestions.push({
            id: q.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            title: q.title,
            difficulty: q.difficulty || 'Medium',
            category: cat.name,
            company: 'Top Tech Companies',
            starterCode: q.starterCode
          });
        });
      });
    });
  }

  const problemList = allQuestions.length > 0 ? allQuestions : [
    { id: 'two-sum-ii', title: 'Two Sum II - Input Array Is Sorted', difficulty: 'Easy', category: 'Two Pointer Patterns', company: 'Amazon, Google' },
    { id: '3sum', title: '3Sum', difficulty: 'Medium', category: 'Two Pointer Patterns', company: 'Meta, Microsoft' },
    { id: 'trapping-rain-water', title: 'Trapping Rain Water', difficulty: 'Hard', category: 'Two Pointer Patterns', company: 'Goldman Sachs, Google' }
  ];

  // Hash date string to choose today's problem
  let hash = 0;
  for (let i = 0; i < todayStr.length; i++) {
    hash = (hash << 5) - hash + todayStr.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % problemList.length;
  const problem = problemList[index];

  return {
    ...problem,
    date: todayStr,
    xpReward: problem.difficulty === 'Hard' ? 100 : (problem.difficulty === 'Medium' ? 75 : 50)
  };
}

/**
 * Calculate consecutive daily streak strictly from real activity history
 */
function calculateRealStreak(activityHistory, todayStr) {
  if (!activityHistory || typeof activityHistory !== 'object') {
    return { activeStreak: 0, bestStreak: 0 };
  }

  // Parse today's date in local time
  const [ty, tm, td] = todayStr.split('-').map(Number);
  const today = new Date(ty, tm - 1, td);

  let currentStreak = 0;
  let checkDate = new Date(today);

  // Check if today has activity
  if ((activityHistory[todayStr] || 0) > 0) {
    currentStreak = 1;
    // Step back to yesterday
    checkDate.setDate(checkDate.getDate() - 1);
  } else {
    // Check if yesterday had activity (streak still preserved for today)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = getLocalDateString(yesterday);

    if ((activityHistory[yesterdayStr] || 0) > 0) {
      currentStreak = 1;
      checkDate = new Date(yesterday);
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      return { activeStreak: 0, bestStreak: calculateBestStreak(activityHistory) };
    }
  }

  // Count backwards day by day for unbroken consecutive streak
  for (let step = 0; step < 365; step++) {
    const dStr = getLocalDateString(checkDate);
    if ((activityHistory[dStr] || 0) > 0) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  const bestStreak = Math.max(currentStreak, calculateBestStreak(activityHistory));
  return { activeStreak: currentStreak, bestStreak };
}

function calculateBestStreak(activityHistory) {
  if (!activityHistory) return 0;
  const dates = Object.keys(activityHistory)
    .filter(d => (activityHistory[d] || 0) > 0)
    .sort();
  
  if (dates.length === 0) return 0;
  let maxStreak = 1;
  let currentChain = 1;

  for (let i = 1; i < dates.length; i++) {
    const [y1, m1, d1] = dates[i - 1].split('-').map(Number);
    const [y2, m2, d2] = dates[i].split('-').map(Number);
    const prev = new Date(y1, m1 - 1, d1);
    const next = new Date(y2, m2 - 1, d2);
    const diffDays = Math.round((next - prev) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      currentChain++;
      if (currentChain > maxStreak) maxStreak = currentChain;
    } else if (diffDays > 1) {
      currentChain = 1;
    }
  }
  return maxStreak;
}

/**
 * Load complete Gamification state (Strictly Real Values)
 */
export function getGamificationData(userEmail = 'guest', externalStats = {}) {
  const key = getStorageKey(userEmail);
  const todayStr = getLocalDateString();
  let saved = null;
  try {
    const raw = localStorage.getItem(key);
    if (raw) saved = JSON.parse(raw);
  } catch (e) {
    console.error('Error loading gamification data', e);
  }

  // Count solved coding problems from localStorage strictly
  let solvedCount = externalStats.solvedCount || 0;
  try {
    const cleanEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const dsaSolvedRaw = localStorage.getItem(`neuroprep_dsa_solved_${cleanEmail}`);
    if (dsaSolvedRaw) {
      const solvedObj = JSON.parse(dsaSolvedRaw);
      if (typeof solvedObj === 'object' && solvedObj !== null) {
        if (Array.isArray(solvedObj)) {
          solvedCount = solvedObj.length;
        } else {
          solvedCount = Object.keys(solvedObj).filter(k => solvedObj[k]).length;
        }
      }
    }
  } catch (e) {}

  // Count journal entries from localStorage strictly
  let journalCount = externalStats.journalCount || 0;
  try {
    const cleanEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const journalRaw = localStorage.getItem(`neuroprep_thought_journal_${cleanEmail}`);
    if (journalRaw) {
      const entries = JSON.parse(journalRaw);
      if (Array.isArray(entries)) journalCount = entries.length;
    }
  } catch (e) {}

  const interviewCount = externalStats.interviewCount || externalStats.totalCompleted || 0;
  const lastInterviewScore = externalStats.lastInterviewScore || externalStats.lastScore || 0;
  const aptitudeTestsCount = externalStats.aptitudeTestsCount || 0;

  // Real activity history
  let activityHistory = saved?.activityHistory || {};
  
  // If user has historical activity but no activityHistory recorded yet, register baseline for today
  if (Object.keys(activityHistory).length === 0 && (solvedCount > 0 || interviewCount > 0 || journalCount > 0 || aptitudeTestsCount > 0)) {
    activityHistory[todayStr] = (solvedCount + interviewCount + journalCount + aptitudeTestsCount);
  }

  // Calculate real active and best streak
  const { activeStreak, bestStreak } = calculateRealStreak(activityHistory, todayStr);

  // Total XP derived from real activity + claimed bonus rewards
  const activityXp = (solvedCount * 50) + (interviewCount * 100) + Math.round(lastInterviewScore * 1.5) + (aptitudeTestsCount * 30) + (journalCount * 20);
  const bonusXp = saved?.bonusXp || 0;
  const totalXp = activityXp + bonusXp;

  // Level & Tier
  const level = totalXp > 0 ? Math.floor(totalXp / 250) + 1 : 1;
  const xpInLevel = totalXp % 250;
  const xpProgress = Math.min(100, Math.round((xpInLevel / 250) * 100));
  const currentTier = RANK_TIERS.find(t => totalXp >= t.minXp && totalXp <= t.maxXp) || RANK_TIERS[0];
  const nextTier = RANK_TIERS[RANK_TIERS.indexOf(currentTier) + 1] || null;

  // Multi-Module Cognitive Adaptation Engine
  const stressLevel = Number(externalStats.stress || externalStats.moodState?.stress || 0);
  const codingScore = Number(externalStats.codingScore || externalStats.codingState?.score || 0);
  const interviewScore = Number(externalStats.lastInterviewScore || externalStats.interviewState?.lastScore || 0);

  let cognitiveMode = 'balanced';
  let cognitiveStateName = 'Flow State & Consistent Momentum';
  let cognitiveTagline = 'Optimal pace for mastering patterns & technical communication';
  let cognitiveMantra = 'Consistency beats intensity every time. Showing up daily builds your placement confidence.';

  if (stressLevel >= 6) {
    cognitiveMode = 'restorative';
    cognitiveStateName = 'Restorative & Confidence Building';
    cognitiveTagline = 'Pacing adapted to reduce exam tension and rebuild positive momentum';
    cognitiveMantra = 'Peak performance begins with a calm mind. Tackle one small step without any pressure today.';
  } else if (stressLevel <= 2 && (codingScore > 50 || interviewScore > 70)) {
    cognitiveMode = 'peak';
    cognitiveStateName = 'Peak Placement Readiness';
    cognitiveTagline = 'High confidence unlocked — challenging advanced patterns & rapid mock rounds';
    cognitiveMantra = 'You are in optimal rhythm. Channel this focus to master complex algorithms and interview rounds.';
  }

  // Daily Quests Status for Today (Strict real check)
  const dailyChallenge = getDailyChallenge();
  const todayDsaSolved = (saved?.dailyProgress?.[todayStr]?.dsa || 0) > 0;
  const todayAptitudeDone = (saved?.dailyProgress?.[todayStr]?.aptitude || 0) > 0;
  const todayJournalDone = (saved?.dailyProgress?.[todayStr]?.journal || 0) > 0;
  const todayMockDone = (saved?.dailyProgress?.[todayStr]?.mock || 0) > 0 || (saved?.dailyProgress?.[todayStr]?.interview || 0) > 0;

  const dailyQuests = [
    {
      id: 'dsa_quest',
      title: cognitiveMode === 'restorative' ? 'Confidence Coding Step' : (cognitiveMode === 'peak' ? 'High-Velocity Coding Challenge' : 'Pattern Practice Goal'),
      desc: cognitiveMode === 'restorative'
        ? `Solve 1 easy/medium problem at your own pace (Featured: ${dailyChallenge.title})`
        : `Master today's algorithmic pattern: ${dailyChallenge.title}`,
      cognitiveBenefit: 'Locks in pattern memory and reduces coding round hesitation',
      xp: cognitiveMode === 'peak' ? 75 : 50,
      iconName: 'Code2',
      targetTab: 'coding',
      progress: todayDsaSolved ? 1 : 0,
      target: 1,
      completed: todayDsaSolved,
      claimable: todayDsaSolved && !saved?.claimedQuests?.[`${todayStr}_dsa_quest`],
      claimed: Boolean(saved?.claimedQuests?.[`${todayStr}_dsa_quest`])
    },
    {
      id: 'mock_quest',
      title: cognitiveMode === 'restorative' ? 'Gentle Speech & Mind Drill' : 'Mock Interview or Aptitude Sprint',
      desc: cognitiveMode === 'restorative'
        ? 'Complete 1 gentle mock interview round or 5 aptitude questions to stay in touch'
        : 'Simulate a technical mock interview question or complete 1 timed aptitude test',
      cognitiveBenefit: 'Sharpens verbal precision, vocabulary composure, and problem clarity',
      xp: 40,
      iconName: 'Mic2',
      targetTab: 'mock',
      progress: (todayAptitudeDone || todayMockDone) ? 1 : 0,
      target: 1,
      completed: (todayAptitudeDone || todayMockDone),
      claimable: (todayAptitudeDone || todayMockDone) && !saved?.claimedQuests?.[`${todayStr}_mock_quest`],
      claimed: Boolean(saved?.claimedQuests?.[`${todayStr}_mock_quest`])
    },
    {
      id: 'journal_quest',
      title: 'Mind Reset & Diary Reflection',
      desc: 'Chat with NeuroCoach to log your daily wins, reflect on prep, or clear mental clutter',
      cognitiveBenefit: 'Reduces cortisol, prevents burnout, and reinforces psychological resilience',
      xp: 25,
      iconName: 'BookOpen',
      targetTab: 'journal',
      progress: todayJournalDone ? 1 : 0,
      target: 1,
      completed: todayJournalDone,
      claimable: todayJournalDone && !saved?.claimedQuests?.[`${todayStr}_journal_quest`],
      claimed: Boolean(saved?.claimedQuests?.[`${todayStr}_journal_quest`])
    }
  ];

  const adaptiveCognitiveState = {
    mode: cognitiveMode,
    name: cognitiveStateName,
    tagline: cognitiveTagline,
    mantra: cognitiveMantra,
    stressLevel
  };

  const completedQuestsCount = dailyQuests.filter(q => q.completed || q.claimed).length;
  const isTripleCrownClaimable = completedQuestsCount === 3 && !saved?.claimedQuests?.[`${todayStr}_triple_crown`];
  const isTripleCrownClaimed = Boolean(saved?.claimedQuests?.[`${todayStr}_triple_crown`]);

  // Badge Status
  const statsForBadge = {
    solvedCount,
    interviewCount,
    lastInterviewScore,
    aptitudeTestsCount,
    journalCount,
    activeStreak,
    totalXp,
    completedAllDailyQuestsToday: completedQuestsCount === 3
  };

  const unlockedBadges = ALL_BADGES.filter(b => b.check(statsForBadge));
  const lockedBadges = ALL_BADGES.filter(b => !b.check(statsForBadge));

  // Generate 30-day activity matrix (from today back 30 days)
  const heatmap = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateKey = getLocalDateString(d);
    const count = activityHistory[dateKey] || 0;
    heatmap.push({
      date: dateKey,
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      count,
      level: count >= 3 ? 3 : (count >= 2 ? 2 : (count >= 1 ? 1 : 0))
    });
  }

  // Current Week Status in natural weekday order (Monday to Sunday)
  const currentWeekDays = [];
  const now = new Date();
  const currentDayOfWeek = (now.getDay() + 6) % 7; // 0 = Mon, 1 = Tue, ..., 6 = Sun
  
  const mondayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - currentDayOfWeek);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  for (let i = 0; i < 7; i++) {
    const dayDate = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + i);
    const dateKey = getLocalDateString(dayDate);
    const count = activityHistory[dateKey] || 0;
    const isToday = i === currentDayOfWeek;
    const isPast = i < currentDayOfWeek;
    const isFuture = i > currentDayOfWeek;
    const isDone = count > 0;

    let status = 'future';
    if (isDone) {
      status = 'completed';
    } else if (isToday) {
      status = 'today-pending';
    } else if (isPast) {
      status = 'missed';
    }

    currentWeekDays.push({
      date: dateKey,
      day: dayNames[i],
      isDone,
      isToday,
      isPast,
      isFuture,
      status,
      count
    });
  }

  // Leaderboard with User Injected
  const userEntry = {
    id: 'user_current',
    name: externalStats.name || 'You',
    college: externalStats.college || 'Engineering Student',
    score: `${Math.min(100, Math.round((solvedCount / 30) * 50 + (lastInterviewScore * 0.5)))}%`,
    xp: totalXp,
    streak: activeStreak,
    isUser: true,
    tier: currentTier.name
  };

  const combinedLeaderboard = [...INSTITUTIONAL_BENCHMARKS, userEntry]
    .sort((a, b) => b.xp - a.xp)
    .map((item, index) => ({
      ...item,
      rank: index + 1,
      rankBadge: index === 0 ? '1st' : (index === 1 ? '2nd' : (index === 2 ? '3rd' : `${index + 1}th`))
    }));

  return {
    totalXp,
    level,
    xpInLevel,
    xpProgress,
    currentTier,
    nextTier,
    activeStreak,
    bestStreak,
    dailyChallenge,
    dailyQuests,
    completedQuestsCount,
    isTripleCrownClaimable,
    isTripleCrownClaimed,
    unlockedBadges,
    lockedBadges,
    heatmap,
    currentWeekDays,
    last7Days: currentWeekDays,
    leaderboard: combinedLeaderboard,
    solvedCount,
    interviewCount,
    journalCount,
    aptitudeTestsCount,
    adaptiveCognitiveState
  };
}

/**
 * Record an activity strictly and update streak + XP
 */
export function recordActivity(userEmail = 'guest', activityType = 'dsa', details = {}) {
  const key = getStorageKey(userEmail);
  const todayStr = getLocalDateString();
  let saved = {};
  try {
    const raw = localStorage.getItem(key);
    if (raw) saved = JSON.parse(raw);
  } catch (e) {}

  saved.activityHistory = saved.activityHistory || {};
  saved.activityHistory[todayStr] = (saved.activityHistory[todayStr] || 0) + 1;

  saved.dailyProgress = saved.dailyProgress || {};
  saved.dailyProgress[todayStr] = saved.dailyProgress[todayStr] || { dsa: 0, aptitude: 0, journal: 0, interview: 0 };
  if (saved.dailyProgress[todayStr][activityType] !== undefined) {
    saved.dailyProgress[todayStr][activityType] += 1;
  } else {
    saved.dailyProgress[todayStr][activityType] = 1;
  }

  try {
    localStorage.setItem(key, JSON.stringify(saved));
  } catch (e) {}

  // Dispatch reactive custom event so UI components refresh immediately
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neuroprep-gamification-update', {
      detail: { userEmail, activityType, timestamp: Date.now() }
    }));
  }

  return getGamificationData(userEmail);
}

/**
 * Claim quest reward XP
 */
export function claimQuestReward(userEmail = 'guest', questId, xpAmount) {
  const key = getStorageKey(userEmail);
  const todayStr = getLocalDateString();
  let saved = {};
  try {
    const raw = localStorage.getItem(key);
    if (raw) saved = JSON.parse(raw);
  } catch (e) {}

  saved.claimedQuests = saved.claimedQuests || {};
  const claimKey = `${todayStr}_${questId}`;
  if (saved.claimedQuests[claimKey]) return null;

  saved.claimedQuests[claimKey] = true;
  saved.bonusXp = (saved.bonusXp || 0) + xpAmount;

  try {
    localStorage.setItem(key, JSON.stringify(saved));
  } catch (e) {}

  // Dispatch reactive custom event
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('neuroprep-gamification-update', {
      detail: { userEmail, questId, xpAmount, timestamp: Date.now() }
    }));
  }

  return getGamificationData(userEmail);
}
