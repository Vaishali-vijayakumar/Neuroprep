import { localDb } from './localDb';

// Supabase Environment Credentials
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

let supabaseClient = null;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

// Use localDb for browser state management
export const db = localDb;

const REGISTERED_USERS_KEY = 'neuroprep_registered_users';

function getRegisteredUsersMap() {
 try {
 const raw = localStorage.getItem(REGISTERED_USERS_KEY);
 return raw ? JSON.parse(raw) : {};
 } catch (e) {
 return {};
 }
}

function saveRegisteredUsersMap(usersMap) {
 try {
 localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(usersMap));
 } catch (e) {
 console.error('Error saving users map:', e);
 }
}

// ─────────────────────────────────────────────
// Per-user journal key helper
// ─────────────────────────────────────────────
function getUserJournalKey(userEmail) {
 const safeEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
 return `neuroprep_journals_${safeEmail}`;
}

function getUserScoreKey(userEmail) {
 const safeEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
 return `neuroprep_score_${safeEmail}`;
}

function getUserTestScoreKey(userEmail, testType) {
 const safeEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
 return `neuroprep_testscore_${testType}_${safeEmail}`;
}

/**
 * Database Helper Service
 */
export const dbService = {
 // ─────────────────────────────────────────────
 // User Registration & Authentication (Strict Auth)
 // ─────────────────────────────────────────────
 registerUser({ email, password, name, college, department, graduationYear }) {
 if (!email || !password) {
 return { success: false, error: 'Email and password are required.' };
 }
 const normEmail = email.trim().toLowerCase();
 const users = getRegisteredUsersMap();

 if (users[normEmail]) {
 return { success: false, error: 'An account with this email already exists. Please log in.' };
 }

 const newUser = {
 email: normEmail,
 password: password,
 name: name?.trim() || '',
 college: college?.trim() || '',
 department: department?.trim() || '',
 graduationYear: Number(graduationYear) || '',
 skills: [],
 targetCompany: '',
 targetRole: '',
 createdAt: new Date().toISOString(),
 };

 users[normEmail] = newUser;
 saveRegisteredUsersMap(users);
 db.from('profiles').upsert(newUser);

 return { success: true, user: newUser };
 },

 authenticateUser(email, password) {
 if (!email || !password) {
 return { success: false, error: 'Please enter both your email address and password.' };
 }
 const normEmail = email.trim().toLowerCase();
 const users = getRegisteredUsersMap();

 const user = users[normEmail];
 if (!user) {
 return {
 success: false,
 error: 'No account found with this email. Please sign up first.'
 };
 }

 if (user.password !== password) {
 return {
 success: false,
 error: 'Incorrect password. Please verify your password and try again.'
 };
 }

 return { success: true, user };
 },

 getUserProfile(email) {
 if (!email) return null;
 const normEmail = email.trim().toLowerCase();
 const users = getRegisteredUsersMap();
 return users[normEmail] || null;
 },

 saveUserProfile(email, updatedProfile) {
 if (!email) return;
 const normEmail = email.trim().toLowerCase();
 const users = getRegisteredUsersMap();
 const existing = users[normEmail] || {};
 const merged = { ...existing, ...updatedProfile, email: normEmail, updated_at: new Date().toISOString() };
 users[normEmail] = merged;
 saveRegisteredUsersMap(users);
 db.from('profiles').upsert(merged);
 return merged;
 },

 clearAllUsers() {
 try {
 localStorage.removeItem(REGISTERED_USERS_KEY);
 localStorage.removeItem('neuroprep_user_session');
 localStorage.removeItem('neuroprep_db_profiles');
 db.from('profiles').update([]);
 } catch (e) {
 console.error('Error clearing users from db:', e);
 }
 },

 // Profiles
 async getProfile() {
 const res = await db.from('profiles').select('*');
 return res.data?.[0] || null;
 },

 async saveProfile(profileData) {
 return await db.from('profiles').upsert(profileData);
 },

 // ─────────────────────────────────────────────
 // Scores Persistence — scoped per user email
 // ─────────────────────────────────────────────
 getSavedReadinessScore(userEmail) {
 try {
 const key = getUserScoreKey(userEmail);
 const raw = localStorage.getItem(key);
 if (!raw) return null;
 return JSON.parse(raw);
 } catch (e) {
 return null;
 }
 },

 saveReadinessScore(scoreObj, userEmail) {
 try {
 const key = getUserScoreKey(userEmail);
 const record = {
 ...scoreObj,
 updated_at: new Date().toISOString()
 };
 localStorage.setItem(key, JSON.stringify(record));
 db.from('readiness_scores').insert(record);
 } catch (e) {
 console.error("Error saving readiness score:", e);
 }
 },

 // ─────────────────────────────────────────────
 // Individual test score persistence (per-user, per-test type)
 // testType: 'coding' | 'interview' | 'speech' | 'mood'
 // ─────────────────────────────────────────────
 saveTestScore(testType, scoreValue, userEmail, extra = {}) {
 try {
 const key = getUserTestScoreKey(userEmail, testType);
 const record = {
 type: testType,
 score: scoreValue,
 date: new Date().toLocaleDateString(),
 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
 updated_at: new Date().toISOString(),
 ...extra
 };
 localStorage.setItem(key, JSON.stringify(record));
 } catch (e) {
 console.error(`Error saving ${testType} score:`, e);
 }
 },

 getTestScore(testType, userEmail) {
 try {
 const key = getUserTestScoreKey(userEmail, testType);
 const raw = localStorage.getItem(key);
 if (!raw) return null;
 return JSON.parse(raw);
 } catch (e) {
 return null;
 }
 },

 // Mood Logs
 async getMoodLogs() {
 const res = await db.from('mood_logs').select('*');
 return res.data || [];
 },

 async logMood(moodData) {
 return await db.from('mood_logs').insert(moodData);
 },

 // ─────────────────────────────────────────────
 // Thought Journals — fully per-user via localStorage
 // ─────────────────────────────────────────────
 getJournalsForUser(userEmail) {
 try {
 const key = getUserJournalKey(userEmail);
 const raw = localStorage.getItem(key);
 if (!raw) return [];
 return JSON.parse(raw);
 } catch (e) {
 return [];
 }
 },

 saveJournalForUser(entry, userEmail) {
 try {
 const key = getUserJournalKey(userEmail);
 const existing = this.getJournalsForUser(userEmail);
 const updated = [entry, ...existing];
 localStorage.setItem(key, JSON.stringify(updated));
 // Also persist to the shared db table with user_email field
 db.from('thought_journals').insert({ ...entry, user_email: userEmail });

 // Automatically save positive memories if extracted
 if (entry.analysis?.positiveMemoriesExtracted?.length > 0) {
 entry.analysis.positiveMemoriesExtracted.forEach(mem => {
 this.savePositiveMemoryForUser({ text: mem, date: entry.date, category: entry.category }, userEmail);
 });
 }
 // Automatically save hope note if extracted
 if (entry.analysis?.hopeNoteExtracted) {
 this.saveHopeNoteForUser({ text: entry.analysis.hopeNoteExtracted, date: entry.date }, userEmail);
 }

 return updated;
 } catch (e) {
 console.error("Error saving journal:", e);
 return [];
 }
 },

 deleteJournalEntryForUser(entryId, userEmail) {
 try {
 const key = getUserJournalKey(userEmail);
 const existing = this.getJournalsForUser(userEmail);
 const updated = existing.filter(e => e.id !== entryId);
 localStorage.setItem(key, JSON.stringify(updated));
 return updated;
 } catch (e) {
 return [];
 }
 },

 // ─────────────────────────────────────────────
 // Hope Jar Helpers
 // ─────────────────────────────────────────────
 getHopeNotesForUser(userEmail) {
 try {
 const safeEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
 const raw = localStorage.getItem(`neuroprep_hope_${safeEmail}`);
 const defaultNotes = [
 { id: 1, text: "I will keep trying no matter how difficult the algorithm seems." },
 { id: 2, text: "I am improving every week, and that progress is real and measurable." },
 { id: 3, text: "I won't quit. Placement preparation is a process of small, steady gains." },
 { id: 4, text: "You've overcome hard exam days before. This challenge will pass too." },
 { id: 5, text: "One rejection or difficult interview doesn't define your true potential." },
 { id: 6, text: "Every failed test case is giving you valuable clues to become a stronger engineer." },
 { id: 7, text: "My journey is unique to me; I don't need to compare my timeline with anyone else." },
 { id: 8, text: "Taking rest today is equipping my mind for a sharper focus tomorrow." },
 { id: 9, text: "Small daily efforts compound into massive career breakthroughs over time." },
 { id: 10, text: "I am allowed to take a deep breath and give myself credit for how far I've come." },
 { id: 11, text: "Technical confidence is built problem by problem, not overnight." },
 { id: 12, text: "I have the capacity to adapt, learn, and master new concepts continuously." },
 { id: 13, text: "My dedication today is opening doors for upcoming placement drives." },
 { id: 14, text: "Pausing to think during an interview demonstrates clarity, not weakness." },
 { id: 15, text: "I am worthy of patience and encouragement as I learn difficult topics." },
 { id: 16, text: "Each mock interview builds my resilience and sharpens my real-world communication." },
 { id: 17, text: "The effort I invest in debugging logic is building real engineering intuition." },
 { id: 18, text: "I focus on what I can control today and trust the opportunities coming my way." },
 { id: 19, text: "Difficult problems are proof that I am pushing beyond my previous comfort zone." },
 { id: 20, text: "I am capable, resilient, and fully equipped to achieve my career goals." }
 ];
 if (!raw) return defaultNotes;
 const parsed = JSON.parse(raw);
 return (parsed.length >= 20) ? parsed : defaultNotes;
 } catch (e) {
 return [];
 }
 },

 saveHopeNoteForUser(noteObj, userEmail) {
 try {
 const safeEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
 const existing = this.getHopeNotesForUser(userEmail);
 const newNote = { id: Date.now(), text: noteObj.text, date: noteObj.date || new Date().toLocaleDateString() };
 // Prevent duplicates
 if (existing.some(n => n.text.toLowerCase() === noteObj.text.toLowerCase())) return existing;
 const updated = [newNote, ...existing];
 localStorage.setItem(`neuroprep_hope_${safeEmail}`, JSON.stringify(updated));
 return updated;
 } catch (e) {
 return [];
 }
 },

 // ─────────────────────────────────────────────
 // Positive Memory Bank Helpers
 // ─────────────────────────────────────────────
 getPositiveMemoriesForUser(userEmail) {
 try {
 const safeEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
 const raw = localStorage.getItem(`neuroprep_memories_${safeEmail}`);
 const defaultMemories = [
 { id: 1, text: "I solved a difficult Binary Tree question after 3 attempts.", category: "Coding", date: "Recent" },
 { id: 2, text: "I finally understood dynamic programming memoization.", category: "Learning", date: "Recent" },
 { id: 3, text: "My mock interviewer appreciated my clear communication.", category: "Interview", date: "Recent" }
 ];
 if (!raw) return defaultMemories;
 const parsed = JSON.parse(raw);
 return parsed.length > 0 ? parsed : defaultMemories;
 } catch (e) {
 return [];
 }
 },

 savePositiveMemoryForUser(memObj, userEmail) {
 try {
 const safeEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
 const existing = this.getPositiveMemoriesForUser(userEmail);
 const newMem = { id: Date.now(), text: memObj.text, category: memObj.category || "General Win", date: memObj.date || new Date().toLocaleDateString() };
 if (existing.some(m => m.text.toLowerCase() === memObj.text.toLowerCase())) return existing;
 const updated = [newMem, ...existing];
 localStorage.setItem(`neuroprep_memories_${safeEmail}`, JSON.stringify(updated));
 return updated;
 } catch (e) {
 return [];
 }
 },

 // ─────────────────────────────────────────────
 // Weekly Reflection Helpers
 // ─────────────────────────────────────────────
 getWeeklyReflectionsForUser(userEmail) {
 try {
 const safeEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
 const raw = localStorage.getItem(`neuroprep_weekly_${safeEmail}`);
 return raw ? JSON.parse(raw) : [];
 } catch (e) {
 return [];
 }
 },

 saveWeeklyReflectionForUser(reflectionObj, userEmail) {
 try {
 const safeEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
 const existing = this.getWeeklyReflectionsForUser(userEmail);
 const newRef = { id: Date.now(), date: new Date().toLocaleDateString(), ...reflectionObj };
 const updated = [newRef, ...existing];
 localStorage.setItem(`neuroprep_weekly_${safeEmail}`, JSON.stringify(updated));
 return updated;
 } catch (e) {
 return [];
 }
 },

 // ─────────────────────────────────────────────
 // Achievement Garden Calculations
 // ─────────────────────────────────────────────
 getGardenStats(userEmail) {
 const journals = this.getJournalsForUser(userEmail);
 const count = journals.length;
 let stage = 'Level 1';
 let stageName = 'Sprouting Seedling';
 let nextMilestone = 2;
 if (count >= 15) {
 stage = 'Level 5';
 stageName = 'Full Blooming Garden';
 nextMilestone = count + 5;
 } else if (count >= 10) {
 stage = 'Level 4';
 stageName = 'Flowering Tree';
 nextMilestone = 15;
 } else if (count >= 5) {
 stage = 'Level 3';
 stageName = 'Strong Oak';
 nextMilestone = 10;
 } else if (count >= 2) {
 stage = 'Level 2';
 stageName = 'Growing Sapling';
 nextMilestone = 5;
 }
 return {
 count,
 stage,
 stageName,
 nextMilestone
 };
 },

 // ─────────────────────────────────────────────
 // Legacy helpers (kept for backward compatibility)
 // ─────────────────────────────────────────────
 async getJournals() {
 const res = await db.from('thought_journals').select('*');
 return res.data || [];
 },

 async saveJournal(entry) {
 return await db.from('thought_journals').insert(entry);
 },

 // CBT Reappraisals
 async saveCBTExercise(exercise) {
 return await db.from('cbt_reappraisals').insert(exercise);
 },

 // Mock Interviews
 async saveMockInterviewReport(report) {
 return await db.from('mock_interviews').insert(report);
 },

 // Coding Submissions
 async saveCodingSubmission(submission) {
 return await db.from('coding_submissions').insert(submission);
 },

 // ─────────────────────────────────────────────
 // Company Interview Experiences (Community DB)
 // ─────────────────────────────────────────────
 getPublishedCompanyExperiences(companyId) {
 try {
 const raw = localStorage.getItem(`neuroprep_company_experiences_${companyId}`);
 const localData = raw ? JSON.parse(raw) : [];
 // Also query shared db if configured
 const dbRes = db.from('company_experiences').select('*');
 const dbData = (dbRes && dbRes.data) ? dbRes.data.filter(x => x.company_id === companyId) : [];
 
 // Combine local and db data without duplicates
 const map = new Map();
 [...dbData, ...localData].forEach(item => {
 if (item && item.id) map.set(item.id, item);
 });
 return Array.from(map.values());
 } catch (e) {
 return [];
 }
 },

 publishCompanyExperience(experienceObj) {
 try {
 const companyId = experienceObj.companyId || experienceObj.company_id;
 const record = {
 id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
 company_id: companyId,
 created_at: new Date().toISOString(),
 published_date: new Date().toLocaleDateString(),
 ...experienceObj
 };

 // Save to local list
 const existing = this.getPublishedCompanyExperiences(companyId);
 const updated = [record, ...existing];
 localStorage.setItem(`neuroprep_company_experiences_${companyId}`, JSON.stringify(updated));

 // Also push to db table
 db.from('company_experiences').insert(record);

 return record;
 } catch (e) {
 console.error("Error publishing company experience:", e);
 return null;
 }
 },

 // ─────────────────────────────────────────────
 // Adaptive Mock Interview History Persistence
 // ─────────────────────────────────────────────
 getInterviewHistoryForUser(userEmail) {
 try {
 const safeEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
 const raw = localStorage.getItem(`neuroprep_interview_history_${safeEmail}`);
 if (!raw) return [];
 return JSON.parse(raw);
 } catch (e) {
 return [];
 }
 },

 saveInterviewSession(sessionObj, userEmail) {
 try {
 const safeEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
 const history = this.getInterviewHistoryForUser(userEmail);
 const newRecord = {
 id: sessionObj.id || `sess_${Date.now()}`,
 date: new Date().toLocaleDateString(),
 time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
 timestamp: Date.now(),
 trackName: sessionObj.config?.trackName || 'General Mock Interview',
 trackId: sessionObj.config?.trackId || 'general',
 role: sessionObj.config?.role || 'Software Engineer',
 difficulty: sessionObj.config?.difficulty || 'Adaptive AI',
 duration: sessionObj.elapsedSeconds ? `${Math.floor(sessionObj.elapsedSeconds / 60)}m ${sessionObj.elapsedSeconds % 60}s` : '15m',
 overall_score: sessionObj.report?.overall_score || 80,
 grade: sessionObj.report?.grade || 'B+',
 report: sessionObj.report,
 config: sessionObj.config
 };
 const updated = [newRecord, ...history];
 localStorage.setItem(`neuroprep_interview_history_${safeEmail}`, JSON.stringify(updated));
 db.from('interview_sessions').insert({ ...newRecord, user_email: userEmail });
 return updated;
 } catch (e) {
 console.error("Error saving interview session history:", e);
 return [];
 }
 },

 // ─────────────────────────────────────────────
 // Performance Test Score Management (Real-Time Live Sync)
 // ─────────────────────────────────────────────
 getTestScore(testType, userEmail) {
 try {
 const safeEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
 const raw = localStorage.getItem(`neuroprep_testscore_${testType}_${safeEmail}`);
 if (raw) return JSON.parse(raw);

 // Fallbacks to specific storage keys if testscore not yet written:
 if (testType === 'coding') {
 const dsaRaw = localStorage.getItem(`neuroprep_dsa_solved_${safeEmail}`);
 if (dsaRaw) {
 const parsed = JSON.parse(dsaRaw);
 const count = Object.values(parsed).filter(Boolean).length;
 const pct = Math.min(100, Math.round((count / 396) * 100));
 return { score: pct, solvedCount: count, date: new Date().toLocaleDateString() };
 }
 } else if (testType === 'interview') {
 const hist = this.getInterviewHistoryForUser(userEmail);
 if (hist && hist.length > 0) {
 return {
 score: hist[0].overall_score || 0,
 totalCompleted: hist.length,
 date: hist[0].date
 };
 }
 }
 return null;
 } catch (e) {
 return null;
 }
 },

 saveTestScore(testType, score, userEmail, metadata = {}) {
 try {
 const safeEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
 const record = {
 score: Number(score) || 0,
 date: new Date().toLocaleDateString(),
 timestamp: Date.now(),
 ...metadata
 };
 localStorage.setItem(`neuroprep_testscore_${testType}_${safeEmail}`, JSON.stringify(record));

 // Dispatch global real-time event
 try {
 window.dispatchEvent(new CustomEvent('neuroprep-score-update', {
 detail: { testType, score: Number(score) || 0, userEmail, ...metadata }
 }));
 } catch (_) {}

 return record;
 } catch (e) {
 console.error("Error saving test score:", e);
 return null;
 }
 },

 getSavedReadinessScore(userEmail) {
 try {
 const safeEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
 const raw = localStorage.getItem(`neuroprep_score_${safeEmail}`);
 return raw ? JSON.parse(raw) : null;
 } catch (e) {
 return null;
 }
 },

 saveReadinessScore(scoreObj, userEmail) {
 try {
 const safeEmail = (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
 const record = {
 ...scoreObj,
 lastUpdated: new Date().toLocaleDateString(),
 timestamp: Date.now()
 };
 localStorage.setItem(`neuroprep_score_${safeEmail}`, JSON.stringify(record));
 return record;
 } catch (e) {
 console.error("Error saving readiness score:", e);
 return null;
 }
 },

 // 1-Click Database Export
 exportLocalDump() {
 return localDb.exportDatabaseDump();
 }
};

