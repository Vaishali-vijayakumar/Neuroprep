/**
 * LeetCode-Standard Compiler & Execution Engine
 * Primary Engine: Judge0 CE (The Open-Source Online Judge standard used by LeetCode)
 * Secondary Engine: Wandbox Production Compiler API
 * Offline / Fallback Engine: In-Browser Client-Side Evaluator & Web Worker Sandbox
 * 
 * Supports:
 * - Python 3 (CPython with List, Dict, TreeNode, ListNode, collections, heapq, itertools, etc.)
 * - C++ (GCC with STL containers, <algorithm>, <unordered_map>, TreeNode, ListNode)
 * - Java (OpenJDK with Reflection Driver, Arrays, List, Map, TreeNode, ListNode)
 * - JavaScript / TypeScript (Node.js & V8 sandbox)
 * - C, Go, Rust
 */

// ── Judge0 Language IDs ──────────────────────────────────────────────────────
const JUDGE0_LANG_IDS = {
  python:     71, // Python 3.8.1 / 3.11
  python3:    71,
  py:         71,
  cpp:        54, // C++ (GCC 9.2.0)
  'c++':      54,
  c:          50, // C (GCC 9.2.0)
  java:       62, // Java (OpenJDK 13.0.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  js:         63,
  typescript: 74, // TypeScript (3.7.4)
  ts:         74,
  go:         60, // Go (1.13.5)
  rust:       73, // Rust (1.40.0)
};

// ── Wandbox Compiler Fallback Map ───────────────────────────────────────────
const WANDBOX_COMPILER_MAP = {
  python:     { compiler: 'cpython-3.12.7', name: 'Python 3.12 (CPython)' },
  python3:    { compiler: 'cpython-3.12.7', name: 'Python 3.12 (CPython)' },
  py:         { compiler: 'cpython-3.12.7', name: 'Python 3.12 (CPython)' },
  cpp:        { compiler: 'gcc-13.2.0',     name: 'C++ (GCC 13.2)' },
  'c++':      { compiler: 'gcc-13.2.0',     name: 'C++ (GCC 13.2)' },
  c:          { compiler: 'gcc-13.2.0',     name: 'C (GCC 13.2)' },
  java:       { compiler: 'openjdk-jdk-21+35', name: 'Java (OpenJDK 21)' },
  javascript: { compiler: 'nodejs-20.17.0', name: 'JavaScript (Node.js 20)' },
  js:         { compiler: 'nodejs-20.17.0', name: 'JavaScript (Node.js 20)' },
  typescript: { compiler: 'nodejs-20.17.0', name: 'TypeScript / Node.js' },
  ts:         { compiler: 'nodejs-20.17.0', name: 'TypeScript / Node.js' },
  go:         { compiler: 'go-1.22.2',      name: 'Go 1.22' },
  rust:       { compiler: 'rust-1.77.2',    name: 'Rust 1.77' },
};

// ── Base64 UTF-8 Helpers (Universal Browser & Node Safe) ─────────────────────
function utf8ToBase64(str) {
  if (typeof window !== 'undefined' && window.btoa) {
    return window.btoa(unescape(encodeURIComponent(str)));
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64');
  }
  return btoa(unescape(encodeURIComponent(str)));
}

function base64ToUtf8(b64) {
  if (!b64) return '';
  if (typeof window !== 'undefined' && window.atob) {
    return decodeURIComponent(escape(window.atob(b64)));
  }
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(b64, 'base64').toString('utf-8');
  }
  return decodeURIComponent(escape(atob(b64)));
}

