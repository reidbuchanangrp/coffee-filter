// src/lib/api.ts
import * as SecureStore from 'expo-secure-store';
import type { CoffeeShop } from './types';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

// SecureStore instead of localStorage
async function getToken(): Promise<string | null> {
  return await SecureStore.getItemAsync('token');
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await getToken();
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

// Transform functions - SAME as web
function transformToFrontend(backendShop: any): CoffeeShop {
  return {
    id: backendShop.id,
    name: backendShop.name,
    address: backendShop.address,
    latitude: backendShop.latitude,
    longitude: backendShop.longitude,
    image: backendShop.image || 'https://placehold.co/150x150/e2e8f0/64748b?text=☕',
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

export async function getCoffeeShops(): Promise<CoffeeShop[]> {
  const response = await fetch(`${API_BASE_URL}/coffee-shops`);
  if (!response.ok) throw new Error('Failed to fetch coffee shops');
  const data = await response.json();
  return data.map(transformToFrontend);
}
