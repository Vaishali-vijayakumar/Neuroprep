import React, { useState, useEffect } from 'react';
import { analyzeThoughtText } from '../services/aiEngine';
import { dbService } from '../services/db';

// --------------------------------------------------
// EMOTION WHEEL DATA
// --------------------------------------------------
const EMOTION_WHEEL = [
  {
    category: 'Happy',
    color: '#F3F4F6',
    borderColor: '#111827',
    textColor: '#111827',
    subEmotions: ['Excited', 'Proud', 'Hopeful', 'Peaceful', 'Calm', 'Inspired']
  },
  {
    category: 'Sad',
    color: '#E5E7EB',
    borderColor: '#111827',
    textColor: '#111827',
    subEmotions: ['Lonely', 'Disappointed', 'Regretful', 'Empty', 'Hurt']
  },
  {
    category: 'Fear',
    color: '#F3F4F6',
    borderColor: '#111827',
    textColor: '#111827',
    subEmotions: ['Nervous', 'Anxious', 'Overwhelmed', 'Scared', 'Uncertain']
  },
  {
    category: 'Anger',
    color: '#F3F4F6',
    borderColor: '#111827',
    textColor: '#111827',
    subEmotions: ['Frustrated', 'Annoyed', 'Irritated', 'Jealous']
  }
];

const MOOD_OPTIONS = [
  { emoji: '😊', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '😐', label: 'Neutral' },
  { emoji: '😟', label: 'Worried' },
  { emoji: '😫', label: 'Stressed' },
  { emoji: '😢', label: 'Low' },
  { emoji: '😡', label: 'Frustrated' },
  { emoji: '😴', label: 'Exhausted' },
  { emoji: '😎', label: 'Confident' }
];

const GENTLE_PROMPTS = [
  "Today I spent most of my time...",
  "The biggest challenge I faced was...",
  "One thing I'm proud of today...",
  "Something that kept bothering me...",
  "Tomorrow I want to improve..."
];

const DEFAULT_WINS = [
  "Practiced coding",
  "Attended class",
  "Asked doubts",
  "Didn't give up",
  "Finished assignment"
];

const DEFAULT_TOMORROW_GOALS = [
  "Solve 2 coding problems",
  "Revise Java",
  "Mock Interview",
  "Aptitude",
  "Take a break",
  "Sleep early"
];

