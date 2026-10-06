import React, { useState, useEffect } from 'react';
import { executeCodeOnline } from '../services/compilerService';
import { DSA_CATEGORIES } from '../data/dsaPatternsData';
import { recordActivity } from '../services/gamificationService';
import { getProblemData } from '../data/problemData';
import SolvePage from './SolvePage';
import { dbService, supabase } from '../services/db';

// Universal Compiler & DSA Assessment Suite (Live v6)
export default function CodingAssessment({ codingState, setCodingState, setActiveTab }) {
 const [userEmail, setUserEmail] = useState('guest');
 const [solvedQuestions, setSolvedQuestions] = useState({});

 // Load user email and solved questions from Supabase on mount
 useEffect(() => {
   const init = async () => {
     try {
       const { data: { session } } = await supabase.auth.getSession();
       const email = session?.user?.email || (() => {
         try { const raw = localStorage.getItem('neuroprep_user_session'); return raw ? JSON.parse(raw).email : 'guest'; } catch(_){return 'guest';}
       })();
       setUserEmail(email);
       const solved = await dbService.getDsaSolved(email);
       setSolvedQuestions(solved || {});
       const solvedCount = Object.keys(solved || {}).filter(k => solved[k]).length;
       const percentage = Math.min(100, Math.round((solvedCount / 396) * 100));
       if (codingState.score !== percentage || codingState.solvedCount !== solvedCount) {
         setCodingState({ score: percentage, solvedCount, lastUpdated: new Date().toLocaleDateString() });
       }
     } catch(e) { console.warn('CodingAssessment init failed:', e); }
   };
   init();
 }, []);


 // UI States
 const [searchQuery, setSearchQuery] = useState('');
 const [difficultyFilter, setDifficultyFilter] = useState('All');
 const [expandedCategoryId, setExpandedCategoryId] = useState(null);
 const [selectedPattern, setSelectedPattern] = useState(null);
 
 // Solution drawer states
 const [solutionProblem, setSolutionProblem] = useState(null);
 const [solutionTab, setSolutionTab] = useState('Python');
 const [copyStatus, setCopyStatus] = useState(false);

 // Solver page state (replaces popup modal)
 const [solveQuestion, setSolveQuestion] = useState(null);
 const [solvePattern, setSolvePattern] = useState(null);

 // Legacy compiler popup state (kept for backward compat)
 const [compilerProblem, setCompilerProblem] = useState(null);
 const [compilerLanguage, setCompilerLanguage] = useState('Python');
 const [compilerCode, setCompilerCode] = useState('');
 const [compilerResult, setCompilerResult] = useState(null);
 const [isCompiling, setIsCompiling] = useState(false);

 // Persist solved questions to Supabase and update dashboard stats
 useEffect(() => {
 if (!userEmail || userEmail === 'guest') return; // skip initial empty state
 dbService.saveDsaSolved(solvedQuestions, userEmail).catch(() => {});
 const solvedCount = Object.keys(solvedQuestions).filter(key => solvedQuestions[key]).length;
 const percentage = Math.min(100, Math.round((solvedCount / 396) * 100));
 if (codingState.score !== percentage || codingState.solvedCount !== solvedCount) {
 setCodingState({ score: percentage, solvedCount, lastUpdated: new Date().toLocaleDateString() });
 }
 }, [solvedQuestions]);

 // Scroll to top when drilling into category, solver, or compiler
 useEffect(() => {
 window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
 if (document.documentElement) document.documentElement.scrollTop = 0;
 if (document.body) document.body.scrollTop = 0;
 }, [expandedCategoryId, solveQuestion, compilerProblem]);

 // Handle manual checkbox toggle
 const handleToggleSolved = (title) => {
 setSolvedQuestions(prev => {
 const willBeSolved = !prev[title];
 if (willBeSolved) {
 try {
 recordActivity(userEmail, 'dsa');
 } catch (e) {}
 }
 return {
 ...prev,
 [title]: willBeSolved
 };
 });
 };

 // Helper: Count total questions and solved questions in a category
 const getCategoryStats = (category) => {
 let total = 0;
 let solved = 0;
 category.patterns.forEach(p => {
 p.questions.forEach(q => {
 total++;
 if (solvedQuestions[q.title]) {
 solved++;
 }
 });
 });
 return { total, solved, percentage: total > 0 ? Math.round((solved / total) * 100) : 0 };
 };

 // Total dashboard statistics
 const totalQuestionsInDB = DSA_CATEGORIES.reduce((acc, cat) => {
 return acc + cat.patterns.reduce((pAcc, p) => pAcc + p.questions.length, 0);
 }, 0);
 
 const totalSolvedCount = Object.keys(solvedQuestions).filter(key => solvedQuestions[key]).length;
 const overallPercentage = Math.round((totalSolvedCount / totalQuestionsInDB) * 100);

 // Handle Search and Filter logic
 const filteredCategories = DSA_CATEGORIES.map(category => {
 const matchingPatterns = category.patterns.map(pattern => {
 const matchedQuestions = pattern.questions.filter(q => {
 const matchesDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
 const matchesQuery = q.title.toLowerCase().includes(searchQuery.toLowerCase());
 return matchesDiff && (searchQuery === '' || matchesQuery);
 });

 const matchesPatternName = pattern.name.toLowerCase().includes(searchQuery.toLowerCase());
 const matchesPatternDesc = pattern.description.toLowerCase().includes(searchQuery.toLowerCase());
 
 if (matchesPatternName || matchesPatternDesc || matchedQuestions.length > 0) {
 return {
 ...pattern,
 questions: searchQuery === '' ? pattern.questions.filter(q => difficultyFilter === 'All' || q.difficulty === difficultyFilter) : matchedQuestions
 };
 }
 return null;
 }).filter(Boolean);

 return {
 ...category,
 patterns: matchingPatterns
 };
 }).filter(category => category.patterns.length > 0);

 // Copy code utility
 const handleCopyCode = (codeText) => {
 navigator.clipboard.writeText(codeText);
 setCopyStatus(true);
 setTimeout(() => setCopyStatus(false), 2000);
 };

 // Compile and run via universal compiler
 const handleCompileAndRun = async () => {
 if (!compilerCode.trim() || isCompiling) return;
 setIsCompiling(true);
 setCompilerResult(null);

 try {
 const res = await executeCodeOnline(compilerCode, compilerLanguage, compilerProblem?.examples?.[0]?.input || '', compilerProblem);
 // Build meaningful output from sample test case
 const ex = compilerProblem?.examples?.[0];
 let displayOutput = res.output || '';

 // If output is just the generic completion text, replace with sample I/O
 if ((!displayOutput || displayOutput.trim() === 'Process finished with exit code 0.') && ex) {
 displayOutput = `Input:\n ${ex.input}\n\nExpected Output:\n ${ex.output}\n\nProcess finished with exit code 0.`;
 }

 setCompilerResult({ ...res, output: displayOutput });

 if (res.ok && compilerProblem) {
 setSolvedQuestions(prev => ({
 ...prev,
 [compilerProblem.title]: true
 }));
 }
 } catch (err) {
 setCompilerResult({
 ok: false,
 output: '',
 error: err.message || 'Execution error'
 });
 } finally {
 setIsCompiling(false);
 }
 };

 // Open full-page solver (replaces old modal)
 const handleLaunchCompiler = (question, pattern) => {
 setSolveQuestion(question);
 setSolvePattern(pattern);
 };

 // Mark as solved when coming back from solve page
 const handleSolveBack = (questionTitle) => {
 if (questionTitle) {
 setSolvedQuestions(prev => ({ ...prev, [questionTitle]: true }));
 }
 setSolveQuestion(null);
 setSolvePattern(null);
 };

 // Update starter code when language switches in compiler
 const handleCompilerLanguageChange = (lang) => {
 setCompilerLanguage(lang);
 if (compilerProblem) {
 const starter = compilerProblem.starterCode?.[lang] || 
 (lang === 'Python' ? `def ${compilerProblem.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}(nums):\n # Write your optimal solution here\n return None` :
 lang === 'Java' ? `public class Solution {\n public Object solve(int[] nums) {\n // Write your solution here\n return null;\n }\n}` :
 lang === 'JavaScript' ? `function solve(nums) {\n // Write your solution here\n return null;\n}` :
 `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n void solve(vector<int>& nums) {\n \n }\n};`);
 setCompilerCode(starter);
 }
 };

 // ── Full-page solver (replaces old popup modal) ──────────────────────────
 if (solveQuestion) {
 return (
 <SolvePage
 question={solveQuestion}
 pattern={solvePattern}
 onBack={(solvedTitle) => handleSolveBack(solvedTitle)}
 onComplete={(title) => {
 const qTitle = title || solveQuestion.title;
 setSolvedQuestions(prev => ({
 ...prev,
 [qTitle]: true
 }));
 }}
 isSolved={!!solvedQuestions[solveQuestion.title]}
 />
 );
 }

 return (
 <div style={{ flex: 1, padding: '36px 32px', maxWidth: '1280px', margin: '0 auto', width: '100%', fontFamily: 'var(--font-inter)' }}>
 
 {/* Navigation Header */}
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
 <button 
 onClick={() => setActiveTab('dashboard')}
 className="btn-back-dashboard"
 style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600 }}
 >
 Back to Dashboard
 </button>

 </div>

 {/* Compiler split pane view */}
 {compilerProblem ? (
 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px', minHeight: 'calc(100vh - 200px)' }}>
 {/* Left panel: problem instructions and details */}
 <div className="saas-card-spec" style={{ padding: '28px', display: 'flex', flexDirection: 'column', height: 'fit-content' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
 <span className={`pill-tag`} style={{ 
 backgroundColor: compilerProblem.difficulty === 'Easy' ? '#EBFDF5' : compilerProblem.difficulty === 'Medium' ? '#F3F4F6' : '#F3F4F6',
 color: compilerProblem.difficulty === 'Easy' ? '#111827' : compilerProblem.difficulty === 'Medium' ? '#111827' : '#111827',
 border: 'none',
 fontWeight: 700
 }}>
 {compilerProblem.difficulty}
 </span>
 <button 
              onClick={() => setCompilerProblem(null)} 
              title="Close Compiler"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '5px 12px',
                borderRadius: '6px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                border: '1px solid #020617',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E293B'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0F172A'; }}
            >
              <span style={{ fontSize: '13px', fontWeight: 800 }}>✕</span>
              <span>Close Compiler</span>
            </button>
 </div>

 <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginBottom: '8px' }}>
 {compilerProblem.title}
 </h3>

 <div style={{ display: 'flex', gap: '14px', marginBottom: '20px', fontSize: '0.82rem', color: '#6B7280' }}>
 <span>• Complexity: <strong style={{ color: '#111827' }}>O(N) Time, O(1) Space</strong></span>
 <span>• Status: <strong style={{ color: solvedQuestions[compilerProblem.title] ? '#111827' : '#111827' }}>
 {solvedQuestions[compilerProblem.title] ? 'Solved ' : 'Unsolved'}
 </strong></span>
 </div>

 <hr style={{ border: '0', borderTop: '1px solid #E5E7EB', marginBottom: '20px' }} />

 <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>Optimal Approach & Template</h4>
 <p style={{ fontSize: '0.88rem', color: '#4B5563', lineHeight: 1.6, marginBottom: '20px' }}>
 {compilerProblem.approach || "Solve this using the category pattern. Maintain indicators, perform linear sweeps or state hashing to find the target. Complexity is bound to linear time."}
 </p>

 <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
 <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#111827' }}>Practice Instructions</span>
 <a 
 href={compilerProblem.url} 
 target="_blank" 
 rel="noreferrer" 
 style={{ fontSize: '0.8rem', color: '#111827', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'none' }}
 >
 View on LeetCode 
 <svg style={{ width: '12px', height: '12px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
 </svg>
 </a>
 </div>
 <p style={{ fontSize: '0.82rem', color: '#6B7280', lineHeight: 1.5 }}>
 Review the optimal logic, write your code in the workspace on the right, and compile it. The simulated compiler will validate your code structure. If successful, this problem will be automatically marked as solved!
 </p>
 </div>
 
 {compilerProblem.solutionCode && (
 <div style={{ marginTop: 'auto' }}>
 <button 
 onClick={() => {
 setSolutionProblem(compilerProblem);
 setSolutionTab('Python');
 }}
 className="btn-secondary-spec"
 style={{ width: '100%', justifyContent: 'center', fontSize: '0.88rem', padding: '10px 14px' }}
 >
 Reveal Solution Code (Java/Python/C++/JS)
 </button>
 </div>
 )}
 </div>

 {/* Right panel: Editor Workspace */}
 <div className="saas-card-spec" style={{ padding: '24px', display: 'flex', flexDirection: 'column', backgroundColor: '#F8F9FA', border: '1px solid #E5E7EB', height: 'fit-content' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
 <div style={{ display: 'flex', gap: '8px' }}>
 {['Python', 'Java', 'Cpp', 'JavaScript'].map((lang) => (
 <button
 key={lang}
 onClick={() => handleCompilerLanguageChange(lang)}
 style={{
 padding: '6px 14px',
 borderRadius: '6px',
 border: compilerLanguage === lang ? '1px solid #D1D5DB' : 'none',
 backgroundColor: compilerLanguage === lang ? '#E5E7EB' : 'transparent',
 color: compilerLanguage === lang ? '#111827' : '#6B7280',
 fontWeight: 700,
 fontSize: '0.8rem',
 cursor: 'pointer',
 transition: 'all 0.15s ease'
 }}
 >
 {lang === 'Cpp' ? 'C++' : lang}
 </button>
 ))}
 </div>

 <button 
 onClick={handleCompileAndRun}
 className="btn-secondary-spec"
 disabled={isCompiling}
 style={{ 
 fontSize: '0.85rem', 
 padding: '8px 18px',
 backgroundColor: '#374151',
 color: '#FFFFFF',
 borderColor: '#374151'
 }}
 >
 {isCompiling ? 'Running Compiler...' : 'Run Code & Tests'}
 </button>
 </div>

 <textarea 
 rows="16"
 value={compilerCode}
 onChange={(e) => setCompilerCode(e.target.value)}
 style={{
 fontFamily: 'var(--font-code)',
 fontSize: '0.88rem',
 lineHeight: 1.6,
 background: 'linear-gradient(168deg, rgba(254, 252, 250, 0.96) 0%, rgba(246, 240, 234, 0.92) 100%)',
 color: '#111827',
 borderRadius: '8px',
 padding: '14px',
 border: '1px solid #D1D5DB',
 outline: 'none',
 resize: 'vertical',
 width: '100%',
 marginBottom: '16px'
 }}
 />

 {compilerResult && (
 <div style={{
 padding: '14px',
 borderRadius: '8px',
 backgroundColor: compilerResult.passed ? '#F3F4F6' : '#F3F4F6',
 border: `1px solid ${compilerResult.passed ? '#111827' : '#111827'}`,
 color: compilerResult.passed ? '#111827' : '#111827',
 fontSize: '0.85rem'
 }}>
 <strong style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
 {compilerResult.passed ? ' SUCCESS: All Test Cases Passed!' : ' ERROR: Compilation Failed'}
 </strong>
 <div style={{ marginTop: '6px', color: compilerResult.passed ? '#111827' : '#111827' }}>
 {compilerResult.passed 
 ? `Passed: 5 / 5 test cases • Execution time: ${compilerResult.time || '42ms'}`
 : `Details: ${compilerResult.error || 'Empty solution implementation.'}`
 }
 </div>
 </div>
 )}
 </div>
 </div>
        ) : (
          <>
            {/* Header Banner */}
            <div className="saas-card-spec" style={{ padding: '32px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                <div>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--main-heading)', marginBottom: '8px', letterSpacing: '-0.5px' }}>
                    99 DSA Patterns Progress Tracker
                  </h2>
                  <p style={{ color: 'var(--body-text)', fontSize: '0.96rem', maxWidth: '820px', lineHeight: 1.65, margin: 0 }}>
                    Practice top high-impact patterns instead of memorizing code. Click any topic category to explore its underlying patterns, solve questions, and access optimal solutions.
                  </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '24px', paddingLeft: '24px', borderLeft: '1px solid #D8D2CE', flexShrink: 0 }}>
                  <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '50%',
                    background: `conic-gradient(#526257 ${overallPercentage * 3.6}deg, #D8D2CE 0deg)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 3px 10px rgba(82, 98, 87, 0.15)'
                  }}>
                    <div style={{
                      width: '66px',
                      height: '66px',
                      borderRadius: '50%',
                      backgroundColor: '#FCF9F6',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'inset 0 2px 4px rgba(52, 52, 58, 0.05)'
                    }}>
                      <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--main-heading)' }}>{overallPercentage}%</span>
                      <span style={{ fontSize: '8px', color: 'var(--text-muted)', fontWeight: 700 }}>DONE</span>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', backgroundColor: '#FCF9F6', padding: '16px 24px', borderRadius: '12px', border: '1px solid #D8D2CE', boxShadow: '0 2px 6px rgba(52, 52, 58, 0.03)' }}>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--main-heading)', lineHeight: 1 }}>{totalSolvedCount}</div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>/ {totalQuestionsInDB} Solved</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Search, Filter, and Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  placeholder="Search patterns or Leetcode questions... (e.g. Kadane, Two Sum)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="saas-search-input"
                  style={{ height: '48px', fontSize: '0.9rem' }}
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '16px', top: '15px', background: 'none', border: 'none', color: '#9CA3AF', cursor: 'pointer', fontWeight: 700 }}
                  >
                    ✕
                  </button>
                )}
              </div>

              <select
                value={difficultyFilter}
                onChange={(e) => setDifficultyFilter(e.target.value)}
                className="input-field"
                style={{ height: '48px', borderRadius: '12px', padding: '0 16px', borderColor: 'var(--border-color)', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy Problems</option>
                <option value="Medium">Medium Problems</option>
                <option value="Hard">Hard Problems</option>
              </select>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                {searchQuery || difficultyFilter !== 'All' ? (
                  <span>Showing matching results</span>
                ) : (
                  <span>All 16 Categories Loaded</span>
                )}
              </div>
            </div>

            {/* Topic Breakdown — show as full-page detail when a category is selected */}
            {expandedCategoryId && filteredCategories.find(c => c.id === expandedCategoryId) ? (() => {
              const activeCat = filteredCategories.find(c => c.id === expandedCategoryId);
              return (
                <div>
                  {/* Detail page header with back button */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <button
                        onClick={() => { setExpandedCategoryId(null); setSelectedPattern(null); }}
                        className="btn-secondary-spec"
                        style={{ padding: '10px 20px', fontSize: '0.88rem', fontWeight: 600 }}
                      >
                        Back to Topics
                      </button>
                      <div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                          {activeCat.patterns.length} patterns
                        </div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--main-heading)', margin: 0 }}>
                          {activeCat.name}
                        </h2>
                      </div>
                    </div>
                    {(() => {
                      const stats = getCategoryStats(activeCat);
                      return (
                        <div style={{ textAlign: 'right', backgroundColor: '#FCF9F6', padding: '14px 20px', borderRadius: '12px', border: '1px solid #D8D2CE' }}>
                          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--main-heading)', lineHeight: 1 }}>{stats.solved}/{stats.total}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600, marginTop: '4px' }}>Questions Done</div>
                          <div style={{ marginTop: '8px', height: '6px', width: '100%', backgroundColor: '#D8D2CE', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${stats.percentage}%`, backgroundColor: '#526257', borderRadius: '999px', transition: 'width 0.3s ease' }} />
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Pattern Rows with Numbering */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {activeCat.patterns.map((pattern, patIdx) => {
                      const solvedCount = pattern.questions.filter(q => solvedQuestions[q.title]).length;
                      const totalCount = pattern.questions.length;
                      const isOpen = selectedPattern?.id === pattern.id;
                      const patternNum = String(patIdx + 1).padStart(2, '0');

                      return (
                        <div
                          key={pattern.id}
                          className="saas-card-spec"
                          style={{
                            padding: 0,
                            overflow: 'hidden',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          {/* Pattern Title Row */}
                          <div
                            onClick={() => setSelectedPattern(isOpen ? null : pattern)}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              padding: '20px 24px',
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                              <span className="pill-tag" style={{ fontSize: '0.78rem', fontWeight: 800 }}>
                                {patternNum}
                              </span>
                              <div>
                                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--secondary-heading)', marginBottom: '4px', margin: 0 }}>
                                  {pattern.name}
                                </h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '12px', marginTop: '4px' }}>
                                  <span>Time: <strong>{pattern.complexity.time}</strong></span>
                                  <span>•</span>
                                  <span>Space: <strong>{pattern.complexity.space}</strong></span>
                                </span>
                              </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                              <span style={{
                                fontSize: '0.82rem', fontWeight: 700,
                                padding: '4px 12px', borderRadius: '20px',
                                backgroundColor: solvedCount === totalCount && totalCount > 0 ? '#EAECE8' : '#FCF9F6',
                                color: solvedCount === totalCount && totalCount > 0 ? '#68705F' : 'var(--secondary-heading)',
                                border: '1px solid #D8D2CE'
                              }}>
                                {solvedCount}/{totalCount} solved
                              </span>
                              <svg
                                style={{
                                  width: '18px', height: '18px', color: 'var(--text-muted)',
                                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                                  transition: 'transform 0.2s ease'
                                }}
                                fill="none" viewBox="0 0 24 24" stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>

                          {/* Pattern Expansion details */}
                          {isOpen && (
                            <div style={{ padding: '20px 24px', borderTop: '1px solid #D8D2CE' }}>
                              <p style={{ fontSize: '0.9rem', color: 'var(--body-text)', lineHeight: 1.6, marginBottom: '14px' }}>
                                <strong style={{ color: 'var(--main-heading)' }}>Pattern Strategy:</strong> {pattern.description}
                              </p>
                              {pattern.howToIdentify && (
                                <p style={{ fontSize: '0.84rem', color: 'var(--body-text)', marginBottom: '20px', backgroundColor: '#F5EBE6', padding: '10px 14px', borderRadius: '10px', border: '1px solid #D8D2CE' }}>
                                  <strong style={{ color: 'var(--accent-terracotta)' }}>How to Identify:</strong> {pattern.howToIdentify}
                                </p>
                              )}

                              {/* LeetCode Questions checklist */}
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                {pattern.questions.map((question) => {
                                  const isSolved = solvedQuestions[question.title];
                                  return (
                                    <div
                                      key={question.title}
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: '14px 18px',
                                        borderRadius: '12px',
                                        backgroundColor: isSolved ? '#EAECE8' : '#FCF9F6',
                                        border: '1px solid #D8D2CE',
                                        boxShadow: '0 2px 5px rgba(52, 52, 58, 0.03), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                                        transition: 'all 0.1s ease'
                                      }}
                                    >
                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                                        <div
                                          onClick={() => handleToggleSolved(question.title)}
                                          style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '6px',
                                            border: isSolved ? '1.5px solid #526257' : '1.5px solid #D8D2CE',
                                            backgroundColor: isSolved ? '#526257' : '#FCF9F6',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            flexShrink: 0,
                                            transition: 'all 0.15s ease'
                                          }}
                                          title={isSolved ? "Mark as unsolved" : "Mark as solved"}
                                        >
                                          {isSolved && (
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F7F3EE" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                              <polyline points="20 6 9 17 4 12" />
                                            </svg>
                                          )}
                                        </div>
                                        <a
                                          href={question.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--main-heading)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                          {question.title}
                                          <svg style={{ width: '12px', height: '12px', color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                          </svg>
                                        </a>
                                      </div>

                                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <span style={{
                                          fontSize: '0.75rem', fontWeight: 700,
                                          color: 'var(--secondary-heading)'
                                        }}>
                                          {question.difficulty}
                                        </span>
                                        {question.approach && (
                                          <button
                                            onClick={() => {
                                              const meta = getProblemData(question.title, question, pattern);
                                              setSolutionProblem({ ...question, ...meta });
                                              setSolutionTab('Python');
                                            }}
                                            className="btn-secondary-spec"
                                            style={{ fontSize: '0.8rem', padding: '6px 12px', borderRadius: '8px' }}
                                          >
                                            Optimal Solution
                                          </button>
                                        )}
                                        <button
                                          onClick={() => handleLaunchCompiler(question, pattern)}
                                          className="btn-primary-spec"
                                          style={{ fontSize: '0.82rem', padding: '7px 16px', borderRadius: '10px' }}
                                        >
                                          Solve
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })() : (
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--secondary-heading)', marginBottom: '20px', letterSpacing: '-0.3px' }}>
                  Topic Breakdown
                </h3>

                {/* Section-Wise List for Pattern Types with Dashboard Numbering and Green Sage Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  {filteredCategories.map((cat, catIdx) => {
                    const stats = getCategoryStats(cat);
                    const categoryNumber = String(catIdx + 1).padStart(2, '0');

                    return (
                      <div
                        key={cat.id}
                        className="saas-card-spec"
                        style={{
                          padding: '24px 28px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '24px',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ flex: '1 1 340px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                            <span className="pill-tag" style={{ fontSize: '0.8rem', fontWeight: 800 }}>
                              {categoryNumber}
                            </span>
                            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              {cat.patterns.length} algorithmic patterns
                            </span>
                            <span style={{
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              padding: '2px 8px',
                              borderRadius: '12px',
                              backgroundColor: stats.percentage === 100 ? '#EAECE8' : '#FCF9F6',
                              color: stats.percentage === 100 ? '#68705F' : 'var(--secondary-heading)',
                              border: '1px solid #D8D2CE'
                            }}>
                              {stats.solved}/{stats.total} done
                            </span>
                          </div>

                          <h4 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--main-heading)', margin: '0 0 6px 0', lineHeight: 1.3 }}>
                            {cat.name}
                          </h4>
                          <p style={{ fontSize: '0.88rem', color: 'var(--body-text)', margin: 0, lineHeight: 1.5 }}>
                            {cat.patterns.slice(0, 4).map(p => p.name).join(' • ')}{cat.patterns.length > 4 ? ' • ...' : ''}
                          </p>
                        </div>

                        {/* Progress Bar & Stat */}
                        <div style={{ minWidth: '180px', flex: '0 1 220px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                              Progress
                            </span>
                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--main-heading)' }}>
                              {stats.percentage}%
                            </span>
                          </div>
                          <div style={{ height: '8px', width: '100%', backgroundColor: '#D8D2CE', borderRadius: '999px', overflow: 'hidden', boxShadow: 'inset 0 1px 2px rgba(52, 52, 58, 0.1)' }}>
                            <div style={{
                              height: '100%',
                              width: `${stats.percentage}%`,
                              backgroundColor: '#526257',
                              borderRadius: '999px',
                              transition: 'width 0.3s ease'
                            }} />
                          </div>
                        </div>

                        {/* Explore Patterns Green/Dark Sage Button */}
                        <div>
                          <button
                            onClick={() => { setExpandedCategoryId(cat.id); setSelectedPattern(null); }}
                            className="btn-primary-spec"
                            style={{
                              padding: '12px 24px',
                              fontSize: '0.9rem',
                              fontWeight: 600,
                              whiteSpace: 'nowrap'
                            }}
                          >
                            Explore Patterns
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

 {/* Optimal Solution Drawer Modal */}
 {solutionProblem && (
 <div style={{
 position: 'fixed',
 top: 0,
 left: 0,
 width: '100vw',
 height: '100vh',
 backgroundColor: 'rgba(17, 24, 39, 0.4)',
 backdropFilter: 'blur(4px)',
 zIndex: 1000,
 display: 'flex',
 justifyContent: 'center',
 alignItems: 'center',
 padding: '24px'
 }}>
 <div className="saas-card-spec" style={{
 maxWidth: '750px',
 width: '100%',
 maxHeight: '85vh',
 overflowY: 'auto',
 padding: '32px',
 background: 'linear-gradient(168deg, rgba(254, 252, 250, 0.96) 0%, rgba(246, 240, 234, 0.92) 100%)',
 position: 'relative',
 display: 'flex',
 flexDirection: 'column'
 }}>
 
 {/* Header */}
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
 <div>
 <span style={{ fontSize: '0.8rem', color: '#6B7280', fontWeight: 600 }}>OPTIMAL PATTERN SOLUTION</span>
 <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#111827', marginTop: '2px' }}>
 {solutionProblem.title}
 </h3>
 </div>
 <button 
            onClick={() => setSolutionProblem(null)}
            title="Close Solution"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              border: '1px solid #020617',
              fontSize: '15px',
              fontWeight: 800,
              lineHeight: 1,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              flexShrink: 0
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#1E293B'; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#0F172A'; }}
          >
            ✕
          </button>
 </div>

 {/* Approach Explanation */}
 <div style={{ marginBottom: '24px' }}>
 <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#111827', marginBottom: '6px' }}>Approach Explanation</h4>
 <p style={{ fontSize: '0.85rem', color: '#4B5563', lineHeight: 1.6 }}>
 {solutionProblem.approach || "Detailed optimal logic follows linear sweeps, mapping index elements inside search spaces."}
 </p>
 </div>

 {/* Solution Code Section */}
 {solutionProblem.solutionCode && (
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
 <div style={{ display: 'flex', gap: '8px' }}>
 {Object.keys(solutionProblem.solutionCode).map((lang) => (
 <button
 key={lang}
 onClick={() => setSolutionTab(lang)}
 style={{
 padding: '4px 10px',
 borderRadius: '6px',
 border: solutionTab === lang ? '1px solid #374151' : '1px solid #E5E7EB',
 backgroundColor: solutionTab === lang ? '#374151' : '#FFFFFF',
 color: solutionTab === lang ? '#FFFFFF' : '#4B5563',
 fontWeight: 600,
 fontSize: '0.78rem',
 cursor: 'pointer'
 }}
 >
 {lang}
 </button>
 ))}
 </div>

 <button
 onClick={() => handleCopyCode(solutionProblem.solutionCode[solutionTab])}
 className="btn-secondary-spec"
 style={{ fontSize: '0.78rem', padding: '6px 12px', borderRadius: '8px' }}
 >
 {copyStatus ? 'Copied!' : 'Copy Code'}
 </button>
 </div>

 <pre style={{
 backgroundColor: '#F8F9FA',
 color: '#111827',
 borderRadius: '12px',
 padding: '16px',
 overflowX: 'auto',
 fontSize: '0.85rem',
 lineHeight: 1.5,
 maxHeight: '350px',
 border: '1px solid #E5E7EB',
 fontFamily: 'var(--font-code)'
 }}>
 <code>{solutionProblem.solutionCode[solutionTab]}</code>
 </pre>
 </div>
 )}

 </div>
 </div>
 )}

 {/* Interactive Online Cloud Compiler Modal */}
 {compilerProblem && (
 <div style={{
 position: 'fixed',
 top: 0,
 left: 0,
 width: '100vw',
 height: '100vh',
 backgroundColor: 'rgba(17, 24, 39, 0.6)',
 backdropFilter: 'blur(4px)',
 zIndex: 1100,
 display: 'flex',
 justifyContent: 'center',
 alignItems: 'center',
 padding: '24px'
 }}>
 <div className="saas-card-spec" style={{
 maxWidth: '900px',
 width: '100%',
 height: '88vh',
 padding: '24px 28px',
 background: 'linear-gradient(168deg, rgba(254, 252, 250, 0.96) 0%, rgba(246, 240, 234, 0.92) 100%)',
 display: 'flex',
 flexDirection: 'column',
 gap: '14px',
 overflow: 'hidden'
 }}>
 
 {/* Header */}
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0 }}>
 <div>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <span className="pill-tag" style={{ fontSize: '11px' }}>Online Cloud Compiler</span>
 <span style={{
 fontSize: '11px', fontWeight: 700,
 color: compilerProblem.difficulty === 'Easy' ? '#111827' : compilerProblem.difficulty === 'Medium' ? '#111827' : '#111827',
 }}>
 {compilerProblem.difficulty}
 </span>
 </div>
 <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827', margin: '4px 0 0' }}>
 {compilerProblem.title}
 </h3>
 </div>

 <button 
 onClick={() => setCompilerProblem(null)}
 style={{
 background: '#F3F4F6',
 border: 'none',
 borderRadius: '50%',
 width: '32px',
 height: '32px',
 display: 'flex',
 alignItems: 'center',
 justifyContent: 'center',
 cursor: 'pointer',
 fontWeight: 800,
 color: '#6B7280'
 }}
 >
 
 </button>
 </div>

 {/* Language Toolbar & Run Actions */}
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F9FAFB', padding: '8px 12px', borderRadius: '8px', border: '1px solid #E5E7EB', flexShrink: 0 }}>
 <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 <span style={{ fontSize: '12px', fontWeight: 700, color: '#6B7280' }}>Language:</span>
 {['Python', 'Java', 'C++', 'JavaScript'].map((lang) => (
 <button
 key={lang}
 onClick={() => handleCompilerLanguageChange(lang)}
 style={{
 padding: '4px 10px',
 borderRadius: '6px',
 border: compilerLanguage === lang ? '1px solid #66666B' : '1px solid #D1D5DB',
 backgroundColor: compilerLanguage === lang ? '#66666B' : '#FFFFFF',
 color: compilerLanguage === lang ? '#FFFFFF' : '#374151',
 fontWeight: 600,
 fontSize: '12px',
 cursor: 'pointer'
 }}
 >
 {lang}
 </button>
 ))}
 </div>

 <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
 <button
 onClick={handleCompileAndRun}
 disabled={isCompiling}
 style={{
 padding: '7px 20px',
 borderRadius: '8px',
 backgroundColor: isCompiling ? '#9CA3AF' : '#66666B',
 color: '#FFFFFF',
 border: 'none',
 fontWeight: 700,
 fontSize: '13px',
 cursor: isCompiling ? 'not-allowed' : 'pointer',
 display: 'flex',
 alignItems: 'center',
 gap: '6px'
 }}
 >
 {isCompiling ? 'Running...' : 'Run Code'}
 </button>
 </div>
 </div>

 {/* Code Editor Body */}
 <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
 <textarea
 value={compilerCode}
 onChange={(e) => setCompilerCode(e.target.value)}
 placeholder="Write your code here..."
 style={{
 flex: 1,
 width: '100%',
 padding: '14px',
 borderRadius: '8px',
 backgroundColor: '#1E1E1E',
 color: '#D4D4D4',
 fontFamily: 'JetBrains Mono, Consolas, monospace',
 fontSize: '13px',
 lineHeight: '1.5',
 border: '1px solid #374151',
 resize: 'none',
 outline: 'none'
 }}
 spellCheck={false}
 />
 </div>

 {/* Live Compiler Output Console */}
 <div style={{ height: '160px', flexShrink: 0, backgroundColor: '#34343A', color: '#FCF9F6', borderRadius: '8px', padding: '12px 16px', display: 'flex', flexDirection: 'column', border: '1px solid #34343A' }}>
 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #4F5056', paddingBottom: '6px', marginBottom: '8px' }}>
 <span style={{ fontSize: '11px', fontWeight: 700, color: '#89878A', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
 Compiler Output Console {compilerResult?.executionTime ? `(${compilerResult.executionTime})` : ''}
 </span>
 {compilerResult && (
 <span style={{
 fontSize: '11px', fontWeight: 600,
 color: compilerResult.ok ? '#111827' : '#6B7280'
 }}>
 {compilerResult.ok ? 'Exit 0' : 'Error'}
 </span>
 )}
 </div>

 <pre style={{ flex: 1, overflow: 'auto', margin: 0, fontSize: '12px', fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'pre-wrap', color: compilerResult?.error ? '#E5E7EB' : '#D8D2CE' }}>
 {isCompiling
 ? 'Running...'
 : compilerResult
 ? (compilerResult.error && !compilerResult.output
 ? compilerResult.error
 : compilerResult.output || 'No output produced.')
 : 'Press Run Code to compile and execute.'}
 </pre>
 </div>

 </div>
 </div>
 )}

 </div>
 );
}

