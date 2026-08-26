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

// ── Track-specific configuration schema for all 12 tracks ─────────────────────
const TRACK_FIELDS = {
  hr:                { label: 'HR Interview',         fields: ['role', 'company', 'experience', 'hrInterviewType', 'hrEvaluationFocus', 'companyValues', 'workStyle', 'candidateAvailability', 'careerGoals', 'resume', 'jobDescription'] },
  tech:              { label: 'Technical Interview',  fields: ['role', 'company', 'experience', 'codingLang', 'techSubjects', 'jobDescription'] },
  dsa:               { label: 'DSA & Coding',         fields: ['codingLang', 'difficulty_dsa', 'timeLimitPerProblem', 'evaluationFocus', 'complexityRequirement', 'proctoringMode'] },
  system_design:     { label: 'System Design & Architecture (HLD & LLD)', fields: ['role', 'codingLang', 'experience', 'systemToDesign', 'expectedScale', 'preferredTech', 'designFocus'] },
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

// ── Design tokens — professional grey / white / border ────────────────────────
const GREY_BTN = '#475569';
const GREY_TEXT = '#64748B';
const BORDER = '#CBD5E1';
const BG     = '#F8FAFC';
const TEXT_MAIN = '#0F172A';

const inputStyle = {
  padding: '11px 14px', fontSize: '14px', borderRadius: '8px',
  border: `1px solid ${BORDER}`, backgroundColor: '#FFFFFF',
  color: TEXT_MAIN, outline: 'none', width: '100%',
  fontFamily: 'var(--font-inter)', fontWeight: 500,
  boxSizing: 'border-box'
};
const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: '90px' };
const selectStyle   = { ...inputStyle, cursor: 'pointer' };

