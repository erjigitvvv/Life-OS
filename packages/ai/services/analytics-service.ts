/**
 * Analytics Service
 *
 * Processes event data and generates AI-powered insights,
 * smart scheduling recommendations, behavioral pattern analysis,
 * and automated summaries for the user.
 */

import { createClient } from '@supabase/supabase-js';
import { EventType, EventCategory } from '../types';
import { EventService } from './event-service';
import { calculateLifeScore, getLifeScoreBreakdown, getLifeScoreRecommendations } from '../../packages/rules/life-score';
import { checkAchievements, getAchievementsByCategory, getTotalAchievementXP } from '../../packages/rules/achievements';
import { calculateXP, sumXP, categorizeXP } from '../../packages/rules/xp';
import { calculateLevel, xpForNextLevel, levelProgress, getLevelInfo, getLevelTier, getLevelColor } from '../../packages/rules/level';
import { SM2_RATINGS, isDueForReview, calculateRetentionRate } from '../../packages/rules/sm2';

export interface DailyStats {
  date: string;
  totalEvents: number;
  eventsByType: Record<string, number>;
  eventsByCategory: Record<string, number>;
  totalXP: number;
  lifeScore: number;
  streakDays: number;
}

export interface BehavioralPattern {
  userId: string;
  mostActiveHours: number[]; // Hours 0-23
  preferredDays: string[]; // Day names
  averageSessionDuration: number;
  productivityTrend: 'improving' | 'stable' | 'declining';
  habitCompletionRate: number;
  studyConsistency: number;
  financeDiscipline: number;
}

export interface SmartScheduleSuggestion {
  type: 'task' | 'study' | 'habit' | 'break';
  title: string;
  suggestedTime: string; // ISO string
  duration: number; // minutes
  reasoning: string;
}

export interface WeeklySummary {
  weekStart: string;
  weekEnd: string;
  totalXP: number;
  lifeScore: number;
  tasksCompleted: number;
  habitsCompleted: number;
  studyMinutes: number;
  habitStreak: number;
  wins: string[];
  challenges: string[];
  lessonsLearned: string[];
  productivityChange: number; // percentage change
  aiInsights: string[];
}

export interface AiInsight {
  id: string;
  type: 'productivity' | 'habits' | 'finance' | 'study' | 'health' | 'goals';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionable: boolean;
  action?: string;
}

