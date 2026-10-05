import React, { useState } from 'react';
import { dbService } from '../services/db';

const STEPS = ['Dimensions', 'Symptoms', 'Context', 'Report'];

const DIMENSIONS = [
  { key: 'stress',           label: 'Placement and Exam Stress',     sub: 'Overall pressure from upcoming placements, tests, or deadlines.',           polarity: 'negative', weight: 0.20 },
  { key: 'anxiety',          label: 'Interview Anxiety',              sub: 'Racing heart, blank mind, or panic when imagining an interview.',           polarity: 'negative', weight: 0.18 },
  { key: 'imposter',         label: 'Imposter Syndrome',             sub: 'Feeling unqualified despite preparation; comparing yourself to peers.',      polarity: 'negative', weight: 0.14 },
  { key: 'physicalSymptoms', label: 'Physical Stress Symptoms',      sub: 'Headaches, tight chest, sweating, or stomach tension from study pressure.', polarity: 'negative', weight: 0.10 },
  { key: 'socialPressure',   label: 'Social and Family Pressure',    sub: 'Perceived pressure from family, peers, or society about placements.',       polarity: 'negative', weight: 0.08 },
  { key: 'sleep',            label: 'Sleep Quality and Restoration', sub: 'How rested and energised you felt after sleeping last night.',              polarity: 'positive', weight: 0.13 },
  { key: 'focus',            label: 'Focus and Deep-Work Capacity',  sub: 'Ability to concentrate on coding problems without distraction.',            polarity: 'positive', weight: 0.08 },
  { key: 'motivation',       label: 'Motivation and Drive',          sub: 'Inner pull to practice, learn, and push through difficult topics.',         polarity: 'positive', weight: 0.05 },
  { key: 'emotionalReg',     label: 'Emotional Regulation',         sub: 'Ability to pause, breathe, and stay calm when things go wrong.',            polarity: 'positive', weight: 0.04 },
];

const SYMPTOMS = [
  { key: 'blanks',        label: 'Mind goes blank during practice problems' },
  { key: 'procrastinate', label: 'Procrastinating study due to fear of failure' },
  { key: 'negSelf',       label: 'Negative self-talk about your own capabilities' },
  { key: 'compare',       label: 'Constantly comparing yourself to placed peers' },
  { key: 'appetite',      label: 'Loss of appetite or overeating due to stress' },
  { key: 'insomnia',      label: 'Difficulty falling or staying asleep' },
  { key: 'irritable',     label: 'Easily irritable or snapping at people' },
  { key: 'avoidance',     label: 'Avoiding hard topics such as DP, graphs, or system design' },
  { key: 'overthinking',  label: 'Overthinking every answer and second-guessing yourself' },
  { key: 'burnout',       label: 'Studying but retaining almost nothing — burnout signal' },
];

const MOOD_OPTIONS = [
  { label: 'Confident',   color: '#526257', desc: 'Clear, calm, and ready.' },
  { label: 'Focused',     color: '#68705F', desc: 'In the zone with sharp thinking.' },
  { label: 'Neutral',     color: '#89878A', desc: 'Average, manageable day.' },
  { label: 'Anxious',     color: '#9A6854', desc: 'Nervous about upcoming tasks.' },
  { label: 'Overwhelmed', color: '#7A3F2E', desc: 'Too much, too little time.' },
  { label: 'Drained',     color: '#4F5056', desc: 'Exhausted and low energy.' },
];