// ── Field label wrapper ───────────────────────────────────────────────────────
const Field = ({ label, helper, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
    <label style={{ fontSize: '14px', fontWeight: 700, color: TEXT_MAIN, letterSpacing: '-0.2px' }}>
      {label}
    </label>
    {children}
    {helper && (
      <span style={{ fontSize: '12.5px', color: GREY_TEXT, lineHeight: 1.4 }}>
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
            padding: '7px 14px', borderRadius: '6px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
            border: `1px solid ${active ? GREY_BTN : BORDER}`,
            backgroundColor: active ? GREY_BTN : '#FFFFFF',
            color: active ? '#FFFFFF' : TEXT_MAIN,
            transition: 'all 0.15s ease',
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
    padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
    border: `1px solid ${BORDER}`, backgroundColor: '#FFFFFF',
  }}>
    <span style={{ fontSize: '13.5px', fontWeight: 600, color: TEXT_MAIN }}>{label}</span>
    <div style={{
      width: '38px', height: '22px', borderRadius: '11px',
      backgroundColor: active ? GREY_BTN : '#CBD5E1',
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
          padding: '8px 16px', borderRadius: '6px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
          border: `1px solid ${active ? GREY_BTN : BORDER}`,
          backgroundColor: active ? GREY_BTN : '#FFFFFF',
          color: active ? '#FFFFFF' : TEXT_MAIN,
          transition: 'all 0.15s ease',
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
      <Field label="Target Role" helper="Specify the role you are targeting for tailored questions.">
        <input type="text" style={inputStyle} placeholder="e.g. SDE-1, Full Stack Engineer, Backend Developer"
          value={config.role || ''} onChange={e => set('role', e.target.value)} />
      </Field>
    ),
    company: (
      <Field label="Target Company (Optional)" helper="Simulate assessment style calibrated for your target company.">
        <input type="text" style={inputStyle} placeholder="e.g. Amazon, Google, TCS, Microsoft, Startup"
          value={config.company || ''} onChange={e => set('company', e.target.value)} />
      </Field>
    ),
    experience: (
      <Field label="Experience Level" helper="Target career stage for situational difficulty calibration.">
        <PillRow
          options={['Campus / Fresher', '1-2 years', '3-5 years', '5+ years']}
          value={config.experience || 'Campus / Fresher'}
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
      <Field label="System / Problem to Design">
        <input type="text" style={inputStyle} placeholder="e.g. Food Delivery App, Parking Lot"
          value={config.systemToDesign || ''} onChange={e => set('systemToDesign', e.target.value)} />
      </Field>
    ),
    expectedScale: (
      <Field label="Expected Scale">
        <input type="text" style={inputStyle} placeholder="e.g. 10 million users"
          value={config.expectedScale || ''} onChange={e => set('expectedScale', e.target.value)} />
      </Field>
    ),
    preferredTech: (
      <Field label="Preferred Technologies">
        <input type="text" style={inputStyle} placeholder="e.g. PostgreSQL, Redis, Kafka"
          value={config.preferredTech || ''} onChange={e => set('preferredTech', e.target.value)} />
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
    hrInterviewType: (
      <Field label="Interview Round Format" helper="Choose the interview structure and screening depth.">
        <PillRow
          options={['Campus Placement Final HR', 'Recruiter Screening', 'Culture & Values Fit Round', 'Leadership & Behavioral Round']}
          value={config.hrInterviewType || 'Campus Placement Final HR'}
          onChange={v => set('hrInterviewType', v)}
        />
      </Field>
    ),
    hrEvaluationFocus: (
      <Field label="HR Assessment Focus Area" helper="Select the primary competency or evaluation dimension to emphasize.">
        <PillRow
          options={['Comprehensive HR Round', 'Behavioral & STAR Scenarios', 'Culture Fit & Core Values', 'Career Motivation & Ambition', 'Conflict & Team Collaboration']}
          value={config.hrEvaluationFocus || 'Comprehensive HR Round'}
          onChange={v => set('hrEvaluationFocus', v)}
        />
      </Field>
    ),
    candidateAvailability: (
      <Field label="Availability & Notice Period" helper="Your joining availability for realistic HR scenario questions.">
        <PillRow
          options={['Immediate / Final Year Student', '15 - 30 Days', '1 - 2 Months', 'Exploring Opportunities']}
          value={config.candidateAvailability || 'Immediate / Final Year Student'}
          onChange={v => set('candidateAvailability', v)}
        />
      </Field>
    ),
    careerGoals: (
      <Field label="Short & Long-Term Career Goals (Optional)" helper="Briefly describe your ambitions (e.g. Lead Engineer in 3 years, Cloud Architect, AI Specialization).">
        <input type="text" style={inputStyle} placeholder="e.g. Aspiring software engineer targeting scalable cloud applications"
          value={config.careerGoals || ''} onChange={e => set('careerGoals', e.target.value)} />
      </Field>
    ),
    companyValues: (
      <Field label="Target Company Core Values" helper="Select corporate values to calibrate behavioral and scenario questions.">
        <MultiSelect options={COMPANY_VALUES} selected={config.companyValues} onChange={v => set('companyValues', v)} />
      </Field>
    ),
    workStyle: (
      <Field label="Preferred Work Culture & Style" helper="Select the team dynamic style for situational evaluation.">
        <PillRow
          options={['High-Growth Startup', 'Global Enterprise / MNC', 'Product-Driven Tech Team', 'Autonomous Remote / Async']}
          value={config.workStyle || 'Global Enterprise / MNC'}
          onChange={v => set('workStyle', v)}
        />
      </Field>
    ),
    designFocus: (
      <Field label="Architecture Focus Area">
        <select style={selectStyle} value={config.designFocus || 'High-Level Architecture (HLD)'} onChange={e => set('designFocus', e.target.value)}>
          {['High-Level Architecture (HLD)', 'Low-Level Design (LLD & SOLID)', 'Distributed Database & Caching', 'End-to-End Scalable System'].map(w => <option key={w}>{w}</option>)}
        </select>
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

  const tabStyle = (id) => ({
    padding: '7px 16px', borderRadius: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
    border: `1px solid ${activeTab === id ? GREY_BTN : BORDER}`,
    backgroundColor: activeTab === id ? GREY_BTN : '#FFFFFF',
    color: activeTab === id ? '#FFFFFF' : GREY_TEXT,
    transition: 'all 0.15s ease',
  });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      backgroundColor: '#FFFFFF', fontFamily: 'var(--font-inter)', overflow: 'hidden',
    }}>

      {/* ── Header ── */}
      <div style={{
        backgroundColor: '#FFFFFF', borderBottom: `1px solid ${BORDER}`,
        padding: '14px 28px', display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0,
      }}>
        <button onClick={() => setPipelineState('selection')} style={{
          background: 'none', border: 'none', color: GREY_TEXT, fontSize: '14px', cursor: 'pointer', fontWeight: 600, padding: 0,
        }}>
          Back
        </button>
        <span style={{ width: '1px', height: '18px', backgroundColor: BORDER }} />
        <span style={{
          padding: '3px 12px', borderRadius: '6px', fontSize: '13px', fontWeight: 700,
          backgroundColor: '#F1F5F9', color: TEXT_MAIN, border: `1px solid ${BORDER}`,
        }}>
          {trackMeta.label}
        </span>
        <span style={{ fontSize: '16px', fontWeight: 800, color: TEXT_MAIN }}>Configure Session</span>

        {/* Tabs */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
          <button style={tabStyle('track')} onClick={() => setActiveTab('track')}>Track Settings</button>
          <button style={tabStyle('style')} onClick={() => setActiveTab('style')}>Interview Style</button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 310px' }}>

        {/* ── LEFT: Dynamic form ── */}
        <div style={{ padding: '24px 30px', overflowY: 'auto', borderRight: `1px solid ${BORDER}` }}>

          {activeTab === 'track' ? (
            <>
              {/* Track header strip */}
              <div style={{
                padding: '14px 18px', borderRadius: '8px', marginBottom: '22px',
                backgroundColor: BG, border: `1px solid ${BORDER}`,
              }}>
                <p style={{ margin: 0, fontSize: '14.5px', fontWeight: 800, color: TEXT_MAIN }}>{trackMeta.label}</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: GREY_TEXT, lineHeight: 1.5 }}>
                  Configure your preferences below. The AI will curate and calibrate the interview environment accordingly.
                </p>
              </div>
              <TrackFields trackId={trackId} config={config} set={set} />
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>

              {/* Difficulty */}
              <div style={{ padding: '18px 20px', border: `1px solid ${BORDER}`, borderRadius: '8px', backgroundColor: '#FFFFFF' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: TEXT_MAIN, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Difficulty Level
                </p>
                <PillRow options={DIFFICULTIES} value={config.difficulty || 'Adaptive AI'} onChange={v => set('difficulty', v)} />
              </div>

              {/* Personality */}
              <div style={{ padding: '18px 20px', border: `1px solid ${BORDER}`, borderRadius: '8px', backgroundColor: '#FFFFFF' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: TEXT_MAIN, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Interviewer Personality
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {PERSONALITIES.map(p => {
                    const active = (config.personality || 'professional') === p.id;
                    return (
                      <div key={p.id} onClick={() => set('personality', p.id)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 14px', borderRadius: '6px', cursor: 'pointer',
                        border: `1px solid ${active ? GREY_BTN : BORDER}`,
                        backgroundColor: active ? GREY_BTN : '#FAFAFA',
                        transition: 'all 0.15s ease',
                      }}>
                        <div>
                          <span style={{ fontSize: '13.5px', fontWeight: 700, color: active ? '#FFFFFF' : TEXT_MAIN }}>{p.label}</span>
                          <span style={{ fontSize: '12.5px', color: active ? '#E2E8F0' : GREY_TEXT, marginLeft: '8px' }}>{p.desc}</span>
                        </div>
                        {active && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFFFFF', flexShrink: 0 }} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Duration */}
              <div style={{ padding: '18px 20px', border: `1px solid ${BORDER}`, borderRadius: '8px', backgroundColor: '#FFFFFF' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: TEXT_MAIN, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Session Duration
                </p>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {DURATIONS.map(d => {
                    const active = (config.duration || '30') === d;
                    return (
                      <button key={d} onClick={() => set('duration', d)} style={{
                        flex: 1, padding: '9px 0', borderRadius: '6px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
                        border: `1px solid ${active ? GREY_BTN : BORDER}`,
                        backgroundColor: active ? GREY_BTN : '#FFFFFF',
                        color: active ? '#FFFFFF' : TEXT_MAIN,
                        transition: 'all 0.15s ease',
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
        <div style={{ padding: '22px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', backgroundColor: BG, borderLeft: `1px solid ${BORDER}` }}>

          {/* Mode & Language */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: GREY_TEXT, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Session Format</p>
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

          <div style={{ height: '1px', backgroundColor: BORDER }} />

          {/* Feature toggles */}
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: GREY_TEXT, textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 10px 0' }}>
              Proctoring & Support
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

          <div style={{ height: '1px', backgroundColor: BORDER }} />

          {/* Summary */}
          <div style={{ backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: '8px', padding: '14px 16px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: 700, color: TEXT_MAIN, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: GREY_TEXT }}>{label}</span>
                <span style={{ fontSize: '13px', fontWeight: 700, color: TEXT_MAIN, maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              onClick={startDeviceCheck}
              style={{
                width: '100%', padding: '13px', backgroundColor: GREY_BTN, color: '#FFFFFF',
                border: 'none', borderRadius: '8px', fontSize: '14.5px', fontWeight: 700, cursor: 'pointer',
                transition: 'opacity 0.15s ease',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Continue to Device Check
            </button>
            <button
              onClick={() => setPipelineState('selection')}
              style={{
                width: '100%', padding: '11px', backgroundColor: '#FFFFFF', color: TEXT_MAIN,
                border: `1px solid ${BORDER}`, borderRadius: '8px', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer',
              }}
            >
              Back to Selection
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
