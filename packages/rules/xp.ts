/**
 * XP (Experience Points) System
 *
 * Har bir faollik uchun XP beriladi.
 * XP to'planib, daraja (level) oshadi.
 */

export const XP_REWARDS = {
  // Tasks
  task_complete_low: 5,
  task_complete_medium: 10,
  task_complete_high: 20,
  task_complete_urgent: 30,
  task_created: 1,
  task_cancelled: -2,

  // Habits
  habit_done: 5,
  habit_missed: -3,
  habit_streak_7: 50,
  habit_streak_14: 100,
  habit_streak_30: 200,
  habit_streak_60: 400,
  habit_streak_90: 600,

  // Study
  study_session_15min: 5,
  study_session_30min: 10,
  study_session_60min: 20,
  study_session_120min: 40,
  flashcard_review: 2,
  soc_day_complete: 15,
  ielts_task_complete: 10,

  // Time
  pomodoro_complete: 5,
  time_block_done: 3,
  time_log_manual: 2,

  // Finance
  budget_under: 10,
  savings_contribution: 5,
  debt_payment: 8,

  // Goals & Review
  weekly_review_done: 100,
  goal_complete: 500,
  kaizen_completed: 50,

  // Life Score
  life_score_90_plus: 50,
  life_score_perfect: 100,
} as const;

export type XPAction = keyof typeof XP_REWARDS;

/**
 * Calculate XP for an action
 */
export function calculateXP(action: XPAction, multiplier: number = 1): number {
  const baseXP = XP_REWARDS[action] || 0;
  return Math.round(baseXP * multiplier);
}

/**
 * Calculate XP for task completion based on priority
 */
export function calculateTaskXP(priority: 'low' | 'medium' | 'high' | 'urgent'): number {
  const actionMap = {
    low: 'task_complete_low',
    medium: 'task_complete_medium',
    high: 'task_complete_high',
    urgent: 'task_complete_urgent',
  } as const;

  return XP_REWARDS[actionMap[priority]];
}

/**
 * Calculate XP for study session based on duration
 */
export function calculateStudyXP(durationMinutes: number): number {
  if (durationMinutes >= 120) return XP_REWARDS.study_session_120min;
  if (durationMinutes >= 60) return XP_REWARDS.study_session_60min;
  if (durationMinutes >= 30) return XP_REWARDS.study_session_30min;
  if (durationMinutes >= 15) return XP_REWARDS.study_session_15min;
  return 0;
}

/**
 * Calculate XP for habit streak milestone
 */
export function calculateStreakXP(streakDays: number): number {
  if (streakDays >= 90) return XP_REWARDS.habit_streak_90;
  if (streakDays >= 60) return XP_REWARDS.habit_streak_60;
  if (streakDays >= 30) return XP_REWARDS.habit_streak_30;
  if (streakDays >= 14) return XP_REWARDS.habit_streak_14;
  if (streakDays >= 7) return XP_REWARDS.habit_streak_7;
  return 0;
}

/**
 * Total XP from multiple actions
 */
export function sumXP(actions: Array<{ action: XPAction; multiplier?: number }>): number {
  return actions.reduce((total, { action, multiplier = 1 }) => {
    return total + calculateXP(action, multiplier);
  }, 0);
}

/**
 * XP breakdown by category
 */
export function categorizeXP(xpEvents: Array<{ action: XPAction; xp: number }>) {
  const categories = {
    tasks: 0,
    habits: 0,
    study: 0,
    time: 0,
    finance: 0,
    goals: 0,
    other: 0,
  };

  xpEvents.forEach(({ action, xp }) => {
    if (action.startsWith('task_')) categories.tasks += xp;
    else if (action.startsWith('habit_')) categories.habits += xp;
    else if (action.startsWith('study_') || action.includes('flashcard') || action.includes('soc') || action.includes('ielts')) {
      categories.study += xp;
    }
    else if (action.startsWith('time_') || action.includes('pomodoro')) categories.time += xp;
    else if (action.startsWith('budget_') || action.includes('savings') || action.includes('debt')) {
      categories.finance += xp;
    }
    else if (action.includes('goal') || action.includes('review') || action.includes('kaizen')) {
      categories.goals += xp;
    }
    else categories.other += xp;
  });

  return categories;
}
