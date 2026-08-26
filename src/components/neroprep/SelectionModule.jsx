import React, { useState } from 'react';
import useInterviewStore from '../../store/interviewStore';

const CATEGORIES = [
  {
    id: 'hr', name: 'HR Interview',
    desc: 'Personality, communication and cultural fit evaluation.',
    tags: ['Confidence', 'Communication', 'STAR']
  },
  {
    id: 'tech', name: 'Technical Interview',
    desc: 'Core CS subjects, OOP, DBMS, OS, Networks and more.',
    tags: ['Java', 'Python', 'DBMS', 'OS']
  },
  {
    id: 'dsa', name: 'DSA & Coding Interview',
    desc: 'Data structures, algorithms, complexity analysis, live coding, and AI code review.',
    tags: ['DSA', 'Live Coding', 'Test Cases', 'Complexity']
  },
  {
    id: 'system_design', name: 'System Design & Architecture (HLD & LLD)',
    desc: 'Scalable distributed systems architecture, low-level design, SOLID principles, and design patterns.',
    tags: ['Scalability', 'HLD', 'LLD', 'SOLID']
  },
  {
    id: 'behavioral', name: 'Behavioral & Managerial Interview',
    desc: 'STAR method based evaluation of professional behaviour, leadership, team management, delegation, and stakeholder handling.',
    tags: ['STAR', 'Leadership', 'Delegation', 'Conflict']
  },
  {
    id: 'gd', name: 'Group Discussion',
    desc: 'AI-driven group discussion with moderated rounds.',
    tags: ['Speaking', 'Leadership', 'Debate']
  },

  {
    id: 'communication', name: 'Communication Interview',
    desc: 'Fluency, grammar, pronunciation and speaking speed analysis.',
    tags: ['Fluency', 'Grammar', 'Vocabulary']
  },
  {
    id: 'ai_ml', name: 'AI / ML Interview',
    desc: 'Transformers, LLMs, RAG, fine-tuning and vector databases.',
    tags: ['LLM', 'CNN', 'RAG', 'RL']
  },
  {
    id: 'devops', name: 'DevOps Interview',
    desc: 'Docker, Kubernetes, CI/CD, Jenkins and monitoring.',
    tags: ['Docker', 'K8s', 'CI/CD']
  },
  {
    id: 'cloud', name: 'Cloud Interview',
    desc: 'AWS, Azure, GCP, serverless, IAM and cloud networking.',
    tags: ['AWS', 'Azure', 'GCP']
  },
  {
    id: 'cybersec', name: 'Cybersecurity Interview',
    desc: 'OWASP, encryption, firewalls and incident response.',
    tags: ['OWASP', 'Encryption', 'SOC']
  },
  {
    id: 'qa', name: 'QA / Testing Interview',
    desc: 'Manual and automation testing, Selenium, Cypress and API testing.',
    tags: ['Selenium', 'Cypress', 'Postman']
  }
];

const DOMAINS = ['Frontend', 'Backend', 'Full Stack', 'DevOps', 'AI/ML', 'Cloud', 'Cybersecurity', 'QA', 'Mobile'];
const COMPANIES = ['TCS', 'Infosys', 'Wipro', 'Amazon', 'Google', 'Microsoft', 'Meta', 'Apple', 'Zoho'];

export default function SelectionModule({ setActiveTab }) {
  const setConfig = useInterviewStore((state) => state.setConfig);
  const setPipelineState = useInterviewStore((state) => state.setPipelineState);
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = CATEGORIES.filter(c =>
    (selectedDomain === 'All' || c.tags.some(t => t.toLowerCase().includes(selectedDomain.toLowerCase()))) &&
    (c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.desc.toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (cat) => {
    setConfig({ trackId: cat.id, trackName: cat.name });
    setPipelineState('config');
  };

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh', fontFamily: 'var(--font-inter)' }}>

      {/* Page Header */}
      <div style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)', padding: '28px 32px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <span className="pill-tag" style={{ marginBottom: '10px', display: 'inline-block' }}>Adaptive Mock Interview</span>
            <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'var(--text-main)', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
              Select Your Interview Track
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '15px', margin: 0 }}>
              Choose from 12 industry-grade interview tracks. Each session is powered by adaptive AI.
            </p>
          </div>

          <button
            onClick={() => setActiveTab && setActiveTab('dashboard')}
            className="btn-secondary-spec"
            style={{ padding: '9px 18px', fontSize: '0.88rem', fontWeight: 600 }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px' }}>

        {/* Search & Domain Filter Bar */}
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '32px' }}>
          <div style={{ flex: '1 1 300px' }}>
            <input
              className="saas-search-input"
              type="text"
              placeholder="Search interview track by name or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', margin: 0 }}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '14px', color: 'var(--text-body)', backgroundColor: '#FFFFFF', outline: 'none', fontWeight: 600, cursor: 'pointer' }}
            >
              <option value="All">All Focus Areas</option>
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        {/* Section Title */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 4px 0' }}>
            Interview Categories
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
            {filtered.length} tracks available
          </p>
        </div>

        {/* Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {filtered.map(cat => (
            <div
              key={cat.id}
              className="saas-card-spec card-hover-effect"
              style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '12px' }}
              onClick={() => handleSelect(cat)}
            >
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', margin: '0 0 6px 0' }}>
                  {cat.name}
                </h3>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                  {cat.desc}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: 'auto' }}>
                {cat.tags.map(tag => (
                  <span key={tag} className="pill-tag" style={{ fontSize: '12px', padding: '3px 10px' }}>
                    {tag}
                  </span>
                ))}
              </div>
              <div style={{ paddingTop: '12px', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Adaptive AI powered</span>
                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>Configure</span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
