"""
Problem Database — Curated DSA Problem Bank with full evaluation metadata.

Each problem contains:
- Problem statement, constraints, examples
- Sample tests (visible to candidate)
- Hidden tests (used only for final submission)
- Expected and acceptable complexity thresholds
- Constraint-aware n_upper for scoring fairness
- pattern: the core DSA pattern this problem tests

Pattern taxonomy:
  HashMap | Two Pointers | Sliding Window | Binary Search |
  Stack   | Linked List  | Tree & Recursion | BFS/DFS |
  Dynamic Programming | Sorting
"""

from typing import List, Dict, Any

# ── Problem Bank ──────────────────────────────────────────────────────────────
# 20 curated problems across key DSA topics

PROBLEMS: List[Dict[str, Any]] = [

    # ── ARRAYS ──────────────────────────────────────────────────────────────────
    {
        "problemId": "contains-duplicate",
        "title": "Contains Duplicate",
        "pattern": "HashMap",
        "difficulty": "Easy",
        "topics": ["Array", "Hashing"],
        "description": (
            "Given an integer array `nums`, return `true` if any value appears "
            "at least twice in the array, and `false` if every element is distinct."
        ),
        "constraints": {"n": "1 <= n <= 100,000", "values": "-10^9 <= nums[i] <= 10^9"},
        "n_upper": 100_000,
        "examples": [
            {"input": "[1,2,3,1]", "output": "true"},
            {"input": "[1,2,3,4]", "output": "false"},
            {"input": "[1,1,1,3,3,4,3,2,4,2]", "output": "true"},
        ],
        "sampleTests": [
            {"stdin": "4\n1 2 3 1", "expected": "true"},
            {"stdin": "4\n1 2 3 4", "expected": "false"},
        ],
        "hiddenTests": [
            {"stdin": "1\n1", "expected": "false"},
            {"stdin": "10\n1 1 1 3 3 4 3 2 4 2", "expected": "true"},
            {"stdin": "5\n-1 -2 -3 -4 -5", "expected": "false"},
            {"stdin": "3\n1000000000 -1000000000 1000000000", "expected": "true"},
        ],
        "expectedComplexity": {"time": "O(n)", "space": "O(n)"},
        "acceptableComplexities": ["O(n)", "O(n log n)"],
        "bruteForceComplexity": {"time": "O(n²)", "space": "O(1)"},
        "optimalApproach": "HashSet",
        "optimalHint": "Use a HashSet to track seen elements. Check membership in O(1) per lookup.",
    },

    {
        "problemId": "two-sum",
        "title": "Two Sum",
        "pattern": "HashMap",
        "difficulty": "Easy",
        "topics": ["Array", "Hashing"],
        "description": (
            "Given an array of integers `nums` and an integer `target`, return indices of the two "
            "numbers such that they add up to `target`. You may assume exactly one solution exists."
        ),
        "constraints": {"n": "2 <= n <= 100,000", "values": "-10^9 <= nums[i] <= 10^9"},
        "n_upper": 100_000,
        "examples": [
            {"input": "nums = [2,7,11,15], target = 9", "output": "[0,1]"},
            {"input": "nums = [3,2,4], target = 6", "output": "[1,2]"},
        ],
        "sampleTests": [
            {"stdin": "4 9\n2 7 11 15", "expected": "0 1"},
            {"stdin": "3 6\n3 2 4", "expected": "1 2"},
        ],
        "hiddenTests": [
            {"stdin": "2 6\n3 3", "expected": "0 1"},
            {"stdin": "4 0\n-3 4 3 90", "expected": "0 2"},
            {"stdin": "3 -1\n-3 2 4", "expected": "0 1"},
        ],
        "expectedComplexity": {"time": "O(n)", "space": "O(n)"},
        "acceptableComplexities": ["O(n)"],
        "bruteForceComplexity": {"time": "O(n²)", "space": "O(1)"},
        "optimalApproach": "HashMap (complement lookup)",
        "optimalHint": "Store each number's index in a HashMap. For each element, check if (target - element) is already in the map.",
    },

    {
        "problemId": "best-time-to-buy-sell-stock",
        "title": "Best Time to Buy and Sell Stock",
        "pattern": "Sliding Window",
        "difficulty": "Easy",
        "topics": ["Array", "Greedy"],
        "description": (
            "You are given an array `prices` where `prices[i]` is the price of a stock on day `i`. "
            "Return the maximum profit you can achieve. If you cannot achieve any profit, return `0`."
        ),
        "constraints": {"n": "1 <= n <= 100,000", "values": "0 <= prices[i] <= 10,000"},
        "n_upper": 100_000,
        "examples": [
            {"input": "[7,1,5,3,6,4]", "output": "5"},
            {"input": "[7,6,4,3,1]", "output": "0"},
        ],
        "sampleTests": [
            {"stdin": "6\n7 1 5 3 6 4", "expected": "5"},
            {"stdin": "5\n7 6 4 3 1", "expected": "0"},
        ],
        "hiddenTests": [
            {"stdin": "1\n5", "expected": "0"},
            {"stdin": "2\n1 2", "expected": "1"},
            {"stdin": "4\n3 3 3 3", "expected": "0"},
        ],
        "expectedComplexity": {"time": "O(n)", "space": "O(1)"},
        "acceptableComplexities": ["O(n)"],
        "bruteForceComplexity": {"time": "O(n²)", "space": "O(1)"},
        "optimalApproach": "One-pass min-tracking",
        "optimalHint": "Track the minimum price seen so far and compute profit at each step.",
    },

    # ── SLIDING WINDOW PATTERN ────────────────────────────────────────────────────
    {
        "problemId": "longest-substring-without-repeating",
        "title": "Longest Substring Without Repeating Characters",
        "pattern": "Sliding Window",
        "difficulty": "Medium",
        "topics": ["String", "Sliding Window", "Hashing"],
        "description": (
            "Given a string `s`, find the length of the longest substring without repeating characters."
        ),
        "constraints": {"n": "0 <= s.length <= 50,000"},
        "n_upper": 50_000,
        "examples": [
            {"input": '"abcabcbb"', "output": "3"},
            {"input": '"bbbbb"', "output": "1"},
            {"input": '"pwwkew"', "output": "3"},
        ],
        "sampleTests": [
            {"stdin": "abcabcbb", "expected": "3"},
            {"stdin": "bbbbb", "expected": "1"},
        ],
        "hiddenTests": [
            {"stdin": "pwwkew", "expected": "3"},
            {"stdin": "", "expected": "0"},
            {"stdin": "a", "expected": "1"},
            {"stdin": "dvdf", "expected": "3"},
        ],
        "expectedComplexity": {"time": "O(n)", "space": "O(min(n, charset))"},
        "acceptableComplexities": ["O(n)"],
        "bruteForceComplexity": {"time": "O(n²)", "space": "O(n)"},
        "optimalApproach": "Sliding window with HashMap",
        "optimalHint": "Use a sliding window with a HashMap storing the last index of each character.",
    },

    {
        "problemId": "max-sum-subarray-k",
        "title": "Maximum Sum Subarray of Size K",
        "pattern": "Sliding Window",
        "difficulty": "Easy",
        "topics": ["Array", "Sliding Window"],
        "description": (
            "Given an array of integers `nums` and an integer `k`, "
            "find the maximum sum of any contiguous subarray of size `k`."
        ),
        "constraints": {"n": "1 <= n <= 100,000", "k": "1 <= k <= n"},
        "n_upper": 100_000,
        "examples": [
            {"input": "nums = [2,1,5,1,3,2], k = 3", "output": "9"},
            {"input": "nums = [2,3,4,1,5], k = 2", "output": "7"},
        ],
        "sampleTests": [
            {"stdin": "6 3\n2 1 5 1 3 2", "expected": "9"},
            {"stdin": "5 2\n2 3 4 1 5", "expected": "7"},
        ],
        "hiddenTests": [
            {"stdin": "1 1\n5", "expected": "5"},
            {"stdin": "3 3\n1 2 3", "expected": "6"},
            {"stdin": "4 2\n-1 -2 -3 -4", "expected": "-3"},
        ],
        "expectedComplexity": {"time": "O(n)", "space": "O(1)"},
        "acceptableComplexities": ["O(n)"],
        "bruteForceComplexity": {"time": "O(n*k)", "space": "O(1)"},
        "optimalApproach": "Fixed-size sliding window",
        "optimalHint": "Slide a window of size k: add the new element, subtract the element leaving the window.",
    },

    # ── TWO POINTERS PATTERN ────────────────────────────────────────────────────────────
    {
        "problemId": "valid-palindrome",
        "title": "Valid Palindrome",
        "pattern": "Two Pointers",
        "difficulty": "Easy",
        "topics": ["String", "Two Pointers"],
        "description": (
            "A phrase is a palindrome if, after converting all uppercase letters to lowercase "
            "and removing all non-alphanumeric characters, it reads the same forward and backward. "
            "Given a string `s`, return `true` if it is a palindrome, else `false`."
        ),
        "constraints": {"n": "1 <= s.length <= 200,000"},
        "n_upper": 200_000,
        "examples": [
            {"input": '"A man, a plan, a canal: Panama"', "output": "true"},
            {"input": '"race a car"', "output": "false"},
        ],
        "sampleTests": [
            {"stdin": "A man, a plan, a canal: Panama", "expected": "true"},
            {"stdin": "race a car", "expected": "false"},
        ],
        "hiddenTests": [
            {"stdin": " ", "expected": "true"},
            {"stdin": "ab_a", "expected": "true"},
            {"stdin": "0P", "expected": "false"},
        ],
        "expectedComplexity": {"time": "O(n)", "space": "O(1)"},
        "acceptableComplexities": ["O(n)"],
        "bruteForceComplexity": {"time": "O(n)", "space": "O(n)"},
        "optimalApproach": "Two-pointer in-place",
        "optimalHint": "Use left/right pointers, skip non-alphanumeric chars, compare lowercase.",
    },

    {
        "problemId": "3sum",
        "title": "Three Sum",
        "pattern": "Two Pointers",
        "difficulty": "Medium",
        "topics": ["Array", "Two Pointers", "Sorting"],
        "description": (
            "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` "
            "such that `i != j != k` and `nums[i] + nums[j] + nums[k] == 0`. The solution set must not contain duplicate triplets."
        ),
        "constraints": {"n": "3 <= n <= 3000"},
        "n_upper": 3_000,
        "examples": [
            {"input": "[-1,0,1,2,-1,-4]", "output": "[[-1,-1,2],[-1,0,1]]"},
            {"input": "[0,1,1]", "output": "[]"},
        ],
        "sampleTests": [
            {"stdin": "6\n-1 0 1 2 -1 -4", "expected": "-1 -1 2\n-1 0 1"},
            {"stdin": "3\n0 1 1", "expected": ""},
        ],
        "hiddenTests": [
            {"stdin": "3\n0 0 0", "expected": "0 0 0"},
            {"stdin": "4\n-2 0 0 2", "expected": "-2 0 2"},
        ],
        "expectedComplexity": {"time": "O(n²)", "space": "O(n)"},
        "acceptableComplexities": ["O(n²)"],
        "bruteForceComplexity": {"time": "O(n³)", "space": "O(n)"},
        "optimalApproach": "Sort + Two Pointers",
        "optimalHint": "Sort the array. Fix one element, then use two pointers to find pairs that sum to its negation.",
    },

    # ── LINKED LIST PATTERN ──────────────────────────────────────────────────────────────
    {
        "problemId": "linked-list-cycle",
        "title": "Linked List Cycle Detection",
        "pattern": "Linked List",
        "difficulty": "Easy",
        "topics": ["Linked List", "Two Pointers"],
        "description": (
            "Given the head of a linked list as a sequence of integers, determine if the list has a cycle. "
            "Input: space-separated integers (the last value is the index of where the tail connects, or -1)."
        ),
        "constraints": {"n": "0 <= n <= 100,000"},
        "n_upper": 100_000,
        "examples": [
            {"input": "[3,2,0,-4], pos=1", "output": "true"},
            {"input": "[1,2], pos=0", "output": "true"},
            {"input": "[1], pos=-1", "output": "false"},
        ],
        "sampleTests": [
            {"stdin": "4 1\n3 2 0 -4", "expected": "true"},
            {"stdin": "1 -1\n1", "expected": "false"},
        ],
        "hiddenTests": [
            {"stdin": "2 0\n1 2", "expected": "true"},
            {"stdin": "0 -1\n", "expected": "false"},
        ],
        "expectedComplexity": {"time": "O(n)", "space": "O(1)"},
        "acceptableComplexities": ["O(n)"],
        "bruteForceComplexity": {"time": "O(n)", "space": "O(n)"},
        "optimalApproach": "Floyd's Tortoise and Hare",
        "optimalHint": "Use slow and fast pointers. If they meet, a cycle exists.",
    },

    # ── BINARY SEARCH PATTERN ─────────────────────────────────────────────────────────────
    {
        "problemId": "binary-search",
        "title": "Binary Search",
        "pattern": "Binary Search",
        "difficulty": "Easy",
        "topics": ["Array", "Binary Search"],
        "description": (
            "Given an array of integers `nums` sorted in ascending order, and an integer `target`, "
            "return the index of `target`. If it does not exist, return `-1`. Must run in O(log n)."
        ),
        "constraints": {"n": "1 <= n <= 10,000"},
        "n_upper": 10_000,
        "examples": [
            {"input": "nums = [-1,0,3,5,9,12], target = 9", "output": "4"},
            {"input": "nums = [-1,0,3,5,9,12], target = 2", "output": "-1"},
        ],
        "sampleTests": [
            {"stdin": "6 9\n-1 0 3 5 9 12", "expected": "4"},
            {"stdin": "6 2\n-1 0 3 5 9 12", "expected": "-1"},
        ],
        "hiddenTests": [
            {"stdin": "1 5\n5", "expected": "0"},
            {"stdin": "2 1\n1 2", "expected": "0"},
            {"stdin": "3 0\n-1 0 3", "expected": "1"},
        ],
        "expectedComplexity": {"time": "O(log n)", "space": "O(1)"},
        "acceptableComplexities": ["O(log n)"],
        "bruteForceComplexity": {"time": "O(n)", "space": "O(1)"},
        "optimalApproach": "Classic Binary Search",
        "optimalHint": "Maintain lo/hi pointers. Compare mid with target and halve the search space each iteration.",
    },

    # ── STACK PATTERN ─────────────────────────────────────────────────────────────────────
    {
        "problemId": "valid-parentheses",
        "title": "Valid Parentheses",
        "pattern": "Stack",
        "difficulty": "Easy",
        "topics": ["Stack", "String"],
        "description": (
            "Given a string `s` containing only '(', ')', '{', '}', '[', ']', "
            "determine if the input string is valid. An input string is valid if open brackets "
            "are closed by the same type of bracket in the correct order."
        ),
        "constraints": {"n": "1 <= s.length <= 10,000"},
        "n_upper": 10_000,
        "examples": [
            {"input": '"()"', "output": "true"},
            {"input": '"()[]{}"', "output": "true"},
            {"input": '"(]"', "output": "false"},
        ],
        "sampleTests": [
            {"stdin": "()", "expected": "true"},
            {"stdin": "()[]{}", "expected": "true"},
            {"stdin": "(]", "expected": "false"},
        ],
        "hiddenTests": [
            {"stdin": "([)]", "expected": "false"},
            {"stdin": "{[]}", "expected": "true"},
            {"stdin": "]", "expected": "false"},
        ],
        "expectedComplexity": {"time": "O(n)", "space": "O(n)"},
        "acceptableComplexities": ["O(n)"],
        "bruteForceComplexity": {"time": "O(n²)", "space": "O(n)"},
        "optimalApproach": "Stack",
        "optimalHint": "Push opening brackets onto a stack. When a closing bracket is encountered, check if it matches the stack top.",
    },

    # ── TREE & RECURSION PATTERN ──────────────────────────────────────────────────────────
    {
        "problemId": "max-depth-binary-tree",
        "title": "Maximum Depth of Binary Tree",
        "pattern": "Tree & Recursion",
        "difficulty": "Easy",
        "topics": ["Tree", "DFS", "Recursion"],
        "description": (
            "Given a binary tree as a level-order sequence (use -1 for null nodes), "
            "return its maximum depth (number of nodes along the longest root-to-leaf path)."
        ),
        "constraints": {"n": "0 <= n <= 10,000"},
        "n_upper": 10_000,
        "examples": [
            {"input": "[3,9,20,-1,-1,15,7]", "output": "3"},
            {"input": "[1,-1,2]", "output": "2"},
        ],
        "sampleTests": [
            {"stdin": "7\n3 9 20 -1 -1 15 7", "expected": "3"},
            {"stdin": "1\n1", "expected": "1"},
        ],
        "hiddenTests": [
            {"stdin": "0\n", "expected": "0"},
            {"stdin": "3\n1 -1 2", "expected": "2"},
        ],
        "expectedComplexity": {"time": "O(n)", "space": "O(h)"},
        "acceptableComplexities": ["O(n)"],
        "bruteForceComplexity": {"time": "O(n)", "space": "O(n)"},
        "optimalApproach": "Recursive DFS",
        "optimalHint": "Return 1 + max(left_depth, right_depth) recursively.",
    },

    {
        "problemId": "invert-binary-tree",
        "title": "Invert Binary Tree",
        "pattern": "Tree & Recursion",
        "difficulty": "Easy",
        "topics": ["Tree", "DFS"],
        "description": "Given a binary tree, invert it (mirror it) and return the level-order output.",
        "constraints": {"n": "0 <= n <= 100"},
        "n_upper": 100,
        "examples": [
            {"input": "[4,2,7,1,3,6,9]", "output": "[4,7,2,9,6,3,1]"},
        ],
        "sampleTests": [
            {"stdin": "7\n4 2 7 1 3 6 9", "expected": "4 7 2 9 6 3 1"},
        ],
        "hiddenTests": [
            {"stdin": "1\n1", "expected": "1"},
            {"stdin": "0\n", "expected": ""},
        ],
        "expectedComplexity": {"time": "O(n)", "space": "O(h)"},
        "acceptableComplexities": ["O(n)"],
        "bruteForceComplexity": {"time": "O(n)", "space": "O(n)"},
        "optimalApproach": "Recursive DFS swap",
        "optimalHint": "Recursively swap left and right children for every node.",
    },

    # ── DYNAMIC PROGRAMMING PATTERN ──────────────────────────────────────────────────────
    {
        "problemId": "climbing-stairs",
        "title": "Climbing Stairs",
        "pattern": "Dynamic Programming",
        "difficulty": "Easy",
        "topics": ["Dynamic Programming"],
        "description": (
            "You are climbing a staircase. It takes `n` steps to reach the top. "
            "Each time you can climb 1 or 2 steps. How many distinct ways can you climb to the top?"
        ),
        "constraints": {"n": "1 <= n <= 45"},
        "n_upper": 45,
        "examples": [
            {"input": "n = 2", "output": "2"},
            {"input": "n = 3", "output": "3"},
        ],
        "sampleTests": [
            {"stdin": "2", "expected": "2"},
            {"stdin": "3", "expected": "3"},
        ],
        "hiddenTests": [
            {"stdin": "1", "expected": "1"},
            {"stdin": "5", "expected": "8"},
            {"stdin": "10", "expected": "89"},
            {"stdin": "45", "expected": "1836311903"},
        ],
        "expectedComplexity": {"time": "O(n)", "space": "O(1)"},
        "acceptableComplexities": ["O(n)"],
        "bruteForceComplexity": {"time": "O(2^n)", "space": "O(n)"},
        "optimalApproach": "DP / Fibonacci",
        "optimalHint": "It's Fibonacci: dp[n] = dp[n-1] + dp[n-2]. Use two variables, not an array.",
    },

    {
        "problemId": "coin-change",
        "title": "Coin Change",
        "pattern": "Dynamic Programming",
        "difficulty": "Medium",
        "topics": ["Dynamic Programming", "BFS"],
        "description": (
            "You are given an integer array `coins` representing coins of different denominations "
            "and an integer `amount` representing a total amount of money. "
            "Return the fewest number of coins needed to make up that amount. "
            "If that amount cannot be made up by any combination, return `-1`."
        ),
        "constraints": {"n": "1 <= coins.length <= 12", "amount": "0 <= amount <= 10,000"},
        "n_upper": 10_000,
        "examples": [
            {"input": "coins = [1,2,5], amount = 11", "output": "3"},
            {"input": "coins = [2], amount = 3", "output": "-1"},
        ],
        "sampleTests": [
            {"stdin": "3 11\n1 2 5", "expected": "3"},
            {"stdin": "1 3\n2", "expected": "-1"},
        ],
        "hiddenTests": [
            {"stdin": "1 0\n1", "expected": "0"},
            {"stdin": "3 100\n1 5 10", "expected": "10"},
        ],
        "expectedComplexity": {"time": "O(amount * n)", "space": "O(amount)"},
        "acceptableComplexities": ["O(amount * n)"],
        "bruteForceComplexity": {"time": "O(n^(amount))", "space": "O(amount)"},
        "optimalApproach": "Bottom-up DP",
        "optimalHint": "Build a dp array of size amount+1. dp[i] = min coins to make amount i.",
    },

    {
        "problemId": "longest-common-subsequence",
        "title": "Longest Common Subsequence",
        "pattern": "Dynamic Programming",
        "difficulty": "Medium",
        "topics": ["Dynamic Programming", "String"],
        "description": (
            "Given two strings `text1` and `text2`, return the length of their longest common subsequence. "
            "A subsequence is a sequence that appears in the same order (not necessarily contiguous)."
        ),
        "constraints": {"m": "1 <= m, n <= 1000"},
        "n_upper": 1_000,
        "examples": [
            {"input": 'text1 = "abcde", text2 = "ace"', "output": "3"},
            {"input": 'text1 = "abc", text2 = "abc"', "output": "3"},
        ],
        "sampleTests": [
            {"stdin": "abcde\nace", "expected": "3"},
            {"stdin": "abc\nabc", "expected": "3"},
        ],
        "hiddenTests": [
            {"stdin": "abc\ndef", "expected": "0"},
            {"stdin": "a\na", "expected": "1"},
        ],
        "expectedComplexity": {"time": "O(m*n)", "space": "O(m*n)"},
        "acceptableComplexities": ["O(m*n)"],
        "bruteForceComplexity": {"time": "O(2^min(m,n))", "space": "O(min(m,n))"},
        "optimalApproach": "2D DP table",
        "optimalHint": "Build a dp[i][j] = LCS of first i chars of text1 and first j chars of text2.",
    },

    # ── BFS / DFS PATTERN ────────────────────────────────────────────────────────────────
    {
        "problemId": "number-of-islands",
        "title": "Number of Islands",
        "pattern": "BFS/DFS",
        "difficulty": "Medium",
        "topics": ["Graph", "BFS", "DFS", "Matrix"],
        "description": (
            "Given an `m x n` grid of '1's (land) and '0's (water), count the number of islands. "
            "An island is surrounded by water and is formed by connecting adjacent '1's horizontally or vertically."
        ),
        "constraints": {"m": "1 <= m, n <= 300"},
        "n_upper": 90_000,
        "examples": [
            {"input": '11110\n11010\n11000\n00000', "output": "1"},
            {"input": '11000\n11000\n00100\n00011', "output": "3"},
        ],
        "sampleTests": [
            {"stdin": "4 5\n11110\n11010\n11000\n00000", "expected": "1"},
            {"stdin": "4 5\n11000\n11000\n00100\n00011", "expected": "3"},
        ],
        "hiddenTests": [
            {"stdin": "1 1\n1", "expected": "1"},
            {"stdin": "1 1\n0", "expected": "0"},
        ],
        "expectedComplexity": {"time": "O(m*n)", "space": "O(m*n)"},
        "acceptableComplexities": ["O(m*n)"],
        "bruteForceComplexity": {"time": "O(m*n)", "space": "O(m*n)"},
        "optimalApproach": "DFS/BFS flood fill",
        "optimalHint": "For every unvisited '1', trigger a DFS/BFS that marks all connected land as visited.",
    },

    {
        "problemId": "course-schedule",
        "title": "Course Schedule",
        "pattern": "BFS/DFS",
        "difficulty": "Medium",
        "topics": ["Graph", "Topological Sort", "Cycle Detection"],
        "description": (
            "There are `numCourses` courses labeled 0 to numCourses-1. "
            "Given an array `prerequisites` where `prerequisites[i] = [ai, bi]` means you must take `bi` before `ai`, "
            "return `true` if you can finish all courses."
        ),
        "constraints": {"n": "1 <= numCourses <= 2000"},
        "n_upper": 2_000,
        "examples": [
            {"input": "numCourses=2, prerequisites=[[1,0]]", "output": "true"},
            {"input": "numCourses=2, prerequisites=[[1,0],[0,1]]", "output": "false"},
        ],
        "sampleTests": [
            {"stdin": "2 1\n1 0", "expected": "true"},
            {"stdin": "2 2\n1 0\n0 1", "expected": "false"},
        ],
        "hiddenTests": [
            {"stdin": "1 0\n", "expected": "true"},
            {"stdin": "3 2\n1 0\n2 1", "expected": "true"},
        ],
        "expectedComplexity": {"time": "O(V+E)", "space": "O(V+E)"},
        "acceptableComplexities": ["O(V+E)"],
        "bruteForceComplexity": {"time": "O(V^2)", "space": "O(V+E)"},
        "optimalApproach": "Kahn's BFS topological sort / DFS cycle detection",
        "optimalHint": "Build adjacency list and in-degree array. Use BFS (Kahn's) to detect if a topological ordering exists.",
    },

    # ── HASHMAP PATTERN (continued) ────────────────────────────────────────────────────
    {
        "problemId": "top-k-frequent-elements",
        "title": "Top K Frequent Elements",
        "pattern": "HashMap",
        "difficulty": "Medium",
        "topics": ["Array", "Hashing", "Sorting", "Heap"],
        "description": (
            "Given an integer array `nums` and an integer `k`, "
            "return the `k` most frequent elements. You may return the answer in any order."
        ),
        "constraints": {"n": "1 <= n <= 100,000", "k": "1 <= k <= unique elements"},
        "n_upper": 100_000,
        "examples": [
            {"input": "nums=[1,1,1,2,2,3], k=2", "output": "[1,2]"},
            {"input": "nums=[1], k=1", "output": "[1]"},
        ],
        "sampleTests": [
            {"stdin": "6 2\n1 1 1 2 2 3", "expected": "1 2"},
            {"stdin": "1 1\n1", "expected": "1"},
        ],
        "hiddenTests": [
            {"stdin": "4 2\n4 1 1 4", "expected": "4 1"},
            {"stdin": "5 1\n1 2 3 4 5", "expected": "1"},
        ],
        "expectedComplexity": {"time": "O(n log k)", "space": "O(n)"},
        "acceptableComplexities": ["O(n log k)", "O(n log n)", "O(n)"],
        "bruteForceComplexity": {"time": "O(n log n)", "space": "O(n)"},
        "optimalApproach": "HashMap + Min-Heap of size k",
        "optimalHint": "Count frequencies with a HashMap, then use a min-heap of size k to track top k elements in O(n log k).",
    },

    {
        "problemId": "group-anagrams",
        "title": "Group Anagrams",
        "pattern": "HashMap",
        "difficulty": "Medium",
        "topics": ["Array", "Hashing", "String"],
        "description": (
            "Given an array of strings `strs`, group the anagrams together. "
            "Return the groups in any order."
        ),
        "constraints": {"n": "1 <= n <= 10,000", "len": "0 <= strs[i].length <= 100"},
        "n_upper": 10_000,
        "examples": [
            {"input": '["eat","tea","tan","ate","nat","bat"]', "output": '[["bat"],["nat","tan"],["ate","eat","tea"]]'},
        ],
        "sampleTests": [
            {"stdin": "6\neat tea tan ate nat bat", "expected": "bat\nnat tan\nate eat tea"},
        ],
        "hiddenTests": [
            {"stdin": "1\n", "expected": ""},
            {"stdin": "1\na", "expected": "a"},
        ],
        "expectedComplexity": {"time": "O(n * k log k)", "space": "O(n * k)"},
        "acceptableComplexities": ["O(n * k log k)", "O(n * k)"],
        "bruteForceComplexity": {"time": "O(n² * k)", "space": "O(n * k)"},
        "optimalApproach": "HashMap with sorted-string key",
        "optimalHint": "For each word, sort its characters as the key. Group words with the same sorted key.",
    },
]


