import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

const LANGUAGES = ['JavaScript', 'Python', 'Java', 'C++', 'Go'];

export default function MonacoEditorPanel({ onCodeChange }) {
  const [language, setLanguage] = useState('javascript');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#FFFFFF' }}>

      {/* Editor Toolbar */}
      <div style={{
        height: '44px', display: 'flex', alignItems: 'center', gap: '12px',
        padding: '0 16px', borderBottom: '1px solid var(--border-color)',
        backgroundColor: '#FFFFFF', flexShrink: 0
      }}>
        <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          Code Editor
        </span>
        <span style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-color)' }}></span>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{
            padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border-color)',
            backgroundColor: '#FFFFFF', color: 'var(--text-body)', fontSize: '13px', outline: 'none'
          }}
        >
          {LANGUAGES.map(l => <option key={l} value={l.toLowerCase()}>{l}</option>)}
        </select>
      </div>

      {/* Monaco Editor */}
      <div style={{ flex: 1 }}>
        <Editor
          height="100%"
          language={language}
          theme="light"
          defaultValue="// Write your solution here..."
          onChange={(value) => onCodeChange && onCodeChange(value)}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Consolas, monospace',
            padding: { top: 16 },
            lineNumbersMinChars: 3,
          }}
        />
      </div>

    </div>
  );
}
