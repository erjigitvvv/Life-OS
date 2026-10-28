-- Migration: 0010_event_tracking.sql
-- Description: Event tracking system for AI analytics and life pattern analysis
-- Created: 2026-10-23

-- ============================================
-- EVENT TYPES ENUM
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'event_type') THEN
    CREATE TYPE event_type AS ENUM (
      -- Productivity events
      'task_created',
      'task_updated',
      'task_completed',
      'task_cancelled',
      'habit_started',
      'habit_completed',
      'habit_missed',
      'habit_streak_updated',
      'time_block_started',
      'time_block_completed',
      'time_log_created',
      'pomodoro_started',
      'pomodoro_completed',
      'pomodoro_break',
      -- Study events
      'study_session_started',
      'study_session_completed',
      'study_flashcard_review',
      'soc_day_completed',
      'ielts_task_submitted',
      'ielts_essay_graded',
      'ielts_vocab_reviewed',
      -- Finance events
      'finance_transaction',
      'budget_check',
      'savings_goal_update',
      'debt_payment',
      'subscription_check',
      -- Goals events
      'goal_created',
      'goal_progress',
      'goal_completed',
      -- Review events
      'weekly_review_started',
      'weekly_review_completed',
      'kaizen_improvement',
      -- Life Score events
      'life_score_calculated',
      -- Achievement events
      'achievement_earned',
      'xp_earned',
      'level_up',
      -- System events
      'profile_updated',
      'settings_updated',
      -- AI interaction events
      'ai_chat_message',
      'ai_insight_generated',
      -- Telegram events
      'telegram_message_received',
      'telegram_voice_transcribed',
      'telegram_command_executed'
    );
  END IF;
END
$$;

-- ============================================
-- EVENT CATEGORIES ENUM
-- ============================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'event_category') THEN
    CREATE TYPE event_category AS ENUM (
      'productivity',
      'habits',
      'finance',
      'study',
      'health',
      'goals',
      'time_management',
      'ai_interaction',
      'telegram'
    );
  END IF;
END
$$;