# ── Lookup helpers ─────────────────────────────────────────────────────────────

_INDEX: Dict[str, Dict] = {p["problemId"]: p for p in PROBLEMS}


def get_problem(problem_id: str) -> Dict | None:
    return _INDEX.get(problem_id)


def list_problems(difficulty: str = None, topic: str = None) -> List[Dict]:
    result = PROBLEMS
    if difficulty:
        result = [p for p in result if p["difficulty"].lower() == difficulty.lower()]
    if topic:
        result = [p for p in result if any(topic.lower() in t.lower() for t in p["topics"])]
    return [
        {
            "problemId": p["problemId"],
            "title": p["title"],
            "difficulty": p["difficulty"],
            "topics": p["topics"],
        }
        for p in result
    ]


def get_problems_for_session(difficulty: str = "Mixed", count: int = 3) -> List[Dict]:
    """Return a balanced problem set for a DSA session."""
    import random
    if difficulty == "Easy":
        pool = [p for p in PROBLEMS if p["difficulty"] == "Easy"]
    elif difficulty == "Hard":
        pool = [p for p in PROBLEMS if p["difficulty"] in ("Medium", "Hard")]
    else:
        pool = PROBLEMS
    return random.sample(pool, min(count, len(pool)))


def get_problems_by_pattern(pattern: str, exclude_ids: list = None) -> List[Dict]:
    """Return all problems that match a given DSA pattern."""
    exclude_ids = exclude_ids or []
    return [
        p for p in PROBLEMS
        if p.get("pattern", "").lower() == pattern.lower()
        and p["problemId"] not in exclude_ids
    ]


def get_all_patterns() -> List[str]:
    """Return the ordered list of distinct DSA patterns in the bank."""
    seen = []
    for p in PROBLEMS:
        pat = p.get("pattern", "General")
        if pat not in seen:
            seen.append(pat)
    return seen
