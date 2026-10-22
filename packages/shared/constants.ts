/**
 * Shared Constants for LifeOS Monorepo
 *
 * Loyiha bo'yicha oddiy, changeless qiymatlar.
 */

// ============================================
// Life Score Constants
// ============================================

export const LIFE_SCORE_MAX = 100;
export const LIFE_SCORE_THRESHOLDS = {
  excellent: 90,
  good: 75,
  needs_improvement: 50,
  critical: 0,
};

export const LIFE_SCORE_COLORS = {
  excellent: '#10b981', // emerald
  good: '#fbbf24', // amber
  needs_improvement: '#f97316', // orange
  critical: '#ef4444', // red
};

export const LIFE_SCORE_LABELS = {
  excellent: 'Mukammal',
  good: 'Yaxshi',
  needs_improvement: 'Naylon oshirish kerak',
  critical: 'Qayyomi',
};

// ============================================
// XP Constants
// ============================================

export const XP_SYSTEM = {
  // XP to level up
  xpPerLevel: (level: number) => 100 * level * (level - 1),

  // Default XP rewards
  defaultRewards: {
    task_complete_low: 5,
    task_complete_medium: 10,
    task_complete_high: 20,
    task_complete_urgent: 30,
    habit_done: 5,
    habit_streak_7: 50,
    habit_streak_30: 200,
    study_session_30min: 10,
    pomodoro_complete: 5,
    weekly_review_done: 100,
    goal_complete: 500,
  },

  // Maximum XP per category per day
  maxDailyXP: {
    tasks: 50,
    habits: 100,
    study: 80,
    time: 60,
    finance: 30,
    goals: 200,
  },
};

// ============================================
// Habit Constants
// ============================================

export const HABIT_SYSTEM = {
  // Streak milestones
  streakMilestones: [7, 21, 30, 66, 90],

  // Default habit frequency
  defaultFrequency: 'daily' as const,

  // Habit color palette
  colorPalette: [
    '#10b981', // green
    '#3b82f6', // blue
    '#f59e0b', // amber
    '#ef4444', // red
    '#06b6d4', // cyan
    '#8b5cf6', // purple
    '#f97316', // orange
    '#ec4899', // pink
    '#6366f1', // indigo
    '#a855f7', // violet
  ],

  // Minimum habits for 100% Life Score
  minHabitsForFullScore: 3,
};

// ============================================
// Study Constants
// ============================================

export const STUDY_SYSTEM = {
  // SOC Analyst plan
  socTotalDays: 56,

  // IELTS
  ieltsTargetBand: 7.5,
  ieltsCurrentBandDefault: 6.0,

  // Flashcards SM-2
  sm2EasinessFactorDefault: 2.5,
  sm2IntervalInitial: 1, // kun
  sm2RepetitionsZero: 0,
  sm2RepetitionsOne: 1,
  sm2RepetitionsTwoPlus: 2,

  // Study session durations (minutes)
  studyDurations: {
    mini: 15,
    short: 30,
    standard: 45,
    long: 60,
    extra: 120,
  },

  // Focus break durations
  breakDurations: {
    short: 5,
    long: 15,
  },
};

// ============================================
// Finance Constants
// ============================================

export const FINANCE_SYSTEM = {
  // Budget categories
  defaultCategories: [
    'Oziq-ovqat',
    'Transport',
    'Uyloqxo\'jalig',
    'Kucha',
    'Maxfiyl Maosh',
    'Hudud To\'liklari',
    'Ta\'minotlar',
    'Ilmiy Texnik Ko\'lik',
    'Gift',
    'Ixtiyoriy',
  ],

  // Savings goal targets
  savingsTargets: {
    emergencyFund: 3_000_000, // 3M so'm - darurat fon
    laptop: 12_000_000, // 12M - laptop
    vacation: 5_000_000, // 5M - rest
    apartment: 50_000_000, // 50M - kvartira
  },

  // Debt payoff strategies
  payoffStrategies: ['snowball', 'avalanche'],

  // Currency formatting
  currencyFormatter: new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
  }),
};

// ============================================
// Time Constants
// ============================================

export const TIME_SYSTEM = {
  // Time units in milliseconds
  ms: {
    second: 1000,
    minute: 60_000,
    hour: 3_600_000,
    day: 86_400_000,
    week: 604_800_000,
    month: 2_592_000_000, // avg
    year: 31_536_000_000,
  },

  // Default time values
  defaultValues: {
    pomodoroWork: 25, // minutes
    pomodoroBreak: 5, // minutes
    dailyStudyGoal: 4, // hours
    dailyTaskGoal: 5, // tasks
    weeklyReviewDay: 0, // Sunday = 0
  },

  // Time formatting
  format: {
    time: 'HH:mm',
    date: 'yyyy-MM-dd',
    datetime: 'yyyy-MM-dd HH:mm',
    relative: true,
  },
};

