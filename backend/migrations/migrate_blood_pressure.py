"""
Migration script to update health_records table:
- Remove blood_pressure field
- Add blood_pressure_systolic and blood_pressure_diastolic fields
"""

from sqlalchemy import create_engine, text
from backend.core.config import settings

def migrate():
    """
    Execute the migration to update the health_records table schema
    """
    # Create a database engine
    engine = create_engine(settings.DATABASE_URI)
    conn = engine.connect()

    try:
        # Begin a transaction
        transaction = conn.begin()

        print("Starting blood pressure field migration...")

        # 1. First create a backup table
        print("Creating backup table...")
        conn.execute(text(
            """
            CREATE TABLE health_records_backup AS 
            SELECT * FROM health_records;
            """
        ))

        # 2. Add new columns for systolic and diastolic blood pressure
        print("Adding new blood pressure columns...")
        conn.execute(text(
            """
            ALTER TABLE health_records 
            ADD COLUMN blood_pressure_systolic INTEGER,
            ADD COLUMN blood_pressure_diastolic INTEGER;
            """
        ))

        # 3. Parse the blood_pressure column to extract systolic and diastolic values
        print("Migrating existing blood pressure data...")
        conn.execute(text(
            """
            UPDATE health_records
            SET 
                blood_pressure_systolic = CAST(SUBSTRING_INDEX(blood_pressure, '/', 1) AS UNSIGNED),
                blood_pressure_diastolic = CAST(SUBSTRING_INDEX(blood_pressure, '/', -1) AS UNSIGNED)
            WHERE blood_pressure IS NOT NULL AND blood_pressure != '';
            """
        ))

        # 4. Drop the old blood_pressure column
        print("Removing old blood_pressure column...")
        conn.execute(text(
            """
            ALTER TABLE health_records 
            DROP COLUMN blood_pressure;
            """
        ))

        # 5. Add not null constraints if needed
        print("Adding constraints to new columns...")
        conn.execute(text(
            """
            ALTER TABLE health_records 
            MODIFY COLUMN blood_pressure_systolic INTEGER NOT NULL,
            MODIFY COLUMN blood_pressure_diastolic INTEGER NOT NULL;
            """
        ))

        # Commit the transaction
        transaction.commit()
        print("Migration completed successfully!")

    except Exception as e:
        # If there's an error, roll back the transaction
        if 'transaction' in locals():
            transaction.rollback()
        print(f"Error during migration: {str(e)}")
        raise
    finally:
        # Close the connection
        conn.close()

if __name__ == "__main__":
    migrate() 