"""
Geocoding utility using OpenStreetMap Nominatim API.
"""
import httpx
from urllib.parse import quote
from typing import Optional, Tuple


async def geocode_address(address: str) -> Optional[Tuple[float, float]]:
    """
    Geocode an address to latitude and longitude coordinates.
    Uses OpenStreetMap Nominatim API (free, no API key required).
    
    Args:
        address: The address string to geocode
        
    Returns:
        Tuple of (latitude, longitude) if successful, None otherwise
    """
    try:
        encoded_address = quote(address)
        url = f"https://nominatim.openstreetmap.org/search?q={encoded_address}&format=json&limit=1"
        
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers={
                    "User-Agent": "CoffeeFilter/1.0",  # Required by Nominatim ToS
                },
                timeout=10.0
            )
            
            if response.status_code != 200:
                return None
                
            data = response.json()
            
            if not data or len(data) == 0:
                return None
                
            result = data[0]
            latitude = float(result["lat"])
            longitude = float(result["lon"])
            
            return (latitude, longitude)
            
    except Exception as e:
        print(f"Error geocoding address: {e}")
        return None

