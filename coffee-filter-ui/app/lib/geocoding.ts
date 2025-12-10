export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Geocodes an address to latitude and longitude coordinates.
 * Uses OpenStreetMap Nominatim API (free, no API key required).
 *
 * Note: Nominatim has rate limits (1 request per second recommended).
 * For production use, consider caching results or using a paid service.
 *
 * @param address - The address string to geocode (e.g., "4141 Troost Ave, Kansas City, MO 64110")
 * @returns Promise with coordinates object, or null if geocoding fails
 */
export async function geocodeAddress(
  address: string
): Promise<Coordinates | null> {
  try {
    const encodedAddress = encodeURIComponent(address);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedAddress}&format=json&limit=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "CoffeeFilter/1.0", // Required by Nominatim ToS
      },
    });

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      return null;
    }

    const result = data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
    };
  } catch (error) {
    console.error("Error geocoding address:", error);
    return null;
  }
}
