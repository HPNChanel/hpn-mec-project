from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional

from backend.models.user import User
from backend.schemas.user import UserCreate

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain password against a hashed password
    """
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """
    Generate a hashed password from a plain password
    """
    return pwd_context.hash(password)

def create_user(db: Session, user_data: UserCreate) -> User:
    """
    Create a new user with hashed password
    """
    # Create a new user model instance
    db_user = User(
        email=user_data.email,
        name=user_data.name,
        password_hash=get_password_hash(user_data.password),
        role=user_data.role
    )
    
    # Add to database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user by email and password
    """
    # Find the user by email
    user = db.query(User).filter(User.email == email).first()
    
    # Return None if user not found or password doesn't match
    if not user or not verify_password(password, user.password_hash):
        return None
    
    return user

def get_current_user(db: Session, user_id: int) -> Optional[User]:
    """
    Get user by ID
    """
    # In a real app with JWT, this would validate the token
    # and extract the user_id from it
    return db.query(User).filter(User.id == user_id).first()

# These functions would be expanded for JWT token handling in the future
# For example:
# - create_access_token(data: dict, expires_delta: Optional[timedelta] = None)
# - decode_access_token(token: str) -> dict 