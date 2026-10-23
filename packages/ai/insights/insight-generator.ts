/**
 * AI Insight Generator
 *
 * Processes event data from the tracking system and generates
 * personalized AI insights, recommendations, and smart scheduling.
 */

import { EventService } from '../services/event-service';
import { AnalyticsService } from '../services/analytics-service';
import { calculateLifeScore, getLifeScoreBreakdown, getLifeScoreRecommendations } from '../../packages/rules/life-score';
import { checkAchievements, getAchievementsByCategory } from '../../packages/rules/achievements';
import { calculateLevel, xpForNextLevel, levelProgress } from '../../packages/rules/level';
import { SM2_RATINGS, isDueForReview, calculateRetentionRate } from '../../packages/rules/sm2';
import OpenAI from 'openai';

export interface Insight {
  id: string;
  type: 'productivity' | 'habits' | 'finance' | 'study' | 'health' | 'goals' | 'time_management';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  actionable: boolean;
  action?: string;
  suggestedAt: Date;
}

export interface SmartSchedule {
  title: string;
  description: string;
  suggestedTime: string; // ISO 8601
  durationMinutes: number;
  priority: 'low' | 'medium' | 'high';
  reasoning: string;
}

export interface DailyRecommendation {
  date: string;
  lifeScore: number;
  recommendations: string[];
  focusAreas: string[];
}

export class InsightGenerator {
  private eventService: EventService;
  private openai: OpenAI;

  constructor(eventService: EventService, openAiKey: string) {
    this.eventService = eventService;
    this.openai = new OpenAI({ apiKey: openAiKey });
  }

  /**
   * Generate personalized daily recommendation
   */
  async generateDailyRecommendation(userId: string, date: Date): Promise<DailyRecommendation> {
    // Get events for the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const allEvents = await this.eventService.getRecentEvents(userId, 30);
    const dayEvents = allEvents.filter((e: any) => {
      const created = new Date(e.created_at);
      return created >= startOfDay && created <= endOfDay;
    });

    // Calculate life score
    const habitData = this.calculateHabitStats(dayEvents);
    const studyMinutes = this.calculateStudyMinutes(dayEvents);
    const timeLogged = this.calculateTimeLogged(dayEvents);
    const tasksCompleted = this.countTasksCompleted(dayEvents);

    const dailyData = {
      tasksCompleted,
      studyMinutes,
      habitsCompleted: habitData.completed,
      habitsTotal: habitData.total,
      timeLoggedMinutes: timeLogged,
    };

    const lifeScore = calculateLifeScore(dailyData);
    const recommendations = getLifeScoreRecommendations(dailyData);
    const focusAreas = this.identifyFocusAreas(dailyData, lifeScore);

    return {
      date: date.toISOString().split('T')[0],
      lifeScore,
      recommendations,
      focusAreas,
    };
  }

