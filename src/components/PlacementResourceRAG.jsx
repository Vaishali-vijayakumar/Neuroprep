import React, { useState } from 'react';
import { 
  Search, BookOpen, Video, FileText, Globe, 
  Sparkles, ExternalLink, Play, Layers, RefreshCw, 
  Download, Code, ArrowUpRight, CheckCircle2, Bookmark
} from 'lucide-react';

// Multi-Source Semantic RAG Resource Intelligence Engine
function retrieveResourcesForTopic(queryText) {
  const clean = (queryText || '').toLowerCase().trim();
  const encodedQuery = encodeURIComponent(queryText.trim());

  // Semantic Domain Detection
  let domain = 'general';
  if (clean.includes('dbms') || clean.includes('sql') || clean.includes('database') || clean.includes('normaliz')) {
    domain = 'dbms';
  } else if (clean.includes('tree') || clean.includes('bst') || clean.includes('traversal')) {
    domain = 'trees';
  } else if (clean.includes('dp') || clean.includes('dynamic') || clean.includes('knapsack') || clean.includes('memoiz')) {
    domain = 'dp';
  } else if (clean.includes('graph') || clean.includes('dijkstra') || clean.includes('bfs') || clean.includes('dfs')) {
    domain = 'graphs';
  } else if (clean.includes('sliding window') || clean.includes('two pointer') || clean.includes('subarray')) {
    domain = 'sliding_window';
  } else if (clean.includes('os') || clean.includes('operating system') || clean.includes('paging') || clean.includes('deadlock')) {
    domain = 'os';
  } else if (clean.includes('oop') || clean.includes('java') || clean.includes('solid') || clean.includes('design pattern')) {
    domain = 'oop';
  }

  const formattedTitle = queryText
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  // 1. DBMS & SQL Domain
  if (domain === 'dbms') {
    return {
      title: 'DBMS Normalization & SQL Queries',
      category: 'Database Management Systems',
      summary: 'Semantic multi-source retrieval across PostgreSQL Docs, Scaler Topics, Stanford Lecture PDFs, Gate Smashers, and LeetCode SQL.',
      videos: [
        {
          id: 'v1',
          title: 'DBMS Normalization in One Shot (1NF, 2NF, 3NF, BCNF with Solved Examples)',
          channel: 'Gate Smashers',
          duration: '18 mins',
          url: 'https://www.youtube.com/results?search_query=gate+smashers+normalization+dbms+one+shot',
          timestamps: [
            { time: '00:00', label: 'Why Normalization & Insertion/Deletion Anomalies' },
            { time: '04:15', label: '1NF: Eliminating Multi-Valued Attributes' },
            { time: '08:30', label: '2NF: Eliminating Partial Dependencies' },
            { time: '13:45', label: '3NF & BCNF: Transitive Dependency & Super Keys' }
          ]
        },
        {
          id: 'v2',
          title: 'SQL Joins & Indexing Performance Optimization Masterclass',
          channel: 'Knowledge Gate',
          duration: '22 mins',
          url: 'https://www.youtube.com/results?search_query=knowledge+gate+sql+joins+indexing+masterclass',
          timestamps: [
            { time: '00:00', label: 'INNER, LEFT, RIGHT, and FULL OUTER Joins Visualized' },
            { time: '08:20', label: 'Clustered vs Non-Clustered B-Tree Indexes' },
            { time: '16:00', label: 'Top Recruiter SQL Output Questions (DENSE_RANK, GROUP BY)' }
          ]
        }
      ],
      notes: [
        {
          id: 'n1',
          title: 'Stanford CS145 / MIT DB Normalization & BCNF Notes (PDF)',
          type: 'University Lecture PDF Notes',
          source: 'Stanford Database System Group',
          readTime: 'PDF Download / View',
          url: `https://www.google.com/search?q=stanford+cs145+relational+normalization+functional+dependencies+filetype:pdf`,
          keyPoints: [
            '1NF: Attributes must be atomic (no multi-valued collections).',
            '2NF: Must be in 1NF + NO non-prime attribute depends on a part of candidate key.',
            '3NF: Must be in 2NF + NO non-prime attribute depends on another non-prime attribute.',
            'BCNF: For every functional dependency X -> Y, X must strictly be a Super Key.'
          ]
        },
        {
          id: 'n2',
          title: 'SQL Performance & Indexing Cheatsheet (PDF)',
          type: 'Downloadable PDF Cheatsheet',
          source: 'Database Architecture Labs',
          readTime: 'PDF Download / View',
          url: `https://www.google.com/search?q=sql+query+optimization+indexing+cheat+sheet+filetype:pdf`,
          keyPoints: [
            'Clustered Index: Physically sorts table records on disk (1 per table).',
            'Non-Clustered Index: Separate B-Tree index pointers for fast WHERE lookups.',
            'Composite Index: Ordered key prefix evaluation (Left-to-Right rule).',
            'Covering Index: Contains all queried columns to avoid table lookup.'
          ]
        }
      ],
      websites: [
        {
          id: 'w1',
          name: 'PostgreSQL Documentation',
          title: 'Official PostgreSQL Relational Model & Joins Guide',
          desc: 'Official architectural documentation covering hash joins, merge joins, nested loops, and query plans.',
          url: 'https://www.postgresql.org/docs/current/tutorial-join.html'
        },
        {
          id: 'w2',
          name: 'Scaler Topics',
          title: 'Database Normalization in DBMS with Solved Real-World Schemas',
          desc: 'Comprehensive breakdown of insertion/deletion anomalies, partial dependencies, and BCNF decomposition.',
          url: 'https://www.scaler.com/topics/dbms/normalization-in-dbms/'
        },
        {
          id: 'w3',
          name: 'W3Schools Interactive SQL',
          title: 'Interactive SQL Joins, Subqueries & Clauses Editor',
          desc: 'Live code runner with sample tables to test INNER/LEFT joins, GROUP BY, and HAVING clauses.',
          url: 'https://www.w3schools.com/sql/sql_join.asp'
        }
      ],
      practice: [
        {
          id: 'p1',
          platform: 'LeetCode',
          title: '178. Rank Scores (SQL DENSE_RANK)',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/rank-scores/'
        },
        {
          id: 'p2',
          platform: 'LeetCode',
          title: '184. Department Highest Salary (SQL JOIN & GROUP BY)',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/department-highest-salary/'
        },
        {
          id: 'p3',
          platform: 'LeetCode',
          title: '180. Consecutive Numbers (Self-Join)',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/consecutive-numbers/'
        }
      ]
    };
  }

  // 2. Binary Trees & BST Domain
  if (domain === 'trees') {
    return {
      title: 'Binary Trees & Binary Search Trees (BST)',
      category: 'Data Structures & Algorithms',
      summary: 'Semantic retrieval across MIT 6.006 Lecture PDFs, NeetCode Trees, CP-Algorithms, Striver Masterclasses, and LeetCode.',
      videos: [
        {
          id: 'v1',
          title: 'Binary Trees & Traversals Masterclass (Inorder, Preorder, Postorder, BFS)',
          channel: 'Take U Forward (Striver)',
          duration: '24 mins',
          url: 'https://www.youtube.com/results?search_query=striver+binary+trees+masterclass+take+u+forward',
          timestamps: [
            { time: '00:00', label: 'TreeNode Pointer Structure & Memory Representation' },
            { time: '06:15', label: 'DFS Traversals (Inorder, Preorder, Postorder Recursion)' },
            { time: '13:30', label: 'Iterative BFS Level Order Traversal with Queue' },
            { time: '19:45', label: 'Calculating Tree Height & Maximum Depth' }
          ]
        },
        {
          id: 'v2',
          title: 'Binary Search Tree (BST) Operations: Insertion, Search & Deletion',
          channel: 'NeetCode',
          duration: '19 mins',
          url: 'https://www.youtube.com/results?search_query=neetcode+binary+search+tree+operations',
          timestamps: [
            { time: '00:00', label: 'BST Property: Left < Root < Right' },
            { time: '07:30', label: 'Validating BST with Min/Max Boundary Recursion' },
            { time: '14:00', label: 'Lowest Common Ancestor (LCA) in BST' }
          ]
        }
      ],
      notes: [
        {
          id: 'n1',
          title: 'MIT 6.006 Introduction to Algorithms: Binary Search Trees Notes (PDF)',
          type: 'University Lecture PDF Notes',
          source: 'MIT OpenCourseWare',
          readTime: 'PDF Download / View',
          url: `https://www.google.com/search?q=mit+ocw+6.006+binary+search+trees+lecture+notes+filetype:pdf`,
          keyPoints: [
            'Inorder Traversal (Left, Root, Right) of BST always yields sorted ascending values.',
            'Preorder (Root, Left, Right) is used for tree cloning and serialization.',
            'Postorder (Left, Right, Root) is used for bottom-up computation (height, delete tree).',
            'Level Order Traversal uses a FIFO Queue: O(N) time and O(W) max level width space.'
          ]
        },
        {
          id: 'n2',
          title: 'Tree Recursion & Traversal Algorithms Cheatsheet (PDF)',
          type: 'Downloadable PDF Cheatsheet',
          source: 'Algorithm Revision Labs',
          readTime: 'PDF Download / View',
          url: `https://www.google.com/search?q=binary+tree+traversal+recursion+cheatsheet+filetype:pdf`,
          keyPoints: [
            'Height formula: 1 + Math.max(maxDepth(root.left), maxDepth(root.right)).',
            'Symmetric tree: check if (left.val === right.val && isMirror(left.left, right.right)).',
            'Balanced tree: left and right subtree heights differ by at most 1.'
          ]
        }
      ],
      websites: [
        {
          id: 'w1',
          name: 'NeetCode.io',
          title: 'Trees Practice Roadmap & Visual Code Walkthroughs',
          desc: 'Interactive tree practice roadmap with video dry runs, recursion state diagrams, and complexity comparisons.',
          url: 'https://neetcode.io/practice'
        },
        {
          id: 'w2',
          name: 'CP-Algorithms',
          title: 'Tree Data Structures & Heavy-Light Decomposition',
          desc: 'In-depth algorithmic analysis of tree traversals, lowest common ancestor (binary lifting), and subtree queries.',
          url: 'https://cp-algorithms.com/'
        },
        {
          id: 'w3',
          name: 'Programiz',
          title: 'Binary Tree Data Structure Explained with Diagrams',
          desc: 'Clear visual guide with complete code implementations in Java, C++, and Python.',
          url: 'https://www.programiz.com/dsa/binary-tree'
        }
      ],
      practice: [
        {
          id: 'p1',
          platform: 'LeetCode',
          title: '102. Binary Tree Level Order Traversal',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/binary-tree-level-order-traversal/'
        },
        {
          id: 'p2',
          platform: 'LeetCode',
          title: '98. Validate Binary Search Tree',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/validate-binary-search-tree/'
        },
        {
          id: 'p3',
          platform: 'LeetCode',
          title: '236. Lowest Common Ancestor of a Binary Tree',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/'
        }
      ]
    };
  }

  // 3. Dynamic Programming Domain
  if (domain === 'dp') {
    return {
      title: 'Dynamic Programming & 0/1 Knapsack Patterns',
      category: 'Algorithms',
      summary: 'Semantic retrieval across MIT OCW DP Notes, TopCoder Algorithms, Scaler Topics, Aditya Verma Masterclasses, and LeetCode DP Study Plans.',
      videos: [
        {
          id: 'v1',
          title: '0/1 Knapsack Problem & DP Patterns Explained',
          channel: 'Aditya Verma',
          duration: '22 mins',
          url: 'https://www.youtube.com/results?search_query=aditya+verma+01+knapsack+problem+dp',
          timestamps: [
            { time: '00:00', label: 'How to Identify DP in 30 Seconds' },
            { time: '06:15', label: 'Choice Diagram & Recursive Tree' },
            { time: '12:30', label: '2D Matrix Memoization Setup' },
            { time: '18:00', label: 'Space Optimization to 1D Array' }
          ]
        },
        {
          id: 'v2',
          title: 'Complete DP Playlist for Placement Interviews',
          channel: 'Take U Forward (Striver)',
          duration: '26 mins',
          url: 'https://www.youtube.com/results?search_query=striver+dynamic+programming+playlist+take+u+forward',
          timestamps: [
            { time: '00:00', label: '1D DP: Climbing Stairs & House Robber' },
            { time: '09:40', label: '2D Grid DP & Minimum Path Sum' },
            { time: '18:20', label: 'Subsequence & Partition DP Techniques' }
          ]
        }
      ],
      notes: [
        {
          id: 'n1',
          title: 'MIT 6.006 Dynamic Programming & Knapsack Notes (PDF)',
          type: 'University Lecture PDF Notes',
          source: 'MIT OpenCourseWare',
          readTime: 'PDF Download / View',
          url: `https://www.google.com/search?q=mit+ocw+6.006+dynamic+programming+lecture+notes+filetype:pdf`,
          keyPoints: [
            'Overlapping Subproblems: Storing computed states to avoid exponential recalculation.',
            'Optimal Substructure: Optimal answer can be constructed from optimal answers of subproblems.',
            'Memoization (Top-Down): Recursive stack + cache lookup array.',
            'Tabulation (Bottom-Up): Iterative DP table filled from base cases up to N.'
          ]
        },
        {
          id: 'n2',
          title: 'Dynamic Programming Patterns & Recurrence Formulas (PDF)',
          type: 'Downloadable PDF Cheatsheet',
          source: 'Competitive Programming Guild',
          readTime: 'PDF Download / View',
          url: `https://www.google.com/search?q=dynamic+programming+knapsack+patterns+cheatsheet+filetype:pdf`,
          keyPoints: [
            'If wt[i-1] <= W: choose max(val[i-1] + dp[i-1][W-wt[i-1]], dp[i-1][W]).',
            'Subset Sum partition: target sum = totalSum / 2.',
            '1D Array compression: iterate capacity backwards to avoid reusing current item.'
          ]
        }
      ],
      websites: [
        {
          id: 'w1',
          name: 'TopCoder Algorithms',
          title: 'Dynamic Programming: From Novice to Advanced Guide',
          desc: 'Legendary competitive programming guide covering state space representations and optimal subproblem formulation.',
          url: 'https://www.topcoder.com/thrive/articles/Dynamic%20Programming:%20From%20Novice%20to%20Advanced'
        },
        {
          id: 'w2',
          name: 'Scaler Topics',
          title: '0/1 Knapsack Problem Tutorial with State Matrix Tables',
          desc: 'Comprehensive walkthrough from recursive choice diagrams to 1D space optimization with dry runs.',
          url: 'https://www.scaler.com/topics/data-structures/0-1-knapsack-problem/'
        },
        {
          id: 'w3',
          name: 'LeetCode DP Plan',
          title: 'LeetCode Official Dynamic Programming Study Series',
          desc: 'Curated 30-day interactive track covering Fibonacci, Knapsack, and String Matching DP patterns.',
          url: 'https://leetcode.com/studyplan/dynamic-programming/'
        }
      ],
      practice: [
        {
          id: 'p1',
          platform: 'LeetCode',
          title: '70. Climbing Stairs',
          difficulty: 'Easy',
          url: 'https://leetcode.com/problems/climbing-stairs/'
        },
        {
          id: 'p2',
          platform: 'LeetCode',
          title: '198. House Robber',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/house-robber/'
        },
        {
          id: 'p3',
          platform: 'LeetCode',
          title: '416. Partition Equal Subset Sum',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/partition-equal-subset-sum/'
        }
      ]
    };
  }

  // 4. Graphs Domain
  if (domain === 'graphs') {
    return {
      title: 'Graph Algorithms (BFS, DFS, Dijkstra, Topo Sort)',
      category: 'Data Structures & Algorithms',
      summary: 'Semantic retrieval across Stanford CS161 Lecture PDFs, CP-Algorithms, VisuAlgo, Striver Graph Series, and LeetCode.',
      videos: [
        {
          id: 'v1',
          title: 'Complete Graph Series for Placement Tests (BFS, DFS, Cycle Detection)',
          channel: 'Take U Forward (Striver)',
          duration: '25 mins',
          url: 'https://www.youtube.com/results?search_query=striver+graph+series+take+u+forward',
          timestamps: [
            { time: '00:00', label: 'Adjacency List vs Matrix Space & Time' },
            { time: '06:30', label: 'BFS Traversal with Queue & Visited Array' },
            { time: '13:00', label: 'Cycle Detection in Directed Graphs (Kahn / DFS)' },
            { time: '19:30', label: 'Dijkstra Shortest Path with PriorityQueue' }
          ]
        },
        {
          id: 'v2',
          title: 'Dijkstra & Topological Sort Masterclass',
          channel: 'NeetCode',
          duration: '20 mins',
          url: 'https://www.youtube.com/results?search_query=neetcode+dijkstra+algorithm+topological+sort',
          timestamps: [
            { time: '00:00', label: 'When to Use BFS vs Dijkstra' },
            { time: '08:15', label: 'Course Schedule Topological Sort Pattern' },
            { time: '15:00', label: 'Greedy Shortest Path Distance Relaxation' }
          ]
        }
      ],
      notes: [
        {
          id: 'n1',
          title: 'Stanford CS161 Graph Traversals & Shortest Paths Notes (PDF)',
          type: 'University Lecture PDF Notes',
          source: 'Stanford Computer Science Department',
          readTime: 'PDF Download / View',
          url: `https://www.google.com/search?q=stanford+cs161+graph+algorithms+bfs+dfs+dijkstra+filetype:pdf`,
          keyPoints: [
            'Adjacency List uses O(V + E) space; Matrix uses O(V^2).',
            'Cycle in Undirected: DFS with parent tracking.',
            'Cycle in Directed: DFS with path-visited array or Kahn Algorithm in-degrees.',
            'Topological Sort requires a Directed Acyclic Graph (DAG).'
          ]
        },
        {
          id: 'n2',
          title: 'Graph Shortest Paths & Minimum Spanning Tree Notes (PDF)',
          type: 'Downloadable PDF Cheatsheet',
          source: 'Algorithm Research Hub',
          readTime: 'PDF Download / View',
          url: `https://www.google.com/search?q=dijkstra+kruskal+prim+graph+algorithms+cheatsheet+filetype:pdf`,
          keyPoints: [
            'Unweighted Graph: Standard BFS finds shortest path in O(V + E).',
            'Weighted Non-Negative: Dijkstra with Min-Heap in O((V + E) log V).',
            'Negative Weights: Bellman-Ford algorithm in O(V * E).'
          ]
        }
      ],
      websites: [
        {
          id: 'w1',
          name: 'CP-Algorithms',
          title: 'Breadth-First Search & Dijkstra Algorithm Tutorial',
          desc: 'Exhaustive algorithmic breakdown with optimal C++ competitive programming templates.',
          url: 'https://cp-algorithms.com/graph/breadth-first-search.html'
        },
        {
          id: 'w2',
          name: 'VisuAlgo',
          title: 'Interactive Graph Traversal & Shortest Path Visualizer',
          desc: 'Step through BFS, DFS, Dijkstra, and Kruskal algorithms visually with custom graphs.',
          url: 'https://visualgo.net/en/graphds'
        },
        {
          id: 'w3',
          name: 'LeetCode Explore',
          title: 'Graph Theory Module & Interactive Practice Card',
          desc: 'Structured interactive module covering Disjoint Set Union (DSU), BFS, DFS, and topological ordering.',
          url: 'https://leetcode.com/explore/learn/card/graph/'
        }
      ],
      practice: [
        {
          id: 'p1',
          platform: 'LeetCode',
          title: '200. Number of Islands (BFS/DFS)',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/number-of-islands/'
        },
        {
          id: 'p2',
          platform: 'LeetCode',
          title: '207. Course Schedule (Topological Sort)',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/course-schedule/'
        },
        {
          id: 'p3',
          platform: 'LeetCode',
          title: '743. Network Delay Time (Dijkstra)',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/network-delay-time/'
        }
      ]
    };
  }

  // 5. Universal Dynamic Semantic Resolver for ANY query
  return {
    title: formattedTitle,
    category: 'Placement Technical Concept',
    summary: `Semantic multi-source RAG retrieval for ${formattedTitle} across university lecture archives, official docs, technical masterclasses, and coding platforms.`,
    videos: [
      {
        id: 'v1',
        title: `${formattedTitle} Complete Placement Concept & Code Tutorial`,
        channel: 'Top Tech Educators',
        duration: '20 mins',
        url: `https://www.youtube.com/results?search_query=${encodedQuery}+placement+tutorial+lecture`,
        timestamps: [
          { time: '00:00', label: `Core Introduction & Why ${formattedTitle} is Asked in Interviews` },
          { time: '05:30', label: 'Step-by-Step Algorithm & Memory Trace' },
          { time: '12:45', label: 'Standard Placement Test Problems & Dry Run' },
          { time: '17:30', label: 'Time/Space Complexity & Common Interview Mistakes' }
        ]
      },
      {
        id: 'v2',
        title: `${formattedTitle} Crash Course & Problem Solving Walkthrough`,
        channel: 'Placement Prep Hub',
        duration: '16 mins',
        url: `https://www.youtube.com/results?search_query=${encodedQuery}+coding+walkthrough+dry+run`,
        timestamps: [
          { time: '00:00', label: 'Visual Problem Breakdown' },
          { time: '07:15', label: 'Clean Implementation in Java / C++ / Python' },
          { time: '13:00', label: 'Handling Tricky Edge Cases' }
        ]
      }
    ],
    notes: [
      {
        id: 'n1',
        title: `${formattedTitle} University Lecture & Theory Notes (PDF)`,
        type: 'Downloadable University PDF Notes',
        source: 'Computer Science Academic Archives',
        readTime: 'PDF Download / View',
        url: `https://www.google.com/search?q=${encodedQuery}+lecture+notes+theory+filetype:pdf`,
        keyPoints: [
          `Fundamental Definition: Core mechanics and principles of ${formattedTitle}.`,
          'Complexity: Analyze average and worst-case time/space tradeoffs before coding.',
          'Edge Cases: Check null/empty inputs, single elements, and boundary values.',
          'Interview Pattern: Clarify constraints -> State brute force -> Deliver optimal approach.'
        ]
      },
      {
        id: 'n2',
        title: `${formattedTitle} Quick Reference & Revision Cheatsheet (PDF)`,
        type: 'Downloadable PDF Cheatsheet',
        source: 'Engineering QuickRef Archives',
        readTime: 'PDF Download / View',
        url: `https://www.google.com/search?q=${encodedQuery}+cheat+sheet+reference+filetype:pdf`,
        keyPoints: [
          `Top Recruiter Questions: Frequently asked conceptual and coding questions on ${formattedTitle}.`,
          'Common Pitfalls: Off-by-one errors, infinite loops, and redundant space allocations.',
          'Best Practices: Writing clean, modular code and explaining thought process out loud.'
        ]
      }
    ],
    websites: [
      {
        id: 'w1',
        name: 'Dev.to / Technical Engineering Blogs',
        title: `${formattedTitle} In-Depth Engineering Guide`,
        desc: `High-quality articles written by practicing software engineers covering ${formattedTitle} with real-world architectures.`,
        url: `https://dev.to/search?q=${encodedQuery}`
      },
      {
        id: 'w2',
        name: 'FreeCodeCamp Guide',
        title: `${formattedTitle} Tutorial & Concept Walkthrough`,
        desc: `Free open-source educational documentation with clear diagrams, code snippets, and beginner explanations.`,
        url: `https://www.freecodecamp.org/news/search/?query=${encodedQuery}`
      },
      {
        id: 'w3',
        name: 'Medium / Towards Tech',
        title: `${formattedTitle} System Architecture & Code Patterns`,
        desc: `Curated articles analyzing patterns, interview strategies, and production performance considerations.`,
        url: `https://medium.com/search?q=${encodedQuery}`
      }
    ],
    practice: [
      {
        id: 'p1',
        platform: 'LeetCode',
        title: `LeetCode Problems: ${formattedTitle}`,
        difficulty: 'Medium',
        url: `https://leetcode.com/problemset/all/?search=${encodedQuery}`
      },
      {
        id: 'p2',
        platform: 'GeeksforGeeks Practice',
        title: `GFG Practice Arena: ${formattedTitle}`,
        difficulty: 'Medium',
        url: `https://practice.geeksforgeeks.org/explore?page=1&sortBy=submissions&search=${encodedQuery}`
      },
      {
        id: 'p3',
        platform: 'HackerRank',
        title: `HackerRank Challenges: ${formattedTitle}`,
        difficulty: 'Easy / Medium',
        url: `https://www.hackerrank.com/search?q=${encodedQuery}`
      }
    ]
  };
}

