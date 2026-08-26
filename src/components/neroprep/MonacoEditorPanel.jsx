import React, { useState, useRef, useEffect, useCallback } from 'react';
import Editor from '@monaco-editor/react';

const LANGUAGES = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python',     label: 'Python 3' },
  { value: 'java',       label: 'Java' },
  { value: 'cpp',        label: 'C++' },
  { value: 'go',         label: 'Go' },
];

const BOILERPLATE = {
  javascript: `// Write your solution here
function solve(input) {
  // parse input
  const lines = input.trim().split('\\n');
  
  // your logic here
  
  return "result";
}

const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin });
let data = '';
rl.on('line', l => data += l + '\\n');
rl.on('close', () => console.log(solve(data)));`,

  python: `# Write your solution here
import sys
input = sys.stdin.readline

def solve():
    n = int(input())
    arr = list(map(int, input().split()))
    
    # your logic here
    
    print("result")

solve()`,

  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int n = Integer.parseInt(br.readLine().trim());
        int[] arr = Arrays.stream(br.readLine().split(" "))
                          .mapToInt(Integer::parseInt).toArray();
        
        // your logic here
        
        System.out.println("result");
    }
}`,

  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    
    // your logic here
    
    cout << "result" << endl;
    return 0;
}`,

  go: `package main

import (
    "bufio"
    "fmt"
    "os"
)

func main() {
    reader := bufio.NewReader(os.Stdin)
    var n int
    fmt.Fscan(reader, &n)
    arr := make([]int, n)
    for i := range arr { fmt.Fscan(reader, &arr[i]) }
    
    // your logic here
    fmt.Println("result")
}`,
};

/**
 * MonacoEditorPanel — Enhanced editor panel used in the standard interview room.
 * For the full CodingRoom (DSA track), a richer version is embedded inline.
 */
export default function MonacoEditorPanel({ onCodeChange, onRun, compileError }) {
  const [language, setLanguage] = useState('javascript');
  const [code,     setCode]     = useState(BOILERPLATE.javascript);
  const [lineCount, setLineCount] = useState(0);
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  // ── Ctrl+Enter → Run ────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (onRun) onRun(code, language);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onRun, code, language]);

  // ── Highlight compile errors as Monaco markers ───────────────────────────────
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !compileError) return;
    const model = editorRef.current.getModel();
    if (!model) return;

    // Parse line number from error message if present (e.g. "line 5:" or ":5:")
    const lineMatch = compileError.match(/[Ll]ine[:\s]+(\d+)|:(\d+):/);
    const lineNo = lineMatch ? parseInt(lineMatch[1] || lineMatch[2], 10) : 1;

    monacoRef.current.editor.setModelMarkers(model, 'compile-error', [
      {
        startLineNumber: lineNo,
        endLineNumber:   lineNo,
        startColumn:     1,
        endColumn:       1000,
        message:         compileError,
        severity:        monacoRef.current.MarkerSeverity.Error,
      },
    ]);
  }, [compileError]);

  // ── Clear markers when error is resolved ────────────────────────────────────
  useEffect(() => {
    if (!compileError && editorRef.current && monacoRef.current) {
      const model = editorRef.current.getModel();
      if (model) monacoRef.current.editor.setModelMarkers(model, 'compile-error', []);
    }
  }, [compileError]);

  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang);
    const newCode = BOILERPLATE[lang] || '// Write your solution here';
    setCode(newCode);
    setLineCount(newCode.split('\n').length);
    if (onCodeChange) onCodeChange(newCode);
  }, [onCodeChange]);

  const handleCodeChange = useCallback((value = '') => {
    setCode(value);
    setLineCount(value.split('\n').length);
    if (onCodeChange) onCodeChange(value);
  }, [onCodeChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#1E1E1E' }}>

      {/* Toolbar */}
      <div style={{
        height: '44px', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '0 14px', borderBottom: '1px solid #333',
        backgroundColor: '#252526', flexShrink: 0,
      }}>
        <span style={{ fontSize: '11px', fontWeight: 700, color: '#858585', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
          Editor
        </span>
        <div style={{ width: '1px', height: '14px', backgroundColor: '#444' }} />
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          style={{
            padding: '3px 8px', borderRadius: '4px',
            backgroundColor: '#3C3C3C', color: '#CCCCCC',
            border: '1px solid #555', fontSize: '12px', outline: 'none',
          }}
        >
          {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        {lineCount > 0 && (
          <span style={{ fontSize: '11px', color: '#858585' }}>{lineCount} lines</span>
        )}
        {onRun && (
          <button
            onClick={() => onRun(code, language)}
            style={{
              padding: '4px 12px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
              backgroundColor: '#475569', color: '#FFFFFF', border: 'none', cursor: 'pointer',
            }}
          >
            ▶ Run (Ctrl+↵)
          </button>
        )}
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Editor
          height="100%"
          language={language}
          theme="vs-dark"
          value={code}
          onChange={handleCodeChange}
          onMount={(editor, monaco) => {
            editorRef.current  = editor;
            monacoRef.current  = monaco;
            setLineCount(code.split('\n').length);
          }}
          options={{
            minimap:               { enabled: false },
            fontSize:              14,
            fontFamily:            'JetBrains Mono, Consolas, monospace',
            padding:               { top: 14 },
            lineNumbersMinChars:   3,
            scrollBeyondLastLine:  false,
            tabSize:               4,
            automaticLayout:       true,
            quickSuggestions:      { other: true, comments: false, strings: false },
          }}
        />
      </div>

    </div>
  );
}

