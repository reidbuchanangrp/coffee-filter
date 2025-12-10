#!/usr/bin/env python3
"""
Migrate data from SQLite to PostgreSQL.

Usage:
    python migrate_to_postgres.py <postgresql_url>
    
Example:
    python migrate_to_postgres.py postgresql://user:password@localhost:5432/coffeefilter
"""

import sys
import sqlite3
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

def migrate(postgres_url: str, sqlite_path: str = "coffee_shops.db"):
    # Connect to SQLite
    sqlite_conn = sqlite3.connect(sqlite_path)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()
    
    # Connect to PostgreSQL
    pg_engine = create_engine(postgres_url)
    
    # Create tables in PostgreSQL
    from app.core.database import Base
    from app.models.coffee_shop import CoffeeShop
    Base.metadata.create_all(bind=pg_engine)
    
    Session = sessionmaker(bind=pg_engine)
    pg_session = Session()
    
    try:
        # Read all coffee shops from SQLite
        sqlite_cursor.execute("SELECT * FROM coffee_shops")
        rows = sqlite_cursor.fetchall()
        
        print(f"Found {len(rows)} coffee shops to migrate")
        
        # Insert into PostgreSQL
        for row in rows:
            shop = CoffeeShop(
                id=row['id'],
                name=row['name'],
                address=row['address'],
                latitude=row['latitude'],
                longitude=row['longitude'],
                image=row['image'],
                accessibility=row['accessibility'],
                has_wifi=bool(row['has_wifi']) if row['has_wifi'] is not None else None,
                description=row['description'],
                machine=row['machine'],
                hours=row['hours'],
                days_open=row['days_open'],
                pour_over=bool(row['pour_over']) if row['pour_over'] is not None else None,
                website=row['website'],
                instagram=row['instagram']
            )
            pg_session.merge(shop)  # merge handles existing records
        
        pg_session.commit()
        
        # Reset the sequence to continue from the max ID
        max_id = max(row['id'] for row in rows) if rows else 0
        pg_session.execute(text(f"SELECT setval('coffee_shops_id_seq', {max_id})"))
        pg_session.commit()
        
        print(f"Successfully migrated {len(rows)} coffee shops to PostgreSQL")
        
    except Exception as e:
        pg_session.rollback()
        print(f"Migration failed: {e}")
        raise
    finally:
        sqlite_conn.close()
        pg_session.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    postgres_url = sys.argv[1]
    sqlite_path = sys.argv[2] if len(sys.argv) > 2 else "coffee_shops.db"
    
    migrate(postgres_url, sqlite_path)

