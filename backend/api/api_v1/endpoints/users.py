from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from sqlalchemy.orm import Session

from backend.db.session import get_db
from backend.models.user import User, UserRole
from backend.models.health_record import HealthRecord
from backend.schemas.health_record import HealthRecordResponse
from backend.schemas.user import UserResponse
from backend.services.auth import get_current_user as auth_get_current_user

router = APIRouter()

# Dependency for getting the current user
async def get_current_user(db: Session = Depends(get_db)) -> User:
    """
    Get the current authenticated user
    """
    # Placeholder - in a real app, get the user ID from token
    user_id = 1
    user = auth_get_current_user(db, user_id)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

# Dependency for getting the current admin user
async def get_current_admin_user(db: Session = Depends(get_db)) -> User:
    """
    Get the current authenticated admin user
    """
    user = await get_current_user(db)
    
    if user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this endpoint"
        )
    
    return user

@router.get("/", response_model=List[UserResponse])
async def read_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Retrieve all users - admin only
    """
    users = db.query(User).all()
    return users

@router.get("/me", response_model=UserResponse)
async def read_user_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get current user
    """
    return current_user

@router.get("/{user_id}")
async def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get a specific user by ID - admin only
    """
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user

@router.get("/{user_id}/health-records", response_model=List[HealthRecordResponse])
async def get_user_health_records(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get health records for a specific user - admin only
    """
    # Verify the user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get the user's health records
    records = db.query(HealthRecord)\
        .filter(HealthRecord.user_id == user_id)\
        .order_by(HealthRecord.created_at.desc())\
        .all()
    
    return records

@router.put("/{user_id}")
async def update_user(user_id: int):
    """
    Update a user
    """
    # This is a placeholder - will be implemented with actual update logic
    return {"id": user_id, "username": f"updateduser{user_id}", "email": f"updated{user_id}@example.com"} 