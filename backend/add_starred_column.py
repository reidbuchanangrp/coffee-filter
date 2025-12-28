#!/usr/bin/env python3
"""Add starred column to coffee_shops table."""

from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql://postgres:KQEiuQeaNMPRWzqcIJKkFMdVaXwoRSXE@gondola.proxy.rlwy.net:30279/railway"

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    # Check if column exists
    result = conn.execute(text("""
        SELECT column_name FROM information_schema.columns 
        WHERE table_name = 'coffee_shops' AND column_name = 'starred'
    """))
    
    if result.fetchone():
        print('✅ Column "starred" already exists!')
    else:
        conn.execute(text('ALTER TABLE coffee_shops ADD COLUMN starred BOOLEAN DEFAULT FALSE'))
        conn.commit()
        print('✅ Successfully added "starred" column!')

