import React, { useState } from 'react';
import { FileText, CheckCircle2, Circle, Search, ChevronRight, ExternalLink, Bookmark, Filter, Award } from 'lucide-react';

const TOP_PUZZLES_AND_PATTERNS = [
  { id: 'p1', category: 'SDE Sheet - Arrays', title: "Kadane's Algorithm (Max Subarray Sum)", difficulty: 'Medium', company: 'Amazon, Microsoft, TCS', link: 'coding' },
  { id: 'p2', category: 'SDE Sheet - Arrays', title: 'Sort an Array of 0s, 1s, and 2s (Dutch National Flag)', difficulty: 'Easy', company: 'Infosys, Wipro, Cognizant', link: 'coding' },
  { id: 'p3', category: 'SDE Sheet - Arrays', title: 'Find Missing and Repeating Number', difficulty: 'Medium', company: 'Zoho, Accenture', link: 'coding' },
  { id: 'p4', category: 'SDE Sheet - Two Pointers', title: 'Trapping Rainwater Problem', difficulty: 'Hard', company: 'Google, Amazon', link: 'coding' },
  { id: 'p5', category: 'SDE Sheet - Two Pointers', title: '3Sum & 4Sum Triplet Problem', difficulty: 'Medium', company: 'Flipkart, PhonePe', link: 'coding' },
  
  { id: 'p6', category: 'SDE Sheet - Strings', title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium', company: 'TCS Digital, Microsoft', link: 'coding' },
  { id: 'p7', category: 'SDE Sheet - Strings', title: 'Valid Anagram & Group Anagrams', difficulty: 'Easy', company: 'Accenture, Wipro', link: 'coding' },
  { id: 'p8', category: 'SDE Sheet - Linked List', title: 'Detect and Remove Cycle in Linked List (Floyd Cycle)', difficulty: 'Medium', company: 'Zoho, Cognizant', link: 'coding' },
  { id: 'p9', category: 'SDE Sheet - Linked List', title: 'Merge Two Sorted Linked Lists', difficulty: 'Easy', company: 'TCS, Infosys', link: 'coding' },
  
  { id: 'p10', category: 'Logic Puzzles', title: '3 Cut Cake into 8 Equal Pieces Puzzle', difficulty: 'Easy', company: 'TCS NQT, Infosys', solution: 'Make 2 vertical cuts forming an X (+) dividing the cake into 4 quarters, then 1 horizontal slice across the middle to make 8 equal pieces.' },
  { id: 'p11', category: 'Logic Puzzles', title: '3 Light Bulbs and 3 Switches Outside Room', difficulty: 'Medium', company: 'Zoho, Google', solution: 'Turn Switch 1 ON for 5 mins, turn it OFF. Turn Switch 2 ON and enter. Light ON = Switch 2, Light OFF & Warm = Switch 1, Light OFF & Cold = Switch 3.' },
  { id: 'p12', category: 'Logic Puzzles', title: 'Measure 4 Liters with 3L and 5L Buckets', difficulty: 'Easy', company: 'Accenture, Wipro', solution: 'Fill 5L, pour into 3L (leaving 2L in 5L). Empty 3L, pour 2L into 3L. Fill 5L again, pour into 3L until full (1L transferred). Exactly 4L remains in 5L bucket!' },
  { id: 'p13', category: 'Logic Puzzles', title: '100 Doors Puzzle (Pass 1 to 100)', difficulty: 'Hard', company: 'Microsoft, Amazon', solution: 'Only perfect square doors (1, 4, 9, 16, 25, 36, 49, 64, 81, 100) remain OPEN because they have an odd number of unique factors.' },
  { id: 'p14', category: 'Logic Puzzles', title: 'Heavy Marble out of 9 Marbles (2 Weighings)', difficulty: 'Medium', company: 'Infosys, Cognizant', solution: "Divide into 3 groups of 3 (A, B, C). Weigh A vs B. If equal, heavy is in C. If A is heavier, it's in A. Take that group of 3 and weigh 1 vs 1 to find the heavy one in 2 weighings total." }
];

export default function PuzzlesAndSheets({ setActiveTab }) {
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem('neuroprep_sheets_completed');
      return saved ? JSON.parse(saved) : ['p1', 'p10'];
    } catch (_) {
      return ['p1', 'p10'];
    }
  });

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [revealedPuzzle, setRevealedPuzzle] = useState(null);

  const toggleSolved = (id) => {
    setCompleted(prev => {
      const next = prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id];
      try { localStorage.setItem('neuroprep_sheets_completed', JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  const filtered = TOP_PUZZLES_AND_PATTERNS.filter(item => {
    const matchesCategory = categoryFilter === 'All' || item.category.includes(categoryFilter);
    const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) || item.company.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const solvedCount = completed.length;
  const progressPercent = Math.round((solvedCount / TOP_PUZZLES_AND_PATTERNS.length) * 100);

  return (
    <div style={{ padding: '32px 24px', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 20, padding: '4px 14px', marginBottom: 8 }}>
            <FileText size={13} color="#111827" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827' }}>Top Interview Questions & Puzzles</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: '1.7rem', color: '#111827', letterSpacing: '-0.5px' }}>SDE Sheet & Logic Puzzles</h1>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: 4 }}>
            Curated list of top coding patterns and placement interview logic puzzles asked at TCS, Infosys, Zoho & Amazon.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Progress Card */}
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '16px 24px', textAlign: 'right', minWidth: 200 }}>
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>Sheet Progress</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#111827', marginTop: 2 }}>{progressPercent}%</div>
            <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{solvedCount} / {TOP_PUZZLES_AND_PATTERNS.length} Solved</div>
            <div style={{ height: 6, background: '#F3F4F6', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', background: '#111827', borderRadius: 3, transition: 'width 0.4s ease' }} />
            </div>
          </div>

          <button 
            onClick={() => setActiveTab && setActiveTab('dashboard')} 
            style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <Search size={15} color="#9CA3AF" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search problems or company tags..."
            style={{
              width: '100%', padding: '10px 14px 10px 38px', borderRadius: 10,
              border: '1px solid #E5E7EB', fontSize: '0.88rem', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit'
            }}
          />
        </div>
        {['All', 'Arrays', 'Strings', 'Linked List', 'Logic Puzzles'].map(f => (
          <button key={f} onClick={() => setCategoryFilter(f)} style={{
            padding: '8px 18px', borderRadius: 10, border: '1px solid #E5E7EB',
            background: categoryFilter === f ? '#111827' : '#fff',
            color: categoryFilter === f ? '#fff' : '#374151',
            fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer'
          }}>{f}</button>
        ))}
      </div>

      {/* Questions & Puzzles List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map(item => {
          const isDone = completed.includes(item.id);
          const isPuzzle = item.solution != null;
          const isRevealed = revealedPuzzle === item.id;

          const diffColor = item.difficulty === 'Easy' ? '#111827' : item.difficulty === 'Medium' ? '#111827' : '#111827';

          return (
            <div
              key={item.id}
              style={{
                background: '#fff', border: `1px solid ${isDone ? '#E5E7EB' : '#E5E7EB'}`,
                borderRadius: 14, padding: '18px 22px', transition: 'all 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1, minWidth: 260 }}>
                  <button onClick={() => toggleSolved(item.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {isDone ? (
                      <CheckCircle2 size={22} color="#111827" />
                    ) : (
                      <Circle size={22} color="#9CA3AF" />
                    )}
                  </button>

                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: '#F3F4F6', color: '#374151' }}>{item.category}</span>
                      <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 8, background: `${diffColor}15`, color: diffColor }}>{item.difficulty}</span>
                    </div>
                    <h3 style={{
                      fontWeight: 700, fontSize: '0.92rem', color: isDone ? '#111827' : '#111827',
                    }}>{item.title}</h3>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: 4 }}>🏢 Asked at: <strong>{item.company}</strong></div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  {isPuzzle ? (
                    <button
                      onClick={() => setRevealedPuzzle(isRevealed ? null : item.id)}
                      style={{
                        padding: '6px 14px', borderRadius: 8, border: '1px solid #E5E7EB',
                        background: isRevealed ? '#111827' : '#fff', color: isRevealed ? '#fff' : '#374151',
                        fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer'
                      }}
                    >
                      {isRevealed ? 'Hide Solution' : 'Reveal Solution 💡'}
                    </button>
                  ) : (
                    <button
                      onClick={() => setActiveTab('coding')}
                      style={{
                        padding: '6px 14px', borderRadius: 8, border: '1px solid #E5E7EB',
                        background: '#fff', color: '#111827', fontWeight: 600, fontSize: '0.78rem',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4
                      }}
                    >
                      Solve in Lab <ChevronRight size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Puzzle Solution Accordion */}
              {isPuzzle && isRevealed && (
                <div style={{ marginTop: 16, borderTop: '1px solid #F3F4F6', paddingTop: 14, background: '#F3F4F6', borderRadius: 10, padding: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#111827', marginBottom: 4 }}>💡 Explanation & Solution:</div>
                  <p style={{ fontSize: '0.85rem', color: '#111827', lineHeight: 1.6 }}>{item.solution}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

