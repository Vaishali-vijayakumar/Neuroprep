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
    <div style={{ padding: '32px 24px', maxWidth: 980, margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div className="pill-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <Compass size={13} color="var(--btn-sage)" />
            <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>Step-by-Step Placement Path</span>
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '2rem', color: 'var(--main-heading)', letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)' }}>
            Placement Master Roadmap
          </h1>
          <p style={{ color: 'var(--body-text)', fontSize: '0.92rem', marginTop: 4, fontFamily: 'var(--font-body)' }}>
            Semester-by-semester structured preparation path from 1st Year to Final Campus Drives.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Progress Card */}
          <div className="calm-sub-card" style={{ padding: '14px 22px', textAlign: 'right', minWidth: 210 }}>
            <div style={{ fontSize: '0.74rem', color: 'var(--accent-terracotta)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Overall Progress</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--main-heading)', marginTop: 2, fontFamily: 'var(--font-heading)' }}>{progressPercent}%</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--body-text)' }}>{completed.length} / {totalMilestones} Milestones Completed</div>
            <div style={{ height: 6, backgroundColor: 'rgba(82, 98, 87, 0.12)', borderRadius: 3, marginTop: 8, overflow: 'hidden' }}>
              <div style={{ width: `${progressPercent}%`, height: '100%', backgroundColor: 'var(--btn-sage)', borderRadius: 3, transition: 'width 0.4s ease' }} />
            </div>
          </div>

          <button 
            onClick={() => setActiveTab && setActiveTab('dashboard')} 
            className="btn-back-dashboard"
            style={{ padding: '9px 18px', fontSize: '0.85rem', fontWeight: 700 }}
          >
            ← Dashboard
          </button>
        </div>
      </div>

      {/* Phases Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
        {ROADMAP_PHASES.map((p, idx) => {
          const Icon = p.icon;
          const phaseCompleted = p.milestones.filter(m => completed.includes(m.id)).length;
          const isExpanded = expandedPhase === idx;

          return (
            <div key={p.phase} className="saas-card-spec" style={{
              borderRadius: 18, overflow: 'hidden', padding: 0,
              border: `1px solid ${isExpanded ? 'var(--btn-sage)' : 'var(--border-color)'}`,
              transition: 'all 0.2s ease',
              boxShadow: isExpanded ? 'var(--shadow-3d-hover)' : 'var(--shadow-3d-card)'
            }}>
              {/* Phase Header */}
              <div
                onClick={() => setExpandedPhase(isExpanded ? null : idx)}
                style={{
                  padding: '22px 28px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', gap: 16,
                  backgroundColor: isExpanded ? 'rgba(82, 98, 87, 0.04)' : 'transparent'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12,
                    backgroundColor: isExpanded ? 'var(--btn-sage)' : 'var(--primary-tint)',
                    color: isExpanded ? '#FFFFFF' : 'var(--btn-sage)',
                    border: '1px solid rgba(82, 98, 87, 0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                  }}>
                    <Icon size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--accent-terracotta)' }}>{p.phase}</span>
                      <span className="pill-tag" style={{ fontSize: '0.72rem', padding: '1px 8px' }}>{p.period}</span>
                    </div>
                    <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>{p.title}</h3>
                    <p style={{ fontSize: '0.84rem', color: 'var(--body-text)', marginTop: 2, fontFamily: 'var(--font-body)' }}>{p.desc}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.90rem', fontWeight: 800, color: 'var(--main-heading)' }}>{phaseCompleted}/{p.milestones.length}</span>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Done</div>
                  </div>
                  {isExpanded ? <ChevronUp size={18} color="var(--btn-sage)" /> : <ChevronDown size={18} color="var(--text-muted)" />}
                </div>
              </div>

              {/* Milestones List */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid var(--border-color)', padding: '22px 28px', backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {p.milestones.map(m => {
                      const isDone = completed.includes(m.id);
                      return (
                        <div
                          key={m.id}
                          onClick={() => toggleMilestone(m.id)}
                          style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14,
                            padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                            border: `1px solid ${isDone ? 'var(--border-color)' : 'var(--border-color)'}`,
                            backgroundColor: isDone ? 'rgba(82, 98, 87, 0.08)' : 'var(--bg-card)',
                            boxShadow: '0 1px 3px rgba(45, 58, 48, 0.02)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            {isDone ? (
                              <CheckCircle2 size={18} color="var(--btn-sage)" style={{ flexShrink: 0 }} />
                            ) : (
                              <Circle size={18} color="var(--border-color)" style={{ flexShrink: 0 }} />
                            )}
                            <span style={{
                              fontWeight: isDone ? 600 : 700, fontSize: '0.88rem',
                              color: isDone ? 'var(--text-muted)' : 'var(--main-heading)',
                              textDecoration: isDone ? 'line-through' : 'none',
                              fontFamily: 'var(--font-body)'
                            }}>{m.title}</span>
                          </div>
                          <span className={isDone ? 'calm-pill-sage' : 'pill-tag'} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
                            {m.tag}
                          </span>
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
      <div className="calm-sub-card" style={{
        marginTop: 32, padding: '24px 30px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 20
      }}>
        <div>
          <h3 style={{ color: 'var(--main-heading)', fontWeight: 800, fontSize: '1.15rem', marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
            Ready to Test Your Readiness?
          </h3>
          <p style={{ color: 'var(--body-text)', fontSize: '0.88rem', margin: 0, fontFamily: 'var(--font-body)' }}>
            Take an AI Mock Interview or solve top DSA problems based on your roadmap tier.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setActiveTab('mock')} className="btn-primary-spec" style={{
            padding: '10px 18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8
          }}>
            <Mic2 size={15} /> AI Mock Interview
          </button>
          <button onClick={() => setActiveTab('coding')} className="btn-secondary-spec" style={{
            padding: '10px 18px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: 8
          }}>
            <Code2 size={15} /> Coding Lab
          </button>
        </div>
      </div>
    </div>
  );
}

