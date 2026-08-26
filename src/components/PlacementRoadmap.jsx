import React, { useState } from 'react';
import { Compass, CheckCircle2, Circle, ArrowRight, BookOpen, Code2, Mic2, Brain, ChevronDown, ChevronUp, Sparkles, Award } from 'lucide-react';

const ROADMAP_PHASES = [
  {
    phase: 'Phase 1',
    title: 'Foundations & Programming Fundamentals',
    period: 'Semester 1 - 4 (1st & 2nd Year)',
    icon: Code2,
    desc: 'Master one core programming language (C++, Java, or Python), OOPs concepts, basic math, and fundamental data structures.',
    milestones: [
      { id: 'm1', title: 'Master C++ / Java / Python Syntax & Control Flow', tag: 'Core Coding' },
      { id: 'm2', title: 'Understand Object-Oriented Programming (Classes, Inheritance, Polymorphism)', tag: 'OOPs' },
      { id: 'm3', title: 'Master Basic Data Structures (Arrays, Strings, Pointers, Recursion)', tag: 'DSA Basics' },
      { id: 'm4', title: 'Build 2 Fundamental Projects (CLI Apps, Simple Web Pages)', tag: 'Projects' },
      { id: 'm5', title: 'Practice Basic Quantitative Aptitude (Percentages, Ratios, Speed-Time)', tag: 'Aptitude' }
    ]
  },
  {
    phase: 'Phase 2',
    title: 'Core Data Structures & Algorithmic Mastery',
    period: 'Semester 5 (3rd Year Start)',
    icon: Brain,
    desc: 'Deep dive into essential linear and non-linear data structures, time complexity analysis, and problem-solving patterns.',
    milestones: [
      { id: 'm6', title: 'Master Linked Lists, Stacks, Queues & Two-Pointer Techniques', tag: 'DSA Intermediate' },
      { id: 'm7', title: 'Learn Trees, Binary Search Trees, Heaps & Priority Queues', tag: 'Trees & Heaps' },
      { id: 'm8', title: 'Solve 100+ Easy & Medium Problems on Coding Lab / LeetCode', tag: 'Problem Solving' },
      { id: 'm9', title: 'Understand DBMS & Write Complex SQL Queries (JOINs, Indexing, Group By)', tag: 'DBMS & SQL' },
      { id: 'm10', title: 'Prepare Formal Tech Resume & Filter Non-Technical Noise with ATS', tag: 'Resume' }
    ]
  },
  {
    phase: 'Phase 3',
    title: 'Advanced Algorithms & System Design',
    period: 'Semester 6 (3rd Year End)',
    icon: Sparkles,
    desc: 'Conquer Dynamic Programming, Graphs, System Design concepts, and company-specific coding patterns.',
    milestones: [
      { id: 'm11', title: 'Master Dynamic Programming (Memoization, Tabulation) & Graph Traversals (BFS/DFS)', tag: 'Advanced DSA' },
      { id: 'm12', title: 'Understand High-Level System Design (REST APIs, Microservices, Caching, Databases)', tag: 'System Design' },
      { id: 'm13', title: 'Complete Top 100 SDE Sheet (Striver / Love Babbar Top Questions)', tag: 'SDE Sheet' },
      { id: 'm14', title: 'Practice Spoken English & Technical Explanation with AI Mock Interview', tag: 'Interview Prep' }
    ]
  },
  {
    phase: 'Phase 4',
    title: 'Placement Drive Sprint & AI Mock Sessions',
    period: 'Semester 7 & 8 (Final Year)',
    icon: Award,
    desc: 'Simulate full company-specific placement drives under stress-adaptive interview panels and timed MCQ assessments.',
    milestones: [
      { id: 'm15', title: 'Complete Company-Specific Prep Kits (TCS NQT, Infosys InfyTQ, Zoho)', tag: 'Company Kits' },
      { id: 'm16', title: 'Achieve 80%+ Placement Readiness Score on NeuroPrep Dashboard', tag: 'Readiness' },
      { id: 'm17', title: 'Conduct 5+ Stress-Adaptive AI Mock Interviews (Technical + HR)', tag: 'Mocks' },
      { id: 'm18', title: 'Maintain Mental Wellness & Anxiety Recovery Exercises Before On-Campus Drives', tag: 'Stress Recovery' }
    ]
  }
];

