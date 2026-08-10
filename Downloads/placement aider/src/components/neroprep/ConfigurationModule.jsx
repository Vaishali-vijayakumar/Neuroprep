import React, { useState } from 'react';
import useInterviewStore from '../../store/interviewStore';

const DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced', 'Expert', 'Adaptive AI'];
const PERSONALITIES = [
  { id: 'friendly',     label: 'Friendly Mentor',            desc: 'Encouraging, supportive tone.' },
  { id: 'professional', label: 'Professional Recruiter',      desc: 'Balanced and formal.' },
  { id: 'strict',       label: 'Strict Technical Lead',       desc: 'Deep technical pressure.' },
  { id: 'manager',      label: 'Senior Engineering Manager',  desc: 'Leadership and systems thinking.' },
  { id: 'stress',       label: 'Stress Interviewer',          desc: 'Interrupts and challenges answers.' },
];
const LANGUAGES  = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam'];
const DURATIONS  = ['15', '30', '45', '60', '90'];
const CODING_LANGS = ['JavaScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'TypeScript'];
const CLOUD_PROVIDERS = ['AWS', 'Google Cloud', 'Azure', 'Multi-Cloud'];
const AWS_SERVICES = ['EC2', 'S3', 'Lambda', 'RDS', 'DynamoDB', 'ECS', 'CloudFront', 'API Gateway', 'IAM', 'VPC', 'SQS', 'SNS'];
const DSA_TOPICS = ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching', 'Stacks & Queues', 'Heaps', 'Tries', 'Bit Manipulation'];
const TECH_SUBJECTS = ['OOP', 'DBMS', 'Operating Systems', 'Computer Networks', 'System Software', 'Data Structures', 'Compiler Design'];
const AIML_TOPICS = ['Machine Learning', 'Deep Learning', 'CNN', 'RNN/LSTM', 'Transformers', 'LLMs', 'RAG', 'Fine-tuning', 'Vector Databases', 'MLOps', 'Reinforcement Learning'];
const DEVOPS_TOOLS = ['Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible', 'Prometheus', 'Grafana', 'AWS', 'GCP', 'Azure'];
const SECURITY_DOMAINS = ['OWASP', 'Encryption', 'Authentication & OAuth', 'Network Security', 'Firewalls', 'SOC Analysis', 'Incident Response', 'Penetration Testing', 'Cloud Security'];
const QA_TOOLS = ['Selenium', 'Cypress', 'Playwright', 'Postman', 'JUnit', 'TestNG', 'Jest', 'Pytest', 'API Testing', 'Performance Testing'];
const GD_PARTICIPANTS = ['3', '4', '5', '6'];
const APTITUDE_TOPICS = ['Percentages', 'Profit & Loss', 'Time & Work', 'Speed & Distance', 'Probability', 'Number System', 'Logical Reasoning', 'Verbal Reasoning', 'Data Interpretation'];

// ── Track-specific configuration schema ──────────────────────────────────────
const TRACK_FIELDS = {
  hr: {
    label: 'HR Interview',
    icon: '🤝',
    color: '#6366F1',
    fields: ['role', 'company', 'experience', 'resume', 'jobDescription', 'careerGoals'],
  },
  tech: {
    label: 'Technical',
    icon: '⚙️',
    color: '#0EA5E9',
    fields: ['role', 'company', 'experience', 'codingLang', 'techSubjects', 'jobDescription'],
  },
  dsa: {
    label: 'DSA',
    icon: '🌲',
    color: '#10B981',
    fields: ['codingLang', 'dsaTopics', 'company', 'experience', 'questionCount'],
  },
  coding: {
    label: 'Coding',
    icon: '💻',
    color: '#F59E0B',
    fields: ['codingLang', 'dsaTopics', 'company', 'role', 'questionCount'],
  },
  system_design: {
    label: 'System Design',
    icon: '🏗️',
    color: '#8B5CF6',
    fields: ['role', 'experience', 'systemToDesign', 'expectedScale', 'preferredTech'],
  },
  lld: {
    label: 'Low-Level Design',
    icon: '🔩',
    color: '#EC4899',
    fields: ['codingLang', 'role', 'systemToDesign', 'experience'],
  },
  behavioral: {
    label: 'Behavioral',
    icon: '🌟',
    color: '#F97316',
    fields: ['role', 'company', 'experience', 'resume', 'achievements'],
  },
  managerial: {
    label: 'Managerial',
    icon: '📋',
    color: '#64748B',
    fields: ['role', 'company', 'experience', 'teamSize', 'jobDescription'],
  },
  group_discussion: {
    label: 'Group Discussion',
    icon: '💬',
    color: '#06B6D4',
    fields: ['gdTopic', 'industry', 'gdParticipants'],
  },
  resume: {
    label: 'Resume Interview',
    icon: '📄',
    color: '#84CC16',
    fields: ['resume', 'role', 'company', 'jobDescription'],
  },
  project: {
    label: 'Project Viva',
    icon: '🔬',
    color: '#EF4444',
    fields: ['projectName', 'githubUrl', 'techStack', 'userRole', 'deploymentInfo'],
  },
  company: {
    label: 'Company Specific',
    icon: '🏢',
    color: '#7C3AED',
    fields: ['company', 'role', 'experience', 'resume', 'jobDescription'],
  },
  aptitude: {
    label: 'Aptitude',
    icon: '🔢',
    color: '#0891B2',
    fields: ['aptitudeTopics', 'company', 'questionCount'],
  },
  communication: {
    label: 'Communication',
    icon: '🗣️',
    color: '#16A34A',
    fields: ['role', 'experience', 'gdTopic'],
  },
  stress: {
    label: 'Stress Interview',
    icon: '🔥',
    color: '#DC2626',
    fields: ['role', 'experience', 'techSubjects'],
  },
  rapid_fire: {
    label: 'Rapid Fire',
    icon: '⚡',
    color: '#D97706',
    fields: ['techSubjects', 'questionCount', 'codingLang'],
  },
  ai_ml: {
    label: 'AI / ML',
    icon: '🤖',
    color: '#7C3AED',
    fields: ['aimlTopics', 'role', 'experience', 'resume'],
  },
  devops: {
    label: 'DevOps',
    icon: '🐳',
    color: '#0F766E',
    fields: ['devopsTools', 'role', 'experience', 'cloudProvider'],
  },
  cloud: {
    label: 'Cloud',
    icon: '☁️',
    color: '#2563EB',
    fields: ['cloudProvider', 'cloudServices', 'role', 'experience'],
  },
  cybersecurity: {
    label: 'Cybersecurity',
    icon: '🔐',
    color: '#991B1B',
    fields: ['securityDomains', 'role', 'experience'],
  },
  qa: {
    label: 'QA / Testing',
    icon: '🧪',
    color: '#4D7C0F',
    fields: ['qaTools', 'role', 'experience', 'codingLang'],
  },
  product_management: {
    label: 'Product Management',
    icon: '📊',
    color: '#BE185D',
    fields: ['role', 'company', 'experience', 'industry', 'productIdea'],
  },
  assessment_center: {
    label: 'Assessment Center',
    icon: '🏛️',
    color: '#374151',
    fields: ['company', 'role', 'experience', 'resume', 'jobDescription'],
  },
  custom: {
    label: 'Custom Builder',
    icon: '🛠️',
    color: '#6B7280',
    fields: ['role', 'company', 'techSubjects', 'codingLang', 'experience', 'jobDescription', 'questionCount'],
  },
};

// ── Reusable field primitives ────────────────────────────────────────────────
const inputStyle = {
  padding: '8px 10px', fontSize: '13px', borderRadius: '7px',
  border: '1px solid var(--border-color)', backgroundColor: '#FAFAFA',
  color: 'var(--text-main)', outline: 'none', width: '100%',
  fontFamily: 'var(--font-inter)',
};
const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: '80px' };
const selectStyle   = { ...inputStyle, backgroundColor: '#FFFFFF' };