// ── 1. Python LeetCode Test Harness ──────────────────────────────────────────
export function wrapPythonCode(code, stdin = '') {
  const pyImports = `from __future__ import annotations
import sys, os, math, json, ast, heapq, bisect, random, collections
from collections import deque, defaultdict, Counter, OrderedDict
from itertools import permutations, combinations, product, accumulate
from functools import lru_cache, cmp_to_key, reduce
from typing import List, Dict, Tuple, Set, Optional, Any, Union, Iterable

# LeetCode Common Data Structures
class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
`;

  if (code.includes('if __name__ ==') || (code.includes('print(') && !code.includes('class Solution') && !code.includes('def '))) {
    return `${pyImports}\n${code}`;
  }

  const stdinEscaped = JSON.stringify(stdin || '');

  return `${pyImports}

${code}

# ── LeetCode Dynamic Test Runner Harness ──────────────────────────────────────
def _split_smart(s):
    items = []
    curr = []
    depth = 0
    in_str = False
    str_char = ''
    for ch in s:
        if in_str:
            curr.append(ch)
            if ch == str_char:
                in_str = False
        elif ch in ('"', "'"):
            in_str = True
            str_char = ch
            curr.append(ch)
        elif ch in ('[', '{', '('):
            depth += 1
            curr.append(ch)
        elif ch in (']', '}', ')'):
            depth = max(0, depth - 1)
            curr.append(ch)
        elif (ch == ',' or ch == '\\n' or ch == ';') and depth == 0:
            part = "".join(curr).strip()
            if part:
                items.append(part)
            curr = []
        else:
            curr.append(ch)
    part = "".join(curr).strip()
    if part:
        items.append(part)
    return items

def _parse_arg(raw):
    raw = raw.strip()
    param_name = ''
    if '=' in raw and not (raw.startswith('[') or raw.startswith('{') or raw.startswith('"') or raw.startswith("'")):
        parts = raw.split('=', 1)
        param_name = parts[0].strip().lower()
        raw = parts[1].strip()
    
    val = raw
    try:
        val = json.loads(raw)
    except:
        try:
            val = ast.literal_eval(raw)
        except:
            if raw.lower() == 'true': val = True
            elif raw.lower() == 'false': val = False
            elif raw.lower() in ('null', 'none'): val = None
            else:
                try:
                    if '.' in raw: val = float(raw)
                    else: val = int(raw)
                except:
                    val = raw.strip('"\\'')
    return param_name, val

def _build_linked_list(vals, pos=-1):
    if not vals or not isinstance(vals, (list, tuple)):
        return None
    nodes = [ListNode(v) for v in vals]
    for i in range(len(nodes) - 1):
        nodes[i].next = nodes[i + 1]
    if pos is not None and isinstance(pos, int) and 0 <= pos < len(nodes):
        nodes[-1].next = nodes[pos]
    return nodes[0] if nodes else None

def _build_tree(vals):
    if not vals or not isinstance(vals, (list, tuple)) or vals[0] is None:
        return None
    root = TreeNode(vals[0])
    queue = deque([root])
    i = 1
    while queue and i < len(vals):
        node = queue.popleft()
        if i < len(vals) and vals[i] is not None:
            node.left = TreeNode(vals[i])
            queue.append(node.left)
        i += 1
        if i < len(vals) and vals[i] is not None:
            node.right = TreeNode(vals[i])
            queue.append(node.right)
        i += 1
    return root

def _to_json(obj):
    if isinstance(obj, (bool, int, float, str)) or obj is None:
        return json.dumps(obj, separators=(',', ':'))
    if isinstance(obj, ListNode):
        res = []
        curr = obj
        seen = set()
        while curr and id(curr) not in seen:
            seen.add(id(curr))
            res.append(curr.val)
            curr = curr.next
        return json.dumps(res, separators=(',', ':'))
    if isinstance(obj, TreeNode):
        res = []
        queue = deque([obj])
        while queue:
            node = queue.popleft()
            if node:
                res.append(node.val)
                queue.append(node.left)
                queue.append(node.right)
            else:
                res.append(None)
        while res and res[-1] is None:
            res.pop()
        return json.dumps(res, separators=(',', ':'))
    if isinstance(obj, (list, dict, tuple)):
        return json.dumps(obj, separators=(',', ':'))
    return str(obj)

def _run_leetcode():
    raw = ${stdinEscaped}.strip()
    parsed_items = []
    if raw:
        raw_parts = _split_smart(raw)
        for part in raw_parts:
            parsed_items.append(_parse_arg(part))
    
    pos_val = -1
    for p_name, val in parsed_items:
        if p_name == 'pos' and isinstance(val, int):
            pos_val = val
    if pos_val == -1 and len(parsed_items) == 2 and isinstance(parsed_items[0][1], list) and isinstance(parsed_items[1][1], int):
        pos_val = parsed_items[1][1]
        args_list = [parsed_items[0][1]]
    else:
        args_list = [val for p_name, val in parsed_items if p_name != 'pos']
    
    fn = None
    if 'Solution' in globals():
        sol = Solution()
        methods = [m for m in dir(sol) if not m.startswith('_') and callable(getattr(sol, m))]
        if methods:
            fn = getattr(sol, methods[0])
    else:
        user_funcs = [v for k, v in list(globals().items()) if callable(v) and not k.startswith('_') and getattr(v, '__module__', '') == '__main__' and k not in ('_parse_arg', '_to_json', '_run_leetcode', '_split_smart', '_build_linked_list', '_build_tree', 'ListNode', 'TreeNode')]
        if user_funcs:
            fn = user_funcs[-1]
    
    if not fn:
        return

    import inspect
    sig = inspect.signature(fn)
    params = list(sig.parameters.values())

    is_linked_list = any('listnode' in str(p.annotation).lower() or p.name.lower() in ('head', 'node') for p in params)

    pos_val = -1
    for p_name, val in parsed_items:
        if p_name == 'pos' and isinstance(val, int):
            pos_val = val
    if is_linked_list and pos_val == -1 and len(parsed_items) == 2 and isinstance(parsed_items[0][1], list) and isinstance(parsed_items[1][1], int) and len(params) == 1:
        pos_val = parsed_items[1][1]
        args_list = [parsed_items[0][1]]
    else:
        args_list = [val for p_name, val in parsed_items if p_name != 'pos']

    converted_args = []
    arg_idx = 0

    for p in params:
        p_name = p.name.lower()
        p_anno = str(p.annotation).lower() if p.annotation != inspect.Parameter.empty else ''
        
        is_list_node = 'listnode' in p_anno or p_name in ('head', 'node', 'l1', 'l2', 'list1', 'list2', 'p1', 'p2', 'head1', 'head2')
        is_tree_node = 'treenode' in p_anno or p_name in ('root', 'tree', 'p', 'q', 'subroot')

        if arg_idx < len(args_list):
            val = args_list[arg_idx]
            if is_list_node and isinstance(val, (list, tuple)):
                converted_args.append(_build_linked_list(val, pos_val))
            elif is_tree_node and isinstance(val, (list, tuple)):
                converted_args.append(_build_tree(val))
            else:
                converted_args.append(val)
            arg_idx += 1
        elif is_list_node:
            converted_args.append(None)
        elif is_tree_node:
            converted_args.append(None)

    res = fn(*converted_args)
    if res is not None:
        print(_to_json(res))

if __name__ == '__main__':
    _run_leetcode()
`;
}

