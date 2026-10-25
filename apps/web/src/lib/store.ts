'use client';

import { useState, useEffect, useCallback } from 'react';
import { z } from 'zod';
import {
  calculateXP,
  calculateLevel,
  levelProgress,
  calculateTaskXP,
  calculateStudyXP,
  calculateStreakXP,
  calculateSM2,
  isDueForReview,
  calculateLifeScore,
  getLifeScoreBreakdown,
  XP_REWARDS,
} from '@lifeos/rules';
import {
  createTaskSchema,
  createHabitSchema,
  createTransactionSchema,
  createBudgetCategorySchema,
  createSavingsGoalSchema,
  createDebtSchema,
  createSubscriptionSchema,
  dailyDataSchema,
  sm2InputSchema,
  userStatsSchema,
  DatabaseState,
  Task,
  TaskStatus,
  TaskPriority,
  Habit,
  Transaction,
  Budget,
  SavingsGoal,
  StudyCard,
  StudyResource,
  KaizenEntry,
  KeyResult,
  Goal,
  HealthLog,
  NotificationItem,
  SystemIssue,
  UserProfile,
  TrackerRow,
} from '@lifeos/shared';
import { eventsApi } from './api';

/* ============================================
   Offline-first sync constants
   ============================================ */

const STORAGE_KEY = 'lifeos_database_v2';
const SYNC_QUEUE_KEY = 'lifeos_sync_queue_v2';
const SYNC_INTERVAL_MS = 5_000;
const MAX_SYNC_RETRIES = 3;

/* ============================================
   Shared types / defaults
   ============================================ */

function getTodayIso(): string {
  const d = new Date();
  return d.toISOString().split('T')[0];
}

function getOffsetDateIso(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
}

const todayStr = getTodayIso();
const yesterdayStr = getOffsetDateIso(-1);
const dayBeforeYesterdayStr = getOffsetDateIso(-2);
const day3AgoStr = getOffsetDateIso(-3);

/* ============================================
   Initial database state (demo data)
   ============================================ */

