from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import List, Optional
from sqlalchemy.orm import Session

from backend.db.session import get_db
from backend.models.user import User, UserRole
from backend.models.health_record import HealthRecord
from backend.schemas.health_record import HealthRecordResponse
from backend.schemas.user import UserResponse
from backend.api.api_v1.endpoints.health_records import get_current_active_user
from backend.services.auth import get_user_from_token

router = APIRouter()

# Dependency for getting the current admin user
async def get_current_admin_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """
    Get the current authenticated admin user
    """
    # First get the authenticated user
    current_user = await get_current_active_user(authorization, db)
    
    # Then check if they have admin role
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this endpoint"
        )
    
    return current_user

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
    current_user: User = Depends(get_current_active_user)
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