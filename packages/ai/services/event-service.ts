/**
 * Event Tracking Service
 *
 * Handles all user activity logging for AI analytics.
 * All user interactions are tracked via this service to enable
 * pattern analysis, smart scheduling, and automated summaries.
 */

import { createClient } from '@supabase/supabase-js';
import { EventType, EventCategory } from '../types';
import { insertEvent, getEventsByUserAndType, getEventsByUserAndCategory, getDailyEventsSummary } from '../db/events';

export interface EventContext {
  duration_minutes?: number;
  pomodoros_completed?: number;
  habit_id?: string;
  task_id?: string;
  amount?: number;
  category_name?: string;
  target_value?: number;
  current_value?: number;
  [key: string]: any;
}

export interface EventMetadata {
  [key: string]: any;
}

export interface LogEventParams {
  userId: string;
  eventType: EventType;
  eventCategory: EventCategory;
  title: string;
  description?: string;
  context?: EventContext;
  metadata?: EventMetadata;
  source?: 'telegram' | 'web' | 'mobile' | 'api';
}

export class EventService {
  private supabase: any;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Log a new event for AI analytics
   */
  async logEvent(params: LogEventParams): Promise<any> {
    const { userId, eventType, eventCategory, title, description, context, metadata, source } = params;

    const { data, error } = await this.supabase
      .from('events')
      .insert({
        user_id: userId,
        event_type: eventType,
        event_category: eventCategory,
        title,
        description,
        context,
        metadata,
        source: source || 'web',
      })
      .select()
      .single();

    if (error) {
      console.error('Error logging event:', error);
      throw error;
    }

    return data;
  }