// ============================================
// Achievement Constants
// ============================================

export const ACHIEVEMENT_SYSTEM = {
  // Total possible XP from achievements
  totalXP: 5000,

  // Achievement categories
  categories: ['tasks', 'habits', 'study', 'finance', 'health', 'goals'] as const,

  // Rarety levels
  rarity: {
    common: 'common',
    rare: 'rare',
    epic: 'epic',
    legendary: 'legendary',
  },

  // Display order
  displayOrder: [
    'first_task',
    'first_habit',
    'streak_7',
    'streak_21',
    'study_10h',
    'budget_first_month',
    'life_score_90',
    'pomodoro_10',
    // ... rest
  ],
};

// ============================================
// UI Constants
// ============================================

export const UI = {
  // Breakpoints
  breakpoints: {
    xs: 0,
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },

  // Colors
  colors: {
    primary: '#7c3aed', // purple
    secondary: '#06b6d4', // cyan
    accent1: '#7c3aed',
    accent2: '#06b6d4',
    accent3: '#10b981',
    accent4: '#f59e0b',
    accent5: '#ef4444',
    accent6: '#a855f7',
    background: '#07071a',
    panel: '#0e0e2a',
    card: '#13132e',
    border: '#242450',
    text: '#e2e8f0',
    text2: '#94a3b8',
    muted: '#475569',
  },

  // Font sizes
  fontSizes: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    md: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.875rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['5rem', { lineHeight: '1' }],
    '9xl': ['6rem', { lineHeight: '1' }],
  },

  // Font weights
  fontWeights: {
    normal: 400,
    medium: 500,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  // Border radius
  borderRadius: {
    sm: '0.125rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    full: '9999px',
  },

  // Shadow
  shadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -2px rgb(0 0 0 / 0.05)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 8px -4px rgb(0 0 0 / 0.1)',
  },
};

// ============================================
// API Constants
// ============================================

export const API = {
  // Timeouts
  timeouts: {
    default: 5_000,
    long: 30_000,
    veryLong: 60_000,
  },

  // Retry config
  retry: {
    maxAttempts: 3,
    initialDelay: 1_000,
    maxDelay: 30_000,
    backoff: 'exponential' as const,
  },

  // Endpoints
  endpoints: {
    auth: '/api/auth',
    users: '/api/users',
    tasks: '/api/tasks',
    habits: '/api/habits',
    study: '/api/study',
    finance: '/api/finance',
    goals: '/api/goals',
    achievements: '/api/achievements',
  },
};

// ============================================
// Feature Flags
// ============================================

export const FEATURES = {
  aiAgents: true,
  telegramBot: true,
  gamification: true,
  offlineMode: true,
  darkMode: true,
  analytics: true,
  exportObsidian: true,
  exportNotion: true,
  voiceInput: true,
  pushNotifications: true,
};

// ============================================
// Default Values
// ============================================

export const DEFAULTS = {
  // User profile
  timezone: 'Asia/Tashkent',

  // Habits
  defaultHabitFrequency: 'daily',

  // Study
  defaultIeltsBand: 6.0,
  socPlanDays: 56,

  // Finance
  defaultCurrency: 'UZS' as const,

  // Time
  defaultPomodoroWork: 25,
  defaultPomodoroBreak: 5,

  // Life Score
  initialLifeScore: 0,

  // XP
  initialXP: 0,

  // Level
  initialLevel: 1,
};

// ============================================
// Version Info
// ============================================

export const VERSION = {
  app: '1.0.0',
  package: 'lifeos',
  lastUpdated: '2026-10-22',
};

// ============================================
// Export all constants
// ============================================

export default {
  LIFE_SCORE_MAX,
  LIFE_SCORE_THRESHOLDS,
  LIFE_SCORE_COLORS,
  LIFE_SCORE_LABELS,
  XP_SYSTEM,
  HABIT_SYSTEM,
  STUDY_SYSTEM,
  FINANCE_SYSTEM,
  TIME_SYSTEM,
  ACHIEVEMENT_SYSTEM,
  UI,
  API,
  FEATURES,
  DEFAULTS,
  VERSION,
};