// ── 2. JavaScript / Node.js LeetCode Test Harness ─────────────────────────────
export function wrapJsCode(code, stdin = '') {
  if (code.includes('console.log(') && !code.includes('function ') && !code.includes('class ') && !code.includes('=>')) {
    return code;
  }
  const stdinEscaped = JSON.stringify(stdin || '');

  return `
// LeetCode Common Data Structures
class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}

class TreeNode {
  constructor(val = 0, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}

${code}

// ── LeetCode Dynamic Test Runner Harness ──────────────────────────────────────
function _splitSmart(s) {
  const items = [];
  let curr = '';
  let depth = 0;
  let inStr = false;
  let strChar = '';
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (inStr) {
      curr += ch;
      if (ch === strChar) inStr = false;
    } else if (ch === '"' || ch === "'") {
      inStr = true;
      strChar = ch;
      curr += ch;
    } else if (ch === '[' || ch === '{' || ch === '(') {
      depth++;
      curr += ch;
    } else if (ch === ']' || ch === '}' || ch === ')') {
      depth = Math.max(0, depth - 1);
      curr += ch;
    } else if ((ch === ',' || ch === '\\n' || ch === ';') && depth === 0) {
      const part = curr.trim();
      if (part) items.push(part);
      curr = '';
    } else {
      curr += ch;
    }
  }
  const part = curr.trim();
  if (part) items.push(part);
  return items;
}

function _parseVal(raw) {
  raw = (raw || '').trim();
  let paramName = '';
  if (raw.includes('=') && !raw.startsWith('[') && !raw.startsWith('{') && !raw.startsWith('"') && !raw.startsWith("'")) {
    const parts = raw.split('=');
    paramName = parts[0].trim().toLowerCase();
    raw = parts[1].trim();
  }
  let val = raw;
  try { val = JSON.parse(raw); } catch(e) {
    if (raw.toLowerCase() === 'true') val = true;
    else if (raw.toLowerCase() === 'false') val = false;
    else if (raw.toLowerCase() === 'null') val = null;
    else if (/^-?\\d+$/.test(raw)) val = parseInt(raw, 10);
    else if (/^-?\\d+\\.\\d+$/.test(raw)) val = parseFloat(raw);
    else val = raw.replace(/^['"]|['"]$/g, '');
  }
  return { paramName, val };
}

function _buildLinkedList(vals, pos = -1) {
  if (!vals || !Array.isArray(vals) || vals.length === 0) return null;
  const nodes = vals.map(v => new ListNode(v));
  for (let i = 0; i < nodes.length - 1; i++) {
    nodes[i].next = nodes[i + 1];
  }
  if (typeof pos === 'number' && pos >= 0 && pos < nodes.length) {
    nodes[nodes.length - 1].next = nodes[pos];
  }
  return nodes[0];
}

function _buildTree(vals) {
  if (!vals || !Array.isArray(vals) || vals.length === 0 || vals[0] == null) return null;
  const root = new TreeNode(vals[0]);
  const queue = [root];
  let i = 1;
  while (queue.length > 0 && i < vals.length) {
    const node = queue.shift();
    if (i < vals.length && vals[i] != null) {
      node.left = new TreeNode(vals[i]);
      queue.push(node.left);
    }
    i++;
    if (i < vals.length && vals[i] != null) {
      node.right = new TreeNode(vals[i]);
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

function _toJson(obj) {
  if (obj === undefined) return '';
  if (obj === null || typeof obj === 'boolean' || typeof obj === 'number' || typeof obj === 'string') {
    return JSON.stringify(obj);
  }
  if (obj instanceof ListNode) {
    const res = [];
    let curr = obj;
    const seen = new Set();
    while (curr && !seen.has(curr)) {
      seen.add(curr);
      res.push(curr.val);
      curr = curr.next;
    }
    return JSON.stringify(res);
  }
  if (obj instanceof TreeNode) {
    const res = [];
    const queue = [obj];
    while (queue.length > 0) {
      const node = queue.shift();
      if (node) {
        res.push(node.val);
        queue.push(node.left);
        queue.push(node.right);
      } else {
        res.push(null);
      }
    }
    while (res.length > 0 && res[res.length - 1] === null) {
      res.pop();
    }
    return JSON.stringify(res);
  }
  return JSON.stringify(obj);
}

try {
  const rawInput = ${stdinEscaped}.trim();
  const parsedItems = [];
  if (rawInput) {
    const parts = _splitSmart(rawInput);
    for (const part of parts) {
      parsedItems.push(_parseVal(part));
    }
  }
  let targetFn = null;
  if (typeof Solution === 'function') {
    try {
      const inst = new Solution();
      const proto = Object.getOwnPropertyNames(Object.getPrototypeOf(inst));
      const method = proto.find(p => p !== 'constructor' && typeof inst[p] === 'function');
      if (method) {
        targetFn = (...a) => inst[method](...a);
      }
    } catch(e) {}
  }

  if (!targetFn) {
    const fnNames = [...${JSON.stringify(code)}.matchAll(/(?:function\\s+([a-zA-Z0-9_$]+)|(?:var|let|const)\\s+([a-zA-Z0-9_$]+)\\s*=\\s*(?:function|\\([^)]*\\)\\s*=>))/g)]
      .map(m => m[1] || m[2])
      .filter(Boolean);
    
    for (let i = fnNames.length - 1; i >= 0; i--) {
      try {
        const f = eval(fnNames[i]);
        if (typeof f === 'function') { targetFn = f; break; }
      } catch(e) {}
    }
  }

  if (targetFn) {
    const fnStr = targetFn.toString();
    const isLinkedList = /head|node|list|hasCycle|reverseList|middleNode|mergeTwoLists/.test(fnStr) || /ListNode/.test(${JSON.stringify(code)});
    const isTree = /root|tree|TreeNode|maxDepth|isSameTree|levelOrder/.test(fnStr) || /TreeNode/.test(${JSON.stringify(code)});

    let posVal = -1;
    for (const item of parsedItems) {
      if (item.paramName === 'pos' && typeof item.val === 'number') {
        posVal = item.val;
      }
    }
    if (isLinkedList && posVal === -1 && parsedItems.length === 2 && Array.isArray(parsedItems[0].val) && typeof parsedItems[1].val === 'number') {
      posVal = parsedItems[1].val;
    }
    const rawArgs = parsedItems.filter((item, idx) => item.paramName !== 'pos' && !(isLinkedList && posVal !== -1 && idx === 1 && typeof item.val === 'number' && parsedItems.length === 2)).map(item => item.val);

    const convertedArgs = rawArgs.map((arg, idx) => {
      if (Array.isArray(arg)) {
        if (isLinkedList && (idx === 0 || rawArgs.length <= 2)) {
          return _buildLinkedList(arg, posVal);
        }
        if (isTree && (idx === 0 || rawArgs.length <= 2)) {
          return _buildTree(arg);
        }
      }
      return arg;
    });

    const res = targetFn(...convertedArgs);
    if (res !== undefined) {
      console.log(_toJson(res));
    }
  }
} catch(err) {
  console.error(err.message);
}
`;
}

