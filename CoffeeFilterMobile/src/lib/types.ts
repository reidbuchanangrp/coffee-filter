// src/lib/types.ts
// Shared with web app - same interface

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

// Helper type for weekly hours
export type WeeklyHours = CoffeeShop['weeklyHours'];

// Days of week constant
export const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];
