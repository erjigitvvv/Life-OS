from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from config import settings
from database import engine, Base, get_db
from models.event import EventModel
from schemas.event import EventCreate, EventResponse
from services.event_service import EventService
from services.analytics_service import AnalyticsService
from services.ai_coach import AICoachService

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="LifeOS Backend API with PostgreSQL, pgvector, and AI Analytics"
)

@app.get("/")
def read_root():
    return {"message": "Welcome to LifeOS AI Backend (FastAPI)"}

@app.post("/api/events", response_model=EventResponse)
def create_event(event_in: EventCreate, db: Session = Depends(get_db)):
    service = EventService(db)
    return service.log_event(event_in)

@app.get("/api/events/{user_id}", response_model=List[EventResponse])
def get_user_events(user_id: str, days: int = 30, db: Session = Depends(get_db)):
    service = EventService(db)
    return service.get_recent_events(user_id, days)

@app.get("/api/analytics/summary/{user_id}")
def get_analytics_summary(user_id: str, db: Session = Depends(get_db)):
    service = EventService(db)
    analytics = AnalyticsService(db)
    events = service.get_recent_events(user_id, 7)

    habits = analytics.calculate_habit_stats(events)
    study_mins = analytics.calculate_study_minutes(events)
    tasks_done = analytics.count_tasks_completed(events)
    suggestions = analytics.get_smart_suggestions(user_id)

    return {
        "user_id": user_id,
        "tasks_completed": tasks_done,
        "habits": habits,
        "study_minutes": study_mins,
        "smart_suggestions": suggestions
    }

@app.post("/api/coach/chat")
def coach_chat(payload: dict, db: Session = Depends(get_db)):
    user_id = payload.get("user_id", "default_user")
    message = payload.get("message", "")
    coach = AICoachService(db)
    reply = coach.generate_coach_response(user_id, message)
    return {"reply": reply}
