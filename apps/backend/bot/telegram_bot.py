import os
import re
import httpx
from aiogram import Bot, Dispatcher, F, Router
from aiogram.types import Message
from aiogram.filters import Command
from ..config import settings
from ..database import SessionLocal
from ..services.event_service import EventService
import openai

router = Router()

def parse_telegram_text(text: str) -> dict:
    lower_text = text.lower()

    # Time pattern: "3 soat backend"
    time_match = re.search(r'(\d+(?:\.\d+)?)\s+soat', lower_text)
    if time_match:
        duration = float(time_match.group(1))
        activity_match = re.search(r'(\d+(?:\.\d+)?)(?:\s+soat)?\s+(.+)', lower_text)
        activity = activity_match.group(2).strip() if activity_match else "Work"
        return {"type": "time", "duration": duration, "activity": activity}

    # Budget pattern: "50000 so'm"
    budget_match = re.search(r'(\d+(?:\.\d+)?)\s+so\'m', lower_text)
    if budget_match:
        amount = float(budget_match.group(1))
        return {"type": "budget", "amount": amount, "category": "general"}

    # Task pattern: "task: ..." or "vazifa ..."
    if "task" in lower_text or "vazifa" in lower_text or "kod" in lower_text:
        return {"type": "task", "title": text}

    return {"type": "generic", "title": text}

@router.message(Command("start"))
async def cmd_start(message: Message):
    await message.reply("Welcome to LifeOS Telegram Bot! 🚀 Use /help or send your activities in natural language.")

@router.message(Command("help"))
async def cmd_help(message: Message):
    await message.reply("Commands:\n/task <title> - Log task\n/time <hours> <activity> - Log time\n/budget <amount> - Log expense\n\nOr just chat naturally in Uzbek/English!")

@router.message(F.text)
async def handle_text_message(message: Message):
    text = message.text
    if text.startswith('/'):
        return

    user_id = str(message.from_user.id)
    parsed = parse_telegram_text(text)

    db = SessionLocal()
    try:
        event_service = EventService(db)
        event_service.log_telegram_message(user_id, text, "text")

        if parsed["type"] == "time":
            event_service.log_time_log(user_id, parsed["activity"], parsed["duration"])
            await message.reply(f"⏱️ Time logged: {parsed['duration']} hours of {parsed['activity']}")
        elif parsed["type"] == "budget":
            event_service.log_finance_transaction(user_id, "Expense", parsed["amount"], "expense")
            await message.reply(f"💰 Expense logged: {parsed['amount']} so'm")
        elif parsed["type"] == "task":
            event_service.log_task_created(user_id, parsed["title"], f"tele_{message.message_id}")
            await message.reply(f"✅ Task logged: {parsed['title']}")
        else:
            await message.reply("💡 Message logged and analyzed by LifeOS AI Coach.")
    finally:
        db.close()

# Note: Voice handling via Whisper API can be wired here with aiogram message.voice & telegram getFile API.
