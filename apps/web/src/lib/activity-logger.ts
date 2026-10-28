// ============================================================================
// Life-OS Digital Twin — Real-Time Activity Logger & Telemetry Engine
// Stage 1 of the 4-Stage Continuous Learning Closed-Loop
// ============================================================================

export type ActivityEventType =
  | 'task_created'
  | 'task_completed'
  | 'task_deleted'
  | 'habit_completed'
  | 'habit_missed'
  | 'finance_transaction'
  | 'finance_card_balance'
  | 'time_block_logged'
  | 'study_topic_completed'
  | 'kaizen_entry_logged'
  | 'goal_progress_updated'
  | 'health_metric_logged'
  | 'ai_twin_interaction';

export type ActivityCategory =
  | 'productivity'
  | 'habits'
  | 'finance'
  | 'study'
  | 'growth'
  | 'health'
  | 'system';

export interface ActivityLog {
  id: string;
  eventType: ActivityEventType;
  category: ActivityCategory;
  title: string;
  description: string;
  semanticText: string;
  timestamp: string; // ISO 8601
  durationMinutes?: number;
  metadata: Record<string, any>;
  context: {
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: string;
    hour: number;
    platform: 'web' | 'mobile' | 'api';
    [key: string]: any;
  };
  embedding?: number[]; // Vector embedding (dimension 64-1536)
}

const STORAGE_KEY = 'lifeos_activity_dataset_v1';

// Initial realistic seed dataset for Digital Twin pattern analysis
const INITIAL_SEED_ACTIVITIES: Omit<ActivityLog, 'id'>[] = [
  {
    eventType: 'study_topic_completed',
    category: 'study',
    title: 'SOC Analyst: Network Protocols & Wireshark tahlili yakunlandi',
    description: '45 daqiqa chuqur diqqat bilan Wireshark paketlari tahlil qilindi.',
    semanticText: '2026-10-24 10:15: Mirhamid completed SOC Analyst topic "Network Protocols" in 45 minutes with high focus in morning session. Earned +20 XP.',
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
    durationMinutes: 45,
    metadata: { roadmapId: 'cybersecurity', stageId: 'soc-1', topicId: 'soc-1-1', xpGained: 20 },
    context: { timeOfDay: 'morning', dayOfWeek: 'Friday', hour: 10, platform: 'web' },
  },
  {
    eventType: 'habit_completed',
    category: 'habits',
    title: 'Ertalabki yugurish va badantarbiya',
    description: '30 daqiqa yugurish, 4 km masofa bosib o\'tildi.',
    semanticText: '2026-10-24 07:30: Morning habit "Running & Exercise" completed on time. Streak increased to 12 days.',
    timestamp: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
    durationMinutes: 30,
    metadata: { habitId: '1', streak: 12 },
    context: { timeOfDay: 'morning', dayOfWeek: 'Friday', hour: 7, platform: 'web' },
  },
  {
    eventType: 'finance_transaction',
    category: 'finance',
    title: 'Kapitalbank Uzcard orqali tushlik xarajati',
    description: 'Fast food va qahva uchun 45,000 so\'m to\'landi.',
    semanticText: '2026-10-24 13:20: Expense of 45,000 UZS in Food category via Uzcard. Afternoon lunch spending pattern.',
    timestamp: new Date(Date.now() - 86400000 * 2 + 7200000 * 3).toISOString(),
    metadata: { amount: 45000, type: 'expense', category: 'Oziq-ovqat', cardType: 'uzcard' },
    context: { timeOfDay: 'afternoon', dayOfWeek: 'Friday', hour: 13, platform: 'web' },
  },
  {
    eventType: 'task_completed',
    category: 'productivity',
    title: 'Life-OS arxitekturasini SSOT qoidalariga moslash',
    description: 'Vazifa 90 daqiqa ichida to\'liq bajarildi va testlardan o\'tkazildi.',
    semanticText: '2026-10-24 15:45: Completed high-priority task "Life-OS Architecture Refactoring" in 90 minutes. Peak productivity window.',
    timestamp: new Date(Date.now() - 86400000 * 2 + 7200000 * 4).toISOString(),
    durationMinutes: 90,
    metadata: { priority: 'urgent', tags: ['architecture', 'ssot'] },
    context: { timeOfDay: 'afternoon', dayOfWeek: 'Friday', hour: 15, platform: 'web' },
  },
  {
    eventType: 'study_topic_completed',
    category: 'study',
    title: 'IELTS Writing Task 2: Opinion Essay tahlili',
    description: '60 daqiqa akademik insho yozish mashqi bajarildi.',
    semanticText: '2026-10-25 11:00: Mirhamid completed IELTS Writing Task 2 topic. High cognitive energy observed in morning.',
    timestamp: new Date(Date.now() - 86400000 + 3600000 * 3).toISOString(),
    durationMinutes: 60,
    metadata: { roadmapId: 'ielts', stageId: 'ielts-3', topicId: 'ielts-3-2' },
    context: { timeOfDay: 'morning', dayOfWeek: 'Saturday', hour: 11, platform: 'web' },
  },
  {
    eventType: 'finance_transaction',
    category: 'finance',
    title: 'Oylik daromad 50/30/20 bo\'yicha avtomatik taqsimlandi',
    description: '15,000,000 so\'m daromad: 50% ehtiyoj, 30% xohish, 20% jamg\'armaga yo\'naltirildi.',
    semanticText: '2026-10-25 14:00: Income of 15,000,000 UZS received and auto-allocated via 50/30/20 rule: 7.5M needs, 4.5M wants, 3.0M savings and emergency reserve.',
    timestamp: new Date(Date.now() - 86400000 + 7200000 * 3).toISOString(),
    metadata: { amount: 15000000, type: 'income', rule503020: true },
    context: { timeOfDay: 'afternoon', dayOfWeek: 'Saturday', hour: 14, platform: 'web' },
  },
  {
    eventType: 'kaizen_entry_logged',
    category: 'growth',
    title: 'Kunlik Kaizen: Unumdorlik va quvvat 5/5',
    description: 'Kundalik refleksiya: Ertalabki diqqat eng yuqori bo\'ldi, kechki payt esa dam olishga ajratildi.',
    semanticText: '2026-10-25 21:30: Daily Kaizen reflection logged with rating 5/5. Key insight: Morning sessions yield 2x faster task completion than late night work.',
    timestamp: new Date(Date.now() - 86400000 + 7200000 * 7).toISOString(),
    metadata: { rating: 5, winsCount: 3 },
    context: { timeOfDay: 'night', dayOfWeek: 'Saturday', hour: 21, platform: 'web' },
  },
];

