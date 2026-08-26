import React, { useState } from 'react';

const HOW_IT_WORKS = [
  { step: '01', title: 'Upload Resume & Target Company', desc: 'Instant 100% local PDF scan extracts your technical skills, experience tier, and target recruiter requirements (TCS, Zoho, Infosys, Amazon).' },
  { step: '02', title: 'Practice AI Mock & Coding Rounds', desc: 'Face stress-adaptive technical & HR questions. Practice top SDE sheet problems with live compiler test cases and AST complexity checks.' },
  { step: '03', title: 'Review Detailed Readiness Scorecard', desc: 'Get quantifiable feedback on your speech pace (WPM), technical correctness, ATS resume alignment, and personalized preparation tips.' },
];

const FEATURES = [
  { title: 'AI Mock Interview Panel', desc: 'Stress-adaptive technical & HR sessions that adjust difficulty and question pace to your mood in real time.' },
  { title: 'Coding & AST Analysis', desc: 'Solve top SDE sheet DSA problems with live compiler test case feedback and AST complexity checks.' },
  { title: 'ATS Resume Parser', desc: 'Upload your PDF resume to extract skills, calculate recruiter match scores, and remove generic noise.' },
  { title: 'Placement Master Roadmap', desc: 'Semester-by-semester structured preparation path from 1st year fundamentals to campus drive sprints.' },
  { title: 'SDE Sheet & Logic Puzzles', desc: 'Curated list of top coding patterns and logic puzzles frequently asked at TCS, Infosys, Zoho & Amazon.' },
  { title: 'CBT Mind & Stress Recovery', desc: 'Evidence-based cognitive reframing, box breathing timers, and anxiety grounding rituals.' },
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
  { name: 'Vaishali V.', college: 'TCE Madurai', company: 'Placed at Zoho (12 LPA)', text: 'The AI Mock Interview panel was incredible! It matched the exact strict technical follow-ups I faced in my actual Zoho interview round.' },
  { name: 'Karthik R.', college: 'PSG Tech', company: 'Placed at TCS Digital (7 LPA)', text: 'The ATS Scanner helped me filter out non-technical noise from my resume. My resume score jumped from 52% to 88%!' },
  { name: 'Priya S.', college: 'NIT Trichy', company: 'Placed at Accenture (8.5 LPA)', text: 'The stress recovery box breathing tool kept me calm on drive day. Combined with the company prep kit, I cleared all 4 rounds easily.' },
];

const FAQS = [
  { q: 'How does NeuroPrep adapt to my stress level during mock interviews?', a: 'NeuroPrep uses your daily mood check-in telemetry to adjust question complexity, interviewer tone, and time limits — keeping you in an optimal learning zone without overwhelming anxiety.' },
  { q: 'Does the ATS Resume Scanner require an external backend or API?', a: 'No! NeuroPrep includes a 100% client-side instant PDF resume parser that extracts technical skills, detects experience levels, and calculates keyword impact directly in your browser.' },
  { q: 'Is NeuroPrep suitable for all engineering departments?', a: 'Yes! While designed with CSE/IT placement drives in mind, it supports aptitude, logical reasoning, and basic coding for ECE, EEE, Mechanical, and Civil students.' },
  { q: 'Are company prep kits tailored for specific Indian recruiters?', a: 'Yes, we include specialized prep tracks for TCS, Infosys, Wipro, Zoho, Accenture, Cognizant, Amazon, and more.' }
];

