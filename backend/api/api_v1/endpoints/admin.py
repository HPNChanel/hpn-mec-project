from fastapi import APIRouter, Depends, HTTPException, status
from typing import List

from backend.models.user import User, UserRole
from backend.api.api_v1.endpoints.health_records import get_current_active_user

router = APIRouter()

# Dependency for getting admin user
async def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Check if current user is admin
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required"
        )
    return current_user

@router.get("/dashboard")
async def admin_dashboard(current_user: User = Depends(get_current_admin_user)):
    """
    Admin dashboard statistics
    """
    # This is a placeholder - will be implemented with actual dashboard data
    return {
        "user_count": 150,
        "active_users": 120,
        "health_records_count": 450,
        "recent_activities": [
            {"user_id": 1, "activity": "created health record", "timestamp": "2023-05-20T14:30:00Z"},
            {"user_id": 2, "activity": "updated profile", "timestamp": "2023-05-20T15:45:00Z"}
        ]
    }

@router.get("/users")
async def admin_users(current_user: User = Depends(get_current_admin_user)):
    """
    Admin user management
    """
    # This is a placeholder - will be implemented with actual user management data
    return [
        {"id": 1, "username": "user1", "email": "user1@example.com", "is_active": True, "role": "user"},
        {"id": 2, "username": "admin1", "email": "admin1@example.com", "is_active": True, "role": "admin"}
    ]

@router.put("/users/{user_id}/activate")
async def activate_user(user_id: int, current_user: User = Depends(get_current_admin_user)):
    """
    Activate a user
    """
    # This is a placeholder - will be implemented with actual activation logic
    return {"id": user_id, "status": "activated"}

@router.put("/users/{user_id}/deactivate")
async def deactivate_user(user_id: int, current_user: User = Depends(get_current_admin_user)):
    """
    Deactivate a user
    """
    # This is a placeholder - will be implemented with actual deactivation logic
    return {"id": user_id, "status": "deactivated"} 