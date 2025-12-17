import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { prisma } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://trvel.co';

// Carrier mapping for comparison pages
const LOCALE_CARRIERS: Record<string, string> = {
  'en-au': 'telstra',
  'en-sg': 'singtel',
  'en-gb': 'ee',
  'ms-my': 'maxis',
  'id-id': 'telkomsel',
};

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

  try {
    // Fetch destinations from database
    const destinations = await prisma.destination.findMany({
      select: { slug: true, locale: true, updatedAt: true },
    });

    // Fetch cities from database
    const cities = await prisma.city.findMany({
      select: {
        slug: true,
        locale: true,
        updatedAt: true,
        destination: { select: { slug: true } },
      },
    });

    // Fetch blog posts from database
    const posts = await prisma.post.findMany({
      where: { published_at: { not: null } },
      select: { slug: true, locale: true, updatedAt: true },
    });

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

      // Destination pages (Tier 1)
      const localeDestinations = destinations.filter((d) => d.locale === locale);
      for (const dest of localeDestinations) {
        routes.push({
          url: `${BASE_URL}/${locale}/${dest.slug}`,
          lastModified: dest.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.9,
        });

        // Comparison pages (Tier 4) - one per destination per locale
        const carrier = LOCALE_CARRIERS[locale];
        if (carrier) {
          routes.push({
            url: `${BASE_URL}/${locale}/compare/${carrier}-vs-esim-${dest.slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
          });
        }
      }

      // City pages (Tier 2)
      const localeCities = cities.filter((c) => c.locale === locale && c.destination);
      for (const city of localeCities) {
        routes.push({
          url: `${BASE_URL}/${locale}/${city.destination!.slug}/${city.slug}`,
          lastModified: city.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.8,
        });
      }

      // Blog posts
      const localePosts = posts.filter((p) => p.locale === locale);
      for (const post of localePosts) {
        routes.push({
          url: `${BASE_URL}/${locale}/blog/${post.slug}`,
          lastModified: post.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.6,
        });
      }
    }
  } catch (error) {
    // Fallback if database is unavailable
    console.log('Sitemap: Database unavailable, using static routes only');

    const fallbackDestinations = [
      'japan', 'thailand', 'south-korea', 'singapore',
      'indonesia', 'malaysia', 'vietnam', 'philippines',
      'united-kingdom', 'france', 'italy', 'united-states'
    ];

    for (const locale of routing.locales) {
      for (const page of staticPages) {
        routes.push({
          url: `${BASE_URL}/${locale}${page}`,
          lastModified: new Date(),
          changeFrequency: page === '' ? 'daily' : 'weekly',
          priority: page === '' ? 1.0 : 0.8,
        });
      }

      for (const destination of fallbackDestinations) {
        routes.push({
          url: `${BASE_URL}/${locale}/${destination}`,
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      }
    }
  }

  return routes;
}
