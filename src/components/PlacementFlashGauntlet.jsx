import React, { useState } from 'react';
import { Swords, Trophy, ArrowRight, Flame, Check, Sparkles, TrendingUp } from 'lucide-react';
import { recordActivity } from '../services/gamificationService';

// 31-Day Progressive Placement Challenge Curriculum
// Progressive difficulty: Days 1-10 (Foundation) -> Days 11-20 (Intermediate) -> Days 21-31 (Advanced Mastery)
const PROGRESSIVE_31_DAYS_CHALLENGES = [
  // Day 1
  {
    day: 1,
    level: 'Foundation',
    step1: {
      tag: 'Interview Question',
      question: 'What is the best thing to do if you get stuck on a coding problem during an interview?',
      options: [
        { id: '1', text: 'Stay silent and keep trying different lines of code secretly.', isCorrect: false, feedback: 'Staying silent makes the interviewer think you are blocked. Always speak your thoughts out loud.' },
        { id: '2', text: 'Explain your thought process out loud and test a small example with the interviewer.', isCorrect: true, feedback: 'Correct! Interviewers love seeing how you think and communicate under pressure.' },
        { id: '3', text: 'Give up and ask the interviewer to give you a different question.', isCorrect: false, feedback: 'Never give up early. Breaking the problem into smaller pieces shows good perseverance.' }
      ]
    },
    step2: {
      tag: 'Spot the Right Approach',
      question: 'You need to find a target number in a sorted array of 1,000,000 numbers in less than 1 millisecond. Which approach is best?',
      options: [
        { id: '1', text: 'Check every number from start to end one by one (Linear Search)', isCorrect: false, feedback: 'Linear search takes up to 1,000,000 steps. That is too slow for large sorted data.' },
        { id: '2', text: 'Divide the search range in half each step (Binary Search)', isCorrect: true, feedback: 'Correct! Binary Search only takes around 20 comparisons for 1,000,000 items (O(log N)).' },
        { id: '3', text: 'Generate all combinations and permutations of the array.', isCorrect: false, feedback: 'Permutations are extremely slow and unnecessary for searching.' }
      ]
    },
    step3: {
      tag: 'Spot the Bug',
      question: 'Look at this Binary Search code. Which line fixes the integer overflow issue?',
      codeSnippet: `int binarySearch(int[] arr, int target) {\n    int low = 0, high = arr.length - 1;\n    while (low <= high) {\n        int mid = (low + high) / 2; // <-- Where the bug can happen\n        if (arr[mid] == target) return mid;\n        else if (arr[mid] < target) low = mid + 1;\n        else high = mid - 1;\n    }\n    return -1;\n}`,
      options: [
        { id: '1', text: 'Change line to: int mid = low + (high - low) / 2;', isCorrect: true, feedback: 'Correct! This avoids adding large numbers together and prevents integer overflow.' },
        { id: '2', text: 'Change line to: int mid = (high - low) / 2;', isCorrect: false, feedback: 'This calculates mid from 0 instead of the current search window.' },
        { id: '3', text: 'Change line to: int mid = low * high / 2;', isCorrect: false, feedback: 'Multiplying low and high causes an even larger overflow.' }
      ]
    }
  },

  // Day 2
  {
    day: 2,
    level: 'Foundation',
    step1: {
      tag: 'Interview Question',
      question: 'When an interviewer asks: "Tell me about a technical project you built", how should you start your answer?',
      options: [
        { id: '1', text: 'Give a quick 1-sentence summary of the problem it solves, the technologies used, and your specific role.', isCorrect: true, feedback: 'Great! Clear and structured answers immediately give the interviewer the full picture.' },
        { id: '2', text: 'Read every single line of code you wrote from memory.', isCorrect: false, feedback: 'Keep it high level first, then dive into code details when asked.' },
        { id: '3', text: 'Say you copied the whole project from a tutorial without understanding it.', isCorrect: false, feedback: 'Always highlight your own understanding, decisions, and what you learned.' }
      ]
    },
    step2: {
      tag: 'Spot the Right Approach',
      question: 'You need to check if a word has duplicate letters in fast O(N) time. What is the simplest helper tool?',
      options: [
        { id: '1', text: 'A Hash Set (or boolean visited array) to remember seen characters.', isCorrect: true, feedback: 'Correct! Hash Sets allow instant O(1) lookups to spot duplicates in one pass.' },
        { id: '2', text: 'Compare every letter with every other letter using two nested loops.', isCorrect: false, feedback: 'Nested loops take O(N^2) time, which is slower for long strings.' },
        { id: '3', text: 'Convert the string into a binary tree and invert it.', isCorrect: false, feedback: 'A Hash Set is much simpler and faster.' }
      ]
    },
    step3: {
      tag: 'Spot the Bug',
      question: 'This loop is supposed to print all elements in an array, but throws an ArrayIndexOutOfBounds error. How do you fix it?',
      codeSnippet: `int[] numbers = {10, 20, 30, 40};\nfor (int i = 0; i <= numbers.length; i++) {\n    System.out.println(numbers[i]);\n}`,
      options: [
        { id: '1', text: 'Change "i <= numbers.length" to "i < numbers.length"', isCorrect: true, feedback: 'Correct! Array indices start at 0 and end at length - 1, so "<" prevents out-of-bounds errors.' },
        { id: '2', text: 'Change "int i = 0" to "int i = -1"', isCorrect: false, feedback: 'Negative index will cause an immediate crash.' },
        { id: '3', text: 'Remove the print statement completely.', isCorrect: false, feedback: 'The fix is simply adjusting the loop boundary condition.' }
      ]
    }
  },

  // Day 3
  {
    day: 3,
    level: 'Foundation',
    step1: {
      tag: 'Interview Question',
      question: 'An interviewer asks: "Why are you interested in our software engineering role?" What is the most convincing answer?',
      options: [
        { id: '1', text: 'Mention how your skills align with their specific tech stack and share your excitement to build impactful systems.', isCorrect: true, feedback: 'Spot on! Showing genuine interest in their domain and connecting it to your skills builds high trust.' },
        { id: '2', text: 'Say you applied to 50 companies and this is just another job for you.', isCorrect: false, feedback: 'Lack of enthusiasm is one of the top reasons candidates get rejected.' },
        { id: '3', text: 'Tell them you only care about the salary and benefits package.', isCorrect: false, feedback: 'Focus on growth, contribution, and learning first.' }
      ]
    },
    step2: {
      tag: 'Spot the Right Approach',
      question: 'You need to validate if brackets like "{ [ ( ) ] }" are closed in the correct order. What data structure is standard?',
      options: [
        { id: '1', text: 'A Stack (LIFO - Last In First Out)', isCorrect: true, feedback: 'Correct! A Stack ensures the most recently opened bracket is closed first.' },
        { id: '2', text: 'A Queue (FIFO - First In First Out)', isCorrect: false, feedback: 'A Queue processes in the wrong order for nested brackets.' },
        { id: '3', text: 'A Linked List reversed randomly.', isCorrect: false, feedback: 'A Stack is the standard algorithmic pattern for parentheses matching.' }
      ]
    },
    step3: {
      tag: 'Spot the Bug',
      question: 'This function fails to check if the stack is empty before popping, causing a runtime crash. Where should the check be?',
      codeSnippet: `Stack<Character> stack = new Stack<>();\nfor (char c : expression.toCharArray()) {\n    if (c == ')') {\n        char top = stack.pop(); // <-- Can crash if empty!\n    }\n}`,
      options: [
        { id: '1', text: 'Add: if (stack.isEmpty()) return false; before popping.', isCorrect: true, feedback: 'Correct! Checking if the stack is empty prevents EmptyStackException.' },
        { id: '2', text: 'Replace stack with an integer variable.', isCorrect: false, feedback: 'Stack is required for matching bracket pairs.' },
        { id: '3', text: 'Ignore the crash and catch generic exception.', isCorrect: false, feedback: 'Always handle empty state properly before popping.' }
      ]
    }
  },

  // Day 4
  {
    day: 4,
    level: 'Foundation',
    step1: {
      tag: 'Interview Question',
      question: 'How do you answer when an interviewer asks: "What is your biggest technical weakness?"',
      options: [
        { id: '1', text: 'Share a real area you used to struggle with, and explain the concrete steps you took to improve it.', isCorrect: true, feedback: 'Perfect! Self-awareness combined with proactive improvement shows maturity.' },
        { id: '2', text: 'Say: "I have no weaknesses, I am completely flawless at coding."', isCorrect: false, feedback: 'Sounds unrealistic and uncoachable.' },
        { id: '3', text: 'Give a fake humble-brag like: "I work too hard and care too much."', isCorrect: false, feedback: 'Interviewers easily see through clichéd answers.' }
      ]
    },
    step2: {
      tag: 'Spot the Right Approach',
      question: 'You need to detect if a Linked List contains a loop without modifying it or using extra memory (O(1) space). What algorithm solves this?',
      options: [
        { id: '1', text: 'Floyd\'s Fast and Slow Pointers (Tortoise & Hare)', isCorrect: true, feedback: 'Correct! Moving one pointer by 1 step and another by 2 steps detects cycles in O(N) time and O(1) space.' },
        { id: '2', text: 'Bubble Sort on node addresses', isCorrect: false, feedback: 'Sorting memory addresses will not detect cycles.' },
        { id: '3', text: 'Delete all nodes one by one.', isCorrect: false, feedback: 'Destructive operations are not allowed.' }
      ]
    },
    step3: {
      tag: 'Spot the Bug',
      question: 'The slow and fast pointer loop below misses checking fast.next, causing a NullPointerException. How do you fix it?',
      codeSnippet: `ListNode slow = head, fast = head;\nwhile (fast != null) { // <-- Incomplete boundary!\n    slow = slow.next;\n    fast = fast.next.next;\n}`,
      options: [
        { id: '1', text: 'Change condition to: while (fast != null && fast.next != null)', isCorrect: true, feedback: 'Correct! Both fast and fast.next must be checked before accessing fast.next.next.' },
        { id: '2', text: 'Change condition to: while (slow != null)', isCorrect: false, feedback: 'fast can still hit null and crash.' },
        { id: '3', text: 'Set fast = slow always.', isCorrect: false, feedback: 'fast must move at 2x speed.' }
      ]
    }
  },

  // Day 5
  {
    day: 5,
    level: 'Intermediate',
    step1: {
      tag: 'Interview Question',
      question: 'In a technical interview, you finish coding your solution with 15 minutes left. What is the best next step?',
      options: [
        { id: '1', text: 'Proactively trace your code with a sample test case and boundary cases (empty array, single element, negative numbers).', isCorrect: true, feedback: 'Top candidate move! Dry running your code shows thorough engineering discipline.' },
        { id: '2', text: 'Immediately close your laptop and wait in silence.', isCorrect: false, feedback: 'Always verify edge cases before declaring completion.' },
        { id: '3', text: 'Delete all your code and try writing it in another language.', isCorrect: false, feedback: 'Unnecessary and risks introducing new bugs.' }
      ]
    },
    step2: {
      tag: 'Spot the Right Approach',
      question: 'You are given an array of size N and need to answer 10,000 range sum queries (sum between index L and R) in O(1) time per query. What is the winning technique?',
      options: [
        { id: '1', text: 'Precompute a Prefix Sum Array in O(N) time.', isCorrect: true, feedback: 'Correct! Range sum is simply prefix[R] - prefix[L - 1], which takes instant O(1) time.' },
        { id: '2', text: 'Run a for-loop from L to R for every query.', isCorrect: false, feedback: 'Running a loop for 10,000 queries takes O(Q * N) time and gets TLE.' },
        { id: '3', text: 'Sort the array before each query.', isCorrect: false, feedback: 'Sorting destroys the original index order.' }
      ]
    },
    step3: {
      tag: 'Spot the Bug',
      question: 'This prefix sum array calculation has an index bug for the first element when L = 0. How do you handle L = 0 cleanly?',
      codeSnippet: `int querySum(int[] prefix, int L, int R) {\n    return prefix[R] - prefix[L - 1]; // <-- Crashes when L is 0!\n}`,
      options: [
        { id: '1', text: 'Change to: return L == 0 ? prefix[R] : prefix[R] - prefix[L - 1];', isCorrect: true, feedback: 'Correct! When L is 0, the sum is simply prefix[R].' },
        { id: '2', text: 'Return prefix[R] + prefix[L];', isCorrect: false, feedback: 'Incorrect math.' },
        { id: '3', text: 'Throw an error whenever L is 0.', isCorrect: false, feedback: 'L = 0 is a valid query that must be supported.' }
      ]
    }
  },

  // Day 6
  {
    day: 6,
    level: 'Intermediate',
    step1: {
      tag: 'Interview Question',
      question: 'The interviewer asks you to optimize a solution from O(N^2) time to O(N) time. How should you approach this?',
      options: [
        { id: '1', text: 'Identify the bottleneck (e.g. repeated inner lookups) and consider using a Hash Map, Two Pointers, or Sorting.', isCorrect: true, feedback: 'Excellent! Pinpointing the exact inner bottleneck leads directly to the right optimization.' },
        { id: '2', text: 'Guess random complex algorithms until one sounds fast.', isCorrect: false, feedback: 'Structured problem breakdown is always better than guessing.' },
        { id: '3', text: 'Say that O(N^2) is fast enough for all modern computers.', isCorrect: false, feedback: 'Placement coding rounds test algorithmic scaling.' }
      ]
    },
    step2: {
      tag: 'Spot the Right Approach',
      question: 'You need to find the maximum sum of any contiguous subarray of size K in an array of size N. What is the most optimal approach?',
      options: [
        { id: '1', text: 'Fixed-Size Sliding Window in O(N) time.', isCorrect: true, feedback: 'Correct! Slide a window of size K across the array by adding the new element and subtracting the leaving element.' },
        { id: '2', text: 'Recalculate the sum of K elements from scratch at every position in O(N * K) time.', isCorrect: false, feedback: 'Recalculating from scratch does repeated work.' },
        { id: '3', text: 'Recursion with backtracking.', isCorrect: false, feedback: 'Sliding window is linear O(N) and optimal.' }
      ]
    },
    step3: {
      tag: 'Spot the Bug',
      question: 'In this sliding window loop, the window sum is not updated correctly when sliding. Which line fixes it?',
      codeSnippet: `int windowSum = 0;\nfor (int i = 0; i < k; i++) windowSum += arr[i];\nint maxSum = windowSum;\nfor (int i = k; i < arr.length; i++) {\n    windowSum += arr[i]; // <-- Bug: Missed subtracting the element that left the window!\n    maxSum = Math.max(maxSum, windowSum);\n}`,
      options: [
        { id: '1', text: 'Add: windowSum += arr[i] - arr[i - k];', isCorrect: true, feedback: 'Correct! Adding the incoming element and subtracting the outgoing element maintains the window sum in O(1).' },
        { id: '2', text: 'Change loop to: for (int i = 0; i < arr.length; i++)', isCorrect: false, feedback: 'Overlaps initial window calculation.' },
        { id: '3', text: 'Set windowSum = 0 inside the loop.', isCorrect: false, feedback: 'Destroys the sliding window state.' }
      ]
    }
  },

  // Day 7
  {
    day: 7,
    level: 'Intermediate',
    step1: {
      tag: 'Interview Question',
      question: 'How do you handle an interview question when you have never seen or heard of that specific concept before?',
      options: [
        { id: '1', text: 'Be honest, ask clarifying questions to understand requirements, and build a simple baseline solution first.', isCorrect: true, feedback: 'Spot on! Interviewers respect intellectual honesty and the ability to navigate ambiguity.' },
        { id: '2', text: 'Pretend you are an expert and make up fake technical terms.', isCorrect: false, feedback: 'Interviewers immediately recognize fake terminology.' },
        { id: '3', text: 'Stay silent and disconnect the video call.', isCorrect: false, feedback: 'Working through unfamiliar problems is how you demonstrate real engineering ability.' }
      ]
    },
    step2: {
      tag: 'Spot the Right Approach',
      question: 'You need to find the Next Greater Element for each element in an array of numbers in linear O(N) time. What pattern should you use?',
      options: [
        { id: '1', text: 'Monotonic Decreasing Stack', isCorrect: true, feedback: 'Correct! A Monotonic Stack keeps elements in order and finds the next greater item in one pass.' },
        { id: '2', text: 'Two nested loops O(N^2)', isCorrect: false, feedback: 'Nested loops will hit time limits on large inputs.' },
        { id: '3', text: 'Breadth-First Search (BFS)', isCorrect: false, feedback: 'BFS is for trees/graphs, not array sequence comparisons.' }
      ]
    },
    step3: {
      tag: 'Spot the Bug',
      question: 'This code compares two Java String objects using "==" instead of ".equals()". Why is that a bug?',
      codeSnippet: `String userRole = getUserRole();\nif (userRole == "ADMIN") { // <-- Bug in string comparison!\n    allowAccess();\n}`,
      options: [
        { id: '1', text: '"==" checks memory references, not character content. Change to: "ADMIN".equals(userRole)', isCorrect: true, feedback: 'Correct! In Java, always use .equals() to compare string values, and calling it on the literal prevents NullPointerException.' },
        { id: '2', text: 'String names cannot be capitalized.', isCorrect: false, feedback: 'String capitalization has nothing to do with equality logic.' },
        { id: '3', text: 'Change == to !=', isCorrect: false, feedback: '!= still checks memory reference.' }
      ]
    }
  }
];

