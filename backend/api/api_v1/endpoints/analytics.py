from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy import func, extract, cast, Integer
from sqlalchemy.orm import Session

from backend.api.api_v1.endpoints.health_records import get_current_active_user
from backend.models.user import User, UserRole
from backend.models.health_record import HealthRecord
from backend.db.session import get_db

router = APIRouter()

# Dependency for getting admin user
async def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """
    Check if current user is admin
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privileges required for analytics"
        )
    return current_user

@router.get("/summary")
async def get_analytics_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Get analytics summary data
    Only accessible to admin users
    """
    # Get current date for date calculations
    current_date = datetime.now()
    
    # Query for records per month (last 6 months)
    records_per_month_query = []
    for i in range(6):
        month_date = current_date - timedelta(days=30 * i)
        month_num = month_date.month
        year = month_date.year
        
        # Count records for this month
        count = db.query(func.count(HealthRecord.id))\
            .filter(
                extract('month', HealthRecord.created_at) == month_num,
                extract('year', HealthRecord.created_at) == year
            ).scalar() or 0
        
        # Format month name
        month_name = month_date.strftime("%b %Y")
        
        records_per_month_query.append({
            "month": month_name,
            "count": count
        })
    
    # Query for user registrations per month (last 6 months)
    registrations_per_month_query = []
    for i in range(6):
        month_date = current_date - timedelta(days=30 * i)
        month_num = month_date.month
        year = month_date.year
        
        # Count users registered in this month
        count = db.query(func.count(User.id))\
            .filter(
                extract('month', User.created_at) == month_num,
                extract('year', User.created_at) == year
            ).scalar() or 0
        
        # Format month name
        month_name = month_date.strftime("%b %Y")
        
        registrations_per_month_query.append({
            "month": month_name,
            "count": count
        })
    
    # Query for risk distribution based on health metrics
    # Count normal records
    normal_count = db.query(func.count(HealthRecord.id))\
        .filter(
            HealthRecord.heart_rate.between(60, 100),
            HealthRecord.blood_pressure_systolic.between(90, 139),
            HealthRecord.blood_pressure_diastolic.between(60, 89),
            (cast(HealthRecord.weight / func.power(HealthRecord.height / 100, 2), Integer)).between(18, 24)
        ).scalar() or 0
    
    # Count mild risk records
    mild_count = db.query(func.count(HealthRecord.id))\
        .filter(
            (HealthRecord.heart_rate.between(50, 59) | HealthRecord.heart_rate.between(101, 110)) |
            (HealthRecord.blood_pressure_systolic.between(140, 159) | HealthRecord.blood_pressure_diastolic.between(90, 99)) |
            (cast(HealthRecord.weight / func.power(HealthRecord.height / 100, 2), Integer)).between(25, 29)
        ).scalar() or 0
    
    # Count moderate risk records
    moderate_count = db.query(func.count(HealthRecord.id))\
        .filter(
            (HealthRecord.heart_rate.between(40, 49) | HealthRecord.heart_rate.between(111, 120)) |
            (HealthRecord.blood_pressure_systolic.between(160, 179) | HealthRecord.blood_pressure_diastolic.between(100, 109)) |
            (cast(HealthRecord.weight / func.power(HealthRecord.height / 100, 2), Integer)).between(30, 34)
        ).scalar() or 0
    
    # Count severe risk records
    severe_count = db.query(func.count(HealthRecord.id))\
        .filter(
            (HealthRecord.heart_rate < 40) | (HealthRecord.heart_rate > 120) |
            (HealthRecord.blood_pressure_systolic >= 180) | (HealthRecord.blood_pressure_diastolic >= 110) |
            (cast(HealthRecord.weight / func.power(HealthRecord.height / 100, 2), Integer)) >= 35
        ).scalar() or 0
    
    # Risk distribution data
    risk_distribution = [
        {"name": "Bình thường", "value": normal_count, "color": "#4caf50"},  # Green
        {"name": "Nhẹ", "value": mild_count, "color": "#ff9800"},          # Orange
        {"name": "Trung bình", "value": moderate_count, "color": "#f44336"},   # Red
        {"name": "Nghiêm trọng", "value": severe_count, "color": "#9c27b0"}   # Purple
    ]
    
    # Return all analytics data
    return {
        "recordsPerMonth": list(reversed(records_per_month_query)),
        "registrationsPerMonth": list(reversed(registrations_per_month_query)),
        "riskDistribution": risk_distribution
    } 