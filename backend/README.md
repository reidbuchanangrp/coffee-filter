# Coffee Filter Backend API

A FastAPI backend for managing coffee shop data.

## Setup

1. **Create a virtual environment:**

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application:**

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   The API will be available at `http://localhost:8000`

4. **View API documentation:**
   - Swagger UI: `http://localhost:8000/docs`
   - ReDoc: `http://localhost:8000/redoc`

## Database

By default, the application uses SQLite (`coffee_shops.db`). To use PostgreSQL:

1. Set the `DATABASE_URL` environment variable:

   ```bash
   export DATABASE_URL="postgresql://user:password@localhost/dbname"
   ```

2. Install PostgreSQL driver:
   ```bash
   pip install psycopg2-binary
   ```

## API Endpoints

- `GET /api/v1/coffee-shops` - Get all coffee shops
- `GET /api/v1/coffee-shops/{shop_id}` - Get a specific coffee shop
- `POST /api/v1/coffee-shops` - Create a new coffee shop
- `PUT /api/v1/coffee-shops/{shop_id}` - Update a coffee shop
- `DELETE /api/v1/coffee-shops/{shop_id}` - Delete a coffee shop
- `GET /api/v1/coffee-shops/search/by-location?latitude=39.0&longitude=-94.5&radius=10` - Search coffee shops by location

**Note:** The API uses snake_case field names (e.g., `has_wifi`, `days_open`, `pour_over`) to match the database schema. If your frontend uses camelCase, you can:

1. Add a transformation layer in your frontend API client
2. Use Pydantic field aliases to automatically convert (see `app/schemas/coffee_shop.py`)
3. Add FastAPI middleware to transform responses

## Seeding Data

To seed the database with initial sample data:

```bash
# Make sure you're in the backend directory
# If virtual environment is activated, use 'python', otherwise use 'python3'
python3 seed_data.py
```

This will create the database tables and add sample coffee shops if the database is empty.

Alternatively, you can seed manually using Python code:

```python
from app.core.database import SessionLocal
from app.models.coffee_shop import CoffeeShop

db = SessionLocal()

shops = [
    CoffeeShop(
        name="Oddly Correct",
        address="4141 Troost Ave, Kansas City, MO 64110",
        latitude=39.0544,
        longitude=-94.5723,
        image="https://placehold.co/150x150/e2e8f0/64748b?text=☕",
        accessibility=True,
        has_wifi=True,
        machine="La Marzocco",
        description="Rustic-chic, brick-lined coffeehouse...",
        hours="Mon-Fri 7am-5pm | Sat-Sun 8am-3pm",
        days_open=["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        pour_over=True,
        website="https://oddlycorrect.com",
        instagram="https://www.instagram.com/oddlycorrect/"
    ),
    # Add more shops...
]

for shop in shops:
    db.add(shop)

db.commit()
db.close()
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── v1/
│   │       └── coffee_shops.py    # API endpoints
│   ├── core/
│   │   └── database.py            # Database configuration
│   ├── models/
│   │   └── coffee_shop.py          # SQLAlchemy models
│   ├── schemas/
│   │   └── coffee_shop.py          # Pydantic schemas
│   └── main.py                     # FastAPI application
├── requirements.txt
└── README.md
```