export default function PlacementFlashGauntlet({ userEmail = 'guest', onVictory, setActiveTab }) {
  // Use today's calendar date to automatically pick day 1 to 31 in sequence
  const todayDay = new Date().getDate(); // 1 to 31
  const scenarioIndex = (todayDay - 1) % PROGRESSIVE_31_DAYS_CHALLENGES.length;
  const currentDailyScenario = PROGRESSIVE_31_DAYS_CHALLENGES[scenarioIndex] || PROGRESSIVE_31_DAYS_CHALLENGES[0];

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
    ? currentDailyScenario.step1 
    : (currentStep === 2 ? currentDailyScenario.step2 : currentDailyScenario.step3);

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
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '18px',
      border: '1px solid #E5E7EB',
      padding: '26px 28px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
      marginBottom: '32px'
    }}>
      
      {/* Unified Header with Day & Progressive Level Indicator */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: '#111827',
              color: '#FFFFFF'
            }}>
              Day {todayDay} of 31
            </span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: '#F3F4F6',
              color: '#111827'
            }}>
              Level: {currentDailyScenario.level}
            </span>
            <span style={{ fontSize: '0.8rem', color: '#15803D', fontWeight: 700 }}>
              +120 XP Reward
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            Daily Placement Confidence Challenge
          </h3>
        </div>

        {/* Indicator */}
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
            Great Job! Day {todayDay} Challenge Completed
          </h4>
          <p style={{ fontSize: '0.88rem', color: '#4B5563', maxWidth: '500px', margin: '0 auto 18px auto', lineHeight: 1.4 }}>
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

          {/* Optional Code Snippet */}
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
                  style={{ padding: '8px 20px', fontSize: '0.84rem', display: 'flex', alignItems: 'center' }}
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
