-- Migration: 0004_habits.sql
-- Description: Habits module (habits, habit_logs, streak tracking)
-- Created: 2026-10-22

-- ============================================
-- HABITS
-- ============================================
CREATE TABLE IF NOT EXISTS habits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  frequency TEXT DEFAULT 'daily'
    CHECK (frequency IN ('daily', 'weekly', 'custom')),
  target_days TEXT[] DEFAULT '{}',  -- ['monday', 'wednesday', 'friday']
  color TEXT DEFAULT '#10b981',
  icon TEXT DEFAULT '✅',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- HABIT LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS habit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  completed BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (habit_id, date)
);

-- ============================================
-- HABIT STREAKS (materialized view for performance)
-- ============================================
CREATE TABLE IF NOT EXISTS habit_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  habit_id UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_completed DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (habit_id, user_id)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habits_is_active ON habits(is_active);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON habit_logs(date);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_streaks_habit_id ON habit_streaks(habit_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own habits"
  ON habits FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own habit_logs"
  ON habit_logs FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own habit_streaks"
  ON habit_streaks FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Calculate streak for a habit
CREATE OR REPLACE FUNCTION calculate_habit_streak(
  p_habit_id UUID,
  p_user_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_current_streak INTEGER := 0;
  v_check_date DATE := CURRENT_DATE;
  v_log_date DATE;
  v_log_exists BOOLEAN;
BEGIN
  LOOP
    SELECT EXISTS (
      SELECT 1 FROM habit_logs
      WHERE habit_id = p_habit_id
        AND date = v_check_date
        AND completed = true
    ) INTO v_log_exists;

    IF NOT v_log_exists THEN
      EXIT;
    END IF;

    v_current_streak := v_current_streak + 1;
    v_check_date := v_check_date - INTERVAL '1 day';
  END LOOP;

  RETURN v_current_streak;
END;
$$ LANGUAGE plpgsql STABLE;

-- Update streak when habit log is inserted/updated
CREATE OR REPLACE FUNCTION update_habit_streak()
RETURNS TRIGGER AS $$
DECLARE
  v_current_streak INTEGER;
  v_longest_streak INTEGER;
BEGIN
  -- Calculate current streak
  v_current_streak := calculate_habit_streak(NEW.habit_id, NEW.user_id);

  -- Get longest streak
  SELECT longest_streak INTO v_longest_streak
  FROM habit_streaks
  WHERE habit_id = NEW.habit_id AND user_id = NEW.user_id;

  -- Update or insert
  INSERT INTO habit_streaks (habit_id, user_id, current_streak, longest_streak, last_completed)
  VALUES (
    NEW.habit_id,
    NEW.user_id,
    v_current_streak,
    GREATEST(COALESCE(v_longest_streak, 0), v_current_streak),
    NEW.date
  )
  ON CONFLICT (habit_id, user_id)
  DO UPDATE SET
    current_streak = v_current_streak,
    longest_streak = GREATEST(habit_streaks.longest_streak, v_current_streak),
    last_completed = NEW.date,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_habit_streak
  AFTER INSERT OR UPDATE ON habit_logs
  FOR EACH ROW EXECUTE FUNCTION update_habit_streak();

-- ============================================
-- TRIGGERS
-- ============================================
CREATE TRIGGER update_habits_updated_at
  BEFORE UPDATE ON habits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_habit_streaks_updated_at
  BEFORE UPDATE ON habit_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();