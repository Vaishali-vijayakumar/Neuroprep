import React, { useState, useEffect } from 'react';
import { FORMULA_SECTORS, TOPIC_FORMULAS } from '../data/aptitudeFormulasData';
import { MOCK_TESTS_CATALOG, MOCK_TEST_CATEGORIES } from '../data/mockTestsData';
import { localDb } from '../services/localDb';
import { dbService } from '../services/db';
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
      userAnswers: { ...userAnswers },
      completedAt: new Date().toISOString()
    };

    await localDb.from('aptitude_mock_attempts').insert(attemptRecord);
    setPastAttempts((prev) => [attemptRecord, ...prev]);

    const newTotalTests = (pastAttempts.length || 0) + 1;
    dbService.saveTestScore('aptitude', accuracyPercent, userEmail, {
      accuracy: accuracyPercent,
      totalTests: newTotalTests,
      mockTestTitle: selectedMockTest.title
    });

    if (setAptitudeState) {
      setAptitudeState((prev) => ({
        score: accuracyPercent,
        accuracy: accuracyPercent,
        totalTests: newTotalTests,
        lastUpdated: new Date().toLocaleDateString()
      }));
    }

    try {
      recordActivity(userEmail || 'guest', 'aptitude');
    } catch (e) {}

    setTestState('results');
  };

  // Open review for a specific past attempt record
  const handleReviewAttempt = (attempt) => {
    let matched = MOCK_TESTS_CATALOG.find((t) => t.id === attempt.mockTestId);
    if (!matched && attempt.mockTestTitle) {
      const numMatch = attempt.mockTestTitle.match(/Mock Test (\d+)/i);
      if (numMatch) {
        const idx = parseInt(numMatch[1], 10) - 1;
        matched = MOCK_TESTS_CATALOG[idx];
      } else {
        matched = MOCK_TESTS_CATALOG.find((t) => t.title.toLowerCase() === attempt.mockTestTitle.toLowerCase());
      }
    }
    if (!matched) {
      matched = MOCK_TESTS_CATALOG[0];
    }

    setSelectedMockTest(matched);
    setUserAnswers(attempt.userAnswers || {});
    setReviewFilter('ALL');
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

    if (isAns && isMrk) return { bg: 'var(--secondary-olive)', color: 'var(--btn-text)', label: 'Ans & Marked' };
    if (isMrk) return { bg: 'var(--accent-terracotta)', color: '#FFFFFF', label: 'Marked' };
    if (isAns) return { bg: 'var(--btn-sage)', color: 'var(--btn-text)', label: 'Answered' };
    if (isVis) return { bg: '#EAECE8', color: 'var(--secondary-heading)', label: 'Not Ans' };
    return { bg: '#FCF9F6', color: 'var(--text-muted)', label: 'Not Visited' };
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [testState, viewMode, selectedMockTest?.id]);

  return (
    <div style={{ flex: 1, padding: '36px 32px', maxWidth: '1280px', margin: '0 auto', width: '100%', fontFamily: 'var(--font-main)' }}>
      
      {/* Navigation Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="btn-back-dashboard"
          style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600 }}
        >
          Back to Dashboard
        </button>

        {/* View Mode Switcher */}
        {testState === 'catalog' && (
          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#F5EBE6', padding: '5px', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <button
              onClick={() => setViewMode('mocktests')}
              style={{
                padding: '10px 22px',
                borderRadius: '9px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                backgroundColor: viewMode === 'mocktests' ? 'var(--btn-sage)' : 'transparent',
                color: viewMode === 'mocktests' ? 'var(--btn-text)' : 'var(--secondary-heading)',
                boxShadow: viewMode === 'mocktests' ? 'var(--shadow-3d-btn)' : 'none',
                transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            >
              Mock Tests
            </button>
            <button
              onClick={() => setViewMode('formulas')}
              style={{
                padding: '10px 22px',
                borderRadius: '9px',
                border: 'none',
                fontWeight: 700,
                fontSize: '0.88rem',
                cursor: 'pointer',
                backgroundColor: viewMode === 'formulas' ? 'var(--btn-sage)' : 'transparent',
                color: viewMode === 'formulas' ? 'var(--btn-text)' : 'var(--secondary-heading)',
                boxShadow: viewMode === 'formulas' ? 'var(--shadow-3d-btn)' : 'none',
                transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)'
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
              <div className="saas-card-spec" style={{ padding: '32px 36px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '24px', flexWrap: 'wrap' }}>
                  <div>
                    <span className="pill-tag" style={{ marginBottom: '10px' }}>Comprehensive Preparation</span>
                    <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--main-heading)', margin: '4px 0 8px 0', letterSpacing: '-0.3px', fontFamily: 'var(--font-heading)' }}>
                      Placement Aptitude Mock Tests
                    </h2>
                    <p style={{ color: 'var(--body-text)', fontSize: '0.94rem', maxWidth: '820px', lineHeight: 1.6, margin: 0 }}>
                      Full-length practice examinations (40 questions each) covering Quantitative Aptitude, Logical Reasoning, Verbal Ability, Non-Verbal Reasoning, and Data Interpretation.
                    </p>
                  </div>
                  <div style={{ textAlign: 'center', backgroundColor: 'var(--bg-card-solid)', padding: '16px 28px', borderRadius: '16px', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(52, 52, 58, 0.04)', minWidth: '150px' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--main-heading)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>800</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700, marginTop: '4px', textTransform: 'uppercase' }}>Total Questions</div>
                  </div>
                </div>
              </div>

              {/* Section-based Mock Tests Catalog */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '36px' }}>
                {MOCK_TEST_CATEGORIES.map((category) => {
                  const categoryTests = MOCK_TESTS_CATALOG.filter((t) => t.sectionId === category.id);
                  if (categoryTests.length === 0) return null;

                  return (
                    <div key={category.id} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Section Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '8px', paddingBottom: '4px' }}>
                        <div>
                          <h3 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--secondary-heading)', margin: 0, letterSpacing: '-0.2px', fontFamily: 'var(--font-heading)' }}>
                            {category.title}
                          </h3>
                          <p style={{ fontSize: '0.88rem', color: 'var(--body-text)', margin: '4px 0 0 0', maxWidth: '820px', lineHeight: 1.5 }}>
                            {category.desc}
                          </p>
                        </div>
                        <span className="pill-tag">
                          {categoryTests.length} Tests Available
                        </span>
                      </div>

                      {/* Section Table / Structured Row List */}
                      <div className="saas-card-spec" style={{ padding: 0, overflow: 'hidden' }}>
                        {categoryTests.map((test, tIdx) => {
                          const testAttempt = pastAttempts.find((a) => a.mockTestId === test.id || (a.mockTestTitle && a.mockTestTitle.toLowerCase().includes(test.title.toLowerCase())));
                          const isLast = tIdx === categoryTests.length - 1;

                          return (
                            <div 
                              key={test.id}
                              style={{
                                padding: '20px 28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '20px',
                                flexWrap: 'wrap',
                                borderBottom: isLast ? 'none' : '1px solid #F5EBE6',
                                transition: 'background-color 0.18s ease'
                              }}
                            >
                              {/* Left Info: Title and Focus */}
                              <div style={{ flex: '1 1 360px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                                  <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--main-heading)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                                    {test.title}
                                  </h4>
                                  {testAttempt && (
                                    <span style={{
                                      fontSize: '0.7rem',
                                      fontWeight: 800,
                                      padding: '2px 8px',
                                      borderRadius: '12px',
                                      backgroundColor: testAttempt.isPassed ? '#EAECE8' : '#F5EBE6',
                                      color: testAttempt.isPassed ? '#526257' : '#9A6854',
                                      border: '1px solid var(--border-color)'
                                    }}>
                                      {testAttempt.isPassed ? 'PASSED' : 'ATTEMPTED'}
                                    </span>
                                  )}
                                </div>

                                {test.focus && (
                                  <div style={{ fontSize: '0.84rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                                    Focus: {test.focus}
                                  </div>
                                )}
                              </div>

                              {/* Right: Duration & Cutoff side by side, Best attempt & Action Buttons */}
                              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap', flexShrink: 0 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.84rem', color: 'var(--text-muted)' }}>
                                  <span>Duration: <strong style={{ color: 'var(--main-heading)' }}>45 Mins</strong></span>
                                  <span style={{ color: 'var(--border-color)' }}>|</span>
                                  <span>Cutoff: <strong style={{ color: 'var(--main-heading)' }}>28 Marks</strong></span>
                                </div>

                                {testAttempt && (
                                  <div style={{ 
                                    padding: '5px 12px', 
                                    backgroundColor: testAttempt.isPassed ? '#EAECE8' : '#F5EBE6', 
                                    borderRadius: '8px', 
                                    border: '1px solid var(--border-color)', 
                                    fontSize: '0.82rem', 
                                    fontWeight: 800,
                                    color: testAttempt.isPassed ? '#526257' : '#9A6854',
                                    textAlign: 'center',
                                    fontFamily: 'var(--font-heading)'
                                  }}>
                                    Score: {testAttempt.score}/40
                                  </div>
                                )}

                                {testAttempt && (
                                  <button
                                    onClick={() => handleReviewAttempt(testAttempt)}
                                    className="btn-secondary-spec"
                                    style={{ padding: '9px 18px', fontSize: '0.84rem', fontWeight: 700, borderRadius: '10px' }}
                                  >
                                    Review
                                  </button>
                                )}

                                <button
                                  onClick={() => handleStartMockTest(test)}
                                  className="btn-primary-spec"
                                  style={{ padding: '10px 22px', fontSize: '0.86rem', fontWeight: 700, borderRadius: '10px', minWidth: '130px', justifyContent: 'center' }}
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
              <div className="saas-card-spec" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 28px', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>
                    {selectedMockTest.title}
                  </h3>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Question {currentQIndex + 1} of {selectedMockTest.totalQuestions}
                  </div>
                </div>

                {/* Section Filter Tabs */}
                <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F5EBE6', border: '1px solid var(--border-color)', padding: '4px', borderRadius: '10px' }}>
                  {['ALL', 'Quant', 'Logical', 'Verbal', 'NonVerbal', 'DI'].map((sec) => (
                    <button
                      key={sec}
                      onClick={() => setActiveSectionFilter(sec)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '7px',
                        border: 'none',
                        fontSize: '0.82rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        backgroundColor: activeSectionFilter === sec ? 'var(--btn-sage)' : 'transparent',
                        color: activeSectionFilter === sec ? 'var(--btn-text)' : 'var(--secondary-heading)',
                        boxShadow: activeSectionFilter === sec ? 'var(--shadow-3d-btn)' : 'none',
                        transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)'
                      }}
                    >
                      {sec}
                    </button>
                  ))}
                </div>

                {/* Countdown Timer & Submit */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px', fontWeight: 700 }}>Time Remaining</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 800, color: timeLeft < 300 ? 'var(--accent-terracotta)' : 'var(--main-heading)', fontFamily: 'var(--font-code)' }}>
                      {formatTime(timeLeft)}
                    </div>
                  </div>

                  <button
                    onClick={handleFinishMockTest}
                    className="btn-primary-spec"
                    style={{ padding: '10px 22px', fontSize: '0.88rem', fontWeight: 700, borderRadius: '10px' }}
                  >
                    Submit Test
                  </button>
                </div>
              </div>

              {/* Main Test Layout */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '28px' }}>
                
                {/* Left Pane: Question Card */}
                {currentQuestion && (
                  <div className="saas-card-spec" style={{ padding: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '540px' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                        <span className="pill-tag">
                          Section: {currentQuestion.section}
                        </span>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                          1 Mark per Question &bull; No Negative Marking
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--main-heading)', marginBottom: '28px', lineHeight: 1.65, whiteSpace: 'pre-line', fontFamily: 'var(--font-heading)' }}>
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
                                borderRadius: '12px',
                                border: isSelected ? '2px solid var(--btn-sage)' : '1.5px solid var(--border-color)',
                                backgroundColor: isSelected ? '#EAECE8' : 'var(--bg-card-solid)',
                                color: isSelected ? 'var(--main-heading)' : 'var(--body-text)',
                                fontWeight: isSelected ? 700 : 500,
                                fontSize: '0.95rem',
                                textAlign: 'left',
                                cursor: 'pointer',
                                transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                                boxShadow: isSelected ? '0 3px 10px rgba(82, 98, 87, 0.14)' : 'none'
                              }}
                            >
                              <span style={{
                                width: '30px',
                                height: '30px',
                                borderRadius: '50%',
                                backgroundColor: isSelected ? 'var(--btn-sage)' : '#F5EBE6',
                                color: isSelected ? 'var(--btn-text)' : 'var(--secondary-heading)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                flexShrink: 0
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
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
                      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => handleToggleReview(currentQuestion.id)}
                          className="btn-secondary-spec"
                          style={{
                            padding: '10px 18px',
                            borderRadius: '10px',
                            backgroundColor: markedForReview[currentQuestion.id] ? 'var(--accent-terracotta)' : 'var(--bg-card-solid)',
                            color: markedForReview[currentQuestion.id] ? '#FFF' : 'var(--secondary-heading)',
                            borderColor: markedForReview[currentQuestion.id] ? 'var(--accent-terracotta)' : 'var(--border-color)'
                          }}
                        >
                          {markedForReview[currentQuestion.id] ? 'Marked for Review' : 'Mark for Review'}
                        </button>

                        {userAnswers[currentQuestion.id] !== undefined && (
                          <button
                            onClick={() => handleClearMockAnswer(currentQuestion.id)}
                            className="btn-secondary-spec"
                            style={{ padding: '10px 18px', borderRadius: '10px' }}
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
                          style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600, opacity: currentQIndex === 0 ? 0.5 : 1 }}
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentQIndex((prev) => Math.min(selectedMockTest.questions.length - 1, prev + 1))}
                          disabled={currentQIndex === selectedMockTest.questions.length - 1}
                          className="btn-primary-spec"
                          style={{ padding: '10px 24px', fontSize: '0.88rem', fontWeight: 600, opacity: currentQIndex === selectedMockTest.questions.length - 1 ? 0.5 : 1 }}
                        >
                          Next Question
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Right Pane: Question Palette */}
                <div className="saas-card-spec" style={{ padding: '24px', height: 'fit-content' }}>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--main-heading)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.5px', fontFamily: 'var(--font-heading)' }}>
                    Question Palette ({filteredQuestions.length})
                  </h4>

                  {/* Legend */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--body-text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--btn-sage)' }}></span>
                      <span>Answered ({Object.keys(userAnswers).length})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--accent-terracotta)' }}></span>
                      <span>Marked ({Object.values(markedForReview).filter(Boolean).length})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: 'var(--secondary-olive)' }}></span>
                      <span>Ans & Marked</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '12px', height: '12px', borderRadius: '3px', backgroundColor: '#FCF9F6', border: '1px solid var(--border-color)' }}></span>
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
                            borderRadius: '8px',
                            border: isCurrent ? '2px solid var(--btn-sage)' : '1px solid var(--border-color)',
                            backgroundColor: status.bg,
                            color: status.color,
                            fontWeight: isCurrent ? 800 : 600,
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            boxShadow: isCurrent ? '0 0 0 2px rgba(82, 98, 87, 0.25)' : 'none',
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
                let answeredCount = 0;
                let unattemptedCount = 0;
                let incorrectCount = 0;
                const totalQuestions = selectedMockTest.questions?.length || selectedMockTest.totalQuestions || 40;

                const secBreakdown = {
                  Quant: { correct: 0, total: 12, attempted: 0 },
                  Logical: { correct: 0, total: 10, attempted: 0 },
                  Verbal: { correct: 0, total: 10, attempted: 0 },
                  NonVerbal: { correct: 0, total: 4, attempted: 0 },
                  DI: { correct: 0, total: 4, attempted: 0 }
                };

                selectedMockTest.questions.forEach((q) => {
                  const userSel = userAnswers[q.id];
                  const sec = q.section || 'Quant';
                  if (!secBreakdown[sec]) {
                    secBreakdown[sec] = { correct: 0, total: 0, attempted: 0 };
                  }

                  if (userSel !== undefined) {
                    answeredCount += 1;
                    secBreakdown[sec].attempted += 1;
                    if (userSel === q.correctIndex) {
                      totalScore += 1;
                      secBreakdown[sec].correct += 1;
                    } else {
                      incorrectCount += 1;
                    }
                  } else {
                    unattemptedCount += 1;
                  }
                });

                const accuracy = Math.round((totalScore / totalQuestions) * 100);
                const accuracyOnAttempted = answeredCount > 0 ? Math.round((totalScore / answeredCount) * 100) : 0;
                const isPassed = totalScore >= (selectedMockTest.passingScore || 28);

                return (
                  <div>
                    {/* Top Result Banner */}
                    <div className="saas-card-spec" style={{ padding: '36px', marginBottom: '32px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ flex: '1 1 420px' }}>
                          <span className="pill-tag" style={{
                            backgroundColor: isPassed ? '#EAECE8' : '#F5EBE6', 
                            color: isPassed ? '#526257' : '#9A6854', 
                            borderColor: 'var(--border-color)',
                            marginBottom: '12px' 
                          }}>
                            {isPassed ? 'PASSED - CUTOFF MET' : 'BELOW CUTOFF (28/40 REQUIRED)'}
                          </span>
                          <h2 style={{ fontSize: '1.85rem', fontWeight: 700, color: 'var(--main-heading)', margin: '4px 0 8px 0', letterSpacing: '-0.3px', fontFamily: 'var(--font-heading)' }}>
                            {selectedMockTest.title} - Performance Report
                          </h2>
                          <p style={{ color: 'var(--body-text)', fontSize: '0.94rem', lineHeight: 1.6, margin: 0 }}>
                            {isPassed 
                              ? `You answered ${answeredCount} of ${totalQuestions} questions and scored ${totalScore}/40 (${accuracy}%), successfully meeting the required cutoff.`
                              : `You answered ${answeredCount} of ${totalQuestions} questions and scored ${totalScore}/40 (${accuracy}%). Cutoff requirement is 28 marks (70%).`}
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                          <div style={{ textAlign: 'center', backgroundColor: 'var(--bg-card-solid)', padding: '18px 26px', borderRadius: '16px', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(52, 52, 58, 0.04)', minWidth: '135px' }}>
                            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: isPassed ? '#526257' : '#9A6854', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>
                              {totalScore}<span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', fontWeight: 600 }}>/{totalQuestions}</span>
                            </div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '6px', textTransform: 'uppercase' }}>
                              Net Score
                            </div>
                          </div>

                          <div style={{ textAlign: 'center', backgroundColor: 'var(--bg-card-solid)', padding: '18px 26px', borderRadius: '16px', border: '1.5px solid var(--border-color)', boxShadow: '0 2px 8px rgba(52, 52, 58, 0.04)', minWidth: '135px' }}>
                            <div style={{ fontSize: '2.4rem', fontWeight: 800, color: 'var(--main-heading)', lineHeight: 1, fontFamily: 'var(--font-heading)' }}>
                              {accuracy}%
                            </div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-muted)', marginTop: '6px', textTransform: 'uppercase' }}>
                              Accuracy
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Primary Attempt Summary Cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '14px', marginTop: '26px' }}>
                        <div style={{ backgroundColor: 'var(--bg-card-solid)', padding: '18px 20px', borderRadius: '14px', border: '1.5px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Questions Attempted</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--main-heading)', fontFamily: 'var(--font-heading)' }}>
                            {answeredCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ {totalQuestions} ({Math.round((answeredCount / totalQuestions) * 100)}%)</span>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>Total responses submitted</div>
                        </div>

                        <div style={{ backgroundColor: 'var(--bg-card-solid)', padding: '18px 20px', borderRadius: '14px', border: '1.5px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.74rem', color: '#526257', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Correct Answers</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#526257', fontFamily: 'var(--font-heading)' }}>
                            {totalScore} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>({accuracyOnAttempted}% on attempted)</span>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>+1 mark per question</div>
                        </div>

                        <div style={{ backgroundColor: 'var(--bg-card-solid)', padding: '18px 20px', borderRadius: '14px', border: '1.5px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.74rem', color: '#9A6854', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Incorrect Answers</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#9A6854', fontFamily: 'var(--font-heading)' }}>
                            {incorrectCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Questions</span>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>0 marks awarded</div>
                        </div>

                        <div style={{ backgroundColor: 'var(--bg-card-solid)', padding: '18px 20px', borderRadius: '14px', border: '1.5px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.74rem', color: 'var(--secondary-heading)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '4px' }}>Unattempted (Skipped)</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--secondary-heading)', fontFamily: 'var(--font-heading)' }}>
                            {unattemptedCount} <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Questions</span>
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>Left blank</div>
                        </div>
                      </div>

                      {/* Sectional Breakdown Metrics */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px', marginTop: '20px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                        <div style={{ backgroundColor: '#EAECE8', padding: '16px', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.78rem', color: '#526257', fontWeight: 800, textTransform: 'uppercase' }}>Quantitative</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--main-heading)', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
                            {secBreakdown.Quant.correct}/{secBreakdown.Quant.total}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {secBreakdown.Quant.attempted}/{secBreakdown.Quant.total} attempted
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#F5EBE6', padding: '16px', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.78rem', color: '#9A6854', fontWeight: 800, textTransform: 'uppercase' }}>Logical</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--main-heading)', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
                            {secBreakdown.Logical.correct}/{secBreakdown.Logical.total}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {secBreakdown.Logical.attempted}/{secBreakdown.Logical.total} attempted
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#EAECE8', padding: '16px', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.78rem', color: '#526257', fontWeight: 800, textTransform: 'uppercase' }}>Verbal</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--main-heading)', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
                            {secBreakdown.Verbal.correct}/{secBreakdown.Verbal.total}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {secBreakdown.Verbal.attempted}/{secBreakdown.Verbal.total} attempted
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#F5EBE6', padding: '16px', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.78rem', color: '#9A6854', fontWeight: 800, textTransform: 'uppercase' }}>Non-Verbal</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--main-heading)', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
                            {secBreakdown.NonVerbal.correct}/{secBreakdown.NonVerbal.total}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {secBreakdown.NonVerbal.attempted}/{secBreakdown.NonVerbal.total} attempted
                          </div>
                        </div>

                        <div style={{ backgroundColor: '#EAECE8', padding: '16px', borderRadius: '14px', textAlign: 'center', border: '1px solid var(--border-color)' }}>
                          <div style={{ fontSize: '0.78rem', color: '#526257', fontWeight: 800, textTransform: 'uppercase' }}>Data Interpretation</div>
                          <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--main-heading)', marginTop: '4px', fontFamily: 'var(--font-heading)' }}>
                            {secBreakdown.DI.correct}/{secBreakdown.DI.total}
                          </div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                            {secBreakdown.DI.attempted}/{secBreakdown.DI.total} attempted
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div style={{ marginTop: '28px', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
                        <button
                          onClick={() => setTestState('catalog')}
                          className="btn-primary-spec"
                          style={{ fontSize: '0.88rem', padding: '12px 26px', fontWeight: 700, borderRadius: '10px' }}
                        >
                          Back to Mock Tests
                        </button>
                        <button
                          onClick={() => handleStartMockTest(selectedMockTest)}
                          className="btn-secondary-spec"
                          style={{ fontSize: '0.88rem', padding: '12px 26px', fontWeight: 700, borderRadius: '10px' }}
                        >
                          Re-attempt Test
                        </button>
                      </div>
                    </div>

                    {/* Solutions Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '14px' }}>
                      <div>
                        <span className="pill-tag" style={{ marginBottom: '8px' }}>Detailed Audit</span>
                        <h3 style={{ fontSize: '1.45rem', fontWeight: 700, color: 'var(--main-heading)', letterSpacing: '-0.3px', margin: '4px 0', fontFamily: 'var(--font-heading)' }}>
                          Question Analysis & Detailed Solutions
                        </h3>
                        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--body-text)' }}>
                          Review all 40 questions, your selected responses, verified solutions, and step-by-step mathematical reasoning.
                        </p>
                      </div>

                      {(() => {
                        let correctCount = 0;
                        let incorrectCount = 0;
                        let unattemptedCount = 0;
                        selectedMockTest.questions.forEach((q) => {
                          const userSel = userAnswers[q.id];
                          if (userSel === undefined) unattemptedCount++;
                          else if (userSel === q.correctIndex) correctCount++;
                          else incorrectCount++;
                        });

                        return (
                          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#F5EBE6', padding: '5px', borderRadius: '12px', border: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                            {[
                              { id: 'ALL', label: `ALL (${selectedMockTest.questions.length})` },
                              { id: 'CORRECT', label: `CORRECT (${correctCount})` },
                              { id: 'INCORRECT', label: `INCORRECT (${incorrectCount})` },
                              { id: 'UNATTEMPTED', label: `UNATTEMPTED (${unattemptedCount})` }
                            ].map((f) => (
                              <button
                                key={f.id}
                                onClick={() => setReviewFilter(f.id)}
                                style={{
                                  padding: '8px 16px',
                                  borderRadius: '8px',
                                  border: 'none',
                                  fontWeight: 700,
                                  fontSize: '0.82rem',
                                  cursor: 'pointer',
                                  backgroundColor: reviewFilter === f.id ? 'var(--btn-sage)' : 'transparent',
                                  color: reviewFilter === f.id ? 'var(--btn-text)' : 'var(--secondary-heading)',
                                  boxShadow: reviewFilter === f.id ? 'var(--shadow-3d-btn)' : 'none',
                                  transition: 'all 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)'
                                }}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                        );
                      })()}
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

                        const leftBorderColor = isCorrect ? 'var(--btn-sage)' : isUnattempted ? 'var(--border-color)' : 'var(--accent-terracotta)';

                        return (
                          <div 
                            key={q.id} 
                            className="saas-card-spec" 
                            style={{ 
                              padding: '30px', 
                              borderLeft: `6px solid ${leftBorderColor}`
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                              <span className="pill-tag">
                                Question {idx + 1} &bull; Section: {q.section}
                              </span>
                              <span style={{
                                fontSize: '0.82rem',
                                fontWeight: 800,
                                padding: '4px 14px',
                                borderRadius: '10px',
                                backgroundColor: isCorrect ? '#EAECE8' : isUnattempted ? 'var(--bg-card-solid)' : '#F5EBE6',
                                color: isCorrect ? '#526257' : isUnattempted ? 'var(--text-muted)' : '#9A6854',
                                border: '1px solid var(--border-color)'
                              }}>
                                {isCorrect ? 'Correct (+1 Mark)' : isUnattempted ? 'Unattempted (0 Marks)' : 'Incorrect (0 Marks)'}
                              </span>
                            </div>

                            <h4 style={{ fontSize: '1.14rem', fontWeight: 600, color: 'var(--main-heading)', marginBottom: '22px', lineHeight: 1.65, whiteSpace: 'pre-line', fontFamily: 'var(--font-heading)' }}>
                              {q.question}
                            </h4>

                            {/* Options */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '22px' }}>
                              {q.options.map((opt, oIdx) => {
                                const isCorrectOption = oIdx === q.correctIndex;
                                const isUserOption = oIdx === userSel;

                                let border = 'var(--border-color)';
                                let bg = 'var(--bg-card-solid)';
                                let color = 'var(--body-text)';
                                let badgeText = null;
                                let badgeBg = '#EAECE8';
                                let badgeColor = '#526257';

                                if (isCorrectOption) {
                                  border = '2px solid var(--btn-sage)';
                                  bg = '#EAECE8';
                                  color = 'var(--main-heading)';
                                  if (isUserOption) {
                                    badgeText = 'Your Choice (Correct)';
                                    badgeBg = 'var(--btn-sage)';
                                    badgeColor = 'var(--btn-text)';
                                  } else {
                                    badgeText = 'Correct Answer';
                                    badgeBg = 'var(--btn-sage)';
                                    badgeColor = 'var(--btn-text)';
                                  }
                                } else if (isUserOption && !isCorrectOption) {
                                  border = '2px solid var(--accent-terracotta)';
                                  bg = '#F5EBE6';
                                  color = 'var(--main-heading)';
                                  badgeText = 'Your Choice (Incorrect)';
                                  badgeBg = 'var(--accent-terracotta)';
                                  badgeColor = '#FFFFFF';
                                }

                                return (
                                  <div
                                    key={oIdx}
                                    style={{
                                      padding: '14px 18px',
                                      borderRadius: '12px',
                                      border,
                                      backgroundColor: bg,
                                      color,
                                      fontSize: '0.92rem',
                                      fontWeight: (isCorrectOption || isUserOption) ? 700 : 500,
                                      lineHeight: 1.5,
                                      display: 'flex',
                                      justifyContent: 'space-between',
                                      alignItems: 'center',
                                      gap: '10px'
                                    }}
                                  >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                      <span style={{
                                        width: '28px',
                                        height: '28px',
                                        borderRadius: '50%',
                                        backgroundColor: isCorrectOption ? 'var(--btn-sage)' : (isUserOption ? 'var(--accent-terracotta)' : '#F5EBE6'),
                                        color: (isCorrectOption || isUserOption) ? 'var(--btn-text)' : 'var(--secondary-heading)',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.82rem',
                                        fontWeight: 800,
                                        flexShrink: 0
                                      }}>
                                        {String.fromCharCode(65 + oIdx)}
                                      </span>
                                      <span>{opt}</span>
                                    </div>

                                    {badgeText && (
                                      <span style={{
                                        fontSize: '0.74rem',
                                        fontWeight: 800,
                                        padding: '4px 10px',
                                        borderRadius: '8px',
                                        backgroundColor: badgeBg,
                                        color: badgeColor,
                                        flexShrink: 0,
                                        whiteSpace: 'nowrap'
                                      }}>
                                        {badgeText}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {/* Explanation */}
                            <div style={{ padding: '22px 24px', borderRadius: '12px', backgroundColor: 'var(--bg-card-solid)', border: '1.5px solid var(--border-color)', fontSize: '0.92rem', color: 'var(--body-text)', lineHeight: 1.65 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <strong style={{ color: 'var(--main-heading)', fontSize: '0.96rem', fontFamily: 'var(--font-heading)' }}>Step-by-Step Solution & Rationale:</strong>
                              </div>
                              <div style={{ whiteSpace: 'pre-line' }}>
                                {q.explanation}
                              </div>
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
          <div className="saas-card-spec" style={{ padding: '36px', marginBottom: '32px' }}>
            <span className="pill-tag" style={{ marginBottom: '10px' }}>Reference Handbook</span>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--main-heading)', margin: '4px 0 8px 0', letterSpacing: '-0.3px', fontFamily: 'var(--font-heading)' }}>
              Quantitative & Logical Formula Reference
            </h2>
            <p style={{ color: 'var(--body-text)', fontSize: '0.96rem', lineHeight: 1.65, maxWidth: '850px', margin: 0 }}>
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
              style={{ height: '52px', fontSize: '0.95rem' }}
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
                <div key={idx} className="saas-card-spec" style={{ padding: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
                    <h3 style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--main-heading)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                      {item.topic}
                    </h3>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span className="pill-tag" style={{ backgroundColor: '#EAECE8', color: '#526257' }}>
                        {item.importance}
                      </span>
                      <span className="pill-tag" style={{ backgroundColor: '#F5EBE6', color: '#9A6854' }}>
                        Time Target: {item.timeLimit}
                      </span>
                    </div>
                  </div>

                  {/* Formulas Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--main-heading)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Core Mathematical Identities & Rules
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {item.formulas.map((f, fIdx) => (
                        <div 
                          key={fIdx} 
                          style={{ 
                            padding: '14px 18px', 
                            backgroundColor: 'var(--bg-card-solid)', 
                            borderRadius: '12px', 
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            fontSize: '0.92rem', 
                            color: 'var(--body-text)', 
                            lineHeight: 1.6, 
                            fontWeight: 500,
                            boxShadow: '0 1px 3px rgba(52, 52, 58, 0.03)'
                          }}
                        >
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            backgroundColor: '#EAECE8',
                            color: '#526257',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            {fIdx + 1}
                          </span>
                          <div style={{ flex: 1 }}>
                            {f}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Speed Tricks Section */}
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--main-heading)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Calculation Shortcuts & Methodologies
                    </h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {item.speedTricks.map((st, stIdx) => (
                        <div 
                          key={stIdx} 
                          style={{ 
                            padding: '14px 18px', 
                            backgroundColor: 'var(--bg-card-solid)', 
                            borderRadius: '12px', 
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '12px',
                            fontSize: '0.92rem', 
                            color: 'var(--body-text)', 
                            lineHeight: 1.6, 
                            fontWeight: 500,
                            boxShadow: '0 1px 3px rgba(52, 52, 58, 0.03)'
                          }}
                        >
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minWidth: '26px',
                            height: '26px',
                            borderRadius: '6px',
                            backgroundColor: '#F5EBE6',
                            color: '#9A6854',
                            fontWeight: 800,
                            fontSize: '0.78rem',
                            flexShrink: 0,
                            marginTop: '2px'
                          }}>
                            {stIdx + 1}
                          </span>
                          <div style={{ flex: 1 }}>
                            {st}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Examination Guidance */}
                  <div style={{ padding: '16px 20px', backgroundColor: '#F5EBE6', borderRadius: '12px', border: '1px dashed #9A6854', fontSize: '0.9rem', color: 'var(--body-text)', lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--main-heading)' }}>Examination Note:</strong> {item.proTip}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

    </div>
  );
}

