/**
 * AI Coach Module
 *
 * The main orchestrator that processes all user activities,
 * generates insights, provides smart scheduling, and delivers
 * personalized coaching via Telegram or web interface.
 */

import { createClient } from '@supabase/supabase-js';
import { EventService } from '../services/event-service';
import { AnalyticsService } from '../services/analytics-service';
import { InsightGenerator } from '../insights/insight-generator';
import { OpenAI } from 'openai';
import { calculateLifeScore, getLifeScoreBreakdown, getLifeScoreRecommendations } from '../../packages/rules/life-score';
import { checkAchievements, getAchievementsByCategory } from '../../packages/rules/achievements';
import { calculateLevel, getLevelInfo, getLevelTier, getLevelColor } from '../../packages/rules/level';
import { sm2 } from '../../packages/rules/sm2';

export interface CoachConfig {
  supabaseUrl: string;
  supabaseKey: string;
  openAiKey: string;
  telegramBotToken?: string;
}

export interface CoachState {
  userId: string;
  lastAnalysis: Date;
  lifeScore: number;
  level: number;
  xp: number;
  streakDays: number;
  recentInsights: Insight[];
  smartSuggestions: SmartSchedule[];
}

export interface CoachingMessage {
  type: 'text' | 'voice' | 'photo' | 'audio';
  content: string;
  metadata?: any;
  actions?: CoachAction[];
}

export interface CoachAction {
  id: string;
  label: string;
  type: 'button' | 'quick_reply';
  value: string;
  style?: 'primary' | 'secondary' | 'danger';
}

/**
 * Main AI Coach that processes user data and provides coaching
 */
export class AICoach {
  private supabase: any;
  private eventService: EventService;
  private analyticsService: AnalyticsService;
  private insightGenerator: InsightGenerator;
  private openai: OpenAI;

  constructor(config: CoachConfig) {
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
    this.eventService = new EventService(config.supabaseUrl, config.supabaseKey);
    this.analyticsService = new AnalyticsService(config.supabaseUrl, config.supabaseKey);
    this.insightGenerator = new InsightGenerator(this.eventService, config.openAiKey);
    this.openai = new OpenAI({ apiKey: config.openAiKey });
  }

  /**
   * Process a new user activity and generate coaching response
   */
  async processActivity(activity: {
    userId: string;
    type: string;
    title: string;
    context?: any;
  }): Promise<CoachingMessage> {
    // 1. Log the event
    await this.eventService.logEvent({
      userId: activity.userId,
      eventType: this.mapActivityType(activity.type),
      eventCategory: this.mapActivityCategory(activity.type),
      title: activity.title,
      description: activity.context?.description,
      context: activity.context,
      source: 'web',
    });

    // 2. Get recent events for analysis
    const allEvents = await this.eventService.getRecentEvents(activity.userId, 7);

    // 3. Generate life score
    const habitData = this.analyticsService['calculateHabitStats'](allEvents);
    const studyMinutes = this.analyticsService['calculateStudyMinutes'](allEvents);
    const timeLogged = this.analyticsService['calculateTimeLogged'](allEvents);
    const tasksCompleted = this.analyticsService['countTasksCompleted'](allEvents);

    const dailyData = {
      tasksCompleted,
      studyMinutes,
      habitsCompleted: habitData.completed,
      habitsTotal: habitData.total,
      timeLoggedMinutes: timeLogged,
    };

    const lifeScore = calculateLifeScore(dailyData);
    const levelInfo = calculateLevel(tasksCompleted + studyMinutes + (habitData.completed * 10));

    // 4. Generate insights
    const insights = await this.insightGenerator.generateWeeklyInsights(
      activity.userId,
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date()
    );

    // 5. Get smart scheduling suggestions
    const smartSuggestions = await this.analyticsService.getSmartSuggestions(activity.userId, 3);

    // 6. Check for achievements
    const achievements = checkAchievements(
      {
        tasks_completed: tasksCompleted,
        habits_completed: habitData.completed,
        study_minutes: studyMinutes,
        streak_days: levelInfo.level,
        life_score: lifeScore,
        xp_earned: 0, // Would calculate from XP events
      },
      []
    );

    // 7. Build coaching message
    const message = this.buildCoachingMessage(
      lifeScore,
      levelInfo,
      insights,
      smartSuggestions,
      achievements
    );

    return message;
  }

