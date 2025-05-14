#!/usr/bin/env python
"""
Runner script for database migrations.
This script is meant to be run from the project root.

Usage:
    python run_migrate.py [command]
"""
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import migration script
from backend.migrate import main

if __name__ == "__main__":
    main() 