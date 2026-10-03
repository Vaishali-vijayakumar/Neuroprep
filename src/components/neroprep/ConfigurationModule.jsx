import React, { useState } from 'react';
import useInterviewStore from '../../store/interviewStore';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Adaptive AI'];
const PERSONALITIES = [
  { id: 'friendly',     label: 'Friendly Mentor',           desc: 'Encouraging, supportive tone.' },
  { id: 'professional', label: 'Professional Recruiter',     desc: 'Balanced and formal.' },
  { id: 'strict',       label: 'Strict Technical Lead',      desc: 'Deep technical pressure.' },
  { id: 'manager',      label: 'Senior Engineering Manager', desc: 'Leadership and systems thinking.' },
  { id: 'stress',       label: 'Stress Interviewer',         desc: 'Interrupts and challenges answers.' },
];
const LANGUAGES     = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam'];
const DURATIONS     = ['15', '30', '45', '60', '90'];
const CODING_LANGS  = ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'TypeScript'];
const CLOUD_PROVIDERS = ['AWS', 'Google Cloud', 'Azure', 'Multi-Cloud'];
const AWS_SERVICES  = ['EC2', 'S3', 'Lambda', 'RDS', 'DynamoDB', 'ECS', 'CloudFront', 'API Gateway', 'IAM', 'VPC', 'SQS', 'SNS'];
const DSA_PATTERNS   = ['HashMap', 'Two Pointers', 'Sliding Window', 'Binary Search', 'Stack', 'Linked List', 'Tree & Recursion', 'BFS/DFS', 'Dynamic Programming'];
const DSA_TOPICS     = ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching', 'Stacks & Queues', 'Heaps', 'Tries', 'Bit Manipulation'];
const TECH_SUBJECTS = ['OOP', 'DBMS', 'Operating Systems', 'Computer Networks', 'System Software', 'Data Structures', 'Compiler Design'];
const AIML_TOPICS   = ['Machine Learning', 'Deep Learning', 'CNN', 'RNN/LSTM', 'Transformers', 'LLMs', 'RAG', 'Fine-tuning', 'Vector Databases', 'MLOps', 'Reinforcement Learning'];
const DEVOPS_TOOLS  = ['Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible', 'Prometheus', 'Grafana', 'AWS', 'GCP', 'Azure'];
const SECURITY_DOMAINS = ['OWASP', 'Encryption', 'Authentication & OAuth', 'Network Security', 'Firewalls', 'SOC Analysis', 'Incident Response', 'Penetration Testing', 'Cloud Security'];
const QA_TOOLS      = ['Selenium', 'Cypress', 'Playwright', 'Postman', 'JUnit', 'TestNG', 'Jest', 'Pytest', 'API Testing', 'Performance Testing'];
const GD_PARTICIPANTS = ['3', '4', '5', '6'];
const APTITUDE_TOPICS = ['Percentages', 'Profit & Loss', 'Time & Work', 'Speed & Distance', 'Probability', 'Number System', 'Logical Reasoning', 'Verbal Reasoning', 'Data Interpretation'];
const COMPANY_VALUES  = ['Customer Obsession', 'Innovation & Thinking Big', 'Collaboration & Empathy', 'Ownership & Bias for Action', 'Integrity & Ethics', 'Speed & Agility', 'High Quality Standards'];
const WORK_STYLES     = ['Fast-paced High Growth Startup', 'Structured Enterprise Organization', 'Autonomous Remote / Async', 'Collaborative Cross-functional Team'];
const ML_FRAMEWORKS   = ['PyTorch', 'TensorFlow', 'Scikit-Learn', 'LangChain / LlamaIndex', 'HuggingFace Transformers', 'JAX'];
const MODEL_TYPES     = ['LLMs & Transformers', 'RAG & Vector Search', 'Computer Vision (CNN)', 'NLP & Seq2Seq', 'Reinforcement Learning', 'Time Series & Forecasting'];
const COMM_SCENARIOS  = ['Executive Pitch & Presentation', 'Technical Explanation to Non-Tech Client', 'Sprint Demo & Architecture Walkthrough', 'Spontaneous Impromptu Q&A'];
const ACCENTS         = ['Indian English (Neutral)', 'US English (Standard)', 'UK English (Received Pronunciation)', 'Global Neutral'];
const LEADERSHIP_STYLES = ['Transformational & Inspirational', 'Servant Leadership & Empathy', 'Democratic & Collaborative', 'Pacesetting & Technical Lead', 'Coaching & Mentoring'];
const TESTING_TYPES   = ['UI Automation', 'REST API Testing', 'Performance & Load Testing', 'Manual & Exploratory', 'Security & Penetration Testing', 'CI/CD Regression Suite'];
const THREAT_SCENARIOS = ['Zero-Day Web Application Exploit', 'Ransomware Attack & Data Exfiltration', 'Distributed Denial of Service (DDoS)', 'Insider Threat & Privilege Escalation', 'Cloud IAM Misconfiguration'];
const CLOUD_GOALS     = ['High Availability & Disaster Recovery', 'Serverless Microservices Architecture', 'Legacy Monolith Cloud Migration', 'FinOps Cloud Cost Optimization'];
const SYSTEM_DESIGN_PRESETS = [
  'URL Shortener (TinyURL / Bitly)',
  'Ride Sharing Service (Uber / Lyft)',
  'Real-Time Chat & Messaging (WhatsApp / Slack)',
  'Video Streaming Platform (Netflix / YouTube)',
  'E-Commerce & Flash Sale (Amazon / Flipkart)',
  'Distributed Rate Limiter & API Gateway',
  'Distributed Cache System (Redis-like)',
  'Parking Lot Management System (LLD / OOP)',
  'Elevator Dispatching System (LLD / OOP)',
  'Expense Sharing App (Splitwise LLD)',
  'Movie Ticket Booking (BookMyShow)',
  'Notification Dispatcher (Push / SMS / Email Queue)',
  'Web Crawler & Search Indexer',
  'Custom System / Architecture Problem'
];
const DESIGN_FOCUS_OPTIONS = [
  'High-Level Architecture (HLD - Distributed Systems)',
  'Low-Level Design (LLD - OOP & SOLID Patterns)',
  'Full End-to-End System Design (HLD + LLD Combined)'
];
const SCALE_PROFILES = [
  'Startup Scale (10K - 100K DAU, Single Region)',
  'High Growth Scale (1M - 10M DAU, 5,000 QPS)',
  'Global Hyper-Scale (100M+ DAU, 50,000+ QPS, Multi-Region Active-Active)',
  'Heavy Write / High Event Ingestion',
  'Ultra-Low Latency (<10ms Real-Time)'
];
const ARCH_PRIORITIES = [
  'High Availability (99.999% Uptime)',
  'Ultra-Low Latency (<10ms p99)',
  'Strong Consistency & ACID',
  'High Write Throughput & Partition Tolerance',
  'Fault Tolerance & Disaster Recovery'
];
const SYSTEM_COMPONENTS = [
  'PostgreSQL / Relational SQL',
  'NoSQL (Cassandra / DynamoDB / MongoDB)',
  'Redis / In-Memory Cache',
  'Kafka / Event Streaming',
  'RabbitMQ / SQS Task Queues',
  'Elasticsearch / Log Search',
  'WebSockets / gRPC',
  'CDN & Load Balancer',
  'Docker & Kubernetes Microservices'
];
const LLD_PATTERNS = [
  'SOLID Principles',
  'Factory & Builder Pattern',
  'Strategy & State Pattern',
  'Observer & Pub-Sub Pattern',
  'Singleton & Concurrency Locks',
  'Decorator & Adapter Pattern',
  'Repository & Clean Architecture',
  'Database Schema & Normalization'
];