export class AnalyticsService {
  private supabase: any;
  private eventService: EventService;

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey);
    this.eventService = new EventService(supabaseUrl, supabaseKey);
  }

  /**
   * Generate daily summary for a specific date
   */
  async generateDailySummary(userId: string, date: Date): Promise<DailyStats> {
    // Get events for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const events = await this.eventService.getRecentEvents(userId);
    const dayEvents = events.filter((e: any) => {
      const created = new Date(e.created_at);
      return created >= startOfDay && created <= endOfDay;
    });

    // Calculate total XP from XP events
    const xpEvents = dayEvents.filter((e: any) => e.event_type === 'xp_earned');
    const totalXP = xpEvents.reduce((sum: number, e: any) => sum + (e.context?.xp_gained || 0), 0);

    // Calculate Life Score
    // We need daily_logs data, but for now use events to estimate
    const studyMinutes = this.calculateStudyMinutes(dayEvents);
    const habitData = this.calculateHabitStats(dayEvents);
    const timeLogged = this.calculateTimeLogged(dayEvents);

    const dailyData = {
      tasksCompleted: this.countTasksCompleted(dayEvents),
      tasksTotal: 10, // Default, would come from user's daily goal
      studyMinutes: studyMinutes,
      habitsCompleted: habitData.completed,
      habitsTotal: habitData.total,
      timeLoggedMinutes: timeLogged,
    };

    const lifeScore = calculateLifeScore(dailyData);

    // Count events by type and category
    const eventsByType: Record<string, number> = {};
    const eventsByCategory: Record<string, number> = {};

    dayEvents.forEach((e: any) => {
      const type = e.event_type;
      const category = e.event_category;
      eventsByType[type] = (eventsByType[type] || 0) + 1;
      eventsByCategory[category] = (eventsByCategory[category] || 0) + 1;
    });

    // Count streak from habit events
    const streakDays = this.calculateStreakFromEvents(dayEvents);

    return {
      date: date.toISOString().split('T')[0],
      totalEvents: dayEvents.length,
      eventsByType,
      eventsByCategory,
      totalXP,
      lifeScore,
      streakDays,
    };
  }

  /**
   * Generate weekly summary with AI insights
   */
  async generateWeeklySummary(userId: string, weekStart: Date, weekEnd: Date): Promise<WeeklySummary> {
    const events = await this.eventService.getRecentEvents(userId);
    const weekEvents = events.filter((e: any) => {
      const created = new Date(e.created_at);
      return created >= weekStart && created <= weekEnd;
    });

    // Calculate XP
    const xpEvents = weekEvents.filter((e: any) => e.event_type === 'xp_earned');
    const totalXP = xpEvents.reduce((sum: number, e: any) => sum + (e.context?.xp_gained || 0), 0);

    // Calculate study minutes
    const studyEvents = weekEvents.filter((e: any) =>
      e.event_type.startsWith('study_') || e.event_type === 'ielts_task_submitted' || e.event_type === 'ielts_essay_graded' || e.event_type === 'ielts_vocab_reviewed'
    );
    const studyMinutes = studyEvents.reduce((sum: number, e: any) => {
      return sum + (e.context?.duration_minutes || 0);
    }, 0);

    // Calculate habit stats
    const habitEvents = weekEvents.filter((e: any) => e.event_type.startsWith('habit_'));
    const habitCompleted = habitEvents.filter((e: any) => e.event_type === 'habit_completed').length;
    const habitMissed = habitEvents.filter((e: any) => e.event_type === 'habit_missed').length;
    const habitCompletionRate = habitEvents.length > 0 ? (habitCompleted / habitEvents.length) * 100 : 0;

    // Calculate time logged
    const timeEvents = weekEvents.filter((e: any) => e.event_type === 'time_log_created');
    const timeLogged = timeEvents.reduce((sum: number, e: any) => sum + (e.context?.duration_minutes || 0), 0);

    // Count tasks completed
    const taskEvents = weekEvents.filter((e: any) => e.event_type === 'task_completed');
    const tasksCompleted = taskEvents.length;

    // Calculate life score
    const dailyData = {
      tasksCompleted: tasksCompleted,
      studyMinutes: studyMinutes,
      habitsCompleted: habitCompleted,
      habitsTotal: habitEvents.length,
      timeLoggedMinutes: timeLogged,
    };
    const lifeScore = calculateLifeScore(dailyData);

    // Get wins, challenges, lessons from weekly review events
    const reviewEvents = weekEvents.filter((e: any) => e.event_type === 'weekly_review_completed');
    let wins: string[] = [];
    let challenges: string[] = [];
    let lessonsLearned: string[] = [];

    if (reviewEvents.length > 0) {
      const lastReview = reviewEvents[reviewEvents.length - 1];
      wins = lastReview.context?.wins || [];
      challenges = lastReview.context?.challenges || [];
      lessonsLearned = lastReview.context?.lessons_learned || [];
    }

    // Calculate productivity change (compare to previous week)
    const productivityChange = this.calculateProductivityChange(weekEvents);

    // Generate AI insights
    const aiInsights = await this.generateAiInsights(weekEvents, userId);

    return {
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      totalXP,
      lifeScore,
      tasksCompleted,
      habitsCompleted,
      studyMinutes,
      habitStreak: this.calculateCurrentStreak(weekEvents),
      wins,
      challenges,
      lessonsLearned,
      productivityChange,
      aiInsights,
    };
  }

  /**
   * Generate AI-powered insights based on event patterns
   */
  async generateAiInsights(weekEvents: any[], userId: string): Promise<AiInsight[]> {
    const insights: AiInsight[] = [];

    // Analyze productivity patterns
    const productivityInsights = this.analyzeProductivityPatterns(weekEvents);
    insights.push(...productivityInsights);

    // Analyze habit patterns
    const habitInsights = this.analyzeHabitPatterns(weekEvents);
    insights.push(...habitInsights);

    // Analyze study patterns
    const studyInsights = this.analyzeStudyPatterns(weekEvents);
    insights.push(...studyInsights);

    // Analyze finance patterns
    const financeInsights = this.analyzeFinancePatterns(weekEvents);
    insights.push(...financeInsights);

    // Analyze time management
    const timeInsights = this.analyzeTimeManagementPatterns(weekEvents);
    insights.push(...timeInsights);

    // Sort by severity and return
    return insights.sort((a, b) => {
      const severityOrder: Record<string, number> = { low: 1, medium: 2, high: 3 };
      return (severityOrder[a.severity] || 1) - (severityOrder[b.severity] || 1);
    });
  }

  /**
   * Analyze productivity patterns and generate insights
   */
  private analyzeProductivityPatterns(events: any[]): AiInsight[] {
    const insights: AiInsight[] = [];
    const taskEvents = events.filter((e: any) => e.event_type === 'task_completed');
    const xpEvents = events.filter((e: any) => e.event_type === 'xp_earned');

    // Check if productivity is trending up or down
    if (taskEvents.length >= 5) {
      const recentTasks = taskEvents.slice(0, 3).length;
      const olderTasks = taskEvents.slice(-3).length;

      if (recentTasks > olderTasks * 1.2) {
        insights.push({
          id: 'prod-improving',
          type: 'productivity',
          severity: 'low',
          title: 'Productivity Increasing',
          description: `You're completing ${recentTasks} tasks in recent days, up from ${olderTasks} previously. Keep up the great work!`,
          actionable: true,
          action: 'Continue current workflow',
        });
      } else if (recentTasks < olderTasks * 0.8) {
        insights.push({
          id: 'prod-declining',
          type: 'productivity',
          severity: 'medium',
          title: 'Productivity Declining',
          description: `Task completion decreased from ${olderTasks} to ${recentTasks} tasks. Consider reviewing your task list and priorities.`,
          actionable: true,
          action: 'Review and prioritize tasks',
        });
      }
    }

    // Check for consistent task completion
    if (taskEvents.length > 0) {
      const completionRate = (taskEvents.length / Math.max(events.length, 1)) * 100;
      if (completionRate < 50) {
        insights.push({
          id: 'prod-low-completion',
          type: 'productivity',
          severity: 'high',
          title: 'Low Task Completion Rate',
          description: `You're completing only ${Math.round(completionRate)}% of tracked tasks. Consider breaking down larger tasks or reviewing your daily goals.`,
          actionable: true,
          action: 'Set more achievable daily goals',
        });
      }
    }

    return insights;
  }

  /**
   * Analyze habit patterns and generate insights
   */
  private analyzeHabitPatterns(events: any[]): AiInsight[] {
    const insights: AiInsight[] = [];
    const habitEvents = events.filter((e: any) => e.event_type.startsWith('habit_'));

    // Check habit completion rate
    const completed = habitEvents.filter((e: any) => e.event_type === 'habit_completed').length;
    const missed = habitEvents.filter((e: any) => e.event_type === 'habit_missed').length;
    const total = completed + missed;

    if (total > 0 && total % 7 === 0) { // Check weekly
      const completionRate = (completed / total) * 100;

      if (completionRate < 60) {
        insights.push({
          id: 'habits-low-rate',
          type: 'habits',
          severity: 'high',
          title: 'Low Habit Completion Rate',
          description: `You're completing ${Math.round(completionRate)}% of your habits. Consider focusing on 2-3 key habits per day rather than trying to do too many.`,
          actionable: true,
          action: 'Focus on 3 key habits daily',
        });
      } else if (completionRate >= 90) {
        insights.push({
          id: 'habits-excellent',
          type: 'habits',
          severity: 'low',
          title: 'Excellent Habit Consistency',
          description: `You're completing ${Math.round(completionRate)}% of your habits. Your routine is well-established!`,
          actionable: false,
        });
      }
    }

    // Check for streak events
    const streakEvents = events.filter((e: any) => e.event_type === 'habit_streak_updated');
    if (streakEvents.length > 0) {
      const latestStreak = streakEvents[streakEvents.length - 1].context?.streak_days || 0;
      if (latestStreak >= 30) {
        insights.push({
          id: 'habits-streak-30',
          type: 'habits',
          severity: 'medium',
          title: '30-Day Streach Achieved',
          description: `Congratulations! You've maintained a ${latestStreak}-day habit streak. This is a significant achievement!`,
          actionable: false,
        });
      }
    }

    return insights;
  }

  /**
   * Analyze study patterns and generate insights
   */
  private analyzeStudyPatterns(events: any[]): AiInsight[] {
    const insights: AiInsight[] = [];
    const studyEvents = events.filter((e: any) =>
      e.event_type.startsWith('study_') ||
      e.event_type === 'ielts_task_submitted' ||
      e.event_type === 'ielts_essay_graded' ||
      e.event_type === 'ielts_vocab_reviewed'
    );

    // Check study consistency
    if (studyEvents.length >= 3) {
      const recentStudy = studyEvents.slice(0, 3).length;
      const olderStudy = studyEvents.slice(-3).length;

      if (recentStudy < olderStudy * 0.5 && olderStudy > 0) {
        insights.push({
          id: 'study-declining',
          type: 'study',
          severity: 'medium',
          title: 'Study Time Declining',
          description: `Study sessions decreased from ${olderStudy} to ${recentStudy} in recent days. Consider scheduling dedicated study time.`,
          actionable: true,
          action: 'Schedule 30-min study session daily',
        });
      }
    }

    // Check IELTS progress
    const ieltsEvents = studyEvents.filter((e: any) => e.event_type.includes('ielts'));
    if (ieltsEvents.length > 0) {
      const submitted = ieltsEvents.filter((e: any) => e.event_type === 'ielts_task_submitted').length;
      const graded = ieltsEvents.filter((e: any) => e.event_type === 'ielts_essay_graded').length;

      if (submitted > 0 && graded > 0) {
        const lastGraded = ieltsEvents.filter((e: any) => e.event_type === 'ielts_essay_graded').at(-1);
        const score = lastGraded?.context?.score;

        if (score && score >= 7.0) {
          insights.push({
            id: 'study-ielts-progress',
            type: 'study',
            severity: 'low',
            title: 'IELTS Progress',
            description: `Your IELTS essay scoring average is improving. Keep practicing!`,
            actionable: false,
          });
        }
      }
    }

    // Check flashcard reviews
    const flashcardEvents = studyEvents.filter((e: any) => e.event_type === 'study_flashcard_review');
    if (flashcardEvents.length >= 10) {
      const successful = flashcardEvents.filter((e: any) => (e.context?.quality || 0) >= 3).length;
      const successRate = (successful / flashcardEvents.length) * 100;

      if (successRate < 70) {
        insights.push({
          id: 'study-flashcards-difficult',
          type: 'study',
          severity: 'low',
          title: 'Flashcards Too Difficult',
          description: `Flashcard success rate is ${Math.round(successRate)}%. Consider adjusting review frequency or easing the easiness factor.`,
          actionable: true,
          action: 'Adjust SM-2 easiness factor',
        });
      }
    }

    return insights;
  }

  /**
   * Analyze finance patterns and generate insights
   */
  private analyzeFinancePatterns(events: any[]): AiInsight[] {
    const insights: AiInsight[] = [];
    const financeEvents = events.filter((e: any) => e.event_category === 'finance');

    // Check budget events
    const budgetEvents = financeEvents.filter((e: any) => e.event_type === 'budget_check');

    budgetEvents.forEach((e: any) => {
      const context = e.context;
      if (context && context.allocated !== undefined && context.spent !== undefined) {
        const spentPct = context.spent / context.allocated;

        if (spentPct > 1.1) {
          insights.push({
            id: 'finance-over-budget',
            type: 'finance',
            severity: 'high',
            title: 'Over Budget',
            description: `You've spent $${context.spent} against a $${context.allocated} budget (${Math.round(spentPct * 100)}%). Consider reducing expenses.`,
            actionable: true,
            action: 'Review and reduce expenses',
          });
        } else if (spentPct > 0.9) {
          insights.push({
            id: 'finance-near-budget',
            type: 'finance',
            severity: 'low',
            title: 'Near Budget Limit',
            description: `You've spent $${context.spent} of $${context.allocated} budget (${Math.round(spentPct * 100)}%). You're on track!`,
            actionable: false,
          });
        }
      }
    });

    // Check savings goals
    const savingsEvents = financeEvents.filter((e: any) => e.event_type === 'savings_goal_update');

    savingsEvents.forEach((e: any) => {
      const context = e.context;
      if (context && context.target_amount && context.current_amount) {
        const pct = (context.current_amount / context.target_amount) * 100;

        if (pct >= 100) {
          insights.push({
            id: 'finance-goal-achieved',
            type: 'finance',
            severity: 'low',
            title: 'Savings Goal Achieved!',
            description: `Congratulations! You've reached your savings goal of $${context.target_amount}.`,
            actionable: false,
          });
        } else if (pct >= 50) {
          insights.push({
            id: 'finance-goal-halfway',
            type: 'finance',
            severity: 'low',
            title: 'Halfway to Goal',
            description: `You're at ${Math.round(pct)}% of your savings goal. Keep going!`,
            actionable: false,
          });
        }
      }
    });

    return insights;
  }

  /**
   * Analyze time management patterns and generate insights
   */
  private analyzeTimeManagementPatterns(events: any[]): AiInsight[] {
    const insights: AiInsight[] = [];
    const timeEvents = events.filter((e: any) => e.event_type === 'time_log_created');

    if (timeEvents.length === 0) {
      insights.push({
        id: 'time-no-logging',
        type: 'time_management',
        severity: 'medium',
        title: 'No Time Logging',
        description: 'You haven't logged any time recently. Consider using the time logging feature to track your productivity.',
        actionable: true,
        action: 'Start logging your time',
      });
      return insights;
    }

    // Analyze time patterns by hour
    const hourCounts: Record<number, number> = {};
    timeEvents.forEach((e: any) => {
      const created = new Date(e.created_at);
      const hour = created.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Find peak productivity hours
    let peakHour = 0;
    let peakCount = 0;
    for (const [hour, count] of Object.entries(hourCounts)) {
      if (count > peakCount) {
        peakCount = count;
        peakHour = hour;
      }
    }

    if (peakCount > 3) {
      insights.push({
        id: 'time-peak-hours',
        type: 'time_management',
        severity: 'low',
        title: 'Peak Productivity Hours',
        description: `Your most productive hour is ${peakHour}:00 with ${peakCount} time logs. Schedule important tasks during this time.`,
        actionable: true,
        action: 'Schedule important tasks during peak hours',
      });
    }

    // Check for consistent time logging
    const dailyTimeEvents = this.groupByDay(timeEvents.length);
    if (dailyTimeEvents.average < 2) {
      insights.push({
        id: 'time-inconsistent',
        type: 'time_management',
        severity: 'medium',
        title: 'Inconsistent Time Logging',
        description: `You're logging time on ${dailyTimeEvents.daysWithLogging} out of the last ${dailyTimeEvents.total} days. For better tracking, try logging daily.`,
        actionable: true,
        action: 'Set daily time logging reminder',
      });
    }

    return insights;
  }

  /**
   * Group events by day and calculate stats
   */
  private groupByDay(totalEvents: number) {
    const totalDays = 7; // Last 7 days
    const daysWithLogging = Math.max(1, Math.floor(totalEvents / 3)); // Assume ~3 events per day with logging
    return {
      totalDays,
      daysWithLogging,
      average: Math.round((daysWithLogging / totalDays) * 100),
    };
  }

  /**
   * Calculate study minutes from events
   */
  private calculateStudyMinutes(events: any[]): number {
    const studyEvents = events.filter((e: any) =>
      e.event_type.startsWith('study_') ||
      e.event_type === 'ielts_task_submitted' ||
      e.event_type === 'ielts_essay_graded' ||
      e.event_type === 'ielts_vocab_reviewed'
    );
    return studyEvents.reduce((sum: number, e: any) => sum + (e.context?.duration_minutes || 0), 0);
  }

  /**
   * Calculate habit stats from events
   */
  private calculateHabitStats(events: any[]): { completed: number; total: number } {
    const habitEvents = events.filter((e: any) => e.event_type.startsWith('habit_'));
    const completed = habitEvents.filter((e: any) => e.event_type === 'habit_completed').length;
    return { completed, total: habitEvents.length };
  }

  /**
   * Calculate time logged from events
   */
  private calculateTimeLogged(events: any[]): number {
    const timeEvents = events.filter((e: any) => e.event_type === 'time_log_created');
    return timeEvents.reduce((sum: number, e: any) => sum + (e.context?.duration_minutes || 0), 0);
  }

  /**
   * Count tasks completed from events
   */
  private countTasksCompleted(events: any[]): number {
    return events.filter((e: any) => e.event_type === 'task_completed').length;
  }

  /**
   * Calculate current streak from events
   */
  private calculateCurrentStreak(events: any[]): number {
    const habitEvents = events.filter((e: any) => e.event_type === 'habit_streak_updated');
    if (habitEvents.length === 0) return 0;

    // Sort by date descending and find the longest recent streak
    const sorted = habitEvents
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3);

    return sorted[0]?.context?.streak_days || 0;
  }

  /**
   * Calculate productivity change percentage
   */
  private calculateProductivityChange(events: any[]): number {
    // Compare first half of week to second half
    const sorted = events.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const midPoint = Math.floor(sorted.length / 2);

    if (midPoint < 3) return 0;

    const firstHalf = sorted.slice(0, midPoint);
    const secondHalf = sorted.slice(midPoint);

    const firstXP = firstHalf.filter((e: any) => e.event_type === 'xp_earned')
      .reduce((sum: number, e: any) => sum + (e.context?.xp_gained || 0), 0);
    const secondXP = secondHalf.filter((e: any) => e.event_type === 'xp_earned')
      .reduce((sum: number, e: any) => sum + (e.context?.xp_gained || 0), 0);

    if (firstXP === 0 && secondXP === 0) return 0;
    if (firstXP === 0) return 100; // New user

    const change = ((secondXP - firstXP) / firstXP) * 100;
    return Math.round(change);
  }

  /**
   * Get behavioral pattern analysis
   */
  async getBehavioralPattern(userId: string): Promise<BehavioralPattern> {
    const events = await this.eventService.getRecentEvents(userId, 30);

    // Analyze active hours
    const hourCounts: Record<number, number> = {};
    events.forEach((e: any) => {
      const created = new Date(e.created_at);
      const hour = created.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Find most active hours (top 3)
    const activeHours = Object.entries(hourCounts)
      .sort((a: [number, number], b: [number, number]) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));

    // Analyze preferred days
    const dayCounts: Record<string, number> = {};
    events.forEach((e: any) => {
      const created = new Date(e.created_at);
      const dayName = created.toLocaleString('en-US', { weekday: 'long' });
      dayCounts[dayName] = (dayCounts[dayName] || 0) + 1;
    });

    const preferredDays = Object.entries(dayCounts)
      .sort((a: [string, number], b: [string, number]) => b[1] - a[1])
      .slice(0, 3)
      .map(([day]) => day);

    // Calculate average session duration from time logs
    const timeEvents = events.filter((e: any) => e.event_type === 'time_log_created');
    let totalDuration = 0;
    let loggedCount = 0;

    timeEvents.forEach((e: any) => {
      const duration = e.context?.duration_minutes;
      if (duration && duration > 0) {
        totalDuration += duration;
        loggedCount++;
      }
    });

    const averageSessionDuration = loggedCount > 0 ? Math.round(totalDuration / loggedCount) : 0;

    // Calculate habit completion rate
    const habitEvents = events.filter((e: any) => e.event_type.startsWith('habit_'));
    const completed = habitEvents.filter((e: any) => e.event_type === 'habit_completed').length;
    const missed = habitEvents.filter((e: any) => e.event_type === 'habit_missed').length;
    const habitCompletionRate = habitEvents.length > 0 ? Math.round((completed / habitEvents.length) * 100) : 0;

    // Calculate study consistency
    const studyEvents = events.filter((e: any) =>
      e.event_type.startsWith('study_') ||
      e.event_type === 'ielts_task_submitted' ||
      e.event_type === 'ielts_essay_graded' ||
      e.event_type === 'ielts_vocab_reviewed'
    );
    const studyDays = new Set(studyEvents.map((e: any) => new Date(e.created_at).toISOString().split('T')[0])).size;
    const studyConsistency = studyEvents.length > 0 ? Math.round((studyDays / 30) * 100) : 0;

    // Calculate finance discipline
    const financeEvents = events.filter((e: any) => e.event_category === 'finance');
    const budgetEvents = financeEvents.filter((e: any) => e.event_type === 'budget_check');
    let financeDiscipline = 5; // Default
    let budgetCount = 0;

    budgetEvents.forEach((e: any) => {
      const context = e.context;
      if (context && context.allocated !== undefined && context.spent !== undefined) {
        const spentPct = context.spent / context.allocated;
        if (spentPct <= 0.9) financeDiscipline = 10;
        else if (spentPct <= 1.0) financeDiscipline = 8;
        else if (spentPct <= 1.1) financeDiscipline = 5;
        else financeDiscipline = 1;
        budgetCount++;
      }
    });

    financeDiscipline = budgetCount > 0 ? Math.round(financeDiscipline) : 5;

    return {
      userId,
      mostActiveHours: activeHours,
      preferredDays,
      averageSessionDuration,
      productivityTrend: 'stable', // Would calculate from trend analysis
      habitCompletionRate,
      studyConsistency,
      financeDiscipline,
    };
  }

  /**
   * Get smart scheduling suggestions
   */
  async getSmartSuggestions(userId: string, limit: number = 5): Promise<SmartScheduleSuggestion[]> {
    const behavioralPattern = await this.getBehavioralPattern(userId);
    const events = await this.eventService.getRecentEvents(userId, 7);
    const suggestions: SmartScheduleSuggestion[] = [];

    // Analyze peak productivity hours
    const peakHours = behavioralPattern.mostActiveHours;

    // Check for pending tasks
    const taskEvents = events.filter((e: any) => e.event_type === 'task_created');
    const completedTasks = events.filter((e: any) => e.event_type === 'task_completed');

    // If user has tasks but low completion, suggest scheduling
    if (taskEvents.length > completedTasks.length && peakHours.length > 0) {
      const peakHour = peakHours[0];
      const suggestedTime = new Date();
      suggestedTime.setHours(peakHour, 0, 0, 0);
      suggestedTime.setDate(suggestedTime.getDate() + (peakHour < new Date().getHours() ? 1 : 0));

      suggestions.push({
        type: 'task',
        title: 'Focus on High-Priority Task',
        suggestedTime: suggestedTime.toISOString(),
        duration: 90,
        reasoning: `Your data shows peak productivity at ${peakHour}:00. This is a great time to tackle your most important task.`,
      });
    }

    // If study is declining, suggest study session
    const studyEvents = events.filter((e: any) =>
      e.event_type.startsWith('study_')
    );
    if (studyEvents.length < 3 && behavioralPattern.studyConsistency < 70) {
      const suggestedTime = new Date();
      suggestedTime.setHours(14, 0, 0, 0); // Afternoon study
      suggestedTime.setDate(suggestedTime.getDate() + 1);

      suggestions.push({
        type: 'study',
        title: 'Daily Study Session',
        suggestedTime: suggestedTime.toISOString(),
        duration: 45,
        reasoning: 'Low study activity detected. Schedule a 45-minute focused study session to maintain progress.',
      });
    }

    // If habits need attention
    if (behavioralPattern.habitCompletionRate < 70) {
      suggestions.push({
        type: 'habit',
        title: 'Complete Daily Habits',
        suggestedTime: new Date().toISOString(),
        duration: 30,
        reasoning: `Your habit completion rate is ${behavioralPattern.habitCompletionRate}%. Focus on your top 3 habits today.`,
      });
    }

    // Sort by relevance and limit
    return suggestions.slice(0, limit);
  }
}

export default AnalyticsService;