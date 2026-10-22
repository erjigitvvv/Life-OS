-- Migration: 0005_study.sql
-- Description: Study module (SOC, IELTS, Flashcards, Study plans, Certifications)
-- Created: 2026-10-22

-- ============================================
-- SOC ANALYST PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS soc_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  total_days INTEGER DEFAULT 56,
  current_day INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  started_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SOC TASKS (Daily tasks in 56-day plan)
-- ============================================
CREATE TABLE IF NOT EXISTS soc_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES soc_plans(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL CHECK (day_number BETWEEN 1 AND 56),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'cybersecurity'
    CHECK (category IN ('networking', 'threat_detection', 'incident_response', 'forensics')),
  resources JSONB DEFAULT '[]',
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- SOC DAILY PROGRESS
-- ============================================
CREATE TABLE IF NOT EXISTS soc_daily_progress (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES soc_plans(id) ON DELETE CASCADE NOT NULL,
  day_number INTEGER NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  notes TEXT,
  time_spent_minutes INTEGER DEFAULT 0,
  completed_tasks JSONB DEFAULT '[]',
  streak INTEGER DEFAULT 0,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (plan_id, day_number)
);

-- ============================================
-- IELTS PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS ielts_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  exam_date DATE,
  current_band NUMERIC(3, 1) DEFAULT 6.0,
  target_band NUMERIC(3, 1) DEFAULT 7.5,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- IELTS TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS ielts_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES ielts_plans(id) ON DELETE CASCADE NOT NULL,
  task_type TEXT NOT NULL
    CHECK (task_type IN ('writing_task1', 'writing_task2', 'speaking_part1',
                         'speaking_part2', 'speaking_part3', 'vocabulary', 'grammar')),
  title TEXT NOT NULL,
  description TEXT,
  target_minutes INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  submitted_at TIMESTAMPTZ,
  ai_feedback JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- IELTS VOCABULARY (SM-2 Algorithm)
-- ============================================
CREATE TABLE IF NOT EXISTS ielts_vocab (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  word TEXT NOT NULL,
  definition TEXT,
  example_sentence TEXT,
  easiness_factor NUMERIC(3, 2) DEFAULT 2.5,
  interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review DATE NOT NULL,
  category TEXT DEFAULT 'general'
    CHECK (category IN ('writing', 'speaking', 'reading', 'listening')),
  learned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STUDY SESSIONS (General study tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS study_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  subject TEXT NOT NULL,
  subject_category TEXT
    CHECK (subject_category IN ('cybersecurity', 'ielts', 'personal_dev')),
  duration_minutes INTEGER NOT NULL,
  focus_areas TEXT[] DEFAULT '{}',
  notes TEXT,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- FLASHCARDS (SM-2 Algorithm - General)
-- ============================================
CREATE TABLE IF NOT EXISTS flashcards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  front TEXT NOT NULL,
  back TEXT NOT NULL,
  deck_name TEXT DEFAULT 'General',
  easiness_factor NUMERIC(3, 2) DEFAULT 2.5,
  interval INTEGER DEFAULT 1,
  repetitions INTEGER DEFAULT 0,
  next_review DATE NOT NULL,
  category TEXT DEFAULT 'general'
    CHECK (category IN ('general', 'ielts_vocab', 'soc_terms', 'programming')),
  learned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STUDY PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS study_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  total_units INTEGER DEFAULT 56,
  current_unit INTEGER DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'completed')),
  started_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- STUDY UNITS
-- ============================================
CREATE TABLE IF NOT EXISTS study_units (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_id UUID REFERENCES study_plans(id) ON DELETE CASCADE NOT NULL,
  unit_number INTEGER NOT NULL CHECK (unit_number BETWEEN 1 AND 56),
  title TEXT NOT NULL,
  description TEXT,
  resources JSONB DEFAULT '[]',
  estimated_minutes INTEGER DEFAULT 30,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- CERTIFICATIONS
-- ============================================
CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'professional'
    CHECK (category IN ('cybersecurity', 'english', 'programming', 'management')),
  target_date DATE,
  score TEXT,
  passed_date DATE,
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'passed', 'failed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_soc_plans_user_id ON soc_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_soc_tasks_plan_id ON soc_tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_soc_daily_progress_plan_id ON soc_daily_progress(plan_id);
CREATE INDEX IF NOT EXISTS idx_ielts_plans_user_id ON ielts_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_ielts_tasks_plan_id ON ielts_tasks(plan_id);
CREATE INDEX IF NOT EXISTS idx_ielts_vocab_user_id ON ielts_vocab(user_id);
CREATE INDEX IF NOT EXISTS idx_ielts_vocab_next_review ON ielts_vocab(next_review) WHERE learned = false;
CREATE INDEX IF NOT EXISTS idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_study_sessions_date ON study_sessions(date);
CREATE INDEX IF NOT EXISTS idx_flashcards_user_id ON flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_flashcards_next_review ON flashcards(next_review) WHERE learned = false;
CREATE INDEX IF NOT EXISTS idx_study_plans_user_id ON study_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_study_units_plan_id ON study_units(plan_id);
CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON certifications(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE soc_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE soc_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE soc_daily_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE ielts_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE ielts_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE ielts_vocab ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own soc_plans" ON soc_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own soc_tasks" ON soc_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own soc_daily_progress" ON soc_daily_progress FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own ielts_plans" ON ielts_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own ielts_tasks" ON ielts_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own ielts_vocab" ON ielts_vocab FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own study_sessions" ON study_sessions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own flashcards" ON flashcards FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own study_plans" ON study_plans FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own study_units" ON study_units FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own certifications" ON certifications FOR ALL USING (auth.uid() = user_id);