from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"

class UserInfo(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: UserRole

# Token schema for authentication response
class Token(BaseModel):
    access_token: str
    token_type: str
    user: Optional[UserInfo] = None

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": 1,
                    "name": "John Doe",
                    "email": "john.doe@example.com",
                    "role": "user"
                }
            }
        }

# Base User schema with common attributes
class UserBase(BaseModel):
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)

# Schema for user creation with password
class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    role: Optional[UserRole] = UserRole.USER

    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Doe",
                "email": "john.doe@example.com",
                "password": "securepassword123",
                "role": "user"
            }
        }

# Schema for user login
class UserLogin(BaseModel):
    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "john.doe@example.com",
                "password": "securepassword123"
            }
        }

# Schema for user info in responses
class UserResponse(UserBase):
    id: int
    role: UserRole
    created_at: datetime

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "name": "John Doe",
                "email": "john.doe@example.com",
                "role": "user",
                "created_at": "2023-05-20T14:30:00Z"
            }
        }

# Schema for updating user information
class UserUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    
    class Config:
        json_schema_extra = {
            "example": {
                "name": "John Updated",
                "email": "john.updated@example.com"
            }
        } 