import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Map locale to the destination slug that should be excluded
// Users shouldn't buy eSIM for the country they're already in
export const LOCALE_EXCLUDED_DESTINATION: Record<string, string> = {
  'en-au': 'australia',      // Australia (if ever added)
  'en-sg': 'singapore',
  'en-gb': 'united-kingdom',
  'ms-my': 'malaysia',
  'id-id': 'indonesia',
};

// Get the destination slug to exclude for a given locale
export function getExcludedDestination(locale: string): string | null {
  return LOCALE_EXCLUDED_DESTINATION[locale] || null;
}

// Check if a destination should be excluded for a given locale
export function isDestinationExcluded(destinationSlug: string, locale: string): boolean {
  return LOCALE_EXCLUDED_DESTINATION[locale] === destinationSlug;
}
