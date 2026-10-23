from sqlalchemy import Column, String, Text, DateTime, JSON, Index, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class EventModel(Base):
    __tablename__ = "events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(String, nullable=False, index=True)
    event_type = Column(String, nullable=False, index=True)
    event_category = Column(String, nullable=False, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    context = Column(JSON, nullable=True, default={})
    metadata_ = Column("metadata", JSON, nullable=True, default={})
    source = Column(String, nullable=False, default="web")
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)

    __table_args__ = (
        Index("idx_events_user_category", "user_id", "event_category"),
        Index("idx_events_user_created", "user_id", "created_at"),
    )
