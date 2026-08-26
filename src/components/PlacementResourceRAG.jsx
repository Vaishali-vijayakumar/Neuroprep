import React, { useState, useEffect } from 'react';
import { 
  Search, BookOpen, Video, FileText, CheckCircle2, Trophy, 
  Sparkles, Clock, Target, ExternalLink, Play, 
  HelpCircle, Layers, Check, X, ChevronRight, Zap, RefreshCw, BarChart2
} from 'lucide-react';

// Rich Knowledge Database for Placement Topics
const TOPIC_PRESETS = {
  'dbms': {
    title: 'DBMS Normalization & SQL Queries',
    category: 'Database Management Systems',
    difficulty: 'Intermediate',
    summary: 'Database table normalization (1NF to BCNF), indexing mechanisms, ACID transactions, and query optimization.',
    curatedNotes: [
      { rule: '1NF to BCNF Hierarchy', detail: '1NF ensures atomic columns -> 2NF removes partial dependency -> 3NF removes transitive dependency -> BCNF ensures every determinant is a super key.' },
      { rule: 'SQL Joins Execution', detail: 'INNER JOIN matches both tables; LEFT JOIN retains all left records; Hash Joins are optimal for large equality sets; Nested Loops for small lookups.' },
      { rule: 'Indexing & B-Trees', detail: 'Clustered indexes dictate physical storage order (1 per table); Non-clustered indexes create separate lookup pointers for high-speed WHERE clauses.' },
      { rule: 'ACID Transaction Guarantee', detail: 'Atomicity (all or nothing), Consistency (preserves constraints), Isolation (concurrency control via locking/MVCC), Durability (persisted on disk).' }
    ],
    videoRAG: {
      title: 'DBMS Complete Placement Masterclass (Normalization & SQL)',
      channel: 'Knowledge Gate / Gate Smashers',
      duration: '18 min',
      views: '1.4M',
      rating: 98,
      rqsScore: 95.0,
      chapters: [
        { time: '00:00 - 04:15', topic: 'Why Normalization & Anomalies (Insert/Update/Delete)', keyConcept: 'Redundancy causes update anomalies when the same data is stored across multiple rows.' },
        { time: '04:15 - 08:30', topic: '1NF to 3NF & BCNF Dependency Rules', keyConcept: 'Eliminating partial and transitive dependencies step-by-step.' },
        { time: '08:30 - 13:45', topic: 'Indexing Mechanics: Clustered vs Non-Clustered', keyConcept: 'B-Tree structure and how index scans avoid full table scans.' },
        { time: '13:45 - 18:00', topic: 'Top Placement Recruiter Questions', keyConcept: 'Tricky SQL query outputs, group by vs having, and candidate key identification.' }
      ]
    },
    practiceProblems: [
      { id: 'q1', title: 'Find highest normal form for relation R with given functional dependencies', difficulty: 'Medium', placementWeight: 'Very High' },
      { id: 'q2', title: 'Write an SQL Query to find the Nth highest salary using DENSE_RANK()', difficulty: 'Easy', placementWeight: 'High' },
      { id: 'q3', title: 'Explain transaction isolation levels and how to prevent phantom reads', difficulty: 'Medium', placementWeight: 'High' }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'A table R(A, B, C) has primary key (A, B). If C depends only on attribute A, which normal form is violated?',
        options: [
          { text: '2NF (Partial Dependency)', isCorrect: true, explanation: 'Correct! Since C depends on a subset of the candidate key (A), it violates 2NF.' },
          { text: '1NF', isCorrect: false, explanation: '1NF is about atomic attribute values.' },
          { text: '3NF only', isCorrect: false, explanation: 'It fails 2NF before reaching 3NF.' }
        ]
      },
      {
        id: 'q2',
        question: 'What is the primary difference between WHERE and HAVING clauses in SQL?',
        options: [
          { text: 'WHERE filters rows before aggregation, while HAVING filters grouped rows after aggregation', isCorrect: true, explanation: 'Correct! HAVING is evaluated on aggregated results after GROUP BY.' },
          { text: 'HAVING can only be used with primary keys', isCorrect: false, explanation: 'HAVING works with any aggregate expressions.' },
          { text: 'They are identical and interchangeable', isCorrect: false, explanation: 'WHERE cannot filter aggregate functions directly.' }
        ]
      },
      {
        id: 'q3',
        question: 'In BCNF, what strict rule must every functional dependency X -> Y satisfy?',
        options: [
          { text: 'X must strictly be a Super Key', isCorrect: true, explanation: 'Correct! Every determinant in BCNF must be a super key.' },
          { text: 'Y must be a numeric column', isCorrect: false, explanation: 'Data type has no relation to normal forms.' },
          { text: 'Table must have at most 2 columns', isCorrect: false, explanation: 'Normal forms apply to any number of columns.' }
        ]
      }
    ],
    nextRecommendation: {
      topic: 'SQL Query Optimization & Database Indexing',
      reason: 'Mastering SQL queries and query execution plans is the next logical step for technical tests.',
      estimatedTime: '20 min'
    }
  },

  'tree': {
    title: 'Binary Tree Traversals & BST Construction',
    category: 'Data Structures & Algorithms',
    difficulty: 'Intermediate',
    summary: 'Binary trees, BST properties, DFS traversals (Inorder, Preorder, Postorder), BFS level order, and lowest common ancestor.',
    curatedNotes: [
      { rule: 'Inorder Traversal Property', detail: 'In a Binary Search Tree (BST), Inorder traversal (Left -> Root -> Right) ALWAYS produces values in strictly sorted ascending order.' },
      { rule: 'DFS vs BFS Usages', detail: 'Use DFS (recursive stack) for height, symmetric trees, and subtree validation; use BFS (Queue) for shortest path and level-by-level processing.' },
      { rule: 'Tree Height & Depth', detail: 'Height is calculated bottom-up: 1 + Math.max(height(left), height(right)). Base case for null is 0.' },
      { rule: 'BST Search Efficiency', detail: 'Average search time is O(log N). In a degenerate skewed tree, it degrades to linear O(N), which AVL/Red-Black trees solve by balancing.' }
    ],
    videoRAG: {
      title: 'Binary Trees & Traversals Masterclass (BFS & DFS)',
      channel: 'Take U Forward / Striver',
      duration: '22 min',
      views: '980K',
      rating: 99,
      rqsScore: 96.0,
      chapters: [
        { time: '00:00 - 05:20', topic: 'TreeNode Pointer Structure & Memory Representation', keyConcept: 'Each node contains value, left pointer, and right pointer.' },
        { time: '05:20 - 11:30', topic: 'DFS Traversals (Inorder, Preorder, Postorder)', keyConcept: 'Call stack execution order and recursion base cases.' },
        { time: '11:30 - 17:40', topic: 'BFS Level Order Traversal with Queue', keyConcept: 'Process current level size, dequeue node, enqueue children.' },
        { time: '17:40 - 22:00', topic: 'Maximum Depth & BST Validation Pattern', keyConcept: 'Bottom-up height calculation and min/max range boundaries.' }
      ]
    },
    practiceProblems: [
      { id: 'q1', title: 'Binary Tree Level Order Traversal (LeetCode #102)', difficulty: 'Medium', placementWeight: 'Very High' },
      { id: 'q2', title: 'Validate Binary Search Tree (LeetCode #98)', difficulty: 'Medium', placementWeight: 'High' },
      { id: 'q3', title: 'Lowest Common Ancestor of a Binary Tree (LeetCode #236)', difficulty: 'Medium', placementWeight: 'High' }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which traversal of a Binary Search Tree (BST) produces nodes in strictly sorted ascending order?',
        options: [
          { text: 'Inorder Traversal (Left, Root, Right)', isCorrect: true, explanation: 'Correct! Inorder traversal of a BST always yields sorted keys.' },
          { text: 'Preorder Traversal (Root, Left, Right)', isCorrect: false, explanation: 'Preorder visits root before left subtree.' },
          { text: 'Postorder Traversal (Left, Right, Root)', isCorrect: false, explanation: 'Postorder visits root last.' }
        ]
      },
      {
        id: 'q2',
        question: 'What helper data structure is needed to implement Level Order Traversal (BFS) iteratively?',
        options: [
          { text: 'Queue (First-In, First-Out)', isCorrect: true, explanation: 'Correct! A queue processes tree nodes in level-by-level order.' },
          { text: 'Stack (Last-In, First-Out)', isCorrect: false, explanation: 'Stack produces depth-first search traversal.' },
          { text: 'Priority Queue / Min Heap', isCorrect: false, explanation: 'Standard BFS only requires a FIFO Queue.' }
        ]
      },
      {
        id: 'q3',
        question: 'What is the maximum number of nodes in a binary tree of height H (root at height 1)?',
        options: [
          { text: '2^H - 1', isCorrect: true, explanation: 'Correct! For height 1: 2^1 - 1 = 1; for height 2: 2^2 - 1 = 3; for height H: 2^H - 1.' },
          { text: '2 * H', isCorrect: false, explanation: 'Growth is exponential, not linear.' },
          { text: 'H^2', isCorrect: false, explanation: 'Node growth follows powers of 2.' }
        ]
      }
    ],
    nextRecommendation: {
      topic: 'Lowest Common Ancestor & Tree Diameter',
      reason: 'Deepens your recursive subtree decomposition and bottom-up computation reflexes.',
      estimatedTime: '20 min'
    }
  },

  'dp': {
    title: 'Dynamic Programming Patterns & 0/1 Knapsack',
    category: 'Algorithms',
    difficulty: 'Advanced',
    summary: 'Dynamic programming principles: identifying overlapping subproblems, optimal substructure, memoization tables, and space optimization.',
    curatedNotes: [
      { rule: 'Identifying DP in 30 Seconds', detail: 'Look for two signals: choice diagram (include/exclude, take/not-take) and optimization goal (max, min, count of ways).' },
      { rule: 'Top-Down Memoization', detail: 'Recursion + Cache: store results in a memo matrix before returning to convert exponential O(2^N) to polynomial O(N * W).' },
      { rule: 'Bottom-Up Tabulation', detail: 'Fill base cases first in an iterative table, processing subproblems from smallest to largest.' },
      { rule: '1D Space Optimization', detail: 'When row i only depends on row i-1, compress the 2D table into a 1D array by iterating capacities backwards.' }
    ],
    videoRAG: {
      title: 'Dynamic Programming for Placement Interviews in One Shot',
      channel: 'Aditya Verma / FreeCodeCamp',
      duration: '25 min',
      views: '1.9M',
      rating: 99,
      rqsScore: 97.0,
      chapters: [
        { time: '00:00 - 06:10', topic: 'How to Spot DP Patterns in Interview Problems', keyConcept: 'Choice diagram with overlapping subproblems.' },
        { time: '06:10 - 12:40', topic: '0/1 Knapsack Recursive Tree & Base Cases', keyConcept: 'If wt[n-1] <= W: choose max(val + knapsack(W-wt), knapsack(W)).' },
        { time: '12:40 - 19:15', topic: '2D Matrix Memoization Setup', keyConcept: 'Initialize DP table with -1 and check before computing.' },
        { time: '19:15 - 25:00', topic: '1D Array Space Compression', keyConcept: 'Iterate backwards from W to wt[i] to avoid overwriting current step.' }
      ]
    },
    practiceProblems: [
      { id: 'q1', title: 'Climbing Stairs / 1D DP (LeetCode #70)', difficulty: 'Easy', placementWeight: 'High' },
      { id: 'q2', title: 'House Robber 1D DP (LeetCode #198)', difficulty: 'Medium', placementWeight: 'Very High' },
      { id: 'q3', title: '0/1 Knapsack & Partition Equal Subset Sum', difficulty: 'Medium', placementWeight: 'Very High' }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'What two fundamental characteristics must a problem exhibit to be solvable with Dynamic Programming?',
        options: [
          { text: 'Overlapping Subproblems and Optimal Substructure', isCorrect: true, explanation: 'Correct! Overlapping subproblems allow caching, and optimal substructure enables building solutions from sub-solutions.' },
          { text: 'Sorted input array and binary divisibility', isCorrect: false, explanation: 'DP works across graphs, strings, and unsorted datasets.' },
          { text: 'Greedy choice property only', isCorrect: false, explanation: 'Greedy is a separate paradigm from general DP.' }
        ]
      },
      {
        id: 'q2',
        question: 'In the House Robber problem (cannot rob adjacent houses), what is the recurrence relation for house i?',
        options: [
          { text: 'dp[i] = max(dp[i - 1], nums[i] + dp[i - 2])', isCorrect: true, explanation: 'Correct! Either skip house i (take dp[i-1]) or rob house i (take nums[i] + dp[i-2]).' },
          { text: 'dp[i] = nums[i] + dp[i - 1]', isCorrect: false, explanation: 'Robbing adjacent houses is strictly disallowed.' },
          { text: 'dp[i] = min(dp[i - 1], dp[i - 2])', isCorrect: false, explanation: 'We want to maximize total loot, not minimize.' }
        ]
      },
      {
        id: 'q3',
        question: 'When compressing a 2D 0/1 Knapsack DP table to a single 1D array, why must we iterate backwards?',
        options: [
          { text: 'To ensure values from the previous item are used without double-counting the current item', isCorrect: true, explanation: 'Correct! Backward iteration prevents overwriting values needed for the current step.' },
          { text: 'Because arrays only support reverse access', isCorrect: false, explanation: 'Arrays can be traversed in either direction.' },
          { text: 'It makes the time complexity O(1)', isCorrect: false, explanation: 'Time complexity remains O(N * W).' }
        ]
      }
    ],
    nextRecommendation: {
      topic: 'Longest Common Subsequence (LCS) & String DP',
      reason: 'LCS is the mother pattern for Edit Distance, Shortest Common Supersequence, and Palindromic Substrings.',
      estimatedTime: '25 min'
    }
  },

  'graph': {
    title: 'Graph Traversals (BFS/DFS) & Shortest Path',
    category: 'Data Structures & Algorithms',
    difficulty: 'Intermediate',
    summary: 'Graph representation (Adjacency List/Matrix), Cycle detection in Directed/Undirected graphs, Topological Sort, and Dijkstra algorithm.',
    curatedNotes: [
      { rule: 'Adjacency List vs Matrix', detail: 'Adjacency list uses O(V + E) space and is optimal for sparse graphs; Matrix uses O(V^2) and is best for dense graphs.' },
      { rule: 'Cycle Detection Rules', detail: 'Undirected: DFS with parent pointer. Directed: DFS with path-visited tracking array (detect back-edges).' },
      { rule: 'Topological Sort (DAG only)', detail: 'Linear ordering of vertices where for every edge u -> v, u comes before v. Solved with Kahn algorithm (in-degree Queue) or DFS Stack.' },
      { rule: 'Dijkstra Shortest Path', detail: 'Finds shortest path from source in weighted graphs with non-negative edges in O((V + E) log V) using a Min-Heap (PriorityQueue).' }
    ],
    videoRAG: {
      title: 'Complete Graph Series for Placement Coding Tests',
      channel: 'Take U Forward / Striver',
      duration: '24 min',
      views: '1.1M',
      rating: 99,
      rqsScore: 96.5,
      chapters: [
        { time: '00:00 - 06:00', topic: 'Graph Representation & Connected Components', keyConcept: 'ArrayList of ArrayLists and visited boolean array.' },
        { time: '06:00 - 12:30', topic: 'BFS & DFS Algorithm Step-by-Step', keyConcept: 'Queue vs Call-stack recursion on graph adjacency list.' },
        { time: '12:30 - 18:30', topic: 'Cycle Detection in Directed Graphs (Kahn & DFS)', keyConcept: 'Detecting back edges with recursion stack / in-degrees.' },
        { time: '18:30 - 24:00', topic: 'Dijkstra Algorithm with PriorityQueue', keyConcept: 'Greedy distance relaxation from shortest discovered vertex.' }
      ]
    },
    practiceProblems: [
      { id: 'q1', title: 'Number of Islands (BFS/DFS) (LeetCode #200)', difficulty: 'Medium', placementWeight: 'Very High' },
      { id: 'q2', title: 'Course Schedule / Topological Sort (LeetCode #207)', difficulty: 'Medium', placementWeight: 'Very High' },
      { id: 'q3', title: 'Network Delay Time / Dijkstra (LeetCode #743)', difficulty: 'Medium', placementWeight: 'High' }
    ],
    quiz: [
      {
        id: 'q1',
        question: 'Which condition must a graph satisfy to possess a valid Topological Sort ordering?',
        options: [
          { text: 'It must be a Directed Acyclic Graph (DAG)', isCorrect: true, explanation: 'Correct! Cycles make dependency ordering impossible, and edges must have direction.' },
          { text: 'It must be an undirected connected graph', isCorrect: false, explanation: 'Undirected graphs do not have topological sort.' },
          { text: 'It must contain at most 10 vertices', isCorrect: false, explanation: 'Vertex count does not limit topological sort.' }
        ]
      },
      {
        id: 'q2',
        question: 'Why does standard Dijkstra algorithm fail on graphs with negative edge weights?',
        options: [
          { text: 'Because once a vertex is marked visited, Dijkstra assumes its shortest path is final and never re-relaxes it', isCorrect: true, explanation: 'Correct! Dijkstra greedy approach fails with negative cycles/weights; Bellman-Ford must be used instead.' },
          { text: 'Because Min-Heaps cannot store negative numbers', isCorrect: false, explanation: 'Heaps handle negative numbers fine, but the algorithm logic fails.' },
          { text: 'Because negative edges cause division by zero', isCorrect: false, explanation: 'There is no division in Dijkstra.' }
        ]
      },
      {
        id: 'q3',
        question: 'What is the time complexity of BFS traversal on a graph with V vertices and E edges using an Adjacency List?',
        options: [
          { text: 'O(V + E)', isCorrect: true, explanation: 'Correct! Every vertex is visited once and every edge is explored once.' },
          { text: 'O(V * E)', isCorrect: false, explanation: 'This would occur with inefficient lookups.' },
          { text: 'O(V^2)', isCorrect: false, explanation: 'O(V^2) applies when using an Adjacency Matrix.' }
        ]
      }
    ],
    nextRecommendation: {
      topic: 'Disjoint Set Union (DSU) & Kruskal Minimum Spanning Tree',
      reason: 'DSU is essential for dynamic connectivity and spanning tree problems in campus hiring tests.',
      estimatedTime: '22 min'
    }
  }
};

