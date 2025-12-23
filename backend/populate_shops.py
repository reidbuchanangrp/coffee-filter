#!/usr/bin/env python3
"""
Coffee Shop Database Populator
Uses Google Places API to find specialty coffee shops and add them to your database.
"""

import requests
import time
import os
from typing import Optional

# =============================================================================
# CONFIGURATION - Update these values
# =============================================================================

# Your Google Places API key
GOOGLE_PLACES_API_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "YOUR_API_KEY_HERE")

# Your production API URL
API_BASE_URL = "https://coffee-filter-production.up.railway.app/api/v1"

# Admin credentials (will prompt if not set)
ADMIN_USERNAME = os.getenv("ADMIN_USERNAME", "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")

# Search configuration
SEARCH_QUERIES = [
    "single origin pour over"
]

# Chains to exclude (lowercase)
EXCLUDE_CHAINS = [
    "starbucks", "dunkin", "peet's", "peets", "caribou", "dutch bros",
    "scooter's", "scooters", "biggby", "7-eleven", "7 eleven",
    "mcdonald's", "mcdonalds", "panera", "tim hortons", "coffee bean & tea leaf",
    "pj's coffee", "black rock coffee", "human bean", "gloria jean's",
    "it's a grind", "coffee beanery", "aroma joe's", "ziggi's",
    "blank street"  # Some consider these chains now
]

# Keywords that indicate non-specialty places (lowercase)
EXCLUDE_KEYWORDS = [
    "smoke shop", "vape", "gas station", "convenience", 
    "donut", "doughnut", "bagel", "deli", "pizza", 
    "bar & grill", "brewery", "pub", "tavern",
    "ice cream", "frozen yogurt", "smoothie", "juice bar",
]

# Minimum rating (0 to disable)
MIN_RATING = 4.0

# Minimum number of reviews (0 to disable)
MIN_REVIEWS = 10

# Major US cities to search (add more as needed)
US_CITIES = [
    # Texas
    ("Austin", "TX", 30.2672, -97.7431),
    ("Houston", "TX", 29.7604, -95.3698),
    ("Dallas", "TX", 32.7767, -96.7970),
    ("San Antonio", "TX", 29.4241, -98.4936),
    
    # California
    ("Los Angeles", "CA", 34.0522, -118.2437),
    ("San Francisco", "CA", 37.7749, -122.4194),
    ("San Diego", "CA", 32.7157, -117.1611),
    ("Oakland", "CA", 37.8044, -122.2712),
    ("Portland", "OR", 45.5152, -122.6784),
    ("Seattle", "WA", 47.6062, -122.3321),
    
    # East Coast
    ("New York", "NY", 40.7128, -74.0060),
    ("Brooklyn", "NY", 40.6782, -73.9442),
    ("Boston", "MA", 42.3601, -71.0589),
    ("Philadelphia", "PA", 39.9526, -75.1652),
    ("Washington", "DC", 38.9072, -77.0369),
    ("Baltimore", "MD", 39.2904, -76.6122),
    ("Pittsburgh", "PA", 40.4406, -79.9959),
    
    # Midwest
    ("Chicago", "IL", 41.8781, -87.6298),
    ("Minneapolis", "MN", 44.9778, -93.2650),
    ("Denver", "CO", 39.7392, -104.9903),
    ("Kansas City", "MO", 39.0997, -94.5786),
    ("St. Louis", "MO", 38.6270, -90.1994),
    ("Detroit", "MI", 42.3314, -83.0458),
    ("Columbus", "OH", 39.9612, -82.9988),
    ("Indianapolis", "IN", 39.7684, -86.1581),
    
    # South
    ("Atlanta", "GA", 33.7490, -84.3880),
    ("Miami", "FL", 25.7617, -80.1918),
    ("Nashville", "TN", 36.1627, -86.7816),
    ("New Orleans", "LA", 29.9511, -90.0715),
    ("Charlotte", "NC", 35.2271, -80.8431),
    ("Raleigh", "NC", 35.7796, -78.6382),
    ("Charleston", "SC", 32.7765, -79.9311),
    ("Savannah", "GA", 32.0809, -81.0912),
    
    # Southwest
    ("Phoenix", "AZ", 33.4484, -112.0740),
    ("Tucson", "AZ", 32.2226, -110.9747),
    ("Albuquerque", "NM", 35.0844, -106.6504),
    ("Salt Lake City", "UT", 40.7608, -111.8910),
    ("Las Vegas", "NV", 36.1699, -115.1398),
    
    # Oklahoma (since you have OKC shops)
    ("Oklahoma City", "OK", 35.4676, -97.5164),
    ("Tulsa", "OK", 36.1540, -95.9928),
]

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

