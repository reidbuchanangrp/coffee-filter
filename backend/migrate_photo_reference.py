#!/usr/bin/env python3
"""
Migration script to add photo_reference column and extract photo references from existing Google Places image URLs.

This script:
1. Adds the photo_reference column to the coffee_shops table (if it doesn't exist)
2. Extracts the photo_reference from existing Google Places image URLs
3. Updates each shop with the extracted photo_reference

Run this after deploying the updated code to migrate existing data.
"""

import os
import re
from urllib.parse import urlparse, parse_qs
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Database URL from environment or default to local SQLite
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./coffee_shops.db")

# Handle Railway's postgres:// vs postgresql://
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)


def extract_photo_reference(image_url: str) -> str | None:
    """
    Extract the photo_reference from a Google Places photo URL.
    
    Example URL:
    https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=ABC123&key=...
    """
    if not image_url:
        return None
    
    # Check if it's a Google Places photo URL
    if "maps.googleapis.com/maps/api/place/photo" not in image_url:
        return None
    
    try:
        parsed = urlparse(image_url)
        params = parse_qs(parsed.query)
        photo_refs = params.get("photo_reference", [])
        if photo_refs:
            return photo_refs[0]
    except Exception as e:
        print(f"  Error parsing URL: {e}")
    
    return None


def main():
    print("=" * 60)
    print("☕ Photo Reference Migration")
    print("=" * 60)
    
    print(f"\n📦 Connecting to database...")
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Step 1: Check if column exists, add if not
        print("\n📋 Checking for photo_reference column...")
        
        # Check column existence (works for both SQLite and PostgreSQL)
        if "sqlite" in DATABASE_URL:
            result = session.execute(text("PRAGMA table_info(coffee_shops)"))
            columns = [row[1] for row in result.fetchall()]
        else:
            result = session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'coffee_shops' AND column_name = 'photo_reference'
            """))
            columns = [row[0] for row in result.fetchall()]
        
        if "photo_reference" not in columns:
            print("   Adding photo_reference column...")
            session.execute(text("ALTER TABLE coffee_shops ADD COLUMN photo_reference VARCHAR"))
            session.commit()
            print("   ✅ Column added")
        else:
            print("   ✅ Column already exists")
        
        # Step 2: Get all shops
        print("\n🔍 Fetching coffee shops...")
        result = session.execute(text("SELECT id, name, image, photo_reference FROM coffee_shops"))
        shops = result.fetchall()
        print(f"   Found {len(shops)} shops")
        
        # Step 3: Extract and update photo references
        print("\n🔄 Extracting photo references from image URLs...")
        updated = 0
        skipped = 0
        already_set = 0
        
        for shop in shops:
            shop_id, name, image_url, existing_ref = shop
            
            # Skip if already has a photo_reference
            if existing_ref:
                already_set += 1
                continue
            
            # Try to extract photo_reference from image URL
            photo_ref = extract_photo_reference(image_url or "")
            
            if photo_ref:
                session.execute(
                    text("UPDATE coffee_shops SET photo_reference = :ref WHERE id = :id"),
                    {"ref": photo_ref, "id": shop_id}
                )
                updated += 1
                print(f"   ✅ {name}: extracted photo_reference")
            else:
                skipped += 1
                if image_url and "placehold" not in image_url:
                    print(f"   ⏭️ {name}: no Google Places URL found")
        
        session.commit()
        
        # Summary
        print("\n" + "=" * 60)
        print("📊 SUMMARY")
        print("=" * 60)
        print(f"   Total shops: {len(shops)}")
        print(f"   Already had photo_reference: {already_set}")
        print(f"   Updated with extracted reference: {updated}")
        print(f"   Skipped (no Google Places URL): {skipped}")
        print("=" * 60)
        
        print("\n✅ Migration complete!")
        print("\nNote: Shops with extracted photo_references will now use the")
        print("backend proxy to generate fresh Google Places photo URLs.")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