// ── Track-specific configuration schema for all 12 tracks ─────────────────────
const TRACK_FIELDS = {
  hr:                { label: 'HR Interview',         fields: ['role', 'company', 'experience', 'hrPracticeTopic', 'hrInterviewTone', 'workPreference', 'joiningTime', 'aboutUser'] },
  tech:              { label: 'Technical Interview',  fields: ['role', 'company', 'experience', 'codingLang', 'techSubjects', 'techInterviewFocus', 'techInterviewTone', 'techProjects', 'aboutUser'] },
  dsa:               { label: 'DSA & Coding',         fields: ['codingLang', 'difficulty_dsa', 'timeLimitPerProblem', 'evaluationFocus', 'complexityRequirement', 'proctoringMode'] },
  system_design:     { label: 'System Design & Architecture (HLD & LLD)', fields: ['role', 'experience', 'designFocus', 'systemToDesign', 'expectedScale', 'archPriority', 'preferredTech', 'lldPatterns', 'codingLang', 'aboutUser'] },
  behavioral:        { label: 'Behavioral & Managerial', fields: ['role', 'company', 'experience', 'teamSize', 'leadershipStyle', 'achievements', 'resume', 'jobDescription'] },
  gd:                { label: 'Group Discussion',     fields: ['gdTopic', 'industry', 'gdParticipants', 'discussionRole'] },
  group_discussion:  { label: 'Group Discussion',     fields: ['gdTopic', 'industry', 'gdParticipants', 'discussionRole'] },
  communication:     { label: 'Communication',        fields: ['role', 'experience', 'commScenario', 'targetAccent', 'speechPaceTarget'] },
  ai_ml:             { label: 'AI / ML',              fields: ['role', 'experience', 'aimlTopics', 'mlFramework', 'modelType', 'resume'] },
  devops:            { label: 'DevOps',               fields: ['role', 'experience', 'devopsTools', 'cloudProvider', 'cicdPlatform', 'infraType'] },
  cloud:             { label: 'Cloud',                fields: ['role', 'experience', 'cloudProvider', 'cloudServices', 'cloudArchGoal'] },
  cybersec:          { label: 'Cybersecurity',        fields: ['role', 'experience', 'securityDomains', 'threatScenario', 'complianceStandard'] },
  cybersecurity:     { label: 'Cybersecurity',        fields: ['role', 'experience', 'securityDomains', 'threatScenario', 'complianceStandard'] },
  qa:                { label: 'QA / Testing',         fields: ['role', 'experience', 'qaTools', 'testingTypes', 'codingLang'] },
  custom:            { label: 'Custom Builder',       fields: ['role', 'company', 'techSubjects', 'codingLang', 'experience', 'jobDescription', 'questionCount'] },
};

// ── Design tokens — Earthy Sage & Terracotta Dashboard Theme ──────────────────
const GREY_BTN = 'var(--btn-sage)';
const GREY_TEXT = 'var(--text-muted)';
const BORDER = 'var(--border-color)';
const BG     = 'var(--bg-page)';
const TEXT_MAIN = 'var(--main-heading)';

