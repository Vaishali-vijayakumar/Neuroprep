import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Video, FileText, CheckCircle2, Trophy, 
  Sparkles, Clock, Target, ExternalLink, Play, 
  HelpCircle, Layers, Check, X, ChevronRight, Zap, RefreshCw, BarChart2
} from 'lucide-react';

// Curated Knowledge Database for PLACER-RAG Intelligence
const KNOWLEDGE_BASE = {
  'dbms normalization': {
    title: 'DBMS Normalization (1NF, 2NF, 3NF, BCNF)',
    category: 'Database Management Systems',
    difficulty: 'Intermediate',
    prerequisites: ['Relational Model Basics', 'Primary Keys & Candidate Keys'],
    summary: 'Normalization organizes database tables to minimize data redundancy and prevent insertion, update, and deletion anomalies.',
    curatedNotes: [
      { rule: '1NF (First Normal Form)', detail: 'Every column must contain atomic (indivisible) values. No multi-valued attributes or repeating groups.' },
      { rule: '2NF (Second Normal Form)', detail: 'Must be in 1NF AND have NO partial dependency (no non-prime attribute depends on a proper subset of a candidate key).' },
      { rule: '3NF (Third Normal Form)', detail: 'Must be in 2NF AND have NO transitive dependency (if X -> Y and Y -> Z, then X -> Z is eliminated).' },
      { rule: 'BCNF (Boyce-Codd Normal Form)', detail: 'Stricter 3NF: for every functional dependency X -> Y, X must strictly be a Super Key.' }
    ],
    videoRAG: {
      title: 'DBMS Normalization in One Shot (1NF to BCNF)',
      channel: 'Knowledge Gate / Gate Smashers',
      duration: '18 min',
      views: '1.2M',
      rating: 98,
      rqsScore: 94.5,
      chapters: [
        { time: '00:00 - 04:15', topic: 'Why Normalization & Anomalies (Insert/Update/Delete)', keyConcept: 'Redundancy causes update anomalies when same data is stored in multiple rows.' },
        { time: '04:15 - 08:30', topic: '1NF: Atomic Attributes Breakdown', keyConcept: 'Split comma-separated values into distinct individual rows.' },
        { time: '08:30 - 13:45', topic: '2NF: Eliminating Partial Dependencies', keyConcept: 'Table is in 2NF if non-prime attributes depend on the full composite key, not part of it.' },
        { time: '13:45 - 18:00', topic: '3NF: Transitive Dependency & BCNF', keyConcept: 'If A -> B and B -> C, separate B -> C into its own dedicated lookup table.' }
      ]
    },
    practiceProblems: [
      { id: 'q1', title: 'Find highest normal form for table R(A,B,C,D) with F={AB->C, C->D, D->A}', difficulty: 'Medium', placementWeight: 'High (TCS / Infosys)' },
      { id: 'q2', title: 'Decompose non-2NF table into 2NF tables without data loss', difficulty: 'Easy', placementWeight: 'High' },
      { id: 'q3', title: 'Identify non-prime attributes and candidate keys from functional dependencies', difficulty: 'Medium', placementWeight: 'Very High' }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'A table R(StudentID, CourseID, StudentName, CourseFee) has key (StudentID, CourseID). StudentName depends only on StudentID. Which normal form is violated?',
        options: [
          { text: '1NF', isCorrect: false, explanation: 'Values are atomic, so 1NF is not violated.' },
          { text: '2NF', isCorrect: true, explanation: 'Correct! StudentName depends only on part of the primary key (StudentID), causing a partial dependency.' },
          { text: '3NF only', isCorrect: false, explanation: 'It fails 2NF first before reaching 3NF.' }
        ]
      },
      {
        id: 'q2',
        question: 'In 3NF, what type of dependency is strictly eliminated?',
        options: [
          { text: 'Transitive Dependency (Non-prime attribute determining another non-prime attribute)', isCorrect: true, explanation: 'Correct! 3NF requires that no non-prime attribute depends on another non-prime attribute.' },
          { text: 'Primary Key Dependency', isCorrect: false, explanation: 'Dependencies on primary keys are mandatory.' },
          { text: 'Multi-valued Dependency', isCorrect: false, explanation: 'Multi-valued dependencies are handled in 4NF.' }
        ]
      },
      {
        id: 'q3',
        question: 'What is the key requirement for a table to be in BCNF for any functional dependency X -> Y?',
        options: [
          { text: 'X must strictly be a Super Key', isCorrect: true, explanation: 'Correct! In BCNF, every determinant X must be a super key.' },
          { text: 'Y must be a prime attribute', isCorrect: false, explanation: 'In standard 3NF Y can be prime, but in BCNF X must be a super key.' },
          { text: 'Table must have fewer than 3 columns', isCorrect: false, explanation: 'Column count does not define normal forms.' }
        ]
      }
    ],
    nextRecommendation: {
      topic: 'SQL Joins & Indexing Optimization',
      reason: 'Now that you understand normalized schemas, learning how to query across tables with INNER/LEFT JOIN and B-Tree indexes is the next step for placement tests.',
      estimatedTime: '20 min'
    }
  },

  'binary tree': {
    title: 'Binary Tree Traversals & BST Construction',
    category: 'Data Structures & Algorithms',
    difficulty: 'Intermediate',
    prerequisites: ['Recursion Fundamentals', 'Pointers / References'],
    summary: 'A hierarchical tree data structure where each node has at most two children (left and right), used in binary search trees, heaps, and expression evaluators.',
    curatedNotes: [
      { rule: 'Inorder Traversal (Left, Root, Right)', detail: 'In a Binary Search Tree (BST), Inorder traversal ALWAYS visits nodes in strictly sorted ascending order.' },
      { rule: 'Preorder (Root, Left, Right) & Postorder (Left, Right, Root)', detail: 'Preorder is used for cloning/serializing trees; Postorder is used for bottom-up calculations (e.g. tree height, node deletion).' },
      { rule: 'Level Order Traversal (BFS)', detail: 'Uses a Queue to process nodes level by level from root to leaves in O(N) time and O(W) maximum space.' },
      { rule: 'BST Property', detail: 'For every node, all values in the left subtree are < node.val, and all values in the right subtree are > node.val.' }
    ],
    videoRAG: {
      title: 'Binary Trees & Traversals Masterclass (BFS & DFS)',
      channel: 'Striver / Take U Forward',
      duration: '22 min',
      views: '950K',
      rating: 99,
      rqsScore: 96.0,
      chapters: [
        { time: '00:00 - 05:20', topic: 'Tree Representation & Node Pointer Anatomy', keyConcept: 'TreeNode has val, left, and right pointers.' },
        { time: '05:20 - 11:30', topic: 'DFS Traversals (Inorder, Preorder, Postorder)', keyConcept: 'Recursive stack frames visit left child, process root, then right child.' },
        { time: '11:30 - 17:40', topic: 'BFS Level Order Traversal with Queue', keyConcept: 'Poll current node from queue, add children, track level size.' },
        { time: '17:40 - 22:00', topic: 'Maximum Depth of Binary Tree in 4 lines', keyConcept: '1 + Math.max(maxDepth(root.left), maxDepth(root.right)).' }
      ]
    },
    practiceProblems: [
      { id: 'q1', title: 'Binary Tree Level Order Traversal (LeetCode #102)', difficulty: 'Medium', placementWeight: 'High (Amazon / TCS)' },
      { id: 'q2', title: 'Maximum Depth of Binary Tree (LeetCode #104)', difficulty: 'Easy', placementWeight: 'Very High' },
      { id: 'q3', title: 'Validate Binary Search Tree (LeetCode #98)', difficulty: 'Medium', placementWeight: 'High' }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which traversal of a Binary Search Tree (BST) produces elements in strictly ascending sorted order?',
        options: [
          { text: 'Inorder Traversal (Left, Root, Right)', isCorrect: true, explanation: 'Correct! Inorder traversal of a BST always yields sorted keys.' },
          { text: 'Preorder Traversal (Root, Left, Right)', isCorrect: false, explanation: 'Preorder visits root before subtrees.' },
          { text: 'Postorder Traversal (Left, Right, Root)', isCorrect: false, explanation: 'Postorder visits root last.' }
        ]
      },
      {
        id: 'q2',
        question: 'What is the maximum number of nodes at level L in a binary tree (assuming root is at level 0)?',
        options: [
          { text: '2^L', isCorrect: true, explanation: 'Correct! Level 0 has 2^0 = 1 node, Level 1 has 2^1 = 2 nodes, Level L has 2^L nodes.' },
          { text: '2 * L', isCorrect: false, explanation: 'Growth is exponential, not linear.' },
          { text: 'L^2', isCorrect: false, explanation: 'Growth follows power of 2.' }
        ]
      },
      {
        id: 'q3',
        question: 'What helper data structure is required to implement Level Order Traversal (BFS) iteratively?',
        options: [
          { text: 'Queue (FIFO)', isCorrect: true, explanation: 'Correct! A Queue ensures nodes are visited in first-in first-out level order.' },
          { text: 'Stack (LIFO)', isCorrect: false, explanation: 'A Stack creates depth-first behavior, not breadth-first.' },
          { text: 'Hash Map', isCorrect: false, explanation: 'Queue is the standard structure for BFS.' }
        ]
      }
    ],
    nextRecommendation: {
      topic: 'Lowest Common Ancestor (LCA) in Binary Tree & BST',
      reason: 'Since you mastered traversals, LCA is one of the most frequently asked tree problems in campus interviews.',
      estimatedTime: '25 min'
    }
  },

  'dynamic programming': {
    title: 'Dynamic Programming 1D & 0/1 Knapsack',
    category: 'Algorithms',
    difficulty: 'Advanced',
    prerequisites: ['Recursion & Memoization', 'Time Complexity Analysis'],
    summary: 'Dynamic programming optimizes recursive problems with overlapping subproblems and optimal substructure by storing intermediate results.',
    curatedNotes: [
      { rule: 'Overlapping Subproblems', detail: 'The same subproblems are solved repeatedly (e.g. Fibonacci fib(n-1) and fib(n-2) both need fib(n-3)).' },
      { rule: 'Optimal Substructure', detail: 'An optimal solution to the problem contains within it optimal solutions to subproblems.' },
      { rule: 'Top-Down (Memoization)', detail: 'Recursion + Cache: store results in a memo array or hash map before returning.' },
      { rule: 'Bottom-Up (Tabulation)', detail: 'Iterative DP table: fill base cases first and build up to N in linear O(N) time and O(N) or O(1) space.' }
    ],
    videoRAG: {
      title: 'Dynamic Programming for Beginners to Placement Pro',
      channel: 'Aditya Verma / FreeCodeCamp',
      duration: '25 min',
      views: '1.8M',
      rating: 99,
      rqsScore: 97.2,
      chapters: [
        { time: '00:00 - 06:10', topic: 'How to Identify DP in 30 Seconds', keyConcept: 'Look for choice diagram (include/exclude) and optimal value (max/min/count).' },
        { time: '06:10 - 12:40', topic: '0/1 Knapsack Recursive Tree & Base Cases', keyConcept: 'If wt[n-1] <= W: choose max(val + knapsack(W-wt), knapsack(W)).' },
        { time: '12:40 - 19:15', topic: 'Memoization (2D Matrix Cache)', keyConcept: 'Initialize t[n+1][W+1] with -1 to avoid recalculating states.' },
        { time: '19:15 - 25:00', topic: 'Space Optimization to 1D Array', keyConcept: 'Iterate backwards from W to wt[i] to prevent overwriting current row.' }
      ]
    },
    practiceProblems: [
      { id: 'q1', title: 'Climbing Stairs / Fibonacci DP (LeetCode #70)', difficulty: 'Easy', placementWeight: 'High' },
      { id: 'q2', title: 'House Robber 1D DP (LeetCode #198)', difficulty: 'Medium', placementWeight: 'Very High (TCS / Amazon)' },
      { id: 'q3', title: '0/1 Knapsack Problem & Subset Sum Equal Partition', difficulty: 'Medium', placementWeight: 'High' }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What two fundamental properties must a problem have to be solvable using Dynamic Programming?',
        options: [
          { text: 'Overlapping Subproblems and Optimal Substructure', isCorrect: true, explanation: 'Correct! These two properties allow caching and building optimal answers from subproblems.' },
          { text: 'Sorted Input and Binary Searchability', isCorrect: false, explanation: 'DP applies to unsorted arrays and graphs as well.' },
          { text: 'Greedy Choice Property only', isCorrect: false, explanation: 'Greedy choice is for Greedy algorithms, not general DP.' }
        ]
      },
      {
        id: 'q2',
        question: 'In the House Robber problem (cannot rob adjacent houses), what is the recurrence relation for house i?',
        options: [
          { text: 'dp[i] = max(dp[i - 1], nums[i] + dp[i - 2])', isCorrect: true, explanation: 'Correct! Either skip house i (take dp[i-1]) or rob house i (take nums[i] + dp[i-2]).' },
          { text: 'dp[i] = nums[i] + dp[i - 1]', isCorrect: false, explanation: 'This violates the constraint of not robbing adjacent houses.' },
          { text: 'dp[i] = min(dp[i - 1], dp[i - 2])', isCorrect: false, explanation: 'We maximize profit, not minimize.' }
        ]
      },
      {
        id: 'q3',
        question: 'When optimizing a 2D 0/1 Knapsack DP table to a single 1D array, which direction must the capacity W be iterated?',
        options: [
          { text: 'Backwards (from W down to weight[i])', isCorrect: true, explanation: 'Correct! Iterating backwards ensures we use values from the previous item without reuse in the same step.' },
          { text: 'Forwards (from 0 up to W)', isCorrect: false, explanation: 'Forward iteration represents Unbounded Knapsack (infinite supply of items).' },
          { text: 'Random index lookup', isCorrect: false, explanation: 'Deterministic ordering is required.' }
        ]
      }
    ],
    nextRecommendation: {
      topic: 'Longest Common Subsequence (LCS) & String DP',
      reason: 'LCS is the mother pattern for Edit Distance, Shortest Common Supersequence, and Palindromic Substrings.',
      estimatedTime: '25 min'
    }
  }
};

