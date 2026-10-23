/**
 * Shared Types for LifeOS Monorepo
 *
 * Barcha packages'lar o'z ichiga oladi:
 * - packages/shared/types.ts
 * - packages/rules/*
 * - packages/ai/*
 * - packages/db-types/*
 * - apps/web/*
 */

/**
 * UUID type
 */
export type UUID = string;

/**
 * Date string in ISO format
 */
export type DateString = string;

/**
 * Status types
 */
export type Status = 'active' | 'inactive' | 'completed' | 'archived' | 'pending';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done' | 'archived';
export type HabitStatus = 'active' | 'inactive';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';

/**
 * Priority levels
 */
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

export type XPAction =
  | 'task_complete_low'
  | 'task_complete_medium'
  | 'task_complete_high'
  | 'task_complete_urgent'
  | 'task_created'
  | 'task_cancelled'
  | 'habit_done'
  | 'habit_missed'
  | 'habit_streak_7'
  | 'habit_streak_14'
  | 'habit_streak_30'
  | 'habit_streak_60'
  | 'habit_streak_90'
  | 'study_session_15min'
  | 'study_session_30min'
  | 'study_session_60min'
  | 'study_session_120min'
  | 'flashcard_review'
  | 'soc_day_complete'
  | 'ielts_task_complete'
  | 'pomodoro_complete'
  | 'time_block_done'
  | 'time_log_manual'
  | 'budget_under'
  | 'savings_contribution'
  | 'debt_payment'
  | 'weekly_review_done'
  | 'goal_complete'
  | 'kaizen_completed'
  | 'life_score_90_plus'
  | 'life_score_perfect';

/**
 * Result pattern (success/error)
 */
export type Result<T> =
  | {
      ok: true;
      data: T;
    }
  | {
      ok: false;
      error: string;
    };

/**
 * API Response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: DateString;
}

/**
 * Pagination params
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  cursor?: string;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  lastPage: number;
  hasMore: boolean;
}

/**
 * Sort params
 */
export interface SortParams {
  field: string;
  direction?: 'asc' | 'desc';
}

/**
 * Filter params
 */
export interface FilterParams {
  field?: string;
  operator?: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
  value?: any;
}

/**
 * User role
 */
export type UserRole = 'admin' | 'user' | 'viewer';

/**
 * Account tier
 */
export type AccountTier = 'free' | 'pro' | 'premium';

/**
 * Error codes
 */
export enum ErrorCodes {
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  RATE_LIMIT = 'RATE_LIMIT',
  DATABASE_ERROR = 'DATABASE_ERROR',
  AI_SERVICE_ERROR = 'AI_SERVICE_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
}

/**
 * Validation errors
 */
export interface ValidationError {
  field: string;
  message: string;
  code?: ErrorCodes;
}

/**
 * Form field values
 */
export type FormValues<T> = {
  [K in keyof T]?: T[K];
};

/**
 * Safe parse result
 */
export interface SafeParseResult<T> {
  success: boolean;
  data?: T;
  error?: unknown;
}

/**
 * OAuth user info
 */
export interface OAuthUser {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
}

/**
 * Theme mode
 */
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Language code
 */
export type LanguageCode = 'uz' | 'en' | 'ru';

/**
 * Currency code
 */
export type CurrencyCode = 'UZS' | 'USD' | 'EUR' | 'RUB';

/**
 * Time unit
 */
export type TimeUnit = 'seconds' | 'minutes' | 'hours' | 'days';

/**
 * Frequency types
 */
export type Frequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';

/**
 * Direction
 */
export type Direction = 'next' | 'previous' | 'up' | 'down' | 'left' | 'right';

/**
 * Navigation params
 */
export interface NavParams {
  from?: string;
  to?: string;
  preserveState?: boolean;
}

/**
 * Toast notification
 */
export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'secondary';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Loading state
 */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

/**
 * Form submission state
 */
