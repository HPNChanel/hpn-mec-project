from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from backend.db.database import Base

class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    height = Column(Float, comment="Height in centimeters")
    weight = Column(Float, comment="Weight in kilograms")
    heart_rate = Column(Integer, comment="Heart rate in BPM")
    blood_pressure_systolic = Column(Integer, comment="Systolic blood pressure in mmHg")
    blood_pressure_diastolic = Column(Integer, comment="Diastolic blood pressure in mmHg")
    symptoms = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationship with user
    user = relationship("User", back_populates="health_records")

    def __repr__(self):
        return f"<HealthRecord {self.id} - User: {self.user_id}>" 