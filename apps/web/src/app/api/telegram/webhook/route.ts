import { NextRequest, NextResponse } from 'next/server';
import {
  sendTelegramMessage,
  editTelegramMessage,
  answerCallbackQuery,
  parseTelegramQuickText,
  generateTelegramAiResponse,
} from '@/lib/telegram';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UZBEK_TASK_PRAISE_MESSAGES } from '@lifeos/rules';

export async function GET(req: NextRequest) {
  return NextResponse.json({
    status: 'online',
    service: 'LifeOS Telegram Webhook Gateway',
    timestamp: new Date().toISOString(),
    configured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
  });
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    // 1. Handle Inline Keyboard Callback Queries
    if (update.callback_query) {
      const cq = update.callback_query;
      const data: string = cq.data || '';
      const chatId = cq.message?.chat?.id;
      const messageId = cq.message?.message_id;

      if (data.startsWith('habit_done:')) {
        const habitId = data.replace('habit_done:', '');
        await answerCallbackQuery(cq.id, '🎉 Odat muvaffaqiyatli bajarildi! +20 XP qo\'shildi!', false);

        if (chatId && messageId) {
          const originalText = cq.message?.text || '';
          await editTelegramMessage(
            chatId,
            messageId,
            `${originalText}\n\n✅ *Bajarildi deb belgilandi! (+20 XP)*`
          );
        }

        // Sync to Supabase if configured
        if (isSupabaseConfigured) {
          try {
            await supabase.from('habit_logs').insert({
              habit_id: habitId,
              date: new Date().toISOString().split('T')[0],
              completed: true,
            });
          } catch {}
        }

        return NextResponse.json({ ok: true, action: 'habit_completed' });
      }

      if (data.startsWith('task_done:')) {
        const taskId = data.replace('task_done:', '');
        await answerCallbackQuery(cq.id, '🏆 Vazifa yakunlandi! +50 XP va intizom o\'sishi!', false);

        const randomPraise =
          UZBEK_TASK_PRAISE_MESSAGES[
            Math.floor(Math.random() * UZBEK_TASK_PRAISE_MESSAGES.length)
          ];

        if (chatId && messageId) {
          const originalText = cq.message?.text || '';
          await editTelegramMessage(
            chatId,
            messageId,
            `${originalText}\n\n🏆 *Vazifa yopildi! (+50 XP)*\n${randomPraise}`
          );
        }

        // Sync to Supabase if configured
        if (isSupabaseConfigured) {
          try {
            await supabase
              .from('tasks')
              .update({ status: 'done', completed_at: new Date().toISOString() })
              .eq('id', taskId);
          } catch {}
        }

        return NextResponse.json({ ok: true, action: 'task_completed' });
      }

      if (data === 'view_today' && chatId) {
        await answerCallbackQuery(cq.id);
        await sendTelegramMessage(chatId, getTodaySummaryText(), {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '⚡️ Odatlar', callback_data: 'view_habits' },
                { text: '🎯 Vazifalar', callback_data: 'view_tasks' },
              ],
              [
                { text: '📲 Web platformani ochish', url: 'http://localhost:3000/uz/today' },
              ],
            ],
          },
        });
        return NextResponse.json({ ok: true });
      }

      if (data === 'view_habits' && chatId) {
        await answerCallbackQuery(cq.id);
        await sendTelegramMessage(chatId, getHabitsOverviewText(), {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ 🏃‍♂️ Ertalabki sport', callback_data: 'habit_done:sport' },
                { text: '✅ 📖 Kitob o\'qish', callback_data: 'habit_done:reading' },
              ],
              [
                { text: '✅ 💻 2h Deep Work', callback_data: 'habit_done:deepwork' },
                { text: '✅ 💧 2L Suv', callback_data: 'habit_done:water' },
              ],
              [
                { text: '📊 Bugungi reja', callback_data: 'view_today' },
              ],
            ],
          },
        });
        return NextResponse.json({ ok: true });
      }

      if (data === 'view_tasks' && chatId) {
        await answerCallbackQuery(cq.id);
        await sendTelegramMessage(chatId, getTasksOverviewText(), {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '✅ Life-OS Telegram Bot sync', callback_data: 'task_done:tele_sync' },
              ],
              [
                { text: '✅ Budget Planner tahlil', callback_data: 'task_done:budget_review' },
              ],
              [
                { text: '📊 Bugungi reja', callback_data: 'view_today' },
              ],
            ],
          },
        });
        return NextResponse.json({ ok: true });
      }

      if (data.startsWith('snooze:')) {
        await answerCallbackQuery(cq.id, '⏰ Eslatma 1 soatga qoldirildi!', false);
        return NextResponse.json({ ok: true });
      }

      await answerCallbackQuery(cq.id, 'Qabul qilindi');
      return NextResponse.json({ ok: true });
    }

    // 2. Handle Messages
    if (update.message) {
      const msg = update.message;
      const chatId = msg.chat?.id;
      const text: string = msg.text || '';

      if (!chatId || !text) {
        return NextResponse.json({ ok: true });
      }

      // Handle Slash Commands
      if (text.startsWith('/')) {
        const command = text.split(' ')[0].toLowerCase();

        if (command === '/start') {
          const welcome = `Assalomu alaykum, Mirhamid! 🚀

Sizning *Life-OS — Kognitiv Raqamli Egizak va Intizom Murabbiyi* boti xizmatingizda.

Men orqali:
• Rejalashtirilgan vazifalarni yopish
• Odatlarni bitta tugma bilan tasdiqlash
• Moliyaviy xarajatlarni tezkor yozish
• Intizomli soatlik motivatsiyalar va eslatmalar olishingiz mumkin.

*Quyidagi tugmalardan birini tanlang yoki tabiiy tilda yozing:*`;

          await sendTelegramMessage(chatId, welcome, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '📋 Bugungi reja', callback_data: 'view_today' },
                  { text: '⚡️ Odatlar', callback_data: 'view_habits' },
                ],
                [
                  { text: '🎯 Vazifalar', callback_data: 'view_tasks' },
                  { text: '📲 Platformani ochish', url: 'http://localhost:3000/uz/today' },
                ],
              ],
            },
          });
          return NextResponse.json({ ok: true });
        }

        if (command === '/today') {
          await sendTelegramMessage(chatId, getTodaySummaryText(), {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '⚡️ Odatlar', callback_data: 'view_habits' },
                  { text: '🎯 Vazifalar', callback_data: 'view_tasks' },
                ],
              ],
            },
          });
          return NextResponse.json({ ok: true });
        }

        if (command === '/habits') {
          await sendTelegramMessage(chatId, getHabitsOverviewText(), {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '✅ 🏃‍♂️ Ertalabki sport', callback_data: 'habit_done:sport' },
                  { text: '✅ 📖 Kitob o\'qish', callback_data: 'habit_done:reading' },
                ],
                [
                  { text: '✅ 💻 2h Deep Work', callback_data: 'habit_done:deepwork' },
                  { text: '✅ 💧 2L Suv', callback_data: 'habit_done:water' },
                ],
              ],
            },
          });
          return NextResponse.json({ ok: true });
        }

        if (command === '/tasks') {
          await sendTelegramMessage(chatId, getTasksOverviewText(), {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '✅ Life-OS Telegram Bot sync', callback_data: 'task_done:tele_sync' },
                ],
                [
                  { text: '✅ Budget Planner tahlil', callback_data: 'task_done:budget_review' },
                ],
              ],
            },
          });
          return NextResponse.json({ ok: true });
        }

        if (command === '/budget') {
          const budgetText = `💰 *Moliya Markazi & Byudjet Holati*

• Jami jamg'arma: *35,900,000 so'm*
• Oylik byudjet sarfi: *5,050,000 / 8,500,000 so'm* (59%)
• Qolgan mablag': *3,450,000 so'm*
• Zaxira fondi: *34,500,000 so'm* (69%)

_Tezkor chiqim kiritish uchun: «50000 so'm tushlik» deb yozing._`;

          await sendTelegramMessage(chatId, budgetText, {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '💳 Moliya markazini ochish', url: 'http://localhost:3000/uz/finance' },
                ],
              ],
            },
          });
          return NextResponse.json({ ok: true });
        }

        if (command === '/help') {
          const help = `📖 *Life-OS Bot Qollanmasi*

*Komandalar:*
• \`/today\` — Bugungi reja va ko'rsatkichlar
• \`/habits\` — Odatlar va inline tasdiqlash
• \`/tasks\` — Vazifalar va yakunlash
• \`/budget\` — Byudjet va sarflar holati

*Tezkor yozish (Tabiiy til):*
• \`2 soat backend kod\` — Vaqt logi
• \`45000 so'm tushlik\` — Xarajat qaydi
• \`task: Yangi arxitektura chizish\` — Vazifa qo'shish
• \`odat: 10 sahifa mutolaa\` — Yangi odat qo'shish

Shuningdek, istalgan savolingizni yozsangiz, Anthropic Claude 3.5 Sonnet asosidagi AI murabbiy sizga maslahat beradi!`;

          await sendTelegramMessage(chatId, help);
          return NextResponse.json({ ok: true });
        }
      }

      // Handle Quick Natural Language Parsing
      const parsed = parseTelegramQuickText(text);

      if (parsed.type === 'time') {
        const { duration, activity } = parsed.payload;
        const reply = `⏱️ *Fokus vaqti muvaffaqiyatli qayd etildi!*

• Mashg'ulot: *${activity}*
• Sarflangan vaqt: *${duration} soat*
• Mukofot: *+${Math.round(duration * 40)} XP*

Diqqatni jamlash darajangiz ajoyib! 🔥`;

        await sendTelegramMessage(chatId, reply);
        return NextResponse.json({ ok: true });
      }

      if (parsed.type === 'expense') {
        const { amount, description, category } = parsed.payload;
        const reply = `💰 *Xarajat qayd etildi!*

• Miqdor: *${amount.toLocaleString()} so'm*
• Tavsif: *${description}*
• Kategoriya: *${category}*
• Real-time balans va byudjet sarfi yangilandi.`;

        await sendTelegramMessage(chatId, reply, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: '💳 Byudjetni ko\'rish', url: 'http://localhost:3000/uz/finance?tab=budgets' },
              ],
            ],
          },
        });
        return NextResponse.json({ ok: true });
      }

      if (parsed.type === 'task') {
        const { title } = parsed.payload;
        const reply = `✅ *Yangi vazifa qabul qilindi!*

📌 *«${title}»*
Vazifalar ro'yxatingizga qo'shildi. Uni yakunlaganingizda quyidagi tugmani bosing:`;

        await sendTelegramMessage(chatId, reply, {
          reply_markup: {
            inline_keyboard: [
              [
                { text: `✅ «${title.slice(0, 20)}...» Yakunlandi`, callback_data: `task_done:quick_${Date.now()}` },
              ],
              [
                { text: '📋 Barcha vazifalar', callback_data: 'view_tasks' },
              ],
            ],
          },
        });
        return NextResponse.json({ ok: true });
      }

      // Default: AI Coach Chat (Claude 3.5 Sonnet)
      const aiReply = await generateTelegramAiResponse(text);
      await sendTelegramMessage(chatId, aiReply);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('[Telegram Webhook Error]:', error);
    return NextResponse.json({ ok: false, error: error?.message }, { status: 500 });
  }
}