// ── 3. Java LeetCode Test Harness ─────────────────────────────────────────────
export function wrapJavaCode(code, stdin = '') {
  if (code.includes('public static void main') && code.includes('class Main')) {
    return code;
  }

  const cleanCode = code.replace(/public\s+class\s+([A-Za-z0-9_]+)/g, 'class $1');
  const stdinEscaped = JSON.stringify(stdin || '');

  return `
import java.util.*;
import java.io.*;
import java.lang.reflect.*;
import java.math.*;
import java.util.stream.*;
import java.util.regex.*;

class ListNode {
    public int val;
    public ListNode next;
    public ListNode() {}
    public ListNode(int val) { this.val = val; }
    public ListNode(int val, ListNode next) { this.val = val; this.next = next; }
}

class TreeNode {
    public int val;
    public TreeNode left;
    public TreeNode right;
    public TreeNode() {}
    public TreeNode(int val) { this.val = val; }
    public TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
}

${cleanCode}

public class Main {
    static List<String> splitSmart(String s) {
        List<String> items = new ArrayList<>();
        StringBuilder curr = new StringBuilder();
        int depth = 0;
        boolean inStr = false;
        char strChar = ' ';
        for (int i = 0; i < s.length(); i++) {
            char ch = s.charAt(i);
            if (inStr) {
                curr.append(ch);
                if (ch == strChar) inStr = false;
            } else if (ch == '"' || ch == '\\'') {
                inStr = true;
                strChar = ch;
                curr.append(ch);
            } else if (ch == '[' || ch == '{' || ch == '(') {
                depth++;
                curr.append(ch);
            } else if (ch == ']' || ch == '}' || ch == ')') {
                depth = Math.max(0, depth - 1);
                curr.append(ch);
            } else if ((ch == ',' || ch == '\\n' || ch == ';') && depth == 0) {
                String part = curr.toString().trim();
                if (!part.isEmpty()) items.add(part);
                curr = new StringBuilder();
            } else {
                curr.append(ch);
            }
        }
        String part = curr.toString().trim();
        if (!part.isEmpty()) items.add(part);
        return items;
    }

    static int safeInt(String s) {
        if (s == null) return 0;
        String clean = s.replaceAll("[^0-9-]", "").trim();
        if (clean.isEmpty() || clean.equals("-")) return 0;
        try { return Integer.parseInt(clean); } catch (Exception e) { return 0; }
    }

    static ListNode buildLinkedList(String s, int pos) {
        String clean = s.replace("[", "").replace("]", "").trim();
        if (clean.isEmpty()) return null;
        String[] parts = clean.split(",");
        List<ListNode> nodes = new ArrayList<>();
        for (String p : parts) {
            if (!p.trim().isEmpty()) nodes.add(new ListNode(safeInt(p)));
        }
        if (nodes.isEmpty()) return null;
        for (int i = 0; i < nodes.size() - 1; i++) {
            nodes.get(i).next = nodes.get(i + 1);
        }
        if (pos >= 0 && pos < nodes.size()) {
            nodes.get(nodes.size() - 1).next = nodes.get(pos);
        }
        return nodes.get(0);
    }

    static String formatListNode(ListNode head) {
        List<Integer> res = new ArrayList<>();
        ListNode curr = head;
        Set<ListNode> seen = new HashSet<>();
        while (curr != null && !seen.contains(curr)) {
            seen.add(curr);
            res.add(curr.val);
            curr = curr.next;
        }
        return res.toString().replaceAll("\\\\s+", "");
    }

    public static void main(String[] args) {
        try {
            String rawInput = ${stdinEscaped}.trim();
            Class<?> solClass = Class.forName("Solution");
            Object sol = solClass.getDeclaredConstructor().newInstance();
            Method[] methods = solClass.getDeclaredMethods();
            Method targetMethod = null;
            for (Method m : methods) {
                if (!Modifier.isStatic(m.getModifiers()) && Modifier.isPublic(m.getModifiers())) {
                    targetMethod = m;
                    break;
                }
            }

            if (targetMethod != null) {
                List<String> rawTokens = splitSmart(rawInput);
                int posVal = -1;
                List<String> tokens = new ArrayList<>();
                for (String t : rawTokens) {
                    if (t.toLowerCase().startsWith("pos=") || t.toLowerCase().startsWith("pos =")) {
                        posVal = safeInt(t);
                    } else {
                        tokens.add(t);
                    }
                }

                Class<?>[] paramTypes = targetMethod.getParameterTypes();
                Object[] invokeArgs = new Object[paramTypes.length];

                for (int i = 0; i < paramTypes.length; i++) {
                    String token = (i < tokens.size()) ? tokens.get(i).trim() : "";
                    if (token.contains("=") && !token.startsWith("[") && !token.startsWith("{") && !token.startsWith("\\"")) {
                        token = token.substring(token.indexOf("=") + 1).trim();
                    }
                    Class<?> pType = paramTypes[i];

                    if (pType == ListNode.class) {
                        invokeArgs[i] = buildLinkedList(token, posVal);
                    } else if (pType == int[].class) {
                        String clean = token.replace("[", "").replace("]", "").trim();
                        if (clean.isEmpty()) {
                            invokeArgs[i] = new int[0];
                        } else {
                            String[] parts = clean.split(",");
                            int[] arr = new int[parts.length];
                            for (int j = 0; j < parts.length; j++) arr[j] = safeInt(parts[j]);
                            invokeArgs[i] = arr;
                        }
                    } else if (pType == int.class || pType == Integer.class) {
                        invokeArgs[i] = safeInt(token);
                    } else if (pType == String.class) {
                        invokeArgs[i] = token.replaceAll("^\\"|\\"$", "");
                    } else if (pType == boolean.class || pType == Boolean.class) {
                        invokeArgs[i] = token.toLowerCase().contains("true");
                    } else if (pType == List.class) {
                        String clean = token.replace("[", "").replace("]", "").trim();
                        List<Integer> list = new ArrayList<>();
                        if (!clean.isEmpty()) {
                            for (String p : clean.split(",")) {
                                if (!p.trim().isEmpty()) list.add(safeInt(p));
                            }
                        }
                        invokeArgs[i] = list;
                    } else {
                        invokeArgs[i] = token;
                    }
                }

                Object result = targetMethod.invoke(sol, invokeArgs);
                if (result instanceof ListNode) {
                    System.out.println(formatListNode((ListNode) result));
                } else if (result instanceof int[]) {
                    System.out.println(Arrays.toString((int[]) result).replaceAll("\\\\s+", ""));
                } else if (result instanceof boolean[]) {
                    System.out.println(Arrays.toString((boolean[]) result).replaceAll("\\\\s+", ""));
                } else if (result instanceof Object[]) {
                    System.out.println(Arrays.deepToString((Object[]) result).replaceAll("\\\\s+", ""));
                } else if (result instanceof List) {
                    System.out.println(result.toString().replaceAll("\\\\s+", ""));
                } else {
                    System.out.println(result);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
`;
}