function computeProfile(dimensions, symptoms, mood) {
  let stressSum = 0, posSum = 0, negW = 0, posW = 0;
  DIMENSIONS.forEach(dim => {
    const val = (dimensions[dim.key] || 5) / 10;
    if (dim.polarity === 'negative') { stressSum += val * dim.weight; negW += dim.weight; }
    else { posSum += val * dim.weight; posW += dim.weight; }
  });
  const rawStress    = negW > 0 ? (stressSum / negW) * 10 : 5;
  const rawReadiness = posW > 0 ? (posSum   / posW)  * 10 : 5;
  const symPenalty   = Math.min(2.5, symptoms.length * 0.25);
  const moodNudge    = { Confident: -0.5, Focused: -0.3, Neutral: 0, Anxious: 0.5, Overwhelmed: 1.0, Drained: 0.8 }[mood] ?? 0;
  const finalStress     = Math.min(10, Math.max(1, parseFloat((rawStress    + symPenalty + moodNudge).toFixed(1))));
  const finalReadiness  = Math.min(10, Math.max(1, parseFloat((rawReadiness - moodNudge * 0.4).toFixed(1))));
  const finalConfidence = Math.min(10, Math.max(1, Math.round(
    (dimensions.motivation || 5) * 0.35 + ((10 - (dimensions.imposter || 4)) * 0.35) + (dimensions.emotionalReg || 5) * 0.30
  )));
  let profile, urgency, summary, coping, pacing;
  if (finalStress >= 7.5) {
    profile = 'Acute Psychological Overload'; urgency = 'High Risk';
    summary = 'Peak stress levels detected. Cognitive performance in interviews will be significantly impaired. Immediate decompression is essential before any timed practice.';
    coping  = [
      'Start with 5 minutes of Box Breathing — inhale 4s, hold 4s, exhale 4s, hold 4s. Do this before continuing.',
      'Open the Thought Journal and write your top 3 fear thoughts. Reframe each with a factual counter-statement.',
      'Practice only one Easy-level problem to rebuild technical momentum rather than jumping into Hard.',
      'Take a 30-minute walk away from screens. Physical movement directly reduces cortisol levels.',
      'Set a firm sleep time tonight — cognitive recovery cannot be skipped or compressed.',
    ];
    pacing = '120 WPM — Slow adaptive pacing with step-by-step hint prompts enabled in mock interviews.';
  } else if (finalStress >= 5.5 || symptoms.length >= 5) {
    profile = 'Elevated Anxiety and Performance Pressure'; urgency = 'Moderate';
    summary = 'Stress levels are elevated and will affect recall speed and problem clarity. Structured decompression before any timed session is strongly recommended.';
    coping  = [
      'Complete a Socratic Reappraisal exercise: write the worst-case scenario, then systematically challenge each assumption.',
      'Review your last five solved problems to rebuild evidence of your own competence.',
      'Begin with Aptitude MCQs rather than coding — a lower-stakes warm-up rebuilds confidence faster.',
      'Use Pomodoro 25/5 sprints instead of marathon sessions today.',
      'Avoid placement-news and peer-offer feeds for the rest of the day.',
    ];
    pacing = '140 WPM — Moderate interview pacing with supportive tone and partial-credit feedback.';
  } else if (finalStress >= 3.5 && finalReadiness >= 5) {
    profile = 'Functional Stress with Good Readiness'; urgency = 'Low';
    summary = 'Some stress is present but readiness indicators are healthy. Channel this manageable pressure into structured, timed practice to sharpen your edge.';
    coping  = [
      'Attempt one Company-Specific timed question set from TCS NQT, Infosys, or Zoho.',
      'Simulate a 45-minute LeetCode medium problem with a running timer.',
      'Explain a solution you solved recently out loud — verbal rehearsal strongly boosts retention.',
      'Plan tomorrow study schedule tonight to eliminate decision fatigue in the morning.',
    ];
    pacing = '155 WPM — Standard technical panel pacing. Full feature set enabled.';
  } else if (finalReadiness >= 7) {
    profile = 'Peak Placement Readiness'; urgency = 'Optimal';
    summary = 'Your psychological state is ideal for high-performance practice. This is the best possible window for tackling your hardest challenges.';
    coping  = [
      'Attempt a full-length mock interview at maximum pacing — this is your peak window.',
      'Solve one Hard-difficulty graph or Dynamic Programming problem.',
      'Write a post-session self-assessment: what you executed well, what to refine next.',
      'Practise your System Design walkthrough aloud for ten minutes.',
    ];
    pacing = '175 to 180 WPM — Challenge mode. Full pressure simulation enabled.';
  } else {
    profile = 'Cognitive Fatigue and Low Drive'; urgency = 'Rest Priority';
    summary = 'Energy and motivation are depleted. Forcing through a high-intensity session will deepen burnout. Restorative actions will return you to a productive state faster.';
    coping  = [
      'Take a 20 to 30 minute power nap before opening any study material.',
      'Eat a proper meal — fatigue is amplified significantly by skipped meals.',
      'Do light revision only: flashcards, concept videos, or summaries.',
      'Write two or three positive memories in the Positive Memories log to re-anchor motivation.',
      'Limit total screen time today — schedule a proper recovery window.',
    ];
    pacing = '135 WPM — Reduced pace with extended problem time limits. Gentle hint mode.';
  }
  return { profile, urgency, summary, coping, pacing, finalStress, finalReadiness, finalConfidence,
    symptomCount: symptoms.length, date: new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) };
}

