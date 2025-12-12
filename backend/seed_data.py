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
        latitude=39.05096,
        longitude=-94.57221,
        image="https://placehold.co/150x150/e2e8f0/64748b?text=☕",
        accessibility=True,
        has_wifi=True,
        machine="La Marzocco",
        description="Rustic-chic, brick-lined coffeehouse with its own line of beans, plus espresso drinks & light bites.",
        weekly_hours={
            "monday": {"open": "7am", "close": "5pm"},
            "tuesday": {"open": "7am", "close": "5pm"},
            "wednesday": {"open": "7am", "close": "5pm"},
            "thursday": {"open": "7am", "close": "5pm"},
            "friday": {"open": "7am", "close": "5pm"},
            "saturday": {"open": "8am", "close": "3pm"},
            "sunday": {"open": "8am", "close": "3pm"},
        },
        pour_over=True,
        website="https://oddlycorrect.com",
        instagram="https://www.instagram.com/oddlycorrect/",
    ),
    CoffeeShop(
        name="Messenger Coffee",
        address="1624 Grand Blvd, Kansas City, MO 64108",
        latitude=39.09349,
        longitude=-94.58124,
        image="https://placehold.co/150x150/e2e8f0/64748b?text=☕",
        accessibility=True,
        has_wifi=True,
        machine="La Marzocco",
        description="Tri-level cafe, roasting facility, and bakery offering baked goods and coffee, plus a roof deck.",
        weekly_hours={
            "monday": {"open": "7am", "close": "5pm"},
            "tuesday": {"open": "7am", "close": "5pm"},
            "wednesday": {"open": "7am", "close": "5pm"},
            "thursday": {"open": "7am", "close": "5pm"},
            "friday": {"open": "7am", "close": "5pm"},
            "saturday": {"open": "7am", "close": "5pm"},
            "sunday": {"open": "7am", "close": "5pm"},
        },
        pour_over=True,
        website="https://messengercoffee.com",
        instagram="https://www.instagram.com/messengercoffee/",
    ),
    CoffeeShop(
        name="Blip Coffee Roasters",
        address="1301 Woodswether Rd, Kansas City, MO 64105",
        latitude=39.10814,
        longitude=-94.59995,
        image="https://placehold.co/150x150/e2e8f0/64748b?text=☕",
        accessibility=True,
        has_wifi=True,
        machine="La Marzocco FB70",
        description="Specialty roaster-café in the West Bottoms; community & motorcycle-culture infused space.",
        weekly_hours={
            "monday": {"open": "7am", "close": "7pm"},
            "tuesday": {"open": "7am", "close": "7pm"},
            "wednesday": {"open": "7am", "close": "7pm"},
            "thursday": {"open": "7am", "close": "7pm"},
            "friday": {"open": "7am", "close": "7pm"},
            "saturday": {"open": "7am", "close": "7pm"},
            "sunday": {"open": "7am", "close": "7pm"},
        },
        pour_over=True,
        website="https://www.bliproasters.com",
        instagram="https://www.instagram.com/bliproasters/",
    ),
    CoffeeShop(
        name="Neighbors",
        address="8135 The Paseo, Kansas City, MO 64131",
        latitude=38.9787151,
        longitude=-94.5668785,
        image="https://placehold.co/150x150/e2e8f0/64748b?text=☕",
        accessibility=True,
        has_wifi=True,
        machine="La Marzocco",
        description="A non-profit coffee company committed to offering affordable coffee & employing those aging out of foster care",
        weekly_hours={
            "monday": {"open": "8am", "close": "3pm"},
            "tuesday": {"open": "8am", "close": "3pm"},
            "wednesday": {"open": "8am", "close": "3pm"},
            "thursday": {"open": "8am", "close": "3pm"},
            "friday": {"open": "8am", "close": "3pm"},
            "saturday": {"open": "8am", "close": "3pm"},
            "sunday": {"open": "8am", "close": "3pm"},
        },
        pour_over=True,
        website="https://www.neighborskc.coffee/",
        instagram="@neighborskc",
    ),
    CoffeeShop(
        name="Post Coffee Company",
        address="3550 Broadway Blvd, Kansas City, MO 64111",
        latitude=39.06227,
        longitude=-94.59079,
        image="https://placehold.co/150x150/e2e8f0/64748b?text=☕",
        accessibility=True,
        has_wifi=True,
        machine="La Marzocco",
        description="Community-focused coffeehouse offering a menu of brewed drinks and prepared foods in a cozy setting.",
        weekly_hours={
            "monday": {"open": "7am", "close": "3pm"},
            "tuesday": {"open": "7am", "close": "3pm"},
            "wednesday": {"open": "7am", "close": "3pm"},
            "thursday": {"open": "7am", "close": "3pm"},
            "friday": {"open": "7am", "close": "3pm"},
            "saturday": {"open": "7am", "close": "3pm"},
            "sunday": {"open": "8am", "close": "2pm"},
        },
        pour_over=True,
        website="https://www.postcoffeecompany.com",
        instagram="@postcoffeecompany",
    ),
    CoffeeShop(
        name="Sway Coffee Roasters",
        address="2700 W 43rd Ave, Kansas City, KS 66103",
        latitude=39.050434,
        longitude=-94.616647,
        image="https://placehold.co/150x150/e2e8f0/64748b?text=☕",
        accessibility=True,
        has_wifi=True,
        machine="",
        description="A place where you can enjoy an excellent cup of coffee, get some work done, connect with friends and family, or just escape the busyness of life for a little.",
        weekly_hours={
            "monday": {"open": "6:30am", "close": "1:30pm"},
            "tuesday": {"open": "6:30am", "close": "1:30pm"},
            "wednesday": {"open": "6:30am", "close": "1:30pm"},
            "thursday": {"open": "6:30am", "close": "1:30pm"},
            "friday": {"open": "6:30am", "close": "1:30pm"},
            "saturday": {"open": "6:30am", "close": "1:30pm"},
        },
        pour_over=True,
        website="https://www.swaycoffeeroasters.com",
        instagram=None,
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
