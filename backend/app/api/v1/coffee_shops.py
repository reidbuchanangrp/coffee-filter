from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.geocoding import geocode_address
from app.models.coffee_shop import CoffeeShop
from app.schemas.coffee_shop import CoffeeShop as CoffeeShopSchema, CoffeeShopCreate, CoffeeShopUpdate

router = APIRouter()

@router.get("/coffee-shops", response_model=List[CoffeeShopSchema])
def get_coffee_shops(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get all coffee shops.
    """
    shops = db.query(CoffeeShop).offset(skip).limit(limit).all()
    return shops

@router.get("/coffee-shops/{shop_id}", response_model=CoffeeShopSchema)
def get_coffee_shop(shop_id: int, db: Session = Depends(get_db)):
    """
    Get a specific coffee shop by ID.
    """
    shop = db.query(CoffeeShop).filter(CoffeeShop.id == shop_id).first()
    if shop is None:
        raise HTTPException(status_code=404, detail="Coffee shop not found")
    return shop

@router.post("/coffee-shops", response_model=CoffeeShopSchema, status_code=201)
async def create_coffee_shop(shop: CoffeeShopCreate, db: Session = Depends(get_db)):
    """
    Create a new coffee shop.
    If latitude/longitude are not provided, they will be geocoded from the address.
    """
    # Geocode address if coordinates are not provided
    latitude = shop.latitude
    longitude = shop.longitude
    
    if latitude is None or longitude is None:
        coordinates = await geocode_address(shop.address)
        if coordinates:
            latitude, longitude = coordinates
        else:
            raise HTTPException(
                status_code=400,
                detail=f"Could not geocode address: {shop.address}. Please provide latitude and longitude manually."
            )
    
    db_shop = CoffeeShop(
        name=shop.name,
        address=shop.address,
        latitude=latitude,
        longitude=longitude,
        image=shop.image,
        accessibility=shop.accessibility,
        has_wifi=shop.has_wifi,
        description=shop.description,
        machine=shop.machine,
        hours=shop.hours,
        days_open=shop.days_open,
        pour_over=shop.pour_over,
        website=shop.website,
        instagram=shop.instagram
    )
    db.add(db_shop)
    db.commit()
    db.refresh(db_shop)
    return db_shop

@router.put("/coffee-shops/{shop_id}", response_model=CoffeeShopSchema)
def update_coffee_shop(shop_id: int, shop: CoffeeShopUpdate, db: Session = Depends(get_db)):
    """
    Update a coffee shop.
    """
    db_shop = db.query(CoffeeShop).filter(CoffeeShop.id == shop_id).first()
    if db_shop is None:
        raise HTTPException(status_code=404, detail="Coffee shop not found")
    
    # Update only provided fields
    update_data = shop.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_shop, field, value)
    
    db.commit()
    db.refresh(db_shop)
    return db_shop

@router.delete("/coffee-shops/{shop_id}", status_code=204)
def delete_coffee_shop(shop_id: int, db: Session = Depends(get_db)):
    """
    Delete a coffee shop.
    """
    db_shop = db.query(CoffeeShop).filter(CoffeeShop.id == shop_id).first()
    if db_shop is None:
        raise HTTPException(status_code=404, detail="Coffee shop not found")
    
    db.delete(db_shop)
    db.commit()
    return None

@router.get("/coffee-shops/search/by-location", response_model=List[CoffeeShopSchema])
def search_coffee_shops_by_location(
    latitude: float,
    longitude: float,
    radius: float = 10.0,  # radius in kilometers
    db: Session = Depends(get_db)
):
    """
    Search coffee shops by location within a radius.
    This is a simplified version - for production, consider using PostGIS for accurate distance calculations.
    """
    # Simple bounding box search (approximate)
    # For production, use proper geospatial queries with PostGIS
    shops = db.query(CoffeeShop).all()
    
    # Filter by approximate distance (Haversine formula would be better)
    import math
    filtered_shops = []
    for shop in shops:
        # Simple distance calculation (not accurate for large distances)
        lat_diff = abs(shop.latitude - latitude)
        lon_diff = abs(shop.longitude - longitude)
        distance = math.sqrt(lat_diff**2 + lon_diff**2) * 111  # Rough conversion to km
        if distance <= radius:
            filtered_shops.append(shop)
    
    return filtered_shops

