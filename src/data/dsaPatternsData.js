// Comprehensive DSA Patterns Database matching the thita.ai/dsa-patterns-sheet structure
// Contains 16 Categories, 99 Patterns, and 4 LeetCode Questions per pattern with approaches and solutions.

export const DSA_CATEGORIES = [
  {
    id: "two-pointers",
    index: "I",
    name: "Two Pointer Patterns",
    patternCount: 7,
    patterns: [
      {
        id: "tp-1",
        name: "Converging Pointers (Sorted Target Sum)",
        description: "Initialize pointers at opposite ends of a sorted sequence and move them inward to meet in the middle.",
        howToIdentify: "Input is sorted. Searching for a pair or triplet that sums to a target, or checking for palindrome.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Two Sum II - Input Array Is Sorted",
            url: "https://leetcode.com/problems/two-sum-ii-input-array-is-sorted/description/",
            difficulty: "Easy",
            starterCode: {
              Python: "def twoSum(numbers: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass",
              Java: "public class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        // Write your solution here\n        return new int[0];\n    }\n}",
              Cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& numbers, int target) {\n        // Write your solution here\n        return {};\n    }\n};",
              JavaScript: "function twoSum(numbers, target) {\n    // Write your solution here\n    return [];\n}"
            },
            solutionCode: {
              Python: "def twoSum(numbers: list[int], target: int) -> list[int]:\n    left, right = 0, len(numbers) - 1\n    while left < right:\n        curr = numbers[left] + numbers[right]\n        if curr == target:\n            return [left + 1, right + 1]\n        elif curr < target:\n            left += 1\n        else:\n            right -= 1\n    return []",
              Java: "public class Solution {\n    public int[] twoSum(int[] numbers, int target) {\n        int left = 0, right = numbers.length - 1;\n        while (left < right) {\n            int sum = numbers[left] + numbers[right];\n            if (sum == target) return new int[]{left + 1, right + 1};\n            if (sum < target) left++;\n            else right--;\n        }\n        return new int[0];\n    }\n}",
              Cpp: "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& numbers, int target) {\n        int left = 0, right = numbers.size() - 1;\n        while (left < right) {\n            int sum = numbers[left] + numbers[right];\n            if (sum == target) return {left + 1, right + 1};\n            if (sum < target) left++;\n            else right--;\n        }\n        return {};\n    }\n};",
              JavaScript: "function twoSum(numbers, target) {\n    let left = 0, right = numbers.length - 1;\n    while (left < right) {\n        const sum = numbers[left] + numbers[right];\n        if (sum === target) return [left + 1, right + 1];\n        if (sum < target) left++;\n        else right--;\n    }\n    return [];\n}"
            },
            approach: "Use two pointers, left at index 0 and right at the end of the array. Since the array is sorted, increment left if the sum is too small, and decrement right if the sum is too large. O(N) time and O(1) space."
          },
          {
            title: "3Sum",
            url: "https://leetcode.com/problems/3sum/description/",
            difficulty: "Medium",
            approach: "Sort the array, iterate and select the first number, then use two pointers on the remaining part to find two other numbers that sum to the negative of the selected number. Skip duplicates to avoid duplicate triplets."
          },
          {
            title: "Container With Most Water",
            url: "https://leetcode.com/problems/container-with-most-water/description/",
            difficulty: "Medium",
            approach: "Place left pointer at 0 and right pointer at the end. Calculate width and take the min of the two heights. Move the pointer with the smaller height inwards, as keeping it cannot yield a larger volume."
          },
          {
            title: "Trapping Rain Water",
            url: "https://leetcode.com/problems/trapping-rain-water/description/",
            difficulty: "Hard",
            approach: "Keep pointers at 0 and length-1. Track left_max and right_max. Move the pointer pointing to the smaller maximum boundary, adding current water columns dynamically. Time: O(N), Space: O(1)."
          }
        ]
      },
      {
        id: "tp-2",
        name: "Fast & Slow Pointers (Cycle Detection)",
        description: "Advance two pointers at different speeds (e.g. one step and two steps) to detect loop patterns or find midpoints.",
        howToIdentify: "Working with linked lists, cyclic arrays, or number-based cycles where you need to detect loops or find midpoints.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Linked List Cycle",
            url: "https://leetcode.com/problems/linked-list-cycle/description/",
            difficulty: "Easy",
            starterCode: {
              Python: "# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, x):\n#         self.val = x\n#         self.next = None\n\ndef hasCycle(head) -> bool:\n    # Write solution here\n    pass"
            },
            approach: "Maintain a slow pointer moving 1 step and a fast pointer moving 2 steps. If a cycle exists, the fast pointer will eventually catch up and meet the slow pointer. If fast reaches null, no cycle exists."
          },
          {
            title: "Linked List Cycle II",
            url: "https://leetcode.com/problems/linked-list-cycle-ii/description/",
            difficulty: "Medium",
            approach: "Use Floyd's Cycle Detection. Once slow and fast meet, reset one pointer to the head and move both 1 step at a time. The meeting point is the start of the cycle."
          },
          {
            title: "Happy Number",
            url: "https://leetcode.com/problems/happy-number/description/",
            difficulty: "Easy",
            approach: "Represent number states as a linked list sequence where each step squares the digits. Use slow/fast pointers to detect if there is a cycle that doesn't end in 1."
          },
          {
            title: "Middle of the Linked List",
            url: "https://leetcode.com/problems/middle-of-the-linked-list/description/",
            difficulty: "Easy",
            approach: "Move slow pointer by 1 step and fast pointer by 2 steps. When fast reaches the end, slow is at the middle. Time: O(N), Space: O(1)."
          }
        ]
      },
      {
        id: "tp-3",
        name: "Expansion from Center (Palindrome Search)",
        description: "Identify palindromes or structures by starting at a potential center and moving pointers outward.",
        howToIdentify: "Substring checking for palindrome qualities, particularly finding the longest symmetric subsequence in-place.",
        complexity: { time: "O(N^2)", space: "O(1)" },
        questions: [
          {
            title: "Longest Palindromic Substring",
            url: "https://leetcode.com/problems/longest-palindromic-substring/description/",
            difficulty: "Medium",
            approach: "Iterate through the string, treating each character (and gaps between characters) as the center of a palindrome. Expand left and right, tracking the longest palindrome found."
          },
          {
            title: "Palindromic Substrings",
            url: "https://leetcode.com/problems/palindromic-substrings/description/",
            difficulty: "Medium",
            approach: "Similar to finding the longest palindrome, count all valid expansions from each center (odd and even lengths)."
          },
          {
            title: "Valid Palindrome",
            url: "https://leetcode.com/problems/valid-palindrome/description/",
            difficulty: "Easy",
            approach: "Clean the string of non-alphanumeric characters, then use left/right pointers to verify equality moving inwards."
          },
          {
            title: "Valid Palindrome II",
            url: "https://leetcode.com/problems/valid-palindrome-ii/description/",
            difficulty: "Easy",
            approach: "Run standard inwards pointers. On mismatch, check if deleting either the left or right character creates a valid palindrome."
          }
        ]
      },
      {
        id: "tp-4",
        name: "Split/Partition Pointers",
        description: "Sort or rearrange arrays using a pivot index and split pointer targets (inspired by QuickSort).",
        howToIdentify: "Rearranging arrays in place based on pivot elements, relative orders, or partition rules.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Kth Largest Element in an Array",
            url: "https://leetcode.com/problems/kth-largest-element-in-an-array/description/",
            difficulty: "Medium",
            approach: "Can be solved using QuickSelect partition logic. In-place partitioning splits the array until the pivot matches index N - K."
          },
          {
            title: "Sort Colors",
            url: "https://leetcode.com/problems/sort-colors/description/",
            difficulty: "Medium",
            approach: "Use three pointers: low, mid, high. Keep 0s below low, 1s between low and mid, and 2s above high. Swap accordingly."
          },
          {
            title: "Partition List",
            url: "https://leetcode.com/problems/partition-list/description/",
            difficulty: "Medium",
            approach: "Maintain two dummy lists: one for nodes less than X, one for nodes greater than or equal to X. Combine them at the end."
          },
          {
            title: "K Closest Points to Origin",
            url: "https://leetcode.com/problems/k-closest-points-to-origin/description/",
            difficulty: "Medium",
            approach: "Apply QuickSelect based on Euclidean distance to select the K smallest partitions in-place. O(N) average time."
          }
        ]
      },
      {
        id: "tp-5",
        name: "Multi-pass Array Reversal",
        description: "Rearrange array elements in segmented partitions by reversing entire sections using pointers.",
        howToIdentify: "Rotating sequences, shifting elements in-place, or reversing specific subsections.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Rotate Array",
            url: "https://leetcode.com/problems/rotate-array/description/",
            difficulty: "Medium",
            approach: "Reverse the entire array. Then, reverse the first K elements, and reverse the remaining elements. O(1) space."
          },
          {
            title: "Reverse String",
            url: "https://leetcode.com/problems/reverse-string/description/",
            difficulty: "Easy",
            approach: "Swap elements at left and right pointers moving inwards toward the center."
          },
          {
            title: "Reverse Words in a String",
            url: "https://leetcode.com/problems/reverse-words-in-a-string/description/",
            difficulty: "Medium",
            approach: "Clean spacing, reverse the entire string, then reverse individual words in-place."
          },
          {
            title: "Reverse Vowels of a String",
            url: "https://leetcode.com/problems/reverse-vowels-of-a-string/description/",
            difficulty: "Easy",
            approach: "Use converging pointers. Advance left until a vowel is found, retreat right until a vowel is found, swap them, repeat."
          }
        ]
      },
      {
        id: "tp-6",
        name: "Three Pointers (3-Way Partitioning)",
        description: "Use three pointers to group elements of three distinct categories (low, mid, high).",
        howToIdentify: "Sorting an array consisting of three distinct keys or partition values.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Sort Colors",
            url: "https://leetcode.com/problems/sort-colors/description/",
            difficulty: "Medium",
            approach: "Same as Dutch National Flag. Keep 0s at the start, 2s at the end, and 1s in the middle, swapping with left/right pointers."
          },
          {
            title: "3Sum Closest",
            url: "https://leetcode.com/problems/3sum-closest/description/",
            difficulty: "Medium",
            approach: "Sort the array. Loop first pointer. Use two pointers for remaining search space. Track sum closest to target."
          },
          {
            title: "Move Zeroes",
            url: "https://leetcode.com/problems/move-zeroes/description/",
            difficulty: "Easy",
            approach: "Keep a pointer for the last non-zero position. Iterate and swap non-zero elements forward."
          },
          {
            title: "Remove Duplicates from Sorted Array II",
            url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array-ii/description/",
            difficulty: "Medium",
            approach: "Use a slow pointer to track placement. Advance fast pointer, allowing at most two occurrences of each number."
          }
        ]
      },
      {
        id: "tp-7",
        name: "Merge/Compare Pointers (Two Arrays)",
        description: "Maintain individual pointers on two arrays, comparing indices to build a sorted output.",
        howToIdentify: "Merging sorted collections, finding intersections, or evaluating matches across multiple arrays.",
        complexity: { time: "O(N + M)", space: "O(1) auxiliary" },
        questions: [
          {
            title: "Merge Sorted Array",
            url: "https://leetcode.com/problems/merge-sorted-array/description/",
            difficulty: "Easy",
            approach: "Start comparison pointers from the back of both arrays to merge in-place without using extra space."
          },
          {
            title: "Interval List Intersections",
            url: "https://leetcode.com/problems/interval-list-intersections/description/",
            difficulty: "Medium",
            approach: "Evaluate intersections between intervals. Advance the pointer of the interval list that ends first."
          },
          {
            title: "Intersection of Two Arrays II",
            url: "https://leetcode.com/problems/intersection-of-two-arrays-ii/description/",
            difficulty: "Easy",
            approach: "Sort both arrays. Move pointers. If equal, record it and increment both. If different, increment pointer with smaller element."
          },
          {
            title: "Compare Version Numbers",
            url: "https://leetcode.com/problems/compare-version-numbers/description/",
            difficulty: "Medium",
            approach: "Parse revisions by using two pointers moving through version strings separated by dots."
          }
        ]
      }
    ]
  },
  {
    id: "array-matrix",
    index: "II",
    name: "Array/Matrix Manipulation Patterns",
    patternCount: 10,
    patterns: [
      {
        id: "am-1",
        name: "Prefix / Suffix Sums",
        description: "Compute cumulative arrays of sum, product, or state to answer range queries in O(1) time.",
        howToIdentify: "Frequent subarray range queries or prefix/suffix operations where computing sums repeatedly is redundant.",
        complexity: { time: "O(N) precompute, O(1) query", space: "O(N)" },
        questions: [
          {
            title: "Product of Array Except Self",
            url: "https://leetcode.com/problems/product-of-array-except-self/description/",
            difficulty: "Medium",
            approach: "Generate a prefix product array and a suffix product array. Multiply corresponding elements to get results."
          },
          {
            title: "Range Sum Query - Immutable",
            url: "https://leetcode.com/problems/range-sum-query-immutable/description/",
            difficulty: "Easy",
            approach: "Store prefix sums. Range sum [L, R] = prefix[R+1] - prefix[L]. O(1) query time."
          },
          {
            title: "Subarray Sum Equals K",
            url: "https://leetcode.com/problems/subarray-sum-equals-k/description/",
            difficulty: "Medium",
            approach: "Use a hash map to count the frequencies of prefix sums. For each current sum, check if (current_sum - K) exists in the map."
          },
          {
            title: "Find Pivot Index",
            url: "https://leetcode.com/problems/find-pivot-index/description/",
            difficulty: "Easy",
            approach: "Maintain a running left sum. The right sum is total_sum - left_sum - current_val. Pivot is where left sum equals right sum."
          }
        ]
      },
      {
        id: "am-2",
        name: "In-place Matrix Rotation",
        description: "Transpose the matrix first, then reverse rows/columns to perform 90-degree rotations without allocating new grids.",
        howToIdentify: "Rotating 2D square arrays in-place.",
        complexity: { time: "O(N^2)", space: "O(1)" },
        questions: [
          {
            title: "Rotate Image",
            url: "https://leetcode.com/problems/rotate-image/description/",
            difficulty: "Medium",
            approach: "Transpose the matrix (swap matrix[i][j] with matrix[j][i]), then reverse each row to complete a 90-degree clockwise rotation."
          },
          {
            title: "Determine Whether Matrix Can Be Obtained By Rotation",
            url: "https://leetcode.com/problems/determine-whether-matrix-can-be-obtained-by-rotation/description/",
            difficulty: "Easy",
            approach: "Rotate the input matrix up to 4 times and compare it with the target matrix after each rotation."
          },
          {
            title: "Transpose Matrix",
            url: "https://leetcode.com/problems/transpose-matrix/description/",
            difficulty: "Easy",
            approach: "Transpose by swapping row and column indices. If non-square, build a new grid with reversed dimensions."
          },
          {
            title: "Rotate Array",
            url: "https://leetcode.com/problems/rotate-array/description/",
            difficulty: "Medium",
            approach: "Can also be done by triple reversal or modular shifting in O(N) time and O(1) space."
          }
        ]
      },
      {
        id: "am-3",
        name: "Spiral Traversal",
        description: "Traverse a 2D matrix layer-by-layer or edge-by-edge, maintaining boundaries (top, bottom, left, right).",
        howToIdentify: "Iterating along a matrix's perimeter boundary spirals inward.",
        complexity: { time: "O(M * N)", space: "O(1) auxiliary" },
        questions: [
          {
            title: "Spiral Matrix",
            url: "https://leetcode.com/problems/spiral-matrix/description/",
            difficulty: "Medium",
            approach: "Set four boundaries. Traverse right across top, down along right, left across bottom, and up along left. Adjust boundaries inward."
          },
          {
            title: "Spiral Matrix II",
            url: "https://leetcode.com/problems/spiral-matrix-ii/description/",
            difficulty: "Medium",
            approach: "Fill elements from 1 to N^2 sequentially in a grid using the same spiral boundary shrinking movement logic."
          },
          {
            title: "Spiral Matrix III",
            url: "https://leetcode.com/problems/spiral-matrix-iii/description/",
            difficulty: "Medium",
            approach: "Start at target coords, increment step length in pairs (1,1, 2,2, 3,3...), making turns in right-down-left-up sequence."
          },
          {
            title: "Spiral Matrix IV",
            url: "https://leetcode.com/problems/spiral-matrix-iv/description/",
            difficulty: "Medium",
            approach: "Fill a matrix spirally using elements of a linked list. Fill remaining spaces with -1 if the list terminates."
          }
        ]
      },
      {
        id: "am-4",
        name: "Kadane's Algorithm",
        description: "Find the maximum sum of a contiguous subarray by tracking the maximum sum ending at the current position.",
        howToIdentify: "Looking for maximum/minimum contiguous subarray sums.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Maximum Subarray",
            url: "https://leetcode.com/problems/maximum-subarray/description/",
            difficulty: "Easy",
            approach: "Iterate through the array. For each element, decide to extend the current subarray or start a new one. Update global max."
          },
          {
            title: "Maximum Product Subarray",
            url: "https://leetcode.com/problems/maximum-product-subarray/description/",
            difficulty: "Medium",
            approach: "Maintain running min and max products because multiplying two negative values can create a maximum product."
          },
          {
            title: "Maximum Circular Subarray",
            url: "https://leetcode.com/problems/maximum-sum-circular-subarray/description/",
            difficulty: "Medium",
            approach: "Calculate normal max (Kadane's). Calculate total sum and min subarray sum. Circular max is total_sum - min_subarray_sum."
          },
          {
            title: "K-Concatenation Maximum Sum",
            url: "https://leetcode.com/problems/k-concatenation-maximum-sum/description/",
            difficulty: "Medium",
            approach: "Run Kadane's on double concatenation. Add (k - 2) * sum if total sum is positive."
          }
        ]
      },
      {
        id: "am-5",
        name: "Dutch National Flag",
        description: "Sort an array of three distinct elements in a single pass using three pointers.",
        howToIdentify: "Partitioning items of three distinct classes/values in-place.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Sort Colors",
            url: "https://leetcode.com/problems/sort-colors/description/",
            difficulty: "Medium",
            approach: "Keep low pointer (tracks end of 0s), mid pointer (scans), and high pointer (tracks start of 2s). Swap and update pointers."
          },
          {
            title: "Move Zeroes",
            url: "https://leetcode.com/problems/move-zeroes/description/",
            difficulty: "Easy",
            approach: "Use a slow pointer for placing non-zero values. Shift all non-zeros forward, then backfill remaining slots with zeroes."
          },
          {
            title: "Sort Array By Parity",
            url: "https://leetcode.com/problems/sort-array-by-parity/description/",
            difficulty: "Easy",
            approach: "Group even elements before odd elements using left/right swapping pointers."
          },
          {
            title: "3Sum",
            url: "https://leetcode.com/problems/3sum/description/",
            difficulty: "Medium",
            approach: "Can be solved using Sorting followed by Two Pointers (Converging) partition loops."
          }
        ]
      },
      {
        id: "am-6",
        name: "Subarray Counting (Prefix Sum + Hash Map)",
        description: "Use prefix sums stored in a Hash Map to compute matching subarray configurations in one pass.",
        howToIdentify: "Counting subarrays whose sum, count of odds, or conditions match target properties.",
        complexity: { time: "O(N)", space: "O(N)" },
        questions: [
          {
            title: "Subarray Sum Equals K",
            url: "https://leetcode.com/problems/subarray-sum-equals-k/description/",
            difficulty: "Medium",
            approach: "Store prefix sum frequencies in a map. If currentSum - K exists, add its count to the answer. Update map with currentSum."
          },
          {
            title: "Subarray Sums Divisible by K",
            url: "https://leetcode.com/problems/subarray-sums-divisible-by-k/description/",
            difficulty: "Medium",
            approach: "Track running prefix sums modulo K. Use a map to store mod occurrences. Adjust negative mod remainders."
          },
          {
            title: "Contiguous Array",
            url: "https://leetcode.com/problems/contiguous-array/description/",
            difficulty: "Medium",
            approach: "Treat 0 as -1 and 1 as +1. Find the longest subarray with sum 0 by storing the first occurrence index of prefix sums in a map."
          },
          {
            title: "Continuous Subarray Sum",
            url: "https://leetcode.com/problems/continuous-subarray-sum/description/",
            difficulty: "Medium",
            approach: "Check if there is a subarray of length >= 2 with sum equal to a multiple of K using prefix sum mod hash map."
          }
        ]
      },
      {
        id: "am-7",
        name: "Difference Array / Range Update",
        description: "Apply O(1) range updates by marking +val at start index and -val at end+1 index, then computing prefix sums.",
        howToIdentify: "Multiple range increment operations, followed by fetching final array state.",
        complexity: { time: "O(U + N) where U is updates", space: "O(N)" },
        questions: [
          {
            title: "Corporate Flight Bookings",
            url: "https://leetcode.com/problems/corporate-flight-bookings/description/",
            difficulty: "Medium",
            approach: "Create a difference array. For each booking [L, R, seats], add seats at L-1 and subtract seats at R. Compute prefix sum."
          },
          {
            title: "Range Addition",
            url: "https://leetcode.com/problems/range-addition/description/",
            difficulty: "Medium",
            approach: "Standard difference array pattern. Increment target range boundaries, then compute cumulative summation."
          },
          {
            title: "Car Pooling",
            url: "https://leetcode.com/problems/car-pooling/description/",
            difficulty: "Medium",
            approach: "Track passenger changes at locations. Use array/map indexes as timeline. Compute prefix sum to check if capacity is exceeded."
          },
          {
            title: "Describe the Painting",
            url: "https://leetcode.com/problems/describe-the-painting/description/",
            difficulty: "Medium",
            approach: "Record color additions and removals on endpoints. Sum them using sorted coordinate traversal."
          }
        ]
      },
      {
        id: "am-8",
        name: "Monotonic Matrix Traversal",
        description: "Track bounds using monotonic trends or row/column coordinates to search structures.",
        howToIdentify: "Dealing with 2D matrices where rows and columns are sorted independently.",
        complexity: { time: "O(R + C)", space: "O(1)" },
        questions: [
          {
            title: "Search a 2D Matrix II",
            url: "https://leetcode.com/problems/search-a-2d-matrix-ii/description/",
            difficulty: "Medium",
            approach: "Start at top-right or bottom-left corner. If target is smaller, move left. If target is larger, move down."
          },
          {
            title: "Search a 2D Matrix",
            url: "https://leetcode.com/problems/search-a-2d-matrix/description/",
            difficulty: "Easy",
            approach: "Treat the 2D grid as a single flat sorted array and execute standard Binary Search using modular coordinate maps."
          },
          {
            title: "Kth Smallest Element in a Sorted Matrix",
            url: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/description/",
            difficulty: "Medium",
            approach: "Use Binary Search on the value range [min, max]. Use monotonic grid search to count elements smaller than mid."
          },
          {
            title: "Leftmost Column with at Least a One",
            url: "https://leetcode.com/problems/leftmost-column-with-at-least-a-one/description/",
            difficulty: "Medium",
            approach: "Start top-right. While val is 1, move left. If 0, move down. Return last column containing a 1."
          }
        ]
      },
      {
        id: "am-9",
        name: "Row/Column Elimination",
        description: "Solve board or grid puzzles by systematically filtering options row-by-row or column-by-column.",
        howToIdentify: "Matrix operations requiring pruning rows or columns to find valid sets.",
        complexity: { time: "O(M * N)", space: "O(M + N)" },
        questions: [
          {
            title: "Set Matrix Zeroes",
            url: "https://leetcode.com/problems/set-matrix-zeroes/description/",
            difficulty: "Medium",
            approach: "Use the first row and column as flags to mark if the respective row/column needs to be zeroed. Track state of first row/col separately."
          },
          {
            title: "Game of Life",
            url: "https://leetcode.com/problems/game-of-life/description/",
            difficulty: "Medium",
            approach: "Update cells in-place by using temporary state codes (e.g. 2 for dead-to-live, -1 for live-to-dead) to avoid allocating memory."
          },
          {
            title: "Sudoku Solver",
            url: "https://leetcode.com/problems/sudoku-solver/description/",
            difficulty: "Hard",
            approach: "Use backtracking to fill rows/cols, validating cell candidates using masks for rows, cols, and 3x3 grids."
          },
          {
            title: "Valid Sudoku",
            url: "https://leetcode.com/problems/valid-sudoku/description/",
            difficulty: "Medium",
            approach: "Check if row, col, and subgrid constraints are met using sets to record seen numbers in a single pass."
          }
        ]
      },
      {
        id: "am-10",
        name: "Transposition & Reflection",
        description: "Perform geometric modifications on matrices by reflecting or swapping elements along axes.",
        howToIdentify: "Transforming matrices along diagonals or horizontal/vertical mirrors.",
        complexity: { time: "O(N^2)", space: "O(1)" },
        questions: [
          {
            title: "Rotate Image",
            url: "https://leetcode.com/problems/rotate-image/description/",
            difficulty: "Medium",
            approach: "Perform transposition, then reflect horizontally to complete a 90-degree clockwise rotation."
          },
          {
            title: "Transpose Matrix",
            url: "https://leetcode.com/problems/transpose-matrix/description/",
            difficulty: "Easy",
            approach: "Copy items transposing row indexes with column indexes. Handled in one loop."
          },
          {
            title: "Diagonal Traverse",
            url: "https://leetcode.com/problems/diagonal-traverse/description/",
            difficulty: "Medium",
            approach: "Iterate diagonals. Reverse elements of odd-indexed diagonals or toggle direction trackers."
          },
          {
            title: "Matrix Diagonal Sum",
            url: "https://leetcode.com/problems/matrix-diagonal-sum/description/",
            difficulty: "Easy",
            approach: "Sum matrix[i][i] and matrix[i][N-1-i]. Subtract the center cell if the matrix dimension is odd."
          }
        ]
      }
    ]
  },
  {
    id: "linked-list",
    index: "III",
    name: "Linked List Manipulation Patterns",
    patternCount: 5,
    patterns: [
      {
        id: "ll-1",
        name: "In-place Reversal",
        description: "Reverse a segment of a linked list in-place by maintaining prev, curr, and next pointers.",
        howToIdentify: "Reversing whole or part of a linked list without using extra heap memory.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Reverse Linked List",
            url: "https://leetcode.com/problems/reverse-linked-list/description/",
            difficulty: "Easy",
            approach: "Maintain a prev pointer initialized to null. Iterate through, save next node, point curr.next to prev, move prev and curr forward."
          },
          {
            title: "Reverse Linked List II",
            url: "https://leetcode.com/problems/reverse-linked-list-ii/description/",
            difficulty: "Medium",
            approach: "Navigate to the starting index. Perform a standard reversal for the specified length, and reconnect the surrounding nodes."
          },
          {
            title: "Reverse Nodes in k-Group",
            url: "https://leetcode.com/problems/reverse-nodes-in-k-group/description/",
            difficulty: "Hard",
            approach: "Count list size. For every segment of length K, reverse it in-place and link with the previous section. If remaining nodes are < K, leave them."
          },
          {
            title: "Palindrome Linked List",
            url: "https://leetcode.com/problems/palindrome-linked-list/description/",
            difficulty: "Easy",
            approach: "Find middle using fast/slow pointers. Reverse the second half. Compare the first and second halves element by element."
          }
        ]
      },
      {
        id: "ll-2",
        name: "Fast and Slow Pointers",
        description: "Use dual pointers advancing at different speeds (1x and 2x) to find nodes, cycles, or intersections.",
        howToIdentify: "Identifying loops, cycle start coordinates, or find middle elements of lists.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Linked List Cycle",
            url: "https://leetcode.com/problems/linked-list-cycle/description/",
            difficulty: "Easy",
            approach: "Slow advances 1, fast advances 2. If they collide, there is a cycle. If fast hits null, no cycle."
          },
          {
            title: "Linked List Cycle II",
            url: "https://leetcode.com/problems/linked-list-cycle-ii/description/",
            difficulty: "Medium",
            approach: "Detect intersection of slow/fast. Reset one to head. Advance both 1 step. Collision point is cycle start."
          },
          {
            title: "Remove Nth Node From End of List",
            url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/description/",
            difficulty: "Medium",
            approach: "Move fast pointer N steps ahead. Then move slow and fast together until fast reaches the end. Remove node after slow."
          },
          {
            title: "Reorder List",
            url: "https://leetcode.com/problems/reorder-list/description/",
            difficulty: "Medium",
            approach: "Find middle, split list, reverse second half, and merge the two halves by interleaving nodes."
          }
        ]
      },
      {
        id: "ll-3",
        name: "Reorder / Interleave Lists",
        description: "Re-arrange links of two lists by joining nodes in alternating or custom sequences.",
        howToIdentify: "Interleaving nodes, shuffling lists, or alternating elements between splits.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Reorder List",
            url: "https://leetcode.com/problems/reorder-list/description/",
            difficulty: "Medium",
            approach: "Find mid, split into two lists, reverse the second list, and weave them together: 1st -> Nth -> 2nd -> (N-1)th..."
          },
          {
            title: "Odd Even Linked List",
            url: "https://leetcode.com/problems/odd-even-linked-list/description/",
            difficulty: "Medium",
            approach: "Maintain separate lists for odd and even nodes. Link odd list tail to even list head at the end."
          },
          {
            title: "Merge Two Sorted Lists",
            url: "https://leetcode.com/problems/merge-two-sorted-lists/description/",
            difficulty: "Easy",
            approach: "Use a dummy node. Compare heads of both lists, link dummy to smaller, advance corresponding pointer, repeat."
          },
          {
            title: "Split Linked List in Parts",
            url: "https://leetcode.com/problems/split-linked-list-in-parts/description/",
            difficulty: "Medium",
            approach: "Determine the total length of the list, compute base segment sizes and remainders, then slice nodes into K groups."
          }
        ]
      },
      {
        id: "ll-4",
        name: "Dummy Node / Pointer Sentinel",
        description: "Simplify edge cases (like head deletion/insertion) by placing a dummy sentinel node before the list.",
        howToIdentify: "Modifying lists where the head node could be updated, deleted, or swapped.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Remove Linked List Elements",
            url: "https://leetcode.com/problems/remove-linked-list-elements/description/",
            difficulty: "Easy",
            approach: "Create a dummy node pointing to head. Iterate and remove matching elements. Dummy.next handles if head is deleted."
          },
          {
            title: "Merge Two Sorted Lists",
            url: "https://leetcode.com/problems/merge-two-sorted-lists/description/",
            difficulty: "Easy",
            approach: "Use a dummy node to track the head of the new merged list, avoiding null checks on initialization."
          },
          {
            title: "Swap Nodes in Pairs",
            url: "https://leetcode.com/problems/swap-nodes-in-pairs/description/",
            difficulty: "Medium",
            approach: "Use a dummy node. Swap pair nodes ahead by swapping links. Advance current node pointer by 2 places."
          },
          {
            title: "Remove Duplicates from Sorted List II",
            url: "https://leetcode.com/problems/remove-duplicates-from-sorted-list-ii/description/",
            difficulty: "Medium",
            approach: "Initialize dummy pointing to head. Use a two-pointer loop to identify and skip all occurrences of duplicate values."
          }
        ]
      },
      {
        id: "ll-5",
        name: "Sub-list Manipulation",
        description: "Isolate a specific segment of nodes to reverse, filter, or reorder, then splice it back into the list.",
        howToIdentify: "Operating on range markers [left, right] inside a larger singly-linked list.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Reverse Linked List II",
            url: "https://leetcode.com/problems/reverse-linked-list-ii/description/",
            difficulty: "Medium",
            approach: "Find the node prior to index left. Reverse elements between left and right. Re-link boundaries correctly."
          },
          {
            title: "Partition List",
            url: "https://leetcode.com/problems/partition-list/description/",
            difficulty: "Medium",
            approach: "Partition elements into two dummy lists based on X, then chain the end of the first list to the head of the second."
          },
          {
            title: "Insertion Sort List",
            url: "https://leetcode.com/problems/insertion-sort-list/description/",
            difficulty: "Medium",
            approach: "Sort the list in-place by maintaining a sorted sublist and inserting nodes at their correct sorted positions."
          },
          {
            title: "Rotate List",
            url: "https://leetcode.com/problems/rotate-list/description/",
            difficulty: "Medium",
            approach: "Connect tail node to head. Compute length. Traverse to length - (K % length) position, break circle, make new head."
          }
        ]
      }
    ]
  },
  {
    id: "tree-traversal",
    index: "IV",
    name: "Tree Traversal Patterns (DFS & BFS)",
    patternCount: 6,
    patterns: [
      {
        id: "tr-1",
        name: "Level Order Traversal (BFS)",
        description: "Explore trees level-by-level using a queue, capturing nodes at each depth step.",
        howToIdentify: "Finding minimum depth, level averages, right-side views, or processing tree level-by-level.",
        complexity: { time: "O(N)", space: "O(N)" },
        questions: [
          {
            title: "Binary Tree Level Order Traversal",
            url: "https://leetcode.com/problems/binary-tree-level-order-traversal/description/",
            difficulty: "Medium",
            approach: "Use a Queue. Enqueue head. Loop: count elements at current level, dequeue each, add children to queue, save level results."
          },
          {
            title: "Binary Tree Right Side View",
            url: "https://leetcode.com/problems/binary-tree-right-side-view/description/",
            difficulty: "Medium",
            approach: "Run BFS level order traversal. Capture the last node at each level to represent the right-side perspective."
          },
          {
            title: "Average of Levels in Binary Tree",
            url: "https://leetcode.com/problems/average-of-levels-in-binary-tree/description/",
            difficulty: "Easy",
            approach: "Run BFS. For each level, sum node values, divide by level node count, and append the average to the results."
          },
          {
            title: "Populating Next Right Pointers in Each Node",
            url: "https://leetcode.com/problems/populating-next-right-pointers-in-each-node/description/",
            difficulty: "Medium",
            approach: "Connect node.left to node.right, and node.right to node.next.left at each level. Can be done without a queue using next pointers."
          }
        ]
      },
      {
        id: "tr-2",
        name: "Pre-order Traversal (DFS)",
        description: "Traverse tree in Root-Left-Right order. Frequently used to serialize trees or copy structures.",
        howToIdentify: "Evaluating roots first before visiting children, or serializing/deserializing tree structures.",
        complexity: { time: "O(N)", space: "O(H)" },
        questions: [
          {
            title: "Binary Tree Preorder Traversal",
            url: "https://leetcode.com/problems/binary-tree-preorder-traversal/description/",
            difficulty: "Easy",
            approach: "Recursive: process root, recurse left, recurse right. Iterative: use a stack, pop node, push right child, push left child."
          },
          {
            title: "Construct Binary Tree from Preorder and Inorder Traversal",
            url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/description/",
            difficulty: "Medium",
            approach: "First element in preorder is root. Locate this root in inorder to divide tree into left and right subtrees. Recurse."
          },
          {
            title: "Flatten Binary Tree to Linked List",
            url: "https://leetcode.com/problems/flatten-binary-tree-to-linked-list/description/",
            difficulty: "Medium",
            approach: "Use a reverse preorder traversal (Right-Left-Root) to connect nodes in-place to right child branches."
          },
          {
            title: "Serialize and Deserialize Binary Tree",
            url: "https://leetcode.com/problems/serialize-and-deserialize-binary-tree/description/",
            difficulty: "Hard",
            approach: "Perform preorder traversal to serialize tree into a string. Parse elements recursively to rebuild tree."
          }
        ]
      },
      {
        id: "tr-3",
        name: "In-order Traversal (DFS)",
        description: "Traverse tree in Left-Root-Right order. For Binary Search Trees (BST), this visits nodes in sorted ascending order.",
        howToIdentify: "Validating BST structures, finding sorted orders, or accessing elements in-order.",
        complexity: { time: "O(N)", space: "O(H)" },
        questions: [
          {
            title: "Validate Binary Search Tree",
            url: "https://leetcode.com/problems/validate-binary-search-tree/description/",
            difficulty: "Medium",
            approach: "Perform in-order traversal and verify that the values visited are monotonically increasing."
          },
          {
            title: "Kth Smallest Element in a BST",
            url: "https://leetcode.com/problems/kth-smallest-element-in-a-bst/description/",
            difficulty: "Medium",
            approach: "In-order traversal visits BST values in sorted order. Dequeue elements until you reach the Kth value."
          },
          {
            title: "Convert Sorted Array to Binary Search Tree",
            url: "https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/description/",
            difficulty: "Easy",
            approach: "Find the middle of array (root). Recursively build left BST from left half and right BST from right half."
          },
          {
            title: "Recover Binary Search Tree",
            url: "https://leetcode.com/problems/recover-binary-search-tree/description/",
            difficulty: "Medium",
            approach: "Find the two nodes that break the increasing order during in-order traversal, then swap their values."
          }
        ]
      },
      {
        id: "tr-4",
        name: "Post-order Traversal (DFS)",
        description: "Traverse tree in Left-Right-Root order. Ideal for bottom-up calculations where child values must be computed first.",
        howToIdentify: "Height-related calculations, post-order node deletions, or evaluating mathematical expression trees.",
        complexity: { time: "O(N)", space: "O(H)" },
        questions: [
          {
            title: "Maximum Depth of Binary Tree",
            url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/description/",
            difficulty: "Easy",
            approach: "Return 1 + max(depth(node.left), depth(node.right)). Evaluates child paths first before summing."
          },
          {
            title: "Diameter of Binary Tree",
            url: "https://leetcode.com/problems/diameter-of-binary-tree/description/",
            difficulty: "Easy",
            approach: "Calculate left and right depths at each node. Diameter at node is left_depth + right_depth. Maintain a global maximum."
          },
          {
            title: "Lowest Common Ancestor of a Binary Tree",
            url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/description/",
            difficulty: "Medium",
            approach: "Recursively search left and right. If left and right return nodes, current node is LCA. If only one returns, bubble it up."
          },
          {
            title: "Binary Tree Maximum Path Sum",
            url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/description/",
            difficulty: "Hard",
            approach: "Evaluate maximum single path branch value from children. Max sum at node is node.val + left_gain + right_gain. Track max."
          }
        ]
      },
      {
        id: "tr-5",
        name: "Path Finding / Path Sums",
        description: "Traverse from root to leaf nodes, tracking node states to detect path configurations.",
        howToIdentify: "Finding root-to-leaf paths that match target sums or patterns.",
        complexity: { time: "O(N)", space: "O(H) or O(N)" },
        questions: [
          {
            title: "Path Sum",
            url: "https://leetcode.com/problems/path-sum/description/",
            difficulty: "Easy",
            approach: "Subtract current node value from target. Return true if remaining target is 0 at a leaf node. Recurse down children."
          },
          {
            title: "Path Sum II",
            url: "https://leetcode.com/problems/path-sum-ii/description/",
            difficulty: "Medium",
            approach: "Perform DFS tracking current path elements. If leaf node matches remaining target, add a copy of path list to results."
          },
          {
            title: "Sum Root to Leaf Numbers",
            url: "https://leetcode.com/problems/sum-root-to-leaf-numbers/description/",
            difficulty: "Medium",
            approach: "Pass running number (current * 10 + child.val) down. Sum and return value at leaf nodes."
          },
          {
            title: "Binary Tree Paths",
            url: "https://leetcode.com/problems/binary-tree-paths/description/",
            difficulty: "Easy",
            approach: "Perform DFS, building string representation of paths. Add to list when reaching leaf node."
          }
        ]
      },
      {
        id: "tr-6",
        name: "Tree Construction",
        description: "Rebuild a unique binary tree hierarchy using combinations of preorder, inorder, or postorder traversal results.",
        howToIdentify: "Reconstructing tree structures from two traversal sequences.",
        complexity: { time: "O(N)", space: "O(N)" },
        questions: [
          {
            title: "Construct Binary Tree from Preorder and Inorder Traversal",
            url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-inorder-traversal/description/",
            difficulty: "Medium",
            approach: "Use a map for inorder indexes. Parse preorder elements to establish root. Build left and right trees recursively."
          },
          {
            title: "Construct Binary Tree from Inorder and Postorder Traversal",
            url: "https://leetcode.com/problems/construct-binary-tree-from-inorder-and-postorder-traversal/description/",
            difficulty: "Medium",
            approach: "The root node is at the end of the postorder sequence. Partition inorder array and build right subtree before left."
          },
          {
            title: "Construct Binary Tree from Preorder and Postorder Traversal",
            url: "https://leetcode.com/problems/construct-binary-tree-from-preorder-and-postorder-traversal/description/",
            difficulty: "Medium",
            approach: "Use root value (first preorder) and identify left child node (second preorder). Locate it in postorder to divide children."
          },
          {
            title: "Convert Sorted List to Binary Search Tree",
            url: "https://leetcode.com/problems/convert-sorted-list-to-binary-search-tree/description/",
            difficulty: "Medium",
            approach: "Find linked list midpoint using slow/fast pointers. Mid node is root. Recurse on left and right list segments."
          }
        ]
      }
    ]
  },
  {
    id: "sliding-window",
    index: "V",
    name: "Sliding Window Patterns",
    patternCount: 4,
    patterns: [
      {
        id: "sw-1",
        name: "Fixed Size Window",
        description: "Maintain a sub-segment window of fixed size K. Shift the window across the array, updating the state in O(1) time.",
        howToIdentify: "Operating on contiguous subarrays of fixed length K, checking aggregate qualities (sum, unique items, etc.).",
        complexity: { time: "O(N)", space: "O(K) or O(1)" },
        questions: [
          {
            title: "Maximum Average Subarray I",
            url: "https://leetcode.com/problems/maximum-average-subarray-i/description/",
            difficulty: "Easy",
            approach: "Compute sum of first K elements. Slide the window by adding the next element and subtracting the leftmost element. Track max sum."
          },
          {
            title: "Find All Anagrams in a String",
            url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/description/",
            difficulty: "Medium",
            approach: "Use a fixed window of size P.length. Compare character frequency maps between window and P. Adjust frequencies on shifts."
          },
          {
            title: "Permutation in String",
            url: "https://leetcode.com/problems/permutation-in-string/description/",
            difficulty: "Medium",
            approach: "Check if string S2 contains an anagram of S1 using a fixed sliding window of length S1.length."
          },
          {
            title: "Maximum Number of Vowels in a Substring of Given Length",
            url: "https://leetcode.com/problems/maximum-number-of-vowels-in-a-substring-of-given-length/description/",
            difficulty: "Medium",
            approach: "Slide window of size K. Track vowel count by updating values on additions and removals. Return max count."
          }
        ]
      },
      {
        id: "sw-2",
        name: "Variable Size Window (Expansion-focused)",
        description: "Expand the window by advancing the right pointer. Shrink from the left when window constraints are violated.",
        howToIdentify: "Finding the longest subarray or substring matching a particular condition (e.g. at most K unique characters).",
        complexity: { time: "O(N)", space: "O(1) or O(N)" },
        questions: [
          {
            title: "Longest Substring Without Repeating Characters",
            url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/description/",
            difficulty: "Medium",
            approach: "Use a sliding window. Move right pointer to add chars. If character duplicates, move left pointer to shrink window."
          },
          {
            title: "Longest Repeating Character Replacement",
            url: "https://leetcode.com/problems/longest-repeating-character-replacement/description/",
            difficulty: "Medium",
            approach: "Maintain character frequencies. If (window_length - max_char_freq) > K, shrink window from the left."
          },
          {
            title: "Max Consecutive Ones III",
            url: "https://leetcode.com/problems/max-consecutive-ones-iii/description/",
            difficulty: "Medium",
            approach: "Slide window. Expand right. If count of flipped zeros exceeds K, increment left pointer to shrink the window."
          },
          {
            title: "Minimum Size Subarray Sum",
            url: "https://leetcode.com/problems/minimum-size-subarray-sum/description/",
            difficulty: "Medium",
            approach: "Expand window until sum >= target. Shrink left pointer as much as possible while maintaining sum >= target, tracking min length."
          }
        ]
      },
      {
        id: "sw-3",
        name: "Window with Hash Map / Counter",
        description: "Leverage a hash map to count character frequencies within the sliding window boundary to evaluate complex conditions.",
        howToIdentify: "Comparing substring sequences against variable target character counts.",
        complexity: { time: "O(N)", space: "O(K)" },
        questions: [
          {
            title: "Minimum Window Substring",
            url: "https://leetcode.com/problems/minimum-window-substring/description/",
            difficulty: "Hard",
            approach: "Track target character counts. Expand right. Once window contains all target characters, shrink left to optimize/minimize window."
          },
          {
            title: "Substring with Concatenation of All Words",
            url: "https://leetcode.com/problems/substring-with-concatenation-of-all-words/description/",
            difficulty: "Hard",
            approach: "Use a map to store word frequencies. Slide windows of size (words_count * word_len), analyzing chunks."
          },
          {
            title: "Longest Substring with At Most K Distinct Characters",
            url: "https://leetcode.com/problems/longest-substring-with-at-most-k-distinct-characters/description/",
            difficulty: "Medium",
            approach: "Maintain counts in map. If distinct keys > K, shrink left, removing keys when count hits 0. Track max length."
          },
          {
            title: "Find All Anagrams in a String",
            url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/description/",
            difficulty: "Medium",
            approach: "Use sliding window frequency matches to identify indices."
          }
        ]
      },
      {
        id: "sw-4",
        name: "Two-Pass Sliding Window",
        description: "Track monotonic states or perform multi-directional expansions to evaluate window values.",
        howToIdentify: "Evaluating product bounds, counts, or values across multiple sweeps.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Subarray Product Less Than K",
            url: "https://leetcode.com/problems/subarray-product-less-than-k/description/",
            difficulty: "Medium",
            approach: "Expand right, multiplying product. If product >= K, divide by left element and increment left. Add right - left + 1 to count."
          },
          {
            title: "Fruit Into Baskets",
            url: "https://leetcode.com/problems/fruit-into-baskets/description/",
            difficulty: "Medium",
            approach: "Find the longest subarray containing at most 2 distinct integers using sliding window counter."
          },
          {
            title: "Minimum Swaps to Group All 1's Together II",
            url: "https://leetcode.com/problems/minimum-swaps-to-group-all-1s-together-ii/description/",
            difficulty: "Medium",
            approach: "Count total 1s (say C). Use fixed window of size C on circular array. Max 1s in window gives min swaps (C - max_1s)."
          },
          {
            title: "Sliding Window Maximum",
            url: "https://leetcode.com/problems/sliding-window-maximum/description/",
            difficulty: "Hard",
            approach: "Use a monotonic deque. Store indices. Remove indices out of window. Pop elements smaller than current from back."
          }
        ]
      }
    ]
  },
  {
    id: "stack-patterns",
    index: "VI",
    name: "Stack Patterns",
    patternCount: 6,
    patterns: [
      {
        id: "st-1",
        name: "Monotonic Stack",
        description: "Maintain elements in a stack in sorted ascending or descending order. Used to find next greater or next smaller elements.",
        howToIdentify: "Finding the first element larger or smaller to the left or right of items in an array.",
        complexity: { time: "O(N)", space: "O(N)" },
        questions: [
          {
            title: "Next Greater Element I",
            url: "https://leetcode.com/problems/next-greater-element-i/description/",
            difficulty: "Easy",
            approach: "Iterate from right. Maintain a stack of elements. While stack has elements <= current, pop. Top of stack is next greater. Push current."
          },
          {
            title: "Daily Temperatures",
            url: "https://leetcode.com/problems/daily-temperatures/description/",
            difficulty: "Medium",
            approach: "Use a monotonic stack storing indices. Pop indices when current temperature is greater, calculating index difference."
          },
          {
            title: "Largest Rectangle in Histogram",
            url: "https://leetcode.com/problems/largest-rectangle-in-histogram/description/",
            difficulty: "Hard",
            approach: "Maintain a monotonic increasing stack of indices. When height decreases, pop and calculate area with height of popped bar."
          },
          {
            title: "Online Stock Span",
            url: "https://leetcode.com/problems/online-stock-span/description/",
            difficulty: "Medium",
            approach: "Maintain monotonic decreasing stack of [price, span]. Sum spans of popped cheaper days, then push current."
          }
        ]
      },
      {
        id: "st-2",
        name: "Parentheses & Nesting",
        description: "Push opener characters onto a stack and pop to validate matches with closer characters.",
        howToIdentify: "Validating parentheses, html tags, bracket nesting rules.",
        complexity: { time: "O(N)", space: "O(N)" },
        questions: [
          {
            title: "Valid Parentheses",
            url: "https://leetcode.com/problems/valid-parentheses/description/",
            difficulty: "Easy",
            approach: "Iterate through string. If opener, push. If closer, pop and verify it matches the current closer. Stack must be empty at the end."
          },
          {
            title: "Minimum Remove to Make Valid Parentheses",
            url: "https://leetcode.com/problems/minimum-remove-to-make-valid-parentheses/description/",
            difficulty: "Medium",
            approach: "Track indices of unmatched '(' and ')' in a stack/set. Filter out these indices from the string to get result."
          },
          {
            title: "Generate Parentheses",
            url: "https://leetcode.com/problems/generate-parentheses/description/",
            difficulty: "Medium",
            approach: "Use backtracking to generate parentheses combinations, tracking counts of open and close brackets."
          },
          {
            title: "Longest Valid Parentheses",
            url: "https://leetcode.com/problems/longest-valid-parentheses/description/",
            difficulty: "Hard",
            approach: "Initialize stack with -1. Push index of unmatched items. Subtract popped index from current to get valid length."
          }
        ]
      },
      {
        id: "st-3",
        name: "Calculator / Expressions",
        description: "Parse arithmetic expressions by pushing digits/operators onto a stack, handling precedence by popping on encounter.",
        howToIdentify: "Evaluating string mathematical formulas, brackets, and operators.",
        complexity: { time: "O(N)", space: "O(N)" },
        questions: [
          {
            title: "Basic Calculator II",
            url: "https://leetcode.com/problems/basic-calculator-ii/description/",
            difficulty: "Medium",
            approach: "Parse numbers. For '+' or '-', push number. For '*' or '/', pop last element, compute operation, and push result. Sum stack."
          },
          {
            title: "Basic Calculator",
            url: "https://leetcode.com/problems/basic-calculator/description/",
            difficulty: "Hard",
            approach: "Maintain signs and running sums on stack when encountering parentheses. Re-calculate on closing brackets."
          },
          {
            title: "Evaluate Reverse Polish Notation",
            url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/description/",
            difficulty: "Medium",
            approach: "Iterate through tokens. If number, push. If operator, pop two elements, perform math, and push result back."
          },
          {
            title: "Decode String",
            url: "https://leetcode.com/problems/decode-string/description/",
            difficulty: "Medium",
            approach: "Push counts and current string state onto stack when finding '['. Pop and repeat substring when finding ']'."
          }
        ]
      },
      {
        id: "st-4",
        name: "Stack-based DFS",
        description: "Simulate recursive tree or graph DFS traversals iteratively using a stack to prevent call-stack overflows.",
        howToIdentify: "Iterative graph exploration or depth-first tree traversal requirements.",
        complexity: { time: "O(N)", space: "O(H)" },
        questions: [
          {
            title: "Binary Tree Inorder Traversal",
            url: "https://leetcode.com/problems/binary-tree-inorder-traversal/description/",
            difficulty: "Easy",
            approach: "Maintain a stack. Push node and traverse left. Dequeue/pop, record, then switch to the right child."
          },
          {
            title: "Clone Graph",
            url: "https://leetcode.com/problems/clone-graph/description/",
            difficulty: "Medium",
            approach: "Iteratively traverse using a stack (DFS). Create copy nodes, tracking them in a visited map."
          },
          {
            title: "Binary Search Tree Iterator",
            url: "https://leetcode.com/problems/binary-search-tree-iterator/description/",
            difficulty: "Medium",
            approach: "Implement BST next() and hasNext() in O(1) amortized time by storing left child branches in a stack."
          },
          {
            title: "Validate Binary Search Tree",
            url: "https://leetcode.com/problems/validate-binary-search-tree/description/",
            difficulty: "Medium",
            approach: "Iteratively run inorder traversal. Maintain previous value to check if nodes are strictly sorted."
          }
        ]
      },
      {
        id: "st-5",
        name: "Min / Max Stack",
        description: "Track the minimum or maximum element in the stack in O(1) time by storing states concurrently.",
        howToIdentify: "Requiring push, pop, and retrieve minimum/maximum elements, all in constant time.",
        complexity: { time: "O(1) for all ops", space: "O(N)" },
        questions: [
          {
            title: "Min Stack",
            url: "https://leetcode.com/problems/min-stack/description/",
            difficulty: "Medium",
            approach: "Maintain a secondary stack that stores the minimum value encountered up to the current element."
          },
          {
            title: "Max Element Stack",
            url: "https://leetcode.com/problems/max-stack/description/",
            difficulty: "Hard",
            approach: "Similar to Min Stack, keep a max-tracking stack or double node references to retrieve max in O(1)."
          },
          {
            title: "Min Max Game",
            url: "https://leetcode.com/problems/min-max-game/description/",
            difficulty: "Easy",
            approach: "Simulate competitive matches. Reduce array sizes recursively using min and max selections."
          },
          {
            title: "Sliding Window Maximum",
            url: "https://leetcode.com/problems/sliding-window-maximum/description/",
            difficulty: "Hard",
            approach: "Can also be modeled by tracking left/right blocks with local stack peaks."
          }
        ]
      },
      {
        id: "st-6",
        name: "Collapsing/Simplifying Paths",
        description: "Clean up paths or command logs by using a stack to traverse directories, popping on go-back operators.",
        howToIdentify: "Evaluating file directories, terminal navigation commands, or backspaces.",
        complexity: { time: "O(N)", space: "O(N)" },
        questions: [
          {
            title: "Simplify Path",
            url: "https://leetcode.com/problems/simplify-path/description/",
            difficulty: "Medium",
            approach: "Split path by '/'. If '.' or empty, skip. If '..', pop from stack. Else, push directory name. Join stack with '/'."
          },
          {
            title: "Backspace String Compare",
            url: "https://leetcode.com/problems/backspace-string-compare/description/",
            difficulty: "Easy",
            approach: "Process string using a stack: push characters, pop on '#'. Compare final stack structures."
          },
          {
            title: "Remove All Adjacent Duplicates In String",
            url: "https://leetcode.com/problems/remove-all-adjacent-duplicates-in-string/description/",
            difficulty: "Easy",
            approach: "Push characters. If top of stack matches current character, pop both. Build string from remaining characters."
          },
          {
            title: "Asteroid Collision",
            url: "https://leetcode.com/problems/asteroid-collision/description/",
            difficulty: "Medium",
            approach: "Push asteroids. For negative values, collide/pop smaller positive values. Push if no collision or positive."
          }
        ]
      }
    ]
  },
  {
    id: "heap-patterns",
    index: "VII",
    name: "Heap (Priority Queue) Patterns",
    patternCount: 4,
    patterns: [
      {
        id: "hp-1",
        name: "Top K Elements",
        description: "Find the K largest or smallest elements using a heap of size K, ensuring O(N log K) time complexity.",
        howToIdentify: "Looking for K largest, K smallest, or K most frequent elements.",
        complexity: { time: "O(N log K)", space: "O(K)" },
        questions: [
          {
            title: "Kth Largest Element in an Array",
            url: "https://leetcode.com/problems/kth-largest-element-in-an-array/description/",
            difficulty: "Medium",
            approach: "Insert elements into a Min-Heap. If heap size > K, pop. The root of the heap will be the Kth largest element."
          },
          {
            title: "Top K Frequent Elements",
            url: "https://leetcode.com/problems/top-k-frequent-elements/description/",
            difficulty: "Medium",
            approach: "Build a frequency map. Push key-value pairs into a Min-Heap of size K based on frequency. Return map keys from heap."
          },
          {
            title: "K Closest Points to Origin",
            url: "https://leetcode.com/problems/k-closest-points-to-origin/description/",
            difficulty: "Medium",
            approach: "Build a Max-Heap of size K based on distance. Pop on overflow. Remaining items are closest."
          },
          {
            title: "Find K Closest Elements",
            url: "https://leetcode.com/problems/find-k-closest-elements/description/",
            difficulty: "Medium",
            approach: "Use a Heap sorting by absolute distance from target. Alternatively solved in O(log(N-K)) with Binary Search."
          }
        ]
      },
      {
        id: "hp-2",
        name: "K-way Merge",
        description: "Merge K sorted lists/arrays into a single sorted list using a Min-Heap to track the next smallest elements.",
        howToIdentify: "Merging sorted lists, arrays, or streams sequentially.",
        complexity: { time: "O(N log K) where N is total nodes", space: "O(K)" },
        questions: [
          {
            title: "Merge K Sorted Lists",
            url: "https://leetcode.com/problems/merge-k-sorted-lists/description/",
            difficulty: "Hard",
            approach: "Insert head node of all lists into a Min-Heap. Pop smallest, link, then insert the next node of the popped list. Repeat."
          },
          {
            title: "Find K Pairs with Smallest Sums",
            url: "https://leetcode.com/problems/find-k-pairs-with-smallest-sums/description/",
            difficulty: "Medium",
            approach: "Push pairs (nums1[i], nums2[0]) onto heap. Pop smallest, save pair, and insert (nums1[i], nums2[j+1]) to search space."
          },
          {
            title: "Kth Smallest Element in a Sorted Matrix",
            url: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/description/",
            difficulty: "Medium",
            approach: "Push the first element of each row into a Min-Heap. Dequeue K times, replacing popped elements with their right neighbors."
          },
          {
            title: "Smallest Range Covering Elements from K Lists",
            url: "https://leetcode.com/problems/smallest-range-covering-elements-from-k-lists/description/",
            difficulty: "Hard",
            approach: "Use a Min-Heap of size K. Track current max value. Pop min, calculate range, and push the next element of the popped list."
          }
        ]
      },
      {
        id: "hp-3",
        name: "Two Heaps (Median Tracking)",
        description: "Maintain elements in two parts: a Max-Heap for the left half, and a Min-Heap for the right half. Keeps medians balanced.",
        howToIdentify: "Finding or updating the median from a dynamic data stream.",
        complexity: { time: "O(log N) insert, O(1) find", space: "O(N)" },
        questions: [
          {
            title: "Find Median from Data Stream",
            url: "https://leetcode.com/problems/find-median-from-data-stream/description/",
            difficulty: "Hard",
            approach: "Insert into max-heap (left). Balance: move root to min-heap (right) if size differences > 1. Median is averages of roots."
          },
          {
            title: "Sliding Window Median",
            url: "https://leetcode.com/problems/sliding-window-median/description/",
            difficulty: "Hard",
            approach: "Maintain two heaps. Add/remove items on window shifts. Balance heaps and output medians dynamically."
          },
          {
            title: "IPO",
            url: "https://leetcode.com/problems/ipo/description/",
            difficulty: "Hard",
            approach: "Max-Heap for profits, Min-Heap for capital constraints. Push viable projects, pop best profit."
          },
          {
            title: "Schedule Course III",
            url: "https://leetcode.com/problems/course-schedule-iii/description/",
            difficulty: "Hard",
            approach: "Sort courses by deadline. Add to Max-Heap of durations. If total time exceeds current deadline, pop longest course."
          }
        ]
      },
      {
        id: "hp-4",
        name: "Min/Max Tracking",
        description: "Process events chronologically using a Heap to track resource releases or allocations.",
        howToIdentify: "Interval alignments, timeline overlap counting, scheduling problems.",
        complexity: { time: "O(N log N)", space: "O(N)" },
        questions: [
          {
            title: "Meeting Rooms II",
            url: "https://leetcode.com/problems/meeting-rooms-ii/description/",
            difficulty: "Medium",
            approach: "Sort meetings by start time. Insert end times into a Min-Heap. If start >= heap root, pop (room freed). Heap size is rooms count."
          },
          {
            title: "Single-Threaded CPU",
            url: "https://leetcode.com/problems/single-threaded-cpu/description/",
            difficulty: "Medium",
            approach: "Sort tasks by enqueue time. Maintain a Min-Heap of available tasks sorted by processing time, then index."
          },
          {
            title: "Furthest Building You Can Reach",
            url: "https://leetcode.com/problems/furthest-building-you-can-reach/description/",
            difficulty: "Medium",
            approach: "Store jumps in a Min-Heap of ladders size. When heap size exceeds ladders, pop smallest jump and deduct blocks from bricks."
          },
          {
            title: "Distant Barcodes",
            url: "https://leetcode.com/problems/distant-barcodes/description/",
            difficulty: "Medium",
            approach: "Put counts in Max-Heap. Pop top two most frequent elements, write to output, decrement counts, and push back."
          }
        ]
      }
    ]
  },
  {
    id: "binary-search",
    index: "VIII",
    name: "Binary Search Patterns",
    patternCount: 5,
    patterns: [
      {
        id: "bs-1",
        name: "Standard Search Space",
        description: "Locate targets in sorted arrays by repeatedly halving the search space.",
        howToIdentify: "Input array is sorted. Binary search target value.",
        complexity: { time: "O(log N)", space: "O(1)" },
        questions: [
          {
            title: "Binary Search",
            url: "https://leetcode.com/problems/binary-search/description/",
            difficulty: "Easy",
            approach: "Set low=0, high=len-1. Loop while low<=high. mid=(low+high)/2. If mid equals target, return. Adjust boundaries based on mid comparison."
          },
          {
            title: "Search a 2D Matrix",
            url: "https://leetcode.com/problems/search-a-2d-matrix/description/",
            difficulty: "Easy",
            approach: "Map 1D index to 2D index (row = mid / cols, col = mid % cols) and run standard binary search."
          },
          {
            title: "Search Insert Position",
            url: "https://leetcode.com/problems/search-insert-position/description/",
            difficulty: "Easy",
            approach: "Run binary search. If target not found, return left/low pointer index as the sorted insertion point."
          },
          {
            title: "Guess Number Higher or Lower",
            url: "https://leetcode.com/problems/guess-number-higher-or-lower/description/",
            difficulty: "Easy",
            approach: "Standard binary search guessing game using custom feedback API (-1, 1, 0)."
          }
        ]
      },
      {
        id: "bs-2",
        name: "Search Space Optimization (Binary Search on Answer)",
        description: "Apply binary search on the output value space [min_possible_val, max_possible_val] to find the optimal result matching constraints.",
        howToIdentify: "Finding minimum or maximum capacity, speed, or threshold that satisfies a validation helper function.",
        complexity: { time: "O(N log(Range))", space: "O(1)" },
        questions: [
          {
            title: "Koko Eating Bananas",
            url: "https://leetcode.com/problems/koko-eating-bananas/description/",
            difficulty: "Medium",
            approach: "BS on speed [1, max_piles]. Helper: calculate hours needed for mid speed. If hours <= H, search left (slower). Else, search right."
          },
          {
            title: "Capacity To Ship Packages Within D Days",
            url: "https://leetcode.com/problems/capacity-to-ship-packages-within-d-days/description/",
            difficulty: "Medium",
            approach: "BS on capacity [max_weight, sum_weights]. Check if packages can be shipped in D days at mid capacity."
          },
          {
            title: "Find the Smallest Divisor Given a Threshold",
            url: "https://leetcode.com/problems/find-the-smallest-divisor-given-a-threshold/description/",
            difficulty: "Medium",
            approach: "BS on divisor [1, max_val]. Helper sums array ceil divisions. Compare sum to threshold."
          },
          {
            title: "Split Array Largest Sum",
            url: "https://leetcode.com/problems/split-array-largest-sum/description/",
            difficulty: "Hard",
            approach: "BS on maximum subarray sum [max_element, sum_array]. Helper checks if array can be split into M parts with max sum <= mid."
          }
        ]
      },
      {
        id: "bs-3",
        name: "Find Peak / Local Extrema",
        description: "Use slopes (mid vs mid+1) to determine which direction has a local peak in unsorted arrays.",
        howToIdentify: "Finding peaks, local minima, or maxima in arrays where neighbors differ.",
        complexity: { time: "O(log N)", space: "O(1)" },
        questions: [
          {
            title: "Find Peak Element",
            url: "https://leetcode.com/problems/find-peak-element/description/",
            difficulty: "Medium",
            approach: "If nums[mid] < nums[mid+1], peak is to the right (move left = mid + 1). Otherwise, peak is to the left (move right = mid)."
          },
          {
            title: "Peak Index in a Mountain Array",
            url: "https://leetcode.com/problems/peak-index-in-a-mountain-array/description/",
            difficulty: "Medium",
            approach: "Find peak in mountain structure using slopes in O(log N) time."
          },
          {
            title: "Find Minimum in Rotated Sorted Array",
            url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/description/",
            difficulty: "Medium",
            approach: "If nums[mid] > nums[right], minimum is in the right half (left = mid + 1). Else, minimum is in left half (right = mid)."
          },
          {
            title: "Find Minimum in Rotated Sorted Array II",
            url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array-ii/description/",
            difficulty: "Hard",
            approach: "Handle duplicates by decrementing high pointer when nums[mid] == nums[high], maintaining worst case O(N) fallback."
          }
        ]
      },
      {
        id: "bs-4",
        name: "Search in Rotated Sorted Array",
        description: "Find a target in rotated sorted arrays by checking which half of the array (left or right of mid) is normally sorted.",
        howToIdentify: "Searching rotated arrays.",
        complexity: { time: "O(log N)", space: "O(1)" },
        questions: [
          {
            title: "Search in Rotated Sorted Array",
            url: "https://leetcode.com/problems/search-in-rotated-sorted-array/description/",
            difficulty: "Medium",
            approach: "If nums[left] <= nums[mid], left half is sorted. Check if target lies in left range; adjust pointers. Else, do same for right."
          },
          {
            title: "Search in Rotated Sorted Array II",
            url: "https://leetcode.com/problems/search-in-rotated-sorted-array-ii/description/",
            difficulty: "Medium",
            approach: "Handles duplicate values. If nums[left] == nums[mid] == nums[right], increment left and decrement right to shrink search space."
          },
          {
            title: "Find Minimum in Rotated Sorted Array",
            url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/description/",
            difficulty: "Medium",
            approach: "Find inflection point where array rotates using binary search."
          },
          {
            title: "Find K Closest Elements",
            url: "https://leetcode.com/problems/find-k-closest-elements/description/",
            difficulty: "Medium",
            approach: "Use binary search on start index of the K-length sliding window window: compare (X - nums[mid]) to (nums[mid+K] - X)."
          }
        ]
      },
      {
        id: "bs-5",
        name: "Boundary Search (First & Last Position)",
        description: "Find left and right boundaries of values in arrays containing duplicates by continuing search on hits.",
        howToIdentify: "Finding first/last index of target values, or counting frequencies in sorted lists.",
        complexity: { time: "O(log N)", space: "O(1)" },
        questions: [
          {
            title: "Find First and Last Position of Element in Sorted Array",
            url: "https://leetcode.com/problems/find-first-and-last-position-of-element-in-sorted-array/description/",
            difficulty: "Medium",
            approach: "Run two binary searches. For first position, if target found, continue searching left. For last position, search right."
          },
          {
            title: "First Bad Version",
            url: "https://leetcode.com/problems/first-bad-version/description/",
            difficulty: "Easy",
            approach: "Binary search versions. If version is bad, check left bad version boundaries (high = mid). Else, look right."
          },
          {
            title: "Kth Smallest Element in a Sorted Matrix",
            url: "https://leetcode.com/problems/kth-smallest-element-in-a-sorted-matrix/description/",
            difficulty: "Medium",
            approach: "Use binary search boundary on values, utilizing step matrix comparisons."
          },
          {
            title: "Median of Two Sorted Arrays",
            url: "https://leetcode.com/problems/median-of-two-sorted-arrays/description/",
            difficulty: "Hard",
            approach: "Partition both arrays such that left half size is equal to right. Binary search partition bounds in the smaller array."
          }
        ]
      }
    ]
  },
  {
    id: "graph-traversal",
    index: "IX",
    name: "Graph Traversal Patterns (DFS & BFS)",
    patternCount: 11,
    patterns: [
      {
        id: "gt-1",
        name: "BFS Shortest Path",
        description: "Explore graph level-by-level using a Queue. The first visit to any node guarantees the shortest path from the source.",
        howToIdentify: "Finding shortest path, minimum steps, or levels of connectivity in unweighted networks.",
        complexity: { time: "O(V + E)", space: "O(V)" },
        questions: [
          {
            title: "Shortest Path in Binary Matrix",
            url: "https://leetcode.com/problems/shortest-path-in-binary-matrix/description/",
            difficulty: "Medium",
            approach: "BFS starting at (0, 0). Push to queue, mark visited. Check 8 neighbors. Return step count when reaching bottom-right corner."
          },
          {
            title: "Word Ladder",
            url: "https://leetcode.com/problems/word-ladder/description/",
            difficulty: "Hard",
            approach: "BFS. Generate word permutations by changing one letter. Search through dictionary, returning steps when reaching endWord."
          },
          {
            title: "Rotting Oranges",
            url: "https://leetcode.com/problems/rotting-oranges/description/",
            difficulty: "Medium",
            approach: "Multi-source BFS. Put all rotten oranges in queue. Traverse grid, rotting adjacent fresh oranges. Track minutes elapsed."
          },
          {
            title: "Open the Lock",
            url: "https://leetcode.com/problems/open-the-lock/description/",
            difficulty: "Medium",
            approach: "BFS. Explore lock combinations (rotate wheels +/- 1). Avoid combinations labeled as deadends."
          }
        ]
      },
      {
        id: "gt-2",
        name: "DFS Cycle Detection",
        description: "Traverse graphs using recursion. In directed graphs, a cycle exists if we visit a node currently in the call stack (back-edge).",
        howToIdentify: "Checking if dependencies are resolvable or detecting circular loops.",
        complexity: { time: "O(V + E)", space: "O(V)" },
        questions: [
          {
            title: "Course Schedule",
            url: "https://leetcode.com/problems/course-schedule/description/",
            difficulty: "Medium",
            approach: "Model courses as directed graph. Run DFS. Track visited nodes and nodes in the current path. Path overlap means cycle exists."
          },
          {
            title: "Course Schedule II",
            url: "https://leetcode.com/problems/course-schedule-ii/description/",
            difficulty: "Medium",
            approach: "Run DFS cycle detection. If no cycles, add nodes to output in reverse topological order (post-order)."
          },
          {
            title: "Redundant Connection",
            url: "https://leetcode.com/problems/redundant-connection/description/",
            difficulty: "Medium",
            approach: "For each edge, run DFS to see if vertices are already connected. If yes, this edge forms a cycle and is redundant."
          },
          {
            title: "All Ancestors of a Node in a Directed Acyclic Graph",
            url: "https://leetcode.com/problems/all-ancestors-of-a-node-in-a-directed-acyclic-graph/description/",
            difficulty: "Medium",
            approach: "Run DFS from each node backwards or build ancestors lists recursively using DFS traversal."
          }
        ]
      },
      {
        id: "gt-3",
        name: "Topological Sort",
        description: "Sort directed acyclic graphs linearly based on dependencies (Kahn's indegree queue or post-order DFS).",
        howToIdentify: "Ordering tasks, dependencies, prerequisites, or packages sequentially.",
        complexity: { time: "O(V + E)", space: "O(V)" },
        questions: [
          {
            title: "Course Schedule II",
            url: "https://leetcode.com/problems/course-schedule-ii/description/",
            difficulty: "Medium",
            approach: "Compute indegrees. Enqueue courses with 0 indegree. Dequeue, add to order, decrement neighbors. If indegrees become 0, enqueue."
          },
          {
            title: "Alien Dictionary",
            url: "https://leetcode.com/problems/alien-dictionary/description/",
            difficulty: "Hard",
            approach: "Build graph matching lexicographical characters. Perform Topological Sort to extract alien alphabet string."
          },
          {
            title: "Sequence Reconstruction",
            url: "https://leetcode.com/problems/sequence-reconstruction/description/",
            difficulty: "Medium",
            approach: "Build indegree graph. Run Kahn's BFS. Unique topological sorting requires the queue size to be exactly 1 at all times."
          },
          {
            title: "Sort Items by Groups Respecting Dependencies",
            url: "https://leetcode.com/problems/sort-items-by-groups-respecting-dependencies/description/",
            difficulty: "Hard",
            approach: "Sort groups topologically, then sort items inside groups topologically based on internal and external dependencies."
          }
        ]
      },
      {
        id: "gt-4",
        name: "Connected Components (DFS Grid search)",
        description: "Identify distinct connected node clusters. Mark nodes as visited during traversal to count islands or groupings.",
        howToIdentify: "Finding distinct connected components, flood fills, or islands on matrices.",
        complexity: { time: "O(M * N)", space: "O(M * N) call stack" },
        questions: [
          {
            title: "Number of Islands",
            url: "https://leetcode.com/problems/number-of-islands/description/",
            difficulty: "Medium",
            approach: "Scan grid. When '1' (land) is found, trigger DFS to visit and sink ('0') all connected land cells. Increment island count."
          },
          {
            title: "Max Area of Island",
            url: "https://leetcode.com/problems/max-area-of-island/description/",
            difficulty: "Medium",
            approach: "Trigger DFS on lands. Return area (1 + sum of neighbors DFS). Track and return the maximum area found."
          },
          {
            title: "Number of Closed Islands",
            url: "https://leetcode.com/problems/number-of-closed-islands/description/",
            difficulty: "Medium",
            approach: "Run DFS to flood/eliminate land touching matrix borders. Count remaining islands that do not connect to borders."
          },
          {
            title: "Surrounded Regions",
            url: "https://leetcode.com/problems/surrounded-regions/description/",
            difficulty: "Medium",
            approach: "Run DFS from boundary 'O' elements to mark protected lands. Flip unprotected 'O's to 'X's, restore boundary 'O's."
          }
        ]
      },
      {
        id: "gt-5",
        name: "Dijkstra's Algorithm",
        description: "Find shortest paths in weighted graphs using a Min-Heap/Priority Queue, updating distances sequentially.",
        howToIdentify: "Finding shortest path in weighted graphs with non-negative weights.",
        complexity: { time: "O(E log V)", space: "O(V)" },
        questions: [
          {
            title: "Network Delay Time",
            url: "https://leetcode.com/problems/network-delay-time/description/",
            difficulty: "Medium",
            approach: "Dijkstra's. Keep distance map initialized to infinity. Use Min-Heap: pop node, update neighbor distances, push neighbors to heap."
          },
          {
            title: "Path with Maximum Probability",
            url: "https://leetcode.com/problems/path-with-maximum-probability/description/",
            difficulty: "Medium",
            approach: "Use a Max-Heap Dijkstra's variation. Dequeue node with highest probability, multiplying values along neighbor paths."
          },
          {
            title: "Cheapest Flights Within K Stops",
            url: "https://leetcode.com/problems/cheapest-flights-within-k-stops/description/",
            difficulty: "Medium",
            approach: "Bellman-Ford or Dijkstra's. Heap stores [price, node, stops]. Reject node updates if stops exceed limit K."
          },
          {
            title: "Swim in Rising Water",
            url: "https://leetcode.com/problems/swim-in-rising-water/description/",
            difficulty: "Hard",
            approach: "Dijkstra's on grid coordinates. Heap keeps track of cell elevation bounds. Target is reached when path max height is minimized."
          }
        ]
      },
      {
        id: "gt-6",
        name: "Union-Find (Disjoint Set Union)",
        description: "Group nodes and verify partitions dynamically using Find (with path compression) and Union (by rank) helper utilities.",
        howToIdentify: "Detecting graph connectivity, merging sets, counting partitions, or checking cycle in undirected graphs.",
        complexity: { time: "O(1) amortized", space: "O(V)" },
        questions: [
          {
            title: "Number of Provinces",
            url: "https://leetcode.com/problems/number-of-provinces/description/",
            difficulty: "Medium",
            approach: "Initialize parent pointers. Loop relations, performing Union. Number of provinces is count of unique root parents."
          },
          {
            title: "Redundant Connection",
            url: "https://leetcode.com/problems/redundant-connection/description/",
            difficulty: "Medium",
            approach: "Union-Find. For each edge, call Union. If vertices already share the same parent, this edge creates a cycle and is redundant."
          },
          {
            title: "Most Stones Removed with Same Row or Column",
            url: "https://leetcode.com/problems/most-stones-removed-with-same-row-or-column/description/",
            difficulty: "Medium",
            approach: "Group stones sharing rows or columns using Union-Find. Total removals = total_stones - count_of_groups."
          },
          {
            title: "Smallest String With Swaps",
            url: "https://leetcode.com/problems/smallest-string-with-swaps/description/",
            difficulty: "Medium",
            approach: "Union index swap pairs. Group character indices by parent, sort characters within groups, and reconstruct the string."
          }
        ]
      },
      {
        id: "gt-7",
        name: "Minimum Spanning Tree",
        description: "Connect vertices in weighted graphs with minimal total edge weight using Kruskal's (Union-Find) or Prim's (Priority Queue).",
        howToIdentify: "Connecting all coordinates or nodes with minimal cost.",
        complexity: { time: "O(E log E)", space: "O(V)" },
        questions: [
          {
            title: "Min Cost to Connect All Points",
            url: "https://leetcode.com/problems/min-cost-to-connect-all-points/description/",
            difficulty: "Medium",
            approach: "Kruskal's. Compute Manhattan distances between points. Sort edges, apply Union-Find, skip connections sharing parents."
          },
          {
            title: "Find Critical and Pseudo-Critical Edges in MST",
            url: "https://leetcode.com/problems/find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree/description/",
            difficulty: "Hard",
            approach: "Construct standard MST score. Critical edges increase MST sum when blocked. Pseudo-critical edges can participate in an MST."
          },
          {
            title: "Optimize Water Distribution in a Village",
            url: "https://leetcode.com/problems/optimize-water-distribution-in-a-village/description/",
            difficulty: "Hard",
            approach: "Model wells as connections to a dummy node 0. Solve MST across villages and connections using Kruskal's."
          },
          {
            title: "Remove Max Number of Edges to Keep Graph Fully Traversable",
            url: "https://leetcode.com/problems/remove-max-number-of-edges-to-keep-graph-fully-traversable/description/",
            difficulty: "Hard",
            approach: "Apply Union-Find. Prioritize type 3 edges (shared). Build separate MSTs for Alice and Bob, discarding redundant edges."
          }
        ]
      },
      {
        id: "gt-8",
        name: "Bipartite Graph Check",
        description: "Verify if vertices can be split into two independent sets (colored red/blue) such that no edge links matching colors.",
        howToIdentify: "Splitting elements into two groups without conflict edges.",
        complexity: { time: "O(V + E)", space: "O(V)" },
        questions: [
          {
            title: "Is Graph Bipartite?",
            url: "https://leetcode.com/problems/is-graph-bipartite/description/",
            difficulty: "Medium",
            approach: "Use BFS/DFS. Traverse nodes and color them. If neighbor is uncolored, color with opposite color. If colored and same color, return false."
          },
          {
            title: "Possible Bipartition",
            url: "https://leetcode.com/problems/possible-bipartition/description/",
            difficulty: "Medium",
            approach: "Model conflicts as undirected edges. Run Bipartite graph coloring to check if conflict separations are valid."
          },
          {
            title: "Divide Nodes Into the Maximum Number of Groups",
            url: "https://leetcode.com/problems/divide-nodes-into-the-maximum-number-of-groups/description/",
            difficulty: "Hard",
            approach: "Verify graph is bipartite. Run BFS from each node to calculate maximum layers/groups, then sum groups per component."
          },
          {
            title: "Check If Array Pairs Are Divisible by k",
            url: "https://leetcode.com/problems/check-if-array-pairs-are-divisible-by-k/description/",
            difficulty: "Medium",
            approach: "Pair remainders mod K. Check if remainder frequencies match, matching rem and K - rem count limits."
          }
        ]
      },
      {
        id: "gt-9",
        name: "Flood Fill",
        description: "Modify value blocks recursively in a grid, starting at a seed coordinate (BFS/DFS recursion).",
        howToIdentify: "Coloring, updating, or traversing contiguous cells matching initial conditions.",
        complexity: { time: "O(M * N)", space: "O(M * N)" },
        questions: [
          {
            title: "Flood Fill",
            url: "https://leetcode.com/problems/flood-fill/description/",
            difficulty: "Easy",
            approach: "Start at source coordinate. If current color differs from target color, recursively flood neighbors matching current color."
          },
          {
            title: "Island Perimeter",
            url: "https://leetcode.com/problems/island-perimeter/description/",
            difficulty: "Easy",
            approach: "Scan grid. When land is found, add 4 to perimeter. Subtract 2 for each adjacent land neighbor (avoid double counting)."
          },
          {
            title: "Coloring A Border",
            url: "https://leetcode.com/problems/coloring-a-border/description/",
            difficulty: "Medium",
            approach: "Use DFS/BFS to identify connected components. Color component cells that touch borders or different colors."
          },
          {
            title: "Minesweeper",
            url: "https://leetcode.com/problems/minesweeper/description/",
            difficulty: "Medium",
            approach: "BFS/DFS. If cell touches mines, change to digit. If no mines touch, reveal 'B' and recursively reveal adjacent squares."
          }
        ]
      },
      {
        id: "gt-10",
        name: "Bi-directional BFS",
        description: "Run BFS from both source and target simultaneously. Meeting in the middle reduces the search tree size.",
        howToIdentify: "Finding shortest distance between two defined states where the search space is large.",
        complexity: { time: "O(b^(d/2)) where b is branching factor", space: "O(b^(d/2))" },
        questions: [
          {
            title: "Word Ladder",
            url: "https://leetcode.com/problems/word-ladder/description/",
            difficulty: "Hard",
            approach: "Maintain source set and target set. Expand the smaller set at each step. Meeting point identifies shortest path."
          },
          {
            title: "Word Ladder II",
            url: "https://leetcode.com/problems/word-ladder-ii/description/",
            difficulty: "Hard",
            approach: "Run bi-directional BFS to identify shortest path transitions. Backtrack to rebuild all paths."
          },
          {
            title: "Open the Lock",
            url: "https://leetcode.com/problems/open-the-lock/description/",
            difficulty: "Medium",
            approach: "Use bi-directional BFS to search combinations from both initial '0000' and target lock values."
          },
          {
            title: "Minimum Genetic Mutation",
            url: "https://leetcode.com/problems/minimum-genetic-mutation/description/",
            difficulty: "Medium",
            approach: "Find minimum mutations from start to end gene using bi-directional BFS."
          }
        ]
      },
      {
        id: "gt-11",
        name: "Multi-source BFS",
        description: "Initialize a BFS queue with multiple source nodes to simulate parallel waves of exploration.",
        howToIdentify: "Finding distance to the nearest cell of a certain type, or simulating parallel spreading processes.",
        complexity: { time: "O(M * N)", space: "O(M * N)" },
        questions: [
          {
            title: "01 Matrix",
            url: "https://leetcode.com/problems/01-matrix/description/",
            difficulty: "Medium",
            approach: "Put all 0s in the queue. Distances are 0. Initialize 1s to infinity. Run BFS, updating cell distances on neighbor steps."
          },
          {
            title: "Rotting Oranges",
            url: "https://leetcode.com/problems/rotting-oranges/description/",
            difficulty: "Medium",
            approach: "Enque all rotten oranges. Spreads rot level-by-level, incrementing minutes. Check if any fresh oranges remain."
          },
          {
            title: "Walls and Gates",
            url: "https://leetcode.com/problems/walls-and-gates/description/",
            difficulty: "Medium",
            approach: "Enqueue all gates (0). Run BFS, updating rooms coordinates to record steps from nearest gate."
          },
          {
            title: "Shortest Distance from All Buildings",
            url: "https://leetcode.com/problems/shortest-distance-from-all-buildings/description/",
            difficulty: "Hard",
            approach: "Perform BFS from each building on empty cells. Accumulate step distances, finding cell with smallest sum."
          }
        ]
      }
    ]
  },
  {
    id: "greedy",
    index: "X",
    name: "Greedy Patterns",
    patternCount: 7,
    patterns: [
      {
        id: "gr-1",
        name: "Interval Scheduling",
        description: "Sort intervals (usually by end time) and greedily select non-overlapping intervals.",
        howToIdentify: "Dealing with scheduling meetings, overlapping regions, or merge constraints.",
        complexity: { time: "O(N log N)", space: "O(N) or O(1)" },
        questions: [
          {
            title: "Merge Intervals",
            url: "https://leetcode.com/problems/merge-intervals/description/",
            difficulty: "Medium",
            approach: "Sort intervals by start time. Iterate and merge overlapping intervals with previous: prev.end = max(prev.end, curr.end)."
          },
          {
            title: "Non-overlapping Intervals",
            url: "https://leetcode.com/problems/non-overlapping-intervals/description/",
            difficulty: "Medium",
            approach: "Sort by end time. Greedily keep intervals that end first. Count the number of intervals to delete."
          },
          {
            title: "Insert Interval",
            url: "https://leetcode.com/problems/insert-interval/description/",
            difficulty: "Medium",
            approach: "Add intervals ending before newInterval starts. Merge overlapping intervals. Add remaining intervals."
          },
          {
            title: "Minimum Number of Arrows to Burst Balloons",
            url: "https://leetcode.com/problems/minimum-number-of-arrows-to-burst-balloons/description/",
            difficulty: "Medium",
            approach: "Sort by end time. Keep track of current arrow position at current end. Increment arrows if next start exceeds arrow pos."
          }
        ]
      },
      {
        id: "gr-2",
        name: "Fractional Knapsack / Greedy Ratio",
        description: "Select items by value-to-weight ratio to maximize total profit when items can be split.",
        howToIdentify: "Deciding allocations where partial items can be picked based on weight/ratios.",
        complexity: { time: "O(N log N)", space: "O(1)" },
        questions: [
          {
            title: "Maximum Units on a Truck",
            url: "https://leetcode.com/problems/maximum-units-on-a-truck/description/",
            difficulty: "Easy",
            approach: "Sort boxes by units per box in descending order. Take as many boxes as possible until truck size is filled."
          },
          {
            title: "Reduce Array Size to The Half",
            url: "https://leetcode.com/problems/reduce-array-size-to-the-half/description/",
            difficulty: "Medium",
            approach: "Count frequency of integers. Sort frequencies descending. Pick highest frequencies until removed size is >= half."
          },
          {
            title: "Fractional Knapsack",
            url: "https://leetcode.com/problems/fractional-knapsack/description/",
            difficulty: "Medium",
            approach: "Sort by value/weight ratio descending. Fill capacity, taking fractional amounts of final overflow items."
          },
          {
            title: "Earliest Possible Day of Full Bloom",
            url: "https://leetcode.com/problems/earliest-possible-day-of-full-bloom/description/",
            difficulty: "Hard",
            approach: "Sort seeds by grow time descending. Plant seeds with longer growth times first to overlap bloom periods."
          }
        ]
      },
      {
        id: "gr-3",
        name: "Gas Station / Circular Route",
        description: "Track cumulative gains to find a starting point that guarantees a successful loop without falling below 0.",
        howToIdentify: "Evaluating circular navigation routes where costs and resources accumulate.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Gas Station",
            url: "https://leetcode.com/problems/gas-station/description/",
            difficulty: "Medium",
            approach: "If total gas < total cost, return -1. Otherwise, reset start index to i+1 whenever running gas tank drops below 0."
          },
          {
            title: "Queue Reconstruction by Height",
            url: "https://leetcode.com/problems/queue-reconstruction-by-height/description/",
            difficulty: "Medium",
            approach: "Sort people by height descending, then by K index ascending. Insert each person into a list at index K."
          },
          {
            title: "Best Time to Buy and Sell Stock II",
            url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-ii/description/",
            difficulty: "Medium",
            approach: "Accumulate profits from all positive price differences from consecutive days: price[i] - price[i-1]."
          },
          {
            title: "Candy",
            url: "https://leetcode.com/problems/candy/description/",
            difficulty: "Hard",
            approach: "Sweep left-to-right (ensure rising neighbors get more). Sweep right-to-left (ensure rising neighbors get max of left/right)."
          }
        ]
      },
      {
        id: "gr-4",
        name: "Greedy Priority",
        description: "Make local decisions using sorted queues, prioritizing items dynamically to achieve an optimal global solution.",
        howToIdentify: "Problems requiring picking maximums or minimums from a dynamic set of elements.",
        complexity: { time: "O(N log N)", space: "O(N)" },
        questions: [
          {
            title: "Task Scheduler",
            url: "https://leetcode.com/problems/task-scheduler/description/",
            difficulty: "Medium",
            approach: "Calculate idle slots based on the highest frequency task: (max_freq - 1) * N. Fill remaining slots. Output length + idles."
          },
          {
            title: "IPO",
            url: "https://leetcode.com/problems/ipo/description/",
            difficulty: "Hard",
            approach: "Use Max-Heap of profits and Min-Heap of capital requirements to select optimal projects greedily."
          },
          {
            title: "Construct String With Repeat Limit",
            url: "https://leetcode.com/problems/construct-string-with-repeat-limit/description/",
            difficulty: "Medium",
            approach: "Greedily append largest characters. When limit is hit, insert one second-largest character, then resume appending."
          },
          {
            title: "Rearrange String k Distance Apart",
            url: "https://leetcode.com/problems/rearrange-string-k-distance-apart/description/",
            difficulty: "Hard",
            approach: "Use Max-Heap. Append character with highest frequency, then store it in a cool-down queue until it is K characters away."
          }
        ]
      },
      {
        id: "gr-5",
        name: "Partition Labels",
        description: "Partition structures into segments where each value belongs to only one partition by tracking their last occurrence indices.",
        howToIdentify: "Dividing arrays/strings into disjoint subsets matching containment constraints.",
        complexity: { time: "O(N)", space: "O(1) alphabet map" },
        questions: [
          {
            title: "Partition Labels",
            url: "https://leetcode.com/problems/partition-labels/description/",
            difficulty: "Medium",
            approach: "Record the last occurrence of each character. Iterate through the string, updating the partition boundary to the maximum last occurrence of characters seen. Split when current index reaches boundary."
          },
          {
            title: "Split a String in Balanced Strings",
            url: "https://leetcode.com/problems/split-a-string-in-balanced-strings/description/",
            difficulty: "Easy",
            approach: "Track counts: +1 for 'L', -1 for 'R'. Increment balanced string count when running total equals 0."
          },
          {
            title: "Optimal Division",
            url: "https://leetcode.com/problems/optimal-division/description/",
            difficulty: "Medium",
            approach: "Math/Greedy. Placing parentheses around all elements after the second element maximizes division value: a / (b / c / d)."
          },
          {
            title: "Partition Array into Three Parts with Equal Sum",
            url: "https://leetcode.com/problems/partition-array-into-three-parts-with-equal-sum/description/",
            difficulty: "Easy",
            approach: "If total sum % 3 != 0, return false. Find 3 contiguous segments that each sum to total_sum / 3."
          }
        ]
      },
      {
        id: "gr-6",
        name: "Refueling / Leap Strategy",
        description: "Compute boundaries recursively using greedy choices to find the minimum steps or fuel stops needed to reach a target.",
        howToIdentify: "Jump games, minimizing refueling steps, or finding minimal jumps to reach end coordinates.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Jump Game II",
            url: "https://leetcode.com/problems/jump-game-ii/description/",
            difficulty: "Medium",
            approach: "Maintain current window limit and max reachable index. When index reaches window limit, increment jumps and update limit to max reachable index."
          },
          {
            title: "Jump Game",
            url: "https://leetcode.com/problems/jump-game/description/",
            difficulty: "Medium",
            approach: "Track max index reachable from current index. Return false if index exceeds max reachable, true if max >= end."
          },
          {
            title: "Minimum Number of Refueling Stops",
            url: "https://leetcode.com/problems/minimum-number-of-refueling-stops/description/",
            difficulty: "Hard",
            approach: "Put fuel capacities of stations passed in a Max-Heap. When out of fuel, pop from heap to refuel until you can reach the next station."
          },
          {
            title: "Wiggle Subsequence",
            url: "https://leetcode.com/problems/wiggle-subsequence/description/",
            difficulty: "Medium",
            approach: "Count alternations. Update directions when diff changes sign (positive to negative or vice versa)."
          }
        ]
      },
      {
        id: "gr-7",
        name: "Job / Task Selection",
        description: "Schedule tasks with deadlines to maximize profits using greedy scheduling algorithms.",
        howToIdentify: "Completing tasks with constraints, timelines, and rewards.",
        complexity: { time: "O(N log N)", space: "O(N)" },
        questions: [
          {
            title: "Course Schedule III",
            url: "https://leetcode.com/problems/course-schedule-iii/description/",
            difficulty: "Hard",
            approach: "Sort courses by deadline. Push duration to Max-Heap. If total time exceeds deadline, pop longest course."
          },
          {
            title: "Task Scheduler",
            url: "https://leetcode.com/problems/task-scheduler/description/",
            difficulty: "Medium",
            approach: "Re-calculate schedules based on task count limits."
          },
          {
            title: "Job Sequencing Problem",
            url: "https://leetcode.com/problems/job-sequencing-problem/description/",
            difficulty: "Medium",
            approach: "Sort jobs by profit descending. Try to schedule each job on its deadline day or the latest available day before it."
          },
          {
            title: "Maximum Profit in Job Scheduling",
            url: "https://leetcode.com/problems/maximum-profit-in-job-scheduling/description/",
            difficulty: "Hard",
            approach: "Sort jobs by end time. Run DP with Binary Search (to find latest non-overlapping job) in O(N log N) time."
          }
        ]
      }
    ]
  },
  {
    id: "backtracking",
    index: "XI",
    name: "Backtracking Patterns",
    patternCount: 7,
    patterns: [
      {
        id: "bt-1",
        name: "Subsets Generation (Power Set)",
        description: "Generate the power set of a collection by recursively deciding to include or exclude each element.",
        howToIdentify: "Generating combinations, powersets, or subsets.",
        complexity: { time: "O(2^N)", space: "O(N) recursion" },
        questions: [
          {
            title: "Subsets",
            url: "https://leetcode.com/problems/subsets/description/",
            difficulty: "Medium",
            approach: "Backtrack. At each step, add current path to results. Loop through remaining elements, push index element, recurse, pop element."
          },
          {
            title: "Subsets II",
            url: "https://leetcode.com/problems/subsets-ii/description/",
            difficulty: "Medium",
            approach: "Sort input. Skip duplicate elements at the same recursion level to avoid duplicate subsets."
          },
          {
            title: "Letter Case Permutation",
            url: "https://leetcode.com/problems/letter-case-permutation/description/",
            difficulty: "Medium",
            approach: "Recursively process characters. If letter, branches by keeping lowercase and swapping to uppercase."
          },
          {
            title: "Generalized Abbreviation",
            url: "https://leetcode.com/problems/generalized-abbreviation/description/",
            difficulty: "Medium",
            approach: "Decide whether to abbreviate character (accumulating number) or keep character (write number and char)."
          }
        ]
      },
      {
        id: "bt-2",
        name: "Permutations Generation",
        description: "Generate all permutations of a set by swapping elements or using visited checks to explore orderings.",
        howToIdentify: "Generating all possible arrangements or order permutations.",
        complexity: { time: "O(N * N!)", space: "O(N)" },
        questions: [
          {
            title: "Permutations",
            url: "https://leetcode.com/problems/permutations/description/",
            difficulty: "Medium",
            approach: "Backtrack. Use a boolean visited array. Push unvisited elements, recurse, pop, and restore unvisited status."
          },
          {
            title: "Permutations II",
            url: "https://leetcode.com/problems/permutations-ii/description/",
            difficulty: "Medium",
            approach: "Sort input. Use visited check. Skip duplicates by ensuring duplicate elements are only visited in a fixed order."
          },
          {
            title: "Letter Combinations of a Phone Number",
            url: "https://leetcode.com/problems/letter-combinations-of-a-phone-number/description/",
            difficulty: "Medium",
            approach: "Map digits to letters. Backtrack, appending characters associated with the current digit, and popping after recursion."
          },
          {
            title: "Palindrome Permutation II",
            url: "https://leetcode.com/problems/palindrome-permutation-ii/description/",
            difficulty: "Medium",
            approach: "Check if palindrome is possible. Generate half-string permutations and concatenate with middle character."
          }
        ]
      },
      {
        id: "bt-3",
        name: "Combinations / Target Sum",
        description: "Explore recursive branches to find combinations of numbers that sum to a target.",
        howToIdentify: "Finding combinations of elements that sum to target, with or without item reuse.",
        complexity: { time: "O(2^Target or N^K)", space: "O(K)" },
        questions: [
          {
            title: "Combination Sum",
            url: "https://leetcode.com/problems/combination-sum/description/",
            difficulty: "Medium",
            approach: "Backtrack. Pass index. At each step, subtract candidate from target. If target is 0, record path. Recurse, reuse current index."
          },
          {
            title: "Combination Sum II",
            url: "https://leetcode.com/problems/combination-sum-ii/description/",
            difficulty: "Medium",
            approach: "Sort input. Prevent duplicates by skipping duplicate values at the same recursion depth. Increment index on recurse."
          },
          {
            title: "Combination Sum III",
            url: "https://leetcode.com/problems/combination-sum-iii/description/",
            difficulty: "Medium",
            approach: "Find combinations of K numbers from 1 to 9 summing to target, restricting recursion depth to K."
          },
          {
            title: "Combinations",
            url: "https://leetcode.com/problems/combinations/description/",
            difficulty: "Medium",
            approach: "Standard combinations generator selecting K numbers from 1 to N."
          }
        ]
      },
      {
        id: "bt-4",
        name: "Board Placement Validation",
        description: "Backtrack solutions on grid coordinates, verifying placement constraints at each coordinate step.",
        howToIdentify: "Grid board puzzle solver with row, column, or diagonal collision constraints.",
        complexity: { time: "O(N!)", space: "O(N)" },
        questions: [
          {
            title: "N-Queens",
            url: "https://leetcode.com/problems/n-queens/description/",
            difficulty: "Hard",
            approach: "Backtrack row-by-row. Maintain sets for cols, positive diagonals (r + c), and negative diagonals (r - c) to prune invalid branches."
          },
          {
            title: "N-Queens II",
            url: "https://leetcode.com/problems/n-queens-ii/description/",
            difficulty: "Hard",
            approach: "Same backtrack logic as N-Queens, but return the total count of valid board configurations."
          },
          {
            title: "Sudoku Solver",
            url: "https://leetcode.com/problems/sudoku-solver/description/",
            difficulty: "Hard",
            approach: "Backtrack cell-by-cell. Try digits 1-9. Validate row, col, and 3x3 box constraints before recursing."
          },
          {
            title: "Unique Paths III",
            url: "https://leetcode.com/problems/unique-paths-iii/description/",
            difficulty: "Hard",
            approach: "DFS backtracking. Traverse every empty square exactly once, backtracking when hit obstacle or target."
          }
        ]
      },
      {
        id: "bt-5",
        name: "Word Search Grid DFS",
        description: "Search for a word in a grid by starting at matching letters and recursively exploring adjacent cells (up, down, left, right).",
        howToIdentify: "Finding path patterns on 2D character arrays.",
        complexity: { time: "O(M * N * 4^L)", space: "O(L) recursion" },
        questions: [
          {
            title: "Word Search",
            url: "https://leetcode.com/problems/word-search/description/",
            difficulty: "Medium",
            approach: "DFS from matching start cells. Temporarily mark cell as visited (e.g. '#'), recurse in 4 directions, then restore character."
          },
          {
            title: "Word Search II",
            url: "https://leetcode.com/problems/word-search-ii/description/",
            difficulty: "Hard",
            approach: "Build a Trie of dictionary words. DFS the grid, backtracking along matching Trie path branches to search words in parallel."
          },
          {
            title: "Word Boggle",
            url: "https://leetcode.com/problems/word-search/description/",
            difficulty: "Medium",
            approach: "Use Trie-based DFS search on character boards."
          },
          {
            title: "Path with Maximum Gold",
            url: "https://leetcode.com/problems/path-with-maximum-gold/description/",
            difficulty: "Medium",
            approach: "DFS from each non-zero cell. Collect gold, mark cell as 0, recurse, backtrack to restore cell gold value."
          }
        ]
      },
      {
        id: "bt-6",
        name: "Sudoku Solver",
        description: "Fill cell coordinate slots recursively by validating constraints on row, column, and subgrid boundaries.",
        howToIdentify: "Validating cell candidates against board constraints.",
        complexity: { time: "O(9^81)", space: "O(81)" },
        questions: [
          {
            title: "Sudoku Solver",
            url: "https://leetcode.com/problems/sudoku-solver/description/",
            difficulty: "Hard",
            approach: "Verify and place numbers on empty cells, backtracking if conflicts arise later in the grid."
          },
          {
            title: "Valid Sudoku",
            url: "https://leetcode.com/problems/valid-sudoku/description/",
            difficulty: "Medium",
            approach: "Can also be done iteratively without backtracking by verifying constraints on initial boards."
          },
          {
            title: "Solve the Maze",
            url: "https://leetcode.com/problems/sudoku-solver/description/",
            difficulty: "Medium",
            approach: "Run DFS path finding backtracking, marking visited nodes in-place."
          },
          {
            title: "Rat in a Maze",
            url: "https://leetcode.com/problems/sudoku-solver/description/",
            difficulty: "Medium",
            approach: "Backtrack grid routes, recording directional steps ('D', 'L', 'R', 'U') leading to exit."
          }
        ]
      },
      {
        id: "bt-7",
        name: "Partition / Split Matching",
        description: "Partition sequences recursively, checking matching rules at each partition boundary.",
        howToIdentify: "Splitting strings or sequences into balanced blocks that satisfy a condition.",
        complexity: { time: "O(N * 2^N)", space: "O(N)" },
        questions: [
          {
            title: "Palindrome Partitioning",
            url: "https://leetcode.com/problems/palindrome-partitioning/description/",
            difficulty: "Medium",
            approach: "Backtrack. If substring(start, i) is a palindrome, add it to path, recurse from i+1, pop on return."
          },
          {
            title: "Restore IP Addresses",
            url: "https://leetcode.com/problems/restore-ip-addresses/description/",
            difficulty: "Medium",
            approach: "Split string into 4 segments. Verify each segment is between 0 and 255 with no leading zeros. Backtrack if invalid."
          },
          {
            title: "Split Array into Fibonacci Sequence",
            url: "https://leetcode.com/problems/split-array-into-fibonacci-sequence/description/",
            difficulty: "Medium",
            approach: "Backtrack partitioning numbers. Ensure segment sums match Fibonacci relations: A[i] = A[i-1] + A[i-2]."
          },
          {
            title: "Matchsticks to Square",
            url: "https://leetcode.com/problems/matchsticks-to-square/description/",
            difficulty: "Medium",
            approach: "Sum matches, divide by 4 (side length). Sort descending, backtrack trying to place each match in one of 4 side slots."
          }
        ]
      }
    ]
  },
  {
    id: "dp",
    index: "XII",
    name: "Dynamic Programming (DP) Patterns",
    patternCount: 12,
    patterns: [
      {
        id: "dp-1",
        name: "0/1 Knapsack",
        description: "Make a binary choice (take or leave) for each item to maximize value without exceeding capacity constraints.",
        howToIdentify: "Items have weight/values. Can either take once or leave. Maximize value under capacity constraint.",
        complexity: { time: "O(N * W)", space: "O(W) optimized" },
        questions: [
          {
            title: "Partition Equal Subset Sum",
            url: "https://leetcode.com/problems/partition-equal-subset-sum/description/",
            difficulty: "Medium",
            approach: "Check if subset sum equals total_sum / 2. DP state: dp[j] is true if sum j is reachable. Update from right to left to avoid duplicate counts."
          },
          {
            title: "Target Sum",
            url: "https://leetcode.com/problems/target-sum/description/",
            difficulty: "Medium",
            approach: "Assign signs (+/-) to elements to sum to target. Equivalent to finding a subset summing to (target + total) / 2."
          },
          {
            title: "Ones and Zeroes",
            url: "https://leetcode.com/problems/ones-and-zeroes/description/",
            difficulty: "Medium",
            approach: "2D knapsack DP: maximize strings taken under count limits M (zeros) and N (ones)."
          },
          {
            title: "Last Stone Weight II",
            url: "https://leetcode.com/problems/last-stone-weight-ii/description/",
            difficulty: "Medium",
            approach: "Divide stones into two groups such that their sum difference is minimized. Solve as 0/1 knapsack targeting sum / 2."
          }
        ]
      },
      {
        id: "dp-2",
        name: "Unbounded Knapsack",
        description: "Select items under a weight limit, with items available in infinite quantities.",
        howToIdentify: "Making decisions with infinite item reuse under constraints.",
        complexity: { time: "O(N * W)", space: "O(W)" },
        questions: [
          {
            title: "Coin Change",
            url: "https://leetcode.com/problems/coin-change/description/",
            difficulty: "Medium",
            approach: "Initialize dp array to infinity. dp[0] = 0. Loop through coins. For each, update dp[i] = min(dp[i], 1 + dp[i-coin])."
          },
          {
            title: "Coin Change II",
            url: "https://leetcode.com/problems/coin-change-ii/description/",
            difficulty: "Medium",
            approach: "Calculate combinations count: dp[i] += dp[i-coin]. Outer loop: coins, Inner loop: amount. Prevents duplicate combinations."
          },
          {
            title: "Combination Sum IV",
            url: "https://leetcode.com/problems/combination-sum-iv/description/",
            difficulty: "Medium",
            approach: "Calculates permutations count: dp[i] += dp[i-num]. Outer loop: amount, Inner loop: nums. Considers order."
          },
          {
            title: "Perfect Squares",
            url: "https://leetcode.com/problems/perfect-squares/description/",
            difficulty: "Medium",
            approach: "Find minimum squares summing to N. dp[i] = min(dp[i], 1 + dp[i - j*j]) for all perfect squares j*j <= i."
          }
        ]
      },
      {
        id: "dp-3",
        name: "Fibonacci Numbers",
        description: "Compute states where the current value is a linear combination of previous states (e.g. dp[i] = dp[i-1] + dp[i-2]).",
        howToIdentify: "Finding counts of sequences, climbing stairs, or grid jumps with linear recurrences.",
        complexity: { time: "O(N)", space: "O(1) space optimized" },
        questions: [
          {
            title: "Climbing Stairs",
            url: "https://leetcode.com/problems/climbing-stairs/description/",
            difficulty: "Easy",
            approach: "Ways to reach step I is ways[i-1] + ways[i-2]. Equivalent to Fibonacci. Keep two variables to achieve O(1) space."
          },
          {
            title: "Fibonacci Number",
            url: "https://leetcode.com/problems/fibonacci-number/description/",
            difficulty: "Easy",
            approach: "Standard recurrence relation computed in O(N) time and O(1) space."
          },
          {
            title: "Min Cost Climbing Stairs",
            url: "https://leetcode.com/problems/min-cost-climbing-stairs/description/",
            difficulty: "Easy",
            approach: "Cost to reach step i is cost[i] + min(dp[i-1], dp[i-2]). Maintain last two steps in-place."
          },
          {
            title: "House Robber",
            url: "https://leetcode.com/problems/house-robber/description/",
            difficulty: "Medium",
            approach: "Maximize profit: rob[i] = max(rob[i-1], val[i] + rob[i-2]). Keep last two variables to optimize space."
          }
        ]
      },
      {
        id: "dp-4",
        name: "Longest Common Subsequence (LCS)",
        description: "Compare two sequences using a 2D matrix. Match characters to add to score, or take maximum from subproblems.",
        howToIdentify: "Comparing strings, finding similarities, edits, deletions, or insertions.",
        complexity: { time: "O(M * N)", space: "O(N) optimized" },
        questions: [
          {
            title: "Longest Common Subsequence",
            url: "https://leetcode.com/problems/longest-common-subsequence/description/",
            difficulty: "Medium",
            approach: "If text1[i] == text2[j], dp[i][j] = 1 + dp[i-1][j-1]. Else, dp[i][j] = max(dp[i-1][j], dp[i][j-1])."
          },
          {
            title: "Edit Distance",
            url: "https://leetcode.com/problems/edit-distance/description/",
            difficulty: "Medium",
            approach: "If char match, no cost. Else, edit is 1 + min(insert dp[i][j-1], delete dp[i-1][j], replace dp[i-1][j-1])."
          },
          {
            title: "Longest Palindromic Subsequence",
            url: "https://leetcode.com/problems/longest-palindromic-subsequence/description/",
            difficulty: "Medium",
            approach: "Find the Longest Common Subsequence between the original string and its reversed version."
          },
          {
            title: "Delete Operation for Two Strings",
            url: "https://leetcode.com/problems/delete-operation-for-two-strings/description/",
            difficulty: "Medium",
            approach: "Minimum deletions needed = text1.length + text2.length - 2 * LCS(text1, text2)."
          }
        ]
      },
      {
        id: "dp-5",
        name: "Longest Increasing Subsequence (LIS)",
        description: "Find the longest strictly increasing subsequence in an array using nested loops or Binary Search (patience sorting).",
        howToIdentify: "Finding longest subset that maintains sorted order coordinates.",
        complexity: { time: "O(N log N) using binary search", space: "O(N)" },
        questions: [
          {
            title: "Longest Increasing Subsequence",
            url: "https://leetcode.com/problems/longest-increasing-subsequence/description/",
            difficulty: "Medium",
            approach: "Maintain a sorted sublist. For each element, insert it at its correct sorted position using binary search, replacing elements if needed. The sublist size is the LIS length."
          },
          {
            title: "Russian Doll Envelopes",
            url: "https://leetcode.com/problems/russian-doll-envelopes/description/",
            difficulty: "Hard",
            approach: "Sort envelopes by width ascending, then height descending. Find the LIS length on the sorted heights using binary search."
          },
          {
            title: "Largest Divisible Subset",
            url: "https://leetcode.com/problems/largest-divisible-subset/description/",
            difficulty: "Medium",
            approach: "Sort array. dp[i] stores largest divisible subset size ending at i. Track parent indices to reconstruct subset."
          },
          {
            title: "Maximum Length of Pair Chain",
            url: "https://leetcode.com/problems/maximum-length-of-pair-chain/description/",
            difficulty: "Medium",
            approach: "Sort intervals by end time. Solve greedily in O(N log N) time, or use LIS DP."
          }
        ]
      },
      {
        id: "dp-6",
        name: "Palindromic DP",
        description: "Identify palindromic substrings using 2D DP matrices where dp[i][j] checks palindrome status from index i to j.",
        howToIdentify: "Substrings requiring palindrome validations, cuts, or counting.",
        complexity: { time: "O(N^2)", space: "O(N^2) or O(N)" },
        questions: [
          {
            title: "Longest Palindromic Substring",
            url: "https://leetcode.com/problems/longest-palindromic-substring/description/",
            difficulty: "Medium",
            approach: "Check bounds. dp[i][j] is true if s[i] == s[j] and dp[i+1][j-1] is true. Track longest range."
          },
          {
            title: "Palindromic Substrings",
            url: "https://leetcode.com/problems/palindromic-substrings/description/",
            difficulty: "Medium",
            approach: "Count total cells set to true in the palindromic DP matrix."
          },
          {
            title: "Palindrome Partitioning II",
            url: "https://leetcode.com/problems/palindrome-partitioning-ii/description/",
            difficulty: "Hard",
            approach: "Compute palindrome matrix. dp[i] stores min cuts for suffix s[i:]. dp[i] = min(dp[i], 1 + dp[j+1]) if s[i..j] is palindrome."
          },
          {
            title: "Longest Palindromic Subsequence",
            url: "https://leetcode.com/problems/longest-palindromic-subsequence/description/",
            difficulty: "Medium",
            approach: "Solve using interval DP: dp[i][j] is length in interval [i, j]. If s[i] == s[j], add 2. Else, take max of subranges."
          }
        ]
      },
      {
        id: "dp-7",
        name: "Interval / MCM DP",
        description: "Solve problems by merging sub-intervals, computing optimal partitions for range dp[i][j].",
        howToIdentify: "Cost of merging adjacent elements or partition values in dynamic subranges.",
        complexity: { time: "O(N^3)", space: "O(N^2)" },
        questions: [
          {
            title: "Burst Balloons",
            url: "https://leetcode.com/problems/burst-balloons/description/",
            difficulty: "Hard",
            approach: "Interval DP. dp[i][j] is max coins gained in range [i, j]. Choose last balloon K to burst: nums[i-1]*nums[k]*nums[j+1] + dp[i][k-1] + dp[k+1][j]."
          },
          {
            title: "Minimum Cost Tree From Leaf Values",
            url: "https://leetcode.com/problems/minimum-cost-tree-from-leaf-values/description/",
            difficulty: "Medium",
            approach: "Find partition points to split range [i, j] into left and right subtrees. Can also be solved using Monotonic Stack in O(N) time."
          },
          {
            title: "Unique Binary Search Trees II",
            url: "https://leetcode.com/problems/unique-binary-search-trees-ii/description/",
            difficulty: "Medium",
            approach: "Recursively build BST trees for numbers in range [i, j], merging left and right tree variations."
          },
          {
            title: "Predict the Winner",
            url: "https://leetcode.com/problems/predict-the-winner/description/",
            difficulty: "Medium",
            approach: "dp[i][j] stores the maximum score advantage of the active player in range [i, j]: max(nums[i] - dp[i+1][j], nums[j] - dp[i][j-1])."
          }
        ]
      },
      {
        id: "dp-8",
        name: "State Machine (Stocks & Transitions)",
        description: "Evaluate sequences by defining state transition variables (e.g., holding stock, sold stock, cooldown).",
        howToIdentify: "Sequences where actions (buy, sell, skip) depend on past days and active cooldown periods.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Best Time to Buy and Sell Stock with Cooldown",
            url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-cooldown/description/",
            difficulty: "Medium",
            approach: "Define states: buy[i] = max(buy[i-1], cooldown[i-1] - price). sell[i] = max(sell[i-1], buy[i-1] + price). cooldown[i] = sell[i-1]."
          },
          {
            title: "Best Time to Buy and Sell Stock with Transaction Fee",
            url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-with-transaction-fee/description/",
            difficulty: "Medium",
            approach: "Track two states: holding = max(holding, free - price). free = max(free, holding + price - fee)."
          },
          {
            title: "Best Time to Buy and Sell Stock III",
            url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iii/description/",
            difficulty: "Hard",
            approach: "Track 4 variables representing states after buy1, sell1, buy2, and sell2. Update values in a single pass."
          },
          {
            title: "Best Time to Buy and Sell Stock IV",
            url: "https://leetcode.com/problems/best-time-to-buy-and-sell-stock-iv/description/",
            difficulty: "Hard",
            approach: "Generalize stock III to support K transactions. Maintain buy and sell arrays of size K."
          }
        ]
      },
      {
        id: "dp-9",
        name: "Partition DP",
        description: "Partition arrays into contiguous blocks, finding the optimal sum of partition values.",
        howToIdentify: "Splitting arrays into subsets where segment costs are calculated dynamically.",
        complexity: { time: "O(N^2)", space: "O(N)" },
        questions: [
          {
            title: "Partition Array for Maximum Sum",
            url: "https://leetcode.com/problems/partition-array-for-maximum-sum/description/",
            difficulty: "Medium",
            approach: "dp[i] is max sum for prefix ending at i. Loop K steps backward: dp[i] = max(dp[i], dp[i-j] + max_val_in_window * j)."
          },
          {
            title: "Palindrome Partitioning II",
            url: "https://leetcode.com/problems/palindrome-partitioning-ii/description/",
            difficulty: "Hard",
            approach: "Partition string dynamically using precalculated palindromic intervals."
          },
          {
            title: "Decode Ways",
            url: "https://leetcode.com/problems/decode-ways/description/",
            difficulty: "Medium",
            approach: "dp[i] = dp[i-1] (if 1-digit code valid) + dp[i-2] (if 2-digit code valid)."
          },
          {
            title: "Word Break",
            url: "https://leetcode.com/problems/word-break/description/",
            difficulty: "Medium",
            approach: "dp[i] is true if prefix of length i can be segmented. Loop back: dp[i] is true if dp[j] is true and s[j..i] is in word dictionary."
          }
        ]
      },
      {
        id: "dp-10",
        name: "DP on Trees",
        description: "Apply dynamic programming recursively bottom-up on tree structures using DFS, returning states for parent nodes.",
        howToIdentify: "Calculating maximum independent sets, node colorings, or path gains on tree branches.",
        complexity: { time: "O(N)", space: "O(H)" },
        questions: [
          {
            title: "House Robber III",
            url: "https://leetcode.com/problems/house-robber-iii/description/",
            difficulty: "Medium",
            approach: "DFS returns [rob_node_val, skip_node_val]. For node: rob = node.val + left[1] + right[1]; skip = max(left) + max(right)."
          },
          {
            title: "Binary Tree Maximum Path Sum",
            url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/description/",
            difficulty: "Hard",
            approach: "Evaluate maximum child branch gains recursively, updating global path sums bottom-up."
          },
          {
            title: "Tree Diameter",
            url: "https://leetcode.com/problems/diameter-of-binary-tree/description/",
            difficulty: "Easy",
            approach: "Return depths to compute node diameters bottom-up."
          },
          {
            title: "Maximum Sum BST in Binary Tree",
            url: "https://leetcode.com/problems/maximum-sum-bst-in-binary-tree/description/",
            difficulty: "Hard",
            approach: "DFS returns [isValidBST, minVal, maxVal, sum]. Verify BST rules bottom-up, updating max sum."
          }
        ]
      },
      {
        id: "dp-11",
        name: "DP with Bitmask",
        description: "Represent subset states using bitmasks. Solve TSP or matching puzzles by transitioning bits.",
        howToIdentify: "Finding optimal pairings or orderings on small sets (N <= 20) where subsets can be represented as binary values.",
        complexity: { time: "O(2^N * N^2)", space: "O(2^N)" },
        questions: [
          {
            title: "Number of Ways to Wear 40 Hats to 40 People",
            url: "https://leetcode.com/problems/number-of-ways-to-wear-different-hats-to-each-other/description/",
            difficulty: "Hard",
            approach: "DP with bitmask: assign hats to people. State: dp[hat_id][mask] is the number of ways to assign hats to people represented by the mask."
          },
          {
            title: "Matchsticks to Square",
            url: "https://leetcode.com/problems/matchsticks-to-square/description/",
            difficulty: "Medium",
            approach: "Solve by partitioning matchsticks into 4 groups using bitmask DP."
          },
          {
            title: "Can I Win",
            url: "https://leetcode.com/problems/can-i-win/description/",
            difficulty: "Medium",
            approach: "Use minimax recursion with bitmask memoization. Mask represents selected integers."
          },
          {
            title: "Find Shortest Path Traversing All Nodes",
            url: "https://leetcode.com/problems/shortest-path-visiting-all-nodes/description/",
            difficulty: "Hard",
            approach: "Run BFS on state [node, visited_mask] to find the shortest path visiting all nodes."
          }
        ]
      },
      {
        id: "dp-12",
        name: "Multi-dimensional Grid DP",
        description: "Calculate paths or cost sums moving through multi-dimensional matrices using grid transitions.",
        howToIdentify: "Navigating grids with constraints, calculating minimum paths, or collecting items.",
        complexity: { time: "O(M * N)", space: "O(N) optimized" },
        questions: [
          {
            title: "Unique Paths",
            url: "https://leetcode.com/problems/unique-paths/description/",
            difficulty: "Medium",
            approach: "Ways to reach cell (i, j) is dp[i-1][j] + dp[i][j-1]. Reduce space to a 1D array of size N."
          },
          {
            title: "Minimum Path Sum",
            url: "https://leetcode.com/problems/minimum-path-sum/description/",
            difficulty: "Medium",
            approach: "Cost to reach cell (i, j) is grid[i][j] + min(dp[i-1][j], dp[i][j-1]). Solve in-place in the grid."
          },
          {
            title: "Triangle",
            url: "https://leetcode.com/problems/triangle/description/",
            difficulty: "Medium",
            approach: "Compute bottom-up: for each cell at level i, add the minimum of its two child nodes at level i+1."
          },
          {
            title: "Maximal Square",
            url: "https://leetcode.com/problems/maximal-square/description/",
            difficulty: "Medium",
            approach: "If matrix[i][j] == '1', dp[i][j] = 1 + min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]). Track maximum square size."
          }
        ]
      }
    ]
  },
  {
    id: "string-manipulation",
    index: "XIII",
    name: "String Manipulation Patterns",
    patternCount: 6,
    patterns: [
      {
        id: "sm-1",
        name: "String Hashing / Rolling Hash",
        description: "Match substrings in O(N) time using rolling hashes to evaluate patterns (e.g. Rabin-Karp).",
        howToIdentify: "Finding duplicate substrings or matching patterns in linear time.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Repeated DNA Sequences",
            url: "https://leetcode.com/problems/repeated-dna-sequences/description/",
            difficulty: "Medium",
            approach: "Slide window of length 10. Compute rolling hash or use a set of strings to find duplicates."
          },
          {
            title: "Longest Duplicate Substring",
            url: "https://leetcode.com/problems/longest-duplicate-substring/description/",
            difficulty: "Hard",
            approach: "Use Binary Search on answer length. For a mid length, check if duplicate exists using Rabin-Karp rolling hash."
          },
          {
            title: "Implement strStr()",
            url: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/description/",
            difficulty: "Easy",
            approach: "Match pattern using rolling hash (Rabin-Karp) or KMP."
          },
          {
            title: "Distinct Echo Substrings",
            url: "https://leetcode.com/problems/distinct-echo-substrings/description/",
            difficulty: "Hard",
            approach: "Verify adjacent substring matches using rolling hash comparisons."
          }
        ]
      },
      {
        id: "sm-2",
        name: "KMP Algorithm",
        description: "Find pattern matches in O(N + M) time using a lookup prefix array (LPS) to skip redundant character comparisons.",
        howToIdentify: "Finding substring indexes or matching periodic strings.",
        complexity: { time: "O(N + M)", space: "O(M) for pattern" },
        questions: [
          {
            title: "Find the Index of the First Occurrence in a String",
            url: "https://leetcode.com/problems/find-the-index-of-the-first-occurrence-in-a-string/description/",
            difficulty: "Easy",
            approach: "Build LPS array for needle. Track pointers. On mismatch, backtrack needle pointer using the LPS array."
          },
          {
            title: "Shortest Palindrome",
            url: "https://leetcode.com/problems/shortest-palindrome/description/",
            difficulty: "Hard",
            approach: "Create string S + '#' + reverse(S). Build LPS array. The last value in LPS is the longest palindromic prefix."
          },
          {
            title: "Repeated Substring Pattern",
            url: "https://leetcode.com/problems/repeated-substring-pattern/description/",
            difficulty: "Easy",
            approach: "Build LPS array. If len % (len - lps[len-1]) == 0 and lps[len-1] > 0, substring repeats."
          },
          {
            title: "Longest Happy Prefix",
            url: "https://leetcode.com/problems/longest-happy-prefix/description/",
            difficulty: "Hard",
            approach: "LPS array endpoint determines the length of the longest prefix that is also a suffix."
          }
        ]
      },
      {
        id: "sm-3",
        name: "Anagram & Permutations",
        description: "Compare character count arrays or hash maps to check for matching anagram configurations.",
        howToIdentify: "Evaluating anagram checks, letter frequency mappings, or permutations.",
        complexity: { time: "O(N)", space: "O(1) alphabet size" },
        questions: [
          {
            title: "Valid Anagram",
            url: "https://leetcode.com/problems/valid-anagram/description/",
            difficulty: "Easy",
            approach: "Maintain character frequencies. Increment counts for string S, decrement for T. Verify all counts are 0."
          },
          {
            title: "Group Anagrams",
            url: "https://leetcode.com/problems/group-anagrams/description/",
            difficulty: "Medium",
            approach: "Sort string character arrays to create keys, or use character count arrays. Group matching keys in a map."
          },
          {
            title: "Find All Anagrams in a String",
            url: "https://leetcode.com/problems/find-all-anagrams-in-a-string/description/",
            difficulty: "Medium",
            approach: "Use sliding window character frequency matches."
          },
          {
            title: "Palindromic Substrings",
            url: "https://leetcode.com/problems/palindromic-substrings/description/",
            difficulty: "Medium",
            approach: "Compare character counts to check if a permutation can form a palindrome."
          }
        ]
      },
      {
        id: "sm-4",
        name: "Palindrome Verification",
        description: "Check for palindrome status or symmetry by clean-up filters and inwards pointer checking.",
        howToIdentify: "Comparing characters starting at opposite ends.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Valid Palindrome",
            url: "https://leetcode.com/problems/valid-palindrome/description/",
            difficulty: "Easy",
            approach: "Filter non-alphanumeric characters, convert to lowercase, and check equality using inwards pointers."
          },
          {
            title: "Valid Palindrome II",
            url: "https://leetcode.com/problems/valid-palindrome-ii/description/",
            difficulty: "Easy",
            approach: "Check matching characters. On mismatch, check if deleting left or right char creates a valid palindrome."
          },
          {
            title: "Palindrome Partitioning",
            url: "https://leetcode.com/problems/palindrome-partitioning/description/",
            difficulty: "Medium",
            approach: "Evaluate substrings palindromes to branch backtracking partitions."
          },
          {
            title: "Palindrome Linked List",
            url: "https://leetcode.com/problems/palindrome-linked-list/description/",
            difficulty: "Easy",
            approach: "Solve by reversing the second half of the linked list."
          }
        ]
      },
      {
        id: "sm-5",
        name: "String Compression",
        description: "Encode repeated characters sequentially in-place using slow/fast write pointers.",
        howToIdentify: "Encoding repeated sequences or compressing arrays in-place.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "String Compression",
            url: "https://leetcode.com/problems/string-compression/description/",
            difficulty: "Medium",
            approach: "Iterate with read/write pointers. Count consecutive duplicate characters, write character, and append count digits."
          },
          {
            title: "Run-Length Encoding",
            url: "https://leetcode.com/problems/string-compression/description/",
            difficulty: "Easy",
            approach: "Traverse string, building compressed count representation."
          },
          {
            title: "Count and Say",
            url: "https://leetcode.com/problems/count-and-say/description/",
            difficulty: "Medium",
            approach: "Generate next string sequence iteratively by reading character run-lengths from the current string."
          },
          {
            title: "Decompress Run-Length Encoded List",
            url: "https://leetcode.com/problems/decompress-run-length-encoded-list/description/",
            difficulty: "Easy",
            approach: "Read pairs [freq, val], appending value to output array freq times."
          }
        ]
      },
      {
        id: "sm-6",
        name: "Trie (Prefix Tree) Search",
        description: "Store string characters in a tree structure. Allows checking word prefixes in O(WordLength) time.",
        howToIdentify: "Autocompleting words, checking prefixes, or matching dictionaries.",
        complexity: { time: "O(L) per word", space: "O(AlphabetSize * Nodes)" },
        questions: [
          {
            title: "Implement Trie (Prefix Tree)",
            url: "https://leetcode.com/problems/implement-trie-prefix-tree/description/",
            difficulty: "Medium",
            approach: "Build TrieNode containing child map/array (size 26) and a boolean end-of-word flag."
          },
          {
            title: "Design Add and Search Words Data Structure",
            url: "https://leetcode.com/problems/design-add-and-search-words-data-structure/description/",
            difficulty: "Medium",
            approach: "Implement Trie. For wildcard '.' queries, recursively check all children at that level."
          },
          {
            title: "Replace Words",
            url: "https://leetcode.com/problems/replace-words/description/",
            difficulty: "Medium",
            approach: "Insert root words in a Trie. For each sentence word, traverse the Trie to find and replace with the shortest prefix."
          },
          {
            title: "Word Search II",
            url: "https://leetcode.com/problems/word-search-ii/description/",
            difficulty: "Hard",
            approach: "DFS board search traversing parallel with Trie path nodes."
          }
        ]
      }
    ]
  },
  {
    id: "bit-manipulation",
    index: "XIV",
    name: "Bit Manipulation Patterns",
    patternCount: 4,
    patterns: [
      {
        id: "bm-1",
        name: "Single Number Detection (XOR)",
        description: "Find unique elements by XOR-ing all values. XOR of duplicate values cancel out to 0.",
        howToIdentify: "Finding unique numbers in arrays where duplicates appear exactly twice.",
        complexity: { time: "O(N)", space: "O(1)" },
        questions: [
          {
            title: "Single Number",
            url: "https://leetcode.com/problems/single-number/description/",
            difficulty: "Easy",
            approach: "XOR all numbers. Duplicate numbers cancel out (X ^ X = 0). The final accumulated value is the unique number."
          },
          {
            title: "Single Number II",
            url: "https://leetcode.com/problems/single-number-ii/description/",
            difficulty: "Medium",
            approach: "Count bits at each position. Sum mod 3 reveals bits of the unique number appearing once."
          },
          {
            title: "Single Number III",
            url: "https://leetcode.com/problems/single-number-iii/description/",
            difficulty: "Medium",
            approach: "XOR all numbers to get A ^ B. Find lowest set bit. Divide numbers into two groups based on this bit, XOR-ing separately."
          },
          {
            title: "Find the Difference",
            url: "https://leetcode.com/problems/find-the-difference/description/",
            difficulty: "Easy",
            approach: "XOR all character values from both strings S and T. The remaining char code is the added letter."
          }
        ]
      },
      {
        id: "bm-2",
        name: "Bit Counting",
        description: "Count set bits in integers using bitwise shifting or Brian Kernighan's algorithm (n & (n - 1) clears lowest set bit).",
        howToIdentify: "Counting set bits (1s) or evaluating binary representations.",
        complexity: { time: "O(Bits) or O(1)", space: "O(1)" },
        questions: [
          {
            title: "Number of 1 Bits",
            url: "https://leetcode.com/problems/number-of-1-bits/description/",
            difficulty: "Easy",
            approach: "Loop: clear lowest bit using n & (n - 1), incrementing count until n becomes 0."
          },
          {
            title: "Counting Bits",
            url: "https://leetcode.com/problems/counting-bits/description/",
            difficulty: "Easy",
            approach: "DP: count[i] = count[i / 2] + (i % 2). Shift right, adding 1 if current number is odd."
          },
          {
            title: "Reverse Bits",
            url: "https://leetcode.com/problems/reverse-bits/description/",
            difficulty: "Easy",
            approach: "Iterate 32 times. Shift result left, add lowest bit of N (N & 1), then shift N right."
          },
          {
            title: "Hamming Distance",
            url: "https://leetcode.com/problems/hamming-distance/description/",
            difficulty: "Easy",
            approach: "XOR inputs: X ^ Y. Count set bits in the result to find differing bits."
          }
        ]
      },
      {
        id: "bm-3",
        name: "Bitmasking",
        description: "Represent subset states using bitmask integers. Allows evaluating states in O(1) time.",
        howToIdentify: "Managing small subsets (N <= 30), tracking seen items, or storing states.",
        complexity: { time: "O(1) checks", space: "O(1)" },
        questions: [
          {
            title: "Subsets",
            url: "https://leetcode.com/problems/subsets/description/",
            difficulty: "Medium",
            approach: "Loop from 0 to 2^N. For each bitmask, build subset by including elements where the Jth bit is set."
          },
          {
            title: "Maximum Product of Word Lengths",
            url: "https://leetcode.com/problems/maximum-product-of-word-lengths/description/",
            difficulty: "Medium",
            approach: "Convert words to bitmask integers. Check if words share characters using mask1 & mask2 == 0."
          },
          {
            title: "Bitwise AND of Numbers Range",
            url: "https://leetcode.com/problems/bitwise-and-of-numbers-range/description/",
            difficulty: "Medium",
            approach: "Shift both boundaries right until they match, then shift the common prefix back to the left."
          },
          {
            title: "Number of Valid Words for Each Puzzle",
            url: "https://leetcode.com/problems/number-of-valid-words-for-each-puzzle/description/",
            difficulty: "Hard",
            approach: "Use word bitmasks. For each puzzle, iterate through subset bitmasks of the puzzle characters and sum word frequencies."
          }
        ]
      },
      {
        id: "bm-4",
        name: "Power / Transition Rules",
        description: "Determine power alignments using bitwise calculations (e.g. n & (n - 1) == 0 checking power of 2).",
        howToIdentify: "Checking powers of 2, 4, or modular transitions in binary representation.",
        complexity: { time: "O(1)", space: "O(1)" },
        questions: [
          {
            title: "Power of Two",
            url: "https://leetcode.com/problems/power-of-two/description/",
            difficulty: "Easy",
            approach: "Return n > 0 && (n & (n - 1)) == 0. A power of two has exactly one set bit, so clearing it yields 0."
          },
          {
            title: "Power of Four",
            url: "https://leetcode.com/problems/power-of-four/description/",
            difficulty: "Easy",
            approach: "Verify power of 2. In addition, check if set bit is at an odd index: (n & 0x55555555) != 0."
          },
          {
            title: "Missing Number",
            url: "https://leetcode.com/problems/missing-number/description/",
            difficulty: "Easy",
            approach: "XOR index values and array values. The remaining result is the missing number."
          },
          {
            title: "Dividing Two Integers",
            url: "https://leetcode.com/problems/divide-two-integers/description/",
            difficulty: "Medium",
            approach: "Subtract divisor multiplied by powers of 2 (divisor << shift), accumulating shifts."
          }
        ]
      }
    ]
  },
  {
    id: "design-patterns",
    index: "XV",
    name: "Design Patterns",
    patternCount: 2,
    patterns: [
      {
        id: "ds-1",
        name: "LRU Cache Design",
        description: "Design a Least Recently Used (LRU) Cache operating in O(1) time using a Hash Map paired with a Doubly Linked List.",
        howToIdentify: "System design challenges requiring O(1) lookups and eviction of least recently used elements.",
        complexity: { time: "O(1) all ops", space: "O(Capacity)" },
        questions: [
          {
            title: "LRU Cache",
            url: "https://leetcode.com/problems/lru-cache/description/",
            difficulty: "Medium",
            approach: "Maintain a Hash Map mapping keys to Doubly Linked List nodes. Move accessed nodes to the head. Evict from tail on overflow."
          },
          {
            title: "LFU Cache",
            url: "https://leetcode.com/problems/lfu-cache/description/",
            difficulty: "Hard",
            approach: "Least Frequently Used cache. Maintain frequency lists. Evict elements with minimum frequency, resolving ties with LRU."
          },
          {
            title: "Insert Delete GetRandom O(1)",
            url: "https://leetcode.com/problems/insert-delete-getrandom-o1/description/",
            difficulty: "Medium",
            approach: "Use a dynamic Array and a Hash Map mapping values to array indices. Delete by swapping target with last array element."
          },
          {
            title: "Design Circular Queue",
            url: "https://leetcode.com/problems/design-circular-queue/description/",
            difficulty: "Medium",
            approach: "Implement a circular queue using an array, tracking head, tail, and size bounds to handle wraps."
          }
        ]
      },
      {
        id: "ds-2",
        name: "Trie Design",
        description: "Design efficient prefix structures allowing word indexing and prefix search capabilities in O(L) time.",
        howToIdentify: "Implementing auto-complete data structures or search systems.",
        complexity: { time: "O(L) per word", space: "O(Alphabet * Nodes)" },
        questions: [
          {
            title: "Implement Trie (Prefix Tree)",
            url: "https://leetcode.com/problems/implement-trie-prefix-tree/description/",
            difficulty: "Medium",
            approach: "Implement Trie Node containing a children array/map and an end-of-word boolean marker."
          },
          {
            title: "Design Search Autocomplete System",
            url: "https://leetcode.com/problems/design-search-autocomplete-system/description/",
            difficulty: "Hard",
            approach: "Store words and sentence hotness in a Trie. Traverse matching branches, returning top 3 recommendations."
          },
          {
            title: "Prefix and Suffix Search",
            url: "https://leetcode.com/problems/prefix-and-suffix-search/description/",
            difficulty: "Hard",
            approach: "Insert word variations suffix + '#' + prefix into a single Trie. Query matches using a single prefix traversal."
          },
          {
            title: "Design Add and Search Words Data Structure",
            url: "https://leetcode.com/problems/design-add-and-search-words-data-structure/description/",
            difficulty: "Medium",
            approach: "Build Trie with wildcards support."
          }
        ]
      }
    ]
  },
  {
    id: "segment-fenwick",
    index: "XVI",
    name: "Segment Tree & Fenwick Tree Patterns",
    patternCount: 3,
    patterns: [
      {
        id: "sf-1",
        name: "Segment Tree Range Query",
        description: "Maintain a binary tree of intervals, allowing O(log N) point/range updates and range queries (sum, min, max).",
        howToIdentify: "Frequent range queries (e.g. range min/sum) combined with point/range modifications.",
        complexity: { time: "O(log N) updates & queries", space: "O(N)" },
        questions: [
          {
            title: "Range Sum Query 2D - Mutable",
            url: "https://leetcode.com/problems/range-sum-query-2d-mutable/description/",
            difficulty: "Hard",
            approach: "Implement a 2D Segment Tree or 2D Fenwick Tree to handle O(log R * log C) updates and sum queries."
          },
          {
            title: "Range Sum Query - Mutable",
            url: "https://leetcode.com/problems/range-sum-query-mutable/description/",
            difficulty: "Medium",
            approach: "Build a Segment Tree. Update value by modifying leaf and recalculating parent sums. Query sum by aggregating intersecting segments."
          },
          {
            title: "Queue Reconstruction by Height",
            url: "https://leetcode.com/problems/queue-reconstruction-by-height/description/",
            difficulty: "Medium",
            approach: "Can also be solved using a Segment Tree to locate empty slots for elements in O(N log N) time."
          },
          {
            title: "Count of Smaller Numbers After Self",
            url: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/description/",
            difficulty: "Hard",
            approach: "Process elements from right to left. Query the count of elements smaller than current using a Segment Tree/Fenwick Tree, then insert current."
          }
        ]
      },
      {
        id: "sf-2",
        name: "Fenwick Tree (Binary Indexed Tree)",
        description: "Track cumulative frequency sums in a compact array index structure, using bitwise updates: i += i & -i.",
        howToIdentify: "Range sum prefix queries combined with point updates in O(log N) time and minimal space.",
        complexity: { time: "O(log N) update & query", space: "O(N)" },
        questions: [
          {
            title: "Range Sum Query - Mutable",
            url: "https://leetcode.com/problems/range-sum-query-mutable/description/",
            difficulty: "Medium",
            approach: "Standard Fenwick Tree: update index by adding `i & -i`. Calculate prefix sums by subtracting `i & -i`. Range sum is diff."
          },
          {
            title: "Count of Range Sum",
            url: "https://leetcode.com/problems/count-of-range-sum/description/",
            difficulty: "Hard",
            approach: "Combine prefix sums, coordinate compression, and Fenwick tree updates to query range bounds."
          },
          {
            title: "Create Sorted Array through Instructions",
            url: "https://leetcode.com/problems/create-sorted-array-through-instructions/description/",
            difficulty: "Hard",
            approach: "For each value, count smaller elements using `query(val - 1)` and larger elements using `i - query(val)`. Add smaller cost, update Fenwick."
          },
          {
            title: "Count of Smaller Numbers After Self",
            url: "https://leetcode.com/problems/count-of-smaller-numbers-after-self/description/",
            difficulty: "Hard",
            approach: "Can be solved using Fenwick tree point updates."
          }
        ]
      },
      {
        id: "sf-3",
        name: "Lazy Propagation in Segment Tree",
        description: "Defer range updates in a Segment Tree by storing changes in a lazy array. Apply changes recursively during queries.",
        howToIdentify: "Updating range intervals (e.g. add X to all elements in range [L, R]) in O(log N) time.",
        complexity: { time: "O(log N) range updates & queries", space: "O(N)" },
        questions: [
          {
            title: "Range Module",
            url: "https://leetcode.com/problems/range-module/description/",
            difficulty: "Hard",
            approach: "Use a Segment Tree with Lazy Propagation to track interval states (true/false) dynamically."
          },
          {
            title: "My Calendar III",
            url: "https://leetcode.com/problems/my-calendar-iii/description/",
            difficulty: "Hard",
            approach: "Model overlaps using a segment tree. Increment values in range [start, end) and return the root maximum value."
          },
          {
            title: "Falling Squares",
            url: "https://leetcode.com/problems/falling-squares/description/",
            difficulty: "Hard",
            approach: "Query max height of segment, place square, and update range height to segment max + square side using Lazy Segment Tree."
          },
          {
            title: "Count of Range Sum",
            url: "https://leetcode.com/problems/count-of-range-sum/description/",
            difficulty: "Hard",
            approach: "Can be solved by coordinate compression and range update structures."
          }
        ]
      }
    ]
  }
];
