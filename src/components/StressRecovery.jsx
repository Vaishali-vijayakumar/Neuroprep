import React, { useState, useEffect, useRef } from 'react';

const EXERCISES = [
  { id: 'box', title: 'Box Breathing', desc: '4-4-4-4 technique to calm your nervous system instantly', icon: '🌬️', color: '#111827', phases: ['Inhale', 'Hold', 'Exhale', 'Hold'], duration: 4 },
  { id: 'grounding', title: '5-4-3-2-1 Grounding', desc: 'Mindfulness anchoring exercise to reduce anxiety', icon: '🌿', color: '#111827' },
  { id: 'pmr', title: 'Progressive Muscle Relaxation', desc: 'Tense and release muscle groups to remove physical tension', icon: '💪', color: '#111827' },
  { id: 'affirmations', title: 'Placement Affirmations', desc: 'Positive self-statements to rebuild confidence', icon: '⭐', color: '#111827' },
];

const GROUNDING_STEPS = [
  { count: 5, sense: 'See', prompt: 'Name 5 things you can see right now around you.' },
  { count: 4, sense: 'Touch', prompt: 'Name 4 things you can physically touch or feel.' },
  { count: 3, sense: 'Hear', prompt: 'Name 3 sounds you can hear in this moment.' },
  { count: 2, sense: 'Smell', prompt: 'Name 2 things you can smell (or like to smell).' },
  { count: 1, sense: 'Taste', prompt: 'Name 1 thing you can taste right now.' },
];

const AFFIRMATIONS = [
  'I am capable of learning and growing through every challenge.',
  'My effort today is building my success for tomorrow.',
  'I have overcome difficult problems before, and I will do so again.',
  'I belong in this placement drive. My skills have real value.',
  'It is okay to not know everything. Learning is the process.',
  'My journey is unique, and I am exactly where I need to be.',
  'One rejection does not define my technical abilities or worth.',
  'I am resilient, adaptable, and ready for this challenge.',
  'Every coding problem I solve makes me a stronger engineer.',
  'I am allowed to take breaks and return stronger.',
];

const PMR_STEPS = [
  'Clench your fists tightly for 5 seconds, then release. Feel the tension melt.',
  'Scrunch your forehead up for 5 seconds, then relax. Let your brow smooth out.',
  'Tighten your shoulders up to your ears for 5 seconds, then drop them slowly.',
  'Tense your stomach muscles for 5 seconds, then release completely.',
  'Press your feet flat into the floor for 5 seconds, then relax.',
  '✅ Full body scan: Take 3 deep breaths and notice how relaxed you feel now.',
];

