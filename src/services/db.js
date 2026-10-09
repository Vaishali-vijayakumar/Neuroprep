import { createClient } from '@supabase/supabase-js';

// Supabase Environment Credentials (strictly read from environment)
const SUPABASE_URL = (import.meta.env?.VITE_SUPABASE_URL || '').trim();
const SUPABASE_ANON_KEY = (import.meta.env?.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

if (!isSupabaseConfigured) {
  console.warn('[Security Notice] Supabase environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY) are not set. Database operations will operate in offline/local mode.');
}

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key', {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    });

// Primary Database Client is Supabase
export const db = supabase;

// ─────────────────────────────────────────────
// Utility helpers
// ─────────────────────────────────────────────
function safeEmail(userEmail) {
  return (userEmail || 'guest').replace(/[^a-z0-9]/gi, '_').toLowerCase();
}

function isActive(userEmail) {
  return isSupabaseConfigured && userEmail && userEmail !== 'guest';
}

function lsGet(key) {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
}

function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {}
}

function lsDel(key) {
  try { localStorage.removeItem(key); } catch (e) {}
}

/**
 * Database Helper Service — Supabase Database & Authentication
 */
export const dbService = {
  // ─────────────────────────────────────────────
  // User Registration & Authentication (Supabase)
  // ─────────────────────────────────────────────
  async registerUser({ email, password, name, college, department, graduationYear }) {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }
    const normEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: normEmail,
        password: password,
        options: {
          data: {
            name: name?.trim() || '',
            college: college?.trim() || '',
            department: department?.trim() || '',
            graduation_year: Number(graduationYear) || 2026,
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      const userId = data.user?.id;
      const profileRecord = {
        id: userId,
        email: normEmail,
        name: name?.trim() || '',
        college: college?.trim() || '',
        department: department?.trim() || '',
        graduation_year: Number(graduationYear) || 2026,
        created_at: new Date().toISOString(),
      };

      // Upsert into Supabase profiles table
      if (userId) {
        try {
          await supabase.from('profiles').upsert(profileRecord);
        } catch (_) {}
      }

      const requiresEmailConfirmation = !data.session;

      return { 
        success: true, 
        user: profileRecord, 
        emailConfirmationRequired: requiresEmailConfirmation 
      };
    } catch (err) {
      return { success: false, error: err.message || 'Registration failed.' };
    }
  },

  async authenticateUser(email, password) {
    if (!email || !password) {
      return { success: false, error: 'Please enter both your email address and password.' };
    }
    const normEmail = email.trim().toLowerCase();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normEmail,
        password: password,
      });

      if (error) {
        if (error.message?.toLowerCase().includes('email not confirmed')) {
          return {
            success: false,
            error: 'Email confirmation required! Please check your inbox and click the verification link sent by Supabase before logging in.'
          };
        }
        return { success: false, error: error.message };
      }

      // Retrieve stored profile from Supabase
      let { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', normEmail)
        .maybeSingle();

      // If user exists in Supabase Auth but has no row in public.profiles table,
      // auto-create and persist the profile row in Supabase now!
      if (!profileData && data.user?.id) {
        const meta = data.user.user_metadata || {};
        const newRecord = {
          id: data.user.id,
          email: normEmail,
          name: meta.name || normEmail.split('@')[0],
          college: meta.college || '',
          department: meta.department || '',
          graduation_year: Number(meta.graduation_year) || 2026,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('profiles')
          .upsert(newRecord, { onConflict: 'id' })
          .select()
          .maybeSingle();

        if (insertErr) {
          console.warn('Notice: Error auto-creating profile in Supabase profiles table:', insertErr.message);
        }
        profileData = inserted || newRecord;
      }

      const userProfile = {
        ...(profileData || {}),
        id: data.user?.id,
        email: normEmail,
        name: profileData?.name || data.user?.user_metadata?.name || normEmail.split('@')[0],
        college: profileData?.college || data.user?.user_metadata?.college || '',
        department: profileData?.department || data.user?.user_metadata?.department || '',
        graduationYear: profileData?.graduation_year ?? profileData?.graduationYear ?? 2026,
        graduation_year: profileData?.graduation_year ?? profileData?.graduationYear ?? 2026,
      };

      return { success: true, user: userProfile };
    } catch (err) {
      return { success: false, error: err.message || 'Authentication failed.' };
    }
  },

  async getUserProfile(email) {
    if (!email) return null;
    const normEmail = email.trim().toLowerCase();
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', normEmail)
        .maybeSingle();
      if (!data) return null;
      return {
        ...data,
        graduationYear: data.graduation_year ?? data.graduationYear ?? 2026,
        graduation_year: data.graduation_year ?? data.graduationYear ?? 2026,
      };
    } catch (e) {
      return null;
    }
  },

  async saveUserProfile(email, updatedProfile) {
    if (!email) return null;
    const normEmail = email.trim().toLowerCase();

    // Determine user ID if available
    let userId = updatedProfile?.id;
    if (!userId) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && user.email?.toLowerCase() === normEmail) {
          userId = user.id;
        }
      } catch (_) {}
    }

    const cleanRecord = {
      ...(userId ? { id: userId } : {}),
      email: normEmail,
      name: updatedProfile.name || normEmail.split('@')[0],
      college: updatedProfile.college || '',
      department: updatedProfile.department || '',
      graduation_year: Number(updatedProfile.graduation_year ?? updatedProfile.graduationYear) || 2026,
      cgpa: updatedProfile.cgpa || '',
      skills: updatedProfile.skills || [],
      updated_at: new Date().toISOString()
    };

    try {
      await supabase.from('profiles').upsert(cleanRecord, { onConflict: 'email' });
    } catch (e) {
      console.warn('Supabase profile sync notice:', e);
    }
    return {
      ...updatedProfile,
      ...cleanRecord,
      graduationYear: cleanRecord.graduation_year,
      graduation_year: cleanRecord.graduation_year
    };
  },

  clearAllUsers() {
    this.clearAllUserData();
  },

  async clearAllUserData() {
    try {
      await supabase.auth.signOut().catch(() => {});
      if (typeof localStorage !== 'undefined') {
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.startsWith('neuroprep_') || key.startsWith('np_') || key.includes('placement'))) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
      }
      try {
        window.dispatchEvent(new CustomEvent('neuroprep-data-cleared'));
      } catch (_) {}
    } catch (e) {
      console.error('Error clearing user data:', e);
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
 // Duplicate Score Persistence block removed
 // (Consolidated lower in the file with Supabase sync)
 // ─────────────────────────────────────────────

 // Mood Logs
 async getMoodLogs() {
 const res = await db.from('mood_logs').select('*');
 return res.data || [];
 },

 async logMood(moodData) {
 return await db.from('mood_logs').insert(moodData);
 },

 // ─────────────────────────────────────────────
 // Thought Journals — Supabase Primary
 // ─────────────────────────────────────────────
 async getJournalsForUser(userEmail) {
 const lsKey = `neuroprep_journals_${safeEmail(userEmail)}`;
 if (!isActive(userEmail)) return lsGet(lsKey) || [];
 try {
   const { data, error } = await db.from('thought_journals').select('*').eq('user_email', userEmail).order('created_at', { ascending: false });
   if (error) throw error;
   const result = data || [];
   lsSet(lsKey, result);
   return result;
 } catch (e) {
   console.warn('Supabase getJournals failed, using localStorage:', e.message);
   return lsGet(lsKey) || [];
 }
 },

 async saveJournalForUser(entry, userEmail) {
 const lsKey = `neuroprep_journals_${safeEmail(userEmail)}`;
 const localList = lsGet(lsKey) || [];
 const updated = [entry, ...localList.filter(j => j.id !== entry.id)];
 lsSet(lsKey, updated);
 if (isActive(userEmail)) {
   try {
     await db.from('thought_journals').upsert({
       id: String(entry.id),
       user_email: userEmail,
       date: entry.date || new Date().toLocaleDateString(),
       title: entry.title || '',
       category: entry.category || 'General',
       content: entry.content || '',
       analysis: entry.analysis || null,
       created_at: entry.createdAt || new Date().toISOString()
     }, { onConflict: 'id' });
   } catch (e) { console.warn('Supabase saveJournal failed:', e.message); }
 }
 if (entry.analysis?.positiveMemoriesExtracted?.length > 0) {
   entry.analysis.positiveMemoriesExtracted.forEach(mem => {
     this.savePositiveMemoryForUser({ text: mem, date: entry.date, category: entry.category }, userEmail);
   });
 }
 if (entry.analysis?.hopeNoteExtracted) {
   this.saveHopeNoteForUser({ text: entry.analysis.hopeNoteExtracted, date: entry.date }, userEmail);
 }
 return updated;
 },

 async deleteJournalEntryForUser(entryId, userEmail) {
 const lsKey = `neuroprep_journals_${safeEmail(userEmail)}`;
 const localList = lsGet(lsKey) || [];
 const updated = localList.filter(e => e.id !== entryId);
 lsSet(lsKey, updated);
 if (isActive(userEmail)) {
   try {
     await db.from('thought_journals').delete().eq('id', entryId).eq('user_email', userEmail);
   } catch (e) { console.warn('Supabase deleteJournal failed:', e.message); }
 }
 return updated;
 },

 async clearAllJournalsForUser(userEmail) {
 const lsKey = `neuroprep_journals_${safeEmail(userEmail)}`;
 lsSet(lsKey, []);
 if (isActive(userEmail)) {
   try {
     await db.from('thought_journals').delete().eq('user_email', userEmail);
   } catch (e) { console.warn('Supabase clearJournals failed:', e.message); }
 }
 return [];
 },

 // ─────────────────────────────────────────────
 // Hope Jar — Supabase Primary
 // ─────────────────────────────────────────────
 _defaultHopeNotes() {
 return [
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
 },

 async getHopeNotesForUser(userEmail) {
 const lsKey = `neuroprep_hope_${safeEmail(userEmail)}`;
 const defaults = this._defaultHopeNotes();
 if (!isActive(userEmail)) { const local = lsGet(lsKey); return (local && local.length >= 20) ? local : defaults; }
 try {
   const { data, error } = await db.from('hope_notes').select('*').eq('user_email', userEmail).order('created_at', { ascending: false });
   if (error) throw error;
   const result = (data && data.length >= 20) ? data : defaults;
   lsSet(lsKey, result);
   return result;
 } catch (e) {
   console.warn('Supabase getHopeNotes failed:', e.message);
   const local = lsGet(lsKey); return (local && local.length >= 20) ? local : defaults;
 }
 },

 async saveHopeNoteForUser(noteObj, userEmail) {
 const lsKey = `neuroprep_hope_${safeEmail(userEmail)}`;
 const existing = lsGet(lsKey) || this._defaultHopeNotes();
 const newNote = { id: Date.now(), text: noteObj.text, date: noteObj.date || new Date().toLocaleDateString() };
 if (existing.some(n => n.text.toLowerCase() === noteObj.text.toLowerCase())) return existing;
 const updated = [newNote, ...existing];
 lsSet(lsKey, updated);
 if (isActive(userEmail)) {
   try { await db.from('hope_notes').insert({ id: newNote.id, user_email: userEmail, text: newNote.text, date: newNote.date }); }
   catch (e) { console.warn('Supabase saveHopeNote failed:', e.message); }
 }
 return updated;
 },

 // ─────────────────────────────────────────────
 // Positive Memory Bank — Supabase Primary
 // ─────────────────────────────────────────────
 async getPositiveMemoriesForUser(userEmail) {
 const lsKey = `neuroprep_memories_${safeEmail(userEmail)}`;
 const defaults = [{ id: 1, text: "I solved a difficult Binary Tree question after 3 attempts.", category: "Coding", date: "Recent" }, { id: 2, text: "I finally understood dynamic programming memoization.", category: "Learning", date: "Recent" }, { id: 3, text: "My mock interviewer appreciated my clear communication.", category: "Interview", date: "Recent" }];
 if (!isActive(userEmail)) { const local = lsGet(lsKey); return (local && local.length > 0) ? local : defaults; }
 try {
   const { data, error } = await db.from('positive_memories').select('*').eq('user_email', userEmail).order('created_at', { ascending: false });
   if (error) throw error;
   const result = (data && data.length > 0) ? data : defaults;
   lsSet(lsKey, result);
   return result;
 } catch (e) {
   console.warn('Supabase getMemories failed:', e.message);
   const local = lsGet(lsKey); return (local && local.length > 0) ? local : defaults;
 }
 },

 async savePositiveMemoryForUser(memObj, userEmail) {
 const lsKey = `neuroprep_memories_${safeEmail(userEmail)}`;
 const existing = lsGet(lsKey) || [];
 const newMem = { id: Date.now(), text: memObj.text, category: memObj.category || "General Win", date: memObj.date || new Date().toLocaleDateString() };
 if (existing.some(m => m.text.toLowerCase() === memObj.text.toLowerCase())) return existing;
 const updated = [newMem, ...existing];
 lsSet(lsKey, updated);
 if (isActive(userEmail)) {
   try { await db.from('positive_memories').insert({ id: newMem.id, user_email: userEmail, text: newMem.text, category: newMem.category, date: newMem.date }); }
   catch (e) { console.warn('Supabase saveMemory failed:', e.message); }
 }
 return updated;
 },

 // ─────────────────────────────────────────────
 // Weekly Reflections — Supabase Primary
 // ─────────────────────────────────────────────
 async getWeeklyReflectionsForUser(userEmail) {
 const lsKey = `neuroprep_weekly_${safeEmail(userEmail)}`;
 if (!isActive(userEmail)) return lsGet(lsKey) || [];
 try {
   const { data, error } = await db.from('weekly_reflections').select('*').eq('user_email', userEmail).order('created_at', { ascending: false });
   if (error) throw error;
   const result = data || [];
   lsSet(lsKey, result);
   return result;
 } catch (e) {
   console.warn('Supabase getReflections failed:', e.message);
   return lsGet(lsKey) || [];
 }
 },

 async saveWeeklyReflectionForUser(reflectionObj, userEmail) {
 const lsKey = `neuroprep_weekly_${safeEmail(userEmail)}`;
 const existing = lsGet(lsKey) || [];
 const newRef = { id: Date.now(), date: new Date().toLocaleDateString(), ...reflectionObj };
 const updated = [newRef, ...existing];
 lsSet(lsKey, updated);
 if (isActive(userEmail)) {
   try { await db.from('weekly_reflections').insert({ id: newRef.id, user_email: userEmail, reflection_data: newRef, date: newRef.date }); }
   catch (e) { console.warn('Supabase saveReflection failed:', e.message); }
 }
 return updated;
 },

 // ─────────────────────────────────────────────
 // Achievement Garden
 // ─────────────────────────────────────────────
 async getGardenStats(userEmail) {
 const journals = await this.getJournalsForUser(userEmail);
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
 // Report Snapshots — Supabase Primary
 // ─────────────────────────────────────────────
 async getReportHistory(userEmail = 'guest') {
 const lsKey = `neuroprep_report_history_${safeEmail(userEmail)}`;
 let history = [];
 if (isActive(userEmail)) {
   try {
     const { data, error } = await db.from('report_snapshots').select('*').eq('user_email', userEmail).order('created_at', { ascending: true }).limit(15);
     if (error) throw error;
     history = (data || []).map(row => row.snapshot_data);
     lsSet(lsKey, history);
   } catch (e) {
     console.warn('Supabase getReportHistory failed:', e.message);
     history = lsGet(lsKey) || [];
   }
 } else {
   history = lsGet(lsKey) || [];
 }
 const previousReport = history.length > 1 ? history[history.length - 2] : (history.length === 1 ? history[0] : null);
 const latestReport = history.length > 0 ? history[history.length - 1] : null;
 return { previousReport, latestReport, history };
 },

 async saveReportSnapshot(reportData, userEmail = 'guest') {
 const lsKey = `neuroprep_report_history_${safeEmail(userEmail)}`;
 const { history: current } = await this.getReportHistory(userEmail);
 const newSnapshot = { id: Date.now(), timestamp: new Date().toISOString(), dateFormatted: new Date().toLocaleDateString(), ...reportData };
 const updated = [...current, newSnapshot].slice(-15);
 lsSet(lsKey, updated);
 if (isActive(userEmail)) {
   try { await db.from('report_snapshots').insert({ user_email: userEmail, snapshot_data: newSnapshot, created_at: new Date().toISOString() }); }
   catch (e) { console.warn('Supabase saveReportSnapshot failed:', e.message); }
 }
 return newSnapshot;
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
 // Company Experiences — Supabase Primary
 // ─────────────────────────────────────────────
 async getPublishedCompanyExperiences(companyId) {
 const lsKey = `neuroprep_company_experiences_${companyId}`;
 if (!isSupabaseConfigured) return lsGet(lsKey) || [];
 try {
   const { data, error } = await db.from('company_experiences').select('*').eq('company_id', companyId).order('created_at', { ascending: false });
   if (error) throw error;
   const result = (data || []).map(row => ({ ...(row.data || row), id: row.id, company_id: row.company_id, created_at: row.created_at }));
   lsSet(lsKey, result);
   return result;
 } catch (e) {
   console.warn('Supabase getExperiences failed:', e.message);
   return lsGet(lsKey) || [];
 }
 },

 async publishCompanyExperience(experienceObj) {
 const companyId = experienceObj.companyId || experienceObj.company_id;
 const record = { id: `exp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`, company_id: companyId, created_at: new Date().toISOString(), published_date: new Date().toLocaleDateString(), ...experienceObj };
 const lsKey = `neuroprep_company_experiences_${companyId}`;
 const existing = lsGet(lsKey) || [];
 lsSet(lsKey, [record, ...existing]);
 if (isSupabaseConfigured) {
   try { await db.from('company_experiences').insert({ id: record.id, company_id: companyId, user_email: experienceObj.user_email || null, published_date: record.published_date, data: record }); }
   catch (e) { console.warn('Supabase publishExperience failed:', e.message); }
 }
 return record;
 },

 // ─────────────────────────────────────────────
 // Interview History — Supabase Primary
 // ─────────────────────────────────────────────
 async getInterviewHistoryForUser(userEmail) {
 const lsKey = `neuroprep_interview_history_${safeEmail(userEmail)}`;
 if (!isActive(userEmail)) return lsGet(lsKey) || [];
 try {
   const { data, error } = await db.from('interview_sessions').select('*').eq('user_email', userEmail).order('created_at', { ascending: false });
   if (error) throw error;
   const result = data || [];
   lsSet(lsKey, result);
   return result;
 } catch (e) {
   console.warn('Supabase getInterviewHistory failed:', e.message);
   return lsGet(lsKey) || [];
 }
 },

 async saveInterviewSession(sessionObj, userEmail) {
 const lsKey = `neuroprep_interview_history_${safeEmail(userEmail)}`;
 const localHistory = lsGet(lsKey) || [];
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
   config: sessionObj.config,
   user_email: userEmail
 };
 const updated = [newRecord, ...localHistory];
 lsSet(lsKey, updated);
 if (isActive(userEmail)) {
   try { await db.from('interview_sessions').upsert(newRecord, { onConflict: 'id' }); }
   catch (e) { console.warn('Supabase saveInterviewSession failed:', e.message); }
 }
 return updated;
 },

 // ─────────────────────────────────────────────
 // Test Scores — Supabase Primary
 // ─────────────────────────────────────────────
 async getTestScore(testType, userEmail) {
 const lsKey = `neuroprep_testscore_${testType}_${safeEmail(userEmail)}`;
 if (isActive(userEmail)) {
   try {
     const { data, error } = await db.from('test_scores').select('*').eq('user_email', userEmail).eq('type', testType).maybeSingle();
     if (error) throw error;
     if (data) {
       const result = { score: data.score, ...data.metadata, date: data.updated_at };
       lsSet(lsKey, result);
       return result;
     }
   } catch (e) { console.warn('Supabase getTestScore failed:', e.message); }
 }
 const cached = lsGet(lsKey);
 if (cached) return cached;
 // Fallbacks
 if (testType === 'coding') {
   const dsaRaw = lsGet(`neuroprep_dsa_solved_${safeEmail(userEmail)}`);
   if (dsaRaw) { const count = Object.values(dsaRaw).filter(Boolean).length; return { score: Math.min(100, Math.round((count / 396) * 100)), solvedCount: count, date: new Date().toLocaleDateString() }; }
 } else if (testType === 'interview') {
   const hist = lsGet(`neuroprep_interview_history_${safeEmail(userEmail)}`) || [];
   if (hist.length > 0) return { score: hist[0].overall_score || 0, totalCompleted: hist.length, date: hist[0].date };
 }
 return null;
 },

 async saveTestScore(testType, score, userEmail, metadata = {}) {
 const lsKey = `neuroprep_testscore_${testType}_${safeEmail(userEmail)}`;
 const record = { type: testType, score: Number(score) || 0, date: new Date().toLocaleDateString(), timestamp: Date.now(), user_email: userEmail || 'guest', ...metadata };
 lsSet(lsKey, record);
 if (isActive(userEmail)) {
   try {
     await db.from('test_scores').upsert({ user_email: record.user_email, type: record.type, score: record.score, metadata: metadata, updated_at: new Date().toISOString() }, { onConflict: 'user_email, type' });
   } catch (e) { console.warn('Supabase saveTestScore failed:', e.message); }
 }
 try { window.dispatchEvent(new CustomEvent('neuroprep-score-update', { detail: { testType, score: Number(score) || 0, userEmail, ...metadata } })); } catch (_) {}
 return record;
 },

 async getSavedReadinessScore(userEmail) {
 const lsKey = `neuroprep_score_${safeEmail(userEmail)}`;
 if (isActive(userEmail)) {
   try {
     const { data, error } = await db.from('readiness_scores').select('*').eq('user_email', userEmail).maybeSingle();
     if (error) throw error;
     if (data) { const result = { ...data.score_data, lastUpdated: data.updated_at }; lsSet(lsKey, result); return result; }
   } catch (e) { console.warn('Supabase getSavedReadinessScore failed:', e.message); }
 }
 return lsGet(lsKey) || null;
 },

 async saveReadinessScore(scoreObj, userEmail) {
 const lsKey = `neuroprep_score_${safeEmail(userEmail)}`;
 const record = { ...scoreObj, user_email: userEmail || 'guest', lastUpdated: new Date().toLocaleDateString(), timestamp: Date.now() };
 lsSet(lsKey, record);
 if (isActive(userEmail)) {
   try { await db.from('readiness_scores').upsert({ user_email: record.user_email, score_data: scoreObj, updated_at: new Date().toISOString() }, { onConflict: 'user_email' }); }
   catch (e) { console.warn('Supabase saveReadinessScore failed:', e.message); }
 }
 return record;
 },

 // ─────────────────────────────────────────────
 // DSA Solved — Supabase Primary
 // ─────────────────────────────────────────────
 async getDsaSolved(userEmail) {
 const lsKey = `neuroprep_dsa_solved_${safeEmail(userEmail)}`;
 if (isActive(userEmail)) {
   try {
     const { data, error } = await db.from('dsa_solved').select('solved_map').eq('user_email', userEmail).maybeSingle();
     if (error) throw error;
     if (data) { lsSet(lsKey, data.solved_map); return data.solved_map; }
   } catch (e) { console.warn('Supabase getDsaSolved failed:', e.message); }
 }
 return lsGet(lsKey) || {};
 },

 async saveDsaSolved(solvedMap, userEmail) {
 const lsKey = `neuroprep_dsa_solved_${safeEmail(userEmail)}`;
 lsSet(lsKey, solvedMap);
 if (isActive(userEmail)) {
   try { await db.from('dsa_solved').upsert({ user_email: userEmail, solved_map: solvedMap, updated_at: new Date().toISOString() }, { onConflict: 'user_email' }); }
   catch (e) { console.warn('Supabase saveDsaSolved failed:', e.message); }
 }
 },

 // ─────────────────────────────────────────────
 // Roadmap Progress — Supabase Primary
 // ─────────────────────────────────────────────
 async getRoadmapProgress(userEmail) {
 const lsKey = 'neuroprep_roadmap_completed';
 if (isActive(userEmail)) {
   try {
     const { data, error } = await db.from('roadmap_progress').select('completed_ids').eq('user_email', userEmail).maybeSingle();
     if (error) throw error;
     if (data) { lsSet(lsKey, data.completed_ids); return data.completed_ids; }
   } catch (e) { console.warn('Supabase getRoadmapProgress failed:', e.message); }
 }
 return lsGet(lsKey) || ['m1', 'm2', 'm5'];
 },

 async saveRoadmapProgress(completedIds, userEmail) {
 lsSet('neuroprep_roadmap_completed', completedIds);
 if (isActive(userEmail)) {
   try { await db.from('roadmap_progress').upsert({ user_email: userEmail, completed_ids: completedIds, updated_at: new Date().toISOString() }, { onConflict: 'user_email' }); }
   catch (e) { console.warn('Supabase saveRoadmapProgress failed:', e.message); }
 }
 },

 // ─────────────────────────────────────────────
 // Sheets Completed — Supabase Primary
 // ─────────────────────────────────────────────
 async getSheetsCompleted(userEmail) {
 const lsKey = 'neuroprep_sheets_completed';
 if (isActive(userEmail)) {
   try {
     const { data, error } = await db.from('sheets_completed').select('completed_ids').eq('user_email', userEmail).maybeSingle();
     if (error) throw error;
     if (data) { lsSet(lsKey, data.completed_ids); return data.completed_ids; }
   } catch (e) { console.warn('Supabase getSheetsCompleted failed:', e.message); }
 }
 return lsGet(lsKey) || [];
 },

 async saveSheetsCompleted(completedIds, userEmail) {
 lsSet('neuroprep_sheets_completed', completedIds);
 if (isActive(userEmail)) {
   try { await db.from('sheets_completed').upsert({ user_email: userEmail, completed_ids: completedIds, updated_at: new Date().toISOString() }, { onConflict: 'user_email' }); }
   catch (e) { console.warn('Supabase saveSheetsCompleted failed:', e.message); }
 }
 },

 // ─────────────────────────────────────────────
 // Daily Challenge Arena — Supabase Primary
 // ─────────────────────────────────────────────
 async getDailyChallengesSolved(userEmail) {
 const lsKey = `neuroprep_daily_arena_${safeEmail(userEmail)}`;
 if (isActive(userEmail)) {
   try {
     const { data, error } = await db.from('daily_challenges_solved').select('solved_map').eq('user_email', userEmail).maybeSingle();
     if (error) throw error;
     if (data) { lsSet(lsKey, data.solved_map); return data.solved_map; }
   } catch (e) { console.warn('Supabase getDailyChallengesSolved failed:', e.message); }
 }
 return lsGet(lsKey) || {};
 },

 async saveDailyChallengesSolved(solvedMap, userEmail) {
 const lsKey = `neuroprep_daily_arena_${safeEmail(userEmail)}`;
 lsSet(lsKey, solvedMap);
 if (isActive(userEmail)) {
   try { await db.from('daily_challenges_solved').upsert({ user_email: userEmail, solved_map: solvedMap, updated_at: new Date().toISOString() }, { onConflict: 'user_email' }); }
   catch (e) { console.warn('Supabase saveDailyChallengesSolved failed:', e.message); }
 }
 },

 // ─────────────────────────────────────────────
 // Company Mastery & Notes — Supabase Primary
 // ─────────────────────────────────────────────
 async getCompanyMastery(userEmail) {
 const lsKey = `neuroprep_mastery_tracker_${safeEmail(userEmail)}`;
 if (isActive(userEmail)) {
   try {
     const { data, error } = await db.from('company_mastery').select('topic_id, level').eq('user_email', userEmail);
     if (error) throw error;
     const map = {}; (data || []).forEach(row => { map[row.topic_id] = row.level; });
     lsSet(lsKey, map); return map;
   } catch (e) { console.warn('Supabase getCompanyMastery failed:', e.message); }
 }
 return lsGet(lsKey) || {};
 },

 async saveCompanyMastery(masteryMap, userEmail) {
 lsSet(`neuroprep_mastery_tracker_${safeEmail(userEmail)}`, masteryMap);
 if (isActive(userEmail)) {
   try {
     const rows = Object.entries(masteryMap).map(([topic_id, level]) => ({ user_email: userEmail, topic_id, level, updated_at: new Date().toISOString() }));
     if (rows.length > 0) await db.from('company_mastery').upsert(rows, { onConflict: 'user_email, topic_id' });
   } catch (e) { console.warn('Supabase saveCompanyMastery failed:', e.message); }
 }
 },

 async getCompanyNotes(userEmail) {
 const lsKey = `neuroprep_topic_notes_${safeEmail(userEmail)}`;
 if (isActive(userEmail)) {
   try {
     const { data, error } = await db.from('company_notes').select('topic_id, note').eq('user_email', userEmail);
     if (error) throw error;
     const map = {}; (data || []).forEach(row => { map[row.topic_id] = row.note; });
     lsSet(lsKey, map); return map;
   } catch (e) { console.warn('Supabase getCompanyNotes failed:', e.message); }
 }
 return lsGet(lsKey) || {};
 },

 async saveCompanyNotes(notesMap, userEmail) {
 lsSet(`neuroprep_topic_notes_${safeEmail(userEmail)}`, notesMap);
 if (isActive(userEmail)) {
   try {
     const rows = Object.entries(notesMap).map(([topic_id, note]) => ({ user_email: userEmail, topic_id, note: note || '', updated_at: new Date().toISOString() }));
     if (rows.length > 0) await db.from('company_notes').upsert(rows, { onConflict: 'user_email, topic_id' });
   } catch (e) { console.warn('Supabase saveCompanyNotes failed:', e.message); }
 }
 },

 // ─────────────────────────────────────────────
 // Gamification State — Supabase Primary
 // ─────────────────────────────────────────────
 async getGamificationState(userEmail) {
 const lsKey = `neuroprep_gamification_${safeEmail(userEmail)}`;
 if (isActive(userEmail)) {
   try {
     const { data, error } = await db.from('gamification_state').select('*').eq('user_email', userEmail).maybeSingle();
     if (error) throw error;
     if (data) {
       const state = { activityHistory: data.activity_history || {}, dailyProgress: data.daily_progress || {}, claimedQuests: data.claimed_quests || {}, bonusXp: data.bonus_xp || 0 };
       lsSet(lsKey, state); return state;
     }
   } catch (e) { console.warn('Supabase getGamificationState failed:', e.message); }
 }
 const local = lsGet(lsKey) || {};
 return { activityHistory: local.activityHistory || {}, dailyProgress: local.dailyProgress || {}, claimedQuests: local.claimedQuests || {}, bonusXp: local.bonusXp || 0 };
 },

 async saveGamificationState(state, userEmail) {
 lsSet(`neuroprep_gamification_${safeEmail(userEmail)}`, state);
 if (isActive(userEmail)) {
   try {
     await db.from('gamification_state').upsert({ user_email: userEmail, activity_history: state.activityHistory || {}, daily_progress: state.dailyProgress || {}, claimed_quests: state.claimedQuests || {}, bonus_xp: state.bonusXp || 0, updated_at: new Date().toISOString() }, { onConflict: 'user_email' });
   } catch (e) { console.warn('Supabase saveGamificationState failed:', e.message); }
 }
 },
  // Database Export
  async exportLocalDump() {
    try {
      const { data } = await supabase.from('profiles').select('*');
      return { profiles: data || [] };
    } catch (_) {
      return {};
    }
  }
};

