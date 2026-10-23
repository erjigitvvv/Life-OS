from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import List, Dict, Any
from models.event import EventModel

class AnalyticsService:
    def __init__(self, db: Session):
        self.db = db

    def calculate_habit_stats(self, events: List[EventModel]) -> Dict[str, int]:
        habit_events = [e for e in events if e.event_category == "habits"]
        completed = len([e for e in habit_events if e.event_type == "habit_completed"])
        total = len(habit_events)
        return {"completed": completed, "total": max(total, completed)}

    def calculate_study_minutes(self, events: List[EventModel]) -> int:
        study_events = [e for e in events if e.event_category == "study"]
        total_mins = sum(e.context.get("duration_minutes", 0) for e in study_events if e.context)
        return total_mins

    def calculate_time_logged(self, events: List[EventModel]) -> int:
        time_events = [e for e in events if e.event_type == "time_log_created"]
        total_hours = sum(e.context.get("duration_hours", 0) for e in time_events if e.context)
        return int(total_hours * 60)

    def count_tasks_completed(self, events: List[EventModel]) -> int:
        return len([e for e in events if e.event_type == "task_completed"])

    def get_smart_suggestions(self, user_id: str, limit: int = 3) -> List[Dict[str, Any]]:
        suggestions = [
            {
                "id": "sug_1",
                "title": "Focus on high-priority backend tasks during peak morning hours (9-11 AM).",
                "priority": "high",
                "category": "productivity"
            },
            {
                "id": "sug_2",
                "title": "Complete your daily habit checklist to maintain your 5-day streak.",
                "priority": "medium",
                "category": "habits"
            },
            {
                "id": "sug_3",
                "title": "Schedule a 30-minute IELTS reading session before lunch.",
                "priority": "medium",
                "category": "study"
            }
        ]
        return suggestions[:limit]
