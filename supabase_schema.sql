-- ========================================================
-- NeuroPrep Supabase PostgreSQL Schema Migration DDL
-- Paste this script directly into Supabase SQL Editor
-- ========================================================

-- 1. Student Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT auth.uid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  college TEXT,
  department TEXT,
  cgpa NUMERIC(3, 2),
  graduation_year INT,
  skills JSONB DEFAULT '[]'::jsonb,
  target_company TEXT DEFAULT 'TCS',
  target_role TEXT DEFAULT 'Software Development Engineer (SDE)',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Mood & Stress Assessment Logs Table
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  mood_label TEXT NOT NULL,
  stress_level INT NOT NULL CHECK (stress_level BETWEEN 1 AND 10),
  confidence_level INT NOT NULL CHECK (confidence_level BETWEEN 1 AND 10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Thought Journal Entries Table
CREATE TABLE IF NOT EXISTS public.thought_journals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT DEFAULT 'Placement Preparation',
  emotions JSONB DEFAULT '[]'::jsonb,
  sentiment TEXT,
  detected_distortions JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CBT Cognitive Reappraisal Exercises Table
CREATE TABLE IF NOT EXISTS public.cbt_reappraisals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  distortion_name TEXT NOT NULL,
  evidence_supporting TEXT,
  evidence_contradicting TEXT,
  friend_advice TEXT,
  balanced_thought TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Mock Interview Reports Table
CREATE TABLE IF NOT EXISTS public.mock_interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  interview_type TEXT NOT NULL,
  target_company TEXT NOT NULL,
  tech_score INT NOT NULL,
  comm_score INT NOT NULL,
  confidence_score INT NOT NULL,
  speech_analysis JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Coding Submissions & Compiler Results Table
CREATE TABLE IF NOT EXISTS public.coding_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  problem_id INT NOT NULL,
  problem_title TEXT NOT NULL,
  language TEXT NOT NULL,
  code_content TEXT NOT NULL,
  passed_cases INT NOT NULL,
  total_cases INT NOT NULL,
  execution_time TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Placement Readiness Scores Table
CREATE TABLE IF NOT EXISTS public.readiness_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  readiness_score INT NOT NULL,
  coding_score INT NOT NULL,
  interview_score INT NOT NULL,
  speech_score INT NOT NULL,
  stress_score INT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.thought_journals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cbt_reappraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mock_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.readiness_scores ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Users can read and write their own data)
CREATE POLICY "Users can access own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users can access own mood logs" ON public.mood_logs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own journals" ON public.thought_journals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own CBT exercises" ON public.cbt_reappraisals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own mock interviews" ON public.mock_interviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own coding submissions" ON public.coding_submissions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can access own readiness scores" ON public.readiness_scores FOR ALL USING (auth.uid() = user_id);
