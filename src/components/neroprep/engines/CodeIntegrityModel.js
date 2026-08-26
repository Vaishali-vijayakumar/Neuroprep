/**
 * CodeIntegrityModel — Anti-Cheat & Algorithmic Authenticity Evaluation Engine
 *
 * Evaluates DSA code submissions for:
 * 1. Hardcoded test-case output matching (overfitting `if nums == [...] return [...]`)
 * 2. Static map/dict lookup tables bypassing algorithmic execution
 * 3. Constant stub returns (`return true;`, `return 0;`, `return [];`)
 * 4. Illegal print statements attempting stdout bypass
 * 5. Dynamic randomized stress edge-case validation
 */

import { executeCodeOnline } from '../../../services/compilerService';

export class CodeIntegrityModel {
  /**
   * Run full static AST heuristic scan + dynamic edge case stress validation
   */
  static async evaluateIntegrity({
    code = '',
    language = 'Python',
    problemTitle = '',
    problemData = null,
    testCases = [],
  }) {
    const trimmed = (code || '').trim();
    if (!trimmed) {
      return {
        isCheatDetected: false,
        isHardcoded: false,
        isConstantStub: false,
        cheatPenalty: 0,
        cheatConfidence: 0,
        violations: [],
        edgeCaseScore: 0,
        verdict: 'Empty submission.',
      };
    }

    const staticCheck = this.scanStaticSignatures(trimmed, testCases, language);
    const dynamicStress = await this.validateDynamicEdgeCases(trimmed, problemTitle, language);

    const isHardcoded = staticCheck.isHardcoded || (staticCheck.hardcodedCount >= 2 && dynamicStress.failedAll);
    const isConstantStub = staticCheck.isConstantStub && dynamicStress.failedAll;
    const isIllegalPrint = staticCheck.isIllegalPrint;

    const isCheatDetected = isHardcoded || isConstantStub || isIllegalPrint;
    const cheatConfidence = isHardcoded ? Math.min(100, 60 + staticCheck.hardcodedCount * 20)
      : isConstantStub ? 85
      : isIllegalPrint ? 90
      : 0;

    const cheatPenalty = isCheatDetected ? 100 : dynamicStress.penalty;

    const violations = [
      ...staticCheck.violations,
      ...dynamicStress.violations,
    ];

    let verdict = 'Code algorithmic integrity verified.';
    if (isHardcoded) {
      verdict = 'Anti-Cheat Alert: Hardcoded test-case output detected. Code directly matches static test inputs rather than computing an algorithmic solution.';
    } else if (isConstantStub) {
      verdict = 'Anti-Cheat Alert: Trivial stub return detected. Solution returns a constant value without implementing algorithm logic.';
    } else if (isIllegalPrint) {
      verdict = 'Anti-Cheat Alert: Static print bypass detected. Solution prints hardcoded values without function evaluation.';
    }

    return {
      isCheatDetected,
      isHardcoded,
      isConstantStub,
      isIllegalPrint,
      cheatPenalty,
      cheatConfidence,
      violations,
      edgeCaseScore: dynamicStress.edgeCaseScore,
      dynamicEdgeCasesPassed: dynamicStress.passed,
      dynamicEdgeCasesTotal: dynamicStress.total,
      verdict,
      staticCheck,
      dynamicStress,
    };
  }