  /**
   * Log a task creation event
   */
  async logTaskCreated(userId: string, taskTitle: string, taskId: string, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'task_created',
      eventCategory: 'productivity',
      title: taskTitle,
      context: {
        task_id: taskId,
      },
      metadata,
    });
  }

  /**
   * Log a task completion event
   */
  async logTaskCompleted(userId: string, taskTitle: string, taskId: string, durationMinutes?: number, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'task_completed',
      eventCategory: 'productivity',
      title: taskTitle,
      context: {
        task_id: taskId,
        duration_minutes: durationMinutes,
      },
      metadata,
    });
  }

  /**
   * Log a habit completion event
   */
  async logHabitCompleted(userId: string, habitTitle: string, habitId: string, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'habit_completed',
      eventCategory: 'habits',
      title: habitTitle,
      context: {
        habit_id: habitId,
      },
      metadata,
    });
  }

  /**
   * Log a habit missed event
   */
  async logHabitMissed(userId: string, habitTitle: string, habitId: string, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'habit_missed',
      eventCategory: 'habits',
      title: habitTitle,
      context: {
        habit_id: habitId,
      },
      metadata,
    });
  }

  /**
   * Log a habit streak update
   */
  async logHabitStreakUpdated(userId: string, streakDays: number, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'habit_streak_updated',
      eventCategory: 'habits',
      title: `Streak updated: ${streakDays} days`,
      metadata: {
        streak_days: streakDays,
      },
    });
  }

  /**
   * Log a time block start
   */
  async logTimeBlockStarted(userId: string, blockTitle: string, blockId: string, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'time_block_started',
      eventCategory: 'time_management',
      title: blockTitle,
      context: {
        duration_minutes: null, // Will be updated on completion
      },
      metadata,
    });
  }

  /**
   * Log a time block completion
   */
  async logTimeBlockCompleted(userId: string, blockTitle: string, blockId: string, durationMinutes: number, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'time_block_completed',
      eventCategory: 'time_management',
      title: blockTitle,
      context: {
        duration_minutes: durationMinutes,
      },
      metadata,
    });
  }

  /**
   * Log a time log creation
   */
  async logTimeLogCreated(userId: string, taskId: string, durationMinutes: number, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'time_log_created',
      eventCategory: 'productivity',
      title: 'Time logged',
      context: {
        duration_minutes: durationMinutes,
        task_id: taskId,
      },
      metadata,
    });
  }

  /**
   * Log a pomodoro start
   */
  async logPomodoroStarted(userId: string, taskId?: string, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'pomodoro_started',
      eventCategory: 'time_management',
      title: 'Pomodoro started',
      context: {
        pomodoros_completed: 0,
        task_id: taskId,
      },
      metadata,
    });
  }

  /**
   * Log a pomodoro completion
   */
  async logPomodoroCompleted(userId: string, pomodorosCompleted: number, taskId?: string, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'pomodoro_completed',
      eventCategory: 'time_management',
      title: 'Pomodoro completed',
      context: {
        pomodoros_completed: pomodorosCompleted,
        task_id: taskId,
      },
      metadata,
    });
  }

  /**
   * Log a study session start
   */
  async logStudySessionStarted(userId: string, subject: string, durationMinutes: number, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'study_session_started',
      eventCategory: 'study',
      title: `Study: ${subject}`,
      context: {
        duration_minutes: durationMinutes,
      },
      metadata,
    });
  }

  /**
   * Log a study session completion
   */
  async logStudySessionCompleted(userId: string, subject: string, durationMinutes: number, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'study_session_completed',
      eventCategory: 'study',
      title: `Study: ${subject}`,
      context: {
        duration_minutes: durationMinutes,
      },
      metadata,
    });
  }

  /**
   * Log a flashcard review
   */
  async logFlashcardReviewed(userId: string, deck: string, quality: number, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'study_flashcard_review',
      eventCategory: 'study',
      title: 'Flashcard reviewed',
      context: {
        quality: quality,
        deck: deck,
      },
      metadata,
    });
  }

  /**
   * Log an IELTS task submission
   */
  async logIeltsTaskSubmitted(userId: string, taskType: string, taskTitle: string, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'ielts_task_submitted',
      eventCategory: 'study',
      title: `IELTS: ${taskTitle}`,
      context: {
        task_type: taskType,
      },
      metadata,
    });
  }

  /**
   * Log an IELTS essay graded
   */
  async logIeltsEssayGraded(userId: string, score: number, taskTitle: string, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'ielts_essay_graded',
      eventCategory: 'study',
      title: `IELTS graded: ${taskTitle}`,
      context: {
        score: score,
      },
      metadata,
    });
  }

  /**
   * Log a flashcard reviewed with SM-2
   */
  async logIeltsVocabReviewed(userId: string, word: string, quality: number, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'ielts_vocab_reviewed',
      eventCategory: 'study',
      title: `Vocab: ${word}`,
      context: {
        quality: quality,
      },
      metadata,
    });
  }

  /**
   * Log a finance transaction
   */
  async logFinanceTransaction(userId: string, transactionTitle: string, amount: number, type: 'income' | 'expense', metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'finance_transaction',
      eventCategory: 'finance',
      title: transactionTitle,
      context: {
        amount: amount,
        type: type,
      },
      metadata,
    });
  }

  /**
   * Log a budget check
   */
  async logBudgetCheck(userId: string, category: string, allocated: number, spent: number, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'budget_check',
      eventCategory: 'finance',
      title: `Budget check: ${category}`,
      context: {
        allocated: allocated,
        spent: spent,
        category: category,
      },
      metadata,
    });
  }

  /**
   * Log a savings goal update
   */
  async logSavingsGoalUpdate(userId: string, goalName: string, targetAmount: number, currentAmount: number, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'savings_goal_update',
      eventCategory: 'finance',
      title: `Savings: ${goalName}`,
      context: {
        target_amount: targetAmount,
        current_amount: currentAmount,
      },
      metadata,
    });
  }

  /**
   * Log a goal creation
   */
  async logGoalCreated(userId: string, goalTitle: string, goalId: string, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'goal_created',
      eventCategory: 'goals',
      title: goalTitle,
      context: {
        goal_id: goalId,
      },
      metadata,
    });
  }

  /**
   * Log a goal progress update
   */
  async logGoalProgress(userId: string, goalId: string, progress: number, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'goal_progress',
      eventCategory: 'goals',
      title: 'Goal progress update',
      context: {
        goal_id: goalId,
        progress: progress,
      },
      metadata,
    });
  }

  /**
   * Log a goal completion
   */
  async logGoalCompleted(userId: string, goalTitle: string, goalId: string, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'goal_completed',
      eventCategory: 'goals',
      title: goalTitle,
      context: {
        goal_id: goalId,
      },
      metadata,
    });
  }

  /**
   * Log a weekly review start
   */
  async logWeeklyReviewStarted(userId: string, weekStart: string, weekEnd: string, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'weekly_review_started',
      eventCategory: 'goals',
      title: `Weekly review: ${weekStart} - ${weekEnd}`,
      context: {
        week_start: weekStart,
        week_end: weekEnd,
      },
      metadata,
    });
  }

  /**
   * Log a weekly review completion
   */
  async logWeeklyReviewCompleted(userId: string, wins: string[], challenges: string[], lessons: string[], metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'weekly_review_completed',
      eventCategory: 'goals',
      title: 'Weekly review completed',
      context: {
        wins: wins || [],
        challenges: challenges || [],
        lessons_learned: lessons || [],
      },
      metadata,
    });
  }

  /**
   * Log a kaizen improvement
   */
  async logKaizenImprovement(userId: string, improvementTitle: string, category: string, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'kaizen_improvement',
      eventCategory: 'productivity',
      title: improvementTitle,
      context: {
        category: category,
      },
      metadata,
    });
  }

  /**
   * Log a life score calculation
   */
  async logLifeScoreCalculated(userId: string, score: number, breakdown: any, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'life_score_calculated',
      eventCategory: 'productivity',
      title: `Life Score: ${score}`,
      context: {
        score: score,
        breakdown: breakdown,
      },
      metadata,
    });
  }

  /**
   * Log an achievement earned
   */
  async logAchievementEarned(userId: string, achievementId: string, achievementTitle: string, xpEarned: number, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'achievement_earned',
      eventCategory: 'goals',
      title: achievementTitle,
      context: {
        achievement_id: achievementId,
        xp_earned: xpEarned,
      },
      metadata,
    });
  }

  /**
   * Log XP earned
   */
  async logXpEarned(userId: string, action: string, xpGained: number, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'xp_earned',
      eventCategory: 'productivity',
      title: `XP earned: ${xpGained}`,
      context: {
        action: action,
        xp_gained: xpGained,
      },
      metadata,
    });
  }

  /**
   * Log a level up
   */
  async logLevelUp(userId: string, newLevel: number, previousLevel: number, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'level_up',
      eventCategory: 'productivity',
      title: `Level up to ${newLevel}`,
      context: {
        new_level: newLevel,
        previous_level: previousLevel,
      },
      metadata,
    });
  }

  /**
   * Log a profile update
   */
  async logProfileUpdated(userId: string, changes: any, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'profile_updated',
      eventCategory: 'ai_interaction',
      title: 'Profile updated',
      metadata: changes,
    });
  }

  /**
   * Log an AI insight generated
   */
  async logAiInsightGenerated(userId: string, insightTitle: string, insightType: string, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'ai_insight_generated',
      eventCategory: 'ai_interaction',
      title: insightTitle,
      context: {
        insight_type: insightType,
      },
      metadata,
    });
  }

  /**
   * Log a Telegram message received
   */
  async logTelegramMessageReceived(userId: string, messageText: string, messageType: 'text' | 'voice', metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'telegram_message_received',
      eventCategory: 'telegram',
      title: 'Telegram message received',
      context: {
        message_type: messageType,
        message_length: messageText.length,
      },
      metadata: {
        message_preview: messageText.substring(0, 100),
      },
    });
  }

  /**
   * Log a Telegram voice transcribed
   */
  async logTelegramVoiceTranscribed(userId: string, transcribedText: string, metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'telegram_voice_transcribed',
      eventCategory: 'telegram',
      title: 'Voice message transcribed',
      context: {
        transcribed_length: transcribedText.length,
      },
      metadata: {
        transcribed_text: transcribedText.substring(0, 200),
      },
    });
  }

  /**
   * Log a Telegram command executed
   */
  async logTelegramCommandExecuted(userId: string, command: string, args: string[], metadata?: EventMetadata) {
    return this.logEvent({
      userId,
      eventType: 'telegram_command_executed',
      eventCategory: 'telegram',
      title: `Command: ${command}`,
      context: {
        command: command,
        arg_count: args?.length || 0,
      },
      metadata,
    });
  }

  /**
   * Get events by type and date range
   */
  async getEventsByType(userId: string, eventType: EventType, startDate: Date, endDate: Date) {
    return getEventsByUserAndType(userId, eventType, startDate, endDate);
  }

  /**
   * Get events by category and date range
   */
  async getEventsByCategory(userId: string, eventCategory: EventCategory, startDate: Date, endDate: Date) {
    return getEventsByUserAndCategory(userId, eventCategory, startDate, endDate);
  }

  /**
   * Get daily events summary
   */
  async getDailySummary(userId: string, date: Date) {
    return getDailyEventsSummary(userId, date);
  }

  /**
   * Get user's events for the last N days
   */
  async getRecentEvents(userId: string, days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('events')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching recent events:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get events count by category for a period
   */
  async getEventsCountByCategory(userId: string, startDate: Date, endDate: Date) {
    const { data, error } = await this.supabase
      .from('events')
      .select('event_category')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) {
      console.error('Error fetching events count:', error);
      throw error;
    }

    // Count by category
    const counts: Record<string, number> = {};
    data?.forEach((event: any) => {
      const category = event.event_category;
      counts[category] = (counts[category] || 0) + 1;
    });

    return counts;
  }
}

export default EventService;