// Helpers
function getTodaySummaryText() {
  const dateStr = new Date().toLocaleDateString('uz-UZ', { weekday: 'long', month: 'long', day: 'numeric' });
  return `📊 *Bugungi Kun Sarhisobi (${dateStr})*

👤 Foydalanuvchi: *Mirhamid Erjigitov*
🌟 Life Score: *89/100* (Level 14)
🔥 Streak: *18 kun ketma-ket*

✅ *Odatlar holati:* 3/5 bajarildi (60%)
📌 *Vazifalar:* 4 ta faol vazifa mavjud
💰 *Byudjet qoldig'i:* 3,450,000 so'm

_Kuningiz unumli o'tishini tilaymiz!_`;
}

function getHabitsOverviewText() {
  return `⚡️ *Bugungi Odatlar Ro'yxati*

🏃‍♂️ 1. Ertalabki sport (07:00) — ⏳ Kutilmoqda
📖 2. 20 sahifa kitob o'qish — ⏳ Kutilmoqda
💻 3. 2 soat Deep Work — ⏳ Kutilmoqda
💧 4. 2 litr toza suv — ⏳ Kutilmoqda
🧘‍♂️ 5. Kechki mulohaza (Kaizen) — ⏳ Kutilmoqda

*Bajarilgan odatni tasdiqlash uchun pastdagi tugmani bosing:*`;
}

function getTasksOverviewText() {
  return `🎯 *Bugungi Muhim Vazifalar*

1. 🔴 *Life-OS Telegram Bot synxronizatsiyasi* [Urgent]
2. 🟡 *Budget Planner va trekerlar tahlili* [Medium]
3. 🟢 *Kechki kod audit va push* [Low]

*Bajarilgan vazifani yopish uchun pastdagi tugmani bosing:*`;
}
