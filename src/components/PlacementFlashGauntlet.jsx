import React, { useState, useEffect } from 'react';
import { Trophy } from 'lucide-react';
import { recordActivity } from '../services/gamificationService';

const DAILY_GAUNTLET_SCENARIOS = [
  {
    day: 1,
    level: 'Foundational',
    scenarioTitle: 'Day 1: Array Traversal & Logic',
    step1: {
      tag: 'Interview Question',
      question: 'The interviewer asks you to optimize a solution from O(N^2) time to O(N) time. How should you approach this?',
      options: [
        { id: 'a', text: 'Identify the bottleneck (e.g. repeated inner lookups) and consider using a Hash Map, Two Pointers, or Sorting.', isCorrect: true, feedback: 'Spot on! Recognizing repeated work and trading auxiliary space for linear lookup is the golden standard.' },
        { id: 'b', text: 'Guess random complex algorithms until one sounds fast.', isCorrect: false, feedback: 'Interviewers want methodical complexity reduction, not random guessing.' },
        { id: 'c', text: 'Say that O(N^2) is fast enough for all modern computers.', isCorrect: false, feedback: 'For N = 10^5, O(N^2) results in 10^10 operations causing a Time Limit Exceeded (TLE).' }
      ]
    },
    step2: {
      tag: 'Algorithm Strategy',
      question: 'Which algorithmic pattern is best suited for finding the longest contiguous subarray where the sum equals K?',
      options: [
        { id: 'a', text: 'Prefix Sum combined with a Hash Map storing the earliest index of each prefix sum.', isCorrect: true, feedback: 'Exact pattern! If prefixSum[j] - prefixSum[i] = K, then the subarray between i and j sums to K in O(N) time.' },
        { id: 'b', text: 'Depth-First Search recursion with backtracking.', isCorrect: false, feedback: 'DFS causes exponential branch overhead on 1D arrays.' },
        { id: 'c', text: 'Breadth-First Search queue traversal.', isCorrect: false, feedback: 'BFS is used for shortest-path graph traversals, not 1D subarray sum checks.' }
      ]
    },
    step3: {
      tag: 'Code Bug Spotter',
      question: 'Find the bug in this Two-Sum lookup snippet:',
      codeSnippet: `function twoSum(nums, target) {
  let map = new Map();
  for (let i = 0; i <= nums.length; i++) {
    let diff = target - nums[i];
    if (map.has(diff)) return [map.get(diff), i];
    map.set(nums[i], i);
  }
}`,
      options: [
        { id: 'a', text: 'Off-by-one error: loop condition `i <= nums.length` accesses out-of-bounds `undefined` on the last step.', isCorrect: true, feedback: 'Correct! `i < nums.length` is required to prevent accessing `nums[nums.length]` which is undefined.' },
        { id: 'b', text: 'Map key should be index and value should be element.', isCorrect: false, feedback: 'Storing `element -> index` in the Map is the correct design for O(1) complement lookup.' },
        { id: 'c', text: 'Two-Sum cannot be solved using Map.', isCorrect: false, feedback: 'Hash Map solves Two-Sum in optimal O(N) time and O(N) space.' }
      ]
    }
  }
];