export const INITIAL_DATABASE: DatabaseState = {
  user: {
    name: 'Senior Developer',
    level: 1,
    xp: 0,
    streak: 0,
    lifeScore: 0,
  },
  tasks: [
    {
      id: 'task-1',
      title: 'Tizim arxitekturasini optimallashtirish',
      description: 'Turborepo + Next.js App Router modullarini toliq type-safe qilish',
      status: 'in_progress',
      priority: 'urgent',
      color: '#3b82f6',
      icon: 'Cpu',
      tags: ['Arxitektura', 'Web', 'Refactor'],
      dueDate: todayStr,
      createdAt: yesterdayStr,
    },
    {
      id: 'task-2',
      title: 'Kanban doskasi uchun Drag-and-Drop integratsiyasi',
      description: 'HTML5 Drag & Drop orqali kartochkalarni real vaqt rejimida surish',
      status: 'in_progress',
      priority: 'high',
      color: '#10b981',
      icon: 'Kanban',
      tags: ['Frontend', 'UI'],
      dueDate: todayStr,
      createdAt: yesterdayStr,
    },
    {
      id: 'task-3',
      title: 'Active Recall SM-2 flashcard algoritmini sinovdan otkazish',
      description: 'SuperMemo-2 algoritmi boyicha oraliqlarni tekshirish va kartochkalarni takrorlash',
      status: 'todo',
      priority: 'medium',
      color: '#8b5cf6',
      icon: 'GraduationCap',
      tags: ['Study', 'SM2'],
      dueDate: getOffsetDateIso(1),
      createdAt: todayStr,
    },
    {
      id: 'task-4',
      title: 'Oylik byudjet va xarajatlar limitini yangilash',
      description: 'Transport va oziq-ovqat limitlarini tahlil qilish',
      status: 'todo',
      priority: 'medium',
      color: '#f59e0b',
      icon: 'Wallet',
      tags: ['Moliya'],
      dueDate: getOffsetDateIso(2),
      createdAt: todayStr,
    },
    {
      id: 'task-5',
      title: 'Excel-uslub tracker jadvalini yaratish',
      description: 'Uyqu, suv va mashgulotlar katakchalarini inline tahrirlanadigan qilish',
      status: 'done',
      priority: 'high',
      color: '#06b6d4',
      icon: 'Table',
      tags: ['Tracker', 'UI'],
      dueDate: yesterdayStr,
      createdAt: day3AgoStr,
      completedAt: yesterdayStr,
    },
    {
      id: 'task-6',
      title: 'SOC Analitika 3-modul video darslarini korish',
      description: 'Network traffic tahlili va Wireshark bilan ishlash',
      status: 'backlog',
      priority: 'low',
      color: '#64748b',
      icon: 'BookOpen',
      tags: ['Xavfsizlik', 'Kurs'],
      dueDate: getOffsetDateIso(5),
      createdAt: dayBeforeYesterdayStr,
    },
  ],
  habits: [
    {
      id: 'habit-1',
      name: 'Ertalabki yugurish va badantarbiya',
      targetDays: 30,
      color: '#10b981',
      icon: 'Activity',
      streak: 0,
      bestStreak: 0,
      completedDates: [],
      reminderTime: '06:30',
      timeOfDay: 'morning',
    },
    {
      id: 'habit-2',
      name: '2 litr toza suv ichish',
      targetDays: 30,
      color: '#06b6d4',
      icon: 'Droplets',
      streak: 0,
      bestStreak: 0,
      completedDates: [],
      reminderTime: '09:00',
      timeOfDay: 'morning',
    },
    {
      id: 'habit-3',
      name: '45 daqiqa ingliz tili / IELTS tayyorgarlik',
      targetDays: 60,
      color: '#8b5cf6',
      icon: 'BookOpen',
      streak: 0,
      bestStreak: 0,
      completedDates: [],
      reminderTime: '17:00',
      timeOfDay: 'afternoon',
    },
    {
      id: 'habit-4',
      name: 'Kechki 1% Kaizen retrospektivasi',
      targetDays: 30,
      color: '#f59e0b',
      icon: 'CheckSquare',
      streak: 0,
      bestStreak: 0,
      completedDates: [],
      reminderTime: '22:00',
      timeOfDay: 'evening',
    },
  ],
  trackers: [
    {
      id: 'track-sleep',
      name: 'Uyqu (soat)',
      icon: 'Moon',
      unit: 'soat',
      goal: 8,
      values: {
        [day3AgoStr]: 7.5,
        [dayBeforeYesterdayStr]: 8.0,
        [yesterdayStr]: 7.2,
        [todayStr]: 8.1,
      },
    },
    {
      id: 'track-tasks',
      name: 'Vazifalar diqqati',
      icon: 'CheckCircle',
      unit: 'soat',
      goal: 6,
      values: {
        [day3AgoStr]: 6.5,
        [dayBeforeYesterdayStr]: 5.5,
        [yesterdayStr]: 7.0,
        [todayStr]: 6.2,
      },
    },
    {
      id: 'track-study',
      name: "O'qish & Ilm",
      icon: 'BookOpen',
      unit: 'soat',
      goal: 2.5,
      values: {
        [day3AgoStr]: 2.0,
        [dayBeforeYesterdayStr]: 2.5,
        [yesterdayStr]: 3.0,
        [todayStr]: 2.5,
      },
    },
    {
      id: 'track-water',
      name: 'Suv (stakan)',
      icon: 'Droplets',
      unit: 'stakan',
      goal: 8,
      values: {
        [day3AgoStr]: 8,
        [dayBeforeYesterdayStr]: 7,
        [yesterdayStr]: 8,
        [todayStr]: 7,
      },
    },
    {
      id: 'track-workout',
      name: 'Mashg\'ulot (daqiqa)',
      icon: 'Dumbbell',
      unit: 'daq',
      goal: 45,
      values: {
        [day3AgoStr]: 45,
        [dayBeforeYesterdayStr]: 30,
        [yesterdayStr]: 50,
        [todayStr]: 45,
      },
    },
  ],
  transactions: [
    {
      id: 'tx-1',
      type: 'income',
      category: 'Maosh / Freelance',
      amount: 25000000,
      description: 'Loyiha oylik to\'lovi',
      date: todayStr,
    },
    {
      id: 'tx-2',
      type: 'expense',
      category: 'Oziq-ovqat',
      amount: 450000,
      description: 'Supermarket xaridlari',
      date: todayStr,
    },
    {
      id: 'tx-3',
      type: 'expense',
      category: "Ta'lim & Kitoblar",
      amount: 320000,
      description: 'Algoritmlar bo\'yicha yangi qo\'llanma',
      date: yesterdayStr,
    },
    {
      id: 'tx-4',
      type: 'expense',
      category: 'Transport',
      amount: 120000,
      description: 'Yoqilg\'i xarajati',
      date: yesterdayStr,
    },
    {
      id: 'tx-5',
      type: 'income',
      category: 'Keshbek & Bonus',
      amount: 85000,
      description: 'Bank kartasi keshbeki',
      date: dayBeforeYesterdayStr,
    },
  ],
  budgets: [
    {
      id: 'b-1',
      category: 'Oziq-ovqat',
      limit: 4000000,
      spent: 1850000,
      month: '2026-10',
    },
    {
      id: 'b-2',
      category: "Ta'lim & Kurslar",
      limit: 2500000,
      spent: 1120000,
      month: '2026-10',
    },
    {
      id: 'b-3',
      category: 'Transport & Yoqilg\'i',
      limit: 1500000,
      spent: 890000,
      month: '2026-10',
    },
    {
      id: 'b-4',
      category: "Ko'ngilochar & Dam olish",
      limit: 1200000,
      spent: 980000,
      month: '2026-10',
    },
  ],
  savings: [
    {
      id: 'save-1',
      name: 'Xavfsizlik yostig\'i (Emergency Fund)',
      targetAmount: 50000000,
      currentAmount: 34500000,
      targetDate: '2026-12-31',
      icon: 'ShieldCheck',
    },
    {
      id: 'save-2',
      name: 'Yangi MacBook Pro M4 & Ish stantsiyasi',
      targetAmount: 30000000,
      currentAmount: 22000000,
      targetDate: '2026-11-30',
      icon: 'Laptop',
    },
    {
      id: 'save-3',
      name: 'Sayohat & Tog\' dam olishi',
      targetAmount: 10000000,
      currentAmount: 6400000,
      targetDate: '2027-01-15',
      icon: 'Plane',
    },
  ],
  studyCards: [
    {
      id: 'card-1',
      deck: 'Web Arxitekturasi',
      front: 'Turborepo da pnpm workspace qanday qilib dependencies bog\'liqliklarini ajratadi?',
      back: 'pnpm hard-linklar va symlinklar asosida qat\'iy node_modules izolyatsiyasini taminlaydi va paketlarni workspace:* protokoli orqali bog\'laydi.',
      easinessFactor: 2.5,
      interval: 1,
      repetitions: 1,
      nextReviewDate: todayStr,
    },
    {
      id: 'card-2',
      deck: 'Kiberxavfsizlik (SOC)',
      front: 'MITRE ATT&CK matritsasida Tactic va Technique farqi nima?',
      back: 'Tactic — bu hujumchining maqsadi (masalan, Persistence). Technique — ushbu maqsadga qanday texnik vositalar bilan erishish yo\'li.',
      easinessFactor: 2.6,
      interval: 6,
      repetitions: 2,
      nextReviewDate: todayStr,
    },
    {
      id: 'card-3',
      deck: 'Algoritmlar',
      front: 'QuickSort ning eng yomon holatdagi vaqt murakkabligi (Worst-case) qanday va qachon yuz beradi?',
      back: 'O(n^2), agar pivot sifatida doimo eng kichik yoki eng katta element tanlansa (masalan, allaqachon tartiblangan massivda).',
      easinessFactor: 2.5,
      interval: 3,
      repetitions: 2,
      nextReviewDate: getOffsetDateIso(1),
    },
    {
      id: 'card-4',
      deck: 'IELTS Vocabulary',
      front: 'Nima degani: "Substantiate" (Fe\'l)?',
      back: 'Dalillar yoki isbotlar bilan tasdiqlamoq, asoslab bermoq (To provide evidence to support or prove the truth of).',
      easinessFactor: 2.4,
      interval: 4,
      repetitions: 2,
      nextReviewDate: getOffsetDateIso(2),
    },
  ],
  studyResources: [
    {
      id: 'res-1',
      title: 'Designing Data-Intensive Applications (Martin Kleppmann)',
      type: 'book',
      url: 'https://dataintensive.net',
      status: 'reading',
      progress: 68,
    },
    {
      id: 'res-2',
      title: 'SOC Analyst Level 1 — TryHackMe Path',
      type: 'course',
      url: 'https://tryhackme.com',
      status: 'reading',
      progress: 45,
    },
    {
      id: 'res-3',
      title: 'React 19 Server Components Deep Dive',
      type: 'article',
      url: 'https://react.dev',
      status: 'completed',
      progress: 100,
    },
  ],
  kaizenEntries: [
    {
      id: 'k-1',
      date: yesterdayStr,
      wins: [
        'Barcha asosiy komponentlarni React 19 va Next.js 15 ga moslashtirdim',
        'Kunlik suv normasini 100% bajardim',
      ],
      improvements: 'Ertalabki diqqat blokida ijtimoiy tarmoqlarni umuman ochmaslik',
      learnings: 'Kichik 1% yaxshilanishlar yil davomida 37 barobar o\'sish beradi (Compound Effect).',
      rating: 5,
    },
    {
      id: 'k-2',
      date: dayBeforeYesterdayStr,
      wins: ['20 ta yangi Flashcard qo\'shdim va takrorladim'],
      improvements: 'Uyquga 23:00 dan kech qolmaslik',
      learnings: 'Muntazamlik kuchdan ustun.',
      rating: 4,
    },
  ],
  goals: [
    {
      id: 'g-1',
      title: 'Senior darajasidagi shaxsiy tizim va bilimlarni to\'liq avtomatlashtirish',
      category: 'Karyera',
      quarter: 'Q4',
      targetDate: '2026-12-31',
      progress: 75,
      keyResults: [
        { id: 'kr-1', title: 'LifeOS loyihasini to\'liq reaktiv va toza dizaynga o\'tkazish', completed: true, progress: 100 },
        { id: 'kr-2', title: 'SOC tahlil sertifikatini muvaffaqiyatli topshirish', completed: false, progress: 60 },
        { id: 'kr-3', title: 'IELTS ko\'rsatkichini 7.5+ darajaga chiqarish', completed: false, progress: 70 },
      ],
    },
    {
      id: 'g-2',
      title: 'Moliya va Jamg\'arma strategiyasini mustahkamlash',
      category: 'Moliya',
      quarter: 'Q4',
      targetDate: '2026-12-31',
      progress: 80,
      keyResults: [
        { id: 'kr-4', title: 'Oylik xarajatlarni belgilangan byudjetdan oshirmaslik', completed: true, progress: 90 },
        { id: 'kr-5', title: 'Xavfsizlik yostig\'iga qo\'shimcha 10 mln jamg\'arish', completed: false, progress: 70 },
      ],
    },
  ],
  healthLogs: {
    [todayStr]: {
      date: todayStr,
      waterGlasses: 7,
      sleepHours: 8.1,
      sleepQuality: "A'lo (Tinch uyqu)",
      workoutMinutes: 45,
      workoutType: 'Yugurish & Turnik',
    },
    [yesterdayStr]: {
      date: yesterdayStr,
      waterGlasses: 8,
      sleepHours: 7.2,
      sleepQuality: 'Yaxshi',
      workoutMinutes: 50,
      workoutType: 'Kardio va Press',
    },
  },
  notifications: [
    {
      id: 'notif-1',
      title: 'Streak saqlandi! 🔥',
      message: 'Siz ketma-ket 18 kun davomida faolsiz. Baraka toping!',
      type: 'success',
      time: '10 daqiqa oldin',
      read: false,
    },
    {
      id: 'notif-2',
      title: 'SM-2 Takrorlash vaqti',
      message: 'Bugun 2 ta Active Recall kartochkasini takrorlash navbati keldi.',
      type: 'info',
      time: '1 soat oldin',
      read: false,
    },
    {
      id: 'notif-3',
      title: 'Byudjet ogohlantirishi ⚠️',
      message: "Ko'ngilochar xarajatlar oylik limitning 82% iga yetdi.",
      type: 'warning',
      time: '3 soat oldin',
      read: true,
    },
  ],
  issues: [
    {
      id: 'iss-1',
      title: "Ko'ngilochar byudjet chegarasi (82%)",
      description: 'Oylik byudjetingiz 80% dan oshdi. Xarajatlarni optimallashtirish tavsiya etiladi.',
      type: 'budget',
      resolved: false,
    },
    {
      id: 'iss-2',
      title: 'Mahalliy ma\'lumotlar sinxronizatsiyasi',
      description: 'Barcha ma\'lumotlar brauzer local storage bazasida xavfsiz saqlanmoqda.',
      type: 'sync',
      resolved: false,
    },
  ],
};