  /**
   * Generate weekly AI insights
   */
  async generateWeeklyInsights(userId: string, weekStart: Date, weekEnd: Date): Promise<Insight[]> {
    const allEvents = await this.eventService.getRecentEvents(userId, 30);
    const weekEvents = allEvents.filter((e: any) => {
      const created = new Date(e.created_at);
      return created >= weekStart && created <= weekEnd;
    });

    const insights: Insight[] = [];

    // 1. Productivity insights
    const productivityInsights = this.analyzeProductivity(weekEvents);
    insights.push(...productivityInsights);

    // 2. Habit insights
    const habitInsights = this.analyzeHabits(weekEvents);
    insights.push(...habitInsights);

    // 3. Study insights
    const studyInsights = this.analyzeStudy(weekEvents);
    insights.push(...studyInsights);

    // 4. Finance insights
    const financeInsights = this.analyzeFinance(weekEvents);
    insights.push(...financeInsights);

    // 5. Time management insights
    const timeManagementInsights = this.analyzeTimeManagement(weekEvents);
    insights.push(...timeManagementInsights);

    // 6. Goal insights
    const goalInsights = this.analyzeGoals(weekEvents);
    insights.push(...goalInsights);

    // Sort by severity and recency
    return insights
      .sort((a: Insight, b: Insight) => {
        const severityOrder: Record<string, number> = { low: 1, medium: 2, high: 3 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      })
      .slice(0, 10); // Top 10 insights
  }

  /**
   * Get smart scheduling suggestions
   */
  async getSmartSuggestions(userId: string, count: number = 5): Promise<SmartSchedule[]> {
    const allEvents = await this.eventService.getRecentEvents(userId, 7);
    const suggestions: SmartSchedule[] = [];
    const behavioralPattern = this.analyzeBehavioralPattern(allEvents);

    // Find peak productivity hours
    const peakHours = behavioralPattern.mostActiveHours;

    // Check for pending/uncompleted tasks
    const taskEvents = allEvents.filter((e: any) => e.event_type === 'task_created');
    const completedTasks = allEvents.filter((e: any) => e.event_type === 'task_completed');

    // Suggestion 1: If user has tasks but low completion, schedule during peak hours
    if (taskEvents.length > completedTasks.length && peakHours.length > 0) {
      const peakHour = peakHours[0];
      const now = new Date();
      const suggestedDate = new Date();

      // Schedule for tomorrow if peak hour already passed today
      suggestedDate.setHours(peakHour, 0, 0, 0);
      if (suggestedDate <= now) {
        suggestedDate.setDate(suggestedDate.getDate() + 1);
      }

      suggestions.push({
        title: 'High-Priority Task Session',
        description: 'Focus on your most important pending task',
        suggestedTime: suggestedDate.toISOString(),
        durationMinutes: 90,
        priority: 'high',
        reasoning: `Your data shows peak productivity at ${peakHour}:00. Schedule your hardest task during this window.`,
      });
    }

    // Suggestion 2: Study session if consistency is low
    const studyEvents = allEvents.filter((e: any) =>
      e.event_type.startsWith('study_')
    );
    if (studyEvents.length < 3 && behavioralPattern.studyConsistency < 70) {
      const suggestedDate = new Date();
      suggestedDate.setHours(14, 0, 0, 0); // 2 PM
      suggestedDate.setDate(suggestedDate.getDate() + 1);

      suggestions.push({
        title: 'Daily Study Session',
        description: 'Maintain your learning progress',
        suggestedTime: suggestedDate.toISOString(),
        durationMinutes: 45,
        priority: 'medium',
        reasoning: 'Low study activity detected. Schedule a focused 45-minute session.',
      });
    }

    // Suggestion 3: Habit reminder if completion is low
    const habitEvents = allEvents.filter((e: any) => e.event_type.startsWith('habit_'));
    if (behavioralPattern.habitCompletionRate < 70) {
      suggestions.push({
        title: 'Complete Daily Habits',
        description: 'Focus on your top 3 habits',
        suggestedTime: new Date().toISOString(),
        durationMinutes: 30,
        priority: 'high',
        reasoning: `Your habit completion rate is ${behavioralPattern.habitCompletionRate}%. Focus on top priorities.`,
      });
    }

    // Suggestion 4: Review if week is ending
    const reviewEvents = allEvents.filter((e: any) => e.event_type === 'weekly_review_started');
    if (reviewEvents.length === 0 && new Date().getDay() === 4) { // Thursday
      suggestions.push({
        title: 'Weekly Review Preparation',
        description: 'Prepare for weekend review',
        suggestedTime: new Date().toISOString(),
        durationMinutes: 20,
        priority: 'medium',
        reasoning: 'Thursday is ideal for preparing your weekly review. Reflect on the week so far.',
      });
    }

    // Suggestion 5: Early bedtime if sleep data available
    const sleepEvents = allEvents.filter((e: any) => e.event_type === 'health_log_created');
    if (sleepEvents.length > 0 && behavioralPattern.averageSessionDuration < 240) { // Less than 4 hours average
      suggestions.push({
        title: 'Early Night',
        description: 'Prioritize rest and recovery',
        suggestedTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        durationMinutes: 8,
        priority: 'medium',
        reasoning: 'Low activity suggests you might benefit from earlier rest.',
      });
    }

    return suggestions.slice(0, count);
  }

  /**
   * Get behavioral pattern analysis
   */
  private analyzeBehavioralPattern(events: any[]) {
    // Analyze active hours
    const hourCounts: Record<number, number> = {};
    events.forEach((e: any) => {
      const created = new Date(e.created_at);
      const hour = created.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

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

    // Calculate habit completion rate
    const habitEvents = events.filter((e: any) => e.event_type.startsWith('habit_'));
    const completed = habitEvents.filter((e: any) => e.event_type === 'habit_completed').length;
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
    let financeDiscipline = 5;
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
      mostActiveHours: activeHours,
      preferredDays,
      averageSessionDuration: 0, // Would calculate from time logs
      habitCompletionRate,
      studyConsistency,
      financeDiscipline,
    };
  }

  /**
   * Analyze productivity patterns
   */
  private analyzeProductivity(events: any[]): Insight[] {
    const insights: Insight[] = [];
    const taskEvents = events.filter((e: any) => e.event_type === 'task_completed');
    const xpEvents = events.filter((e: any) => e.event_type === 'xp_earned');

    if (taskEvents.length >= 5) {
      const recentTasks = taskEvents.filter((e: any) =>
        new Date(e.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;
      const olderTasks = taskEvents.length - recentTasks;

      if (recentTasks > olderTasks * 1.2) {
        insights.push({
          id: 'insight-prod-improving',
          type: 'productivity',
          severity: 'low',
          title: 'Productivity Increasing',
          description: `Your task completion is trending upward. You completed ${recentTasks} tasks recently vs. ${olderTasks} previously.`,
          actionable: true,
          action: 'Continue current workflow',
          suggestedAt: new Date(),
        });
      } else if (recentTasks < olderTasks * 0.8) {
        insights.push({
          id: 'insight-prod-declining',
          type: 'productivity',
          severity: 'medium',
          title: 'Productivity Declining',
          description: `Task completion decreased from ${olderTasks} to ${recentTasks} tasks.`,
          actionable: true,
          action: 'Review and prioritize tasks',
          suggestedAt: new Date(),
        });
      }
    }

    // Check XP trends
    if (xpEvents.length > 0) {
      const recentXP = xpEvents
        .filter((e: any) => new Date(e.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .reduce((sum: number, e: any) => sum + (e.context?.xp_gained || 0), 0);
      const previousXP = xpEvents
        .filter((e: any) => new Date(e.created_at) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
        .reduce((sum: number, e: any) => sum + (e.context?.xp_gained || 0), 0);

      if (previousXP > 0) {
        const change = ((recentXP - previousXP) / previousXP) * 100;
        if (change > 20) {
          insights.push({
            id: 'insight-xp-surge',
            type: 'productivity',
            severity: 'low',
            title: 'XP Surge',
            description: `Your XP increased by ${Math.round(change)}% this week. Great progress!`,
            actionable: false,
            suggestedAt: new Date(),
          });
        } else if (change < -20) {
          insights.push({
            id: 'insight-xp-decline',
            type: 'productivity',
            severity: 'medium',
            title: 'XP Decline',
            description: `XP decreased by ${Math.round(Math.abs(change))}%. Consider reviewing your activities.`,
            actionable: true,
            action: 'Review weekly goals',
            suggestedAt: new Date(),
          });
        }
      }
    }

    return insights;
  }

  /**
   * Analyze habit patterns
   */
  private analyzeHabits(events: any[]): Insight[] {
    const insights: Insight[] = [];
    const habitEvents = events.filter((e: any) => e.event_type.startsWith('habit_'));

    if (habitEvents.length === 0) {
      insights.push({
        id: 'insight-no-habits',
        type: 'habits',
        severity: 'medium',
        title: 'No Habits Tracked',
        description: 'Start tracking habits to build better routines.',
        actionable: true,
        action: 'Add your first habit',
        suggestedAt: new Date(),
      });
      return insights;
    }

    const completed = habitEvents.filter((e: any) => e.event_type === 'habit_completed').length;
    const missed = habitEvents.filter((e: any) => e.event_type === 'habit_missed').length;
    const total = completed + missed;
    const completionRate = (completed / total) * 100;

    if (completionRate < 50) {
      insights.push({
        id: 'insight-habits-low-rate',
        type: 'habits',
        severity: 'high',
        title: 'Low Habit Completion',
        description: `You're completing ${Math.round(completionRate)}% of your habits. Consider focusing on 2-3 key habits daily.`,
        actionable: true,
        action: 'Focus on 3 key habits daily',
        suggestedAt: new Date(),
      });
    } else if (completionRate >= 90) {
      insights.push({
        id: 'insight-habits-excellent',
        type: 'habits',
        severity: 'low',
        title: 'Excellent Habit Consistency',
        description: `You're completing ${Math.round(completionRate)}% of your habits. Your routine is well-established!`,
        actionable: false,
        suggestedAt: new Date(),
      });
    }

    // Check for streak
    const streakEvents = events.filter((e: any) => e.event_type === 'habit_streak_updated');
    if (streakEvents.length > 0) {
      const latestStreak = streakEvents[streakEvents.length - 1].context?.streak_days || 0;
      if (latestStreak >= 30) {
        insights.push({
          id: 'insight-habits-streak-30',
          type: 'habits',
          severity: 'medium',
          title: '30-Day Streak Achieved!',
          description: `Congratulations on maintaining a ${latestStreak}-day habit streak!`,
          actionable: false,
          suggestedAt: new Date(),
        });
      } else if (latestStreak >= 7) {
        insights.push({
          id: 'insight-habits-streak-7',
          type: 'habits',
          severity: 'low',
          title: '${latestStreak}-Day Streak',
          description: `You're on a ${latestStreak}-day streak. Keep it up!`,
          actionable: false,
          suggestedAt: new Date(),
        });
      }
    }

    return insights;
  }

  /**
   * Analyze study patterns
   */
  private analyzeStudy(events: any[]): Insight[] {
    const insights: Insight[] = [];
    const studyEvents = events.filter((e: any) =>
      e.event_type.startsWith('study_') ||
      e.event_type === 'ielts_task_submitted' ||
      e.event_type === 'ielts_essay_graded' ||
      e.event_type === 'ielts_vocab_reviewed'
    );

    // Check study consistency
    if (studyEvents.length >= 3) {
      const recentStudy = studyEvents.filter((e: any) =>
        new Date(e.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length;
      const olderStudy = studyEvents.length - recentStudy;

      if (recentStudy < olderStudy * 0.5 && olderStudy > 0) {
        insights.push({
          id: 'insight-study-declining',
          type: 'study',
          severity: 'medium',
          title: 'Study Time Declining',
          description: `Study sessions decreased from ${olderStudy} to ${recentStudy}. Schedule dedicated study time.`,
          actionable: true,
          action: 'Schedule 30-min study session daily',
          suggestedAt: new Date(),
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
            id: 'insight-ielts-progress',
            type: 'study',
            severity: 'low',
            title: 'IELTS Progress',
            description: `Your IELTS essays are being graded. Keep practicing to reach band 7.0+!`,
            actionable: false,
            suggestedAt: new Date(),
          });
        }
      }
    }

    // Check flashcard effectiveness
    const flashcardEvents = studyEvents.filter((e: any) => e.event_type === 'study_flashcard_review');
    if (flashcardEvents.length >= 10) {
      const successful = flashcardEvents.filter((e: any) => (e.context?.quality || 0) >= 3).length;
      const successRate = (successful / flashcardEvents.length) * 100;

      if (successRate < 70) {
        insights.push({
          id: 'insight-flashcards-difficult',
          type: 'study',
          severity: 'low',
          title: 'Flashcards Too Difficult',
          description: `Success rate: ${Math.round(successRate)}%. Consider adjusting review frequency.`,
          actionable: true,
          action: 'Adjust SM-2 easiness factor',
          suggestedAt: new Date(),
        });
      }
    }

    return insights;
  }

  /**
   * Analyze finance patterns
   */
  private analyzeFinance(events: any[]): Insight[] {
    const insights: Insight[] = [];
    const financeEvents = events.filter((e: any) => e.event_category === 'finance');

    // Check budget status
    const budgetEvents = financeEvents.filter((e: any) => e.event_type === 'budget_check');
    budgetEvents.forEach((e: any) => {
      const context = e.context;
      if (context && context.allocated !== undefined && context.spent !== undefined) {
        const spentPct = context.spent / context.allocated;

        if (spentPct > 1.1) {
          insights.push({
            id: 'insight-finance-over-budget',
            type: 'finance',
            severity: 'high',
            title: 'Over Budget',
            description: `Spent $${context.spent} of $${context.allocated} (${Math.round(spentPct * 100)}%). Reduce expenses.`,
            actionable: true,
            action: 'Review and reduce expenses',
            suggestedAt: new Date(),
          });
        } else if (spentPct > 0.9) {
          insights.push({
            id: 'insight-finance-near-limit',
            type: 'finance',
            severity: 'low',
            title: 'Near Budget Limit',
            description: `Spent $${context.spent} of $${context.allocated} (${Math.round(spentPct * 100)}%). On track!`,
            actionable: false,
            suggestedAt: new Date(),
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
            id: 'insight-finance-goal-achieved',
            type: 'finance',
            severity: 'low',
            title: 'Savings Goal Achieved!',
            description: `Congratulations! You reached your $${context.target_amount} goal.`,
            actionable: false,
            suggestedAt: new Date(),
          });
        } else if (pct >= 50) {
          insights.push({
            id: 'insight-finance-goal-halfway',
            type: 'finance',
            severity: 'low',
            title: 'Halfway to Goal',
            description: `You're at ${Math.round(pct)}% of your goal. Keep going!`,
            actionable: false,
            suggestedAt: new Date(),
          });
        }
      }
    });

    return insights;
  }

  /**
   * Analyze time management
   */
  private analyzeTimeManagement(events: any[]): Insight[] {
    const insights: Insight[] = [];
    const timeEvents = events.filter((e: any) => e.event_type === 'time_log_created');

    if (timeEvents.length === 0) {
      insights.push({
        id: 'insight-no-time-logging',
        type: 'time_management',
        severity: 'medium',
        title: 'No Time Logging',
        description: 'Start logging your time to understand your productivity patterns.',
        actionable: true,
        action: 'Start time logging',
        suggestedAt: new Date(),
      });
      return insights;
    }

    // Analyze peak hours
    const hourCounts: Record<number, number> = {};
    timeEvents.forEach((e: any) => {
      const created = new Date(e.created_at);
      const hour = created.getHours();
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

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
        id: 'insight-time-peak-hours',
        type: 'time_management',
        severity: 'low',
        title: 'Peak Productivity Hours',
        description: `Most productive at ${peakHour}:00. Schedule important tasks then.`,
        actionable: true,
        action: 'Schedule important tasks during peak hours',
        suggestedAt: new Date(),
      });
    }

    // Check consistency
    const dailyCounts: Record<string, number> = {};
    timeEvents.forEach((e: any) => {
      const created = new Date(e.created_at);
      const day = created.toISOString().split('T')[0];
      dailyCounts[day] = (dailyCounts[day] || 0) + 1;
    });

    const daysLogged = Object.keys(dailyCounts).length;
    const totalDays = 7;
    const consistency = Math.round((daysLogged / totalDays) * 100);

    if (consistency < 50) {
      insights.push({
        id: 'insight-time-inconsistent',
        type: 'time_management',
        severity: 'medium',
        title: 'Inconsistent Time Logging',
        description: `Logged time on ${daysLogged} of last ${totalDays} days. Try daily logging.`,
        actionable: true,
        action: 'Set daily time logging reminder',
        suggestedAt: new Date(),
      });
    }

    return insights;
  }

  /**
   * Analyze goals
   */
  private analyzeGoals(events: any[]): Insight[] {
    const insights: Insight[] = [];
    const goalEvents = events.filter((e: any) => e.event_category === 'goals');

    // Check goal progress
    const progressEvents = goalEvents.filter((e: any) => e.event_type === 'goal_progress');
    const completedEvents = goalEvents.filter((e: any) => e.event_type === 'goal_completed');

    // If goals exist but no progress recently
    if (goalEvents.length > 0 && progressEvents.length === 0 && completedEvents.length === 0) {
      insights.push({
        id: 'insight-goals-stalled',
        type: 'goals',
        severity: 'medium',
        title: 'Goals Stalled',
        description: 'You have goals set but no recent progress updates. Review and take action.',
        actionable: true,
        action: 'Review and update your goals',
        suggestedAt: new Date(),
      });
    }

    // Check for goal completions
    if (completedEvents.length > 0) {
      const lastCompleted = completedEvents[completedEvents.length - 1];
      insights.push({
        id: 'insight-goals-completed',
        type: 'goals',
        severity: 'low',
        title: 'Goal Completed!',
        description: `Completed: ${lastCompleted.title}. Celebrate your achievement!`,
        actionable: false,
        suggestedAt: new Date(),
      });
    }

    return insights;
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
   * Calculate habit stats
   */
  private calculateHabitStats(events: any[]): { completed: number; total: number } {
    const habitEvents = events.filter((e: any) => e.event_type.startsWith('habit_'));
    const completed = habitEvents.filter((e: any) => e.event_type === 'habit_completed').length;
    return { completed, total: habitEvents.length };
  }

  /**
   * Calculate time logged
   */
  private calculateTimeLogged(events: any[]): number {
    const timeEvents = events.filter((e: any) => e.event_type === 'time_log_created');
    return timeEvents.reduce((sum: number, e: any) => sum + (e.context?.duration_minutes || 0), 0);
  }

  /**
   * Count tasks completed
   */
  private countTasksCompleted(events: any[]): number {
    return events.filter((e: any) => e.event_type === 'task_completed').length;
  }

  /**
   * Identify focus areas based on life score
   */
  private identifyFocusAreas(dailyData: any, lifeScore: number): string[] {
    const focusAreas: string[] = [];

    // Tasks
    if (dailyData.tasksCompleted < 3) {
      focusAreas.push('Complete at least 3 tasks today');
    }

    // Study
    if (dailyData.studyMinutes < 120) {
      focusAreas.push('Add 2 hours of study time');
    }

    // Habits
    if (dailyData.habitsTotal > 0 && dailyData.habitsCompleted < dailyData.habitsTotal) {
      focusAreas.push(`Complete remaining ${dailyData.habitsTotal - dailyData.habitsCompleted} habits`);
    }

    // Time
    if (dailyData.timeLoggedMinutes < 180) {
      focusAreas.push('Log at least 3 hours of focused work');
    }

    // Health
    if ((dailyData as any).sleepHours && (dailyData as any).sleepHours < 7) {
      focusAreas.push('Aim for 7-8 hours of sleep');
    }
    if (!((dailyData as any).exerciseMinutes) || (dailyData as any).exerciseMinutes < 30) {
      focusAreas.push('30 minutes of exercise can boost your score');
    }

    // Finance
    if ((dailyData as any).budgetSpent && (dailyData as any).budgetAllocated && (dailyData as any).budgetSpent > (dailyData as any).budgetAllocated) {
      focusAreas.push('Review your expenses - budget is overspent');
    }

    return focusAreas;
  }
}

export default InsightGenerator;