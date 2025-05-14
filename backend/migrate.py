#!/usr/bin/env python
"""
Migration utility for the HPN MEC project.

Usage:
    python migrate.py [command]

Commands:
    up      - Apply all pending migrations
    down    - Rollback the latest migration
    status  - Show migration status
    help    - Show this help message
"""
import os
import sys
import importlib.util
import argparse
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from sqlalchemy.exc import OperationalError, SQLAlchemyError

# Import project modules
from backend.db.database import engine, Base
from backend.models.migration import MigrationHistory

# Configuration
MIGRATIONS_DIR = os.path.join(os.path.dirname(__file__), "migrations")

def get_migration_files():
    """
    Get all migration files sorted by version number.
    
    Returns:
        list: Sorted list of migration filenames
    """
    migration_files = []
    
    for filename in os.listdir(MIGRATIONS_DIR):
        if filename.endswith('.py') and not filename.startswith('__'):
            migration_files.append(filename)
    
    # Sort migrations by version number (the prefix before underscore)
    migration_files.sort(key=lambda x: x.split('_')[0])
    return migration_files

def get_applied_migrations(session):
    """
    Get all previously applied migrations from the database.
    
    Args:
        session: SQLAlchemy session
    
    Returns:
        list: List of applied migration versions
    """
    try:
        applied_migrations = session.query(MigrationHistory.version).all()
        return [migration[0] for migration in applied_migrations]
    except OperationalError:
        # If migration_history table doesn't exist yet, create it
        Base.metadata.create_all(bind=engine, tables=[MigrationHistory.__table__])
        return []

def load_migration_module(filename):
    """
    Load a migration module from file.
    
    Args:
        filename: Migration filename
    
    Returns:
        module: Loaded Python module
    """
    module_path = os.path.join(MIGRATIONS_DIR, filename)
    module_name = f"migration_{filename[:-3]}"  # Remove .py extension
    
    spec = importlib.util.spec_from_file_location(module_name, module_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    
    return module

def apply_migration(session, module):
    """
    Apply a single migration and record it in the database.
    
    Args:
        session: SQLAlchemy session
        module: Migration module to apply
    """
    try:
        # Apply the migration
        module.upgrade(engine)
        
        # Record the migration in the database
        migration_record = MigrationHistory(
            version=module.migration_id,
            name=module.migration_name,
            applied_at=datetime.now()
        )
        session.add(migration_record)
        session.commit()
        print(f"✅ Migration {module.migration_id}_{module.migration_name} applied successfully")
    except Exception as e:
        session.rollback()
        print(f"❌ Error applying migration {module.migration_id}_{module.migration_name}: {str(e)}")
        raise

def rollback_migration(session, module):
    """
    Rollback a single migration and remove its record from the database.
    
    Args:
        session: SQLAlchemy session
        module: Migration module to rollback
    """
    try:
        # Rollback the migration
        module.downgrade(engine)
        
        # Remove the migration record from the database
        session.query(MigrationHistory).filter_by(version=module.migration_id).delete()
        session.commit()
        print(f"✅ Migration {module.migration_id}_{module.migration_name} rolled back successfully")
    except Exception as e:
        session.rollback()
        print(f"❌ Error rolling back migration {module.migration_id}_{module.migration_name}: {str(e)}")
        raise

def migrate_up(session):
    """
    Apply all pending migrations.
    
    Args:
        session: SQLAlchemy session
    """
    migration_files = get_migration_files()
    applied_migrations = get_applied_migrations(session)
    
    applied_count = 0
    
    for filename in migration_files:
        module = load_migration_module(filename)
        
        if module.migration_id not in applied_migrations:
            print(f"Applying migration: {filename}")
            apply_migration(session, module)
            applied_count += 1
    
    if applied_count == 0:
        print("No pending migrations to apply.")
    else:
        print(f"Applied {applied_count} migration(s).")

def migrate_down(session):
    """
    Rollback the latest migration.
    
    Args:
        session: SQLAlchemy session
    """
    migration_files = get_migration_files()
    applied_migrations = get_applied_migrations(session)
    
    if not applied_migrations:
        print("No migrations to rollback.")
        return
    
    # Find the latest applied migration
    latest_migration = None
    latest_migration_id = None
    
    for filename in reversed(migration_files):
        module = load_migration_module(filename)
        if module.migration_id in applied_migrations:
            latest_migration = module
            latest_migration_id = module.migration_id
            break
    
    if latest_migration:
        print(f"Rolling back migration: {latest_migration_id}_{latest_migration.migration_name}")
        rollback_migration(session, latest_migration)
    else:
        print("No migrations to rollback.")

def show_status(session):
    """
    Show the status of all migrations.
    
    Args:
        session: SQLAlchemy session
    """
    migration_files = get_migration_files()
    
    # Get applied migrations with timestamps
    applied_info = {}
    try:
        migration_records = session.query(MigrationHistory).all()
        for record in migration_records:
            applied_info[record.version] = {
                "name": record.name,
                "applied_at": record.applied_at.strftime("%Y-%m-%d %H:%M:%S")
            }
    except OperationalError:
        # If migration_history table doesn't exist yet
        Base.metadata.create_all(bind=engine, tables=[MigrationHistory.__table__])
        migration_records = []
    
    print("\nMigration Status:")
    print("-" * 80)
    print(f"{'Version':<10} {'Name':<30} {'Status':<15} {'Applied At':<20}")
    print("-" * 80)
    
    for filename in migration_files:
        module = load_migration_module(filename)
        version = module.migration_id
        name = module.migration_name
        
        if version in applied_info:
            status = "APPLIED"
            applied_at = applied_info[version]["applied_at"]
        else:
            status = "PENDING"
            applied_at = "-"
        
        print(f"{version:<10} {name:<30} {status:<15} {applied_at:<20}")
    
    print("-" * 80)
    print(f"Total migrations: {len(migration_files)}")
    print(f"Applied: {len(applied_info)}")
    print(f"Pending: {len(migration_files) - len(applied_info)}")
    print()

def main():
    """Main migration runner function."""
    parser = argparse.ArgumentParser(description="Database migration utility")
    parser.add_argument("command", nargs="?", default="up", 
                      choices=["up", "down", "status", "help"],
                      help="Migration command to execute")
    
    args = parser.parse_args()
    
    if args.command == "help":
        print(__doc__)
        return
    
    # Create a session
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        if args.command == "up":
            migrate_up(session)
        elif args.command == "down":
            migrate_down(session)
        elif args.command == "status":
            show_status(session)
    except Exception as e:
        print(f"Migration error: {str(e)}")
        sys.exit(1)
    finally:
        session.close()

if __name__ == "__main__":
    main() 