  /**
   * Get personalized daily coaching message
   */
  async getDailyCoaching(userId: string): Promise<CoachingMessage> {
    // Get recent events
    const allEvents = await this.eventService.getRecentEvents(userId, 1);

    if (allEvents.length === 0) {
      return this.getWelcomeMessage(userId);
    }

    // Get life score
    const habitData = this.analyticsService['calculateHabitStats'](allEvents);
    const studyMinutes = this.analyticsService['calculateStudyMinutes'](allEvents);
    const timeLogged = this.analyticsService['calculateTimeLogged'](allEvents);
    const tasksCompleted = this.analyticsService['countTasksCompleted'](allEvents);

    const dailyData = {
      tasksCompleted,
      studyMinutes,
      habitsCompleted: habitData.completed,
      habitsTotal: habitData.total,
      timeLoggedMinutes: timeLogged,
    };

    const lifeScore = calculateLifeScore(dailyData);
    const levelInfo = calculateLevel(100); // Simplified
    const breakdown = getLifeScoreBreakdown(dailyData);
    const recommendations = getLifeScoreRecommendations(dailyData);

    // Generate insights for the week
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const insights = await this.insightGenerator.generateWeeklyInsights(
      userId,
      weekStart,
      new Date()
    );

    // Get smart suggestions
    const smartSuggestions = await this.analyticsService.getSmartSuggestions(userId, 3);

    // Build message
    const message: CoachingMessage = {
      type: 'text',
      content: this.formatDailyCoachingMessage(lifeScore, breakdown, recommendations, insights, smartSuggestions),
      metadata: {
        lifeScore,
        level: levelInfo.level,
        tier: levelInfo.tier,
        color: levelInfo.color,
      },
      actions: this.buildCoachingActions(smartSuggestions, recommendations),
    };

    return message;
  }

  /**
   * Get welcome message for new users
   */
  private getWelcomeMessage(userId: string): CoachingMessage {
    return {
      type: 'text',
      content: 'Welcome to LifeOS AI Coach! 👋\n\nI\'ll help you track your activities, analyze your patterns, and provide personalized insights to optimize your daily life.\n\nGet started by:\n• Logging your activities via Telegram\n• Completing tasks and habits\n• Reviewing your weekly progress\n• Getting personalized recommendations\n\nTell me: "Today I worked on backend for 3 hours and studied IELTS"',
      metadata: {},
      actions: [
        { id: 'log_task', label: 'Log Task', type: 'quick_reply', value: 'task' },
        { id: 'log_habit', label: 'Log Habit', type: 'quick_reply', value: 'habit' },
        { id: 'view_progress', label: 'View Progress', type: 'quick_reply', value: 'progress' },
      ],
    };
  }

  /**
   * Format the daily coaching message
   */
  private formatDailyCoachingMessage(
    lifeScore: number,
    breakdown: any,
    recommendations: string[],
    insights: any[],
    smartSuggestions: any[]
  ): string {
    const scoreColor = lifeScore >= 90 ? '#10b981' : lifeScore >= 75 ? '#fbbf24' : lifeScore >= 50 ? '#f97316' : '#ef4444';
    const scoreStatus = lifeScore >= 90 ? 'Excellent' : lifeScore >= 75 ? 'Good' : lifeScore >= 50 ? 'Needs Improvement' : 'Critical';

    let message = `📊 **Today's Life Score: ${lifeScore}/100** (${scoreStatus})\n\n`;

    // Breakdown
    message += `📋 **Breakdown:**\n`;
    message += `• Tasks: ${breakdown.tasks.score}/25 (${breakdown.tasks.percentage}%)\n`;
    message += `• Study: ${breakdown.study.score}/20 (${breakdown.study.percentage}%)\n`;
    message += `• Habits: ${breakdown.habits.score}/20 (${breakdown.habits.percentage}%)\n`;
    message += `• Time: ${breakdown.time.score}/20 (${breakdown.time.percentage}%)\n`;
    message += `• Health: ${breakdown.health.score}/10 (${Math.round((breakdown.health.score / 10) * 100)}%)\n`;
    message += `• Finance: ${breakdown.finance.score}/5 (${Math.round((breakdown.finance.score / 5) * 100)}%)\n\n`;

    // Focus areas
    if (recommendations.length > 0) {
      message += `🎯 **Focus Areas:**\n`;
      recommendations.slice(0, 3).forEach((rec: string) => {
        message += `• ${rec}\n`;
      });
      message += '\n';
    }

    // Insights
    if (insights && insights.length > 0) {
      const highSeverity = insights.filter((i: any) => i.severity === 'high');
      if (highSeverity.length > 0) {
        message += `⚠️ **${highSeverity.length} important insight(s):**\n`;
        highSeverity.slice(0, 2).forEach((insight: any) => {
          message += `• ${insight.title}: ${insight.description}\n`;
        });
        message += '\n';
      }
    }

    // Smart suggestions
    if (smartSuggestions && smartSuggestions.length > 0) {
      message += `💡 **Suggested Next:**\n`;
      smartSuggestions.slice(0, 2).forEach((suggestion: any) => {
        message += `• ${suggestion.title}\n`;
      });
      message += '\n';
    }

    // Encouraging closing
    if (lifeScore >= 75) {
      message += '🌟 Keep up the excellent work! You\'re on track for a great day!';
    } else if (lifeScore >= 50) {
      message += '💪 You\'re making progress! Focus on the areas above to improve.';
    } else {
      message += '🌱 Every day is a new opportunity. Start small and build momentum!';
    }

    return message;
  }

