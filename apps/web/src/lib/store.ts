'use client';

import { useState, useEffect } from 'react';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  color?: string;
  icon?: string;
  tags: string[];
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
}

export interface Habit {
  id: string;
  name: string;
  targetDays: number;
  color: string;
  icon: string;
  streak: number;
  bestStreak: number;
  completedDates: string[]; // YYYY-MM-DD
  reminderTime: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
}

export interface TrackerRow {
  id: string;
  name: string;
  icon: string;
  category?: string;
  unit: string;
  goal: number;
  frequency?: 'daily' | 'hourly' | 'weekly';
  targetType?: 'daily' | 'goal_indicator';
  isBoolean?: boolean;
  completedDates?: string[];
  values: Record<string, number>; // date "YYYY-MM-DD" -> numeric value
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  spent: number;
  month: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon: string;
}

export interface StudyCard {
  id: string;
  deck: string;
  front: string;
  back: string;
  easinessFactor: number;
  interval: number;
  repetitions: number;
  nextReviewDate: string;
  lastQuality?: number;
}

export interface StudyResource {
  id: string;
  title: string;
  type: 'book' | 'article' | 'course';
  url?: string;
  status: 'reading' | 'want_to_read' | 'completed';
  progress: number;
}

export interface KaizenEntry {
  id: string;
  date: string;
  wins: string[];
  improvements: string;
  learnings: string;
  rating: number;
}

export interface KeyResult {
  id: string;
  title: string;
  completed: boolean;
  progress: number;
}

export interface Goal {
  id: string;
  title: string;
  category: string;
  quarter: 'Q1' | 'Q2' | 'Q3' | 'Q4';
  targetDate: string;
  progress: number;
  keyResults: KeyResult[];
}

export interface HealthLog {
  date: string;
  waterGlasses: number;
  sleepHours: number;
  sleepQuality: string;
  workoutMinutes: number;
  workoutType: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  time: string;
  read: boolean;
}

export interface SystemIssue {
  id: string;
  title: string;
  description: string;
  type: 'sync' | 'overdue' | 'budget' | 'storage';
  resolved: boolean;
}

export interface UserProfile {
  name: string;
  level: number;
  xp: number;
  streak: number;
  lifeScore: number;
}

export interface DatabaseState {
  user: UserProfile;
  tasks: Task[];
  habits: Habit[];
  trackers: TrackerRow[];
  transactions: Transaction[];
  budgets: Budget[];
  savings: SavingsGoal[];
  studyCards: StudyCard[];
  studyResources: StudyResource[];
  kaizenEntries: KaizenEntry[];
  goals: Goal[];
  healthLogs: Record<string, HealthLog>;
  notifications: NotificationItem[];
  issues: SystemIssue[];
}

// Generate dates for current week
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

