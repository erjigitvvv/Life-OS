/**
 * LifeOS Smart Notification Engine & Decision Rules
 *
 * Pure functions for:
 * 1. Inactivity detection & warnings
 * 2. Time-of-day Uzbek motivational quotes (hourly context)
 * 3. Habit completion reminders with inline action buttons
 * 4. Tracker logging reminders
 * 5. Task completion praise & motivational celebrations
 * 6. Decision-making rules with Telegram inline keyboard structures
 */

export type NotificationType =
  | 'inactivity_warning'
  | 'hourly_quote'
  | 'habit_reminder'
  | 'tracker_reminder'
  | 'task_due_reminder'
  | 'task_completed_praise'
  | 'budget_alert'
  | 'all_tasks_completed';

export interface TelegramInlineButton {
  text: string;
  callback_data?: string;
  url?: string;
}

export interface NotificationDecision {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  inlineKeyboard?: TelegramInlineButton[][];
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface UserHabitContext {
  id: string;
  name: string;
  completedToday: boolean;
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  streak?: number;
}

export interface UserTaskContext {
  id: string;
  title: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  dueDate?: string;
  isCompleted?: boolean;
}

export interface UserTrackerContext {
  id: string;
  name: string;
  loggedToday: boolean;
  target?: number;
  currentValue?: number;
}

export interface NotificationEvaluationContext {
  currentTime: string | Date; // ISO string or Date
  lastActiveAt?: string | Date; // When user was last active on Life-OS
  habits?: UserHabitContext[];
  pendingTasks?: UserTaskContext[];
  recentlyCompletedTask?: UserTaskContext;
  trackers?: UserTrackerContext[];
  lastHourlyQuoteHour?: number; // 0-23
  dailyBudgetPercent?: number; // 0-100+
  webAppUrl?: string;
}

/**
 * Uzbek Motivational Quotes categorized by time of day
 */
export const UZBEK_HOURLY_QUOTES: Record<'morning' | 'focus' | 'afternoon' | 'evening' | 'night', string[]> = {
  morning: [
    "🌅 Tong - g'alabaning ibtidosi! Bugungi har bir rejalashtirilgan daqiqa kelajagingiz poydevoridir.",
    "☀️ Muvaffaqiyat tasodif emas, har kuni ertalab qilinadigan ongli tanlovdir.",
    "🚀 Katta maqsadlar erta boshlangan intizomli qadamlardan tug'iladi. Bugun eng yaxshi versiyangiz bo'ling!",
    "💡 Kuningizni eng qiyin vazifadan boshlang. Uni yengsangiz, qolgan barcha ishlar osonlashadi.",
  ],
  focus: [
    "🎯 Chalg'ish - orzular o'g'risi. Hozirgi vazifangizga butun diqqatingizni qarating (Deep Work).",
    "⚡️ Bir vaqtda bitta ish - professional mahorat siri. Chalg'imasdan davom eting!",
    "🔥 Bugungi mehnatingiz ertangi erkinligingiz kafolatidir. Shiddatni pasaytirmang!",
    "🧠 Mayda chalg'ishlarga «yo'q» deng, buyuk natijalarga «ha» deb javob bering.",
  ],
  afternoon: [
    "⏳ Kuningizning ikkinchi yarmi boshlandi. Ertalabki shiddatni saqlab qoling!",
    "💪 Charchoq - bu o'sish belgisi. Kichik tanaffus qiling, chuqur nafas oling va yana safga qayting.",
    "📈 Kichik qadamlar katta masofalarni zabt etadi. Odatlaringizni to'ldirishni unutmang.",
    "🌊 O'zingizga bo'lgan ishonchni harakat bilan quvvatlang. Rejangizdagi keyingi nuqtaga o'ting!",
  ],
  evening: [
    "🌙 Oqshom - sarhisob vaqti. Bugun qilingan har bir qadam sizni maqsadingizga yaqinlashtirdi.",
    "📊 Bugun nimaga erishdingiz? Bajarilgan vazifalaringizni tekshirib, Life-OS ga qayd eting.",
    "✨ Bugungi kun uchun minnatdor bo'ling va ertangi kun rejalarini ko'zdan kechiring.",
    "🏅 Kunlik intizom g'olibona yakun topmoqda. Odatlaringiz to'liq yopildimi?",
  ],
  night: [
    "🌌 Sog'lom uyqu - ertangi kun kuchi. Tungi soatlarni tiklanish va xotirjamlikka bag'ishlang.",
    "🛌 Uyqu sifatini kuzatishni unutmang. Rejimga amal qilish miyangizning eng yaxshi do'stidir.",
    "✨ Bugun qo'lingizdan kelganini qildingiz. Endi xotirjam dam oling. Xayrli tun!",
  ],
};

/**
 * Task completion celebration praise pool
 */
export const UZBEK_TASK_PRAISE_MESSAGES = [
  "🏆 Qoyilmaqom ish! Vazifani muvaffaqiyatli yakunladingiz. +50 XP va intizom o'sishi!",
  "⚡️ Zo'r natija! Siz yana bir to'siqni yengib o'tdingiz. Rivojlanish to'xtamaydi!",
  "🌟 Ajoyib intizom! Har bir yopilgan vazifa sizni professional cho'qqiga yaqinlashtiradi.",
  "🚀 Maqsadga sodiqlik - sizning kuchingiz. Ushbu g'alaba bilan tabriklaymiz!",
];

/**
 * Determine time period of day
 */
export function getTimeOfDayPeriod(hour: number): 'morning' | 'focus' | 'afternoon' | 'evening' | 'night' {
  if (hour >= 6 && hour < 10) return 'morning';
  if (hour >= 10 && hour < 14) return 'focus';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
}

/**
 * Get random item from an array
 */
function getRandomItem<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * Pure function: Generate Smart Notification Decisions based on context
 */
export function evaluateNotificationTriggers(
  ctx: NotificationEvaluationContext
): NotificationDecision[] {
  const decisions: NotificationDecision[] = [];
  const now = typeof ctx.currentTime === 'string' ? new Date(ctx.currentTime) : ctx.currentTime;
  const currentHour = now.getHours();
  const timePeriod = getTimeOfDayPeriod(currentHour);
  const nowIso = now.toISOString();

  // 1. Task Completed Praise (if a task was just completed)
  if (ctx.recentlyCompletedTask) {
    const praise = getRandomItem(UZBEK_TASK_PRAISE_MESSAGES);
    decisions.push({
      id: `praise_${ctx.recentlyCompletedTask.id}_${Date.now()}`,
      type: 'task_completed_praise',
      title: '🏆 Vazifa yakunlandi!',
      message: `${praise}\n\n📌 *«${ctx.recentlyCompletedTask.title}»*\n✨ Daraja va tajriba ballari yangilandi!`,
      priority: 'high',
      inlineKeyboard: [
        [
          { text: '📋 Boshqa vazifalar', callback_data: 'view_tasks' },
          { text: '📊 Bugungi reja', callback_data: 'view_today' },
        ],
      ],
      createdAt: nowIso,
      metadata: { taskId: ctx.recentlyCompletedTask.id },
    });
  }

  // 2. Inactivity Warning (User hasn't opened Life-OS for >= 4 hours during daytime 09:00 - 21:00)
  if (ctx.lastActiveAt && currentHour >= 9 && currentHour <= 21) {
    const lastActive = typeof ctx.lastActiveAt === 'string' ? new Date(ctx.lastActiveAt) : ctx.lastActiveAt;
    const diffHours = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60);

    if (diffHours >= 4) {
      decisions.push({
        id: `inactivity_${now.toDateString()}_${Math.floor(diffHours)}`,
        type: 'inactivity_warning',
        title: '⚠️ Platformaga kirish eslatmasi',
        message: `👋 Salom, Mirhamid! Siz ${Math.floor(diffHours)} soatdan beri Life-OS platformasiga kirmadingiz.\n\nBugungi rejalaringiz, odatlaringiz va intizom ko'rsatkichlaringiz sizni kutmoqda! Kichik tanaffus yaxshi, ammo safga qaytish vaqti keldi. 🚀`,
        priority: 'high',
        inlineKeyboard: [
          [
            { text: '📲 Platformani ochish', url: ctx.webAppUrl || 'http://localhost:3000/uz/today' },
            { text: '📋 Bugungi reja', callback_data: 'view_today' },
          ],
        ],
        createdAt: nowIso,
        metadata: { diffHours: Math.floor(diffHours) },
      });
    }
  }