def get_auth_token(username: str, password: str) -> Optional[str]:
    """Authenticate and get JWT token."""
    try:
        response = requests.post(
            f"{API_BASE_URL}/auth/login",
            data={"username": username, "password": password},
            headers={"Content-Type": "application/x-www-form-urlencoded"}
        )
        if response.status_code == 200:
            return response.json().get("access_token")
        else:
            print(f"❌ Login failed: {response.text}")
            return None
    except Exception as e:
        print(f"❌ Login error: {e}")
        return None


def get_existing_shops(token: str) -> tuple[set, dict]:
    """Get existing shops to avoid duplicates. Returns (name_address_set, coords_dict)."""
    existing = set()
    existing_coords = {}
    try:
        response = requests.get(f"{API_BASE_URL}/coffee-shops")
        if response.status_code == 200:
            shops = response.json()
            for shop in shops:
                name = shop.get("name", "").lower().strip()
                address = shop.get("address", "").lower()
                lat = shop.get("latitude")
                lng = shop.get("longitude")
                existing.add((name, address))
                existing_coords[(name, address)] = (lat, lng)
    except Exception as e:
        print(f"⚠️ Could not fetch existing shops: {e}")
    return existing, existing_coords


def search_google_places(query: str, lat: float, lng: float, radius: int = 15000) -> list:
    """Search Google Places API for coffee shops."""
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {
        "key": GOOGLE_PLACES_API_KEY,
        "location": f"{lat},{lng}",
        "radius": radius,
        "keyword": query,
        "type": "cafe",
    }
    
    results = []
    try:
        response = requests.get(url, params=params)
        data = response.json()
        
        if data.get("status") == "OK":
            results.extend(data.get("results", []))
            
            # Handle pagination (up to 60 results total)
            while "next_page_token" in data and len(results) < 60:
                time.sleep(2)  # Required delay for next_page_token
                next_page_params = {
                    "key": GOOGLE_PLACES_API_KEY,
                    "pagetoken": data["next_page_token"]
                }
                response = requests.get(url, params=next_page_params)
                data = response.json()
                if data.get("status") == "OK":
                    results.extend(data.get("results", []))
                else:
                    break
        elif data.get("status") == "REQUEST_DENIED":
            print(f"❌ API Error: {data.get('error_message', 'Request denied')}")
        
    except Exception as e:
        print(f"❌ Places API error: {e}")
    
    return results


def get_place_details(place_id: str) -> dict:
    """Get detailed info about a place."""
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {
        "key": GOOGLE_PLACES_API_KEY,
        "place_id": place_id,
        "fields": "name,formatted_address,geometry,website,opening_hours,photos,formatted_phone_number,editorial_summary",
    }
    
    try:
        response = requests.get(url, params=params)
        data = response.json()
        if data.get("status") == "OK":
            return data.get("result", {})
    except Exception as e:
        print(f"⚠️ Details API error: {e}")
    
    return {}