export const INITIAL_DATABASE: DatabaseState = {
  user: {
    name: 'Senior Developer',
    level: 14,
    xp: 4820,
    streak: 18,
    lifeScore: 89,
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
      streak: 18,
      bestStreak: 25,
      completedDates: [todayStr, yesterdayStr, dayBeforeYesterdayStr, day3AgoStr],
      reminderTime: '06:30',
      timeOfDay: 'morning',
    },
    {
      id: 'habit-2',
      name: '2 litr toza suv ichish',
      targetDays: 30,
      color: '#06b6d4',
      icon: 'Droplets',
      streak: 21,
      bestStreak: 21,
      completedDates: [todayStr, yesterdayStr, dayBeforeYesterdayStr, day3AgoStr],
      reminderTime: '09:00',
      timeOfDay: 'morning',
    },
    {
      id: 'habit-3',
      name: '45 daqiqa ingliz tili / IELTS tayyorgarlik',
      targetDays: 60,
      color: '#8b5cf6',
      icon: 'BookOpen',
      streak: 12,
      bestStreak: 19,
      completedDates: [yesterdayStr, dayBeforeYesterdayStr, day3AgoStr],
      reminderTime: '17:00',
      timeOfDay: 'afternoon',
    },
    {
      id: 'habit-4',
      name: 'Kechki 1% Kaizen retrospektivasi',
      targetDays: 30,
      color: '#f59e0b',
      icon: 'CheckSquare',
      streak: 14,
      bestStreak: 14,
      completedDates: [yesterdayStr, dayBeforeYesterdayStr, day3AgoStr],
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
      name: 'O\'qish & Ilm',
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
      category: 'Ta\'lim & Kitoblar',
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
      category: 'Ta\'lim & Kurslar',
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
      category: 'Ko\'ngilochar & Dam olish',
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
      sleepQuality: 'A\'lo (Tinch uyqu)',
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
      title: 'Streak saqlandi!',
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
      title: 'Byudjet ogohlantirishi',
      message: 'Ko\'ngilochar xarajatlar oylik limitning 82% iga yetdi.',
      type: 'warning',
      time: '3 soat oldin',
      read: true,
    },
  ],
  issues: [
    {
      id: 'iss-1',
      title: 'Ko\'ngilochar byudjet chegarasi (82%)',
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

const STORAGE_KEY = 'lifeos_database_v2';

class StoreEngine {
  private state: DatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = INITIAL_DATABASE;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          this.state = { ...INITIAL_DATABASE, ...parsed };
        } else {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
        }
      } catch (e) {
        console.error('Failed to load store from localStorage', e);
      }
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.error('Failed to save to localStorage', e);
      }
    }
    this.listeners.forEach((fn) => fn());
  }

  // --- Tasks CRUD ---
  public addTask(task: Omit<Task, 'id' | 'createdAt'>) {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: getTodayIso(),
    };
    this.state = {
      ...this.state,
      tasks: [newTask, ...this.state.tasks],
      user: {
        ...this.state.user,
        xp: this.state.user.xp + 10,
      },
    };
    this.notify();
  }

  public updateTask(id: string, updates: Partial<Task>) {
    this.state = {
      ...this.state,
      tasks: this.state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    };
    this.notify();
  }

  public moveTask(taskId: string, status: TaskStatus) {
    this.state = {
      ...this.state,
      tasks: this.state.tasks.map((t) => {
        if (t.id === taskId) {
          const isDone = status === 'done';
          return {
            ...t,
            status,
            completedAt: isDone ? getTodayIso() : undefined,
          };
        }
        return t;
      }),
      user: {
        ...this.state.user,
        xp: status === 'done' ? this.state.user.xp + 25 : this.state.user.xp,
      },
    };
    this.notify();
  }

  public deleteTask(id: string) {
    this.state = {
      ...this.state,
      tasks: this.state.tasks.filter((t) => t.id !== id),
    };
    this.notify();
  }

  // --- Habits CRUD ---
  public toggleHabit(id: string, date: string = getTodayIso()) {
    this.state = {
      ...this.state,
      habits: this.state.habits.map((h) => {
        if (h.id === id) {
          const exists = h.completedDates.includes(date);
          const nextDates = exists
            ? h.completedDates.filter((d) => d !== date)
            : [...h.completedDates, date];
          const newStreak = exists ? Math.max(0, h.streak - 1) : h.streak + 1;
          const best = Math.max(h.bestStreak, newStreak);
          return {
            ...h,
            completedDates: nextDates,
            streak: newStreak,
            bestStreak: best,
          };
        }
        return h;
      }),
      user: {
        ...this.state.user,
        xp: this.state.user.xp + 15,
      },
    };
    this.notify();
  }

  public addHabit(habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completedDates'>) {
    const newHabit: Habit = {
      ...habit,
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

  // --- Tracker Excel Table CRUD ---
  public updateTrackerCell(id: string, date: string, value: number) {
    this.state = {
      ...this.state,
      trackers: this.state.trackers.map((t) => {
        if (t.id === id) {
          return {
            ...t,
            values: {
              ...t.values,
              [date]: value,
            },
          };
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
      completedDates: tracker.completedDates || [],
    };
    this.state = {
      ...this.state,
      trackers: [...this.state.trackers, newTracker],
    };
    this.notify();
  }

  public toggleTrackBoolean(id: string, date?: string) {
    const today = date || new Date().toISOString().split('T')[0];
    this.state = {
      ...this.state,
      trackers: this.state.trackers.map((t) => {
        if (t.id === id) {
          const currentDates = t.completedDates || [];
          const isDone = currentDates.includes(today);
          const nextDates = isDone
            ? currentDates.filter((d) => d !== today)
            : [...currentDates, today];
          return {
            ...t,
            isBoolean: true,
            completedDates: nextDates,
            values: {
              ...t.values,
              [today]: isDone ? 0 : 1,
            },
          };
        }
        return t;
      }),
    };
    this.notify();
  }

  public deleteTracker(id: string) {
    this.state = {
      ...this.state,
      trackers: this.state.trackers.filter((t) => t.id !== id),
    };
    this.notify();
  }

  // --- Finance CRUD ---
  public addTransaction(tx: Omit<Transaction, 'id'>) {
    const newTx: Transaction = {
      ...tx,
      id: `tx-${Date.now()}`,
    };
    // Also update budget if expense
    let nextBudgets = [...this.state.budgets];
    if (tx.type === 'expense') {
      nextBudgets = nextBudgets.map((b) => {
        if (b.category.toLowerCase().includes(tx.category.toLowerCase()) || tx.category.toLowerCase().includes(b.category.toLowerCase())) {
          return { ...b, spent: b.spent + tx.amount };
        }
        return b;
      });
    }

    this.state = {
      ...this.state,
      transactions: [newTx, ...this.state.transactions],
      budgets: nextBudgets,
    };
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
    const newBudget: Budget = {
      ...budget,
      id: `b-${Date.now()}`,
      spent: 0,
    };
    this.state = {
      ...this.state,
      budgets: [...this.state.budgets, newBudget],
    };
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
    this.state = {
      ...this.state,
      savings: this.state.savings.map((s) => {
        if (s.id === id) {
          return {
            ...s,
            currentAmount: s.currentAmount + amount,
          };
        }
        return s;
      }),
      user: {
        ...this.state.user,
        xp: this.state.user.xp + 20,
      },
    };
    this.notify();
  }

  public addSavingsGoal(goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) {
    const newGoal: SavingsGoal = {
      ...goal,
      id: `save-${Date.now()}`,
      currentAmount: 0,
    };
    this.state = {
      ...this.state,
      savings: [...this.state.savings, newGoal],
    };
    this.notify();
  }

  // --- Study SM-2 Flashcards CRUD ---
  public rateCard(cardId: string, quality: number) {
    this.state = {
      ...this.state,
      studyCards: this.state.studyCards.map((card) => {
        if (card.id === cardId) {
          const q = Math.max(0, Math.min(5, quality));
          let { interval, repetitions, easinessFactor } = card;

          if (q >= 3) {
            if (repetitions === 0) interval = 1;
            else if (repetitions === 1) interval = 6;
            else interval = Math.round(interval * easinessFactor);
            repetitions += 1;
          } else {
            repetitions = 0;
            interval = 1;
          }

          const newEF = easinessFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
          easinessFactor = Math.max(1.3, Math.round(newEF * 100) / 100);

          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + interval);

          return {
            ...card,
            easinessFactor,
            interval,
            repetitions,
            lastQuality: q,
            nextReviewDate: nextDate.toISOString().split('T')[0],
          };
        }
        return card;
      }),
      user: {
        ...this.state.user,
        xp: this.state.user.xp + 15,
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
    this.state = {
      ...this.state,
      studyCards: [...this.state.studyCards, newCard],
    };
    this.notify();
  }

  public addStudyResource(resource: Omit<StudyResource, 'id'>) {
    const newRes: StudyResource = {
      ...resource,
      id: `res-${Date.now()}`,
    };
    this.state = {
      ...this.state,
      studyResources: [...this.state.studyResources, newRes],
    };
    this.notify();
  }

  public updateStudyResource(id: string, updates: Partial<StudyResource>) {
    this.state = {
      ...this.state,
      studyResources: this.state.studyResources.map((r) => (r.id === id ? { ...r, ...updates } : r)),
    };
    this.notify();
  }

  // --- Kaizen CRUD ---
  public addKaizenEntry(entry: Omit<KaizenEntry, 'id' | 'date'>) {
    const newEntry: KaizenEntry = {
      ...entry,
      id: `k-${Date.now()}`,
      date: getTodayIso(),
    };
    this.state = {
      ...this.state,
      kaizenEntries: [newEntry, ...this.state.kaizenEntries],
      user: {
        ...this.state.user,
        xp: this.state.user.xp + 50,
      },
    };
    this.notify();
  }

  // --- Goals CRUD ---
  public addGoal(goal: Omit<Goal, 'id'>) {
    const newGoal: Goal = {
      ...goal,
      id: `g-${Date.now()}`,
    };
    this.state = {
      ...this.state,
      goals: [...this.state.goals, newGoal],
    };
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
          const totalProgress = Math.round(
            nextKRs.reduce((sum, kr) => sum + kr.progress, 0) / nextKRs.length
          );
          return {
            ...g,
            keyResults: nextKRs,
            progress: totalProgress,
          };
        }
        return g;
      }),
    };
    this.notify();
  }

  // --- Health CRUD ---
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
        [date]: {
          ...current,
          ...partial,
        },
      },
    };
    this.notify();
  }

  // --- Notifications ---
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
    this.state = {
      ...this.state,
      notifications: [],
    };
    this.notify();
  }

  // --- Issues Diagnostics ---
  public resolveIssue(id: string) {
    this.state = {
      ...this.state,
      issues: this.state.issues.map((iss) => (iss.id === id ? { ...iss, resolved: true } : iss)),
    };
    this.notify();
  }

  // --- Database Reset & Backup ---
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
    this.notify();
  }
}

