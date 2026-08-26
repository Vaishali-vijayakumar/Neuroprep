import React, { useState, useEffect, useRef } from 'react';

// Question Banks
const QA_BANKS = {
  hr: [
    { q: 'Tell me about yourself.', hint: 'Structure: Past - Present - Future (2 min)' },
    { q: 'Where do you see yourself in 5 years?', hint: 'Align with company growth trajectory' },
    { q: 'Why do you want to join this company?', hint: "Research the company's mission and products" },
    { q: 'What is your greatest weakness?', hint: 'Mention real weakness plus mitigation strategy' },
    { q: 'Describe a conflict at work and how you resolved it.', hint: 'Use STAR method' },
    { q: 'How do you handle pressure and tight deadlines?', hint: 'Give a concrete example' },
  ],
  technical: [
    { q: 'Explain the concept of RESTful APIs.', hint: 'HTTP methods, stateless, resource-based' },
    { q: 'What is the difference between SQL and NoSQL databases?', hint: 'Schema, scalability, consistency' },
    { q: 'Explain Object-Oriented Programming principles.', hint: 'Encapsulation, inheritance, polymorphism, abstraction' },
    { q: 'What is a microservices architecture?', hint: 'Small independent services, API gateway, decoupling' },
    { q: 'Describe the differences between TCP and UDP.', hint: 'Reliability, speed, use-cases' },
  ],
  dsa: [
    { q: 'Reverse a linked list in-place.', hint: 'Three-pointer approach O(n) time, O(1) space' },
    { q: "Find the maximum subarray sum (Kadane's Algorithm).", hint: 'Dynamic programming approach' },
    { q: 'Implement a BFS on a graph.', hint: 'Use a queue, visited set' },
    { q: 'Given a binary tree, find its height.', hint: 'Recursive DFS approach' },
    { q: 'Merge two sorted arrays.', hint: 'Two-pointer technique O(n+m)' },
  ],
  coding: [
    { q: 'Write a function to check if a string is a palindrome.', hint: 'Two-pointer or string reversal' },
    { q: 'Implement a stack using two queues.', hint: 'Push O(n) or pop O(n) approach' },
    { q: 'Find all unique permutations of a string.', hint: 'Backtracking with visited array' },
    { q: 'Write a function to detect a cycle in a linked list.', hint: "Floyd's cycle detection algorithm" },
  ],
  gd: [
    { q: 'Topic: Artificial Intelligence will replace human jobs. Discuss.', hint: 'Consider both automation and job creation aspects' },
    { q: 'Topic: Work from home vs Office - which is better for productivity?', hint: 'Balance individual and team collaboration factors' },
    { q: 'Topic: Social media is doing more harm than good to society.', hint: 'Mental health, misinformation vs connectivity' },
  ],
  behavioral: [
    { q: 'Tell me about a time you demonstrated leadership.', hint: 'STAR: Situation, Task, Action, Result' },
    { q: 'Describe a situation where you failed. What did you learn?', hint: 'Show self-awareness and growth mindset' },
    { q: 'Give an example of how you work under pressure.', hint: 'Specific story, measurable outcome' },
  ],
  managerial: [
    { q: 'How would you handle an underperforming team member?', hint: 'Feedback, support, escalation path' },
    { q: 'Describe your approach to prioritizing multiple urgent tasks.', hint: 'Eisenhower matrix, delegation' },
    { q: 'How do you build trust with a new team?', hint: 'Transparency, quick wins, listening' },
  ],
  systemDesign: [
    { q: 'Design a URL shortener like Bit.ly.', hint: 'Hashing, DB schema, read-heavy caching' },
    { q: "Design Twitter's feed algorithm.", hint: 'Fan-out on read vs write, CDN, ranking' },
    { q: 'Design a distributed cache system.', hint: 'Consistent hashing, eviction policies, replication' },
  ],
  companySpecific: [
    { q: 'Why do you want to work at Google specifically?', hint: 'Mention projects, culture, scale of impact' },
    { q: 'Amazon LP: Tell me about a time you were customer obsessed.', hint: "Use Amazon's Leadership Principles framework" },
    { q: 'Microsoft: How do you approach ambiguous problems?', hint: 'Clarify, break down, iterate' },
  ],
  domain: [
    { q: 'Explain the CAP theorem and its implications in distributed systems.', hint: 'Consistency, Availability, Partition tolerance trade-offs' },
    { q: 'What is the difference between supervised and unsupervised learning?', hint: 'Labels, clustering, regression vs classification' },
    { q: 'Explain ACID properties in database transactions.', hint: 'Atomicity, Consistency, Isolation, Durability' },
  ],
  resumeBased: [
    { q: 'Tell me about your final year project in depth.', hint: 'Tech stack, challenges, impact, learnings' },
    { q: 'Explain a key contribution you made in your internship.', hint: 'Quantify impact: 30% faster, 50% reduction' },
    { q: 'You listed React in your skills. Build a counter app in real-time.', hint: 'useState hook, event handlers' },
  ],
  projectViva: [
    { q: 'Why did you choose this specific technology stack for your project?', hint: 'Trade-offs vs alternatives' },
    { q: 'What were the bottlenecks in your system and how did you address them?', hint: 'Profiling, optimization strategies' },
    { q: 'How would you scale your project to handle 10x more users?', hint: 'Load balancing, caching, horizontal scaling' },
  ],
  aptitude: [
    { q: 'If a train travels 60km in 45 minutes, what is its speed in km/h?', hint: 'Speed = Distance/Time, convert minutes to hours' },
    { q: 'A pipe fills a tank in 4 hours and another empties it in 6 hours. How long to fill the tank?', hint: 'Net rate = 1/4 - 1/6 per hour' },
    { q: 'Find the next number in: 2, 6, 12, 20, 30, ?', hint: 'Pattern: n(n+1)' },
  ],
};

