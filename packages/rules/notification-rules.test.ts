import { describe, it, expect } from 'vitest';
import {
  evaluateNotificationTriggers,
  formatTelegramNotificationPayload,
  getTimeOfDayPeriod,
  UZBEK_HOURLY_QUOTES,
  UZBEK_TASK_PRAISE_MESSAGES,
} from './notification-rules';

describe('Notification Rules & Smart Engine', () => {
  it('determines time of day period correctly', () => {
    expect(getTimeOfDayPeriod(7)).toBe('morning');
    expect(getTimeOfDayPeriod(11)).toBe('focus');
    expect(getTimeOfDayPeriod(15)).toBe('afternoon');
    expect(getTimeOfDayPeriod(20)).toBe('evening');
    expect(getTimeOfDayPeriod(23)).toBe('night');
    expect(getTimeOfDayPeriod(3)).toBe('night');
  });

  it('triggers task completed praise notification when recently completed task exists', () => {
    const decisions = evaluateNotificationTriggers({
      currentTime: new Date('2026-10-28T14:30:00Z'),
      recentlyCompletedTask: {
        id: 'task_123',
        title: 'Backend API endpoint integration',
        isCompleted: true,
      },
    });

    const praiseDecision = decisions.find(d => d.type === 'task_completed_praise');
    expect(praiseDecision).toBeDefined();
    expect(praiseDecision?.title).toContain('Vazifa yakunlandi');
    expect(praiseDecision?.message).toContain('Backend API endpoint integration');
    expect(praiseDecision?.inlineKeyboard?.[0]?.[0]?.text).toContain('Boshqa vazifalar');
  });

  it('triggers inactivity warning when user has not been active for >= 4 hours during day', () => {
    const now = new Date('2026-10-28T15:00:00'); // 15:00
    const lastActive = new Date('2026-10-28T10:00:00'); // 5 hours ago

    const decisions = evaluateNotificationTriggers({
      currentTime: now,
      lastActiveAt: lastActive,
    });

    const inactivityDecision = decisions.find(d => d.type === 'inactivity_warning');
    expect(inactivityDecision).toBeDefined();
    expect(inactivityDecision?.title).toContain('Platformaga kirish eslatmasi');
    expect(inactivityDecision?.message).toContain('5 soatdan beri');
    expect(inactivityDecision?.inlineKeyboard?.[0]?.[0]?.text).toContain('Platformani ochish');
  });

  it('does not trigger inactivity warning during sleeping hours', () => {
    const now = new Date('2026-10-28T03:00:00'); // 03:00 at night
    const lastActive = new Date('2026-10-27T20:00:00');

    const decisions = evaluateNotificationTriggers({
      currentTime: now,
      lastActiveAt: lastActive,
    });

    const inactivityDecision = decisions.find(d => d.type === 'inactivity_warning');
    expect(inactivityDecision).toBeUndefined();
  });

  it('triggers habit reminder with inline confirmation button for pending habits', () => {
    const now = new Date('2026-10-28T09:00:00'); // 09:00 morning

    const decisions = evaluateNotificationTriggers({
      currentTime: now,
      habits: [
        {
          id: 'habit_sport',
          name: 'Ertalabki yugurish',
          completedToday: false,
          timeOfDay: 'morning',
          streak: 7,
        },
      ],
    });

    const habitDecision = decisions.find(d => d.type === 'habit_reminder');
    expect(habitDecision).toBeDefined();
    expect(habitDecision?.message).toContain('Ertalabki yugurish');
    expect(habitDecision?.inlineKeyboard?.[0]?.[0]?.callback_data).toBe('habit_done:habit_sport');
  });

  it('triggers task due reminder for urgent tasks in afternoon', () => {
    const now = new Date('2026-10-28T16:00:00'); // 16:00 afternoon

    const decisions = evaluateNotificationTriggers({
      currentTime: now,
      pendingTasks: [
        {
          id: 'task_deploy',
          title: 'Production Deploy to Cloud',
          priority: 'urgent',
        },
      ],
    });

    const taskDecision = decisions.find(d => d.type === 'task_due_reminder');
    expect(taskDecision).toBeDefined();
    expect(taskDecision?.message).toContain('Production Deploy to Cloud');
    expect(taskDecision?.inlineKeyboard?.[0]?.[0]?.callback_data).toBe('task_done:task_deploy');
  });

  it('triggers hourly motivational quote in Uzbek', () => {
    const now = new Date('2026-10-28T11:00:00'); // 11:00 focus period

    const decisions = evaluateNotificationTriggers({
      currentTime: now,
      lastHourlyQuoteHour: 10, // last was hour 10, now hour 11
    });

    const quoteDecision = decisions.find(d => d.type === 'hourly_quote');
    expect(quoteDecision).toBeDefined();
    expect(quoteDecision?.title).toContain('FOCUS');
    expect(quoteDecision?.message).toContain('11:00');
  });

  it('formats telegram payload correctly with inline keyboard markup', () => {
    const decision = {
      id: 'test_1',
      type: 'habit_reminder' as const,
      title: 'Odat eslatmasi',
      message: 'Kitob o\'qish',
      priority: 'medium' as const,
      inlineKeyboard: [
        [{ text: '✅ Bajarildi', callback_data: 'habit_done:kitob' }],
      ],
      createdAt: new Date().toISOString(),
    };

    const payload = formatTelegramNotificationPayload(decision, '123456789');
    expect(payload.chat_id).toBe('123456789');
    expect(payload.parse_mode).toBe('Markdown');
    expect(payload.reply_markup?.inline_keyboard[0][0].callback_data).toBe('habit_done:kitob');
  });
});
