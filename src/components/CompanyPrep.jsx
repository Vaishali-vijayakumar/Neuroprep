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
  CheckCircle2, 
  UserCheck, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Edit3, 
  ArrowLeft
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
    } catch (e) {}
  }, [topicMastery, MASTERY_STORAGE_KEY]);

  useEffect(() => {
    try {
      localStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(topicNotes));
    } catch (e) {}
  }, [topicNotes, NOTES_STORAGE_KEY]);

  // Load published community experiences on company select
  useEffect(() => {
    let cancelled = false;
    if (selectedCompanyId) {
      dbService.getPublishedCompanyExperiences(selectedCompanyId).then(expList => {
        if (!cancelled && expList) setPublishedExperiences(expList);
      });
    }
    return () => { cancelled = true; };
  }, [selectedCompanyId]);

  // Mastery Status Handler
  const handleSetTopicStatus = (topicId, level) => {
    setTopicMastery(prev => ({
      ...prev,
      [topicId]: level
    }));
  };

  // Notes Update Handler
  const handleUpdateTopicNote = (topicId, text) => {
    setTopicNotes(prev => ({
      ...prev,
      [topicId]: text
    }));
  };

  // Open Publish Modal
  const handleOpenPublishModal = (company) => {
    setFormRole(company.roles[0] || 'Software Engineer');
    setIsPublishModalOpen(true);
  };

  // Submit Publish Form
  const handlePublishSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim() || !formCollege.trim() || !selectedCompanyId) return;

    const round1List = formRound1Questions
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    const round2List = formRound2Questions
      .split('\n')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    const proTipsList = formProTips
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const newExperience = {
      companyId: selectedCompanyId,
      studentName: formName.trim(),
      college: formCollege.trim(),
      year: formYear,
      role: formRole.trim(),
      status: formStatus,
      rating: formRating,
      isCommunityShared: true,
      roundSummaries: [
        {
          roundName: formRound1Name,
          questionsAsked: round1List.length > 0 ? round1List : ['Aptitude & algorithmic reasoning assessment.'],
          keyTakeaway: 'Focus on time management and clean modular code.'
        },
        {
          roundName: formRound2Name,
          questionsAsked: round2List.length > 0 ? round2List : ['Technical resume defense and core fundamental scenarios.'],
          keyTakeaway: 'Clearly explain thought process before jumping to code.'
        }
      ],
      proTips: proTipsList.length > 0 ? proTipsList : ['Revise standard DSA patterns and practice mock interviews.']
    };

    const saved = await dbService.publishCompanyExperience(newExperience);
    if (saved) {
      setPublishedExperiences(prev => [saved, ...prev]);
      setPublishToast(`Your interview experience for ${activeCompany?.name || 'the company'} was published!`);
      setTimeout(() => setPublishToast(''), 4000);
      setIsPublishModalOpen(false);

      // Reset Form Fields
      setFormName('');
      setFormCollege('');
      setFormRound1Questions('');
      setFormRound2Questions('');
      setFormProTips('');
    }
  };

  // Filter Companies Logic
  const filteredCompanies = COMPANY_PREP_CATALOG.filter(c => {
    const matchesTier = selectedTier === 'ALL' || c.tier === selectedTier;
    const matchesQuery = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <div style={{ flex: 1, padding: '36px 32px', maxWidth: '1280px', margin: '0 auto', width: '100%', fontFamily: 'var(--font-main)' }}>
        
        {/* Toast Notification */}
        {publishToast && (
          <div style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            backgroundColor: 'var(--btn-sage)',
            color: 'var(--btn-text)',
            padding: '14px 20px',
            borderRadius: '12px',
            fontSize: '0.88rem',
            fontWeight: 700,
            boxShadow: 'var(--shadow-3d-card)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <CheckCircle2 size={18} />
            <span>{publishToast}</span>
          </div>
        )}

        {/* Navigation Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <button
            onClick={() => setSelectedCompanyId(null)}
            className="btn-secondary-spec"
            style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowLeft size={16} /> Back to Companies
          </button>
          
          <button
            onClick={() => setActiveTab && setActiveTab('dashboard')}
            className="btn-back-dashboard"
            style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 700 }}
          >
            Back to Dashboard
          </button>
        </div>

        {/* Company Header Banner Card */}
        <div className="saas-card-spec" style={{ padding: '32px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px' }}>
            <div style={{ display: 'flex', gap: '22px', alignItems: 'center' }}>
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '16px',
                backgroundColor: 'var(--btn-sage)',
                color: 'var(--btn-text)',
                fontWeight: 900,
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'var(--shadow-3d-btn)',
                letterSpacing: '-0.5px'
              }}>
                {c.logo}
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
                  <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--main-heading)', margin: 0, letterSpacing: '-0.5px', fontFamily: 'var(--font-heading)' }}>
                    {c.fullName} ({c.name})
                  </h1>
                  <span className="pill-tag" style={{ backgroundColor: '#EAECE8', color: 'var(--btn-sage)' }}>
                    {c.type}
                  </span>
                </div>

                <div style={{ fontSize: '0.92rem', color: 'var(--body-text)', display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span>Package: <strong style={{ color: 'var(--accent-terracotta)', fontWeight: 800 }}>{c.package}</strong></span>
                  <span>•</span>
                  <span>Stages: <strong style={{ color: 'var(--main-heading)' }}>{c.rounds.length} Selection Rounds</strong></span>
                </div>
              </div>
            </div>

            {/* Target Roles & Eligibility Card */}
            <div style={{ backgroundColor: 'var(--bg-card-solid)', padding: '18px 22px', borderRadius: '14px', border: '1px solid var(--border-color)', maxWidth: '400px', boxShadow: 'var(--shadow-3d-btn)' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Eligibility Requirement
              </div>
              <div style={{ fontSize: '0.84rem', color: 'var(--body-text)', lineHeight: 1.5, marginBottom: '12px' }}>
                {c.eligibility}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Active Hiring Profiles
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {c.roles.map((r, rIdx) => (
                  <span key={rIdx} className="pill-tag" style={{ backgroundColor: '#F5EBE6', color: 'var(--accent-terracotta)', fontSize: '0.74rem' }}>
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <p style={{ marginTop: '22px', fontSize: '0.94rem', color: 'var(--body-text)', lineHeight: 1.65, borderTop: '1px solid var(--border-color)', paddingTop: '18px', margin: '22px 0 0 0' }}>
            {c.overview}
          </p>
        </div>

        {/* Detail Navigation Tabs */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
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
                className={isActive ? 'btn-primary-spec' : 'btn-secondary-spec'}
                style={{
                  padding: '10px 20px',
                  borderRadius: '12px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap'
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
            <div style={{ marginBottom: '8px' }}>
              <h2 className="section-title" style={{ fontSize: '22px', margin: '0 0 4px 0' }}>
                Selection Process & Stage Breakdown ({c.rounds.length} Stages)
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                Step-by-step qualifying criteria, duration, question format, and marking scheme.
              </p>
            </div>

            <div className={`stages-grid-balanced stages-count-${c.rounds.length || 4}`}>
              {c.rounds.map((round, idx) => (
                <div key={idx} className="saas-card-spec" style={{ padding: '26px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <span style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--btn-sage)',
                        color: 'var(--btn-text)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        boxShadow: 'var(--shadow-3d-btn)'
                      }}>
                        {idx + 1}
                      </span>

                      <span className="pill-tag" style={{ backgroundColor: '#EAECE8', color: 'var(--btn-sage)' }}>
                        {round.difficulty}
                      </span>
                    </div>

                    <h4 style={{ fontSize: '1.18rem', fontWeight: 800, color: 'var(--main-heading)', marginBottom: '12px', fontFamily: 'var(--font-heading)' }}>
                      {round.name.replace(/^(Stage|Round)\s*\d+:\s*/i, '')}
                    </h4>

                    <p style={{ fontSize: '0.9rem', color: 'var(--body-text)', lineHeight: 1.6, marginBottom: '20px' }}>
                      {round.description}
                    </p>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <div>
                      <span>Duration:</span>
                      <strong style={{ display: 'block', color: 'var(--main-heading)', marginTop: '2px', fontSize: '0.88rem' }}>{round.duration}</strong>
                    </div>
                    <div>
                      <span>Questions:</span>
                      <strong style={{ display: 'block', color: 'var(--main-heading)', marginTop: '2px', fontSize: '0.88rem' }}>{round.questions}</strong>
                    </div>
                    <div style={{ gridColumn: '1 / -1', marginTop: '4px' }}>
                      <span>Evaluation Criteria:</span>
                      <strong style={{ display: 'block', color: 'var(--secondary-heading)', marginTop: '2px' }}>{round.marking}</strong>
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
            <div style={{ marginBottom: '8px' }}>
              <h2 className="section-title" style={{ fontSize: '22px', margin: '0 0 4px 0' }}>
                Detailed Syllabus & High-Yield Topics for {c.name}
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                Category-wise weightage and high-frequency topics tested in recent recruitment cycles.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {(c.topicsToCover || []).map((s, idx) => (
                <div key={idx} className="saas-card-spec" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', borderBottom: '1px solid var(--border-color)', paddingBottom: '14px', flexWrap: 'wrap', gap: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--main-heading)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                        {s.category}
                      </h4>
                      <span className="pill-tag" style={{ backgroundColor: '#F5EBE6', color: 'var(--accent-terracotta)' }}>
                        {s.priority} Priority
                      </span>
                    </div>

                    <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--btn-sage)', backgroundColor: '#EAECE8', padding: '6px 16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                      Weightage: {s.weightage}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {s.topics.map((t, tIdx) => (
                      <span key={tIdx} style={{
                        fontSize: '0.88rem',
                        fontWeight: 600,
                        padding: '10px 16px',
                        borderRadius: '10px',
                        backgroundColor: 'var(--bg-card-solid)',
                        color: 'var(--main-heading)',
                        border: '1px solid var(--border-color)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        boxShadow: 'var(--shadow-3d-btn)'
                      }}>
                        <span style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'var(--btn-sage)' }} />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: INTERVIEW EXPERIENCES */}
        {activeDetailTab === 'experiences' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h2 className="section-title" style={{ fontSize: '22px', margin: '0 0 4px 0' }}>
                  Real Placement Interview Reports ({allExperiences.length})
                </h2>
                <p style={{ fontSize: '14px', color: 'var(--text-muted)', margin: 0 }}>
                  Read verified placement interview experiences or publish your own interview report to the shared database.
                </p>
              </div>

              <button
                onClick={() => handleOpenPublishModal(c)}
                className="btn-primary-spec"
                style={{
                  padding: '12px 24px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '12px'
                }}
              >
                <Plus size={16} /> Publish Your Experience
              </button>
            </div>

            {/* List of Experiences */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {allExperiences.map((exp, idx) => (
                <div key={exp.id || idx} className="saas-card-spec" style={{ padding: '28px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--main-heading)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                          {exp.studentName}
                        </h4>
                        <span className="pill-tag" style={{ backgroundColor: '#EAECE8', color: 'var(--btn-sage)' }}>
                          {exp.status}
                        </span>
                        {exp.isCommunityShared && (
                          <span className="pill-tag" style={{ backgroundColor: '#F5EBE6', color: 'var(--accent-terracotta)' }}>
                            Community Shared DB
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {exp.college} • Class of {exp.year} • Role: <strong style={{ color: 'var(--main-heading)' }}>{exp.role}</strong>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Overall Difficulty</span>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--accent-terracotta)', marginTop: '2px' }}>{exp.rating}</div>
                    </div>
                  </div>

                  {/* Round by Round Summaries */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                    {(exp.roundSummaries || []).map((rSummary, rIdx) => (
                      <div key={rIdx} style={{ backgroundColor: 'var(--bg-card-solid)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-3d-btn)' }}>
                        <h5 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--main-heading)', margin: '0 0 10px 0', fontFamily: 'var(--font-heading)' }}>
                          {rSummary.roundName}
                        </h5>
                        
                        <div style={{ fontSize: '0.88rem', color: 'var(--body-text)', marginBottom: '10px' }}>
                          <strong style={{ color: 'var(--secondary-heading)' }}>Questions & Scenarios Asked:</strong>
                          <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', lineHeight: 1.65 }}>
                            {rSummary.questionsAsked.map((q, qIdx) => (
                              <li key={qIdx}>{q}</li>
                            ))}
                          </ul>
                        </div>

                        {rSummary.keyTakeaway && (
                          <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontStyle: 'italic', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                            Key Takeaway: {rSummary.keyTakeaway}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pro Tips */}
                  {exp.proTips && exp.proTips.length > 0 && (
                    <div style={{ backgroundColor: '#FAF5F1', padding: '18px 22px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                      <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--accent-terracotta)', marginBottom: '8px' }}>
                        Candidate Advice & Key Focus Areas
                      </div>
                      <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.86rem', color: 'var(--body-text)', lineHeight: 1.65 }}>
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
            <div className="saas-card-spec" style={{ padding: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--main-heading)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                    {c.name} Technical Mastery & Readiness Engine
                  </h3>
                  <p style={{ fontSize: '0.92rem', color: 'var(--body-text)', margin: '6px 0 0 0' }}>
                    Track multi-stage topic readiness, store personal revision notes, and calculate your exam preparedness.
                  </p>
                </div>

                {/* Score Indicator */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  backgroundColor: 'var(--bg-card-solid)',
                  padding: '16px 24px',
                  borderRadius: '16px',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-3d-btn)'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: readinessPct > 0 
                      ? `conic-gradient(#526257 ${readinessPct * 3.6}deg, #D8D2CE 0deg)`
                      : '#D8D2CE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      backgroundColor: '#FCF9F6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <span style={{ fontSize: '16px', fontWeight: 800, color: 'var(--main-heading)' }}>
                        {readinessPct}%
                      </span>
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--btn-sage)', fontFamily: 'var(--font-heading)' }}>
                      Exam Readiness
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                      Based on completed syllabus
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Counts Breakdown Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '14px' }}>
                <div style={{ backgroundColor: 'var(--bg-card-solid)', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-3d-btn)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Exam Mastered</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--btn-sage)', marginTop: '2px', fontFamily: 'var(--font-heading)' }}>{masteredCount}</div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-card-solid)', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-3d-btn)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Practiced</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--accent-terracotta)', marginTop: '2px', fontFamily: 'var(--font-heading)' }}>{practicedCount}</div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-card-solid)', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-3d-btn)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Concept Only</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--secondary-heading)', marginTop: '2px', fontFamily: 'var(--font-heading)' }}>{conceptCount}</div>
                </div>

                <div style={{ backgroundColor: 'var(--bg-card-solid)', padding: '14px 18px', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-3d-btn)' }}>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 800, textTransform: 'uppercase' }}>Unvisited</div>
                  <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-muted)', marginTop: '2px', fontFamily: 'var(--font-heading)' }}>{notStartedCount}</div>
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
                      borderRadius: '14px',
                      border: currentLevel === 3 ? '1.5px solid var(--btn-sage)' : '1px solid var(--border-color)',
                      overflow: 'hidden',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ flex: 1, minWidth: '240px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                          <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--main-heading)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                            {tItem.topic}
                          </h4>
                          <span className="pill-tag" style={{ backgroundColor: '#EAECE8', color: 'var(--btn-sage)', fontSize: '0.72rem' }}>
                            {tItem.category}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.82rem', color: 'var(--body-text)' }}>
                          Exam Frequency: <strong style={{ color: 'var(--main-heading)' }}>{tItem.frequency}</strong>
                        </div>
                      </div>

                      {/* 4-Stage Mastery Selector Buttons */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {[0, 1, 2, 3].map((lvl) => {
                          const isSelected = currentLevel === lvl;
                          return (
                            <button
                              key={lvl}
                              onClick={() => handleSetTopicStatus(tItem.id, lvl)}
                              style={{
                                padding: '8px 14px',
                                borderRadius: '10px',
                                border: isSelected ? '1px solid var(--btn-sage)' : '1px solid var(--border-color)',
                                backgroundColor: isSelected ? 'var(--btn-sage)' : 'var(--bg-card-solid)',
                                color: isSelected ? 'var(--btn-text)' : 'var(--secondary-heading)',
                                fontSize: '0.78rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: isSelected ? 'var(--shadow-3d-btn)' : 'none',
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
                            color: 'var(--text-muted)',
                            padding: '6px',
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
                      <div style={{ padding: '22px 26px', backgroundColor: 'var(--bg-card-solid)', borderTop: '1px solid var(--border-color)' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '18px' }}>
                          <div style={{ backgroundColor: '#FAF5F1', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--accent-terracotta)', marginBottom: '6px', textTransform: 'uppercase' }}>
                              Key Formula / Cheat-Sheet
                            </div>
                            <div style={{ fontSize: '0.86rem', color: 'var(--body-text)', lineHeight: 1.55 }}>
                              {tItem.keyFormula}
                            </div>
                          </div>

                          <div style={{ backgroundColor: '#EAECE8', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--btn-sage)', marginBottom: '6px', textTransform: 'uppercase' }}>
                              Practice Action Target
                            </div>
                            <div style={{ fontSize: '0.86rem', color: 'var(--body-text)', lineHeight: 1.55 }}>
                              {tItem.practiceTarget}
                            </div>
                          </div>
                        </div>

                        {/* Personal Notes Textarea */}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--main-heading)', marginBottom: '8px' }}>
                            <Edit3 size={15} color="var(--btn-sage)" /> Personal Study Notes & Formula Reminders (Saved)
                          </div>
                          <textarea
                            rows="2"
                            placeholder="Write your custom notes, shortcuts, or tricky edge cases for this topic..."
                            value={userNote}
                            onChange={(e) => handleUpdateTopicNote(tItem.id, e.target.value)}
                            className="input-field"
                            style={{
                              width: '100%',
                              padding: '12px 16px',
                              borderRadius: '10px',
                              border: '1px solid var(--border-color)',
                              fontSize: '0.88rem',
                              fontFamily: 'var(--font-main)',
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
            <div style={{ marginBottom: '8px' }}>
              <h2 className="section-title" style={{ fontSize: '22px', margin: '0 0 4px 0' }}>
                Role Tier, CTC Breakdown & Service Matrix
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', margin: 0 }}>
                Compensation structure, service agreements, and qualification criteria for {c.name}.
              </p>
            </div>

            <div className="saas-card-spec" style={{ padding: '24px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', backgroundColor: 'var(--bg-card-solid)' }}>
                    <th style={{ padding: '16px', fontWeight: 800, color: 'var(--main-heading)' }}>Recruitment Role Profile</th>
                    <th style={{ padding: '16px', fontWeight: 800, color: 'var(--accent-terracotta)' }}>Annual CTC Package</th>
                    <th style={{ padding: '16px', fontWeight: 800, color: 'var(--main-heading)' }}>Service Agreement / Bond</th>
                    <th style={{ padding: '16px', fontWeight: 800, color: 'var(--main-heading)' }}>Eligibility Cutoff</th>
                    <th style={{ padding: '16px', fontWeight: 800, color: 'var(--btn-sage)' }}>Core Tech Focus</th>
                  </tr>
                </thead>
                <tbody>
                  {(c.benchmark || []).map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '18px 16px', fontWeight: 700, color: 'var(--main-heading)' }}>{row.role}</td>
                      <td style={{ padding: '18px 16px', fontWeight: 800, color: 'var(--accent-terracotta)' }}>{row.ctc}</td>
                      <td style={{ padding: '18px 16px', color: 'var(--body-text)' }}>{row.bond}</td>
                      <td style={{ padding: '18px 16px', color: 'var(--body-text)' }}>{row.cgpaCutoff}</td>
                      <td style={{ padding: '18px 16px', color: 'var(--btn-sage)', fontWeight: 700 }}>{row.keyTech}</td>
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
            backgroundColor: 'rgba(52, 52, 58, 0.45)',
            backdropFilter: 'blur(8px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}>
            <div className="saas-card-spec" style={{
              borderRadius: '20px',
              padding: '36px',
              maxWidth: '680px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-3d-card)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--main-heading)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                    Publish Interview Experience for {c.name}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                    Share your placement interview questions to help upcoming students prepare.
                  </p>
                </div>

                <button
                  onClick={() => setIsPublishModalOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)', cursor: 'pointer' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handlePublishSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--secondary-heading)', marginBottom: '6px' }}>
                      Your Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.88rem' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--secondary-heading)', marginBottom: '6px' }}>
                      College / Institute
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anna University"
                      value={formCollege}
                      onChange={(e) => setFormCollege(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.88rem' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--secondary-heading)', marginBottom: '6px' }}>
                      Graduation Year
                    </label>
                    <select
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.88rem' }}
                    >
                      <option value="2025">2025</option>
                      <option value="2024">2024</option>
                      <option value="2026">2026</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--secondary-heading)', marginBottom: '6px' }}>
                      Interview Outcome
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.88rem' }}
                    >
                      <option value="Selected">Selected</option>
                      <option value="Offer Accepted">Offer Accepted</option>
                      <option value="Interview Completed">Interview Completed</option>
                      <option value="Under Review">Under Review</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--secondary-heading)', marginBottom: '6px' }}>
                      Overall Difficulty
                    </label>
                    <select
                      value={formRating}
                      onChange={(e) => setFormRating(e.target.value)}
                      className="input-field"
                      style={{ width: '100%', height: '44px', padding: '0 12px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.88rem' }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Tough">Tough</option>
                      <option value="Very Hard">Very Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--secondary-heading)', marginBottom: '6px' }}>
                    Role / Profile Interviewed For
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TCS Digital Engineer / Amazon SDE-1"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', height: '44px', padding: '0 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.88rem' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--secondary-heading)', marginBottom: '6px' }}>
                    Round 1 Questions Asked (Online Assessment / Technical)
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Enter questions asked (one per line)... e.g. Write code to reverse a linked list."
                    value={formRound1Questions}
                    onChange={(e) => setFormRound1Questions(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.88rem', fontFamily: 'var(--font-main)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--secondary-heading)', marginBottom: '6px' }}>
                    Round 2 / HR Questions Asked
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Enter technical or HR questions asked... e.g. Difference between INNER JOIN and LEFT JOIN."
                    value={formRound2Questions}
                    onChange={(e) => setFormRound2Questions(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.88rem', fontFamily: 'var(--font-main)' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--secondary-heading)', marginBottom: '6px' }}>
                    Candidate Advice & Pro Tips
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Enter key preparation advice for upcoming students..."
                    value={formProTips}
                    onChange={(e) => setFormProTips(e.target.value)}
                    className="input-field"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid var(--border-color)', fontSize: '0.88rem', fontFamily: 'var(--font-main)' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '14px', marginTop: '14px' }}>
                  <button
                    type="button"
                    onClick={() => setIsPublishModalOpen(false)}
                    className="btn-secondary-spec"
                    style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 700 }}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="btn-primary-spec"
                    style={{ padding: '12px 26px', fontSize: '0.88rem', fontWeight: 700, borderRadius: '12px' }}
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

  // CATALOG MAIN PAGE (Full Dashboard Theme Alignment)
  return (
    <div style={{ flex: 1, padding: '36px 32px', maxWidth: '1280px', margin: '0 auto', width: '100%', fontFamily: 'var(--font-main)' }}>
      
      {/* 1. Header Banner & Actions */}
      <section style={{ marginBottom: '28px' }}>
        <div className="saas-card-spec" style={{
          padding: '28px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '24px',
          flexWrap: 'wrap'
        }}>
          <div>
            <span className="pill-tag" style={{ marginBottom: '10px', display: 'inline-block' }}>Company Intelligence & Exam Patterns</span>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--main-heading)', margin: 0, letterSpacing: '-0.3px', fontFamily: 'var(--font-heading)' }}>
              Company Exam Patterns & Preparation Hub
            </h1>
            <p style={{ fontSize: '0.94rem', color: 'var(--body-text)', margin: '6px 0 0 0', lineHeight: 1.55, maxWidth: '840px' }}>
              Master recruitment exam patterns, module-wise weightage, detailed topics to cover, community interview archives, multi-stage revision trackers, and role benchmarks for top recruiters.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={() => setActiveTab && setActiveTab('dashboard')}
              className="btn-back-dashboard"
              style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 700 }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* 2. Top Metric Summaries */}
      <section style={{ marginBottom: '32px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
          <div className="saas-card-spec" style={{ padding: '24px' }}>
            <span className="pill-tag" style={{ marginBottom: '8px' }}>Verified Database</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--main-heading)', margin: '6px 0 2px 0', fontFamily: 'var(--font-heading)' }}>
              {COMPANY_PREP_CATALOG.length}
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Top Tech Recruiters Covered
            </div>
          </div>

          <div className="saas-card-spec" style={{ padding: '24px' }}>
            <span className="pill-tag" style={{ marginBottom: '8px', backgroundColor: '#EAECE8', color: 'var(--btn-sage)' }}>Multi-Stage Kits</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--btn-sage)', margin: '6px 0 2px 0', fontFamily: 'var(--font-heading)' }}>
              100%
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Round & Syllabus Breakdowns
            </div>
          </div>

          <div className="saas-card-spec" style={{ padding: '24px' }}>
            <span className="pill-tag" style={{ marginBottom: '8px', backgroundColor: '#F5EBE6', color: 'var(--accent-terracotta)' }}>CTC Range</span>
            <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-terracotta)', margin: '6px 0 2px 0', fontFamily: 'var(--font-heading)' }}>
              6.5 - 32 LPA
            </div>
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Package Benchmarks Analyzed
            </div>
          </div>
        </div>
      </section>

      {/* 3. Search & Tier Filter Controls */}
      <section style={{ marginBottom: '28px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '280px', position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Search by company name, role or domain... (e.g. TCS, Amazon, Zoho, Infosys)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{
                height: '50px',
                paddingLeft: '48px',
                fontSize: '0.92rem',
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: '14px',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--shadow-3d-btn)'
              }}
            />
          </div>

          {/* Tier Selector Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {Object.keys(COMPANY_TIERS).map(key => {
              const label = COMPANY_TIERS[key];
              const isActive = selectedTier === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedTier(key)}
                  className={isActive ? 'btn-primary-spec' : 'btn-secondary-spec'}
                  style={{
                    padding: '11px 20px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '0.85rem'
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Company Cards Grid (Dashboard Matching Style) */}
      <section>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {filteredCompanies.map(c => {
            return (
              <div
                key={c.id}
                className="saas-card-spec"
                style={{
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <div>
                  {/* Top: Logo + Name + Tier */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '18px' }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      backgroundColor: 'var(--btn-sage)',
                      color: 'var(--btn-text)',
                      fontWeight: 900,
                      fontSize: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-3d-btn)',
                      flexShrink: 0
                    }}>
                      {c.logo}
                    </div>

                    <div>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--main-heading)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                        {c.name}
                      </h3>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px', fontWeight: 600 }}>
                        {c.type}
                      </div>
                    </div>
                  </div>

                  {/* Package Tag Card */}
                  <div style={{
                    marginBottom: '18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'var(--bg-card-solid)',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow-3d-btn)'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>CTC Package:</span>
                    <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--accent-terracotta)' }}>{c.package}</span>
                  </div>

                  {/* Selection Stages Breakdown */}
                  <div style={{ marginBottom: '22px' }}>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Selection Stages ({c.rounds.length})
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {c.rounds.slice(0, 3).map((r, rIdx) => (
                        <div key={rIdx} style={{ fontSize: '0.84rem', color: 'var(--body-text)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--btn-sage)', flexShrink: 0 }} />
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name.replace(/^(Stage|Round)\s*\d+:\s*/i, '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => { setSelectedCompanyId(c.id); setActiveDetailTab('rounds'); }}
                    className="btn-primary-spec"
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      padding: '12px',
                      fontSize: '0.9rem',
                      fontWeight: 700,
                      borderRadius: '12px'
                    }}
                  >
                    Explore Exam Kit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
}