const PERSONALITIES = [
  { id: 'friendly', label: 'Friendly', desc: 'Warm and encouraging tone' },
  { id: 'strict', label: 'Strict', desc: 'Direct and demanding evaluation style' },
  { id: 'neutral', label: 'Neutral', desc: 'Balanced, standard corporate interviewer style' },
];

const INTERVIEW_TYPES = [
  { id: 'hr', label: 'HR Interview', desc: 'Culture fit, communication, and soft skills', bank: 'hr' },
  { id: 'technical', label: 'Technical', desc: 'Core CS concepts and software engineering fundamentals', bank: 'technical' },
  { id: 'dsa', label: 'DSA', desc: 'Data structures, algorithm complexity, and problem solving', bank: 'dsa' },
  { id: 'coding', label: 'Coding', desc: 'Live code implementation and syntax verification', bank: 'coding' },
  { id: 'gd', label: 'Group Discussion', desc: 'Topic analysis, argument structuring, and debate', bank: 'gd' },
  { id: 'behavioral', label: 'Behavioral', desc: 'STAR-method situational and past experience scenarios', bank: 'behavioral' },
  { id: 'managerial', label: 'Managerial', desc: 'Leadership, ownership, and project management', bank: 'managerial' },
  { id: 'systemDesign', label: 'System Design', desc: 'High-level architecture, scalability, and distributed systems', bank: 'systemDesign' },
  { id: 'companySpecific', label: 'Company-Specific', desc: 'Tailored questions aligned with top target employers', bank: 'companySpecific' },
  { id: 'domain', label: 'Domain Interview', desc: 'Deep-dive into specific tech tracks and specializations', bank: 'domain' },
  { id: 'resumeBased', label: 'Resume-Based', desc: 'Cross-examination of projects and skills from your resume', bank: 'resumeBased' },
  { id: 'projectViva', label: 'Project Viva', desc: 'Architectural defend-your-project viva session', bank: 'projectViva' },
  { id: 'aptitude', label: 'Aptitude Oral', desc: 'Verbal reasoning, quantitative analysis, and logic', bank: 'aptitude' },
];

const COMPANIES = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Apple', 'Infosys', 'TCS', 'Wipro', 'Cognizant', 'Accenture', 'Deloitte', 'IBM', 'Adobe', 'Flipkart', 'Swiggy', 'Zomato', 'Uber'];
const LANGUAGES = ['English', 'Hindi', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Marathi'];
const DURATIONS = [15, 30, 45];
const DIFFICULTIES = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

// Helper ProgressBar
function SimpleProgressBar({ value, max = 100, height = 6 }) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div style={{ backgroundColor: '#E5E7EB', borderRadius: '999px', height: `${height}px`, overflow: 'hidden', width: '100%' }}>
      <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: '#111827', borderRadius: '999px', transition: 'width 0.4s ease' }} />
    </div>
  );
}

