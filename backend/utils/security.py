"""JWT token creation and validation utilities."""
from datetime import datetime, timedelta
from typing import Any, Optional, Union

from jose import jwt

from backend.core.config import settings

def create_access_token(subject: Union[str, Any], expires_delta: Optional[int] = None) -> str:
    """
    Create a new JWT access token.
    
    Args:
        subject: The subject of the token, typically the user ID
        expires_delta: Optional custom expiration time in minutes
        
    Returns:
        The encoded JWT token string
    """
    if expires_delta:
        expire = datetime.utcnow() + timedelta(minutes=expires_delta)
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    # Create payload with expiry time and subject
    to_encode = {
        "exp": expire,
        "sub": str(subject),
        "iat": datetime.utcnow()  # Issued at claim
    }
    
    # Encode the JWT token with the secret key using HS256 algorithm
    encoded_jwt = jwt.encode(
        to_encode, 
        settings.SECRET_KEY, 
        algorithm="HS256"
    )
    
    return encoded_jwt 