export type FormState = 'idle' | 'submitting' | 'submitted' | 'error';

/**
 * Field error state
 */
export interface FieldError {
  message: string;
  type?: string;
}

/**
 * Form errors
 */
export type FormErrors<T> = {
  [K in keyof T]?: FieldError;
};

/**
 * Response from mutation
 */
export interface MutationResult<T> {
  data?: T;
  error?: string;
  rollback?: boolean;
}

/**
 * Cache key pattern
 */
export interface CacheKey {
  prefix: string;
  id?: string;
  params?: string;
}

/**
 * Retry options
 */
export interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: 'linear' | 'exponential';
}

/**
 * API endpoint config
 */
export interface ApiConfig {
  baseUrl: string;
  timeout?: number;
  withCredentials?: boolean;
  headers?: Record<string, string>;
}

/**
 * Mutation observer config
 */
export interface MutationObserverConfig {
  childList?: boolean;
  attributes?: boolean;
  characterData?: boolean;
  subtree?: boolean;
}

/**
 * Intersection observer config
 */
export interface IntersectionObserverConfig {
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | Array<number>;
}

/**
 * Element scroll info
 */
export interface ScrollInfo {
  top: number;
  left: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

/**
 * Viewport dimensions
 */
export interface Viewport {
  width: number;
  height: number;
  scaled?: number;
}

/**
 * Breakpoint points for responsive design
 */
export const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export type BreakpointKey = keyof typeof breakpoints;

/**
 * Media query strings
 */
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.sm}px)`,
  sm: `@media (min-width: ${breakpoints.md}px)`,
  md: `@media (min-width: ${breakpoints.lg}px)`,
  lg: `@media (min-width: ${breakpoints.xl}px)`,
  xl: `@media (min-width: 1536px)`,
} as const;

/**
 * Default export object
 */
export const shared = {
  breakpoints,
  mediaQueries,
};

/**
 * Empty object type
 */
export type EmptyObject = {};

/**
 * Non-nullable type
 */
export type NonNullable<T> = T extends null | undefined ? never : T;

/**
 * Optional keys
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {};
}[keyof T] extends never
  ? never
  : keyof T;

/**
 * Required keys (make all keys required)
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: Required<T>[K];
}[keyof T];

/**
 * Pick specific keys
 */
export type PickKeys<T, K extends keyof T> = {
  [K in keyof T as K extends keyof T ? K : never]: T[K];
};

/**
 * Omit specific keys
 */
export type OmitKeys<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Record with string keys
 */
export type RecordString<T> = {
  [K in string]: T;
};

/**
 * Partial with defaults
 */
export type PartialWithDefaults<T> = {
  [K in keyof T]?: T[K];
};

/**
 * Deep partial
 */
export type DeepPartial<T> = T extends (infer R)[] ? DeepPartial<R>[] : {
  [K in keyof T]?: DeepPartial<T[K]>;
};

/**
 * Deep required
 */
export type DeepRequired<T> = {
  [K in keyof T]-?: DeepRequired<T[K]>;
};

/**
 * Union to intersection
 */
export type UnionToIntersection<U> = (
  U extends any ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

/**
 * Without type (exclude keys)
 */
export type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

/**
 * Extract from union
 */
export type ExtractUnion<T, U> = T extends U ? T : never;

/**
 * Non-null assertion
 */
export type NonNull<T> = T & { readonly [P in keyof T]: T[P] };

/**
 * Deep readonly
 */
export type DeepReadonly<T> = {
  readonly [K in keyof T]: DeepReadonly<T[K]>;
};

/**
 * Merge types
 */
export type Merge<T, U> = Omit<T, keyof U> & U;

/**
 * Invert object keys
 */
export type InvertObject<T extends Record<PropertyKey, PropertyKey>> = {
  [K in keyof T as T[K]]: K;
};

/**
 * String union of values
 */
export type ValuesOf<T> = T[keyof T];

/**
 * Boolean invert
 */
export type InvertBoolean<T> = true extends T ? false : true extends T ? true : boolean;

/**
 * Conditional type
 */
export type If<C extends boolean, T, F> = [C] extends [true] ? T : F;

/**
 * Equal type check
 */
export type Equal<X, Y> = (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? X : Y;

/**
 * Is exact type
 */
export type IsExact<T, O> = (<G>() => G extends T ? (G extends O ? 1 : 2) : G extends O ? 2 : 1) extends
  (<G>() => G extends T ? 1 : 2) ? (O extends T ? 1 : 2) : false;

/**
 * Is union
 */
export type UnionIs<T> = () => T;

/**
 * Assert never
 */
export type AssertNever<T> = (value: T) => never;

/**
 * Deep mutate
 */
export type DeepMutable<T> = {
  -readonly [K in keyof T]: T[K] extends DeepMutable<infer R>
    ? DeepMutable<R>
    : T[K];
};

/**
 * Record keys union
 */
export type RecordKeyUnion<T> = keyof T extends string | number ? string | number : never;

/**
 * Merge all objects
 */
export type MergeAll<T> = T extends any ? Merge<T, Partial<T>> : never;

/**
 * Deep merge (runtime function, not type)
 */
export function deepMerge<T extends Record<string, any>, U extends Record<string, any>>(
  target: T,
  source: U
): T & U {
  const result = { ...target };

  for (const key of Object.keys(source)) {
    if (Object.prototype.hasOwnProperty.call(source, key) &&
        typeof source[key] === 'object' &&
        source[key] !== null &&
        !Array.isArray(source[key])) {
      if (
        Object.prototype.hasOwnProperty.call(target, key) &&
        typeof target[key] === 'object' &&
        target[key] !== null &&
        !Array.isArray(target[key])
      ) {
        ;(result as any)[key] = deepMerge(target[key] as object, source[key] as object);
      } else {
        ;(result as any)[key] = source[key] as any;
      }
    } else {
      ;(result as any)[key] = source[key] as any;
    }
  }

  return result as T & U;
}

/**
 * Deep clone
 */
export function deepClone<T>(value: T): T {
  if (value === null || value === undefined) return value;

  if (Array.isArray(value)) {
    return value.map(item => deepClone(item)) as unknown as T;
  }

  if (typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const key of Object.keys(value as object)) {
      result[key] = deepClone((value as Record<string, unknown>)[key]);
    }
    return result as unknown as T;
  }

  return value;
}

/**
 * Format date consistently
 */
export function formatDate(date: Date | string): string {
  if (!(date instanceof Date)) date = new Date(date);
  return date.toISOString().split('T')[0];
}

/**
 * Parse date from string
 */
export function parseDate(date: string | Date): Date {
  if (date instanceof Date) return date;
  return new Date(date);
}

/**
 * Get days between two dates
 */
export function getDaysBetween(start: Date | string, end: Date | string): number {
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Check if date is today
 */
export function isToday(date: Date | string): boolean {
  const target = parseDate(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  return target.getTime() === today.getTime();
}

/**
 * Check if date is in the past
 */
export function isPast(date: Date | string): boolean {
  const target = parseDate(date);
  return target < new Date();
}

/**
 * Check if date is in the future
 */
export function isFuture(date: Date | string): boolean {
  const target = parseDate(date);
  return target > new Date();
}

/**
 * Calculate age from birthdate
 */
export function calculateAge(birthdate: Date | string): number {
  const birth = parseDate(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => ReturnType<T> {
  let inThrottle = false;
  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  } as (...args: Parameters<T>) => ReturnType<T>;
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    const context = this;
    const argsList = args;
    const later = function () {
      timeout = null;
      if (!immediate) func.apply(context, argsList);
    };

    const callNow = immediate && !timeout;
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func.apply(context, argsList);
  };
}