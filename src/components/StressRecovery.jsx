import React, { useState, useEffect, useRef } from 'react';

const EXERCISES = [
 { id: 'box', title: 'Box Breathing', desc: '4-4-4-4 technique to calm your nervous system instantly', icon: '️', color: '#111827', phases: ['Inhale', 'Hold', 'Exhale', 'Hold'], duration: 4 },
 { id: 'grounding', title: '5-4-3-2-1 Grounding', desc: 'Mindfulness anchoring exercise to reduce anxiety', icon: '', color: '#111827' },
 { id: 'pmr', title: 'Progressive Muscle Relaxation', desc: 'Tense and release muscle groups to remove physical tension', icon: '', color: '#111827' },
 { id: 'affirmations', title: 'Placement Affirmations', desc: 'Positive self-statements to rebuild confidence', icon: '', color: '#111827' },
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
 ' Full body scan: Take 3 deep breaths and notice how relaxed you feel now.',
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
    <div style={{ padding: '32px 24px', maxWidth: 920, margin: '0 auto', fontFamily: 'var(--font-body)' }}>
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontWeight: 800, fontSize: '2rem', color: 'var(--main-heading)', letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)' }}>
            Stress Recovery Hub
          </h1>
          <p style={{ color: 'var(--body-text)', fontSize: '0.92rem', marginTop: 4, fontFamily: 'var(--font-body)' }}>
            Evidence-based techniques to calm your mind and restore focus during placement season.
          </p>
        </div>
        <button 
          onClick={() => setActiveTab && setActiveTab('dashboard')} 
          className="btn-back-dashboard"
          style={{ padding: '9px 18px', fontSize: '0.85rem', fontWeight: 700 }}
        >
          ← Dashboard
        </button>
      </div>

      {!activeEx && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {EXERCISES.map(ex => (
            <div
              key={ex.id}
              onClick={() => setActiveEx(ex.id)}
              className="saas-card-spec card-hover-effect"
              style={{
                borderRadius: 16, padding: 26, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', gap: 10
              }}
            >
              <h3 style={{ fontWeight: 800, fontSize: '1.15rem', color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>
                {ex.title}
              </h3>
              <p style={{ fontSize: '0.88rem', color: 'var(--body-text)', lineHeight: 1.6, margin: 0, fontFamily: 'var(--font-body)' }}>
                {ex.desc}
              </p>
              <button className="btn-primary-spec" style={{ marginTop: 'auto', padding: '8px 16px', fontSize: '0.82rem', justifyContent: 'center' }}>
                Start Exercise →
              </button>
            </div>
          ))}
        </div>
      )}

      {activeEx && (
        <div>
          <button
            onClick={() => { setActiveEx(null); stopBox(); setGroundStep(0); setPmrStep(0); }}
            className="btn-secondary-spec"
            style={{ padding: '6px 14px', fontSize: '0.82rem', fontWeight: 700, marginBottom: 20 }}
          >
            ← Back to Exercises
          </button>

          {/* Box Breathing */}
          {activeEx === 'box' && (
            <div className="calm-sub-card" style={{ maxWidth: 520, margin: '0 auto', textAlign: 'center', padding: '32px 28px' }}>
              <h2 style={{ fontWeight: 800, color: 'var(--main-heading)', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
                Box Breathing Rhythm
              </h2>
              <p style={{ color: 'var(--body-text)', fontSize: '0.88rem', marginBottom: 28 }}>
                Inhale, hold, exhale, hold — each for 4 seconds.
              </p>

              <div style={{
                width: 180, height: 180, borderRadius: '50%', margin: '0 auto 28px',
                background: 'linear-gradient(135deg, #FAF8F5 0%, #EAEFE8 100%)',
                border: `3px solid var(--btn-sage)`,
                boxShadow: 'var(--shadow-3d-card)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                transition: 'all 0.5s ease'
              }}>
                <div style={{ fontSize: '2.8rem', fontWeight: 900, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>
                  {boxCount}
                </div>
                <div style={{ fontWeight: 700, color: 'var(--btn-sage)', fontSize: '0.92rem', fontFamily: 'var(--font-body)' }}>
                  {boxRunning ? ['Inhale', 'Hold', 'Exhale', 'Hold'][boxPhase] : 'Ready'}
                </div>
              </div>

              <p style={{ color: 'var(--body-text)', fontSize: '0.88rem', marginBottom: 24, minHeight: '22px' }}>
                {boxRunning ? PHASE_DESC[boxPhase] : 'Press Start to begin the breathing cycle.'}
              </p>

              {!boxRunning ? (
                <button onClick={startBox} className="btn-primary-spec" style={{ padding: '12px 32px', fontSize: '0.95rem' }}>
                  Start Breathing
                </button>
              ) : (
                <button onClick={stopBox} className="btn-secondary-spec" style={{ padding: '12px 32px', fontSize: '0.95rem' }}>
                  Stop Exercise
                </button>
              )}
            </div>
          )}

          {/* 5-4-3-2-1 Grounding */}
          {activeEx === 'grounding' && (
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <div className="calm-sub-card" style={{ padding: '28px 32px' }}>
                <h2 style={{ fontWeight: 800, color: 'var(--main-heading)', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
                  5-4-3-2-1 Grounding
                </h2>
                <p style={{ color: 'var(--body-text)', fontSize: '0.88rem', marginBottom: 20 }}>
                  Anchor yourself to the present moment using your 5 senses.
                </p>

                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                  {GROUNDING_STEPS.map((s, i) => (
                    <div key={i} style={{
                      flex: 1, height: 6, borderRadius: 3,
                      backgroundColor: i <= groundStep ? 'var(--btn-sage)' : 'rgba(82, 98, 87, 0.15)',
                      transition: 'all 0.3s'
                    }} />
                  ))}
                </div>

                {groundStep < GROUNDING_STEPS.length ? (
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-terracotta)', marginBottom: 6, fontFamily: 'var(--font-heading)' }}>
                      {GROUNDING_STEPS[groundStep].count}
                    </div>
                    <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--main-heading)', marginBottom: 10, fontFamily: 'var(--font-heading)' }}>
                      Things You Can {GROUNDING_STEPS[groundStep].sense}
                    </div>
                    <p style={{ color: 'var(--body-text)', fontSize: '0.92rem', marginBottom: 28 }}>
                      {GROUNDING_STEPS[groundStep].prompt}
                    </p>
                    <button
                      onClick={() => setGroundStep(s => Math.min(s + 1, GROUNDING_STEPS.length))}
                      className="btn-primary-spec"
                      style={{ padding: '12px 30px' }}
                    >
                      Next Step →
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '16px' }}>
                    <h3 style={{ color: 'var(--main-heading)', fontWeight: 800, marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
                      Grounding Complete!
                    </h3>
                    <p style={{ color: 'var(--body-text)', fontSize: '0.92rem' }}>
                      You are present, calm, and anchored. Return to your preparation with a clear mind.
                    </p>
                    <button onClick={() => setGroundStep(0)} className="btn-primary-spec" style={{ marginTop: 20, padding: '10px 24px' }}>
                      Repeat Exercise
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PMR */}
          {activeEx === 'pmr' && (
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
              <div className="calm-sub-card" style={{ padding: '28px 32px', textAlign: 'center' }}>
                <h2 style={{ fontWeight: 800, color: 'var(--main-heading)', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
                  Progressive Muscle Relaxation
                </h2>
                <p style={{ color: 'var(--body-text)', fontSize: '0.88rem', marginBottom: 20 }}>
                  Step {pmrStep + 1} of {PMR_STEPS.length}
                </p>
                <div style={{ padding: '24px 20px', borderRadius: 12, backgroundColor: 'rgba(82, 98, 87, 0.05)', marginBottom: 24 }}>
                  <p style={{ fontSize: '1rem', color: 'var(--main-heading)', fontWeight: 600, lineHeight: 1.6, margin: 0 }}>
                    {PMR_STEPS[pmrStep]}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                  {pmrStep < PMR_STEPS.length - 1 ? (
                    <button onClick={() => setPmrStep(s => s + 1)} className="btn-primary-spec" style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
                      Next Step →
                    </button>
                  ) : (
                    <button onClick={() => setPmrStep(0)} className="btn-primary-spec" style={{ flex: 1, justifyContent: 'center', padding: '12px' }}>
                      Repeat Exercise
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Affirmations */}
          {activeEx === 'affirmations' && (
            <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
              <div className="calm-sub-card" style={{ padding: '36px 30px' }}>
                <h2 style={{ fontWeight: 800, color: 'var(--main-heading)', marginBottom: 8, fontFamily: 'var(--font-heading)' }}>
                  Placement Affirmations
                </h2>
                <p style={{ color: 'var(--body-text)', fontSize: '0.88rem', marginBottom: 28 }}>
                  Read each affirmation slowly and anchor your confidence.
                </p>
                <div className="calm-quote-card" style={{ padding: '32px 24px', marginBottom: 24 }}>
                  <p style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--main-heading)', lineHeight: 1.6, fontStyle: 'italic', margin: 0, fontFamily: 'var(--font-heading)' }}>
                    "{AFFIRMATIONS[affIndex]}"
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                  <button
                    onClick={() => setAffIndex(i => (i - 1 + AFFIRMATIONS.length) % AFFIRMATIONS.length)}
                    className="btn-secondary-spec"
                    style={{ padding: '10px 22px' }}
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setAffIndex(i => (i + 1) % AFFIRMATIONS.length)}
                    className="btn-primary-spec"
                    style={{ padding: '10px 22px' }}
                  >
                    Next Affirmation →
                  </button>
                </div>
                <div style={{ marginTop: 14, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  {affIndex + 1} of {AFFIRMATIONS.length}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
 );
}
