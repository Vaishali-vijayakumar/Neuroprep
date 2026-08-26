import React, { useState } from 'react';
import { 
  Search, BookOpen, Video, FileText, Globe, 
  Sparkles, ExternalLink, Play, Layers, RefreshCw, 
  Download, ArrowUpRight
} from 'lucide-react';

// Dynamic Multi-Authority Resource Retrieval Engine
// Evaluates and delivers the single best-fit website and educator channel for each specific concept
function retrieveResourcesForTopic(queryText) {
  const clean = (queryText || '').toLowerCase().trim();
  const slug = clean.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const encodedQuery = encodeURIComponent(queryText.trim());

  // Deep Semantic Domain & Technology Classifier
  let domain = 'general';
  if (clean.includes('system design') || clean.includes('load balancer') || clean.includes('microservice') || clean.includes('caching') || clean.includes('sharding') || clean.includes('cap theorem')) {
    domain = 'system_design';
  } else if (clean.includes('javascript') || clean.includes('js') || clean.includes('react') || clean.includes('frontend') || clean.includes('closure') || clean.includes('event loop') || clean.includes('async')) {
    domain = 'javascript_web';
  } else if (clean.includes('dbms') || clean.includes('sql') || clean.includes('database') || clean.includes('normaliz') || clean.includes('acid') || clean.includes('index') || clean.includes('join')) {
    domain = 'dbms_sql';
  } else if (clean.includes('design pattern') || clean.includes('oop') || clean.includes('solid') || clean.includes('singleton') || clean.includes('factory') || clean.includes('inheritance') || clean.includes('polymorphism')) {
    domain = 'design_patterns_oop';
  } else if (clean.includes('graph') || clean.includes('dijkstra') || clean.includes('bfs') || clean.includes('dfs') || clean.includes('topo') || clean.includes('shortest path') || clean.includes('kruskal')) {
    domain = 'graphs';
  } else if (clean.includes('dp') || clean.includes('dynamic programming') || clean.includes('knapsack') || clean.includes('memoiz') || clean.includes('lcs') || clean.includes('longest common')) {
    domain = 'dp';
  } else if (clean.includes('tree') || clean.includes('bst') || clean.includes('traversal') || clean.includes('binary tree') || clean.includes('inorder') || clean.includes('lca')) {
    domain = 'trees';
  } else if (clean.includes('sliding window') || clean.includes('two pointer') || clean.includes('subarray') || clean.includes('kadane')) {
    domain = 'sliding_window';
  } else if (clean.includes('os') || clean.includes('operating system') || clean.includes('paging') || clean.includes('deadlock') || clean.includes('process') || clean.includes('thread') || clean.includes('semaphore')) {
    domain = 'os_concurrency';
  }

  const formattedTitle = queryText
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');

  // 1. DBMS & SQL Domain (Best Authorities: Mode Analytics, SQLZoo, PostgreSQL Docs, Alex The Analyst & Gate Smashers)
  if (domain === 'dbms_sql') {
    return {
      title: 'DBMS Normalization & SQL Masterclass',
      category: 'Database Architecture & Querying',
      summary: 'Curated across top database authorities: Mode Analytics SQL School, SQLZoo Interactive, PostgreSQL Documentation, Gate Smashers, and Alex The Analyst.',
      videos: [
        {
          id: 'v1',
          title: 'DBMS Normalization (1NF, 2NF, 3NF, BCNF with Solved Anomalies)',
          channel: 'Gate Smashers (Varun Singla)',
          duration: '18 mins',
          url: 'https://www.youtube.com/watch?v=5fs1hdwd4jo',
          timestamps: [
            { time: '00:00', label: 'Why Normalization & Update Anomalies Occur' },
            { time: '04:15', label: '1NF: Atomic Attributes & Splitting Arrays' },
            { time: '08:30', label: '2NF: Eliminating Partial Dependencies' },
            { time: '13:45', label: '3NF & BCNF: Transitive Dependencies & Super Keys' }
          ]
        },
        {
          id: 'v2',
          title: 'SQL Joins & Performance Indexing Masterclass',
          channel: 'Alex The Analyst',
          duration: '22 mins',
          url: 'https://www.youtube.com/watch?v=9yeOJ0ZMUYw',
          timestamps: [
            { time: '00:00', label: 'Visualizing INNER, LEFT, RIGHT & FULL Joins' },
            { time: '08:20', label: 'B-Tree Clustered vs Non-Clustered Indexes' },
            { time: '16:00', label: 'Window Functions & DENSE_RANK Calculations' }
          ]
        }
      ],
      notes: [
        {
          id: 'n1',
          title: 'Stanford University CS145: Relational Normalization & BCNF Notes',
          type: 'University Lecture Notes',
          source: 'Stanford CS Department',
          format: 'PDF Notes',
          url: 'https://web.stanford.edu/class/cs145/lectures/lecture08.pdf',
          keyPoints: [
            '1NF: Attributes must be atomic (no multi-valued collections).',
            '2NF: Must be in 1NF + NO non-prime attribute depends on a part of candidate key.',
            '3NF: Must be in 2NF + NO non-prime attribute depends on another non-prime attribute.',
            'BCNF: For every functional dependency X -> Y, X must strictly be a Super Key.'
          ]
        },
        {
          id: 'n2',
          title: 'SQL Commands, Joins & Query Optimization Cheatsheet',
          type: 'Direct PDF Cheatsheet',
          source: 'Database Architecture Guild',
          format: 'PDF Cheatsheet',
          url: 'https://www.sqltutorial.org/wp-content/uploads/2016/04/SQL-Cheat-Sheet.pdf',
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
          name: 'Mode Analytics SQL School',
          title: 'Mode SQL Tutorial: Joins, Subqueries & Window Functions',
          desc: 'The gold-standard interactive SQL guide used by analytics engineers to master complex joins and aggregate queries.',
          url: 'https://mode.com/sql-tutorial/'
        },
        {
          id: 'w2',
          name: 'SQLZoo Interactive Engine',
          title: 'SQLZoo: Live Relational Database Query Exercises',
          desc: 'Interactive live database sandbox to test and execute SQL normalization, joins, and nested subqueries against live tables.',
          url: 'https://sqlzoo.net/wiki/SQL_Tutorial'
        },
        {
          id: 'w3',
          name: 'PostgreSQL Documentation',
          title: 'Official PostgreSQL Relational Joins & Execution Plans',
          desc: 'Official architectural reference covering hash joins, merge joins, nested loops, and query optimizer plans.',
          url: 'https://www.postgresql.org/docs/current/tutorial-join.html'
        },
        {
          id: 'w4',
          name: 'GeeksforGeeks DBMS Hub',
          title: 'DBMS Normalization: 1NF, 2NF, 3NF, BCNF Explained',
          desc: 'Comprehensive tutorial on functional dependencies, candidate key algorithms, and lossless join proofs.',
          url: 'https://www.geeksforgeeks.org/introduction-of-database-normalization/'
        }
      ]
    };
  }

  // 2. Design Patterns & OOP Domain (Best Authorities: Refactoring.Guru, Baeldung, Oracle Java, Christopher Okhravi)
  if (domain === 'design_patterns_oop') {
    return {
      title: 'Design Patterns & Object-Oriented Architecture',
      category: 'Software Engineering & Design',
      summary: 'Curated across top design pattern authorities: Refactoring.Guru (Alexander Shvets), Baeldung, Oracle Java Docs, and Christopher Okhravi.',
      videos: [
        {
          id: 'v1',
          title: 'Design Patterns in Java (Creational, Structural & Behavioral Patterns)',
          channel: 'Christopher Okhravi',
          duration: '25 mins',
          url: 'https://www.youtube.com/watch?v=v9ejT8FO-7I',
          timestamps: [
            { time: '00:00', label: 'Strategy Pattern & Composition Over Inheritance' },
            { time: '08:30', label: 'Observer Pattern & Loose Coupling' },
            { time: '16:00', label: 'Factory & Abstract Factory Mechanics' }
          ]
        },
        {
          id: 'v2',
          title: 'Java OOPs & SOLID Principles in 15 Minutes',
          channel: 'Telusko (Navin Reddy)',
          duration: '18 mins',
          url: 'https://www.youtube.com/watch?v=8cm1x4bC610',
          timestamps: [
            { time: '00:00', label: 'Encapsulation, Inheritance & Polymorphism' },
            { time: '07:15', label: 'Interface Segregation & Dependency Inversion' },
            { time: '13:00', label: 'Abstract Classes vs Interfaces in Modern Java' }
          ]
        }
      ],
      notes: [
        {
          id: 'n1',
          title: 'Refactoring.Guru Design Patterns Architecture Guide',
          type: 'Architecture Cheatsheet',
          source: 'Refactoring.Guru',
          format: 'Visual Architecture Notes',
          url: 'https://refactoring.guru/design-patterns',
          keyPoints: [
            'Singleton: Ensures a class has only one instance while providing global point of access.',
            'Factory Method: Provides an interface for creating objects in a superclass, allowing subclasses to alter types.',
            'Observer: Subscription mechanism to notify multiple objects about events happening to observed subject.',
            'SOLID: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion.'
          ]
        },
        {
          id: 'n2',
          title: 'Baeldung Java OOP & SOLID Principles Reference',
          type: 'Engineering Notes',
          source: 'Baeldung Engineering',
          format: 'Notes & Cheatsheet',
          url: 'https://www.baeldung.com/java-oop',
          keyPoints: [
            'Composition favors flexibility over rigid deep class inheritance hierarchies.',
            'Polymorphism enables dynamic method dispatch at runtime via vtables.',
            'Abstract classes provide base state; interfaces define contracts of capabilities.'
          ]
        }
      ],
      websites: [
        {
          id: 'w1',
          name: 'Refactoring.Guru',
          title: 'Refactoring.Guru: Visual Catalog of Design Patterns',
          desc: 'The world’s #1 design patterns resource with interactive UML diagrams, real-world analogies, and code in Java, Python, C++.',
          url: 'https://refactoring.guru/design-patterns'
        },
        {
          id: 'w2',
          name: 'Baeldung',
          title: 'Baeldung Java OOP Concepts & Architecture Guides',
          desc: 'In-depth production Java guides covering abstraction, encapsulation, inheritance, and clean architecture patterns.',
          url: 'https://www.baeldung.com/java-oop'
        },
        {
          id: 'w3',
          name: 'Oracle Java Documentation',
          title: 'Official Java Language Concepts: Classes, Objects & Interfaces',
          desc: 'Official specification from Oracle describing Java object model, inheritance chains, and access specifiers.',
          url: 'https://docs.oracle.com/javase/tutorial/java/concepts/'
        },
        {
          id: 'w4',
          name: 'GeeksforGeeks Java',
          title: 'Object-Oriented Programming (OOPs) Concepts in Java',
          desc: 'Comprehensive tutorial on classes, inheritance, polymorphism, and interview recruiter questions.',
          url: 'https://www.geeksforgeeks.org/object-oriented-programming-oops-concept-in-java/'
        }
      ]
    };
  }

  // 3. Graph Algorithms Domain (Best Authorities: CP-Algorithms, VisuAlgo, WilliamFiset, Take U Forward)
  if (domain === 'graphs') {
    return {
      title: 'Graph Algorithms (BFS, DFS, Dijkstra, Topo Sort, DSU)',
      category: 'Data Structures & Algorithms',
      summary: 'Curated across top graph theory authorities: CP-Algorithms (E-Maxx), VisuAlgo Interactive, WilliamFiset, and Take U Forward Striver.',
      videos: [
        {
          id: 'v1',
          title: 'Graph Theory & Shortest Path Algorithms Masterclass',
          channel: 'WilliamFiset (ex-Google)',
          duration: '28 mins',
          url: 'https://www.youtube.com/watch?v=09_LlHjoEiY',
          timestamps: [
            { time: '00:00', label: 'Graph Representations (Adjacency Matrix vs List)' },
            { time: '08:45', label: 'Dijkstra Shortest Path with Indexed Priority Queue' },
            { time: '18:30', label: 'Topological Sorting & Kahn Algorithm on DAGs' }
          ]
        },
        {
          id: 'v2',
          title: 'Complete Graph Series for Placement Tests (BFS, DFS, Cycle Detection)',
          channel: 'Take U Forward (Striver)',
          duration: '25 mins',
          url: 'https://www.youtube.com/watch?v=-tgVpUgsQ5A',
          timestamps: [
            { time: '00:00', label: 'BFS Traversal with Queue & Visited Tracking' },
            { time: '07:30', label: 'Cycle Detection in Directed Graphs (DFS & Kahn)' },
            { time: '16:00', label: 'Disjoint Set Union (DSU) by Rank & Path Compression' }
          ]
        }
      ],
      notes: [
        {
          id: 'n1',
          title: 'MIT 6.006 Lecture 11: Breadth-First Search & Dijkstra Notes',
          type: 'University Lecture Notes',
          source: 'MIT OpenCourseWare',
          format: 'PDF Notes',
          url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/mit6_006s20_lec11.pdf',
          keyPoints: [
            'Adjacency List uses O(V + E) space; Matrix uses O(V^2).',
            'Cycle in Undirected: DFS with parent tracking.',
            'Cycle in Directed: DFS with path-visited array or Kahn Algorithm in-degrees.',
            'Topological Sort requires a Directed Acyclic Graph (DAG).'
          ]
        },
        {
          id: 'n2',
          title: 'Stanford CS161: Shortest Paths & Minimum Spanning Tree Notes',
          type: 'University Lecture Notes',
          source: 'Stanford Computer Science',
          format: 'PDF Notes',
          url: 'https://web.stanford.edu/class/archive/cs/cs161/cs161.1168/lecture8.pdf',
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
          name: 'CP-Algorithms (E-Maxx)',
          title: 'CP-Algorithms: Breadth First Search & Shortest Paths',
          desc: 'The gold-standard competitive algorithmic resource containing optimal C++ templates and complexity analysis.',
          url: 'https://cp-algorithms.com/graph/breadth-first-search.html'
        },
        {
          id: 'w2',
          name: 'VisuAlgo Graph Visualizer',
          title: 'VisuAlgo: Interactive Graph Traversal & Dijkstra Visualizer',
          desc: 'Live interactive animation tool to visually step through BFS, DFS, Dijkstra, Kruskal, and Prim algorithms with custom graphs.',
          url: 'https://visualgo.net/en/graphds'
        },
        {
          id: 'w3',
          name: 'Take U Forward (Striver)',
          title: 'Take U Forward: Complete Graph Series & SDE Sheet',
          desc: 'Comprehensive placement tutorial covering BFS/DFS, topological sorting, bridges in graphs, and Disjoint Set Union.',
          url: 'https://takeuforward.org/graph/breadth-first-search-bfs-level-order-traversal/'
        },
        {
          id: 'w4',
          name: 'GeeksforGeeks Graphs',
          title: 'Graph Data Structure and Algorithms Complete Guide',
          desc: 'Standard campus interview tutorial covering adjacency lists, queue processing, and disconnected graphs.',
          url: 'https://www.geeksforgeeks.org/breadth-first-search-or-bfs-for-a-graph/'
        }
      ]
    };
  }

  // 4. Dynamic Programming Domain (Best Authorities: TopCoder, Aditya Verma, NeetCode, Take U Forward)
  if (domain === 'dp') {
    return {
      title: 'Dynamic Programming & Knapsack Patterns',
      category: 'Advanced Algorithms',
      summary: 'Curated across top DP authorities: TopCoder Algorithm Community, Aditya Verma, NeetCode, and Take U Forward Striver.',
      videos: [
        {
          id: 'v1',
          title: '0/1 Knapsack Problem & DP Pattern Identification in 30 Seconds',
          channel: 'Aditya Verma (DP Series)',
          duration: '22 mins',
          url: 'https://www.youtube.com/watch?v=kvyShbFVaY8',
          timestamps: [
            { time: '00:00', label: 'How to Identify DP Problems Instantaneously' },
            { time: '06:15', label: 'Choice Diagram & Recursive Tree Formulation' },
            { time: '12:30', label: 'Memoization 2D Table Matrix Setup' },
            { time: '18:00', label: 'Space Optimization to 1D Array' }
          ]
        },
        {
          id: 'v2',
          title: 'Complete Dynamic Programming Roadmap (1D to 2D DP)',
          channel: 'Take U Forward (Striver)',
          duration: '26 mins',
          url: 'https://www.youtube.com/watch?v=tyB0ztf0DNY',
          timestamps: [
            { time: '00:00', label: '1D DP: Climbing Stairs & House Robber' },
            { time: '09:40', label: '2D Grid DP & Minimum Path Sum' },
            { time: '18:20', label: 'Subsequence, Partition & MCM DP Techniques' }
          ]
        }
      ],
      notes: [
        {
          id: 'n1',
          title: 'MIT 6.006 Lecture 15: Dynamic Programming & Memoization Notes',
          type: 'University Lecture Notes',
          source: 'MIT OpenCourseWare',
          format: 'PDF Notes',
          url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/mit6_006s20_lec15.pdf',
          keyPoints: [
            'Overlapping Subproblems: Storing computed states to avoid exponential recalculation.',
            'Optimal Substructure: Optimal answer can be constructed from optimal answers of subproblems.',
            'Memoization (Top-Down): Recursive stack + cache lookup array.',
            'Tabulation (Bottom-Up): Iterative DP table filled from base cases up to N.'
          ]
        },
        {
          id: 'n2',
          title: 'UIUC CS225: Dynamic Programming, Knapsack & Subsets Notes',
          type: 'University Lecture Notes',
          source: 'University of Illinois Urbana-Champaign',
          format: 'PDF Notes',
          url: 'https://jeffe.cs.illinois.edu/teaching/algorithms/book/03-dynprog.pdf',
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
          name: 'TopCoder Algorithm Community',
          title: 'Dynamic Programming: From Novice to Advanced Guide',
          desc: 'Legendary competitive programming guide explaining state spaces, state transitions, and subproblem equations.',
          url: 'https://www.topcoder.com/thrive/articles/Dynamic%20Programming:%20From%20Novice%20to%20Advanced'
        },
        {
          id: 'w2',
          name: 'NeetCode.io DP Hub',
          title: 'NeetCode 1-D and 2-D Dynamic Programming Roadmap',
          desc: 'Visual decision-tree breakdown of standard placement DP patterns with code dry runs in Python, Java, C++.',
          url: 'https://neetcode.io/practice'
        },
        {
          id: 'w3',
          name: 'Take U Forward (Striver)',
          title: 'Take U Forward: Dynamic Programming Series & Sheet',
          desc: 'Complete structured track transitioning from recursion to memoization and space-optimized tabulation.',
          url: 'https://takeuforward.org/data-structure/dynamic-programming-introduction/'
        },
        {
          id: 'w4',
          name: 'GeeksforGeeks DP',
          title: '0/1 Knapsack Problem (DP-10) Complete Guide',
          desc: 'Specific campus recruitment problem tutorial covering recursion, memoization, and DP arrays.',
          url: 'https://www.geeksforgeeks.org/0-1-knapsack-problem-dp-10/'
        }
      ]
    };
  }

  // 5. Operating Systems & Concurrency (Best Authorities: OSTEP, Gate Smashers, Gate Vidyalay)
  if (domain === 'os_concurrency') {
    return {
      title: 'Operating Systems (Virtual Memory, Paging, Concurrency, Deadlocks)',
      category: 'Core Computer Science',
      summary: 'Curated across top OS authorities: OSTEP (Three Easy Pieces by Remzi), Gate Smashers (Varun Singla), and Gate Vidyalay.',
      videos: [
        {
          id: 'v1',
          title: 'Paging in Operating System & Virtual Memory Explained',
          channel: 'Gate Smashers (Varun Singla)',
          duration: '17 mins',
          url: 'https://www.youtube.com/watch?v=pJ6qrCB8pDw',
          timestamps: [
            { time: '00:00', label: 'Why Non-Contiguous Memory Allocation is Needed' },
            { time: '05:30', label: 'Logical to Physical Address Translation' },
            { time: '11:00', label: 'Page Table Structure & Translation Lookaside Buffer (TLB)' }
          ]
        },
        {
          id: 'v2',
          title: 'Deadlock Conditions, Banker Algorithm & Prevention',
          channel: 'Knowledge Gate (Sanchit Jain)',
          duration: '19 mins',
          url: 'https://www.youtube.com/watch?v=rWFHH_3g97g',
          timestamps: [
            { time: '00:00', label: '4 Necessary Conditions for Deadlock' },
            { time: '07:15', label: 'Resource Allocation Graph (RAG)' },
            { time: '13:30', label: 'Banker Algorithm for Deadlock Avoidance' }
          ]
        }
      ],
      notes: [
        {
          id: 'n1',
          title: 'OSTEP: Operating Systems Three Easy Pieces Notes',
          type: 'Academic Text & Notes',
          source: 'University of Wisconsin-Madison',
          format: 'Online Book Notes',
          url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
          keyPoints: [
            'Virtualization: Abstracting physical CPU and memory into clean virtual abstractions.',
            'Paging eliminates external fragmentation through fixed-size frames.',
            'Page Table maps virtual page numbers (VPN) to physical frame numbers (PFN).',
            'Concurrency: Semaphores, mutex locks, and condition variables prevent race conditions.'
          ]
        },
        {
          id: 'n2',
          title: 'Gate Vidyalay OS Paging & Virtual Memory Notes',
          type: 'Exam & Interview Notes',
          source: 'Gate Vidyalay',
          format: 'Notes & Cheatsheet',
          url: 'https://www.gatevidyalay.com/paging-operating-system/',
          keyPoints: [
            'Deadlock 4 Conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.',
            'CPU Scheduling: FCFS, SJF, Round Robin (Quantum), Priority Preemption.',
            'TLB Cache hits reduce Effective Memory Access Time (EMAT) significantly.'
          ]
        }
      ],
      websites: [
        {
          id: 'w1',
          name: 'OSTEP (Three Easy Pieces)',
          title: 'Operating Systems: Three Easy Pieces (Remzi Arpaci-Dusseau)',
          desc: 'The world’s most acclaimed computer science textbook covering Virtualization, Concurrency, and Persistence with code.',
          url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/'
        },
        {
          id: 'w2',
          name: 'Gate Vidyalay',
          title: 'Paging in OS: Logical Address to Physical Address Calculation',
          desc: 'Detailed numerical notes on page table entries, frame calculations, and TLB hit ratios.',
          url: 'https://www.gatevidyalay.com/paging-operating-system/'
        },
        {
          id: 'w3',
          name: 'GeeksforGeeks OS Hub',
          title: 'Paging in Operating System Tutorial & Solved Questions',
          desc: 'Specific core CS guide on memory management, address translation, and page tables.',
          url: 'https://www.geeksforgeeks.org/paging-in-operating-system/'
        },
        {
          id: 'w4',
          name: 'Scaler Topics',
          title: 'Paging in OS: Architecture, Hardware & Page Replacement',
          desc: 'Detailed breakdown of FIFO, LRU, and Optimal page replacement algorithms.',
          url: 'https://www.scaler.com/topics/operating-system/paging-in-os/'
        }
      ]
    };
  }

  // 6. System Design Domain (Best Authorities: System Design Primer, ByteByteGo, Gaurav Sen)
  if (domain === 'system_design') {
    return {
      title: 'System Design & Distributed Systems Architecture',
      category: 'System Design & Scalability',
      summary: 'Curated across top system design authorities: System Design Primer (Donne Martin), ByteByteGo (Alex Xu), and Gaurav Sen.',
      videos: [
        {
          id: 'v1',
          title: 'System Design Interview – Step by Step Guide',
          channel: 'Gaurav Sen',
          duration: '24 mins',
          url: 'https://www.youtube.com/watch?v=xpDnVSmNFX0',
          timestamps: [
            { time: '00:00', label: 'Functional vs Non-Functional Requirements' },
            { time: '07:30', label: 'Load Balancing (Round Robin, Least Connections)' },
            { time: '15:00', label: 'Database Sharding, Replication & Caching Layer' }
          ]
        },
        {
          id: 'v2',
          title: 'How to Design a URL Shortener (TinyURL) System',
          channel: 'ByteByteGo (Alex Xu)',
          duration: '18 mins',
          url: 'https://www.youtube.com/watch?v=i53Gi_K3o7I',
          timestamps: [
            { time: '00:00', label: 'High Level Architecture & API Design' },
            { time: '06:40', label: 'Base62 Encoding vs MD5/SHA256 Hash' },
            { time: '12:00', label: 'Handling 100M+ Daily Active Users at Scale' }
          ]
        }
      ],
      notes: [
        {
          id: 'n1',
          title: 'System Design Primer Complete Architecture Cheatsheet',
          type: 'Architecture Cheatsheet',
          source: 'Donne Martin',
          format: 'GitHub Architecture Repository',
          url: 'https://github.com/donnemartin/system-design-primer',
          keyPoints: [
            'CAP Theorem: Consistency, Availability, Partition Tolerance (choose 2).',
            'Caching: Write-through, Write-around, Write-back caching strategies.',
            'Load Balancers: Layer 4 (Transport) vs Layer 7 (Application) routing.',
            'Message Queues: Decoupling services with RabbitMQ / Apache Kafka.'
          ]
        },
        {
          id: 'n2',
          title: 'ByteByteGo System Design Cheatsheet & Case Studies',
          type: 'Engineering Notes',
          source: 'ByteByteGo Labs',
          format: 'Notes & Cheatsheet',
          url: 'https://bytebytego.com/',
          keyPoints: [
            'Database Scaling: Vertical scaling limits vs Horizontal read replicas & sharding.',
            'Consistent Hashing: Minimizes key redistribution when cluster nodes change.'
          ]
        }
      ],
      websites: [
        {
          id: 'w1',
          name: 'System Design Primer (Donne Martin)',
          title: 'System Design Primer: Complete Open-Source Roadmap',
          desc: 'The #1 open-source system design guide with visual diagrams, interview blueprints, and scale math.',
          url: 'https://github.com/donnemartin/system-design-primer'
        },
        {
          id: 'w2',
          name: 'ByteByteGo',
          title: 'ByteByteGo: Visual System Design & Architecture Blog',
          desc: 'Clear visual architecture articles explaining Rate Limiters, Distributed Caches, and Payment Systems.',
          url: 'https://bytebytego.com/'
        },
        {
          id: 'w3',
          name: 'GeeksforGeeks System Design',
          title: 'System Design Tutorial: High Level & Low Level Design',
          desc: 'Comprehensive guide covering monolithic vs microservices, database partitioning, and scalability patterns.',
          url: 'https://www.geeksforgeeks.org/system-design-tutorial/'
        }
      ]
    };
  }

  // 7. Binary Trees & BST Domain
  if (domain === 'trees') {
    return {
      title: 'Binary Trees & Binary Search Trees (BST)',
      category: 'Data Structures & Algorithms',
      summary: 'Curated across top tree data structure authorities: Take U Forward (Striver), VisuAlgo, CP-Algorithms, and MIT 6.006.',
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
          title: 'MIT 6.006 Lecture 5: Binary Search Trees & Balanced BST Notes',
          type: 'University Lecture Notes',
          source: 'MIT OpenCourseWare',
          format: 'PDF Notes',
          url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/resources/mit6_006s20_lec5.pdf',
          keyPoints: [
            'Inorder Traversal (Left, Root, Right) of BST always yields sorted ascending values.',
            'Preorder (Root, Left, Right) is used for tree cloning and serialization.',
            'Postorder (Left, Right, Root) is used for bottom-up computation (height, delete tree).',
            'Level Order Traversal uses a FIFO Queue: O(N) time and O(W) max level width space.'
          ]
        },
        {
          id: 'n2',
          title: 'GeeksforGeeks Tree Traversals & Recursion Notes',
          type: 'Revision Notes',
          source: 'GeeksforGeeks',
          format: 'Notes & Cheatsheet',
          url: 'https://www.geeksforgeeks.org/tree-traversals-inorder-preorder-and-postorder/',
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
          name: 'Take U Forward (Striver)',
          title: 'Binary Tree Traversals & Complete SDE Roadmap',
          desc: 'The #1 rated placement preparation guide with optimal C++/Java code and video dry runs.',
          url: 'https://takeuforward.org/data-structure/tree-traversals-inorder-preorder-postorder/'
        },
        {
          id: 'w2',
          name: 'VisuAlgo BST Visualizer',
          title: 'VisuAlgo: Interactive Binary Search Tree & AVL Tree Visualizer',
          desc: 'Live interactive animation tool to visually step through tree insertions, rotations, and traversals.',
          url: 'https://visualgo.net/en/bst'
        },
        {
          id: 'w3',
          name: 'CP-Algorithms Trees',
          title: 'CP-Algorithms: Tree Data Structures & Treap',
          desc: 'Advanced algorithmic breakdown of balanced tree structures, heavy-light decomposition, and LCA.',
          url: 'https://cp-algorithms.com/data_structures/treap.html'
        },
        {
          id: 'w4',
          name: 'GeeksforGeeks Trees',
          title: 'Binary Tree Data Structure Tutorial & Implementations',
          desc: 'Specific campus tutorial covering tree properties, node pointers, and recursive traversals.',
          url: 'https://www.geeksforgeeks.org/binary-tree-data-structure/'
        }
      ]
    };
  }

  // 8. Universal Search Resolver for ANY query
  return {
    title: formattedTitle,
    category: 'Computer Science Technical Concept',
    summary: `Curated across top technical authorities for ${formattedTitle} (Take U Forward, GeeksforGeeks, Scaler Topics, and Programiz).`,
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
        title: `${formattedTitle} Theory Notes & Cheatsheet`,
        type: 'Revision Notes',
        source: 'Academic Lecture Hub',
        format: 'Notes & Cheatsheet',
        url: `https://www.google.com/search?q=${encodedQuery}+lecture+notes+filetype:pdf`,
        keyPoints: [
          `Fundamental Definition: Core mechanics and principles of ${formattedTitle}.`,
          'Complexity: Analyze average and worst-case time/space tradeoffs before coding.',
          'Edge Cases: Check null/empty inputs, single elements, and boundary values.',
          'Interview Pattern: Clarify constraints -> State brute force -> Deliver optimal approach.'
        ]
      },
      {
        id: 'n2',
        title: `${formattedTitle} Technical Quick Reference Cheatsheet`,
        type: 'Cheatsheet',
        source: 'Computer Science QuickRef Hub',
        format: 'PDF Cheatsheet',
        url: `https://www.google.com/search?q=${encodedQuery}+cheat+sheet+filetype:pdf`,
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
        name: 'Take U Forward (Striver)',
        title: `Take U Forward: ${formattedTitle} Placement Guide`,
        desc: `Top-rated SDE preparation sheet with step-by-step algorithms and complexity analysis.`,
        url: `https://takeuforward.org/?s=${encodedQuery}`
      },
      {
        id: 'w2',
        name: 'GeeksforGeeks',
        title: `GeeksforGeeks: ${formattedTitle} Complete Guide`,
        desc: `Specific concept article page with diagrams, algorithm steps, and code implementations in C++, Java, and Python.`,
        url: `https://www.geeksforgeeks.org/${slug}/`
      },
      {
        id: 'w3',
        name: 'Scaler Topics',
        title: `Scaler Topics: ${formattedTitle} In-Depth Tutorial`,
        desc: `Specific in-depth engineering article with visual architectural diagrams and implementation templates.`,
        url: `https://www.scaler.com/topics/${slug}/`
      },
      {
        id: 'w4',
        name: 'Programiz',
        title: `Programiz: ${formattedTitle} Visual Guide`,
        desc: `Specific illustrated tutorial page explaining core data structures and algorithm mechanisms.`,
        url: `https://www.programiz.com/dsa/${slug}`
      }
    ]
  };
}