function ScoreBar({ value, label, isStress }) {
  const pct = (value / 10) * 100;
  const barColor = isStress
    ? (value >= 7 ? 'var(--accent-terracotta)' : value >= 5 ? '#8a7250' : 'var(--btn-sage)')
    : (value >= 7 ? 'var(--btn-sage)' : value >= 5 ? '#8a7250' : 'var(--accent-terracotta)');
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5, alignItems: 'baseline' }}>
        <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--body-text)' }}>{label}</span>
        <span style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>
          {value}<span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 500 }}>/10</span>
        </span>
      </div>
      <div style={{ height: 7, borderRadius: 7, background: 'var(--border-color)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: pct + '%', background: barColor, borderRadius: 7, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  );
}

function DimensionSlider({ dim, value, onChange }) {
  const negL = ['None', 'Mild', 'Noticeable', 'High', 'Extreme'];
  const posL = ['Very Low', 'Low', 'Moderate', 'Good', 'Excellent'];
  const lvl = Math.min(4, Math.floor((value - 1) / 2.25));
  const qualifier = dim.polarity === 'negative' ? negL[lvl] : posL[lvl];
  const bad = dim.polarity === 'negative' ? value >= 7 : value <= 3;
  const flagColor = bad ? 'var(--accent-terracotta)' : 'var(--btn-sage)';
  return (
    <div style={{ marginBottom: 14, padding: '13px 15px', borderRadius: 12, background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 7 }}>
        <div style={{ flex: 1, paddingRight: 10 }}>
          <div style={{ fontSize: '0.87rem', fontWeight: 600, color: 'var(--main-heading)' }}>{dim.label}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.4 }}>{dim.sub}</div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0, minWidth: 66 }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: flagColor, fontFamily: 'var(--font-heading)' }}>{value}</span>
          <div style={{ fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: 1 }}>{qualifier}</div>
        </div>
      </div>
      <input type="range" min={1} max={10} step={1} value={value}
        onChange={e => onChange(dim.key, Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--btn-sage)', cursor: 'pointer' }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.66rem', color: 'var(--text-muted)', marginTop: 2 }}>
        <span>{dim.polarity === 'negative' ? '1 — None' : '1 — Very Low'}</span>
        <span>{dim.polarity === 'negative' ? '10 — Extreme' : '10 — Excellent'}</span>
      </div>
    </div>
  );
}

