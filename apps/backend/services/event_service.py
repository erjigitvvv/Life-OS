from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from models.event import EventModel
from schemas.event import EventCreate

class EventService:
    def __init__(self, db: Session):
        self.db = db

    def log_event(self, data: EventCreate) -> EventModel:
        db_event = EventModel(
            user_id=data.user_id,
            event_type=data.event_type,
            event_category=data.event_category,
            title=data.title,
            description=data.description,
            context=data.context,
            metadata=data.metadata,
            source=data.source,
        )
        self.db.add(db_event)
        self.db.commit()
        self.db.refresh(db_event)
        return db_event

    def log_task_created(self, user_id: str, title: str, task_id: str) -> EventModel:
        return self.log_event(EventCreate(
            user_id=user_id,
            event_type="task_created",
            event_category="productivity",
            title=title,
            context={"task_id": task_id}
        ))

    def log_task_completed(self, user_id: str, title: str, task_id: str, duration_minutes: Optional[int] = None) -> EventModel:
        return self.log_event(EventCreate(
            user_id=user_id,
            event_type="task_completed",
            event_category="productivity",
            title=title,
            context={"task_id": task_id, "duration_minutes": duration_minutes}
        ))

    def log_habit_completed(self, user_id: str, title: str, habit_id: str) -> EventModel:
        return self.log_event(EventCreate(
            user_id=user_id,
            event_type="habit_completed",
            event_category="habits",
            title=title,
            context={"habit_id": habit_id}
        ))

    def log_time_log(self, user_id: str, activity: str, duration_hours: float) -> EventModel:
        return self.log_event(EventCreate(
            user_id=user_id,
            event_type="time_log_created",
            event_category="productivity",
            title=f"Time: {activity}",
            context={"duration_hours": duration_hours, "activity": activity}
        ))

    def log_finance_transaction(self, user_id: str, title: str, amount: float, tx_type: str = "expense") -> EventModel:
        return self.log_event(EventCreate(
            user_id=user_id,
            event_type="finance_transaction",
            event_category="finance",
            title=title,
            context={"amount": amount, "type": tx_type}
        ))

    def log_goal_created(self, user_id: str, title: str) -> EventModel:
        return self.log_event(EventCreate(
            user_id=user_id,
            event_type="goal_created",
            event_category="goals",
            title=title
        ))

    def log_telegram_message(self, user_id: str, text: str, msg_type: str = "text") -> EventModel:
        return self.log_event(EventCreate(
            user_id=user_id,
            event_type="telegram_message_received",
            event_category="telegram",
            title="Telegram message",
            context={"message_type": msg_type},
            metadata={"preview": text[:100]}
        ))

    def get_recent_events(self, user_id: str, days: int = 30) -> List[EventModel]:
        cutoff = datetime.utcnow() - timedelta(days=days)
        return self.db.query(EventModel).filter(
            EventModel.user_id == user_id,
            EventModel.created_at >= cutoff
        ).order_by(EventModel.created_at.desc()).all()
