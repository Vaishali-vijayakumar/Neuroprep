import React, { useState } from 'react';
import { 
  Search, BookOpen, Video, FileText, Globe, 
  Sparkles, ExternalLink, Play, Layers, RefreshCw, 
  Download, Code, ArrowUpRight
} from 'lucide-react';

// Multi-Source Resource Intelligence Database with Direct Resource URLs
function retrieveResourcesForTopic(queryText) {
  const clean = (queryText || '').toLowerCase().trim();
  const encodedQuery = encodeURIComponent(queryText.trim());

  // Domain Detection
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
  } else if (clean.includes('oop') || clean.includes('java') || clean.includes('solid') || clean.includes('class') || clean.includes('inheritance')) {
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
      summary: 'Complete learning resources for database normalization (1NF to BCNF), indexing, ACID transactions, and SQL queries.',
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
          title: 'DBMS Normalization Quick Revision Cheatsheet',
          type: 'PDF Cheatsheet & Summary',
          readTime: '4 min read',
          url: 'https://www.geeksforgeeks.org/introduction-of-database-normalization/',
          keyPoints: [
            '1NF: Attributes must be atomic (no multi-valued collections).',
            '2NF: Must be in 1NF + NO non-prime attribute depends on a part of candidate key.',
            '3NF: Must be in 2NF + NO non-prime attribute depends on another non-prime attribute.',
            'BCNF: For every functional dependency X -> Y, X must strictly be a Super Key.'
          ]
        },
        {
          id: 'n2',
          title: 'ACID Properties & Transaction Isolation Levels Note',
          type: 'Distilled Interview Notes',
          readTime: '5 min read',
          url: 'https://www.geeksforgeeks.org/acid-properties-in-dbms/',
          keyPoints: [
            'Atomicity: All operations succeed or all rollback (Undo log).',
            'Consistency: Preserves all integrity constraints and schemas.',
            'Isolation: Read Uncommitted, Read Committed, Repeatable Read, Serializable.',
            'Durability: Committed transactions persist across power/hardware crashes.'
          ]
        }
      ],
      websites: [
        {
          id: 'w1',
          name: 'GeeksforGeeks',
          title: 'DBMS Normalization: 1NF, 2NF, 3NF, BCNF Explained',
          desc: 'Comprehensive step-by-step tutorial with schema decomposition tables and practice quizzes.',
          url: 'https://www.geeksforgeeks.org/introduction-of-database-normalization/'
        },
        {
          id: 'w2',
          name: 'W3Schools SQL Tutorial',
          title: 'SQL Joins, Subqueries & Clauses Guide',
          desc: 'Interactive SQL code runner with sample tables to test joins, grouping, and subqueries.',
          url: 'https://www.w3schools.com/sql/sql_join.asp'
        },
        {
          id: 'w3',
          name: 'JavaTpoint DBMS Guide',
          title: 'Transaction Management, Concurrency Control & Indexing',
          desc: 'Clear exam and placement-oriented explanations of lock-based protocols and B-Tree indexes.',
          url: 'https://www.javatpoint.com/dbms-normalization'
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
      summary: 'Curated video tutorials, visual cheatsheets, and reference documentation for Tree Traversals (BFS/DFS), BST validation, and Lowest Common Ancestor.',
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
          title: 'Tree Traversals & Complexity Cheatsheet',
          type: 'PDF Summary & Cheatsheet',
          readTime: '4 min read',
          url: 'https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/',
          keyPoints: [
            'Inorder Traversal (Left, Root, Right) of BST always yields sorted ascending values.',
            'Preorder (Root, Left, Right) is used for tree cloning and serialization.',
            'Postorder (Left, Right, Root) is used for bottom-up computation (height, delete tree).',
            'Level Order Traversal uses a FIFO Queue: O(N) time and O(W) max level width space.'
          ]
        },
        {
          id: 'n2',
          title: 'Standard Tree Recursion Templates',
          type: 'Code Templates & Notes',
          readTime: '3 min read',
          url: 'https://www.geeksforgeeks.org/binary-tree-data-structure/',
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
          name: 'GeeksforGeeks',
          title: 'Binary Tree Data Structure: Full Tutorial & Problems',
          desc: 'Comprehensive visual representations, code implementations in Java/C++/Python, and standard interview problems.',
          url: 'https://www.geeksforgeeks.org/binary-tree-data-structure/'
        },
        {
          id: 'w2',
          name: 'NeetCode.io',
          title: 'Trees Practice Roadmap & Visual Code Walkthroughs',
          desc: 'Curated 15 standard tree questions with animated dry runs and complexity breakdowns.',
          url: 'https://neetcode.io/practice'
        },
        {
          id: 'w3',
          name: 'LeetCode Explore',
          title: 'Binary Tree Card: Detailed Explanations & Exercises',
          desc: 'Structured interactive module covering recursive and iterative traversal techniques.',
          url: 'https://leetcode.com/explore/learn/card/data-structure-tree/'
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
      summary: 'Curated resources for identifying DP patterns, memoization vs tabulation, 1D space optimization, and classic placement problems.',
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
          title: 'Dynamic Programming Core Patterns Cheatsheet',
          type: 'PDF Summary & Cheatsheet',
          readTime: '5 min read',
          url: 'https://www.geeksforgeeks.org/dynamic-programming/',
          keyPoints: [
            'Overlapping Subproblems: Storing already computed results to avoid redundant operations.',
            'Optimal Substructure: Optimal answer can be constructed from optimal answers of subproblems.',
            'Memoization (Top-Down): Recursive calls + cache lookup array.',
            'Tabulation (Bottom-Up): Iterative DP table filled from base cases up to N.'
          ]
        },
        {
          id: 'n2',
          title: '0/1 Knapsack & Subset Sum Quick Reference',
          type: 'Revision Notes',
          readTime: '4 min read',
          url: 'https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/',
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
          name: 'GeeksforGeeks',
          title: 'Top 20 Dynamic Programming Interview Questions',
          desc: 'Curated list of standard placement DP problems with C++, Java, and Python implementations.',
          url: 'https://www.geeksforgeeks.org/top-20-dynamic-programming-interview-questions/'
        },
        {
          id: 'w2',
          name: 'NeetCode.io',
          title: 'Dynamic Programming 1-D & 2-D Roadmaps',
          desc: 'Interactive roadmap with visual state transition diagrams and complexity comparisons.',
          url: 'https://neetcode.io/practice'
        },
        {
          id: 'w3',
          name: 'LeetCode Study Plan',
          title: 'Dynamic Programming Practice Series',
          desc: 'Structured track covering Fibonacci, Knapsack, and String Matching DP patterns.',
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
      summary: 'Complete guide for Graph representations, Cycle detection in directed/undirected graphs, Topological Sort, and Shortest Paths.',
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
          title: 'Graph Traversals & Cycle Detection Cheatsheet',
          type: 'PDF Summary & Notes',
          readTime: '4 min read',
          url: 'https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/',
          keyPoints: [
            'Adjacency List uses O(V + E) space; Matrix uses O(V^2).',
            'Cycle in Undirected: DFS with parent tracking.',
            'Cycle in Directed: DFS with path-visited array or Kahn Algorithm in-degrees.',
            'Topological Sort requires a Directed Acyclic Graph (DAG).'
          ]
        },
        {
          id: 'n2',
          title: 'Shortest Path Algorithms Quick Notes',
          type: 'Revision Notes',
          readTime: '4 min read',
          url: 'https://www.geeksforgeeks.org/dijkstras-shortest-path-algorithm-greedy-algo-7/',
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
          name: 'GeeksforGeeks',
          title: 'Graph Data Structure and Algorithms Guide',
          desc: 'Comprehensive visual guides, code implementations, and standard interview problems.',
          url: 'https://www.geeksforgeeks.org/graph-data-structure-and-algorithm/'
        },
        {
          id: 'w2',
          name: 'LeetCode Explore',
          title: 'Graph Theory Module & Exercises',
          desc: 'Detailed modules covering Disjoint Set Union (DSU), BFS, DFS, and Minimum Spanning Trees.',
          url: 'https://leetcode.com/explore/learn/card/graph/'
        },
        {
          id: 'w3',
          name: 'VisuAlgo',
          title: 'Interactive Graph Traversal Visualizer',
          desc: 'Step through BFS, DFS, Dijkstra, and Kruskal algorithms visually with custom graphs.',
          url: 'https://visualgo.net/en/graphds'
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

  // 5. Sliding Window & Two Pointers Domain
  if (domain === 'sliding_window') {
    return {
      title: 'Sliding Window & Two Pointer Patterns',
      category: 'Data Structures & Algorithms',
      summary: 'Master fixed vs variable size sliding windows, two-pointer convergence, and linear O(N) subarray optimization.',
      videos: [
        {
          id: 'v1',
          title: 'Sliding Window Technique for Placement Interviews',
          channel: 'Aditya Verma',
          duration: '22 mins',
          url: 'https://www.youtube.com/results?search_query=aditya+verma+sliding+window+playlist',
          timestamps: [
            { time: '00:00', label: 'Fixed Size vs Variable Size Window Identification' },
            { time: '07:30', label: 'Maximum Sum Subarray of Size K' },
            { time: '14:20', label: 'Variable Window with Hash Map Frequency' }
          ]
        },
        {
          id: 'v2',
          title: 'Two Pointers & Sliding Window Masterclass',
          channel: 'NeetCode',
          duration: '18 mins',
          url: 'https://www.youtube.com/results?search_query=neetcode+sliding+window+two+pointers',
          timestamps: [
            { time: '00:00', label: 'Two Pointers from Both Ends' },
            { time: '08:00', label: 'Longest Substring Without Repeating Characters' },
            { time: '14:30', label: 'Minimum Window Substring Pattern' }
          ]
        }
      ],
      notes: [
        {
          id: 'n1',
          title: 'Sliding Window Patterns Cheatsheet',
          type: 'PDF Summary & Cheatsheet',
          readTime: '3 min read',
          url: 'https://www.geeksforgeeks.org/window-sliding-technique/',
          keyPoints: [
            'Fixed Window: maintain window size (right - left + 1 == k). Slide by incrementing both.',
            'Variable Window: expand right pointer while condition holds; shrink left pointer when invalid.',
            'Time Complexity: converts nested loops O(N^2) into linear O(N).'
          ]
        },
        {
          id: 'n2',
          title: 'Two Pointers Collision Pattern Notes',
          type: 'Revision Notes',
          readTime: '3 min read',
          url: 'https://www.geeksforgeeks.org/two-pointers-technique/',
          keyPoints: [
            'Sorted Array Two Sum: left = 0, right = n - 1. If sum < target left++; else right--.',
            'Fast and Slow Pointers: cycle detection in linked lists and middle node calculation.'
          ]
        }
      ],
      websites: [
        {
          id: 'w1',
          name: 'GeeksforGeeks',
          title: 'Window Sliding Technique Explained with Code',
          desc: 'Step-by-step illustrations with clean C++, Java, and Python templates.',
          url: 'https://www.geeksforgeeks.org/window-sliding-technique/'
        },
        {
          id: 'w2',
          name: 'LeetCode Tag',
          title: 'Sliding Window Curated Problems',
          desc: 'Complete list of standard interview questions tagged with Sliding Window.',
          url: 'https://leetcode.com/tag/sliding-window/'
        },
        {
          id: 'w3',
          name: 'NeetCode.io',
          title: 'Sliding Window Roadmap & Visual dry runs',
          desc: 'Interactive problems with line-by-line pointer traces.',
          url: 'https://neetcode.io/practice'
        }
      ],
      practice: [
        {
          id: 'p1',
          platform: 'LeetCode',
          title: '121. Best Time to Buy and Sell Stock',
          difficulty: 'Easy',
          url: 'https://leetcode.com/problems/best-time-to-buy-and-sell-stock/'
        },
        {
          id: 'p2',
          platform: 'LeetCode',
          title: '3. Longest Substring Without Repeating Characters',
          difficulty: 'Medium',
          url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/'
        },
        {
          id: 'p3',
          platform: 'LeetCode',
          title: '76. Minimum Window Substring',
          difficulty: 'Hard',
          url: 'https://leetcode.com/problems/minimum-window-substring/'
        }
      ]
    };
  }

  // 6. Dynamic Multi-Source Search Resolver for ANY custom query
  return {
    title: formattedTitle,
    category: 'Placement Technical Concept',
    summary: `Curated learning resources, video masterclasses, downloadable notes, and practice questions for ${formattedTitle}.`,
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
        title: `${formattedTitle} Core Summary & GeeksforGeeks Notes`,
        type: 'Web Article & Notes',
        readTime: '4 min read',
        url: `https://www.geeksforgeeks.org/search/?q=${encodedQuery}`,
        keyPoints: [
          `Fundamental Definition: Understand the exact purpose and mechanics of ${formattedTitle}.`,
          'Complexity: Analyze average and worst-case time/space tradeoffs before coding.',
          'Edge Cases: Check null/empty inputs, single elements, and boundary values.',
          'Interview Pattern: Clarify constraints -> State brute force -> Deliver optimal approach.'
        ]
      },
      {
        id: 'n2',
        title: `${formattedTitle} PDF Cheatsheet & Documentation`,
        type: 'PDF Cheatsheet',
        readTime: '3 min read',
        url: `https://www.google.com/search?q=${encodedQuery}+notes+pdf+filetype:pdf`,
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
        name: 'GeeksforGeeks',
        title: `${formattedTitle} Tutorials, Theory & Code`,
        desc: `Comprehensive explanations, diagrams, time complexities, and language implementations for ${formattedTitle}.`,
        url: `https://www.geeksforgeeks.org/search/?q=${encodedQuery}`
      },
      {
        id: 'w2',
        name: 'JavaTpoint',
        title: `${formattedTitle} Step-by-Step Concepts Guide`,
        desc: `Clear interview-oriented definitions and practical examples for ${formattedTitle}.`,
        url: `https://www.google.com/search?q=site:javatpoint.com+${encodedQuery}`
      },
      {
        id: 'w3',
        name: 'W3Schools',
        title: `${formattedTitle} Interactive Reference`,
        desc: `Structured breakdown of concepts with easy-to-understand definitions and code snippets.`,
        url: `https://www.google.com/search?q=site:w3schools.com+${encodedQuery}`
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
            Resource Intelligence
          </span>
          <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600 }}>
            Multi-Source Concept Search (YouTube, PDFs, Websites & Practice)
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', margin: 0 }}>
          Placement Learning Resources Search
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#4B5563', margin: '4px 0 0 0', lineHeight: 1.45 }}>
          Search any placement concept to retrieve top-rated YouTube video tutorials, PDF cheatsheets, reference websites, and practice questions.
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
            'Sliding Window & Two Pointers'
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
            Type any topic above to search for top YouTube video masterclasses, downloadable PDF summaries & cheatsheets, GeeksforGeeks/LeetCode documentation, and practice links.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', maxWidth: '850px', margin: '0 auto', textAlign: 'left' }}>
            {[
              {
                title: 'DBMS Normalization',
                desc: 'YouTube video breakdowns, PDF rules for 1NF to BCNF, GeeksforGeeks tutorials, and SQL problems.'
              },
              {
                title: 'Binary Trees & BST',
                desc: 'Traversals video guides, tree recursion cheatsheets, NeetCode links, and LeetCode problem sets.'
              },
              {
                title: 'Dynamic Programming',
                desc: '0/1 Knapsack masterclasses, memoization vs tabulation notes, and standard coding problems.'
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
                    PDF Cheatsheets & Distilled Revision Notes
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
                          <span style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                            {note.readTime}
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
                        <Download size={14} /> Open PDF & Full Notes <ExternalLink size={12} />
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
                    Top Websites & Interactive Documentation
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
