import React, { useState, useEffect } from 'react';
import { FORMULA_SECTORS, TOPIC_FORMULAS } from '../data/aptitudeFormulasData';
import { MOCK_TESTS_CATALOG, MOCK_TEST_CATEGORIES } from '../data/mockTestsData';
import { localDb } from '../services/localDb';
import { recordActivity } from '../services/gamificationService';

export default function AptitudePractice({ setActiveTab, aptitudeState, setAptitudeState, userEmail }) {
  // View mode: 'mocktests' (Mock Tests) vs 'formulas' (Formulas, Speed Rules & Shortcuts)
  const [viewMode, setViewMode] = useState('mocktests');

  // Formulas Reference State
  const [activeFormulaSector, setActiveFormulaSector] = useState('Quant');
  const [formulaSearchQuery, setFormulaSearchQuery] = useState('');

  // Mock Test State
  const [selectedMockTest, setSelectedMockTest] = useState(null);
  const [testState, setTestState] = useState('catalog'); // 'catalog' | 'testing' | 'results'
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState({});
  const [visitedQs, setVisitedQs] = useState({});
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const [activeSectionFilter, setActiveSectionFilter] = useState('ALL');
  const [reviewFilter, setReviewFilter] = useState('ALL');

  // Past Attempts state
  const [pastAttempts, setPastAttempts] = useState([]);

  useEffect(() => {
    const fetchAttempts = async () => {
      const { data } = await localDb.from('aptitude_mock_attempts').select();
      if (data) setPastAttempts(data);
    };
    fetchAttempts();
  }, []);

  // Timer countdown hook during live test
  useEffect(() => {
    let timer = null;
    if (testState === 'testing' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleFinishMockTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [testState, timeLeft]);

  // Mark current question as visited
  useEffect(() => {
    if (testState === 'testing' && selectedMockTest) {
      const q = selectedMockTest.questions[currentQIndex];
      if (q) {
        setVisitedQs((prev) => ({ ...prev, [q.id]: true }));
      }
    }
  }, [currentQIndex, testState, selectedMockTest]);

  // Start a mock test
  const handleStartMockTest = (mockTest) => {
    setSelectedMockTest(mockTest);
    setTestState('testing');
    setCurrentQIndex(0);
    setUserAnswers({});
    setMarkedForReview({});
    setVisitedQs({ [mockTest.questions[0].id]: true });
    setTimeLeft(mockTest.timeLimitMinutes * 60);
    setActiveSectionFilter('ALL');
  };

  // Option selection
  const handleSelectMockAnswer = (qId, optionIdx) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optionIdx }));
  };

  const handleClearMockAnswer = (qId) => {
    setUserAnswers((prev) => {
      const copy = { ...prev };
      delete copy[qId];
      return copy;
    });
  };

  const handleToggleReview = (qId) => {
    setMarkedForReview((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  // Submit test and generate analytics
  const handleFinishMockTest = async () => {
    if (!selectedMockTest) return;

    let score = 0;
    const sectionalScores = {
      Quant: { correct: 0, total: 0 },
      Logical: { correct: 0, total: 0 },
      Verbal: { correct: 0, total: 0 },
      NonVerbal: { correct: 0, total: 0 },
      DI: { correct: 0, total: 0 }
    };

    selectedMockTest.questions.forEach((q) => {
      const userSel = userAnswers[q.id];
      const sec = q.section || 'Quant';
      if (!sectionalScores[sec]) {
        sectionalScores[sec] = { correct: 0, total: 0 };
      }
      sectionalScores[sec].total += 1;

      if (userSel !== undefined && userSel === q.correctIndex) {
        score += 1;
        sectionalScores[sec].correct += 1;
      }
    });

    const totalTimeSpentSeconds = selectedMockTest.timeLimitMinutes * 60 - timeLeft;
    const accuracyPercent = Math.round((score / selectedMockTest.totalQuestions) * 100);
    const isPassed = score >= selectedMockTest.passingScore;

    const attemptRecord = {
      id: `attempt-${Date.now()}`,
      mockTestId: selectedMockTest.id,
      mockTestTitle: selectedMockTest.title,
      score,
      totalQuestions: selectedMockTest.totalQuestions,
      accuracyPercent,
      isPassed,
      timeSpentSeconds: totalTimeSpentSeconds,
      sectionalScores,
      completedAt: new Date().toISOString()
    };

    await localDb.from('aptitude_mock_attempts').insert(attemptRecord);
    setPastAttempts((prev) => [attemptRecord, ...prev]);

    if (setAptitudeState) {
      setAptitudeState((prev) => ({
        score: accuracyPercent,
        accuracy: accuracyPercent,
        totalTests: (prev?.totalTests || 0) + 1,
        lastUpdated: new Date().toLocaleDateString()
      }));
    }

    try {
      recordActivity(userEmail || 'guest', 'aptitude');
    } catch (e) {}

    setTestState('results');
  };

  // Format seconds mm:ss
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getFilteredQuestions = () => {
    if (!selectedMockTest) return [];
    if (activeSectionFilter === 'ALL') return selectedMockTest.questions;
    return selectedMockTest.questions.filter((q) => q.section === activeSectionFilter);
  };

  const filteredQuestions = getFilteredQuestions();
  const currentQuestion = selectedMockTest?.questions[currentQIndex];

  // Helper for question palette colors
  const getPaletteStatus = (q) => {
    const isAns = userAnswers[q.id] !== undefined;
    const isMrk = !!markedForReview[q.id];
    const isVis = !!visitedQs[q.id];

    if (isAns && isMrk) return { bg: '#111827', color: '#FFF', label: 'Ans & Marked' };
    if (isMrk) return { bg: '#111827', color: '#FFF', label: 'Marked' };
    if (isAns) return { bg: '#111827', color: '#FFF', label: 'Answered' };
    if (isVis) return { bg: '#111827', color: '#FFF', label: 'Not Ans' };
    return { bg: '#F3F4F6', color: '#374151', label: 'Not Visited' };
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [testState, viewMode, selectedMockTest?.id]);

  return (
    <div style={{ flex: 1, padding: '36px 32px', maxWidth: '1280px', margin: '0 auto', width: '100%', fontFamily: 'var(--font-inter)' }}>
      
      {/* Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="btn-secondary-spec"
          style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600 }}
        >
          Back to Dashboard
        </button>

        {/* View Mode Switcher */}
        {testState === 'catalog' && (
          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#E5E7EB', padding: '4px', borderRadius: '10px' }}>
            <button
              onClick={() => setViewMode('mocktests')}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                backgroundColor: viewMode === 'mocktests' ? '#475569' : 'transparent',
                color: viewMode === 'mocktests' ? '#FFFFFF' : '#4B5563',
                transition: 'all 0.15s ease'
              }}
            >
              Mock Tests
            </button>
            <button
              onClick={() => setViewMode('formulas')}
              style={{
                padding: '10px 22px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                backgroundColor: viewMode === 'formulas' ? '#475569' : 'transparent',
                color: viewMode === 'formulas' ? '#FFFFFF' : '#4B5563',
                transition: 'all 0.15s ease'
              }}
            >
              Formulas & Speed Rules Reference
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: MOCK TESTS                                                        */}
      {/* ========================================================================= */}
      {viewMode === 'mocktests' && (
        <>
          {/* CATALOG VIEW */}
          {testState === 'catalog' && (
            <div>
              {/* Header Banner */}
              <div className="saas-card-spec" style={{ padding: '36px', marginBottom: '32px', backgroundColor: '#FFFFFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                      Mock Tests
                    </h2>
                    <p style={{ color: '#4B5563', fontSize: '0.96rem', maxWidth: '820px', lineHeight: 1.65 }}>
                      Comprehensive examination papers containing 40 questions each across Quantitative Aptitude, Logical Reasoning, Verbal Ability, Non-Verbal Reasoning, and Data Interpretation.
                    </p>
                  </div>
                  <div style={{ textAlign: 'right', backgroundColor: '#F8F9FA', padding: '16px 24px', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', lineHeight: 1 }}>800</div>
                    <div style={{ fontSize: '0.82rem', color: '#6B7280', fontWeight: 600, marginTop: '4px' }}>Total Questions</div>
                  </div>
                </div>
              </div>

              {/* Past Performance Summary */}
              {pastAttempts.length > 0 && (
                <div style={{ marginBottom: '32px', backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', border: '1.5px solid #E2E8F0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>
                      Recent Examination Records
                    </h4>
                    <span style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
                      {pastAttempts.length} Completed {pastAttempts.length === 1 ? 'Attempt' : 'Attempts'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '6px' }}>
                    {pastAttempts.slice(0, 4).map((att) => {
                      const matched = MOCK_TESTS_CATALOG.find((t) => t.id === att.mockTestId);
                      let displayTitle = matched?.title;
                      if (!displayTitle && att.mockTestTitle) {
                        const numMatch = att.mockTestTitle.match(/Mock Test (\d+)/i);
                        if (numMatch) {
                          const idx = parseInt(numMatch[1], 10) - 1;
                          displayTitle = MOCK_TESTS_CATALOG[idx]?.title;
                        }
                      }
                      if (!displayTitle) displayTitle = att.mockTestTitle || 'Placement Test';

                      return (
                        <div 
                          key={att.id} 
                          style={{ 
                            minWidth: '260px', 
                            backgroundColor: '#F8FAFC', 
                            padding: '16px 18px', 
                            borderRadius: '12px', 
                            border: '1.5px solid #E2E8F0',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginBottom: '6px' }}>
                              {displayTitle}
                            </div>
                            <div style={{ fontSize: '0.76rem', color: '#64748B', marginBottom: '10px' }}>
                              {new Date(att.completedAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '6px 10px',
                            borderRadius: '8px',
                            backgroundColor: att.isPassed ? '#F0FDF4' : '#FFFBEB',
                            border: `1px solid ${att.isPassed ? '#BBF7D0' : '#FDE68A'}`
                          }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: att.isPassed ? '#15803D' : '#B45309' }}>
                              Score: {att.score}/{att.totalQuestions} ({att.accuracyPercent}%)
                            </span>
                            <span style={{ fontSize: '0.74rem', fontWeight: 700, color: att.isPassed ? '#15803D' : '#B45309' }}>
                              {att.isPassed ? 'Passed' : 'Below Cutoff'}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section-based Mock Tests Catalog */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
                {MOCK_TEST_CATEGORIES.map((category) => {
                  const categoryTests = MOCK_TESTS_CATALOG.filter((t) => t.sectionId === category.id);
                  if (categoryTests.length === 0) return null;

                  return (
                    <div key={category.id} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Section Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '8px', paddingBottom: '4px' }}>
                        <div>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px' }}>
                            {category.title}
                          </h3>
                          <p style={{ fontSize: '0.86rem', color: '#64748B', margin: '4px 0 0 0', maxWidth: '820px', lineHeight: 1.5 }}>
                            {category.desc}
                          </p>
                        </div>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', color: '#334155', padding: '3px 10px', borderRadius: '12px' }}>
                          {categoryTests.length} Tests Available
                        </span>
                      </div>

                      {/* Section Table / Structured Row List */}
                      <div style={{ backgroundColor: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.02)' }}>
                        {categoryTests.map((test, tIdx) => {
                          const testAttempt = pastAttempts.find((a) => a.mockTestId === test.id);
                          const isLast = tIdx === categoryTests.length - 1;

                          return (
                            <div 
                              key={test.id}
                              style={{
                                padding: '20px 24px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '20px',
                                flexWrap: 'wrap',
                                borderBottom: isLast ? 'none' : '1px solid #F1F5F9',
                                backgroundColor: '#FFFFFF',
                                transition: 'background-color 0.15s ease'
                              }}
                            >
                              {/* Left Info: Title and Focus */}
                              <div style={{ flex: '1 1 360px' }}>
                                <h4 style={{ fontSize: '1.08rem', fontWeight: 800, color: '#0F172A', margin: '0 0 6px 0', letterSpacing: '-0.2px' }}>
                                  {test.title}
                                </h4>

                                {test.focus && (
                                  <div style={{ fontSize: '0.84rem', color: '#64748B', fontWeight: 500 }}>
                                    Focus: {test.focus}
                                  </div>
                                )}
                              </div>

                              {/* Right: Duration & Cutoff side by side, Best attempt & Action Button */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.82rem', color: '#64748B' }}>
                                  <span>Duration: <strong style={{ color: '#0F172A' }}>45 Mins</strong></span>
                                  <span style={{ color: '#CBD5E1' }}>|</span>
                                  <span>Cutoff: <strong style={{ color: '#0F172A' }}>28 Marks</strong></span>
                                </div>

                                {testAttempt && (
                                  <div style={{ 
                                    padding: '5px 12px', 
                                    backgroundColor: testAttempt.isPassed ? '#F0FDF4' : '#FFFBEB', 
                                    borderRadius: '6px', 
                                    border: `1px solid ${testAttempt.isPassed ? '#BBF7D0' : '#FDE68A'}`, 
                                    fontSize: '0.78rem', 
                                    fontWeight: 700,
                                    color: testAttempt.isPassed ? '#15803D' : '#B45309',
                                    textAlign: 'center'
                                  }}>
                                    Score: {testAttempt.score}/40
                                  </div>
                                )}

                                <button
                                  onClick={() => handleStartMockTest(test)}
                                  className="btn-primary-spec"
                                  style={{ padding: '10px 22px', fontSize: '0.86rem', fontWeight: 700, borderRadius: '8px', minWidth: '130px', justifyContent: 'center' }}
                                >
                                  {testAttempt ? 'Re-attempt' : 'Start Test'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* LIVE TESTING INTERFACE */}
          {testState === 'testing' && selectedMockTest && (
            <div>
              {/* Test Navigation Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 28px', backgroundColor: '#FFFFFF', color: '#0F172A', border: '1px solid #E2E8F0', borderRadius: '14px', marginBottom: '28px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                    {selectedMockTest.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '4px' }}>
                    Question {currentQIndex + 1} of {selectedMockTest.totalQuestions}
                  </div>
                </div>

                {/* Section Filter Tabs */}
                <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', padding: '4px', borderRadius: '8px' }}>
                  {['ALL', 'Quant', 'Logical', 'Verbal', 'NonVerbal', 'DI'].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setActiveSectionFilter(sec)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: activeSectionFilter === sec ? '#475569' : 'transparent',
                        color: activeSectionFilter === sec ? '#FFFFFF' : '#64748B'
                      }}
                    >
                      {sec}
                    </button>
                  ))}
                </div>

                {/* Countdown Timer */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: '#9CA3AF', letterSpacing: '0.5px' }}>Time Remaining</div>
                    <div style={{ fontSize: '1.35rem', fontWeight: 700, color: timeLeft < 300 ? '#111827' : '#111827', fontFamily: 'var(--font-code)' }}>
                      {formatTime(timeLeft)}
                    </div>
                  </div>

                  <button
                    onClick={handleFinishMockTest}
                    style={{
                      backgroundColor: '#475569',
                      color: '#FFF',
                      border: 'none',
                      padding: '10px 20px',
                      borderRadius: '8px',
                      fontWeight: 600,
                      fontSize: '0.88rem',
                      cursor: 'pointer'
                    }}
                  >
                    Submit Test
                  </button>
                </div>
              </div>

              {/* Main Test Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px' }}>
                
                {/* Left Pane: Question Card */}
                {currentQuestion && (
                  <div className="saas-card-spec" style={{ padding: '36px', backgroundColor: '#FFF', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '540px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <span className="pill-tag" style={{ backgroundColor: '#F3F4F6', color: '#111827', fontWeight: 600 }}>
                          Section: {currentQuestion.section}
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#111827', marginBottom: '28px', lineHeight: 1.65, whiteSpace: 'pre-line' }}>
                        Question {currentQIndex + 1}. {currentQuestion.question}
                      </h3>

                      {/* Options Grid */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '32px' }}>
                        {currentQuestion.options.map((opt, oIdx) => {
                          const isSelected = userAnswers[currentQuestion.id] === oIdx;
                          return (
                            <button
                              key={oIdx}
                              onClick={() => handleSelectMockAnswer(currentQuestion.id, oIdx)}
                              style={{
                                padding: '16px 20px',
                                borderRadius: '10px',
                                border: `1.5px solid ${isSelected ? '#111827' : '#E5E7EB'}`,
                                backgroundColor: isSelected ? '#F8F9FA' : '#FFFFFF',
                                color: '#111827',
                                fontWeight: isSelected ? 700 : 500,
                                fontSize: '0.95rem',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px'
                              }}
                            >
                              <span style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                backgroundColor: isSelected ? '#111827' : '#F3F4F6',
                                color: isSelected ? '#FFF' : '#374151',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                fontWeight: 700
                              }}>
                                {String.fromCharCode(65 + oIdx)}
                              </span>
                              <span style={{ lineHeight: 1.5 }}>{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Controls */}
                    <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => handleToggleReview(currentQuestion.id)}
                          style={{
                            padding: '10px 18px',
                            borderRadius: '8px',
                            border: '1px solid #475569',
                            backgroundColor: markedForReview[currentQuestion.id] ? '#475569' : '#F3F4F6',
                            color: markedForReview[currentQuestion.id] ? '#FFF' : '#1E293B',
                            fontWeight: 600,
                            fontSize: '0.88rem',
                            cursor: 'pointer'
                          }}
                        >
                          {markedForReview[currentQuestion.id] ? 'Marked for Review' : 'Mark for Review'}
                        </button>

                        {userAnswers[currentQuestion.id] !== undefined && (
                          <button
                            onClick={() => handleClearMockAnswer(currentQuestion.id)}
                            style={{
                              padding: '10px 18px',
                              borderRadius: '8px',
                              border: '1px solid #D1D5DB',
                              backgroundColor: '#FFF',
                              color: '#6B7280',
                              fontWeight: 500,
                              fontSize: '0.88rem',
                              cursor: 'pointer'
                            }}
                          >
                            Clear Response
                          </button>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                          disabled={currentQIndex === 0}
                          className="btn-secondary-spec"
                          style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600 }}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentQIndex((prev) => Math.min(selectedMockTest.questions.length - 1, prev + 1))}
                          disabled={currentQIndex === selectedMockTest.questions.length - 1}
                          className="btn-primary-spec"
                          style={{ padding: '10px 24px', fontSize: '0.88rem', fontWeight: 600 }}
                        >
                          Next Question
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Pane: Question Palette */}
                <div className="saas-card-spec" style={{ padding: '24px', backgroundColor: '#FFF', height: 'fit-content' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Question Palette ({filteredQuestions.length})
                  </h4>

                  {/* Legend */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', fontSize: '0.78rem', fontWeight: 600, color: '#4B5563' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#111827' }}></span>
                      <span>Answered ({Object.keys(userAnswers).length})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#111827' }}></span>
                      <span>Marked ({Object.values(markedForReview).filter(Boolean).length})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#111827' }}></span>
                      <span>Ans & Marked</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#F3F4F6', border: '1px solid #D1D5DB' }}></span>
                      <span>Not Visited</span>
                    </div>
                  </div>

                  {/* Palette Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '4px' }}>
                    {selectedMockTest.questions.map((q, idx) => {
                      if (activeSectionFilter !== 'ALL' && q.section !== activeSectionFilter) return null;
                      const status = getPaletteStatus(q);
                      const isCurrent = idx === currentQIndex;

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQIndex(idx)}
                          style={{
                            height: '38px',
                            borderRadius: '6px',
                            border: isCurrent ? '2px solid #111827' : '1px solid #E5E7EB',
                            backgroundColor: status.bg,
                            color: status.color,
                            fontWeight: isCurrent ? 800 : 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* POST-TEST RESULTS */}
          {testState === 'results' && selectedMockTest && (
            <div>
              {(() => {
                let totalScore = 0;
                const secBreakdown = { Quant: 0, Logical: 0, Verbal: 0, NonVerbal: 0, DI: 0 };
                selectedMockTest.questions.forEach((q) => {
                  if (userAnswers[q.id] === q.correctIndex) {
                    totalScore += 1;
                    secBreakdown[q.section] = (secBreakdown[q.section] || 0) + 1;
                  }
                });

                const accuracy = Math.round((totalScore / selectedMockTest.totalQuestions) * 100);
                const isPassed = totalScore >= selectedMockTest.passingScore;

                return (
                  <div>
                    {/* Top Result Banner */}
                    <div style={{ padding: '32px', marginBottom: '32px', backgroundColor: isPassed ? '#F0FDF4' : '#FFFBEB', border: `1.5px solid ${isPassed ? '#BBF7D0' : '#FDE68A'}`, borderRadius: '18px', boxShadow: '0 4px 16px rgba(0,0,0,0.03)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                        <div>
                          <span style={{ 
                            backgroundColor: isPassed ? '#DCFCE7' : '#FEF3C7', 
                            color: isPassed ? '#14532D' : '#92400E', 
                            border: `1px solid ${isPassed ? '#86EFAC' : '#FCD34D'}`,
                            padding: '4px 12px',
                            borderRadius: '20px',
                            fontSize: '0.76rem',
                            fontWeight: 800, 
                            display: 'inline-block',
                            marginBottom: '12px' 
                          }}>
                            {isPassed ? 'PASSED' : 'BELOW CUTOFF'}
                          </span>
                          <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#0F172A', margin: '4px 0 6px 0', letterSpacing: '-0.5px' }}>
                            {selectedMockTest.title} - Performance Report
                          </h2>
                          <p style={{ color: '#475569', fontSize: '0.94rem', lineHeight: 1.6, margin: 0 }}>
                            {isPassed 
                              ? `Achieved a score of ${totalScore}/40 (${accuracy}%), meeting the passing requirement.`
                              : `Achieved a score of ${totalScore}/40 (${accuracy}%). A minimum score of 28 marks (70%) is required.`}
                          </p>
                        </div>

                        <div style={{ textAlign: 'center', backgroundColor: '#FFFFFF', padding: '20px 32px', borderRadius: '14px', border: `1.5px solid ${isPassed ? '#BBF7D0' : '#FDE68A'}`, minWidth: '150px' }}>
                          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: isPassed ? '#15803D' : '#B45309', lineHeight: 1 }}>
                            {totalScore}<span style={{ fontSize: '1.1rem', color: '#64748B', fontWeight: 600 }}>/40</span>
                          </div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#475569', marginTop: '6px' }}>
                            Accuracy: {accuracy}%
                          </div>
                        </div>
                      </div>

                      {/* Sectional Breakdown Metrics in Pastel Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', marginTop: '28px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '24px' }}>
                        <div style={{ backgroundColor: '#F0F9FF', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1.5px solid #BAE6FD' }}>
                          <div style={{ fontSize: '0.78rem', color: '#0369A1', fontWeight: 700 }}>Quantitative</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#0C4A6E', marginTop: '4px' }}>{secBreakdown.Quant}/12</div>
                        </div>
                        <div style={{ backgroundColor: '#FAF5FF', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1.5px solid #E9D5FF' }}>
                          <div style={{ fontSize: '0.78rem', color: '#7E22CE', fontWeight: 700 }}>Logical</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#581C87', marginTop: '4px' }}>{secBreakdown.Logical}/10</div>
                        </div>
                        <div style={{ backgroundColor: '#ECFDF5', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1.5px solid #A7F3D0' }}>
                          <div style={{ fontSize: '0.78rem', color: '#047857', fontWeight: 700 }}>Verbal</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#064E3B', marginTop: '4px' }}>{secBreakdown.Verbal}/10</div>
                        </div>
                        <div style={{ backgroundColor: '#FFFBEB', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1.5px solid #FDE68A' }}>
                          <div style={{ fontSize: '0.78rem', color: '#B45309', fontWeight: 700 }}>Non-Verbal</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#78350F', marginTop: '4px' }}>{secBreakdown.NonVerbal}/4</div>
                        </div>
                        <div style={{ backgroundColor: '#F0FDFA', padding: '16px', borderRadius: '12px', textAlign: 'center', border: '1.5px solid #99F6E4' }}>
                          <div style={{ fontSize: '0.78rem', color: '#0F766E', fontWeight: 700 }}>Data Interpretation</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#134E4A', marginTop: '4px' }}>{secBreakdown.DI}/4</div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                        <button
                          onClick={() => setTestState('catalog')}
                          className="btn-primary-spec"
                          style={{ fontSize: '0.88rem', padding: '12px 24px', fontWeight: 700, borderRadius: '10px' }}
                        >
                          Back to Mock Tests
                        </button>
                        <button
                          onClick={() => handleStartMockTest(selectedMockTest)}
                          className="btn-secondary-spec"
                          style={{ fontSize: '0.88rem', padding: '12px 24px', fontWeight: 700, borderRadius: '10px' }}
                        >
                          Re-attempt Test
                        </button>
                      </div>
                    </div>

                    {/* Solutions Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                      <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#111827', letterSpacing: '-0.3px' }}>
                        Question Analysis and Solutions (40 Questions)
                      </h3>

                      <div style={{ display: 'flex', gap: '6px' }}>
                        {['ALL', 'CORRECT', 'INCORRECT', 'UNATTEMPTED'].map((f) => (
                          <button
                            key={f}
                            onClick={() => setReviewFilter(f)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '6px',
                              border: reviewFilter === f ? '1px solid #475569' : '1px solid #D1D5DB',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              backgroundColor: reviewFilter === f ? '#475569' : '#FFF',
                              color: reviewFilter === f ? '#FFF' : '#374151'
                            }}
                          >
                            {f}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Question Breakdown List */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {selectedMockTest.questions.map((q, idx) => {
                        const userSel = userAnswers[q.id];
                        const isCorrect = userSel === q.correctIndex;
                        const isUnattempted = userSel === undefined;

                        if (reviewFilter === 'CORRECT' && (!isCorrect || isUnattempted)) return null;
                        if (reviewFilter === 'INCORRECT' && (isCorrect || isUnattempted)) return null;
                        if (reviewFilter === 'UNATTEMPTED' && !isUnattempted) return null;

                        return (
                          <div key={q.id} className="saas-card-spec" style={{ padding: '28px', backgroundColor: '#FFF', borderLeft: `5px solid ${isCorrect ? '#111827' : isUnattempted ? '#9CA3AF' : '#111827'}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#111827' }}>
                                Question {idx + 1} [{q.section}]
                              </span>
                              <span style={{
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                padding: '4px 12px',
                                borderRadius: '6px',
                                backgroundColor: isCorrect ? '#F3F4F6' : isUnattempted ? '#F3F4F6' : '#F3F4F6',
                                color: isCorrect ? '#111827' : isUnattempted ? '#4B5563' : '#111827'
                              }}>
                                {isCorrect ? 'Correct (+1 Mark)' : isUnattempted ? 'Unattempted (0 Marks)' : 'Incorrect (0 Marks)'}
                              </span>
                            </div>

                            <h4 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#111827', marginBottom: '20px', lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                              {q.question}
                            </h4>

                            {/* Options */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                              {q.options.map((opt, oIdx) => {
                                const isCorrectOption = oIdx === q.correctIndex;
                                const isUserOption = oIdx === userSel;

                                let border = '#E5E7EB';
                                let bg = '#FFF';
                                let color = '#374151';

                                if (isCorrectOption) {
                                  border = '#111827';
                                  bg = '#F3F4F6';
                                  color = '#111827';
                                } else if (isUserOption && !isCorrectOption) {
                                  border = '#111827';
                                  bg = '#F3F4F6';
                                  color = '#111827';
                                }

                                return (
                                  <div
                                    key={oIdx}
                                    style={{
                                      padding: '14px 18px',
                                      borderRadius: '8px',
                                      border: `1.5px solid ${border}`,
                                      backgroundColor: bg,
                                      color,
                                      fontSize: '0.9rem',
                                      fontWeight: (isCorrectOption || isUserOption) ? 700 : 500,
                                      lineHeight: 1.5
                                    }}
                                  >
                                    {String.fromCharCode(65 + oIdx)}. {opt} {isCorrectOption && ' [Correct Answer]'} {isUserOption && !isCorrectOption && ' [Your Selection]'}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation */}
                            <div style={{ padding: '18px', borderRadius: '8px', backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB', fontSize: '0.9rem', color: '#374151', lineHeight: 1.65 }}>
                              <strong style={{ color: '#111827', display: 'block', marginBottom: '4px' }}>Solution Steps:</strong>
                              {q.explanation}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: FORMULAS & SPEED RULES REFERENCE GUIDE                             */}
      {/* ========================================================================= */}
      {viewMode === 'formulas' && (
        <div>
          {/* Header Banner */}
          <div className="saas-card-spec" style={{ padding: '36px', marginBottom: '32px', backgroundColor: '#FFFFFF' }}>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827', marginBottom: '8px', letterSpacing: '-0.5px' }}>
              Quantitative & Logical Formula Reference
            </h2>
            <p style={{ color: '#4B5563', fontSize: '0.96rem', lineHeight: 1.65, maxWidth: '850px' }}>
              Standard mathematical identities, analytical reasoning guidelines, grammatical conventions, and execution constraints required for aptitude examinations.
            </p>
          </div>

          {/* Sector Switcher Tabs */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '28px', overflowX: 'auto', paddingBottom: '4px' }}>
            {FORMULA_SECTORS.map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveFormulaSector(sec.id)}
                className={activeFormulaSector === sec.id ? 'btn-primary-spec' : 'btn-secondary-spec'}
                style={{ fontSize: '0.88rem', padding: '10px 20px', whiteSpace: 'nowrap', fontWeight: 600 }}
              >
                {sec.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div style={{ marginBottom: '28px' }}>
            <input
              type="text"
              placeholder="Search by topic title or formula keyword..."
              value={formulaSearchQuery}
              onChange={(e) => setFormulaSearchQuery(e.target.value)}
              className="saas-search-input"
              style={{ height: '50px', fontSize: '0.95rem' }}
            />
          </div>

          {/* Topics Formula Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {(TOPIC_FORMULAS[activeFormulaSector] || [])
              .filter((item) =>
                item.topic.toLowerCase().includes(formulaSearchQuery.toLowerCase()) ||
                item.formulas.some((f) => f.toLowerCase().includes(formulaSearchQuery.toLowerCase()))
              )
              .map((item, idx) => (
                <div key={idx} className="saas-card-spec" style={{ padding: '32px', backgroundColor: '#FFFFFF' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #F3F4F6', paddingBottom: '16px' }}>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', margin: 0 }}>
                      {item.topic}
                    </h3>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span className="pill-tag" style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', fontWeight: 600 }}>
                        {item.importance}
                      </span>
                      <span className="pill-tag" style={{ backgroundColor: '#F3F4F6', color: '#374151', border: '1px solid #E5E7EB', fontWeight: 600 }}>
                        Time Target: {item.timeLimit}
                      </span>
                    </div>
                  </div>

                  {/* Formulas Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Core Mathematical Identities & Rules
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {item.formulas.map((f, fIdx) => (
                        <div key={fIdx} style={{ padding: '14px 18px', backgroundColor: '#F8F9FA', borderRadius: '8px', borderLeft: '4px solid #111827', fontSize: '0.92rem', color: '#1F2937', lineHeight: 1.6, fontWeight: 500 }}>
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Speed Tricks Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Calculation Shortcuts & Methodologies
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {item.speedTricks.map((st, stIdx) => (
                        <div key={stIdx} style={{ padding: '14px 18px', backgroundColor: '#F8F9FA', borderRadius: '8px', borderLeft: '4px solid #4B5563', fontSize: '0.92rem', color: '#374151', lineHeight: 1.6, fontWeight: 500 }}>
                          {st}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Examination Guidance */}
                  <div style={{ padding: '16px 20px', backgroundColor: '#F8F9FA', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '0.9rem', color: '#374151', lineHeight: 1.6 }}>
                    <strong style={{ color: '#111827' }}>Examination Note:</strong> {item.proTip}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
}

