"""
Pattern Manager — Adaptive DSA Pattern-based Question Sequencer.

Defines the 8 core DSA patterns and controls which pattern is tested next
based on the candidate's performance on the previous pattern.

Pattern Sequence (default):
  1. HashMap
  2. Two Pointers
  3. Sliding Window
  4. Binary Search
  5. Stack
  6. Linked List
  7. Tree & Recursion
  8. BFS/DFS
  9. Dynamic Programming

Adaptive Logic:
  - Score >= 80  → Move to next pattern (candidate is strong here)
  - Score 60–79  → Stay in pattern: give one harder problem in same pattern
  - Score < 60   → Mark as weakness; give a hint problem, then move on
                   (don't block the whole session on one pattern)
"""

from typing import List, Dict, Optional
from app.services import problem_db


# ── Canonical Pattern Definitions ─────────────────────────────────────────────

PATTERNS: List[Dict] = [
    {
        "id":          "HashMap",
        "name":        "HashMap & Hashing",
        "description": "Use a hash map or set to achieve O(1) lookups, count frequencies, or detect duplicates in O(n).",
        "keyInsight":  "If you need to look something up quickly, a HashMap can often turn O(n²) into O(n).",
        "difficulty":  "Beginner",
        "order":       1,
        "problems":    ["contains-duplicate", "two-sum", "top-k-frequent-elements", "group-anagrams"],
    },
    {
        "id":          "Two Pointers",
        "name":        "Two Pointers",
        "description": "Use two indices moving towards each other (or both moving in the same direction) to solve problems in O(n) instead of O(n²).",
        "keyInsight":  "Sorting first + two pointers often eliminates the need for a nested loop.",
        "difficulty":  "Beginner",
        "order":       2,
        "problems":    ["valid-palindrome", "3sum"],
    },
    {
        "id":          "Sliding Window",
        "name":        "Sliding Window",
        "description": "Maintain a window over a subarray or substring, expanding and shrinking it to track the optimal answer.",
        "keyInsight":  "Any subarray/substring problem with a 'maximum' or 'minimum' constraint is likely a sliding window.",
        "difficulty":  "Beginner",
        "order":       3,
        "problems":    ["best-time-to-buy-sell-stock", "max-sum-subarray-k", "longest-substring-without-repeating"],
    },
    {
        "id":          "Binary Search",
        "name":        "Binary Search",
        "description": "Eliminate half the search space each iteration by comparing with the midpoint. Works on any sorted or monotonic space.",
        "keyInsight":  "Any time you see O(log n) and a sorted input — think binary search.",
        "difficulty":  "Intermediate",
        "order":       4,
        "problems":    ["binary-search"],
    },
    {
        "id":          "Stack",
        "name":        "Stack",
        "description": "Use a stack for problems that require tracking the most recent element, matching pairs, or monotonic sequences.",
        "keyInsight":  "If the problem involves nested structure or 'last in, first out' ordering — use a Stack.",
        "difficulty":  "Intermediate",
        "order":       5,
        "problems":    ["valid-parentheses"],
    },
    {
        "id":          "Linked List",
        "name":        "Linked List",
        "description": "Pointer manipulation — fast/slow pointers, reversal, merging, and cycle detection.",
        "keyInsight":  "Floyd's tortoise-and-hare algorithm: fast pointer moves 2x, slow moves 1x. If they meet, there is a cycle.",
        "difficulty":  "Intermediate",
        "order":       6,
        "problems":    ["linked-list-cycle"],
    },
    {
        "id":          "Tree & Recursion",
        "name":        "Tree & Recursion",
        "description": "Recursive tree traversal (DFS pre/in/post-order, BFS level-order) to solve tree problems elegantly.",
        "keyInsight":  "Most tree problems can be solved by: process current node + recurse on left + recurse on right.",
        "difficulty":  "Intermediate",
        "order":       7,
        "problems":    ["max-depth-binary-tree", "invert-binary-tree"],
    },
    {
        "id":          "BFS/DFS",
        "name":        "BFS / DFS on Graphs",
        "description": "Breadth-first and depth-first traversal on implicit or explicit graphs, matrices, and directed/undirected graphs.",
        "keyInsight":  "BFS gives shortest path. DFS gives connected components, cycle detection, topological sort.",
        "difficulty":  "Advanced",
        "order":       8,
        "problems":    ["number-of-islands", "course-schedule"],
    },
    {
        "id":          "Dynamic Programming",
        "name":        "Dynamic Programming",
        "description": "Break a problem into overlapping subproblems and cache results to avoid recomputation.",
        "keyInsight":  "If the problem asks for 'minimum', 'maximum', 'count of ways', or 'can you achieve X' — consider DP.",
        "difficulty":  "Advanced",
        "order":       9,
        "problems":    ["climbing-stairs", "coin-change", "longest-common-subsequence"],
    },
]

_PATTERN_INDEX: Dict[str, Dict] = {p["id"]: p for p in PATTERNS}


# ── Public API ─────────────────────────────────────────────────────────────────

def get_all_patterns() -> List[Dict]:
    """Return all pattern definitions ordered by difficulty progression."""
    return sorted(PATTERNS, key=lambda p: p["order"])


