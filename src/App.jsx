import React, { useState, useEffect } from 'react';
import LandingPage from './components/LandingPage';
import AuthModal from './components/AuthModal';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import AptitudePractice from './components/AptitudePractice';
import CodingAssessment from './components/CodingAssessment';
import CompanyPrep from './components/CompanyPrep';
import UserProfile from './components/UserProfile';
import MoodAssessment from './components/MoodAssessment';
import ThoughtJournal from './components/ThoughtJournal';
import CognitiveReappraisal from './components/CognitiveReappraisal';
import StressRecovery from './components/StressRecovery';
import NeroprepEngine from './components/neroprep/NeroprepEngine';
import Gamification from './components/Gamification';
import DailyChallengeArena from './components/DailyChallengeArena';
import Reports from './components/Reports';
import PlacementRoadmap from './components/PlacementRoadmap';
import PuzzlesAndSheets from './components/PuzzlesAndSheets';
import { DISTORTIONS } from './services/aiEngine';
import { dbService } from './services/db';
import { recordActivity } from './services/gamificationService';

const SESSION_STORAGE_KEY = 'neuroprep_user_session';

export default function App() {
  // Load saved session on initial render so refresh keeps user logged in
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });

  const TAB_STORAGE_KEY = 'neuroprep_active_tab';

  const [isLanding, setIsLanding] = useState(() => {
    if (session) return false;
    try {
      const guestMode = localStorage.getItem('neuroprep_explore_mode');
      if (guestMode === 'true') return false;
    } catch (e) {}
    return true;
  });

  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(session));
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const [activeTab, setActiveTab] = useState(() => {
    try {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash) return hash;
      const savedTab = localStorage.getItem(TAB_STORAGE_KEY);
      if (savedTab) return savedTab;
    } catch (e) {}
    return 'dashboard';
  });

  const resetScrollToTop = () => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
    const root = document.getElementById('root');
    if (root) root.scrollTop = 0;
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
  };

  // Sync activeTab with localStorage, URL hash, and enforce top scroll on tab change
  useEffect(() => {
    try {
      localStorage.setItem(TAB_STORAGE_KEY, activeTab);
      if (window.location.hash !== `#${activeTab}`) {
        window.history.replaceState(null, '', `#${activeTab}`);
      }
    } catch (e) {}

    resetScrollToTop();
    const raf = requestAnimationFrame(resetScrollToTop);
    const t1 = setTimeout(resetScrollToTop, 50);
    const t2 = setTimeout(resetScrollToTop, 150);
    const t3 = setTimeout(resetScrollToTop, 300);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [activeTab]);

  // Window load, DOM ready and focus listener to always ensure top view
  useEffect(() => {
    resetScrollToTop();
    window.addEventListener('load', resetScrollToTop);
    window.addEventListener('neuroprep-scroll-top', resetScrollToTop);
    return () => {
      window.removeEventListener('load', resetScrollToTop);
      window.removeEventListener('neuroprep-scroll-top', resetScrollToTop);
    };
  }, []);

  // Support browser Back/Forward navigation through hashchange
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace(/^#/, '');
      if (hash && hash !== activeTab) {
        setActiveTab(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  // Student profile initialized from saved session or pure empty state
  const [profile, setProfile] = useState(() => {
    if (session?.email) {
      const stored = dbService.getUserProfile(session.email);
      if (stored) return { ...stored, ...session };
      return session;
    }
    return {
      name: '',
      email: '',
      college: '',
      department: '',
      cgpa: '',
      graduationYear: '',
      skills: [],
      targetCompany: '',
      targetRole: ''
    };
  });

  // Keep saved profile and session in sync whenever profile changes
  useEffect(() => {
    if (profile?.email) {
      dbService.saveUserProfile(profile.email, profile);
      try {
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      } catch (e) {}
    }
  }, [profile]);

  // User email key for per-user scoped data
  const userEmail = profile?.email || 'guest';

  const savedScore = dbService.getSavedReadinessScore(userEmail);

  const [moodState, setMoodState] = useState({
    emoji: '',
    label: savedScore?.stressScore ? (savedScore.stressScore >= 7 ? 'Anxious' : 'Moderate') : 'Not Checked-in',
    stress: savedScore?.stressScore || 0,
    confidence: 0
  });

  // Load per-user journals on mount / when userEmail changes
  const [journalEntries, setJournalEntries] = useState(() => {
    if (session?.email) {
      return dbService.getJournalsForUser(session.email);
    }
    return [];
  });

  const [selectedDistortion, setSelectedDistortion] = useState(DISTORTIONS.CATASTROPHIZING);

  const [codingState, setCodingState] = useState(() => {
    const cs = dbService.getTestScore('coding', userEmail);
    return {
      score: cs?.score || 0,
      solvedCount: cs?.solvedCount || 0,
      lastUpdated: cs?.date || null
    };
  });

  const [aptitudeState, setAptitudeState] = useState(() => {
    const as = dbService.getTestScore('aptitude', userEmail);
    return {
      score: as?.score || 0,
      accuracy: as?.accuracy || 0,
      totalTests: as?.totalTests || 0,
      lastUpdated: as?.date || null
    };
  });

  const [speechScore, setSpeechScore] = useState(() => {
    const ss = dbService.getTestScore('speech', userEmail);
    return ss ? { score: ss.score, lastUpdated: ss.date } : { score: 0, lastUpdated: null };
  });

  const [interviewState, setInterviewState] = useState(() => {
    const is = dbService.getTestScore('interview', userEmail);
    return {
      lastScore: is?.score || 0,
      commScore: speechScore?.score || 0,
      totalCompleted: is?.totalCompleted || 0,
      lastReport: null,
      lastUpdated: is?.date || null
    };
  });

  // Persist individual test scores to per-user scoped keys whenever they change
  useEffect(() => {
    if (codingState.score > 0) {
      dbService.saveTestScore('coding', codingState.score, userEmail, { solvedCount: codingState.solvedCount });
    }
  }, [codingState.score]);

  useEffect(() => {
    if (aptitudeState.score > 0) {
      dbService.saveTestScore('aptitude', aptitudeState.score, userEmail, { 
        accuracy: aptitudeState.accuracy,
        totalTests: aptitudeState.totalTests 
      });
    }
  }, [aptitudeState.score]);

  useEffect(() => {
    if (interviewState.lastScore > 0) {
      dbService.saveTestScore('interview', interviewState.lastScore, userEmail, { totalCompleted: interviewState.totalCompleted });
    }
    if (interviewState.commScore > 0) {
      dbService.saveTestScore('speech', interviewState.commScore, userEmail);
    }
  }, [interviewState.lastScore, interviewState.commScore]);

  useEffect(() => {
    if (moodState.stress > 0) {
      dbService.saveTestScore('mood', moodState.stress, userEmail, { label: moodState.label });
    }
  }, [moodState.stress]);

  // Also keep merged readiness score for overall calculation
  useEffect(() => {
    if (codingState.score > 0 || interviewState.lastScore > 0 || moodState.stress > 0) {
      dbService.saveReadinessScore({
        codingScore: codingState.score,
        interviewScore: interviewState.lastScore,
        speechScore: interviewState.commScore,
        stressScore: moodState.stress,
        solvedCount: codingState.solvedCount,
        totalInterviews: interviewState.totalCompleted
      }, userEmail);
    }
  }, [codingState.score, interviewState.lastScore, interviewState.commScore, moodState.stress]);

  // Reload journals whenever user email changes (after login)
  useEffect(() => {
    if (userEmail && userEmail !== 'guest') {
      const saved = dbService.getJournalsForUser(userEmail);
      setJournalEntries(saved);
    }
  }, [userEmail]);

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (userData) => {
    const email = userData.email || 'guest';
    const newProfile = { ...profile, ...userData };
    setProfile(newProfile);
    setIsAuthenticated(true);
    setAuthModalOpen(false);
    setIsLanding(false);
    setActiveTab('dashboard');

    // Reload this user's journals from localStorage
    const savedJournals = dbService.getJournalsForUser(email);
    setJournalEntries(savedJournals);

    // Reload per-test individual scores with their timestamps
    const cs = dbService.getTestScore('coding', email);
    const is = dbService.getTestScore('interview', email);
    const ss = dbService.getTestScore('speech', email);
    const ms = dbService.getTestScore('mood', email);

    if (cs) setCodingState({ score: cs.score || 0, solvedCount: cs.solvedCount || 0, lastUpdated: cs.date || null });
    if (is || ss) {
      setInterviewState(prev => ({
        ...prev,
        lastScore: is?.score || 0,
        commScore: ss?.score || 0,
        totalCompleted: is?.totalCompleted || 0,
        lastUpdated: is?.date || null
      }));
    }
    if (ms) {
      setMoodState(prev => ({
        ...prev,
        stress: ms.score || 0,
        label: ms.label || (ms.score >= 7 ? 'Anxious' : ms.score > 0 ? 'Moderate' : 'Not Checked-in'),
        lastUpdated: ms.date || null
      }));
    }

    // Save session in localStorage so page refresh stays logged in
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newProfile));
    } catch (e) {
      console.error("Failed to save session:", e);
    }
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch (e) {}
    setIsAuthenticated(false);
    setIsLanding(true);
    setSession(null);
    setJournalEntries([]);
  };

  const handleGoHome = () => {
    if (!isAuthenticated) {
      setIsLanding(true);
    } else {
      setActiveTab('dashboard');
    }
  };

  // Journal save handler — persists to per-user db and updates state
  const handleSaveJournalEntry = (entry) => {
    const updated = dbService.saveJournalForUser(entry, userEmail);
    setJournalEntries(updated);
    recordActivity(userEmail, 'journal');
  };

  // Journal delete handler — removes from per-user db and updates state
  const handleDeleteJournalEntry = (entryId) => {
    const updated = dbService.deleteJournalEntryForUser(entryId, userEmail);
    setJournalEntries(updated);
  };

  // Event listener for navigation from sidebar
  useEffect(() => {
    const handleNavEvent = (e) => {
      if (e.detail) {
        setActiveTab(e.detail);
      }
    };
    window.addEventListener('neuroprep-nav', handleNavEvent);
    return () => window.removeEventListener('neuroprep-nav', handleNavEvent);
  }, []);

  if (isLanding && !isAuthenticated) {
    return (
      <>
        <LandingPage 
          onOpenAuth={handleOpenAuth} 
          onExploreDashboard={() => { setIsLanding(false); setActiveTab('dashboard'); }} 
        />

        {authModalOpen && (
          <AuthModal 
            initialMode={authMode} 
            onClose={() => setAuthModalOpen(false)} 
            onLoginSuccess={handleLoginSuccess} 
          />
        )}
      </>
    );
  }

  return (
    <div style={{ backgroundColor: 'var(--bg-page)', minHeight: '100vh', color: 'var(--text-body)' }}>
      <Navigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        userProfile={profile} 
        onSignOut={handleSignOut}
        onGoHome={handleGoHome}
      />

      <main style={{ marginLeft: 0, marginTop: '0', minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'dashboard' && (
          <Dashboard 
            profile={profile} 
            moodState={moodState} 
            setMoodState={setMoodState}
            journalEntries={journalEntries}
            setJournalEntries={setJournalEntries}
            interviewState={interviewState} 
            codingState={codingState} 
            aptitudeState={aptitudeState}
            setActiveTab={setActiveTab} 
            setSelectedDistortion={setSelectedDistortion}
          />
        )}

        {activeTab === 'roadmap' && (
          <PlacementRoadmap setActiveTab={setActiveTab} />
        )}

        {activeTab === 'sheets' && (
          <PuzzlesAndSheets setActiveTab={setActiveTab} />
        )}

        {activeTab === 'aptitude' && (
          <AptitudePractice 
            aptitudeState={aptitudeState} 
            setAptitudeState={setAptitudeState} 
            userEmail={userEmail}
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'coding' && (
          <CodingAssessment codingState={codingState} setCodingState={setCodingState} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'company' && (
          <CompanyPrep setActiveTab={setActiveTab} />
        )}

        {activeTab === 'mock' && (
          <NeroprepEngine userEmail={userEmail} />
        )}

        {activeTab === 'mood' && (
          <MoodAssessment moodState={moodState} setMoodState={setMoodState} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'journal' && (
          <ThoughtJournal 
            journalEntries={journalEntries} 
            onSaveEntry={handleSaveJournalEntry}
            onDeleteEntry={handleDeleteJournalEntry}
            setActiveTab={setActiveTab} 
            setSelectedDistortion={setSelectedDistortion}
            userEmail={userEmail}
          />
        )}

        {activeTab === 'cbt' && (
          <CognitiveReappraisal selectedDistortion={selectedDistortion} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'recovery' && (
          <StressRecovery setActiveTab={setActiveTab} />
        )}

        {activeTab === 'profile' && (
          <UserProfile profile={profile} setProfile={setProfile} setActiveTab={setActiveTab} />
        )}

        {activeTab === 'gamification' && (
          <Gamification 
            profile={profile}
            codingState={codingState} 
            interviewState={interviewState} 
            aptitudeState={aptitudeState}
            journalEntries={journalEntries}
            userEmail={userEmail}
            setActiveTab={setActiveTab} 
          />
        )}

        {activeTab === 'daily-challenge' && (
          <DailyChallengeArena 
            userEmail={userEmail} 
            setActiveTab={setActiveTab}
            onProblemSolved={() => {
              const cs = dbService.getTestScore('coding', userEmail);
              const solvedCount = (cs?.solvedCount || 0) + 1;
              const score = Math.min(100, Math.round((solvedCount / 396) * 100));
              setCodingState({ score, solvedCount, lastUpdated: new Date().toLocaleDateString() });
            }}
          />
        )}

        {activeTab === 'reports' && (
          <Reports 
            profile={profile} 
            moodState={moodState} 
            interviewState={interviewState} 
            codingState={codingState} 
            aptitudeState={aptitudeState}
            setActiveTab={setActiveTab} 
          />
        )}
      </main>

      {authModalOpen && (
        <AuthModal 
          initialMode={authMode} 
          onClose={() => setAuthModalOpen(false)} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}
    </div>
  );
}
