// src/lib/api.ts
import * as SecureStore from 'expo-secure-store';
import type { CoffeeShop } from './types';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const PLACEHOLDER_IMAGE = 'https://placehold.co/150x150/e2e8f0/64748b?text=☕';

// SecureStore instead of localStorage (SSR-safe by default on mobile)
async function getToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync('token');
  } catch {
    return null;
  }
}

export async function setToken(token: string): Promise<void> {
  await SecureStore.setItemAsync('token', token);
}

export async function removeToken(): Promise<void> {
  await SecureStore.deleteItemAsync('token');
}

// Helper to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
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
    image: backendShop.image || PLACEHOLDER_IMAGE,
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
  if (frontendShop.latitude !== undefined) result.latitude = frontendShop.latitude;
  if (frontendShop.longitude !== undefined) result.longitude = frontendShop.longitude;
  if (frontendShop.image !== undefined) result.image = frontendShop.image;
  if (frontendShop.accessibility !== undefined) result.accessibility = frontendShop.accessibility;
  if (frontendShop.hasWifi !== undefined) result.has_wifi = frontendShop.hasWifi;
  if (frontendShop.description !== undefined) result.description = frontendShop.description;
  if (frontendShop.machine !== undefined) result.machine = frontendShop.machine;
  if (frontendShop.weeklyHours !== undefined) result.weekly_hours = frontendShop.weeklyHours;
  if (frontendShop.pourOver !== undefined) result.pour_over = frontendShop.pourOver;
  if (frontendShop.website !== undefined) result.website = frontendShop.website;
  if (frontendShop.instagram !== undefined) result.instagram = frontendShop.instagram;
  if (frontendShop.starred !== undefined) result.starred = frontendShop.starred;
  return result;
}

export async function getCoffeeShops(): Promise<CoffeeShop[]> {
  const response = await fetch(`${API_BASE_URL}/coffee-shops`);
  if (!response.ok) {
    throw new Error(`Failed to fetch coffee shops: ${response.statusText}`);
  }
  const data = await response.json();
  return data.map(transformToFrontend);
}

export async function getCoffeeShop(id: number): Promise<CoffeeShop> {
  const response = await fetch(`${API_BASE_URL}/coffee-shops/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch coffee shop: ${response.statusText}`);
  }
  const data = await response.json();
  return transformToFrontend(data);
}

export async function createCoffeeShop(
  shop: Partial<Omit<CoffeeShop, 'id'>>
): Promise<CoffeeShop> {
  const headers = await getAuthHeaders();
  const shopData = {
    ...transformToBackend(shop),
    image: shop.image || PLACEHOLDER_IMAGE,
  };

  const response = await fetch(`${API_BASE_URL}/coffee-shops`, {
    method: 'POST',
    headers,
    body: JSON.stringify(shopData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.detail || `Failed to create coffee shop: ${response.statusText}`
    );
  }

  const data = await response.json();
  return transformToFrontend(data);
}

export async function updateCoffeeShop(
  id: number,
  updates: Partial<CoffeeShop>
): Promise<CoffeeShop> {
  const headers = await getAuthHeaders();
  const shopData = transformToBackend(updates);

  const response = await fetch(`${API_BASE_URL}/coffee-shops/${id}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(shopData),
  });

  if (!response.ok) {
    throw new Error(`Failed to update coffee shop: ${response.statusText}`);
  }

  const data = await response.json();
  return transformToFrontend(data);
}

export async function deleteCoffeeShop(id: number): Promise<void> {
  const headers = await getAuthHeaders();

  const response = await fetch(`${API_BASE_URL}/coffee-shops/${id}`, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to delete coffee shop: ${response.statusText}`);
  }
}

// Auth endpoints
export async function login(
  username: string,
  password: string
): Promise<{ token: string; isAdmin: boolean }> {
  const formData = new URLSearchParams();
  formData.append('username', username);
  formData.append('password', password);

  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  const data = await response.json();
  await setToken(data.access_token);

  // Fetch user info to get admin status
  const userInfo = await getCurrentUser();
  return { token: data.access_token, isAdmin: userInfo.isAdmin };
}

export async function getCurrentUser(): Promise<{ username: string; isAdmin: boolean }> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/auth/me`, { headers });

  if (!response.ok) {
    throw new Error('Not authenticated');
  }

  const data = await response.json();
  return { username: data.username, isAdmin: data.is_admin };
}

export async function logout(): Promise<void> {
  await removeToken();
}
