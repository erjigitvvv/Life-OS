'use client';

import { useState, useEffect } from 'react';
import { activityLogger } from './activity-logger';
import { vectorMemory } from './vector-memory';

export type TaskStatus = 'backlog' | 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

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
  estimatedTime?: string;      // "2h 30m", "45m", etc.
  subtasks?: SubTask[];        // Subtasks array
  actualTime?: number;         // Logged minutes
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
  cardId?: string;
  cardName?: string;
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

export type SkillStatus = 'not_started' | 'in_progress' | 'completed';

export interface LearningTopic {
  id: string;
  title: string;
  description?: string;
  status: SkillStatus;
  duration?: string;
  completedAt?: string;
  resourceLink?: string;
}

export interface RoadmapStage {
  id: string;
  title: string;
  description?: string;
  topics: LearningTopic[];
}

export interface LearningRoadmap {
  id: string;
  title: string;
  category: 'cybersecurity' | 'ielts' | 'programming' | 'other';
  icon: string;
  color: string;
  description: string;
  stages: RoadmapStage[];
}

export interface EmergencyFund {
  currentAmount: number;
  targetAmount: number;
  monthlyAllocation: number;
}

export type CardType = 'uzcard' | 'humo' | 'visa' | 'mastercard' | 'cash';

export interface Debt {
  id: string;
  type: 'borrowed' | 'lent'; // 'borrowed' = oldim, 'lent' = berdim
  person: string;
  amount: number;
  paidAmount: number;
  dueDate: string; // YYYY-MM-DD
  createdAt: string;
  note?: string;
  isCompleted?: boolean;
}