// ── 4. C++ LeetCode Test Harness ───────────────────────────────────────────────
export function wrapCppCode(code, stdin = '') {
  const cppHeaders = `
#include <iostream>
#include <vector>
#include <string>
#include <sstream>
#include <algorithm>
#include <unordered_map>
#include <unordered_set>
#include <map>
#include <set>
#include <queue>
#include <stack>
#include <deque>
#include <cmath>
#include <climits>
#include <numeric>
#include <functional>
#include <utility>
#include <tuple>
#include <iomanip>
#include <bitset>
#include <list>
#include <memory>
using namespace std;

struct ListNode {
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
};
`;

  if (code.includes('int main(') || code.includes('void main(')) {
    return `${cppHeaders}\n${code}`;
  }

  let methodName = 'twoSum';
  let paramTypes = ['vector<int>&', 'int'];
  
  const methodMatch = code.match(/(?:vector<[^>]+>|int|bool|string|void|double|ListNode\*|TreeNode\*)\s+([a-zA-Z0-9_$]+)\s*\(([^)]*)\)/);
  if (methodMatch) {
    methodName = methodMatch[1];
    const rawParams = methodMatch[2].split(',').map(p => p.trim()).filter(Boolean);
    if (rawParams.length > 0) {
      paramTypes = rawParams;
    } else {
      paramTypes = [];
    }
  }

  const stdinEscaped = JSON.stringify(stdin || '');

  const argDeclarations = [];
  const argNames = [];
  for (let i = 0; i < paramTypes.length; i++) {
    const pt = paramTypes[i].toLowerCase();
    const argName = `arg${i}`;
    argNames.push(argName);

    if (pt.includes('listnode')) {
      argDeclarations.push(`ListNode* ${argName} = parseListNode(tokens.size() > ${i} ? tokens[${i}] : "", posVal);`);
    } else if (pt.includes('vector<int>') || pt.includes('vector < int >')) {
      argDeclarations.push(`vector<int> ${argName} = parseVectorInt(tokens.size() > ${i} ? tokens[${i}] : "");`);
    } else if (pt.includes('vector<string>') || pt.includes('vector < string >')) {
      argDeclarations.push(`vector<string> ${argName} = parseVectorString(tokens.size() > ${i} ? tokens[${i}] : "");`);
    } else if (pt.includes('string')) {
      argDeclarations.push(`string ${argName} = parseString(tokens.size() > ${i} ? tokens[${i}] : "");`);
    } else if (pt.includes('bool')) {
      argDeclarations.push(`bool ${argName} = parseBool(tokens.size() > ${i} ? tokens[${i}] : "");`);
    } else {
      argDeclarations.push(`int ${argName} = parseInt(tokens.size() > ${i} ? tokens[${i}] : "");`);
    }
  }

  const invocation = paramTypes.length > 0
    ? `auto res = sol.${methodName}(${argNames.join(', ')});`
    : `auto res = sol.${methodName}();`;

  return `${cppHeaders}

${code}

static void printVal(int v) { cout << v; }
static void printVal(long long v) { cout << v; }
static void printVal(double v) { cout << v; }
static void printVal(bool v) { cout << (v ? "true" : "false"); }
static void printVal(const string& v) { cout << "\\"" << v << "\\""; }
template<typename T>
static void printVal(const vector<T>& vec) {
    cout << "[";
    for (size_t i = 0; i < vec.size(); ++i) {
        printVal(vec[i]);
        if (i + 1 < vec.size()) cout << ",";
    }
    cout << "]";
}
static void printVal(ListNode* head) {
    cout << "[";
    ListNode* curr = head;
    unordered_set<ListNode*> seen;
    while (curr && !seen.count(curr)) {
        seen.insert(curr);
        cout << curr->val;
        if (curr->next && !seen.count(curr->next)) cout << ",";
        curr = curr->next;
    }
    cout << "]";
}

static vector<string> splitSmart(const string& s) {
    vector<string> items;
    string curr = "";
    int depth = 0;
    bool inStr = false;
    char strChar = ' ';
    for (size_t i = 0; i < s.size(); ++i) {
        char ch = s[i];
        if (inStr) {
            curr += ch;
            if (ch == strChar) inStr = false;
        } else if (ch == '"' || ch == '\\'') {
            inStr = true;
            strChar = ch;
            curr += ch;
        } else if (ch == '[' || ch == '{' || ch == '(') {
            depth++;
            curr += ch;
        } else if (ch == ']' || ch == '}' || ch == ')') {
            depth = max(0, depth - 1);
            curr += ch;
        } else if ((ch == ',' || ch == '\\n' || ch == ';') && depth == 0) {
            string part = curr;
            while (!part.empty() && isspace(part.front())) part.erase(part.begin());
            while (!part.empty() && isspace(part.back())) part.pop_back();
            if (!part.empty()) items.push_back(part);
            curr = "";
        } else {
            curr += ch;
        }
    }
    string part = curr;
    while (!part.empty() && isspace(part.front())) part.erase(part.begin());
    while (!part.empty() && isspace(part.back())) part.pop_back();
    if (!part.empty()) items.push_back(part);
    return items;
}

static vector<int> parseVectorInt(string s) {
    if (s.find('=') != string::npos && s[0] != '[') {
        s = s.substr(s.find('=') + 1);
    }
    vector<int> res;
    string clean = "";
    for (char c : s) {
        if (c == '[' || c == ']' || c == ',') clean += ' ';
        else clean += c;
    }
    stringstream ss(clean);
    int val;
    while (ss >> val) res.push_back(val);
    return res;
}

static vector<string> parseVectorString(string s) {
    if (s.find('=') != string::npos && s[0] != '[') {
        s = s.substr(s.find('=') + 1);
    }
    vector<string> res;
    vector<string> parts = splitSmart(s);
    for (string& p : parts) {
        while (!p.empty() && (p.front() == '"' || p.front() == '\\'' || p.front() == '[')) p.erase(p.begin());
        while (!p.empty() && (p.back() == '"' || p.back() == '\\'' || p.back() == ']')) p.pop_back();
        if (!p.empty()) res.push_back(p);
    }
    return res;
}

static string parseString(string s) {
    if (s.find('=') != string::npos && s[0] != '"' && s[0] != '\\'') {
        s = s.substr(s.find('=') + 1);
    }
    while (!s.empty() && isspace(s.front())) s.erase(s.begin());
    while (!s.empty() && isspace(s.back())) s.pop_back();
    if (s.size() >= 2 && ((s.front() == '"' && s.back() == '"') || (s.front() == '\\'' && s.back() == '\\''))) {
        s = s.substr(1, s.size() - 2);
    }
    return s;
}

static int parseInt(string s) {
    if (s.find('=') != string::npos && s[0] != '[') {
        s = s.substr(s.find('=') + 1);
    }
    string clean = "";
    for (char c : s) {
        if (isdigit(c) || c == '-') clean += c;
    }
    if (clean.empty() || clean == "-") return 0;
    try { return stoi(clean); } catch (...) { return 0; }
}

static bool parseBool(string s) {
    for (char &c : s) c = tolower(c);
    return s.find("true") != string::npos;
}

static ListNode* parseListNode(string s, int pos = -1) {
    vector<int> vals = parseVectorInt(s);
    if (vals.empty()) return nullptr;
    vector<ListNode*> nodes;
    for (int v : vals) nodes.push_back(new ListNode(v));
    for (size_t i = 0; i < nodes.size() - 1; ++i) {
        nodes[i]->next = nodes[i + 1];
    }
    if (pos >= 0 && pos < (int)nodes.size()) {
        nodes.back()->next = nodes[pos];
    }
    return nodes[0];
}

int main() {
    Solution sol;
    string rawInput = ${stdinEscaped};
    vector<string> rawTokens = splitSmart(rawInput);
    int posVal = -1;
    vector<string> tokens;
    for (const string& t : rawTokens) {
        if (t.find("pos=") != string::npos || t.find("pos =") != string::npos) {
            posVal = parseInt(t);
        } else {
            tokens.push_back(t);
        }
    }

    try {
        ${argDeclarations.join('\n        ')}
        ${invocation}
        printVal(res);
        cout << endl;
    } catch (...) {
        return 0;
    }
    return 0;
}
`;
}

