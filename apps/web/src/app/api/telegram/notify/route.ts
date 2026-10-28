import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramMessage } from '@/lib/telegram';
import {
  evaluateNotificationTriggers,
  formatTelegramNotificationPayload,
  UZBEK_TASK_PRAISE_MESSAGES,
} from '@lifeos/rules';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, taskId, taskTitle, habitName, message, chatId: customChatId } = body;
    const targetChatId = customChatId || process.env.TELEGRAM_CHAT_ID;

    if (!targetChatId) {
      return NextResponse.json({
        success: false,
        warning: 'TELEGRAM_CHAT_ID is not configured in environment',
      });
    }

    if (type === 'task_completed') {
      const randomPraise =
        UZBEK_TASK_PRAISE_MESSAGES[
          Math.floor(Math.random() * UZBEK_TASK_PRAISE_MESSAGES.length)
        ];

      const text = `🏆 *Vazifa muvaffaqiyatli yakunlandi!*

📌 *«${taskTitle || 'Muhim vazifa'}»*
${randomPraise}

✨ Daraja va XP balansingiz oshdi! Intizomni saqlang! 🔥`;

      const res = await sendTelegramMessage(targetChatId, text, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📊 Bugungi reja', callback_data: 'view_today' },
              { text: '🎯 Boshqa vazifalar', callback_data: 'view_tasks' },
            ],
          ],
        },
      });

      return NextResponse.json({ success: true, telegramResult: res });
    }

    if (type === 'habit_completed') {
      const text = `🌟 *Odat bajarildi va qayd etildi!*

🏃‍♂️ *«${habitName || 'Kunlik odat'}»*
🔥 Odatlar zanjiri (streak) yana 1 kunga uzaytirildi! +20 XP qo'shildi.`;

      const res = await sendTelegramMessage(targetChatId, text, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '⚡️ Barcha odatlar', callback_data: 'view_habits' },
            ],
          ],
        },
      });

      return NextResponse.json({ success: true, telegramResult: res });
    }

    if (message) {
      const res = await sendTelegramMessage(targetChatId, message, {
        parse_mode: 'Markdown',
      });
      return NextResponse.json({ success: true, telegramResult: res });
    }

    return NextResponse.json({ success: false, error: 'Unknown notification type' }, { status: 400 });
  } catch (error: any) {
    console.error('[Notify Route Error]:', error);
    return NextResponse.json({ success: false, error: error?.message }, { status: 500 });
  }
}
