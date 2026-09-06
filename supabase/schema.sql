-- ============================================================
-- QuantumLearn AI — Supabase Database Schema & RLS Policies
-- ============================================================

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Quantum Explorer',
  bio TEXT DEFAULT '',
  role TEXT DEFAULT 'Quantum Computing Student',
  avatar_initials TEXT DEFAULT 'QE',
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
  member_since TIMESTAMPTZ DEFAULT now(),
  notify_streak BOOLEAN DEFAULT true,
  notify_new_modules BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Progress Table
CREATE TABLE IF NOT EXISTS public.progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  completed_modules TEXT[] DEFAULT '{}',
  completed_challenges JSONB DEFAULT '[]'::jsonb,
  last_active_module TEXT,
  total_time_spent INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  last_active_date DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Problem Status Table
CREATE TABLE IF NOT EXISTS public.problem_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  problem_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Unsolved' CHECK (status IN ('Solved', 'Attempted', 'Unsolved')),
  solved_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, problem_id)
);

-- 4. Problems Progress Table (Streaks & Recent Activity)
CREATE TABLE IF NOT EXISTS public.problems_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  current_streak INTEGER DEFAULT 0,
  max_streak INTEGER DEFAULT 0,
  recent_activity JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Saved Circuits Table
CREATE TABLE IF NOT EXISTS public.saved_circuits (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  circuit_json JSONB NOT NULL,
  last_edited TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Activity Log Table
CREATE TABLE IF NOT EXISTS public.activity_log (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  label TEXT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT now()
);

-- 7. User Badges Table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  earned BOOLEAN DEFAULT false,
  earned_date TIMESTAMPTZ,
  UNIQUE(user_id, badge_id)
);

-- 8. Announcements Read Table
CREATE TABLE IF NOT EXISTS public.announcements_read (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  announcement_id TEXT NOT NULL,
  read_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, announcement_id)
);

-- Row-Level Security (RLS) Configuration & Hardening
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;

ALTER TABLE public.progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress FORCE ROW LEVEL SECURITY;

ALTER TABLE public.problem_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problem_status FORCE ROW LEVEL SECURITY;

ALTER TABLE public.problems_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems_progress FORCE ROW LEVEL SECURITY;

ALTER TABLE public.saved_circuits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_circuits FORCE ROW LEVEL SECURITY;

ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log FORCE ROW LEVEL SECURITY;

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges FORCE ROW LEVEL SECURITY;

ALTER TABLE public.announcements_read ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.announcements_read FORCE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Progress policies
DROP POLICY IF EXISTS "Users access own progress" ON public.progress;
CREATE POLICY "Users access own progress" ON public.progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Problem Status policies
DROP POLICY IF EXISTS "Users access own problem status" ON public.problem_status;
CREATE POLICY "Users access own problem status" ON public.problem_status FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Problems Progress policies
DROP POLICY IF EXISTS "Users access own problems progress" ON public.problems_progress;
CREATE POLICY "Users access own problems progress" ON public.problems_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Saved Circuits policies
DROP POLICY IF EXISTS "Users access own saved circuits" ON public.saved_circuits;
CREATE POLICY "Users access own saved circuits" ON public.saved_circuits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Activity Log policies
DROP POLICY IF EXISTS "Users access own activity log" ON public.activity_log;
CREATE POLICY "Users access own activity log" ON public.activity_log FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- User Badges policies
DROP POLICY IF EXISTS "Users access own badges" ON public.user_badges;
CREATE POLICY "Users access own badges" ON public.user_badges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Announcements Read policies
DROP POLICY IF EXISTS "Users access own read announcements" ON public.announcements_read;
CREATE POLICY "Users access own read announcements" ON public.announcements_read FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- New User Trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  initials_val TEXT;
  name_val TEXT;
BEGIN
  name_val := COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1));
  IF name_val IS NULL OR trim(name_val) = '' THEN
    name_val := 'Quantum Explorer';
  END IF;

  initials_val := UPPER(SUBSTRING(name_val FROM 1 FOR 2));

  INSERT INTO public.profiles (id, name, avatar_initials)
  VALUES (NEW.id, name_val, initials_val)
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.problems_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  -- Default badges
  INSERT INTO public.user_badges (user_id, badge_id, name, description, earned, earned_date)
  VALUES
    (NEW.id, 'first_circuit', 'First Circuit', 'Created and simulated your first quantum circuit.', false, null),
    (NEW.id, 'bell_builder', 'Bell State Builder', 'Constructed a maximally entangled Bell pair |Φ+⟩.', false, null),
    (NEW.id, 'streak_7', '7-Day Streak', 'Maintained active quantum practice for 7 days in a row.', false, null),
    (NEW.id, 'superposition_master', 'Superposition Master', 'Mastered single-qubit rotations on the Bloch Sphere.', false, null),
    (NEW.id, 'quantum_teleporter', 'Quantum Teleporter', 'Executed the 3-qubit quantum teleportation protocol.', false, null),
    (NEW.id, 'grover_explorer', 'Grover Explorer', 'Discovered quadratic speedups with amplitude amplification.', false, null),
    (NEW.id, 'deutsch_pioneer', 'Deutsch-Jozsa Pioneer', 'Determined constant vs balanced oracles in 1 single query.', false, null),
    (NEW.id, 'qiskit_coder', 'Qiskit Developer', 'Exported visual circuits directly to executable Python Qiskit.', false, null)
  ON CONFLICT (user_id, badge_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- AUDIT CHECK: Run this query to confirm RLS is active & enforced
-- ============================================================
-- SELECT 
--   c.relname AS tablename,
--   c.relrowsecurity AS rls_active,
--   c.relforcerowsecurity AS rls_strictly_forced
-- FROM pg_class c
-- JOIN pg_namespace n ON n.oid = c.relnamespace
-- WHERE n.nspname = 'public' 
--   AND c.relkind = 'r'
-- ORDER BY tablename;