/* ============================================
   Validation helpers (Zod)
   ============================================ */

// Re-export shared types for convenience
export type { TaskStatus, TaskPriority, Task, Transaction, Budget, SavingsGoal, HealthLog, Goal, Habit, StudyCard, StudyResource, KaizenEntry, UserProfile, TrackerRow } from '@lifeos/shared';

export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { ok: true; data: T } | { ok: false; error: z.ZodError } {
  const result = schema.safeParse(input);
  if (!result.success) return { ok: false, error: result.error };
  return { ok: true, data: result.data };
}

/* ============================================
   Sync queue types
   ============================================ */

export type SyncOperation =
  | { op: 'create_task'; payload: Omit<Task, 'id' | 'createdAt'> }
  | { op: 'update_task'; payload: { id: string; updates: Partial<Task> } }
  | { op: 'move_task'; payload: { taskId: string; status: TaskStatus } }
  | { op: 'delete_task'; payload: { id: string } }
  | { op: 'toggle_habit'; payload: { id: string; date?: string } }
  | { op: 'add_habit'; payload: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completedDates'> }
  | { op: 'add_transaction'; payload: Omit<Transaction, 'id'> }
  | { op: 'add_savings'; payload: { id: string; amount: number } }
  | { op: 'rate_card'; payload: { cardId: string; quality: number } }
  | { op: 'add_goal'; payload: Omit<Goal, 'id'> }
  | { op: 'log_health'; payload: { date: string; partial: Partial<HealthLog> } };

export interface SyncQueueItem {
  id: string;
  op: SyncOperation['op'];
  payload: unknown;
  createdAt: string;
  retries: number;
}

/* ============================================
   Supabase sync client (lazy)
   ============================================ */

let supabaseClient: any = null;

function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  try {
    // @ts-ignore - created by @supabase/ssr or @supabase/supabase-js
    const { createClient } = require('@supabase/supabase-js');
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !anonKey) return null;
    supabaseClient = createClient(url, anonKey);
    return supabaseClient;
  } catch {
    return null;
  }
}

