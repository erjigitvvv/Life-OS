/**
 * Telegram Bot for LifeOS Quick Capture
 *
 * Allows users to quickly log activities via Telegram:
 * - Text messages: "Bugun backend kod yozishga 3 soat sarfladim va IELTS reading qildim"
 * - Voice messages: Transcribed via Whisper API
 * - Commands: /task, /time, /habit, /budget, /goal
 */

import { Telegraf, Context, Telegram } from 'telegraf';
import { MyContext } from '../types';
import { EventService } from '../services/event-service';
import { OpenAI } from 'openai';
import { config } from '../config';

// Initialize services
const bot = new Telegraf(token);
const telegram = new Telegram(token);
const eventService = new EventService(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ============================================
// Command Handlers
// ============================================

bot.start((ctx) => ctx.reply('Welcome to LifeOS Telegram Bot! Use /help to see available commands.'));

bot.help((ctx) => ctx.reply availableCommands);

bot.command('task', async (ctx) => {
  const args = ctx.message?.text?.split(' ') || [];
  const title = args.slice(1).join(' ') || 'New task';

  await eventService.logTaskCreated(ctx.from!.id, title);
  await ctx.reply(`✅ Task added: "${title}"`);
});

bot.command('time', async (ctx) => {
  const args = ctx.message?.text?.split(' ') || [];
  const duration = parseFloat(args[1]) || 1;
  const activity = args.slice(2).join(' ') || 'Work';

  await eventService.logTimeLogCreated(ctx.from!.id, undefined, duration);
  await ctx.reply(`⏱️ Time logged: ${duration} hours of ${activity}`);
});

bot.command('habit', async (ctx) => {
  const args = ctx.message?.text?.split(' ') || [];
  const habitName = args.slice(1).join(' ') || 'New habit';

  await eventService.logHabitStarted(ctx.from!.id, habitName);
  await ctx.reply(`🌱 Habit started: "${habitName}"`);
});

bot.command('budget', async (ctx) => {
  const args = ctx.message?.text?.split(' ') || [];
  const amount = parseFloat(args[1]) || 0;
  const category = args[2] || 'general';

  await eventService.logFinanceTransaction(ctx.from!.id, `${category} expense`, amount, 'expense');
  await ctx.reply(`💰 Expense logged: ${amount} so'm - ${category}`);
});

bot.command('goal', async (ctx) => {
  const args = ctx.message?.text?.split(' ') || [];
  const goalTitle = args.slice(1).join(' ') || 'New goal';

  await eventService.logGoalCreated(ctx.from!.id, goalTitle);
  await ctx.reply(`🎯 Goal created: "${goalTitle}"`);
}

// ============================================
// Voice Message Handler
// ============================================

bot.on('voice', async (ctx) => {
  const voice = ctx.message?.voice;

  // Download voice file
  const voiceFile = await telegram.getFile(voice.file_id);
  const voiceUrl = voiceFile.file_path;

  // Download and send to Whisper for transcription
  const voiceResponse = await fetch(voiceUrl);
  const voiceBuffer = await voiceResponse.arrayBuffer();

  const transcription = await openai.audio.transcriptions.create({
    file: Buffer.from(voiceBuffer),
    model: 'whisper-1',
    language: 'uz', // Uzbek language
  });

  const text = transcription.text;

  // Parse the transcribed text for activity logging
  const parsed = parseTelegramText(text);

  // Log events based on parsed content
  if (parsed.type === 'task') {
    await eventService.logTaskCreated(ctx.from!.id, parsed.title, parsed.taskId);
    await ctx.reply(`📝 Task from voice: "${parsed.title}"`);
  } else if (parsed.type === 'time') {
    await eventService.logTimeLogCreated(ctx.from!.id, undefined, parsed.duration);
    await ctx.reply(`⏱️ Time from voice: ${parsed.duration} hours`);
  } else if (parsed.type === 'habit') {
    await eventService.logHabitCompleted(ctx.from!.id, parsed.habitName);
    await ctx.reply(`✅ Habit from voice: "${parsed.habitName}"`);
  } else if (parsed.type === 'budget') {
    await eventService.logFinanceTransaction(ctx.from!.id, parsed.category, parsed.amount, 'expense');
    await ctx.reply(`💰 Budget from voice: ${parsed.amount} so'm - ${parsed.category}`);
  } else {
    // Generic logging - just store the text
    await eventService.logAiChatMessage(ctx.from!.id, text, 'telegram_voice');
    await ctx.reply(`🎤 Voice transcribed and logged. Text: "${text.substring(0, 100)}..."`);
  }
});

// ============================================
// Text Message Handler (Quick Capture)
// ============================================

bot.on('message', async (ctx) => {
  const message = ctx.message?.text || '';

  // Skip commands (already handled)
  if (message.startsWith('/')) return;

  // Parse the message for activity types
  const parsed = parseTelegramText(message);

  switch (parsed.type) {
    case 'task':
      await eventService.logTaskCreated(ctx.from!.id, parsed.title, parsed.taskId);
      await ctx.reply(`✅ Task: "${parsed.title}"`);
      break;

    case 'time':
      await eventService.logTimeLogCreated(ctx.from!.id, undefined, parsed.duration);
      await ctx.reply(`⏱️ Time: ${parsed.duration} hours of "${parsed.activity}"`);
      break;

    case 'habit':
      await eventService.logHabitCompleted(ctx.from!.id, parsed.habitName);
      await ctx.reply(`✅ Habit: "${parsed.habitName}"`);
      break;

    case 'budget':
      await eventService.logFinanceTransaction(ctx.from!.id, parsed.category, parsed.amount, 'expense');
      await ctx.reply(`💰 Expense: ${parsed.amount} so'm - ${parsed.category}`);
      break;

    case 'goal':
      await eventService.logGoalCreated(ctx.from!.id, parsed.goalName);
      await ctx.reply(`🎯 Goal: "${parsed.goalName}"`);
      break;

    default:
      // Generic AI insight - send to Claude for analysis
      await eventService.logAiChatMessage(ctx.from!.id, message, 'telegram_text');
      await ctx.reply('💡 Message received. AI is analyzing your input for insights...');
      break;
  }
});

// ============================================
// Text Parser for Telegram Messages
// ============================================

function parseTelegramText(text: string): {
  type: 'task' | 'time' | 'habit' | 'budget' | 'goal' | 'generic';
  title: string;
  duration?: number;
  activity?: string;
  habitName?: string;
  goalName?: string;
  amount?: number;
  category?: string;
  taskId?: string;
} {
  const lowerText = text.toLowerCase();

  // Task patterns
  const taskPatterns = [
    /bugun\s+(\w+)\s+(kod|vazifa|ish|masala)/i,
    /(\w+)\s+kod yoz/i,
    /task:\s*(.+)/i,
    /(vazifa|ish)\s+qil/i,
  ];

  for (const pattern of taskPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      const title = match[1] || match[2] || 'New task';
      return {
        type: 'task',
        title: title,
        taskId: `tele_${Date.now()}`,
      };
    }
  }

  // Time patterns
  const timePatterns = [
    /(\d+(?:\.\d+)?)\s+soat/i,
    /(\d+(?:\.\d+)?)\s+soat\s+(kod|vazifa|ish|oqim)/i,
    /time:\s*(\d+(?:\.\d+)?)/i,
  ];

  for (const pattern of timePatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      const duration = parseFloat(match[1]);
      // Try to find activity after duration
      const activityMatch = lowerText.match(new RegExp(`(${duration})(?:\\s+soat)?\\s+(.+)`));
      const activity = activityMatch ? activityMatch[2].trim() : 'Work';

      return {
        type: 'time',
        duration,
        activity,
      };
    }
  }

  // Habit patterns
  const habitPatterns = [
    /odam\s+(\w+)/i,
    /habit:\s*(.+)/i,
    /(\w+)\s+odatini bajar/i,
  ];

  for (const pattern of habitPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      const habitName = match[1] || match[2] || 'New habit';
      return {
        type: 'habit',
        habitName,
      };
    }
  }

  // Budget patterns
  const budgetPatterns = [
    /(\d+(?:\.\d+)?)\s+so'm/i,
    /xarajat:\s*(\d+(?:\.\d+)?)/i,
    /pul\s+sarfladim\s+(\d+(?:\.\d+)?)/i,
  ];

  for (const pattern of budgetPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      const amount = parseFloat(match[1]);
      // Try to find category
      const categoryMatch = lowerText.match(/(transport|oziq-ovqat|maxfiyl|ta'minot|tog'ish|telegram)/i);
      const category = categoryMatch ? categoryMatch[1] : 'general';

      return {
        type: 'budget',
        amount,
        category,
      };
    }
  }

  // Goal patterns
  const goalPatterns = [
    /maqsad:\s*(.+)/i,
    /goal:\s*(.+)/i,
    /(\w+)\s+maqsoidi/i,
  ];

  for (const pattern of goalPatterns) {
    const match = lowerText.match(pattern);
    if (match) {
      const goalName = match[1] || match[2] || 'New goal';
      return {
        type: 'goal',
        goalName,
      };
    }
  }

  // Default: generic
  return {
    type: 'generic',
    title: text,
  };
}

// ============================================
// Start Bot
// ============================================

export async function startTelegramBot() {
  console.log('Starting LifeOS Telegram Bot...');
  await bot.launch();
  console.log('Telegram Bot is running!');

  // Enable graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
}

export default bot;