from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict

class DayHours(BaseModel):
    """Hours for a single day"""
    open: str
    close: str

# WeeklyHours is a dict with day names as keys
WeeklyHours = Dict[str, DayHours]

class CoffeeShopBase(BaseModel):
    """Base schema matching the database model (snake_case)"""
    name: str
    address: str
    latitude: float
    longitude: float
    image: str
    accessibility: bool = False
    has_wifi: bool = False
    description: str
    machine: str
    weekly_hours: WeeklyHours
    pour_over: bool = False
    website: Optional[str] = None
    instagram: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CoffeeShopCreate(BaseModel):
    """Schema for creating a coffee shop - latitude/longitude optional (will be geocoded if not provided)"""
    name: str
    address: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image: str = "https://via.placeholder.com/150"
    accessibility: bool = False
    has_wifi: bool = False
    description: str = ""
    machine: str = ""
    weekly_hours: WeeklyHours = {}
    pour_over: bool = False
    website: Optional[str] = None
    instagram: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CoffeeShopUpdate(BaseModel):
    """Schema for updating a coffee shop - all fields optional"""
    name: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image: Optional[str] = None
    accessibility: Optional[bool] = None
    has_wifi: Optional[bool] = None
    description: Optional[str] = None
    machine: Optional[str] = None
    weekly_hours: Optional[WeeklyHours] = None
    pour_over: Optional[bool] = None
    website: Optional[str] = None
    instagram: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)

class CoffeeShop(CoffeeShopBase):
    """Schema for coffee shop responses"""
    id: int

    model_config = ConfigDict(from_attributes=True)