-- ============================================
-- EVENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  event_type event_type NOT NULL,
  event_category event_category NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  context JSONB DEFAULT '{}',
  source 'telegram' | 'web' | 'mobile' | 'api' DEFAULT 'web',
  created_at TIMESTAMPTZ DEFAULT now(),
  indexed_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INDEXES FOR EVENT QUERIES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_event_category ON events(event_category);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_user_created ON events(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_context ON events USING GIN (context);
CREATE INDEX IF NOT EXISTS idx_events_indexed_at ON events(indexed_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Users can only see their own events
CREATE POLICY events_select_own ON events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY events_crud_own ON events FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTION: Insert event
-- ============================================

CREATE OR REPLACE FUNCTION insert_event(
  p_user_id UUID,
  p_event_type event_type,
  p_event_category event_category,
  p_title TEXT,
  p_description TEXT,
  p_metadata JSONB,
  p_context JSONB,
  p_source 'telegram' | 'web' | 'mobile' | 'api'
)
RETURNS UUID AS $$
DECLARE
  v_event_id UUID;
BEGIN
  INSERT INTO events (user_id, event_type, event_category, title, description, metadata, context, source)
  VALUES (p_user_id, p_event_type, p_event_category, p_title, p_description, p_metadata, p_context, p_source)
  RETURNING id INTO v_event_id;

  -- Trigger updated_at on user_progress
  UPDATE user_progress
  SET updated_at = now()
  WHERE user_id = p_user_id;

  RETURN v_event_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HELPER FUNCTION: Get events by type and date range
-- ============================================

CREATE OR REPLACE FUNCTION get_events_by_user_and_type(
  p_user_id UUID,
  p_event_type event_type,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  id UUID,
  event_type event_type,
  event_category event_category,
  title TEXT,
  description TEXT,
  metadata JSONB,
  context JSONB,
  source TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT id, event_type, event_category, title, description, metadata, context, source, created_at
  FROM events
  WHERE user_id = p_user_id
    AND event_type = p_event_type
    AND created_at >= p_start_date
    AND created_at < p_end_date
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HELPER FUNCTION: Get events by category and date range
-- ============================================

CREATE OR REPLACE FUNCTION get_events_by_user_and_category(
  p_user_id UUID,
  p_event_category event_category,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
)
RETURNS TABLE (
  id UUID,
  event_type event_type,
  event_category event_category,
  title TEXT,
  description TEXT,
  metadata JSONB,
  context JSONB,
  source TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT id, event_type, event_category, title, description, metadata, context, source, created_at
  FROM events
  WHERE user_id = p_user_id
    AND event_category = p_event_category
    AND created_at >= p_start_date
    AND created_at < p_end_date
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HELPER FUNCTION: Get daily events summary
-- ============================================

CREATE OR REPLACE FUNCTION get_daily_events_summary(
  p_user_id UUID,
  p_date DATE
)
RETURNS TABLE (
  date DATE,
  total_events INTEGER,
  events_by_type JSONB,
  events_by_category JSONB
) AS $$
DECLARE
  v_start_date TIMESTAMPTZ := p_date::timestamp WITH TIME ZONE;
  v_end_date TIMESTAMPTZ := (p_date + INTERVAL '1 day')::timestamp WITH TIME ZONE;
BEGIN
  RETURN QUERY
  SELECT
    p_date AS date,
    COUNT(*) AS total_events,
    JSONB_OBJECT_AGG(event_type::text, total_events) AS events_by_type,
    JSONB_OBJECT_AGG(event_category::text, category_count) AS events_by_category
  FROM (
    SELECT
      event_type,
      event_category,
      COUNT(*) AS total_events
    FROM events
    WHERE user_id = p_user_id
      AND created_at >= v_start_date
      AND created_at < v_end_date
    GROUP BY event_type, event_category
  ) sub;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGER: Auto-analyze events for patterns
-- ============================================

CREATE OR REPLACE FUNCTION analyze_user_patterns()
RETURNS TRIGGER AS $$
DECLARE
  v_user_events JSONB;
  v_daily_stats JSONB;
  v_weekly_stats JSONB;
  v_recommendations TEXT[];
  v_analysis_record JSONB;
BEGIN
  -- Only run for new events
  IF TG_OP = 'INSERT' THEN
    -- Get recent events for this user (last 30 days)
    SELECT json_agg(row_to_json(events)) INTO v_user_events
    FROM events
    WHERE user_id = NEW.user_id
      AND created_at >= now() - INTERVAL '30 days'
    ORDER BY created_at DESC;

    -- Calculate daily activity stats for last 7 days
    SELECT json_build_object(
      'total_events', COUNT(*),
      'active_days', COUNT(DISTINCT DATE(created_at)),
      'event_types', JSONB_OBJECT_AGG(event_type, COUNT(*))
    ) INTO v_daily_stats
    FROM events
    WHERE user_id = NEW.user_id
      AND created_at >= now() - INTERVAL '7 days';

    -- Store analysis results for AI to consume
    v_analysis_record := json_build_object(
      'analyzed_at', now(),
      'event_count', COALESCE(array_length(v_user_events, 1), 0),
      'daily_stats', v_daily_stats,
      'user_id', NEW.user_id
    );

    -- Store analysis results in ai_memory for AI to consume
    INSERT INTO ai_memory (user_id, memory_key, memory_value, memory_type)
    VALUES (
      NEW.user_id,
      'last_pattern_analysis',
      v_analysis_record,
      'pattern_analysis'
    );

    -- Update user_progress last_analyzed timestamp
    UPDATE user_progress
    SET updated_at = now()
    WHERE user_id = NEW.user_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_analyze_user_patterns
AFTER INSERT ON events
FOR EACH ROW EXECUTE FUNCTION analyze_user_patterns();

-- ============================================
-- VIEW: User event timeline with context
-- ============================================

CREATE OR REPLACE VIEW user_event_view AS
SELECT
  e.id,
  e.user_id,
  e.event_type,
  e.event_category,
  e.title,
  e.description,
  e.metadata,
  e.context,
  e.source,
  e.created_at,
  -- Extract key context fields for easy querying
  CASE
    WHEN e.event_type = 'time_log_created' THEN (e.context->>'duration_minutes')::int
    WHEN e.event_type = 'pomodoro_completed' THEN (e.context->>'pomodoros_completed')::int
    WHEN e.event_type = 'habit_completed' THEN (e.context->>'habit_id')::text
    ELSE NULL
  END AS key_value,
  CASE
    WHEN e.context ? 'timestamp' THEN (e.context->>'timestamp')::text
    WHEN e.context ? 'start_time' THEN (e.context->>'start_time')::text
    WHEN e.context ? 'end_time' THEN (e.context->>'end_time')::text
    ELSE NULL
  END AS time_info,
  -- Category mapping
  CASE e.event_category
    WHEN 'productivity' THEN 'Productivity'
    WHEN 'habits' THEN 'Habits'
    WHEN 'finance' THEN 'Finance'
    WHEN 'study' THEN 'Study'
    WHEN 'health' THEN 'Health'
    WHEN 'goals' THEN 'Goals'
    WHEN 'time_management' THEN 'Time Management'
    WHEN 'ai_interaction' THEN 'AI Interaction'
    WHEN 'telegram' THEN 'Telegram'
    ELSE 'Other'
  END AS display_category
FROM events e;

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT SELECT, INSERT, UPDATE ON events TO authenticated;
GRANT USAGE ON TYPE event_type TO authenticated;
GRANT USAGE ON TYPE event_category TO authenticated;
GRANT EXECUTE ON FUNCTION insert_event TO authenticated;
GRANT EXECUTE ON FUNCTION get_events_by_user_and_type TO authenticated;
GRANT EXECUTE ON FUNCTION get_events_by_user_and_category TO authenticated;
GRANT EXECUTE ON FUNCTION get_daily_events_summary TO authenticated;
GRANT EXECUTE ON FUNCTION analyze_user_patterns TO authenticated;

COMMENT ON TABLE events IS 'Event tracking table for AI-powered life analytics. All user activities are logged here to enable pattern analysis, smart scheduling, behavioral insights, and automated summaries.';
COMMENT ON COLUMN events.metadata IS 'Additional structured data about the event (amounts, IDs, etc.)';
COMMENT ON COLUMN events.context IS 'Contextual data including timestamps, durations, amounts, and other relevant information for AI analysis';
COMMENT ON COLUMN events.source IS 'Source of the event: telegram, web, mobile, or api';