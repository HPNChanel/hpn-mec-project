from fastapi import APIRouter, Depends, HTTPException, status, Body, Header
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime

from backend.db.session import get_db
from backend.models.user import User, UserRole
from backend.models.health_record import HealthRecord
from backend.schemas.health_record import HealthRecordCreate, HealthRecordResponse, HealthRecordUpdate
from backend.services.auth import get_user_from_token

router = APIRouter()

# Dependency for getting the current user
async def get_current_active_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    """
    Get the current authenticated user from JWT token.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = authorization.split(" ")[1]
    user = get_user_from_token(db, token)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user

# Create a health record
@router.post("/", response_model=HealthRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_health_record(
    record_data: HealthRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new health record for the current user
    """
    # Create a new health record instance
    db_record = HealthRecord(
        user_id=current_user.id,
        height=record_data.height,
        weight=record_data.weight,
        heart_rate=record_data.heart_rate,
        blood_pressure_systolic=record_data.blood_pressure_systolic,
        blood_pressure_diastolic=record_data.blood_pressure_diastolic,
        symptoms=record_data.symptoms
    )
    
    # Add to database
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    
    return db_record

# Get all health records or only user's records
@router.get("/", response_model=List[HealthRecordResponse])
async def read_health_records(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get health records:
    - If admin: all records
    - If user: only their own records
    """
    # Admin can see all records
    if current_user.role == UserRole.ADMIN:
        records = db.query(HealthRecord).offset(skip).limit(limit).all()
    # Regular users can only see their own records
    else:
        records = db.query(HealthRecord).filter(
            HealthRecord.user_id == current_user.id
        ).offset(skip).limit(limit).all()
    
    return records

# Get a single health record by ID
@router.get("/{record_id}", response_model=HealthRecordResponse)
async def read_health_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific health record by ID:
    - If admin: any record
    - If user: only their own records
    """
    # Find the record
    record = db.query(HealthRecord).filter(HealthRecord.id == record_id).first()
    
    # Check if record exists
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health record not found"
        )
    
    # Check access permission: admin can access any record, users only their own
    if current_user.role != UserRole.ADMIN and record.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this record"
        )
    
    return record

# Update a health record
@router.put("/{record_id}", response_model=HealthRecordResponse)
async def update_health_record(
    record_id: int,
    record_data: HealthRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a health record:
    - If admin: any record
    - If user: only their own records
    """
    # Find the record
    record = db.query(HealthRecord).filter(HealthRecord.id == record_id).first()
    
    # Check if record exists
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health record not found"
        )
    
    # Check access permission: admin can update any record, users only their own
    if current_user.role != UserRole.ADMIN and record.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this record"
        )
    
    # Update record fields with non-None values from request
    update_data = record_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        if value is not None:
            setattr(record, field, value)
    
    # Commit changes
    db.commit()
    db.refresh(record)
    
    return record

# Delete a health record
@router.delete("/{record_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_health_record(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a health record:
    - If admin: any record
    - If user: only their own records
    """
    # Find the record
    record = db.query(HealthRecord).filter(HealthRecord.id == record_id).first()
    
    # Check if record exists
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Health record not found"
        )
    
    # Check access permission: admin can delete any record, users only their own
    if current_user.role != UserRole.ADMIN and record.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this record"
        )
    
    # Delete the record
    db.delete(record)
    db.commit()
    
    return None

# Export health records
@router.get("/export", response_model=List[HealthRecordResponse])
async def export_health_records(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Export all health records for the current user
    """
    # Get all records for the current user, ordered by date
    records = db.query(HealthRecord)\
        .filter(HealthRecord.user_id == current_user.id)\
        .order_by(HealthRecord.created_at.desc())\
        .all()
    
    return records

# Import health records
@router.post("/import", response_model=Dict[str, Any])
async def import_health_records(
    records_data: List[Dict[str, Any]] = Body(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Import health records for the current user
    """
    imported_count = 0
    errors = []
    
    for record_data in records_data:
        try:
            # Create a new health record instance
            db_record = HealthRecord(
                user_id=current_user.id,
                height=record_data.get("height"),
                weight=record_data.get("weight"),
                heart_rate=record_data.get("heart_rate") or record_data.get("heartRate"),
                blood_pressure_systolic=record_data.get("blood_pressure_systolic") or record_data.get("bloodPressureSystolic"),
                blood_pressure_diastolic=record_data.get("blood_pressure_diastolic") or record_data.get("bloodPressureDiastolic"),
                symptoms=record_data.get("symptoms"),
                created_at=datetime.fromisoformat(record_data.get("created_at", "")) if record_data.get("created_at") else datetime.now()
            )
            
            # Add to database
            db.add(db_record)
            db.commit()
            imported_count += 1
            
        except Exception as e:
            errors.append(f"Error importing record: {str(e)}")
            db.rollback()
    
    return {
        "status": "success" if not errors else "partial",
        "imported_count": imported_count,
        "errors": errors
    } 