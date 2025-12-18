import { Plan, Destination, Post } from '@prisma/client';

export type Locale = 'en-au' | 'en-sg' | 'en-gb' | 'en-us' | 'ms-my' | 'id-id';

export type PlanWithRelations = Plan;

export type DestinationWithRelations = Destination;

export type PostWithRelations = Post;

// Duration option stored in Plan.durations JSON array
export interface DurationOption {
  duration: number;        // Days (1, 3, 5, 7, 10, 15, 30)
  wholesale_cents: number; // Wholesale price in USD cents
  retail_price: number;    // Retail price in local currency
  bundle_name: string;     // eSIM-Go bundle identifier for fulfillment
  daily_rate: number;      // Calculated: retail_price / duration
}

// Plan data for API responses
export interface PlanData {
  destination_slug: string;
  locale: Locale;
  currency: string;
  durations: DurationOption[];      // All available durations
  default_durations: number[];      // Which durations to show by default (e.g., [5, 7, 15])
  best_daily_rate: number;          // Lowest per-day rate across all durations
  competitor_name?: string;
  competitor_daily_rate?: number;
}

export interface DestinationData {
  slug: string;
  locale: Locale;
  name: string;
  tagline?: string;
}

export interface PostData {
  slug: string;
  locale: Locale;
  title: string;
  content: string;
  published_at?: Date;
}