export default function PlacementResourceRAG({ profile = {}, codingState = {}, interviewState = {}, aptitudeState = {}, setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopicKey, setSelectedTopicKey] = useState(null); // null by default - no initial searches
  const [explanationLevel, setExplanationLevel] = useState('Beginner'); // 'Beginner' | 'Intermediate' | 'Interview-Ready'
  const [timeBudget, setTimeBudget] = useState('30 min'); // '15 min' | '30 min' | '45 min'
  const [activeStepTab, setActiveStepTab] = useState('video'); // 'video' | 'notes' | 'practice' | 'quiz'
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (queryText) => {
    if (!queryText || !queryText.trim()) return;
    setIsSearching(true);
    const clean = queryText.toLowerCase();
    
    setTimeout(() => {
      if (clean.includes('tree') || clean.includes('bst')) {
        setSelectedTopicKey('binary tree');
      } else if (clean.includes('dp') || clean.includes('dynamic') || clean.includes('knapsack')) {
        setSelectedTopicKey('dynamic programming');
      } else {
        setSelectedTopicKey('dbms normalization');
      }
      setIsSearching(false);
      setIsQuizSubmitted(false);
      setQuizAnswers({});
      setActiveStepTab('video');
    }, 400);
  };

  const currentTopic = selectedTopicKey ? KNOWLEDGE_BASE[selectedTopicKey] : null;

  const handleSelectQuizOption = (qId, optionIdx) => {
    if (isQuizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qId]: optionIdx }));
  };

  const handleSubmitQuiz = () => {
    setIsQuizSubmitted(true);
  };

  // Calculate Quiz Score
  const totalQuizQuestions = currentTopic?.quiz?.length || 0;
  const correctQuizCount = currentTopic?.quiz?.reduce((acc, q) => {
    const selectedIdx = quizAnswers[q.id];
    if (selectedIdx !== undefined && q.options[selectedIdx]?.isCorrect) {
      return acc + 1;
    }
    return acc;
  }, 0) || 0;

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1060, margin: '0 auto', fontFamily: 'var(--font-inter)' }}>
      
      {/* Top Back Navigation outside card */}
      {setActiveTab && (
        <div style={{ marginBottom: '18px' }}>
          <button 
            onClick={() => setActiveTab('dashboard')} 
            className="btn-secondary-spec"
            style={{ padding: '8px 18px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center' }}
          >
            Back to Dashboard
          </button>
        </div>
      )}

      {/* Top Header Card */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '20px',
        border: '1px solid #E5E7EB',
        padding: '28px 32px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        marginBottom: '26px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 800,
            padding: '3px 10px',
            borderRadius: '6px',
            backgroundColor: '#111827',
            color: '#FFFFFF',
            letterSpacing: '0.4px'
          }}>
            Smart Study Hub
          </span>
          <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600 }}>
            Curated Placement Learning Paths
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', margin: 0 }}>
          Placement Learning Resources & Guided Study Paths
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#4B5563', margin: '4px 0 0 0', lineHeight: 1.45 }}>
          Search any placement topic to get a structured 4-step learning roadmap: a top-rated video explanation with key timestamps, concise revision notes, targeted practice problems, and a quick quiz to test your understanding.
        </p>
      </div>

      {/* Interactive Search Bar & Quick Topic Chips */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
          <div style={{
            flex: 1,
            position: 'relative',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Search size={18} color="#6B7280" style={{ position: 'absolute', left: '16px' }} />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
              placeholder="Search any placement topic (e.g., DBMS Normalization, Binary Trees, Dynamic Programming)..."
              style={{
                width: '100%',
                padding: '12px 16px 12px 46px',
                borderRadius: '12px',
                border: '1.5px solid #D1D5DB',
                fontSize: '0.92rem',
                outline: 'none',
                fontWeight: 600,
                color: '#111827',
                backgroundColor: '#FAFAFA'
              }}
            />
          </div>
          <button
            onClick={() => handleSearch(searchQuery)}
            disabled={!searchQuery.trim()}
            className="btn-primary-spec"
            style={{ padding: '12px 24px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px', opacity: searchQuery.trim() ? 1 : 0.6 }}
          >
            {isSearching ? <RefreshCw size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Generate Study Path
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280' }}>
            Popular Topics:
          </span>
          {[
            { label: 'DBMS Normalization', key: 'dbms normalization' },
            { label: 'Binary Trees & BST', key: 'binary tree' },
            { label: 'Dynamic Programming 0/1 Knapsack', key: 'dynamic programming' }
          ].map((chip) => (
            <button
              key={chip.key}
              onClick={() => {
                setSearchQuery(chip.label);
                handleSearch(chip.label);
              }}
              style={{
                padding: '5px 14px',
                borderRadius: '20px',
                border: selectedTopicKey === chip.key ? '1.5px solid #111827' : '1px solid #E5E7EB',
                backgroundColor: selectedTopicKey === chip.key ? '#111827' : '#F3F4F6',
                color: selectedTopicKey === chip.key ? '#FFFFFF' : '#374151',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* When NO search has been run yet - show inviting clean empty state */}
      {!selectedTopicKey && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '16px',
          border: '1.5px dashed #D1D5DB',
          padding: '44px 28px',
          textAlign: 'center',
          marginBottom: '26px'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: '#F3F4F6',
            color: '#111827',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <BookOpen size={26} />
          </div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '0 0 6px 0' }}>
            Search Any Placement Topic Above
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#4B5563', maxWidth: '520px', margin: '0 auto 22px auto', lineHeight: 1.5 }}>
            Type a topic or click one of the popular topics to generate your custom 4-step learning roadmap with timestamped video breakdowns, concise notes, practice questions, and a mini-quiz.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', maxWidth: '850px', margin: '0 auto', textAlign: 'left' }}>
            {[
              {
                title: 'DBMS Normalization',
                desc: '1NF to BCNF rules, eliminating partial and transitive dependencies with clear schema examples.',
                key: 'dbms normalization'
              },
              {
                title: 'Binary Trees & BST',
                desc: 'Inorder/Preorder/Postorder traversals, height calculation, and tree validation algorithms.',
                key: 'binary tree'
              },
              {
                title: 'Dynamic Programming',
                desc: '0/1 Knapsack pattern, recursion to memoization conversion, and 1D space optimization.',
                key: 'dynamic programming'
              }
            ].map(card => (
              <div 
                key={card.key}
                onClick={() => {
                  setSearchQuery(card.title);
                  handleSearch(card.title);
                }}
                style={{
                  backgroundColor: '#F9FAFB',
                  border: '1px solid #E5E7EB',
                  borderRadius: '12px',
                  padding: '16px 18px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
                  {card.title}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', lineHeight: 1.4, marginBottom: '10px' }}>
                  {card.desc}
                </div>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#111827' }}>
                  Load Learning Path
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* When a topic IS selected - render the 4-step path */}
      {selectedTopicKey && currentTopic && (
        <div>
          {/* Controls (Explanation Depth & Time Budget) */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            padding: '12px 18px',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            {/* Explanation Tone Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#111827' }}>
                Explanation Depth:
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['Beginner', 'Intermediate', 'Interview-Ready'].map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setExplanationLevel(lvl)}
                    style={{
                      padding: '4px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: explanationLevel === lvl ? '#111827' : '#FFFFFF',
                      color: explanationLevel === lvl ? '#FFFFFF' : '#4B5563',
                      boxShadow: explanationLevel === lvl ? '0 2px 6px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Time Budget Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="#6B7280" />
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#111827' }}>
                Available Time:
              </span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['15 min', '30 min', '45 min'].map((time) => (
                  <button
                    key={time}
                    onClick={() => setTimeBudget(time)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      border: '1px solid #E5E7EB',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      backgroundColor: timeBudget === time ? '#111827' : '#FFFFFF',
                      color: timeBudget === time ? '#FFFFFF' : '#4B5563'
                    }}
                  >
                    {time}
                  </button>
                ))}
              </div>
            </div>
          </div>

      {/* Multi-Factor Resource Quality Score (RQS) Header Badge */}
      <div style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #E5E7EB',
        borderRadius: '16px',
        padding: '18px 22px',
        marginBottom: '22px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '14px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h3 style={{ fontSize: '1.18rem', fontWeight: 900, color: '#111827', margin: 0 }}>
              {currentTopic.title}
            </h3>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '6px',
              backgroundColor: '#F3F4F6',
              color: '#111827'
            }}>
              {currentTopic.category}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: '#4B5563', margin: '4px 0 0 0', lineHeight: 1.4 }}>
            {currentTopic.summary}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: '#6B7280', display: 'block', fontWeight: 700 }}>
              Content Quality Score
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#15803D' }}>
              {currentTopic.videoRAG.rqsScore}%
            </span>
          </div>
          <div style={{
            height: '36px',
            width: '1px',
            backgroundColor: '#E5E7EB'
          }} />
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.72rem', color: '#6B7280', display: 'block', fontWeight: 700 }}>
              Placement Relevance
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#111827' }}>
              96%
            </span>
          </div>
        </div>
      </div>

      {/* 4-Step Adaptive Learning Flow Navigation */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px' }}>
        {[
          { id: 'video', label: '1. Watch Video & Timestamps', icon: Video },
          { id: 'notes', label: '2. Read Distilled Notes', icon: FileText },
          { id: 'practice', label: '3. Placement Practice (3 Questions)', icon: Target },
          { id: 'quiz', label: '4. Check Understanding (Quiz)', icon: HelpCircle }
        ].map((step) => {
          const Icon = step.icon;
          const isActive = activeStepTab === step.id;
          return (
            <button
              key={step.id}
              onClick={() => setActiveStepTab(step.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 16px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: isActive ? '#111827' : '#F3F4F6',
                color: isActive ? '#FFFFFF' : '#475569',
                fontSize: '0.84rem',
                fontWeight: 700,
                transition: 'all 0.15s ease'
              }}
            >
              <Icon size={16} />
              {step.label}
            </button>
          );
        })}
      </div>

      {/* STEP 1: MULTIMODAL YOUTUBE RAG WITH TIMESTAMPS */}
      {activeStepTab === 'video' && (
        <div>
          <div style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase' }}>
                  Best Video Matched for Your Level
                </span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: '2px 0 0 0' }}>
                  {currentTopic.videoRAG.title}
                </h4>
                <div style={{ fontSize: '0.8rem', color: '#6B7280', marginTop: '2px' }}>
                  Channel: <strong>{currentTopic.videoRAG.channel}</strong> • {currentTopic.videoRAG.duration} • {currentTopic.videoRAG.views} views • {currentTopic.videoRAG.rating}% Student Approval
                </div>
              </div>

              <span style={{
                backgroundColor: '#111827',
                color: '#FFFFFF',
                fontSize: '0.8rem',
                fontWeight: 800,
                padding: '4px 12px',
                borderRadius: '8px'
              }}>
                Quality: {currentTopic.videoRAG.rqsScore}%
              </span>
            </div>

            {/* Timestamp Segmentation Breakdown */}
            <div style={{ marginTop: '16px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#111827', display: 'block', marginBottom: '8px' }}>
                Key Topic Timestamps:
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {currentTopic.videoRAG.chapters.map((ch, idx) => (
                  <div
                    key={idx}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        backgroundColor: '#F3F4F6',
                        color: '#111827',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontFamily: 'monospace'
                      }}>
                        {ch.time}
                      </span>
                      <div>
                        <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#111827' }}>
                          {ch.topic}
                        </div>
                        <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
                          {ch.keyConcept}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setActiveStepTab('notes')}
                      className="btn-secondary-spec"
                      style={{ fontSize: '0.75rem', padding: '4px 10px', fontWeight: 700 }}
                    >
                      Read Summary
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setActiveStepTab('notes')}
              className="btn-primary-spec"
              style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}
            >
              Next: Read Distilled Notes
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DISTILLED NOTES (PDF EXTRACTOR) */}
      {activeStepTab === 'notes' && (
        <div>
          <div style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
                  Distilled Core Concepts (Read Time: ~5 mins)
                </span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: '2px 0 0 0' }}>
                  No need to read 50-page textbooks: Here are the exact rules tested in interviews.
                </h4>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentTopic.curatedNotes.map((note, idx) => (
                <div
                  key={idx}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    padding: '12px 16px'
                  }}
                >
                  <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
                    {note.rule}
                  </div>
                  <div style={{ fontSize: '0.84rem', color: '#4B5563', lineHeight: 1.4 }}>
                    {note.detail}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={() => setActiveStepTab('video')}
              className="btn-secondary-spec"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Back to Video
            </button>
            <button
              onClick={() => setActiveStepTab('practice')}
              className="btn-primary-spec"
              style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}
            >
              Next: Placement Practice
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: PLACEMENT PRACTICE PROBLEMS */}
      {activeStepTab === 'practice' && (
        <div>
          <div style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '18px'
          }}>
            <div style={{ marginBottom: '14px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
                Handpicked Placement Practice Problems
              </span>
              <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: '2px 0 0 0' }}>
                Solve these targeted questions to test your algorithmic understanding.
              </h4>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {currentTopic.practiceProblems.map((prob) => (
                <div
                  key={prob.id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '10px',
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#111827', marginBottom: '2px' }}>
                      {prob.title}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                      Placement Weight: <strong>{prob.placementWeight}</strong>
                    </div>
                  </div>

                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    backgroundColor: prob.difficulty === 'Easy' ? '#DCFCE7' : '#FEF3C7',
                    color: prob.difficulty === 'Easy' ? '#15803D' : '#B45309'
                  }}>
                    {prob.difficulty}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button
              onClick={() => setActiveStepTab('notes')}
              className="btn-secondary-spec"
              style={{ padding: '8px 16px', fontSize: '0.85rem' }}
            >
              Back to Notes
            </button>
            <button
              onClick={() => setActiveStepTab('quiz')}
              className="btn-primary-spec"
              style={{ padding: '8px 20px', fontSize: '0.85rem', display: 'flex', alignItems: 'center' }}
            >
              Next: Take Mini Quiz
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: INTERACTIVE QUIZ & KNOWLEDGE TRACING ADAPTATION */}
      {activeStepTab === 'quiz' && (
        <div>
          <div style={{
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            borderRadius: '14px',
            padding: '20px',
            marginBottom: '18px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
                  Knowledge Check Quiz (3 Questions)
                </span>
                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: '2px 0 0 0' }}>
                  Answer these questions to update your knowledge profile.
                </h4>
              </div>

              {isQuizSubmitted && (
                <div style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  backgroundColor: correctQuizCount >= 2 ? '#DCFCE7' : '#FEF2F2',
                  color: correctQuizCount >= 2 ? '#15803D' : '#991B1B',
                  fontWeight: 800,
                  fontSize: '0.88rem'
                }}>
                  Score: {correctQuizCount}/{totalQuizQuestions} ({Math.round((correctQuizCount / totalQuizQuestions) * 100)}% Mastery)
                </div>
              )}
            </div>

            {/* Quiz Questions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {currentTopic.quiz.map((q, qIdx) => {
                const selectedIdx = quizAnswers[q.id];

                return (
                  <div
                    key={q.id}
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #E5E7EB',
                      borderRadius: '12px',
                      padding: '16px 20px'
                    }}
                  >
                    <p style={{ fontSize: '0.92rem', fontWeight: 800, color: '#111827', margin: '0 0 12px 0', lineHeight: 1.4 }}>
                      {qIdx + 1}. {q.question}
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedIdx === optIdx;
                        let borderStyle = isChosen ? '1.5px solid #111827' : '1px solid #E5E7EB';
                        let bgStyle = isChosen ? '#F9FAFB' : '#FFFFFF';

                        if (isQuizSubmitted) {
                          if (opt.isCorrect) {
                            borderStyle = '1.5px solid #15803D';
                            bgStyle = '#F0FDF4';
                          } else if (isChosen && !opt.isCorrect) {
                            borderStyle = '1.5px solid #DC2626';
                            bgStyle = '#FEF2F2';
                          }
                        }

                        return (
                          <div
                            key={optIdx}
                            onClick={() => handleSelectQuizOption(q.id, optIdx)}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: borderStyle,
                              backgroundColor: bgStyle,
                              cursor: isQuizSubmitted ? 'default' : 'pointer',
                              fontSize: '0.85rem',
                              fontWeight: 600,
                              color: '#111827',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span>{opt.text}</span>
                              {isQuizSubmitted && opt.isCorrect && (
                                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803D' }}>✓ Correct</span>
                              )}
                            </div>

                            {isQuizSubmitted && isChosen && (
                              <div style={{ marginTop: '6px', fontSize: '0.78rem', color: opt.isCorrect ? '#166534' : '#991B1B', fontWeight: 500 }}>
                                {opt.explanation}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Submit Button or Next Adaptive Recommendation */}
            <div style={{ marginTop: '18px', textAlign: 'center' }}>
              {!isQuizSubmitted ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={Object.keys(quizAnswers).length < totalQuizQuestions}
                  className="btn-primary-spec"
                  style={{
                    padding: '10px 28px',
                    fontSize: '0.88rem',
                    opacity: Object.keys(quizAnswers).length === totalQuizQuestions ? 1 : 0.5,
                    cursor: Object.keys(quizAnswers).length === totalQuizQuestions ? 'pointer' : 'not-allowed'
                  }}
                >
                  Submit & Evaluate Understanding
                </button>
              ) : (
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1.5px solid #111827',
                  padding: '16px 20px',
                  textAlign: 'left',
                  marginTop: '12px'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                    Knowledge Model Updated • Next Recommendation:
                  </span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#111827', margin: '4px 0 2px 0' }}>
                    {currentTopic.nextRecommendation.topic} ({currentTopic.nextRecommendation.estimatedTime})
                  </h4>
                  <p style={{ fontSize: '0.82rem', color: '#4B5563', margin: '0 0 10px 0', lineHeight: 1.4 }}>
                    {currentTopic.nextRecommendation.reason}
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery(currentTopic.nextRecommendation.topic);
                      handleSearch(currentTopic.nextRecommendation.topic);
                    }}
                    className="btn-primary-spec"
                    style={{ fontSize: '0.82rem', padding: '6px 14px', display: 'inline-flex', alignItems: 'center' }}
                  >
                    Load Next Learning Path
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
        </div>
      )}

    </div>
  );
}
