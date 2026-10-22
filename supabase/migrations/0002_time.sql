-- Migration: 0002_time.sql
-- Description: Time management tables (time_blocks, time_logs, pomodoros)
-- Created: 2026-10-22

-- ============================================
-- TIME BLOCKS
-- ============================================
CREATE TABLE IF NOT EXISTS time_blocks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  block_type TEXT DEFAULT 'work'
    CHECK (block_type IN ('work', 'study', 'break', 'personal', 'exercise')),
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TIME LOGS
-- ============================================
CREATE TABLE IF NOT EXISTS time_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  time_block_id UUID REFERENCES time_blocks(id) ON DELETE SET NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  duration_minutes INTEGER GENERATED ALWAYS AS (
    CASE
      WHEN end_time IS NOT NULL
      THEN EXTRACT(EPOCH FROM (end_time - start_time)) / 60
      ELSE 0
    END
  ) STORED,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- POMODOROS
-- ============================================
CREATE TABLE IF NOT EXISTS pomodoros (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
  work_duration INTEGER DEFAULT 25,
  break_duration INTEGER DEFAULT 5,
  completed_pomodoros INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  status TEXT DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'completed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_time_blocks_user_id ON time_blocks(user_id);
CREATE INDEX IF NOT EXISTS idx_time_blocks_start_time ON time_blocks(start_time);
CREATE INDEX IF NOT EXISTS idx_time_logs_user_id ON time_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_time_logs_task_id ON time_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_pomodoros_user_id ON pomodoros(user_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE time_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoros ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own time_blocks"
  ON time_blocks FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own time_logs"
  ON time_logs FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own pomodoros"
  ON pomodoros FOR ALL
  USING (auth.uid() = user_id);
