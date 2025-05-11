# Database Configuration

This directory contains database configuration and connection setup for the HPN MEC Medical Health System.

## Files

- **database.py**: SQLAlchemy database connection setup
- **session.py**: Session management utilities
- **migrations/**: Alembic migration scripts
- **init_db.py**: Database initialization script

## Configuration

The system uses MySQL as the primary database. Connection parameters should be configured through environment variables for security:

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=username
DB_PASSWORD=password
DB_NAME=hpn_mec_db
```

## Usage

Database session management should be done through the utilities provided in this directory to ensure proper connection handling and resource cleanup. 