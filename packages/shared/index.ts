// Export all shared utilities
export * from './types';
export * from './schemas';
export * from './constants';

// Re-export commonly used items
export {
  uuidSchema,
  nonEmptyString,
  positiveNumber,
  taskSchema,
  createTaskSchema,
  habitSchema,
  createHabitSchema,
  lifeScoreResultSchema,
} from './schemas';

export {
  LIFE_SCORE_MAX,
  LIFE_SCORE_THRESHOLDS,
  XP_SYSTEM,
  HABIT_SYSTEM,
  STUDY_SYSTEM,
} from './constants';

export type {
  UUID,
  DateString,
  Status,
  Priority,
  Result,
  ApiResponse,
} from './types';
