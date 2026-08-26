import React, { useState, useEffect } from 'react';
import { 
  Swords, Zap, Shield, Trophy, CheckCircle2, XCircle, ArrowRight, 
  RotateCcw, Sparkles, Flame, Mic2, Code2, Bug, Star, Award, Compass, Clock
} from 'lucide-react';
import { recordActivity } from '../services/gamificationService';

// Curated pool of high-yield daily gauntlet scenarios
const GAUNTLET_SCENARIOS = [
  {
    id: 'day_1',
    theme: 'Speed, Logic & Technical Communication',
    stage1: {
      title: 'Stage 1: The 45-Second Recruiter Pitch',
      badge: 'Verbal Confidence Duel',
      question: 'The Technical Interviewer asks: "You are stuck on an edge-case during a live coding interview with 10 minutes left. How do you handle this?"',
      options: [
        {
          id: 'opt_a',
          text: 'Panic quietly and randomly change lines of code hoping it passes all tests.',
          isCorrect: false,
          feedback: 'This increases anxiety and makes the interviewer think you code by guesswork.'
        },
        {
          id: 'opt_b',
          text: 'Calmly state your thought process out loud: "I notice this fails when the array is empty. Let me dry-run with a minimal test case on line 12."',
          isCorrect: true,
          feedback: 'Top 1% candidate move! Interviewers care much more about structured communication under pressure than instant perfection.'
        },
        {
          id: 'opt_c',
          text: 'Tell the interviewer the question is unfair or has an error in the test suite.',
          isCorrect: false,
          feedback: 'Never blame the problem. Staying composed and proactive is what gets you hired.'
        }
      ]
    },
    stage2: {
      title: 'Stage 2: The 30-Second Pattern Spotter',
      badge: 'Algorithmic Intuition Reflex',
      question: 'Scenario: "Given an array of integers with both positive and negative values, find the total number of continuous subarrays whose sum equals K in O(N) time."',
      options: [
        {
          id: 'opt_a',
          text: 'Sliding Window (Two Pointers)',
          isCorrect: false,
          feedback: 'Sliding Window fails when numbers can be negative because shrinking the window does not monotonically decrease the sum!'
        },
        {
          id: 'opt_b',
          text: 'Prefix Sum + Hash Map (Frequency Map)',
          isCorrect: true,
          feedback: 'Spot on! Storing prefix sums in a Hash Map solves negative subarrays in O(N) time and O(N) space.'
        },
        {
          id: 'opt_c',
          text: 'Binary Search on Answer',
          isCorrect: false,
          feedback: 'The array is not sorted and the problem is not monotonic, so binary search does not apply.'
        }
      ]
    },
    stage3: {
      title: 'Stage 3: The 1-Line Bug Slayer',
      badge: 'Senior Code Boss Fight',
      question: 'The Senior Engineer\'s Binary Search is throwing integer overflow in production on large test cases:',
      codeSnippet: `int search(int[] arr, int target) {\n    int low = 0, high = arr.length - 1;\n    while (low <= high) {\n        int mid = (low + high) / 2; // <--- BUG ON THIS LINE\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`,
      options: [
        {
          id: 'opt_a',
          text: 'Fix: int mid = low + (high - low) / 2;',
          isCorrect: true,
          feedback: 'Code Boss Defeated! This prevents 32-bit integer overflow when (low + high) exceeds 2,147,483,647.'
        },
        {
          id: 'opt_b',
          text: 'Fix: int mid = (high - low) / 2;',
          isCorrect: false,
          feedback: 'This misses adding `low`, so `mid` will always calculate relative to 0 rather than the current search window.'
        },
        {
          id: 'opt_c',
          text: 'Fix: int mid = (low * high) / 2;',
          isCorrect: false,
          feedback: 'Multiplying `low * high` drastically magnifies the integer overflow!'
        }
      ]
    }
  },
  {
    id: 'day_2',
    theme: 'Dynamic Programming & System Thinking',
    stage1: {
      title: 'Stage 1: The 45-Second Recruiter Pitch',
      badge: 'Verbal Confidence Duel',
      question: 'HR Director asks: "Why do you want to join our engineering team specifically over competitors?"',
      options: [
        {
          id: 'opt_a',
          text: 'Connect 1 specific technical feature/product of the company with your own project experience and growth enthusiasm.',
          isCorrect: true,
          feedback: 'Irresistible answer! Shows genuine research, domain excitement, and mature cultural alignment.'
        },
        {
          id: 'opt_b',
          text: 'Say: "I just need a job offer and your company is hiring on our campus."',
          isCorrect: false,
          feedback: 'Too generic. Companies want candidates who demonstrate deliberate interest.'
        },
        {
          id: 'opt_c',
          text: 'Recite the entire Wikipedia page of the company for 3 minutes.',
          isCorrect: false,
          feedback: 'Keep it punchy, authentic, and connected to your own engineering skills.'
        }
      ]
    },
    stage2: {
      title: 'Stage 2: The 30-Second Pattern Spotter',
      badge: 'Algorithmic Intuition Reflex',
      question: 'Scenario: "Given daily stock prices, find the next day with a higher stock price for every day in O(N) total time."',
      options: [
        {
          id: 'opt_a',
          text: 'Monotonic Decreasing Stack',
          isCorrect: true,
          feedback: 'Boom! Monotonic Stack is the gold standard pattern for Next Greater Element problems in linear O(N) time.'
        },
        {
          id: 'opt_b',
          text: 'Nested Loop Brute Force O(N^2)',
          isCorrect: false,
          feedback: 'Brute force gets Time Limit Exceeded (TLE) on campus online assessments.'
        },
        {
          id: 'opt_c',
          text: 'Topological Sort',
          isCorrect: false,
          feedback: 'Topological sort is for Directed Acyclic Graphs (DAGs), not array price sequences.'
        }
      ]
    },
    stage3: {
      title: 'Stage 3: The 1-Line Bug Slayer',
      badge: 'Senior Code Boss Fight',
      question: 'A recursive Fibonacci solver is running in O(2^N) exponential time and freezing the server:',
      codeSnippet: `int fib(int n) {\n    if (n <= 1) return n;\n    return fib(n - 1) + fib(n - 2); // <--- OVERLAPPING SUBPROBLEMS\n}`,
      options: [
        {
          id: 'opt_a',
          text: 'Add Memoization Cache (memo[n]) to store already calculated subproblems in O(N) time.',
          isCorrect: true,
          feedback: 'Boss Crushed! Memoization turns exponential O(2^N) into linear O(N) time instantly.'
        },
        {
          id: 'opt_b',
          text: 'Change recursion to while(n > 0) without any state variables.',
          isCorrect: false,
          feedback: 'Does not properly compute Fibonacci numbers without tracking the previous 2 terms.'
        },
        {
          id: 'opt_c',
          text: 'Increase server RAM and stack memory.',
          isCorrect: false,
          feedback: 'Never solve algorithmic algorithmic complexity bottlenecks with brute force hardware!'
        }
      ]
    }
  }
];

