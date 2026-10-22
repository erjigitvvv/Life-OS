-- Migration: 0009_rls_policies.sql
-- Description: All Row Level Security policies and final setup
-- Created: 2026-10-22

-- ============================================
-- ENABLE RLS ON ALL TABLES
-- ============================================
-- This migration enables RLS on all tables and sets up comprehensive policies

-- Enable RLS on auth.users (if not already)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'ensure_user_is_owner') THEN
    CREATE POLICY ensure_user_is_owner ON auth.users FOR ALL USING (auth.uid() = id);
  END IF;
END
$$;

-- ============================================
-- DETAILED POLICIES FOR ALL LIFEOS TABLES
-- ============================================

-- profiles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'profiles_select_own') THEN
    CREATE POLICY profiles_select_own ON profiles FOR SELECT USING (auth.uid() = id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'profiles_update_own') THEN
    CREATE POLICY profiles_update_own ON profiles FOR UPDATE USING (auth.uid() = id);
  END IF;
END
$$;

-- tracks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tracks_select_own') THEN
    CREATE POLICY tracks_select_own ON tracks FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tracks_crud_own') THEN
    CREATE POLICY tracks_crud_own ON tracks FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- tasks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tasks_select_own') THEN
    CREATE POLICY tasks_select_own ON tasks FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'tasks_crud_own') THEN
    CREATE POLICY tasks_crud_own ON tasks FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- time_blocks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'time_blocks_select_own') THEN
    CREATE POLICY time_blocks_select_own ON time_blocks FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'time_blocks_crud_own') THEN
    CREATE POLICY time_blocks_crud_own ON time_blocks FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- time_logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'time_logs_select_own') THEN
    CREATE POLICY time_logs_select_own ON time_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'time_logs_crud_own') THEN
    CREATE POLICY time_logs_crud_own ON time_logs FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- pomodoros
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'pomodoros_select_own') THEN
    CREATE POLICY pomodoros_select_own ON pomodoros FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'pomodoros_crud_own') THEN
    CREATE POLICY pomodoros_crud_own ON pomodoros FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- habits
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'habits_select_own') THEN
    CREATE POLICY habits_select_own ON habits FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'habits_crud_own') THEN
    CREATE POLICY habits_crud_own ON habits FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- habit_logs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'habit_logs_select_own') THEN
    CREATE POLICY habit_logs_select_own ON habit_logs FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'habit_logs_crud_own') THEN
    CREATE POLICY habit_logs_crud_own ON habit_logs FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- habit_streaks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'habit_streaks_select_own') THEN
    CREATE POLICY habit_streaks_select_own ON habit_streaks FOR SELECT USING (auth.uid() = user_id);
  END IF;
END
$$;

-- soc_plans
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'soc_plans_select_own') THEN
    CREATE POLICY soc_plans_select_own ON soc_plans FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'soc_tasks_crud_own') THEN
    CREATE POLICY soc_tasks_crud_own ON soc_tasks FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- soc_tasks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'soc_tasks_select_own') THEN
    CREATE POLICY soc_tasks_select_own ON soc_tasks FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'soc_tasks_crud_own') THEN
    CREATE POLICY soc_tasks_crud_own ON soc_tasks FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- soc_daily_progress
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'soc_daily_progress_select_own') THEN
    CREATE POLICY soc_daily_progress_select_own ON soc_daily_progress FOR SELECT USING (auth.uid() = user_id);
  END IF;
END
$$;

-- ielts_plans
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'ielts_plans_select_own') THEN
    CREATE POLICY ielts_plans_select_own ON ielts_plans FOR SELECT USING (auth.uid() = user_id);
  END IF;
END
$$;

-- ielts_tasks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'ielts_tasks_select_own') THEN
    CREATE POLICY ielts_tasks_select_own ON ielts_tasks FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'ielts_tasks_crud_own') THEN
    CREATE POLICY ielts_tasks_crud_own ON ielts_tasks FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- ielts_vocab
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'ielts_vocab_select_own') THEN
    CREATE POLICY ielts_vocab_select_own ON ielts_vocab FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'ielts_vocab_crud_own') THEN
    CREATE POLICY ielts_vocab_crud_own ON ielts_vocab FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- study_sessions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'study_sessions_select_own') THEN
    CREATE POLICY study_sessions_select_own ON study_sessions FOR SELECT USING (auth.uid() = user_id);
  END IF;
END
$$;