export default function MoodAssessment({ moodState, setMoodState, setActiveTab, userEmail = 'guest' }) {
  const [step, setStep] = useState(0);
  const [saved, setSaved] = useState(false);
  const initDims = () => { const d = {}; DIMENSIONS.forEach(dim => { d[dim.key] = 5; }); return d; };
  const [dims, setDims] = useState(initDims);
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [selectedMood, setSelectedMood] = useState('Neutral');
  const [context, setContext] = useState('');
  const [studyHours, setStudyHours] = useState(3);
  const [daysToInterview, setDaysToInterview] = useState(14);
  const [report, setReport] = useState(null);

  const handleDimChange = (key, val) => setDims(prev => ({ ...prev, [key]: val }));
  const toggleSymptom = key => setSelectedSymptoms(prev =>
    prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
  );
  const generateReport = () => {
    const r = computeProfile(dims, selectedSymptoms, selectedMood);
    r.moodLabel = selectedMood; r.studyHours = studyHours;
    r.daysToInterview = daysToInterview; r.context = context;
    r.dimensions = { ...dims }; r.symptoms = [...selectedSymptoms];
    setReport(r); setStep(3);
    const ms = { label: selectedMood, stress: r.finalStress, confidence: r.finalConfidence, readiness: r.finalReadiness };
    setMoodState(ms);
    dbService.logMood(ms);
    dbService.saveTestScore('mood', r.finalStress, userEmail,
      { label: selectedMood, confidence: r.finalConfidence, readiness: r.finalReadiness, profile: r.profile });
    setSaved(true); setTimeout(() => setSaved(false), 4000);
  };

  const StepBar = () => (
    <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
      {STEPS.map((s, i) => (
        <div key={s} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ height: 3, borderRadius: 3, background: i <= step ? 'var(--btn-sage)' : 'var(--border-color)', transition: 'background 0.3s' }} />
            <div style={{ fontSize: '0.7rem', color: i <= step ? 'var(--btn-sage)' : 'var(--text-muted)', fontWeight: 600, marginTop: 4 }}>{s}</div>
          </div>
          {i < STEPS.length - 1 && <div style={{ width: 10 }} />}
        </div>
      ))}
    </div>
  );

  return (
    <div style={{ flex: 1, padding: '28px 24px', maxWidth: 1080, margin: '0 auto', width: '100%', fontFamily: 'var(--font-body)' }}>

      <div style={{ marginBottom: 18 }}>
        <button onClick={() => setActiveTab && setActiveTab('dashboard')} className="btn-back-dashboard" style={{ padding: '8px 18px', fontSize: '0.88rem' }}>
          Back to Dashboard
        </button>
      </div>

      <div className="saas-card-spec" style={{ padding: '22px 26px', marginBottom: 22 }}>
        <span className="pill-tag" style={{ marginBottom: 8, display: 'inline-block' }}>Psychological Intelligence</span>
        <h2 style={{ fontSize: '1.55rem', fontWeight: 700, color: 'var(--main-heading)', margin: '6px 0 6px', fontFamily: 'var(--font-heading)' }}>
          Multi-Dimension Mood and Readiness Check-in
        </h2>
        <p style={{ color: 'var(--body-text)', fontSize: '0.88rem', maxWidth: 580, lineHeight: 1.65 }}>
          A 9-dimension psychological profiling engine. Produces a precision readiness score and a personalised, priority-ranked coping plan calibrated to your current mental state.
        </p>
      </div>

      {saved && (
        <div style={{ padding: '12px 18px', borderRadius: 10, background: 'var(--primary-tint)', border: '1px solid var(--btn-sage)', color: 'var(--btn-sage-hover)', fontWeight: 700, marginBottom: 18, fontSize: '0.88rem' }}>
          Assessment saved to database. Adaptive Engine updated with your current profile.
        </div>
      )}

      <StepBar />

      {step === 0 && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <div className="saas-card-spec" style={{ padding: 22 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--accent-terracotta)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Stress Indicators</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Higher value = more stress present</div>
              </div>
              {DIMENSIONS.filter(d => d.polarity === 'negative').map(dim => (
                <DimensionSlider key={dim.key} dim={dim} value={dims[dim.key]} onChange={handleDimChange} />
              ))}
            </div>
            <div className="saas-card-spec" style={{ padding: 22 }}>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--btn-sage)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>Readiness Indicators</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>Higher value = better condition</div>
              </div>
              {DIMENSIONS.filter(d => d.polarity === 'positive').map(dim => (
                <DimensionSlider key={dim.key} dim={dim} value={dims[dim.key]} onChange={handleDimChange} />
              ))}
            </div>
          </div>
          <div style={{ textAlign: 'right', marginTop: 18 }}>
            <button onClick={() => setStep(1)} className="btn-primary-spec" style={{ padding: '12px 32px' }}>Next: Symptom Checklist</button>
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="saas-card-spec" style={{ padding: 26 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--main-heading)', marginBottom: 4, fontFamily: 'var(--font-heading)' }}>
            Which of these have you experienced in the last 24 to 48 hours?
          </h3>
          <p style={{ color: 'var(--body-text)', fontSize: '0.83rem', marginBottom: 18 }}>
            Select all that apply. Each signal adjusts your computed stress index beyond the slider values.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {SYMPTOMS.map(sym => {
              const active = selectedSymptoms.includes(sym.key);
              return (
                <div key={sym.key} onClick={() => toggleSymptom(sym.key)}
                  style={{ padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                    border: active ? '1.5px solid var(--btn-sage)' : '1px solid var(--border-color)',
                    background: active ? 'var(--primary-tint)' : 'var(--bg-card-solid)',
                    display: 'flex', alignItems: 'center', gap: 10, transition: 'all 0.15s ease',
                    fontSize: '0.84rem', color: active ? 'var(--btn-sage-hover)' : 'var(--body-text)', fontWeight: active ? 600 : 400 }}>
                  <div style={{ width: 17, height: 17, borderRadius: 4, flexShrink: 0,
                    border: active ? '1.5px solid var(--btn-sage)' : '1px solid var(--border-color)',
                    background: active ? 'var(--btn-sage)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s ease' }}>
                    {active && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  {sym.label}
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 16, padding: '10px 14px', borderRadius: 8, background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', fontSize: '0.81rem', color: 'var(--body-text)' }}>
            {selectedSymptoms.length === 0 ? 'No symptoms selected — good indicator.' : selectedSymptoms.length + ' symptom' + (selectedSymptoms.length > 1 ? 's' : '') + ' flagged — adjusting stress index upward.'}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22 }}>
            <button onClick={() => setStep(0)} className="btn-back-dashboard" style={{ padding: '10px 24px' }}>Back</button>
            <button onClick={() => setStep(2)} className="btn-primary-spec" style={{ padding: '12px 32px' }}>Next: Context</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="saas-card-spec" style={{ padding: 26 }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--main-heading)', marginBottom: 18, fontFamily: 'var(--font-heading)' }}>Context and Emotional State</h3>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: '0.87rem', fontWeight: 600, color: 'var(--secondary-heading)', display: 'block', marginBottom: 10 }}>Current Emotional State</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {MOOD_OPTIONS.map(m => {
                const active = selectedMood === m.label;
                return (
                  <div key={m.label} onClick={() => setSelectedMood(m.label)}
                    style={{ padding: '14px 12px', borderRadius: 12, cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s ease',
                      border: active ? ('1.5px solid ' + m.color) : '1px solid var(--border-color)',
                      background: active ? 'var(--primary-tint)' : 'var(--bg-card-solid)' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: active ? m.color : 'var(--main-heading)', fontFamily: 'var(--font-heading)', marginBottom: 3 }}>{m.label}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>{m.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 22 }}>
            {[
              { label: 'Study hours today', value: studyHours, min: 0, max: 12, step: 0.5, suffix: 'h', setter: setStudyHours },
              { label: 'Days to next interview', value: daysToInterview, min: 1, max: 30, step: 1, suffix: 'd', setter: setDaysToInterview },
            ].map(s => (
              <div key={s.label} style={{ padding: '15px 16px', borderRadius: 12, background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--secondary-heading)' }}>{s.label}</label>
                  <strong style={{ color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>{s.value}{s.suffix}</strong>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step} value={s.value}
                  onChange={e => s.setter(Number(e.target.value))} style={{ width: '100%', accentColor: 'var(--btn-sage)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.67rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  <span>{s.min}{s.suffix}</span><span>{s.max}{s.suffix}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 22 }}>
            <label style={{ fontSize: '0.87rem', fontWeight: 600, color: 'var(--secondary-heading)', display: 'block', marginBottom: 8 }}>
              What is on your mind right now?{' '}<span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span>
            </label>
            <textarea value={context} onChange={e => setContext(e.target.value)}
              placeholder="e.g. I did poorly on a mock interview yesterday and cannot stop thinking about it..."
              rows={3} style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border-input)',
                fontSize: '0.87rem', color: 'var(--main-heading)', resize: 'vertical', fontFamily: 'var(--font-body)',
                lineHeight: 1.6, outline: 'none', boxSizing: 'border-box', background: 'var(--bg-input)' }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={() => setStep(1)} className="btn-back-dashboard" style={{ padding: '10px 24px' }}>Back</button>
            <button onClick={generateReport} className="btn-primary-spec" style={{ padding: '12px 32px' }}>Generate Psychological Report</button>
          </div>
        </div>
      )}

      {step === 3 && report && (
        <div>
          <div className="saas-card-spec" style={{ padding: '22px 26px', marginBottom: 22, borderLeft: '4px solid var(--btn-sage)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-terracotta)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
                  Psychological Profile — {report.urgency}
                </div>
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--main-heading)', margin: '0 0 8px', fontFamily: 'var(--font-heading)' }}>{report.profile}</h3>
                <p style={{ fontSize: '0.87rem', color: 'var(--body-text)', lineHeight: 1.7, maxWidth: 580 }}>{report.summary}</p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, minWidth: 190 }}>
                <ScoreBar value={report.finalStress}     label="Stress Index"     isStress={true} />
                <ScoreBar value={report.finalReadiness}  label="Readiness Score"  isStress={false} />
                <ScoreBar value={report.finalConfidence} label="Confidence Score" isStress={false} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 22 }}>
            {[
              { label: 'Mood State',        value: report.moodLabel },
              { label: 'Symptoms Flagged',  value: report.symptomCount + ' of ' + SYMPTOMS.length },
              { label: 'Study Hours Today', value: report.studyHours + 'h' },
              { label: 'Days to Interview', value: report.daysToInterview + 'd' },
              { label: 'Assessed At',       value: report.date },
            ].map(m => (
              <div key={m.label} style={{ padding: '13px 14px', borderRadius: 12, background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.69rem', color: 'var(--text-muted)', fontWeight: 600, marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>{m.value}</div>
              </div>
            ))}
          </div>

          <div className="saas-card-spec" style={{ padding: 22, marginBottom: 22 }}>
            <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--secondary-heading)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 14 }}>Dimension Breakdown</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 28px' }}>
              {DIMENSIONS.map(dim => {
                const val = report.dimensions[dim.key];
                const bad = dim.polarity === 'negative' ? val >= 7 : val <= 3;
                const barColor = bad ? 'var(--accent-terracotta)' : val >= 6 ? 'var(--btn-sage)' : '#8a7250';
                return (
                  <div key={dim.key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.79rem', color: 'var(--body-text)', fontWeight: 600 }}>{dim.label}</span>
                      <span style={{ fontSize: '0.79rem', color: barColor, fontWeight: 700 }}>{val}/10</span>
                    </div>
                    <div style={{ height: 5, borderRadius: 5, background: 'var(--border-color)', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: (val * 10) + '%', background: barColor, borderRadius: 5, transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 0.65fr', gap: 20, marginBottom: 24 }}>
            <div className="saas-card-spec" style={{ padding: 22 }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--secondary-heading)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 12 }}>Personalised Coping and Action Plan</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {report.coping.map((c, i) => (
                  <div key={i} style={{ padding: '11px 14px', borderRadius: 8,
                    background: i === 0 ? 'var(--primary-tint)' : 'var(--bg-card-solid)',
                    border: i === 0 ? '1px solid var(--btn-sage)' : '1px solid var(--border-color)',
                    fontSize: '0.84rem', color: 'var(--body-text)', lineHeight: 1.65 }}>
                    {i === 0 && <div style={{ fontWeight: 700, color: 'var(--btn-sage-hover)', fontSize: '0.69rem', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Priority Action</div>}
                    {c}
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="saas-card-spec" style={{ padding: 18, flex: 1 }}>
                <div style={{ fontSize: '0.76rem', fontWeight: 700, color: 'var(--secondary-heading)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Adaptive Engine Pacing</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--body-text)', lineHeight: 1.7 }}>{report.pacing}</p>
              </div>
              {report.context && (
                <div className="saas-card-spec" style={{ padding: 16, borderLeft: '3px solid var(--accent-terracotta)' }}>
                  <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent-terracotta)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 5 }}>Your Note</div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--body-text)', lineHeight: 1.6, fontStyle: 'italic' }}>&ldquo;{report.context}&rdquo;</p>
                </div>
              )}
              <button onClick={() => setActiveTab && setActiveTab('dashboard')} className="btn-primary-spec" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                Apply to Dashboard and Hubs
              </button>
              <button onClick={() => { setStep(0); setReport(null); setSelectedSymptoms([]); setDims(initDims()); }} className="btn-back-dashboard" style={{ width: '100%', justifyContent: 'center', padding: '10px' }}>
                Redo Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
