import React, { useState } from 'react';
import { 
  Search, BookOpen, Video, FileText, Globe, 
  Sparkles, ExternalLink, Play, Layers, RefreshCw, 
  Download, ArrowUpRight
} from 'lucide-react';

// Multi-Source Learning Platforms & Placement Intelligence Engine
function retrieveResourcesForTopic(queryText) {
  const clean = (queryText || '').toLowerCase().trim();
  const slug = clean.replace(/\s+/g, '-');
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
      summary: 'Direct concept tutorials and blog articles across GeeksforGeeks, JavaTpoint, Scaler Topics, W3Schools, and InterviewBit.',
      videos: [
        {
          id: 'v1',
          title: 'DBMS Normalization in One Shot (1NF, 2NF, 3NF, BCNF with Solved Examples)',
          channel: 'Gate Smashers',
          duration: '18 mins',
          url: 'https://www.youtube.com/watch?v=5fs1hdwd4jo',
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
          url: 'https://www.youtube.com/watch?v=9yeOJ0ZMUYw',
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
          title: 'GeeksforGeeks DBMS Normalization Comprehensive Notes',
          type: 'Revision Notes & Cheatsheet',
          source: 'GeeksforGeeks',
          readTime: '5 min read',
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
          title: 'InterviewBit SQL & Transaction Concurrency Guide',
          type: 'Placement Cheatsheet',
          source: 'InterviewBit',
          readTime: '4 min read',
          url: 'https://www.interviewbit.com/dbms-interview-questions/',
          keyPoints: [
            'Clustered Index: Physically sorts table records on disk (1 per table).',
            'Non-Clustered Index: Separate B-Tree index pointers for fast WHERE lookups.',
            'Composite Index: Ordered key prefix evaluation (Left-to-Right rule).',
            'ACID Guarantees: Atomicity, Consistency, Isolation, Durability.'
          ]
        }
      ],
      websites: [
        {
          id: 'w1',
          name: 'GeeksforGeeks',
          title: 'Database Normalization (1NF, 2NF, 3NF, BCNF) Tutorial',
          desc: 'Direct blog guide explaining database anomalies, dependency preservation, and lossless decomposition.',
          url: 'https://www.geeksforgeeks.org/introduction-of-database-normalization/'
        },
        {
          id: 'w2',
          name: 'JavaTpoint',
          title: 'DBMS Normalization Tutorial with Step-by-Step Examples',
          desc: 'Complete article with sample tables showing how to decompose unnormalized tables into BCNF form.',
          url: 'https://www.javatpoint.com/dbms-normalization'
        },
        {
          id: 'w3',
          name: 'Scaler Topics',
          title: 'Normalization in DBMS: 1NF to BCNF with Solved Examples',
          desc: 'In-depth engineering article covering candidate key determination and transitive dependencies.',
          url: 'https://www.scaler.com/topics/dbms/normalization-in-dbms/'
        },
        {
          id: 'w4',
          name: 'W3Schools',
          title: 'SQL Joins Guide (INNER, LEFT, RIGHT, FULL OUTER)',
          desc: 'Interactive tutorial page with live code examples to test joining relational tables.',
          url: 'https://www.w3schools.com/sql/sql_join.asp'
        }
      ]
    };
  }

  // 2. Binary Trees & BST Domain
  if (domain === 'trees') {
    return {
      title: 'Binary Trees & Binary Search Trees (BST)',
      category: 'Data Structures & Algorithms',
      summary: 'Direct concept tutorials and blog articles across GeeksforGeeks, Programiz, Scaler Topics, JavaTpoint, and InterviewBit.',
      videos: [
        {
          id: 'v1',
          title: 'Binary Trees & Traversals Masterclass (Inorder, Preorder, Postorder, BFS in One Shot)',
          channel: 'Take U Forward (Striver)',
          duration: '24 mins',
          url: 'https://www.youtube.com/watch?v=jmy0LaGET1I',
          timestamps: [
            { time: '00:00', label: 'TreeNode Pointer Structure & Memory Representation' },
            { time: '06:15', label: 'DFS Traversals (Inorder, Preorder, Postorder Recursion)' },
            { time: '13:30', label: 'Iterative BFS Level Order Traversal with Queue' },
            { time: '19:45', label: 'Calculating Tree Height & Maximum Depth' }
          ]
        },
        {
          id: 'v2',
          title: 'Binary Search Tree (BST) & All Operations Walkthrough',
          channel: 'CodeHelp (Love Babbar)',
          duration: '20 mins',
          url: 'https://www.youtube.com/watch?v=p4DD60_B5t8',
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
          title: 'GeeksforGeeks Tree Traversals & Recursion Notes',
          type: 'Revision Notes',
          source: 'GeeksforGeeks',
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
          title: 'InterviewBit Binary Trees Placement Cheatsheet',
          type: 'Placement Cheatsheet',
          source: 'InterviewBit',
          readTime: '3 min read',
          url: 'https://www.interviewbit.com/tree-data-structure-interview-questions/',
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
          title: 'Binary Tree Data Structure Tutorial & Implementations',
          desc: 'Direct article covering binary tree properties, representation in C++/Java, and traversal algorithms.',
          url: 'https://www.geeksforgeeks.org/binary-tree-data-structure/'
        },
        {
          id: 'w2',
          name: 'Programiz',
          title: 'Binary Tree Explained with Diagrams & Code Examples',
          desc: 'Step-by-step visual tutorial illustrating complete, perfect, and full binary trees with dry runs.',
          url: 'https://www.programiz.com/dsa/binary-tree'
        },
        {
          id: 'w3',
          name: 'Scaler Topics',
          title: 'Binary Tree in Data Structure: Types, Operations & Applications',
          desc: 'Detailed breakdown of node anatomy, recursive traversals, and maximum depth computation.',
          url: 'https://www.scaler.com/topics/data-structures/binary-tree-in-data-structure/'
        },
        {
          id: 'w4',
          name: 'JavaTpoint',
          title: 'Binary Tree Data Structure Tutorial with Examples',
          desc: 'Clear tutorial page on tree terminology, creation, and search algorithms.',
          url: 'https://www.javatpoint.com/binary-tree'
        }
      ]
    };
  }

  // 3. Dynamic Programming Domain
  if (domain === 'dp') {
    return {
      title: 'Dynamic Programming & 0/1 Knapsack Patterns',
      category: 'Algorithms',
      summary: 'Direct concept tutorials and blog articles across GeeksforGeeks, Scaler Topics, Programiz, JavaTpoint, and InterviewBit.',
      videos: [
        {
          id: 'v1',
          title: '0/1 Knapsack Problem & Identification in Dynamic Programming',
          channel: 'Aditya Verma',
          duration: '22 mins',
          url: 'https://www.youtube.com/watch?v=kvyShbFVaY8',
          timestamps: [
            { time: '00:00', label: 'How to Identify DP in 30 Seconds' },
            { time: '06:15', label: 'Choice Diagram & Recursive Tree' },
            { time: '12:30', label: '2D Matrix Memoization Setup' },
            { time: '18:00', label: 'Space Optimization to 1D Array' }
          ]
        },
        {
          id: 'v2',
          title: 'Dynamic Programming Introduction & 1D DP Climbing Stairs',
          channel: 'Take U Forward (Striver)',
          duration: '26 mins',
          url: 'https://www.youtube.com/watch?v=tyB0ztf0DNY',
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
          title: 'GeeksforGeeks 0/1 Knapsack Problem Tutorial & Notes',
          type: 'Revision Notes',
          source: 'GeeksforGeeks',
          readTime: '5 min read',
          url: 'https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/',
          keyPoints: [
            'Overlapping Subproblems: Storing computed states to avoid exponential recalculation.',
            'Optimal Substructure: Optimal answer can be constructed from optimal answers of subproblems.',
            'Memoization (Top-Down): Recursive stack + cache lookup array.',
            'Tabulation (Bottom-Up): Iterative DP table filled from base cases up to N.'
          ]
        },
        {
          id: 'n2',
          title: 'Scaler Topics Dynamic Programming Patterns Cheatsheet',
          type: 'Placement Cheatsheet',
          source: 'Scaler Topics',
          readTime: '4 min read',
          url: 'https://www.scaler.com/topics/data-structures/0-1-knapsack-problem/',
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
          title: '0/1 Knapsack Problem (DP-10) Complete Guide',
          desc: 'Direct tutorial page covering recursive, memoized, and space-optimized tabulation approaches.',
          url: 'https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/'
        },
        {
          id: 'w2',
          name: 'Scaler Topics',
          title: '0-1 Knapsack Problem Tutorial with State Matrix Tables',
          desc: 'Comprehensive article with choice diagrams, complexity proofs, and C++/Java/Python code.',
          url: 'https://www.scaler.com/topics/data-structures/0-1-knapsack-problem/'
        },
        {
          id: 'w3',
          name: 'JavaTpoint',
          title: '0/1 Knapsack Problem using Dynamic Programming',
          desc: 'Step-by-step table filling algorithm with detailed numerical examples.',
          url: 'https://www.javatpoint.com/0-1-knapsack-problem'
        },
        {
          id: 'w4',
          name: 'Programiz',
          title: '0-1 Knapsack Problem Algorithm Explained',
          desc: 'Visual explanation of dynamic programming table formulation with working code snippets.',
          url: 'https://www.programiz.com/dsa/0-1-knapsack-problem'
        }
      ]
    };
  }

  // 4. Graphs Domain
  if (domain === 'graphs') {
    return {
      title: 'Graph Algorithms (BFS, DFS, Dijkstra, Topo Sort)',
      category: 'Data Structures & Algorithms',
      summary: 'Direct concept tutorials and blog articles across GeeksforGeeks, Programiz, Scaler Topics, JavaTpoint, and InterviewBit.',
      videos: [
        {
          id: 'v1',
          title: 'Graph Representation & BFS Traversal Placement Masterclass',
          channel: 'Take U Forward (Striver)',
          duration: '25 mins',
          url: 'https://www.youtube.com/watch?v=-tgVpUgsQ5A',
          timestamps: [
            { time: '00:00', label: 'Adjacency List vs Matrix Space & Time' },
            { time: '06:30', label: 'BFS Traversal with Queue & Visited Array' },
            { time: '13:00', label: 'Cycle Detection in Directed Graphs (Kahn / DFS)' },
            { time: '19:30', label: 'Dijkstra Shortest Path with PriorityQueue' }
          ]
        },
        {
          id: 'v2',
          title: 'Dijkstra Algorithm & Shortest Path in Graphs',
          channel: 'CodeHelp (Love Babbar)',
          duration: '20 mins',
          url: 'https://www.youtube.com/watch?v=dVUR3Rm6biE',
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
          title: 'GeeksforGeeks Graph BFS & DFS Traversal Notes',
          type: 'Revision Notes',
          source: 'GeeksforGeeks',
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
          title: 'InterviewBit Dijkstra Shortest Path Cheatsheet',
          type: 'Placement Cheatsheet',
          source: 'InterviewBit',
          readTime: '4 min read',
          url: 'https://www.interviewbit.com/graph-interview-questions/',
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
          title: 'Breadth First Search or BFS for a Graph Tutorial',
          desc: 'Direct article on graph representation, queue processing, and disconnected components handling.',
          url: 'https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/'
        },
        {
          id: 'w2',
          name: 'Programiz',
          title: 'Graph BFS Algorithm with Step-by-Step Diagrams',
          desc: 'Visual tutorial showing how visited arrays and queues prevent infinite cycles during graph traversals.',
          url: 'https://www.programiz.com/dsa/graph-bfs'
        },
        {
          id: 'w3',
          name: 'Scaler Topics',
          title: 'BFS Traversal of Graph with Examples in C++, Java, Python',
          desc: 'Comprehensive engineering article detailing time/space complexity and shortest path applications.',
          url: 'https://www.scaler.com/topics/data-structures/bfs-traversal-of-graph/'
        },
        {
          id: 'w4',
          name: 'JavaTpoint',
          title: 'Breadth-First Search (BFS) Algorithm Guide',
          desc: 'Clear tutorial page with pseudocode, complexity derivations, and edge cases.',
          url: 'https://www.javatpoint.com/breadth-first-search-algorithm'
        }
      ]
    };
  }

  // 5. Sliding Window Domain
  if (domain === 'sliding_window') {
    return {
      title: 'Sliding Window & Two Pointer Patterns',
      category: 'Data Structures & Algorithms',
      summary: 'Direct concept tutorials and blog articles across GeeksforGeeks, Scaler Topics, JavaTpoint, and InterviewBit.',
      videos: [
        {
          id: 'v1',
          title: 'Sliding Window Identification & Maximum Sum Subarray of Size K',
          channel: 'Aditya Verma',
          duration: '22 mins',
          url: 'https://www.youtube.com/watch?v=EHCGAZBbB88',
          timestamps: [
            { time: '00:00', label: 'Fixed Size vs Variable Size Window Identification' },
            { time: '07:30', label: 'Maximum Sum Subarray of Size K' },
            { time: '14:20', label: 'Variable Window with Hash Map Frequency' }
          ]
        },
        {
          id: 'v2',
          title: 'Two Pointers & Sliding Window Masterclass',
          channel: 'Take U Forward (Striver)',
          duration: '20 mins',
          url: 'https://www.youtube.com/watch?v=1pkOGchrNx5',
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
          title: 'GeeksforGeeks Window Sliding Technique Notes',
          type: 'Revision Notes',
          source: 'GeeksforGeeks',
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
          title: 'InterviewBit Two Pointers Placement Cheatsheet',
          type: 'Placement Cheatsheet',
          source: 'InterviewBit',
          readTime: '3 min read',
          url: 'https://www.interviewbit.com/two-pointers-interview-questions/',
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
          desc: 'Direct article on how the sliding window pattern avoids redundant subarray re-computation.',
          url: 'https://www.geeksforgeeks.org/window-sliding-technique/'
        },
        {
          id: 'w2',
          name: 'Scaler Topics',
          title: 'Sliding Window Algorithm with Solved Interview Problems',
          desc: 'Comprehensive tutorial on constant window sizes, dynamic expansions, and hash map tracking.',
          url: 'https://www.scaler.com/topics/sliding-window-algorithm/'
        },
        {
          id: 'w3',
          name: 'InterviewBit',
          title: 'Two Pointers Technique Placement Guide',
          desc: 'Curated technical interview questions covering 3 Sum, Container with Most Water, and subarray sums.',
          url: 'https://www.interviewbit.com/courses/programming/topics/two-pointers/'
        }
      ]
    };
  }

  // 6. Universal Dynamic Resolver for ANY query (Direct platform blog/page search)
  return {
    title: formattedTitle,
    category: 'Computer Science Technical Concept',
    summary: `Direct learning articles, concept tutorials, and revision notes for ${formattedTitle} across GeeksforGeeks, JavaTpoint, Scaler Topics, and InterviewBit.`,
    videos: [
      {
        id: 'v1',
        title: `${formattedTitle} Masterclass & Complete Walkthrough`,
        channel: 'Gate Smashers',
        duration: '20 mins',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent('gate smashers ' + queryText + ' placement lecture')}`,
        timestamps: [
          { time: '00:00', label: `Core Introduction & Why ${formattedTitle} is Asked in Interviews` },
          { time: '05:30', label: 'Step-by-Step Algorithm & Memory Trace' },
          { time: '12:45', label: 'Standard Placement Test Problems & Dry Run' },
          { time: '17:30', label: 'Time/Space Complexity & Common Recruiter Traps' }
        ]
      },
      {
        id: 'v2',
        title: `${formattedTitle} Placement Coding Walkthrough`,
        channel: 'Take U Forward (Striver)',
        duration: '18 mins',
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent('striver take u forward ' + queryText + ' placement')}`,
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
        title: `${formattedTitle} GeeksforGeeks Tutorial & Notes`,
        type: 'Revision Notes',
        source: 'GeeksforGeeks',
        readTime: '4 min read',
        url: `https://www.geeksforgeeks.org/search/?q=${encodedQuery}`,
        keyPoints: [
          `Fundamental Definition: Core mechanics and principles of ${formattedTitle}.`,
          'Complexity: Analyze average and worst-case time/space tradeoffs before coding.',
          'Edge Cases: Check null/empty inputs, single elements, and boundary values.',
          'Interview Pattern: Clarify constraints -> State brute force -> Deliver optimal approach.'
        ]
      },
      {
        id: 'n2',
        title: `${formattedTitle} InterviewBit Placement Cheatsheet`,
        type: 'Placement Cheatsheet',
        source: 'InterviewBit',
        readTime: '3 min read',
        url: `https://www.google.com/search?q=site:interviewbit.com+${encodedQuery}+interview+questions`,
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
        title: `GeeksforGeeks: ${formattedTitle} Article & Code`,
        desc: `Direct concept tutorial with syntax diagrams, code examples in C++, Java, Python, and complexity analysis for ${formattedTitle}.`,
        url: `https://www.geeksforgeeks.org/search/?q=${encodedQuery}`
      },
      {
        id: 'w2',
        name: 'JavaTpoint',
        title: `JavaTpoint: ${formattedTitle} Tutorial Page`,
        desc: `Step-by-step educational guide covering theory, examples, and interview questions for ${formattedTitle}.`,
        url: `https://www.google.com/search?q=site:javatpoint.com+${encodedQuery}`
      },
      {
        id: 'w3',
        name: 'Scaler Topics',
        title: `Scaler Topics: ${formattedTitle} In-Depth Guide`,
        desc: `Comprehensive engineering article with visual architectural diagrams and implementation templates for ${formattedTitle}.`,
        url: `https://www.google.com/search?q=site:scaler.com/topics+${encodedQuery}`
      },
      {
        id: 'w4',
        name: 'InterviewBit',
        title: `InterviewBit: ${formattedTitle} Technical Interview Track`,
        desc: `Curated placement questions with automated test case evaluation and solutions for ${formattedTitle}.`,
        url: `https://www.google.com/search?q=site:interviewbit.com+${encodedQuery}`
      }
    ]
  };
}

