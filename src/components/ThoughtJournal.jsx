import React, { useState, useEffect } from 'react';
import { analyzeThoughtText } from '../services/aiEngine';
import { dbService } from '../services/db';
import { CognitiveEmotionalRAGEngine } from './neroprep/engines/CognitiveEmotionalRAGEngine';

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
 { emoji: '', label: 'Happy' },
 { emoji: '', label: 'Calm' },
 { emoji: '', label: 'Neutral' },
 { emoji: '', label: 'Worried' },
 { emoji: '', label: 'Stressed' },
 { emoji: '', label: 'Low' },
 { emoji: '', label: 'Frustrated' },
 { emoji: '', label: 'Exhausted' },
 { emoji: '', label: 'Confident' }
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
 const [selectedMoods, setSelectedMoods] = useState(['Calm']);
 const [energyLevel, setEnergyLevel] = useState('Medium');
 const [journalTitle, setJournalTitle] = useState('');
 const [journalText, setJournalText] = useState('');
 const [selectedEmotions, setSelectedEmotions] = useState([]);
 const [category, setCategory] = useState('Coding & Technical');
 const [tagsInput, setTagsInput] = useState('');
 const [analysisResult, setAnalysisResult] = useState(null);
 const [liveRAGInsight, setLiveRAGInsight] = useState(null);
 const [injectedReframe, setInjectedReframe] = useState(false);

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

 // Conversational AI Diary Chatbot State
 const [chatMessages, setChatMessages] = useState([
 {
 id: 1,
 sender: 'bot',
 text: "Hey friend! I'm NeuroCoach, your personal placement diary companion. How did your preparation go today? Tell me what's on your mind — any wins, tough coding problems, or interview jitters?",
 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
 }
 ]);
 const [chatInput, setChatInput] = useState('');
 const [isBotTyping, setIsBotTyping] = useState(false);
 const [chatbotSaved, setChatbotSaved] = useState(false);
 const [chatbotEntryTitle, setChatbotEntryTitle] = useState('');
 const [chatbotCategory, setChatbotCategory] = useState('Coding & Technical');

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

 // Live Emotional Booster RAG Analysis as user types in diary
 useEffect(() => {
 if (!journalText || journalText.trim().length < 8) {
 setLiveRAGInsight(null);
 return;
 }
 const timer = setTimeout(() => {
 const insight = CognitiveEmotionalRAGEngine.analyzeDiaryEmotion(journalText);
 setLiveRAGInsight(insight);
 }, 350);

 return () => clearTimeout(timer);
 }, [journalText]);

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
 };

 // Conversational Chatbot Message Handler
 const handleSendChatMessage = (textToSend) => {
 const message = (textToSend || chatInput || '').trim();
 if (!message) return;

 const userMsg = {
 id: Date.now(),
 sender: 'user',
 text: message,
 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
 };

 const updatedMessages = [...chatMessages, userMsg];
 setChatMessages(updatedMessages);
 setChatInput('');
 setIsBotTyping(true);

 // AI Cognitive Analysis using CognitiveEmotionalRAGEngine
 setTimeout(() => {
 const allUserText = updatedMessages
 .filter(m => m.sender === 'user')
 .map(m => m.text)
 .join(' ');

 const insight = CognitiveEmotionalRAGEngine.analyzeDiaryEmotion(allUserText);

 let botResponseText = '';
 if (insight) {
 botResponseText = `${insight.greeting}\n\n${insight.empathy}\n\nHere is how I see it as your friend:\n${insight.reframe}\n\nFriendly Advice:\n${insight.friendAdvice || insight.microStep}`;
 } else {
 botResponseText = "Hey, thanks so much for opening up to me! Getting things off your chest is so helpful during placement prep. How are you feeling right now?";
 }

 const botMsg = {
 id: Date.now() + 1,
 sender: 'bot',
 text: botResponseText,
 insight: insight,
 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
 };

 setChatMessages([...updatedMessages, botMsg]);
 setIsBotTyping(false);
 }, 500);
 };

 // Save Chatbot Generated Journal Entry
 const handleSaveChatbotJournal = () => {
 const userTexts = chatMessages.filter(m => m.sender === 'user').map(m => m.text);
 if (userTexts.length === 0) return;

 const fullContent = userTexts.join('\n\n');
 const lastBotWithInsight = [...chatMessages].reverse().find(m => m.insight);
 const insight = lastBotWithInsight?.insight || CognitiveEmotionalRAGEngine.analyzeDiaryEmotion(fullContent);

 const title = chatbotEntryTitle.trim() || (insight?.detectedKeywords?.[0] ? `${insight.detectedKeywords[0].toUpperCase()} Reflection` : `Placement Diary - ${new Date().toLocaleDateString()}`);

 const entryData = {
 id: Date.now(),
 title: title,
 content: fullContent,
 moods: [insight?.startingStress > 60 ? 'Stressed' : 'Calm'],
 energy: 'Medium',
 emotions: insight?.detectedKeywords || ['Reflective'],
 category: chatbotCategory,
 tags: ['AI Chatbot Diary', chatbotCategory],
 wins: ['Shared honest thoughts with NeuroCoach', 'Applied cognitive reframing'],
 gratitude: "Grateful for today's learning and resilience.",
 tomorrowGoals: [insight?.microStep || 'Review today\'s key concepts for 20 minutes'],
 date: new Date().toLocaleDateString(),
 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
 analysis: {
 thinkingPattern: { name: insight?.distortionName || 'Balanced Growth' },
 positiveConclusion: {
 whatYouDidToday: "Externalized placement thoughts and reframed stress with NeuroCoach.",
 whatYouMightTryTomorrow: insight?.microStep || "Take one small step toward technical preparation.",
 gentleReminder: insight?.affirmation || "Progress comes with steady daily consistency."
 }
 },
 reframing: {
 balancedThought: insight?.reframe || "I am making steady progress step by step."
 }
 };

 if (onSaveEntry) {
 onSaveEntry(entryData);
 }
 setChatbotSaved(true);
 setTimeout(() => setChatbotSaved(false), 4000);
 };

 const handleResetChatbot = () => {
 setChatMessages([
 {
 id: Date.now(),
 sender: 'bot',
 text: "Hey friend! I'm NeuroCoach, your personal placement diary companion. How did your preparation go today? Tell me what's on your mind — any wins, tough coding problems, or interview jitters?",
 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
 }
 ]);
 setChatInput('');
 setChatbotSaved(false);
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
 { id: 'wizard', label: 'AI Diary Chatbot' },
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

 {/* ─────────────────────────────────────────────
 TAB 1: CONVERSATIONAL AI DIARY CHATBOT FLOW
 ───────────────────────────────────────────── */}
 {currentTab === 'wizard' && (
 <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '24px', alignItems: 'start' }}>
 
 {/* LEFT COLUMN: INTERACTIVE CHAT WITH NEUROCOACH */}
 <div style={{
 backgroundColor: '#FFFFFF',
 borderRadius: '20px',
 border: '1px solid #E5E7EB',
 padding: '24px',
 boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
 display: 'flex',
 flexDirection: 'column',
 minHeight: '620px'
 }}>
 
 {/* Chatbot Header */}
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #F3F4F6', marginBottom: '16px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <div style={{
 width: '42px',
 height: '42px',
 borderRadius: '12px',
 backgroundColor: '#111827',
 color: '#FFFFFF',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 fontSize: '20px',
 fontWeight: 800
 }}>
 NC
 </div>
 <div>
 <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
 NeuroCoach AI Companion
 </h3>
 <span style={{ fontSize: '0.78rem', color: '#15803D', fontWeight: 600 }}>
 ● Real-Time Emotion & Cognitive Reappraisal Active
 </span>
 </div>
 </div>
 <button
 type="button"
 onClick={handleResetChatbot}
 className="btn-secondary-spec"
 style={{ padding: '6px 12px', fontSize: '0.78rem', fontWeight: 600 }}
 >
 Reset Chat
 </button>
 </div>

 {/* Quick Action Prompt Chips */}
 <div style={{ marginBottom: '16px' }}>
 <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.4px', display: 'block', marginBottom: '8px' }}>
 Quick Prompts to Start:
 </span>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
 {[
 { text: ' Solved a tricky DSA problem today!', label: 'Coding Win' },
 { text: ' Feeling anxious about upcoming placement rounds', label: 'Exam Jitters' },
 { text: ' Struggled with a technical interview concept and felt stuck', label: 'Technical Block' },
 { text: ' Comparing myself with batchmates who got offers', label: 'Peer Comparison' },
 { text: ' Feeling exhausted from preparation, need to reset', label: 'Burnout & Rest' }
 ].map((chip, idx) => (
 <button
 key={idx}
 type="button"
 onClick={() => handleSendChatMessage(chip.text)}
 style={{
 padding: '6px 12px',
 borderRadius: '999px',
 backgroundColor: '#F9FAFB',
 border: '1px solid #E5E7EB',
 fontSize: '0.8rem',
 fontWeight: 600,
 color: '#374151',
 cursor: 'pointer',
 transition: 'all 0.15s ease'
 }}
 >
 {chip.text}
 </button>
 ))}
 </div>
 </div>

 {/* Messages Scroll Area */}
 <div style={{
 flex: 1,
 overflowY: 'auto',
 maxHeight: '420px',
 paddingRight: '6px',
 display: 'flex',
 flexDirection: 'column',
 gap: '14px',
 marginBottom: '16px'
 }}>
 {chatMessages.map((msg) => {
 const isBot = msg.sender === 'bot';
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
 padding: '14px 18px',
 borderRadius: isBot ? '16px 16px 16px 4px' : '16px 16px 4px 16px',
 backgroundColor: isBot ? '#F8FAFC' : '#111827',
 color: isBot ? '#1E293B' : '#FFFFFF',
 border: isBot ? '1px solid #E2E8F0' : 'none',
 fontSize: '0.9rem',
 lineHeight: 1.6,
 whiteSpace: 'pre-wrap'
 }}>
 {msg.text}

 {/* Insight Card if attached */}
 {msg.insight && (
 <div style={{
 marginTop: '12px',
 padding: '10px 14px',
 borderRadius: '10px',
 backgroundColor: '#F0FDF4',
 border: '1px solid #BBF7D0',
 fontSize: '0.82rem',
 color: '#166534'
 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
 <span style={{ fontWeight: 800 }}>{msg.insight.distortionName}</span>
 <span style={{ fontWeight: 700, color: '#047857' }}>
 -{msg.insight.stressDelta}% Stress Relief
 </span>
 </div>
 <div style={{ fontStyle: 'italic', color: '#15803D' }}>
 "{msg.insight.affirmation}"
 </div>
 </div>
 )}
 </div>
 <span style={{ fontSize: '0.72rem', color: '#9CA3AF', marginTop: '4px', marginInline: '6px' }}>
 {isBot ? 'NeuroCoach' : 'You'} • {msg.time}
 </span>
 </div>
 );
 })}

 {isBotTyping && (
 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 16px', backgroundColor: '#F8FAFC', borderRadius: '12px', width: 'fit-content' }}>
 <span style={{ fontSize: '0.82rem', color: '#64748B', fontWeight: 600 }}>NeuroCoach is reflecting on your thoughts...</span>
 </div>
 )}
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
 padding: '12px 16px',
 borderRadius: '12px',
 border: '1px solid #D1D5DB',
 fontSize: '0.92rem',
 outline: 'none'
 }}
 />
 <button
 type="submit"
 className="btn-primary-spec"
 style={{ padding: '12px 22px', fontSize: '0.9rem', borderRadius: '12px', whiteSpace: 'nowrap' }}
 >
 Send & Reflect
 </button>
 </form>

 </div>

 {/* RIGHT COLUMN: LIVE AUTO-GENERATED DIARY SUMMARY CARD */}
 <div style={{
 backgroundColor: '#FFFFFF',
 borderRadius: '20px',
 border: '1px solid #E5E7EB',
 padding: '24px',
 boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
 display: 'flex',
 flexDirection: 'column'
 }}>
 
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
 <div>
 <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
 Live Placement Diary Card
 </span>
 <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>
 Structured Entry Preview
 </h3>
 </div>
 <span className="pill-tag" style={{ fontSize: '0.75rem' }}>
 {new Date().toLocaleDateString()}
 </span>
 </div>

 {/* Title & Category Config */}
 <div style={{ marginBottom: '16px' }}>
 <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
 Diary Entry Title
 </label>
 <input
 type="text"
 placeholder="e.g. Tough Tree Problem / Pre-Interview Reflection"
 value={chatbotEntryTitle}
 onChange={(e) => setChatbotEntryTitle(e.target.value)}
 style={{
 width: '100%',
 padding: '9px 12px',
 borderRadius: '8px',
 border: '1px solid #D1D5DB',
 fontSize: '0.88rem'
 }}
 />
 </div>

 <div style={{ marginBottom: '16px' }}>
 <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: '#374151', marginBottom: '4px' }}>
 Category
 </label>
 <select
 value={chatbotCategory}
 onChange={(e) => setChatbotCategory(e.target.value)}
 style={{
 width: '100%',
 padding: '9px 12px',
 borderRadius: '8px',
 border: '1px solid #D1D5DB',
 fontSize: '0.88rem',
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

 {/* Conversation Synthesis Preview */}
 <div style={{
 backgroundColor: '#F9FAFB',
 borderRadius: '12px',
 border: '1px solid #E5E7EB',
 padding: '16px',
 marginBottom: '20px',
 flex: 1
 }}>
 <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#6B7280', textTransform: 'uppercase', marginBottom: '6px' }}>
 Your Thoughts
 </div>
 <div style={{ fontSize: '0.88rem', color: '#1F2937', lineHeight: 1.5, maxHeight: '110px', overflowY: 'auto', marginBottom: '14px' }}>
 {chatMessages.filter(m => m.sender === 'user').length > 0 ? (
 chatMessages.filter(m => m.sender === 'user').map(m => m.text).join(' • ')
 ) : (
 <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>
 Your thoughts will automatically compile here as you chat with NeuroCoach...
 </span>
 )}
 </div>

 <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#15803D', textTransform: 'uppercase', marginBottom: '6px' }}>
 Balanced Perspective & Takeaway
 </div>
 <div style={{ fontSize: '0.86rem', color: '#166534', lineHeight: 1.5, maxHeight: '90px', overflowY: 'auto' }}>
 {chatMessages.filter(m => m.insight).length > 0 ? (
 [...chatMessages].reverse().find(m => m.insight)?.insight?.reframe
 ) : (
 <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>
 Evidence-based cognitive reframe will appear here.
 </span>
 )}
 </div>
 </div>

 {/* Save Button */}
 {chatbotSaved ? (
 <div style={{
 padding: '14px',
 borderRadius: '12px',
 backgroundColor: '#DCFCE7',
 border: '1px solid #86EFAC',
 color: '#166534',
 textAlign: 'center',
 fontWeight: 700,
 fontSize: '0.9rem'
 }}>
 Diary Entry Saved Successfully! Garden Growing 
 </div>
 ) : (
 <button
 type="button"
 onClick={handleSaveChatbotJournal}
 disabled={chatMessages.filter(m => m.sender === 'user').length === 0}
 className="btn-primary-spec"
 style={{
 width: '100%',
 padding: '13px 20px',
 fontSize: '0.92rem',
 borderRadius: '12px',
 opacity: chatMessages.filter(m => m.sender === 'user').length === 0 ? 0.6 : 1,
 cursor: chatMessages.filter(m => m.sender === 'user').length === 0 ? 'not-allowed' : 'pointer'
 }}
 >
 Save to My Placement Diary
 </button>
 )}

 <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '14px' }}>
 <button
 type="button"
 onClick={() => setCurrentTab('history')}
 style={{ background: 'none', border: 'none', color: '#4B5563', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
 >
 View History ({journalEntries.length})
 </button>
 <button
 type="button"
 onClick={() => setCurrentTab('garden')}
 style={{ background: 'none', border: 'none', color: '#4B5563', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}
 >
 Achievement Garden
 </button>
 </div>

 </div>

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
 {entry.moods?.[0] || ' Calm'}
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

