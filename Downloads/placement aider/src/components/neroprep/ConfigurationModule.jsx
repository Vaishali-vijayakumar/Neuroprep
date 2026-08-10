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
const DSA_TOPICS    = ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching', 'Stacks & Queues', 'Heaps', 'Tries', 'Bit Manipulation'];
const TECH_SUBJECTS = ['OOP', 'DBMS', 'Operating Systems', 'Computer Networks', 'System Software', 'Data Structures', 'Compiler Design'];
const AIML_TOPICS   = ['Machine Learning', 'Deep Learning', 'CNN', 'RNN/LSTM', 'Transformers', 'LLMs', 'RAG', 'Fine-tuning', 'Vector Databases', 'MLOps', 'Reinforcement Learning'];
const DEVOPS_TOOLS  = ['Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'Terraform', 'Ansible', 'Prometheus', 'Grafana', 'AWS', 'GCP', 'Azure'];
const SECURITY_DOMAINS = ['OWASP', 'Encryption', 'Authentication & OAuth', 'Network Security', 'Firewalls', 'SOC Analysis', 'Incident Response', 'Penetration Testing', 'Cloud Security'];
const QA_TOOLS      = ['Selenium', 'Cypress', 'Playwright', 'Postman', 'JUnit', 'TestNG', 'Jest', 'Pytest', 'API Testing', 'Performance Testing'];
const GD_PARTICIPANTS = ['3', '4', '5', '6'];
const APTITUDE_TOPICS = ['Percentages', 'Profit & Loss', 'Time & Work', 'Speed & Distance', 'Probability', 'Number System', 'Logical Reasoning', 'Verbal Reasoning', 'Data Interpretation'];

// ── Track-specific configuration schema ──────────────────────────────────────
const TRACK_FIELDS = {
  hr:                { label: 'HR Interview',         fields: ['role', 'company', 'experience', 'resume', 'jobDescription', 'careerGoals'] },
  tech:              { label: 'Technical',             fields: ['role', 'company', 'experience', 'codingLang', 'techSubjects', 'jobDescription'] },
  dsa:               { label: 'DSA',                   fields: ['codingLang', 'dsaTopics', 'company', 'experience', 'questionCount'] },
  coding:            { label: 'Coding',                fields: ['codingLang', 'dsaTopics', 'company', 'role', 'questionCount'] },
  system_design:     { label: 'System Design',         fields: ['role', 'experience', 'systemToDesign', 'expectedScale', 'preferredTech'] },
  lld:               { label: 'Low-Level Design',      fields: ['codingLang', 'role', 'systemToDesign', 'experience'] },
  behavioral:        { label: 'Behavioral',            fields: ['role', 'company', 'experience', 'resume', 'achievements'] },
  managerial:        { label: 'Managerial',            fields: ['role', 'company', 'experience', 'teamSize', 'jobDescription'] },
  group_discussion:  { label: 'Group Discussion',      fields: ['gdTopic', 'industry', 'gdParticipants'] },
  resume:            { label: 'Resume Interview',      fields: ['resume', 'role', 'company', 'jobDescription'] },
  project:           { label: 'Project Viva',          fields: ['projectName', 'githubUrl', 'techStack', 'userRole', 'deploymentInfo'] },
  company:           { label: 'Company Specific',      fields: ['company', 'role', 'experience', 'resume', 'jobDescription'] },
  aptitude:          { label: 'Aptitude',              fields: ['aptitudeTopics', 'company', 'questionCount'] },
  communication:     { label: 'Communication',         fields: ['role', 'experience', 'gdTopic'] },
  stress:            { label: 'Stress Interview',      fields: ['role', 'experience', 'techSubjects'] },
  rapid_fire:        { label: 'Rapid Fire',            fields: ['techSubjects', 'questionCount', 'codingLang'] },
  ai_ml:             { label: 'AI / ML',               fields: ['aimlTopics', 'role', 'experience', 'resume'] },
  devops:            { label: 'DevOps',                fields: ['devopsTools', 'role', 'experience', 'cloudProvider'] },
  cloud:             { label: 'Cloud',                 fields: ['cloudProvider', 'cloudServices', 'role', 'experience'] },
  cybersecurity:     { label: 'Cybersecurity',         fields: ['securityDomains', 'role', 'experience'] },
  qa:                { label: 'QA / Testing',          fields: ['qaTools', 'role', 'experience', 'codingLang'] },
  product_management:{ label: 'Product Management',   fields: ['role', 'company', 'experience', 'industry', 'productIdea'] },
  assessment_center: { label: 'Assessment Center',    fields: ['company', 'role', 'experience', 'resume', 'jobDescription'] },
  custom:            { label: 'Custom Builder',        fields: ['role', 'company', 'techSubjects', 'codingLang', 'experience', 'jobDescription', 'questionCount'] },
};

// ── Design tokens — pure black / white / grey ────────────────────────────────
const BLACK  = '#111111';
const GREY   = '#6B7280';
const BORDER = '#E5E7EB';
const BG     = '#F9FAFB';

const inputStyle = {
  padding: '8px 10px', fontSize: '13px', borderRadius: '6px',
  border: `1px solid ${BORDER}`, backgroundColor: '#FFFFFF',
  color: BLACK, outline: 'none', width: '100%',
  fontFamily: 'var(--font-inter)',
};
const textareaStyle = { ...inputStyle, resize: 'vertical', minHeight: '82px' };
const selectStyle   = { ...inputStyle };

// ── Field label wrapper ───────────────────────────────────────────────────────
const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
    <label style={{ fontSize: '11px', fontWeight: 700, color: GREY, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
      {label}
    </label>
    {children}
  </div>
);

// ── Multi-select chip row ─────────────────────────────────────────────────────
const MultiSelect = ({ options, selected, onChange }) => {
  const sel = selected || [];
  const toggle = (opt) =>
    sel.includes(opt) ? onChange(sel.filter(o => o !== opt)) : onChange([...sel, opt]);
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
      {options.map(opt => {
        const active = sel.includes(opt);
        return (
          <button key={opt} onClick={() => toggle(opt)} style={{
            padding: '4px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
            border: `1px solid ${active ? BLACK : BORDER}`,
            backgroundColor: active ? BLACK : '#FFFFFF',
            color: active ? '#FFFFFF' : BLACK,
            transition: 'all 0.1s ease',
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
    padding: '8px 10px', borderRadius: '6px', cursor: 'pointer',
    border: `1px solid ${BORDER}`, backgroundColor: '#FFFFFF',
  }}>
    <span style={{ fontSize: '13px', fontWeight: 500, color: BLACK }}>{label}</span>
    <div style={{
      width: '34px', height: '18px', borderRadius: '9px',
      backgroundColor: active ? BLACK : '#D1D5DB',
      position: 'relative', transition: 'background-color 0.15s ease', flexShrink: 0,
    }}>
      <div style={{
        position: 'absolute', top: '2px', left: active ? '16px' : '2px',
        width: '14px', height: '14px', borderRadius: '50%',
        backgroundColor: '#FFFFFF', transition: 'left 0.15s ease',
        boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
      }} />
    </div>
  </div>
);

// ── Pill button (single-select row) ──────────────────────────────────────────
const PillRow = ({ options, value, onChange, suffix = '' }) => (
  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
    {options.map(opt => {
      const active = value === opt;
      return (
        <button key={opt} onClick={() => onChange(opt)} style={{
          padding: '5px 13px', borderRadius: '4px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
          border: `1px solid ${active ? BLACK : BORDER}`,
          backgroundColor: active ? BLACK : '#FFFFFF',
          color: active ? '#FFFFFF' : BLACK,
          transition: 'all 0.1s ease',
        }}>
          {opt}{suffix}
        </button>
      );
    })}
  </div>
);

// ── Dynamic track field renderer ─────────────────────────────────────────────
function TrackFields({ trackId, config, set }) {
  const fieldNames = (TRACK_FIELDS[trackId] || TRACK_FIELDS['custom']).fields;

  const RENDERERS = {
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
      <Field label="Resume / Profile Summary">
        <textarea style={textareaStyle} placeholder="Paste your resume text or a brief summary..."
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
        <MultiSelect options={TECH_SUBJECTS} selected={config.techSubjects} onChange={v => set('techSubjects', v)} />
      </Field>
    ),
    dsaTopics: (
      <Field label="DSA Topics">
        <MultiSelect options={DSA_TOPICS} selected={config.dsaTopics} onChange={v => set('dsaTopics', v)} />
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
    padding: '6px 14px', borderRadius: '5px', fontSize: '12px', fontWeight: 600, cursor: 'pointer',
    border: `1px solid ${activeTab === id ? BLACK : BORDER}`,
    backgroundColor: activeTab === id ? BLACK : '#FFFFFF',
    color: activeTab === id ? '#FFFFFF' : GREY,
    transition: 'all 0.1s ease',
  });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      backgroundColor: '#FFFFFF', fontFamily: 'var(--font-inter)', overflow: 'hidden',
    }}>

      {/* ── Header ── */}
      <div style={{
        backgroundColor: '#FFFFFF', borderBottom: `1px solid ${BORDER}`,
        padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '14px', flexShrink: 0,
      }}>
        <button onClick={() => setPipelineState('selection')} style={{
          background: 'none', border: 'none', color: GREY, fontSize: '13px', cursor: 'pointer', fontWeight: 500, padding: 0,
        }}>
          Back
        </button>
        <span style={{ width: '1px', height: '16px', backgroundColor: BORDER }} />
        <span style={{
          padding: '2px 10px', borderRadius: '4px', fontSize: '12px', fontWeight: 600,
          backgroundColor: '#F3F4F6', color: BLACK, border: `1px solid ${BORDER}`,
        }}>
          {trackMeta.label}
        </span>
        <span style={{ fontSize: '15px', fontWeight: 700, color: BLACK }}>Configure Session</span>

        {/* Tabs */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '6px' }}>
          <button style={tabStyle('track')} onClick={() => setActiveTab('track')}>Track Settings</button>
          <button style={tabStyle('style')} onClick={() => setActiveTab('style')}>Interview Style</button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 290px' }}>

        {/* ── LEFT: Dynamic form ── */}
        <div style={{ padding: '22px 26px', overflowY: 'auto', borderRight: `1px solid ${BORDER}` }}>

          {activeTab === 'track' ? (
            <>
              {/* Track header strip */}
              <div style={{
                padding: '10px 14px', borderRadius: '6px', marginBottom: '18px',
                backgroundColor: BG, border: `1px solid ${BORDER}`,
              }}>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: BLACK }}>{trackMeta.label}</p>
                <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: GREY }}>
                  Fill in the details below. The AI will use this to generate relevant, personalised questions.
                </p>
              </div>
              <TrackFields trackId={trackId} config={config} set={set} />
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

              {/* Difficulty */}
              <div style={{ padding: '16px 18px', border: `1px solid ${BORDER}`, borderRadius: '8px', backgroundColor: '#FFFFFF' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: BLACK, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Difficulty Level
                </p>
                <PillRow options={DIFFICULTIES} value={config.difficulty || 'Adaptive AI'} onChange={v => set('difficulty', v)} />
              </div>

              {/* Personality */}
              <div style={{ padding: '16px 18px', border: `1px solid ${BORDER}`, borderRadius: '8px', backgroundColor: '#FFFFFF' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: BLACK, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Interviewer Personality
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {PERSONALITIES.map(p => {
                    const active = (config.personality || 'professional') === p.id;
                    return (
                      <div key={p.id} onClick={() => set('personality', p.id)} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '9px 12px', borderRadius: '6px', cursor: 'pointer',
                        border: `1px solid ${active ? BLACK : BORDER}`,
                        backgroundColor: active ? BLACK : '#FAFAFA',
                        transition: 'all 0.1s ease',
                      }}>
                        <div>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: active ? '#FFFFFF' : BLACK }}>{p.label}</span>
                          <span style={{ fontSize: '12px', color: active ? '#9CA3AF' : GREY, marginLeft: '8px' }}>{p.desc}</span>
                        </div>
                        {active && <div style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#FFFFFF', flexShrink: 0 }} />}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Duration */}
              <div style={{ padding: '16px 18px', border: `1px solid ${BORDER}`, borderRadius: '8px', backgroundColor: '#FFFFFF' }}>
                <p style={{ fontSize: '12px', fontWeight: 700, color: BLACK, margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Session Duration
                </p>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {DURATIONS.map(d => {
                    const active = (config.duration || '30') === d;
                    return (
                      <button key={d} onClick={() => set('duration', d)} style={{
                        flex: 1, padding: '7px 0', borderRadius: '5px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
                        border: `1px solid ${active ? BLACK : BORDER}`,
                        backgroundColor: active ? BLACK : '#FFFFFF',
                        color: active ? '#FFFFFF' : BLACK,
                        transition: 'all 0.1s ease',
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
        <div style={{ padding: '20px 18px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: BG, borderLeft: `1px solid ${BORDER}` }}>

          {/* Mode & Language */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <p style={{ margin: 0, fontSize: '11px', fontWeight: 700, color: GREY, textTransform: 'uppercase', letterSpacing: '0.6px' }}>Session</p>
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

          <div style={{ height: '1px', backgroundColor: BORDER }} />

          {/* Feature toggles */}
          <div>
            <p style={{ fontSize: '11px', fontWeight: 700, color: GREY, textTransform: 'uppercase', letterSpacing: '0.6px', margin: '0 0 8px 0' }}>
              Features
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[
                { key: 'enableVideo', label: 'Camera' },
                { key: 'enableMic',   label: 'Microphone' },
                { key: 'enableHints', label: 'AI Hints' },
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
          <div style={{ backgroundColor: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: '7px', padding: '12px 14px' }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '11px', fontWeight: 700, color: BLACK, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Summary
            </p>
            {[
              { label: 'Track',       value: trackMeta.label },
              { label: 'Difficulty',  value: config.difficulty || 'Adaptive AI' },
              { label: 'Duration',    value: `${config.duration || 30} min` },
              { label: 'Personality', value: PERSONALITIES.find(p => p.id === (config.personality || 'professional'))?.label || 'Professional' },
              config.role    && { label: 'Role',    value: config.role },
              config.company && { label: 'Company', value: config.company },
            ].filter(Boolean).map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: GREY }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: 600, color: BLACK, maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {/* Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={startDeviceCheck}
              style={{
                width: '100%', padding: '12px', backgroundColor: BLACK, color: '#FFFFFF',
                border: 'none', borderRadius: '6px', fontSize: '14px', fontWeight: 700, cursor: 'pointer',
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
                width: '100%', padding: '10px', backgroundColor: '#FFFFFF', color: GREY,
                border: `1px solid ${BORDER}`, borderRadius: '6px', fontSize: '13px', fontWeight: 500, cursor: 'pointer',
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
