"""
Script to run all migrations in sequence
"""

import os
import importlib
import sys

def run_migrations():
    """
    Run all migration scripts in the migrations directory
    """
    # Get the current directory
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Add parent directory to sys.path so we can import modules
    parent_dir = os.path.dirname(current_dir)
    if parent_dir not in sys.path:
        sys.path.insert(0, parent_dir)
    
    # Get all Python files in the directory except this one and __init__.py
    migration_files = [
        f[:-3] for f in os.listdir(current_dir)
        if f.endswith('.py') and f != 'run_migrations.py' and f != '__init__.py'
    ]
    
    # Sort migration files to ensure they run in the correct order
    migration_files.sort()
    
    print(f"Found {len(migration_files)} migration scripts: {', '.join(migration_files)}")
    
    # Import and run each migration
    for migration_file in migration_files:
        print(f"\nRunning migration: {migration_file}")
        
        try:
            # Import the migration module
            module_name = f"backend.migrations.{migration_file}"
            migration_module = importlib.import_module(module_name)
            
            # Run the migrate function
            if hasattr(migration_module, 'migrate'):
                migration_module.migrate()
                print(f"Successfully completed migration: {migration_file}")
            else:
                print(f"Warning: {migration_file} has no migrate() function, skipping")
        
        except Exception as e:
            print(f"Error running migration {migration_file}: {str(e)}")
            print("Migration process aborted.")
            return False
    
    print("\nAll migrations completed successfully!")
    return True

if __name__ == "__main__":
    run_migrations() 