def normalize_time(time_str: str) -> str:
    """
    Convert Google's time format to frontend expected format.
    Google: "7:00 AM", "10:30 PM", "7 AM"
    Frontend: "7am", "10:30pm", "7am"
    """
    import re
    time_str = time_str.strip().upper()
    
    # Extract components using regex
    # Matches: "7:00 AM", "7 AM", "10:30 PM", "12:00 PM"
    match = re.match(r'(\d{1,2})(?::(\d{2}))?\s*(AM|PM)', time_str)
    if not match:
        return time_str.lower().replace(" ", "")  # Fallback
    
    hour = match.group(1)
    minutes = match.group(2)  # May be None
    period = match.group(3).lower()
    
    # Build the normalized format: "7am", "7:30pm", "10am"
    if minutes and minutes != "00":
        return f"{hour}:{minutes}{period}"
    else:
        return f"{hour}{period}"


def get_photo_url(photo_reference: str, max_width: int = 400) -> str:
    """Get photo URL from Google Places photo reference."""
    return f"https://maps.googleapis.com/maps/api/place/photo?maxwidth={max_width}&photo_reference={photo_reference}&key={GOOGLE_PLACES_API_KEY}"


def create_shop_data(place: dict, details: dict) -> dict:
    """Convert Google Places data to our shop format."""
    location = place.get("geometry", {}).get("location", {})
    
    # Get photo URL if available
    image_url = "https://placehold.co/150x150/e2e8f0/64748b?text=☕"
    photos = place.get("photos") or details.get("photos")
    if photos and len(photos) > 0:
        image_url = get_photo_url(photos[0].get("photo_reference", ""))
    
    # Parse weekly hours if available
    weekly_hours = {}
    opening_hours = details.get("opening_hours", {})
    if opening_hours.get("weekday_text"):
        day_map = {
            "Monday": "monday", "Tuesday": "tuesday", "Wednesday": "wednesday",
            "Thursday": "thursday", "Friday": "friday", "Saturday": "saturday", "Sunday": "sunday"
        }
        for text in opening_hours["weekday_text"]:
            for day_name, day_key in day_map.items():
                if text.startswith(day_name):
                    hours_part = text.replace(f"{day_name}: ", "")
                    if hours_part.lower() != "closed" and "–" in hours_part:
                        parts = hours_part.split("–")
                        if len(parts) == 2:
                            weekly_hours[day_key] = {
                                "open": normalize_time(parts[0].strip()),
                                "close": normalize_time(parts[1].strip())
                            }
    
    return {
        "name": place.get("name", ""),
        "address": details.get("formatted_address") or place.get("vicinity", ""),
        "latitude": location.get("lat"),
        "longitude": location.get("lng"),
        "image": image_url,
        "website": details.get("website"),
        "description": details.get("editorial_summary", {}).get("overview", ""),
        "has_wifi": True,  # Assume true, can be edited later
        "accessibility": False,  # Unknown, can be edited later
        "pour_over": True,  # Default, can be edited later
        "machine": "",  # Unknown, can be edited later
        "weekly_hours": weekly_hours if weekly_hours else {},
        "instagram": None,
    }


def add_shop_to_database(shop_data: dict, token: str) -> bool:
    """Add a shop to the database via API."""
    try:
        response = requests.post(
            f"{API_BASE_URL}/coffee-shops",
            json=shop_data,
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
        )
        if response.status_code == 201:
            return True
        else:
            print(f"  ⚠️ Failed to add: {response.text}")
            return False
    except Exception as e:
        print(f"  ❌ Error adding shop: {e}")
        return False


def normalize_name(name: str) -> str:
    """Normalize shop name for comparison."""
    name = name.lower().strip()
    # Remove common suffixes
    remove_words = [
        "coffee", "roasters", "roasting", "cafe", "café", "espresso", 
        "bar", "house", "shop", "co", "co.", "company", "the", "&", "and"
    ]
    words = name.split()
    words = [w for w in words if w not in remove_words]
    return " ".join(words).strip()


