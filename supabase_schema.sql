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
    type TEXT NOT NULL, -- 'coding', 'aptitude', 'interview', 'mood', 'speech'
    score NUMERIC DEFAULT 0,
    metadata JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_email, type) -- Allows upserting latest scores per type
);

-- 3. Readiness Scores Table (Stores the global dashboard readiness score)
CREATE TABLE IF NOT EXISTS public.readiness_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT UNIQUE NOT NULL,
    score_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Interview Sessions Table (Stores completed AI mock interview data)
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

-- 5. Report Snapshots Table (Stores comprehensive performance reports)
CREATE TABLE IF NOT EXISTS public.report_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_email TEXT NOT NULL,
    snapshot_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- DIARY WRITING & WELLNESS TABLES
-- ==============================================================================

-- 6. Thought Journals (Diary entries)
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