/* ============================================
   Offline sync engine
   ============================================ */

function loadSyncQueue(): SyncQueueItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SYNC_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSyncQueue(queue: SyncQueueItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  } catch {
    // silent
  }
}

async function syncQueueItem(item: SyncQueueItem): Promise<boolean> {
  const sb = getSupabaseClient();
  if (!sb) return false;

  try {
    switch (item.op) {
      case 'create_task': {
        const p = item.payload as Omit<Task, 'id' | 'createdAt'>;
        await sb.from('tasks').insert({ user_id: (await sb.auth.getUser()).data.user?.id, ...p });
        break;
      }
      case 'update_task': {
        const p = item.payload as { id: string; updates: Partial<Task> };
        await sb.from('tasks').update(p.updates).eq('id', p.id);
        break;
      }
      case 'move_task': {
        const p = item.payload as { taskId: string; status: TaskStatus };
        const updates: Partial<Task> = { status: p.status };
        if (p.status === 'done') updates.completed_at = new Date().toISOString();
        await sb.from('tasks').update(updates).eq('id', p.taskId);
        break;
      }
      case 'delete_task': {
        const p = item.payload as { id: string };
        await sb.from('tasks').delete().eq('id', p.id);
        break;
      }
      case 'toggle_habit': {
        const p = item.payload as { id: string; date?: string };
        await sb.from('habit_logs').upsert({ habit_id: p.id, date: p.date ?? todayStr, completed: true });
        break;
      }
      default:
        break;
    }
    return true;
  } catch {
    return false;
  }
}

/* ============================================
   StoreEngine class
   ============================================ */

class StoreEngine {
  private state: DatabaseState;
  private listeners: Set<() => void> = new Set();
  private syncTimer: ReturnType<typeof setInterval> | null = null;
  private syncInProgress = false;

  constructor() {
    this.state = INITIAL_DATABASE;
    this.loadFromStorage();
    this.startSyncTimer();
  }

  /* ---------- Storage ---------- */

