# How to Update the Database

## ⚠️ Important

**Never edit the `.db` file directly!** It's a binary SQLite database file that can be corrupted if modified manually.

## Methods to Update the Database

### 1. Through the Frontend (Recommended)

1. Open your app in the browser
2. Click "Add Coffee Shop" button
3. Fill out the form
4. Submit - data is automatically saved to the database

### 2. Using the API Endpoints

#### Create a new coffee shop:

```bash
curl -X POST http://localhost:8000/api/v1/coffee-shops \
  -H "Content-Type: application/json" \
  -d '{
    "name": "New Coffee Shop",
    "address": "123 Main St, Kansas City, MO",
    "latitude": 39.0997,
    "longitude": -94.5786,
    "image": "https://via.placeholder.com/150",
    "accessibility": true,
    "has_wifi": true,
    "description": "A great coffee shop",
    "machine": "La Marzocco",
    "hours": "Mon-Fri 7am-5pm",
    "days_open": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    "pour_over": true,
    "website": "https://example.com",
    "instagram": "https://instagram.com/example"
  }'
```

#### Update an existing coffee shop:

```bash
curl -X PUT http://localhost:8000/api/v1/coffee-shops/1 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "hours": "Mon-Sun 8am-6pm"
  }'
```

#### Delete a coffee shop:

```bash
curl -X DELETE http://localhost:8000/api/v1/coffee-shops/1
```

### 3. Using Python Scripts

#### Update an existing shop (using the update script):

```bash
cd backend
source venv/bin/activate
python update_shop.py 1 --name "Updated Name" --hours "9am-5pm" --has_wifi true
```

#### Create a custom Python script:

```python
from app.core.database import SessionLocal
from app.models.coffee_shop import CoffeeShop

db = SessionLocal()

# Update a shop
shop = db.query(CoffeeShop).filter(CoffeeShop.id == 1).first()
if shop:
    shop.name = "New Name"
    shop.hours = "9am-5pm"
    db.commit()
    print("Updated!")

db.close()
```

### 4. Using SQLite Command Line (Advanced)

**Only use this if you know SQL!**

```bash
cd backend
sqlite3 coffee_shops.db

# View all shops
SELECT * FROM coffee_shops;

# Update a shop
UPDATE coffee_shops SET name = 'New Name' WHERE id = 1;

# Exit
.quit
```

### 5. Using a Database GUI Tool

Recommended tools:

- **DB Browser for SQLite** (https://sqlitebrowser.org/)
- **TablePlus** (Mac/Windows)
- **DBeaver** (Cross-platform)

1. Open the tool
2. Open `backend/coffee_shops.db`
3. Edit data in the GUI
4. Save changes

## Viewing Current Data

### Via API:

```bash
curl http://localhost:8000/api/v1/coffee-shops
```

### Via SQLite:

```bash
cd backend
sqlite3 coffee_shops.db "SELECT * FROM coffee_shops;"
```

### Via Interactive API Docs:

Visit `http://localhost:8000/docs` in your browser for the interactive Swagger UI.
