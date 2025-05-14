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

## Database Setup and Migration

The application automatically creates tables on first run. For schema changes, use the migration system:

```bash
# Show migration status
python -m backend.migrate status

# Apply all pending migrations
python -m backend.migrate up

# Rollback the latest migration
python -m backend.migrate down

# Show help
python -m backend.migrate help
```

### Creating New Migrations

1. Create a new file in the `migrations` directory with a numeric prefix (e.g., `003_add_new_table.py`)
2. Follow the structure of existing migration files with `upgrade()` and `downgrade()` functions
3. Run `python -m backend.migrate up` to apply the new migration

Example migration file:
```python
"""
Migration description
"""
from sqlalchemy import text

# Migration metadata
migration_id = "003"  # must be unique and sequential
migration_name = "add_new_column"
description = "Add a new column to existing table"

def upgrade(engine):
    """Apply migration"""
    with engine.connect() as connection:
        connection.execute(text("ALTER TABLE table_name ADD COLUMN new_column VARCHAR(255)"))
    print(f"Applied {migration_id}_{migration_name}: {description}")

def downgrade(engine):
    """Rollback migration"""
    with engine.connect() as connection:
        connection.execute(text("ALTER TABLE table_name DROP COLUMN new_column"))
    print(f"Rolled back {migration_id}_{migration_name}: {description}")
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
- `migrate.py`: Migration runner utility

## Recent Updates

- Updated health record model with separate blood pressure fields
- Added analytics endpoint with real-time database queries
- Implemented export/import functionality for health records
- Added user management endpoints for administrators
- Created lightweight database migration system
- Improved error handling and authentication 