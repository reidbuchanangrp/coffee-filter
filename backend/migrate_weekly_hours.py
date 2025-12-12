"""
Migration script to convert hours + days_open to weekly_hours format.

Run with: python3 migrate_weekly_hours.py

This script:
1. Adds the weekly_hours column if it doesn't exist
2. Migrates existing data from hours/days_open to weekly_hours
3. Drops the old hours and days_open columns
"""
import os
import re
from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import sessionmaker

# Database URL - same as in database.py
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./coffee_shops.db")

if DATABASE_URL.startswith("sqlite"):
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
else:
    engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def parse_legacy_hours(hours_str: str) -> dict:
    """
    Parse legacy hours string like "7am - 5pm" or "7:00 AM - 5:00 PM" 
    into {open, close} format.
    """
    if not hours_str:
        return {"open": "7am", "close": "5pm"}
    
    # Try to extract time range pattern
    # Matches patterns like "7am - 5pm", "7:00am-5:00pm", "7 AM - 5 PM"
    pattern = r'(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)\s*[-–]\s*(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)'
    match = re.search(pattern, hours_str)
    
    if match:
        open_time = match.group(1).lower().replace(" ", "").replace(":00", "")
        close_time = match.group(2).lower().replace(" ", "").replace(":00", "")
        return {"open": open_time, "close": close_time}
    
    # Default fallback
    return {"open": "7am", "close": "5pm"}


def convert_to_weekly_hours(hours_str: str, days_open: list) -> dict:
    """
    Convert legacy hours string and days_open array to weekly_hours format.
    """
    parsed = parse_legacy_hours(hours_str)
    weekly_hours = {}
    
    # Map full day names to lowercase keys
    day_mapping = {
        "Monday": "monday",
        "Tuesday": "tuesday", 
        "Wednesday": "wednesday",
        "Thursday": "thursday",
        "Friday": "friday",
        "Saturday": "saturday",
        "Sunday": "sunday",
    }
    
    if days_open:
        for day in days_open:
            # Handle cases like "Wednesday - Closed 1st Wednesday of the month"
            # Extract just the day name
            for full_name, key in day_mapping.items():
                if day.startswith(full_name):
                    weekly_hours[key] = parsed.copy()
                    break
    else:
        # If no days specified, default to weekdays
        for day in ["monday", "tuesday", "wednesday", "thursday", "friday"]:
            weekly_hours[day] = parsed.copy()
    
    return weekly_hours


def migrate():
    """Run the migration."""
    db = SessionLocal()
    inspector = inspect(engine)
    is_sqlite = DATABASE_URL.startswith("sqlite")
    
    try:
        # Check current columns
        columns = [col["name"] for col in inspector.get_columns("coffee_shops")]
        print(f"Current columns: {columns}")
        
        # Check if migration is needed
        has_weekly_hours = "weekly_hours" in columns
        has_hours = "hours" in columns
        has_days_open = "days_open" in columns
        
        if has_weekly_hours and not has_hours and not has_days_open:
            print("Migration already completed!")
            return
        
        # Step 1: Add weekly_hours column if it doesn't exist
        if not has_weekly_hours:
            print("Adding weekly_hours column...")
            if is_sqlite:
                db.execute(text("ALTER TABLE coffee_shops ADD COLUMN weekly_hours JSON"))
            else:
                db.execute(text("ALTER TABLE coffee_shops ADD COLUMN weekly_hours JSONB"))
            db.commit()
            print("✓ Added weekly_hours column")
        
        # Step 2: Migrate data
        if has_hours or has_days_open:
            print("Migrating data from hours/days_open to weekly_hours...")
            
            # Fetch all shops with old format
            if has_hours and has_days_open:
                result = db.execute(text("SELECT id, hours, days_open FROM coffee_shops"))
            elif has_hours:
                result = db.execute(text("SELECT id, hours, NULL as days_open FROM coffee_shops"))
            else:
                result = db.execute(text("SELECT id, NULL as hours, days_open FROM coffee_shops"))
            
            rows = result.fetchall()
            
            import json
            for row in rows:
                shop_id = row[0]
                hours = row[1] or ""
                days_open_raw = row[2]
                
                # Parse days_open - could be JSON string or already parsed
                if days_open_raw:
                    if isinstance(days_open_raw, str):
                        try:
                            days_open = json.loads(days_open_raw)
                        except:
                            days_open = []
                    else:
                        days_open = days_open_raw
                else:
                    days_open = []
                
                # Convert to new format
                weekly_hours = convert_to_weekly_hours(hours, days_open)
                weekly_hours_json = json.dumps(weekly_hours)
                
                # Update the row
                db.execute(
                    text("UPDATE coffee_shops SET weekly_hours = :weekly_hours WHERE id = :id"),
                    {"weekly_hours": weekly_hours_json, "id": shop_id}
                )
                print(f"  Migrated shop {shop_id}: {weekly_hours}")
            
            db.commit()
            print(f"✓ Migrated {len(rows)} shops")
        
        # Step 3: Drop old columns (SQLite doesn't support DROP COLUMN directly in older versions)
        if is_sqlite:
            print("\n⚠️  SQLite doesn't easily support dropping columns.")
            print("   The old 'hours' and 'days_open' columns will remain but are unused.")
            print("   For a clean schema, you can:")
            print("   1. Export your data")
            print("   2. Delete coffee_shops.db")
            print("   3. Run seed_data.py (update it first to use weekly_hours)")
        else:
            # PostgreSQL - drop old columns
            if has_hours:
                print("Dropping old 'hours' column...")
                db.execute(text("ALTER TABLE coffee_shops DROP COLUMN hours"))
                db.commit()
                print("✓ Dropped hours column")
            
            if has_days_open:
                print("Dropping old 'days_open' column...")
                db.execute(text("ALTER TABLE coffee_shops DROP COLUMN days_open"))
                db.commit()
                print("✓ Dropped days_open column")
        
        print("\n✅ Migration completed successfully!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 50)
    print("Weekly Hours Migration")
    print("=" * 50)
    print(f"Database: {DATABASE_URL}")
    print()
    migrate()
