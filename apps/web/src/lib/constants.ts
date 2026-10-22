/**
 * Type-safe constants for LifeOS
 */

export const COLORS = {
  primary: '#7c3aed',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
} as const;

export const LIFE_SCORE_LEVELS = {
  excellent: { min: 90, label: 'Excellent', color: '#10b981' },
  good: { min: 75, label: 'Good', color: '#fbbf24' },
  needs_improvement: { min: 50, label: 'Needs Improvement', color: '#f97316' },
  critical: { min: 0, label: 'Critical', color: '#ef4444' },
} as const;

export const TASK_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export const TASK_STATUSES = ['backlog', 'todo', 'in_progress', 'done', 'archived'] as const;

export const HABITS_MILESTONES = [7, 21, 30, 66, 90] as const;

export const TIME_UNITS = {
  minute: 60 * 1000,
  hour: 60 * 60 * 1000,
  day: 24 * 60 * 60 * 1000,
} as const;

export const API_ENDPOINTS = {
  TASKS: '/api/tasks',
  HABITS: '/api/habits',
  TIME: '/api/time',
  FINANCE: '/api/finance',
  STUDY: '/api/study',
  GOALS: '/api/goals',
  PROFILE: '/api/profile',
} as const;

export const CACHE_KEYS = {
  TASKS: 'tasks',
  HABITS: 'habits',
  DAILY_LOG: 'daily_log',
  USER: 'user',
  LIFE_SCORE: 'life_score',
} as const;