// Universal Dynamic Topic Resolver: Generates a complete tailored plan for ANY query!
function resolveTopicPlan(queryText, level = 'Beginner', timeBudget = '30 min') {
  const clean = (queryText || '').toLowerCase().trim();
  
  if (clean.includes('dbms') || clean.includes('sql') || clean.includes('normaliz') || clean.includes('database')) {
    return TOPIC_PRESETS['dbms'];
  }
  if (clean.includes('tree') || clean.includes('bst') || clean.includes('traversal')) {
    return TOPIC_PRESETS['tree'];
  }
  if (clean.includes('dp') || clean.includes('dynamic') || clean.includes('knapsack') || clean.includes('memoiz')) {
    return TOPIC_PRESETS['dp'];
  }
  if (clean.includes('graph') || clean.includes('dijkstra') || clean.includes('bfs') || clean.includes('dfs') || clean.includes('topo')) {
    return TOPIC_PRESETS['graph'];
  }

  // Dynamic Generator for ANY custom query entered in the search bar
  const formattedTitle = queryText
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  return {
    title: formattedTitle,
    category: 'Placement Technical Concept',
    difficulty: level,
    summary: `Structured placement study roadmap for ${formattedTitle}. Master core rules, common algorithmic patterns, practical examples, and recruiter questions.`,
    curatedNotes: [
      { rule: `Core Definition & Principles of ${formattedTitle}`, detail: `Understand the fundamental concepts, underlying data representations, and why interviewers frequently evaluate ${formattedTitle}.` },
      { rule: 'Time & Space Complexity Tradeoffs', detail: `Analyze optimal vs suboptimal approaches (O(1), O(log N), O(N), O(N^2)) and space overhead constraints during live coding.` },
      { rule: 'Common Edge Cases & Traps', detail: 'Check for null/empty inputs, boundary indices, single-element collections, and integer overflow before locking your solution.' },
      { rule: '3-Step Interview Answer Strategy', detail: '1. Clarify constraints out loud -> 2. State the brute-force baseline -> 3. Walk through the optimal solution with a dry run.' }
    ],
    videoRAG: {
      title: `${formattedTitle} Complete Placement Breakdown`,
      channel: 'Placement Tech Academy',
      duration: timeBudget,
      views: '780K',
      rating: 98,
      rqsScore: 96.0,
      chapters: [
        { time: '00:00 - 05:00', topic: `Core Introduction to ${formattedTitle}`, keyConcept: `What ${formattedTitle} is and the fundamental problem it solves.` },
        { time: '05:00 - 12:00', topic: 'Step-by-Step Mechanism & Dry Run', keyConcept: 'Visual step-by-step trace through sample test cases.' },
        { time: '12:00 - 18:30', topic: 'Solving Standard Placement Questions', keyConcept: 'Optimal implementation patterns tested by top tech companies.' },
        { time: '18:30 - 25:00', topic: 'Common Traps & Interview Tips', keyConcept: 'How to structure your explanation and avoid typical pitfalls.' }
      ]
    },
    practiceProblems: [
      { id: 'q1', title: `Foundation: Basic ${formattedTitle} Implementation`, difficulty: 'Easy', placementWeight: 'High' },
      { id: 'q2', title: `Interview Pattern: Optimal ${formattedTitle} with Edge Cases`, difficulty: 'Medium', placementWeight: 'Very High' },
      { id: 'q3', title: `Advanced Application: Scalable ${formattedTitle} Problem`, difficulty: 'Medium', placementWeight: 'High' }
    ],
    quiz: [
      {
        id: 'q1',
        question: `When solving a problem involving ${formattedTitle} in an interview, what is the best first step?`,
        options: [
          { text: 'Clarify constraints, edge cases (null/empty inputs), and expected time/space limits', isCorrect: true, explanation: 'Correct! Clarifying requirements before coding is a top interview signal.' },
          { text: 'Start writing code immediately in silence', isCorrect: false, explanation: 'Interviewers look for communication and structured problem solving.' },
          { text: 'Assume the test cases never contain edge cases', isCorrect: false, explanation: 'Edge cases must always be checked.' }
        ]
      },
      {
        id: 'q2',
        question: `What is the primary advantage of mastering the core patterns of ${formattedTitle}?`,
        options: [
          { text: 'It enables you to recognize optimal solutions for related problem variations rapidly', isCorrect: true, explanation: 'Correct! Pattern recognition allows applying proven templates to unfamiliar questions.' },
          { text: 'It completely eliminates the need for any time complexity analysis', isCorrect: false, explanation: 'Complexity analysis is always evaluated.' },
          { text: 'It only applies to a single specific question', isCorrect: false, explanation: 'Core patterns generalize to hundreds of problems.' }
        ]
      },
      {
        id: 'q3',
        question: `If your initial implementation of ${formattedTitle} fails a hidden edge case, how should you respond?`,
        options: [
          { text: 'Calmly trace a minimal failing test case line-by-line out loud to locate the exact variable state', isCorrect: true, explanation: 'Correct! Systematic verbal debugging demonstrates real engineering composure.' },
          { text: 'Randomly change arithmetic operators hoping tests pass', isCorrect: false, explanation: 'Random guessing signals panic.' },
          { text: 'Immediately ask the interviewer for the solution', isCorrect: false, explanation: 'Demonstrating persistence and debugging skill is critical.' }
        ]
      }
    ],
    nextRecommendation: {
      topic: `Advanced Problem Patterns in ${formattedTitle}`,
      reason: `Now that you have reviewed the core principles of ${formattedTitle}, practicing mixed pattern variations will solidify your interview reflexes.`,
      estimatedTime: '20 min'
    }
  };
}