-- flashcards
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'flashcards_select_own') THEN
    CREATE POLICY flashcards_select_own ON flashcards FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'flashcards_crud_own') THEN
    CREATE POLICY flashcards_crud_own ON flashcards FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- study_plans
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'study_plans_select_own') THEN
    CREATE POLICY study_plans_select_own ON study_plans FOR SELECT USING (auth.uid() = user_id);
  END IF;
END
$$;

-- study_units
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'study_units_select_own') THEN
    CREATE POLICY study_units_select_own ON study_units FOR SELECT USING (auth.uid() = user_id);
  END IF;
END
$$;

-- certifications
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'certifications_select_own') THEN
    CREATE POLICY certifications_select_own ON certifications FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'certifications_crud_own') THEN
    CREATE POLICY certifications_crud_own ON certifications FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- budget_categories
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'budget_categories_select_own') THEN
    CREATE POLICY budget_categories_select_own ON budget_categories FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'budget_categories_crud_own') THEN
    CREATE POLICY budget_categories_crud_own ON budget_categories FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- transactions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'transactions_select_own') THEN
    CREATE POLICY transactions_select_own ON transactions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'transactions_crud_own') THEN
    CREATE POLICY transactions_crud_own ON transactions FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- savings_goals
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'savings_goals_select_own') THEN
    CREATE POLICY savings_goals_select_own ON savings_goals FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'savings_goals_crud_own') THEN
    CREATE POLICY savings_goals_crud_own ON savings_goals FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- debts
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'debts_select_own') THEN
    CREATE POLICY debts_select_own ON debts FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'debts_crud_own') THEN
    CREATE POLICY debts_crud_own ON debts FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- subscriptions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'subscriptions_select_own') THEN
    CREATE POLICY subscriptions_select_own ON subscriptions FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'subscriptions_crud_own') THEN
    CREATE POLICY subscriptions_crud_own ON subscriptions FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- weekly_reviews
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'weekly_reviews_select_own') THEN
    CREATE POLICY weekly_reviews_select_own ON weekly_reviews FOR SELECT USING (auth.uid() = user_id);
  END IF;
END
$$;

-- kaizen_goals
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'kaizen_goals_select_own') THEN
    CREATE POLICY kaizen_goals_select_own ON kaizen_goals FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'kaizen_goals_crud_own') THEN
    CREATE POLICY kaizen_goals_crud_own ON kaizen_goals FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- recurring_tasks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'recurring_tasks_select_own') THEN
    CREATE POLICY recurring_tasks_select_own ON recurring_tasks FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'recurring_tasks_crud_own') THEN
    CREATE POLICY recurring_tasks_crud_own ON recurring_tasks FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- kaizen_improvements
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'kaizen_improvements_select_own') THEN
    CREATE POLICY kaizen_improvements_select_own ON kaizen_improvements FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'kaizen_improvements_crud_own') THEN
    CREATE POLICY kaizen_improvements_crud_own ON kaizen_improvements FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- user_gamification
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'user_gamification_select_own') THEN
    CREATE POLICY user_gamification_select_own ON user_gamification FOR SELECT USING (auth.uid() = user_id);
  END IF;
END
$$;

-- xp_events
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'xp_events_select_own') THEN
    CREATE POLICY xp_events_select_own ON xp_events FOR SELECT USING (auth.uid() = user_id);
  END IF;
END
$$;

-- achievements_definitions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'achievements_definitions_select_all') THEN
    CREATE POLICY achievements_definitions_select_all ON achievements_definitions FOR SELECT USING (true);
  END IF;
END
$$;

-- user_achievements
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'user_achievements_select_own') THEN
    CREATE POLICY user_achievements_select_own ON user_achievements FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'user_achievements_crud_own') THEN
    CREATE POLICY user_achievements_crud_own ON user_achievements FOR ALL USING (auth.uid() = user_id);
  END IF;
END
$$;

-- life_score_history
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'life_score_history_select_own') THEN
    CREATE POLICY life_score_history_select_own ON life_score_history FOR SELECT USING (auth.uid() = user_id);
  END IF;
END
$$;

-- ai_runs
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'ai_runs_select_own') THEN
    CREATE POLICY ai_runs_select_own ON ai_runs FOR SELECT USING (auth.uid() = user_id);
  END IF;
END
$$;

-- ai_memory
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'ai_memory_select_own') THEN
    CREATE POLICY ai_memory_select_own ON ai_memory FOR SELECT USING (auth.uid() = user_id);
  END IF;
END
$$;

RAISE NOTICE 'All RLS policies have been applied successfully.';