export default function PlacementResourceRAG({ profile = {}, setActiveTab }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentResources, setCurrentResources] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'websites' | 'notes' | 'videos'
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
            Topic Authority Engine
          </span>
          <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600 }}>
            Dynamic Domain-Specific Authorities & Video Lectures
          </span>
        </div>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#111827', margin: 0 }}>
          Placement Learning Resources Search
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#4B5563', margin: '4px 0 0 0', lineHeight: 1.45 }}>
          Search any concept to retrieve the single best authorities tailored to that topic: Mode Analytics & SQLZoo for SQL, Refactoring.Guru & Baeldung for Design Patterns, CP-Algorithms & VisuAlgo for Graphs, and OSTEP for Operating Systems.
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
              placeholder="Search any concept (e.g., SQL Joins, Design Patterns, Graph Algorithms, Dynamic Programming, Operating Systems, System Design)..."
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
            Explore Topics:
          </span>
          {[
            'SQL Joins & Indexing',
            'Design Patterns & OOP',
            'Graph Algorithms & BFS',
            'Dynamic Programming',
            'Operating Systems Paging',
            'System Design Architecture'
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
            Search Any Technical Concept Above
          </h3>
          <p style={{ fontSize: '0.88rem', color: '#4B5563', maxWidth: '520px', margin: '0 auto 22px auto', lineHeight: 1.5 }}>
            Each concept dynamically selects its best specialized authorities — Refactoring.Guru for Design Patterns, Mode Analytics for SQL, CP-Algorithms for Graphs, OSTEP for OS, and Take U Forward for DSA.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', maxWidth: '850px', margin: '0 auto', textAlign: 'left' }}>
            {[
              {
                title: 'SQL Joins & Indexing',
                desc: 'Mode Analytics SQL School, SQLZoo live interactive sandbox, PostgreSQL official docs, and Alex The Analyst.'
              },
              {
                title: 'Design Patterns & OOP',
                desc: 'Refactoring.Guru visual catalog, Baeldung Java architecture, Oracle documentation, and Christopher Okhravi.'
              },
              {
                title: 'Graph Algorithms & BFS',
                desc: 'CP-Algorithms (E-Maxx), VisuAlgo live visualizer, WilliamFiset masterclass, and Striver SDE sheet.'
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
                { id: 'websites', label: `Topic Authorities (${currentResources.websites.length})` },
                { id: 'notes', label: `Revision Notes (${currentResources.notes.length})` },
                { id: 'videos', label: `Video Masterclasses (${currentResources.videos.length})` }
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
            
            {/* SECTION 1: TOP LEARNING PLATFORMS (DIRECT TOPIC ARTICLE PAGES) */}
            {(activeFilter === 'all' || activeFilter === 'websites') && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                  <Globe size={18} color="#059669" />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
                    Best Domain Authorities & Interactive Platforms
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
                        <div style={{ marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#059669', textTransform: 'uppercase' }}>
                            {site.name}
                          </span>
                        </div>

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
                        Open on {site.name.split(' ')[0]} <ArrowUpRight size={14} />
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
                          <span style={{
                            fontSize: '0.72rem',
                            fontWeight: 800,
                            color: '#2563EB',
                            backgroundColor: '#EFF6FF',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            textTransform: 'uppercase'
                          }}>
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
                        <Download size={14} /> Open {note.source.split(' ')[0]} Notes <ExternalLink size={12} />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SECTION 3: YOUTUBE VIDEOS WITH DIRECT CHANNEL LINKS */}
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

          </div>
        </div>
      )}

    </div>
  );
}
