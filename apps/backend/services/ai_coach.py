import openai
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from config import settings
from services.event_service import EventService
from services.analytics_service import AnalyticsService

openai.api_key = settings.OPENAI_API_KEY

class AICoachService:
    def __init__(self, db: Session):
        self.db = db
        self.event_service = EventService(db)
        self.analytics_service = AnalyticsService(db)

    def generate_coach_response(self, user_id: str, user_message: str) -> str:
        events = self.event_service.get_recent_events(user_id, 30)

        habit_stats = self.analytics_service.calculate_habit_stats(events)
        study_mins = self.analytics_service.calculate_study_minutes(events)
        tasks_done = self.analytics_service.count_tasks_completed(events)

        prompt = f"""You are a personal life coaching AI for LifeOS.
User Context:
- Tasks Completed (last 30 days): {tasks_done}
- Habit Stats: {habit_stats['completed']} completed
- Study Time: {study_mins} minutes

User Message: {user_message}

Provide personalized, encouraging, and actionable coaching in Uzbek or English.
"""

        try:
            client = openai.OpenAI(api_key=settings.OPENAI_API_KEY)
            response = client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": user_message}
                ],
                temperature=0.7,
                max_tokens=400
            )
            return response.choices[0].message.content
        except Exception as e:
            return f"Hello! I'm your LifeOS AI Coach. (API note: {str(e)})"
