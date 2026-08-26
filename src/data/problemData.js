/**
 * Comprehensive LeetCode-Style Problem Database & Generator
 * Provides realistic descriptions, examples, constraints, starter code,
 * reference solutions, and public/hidden test cases for all DSA questions.
 */

export const PROBLEM_DATA = {
  "Spiral Matrix III": {
    "description": "You start at the cell `(rStart, cStart)` of an `rows x cols` grid and head east. The grid is 0-indexed with `rows` rows and `cols` columns.\n\nYou move in a clockwise spiral shape to visit every position in this grid. Whenever you move outside the grid's boundary, we continue our walk outside the grid (but may return to the grid boundary later).\n\nEventually, we reach all `rows * cols` spaces of the grid.\n\nReturn an array of coordinates representing the positions of the grid in the order they were visited.",
    "examples": [
      {
        "input": "rows = 1, cols = 4, rStart = 0, cStart = 0",
        "output": "[[0,0],[0,1],[0,2],[0,3]]",
        "explanation": "Starting at (0,0) and going East, South, West, North, we visit cells in the order: [0,0], [0,1], [0,2], [0,3]."
      },
      {
        "input": "rows = 5, cols = 6, rStart = 1, cStart = 4",
        "output": "[[1,4],[1,5],[2,5],[2,4],[2,3],[1,3],[0,3],[0,4],[0,5],[3,5],[3,4],[3,3],[3,2],[2,2],[1,2],[0,2],[4,5],[4,4],[4,3],[4,2],[4,1],[3,1],[2,1],[1,1],[0,1],[4,0],[3,0],[2,0],[1,0],[0,0]]",
        "explanation": "Spiral traversal starts at (1,4) and covers all 30 cells in clockwise outward spiral order."
      }
    ],
    "constraints": [
      "1 <= rows, cols <= 100",
      "0 <= rStart < rows",
      "0 <= cStart < cols"
    ],
    "starterCode": {
      "Python": "def spiralMatrixIII(rows: int, cols: int, rStart: int, cStart: int) -> List[List[int]]:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public int[][] spiralMatrixIII(int rows, int cols, int rStart, int cStart) {\n        // Write your solution here\n        return new int[0][0];\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    vector<vector<int>> spiralMatrixIII(int rows, int cols, int rStart, int cStart) {\n        // Write your solution here\n        return {};\n    }\n};",
      "JavaScript": "function spiralMatrixIII(rows, cols, rStart, cStart) {\n    // Write your solution here\n    return [];\n}"
    },
    "solutionCode": {
      "Python": "def spiralMatrixIII(rows: int, cols: int, rStart: int, cStart: int) -> List[List[int]]:\n    res = [[rStart, cStart]]\n    if rows * cols == 1:\n        return res\n    directions = [(0, 1), (1, 0), (0, -1), (-1, 0)]\n    step = 1\n    d = 0\n    r, c = rStart, cStart\n    while len(res) < rows * cols:\n        for _ in range(2):\n            dr, dc = directions[d]\n            for _ in range(step):\n                r += dr\n                c += dc\n                if 0 <= r < rows and 0 <= c < cols:\n                    res.append([r, c])\n            d = (d + 1) % 4\n        step += 1\n    return res",
      "Java": "public class Solution {\n    public int[][] spiralMatrixIII(int rows, int cols, int rStart, int cStart) {\n        int total = rows * cols;\n        int[][] res = new int[total][2];\n        res[0] = new int[]{rStart, cStart};\n        if (total == 1) return res;\n        int count = 1, step = 1, d = 0, r = rStart, c = cStart;\n        int[][] dirs = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};\n        while (count < total) {\n            for (int i = 0; i < 2; i++) {\n                int dr = dirs[d][0], dc = dirs[d][1];\n                for (int s = 0; s < step; s++) {\n                    r += dr;\n                    c += dc;\n                    if (r >= 0 && r < rows && c >= 0 && c < cols) {\n                        res[count++] = new int[]{r, c};\n                    }\n                }\n                d = (d + 1) % 4;\n            }\n            step++;\n        }\n        return res;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    vector<vector<int>> spiralMatrixIII(int rows, int cols, int rStart, int cStart) {\n        vector<vector<int>> res;\n        res.push_back({rStart, cStart});\n        int total = rows * cols;\n        if (total == 1) return res;\n        vector<pair<int, int>> dirs = {{0, 1}, {1, 0}, {0, -1}, {-1, 0}};\n        int step = 1, d = 0, r = rStart, c = cStart;\n        while ((int)res.size() < total) {\n            for (int i = 0; i < 2; ++i) {\n                int dr = dirs[d].first, dc = dirs[d].second;\n                for (int s = 0; s < step; ++s) {\n                    r += dr;\n                    c += dc;\n                    if (r >= 0 && r < rows && c >= 0 && c < cols) {\n                        res.push_back({r, c});\n                    }\n                }\n                d = (d + 1) % 4;\n            }\n            step++;\n        }\n        return res;\n    }\n};",
      "JavaScript": "function spiralMatrixIII(rows, cols, rStart, cStart) {\n    const res = [[rStart, cStart]];\n    const total = rows * cols;\n    if (total === 1) return res;\n    const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];\n    let step = 1, d = 0, r = rStart, c = cStart;\n    while (res.length < total) {\n        for (let i = 0; i < 2; i++) {\n            const [dr, dc] = dirs[d];\n            for (let s = 0; s < step; s++) {\n                r += dr;\n                c += dc;\n                if (r >= 0 && r < rows && c >= 0 && c < cols) {\n                    res.push([r, c]);\n                }\n            }\n            d = (d + 1) % 4;\n        }\n        step++;\n    }\n    return res;\n}"
    },
    "approach": "Simulate the spiral traversal by maintaining step sizes that increment after every two directional turns (1, 1, 2, 2, 3, 3...). Turn order is East, South, West, North. Add coordinates only when they fall inside [0, rows) and [0, cols).",
    "testCases": [
      {
        "id": 1,
        "input": "1\n4\n0\n0",
        "expected": "[[0,0],[0,1],[0,2],[0,3]]",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "5\n6\n1\n4",
        "expected": "[[1,4],[1,5],[2,5],[2,4],[2,3],[1,3],[0,3],[0,4],[0,5],[3,5],[3,4],[3,3],[3,2],[2,2],[1,2],[0,2],[4,5],[4,4],[4,3],[4,2],[4,1],[3,1],[2,1],[1,1],[0,1],[4,0],[3,0],[2,0],[1,0],[0,0]]",
        "isPublic": true
      }
    ]
  },
  "Spiral Matrix": {
    "description": "Given an `m x n` `matrix`, return all elements of the matrix in spiral order.",
    "examples": [
      {
        "input": "matrix = [[1,2,3],[4,5,6],[7,8,9]]",
        "output": "[1,2,3,6,9,8,7,4,5]",
        "explanation": "Traverse right, down, left, and up layer by layer."
      },
      {
        "input": "matrix = [[1,2,3,4],[5,6,7,8],[9,10,11,12]]",
        "output": "[1,2,3,4,8,12,11,10,9,5,6,7]"
      }
    ],
    "constraints": [
      "m == matrix.length",
      "n == matrix[i].length",
      "1 <= m, n <= 10",
      "-100 <= matrix[i][j] <= 100"
    ],
    "starterCode": {
      "Python": "def spiralOrder(matrix: List[List[int]]) -> List[int]:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public List<Integer> spiralOrder(int[][] matrix) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    vector<int> spiralOrder(vector<vector<int>>& matrix) {\n        // Write your solution here\n        return {};\n    }\n};",
      "JavaScript": "function spiralOrder(matrix) {\n    // Write your solution here\n    return [];\n}"
    },
    "solutionCode": {
      "Python": "def spiralOrder(matrix: List[List[int]]) -> List[int]:\n    if not matrix or not matrix[0]: return []\n    res = []\n    top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1\n    while top <= bottom and left <= right:\n        for c in range(left, right + 1): res.append(matrix[top][c])\n        top += 1\n        for r in range(top, bottom + 1): res.append(matrix[r][right])\n        right -= 1\n        if top <= bottom:\n            for c in range(right, left - 1, -1): res.append(matrix[bottom][c])\n            bottom -= 1\n        if left <= right:\n            for r in range(bottom, top - 1, -1): res.append(matrix[r][left])\n            left += 1\n    return res",
      "Java": "public class Solution {\n    public List<Integer> spiralOrder(int[][] matrix) {\n        List<Integer> res = new ArrayList<>();\n        if (matrix == null || matrix.length == 0) return res;\n        int top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;\n        while (top <= bottom && left <= right) {\n            for (int c = left; c <= right; c++) res.add(matrix[top][c]);\n            top++;\n            for (int r = top; r <= bottom; r++) res.add(matrix[r][right]);\n            right--;\n            if (top <= bottom) {\n                for (int c = right; c >= left; c--) res.add(matrix[bottom][c]);\n                bottom--;\n            }\n            if (left <= right) {\n                for (int r = bottom; r >= top; r--) res.add(matrix[r][left]);\n                left++;\n            }\n        }\n        return res;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    vector<int> spiralOrder(vector<vector<int>>& matrix) {\n        vector<int> res;\n        if (matrix.empty() || matrix[0].empty()) return res;\n        int top = 0, bottom = matrix.size() - 1, left = 0, right = matrix[0].size() - 1;\n        while (top <= bottom && left <= right) {\n            for (int c = left; c <= right; ++c) res.push_back(matrix[top][c]);\n            top++;\n            for (int r = top; r <= bottom; ++r) res.push_back(matrix[r][right]);\n            right--;\n            if (top <= bottom) {\n                for (int c = right; c >= left; --c) res.push_back(matrix[bottom][c]);\n                bottom--;\n            }\n            if (left <= right) {\n                for (int r = bottom; r >= top; --r) res.push_back(matrix[r][left]);\n                left++;\n            }\n        }\n        return res;\n    }\n};",
      "JavaScript": "function spiralOrder(matrix) {\n    if (!matrix || matrix.length === 0) return [];\n    const res = [];\n    let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;\n    while (top <= bottom && left <= right) {\n        for (let c = left; c <= right; c++) res.push(matrix[top][c]);\n        top++;\n        for (let r = top; r <= bottom; r++) res.push(matrix[r][right]);\n        right--;\n        if (top <= bottom) {\n            for (let c = right; c >= left; c--) res.push(matrix[bottom][c]);\n            bottom--;\n        }\n        if (left <= right) {\n            for (let r = bottom; r >= top; r--) res.push(matrix[r][left]);\n            left++;\n        }\n    }\n    return res;\n}"
    },
    "approach": "Maintain 4 boundary pointers: top, bottom, left, right. Traverse across the perimeter in right -> down -> left -> up sequence, incrementing or decrementing boundaries after each traversal.",
    "testCases": [
      {
        "id": 1,
        "input": "[[1,2,3],[4,5,6],[7,8,9]]",
        "expected": "[1,2,3,6,9,8,7,4,5]",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "[[1,2,3,4],[5,6,7,8],[9,10,11,12]]",
        "expected": "[1,2,3,4,8,12,11,10,9,5,6,7]",
        "isPublic": true
      }
    ]
  },
  "Two Sum II - Input Array Is Sorted": {
    "description": "Given a 1-indexed array of integers `numbers` that is already sorted in non-decreasing order, find two numbers such that they add up to a specific `target` number. Let these two numbers be `numbers[index1]` and `numbers[index2]` where `1 <= index1 < index2 <= numbers.length`.\n\nReturn the indices of the two numbers, `index1` and `index2`, added by one as an integer array `[index1, index2]` of length 2.\n\nThe tests are generated such that there is exactly one solution. You may not use the same element twice.",
    "examples": [
      {
        "input": "numbers = [2,7,11,15], target = 9",
        "output": "[1,2]",
        "explanation": "The sum of 2 and 7 is 9. Therefore, index1 = 1, index2 = 2. We return [1, 2]."
      },
      {
        "input": "numbers = [2,3,4], target = 6",
        "output": "[1,3]",
        "explanation": "The sum of 2 and 4 is 6. Therefore index1 = 1, index2 = 3. We return [1, 3]."
      },
      {
        "input": "numbers = [-1,0], target = -1",
        "output": "[1,2]",
        "explanation": "The sum of -1 and 0 is -1. Therefore index1 = 1, index2 = 2. We return [1, 2]."
      }
    ],
    "constraints": [
      "2 <= numbers.length <= 3 × 10⁴",
      "-1000 <= numbers[i] <= 1000",
      "numbers is sorted in non-decreasing order.",
      "-1000 <= target <= 1000",
      "The tests are generated such that there is exactly one solution."
    ],
    "testCases": [
      {
        "id": 1,
        "input": "[2,7,11,15]\n9",
        "expected": "[1,2]",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "[2,3,4]\n6",
        "expected": "[1,3]",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "[-1,0]\n-1",
        "expected": "[1,2]",
        "isPublic": true
      },
      {
        "id": 4,
        "input": "[1,2,3,4,4,9,56,90]\n8",
        "expected": "[4,5]",
        "isPublic": false
      },
      {
        "id": 5,
        "input": "[5,25,75]\n100",
        "expected": "[2,3]",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def twoSumII(numbers: list[int], target: int) -> list[int]:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public int[] twoSumII(int[] numbers, int target) {\n        // Write your solution here\n        return new int[]{};\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    vector<int> twoSumII(vector<int>& numbers, int target) {\n        // Write your solution here\n        return {};\n    }\n};",
      "JavaScript": "function twoSumII(numbers, target) {\n    // Write your solution here\n    return [];\n}"
    },
    "solutionCode": {
      "Python": "def twoSumII(numbers, target):\n    l, r = 0, len(numbers) - 1\n    while l < r:\n        s = numbers[l] + numbers[r]\n        if s == target:\n            return [l + 1, r + 1]\n        elif s < target:\n            l += 1\n        else:\n            r -= 1\n    return []",
      "Java": "public class Solution {\n    public int[] twoSumII(int[] numbers, int target) {\n        int l = 0, r = numbers.length - 1;\n        while (l < r) {\n            int s = numbers[l] + numbers[r];\n            if (s == target) return new int[]{l + 1, r + 1};\n            else if (s < target) l++;\n            else r--;\n        }\n        return new int[]{};\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    vector<int> twoSumII(vector<int>& numbers, int target) {\n        int l = 0, r = numbers.size() - 1;\n        while (l < r) {\n            int s = numbers[l] + numbers[r];\n            if (s == target) return {l + 1, r + 1};\n            else if (s < target) l++;\n            else r--;\n        }\n        return {};\n    }\n};",
      "JavaScript": "function twoSumII(numbers, target) {\n    let l = 0, r = numbers.length - 1;\n    while (l < r) {\n        const s = numbers[l] + numbers[r];\n        if (s === target) return [l + 1, r + 1];\n        else if (s < target) l++;\n        else r--;\n    }\n    return [];\n}"
    }
  },
  "3Sum": {
    "description": "Given an integer array `nums`, return all the triplets `[nums[i], nums[j], nums[k]]` such that `i != j`, `i != k`, and `j != k`, and `nums[i] + nums[j] + nums[k] == 0`.\n\nNotice that the solution set must not contain duplicate triplets.",
    "examples": [
      {
        "input": "nums = [-1,0,1,2,-1,-4]",
        "output": "[[-1,-1,2],[-1,0,1]]",
        "explanation": "nums[0] + nums[1] + nums[2] = (-1) + 0 + 1 = 0. The distinct triplets are [-1,0,1] and [-1,-1,2]."
      },
      {
        "input": "nums = [0,1,1]",
        "output": "[]",
        "explanation": "The only possible triplet does not sum up to 0."
      },
      {
        "input": "nums = [0,0,0]",
        "output": "[[0,0,0]]",
        "explanation": "The only possible triplet sums up to 0."
      }
    ],
    "constraints": [
      "3 <= nums.length <= 3000",
      "-10⁵ <= nums[i] <= 10⁵"
    ],
    "testCases": [
      {
        "id": 1,
        "input": "[-1,0,1,2,-1,-4]",
        "expected": "[[-1,-1,2],[-1,0,1]]",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "[0,1,1]",
        "expected": "[]",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "[0,0,0]",
        "expected": "[[0,0,0]]",
        "isPublic": true
      },
      {
        "id": 4,
        "input": "[-2,0,0,2,2]",
        "expected": "[[-2,0,2]]",
        "isPublic": false
      },
      {
        "id": 5,
        "input": "[-4,-2,-2,-2,0,1,2,2,2,3,3,4,4,6,6]",
        "expected": "[[-4,-2,6],[-4,0,4],[-4,1,3],[-4,2,2],[-2,-2,4],[-2,0,2]]",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def threeSum(nums: list[int]) -> list[list[int]]:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};",
      "JavaScript": "function threeSum(nums) {\n    // Write your solution here\n    return [];\n}"
    },
    "solutionCode": {
      "Python": "def threeSum(nums: list[int]) -> list[list[int]]:\n    nums.sort()\n    res = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i-1]:\n            continue\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s < 0:\n                l += 1\n            elif s > 0:\n                r -= 1\n            else:\n                res.append([nums[i], nums[l], nums[r]])\n                while l < r and nums[l] == nums[l+1]:\n                    l += 1\n                while l < r and nums[r] == nums[r-1]:\n                    r -= 1\n                l += 1\n                r -= 1\n    return res",
      "Java": "public class Solution {\n    public List<List<Integer>> threeSum(int[] nums) {\n        Arrays.sort(nums);\n        List<List<Integer>> res = new ArrayList<>();\n        for (int i = 0; i < nums.length - 2; i++) {\n            if (i > 0 && nums[i] == nums[i - 1]) continue;\n            int l = i + 1, r = nums.length - 1;\n            while (l < r) {\n                int s = nums[i] + nums[l] + nums[r];\n                if (s < 0) l++;\n                else if (s > 0) r--;\n                else {\n                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));\n                    while (l < r && nums[l] == nums[l + 1]) l++;\n                    while (l < r && nums[r] == nums[r - 1]) r--;\n                    l++; r--;\n                }\n            }\n        }\n        return res;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    vector<vector<int>> threeSum(vector<int>& nums) {\n        sort(nums.begin(), nums.end());\n        vector<vector<int>> res;\n        for (int i = 0; i < (int)nums.size() - 2; ++i) {\n            if (i > 0 && nums[i] == nums[i-1]) continue;\n            int l = i + 1, r = nums.size() - 1;\n            while (l < r) {\n                int s = nums[i] + nums[l] + nums[r];\n                if (s < 0) l++;\n                else if (s > 0) r--;\n                else {\n                    res.push_back({nums[i], nums[l], nums[r]});\n                    while (l < r && nums[l] == nums[l+1]) l++;\n                    while (l < r && nums[r] == nums[r-1]) r--;\n                    l++; r--;\n                }\n            }\n        }\n        return res;\n    }\n};",
      "JavaScript": "function threeSum(nums) {\n    nums.sort((a, b) => a - b);\n    const res = [];\n    for (let i = 0; i < nums.length - 2; i++) {\n        if (i > 0 && nums[i] === nums[i - 1]) continue;\n        let l = i + 1, r = nums.length - 1;\n        while (l < r) {\n            const s = nums[i] + nums[l] + nums[r];\n            if (s < 0) l++;\n            else if (s > 0) r--;\n            else {\n                res.push([nums[i], nums[l], nums[r]]);\n                while (l < r && nums[l] === nums[l + 1]) l++;\n                while (l < r && nums[r] === nums[r - 1]) r--;\n                l++; r--;\n            }\n        }\n    }\n    return res;\n}"
    }
  },
  "Container With Most Water": {
    "description": "You are given an integer array `height` of length `n`. There are `n` vertical lines drawn such that the two endpoints of the `i`th line are `(i, 0)` and `(i, height[i])`.\n\nFind two lines that together with the x-axis form a container, such that the container contains the most water.\n\nReturn the maximum amount of water a container can store.",
    "examples": [
      {
        "input": "height = [1,8,6,2,5,4,8,3,7]",
        "output": "49",
        "explanation": "The max area is between index 1 (height 8) and index 8 (height 7). Area = min(8,7) × (8-1) = 7 × 7 = 49."
      },
      {
        "input": "height = [1,1]",
        "output": "1",
        "explanation": "Only one container possible: min(1,1) × 1 = 1."
      }
    ],
    "constraints": [
      "n == height.length",
      "2 <= n <= 10⁵",
      "0 <= height[i] <= 10⁴"
    ],
    "testCases": [
      {
        "id": 1,
        "input": "[1,8,6,2,5,4,8,3,7]",
        "expected": "49",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "[1,1]",
        "expected": "1",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "[4,3,2,1,4]",
        "expected": "16",
        "isPublic": false
      },
      {
        "id": 4,
        "input": "[1,2,1]",
        "expected": "2",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def maxArea(height: list[int]) -> int:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public int maxArea(int[] height) {\n        // Write your solution here\n        return 0;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        // Write your solution here\n        return 0;\n    }\n};",
      "JavaScript": "function maxArea(height) {\n    // Write your solution here\n    return 0;\n}"
    },
    "solutionCode": {
      "Python": "def maxArea(height):\n    l, r, best = 0, len(height) - 1, 0\n    while l < r:\n        best = max(best, min(height[l], height[r]) * (r - l))\n        if height[l] < height[r]:\n            l += 1\n        else:\n            r -= 1\n    return best",
      "Java": "public class Solution {\n    public int maxArea(int[] height) {\n        int l = 0, r = height.length - 1, best = 0;\n        while (l < r) {\n            best = Math.max(best, Math.min(height[l], height[r]) * (r - l));\n            if (height[l] < height[r]) l++;\n            else r--;\n        }\n        return best;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    int maxArea(vector<int>& height) {\n        int l = 0, r = height.size() - 1, best = 0;\n        while (l < r) {\n            best = max(best, min(height[l], height[r]) * (r - l));\n            if (height[l] < height[r]) l++;\n            else r--;\n        }\n        return best;\n    }\n};",
      "JavaScript": "function maxArea(height) {\n    let l = 0, r = height.length - 1, best = 0;\n    while (l < r) {\n        best = Math.max(best, Math.min(height[l], height[r]) * (r - l));\n        if (height[l] < height[r]) l++;\n        else r--;\n    }\n    return best;\n}"
    }
  },
  "Trapping Rain Water": {
    "description": "Given `n` non-negative integers representing an elevation map where the width of each bar is `1`, compute how much water it can trap after raining.",
    "examples": [
      {
        "input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
        "output": "6",
        "explanation": "The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1]. 6 units of rain water are trapped."
      },
      {
        "input": "height = [4,2,0,3,2,5]",
        "output": "9",
        "explanation": "9 units of rain water are trapped."
      }
    ],
    "constraints": [
      "n == height.length",
      "1 <= n <= 2 × 10⁴",
      "0 <= height[i] <= 10⁵"
    ],
    "testCases": [
      {
        "id": 1,
        "input": "[0,1,0,2,1,0,1,3,2,1,2,1]",
        "expected": "6",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "[4,2,0,3,2,5]",
        "expected": "9",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "[3,0,2,0,4]",
        "expected": "7",
        "isPublic": false
      },
      {
        "id": 4,
        "input": "[0,0,0]",
        "expected": "0",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def trap(height: list[int]) -> int:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public int trap(int[] height) {\n        // Write your solution here\n        return 0;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    int trap(vector<int>& height) {\n        // Write your solution here\n        return 0;\n    }\n};",
      "JavaScript": "function trap(height) {\n    // Write your solution here\n    return 0;\n}"
    },
    "solutionCode": {
      "Python": "def trap(height):\n    l, r = 0, len(height) - 1\n    lMax, rMax = 0, 0\n    water = 0\n    while l < r:\n        if height[l] <= height[r]:\n            lMax = max(lMax, height[l])\n            water += lMax - height[l]\n            l += 1\n        else:\n            rMax = max(rMax, height[r])\n            water += rMax - height[r]\n            r -= 1\n    return water",
      "Java": "public class Solution {\n    public int trap(int[] height) {\n        int l = 0, r = height.length - 1, lMax = 0, rMax = 0, water = 0;\n        while (l < r) {\n            if (height[l] <= height[r]) {\n                lMax = Math.max(lMax, height[l]);\n                water += lMax - height[l++];\n            } else {\n                rMax = Math.max(rMax, height[r]);\n                water += rMax - height[r--];\n            }\n        }\n        return water;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    int trap(vector<int>& height) {\n        int l = 0, r = height.size() - 1, lMax = 0, rMax = 0, water = 0;\n        while (l < r) {\n            if (height[l] <= height[r]) {\n                lMax = max(lMax, height[l]);\n                water += lMax - height[l++];\n            } else {\n                rMax = max(rMax, height[r]);\n                water += rMax - height[r--];\n            }\n        }\n        return water;\n    }\n};",
      "JavaScript": "function trap(height) {\n    let l = 0, r = height.length - 1, lMax = 0, rMax = 0, water = 0;\n    while (l < r) {\n        if (height[l] <= height[r]) {\n            lMax = Math.max(lMax, height[l]);\n            water += lMax - height[l++];\n        } else {\n            rMax = Math.max(rMax, height[r]);\n            water += rMax - height[r--];\n        }\n    }\n    return water;\n}"
    }
  },
  "Linked List Cycle": {
    "description": "Given `head`, the head of a linked list, determine if the linked list has a cycle in it.\n\nReturn `true` if there is a cycle in the linked list. Otherwise, return `false`.",
    "examples": [
      {
        "input": "head = [3,2,0,-4], pos = 1",
        "output": "true",
        "explanation": "There is a cycle in the linked list, where the tail connects to the 1st node."
      },
      {
        "input": "head = [1,2], pos = 0",
        "output": "true",
        "explanation": "There is a cycle in the linked list."
      },
      {
        "input": "head = [1], pos = -1",
        "output": "false",
        "explanation": "There is no cycle in the linked list."
      }
    ],
    "constraints": [
      "The number of nodes in the list is in the range [0, 10⁴].",
      "-10⁵ <= Node.val <= 10⁵"
    ],
    "testCases": [
      {
        "id": 1,
        "input": "[3,2,0,-4]\n1",
        "expected": "true",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "[1,2]\n0",
        "expected": "true",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "[1]\n-1",
        "expected": "false",
        "isPublic": true
      },
      {
        "id": 4,
        "input": "[]\n-1",
        "expected": "false",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def hasCycle(head) -> bool:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public boolean hasCycle(ListNode head) {\n        // Write your solution here\n        return false;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    bool hasCycle(ListNode *head) {\n        // Write your solution here\n        return false;\n    }\n};",
      "JavaScript": "function hasCycle(head) {\n    // Write your solution here\n    return false;\n}"
    },
    "solutionCode": {
      "Python": "def hasCycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            return True\n    return False",
      "Java": "public class Solution {\n    public boolean hasCycle(ListNode head) {\n        ListNode slow = head, fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n            if (slow == fast) return true;\n        }\n        return false;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    bool hasCycle(ListNode *head) {\n        ListNode *slow = head, *fast = head;\n        while (fast && fast->next) {\n            slow = slow->next;\n            fast = fast->next->next;\n            if (slow == fast) return true;\n        }\n        return false;\n    }\n};",
      "JavaScript": "function hasCycle(head) {\n    let slow = head, fast = head;\n    while (fast && fast.next) {\n        slow = slow.next;\n        fast = fast.next.next;\n        if (slow === fast) return true;\n    }\n    return false;\n}"
    }
  },
  "Happy Number": {
    "description": "Write an algorithm to determine if a number `n` is happy.\n\nA happy number is a number defined by the process: starting with any positive integer, replace the number by the sum of the squares of its digits. Repeat until it equals 1, or loops endlessly in a cycle which does not include 1.\n\nReturn `true` if `n` is a happy number, and `false` if not.",
    "examples": [
      {
        "input": "n = 19",
        "output": "true",
        "explanation": "1² + 9² = 82 → 8² + 2² = 68 → 6² + 8² = 100 → 1² + 0² + 0² = 1."
      },
      {
        "input": "n = 2",
        "output": "false",
        "explanation": "Falls into endless cycle without reaching 1."
      }
    ],
    "constraints": [
      "1 <= n <= 2³¹ - 1"
    ],
    "testCases": [
      {
        "id": 1,
        "input": "19",
        "expected": "true",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "2",
        "expected": "false",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "1",
        "expected": "true",
        "isPublic": false
      },
      {
        "id": 4,
        "input": "7",
        "expected": "true",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def isHappy(n: int) -> bool:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public boolean isHappy(int n) {\n        // Write your solution here\n        return false;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    bool isHappy(int n) {\n        // Write your solution here\n        return false;\n    }\n};",
      "JavaScript": "function isHappy(n) {\n    // Write your solution here\n    return false;\n}"
    },
    "solutionCode": {
      "Python": "def isHappy(n):\n    def get_next(number):\n        total_sum = 0\n        while number > 0:\n            number, digit = divmod(number, 10)\n            total_sum += digit ** 2\n        return total_sum\n    seen = set()\n    while n != 1 and n not in seen:\n        seen.add(n)\n        n = get_next(n)\n    return n == 1",
      "Java": "public class Solution {\n    private int getNext(int n) {\n        int totalSum = 0;\n        while (n > 0) {\n            int d = n % 10;\n            n = n / 10;\n            totalSum += d * d;\n        }\n        return totalSum;\n    }\n    public boolean isHappy(int n) {\n        Set<Integer> seen = new HashSet<>();\n        while (n != 1 && !seen.contains(n)) {\n            seen.add(n);\n            n = getNext(n);\n        }\n        return n == 1;\n    }\n}",
      "Cpp": "class Solution {\n    int getNext(int n) {\n        int totalSum = 0;\n        while (n > 0) {\n            int d = n % 10;\n            n = n / 10;\n            totalSum += d * d;\n        }\n        return totalSum;\n    }\npublic:\n    bool isHappy(int n) {\n        unordered_set<int> seen;\n        while (n != 1 && !seen.count(n)) {\n            seen.insert(n);\n            n = getNext(n);\n        }\n        return n == 1;\n    }\n};",
      "JavaScript": "function isHappy(n) {\n    const getNext = (num) => {\n        let sum = 0;\n        while (num > 0) {\n            const d = num % 10;\n            num = Math.floor(num / 10);\n            sum += d * d;\n        }\n        return sum;\n    };\n    const seen = new Set();\n    while (n !== 1 && !seen.has(n)) {\n        seen.add(n);\n        n = getNext(n);\n    }\n    return n === 1;\n}"
    }
  },
  "Middle of the Linked List": {
    "description": "Given the `head` of a singly linked list, return the middle node of the linked list.\n\nIf there are two middle nodes, return **the second middle** node.",
    "examples": [
      {
        "input": "head = [1,2,3,4,5]",
        "output": "[3,4,5]",
        "explanation": "The middle node of the list is node 3."
      },
      {
        "input": "head = [1,2,3,4,5,6]",
        "output": "[4,5,6]",
        "explanation": "Since the list has two middle nodes with values 3 and 4, we return the second one."
      }
    ],
    "constraints": [
      "The number of nodes in the list is in the range [1, 100].",
      "1 <= Node.val <= 100"
    ],
    "testCases": [
      {
        "id": 1,
        "input": "[1,2,3,4,5]",
        "expected": "[3,4,5]",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "[1,2,3,4,5,6]",
        "expected": "[4,5,6]",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "[1]",
        "expected": "[1]",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def middleNode(head):\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public ListNode middleNode(ListNode head) {\n        // Write your solution here\n        return head;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    ListNode* middleNode(ListNode* head) {\n        // Write your solution here\n        return head;\n    }\n};",
      "JavaScript": "function middleNode(head) {\n    // Write your solution here\n    return head;\n}"
    },
    "solutionCode": {
      "Python": "def middleNode(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow",
      "Java": "public class Solution {\n    public ListNode middleNode(ListNode head) {\n        ListNode slow = head, fast = head;\n        while (fast != null && fast.next != null) {\n            slow = slow.next;\n            fast = fast.next.next;\n        }\n        return slow;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    ListNode* middleNode(ListNode* head) {\n        ListNode* slow = head;\n        ListNode* fast = head;\n        while (fast && fast->next) {\n            slow = slow->next;\n            fast = fast->next->next;\n        }\n        return slow;\n    }\n};",
      "JavaScript": "function middleNode(head) {\n    let slow = head, fast = head;\n    while (fast && fast.next) {\n        slow = slow.next;\n        fast = fast.next.next;\n    }\n    return slow;\n}"
    }
  },
  "Longest Substring Without Repeating Characters": {
    "description": "Given a string `s`, find the length of the **longest substring** without repeating characters.",
    "examples": [
      {
        "input": "s = \"abcabcbb\"",
        "output": "3",
        "explanation": "The answer is \"abc\", with the length of 3."
      },
      {
        "input": "s = \"bbbbb\"",
        "output": "1",
        "explanation": "The answer is \"b\", with the length of 1."
      },
      {
        "input": "s = \"pwwkew\"",
        "output": "3",
        "explanation": "The answer is \"wke\", with the length of 3."
      }
    ],
    "constraints": [
      "0 <= s.length <= 5 × 10⁴",
      "s consists of English letters, digits, symbols and spaces."
    ],
    "testCases": [
      {
        "id": 1,
        "input": "\"abcabcbb\"",
        "expected": "3",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "\"bbbbb\"",
        "expected": "1",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "\"pwwkew\"",
        "expected": "3",
        "isPublic": true
      },
      {
        "id": 4,
        "input": "\"\"",
        "expected": "0",
        "isPublic": false
      },
      {
        "id": 5,
        "input": "\"au\"",
        "expected": "2",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def lengthOfLongestSubstring(s: str) -> int:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        // Write your solution here\n        return 0;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        // Write your solution here\n        return 0;\n    }\n};",
      "JavaScript": "function lengthOfLongestSubstring(s) {\n    // Write your solution here\n    return 0;\n}"
    },
    "solutionCode": {
      "Python": "def lengthOfLongestSubstring(s):\n    seen = {}\n    l = best = 0\n    for r, c in enumerate(s):\n        if c in seen and seen[c] >= l:\n            l = seen[c] + 1\n        seen[c] = r\n        best = max(best, r - l + 1)\n    return best",
      "Java": "public class Solution {\n    public int lengthOfLongestSubstring(String s) {\n        Map<Character, Integer> seen = new HashMap<>();\n        int l = 0, best = 0;\n        for (int r = 0; r < s.length(); r++) {\n            char c = s.charAt(r);\n            if (seen.containsKey(c) && seen.get(c) >= l) {\n                l = seen.get(c) + 1;\n            }\n            seen.put(c, r);\n            best = Math.max(best, r - l + 1);\n        }\n        return best;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    int lengthOfLongestSubstring(string s) {\n        unordered_map<char, int> seen;\n        int l = 0, best = 0;\n        for (int r = 0; r < (int)s.size(); r++) {\n            if (seen.count(s[r]) && seen[s[r]] >= l) {\n                l = seen[s[r]] + 1;\n            }\n            seen[s[r]] = r;\n            best = max(best, r - l + 1);\n        }\n        return best;\n    }\n};",
      "JavaScript": "function lengthOfLongestSubstring(s) {\n    const seen = new Map();\n    let l = 0, best = 0;\n    for (let r = 0; r < s.length; r++) {\n        const c = s[r];\n        if (seen.has(c) && seen.get(c) >= l) {\n            l = seen.get(c) + 1;\n        }\n        seen.set(c, r);\n        best = Math.max(best, r - l + 1);\n    }\n    return best;\n}"
    }
  },
  "Minimum Window Substring": {
    "description": "Given two strings `s` and `t` of lengths `m` and `n` respectively, return the **minimum window substring** of `s` such that every character in `t` (including duplicates) is included in the window. If there is no such substring, return the empty string `\"\"`.",
    "examples": [
      {
        "input": "s = \"ADOBECODEBANC\", t = \"ABC\"",
        "output": "\"BANC\"",
        "explanation": "The minimum window substring \"BANC\" includes 'A', 'B', and 'C' from string t."
      },
      {
        "input": "s = \"a\", t = \"a\"",
        "output": "\"a\"",
        "explanation": "The entire string s is the minimum window."
      }
    ],
    "constraints": [
      "m == s.length",
      "n == t.length",
      "1 <= m, n <= 10⁵"
    ],
    "testCases": [
      {
        "id": 1,
        "input": "\"ADOBECODEBANC\"\n\"ABC\"",
        "expected": "\"BANC\"",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "\"a\"\n\"a\"",
        "expected": "\"a\"",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "\"a\"\n\"aa\"",
        "expected": "\"\"",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def minWindow(s: str, t: str) -> str:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public String minWindow(String s, String t) {\n        // Write your solution here\n        return \"\";\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    string minWindow(string s, string t) {\n        // Write your solution here\n        return \"\";\n    }\n};",
      "JavaScript": "function minWindow(s, t) {\n    // Write your solution here\n    return \"\";\n}"
    },
    "solutionCode": {
      "Python": "def minWindow(s, t):\n    from collections import Counter\n    need = Counter(t)\n    have, total = 0, len(need)\n    window = {}\n    res, resLen = [-1, -1], float('inf')\n    l = 0\n    for r, c in enumerate(s):\n        window[c] = window.get(c, 0) + 1\n        if c in need and window[c] == need[c]:\n            have += 1\n        while have == total:\n            if (r - l + 1) < resLen:\n                res = [l, r]\n                resLen = r - l + 1\n            window[s[l]] -= 1\n            if s[l] in need and window[s[l]] < need[s[l]]:\n                have -= 1\n            l += 1\n    l, r = res\n    return s[l:r+1] if resLen != float('inf') else ''",
      "Java": "public class Solution {\n    public String minWindow(String s, String t) {\n        if (s.length() < t.length()) return \"\";\n        Map<Character, Integer> need = new HashMap<>(), win = new HashMap<>();\n        for (char c : t.toCharArray()) need.merge(c, 1, Integer::sum);\n        int have = 0, total = need.size(), l = 0, resL = 0, resLen = Integer.MAX_VALUE;\n        for (int r = 0; r < s.length(); r++) {\n            char c = s.charAt(r);\n            win.merge(c, 1, Integer::sum);\n            if (need.containsKey(c) && win.get(c).equals(need.get(c))) have++;\n            while (have == total) {\n                if (r - l + 1 < resLen) { resLen = r - l + 1; resL = l; }\n                char lc = s.charAt(l++);\n                win.merge(lc, -1, Integer::sum);\n                if (need.containsKey(lc) && win.get(lc) < need.get(lc)) have--;\n            }\n        }\n        return resLen == Integer.MAX_VALUE ? \"\" : s.substring(resL, resL + resLen);\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    string minWindow(string s, string t) {\n        unordered_map<char, int> need, win;\n        for (char c : t) need[c]++;\n        int have = 0, total = need.size(), l = 0, resL = 0, resLen = INT_MAX;\n        for (int r = 0; r < (int)s.size(); r++) {\n            win[s[r]]++;\n            if (need.count(s[r]) && win[s[r]] == need[s[r]]) have++;\n            while (have == total) {\n                if (r - l + 1 < resLen) { resLen = r - l + 1; resL = l; }\n                if (need.count(s[l]) && --win[s[l]] < need[s[l]]) have--;\n                else win[s[l]]--;\n                l++;\n            }\n        }\n        return resLen == INT_MAX ? \"\" : s.substr(resL, resLen);\n    }\n};",
      "JavaScript": "function minWindow(s, t) {\n    const need = new Map(), win = new Map();\n    for (const c of t) need.set(c, (need.get(c) || 0) + 1);\n    let have = 0, total = need.size, l = 0, resL = 0, resLen = Infinity;\n    for (let r = 0; r < s.length; r++) {\n        const c = s[r];\n        win.set(c, (win.get(c) || 0) + 1);\n        if (need.has(c) && win.get(c) === need.get(c)) have++;\n        while (have === total) {\n            if (r - l + 1 < resLen) { resLen = r - l + 1; resL = l; }\n            const lc = s[l++];\n            win.set(lc, win.get(lc) - 1);\n            if (need.has(lc) && win.get(lc) < need.get(lc)) have--;\n        }\n    }\n    return resLen === Infinity ? '' : s.slice(resL, resL + resLen);\n}"
    }
  },
  "Binary Search": {
    "description": "Given an array of integers `nums` which is sorted in ascending order, and an integer `target`, write a function to search `target` in `nums`. If `target` exists, then return its index. Otherwise, return `-1`.",
    "examples": [
      {
        "input": "nums = [-1,0,3,5,9,12], target = 9",
        "output": "4",
        "explanation": "9 exists in nums and its index is 4."
      },
      {
        "input": "nums = [-1,0,3,5,9,12], target = 2",
        "output": "-1",
        "explanation": "2 does not exist in nums so return -1."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 10⁴",
      "-10⁴ < nums[i], target < 10⁴",
      "nums is sorted in ascending order."
    ],
    "testCases": [
      {
        "id": 1,
        "input": "[-1,0,3,5,9,12]\n9",
        "expected": "4",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "[-1,0,3,5,9,12]\n2",
        "expected": "-1",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "[5]\n5",
        "expected": "0",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def search(nums: list[int], target: int) -> int:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public int search(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n};",
      "JavaScript": "function search(nums, target) {\n    // Write your solution here\n    return -1;\n}"
    },
    "solutionCode": {
      "Python": "def search(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target: return mid\n        elif nums[mid] < target: l = mid + 1\n        else: r = mid - 1\n    return -1",
      "Java": "public class Solution {\n    public int search(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (nums[mid] == target) return mid;\n            else if (nums[mid] < target) l = mid + 1;\n            else r = mid - 1;\n        }\n        return -1;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    int search(vector<int>& nums, int target) {\n        int l = 0, r = nums.size() - 1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (nums[mid] == target) return mid;\n            else if (nums[mid] < target) l = mid + 1;\n            else r = mid - 1;\n        }\n        return -1;\n    }\n};",
      "JavaScript": "function search(nums, target) {\n    let l = 0, r = nums.length - 1;\n    while (l <= r) {\n        const mid = (l + r) >> 1;\n        if (nums[mid] === target) return mid;\n        else if (nums[mid] < target) l = mid + 1;\n        else r = mid - 1;\n    }\n    return -1;\n}"
    }
  },
  "Search in Rotated Sorted Array": {
    "description": "Given the array `nums` after the possible rotation and an integer `target`, return the index of `target` if it is in `nums`, or `-1` if it is not in `nums`.\n\nYou must write an algorithm with `O(log n)` runtime complexity.",
    "examples": [
      {
        "input": "nums = [4,5,6,7,0,1,2], target = 0",
        "output": "4",
        "explanation": "0 is at index 4."
      },
      {
        "input": "nums = [4,5,6,7,0,1,2], target = 3",
        "output": "-1",
        "explanation": "3 is not in the array."
      }
    ],
    "constraints": [
      "1 <= nums.length <= 5000",
      "-10⁴ <= nums[i] <= 10⁴",
      "All values of nums are unique."
    ],
    "testCases": [
      {
        "id": 1,
        "input": "[4,5,6,7,0,1,2]\n0",
        "expected": "4",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "[4,5,6,7,0,1,2]\n3",
        "expected": "-1",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "[1]\n0",
        "expected": "-1",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def searchRotated(nums: list[int], target: int) -> int:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public int searchRotated(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    int searchRotated(vector<int>& nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n};",
      "JavaScript": "function searchRotated(nums, target) {\n    // Write your solution here\n    return -1;\n}"
    },
    "solutionCode": {
      "Python": "def searchRotated(nums, target):\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        mid = (l + r) // 2\n        if nums[mid] == target: return mid\n        if nums[l] <= nums[mid]:\n            if nums[l] <= target < nums[mid]: r = mid - 1\n            else: l = mid + 1\n        else:\n            if nums[mid] < target <= nums[r]: l = mid + 1\n            else: r = mid - 1\n    return -1",
      "Java": "public class Solution {\n    public int searchRotated(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[l] <= nums[mid]) {\n                if (nums[l] <= target && target < nums[mid]) r = mid - 1;\n                else l = mid + 1;\n            } else {\n                if (nums[mid] < target && target <= nums[r]) l = mid + 1;\n                else r = mid - 1;\n            }\n        }\n        return -1;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    int searchRotated(vector<int>& nums, int target) {\n        int l = 0, r = nums.size() - 1;\n        while (l <= r) {\n            int mid = l + (r - l) / 2;\n            if (nums[mid] == target) return mid;\n            if (nums[l] <= nums[mid]) {\n                if (nums[l] <= target && target < nums[mid]) r = mid - 1;\n                else l = mid + 1;\n            } else {\n                if (nums[mid] < target && target <= nums[r]) l = mid + 1;\n                else r = mid - 1;\n            }\n        }\n        return -1;\n    }\n};",
      "JavaScript": "function searchRotated(nums, target) {\n    let l = 0, r = nums.length - 1;\n    while (l <= r) {\n        const mid = (l + r) >> 1;\n        if (nums[mid] === target) return mid;\n        if (nums[l] <= nums[mid]) {\n            if (nums[l] <= target && target < nums[mid]) r = mid - 1;\n            else l = mid + 1;\n        } else {\n            if (nums[mid] < target && target <= nums[r]) l = mid + 1;\n            else r = mid - 1;\n        }\n    }\n    return -1;\n}"
    }
  },
  "Climbing Stairs": {
    "description": "You are climbing a staircase. It takes `n` steps to reach the top.\n\nEach time you can either climb `1` or `2` steps. In how many distinct ways can you climb to the top?",
    "examples": [
      {
        "input": "n = 2",
        "output": "2",
        "explanation": "1. 1 step + 1 step  2. 2 steps"
      },
      {
        "input": "n = 3",
        "output": "3",
        "explanation": "1. 1 step + 1 step + 1 step  2. 1 step + 2 steps  3. 2 steps + 1 step"
      }
    ],
    "constraints": [
      "1 <= n <= 45"
    ],
    "testCases": [
      {
        "id": 1,
        "input": "2",
        "expected": "2",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "3",
        "expected": "3",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "1",
        "expected": "1",
        "isPublic": false
      },
      {
        "id": 4,
        "input": "10",
        "expected": "89",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def climbStairs(n: int) -> int:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    int climbStairs(int n) {\n        // Write your solution here\n        return 0;\n    }\n};",
      "JavaScript": "function climbStairs(n) {\n    // Write your solution here\n    return 0;\n}"
    },
    "solutionCode": {
      "Python": "def climbStairs(n):\n    a, b = 1, 1\n    for _ in range(n - 1):\n        a, b = b, a + b\n    return b",
      "Java": "public class Solution {\n    public int climbStairs(int n) {\n        int a = 1, b = 1;\n        for (int i = 1; i < n; i++) {\n            int c = a + b;\n            a = b;\n            b = c;\n        }\n        return b;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    int climbStairs(int n) {\n        int a = 1, b = 1;\n        for (int i = 1; i < n; i++) {\n            int c = a + b;\n            a = b;\n            b = c;\n        }\n        return b;\n    }\n};",
      "JavaScript": "function climbStairs(n) {\n    let a = 1, b = 1;\n    for (let i = 1; i < n; i++) {\n        [a, b] = [b, a + b];\n    }\n    return b;\n}"
    }
  },
  "Coin Change": {
    "description": "You are given an integer array `coins` representing coins of different denominations and an integer `amount` representing a total amount of money.\n\nReturn the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return `-1`.",
    "examples": [
      {
        "input": "coins = [1,2,5], amount = 11",
        "output": "3",
        "explanation": "11 = 5 + 5 + 1"
      },
      {
        "input": "coins = [2], amount = 3",
        "output": "-1",
        "explanation": "Cannot make change for 3 with coins of 2."
      }
    ],
    "constraints": [
      "1 <= coins.length <= 12",
      "0 <= amount <= 10⁴"
    ],
    "testCases": [
      {
        "id": 1,
        "input": "[1,2,5]\n11",
        "expected": "3",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "[2]\n3",
        "expected": "-1",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "[1]\n0",
        "expected": "0",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def coinChange(coins: list[int], amount: int) -> int:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public int coinChange(int[] coins, int amount) {\n        // Write your solution here\n        return -1;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        // Write your solution here\n        return -1;\n    }\n};",
      "JavaScript": "function coinChange(coins, amount) {\n    // Write your solution here\n    return -1;\n}"
    },
    "solutionCode": {
      "Python": "def coinChange(coins, amount):\n    dp = [float('inf')] * (amount + 1)\n    dp[0] = 0\n    for a in range(1, amount + 1):\n        for c in coins:\n            if a - c >= 0:\n                dp[a] = min(dp[a], dp[a - c] + 1)\n    return dp[amount] if dp[amount] != float('inf') else -1",
      "Java": "public class Solution {\n    public int coinChange(int[] coins, int amount) {\n        int[] dp = new int[amount + 1];\n        Arrays.fill(dp, amount + 1);\n        dp[0] = 0;\n        for (int a = 1; a <= amount; a++)\n            for (int c : coins)\n                if (a - c >= 0)\n                    dp[a] = Math.min(dp[a], dp[a - c] + 1);\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    int coinChange(vector<int>& coins, int amount) {\n        vector<int> dp(amount + 1, amount + 1);\n        dp[0] = 0;\n        for (int a = 1; a <= amount; a++)\n            for (int c : coins)\n                if (a - c >= 0)\n                    dp[a] = min(dp[a], dp[a - c] + 1);\n        return dp[amount] > amount ? -1 : dp[amount];\n    }\n};",
      "JavaScript": "function coinChange(coins, amount) {\n    const dp = new Array(amount + 1).fill(Infinity);\n    dp[0] = 0;\n    for (let a = 1; a <= amount; a++)\n        for (const c of coins)\n            if (a - c >= 0)\n                dp[a] = Math.min(dp[a], dp[a - c] + 1);\n    return dp[amount] === Infinity ? -1 : dp[amount];\n}"
    }
  },
  "Invert Binary Tree": {
    "description": "Given the `root` of a binary tree, invert the tree, and return its root.",
    "examples": [
      {
        "input": "root = [4,2,7,1,3,6,9]",
        "output": "[4,7,2,9,6,3,1]",
        "explanation": "Mirror the entire binary tree."
      },
      {
        "input": "root = [2,1,3]",
        "output": "[2,3,1]",
        "explanation": "Swap left and right subtrees."
      }
    ],
    "constraints": [
      "The number of nodes in the tree is in the range [0, 100].",
      "-100 <= Node.val <= 100"
    ],
    "testCases": [
      {
        "id": 1,
        "input": "[4,2,7,1,3,6,9]",
        "expected": "[4,7,2,9,6,3,1]",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "[2,1,3]",
        "expected": "[2,3,1]",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "[]",
        "expected": "[]",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def invertTree(root):\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        // Write your solution here\n        return root;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        // Write your solution here\n        return root;\n    }\n};",
      "JavaScript": "function invertTree(root) {\n    // Write your solution here\n    return root;\n}"
    },
    "solutionCode": {
      "Python": "def invertTree(root):\n    if not root: return None\n    root.left, root.right = invertTree(root.right), invertTree(root.left)\n    return root",
      "Java": "public class Solution {\n    public TreeNode invertTree(TreeNode root) {\n        if (root == null) return null;\n        TreeNode tmp = root.left;\n        root.left = invertTree(root.right);\n        root.right = invertTree(tmp);\n        return root;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    TreeNode* invertTree(TreeNode* root) {\n        if (!root) return nullptr;\n        swap(root->left, root->right);\n        invertTree(root->left);\n        invertTree(root->right);\n        return root;\n    }\n};",
      "JavaScript": "function invertTree(root) {\n    if (!root) return null;\n    [root.left, root.right] = [invertTree(root.right), invertTree(root.left)];\n    return root;\n}"
    }
  },
  "Number of Islands": {
    "description": "Given an `m x n` 2D binary grid `grid` which represents a map of `'1'`s (land) and `'0'`s (water), return the number of islands.\n\nAn island is surrounded by water and is formed by connecting adjacent lands horizontally or vertically.",
    "examples": [
      {
        "input": "grid = [[\"1\",\"1\",\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"0\",\"0\"]]",
        "output": "1",
        "explanation": "All 1s form one connected island."
      },
      {
        "input": "grid = [[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]",
        "output": "3",
        "explanation": "There are 3 separate islands."
      }
    ],
    "constraints": [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 300"
    ],
    "testCases": [
      {
        "id": 1,
        "input": "[[\"1\",\"1\",\"1\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"1\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"0\",\"0\"]]",
        "expected": "1",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "[[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"1\",\"1\",\"0\",\"0\",\"0\"],[\"0\",\"0\",\"1\",\"0\",\"0\"],[\"0\",\"0\",\"0\",\"1\",\"1\"]]",
        "expected": "3",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "[[\"1\"]]",
        "expected": "1",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def numIslands(grid: list[list[str]]) -> int:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public int numIslands(char[][] grid) {\n        // Write your solution here\n        return 0;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        // Write your solution here\n        return 0;\n    }\n};",
      "JavaScript": "function numIslands(grid) {\n    // Write your solution here\n    return 0;\n}"
    },
    "solutionCode": {
      "Python": "def numIslands(grid):\n    rows, cols = len(grid), len(grid[0])\n    count = 0\n    def dfs(r, c):\n        if r < 0 or r >= rows or c < 0 or c >= cols or grid[r][c] != '1': return\n        grid[r][c] = '0'\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1)\n    for r in range(rows):\n        for c in range(cols):\n            if grid[r][c] == '1':\n                dfs(r, c)\n                count += 1\n    return count",
      "Java": "public class Solution {\n    void dfs(char[][] g, int r, int c) {\n        if (r < 0 || r >= g.length || c < 0 || c >= g[0].length || g[r][c] != '1') return;\n        g[r][c] = '0';\n        dfs(g, r+1, c); dfs(g, r-1, c); dfs(g, r, c+1); dfs(g, r, c-1);\n    }\n    public int numIslands(char[][] grid) {\n        int count = 0;\n        for (int r = 0; r < grid.length; r++)\n            for (int c = 0; c < grid[0].length; c++)\n                if (grid[r][c] == '1') { dfs(grid, r, c); count++; }\n        return count;\n    }\n}",
      "Cpp": "class Solution {\n    void dfs(vector<vector<char>>& g, int r, int c) {\n        if (r < 0 || r >= (int)g.size() || c < 0 || c >= (int)g[0].size() || g[r][c] != '1') return;\n        g[r][c] = '0';\n        dfs(g, r+1, c); dfs(g, r-1, c); dfs(g, r, c+1); dfs(g, r, c-1);\n    }\npublic:\n    int numIslands(vector<vector<char>>& grid) {\n        int count = 0;\n        for (int r = 0; r < (int)grid.size(); r++)\n            for (int c = 0; c < (int)grid[0].size(); c++)\n                if (grid[r][c] == '1') { dfs(grid, r, c); count++; }\n        return count;\n    }\n};",
      "JavaScript": "function numIslands(grid) {\n    const rows = grid.length, cols = grid[0].length;\n    let count = 0;\n    const dfs = (r, c) => {\n        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== '1') return;\n        grid[r][c] = '0';\n        dfs(r+1, c); dfs(r-1, c); dfs(r, c+1); dfs(r, c-1);\n    };\n    for (let r = 0; r < rows; r++)\n        for (let c = 0; c < cols; c++)\n            if (grid[r][c] === '1') { dfs(r, c); count++; }\n    return count;\n}"
    }
  },
  "Valid Parentheses": {
    "description": "Given a string `s` containing just the characters `'('`, `')'`, `'{'`, `'}'`, `'['` and `']'`, determine if the input string is valid.\n\nAn input string is valid if open brackets are closed by the same type of brackets in the correct order.",
    "examples": [
      {
        "input": "s = \"()\"",
        "output": "true",
        "explanation": "Matched pair."
      },
      {
        "input": "s = \"()[]{}\"",
        "output": "true",
        "explanation": "All brackets correctly matched."
      },
      {
        "input": "s = \"(]\"",
        "output": "false",
        "explanation": "Mismatched bracket types."
      }
    ],
    "constraints": [
      "1 <= s.length <= 10⁴",
      "s consists of parentheses only '()[]{}'."
    ],
    "testCases": [
      {
        "id": 1,
        "input": "\"()\"",
        "expected": "true",
        "isPublic": true
      },
      {
        "id": 2,
        "input": "\"()[]{}\"",
        "expected": "true",
        "isPublic": true
      },
      {
        "id": 3,
        "input": "\"(]\"",
        "expected": "false",
        "isPublic": true
      },
      {
        "id": 4,
        "input": "\"([)]\"",
        "expected": "false",
        "isPublic": false
      },
      {
        "id": 5,
        "input": "\"{[]}\"",
        "expected": "true",
        "isPublic": false
      }
    ],
    "starterCode": {
      "Python": "def isValid(s: str) -> bool:\n    # Write your solution here\n    pass",
      "Java": "public class Solution {\n    public boolean isValid(String s) {\n        // Write your solution here\n        return false;\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    bool isValid(string s) {\n        // Write your solution here\n        return false;\n    }\n};",
      "JavaScript": "function isValid(s) {\n    // Write your solution here\n    return false;\n}"
    },
    "solutionCode": {
      "Python": "def isValid(s):\n    stack = []\n    mapping = {')': '(', '}': '{', ']': '['}\n    for c in s:\n        if c in mapping:\n            if not stack or stack[-1] != mapping[c]: return False\n            stack.pop()\n        else:\n            stack.append(c)\n    return not stack",
      "Java": "public class Solution {\n    public boolean isValid(String s) {\n        Deque<Character> st = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(' || c == '[' || c == '{') st.push(c);\n            else {\n                if (st.isEmpty()) return false;\n                char t = st.pop();\n                if ((c == ')' && t != '(') || (c == ']' && t != '[') || (c == '}' && t != '{')) return false;\n            }\n        }\n        return st.isEmpty();\n    }\n}",
      "Cpp": "class Solution {\npublic:\n    bool isValid(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == '(' || c == '[' || c == '{') st.push(c);\n            else {\n                if (st.empty()) return false;\n                char t = st.top(); st.pop();\n                if ((c == ')' && t != '(') || (c == ']' && t != '[') || (c == '}' && t != '{')) return false;\n            }\n        }\n        return st.empty();\n    }\n};",
      "JavaScript": "function isValid(s) {\n    const stack = [], map = { ')': '(', ']': '[', '}': '{' };\n    for (const c of s) {\n        if (['(', '[', '{'].includes(c)) stack.push(c);\n        else if (stack.pop() !== map[c]) return false;\n    }\n    return stack.length === 0;\n}"
    }
  }
};

import { wrapJsCode } from '../services/compilerService.js';

// ── Helper: CamelCase function name from title (Never starts with digit) ───────
const DIGIT_WORDS = {
  '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
  '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine'
};

const KNOWN_FN_NAMES = {
  '3Sum': 'threeSum',
  '3Sum Closest': 'threeSumClosest',
  '4Sum': 'fourSum',
  '4Sum II': 'fourSumCount',
  '132 Pattern': 'find132pattern',
  '24 Game': 'judgePoint24',
  '1-bit and 2-bit Characters': 'isOneBitCharacter',
  '2 Keys Keyboard': 'minSteps',
};

export function toFunctionName(title) {
  if (KNOWN_FN_NAMES[title]) return KNOWN_FN_NAMES[title];

  let words = title.replace(/[^a-zA-Z0-9\s]/g, '').split(/\s+/).filter(Boolean);
  if (words.length === 0) return 'solve';

  let firstWord = words[0];
  if (/^[0-9]/.test(firstWord)) {
    const digit = firstWord.charAt(0);
    const rest = firstWord.slice(1);
    firstWord = (DIGIT_WORDS[digit] || 'solve') + (rest ? rest.charAt(0).toUpperCase() + rest.slice(1).toLowerCase() : '');
  }

  return firstWord.toLowerCase() + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
}

function executeJsSolution(jsCode, stdin) {
  try {
    const logs = [];
    const mockConsole = {
      log: (...args) => logs.push(args.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')),
      error: () => {},
      warn: () => {},
      info: () => {}
    };
    const wrapped = wrapJsCode(jsCode, stdin);
    const fn = new Function('console', wrapped);
    fn(mockConsole);
    return logs.join('\n').trim();
  } catch (e) {
    return '';
  }
}

const RESOLVED_PROBLEM_CACHE = {};

/**
 * Universal Problem Data Resolver
 * Guarantees every question in the platform has rich LeetCode-style descriptions,
 * examples, constraints, starter templates, and validated test cases.
 */
export function getProblemData(questionTitle, question = {}, pattern = {}) {
  // If explicitly in dictionary, return with enhanced fields
  if (PROBLEM_DATA[questionTitle]) {
    const data = PROBLEM_DATA[questionTitle];
    const approach = data.approach || question.approach || pattern.description || 'Apply standard algorithm pattern.';
    const timeComp = pattern.complexity?.time || 'O(N)';
    const spaceComp = pattern.complexity?.space || 'O(1)';
    const allPublicCases = (data.testCases || []).map((tc, idx) => ({
      ...tc,
      id: idx + 1,
      isPublic: true,
    }));
    return {
      ...data,
      testCases: allPublicCases,
      approach,
      complexity: data.complexity || pattern.complexity || { time: timeComp, space: spaceComp },
      starterCode: data.starterCode || question.starterCode || generateStarterCode(questionTitle),
      solutionCode: data.solutionCode || question.solutionCode || generateSolutionCode(questionTitle, approach, pattern),
    };
  }

  if (RESOLVED_PROBLEM_CACHE[questionTitle]) {
    return RESOLVED_PROBLEM_CACHE[questionTitle];
  }

  // Generate dynamic LeetCode-quality problem package for any question
  const fn = toFunctionName(questionTitle);
  const t = questionTitle.toLowerCase();
  const patName = (pattern?.name || '').toLowerCase();
  const cat = (pattern?.category || '').toLowerCase();
  const approach = question.approach || pattern.description || 'Apply standard algorithm pattern.';
  const timeComp = pattern.complexity?.time || 'O(N)';
  const spaceComp = pattern.complexity?.space || 'O(1)';

  let sampleInputs = ['[1,2,3,4]', '[0,1,0,3,12]', '[1,2,3,1]'];
  let starterCode = null;
  let solutionCode = null;

  // 1. Two Sum / Pair Target Sum
  if (t.includes('two sum') || (patName.includes('target sum') && t.includes('sum') && !t.includes('3sum') && !t.includes('4sum'))) {
    sampleInputs = ['[2,7,11,15]\n9', '[3,2,4]\n6', '[3,3]\n6'];
    starterCode = {
      Python: `def ${fn}(nums: List[int], target: int) -> List[int]:\n    # Write your solution here\n    pass`,
      Java: `public class Solution {\n    public int[] ${fn}(int[] nums, int target) {\n        // Write your solution here\n        return new int[0];\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    vector<int> ${fn}(vector<int>& nums, int target) {\n        // Write your solution here\n        return {};\n    }\n};`,
      JavaScript: `function ${fn}(nums, target) {\n    // Write your solution here\n    return [];\n}`
    };
    solutionCode = {
      Python: `def ${fn}(nums: List[int], target: int) -> List[int]:\n    seen = {}\n    for i, n in enumerate(nums):\n        diff = target - n\n        if diff in seen:\n            return [seen[diff], i]\n        seen[n] = i\n    return []`,
      Java: `public class Solution {\n    public int[] ${fn}(int[] nums, int target) {\n        Map<Integer, Integer> seen = new HashMap<>();\n        for (int i = 0; i < nums.length; i++) {\n            int diff = target - nums[i];\n            if (seen.containsKey(diff)) return new int[]{seen.get(diff), i};\n            seen.put(nums[i], i);\n        }\n        return new int[0];\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    vector<int> ${fn}(vector<int>& nums, int target) {\n        unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); ++i) {\n            int diff = target - nums[i];\n            if (seen.count(diff)) return {seen[diff], i};\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`,
      JavaScript: `function ${fn}(nums, target) {\n    const seen = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const diff = target - nums[i];\n        if (seen.has(diff)) return [seen.get(diff), i];\n        seen.set(nums[i], i);\n    }\n    return [];\n}`
    };
  }
  // 2. 3Sum
  else if (t.includes('3sum') || t.includes('three sum')) {
    sampleInputs = ['[-1,0,1,2,-1,-4]', '[0,1,1]', '[0,0,0]'];
    starterCode = {
      Python: `def ${fn}(nums: List[int]) -> List[List[int]]:\n    # Write your solution here\n    pass`,
      Java: `public class Solution {\n    public List<List<Integer>> ${fn}(int[] nums) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    vector<vector<int>> ${fn}(vector<int>& nums) {\n        // Write your solution here\n        return {};\n    }\n};`,
      JavaScript: `function ${fn}(nums) {\n    // Write your solution here\n    return [];\n}`
    };
    solutionCode = {
      Python: `def ${fn}(nums: List[int]) -> List[List[int]]:\n    nums.sort()\n    res = []\n    for i in range(len(nums) - 2):\n        if i > 0 and nums[i] == nums[i-1]: continue\n        l, r = i + 1, len(nums) - 1\n        while l < r:\n            s = nums[i] + nums[l] + nums[r]\n            if s < 0: l += 1\n            elif s > 0: r -= 1\n            else:\n                res.append([nums[i], nums[l], nums[r]])\n                while l < r and nums[l] == nums[l+1]: l += 1\n                while l < r and nums[r] == nums[r-1]: r -= 1\n                l += 1; r -= 1\n    return res`,
      Java: `public class Solution {\n    public List<List<Integer>> ${fn}(int[] nums) {\n        Arrays.sort(nums);\n        List<List<Integer>> res = new ArrayList<>();\n        for (int i = 0; i < nums.length - 2; i++) {\n            if (i > 0 && nums[i] == nums[i-1]) continue;\n            int l = i + 1, r = nums.length - 1;\n            while (l < r) {\n                int s = nums[i] + nums[l] + nums[r];\n                if (s < 0) l++;\n                else if (s > 0) r--;\n                else {\n                    res.add(Arrays.asList(nums[i], nums[l], nums[r]));\n                    while (l < r && nums[l] == nums[l+1]) l++;\n                    while (l < r && nums[r] == nums[r-1]) r--;\n                    l++; r--;\n                }\n            }\n        }\n        return res;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    vector<vector<int>> ${fn}(vector<int>& nums) {\n        sort(nums.begin(), nums.end());\n        vector<vector<int>> res;\n        for (int i = 0; i < (int)nums.size() - 2; ++i) {\n            if (i > 0 && nums[i] == nums[i-1]) continue;\n            int l = i + 1, r = (int)nums.size() - 1;\n            while (l < r) {\n                int s = nums[i] + nums[l] + nums[r];\n                if (s < 0) ++l;\n                else if (s > 0) --r;\n                else {\n                    res.push_back({nums[i], nums[l], nums[r]});\n                    while (l < r && nums[l] == nums[l+1]) ++l;\n                    while (l < r && nums[r] == nums[r-1]) --r;\n                    ++l; --r;\n                }\n            }\n        }\n        return res;\n    }\n};`,
      JavaScript: `function ${fn}(nums) {\n    nums.sort((a, b) => a - b);\n    const res = [];\n    for (let i = 0; i < nums.length - 2; i++) {\n        if (i > 0 && nums[i] === nums[i-1]) continue;\n        let l = i + 1, r = nums.length - 1;\n        while (l < r) {\n            const s = nums[i] + nums[l] + nums[r];\n            if (s < 0) l++;\n            else if (s > 0) r--;\n            else {\n                res.push([nums[i], nums[l], nums[r]]);\n                while (l < r && nums[l] === nums[l+1]) l++;\n                while (l < r && nums[r] === nums[r-1]) r--;\n                l++; r--;\n            }\n        }\n    }\n    return res;\n}`
    };
  }
  // 3. Palindrome / String
  else if (t.includes('palindrome') || patName.includes('palindrome') || t.includes('anagram') || t.includes('isomorphic') || (cat.includes('string') && !t.includes('subarray'))) {
    if (t.includes('anagram') || t.includes('isomorphic')) {
      sampleInputs = ['"anagram"\n"nagaram"', '"rat"\n"car"', '"a"\n"ab"'];
      starterCode = {
        Python: `def ${fn}(s: str, t: str) -> bool:\n    # Write your solution here\n    pass`,
        Java: `public class Solution {\n    public boolean ${fn}(String s, String t) {\n        // Write your solution here\n        return false;\n    }\n}`,
        Cpp: `class Solution {\npublic:\n    bool ${fn}(string s, string t) {\n        // Write your solution here\n        return false;\n    }\n};`,
        JavaScript: `function ${fn}(s, t) {\n    // Write your solution here\n    return false;\n}`
      };
      solutionCode = {
        Python: `def ${fn}(s: str, t: str) -> bool:\n    return sorted(s) == sorted(t)`,
        Java: `public class Solution {\n    public boolean ${fn}(String s, String t) {\n        char[] a = s.toCharArray(), b = t.toCharArray();\n        Arrays.sort(a); Arrays.sort(b);\n        return Arrays.equals(a, b);\n    }\n}`,
        Cpp: `class Solution {\npublic:\n    bool ${fn}(string s, string t) {\n        sort(s.begin(), s.end());\n        sort(t.begin(), t.end());\n        return s == t;\n    }\n};`,
        JavaScript: `function ${fn}(s, t) {\n    return s.split('').sort().join('') === t.split('').sort().join('');\n}`
      };
    } else {
      sampleInputs = ['"A man, a plan, a canal: Panama"', '"race a car"', '" "'];
      starterCode = {
        Python: `def ${fn}(s: str) -> bool:\n    # Write your solution here\n    pass`,
        Java: `public class Solution {\n    public boolean ${fn}(String s) {\n        // Write your solution here\n        return false;\n    }\n}`,
        Cpp: `class Solution {\npublic:\n    bool ${fn}(string s) {\n        // Write your solution here\n        return false;\n    }\n};`,
        JavaScript: `function ${fn}(s) {\n    // Write your solution here\n    return false;\n}`
      };
      solutionCode = {
        Python: `def ${fn}(s: str) -> bool:\n    clean = [c.lower() for c in s if c.isalnum()]\n    return clean == clean[::-1]`,
        Java: `public class Solution {\n    public boolean ${fn}(String s) {\n        StringBuilder sb = new StringBuilder();\n        for (char c : s.toCharArray()) {\n            if (Character.isLetterOrDigit(c)) sb.append(Character.toLowerCase(c));\n        }\n        String clean = sb.toString();\n        return clean.equals(new StringBuilder(clean).reverse().toString());\n    }\n}`,
        Cpp: `class Solution {\npublic:\n    bool ${fn}(string s) {\n        string clean = "";\n        for (char c : s) {\n            if (isalnum(c)) clean += tolower(c);\n        }\n        string rev = clean;\n        reverse(rev.begin(), rev.end());\n        return clean == rev;\n    }\n};`,
        JavaScript: `function ${fn}(s) {\n    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');\n    return clean === clean.split('').reverse().join('');\n}`
      };
    }
  }
  // 4. Kadane / Maximum Subarray
  else if (t.includes('kadane') || (t.includes('max') && t.includes('subarray'))) {
    sampleInputs = ['[-2,1,-3,4,-1,2,1,-5,4]', '[1]', '[5,4,-1,7,8]'];
    starterCode = {
      Python: `def ${fn}(nums: List[int]) -> int:\n    # Write your solution here\n    pass`,
      Java: `public class Solution {\n    public int ${fn}(int[] nums) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    int ${fn}(vector<int>& nums) {\n        // Write your solution here\n        return 0;\n    }\n};`,
      JavaScript: `function ${fn}(nums) {\n    // Write your solution here\n    return 0;\n}`
    };
    solutionCode = {
      Python: `def ${fn}(nums: List[int]) -> int:\n    cur = mx = nums[0]\n    for x in nums[1:]:\n        cur = max(x, cur + x)\n        mx = max(mx, cur)\n    return mx`,
      Java: `public class Solution {\n    public int ${fn}(int[] nums) {\n        int cur = nums[0], mx = nums[0];\n        for (int i = 1; i < nums.length; i++) {\n            cur = Math.max(nums[i], cur + nums[i]);\n            mx = Math.max(mx, cur);\n        }\n        return mx;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    int ${fn}(vector<int>& nums) {\n        int cur = nums[0], mx = nums[0];\n        for (size_t i = 1; i < nums.size(); ++i) {\n            cur = max(nums[i], cur + nums[i]);\n            mx = max(mx, cur);\n        }\n        return mx;\n    }\n};`,
      JavaScript: `function ${fn}(nums) {\n    let cur = nums[0], mx = nums[0];\n    for (let i = 1; i < nums.length; i++) {\n        cur = Math.max(nums[i], cur + nums[i]);\n        mx = Math.max(mx, cur);\n    }\n    return mx;\n}`
    };
  }
  // 5. Binary Search & Search in Array
  else if (t.includes('search') || t.includes('find target') || (cat.includes('binary search') && !t.includes('matrix'))) {
    sampleInputs = ['[-1,0,3,5,9,12]\n9', '[-1,0,3,5,9,12]\n2', '[1,3,5,6]\n5'];
    starterCode = {
      Python: `def ${fn}(nums: List[int], target: int) -> int:\n    # Write your solution here\n    pass`,
      Java: `public class Solution {\n    public int ${fn}(int[] nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    int ${fn}(vector<int>& nums, int target) {\n        // Write your solution here\n        return -1;\n    }\n};`,
      JavaScript: `function ${fn}(nums, target) {\n    // Write your solution here\n    return -1;\n}`
    };
    solutionCode = {
      Python: `def ${fn}(nums: List[int], target: int) -> int:\n    l, r = 0, len(nums) - 1\n    while l <= r:\n        m = (l + r) // 2\n        if nums[m] == target: return m\n        elif nums[m] < target: l = m + 1\n        else: r = m - 1\n    return -1`,
      Java: `public class Solution {\n    public int ${fn}(int[] nums, int target) {\n        int l = 0, r = nums.length - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            else if (nums[m] < target) l = m + 1;\n            else r = m - 1;\n        }\n        return -1;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    int ${fn}(vector<int>& nums, int target) {\n        int l = 0, r = (int)nums.size() - 1;\n        while (l <= r) {\n            int m = l + (r - l) / 2;\n            if (nums[m] == target) return m;\n            else if (nums[m] < target) l = m + 1;\n            else r = m - 1;\n        }\n        return -1;\n    }\n};`,
      JavaScript: `function ${fn}(nums, target) {\n    let l = 0, r = nums.length - 1;\n    while (l <= r) {\n        const m = Math.floor((l + r) / 2);\n        if (nums[m] === target) return m;\n        else if (nums[m] < target) l = m + 1;\n        else r = m - 1;\n    }\n    return -1;\n}`
    };
  }
  // 6. Sliding Window / Substring
  else if (cat.includes('sliding window') || t.includes('longest substring') || t.includes('window')) {
    sampleInputs = ['"abcabcbb"', '"bbbbb"', '"pwwkew"'];
    starterCode = {
      Python: `def ${fn}(s: str) -> int:\n    # Write your solution here\n    pass`,
      Java: `public class Solution {\n    public int ${fn}(String s) {\n        // Write your solution here\n        return 0;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    int ${fn}(string s) {\n        // Write your solution here\n        return 0;\n    }\n};`,
      JavaScript: `function ${fn}(s) {\n    // Write your solution here\n    return 0;\n}`
    };
    solutionCode = {
      Python: `def ${fn}(s: str) -> int:\n    seen = set()\n    l = mx = 0\n    for r in range(len(s)):\n        while s[r] in seen:\n            seen.remove(s[l])\n            l += 1\n        seen.add(s[r])\n        mx = max(mx, r - l + 1)\n    return mx`,
      Java: `public class Solution {\n    public int ${fn}(String s) {\n        Set<Character> seen = new HashSet<>();\n        int l = 0, mx = 0;\n        for (int r = 0; r < s.length(); r++) {\n            while (seen.contains(s.charAt(r))) {\n                seen.remove(s.charAt(l++));\n            }\n            seen.add(s.charAt(r));\n            mx = Math.max(mx, r - l + 1);\n        }\n        return mx;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    int ${fn}(string s) {\n        unordered_set<char> seen;\n        int l = 0, mx = 0;\n        for (int r = 0; r < (int)s.length(); ++r) {\n            while (seen.count(s[r])) {\n                seen.erase(s[l++]);\n            }\n            seen.insert(s[r]);\n            mx = max(mx, r - l + 1);\n        }\n        return mx;\n    }\n};`,
      JavaScript: `function ${fn}(s) {\n    const seen = new Set();\n    let l = 0, mx = 0;\n    for (let r = 0; r < s.length; r++) {\n        while (seen.has(s[r])) {\n            seen.delete(s[l++]);\n        }\n        seen.add(s[r]);\n        mx = Math.max(mx, r - l + 1);\n    }\n    return mx;\n}`
    };
  }
  // 7. Matrix & 2D Grid
  else if (cat.includes('matrix') || t.includes('matrix') || t.includes('grid') || t.includes('islands')) {
    sampleInputs = ['[[1,2,3],[4,5,6],[7,8,9]]', '[[1,2,3,4],[5,6,7,8],[9,10,11,12]]', '[[1]]'];
    starterCode = {
      Python: `def ${fn}(matrix: List[List[int]]) -> List[int]:\n    # Write your solution here\n    pass`,
      Java: `public class Solution {\n    public List<Integer> ${fn}(int[][] matrix) {\n        // Write your solution here\n        return new ArrayList<>();\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    vector<int> ${fn}(vector<vector<int>>& matrix) {\n        // Write your solution here\n        return {};\n    }\n};`,
      JavaScript: `function ${fn}(matrix) {\n    // Write your solution here\n    return [];\n}`
    };
    solutionCode = {
      Python: `def ${fn}(matrix: List[List[int]]) -> List[int]:\n    if not matrix or not matrix[0]: return []\n    res = []\n    top, bottom, left, right = 0, len(matrix) - 1, 0, len(matrix[0]) - 1\n    while top <= bottom and left <= right:\n        for c in range(left, right + 1): res.append(matrix[top][c])\n        top += 1\n        for r in range(top, bottom + 1): res.append(matrix[r][right])\n        right -= 1\n        if top <= bottom:\n            for c in range(right, left - 1, -1): res.append(matrix[bottom][c])\n            bottom -= 1\n        if left <= right:\n            for r in range(bottom, top - 1, -1): res.append(matrix[r][left])\n            left += 1\n    return res`,
      Java: `public class Solution {\n    public List<Integer> ${fn}(int[][] matrix) {\n        List<Integer> res = new ArrayList<>();\n        if (matrix == null || matrix.length == 0) return res;\n        int top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;\n        while (top <= bottom && left <= right) {\n            for (int c = left; c <= right; c++) res.add(matrix[top][c]);\n            top++;\n            for (int r = top; r <= bottom; r++) res.add(matrix[r][right]);\n            right--;\n            if (top <= bottom) {\n                for (int c = right; c >= left; c--) res.add(matrix[bottom][c]);\n                bottom--;\n            }\n            if (left <= right) {\n                for (int r = bottom; r >= top; r--) res.add(matrix[r][left]);\n                left++;\n            }\n        }\n        return res;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    vector<int> ${fn}(vector<vector<int>>& matrix) {\n        vector<int> res;\n        if (matrix.empty() || matrix[0].empty()) return res;\n        int top = 0, bottom = matrix.size() - 1, left = 0, right = matrix[0].size() - 1;\n        while (top <= bottom && left <= right) {\n            for (int c = left; c <= right; ++c) res.push_back(matrix[top][c]);\n            top++;\n            for (int r = top; r <= bottom; ++r) res.push_back(matrix[r][right]);\n            right--;\n            if (top <= bottom) {\n                for (int c = right; c >= left; --c) res.push_back(matrix[bottom][c]);\n                bottom--;\n            }\n            if (left <= right) {\n                for (int r = bottom; r >= top; --r) res.push_back(matrix[r][left]);\n                left++;\n            }\n        }\n        return res;\n    }\n};`,
      JavaScript: `function ${fn}(matrix) {\n    if (!matrix || matrix.length === 0) return [];\n    const res = [];\n    let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;\n    while (top <= bottom && left <= right) {\n        for (let c = left; c <= right; c++) res.push(matrix[top][c]);\n        top++;\n        for (let r = top; r <= bottom; r++) res.push(matrix[r][right]);\n        right--;\n        if (top <= bottom) {\n            for (let c = right; c >= left; c--) res.push(matrix[bottom][c]);\n            bottom--;\n        }\n        if (left <= right) {\n            for (let r = bottom; r >= top; r--) res.push(matrix[r][left]);\n            left++;\n        }\n    }\n    return res;\n}`
    };
  }
  // 8. Intervals
  else if (cat.includes('interval') || t.includes('interval')) {
    sampleInputs = ['[[1,3],[2,6],[8,10],[15,18]]', '[[1,4],[4,5]]', '[[1,4],[2,3]]'];
    starterCode = {
      Python: `def ${fn}(intervals: List[List[int]]) -> List[List[int]]:\n    # Write your solution here\n    pass`,
      Java: `public class Solution {\n    public int[][] ${fn}(int[][] intervals) {\n        // Write your solution here\n        return new int[0][0];\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    vector<vector<int>> ${fn}(vector<vector<int>>& intervals) {\n        // Write your solution here\n        return {};\n    }\n};`,
      JavaScript: `function ${fn}(intervals) {\n    // Write your solution here\n    return [];\n}`
    };
    solutionCode = {
      Python: `def ${fn}(intervals: List[List[int]]) -> List[List[int]]:\n    if not intervals: return []\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    for cur in intervals[1:]:\n        prev = merged[-1]\n        if cur[0] <= prev[1]:\n            prev[1] = max(prev[1], cur[1])\n        else:\n            merged.append(cur)\n    return merged`,
      Java: `public class Solution {\n    public int[][] ${fn}(int[][] intervals) {\n        if (intervals.length == 0) return new int[0][0];\n        Arrays.sort(intervals, (a, b) -> Integer.compare(a[0], b[0]));\n        List<int[]> res = new ArrayList<>();\n        int[] cur = intervals[0];\n        res.add(cur);\n        for (int[] interval : intervals) {\n            if (interval[0] <= cur[1]) cur[1] = Math.max(cur[1], interval[1]);\n            else {\n                cur = interval;\n                res.add(cur);\n            }\n        }\n        return res.toArray(new int[res.size()][]);\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    vector<vector<int>> ${fn}(vector<vector<int>>& intervals) {\n        if (intervals.empty()) return {};\n        sort(intervals.begin(), intervals.end());\n        vector<vector<int>> merged = {intervals[0]};\n        for (size_t i = 1; i < intervals.size(); ++i) {\n            if (intervals[i][0] <= merged.back()[1]) merged.back()[1] = max(merged.back()[1], intervals[i][1]);\n            else merged.push_back(intervals[i]);\n        }\n        return merged;\n    }\n};`,
      JavaScript: `function ${fn}(intervals) {\n    if (!intervals || intervals.length === 0) return [];\n    intervals.sort((a, b) => a[0] - b[0]);\n    const res = [intervals[0]];\n    for (let i = 1; i < intervals.length; i++) {\n        const prev = res[res.length - 1];\n        if (intervals[i][0] <= prev[1]) prev[1] = Math.max(prev[1], intervals[i][1]);\n        else res.push(intervals[i]);\n    }\n    return res;\n}`
    };
  }
  // 9. Trees (Invert, Depth, LCA, Traversal)
  else if (cat.includes('tree') || t.includes('tree') || t.includes('root')) {
    sampleInputs = ['[4,2,7,1,3,6,9]', '[2,1,3]', '[1,null,2]'];
    starterCode = {
      Python: `def ${fn}(root: Optional[TreeNode]) -> Optional[TreeNode]:\n    # Write your solution here\n    pass`,
      Java: `public class Solution {\n    public TreeNode ${fn}(TreeNode root) {\n        // Write your solution here\n        return null;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    TreeNode* ${fn}(TreeNode* root) {\n        // Write your solution here\n        return nullptr;\n    }\n};`,
      JavaScript: `function ${fn}(root) {\n    // Write your solution here\n    return null;\n}`
    };
    solutionCode = {
      Python: `def ${fn}(root):\n    if not root: return None\n    root.left, root.right = ${fn}(root.right), ${fn}(root.left)\n    return root`,
      Java: `public class Solution {\n    public TreeNode ${fn}(TreeNode root) {\n        if (root == null) return null;\n        TreeNode left = ${fn}(root.left);\n        TreeNode right = ${fn}(root.right);\n        root.left = right;\n        root.right = left;\n        return root;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    TreeNode* ${fn}(TreeNode* root) {\n        if (!root) return nullptr;\n        TreeNode* left = ${fn}(root->left);\n        TreeNode* right = ${fn}(root->right);\n        root.left = right;\n        root.right = left;\n        return root;\n    }\n};`,
      JavaScript: `function ${fn}(root) {\n    if (!root) return null;\n    const left = ${fn}(root.left);\n    const right = ${fn}(root.right);\n    root.left = right;\n    root.right = left;\n    return root;\n}`
    };
  }
  // 10. Cycle Detection
  else if (t.includes('cycle')) {
    sampleInputs = ['[3,2,0,-4]', '[1,2]', '[1]'];
    starterCode = {
      Python: `def ${fn}(head: Optional[ListNode]) -> bool:\n    # Write your solution here\n    pass`,
      Java: `public class Solution {\n    public boolean ${fn}(ListNode head) {\n        // Write your solution here\n        return false;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    bool ${fn}(ListNode *head) {\n        // Write your solution here\n        return false;\n    }\n};`,
      JavaScript: `function ${fn}(head) {\n    // Write your solution here\n    return false;\n}`
    };
    solutionCode = {
      Python: `def ${fn}(head):\n    if not head or not head.next: return False\n    slow, fast = head, head.next\n    while slow != fast:\n        if not fast or not fast.next: return False\n        slow = slow.next\n        fast = fast.next.next\n    return True`,
      Java: `public class Solution {\n    public boolean ${fn}(ListNode head) {\n        if (head == null || head.next == null) return false;\n        ListNode slow = head, fast = head.next;\n        while (slow != fast) {\n            if (fast == null || fast.next == null) return false;\n            slow = slow.next;\n            fast = fast.next.next;\n        }\n        return true;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    bool ${fn}(ListNode *head) {\n        if (!head || !head->next) return false;\n        ListNode *slow = head, *fast = head->next;\n        while (slow != fast) {\n            if (!fast || !fast->next) return false;\n            slow = slow->next;\n            fast = fast->next->next;\n        }\n        return true;\n    }\n};`,
      JavaScript: `function ${fn}(head) {\n    if (!head || !head.next) return false;\n    let slow = head, fast = head.next;\n    while (slow !== fast) {\n        if (!fast || !fast.next) return false;\n        slow = slow.next;\n        fast = fast.next.next;\n    }\n    return true;\n}`
    };
  }
  // 11. Linked Lists
  else if (cat.includes('linked list') || t.includes('linked list') || t.includes('list node')) {
    sampleInputs = ['[1,2,3,4,5]', '[1,2]', '[1]'];
    starterCode = {
      Python: `def ${fn}(head: Optional[ListNode]) -> Optional[ListNode]:\n    # Write your solution here\n    pass`,
      Java: `public class Solution {\n    public ListNode ${fn}(ListNode head) {\n        // Write your solution here\n        return null;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    ListNode* ${fn}(ListNode* head) {\n        // Write your solution here\n        return nullptr;\n    }\n};`,
      JavaScript: `function ${fn}(head) {\n    // Write your solution here\n    return null;\n}`
    };
    solutionCode = {
      Python: `def ${fn}(head):\n    prev, curr = None, head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev`,
      Java: `public class Solution {\n    public ListNode ${fn}(ListNode head) {\n        ListNode prev = null, curr = head;\n        while (curr != null) {\n            ListNode nxt = curr.next;\n            curr.next = prev;\n            prev = curr;\n            curr = nxt;\n        }\n        return prev;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    ListNode* ${fn}(ListNode* head) {\n        ListNode *prev = nullptr, *curr = head;\n        while (curr) {\n            ListNode* nxt = curr->next;\n            curr->next = prev;\n            prev = curr;\n            curr = nxt;\n        }\n        return prev;\n    }\n};`,
      JavaScript: `function ${fn}(head) {\n    let prev = null, curr = head;\n    while (curr) {\n        const nxt = curr.next;\n        curr.next = prev;\n        prev = curr;\n        curr = nxt;\n    }\n    return prev;\n}`
    };
  }
  // 11. Stacks & Valid Parentheses
  else if (cat.includes('stack') || t.includes('parentheses') || t.includes('stack')) {
    sampleInputs = ['"()"', '"()[]{}"', '"(]"'];
    starterCode = {
      Python: `def ${fn}(s: str) -> bool:\n    # Write your solution here\n    pass`,
      Java: `public class Solution {\n    public boolean ${fn}(String s) {\n        // Write your solution here\n        return false;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    bool ${fn}(string s) {\n        // Write your solution here\n        return false;\n    }\n};`,
      JavaScript: `function ${fn}(s) {\n    // Write your solution here\n    return false;\n}`
    };
    solutionCode = {
      Python: `def ${fn}(s: str) -> bool:\n    st = []\n    mp = {')': '(', '}': '{', ']': '['}\n    for c in s:\n        if c in mp:\n            if not st or st[-1] != mp[c]: return False\n            st.pop()\n        else: st.append(c)\n    return not st`,
      Java: `public class Solution {\n    public boolean ${fn}(String s) {\n        Deque<Character> st = new ArrayDeque<>();\n        for (char c : s.toCharArray()) {\n            if (c == '(' || c == '[' || c == '{') st.push(c);\n            else {\n                if (st.isEmpty()) return false;\n                char t = st.pop();\n                if ((c == ')' && t != '(') || (c == ']' && t != '[') || (c == '}' && t != '{')) return false;\n            }\n        }\n        return st.isEmpty();\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    bool ${fn}(string s) {\n        stack<char> st;\n        for (char c : s) {\n            if (c == '(' || c == '[' || c == '{') st.push(c);\n            else {\n                if (st.empty()) return false;\n                char t = st.top(); st.pop();\n                if ((c == ')' && t != '(') || (c == ']' && t != '[') || (c == '}' && t != '{')) return false;\n            }\n        }\n        return st.empty();\n    }\n};`,
      JavaScript: `function ${fn}(s) {\n    const st = [], map = { ')': '(', ']': '[', '}': '{' };\n    for (const c of s) {\n        if (['(', '[', '{'].includes(c)) st.push(c);\n        else if (st.pop() !== map[c]) return false;\n    }\n    return st.length === 0;\n}`
    };
  }
  // 12. Dynamic Programming / Single Number / Default Array
  else {
    sampleInputs = ['[1,2,3,1]', '[1,2,3,4]', '[1,1,1,3,3,4,3,2,4,2]'];
    starterCode = {
      Python: `def ${fn}(nums: List[int]) -> bool:\n    # Write your solution here\n    pass`,
      Java: `public class Solution {\n    public boolean ${fn}(int[] nums) {\n        // Write your solution here\n        return false;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    bool ${fn}(vector<int>& nums) {\n        // Write your solution here\n        return false;\n    }\n};`,
      JavaScript: `function ${fn}(nums) {\n    // Write your solution here\n    return false;\n}`
    };
    solutionCode = {
      Python: `def ${fn}(nums: List[int]) -> bool:\n    seen = set()\n    for x in nums:\n        if x in seen: return True\n        seen.add(x)\n    return False`,
      Java: `public class Solution {\n    public boolean ${fn}(int[] nums) {\n        Set<Integer> seen = new HashSet<>();\n        for (int x : nums) {\n            if (seen.contains(x)) return true;\n            seen.add(x);\n        }\n        return false;\n    }\n}`,
      Cpp: `class Solution {\npublic:\n    bool ${fn}(vector<int>& nums) {\n        unordered_set<int> seen;\n        for (int x : nums) {\n            if (seen.count(x)) return true;\n            seen.insert(x);\n        }\n        return false;\n    }\n};`,
      JavaScript: `function ${fn}(nums) {\n    const seen = new Set();\n    for (const x of nums) {\n        if (seen.has(x)) return true;\n        seen.add(x);\n    }\n    return false;\n}`
    };
  }

  // Generate dynamic testcases by running JS solution
  const testCases = sampleInputs.map((inp, idx) => {
    const expectedOut = executeJsSolution(solutionCode.JavaScript, inp);
    return {
      id: idx + 1,
      input: inp,
      expected: expectedOut,
      isPublic: true
    };
  });

  const resolved = {
    approach,
    complexity: pattern.complexity || { time: timeComp, space: spaceComp },
    description: `Given the input parameters according to the **${questionTitle}** problem specification, write an optimal algorithm to solve the task efficiently.\n\n${approach}`,
    examples: testCases.slice(0, 2).map((tc, idx) => ({
      input: tc.input.replace('\n', ', '),
      output: tc.expected,
      explanation: `Validates test case #${idx + 1} matching ${pattern.name || 'the problem requirement'}.`
    })),
    constraints: [
      `1 <= input size <= 10⁵`,
      `Time Complexity: ${timeComp}`,
      `Space Complexity: ${spaceComp}`,
    ],
    testCases,
    starterCode: question.starterCode || starterCode,
    solutionCode: question.solutionCode || solutionCode,
  };

  RESOLVED_PROBLEM_CACHE[questionTitle] = resolved;
  return resolved;
}

