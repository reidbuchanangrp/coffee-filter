// src/lib/utils.ts
import type { WeeklyHours, DayOfWeek, DAYS_OF_WEEK } from './types';

/**
 * Parse time string to minutes since midnight for comparison
 * Handles "7am", "5pm", "7:30am", "17:00", etc.
 */
function parseTimeToMinutes(time: string): number {
  const normalized = time.toLowerCase().trim();

  // Check "7am" / "5pm" / "7:30am" format
  const ampmMatch = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1], 10);
    const minutes = parseInt(ampmMatch[2] || '0', 10);
    const period = ampmMatch[3];

    if (period === 'pm' && hour !== 12) hour += 12;
    if (period === 'am' && hour === 12) hour = 0;

    return hour * 60 + minutes;
  }

  // Handle 24h format "HH:MM"
  const parts = normalized.split(':');
  const hour = parseInt(parts[0], 10);
  const minutes = parseInt(parts[1] || '0', 10);
  return hour * 60 + minutes;
}

/**
 * Check if a coffee shop is currently open based on weekly hours
 */
export function isCurrentlyOpen(weeklyHours: WeeklyHours): boolean {
  if (!weeklyHours || Object.keys(weeklyHours).length === 0) {
    return false;
  }

  const now = new Date();
  const dayName = now
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase() as DayOfWeek;

  const todayHours = weeklyHours[dayName];
  if (!todayHours) {
    return false;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = parseTimeToMinutes(todayHours.open);
  const closeMinutes = parseTimeToMinutes(todayHours.close);

  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

/**
 * Format time for display
 * Handles formats like "7am", "5pm", "7:30am", "HH:MM", etc.
 */
export function formatTime(time: string): string {
  if (!time) return '';

  const normalized = time.toLowerCase().trim();

  // Check if already in "7am" / "5pm" / "7:30am" format
  const ampmMatch = normalized.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/);
  if (ampmMatch) {
    const hour = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2] || '00';
    const period = ampmMatch[3].toUpperCase();
    return `${hour}:${minutes} ${period}`;
  }

  // Handle 24h format "HH:MM" or "H:MM"
  const parts = normalized.split(':');
  const hour = parseInt(parts[0], 10);
  if (isNaN(hour)) return time; // Return original if can't parse

  const minutes = parts.length > 1 ? parts[1].padStart(2, '0') : '00';
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minutes} ${ampm}`;
}

/**
 * Get today's hours formatted
 */
export function getTodayHours(weeklyHours: WeeklyHours): string {
  const dayName = new Date()
    .toLocaleDateString('en-US', { weekday: 'long' })
    .toLowerCase() as DayOfWeek;

  const todayHours = weeklyHours[dayName];
  if (!todayHours) {
    return 'Closed today';
  }

  return `${formatTime(todayHours.open)} - ${formatTime(todayHours.close)}`;
}

/**
 * Ensure URL has protocol prefix
 */
export function ensureHttps(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}
