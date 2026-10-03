import React, { useState } from 'react';

const HOW_IT_WORKS = [
  { 
    step: '01', 
    title: 'Aptitude Concepts & Speed Tricks Coverage', 
    desc: 'Master comprehensive Quantitative identities, Logical deduction patterns, Verbal rules, and Data Interpretation with step-by-step mathematical reasoning and shortcut techniques.' 
  },
  { 
    step: '02', 
    title: 'DSA Patterns & AST Complexity Lab', 
    desc: 'Practice high-frequency SDE patterns — Two Pointers, Sliding Window, Dynamic Programming, Trees & Graphs — with live compiler execution and AST Big-O complexity checks.' 
  },
  { 
    step: '03', 
    title: 'Placement Resource Hub & Alumni Guidance', 
    desc: 'Access curated recruiter syllabus archives, round breakdown cheat sheets, and real interview transcripts and tips shared by students placed at top companies.' 
  },
  { 
    step: '04', 
    title: 'Adaptive AI Avatar Mock Interviews & Mind Care', 
    desc: 'Face realistic AI avatar interview panels that evaluate technical depth, speech speed (WPM), and emotional composure with integrated box breathing stress recovery.' 
  },
];

const CORE_MODULES = [
  { 
    title: 'Realistic AI Avatar Mock Interviews', 
    tag: 'Flagship AI Engine',
    desc: 'Practice technical and HR rounds with realistic human AI avatars. Features real-time speech telemetry (WPM, loudness), facial distraction detection, and stress-adaptive follow-up questions.' 
  },
  { 
    title: 'Comprehensive Aptitude Concept Engine', 
    tag: 'Full Syllabus Coverage',
    desc: 'Master every fundamental and advanced aptitude concept across Quantitative Aptitude, Logical Reasoning, Verbal Ability, Non-Verbal Logic, and Data Interpretation with step-by-step solutions.' 
  },
  { 
    title: 'DSA Patterns Lab & AST Complexity Analyzer', 
    tag: 'Live Compiler & AST',
    desc: 'Solve curated SDE coding patterns with live in-browser compiler execution, automated multi-case validation, and Abstract Syntax Tree (AST) Big-O time and space complexity audits.' 
  },
  { 
    title: 'Placement Resource Hub & AI RAG Assistant', 
    tag: 'Curated Knowledge Base',
    desc: 'Explore comprehensive placement archives, company-specific syllabus breakdowns, core technical cheat sheets, and get instant answers with the AI Placement Knowledge Assistant.' 
  },
  { 
    title: 'Placed Alumni Guidance & Interview Archives', 
    tag: 'Real Peer Insights',
    desc: 'Learn from round-by-round interview experiences, recurring company question patterns, and preparation roadmaps shared by students placed at TCS, Zoho, Infosys, and Amazon.' 
  },
  { 
    title: 'Cognitive Stress Recovery & CBT Diary', 
    tag: 'Mental Wellness',
    desc: 'Overcome interview anxiety with interactive fluid box-breathing visualizers, evidence-based CBT cognitive reframing, and a private daily placement reflection journal.' 
  },
];

const COMPANIES_MARQUEE = [
  { name: 'TCS', role: 'Ninja / Digital', pkg: '7 LPA' },
  { name: 'Infosys', role: 'SE / Specialist', pkg: '8 LPA' },
  { name: 'Wipro', role: 'NLTH Elite', pkg: '6.5 LPA' },
  { name: 'Zoho', role: 'Software Developer', pkg: '12 LPA' },
  { name: 'Accenture', role: 'ASE / FSE', pkg: '8.5 LPA' },
  { name: 'Cognizant', role: 'GenC Elevate', pkg: '6.8 LPA' },
  { name: 'Amazon', role: 'SDE-1', pkg: '28 LPA' },
  { name: 'Google', role: 'Software Engineer', pkg: '32 LPA' },
];