// ── Prepare Code helper ───────────────────────────────────────────────────────
export function prepareCode(code, language = 'python', stdin = '') {
  const langKey = String(language).toLowerCase().trim();
  switch (langKey) {
    case 'python':
    case 'python3':
    case 'py':
      return wrapPythonCode(code, stdin);
    case 'javascript':
    case 'js':
    case 'typescript':
    case 'ts':
      return wrapJsCode(code, stdin);
    case 'java':
      return wrapJavaCode(code, stdin);
    case 'cpp':
    case 'c++':
    case 'c':
      return wrapCppCode(code, stdin);
    default:
      return code;
  }
}

// ── In-Browser Web Worker Sandbox ────────────────────────────────────────────
function executeInWorker(jsCode, stdin = '') {
  return new Promise((resolve) => {
    const workerScript = `
      const _logs = [];
      const _console = {
        log: (...a) => _logs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')),
        error: (...a) => _logs.push('[Error] ' + a.map(String).join(' ')),
        warn: (...a) => _logs.push('[Warn] ' + a.map(String).join(' ')),
        info: (...a) => _logs.push(a.map(String).join(' '))
      };

      try {
        ${wrapJsCode(jsCode, stdin)}
        postMessage({ ok: true, output: _logs.join('\\n').trim(), error: null });
      } catch(e) {
        postMessage({ ok: false, output: '', error: e.toString() });
      }
    `;

    const blob = new Blob([workerScript], { type: 'application/javascript' });
    const url = URL.createObjectURL(blob);
    let worker;

    try {
      worker = new Worker(url);
    } catch (err) {
      URL.revokeObjectURL(url);
      resolve({ ok: false, output: '', error: err.message });
      return;
    }

    const timer = setTimeout(() => {
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ ok: false, output: '', error: 'Time limit exceeded (5s)' });
    }, 5000);

    worker.onmessage = (e) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve(e.data);
    };

    worker.onerror = (e) => {
      clearTimeout(timer);
      worker.terminate();
      URL.revokeObjectURL(url);
      resolve({ ok: false, output: '', error: e.message || 'Execution error' });
    };
  });
}

