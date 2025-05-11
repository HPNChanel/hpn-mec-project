from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from backend.core.config import settings

# SQLAlchemy engine with specified connection URL
engine = create_engine(
    settings.DATABASE_URL,
    echo=False,  # Set to False in production
    pool_pre_ping=True,  # Check connection before using it
    pool_recycle=3600,   # Recycle connections every hour
)

# Create SessionLocal class for database sessions
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for SQLAlchemy models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 