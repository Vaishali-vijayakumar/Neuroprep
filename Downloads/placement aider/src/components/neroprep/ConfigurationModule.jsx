import React from 'react';
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
const CODING_LANGS = ['JavaScript', 'Python', 'Java', 'C++', 'Go'];

// Compact label + field group
const Field = ({ label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
    <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
      {label}
    </label>
    {children}
  </div>
);

// Compact select style
const selectStyle = {
  padding: '8px 10px',
  fontSize: '13px',
  borderRadius: '7px',
  border: '1px solid var(--border-color)',
  backgroundColor: '#FFFFFF',
  color: 'var(--text-main)',
  outline: 'none',
  width: '100%',
};

export default function ConfigurationModule() {
  const config          = useInterviewStore((s) => s.config) || {};
  const setConfig       = useInterviewStore((s) => s.setConfig);
  const startDeviceCheck = useInterviewStore((s) => s.startDeviceCheck);
  const setPipelineState = useInterviewStore((s) => s.setPipelineState);

  const set = (key, val) => setConfig({ [key]: val });
  const isCoding = ['coding', 'dsa'].includes(config.trackId);

  const activeBtn = (isActive) => ({
    padding: '6px 12px',
    borderRadius: '6px',
    border: isActive ? '1px solid #111827' : '1px solid var(--border-color)',
    backgroundColor: isActive ? '#111827' : '#FFFFFF',
    color: isActive ? '#FFFFFF' : 'var(--text-body)',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 0.12s ease',
    whiteSpace: 'nowrap',
  });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      backgroundColor: 'var(--bg-page)', fontFamily: 'var(--font-inter)', overflow: 'hidden'
    }}>

      {/* ── Compact Header bar ── */}
      <div style={{
        backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border-color)',
        padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0
      }}>
        <button
          onClick={() => setPipelineState('selection')}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '13px', cursor: 'pointer', fontWeight: 500, padding: 0 }}
        >
          Back
        </button>
        <span style={{ width: '1px', height: '16px', backgroundColor: 'var(--border-color)' }}></span>
        <span className="pill-tag" style={{ fontSize: '12px' }}>Configure Session</span>
        <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
          {config.trackName || 'Custom Interview Builder'}
        </span>
      </div>

      {/* ── Two-column body that fills the viewport ── */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 0 }}>

        {/* ── LEFT column: main config ── */}
        <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px', borderRight: '1px solid var(--border-color)' }}>

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
                  <div
                    key={p.id}
                    onClick={() => set('personality', p.id)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '9px 12px', borderRadius: '8px', cursor: 'pointer',
                      border: active ? '1px solid #111827' : '1px solid var(--border-color)',
                      backgroundColor: active ? '#111827' : '#FAFAFA',
                      transition: 'all 0.12s ease'
                    }}
                  >
                    <div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: active ? '#FFFFFF' : 'var(--text-main)' }}>{p.label}</span>
                      <span style={{ fontSize: '12px', color: active ? '#9CA3AF' : 'var(--text-muted)', marginLeft: '8px' }}>{p.desc}</span>
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

        {/* ── RIGHT column: quick settings + actions ── */}
        <div style={{ padding: '20px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', backgroundColor: '#FFFFFF' }}>

          {/* Session Dropdowns */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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
            <Field label="Target Role">
              <input
                type="text"
                style={{ ...selectStyle }}
                placeholder="e.g. Frontend Engineer"
                value={config.role || ''}
                onChange={e => set('role', e.target.value)}
              />
            </Field>
            {isCoding && (
              <Field label="Coding Language">
                <select style={selectStyle} value={config.codingLang || 'JavaScript'} onChange={e => set('codingLang', e.target.value)}>
                  {CODING_LANGS.map(l => <option key={l}>{l}</option>)}
                </select>
              </Field>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', backgroundColor: 'var(--border-color)' }}></div>

          {/* Features */}
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
                  <div
                    key={item.key}
                    onClick={() => set(item.key, !active)}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '8px 10px', borderRadius: '7px', cursor: 'pointer',
                      border: '1px solid var(--border-color)', backgroundColor: '#FAFAFA',
                      transition: 'background-color 0.12s ease'
                    }}
                  >
                    <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-body)' }}>{item.label}</span>
                    <div style={{
                      width: '34px', height: '18px', borderRadius: '9px',
                      backgroundColor: active ? '#111827' : '#D1D5DB',
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

          {/* Spacer */}
          <div style={{ flex: 1 }}></div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              onClick={startDeviceCheck}
              style={{
                width: '100%', padding: '12px', backgroundColor: '#111827', color: '#FFFFFF',
                border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700,
                cursor: 'pointer', transition: 'background-color 0.15s ease'
              }}
            >
              Continue to Device Check
            </button>
            <button
              className="btn-primary-spec"
              onClick={() => setPipelineState('selection')}
              style={{ width: '100%', justifyContent: 'center', padding: '10px', fontSize: '13px' }}
            >
              Back to Selection
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
