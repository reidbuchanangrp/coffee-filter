"""
Script to seed the database with initial coffee shop data.
Run with: python3 seed_data.py
(Or: python seed_data.py if virtual environment is activated)
"""
from app.core.database import SessionLocal, engine, Base
from app.models.coffee_shop import CoffeeShop

# Create tables
Base.metadata.create_all(bind=engine)

db = SessionLocal()

# Sample coffee shop data
shops = [
    CoffeeShop(
        name="Oddly Correct",
        address="4141 Troost Ave, Kansas City, MO 64110",
        latitude=39.0544,
        longitude=-94.5723,
        image="https://via.placeholder.com/150",
        accessibility=True,
        has_wifi=True,
        machine="La Marzocco",
        description="Rustic-chic, brick-lined coffeehouse with its own line of beans, plus espresso drinks & light bites.",
        hours="Mon-Fri 7am-5pm | Sat-Sun 8am-3pm",
        days_open=[
            "Monday",
            "Tuesday",
            "Wednesday - Closed 1st Wednesday of the month",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ],
        pour_over=True,
        website="https://oddlycorrect.com",
        instagram="https://www.instagram.com/oddlycorrect/",
    ),
    CoffeeShop(
        name="Messenger Coffee",
        address="1624 Grand Blvd, Kansas City, MO 64108",
        latitude=39.0918,
        longitude=-94.5826,
        image="https://via.placeholder.com/150",
        accessibility=True,
        has_wifi=True,
        machine="La Marzocco",
        description="Tri-level cafe, roasting facility, and bakery offering baked goods and coffee, plus a roof deck.",
        hours="Mon-Sun 7am-5pm",
        days_open=[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
        ],
        pour_over=True,
        website="https://messengercoffee.com",
        instagram="https://www.instagram.com/messengercoffee/",
    ),
]

try:
    # Check if data already exists
    existing_count = db.query(CoffeeShop).count()
    if existing_count > 0:
        print(f"Database already contains {existing_count} coffee shops. Skipping seed.")
    else:
        for shop in shops:
            db.add(shop)
        db.commit()
        print(f"Successfully seeded {len(shops)} coffee shops!")
except Exception as e:
    print(f"Error seeding database: {e}")
    db.rollback()
finally:
    db.close()