def get_pattern(pattern_id: str) -> Optional[Dict]:
    return _PATTERN_INDEX.get(pattern_id)


def get_pattern_sequence(difficulty: str = "Mixed") -> List[str]:
    """
    Return ordered list of pattern IDs for a session.
    - Easy: first 4 patterns only
    - Hard: all patterns
    - Mixed: all patterns
    """
    ordered = sorted(PATTERNS, key=lambda p: p["order"])
    if difficulty == "Easy":
        ordered = [p for p in ordered if p["difficulty"] == "Beginner"]
    elif difficulty == "Hard":
        pass   # all
    # return the IDs
    return [p["id"] for p in ordered]


def get_next_problem_for_pattern(
    pattern_id: str,
    already_seen: List[str],
    prefer_difficulty: str = "Easy",
) -> Optional[Dict]:
    """
    Pick the next unseen problem for the given pattern.
    Prefers the requested difficulty level; falls back to any unseen problem.
    """
    candidates = problem_db.get_problems_by_pattern(pattern_id, exclude_ids=already_seen)
    if not candidates:
        return None

    # Sort by difficulty: Easy < Medium < Hard
    _order = {"Easy": 0, "Medium": 1, "Hard": 2}
    candidates.sort(key=lambda p: _order.get(p.get("difficulty", "Easy"), 1))

    if prefer_difficulty == "Easy":
        return candidates[0]
    elif prefer_difficulty == "Hard":
        return candidates[-1]
    else:
        # Medium: prefer middle difficulty
        medium = [p for p in candidates if p.get("difficulty") == "Medium"]
        return medium[0] if medium else candidates[0]


def decide_next_action(
    pattern_id: str,
    pattern_score: float,     # 0.0 – 100.0
    already_seen: List[str],
) -> Dict:
    """
    Decide what to do after a candidate submits for a given pattern.

    Returns:
      { "action": "next_pattern" | "harder_problem" | "hint_and_move",
        "message": "<message to show candidate>",
        "next_problem": <problem dict or None>,
        "next_pattern": <pattern_id or None> }
    """
    pattern = _PATTERN_INDEX.get(pattern_id, {})
    pattern_name = pattern.get("name", pattern_id)
    key_insight   = pattern.get("keyInsight", "")

    if pattern_score >= 80:
        return {
            "action":       "next_pattern",
            "message":      f"Strong performance on {pattern_name}. Moving to the next pattern.",
            "next_problem": None,
            "next_pattern": _get_next_pattern_id(pattern_id),
        }
    elif pattern_score >= 60:
        # Give one harder problem in the same pattern
        next_p = get_next_problem_for_pattern(pattern_id, already_seen, prefer_difficulty="Medium")
        if next_p:
            return {
                "action":       "harder_problem",
                "message":      f"Good start on {pattern_name}. Let's try a slightly harder problem in the same pattern to confirm your understanding.",
                "next_problem": next_p,
                "next_pattern": None,
            }
        else:
            # No more problems in this pattern — move on
            return {
                "action":       "next_pattern",
                "message":      f"Good work on {pattern_name}. Moving to the next pattern.",
                "next_problem": None,
                "next_pattern": _get_next_pattern_id(pattern_id),
            }
    else:
        # Score < 60 — mark as weakness, show insight, move on
        return {
            "action":       "hint_and_move",
            "message":      (
                f"This is a weakness area: {pattern_name}. "
                f"Key insight to remember: {key_insight} "
                f"We will continue and revisit this pattern in your practice recommendations."
            ),
            "next_problem": None,
            "next_pattern": _get_next_pattern_id(pattern_id),
        }


def build_pattern_session(
    difficulty: str = "Mixed",
    patterns_requested: List[str] = None,
) -> List[Dict]:
    """
    Build a full pattern-ordered session: one problem per pattern.
    Returns list of { pattern, problem } dicts.
    """
    sequence = patterns_requested or get_pattern_sequence(difficulty)
    session  = []

    for pat_id in sequence:
        problems = problem_db.get_problems_by_pattern(pat_id)
        if not problems:
            continue
        # Pick the easiest for the opening problem of each pattern
        _order = {"Easy": 0, "Medium": 1, "Hard": 2}
        problems.sort(key=lambda p: _order.get(p.get("difficulty", "Easy"), 1))
        prob = problems[0]
        session.append({
            "pattern":     pat_id,
            "patternName": _PATTERN_INDEX.get(pat_id, {}).get("name", pat_id),
            "keyInsight":  _PATTERN_INDEX.get(pat_id, {}).get("keyInsight", ""),
            "problem":     {k: v for k, v in prob.items() if k != "hiddenTests"},
        })

    return session


# ── Internal helpers ───────────────────────────────────────────────────────────

def _get_next_pattern_id(current_pattern_id: str) -> Optional[str]:
    ordered = sorted(PATTERNS, key=lambda p: p["order"])
    ids = [p["id"] for p in ordered]
    try:
        idx = ids.index(current_pattern_id)
        return ids[idx + 1] if idx + 1 < len(ids) else None
    except ValueError:
        return None
