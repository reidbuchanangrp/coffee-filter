import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from typing import List
from app.core.database import get_db
from app.core.geocoding import geocode_address
from app.core.auth import get_current_admin_user
from app.models.coffee_shop import CoffeeShop
from app.models.user import User
from app.schemas.coffee_shop import CoffeeShop as CoffeeShopSchema, CoffeeShopCreate, CoffeeShopUpdate

# Google Places API key for photo proxy
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")

router = APIRouter()


def serialize_weekly_hours(weekly_hours):
    """Convert Pydantic DayHours objects to plain dicts for JSON storage."""
    if weekly_hours is None:
        return {}
    if isinstance(weekly_hours, dict):
        result = {}
        for day, hours in weekly_hours.items():
            if hasattr(hours, 'model_dump'):
                result[day] = hours.model_dump()
            elif hasattr(hours, 'dict'):
                result[day] = hours.dict()
            elif isinstance(hours, dict):
                result[day] = hours
            else:
                result[day] = {"open": str(hours.open), "close": str(hours.close)}
        return result
    return weekly_hours

@router.get("/coffee-shops", response_model=List[CoffeeShopSchema])
def get_coffee_shops(db: Session = Depends(get_db)):
    """
    Get all coffee shops.
    """
    shops = db.query(CoffeeShop).all()
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
async def create_coffee_shop(
    shop: CoffeeShopCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Create a new coffee shop. Requires admin authentication.
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
        photo_reference=shop.photo_reference,
        accessibility=shop.accessibility,
        has_wifi=shop.has_wifi,
        description=shop.description,
        machine=shop.machine,
        weekly_hours=serialize_weekly_hours(shop.weekly_hours),
        pour_over=shop.pour_over,
        website=shop.website,
        instagram=shop.instagram
    )
    db.add(db_shop)
    db.commit()
    db.refresh(db_shop)
    return db_shop

@router.put("/coffee-shops/{shop_id}", response_model=CoffeeShopSchema)
async def update_coffee_shop(
    shop_id: int,
    shop: CoffeeShopUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Update a coffee shop. Requires admin authentication.
    If address is updated without new coordinates, they will be geocoded from the new address.
    """
    db_shop = db.query(CoffeeShop).filter(CoffeeShop.id == shop_id).first()
    if db_shop is None:
        raise HTTPException(status_code=404, detail="Coffee shop not found")
    
    # Update only provided fields
    update_data = shop.model_dump(exclude_unset=True)
    
    # Handle explicit null for photo_reference (to allow clearing it)
    # We need to use model_fields_set to check if it was explicitly provided
    if "photo_reference" in shop.model_fields_set:
        update_data["photo_reference"] = shop.photo_reference
    
    # Serialize weekly_hours if present
    if "weekly_hours" in update_data and update_data["weekly_hours"] is not None:
        update_data["weekly_hours"] = serialize_weekly_hours(update_data["weekly_hours"])
    
    # If address changed but coordinates weren't provided, geocode the new address
    if "address" in update_data and update_data["address"] != db_shop.address:
        if "latitude" not in update_data or "longitude" not in update_data:
            coordinates = await geocode_address(update_data["address"])
            if coordinates:
                update_data["latitude"], update_data["longitude"] = coordinates
            else:
                raise HTTPException(
                    status_code=400,
                    detail=f"Could not geocode address: {update_data['address']}. Please provide latitude and longitude manually."
                )
    
    for field, value in update_data.items():
        setattr(db_shop, field, value)
    
    db.commit()
    db.refresh(db_shop)
    return db_shop

@router.delete("/coffee-shops/{shop_id}", status_code=204)
def delete_coffee_shop(
    shop_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """
    Delete a coffee shop. Requires admin authentication.
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


@router.get("/photos/{photo_reference}")
def get_google_photo(photo_reference: str, maxwidth: int = 400):
    """
    Proxy endpoint for Google Places photos.
    Generates a fresh signed URL from the stored photo_reference.
    This keeps the API key server-side and ensures URLs never expire.
    """
    if not GOOGLE_PLACES_API_KEY:
        raise HTTPException(
            status_code=500, 
            detail="Google Places API key not configured"
        )
    
    # Generate fresh Google Places photo URL
    photo_url = (
        f"https://maps.googleapis.com/maps/api/place/photo"
        f"?maxwidth={maxwidth}"
        f"&photo_reference={photo_reference}"
        f"&key={GOOGLE_PLACES_API_KEY}"
    )
    
    # Redirect to the fresh Google URL
    return RedirectResponse(url=photo_url, status_code=302)