export default function PlacementFlashGauntlet({ userEmail = 'guest', onVictory, setActiveTab }) {
  const [todayDay, setTodayDay] = useState(27);
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCompletedToday, setIsCompletedToday] = useState(false);

  const STORAGE_KEY = `neuroprep_gauntlet_completed_${userEmail}_day_${todayDay}`;

  useEffect(() => {
    try {
      const isDone = localStorage.getItem(STORAGE_KEY);
      if (isDone === 'true') {
        setIsCompletedToday(true);
        setCurrentStep('victory');
      }
    } catch (e) {}
  }, [STORAGE_KEY]);

  const currentDailyScenario = DAILY_GAUNTLET_SCENARIOS[0];

  const getStepData = () => {
    if (currentStep === 1) return currentDailyScenario.step1;
    if (currentStep === 2) return currentDailyScenario.step2;
    if (currentStep === 3) return currentDailyScenario.step3;
    return null;
  };

  const activeStepData = getStepData();

  const handleSelectOption = (opt) => {
    if (isAnswerChecked) return;
    setSelectedOption(opt);
  };

  const handleCheckAnswer = () => {
    if (!selectedOption) return;
    setIsAnswerChecked(true);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      setCurrentStep(2);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else if (currentStep === 2) {
      setCurrentStep(3);
      setSelectedOption(null);
      setIsAnswerChecked(false);
    } else {
      setCurrentStep('victory');
      setIsCompletedToday(true);
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
        recordActivity(userEmail, 'gauntlet', { xp: 120, title: `Daily Placement Challenge - Day ${todayDay}` });
      } catch (e) {}
      if (onVictory) onVictory(120);
    }
  };

  const handleRestart = () => {
    setCurrentStep(1);
    setSelectedOption(null);
    setIsAnswerChecked(false);
  };

  return (
    <div className="saas-card-spec" style={{
      padding: '26px 28px',
      marginBottom: '32px'
    }}>
      
      {/* Unified Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--main-heading)', margin: 0 }}>
            Daily Placement Confidence Challenge
          </h3>
        </div>

        {/* Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {[
            { num: 1, label: 'Interview' },
            { num: 2, label: 'Approach' },
            { num: 3, label: 'Bug Fix' }
          ].map(s => {
            const isDone = (typeof currentStep === 'number' && currentStep > s.num) || currentStep === 'victory';
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{
                  width: '26px',
                  height: '26px',
                  borderRadius: '50%',
                  backgroundColor: isDone ? '#526257' : (isCurrent ? '#EAECE8' : '#FCF9F6'),
                  border: isDone ? '1px solid #415046' : (isCurrent ? '2px solid #526257' : '1px solid #D8D2CE'),
                  color: isDone ? '#F7F3EE' : 'var(--main-heading)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 800
                }}>
                  {isDone ? '✓' : s.num}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: isCurrent ? 800 : 500, color: isCurrent ? 'var(--main-heading)' : 'var(--text-muted)' }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* VICTORY VIEW */}
      {currentStep === 'victory' ? (
        <div style={{
          backgroundColor: '#FCF9F6',
          borderRadius: '14px',
          border: '1px solid #D8D2CE',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#EAECE8',
            color: '#68705F',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <Trophy size={26} />
          </div>

          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--main-heading)', margin: '0 0 6px 0' }}>
            Great Job! Day {todayDay} Challenge Completed
          </h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--body-text)', maxWidth: '500px', margin: '0 auto 18px auto', lineHeight: 1.4 }}>
            You practiced answering an interview question, spotted the optimal approach, and fixed the code bug. +120 XP added to your placement rank! Tomorrow's challenge will adapt to the next level.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={handleRestart}
              className="btn-secondary-spec"
              style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600 }}
            >
              Practice Again
            </button>
            {setActiveTab && (
              <button
                onClick={() => setActiveTab('coding')}
                className="btn-primary-spec"
                style={{ padding: '8px 16px', fontSize: '0.82rem', fontWeight: 600 }}
              >
                Go to 99 DSA Patterns
              </button>
            )}
          </div>
        </div>
      ) : (
        /* QUESTION VIEW */
        <div>
          {/* Question Tag & Title */}
          <div style={{ marginBottom: '16px' }}>
            <span style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.74rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.8px',
              display: 'block',
              marginBottom: '6px'
            }}>
              {activeStepData?.tag}
            </span>
            <p style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--main-heading)',
              margin: 0,
              lineHeight: 1.5
            }}>
              {activeStepData?.question}
            </p>
          </div>

          {/* Optional Code Snippet */}
          {activeStepData?.codeSnippet && (
            <div style={{
              backgroundColor: '#F5EBE6',
              color: 'var(--main-heading)',
              padding: '16px 20px',
              borderRadius: '14px',
              fontFamily: 'var(--font-code)',
              fontSize: '0.88rem',
              fontWeight: 600,
              marginBottom: '18px',
              lineHeight: 1.55,
              whiteSpace: 'pre-wrap',
              border: '1px solid #D8D2CE',
              boxShadow: 'inset 0 1px 2px rgba(52, 52, 58, 0.04)'
            }}>
              {activeStepData.codeSnippet}
            </div>
          )}

          {/* Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '18px' }}>
            {activeStepData?.options.map((opt) => {
              const isSelected = selectedOption?.id === opt.id;
              let borderStyle = isSelected ? '2px solid #526257' : '1px solid #D8D2CE';
              let bgStyle = isSelected ? '#EAECE8' : '#FCF9F6';

              if (isAnswerChecked) {
                if (opt.isCorrect) {
                  borderStyle = '2px solid #68705F';
                  bgStyle = '#EAECE8';
                } else if (isSelected && !opt.isCorrect) {
                  borderStyle = '2px solid #9A6854';
                  bgStyle = '#F5EBE6';
                }
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: '14px',
                    border: borderStyle,
                    backgroundColor: bgStyle,
                    cursor: isAnswerChecked ? 'default' : 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: isSelected ? '0 4px 12px rgba(82, 98, 87, 0.12)' : '0 2px 5px rgba(52, 52, 58, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                    <span style={{
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.94rem',
                      fontWeight: 600,
                      color: 'var(--main-heading)',
                      lineHeight: 1.55
                    }}>
                      {opt.text}
                    </span>
                    {isAnswerChecked && opt.isCorrect && (
                      <span style={{
                        fontFamily: 'var(--font-body)',
                        fontSize: '0.76rem',
                        fontWeight: 800,
                        color: 'var(--secondary-olive)',
                        backgroundColor: '#FCF9F6',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #68705F',
                        whiteSpace: 'nowrap',
                        marginLeft: '8px'
                      }}>
                        ✓ Correct
                      </span>
                    )}
                  </div>

                  {isAnswerChecked && isSelected && (
                    <div style={{
                      marginTop: '8px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.84rem',
                      color: opt.isCorrect ? '#526257' : '#9A6854',
                      lineHeight: 1.45,
                      fontWeight: 600,
                      paddingTop: '6px',
                      borderTop: '1px dashed rgba(82, 98, 87, 0.2)'
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
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Question {currentStep} of 3
            </span>

            <div>
              {!isAnswerChecked ? (
                <button
                  onClick={handleCheckAnswer}
                  disabled={!selectedOption}
                  className="btn-primary-spec"
                  style={{
                    padding: '8px 20px',
                    fontSize: '0.86rem',
                    opacity: selectedOption ? 1 : 0.5,
                    cursor: selectedOption ? 'pointer' : 'not-allowed'
                  }}
                >
                  Check Answer
                </button>
              ) : (
                <button
                  onClick={handleNextStep}
                  className="btn-primary-spec"
                  style={{ padding: '8px 20px', fontSize: '0.86rem', display: 'flex', alignItems: 'center' }}
                >
                  {currentStep === 3 ? 'Finish Challenge' : 'Next Question'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