export const store = new StoreEngine();
export const storeEngine = store;

// React hook for consuming reactive store
export function useLifeOS() {
  const [state, setState] = useState<DatabaseState>(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState({ ...store.getState() });
    });
    return unsubscribe;
  }, []);

  return {
    ...state,
    addTask: (task: Omit<Task, 'id' | 'createdAt'>) => store.addTask(task),
    updateTask: (id: string, updates: Partial<Task>) => store.updateTask(id, updates),
    moveTask: (taskId: string, status: TaskStatus) => store.moveTask(taskId, status),
    deleteTask: (id: string) => store.deleteTask(id),
    toggleHabit: (id: string, date?: string) => store.toggleHabit(id, date),
    addHabit: (habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completedDates'>) => store.addHabit(habit),
    deleteHabit: (id: string) => store.deleteHabit(id),
    updateTrackerCell: (id: string, date: string, value: number) => store.updateTrackerCell(id, date, value),
    addTracker: (tracker: Omit<TrackerRow, 'id' | 'values'>) => store.addTracker(tracker),
    toggleTrackBoolean: (id: string, date?: string) => store.toggleTrackBoolean(id, date),
    deleteTracker: (id: string) => store.deleteTracker(id),
    addTransaction: (tx: Omit<Transaction, 'id'>) => store.addTransaction(tx),
    deleteTransaction: (id: string) => store.deleteTransaction(id),
    addBudget: (budget: Omit<Budget, 'id' | 'spent'>) => store.addBudget(budget),
    updateBudget: (id: string, updates: Partial<Budget>) => store.updateBudget(id, updates),
    depositSavings: (id: string, amount: number) => store.depositSavings(id, amount),
    addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => store.addSavingsGoal(goal),
    rateCard: (cardId: string, quality: number) => store.rateCard(cardId, quality),
    addStudyCard: (card: Omit<StudyCard, 'id' | 'easinessFactor' | 'interval' | 'repetitions' | 'nextReviewDate'>) =>
      store.addStudyCard(card),
    addStudyResource: (res: Omit<StudyResource, 'id'>) => store.addStudyResource(res),
    updateStudyResource: (id: string, updates: Partial<StudyResource>) => store.updateStudyResource(id, updates),
    addKaizenEntry: (entry: Omit<KaizenEntry, 'id' | 'date'>) => store.addKaizenEntry(entry),
    addGoal: (goal: Omit<Goal, 'id'>) => store.addGoal(goal),
    updateGoalProgress: (goalId: string, progress: number) => store.updateGoalProgress(goalId, progress),
    toggleKeyResult: (goalId: string, krId: string) => store.toggleKeyResult(goalId, krId),
    logHealth: (date: string, partial: Partial<HealthLog>) => store.logHealth(date, partial),
    markNotificationRead: (id: string) => store.markNotificationRead(id),
    markAllNotificationsRead: () => store.markAllNotificationsRead(),
    clearAllNotifications: () => store.clearAllNotifications(),
    resolveIssue: (id: string) => store.resolveIssue(id),
    resetToDefaults: () => store.resetToDefaults(),
    importData: (data: DatabaseState) => store.importData(data),
  };
}