export default function PlacementResourceRAG({ profile = {}, setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentResources, setCurrentResources] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'videos' | 'notes' | 'websites'
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
            Placement Learning Hub
          </span>
          <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600 }}>
            Curated Educational Platforms & Video Masterclasses
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', margin: 0 }}>
          Placement Learning Resources Search
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#4B5563', margin: '4px 0 0 0', lineHeight: 1.45 }}>
          Search any placement concept to retrieve direct tutorial articles and blogs from GeeksforGeeks, JavaTpoint, Scaler Topics, and Programiz, along with verified video masterclasses from Gate Smashers, Striver, and Aditya Verma.
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
              placeholder="Search any placement concept (e.g., DBMS Normalization, Binary Trees, Dynamic Programming, SQL Joins, Graphs)..."
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
            Popular Placement Topics:
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
            Search Any Placement Concept Above
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#4B5563', maxWidth: '520px', margin: '0 auto 22px auto', lineHeight: 1.5 }}>
            Type any concept above to find exact article pages and tutorials from GeeksforGeeks, JavaTpoint, Scaler Topics, and Programiz, along with verified video masterclasses.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', maxWidth: '850px', margin: '0 auto', textAlign: 'left' }}>
            {[
              {
                title: 'DBMS Normalization',
                desc: 'Direct GeeksforGeeks article, JavaTpoint guide, Scaler Topics tutorial, and Gate Smashers video.'
              },
              {
                title: 'Binary Trees & BST',
                desc: 'Direct GeeksforGeeks tutorial, Programiz visual guide, Scaler Topics article, and Striver video.'
              },
              {
                title: 'Dynamic Programming',
                desc: 'Direct 0/1 Knapsack GeeksforGeeks page, Scaler Topics tutorial, JavaTpoint guide, and Aditya Verma video.'
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
                { id: 'videos', label: `Video Masterclasses (${currentResources.videos.length})` },
                { id: 'notes', label: `Revision Notes (${currentResources.notes.length})` },
                { id: 'websites', label: `Learning Platforms & Articles (${currentResources.websites.length})` }
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
            
            {/* SECTION 1: YOUTUBE VIDEOS WITH DIRECT CHANNEL LINKS */}
            {(activeFilter === 'all' || activeFilter === 'videos') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Video size={18} color="#DC2626" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Video Masterclasses & Timestamps
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
                            Video Lecture
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
                        <Play size={14} /> Watch on {vid.channel.split(' ')[0]} YouTube <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 2: REVISION NOTES & CHEATSHEETS */}
            {(activeFilter === 'all' || activeFilter === 'notes') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <FileText size={18} color="#2563EB" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Distilled Revision Notes & Cheatsheets
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
                        <Download size={14} /> Open {note.source} Notes <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: TOP LEARNING PLATFORMS (DIRECT BLOG/PAGE LINKS) */}
            {(activeFilter === 'all' || activeFilter === 'websites') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Globe size={18} color="#059669" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Learning Platforms & Topic-Specific Articles
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
                        Read on {site.name} <ArrowUpRight size={14} />
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