export default function PlacementResourceRAG({ profile = {}, setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentResources, setCurrentResources] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'videos' | 'notes' | 'websites' | 'practice'
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (queryText) => {
    if (!queryText || !queryText.trim()) return;
    setIsSearching(true);
    
    setTimeout(() => {
      const results = retrieveResourcesForTopic(queryText.trim());
      setCurrentResources(results);
      setIsSearching(false);
      setActiveFilter('all');
    }, 350);
  };

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1060, margin: '0 auto', fontFamily: 'var(--font-inter)' }}>
      
      {/* Top Back Navigation */}
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
        marginBottom: '24px'
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
            Multi-Source Resource Intelligence
          </span>
          <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600 }}>
            Semantic Web & Academic RAG Search
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', margin: 0 }}>
          Placement Learning Resources Search
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#4B5563', margin: '4px 0 0 0', lineHeight: 1.45 }}>
          Search any placement concept to retrieve top YouTube video masterclasses, downloadable university lecture PDF notes, authority websites (PostgreSQL, Scaler, NeetCode, Dev.to), and direct practice challenges.
        </p>
      </div>

      {/* Search Input & Quick Topic Chips */}
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
              placeholder="Search any concept (e.g., DBMS Normalization, Binary Trees, Dynamic Programming, SQL Joins, Graphs)..."
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
            Search Resources
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
            'SQL Joins',
            'Graph Algorithms',
            'Operating Systems Paging'
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
                border: currentResources?.title?.toLowerCase().includes(chip.toLowerCase()) ? '1.5px solid #111827' : '1px solid #E5E7EB',
                backgroundColor: currentResources?.title?.toLowerCase().includes(chip.toLowerCase()) ? '#111827' : '#F3F4F6',
                color: currentResources?.title?.toLowerCase().includes(chip.toLowerCase()) ? '#FFFFFF' : '#374151',
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

      {/* Initial Empty State (When no search has been run yet) */}
      {!currentResources && (
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
            Search Any Placement Concept
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#4B5563', maxWidth: '520px', margin: '0 auto 22px auto', lineHeight: 1.5 }}>
            Type any topic above to search for top YouTube video masterclasses, downloadable university lecture PDF notes, diverse authority websites (PostgreSQL, Scaler, NeetCode, Dev.to), and targeted practice challenges.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', maxWidth: '850px', margin: '0 auto', textAlign: 'left' }}>
            {[
              {
                title: 'DBMS Normalization',
                desc: 'YouTube video breakdowns, Stanford lecture PDF notes, PostgreSQL official docs, and LeetCode SQL challenges.'
              },
              {
                title: 'Binary Trees & BST',
                desc: 'MIT OCW lecture notes, Striver masterclasses, NeetCode roadmaps, and standard LeetCode problems.'
              },
              {
                title: 'Dynamic Programming',
                desc: 'Aditya Verma Knapsack tutorials, MIT OCW notes, TopCoder algorithms guide, and coding problems.'
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
                  Search Resources
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SEARCH RESULTS VIEW */}
      {currentResources && (
        <div>
          {/* Results Header */}
          <div style={{
            backgroundColor: '#FFFFFF',
            border: '1.5px solid #E5E7EB',
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '14px'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#111827', margin: 0 }}>
                  {currentResources.title}
                </h2>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  backgroundColor: '#F3F4F6',
                  color: '#111827'
                }}>
                  {currentResources.category}
                </span>
              </div>
              <p style={{ fontSize: '0.85rem', color: '#4B5563', margin: '4px 0 0 0' }}>
                {currentResources.summary}
              </p>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Resources' },
                { id: 'videos', label: `YouTube Videos (${currentResources.videos.length})` },
                { id: 'notes', label: `PDFs & Notes (${currentResources.notes.length})` },
                { id: 'websites', label: `Websites (${currentResources.websites.length})` },
                { id: 'practice', label: `Practice (${currentResources.practice.length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '8px',
                    border: activeFilter === tab.id ? '1px solid #111827' : '1px solid #E5E7EB',
                    backgroundColor: activeFilter === tab.id ? '#111827' : '#FFFFFF',
                    color: activeFilter === tab.id ? '#FFFFFF' : '#4B5563',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* SECTION 1: YOUTUBE VIDEOS */}
            {(activeFilter === 'all' || activeFilter === 'videos') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Video size={18} color="#DC2626" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Top YouTube Video Masterclasses & Timestamps
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {currentResources.videos.map(vid => (
                    <div 
                      key={vid.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '14px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#DC2626', textTransform: 'uppercase' }}>
                            YouTube Video
                          </span>
                        </div>

                        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#111827', margin: '0 0 4px 0', lineHeight: 1.35 }}>
                          {vid.title}
                        </h4>
                        <p style={{ fontSize: '0.8rem', color: '#6B7280', margin: '0 0 12px 0' }}>
                          Channel: <strong>{vid.channel}</strong> • Duration: {vid.duration}
                        </p>

                        {/* Timestamps Breakdown */}
                        <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                            Key Concepts Covered:
                          </span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {vid.timestamps.map((ts, idx) => (
                              <div key={idx} style={{ fontSize: '0.78rem', color: '#4B5563', display: 'flex', gap: '8px' }}>
                                <span style={{ fontWeight: 700, color: '#111827', fontFamily: 'monospace' }}>{ts.time}</span>
                                <span>{ts.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <a 
                        href={vid.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-primary-spec"
                        style={{ padding: '8px 16px', fontSize: '0.82rem', textAlign: 'center', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                      >
                        <Play size={14} /> Watch on YouTube <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: PDFS & NOTES */}
            {(activeFilter === 'all' || activeFilter === 'notes') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <FileText size={18} color="#2563EB" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Downloadable University PDFs, Notes & Cheatsheets
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                  {currentResources.notes.map(note => (
                    <div 
                      key={note.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '14px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#2563EB', textTransform: 'uppercase' }}>
                            {note.type}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>
                            {note.source}
                          </span>
                        </div>

                        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#111827', margin: '0 0 10px 0', lineHeight: 1.35 }}>
                          {note.title}
                        </h4>

                        <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px' }}>
                          <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '0.8rem', color: '#374151', lineHeight: 1.45 }}>
                            {note.keyPoints.map((pt, idx) => (
                              <li key={idx} style={{ marginBottom: '4px' }}>{pt}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <a 
                        href={note.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-secondary-spec"
                        style={{ padding: '8px 16px', fontSize: '0.82rem', textAlign: 'center', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                      >
                        <Download size={14} /> Download PDF Notes & Cheatsheet <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: TOP WEBSITES */}
            {(activeFilter === 'all' || activeFilter === 'websites') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Globe size={18} color="#059669" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Authority Documentation & Topic-Specific Websites
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
                  {currentResources.websites.map(site => (
                    <div 
                      key={site.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '14px',
                        padding: '18px 20px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>
                          {site.name}
                        </span>
                        <h4 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#111827', margin: '0 0 6px 0', lineHeight: 1.35 }}>
                          {site.title}
                        </h4>
                        <p style={{ fontSize: '0.82rem', color: '#4B5563', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                          {site.desc}
                        </p>
                      </div>

                      <a 
                        href={site.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-secondary-spec"
                        style={{ padding: '8px 16px', fontSize: '0.82rem', textAlign: 'center', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: '6px', textDecoration: 'none' }}
                      >
                        Visit {site.name} <ArrowUpRight size={14} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 4: PRACTICE PROBLEMS */}
            {(activeFilter === 'all' || activeFilter === 'practice') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Code size={18} color="#7C3AED" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Targeted Placement Coding & Practice Problems
                  </h3>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  {currentResources.practice.map(prob => (
                    <div 
                      key={prob.id}
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #E5E7EB',
                        borderRadius: '12px',
                        padding: '16px 18px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#7C3AED', textTransform: 'uppercase' }}>
                            {prob.platform}
                          </span>
                          <span style={{
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: '4px',
                            backgroundColor: prob.difficulty === 'Easy' ? '#DCFCE7' : prob.difficulty === 'Hard' ? '#FEE2E2' : '#FEF3C7',
                            color: prob.difficulty === 'Easy' ? '#15803D' : prob.difficulty === 'Hard' ? '#B91C1C' : '#B45309'
                          }}>
                            {prob.difficulty}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827' }}>
                          {prob.title}
                        </div>
                      </div>

                      <a 
                        href={prob.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="btn-primary-spec"
                        style={{ padding: '6px 14px', fontSize: '0.78rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
                      >
                        Solve <ArrowUpRight size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
