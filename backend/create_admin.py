#!/usr/bin/env python3
"""
Script to create the admin user for the CoffeeFilter application.
Run this once after setting up the database.

Usage:
    python create_admin.py [username] [password]
    
If no arguments provided, defaults to:
    username: admin
    password: admin123
"""

import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal, engine, Base
from app.models.user import User
from app.core.auth import get_password_hash

def create_admin(username: str = "admin", password: str = "admin123"):
    """Create the admin user if it doesn't exist."""
    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if user already exists
        existing_user = db.query(User).filter(User.username == username).first()
        if existing_user:
            print(f"User '{username}' already exists.")
            if not existing_user.is_admin:
                existing_user.is_admin = True
                db.commit()
                print(f"Updated '{username}' to admin status.")
            return existing_user
        
        # Create admin user
        hashed_password = get_password_hash(password)
        admin_user = User(
            username=username,
            hashed_password=hashed_password,
            is_admin=True
        )
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print(f"✓ Admin user created successfully!")
        print(f"  Username: {username}")
        print(f"  Password: {password}")
        print(f"\n  Please change the password after first login!")
        
        return admin_user
    finally:
        db.close()

if __name__ == "__main__":
    username = sys.argv[1] if len(sys.argv) > 1 else "admin"
    password = sys.argv[2] if len(sys.argv) > 2 else "admin123"
    
    create_admin(username, password)
