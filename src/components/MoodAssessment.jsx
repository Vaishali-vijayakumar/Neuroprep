import React, { useState } from 'react';
import { dbService } from '../services/db';

export default function MoodAssessment({ moodState, setMoodState, setActiveTab, userEmail = 'guest' }) {
  // Multi-dimension psychological metrics
  const [selectedMood, setSelectedMood] = useState(moodState.label || 'Moderate');
  const [stress, setStress] = useState(moodState.stress || 5);
  const [anxiety, setAnxiety] = useState(5);
  const [imposterSyndrome, setImposterSyndrome] = useState(4);
  const [sleepQuality, setSleepQuality] = useState(6);
  const [focusLevel, setFocusLevel] = useState(6);

  const [analysisReport, setAnalysisReport] = useState(null);
  const [saved, setSaved] = useState(false);

  const moodOptions = [
    { label: 'Confident', desc: 'Ready to clear technical rounds with calm precision.' },
    { label: 'Focused', desc: 'Steady, engaged, and prepared for complex problem solving.' },
    { label: 'Moderate', desc: 'Slight pre-exam jitters, manageable workload and pacing.' },
    { label: 'Anxious', desc: 'Overwhelmed by code complexity, time constraints, or interview panic.' },
    { label: 'Stressed', desc: 'High pressure levels, racing thoughts, and acute self-doubt.' }
  ];

  const handleCalculateAnalysis = (e) => {
    e.preventDefault();

    // Comprehensive calculated stress index (1-10)
    const computedStressScore = Math.min(10, Math.max(1, Math.round(
      (Number(stress) * 0.35) +
      (Number(anxiety) * 0.30) +
      (Number(imposterSyndrome) * 0.20) +
      ((10 - Number(sleepQuality)) * 0.15)
    )));

    // Derived confidence score (1-10)
    const computedConfidence = Math.min(10, Math.max(1, Math.round(
      (Number(focusLevel) * 0.6) +
      ((10 - Number(imposterSyndrome)) * 0.4)
    )));

    let primaryDriver = 'Balanced Placement Readiness';
    let recommendations = [];
    let pacingDirective = 'Standard 150 WPM Interview Pacing';

    if (computedStressScore >= 7) {
      primaryDriver = 'High Exam Panic & Technical Performance Anxiety';
      recommendations = [
        'Complete 5-minute Navy SEAL Box Breathing before coding practice.',
        'Use Thought Journal to log and reframe catastrophe thoughts.',
        'Start with 1 Easy array problem to rebuild technical momentum.'
      ];
      pacingDirective = 'Adaptive Engine: 120 WPM Slower Interview Pacing + Step-by-Step Hints Enabled';
    } else if (Number(sleepQuality) <= 4) {
      primaryDriver = 'Cognitive Fatigue & Sleep Deprivation';
      recommendations = [
        'Take a 20-minute restorative power break before mock interviews.',
        'Avoid solving heavy Dynamic Programming problems while fatigued.',
        'Engage in light Aptitude MCQ practice.'
      ];
      pacingDirective = 'Adaptive Engine: Moderate Pacing with Extended Problem Time Limits';
    } else if (Number(imposterSyndrome) >= 7) {
      primaryDriver = 'Self-Doubt & Peer Comparison Stress';
      recommendations = [
        'Review your past solved problem history and completed milestones.',
        'Complete Socratic Cognitive Reappraisal exercise.',
        'Focus on individual incremental progress.'
      ];
      pacingDirective = 'Adaptive Engine: Supportive Interview Feedback Tone';
    } else {
      primaryDriver = 'Optimal Mental Focus & Readiness';
      recommendations = [
        'Attempt a timed Company-Specific assessment round.',
        'Simulate a rapid 180 WPM mock technical interview.',
        'Solve 1 Medium/Hard algorithm challenge.'
      ];
      pacingDirective = 'Adaptive Engine: Strict Technical Panel Pacing (180 WPM) & Challenge Mode';
    }

    const report = {
      computedStressScore,
      computedConfidence,
      moodLabel: selectedMood,
      primaryDriver,
      recommendations,
      pacingDirective,
      date: new Date().toLocaleDateString()
    };

    setAnalysisReport(report);
    const updatedMoodState = {
      emoji: '',
      label: selectedMood,
      stress: computedStressScore,
      confidence: computedConfidence
    };

    setMoodState(updatedMoodState);
    dbService.logMood(updatedMoodState);
    dbService.saveTestScore('mood', computedStressScore, userEmail, {
      label: selectedMood,
      confidence: computedConfidence
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ flex: 1, padding: '32px 28px', maxWidth: '1280px', margin: '0 auto', width: '100%', fontFamily: 'var(--font-inter)' }}>
      
      {/* Top Back Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab && setActiveTab('dashboard')}
          className="btn-secondary-spec"
          style={{ padding: '8px 18px', fontSize: '0.88rem' }}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Header */}
      <div className="saas-card-spec" style={{ padding: '28px', marginBottom: '28px' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '4px' }}>
          Multi-Dimension Psychological & Mood Check-in
        </h2>
        <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>
          Evaluate stress, anxiety, imposter syndrome, and sleep quality to generate an overall psychological analysis report.
        </p>
      </div>

      {saved && (
        <div style={{ padding: '14px 18px', borderRadius: '10px', backgroundColor: '#F3F4F6', border: '1px solid #111827', color: '#111827', fontWeight: 700, marginBottom: '24px' }}>
          Psychological assessment completed & saved to database! Adaptive Engine updated.
        </div>
      )}

      <form onSubmit={handleCalculateAnalysis}>
        <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '28px', marginBottom: '32px' }}>
          
          {/* Left Column: Multi-Dimension Assessment Metrics */}
          <div className="saas-card-spec" style={{ padding: '28px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '20px', color: '#111827' }}>
              Psychological Dimensions (1 - 10 Scale)
            </h3>

            {/* Metric 1: General Stress */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>General Exam & Placement Stress</label>
                <strong style={{ fontSize: '0.9rem', color: '#111827' }}>{stress} / 10</strong>
              </div>
              <input 
                type="range" min="1" max="10" value={stress} 
                onChange={(e) => setStress(e.target.value)} 
                style={{ width: '100%', accentColor: '#111827' }} 
              />
            </div>

            {/* Metric 2: Acute Anxiety & Panic */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>Acute Interview Anxiety / Racing Heart Rate</label>
                <strong style={{ fontSize: '0.9rem', color: '#111827' }}>{anxiety} / 10</strong>
              </div>
              <input 
                type="range" min="1" max="10" value={anxiety} 
                onChange={(e) => setAnxiety(e.target.value)} 
                style={{ width: '100%', accentColor: '#111827' }} 
              />
            </div>

            {/* Metric 3: Imposter Syndrome & Self-Doubt */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>Self-Doubt & Peer Comparison</label>
                <strong style={{ fontSize: '0.9rem', color: '#111827' }}>{imposterSyndrome} / 10</strong>
              </div>
              <input 
                type="range" min="1" max="10" value={imposterSyndrome} 
                onChange={(e) => setImposterSyndrome(e.target.value)} 
                style={{ width: '100%', accentColor: '#111827' }} 
              />
            </div>

            {/* Metric 4: Sleep Quality & Fatigue */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>Sleep Restfulness & Energy Level</label>
                <strong style={{ fontSize: '0.9rem', color: '#111827' }}>{sleepQuality} / 10</strong>
              </div>
              <input 
                type="range" min="1" max="10" value={sleepQuality} 
                onChange={(e) => setSleepQuality(e.target.value)} 
                style={{ width: '100%', accentColor: '#111827' }} 
              />
            </div>

            {/* Metric 5: Concentration & Focus */}
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.88rem', fontWeight: 600, color: '#111827' }}>Problem Solving Concentration</label>
                <strong style={{ fontSize: '0.9rem', color: '#111827' }}>{focusLevel} / 10</strong>
              </div>
              <input 
                type="range" min="1" max="10" value={focusLevel} 
                onChange={(e) => setFocusLevel(e.target.value)} 
                style={{ width: '100%', accentColor: '#111827' }} 
              />
            </div>

          </div>

          {/* Right Column: Mood Category Selector & Action */}
          <div className="saas-card-spec" style={{ padding: '28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '16px', color: '#111827' }}>
                Primary Emotional State
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                {moodOptions.map((item) => (
                  <div
                    key={item.label}
                    onClick={() => setSelectedMood(item.label)}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      border: selectedMood === item.label ? '2px solid #111827' : '1px solid #E5E7EB',
                      backgroundColor: selectedMood === item.label ? '#F8F9FA' : '#FFFFFF',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <strong style={{ fontSize: '0.95rem', color: '#111827', display: 'block' }}>{item.label}</strong>
                    <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>{item.desc}</span>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary-spec" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
              Run Analysis & Calculate Score
            </button>
          </div>

        </div>
      </form>

      {/* ==========================================
          PSYCHOLOGICAL ANALYSIS REPORT OUTPUT
         ========================================== */}
      {analysisReport && (
        <section className="saas-card-spec" style={{ padding: '32px', backgroundColor: '#F8F9FA', borderLeft: '6px solid #111827' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
            <div>
              <span className="pill-tag" style={{ marginBottom: '6px' }}>Calculated Analysis Report</span>
              <h3 style={{ fontSize: '22px', fontWeight: 800, color: '#111827' }}>
                Psychological Profile & Coping Plan
              </h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.8rem', color: '#6B7280' }}>Assessment Date</span>
              <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827' }}>{analysisReport.date}</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '24px' }}>
            <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', textAlign: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>Calculated Stress Index</span>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>
                {analysisReport.computedStressScore} / 10
              </p>
            </div>

            <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', textAlign: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>Derived Confidence Score</span>
              <p style={{ fontSize: '28px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>
                {analysisReport.computedConfidence} / 10
              </p>
            </div>

            <div style={{ padding: '18px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', textAlign: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#6B7280' }}>Logged Emotional State</span>
              <p style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>
                {analysisReport.moodLabel}
              </p>
            </div>
          </div>

          {/* Primary Driver */}
          <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
            <strong style={{ fontSize: '0.9rem', color: '#111827', display: 'block', marginBottom: '4px' }}>
              Identified Primary Driver:
            </strong>
            <p style={{ fontSize: '15px', fontWeight: 700, color: '#111827' }}>
              {analysisReport.primaryDriver}
            </p>
          </div>

          {/* Coping Recommendations & Adaptive Pacing */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px' }}>
            
            <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                Recommended Actionable Coping Steps
              </h4>
              <ul style={{ paddingLeft: '20px', margin: 0, fontSize: '0.88rem', color: '#374151', lineHeight: 1.7 }}>
                {analysisReport.recommendations.map((rec, idx) => (
                  <li key={idx} style={{ marginBottom: '6px' }}>{rec}</li>
                ))}
              </ul>
            </div>

            <div style={{ padding: '20px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
                Adaptive Engine Pacing Directive
              </h4>
              <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.6 }}>
                {analysisReport.pacingDirective}
              </p>

              <button 
                onClick={() => setActiveTab && setActiveTab('dashboard')} 
                className="btn-primary-spec" 
                style={{ width: '100%', justifyContent: 'center', marginTop: '16px', padding: '10px' }}
              >
                Apply to Dashboard & Practice Hubs
              </button>
            </div>

          </div>

        </section>
      )}

    </div>
  );
}

