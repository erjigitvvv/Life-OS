-- Migration: 0006_kaizen_goals.sql
-- Description: Kaizen + Weekly AI Review module
-- Created: 2026-10-22

-- ============================================
-- WEEKLY REVIEWS
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  wins JSONB DEFAULT '[]',
  challenges JSONB DEFAULT '[]',
  lessons_learned JSONB DEFAULT '[]',
  next_week_focus JSONB DEFAULT '[]',
  ai_insights TEXT,
  life_score_avg NUMERIC(4, 1) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- KAIzen GOALS
-- ============================================
CREATE TABLE IF NOT EXISTS kaizen_goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC DEFAULT 100,
  current_value NUMERIC DEFAULT 0,
  unit TEXT DEFAULT '',
  kaizen_grade TEXT DEFAULT 'normal' CHECK (kaizen_grade IN ('kaizen', 'continuous', 'breakthrough')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- RECURRING TASKS
-- ============================================
CREATE TABLE IF NOT EXISTS recurring_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'weekly' CHECK (frequency IN ('daily', 'weekly', 'monthly', 'quarterly')),
  is_active BOOLEAN DEFAULT true,
  next_due_date DATE,
  last_completed DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- KAIzen IMPROVEMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS kaizen_improvements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  impact_score NUMERIC DEFAULT 1 CHECK (impact_score BETWEEN 1 AND 10),
  effort_score NUMERIC DEFAULT 1 CHECK (effort_score BETWEEN 1 AND 10),
  status TEXT DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'discarded')),
  related_recurring_task_id UUID REFERENCES recurring_tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_id ON weekly_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_week_start ON weekly_reviews(week_start);
CREATE INDEX IF NOT EXISTS idx_kaizen_goals_user_id ON kaizen_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_user_id ON recurring_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_tasks_next_due ON recurring_tasks(next_due_date);
CREATE INDEX IF NOT EXISTS idx_kaizen_improvements_user_id ON kaizen_improvements(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE kaizen_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE kaizen_improvements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own weekly_reviews" ON weekly_reviews FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own kaizen_goals" ON kaizen_goals FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own recurring_tasks" ON recurring_tasks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own kaizen_improvements" ON kaizen_improvements FOR ALL USING (auth.uid() = user_id);