-- ==============================================================================
-- NEUROPREP SUPABASE SCHEMA
-- Run these scripts in the Supabase SQL Editor to create the necessary tables
-- ==============================================================================

-- 1. Profiles Table (Automatically populated on signup)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    college TEXT,
    department TEXT,
    graduation_year INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Test Scores Table (Stores Aptitude, Coding, Interview, Speech, Mood scores)
CREATE TABLE IF NOT EXISTS public.test_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    type TEXT NOT NULL,
    score NUMERIC DEFAULT 0,
    metadata JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_email, type)
);

-- 3. Readiness Scores Table
CREATE TABLE IF NOT EXISTS public.readiness_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT UNIQUE NOT NULL,
    score_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    user_email TEXT NOT NULL,
    date TEXT,
    title TEXT,
    category TEXT,
    content TEXT,
    analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_date TEXT,
    data JSONB
);

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

-- ==============================================================================
-- ROW LEVEL SECURITY
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thought_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hope_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.positive_memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_reflections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dsa_solved ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_mastery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheets_completed ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_challenges_solved ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all for authenticated" ON public.profiles FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.test_scores FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.readiness_scores FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.interview_sessions FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.report_snapshots FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.thought_journals FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.hope_notes FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.positive_memories FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.weekly_reflections FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.dsa_solved FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.gamification_state FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.company_mastery FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.company_notes FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.company_experiences FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.roadmap_progress FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.sheets_completed FOR ALL USING (true);
CREATE POLICY "Allow all for authenticated" ON public.daily_challenges_solved FOR ALL USING (true);

-- ==============================================================================
-- AUTOMATIC PROFILE CREATION (TRIGGER & BACKFILL)
-- ==============================================================================

-- 1. Trigger Function: Automatically creates a row in public.profiles whenever
--    a user signs up or is created in Supabase Auth (auth.users)
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
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = COALESCE(EXCLUDED.name, profiles.name),
        college = COALESCE(EXCLUDED.college, profiles.college),
        department = COALESCE(EXCLUDED.department, profiles.department),
        graduation_year = COALESCE(EXCLUDED.graduation_year, profiles.graduation_year),
        updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Bind Trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Backfill Query: Populate public.profiles for any users already registered in Supabase Auth
--    (e.g., users who registered before this trigger was added)
INSERT INTO public.profiles (id, email, name, college, department, graduation_year)
SELECT 
    id,
    email,
    COALESCE(raw_user_meta_data->>'name', split_part(email, '@', 1)),
    COALESCE(raw_user_meta_data->>'college', ''),
    COALESCE(raw_user_meta_data->>'department', ''),
    COALESCE((raw_user_meta_data->>'graduation_year')::integer, 2026)
FROM auth.users
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    college = COALESCE(EXCLUDED.college, profiles.college),
    department = COALESCE(EXCLUDED.department, profiles.department),
    graduation_year = COALESCE(EXCLUDED.graduation_year, profiles.graduation_year),
    updated_at = NOW();