export default function PlacementFlashGauntlet({ userEmail = 'guest', targetCompany = 'TCS', onVictory }) {
  // Deterministic daily scenario based on day of month
  const dayIndex = new Date().getDate() % GAUNTLET_SCENARIOS.length;
  const scenario = GAUNTLET_SCENARIOS[dayIndex];

  const STORAGE_KEY = `neuroprep_gauntlet_completed_${userEmail}_${new Date().toLocaleDateString()}`;

  const [currentStage, setCurrentStage] = useState(1); // 1, 2, 3, or 'victory'
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCompletedToday, setIsCompletedToday] = useState(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return false;
    }
  });
  const [earnedXP, setEarnedXP] = useState(0);

  const activeStageData = currentStage === 1 
    ? scenario.stage1 
    : (currentStage === 2 ? scenario.stage2 : scenario.stage3);

  const handleSelectOption = (opt) => {
    if (isAnswerChecked) return;
    setSelectedOption(opt);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    setIsAnswerChecked(true);
  };

  const handleNextStage = () => {
    if (selectedOption?.isCorrect) {
      setEarnedXP(prev => prev + 40);
    }
    
    if (currentStage === 1) {
      setCurrentStage(2);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else if (currentStage === 2) {
      setCurrentStage(3);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      // Victory!
      setCurrentStage('victory');
      setIsCompletedToday(true);
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
        recordActivity(userEmail, 'gauntlet', { xp: 120, title: 'Placement Flash Gauntlet' });
      } catch (e) {}
      if (onVictory) onVictory(120);
    }
  };

  const handleResetForPractice = () => {
    setCurrentStage(1);
    setSelectedOption(null);
    setIsAnswerChecked(false);
  };

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '20px',
      border: '1.5px solid #111827',
      padding: '26px 30px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      
      {/* Top Banner with High-Voltage Placement Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            backgroundColor: '#111827',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            <Swords size={20} color="#FFFFFF" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                fontSize: '0.72rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                padding: '2px 8px',
                borderRadius: '4px',
                backgroundColor: '#DCFCE7',
                color: '#166534'
              }}>
                Exclusive 5-Minute Simulation
              </span>
              <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>
                Target: <strong>{targetCompany}</strong>
              </span>
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#111827', margin: '2px 0 0 0' }}>
              Daily Placement Flash Gauntlet
            </h3>
          </div>
        </div>

        {/* 3-Stage Progress Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[
            { num: 1, label: 'Pitch' },
            { num: 2, label: 'Pattern' },
            { num: 3, label: 'Bug Boss' }
          ].map(s => {
            const isDone = (typeof currentStage === 'number' && currentStage > s.num) || currentStage === 'victory';
            const isCurrent = currentStage === s.num;
            return (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: isDone ? '#111827' : (isCurrent ? '#F3F4F6' : '#FFFFFF'),
                  border: isDone ? '1px solid #111827' : (isCurrent ? '2px solid #111827' : '1px solid #D1D5DB'),
                  color: isDone ? '#FFFFFF' : '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  {isDone ? '✓' : s.num}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: isCurrent ? 800 : 500, color: isCurrent ? '#111827' : '#6B7280' }}>
                  {s.label}
                </span>
                {s.num < 3 && <span style={{ color: '#D1D5DB', margin: '0 2px' }}>➔</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* VICTORY SCREEN */}
      {currentStage === 'victory' ? (
        <div style={{
          backgroundColor: '#F9FAFB',
          borderRadius: '16px',
          border: '1.5px solid #86EFAC',
          padding: '30px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto',
            border: '2px solid #86EFAC'
          }}>
            <Trophy size={30} />
          </div>

          <span style={{
            fontSize: '0.78rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            padding: '4px 12px',
            borderRadius: '20px',
            backgroundColor: '#DCFCE7',
            color: '#166534'
          }}>
            Gauntlet Conquered! (+120 XP Added)
          </span>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#111827', margin: '12px 0 6px 0' }}>
            Unstoppable Placement Momentum Unlocked!
          </h2>
          <p style={{ fontSize: '0.92rem', color: '#4B5563', maxWidth: '560px', margin: '0 auto 20px auto', lineHeight: 1.5 }}>
            You aced the high-impact HR pitch, spotted the algorithmic pattern with rapid intuition, and crushed the code bug. You are building true interview-ready reflexes!
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <button
              onClick={handleResetForPractice}
              className="btn-secondary-spec"
              style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: 700 }}
            >
              Replay Today's Gauntlet
            </button>
            <div style={{
              padding: '10px 20px',
              borderRadius: '8px',
              backgroundColor: '#111827',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: '0.85rem'
            }}>
              ✓ Daily Placement Shield Active
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE STAGE CARD */
        <div>
          {/* Stage Header */}
          <div style={{ marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 800,
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: '#F3F4F6',
                color: '#111827'
              }}>
                {activeStageData.badge}
              </span>
              <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700 }}>
                {activeStageData.title}
              </span>
            </div>
            
            <p style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.45 }}>
              {activeStageData.question}
            </p>
          </div>

          {/* Code Snippet for Stage 3 */}
          {activeStageData.codeSnippet && (
            <div style={{
              backgroundColor: '#111827',
              color: '#F9FAFB',
              padding: '14px 18px',
              borderRadius: '12px',
              fontFamily: 'monospace',
              fontSize: '0.85rem',
              marginBottom: '16px',
              lineHeight: 1.5,
              whiteSpace: 'pre-wrap'
            }}>
              {activeStageData.codeSnippet}
            </div>
          )}

          {/* Interactive Multiple Choice Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px' }}>
            {activeStageData.options.map((opt) => {
              const isSelected = selectedOption?.id === opt.id;
              let borderStyle = isSelected ? '2px solid #111827' : '1px solid #E5E7EB';
              let bgStyle = isSelected ? '#F9FAFB' : '#FFFFFF';

              if (isAnswerChecked) {
                if (opt.isCorrect) {
                  borderStyle = '2px solid #15803D';
                  bgStyle = '#F0FDF4';
                } else if (isSelected && !opt.isCorrect) {
                  borderStyle = '2px solid #DC2626';
                  bgStyle = '#FEF2F2';
                }
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: borderStyle,
                    backgroundColor: bgStyle,
                    cursor: isAnswerChecked ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.92rem', fontWeight: 600, color: '#111827', lineHeight: 1.4 }}>
                      {opt.text}
                    </span>
                    {isAnswerChecked && opt.isCorrect && (
                      <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#15803D' }}>
                        ✓ Winning Choice
                      </span>
                    )}
                  </div>

                  {isAnswerChecked && isSelected && (
                    <div style={{
                      marginTop: '6px',
                      fontSize: '0.82rem',
                      color: opt.isCorrect ? '#166534' : '#991B1B',
                      lineHeight: 1.4,
                      fontWeight: 500
                    }}>
                      {opt.feedback}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600 }}>
              Stage {currentStage} of 3 • Earn +40 XP
            </span>

            <div>
              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={!selectedOption}
                  className="btn-primary-spec"
                  style={{
                    padding: '10px 24px',
                    fontSize: '0.88rem',
                    opacity: selectedOption ? 1 : 0.5,
                    cursor: selectedOption ? 'pointer' : 'not-allowed'
                  }}
                >
                  Lock In Strategy
                </button>
              ) : (
                <button
                  onClick={handleNextStage}
                  className="btn-primary-spec"
                  style={{ padding: '10px 24px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {currentStage === 3 ? 'Complete Flash Gauntlet' : 'Next Stage'} <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
