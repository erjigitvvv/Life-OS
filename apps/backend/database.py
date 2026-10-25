import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from config import settings

DATABASE_URL = settings.DATABASE_URL
connect_args = {}
pool_class = None

if "pytest" in os.environ.get("_", "") or os.getenv("TESTING") == "true":
    DATABASE_URL = "sqlite:///:memory:"
    connect_args = {"check_same_thread": False}
    pool_class = StaticPool

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    poolclass=pool_class
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
