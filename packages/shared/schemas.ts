/**
 * Shared Zod Schemas for LifeOS Monorepo
 *
 * Barcha package'lar uchun ma'lumotlarni validatsiya qilish.
 */

import { z } from 'zod';

/**
 * UUID validator
 */
export const uuidSchema = z.string().uuid('Invalid UUID format');

/**
 * Non-empty string
 */
export const nonEmptyString = z.string().nonempty('Maydona bo\'lishi shart');

/**
 * Positive number
 */
export const positiveNumber = z.number().positive('Musbat qiymat kerak');

/**
 * Non-negative number
 */
export const nonNegativeNumber = z.number().nonnegative('Manfiy qiymat mumkin emas');

/**
 * Number range
 */
export const numberRange = (min: number, max: number) =>
  z.number().min(min, `Minimum ${min} bo\'lishi kerak`).max(max, `Maximum ${max} bo\'lishi mumkin emas`);

/**
 * Priority validation
 */
export const prioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);

/**
 * Status validation
 */
export const statusSchema = z.enum([
  'active',
  'inactive',
  'completed',
  'archived',
  'pending',
]);

export const taskStatusSchema = z.enum(['backlog', 'todo', 'in_progress', 'done', 'archived']);

export const habitStatusSchema = z.enum(['active', 'inactive']);

export const goalStatusSchema = z.enum(['active', 'completed', 'paused', 'abandoned']);

/**
 * Task schema
 */