const inputStyle = {
  padding: '11px 14px', fontSize: '13.5px', borderRadius: '10px',
  border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)',
  color: 'var(--main-heading)', outline: 'none', width: '100%',
  fontFamily: 'var(--font-body)', fontWeight: 500,
  transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
  boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)'
};
const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: '90px' };
const selectStyle   = { ...inputStyle, cursor: 'pointer' };

// ── Field label wrapper ───────────────────────────────────────────────────────
const Field = ({ label, helper, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '13.5px', fontWeight: 700, color: 'var(--main-heading)', letterSpacing: '-0.2px', fontFamily: 'var(--font-heading)' }}>
      {label}
    </label>
    {children}
    {helper && (
      <span style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4, fontFamily: 'var(--font-body)' }}>
        {helper}
      </span>
    )}
  </div>
);

// ── Multi-select chip row ─────────────────────────────────────────────────────
const MultiSelect = ({ options, selected, onChange }) => {
  const sel = selected || [];
  const toggle = (opt) =>
    sel.includes(opt) ? onChange(sel.filter(o => o !== opt)) : onChange([...sel, opt]);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {options.map(opt => {
        const active = sel.includes(opt);
        return (
          <button key={opt} onClick={() => toggle(opt)} style={{
            padding: '7px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
            border: `1px solid ${active ? 'var(--btn-sage)' : 'var(--border-color)'}`,
            backgroundColor: active ? 'var(--btn-sage)' : 'var(--bg-card)',
            color: active ? '#FFFFFF' : 'var(--body-text)',
            boxShadow: active ? '0 2px 8px rgba(82, 98, 87, 0.25)' : '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.15s ease',
            fontFamily: 'var(--font-body)'
          }}>
            {opt}
          </button>
        );
      })}
    </div>
  );
};