def is_duplicate(shop_name: str, shop_address: str, existing: set, 
                 existing_coords: dict = None, lat: float = None, lng: float = None) -> bool:
    """Check if shop already exists using multiple strategies."""
    name_lower = shop_name.lower().strip()
    name_normalized = normalize_name(shop_name)
    address_lower = shop_address.lower()
    
    # Extract street number and name for address comparison
    address_parts = address_lower.split(",")[0].strip()  # Just the street address
    
    for existing_name, existing_addr in existing:
        existing_normalized = normalize_name(existing_name)
        existing_addr_parts = existing_addr.split(",")[0].strip()
        
        # Strategy 1: Exact name match
        if name_lower == existing_name:
            return True
        
        # Strategy 2: Normalized name match (ignores "Coffee", "Roasters", etc.)
        if name_normalized and existing_normalized and name_normalized == existing_normalized:
            return True
        
        # Strategy 3: One name contains the other (for variations)
        if len(name_normalized) > 3 and len(existing_normalized) > 3:
            if name_normalized in existing_normalized or existing_normalized in name_normalized:
                # Also check address similarity to confirm
                if address_parts[:15] == existing_addr_parts[:15]:  # First 15 chars of street
                    return True
        
        # Strategy 4: Same street address (catches same location, different name)
        if address_parts and existing_addr_parts:
            if address_parts == existing_addr_parts:
                return True
    
    # Strategy 5: Coordinate proximity (within ~50 meters)
    if existing_coords and lat and lng:
        for (ex_name, _), (ex_lat, ex_lng) in existing_coords.items():
            if ex_lat and ex_lng:
                # Simple distance check (roughly 50 meters)
                if abs(lat - ex_lat) < 0.0005 and abs(lng - ex_lng) < 0.0005:
                    # Very close location - check if names are at all similar
                    if normalize_name(shop_name)[:4] == normalize_name(ex_name)[:4]:
                        return True
    
    return False


# =============================================================================
# MAIN SCRIPT
# =============================================================================

