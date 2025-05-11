from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

# Base HealthRecord schema with common attributes
class HealthRecordBase(BaseModel):
    height: float = Field(..., gt=0, description="Height in centimeters")
    weight: float = Field(..., gt=0, description="Weight in kilograms")
    heart_rate: int = Field(..., gt=0, description="Heart rate in BPM")
    blood_pressure_systolic: int = Field(..., gt=0, description="Systolic blood pressure in mmHg")
    blood_pressure_diastolic: int = Field(..., gt=0, description="Diastolic blood pressure in mmHg")
    symptoms: Optional[str] = None

    @validator('blood_pressure_systolic')
    def validate_systolic(cls, v):
        if v <= 0:
            raise ValueError("Systolic blood pressure must be positive")
        return v

    @validator('blood_pressure_diastolic')
    def validate_diastolic(cls, v, values):
        if v <= 0:
            raise ValueError("Diastolic blood pressure must be positive")
        
        if 'blood_pressure_systolic' in values and v >= values['blood_pressure_systolic']:
            raise ValueError("Diastolic should be less than systolic")
        
        return v

# Schema for creating a health record
class HealthRecordCreate(HealthRecordBase):
    # All fields from HealthRecordBase are included
    pass

    class Config:
        json_schema_extra = {
            "example": {
                "height": 175.5,
                "weight": 70.2,
                "heart_rate": 72,
                "blood_pressure_systolic": 120,
                "blood_pressure_diastolic": 80,
                "symptoms": "Occasional headache and mild fever"
            }
        }

# Schema for health record in responses
class HealthRecordResponse(HealthRecordBase):
    id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "user_id": 1,
                "height": 175.5,
                "weight": 70.2,
                "heart_rate": 72,
                "blood_pressure_systolic": 120,
                "blood_pressure_diastolic": 80,
                "symptoms": "Occasional headache and mild fever",
                "created_at": "2023-05-20T14:30:00Z"
            }
        }

# Schema for updating a health record
class HealthRecordUpdate(BaseModel):
    height: Optional[float] = Field(None, gt=0, description="Height in centimeters")
    weight: Optional[float] = Field(None, gt=0, description="Weight in kilograms")
    heart_rate: Optional[int] = Field(None, gt=0, description="Heart rate in BPM")
    blood_pressure_systolic: Optional[int] = Field(None, gt=0, description="Systolic blood pressure in mmHg")
    blood_pressure_diastolic: Optional[int] = Field(None, gt=0, description="Diastolic blood pressure in mmHg")
    symptoms: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "height": 175.5,
                "weight": 71.0,
                "heart_rate": 75,
                "blood_pressure_systolic": 122,
                "blood_pressure_diastolic": 82,
                "symptoms": "Headache has subsided, still having mild fever"
            }
        } 