export const COMPANY_TIERS = {
  ALL: 'All Companies (21)',
  SERVICE: 'Service-Based (IT)',
  PRODUCT: 'Product & MNCs',
  FINTECH: 'Consulting & Fintech'
};

export const COMPANY_PREP_CATALOG = [

  // ─────────────────────────────────────────────
  // 1. TCS
  // ─────────────────────────────────────────────
  {
    id: 'tcs',
    name: 'TCS',
    fullName: 'Tata Consultancy Services',
    type: 'Service-Based (IT)',
    tier: 'SERVICE',
    package: '3.36 - 9.0 LPA',
    roles: ['Ninja Developer (3.36 LPA)', 'Digital Developer (7.0 LPA)', 'Prime Engineer (9.0 LPA)'],
    logo: 'TCS',
    eligibility: '60% throughout in 10th, 12th, UG/PG with max 1 active backlog allowed at exam time.',
    overview: 'TCS NQT (National Qualifier Test) is the standardized hiring portal for Ninja, Digital, and Prime profiles. The exam tests Foundation Cognitive skills, Advanced Quantitative Aptitude, C/Java Pseudocode, and Hands-on Algorithmic Coding. NQT score determines profile upgrade from Ninja (3.36 LPA) to Digital (7.0 LPA).',
    rounds: [
      { name: 'NQT Foundation Section', duration: '75 Mins', questions: 65, marking: '+1 for correct, No negative marking', difficulty: 'Easy-Moderate', description: 'Compulsory cognitive test comprising Traits (1 Min), Numerical Ability (20 Qs, 25 Mins), Verbal Ability (25 Qs, 25 Mins), and Reasoning Ability (20 Qs, 25 Mins).' },
      { name: 'NQT Advanced Section (Digital / Prime Filter)', duration: '65 Mins', questions: 22, marking: 'High weightage for Digital & Prime profile upgrade', difficulty: 'Moderate-Hard', description: 'Advanced Quantitative & Reasoning (15 Qs, 25 Mins) + 2 Hands-on Algorithmic Coding Problems (40 Mins: 1 Easy Array/String problem + 1 Medium DP/Graph problem).' },
      { name: 'Technical Interview', duration: '30-45 Mins', questions: '12-18 Questions', marking: 'Evaluated by TCS Tech Lead Panel', difficulty: 'Moderate', description: 'In-depth assessment of C/C++/Java fundamentals, pointer arithmetic, SQL Joins & subqueries, DBMS ACID properties, OOPs pillars, and final year project architecture.' },
      { name: 'Managerial & HR Interview', duration: '20-30 Mins', questions: 'Behavioral & Scenario-based', marking: 'Communication & Relocation Check', difficulty: 'Easy', description: 'Relocation willingness across TCS campuses, night shift agreement, service bond terms, and STAR framework situational questions.' }
    ],
    topicsToCover: [
      {
        category: 'Data Structures & Algorithms',
        priority: 'High',
        weightage: '35%',
        topics: ['Array Leaders & Left Rotations', 'String Anagrams, Palindromes & Substrings', 'Linked List Reversal, Cycle Detection & Merge', 'Stack & Queue Implementation using Arrays', 'Binary Search, Two Pointers & Sliding Window', 'Recursion & Memoized DP (Fibonacci, Staircase)', 'Sorting Algorithms (Bubble, Insertion, Selection, Merge)']
      },
      {
        category: 'Computer Science Core Subjects',
        priority: 'High',
        weightage: '30%',
        topics: ['C Pointer Arithmetic, Double Pointers & malloc/free', 'DBMS SQL — SELECT, JOIN, GROUP BY, HAVING, Subqueries', 'ACID Properties, Normalization (1NF, 2NF, 3NF, BCNF)', 'OOPs — Inheritance, Polymorphism, Abstraction, Encapsulation', 'OS — Process vs Thread, Deadlock (Coffman Conditions), Scheduling', 'OS — Paging, Segmentation, Virtual Memory & Page Faults', 'CN — TCP vs UDP, OSI Layers, DNS Resolution, HTTP/HTTPS']
      },
      {
        category: 'Quantitative Aptitude',
        priority: 'High',
        weightage: '20%',
        topics: ['Number Systems & Divisibility Rules (7, 11, 13)', 'Percentages, Profit & Loss, Discount Chains', 'Time & Work, Pipes & Cisterns, Work Equivalence', 'Speed, Distance & Time, Relative Speed & Trains', 'Permutations, Combinations & Probability Basics', 'Data Interpretation — Bar Charts, Pie Charts, Tables']
      },
      {
        category: 'Logical & Verbal Reasoning',
        priority: 'Medium',
        weightage: '10%',
        topics: ['Syllogisms — All/Some/No Statement Deductions', 'Blood Relations & Family Tree Direction Mapping', 'Coding-Decoding, Series Completion & Odd One Out', 'Reading Comprehension — Main Idea & Inference Questions', 'Sentence Error Spotting, Para Jumbles & Fill in the Blanks']
      },
      {
        category: 'Programming & Pseudocode (NQT Advanced)',
        priority: 'High',
        weightage: '5%',
        topics: ['C/Java Output Prediction with Loop Tracing', 'Bitwise Operations (AND, OR, XOR, Shift)', 'Recursion Stack Frame Prediction', 'Array Algorithm Time Complexity Analysis', 'Java OOP Method Overloading vs Overriding Output']
      }
    ],
    revisionTracker: [
      { id: 'tcs_num_sys', topic: 'Number Systems & Divisibility Rules', category: 'Quantitative Aptitude', frequency: 'High (3-4 Questions)', keyFormula: 'Remainder Theorem: N = d*Q + r. Factors of N = (a+1)(b+1) for p^a * q^b.', practiceTarget: 'Solve 10 questions on unit digit powers and divisibility rules for 7, 11, 13.' },
      { id: 'tcs_time_work', topic: 'Time, Work & Pipes & Cisterns', category: 'Quantitative Aptitude', frequency: 'High (3 Questions)', keyFormula: 'Total Work = Rate * Time. Average Speed = 2xy/(x+y) for equal distances.', practiceTarget: 'Practice 8 problems on pipes & cisterns and train crossing platforms.' },
      { id: 'tcs_syllogism', topic: 'Syllogisms & Blood Relations', category: 'Logical Reasoning', frequency: 'High (4 Questions)', keyFormula: 'All A is B → All B need not be A. Use Venn Diagram overlapping methods.', practiceTarget: 'Solve 10 three-statement syllogism problems.' },
      { id: 'tcs_c_pointers', topic: 'C Pointer Arithmetic & Memory Layout', category: 'CS Core', frequency: 'High (5 Questions)', keyFormula: 'p+1 adds sizeof(*p) bytes. *p++ reads *p then moves p forward.', practiceTarget: 'Trace 15 pointer output snippets and double pointer conversions.' },
      { id: 'tcs_sql_joins', topic: 'SQL Joins, GROUP BY & HAVING', category: 'DBMS', frequency: 'High (4 Questions)', keyFormula: 'SELECT dept, COUNT(*) FROM emp GROUP BY dept HAVING COUNT(*) > 2;', practiceTarget: 'Write 8 SQL queries with INNER, LEFT, RIGHT, FULL OUTER JOINs.' },
      { id: 'tcs_arrays_coding', topic: 'Array Leaders & Rotations (Coding)', category: 'Algorithmic Coding', frequency: 'High (NQT Advanced)', keyFormula: 'Scan right to left, track max_so_far. Element is leader if >= max_so_far.', practiceTarget: 'Implement Array Leader, Zero Movement and Subarray Sum.' },
      { id: 'tcs_dp_basics', topic: 'Recursion & DP (Fibonacci, Kadane)', category: 'Algorithmic Coding', frequency: 'High (Digital Filter)', keyFormula: "Memoize: use dict to cache fib(n). Kadane's: maxSoFar = max(a[i], maxSoFar + a[i]).", practiceTarget: 'Solve Maximum Subarray Sum, Climbing Stairs, and Coin Change.' },
      { id: 'tcs_oop', topic: 'OOPs — Inheritance, Polymorphism & Abstraction', category: 'CS Fundamentals', frequency: 'High (Interview)', keyFormula: 'Compile-time polymorphism = Overloading. Runtime polymorphism = Overriding. abstract class vs interface.', practiceTarget: 'Write Java examples for each OOP pillar with live code.' },
      { id: 'tcs_os_concepts', topic: 'OS — Deadlock, Process & Thread', category: 'Operating Systems', frequency: 'Moderate (Interview)', keyFormula: 'Coffman Deadlock: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.', practiceTarget: 'Explain Banker\'s Algorithm and Thread vs Process differences.' },
      { id: 'tcs_project', topic: 'Final Year Project Architecture Walkthrough', category: 'Technical Interview', frequency: 'Mandatory (Interview)', keyFormula: 'Structure: Problem → Architecture → Tech Stack → DB Schema → Your Role → Result.', practiceTarget: 'Draw ER diagram and block diagram for your final year project.' }
    ],
    experiences: [
      {
        studentName: 'Rahul Verma', college: 'SRM Institute of Science & Technology', year: '2025', role: 'TCS Digital Engineer', status: 'Selected (7.0 LPA)', rating: 'Moderate',
        roundSummaries: [
          { roundName: 'NQT Advanced Coding Round', questionsAsked: ['Problem 1: Move all zeros to the end of array in O(N) maintaining relative order.', 'Problem 2: Find longest contiguous subarray with sum equal to target K.'], keyTakeaway: 'Both problems required optimal linear time complexity.' },
          { roundName: 'Technical Interview', questionsAsked: ['Difference between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN with query example.', 'How does Garbage Collection work in Java heap?', 'Write C code to swap two numbers using pointers without third variable.'], keyTakeaway: 'Panel asked SQL queries on paper and C pointer memory layout tracing.' }
        ],
        proTips: ['Master C pointer syntax — TCS panel asks pointer output prediction routinely.', 'Practice SQL JOIN queries handwritten without IDE.']
      }
    ],
    benchmark: [
      { role: 'Ninja Developer', ctc: '3.36 LPA', bond: '1 Year (₹50,000)', cgpaCutoff: '6.0 CGPA / 60%', keyTech: 'C, Java, SQL Basics' },
      { role: 'Digital Developer', ctc: '7.00 LPA', bond: '1 Year (₹50,000)', cgpaCutoff: '6.5 CGPA / 65%', keyTech: 'Advanced Coding, DSA, Cloud/Fullstack' },
      { role: 'Prime Engineer', ctc: '9.00 LPA', bond: '1 Year (₹50,000)', cgpaCutoff: '7.0 CGPA / 70%', keyTech: 'System Design, Advanced Algorithms, AI/ML' }
    ]
  },

  // ─────────────────────────────────────────────
  // 2. Infosys
  // ─────────────────────────────────────────────
  {
    id: 'infosys',
    name: 'Infosys',
    fullName: 'Infosys Limited',
    type: 'Service-Based (IT)',
    tier: 'SERVICE',
    package: '3.6 - 9.5 LPA',
    roles: ['Systems Engineer (3.6 LPA)', 'Specialist Programmer (6.2 LPA)', 'Power Programmer (9.5 LPA)'],
    logo: 'INF',
    eligibility: '60% or 6.0 CGPA in 10th, 12th, and Diploma/Graduation.',
    overview: 'Infosys hires via InfyTQ, HackWithInfy, and Campus Drives. InfyTQ certifies candidates through Pseudocode evaluation, Cryptarithmetic puzzles, Bitwise logic, and Hands-on Python/Java programming. InfyTQ score above 65% grants direct interview eligibility.',
    rounds: [
      { name: 'InfyTQ Certification Examination', duration: '100 Mins', questions: 54, marking: '65% Score Required for Certification', difficulty: 'Moderate', description: 'Mathematical Ability (10 Qs, 35 Mins), Reasoning (15 Qs, 25 Mins), Verbal (20 Qs, 20 Mins), Pseudo Code Debugging (5 Qs), Cryptarithmetic Puzzles (4 Qs).' },
      { name: 'HackWithInfy / Specialist Programmer Test', duration: '180 Mins', questions: 3, marking: 'Evaluates Advanced Algorithmic Mastery', difficulty: 'Hard', description: '3 Hard/Medium Coding Problems on Dynamic Programming, Graph Shortest Path, Segment Trees for Power Programmer (9.5 LPA) track.' },
      { name: 'Technical Interview', duration: '35-45 Mins', questions: '10-15 Questions', marking: 'Technical & Coding Competency', difficulty: 'Moderate', description: 'Interview on Python/Java OOP concepts, Data Structure implementations (Trees, Stacks), SQL Queries, and Web Development basics.' },
      { name: 'HR Interview', duration: '15-20 Mins', questions: 'Behavioral & Alignment', marking: 'Communication Clarity & Culture Fit', difficulty: 'Easy', description: 'Assessment on communication skills, Mysuru training readiness, and background check.' }
    ],
    topicsToCover: [
      {
        category: 'Pseudocode, Bitwise & Cryptarithmetic',
        priority: 'High',
        weightage: '35%',
        topics: ['Cryptarithmetic Addition Puzzles (SEND+MORE=MONEY style)', 'Recursion Tree Output Tracing & Stack Frame Analysis', 'Bitwise AND/OR/XOR/NOT & Bit Shift Operations', 'Data Structure Pseudocode Execution (Stack Push/Pop, Queue Enqueue/Dequeue)', 'Conditional Logic Tracing in Nested Loops', 'Function Call Return Value Prediction']
      },
      {
        category: 'Data Structures & Algorithmic Coding',
        priority: 'High',
        weightage: '30%',
        topics: ['Binary Search Tree — Insertion, Deletion, Traversal (Inorder, Preorder, Postorder)', 'Lowest Common Ancestor (LCA) in BST & Binary Tree', 'Linked List Reversal, Merging Two Sorted Lists', 'Dynamic Programming — LCS, LIS, Edit Distance', 'Graph BFS/DFS, Topological Sort & Cycle Detection', 'Sorting — Merge Sort, Quick Sort, Heap Sort', 'Hashing — HashMap Collision, Open Addressing']
      },
      {
        category: 'CS Core — OOP, DBMS, OS',
        priority: 'High',
        weightage: '20%',
        topics: ['Java/Python OOP — Inheritance, Polymorphism, Interface vs Abstract Class', 'SQL GROUP BY, HAVING, Subqueries, Correlated Subqueries', 'Database Normalization (1NF, 2NF, 3NF) & Functional Dependencies', 'OS Memory Management — Paging, Segmentation, Virtual Memory', 'OS Process Scheduling — FCFS, SJF, Round Robin, Priority']
      },
      {
        category: 'Mathematical & Reasoning Aptitude',
        priority: 'Medium',
        weightage: '10%',
        topics: ['Permutations, Combinations & Probability', 'Logarithms & Exponential Modular Arithmetic', 'Grid & Matrix Logical Puzzles', 'Critical Reasoning — Assumption, Conclusion, Strengthening']
      },
      {
        category: 'Verbal Ability & Communication',
        priority: 'Medium',
        weightage: '5%',
        topics: ['Reading Comprehension — Inference & Main Idea', 'Sentence Correction & Error Identification', 'Vocabulary — Synonyms, Antonyms, Cloze Test', 'Para Jumbles & Sentence Rearrangement']
      }
    ],
    revisionTracker: [
      { id: 'inf_cryptarithmetic', topic: 'Cryptarithmetic Addition Puzzles', category: 'InfyTQ Puzzles', frequency: 'High (4 Questions)', keyFormula: 'Leading digit of sum must be 1 (carry). Each letter maps uniquely to 0-9.', practiceTarget: 'Solve 10 Cryptarithmetic puzzles: SEND+MORE=MONEY, CROSS+ROADS=DANGER.' },
      { id: 'inf_pseudocode', topic: 'Recursion Tree Output Tracing', category: 'Pseudocode', frequency: 'High (5 Questions)', keyFormula: 'Draw call stack. Euclid GCD: gcd(a,b) = gcd(b, a%b) until b=0.', practiceTarget: 'Trace 12 recursive pseudocode tree executions in Python/Java.' },
      { id: 'inf_bitwise', topic: 'Bitwise AND/OR/XOR Transformations', category: 'Pseudocode', frequency: 'High (4 Questions)', keyFormula: 'a ^ a = 0, a ^ 0 = a. Set bit k: n | (1<<k). Check bit k: n & (1<<k).', practiceTarget: 'Solve 8 bitwise expression evaluations and bit masking MCQs.' },
      { id: 'inf_bst_lca', topic: 'Binary Search Tree & LCA Algorithms', category: 'Data Structures', frequency: 'High (HackWithInfy)', keyFormula: 'If both p,q < root.val → search left. If both > root.val → search right. Else root is LCA.', practiceTarget: 'Implement BST Inorder, LCA, and verify BST validity.' },
      { id: 'inf_oop', topic: 'Java/Python OOP Pillars & Design', category: 'CS Fundamentals', frequency: 'High (Interview)', keyFormula: 'Method Overloading = compile-time, Overriding = runtime. interface vs abstract class.', practiceTarget: 'Prepare live code examples for Method Overloading vs Overriding.' },
      { id: 'inf_dp', topic: 'Dynamic Programming — LCS & Edit Distance', category: 'Algorithms', frequency: 'High (HackWithInfy)', keyFormula: 'LCS: dp[i][j] = dp[i-1][j-1]+1 if match, else max(dp[i-1][j], dp[i][j-1]).', practiceTarget: 'Solve LCS, LIS, and 0/1 Knapsack problems.' },
      { id: 'inf_sql', topic: 'SQL HAVING vs WHERE & Subqueries', category: 'Database Systems', frequency: 'High (Interview)', keyFormula: 'WHERE filters rows before GROUP. HAVING filters groups after GROUP BY.', practiceTarget: 'Write SQL queries using GROUP BY, HAVING, and correlated subqueries.' },
      { id: 'inf_os_scheduling', topic: 'OS Process Scheduling Algorithms', category: 'Operating Systems', frequency: 'Moderate (Interview)', keyFormula: 'SJF has minimum avg waiting time. Round Robin is fair and starvation-free.', practiceTarget: 'Calculate average waiting time for FCFS, SJF, and Round Robin.' }
    ],
    experiences: [
      {
        studentName: 'Priya Sundaram', college: 'VIT Vellore', year: '2025', role: 'Digital Specialist Engineer (DSE)', status: 'Selected (6.2 LPA)', rating: 'Moderate',
        roundSummaries: [
          { roundName: 'HackWithInfy Coding Round', questionsAsked: ['Problem 1: Find minimum total cost to connect all nodes in weighted undirected graph (Kruskal / Prim MST).', 'Problem 2: Count subsegments where XOR sum equals 0.'], keyTakeaway: 'Solving 2 problems fully qualified me for the DSE interview round.' },
          { roundName: 'Technical Interview', questionsAsked: ['How do you find LCA of two nodes in a BST?', 'Explain SQL HAVING clause vs WHERE clause.', 'What is Thread-safe Singleton Pattern in Java?'], keyTakeaway: 'Interviewer asked me to write Python code for BST LCA and explain time complexity.' }
        ],
        proTips: ['Cryptarithmetic puzzles are guaranteed in InfyTQ — practice standard addition grid puzzles daily.', 'InfyTQ score above 65% opens direct DSE/Power Programmer interview tracks.']
      }
    ],
    benchmark: [
      { role: 'Systems Engineer', ctc: '3.60 LPA', bond: '1 Year', cgpaCutoff: '6.0 CGPA / 60%', keyTech: 'Python / Java, SQL Basics' },
      { role: 'Digital Specialist Engineer', ctc: '6.20 LPA', bond: '1 Year', cgpaCutoff: '6.5 CGPA / 65%', keyTech: 'Algorithms, Data Structures, DB Optimization' },
      { role: 'Power Programmer', ctc: '9.50 LPA', bond: '1 Year', cgpaCutoff: '7.0 CGPA / 70%', keyTech: 'Advanced Algorithms, Competitive Coding, System Design' }
    ]
  },

  // ─────────────────────────────────────────────
  // 3. Wipro
  // ─────────────────────────────────────────────
  {
    id: 'wipro',
    name: 'Wipro',
    fullName: 'Wipro Limited',
    type: 'Service-Based (IT)',
    tier: 'SERVICE',
    package: '3.5 - 6.5 LPA',
    roles: ['Project Engineer (3.5 LPA)', 'Turbo Engineer (6.5 LPA)'],
    logo: 'WIP',
    eligibility: '60% in 10th, 12th, and Graduation with maximum 1 backlog.',
    overview: 'Wipro NLTH (Elite National Talent Hunt) tests Quantitative Aptitude, Logical Reasoning, English Communication, Essay Writing, and Hands-on Coding. Turbo role additionally requires a separate Coding Challenge with harder problems.',
    rounds: [
      { name: 'NLTH Online Assessment', duration: '128 Mins', questions: 52, marking: 'Sectional Cutoff Required', difficulty: 'Easy-Moderate', description: 'Logical (14 Qs), Quantitative (16 Qs), English (18 Qs), Essay Writing (20 Mins), Hands-on Coding (2 Problems, 60 Mins).' },
      { name: 'Wipro Turbo Coding Challenge', duration: '60 Mins', questions: 2, marking: 'Higher Package Filter', difficulty: 'Moderate-Hard', description: '2 Advanced Coding problems on Binary Trees, Dynamic Programming, or Graph Shortest Path for Turbo Engineer (6.5 LPA) upgrade.' },
      { name: 'Technical & HR Interview', duration: '30 Mins', questions: '10-12 Questions', marking: 'Evaluation on OOPs & Project', difficulty: 'Easy-Moderate', description: 'Assessment on C/C++/Java, Data Structures, SQL, and willingness to work in shifts.' }
    ],
    topicsToCover: [
      {
        category: 'Quantitative Aptitude',
        priority: 'High',
        weightage: '30%',
        topics: ['Percentages, Profit & Loss, Discount & Markup Chains', 'Time & Work, Pipes & Cisterns, Efficiency Problems', 'Speed, Distance & Time, Relative Speed & Boats', 'Ratio & Proportion, Mixtures & Alligation', 'Number Systems, LCM & HCF, Remainder Theorems', 'Simple & Compound Interest Calculations']
      },
      {
        category: 'Logical Reasoning',
        priority: 'High',
        weightage: '25%',
        topics: ['Coding-Decoding & Series Completion', 'Blood Relations & Family Direction Maps', 'Syllogisms — All/Some/No Type Deductions', 'Clock & Calendar Problems', 'Seating Arrangements (Linear & Circular)', 'Logical Puzzles & Analytical Brain Teasers']
      },
      {
        category: 'Basic & Intermediate Coding',
        priority: 'High',
        weightage: '25%',
        topics: ['String Manipulation — Reversal, Palindrome, Frequency Count', 'Array Traversal — Search, Sort, Rotations, Sub-arrays', 'Matrix Operations — Transpose, Spiral Print, Diagonal Sum', 'Linked List — Traversal, Reversal, Node Deletion', 'Recursion — Factorial, Fibonacci, Tower of Hanoi', 'Pattern Printing — Floyd Triangle, Number Pyramids']
      },
      {
        category: 'CS Core Fundamentals',
        priority: 'Medium',
        weightage: '15%',
        topics: ['C/C++/Java OOP Basics — Classes, Objects, Constructors', 'SQL Basics — SELECT, WHERE, JOIN, ORDER BY', 'DBMS Concepts — Primary Key, Foreign Key, Relationships', 'OS Basics — Process Life Cycle, Memory Management Overview']
      },
      {
        category: 'English Verbal & Essay Writing',
        priority: 'Medium',
        weightage: '5%',
        topics: ['Essay Writing — Structured Paragraphs with Introduction, Body, Conclusion', 'Grammar — Subject-Verb Agreement, Tenses, Prepositions', 'Reading Comprehension — Inference & Main Idea', 'Vocabulary — Synonyms, Antonyms, Idioms']
      }
    ],
    revisionTracker: [
      { id: 'wip_str_coding', topic: 'String Manipulation & Palindrome Checks', category: 'NLTH Coding', frequency: 'High', keyFormula: 'Two pointer: s[left] == s[right] while left < right. Reverse: s[::-1] in Python.', practiceTarget: 'Write code for anagram check, frequency count, and first unique character.' },
      { id: 'wip_array', topic: 'Array Search, Sort & Sub-array Problems', category: 'NLTH Coding', frequency: 'High', keyFormula: 'Binary Search O(log N). Subarray sum using prefix sum array.', practiceTarget: 'Implement Binary Search and find subarray with maximum sum (Kadane).' },
      { id: 'wip_time_work', topic: 'Time & Work, Pipes & Cisterns', category: 'Quantitative Aptitude', frequency: 'High (3-4 Qs)', keyFormula: 'If A does work in a days, rate = 1/a. Pipes: fill rate - drain rate = net rate.', practiceTarget: 'Solve 8 combined work problems with fractional days.' },
      { id: 'wip_ratios', topic: 'Ratio & Proportion, Mixtures & Alligation', category: 'Quantitative Aptitude', frequency: 'Moderate (2-3 Qs)', keyFormula: 'Alligation ratio: (C2 - Cm) : (Cm - C1). Mean price is the weighted average.', practiceTarget: 'Practice 6 mixture and alligation problems.' },
      { id: 'wip_essay', topic: 'Essay Writing — Structured Paragraphs', category: 'English Communication', frequency: 'Mandatory', keyFormula: 'Structure: Hook sentence → 2 Supporting paragraphs → Conclusion. Use transition words.', practiceTarget: 'Write 2 practice essays on technology and current affairs topics.' },
      { id: 'wip_oop_basics', topic: 'C++/Java OOP Basics — Classes & Constructors', category: 'CS Fundamentals', frequency: 'Moderate (Interview)', keyFormula: 'Constructor runs at object creation. Default, Parameterized, Copy constructors.', practiceTarget: 'Write C++ class with all 3 constructor types and destructor.' }
    ],
    experiences: [
      {
        studentName: 'Arjun Menon', college: 'PSG Tech', year: '2025', role: 'Turbo Engineer', status: 'Selected (6.5 LPA)', rating: 'Easy-Moderate',
        roundSummaries: [
          { roundName: 'NLTH Coding', questionsAsked: ['Write code to find the first non-repeating character in a string.', 'Find the second largest element in an unsorted array without sorting.'], keyTakeaway: 'Use Hash Map or frequency array of size 256 for character frequency.' },
          { roundName: 'Technical Interview', questionsAsked: ['Difference between overloading and overriding in Java.', 'Write SQL query to find the second highest salary.'], keyTakeaway: 'Prepare SQL window functions for salary ranking queries.' }
        ],
        proTips: ['Essay writing checks grammar, structure, and clarity.', 'Turbo role upgrade requires clearing both coding problems with full test cases.']
      }
    ],
    benchmark: [
      { role: 'Project Engineer', ctc: '3.50 LPA', bond: '1 Year (₹75,000)', cgpaCutoff: '6.0 CGPA', keyTech: 'C, Java, SQL' },
      { role: 'Turbo Engineer', ctc: '6.50 LPA', bond: '1 Year', cgpaCutoff: '6.5 CGPA', keyTech: 'Data Structures, Algorithms, Cloud Technologies' }
    ]
  },

  // ─────────────────────────────────────────────
  // 4. Accenture
  // ─────────────────────────────────────────────
  {
    id: 'accenture',
    name: 'Accenture',
    fullName: 'Accenture plc',
    type: 'Service-Based (IT)',
    tier: 'SERVICE',
    package: '4.5 - 6.5 LPA',
    roles: ['Associate Software Engineer (4.5 LPA)', 'Advanced ASE (6.5 LPA)'],
    logo: 'ACC',
    eligibility: '65% or 6.5 CGPA with max 1 active backlog allowed.',
    overview: 'Accenture hiring tests Cognitive Ability, Technical Assessment (Pseudocode, MS Office/Common Applications, Cloud Fundamentals, Networking), and Coding. Advanced ASE role requires passing the Hands-on Coding round.',
    rounds: [
      { name: 'Cognitive & Technical Assessment', duration: '90 Mins', questions: 90, marking: 'Mandatory Sectional Cutoffs', difficulty: 'Moderate', description: 'English Ability (17 Qs), Critical Reasoning (18 Qs), Abstract Reasoning (15 Qs), Common Application & MS Office (12 Qs), Pseudocode (18 Qs), Networking & Cloud (10 Qs).' },
      { name: 'Hands-on Coding Assessment', duration: '45 Mins', questions: 2, marking: 'Filter for Advanced ASE Role', difficulty: 'Moderate', description: '2 Coding problems focusing on Arrays, Strings, Bitwise operations, and Number Theory.' },
      { name: 'Communication & HR Interview', duration: '20 Mins', questions: 'Behavioral & Situational', marking: 'Interactive Voice Test', difficulty: 'Easy', description: 'AI-driven Communication Test (Reading, Repeat, Sentence Construction) + HR Discussion.' }
    ],
    topicsToCover: [
      {
        category: 'Pseudocode & Technical Logic',
        priority: 'High',
        weightage: '35%',
        topics: ['C/C++ Loop Output Prediction — For, While, Do-While', 'Bitwise XOR, AND, OR Operations & Bit Manipulation', 'Recursion Return Value Tracing in Pseudocode', 'Conditional Switch-Case & Ternary Operator Output', 'Array Traversal Loop Pseudocode Tracing', 'String Character Index Operations']
      },
      {
        category: 'Cloud Computing & Networking Basics',
        priority: 'High',
        weightage: '20%',
        topics: ['Cloud Service Models — SaaS, PaaS, IaaS Differences', 'Cloud Deployment — Public, Private, Hybrid Cloud', 'TCP/IP Protocol Suite & OSI 7-Layer Model', 'IP Addressing — IPv4, Subnet Masks, CIDR Notation', 'DNS, DHCP, HTTP/HTTPS Protocol Functions', 'Firewalls, VPN & Network Security Fundamentals']
      },
      {
        category: 'MS Office & Common Applications',
        priority: 'High',
        weightage: '15%',
        topics: ['Microsoft Excel — VLOOKUP, HLOOKUP, Pivot Table Shortcuts', 'Excel Functions — SUM, AVERAGE, COUNTIF, IF Formulas', 'MS Word — Mail Merge, Track Changes, Styles', 'PowerPoint — Slide Transitions, Animation, Master Layout', 'Google Workspace — Drive, Sheets, Docs Collaboration']
      },
      {
        category: 'Algorithmic Coding',
        priority: 'High',
        weightage: '15%',
        topics: ['Array Frequency Count & Two-Sum Problem', 'String Compression & Run-Length Encoding', 'Number Theory — Prime Check, GCD, LCM', 'Bitwise Tricks — Check Odd/Even, Power of 2, Count Set Bits', 'Pattern Printing & Nested Loops']
      },
      {
        category: 'Quantitative & Logical Aptitude',
        priority: 'Medium',
        weightage: '15%',
        topics: ['Abstract & Pattern Reasoning', 'Critical Reasoning — Argument Evaluation', 'Verbal Analogy & Inference Questions', 'Numerical Computation — Decimals, Fractions, Percentage']
      }
    ],
    revisionTracker: [
      { id: 'acc_pseudo', topic: 'Pseudocode Bitwise & Loop Tracing', category: 'Technical Test', frequency: 'High (18 Questions)', keyFormula: 'XOR: A ^ B. a & (a-1) clears lowest set bit. Check odd: n & 1.', practiceTarget: 'Trace bitwise loop outputs and conditional pseudocode (15 exercises).' },
      { id: 'acc_cloud_saas', topic: 'Cloud Service Models (SaaS, PaaS, IaaS)', category: 'Cloud Computing', frequency: 'High (10 Questions)', keyFormula: 'SaaS = Software (Gmail). PaaS = Platform (Google App Engine). IaaS = Infrastructure (AWS EC2).', practiceTarget: 'Match 10 real-world tools to correct service model.' },
      { id: 'acc_networking', topic: 'OSI Model Layers & TCP/IP Protocols', category: 'Computer Networks', frequency: 'High (8 Questions)', keyFormula: 'OSI Layers: Physical, Data Link, Network, Transport, Session, Presentation, Application.', practiceTarget: 'Map protocols (HTTP, FTP, DNS, TCP, ARP) to their OSI layers.' },
      { id: 'acc_excel', topic: 'Excel Functions (VLOOKUP, IF, Pivot Tables)', category: 'MS Office', frequency: 'Moderate (12 Questions)', keyFormula: 'VLOOKUP(value, range, col_index, 0). COUNTIF(range, criteria).', practiceTarget: 'Practice 8 Excel formula MCQs and Pivot Table usage.' },
      { id: 'acc_array_coding', topic: 'Array Two-Sum & Frequency Count', category: 'Coding', frequency: 'High (2 Problems)', keyFormula: 'Two-Sum: use HashMap O(N). Frequency: array of 256 for ASCII chars.', practiceTarget: 'Solve Two Sum and Find Missing Number problems.' }
    ],
    experiences: [
      {
        studentName: 'Siddharth Nair', college: 'Amrita Vishwa Vidyapeetham', year: '2025', role: 'Advanced ASE', status: 'Selected (6.5 LPA)', rating: 'Moderate',
        roundSummaries: [
          { roundName: 'Technical & Coding', questionsAsked: ['Array element frequency count using HashMap.', 'Bitwise XOR subsegment sum problem.'], keyTakeaway: 'Both coding problems passed all test cases using HashMap approach.' },
          { roundName: 'Communication Test', questionsAsked: ['Read a given business paragraph.', 'Repeat a sentence played in audio.', 'Construct a sentence from jumbled words.'], keyTakeaway: 'Speak clearly and confidently without rushing through sentences.' }
        ],
        proTips: ['Prepare MS Office shortcuts and Cloud computing service model mappings.', 'AI Communication Test evaluates pronunciation clarity and sentence construction speed.']
      }
    ],
    benchmark: [
      { role: 'Associate Software Engineer', ctc: '4.50 LPA', bond: 'No Bond', cgpaCutoff: '6.5 CGPA', keyTech: 'Java, C++, Cloud Basics' },
      { role: 'Advanced ASE', ctc: '6.50 LPA', bond: 'No Bond', cgpaCutoff: '6.5 CGPA', keyTech: 'DSA, Fullstack, Cloud Architecture' }
    ]
  },

  // ─────────────────────────────────────────────
  // 5. Cognizant
  // ─────────────────────────────────────────────
  {
    id: 'cognizant',
    name: 'Cognizant',
    fullName: 'Cognizant Technology Solutions',
    type: 'Service-Based (IT)',
    tier: 'SERVICE',
    package: '4.0 - 6.75 LPA',
    roles: ['GenC (4.0 LPA)', 'GenC Elevate (4.25 LPA)', 'GenC Next (6.75 LPA)'],
    logo: 'CTS',
    eligibility: '60% throughout in 10th, 12th, and Diploma/Graduation.',
    overview: 'Cognizant GenC assessment via Skilllyzer/Mettl tests Quantitative, Logical, Verbal, Automata Fix (Debugging), and Algorithmic Coding. GenC Next requires advanced coding in DSA.',
    rounds: [
      { name: 'GenC Aptitude & Technical Test', duration: '100 Mins', questions: 45, marking: 'Sectional Pass Requirement', difficulty: 'Moderate', description: 'Quantitative (16 Qs), Logical (14 Qs), Verbal (15 Qs), Automata Fix Code Debugging (7 Problems, 20 Mins).' },
      { name: 'GenC Next Coding Assessment', duration: '120 Mins', questions: 3, marking: 'Filter for GenC Next Upgrade', difficulty: 'Hard', description: '3 Algorithmic Coding Problems on Dynamic Programming, Binary Trees, and Graph Traversal.' },
      { name: 'Technical & Behavioral Interview', duration: '30 Mins', questions: '10-15 Questions', marking: 'Code Verification & Technical', difficulty: 'Moderate', description: 'Code walkthrough of test submissions, SQL queries, DBMS concepts, and final year project review.' }
    ],
    topicsToCover: [
      {
        category: 'Automata Fix — Code Debugging',
        priority: 'High',
        weightage: '30%',
        topics: ['Off-By-One Error Fixes in Loop Boundary Conditions', 'Null Pointer & Uninitialized Variable Fixes', 'Logical Bug Corrections in Conditional Statements', 'Syntax Error Identification (Missing Semicolons, Brackets)', 'Array Index Out of Bounds Fixes', 'Infinite Loop Detection & Break Condition Repairs']
      },
      {
        category: 'Data Structures & Algorithmic Coding',
        priority: 'High',
        weightage: '30%',
        topics: ['Binary Tree — Level Order BFS, Height, Mirror', 'Dynamic Programming — Subset Sum, Coin Change, LCS', 'Graph — BFS, DFS, Cycle Detection, Shortest Path', 'Linked List — Detect Loop, Remove Nth from End, Merge', 'Heap — Kth Largest, Priority Queue Applications', 'Trie — Insert & Search for String Prefix Matching']
      },
      {
        category: 'Quantitative & Logical Aptitude',
        priority: 'High',
        weightage: '25%',
        topics: ['Percentages & Compound Interest', 'Ratio, Proportion & Mixture Problems', 'Time & Work, Pipes & Cisterns', 'Seating Arrangement & Scheduling Puzzles', 'Data Interpretation — Line Graphs, Pie Charts']
      },
      {
        category: 'CS Core — DBMS, OOP & OS',
        priority: 'Medium',
        weightage: '10%',
        topics: ['SQL — Joins, Subqueries, Window Functions', 'Database Normalization & ER Diagrams', 'OOP Pillars in Java/C++ with Code Examples', 'OS — Deadlock, Paging, Process Scheduling']
      },
      {
        category: 'Verbal Ability',
        priority: 'Low',
        weightage: '5%',
        topics: ['Grammar Error Detection & Sentence Correction', 'Reading Comprehension — Tone, Inference, Main Idea', 'Fill in the Blanks with Appropriate Vocabulary']
      }
    ],
    revisionTracker: [
      { id: 'cts_automata', topic: 'Automata Fix — Code Debugging MCQs', category: 'Debugging', frequency: 'High (7 Problems)', keyFormula: 'Check off-by-one in loop: for(i=0;i<=n;i++) should be i<n. NULL check before pointer use.', practiceTarget: 'Fix syntax and logical bugs in 10 C/C++ code snippets.' },
      { id: 'cts_dp_subset', topic: 'Dynamic Programming — Subset Sum & Coin Change', category: 'Algorithms', frequency: 'High (GenC Next)', keyFormula: 'dp[i][j] = dp[i-1][j] || dp[i-1][j-arr[i]]. Coin Change: dp[i] = min(dp[i], dp[i-coin]+1).', practiceTarget: 'Solve Subset Sum, Coin Change, and 0/1 Knapsack problems.' },
      { id: 'cts_tree_bfs', topic: 'Binary Tree Level Order BFS', category: 'Data Structures', frequency: 'High (GenC Next)', keyFormula: 'Use Queue: enqueue root, then process level by level until queue empty.', practiceTarget: 'Implement Level Order BFS and find maximum width of binary tree.' },
      { id: 'cts_graph', topic: 'Graph BFS, DFS & Cycle Detection', category: 'Algorithms', frequency: 'High (GenC Next)', keyFormula: 'BFS uses Queue, DFS uses Stack/Recursion. Cycle in directed graph: use DFS with grey/black coloring.', practiceTarget: 'Implement BFS shortest path and detect cycle in directed graph.' },
      { id: 'cts_sql_window', topic: 'SQL Window Functions & Ranking', category: 'DBMS', frequency: 'High (Interview)', keyFormula: 'RANK() OVER (PARTITION BY dept ORDER BY salary DESC). ROW_NUMBER() vs RANK() vs DENSE_RANK().', practiceTarget: 'Write SQL queries using ROW_NUMBER, RANK, and DENSE_RANK.' }
    ],
    experiences: [
      {
        studentName: 'Kavya Ramesh', college: 'SASTRA University', year: '2025', role: 'GenC Next', status: 'Selected (6.75 LPA)', rating: 'Moderate-Hard',
        roundSummaries: [
          { roundName: 'GenC Next Coding', questionsAsked: ['Tree level order traversal and print each level on a new line.', 'Array partition DP — minimize the difference between two subsets.'], keyTakeaway: 'Focus on optimal time complexity and clean code with proper variable names.' },
          { roundName: 'Technical Interview', questionsAsked: ['Explain DBMS Normalization with Banking table example.', 'What is the difference between BFS and DFS and when to use each?'], keyTakeaway: 'Relate technical concepts to real-world database examples.' }
        ],
        proTips: ['Automata fix speed is crucial — practice quick bug spotting in C/Java.', 'GenC Next coding requires optimal solutions, not brute force.']
      }
    ],
    benchmark: [
      { role: 'GenC', ctc: '4.00 LPA', bond: 'No Bond', cgpaCutoff: '6.0 CGPA', keyTech: 'C, Java, SQL' },
      { role: 'GenC Elevate', ctc: '4.25 LPA', bond: 'No Bond', cgpaCutoff: '6.0 CGPA', keyTech: 'Java, DSA, Fullstack' },
      { role: 'GenC Next', ctc: '6.75 LPA', bond: 'No Bond', cgpaCutoff: '6.5 CGPA', keyTech: 'Advanced DSA, Cloud, Microservices' }
    ]
  },

  // ─────────────────────────────────────────────
  // 6. Capgemini
  // ─────────────────────────────────────────────
  {
    id: 'capgemini',
    name: 'Capgemini',
    fullName: 'Capgemini SE',
    type: 'Service-Based (IT)',
    tier: 'SERVICE',
    package: '4.0 - 7.5 LPA',
    roles: ['Analyst (4.0 LPA)', 'Senior Analyst (7.5 LPA)'],
    logo: 'CAP',
    eligibility: '60% throughout in 10th, 12th, and Graduation.',
    overview: 'Capgemini hiring includes Pseudocode Test, English Communication, Game-based Aptitude (Grid Challenge, Motion Challenge, Deductive Reasoning), and Coding for Senior Analyst profile.',
    rounds: [
      { name: 'Pseudocode & Technical Test', duration: '30 Mins', questions: 30, marking: '+1 per correct', difficulty: 'Moderate', description: 'Data Structures, C/C++ Output Tracing, OOPs concepts, Bitwise logic, Recursion Output.' },
      { name: 'Game-based Aptitude Test', duration: '30 Mins', questions: 4, marking: 'Cognitive Speed Evaluation', difficulty: 'Moderate', description: 'Grid Challenge (Spatial Memory), Motion Challenge (Speed Estimation), Deductive Logical Reasoning Games.' },
      { name: 'English Communication Test', duration: '20 Mins', questions: 'Reading, Listening, Speaking', marking: 'Verbal Fluency & Grammar', difficulty: 'Easy-Moderate', description: 'AI-evaluated English tests on Reading Comprehension, Listening Comprehension, and Sentence Construction.' },
      { name: 'Coding & Senior Analyst Assessment', duration: '75 Mins', questions: '2 Coding + Aptitude', marking: 'Senior Analyst Qualification', difficulty: 'Moderate-Hard', description: '2 Hands-on Coding problems + Additional Aptitude MCQs for Senior Analyst upgrade.' }
    ],
    topicsToCover: [
      {
        category: 'Game-Based Aptitude (Cognitive)',
        priority: 'High',
        weightage: '30%',
        topics: ['Spatial Memory Grid Patterns — Remember and Reproduce Grid Sequences', 'Motion & Speed Estimation Challenges — Identify Faster/Slower Object', 'Deductive Logical Reasoning — Symbol Mapping & Pattern Application', 'Matrix Rotation & Visual Pattern Completion', 'Number & Symbol Sequence Memorization']
      },
      {
        category: 'Pseudocode & C/C++ Output Tracing',
        priority: 'High',
        weightage: '30%',
        topics: ['Loop Output Prediction — For, While, Do-While Nested Loops', 'Recursion Return Value Tracing', 'OOP Concept MCQs — Inheritance, Polymorphism Output', 'Bitwise Operations — AND, OR, XOR, Left/Right Shifts', 'Array Manipulation Code Tracing']
      },
      {
        category: 'Coding (Senior Analyst)',
        priority: 'High',
        weightage: '20%',
        topics: ['String Operations — Reversal, Anagram, Substring Search', 'Array Operations — Two Pointers, Sliding Window, Prefix Sum', 'Matrix Transpose & Spiral Order Traversal', 'Linked List — Reverse, Merge Sort, Cycle Detection', 'Sorting — Merge Sort, Quick Sort Time Complexity']
      },
      {
        category: 'English Communication',
        priority: 'Medium',
        weightage: '15%',
        topics: ['Business English Reading Comprehension', 'Listening — Audio Sentence Comprehension', 'Sentence Construction from Jumbled Words', 'Grammar — Tense, Subject-Verb Agreement, Articles']
      },
      {
        category: 'Quantitative Aptitude',
        priority: 'Medium',
        weightage: '5%',
        topics: ['Percentages & Compound Interest', 'Time & Work, Pipes & Cisterns', 'Ratio & Proportion, Mixtures']
      }
    ],
    revisionTracker: [
      { id: 'cap_spatial_grid', topic: 'Spatial Memory Grid Challenge', category: 'Game-Based Aptitude', frequency: 'High (Game Round)', keyFormula: 'Focus on 3x3 or 4x4 grids. Memorize position of highlighted cells in 3 seconds, reproduce immediately.', practiceTarget: 'Practice 5 grid memory simulations at increasing sizes.' },
      { id: 'cap_motion', topic: 'Motion & Speed Estimation Game', category: 'Game-Based Aptitude', frequency: 'High (Game Round)', keyFormula: 'Compare trajectories and speed: identify the object moving faster or predict collision point.', practiceTarget: 'Practice 5 motion estimation scenarios online.' },
      { id: 'cap_pseudo_oop', topic: 'OOP & Recursion Pseudocode Output', category: 'Pseudocode', frequency: 'High (30 Questions)', keyFormula: 'Virtual functions: resolved at runtime. Recursion base case prevents infinite loop.', practiceTarget: 'Trace 15 recursive and OOP code output MCQs.' },
      { id: 'cap_matrix_spiral', topic: 'Matrix Transpose & Spiral Order', category: 'Coding', frequency: 'High (Senior Analyst)', keyFormula: 'Spiral: maintain 4 boundaries (top, bottom, left, right). Shrink after each side traversal.', practiceTarget: 'Implement Matrix Spiral Order and 90-degree rotation.' },
      { id: 'cap_english_reading', topic: 'Business English Reading Comprehension', category: 'English Communication', frequency: 'Moderate', keyFormula: 'Read topic sentence first, then skim for inference keywords. Eliminate extreme/absolute options.', practiceTarget: 'Solve 5 Business English Reading Comprehension passages.' }
    ],
    experiences: [
      {
        studentName: 'Vikas Dubey', college: 'KIIT Bhubaneswar', year: '2025', role: 'Senior Analyst', status: 'Selected (7.5 LPA)', rating: 'Moderate',
        roundSummaries: [
          { roundName: 'Game-Based Aptitude', questionsAsked: ['Grid Memory Game — Reproduce highlighted cells in 4x4 grid.', 'Motion Challenge — Identify which animated ball reaches finish line first.'], keyTakeaway: 'Speed of response in game round is critical. Do not overthink.' },
          { roundName: 'Coding & Interview', questionsAsked: ['Matrix transpose and longest common prefix string.', 'Explain HashMap internal collision handling.'], keyTakeaway: 'Clean code with zero compilation errors gets full marks.' }
        ],
        proTips: ['Game-based aptitude tests require quick spatial memory responses — practice online beforehand.', 'Senior Analyst coding round tests intermediate DSA like Sliding Window and Matrix operations.']
      }
    ],
    benchmark: [
      { role: 'Analyst', ctc: '4.00 LPA', bond: 'No Bond', cgpaCutoff: '6.0 CGPA', keyTech: 'C++, Java, SQL' },
      { role: 'Senior Analyst', ctc: '7.50 LPA', bond: 'No Bond', cgpaCutoff: '6.5 CGPA', keyTech: 'DSA, Cloud, Microservices' }
    ]
  },

  // ─────────────────────────────────────────────
  // 7. Zoho
  // ─────────────────────────────────────────────
  {
    id: 'zoho',
    name: 'Zoho',
    fullName: 'Zoho Corporation',
    type: 'Product & MNCs',
    tier: 'PRODUCT',
    package: '5.6 - 12.0 LPA',
    roles: ['Software Developer (5.6 - 8.5 LPA)', 'Member Technical Staff (10.0 - 12.0 LPA)'],
    logo: 'ZHO',
    eligibility: 'No strict percentage cutoff. Raw problem-solving skills and coding capability matter most.',
    overview: 'Zoho Corporation is renowned for its 5-round practical hiring model. They test C pointer output prediction, raw string/matrix algorithms without built-in library functions, and full console application design (Railway Reservation, Call Taxi Booking, etc.).',
    rounds: [
      { name: 'C/C++ Output Tracing & Aptitude', duration: '90 Mins', questions: 25, marking: 'Elimination Round', difficulty: 'Moderate-Hard', description: '25 MCQs: complex C pointers, double pointers, dynamic memory (malloc/free), structure padding, recursion output tracing, and logical puzzles.' },
      { name: 'Basic Programming Test', duration: '120 Mins', questions: 5, marking: 'Must write working code without built-in functions', difficulty: 'Hard', description: '5 coding problems on Matrix Spirals, Custom String Searching (strstr without string.h), Substrings, Array Transformations, and Number Theory.' },
      { name: 'Advanced Programming (Console System Design)', duration: '180 Mins', questions: 1, marking: 'Console Application Architecture & Edge Cases', difficulty: 'Very Hard', description: '3-Hour live building of a fully functional console application (Railway Booking, Call Taxi, Ludo Game Engine, Invoice Generator).' },
      { name: 'Technical Deep-Dive Interview', duration: '45-60 Mins', questions: 'Code Walkthrough & DSA Review', marking: 'Code Quality & Algorithmic Efficiency', difficulty: 'Hard', description: 'Detailed code walkthrough of Stage 3 console application, Data Structure optimization questions, OOP Design Patterns, and live problem solving.' }
    ],
    topicsToCover: [
      {
        category: 'Advanced C / C++ Pointer & Memory',
        priority: 'High',
        weightage: '30%',
        topics: ['Pointer Arithmetic — p+1, p++, (*p)++, *(p++) Differences', 'Double Pointers (**p) & Pointer-to-Pointer Dereferencing', 'Dynamic Memory — malloc, calloc, realloc, free Usage', 'Structure Padding, Memory Alignment & sizeof Operator', 'Function Pointers & Callbacks in C', 'Bitwise Operations — AND, OR, XOR, NOT, Left/Right Shifts', 'File Handling — fopen, fread, fwrite, fclose in C']
      },
      {
        category: 'Matrix, String & Array Algorithms (No Built-in Libraries)',
        priority: 'High',
        weightage: '30%',
        topics: ['Matrix Spiral Order Traversal using 4 Boundary Pointers', 'Matrix 90-Degree Rotation In-Place', 'Matrix Diagonal, Anti-Diagonal & Transpose', 'Custom strstr — Substring Search without string.h', 'Custom strcmp, strcpy, strcat using Character Arrays', 'String to Integer Conversion (atoi) without stdlib', 'Array Partitioning, Leaders, and Missing Number']
      },
      {
        category: 'Console System Application Design (OOP)',
        priority: 'High',
        weightage: '25%',
        topics: ['Railway Reservation System — Berths (63), RAC (18), Waiting List (10)', 'Call Taxi Booking — Distance Fare (₹100/5km, ₹10/km after)', 'Ludo / Snake & Ladder Game Engine with Dice Simulation', 'ATM Banking Simulation — PIN, Balance, Transfer Logic', 'Invoice / Billing System — Item Catalog, GST Calculation', 'Library Management — Book Issue, Return, Fine Calculation']
      },
      {
        category: 'Data Structures & Custom Sorting Algorithms',
        priority: 'Medium',
        weightage: '10%',
        topics: ['Custom Sorting by Number of Factors', 'Linked List — Reverse, Merge Two Sorted, Detect Loop', 'Stack & Queue Using Arrays (without STL)', 'Recursion — Tower of Hanoi, Power Computation', 'Binary Search Implementation from Scratch']
      },
      {
        category: 'Number Theory & Mathematical Puzzles',
        priority: 'Medium',
        weightage: '5%',
        topics: ['Prime Number Check — Sieve of Eratosthenes', 'GCD & LCM using Euclidean Algorithm', 'Number Pattern Series & Mathematical Induction', 'Permutations & Combinations Basic Counting']
      }
    ],
    revisionTracker: [
      { id: 'zho_pointers', topic: 'Complex C Pointers & Double Pointers', category: 'C Fundamentals', frequency: 'High (MCQs)', keyFormula: 'int **p holds address of pointer to int. *(*p) dereferences twice. sizeof(struct) includes padding.', practiceTarget: 'Solve 20 C pointer output tracing exercises including structure pointer.' },
      { id: 'zho_custom_str', topic: 'Custom String Operations without string.h', category: 'Algorithmic Coding', frequency: 'High (Mandatory)', keyFormula: "Loop: while(s[i] != '\\0'). Compare chars: s[i] == t[i]. No #include <string.h>.", practiceTarget: 'Write custom strstr, strlen, strcpy, and anagram check without standard library.' },
      { id: 'zho_matrix_spiral', topic: 'Matrix Spiral Traversal & Rotation', category: 'Matrix Algorithms', frequency: 'High (Basic Programming)', keyFormula: 'Spiral: 4 boundary variables top/bottom/left/right, shrink after each direction traversal.', practiceTarget: 'Implement Matrix Spiral Order and 90-degree clockwise rotation in-place.' },
      { id: 'zho_railway', topic: 'Railway Booking System Design (OOP)', category: 'Console App Design', frequency: 'High (Advanced Programming)', keyFormula: 'Classes: Passenger, Ticket, BookingManager. Lists: Confirmed[63], RAC[18], Waiting[10]. Promote RAC on cancellation.', practiceTarget: 'Build complete Railway Reservation console app with cancel-and-promote logic.' },
      { id: 'zho_taxi', topic: 'Call Taxi Booking System Design', category: 'Console App Design', frequency: 'High (Advanced Programming)', keyFormula: 'Fare: ₹100 for first 5km, ₹10/km thereafter. Allocate nearest taxi by distance.', practiceTarget: 'Implement Taxi allocation with fare calculator and booking history.' },
      { id: 'zho_sorting_factors', topic: 'Custom Sort by Number of Factors', category: 'Algorithms', frequency: 'High (Basic Programming)', keyFormula: 'Factors of N: count divisors from 1 to sqrt(N), add 2 for each pair. Sort array by factor count.', practiceTarget: 'Implement custom comparator sort by number of factors.' }
    ],
    experiences: [
      {
        studentName: 'Karthik Raja', college: 'PSG College of Technology', year: '2025', role: 'Software Developer', status: 'Selected (8.5 LPA)', rating: 'Tough',
        roundSummaries: [
          { roundName: 'Basic Programming Test', questionsAsked: ['Problem 1: Print N x N matrix in spiral order without extra arrays.', 'Problem 2: Implement strstr (substring search) without string.h.', 'Problem 3: Sort an array based on number of factors of each element.'], keyTakeaway: 'You cannot use built-in functions. Writing custom logic from scratch is mandatory.' },
          { roundName: 'Advanced Programming', questionsAsked: ['Design a Call Taxi Booking System with 5 locations (A, B, C, D, E). Calculate distance, fare (₹100 for first 5km, ₹10/km after), allocate nearest available taxi, and display booking history.'], keyTakeaway: 'Modular OOP design with classes (Taxi, Customer, BookingManager) and full edge case validation.' }
        ],
        proTips: ['Do NOT use string.h or built-in functions — write character array loops.', 'For Advanced Programming, create modular functions and classes instead of putting everything in main().']
      }
    ],
    benchmark: [
      { role: 'Software Developer', ctc: '5.60 - 8.50 LPA', bond: 'No Bond', cgpaCutoff: 'No Cutoff', keyTech: 'C / C++, OOP, Algorithmic Thinking' },
      { role: 'Member Technical Staff', ctc: '10.00 - 12.00 LPA', bond: 'No Bond', cgpaCutoff: 'No Cutoff', keyTech: 'Advanced DSA, System Architecture, Code Design' }
    ]
  },

  // ─────────────────────────────────────────────
  // 8. Amazon
  // ─────────────────────────────────────────────
  {
    id: 'amazon',
    name: 'Amazon',
    fullName: 'Amazon.com, Inc.',
    type: 'Product & MNCs',
    tier: 'PRODUCT',
    package: '16.0 - 32.0 LPA',
    roles: ['Software Development Engineer I (SDE-1)', 'SDE Intern'],
    logo: 'AMZ',
    eligibility: '7.0+ CGPA with strong algorithmic foundation and clean coding standards.',
    overview: "Amazon hiring combines top-tier algorithmic problem solving (Trees, Graphs, DP) with strict evaluation of Amazon's 16 Leadership Principles (Customer Obsession, Ownership, Bias for Action, Dive Deep). The Bar Raiser interview is the most critical round.",
    rounds: [
      { name: 'Online Assessment (OA)', duration: '120 Mins', questions: 2, marking: 'All Test Cases Passed + Code Quality', difficulty: 'Hard', description: '2 Hard/Medium DSA Algorithmic Problems + Work Simulation Survey + Amazon 16 Leadership Principles Assessment.' },
      { name: 'Technical Interview 1 (DSA)', duration: '60 Mins', questions: 2, marking: 'Algorithmic Efficiency O(N log N)/O(N)', difficulty: 'Hard', description: 'Deep dive into Binary Trees, Heap/Priority Queue, Sliding Window, and Graph shortest path.' },
      { name: 'Technical Interview 2 (DSA & Low Level Design)', duration: '60 Mins', questions: 2, marking: 'Code Extensibility & Optimality', difficulty: 'Hard', description: 'Complex Dynamic Programming/Graph Algorithms + Low Level System Design (LLD: Design Parking Lot, File System).' },
      { name: 'Bar Raiser Interview', duration: '60 Mins', questions: 'Behavioral STAR + Hard DSA', marking: 'Must raise bar of existing Amazon SDE team', difficulty: 'Very Hard', description: 'Certified Amazon Bar Raiser: 30 Mins Leadership Principles STAR stories + 30 Mins Hard Algorithm (Graph, DP, or String).' }
    ],
    topicsToCover: [
      {
        category: 'Trees & Graph Algorithms',
        priority: 'High',
        weightage: '30%',
        topics: ['Binary Tree — All Traversals, Views (Left/Right/Top/Bottom)', 'Binary Tree — Height, Diameter, Maximum Path Sum', 'Binary Search Tree — Insert, Delete, Validate, Floor/Ceil', 'Lowest Common Ancestor (LCA) in Binary Tree & BST', 'Graph BFS/DFS — Shortest Path, Connected Components', 'Dijkstra\'s Algorithm with Min-Heap for Weighted Graphs', 'Topological Sort — BFS (Kahn\'s) & DFS Approach']
      },
      {
        category: 'Dynamic Programming & Strings',
        priority: 'High',
        weightage: '25%',
        topics: ['0/1 Knapsack & Unbounded Knapsack Variants', 'Longest Common Subsequence (LCS) & Edit Distance', 'Longest Increasing Subsequence (LIS) in O(N log N)', 'Matrix Chain Multiplication & Interval DP', 'Sliding Window — Max/Min in Window, Longest Substring', 'Trie — Insert, Search, Auto-complete & Word Break Problem', 'Rabin-Karp & KMP String Pattern Matching']
      },
      {
        category: 'Heaps, Two Pointers & Arrays',
        priority: 'High',
        weightage: '20%',
        topics: ['Min-Heap/Max-Heap — Kth Largest, Merge K Sorted Lists', 'Priority Queue Applications — Median in Stream', 'Two Pointers — Trapping Rain Water, Container with Most Water', 'Prefix Sum — Subarray Sum Equals K, Range Sum Queries', 'Binary Search on Answer — Search in Rotated Array', 'Bit Manipulation — Counting Set Bits, XOR Tricks']
      },
      {
        category: "Amazon 16 Leadership Principles (STAR Method)",
        priority: 'High',
        weightage: '15%',
        topics: ['Customer Obsession — STAR stories on user-centric decision making', 'Ownership — Going beyond your scope for team success', 'Bias for Action — Taking calculated decisions with incomplete data', 'Dive Deep — Root cause analysis and deep technical investigation', 'Have Backbone; Disagree & Commit — Constructive disagreement', 'Invent & Simplify — Creating or simplifying a complex workflow']
      },
      {
        category: 'Low Level System Design (LLD)',
        priority: 'Medium',
        weightage: '10%',
        topics: ['Design Parking Lot (Spots, Vehicles, Tickets, Payment)', 'Design In-Memory File System (Directories, Files, Navigation)', 'Design Elevator System (Scheduling, Floors, Cabin)', 'SOLID Principles — Single Responsibility, Open/Closed, Liskov, Interface Segregation, Dependency Inversion', 'Design Patterns — Singleton, Observer, Factory, Strategy']
      }
    ],
    revisionTracker: [
      { id: 'amz_tree_lca', topic: 'Binary Trees & Lowest Common Ancestor (LCA)', category: 'Trees & Graphs', frequency: 'High (OA & Technical R1)', keyFormula: 'If root is p or q → return root. Recurse left & right. If both non-null → root is LCA.', practiceTarget: 'Solve LCA of Binary Tree, BST, and Binary Tree Maximum Path Sum on LeetCode.' },
      { id: 'amz_dijkstra', topic: "Dijkstra Shortest Path with Min-Heap", category: 'Graph Algorithms', frequency: 'High', keyFormula: 'heapq push (dist, node). Relax: if d+w < dist[nei] → push new pair.', practiceTarget: 'Implement Network Delay Time and Cheapest Flights Within K Stops.' },
      { id: 'amz_dp_knapsack', topic: 'Dynamic Programming (Knapsack & Subsequences)', category: 'DP', frequency: 'High (Technical R2)', keyFormula: 'dp[i][w] = max(dp[i-1][w], val[i]+dp[i-1][w-wt[i]]). Optimize to 1D array.', practiceTarget: 'Solve 0/1 Knapsack, Coin Change, Longest Common Subsequence.' },
      { id: 'amz_sliding_window', topic: 'Sliding Window — Longest Substring & Max Window', category: 'Arrays & Strings', frequency: 'High (OA)', keyFormula: 'Use two pointers left/right. Expand right, shrink left when constraint violated.', practiceTarget: 'Solve Longest Substring Without Repeating Characters and Max Sum Subarray of Size K.' },
      { id: 'amz_heap_median', topic: 'Median from Data Stream using Two Heaps', category: 'Heap', frequency: 'High (Technical R2)', keyFormula: 'Max-heap for lower half, Min-heap for upper half. Balance sizes after each insert.', practiceTarget: 'Implement Find Median from Data Stream on LeetCode.' },
      { id: 'amz_lld_parking', topic: 'Low Level Design — Parking Lot System', category: 'System Design', frequency: 'High (Technical R2)', keyFormula: 'Classes: ParkingSpot, Vehicle, Ticket, ParkingLot, PaymentProcessor. Use Strategy pattern for payment.', practiceTarget: 'Design Parking Lot with Compact/Large/Handicapped spots, ticket generation, and payment.' },
      { id: 'amz_lp_star', topic: "Amazon 16 Leadership Principles STAR Stories", category: 'Bar Raiser Prep', frequency: 'Mandatory (Bar Raiser)', keyFormula: 'STAR = Situation → Task → Action (YOUR specific steps) → Result (Measurable outcome).', practiceTarget: 'Prepare 2 STAR stories for each of: Customer Obsession, Ownership, Bias for Action, Dive Deep.' }
    ],
    experiences: [
      {
        studentName: 'Ananya Sharma', college: 'IIT Kharagpur', year: '2025', role: 'SDE-1', status: 'Selected (28.5 LPA)', rating: 'Tough',
        roundSummaries: [
          { roundName: 'Online Assessment (OA)', questionsAsked: ['Network Delay Time — Dijkstra algorithm on directed weighted graph.', 'Reorganize String such that no two adjacent characters are identical (Max-Heap).'], keyTakeaway: 'Both problems must pass 100% test cases. Work Simulation tests Leadership Principles.' },
          { roundName: 'Bar Raiser Round', questionsAsked: ['Tell me about a time you made a decision without sufficient data (Bias for Action).', 'Design an In-Memory File System with directories and navigation.'], keyTakeaway: 'Bar Raiser focuses heavily on Amazon Leadership Principles using structured STAR method.' }
        ],
        proTips: ["Prepare 2 concrete STAR stories for every Amazon Leadership Principle.", 'Never skip edge cases: null root, empty array, single element inputs.']
      }
    ],
    benchmark: [
      { role: 'SDE Intern', ctc: '₹80,000 / month', bond: 'No Bond', cgpaCutoff: '7.0 CGPA', keyTech: 'DSA, Trees, Graphs, Clean Code' },
      { role: 'SDE-1 (Full Time)', ctc: '16.0 - 32.0 LPA', bond: 'No Bond', cgpaCutoff: '7.0 CGPA', keyTech: 'Advanced DSA, LLD, Leadership Principles' }
    ]
  },

  // ─────────────────────────────────────────────
  // 9. Microsoft
  // ─────────────────────────────────────────────
  {
    id: 'microsoft',
    name: 'Microsoft',
    fullName: 'Microsoft Corporation',
    type: 'Product & MNCs',
    tier: 'PRODUCT',
    package: '18.0 - 45.0 LPA',
    roles: ['Software Engineer (SWE I)', 'SWE Intern'],
    logo: 'MSFT',
    eligibility: '7.5+ CGPA with exceptional algorithmic skills.',
    overview: 'Microsoft hiring consists of Online Coding Assessment (Codility), 3 Technical DSA Interviews (live on Teams), and System Design round. Microsoft evaluates code cleanliness, variable naming, and modularity heavily.',
    rounds: [
      { name: 'Online Codility Coding Test', duration: '90 Mins', questions: 3, marking: 'Passed Test Cases & Optimal Time Bounds', difficulty: 'Hard', description: '3 Algorithmic Coding Problems on Codility testing Bitwise Operations, Graphs, and Dynamic Programming.' },
      { name: 'Technical Interview 1 (DSA)', duration: '60 Mins', questions: 2, marking: 'Clean Production-Ready Code', difficulty: 'Hard', description: 'Trees, Graphs, and Sliding Window problems with live code compilation on Microsoft Teams.' },
      { name: 'Technical Interview 2 (System Design & LLD)', duration: '60 Mins', questions: 'LLD + Code Architecture', marking: 'Design Patterns & Extensibility', difficulty: 'Hard', description: 'Object-Oriented Design (OOD: Design Elevator System, LRU Cache, Thread-Safe Singleton) and System Scalability.' },
      { name: 'HR & Culture Interview', duration: '30 Mins', questions: 'Behavioral & Values Alignment', marking: 'Growth Mindset & Teamwork', difficulty: 'Easy', description: 'Assessment of Growth Mindset philosophy, handling ambiguity, cross-team collaboration, and learning from failures.' }
    ],
    topicsToCover: [
      {
        category: 'Advanced Data Structures & Algorithms',
        priority: 'High',
        weightage: '35%',
        topics: ['LRU Cache Design — Doubly Linked List + HashMap for O(1) get/put', 'LFU Cache Design — Frequency Tracking with Linked List of Sets', 'Disjoint Set Union (DSU/Union-Find) for Connected Components', 'Segment Trees for Range Sum/Min/Max Queries', 'Binary Indexed Tree (Fenwick Tree) for Prefix Sum Updates', 'Monotonic Stack — Next Greater Element, Largest Rectangle in Histogram', 'Two Heaps Pattern — Median from Stream']
      },
      {
        category: 'Graph Theory & Dynamic Programming',
        priority: 'High',
        weightage: '25%',
        topics: ['Topological Sort — Kahn\'s BFS & DFS Approach', 'Shortest Path — Dijkstra, Bellman-Ford, Floyd-Warshall', 'Minimum Spanning Tree — Prim\'s & Kruskal\'s Algorithm', 'DP on Intervals — Matrix Chain Multiplication, Burst Balloons', 'DP on Trees — Maximum Independent Set, Tree DP', 'Bitmask DP — Traveling Salesman, Assignment Problems']
      },
      {
        category: 'System Design & Object Oriented Design',
        priority: 'High',
        weightage: '20%',
        topics: ['Design Elevator System — Scheduler, Floor Request Queue, Cabin States', 'Design Rate Limiter — Token Bucket, Sliding Window Log Algorithms', 'Design Thread-Safe Singleton — Double-Checked Locking', 'SOLID Principles Applied in C++/Java Code', 'Design Patterns — Factory, Builder, Observer, Strategy, Decorator', 'Microservices Architecture Basics — API Gateway, Service Discovery']
      },
      {
        category: 'Concurrency & OS Concepts',
        priority: 'Medium',
        weightage: '10%',
        topics: ['Thread Synchronization — Mutex, Semaphore, Condition Variable', 'Deadlock Prevention & Detection Strategies', 'Thread Pool Implementation & Task Queue', 'Memory Management — Stack vs Heap, Smart Pointers (C++)']
      },
      {
        category: 'Strings, Bit Manipulation & Math',
        priority: 'Medium',
        weightage: '10%',
        topics: ['KMP & Rabin-Karp String Pattern Matching', 'Bit Manipulation — XOR, Count Set Bits, Power of 2 Tricks', 'Modular Arithmetic & Fast Exponentiation', 'Combinatorics — N Choose K, Pascal\'s Triangle']
      }
    ],
    revisionTracker: [
      { id: 'msft_lru', topic: 'LRU Cache Design in O(1)', category: 'Data Structures', frequency: 'Very High', keyFormula: 'Combine Doubly Linked List with HashMap. LL maintains access order; map stores node pointers for O(1) lookup.', practiceTarget: 'Implement LRU Cache with get() and put() methods in C++/Java.' },
      { id: 'msft_segment_tree', topic: 'Segment Tree — Range Sum & Update', category: 'Advanced DS', frequency: 'High (Codility)', keyFormula: 'Build tree in O(N), query in O(log N), point update in O(log N). Node stores sum of [l, r] range.', practiceTarget: 'Implement Segment Tree for Range Sum Query and Point Update.' },
      { id: 'msft_topological', topic: 'Topological Sort (Kahn\'s Algorithm)', category: 'Graph', frequency: 'High (Technical Interview)', keyFormula: 'BFS from all nodes with in-degree 0. Reduce in-degree of neighbors, add to queue if 0.', practiceTarget: 'Solve Course Schedule and Alien Dictionary using topological sort.' },
      { id: 'msft_monotonic_stack', topic: 'Monotonic Stack — Next Greater & Histogram', category: 'Arrays', frequency: 'High', keyFormula: 'Pop stack while top element is smaller (for NGE). Width = right_boundary - left_boundary - 1.', practiceTarget: 'Solve Largest Rectangle in Histogram and Daily Temperatures.' },
      { id: 'msft_dsu', topic: 'Disjoint Set Union (DSU / Union-Find)', category: 'Graph', frequency: 'High (Codility)', keyFormula: 'find() with path compression: parent[x] = find(parent[x]). union() by rank.', practiceTarget: 'Solve Number of Connected Components and Redundant Connection.' },
      { id: 'msft_lld_elevator', topic: 'Low Level Design — Elevator System', category: 'System Design', frequency: 'High (Technical R2)', keyFormula: 'Classes: Elevator, FloorRequest, Scheduler. State Machine: IDLE, MOVING_UP, MOVING_DOWN, DOOR_OPEN.', practiceTarget: 'Design Elevator system with LOOK scheduling algorithm for floor requests.' }
    ],
    experiences: [
      {
        studentName: 'Varun Tej', college: 'BITS Pilani', year: '2025', role: 'Software Engineer', status: 'Selected (42.0 LPA)', rating: 'Hard',
        roundSummaries: [
          { roundName: 'Technical Interview 1', questionsAsked: ['Design LRU Cache in O(1) time and handle thread-safe concurrent accesses.', 'Find the number of islands in a 2D grid matrix (BFS/DFS).'], keyTakeaway: 'Focus on clean class structure, thread safety locks (mutex), and commenting code.' },
          { roundName: 'Technical Interview 2 (System Design)', questionsAsked: ['Design an Elevator System with scheduling algorithm for multiple floors.'], keyTakeaway: 'Microsoft interviewers evaluate code cleanliness, variable naming, and modularity heavily.' }
        ],
        proTips: ['Write production-quality code with meaningful variable names — not just working code.', 'Discuss time/space tradeoffs before writing a single line of code.']
      }
    ],
    benchmark: [
      { role: 'SWE Intern', ctc: '₹1,00,000 / month', bond: 'No Bond', cgpaCutoff: '7.5 CGPA', keyTech: 'Advanced DSA, C++, Java' },
      { role: 'Software Engineer (SWE I)', ctc: '18.0 - 45.0 LPA', bond: 'No Bond', cgpaCutoff: '7.5 CGPA', keyTech: 'System Design, Cloud, Advanced Algorithms' }
    ]
  },

  // ─────────────────────────────────────────────
  // 10. Google
  // ─────────────────────────────────────────────
  {
    id: 'google',
    name: 'Google',
    fullName: 'Google LLC',
    type: 'Product & MNCs',
    tier: 'PRODUCT',
    package: '22.0 - 50.0 LPA',
    roles: ['Software Engineer (L3)', 'SWE Intern'],
    logo: 'GOOG',
    eligibility: '8.0+ CGPA or top rankers in Google Kickstart / competitive coding contest ratings.',
    overview: 'Google hiring evaluates raw Algorithmic mastery, Graph theory, Dynamic Programming, and Googleyness & Leadership. Coding is done on Google Docs without IDE or auto-completion.',
    rounds: [
      { name: 'Google Coding Challenge (Online)', duration: '90 Mins', questions: 2, marking: 'Optimal Mathematical & Algorithmic Bounds', difficulty: 'Very Hard', description: '2 Hard Algorithmic & Mathematical Problems testing Segment Trees, Trie, and Graph Shortest Path.' },
      { name: 'Technical Interview 1 (Algorithms)', duration: '45 Mins', questions: '1-2 Hard Problems', marking: 'Google Coding Rubric (Optimal Time/Space)', difficulty: 'Very Hard', description: 'Live coding on Google Docs without syntax highlighting or auto-completion. Requires clean, correct code from scratch.' },
      { name: 'Technical Interview 2 (Algorithm & System Design)', duration: '45 Mins', questions: '1 DSA + 1 Design Question', marking: 'Scalability & Correctness', difficulty: 'Very Hard', description: 'Advanced algorithm + High Level System Design (HLD: Design Google Search, YouTube, Maps).' },
      { name: 'Googleyness & Cultural Fit Interview', duration: '45 Mins', questions: 'Situational & Ethical', marking: 'Googleyness Assessment', difficulty: 'Moderate', description: 'Evaluation of teamwork, handling ambiguity, ethical decision making, and inclusive collaboration.' }
    ],
    topicsToCover: [
      {
        category: 'Advanced Algorithmic Foundations',
        priority: 'High',
        weightage: '40%',
        topics: ['Trie — Insert, Search, Prefix Match, Word Break, Palindrome Pairs', 'Segment Tree — Range Sum, Range Min/Max, Lazy Propagation', 'Fenwick Tree (BIT) — Prefix Sum Updates & Range Queries', 'Heavy-Light Decomposition (HLD) for Tree Path Queries', 'Convex Hull — Graham Scan & Jarvis March Algorithm', 'Flow Networks — Ford-Fulkerson, Max-Flow Min-Cut Theorem', 'Game Theory — Nim, Grundy Numbers, Sprague-Grundy Theorem']
      },
      {
        category: 'Dynamic Programming (Hard Variants)',
        priority: 'High',
        weightage: '25%',
        topics: ['Bitmask DP — Traveling Salesman, Hamiltonian Path', 'DP on Trees — Maximum Matching, Independent Set', 'Digit DP — Count Numbers with Specific Properties in [L, R]', 'Probability DP — Expected Number of Trials Problems', 'DP on Intervals — Palindrome Partitioning, Zuma Game', 'Convex Hull Trick for DP Optimization']
      },
      {
        category: 'High Level System Design (HLD)',
        priority: 'High',
        weightage: '15%',
        topics: ['Design Google Search — Crawler, Indexer, PageRank, Query Processing', 'Design YouTube — Video Upload, CDN Distribution, Recommendation', 'Design Google Maps — Graph Shortest Path, Routing Algorithms', 'Distributed Systems — CAP Theorem, Consistent Hashing, Sharding', 'Scalability Patterns — Load Balancer, Cache (Redis), Message Queue (Kafka)']
      },
      {
        category: 'Mathematics & Combinatorics',
        priority: 'Medium',
        weightage: '10%',
        topics: ['Modular Arithmetic & Fermat\'s Little Theorem', 'Matrix Exponentiation for DP Optimization', 'FFT & Polynomial Multiplication for Large Number Problems', 'Euler Totient Function & Number Theory Theorems']
      },
      {
        category: 'Googleyness & Communication',
        priority: 'Medium',
        weightage: '10%',
        topics: ['Think-Aloud Communication while Coding', 'Handling Ambiguous Problem Statements Confidently', 'Discussing Multiple Approaches Before Coding', 'Team Conflict Resolution & Inclusive Collaboration Stories']
      }
    ],
    revisionTracker: [
      { id: 'goog_trie', topic: 'Trie Data Structure & Auto-Complete', category: 'Advanced DSA', frequency: 'High', keyFormula: 'TrieNode: children[26] + isEndOfWord. Insert O(L), Search O(L), Prefix O(L) where L = word length.', practiceTarget: 'Implement Trie insert, search, startsWith, and Word Break Problem.' },
      { id: 'goog_segment_lazy', topic: 'Segment Tree with Lazy Propagation', category: 'Advanced DS', frequency: 'High (Coding Challenge)', keyFormula: 'Lazy tag stores pending update. Push down before querying children. Range update O(log N).', practiceTarget: 'Implement Range Update + Range Sum Query using Lazy Segment Tree.' },
      { id: 'goog_bitmask_dp', topic: 'Bitmask DP — Traveling Salesman', category: 'Dynamic Programming', frequency: 'High', keyFormula: 'dp[mask][v] = min cost to visit all nodes in mask ending at v. Transition: try all unvisited nodes.', practiceTarget: 'Solve Traveling Salesman Problem and Number of Ways to Wear Different Hats.' },
      { id: 'goog_page_rank', topic: 'High Level Design — Google Search & PageRank', category: 'System Design', frequency: 'High (HLD Interview)', keyFormula: 'PageRank: PR(A) = (1-d) + d * sum(PR(T)/C(T)) for all pages T linking to A.', practiceTarget: 'Design Google Search system with crawler, inverted index, and ranking pipeline.' },
      { id: 'goog_consistent_hashing', topic: 'Consistent Hashing for Distributed Systems', category: 'Distributed Systems', frequency: 'High (System Design)', keyFormula: 'Map nodes and requests to circular ring by hash value. On node failure, only K/N keys remapped.', practiceTarget: 'Explain Consistent Hashing with node addition/removal example.' },
      { id: 'goog_googleyness', topic: 'Googleyness — Ambiguity & Ethical Scenarios', category: 'Cultural Fit', frequency: 'Mandatory', keyFormula: 'When ambiguous: ask clarifying questions → state assumptions → propose approach → get buy-in.', practiceTarget: 'Prepare 3 stories on handling ambiguity, ethical dilemmas, and cross-team collaboration.' }
    ],
    experiences: [
      {
        studentName: 'Aditya Swaminathan', college: 'IIT Madras', year: '2025', role: 'Software Engineer (L3)', status: 'Selected (48.0 LPA)', rating: 'Very Hard',
        roundSummaries: [
          { roundName: 'Technical Interview 1', questionsAsked: ['Given a 2D grid of letters, find if target word exists using Trie and DFS backtracking.', 'Design an LFU cache with O(1) get and put operations.'], keyTakeaway: 'Always analyze time complexity before writing code on Google Docs without IDE.' },
          { roundName: 'System Design Interview', questionsAsked: ['Design YouTube — Video upload, CDN caching, recommendation system, and search indexing.'], keyTakeaway: 'Start with requirements → capacity estimation → component design → deep dive into bottlenecks.' }
        ],
        proTips: ['Practice writing clean C++/Java code directly in Google Docs without IDE assistance.', 'Google values algorithmic thinking — state brute force first, then optimize with reasoning.']
      }
    ],
    benchmark: [
      { role: 'SWE Intern', ctc: '₹1,25,000 / month', bond: 'No Bond', cgpaCutoff: '8.0 CGPA', keyTech: 'Advanced Algorithms, Math, Graph Theory' },
      { role: 'Software Engineer (L3)', ctc: '22.0 - 50.0 LPA', bond: 'No Bond', cgpaCutoff: '8.0 CGPA', keyTech: 'System Architecture, Advanced DSA, Googleyness' }
    ]
  },

  // ─────────────────────────────────────────────
  // 11. Goldman Sachs
  // ─────────────────────────────────────────────
  {
    id: 'goldmansachs',
    name: 'Goldman Sachs',
    fullName: 'The Goldman Sachs Group, Inc.',
    type: 'Fintech & Consulting',
    tier: 'FINTECH',
    package: '20.0 - 35.0 LPA',
    roles: ['Engineering Analyst (20.0 - 35.0 LPA)', 'Summer Analyst Intern'],
    logo: 'GS',
    eligibility: '7.0+ CGPA with strong Quantitative Aptitude & Data Structures.',
    overview: 'Goldman Sachs hiring evaluates Quantitative Ability, Advanced Math & Probability, Algorithmic Coding, Financial Systems knowledge, and OOP Design. High negative marking in aptitude test.',
    rounds: [
      { name: 'Aptitude & Technical Assessment', duration: '135 Mins', questions: 66, marking: 'Heavy Negative Marking in Math (-0.5 per wrong)', difficulty: 'Hard', description: 'Numerical Computation (12 Qs), Advanced Mathematics & Probability (8 Qs), CS Core (15 Qs), Coding (2 Problems, 45 Mins), Essay Writing (20 Mins).' },
      { name: 'Technical Interview 1 (DSA & Math)', duration: '60 Mins', questions: '2 DSA + 2 Probability Puzzles', marking: 'Math & Coding Rigor', difficulty: 'Hard', description: 'Trees, Dynamic Programming, Heap, Matrix algorithms, and Bayesian Probability puzzles.' },
      { name: 'Technical Interview 2 (Systems & OOP)', duration: '60 Mins', questions: 'Design + Core CS', marking: 'Financial Systems Architecture', difficulty: 'Hard', description: 'Design High-Frequency Trading System, Object-Oriented Design, Multithreading, and Memory Management.' },
      { name: 'HR & Culture Interview', duration: '30 Mins', questions: 'Motivation & Ethics', marking: 'Integrity & Team Alignment', difficulty: 'Easy', description: 'Discussion on interest in financial technology, analytical mindset, and ethical decision-making in finance.' }
    ],
    topicsToCover: [
      {
        category: 'Probability & Advanced Mathematics',
        priority: 'High',
        weightage: '30%',
        topics: ['Bayes Theorem & Conditional Probability Calculations', 'Expected Value & Expected Number of Trials Problems', 'Coin, Dice & Card Probability Puzzle Classics', 'Permutations, Combinations & Binomial Distribution', 'Random Variables & Variance Calculations', 'Geometric Probability & Continuous Distributions', 'Markov Chains & Transition Matrices']
      },
      {
        category: 'Data Structures & Algorithmic Coding',
        priority: 'High',
        weightage: '30%',
        topics: ['Binary Trees — Path Sum, Diameter, Lowest Common Ancestor', 'Dynamic Programming — Longest Palindromic Subsequence, Max Stock Profit', 'Heap — Median in Stream (Two Heap Pattern)', 'Graph — Topological Sort, Shortest Path, MST (Kruskal/Prim)', 'Matrix — Spiral Order, Rotate 90 Degrees, Search in Sorted Matrix', 'String — Pattern Matching (KMP), Longest Palindromic Substring']
      },
      {
        category: 'Financial Systems & Multithreading',
        priority: 'High',
        weightage: '20%',
        topics: ['High-Frequency Trading System Architecture', 'Order Book Design — Buy/Sell Matching Engine', 'Thread Safety — Mutex, Reader-Writer Lock, Atomic Operations', 'C++ Smart Pointers — unique_ptr, shared_ptr, weak_ptr', 'Memory Layout — Stack vs Heap, Cache Locality Optimization', 'Concurrent Data Structures — Lock-Free Queue, Thread Pool']
      },
      {
        category: 'Quantitative Aptitude',
        priority: 'Medium',
        weightage: '15%',
        topics: ['Number Theory — Divisibility, Modular Arithmetic', 'Percentages, Profit & Loss, Compound Interest', 'Ratio & Proportion, Mixture & Alligation', 'Speed, Distance & Time, Relative Motion Problems']
      },
      {
        category: 'CS Core Fundamentals',
        priority: 'Medium',
        weightage: '5%',
        topics: ['OOP — Encapsulation, Inheritance, Virtual Functions, RTTI', 'DBMS — ACID Properties, SQL Transactions, Isolation Levels', 'Operating Systems — Virtual Memory, Process Synchronization']
      }
    ],
    revisionTracker: [
      { id: 'gs_probability', topic: 'Conditional Probability & Bayes Theorem', category: 'Advanced Mathematics', frequency: 'High', keyFormula: 'P(A|B) = [P(B|A) * P(A)] / P(B). E[X] = sum(x * P(x)). Geometric series: Expected coin flips for HH = 6.', practiceTarget: 'Solve 15 probability puzzles (coin flips, card draws, dice expectations, Monty Hall).' },
      { id: 'gs_expected_value', topic: 'Expected Value Problems (Gambling & Games)', category: 'Probability', frequency: 'High (Math Section)', keyFormula: 'E[fair game] = 0. For N fair coins, E[heads] = N/2. Expected rolls to get all 6 faces = 14.7.', practiceTarget: 'Solve 10 expected value problems on dice rolls, coupon collector, and random walk.' },
      { id: 'gs_median_stream', topic: 'Median from Data Stream (Two Heaps)', category: 'Heap', frequency: 'High (Technical R1)', keyFormula: 'Max-heap for lower half, Min-heap for upper half. Median = max_heap.top() if odd size.', practiceTarget: 'Implement Find Median from Data Stream on LeetCode.' },
      { id: 'gs_hft_design', topic: 'High-Frequency Trading System Architecture', category: 'Financial Systems', frequency: 'High (Technical R2)', keyFormula: 'Components: Market Data Feed → Order Book Engine → Risk Engine → Execution. Use lock-free queues for speed.', practiceTarget: 'Design Order Book with buy/sell matching engine and price-time priority.' },
      { id: 'gs_thread_safety', topic: 'Thread Safety — Mutex & Atomic Operations', category: 'Multithreading', frequency: 'High (Technical R2)', keyFormula: 'std::mutex lock()/unlock(). std::atomic<int> for lock-free counter. RAII with std::lock_guard.', practiceTarget: 'Implement thread-safe Singleton and producer-consumer queue in C++.' }
    ],
    experiences: [
      {
        studentName: 'Sneha Agarwal', college: 'IIT Delhi', year: '2025', role: 'Engineering Analyst', status: 'Selected (32.0 LPA)', rating: 'Hard',
        roundSummaries: [
          { roundName: 'Technical Interview 1', questionsAsked: ['Calculate expected number of coin flips to get 2 consecutive heads.', 'Implement Median in Stream using two heaps.'], keyTakeaway: 'Both probability puzzle rigor and optimal coding were evaluated simultaneously.' },
          { roundName: 'Technical Interview 2', questionsAsked: ['Design a thread-safe Order Book for matching buy/sell orders.', 'Explain C++ smart pointer lifecycle management.'], keyTakeaway: 'Deep understanding of concurrency and financial domain is expected at Goldman Sachs.' }
        ],
        proTips: ['Prepare probability puzzles and expected value calculations thoroughly.', 'Goldman Sachs expects financial domain awareness — study HFT systems basics.']
      }
    ],
    benchmark: [
      { role: 'Summer Analyst', ctc: '₹1,00,000 / month', bond: 'No Bond', cgpaCutoff: '7.0 CGPA', keyTech: 'Probability, DSA, C++, Java' },
      { role: 'Engineering Analyst', ctc: '20.0 - 35.0 LPA', bond: 'No Bond', cgpaCutoff: '7.0 CGPA', keyTech: 'Financial Systems, Distributed Systems, HFT Architecture' }
    ]
  },

  // ─────────────────────────────────────────────
  // 12. JPMorgan Chase
  // ─────────────────────────────────────────────
  {
    id: 'jpmorgan',
    name: 'JPMorgan Chase',
    fullName: 'JPMorgan Chase & Co.',
    type: 'Fintech & Consulting',
    tier: 'FINTECH',
    package: '14.0 - 22.0 LPA',
    roles: ['Software Engineer (SEP 14.0 - 22.0 LPA)', 'Code For Good Intern'],
    logo: 'JPM',
    eligibility: '7.0+ CGPA across computer science and circuit branches.',
    overview: 'JPMorgan Chase hires through Code For Good Hackathon and Online Technical Assessment testing Java, Python, SQL, REST APIs, and Agile teamwork. Code For Good is a 24-hour hackathon for real NGO solutions.',
    rounds: [
      { name: 'Online Hackerrank Coding Test', duration: '60 Mins', questions: 2, marking: 'All Test Cases Passed', difficulty: 'Moderate-Hard', description: '2 Coding problems on Arrays, Hash Maps, and Dynamic Programming.' },
      { name: 'Code For Good 24-Hour Hackathon', duration: '24 Hours', questions: 'Real NGO Solution Prototype', marking: 'Mentored Evaluation by JPM Senior Leads', difficulty: 'Hard', description: '24-Hour hackathon building a web/mobile solution for real non-profit NGOs, evaluated on code quality, teamwork, UX, and demo presentation.' },
      { name: 'Technical Interview', duration: '45 Mins', questions: 'Core CS + System Design', marking: 'Technical Architecture & Code Review', difficulty: 'Moderate-Hard', description: 'Discussion on Java Spring Boot, REST API design, SQL transactions, ACID properties, and Microservices basics.' },
      { name: 'HR & Culture Interview', duration: '20 Mins', questions: 'Motivation & Agile Teamwork', marking: 'Team Fit & Communication', difficulty: 'Easy', description: 'Discussion on Code For Good experience, interest in FinTech, and collaborative working style.' }
    ],
    topicsToCover: [
      {
        category: 'Java Spring Boot & Fullstack Development',
        priority: 'High',
        weightage: '30%',
        topics: ['Spring Boot REST API — @Controller, @Service, @Repository Layers', 'Spring JPA & Hibernate — Entity Mapping, Lazy vs Eager Loading', 'RESTful API Design — HTTP Methods (GET, POST, PUT, DELETE)', 'JSON Serialization — Jackson/Gson, Request/Response Mapping', 'JWT Authentication & Spring Security Basics', 'Maven/Gradle Build Tools & Dependency Management']
      },
      {
        category: 'SQL & Financial Database Systems',
        priority: 'High',
        weightage: '25%',
        topics: ['SQL Transactions — BEGIN, COMMIT, ROLLBACK, SAVEPOINT', 'Database ACID Properties in Financial Context', 'SQL Joins — INNER, LEFT, CROSS, SELF JOIN with Banking Data', 'SQL Window Functions — RANK, LAG, LEAD for Trading Analytics', 'Indexing Strategies for High-Volume Transaction Tables', 'Stored Procedures & Triggers in Financial Databases']
      },
      {
        category: 'Data Structures & Algorithmic Coding',
        priority: 'High',
        weightage: '25%',
        topics: ['HashMap/HashSet — Frequency Count, Two Sum, Subarray Problems', 'Dynamic Programming — Maximum Profit (Stock Buy/Sell)', 'Binary Search — Search in Rotated Array, Find Peak Element', 'Linked List — Merge, Reverse, Detect Loop & Remove Nth', 'Stack — Valid Parentheses, Min Stack, Evaluate Expression', 'Priority Queue — Dijkstra for Minimum Transaction Cost']
      },
      {
        category: 'Microservices & System Design Basics',
        priority: 'Medium',
        weightage: '15%',
        topics: ['Microservices vs Monolith Architecture', 'API Gateway Pattern — Routing, Rate Limiting, Auth', 'Event-Driven Architecture — Kafka for Transaction Events', 'Docker Containerization & Kubernetes Orchestration Basics', 'Service Discovery — Eureka, Load Balancing with Ribbon']
      },
      {
        category: 'Hackathon (Code For Good) Prep',
        priority: 'Medium',
        weightage: '5%',
        topics: ['React Frontend — Component Architecture, State Management (Redux)', 'Git Branching Strategy — Feature Branches, Pull Requests', 'Agile Methodology — Sprint Planning, User Stories, Daily Standups', 'Product Presentation — Problem Statement, Solution Demo, Impact Metrics']
      }
    ],
    revisionTracker: [
      { id: 'jpm_spring_rest', topic: 'Java Spring Boot REST API Architecture', category: 'Fullstack Development', frequency: 'High (Interview)', keyFormula: '@RestController handles HTTP. @Service has business logic. @Repository manages DB. @Autowired injects dependencies.', practiceTarget: 'Build a simple CRUD REST API with Spring Boot, JPA, and H2 database.' },
      { id: 'jpm_sql_transactions', topic: 'SQL Transactions & ACID in Banking Context', category: 'Database Systems', frequency: 'High (Interview)', keyFormula: 'ACID: Atomicity (all or nothing), Consistency, Isolation (concurrent txn), Durability (survived failures).', practiceTarget: 'Write SQL transaction examples for bank transfer (BEGIN, UPDATE, COMMIT/ROLLBACK).' },
      { id: 'jpm_dp_stocks', topic: 'DP — Maximum Profit from Stock Buy/Sell', category: 'Algorithmic Coding', frequency: 'High (Coding Test)', keyFormula: 'One transaction: profit = max(price[i] - min_price_seen_so_far). Unlimited: sum all rising gaps.', practiceTarget: 'Solve Best Time to Buy & Sell Stock I, II, and III (LeetCode).' },
      { id: 'jpm_cfg_react', topic: 'React Frontend — Component & State Management', category: 'Hackathon Prep', frequency: 'High (Code For Good)', keyFormula: 'useState, useEffect for lifecycle. Props for parent-child data flow. Redux for global state.', practiceTarget: 'Build a React CRUD application with REST API integration.' },
      { id: 'jpm_kafka', topic: 'Apache Kafka for Financial Transaction Events', category: 'Microservices', frequency: 'Moderate (System Design)', keyFormula: 'Producer → Topic (Partitions) → Consumer Groups. Offset tracks consumed messages. Retention = configurable time.', practiceTarget: 'Explain Kafka producer-consumer model with financial transaction event example.' }
    ],
    experiences: [
      {
        studentName: 'Rohan Deshmukh', college: 'VJTI Mumbai', year: '2025', role: 'Software Engineer (SEP)', status: 'Selected (19.5 LPA)', rating: 'Moderate',
        roundSummaries: [
          { roundName: 'Code For Good Hackathon', questionsAsked: ['Build an inventory management web portal for an NGO using React and Node.js in 24 hours.'], keyTakeaway: 'Teamwork, active communication with JPM mentors, and working demo are crucial.' },
          { roundName: 'Technical Interview', questionsAsked: ['Design a REST API for a financial transaction service.', 'Explain SQL ACID properties with a bank transfer example.'], keyTakeaway: 'Show understanding of both frontend React and backend Spring Boot architecture.' }
        ],
        proTips: ['Code For Good hackathon rewards collaborative team players over solo coders.', 'Master Java Spring Boot REST API design for JPMorgan technical interviews.']
      }
    ],
    benchmark: [
      { role: 'SEP Intern', ctc: '₹75,000 / month', bond: 'No Bond', cgpaCutoff: '7.0 CGPA', keyTech: 'Java, Python, Web, SQL' },
      { role: 'Software Engineer (SEP)', ctc: '14.0 - 22.0 LPA', bond: 'No Bond', cgpaCutoff: '7.0 CGPA', keyTech: 'Java Spring, Microservices, Cloud, Distributed DB' }
    ]
  },

  // ─────────────────────────────────────────────
  // 13. Oracle
  // ─────────────────────────────────────────────
  {
    id: 'oracle',
    name: 'Oracle',
    fullName: 'Oracle Corporation',
    type: 'Product & MNCs',
    tier: 'PRODUCT',
    package: '9.0 - 18.0 LPA',
    roles: ['Associate Software Engineer (9.0 LPA)', 'Member of Technical Staff (18.0 LPA)'],
    logo: 'ORCL',
    eligibility: '7.0+ CGPA with strong Database & Algorithmic foundations.',
    overview: 'Oracle hiring features Online Coding & Aptitude Test, 2 Technical DSA Interviews evaluating Database Internal Architecture, Algorithms, and OOP Low Level Design.',
    rounds: [
      { name: 'Online Aptitude & Coding Test', duration: '120 Mins', questions: 35, marking: 'High Cutoff Standard', difficulty: 'Hard', description: 'Quantitative (10 Qs), Logical (10 Qs), CS Core (10 Qs), Hands-on Coding (2 Problems, 60 Mins).' },
      { name: 'Technical Interview 1 (DSA & DBMS)', duration: '60 Mins', questions: '2 DSA Problems + SQL', marking: 'Code Efficiency & DB Schema', difficulty: 'Hard', description: 'Deep dive into Binary Trees, Graphs, SQL Indexing, B-Trees, ACID properties, and Isolation Levels.' },
      { name: 'Technical Interview 2 (System Design & OOP)', duration: '60 Mins', questions: 'LLD + Code Walkthrough', marking: 'Design Extensibility', difficulty: 'Hard', description: 'Low Level System Design (LLD: Design Cache, Database Connection Pool) and OOP Design Patterns.' }
    ],
    topicsToCover: [
      {
        category: 'Database Internal Architecture',
        priority: 'High',
        weightage: '35%',
        topics: ['B-Trees & B+ Tree Indexing — Clustered vs Non-Clustered', 'Transaction Isolation Levels — Read Uncommitted, Read Committed, Repeatable Read, Serializable', 'MVCC (Multi-Version Concurrency Control) in Oracle DB', 'Query Optimization — Execution Plans, Index Scans vs Full Table Scans', 'Redo Log, Undo Log & Database Recovery Mechanisms', 'Oracle SQL — Analytic Functions, Partitioning, Materialized Views']
      },
      {
        category: 'Data Structures & Algorithms',
        priority: 'High',
        weightage: '30%',
        topics: ['Binary Tree — LCA, Path Sum, Serialize & Deserialize', 'Graph — BFS/DFS, Cycle Detection, Topological Sort', 'Dynamic Programming — Palindrome Partition, Egg Drop Problem', 'Heap — Kth Smallest Element, Merge K Sorted Arrays', 'Hash Maps — Open Addressing, Chaining, Robin Hood Hashing']
      },
      {
        category: 'Object-Oriented Design & Low Level Design',
        priority: 'High',
        weightage: '20%',
        topics: ['Design Connection Pool — Pool size, Acquire/Release, Timeout Strategy', 'Design In-Memory Cache — LRU, LFU, Write-Through vs Write-Back', 'SOLID Principles Applied in Java Code', 'Observer, Strategy & Factory Design Patterns', 'Java Generics, Collections Framework Deep Dive']
      },
      {
        category: 'CS Core — OS & Networking',
        priority: 'Medium',
        weightage: '10%',
        topics: ['OS — Virtual Memory, Page Replacement (LRU, Clock, FIFO)', 'OS — Semaphores, Monitors, Producer-Consumer Problem', 'Networking — TCP Connection States, 3-Way Handshake, Sliding Window']
      },
      {
        category: 'Quantitative & Logical Aptitude',
        priority: 'Medium',
        weightage: '5%',
        topics: ['Number Systems & Modular Arithmetic', 'Probability — Conditional, Bayes, Expected Value', 'Logical Deductions & Syllogisms']
      }
    ],
    revisionTracker: [
      { id: 'orcl_btree', topic: 'Database B-Tree & B+ Tree Indexing', category: 'Database Internals', frequency: 'High', keyFormula: 'B+ Tree: all data in leaf nodes, internal nodes only keys. Fan-out = node capacity. Height = log_m(N).', practiceTarget: 'Study Clustered vs Non-Clustered Indexing and explain query performance difference.' },
      { id: 'orcl_isolation', topic: 'Transaction Isolation Levels & Anomalies', category: 'Database Systems', frequency: 'High (Interview)', keyFormula: 'Dirty Read → fixed at Read Committed. Non-Repeatable → Repeatable Read. Phantom → Serializable.', practiceTarget: 'Create concrete SQL examples for each isolation level anomaly.' },
      { id: 'orcl_mvcc', topic: 'MVCC (Multi-Version Concurrency Control)', category: 'Database Internals', frequency: 'Moderate (Interview)', keyFormula: 'Each write creates new row version with transaction timestamp. Readers see consistent snapshot without locking writers.', practiceTarget: 'Explain MVCC with timeline of 3 concurrent transactions.' },
      { id: 'orcl_connection_pool', topic: 'Database Connection Pool Design (LLD)', category: 'System Design', frequency: 'High (Technical R2)', keyFormula: 'Classes: Connection, ConnectionPool, PoolConfig. Use BlockingQueue for available connections. Timeout on acquire().', practiceTarget: 'Design thread-safe Connection Pool with min/max size and acquire timeout in Java.' },
      { id: 'orcl_query_opt', topic: 'SQL Query Optimization & Execution Plans', category: 'Database Systems', frequency: 'High (Interview)', keyFormula: 'EXPLAIN PLAN shows Index Scan (fast) vs Full Table Scan (slow). Use composite indexes for multi-column filters.', practiceTarget: 'Analyze and optimize 5 SQL queries using EXPLAIN PLAN.' }
    ],
    experiences: [
      {
        studentName: 'Siddharth Rao', college: 'NIT Surathkal', year: '2025', role: 'Member of Technical Staff', status: 'Selected (18.0 LPA)', rating: 'Hard',
        roundSummaries: [
          { roundName: 'Technical Interview 1', questionsAsked: ['How does Oracle DB implement Row-Level Locking and Isolation levels?', 'Design an in-memory LRU cache with O(1) time complexity.'], keyTakeaway: 'Deep understanding of database internals and cache design is evaluated simultaneously.' },
          { roundName: 'Technical Interview 2', questionsAsked: ['Design a Database Connection Pool with thread-safe acquire and release operations.'], keyTakeaway: 'Focus on thread safety, pool sizing strategy, and timeout handling edge cases.' }
        ],
        proTips: ['Master Database Indexing, ACID, and MVCC for Oracle technical interviews.', 'Oracle expects deep DBMS knowledge beyond just SQL queries.']
      }
    ],
    benchmark: [
      { role: 'Associate Software Engineer', ctc: '9.00 LPA', bond: 'No Bond', cgpaCutoff: '7.0 CGPA', keyTech: 'C++, Java, SQL, OS' },
      { role: 'Member of Technical Staff', ctc: '18.00 LPA', bond: 'No Bond', cgpaCutoff: '7.5 CGPA', keyTech: 'DB Internals, System Design, Advanced DSA' }
    ]
  },

  // ─────────────────────────────────────────────
  // 14. HCLTech
  // ─────────────────────────────────────────────
  {
    id: 'hcltech',
    name: 'HCLTech',
    fullName: 'HCL Technologies Limited',
    type: 'Service-Based (IT)',
    tier: 'SERVICE',
    package: '3.6 - 6.2 LPA',
    roles: ['Graduate Trainee (3.6 LPA)', 'Software Engineer (6.2 LPA)'],
    logo: 'HCL',
    eligibility: '60% throughout in 10th, 12th, and Diploma/UG.',
    overview: 'HCLTech hiring features Online Aptitude Test, Logical Reasoning, Technical MCQs (C/Java/DB), Programming Assessment, and Technical Interview.',
    rounds: [
      { name: 'Online Aptitude & Technical Assessment', duration: '75 Mins', questions: 60, marking: 'Sectional Pass Required', difficulty: 'Easy-Moderate', description: 'Quantitative Aptitude (20 Qs), Logical Reasoning (15 Qs), English Verbal (15 Qs), Technical Fundamentals C/C++/SQL (10 Qs).' },
      { name: 'Programming Assessment', duration: '45 Mins', questions: 2, marking: 'All Test Cases Passed', difficulty: 'Moderate', description: '2 Coding problems on Arrays, Strings, and Basic Data Structures in C/C++/Java/Python.' },
      { name: 'Technical & HR Interview', duration: '30 Mins', questions: '10-12 Questions', marking: 'Technical Foundations Rating', difficulty: 'Easy-Moderate', description: 'Discussion on C/Java concepts, SQL Joins, DBMS Normalization, final year project, and location preference.' }
    ],
    topicsToCover: [
      {
        category: 'C/C++/Java Programming Fundamentals',
        priority: 'High',
        weightage: '30%',
        topics: ['C Pointer Arithmetic & Memory Allocation (malloc, free)', 'C Structures, Unions & Bitfields', 'Java OOP — Classes, Inheritance, Method Overriding', 'Java Exception Handling — try-catch-finally, Custom Exceptions', 'Java Collections — ArrayList, LinkedList, HashMap, HashSet', 'Static vs Instance Methods & Variables in Java']
      },
      {
        category: 'Database Systems & SQL',
        priority: 'High',
        weightage: '25%',
        topics: ['SQL SELECT, WHERE, ORDER BY, GROUP BY, HAVING Clauses', 'SQL Joins — INNER, LEFT, RIGHT, FULL OUTER JOIN', 'SQL Subqueries — Correlated & Nested Subqueries', 'DBMS Normalization — 1NF, 2NF, 3NF with Examples', 'ER Diagram — Entities, Attributes, Relationships, Cardinality', 'Indexing — Primary Index, Secondary Index, B-Tree Basics']
      },
      {
        category: 'Algorithmic Coding',
        priority: 'High',
        weightage: '25%',
        topics: ['Array — Search, Sort, Two Pointers, Frequency Count', 'String — Reversal, Palindrome, Anagram, Substring Matching', 'Linked List — Traversal, Insertion, Deletion, Reversal', 'Recursion — Factorial, Fibonacci, Power Computation', 'Basic Graph — BFS & DFS Traversal']
      },
      {
        category: 'Quantitative & Logical Aptitude',
        priority: 'Medium',
        weightage: '15%',
        topics: ['Percentages, Profit & Loss, Simple & Compound Interest', 'Time & Work, Pipes & Cisterns', 'Ratio & Proportion, Average & Weighted Average', 'Seating Arrangement & Blood Relations', 'Coding-Decoding & Number Series']
      },
      {
        category: 'OS & Computer Science Core',
        priority: 'Medium',
        weightage: '5%',
        topics: ['OS — Process vs Thread, Context Switching', 'OS — Deadlock Conditions (Coffman) & Detection', 'Networking Basics — TCP vs UDP, OSI Model Layers']
      }
    ],
    revisionTracker: [
      { id: 'hcl_java_oop', topic: 'Java OOP & Collections Framework', category: 'Java Fundamentals', frequency: 'High', keyFormula: 'ArrayList: O(1) random access. LinkedList: O(1) insert/delete. HashMap: O(1) average get/put.', practiceTarget: 'Implement Java Inheritance, Polymorphism, and iterate over all collection types.' },
      { id: 'hcl_sql_joins', topic: 'SQL Joins & Subqueries', category: 'Database Systems', frequency: 'High', keyFormula: 'INNER JOIN: only matching rows. LEFT JOIN: all from left, null for non-matching right rows.', practiceTarget: 'Write SQL queries for all join types and second highest salary using subquery.' },
      { id: 'hcl_normalization', topic: 'DBMS Normalization (1NF to 3NF)', category: 'Database Systems', frequency: 'High (Interview)', keyFormula: '1NF: atomic values. 2NF: no partial dependency. 3NF: no transitive dependency.', practiceTarget: 'Normalize a student-course-grade table from 1NF to 3NF step by step.' },
      { id: 'hcl_array_coding', topic: 'Array & String Manipulation Problems', category: 'Coding', frequency: 'High', keyFormula: 'Frequency array: int freq[256] = {0}; freq[s[i]]++ for character frequency.', practiceTarget: 'Implement anagram check, first non-repeating character, and array rotation.' },
      { id: 'hcl_c_pointers', topic: 'C Pointer & Memory Allocation', category: 'C Fundamentals', frequency: 'Moderate (Interview)', keyFormula: 'malloc returns void*, must cast. free() releases allocated memory. Always check NULL return.', practiceTarget: 'Write C code for dynamic array creation, traversal, and free.' }
    ],
    experiences: [
      {
        studentName: 'Nisha Gupta', college: 'Chandigarh University', year: '2025', role: 'Software Engineer', status: 'Selected (6.2 LPA)', rating: 'Easy',
        roundSummaries: [
          { roundName: 'Programming Assessment', questionsAsked: ['Find second largest element in array.', 'Check if a string is a palindrome ignoring spaces and case.'], keyTakeaway: 'Both problems were easy-moderate level. Pass all test cases with edge case handling.' },
          { roundName: 'Technical Interview', questionsAsked: ['Explain DBMS Normalization 1NF to 3NF with real table examples.', 'What is the difference between ArrayList and LinkedList in Java?'], keyTakeaway: 'Provide clear real-world banking/employee table examples for DBMS normalization.' }
        ],
        proTips: ['Revise basic C control structures, Java Collections, and SQL JOIN queries.', 'HCLTech technical interview is straightforward — master fundamentals thoroughly.']
      }
    ],
    benchmark: [
      { role: 'Graduate Trainee', ctc: '3.60 LPA', bond: '1 Year', cgpaCutoff: '6.0 CGPA', keyTech: 'C, SQL, Java Basics' },
      { role: 'Software Engineer', ctc: '6.20 LPA', bond: '1 Year', cgpaCutoff: '6.5 CGPA', keyTech: 'Java, Cloud, Web Technologies' }
    ]
  },

  // ─────────────────────────────────────────────
  // 15. Tech Mahindra
  // ─────────────────────────────────────────────
  {
    id: 'techm',
    name: 'Tech Mahindra',
    fullName: 'Tech Mahindra Limited',
    type: 'Service-Based (IT)',
    tier: 'SERVICE',
    package: '3.5 - 5.5 LPA',
    roles: ['Associate Software Engineer (3.5 LPA)', 'Software Engineer (5.5 LPA)'],
    logo: 'TM',
    eligibility: '60% throughout in 10th, 12th, and Graduation.',
    overview: 'Tech Mahindra process includes Aptitude Test, Psychometric Evaluation, English Essay, Coding Assessment, and Technical Interview. Known for strong telecom domain focus.',
    rounds: [
      { name: 'Online Aptitude & Technical Assessment', duration: '75 Mins', questions: 75, marking: 'Sectional Pass Required', difficulty: 'Easy-Moderate', description: 'Quantitative (20 Qs), Logical (20 Qs), Verbal (20 Qs), Technical MCQs (15 Qs).' },
      { name: 'Coding & Psychometric Assessment', duration: '45 Mins', questions: '2 Coding + Psychometric Survey', marking: 'Personality & Technical Fit', difficulty: 'Moderate', description: '2 Hands-on Coding problems + Personality evaluation test.' },
      { name: 'Technical & HR Discussion', duration: '25 Mins', questions: 'Behavioral & Core CS', marking: 'Communication & Technical Check', difficulty: 'Easy', description: 'Assessment of OOPs, C/Java basics, and relocation willingness.' }
    ],
    topicsToCover: [
      {
        category: 'Core Programming — C/C++/Java',
        priority: 'High',
        weightage: '30%',
        topics: ['C Loops, Functions, Arrays & Strings', 'Java OOP — Encapsulation, Inheritance, Polymorphism', 'Java Static Members, Constructors, Abstract Classes', 'C++ Pointers, References & Memory Management', 'Exception Handling in Java — try-catch-throws', 'File I/O Operations in C/Java']
      },
      {
        category: 'Data Structures & Algorithms',
        priority: 'High',
        weightage: '25%',
        topics: ['Arrays — Searching (Linear, Binary), Sorting (Bubble, Selection, Insertion)', 'Strings — Reversal, Anagram, Palindrome, String Compression', 'Linked List — Singly Linked, Doubly Linked, Circular', 'Stack & Queue — Applications (Balanced Parentheses, BFS)', 'Recursion & Backtracking Basics']
      },
      {
        category: 'Database & SQL Fundamentals',
        priority: 'Medium',
        weightage: '20%',
        topics: ['SQL DDL — CREATE, ALTER, DROP, TRUNCATE', 'SQL DML — INSERT, UPDATE, DELETE, SELECT', 'SQL Joins — INNER, LEFT, RIGHT JOIN', 'DBMS Keys — Primary, Foreign, Candidate, Super Key', 'Normalization — 1NF, 2NF, 3NF Overview']
      },
      {
        category: 'Quantitative & Logical Aptitude',
        priority: 'Medium',
        weightage: '20%',
        topics: ['Percentages, Profit & Loss', 'Time & Work, Pipes & Cisterns', 'Average, Ratio & Proportion', 'Clock & Calendar Problems', 'Blood Relations, Seating Arrangement', 'Coding-Decoding & Series Completion']
      },
      {
        category: 'Verbal & Communication',
        priority: 'Low',
        weightage: '5%',
        topics: ['English Grammar — Tenses, Articles, Prepositions', 'Reading Comprehension Passages', 'Vocabulary — Synonyms, Antonyms', 'Sentence Correction & Error Identification']
      }
    ],
    revisionTracker: [
      { id: 'tm_oop', topic: 'Java OOP — Abstract Classes vs Interfaces', category: 'Java Fundamentals', frequency: 'High (Interview)', keyFormula: 'Abstract class: partial implementation, has constructors. Interface: 100% abstract (before Java 8), no constructor.', practiceTarget: 'Write Java code examples showing abstract class and interface usage.' },
      { id: 'tm_sorting', topic: 'Sorting Algorithms & Time Complexity', category: 'Algorithms', frequency: 'High', keyFormula: 'Bubble Sort O(N²). Merge Sort O(N log N). Quick Sort O(N log N) avg, O(N²) worst.', practiceTarget: 'Implement Bubble Sort, Insertion Sort, and Merge Sort from scratch.' },
      { id: 'tm_sql_basics', topic: 'SQL DDL/DML & Joins', category: 'Database', frequency: 'Moderate (Interview)', keyFormula: 'DDL: CREATE/DROP/ALTER. DML: SELECT/INSERT/UPDATE/DELETE. JOIN: match on common column.', practiceTarget: 'Write SQL for student-course-marks schema with JOINs and GROUP BY.' },
      { id: 'tm_linked_list', topic: 'Linked List — Reversal & Merge', category: 'Data Structures', frequency: 'High (Coding)', keyFormula: 'Reverse: track prev, curr, next. While curr: next=curr.next, curr.next=prev, prev=curr, curr=next.', practiceTarget: 'Implement iterative and recursive Linked List reversal.' }
    ],
    experiences: [
      {
        studentName: 'Rohan Joshi', college: 'Pune University', year: '2025', role: 'Software Engineer', status: 'Selected (5.5 LPA)', rating: 'Easy-Moderate',
        roundSummaries: [
          { roundName: 'Technical Round', questionsAsked: ['Explain static keyword in C++ and Java.', 'Write code to find the factorial of a number using recursion.', 'Difference between DELETE and TRUNCATE in SQL.'], keyTakeaway: 'Static variables retain memory allocation across function calls. TRUNCATE is DDL (cannot rollback).' }
        ],
        proTips: ['Be clear and confident in your communication test.', 'Review C/Java static, final, and abstract keywords thoroughly.']
      }
    ],
    benchmark: [
      { role: 'Associate Software Engineer', ctc: '3.50 LPA', bond: '2 Years (₹1,00,000)', cgpaCutoff: '6.0 CGPA', keyTech: 'C, C++, SQL' },
      { role: 'Software Engineer', ctc: '5.50 LPA', bond: '2 Years', cgpaCutoff: '6.5 CGPA', keyTech: 'Java, Python, Web Development' }
    ]
  },

  // ─────────────────────────────────────────────
  // 16. LTIMindtree
  // ─────────────────────────────────────────────
  {
    id: 'ltimindtree',
    name: 'LTIMindtree',
    fullName: 'LTIMindtree Limited',
    type: 'Service-Based (IT)',
    tier: 'SERVICE',
    package: '4.15 - 6.5 LPA',
    roles: ['Software Engineer (4.15 LPA)', 'Senior Software Engineer (6.5 LPA)'],
    logo: 'LTI',
    eligibility: '60% throughout in 10th, 12th, and Diploma/Graduation.',
    overview: 'LTIMindtree evaluates Psychometric, Quantitative Aptitude, Technical MCQs (Java, SQL, Web), Hands-on Coding, and Technical Interview.',
    rounds: [
      { name: 'Online Aptitude & Technical Assessment', duration: '90 Mins', questions: 60, marking: 'Sectional Cutoff Required', difficulty: 'Moderate', description: 'Quantitative Aptitude (20 Qs), Logical Reasoning (15 Qs), Verbal (15 Qs), Technical MCQs — Java, SQL, Web (10 Qs).' },
      { name: 'Hands-on Coding Assessment', duration: '45 Mins', questions: 2, marking: 'Higher Package Filter', difficulty: 'Moderate', description: '2 Coding problems on Strings, Arrays, and Dynamic Programming Basics.' },
      { name: 'Technical & HR Interview', duration: '30 Mins', questions: '10-15 Questions', marking: 'Technical Foundations & Fit', difficulty: 'Moderate', description: 'Interview on Java OOPs, SQL Subqueries, HTML/CSS/JS Basics, and final year project.' }
    ],
    topicsToCover: [
      {
        category: 'Java Core & Collections Framework',
        priority: 'High',
        weightage: '30%',
        topics: ['Java OOP — Inheritance, Polymorphism, Abstract Class, Interface', 'Java Generics — Generic Methods, Bounded Type Parameters', 'Collections — ArrayList, LinkedList, HashMap, TreeMap, HashSet, TreeSet', 'Comparable vs Comparator for Custom Sorting', 'Java 8 Streams — filter, map, collect, forEach, reduce', 'Lambda Expressions & Functional Interfaces']
      },
      {
        category: 'Web Technologies — HTML, CSS, JS',
        priority: 'Medium',
        weightage: '20%',
        topics: ['HTML5 — Semantic Tags (header, nav, section, article, footer)', 'CSS3 — Flexbox, Grid, Media Queries, Transitions, Animations', 'JavaScript — DOM Manipulation, Event Listeners, Promises, Async/Await', 'REST API Concepts — HTTP Methods, Status Codes, JSON', 'React Basics — JSX, Components, Props, State, useEffect Hook']
      },
      {
        category: 'SQL & Database Systems',
        priority: 'High',
        weightage: '20%',
        topics: ['SQL Joins — INNER, LEFT, RIGHT, SELF JOIN', 'SQL Subqueries — Nested & Correlated', 'SQL Aggregate Functions — COUNT, SUM, AVG, MAX, MIN', 'SQL Window Functions — ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG', 'DBMS Normalization — 1NF to 3NF with Employee-Department Examples', 'Indexing Strategies & Query Optimization']
      },
      {
        category: 'Data Structures & Algorithmic Coding',
        priority: 'High',
        weightage: '25%',
        topics: ['String — Reversal, Anagram, Longest Palindromic Substring', 'Array — Two Sum, Three Sum, Sliding Window', 'Linked List — Reverse, Detect Loop, Merge Sorted Lists', 'Dynamic Programming — LCS, Coin Change, 0/1 Knapsack', 'Sorting — Merge Sort, Quick Sort Implementation']
      },
      {
        category: 'Quantitative & Verbal Aptitude',
        priority: 'Medium',
        weightage: '5%',
        topics: ['Percentages, Profit & Loss', 'Time & Work, Ratio & Proportion', 'Reading Comprehension & Vocabulary']
      }
    ],
    revisionTracker: [
      { id: 'lti_java_streams', topic: 'Java 8 Streams & Lambda Expressions', category: 'Java Core', frequency: 'High (Interview)', keyFormula: 'list.stream().filter(x -> x > 5).map(x -> x*2).collect(Collectors.toList()). Parallel: parallelStream().', practiceTarget: 'Write 10 Java Stream operations (filter, map, reduce, groupingBy, counting).' },
      { id: 'lti_sql_window', topic: 'SQL Window Functions & Ranking', category: 'Database', frequency: 'High', keyFormula: 'SELECT RANK() OVER (PARTITION BY dept ORDER BY salary DESC) as rank FROM employees;', practiceTarget: 'Write SQL using ROW_NUMBER, RANK, DENSE_RANK, LEAD, LAG functions.' },
      { id: 'lti_react_hooks', topic: 'React Hooks — useState, useEffect, useContext', category: 'Web Technologies', frequency: 'Moderate (Interview)', keyFormula: 'useState(init) returns [state, setState]. useEffect runs after render. Cleanup function in return.', practiceTarget: 'Build a React component with API fetch using useEffect and useState.' },
      { id: 'lti_dp', topic: 'Dynamic Programming — LCS & Coin Change', category: 'Algorithms', frequency: 'High (Coding)', keyFormula: 'LCS: dp[i][j] = dp[i-1][j-1]+1 if match. Coin Change: dp[i] = min over all coins of dp[i-coin]+1.', practiceTarget: 'Solve Longest Common Subsequence and Coin Change on LeetCode.' },
      { id: 'lti_flexbox', topic: 'CSS Flexbox & Grid Layout', category: 'Web Technologies', frequency: 'Moderate', keyFormula: 'Flexbox: display:flex, justify-content, align-items. Grid: display:grid, grid-template-columns, grid-gap.', practiceTarget: 'Build a responsive navigation bar and card grid layout using Flexbox & Grid.' }
    ],
    experiences: [
      {
        studentName: 'Divya Krishnan', college: 'BMS College of Engineering', year: '2025', role: 'Senior Software Engineer', status: 'Selected (6.5 LPA)', rating: 'Moderate',
        roundSummaries: [
          { roundName: 'Technical Interview', questionsAsked: ['Difference between ArrayList and Vector in Java.', 'Write SQL query to find the 3rd highest salary using window functions.', 'Explain useEffect cleanup function in React.'], keyTakeaway: 'Vector is thread-safe (synchronized), ArrayList is non-synchronized. Use DENSE_RANK for ranking.' }
        ],
        proTips: ['Master Java Collections framework and Java 8 Streams for LTIMindtree interviews.', 'Web technologies (React basics) are increasingly tested in LTIMindtree rounds.']
      }
    ],
    benchmark: [
      { role: 'Software Engineer', ctc: '4.15 LPA', bond: '2 Years (₹2,00,000)', cgpaCutoff: '6.0 CGPA', keyTech: 'Java, SQL, HTML/CSS' },
      { role: 'Senior Software Engineer', ctc: '6.50 LPA', bond: '2 Years', cgpaCutoff: '6.5 CGPA', keyTech: 'Java Spring Boot, React, SQL' }
    ]
  },

  // ─────────────────────────────────────────────
  // 17. IBM
  // ─────────────────────────────────────────────
  {
    id: 'ibm',
    name: 'IBM',
    fullName: 'International Business Machines',
    type: 'Service-Based (IT)',
    tier: 'SERVICE',
    package: '4.5 - 11.0 LPA',
    roles: ['Associate System Engineer (4.5 LPA)', 'Software Developer (11.0 LPA)'],
    logo: 'IBM',
    eligibility: '65% or 6.5 CGPA with zero active backlogs.',
    overview: 'IBM hiring uses Cognitive Ability Games (Cognify by Criteria), English Assessment, Coding Test (HackerRank), and Technical Interview focused on Cloud, Linux, and Data Structures.',
    rounds: [
      { name: 'IBM Cognify Game Assessment', duration: '30 Mins', questions: 6, marking: 'AI Cognitive Score', difficulty: 'Moderate', description: '6 Interactive Cognitive Games: Numerical Reasoning, Spatial Reasoning, Memory Grids, and Logical Pattern Identification.' },
      { name: 'English & Communication Test', duration: '20 Mins', questions: 15, marking: 'Verbal Fluency Score', difficulty: 'Easy-Moderate', description: 'Reading Comprehension, Sentence Construction, Vocabulary, and Grammar Assessment.' },
      { name: 'Coding & Technical Assessment', duration: '60 Mins', questions: 2, marking: 'All Test Cases Required', difficulty: 'Moderate-Hard', description: '2 Coding problems on HackerRank platform evaluating Algorithms and Data Structures.' },
      { name: 'Technical & HR Discussion', duration: '30 Mins', questions: '10-12 Questions', marking: 'Tech & Architecture Evaluation', difficulty: 'Moderate', description: 'Discussion on Cloud Computing, Linux Commands, SQL Queries, and Data Structures.' }
    ],
    topicsToCover: [
      {
        category: 'IBM Cognify Game Tests',
        priority: 'High',
        weightage: '25%',
        topics: ['Numerical Reasoning — Calculate results under time pressure', 'Spatial Reasoning — 3D Object Rotation & Pattern Matching', 'Memory Grid — Reproduce highlighted cell positions from memory', 'Logical Pattern Identification — Next in sequence', 'Verbal Reasoning — Analogy & Sentence Completion', 'Processing Speed — Rapid Symbol Matching']
      },
      {
        category: 'Cloud Computing (IBM Cloud & AWS Fundamentals)',
        priority: 'High',
        weightage: '25%',
        topics: ['IBM Cloud Pak — Cloud-Native Application Platform', 'Cloud Service Models — SaaS, PaaS, IaaS, CaaS (Containers)', 'Docker — Images, Containers, Dockerfile, docker-compose', 'Kubernetes — Pods, Services, Deployments, ConfigMaps', 'Serverless Computing — IBM Cloud Functions (FaaS)', 'Cloud Security — IAM, Encryption at Rest & In Transit']
      },
      {
        category: 'Linux & System Administration',
        priority: 'High',
        weightage: '20%',
        topics: ['Linux File System — /, /home, /etc, /var, /proc Directory Structure', 'Essential Commands — ls, cd, cat, grep, find, chmod, chown', 'Process Management — ps, kill, top, nohup, cron jobs', 'File Permissions — chmod 755 (rwxr-xr-x), octal notation', 'Shell Scripting — Variables, Loops, Conditionals, Functions', 'Network Commands — netstat, ifconfig, ping, curl, wget, ssh']
      },
      {
        category: 'Data Structures & Algorithmic Coding',
        priority: 'High',
        weightage: '20%',
        topics: ['Linked List — Reversal (Iterative & Recursive), Cycle Detection', 'Binary Tree — Traversal, Height, Level Order BFS', 'Stack & Queue — Implementation and Applications', 'Hash Maps — Frequency Count, Two Sum, Anagram Detection', 'Dynamic Programming — Fibonacci, Climbing Stairs, House Robber', 'Sorting — Merge Sort, Quick Sort, Counting Sort']
      },
      {
        category: 'Database & SQL',
        priority: 'Medium',
        weightage: '10%',
        topics: ['SQL Joins — INNER, LEFT, RIGHT JOIN', 'SQL Aggregate Functions — GROUP BY, HAVING', 'SQL Subqueries & Correlated Subqueries', 'IBM Db2 Database Basics', 'NoSQL vs Relational DB — When to Choose Which']
      }
    ],
    revisionTracker: [
      { id: 'ibm_cognify', topic: 'IBM Cognify Cognitive Game Tests', category: 'Cognitive Assessment', frequency: 'Very High (First Round)', keyFormula: 'Memory grids: chunk 4-5 positions at a time. Spatial rotation: track reference face orientation.', practiceTarget: 'Practice 5 grid memory, 3D rotation, and numerical reasoning games online (Criteria Corp style).' },
      { id: 'ibm_linux_cmds', topic: 'Linux Essential Commands & Permissions', category: 'Linux & OS', frequency: 'High (Interview)', keyFormula: 'chmod 755 = rwxr-xr-x (owner can read/write/exec, group/others can read/exec). find . -name "*.py".', practiceTarget: 'Revise 20 essential Linux terminal commands with practice examples.' },
      { id: 'ibm_docker', topic: 'Docker Containers & Dockerfile', category: 'Cloud & Containers', frequency: 'High (Interview)', keyFormula: 'FROM, WORKDIR, COPY, RUN, EXPOSE, CMD are core Dockerfile instructions. docker build -t app:1.0 .', practiceTarget: 'Write a Dockerfile for a Node.js/Python web application.' },
      { id: 'ibm_kubernetes', topic: 'Kubernetes — Pods, Services & Deployments', category: 'Cloud Orchestration', frequency: 'Moderate (Interview)', keyFormula: 'Pod = smallest deployable unit. Service = stable endpoint for pod group. Deployment = manages pod replicas.', practiceTarget: 'Explain Kubernetes architecture with pod scaling and service exposure.' },
      { id: 'ibm_linked_list', topic: 'Linked List Reversal — Iterative & Recursive', category: 'Data Structures', frequency: 'High (Coding Test)', keyFormula: 'Iterative: prev=null, while curr: next=curr.next, curr.next=prev, prev=curr, curr=next.', practiceTarget: 'Implement both iterative and recursive linked list reversal with null checks.' }
    ],
    experiences: [
      {
        studentName: 'Deepak Patel', college: 'Nirma University', year: '2025', role: 'Software Developer', status: 'Selected (11.0 LPA)', rating: 'Moderate-Hard',
        roundSummaries: [
          { roundName: 'Cognify Game Assessment', questionsAsked: ['Memory Grid: Reproduce 5 highlighted cells in 6x6 grid.', 'Numerical Reasoning: Solve 3-step arithmetic chain in 30 seconds.'], keyTakeaway: 'Accuracy is more important than speed in Cognify — do not guess randomly.' },
          { roundName: 'Technical Round', questionsAsked: ['Write a program to reverse a linked list iteratively and recursively.', 'What is the difference between Docker and a Virtual Machine?'], keyTakeaway: 'Docker shares host OS kernel (lightweight). VM has full OS overhead (heavyweight).' }
        ],
        proTips: ['Prepare for IBM Cognify game tests — spatial memory accuracy is key.', 'IBM values Cloud and Linux knowledge as much as DSA in technical interviews.']
      }
    ],
    benchmark: [
      { role: 'Associate System Engineer', ctc: '4.50 LPA', bond: 'No Bond', cgpaCutoff: '6.5 CGPA', keyTech: 'Java, Python, Linux, Cloud Basics' },
      { role: 'Software Developer', ctc: '11.00 LPA', bond: 'No Bond', cgpaCutoff: '7.0 CGPA', keyTech: 'Cloud (IBM/AWS), Microservices, Advanced DSA' }
    ]
  },

  // ─────────────────────────────────────────────
  // 18. Deloitte
  // ─────────────────────────────────────────────
  {
    id: 'deloitte',
    name: 'Deloitte',
    fullName: 'Deloitte Touche Tohmatsu Limited',
    type: 'Fintech & Consulting',
    tier: 'FINTECH',
    package: '6.5 - 10.0 LPA',
    roles: ['Analyst (6.5 LPA)', 'Consultant (10.0 LPA)'],
    logo: 'DEL',
    eligibility: '60% throughout in 10th, 12th, and Graduation.',
    overview: 'Deloitte hiring process includes Aptitude Test, Verbal Ability, Spoken English Assessment, Business Case Study / Group Discussion, and Technical Interview focused on consulting analytics.',
    rounds: [
      { name: 'Online Aptitude & Verbal Assessment', duration: '75 Mins', questions: 60, marking: 'Sectional Pass Required', difficulty: 'Easy-Moderate', description: 'Quantitative Aptitude (20 Qs), Logical Deductions (15 Qs), Verbal Reading Comprehension (15 Qs), Technical MCQs — SQL, Python, Excel (10 Qs).' },
      { name: 'Spoken English AI Assessment', duration: '15 Mins', questions: 'Automated AI Evaluation', marking: 'Fluency, Pronunciation & Grammar', difficulty: 'Moderate', description: 'AI-monitored spoken English test with reading passages, sentence repeating, and question answering.' },
      { name: 'Business Case Study / Group Discussion', duration: '45 Mins', questions: 'Business Problem Scenario', marking: 'Analytical & Communication Evaluation', difficulty: 'Moderate', description: 'Team case study analysis on digital transformation or consulting scenario and presentation.' },
      { name: 'Technical & HR Discussion', duration: '30 Mins', questions: '10-12 Questions', marking: 'Consulting & Tech Fit', difficulty: 'Easy-Moderate', description: 'SQL, Cloud basics, Data Analytics, Client communication, and final year project review.' }
    ],
    topicsToCover: [
      {
        category: 'Business Analytics & Consulting Frameworks',
        priority: 'High',
        weightage: '30%',
        topics: ['Business Case Solving — McKinsey Framework (Issue Tree / MECE Structure)', 'Root Cause Analysis — Fishbone / 5 Whys Methodology', 'Digital Transformation Strategy — Cloud Migration, Automation, AI Integration', 'KPI Metrics — Revenue Growth, Customer Retention, Cost Reduction, ROI', 'Business Presentation — Problem → Hypothesis → Analysis → Recommendation', 'Data-Driven Decision Making — Insights from Business Data']
      },
      {
        category: 'Data Analytics & SQL for Business',
        priority: 'High',
        weightage: '25%',
        topics: ['SQL for Business — Sales Analysis, Revenue Tracking Queries', 'Excel Business Functions — VLOOKUP, INDEX MATCH, PivotTables', 'Python Pandas Basics — DataFrame, groupby, merge, pivot_table', 'Data Visualization — Bar Charts, Line Graphs, KPI Dashboards', 'Power BI / Tableau Basics — Creating Interactive Business Dashboards', 'Statistical Analysis — Mean, Median, Standard Deviation, Correlation']
      },
      {
        category: 'Cloud & Technology Fundamentals',
        priority: 'Medium',
        weightage: '20%',
        topics: ['Cloud Computing — AWS/Azure/GCP Service Models', 'AI & Machine Learning Basics — Supervised vs Unsupervised Learning', 'Cybersecurity Fundamentals — Phishing, Encryption, Zero Trust Architecture', 'ERP Systems — SAP, Oracle ERP, Salesforce CRM Basics', 'RPA (Robotic Process Automation) — UiPath, Blue Prism Concepts', 'Blockchain Basics — Distributed Ledger, Smart Contracts']
      },
      {
        category: 'Quantitative & Logical Aptitude',
        priority: 'Medium',
        weightage: '15%',
        topics: ['Percentages, Profit & Loss, Discount Analysis', 'Data Interpretation — Tables, Bar Charts, Line Graphs', 'Logical Deductions — Statement-Assumption, Statement-Conclusion', 'Critical Reasoning — Strengthen/Weaken Argument MCQs', 'Number Series & Alphanumeric Patterns']
      },
      {
        category: 'Verbal & Communication',
        priority: 'Medium',
        weightage: '10%',
        topics: ['Spoken English — Pronunciation & Fluency', 'Reading Comprehension — Business Articles & Inference', 'Email & Business Communication Writing', 'Group Discussion Skills — Initiating, Contributing, Concluding']
      }
    ],
    revisionTracker: [
      { id: 'del_case_framework', topic: 'Business Case Study — MECE Framework', category: 'Consulting', frequency: 'High (GD Round)', keyFormula: 'MECE = Mutually Exclusive, Collectively Exhaustive. Structure: Size → Segments → Root Cause → Strategy → KPIs.', practiceTarget: 'Solve 3 digital transformation and retail business case studies with structured approach.' },
      { id: 'del_sql_analytics', topic: 'SQL for Business Analytics', category: 'Data Analytics', frequency: 'High (Technical Interview)', keyFormula: 'SELECT product, SUM(revenue) FROM sales GROUP BY product ORDER BY SUM(revenue) DESC LIMIT 5;', practiceTarget: 'Write SQL queries for top-performing products, monthly revenue, and customer retention rate.' },
      { id: 'del_python_pandas', topic: 'Python Pandas — DataFrame Operations', category: 'Data Analytics', frequency: 'Moderate (Interview)', keyFormula: 'df.groupby("category").agg({"sales": "sum"}).reset_index(). df.merge(other, on="id", how="left").', practiceTarget: 'Write 5 Pandas operations: groupby, merge, pivot_table, filter, and value_counts.' },
      { id: 'del_power_bi', topic: 'Power BI / Tableau Dashboard Basics', category: 'Data Visualization', frequency: 'Moderate', keyFormula: 'Drag dimension to Rows, measure to Values. Use Calculated Field for KPI metrics.', practiceTarget: 'Build a simple sales dashboard with bar chart, KPI card, and slicer filter.' },
      { id: 'del_spoken_english', topic: 'Spoken English Fluency Test Preparation', category: 'Communication', frequency: 'Mandatory (AI Test)', keyFormula: 'Speak at 120-140 WPM (natural pace). Clear pronunciation. Avoid filler words (um, uh). Use pauses effectively.', practiceTarget: 'Record yourself reading 5 business passages and evaluate pronunciation clarity.' }
    ],
    experiences: [
      {
        studentName: 'Meera Nambiar', college: 'Symbiosis Institute', year: '2025', role: 'Analyst', status: 'Selected (7.6 LPA)', rating: 'Easy-Moderate',
        roundSummaries: [
          { roundName: 'Business Case Study', questionsAsked: ['How can a retail client transition from offline stores to an omnichannel e-commerce platform?'], keyTakeaway: 'Structure your thoughts using MECE and present actionable business recommendations with KPIs.' },
          { roundName: 'Technical Interview', questionsAsked: ['Write SQL query to find the top 5 products by revenue.', 'Explain the difference between supervised and unsupervised machine learning.'], keyTakeaway: 'Deloitte values both technical and business acumen — not just one or the other.' }
        ],
        proTips: ['Develop structured MECE thinking for Deloitte case study rounds.', 'Prepare KPI metrics and ROI impact statements for your recommendations.']
      }
    ],
    benchmark: [
      { role: 'Analyst', ctc: '6.50 LPA', bond: 'No Bond', cgpaCutoff: '6.0 CGPA', keyTech: 'SQL, Python, Excel, Business Analytics' },
      { role: 'Consultant', ctc: '10.00 LPA', bond: 'No Bond', cgpaCutoff: '6.5 CGPA', keyTech: 'Cloud, Enterprise Solutions, Data Analytics' }
    ]
  },

  // ─────────────────────────────────────────────
  // 19. Cisco
  // ─────────────────────────────────────────────
  {
    id: 'cisco',
    name: 'Cisco',
    fullName: 'Cisco Systems, Inc.',
    type: 'Product & MNCs',
    tier: 'PRODUCT',
    package: '14.0 - 24.0 LPA',
    roles: ['Technical Consulting Engineer (14.0 LPA)', 'Software Engineer (24.0 LPA)'],
    logo: 'CSCO',
    eligibility: '7.0+ CGPA in CSE, ECE, EEE, and IT branches.',
    overview: 'Cisco hiring evaluates Computer Networks (TCP/IP, OSI Layers, Subnetting), Operating Systems, C/C++ Programming, and Algorithmic Coding. Network engineering knowledge is the core differentiator.',
    rounds: [
      { name: 'Online Aptitude, Networks & Coding Test', duration: '90 Mins', questions: 50, marking: 'High Technical Cutoff', difficulty: 'Hard', description: 'Networking MCQs (20 Qs), OS & C++ MCQs (15 Qs), Aptitude (10 Qs), Hands-on Coding (2 Problems, 45 Mins).' },
      { name: 'Technical Interview 1 (Networks & OS)', duration: '60 Mins', questions: 'Deep Networks & System Calls', marking: 'Network Protocol Mastery', difficulty: 'Hard', description: 'In-depth evaluation of TCP 3-Way Handshake, Subnetting, IP Addressing, OS Memory, and C Code.' },
      { name: 'Technical Interview 2 (DSA & System Design)', duration: '60 Mins', questions: 'DSA + Network System Design', marking: 'Architecture & Code Quality', difficulty: 'Hard', description: 'Algorithmic coding in C/C++ + Design a Network System (Router, Load Balancer, SDN Controller).' }
    ],
    topicsToCover: [
      {
        category: 'Computer Networks — Core Protocols',
        priority: 'High',
        weightage: '35%',
        topics: ['TCP 3-Way Handshake — SYN, SYN-ACK, ACK Sequence', 'TCP vs UDP — Reliable, Ordered vs Best-Effort, Fast Delivery', 'TCP Sliding Window — Flow Control & Congestion Control', 'IPv4 Addressing — Classes A/B/C, Subnetting, VLSM, CIDR Notation', 'IPv6 — Address Format, Transition Mechanisms (NAT64, Dual Stack)', 'DNS Resolution — Recursive vs Iterative Query Process', 'HTTP/HTTPS — Request/Response Cycle, Status Codes, REST vs SOAP']
      },
      {
        category: 'Networking Devices & Architecture',
        priority: 'High',
        weightage: '25%',
        topics: ['OSI 7-Layer Model — Protocol Mapping per Layer', 'Router vs Switch vs Hub — Layer 2 vs Layer 3 Differences', 'VLAN Configuration & Inter-VLAN Routing (Router-on-a-Stick)', 'Routing Protocols — RIP, OSPF, BGP Overview', 'ARP — Address Resolution Protocol, Gratuitous ARP', 'DHCP — DORA Process (Discover, Offer, Request, Acknowledge)', 'Cisco IOS Commands — show ip route, ping, traceroute, ipconfig']
      },
      {
        category: 'Operating Systems & C++ Programming',
        priority: 'High',
        weightage: '20%',
        topics: ['OS — Process, Thread, Context Switching, Scheduler Types', 'OS — Memory Management: Paging, Segmentation, TLB, Page Faults', 'OS — Synchronization: Semaphore, Mutex, Monitor, Reader-Writer', 'C++ Pointers — Double Pointers, Smart Pointers (unique_ptr, shared_ptr)', 'C++ STL — Vector, Map, Set, Queue, Stack, Priority Queue', 'Socket Programming Basics — TCP Client-Server in C/C++']
      },
      {
        category: 'Data Structures & Algorithms',
        priority: 'Medium',
        weightage: '15%',
        topics: ['Graph — BFS/DFS for Network Topology Traversal', 'Shortest Path — Dijkstra for Routing Table Computation', 'Dynamic Programming — Packet Routing Optimization', 'Binary Search — Efficient IP Range Lookups', 'Hashing — Fast MAC Address Table Lookups']
      },
      {
        category: 'Network Security & Cloud Networking',
        priority: 'Medium',
        weightage: '5%',
        topics: ['Firewalls — Stateful vs Stateless Packet Filtering', 'VPN — IPSec Tunnel Mode & Transport Mode', 'SD-WAN — Software Defined Wide Area Network Concepts', 'Network Automation — Ansible, Python Netmiko for IOS']
      }
    ],
    revisionTracker: [
      { id: 'csco_tcp_handshake', topic: 'TCP 3-Way Handshake & Connection States', category: 'Computer Networks', frequency: 'Very High (Interview)', keyFormula: 'SYN → SYN-ACK → ACK. States: CLOSED → LISTEN → SYN_SENT → ESTABLISHED → TIME_WAIT → CLOSED.', practiceTarget: 'Draw TCP state diagram and trace all connection/disconnection states.' },
      { id: 'csco_subnetting', topic: 'IPv4 Subnetting & CIDR Mask Calculation', category: 'Computer Networks', frequency: 'High (MCQ & Interview)', keyFormula: '/24 = 254 usable hosts. /25 = 126 hosts, 2 subnets. Hosts per subnet = 2^(32-prefix) - 2.', practiceTarget: 'Practice 10 CIDR subnet calculations and VLSM subnetting scenarios.' },
      { id: 'csco_ospf', topic: 'OSPF Routing Protocol — Link State Algorithm', category: 'Networking', frequency: 'High (Technical Interview)', keyFormula: 'OSPF uses Dijkstra SPF. Areas: Backbone (0), Non-backbone. LSA types 1-7 for different areas.', practiceTarget: 'Explain OSPF neighbor formation, DR/BDR election, and SPF calculation.' },
      { id: 'csco_socket_prog', topic: 'Socket Programming — TCP Client-Server in C', category: 'OS & Networking', frequency: 'High (Coding)', keyFormula: 'Server: socket→bind→listen→accept→read/write→close. Client: socket→connect→send/recv→close.', practiceTarget: 'Implement TCP echo server and client using C socket API.' },
      { id: 'csco_browser_journey', topic: 'End-to-End Browser Request (DNS → TCP → HTTP)', category: 'Computer Networks', frequency: 'Very High (Interview)', keyFormula: 'Type URL → DNS Lookup → TCP 3-Way Handshake → TLS Handshake (HTTPS) → HTTP GET → HTML Response → Render.', practiceTarget: 'Trace full network journey from browser typing google.com to page display.' },
      { id: 'csco_os_sync', topic: 'OS Synchronization — Semaphores & Mutex', category: 'Operating Systems', frequency: 'Moderate (Interview)', keyFormula: 'Binary Semaphore (0/1) = Mutex. Counting Semaphore for resource pool. wait() = P operation. signal() = V operation.', practiceTarget: 'Solve Producer-Consumer and Dining Philosophers problems using semaphores.' }
    ],
    experiences: [
      {
        studentName: 'Abhinav Saxena', college: 'IIT Roorkee', year: '2025', role: 'Software Engineer', status: 'Selected (24.0 LPA)', rating: 'Hard',
        roundSummaries: [
          { roundName: 'Technical Interview 1', questionsAsked: ['Trace what happens at the network layer when you type google.com in a browser (DNS, ARP, TCP handshake, HTTP GET).', 'Calculate subnet range for 192.168.1.0/26 — how many hosts?'], keyTakeaway: 'Step-by-step end-to-end packet flow explanation is heavily evaluated. 192.168.1.0/26 has 62 usable hosts.' },
          { roundName: 'Technical Interview 2', questionsAsked: ['Design a Load Balancer system with Round-Robin and Least-Connections algorithms.', 'Implement Dijkstra for finding shortest path in a weighted network graph.'], keyTakeaway: 'Combine network architecture knowledge with algorithmic implementation.' }
        ],
        proTips: ['Master DNS lookup, ARP protocol, TCP 3-way handshake, and Subnetting for Cisco interviews.', 'Cisco expects practical IOS CLI command knowledge — revise show commands.']
      }
    ],
    benchmark: [
      { role: 'Technical Consulting Engineer', ctc: '14.00 LPA', bond: 'No Bond', cgpaCutoff: '7.0 CGPA', keyTech: 'Computer Networks, Python, Linux, Cisco IOS' },
      { role: 'Software Engineer', ctc: '24.00 LPA', bond: 'No Bond', cgpaCutoff: '7.5 CGPA', keyTech: 'C++, Systems Programming, Network Architecture, SDN' }
    ]
  },

  // ─────────────────────────────────────────────
  // 20. PayPal
  // ─────────────────────────────────────────────
  {
    id: 'paypal',
    name: 'PayPal',
    fullName: 'PayPal Holdings, Inc.',
    type: 'Fintech & Consulting',
    tier: 'FINTECH',
    package: '15.0 - 28.0 LPA',
    roles: ['Software Engineer (15.0 - 28.0 LPA)', 'Software Intern'],
    logo: 'PYPL',
    eligibility: '7.5+ CGPA with strong DSA & Distributed Systems foundation.',
    overview: 'PayPal hiring focuses on DSA Algorithms, Scalable Payment System Design, Distributed Transactions, Fraud Detection Algorithms, and Java/C++ Object Oriented Code.',
    rounds: [
      { name: 'Online HackerRank Coding Assessment', duration: '90 Mins', questions: 3, marking: 'All Test Cases Passed', difficulty: 'Hard', description: '3 Coding problems on Dynamic Programming, Binary Trees, and Sliding Window Strings.' },
      { name: 'Technical Interview 1 (DSA & Architecture)', duration: '60 Mins', questions: '2 DSA Problems + OOP Design', marking: 'Code Correctness & Complexity', difficulty: 'Hard', description: 'Live coding of Data Structure problems and Object-Oriented Design.' },
      { name: 'Technical Interview 2 (System Design)', duration: '60 Mins', questions: 'Payment System Architecture', marking: 'Scalability & Reliability', difficulty: 'Hard', description: 'Design scalable payment processing systems (PayPal Checkout, Fraud Detection, Wallet Service).' },
      { name: 'HR & Culture Interview', duration: '20 Mins', questions: 'Motivation & Team Fit', marking: 'FinTech Passion & Alignment', difficulty: 'Easy', description: 'Discussion on interest in FinTech, collaboration style, and handling high-pressure payment system incidents.' }
    ],
    topicsToCover: [
      {
        category: 'Payment System Design & Architecture',
        priority: 'High',
        weightage: '30%',
        topics: ['Payment Processing Flow — Authorization, Capture, Settlement, Reconciliation', 'Rate Limiter Design — Token Bucket, Sliding Window Log, Fixed Window', 'Distributed Transaction — 2-Phase Commit, Saga Pattern', 'Idempotency Keys — Preventing Duplicate Payment Processing', 'Event Sourcing & CQRS Pattern for Payment Ledger', 'PayPal Checkout API Design — REST, Webhooks, OAuth 2.0']
      },
      {
        category: 'Fraud Detection & Security',
        priority: 'High',
        weightage: '20%',
        topics: ['Anomaly Detection — Statistical Threshold & ML-based Fraud Scoring', 'Rule Engine Design — Real-time Fraud Rule Evaluation', 'PCI DSS Compliance Basics — Card Data Security Standards', 'Tokenization — Replacing Card Numbers with Non-sensitive Tokens', 'Encryption — AES-256, RSA Public/Private Key, TLS 1.3']
      },
      {
        category: 'Distributed Systems & Scalability',
        priority: 'High',
        weightage: '25%',
        topics: ['CAP Theorem — Consistency vs Availability vs Partition Tolerance', 'Distributed Caching — Redis Cluster, Cache Invalidation Strategies', 'Message Queues — Kafka for Asynchronous Payment Event Processing', 'Database Sharding — Horizontal Partitioning by User ID / Region', 'Microservices Patterns — Service Mesh, Circuit Breaker, Bulkhead']
      },
      {
        category: 'Data Structures & Algorithmic Coding',
        priority: 'High',
        weightage: '20%',
        topics: ['Dynamic Programming — Maximum Profit (Stock Trade), Coin Change', 'Binary Tree — Serialize/Deserialize, LCA, Maximum Path Sum', 'Sliding Window — Longest Substring Without Repeating Characters', 'Graph — Shortest Path for Transaction Network Analysis', 'Priority Queue — Median in Stream, K Nearest Points']
      },
      {
        category: 'Java Backend & Concurrency',
        priority: 'Medium',
        weightage: '5%',
        topics: ['Java Multithreading — ExecutorService, CompletableFuture, ForkJoin', 'Thread Safety — ReentrantLock, synchronized, volatile keyword', 'Spring Boot REST API, Spring Security & JWT Authentication', 'Database Connection Pool — HikariCP Configuration & Monitoring']
      }
    ],
    revisionTracker: [
      { id: 'pypl_rate_limiter', topic: 'Rate Limiter Design — Token Bucket & Sliding Window', category: 'Payment System Design', frequency: 'Very High (System Design)', keyFormula: 'Token Bucket: tokens refill at rate r. Request allowed if tokens > 0. Sliding Window: count requests in last N seconds.', practiceTarget: 'Implement both Token Bucket and Sliding Window Rate Limiter in Java/Python.' },
      { id: 'pypl_2pc', topic: 'Distributed Transactions — 2-Phase Commit & Saga', category: 'Distributed Systems', frequency: 'High (System Design)', keyFormula: '2PC: Phase 1 (Prepare: all vote YES/NO) → Phase 2 (Commit if all YES, else Abort). Saga: local tx per service + compensating tx on failure.', practiceTarget: 'Compare 2PC vs Saga Pattern with PayPal fund transfer example.' },
      { id: 'pypl_idempotency', topic: 'Idempotency Keys for Duplicate Payment Prevention', category: 'Payment Systems', frequency: 'High (Interview)', keyFormula: 'Client sends unique idempotency-key header. Server stores key→response in cache. Duplicate key returns cached response.', practiceTarget: 'Design PayPal checkout payment API with idempotency key handling.' },
      { id: 'pypl_dp_stocks', topic: 'DP — Maximum Profit Stock Trading', category: 'Algorithmic Coding', frequency: 'High (Coding Test)', keyFormula: 'One transaction: O(N) scan tracking min price. Multiple: sum all positive price gaps. With cooldown: DP with states.', practiceTarget: 'Solve Best Time to Buy and Sell Stock I, II, III, and IV on LeetCode.' },
      { id: 'pypl_cap_theorem', topic: 'CAP Theorem & Trade-offs in Payment Systems', category: 'Distributed Systems', frequency: 'High (System Design)', keyFormula: 'CP = Consistent + Partition Tolerant (banks prefer this). AP = Available + Partition Tolerant (e-commerce prefer).', practiceTarget: 'Explain which CAP properties PayPal payment system must prioritize and why.' },
      { id: 'pypl_redis_cache', topic: 'Redis Distributed Caching & Invalidation', category: 'Scalability', frequency: 'Moderate (System Design)', keyFormula: 'Cache-aside: app checks cache first, fetches DB on miss. Write-through: write both cache & DB. TTL for expiry.', practiceTarget: 'Design Redis caching strategy for PayPal user session and wallet balance.' }
    ],
    experiences: [
      {
        studentName: 'Tanvi Shah', college: 'IIIT Hyderabad', year: '2025', role: 'Software Engineer', status: 'Selected (26.0 LPA)', rating: 'Hard',
        roundSummaries: [
          { roundName: 'Technical Interview 1', questionsAsked: ['Design a Rate Limiter system using Token Bucket algorithm for PayPal API throttling.', 'Serialize and Deserialize a Binary Tree.'], keyTakeaway: 'Focus on thread safety (AtomicInteger) and O(1) time complexity for rate limiter operations.' },
          { roundName: 'System Design Interview', questionsAsked: ['Design PayPal payment processing system — handle 10M transactions per day with fraud detection and idempotency.'], keyTakeaway: 'Break down into: API → Validation → Fraud Engine → Payment Rail → Settlement → Notification.' }
        ],
        proTips: ['Revise Rate Limiter designs and Token Bucket algorithm thoroughly.', 'PayPal expects understanding of idempotency, distributed transactions, and fraud detection architecture.']
      }
    ],
    benchmark: [
      { role: 'Software Intern', ctc: '₹75,000 / month', bond: 'No Bond', cgpaCutoff: '7.5 CGPA', keyTech: 'Java, C++, DSA' },
      { role: 'Software Engineer', ctc: '15.0 - 28.0 LPA', bond: 'No Bond', cgpaCutoff: '7.5 CGPA', keyTech: 'Java Spring, Microservices, Distributed Systems' }
    ]
  },

  // ─────────────────────────────────────────────
  // 21. Walmart Global Tech
  // ─────────────────────────────────────────────
  {
    id: 'walmart',
    name: 'Walmart',
    fullName: 'Walmart Global Tech India',
    type: 'Product & MNCs',
    tier: 'PRODUCT',
    package: '14.0 - 26.0 LPA',
    roles: ['Software Development Engineer (SDE-1)', 'SDE Intern'],
    logo: 'WMT',
    eligibility: '7.0+ CGPA across engineering colleges.',
    overview: 'Walmart Global Tech hires through CodeHers Hackathon and Campus Drives testing Advanced DSA, System Design at scale, Java Spring Boot, and Retail Technology Architecture.',
    rounds: [
      { name: 'Online Hackerrank/Unstop Assessment', duration: '90 Mins', questions: 2, marking: 'Optimal Complexity Bounds', difficulty: 'Hard', description: '2 Hard Algorithmic Coding Problems + 10 CS Core MCQs (DBMS, OS, Networks).' },
      { name: 'Technical Interview 1 (DSA & Code Quality)', duration: '60 Mins', questions: '2 DSA Problems', marking: 'Production-Quality Code', difficulty: 'Hard', description: 'Trees, Graphs, and Heap algorithms with focus on clean Java/C++ production code.' },
      { name: 'Technical Interview 2 (System Design)', duration: '60 Mins', questions: 'Retail System Architecture', marking: 'Scalability & Real-World Thinking', difficulty: 'Hard', description: 'Design Walmart-scale retail systems (Inventory Management, Flash Sale Platform, Order Management).' },
      { name: 'HR & Leadership Discussion', duration: '20 Mins', questions: 'Impact & Collaboration', marking: 'Values & Growth Mindset', difficulty: 'Easy', description: 'Discussion on building for scale, customer-centric thinking, and cross-functional collaboration.' }
    ],
    topicsToCover: [
      {
        category: 'Retail Technology System Design',
        priority: 'High',
        weightage: '30%',
        topics: ['Inventory Management System — Real-time Stock Tracking, Warehouse Management', 'Flash Sale Platform — Millions of Concurrent Users, Queue-Based Order Processing', 'Product Search & Recommendation — Inverted Index, Collaborative Filtering', 'Cart & Checkout — Optimistic Locking, Distributed Session Management', 'Order Management — Order States, OMS Workflow, Returns Processing', 'Supply Chain Integration — Supplier API, Demand Forecasting, Auto-Replenishment']
      },
      {
        category: 'Data Structures & Algorithms',
        priority: 'High',
        weightage: '30%',
        topics: ['Heap — Kth Largest, Top K Frequent Elements, Merge K Sorted Lists', 'Graph — Dijkstra, BFS for Warehouse Navigation, Floyd-Warshall', 'Dynamic Programming — 0/1 Knapsack for Inventory Optimization', 'Trie — Product Search Auto-Complete Implementation', 'Segment Tree — Range Product Inventory Queries', 'Sliding Window — Time-series Sales Analysis']
      },
      {
        category: 'Distributed Systems & Scalability at Walmart Scale',
        priority: 'High',
        weightage: '25%',
        topics: ['Consistent Hashing — Distributing Cart Data across Shards', 'Event-Driven Architecture — Kafka for Order, Inventory, Payment Events', 'CQRS Pattern — Separate Read/Write Models for High-Traffic Queries', 'Database Sharding Strategy — Geographic Sharding for Global Walmart Stores', 'CDN & Caching — Akamai CDN for Product Images, Redis for Session', 'Circuit Breaker Pattern — Fault Tolerance in Microservices']
      },
      {
        category: 'Java Spring Boot & Microservices',
        priority: 'Medium',
        weightage: '10%',
        topics: ['Spring Boot REST API — Controller, Service, Repository Layers', 'Spring Security & JWT for Walmart Account Authentication', 'Spring Data JPA — Hibernate ORM, Query Methods, @Transactional', 'Microservice Communication — REST vs gRPC vs Messaging (Kafka)', 'API Gateway — Route Requests, Rate Limit, Authenticate']
      },
      {
        category: 'Database Systems & Analytics',
        priority: 'Medium',
        weightage: '5%',
        topics: ['SQL Analytics — Sales Revenue, Inventory Turnover, Customer Retention', 'SQL Window Functions — Running Totals, Period-over-Period Comparison', 'NoSQL — Cassandra for High-Volume Transaction Logs', 'Data Warehouse Concepts — Star Schema, Fact & Dimension Tables']
      }
    ],
    revisionTracker: [
      { id: 'wmt_heap', topic: 'Heap — Top K & Merge K Sorted Lists', category: 'Data Structures', frequency: 'Very High', keyFormula: 'Min-heap of K: pop min when size > K. Merge K lists: use min-heap of (val, row, col). O(N log K).', practiceTarget: 'Solve Kth Largest Element, Top K Frequent Words, and Merge K Sorted Lists.' },
      { id: 'wmt_flash_sale', topic: 'Flash Sale System Design at Walmart Scale', category: 'System Design', frequency: 'High (Technical R2)', keyFormula: 'Queue incoming orders (Kafka). Reserve inventory atomically (Redis SETNX or DB row lock). Async payment processing.', practiceTarget: 'Design Flash Sale system handling 5M concurrent users with overselling prevention.' },
      { id: 'wmt_inventory_design', topic: 'Inventory Management System Architecture', category: 'Retail System Design', frequency: 'High (Technical R2)', keyFormula: 'Components: InventoryService, WarehouseService, SKU Registry, EventBus. Eventual consistency via Kafka events.', practiceTarget: 'Design real-time inventory tracking across 10,000 Walmart stores globally.' },
      { id: 'wmt_consistent_hashing', topic: 'Consistent Hashing for Cart Shard Distribution', category: 'Distributed Systems', frequency: 'High (Interview)', keyFormula: 'Virtual nodes improve distribution. Shard key = hash(user_id) % ring_size. New node adds nearby positions on ring.', practiceTarget: 'Explain consistent hashing for Walmart cart service across 20 database shards.' },
      { id: 'wmt_kafka_events', topic: 'Apache Kafka for Retail Event Streaming', category: 'Distributed Systems', frequency: 'High (System Design)', keyFormula: 'Topic = channel, Partition = ordered log, Consumer Group = load balanced. Retention = 7 days default.', practiceTarget: 'Design Kafka event streaming for Order Placed → Inventory Reserved → Payment Processed → Fulfilled flow.' },
      { id: 'wmt_sql_analytics', topic: 'SQL for Retail Analytics & Reporting', category: 'Database', frequency: 'Moderate (Interview)', keyFormula: 'SELECT product, SUM(qty*price) as revenue, RANK() OVER(ORDER BY SUM(qty*price) DESC) as rank FROM sales GROUP BY product;', practiceTarget: 'Write SQL queries for top-selling products, monthly revenue growth, and customer cohort analysis.' }
    ],
    experiences: [
      {
        studentName: 'Ritika Jain', college: 'IGDTUW Delhi', year: '2025', role: 'SDE-1', status: 'Selected (24.0 LPA)', rating: 'Hard',
        roundSummaries: [
          { roundName: 'Technical Interview 1', questionsAsked: ['Merge K Sorted Lists using Min-Heap.', 'Find the Kth Largest Element in an unsorted array.'], keyTakeaway: 'Heap optimal time complexity O(N log K) was expected. Brute-force O(N²) was rejected.' },
          { roundName: 'System Design Interview', questionsAsked: ['Design Walmart Flash Sale system — handle 10M users buying limited-quantity products simultaneously.'], keyTakeaway: 'Queue-based order processing with atomic Redis inventory reservation is the key insight.' }
        ],
        proTips: ['CodeHers Hackathon is a major entry point for Walmart Global Tech hiring.', 'Walmart System Design expects Retail-specific thinking — inventory, supply chain, and flash sale scenarios.']
      }
    ],
    benchmark: [
      { role: 'SDE Intern', ctc: '₹85,000 / month', bond: 'No Bond', cgpaCutoff: '7.0 CGPA', keyTech: 'Java, DSA, SQL' },
      { role: 'SDE-1', ctc: '14.0 - 26.0 LPA', bond: 'No Bond', cgpaCutoff: '7.0 CGPA', keyTech: 'Java Spring Boot, Microservices, Advanced DSA, Retail Systems' }
    ]
  }

];
