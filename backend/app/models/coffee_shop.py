from sqlalchemy import Column, Integer, String, Float, Boolean, JSON
from app.core.database import Base

class CoffeeShop(Base):
    __tablename__ = "coffee_shops"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    address = Column(String, nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    image = Column(String)
    accessibility = Column(Boolean, default=False)
    has_wifi = Column(Boolean, default=False)
    description = Column(String)
    machine = Column(String)
    weekly_hours = Column(JSON)  # Store per-day hours as JSON: {"monday": {"open": "7am", "close": "5pm"}, ...}
    pour_over = Column(Boolean, default=False)
    website = Column(String, nullable=True)
    instagram = Column(String, nullable=True)
    starred = Column(Boolean, default=False)  # Featured/favorite shop