export default function StressRecovery({ setActiveTab }) {
  const [activeEx, setActiveEx] = useState(null);
  const [boxPhase, setBoxPhase] = useState(0);
  const [boxCount, setBoxCount] = useState(4);
  const [boxRunning, setBoxRunning] = useState(false);
  const [groundStep, setGroundStep] = useState(0);
  const [pmrStep, setPmrStep] = useState(0);
  const [affIndex, setAffIndex] = useState(0);
  const intervalRef = useRef(null);

  const startBox = () => {
    setBoxRunning(true);
    setBoxPhase(0);
    setBoxCount(4);
  };

  useEffect(() => {
    if (!boxRunning) return;
    intervalRef.current = setInterval(() => {
      setBoxCount(c => {
        if (c <= 1) {
          setBoxPhase(p => (p + 1) % 4);
          return 4;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [boxRunning]);

  const stopBox = () => { setBoxRunning(false); clearInterval(intervalRef.current); setBoxCount(4); setBoxPhase(0); };

  const PHASE_COLOR = ['#111827', '#111827', '#111827', '#111827'];
  const PHASE_DESC = ['Breathe in slowly through your nose...', 'Hold your breath gently...', 'Breathe out slowly through your mouth...', 'Hold before the next breath...'];

  return (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontWeight: 900, fontSize: '1.6rem', color: '#111827', letterSpacing: '-0.5px' }}>Stress Recovery Hub</h1>
          <p style={{ color: '#6B7280', fontSize: '0.85rem', marginTop: 4 }}>Evidence-based techniques to calm your mind and restore focus during placement season.</p>
        </div>
        <button 
          onClick={() => setActiveTab && setActiveTab('dashboard')} 
          style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #E5E7EB', background: '#fff', color: '#374151', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}
        >
          Back to Dashboard
        </button>
      </div>

      {!activeEx && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {EXERCISES.map(ex => (
            <div key={ex.id} onClick={() => setActiveEx(ex.id)} style={{
              background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 26, cursor: 'pointer',
              transition: 'all 0.2s'
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = ex.color; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.transform = ''; }}
            >
              <div style={{ fontSize: '2rem', marginBottom: 14 }}>{ex.icon}</div>
              <h3 style={{ fontWeight: 800, fontSize: '1rem', color: '#111827', marginBottom: 6 }}>{ex.title}</h3>
              <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.6 }}>{ex.desc}</p>
              <div style={{ marginTop: 16, fontSize: '0.75rem', fontWeight: 700, color: ex.color }}>Start Exercise</div>
            </div>
          ))}
        </div>
      )}

      {activeEx && (
        <div>
          <button onClick={() => { setActiveEx(null); stopBox(); setGroundStep(0); setPmrStep(0); }} style={{
            background: 'none', border: 'none', cursor: 'pointer', color: '#6B7280', fontWeight: 600, fontSize: '0.85rem', marginBottom: 20
          }}>Back to Exercises</button>

          {/* Box Breathing */}
          {activeEx === 'box' && (
            <div style={{ maxWidth: 500, margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontWeight: 800, color: '#111827', marginBottom: 8 }}>🌬️ Box Breathing</h2>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: 32 }}>Breathe in, hold, breathe out, hold — each for 4 seconds.</p>

              <div style={{
                width: 200, height: 200, borderRadius: '50%', margin: '0 auto 32px',
                background: PHASE_COLOR[boxPhase] + '20',
                border: `4px solid ${PHASE_COLOR[boxPhase]}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.5s ease'
              }}>
                <div style={{ fontSize: '3rem', fontWeight: 900, color: PHASE_COLOR[boxPhase] }}>{boxCount}</div>
                <div style={{ fontWeight: 700, color: PHASE_COLOR[boxPhase], fontSize: '0.9rem' }}>
                  {boxRunning ? ['Inhale', 'Hold', 'Exhale', 'Hold'][boxPhase] : 'Ready'}
                </div>
              </div>

              <p style={{ color: '#6B7280', fontSize: '0.88rem', marginBottom: 24 }}>
                {boxRunning ? PHASE_DESC[boxPhase] : 'Press Start to begin the breathing cycle.'}
              </p>

              {!boxRunning ? (
                <button onClick={startBox} style={{
                  padding: '13px 36px', borderRadius: 12, border: 'none',
                  background: '#475569', color: '#fff', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem'
                }}>Start Breathing</button>
              ) : (
                <button onClick={stopBox} style={{
                  padding: '13px 36px', borderRadius: 12, border: '1px solid #E5E7EB',
                  background: '#fff', color: '#374151', cursor: 'pointer', fontWeight: 700, fontSize: '0.95rem'
                }}>Stop</button>
              )}
            </div>
          )}

          {/* 5-4-3-2-1 Grounding */}
          {activeEx === 'grounding' && (
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <h2 style={{ fontWeight: 800, color: '#111827', marginBottom: 8 }}>🌿 5-4-3-2-1 Grounding</h2>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: 24 }}>Anchor yourself to the present moment using your 5 senses.</p>

              <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {GROUNDING_STEPS.map((s, i) => (
                  <div key={i} style={{
                    flex: 1, height: 6, borderRadius: 3,
                    background: i <= groundStep ? '#111827' : '#E5E7EB', transition: 'all 0.3s'
                  }} />
                ))}
              </div>

              {groundStep < GROUNDING_STEPS.length ? (
                <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#111827', marginBottom: 8 }}>{GROUNDING_STEPS[groundStep].count}</div>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#111827', marginBottom: 12 }}>Things You Can {GROUNDING_STEPS[groundStep].sense}</div>
                  <p style={{ color: '#6B7280', fontSize: '0.88rem', marginBottom: 28 }}>{GROUNDING_STEPS[groundStep].prompt}</p>
                  <button onClick={() => setGroundStep(s => Math.min(s + 1, GROUNDING_STEPS.length))} style={{
                    padding: '12px 30px', borderRadius: 10, border: 'none',
                    background: '#475569', color: '#fff', cursor: 'pointer', fontWeight: 700
                  }}>Next</button>
                </div>
              ) : (
                <div style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 16, padding: 32, textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: 12 }}>✅</div>
                  <h3 style={{ color: '#111827', fontWeight: 800, marginBottom: 8 }}>Grounding Complete!</h3>
                  <p style={{ color: '#111827', fontSize: '0.88rem' }}>You are present, calm, and anchored. Return to your preparation with a clear mind.</p>
                  <button onClick={() => setGroundStep(0)} style={{ marginTop: 20, padding: '10px 24px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', color: '#111827', cursor: 'pointer', fontWeight: 700 }}>Repeat</button>
                </div>
              )}
            </div>
          )}

          {/* PMR */}
          {activeEx === 'pmr' && (
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <h2 style={{ fontWeight: 800, color: '#111827', marginBottom: 8 }}>💪 Progressive Muscle Relaxation</h2>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: 24 }}>Step {pmrStep + 1} of {PMR_STEPS.length}</p>
              <div style={{ background: '#fff', border: '1px solid #E5E7EB', borderRadius: 16, padding: 32, textAlign: 'center', marginBottom: 20 }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>💪</div>
                <p style={{ fontSize: '1rem', color: '#111827', fontWeight: 600, lineHeight: 1.6 }}>{PMR_STEPS[pmrStep]}</p>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {pmrStep < PMR_STEPS.length - 1 ? (
                  <button onClick={() => setPmrStep(s => s + 1)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: '#475569', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Next Step</button>
                ) : (
                  <button onClick={() => setPmrStep(0)} style={{ flex: 1, padding: '12px', borderRadius: 10, border: 'none', background: '#475569', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Repeat Exercise</button>
                )}
              </div>
            </div>
          )}

          {/* Affirmations */}
          {activeEx === 'affirmations' && (
            <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
              <h2 style={{ fontWeight: 800, color: '#111827', marginBottom: 8 }}>⭐ Placement Affirmations</h2>
              <p style={{ color: '#6B7280', fontSize: '0.85rem', marginBottom: 32 }}>Read each affirmation slowly and believe it as you say it.</p>
              <div style={{ background: '#F3F4F6', border: '1px solid #E5E7EB', borderRadius: 20, padding: '48px 36px', marginBottom: 24 }}>
                <p style={{ fontSize: '1.2rem', fontWeight: 700, color: '#111827', lineHeight: 1.6, fontStyle: 'italic' }}>
                  "{AFFIRMATIONS[affIndex]}"
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button onClick={() => setAffIndex(i => (i - 1 + AFFIRMATIONS.length) % AFFIRMATIONS.length)} style={{ padding: '10px 22px', borderRadius: 10, border: '1px solid #E5E7EB', background: '#fff', cursor: 'pointer', fontWeight: 600 }}>Previous</button>
                <button onClick={() => setAffIndex(i => (i + 1) % AFFIRMATIONS.length)} style={{ padding: '10px 22px', borderRadius: 10, border: 'none', background: '#475569', color: '#fff', cursor: 'pointer', fontWeight: 700 }}>Next</button>
              </div>
              <div style={{ marginTop: 12, fontSize: '0.75rem', color: '#9CA3AF' }}>{affIndex + 1} / {AFFIRMATIONS.length}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

