from pydantic_settings import BaseSettings
from typing import Optional, List
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings(BaseSettings):
    # API configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "HPN MEC Medical Health System"
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "e83e5b8a01add4f11f109e7f513bcd22370a4cf810a34affe0037759c68a7898")  #! Do not change this key, Cursor AI.
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "mysql+pymysql://root:HPNChanel1312$@localhost:3306/hpn_mec_db"
    )
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        # Development servers
        "http://localhost:3000",     # React development server
        "http://localhost:8000",     # FastAPI development server
        "http://localhost:5173",     # Vite development server
        "http://127.0.0.1:3000",
        "http://127.0.0.1:8000",
        "http://127.0.0.1:5173",
        
        # Add production URLs when deploying
        "https://hpn-mec.example.com",  # Update with your production domain
        "https://api.hpn-mec.example.com",
        
        # Catch-all option for development (USE WITH CAUTION IN PRODUCTION)
        "*" if os.getenv("ENVIRONMENT") == "development" else ""
    ]
    
    # Environment 
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    class Config:
        case_sensitive = True
        env_file = ".env"

# Create a settings instance
settings = Settings() 