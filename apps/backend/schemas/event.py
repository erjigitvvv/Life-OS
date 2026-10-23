from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime
from uuid import UUID

class EventCreate(BaseModel):
    user_id: str
    event_type: str
    event_category: str
    title: str
    description: Optional[str] = None
    context: Optional[Dict[str, Any]] = Field(default_factory=dict)
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)
    source: Optional[str] = "web"

class EventResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: str
    event_type: str
    event_category: str
    title: str
    description: Optional[str] = None
    context: Optional[Dict[str, Any]] = None
    metadata: Optional[Dict[str, Any]] = None
    source: str
    created_at: datetime