export default function PlacementRoadmap({ setActiveTab }) {
  const [completed, setCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem('neuroprep_roadmap_completed');
      return saved ? JSON.parse(saved) : ['m1', 'm2', 'm5'];
    } catch (_) {
      return ['m1', 'm2', 'm5'];
    }
  });

  const [expandedPhase, setExpandedPhase] = useState(0);

  const toggleMilestone = (id) => {
    setCompleted(prev => {
      const next = prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id];
      try { localStorage.setItem('neuroprep_roadmap_completed', JSON.stringify(next)); } catch (_) {}
      return next;
    });
  };

  const totalMilestones = ROADMAP_PHASES.reduce((acc, p) => acc + p.milestones.length, 0);
  const progressPercent = Math.round((completed.length / totalMilestones) * 100);

  return (
    <div style={{ padding: '32px 24px', maxWidth: 960, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 20, padding: '4px 14px', marginBottom: 8 }}>
            <Compass size={13} color="#111827" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827' }}>Step-by-Step Placement Path</span>
          </div>
          <h1 style={{ fontWeight: 900, fontSize: '1.7rem', color: '#111827', letterSpacing: '-0.5px' }}>Placement Master Roadmap</h1>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: 4 }}>
            Semester-by-semester structured preparation path from 1st Year to Final Campus Drives.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Progress Card */}
          <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: '16px 24px', textAlign: 'right', minWidth: 200 }}>
            <div style={{ fontSize: '0.75rem', color: '#9CA3AF', fontWeight: 600, textTransform: 'uppercase' }}>Overall Progress</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#111827', marginTop: 2 }}>{progressPercent}%</div>
            <div style={{ fontSize: '0.72rem', color: '#6B7280' }}>{completed.length} / {totalMilestones} Milestones Completed</div>
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

      {/* Phases Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {ROADMAP_PHASES.map((p, idx) => {
          const Icon = p.icon;
          const phaseCompleted = p.milestones.filter(m => completed.includes(m.id)).length;
          const isExpanded = expandedPhase === idx;

          return (
            <div key={p.phase} style={{
              background: '#fff', border: `1px solid ${isExpanded ? '#111827' : '#E5E7EB'}`,
              borderRadius: 18, overflow: 'hidden', transition: 'all 0.2s ease',
              boxShadow: isExpanded ? '0 8px 24px rgba(0,0,0,0.06)' : 'none'
            }}>
              {/* Phase Header */}
              <div
                onClick={() => setExpandedPhase(isExpanded ? null : idx)}
                style={{
                  padding: '24px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justify: 'space-between', gap: 16, background: isExpanded ? '#FAFBFD' : '#fff'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: isExpanded ? '#111827' : '#F3F4F6',
                    color: isExpanded ? '#fff' : '#111827',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', tracking: '0.5px', color: '#6B7280' }}>{p.phase}</span>
                      <span style={{ fontSize: '0.72rem', background: '#F3F4F6', border: '1px solid #E5E7EB', padding: '2px 8px', borderRadius: 10, color: '#374151', fontWeight: 600 }}>{p.period}</span>
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#111827' }}>{p.title}</h3>
                    <p style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: 2 }}>{p.desc}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827' }}>{phaseCompleted}/{p.milestones.length}</span>
                    <div style={{ fontSize: '0.7rem', color: '#9CA3AF' }}>Done</div>
                  </div>
                  {isExpanded ? <ChevronUp size={18} color="#111827" /> : <ChevronDown size={18} color="#9CA3AF" />}
                </div>
              </div>

              {/* Milestones List */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid #F3F4F6', padding: '24px 28px', background: '#fff' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {p.milestones.map(m => {
                      const isDone = completed.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleMilestone(m.id)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
                            padding: '14px 18px', borderRadius: 12, cursor: 'pointer',
                            border: `1px solid ${isDone ? '#E5E7EB' : '#E5E7EB'}`,
                            background: isDone ? '#F3F4F6' : '#FAFAFA',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                            {isDone ? (
                              <CheckCircle2 size={20} color="#111827" style={{ flexShrink: 0 }} />
                            ) : (
                              <Circle size={20} color="#9CA3AF" style={{ flexShrink: 0 }} />
                            )}
                            <span style={{
                              fontWeight: 600, fontSize: '0.88rem',
                              color: isDone ? '#111827' : '#374151',
                              textDecoration: isDone ? 'line-through' : 'none'
                            }}>{m.title}</span>
                          </div>
                          <span style={{
                            fontSize: '0.72rem', fontWeight: 700, padding: '3px 10px', borderRadius: 12,
                            background: isDone ? '#F3F4F6' : '#E5E7EB',
                            color: isDone ? '#111827' : '#4B5563'
                          }}>{m.tag}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Action Footer Banner */}
      <div style={{
        marginTop: 32, background: '#111827', borderRadius: 18, padding: '28px 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20
      }}>
        <div>
          <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.1rem', marginBottom: 4 }}>Ready to Test Your Readiness?</h3>
          <p style={{ color: '#9CA3AF', fontSize: '0.85rem' }}>Take an AI Mock Interview or solve top DSA problems based on your roadmap tier.</p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setActiveTab('mock')} style={{
            padding: '10px 20px', borderRadius: 10, border: 'none', background: '#fff', color: '#111827',
            fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Mic2 size={15} /> AI Mock Interview
          </button>
          <button onClick={() => setActiveTab('coding')} style={{
            padding: '10px 20px', borderRadius: 10, border: '1px solid #374151', background: 'transparent', color: '#fff',
            fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
          }}>
            <Code2 size={15} /> Coding Lab
          </button>
        </div>
      </div>
    </div>
  );
}

