# HPN MEC Medical Health Web Application - Backend

A robust FastAPI backend for the HPN MEC medical health platform, providing secure API endpoints, database integration, and authentication.

## Features

- JWT-based authentication system
- Role-based access control (user/admin)
- Complete health records management
- User management for administrators
- Analytics and statistics endpoints
- SQLAlchemy ORM for database operations
- Pydantic schemas for data validation
- Secure password hashing
- Migration scripts for database changes
- Comprehensive error handling

## Installation

```bash
# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the development server
uvicorn backend.main:app --reload
```

## Database Migration

```bash
# Run database migrations
cd backend
python -m migrations.run_migrations
```

## API Documentation

Once the server is running, API documentation is available at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

- `api/`: API routes and endpoints
  - `api_v1/`: API version 1
    - `endpoints/`: Individual API endpoints
- `core/`: Core functionality and configuration
- `db/`: Database connection and session management
- `models/`: SQLAlchemy ORM models
- `schemas/`: Pydantic schemas for request/response validation
- `services/`: Business logic and service layer
- `utils/`: Utility functions
- `migrations/`: Database migration scripts

## Recent Updates

- Updated health record model with separate blood pressure fields
- Added analytics endpoint with real-time database queries
- Implemented export/import functionality for health records
- Added user management endpoints for administrators
- Created database migration scripts
- Improved error handling and authentication 