-- ==============================================================================
-- NEUROPREP SUPABASE SCHEMA & FIX MIGRATION
-- Run this entire script in Supabase Dashboard -> SQL Editor -> Run
-- ==============================================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    college TEXT,
    department TEXT,
    graduation_year INTEGER DEFAULT 2026,
    cgpa TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cgpa TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);

-- 2. Test Scores Table (Stores Aptitude, Coding, Interview, Speech, Mood scores)
CREATE TABLE IF NOT EXISTS public.test_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    type TEXT NOT NULL,
    score NUMERIC DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_email, type)
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_test_scores_user_type ON public.test_scores (user_email, type);

-- 3. Readiness Scores Table
CREATE TABLE IF NOT EXISTS public.readiness_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT UNIQUE,
    score_data JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.readiness_scores ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.readiness_scores ADD COLUMN IF NOT EXISTS score_data JSONB;
CREATE UNIQUE INDEX IF NOT EXISTS idx_readiness_scores_email ON public.readiness_scores (user_email);

-- 4. Interview Sessions Table
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    date TEXT,
    time TEXT,
    timestamp BIGINT,
    trackName TEXT,
    trackId TEXT,
    role TEXT,
    difficulty TEXT,
    duration TEXT,
    overall_score NUMERIC,
    grade TEXT,
    report JSONB,
    config JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Report Snapshots Table
CREATE TABLE IF NOT EXISTS public.report_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Thought Journals
CREATE TABLE IF NOT EXISTS public.thought_journals (
    id TEXT PRIMARY KEY,
    user_email TEXT,
    date TEXT,
    title TEXT,
    category TEXT,
    content TEXT,
    analysis JSONB,
    sentiment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE public.thought_journals ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.thought_journals ADD COLUMN IF NOT EXISTS date TEXT;
ALTER TABLE public.thought_journals ADD COLUMN IF NOT EXISTS analysis JSONB;

-- 7. Hope Notes
CREATE TABLE IF NOT EXISTS public.hope_notes (
    id BIGINT PRIMARY KEY,
    user_email TEXT NOT NULL,
    text TEXT NOT NULL,
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Positive Memories
CREATE TABLE IF NOT EXISTS public.positive_memories (
    id BIGINT PRIMARY KEY,
    user_email TEXT NOT NULL,
    text TEXT NOT NULL,
    category TEXT,
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Weekly Reflections
CREATE TABLE IF NOT EXISTS public.weekly_reflections (
    id BIGINT PRIMARY KEY,
    user_email TEXT NOT NULL,
    reflection_data JSONB NOT NULL,
    date TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. DSA Solved Questions (per user)
CREATE TABLE IF NOT EXISTS public.dsa_solved (
    user_email TEXT PRIMARY KEY,
    solved_map JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Gamification State (XP, streaks, daily progress, claimed quests)
CREATE TABLE IF NOT EXISTS public.gamification_state (
    user_email TEXT PRIMARY KEY,
    activity_history JSONB NOT NULL DEFAULT '{}',
    daily_progress   JSONB NOT NULL DEFAULT '{}',
    claimed_quests   JSONB NOT NULL DEFAULT '{}',
    bonus_xp         INTEGER NOT NULL DEFAULT 0,
    updated_at       TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. Company Mastery Tracker
CREATE TABLE IF NOT EXISTS public.company_mastery (
    user_email TEXT NOT NULL,
    topic_id   TEXT NOT NULL,
    level      INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_email, topic_id)
);

-- 13. Company Topic Notes
CREATE TABLE IF NOT EXISTS public.company_notes (
    user_email TEXT NOT NULL,
    topic_id   TEXT NOT NULL,
    note       TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_email, topic_id)
);

-- 14. Company Interview Experiences (Community)
CREATE TABLE IF NOT EXISTS public.company_experiences (
    id         TEXT PRIMARY KEY,
    company_id TEXT NOT NULL,
    user_email TEXT,
    title      TEXT,
    role       TEXT,
    difficulty TEXT,
    college    TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_date TEXT,
    data JSONB
);
ALTER TABLE public.company_experiences ADD COLUMN IF NOT EXISTS user_email TEXT;
ALTER TABLE public.company_experiences ADD COLUMN IF NOT EXISTS data JSONB;

-- 15. Placement Roadmap Progress
CREATE TABLE IF NOT EXISTS public.roadmap_progress (
    user_email    TEXT PRIMARY KEY,
    completed_ids JSONB NOT NULL DEFAULT '["m1","m2","m5"]',
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 16. Puzzles & Sheets Completed
CREATE TABLE IF NOT EXISTS public.sheets_completed (
    user_email    TEXT PRIMARY KEY,
    completed_ids JSONB NOT NULL DEFAULT '[]',
    updated_at    TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 17. Daily Challenge Arena solved map
CREATE TABLE IF NOT EXISTS public.daily_challenges_solved (
    user_email TEXT PRIMARY KEY,
    solved_map JSONB NOT NULL DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 18. Aptitude Mock Attempts
CREATE TABLE IF NOT EXISTS public.aptitude_mock_attempts (
    id TEXT PRIMARY KEY,
    user_email TEXT NOT NULL,
    test_id TEXT NOT NULL,
    test_title TEXT,
    score NUMERIC DEFAULT 0,
    total_questions INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    incorrect_count INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    breakdown JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) FIX
-- Allow reads, writes, and updates without permission errors
-- ==============================================================================

ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_snapshots DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.thought_journals DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.hope_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.positive_memories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reflections DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_solved DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_mastery DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_experiences DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheets_completed DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges_solved DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.aptitude_mock_attempts DISABLE ROW LEVEL SECURITY;

-- Grant permissions to anon, authenticated, and service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION (TRIGGER & BACKFILL)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, name, college, department, graduation_year)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'college', ''),
        COALESCE(NEW.raw_user_meta_data->>'department', ''),
        COALESCE((NEW.raw_user_meta_data->>'graduation_year')::integer, 2026)
    )
    ON CONFLICT (email) DO UPDATE SET
        name = COALESCE(EXCLUDED.name, profiles.name),
        college = COALESCE(EXCLUDED.college, profiles.college),
        department = COALESCE(EXCLUDED.department, profiles.department),
        graduation_year = COALESCE(EXCLUDED.graduation_year, profiles.graduation_year),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
