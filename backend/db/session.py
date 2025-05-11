from typing import Generator
from sqlalchemy.orm import Session

from backend.db.database import SessionLocal

def get_db() -> Generator[Session, None, None]:
    """
    Dependency function to get a database session.
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 