// ── Module 1: Interview Selection ──────────────────────────────────────────
function InterviewSelection({ onSelect, setActiveTab }) {
  const [search, setSearch] = useState('');
  const filtered = INTERVIEW_TYPES.filter(t => 
    t.label.toLowerCase().includes(search.toLowerCase()) || 
    t.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.3px' }}>
            Choose Interview Module
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            Select from 13 specialized mock interview tracks to test your readiness.
          </p>
        </div>
        <button 
          onClick={() => setActiveTab && setActiveTab('dashboard')} 
          className="btn-secondary-spec"
          style={{ padding: '8px 18px', fontSize: '0.85rem', fontWeight: 600 }}
        >
          Back to Dashboard
        </button>
      </div>

      <div style={{ marginBottom: '24px', maxWidth: '420px' }}>
        <input 
          value={search} 
          onChange={e => setSearch(e.target.value)} 
          placeholder="Search interview types (e.g. Technical, DSA, System Design)..." 
          className="input-field" 
          style={{ padding: '12px 16px', fontSize: '0.9rem' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filtered.map(type => (
          <div 
            key={type.id} 
            onClick={() => onSelect(type)}
            className="saas-card-spec card-hover-effect"
            style={{ 
              cursor: 'pointer', 
              display: 'flex', 
              justify: 'space-between', 
              alignItems: 'center',
              padding: '18px 24px'
            }}
          >
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#111827', margin: '0 0 4px 0' }}>
                {type.label}
              </h3>
              <p style={{ color: '#4B5563', fontSize: '0.88rem', margin: 0, lineHeight: 1.4 }}>
                {type.desc}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Configuration Modal Popup Component (Professional Centered UI) ───────────
function InterviewConfigModal({ interviewType, onClose, onStart }) {
  const [difficulty, setDifficulty] = useState('medium');
  const [personality, setPersonality] = useState('neutral');
  const [duration, setDuration] = useState(30);
  const [language, setLanguage] = useState('English');
  const [company, setCompany] = useState('');
  const [numQ, setNumQ] = useState(5);
  const [enableVideo, setEnableVideo] = useState(true);
  const [enableMic, setEnableMic] = useState(true);
  const [enableHints, setEnableHints] = useState(true);

  return (
    <div 
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      <div 
        onClick={e => e.stopPropagation()}
        style={{
          width: 'clamp(320px, 94vw, 500px)',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          padding: '32px 36px',
          position: 'relative',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }}
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          aria-label="Close modal"
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: '#6B7280',
            fontWeight: 400,
            fontSize: '1.2rem',
            zIndex: 10,
            padding: '4px'
          }}
        >
          ✕
        </button>

        {/* Scrollable Modal Content */}
        <div style={{ overflowY: 'auto', paddingRight: '4px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Centered Header */}
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#111827', margin: '0 0 6px 0' }}>
              {interviewType.label}
            </h2>
            <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: 0 }}>
              Configure your interview preferences
            </p>
          </div>

          {/* Form Content Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* Difficulty Selector */}
            <div style={{ textAlign: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Difficulty Level
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {DIFFICULTIES.map(d => {
                  const active = difficulty === d.id;
                  return (
                    <button 
                      key={d.id} 
                      type="button"
                      onClick={() => setDifficulty(d.id)}
                      style={{
                        padding: '8px 24px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: active ? '1px solid #111827' : '1px solid #D1D5DB',
                        backgroundColor: active ? '#111827' : '#FFFFFF',
                        color: active ? '#FFFFFF' : '#374151',
                        fontWeight: 500,
                        fontSize: '0.85rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Persona Selector */}
            <div style={{ textAlign: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Interviewer Persona
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {PERSONALITIES.map(p => {
                  const active = personality === p.id;
                  return (
                    <button 
                      key={p.id} 
                      type="button"
                      onClick={() => setPersonality(p.id)}
                      style={{
                        padding: '8px 24px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        border: active ? '1px solid #111827' : '1px solid #D1D5DB',
                        backgroundColor: active ? '#111827' : '#FFFFFF',
                        color: active ? '#FFFFFF' : '#374151',
                        fontWeight: 500,
                        fontSize: '0.85rem',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {p.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration & Questions Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                  Duration
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {DURATIONS.map(d => {
                    const active = duration === d;
                    return (
                      <button 
                        key={d} 
                        type="button"
                        onClick={() => setDuration(d)}
                        style={{
                          flex: 1,
                          padding: '8px 4px',
                          borderRadius: '6px',
                          border: active ? '1px solid #111827' : '1px solid #D1D5DB',
                          backgroundColor: active ? '#111827' : '#FFFFFF',
                          color: active ? '#FFFFFF' : '#374151',
                          fontSize: '0.85rem',
                          fontWeight: 500,
                          cursor: 'pointer',
                          textAlign: 'center'
                        }}
                      >
                        {d}m
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ textAlign: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                  Total Questions
                </label>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  border: '1px solid #D1D5DB', 
                  borderRadius: '6px', 
                  padding: '2px', 
                  backgroundColor: '#FFFFFF',
                  height: '35px',
                  boxSizing: 'border-box'
                }}>
                  <button 
                    type="button"
                    onClick={() => setNumQ(Math.max(1, numQ - 1))}
                    style={{ 
                      border: 'none', 
                      background: 'transparent', 
                      color: '#374151',
                      width: '32px',
                      height: '100%',
                      fontWeight: 500,
                      fontSize: '1.2rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    -
                  </button>
                  <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#111827' }}>
                    {numQ}
                  </span>
                  <button 
                    type="button"
                    onClick={() => setNumQ(Math.min(15, numQ + 1))}
                    style={{ 
                      border: 'none', 
                      background: 'transparent', 
                      color: '#374151',
                      width: '32px',
                      height: '100%',
                      fontWeight: 500,
                      fontSize: '1rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Language & Target Company Row */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ textAlign: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                  Language
                </label>
                <select 
                  value={language} 
                  onChange={e => setLanguage(e.target.value)}
                  style={{ 
                    padding: '8px 12px', 
                    fontSize: '0.85rem', 
                    width: '100%', 
                    borderRadius: '6px', 
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#111827',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                >
                  {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>

              <div style={{ textAlign: 'center' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                  Target Company
                </label>
                <select 
                  value={company} 
                  onChange={e => setCompany(e.target.value)}
                  style={{ 
                    padding: '8px 12px', 
                    fontSize: '0.85rem', 
                    width: '100%', 
                    borderRadius: '6px', 
                    border: '1px solid #D1D5DB',
                    backgroundColor: '#FFFFFF',
                    color: '#111827',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                >
                  <option value="">General Track</option>
                  {COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            {/* Hardware & AI Features */}
            <div style={{ textAlign: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '8px' }}>
                Features
              </label>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {[
                  { label: 'Camera', val: enableVideo, set: setEnableVideo },
                  { label: 'Microphone', val: enableMic, set: setEnableMic },
                  { label: 'AI Hints', val: enableHints, set: setEnableHints },
                ].map((item, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => item.set(!item.val)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: item.val ? '1px solid #111827' : '1px solid #D1D5DB',
                      backgroundColor: item.val ? '#111827' : '#FFFFFF',
                      color: item.val ? '#FFFFFF' : '#374151',
                      fontWeight: 500,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>{item.label}</span>
                    <span style={{ fontSize: '0.7rem' }}>{item.val ? '✓' : '✕'}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Action Footer */}
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={() => onStart({ difficulty, personality, duration, language, company, numQ, enableVideo, enableMic, enableHints })}
              style={{ 
                width: '100%', 
                padding: '12px', 
                fontSize: '0.9rem', 
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: '#475569',
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
            >
              Start Practice Session
            </button>
            <button 
              onClick={onClose}
              style={{ 
                width: '100%', 
                background: 'none', 
                border: 'none', 
                color: '#6B7280', 
                fontSize: '0.85rem', 
                fontWeight: 500,
                cursor: 'pointer',
                padding: '8px'
              }}
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Module 2: Interview Engine ─────────────────────────────────────────────
function InterviewEngine({ interviewType, config, onFinish }) {
  const bank = QA_BANKS[interviewType.bank] || [];
  const questions = bank.slice(0, config.numQ).map((item, i) => ({ ...item, id: i }));
  
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.duration * 60);
  const [qTimeLeft, setQTimeLeft] = useState(120);
  const [micOn, setMicOn] = useState(config.enableMic);
  const [videoOn, setVideoOn] = useState(config.enableVideo);
  const [aiTyping, setAiTyping] = useState(false);
  const [aiComment, setAiComment] = useState('');
  const [skipped, setSkipped] = useState([]);
  const [phase, setPhase] = useState('question');
  const [followUp, setFollowUp] = useState('');
  const [showFollowUp, setShowFollowUp] = useState(false);

  const timerRef = useRef(null);
  const qTimerRef = useRef(null);

  const AI_COMMENTS = [
    'Good structure. Can you discuss any potential limitations or trade-offs?',
    'Solid explanation. How would you adjust this strategy under tight deadlines?',
    'Clear approach. How does this account for unexpected edge cases?',
    'Well presented. Can you quantify the outcome or performance impact?',
    'Valid reasoning. How would you handle a counter-proposal from a senior team member?'
  ];

  const FOLLOW_UPS = {
    hr: 'Can you share a specific past experience that demonstrates this?',
    technical: 'What is the algorithmic time and space complexity of this approach?',
    dsa: 'Can this solution be further optimized in terms of memory overhead?',
    coding: 'How would you write automated test cases for this function?',
    gd: 'What counterarguments might stakeholders present against your position?',
    behavioral: 'What would you do differently if faced with the same scenario again?',
    managerial: 'How would you measure success and track progress for this initiative?',
    systemDesign: 'How does your architecture handle unexpected spikes in traffic?'
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  useEffect(() => {
    setQTimeLeft(120);
    setShowHint(false);
    setAnswer('');
    setAiComment('');
    setShowFollowUp(false);

    clearInterval(qTimerRef.current);
    qTimerRef.current = setInterval(() => {
      setQTimeLeft(t => {
        if (t <= 1) {
          clearInterval(qTimerRef.current);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(qTimerRef.current);
  }, [currentQ]);

  const submitAnswer = () => {
    setAnswers(prev => ({ ...prev, [currentQ]: answer }));
    setAiTyping(true);
    setTimeout(() => {
      setAiTyping(false);
      setAiComment(AI_COMMENTS[Math.floor(Math.random() * AI_COMMENTS.length)]);
      if (Math.random() > 0.4 && config.personality !== 'friendly') {
        setFollowUp(FOLLOW_UPS[interviewType.bank] || 'Can you elaborate further on this point?');
        setShowFollowUp(true);
      }
      setPhase('feedback');
    }, 1400);
  };

  const nextQuestion = () => {
    setPhase('question');
    setAnswer('');
    setAiComment('');
    setShowFollowUp(false);
    if (currentQ < questions.length - 1) {
      setCurrentQ(q => q + 1);
    } else {
      onFinish({ answers, skipped, timeTaken: config.duration * 60 - timeLeft });
    }
  };

  const skipQuestion = () => {
    setSkipped(prev => [...prev, currentQ]);
    nextQuestion();
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const q = questions[currentQ];
  if (!q) return null;

  return (
    <div>
      {/* Session Top Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <span className="pill-tag" style={{ marginBottom: '4px' }}>{interviewType.label}</span>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '4px 0 0 0' }}>
            Question {currentQ + 1} of {questions.length}
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600 }}>Total Time Left</span>
            <span style={{ fontSize: '1rem', fontWeight: 800, color: timeLeft < 180 ? '#111827' : '#111827', fontFamily: 'var(--font-code)' }}>
              {formatTimer(timeLeft)}
            </span>
          </div>

          <button 
            onClick={() => setMicOn(!micOn)}
            className="btn-secondary-spec"
            style={{ padding: '6px 14px', fontSize: '0.8rem', backgroundColor: micOn ? '#F3F4F6' : '#F3F4F6', color: micOn ? '#111827' : '#111827' }}
          >
            Mic: {micOn ? 'ON' : 'MUTED'}
          </button>

          <button 
            onClick={() => setVideoOn(!videoOn)}
            className="btn-secondary-spec"
            style={{ padding: '6px 14px', fontSize: '0.8rem', backgroundColor: videoOn ? '#F3F4F6' : '#F3F4F6', color: videoOn ? '#111827' : '#111827' }}
          >
            Camera: {videoOn ? 'ON' : 'MUTED'}
          </button>
        </div>
      </div>

      <SimpleProgressBar value={currentQ} max={questions.length} height={6} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '20px', marginTop: '20px' }}>
        {/* Main Content Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="saas-card-spec">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span className="pill-tag">Question Statement</span>
              <span style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600, fontFamily: 'var(--font-code)' }}>
                Q-Time: {formatTimer(qTimeLeft)}
              </span>
            </div>

            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#111827', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              {q.q}
            </h3>

            {config.enableHints && showHint && (
              <div style={{ backgroundColor: '#F3F4F6', border: '1px solid #111827', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '4px' }}>
                  HINT
                </span>
                <p style={{ fontSize: '0.85rem', color: '#111827', margin: 0 }}>
                  {q.hint}
                </p>
              </div>
            )}
          </div>

          {showFollowUp && (
            <div style={{ backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB', borderRadius: '12px', padding: '16px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#374151', display: 'block', marginBottom: '4px' }}>
                FOLLOW-UP PROMPT
              </span>
              <p style={{ fontSize: '0.9rem', color: '#111827', fontWeight: 600, margin: 0 }}>
                {followUp}
              </p>
            </div>
          )}

          {phase === 'question' ? (
            <div className="saas-card-spec">
              <label style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', display: 'block', marginBottom: '8px' }}>
                Your Answer
              </label>
              <textarea 
                value={answer}
                onChange={e => setAnswer(e.target.value)}
                placeholder="Type your response here clearly..."
                rows={6}
                className="input-field"
                style={{ resize: 'vertical', lineHeight: 1.6, marginBottom: '16px' }}
              />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {config.enableHints && (
                    <button 
                      onClick={() => setShowHint(!showHint)}
                      className="btn-secondary-spec"
                      style={{ padding: '8px 14px', fontSize: '0.82rem' }}
                    >
                      {showHint ? 'Hide Hint' : 'Show Hint'}
                    </button>
                  )}
                  <button 
                    onClick={skipQuestion}
                    className="btn-secondary-spec"
                    style={{ padding: '8px 14px', fontSize: '0.82rem', color: '#6B7280' }}
                  >
                    Skip Question
                  </button>
                </div>

                <button 
                  onClick={submitAnswer}
                  disabled={!answer.trim()}
                  className="btn-primary-spec"
                  style={{ opacity: answer.trim() ? 1 : 0.5, cursor: answer.trim() ? 'pointer' : 'not-allowed' }}
                >
                  Submit Answer
                </button>
              </div>
            </div>
          ) : (
            <div className="saas-card-spec">
              {aiTyping ? (
                <div style={{ padding: '16px 0', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.9rem', color: '#6B7280', margin: 0, fontWeight: 500 }}>
                    AI Interviewer is analyzing your response...
                  </p>
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', display: 'block', marginBottom: '4px' }}>
                      INTERVIEWER FEEDBACK
                    </span>
                    <p style={{ fontSize: '0.92rem', color: '#111827', margin: 0, fontWeight: 500 }}>
                      {aiComment}
                    </p>
                  </div>

                  <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      RECORDED ANSWER
                    </span>
                    <p style={{ fontSize: '0.85rem', color: '#374151', margin: 0, lineHeight: 1.5 }}>
                      {answers[currentQ]}
                    </p>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    {currentQ < questions.length - 1 ? (
                      <button onClick={nextQuestion} className="btn-primary-spec">
                        Next Question
                      </button>
                    ) : (
                      <button 
                        onClick={() => onFinish({ answers, skipped, timeTaken: config.duration * 60 - timeLeft })} 
                        className="btn-primary-spec"
                        style={{ backgroundColor: '#475569', borderColor: '#475569', color: '#FFFFFF' }}
                      >
                        Finish and View AI Analysis
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {config.enableVideo && (
            <div className="saas-card-spec" style={{ padding: '0', overflow: 'hidden' }}>
              <div style={{ backgroundColor: '#111827', height: '160px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#9CA3AF' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Camera Stream Preview</span>
                <span style={{ fontSize: '0.75rem', color: '#111827', fontWeight: 700, marginTop: '4px' }}>● LIVE</span>
              </div>
              <div style={{ padding: '10px 14px', textAlign: 'center', fontSize: '0.78rem', color: '#6B7280' }}>
                Candidate View
              </div>
            </div>
          )}

          {/* Question Navigator */}
          <div className="saas-card-spec">
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
              Question Map
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
              {questions.map((_, i) => {
                const isCurrent = i === currentQ;
                const isAnswered = answers[i] !== undefined;
                const isSkipped = skipped.includes(i);
                return (
                  <button 
                    key={i}
                    onClick={() => { if (phase === 'question') setCurrentQ(i); }}
                    style={{
                      height: '36px',
                      borderRadius: '8px',
                      border: isCurrent ? '2px solid #111827' : '1px solid #E5E7EB',
                      backgroundColor: isCurrent ? '#111827' : isAnswered ? '#F3F4F6' : isSkipped ? '#F3F4F6' : '#FFFFFF',
                      color: isCurrent ? '#FFFFFF' : isAnswered ? '#111827' : isSkipped ? '#111827' : '#6B7280',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      cursor: 'pointer'
                    }}
                  >
                    Q{i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Session Overview */}
          <div className="saas-card-spec">
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
              Status Summary
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Answered</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>{Object.keys(answers).length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Skipped</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>{skipped.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#6B7280' }}>Remaining</span>
                <span style={{ fontWeight: 700, color: '#111827' }}>{questions.length - Object.keys(answers).length - skipped.length}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => onFinish({ answers, skipped, timeTaken: config.duration * 60 - timeLeft })}
            className="btn-secondary-spec"
            style={{ width: '100%', justifyContent: 'center', color: '#111827', borderColor: '#E5E7EB', padding: '10px' }}
          >
            End Interview Session
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Module 3: AI Evaluation Engine ─────────────────────────────────────────
function AIEvaluationEngine({ interviewType, config, result, onNext }) {
  const [evaluating, setEvaluating] = useState(true);
  const [progress, setProgress] = useState(0);
  const [scores, setScores] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) {
          clearInterval(interval);
          setEvaluating(false);
          setScores({
            overall: Math.floor(65 + Math.random() * 25),
            communication: Math.floor(60 + Math.random() * 30),
            content: Math.floor(65 + Math.random() * 25),
            confidence: Math.floor(55 + Math.random() * 35),
            clarity: Math.floor(65 + Math.random() * 25),
            relevance: Math.floor(70 + Math.random() * 25),
            depth: Math.floor(55 + Math.random() * 35),
            timeMgmt: Math.min(100, Math.floor((result.timeTaken / (config.duration * 60)) * 100 * 1.1)),
          });
          return 100;
        }
        return p + 4;
      });
    }, 70);
    return () => clearInterval(interval);
  }, []);

  const EVAL_STEPS = [
    'Transcribing candidate audio and text responses...',
    'Analyzing technical concept depth...',
    'Evaluating communication clarity and articulation...',
    'Scoring problem structure and approach...',
    'Generating actionable improvement recommendations...'
  ];

  const currentStep = Math.min(EVAL_STEPS.length - 1, Math.floor((progress / 100) * EVAL_STEPS.length));

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: 0 }}>
          AI Evaluation Engine
        </h2>
        <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
          Multi-dimensional automated performance evaluation for {interviewType.label}.
        </p>
      </div>

      {evaluating ? (
        <div className="saas-card-spec" style={{ padding: '40px 24px', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
            Processing Session Analysis
          </h3>
          <p style={{ color: '#6B7280', fontSize: '0.88rem', marginBottom: '24px' }}>
            Evaluating {Object.keys(result.answers).length} responses against standard benchmark criteria.
          </p>

          <SimpleProgressBar value={progress} height={8} />
          <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginTop: '10px', marginBottom: '24px' }}>
            {progress}% Completed
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', textAlign: 'left', maxWidth: '420px', margin: '0 auto' }}>
            {EVAL_STEPS.map((step, idx) => (
              <div 
                key={idx} 
                style={{ 
                  fontSize: '0.82rem', 
                  color: idx <= currentStep ? '#111827' : '#9CA3AF',
                  fontWeight: idx === currentStep ? 700 : 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{idx < currentStep ? '✓' : idx === currentStep ? '•' : '○'}</span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>
      ) : scores && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'Overall Score', val: `${scores.overall}%` },
              { label: 'Communication', val: `${scores.communication}%` },
              { label: 'Content Depth', val: `${scores.content}%` },
              { label: 'Confidence', val: `${scores.confidence}%` },
              { label: 'Clarity', val: `${scores.clarity}%` },
              { label: 'Relevance', val: `${scores.relevance}%` },
              { label: 'Problem Depth', val: `${scores.depth}%` },
              { label: 'Time Management', val: `${scores.timeMgmt}%` },
            ].map((item, idx) => (
              <div key={idx} className="saas-card-spec" style={{ textAlign: 'center', padding: '20px 14px' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
                  {item.val}
                </div>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#6B7280' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={onNext} className="btn-primary-spec" style={{ padding: '12px 28px' }}>
              View Detailed Feedback Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Module 4: Feedback Dashboard ──────────────────────────────────────────
function FeedbackDashboard({ interviewType, config, result, onNext, onRestart, setInterviewState }) {
  const totalQ = Object.keys(result.answers).length + result.skipped.length;
  const answered = Object.keys(result.answers).length;
  const accuracy = totalQ > 0 ? Math.floor((answered / totalQ) * 100) : 0;
  const overallScore = Math.floor(65 + Math.random() * 25);

  useEffect(() => {
    if (setInterviewState) {
      setInterviewState(prev => ({
        ...prev,
        lastScore: overallScore,
        commScore: Math.floor(60 + Math.random() * 30),
        lastUpdated: new Date().toLocaleDateString()
      }));
    }
  }, []);

  const STRENGTHS = [
    'Structured problem decomposition approach',
    'Clear communication and technical vocabulary',
    'Good contextual examples for concepts',
    'Demonstrated domain knowledge fundamentals'
  ];

  const IMPROVEMENTS = [
    'Elaborate more on design trade-offs and edge cases',
    'Apply the STAR framework more consistently for situational questions',
    'Include quantitative metrics in past experience descriptions',
    'Improve pace control under strict question time limits'
  ];

  const SUGGESTIONS = [
    { title: 'Systematic Practice', text: 'Complete 2 mock modules per week to improve response timing.' },
    { title: 'STAR Framework', text: 'Structure situational answers with Situation, Task, Action, Result.' },
    { title: 'Self-Review', text: 'Practice speaking answers aloud before submitting to refine clarity.' },
    { title: 'Deep-Dive Prep', text: `Focus on technical topics specific to ${interviewType.label}.` }
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            Session Performance Report
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            {interviewType.label} • Evaluation Completed
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onRestart} className="btn-secondary-spec" style={{ padding: '10px 18px', fontSize: '0.85rem' }}>
            New Interview
          </button>
          <button onClick={onNext} className="btn-primary-spec" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
            View Growth Plan
          </button>
        </div>
      </div>

      {/* Summary Scoreboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Overall Readiness', val: `${overallScore}%` },
          { label: 'Questions Attempted', val: `${answered} / ${totalQ}` },
          { label: 'Completion Rate', val: `${accuracy}%` },
          { label: 'Time Elapsed', val: `${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s` },
        ].map((item, idx) => (
          <div key={idx} className="saas-card-spec" style={{ padding: '20px' }}>
            <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              {item.label}
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>
              {item.val}
            </div>
          </div>
        ))}
      </div>

      {/* Strengths & Improvements */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
        <div className="saas-card-spec">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>
            Key Strengths
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {STRENGTHS.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: '#374151' }}>
                <span style={{ color: '#111827', fontWeight: 700 }}>✓</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="saas-card-spec">
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>
            Areas for Improvement
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {IMPROVEMENTS.map((s, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '10px', fontSize: '0.85rem', color: '#374151' }}>
                <span style={{ color: '#111827', fontWeight: 700 }}>•</span>
                <span>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations Cards */}
      <div className="saas-card-spec">
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
          Actionable Next Steps
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
          {SUGGESTIONS.map((item, idx) => (
            <div key={idx} style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', padding: '14px' }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827', marginBottom: '4px' }}>
                {idx + 1}. {item.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: '#4B5563', lineHeight: 1.5 }}>
                {item.text}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Module 5: Learning Recommendations ──────────────────────────────────────
function LearningRecommendations({ interviewType, onRestart, setActiveTab }) {
  const [tab, setTab] = useState('resources');

  const RESOURCES = [
    { title: 'Cracking the Coding Interview', type: 'Book Guide', desc: 'Comprehensive technical interview framework and practice problems.' },
    { title: 'System Design Primer', type: 'Architecture Reference', desc: 'Key principles for designing scalable distributed software applications.' },
    { title: 'Behavioral Interview STAR Guide', type: 'Framework Document', desc: 'Structured method to answer situational and behavioral questions.' },
    { title: 'LeetCode Core 75', type: 'Coding Practice Set', desc: 'Essential pattern-matching coding problems for tech evaluations.' },
  ];

  const PLAN = [
    { day: 'Days 1 - 3', task: 'Review feedback points and refine weakest question categories.' },
    { day: 'Days 4 - 7', task: `Practice 8 target practice questions for ${interviewType.label}.` },
    { day: 'Days 8 - 11', task: 'Conduct a timed practice session using audio response draft.' },
    { day: 'Days 12 - 15', task: 'Take a full adaptive mock interview to re-evaluate placement score.' },
  ];

  const LEADERBOARD = [
    { rank: '#1', name: 'Ananya S.', college: 'IIT Madras', score: '96%' },
    { rank: '#2', name: 'Rohit K.', college: 'NIT Trichy', score: '94%' },
    { rank: '#3', name: 'Priya M.', college: 'VIT Vellore', score: '92%' },
    { rank: '#4', name: 'Arjun D.', college: 'BITS Pilani', score: '89%' },
    { rank: '#5', name: 'Candidate (You)', college: 'Current Profile', score: '78%' },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: 0 }}>
            Personalized Growth Plan
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Recommended resources and structured preparation roadmap.
          </p>
        </div>
        <button onClick={onRestart} className="btn-primary-spec" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
          Start New Session
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', borderBottom: '1px solid #E5E7EB', paddingBottom: '10px' }}>
        {[
          { id: 'resources', label: 'Study Resources' },
          { id: 'plan', label: '15-Day Preparation Roadmap' },
          { id: 'leaderboard', label: 'Batch Benchmark' },
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: tab === t.id ? '1px solid #111827' : 'none',
              backgroundColor: tab === t.id ? '#111827' : 'transparent',
              color: tab === t.id ? '#FFFFFF' : '#4B5563',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer'
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'resources' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {RESOURCES.map((r, idx) => (
            <div key={idx} className="saas-card-spec" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <span className="pill-tag" style={{ marginBottom: '8px' }}>{r.type}</span>
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827', margin: '6px 0' }}>
                  {r.title}
                </h4>
                <p style={{ fontSize: '0.83rem', color: '#4B5563', lineHeight: 1.5, margin: 0 }}>
                  {r.desc}
                </p>
              </div>
              <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #E5E7EB' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827' }}>Open Resource Reference</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'plan' && (
        <div className="saas-card-spec">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
            Structured 15-Day Preparation Roadmap
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {PLAN.map((p, idx) => (
              <div key={idx} style={{ padding: '14px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontWeight: 700, fontSize: '0.85rem', color: '#111827', minWidth: '90px' }}>
                  {p.day}
                </span>
                <span style={{ fontSize: '0.85rem', color: '#374151', flex: 1 }}>
                  {p.task}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 700 }}>
                  Planned
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'leaderboard' && (
        <div className="saas-card-spec">
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
            Batch Leaderboard — {interviewType.label}
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {LEADERBOARD.map((item, idx) => (
              <div 
                key={idx}
                style={{
                  padding: '12px 16px',
                  borderRadius: '8px',
                  backgroundColor: item.name.includes('You') ? '#F3F4F6' : '#FFFFFF',
                  border: item.name.includes('You') ? '2px solid #111827' : '1px solid #E5E7EB',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontWeight: 800, fontSize: '0.9rem', color: '#111827', minWidth: '30px' }}>
                    {item.rank}
                  </span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>
                      {item.college}
                    </div>
                  </div>
                </div>

                <div style={{ fontWeight: 800, fontSize: '1rem', color: '#111827' }}>
                  {item.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Step Navigation Header ─────────────────────────────────────────
function StepHeader({ steps, currentStep }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
      {steps.map((step, idx) => {
        const active = currentStep === step.id;
        return (
          <React.Fragment key={step.id}>
            <div 
              style={{
                padding: '6px 14px',
                borderRadius: '999px',
                backgroundColor: active ? '#111827' : '#F3F4F6',
                color: active ? '#FFFFFF' : '#4B5563',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: `1px solid ${active ? '#111827' : '#E5E7EB'}`
              }}
            >
              {idx + 1}. {step.label}
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Main Export ─────────────────────────────────────────────────────────────
export default function MockInterview({ profile, moodState, interviewState, setInterviewState, setActiveTab }) {
  const [phase, setPhase] = useState('selection');
  const [selectedType, setSelectedType] = useState(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [config, setConfig] = useState(null);
  const [result, setResult] = useState(null);

  const STEPS = [
    { id: 'selection', label: 'Track Selection' },
    { id: 'engine', label: 'Live Interview' },
    { id: 'evaluation', label: 'AI Evaluation' },
    { id: 'feedback', label: 'Performance Report' },
    { id: 'recommendations', label: 'Growth Plan' },
  ];

  const handleRestart = () => {
    setPhase('selection');
    setSelectedType(null);
    setConfigModalOpen(false);
    setConfig(null);
    setResult(null);
  };

  return (
    <div style={{ flex: 1, padding: '36px 32px', maxWidth: '1280px', margin: '0 auto', width: '100%', fontFamily: 'var(--font-inter)' }}>
      {/* Module Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.4px' }}>
            Adaptive Mock Interview
          </h1>
          <p style={{ color: '#6B7280', fontSize: '0.9rem', margin: '4px 0 0 0' }}>
            13 Interview Tracks • Stress-Adaptive Evaluation • Real-time AI Feedback
          </p>
        </div>
        <span className="pill-tag" style={{ backgroundColor: '#F3F4F6', color: '#111827', borderColor: '#E5E7EB', fontWeight: 700 }}>
          AI Engine Online
        </span>
      </div>

      <StepHeader steps={STEPS} currentStep={phase} />

      {phase === 'selection' && (
        <InterviewSelection 
          onSelect={(type) => {
            setSelectedType(type);
            setConfigModalOpen(true);
          }} 
          setActiveTab={setActiveTab}
        />
      )}

      {/* Modal Popup Configuration Overlay */}
      {configModalOpen && selectedType && (
        <InterviewConfigModal
          interviewType={selectedType}
          onClose={() => setConfigModalOpen(false)}
          onStart={(cfg) => {
            setConfig(cfg);
            setConfigModalOpen(false);
            setPhase('engine');
          }}
        />
      )}

      {phase === 'engine' && selectedType && config && (
        <InterviewEngine 
          interviewType={selectedType} 
          config={config} 
          onFinish={(res) => { setResult(res); setPhase('evaluation'); }} 
        />
      )}

      {phase === 'evaluation' && selectedType && config && result && (
        <AIEvaluationEngine 
          interviewType={selectedType} 
          config={config} 
          result={result} 
          onNext={() => setPhase('feedback')} 
        />
      )}

      {phase === 'feedback' && selectedType && config && result && (
        <FeedbackDashboard 
          interviewType={selectedType} 
          config={config} 
          result={result} 
          onNext={() => setPhase('recommendations')} 
          onRestart={handleRestart}
          setInterviewState={setInterviewState}
        />
      )}

      {phase === 'recommendations' && selectedType && (
        <LearningRecommendations 
          interviewType={selectedType} 
          onRestart={handleRestart} 
          setActiveTab={setActiveTab}
        />
      )}
    </div>
  );
}
