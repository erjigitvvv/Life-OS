import { NextRequest, NextResponse } from 'next/server';
import {
  evaluateNotificationTriggers,
  formatTelegramNotificationPayload,
  NotificationEvaluationContext,
  evaluateDailyQuadrantNotification,
  DailyQuadrant,
} from '@lifeos/rules';
import { sendTelegramMessage } from '@/lib/telegram';
import { completeWithAi } from '@/lib/ai-gateway';

// In-memory persistent tracker for daily quadrant notifications (prevents duplicate triggers per calendar day)
let dailyQuadrantLog: Record<string, DailyQuadrant[]> = {}; // "YYYY-MM-DD" -> ['morning', 'midday', ...]

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
    const todayKey = now.toISOString().split('T')[0];
    const currentHour = now.getHours();

    if (!dailyQuadrantLog[todayKey]) {
      dailyQuadrantLog[todayKey] = [];
    }
    const sentQuadrantsToday = dailyQuadrantLog[todayKey];

    const sentNotifications: any[] = [];

    // =========================================================================
    // 1. SMART DAILY QUADRANT ALGORITHM (Tongda 1 marta, Tushlikda, Kechki, Tungi)
    // =========================================================================
    const quadrantInfo = evaluateDailyQuadrantNotification(currentHour, sentQuadrantsToday);

    if (quadrantInfo) {
      // Mark as sent immediately to avoid race conditions
      dailyQuadrantLog[todayKey].push(quadrantInfo.quadrant);

      // Generate ultra-personalized dynamic Uzbek text using Multi-Provider AI (Groq Qwen / Gemini 2.5)
      let customAiMessage = quadrantInfo.defaultAdvice;
      try {
        const aiRes = await completeWithAi({
          systemPrompt: `Siz Mirhamid Erjigitovning shaxsiy Life-OS intizom murabbiyisiz.
Foydalanuvchiga ${quadrantInfo.nameUz.toUpperCase()} vaqti uchun 2-3 jumlali kuchli, samimiy va intizomli o'zbekcha eslatma yozing.
Hech qanday ortiqcha gaplarsiz, to'g'ridan-to'g'ri uning muvaffaqiyatiga va kunlik maqsadlariga undovchi bo'lsin.`,
          userPrompt: `Hozir ${quadrantInfo.nameUz} vaqti (soat ${currentHour}:00). Mirhamidga bugungi rejalari bo'yicha qisqa, ta'sirchan eslatma bering.`,
          maxTokens: 180,
          temperature: 0.7,
        });
        if (aiRes.text) {
          customAiMessage = aiRes.text.trim();
        }
      } catch (e) {
        console.warn('[Cron AI Generation Error]:', e);
      }

      const telegramText = `*${quadrantInfo.title}*\n\n${customAiMessage}\n\n_Vaqt: ${currentHour}:00 | Life-OS AI Engine_`;

      if (telegramChatId) {
        const res = await sendTelegramMessage(telegramChatId, telegramText, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: quadrantInfo.buttons,
          },
        });

        sentNotifications.push({
          type: `daily_quadrant_${quadrantInfo.quadrant}`,
          title: quadrantInfo.title,
          sent: true,
          telegramResult: res,
        });
      } else {
        sentNotifications.push({
          type: `daily_quadrant_${quadrantInfo.quadrant}`,
          title: quadrantInfo.title,
          sent: false,
          reason: 'TELEGRAM_CHAT_ID not configured',
        });
      }
    }

    // =========================================================================
    // 2. CONTEXTUAL TRIGGERS (Inactivity, Urgent Tasks, Unlogged Habits)
    // =========================================================================
    const evaluationContext: NotificationEvaluationContext = {
      currentTime: now,
      lastActiveAt: new Date(now.getTime() - 4.5 * 60 * 60 * 1000),
      habits: [
        {
          id: 'sport',
          name: '🏃‍♂️ Ertalabki sport',
          completedToday: false,
          timeOfDay: 'morning',
          streak: 18,
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

    const decisions = evaluateNotificationTriggers(evaluationContext);

    // If no quadrant message was sent, send top priority context trigger
    if (sentNotifications.length === 0 && telegramChatId && decisions.length > 0) {
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
      currentHour,
      activeQuadrantToday: sentQuadrantsToday,
      currentQuadrantMatched: quadrantInfo ? quadrantInfo.quadrant : null,
      decisionsCount: decisions.length,
      sentCount: sentNotifications.length,
      sentNotifications,
    });
  } catch (error: any) {
    console.error('[Telegram Cron Evaluation Error]:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
