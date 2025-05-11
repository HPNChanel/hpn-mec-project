from backend.schemas.user import UserCreate, UserLogin, UserResponse, UserUpdate, UserRole
from backend.schemas.health_record import HealthRecordCreate, HealthRecordResponse, HealthRecordUpdate

# This allows importing all schemas from backend.schemas
__all__ = [
    "UserCreate", 
    "UserLogin", 
    "UserResponse", 
    "UserUpdate", 
    "UserRole",
    "HealthRecordCreate", 
    "HealthRecordResponse", 
    "HealthRecordUpdate"
] 