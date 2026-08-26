import React, { useState } from 'react';
import { Swords, Trophy, ArrowRight, Flame, Check } from 'lucide-react';
import { recordActivity } from '../services/gamificationService';

// Daily practice scenarios written in simple, clear, friendly English
const DAILY_SCENARIOS = [
  {
    id: 'day_1',
    step1: {
      tag: 'Step 1: Interview Question',
      question: 'What is the best thing to do if you get stuck on a coding problem during an interview?',
      options: [
        {
          id: 'opt_1',
          text: 'Stay silent and keep trying different lines of code secretly.',
          isCorrect: false,
          feedback: 'Staying silent makes the interviewer think you are blocked. Always speak your thoughts.'
        },
        {
          id: 'opt_2',
          text: 'Explain your thought process out loud and test a small example with the interviewer.',
          isCorrect: true,
          feedback: 'Correct! Interviewers love seeing how you think and communicate when solving problems.'
        },
        {
          id: 'opt_3',
          text: 'Give up and ask the interviewer to give you a different question.',
          isCorrect: false,
          feedback: 'Never give up early. Breaking the problem into smaller pieces shows good perseverance.'
        }
      ]
    },
    step2: {
      tag: 'Step 2: Spot the Right Approach',
      question: 'You need to find a target number in a sorted array of 1,000,000 numbers in less than 1 millisecond. Which approach is best?',
      options: [
        {
          id: 'opt_1',
          text: 'Check every number from start to end one by one (Linear Search)',
          isCorrect: false,
          feedback: 'Linear search takes up to 1,000,000 steps. That is too slow for large sorted data.'
        },
        {
          id: 'opt_2',
          text: 'Divide the search range in half each step (Binary Search)',
          isCorrect: true,
          feedback: 'Correct! Binary Search only takes around 20 comparisons for 1,000,000 items (O(log N)).'
        },
        {
          id: 'opt_3',
          text: 'Generate all combinations and permutations of the array.',
          isCorrect: false,
          feedback: 'Permutations are extremely slow and unnecessary for searching.'
        }
      ]
    },
    step3: {
      tag: 'Step 3: Spot the Bug',
      question: 'Look at this Binary Search code. Which line fixes the integer overflow issue?',
      codeSnippet: `int binarySearch(int[] arr, int target) {\n    int low = 0, high = arr.length - 1;\n    while (low <= high) {\n        int mid = (low + high) / 2; // <-- Where the bug can happen\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`,
      options: [
        {
          id: 'opt_1',
          text: 'Change line to: int mid = low + (high - low) / 2;',
          isCorrect: true,
          feedback: 'Correct! This avoids adding large numbers together and prevents integer overflow.'
        },
        {
          id: 'opt_2',
          text: 'Change line to: int mid = (high - low) / 2;',
          isCorrect: false,
          feedback: 'This calculates mid from 0 instead of the current search window.'
        },
        {
          id: 'opt_3',
          text: 'Change line to: int mid = low * high / 2;',
          isCorrect: false,
          feedback: 'Multiplying low and high causes an even larger overflow.'
        }
      ]
    }
  },
  {
    id: 'day_2',
    step1: {
      tag: 'Step 1: Interview Question',
      question: 'When an interviewer asks: "Tell me about a technical project you built", how should you start your answer?',
      options: [
        {
          id: 'opt_1',
          text: 'Give a quick 1-sentence summary of the problem it solves, the technologies used, and your specific role.',
          isCorrect: true,
          feedback: 'Great! Clear and structured answers immediately give the interviewer the full picture.'
        },
        {
          id: 'opt_2',
          text: 'Read every single line of code you wrote from memory.',
          isCorrect: false,
          feedback: 'Keep it high level first, then dive into code details when asked.'
        },
        {
          id: 'opt_3',
          text: 'Say you copied the whole project from a tutorial without understanding it.',
          isCorrect: false,
          feedback: 'Always highlight your own understanding, decisions, and what you learned.'
        }
      ]
    },
    step2: {
      tag: 'Step 2: Spot the Right Approach',
      question: 'You need to check if a word has duplicate letters in fast O(N) time. What is the simplest helper tool?',
      options: [
        {
          id: 'opt_1',
          text: 'A Hash Set (or boolean visited array) to remember seen characters.',
          isCorrect: true,
          feedback: 'Correct! Hash Sets allow instant O(1) lookups to spot duplicates in one pass.'
        },
        {
          id: 'opt_2',
          text: 'Compare every letter with every other letter using two nested loops.',
          isCorrect: false,
          feedback: 'Nested loops take O(N^2) time, which is slower for long strings.'
        },
        {
          id: 'opt_3',
          text: 'Convert the string into a binary tree and invert it.',
          isCorrect: false,
          feedback: 'A Hash Set is much simpler and faster.'
        }
      ]
    },
    step3: {
      tag: 'Step 3: Spot the Bug',
      question: 'This loop is supposed to print all elements in an array, but throws an ArrayIndexOutOfBounds error. How do you fix it?',
      codeSnippet: `int[] numbers = {10, 20, 30, 40};\nfor (int i = 0; i <= numbers.length; i++) {\n    System.out.println(numbers[i]);\n}`,
      options: [
        {
          id: 'opt_1',
          text: 'Change "i <= numbers.length" to "i < numbers.length"',
          isCorrect: true,
          feedback: 'Correct! Array indices start at 0 and end at length - 1, so "<" prevents out-of-bounds errors.'
        },
        {
          id: 'opt_2',
          text: 'Change "int i = 0" to "int i = -1"',
          isCorrect: false,
          feedback: 'Negative index will cause an immediate crash.'
        },
        {
          id: 'opt_3',
          text: 'Remove the print statement completely.',
          isCorrect: false,
          feedback: 'The fix is simply adjusting the loop boundary condition.'
        }
      ]
    }
  }
];

