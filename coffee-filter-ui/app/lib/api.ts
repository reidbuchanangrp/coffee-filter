import type { CoffeeShop } from "./types";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const PLACEHOLDER_IMAGE = "https://placehold.co/150x150/e2e8f0/64748b?text=☕";

/**
 * Get the image URL for a coffee shop.
 * If photoReference is available, use the backend proxy to get a fresh Google Places photo URL.
 * Otherwise fall back to the stored image URL or placeholder.
 */
function getImageUrl(backendShop: any): string {
  if (backendShop.photo_reference) {
    // Use backend proxy endpoint for fresh Google Places photo URLs
    return `${API_BASE_URL}/photos/${backendShop.photo_reference}?maxwidth=400`;
  }
  return backendShop.image || PLACEHOLDER_IMAGE;
}

// Helper to safely get token (SSR-safe)
function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

// Helper to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

// Transform backend snake_case to frontend camelCase
function transformToFrontend(backendShop: any): CoffeeShop {
  return {
    id: backendShop.id,
    name: backendShop.name,
    address: backendShop.address,
    latitude: backendShop.latitude,
    longitude: backendShop.longitude,
    image: getImageUrl(backendShop),
    photoReference: backendShop.photo_reference,
    accessibility: backendShop.accessibility,
    hasWifi: backendShop.has_wifi,
    description: backendShop.description,
    machine: backendShop.machine,
    weeklyHours: backendShop.weekly_hours || {},
    pourOver: backendShop.pour_over,
    website: backendShop.website,
    instagram: backendShop.instagram,
    starred: backendShop.starred || false,
  };
}

// Transform frontend camelCase to backend snake_case
function transformToBackend(frontendShop: Partial<CoffeeShop>): any {
  const result: any = {};
  if (frontendShop.name !== undefined) result.name = frontendShop.name;
  if (frontendShop.address !== undefined) result.address = frontendShop.address;
  if (frontendShop.latitude !== undefined)
    result.latitude = frontendShop.latitude;
  if (frontendShop.longitude !== undefined)
    result.longitude = frontendShop.longitude;
  if (frontendShop.image !== undefined) result.image = frontendShop.image;
  if (frontendShop.photoReference !== undefined)
    result.photo_reference = frontendShop.photoReference;
  if (frontendShop.accessibility !== undefined)
    result.accessibility = frontendShop.accessibility;
  if (frontendShop.hasWifi !== undefined)
    result.has_wifi = frontendShop.hasWifi;
  if (frontendShop.description !== undefined)
    result.description = frontendShop.description;
  if (frontendShop.machine !== undefined) result.machine = frontendShop.machine;
  if (frontendShop.weeklyHours !== undefined)
    result.weekly_hours = frontendShop.weeklyHours;
  if (frontendShop.pourOver !== undefined)
    result.pour_over = frontendShop.pourOver;
  if (frontendShop.website !== undefined) result.website = frontendShop.website;
  if (frontendShop.instagram !== undefined)
    result.instagram = frontendShop.instagram;
  if (frontendShop.starred !== undefined) result.starred = frontendShop.starred;
  return result;
}

export async function getCoffeeShops(): Promise<CoffeeShop[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/coffee-shops`);
    if (!response.ok) {
      throw new Error(`Failed to fetch coffee shops: ${response.statusText}`);
    }
    const data = await response.json();
    return data.map(transformToFrontend);
  } catch (error) {
    console.error("Error fetching coffee shops:", error);
    throw error;
  }
}

export async function getCoffeeShop(id: number): Promise<CoffeeShop> {
  try {
    const response = await fetch(`${API_BASE_URL}/coffee-shops/${id}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch coffee shop: ${response.statusText}`);
    }
    const data = await response.json();
    return transformToFrontend(data);
  } catch (error) {
    console.error("Error fetching coffee shop:", error);
    throw error;
  }
}

export async function createCoffeeShop(
  shop: Partial<Omit<CoffeeShop, "id">>
): Promise<CoffeeShop> {
  try {
    // Convert to backend format - don't include lat/lng if not provided (backend will geocode)
    const shopData: any = {
      ...transformToBackend(shop),
      image: shop.image || PLACEHOLDER_IMAGE,
    };

    // Only include latitude/longitude if explicitly provided
    if (shop.latitude !== undefined && shop.latitude !== null) {
      shopData.latitude = parseFloat(shop.latitude.toString());
    }
    if (shop.longitude !== undefined && shop.longitude !== null) {
      shopData.longitude = parseFloat(shop.longitude.toString());
    }

    const response = await fetch(`${API_BASE_URL}/coffee-shops`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(shopData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.detail ||
          `Failed to create coffee shop: ${response.statusText}`
      );
    }

    const data = await response.json();
    return transformToFrontend(data);
  } catch (error) {
    console.error("Error creating coffee shop:", error);
    throw error;
  }
}

export async function updateCoffeeShop(
  id: number,
  updates: Partial<CoffeeShop>
): Promise<CoffeeShop> {
  try {
    const shopData = transformToBackend(updates);

    const response = await fetch(`${API_BASE_URL}/coffee-shops/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(shopData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update coffee shop: ${response.statusText}`);
    }

    const data = await response.json();
    return transformToFrontend(data);
  } catch (error) {
    console.error("Error updating coffee shop:", error);
    throw error;
  }
}

export async function deleteCoffeeShop(id: number): Promise<void> {
  try {
    const token = getToken();
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/coffee-shops/${id}`, {
      method: "DELETE",
      headers,
    });

    if (!response.ok) {
      throw new Error(`Failed to delete coffee shop: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error deleting coffee shop:", error);
    throw error;
  }
}
