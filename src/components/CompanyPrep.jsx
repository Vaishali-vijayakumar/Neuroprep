import React, { useState, useEffect } from 'react';
import { 
 COMPANY_PREP_CATALOG, 
 COMPANY_TIERS 
} from '../data/companyPrepData';
import { dbService } from '../services/db';
import { 
 Search, 
 Layers, 
 BookOpen, 
 CheckSquare, 
 Table, 
 ShieldAlert, 
 Code2, 
 Brain, 
 MessageSquare,
 CheckCircle2,
 FileText,
 UserCheck,
 Plus,
 ChevronDown,
 ChevronUp,
 Edit3,
 Award,
 Sparkles
} from 'lucide-react';

export default function CompanyPrep({ setActiveTab }) {
 const [searchQuery, setSearchQuery] = useState('');
 const [selectedTier, setSelectedTier] = useState('ALL');
 const [selectedCompanyId, setSelectedCompanyId] = useState(null);
 const [editingNoteTopicId, setEditingNoteTopicId] = useState(null);
 const [activeNoteText, setActiveNoteText] = useState('');
 const [activeDetailTab, setActiveDetailTab] = useState('rounds'); // 'rounds' | 'topics' | 'experiences' | 'checklist' | 'benchmark'

 // Scroll to top whenever company selection or detail tab changes
 useEffect(() => {
 window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
 if (document.documentElement) document.documentElement.scrollTop = 0;
 if (document.body) document.body.scrollTop = 0;
 }, [selectedCompanyId, activeDetailTab]);
 
 // Experience Publishing Modal State
 const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
 const [publishedExperiences, setPublishedExperiences] = useState([]);
 const [publishToast, setPublishToast] = useState('');

 // Form State for Publishing New Experience
 const [formName, setFormName] = useState('');
 const [formCollege, setFormCollege] = useState('');
 const [formYear, setFormYear] = useState('2025');
 const [formRole, setFormRole] = useState('');
 const [formStatus, setFormStatus] = useState('Selected');
 const [formRating, setFormRating] = useState('Moderate');
 const [formRound1Name, setFormRound1Name] = useState('Online Assessment & Coding');
 const [formRound1Questions, setFormRound1Questions] = useState('');
 const [formRound2Name, setFormRound2Name] = useState('Technical & HR Interview');
 const [formRound2Questions, setFormRound2Questions] = useState('');
 const [formProTips, setFormProTips] = useState('');

 // ─────────────────────────────────────────────
 // REVISION & MASTERY TRACKER STATE
 // ─────────────────────────────────────────────
 const userEmail = localStorage.getItem('neuroprep_user_session') 
 ? JSON.parse(localStorage.getItem('neuroprep_user_session')).email 
 : 'guest';

 const safeUserEmail = userEmail.replace(/[^a-z0-9]/gi, '_').toLowerCase();
 const MASTERY_STORAGE_KEY = `neuroprep_mastery_tracker_${safeUserEmail}`;
 const NOTES_STORAGE_KEY = `neuroprep_topic_notes_${safeUserEmail}`;

 // Topic Status Map: { 'tcs_num_sys': 0|1|2|3 } (0: Not Started, 1: Concept Learned, 2: Practiced, 3: Exam Mastered)
 const [topicMastery, setTopicMastery] = useState(() => {
 try {
 const raw = localStorage.getItem(MASTERY_STORAGE_KEY);
 return raw ? JSON.parse(raw) : {};
 } catch (e) {
 return {};
 }
 });

 // Topic Notes Map: { 'tcs_num_sys': 'Custom user study notes...' }
 const [topicNotes, setTopicNotes] = useState(() => {
 try {
 const raw = localStorage.getItem(NOTES_STORAGE_KEY);
 return raw ? JSON.parse(raw) : {};
 } catch (e) {
 return {};
 }
 });

 // Expanded Topic Cards Map: { 'tcs_num_sys': true/false }
 const [expandedTopicId, setExpandedTopicId] = useState(null);

 useEffect(() => {
 try {
 localStorage.setItem(MASTERY_STORAGE_KEY, JSON.stringify(topicMastery));
 } catch (e) {
 // Ignore write errors
 }
 }, [topicMastery]);

 useEffect(() => {
 try {
 localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(topicNotes));
 } catch (e) {
 // Ignore write errors
 }
 }, [topicNotes]);

 // Load community published experiences for selected company
 useEffect(() => {
 if (selectedCompanyId) {
 const loaded = dbService.getPublishedCompanyExperiences(selectedCompanyId);
 setPublishedExperiences(loaded);
 }
 }, [selectedCompanyId]);

 const handleSetTopicStatus = (topicId, statusLevel) => {
 setTopicMastery(prev => ({
 ...prev,
 [topicId]: statusLevel
 }));
 };

 const handleUpdateTopicNote = (topicId, noteText) => {
 setTopicNotes(prev => ({
 ...prev,
 [topicId]: noteText
 }));
 };

 const handleOpenPublishModal = (company) => {
 setFormName(userEmail !== 'guest' ? userEmail.split('@')[0] : '');
 setFormRole(company.roles[0] || 'Software Engineer');
 setIsPublishModalOpen(true);
 };

 const handlePublishSubmit = (e) => {
 e.preventDefault();
 if (!selectedCompanyId) return;

 const roundSummaries = [];
 if (formRound1Questions.trim()) {
 roundSummaries.push({
 roundName: formRound1Name,
 questionsAsked: formRound1Questions.split('\n').filter(q => q.trim()),
 keyTakeaway: 'Focus on speed, accuracy, and edge case test coverage.'
 });
 }
 if (formRound2Questions.trim()) {
 roundSummaries.push({
 roundName: formRound2Name,
 questionsAsked: formRound2Questions.split('\n').filter(q => q.trim()),
 keyTakeaway: 'Explain your reasoning out loud and state time complexity.'
 });
 }

 const tipsArray = formProTips.split('\n').filter(t => t.trim());

 const expRecord = {
 companyId: selectedCompanyId,
 studentName: formName.trim() || 'Anonymous Candidate',
 college: formCollege.trim() || 'Engineering Institute',
 year: formYear,
 role: formRole.trim(),
 status: formStatus,
 rating: formRating,
 isCommunityShared: true,
 roundSummaries: roundSummaries.length > 0 ? roundSummaries : [
 {
 roundName: 'Technical & Coding Round',
 questionsAsked: ['Data Structure & Algorithmic Problem Solving', 'SQL Queries & Database Fundamentals'],
 keyTakeaway: 'Clear concept explanation and optimal complexity.'
 }
 ],
 proTips: tipsArray.length > 0 ? tipsArray : ['Revise core DSA patterns and practice mock interviews regularly.']
 };

 // Save to Database & Local Storage via dbService
 const saved = dbService.publishCompanyExperience(expRecord);
 if (saved) {
 setPublishedExperiences(prev => [saved, ...prev]);
 setIsPublishModalOpen(false);
 setPublishToast('Your interview experience has been published and saved to the database! Visible to all students.');
 setTimeout(() => setPublishToast(''), 5000);
 
 // Reset form
 setFormCollege('');
 setFormRound1Questions('');
 setFormRound2Questions('');
 setFormProTips('');
 }
 };

 // Filter logic
 const filteredCompanies = COMPANY_PREP_CATALOG.filter(c => {
 const matchesTier = selectedTier === 'ALL' || c.tier === selectedTier;
 const matchesQuery = c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
 c.type.toLowerCase().includes(searchQuery.toLowerCase());
 return matchesTier && matchesQuery;
 });

 const activeCompany = COMPANY_PREP_CATALOG.find(c => c.id === selectedCompanyId);

 // IF COMPANY DETAIL PAGE IS ACTIVE
 if (activeCompany) {
 const c = activeCompany;

 // Combine static catalog experiences with user-published database experiences
 const allExperiences = [
 ...publishedExperiences,
 ...(c.experiences || [])
 ];

 // Master Tracker Calculations
 const trackerList = c.revisionTracker || [];
 const totalTopics = trackerList.length;

 let masteredCount = 0;
 let practicedCount = 0;
 let conceptCount = 0;
 let notStartedCount = 0;
 let totalScorePoints = 0;

 trackerList.forEach(tItem => {
 const lvl = topicMastery[tItem.id] || 0;
 if (lvl === 3) {
 masteredCount++;
 totalScorePoints += 3;
 } else if (lvl === 2) {
 practicedCount++;
 totalScorePoints += 2;
 } else if (lvl === 1) {
 conceptCount++;
 totalScorePoints += 1;
 } else {
 notStartedCount++;
 }
 });

 const maxScorePoints = totalTopics > 0 ? totalTopics * 3 : 1;
 const readinessPct = totalTopics > 0 ? Math.round((totalScorePoints / maxScorePoints) * 100) : 0;

 return (
 <div style={{ flex: 1, padding: '36px 32px', maxWidth: '1280px', margin: '0 auto', width: '100%', fontFamily: 'var(--font-inter)' }}>
 
 {/* Toast Notification */}
 {publishToast && (
 <div style={{
 position: 'fixed',
 top: '24px',
 right: '24px',
 zIndex: 9999,
 backgroundColor: '#111827',
 color: '#FFFFFF',
 padding: '14px 20px',
 borderRadius: '8px',
 fontSize: '0.88rem',
 fontWeight: 600,
 boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
 display: 'flex',
 alignItems: 'center',
 gap: '10px'
 }}>
 <CheckCircle2 size={18} />
 <span>{publishToast}</span>
 </div>
 )}

 {/* Navigation Header */}
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
 <button
 onClick={() => setSelectedCompanyId(null)}
 className="btn-secondary-spec"
 style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600 }}
 >
 Back to Companies
 </button>
 
 <button
 onClick={() => setActiveTab && setActiveTab('dashboard')}
 className="btn-secondary-spec"
 style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600 }}
 >
 Back to Dashboard
 </button>
 </div>

 {/* Company Header Banner (Strict Monochrome Theme) */}
 <div className="saas-card-spec" style={{ padding: '32px', marginBottom: '28px', backgroundColor: '#FFFFFF', borderLeft: '4px solid #111827' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
 <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
 <div style={{
 width: '64px',
 height: '64px',
 borderRadius: '14px',
 backgroundColor: '#111827',
 color: '#FFFFFF',
 fontWeight: 900,
 fontSize: '1.15rem',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 letterSpacing: '-0.5px'
 }}>
 {c.logo}
 </div>

 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
 <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#111827', margin: 0, letterSpacing: '-0.5px' }}>
 {c.fullName} ({c.name})
 </h1>
 <span style={{
 fontSize: '0.75rem',
 fontWeight: 700,
 padding: '4px 12px',
 borderRadius: '6px',
 backgroundColor: '#F3F4F6',
 color: '#374151',
 border: '1px solid #E5E7EB'
 }}>
 {c.type}
 </span>
 </div>

 <div style={{ fontSize: '0.88rem', color: '#4B5563', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
 <span>Package: <strong style={{ color: '#111827' }}>{c.package}</strong></span>
 <span>•</span>
 <span>Stages: <strong style={{ color: '#111827' }}>{c.rounds.length} Selection Rounds</strong></span>
 </div>
 </div>
 </div>

 {/* Target Roles & Eligibility */}
 <div style={{ backgroundColor: '#F8F9FA', padding: '16px 20px', borderRadius: '12px', border: '1px solid #E5E7EB', maxWidth: '380px' }}>
 <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 700, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
 Eligibility Requirement
 </div>
 <div style={{ fontSize: '0.82rem', color: '#374151', lineHeight: 1.5, marginBottom: '10px' }}>
 {c.eligibility}
 </div>
 <div style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 700, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
 Active Hiring Profiles
 </div>
 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
 {c.roles.map((r, rIdx) => (
 <span key={rIdx} style={{ fontSize: '0.72rem', backgroundColor: '#FFFFFF', border: '1px solid #D1D5DB', padding: '3px 8px', borderRadius: '4px', color: '#111827', fontWeight: 600 }}>
 {r}
 </span>
 ))}
 </div>
 </div>
 </div>

 <p style={{ marginTop: '20px', fontSize: '0.9rem', color: '#4B5563', lineHeight: 1.6, borderTop: '1px solid #F3F4F6', paddingTop: '16px', margin: '20px 0 0 0' }}>
 {c.overview}
 </p>
 </div>

 {/* Detail Tabs Navigation Bar (Short labels, no scrolling) */}
 <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', flexWrap: 'wrap' }}>
 {[
 { id: 'rounds', label: 'Exam Rounds', icon: Layers },
 { id: 'topics', label: 'Topic Syllabus', icon: BookOpen },
 { id: 'experiences', label: 'Interview Experiences', icon: UserCheck },
 { id: 'checklist', label: 'Revision Tracker', icon: CheckSquare },
 { id: 'benchmark', label: 'Role & Package Matrix', icon: Table }
 ].map(tab => {
 const Icon = tab.icon;
 const isActive = activeDetailTab === tab.id;
 return (
 <button
 key={tab.id}
 onClick={() => setActiveDetailTab(tab.id)}
 style={{
 padding: '9px 16px',
 borderRadius: '8px',
 border: isActive ? '1px solid #111827' : '1px solid #E5E7EB',
 backgroundColor: isActive ? '#374151' : '#FFFFFF',
 color: isActive ? '#FFFFFF' : '#4B5563',
 fontWeight: 600,
 fontSize: '0.85rem',
 cursor: 'pointer',
 display: 'flex',
 alignItems: 'center',
 gap: '6px',
 whiteSpace: 'nowrap',
 transition: 'all 0.15s ease'
 }}
 >
 <Icon size={16} />
 {tab.label}
 </button>
 );
 })}
 </div>

 {/* TAB 1: EXAM STAGES & ROUNDS */}
 {activeDetailTab === 'rounds' && (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
 <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
 Selection Process & Stage Breakdown ({c.rounds.length} Stages)
 </h3>

 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
 {c.rounds.map((round, idx) => (
 <div key={idx} className="saas-card-spec" style={{ padding: '24px', backgroundColor: '#FFFFFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
 <div>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
 <span style={{
 width: '28px',
 height: '28px',
 borderRadius: '6px',
 backgroundColor: '#111827',
 color: '#FFFFFF',
 display: 'inline-flex',
 alignItems: 'center',
 justifyContent: 'center',
 fontSize: '0.85rem',
 fontWeight: 800
 }}>
 {idx + 1}
 </span>

 <span style={{
 fontSize: '0.75rem',
 fontWeight: 700,
 padding: '4px 10px',
 borderRadius: '4px',
 backgroundColor: '#F3F4F6',
 color: '#374151',
 border: '1px solid #E5E7EB'
 }}>
 {round.difficulty}
 </span>
 </div>

 <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#111827', marginBottom: '12px' }}>
 {round.name.replace(/^(Stage|Round)\s*\d+:\s*/i, '')}
 </h4>

 <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, marginBottom: '20px' }}>
 {round.description}
 </p>
 </div>

 <div style={{ borderTop: '1px solid #F3F4F6', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.8rem', color: '#6B7280' }}>
 <div>
 <span>Duration:</span>
 <strong style={{ display: 'block', color: '#111827', marginTop: '2px' }}>{round.duration}</strong>
 </div>
 <div>
 <span>Questions:</span>
 <strong style={{ display: 'block', color: '#111827', marginTop: '2px' }}>{round.questions}</strong>
 </div>
 <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
 <span>Evaluation Criteria:</span>
 <strong style={{ display: 'block', color: '#374151', marginTop: '2px' }}>{round.marking}</strong>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* TAB 2: DETAILED SYLLABUS & TOPICS TO COVER */}
 {activeDetailTab === 'topics' && (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
 <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
 Detailed Topics to Cover for {c.name}
 </h3>

 <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
 {(c.topicsToCover || []).map((s, idx) => (
 <div key={idx} className="saas-card-spec" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #F3F4F6', paddingBottom: '14px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
 <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0 }}>
 {s.category}
 </h4>
 <span style={{
 fontSize: '0.75rem',
 fontWeight: 700,
 padding: '3px 10px',
 borderRadius: '4px',
 backgroundColor: '#F3F4F6',
 color: '#374151',
 border: '1px solid #E5E7EB'
 }}>
 {s.priority} Priority
 </span>
 </div>

 <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827', backgroundColor: '#F8F9FA', padding: '6px 14px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
 Weightage: {s.weightage}
 </div>
 </div>

 <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
 {s.topics.map((t, tIdx) => (
 <span key={tIdx} style={{
 fontSize: '0.85rem',
 fontWeight: 600,
 padding: '8px 14px',
 borderRadius: '6px',
 backgroundColor: '#F8F9FA',
 color: '#374151',
 border: '1px solid #E5E7EB',
 display: 'inline-flex',
 alignItems: 'center',
 gap: '6px'
 }}>
 <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#374151' }} />
 {t}
 </span>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* TAB 3: INTERVIEW EXPERIENCES & ARCHIVE WITH PUBLISH TO DB OPTION */}
 {activeDetailTab === 'experiences' && (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
 <div>
 <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
 Real Placement Interview Reports & Community Database ({allExperiences.length})
 </h3>
 <p style={{ fontSize: '0.83rem', color: '#6B7280', margin: '4px 0 0 0' }}>
 Read verified placement interview experiences or publish your own interview report to the shared database.
 </p>
 </div>

 <button
 onClick={() => handleOpenPublishModal(c)}
 className="btn-secondary-spec"
 style={{
 padding: '10px 20px',
 fontSize: '0.88rem',
 fontWeight: 600,
 backgroundColor: '#374151',
 color: '#FFFFFF',
 borderColor: '#374151',
 display: 'flex',
 alignItems: 'center',
 gap: '8px'
 }}
 >
 <Plus size={16} /> Publish Your Experience
 </button>
 </div>

 {/* List of Experiences */}
 <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
 {allExperiences.map((exp, idx) => (
 <div key={exp.id || idx} className="saas-card-spec" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid #F3F4F6', paddingBottom: '14px' }}>
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
 <h4 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0 }}>
 {exp.studentName}
 </h4>
 <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: '4px', backgroundColor: '#F3F4F6', color: '#111827', border: '1px solid #E5E7EB' }}>
 {exp.status}
 </span>
 {exp.isCommunityShared && (
 <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#111827', color: '#FFFFFF' }}>
 Community Shared DB
 </span>
 )}
 </div>
 <div style={{ fontSize: '0.82rem', color: '#6B7280', marginTop: '4px' }}>
 {exp.college} • Class of {exp.year} • Role: <strong>{exp.role}</strong>
 </div>
 </div>

 <div style={{ textAlign: 'right' }}>
 <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>Overall Difficulty</span>
 <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#111827', marginTop: '2px' }}>{exp.rating}</div>
 </div>
 </div>

 {/* Round by Round Summaries */}
 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
 {(exp.roundSummaries || []).map((rSummary, rIdx) => (
 <div key={rIdx} style={{ backgroundColor: '#F8F9FA', padding: '18px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
 <h5 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#111827', margin: '0 0 10px 0' }}>
 {rSummary.roundName}
 </h5>
 
 <div style={{ fontSize: '0.85rem', color: '#374151', marginBottom: '10px' }}>
 <strong>Questions & Scenarios Asked:</strong>
 <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', lineHeight: 1.6 }}>
 {rSummary.questionsAsked.map((q, qIdx) => (
 <li key={qIdx}>{q}</li>
 ))}
 </ul>
 </div>

 {rSummary.keyTakeaway && (
 <div style={{ fontSize: '0.82rem', color: '#6B7280', fontStyle: 'italic', borderTop: '1px solid #E5E7EB', paddingTop: '8px', marginTop: '8px' }}>
 Key Takeaway: {rSummary.keyTakeaway}
 </div>
 )}
 </div>
 ))}
 </div>

 {/* Pro Tips */}
 {exp.proTips && exp.proTips.length > 0 && (
 <div style={{ backgroundColor: '#F8F9FA', padding: '16px 20px', borderRadius: '8px', border: '1px solid #D1D5DB' }}>
 <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#111827', marginBottom: '6px' }}>
 Candidate Advice & Key Focus Areas
 </div>
 <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.83rem', color: '#4B5563', lineHeight: 1.6 }}>
 {exp.proTips.map((tip, tIdx) => (
 <li key={tIdx}>{tip}</li>
 ))}
 </ul>
 </div>
 )}
 </div>
 ))}
 </div>
 </div>
 )}

 {/* TAB 4: ENHANCED REVISION & MASTERY TRACKER */}
 {activeDetailTab === 'checklist' && (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
 {/* Top Readiness Score Dashboard Banner */}
 <div className="saas-card-spec" style={{ padding: '28px', backgroundColor: '#FFFFFF' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
 <div>
 <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: 0 }}>
 {c.name} Technical Mastery & Readiness Engine
 </h3>
 <p style={{ fontSize: '0.88rem', color: '#4B5563', margin: '4px 0 0 0' }}>
 Track multi-stage topic readiness, store personal revision notes, and calculate your exam preparedness.
 </p>
 </div>

 {/* Score Indicator */}
 <div style={{ textAlign: 'right', backgroundColor: '#F8F9FA', padding: '16px 24px', borderRadius: '12px', border: '1px solid #E5E7EB', flexShrink: 0 }}>
 <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#111827', lineHeight: 1 }}>
 {readinessPct}%
 </div>
 <div style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
 Exam Readiness Score
 </div>
 </div>
 </div>

 {/* Readiness Progress Bar */}
 <div style={{ height: '10px', width: '100%', backgroundColor: '#E5E7EB', borderRadius: '5px', overflow: 'hidden', marginBottom: '20px' }}>
 <div style={{
 height: '100%',
 width: `${readinessPct}%`,
 backgroundColor: '#111827',
 borderRadius: '5px',
 transition: 'width 0.4s ease-in-out'
 }} />
 </div>

 {/* Status Counts Breakdown Grid */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
 <div style={{ backgroundColor: '#F8F9FA', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
 <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Exam Mastered</div>
 <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2px' }}>{masteredCount}</div>
 </div>

 <div style={{ backgroundColor: '#F8F9FA', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
 <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Practiced</div>
 <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2px' }}>{practicedCount}</div>
 </div>

 <div style={{ backgroundColor: '#F8F9FA', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
 <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Concept Only</div>
 <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2px' }}>{conceptCount}</div>
 </div>

 <div style={{ backgroundColor: '#F8F9FA', padding: '12px 16px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
 <div style={{ fontSize: '0.75rem', color: '#6B7280', fontWeight: 700, textTransform: 'uppercase' }}>Unvisited</div>
 <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', marginTop: '2px' }}>{notStartedCount}</div>
 </div>
 </div>
 </div>

 {/* List of Topic Mastery Cards */}
 <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
 {trackerList.map((tItem) => {
 const currentLevel = topicMastery[tItem.id] || 0;
 const isExpanded = expandedTopicId === tItem.id;
 const userNote = topicNotes[tItem.id] || '';

 const levelLabels = ['Not Started', 'Concept Learned', 'Practiced', 'Exam Mastered'];

 return (
 <div
 key={tItem.id}
 className="saas-card-spec"
 style={{
 backgroundColor: '#FFFFFF',
 borderRadius: '12px',
 border: currentLevel === 3 ? '1.5px solid #111827' : '1px solid #E5E7EB',
 overflow: 'hidden',
 transition: 'all 0.2s ease'
 }}
 >
 {/* Header Row */}
 <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
 <div style={{ flex: 1, minWidth: '240px' }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
 <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0 }}>
 {tItem.topic}
 </h4>
 <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '4px', backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB' }}>
 {tItem.category}
 </span>
 </div>

 <div style={{ fontSize: '0.8rem', color: '#6B7280' }}>
 Exam Frequency: <strong style={{ color: '#111827' }}>{tItem.frequency}</strong>
 </div>
 </div>

 {/* 4-Stage Mastery Selector Buttons */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
 {[0, 1, 2, 3].map((lvl) => {
 const isSelected = currentLevel === lvl;
 return (
 <button
 key={lvl}
 onClick={() => handleSetTopicStatus(tItem.id, lvl)}
 style={{
 padding: '6px 12px',
 borderRadius: '6px',
 border: isSelected ? '1px solid #111827' : '1px solid #E5E7EB',
 backgroundColor: isSelected ? '#374151' : '#FFFFFF',
 color: isSelected ? '#FFFFFF' : '#4B5563',
 fontSize: '0.75rem',
 fontWeight: 700,
 cursor: 'pointer',
 transition: 'all 0.15s ease'
 }}
 >
 {levelLabels[lvl]}
 </button>
 );
 })}

 {/* Expand Toggle Button */}
 <button
 onClick={() => setExpandedTopicId(isExpanded ? null : tItem.id)}
 style={{
 background: 'none',
 border: 'none',
 cursor: 'pointer',
 color: '#6B7280',
 padding: '4px',
 marginLeft: '8px',
 display: 'flex',
 alignItems: 'center'
 }}
 >
 {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
 </button>
 </div>
 </div>

 {/* Expanded Details & Personal Notes Section */}
 {isExpanded && (
 <div style={{ padding: '20px 24px', backgroundColor: '#F8F9FA', borderTop: '1px solid #E5E7EB' }}>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
 <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
 <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#111827', marginBottom: '4px', textTransform: 'uppercase' }}>
 Key Formula / Cheat-Sheet
 </div>
 <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>
 {tItem.keyFormula}
 </div>
 </div>

 <div style={{ backgroundColor: '#FFFFFF', padding: '14px', borderRadius: '8px', border: '1px solid #E5E7EB' }}>
 <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#111827', marginBottom: '4px', textTransform: 'uppercase' }}>
 Practice Action Target
 </div>
 <div style={{ fontSize: '0.85rem', color: '#374151', lineHeight: 1.5 }}>
 {tItem.practiceTarget}
 </div>
 </div>
 </div>

 {/* Personal Notes Textarea */}
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>
 <Edit3 size={14} /> Personal Study Notes & Formula Reminders (Saved)
 </div>
 <textarea
 rows="2"
 placeholder="Write your custom notes, shortcuts, or tricky edge cases for this topic..."
 value={userNote}
 onChange={(e) => handleUpdateTopicNote(tItem.id, e.target.value)}
 style={{
 width: '100%',
 padding: '10px 14px',
 borderRadius: '6px',
 border: '1px solid #D1D5DB',
 fontSize: '0.85rem',
 fontFamily: 'inherit',
 boxSizing: 'border-box'
 }}
 />
 </div>
 </div>
 )}
 </div>
 );
 })}
 </div>
 </div>
 )}

 {/* TAB 5: ROLE & PACKAGE BENCHMARK */}
 {activeDetailTab === 'benchmark' && (
 <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
 <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#111827', margin: 0, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
 Role Tier, CTC Breakdown & Service Matrix
 </h3>

 <div className="saas-card-spec" style={{ padding: '24px', backgroundColor: '#FFFFFF', overflowX: 'auto' }}>
 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
 <thead>
 <tr style={{ borderBottom: '2px solid #E5E7EB', backgroundColor: '#F8F9FA' }}>
 <th style={{ padding: '14px 16px', fontWeight: 800, color: '#111827' }}>Recruitment Role Profile</th>
 <th style={{ padding: '14px 16px', fontWeight: 800, color: '#111827' }}>Annual CTC Package</th>
 <th style={{ padding: '14px 16px', fontWeight: 800, color: '#111827' }}>Service Agreement / Bond</th>
 <th style={{ padding: '14px 16px', fontWeight: 800, color: '#111827' }}>Eligibility Cutoff</th>
 <th style={{ padding: '14px 16px', fontWeight: 800, color: '#111827' }}>Core Tech Focus</th>
 </tr>
 </thead>
 <tbody>
 {(c.benchmark || []).map((row, idx) => (
 <tr key={idx} style={{ borderBottom: '1px solid #F3F4F6' }}>
 <td style={{ padding: '16px', fontWeight: 700, color: '#111827' }}>{row.role}</td>
 <td style={{ padding: '16px', fontWeight: 800, color: '#111827' }}>{row.ctc}</td>
 <td style={{ padding: '16px', color: '#4B5563' }}>{row.bond}</td>
 <td style={{ padding: '16px', color: '#4B5563' }}>{row.cgpaCutoff}</td>
 <td style={{ padding: '16px', color: '#374151', fontWeight: 600 }}>{row.keyTech}</td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </div>
 )}



 {/* MODAL: PUBLISH EXPERIENCE TO DATABASE */}
 {isPublishModalOpen && (
 <div style={{
 position: 'fixed',
 top: 0,
 left: 0,
 right: 0,
 bottom: 0,
 backgroundColor: 'rgba(0, 0, 0, 0.5)',
 zIndex: 9999,
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 padding: '20px'
 }}>
 <div className="saas-card-spec" style={{
 backgroundColor: '#FFFFFF',
 borderRadius: '12px',
 padding: '32px',
 maxWidth: '680px',
 width: '100%',
 maxHeight: '90vh',
 overflowY: 'auto',
 border: '1px solid #E5E7EB'
 }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #F3F4F6', paddingBottom: '14px' }}>
 <div>
 <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#111827', margin: 0 }}>
 Publish Interview Experience for {c.name}
 </h3>
 <p style={{ fontSize: '0.83rem', color: '#6B7280', margin: '4px 0 0 0' }}>
 Share your placement interview questions to help upcoming students prepare.
 </p>
 </div>

 <button
 onClick={() => setIsPublishModalOpen(false)}
 style={{ background: 'none', border: 'none', fontSize: '1.2rem', fontWeight: 800, color: '#6B7280', cursor: 'pointer' }}
 >
 
 </button>
 </div>

 <form onSubmit={handlePublishSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
 <div>
 <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
 Your Name
 </label>
 <input
 type="text"
 required
 placeholder="e.g. Rahul Sharma"
 value={formName}
 onChange={(e) => setFormName(e.target.value)}
 className="input-field"
 style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.88rem' }}
 />
 </div>

 <div>
 <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
 College / Institute
 </label>
 <input
 type="text"
 required
 placeholder="e.g. Anna University"
 value={formCollege}
 onChange={(e) => setFormCollege(e.target.value)}
 className="input-field"
 style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.88rem' }}
 />
 </div>
 </div>

 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
 <div>
 <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
 Graduation Year
 </label>
 <select
 value={formYear}
 onChange={(e) => setFormYear(e.target.value)}
 style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.88rem', backgroundColor: '#FFF' }}
 >
 <option value="2025">2025</option>
 <option value="2024">2024</option>
 <option value="2026">2026</option>
 </select>
 </div>

 <div>
 <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
 Interview Outcome
 </label>
 <select
 value={formStatus}
 onChange={(e) => setFormStatus(e.target.value)}
 style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.88rem', backgroundColor: '#FFF' }}
 >
 <option value="Selected">Selected</option>
 <option value="Offer Accepted">Offer Accepted</option>
 <option value="Interview Completed">Interview Completed</option>
 <option value="Under Review">Under Review</option>
 </select>
 </div>

 <div>
 <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
 Overall Difficulty
 </label>
 <select
 value={formRating}
 onChange={(e) => setFormRating(e.target.value)}
 style={{ width: '100%', height: '42px', padding: '0 12px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.88rem', backgroundColor: '#FFF' }}
 >
 <option value="Easy">Easy</option>
 <option value="Moderate">Moderate</option>
 <option value="Tough">Tough</option>
 <option value="Very Hard">Very Hard</option>
 </select>
 </div>
 </div>

 <div>
 <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
 Role / Profile Interviewed For
 </label>
 <input
 type="text"
 required
 placeholder="e.g. TCS Digital Engineer / Amazon SDE-1"
 value={formRole}
 onChange={(e) => setFormRole(e.target.value)}
 className="input-field"
 style={{ width: '100%', height: '42px', padding: '0 14px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.88rem' }}
 />
 </div>

 <div>
 <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
 Round 1 Questions Asked (Online Assessment / Technical)
 </label>
 <textarea
 rows="3"
 placeholder="Enter questions asked (one per line)... e.g. Write code to reverse a linked list."
 value={formRound1Questions}
 onChange={(e) => setFormRound1Questions(e.target.value)}
 style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.88rem', fontFamily: 'inherit' }}
 />
 </div>

 <div>
 <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
 Round 2 / HR Questions Asked
 </label>
 <textarea
 rows="3"
 placeholder="Enter technical or HR questions asked... e.g. Difference between INNER JOIN and LEFT JOIN."
 value={formRound2Questions}
 onChange={(e) => setFormRound2Questions(e.target.value)}
 style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.88rem', fontFamily: 'inherit' }}
 />
 </div>

 <div>
 <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: '#374151', marginBottom: '6px' }}>
 Candidate Advice & Pro Tips
 </label>
 <textarea
 rows="2"
 placeholder="Enter key preparation advice for upcoming students..."
 value={formProTips}
 onChange={(e) => setFormProTips(e.target.value)}
 style={{ width: '100%', padding: '10px 14px', borderRadius: '6px', border: '1px solid #D1D5DB', fontSize: '0.88rem', fontFamily: 'inherit' }}
 />
 </div>

 <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
 <button
 type="button"
 onClick={() => setIsPublishModalOpen(false)}
 className="btn-secondary-spec"
 style={{ padding: '10px 20px', fontSize: '0.88rem' }}
 >
 Cancel
 </button>

 <button
 type="submit"
 className="btn-secondary-spec"
 style={{ padding: '10px 24px', fontSize: '0.88rem', fontWeight: 600, backgroundColor: '#374151', color: '#FFFFFF', borderColor: '#374151' }}
 >
 Publish to Community Database
 </button>
 </div>
 </form>
 </div>
 </div>
 )}

 </div>
 );
 }

 // CATALOG MAIN PAGE (STRICT MONOCHROME THEME)
 return (
 <div style={{ flex: 1, padding: '36px 32px', maxWidth: '1280px', margin: '0 auto', width: '100%', fontFamily: 'var(--font-inter)' }}>
 
 {/* Navigation Header */}
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
 <button
 onClick={() => setActiveTab && setActiveTab('dashboard')}
 className="btn-secondary-spec"
 style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600 }}
 >
 Back to Dashboard
 </button>
 </div>

 {/* Header Banner Card */}
 <div className="saas-card-spec" style={{ padding: '36px', marginBottom: '32px', backgroundColor: '#FFFFFF' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
 <div>
 <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '8px', letterSpacing: '-0.5px' }}>
 Company Exam Patterns & Preparation Hub
 </h2>
 <p style={{ color: '#4B5563', fontSize: '0.96rem', maxWidth: '820px', lineHeight: 1.65 }}>
 Master recruitment exam patterns, module-wise weightage, detailed topics to cover, community interview archives, multi-stage revision trackers, and role benchmarks for top IT recruiters.
 </p>
 </div>

 <div style={{ textAlign: 'right', backgroundColor: '#F8F9FA', padding: '16px 24px', borderRadius: '12px', border: '1px solid #E5E7EB', flexShrink: 0 }}>
 <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>{COMPANY_PREP_CATALOG.length}</div>
 <div style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600, marginTop: '4px' }}>Companies Loaded</div>
 </div>
 </div>
 </div>

 {/* Search & Tier Filter Controls */}
 <div style={{ display: 'flex', gap: '16px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' }}>
 <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
 <Search size={18} color="#9CA3AF" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
 <input
 type="text"
 placeholder="Search by company name, role or domain... (e.g. TCS, Amazon, Zoho)"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="saas-search-input"
 style={{ height: '48px', paddingLeft: '44px', fontSize: '0.9rem', width: '100%', boxSizing: 'border-box' }}
 />
 </div>

 {/* Tier Buttons */}
 <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
 {Object.keys(COMPANY_TIERS).map(key => {
 const label = COMPANY_TIERS[key];
 const isActive = selectedTier === key;
 return (
 <button
 key={key}
 onClick={() => setSelectedTier(key)}
 style={{
 padding: '10px 18px',
 borderRadius: '8px',
 border: isActive ? '1px solid #111827' : '1px solid #E5E7EB',
 backgroundColor: isActive ? '#374151' : '#FFFFFF',
 color: isActive ? '#FFFFFF' : '#4B5563',
 fontWeight: 600,
 fontSize: '0.85rem',
 cursor: 'pointer',
 transition: 'all 0.15s ease'
 }}
 >
 {label}
 </button>
 );
 })}
 </div>
 </div>

 {/* Company Cards Grid (Strict Monochrome Theme) */}
 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
 {filteredCompanies.map(c => {
 return (
 <div
 key={c.id}
 className="saas-card-spec"
 style={{
 padding: '28px',
 backgroundColor: '#FFFFFF',
 display: 'flex',
 flexDirection: 'column',
 justifyContent: 'space-between',
 transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
 }}
 >
 <div>
 {/* Logo + Name + Tier */}
 <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
 <div style={{
 width: '48px',
 height: '48px',
 borderRadius: '10px',
 backgroundColor: '#111827',
 color: '#FFFFFF',
 fontWeight: 900,
 fontSize: '0.9rem',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 flexShrink: 0
 }}>
 {c.logo}
 </div>

 <div>
 <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#111827', margin: 0 }}>
 {c.name}
 </h3>
 <div style={{ fontSize: '0.78rem', color: '#6B7280', marginTop: '2px' }}>
 {c.type}
 </div>
 </div>
 </div>

 {/* Package Tag */}
 <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F8F9FA', padding: '10px 14px', borderRadius: '6px', border: '1px solid #E5E7EB' }}>
 <span style={{ fontSize: '0.78rem', color: '#6B7280', fontWeight: 600 }}>CTC Package:</span>
 <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#111827' }}>{c.package}</span>
 </div>

 {/* Stage breakdown summary */}
 <div style={{ marginBottom: '20px' }}>
 <div style={{ fontSize: '0.78rem', color: '#9CA3AF', fontWeight: 700, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
 Selection Stages ({c.rounds.length})
 </div>
 <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
 {c.rounds.slice(0, 3).map((r, rIdx) => (
 <div key={rIdx} style={{ fontSize: '0.82rem', color: '#4B5563', display: 'flex', alignItems: 'center', gap: '8px' }}>
 <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#374151', flexShrink: 0 }} />
 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name.replace(/^(Stage|Round)\s*\d+:\s*/i, '')}</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 <div>
 <button
 onClick={() => { setSelectedCompanyId(c.id); setActiveDetailTab('rounds'); }}
 className="btn-secondary-spec"
 style={{
 width: '100%',
 justifyContent: 'center',
 padding: '10px',
 fontSize: '0.88rem',
 fontWeight: 600,
 backgroundColor: '#F3F4F6',
 color: '#374151',
 border: '1px solid #E5E7EB'
 }}
 >
 Explore Exam Kit
 </button>
 </div>
 </div>
 );
 })}
 </div>

 </div>
 );
}