export default function LandingPage({ onOpenAuth, onExploreDashboard }) {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [activePreviewTab, setActivePreviewTab] = useState('mock');
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F8F9FA', fontFamily: "'Inter', sans-serif" }}>

      {/* Top Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid #E5E7EB',
        padding: '0 48px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#111827', fontWeight: 800, fontSize: '0.9rem' }}>
            NP
          </div>
          <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#111827', letterSpacing: '-0.5px' }}>NeuroPrep</span>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => onOpenAuth('login')} style={{
            padding: '8px 20px', borderRadius: 8, border: '1px solid #E5E7EB',
            background: 'transparent', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#374151'
          }}>Sign In</button>
          <button onClick={() => onOpenAuth('signup')} style={{
            padding: '8px 20px', borderRadius: 8, border: 'none',
            background: '#475569', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#fff'
          }}>Get Started Free</button>
        </div>
      </header>

      {/* Hero Section - Thita.ai Style */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '80px 24px 50px', textAlign: 'center' }}>

        <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 900, color: '#111827', lineHeight: 1.1, letterSpacing: '-2px', marginBottom: 24 }}>
          Supercharge Your Placement Prep<br />
          <span style={{ color: '#6B7280' }}>With AI Mock Interviews & DSA Labs</span>
        </h1>

        <p style={{ fontSize: '1.1rem', color: '#6B7280', lineHeight: 1.7, maxWidth: 680, margin: '0 auto 36px' }}>
          Simulate technical & HR interviews, optimize your resume for recruiter ATS screening, solve top SDE sheet DSA problems, and track your readiness with real-time AI feedback.
        </p>

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <button onClick={() => onOpenAuth('signup')} style={{
            padding: '15px 36px', borderRadius: 12, border: 'none',
            background: '#475569', color: '#fff', cursor: 'pointer',
            fontWeight: 700, fontSize: '0.95rem'
          }}>
            Start Free Practice
          </button>
          <button onClick={onExploreDashboard} style={{
            padding: '15px 36px', borderRadius: 12, border: '1px solid #E5E7EB',
            background: '#fff', color: '#374151', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.95rem'
          }}>
            Explore Placement Hub
          </button>
        </div>

        {/* Feature Pills Banner */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', fontSize: '0.8rem', color: '#4B5563', fontWeight: 600 }}>
          <span>100% Free Client-Side ATS</span>
          <span>•</span>
          <span>Real-Time Speech Telemetry</span>
          <span>•</span>
          <span>Top 100 SDE Sheet Puzzles</span>
        </div>
      </section>

      {/* Recruiter Companies Marquee */}
      <section style={{ borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', backgroundColor: '#fff', padding: '24px 0', overflow: 'hidden' }}>
        <div style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 800, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
          Target Placements at Top Companies
        </div>
        <div className="marquee-track" style={{ gap: 24, paddingLeft: 24 }}>
          {[...COMPANIES_MARQUEE, ...COMPANIES_MARQUEE].map((c, i) => (
            <div key={i} style={{
              background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 12,
              padding: '10px 20px', display: 'flex', alignItems: 'center', gap: 12, whiteSpace: 'nowrap'
            }}>
              <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>{c.name}</span>
              <span style={{ fontSize: '0.75rem', color: '#6B7280', background: '#E5E7EB', padding: '2px 8px', borderRadius: 6 }}>{c.role}</span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827' }}>{c.pkg}</span>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works Section - Thita.ai 3-Step Workflow */}
      <section style={{ maxWidth: 1000, margin: '70px auto 40px', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontWeight: 800, fontSize: '2rem', color: '#111827', letterSpacing: '-1px' }}>
            How Thita AI Prepares You for Campus Drives
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', marginTop: 6 }}>
            A structured 3-step workflow designed to transform your technical accuracy and interview confidence.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 32 }}>
              <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#111827', marginBottom: 12 }}>{item.step}</div>
              <h3 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#111827', marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Interactive Platform Preview Component */}
      <section style={{ maxWidth: 1000, margin: '60px auto', padding: '0 24px' }}>
        <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 20, padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ fontWeight: 800, fontSize: '1.8rem', color: '#111827', letterSpacing: '-0.5px' }}>
              Experience the Placement Platform
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.88rem', marginTop: 4 }}>
              Click through the modules to preview how NeuroPrep sharpens your skills.
            </p>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 20, flexWrap: 'wrap' }}>
              {[
                { id: 'mock', label: 'AI Mock Interview' },
                { id: 'coding', label: 'Coding Lab' },
                { id: 'ats', label: 'ATS Scanner' },
                { id: 'roadmap', label: 'Roadmap' },
              ].map(t => (
                <button key={t.id} onClick={() => setActivePreviewTab(t.id)} style={{
                  padding: '8px 18px', borderRadius: 10, border: '1px solid #E5E7EB', cursor: 'pointer',
                  background: activePreviewTab === t.id ? '#111827' : '#F3F4F6',
                  color: activePreviewTab === t.id ? '#fff' : '#374151',
                  fontWeight: 700, fontSize: '0.82rem', transition: 'all 0.15s'
                }}>{t.label}</button>
              ))}
            </div>
          </div>

          {/* Interactive Mock Window - Light Grey Theme */}
          <div style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 14, padding: 28, color: '#111827' }}>
            {activePreviewTab === 'mock' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: '0.78rem', background: '#E5E7EB', padding: '4px 12px', borderRadius: 12, fontWeight: 700, color: '#111827' }}>Active AI Panel: Moderator & Technical Evaluator</span>
                  <span style={{ fontSize: '0.78rem', color: '#111827', fontWeight: 700 }}>Live Speech Telemetry (142 WPM)</span>
                </div>
                <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 10, padding: 18, fontSize: '0.88rem', lineHeight: 1.6, marginBottom: 16, color: '#111827' }}>
                  "Welcome, Vaishali. How would you handle continuous read queries in a microservices deployment where database index updates are causing high latency?"
                </div>
                <div style={{ background: '#E5E7EB', borderRadius: 10, padding: 14, fontSize: '0.82rem', color: '#374151' }}>
                  <em>Candidate Spoken Response detected: "I would introduce Redis read-through caching to decouple reads from write indexes..."</em>
                </div>
              </div>
            )}

            {activePreviewTab === 'coding' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: '0.78rem', color: '#111827', fontWeight: 700 }}>Compiler: JavaScript / AST Complexity Analysis</span>
                  <span style={{ fontSize: '0.78rem', color: '#111827', fontWeight: 700 }}>5/5 Test Cases Passed</span>
                </div>
                <pre style={{ fontSize: '0.82rem', color: '#111827', fontFamily: 'monospace', lineHeight: 1.5, background: '#fff', padding: 16, borderRadius: 10, border: '1px solid #E5E7EB' }}>
                  {`function maxSubArray(nums) {\n  let maxSoFar = nums[0], curr = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    curr = Math.max(nums[i], curr + nums[i]);\n    maxSoFar = Math.max(maxSoFar, curr);\n  }\n  return maxSoFar; // O(N) Time, O(1) Space\n}`}
                </pre>
              </div>
            )}

            {activePreviewTab === 'ats' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: '0.78rem', color: '#111827', fontWeight: 700 }}>Candidate Resume Scan: resume_vaishali.pdf</span>
                  <span style={{ fontSize: '1rem', fontWeight: 900, color: '#111827' }}>88% Match</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, textAlign: 'center' }}>
                  <div style={{ background: '#fff', border: '1px solid #E5E7EB', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Keyword Alignment</div>
                    <div style={{ fontWeight: 800, color: '#111827', fontSize: '1rem' }}>92%</div>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #E5E7EB', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Quantifiable Impact</div>
                    <div style={{ fontWeight: 800, color: '#111827', fontSize: '1rem' }}>84%</div>
                  </div>
                  <div style={{ background: '#fff', border: '1px solid #E5E7EB', padding: 12, borderRadius: 8 }}>
                    <div style={{ fontSize: '0.7rem', color: '#6B7280' }}>Layout Clarity</div>
                    <div style={{ fontWeight: 800, color: '#111827', fontSize: '1rem' }}>88%</div>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'roadmap' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: '0.78rem', color: '#111827', fontWeight: 700 }}>Semester 6 Target: SDE Prep Sprint</span>
                  <span style={{ fontSize: '0.78rem', color: '#111827', fontWeight: 700 }}>14/18 Milestones Done</span>
                </div>
                <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.6, background: '#fff', padding: 16, borderRadius: 10, border: '1px solid #E5E7EB' }}>
                  [Done] Master Dynamic Programming & Graph Traversals (BFS/DFS)<br />
                  [Done] Complete Top 100 SDE Sheet (Arrays, Strings, Linked Lists)<br />
                  [Done] Conduct 3 Stress-Adaptive Mock Interviews with AI Evaluator Panel
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section style={{ maxWidth: 1000, margin: '0 auto', padding: '40px 24px 72px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: 12, letterSpacing: '-1px' }}>
          Complete Placement Arsenal
        </h2>
        <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: 48 }}>
          Six integrated modules built to take you from foundational coding to final offer letters.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div
              key={i}
              onMouseEnter={() => setHoveredFeature(i)}
              onMouseLeave={() => setHoveredFeature(null)}
              style={{
                padding: 28, borderRadius: 16,
                border: `1px solid ${hoveredFeature === i ? '#111827' : '#E5E7EB'}`,
                backgroundColor: hoveredFeature === i ? '#F3F4F6' : '#fff',
                color: '#111827',
                transition: 'all 0.2s ease', cursor: 'default'
              }}
            >
              <h3 style={{ fontWeight: 800, fontSize: '1.05rem', marginBottom: 8, color: '#111827' }}>{f.title}</h3>
              <p style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#4B5563' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials / Success Stories */}
      <section style={{ backgroundColor: '#fff', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB', padding: '72px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: 12, letterSpacing: '-1px' }}>
            Placed Engineering Students
          </h2>
          <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: 48 }}>
            Real reviews from students who cracked top drives using NeuroPrep.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={i} style={{ background: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 16, padding: 26 }}>
                <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.7, marginBottom: 20, fontStyle: 'italic' }}>"{t.text}"</p>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827' }}>{t.name}</div>
                  <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{t.college}</div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', marginTop: 4 }}>{t.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section style={{ maxWidth: 800, margin: '0 auto', padding: '72px 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: 12, letterSpacing: '-1px' }}>
          Frequently Asked Questions
        </h2>
        <p style={{ textAlign: 'center', color: '#6B7280', marginBottom: 40 }}>
          Everything you need to know about preparing with NeuroPrep.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 14, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    width: '100%', padding: '20px 24px', background: 'none', border: 'none',
                    textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', fontWeight: 700, fontSize: '0.92rem', color: '#111827'
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>{isOpen ? '[Hide]' : '[Show]'}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 24px 20px', fontSize: '0.85rem', color: '#6B7280', lineHeight: 1.7, borderTop: '1px solid #F3F4F6', paddingTop: 14 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Footer Banner - Light Grey Theme */}
      <section style={{ backgroundColor: '#F3F4F6', borderTop: '1px solid #E5E7EB', padding: '72px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#111827', letterSpacing: '-1px', marginBottom: 16 }}>
          Ready to Crack Your Placement Drive?
        </h2>
        <p style={{ color: '#4B5563', marginBottom: 36, fontSize: '1rem', maxWidth: 500, margin: '0 auto 36px' }}>
          Join thousands of engineering students mastering technical interviews and coding rounds.
        </p>
        <button onClick={() => onOpenAuth('signup')} style={{
          padding: '15px 38px', borderRadius: 12, border: 'none',
          background: '#475569', color: '#fff', cursor: 'pointer',
          fontWeight: 800, fontSize: '1rem'
        }}>
          Create Free Account
        </button>
      </section>

      {/* Footer - Light Theme */}
      <footer style={{ backgroundColor: '#F8F9FA', borderTop: '1px solid #E5E7EB', padding: '24px', textAlign: 'center', color: '#6B7280', fontSize: '0.8rem' }}>
        © 2025 NeuroPrep · Stress-Adaptive Placement Ecosystem · Built for Engineering Students
      </footer>
    </div>
  );
}