  // 3. Habit Reminders (pending habits based on time of day)
  if (ctx.habits && ctx.habits.length > 0) {
    const pendingHabits = ctx.habits.filter(h => !h.completedToday);

    // Filter relevant habits for this time
    const relevantPending = pendingHabits.filter(h => {
      if (currentHour >= 7 && currentHour <= 12 && h.timeOfDay === 'morning') return true;
      if (currentHour >= 12 && currentHour <= 18 && h.timeOfDay === 'afternoon') return true;
      if (currentHour >= 18 && currentHour <= 22 && h.timeOfDay === 'evening') return true;
      // Default: if afternoon/evening and still pending
      return currentHour >= 15 && (!h.timeOfDay || h.timeOfDay === 'evening');
    });

    if (relevantPending.length > 0) {
      const targetHabit = relevantPending[0];
      decisions.push({
        id: `habit_${targetHabit.id}_${now.toDateString()}`,
        type: 'habit_reminder',
        title: '⚡️ Odat eslatmasi',
        message: `🔔 *«${targetHabit.name}»* odatingiz hali bajarilmadi!\n\nKunlik zanjirni (streak: ${targetHabit.streak || 0} kun) uzib qo'ymaslik uchun uni hoziroq bajaring va tasdiqlang:`,
        priority: 'medium',
        inlineKeyboard: [
          [
            { text: `✅ «${targetHabit.name}» Bajarildi`, callback_data: `habit_done:${targetHabit.id}` },
          ],
          [
            { text: '📋 Barcha odatlar', callback_data: 'view_habits' },
            { text: '⏰ 1 soatdan keyin', callback_data: `snooze:habit:${targetHabit.id}` },
          ],
        ],
        createdAt: nowIso,
        metadata: { habitId: targetHabit.id, habitName: targetHabit.name },
      });
    }
  }

