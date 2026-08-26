/**
 * DSAScoringEngine — Client-side session state tracker for DSA interview.
 *
 * Tracks per-problem scores, attempts, follow-up results, and computes
 * running skill dimensions for the final DSA report radar chart.
 */

const SKILL_DIMENSIONS = [
  'Problem Understanding',
  'Coding Accuracy',
  'Data Structures',
  'Algorithms',
  'Optimization',
  'Time Complexity',
  'Space Complexity',
  'Edge Cases',
  'Code Quality',
  'Debugging',
];

export class DSAScoringEngine {
  constructor() {
    this.attempts = [];        // Per-problem attempt records
    this.currentProblem = null;
    this.sessionStarted = Date.now();
  }

  /** Record a submission result */
  recordSubmission({ problemId, problemTitle, difficulty, score, breakdown, outcome, isOptimized = false }) {
    const existing = this.attempts.find(a => a.problemId === problemId);
    if (existing) {
      existing.attempts++;
      existing.scores.push(score);
      existing.latestScore = score;
      existing.latestOutcome = outcome;
      existing.isOptimized = isOptimized || outcome === 'optimal';
    } else {
      this.attempts.push({
        problemId,
        problemTitle,
        difficulty,
        attempts: 1,
        scores: [score],
        latestScore: score,
        latestOutcome: outcome,
        breakdown,
        isOptimized: outcome === 'optimal',
        timestamp: Date.now(),
      });
    }
  }

  /** Compute skill dimension scores from all recorded attempts */
  computeSkillScores() {
    if (this.attempts.length === 0) return this._defaultSkills();

    const avg = (arr) => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

    const scores = this.attempts.map(a => a.latestScore);
    const breakdowns = this.attempts.map(a => a.breakdown).filter(Boolean);

    const correctnessScores = breakdowns.map(b => (b.correctness / b.max_correctness) * 100);
    const tcScores          = breakdowns.map(b => (b.time_complexity / b.max_time) * 100);
    const scScores          = breakdowns.map(b => (b.space_complexity / b.max_space) * 100);
    const qualityScores     = breakdowns.map(b => (b.code_quality / b.max_quality) * 100);
    const edgeScores        = breakdowns.map(b => (b.edge_cases / b.max_edge) * 100);

    const optimizedCount    = this.attempts.filter(a => a.isOptimized).length;
    const optimizationRate  = this.attempts.length > 0 ? optimizedCount / this.attempts.length : 0;
    const multiAttemptRate  = this.attempts.filter(a => a.attempts > 1).length / this.attempts.length;

    return {
      'Problem Understanding':  Math.round(avg(correctnessScores)),
      'Coding Accuracy':        Math.round(avg(correctnessScores)),
      'Data Structures':        Math.round(avg(scores) > 0 ? Math.min(100, avg(scores) * 0.85 + avg(tcScores) * 0.15) : 0),
      'Algorithms':             Math.round(avg(scores) > 0 ? Math.min(100, avg(tcScores) * 0.6 + avg(scores) * 0.4) : 0),
      'Optimization':           Math.round(optimizationRate * 100),
      'Time Complexity':        Math.round(avg(tcScores)),
      'Space Complexity':       Math.round(avg(scScores)),
      'Edge Cases':             Math.round(avg(edgeScores)),
      'Code Quality':           Math.round(avg(qualityScores)),
      'Debugging':              Math.round(avg(scores) > 0 ? Math.min(100, (1 - multiAttemptRate * 0.4) * avg(scores)) : 0),
    };
  }

  _defaultSkills() {
    return Object.fromEntries(SKILL_DIMENSIONS.map(d => [d, 0]));
  }

  /** Overall weighted session score */
  getOverallScore() {
    const skills = this.computeSkillScores();
    const values = Object.values(skills);
    if (!values.length) return 0;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  }

  /** Generate strengths and weaknesses */
  getInsights() {
    const skills = this.computeSkillScores();
    const sorted = Object.entries(skills).sort((a, b) => b[1] - a[1]);

    const strengths  = sorted.filter(([, v]) => v >= 75).map(([k]) => k);
    const weaknesses = sorted.filter(([, v]) => v <  55).map(([k]) => k);

    const recommendations = _getRecommendations(weaknesses);

    return { strengths, weaknesses, recommendations };
  }

  /** Generate recommended practice topics */
  getRecommendedPractice() {
    const { weaknesses } = this.getInsights();
    return _getRecommendations(weaknesses);
  }

  /** Full session report object */
  generateReport() {
    const skillScores  = this.computeSkillScores();
    const overall      = this.getOverallScore();
    const { strengths, weaknesses, recommendations } = this.getInsights();

    return {
      overall,
      skillScores,
      strengths,
      weaknesses,
      recommendations,
      problemsSolved: this.attempts.length,
      problems: this.attempts.map(a => ({
        title:       a.problemTitle,
        difficulty:  a.difficulty,
        score:       a.latestScore,
        outcome:     a.latestOutcome,
        attempts:    a.attempts,
        isOptimized: a.isOptimized,
      })),
      sessionDuration: Math.round((Date.now() - this.sessionStarted) / 60_000),
    };
  }
}

function _getRecommendations(weaknesses) {
  const map = {
    'Optimization':        'Practice hash-based optimizations (Two Sum, Group Anagrams)',
    'Time Complexity':     'Study complexity analysis: Big-O for loops, recursion, divide-and-conquer',
    'Data Structures':     'Revise: HashMaps, Trees, Stacks, Heaps, Graphs',
    'Algorithms':          'Focus: Sorting, BFS/DFS, Dynamic Programming, Binary Search',
    'Edge Cases':          'Always test: empty input, single element, negatives, duplicates, boundaries',
    'Space Complexity':    'Practice in-place algorithms and space-efficient DP patterns',
    'Debugging':           'Use systematic debugging: trace inputs, check boundary conditions',
    'Code Quality':        'Practice clean code: meaningful names, helper functions, no magic numbers',
  };

  const defaults = [
    'Two Pointers & Sliding Window',
    'Hashing patterns (HashMap, HashSet)',
    'Binary Search variations',
    'Tree & Graph traversals (BFS/DFS)',
    'Dynamic Programming (memoization → tabulation)',
  ];

  if (!weaknesses.length) return defaults;
  return weaknesses.map(w => map[w]).filter(Boolean).slice(0, 5);
}

export default DSAScoringEngine;