export default function ThoughtJournal({ 
  journalEntries = [], 
  onSaveEntry, 
  onDeleteEntry, 
  setActiveTab,
  userEmail = 'guest'
}) {
  const [currentTab, setCurrentTab] = useState('wizard'); // 'wizard' | 'history' | 'progress' | 'garden' | 'memories' | 'hope' | 'calm' | 'weekly'
  
  // Wizard State (Steps 1 to 9)
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedMoods, setSelectedMoods] = useState(['😌 Calm']);
  const [energyLevel, setEnergyLevel] = useState('Medium');
  const [journalTitle, setJournalTitle] = useState('');
  const [journalText, setJournalText] = useState('');
  const [selectedEmotions, setSelectedEmotions] = useState([]);
  const [category, setCategory] = useState('Coding & Technical');
  const [tagsInput, setTagsInput] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);

  // Reframing state
  const [reframeEvidenceFor, setReframeEvidenceFor] = useState('');
  const [reframeEvidenceAgainst, setReframeEvidenceAgainst] = useState('');
  const [reframeBestFriend, setReframeBestFriend] = useState('');
  const [reframeAlternative, setReframeAlternative] = useState('');
  const [customBalancedThought, setCustomBalancedThought] = useState('');

  // Wins, Gratitude, Tomorrow Plan
  const [selectedWins, setSelectedWins] = useState(['Didn\'t give up']);
  const [customWin, setCustomWin] = useState('');
  const [gratitudeText, setGratitudeText] = useState('');
  const [tomorrowGoals, setTomorrowGoals] = useState(['Solve 2 coding problems']);
  const [customGoal, setCustomGoal] = useState('');

  // Auxiliary Hub Data
  const [hopeNotes, setHopeNotes] = useState(() => dbService.getHopeNotesForUser(userEmail));
  const [drawnHopeNote, setDrawnHopeNote] = useState(null);
  const [positiveMemories, setPositiveMemories] = useState(() => dbService.getPositiveMemoriesForUser(userEmail));
  const [weeklyReflections, setWeeklyReflections] = useState(() => dbService.getWeeklyReflectionsForUser(userEmail));
  const [gardenStats, setGardenStats] = useState(() => dbService.getGardenStats(userEmail));

  // Breathing Box Timer state for Calm Corner
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('Inhale'); // Inhale, Hold, Exhale, Hold
  const [breathingCounter, setBreathingCounter] = useState(4);

  // Affirmations State
  const [affirmationIdx, setAffirmationIdx] = useState(0);
  const affirmations = [
    "I am growing more capable every single day.",
    "My effort builds placement readiness, step by small step.",
    "I am allowed to take breaks and rest my mind.",
    "One test or interview does not determine my worth or talent.",
    "I have overcome tough challenges before, and I will handle this too."
  ];

  // Weekly Reflection Form State
  const [weeklyForm, setWeeklyForm] = useState({
    wentWell: '', challenged: '', learned: '', proudOf: '', wantToImprove: ''
  });

  // Reload auxiliary data when entries change
  useEffect(() => {
    setGardenStats(dbService.getGardenStats(userEmail));
    setHopeNotes(dbService.getHopeNotesForUser(userEmail));
    setPositiveMemories(dbService.getPositiveMemoriesForUser(userEmail));
  }, [journalEntries, userEmail]);

  // Breathing timer interval
  useEffect(() => {
    let timer = null;
    if (breathingActive) {
      timer = setInterval(() => {
        setBreathingCounter((prev) => {
          if (prev <= 1) {
            setBreathingPhase((phase) => {
              if (phase === 'Inhale') return 'Hold (Full)';
              if (phase === 'Hold (Full)') return 'Exhale';
              if (phase === 'Exhale') return 'Hold (Empty)';
              return 'Inhale';
            });
            return 4;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setBreathingCounter(4);
      setBreathingPhase('Inhale');
    }
    return () => clearInterval(timer);
  }, [breathingActive]);

  // Handle Mood Multi-select
  const toggleMood = (label) => {
    if (selectedMoods.includes(label)) {
      if (selectedMoods.length > 1) {
        setSelectedMoods(selectedMoods.filter(m => m !== label));
      }
    } else {
      setSelectedMoods([...selectedMoods, label]);
    }
  };

  // Handle Sub-emotion Multi-select
  const toggleSubEmotion = (emotion) => {
    if (selectedEmotions.includes(emotion)) {
      setSelectedEmotions(selectedEmotions.filter(e => e !== emotion));
    } else {
      setSelectedEmotions([...selectedEmotions, emotion]);
    }
  };

  // Select Prompt
  const handleSelectPrompt = (prompt) => {
    if (!journalText.includes(prompt)) {
      setJournalText(prev => (prev ? `${prev}\n${prompt} ` : `${prompt} `));
    }
  };

  // Analyze & Move to Step 4
  const handleProceedToAnalysis = () => {
    if (!journalText.trim()) return;
    const res = analyzeThoughtText(journalText);
    setAnalysisResult(res);
    if (res.thinkingPattern?.balancedPerspective) {
      setCustomBalancedThought(res.thinkingPattern.balancedPerspective);
    }
    setWizardStep(4);
  };

  // Save Complete Entry at Step 8 / 9
  const handleSaveCompleteJournal = () => {
    const entryData = {
      id: Date.now(),
      title: journalTitle.trim() || `Journal Entry - ${new Date().toLocaleDateString()}`,
      content: journalText,
      moods: selectedMoods,
      energy: energyLevel,
      emotions: selectedEmotions,
      category,
      tags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
      wins: selectedWins,
      gratitude: gratitudeText.trim(),
      tomorrowGoals,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      analysis: analysisResult,
      reframing: {
        evidenceFor: reframeEvidenceFor,
        evidenceAgainst: reframeEvidenceAgainst,
        bestFriend: reframeBestFriend,
        alternative: reframeAlternative,
        balancedThought: customBalancedThought
      }
    };

    if (onSaveEntry) {
      onSaveEntry(entryData);
    }

    setWizardStep(9);
  };

  // Reset Wizard for New Journal
  const handleStartNewJournal = () => {
    setWizardStep(1);
    setJournalTitle('');
    setJournalText('');
    setSelectedEmotions([]);
    setAnalysisResult(null);
    setReframeEvidenceFor('');
    setReframeEvidenceAgainst('');
    setReframeBestFriend('');
    setReframeAlternative('');
    setCustomBalancedThought('');
    setSelectedWins(['Didn\'t give up']);
    setGratitudeText('');
    setTomorrowGoals(['Solve 2 coding problems']);
    setCurrentTab('wizard');
  };

  // Draw a Note of Hope from Hope Jar
  const handleDrawHopeNote = () => {
    if (!hopeNotes || hopeNotes.length === 0) return;
    const rand = hopeNotes[Math.floor(Math.random() * hopeNotes.length)];
    setDrawnHopeNote(rand);
  };

  // Save Weekly Reflection
  const handleSaveWeeklyReflection = (e) => {
    e.preventDefault();
    const updated = dbService.saveWeeklyReflectionForUser(weeklyForm, userEmail);
    setWeeklyReflections(updated);
    setWeeklyForm({ wentWell: '', challenged: '', learned: '', proudOf: '', wantToImprove: '' });
    alert("Weekly reflection saved successfully!");
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px', fontFamily: 'var(--font-inter)' }}>
      
      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          MAIN NAVIGATION HEADER & TAB STRIP
         â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>
            My Personal Placement Diary & Mood Enhancer
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#6B7280', marginTop: '4px', margin: 0 }}>
            A warm, compassionate space to write your daily diary, celebrate tiny wins, reframe doubts, and recharge your confidence.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => setActiveTab && setActiveTab('dashboard')} 
            className="btn-secondary-spec"
            style={{ padding: '10px 18px', fontSize: '0.88rem' }}
          >
            Back to Dashboard
          </button>
          <button 
            onClick={handleStartNewJournal}
            className="btn-primary-spec"
            style={{ padding: '10px 20px', fontSize: '0.9rem', borderRadius: '10px' }}
          >
            Write Diary Entry
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        overflowX: 'auto', 
        paddingBottom: '8px', 
        marginBottom: '28px',
        borderBottom: '1px solid #E5E7EB' 
      }}>
        {[
          { id: 'wizard', label: 'New Entry Flow' },
          { id: 'history', label: 'Journal History' },
          { id: 'progress', label: 'Your Journey' },
          { id: 'garden', label: 'Achievement Garden' },
          { id: 'memories', label: 'Positive Memory Bank' },
          { id: 'hope', label: 'Hope Jar' },
          { id: 'calm', label: 'Calm Corner' },
          { id: 'weekly', label: 'Weekly Reflection' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            style={{
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: currentTab === tab.id ? 700 : 500,
              backgroundColor: currentTab === tab.id ? '#E5E7EB' : '#F8F9FA',
              color: '#111827',
              border: currentTab === tab.id ? '1px solid #D1D5DB' : '1px solid #E5E7EB',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          TAB 1: GUIDED JOURNAL WRITING WIZARD (STEPS 1-9)
         â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {currentTab === 'wizard' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          
          {/* Wizard Progress Bar */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Step {wizardStep} of 9
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#111827' }}>
                {[
                  'Mood & Energy Check-in',
                  'Gentle Prompts',
                  'Journal & Emotion Selection',
                  'AI Reflection',
                  'Thought Reframing',
                  'Strengths & Wins',
                  'Gratitude Corner',
                  'Tomorrow\'s Small Plan',
                  'Entry Completed'
                ][wizardStep - 1]}
              </span>
            </div>
            <div style={{ height: '6px', backgroundColor: '#E5E7EB', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ 
                height: '100%', 
                width: `${(wizardStep / 9) * 100}%`, 
                backgroundColor: '#111827', 
                transition: 'width 0.3s ease' 
              }} />
            </div>
          </div>

          {/* STEP 1: WELCOME PAGE (MOOD & ENERGY CHECK-IN) */}
          {wizardStep === 1 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                How are you feeling today?
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '20px' }}>
                Selecting your emotions helps you feel understood before writing. (Select all that apply)
              </p>

              {/* ALL FEELINGS IN A SINGLE HORIZONTAL LINE */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'row',
                gap: '10px', 
                overflowX: 'auto', 
                paddingBottom: '12px', 
                marginBottom: '28px',
                scrollbarWidth: 'thin'
              }}>
                {MOOD_OPTIONS.map(m => {
                  const isSelected = selectedMoods.includes(`${m.emoji} ${m.label}`);
                  return (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => toggleMood(`${m.emoji} ${m.label}`)}
                      style={{
                        flex: '0 0 auto',
                        padding: '12px 18px',
                        borderRadius: '12px',
                        border: isSelected ? '2px solid #111827' : '1px solid #E5E7EB',
                        backgroundColor: isSelected ? '#F9FAFB' : '#FFFFFF',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'all 0.15s ease',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      <span style={{ fontSize: '1.4rem' }}>{m.emoji}</span>
                      <span style={{ fontSize: '0.88rem', fontWeight: isSelected ? 700 : 500, color: '#111827' }}>
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Energy Level Selection */}
              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>
                  What is your Energy Level right now?
                </label>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {[
                    { label: 'High', desc: 'Feeling energetic & ready' },
                    { label: 'Medium', desc: 'Balanced pace' },
                    { label: 'Low', desc: 'Tired or drained' }
                  ].map(e => (
                    <button
                      key={e.label}
                      type="button"
                      onClick={() => setEnergyLevel(e.label)}
                      style={{
                        flex: 1,
                        minWidth: '140px',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: energyLevel === e.label ? '2px solid #111827' : '1px solid #E5E7EB',
                        backgroundColor: energyLevel === e.label ? '#F3F4F6' : '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: '#111827' }}>{e.label}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6B7280', marginTop: '2px' }}>{e.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setWizardStep(2)}
                  className="btn-primary-spec"
                  style={{ padding: '12px 28px', fontSize: '0.9rem', borderRadius: '10px' }}
                >
                  Continue to Prompts
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: GENTLE PROMPTS PAGE */}
          {wizardStep === 2 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                Need help getting started?
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '24px' }}>
                Click any prompt below to add it directly to your entry. You can write as much or as little as you like.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '32px' }}>
                {GENTLE_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPrompt(prompt)}
                    style={{
                      padding: '16px 20px',
                      borderRadius: '12px',
                      backgroundColor: '#F9FAFB',
                      border: '1px solid #E5E7EB',
                      textAlign: 'left',
                      fontSize: '0.92rem',
                      fontWeight: 600,
                      color: '#111827',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <span>{prompt}</span>
                    <span style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 700 }}>+ Add Prompt</span>
                  </button>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={() => setWizardStep(1)}
                  className="btn-secondary-spec"
                  style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                >
                  Back
                </button>
                <button
                  onClick={() => setWizardStep(3)}
                  className="btn-primary-spec"
                  style={{ padding: '12px 28px', fontSize: '0.9rem', borderRadius: '10px' }}
                >
                  Start Writing
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: JOURNAL WRITING PAGE & EMOTION WHEEL */}
          {wizardStep === 3 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                Express Your Thoughts
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#6B7280', fontStyle: 'italic', marginBottom: '20px' }}>
                "Don't worry about grammar or perfect sentences. Write as if you're talking to yourself."
              </p>

              {/* Title & Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tough Binary Tree Problem / Mock Interview Reflection"
                    value={journalTitle}
                    onChange={(e) => setJournalTitle(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.9rem'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid #D1D5DB',
                      fontSize: '0.9rem',
                      backgroundColor: '#FFFFFF'
                    }}
                  >
                    <option value="Coding & Technical">Coding & Technical</option>
                    <option value="Mock Interview">Mock Interview</option>
                    <option value="Aptitude Practice">Aptitude Practice</option>
                    <option value="Peer & Placement Pressure">Peer & Placement Pressure</option>
                    <option value="Daily Academic Life">Daily Academic Life</option>
                  </select>
                </div>
              </div>

              {/* Journal Main Textarea */}
              <div style={{ marginBottom: '24px' }}>
                <textarea
                  rows={6}
                  placeholder="Write freely here... Mention what happened today, how you felt, or what's on your mind."
                  value={journalText}
                  onChange={(e) => setJournalText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.95rem',
                    lineHeight: 1.6,
                    outline: 'none',
                    fontFamily: 'inherit',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Emotion Wheel Sub-Emotions */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginBottom: '10px' }}>
                  Emotion Wheel — Identify specific feelings:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {EMOTION_WHEEL.map(cat => (
                    <div key={cat.category} style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: cat.color,
                      border: `1px solid ${cat.borderColor}`
                    }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: cat.textColor, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        {cat.category}
                      </span>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                        {cat.subEmotions.map(sub => {
                          const isSel = selectedEmotions.includes(sub);
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => toggleSubEmotion(sub)}
                              style={{
                                padding: '5px 12px',
                                borderRadius: '999px',
                                fontSize: '0.8rem',
                                fontWeight: isSel ? 700 : 500,
                                backgroundColor: isSel ? cat.textColor : '#FFFFFF',
                                color: isSel ? '#FFFFFF' : cat.textColor,
                                border: `1px solid ${cat.borderColor}`,
                                cursor: 'pointer'
                              }}
                            >
                              {sub}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={() => setWizardStep(2)}
                  className="btn-secondary-spec"
                  style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                >
                  Back
                </button>
                <button
                  disabled={!journalText.trim()}
                  onClick={handleProceedToAnalysis}
                  className="btn-primary-spec"
                  style={{ 
                    padding: '12px 28px', 
                    fontSize: '0.9rem', 
                    borderRadius: '10px',
                    opacity: journalText.trim() ? 1 : 0.5 
                  }}
                >
                  Analyze & Reflect
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: AI REFLECTION PAGE */}
          {wizardStep === 4 && analysisResult && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <span className="pill-tag" style={{ backgroundColor: '#F3F4F6', color: '#111827', border: '1px solid #E5E7EB' }}>
                  Supportive Reflection
                </span>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>
                  Emotional Balance: {analysisResult.emotionalBalance}
                </span>
              </div>

              {/* Here's What I Noticed (Validates Effort First) */}
              <div style={{
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                marginBottom: '24px'
              }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginTop: 0, marginBottom: '10px' }}>
                  Here's what I noticed
                </h3>
                <p style={{ fontSize: '0.95rem', color: '#374151', lineHeight: 1.6, margin: 0 }}>
                  {analysisResult.validation}
                </p>
              </div>

              {/* Gentle Thinking Pattern Summary */}
              {analysisResult.thinkingPattern && (
                <div style={{
                  padding: '20px',
                  borderRadius: '14px',
                  backgroundColor: '#F3F4F6',
                  border: '1px solid #111827',
                  marginBottom: '24px'
                }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
                    Thinking Pattern You Might Explore
                  </span>
                  <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', marginTop: '4px', marginBottom: '6px' }}>
                    {analysisResult.thinkingPattern.name}
                  </h4>
                  <p style={{ fontSize: '0.88rem', color: '#111827', margin: 0 }}>
                    {analysisResult.thinkingPattern.explanation}
                  </p>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={() => setWizardStep(3)}
                  className="btn-secondary-spec"
                  style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                >
                  Edit Journal Text
                </button>
                <button
                  onClick={() => setWizardStep(5)}
                  className="btn-primary-spec"
                  style={{ padding: '12px 28px', fontSize: '0.9rem', borderRadius: '10px' }}
                >
                  Explore Reframe
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: THOUGHT REFRAMING PAGE */}
          {wizardStep === 5 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                Reframe Thoughts
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '24px' }}>
                Would you like to look at this thought differently? Answering these 4 gentle questions helps build a balanced perspective.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '28px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    1. What evidence supports this worry?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. I struggled on the last test case..."
                    value={reframeEvidenceFor}
                    onChange={(e) => setReframeEvidenceFor(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    2. What evidence goes against it?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. I have solved 40+ LeetCode questions before..."
                    value={reframeEvidenceAgainst}
                    onChange={(e) => setReframeEvidenceAgainst(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    3. What would you tell your best friend?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Don't be too hard on yourself, one bad round is just practice."
                    value={reframeBestFriend}
                    onChange={(e) => setReframeBestFriend(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
                    4. Can there be another explanation?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. I was just tired today after late-night study."
                    value={reframeAlternative}
                    onChange={(e) => setReframeAlternative(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
                  />
                </div>

                {/* Final Balanced Thought */}
                <div style={{ marginTop: '10px', padding: '16px', borderRadius: '12px', backgroundColor: '#F3F4F6', border: '1px solid #111827' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                    Your Balanced Perspective
                  </label>
                  <textarea
                    rows={2}
                    value={customBalancedThought}
                    onChange={(e) => setCustomBalancedThought(e.target.value)}
                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.9rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={() => setWizardStep(4)}
                  className="btn-secondary-spec"
                  style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                >
                  Back
                </button>
                <button
                  onClick={() => setWizardStep(6)}
                  className="btn-primary-spec"
                  style={{ padding: '12px 28px', fontSize: '0.9rem', borderRadius: '10px' }}
                >
                  Select Strengths & Wins
                </button>
              </div>
            </div>
          )}

          {/* STEP 6: STRENGTH FINDER (TINY WINS) */}
          {wizardStep === 6 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                Things You Did Well Today
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '24px' }}>
                Even tiny wins matter during placement preparation. Select everything you accomplished:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {DEFAULT_WINS.map(win => {
                  const isChecked = selectedWins.includes(win);
                  return (
<button
                      key={win}
                      type="button"
                      onClick={() => {
                        if (isChecked) setSelectedWins(selectedWins.filter(w => w !== win));
                        else setSelectedWins([...selectedWins, win]);
                      }}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: isChecked ? '2px solid #111827' : '1px solid #E5E7EB',
                        backgroundColor: isChecked ? '#F3F4F6' : '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        fontWeight: isChecked ? 700 : 500,
                        color: isChecked ? '#111827' : '#374151'
                      }}
                    >
                      <span>{win}</span>
                    </button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
                <input
                  type="text"
                  placeholder="Add another tiny win..."
                  value={customWin}
                  onChange={(e) => setCustomWin(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customWin.trim()) {
                      setSelectedWins([...selectedWins, customWin.trim()]);
                      setCustomWin('');
                    }
                  }}
                  className="btn-secondary-spec"
                  style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                >
                  + Add Win
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={() => setWizardStep(5)}
                  className="btn-secondary-spec"
                  style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                >
                  Back
                </button>
                <button
                  onClick={() => setWizardStep(7)}
                  className="btn-primary-spec"
                  style={{ padding: '12px 28px', fontSize: '0.9rem', borderRadius: '10px' }}
                >
                  Gratitude Corner
                </button>
              </div>
            </div>
          )}

          {/* STEP 7: GRATITUDE CORNER */}
          {wizardStep === 7 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                Gratitude Corner
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '24px' }}>
                Optional: Take a quiet moment to write down one thing you are grateful for today.
              </p>

              <div style={{ marginBottom: '32px' }}>
                <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
                  Today I'm thankful for...
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. My study partner, supportive family, a warm cup of coffee, or a clear afternoon."
                  value={gratitudeText}
                  onChange={(e) => setGratitudeText(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '12px',
                    border: '1px solid #D1D5DB',
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={() => setWizardStep(6)}
                  className="btn-secondary-spec"
                  style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                >
                  Back
                </button>
                <button
                  onClick={() => setWizardStep(8)}
                  className="btn-primary-spec"
                  style={{ padding: '12px 28px', fontSize: '0.9rem', borderRadius: '10px' }}
                >
                  Tomorrow's Action Plan
                </button>
              </div>
            </div>
          )}

          {/* STEP 8: TOMORROW'S SMALL PLAN */}
          {wizardStep === 8 && (
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
                Tomorrow's Action Plan
              </h2>
              <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '24px' }}>
                Keep your journal action-oriented with 1-2 small focus items for tomorrow:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px', marginBottom: '24px' }}>
                {DEFAULT_TOMORROW_GOALS.map(goal => {
                  const isSel = tomorrowGoals.includes(goal);
                  return (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => {
                        if (isSel) setTomorrowGoals(tomorrowGoals.filter(g => g !== goal));
                        else setTomorrowGoals([...tomorrowGoals, goal]);
                      }}
                      style={{
                        padding: '14px 16px',
                        borderRadius: '12px',
                        border: isSel ? '2px solid #111827' : '1px solid #E5E7EB',
                        backgroundColor: isSel ? '#F3F4F6' : '#FFFFFF',
                        cursor: 'pointer',
                        textAlign: 'left',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        fontSize: '0.9rem',
                        fontWeight: isSel ? 700 : 500,
                        color: isSel ? '#111827' : '#374151'
                      }}
                    >
                      <span>{goal}</span>
                    </button>
                  );
                })}
              </div>

              {/* Custom Goal Input */}
              <div style={{ display: 'flex', gap: '10px', marginBottom: '32px' }}>
                <input
                  type="text"
                  placeholder="Add custom goal for tomorrow..."
                  value={customGoal}
                  onChange={(e) => setCustomGoal(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (customGoal.trim()) {
                      setTomorrowGoals([...tomorrowGoals, customGoal.trim()]);
                      setCustomGoal('');
                    }
                  }}
                  className="btn-secondary-spec"
                  style={{ padding: '10px 18px', fontSize: '0.85rem' }}
                >
                  + Add Goal
                </button>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button
                  onClick={() => setWizardStep(7)}
                  className="btn-secondary-spec"
                  style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                >
                  Back
                </button>
                <button
                  onClick={handleSaveCompleteJournal}
                  className="btn-primary-spec"
                  style={{ padding: '12px 32px', fontSize: '0.95rem', borderRadius: '10px', backgroundColor: '#475569', color: '#FFFFFF', border: 'none' }}
                >
                  Save Journal Entry
                </button>
              </div>
            </div>
          )}

          {/* STEP 9: END EVERY JOURNAL POSITIVELY (3-PART SUMMARY) */}
          {wizardStep === 9 && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
                Journal Entry Saved!
              </h2>
              <p style={{ fontSize: '0.95rem', color: '#4B5563', marginBottom: '28px' }}>
                You have grown your virtual garden and taken an important step toward mental clarity.
              </p>

              {/* 3-Part Summary Card */}
              <div style={{
                maxWidth: '680px',
                margin: '0 auto 32px auto',
                padding: '24px',
                borderRadius: '16px',
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                textAlign: 'left'
              }}>
                {/* 1. What you did today */}
                <div style={{ marginBottom: '18px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
                    1. What You Did Today
                  </span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827', marginTop: '4px', margin: 0 }}>
                    {analysisResult?.positiveConclusion?.whatYouDidToday || "You checked in with yourself and completed your daily journal reflection."}
                  </p>
                </div>

                {/* 2. What you might try tomorrow */}
                <div style={{ marginBottom: '18px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
                    2. What You Might Try Tomorrow
                  </span>
                  <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827', marginTop: '4px', margin: 0 }}>
                    {analysisResult?.positiveConclusion?.whatYouMightTryTomorrow || "Spend 20 minutes reviewing interview questions with a relaxed mindset."}
                  </p>
                </div>

                {/* 3. A gentle reminder */}
                <div style={{ padding: '14px', borderRadius: '10px', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
                    3. A Gentle Reminder
                  </span>
                  <p style={{ fontSize: '0.92rem', color: '#111827', fontStyle: 'italic', marginTop: '4px', margin: 0 }}>
                    "{analysisResult?.positiveConclusion?.gentleReminder || "Progress during placement preparation is built through many small efforts. Today's entry is one of them."}"
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setCurrentTab('history')}
                  className="btn-secondary-spec"
                  style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                >
                  View Journal History
                </button>
                <button
                  onClick={() => setCurrentTab('garden')}
                  className="btn-secondary-spec"
                  style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                >
                  Visit Achievement Garden
                </button>
                <button
                  onClick={handleStartNewJournal}
                  className="btn-primary-spec"
                  style={{ padding: '12px 24px', fontSize: '0.9rem' }}
                >
                  Write Another Entry
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          TAB 2: JOURNAL HISTORY CARDS
         â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {currentTab === 'history' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              Journal History ({journalEntries.length} entries)
            </h2>
          </div>

          {journalEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827' }}>No Journal Entries Yet</h3>
              <p style={{ fontSize: '0.9rem', color: '#6B7280', marginBottom: '18px' }}>Start your first entry to see your progress history here.</p>
              <button onClick={handleStartNewJournal} className="btn-primary-spec" style={{ padding: '10px 20px' }}>
                Start First Entry
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {journalEntries.map(entry => (
                <div key={entry.id} style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '16px',
                  border: '1px solid #E5E7EB',
                  padding: '20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between'
                }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>
                        {entry.date} • {entry.time || ''}
                      </span>
                      <span style={{ fontSize: '0.8rem', padding: '4px 10px', borderRadius: '999px', backgroundColor: '#F3F4F6', color: '#111827', fontWeight: 700 }}>
                        {entry.moods?.[0] || '😌 Calm'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', marginTop: 0, marginBottom: '6px' }}>
                      {entry.title}
                    </h3>

                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
                      Category: {entry.category || 'General'}
                    </span>

                    <p style={{ fontSize: '0.88rem', color: '#374151', lineHeight: 1.5, margin: 0, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {entry.content}
                    </p>

                    {entry.reframing?.balancedThought && (
                      <div style={{ marginTop: '12px', padding: '10px', borderRadius: '8px', backgroundColor: '#F3F4F6', fontSize: '0.8rem', color: '#111827', fontWeight: 600 }}>
                        <strong>Reframe:</strong> "{entry.reframing.balancedThought}"
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '16px', pt: '12px', borderTop: '1px solid #F3F4F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#6B7280' }}>
                      {entry.emotions?.join(', ') || 'Reflection'}
                    </span>
                    <button
                      onClick={() => onDeleteEntry && onDeleteEntry(entry.id)}
                      style={{ background: 'none', border: 'none', color: '#111827', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          TAB 3: PROGRESS DASHBOARD ("YOUR JOURNEY")
         â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {currentTab === 'progress' && (
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '16px' }}>
            Your Journey
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>
                {journalEntries.length} days
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '2px' }}>Total journaling consistency</div>
            </div>

            <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>
                {Math.min(journalEntries.length, 7)} recurring
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '2px' }}>Worries identified & reframed</div>
            </div>

            <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>
                Reduced
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '2px' }}>Stress levels over past month</div>
            </div>

            <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>
                +32%
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '2px' }}>Confidence mentions increased</div>
            </div>

            <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827' }}>
                {positiveMemories.length} wins
              </div>
              <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '2px' }}>Personal achievements recorded</div>
            </div>
          </div>

          {/* AI Encouragement Box (Item 14) */}
          <div style={{
            padding: '24px',
            borderRadius: '16px',
            backgroundColor: '#F3F4F6',
            border: '1px solid #E5E7EB'
          }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
              AI Encouragement
            </span>
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#111827', marginTop: '6px', lineHeight: 1.6, margin: 0 }}>
              "You've written for multiple sessions during your placement preparation. Building consistency during campus recruitment takes real dedication. Every reflection helps clarify your strengths."
            </p>
          </div>
        </div>
      )}

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          TAB 4: ACHIEVEMENT GARDEN
         â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {currentTab === 'garden' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '32px', textAlign: 'center' }}>
          <span className="pill-tag" style={{ backgroundColor: '#F3F4F6', color: '#111827', border: '1px solid #E5E7EB', marginBottom: '12px' }}>
            Achievement Garden
          </span>

          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', marginBottom: '6px', marginTop: '12px' }}>
            {gardenStats.stageName}
          </h2>
          <p style={{ fontSize: '0.95rem', color: '#4B5563', maxWidth: '500px', margin: '0 auto 24px auto' }}>
            Every journal entry provides nutrients to your garden. Consistent journaling nurtures virtual trees and flowers as an emotional reward for taking care of your mind.
          </p>

          <div style={{
            maxWidth: '400px',
            margin: '0 auto 32px auto',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 700, color: '#374151', marginBottom: '8px' }}>
              <span>Entries Logged: {gardenStats.count}</span>
              <span>Next Growth Stage: {gardenStats.nextMilestone} entries</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#E5E7EB', borderRadius: '999px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${Math.min(100, (gardenStats.count / gardenStats.nextMilestone) * 100)}%`, backgroundColor: '#111827' }} />
            </div>
          </div>

          {/* Garden Plot Grid */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            {['Seedling', 'Sprout', 'Oak Tree', 'Blossom Tree', 'Full Garden Bloom'].map((item, idx) => (
              <div key={idx} style={{
                padding: '16px 20px',
                borderRadius: '14px',
                backgroundColor: gardenStats.count >= (idx * 3) ? '#F3F4F6' : '#F9FAFB',
                border: gardenStats.count >= (idx * 3) ? '2px solid #111827' : '1px solid #E5E7EB',
                opacity: gardenStats.count >= (idx * 3) ? 1 : 0.4
              }}>
                <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827' }}>{item}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          TAB 5: POSITIVE MEMORY BANK
         â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {currentTab === 'memories' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', margin: 0 }}>
              Positive Memory Bank
            </h2>
            <p style={{ fontSize: '0.88rem', color: '#6B7280', marginTop: '4px' }}>
              Automatically saved achievements and breakthroughs to revisit whenever you need a boost in confidence.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {positiveMemories.map(mem => (
              <div key={mem.id} style={{
                padding: '20px',
                borderRadius: '16px',
                backgroundColor: '#FFFFFF',
                border: '1px solid #E5E7EB',
                boxShadow: '0 2px 10px rgba(0,0,0,0.03)'
              }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827', textTransform: 'uppercase' }}>
                  {mem.category || 'Achievement'} • {mem.date}
                </span>
                <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#111827', marginTop: '8px', lineHeight: 1.5, margin: 0 }}>
                  "{mem.text}"
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          TAB 6: HOPE JAR
         â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {currentTab === 'hope' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '32px', textAlign: 'center' }}>
          <span className="pill-tag" style={{ backgroundColor: '#F3F4F6', color: '#111827', border: '1px solid #111827', marginBottom: '12px' }}>
            Hope Jar
          </span>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
            Your Notes of Hope
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#4B5563', maxWidth: '500px', margin: '0 auto 24px auto' }}>
            On difficult days, draw a note of hope written by your past self or stored from your previous reflections.
          </p>

          <button
            onClick={handleDrawHopeNote}
            className="btn-primary-spec"
            style={{ padding: '14px 28px', fontSize: '0.95rem', borderRadius: '12px', backgroundColor: '#475569', color: '#FFFFFF', border: 'none', marginBottom: '28px' }}>
            Draw a Note of Hope
          </button>

          {drawnHopeNote && (
            <div style={{
              maxWidth: '500px',
              margin: '0 auto 32px auto',
              padding: '24px',
              borderRadius: '16px',
              backgroundColor: '#F3F4F6',
              border: '2px dashed #111827',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#111827', textTransform: 'uppercase' }}>
                Note Drawn from Hope Jar
              </span>
              <p style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginTop: '8px', lineHeight: 1.5, fontStyle: 'italic', margin: 0 }}>
                "{drawnHopeNote.text}"
              </p>
            </div>
          )}

          <div style={{ textAlign: 'left', maxWidth: '600px', margin: '0 auto' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#111827', marginBottom: '12px' }}>
              Saved Hope Notes ({hopeNotes.length}):
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {hopeNotes.map(n => (
                <div key={n.id} style={{ padding: '10px 14px', borderRadius: '8px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', fontSize: '0.88rem', color: '#374151' }}>
                  "{n.text}"
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          TAB 7: CALM CORNER
         â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {currentTab === 'calm' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '32px' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
              Calm Corner
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '24px' }}>
              Visit anytime you need a quick reset, breathing space, grounding, or relaxing stretch during placement preparation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* 1. 2-Minute Box Breathing Exercise */}
              <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginTop: 0, marginBottom: '6px' }}>
                  2-Minute Box Breathing
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#111827', marginBottom: '16px' }}>
                  Inhale (4s) → Hold (4s) → Exhale (4s) → Hold (4s)
                </p>

                <div style={{
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 16px auto',
                  borderRadius: '50%',
                  backgroundColor: '#F3F4F6',
                  border: '4px solid #111827',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.8s ease',
                  transform: breathingPhase.startsWith('Inhale') ? 'scale(1.15)' : 'scale(1.0)'
                }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827' }}>{breathingCounter}s</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#111827' }}>{breathingPhase}</span>
                </div>

                <button
                  onClick={() => setBreathingActive(!breathingActive)}
                  className="btn-primary-spec"
                  style={{ padding: '8px 20px', fontSize: '0.85rem', backgroundColor: '#475569', color: '#FFFFFF', border: 'none' }}
                >
                  {breathingActive ? 'Pause Exercise' : 'Start Breathing'}
                </button>
              </div>

              {/* 2. Positive Affirmations */}
              <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginTop: 0, marginBottom: '8px' }}>
                    Positive Affirmations
                  </h3>
                  <p style={{ fontSize: '0.98rem', fontWeight: 700, color: '#111827', fontStyle: 'italic', lineHeight: 1.5, margin: '16px 0' }}>
                    "{affirmations[affirmationIdx]}"
                  </p>
                </div>
                <button
                  onClick={() => setAffirmationIdx((affirmationIdx + 1) % affirmations.length)}
                  className="btn-secondary-spec"
                  style={{ padding: '8px 16px', fontSize: '0.85rem' }}
                >
                  Next Affirmation
                </button>
              </div>

              {/* 3. 5-4-3-2-1 Grounding Technique */}
              <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#F3F4F6', border: '1px solid #111827' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginTop: 0, marginBottom: '6px' }}>
                  5-4-3-2-1 Grounding Technique
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#111827', marginBottom: '12px' }}>
                  Anchor your mind in the present moment:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#111827' }}>
                  <div>5 things you can see around you</div>
                  <div>4 things you can physically feel</div>
                  <div>3 things you hear right now</div>
                  <div>2 things you can smell</div>
                  <div>1 thing you can taste</div>
                </div>
              </div>

              {/* 4. Relaxing Stretch & Break Reminder */}
              <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#F3F4F6', border: '1px solid #E5E7EB' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginTop: 0, marginBottom: '6px' }}>
                  Gentle Stretch Reminder
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#111827', lineHeight: 1.5, marginBottom: '12px' }}>
                  Roll your shoulders back 3 times. Unclench your jaw. Relax your forehead. Take a deep drink of water.
                </p>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827' }}>
                  You are doing great.
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
          TAB 8: WEEKLY REFLECTION
         â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {currentTab === 'weekly' && (
        <div style={{ backgroundColor: '#FFFFFF', borderRadius: '20px', border: '1px solid #E5E7EB', padding: '32px' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
            Weekly Reflection
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#4B5563', marginBottom: '24px' }}>
            Every Sunday or end of week: No AI scores, just a quiet reflection on your progress.
          </p>

          <form onSubmit={handleSaveWeeklyReflection} style={{ display: 'flex', flexDirection: 'column', gap: '18px', maxWidth: '700px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                1. What went well this week?
              </label>
              <textarea
                rows={2}
                value={weeklyForm.wentWell}
                onChange={(e) => setWeeklyForm({ ...weeklyForm, wentWell: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                2. What challenged you?
              </label>
              <textarea
                rows={2}
                value={weeklyForm.challenged}
                onChange={(e) => setWeeklyForm({ ...weeklyForm, challenged: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                3. What did you learn?
              </label>
              <textarea
                rows={2}
                value={weeklyForm.learned}
                onChange={(e) => setWeeklyForm({ ...weeklyForm, learned: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                4. What are you proud of?
              </label>
              <textarea
                rows={2}
                value={weeklyForm.proudOf}
                onChange={(e) => setWeeklyForm({ ...weeklyForm, proudOf: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.88rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
                5. What do you want to improve next week?
              </label>
              <textarea
                rows={2}
                value={weeklyForm.wantToImprove}
                onChange={(e) => setWeeklyForm({ ...weeklyForm, wantToImprove: e.target.value })}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.9rem' }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary-spec"
              style={{ padding: '12px 28px', fontSize: '0.9rem', borderRadius: '10px', alignSelf: 'flex-start' }}
            >
              Save Weekly Reflection
            </button>
          </form>

          {/* Past Reflections */}
          {weeklyReflections.length > 0 && (
            <div style={{ marginTop: '40px', pt: '24px', borderTop: '1px solid #E5E7EB' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#111827', marginBottom: '14px' }}>
                Past Weekly Reflections ({weeklyReflections.length}):
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {weeklyReflections.map(r => (
                  <div key={r.id} style={{ padding: '16px', borderRadius: '12px', backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB' }}>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#6B7280' }}>Reflected on {r.date}</span>
                    {r.wentWell && <div style={{ fontSize: '0.88rem', color: '#111827', marginTop: '4px' }}><strong>Went well:</strong> {r.wentWell}</div>}
                    {r.proudOf && <div style={{ fontSize: '0.88rem', color: '#111827', marginTop: '2px' }}><strong>Proud of:</strong> {r.proudOf}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

