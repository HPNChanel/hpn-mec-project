from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.sql import func

from backend.db.database import Base

class MigrationHistory(Base):
    """Model to track applied database migrations"""
    
    __tablename__ = "migration_history"
    
    id = Column(Integer, primary_key=True, index=True)
    version = Column(String(255), nullable=False, unique=True)
    name = Column(String(255), nullable=False)
    applied_at = Column(DateTime, server_default=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<Migration {self.version}: {self.name}>" 