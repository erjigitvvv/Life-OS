-- Migration: 0007_events_gamification.sql
-- Description: Gamification events, xp tracking, level calculations
-- Created: 2026-10-22

-- ============================================
-- USER GAMIFICATION PROFILE
-- ============================================
CREATE TABLE IF NOT EXISTS user_gamification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  xp INTEGER DEFAULT 0 NOT NULL,
  level INTEGER DEFAULT 1 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  longest_streak INTEGER DEFAULT 0 NOT NULL,
  life_score INTEGER DEFAULT 0 CHECK (life_score BETWEEN 0 AND 100),
  total_tasks_completed INTEGER DEFAULT 0,
  total_habits_completed INTEGER DEFAULT 0,
  total_study_minutes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- XP EVENTS
-- ============================================
CREATE TABLE IF NOT EXISTS xp_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  action_type TEXT NOT NULL
    CHECK (action_type IN (
      'task_complete', 'task_created', 'task_cancelled',
      'habit_done', 'habit_missed', 'habit_streak_7', 'habit_streak_30',
      'study_session', 'pomodoro_complete', 'flashcard_review',
      'weekly_review', 'goal_complete', 'kaizen_completed',
      'life_score_update'
    )),
  xp_amount INTEGER NOT NULL DEFAULT 0,
  source_id TEXT,  -- task_id, habit_id, etc. (text to avoid FK dependency)
  source_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ACHIEVEMENTS DEFINITIONS
-- ============================================
CREATE TABLE IF NOT EXISTS achievements_definitions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,  -- 'first_task', 'week_streak_7', etc.
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  color TEXT DEFAULT '#3b82f6',
  xp_reward INTEGER DEFAULT 0,
  category TEXT NOT NULL CHECK (category IN ('tasks', 'habits', 'study', 'finance', 'health', 'goals')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- USER ACHIEVEMENTS (Earned)
-- ============================================
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES achievements_definitions(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  progress_value INTEGER DEFAULT 0,
  UNIQUE (user_id, achievement_id)
);

-- ============================================
-- LIFE SCORE HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS life_score_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  factors JSONB DEFAULT '{}',  -- task, study, habit, time, health, finance breakdown
  ai_insight TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, date)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_user_id ON xp_events(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_events_created_at ON xp_events(created_at);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement_id ON user_achievements(achievement_id);
CREATE INDEX IF NOT EXISTS idx_life_score_history_user_date ON life_score_history(user_id, date);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE achievements_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE life_score_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own user_gamification" ON user_gamification FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own xp_events" ON xp_events FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can view achievements" ON achievements_definitions FOR SELECT USING (true);
CREATE POLICY "Users can CRUD own user_achievements" ON user_achievements FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own life_score_history" ON life_score_history FOR ALL USING (auth.uid() = user_id);