export const taskSchema = z.object({
  id: uuidSchema.optional(),
  title: nonEmptyString.min(1).max(200),
  description: z.string().max(2000).optional(),
  status: taskStatusSchema.default('backlog'),
  priority: prioritySchema.default('medium'),
  track_id: uuidSchema.optional(),
  tags: z.array(z.string()).default([]),
  due_date: z.coerce.date().optional(),
  completed_at: z.coerce.date().optional(),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

/**
 * Task creation schema
 */
export const createTaskSchema = taskSchema.omit({ id: true, created_at: true, updated_at: true });

/**
 * Task update schema
 */
export const updateTaskSchema = createTaskSchema.partial();

/**
 * Habit schema
 */
export const habitSchema = z.object({
  id: uuidSchema.optional(),
  name: nonEmptyString.min(1).max(100),
  description: z.string().max(500).optional(),
  frequency: z.enum(['daily', 'weekly', 'monthly', 'custom']).default('daily'),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Noto\'g\'ri rang formati').optional().default('#10b981'),
  icon: z.string().max(10).default('✅'),
  is_active: z.boolean().default(true),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

/**
 * Habit creation schema
 */
export const createHabitSchema = habitSchema.omit({ id: true, created_at: true, updated_at: true });

/**
 * Habit update schema
 */
export const updateHabitSchema = habitSchema.partial();

/**
 * Habit log schema
 */
export const habitLogSchema = z.object({
  id: uuidSchema.optional(),
  habit_id: uuidSchema,
  user_id: uuidSchema,
  date: z.coerce.date(),
  completed: z.boolean().default(true),
  notes: z.string().max(500).optional(),
  created_at: z.coerce.date(),
});

/**
 * Habit log creation schema
 */
export const createHabitLogSchema = habitLogSchema.omit({ id: true, created_at: true });

/**
 * Time block schema
 */
export const timeBlockSchema = z.object({
  id: uuidSchema.optional(),
  title: nonEmptyString.min(1).max(200),
  start_time: z.coerce.date(),
  end_time: z.coerce.date(),
  block_type: z.enum(['work', 'study', 'break', 'personal', 'exercise']),
  task_id: uuidSchema.optional(),
  priority: z.number().min(1).max(5).default(3),
  created_at: z.coerce.date(),
});

/**
 * Time block creation schema
 */
export const createTimeBlockSchema = timeBlockSchema.omit({ id: true, created_at: true });

/**
 * Time log schema
 */
export const timeLogSchema = z.object({
  id: uuidSchema.optional(),
  user_id: uuidSchema,
  task_id: uuidSchema.optional(),
  time_block_id: uuidSchema.optional(),
  start_time: z.coerce.date(),
  end_time: z.coerce.date().optional(),
  duration_minutes: z.number().int().positive().optional(),
  notes: z.string().max(500).optional(),
  created_at: z.coerce.date(),
});

/**
 * Time log creation schema
 */
export const createTimeLogSchema = timeLogSchema.omit({ id: true, created_at: true });

/**
 * Pomodoro schema
 */
export const pomodoroSchema = z.object({
  id: uuidSchema.optional(),
  user_id: uuidSchema,
  task_id: uuidSchema.optional(),
  work_duration: z.number().int().min(1).max(120).default(25),
  break_duration: z.number().int().min(1).max(30).default(5),
  completed_pomodoros: z.number().int().default(0),
  started_at: z.coerce.date(),
  ended_at: z.coerce.date().optional(),
  status: z.enum(['active', 'paused', 'completed']).default('active'),
  notes: z.string().max(500).optional(),
  created_at: z.coerce.date(),
});

/**
 * Pomodoro creation schema
 */
export const createPomodoroSchema = pomodoroSchema.omit({ id: true, created_at: true });

/**
 * Budget category schema
 */
export const budgetCategorySchema = z.object({
  id: uuidSchema.optional(),
  user_id: uuidSchema,
  name: nonEmptyString.min(1).max(100),
  allocated_amount: z.number().nonnegative(),
  month: z.coerce.date().default(() => new Date()),
  actual_amount: z.number().nonnegative().default(0),
  is_active: z.boolean().default(true),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

/**
 * Budget category creation schema
 */
export const createBudgetCategorySchema = budgetCategorySchema.omit({ id: true, created_at: true, updated_at: true });

/**
 * Budget category update schema
 */
export const updateBudgetCategorySchema = createBudgetCategorySchema.partial();

/**
 * Transaction schema
 */
export const transactionSchema = z.object({
  id: uuidSchema.optional(),
  user_id: uuidSchema,
  category_id: uuidSchema,
  amount: z.number().nonnegative(),
  type: z.enum(['income', 'expense']),
  description: z.string().max(500).optional(),
  date: z.coerce.date(),
  created_at: z.coerce.date(),
});

/**
 * Transaction creation schema
 */
export const createTransactionSchema = transactionSchema.omit({ id: true, created_at: true });

/**
 * Transaction update schema
 */
export const updateTransactionSchema = createTransactionSchema.partial();

/**
 * Savings goal schema
 */
export const savingsGoalSchema = z.object({
  id: uuidSchema.optional(),
  user_id: uuidSchema,
  name: nonEmptyString.min(1).max(100),
  target_amount: z.number().positive(),
  current_amount: z.number().nonnegative().default(0),
  target_date: z.coerce.date(),
  status: z.enum(['active', 'completed', 'paused']).default('active'),
  created_at: z.coerce.date(),
});

/**
 * Savings goal creation schema
 */
export const createSavingsGoalSchema = savingsGoalSchema.omit({ id: true, created_at: true });

/**
 * Savings goal update schema
 */
export const updateSavingsGoalSchema = createSavingsGoalSchema.partial();

/**
 * Debt schema
 */
export const debtSchema = z.object({
  id: uuidSchema.optional(),
  user_id: uuidSchema,
  name: nonEmptyString.min(1).max(100),
  total_amount: z.number().positive(),
  remaining_amount: z.number().nonnegative(),
  interest_rate: z.number().min(0).max(100).default(0),
  monthly_payment: z.number().nonnegative().default(0),
  due_date: z.coerce.date(),
  status: z.enum(['active', 'paused', 'paid_off']).default('active'),
  created_at: z.coerce.date(),
});

/**
 * Debt creation schema
 */
export const createDebtSchema = debtSchema.omit({ id: true, created_at: true });

/**
 * Debt update schema
 */
export const updateDebtSchema = createDebtSchema.partial();

/**
 * Subscription schema
 */
export const subscriptionSchema = z.object({
  id: uuidSchema.optional(),
  user_id: uuidSchema,
  name: nonEmptyString.min(1).max(100),
  amount: z.number().nonnegative(),
  billing_cycle: z.enum(['daily', 'weekly', 'monthly', 'yearly']).default('monthly'),
  next_billing_date: z.coerce.date(),
  status: z.enum(['active', 'paused', 'cancelled']).default('active'),
  created_at: z.coerce.date(),
});

/**
 * Subscription creation schema
 */
export const createSubscriptionSchema = subscriptionSchema.omit({ id: true, created_at: true });

/**
 * Subscription update schema
 */
export const updateSubscriptionSchema = createSubscriptionSchema.partial();

/**
 * User profile schema
 */
export const userProfileSchema = z.object({
  id: uuidSchema,
  username: z.string().min(3).max(50),
  full_name: z.string().min(1).max(100).optional(),
  avatar_url: z.string().url('Noto\'g\'ri URL formati').optional(),
  timezone: z.string().default('Asia/Tashkent'),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

/**
 * User profile update schema
 */
export const updateUserProfileSchema = userProfileSchema.partial();

/**
 * Daily data schema (for Life Score)
 */
export const dailyDataSchema = z.object({
  tasksCompleted: z.number().int().min(0).max(5),
  tasksTotal: z.number().int().optional(),
  studyMinutes: z.number().int().min(0),
  habitsCompleted: z.number().int().min(0),
  habitsTotal: z.number().int().min(1),
  timeLoggedMinutes: z.number().int().min(0),
  sleepHours: z.number().optional(),
  exerciseMinutes: z.number().optional(),
  energyLevel: z.number().int().min(1).max(10).optional(),
  budgetSpent: z.number().optional(),
  budgetAllocated: z.number().optional(),
});

/**
 * Life Score result schema
 */
export const lifeScoreResultSchema = z.object({
  score: z.number().int().min(0).max(100),
  breakdown: z.object({
    tasks: z.object({ score: z.number().int(), max: z.number() }),
    study: z.object({ score: z.number().int(), max: z.number() }),
    habits: z.object({ score: z.number().int(), max: z.number() }),
    time: z.object({ score: z.number().int(), max: z.number() }),
    health: z.object({ score: z.number().int() }),
    finance: z.object({ score: z.number().int() }),
  }),
  recommendations: z.array(z.string()).default([]),
  status: z.enum(['Excellent', 'Good', 'Needs Improvement', 'Critical']),
});

/**
 * Achievement schema
 */
export const achievementSchema = z.object({
  id: uuidSchema,
  code: nonEmptyString,
  name: nonEmptyString,
  description: z.string().min(1),
  icon: z.string().max(10),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Noto\'g\'ri rang formati'),
  xpReward: z.number().int().nonnegative(),
  category: z.enum(['tasks', 'habits', 'study', 'finance', 'health', 'goals']),
  requirement: z.object({
    type: z.string(),
    target: z.number().int().nonnegative(),
  }),
});

/**
 * Create achievement schema
 */
export const createAchievementSchema = achievementSchema.omit({ id: true });

/**
 * SM-2 algorithm schema
 */
export const sm2InputSchema = z.object({
  quality: z.number().int().min(0).max(5),
  easinessFactor: z.number().default(2.5),
  interval: z.number().int().default(1),
  repetitions: z.number().int().default(0),
});

export const sm2OutputSchema = z.object({
  easinessFactor: z.number(),
  interval: z.number(),
  repetitions: z.number(),
  nextReviewDate: z.coerce.date(),
});

/**
 * Weekly review schema
 */
export const weeklyReviewSchema = z.object({
  week_start: z.coerce.date(),
  week_end: z.coerce.date(),
  wins: z.array(z.string()).default([]),
  challenges: z.array(z.string()).default([]),
  lessons_learned: z.array(z.string()).default([]),
  next_week_focus: z.array(z.string()).default([]),
  ai_insights: z.string().optional(),
});

/**
 * User stats for achievement checking
 */
export const userStatsSchema = z.object({
  tasks_completed: z.number().int().nonnegative().default(0),
  habits_completed: z.number().int().nonnegative().default(0),
  study_minutes: z.number().int().nonnegative().default(0),
  streak_days: z.number().int().nonnegative().default(0),
  life_score: z.number().int().min(0).max(100).default(0),
  xp_earned: z.number().int().nonnegative().default(0),
});