class ActivityLoggerService {
  private activities: ActivityLog[] = [];
  private listeners: Set<(activities: ActivityLog[]) => void> = new Set();
  private isInitialized = false;

  constructor() {
    this.init();
  }

  private getTimeOfDay(hour: number): 'morning' | 'afternoon' | 'evening' | 'night' {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 22) return 'evening';
    return 'night';
  }

  private getDayOfWeek(date: Date): string {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
  }

  private init() {
    if (typeof window === 'undefined' || this.isInitialized) return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.activities = parsed;
          this.isInitialized = true;
          return;
        }
      }

      // Populate with seed activities if empty
      this.activities = INITIAL_SEED_ACTIVITIES.map((act, idx) => ({
        ...act,
        id: `act-seed-${idx}-${Date.now()}`,
      }));
      this.saveToStorage();
    } catch (e) {
      console.warn('[ActivityLogger] Error reading from localStorage:', e);
      this.activities = INITIAL_SEED_ACTIVITIES.map((act, idx) => ({
        ...act,
        id: `act-seed-${idx}-${Date.now()}`,
      }));
    }
    this.isInitialized = true;
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      // Keep most recent 500 activities to prevent overflow
      const trimmed = this.activities.slice(0, 500);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      this.notifyListeners();
    } catch (e) {
      console.warn('[ActivityLogger] Error saving to localStorage:', e);
    }
  }

  private notifyListeners() {
    const copy = [...this.activities];
    this.listeners.forEach((cb) => cb(copy));
  }

  public subscribe(callback: (activities: ActivityLog[]) => void): () => void {
    this.listeners.add(callback);
    callback([...this.activities]);
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Capture an activity event in real-time
   */
  public log(params: {
    eventType: ActivityEventType;
    category: ActivityCategory;
    title: string;
    description?: string;
    durationMinutes?: number;
    metadata?: Record<string, any>;
    customSemanticText?: string;
  }): ActivityLog {
    this.init();

    const now = new Date();
    const hour = now.getHours();
    const timeOfDay = this.getTimeOfDay(hour);
    const dayOfWeek = this.getDayOfWeek(now);
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

    // Generate natural semantic text for vector embedding & AI digestion
    let semanticText = params.customSemanticText;
    if (!semanticText) {
      semanticText = `[${dateStr} ${timeStr} - ${timeOfDay.toUpperCase()} on ${dayOfWeek}] Action: ${params.title}. Type: ${params.eventType} (${params.category}). Details: ${params.description || 'No extra notes'}. Metadata: ${JSON.stringify(params.metadata || {})}`;
    }

    const logEntry: ActivityLog = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      eventType: params.eventType,
      category: params.category,
      title: params.title,
      description: params.description || '',
      semanticText,
      timestamp: now.toISOString(),
      durationMinutes: params.durationMinutes,
      metadata: params.metadata || {},
      context: {
        timeOfDay,
        dayOfWeek,
        hour,
        platform: 'web',
      },
    };

    // Prepend (newest first)
    this.activities = [logEntry, ...this.activities];
    this.saveToStorage();

    // Async sync to Backend / Supabase (fire-and-forget, non-blocking)
    this.syncToBackend(logEntry).catch(() => {});

    return logEntry;
  }

  private async syncToBackend(logEntry: ActivityLog) {
    if (typeof window === 'undefined') return;
    try {
      // Send to FastAPI or Next.js route if available
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'default_user',
          event_type: logEntry.eventType,
          event_category: logEntry.category,
          title: logEntry.title,
          description: logEntry.description,
          context: logEntry.context,
          metadata: logEntry.metadata,
          source: 'web',
        }),
      }).catch(() => {
        // Silently catch network failures when backend is offline
      });
    } catch {
      // Ignore sync errors
    }
  }

  public getActivities(): ActivityLog[] {
    this.init();
    return [...this.activities];
  }

  public getActivitiesByCategory(category: ActivityCategory): ActivityLog[] {
    return this.getActivities().filter((a) => a.category === category);
  }

  public getActivitiesInDateRange(startDate: string, endDate: string): ActivityLog[] {
    return this.getActivities().filter((a) => {
      const d = a.timestamp.split('T')[0];
      return d >= startDate && d <= endDate;
    });
  }

  public clearAll() {
    this.activities = [];
    this.saveToStorage();
  }
}

// Global Singleton Export
export const activityLogger = new ActivityLoggerService();
