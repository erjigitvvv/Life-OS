import { NextRequest, NextResponse } from 'next/server';
import {
  evaluateNotificationTriggers,
  formatTelegramNotificationPayload,
  NotificationEvaluationContext,
} from '@lifeos/rules';
import { sendTelegramMessage } from '@/lib/telegram';

export async function GET(req: NextRequest) {
  return handleCronEvaluation(req);
}

export async function POST(req: NextRequest) {
  return handleCronEvaluation(req);
}

async function handleCronEvaluation(req: NextRequest) {
  try {
    const telegramChatId = process.env.TELEGRAM_CHAT_ID;
    const now = new Date();

    // Default context for notification evaluation
    const evaluationContext: NotificationEvaluationContext = {
      currentTime: now,
      // Check last active: default 5 hours ago if simulated
      lastActiveAt: new Date(now.getTime() - 4.5 * 60 * 60 * 1000),
      habits: [
        {
          id: 'sport',
          name: '🏃‍♂️ Ertalabki sport',
          completedToday: false,
          timeOfDay: 'morning',
          streak: 18,
        },
        {
          id: 'reading',
          name: '📖 20 bet kitob o\'qish',
          completedToday: false,
          timeOfDay: 'evening',
          streak: 12,
        },
      ],
      pendingTasks: [
        {
          id: 'deploy_sync',
          title: 'Life-OS Telegram Bot va Smart Notification',
          priority: 'urgent',
        },
      ],
      trackers: [
        {
          id: 'water_tracker',
          name: 'Suv va Uyqu logi',
          loggedToday: false,
        },
      ],
      webAppUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000/uz/today',
    };

    // Evaluate smart notification decisions via pure rule engine
    const decisions = evaluateNotificationTriggers(evaluationContext);

    const sentNotifications: any[] = [];

    if (telegramChatId && decisions.length > 0) {
      // Pick top priority notification to prevent spamming
      const topDecision = decisions[0];

      const payload = formatTelegramNotificationPayload(topDecision, telegramChatId);

      const res = await sendTelegramMessage(telegramChatId, payload.text, {
        parse_mode: 'Markdown',
        reply_markup: payload.reply_markup,
      });

      sentNotifications.push({
        decisionId: topDecision.id,
        type: topDecision.type,
        telegramResult: res,
      });
    }

    return NextResponse.json({
      success: true,
      evaluatedAt: now.toISOString(),
      decisionsCount: decisions.length,
      decisions: decisions.map(d => ({ id: d.id, type: d.type, title: d.title, priority: d.priority })),
      sentCount: sentNotifications.length,
      sentNotifications,
    });
  } catch (error: any) {
    console.error('[Telegram Cron Evaluation Error]:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