// ── Toggle switch ─────────────────────────────────────────────────────────────
const Toggle = ({ active, onToggle, label }) => (
  <div onClick={onToggle} style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
    border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)'
  }}>
    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--main-heading)', fontFamily: 'var(--font-body)' }}>{label}</span>
    <div style={{
      width: '38px', height: '22px', borderRadius: '11px',
      backgroundColor: active ? 'var(--btn-sage)' : 'var(--border-color)',
      position: 'relative', transition: 'background-color 0.15s ease', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: '2px', left: active ? '18px' : '2px',
        width: '18px', height: '18px', borderRadius: '50%',
        backgroundColor: '#FFFFFF', transition: 'left 0.15s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }} />
    </div>
  </div>
);

// ── Pill button (single-select row) ──────────────────────────────────────────
const PillRow = ({ options, value, onChange, suffix = '' }) => (
  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
    {options.map(opt => {
      const active = value === opt;
      return (
        <button key={opt} onClick={() => onChange(opt)} style={{
          padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
          border: `1px solid ${active ? 'var(--btn-sage)' : 'var(--border-color)'}`,
          backgroundColor: active ? 'var(--btn-sage)' : 'var(--bg-card)',
          color: active ? '#FFFFFF' : 'var(--body-text)',
          boxShadow: active ? '0 2px 8px rgba(82, 98, 87, 0.25)' : '0 1px 3px rgba(0,0,0,0.02)',
          transition: 'all 0.15s ease',
          fontFamily: 'var(--font-body)'
        }}>
          {opt}{suffix}
        </button>
      );
    })}
  </div>
);

const DSA_CATEGORY_OPTIONS = [
  'All 16 Categories (Comprehensive 99 Patterns)',
  'Two Pointer Patterns',
  'Fast & Slow Pointers (Cycle Detection)',
  'Expansion from Center (Palindrome Search)',
  'Sliding Window Patterns (Fixed & Variable)',
  'Prefix Sum & Range Queries',
  'Binary Search on Value & Rotated Arrays',
  'Stack & Monotonic Stack Patterns',
  'Linked List In-place Reversal & Fast-Slow',
  'Binary Tree Traversal (DFS & BFS)',
  'Binary Search Tree (BST) Properties',
  'Graph Traversal & Topo Sort (BFS/DFS)',
  'Dynamic Programming (1D & 2D Knapsack)',
  'Backtracking & State Exploration',
  'Heap & Priority Queue (Top K Elements)',
  'Matrix & 2D Grid Traversal',
  'Bit Manipulation & Trie (Prefix Tree)',
];

// ── Dynamic track field renderer ─────────────────────────────────────────────
function TrackFields({ trackId, config, set }) {
  const fieldNames = (TRACK_FIELDS[trackId] || TRACK_FIELDS['custom']).fields;

  const RENDERERS = {
    role: (
      <Field label="Job Role You Are Applying For" helper="Enter the job position you are interviewing for.">
        <input type="text" style={inputStyle} placeholder="e.g. Software Engineer, Graduate Trainee, Business Analyst"
          value={config.role || ''} onChange={e => set('role', e.target.value)} />
      </Field>
    ),
    company: (
      <Field label="Company Name (Optional)" helper="Enter your target company to customize questions.">
        <input type="text" style={inputStyle} placeholder="e.g. TCS, Infosys, Amazon, Zoho, Startup"
          value={config.company || ''} onChange={e => set('company', e.target.value)} />
      </Field>
    ),
    experience: (
      <Field label="Your Experience Level" helper="Choose your current career stage.">
        <PillRow
          options={['College Student / Fresher', '1 - 2 Years', '3+ Years']}
          value={config.experience || 'College Student / Fresher'}
          onChange={v => set('experience', v)}
        />
      </Field>
    ),
    codingLang: (
      <Field label="Programming Language" helper="Select the language to load into your active compiler.">
        <PillRow
          options={['Python', 'Java', 'C++', 'JavaScript']}
          value={config.codingLang || 'Python'}
          onChange={v => set('codingLang', v)}
        />
      </Field>
    ),
    difficulty_dsa: (
      <Field label="Problem Difficulty Level" helper="Target difficulty calibration for the 2 interview problems.">
        <PillRow
          options={['Mixed', 'Easy', 'Medium', 'Hard']}
          value={config.difficulty || 'Mixed'}
          onChange={v => set('difficulty', v)}
        />
      </Field>
    ),
    timeLimitPerProblem: (
      <Field label="Time Limit per Problem" helper="Countdown timer displayed in the live interview room.">
        <PillRow
          options={['15', '25', '35', '45']}
          value={config.timeLimitPerProblem || '25'}
          onChange={v => set('timeLimitPerProblem', v)}
          suffix=" min"
        />
      </Field>
    ),
    evaluationFocus: (
      <Field label="Assessment Evaluation Focus" helper="Select the core grading criteria emphasized in your final scorecard.">
        <PillRow
          options={['Balanced FAANG Standard', 'Optimal Time & Space', 'Clean Code & Structure', 'Edge Case Robustness']}
          value={config.evaluationFocus || 'Balanced FAANG Standard'}
          onChange={v => set('evaluationFocus', v)}
        />
      </Field>
    ),
    complexityRequirement: (
      <Field label="Complexity Analysis Requirement" helper="Specify whether asymptotic complexity explanations are required.">
        <PillRow
          options={['Include Time & Space Analysis', 'Code Solution Only', 'Comprehensive Dry-Run']}
          value={config.complexityRequirement || 'Include Time & Space Analysis'}
          onChange={v => set('complexityRequirement', v)}
        />
      </Field>
    ),
    proctoringMode: (
      <Field label="Proctoring & Assessment Feedback" helper="Configure live tab monitoring and evaluation pace.">
        <PillRow
          options={['Standard Real-Time Feedback', 'Post-Interview Review Only', 'Strict Anti-Cheat Mode']}
          value={config.proctoringMode || 'Standard Real-Time Feedback'}
          onChange={v => set('proctoringMode', v)}
        />
      </Field>
    ),
    aimlTopics: (
      <Field label="AI / ML Topics">
        <MultiSelect options={AIML_TOPICS} selected={config.aimlTopics} onChange={v => set('aimlTopics', v)} />
      </Field>
    ),
    devopsTools: (
      <Field label="Tools and Technologies">
        <MultiSelect options={DEVOPS_TOOLS} selected={config.devopsTools} onChange={v => set('devopsTools', v)} />
      </Field>
    ),
    cloudProvider: (
      <Field label="Cloud Provider">
        <select style={selectStyle} value={config.cloudProvider || 'AWS'} onChange={e => set('cloudProvider', e.target.value)}>
          {CLOUD_PROVIDERS.map(p => <option key={p}>{p}</option>)}
        </select>
      </Field>
    ),
    cloudServices: (
      <Field label="Cloud Services">
        <MultiSelect options={AWS_SERVICES} selected={config.cloudServices} onChange={v => set('cloudServices', v)} />
      </Field>
    ),
    securityDomains: (
      <Field label="Security Domains">
        <MultiSelect options={SECURITY_DOMAINS} selected={config.securityDomains} onChange={v => set('securityDomains', v)} />
      </Field>
    ),
    qaTools: (
      <Field label="Testing Tools">
        <MultiSelect options={QA_TOOLS} selected={config.qaTools} onChange={v => set('qaTools', v)} />
      </Field>
    ),
    aptitudeTopics: (
      <Field label="Aptitude Topics">
        <MultiSelect options={APTITUDE_TOPICS} selected={config.aptitudeTopics} onChange={v => set('aptitudeTopics', v)} />
      </Field>
    ),
    systemToDesign: (
      <Field label="System Archetype / Problem to Design" helper="Choose a standard industry design problem or select Custom to define your own.">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <select
            style={selectStyle}
            value={SYSTEM_DESIGN_PRESETS.includes(config.systemToDesign) ? config.systemToDesign : 'Custom System / Architecture Problem'}
            onChange={e => {
              const val = e.target.value;
              if (val === 'Custom System / Architecture Problem') {
                set('systemToDesign', '');
              } else {
                set('systemToDesign', val);
              }
            }}
          >
            {SYSTEM_DESIGN_PRESETS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          {(!SYSTEM_DESIGN_PRESETS.includes(config.systemToDesign) || config.systemToDesign === '' || config.systemToDesign === 'Custom System / Architecture Problem') && (
            <input
              type="text"
              style={inputStyle}
              placeholder="e.g. Distributed Video Transcoder, Real-time Collaborative Canvas, Crypto Exchange Orderbook"
              value={config.systemToDesign || ''}
              onChange={e => set('systemToDesign', e.target.value)}
            />
          )}
        </div>
      </Field>
    ),
    expectedScale: (
      <Field label="Target Scale & Traffic Profile" helper="Select the concurrency and volume requirements for this architecture.">
        <PillRow
          options={SCALE_PROFILES}
          value={config.expectedScale || SCALE_PROFILES[1]}
          onChange={v => set('expectedScale', v)}
        />
      </Field>
    ),
    archPriority: (
      <Field label="Core Non-Functional & SLA Priorities" helper="Select the key architectural trade-offs to emphasize during evaluation.">
        <MultiSelect
          options={ARCH_PRIORITIES}
          selected={config.archPriority || ['High Availability (99.999% Uptime)', 'Ultra-Low Latency (<10ms p99)']}
          onChange={v => set('archPriority', v)}
        />
      </Field>
    ),
    preferredTech: (
      <Field label="Architectural Building Blocks & Tech Stack" helper="Choose the infrastructure primitives and data stores you prefer to utilize.">
        <MultiSelect
          options={SYSTEM_COMPONENTS}
          selected={config.preferredTech || ['PostgreSQL / Relational SQL', 'Redis / In-Memory Cache', 'Kafka / Event Streaming']}
          onChange={v => set('preferredTech', v)}
        />
      </Field>
    ),
    lldPatterns: (
      <Field label="Low-Level Design & Pattern Emphasis" helper="Select OOP design patterns, SOLID principles, or schema designs to be evaluated on.">
        <MultiSelect
          options={LLD_PATTERNS}
          selected={config.lldPatterns || ['SOLID Principles', 'Factory & Builder Pattern', 'Strategy & State Pattern']}
          onChange={v => set('lldPatterns', v)}
        />
      </Field>
    ),
    githubUrl: (
      <Field label="GitHub / Project URL">
        <input type="url" style={inputStyle} placeholder="https://github.com/username/project"
          value={config.githubUrl || ''} onChange={e => set('githubUrl', e.target.value)} />
      </Field>
    ),
    projectName: (
      <Field label="Project Name">
        <input type="text" style={inputStyle} placeholder="e.g. Government Scheme Chatbot"
          value={config.projectName || ''} onChange={e => set('projectName', e.target.value)} />
      </Field>
    ),
    techStack: (
      <Field label="Technologies Used">
        <input type="text" style={inputStyle} placeholder="e.g. Python, Flask, PostgreSQL, Redis"
          value={config.techStack || ''} onChange={e => set('techStack', e.target.value)} />
      </Field>
    ),
    userRole: (
      <Field label="Your Role in Project">
        <input type="text" style={inputStyle} placeholder="e.g. Full Stack Developer, ML Engineer"
          value={config.userRole || ''} onChange={e => set('userRole', e.target.value)} />
      </Field>
    ),
    deploymentInfo: (
      <Field label="Deployment">
        <input type="text" style={inputStyle} placeholder="e.g. AWS EC2, Heroku, Docker"
          value={config.deploymentInfo || ''} onChange={e => set('deploymentInfo', e.target.value)} />
      </Field>
    ),
    gdTopic: (
      <Field label="Topic">
        <input type="text" style={inputStyle} placeholder="e.g. AI is replacing jobs"
          value={config.gdTopic || ''} onChange={e => set('gdTopic', e.target.value)} />
      </Field>
    ),
    industry: (
      <Field label="Industry">
        <input type="text" style={inputStyle} placeholder="e.g. Fintech, Healthcare, SaaS"
          value={config.industry || ''} onChange={e => set('industry', e.target.value)} />
      </Field>
    ),
    gdParticipants: (
      <Field label="AI Participants">
        <PillRow options={GD_PARTICIPANTS} value={config.gdParticipants || '3'} onChange={v => set('gdParticipants', v)} />
      </Field>
    ),
    teamSize: (
      <Field label="Team Size">
        <select style={selectStyle} value={config.teamSize || '5-10'} onChange={e => set('teamSize', e.target.value)}>
          {['1-3', '5-10', '10-20', '20-50', '50+'].map(t => <option key={t}>{t}</option>)}
        </select>
      </Field>
    ),
    questionCount: (
      <Field label="Number of Questions">
        <select style={selectStyle} value={config.questionCount || '10'} onChange={e => set('questionCount', e.target.value)}>
          {['5', '10', '15', '20', '30', '50'].map(q => <option key={q}>{q}</option>)}
        </select>
      </Field>
    ),
    productIdea: (
      <Field label="Product / Idea">
        <input type="text" style={inputStyle} placeholder="e.g. Food delivery app for Tier-2 cities"
          value={config.productIdea || ''} onChange={e => set('productIdea', e.target.value)} />
      </Field>
    ),
    hrPracticeTopic: (
      <Field label="What type of HR questions do you want to practice?" helper="Select the main focus for your HR interview.">
        <PillRow
          options={[
            'All-Round HR Practice',
            'Self Introduction & Background',
            'Strengths & Weaknesses',
            'Teamwork & Situations',
            'Why Should We Hire You?'
          ]}
          value={config.hrPracticeTopic || 'All-Round HR Practice'}
          onChange={v => set('hrPracticeTopic', v)}
        />
      </Field>
    ),
    hrInterviewTone: (
      <Field label="Interviewer Style & Tone" helper="How would you like the interviewer to ask questions?">
        <PillRow
          options={[
            'Friendly & Encouraging',
            'Standard & Professional',
            'Challenging & Fast-Paced'
          ]}
          value={config.hrInterviewTone || 'Friendly & Encouraging'}
          onChange={v => set('hrInterviewTone', v)}
        />
      </Field>
    ),
    workPreference: (
      <Field label="Work & Location Preference" helper="Choose your preferred work mode.">
        <PillRow
          options={[
            'Work from Office',
            'Hybrid / Work from Home',
            'Ready to Relocate Anywhere'
          ]}
          value={config.workPreference || 'Work from Office'}
          onChange={v => set('workPreference', v)}
        />
      </Field>
    ),
    joiningTime: (
      <Field label="When can you join?" helper="Your joining availability.">
        <PillRow
          options={[
            'Immediately (Final Year / Ready)',
            'Within 1 Month',
            '1 - 2 Months'
          ]}
          value={config.joiningTime || 'Immediately (Final Year / Ready)'}
          onChange={v => set('joiningTime', v)}
        />
      </Field>
    ),
    techSubjects: (
      <Field label="Core CS & Technical Subjects Focus" helper="Select the computer science topics you want the interview questions to emphasize.">
        <MultiSelect
          options={[
            'OOP & SOLID Principles',
            'DBMS & SQL Queries',
            'Data Structures & Algorithms',
            'Operating Systems & Concurrency',
            'Computer Networks & Protocols',
            'REST APIs & Web Technologies'
          ]}
          selected={config.techSubjects || ['OOP & SOLID Principles', 'DBMS & SQL Queries', 'Data Structures & Algorithms']}
          onChange={v => set('techSubjects', v)}
        />
      </Field>
    ),
    techInterviewFocus: (
      <Field label="Technical Interview Focus" helper="Choose how you want the AI technical lead to balance theory versus practical applications.">
        <PillRow
          options={[
            'All-Round Technical Drill',
            'Core CS Theory & Fundamentals',
            'Practical Coding & Logic',
            'Project & Resume Deep Dive'
          ]}
          value={config.techInterviewFocus || 'All-Round Technical Drill'}
          onChange={v => set('techInterviewFocus', v)}
        />
      </Field>
    ),
    techInterviewTone: (
      <Field label="Technical Interviewer Style" helper="Choose the personality of your AI technical interviewer.">
        <PillRow
          options={[
            'Supportive Tech Mentor',
            'Standard Technical Lead',
            'Strict Lead Architect'
          ]}
          value={config.techInterviewTone || 'Standard Technical Lead'}
          onChange={v => set('techInterviewTone', v)}
        />
      </Field>
    ),
    techProjects: (
      <Field label="Key Projects & Tech Stack (Optional)" helper="List your major projects and technologies used (e.g. E-commerce in React + Node.js, ML spam filter in Python). The AI will ask technical questions based on your projects!">
        <textarea
          style={textareaStyle}
          placeholder="e.g. 1) Built a full-stack job portal using React, Node.js, and PostgreSQL. 2) Implemented Redis caching for sub-10ms query responses."
          value={config.techProjects || ''}
          onChange={e => set('techProjects', e.target.value)}
        />
      </Field>
    ),
    aboutUser: (
      <Field label="About Yourself / Key Highlights (Optional)" helper="Write a short note about your background, projects, or degree to personalize your questions.">
        <textarea
          style={textareaStyle}
          placeholder="e.g. Final year Computer Science student. Good at teamwork and communication. Completed project on college management system."
          value={config.aboutUser || ''}
          onChange={e => set('aboutUser', e.target.value)}
        />
      </Field>
    ),
    designFocus: (
      <Field label="System Design & Architecture Focus Scope" helper="Specify whether you want to focus on high-level distributed systems, low-level OOP/SOLID design, or both.">
        <PillRow
          options={DESIGN_FOCUS_OPTIONS}
          value={config.designFocus || DESIGN_FOCUS_OPTIONS[0]}
          onChange={v => set('designFocus', v)}
        />
      </Field>
    ),
    leadershipStyle: (
      <Field label="Leadership & Management Style">
        <select style={selectStyle} value={config.leadershipStyle || LEADERSHIP_STYLES[0]} onChange={e => set('leadershipStyle', e.target.value)}>
          {LEADERSHIP_STYLES.map(w => <option key={w}>{w}</option>)}
        </select>
      </Field>
    ),
    discussionRole: (
      <Field label="Group Discussion Stance / Role">
        <select style={selectStyle} value={config.discussionRole || 'For the Motion (Supporting Argument)'} onChange={e => set('discussionRole', e.target.value)}>
          {['For the Motion (Supporting Argument)', 'Against the Motion (Opposing Argument)', 'Balanced / Lead Facilitator', 'Devil\'s Advocate (Challenging Assumptions)'].map(w => <option key={w}>{w}</option>)}
        </select>
      </Field>
    ),
    commScenario: (
      <Field label="Communication Scenario">
        <select style={selectStyle} value={config.commScenario || COMM_SCENARIOS[0]} onChange={e => set('commScenario', e.target.value)}>
          {COMM_SCENARIOS.map(w => <option key={w}>{w}</option>)}
        </select>
      </Field>
    ),
    targetAccent: (
      <Field label="Target Accent & Region">
        <select style={selectStyle} value={config.targetAccent || ACCENTS[0]} onChange={e => set('targetAccent', e.target.value)}>
          {ACCENTS.map(w => <option key={w}>{w}</option>)}
        </select>
      </Field>
    ),
    speechPaceTarget: (
      <Field label="Target Speaking Pace (WPM)">
        <PillRow options={['120-130 WPM (Deliberate)', '130-150 WPM (Optimal)', '150-170 WPM (Fast)']} value={config.speechPaceTarget || '130-150 WPM (Optimal)'} onChange={v => set('speechPaceTarget', v)} />
      </Field>
    ),
    mlFramework: (
      <Field label="Primary ML Framework">
        <select style={selectStyle} value={config.mlFramework || 'PyTorch'} onChange={e => set('mlFramework', e.target.value)}>
          {ML_FRAMEWORKS.map(w => <option key={w}>{w}</option>)}
        </select>
      </Field>
    ),
    modelType: (
      <Field label="Model Architecture Focus">
        <MultiSelect options={MODEL_TYPES} selected={config.modelType} onChange={v => set('modelType', v)} />
      </Field>
    ),
    cicdPlatform: (
      <Field label="CI/CD & Automation Platform">
        <select style={selectStyle} value={config.cicdPlatform || 'GitHub Actions'} onChange={e => set('cicdPlatform', e.target.value)}>
          {['GitHub Actions', 'Jenkins', 'GitLab CI', 'ArgoCD / GitOps', 'CircleCI', 'AWS CodePipeline'].map(w => <option key={w}>{w}</option>)}
        </select>
      </Field>
    ),
    infraType: (
      <Field label="Infrastructure Scope">
        <PillRow options={['Kubernetes Cluster', 'Serverless Architecture', 'Hybrid Cloud', 'Multi-Tenant Microservices']} value={config.infraType || 'Kubernetes Cluster'} onChange={v => set('infraType', v)} />
      </Field>
    ),
    cloudArchGoal: (
      <Field label="Primary Cloud Goal">
        <select style={selectStyle} value={config.cloudArchGoal || CLOUD_GOALS[0]} onChange={e => set('cloudArchGoal', e.target.value)}>
          {CLOUD_GOALS.map(w => <option key={w}>{w}</option>)}
        </select>
      </Field>
    ),
    threatScenario: (
      <Field label="Target Threat Scenario">
        <select style={selectStyle} value={config.threatScenario || THREAT_SCENARIOS[0]} onChange={e => set('threatScenario', e.target.value)}>
          {THREAT_SCENARIOS.map(w => <option key={w}>{w}</option>)}
        </select>
      </Field>
    ),
    complianceStandard: (
      <Field label="Security Compliance & Standards">
        <MultiSelect options={['OWASP Top 10', 'SOC 2 Type II', 'ISO 27001', 'GDPR / Privacy', 'PCI-DSS', 'HIPAA']} selected={config.complianceStandard} onChange={v => set('complianceStandard', v)} />
      </Field>
    ),
    testingTypes: (
      <Field label="Testing Scope & Methodology">
        <MultiSelect options={TESTING_TYPES} selected={config.testingTypes} onChange={v => set('testingTypes', v)} />
      </Field>
    ),
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {fieldNames.map(name => RENDERERS[name] ? <div key={name}>{RENDERERS[name]}</div> : null)}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ConfigurationModule() {
  const config           = useInterviewStore((s) => s.config) || {};
  const setConfig        = useInterviewStore((s) => s.setConfig);
  const startDeviceCheck = useInterviewStore((s) => s.startDeviceCheck);
  const setPipelineState = useInterviewStore((s) => s.setPipelineState);
  const [activeTab, setActiveTab] = useState('track');

  const set     = (key, val) => setConfig({ [key]: val });
  const trackId = config.trackId || 'custom';
  const trackMeta = TRACK_FIELDS[trackId] || TRACK_FIELDS['custom'];

  const handleContinueToDeviceCheck = () => {
    setConfig({
      ...config,
      trackId: config.trackId || 'hr',
      trackName: config.trackName || TRACK_FIELDS[config.trackId || 'hr']?.label || 'HR Interview'
    });
    setPipelineState('device_check');
  };

  const tabStyle = (id) => ({
    padding: '8px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, cursor: 'pointer',
    border: `1px solid ${activeTab === id ? 'var(--btn-sage)' : 'var(--border-color)'}`,
    backgroundColor: activeTab === id ? 'var(--btn-sage)' : 'var(--bg-card)',
    color: activeTab === id ? '#FFFFFF' : 'var(--body-text)',
    boxShadow: activeTab === id ? '0 2px 8px rgba(82, 98, 87, 0.25)' : 'none',
    transition: 'all 0.15s ease',
    fontFamily: 'var(--font-body)'
  });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      backgroundColor: 'var(--bg-page)', fontFamily: 'var(--font-body)', overflow: 'hidden',
    }}>

      {/* ── Header ── */}
      <div style={{
        backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)',
        padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0,
        boxShadow: '0 1px 3px rgba(45, 58, 48, 0.03)'
      }}>
        <button onClick={() => setPipelineState('selection')} className="btn-secondary-spec" style={{
          padding: '6px 14px', fontSize: '13px', borderRadius: '8px'
        }}>
          ← Back
        </button>
        <span style={{ width: '1px', height: '18px', backgroundColor: 'var(--border-color)' }} />
        <span className="pill-tag" style={{ fontSize: '12px' }}>
          {trackMeta.label}
        </span>
        <span style={{ fontSize: '17px', fontWeight: 800, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>
          Configure Interview Session
        </span>

        {/* Tabs */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button style={tabStyle('track')} onClick={() => setActiveTab('track')}>Track Settings</button>
          <button style={tabStyle('style')} onClick={() => setActiveTab('style')}>Interview Style</button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 330px' }}>

        {/* ── LEFT: Dynamic form ── */}
        <div style={{ padding: '24px 30px', overflowY: 'auto', borderRight: '1px solid var(--border-color)' }}>

          {activeTab === 'track' ? (
            <>
              {/* Track header strip */}
              <div className="calm-sub-card" style={{
                padding: '16px 20px', marginBottom: '22px', display: 'flex', flexDirection: 'column', gap: '4px'
              }}>
                <p style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>{trackMeta.label}</p>
                <p style={{ margin: 0, fontSize: '13px', color: 'var(--body-text)', lineHeight: 1.5, fontFamily: 'var(--font-body)' }}>
                  Configure your preferences below. The AI will curate and calibrate the interview environment accordingly.
                </p>
              </div>
              <TrackFields trackId={trackId} config={config} set={set} />
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Difficulty */}
              <div className="calm-sub-card" style={{ padding: '18px 20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-terracotta)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-body)' }}>
                  Difficulty Level
                </p>
                <PillRow options={DIFFICULTIES} value={config.difficulty || 'Adaptive AI'} onChange={v => set('difficulty', v)} />
              </div>

              {/* Personality */}
              <div className="calm-sub-card" style={{ padding: '18px 20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-terracotta)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-body)' }}>
                  Interviewer Personality
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {PERSONALITIES.map(p => {
                    const active = (config.personality || 'professional') === p.id;
                    return (
                      <div key={p.id} onClick={() => set('personality', p.id)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                        border: `1px solid ${active ? 'var(--btn-sage)' : 'var(--border-color)'}`,
                        backgroundColor: active ? 'var(--btn-sage)' : 'var(--bg-card)',
                        boxShadow: active ? '0 2px 8px rgba(82, 98, 87, 0.25)' : 'none',
                        transition: 'all 0.15s ease',
                      }}>
                        <div>
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: active ? '#FFFFFF' : 'var(--main-heading)' }}>{p.label}</span>
                          <span style={{ fontSize: '12.5px', color: active ? '#EAECE8' : 'var(--text-muted)', marginLeft: '8px' }}>{p.desc}</span>
                        </div>
                        {active && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFFFFF', flexShrink: 0 }} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Duration */}
              <div className="calm-sub-card" style={{ padding: '18px 20px' }}>
                <p style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-terracotta)', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-body)' }}>
                  Session Duration
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {DURATIONS.map(d => {
                    const active = (config.duration || '30') === d;
                    return (
                      <button key={d} onClick={() => set('duration', d)} style={{
                        flex: 1, padding: '9px 0', borderRadius: '8px', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer',
                        border: `1px solid ${active ? 'var(--btn-sage)' : 'var(--border-color)'}`,
                        backgroundColor: active ? 'var(--btn-sage)' : 'var(--bg-card)',
                        color: active ? '#FFFFFF' : 'var(--body-text)',
                        boxShadow: active ? '0 2px 8px rgba(82, 98, 87, 0.25)' : 'none',
                        transition: 'all 0.15s ease',
                        fontFamily: 'var(--font-body)'
                      }}>
                        {d}m
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ── RIGHT: Settings panel ── */}
        <div style={{ padding: '20px 18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)' }}>

          {/* Mode & Language */}
          <div className="calm-sub-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: 'var(--accent-terracotta)', textTransform: 'uppercase', letterSpacing: '0.6px', fontFamily: 'var(--font-body)' }}>Session Format</p>
            <Field label="Interview Mode">
              <select style={selectStyle} value={config.mode || 'voice'} onChange={e => set('mode', e.target.value)}>
                <option value="voice">Voice + Video (Live Adaptive AI)</option>
                <option value="text">Text Only</option>
              </select>
            </Field>
            <Field label="Spoken Language">
              <select style={selectStyle} value={config.language || 'English'} onChange={e => set('language', e.target.value)}>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
          </div>

          {/* Feature toggles */}
          <div className="calm-sub-card" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-terracotta)', textTransform: 'uppercase', letterSpacing: '0.6px', margin: 0, fontFamily: 'var(--font-body)' }}>
              Proctoring & Hardware Feed
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { key: 'enableVideo', label: 'Camera Video Feed' },
                { key: 'enableMic',   label: 'Microphone Audio' },
              ].map(item => (
                <Toggle
                  key={item.key}
                  label={item.label}
                  active={config[item.key] !== false}
                  onToggle={() => set(item.key, config[item.key] === false ? true : false)}
                />
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="calm-sub-card" style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 800, color: 'var(--accent-terracotta)', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-body)' }}>
              Session Summary
            </p>
            {[
              { label: 'Track',       value: trackMeta.label },
              { label: 'Difficulty',  value: config.difficulty || 'Adaptive AI' },
              { label: 'Duration',    value: `${config.duration || 30} min` },
              { label: 'Personality', value: PERSONALITIES.find(p => p.id === (config.personality || 'professional'))?.label || 'Professional' },
              config.role    && { label: 'Role',    value: config.role },
              config.company && { label: 'Company', value: config.company },
            ].filter(Boolean).map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12.5px', color: 'var(--body-text)' }}>{label}</span>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--main-heading)', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
            <button
              onClick={handleContinueToDeviceCheck}
              className="btn-primary-spec"
              style={{
                width: '100%', padding: '12px 18px', fontSize: '14px', fontWeight: 700, borderRadius: '10px',
                justifyContent: 'center', boxShadow: 'var(--shadow-3d-btn)'
              }}
            >
              Continue to Device Check
            </button>
            <button
              onClick={() => setPipelineState('selection')}
              className="btn-secondary-spec"
              style={{
                width: '100%', padding: '10px 14px', fontSize: '13px', fontWeight: 700, borderRadius: '10px',
                justifyContent: 'center'
              }}
            >
              Back to Track Selection
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