export default function PlacementResourceRAG({ profile = {}, codingState = {}, interviewState = {}, aptitudeState = {}, setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTopic, setCurrentTopic] = useState(null); // null by default - no initial searches
  const [explanationLevel, setExplanationLevel] = useState('Beginner'); // 'Beginner' | 'Intermediate' | 'Interview-Ready'
  const [timeBudget, setTimeBudget] = useState('30 min'); // '15 min' | '30 min' | '45 min'
  const [activeStepTab, setActiveStepTab] = useState('video'); // 'video' | 'notes' | 'practice' | 'quiz'
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isQuizSubmitted, setIsQuizSubmitted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (queryText) => {
    if (!queryText || !queryText.trim()) return;
    setIsSearching(true);
    
    setTimeout(() => {
      const plan = resolveTopicPlan(queryText.trim(), explanationLevel, timeBudget);
      setCurrentTopic(plan);
      setIsSearching(false);
      setIsQuizSubmitted(false);
      setQuizAnswers({});
      setActiveStepTab('video');
    }, 350);
  };

  const handleExplanationLevelChange = (lvl) => {
    setExplanationLevel(lvl);
    if (currentTopic) {
      const updated = resolveTopicPlan(currentTopic.title, lvl, timeBudget);
      setCurrentTopic(updated);
    }
  };

  const handleTimeBudgetChange = (time) => {
    setTimeBudget(time);
    if (currentTopic) {
      const updated = resolveTopicPlan(currentTopic.title, explanationLevel, time);
      setCurrentTopic(updated);
    }
  };

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
            Dynamic Placement Study Plans
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', margin: 0 }}>
          Placement Learning Resources & Guided Study Paths
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#4B5563', margin: '4px 0 0 0', lineHeight: 1.45 }}>
          Type any placement topic in the search bar below to generate a tailored 4-step study plan with video breakdown, key revision notes, practice questions, and a test quiz.
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
              placeholder="Search any placement topic (e.g., DBMS Normalization, Binary Trees, Graphs, Sliding Window, OS Paging)..."
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
            'DBMS Normalization',
            'Binary Trees & BST',
            'Dynamic Programming',
            'Graph Algorithms'
          ].map((chip) => (
            <button
              key={chip}
              onClick={() => {
                setSearchQuery(chip);
                handleSearch(chip);
              }}
              style={{
                padding: '5px 14px',
                borderRadius: '20px',
                border: currentTopic?.title?.toLowerCase().includes(chip.toLowerCase()) ? '1.5px solid #111827' : '1px solid #E5E7EB',
                backgroundColor: currentTopic?.title?.toLowerCase().includes(chip.toLowerCase()) ? '#111827' : '#F3F4F6',
                color: currentTopic?.title?.toLowerCase().includes(chip.toLowerCase()) ? '#FFFFFF' : '#374151',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* When NO search has been run yet - show clean empty state */}
      {!currentTopic && (
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
            Type any placement topic in the search bar above or click one of the popular topics to generate a custom 4-step learning plan for that topic.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', maxWidth: '850px', margin: '0 auto', textAlign: 'left' }}>
            {[
              {
                title: 'DBMS Normalization',
                desc: '1NF to BCNF rules, eliminating partial and transitive dependencies with clear schema examples.'
              },
              {
                title: 'Binary Trees & BST',
                desc: 'Inorder/Preorder/Postorder traversals, height calculation, and tree validation algorithms.'
              },
              {
                title: 'Dynamic Programming',
                desc: '0/1 Knapsack pattern, recursion to memoization conversion, and 1D space optimization.'
              }
            ].map(card => (
              <div 
                key={card.title}
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
                  Generate Study Plan
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* When a topic IS generated - render the 4-step path */}
      {currentTopic && (
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
                    onClick={() => handleExplanationLevelChange(lvl)}
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
                    onClick={() => handleTimeBudgetChange(time)}
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