const TESTIMONIALS = [
  { 
    name: 'Vaishali V.', 
    college: 'TCE Madurai', 
    company: 'Placed at Zoho (12 LPA)', 
    text: 'The AI Avatar Mock Interview felt like facing a real technical panel. The placed alumni guidance and round-by-round insights for Zoho gave me the exact confidence needed to crack the design round.' 
  },
  { 
    name: 'Karthik R.', 
    college: 'PSG Tech', 
    company: 'Placed at TCS Digital (7 LPA)', 
    text: 'The DSA pattern lab with AST complexity analysis helped me write optimal O(N) code effortlessly. The aptitude concept coverage broke down difficult probability and reasoning problems with clear steps.' 
  },
  { 
    name: 'Priya S.', 
    college: 'NIT Trichy', 
    company: 'Placed at Accenture (8.5 LPA)', 
    text: 'The Placement Resource Hub and company cheat sheets had everything in one place. The box breathing visualizer and CBT diary kept my drive-day nervousness completely under control.' 
  },
];

const FAQS = [
  { 
    q: 'What placement preparation resources are available in the hub?', 
    a: 'The Placement Resource Hub features company-specific recruitment roadmaps, syllabus breakdowns, recurring technical & HR questions, core topic cheat sheets (OS, DBMS, OOP, CN), and an interactive AI RAG Assistant that answers any placement query instantly.' 
  },
  { 
    q: 'How does the DSA Patterns Lab help with coding rounds?', 
    a: 'Instead of memorizing hundreds of questions, the DSA Lab teaches recurring algorithmic patterns (Sliding Window, Two Pointers, Fast & Slow Pointers, Tree/Graph Traversals, DP) with live compiler execution, automated test cases, and Abstract Syntax Tree (AST) complexity validation.' 
  },
  { 
    q: 'How does the Aptitude module cover concepts and formulas?', 
    a: 'The Aptitude Engine covers all core topics across Quantitative Mathematics, Logical Deduction, Verbal Ability, Non-Verbal Reasoning, and Data Interpretation — featuring detailed mathematical identities, speed shortcut tricks, and step-by-step solution rationales for every problem.' 
  },
  { 
    q: 'What is included in the Placed Alumni Guidance section?', 
    a: 'You get first-hand interview experiences, technical follow-up archives, company-specific difficulty ratings, and practical advice shared by seniors and peers who recently cleared campus drives at top recruiters.' 
  },
  { 
    q: 'How do the AI Mock Interviews adapt to candidate stress?', 
    a: 'NeuroPrep monitors candidate vocal cadence (WPM pace, pitch stability), visual focus, and daily mood check-ins to dynamically calibrate question difficulty and interviewer demeanor, paired with calming box-breathing rituals.' 
  }
];

