"""
Script to update a coffee shop in the database.
Usage: python update_shop.py <shop_id>
"""
import sys
from app.core.database import SessionLocal
from app.models.coffee_shop import CoffeeShop

def update_coffee_shop(shop_id: int, updates: dict):
    """Update a coffee shop with the provided data"""
    db = SessionLocal()
    try:
        shop = db.query(CoffeeShop).filter(CoffeeShop.id == shop_id).first()
        if not shop:
            print(f"Coffee shop with ID {shop_id} not found")
            return
        
        # Update fields
        for key, value in updates.items():
            if hasattr(shop, key):
                setattr(shop, key, value)
                print(f"Updated {key} to {value}")
        
        db.commit()
        print(f"Successfully updated coffee shop {shop_id}")
    except Exception as e:
        print(f"Error updating coffee shop: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python update_shop.py <shop_id>")
        print("\nExample:")
        print('  python update_shop.py 1 --name "New Name" --hours "9am-5pm"')
        sys.exit(1)
    
    shop_id = int(sys.argv[1])
    
    # Parse command-line arguments for updates
    updates = {}
    i = 2
    while i < len(sys.argv):
        if sys.argv[i].startswith("--"):
            key = sys.argv[i][2:]  # Remove "--"
            if i + 1 < len(sys.argv) and not sys.argv[i + 1].startswith("--"):
                value = sys.argv[i + 1]
                # Convert boolean strings
                if value.lower() == "true":
                    value = True
                elif value.lower() == "false":
                    value = False
                # Convert numeric strings
                elif key in ["latitude", "longitude"]:
                    value = float(value)
                updates[key] = value
                i += 2
            else:
                updates[key] = True  # Boolean flag
                i += 1
        else:
            i += 1
    
    if not updates:
        print("No updates provided. Use --key value format.")
        print("\nExample updates:")
        print('  --name "Updated Name"')
        print("  --has_wifi true")
        print("  --hours 'Mon-Fri 8am-6pm'")
        sys.exit(1)
    
    update_coffee_shop(shop_id, updates)

