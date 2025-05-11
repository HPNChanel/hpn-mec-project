from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from backend.db.session import get_db
from backend.models.user import User, UserRole
from backend.schemas.user import UserCreate, UserResponse, UserLogin, Token
from backend.services.auth import create_user, authenticate_user, get_current_user
from backend.utils.security import create_access_token

router = APIRouter()

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user with default role='user'
    """
    # Check if the email already exists
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Ensure the role is 'user' unless explicitly specified
    if not user_data.role:
        user_data.role = UserRole.USER
    
    # Create the user
    user = create_user(db, user_data)
    return user

@router.post("/login", response_model=Token)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Authenticate a user and return a JWT token.
    Supports OAuth2PasswordRequestForm (for Swagger UI).
    """
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate JWT token
    access_token = create_access_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.post("/login-json", response_model=Token)
async def login_json(
    form_data: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Alternative login endpoint that accepts JSON instead of form data
    """
    user = authenticate_user(db, form_data.email, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Generate JWT token
    access_token = create_access_token(subject=user.id)
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
async def read_users_me(request: Request, db: Session = Depends(get_db)):
    """
    Get current user information based on token/session
    """
    # In a real implementation, you would get the user from token or session
    # For now, we'll use a placeholder implementation that returns a fake user
    # Future: Replace with actual JWT token validation
    
    # This is a placeholder - in a real app, you would extract a user ID from
    # the session or decoded JWT token and fetch the actual user
    current_user = get_current_user(db, user_id=1)
    
    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return current_user

@router.post("/refresh-token")
async def refresh_token():
    """
    Refresh access token
    """
    # This is a placeholder - will be implemented with token refresh logic
    return {"access_token": "new_placeholder_token", "token_type": "bearer"} 