// ── Primary Engine: Judge0 CE (Official LeetCode Online Judge Standard) ───────
async function executeOnJudge0(preparedCode, language, stdin = '', timeoutMs = 8000) {
  const langKey = language.toLowerCase().trim();
  const langId = JUDGE0_LANG_IDS[langKey] || 71;

  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch('https://ce.judge0.com/submissions?base64_encoded=true&wait=true', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        source_code: utf8ToBase64(preparedCode),
        language_id: langId,
        stdin: stdin ? utf8ToBase64(stdin) : '',
      }),
    });
    clearTimeout(tid);

    if (!res.ok) {
      throw new Error(`Judge0 API HTTP ${res.status}`);
    }

    const data = await res.json();
    const stdout = (base64ToUtf8(data.stdout) || '').trim();
    const stderr = (base64ToUtf8(data.stderr) || '').trim();
    const compileOutput = (base64ToUtf8(data.compile_output) || '').trim();
    const statusDesc = data.status?.description || 'Unknown';
    const isSuccess = data.status?.id === 3; // 3 is "Accepted"

    const timeSec = data.time ? parseFloat(data.time) : 0;
    const timeMs = Math.round(timeSec * 1000);
    const memoryMb = data.memory ? (data.memory / 1024).toFixed(1) : null;

    return {
      ok: isSuccess,
      output: stdout,
      error: compileOutput || stderr || (data.status?.id !== 3 ? statusDesc : null),
      status: statusDesc,
      executionTime: timeMs > 0 ? `${timeMs}ms` : '1ms',
      memory: memoryMb ? `${memoryMb} MB` : null,
      provider: `Judge0 LeetCode Engine (${langKey})`,
    };
  } catch (err) {
    clearTimeout(tid);
    throw err;
  }
}

