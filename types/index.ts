import { Plan, Destination, Post } from '@prisma/client';

export type Locale = 'en-au' | 'en-sg' | 'en-gb' | 'ms-my' | 'id-id';

export type PlanWithRelations = Plan;

export type DestinationWithRelations = Destination;

export type PostWithRelations = Post;

export interface PlanData {
  destination_slug: string;
  locale: Locale;
  currency: string;
  price_5day?: number;
  price_7day?: number;
  price_15day?: number;
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

