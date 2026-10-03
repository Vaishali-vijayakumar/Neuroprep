import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../services/db';
import { CognitiveEmotionalRAGEngine } from './neroprep/engines/CognitiveEmotionalRAGEngine';

function formatMessageText(text) {
  if (!text) return '';
  const lines = text.split('\n');
  return lines.map((line, lIdx) => {
    const parts = line.split(/(\*\*.*?\*\*)/g);
    return (
      <React.Fragment key={lIdx}>
        {parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx} style={{ fontWeight: 800, color: 'inherit' }}>{part.slice(2, -2)}</strong>;
          }
          return part;
        })}
        {lIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
}

const MOOD_OPTIONS = [
  'Calm',
  'Confident',
  'Motivated',
  'Neutral',
  'Anxious',
  'Tired',
  'Frustrated',
  'Overwhelmed'
];

const SUGGESTED_TODOS = [
  'Solve 2 Tree/Graph problems',
  'Revise OS & DBMS fundamentals',
  'Practice 15-min Mock HR Intro',
  'Complete 1 Aptitude Test',
  'Take a 20-min break & walk'
];

export default function ThoughtJournal({ 
  journalEntries = [], 
  onSaveEntry, 
  onDeleteEntry, 
  onClearAllEntries,
  setActiveTab,
  userEmail = 'guest'
}) {
  const [currentTab, setCurrentTab] = useState('write'); // 'write' | 'chat' | 'history' | 'garden' | 'hope' | 'calm'

  // ----------------------------------------------------
  // DAILY DIARY WRITING STATE
  // ----------------------------------------------------
  const [diaryMood, setDiaryMood] = useState('Calm');
  const [diaryTitle, setDiaryTitle] = useState('');
  const [diaryContent, setDiaryContent] = useState('');
  const [diaryTakeaway, setDiaryTakeaway] = useState('');
  const [todoList, setTodoList] = useState([
    { id: 1, text: 'Solve 2 DSA questions', completed: false },
    { id: 2, text: 'Revise core CS concepts', completed: false }
  ]);
  const [newTodoInput, setNewTodoInput] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState(false);

  // ----------------------------------------------------
  // CONVERSATIONAL AI COMPANION (CHATBOT) STATE
  // ----------------------------------------------------
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hey friend! I'm NeuroCoach, your personal placement companion. How did your day and prep go today? Tell me what's on your mind — any coding breakthroughs, interview questions, doubts, or how you're feeling!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState([
    'Solved a tricky DSA problem today!',
    'Feeling anxious about upcoming placement rounds',
    'Struggled with a technical concept and felt stuck',
    'Comparing myself with batchmates who got offers',
    'Feeling exhausted from preparation, need to reset'
  ]);
  const [copiedId, setCopiedId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (currentTab === 'chat') {
      scrollToBottom();
    }
  }, [chatMessages, isBotTyping, currentTab]);

  // ----------------------------------------------------
  // AUXILIARY HUB DATA
  // ----------------------------------------------------
  const [hopeNotes, setHopeNotes] = useState(() => dbService.getHopeNotesForUser(userEmail));
  const [drawnHopeNote, setDrawnHopeNote] = useState(null);
  const [isDrawingHope, setIsDrawingHope] = useState(false);
  const [gardenStats, setGardenStats] = useState(() => dbService.getGardenStats(userEmail));

  // Mario Botanical Garden State & Power-Ups
  const [marioCoins, setMarioCoins] = useState(() => (gardenStats?.count || 1) * 100 + 50);
  const [previewGardenStage, setPreviewGardenStage] = useState(null); // null (use real) or 0..4
  const [blockBounce, setBlockBounce] = useState(false);
  const [flyingCoin, setFlyingCoin] = useState(false);
  const [isWatering, setIsWatering] = useState(false);
  const [isStarPower, setIsStarPower] = useState(false);
  const [isMushroomBoost, setIsMushroomBoost] = useState(false);

  const handleHitMarioBlock = () => {
    if (blockBounce) return;
    setBlockBounce(true);
    setFlyingCoin(true);
    setMarioCoins(prev => prev + 100);
    setTimeout(() => setBlockBounce(false), 500);
    setTimeout(() => setFlyingCoin(false), 900);
  };

  const handleWaterBeanstalk = () => {
    setIsWatering(true);
    setTimeout(() => setIsWatering(false), 2200);
  };

  const handleFeed1UpMushroom = () => {
    setIsMushroomBoost(true);
    setMarioCoins(prev => prev + 200);
    setTimeout(() => setIsMushroomBoost(false), 2500);
  };

  const handleTriggerStarPower = () => {
    setIsStarPower(true);
    setTimeout(() => setIsStarPower(false), 4500);
  };

  // Breathing Box Timer state for Calm Corner
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('Inhale');
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

  // Reload auxiliary data when entries change
  useEffect(() => {
    setGardenStats(dbService.getGardenStats(userEmail));
    setHopeNotes(dbService.getHopeNotesForUser(userEmail));
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
              // Completed 1 full 4-4-4-4 cycle: award intrinsic Mario coins
              setMarioCoins((c) => c + 50);
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

  // ----------------------------------------------------
  // TO-DO LIST HANDLERS
  // ----------------------------------------------------
  const handleToggleTodo = (id) => {
    setTodoList(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddTodo = (textToAdd) => {
    const text = (textToAdd || newTodoInput).trim();
    if (!text) return;
    setTodoList(prev => [...prev, { id: Date.now(), text, completed: false }]);
    if (!textToAdd) setNewTodoInput('');
  };

  const handleDeleteTodo = (id) => {
    setTodoList(prev => prev.filter(t => t.id !== id));
  };

  // ----------------------------------------------------
  // SAVE DIARY ENTRY HANDLER
  // ----------------------------------------------------
  const handleSaveDiaryEntry = (e) => {
    if (e) e.preventDefault();
    if (!diaryContent.trim() && !diaryTitle.trim() && todoList.length === 0) {
      alert('Please enter your thoughts, title, or to-do items before saving.');
      return;
    }

    const title = diaryTitle.trim() || `Reflection for ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    const content = diaryContent.trim() || 'Logged daily placement to-do list and progress.';

    const newEntry = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: title,
      content: content,
      moods: [diaryMood],
      todos: todoList,
      takeaway: diaryTakeaway.trim(),
      emotions: [diaryMood]
    };

    if (onSaveEntry) {
      onSaveEntry(newEntry);
    }

    // Intrinsic Reward: +50 coins for mindful reflection, especially during overwhelm/rest
    setMarioCoins(prev => prev + 50);

    setSaveSuccessMsg(true);
    setTimeout(() => setSaveSuccessMsg(false), 3500);

    // Reset fields cleanly
    setDiaryTitle('');
    setDiaryContent('');
    setDiaryTakeaway('');
  };

  // ----------------------------------------------------
  // CHATBOT HANDLERS
  // ----------------------------------------------------
  const handleSendChatMessage = async (presetText) => {
    const message = presetText || chatInput;
    if (!message || !message.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: message.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...chatMessages, userMessage];
    setChatMessages(updatedMessages);
    if (!presetText) setChatInput('');
    setIsBotTyping(true);

    try {
      const botResponse = await CognitiveEmotionalRAGEngine.generateChatbotResponseAsync(message, updatedMessages);
      const botMsgId = Date.now() + 1;
      const fullText = botResponse.text || '';

      // Initialize empty bot message to stream into
      const botMsg = {
        id: botMsgId,
        sender: 'bot',
        text: '',
        actionTrigger: botResponse.actionTrigger,
        crisisTriggered: botResponse.crisisTriggered,
        cbtDistortion: botResponse.cbtDistortion,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, botMsg]);
      setIsBotTyping(false);

      // Progressive token streaming for low perceived latency during emotional distress
      const words = fullText.split(' ');
      let currentIdx = 0;
      const chunkSize = Math.max(2, Math.floor(words.length / 14));
      const streamTimer = setInterval(() => {
        currentIdx += chunkSize;
        if (currentIdx >= words.length) {
          clearInterval(streamTimer);
          setChatMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: fullText } : m));
          if (botResponse.suggestedPrompts && botResponse.suggestedPrompts.length > 0) {
            setSuggestedPrompts(botResponse.suggestedPrompts);
          }
        } else {
          const partial = words.slice(0, currentIdx).join(' ');
          setChatMessages(prev => prev.map(m => m.id === botMsgId ? { ...m, text: partial } : m));
        }
      }, 30);

    } catch (e) {
      const botFallback = CognitiveEmotionalRAGEngine.generateChatbotResponse(message, updatedMessages);
      setChatMessages(prev => [...prev, {
        id: Date.now() + 1,
        sender: 'bot',
        text: botFallback.text,
        actionTrigger: botFallback.actionTrigger,
        crisisTriggered: botFallback.crisisTriggered,
        cbtDistortion: botFallback.cbtDistortion,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      if (botFallback.suggestedPrompts && botFallback.suggestedPrompts.length > 0) {
        setSuggestedPrompts(botFallback.suggestedPrompts);
      }
      setIsBotTyping(false);
    }
  };

  const handleCopyMessage = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRegenerateLastResponse = async () => {
    const lastUserMsg = [...chatMessages].reverse().find(m => m.sender === 'user');
    if (!lastUserMsg) return;
    setIsBotTyping(true);

    try {
      const botResponse = await CognitiveEmotionalRAGEngine.generateChatbotResponseAsync(lastUserMsg.text, chatMessages);
      const botMsg = {
        id: Date.now(),
        sender: 'bot',
        text: botResponse.text,
        actionTrigger: botResponse.actionTrigger,
        crisisTriggered: botResponse.crisisTriggered,
        cbtDistortion: botResponse.cbtDistortion,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev.slice(0, -1), botMsg]);
      if (botResponse.suggestedPrompts && botResponse.suggestedPrompts.length > 0) {
        setSuggestedPrompts(botResponse.suggestedPrompts);
      }
    } catch (e) {
      const botFallback = CognitiveEmotionalRAGEngine.generateChatbotResponse(lastUserMsg.text, chatMessages);
      setChatMessages(prev => [...prev.slice(0, -1), {
        id: Date.now(),
        sender: 'bot',
        text: botFallback.text,
        actionTrigger: botFallback.actionTrigger,
        crisisTriggered: botFallback.crisisTriggered,
        cbtDistortion: botFallback.cbtDistortion,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      if (botFallback.suggestedPrompts && botFallback.suggestedPrompts.length > 0) {
        setSuggestedPrompts(botFallback.suggestedPrompts);
      }
    } finally {
      setIsBotTyping(false);
    }
  };

  const handleResetChatbot = () => {
    setChatMessages([
      {
        id: 1,
        sender: 'bot',
        text: "Hey friend! I'm NeuroCoach, your personal placement companion. How did your day and prep go today? Tell me what's on your mind — any coding breakthroughs, interview questions, doubts, or how you're feeling!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleDrawHopeNote = () => {
    if (!hopeNotes || hopeNotes.length === 0) return;
    const randomNote = hopeNotes[Math.floor(Math.random() * hopeNotes.length)];
    setDrawnHopeNote(randomNote);
  };

  const completedTodosCount = todoList.filter(t => t.completed).length;

  const card3DStyle = {
    background: 'linear-gradient(168deg, rgba(254, 252, 250, 0.96) 0%, rgba(249, 245, 241, 0.92) 55%, rgba(244, 238, 232, 0.92) 100%)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid #D8D2CE',
    boxShadow: '0 2px 4px rgba(52, 52, 58, 0.03), 0 8px 24px -4px rgba(52, 52, 58, 0.07), 0 20px 36px -8px rgba(82, 98, 87, 0.1), inset 0 1px 1px 0 rgba(255, 255, 255, 0.9), inset 0 -1px 2px 0 rgba(216, 210, 206, 0.4)'
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px', fontFamily: 'var(--font-main)' }}>
      
      {/* Top Back Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab && setActiveTab('dashboard')}
          className="btn-back-dashboard"
          style={{ padding: '8px 18px', fontSize: '0.88rem', cursor: 'pointer', fontWeight: 600 }}
        >
          Back to Dashboard
        </button>
      </div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#89878A', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Daily Placement Journal & Planner
          </span>
          <h1 style={{ fontSize: '1.9rem', fontWeight: 800, color: '#34343A', margin: '4px 0 0 0' }}>
            My Placement Diary
          </h1>
          <p style={{ fontSize: '0.94rem', color: '#66666B', margin: '4px 0 0 0' }}>
            Write your thoughts, track your daily preparation checklist, and talk with your AI companion.
          </p>
        </div>
      </div>

      {/* Navigation Sub-Tabs with 3D Embossed Effect */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        overflowX: 'auto', 
        paddingBottom: '10px', 
        marginBottom: '28px',
        borderBottom: '1px solid #D8D2CE' 
      }}>
        {[
          { id: 'write', label: 'Write Daily Diary' },
          { id: 'chat', label: 'NeuroCoach AI Companion' },
          { id: 'history', label: `Journal History (${journalEntries.length})` },
          { id: 'garden', label: 'Achievement Garden' },
          { id: 'hope', label: 'Hope Jar' },
          { id: 'calm', label: 'Calm Corner' }
        ].map(tab => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              style={{
                padding: '10px 18px',
                borderRadius: '12px',
                fontSize: '0.88rem',
                fontWeight: isActive ? 700 : 600,
                backgroundColor: isActive ? '#526257' : '#FCF9F6',
                color: isActive ? '#FFFFFF' : '#4F5056',
                border: isActive ? '1px solid #415046' : '1px solid #D8D2CE',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
                boxShadow: isActive 
                  ? '0 3px 0 #3b473f, 0 6px 14px rgba(82, 98, 87, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)' 
                  : '0 2px 0 rgba(216, 210, 206, 0.8), 0 3px 8px rgba(52, 52, 58, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                transform: isActive ? 'translateY(-1px)' : 'none'
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ──────────────────────────────────────────────
          TAB 1: DEDICATED DIARY WRITING & ACTION PLAN
          ────────────────────────────────────────────── */}
      {currentTab === 'write' && (
        <div>
          {saveSuccessMsg && (
            <div style={{
              ...card3DStyle,
              padding: '16px 20px',
              border: '1px solid #68705F',
              color: '#68705F',
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontWeight: 700,
              fontSize: '0.9rem'
            }}>
              <span>Daily Diary Entry & To-Do List saved successfully to your Journal History!</span>
              <button
                type="button"
                onClick={() => setCurrentTab('history')}
                className="btn-primary-spec"
                style={{
                  padding: '6px 14px',
                  fontSize: '0.8rem'
                }}
              >
                View History
              </button>
            </div>
          )}

          <form onSubmit={handleSaveDiaryEntry} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* Top Row: Date & Mood Picker */}
            <div style={{
              ...card3DStyle,
              padding: '22px 26px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#89878A', textTransform: 'uppercase' }}>
                  1. How are you feeling today?
                </span>
                <span style={{ fontSize: '0.8rem', color: '#89878A', fontWeight: 600 }}>
                  Today • {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {MOOD_OPTIONS.map(mood => {
                  const isSelected = diaryMood === mood;
                  return (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => setDiaryMood(mood)}
                      style={{
                        padding: '8px 18px',
                        borderRadius: '999px',
                        fontSize: '0.85rem',
                        fontWeight: isSelected ? 700 : 600,
                        backgroundColor: isSelected ? '#526257' : '#FCF9F6',
                        color: isSelected ? '#F7F3EE' : '#4F5056',
                        border: isSelected ? '1px solid #415046' : '1px solid #D8D2CE',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        boxShadow: isSelected 
                          ? '0 2px 0 #3b473f, 0 4px 10px rgba(82, 98, 87, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)' 
                          : '0 2px 0 rgba(216, 210, 206, 0.7), 0 2px 5px rgba(52, 52, 58, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                      }}
                    >
                      {mood}
                    </button>
                  );
                })}
              </div>

              {['Anxious', 'Tired', 'Frustrated', 'Overwhelmed'].includes(diaryMood) && (
                <div style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#F0FDF4',
                  border: '1px solid #BBF7D0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '0.84rem',
                  color: '#166534',
                  fontWeight: 600,
                  boxShadow: '0 2px 6px rgba(22, 101, 52, 0.06)'
                }}>
                  <div>
                    <strong style={{ display: 'block', color: '#14532D', fontSize: '0.86rem' }}>
                      Rest & Streak Protection Active
                    </strong>
                    Rest and decompression are essential parts of interview performance. Logging honest fatigue protects your garden streak, prevents wilting, and awards +50 self-care seeds upon saving.
                  </div>
                </div>
              )}
            </div>

            {/* Entry Title */}
            <div style={{
              ...card3DStyle,
              padding: '22px 26px'
            }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#89878A', textTransform: 'uppercase', marginBottom: '10px' }}>
                2. Diary Title (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Tough Tree Problem / Pre-Interview Reflection / Day 14 Placement Grind"
                value={diaryTitle}
                onChange={(e) => setDiaryTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #D8D2CE',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  color: '#34343A',
                  outline: 'none',
                  backgroundColor: '#FCF9F6',
                  boxShadow: 'inset 0 2px 4px rgba(52, 52, 58, 0.04), 0 1px 0 rgba(255, 255, 255, 0.8)'
                }}
              />
            </div>

            {/* Thoughts & Feelings Freeform Textarea */}
            <div style={{
              ...card3DStyle,
              padding: '22px 26px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#89878A', textTransform: 'uppercase' }}>
                  3. Today's Thoughts & Personal Feelings
                </label>
                <span style={{ fontSize: '0.78rem', color: '#89878A' }}>
                  {diaryContent.length} characters
                </span>
              </div>
              <textarea
                rows={6}
                placeholder="Write freely about your day — what concepts you practiced, what made you feel happy or stressed, interview thoughts, or what you learned today..."
                value={diaryContent}
                onChange={(e) => setDiaryContent(e.target.value)}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  border: '1px solid #D8D2CE',
                  fontSize: '0.92rem',
                  lineHeight: 1.65,
                  color: '#34343A',
                  outline: 'none',
                  resize: 'vertical',
                  backgroundColor: '#FCF9F6',
                  boxShadow: 'inset 0 2px 4px rgba(52, 52, 58, 0.04), 0 1px 0 rgba(255, 255, 255, 0.8)'
                }}
              />
            </div>

            {/* Placement To-Do List & Action Checklist */}
            <div style={{
              ...card3DStyle,
              padding: '22px 26px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#89878A', textTransform: 'uppercase' }}>
                    4. Placement Daily To-Do List & Goals
                  </span>
                  <p style={{ fontSize: '0.85rem', color: '#66666B', margin: '2px 0 0 0' }}>
                    Track tasks you planned or completed today.
                  </p>
                </div>
                {todoList.length > 0 && (
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '5px 14px',
                    borderRadius: '999px',
                    backgroundColor: completedTodosCount === todoList.length && todoList.length > 0 ? '#EAECE8' : '#FCF9F6',
                    color: completedTodosCount === todoList.length && todoList.length > 0 ? '#68705F' : '#4F5056',
                    border: '1px solid #D8D2CE',
                    boxShadow: '0 2px 4px rgba(52, 52, 58, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)'
                  }}>
                    {completedTodosCount} of {todoList.length} Completed
                  </span>
                )}
              </div>

              {/* Task Items List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                {todoList.map((todo) => (
                  <div
                    key={todo.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      backgroundColor: todo.completed ? '#F5EBE6' : '#FCF9F6',
                      border: '1px solid #D8D2CE',
                      boxShadow: '0 2px 5px rgba(52, 52, 58, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleToggleTodo(todo.id)}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#526257' }}
                      />
                      <span style={{
                        fontSize: '0.9rem',
                        fontWeight: todo.completed ? 500 : 600,
                        color: todo.completed ? '#89878A' : '#34343A',
                        textDecoration: todo.completed ? 'line-through' : 'none'
                      }}>
                        {todo.text}
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleDeleteTodo(todo.id)}
                      style={{ background: 'none', border: 'none', color: '#89878A', fontSize: '0.82rem', cursor: 'pointer', padding: '2px 6px' }}
                      title="Remove task"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Task Form */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                <input
                  type="text"
                  placeholder="Add a placement task (e.g. Solve 2 DP questions, Revise SQL joins)..."
                  value={newTodoInput}
                  onChange={(e) => setNewTodoInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTodo();
                    }
                  }}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid #D8D2CE',
                    fontSize: '0.88rem',
                    color: '#34343A',
                    outline: 'none',
                    backgroundColor: '#FCF9F6',
                    boxShadow: 'inset 0 2px 4px rgba(52, 52, 58, 0.04), 0 1px 0 rgba(255, 255, 255, 0.8)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => handleAddTodo()}
                  className="btn-primary-spec"
                  style={{ padding: '10px 20px', fontSize: '0.88rem', whiteSpace: 'nowrap' }}
                >
                  + Add Task
                </button>
              </div>

              {/* Quick Template Chips */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#89878A' }}>Quick Suggestions:</span>
                {SUGGESTED_TODOS.map((s, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddTodo(s)}
                    style={{
                      padding: '6px 14px',
                      borderRadius: '8px',
                      backgroundColor: '#FCF9F6',
                      border: '1px solid #D8D2CE',
                      fontSize: '0.75rem',
                      color: '#4F5056',
                      cursor: 'pointer',
                      boxShadow: '0 2px 0 rgba(216, 210, 206, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.8)'
                    }}
                  >
                    + {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Key Takeaway / Positive Reminder */}
            <div style={{
              ...card3DStyle,
              padding: '22px 26px'
            }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#89878A', textTransform: 'uppercase', marginBottom: '8px' }}>
                5. Key Takeaway or Note to Self (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Progress compounds daily. I only need one right offer."
                value={diaryTakeaway}
                onChange={(e) => setDiaryTakeaway(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '1px solid #D8D2CE',
                  fontSize: '0.9rem',
                  color: '#34343A',
                  outline: 'none',
                  backgroundColor: '#FCF9F6',
                  boxShadow: 'inset 0 2px 4px rgba(52, 52, 58, 0.04), 0 1px 0 rgba(255, 255, 255, 0.8)'
                }}
              />
            </div>

            {/* Submit Button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
              <button
                type="submit"
                className="btn-primary-spec"
                style={{
                  padding: '14px 36px',
                  fontSize: '1rem',
                  borderRadius: '12px'
                }}
              >
                Save Daily Diary Entry
              </button>
            </div>

          </form>
        </div>
      )}

      {/* ──────────────────────────────────────────────
          TAB 2: CONVERSATIONAL AI COMPANION (CHATBOT)
          ────────────────────────────────────────────── */}
      {currentTab === 'chat' && (
        <div style={{
          ...card3DStyle,
          padding: '26px',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '620px'
        }}>
          
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(216, 210, 206, 0.5)', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: '#526257',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 800,
                boxShadow: '0 3px 0 #3b473f, 0 6px 14px rgba(82, 98, 87, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
              }}>
                NC
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34343A', margin: 0 }}>
                  NeuroCoach AI Companion
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#68705F', fontWeight: 600 }}>
                  ● Empathetic & Motivating Placement Friend
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResetChatbot}
              className="btn-secondary-spec"
              style={{ padding: '6px 14px', fontSize: '0.78rem', fontWeight: 600 }}
            >
              Reset Chat
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            maxHeight: '450px',
            paddingRight: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            marginBottom: '16px'
          }}>
            {chatMessages.map((msg, idx) => {
              const isBot = msg.sender === 'bot';
              const isLastBot = isBot && idx === chatMessages.length - 1;
              return (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: isBot ? 'flex-start' : 'flex-end'
                  }}
                >
                  <div style={{
                    maxWidth: '88%',
                    padding: '16px 20px',
                    borderRadius: isBot ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                    backgroundColor: isBot ? (msg.crisisTriggered ? '#FEF2F2' : '#FCF9F6') : '#526257',
                    color: isBot ? (msg.crisisTriggered ? '#991B1B' : '#34343A') : '#FFFFFF',
                    border: isBot ? (msg.crisisTriggered ? '1.5px solid #F87171' : '1px solid #D8D2CE') : '1px solid #415046',
                    fontSize: '0.93rem',
                    lineHeight: 1.65,
                    boxShadow: isBot 
                      ? (msg.crisisTriggered ? '0 4px 14px rgba(239, 68, 68, 0.15)' : '0 2px 6px rgba(52, 52, 58, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)') 
                      : '0 3px 0 #3b473f, 0 6px 14px rgba(82, 98, 87, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.25)'
                  }}>
                    {isBot && msg.cbtDistortion && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '3px 10px', borderRadius: '8px', backgroundColor: 'rgba(82, 98, 87, 0.12)', color: '#324036', fontSize: '0.74rem', fontWeight: 700, marginBottom: '8px' }}>
                        <span>CBT Reframing:</span>
                        <span>{msg.cbtDistortion}</span>
                      </div>
                    )}

                    <div style={{ color: isBot ? (msg.crisisTriggered ? '#991B1B' : '#34343A') : '#FFFFFF' }}>
                      {formatMessageText(msg.text)}
                    </div>

                    {/* Crisis Triage Guardrail Helplines */}
                    {isBot && msg.crisisTriggered && (
                      <div style={{ marginTop: '14px', padding: '12px 14px', borderRadius: '10px', backgroundColor: '#FFFFFF', border: '1px solid #FCA5A5' }}>
                        <div style={{ fontWeight: 800, fontSize: '0.82rem', color: '#B91C1C', marginBottom: '6px' }}>
                          24/7 Verified Confidential Mental Health Support:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.8rem', color: '#7F1D1D', lineHeight: 1.6 }}>
                          <li><strong>Tele-MANAS (Govt of India):</strong> 14416 or 1800-891-4416 (24/7 Toll-free)</li>
                          <li><strong>KIRAN Helpline:</strong> 1800-599-0019</li>
                          <li><strong>AASRA Suicide Prevention:</strong> +91-9820466726</li>
                          <li><strong>US / International Crisis:</strong> 988 Lifeline</li>
                        </ul>
                      </div>
                    )}

                    {/* Interactive Somatic Grounding Trigger Button */}
                    {isBot && (msg.actionTrigger === 'OPEN_BREATHING' || msg.crisisTriggered) && (
                      <div style={{ marginTop: '12px' }}>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentTab('calm');
                            setBreathingActive(true);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '9px 16px',
                            borderRadius: '10px',
                            backgroundColor: msg.crisisTriggered ? '#DC2626' : '#526257',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '0.82rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            transition: 'all 0.15s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-1px)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
                          }}
                        >
                          <span>Take a 90-sec Tactical Pause (Open Box Breathing)</span>
                          <span>→</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Message Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', marginInline: '6px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#89878A' }}>
                      {isBot ? 'NeuroCoach' : 'You'} • {msg.time}
                    </span>
                    {isBot && (
                      <button
                        type="button"
                        onClick={() => handleCopyMessage(msg.id, msg.text)}
                        style={{ background: 'none', border: 'none', color: '#89878A', fontSize: '0.75rem', cursor: 'pointer', padding: 0 }}
                        title="Copy response"
                      >
                        {copiedId === msg.id ? 'Copied' : 'Copy'}
                      </button>
                    )}
                    {isLastBot && (
                      <button
                        type="button"
                        onClick={handleRegenerateLastResponse}
                        style={{ background: 'none', border: 'none', color: '#9A6854', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', padding: 0 }}
                        title="Regenerate alternative reply"
                      >
                        Regenerate
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {isBotTyping && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 18px', backgroundColor: '#FCF9F6', borderRadius: '12px', border: '1px solid #D8D2CE', width: 'fit-content', boxShadow: '0 2px 6px rgba(52, 52, 58, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#526257', animation: 'pulse 1.2s infinite' }} />
                <span style={{ fontSize: '0.84rem', color: '#4F5056', fontWeight: 600 }}>NeuroCoach is thinking and writing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>



          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendChatMessage();
            }}
            style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}
          >
            <input
              type="text"
              placeholder="Type how you feel, what you solved, or what happened today..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              style={{
                flex: 1,
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid #D8D2CE',
                fontSize: '0.92rem',
                color: '#34343A',
                outline: 'none',
                backgroundColor: '#FCF9F6',
                boxShadow: 'inset 0 2px 4px rgba(52, 52, 58, 0.04), 0 1px 0 rgba(255, 255, 255, 0.8)'
              }}
            />
            <button
              type="submit"
              className="btn-primary-spec"
              style={{ padding: '12px 24px', fontSize: '0.9rem', borderRadius: '12px', whiteSpace: 'nowrap', color: '#FFFFFF' }}
            >
              Send & Chat
            </button>
          </form>

        </div>
      )}

      {/* ──────────────────────────────────────────────
          TAB 3: JOURNAL HISTORY CARDS
          ────────────────────────────────────────────── */}
      {currentTab === 'history' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#34343A', margin: 0 }}>
              Journal History ({journalEntries.length} entries)
            </h2>
            {journalEntries.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Are you sure you want to clear all journal entries?')) {
                    if (onClearAllEntries) {
                      onClearAllEntries();
                    } else if (onDeleteEntry) {
                      journalEntries.forEach(e => onDeleteEntry(e.id));
                    }
                  }
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: '8px',
                  backgroundColor: '#FFF1F2',
                  border: '1px solid #FECDD3',
                  color: '#BE123C',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 0 #FECDD3'
                }}
              >
                Clear All History
              </button>
            )}
          </div>

          {journalEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', ...card3DStyle }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#34343A' }}>No Journal Entries Yet</h3>
              <p style={{ fontSize: '0.9rem', color: '#89878A', marginBottom: '18px' }}>
                Write your first daily placement diary entry and to-do list to see your progress history here.
              </p>
              <button
                onClick={() => setCurrentTab('write')}
                className="btn-primary-spec"
                style={{ padding: '10px 22px' }}
              >
                Write First Entry
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {journalEntries.map(entry => (
                <div
                  key={entry.id}
                  style={{
                    ...card3DStyle,
                    padding: '22px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.8rem', color: '#89878A', fontWeight: 600 }}>
                        {entry.date} • {entry.time || ''}
                      </span>
                      <span style={{ fontSize: '0.8rem', padding: '4px 12px', borderRadius: '999px', backgroundColor: '#F5EBE6', color: '#9A6854', fontWeight: 700, border: '1px solid #D8D2CE', boxShadow: '0 1px 3px rgba(154, 104, 84, 0.1)' }}>
                        {entry.moods?.[0] || 'Calm'}
                      </span>
                    </div>

                    <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#34343A', marginTop: 0, marginBottom: '10px' }}>
                      {entry.title}
                    </h3>

                    <p style={{ fontSize: '0.88rem', color: '#66666B', lineHeight: 1.6, margin: 0, marginBottom: '12px' }}>
                      {entry.content}
                    </p>

                    {/* Saved To-Dos List */}
                    {entry.todos && entry.todos.length > 0 && (
                      <div style={{ marginBottom: '12px', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#FCF9F6', border: '1px solid #D8D2CE', boxShadow: 'inset 0 1px 3px rgba(52, 52, 58, 0.03)' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#89878A', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                          Placement Checklist:
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          {entry.todos.map((t, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem' }}>
                              <span style={{ color: t.completed ? '#68705F' : '#89878A', fontWeight: 700 }}>
                                {t.completed ? '[Done]' : '[Pending]'}
                              </span>
                              <span style={{ color: t.completed ? '#89878A' : '#34343A', textDecoration: t.completed ? 'line-through' : 'none' }}>
                                {t.text}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.takeaway && (
                      <div style={{ marginTop: '8px', padding: '12px', borderRadius: '10px', backgroundColor: '#F5EBE6', fontSize: '0.84rem', color: '#34343A', fontWeight: 600, border: '1px solid #D8D2CE' }}>
                        <strong>Takeaway:</strong> "{entry.takeaway}"
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(216, 210, 206, 0.5)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: '#89878A' }}>
                      {entry.emotions?.join(', ') || 'Daily Diary'}
                    </span>
                    <button
                      onClick={() => onDeleteEntry && onDeleteEntry(entry.id)}
                      style={{ background: 'none', border: 'none', color: '#BE123C', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}
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

      {/* ──────────────────────────────────────────────
          TAB 4: ACHIEVEMENT GARDEN - BOTANICAL GROWTH
          ────────────────────────────────────────────── */}
      {currentTab === 'garden' && (() => {
        const realStageIndex = Math.min(4, Math.floor((gardenStats.count || 0) / 3));
        const currentStageIndex = previewGardenStage !== null ? previewGardenStage : realStageIndex;

        const GARDEN_STAGES = [
          {
            title: 'Stage 1: The Awakening Seed',
            subtitle: '0–2 Journal Reflections',
            tag: 'STAGE 1: DORMANT SPROUT',
            desc: 'Every great career journey begins with daily discipline. Each reflection waters your sprout, strengthening your technical foundation and mental clarity.',
            level: 'Level 1: Sprout',
            coinsPerDay: '+100 SEEDS',
            bonus: 'Daily Sprout Catalyst',
            color: '#68705F'
          },
          {
            title: 'Stage 2: The Rising Shoot',
            subtitle: '3–5 Journal Reflections',
            tag: 'STAGE 2: EXPANDING ROOTS',
            desc: 'Your problem-solving practice and self-reflection are taking deep root. Fresh botanical leaves absorb daily learnings and reinforce interview confidence.',
            level: 'Level 2: Rising Shoot',
            coinsPerDay: '+200 SEEDS',
            bonus: 'Cognitive Resilience Boost',
            color: '#526257'
          },
          {
            title: 'Stage 3: The Resilient Sapling',
            subtitle: '6–8 Journal Reflections',
            tag: 'STAGE 3: RESILIENT CANOPY',
            desc: 'Sturdy branches expand into advanced concepts and behavioral poise. Complex interview challenges nourish your confidence rather than shake it.',
            level: 'Level 3: Flourishing Sapling',
            coinsPerDay: '+350 SEEDS',
            bonus: 'Composure Platform',
            color: '#9A6854'
          },
          {
            title: 'Stage 4: The Golden Blossom',
            subtitle: '9–11 Journal Reflections',
            tag: 'STAGE 4: HARMONIC BLOOM',
            desc: 'Lush foliage and radiant achievement blossoms reflect steady composure under high-stress questions. You approach assessments with deep self-belief.',
            level: 'Level 4: Blossom Tree',
            coinsPerDay: '+500 SEEDS',
            bonus: 'Peak Clarity Radiance',
            color: '#8C6D3B'
          },
          {
            title: 'Stage 5: The Sanctuary World Tree',
            subtitle: '12+ Journal Reflections',
            tag: 'STAGE 5: PLACEMENT SANCTUARY',
            desc: 'A colossal, majestic botanical canopy celebrating your unwavering dedication, emotional poise, and proven readiness to excel across hiring drives.',
            level: 'Level 5: World Sanctuary',
            coinsPerDay: '+1000 SEEDS',
            bonus: 'Placement Champion Crown',
            color: '#34343A'
          }
        ];

        const activeStage = GARDEN_STAGES[currentStageIndex];

        return (
          <div style={{ ...card3DStyle, padding: '36px 28px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            
            {/* Top Garden HUD Status Bar */}
            <div style={{
              maxWidth: '720px',
              margin: '0 auto 24px auto',
              padding: '14px 22px',
              borderRadius: '16px',
              backgroundColor: '#3E4D43',
              border: '1px solid #4D5E53',
              boxShadow: '0 3px 0 #2c3730, 0 8px 24px rgba(44, 55, 48, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.15)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '12px',
              color: '#FFFFFF'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.86rem', fontWeight: 800, letterSpacing: '0.04em', color: '#FFFFFF', textTransform: 'uppercase' }}>
                  {activeStage.level}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#FEF08A' }}>
                  {marioCoins} Seeds
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#F7F3EE' }}>
                  STREAK: {gardenStats.count || 0} DAYS
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#526257', padding: '5px 12px', borderRadius: '10px', border: '1px solid #637569' }}>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '0.04em' }}>
                  REST SHIELD ON
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#526257', padding: '5px 12px', borderRadius: '10px', border: '1px solid #637569' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFFFFF' }}>
                  3 HEARTS
                </span>
              </div>
            </div>

            {/* Stage Tag */}
            <span className="pill-tag" style={{
              marginBottom: '10px',
              backgroundColor: '#F5EBE6',
              color: '#9A6854',
              border: '1px solid #D8D2CE',
              fontWeight: 800
            }}>
              {activeStage.tag}
            </span>

            <h2 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#34343A', marginBottom: '8px', marginTop: '6px', fontFamily: 'var(--font-heading)' }}>
              {activeStage.title}
            </h2>
            <p style={{ fontSize: '0.93rem', color: '#66666B', maxWidth: '640px', margin: '0 auto 22px auto', lineHeight: 1.65 }}>
              {activeStage.desc}
            </p>

            {/* Stage Selector Pills for Exploration */}
            <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {GARDEN_STAGES.map((stg, idx) => {
                const isSelected = currentStageIndex === idx;
                const isUnlocked = idx <= realStageIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPreviewGardenStage(idx)}
                    style={{
                      padding: '8px 18px',
                      borderRadius: '999px',
                      fontSize: '0.82rem',
                      fontWeight: isSelected ? 800 : 600,
                      cursor: 'pointer',
                      border: isSelected ? '1px solid #415046' : '1px solid #D8D2CE',
                      backgroundColor: isSelected ? '#526257' : (isUnlocked ? '#FCF9F6' : '#F7F3EE'),
                      color: isSelected ? '#FFFFFF' : (isUnlocked ? '#4F5056' : '#89878A'),
                      boxShadow: isSelected 
                        ? '0 3px 0 #3b473f, 0 4px 10px rgba(82, 98, 87, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)' 
                        : '0 2px 4px rgba(52, 52, 58, 0.03)',
                      transition: 'all 0.15s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>Stage {idx + 1}</span>
                    {isUnlocked && <span style={{ color: isSelected ? '#FFFFFF' : '#68705F', fontSize: '0.75rem', fontWeight: 800 }}>✓</span>}
                  </button>
                );
              })}
              {previewGardenStage !== null && (
                <button
                  type="button"
                  onClick={() => setPreviewGardenStage(null)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: '999px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    border: '1px dashed #9A6854',
                    backgroundColor: '#FCF9F6',
                    color: '#9A6854',
                    boxShadow: '0 2px 4px rgba(52, 52, 58, 0.03)'
                  }}
                >
                  Reset to My Progress
                </button>
              )}
            </div>

            {/* 3D BOTANICAL STAGE DISPLAY */}
            <div style={{
              maxWidth: '620px',
              margin: '0 auto 24px auto',
              padding: '30px 22px 18px 22px',
              borderRadius: '24px',
              background: 'linear-gradient(180deg, #F0F4F1 0%, #FAF8F5 55%, #EBF0E9 100%)',
              border: '1.5px solid #D8D2CE',
              boxShadow: isStarPower 
                ? '0 0 35px rgba(154, 104, 84, 0.35), 0 14px 36px rgba(82, 98, 87, 0.15), inset 0 2px 4px rgba(255, 255, 255, 0.9)' 
                : '0 2px 4px rgba(52, 52, 58, 0.03), 0 12px 30px rgba(82, 98, 87, 0.1), inset 0 2px 4px rgba(255, 255, 255, 0.9)',
              position: 'relative',
              overflow: 'hidden'
            }}>

              {/* Drifting Morning Mist Clouds */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '24px',
                animation: 'marioCloudDrift 6s infinite ease-in-out',
                pointerEvents: 'none',
                opacity: 0.95
              }}>
                <svg width="68" height="34" viewBox="0 0 68 34" fill="none">
                  <path d="M12 28 C4 28 0 22 4 16 C8 10 18 10 22 14 C26 4 44 4 48 14 C54 8 64 12 66 18 C68 24 64 28 56 28 Z" fill="#FFFFFF" stroke="#D8D2CE" strokeWidth="1.5" />
                  <ellipse cx="30" cy="18" rx="1.8" ry="3" fill="#68705F" />
                  <ellipse cx="38" cy="18" rx="1.8" ry="3" fill="#68705F" />
                </svg>
              </div>

              {/* Rain Drops Animation Overlay when Watering */}
              {isWatering && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none', zIndex: 10 }}>
                  <div style={{ position: 'absolute', top: '40px', left: '35%', width: '6px', height: '14px', borderRadius: '4px', backgroundColor: '#526257', animation: 'waterDropSplash 0.7s infinite' }} />
                  <div style={{ position: 'absolute', top: '30px', left: '48%', width: '6px', height: '14px', borderRadius: '4px', backgroundColor: '#68705F', animation: 'waterDropSplash 0.9s infinite 0.2s' }} />
                  <div style={{ position: 'absolute', top: '45px', left: '60%', width: '6px', height: '14px', borderRadius: '4px', backgroundColor: '#7D8F82', animation: 'waterDropSplash 0.8s infinite 0.4s' }} />
                </div>
              )}

              {/* Flying Coin on Growth Action */}
              {flyingCoin && (
                <div style={{
                  position: 'absolute',
                  top: '120px',
                  left: '48%',
                  transform: 'translateX(-50%)',
                  zIndex: 20,
                  animation: 'marioCoinPop 0.9s forwards',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  padding: '6px 14px',
                  borderRadius: '12px',
                  backgroundColor: '#526257',
                  border: '1px solid #415046',
                  boxShadow: '0 4px 12px rgba(82, 98, 87, 0.3)'
                }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#FFFFFF' }}>+100 SEEDS</span>
                </div>
              )}

              {/* Mindful Radiance Effect */}
              {isStarPower && (
                <div style={{ position: 'absolute', top: '12px', left: '50%', transform: 'translateX(-50%)', zIndex: 15, animation: 'marioStarAura 1.5s infinite', padding: '5px 16px', borderRadius: '999px', backgroundColor: '#8C6D3B', color: '#FFFFFF', fontWeight: 800, fontSize: '0.78rem', letterSpacing: '0.04em' }}>
                  RADIANCE ACTIVE
                </div>
              )}

              {/* 3D VECTOR ANIMATION STAGE CANVAS */}
              <div style={{
                height: '240px',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                position: 'relative',
                marginBottom: '10px'
              }}>

                {/* ── STAGE 0: DORMANT SEED IN BOTANICAL SOIL ── */}
                {currentStageIndex === 0 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    animation: isWatering ? 'marioBeanstalkGrow 1.5s ease-out' : 'marioMushroomBob 3s infinite ease-in-out'
                  }}>
                    <svg width="220" height="210" viewBox="0 0 220 210" fill="none">
                      {/* Ground line with grass fringe */}
                      <rect x="10" y="175" width="200" height="30" rx="6" fill="#526257" stroke="#3b473f" strokeWidth="2.5" />
                      <line x1="10" y1="175" x2="210" y2="175" stroke="#7D8F82" strokeWidth="3" />

                      {/* Earthy Botanical Planter Base */}
                      <rect x="70" y="125" width="80" height="50" fill="#68705F" stroke="#485042" strokeWidth="2.5" />
                      <rect x="64" y="115" width="92" height="15" rx="3" fill="#7D8873" stroke="#485042" strokeWidth="2.5" />
                      {/* Inner Shadow */}
                      <ellipse cx="110" cy="120" rx="34" ry="4" fill="#415046" />

                      {/* Rich Terracotta Soil */}
                      <ellipse cx="110" cy="120" rx="30" ry="3.5" fill="#855335" />

                      {/* Glowing Golden Seed */}
                      <g style={{ animation: 'seedPulse 2s infinite ease-in-out', transformOrigin: '110px 115px' }}>
                        <path d="M110 98 C120 108, 120 120, 110 124 C100 120, 100 108, 110 98 Z" fill="#E2B159" stroke="#713F12" strokeWidth="2.5" />
                        <ellipse cx="108" cy="106" rx="3" ry="5" fill="#FEF08A" />
                        {/* Sprout Leaf Shoot */}
                        <path d="M110 98 Q106 85 116 78" stroke="#526257" strokeWidth="3" strokeLinecap="round" />
                        <path d="M116 78 C126 76, 128 84, 116 88 C112 84, 114 80, 116 78 Z" fill="#68705F" stroke="#415046" strokeWidth="2" />
                      </g>

                      {/* Floating Growth Block */}
                      <g style={{
                        transform: blockBounce ? 'translateY(-12px)' : 'translateY(0)',
                        transition: 'transform 0.2s ease',
                        cursor: 'pointer'
                      }} onClick={handleHitMarioBlock}>
                        <rect x="25" y="80" width="34" height="34" rx="4" fill="#9A6854" stroke="#734837" strokeWidth="2.5" />
                        <rect x="27" y="82" width="30" height="30" rx="3" fill="#AF7B66" />
                        <circle cx="29" cy="84" r="1.5" fill="#613b2c" />
                        <circle cx="53" cy="84" r="1.5" fill="#613b2c" />
                        <circle cx="29" cy="108" r="1.5" fill="#613b2c" />
                        <circle cx="53" cy="108" r="1.5" fill="#613b2c" />
                        <text x="42" y="103" textAnchor="middle" fill="#FFFFFF" fontSize="18" fontWeight="900" fontFamily="sans-serif">?</text>
                      </g>
                    </svg>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#34343A', marginTop: '4px', textShadow: '0 1px 2px #FFFFFF' }}>
                      Stage 1: Awakening Sprout in Botanical Soil
                    </span>
                  </div>
                )}

                {/* ── STAGE 1: SPROUTING SHOOT & KNOWLEDGE LEAVES ── */}
                {currentStageIndex === 1 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    animation: isWatering ? 'marioBeanstalkGrow 1.5s ease-out' : 'marioMushroomBob 3.5s infinite ease-in-out'
                  }}>
                    <svg width="240" height="220" viewBox="0 0 240 220" fill="none">
                      {/* Ground Platform */}
                      <rect x="15" y="180" width="210" height="30" rx="6" fill="#526257" stroke="#3b473f" strokeWidth="2.5" />
                      <line x1="15" y1="180" x2="225" y2="180" stroke="#7D8F82" strokeWidth="3" />

                      {/* Terracotta Growth Block */}
                      <g style={{
                        transform: blockBounce ? 'translateY(-14px)' : 'translateY(0)',
                        transition: 'transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        cursor: 'pointer'
                      }} onClick={handleHitMarioBlock}>
                        <rect x="95" y="135" width="50" height="48" rx="6" fill="#9A6854" stroke="#734837" strokeWidth="2.5" />
                        <rect x="98" y="138" width="44" height="42" rx="4" fill="#AF7B66" />
                        <circle cx="102" cy="142" r="2" fill="#613b2c" />
                        <circle cx="138" cy="142" r="2" fill="#613b2c" />
                        <circle cx="102" cy="174" r="2" fill="#613b2c" />
                        <circle cx="138" cy="174" r="2" fill="#613b2c" />
                        <text x="120" y="168" textAnchor="middle" fill="#FFFFFF" fontSize="24" fontWeight="900">?</text>
                      </g>

                      {/* Growing Sage Stem */}
                      <path d="M120 135 Q115 90 120 45" stroke="#526257" strokeWidth="12" strokeLinecap="round" />
                      <path d="M120 135 Q115 90 120 45" stroke="#7D8F82" strokeWidth="6" strokeLinecap="round" />

                      {/* Left Leaf */}
                      <path d="M116 100 C75 85 65 50 95 40 C118 40 118 80 116 100 Z" fill="#68705F" stroke="#415046" strokeWidth="2.5" />
                      <path d="M116 100 C98 75 90 52 95 40" stroke="#415046" strokeWidth="2" strokeLinecap="round" />

                      {/* Right Leaf */}
                      <path d="M122 75 C165 60 175 25 145 15 C122 15 122 55 122 75 Z" fill="#7D8F82" stroke="#526257" strokeWidth="2.5" />
                      <path d="M122 75 C140 50 148 27 145 15" stroke="#526257" strokeWidth="2" strokeLinecap="round" />

                      {/* Floating Golden Coin */}
                      <g style={{ animation: 'marioCoinSpin 2s infinite linear', transformOrigin: '185px 50px' }}>
                        <ellipse cx="185" cy="50" rx="14" ry="18" fill="#E2B159" stroke="#8C6D3B" strokeWidth="2.5" />
                        <rect x="182" y="38" width="6" height="24" rx="2" fill="#8C6D3B" />
                      </g>
                    </svg>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#34343A', marginTop: '4px', textShadow: '0 1px 2px #FFFFFF' }}>
                      Stage 2: Rising Sprout & Knowledge Leaves
                    </span>
                  </div>
                )}

                {/* ── STAGE 2: RESILIENT SAPLING & CANOPY ── */}
                {currentStageIndex === 2 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    animation: isWatering ? 'marioBeanstalkGrow 1.5s ease-out' : 'stemSway 4s infinite ease-in-out'
                  }}>
                    <svg width="260" height="225" viewBox="0 0 260 225" fill="none">
                      {/* Ground Platform */}
                      <rect x="20" y="185" width="220" height="30" rx="6" fill="#526257" stroke="#3b473f" strokeWidth="2.5" />
                      <line x1="20" y1="185" x2="240" y2="185" stroke="#7D8F82" strokeWidth="3" />

                      {/* Terracotta Foundation Bricks */}
                      <rect x="50" y="150" width="34" height="34" rx="3" fill="#9A6854" stroke="#734837" strokeWidth="2" />
                      <line x1="50" y1="167" x2="84" y2="167" stroke="#734837" strokeWidth="2" />
                      <line x1="67" y1="150" x2="67" y2="167" stroke="#734837" strokeWidth="2" />

                      <rect x="176" y="150" width="34" height="34" rx="3" fill="#9A6854" stroke="#734837" strokeWidth="2" />
                      <line x1="176" y1="167" x2="210" y2="167" stroke="#734837" strokeWidth="2" />
                      <line x1="193" y1="150" x2="193" y2="167" stroke="#734837" strokeWidth="2" />

                      {/* Main Sage Trunk */}
                      <path d="M130 185 Q115 130 130 75 Q140 40 130 15" stroke="#526257" strokeWidth="15" strokeLinecap="round" />
                      <path d="M130 185 Q115 130 130 75 Q140 40 130 15" stroke="#7D8F82" strokeWidth="7" strokeLinecap="round" />

                      {/* Left Branch */}
                      <path d="M125 120 Q80 105 70 85" stroke="#526257" strokeWidth="8" strokeLinecap="round" />
                      <path d="M70 85 C45 75 35 45 60 35 C80 35 80 65 70 85 Z" fill="#68705F" stroke="#415046" strokeWidth="2.5" />

                      {/* Right Branch */}
                      <path d="M132 100 Q180 85 190 65" stroke="#526257" strokeWidth="8" strokeLinecap="round" />
                      <path d="M190 65 C215 55 225 25 200 15 C180 15 180 45 190 65 Z" fill="#7D8F82" stroke="#526257" strokeWidth="2.5" />

                      {/* Top Canopy Leaves */}
                      <path d="M130 25 C100 15 95 -10 120 -15 C140 -15 135 10 130 25 Z" fill="#68705F" stroke="#415046" strokeWidth="2.5" />
                      <path d="M132 25 C160 15 165 -10 140 -15 C120 -15 125 10 132 25 Z" fill="#8CA392" stroke="#415046" strokeWidth="2.5" />

                      {/* Resilience Sprout on Leaf Platform */}
                      <g style={{ animation: 'marioMushroomBob 2.5s infinite ease-in-out', transformOrigin: '65px 40px', cursor: 'pointer' }} onClick={handleFeed1UpMushroom}>
                        <path d="M50 42 C50 25 80 25 80 42 Z" fill="#68705F" stroke="#415046" strokeWidth="2" />
                        <circle cx="65" cy="30" r="5" fill="#FFFFFF" />
                        <ellipse cx="54" cy="36" rx="3" ry="4" fill="#FFFFFF" />
                        <ellipse cx="76" cy="36" rx="3" ry="4" fill="#FFFFFF" />
                        <rect x="58" y="42" width="14" height="10" rx="3" fill="#F5EBE6" stroke="#415046" strokeWidth="1.5" />
                        <ellipse cx="62" cy="46" rx="1" ry="2" fill="#415046" />
                        <ellipse cx="68" cy="46" rx="1" ry="2" fill="#415046" />
                      </g>

                      {/* Center Growth Block */}
                      <g style={{
                        transform: blockBounce ? 'translateY(-14px)' : 'translateY(0)',
                        transition: 'transform 0.2s ease',
                        cursor: 'pointer'
                      }} onClick={handleHitMarioBlock}>
                        <rect x="110" y="145" width="40" height="38" rx="5" fill="#9A6854" stroke="#734837" strokeWidth="2.5" />
                        <rect x="113" y="148" width="34" height="32" rx="3" fill="#AF7B66" />
                        <text x="130" y="172" textAnchor="middle" fill="#FFFFFF" fontSize="20" fontWeight="900">?</text>
                      </g>
                    </svg>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#34343A', marginTop: '4px', textShadow: '0 1px 2px #FFFFFF' }}>
                      Stage 3: Resilient Canopy & Wisdom Platform
                    </span>
                  </div>
                )}

                {/* ── STAGE 3: GOLDEN BLOSSOM TREE ── */}
                {currentStageIndex === 3 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    animation: isWatering ? 'marioBeanstalkGrow 1.5s ease-out' : 'marioStarAura 3s infinite ease-in-out'
                  }}>
                    <svg width="280" height="230" viewBox="0 0 280 230" fill="none">
                      {/* Ground */}
                      <rect x="20" y="190" width="240" height="30" rx="6" fill="#526257" stroke="#3b473f" strokeWidth="2.5" />
                      <line x1="20" y1="190" x2="260" y2="190" stroke="#7D8F82" strokeWidth="3" />

                      {/* Towering Sage Trunk */}
                      <path d="M140 190 Q120 120 140 60 Q150 25 140 0" stroke="#526257" strokeWidth="18" strokeLinecap="round" />
                      <path d="M140 190 Q120 120 140 60 Q150 25 140 0" stroke="#7D8F82" strokeWidth="8" strokeLinecap="round" />

                      {/* Arching Foliage */}
                      <path d="M135 110 Q70 85 50 60" stroke="#526257" strokeWidth="10" strokeLinecap="round" />
                      <path d="M50 60 C15 50 5 15 40 5 C65 5 65 40 50 60 Z" fill="#68705F" stroke="#415046" strokeWidth="2.5" />

                      <path d="M145 90 Q210 65 230 40" stroke="#526257" strokeWidth="10" strokeLinecap="round" />
                      <path d="M230 40 C265 30 275 -5 240 -15 C215 -15 215 20 230 40 Z" fill="#7D8F82" stroke="#526257" strokeWidth="2.5" />

                      {/* Top Canopy */}
                      <path d="M138 20 C95 10 90 -25 125 -30 C150 -30 145 5 138 20 Z" fill="#68705F" stroke="#415046" strokeWidth="2.5" />
                      <path d="M142 20 C185 10 190 -25 155 -30 C130 -30 135 5 142 20 Z" fill="#8CA392" stroke="#415046" strokeWidth="2.5" />

                      {/* Terracotta Blossom Left */}
                      <g transform="translate(45, 10)">
                        <circle cx="0" cy="0" r="14" fill="#9A6854" stroke="#734837" strokeWidth="2" />
                        <circle cx="0" cy="0" r="9" fill="#AF7B66" />
                        <circle cx="0" cy="0" r="5" fill="#E2B159" />
                      </g>

                      {/* Golden Star Crown Top */}
                      <g style={{ animation: 'marioStarAura 2s infinite ease-in-out', transformOrigin: '140px -10px', cursor: 'pointer' }} onClick={handleTriggerStarPower}>
                        <polygon points="140,-35 145,-20 160,-20 148,-10 152,5 140,-4 128,5 132,-10 120,-20 135,-20" fill="#E2B159" stroke="#8C6D3B" strokeWidth="2" />
                        <ellipse cx="137" cy="-14" rx="1.5" ry="3" fill="#713F12" />
                        <ellipse cx="143" cy="-14" rx="1.5" ry="3" fill="#713F12" />
                      </g>

                      {/* Floating Coins */}
                      <g style={{ animation: 'marioCoinSpin 1.8s infinite linear', transformOrigin: '215px 75px' }}>
                        <ellipse cx="215" cy="75" rx="12" ry="16" fill="#E2B159" stroke="#8C6D3B" strokeWidth="2" />
                        <rect x="213" y="65" width="4" height="20" rx="1.5" fill="#8C6D3B" />
                      </g>
                    </svg>
                    <span style={{ fontSize: '0.86rem', fontWeight: 800, color: '#34343A', marginTop: '4px', textShadow: '0 1px 2px #FFFFFF' }}>
                      Stage 4: Golden Blossom Tree in Harmonic Radiance
                    </span>
                  </div>
                )}

                {/* ── STAGE 4: SANCTUARY WORLD TREE (PEAK VICTORY) ── */}
                {currentStageIndex === 4 && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    animation: 'marioStarAura 2.5s infinite ease-in-out'
                  }}>
                    <svg width="300" height="240" viewBox="0 0 300 240" fill="none">
                      {/* Sanctuary Platform Base */}
                      <rect x="15" y="195" width="270" height="32" rx="8" fill="#526257" stroke="#3b473f" strokeWidth="2.5" />
                      <line x1="15" y1="195" x2="285" y2="195" stroke="#7D8F82" strokeWidth="3" />

                      {/* Colossal Majestic Trunk */}
                      <path d="M150 195 Q130 110 150 40 Q160 10 150 -20" stroke="#526257" strokeWidth="24" strokeLinecap="round" />
                      <path d="M150 195 Q130 110 150 40 Q160 10 150 -20" stroke="#7D8F82" strokeWidth="12" strokeLinecap="round" />

                      {/* Giant Foliage Canopies */}
                      <path d="M140 100 Q60 70 35 40" stroke="#526257" strokeWidth="14" strokeLinecap="round" />
                      <path d="M35 40 C-5 30 -15 -10 25 -25 C55 -25 55 15 35 40 Z" fill="#68705F" stroke="#415046" strokeWidth="3" />

                      <path d="M160 80 Q240 50 265 20" stroke="#526257" strokeWidth="14" strokeLinecap="round" />
                      <path d="M265 20 C305 10 315 -30 275 -45 C245 -45 245 -5 265 20 Z" fill="#7D8F82" stroke="#526257" strokeWidth="3" />

                      {/* High Atmosphere Canopy */}
                      <path d="M148 5 C90 -10 85 -55 130 -60 C165 -60 160 -15 148 5 Z" fill="#68705F" stroke="#415046" strokeWidth="3" />
                      <path d="M152 5 C210 -10 215 -55 170 -60 C135 -60 140 -15 152 5 Z" fill="#8CA392" stroke="#415046" strokeWidth="3" />

                      {/* Giant Floating Star at Top */}
                      <g style={{ animation: 'marioStarAura 1.5s infinite ease-in-out', transformOrigin: '150px -50px', cursor: 'pointer' }} onClick={handleTriggerStarPower}>
                        <polygon points="150,-80 157,-60 178,-60 161,-46 167,-26 150,-38 133,-26 139,-46 122,-60 143,-60" fill="#E2B159" stroke="#8C6D3B" strokeWidth="3" />
                        <ellipse cx="146" cy="-52" rx="2" ry="4" fill="#713F12" />
                        <ellipse cx="154" cy="-52" rx="2" ry="4" fill="#713F12" />
                      </g>

                      {/* Botanical Sprout on Left Platform */}
                      <g transform="translate(18, -15)">
                        <path d="M0 10 C0 -6 26 -6 26 10 Z" fill="#68705F" stroke="#415046" strokeWidth="2" />
                        <circle cx="13" cy="0" r="4" fill="#FFF" />
                        <rect x="7" y="10" width="12" height="8" rx="2" fill="#F5EBE6" stroke="#415046" strokeWidth="1.5" />
                        <ellipse cx="10" cy="13" rx="1" ry="1.5" fill="#415046" />
                        <ellipse cx="16" cy="13" rx="1" ry="1.5" fill="#415046" />
                      </g>

                      {/* Terracotta Bloom on Right Platform */}
                      <g transform="translate(265, -25)">
                        <circle cx="0" cy="0" r="14" fill="#9A6854" stroke="#734837" strokeWidth="2" />
                        <circle cx="0" cy="0" r="9" fill="#AF7B66" />
                        <circle cx="0" cy="0" r="5" fill="#E2B159" />
                      </g>

                      {/* Victory Flagpole on Base */}
                      <rect x="235" y="70" width="6" height="125" fill="#D8D2CE" stroke="#89878A" strokeWidth="1.5" />
                      <circle cx="238" cy="68" r="6" fill="#E2B159" stroke="#8C6D3B" strokeWidth="1.5" />
                      <polygon points="235,74 200,88 235,102" fill="#526257" stroke="#3b473f" strokeWidth="1.5" />
                    </svg>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#34343A', marginTop: '4px', textShadow: '0 1px 2px #FFFFFF' }}>
                      Stage 5: Peak Sanctuary World Tree & Placement Mastery
                    </span>
                  </div>
                )}
              </div>

              {/* Pedestal Ground Shadow */}
              <div style={{
                width: '260px',
                height: '18px',
                borderRadius: '50%',
                background: 'radial-gradient(ellipse, rgba(82, 98, 87, 0.2) 0%, transparent 70%)',
                margin: '0 auto 14px auto'
              }} />

              {/* Interactive Botanical Action Dock */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                paddingTop: '14px',
                borderTop: '1px solid rgba(216, 210, 206, 0.6)'
              }}>
                <button
                  type="button"
                  onClick={handleWaterBeanstalk}
                  className="btn-primary-spec"
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    color: '#FFFFFF'
                  }}
                >
                  {isWatering ? 'Watering Sprout...' : 'Water Garden'}
                </button>

                <button
                  type="button"
                  onClick={handleHitMarioBlock}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    backgroundColor: '#9A6854',
                    border: '1px solid #7a4e3c',
                    color: '#FFFFFF',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 3px 0 #613b2c, 0 6px 14px rgba(154, 104, 84, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
                    transform: blockBounce ? 'scale(0.96)' : 'scale(1)',
                    transition: 'all 0.12s ease'
                  }}
                >
                  Nurture Soil (+100 Seeds)
                </button>

                <button
                  type="button"
                  onClick={handleFeed1UpMushroom}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    backgroundColor: '#68705F',
                    border: '1px solid #4f5747',
                    color: '#FFFFFF',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 3px 0 #3e4437, 0 6px 14px rgba(104, 112, 95, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
                    transition: 'all 0.12s ease'
                  }}
                >
                  Enrich Foliage (+200 Seeds)
                </button>

                <button
                  type="button"
                  onClick={handleTriggerStarPower}
                  style={{
                    padding: '10px 20px',
                    borderRadius: '12px',
                    backgroundColor: '#8C6D3B',
                    border: '1px solid #6b5329',
                    color: '#FFFFFF',
                    fontSize: '0.86rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 3px 0 #523e1b, 0 6px 14px rgba(140, 109, 59, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.25)',
                    transition: 'all 0.12s ease'
                  }}
                >
                  Mindful Radiance
                </button>
              </div>
            </div>

            {/* Growth Milestone Progress Bar */}
            <div style={{ maxWidth: '620px', margin: '0 auto', textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#34343A' }}>
                  Next Growth Stage Progress:
                </span>
                <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#9A6854' }}>
                  {gardenStats.count || 0} Reflections Logged • {Math.min(100, Math.round(((gardenStats.count || 0) % 3) / 3 * 100))}% to Next Stage
                </span>
              </div>
              <div style={{
                height: '14px',
                borderRadius: '999px',
                backgroundColor: '#EAECE8',
                overflow: 'hidden',
                border: '1px solid #D8D2CE',
                padding: '2px'
              }}>
                <div style={{
                  height: '100%',
                  borderRadius: '999px',
                  width: `${Math.min(100, Math.max(12, ((gardenStats.count || 0) / 12) * 100))}%`,
                  background: 'linear-gradient(90deg, #68705F 0%, #526257 50%, #9A6854 100%)',
                  boxShadow: '0 1px 3px rgba(82, 98, 87, 0.25)',
                  transition: 'width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
                }} />
              </div>
            </div>

          </div>
        );
      })()}

      {/* ──────────────────────────────────────────────
          TAB 5: HOPE JAR - ANIMATED DRAWING EXPERIENCE
          ────────────────────────────────────────────── */}
      {currentTab === 'hope' && (
        <div style={{ ...card3DStyle, padding: '36px 28px', textAlign: 'center' }}>
          <span className="pill-tag" style={{ marginBottom: '12px' }}>
            Hope Jar • Notes of Encouragement
          </span>

          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--main-heading)', marginBottom: '6px', marginTop: '10px' }}>
            Your Notes of Hope
          </h2>
          <p style={{ fontSize: '0.92rem', color: 'var(--body-text)', maxWidth: '520px', margin: '0 auto 24px auto', lineHeight: 1.55 }}>
            On difficult placement days, reach into your Hope Jar to draw a grounding reflection or uplifting reminder stored from your journey.
          </p>

          {/* Draw Button */}
          <button
            onClick={handleDrawHopeNote}
            className="btn-primary-spec"
            style={{
              padding: '14px 32px',
              fontSize: '0.95rem',
              fontWeight: 600,
              borderRadius: '14px',
              marginBottom: '28px',
              cursor: 'pointer'
            }}
          >
            {drawnHopeNote ? 'Draw Another Note of Hope' : 'Draw a Note of Hope'}
          </button>

          {/* Revealed Drawn Hope Note */}
          {drawnHopeNote && (
            <div style={{
              maxWidth: '540px',
              margin: '0 auto',
              padding: '28px 32px',
              borderRadius: '20px',
              backgroundColor: '#F5EBE6',
              border: '2px dashed #9A6854',
              boxShadow: '0 8px 28px rgba(154, 104, 84, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.85)',
              textAlign: 'center'
            }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--accent-terracotta)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
                <span>Note Picked from Hope Jar</span>
              </div>
              
              <p style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color: 'var(--main-heading)',
                lineHeight: 1.55,
                fontStyle: 'italic',
                margin: '0 0 14px 0'
              }}>
                "{drawnHopeNote.text}"
              </p>

              {drawnHopeNote.date && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Stored on {new Date(drawnHopeNote.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* ──────────────────────────────────────────────
          TAB 6: CALM CORNER
          ────────────────────────────────────────────── */}
      {currentTab === 'calm' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ ...card3DStyle, padding: '36px' }}>
            <h2 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#34343A', marginBottom: '6px' }}>
              Calm Corner
            </h2>
            <p style={{ fontSize: '0.9rem', color: '#66666B', marginBottom: '24px' }}>
              Visit anytime you need a quick reset, breathing space, grounding, or relaxing stretch during placement preparation.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              
              {/* 1. 2-Minute Box Breathing Exercise */}
              <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#FCF9F6', border: '1px solid #D8D2CE', textAlign: 'center', boxShadow: '0 2px 6px rgba(52, 52, 58, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34343A', marginTop: 0, marginBottom: '6px' }}>
                  2-Minute Box Breathing
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#66666B', marginBottom: '16px' }}>
                  Inhale (4s) → Hold (4s) → Exhale (4s) → Hold (4s)
                </p>

                <div style={{
                  width: '120px',
                  height: '120px',
                  margin: '0 auto 16px auto',
                  borderRadius: '50%',
                  backgroundColor: '#FCF9F6',
                  border: '4px solid #526257',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.8s ease',
                  transform: breathingPhase.startsWith('Inhale') ? 'scale(1.15)' : 'scale(1.0)',
                  boxShadow: '0 4px 16px rgba(82, 98, 87, 0.15), inset 0 1px 2px rgba(0,0,0,0.06)'
                }}>
                  <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#526257' }}>{breathingCounter}s</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#34343A' }}>{breathingPhase}</span>
                </div>

                <button
                  onClick={() => setBreathingActive(!breathingActive)}
                  className="btn-primary-spec"
                  style={{ padding: '8px 20px', fontSize: '0.85rem' }}
                >
                  {breathingActive ? 'Pause Exercise' : 'Start Breathing'}
                </button>

                <div style={{ marginTop: '12px', fontSize: '0.78rem', color: '#526257', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span>+50 Seeds awarded per full cycle to nurture your garden</span>
                </div>
              </div>

              {/* 2. Positive Affirmations */}
              <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#FCF9F6', border: '1px solid #D8D2CE', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 6px rgba(52, 52, 58, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34343A', marginTop: 0, marginBottom: '8px' }}>
                    Positive Affirmations
                  </h3>
                  <p style={{ fontSize: '0.98rem', fontWeight: 700, color: '#34343A', fontStyle: 'italic', lineHeight: 1.5, margin: '16px 0' }}>
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
              <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#FCF9F6', border: '1px solid #D8D2CE', boxShadow: '0 2px 6px rgba(52, 52, 58, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34343A', marginTop: 0, marginBottom: '6px' }}>
                  5-4-3-2-1 Grounding Technique
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#66666B', marginBottom: '12px' }}>
                  Anchor your mind in the present moment:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.82rem', color: '#34343A' }}>
                  <div>5 things you can see around you</div>
                  <div>4 things you can physically feel</div>
                  <div>3 things you hear right now</div>
                  <div>2 things you can smell</div>
                  <div>1 thing you can taste</div>
                </div>
              </div>

              {/* 4. Relaxing Stretch & Break Reminder */}
              <div style={{ padding: '24px', borderRadius: '16px', backgroundColor: '#FCF9F6', border: '1px solid #D8D2CE', boxShadow: '0 2px 6px rgba(52, 52, 58, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#34343A', marginTop: 0, marginBottom: '6px' }}>
                  Gentle Stretch Reminder
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#66666B', lineHeight: 1.5, marginBottom: '12px' }}>
                  Roll your shoulders back 3 times. Unclench your jaw. Relax your forehead. Take a deep drink of water.
                </p>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#68705F' }}>
                  You are doing great.
                </span>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