export default function PlacementFlashGauntlet({ userEmail = 'guest', onVictory, setActiveTab }) {
  // Deterministic daily scenario
  const dayIndex = new Date().getDate() % DAILY_SCENARIOS.length;
  const scenario = DAILY_SCENARIOS[dayIndex];

  const STORAGE_KEY = `neuroprep_daily_challenge_done_${userEmail}_${new Date().toLocaleDateString()}`;

  const [currentStep, setCurrentStep] = useState(1); // 1, 2, 3, or 'victory'
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerChecked, setIsAnswerChecked] = useState(false);
  const [isCompletedToday, setIsCompletedToday] = useState(() => {
    try {
      return Boolean(localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return false;
    }
  });

  const activeStepData = currentStep === 1 
    ? scenario.step1 
    : (currentStep === 2 ? scenario.step2 : scenario.step3);

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
      // Victory
      setCurrentStep('victory');
      setIsCompletedToday(true);
      try {
        localStorage.setItem(STORAGE_KEY, 'true');
        recordActivity(userEmail, 'gauntlet', { xp: 120, title: 'Daily Placement Challenge' });
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
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '18px',
      border: '1px solid #E5E7EB',
      padding: '26px 28px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
      marginBottom: '32px'
    }}>
      
      {/* Unified Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: '#F3F4F6',
              color: '#111827'
            }}>
              Daily 5-Minute Practice
            </span>
            <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>
              Earn +120 XP
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            Daily Placement Confidence Challenge
          </h3>
        </div>

        {/* Simple Step 1-2-3 Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[
            { num: 1, label: 'Interview' },
            { num: 2, label: 'Approach' },
            { num: 3, label: 'Bug Fix' }
          ].map(s => {
            const isDone = (typeof currentStep === 'number' && currentStep > s.num) || currentStep === 'victory';
            const isCurrent = currentStep === s.num;
            return (
              <div key={s.num} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  backgroundColor: isDone ? '#111827' : (isCurrent ? '#F3F4F6' : '#FFFFFF'),
                  border: isDone ? '1px solid #111827' : (isCurrent ? '2px solid #111827' : '1px solid #D1D5DB'),
                  color: isDone ? '#FFFFFF' : '#111827',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.72rem',
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

      {/* VICTORY VIEW */}
      {currentStep === 'victory' ? (
        <div style={{
          backgroundColor: '#F9FAFB',
          borderRadius: '14px',
          border: '1px solid #86EFAC',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            backgroundColor: '#DCFCE7',
            color: '#15803D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <Trophy size={26} />
          </div>

          <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
            Great Job! Today's Challenge Completed
          </h4>
          <p style={{ fontSize: '0.88rem', color: '#4B5563', maxWidth: '500px', margin: '0 auto 18px auto', lineHeight: 1.4 }}>
            You practiced answering an interview question, spotted the optimal approach, and fixed the code bug. +120 XP added to your rank!
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
                Go to 99 DSA Patterns ➔
              </button>
            )}
          </div>
        </div>
      ) : (
        /* QUESTION VIEW */
        <div>
          {/* Question Tag & Title */}
          <div style={{ marginBottom: '14px' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.4px',
              display: 'block',
              marginBottom: '4px'
            }}>
              {activeStepData.tag}
            </span>
            <p style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', margin: 0, lineHeight: 1.45 }}>
              {activeStepData.question}
            </p>
          </div>

          {/* Optional Code Snippet for Step 3 */}
          {activeStepData.codeSnippet && (
            <div style={{
              backgroundColor: '#111827',
              color: '#F9FAFB',
              padding: '12px 16px',
              borderRadius: '10px',
              fontFamily: 'monospace',
              fontSize: '0.82rem',
              marginBottom: '14px',
              lineHeight: 1.45,
              whiteSpace: 'pre-wrap'
            }}>
              {activeStepData.codeSnippet}
            </div>
          )}

          {/* Options List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {activeStepData.options.map((opt) => {
              const isSelected = selectedOption?.id === opt.id;
              let borderStyle = isSelected ? '1.5px solid #111827' : '1px solid #E5E7EB';
              let bgStyle = isSelected ? '#F9FAFB' : '#FFFFFF';

              if (isAnswerChecked) {
                if (opt.isCorrect) {
                  borderStyle = '1.5px solid #15803D';
                  bgStyle = '#F0FDF4';
                } else if (isSelected && !opt.isCorrect) {
                  borderStyle = '1.5px solid #DC2626';
                  bgStyle = '#FEF2F2';
                }
              }

              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: borderStyle,
                    backgroundColor: bgStyle,
                    cursor: isAnswerChecked ? 'default' : 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827', lineHeight: 1.35 }}>
                      {opt.text}
                    </span>
                    {isAnswerChecked && opt.isCorrect && (
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803D', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                        ✓ Correct
                      </span>
                    )}
                  </div>

                  {isAnswerChecked && isSelected && (
                    <div style={{
                      marginTop: '6px',
                      fontSize: '0.8rem',
                      color: opt.isCorrect ? '#166534' : '#991B1B',
                      lineHeight: 1.35,
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
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>
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
                    fontSize: '0.84rem',
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
                  style={{ padding: '8px 20px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {currentStep === 3 ? 'Finish Challenge' : 'Next Question'} <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