  /**
   * Static Code Inspection for Hardcoded Conditions, Dictionaries, and Stubs
   */
  static scanStaticSignatures(code, testCases = [], language = 'Python') {
    const clean = code
      .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // remove c-style comments
      .replace(/#.*/g, '')                     // remove python comments
      .trim();

    const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);
    const violations = [];
    let hardcodedCount = 0;

    // 1. Detect `if input == [...] return [...]` or `if (x === 5) return true;`
    const hardcodedIfRegex = /\bif\s*\(?.*?(==|===|is|\.equals)\s*(\[.*?\]|\".*?\"|\d+|true|false|\{.*?\})\s*\)?\s*(:|{|return|=>)\s*(return\s+)?(\[.*?\]|\".*?\"|\d+|true|false|\{.*?\})/gi;
    const ifMatches = clean.match(hardcodedIfRegex) || [];
    if (ifMatches.length > 0) {
      hardcodedCount += ifMatches.length;
      violations.push(`Found ${ifMatches.length} hardcoded input-matching branch(es) (e.g. \`if (input == ...) return [...]\`)`);
    }

    // 2. Cross-reference literal test-case strings in source code
    testCases.forEach((tc) => {
      if (tc.input && tc.input.length > 3) {
        const escapedInput = tc.input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const inputFound = new RegExp(`['"]?${escapedInput}['"]?`, 'i').test(clean);
        if (inputFound && (clean.includes('return') || clean.includes('print'))) {
          // Check if output is also directly adjacent
          const escapedOut = String(tc.output || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          if (escapedOut && clean.includes(escapedOut)) {
            hardcodedCount += 1;
            violations.push(`Direct testcase input/output literal pair found: input [${tc.input}] -> output [${tc.output}]`);
          }
        }
      }
    });

    // 3. Detect dictionary/map of hardcoded test inputs: `lookup = { "[2,7,11,15]": [0,1], ... }`
    const lookupHackRegex = /(const|let|var|\b)?\s*\w+\s*=\s*\{\s*["'][^"']+["']\s*:\s*(\[.*?\]|\d+|true|false|["'].*?["'])\s*,/gi;
    if (lookupHackRegex.test(clean)) {
      hardcodedCount += 2;
      violations.push('Static lookup map detected mapping test strings directly to outputs.');
    }

    // 4. Detect Trivial Constant Stub: function with <= 3 lines that just returns a constant literal
    const hasAlgorithmicConstructs = /\b(for|while|forEach|map|filter|reduce|sort|binary|stack|queue|deque|heap|dfs|bfs|dp|recursion|Math\.|Collections|Arrays|std::)\b/i.test(clean);
    const bodyOnlyReturnsConstant = /^(def\s+\w+.*?:|class\s+\w+.*?|public\s+.*?|function\s+\w+.*?|\(.*?\)\s*=>)\s*return\s+(true|false|0|1|-1|\[\]|\"\"|\{\}|null|None)\s*;?$/is.test(clean.replace(/\s+/g, ' '));

    let isConstantStub = false;
    if (lines.length <= 4 && !hasAlgorithmicConstructs && bodyOnlyReturnsConstant) {
      isConstantStub = true;
      violations.push('Constant stub detected: solution returns a single static value without algorithmic logic.');
    }

    // 5. Detect Static Print Statement without returning computed logic
    const isIllegalPrint = (clean.includes('print(') || clean.includes('console.log(') || clean.includes('System.out.print')) &&
      !clean.includes('return ') && !hasAlgorithmicConstructs;
    if (isIllegalPrint) {
      violations.push('Direct stdout printing detected without functional return execution.');
    }

    return {
      isHardcoded: hardcodedCount >= 2,
      hardcodedCount,
      isConstantStub,
      isIllegalPrint,
      violations,
    };
  }

  /**
   * Generate unseen randomized stress edge cases and execute against candidate's code
   */
  static async validateDynamicEdgeCases(code, problemTitle = '', language = 'Python') {
    const dynamicCases = this.getDynamicEdgeCasesForProblem(problemTitle);
    if (!dynamicCases || dynamicCases.length === 0) {
      return { edgeCaseScore: 100, passed: 0, total: 0, failedAll: false, penalty: 0, violations: [] };
    }

    let passed = 0;
    const total = dynamicCases.length;
    const failedCases = [];

    for (let i = 0; i < dynamicCases.length; i++) {
      const tc = dynamicCases[i];
      try {
        const out = await executeCodeOnline(code, language, tc.input);
        const actual = String(out.stdout || '').trim();
        const expected = String(tc.output || '').trim();
        
        // Normalize arrays/bools
        const normActual = actual.replace(/\s+/g, '').replace(/True/g, 'true').replace(/False/g, 'false');
        const normExpected = expected.replace(/\s+/g, '').replace(/True/g, 'true').replace(/False/g, 'false');

        if (normActual === normExpected || (normActual.includes(normExpected) && normExpected.length > 0)) {
          passed++;
        } else {
          failedCases.push({ input: tc.input, expected: tc.output, actual });
        }
      } catch (_) {
        failedCases.push({ input: tc.input, expected: tc.output, actual: 'Error' });
      }
    }

    const failedAll = passed === 0 && total > 0;
    const edgeCaseScore = Math.round((passed / total) * 100);
    const violations = [];

    if (failedAll) {
      violations.push(`Failed 100% of unseen dynamic edge cases (${total}/${total} failed). Solution cannot generalize beyond fixed examples.`);
    } else if (passed < total) {
      violations.push(`Failed ${total - passed} dynamic edge boundary cases (Pass rate: ${edgeCaseScore}%).`);
    }

    return {
      edgeCaseScore,
      passed,
      total,
      failedAll,
      penalty: failedAll ? 30 : Math.round((1 - passed / total) * 20),
      violations,
      failedCases,
    };
  }

  /**
   * Curated Dynamic Edge-Case Generator per Problem
   */
  static getDynamicEdgeCasesForProblem(title = '') {
    const t = (title || '').toLowerCase();

    if (t.includes('two sum')) {
      return [
        { input: '[100, 200, 300, 400]\n500', output: '[1, 2]' },
        { input: '[-50, -20, 0, 30, 70]\n-20', output: '[0, 3]' },
        { input: '[10, 10]\n20', output: '[0, 1]' },
      ];
    }
    if (t.includes('container with most water')) {
      return [
        { input: '[1, 2, 1]', output: '2' },
        { input: '[10, 10, 10, 10]', output: '30' },
        { input: '[4, 3, 2, 1, 4]', output: '16' },
      ];
    }
    if (t.includes('longest substring without repeating')) {
      return [
        { input: '"abcdefghijklmnopqrstuvwxyz"', output: '26' },
        { input: '"aab"', output: '2' },
        { input: '"tmmzuxt"', output: '5' },
      ];
    }
    if (t.includes('valid parentheses')) {
      return [
        { input: '"((({{[[]]}})))"', output: 'true' },
        { input: '"((("', output: 'false' },
        { input: '"][["', output: 'false' },
      ];
    }
    if (t.includes('search in rotated sorted array')) {
      return [
        { input: '[6, 7, 8, 1, 2, 3, 4, 5]\n8', output: '2' },
        { input: '[3, 1]\n1', output: '1' },
        { input: '[5, 1, 3]\n5', output: '0' },
      ];
    }
    if (t.includes('find minimum in rotated')) {
      return [
        { input: '[11, 13, 15, 17]', output: '11' },
        { input: '[2, 1]', output: '1' },
        { input: '[3, 4, 5, 1, 2]', output: '1' },
      ];
    }
    if (t.includes('valid palindrome')) {
      return [
        { input: '"0P"', output: 'false' },
        { input: '"ab_a"', output: 'true' },
        { input: '"a."', output: 'true' },
      ];
    }
    if (t.includes('climbing stairs')) {
      return [
        { input: '4', output: '5' },
        { input: '5', output: '8' },
        { input: '6', output: '13' },
      ];
    }
    if (t.includes('house robber')) {
      return [
        { input: '[2, 1, 1, 2]', output: '4' },
        { input: '[200, 3, 140, 20, 10]', output: '350' },
      ];
    }
    if (t.includes('maximum subarray')) {
      return [
        { input: '[-1, -2, -3, -4]', output: '-1' },
        { input: '[10, -2, 3, 4, -1, 2, 1, -5, 4]', output: '17' },
      ];
    }

    // Default universal stress edge cases
    return [
      { input: '[1]', output: '1' },
      { input: '[]', output: '0' },
    ];
  }
}

export default CodeIntegrityModel;