export interface WalletCard {
  id: string;
  name: string;
  type: CardType;
  balance: number;
  currency: 'UZS' | 'USD';
  cardNumber?: string;
  holderName?: string;
  expiryDate?: string;
  bankName?: string;
  colorTheme: string;
  gradient: string;
  isDefault?: boolean;
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
  sleepStart?: string;
  sleepEnd?: string;
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
  roadmaps: LearningRoadmap[];
  emergencyFund: EmergencyFund;
  cards: WalletCard[];
  debts: Debt[];
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
    name: 'Mirhamid Erjigitov',
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
      estimatedTime: '4h',
      subtasks: [
        { id: 'st-1', title: 'Turborepo config yangilash', completed: true },
        { id: 'st-2', title: 'Type-safe shared packages', completed: false },
        { id: 'st-3', title: 'CI/CD pipeline sozlash', completed: false },
      ],
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
      estimatedTime: '3h',
      subtasks: [
        { id: 'st-4', title: 'Framer Motion animatsiya', completed: false },
        { id: 'st-5', title: 'Subtasks UI', completed: true },
        { id: 'st-6', title: 'Overdue qizil rang', completed: false },
      ],
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
      estimatedTime: '2h',
      subtasks: [
        { id: 'st-7', title: 'SM-2 formula testlari', completed: false },
        { id: 'st-8', title: 'Flashcard UI yangilash', completed: false },
      ],
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
      estimatedTime: '1h 30m',
      subtasks: [
        { id: 'st-9', title: 'Transport limit tahlili', completed: true },
        { id: 'st-10', title: 'Oziq-ovqat limit tahlili', completed: false },
      ],
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
      estimatedTime: '2h',
      subtasks: [
        { id: 'st-11', title: 'Jadval strukturasi', completed: true },
        { id: 'st-12', title: 'Inline edit', completed: true },
        { id: 'st-13', title: 'Boolean toggle', completed: true },
      ],
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
      estimatedTime: '3h',
      subtasks: [
        { id: 'st-14', title: 'Modul 1: Network basics', completed: false },
        { id: 'st-15', title: 'Modul 2: Traffic analysis', completed: false },
        { id: 'st-16', title: 'Modul 3: Wireshark labs', completed: false },
      ],
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
  roadmaps: [
    {
      id: 'roadmap-cybersecurity',
      title: 'Kiberxavfsizlik (SOC Analyst Level 1 & 2)',
      category: 'cybersecurity',
      icon: 'Shield',
      color: '#10b981',
      description: 'Tarmoq xavfsizligi, SIEM monitoring, threat hunting va incident response bo\'yicha bosqichma-bosqich amaliy xarita.',
      stages: [
        {
          id: 'stage-sec-1',
          title: '1-Bosqich: Tarmoq va Operatsion Tizimlar Xavfsizligi',
          description: 'TCP/IP protokollari, Linux & Windows audit, va Wireshark lablari',
          topics: [
            { id: 'sec-101', title: 'TCP/IP, OSI modeli va Wireshark packet tahlili', status: 'completed', duration: '6 soat', completedAt: '2026-10-18' },
            { id: 'sec-102', title: 'Linux Bash, xavfsizlik audit buyruqlari va log fayllar', status: 'completed', duration: '5 soat', completedAt: '2026-10-20' },
            { id: 'sec-103', title: 'Windows Event Viewer va Sysinternals (Sysmon) arxitekturasi', status: 'completed', duration: '7 soat', completedAt: '2026-10-22' },
            { id: 'sec-104', title: 'DNS, DHCP, ARP Spoofing va Man-in-the-Middle hujumlari tahlili', status: 'in_progress', duration: '4 soat' },
          ],
        },
        {
          id: 'stage-sec-2',
          title: '2-Bosqich: Xavfsizlik Arxitekturasi va Defensiya',
          description: 'Firewall, IDS/IPS, Active Directory va Endpoint himoyasi',
          topics: [
            { id: 'sec-201', title: 'Firewall (pfSense/iptables) va Snort / Suricata IDS qoidalari', status: 'completed', duration: '6 soat', completedAt: '2026-10-24' },
            { id: 'sec-202', title: 'Active Directory hujumlari (Kerberoasting, Pass-the-Hash) va audit', status: 'in_progress', duration: '8 soat' },
            { id: 'sec-203', title: 'EDR/XDR sensorlari va Zero Trust Identity boshqaruvi', status: 'not_started', duration: '5 soat' },
            { id: 'sec-204', title: 'WAF (Web Application Firewall) va OWASP Top 10 tahlili', status: 'not_started', duration: '6 soat' },
          ],
        },
        {
          id: 'stage-sec-3',
          title: '3-Bosqich: SIEM, Log Korrelyatsiyasi va Threat Hunting',
          description: 'Splunk, Elastic SIEM va MITRE ATT&CK integratsiyasi',
          topics: [
            { id: 'sec-301', title: 'Splunk SPL (Search Processing Language) bilan xavfsizlik so\'rovlari', status: 'in_progress', duration: '8 soat' },
            { id: 'sec-302', title: 'MITRE ATT&CK matritsasi: Tactic & Technique mapping', status: 'completed', duration: '4 soat', completedAt: '2026-10-23' },
            { id: 'sec-303', title: 'Sigma Rules va YARA qoidalarini yaratish hamda testlash', status: 'not_started', duration: '6 soat' },
            { id: 'sec-304', title: 'Threat Intelligence (MISP, AlienVault OTX) va IOC tahlili', status: 'not_started', duration: '5 soat' },
          ],
        },
        {
          id: 'stage-sec-4',
          title: '4-Bosqich: Incident Response va Raqamli Kriminalistika',
          description: 'Memory Forensics, Disk tahlili va hodisani lokalizatsiya qilish',
          topics: [
            { id: 'sec-401', title: 'Xotira tahlili (Volatility 3 bilan Memory Forensics)', status: 'not_started', duration: '7 soat' },
            { id: 'sec-402', title: 'Autopsy va FTK Imager bilan disk kriminalistikasi', status: 'not_started', duration: '6 soat' },
            { id: 'sec-403', title: 'Ransomware va ziyonkor kodlarni tahlil qilish (Static/Dynamic)', status: 'not_started', duration: '8 soat' },
            { id: 'sec-404', title: 'Post-Incident hisobot, RCA (Root Cause Analysis) va tavsiyalar', status: 'not_started', duration: '4 soat' },
          ],
        },
      ],
    },
    {
      id: 'roadmap-ielts',
      title: 'IELTS 7.5+ Band Masterclass',
      category: 'ielts',
      icon: 'BookOpen',
      color: '#3b82f6',
      description: 'Listening, Reading, Writing Task 1/2 va Speaking bo\'yicha 7.5+ band darajasi xaritasi.',
      stages: [
        {
          id: 'stage-ielts-1',
          title: '1-Modul: Listening Mastery (Band 8.0+)',
          description: 'Turli aksentlar, savol turlari va Mock testlar strategiyasi',
          topics: [
            { id: 'ielts-101', title: 'Form & Table Completion strategiyalari va spelling xatolari', status: 'completed', duration: '3 soat', completedAt: '2026-10-15' },
            { id: 'ielts-102', title: 'Multiple Choice & Matching savollari: Distractorlarni aniqlash', status: 'completed', duration: '4 soat', completedAt: '2026-10-17' },
            { id: 'ielts-103', title: 'Map Labeling va Diagram Flowchart texnikalari', status: 'completed', duration: '3 soat', completedAt: '2026-10-21' },
            { id: 'ielts-104', title: 'Section 4: Akademik leksiya va konspekt olish mashqlari', status: 'in_progress', duration: '5 soat' },
          ],
        },
        {
          id: 'stage-ielts-2',
          title: '2-Modul: Academic Reading (Band 7.5+)',
          description: 'Skimming, Scanning, T/F/NG va 570 Academic Word List',
          topics: [
            { id: 'ielts-201', title: 'Skimming va Scanning orqali kalit so\'zlarni tezkor topish', status: 'completed', duration: '4 soat', completedAt: '2026-10-19' },
            { id: 'ielts-202', title: 'True / False / Not Given & Yes / No / Not Given farqlash usullari', status: 'completed', duration: '5 soat', completedAt: '2026-10-22' },
            { id: 'ielts-203', title: 'Headings matching va Paragraph summary strategiyasi', status: 'in_progress', duration: '4 soat' },
            { id: 'ielts-204', title: 'Academic Word List (AWL) 570 ta asosiy ilmiy so\'zlar tahlili', status: 'completed', duration: '6 soat', completedAt: '2026-10-24' },
          ],
        },
        {
          id: 'stage-ielts-3',
          title: '3-Modul: Writing Task 1 & Task 2 (Band 7.0+)',
          description: 'Grafiklar tahlili, Report yozish va Argumentative Essay tuzilmasi',
          topics: [
            { id: 'ielts-301', title: 'Task 1: Bar, Line, Pie, Table trendlarini ifodalash', status: 'completed', duration: '4 soat', completedAt: '2026-10-20' },
            { id: 'ielts-302', title: 'Task 1: Process va Map diagrammalarida passive voice qo\'llash', status: 'in_progress', duration: '3 soat' },
            { id: 'ielts-303', title: 'Task 2: Opinion va Discussion esselari uchun 4-paragraf shabloni', status: 'in_progress', duration: '6 soat' },
            { id: 'ielts-304', title: 'Cohesion, Lexical Resource va C1/C2 darajadagi Collocations', status: 'not_started', duration: '5 soat' },
          ],
        },
        {
          id: 'stage-ielts-4',
          title: '4-Modul: Speaking Fluency & Lexicon (Band 7.5+)',
          description: 'Part 1, Cue Card 2 daqiqa, Part 3 abstrakt tahlil va talaffuz',
          topics: [
            { id: 'ielts-401', title: 'Part 1: Tezkor javoblar, intonatsiya va tabiiy bog\'lovchilar', status: 'completed', duration: '3 soat', completedAt: '2026-10-22' },
            { id: 'ielts-402', title: 'Part 2: 1 daqiqa ichida Cue Card rejasi va 2 daqiqa to\'xtovsiz nutq', status: 'in_progress', duration: '5 soat' },
            { id: 'ielts-403', title: 'Part 3: Ijtimoiy va falsafiy savollarga mantiqiy kengaytirilgan javob', status: 'not_started', duration: '6 soat' },
            { id: 'ielts-404', title: 'Idiomatic language, phrasal verbs va talaffuz ravonligi (Accent)', status: 'not_started', duration: '4 soat' },
          ],
        },
      ],
    },
  ],
  emergencyFund: {
    currentAmount: 34500000,
    targetAmount: 50000000,
    monthlyAllocation: 1500000,
  },
  debts: [
    {
      id: 'debt-1',
      type: 'borrowed',
      person: 'Akmal aka',
      amount: 4500000,
      paidAmount: 1500000,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      note: 'Yangi uskuna (monitor) xaridi uchun',
      isCompleted: false,
    },
    {
      id: 'debt-2',
      type: 'lent',
      person: 'Javohir (Hamkasb)',
      amount: 2800000,
      paidAmount: 0,
      dueDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      createdAt: new Date().toISOString().split('T')[0],
      note: 'Freelance loyiha boshlanganda qaytaradi',
      isCompleted: false,
    },
  ],
  cards: [
    {
      id: 'card-uzcard-1',
      name: 'Kapitalbank Uzcard',
      type: 'uzcard',
      balance: 8450000,
      currency: 'UZS',
      cardNumber: '8600 •••• •••• 3418',
      holderName: 'MIRHAMID ERJIGITOV',
      expiryDate: '11/28',
      bankName: 'Kapitalbank',
      colorTheme: 'emerald-cyan',
      gradient: 'from-[#004d40] via-[#00695c] to-[#00897b]',
      isDefault: true,
    },
    {
      id: 'card-humo-1',
      name: 'TBC Bank Humo',
      type: 'humo',
      balance: 5200000,
      currency: 'UZS',
      cardNumber: '9860 •••• •••• 7729',
      holderName: 'MIRHAMID ERJIGITOV',
      expiryDate: '04/29',
      bankName: 'TBC Bank',
      colorTheme: 'orange-terracotta',
      gradient: 'from-[#b73e00] via-[#bf360c] to-[#1e1b4b]',
    },
    {
      id: 'card-visa-1',
      name: 'Visa Platinum Infinite',
      type: 'visa',
      balance: 12800000,
      currency: 'UZS',
      cardNumber: '4000 •••• •••• 9104',
      holderName: 'MIRHAMID ERJIGITOV',
      expiryDate: '09/30',
      bankName: 'Ipak Yo\'li Bank',
      colorTheme: 'midnight-gold',
      gradient: 'from-[#090d16] via-[#111827] to-[#1e293b]',
    },
    {
      id: 'card-mc-1',
      name: 'Mastercard World Elite',
      type: 'mastercard',
      balance: 6150000,
      currency: 'UZS',
      cardNumber: '5412 •••• •••• 6502',
      holderName: 'MIRHAMID ERJIGITOV',
      expiryDate: '12/29',
      bankName: 'NBU Private',
      colorTheme: 'space-crimson',
      gradient: 'from-[#1a0b2e] via-[#2d123d] to-[#4c0519]',
    },
    {
      id: 'card-cash-1',
      name: 'Naqd Pul (Hamyon)',
      type: 'cash',
      balance: 3400000,
      currency: 'UZS',
      cardNumber: 'CASH-WALLET',
      holderName: 'NAQD MABLAGʻ',
      expiryDate: 'DOIMIY',
      bankName: 'Naqd Pul Zaxirasi',
      colorTheme: 'obsidian-forest',
      gradient: 'from-[#052417] via-[#064e3b] to-[#022c22]',
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
          this.state = {
            ...INITIAL_DATABASE,
            ...parsed,
            transactions: Array.isArray(parsed.transactions) ? parsed.transactions : INITIAL_DATABASE.transactions,
            budgets: Array.isArray(parsed.budgets) ? parsed.budgets : INITIAL_DATABASE.budgets,
            cards: Array.isArray(parsed.cards) ? parsed.cards : INITIAL_DATABASE.cards,
            tasks: Array.isArray(parsed.tasks) ? parsed.tasks : INITIAL_DATABASE.tasks,
            habits: Array.isArray(parsed.habits) ? parsed.habits : INITIAL_DATABASE.habits,
            trackers: Array.isArray(parsed.trackers) ? parsed.trackers : INITIAL_DATABASE.trackers,
            user: parsed.user ? { ...INITIAL_DATABASE.user, ...parsed.user } : INITIAL_DATABASE.user,
          };
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

    // Digital Twin Telemetry Capture
    activityLogger.log({
      eventType: 'task_created',
      category: 'productivity',
      title: `Yangi vazifa yaratildi: "${task.title}"`,
      description: task.description,
      metadata: { taskId: newTask.id, priority: task.priority, tags: task.tags },
    });
    vectorMemory.rebuildFromActivities();
  }

  public updateTask(id: string, updates: Partial<Task>) {
    this.state = {
      ...this.state,
      tasks: this.state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    };
    this.notify();
  }

  public moveTask(taskId: string, status: TaskStatus) {
    let completedTask: Task | undefined;
    this.state = {
      ...this.state,
      tasks: this.state.tasks.map((t) => {
        if (t.id === taskId) {
          const isDone = status === 'done';
          if (isDone) completedTask = t;
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

    // Digital Twin Telemetry Capture
    if (status === 'done' && completedTask) {
      activityLogger.log({
        eventType: 'task_completed',
        category: 'productivity',
        title: `Vazifa muvaffaqiyatli yakunlandi: "${completedTask.title}"`,
        description: completedTask.description,
        durationMinutes: completedTask.actualTime || 35,
        metadata: { taskId, priority: completedTask.priority, tags: completedTask.tags },
      });
      vectorMemory.rebuildFromActivities();
    }
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
    let habitName = '';
    let isNowCompleted = false;
    let currentStreak = 0;

    this.state = {
      ...this.state,
      habits: this.state.habits.map((h) => {
        if (h.id === id) {
          habitName = h.name;
          const exists = h.completedDates.includes(date);
          isNowCompleted = !exists;
          const nextDates = exists
            ? h.completedDates.filter((d) => d !== date)
            : [...h.completedDates, date];
          const newStreak = exists ? Math.max(0, h.streak - 1) : h.streak + 1;
          currentStreak = newStreak;
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

    // Digital Twin Telemetry Capture
    if (habitName) {
      activityLogger.log({
        eventType: isNowCompleted ? 'habit_completed' : 'habit_missed',
        category: 'habits',
        title: isNowCompleted ? `Odat bajarildi: "${habitName}"` : `Odat bekor qilindi: "${habitName}"`,
        metadata: { habitId: id, date, streak: currentStreak },
      });
      vectorMemory.rebuildFromActivities();
    }
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

    let nextCards = [...(this.state.cards || [])];
    if (tx.cardId) {
      nextCards = nextCards.map((c) => {
        if (c.id === tx.cardId) {
          const updatedBal = tx.type === 'expense' ? Math.max(0, c.balance - tx.amount) : c.balance + tx.amount;
          return { ...c, balance: updatedBal };
        }
        return c;
      });
    }

    this.state = {
      ...this.state,
      transactions: [newTx, ...this.state.transactions],
      budgets: nextBudgets,
      cards: nextCards,
    };
    this.notify();

    // Digital Twin Telemetry Capture
    activityLogger.log({
      eventType: 'finance_transaction',
      category: 'finance',
      title: tx.type === 'income' ? `Daromad kiritildi: ${tx.amount.toLocaleString()} so'm` : `Xarajat: ${tx.amount.toLocaleString()} so'm (${tx.category})`,
      description: tx.description,
      metadata: { amount: tx.amount, type: tx.type, category: tx.category },
    });
    vectorMemory.rebuildFromActivities();
  }

  public deleteTransaction(id: string) {
    const targetTx = this.state.transactions.find((tx) => tx.id === id);
    let nextCards = [...(this.state.cards || [])];
    if (targetTx?.cardId) {
      nextCards = nextCards.map((c) => {
        if (c.id === targetTx.cardId) {
          const revertedBal = targetTx.type === 'expense' ? c.balance + targetTx.amount : Math.max(0, c.balance - targetTx.amount);
          return { ...c, balance: revertedBal };
        }
        return c;
      });
    }

    let nextBudgets = [...this.state.budgets];
    if (targetTx?.type === 'expense') {
      nextBudgets = nextBudgets.map((b) => {
        if (b.category.toLowerCase().includes(targetTx.category.toLowerCase()) || targetTx.category.toLowerCase().includes(b.category.toLowerCase())) {
          return { ...b, spent: Math.max(0, b.spent - targetTx.amount) };
        }
        return b;
      });
    }

    this.state = {
      ...this.state,
      transactions: this.state.transactions.filter((tx) => tx.id !== id),
      budgets: nextBudgets,
      cards: nextCards,
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

  public deleteBudget(id: string) {
    this.state = {
      ...this.state,
      budgets: this.state.budgets.filter((b) => b.id !== id),
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

  // --- Cards & Wallets CRUD ---
  public addCard(card: Omit<WalletCard, 'id'>) {
    const newCard: WalletCard = {
      ...card,
      id: `card-${Date.now()}`,
    };
    this.state = {
      ...this.state,
      cards: [...(this.state.cards || []), newCard],
      user: {
        ...this.state.user,
        xp: this.state.user.xp + 25,
      },
    };
    this.notify();

    activityLogger.log({
      eventType: 'finance_card_balance',
      category: 'finance',
      title: `Yangi karta ulandi: ${card.name} (${card.type.toUpperCase()})`,
      metadata: { cardId: newCard.id, type: card.type, balance: card.balance },
    });
    vectorMemory.rebuildFromActivities();
  }

  public updateCard(cardId: string, updates: Partial<WalletCard>) {
    this.state = {
      ...this.state,
      cards: (this.state.cards || []).map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
    };
    this.notify();
  }

  public updateUser(updates: Partial<UserProfile>) {
    this.state = {
      ...this.state,
      user: { ...this.state.user, ...updates },
    };
    this.notify();
  }

  public updateCardBalance(cardId: string, newBalance: number) {
    const card = (this.state.cards || []).find((c) => c.id === cardId);
    this.state = {
      ...this.state,
      cards: (this.state.cards || []).map((c) =>
        c.id === cardId ? { ...c, balance: Math.max(0, newBalance) } : c
      ),
    };
    this.notify();

    if (card) {
      activityLogger.log({
        eventType: 'finance_card_balance',
        category: 'finance',
        title: `Karta balansi yangilandi: ${card.name}`,
        metadata: { cardId, oldBalance: card.balance, newBalance },
      });
      vectorMemory.rebuildFromActivities();
    }
  }

  public deleteCard(cardId: string) {
    this.state = {
      ...this.state,
      cards: (this.state.cards || []).filter((c) => c.id !== cardId),
    };
    this.notify();
  }

  // --- Emergency Fund & 50/30/20 Rule Automation ---
  public depositEmergencyFund(amount: number) {
    const current = this.state.emergencyFund || { currentAmount: 0, targetAmount: 50000000, monthlyAllocation: 1500000 };
    this.state = {
      ...this.state,
      emergencyFund: {
        ...current,
        currentAmount: current.currentAmount + amount,
      },
      user: {
        ...this.state.user,
        xp: this.state.user.xp + 15,
      },
    };
    this.notify();

    activityLogger.log({
      eventType: 'finance_transaction',
      category: 'finance',
      title: `Zaxira fondiga (Emergency Fund) depozit: ${amount.toLocaleString()} so'm`,
      metadata: { amount, type: 'emergency_deposit' },
    });
    vectorMemory.rebuildFromActivities();
  }

  public updateEmergencyFund(updates: Partial<EmergencyFund>) {
    const current = this.state.emergencyFund || { currentAmount: 0, targetAmount: 50000000, monthlyAllocation: 1500000 };
    this.state = {
      ...this.state,
      emergencyFund: {
        ...current,
        ...updates,
      },
    };
    this.notify();
  }

  public autoAllocate503020(amount: number, description: string = 'Oylik daromad (50/30/20 taqsimot)') {
    if (amount <= 0) return;

    // 50% Zaruriy ehtiyojlar (Needs)
    const needsAmount = Math.round(amount * 0.5);
    // 30% Xohish-istaklar (Wants)
    const wantsAmount = Math.round(amount * 0.3);
    // 20% Jamg'arma & Zaxira (Savings & Reserve)
    const savingsAmount = Math.round(amount * 0.2);

    // 1. Add income transaction
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      description,
      amount,
      type: 'income',
      category: 'Daromad',
      date: getTodayIso(),
    };

    // 2. Distribute savings: 50% to Emergency Fund, 50% to existing savings goals
    const emergencyPart = Math.round(savingsAmount * 0.5);
    const savingsGoalPart = savingsAmount - emergencyPart;

    const currentEmergency = this.state.emergencyFund || { currentAmount: 0, targetAmount: 50000000, monthlyAllocation: 1500000 };
    const nextEmergency = {
      ...currentEmergency,
      currentAmount: currentEmergency.currentAmount + emergencyPart,
    };

    let nextSavings = [...this.state.savings];
    if (nextSavings.length > 0) {
      nextSavings = nextSavings.map((s, idx) => {
        if (idx === 0) {
          return { ...s, currentAmount: s.currentAmount + savingsGoalPart };
        }
        return s;
      });
    }

    // 3. Adjust monthly budget limits proportionally for Needs and Wants
    const nextBudgets = this.state.budgets.map((b) => {
      const lower = b.category.toLowerCase();
      const isNeed = ['uy-joy', 'kommunal', 'oziq-ovqat', 'transport', 'dorixona', 'salomatlik'].some((k) => lower.includes(k));
      if (isNeed) {
        return { ...b, limit: b.limit + Math.round(needsAmount / 2) };
      }
      const isWant = ['kafe', 'restoran', 'ko‘ngilochar', 'kongilochar', 'obuna', 'kiyim'].some((k) => lower.includes(k));
      if (isWant) {
        return { ...b, limit: b.limit + Math.round(wantsAmount / 2) };
      }
      return b;
    });

    this.state = {
      ...this.state,
      transactions: [newTx, ...this.state.transactions],
      emergencyFund: nextEmergency,
      savings: nextSavings,
      budgets: nextBudgets,
      user: {
        ...this.state.user,
        xp: this.state.user.xp + 40,
      },
    };
    this.notify();

    // Digital Twin Telemetry Capture
    activityLogger.log({
      eventType: 'finance_transaction',
      category: 'finance',
      title: `50/30/20 Qoidasi avtomatizatsiyasi: ${amount.toLocaleString()} so'm taqsimlandi`,
      description: `Ehtiyojlar: ${needsAmount.toLocaleString()}, Xohishlar: ${wantsAmount.toLocaleString()}, Jamg'arma & Zaxira: ${savingsAmount.toLocaleString()}`,
      metadata: { amount, rule503020: true, needsAmount, wantsAmount, savingsAmount },
    });
    vectorMemory.rebuildFromActivities();
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


  // --- Debt Management ---
  public addDebt(debt: Omit<Debt, 'id' | 'createdAt' | 'paidAmount' | 'isCompleted'>) {
    const newDebt: Debt = {
      ...debt,
      id: "debt-" + Date.now(),
      paidAmount: 0,
      createdAt: new Date().toISOString().split('T')[0],
      isCompleted: false,
    };
    this.state = {
      ...this.state,
      debts: [newDebt, ...(this.state.debts || [])],
    };
    this.notify();
    activityLogger.log({
      eventType: 'finance_card_balance',
      category: 'finance',
      title: "Yangi qarz qayd etildi: " + debt.person + " (" + (debt.type === 'borrowed' ? 'Oldim' : 'Berdim') + " - " + debt.amount.toLocaleString() + " so'm)",
      metadata: { debtId: newDebt.id, type: debt.type, amount: debt.amount },
    });
  }

  public updateDebtPayment(id: string, additionalPay: number) {
    this.state = {
      ...this.state,
      debts: (this.state.debts || []).map((d) => {
        if (d.id !== id) return d;
        const newPaid = Math.min(d.amount, (d.paidAmount || 0) + additionalPay);
        return {
          ...d,
          paidAmount: newPaid,
          isCompleted: newPaid >= d.amount,
        };
      }),
    };
    this.notify();
  }

  public toggleDebtCompleted(id: string) {
    this.state = {
      ...this.state,
      debts: (this.state.debts || []).map((d) => {
        if (d.id !== id) return d;
        const nextCompleted = !d.isCompleted;
        return {
          ...d,
          isCompleted: nextCompleted,
          paidAmount: nextCompleted ? d.amount : d.paidAmount,
        };
      }),
    };
    this.notify();
  }

  public deleteDebt(id: string) {
    this.state = {
      ...this.state,
      debts: (this.state.debts || []).filter((d) => d.id !== id),
    };
    this.notify();
  }

  public addRoadmapStage(roadmapId: string, stageTitle: string, duration?: string) {
    const nextRoadmaps = (this.state.roadmaps || []).map((rm) => {
      if (rm.id !== roadmapId) return rm;
      const nextStageNum = (rm.stages?.length || 0) + 1;
      const newStage: RoadmapStage = {
        id: "stage-" + Date.now(),
        title: stageTitle,
        description: duration || '2 hafta',
        topics: [],
      };
      return {
        ...rm,
        stages: [...(rm.stages || []), newStage],
      };
    });
    this.state = {
      ...this.state,
      roadmaps: nextRoadmaps,
    };
    this.notify();
  }

  // --- Learning Roadmaps CRUD ---
  public toggleTopicStatus(
    roadmapId: string,
    stageId: string,
    topicId: string,
    newStatus?: SkillStatus
  ) {
    let gainedXp = 0;
    let completedTopicTitle = '';
    const nextRoadmaps = (this.state.roadmaps || []).map((rm) => {
      if (rm.id !== roadmapId) return rm;
      const nextStages = rm.stages.map((stage) => {
        if (stage.id !== stageId) return stage;
        const nextTopics = stage.topics.map((t) => {
          if (t.id !== topicId) return t;
          let status: SkillStatus;
          if (newStatus) {
            status = newStatus;
          } else {
            if (t.status === 'not_started') status = 'in_progress';
            else if (t.status === 'in_progress') status = 'completed';
            else status = 'not_started';
          }
          if (status === 'completed' && t.status !== 'completed') {
            gainedXp = 20;
            completedTopicTitle = t.title;
          }
          return {
            ...t,
            status,
            completedAt: status === 'completed' ? getTodayIso() : undefined,
          };
        });
        return { ...stage, topics: nextTopics };
      });
      return { ...rm, stages: nextStages };
    });

    this.state = {
      ...this.state,
      roadmaps: nextRoadmaps,
      user: {
        ...this.state.user,
        xp: this.state.user.xp + gainedXp,
      },
    };
    this.notify();

    if (completedTopicTitle) {
      activityLogger.log({
        eventType: 'study_topic_completed',
        category: 'study',
        title: `Ta'lim mavzusi o'zlashtirildi: "${completedTopicTitle}"`,
        description: `Roadmap: ${roadmapId.toUpperCase()}, Bosqich: ${stageId}`,
        metadata: { roadmapId, stageId, topicId, xpGained: gainedXp },
      });
      vectorMemory.rebuildFromActivities();
    }
  }

  public addRoadmapTopic(roadmapId: string, stageId: string, topic: Omit<LearningTopic, 'id'>) {
    const newTopic: LearningTopic = {
      ...topic,
      id: `topic-${Date.now()}`,
    };
    const nextRoadmaps = (this.state.roadmaps || []).map((rm) => {
      if (rm.id !== roadmapId) return rm;
      const nextStages = rm.stages.map((st) => {
        if (st.id !== stageId) return st;
        return {
          ...st,
          topics: [...st.topics, newTopic],
        };
      });
      return { ...rm, stages: nextStages };
    });

    this.state = {
      ...this.state,
      roadmaps: nextRoadmaps,
    };
    this.notify();
  }

  public addRoadmap(roadmap: Omit<LearningRoadmap, 'id'>) {
    const newRoadmap: LearningRoadmap = {
      ...roadmap,
      id: `roadmap-${Date.now()}`,
    };
    this.state = {
      ...this.state,
      roadmaps: [...(this.state.roadmaps || []), newRoadmap],
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

    activityLogger.log({
      eventType: 'kaizen_entry_logged',
      category: 'growth',
      title: `Kunlik Kaizen qayd etildi (Baholash: ${entry.rating}/5)`,
      description: `Yutuq: ${entry.wins || 'Yo\'q'}, Rivojlanish: ${entry.improvements || 'Yo\'q'}, Xulosa: ${entry.learnings || 'Yo\'q'}`,
      metadata: { rating: entry.rating, wins: entry.wins },
    });
    vectorMemory.rebuildFromActivities();
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
    deleteBudget: (id: string) => store.deleteBudget(id),
    depositSavings: (id: string, amount: number) => store.depositSavings(id, amount),
    addSavingsGoal: (goal: Omit<SavingsGoal, 'id' | 'currentAmount'>) => store.addSavingsGoal(goal),
    addCard: (card: Omit<WalletCard, 'id'>) => store.addCard(card),
    updateCard: (cardId: string, updates: Partial<WalletCard>) => store.updateCard(cardId, updates),
    updateUser: (updates: Partial<UserProfile>) => store.updateUser(updates),
    updateCardBalance: (cardId: string, newBalance: number) => store.updateCardBalance(cardId, newBalance),
    deleteCard: (cardId: string) => store.deleteCard(cardId),
    depositEmergencyFund: (amount: number) => store.depositEmergencyFund(amount),
    updateEmergencyFund: (updates: Partial<EmergencyFund>) => store.updateEmergencyFund(updates),
    autoAllocate503020: (amount: number, description?: string) => store.autoAllocate503020(amount, description),
    rateCard: (cardId: string, quality: number) => store.rateCard(cardId, quality),
    addStudyCard: (card: Omit<StudyCard, 'id' | 'easinessFactor' | 'interval' | 'repetitions' | 'nextReviewDate'>) =>
      store.addStudyCard(card),
    addStudyResource: (res: Omit<StudyResource, 'id'>) => store.addStudyResource(res),
    updateStudyResource: (id: string, updates: Partial<StudyResource>) => store.updateStudyResource(id, updates),
    toggleTopicStatus: (roadmapId: string, stageId: string, topicId: string, newStatus?: SkillStatus) =>
      store.toggleTopicStatus(roadmapId, stageId, topicId, newStatus),
    addRoadmapTopic: (roadmapId: string, stageId: string, topic: Omit<LearningTopic, 'id'>) =>
      store.addRoadmapTopic(roadmapId, stageId, topic),
    addRoadmap: (roadmap: Omit<LearningRoadmap, 'id'>) => store.addRoadmap(roadmap),
    addDebt: (debt: Omit<Debt, 'id' | 'createdAt' | 'paidAmount' | 'isCompleted'>) => store.addDebt(debt),
    updateDebtPayment: (id: string, additionalPay: number) => store.updateDebtPayment(id, additionalPay),
    toggleDebtCompleted: (id: string) => store.toggleDebtCompleted(id),
    deleteDebt: (id: string) => store.deleteDebt(id),
    addRoadmapStage: (roadmapId: string, stageTitle: string, duration?: string) =>
      store.addRoadmapStage(roadmapId, stageTitle, duration),
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
