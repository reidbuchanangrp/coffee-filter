// src/lib/types.ts - SAME as web!
export interface CoffeeShop {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    image: string;
    accessibility: boolean;
    hasWifi: boolean;
    description: string;
    machine: string;
    weeklyHours: Record<string, { open: string; close: string }>;
    pourOver: boolean;
    website?: string;
    instagram?: string;
    starred?: boolean;
  }
  