const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
      {label}
    </label>
    {children}
  </div>
);

// Multi-select tag chips
const MultiSelect = ({ options, selected, onChange, color = '#111827' }) => {
  const sel = selected || [];
  const toggle = (opt) => {
    if (sel.includes(opt)) onChange(sel.filter(o => o !== opt));
    else onChange([...sel, opt]);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
      {options.map(opt => {
        const active = sel.includes(opt);
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            style={{
              padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
              border: `1px solid ${active ? color : 'var(--border-color)'}`,
              backgroundColor: active ? color : '#FFFFFF',
              color: active ? '#FFFFFF' : 'var(--text-body)',
              transition: 'all 0.12s ease',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
};

// ── The dynamic field renderer ───────────────────────────────────────────────
function TrackFields({ trackId, config, set, accentColor }) {
  const fieldNames = (TRACK_FIELDS[trackId] || TRACK_FIELDS['custom']).fields;

  const FIELD_RENDERERS = {
    role: (
      <Field label="Target Role">
        <input type="text" style={inputStyle} placeholder="e.g. Backend Developer"
          value={config.role || ''} onChange={e => set('role', e.target.value)} />
      </Field>
    ),
    company: (
      <Field label="Company">
        <input type="text" style={inputStyle} placeholder="e.g. Google, TCS, Startup"
          value={config.company || ''} onChange={e => set('company', e.target.value)} />
      </Field>
    ),
    experience: (
      <Field label="Experience Level">
        <select style={selectStyle} value={config.experience || 'Fresher'} onChange={e => set('experience', e.target.value)}>
          {['Fresher', '1-2 years', '3-5 years', '5+ years', '10+ years'].map(e => <option key={e}>{e}</option>)}
        </select>
      </Field>
    ),
    codingLang: (
      <Field label="Programming Language">
        <select style={selectStyle} value={config.codingLang || 'Java'} onChange={e => set('codingLang', e.target.value)}>
          {CODING_LANGS.map(l => <option key={l}>{l}</option>)}
        </select>
      </Field>
    ),
    resume: (
      <Field label="Resume / Profile Summary (paste text)">
        <textarea style={textareaStyle} placeholder="Paste your resume text or a brief summary here..."
          value={config.resume || ''} onChange={e => set('resume', e.target.value)} />
      </Field>
    ),
    jobDescription: (
      <Field label="Job Description (optional)">
        <textarea style={textareaStyle} placeholder="Paste the job description for targeted questions..."
          value={config.jobDescription || ''} onChange={e => set('jobDescription', e.target.value)} />
      </Field>
    ),
    careerGoals: (
      <Field label="Career Goals">
        <input type="text" style={inputStyle} placeholder="e.g. Become a Backend Architect in 3 years"
          value={config.careerGoals || ''} onChange={e => set('careerGoals', e.target.value)} />
      </Field>
    ),
    achievements: (
      <Field label="Key Achievements / Projects">
        <textarea style={textareaStyle} placeholder="List your notable achievements and projects..."
          value={config.achievements || ''} onChange={e => set('achievements', e.target.value)} />
      </Field>
    ),
    techSubjects: (
      <Field label="Subjects / Topics">
        <MultiSelect options={TECH_SUBJECTS} selected={config.techSubjects} onChange={v => set('techSubjects', v)} color={accentColor} />
      </Field>
    ),
    dsaTopics: (
      <Field label="DSA Topics">
        <MultiSelect options={DSA_TOPICS} selected={config.dsaTopics} onChange={v => set('dsaTopics', v)} color={accentColor} />
      </Field>
    ),
    aimlTopics: (
      <Field label="AI / ML Topics">
        <MultiSelect options={AIML_TOPICS} selected={config.aimlTopics} onChange={v => set('aimlTopics', v)} color={accentColor} />
      </Field>
    ),
    devopsTools: (
      <Field label="Tools & Technologies">
        <MultiSelect options={DEVOPS_TOOLS} selected={config.devopsTools} onChange={v => set('devopsTools', v)} color={accentColor} />
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
        <MultiSelect options={AWS_SERVICES} selected={config.cloudServices} onChange={v => set('cloudServices', v)} color={accentColor} />
      </Field>
    ),
    securityDomains: (
      <Field label="Security Domains">
        <MultiSelect options={SECURITY_DOMAINS} selected={config.securityDomains} onChange={v => set('securityDomains', v)} color={accentColor} />
      </Field>
    ),
    qaTools: (
      <Field label="Testing Tools & Type">
        <MultiSelect options={QA_TOOLS} selected={config.qaTools} onChange={v => set('qaTools', v)} color={accentColor} />
      </Field>
    ),
    aptitudeTopics: (
      <Field label="Aptitude Topics">
        <MultiSelect options={APTITUDE_TOPICS} selected={config.aptitudeTopics} onChange={v => set('aptitudeTopics', v)} color={accentColor} />
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
      <Field label="Deployment (optional)">
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
      <Field label="Number of AI Participants">
        <div style={{ display: 'flex', gap: '7px' }}>
          {GD_PARTICIPANTS.map(n => {
            const active = (config.gdParticipants || '3') === n;
            return (
              <button key={n} onClick={() => set('gdParticipants', n)} style={{
                flex: 1, padding: '7px', borderRadius: '7px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                border: `1px solid ${active ? accentColor : 'var(--border-color)'}`,
                backgroundColor: active ? accentColor : '#FFFFFF',
                color: active ? '#FFFFFF' : 'var(--text-body)',
                transition: 'all 0.12s ease',
              }}>{n}</button>
            );
          })}
        </div>
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
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {fieldNames.map(name => FIELD_RENDERERS[name] ? (
        <div key={name}>{FIELD_RENDERERS[name]}</div>
      ) : null)}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ConfigurationModule() {
  const config          = useInterviewStore((s) => s.config) || {};
  const setConfig       = useInterviewStore((s) => s.setConfig);
  const startDeviceCheck = useInterviewStore((s) => s.startDeviceCheck);
  const setPipelineState = useInterviewStore((s) => s.setPipelineState);
  const [activeTab, setActiveTab] = useState('track'); // 'track' | 'style'

  const set = (key, val) => setConfig({ [key]: val });

  const trackId = config.trackId || 'custom';
  const trackMeta = TRACK_FIELDS[trackId] || TRACK_FIELDS['custom'];
  const accentColor = trackMeta.color;

  const activeBtn = (isActive) => ({
    padding: '6px 14px', borderRadius: '6px', border: isActive ? `1px solid ${accentColor}` : '1px solid var(--border-color)',
    backgroundColor: isActive ? accentColor : '#FFFFFF',
    color: isActive ? '#FFFFFF' : 'var(--text-body)',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer', transition: 'all 0.12s ease', whiteSpace: 'nowrap',
  });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      backgroundColor: 'var(--bg-page)', fontFamily: 'var(--font-inter)', overflow: 'hidden'
    }}>

      {/* ── Header ── */}
      <div style={{
        backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)',
        padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0
      }}>
        <button onClick={() => setPipelineState('selection')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', fontWeight: 500, padding: 0 }}>
          ← Back
        </button>
        <span style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-color)' }}></span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
          backgroundColor: `${accentColor}15`, color: accentColor, border: `1px solid ${accentColor}40`
        }}>
          {trackMeta.icon} {trackMeta.label}
        </span>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>Configure Session</span>

        {/* Tabs */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          {[{ id: 'track', label: '📋 Track Settings' }, { id: 'style', label: '🎨 Interview Style' }].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '6px 14px', borderRadius: '7px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
              border: activeTab === tab.id ? `1px solid ${accentColor}` : '1px solid var(--border-color)',
              backgroundColor: activeTab === tab.id ? `${accentColor}15` : '#FFFFFF',
              color: activeTab === tab.id ? accentColor : 'var(--text-muted)',
              transition: 'all 0.12s ease',
            }}>{tab.label}</button>
          ))}
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 300px', gap: 0 }}>

        {/* ── LEFT: Dynamic Track Fields ── */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', borderRight: '1px solid var(--border-color)' }}>
          {activeTab === 'track' ? (
            <>
              {/* Accent stripe */}
              <div style={{
                padding: '12px 16px', borderRadius: '10px', marginBottom: '16px',
                background: `linear-gradient(135deg, ${accentColor}18, ${accentColor}08)`,
                border: `1px solid ${accentColor}30`,
                display: 'flex', alignItems: 'center', gap: '10px'
              }}>
                <span style={{ fontSize: '22px' }}>{trackMeta.icon}</span>
                <div>
                  <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: accentColor }}>{trackMeta.label} Configuration</p>
                  <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                    Fill in the details below. The AI will use this to generate highly relevant, personalised questions.
                  </p>
                </div>
              </div>

              <TrackFields trackId={trackId} config={config} set={set} accentColor={accentColor} />
            </>
          ) : (
            /* ── Style Tab ── */
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Difficulty */}
              <div className="saas-card-spec" style={{ padding: '16px 18px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 10px 0' }}>Difficulty Level</p>
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap' }}>
                  {DIFFICULTIES.map(d => (
                    <button key={d} onClick={() => set('difficulty', d)} style={activeBtn((config.difficulty || 'Adaptive AI') === d)}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Interviewer Personality */}
              <div className="saas-card-spec" style={{ padding: '16px 18px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 10px 0' }}>Interviewer Personality</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {PERSONALITIES.map(p => {
                    const active = (config.personality || 'professional') === p.id;
                    return (
                      <div key={p.id} onClick={() => set('personality', p.id)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
                        border: active ? `1px solid ${accentColor}` : '1px solid var(--border-color)',
                        backgroundColor: active ? accentColor : '#FAFAFA',
                        transition: 'all 0.12s ease'
                      }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: active ? '#FFFFFF' : 'var(--text-main)' }}>{p.label}</span>
                          <span style={{ fontSize: '12px', color: active ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', marginLeft: '8px' }}>{p.desc}</span>
                        </div>
                        {active && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#FFFFFF', flexShrink: 0 }}></div>}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Duration */}
              <div className="saas-card-spec" style={{ padding: '16px 18px' }}>
                <p style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 10px 0' }}>Session Duration</p>
                <div style={{ display: 'flex', gap: '7px' }}>
                  {DURATIONS.map(d => (
                    <button key={d} onClick={() => set('duration', d)} style={{ ...activeBtn((config.duration || '30') === d), flex: 1 }}>
                      {d}m
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── RIGHT: Quick Settings + Actions ── */}
        <div style={{ padding: '20px 18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#FFFFFF' }}>

          {/* Mode & Language */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Session Settings</p>
            <Field label="Mode">
              <select style={selectStyle} value={config.mode || 'voice'} onChange={e => set('mode', e.target.value)}>
                <option value="voice">Voice + Video</option>
                <option value="text">Text Only</option>
              </select>
            </Field>
            <Field label="Language">
              <select style={selectStyle} value={config.language || 'English'} onChange={e => set('language', e.target.value)}>
                {LANGUAGES.map(l => <option key={l}>{l}</option>)}
              </select>
            </Field>
          </div>

          <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }}></div>

          {/* Feature Toggles */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 8px 0' }}>
              Features
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { key: 'enableVideo', label: 'Camera' },
                { key: 'enableMic',   label: 'Microphone' },
                { key: 'enableHints', label: 'AI Hints' },
              ].map(item => {
                const active = config[item.key] !== false;
                return (
                  <div key={item.key} onClick={() => set(item.key, !active)} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 10px', borderRadius: '7px', cursor: 'pointer',
                    border: '1px solid var(--border-color)', backgroundColor: '#FAFAFA',
                    transition: 'background-color 0.12s ease'
                  }}>
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-body)' }}>{item.label}</span>
                    <div style={{
                      width: '34px', height: '18px', borderRadius: '9px',
                      backgroundColor: active ? accentColor : '#D1D5DB',
                      position: 'relative', transition: 'background-color 0.15s ease'
                    }}>
                      <div style={{
                        position: 'absolute', top: '2px',
                        left: active ? '16px' : '2px',
                        width: '14px', height: '14px', borderRadius: '50%',
                        backgroundColor: '#FFFFFF', transition: 'left 0.15s ease',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                      }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Config Summary */}
          <div style={{ background: `${accentColor}08`, border: `1px solid ${accentColor}25`, borderRadius: '10px', padding: '12px 14px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 700, color: accentColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {trackMeta.icon} {trackMeta.label}
            </p>
            {[
              { label: 'Difficulty', value: config.difficulty || 'Adaptive AI' },
              { label: 'Duration', value: `${config.duration || 30} min` },
              { label: 'Personality', value: PERSONALITIES.find(p => p.id === (config.personality || 'professional'))?.label || 'Professional' },
              config.role && { label: 'Role', value: config.role },
              config.company && { label: 'Company', value: config.company },
              config.experience && { label: 'Experience', value: config.experience },
            ].filter(Boolean).map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }}></div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button onClick={startDeviceCheck} style={{
              width: '100%', padding: '12px', backgroundColor: accentColor, color: '#FFFFFF',
              border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', transition: 'opacity 0.15s ease',
            }}
              onMouseEnter={e => e.target.style.opacity = '0.88'}
              onMouseLeave={e => e.target.style.opacity = '1'}
            >
              Continue to Device Check →
            </button>
            <button onClick={() => setPipelineState('selection')} style={{
              width: '100%', padding: '10px', backgroundColor: 'transparent', color: 'var(--text-muted)',
              border: '1px solid var(--border-color)', borderRadius: '8px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            }}>
              Back to Selection
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