// ── Secondary Engine: Wandbox API ─────────────────────────────────────────────
async function executeOnWandbox(preparedCode, language, stdin = '', timeoutMs = 8000) {
  const langKey = language.toLowerCase().trim();
  const cfg = WANDBOX_COMPILER_MAP[langKey] || WANDBOX_COMPILER_MAP.python;

  const ctrl = new AbortController();
  const tid = setTimeout(() => ctrl.abort(), timeoutMs);

  try {
    const res = await fetch('https://wandbox.org/api/compile.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: ctrl.signal,
      body: JSON.stringify({
        compiler: cfg.compiler,
        code: preparedCode,
        stdin: stdin || '',
      }),
    });
    clearTimeout(tid);

    if (!res.ok) {
      throw new Error(`Wandbox API HTTP ${res.status}`);
    }

    const data = await res.json();
    const stdout = (data.program_output || data.compiler_output || '').trim();
    const stderr = (data.program_error || data.compiler_error || '').trim();
    const isSuccess = data.status === '0' && !stderr;

    return {
      ok: isSuccess,
      output: stdout,
      error: stderr || (data.status !== '0' ? (data.compiler_message || `Process exited with code ${data.status}`) : null),
      status: isSuccess ? 'Accepted' : (stderr ? 'Runtime Error' : 'Compilation Error'),
      provider: `Wandbox (${cfg.name})`,
    };
  } catch (err) {
    clearTimeout(tid);
    throw err;
  }
}

// ── Tier 3: In-Browser Client-Side Evaluator ──────────────────────────────────
function executeClientSide(code, language = 'python', stdin = '') {
  try {
    const langKey = String(language).toLowerCase().trim();

    // If JavaScript / TypeScript
    if (langKey.includes('javascript') || langKey.includes('js') || langKey.includes('typescript') || langKey.includes('ts')) {
      const wrapped = wrapJsCode(code, stdin);
      const logs = [];
      const fakeConsole = {
        log: (...a) => logs.push(a.map(x => typeof x === 'object' ? JSON.stringify(x) : String(x)).join(' ')),
        error: (...a) => logs.push('[Error] ' + a.map(String).join(' ')),
      };
      const runner = new Function('console', wrapped);
      runner(fakeConsole);
      const out = logs.join('\n').trim();
      return {
        ok: true,
        output: out,
        error: null,
        status: 'Accepted',
        provider: 'Client-Side Engine',
      };
    }
  } catch (err) {
    return {
      ok: false,
      output: '',
      error: err.message,
      status: 'Runtime Error',
      provider: 'Client-Side Engine',
    };
  }
  return null;
}

/**
 * Universal LeetCode-Grade Compiler API
 * Compiles and runs code through Judge0 CE (LeetCode Standard), Wandbox, or Local Web Worker.
 */
export async function executeCodeOnline(code, language = 'python', stdin = '', problemContext = null) {
  const langKey = String(language).toLowerCase().trim();
  const startTime = performance.now();

  // Prepare LeetCode driver-wrapped code for the selected language
  const preparedCode = prepareCode(code, langKey, stdin);

  // Tier 1: Primary Online Engine — Judge0 CE (Official LeetCode Online Judge API)
  try {
    const judgeRes = await executeOnJudge0(preparedCode, langKey, stdin, 6000);
    const ms = Math.round(performance.now() - startTime);
    return {
      ...judgeRes,
      executionTime: judgeRes.executionTime || `${ms}ms`,
    };
  } catch (judgeErr) {
    // Tier 2: Secondary Online Engine — Wandbox Real Multi-Language Compilers
    try {
      const wandboxRes = await executeOnWandbox(preparedCode, langKey, stdin, 5000);
      const ms = Math.round(performance.now() - startTime);
      return {
        ...wandboxRes,
        executionTime: `${ms}ms`,
      };
    } catch (wandboxErr) {
      // Tier 3: Tertiary Engine — In-Browser Web Worker Sandbox & Client Evaluator
      if (langKey === 'javascript' || langKey === 'js' || langKey === 'typescript' || langKey === 'ts') {
        const workerRes = await executeInWorker(code, stdin);
        const ms = Math.round(performance.now() - startTime);
        return {
          ok: workerRes.ok,
          output: workerRes.output || '',
          error: workerRes.error,
          status: workerRes.ok ? 'Accepted' : 'Runtime Error',
          executionTime: `${ms}ms`,
          provider: 'Local Sandbox Engine',
        };
      }

      const clientRes = executeClientSide(code, langKey, stdin);
      if (clientRes) {
        const ms = Math.round(performance.now() - startTime);
        return {
          ...clientRes,
          executionTime: `${ms}ms`,
        };
      }

      const ms = Math.round(performance.now() - startTime);
      return {
        ok: false,
        output: '',
        error: judgeErr?.message || 'Execution timed out or network error.',
        status: 'Runtime Error',
        executionTime: `${ms}ms`,
        provider: 'LeetCode Execution Engine',
      };
    }
  }
}
