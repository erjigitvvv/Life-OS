/**
 * LifeOS Telegram Bot API Client & Smart Message Handler
 *
 * Implements:
 * 1. Telegram Bot API client (sendMessage, editMessage, answerCallbackQuery)
 * 2. Natural language parsing for Uzbek & English quick logs (Time, Expense, Task, Habit)
 * 3. AI Text generator compliant with D-001 (Claude 3.5 Sonnet primary with local Uzbek cognitive fallback)
 */

export interface TelegramSendMessageOptions {
  parse_mode?: 'Markdown' | 'HTML';
  reply_markup?: {
    inline_keyboard?: Array<Array<{ text: string; callback_data?: string; url?: string }>>;
    keyboard?: Array<Array<{ text: string }>>;
    resize_keyboard?: boolean;
    one_time_keyboard?: boolean;
  };
}

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

/**
 * Send message via Telegram Bot API
 */
export async function sendTelegramMessage(
  chatId: string | number,
  text: string,
  options?: TelegramSendMessageOptions
) {
  if (!TELEGRAM_BOT_TOKEN) {
    console.warn('[Telegram Bot] TELEGRAM_BOT_TOKEN is not configured.');
    return { ok: false, description: 'TELEGRAM_BOT_TOKEN missing' };
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: options?.parse_mode || 'Markdown',
        reply_markup: options?.reply_markup,
      }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('[Telegram API Error]:', err);
    return { ok: false, error: err?.message };
  }
}

/**
 * Edit existing message text in Telegram
 */
export async function editTelegramMessage(
  chatId: string | number,
  messageId: number,
  text: string,
  options?: TelegramSendMessageOptions
) {
  if (!TELEGRAM_BOT_TOKEN) return { ok: false };
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text,
        parse_mode: options?.parse_mode || 'Markdown',
        reply_markup: options?.reply_markup,
      }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('[Telegram Edit Error]:', err);
    return { ok: false, error: err?.message };
  }
}

/**
 * Answer inline callback query
 */
export async function answerCallbackQuery(
  callbackQueryId: string,
  text?: string,
  showAlert: boolean = false
) {
  if (!TELEGRAM_BOT_TOKEN) return { ok: false };
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert,
      }),
    });
    return await res.json();
  } catch (err: any) {
    console.error('[Telegram AnswerCallback Error]:', err);
    return { ok: false, error: err?.message };
  }
}

/**
 * Parse quick input text from Telegram in Uzbek / English
 */
export function parseTelegramQuickText(text: string): {
  type: 'time' | 'expense' | 'income' | 'task' | 'habit' | 'chat';
  payload?: any;
} {
  const lower = text.trim().toLowerCase();

  // 1. Time log: "2.5 soat kodlash" or "1 soat sport" or "45 daqiqa ingliz tili"
  const hourMatch = text.match(/(\d+(?:\.\d+)?)\s*(?:soat|h|hour)\s*(.*)/i);
  if (hourMatch) {
    const duration = parseFloat(hourMatch[1]);
    const activity = hourMatch[2]?.trim() || 'Fokus ishi';
    return { type: 'time', payload: { duration, activity } };
  }

  const minuteMatch = text.match(/(\d+)\s*(?:daqiqa|min|m)\s*(.*)/i);
  if (minuteMatch) {
    const duration = parseFloat((parseInt(minuteMatch[1]) / 60).toFixed(2));
    const activity = minuteMatch[2]?.trim() || 'Fokus ishi';
    return { type: 'time', payload: { duration, activity } };
  }

  // 2. Expense: "50000 so'm tushlik" or "120000 taxi"
  const expenseMatch = text.match(/(\d+(?:[.,\s]\d+)?)\s*(?:so'?m|sum|usd|\$)?\s*(.+)/i);
  if (
    expenseMatch &&
    (lower.includes("so'm") || lower.includes('sum') || lower.includes('xarajat') || lower.includes('chiqim'))
  ) {
    const rawAmt = expenseMatch[1].replace(/[\s,]/g, '');
    const amount = parseFloat(rawAmt);
    const desc = expenseMatch[2].replace(/(?:so'?m|sum|chiqim|xarajat)/gi, '').trim() || 'Chiqim';
    return { type: 'expense', payload: { amount, description: desc, category: 'Umumiy' } };
  }

  // 3. Task: "task: ..." or "vazifa: ..." or "+vazifa ..."
  if (lower.startsWith('task:') || lower.startsWith('vazifa:') || lower.startsWith('+vazifa') || lower.startsWith('+task')) {
    const title = text.replace(/^(task:|vazifa:|\+vazifa|\+task)\s*/i, '').trim();
    return { type: 'task', payload: { title } };
  }

  // 4. Habit: "habit: ..." or "odat: ..." or "+odat ..."
  if (lower.startsWith('habit:') || lower.startsWith('odat:') || lower.startsWith('+odat') || lower.startsWith('+habit')) {
    const name = text.replace(/^(habit:|odat:|\+odat|\+habit)\s*/i, '').trim();
    return { type: 'habit', payload: { name } };
  }

  return { type: 'chat', payload: { message: text } };
}

/**
 * Generate AI Coach response (D-001: Claude 3.5 Sonnet -> Deterministic Cognitive Fallback)
 */
export async function generateTelegramAiResponse(userMessage: string, context?: any): Promise<string> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  if (anthropicKey) {
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 600,
          system: `Siz Mirhamid Erjigitovning Life-OS shaxsiy intizom, mahsuldorlik va kognitiv rivojlanish murabbiyisiz (AI Coach).
Javoblaringiz har doim o'zbek tilida, aniq, qisqa, samimiy va amaliy bo'lsin.
Foydalanuvchini harakatga, intizomga va kunlik odatlarni to'ldirishga undashingiz kerak. Telegram formatiga mos Markdown formatidan foydalaning.`,
          messages: [{ role: 'user', content: userMessage }],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.content?.[0]?.text;
        if (text) return text;
      }
    } catch (e) {
      console.warn('[Claude API Error]:', e);
    }
  }

  // Deterministic local cognitive response fallback (Uzbek)
  const lower = userMessage.toLowerCase();
  if (lower.includes('salom') || lower.includes('assalomu')) {
    return `Assalomu alaykum, Mirhamid! 🚀 Bugungi intizom va rejalaringizga yordam berishga tayyorman. 

Buyruqlar:
• \`/today\` — Bugungi reja va ko'rsatkichlar
• \`/habits\` — Odatlar ro'yxati va tasdiqlash
• \`/tasks\` — Bajarilishi kerak bo'lgan vazifalar
• \`/budget\` — Moliya va byudjet holati

Tezkor yozish:
_«2 soat kod yozish»_, _«45000 so'm tushlik»_, yoki _«task: hisobot tayyorlash»_ deb yozsangiz, darhol qayd qilaman!`;
  }

  if (lower.includes('charchadim') || lower.includes('dangasa') || lower.includes('motivatsiya')) {
    return `⚡️ *Charchoq - bu yangi darajaga o'tish arafasidagi sinov!*

Bir oz tanaffus oling: 1 stakan toza suv iching, chuqur nafas oling yoki 5 daqiqa ko'zlaringizni dam oldiring. Keyin eng kichik birgina qadamni qo'ying. Katta yutuqlar kichik intizomdan boshlanadi! 🔥`;
  }

  return `💡 Qaydingiz qabul qilindi! Life-OS tizimi sizning har bir harakatingizni kuzatib, tahlil qilib bormoqda. Rejangizdagi keyingi vazifani yopishga tayyormisiz?`;
}