export default function LandingPage({ onOpenAuth, onExploreDashboard }) {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [activePreviewTab, setActivePreviewTab] = useState('mock');
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: "url('/bg.png')",
      backgroundSize: 'cover',
      backgroundAttachment: 'fixed',
      backgroundPosition: 'center top',
      backgroundRepeat: 'no-repeat',
      fontFamily: 'var(--font-main)'
    }}>

      {/* Top Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(254, 252, 250, 0.92)', backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '0 48px', height: 70, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--btn-sage)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--btn-text)', fontWeight: 800, fontSize: '1rem', boxShadow: 'var(--shadow-3d-btn)' }}>
            NP
          </div>
          <div>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', color: 'var(--main-heading)', letterSpacing: '-0.3px', fontFamily: 'var(--font-heading)' }}>NeuroPrep</span>
            <span style={{ display: 'none', marginLeft: 8, fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700 }}>Placement AI</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <button onClick={() => onOpenAuth('login')} className="btn-secondary-spec" style={{
            padding: '9px 22px', fontSize: '0.86rem', fontWeight: 700, borderRadius: '10px'
          }}>Sign In</button>
          <button onClick={() => onOpenAuth('signup')} className="btn-primary-spec" style={{
            padding: '9px 24px', fontSize: '0.86rem', fontWeight: 700, borderRadius: '10px'
          }}>Get Started Free</button>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '80px 24px 44px', textAlign: 'center' }}>
        
        <span className="pill-tag" style={{ marginBottom: '18px', display: 'inline-block' }}>
          Next-Generation Campus Placement Preparation Platform
        </span>

        <h1 style={{ fontSize: 'clamp(2.1rem, 4.6vw, 3.2rem)', fontWeight: 700, color: 'var(--main-heading)', lineHeight: 1.25, letterSpacing: '-1px', marginBottom: 24, fontFamily: 'var(--font-heading)' }}>
          Master Campus Placements with<br />
          <span style={{
            fontFamily: "'Playfair Display', 'Fraunces', 'Instrument Serif', Georgia, serif",
            fontStyle: 'italic',
            fontWeight: 700,
            fontSize: 'clamp(1.5rem, 3.4vw, 2.35rem)',
            letterSpacing: '-0.4px',
            color: 'var(--accent-terracotta)',
            display: 'inline-block',
            marginTop: '8px'
          }}>
            AI Mock Interviews, DSA Patterns & Aptitude Mastery
          </span>
        </h1>

        <p style={{ fontSize: '1.12rem', color: 'var(--body-text)', lineHeight: 1.7, maxWidth: 760, margin: '0 auto 38px' }}>
          Face realistic AI Avatar interviewers, master high-frequency DSA patterns with AST complexity audits, conquer comprehensive aptitude concepts, access curated placement hub resources, and learn from placed alumni guidance.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 44 }}>
          <button onClick={() => onOpenAuth('signup')} className="btn-primary-spec" style={{
            padding: '16px 38px', borderRadius: 12,
            fontSize: '0.98rem', fontWeight: 800
          }}>
            Start Free Practice Now
          </button>
          <button onClick={onExploreDashboard} className="btn-secondary-spec" style={{
            padding: '16px 36px', borderRadius: 12,
            fontSize: '0.98rem', fontWeight: 700
          }}>
            Explore Placement Hub
          </button>
        </div>

        {/* Feature Pills Banner */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.84rem' }}>
          <span className="pill-tag" style={{ backgroundColor: '#EAECE8', color: '#526257' }}>High-Frequency DSA Patterns</span>
          <span className="pill-tag" style={{ backgroundColor: '#F5EBE6', color: '#9A6854' }}>Aptitude Concept Coverage</span>
          <span className="pill-tag" style={{ backgroundColor: '#EAECE8', color: '#526257' }}>Realistic AI Avatar Panels</span>
          <span className="pill-tag" style={{ backgroundColor: '#F5EBE6', color: '#9A6854' }}>Placement Resource Hub</span>
          <span className="pill-tag" style={{ backgroundColor: '#EAECE8', color: '#526257' }}>Placed Alumni Guidance</span>
          <span className="pill-tag" style={{ backgroundColor: '#F5EBE6', color: '#9A6854' }}>CBT Stress Recovery Suite</span>
        </div>
      </section>

      {/* Recruiter Companies Marquee Ticker */}
      <section style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(254, 252, 250, 0.75)', backdropFilter: 'blur(12px)', padding: '26px 0', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
          Target Placements at Top Indian & Global Tech Recruiters
        </div>
        <div className="marquee-wrapper">
          <div className="marquee-track">
            {[...COMPANIES_MARQUEE, ...COMPANIES_MARQUEE, ...COMPANIES_MARQUEE, ...COMPANIES_MARQUEE].map((c, i) => (
              <div key={i} className="saas-card-spec" style={{
                padding: '10px 22px', display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap', borderRadius: 12, flexShrink: 0
              }}>
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>{c.name}</span>
                <span style={{ fontSize: '0.75rem', color: '#526257', background: '#EAECE8', padding: '3px 8px', borderRadius: 6, fontWeight: 700 }}>{c.role}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-terracotta)' }}>{c.pkg}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4-Step Placement Roadmap / How It Works */}
      <section style={{ maxWidth: 1200, margin: '80px auto 40px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="pill-tag" style={{ marginBottom: '10px' }}>Structured Progression</span>
          <h2 style={{ fontWeight: 700, fontSize: '2.1rem', color: 'var(--main-heading)', letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)' }}>
            The 4-Step Campus Placement Blueprint
          </h2>
          <p style={{ color: 'var(--body-text)', fontSize: '0.92rem', marginTop: 6, maxWidth: 640, margin: '6px auto 0' }}>
            A comprehensive curriculum engineered to take you from foundational concepts to final high-package offers.
          </p>
        </div>

        <div className="blueprint-grid">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="saas-card-spec" style={{ padding: '26px 22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-terracotta)', marginBottom: 10, fontFamily: 'var(--font-heading)' }}>{item.step}</div>
                <h3 style={{ fontWeight: 700, fontSize: '1.08rem', color: 'var(--main-heading)', marginBottom: 10, fontFamily: 'var(--font-heading)', lineHeight: 1.3 }}>{item.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--body-text)', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Platform Preview Sandbox */}
      <section style={{ maxWidth: 1060, margin: '70px auto', padding: '0 24px' }}>
        <div className="saas-card-spec" style={{ padding: '36px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <span className="pill-tag" style={{ marginBottom: '8px' }}>Interactive Sandbox</span>
            <h2 style={{ fontWeight: 700, fontSize: '1.9rem', color: 'var(--main-heading)', letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)' }}>
              Experience the Placement Platform Live
            </h2>
            <p style={{ color: 'var(--body-text)', fontSize: '0.9rem', marginTop: 4 }}>
              Click through the tabs to preview each core pillar of your placement preparation.
            </p>

            <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 22, flexWrap: 'wrap', backgroundColor: '#F5EBE6', padding: '4px', borderRadius: '12px', width: 'fit-content', margin: '22px auto 0', border: '1px solid var(--border-color)' }}>
              {[
                { id: 'mock', label: 'AI Mock Interview' },
                { id: 'dsa', label: 'DSA Patterns & AST' },
                { id: 'aptitude', label: 'Aptitude Concepts' },
                { id: 'hub', label: 'Placement Hub' },
                { id: 'alumni', label: 'Placed Guidance' },
                { id: 'mind', label: 'Stress Recovery' },
              ].map(t => (
                <button key={t.id} onClick={() => setActivePreviewTab(t.id)} style={{
                  padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                  background: activePreviewTab === t.id ? 'var(--btn-sage)' : 'transparent',
                  color: activePreviewTab === t.id ? 'var(--btn-text)' : 'var(--secondary-heading)',
                  fontWeight: 700, fontSize: '0.84rem', transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
                  boxShadow: activePreviewTab === t.id ? 'var(--shadow-3d-btn)' : 'none'
                }}>{t.label}</button>
              ))}
            </div>
          </div>

          {/* Interactive Mock Window */}
          <div style={{ background: 'var(--bg-card-solid)', border: '1.5px solid var(--border-color)', borderRadius: 16, padding: 28, color: 'var(--main-heading)', boxShadow: '0 2px 8px rgba(52, 52, 58, 0.03)' }}>
            
            {activePreviewTab === 'mock' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <span className="pill-tag" style={{ backgroundColor: '#EAECE8', color: '#526257' }}>Active AI Panel: Technical & HR Evaluator</span>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--btn-sage)', fontWeight: 800 }}>Speech Pace: 142 WPM (Optimal)</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-terracotta)', fontWeight: 800 }}>Facial Focus: 94%</span>
                  </div>
                </div>
                <div style={{ background: '#FFFFFF', border: '1.5px solid var(--border-color)', borderRadius: 12, padding: 20, fontSize: '0.94rem', lineHeight: 1.65, marginBottom: 16, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>
                  "Welcome, Vaishali. How would you handle continuous read queries in a distributed microservices deployment where database index updates are causing high latency?"
                </div>
                <div style={{ background: '#F5EBE6', borderRadius: 10, padding: 14, fontSize: '0.86rem', color: 'var(--secondary-heading)', border: '1px solid var(--border-color)' }}>
                  <em>Candidate Spoken Response detected: "I would introduce Redis read-through caching to decouple reads from write indexes, paired with event-driven cache invalidation..."</em>
                </div>
              </div>
            )}

            {activePreviewTab === 'dsa' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--main-heading)', fontWeight: 700 }}>Pattern: Sliding Window &bull; Maximum Subarray</span>
                  <span className="pill-tag" style={{ backgroundColor: '#EAECE8', color: '#526257' }}>5/5 Test Cases Passed &bull; O(N) AST Verified</span>
                </div>
                <pre style={{ fontSize: '0.85rem', color: 'var(--main-heading)', fontFamily: 'var(--font-code)', lineHeight: 1.55, background: '#FFFFFF', padding: 18, borderRadius: 12, border: '1.5px solid var(--border-color)' }}>
                  {`function maxSubArray(nums) {\n  let maxSoFar = nums[0], curr = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    curr = Math.max(nums[i], curr + nums[i]);\n    maxSoFar = Math.max(maxSoFar, curr);\n  }\n  return maxSoFar; // O(N) Time Complexity, O(1) Space Complexity\n}`}
                </pre>
              </div>
            )}

            {activePreviewTab === 'aptitude' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
                  <span className="pill-tag" style={{ backgroundColor: '#EAECE8', color: '#526257' }}>Topic: Time, Speed & Distance (Relative Motion)</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--accent-terracotta)', fontWeight: 800 }}>Shortcut Rule: km/h to m/s = &times; 5/18</span>
                </div>
                <div style={{ background: '#FFFFFF', border: '1.5px solid var(--border-color)', borderRadius: 12, padding: 20, fontSize: '0.94rem', lineHeight: 1.6, marginBottom: 14, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>
                  A train 180 meters long running at 72 km/h crosses a platform in 25 seconds. What is the length of the platform?
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                  <div style={{ padding: '10px 14px', borderRadius: 8, border: '1.5px solid var(--btn-sage)', backgroundColor: '#EAECE8', color: 'var(--main-heading)', fontWeight: 700, fontSize: '0.86rem' }}>
                    320 meters (Platform Length)
                  </div>
                  <div style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-color)', backgroundColor: '#FFFFFF', color: 'var(--body-text)', fontSize: '0.86rem' }}>
                    280 meters
                  </div>
                </div>
                <div style={{ background: '#FAF5F1', borderRadius: 10, padding: 12, fontSize: '0.82rem', color: 'var(--body-text)', border: '1px solid var(--border-color)' }}>
                  <strong>Step-by-Step Rationale:</strong> Speed = 72 * (5/18) = 20 m/s. Total distance = 20 * 25 = 500 m. Platform = 500 - 180 = 320 meters.
                </div>
              </div>
            )}

            {activePreviewTab === 'hub' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                  <span className="pill-tag" style={{ backgroundColor: '#EAECE8', color: '#526257' }}>Placement Resource Hub & AI RAG</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--main-heading)', fontWeight: 700 }}>Company Syllabus & Core Archives</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
                  <div style={{ background: '#FFFFFF', border: '1.5px solid var(--border-color)', padding: 16, borderRadius: 12 }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>TCS Digital Kit</div>
                    <div style={{ fontWeight: 700, color: 'var(--main-heading)', fontSize: '0.92rem', marginTop: 4 }}>Advanced Coding & Quants</div>
                  </div>
                  <div style={{ background: '#FFFFFF', border: '1.5px solid var(--border-color)', padding: 16, borderRadius: 12 }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Zoho Developer Track</div>
                    <div style={{ fontWeight: 700, color: 'var(--main-heading)', fontSize: '0.92rem', marginTop: 4 }}>OOP Design & C/Java Debugging</div>
                  </div>
                  <div style={{ background: '#FFFFFF', border: '1.5px solid var(--border-color)', padding: 16, borderRadius: 12 }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Core CS RAG Search</div>
                    <div style={{ fontWeight: 700, color: 'var(--main-heading)', fontSize: '0.92rem', marginTop: 4 }}>Instant OS, DBMS & CN Answers</div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'alumni' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                  <span className="pill-tag" style={{ backgroundColor: '#EAECE8', color: '#526257' }}>Verified Placed Alumni Insights</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--accent-terracotta)', fontWeight: 800 }}>Zoho SDE (12 LPA)</span>
                </div>
                <div style={{ background: '#FFFFFF', border: '1.5px solid var(--border-color)', borderRadius: 12, padding: 18, fontSize: '0.88rem', lineHeight: 1.65, color: 'var(--body-text)' }}>
                  <strong style={{ color: 'var(--main-heading)' }}>Alumni Advice:</strong> "Round 1 is purely C/Java syntax output tracing and aptitude speed. In Round 2, focus on modular Clean Code — use functions and clear variable names rather than one-liners. In Round 3, design a clean Railway Reservation or Splitwise system with OOP principles."
                </div>
              </div>
            )}

            {activePreviewTab === 'mind' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
                  <span className="pill-tag" style={{ backgroundColor: '#EAECE8', color: '#526257' }}>Cognitive Mind Care Suite</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--accent-terracotta)', fontWeight: 700 }}>Box Breathing: Inhale (4s) &bull; Hold (4s)</span>
                </div>
                <div style={{ fontSize: '0.88rem', color: 'var(--body-text)', lineHeight: 1.65, background: '#FFFFFF', padding: 18, borderRadius: 12, border: '1.5px solid var(--border-color)' }}>
                  <strong>CBT Cognitive Reappraisal:</strong> "I am nervous about Round 2 because I care about doing well. Nervousness is just my body mobilizing focus and energy to solve problems quickly."
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      {/* Complete 6-Pillar Core Modules Grid */}
      <section style={{ maxWidth: 1060, margin: '0 auto', padding: '40px 24px 72px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <span className="pill-tag" style={{ marginBottom: '8px' }}>Placement Arsenal</span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--main-heading)', letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)' }}>
            Six Integrated Modules For 100% Placement Readiness
          </h2>
          <p style={{ color: 'var(--body-text)', fontSize: '0.92rem', marginTop: 6 }}>
            Every tool needed to master competitive aptitude concepts, DSA patterns, placement resources, and alumni guidance.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24 }}>
          {CORE_MODULES.map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              className="saas-card-spec"
              style={{
                padding: 30,
                borderColor: hoveredFeature === i ? 'var(--btn-sage)' : 'var(--border-color)',
                transition: 'all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1)', cursor: 'default',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
              }}
            >
              <div>
                <div style={{ marginBottom: 12 }}>
                  <span className="pill-tag" style={{ backgroundColor: '#F5EBE6', color: '#9A6854' }}>{f.tag}</span>
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.2rem', marginBottom: 10, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>{f.title}</h3>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.65, color: 'var(--body-text)', margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials / Student Success Stories */}
      <section style={{ maxWidth: 1120, margin: '60px auto', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <span className="pill-tag" style={{ marginBottom: '8px' }}>Verified Offers</span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--main-heading)', letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)' }}>
            Placed Engineering Students & Alumni
          </h2>
          <p style={{ color: 'var(--body-text)', fontSize: '0.92rem', marginTop: 6 }}>
            Real experiences from candidates who cleared their dream placement drives using NeuroPrep.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 22 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="saas-card-spec" style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <p style={{ fontSize: '0.92rem', color: 'var(--body-text)', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.96rem', color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>{t.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{t.college}</div>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-terracotta)', marginTop: 4 }}>{t.company}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Accordion */}
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '72px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 44 }}>
          <span className="pill-tag" style={{ marginBottom: '8px' }}>Got Questions?</span>
          <h2 style={{ fontSize: '2.1rem', fontWeight: 700, color: 'var(--main-heading)', letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)' }}>
            Frequently Asked Questions
          </h2>
          <p style={{ color: 'var(--body-text)', fontSize: '0.92rem', marginTop: 6 }}>
            Everything you need to know about preparing for campus drives with NeuroPrep.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} className="saas-card-spec" style={{ padding: 0, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    width: '100%', padding: '22px 26px', background: 'none', border: 'none',
                    textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', fontWeight: 700, fontSize: '0.96rem', color: 'var(--main-heading)',
                    fontFamily: 'var(--font-heading)'
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: '0.82rem', color: 'var(--accent-terracotta)', fontWeight: 800 }}>{isOpen ? '[Hide]' : '[Show]'}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 26px 22px', fontSize: '0.88rem', color: 'var(--body-text)', lineHeight: 1.7, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer Banner */}
      <section style={{ maxWidth: 1060, margin: '0 auto 60px', padding: '0 24px' }}>
        <div className="saas-card-spec" style={{ padding: '56px 36px', textAlign: 'center' }}>
          <span className="pill-tag" style={{ marginBottom: '12px' }}>Zero Cost &bull; Instant Access</span>
          <h2 style={{ fontSize: '2.3rem', fontWeight: 700, color: 'var(--main-heading)', letterSpacing: '-0.8px', marginBottom: 14, fontFamily: 'var(--font-heading)' }}>
            Ready to Crack Your Campus Placement Drive?
          </h2>
          <p style={{ color: 'var(--body-text)', marginBottom: 34, fontSize: '1.02rem', maxWidth: 540, margin: '0 auto 34px', lineHeight: 1.6 }}>
            Join thousands of engineering students mastering technical rounds, coding assessments, and aptitude concepts with AI guidance.
          </p>
          <button onClick={() => onOpenAuth('signup')} className="btn-primary-spec" style={{
            padding: '16px 42px', borderRadius: 12,
            fontWeight: 800, fontSize: '1rem'
          }}>
            Create Free Student Account
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ backgroundColor: 'rgba(254, 252, 250, 0.85)', backdropFilter: 'blur(10px)', borderTop: '1px solid var(--border-color)', padding: '28px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
        &copy; 2025 NeuroPrep &bull; Stress-Adaptive Placement Ecosystem &bull; Built for Engineering Students
      </footer>
    </div>
  );
}