  // 4. Pending Tasks Due Reminder (urgent or medium-high tasks not done by late afternoon/evening)
  if (ctx.pendingTasks && ctx.pendingTasks.length > 0 && currentHour >= 14 && currentHour <= 20) {
    const urgentTasks = ctx.pendingTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');
    const taskToRemind = urgentTasks[0] || ctx.pendingTasks[0];

    decisions.push({
      id: `task_due_${taskToRemind.id}_${now.toDateString()}`,
      type: 'task_due_reminder',
      title: '🎯 Muhim vazifa eslatmasi',
      message: `📌 *«${taskToRemind.title}»* vazifasi bugungi ro'yxatingizda turibdi.\n\nKechiktirmasdan uni yakunlang yoki bajarilgan bo'lsa bitta tugma bilan tasdiqlang:`,
      priority: taskToRemind.priority === 'urgent' ? 'urgent' : 'medium',
      inlineKeyboard: [
        [
          { text: `✅ «${taskToRemind.title}» Yakunlandi`, callback_data: `task_done:${taskToRemind.id}` },
        ],
        [
          { text: '📋 Barcha vazifalar', callback_data: 'view_tasks' },
        ],
      ],
      createdAt: nowIso,
      metadata: { taskId: taskToRemind.id },
    });
  }

  // 5. Hourly Motivational Quote (if not sent in this hour, during awake hours 07:00 - 22:00)
  if (currentHour >= 7 && currentHour <= 22 && ctx.lastHourlyQuoteHour !== currentHour) {
    const quoteList = UZBEK_HOURLY_QUOTES[timePeriod];
    const quote = getRandomItem(quoteList);

    decisions.push({
      id: `quote_${now.toDateString()}_${currentHour}`,
      type: 'hourly_quote',
      title: `💡 Soatlik Motivatsiya (${timePeriod.toUpperCase()})`,
      message: `${quote}\n\n_Vaqt: ${currentHour}:00 | Life-OS intizom murabbiyi_`,
      priority: 'low',
      inlineKeyboard: [
        [
          { text: '📊 Bugungi reja', callback_data: 'view_today' },
          { text: '✍️ Yangi vazifa', callback_data: 'quick_task' },
        ],
      ],
      createdAt: nowIso,
      metadata: { hour: currentHour, period: timePeriod },
    });
  }

  // 6. Tracker Reminder (e.g. Suv yoki Uyqu logi kechqurun 21:00+)
  if (ctx.trackers && ctx.trackers.length > 0 && currentHour >= 21) {
    const unlogged = ctx.trackers.filter(t => !t.loggedToday);
    if (unlogged.length > 0) {
      decisions.push({
        id: `tracker_${now.toDateString()}_${unlogged[0].id}`,
        type: 'tracker_reminder',
        title: '📊 Kun yakuni: Trekerlarni to\'ldirish',
        message: `🌙 Bugungi kun yakunlanmoqda! *${unlogged.map(t => t.name).join(', ')}* trekerlaringiz to'ldirilmagan.\n\nKunlik statistikani to'liq saqlab qolish uchun bugungi uyqu va kunlik natijalarni belgilang!`,
        priority: 'medium',
        inlineKeyboard: [
          [
            { text: '📲 Trekerlarni ochish', url: ctx.webAppUrl || 'http://localhost:3000/uz/health' },
            { text: '✅ Barchasi joyida', callback_data: 'tracker_ack' },
          ],
        ],
        createdAt: nowIso,
      });
    }
  }

  return decisions;
}

/**
 * Helper to format Telegram Markdown message with inline buttons
 */
export function formatTelegramNotificationPayload(decision: NotificationDecision, chatId: string | number) {
  return {
    chat_id: chatId,
    text: `*${decision.title}*\n\n${decision.message}`,
    parse_mode: 'Markdown',
    reply_markup: decision.inlineKeyboard
      ? {
          inline_keyboard: decision.inlineKeyboard,
        }
      : undefined,
  };
}