def main():
    print("=" * 60)
    print("☕ Coffee Shop Database Populator")
    print("=" * 60)
    
    # Check API key
    global GOOGLE_PLACES_API_KEY
    if GOOGLE_PLACES_API_KEY == "YOUR_API_KEY_HERE":
        GOOGLE_PLACES_API_KEY = input("\n🔑 Enter your Google Places API key: ").strip()
    
    if not GOOGLE_PLACES_API_KEY:
        print("❌ API key required!")
        return
    
    # Get credentials
    username = ADMIN_USERNAME or input("\n👤 Admin username: ").strip()
    password = ADMIN_PASSWORD or input("🔒 Admin password: ").strip()
    
    # Authenticate
    print("\n🔐 Authenticating...")
    token = get_auth_token(username, password)
    if not token:
        print("❌ Authentication failed!")
        return
    print("✅ Authenticated successfully!")
    
    # Get existing shops
    print("\n📋 Fetching existing shops...")
    existing, existing_coords = get_existing_shops(token)
    print(f"   Found {len(existing)} existing shops")
    
    # Mode selection
    print("\n📍 Select mode:")
    print("   1. Dry run (preview only, no changes)")
    print("   2. Interactive (confirm each city)")
    print("   3. Auto (add all without prompts)")
    mode = input("\nChoice [1/2/3]: ").strip() or "1"
    
    dry_run = mode == "1"
    interactive = mode == "2"
    
    if dry_run:
        print("\n🔍 DRY RUN MODE - No changes will be made\n")
    
    # City selection
    print("\n🏙️ Cities to search:")
    for i, (city, state, _, _) in enumerate(US_CITIES):
        print(f"   {i+1}. {city}, {state}")
    
    print(f"\n   Enter city numbers (comma-separated), 'all', or press Enter for all:")
    city_input = input("   > ").strip()
    
    if city_input.lower() == "all" or city_input == "":
        selected_cities = US_CITIES
    else:
        try:
            indices = [int(x.strip()) - 1 for x in city_input.split(",")]
            selected_cities = [US_CITIES[i] for i in indices if 0 <= i < len(US_CITIES)]
        except:
            print("❌ Invalid input, using all cities")
            selected_cities = US_CITIES
    
    print(f"\n🔎 Will search {len(selected_cities)} cities\n")
    
    # Process cities
    total_added = 0
    total_skipped = 0
    total_found = 0
    
    for city, state, lat, lng in selected_cities:
        print(f"\n{'='*50}")
        print(f"📍 {city}, {state}")
        print(f"{'='*50}")
        
        city_shops = []
        
        # Search with different queries
        for query in SEARCH_QUERIES:  # Search with all queries
            print(f"   Searching: '{query}'...")
            places = search_google_places(query, lat, lng)
            
            for place in places:
                # Skip if already processed
                place_id = place.get("place_id")
                if any(s.get("place_id") == place_id for s in city_shops):
                    continue
                
                place_name = place.get("name", "").lower()
                
                # Filter: Exclude chains
                if any(chain in place_name for chain in EXCLUDE_CHAINS):
                    print(f"   ⛔ Skip (chain): {place.get('name')}")
                    continue
                
                # Filter: Exclude non-coffee keywords
                if any(kw in place_name for kw in EXCLUDE_KEYWORDS):
                    print(f"   ⛔ Skip (excluded keyword): {place.get('name')}")
                    continue
                
                # Filter: Minimum rating
                rating = place.get("rating", 0)
                if MIN_RATING > 0 and rating < MIN_RATING:
                    print(f"   ⛔ Skip (rating {rating} < {MIN_RATING}): {place.get('name')}")
                    continue
                
                # Filter: Minimum reviews
                reviews = place.get("user_ratings_total", 0)
                if MIN_REVIEWS > 0 and reviews < MIN_REVIEWS:
                    print(f"   ⛔ Skip ({reviews} reviews < {MIN_REVIEWS}): {place.get('name')}")
                    continue
                
                # Get details
                details = get_place_details(place_id)
                shop_data = create_shop_data(place, details)
                shop_data["place_id"] = place_id  # For dedup within city
                
                # Check if duplicate
                if is_duplicate(
                    shop_data["name"], 
                    shop_data["address"], 
                    existing,
                    existing_coords,
                    shop_data.get("latitude"),
                    shop_data.get("longitude")
                ):
                    print(f"   ⏭️ Skip (duplicate): {shop_data['name']}")
                    total_skipped += 1
                    continue
                
                city_shops.append(shop_data)
            
            time.sleep(0.5)  # Rate limiting
        
        total_found += len(city_shops)
        
        if not city_shops:
            print("   No new shops found")
            continue
        
        # Show found shops
        print(f"\n   Found {len(city_shops)} new shops:")
        for i, shop in enumerate(city_shops):
            print(f"   {i+1}. {shop['name']}")
            print(f"      {shop['address']}")
        
        # Confirm or add
        if dry_run:
            print(f"\n   [DRY RUN] Would add {len(city_shops)} shops")
            continue
        
        if interactive:
            confirm = input(f"\n   Add these {len(city_shops)} shops? [y/n/q]: ").strip().lower()
            if confirm == "q":
                print("\n👋 Quitting...")
                break
            if confirm != "y":
                print("   Skipped")
                continue
        
        # Add shops
        print(f"\n   Adding {len(city_shops)} shops...")
        added = 0
        for shop in city_shops:
            del shop["place_id"]  # Remove temp field
            if add_shop_to_database(shop, token):
                added += 1
                name_lower = shop["name"].lower()
                addr_lower = shop["address"].lower()
                existing.add((name_lower, addr_lower))
                existing_coords[(name_lower, addr_lower)] = (shop.get("latitude"), shop.get("longitude"))
                print(f"   ✅ Added: {shop['name']}")
            time.sleep(0.3)  # Rate limiting
        
        total_added += added
        print(f"   Added {added}/{len(city_shops)} shops from {city}")
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 SUMMARY")
    print("=" * 60)
    print(f"   Cities searched: {len(selected_cities)}")
    print(f"   New shops found: {total_found}")
    print(f"   Duplicates skipped: {total_skipped}")
    print(f"   Shops added: {total_added}")
    print("=" * 60)


if __name__ == "__main__":
    main()

