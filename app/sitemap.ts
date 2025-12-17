import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://trvel.co';

const destinations = [
  'japan', 'thailand', 'south-korea', 'singapore',
  'indonesia', 'malaysia', 'vietnam', 'philippines',
  'united-kingdom', 'france', 'italy', 'united-states'
];

const staticPages = [
  '',
  '/destinations',
  '/how-it-works',
  '/compatibility',
  '/help',
  '/blog',
  '/get-started',
  '/terms',
  '/privacy',
  '/fair-use',
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes: MetadataRoute.Sitemap = [];

  // Generate URLs for each locale
  for (const locale of routing.locales) {
    // Static pages
    for (const page of staticPages) {
      routes.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === '' ? 'daily' : 'weekly',
        priority: page === '' ? 1.0 : 0.8,
      });
    }

    // Destination pages
    for (const destination of destinations) {
      routes.push({
        url: `${BASE_URL}/${locale}/${destination}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      });
    }
  }

  return routes;
}