  private loadFromStorage() {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.state = { ...INITIAL_DATABASE, ...parsed };
        this.recalculateUserMetrics();
      }
    } catch (e) {
      console.error('Failed to load store from localStorage', e);
    }
  }

  private persist() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  private notify() {
    this.persist();
    this.listeners.forEach((fn) => fn());
  }

  /* ---------- Sync timer ---------- */

  private startSyncTimer() {
    if (typeof window === 'undefined') return;
    this.syncTimer = setInterval(() => this.processSyncQueue(), SYNC_INTERVAL_MS);
  }

  private stopSyncTimer() {
    if (this.syncTimer) clearInterval(this.syncTimer);
    this.syncTimer = null;
  }

  private async processSyncQueue() {
    if (this.syncInProgress) return;
    this.syncInProgress = true;

    const queue = loadSyncQueue();
    if (queue.length === 0) {
      this.syncInProgress = false;
      return;
    }

    const remaining: SyncQueueItem[] = [];
    for (const item of queue) {
      const ok = await syncQueueItem(item);
      if (!ok) {
        item.retries += 1;
        if (item.retries < MAX_SYNC_RETRIES) remaining.push(item);
      }
    }
    saveSyncQueue(remaining);
    this.syncInProgress = false;
  }

  /* ---------- Getters ---------- */

  public getState(): DatabaseState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  /* ---------- Recalculate metrics (rules) ---------- */

  private recalculateUserMetrics() {
    const { user } = this.state;

    // Calculate level from current XP
    const newLevel = calculateLevel(user.xp);

    // Calculate life score from today's logs
    const healthLog = this.state.healthLogs[todayStr];
    const dailyData = {
      tasksCompleted: this.state.tasks.filter((t) => t.status === 'done').length,
      tasksTotal: this.state.tasks.length,
      studyMinutes: this.state.studySessions?.reduce((s, c) => s + c.duration_minutes, 0) ?? 0,
      habitsCompleted: this.state.habits.filter((h) => h.completedDates.includes(todayStr)).length,
      habitsTotal: this.state.habits.length,
      timeLoggedMinutes: this.state.timeLogs?.reduce((s, c) => s + (c.duration_minutes ?? 0), 0) ?? 0,
      sleepHours: healthLog?.sleepHours,
      exerciseMinutes: healthLog?.workoutMinutes,
      energyLevel: undefined,
      budgetSpent: undefined,
      budgetAllocated: undefined,
    };

    const validation = validateInput(dailyDataSchema, dailyData);
    let lifeScore = 0;
    if (validation.ok) {
      lifeScore = calculateLifeScore(validation.data);
    }

    this.state = {
      ...this.state,
      user: {
        ...user,
        level: newLevel,
        lifeScore,
      },
    };
  }

  /* ---------- Tasks CRUD ---------- */

  public addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    // Zod validation
    const validation = validateInput(createTaskSchema, task);
    if (!validation.ok) {
      throw new Error(`Task validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`);
    }

    const newTask: Task = {
      ...validation.data,
      id: `task-${Date.now()}`,
      createdAt: getTodayIso(),
    };

    // Optimistic XP update via @lifeos/rules
    const xpReward = calculateXP('task_created');
    const newXp = this.state.user.xp + xpReward;
    const newLevel = calculateLevel(newXp);

    this.state = {
      ...this.state,
      tasks: [newTask, ...this.state.tasks],
      user: {
        ...this.state.user,
        xp: newXp,
        level: newLevel,
      },
    };

    // Queue sync to Supabase
    this.enqueueSync({ op: 'create_task', payload: task });

    this.notify();

    void logEventToBackend('task_created', 'productivity', newTask.title, undefined, {
      priority: newTask.priority,
    }, 'web');
  }

  public updateTask(id: string, updates: Partial<Task>) {
    const existing = this.state.tasks.find((t) => t.id === id);
    if (!existing) throw new Error(`Task ${id} not found`);

    this.state = {
      ...this.state,
      tasks: this.state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    };

    this.enqueueSync({ op: 'update_task', payload: { id, updates } });
    this.notify();
  }

  public moveTask(taskId: string, status: TaskStatus) {
    const existing = this.state.tasks.find((t) => t.id === taskId);
    if (!existing) throw new Error(`Task ${taskId} not found`);

    const isDone = status === 'done';
    const alreadyDone = existing.status === 'done';

    this.state = {
      ...this.state,
      tasks: this.state.tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            status,
            completedAt: isDone ? getTodayIso() : undefined,
          };
        }
        return t;
      }),
    };

    // XP only if transitioning TO done (not already done)
    if (isDone && !alreadyDone) {
      const xpReward = calculateTaskXP(existing.priority);
      const newXp = this.state.user.xp + xpReward;
      const newLevel = calculateLevel(newXp);
      this.state = {
        ...this.state,
        user: { ...this.state.user, xp: newXp, level: newLevel },
      };
    }

    this.enqueueSync({ op: 'move_task', payload: { taskId, status } });
    this.notify();
  }

  public deleteTask(id: string) {
    this.state = {
      ...this.state,
      tasks: this.state.tasks.filter((t) => t.id !== id),
    };
    this.enqueueSync({ op: 'delete_task', payload: { id } });
    this.notify();
  }

  /* ---------- Habits CRUD ---------- */

  public toggleHabit(id: string, date: string = getTodayIso()) {
    const habit = this.state.habits.find((h) => h.id === id);
    if (!habit) throw new Error(`Habit ${id} not found`);

    const exists = habit.completedDates.includes(date);
    const isCompleted = !exists;

    this.state = {
      ...this.state,
      habits: this.state.habits.map((h) => {
        if (h.id === id) {
          const nextDates = exists
            ? h.completedDates.filter((d) => d !== date)
            : [...h.completedDates, date];
          const newStreak = exists ? Math.max(0, h.streak - 1) : h.streak + 1;
          const best = Math.max(h.bestStreak, newStreak);
          return { ...h, completedDates: nextDates, streak: newStreak, bestStreak: best };
        }
        return h;
      }),
    };

    if (isCompleted) {
      const xpReward = calculateXP('habit_done');
      const streakXP = calculateStreakXP(habit.streak + 1);
      const newXp = this.state.user.xp + xpReward + streakXP;
      const newLevel = calculateLevel(newXp);
      this.state = {
        ...this.state,
        user: { ...this.state.user, xp: newXp, level: newLevel },
      };
    }

    this.enqueueSync({ op: 'toggle_habit', payload: { id, date } });
    this.notify();
  }

  public addHabit(habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completedDates'>) {
    const validation = validateInput(createHabitSchema, habit);
    if (!validation.ok) {
      throw new Error(`Habit validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`);
    }

    const newHabit: Habit = {
      ...validation.data,
      id: `habit-${Date.now()}`,
      streak: 0,
      bestStreak: 0,
      completedDates: [],
    };

    this.state = {
      ...this.state,
      habits: [...this.state.habits, newHabit],
    };
    this.notify();
  }

  public deleteHabit(id: string) {
    this.state = {
      ...this.state,
      habits: this.state.habits.filter((h) => h.id !== id),
    };
    this.notify();
  }

  /* ---------- Trackers ---------- */

  public updateTrackerCell(id: string, date: string, value: number) {
    this.state = {
      ...this.state,
      trackers: this.state.trackers.map((t) => {
        if (t.id === id) {
          return { ...t, values: { ...t.values, [date]: value } };
        }
        return t;
      }),
    };
    this.notify();
  }

  public addTracker(tracker: Omit<TrackerRow, 'id' | 'values'>) {
    const newTracker: TrackerRow = {
      ...tracker,
      id: `track-${Date.now()}`,
      values: {},
    };
    this.state = { ...this.state, trackers: [...this.state.trackers, newTracker] };
    this.notify();
  }

  public deleteTracker(id: string) {
    this.state = {
      ...this.state,
      trackers: this.state.trackers.filter((t) => t.id !== id),
    };
    this.notify();
  }

  /* ---------- Finance CRUD ---------- */

  public addTransaction(tx: Omit<Transaction, 'id'>) {
    const validation = validateInput(createTransactionSchema, tx);
    if (!validation.ok) {
      throw new Error(`Transaction validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`);
    }

    const newTx: Transaction = { ...validation.data, id: `tx-${Date.now()}` };

    let nextBudgets = [...this.state.budgets];
    if (tx.type === 'expense') {
      nextBudgets = nextBudgets.map((b) => {
        if (b.category.toLowerCase().includes(tx.category.toLowerCase()) || tx.category.toLowerCase().includes(b.category.toLowerCase())) {
          return { ...b, spent: b.spent + tx.amount };
        }
        return b;
      });
    }

    const xpReward = calculateXP('budget_under');
    const newXp = this.state.user.xp + xpReward;
    const newLevel = calculateLevel(newXp);

    this.state = {
      ...this.state,
      transactions: [newTx, ...this.state.transactions],
      budgets: nextBudgets,
      user: { ...this.state.user, xp: newXp, level: newLevel },
    };

    void logEventToBackend('finance_transaction', 'finance', tx.description || tx.category, undefined, {
      amount: tx.amount,
      type: tx.type,
      category: tx.category,
    });
    this.notify();
  }

  public deleteTransaction(id: string) {
    this.state = {
      ...this.state,
      transactions: this.state.transactions.filter((tx) => tx.id !== id),
    };
    this.notify();
  }

  public addBudget(budget: Omit<Budget, 'id' | 'spent'>) {
    const validation = validateInput(createBudgetCategorySchema, budget);
    if (!validation.ok) {
      throw new Error(`Budget validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`);
    }
    const newBudget: Budget = { ...validation.data, id: `b-${Date.now()}`, spent: 0 };
    this.state = { ...this.state, budgets: [...this.state.budgets, newBudget] };
    this.notify();
  }

  public updateBudget(id: string, updates: Partial<Budget>) {
    this.state = {
      ...this.state,
      budgets: this.state.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
    };
    this.notify();
  }

  public depositSavings(id: string, amount: number) {
    const newXp = this.state.user.xp + calculateXP('savings_contribution');
    const newLevel = calculateLevel(newXp);

    this.state = {
      ...this.state,
      savings: this.state.savings.map((s) => {
        if (s.id === id) return { ...s, currentAmount: s.currentAmount + amount };
        return s;
      }),
      user: { ...this.state.user, xp: newXp, level: newLevel },
    };
    this.notify();
  }

  public addSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) {
    const validation = validateInput(createSavingsGoalSchema, goal);
    if (!validation.ok) {
      throw new Error(`Savings goal validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`);
    }
    const newGoal: SavingsGoal = { ...validation.data, id: `save-${Date.now()}`, currentAmount: 0 };
    this.state = { ...this.state, savings: [...this.state.savings, newGoal] };
    this.notify();
  }

  /* ---------- Study / SM-2 ---------- */

  public rateCard(cardId: string, quality: number) {
    const validation = validateInput(sm2InputSchema, { quality, easinessFactor: 2.5, interval: 1, repetitions: 0 });
    if (!validation.ok) {
      throw new Error(`SM-2 validation failed: ${validation.error.errors.map(e => e.message).join(', ')}`);
    }

    const card = this.state.studyCards.find((c) => c.id === cardId);
    if (!card) throw new Error(`Card ${cardId} not found`);

    const sm2Result = calculateSM2({
      quality,
      easinessFactor: card.easinessFactor,
      interval: card.interval,
      repetitions: card.repetitions,
    });

    this.state = {
      ...this.state,
      studyCards: this.state.studyCards.map((c) => {
        if (c.id === cardId) {
          return {
            ...c,
            easinessFactor: sm2Result.easinessFactor,
            interval: sm2Result.interval,
            repetitions: sm2Result.repetitions,
            lastQuality: quality,
            nextReviewDate: sm2Result.nextReviewDate.toISOString().split('T')[0],
          };
        }
        return c;
      }),
      user: {
        ...this.state.user,
        xp: this.state.user.xp + calculateXP('flashcard_review'),
        level: calculateLevel(this.state.user.xp + calculateXP('flashcard_review')),
      },
    };
    this.notify();
  }

  public addStudyCard(card: Omit<StudyCard, 'id' | 'easinessFactor' | 'interval' | 'repetitions' | 'nextReviewDate'>) {
    const newCard: StudyCard = {
      ...card,
      id: `card-${Date.now()}`,
      easinessFactor: 2.5,
      interval: 1,
      repetitions: 0,
      nextReviewDate: getTodayIso(),
    };
    this.state = { ...this.state, studyCards: [...this.state.studyCards, newCard] };
    this.notify();
  }

  public addStudyResource(resource: Omit<StudyResource, 'id'>) {
    const newRes: StudyResource = { ...resource, id: `res-${Date.now()}` };
    this.state = { ...this.state, studyResources: [...this.state.studyResources, newRes] };
    this.notify();
  }

  public updateStudyResource(id: string, updates: Partial<StudyResource>) {
    this.state = {
      ...this.state,
      studyResources: this.state.studyResources.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    };
    this.notify();
  }

  /* ---------- Kaizen ---------- */

  public addKaizenEntry(entry: Omit<KaizenEntry, 'id' | 'date'>) {
    const newEntry: KaizenEntry = { ...entry, id: `k-${Date.now()}`, date: getTodayIso() };
    const newXp = this.state.user.xp + calculateXP('kaizen_completed');
    const newLevel = calculateLevel(newXp);

    this.state = {
      ...this.state,
      kaizenEntries: [newEntry, ...this.state.kaizenEntries],
      user: { ...this.state.user, xp: newXp, level: newLevel },
    };
    this.notify();
  }

  /* ---------- Goals ---------- */

  public addGoal(goal: Omit<Goal, 'id'>) {
    const newGoal: Goal = { ...goal, id: `g-${Date.now()}` };
    this.state = { ...this.state, goals: [...this.state.goals, newGoal] };
    this.notify();
  }

  public updateGoalProgress(goalId: string, progress: number) {
    this.state = {
      ...this.state,
      goals: this.state.goals.map((g) => (g.id === goalId ? { ...g, progress } : g)),
    };
    this.notify();
  }

  public toggleKeyResult(goalId: string, krId: string) {
    this.state = {
      ...this.state,
      goals: this.state.goals.map((g) => {
        if (g.id === goalId) {
          const nextKRs = g.keyResults.map((kr) => {
            if (kr.id === krId) {
              const comp = !kr.completed;
              return { ...kr, completed: comp, progress: comp ? 100 : 0 };
            }
            return kr;
          });
          const totalProgress = Math.round(nextKRs.reduce((sum, kr) => sum + kr.progress, 0) / nextKRs.length);
          return { ...g, keyResults: nextKRs, progress: totalProgress };
        }
        return g;
      }),
    };
    this.notify();
  }

  /* ---------- Health ---------- */

  public logHealth(date: string, partial: Partial<HealthLog>) {
    const current = this.state.healthLogs[date] || {
      date,
      waterGlasses: 0,
      sleepHours: 0,
      sleepQuality: 'Yaxshi',
      workoutMinutes: 0,
      workoutType: 'Erkin',
    };

    this.state = {
      ...this.state,
      healthLogs: {
        ...this.state.healthLogs,
        [date]: { ...current, ...partial },
      },
    };

    // Recalculate life score after health log change
    this.recalculateUserMetrics();
    this.notify();
  }

  /* ---------- Notifications ---------- */

  public markNotificationRead(id: string) {
    this.state = {
      ...this.state,
      notifications: this.state.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
    };
    this.notify();
  }

  public markAllNotificationsRead() {
    this.state = {
      ...this.state,
      notifications: this.state.notifications.map((n) => ({ ...n, read: true })),
    };
    this.notify();
  }

  public clearAllNotifications() {
    this.state = { ...this.state, notifications: [] };
    this.notify();
  }

  /* ---------- Issues ---------- */

  public resolveIssue(id: string) {
    this.state = {
      ...this.state,
      issues: this.state.issues.map((iss) => (iss.id === id ? { ...iss, resolved: true } : iss)),
    };
    this.notify();
  }

  /* ---------- Sync queue ---------- */

  private enqueueSync(op: SyncOperation['op'], payload: unknown) {
    const item: SyncQueueItem = {
      id: `sync-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      op,
      payload,
      createdAt: new Date().toISOString(),
      retries: 0,
    };
    const queue = loadSyncQueue();
    queue.push(item);
    saveSyncQueue(queue);
    // Trigger immediate background sync
    void this.processSyncQueue();
  }

  /* ---------- Reset / Export / Import ---------- */

  public resetToDefaults() {
    this.state = INITIAL_DATABASE;
    this.notify();
  }

  public exportJSON(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importJSON(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed && typeof parsed === 'object') {
        this.state = { ...INITIAL_DATABASE, ...parsed };
        this.recalculateUserMetrics();
        this.notify();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public importData(data: DatabaseState) {
    this.state = data;
    this.recalculateUserMetrics();
    this.notify();
  }

  public destroy() {
    this.stopSyncTimer();
  }
}

/* ============================================
   Singleton + React hook
   ============================================ */

export const store = new StoreEngine();
export const storeEngine = store;

export function useLifeOS() {
  const [state, setState] = useState<DatabaseState>(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState({ ...store.getState() });
    });
    return unsubscribe;
  }, []);

  /* Derived helpers (rules-driven) */
  const user = state.user;

  /* Tasks */
  const addTask = (task: Omit<Task, 'id' | 'createdAt'>) => store.addTask(task);
  const updateTask = (id: string, updates: Partial<Task>) => store.updateTask(id, updates);
  const moveTask = (taskId: string, status: TaskStatus) => store.moveTask(taskId, status);
  const deleteTask = (id: string) => store.deleteTask(id);

  /* Habits */
  const toggleHabit = (id: string, date?: string) => store.toggleHabit(id, date);
  const addHabit = (habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completedDates'>) =>
    store.addHabit(habit);
  const deleteHabit = (id: string) => store.deleteHabit(id);

  /* Trackers */
  const updateTrackerCell = (id: string, date: string, value: number) =>
    store.updateTrackerCell(id, date, value);
  const addTracker = (tracker: Omit<TrackerRow, 'id' | 'values'>) => store.addTracker(tracker);
  const deleteTracker = (id: string) => store.deleteTracker(id);

  /* Finance */
  const addTransaction = (tx: Omit<Transaction, 'id'>) => store.addTransaction(tx);
  const deleteTransaction = (id: string) => store.deleteTransaction(id);
  const addBudget = (budget: Omit<Budget, 'id' | 'spent'>) => store.addBudget(budget);
  const updateBudget = (id: string, updates: Partial<Budget>) => store.updateBudget(id, updates);
  const depositSavings = (id: string, amount: number) => store.depositSavings(id, amount);
  const addSavingsGoal = (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) =>
    store.addSavingsGoal(goal);

  /* Study */
  const rateCard = (cardId: string, quality: number) => store.rateCard(cardId, quality);
  const addStudyCard = (card: Omit<StudyCard, 'id' | 'easinessFactor' | 'interval' | 'repetitions' | 'nextReviewDate'>) =>
    store.addStudyCard(card);
  const addStudyResource = (res: Omit<StudyResource, 'id'>) => store.addStudyResource(res);
  const updateStudyResource = (id: string, updates: Partial<StudyResource>) =>
    store.updateStudyResource(id, updates);

  /* Kaizen */
  const addKaizenEntry = (entry: Omit<KaizenEntry, 'id' | 'date'>) => store.addKaizenEntry(entry);

  /* Goals */
  const addGoal = (goal: Omit<Goal, 'id'>) => store.addGoal(goal);
  const updateGoalProgress = (goalId: string, progress: number) => store.updateGoalProgress(goalId, progress);
  const toggleKeyResult = (goalId: string, krId: string) => store.toggleKeyResult(goalId, krId);

  /* Health */
  const logHealth = (date: string, partial: Partial<HealthLog>) => store.logHealth(date, partial);

  /* Notifications */
  const markNotificationRead = (id: string) => store.markNotificationRead(id);
  const markAllNotificationsRead = () => store.markAllNotificationsRead();
  const clearAllNotifications = () => store.clearAllNotifications();

  /* Issues */
  const resolveIssue = (id: string) => store.resolveIssue(id);

  /* Data utils */
  const resetToDefaults = () => store.resetToDefaults();
  const exportJSON = () => store.exportJSON();
  const importJSON = (jsonString: string) => store.importJSON(jsonString);
  const importData = (data: DatabaseState) => store.importData(data);

  return {
    ...state,
    user,
    addTask,
    updateTask,
    moveTask,
    deleteTask,
    toggleHabit,
    addHabit,
    deleteHabit,
    updateTrackerCell,
    addTracker,
    deleteTracker,
    addTransaction,
    deleteTransaction,
    addBudget,
    updateBudget,
    depositSavings,
    addSavingsGoal,
    rateCard,
    addStudyCard,
    addStudyResource,
    updateStudyResource,
    addKaizenEntry,
    addGoal,
    updateGoalProgress,
    toggleKeyResult,
    logHealth,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
    resolveIssue,
    resetToDefaults,
    exportJSON,
    importJSON,
    importData,
  };
}

/* ============================================
   Backend logging (best-effort, silent fail)
   ============================================ */

async function logEventToBackend(
  eventType: string,
  category: string,
  title: string,
  userId: string = 'default_user',
  context?: Record<string, any>,
  source: string = 'web'
) {
  try {
    await eventsApi.create({
      user_id: userId,
      event_type: eventType,
      event_category: category,
      title,
      context: context || {},
      source,
    });
  } catch {
    // Silent fail: local state still updates, backend sync is best-effort
  }
}
