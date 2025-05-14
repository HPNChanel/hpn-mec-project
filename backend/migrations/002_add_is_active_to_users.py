"""
Add 'is_active' column to users table.
This migration adds a boolean field to track user account status.
"""
from sqlalchemy import Column, Boolean, MetaData, Table
from sqlalchemy.sql import text

# Migration metadata
migration_id = "002"
migration_name = "add_is_active_to_users"
description = "Add is_active column to users table"

def upgrade(engine):
    """
    Run the migration: Add is_active column to users table
    
    Args:
        engine: SQLAlchemy engine instance
    """
    with engine.connect() as connection:
        # Check if column already exists to make migration idempotent
        inspector = engine.dialect.get_columns(connection, "users", engine.schema)
        column_names = [column["name"] for column in inspector]
        
        if "is_active" not in column_names:
            connection.execute(text("ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE NOT NULL"))
            print(f"Added 'is_active' column to users table")
        else:
            print(f"Column 'is_active' already exists in users table")
    
    print(f"Applied {migration_id}_{migration_name}: {description}")

def downgrade(engine):
    """
    Rollback the migration: Remove is_active column from users table
    
    Args:
        engine: SQLAlchemy engine instance
    """
    with engine.connect() as connection:
        # Check if column exists before trying to drop it
        inspector = engine.dialect.get_columns(connection, "users", engine.schema)
        column_names = [column["name"] for column in inspector]
        
        if "is_active" in column_names:
            connection.execute(text("ALTER TABLE users DROP COLUMN is_active"))
            print(f"Removed 'is_active' column from users table")
        else:
            print(f"Column 'is_active' does not exist in users table")
    
    print(f"Rolled back {migration_id}_{migration_name}: {description}") 