  /**
   * Build coaching actions (quick replies)
   */
  private buildCoachingActions(
    smartSuggestions: any[],
    recommendations: string[]
  ): CoachAction[] {
    const actions: CoachAction[] = [];

    // Add smart suggestions as actions
    if (smartSuggestions && smartSuggestions.length > 0) {
      smartSuggestions.slice(0, 3).forEach((suggestion: any, index: number) => {
        actions.push({
          id: `suggestion_${index}`,
          label: suggestion.title.substring(0, 20),
          type: 'quick_reply',
          value: `suggest_${index}`,
        });
      });
    }

    // Add recommendation actions
    if (recommendations && recommendations.length > 0) {
      recommendations.slice(0, 3).forEach((rec: string, index: number) => {
        actions.push({
          id: `rec_${index}`,
          label: rec.substring(0, 20),
          type: 'quick_reply',
          value: `rec_${index}`,
        });
      });
    }

    // Always add common actions
    actions.push({ id: 'view_weekly', label: 'Weekly Review', type: 'quick_reply', value: 'weekly' });
    actions.push({ id: 'log_activity', label: 'Log Activity', type: 'quick_reply', value: 'activity' });

    return actions;
  }

  /**
   * Map activity type to event type
   */
  private mapActivityType(type: string): string {
    const mapping: Record<string, string> = {
      'task_created': 'task_created',
      'task_completed': 'task_completed',
      'habit_started': 'habit_started',
      'habit_completed': 'habit_completed',
      'habit_missed': 'habit_missed',
      'time_logged': 'time_log_created',
      'study_session': 'study_session_started',
      'finance_transaction': 'finance_transaction',
      'goal_created': 'goal_created',
      'weekly_review': 'weekly_review_started',
    };
    return mapping[type] || 'ai_chat_message';
  }

  /**
   * Map activity category to event category
   */
  private mapActivityCategory(type: string): string {
    const mapping: Record<string, string> = {
      'task_created': 'productivity',
      'task_completed': 'productivity',
      'habit_started': 'habits',
      'habit_completed': 'habits',
      'habit_missed': 'habits',
      'time_logged': 'productivity',
      'study_session': 'study',
      'finance_transaction': 'finance',
      'goal_created': 'goals',
      'weekly_review': 'goals',
    };
    return mapping[type] || 'ai_interaction';
  }

  /**
   * Build personalized OpenAI prompt for coaching
   */
  async buildPersonalizedPrompt(userId: string, context: any): Promise<string> {
    // Get user's recent events and patterns
    const events = await this.eventService.getRecentEvents(userId, 30);

    // Analyze patterns
    const habitEvents = events.filter((e: any) => e.event_type.startsWith('habit_'));
    const studyEvents = events.filter((e: any) =>
      e.event_type.startsWith('study_')
    );
    const taskEvents = events.filter((e: any) => e.event_type === 'task_completed');

    const completedHabits = habitEvents.filter((e: any) => e.event_type === 'habit_completed').length;
    const totalHabits = habitEvents.length;
    const habitRate = totalHabits > 0 ? (completedHabits / totalHabits) * 100 : 0;

    const totalStudyMinutes = studyEvents.reduce((sum: number, e: any) =>
      sum + (e.context?.duration_minutes || 0), 0);

    const totalXP = taskEvents.reduce((sum: number, e: any) =>
      sum + (e.context?.xp_gained || 0), 0);

    // Build context for OpenAI
    return `You are a personal life coaching AI for LifeOS.

User Context:
- User ID: ${userId}
- Habit Completion Rate: ${habitRate}% (${completedHabits}/${totalHabits} habits)
- Study Time (last 30 days): ${totalStudyMinutes} minutes
- Tasks Completed (last 30 days): ${taskEvents.length}
- XP Earned (last 30 days): ${totalXP}

Recent Activities: ${events.slice(0, 10).map((e: any) => `${e.event_type}: ${e.title}`).join(' | ')}

Provide personalized coaching in Uzbek or English based on this data. Focus on:
1. Actionable recommendations (not just observations)
2. Specific next steps the user can take TODAY
3. Encouraging tone with realistic goals
4. Prioritize 1-3 most important recommendations
5. Consider the user's current life score and patterns

Generate a coaching message that would be sent via Telegram or web app.
`;
  }

  /**
   * Get OpenAI coaching response
   */
  async getOpenAICoaching(userId: string, userMessage: string): Promise<string> {
    const prompt = await this.buildPersonalizedPrompt(userId, {});

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    return completion.choices[0]?.message?.content || 'I\'m here to help you optimize your life!';
  }
}

export default AICoach;