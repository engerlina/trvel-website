import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';
import { prisma } from '@/lib/db';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

// Sitemap lists URLs we want Google to discover and consider for indexing.
// Pages marked `robots: { index: false }` (comparison, duration, device
// compatibility) are intentionally EXCLUDED here — listing a noindex URL in a
// sitemap is a mixed signal that wastes crawl budget. They remain accessible
// and linked internally from EsimChecker, destination pages, and paid ads.

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

    // Fetch device brands for brand listing pages (kept in sitemap — the
    // per-device pages under each brand are noindex and excluded).
    const deviceBrands = await prisma.deviceBrand.findMany({
      select: { slug: true, updatedAt: true },
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

      // Destination pages (Tier 1) — primary money pages
      const localeDestinations = destinations.filter((d) => d.locale === locale);
      for (const dest of localeDestinations) {
        routes.push({
          url: `${BASE_URL}/${locale}/${dest.slug}`,
          lastModified: dest.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.9,
        });
      }

      // City pages (Tier 2) — carry unique content (airport, connectivity
      // notes, popular areas) so they stay in the index.
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

      // Device brand pages (Tier 5) — fewer, more substantial pages per brand
      for (const brand of deviceBrands) {
        routes.push({
          url: `${BASE_URL}/${locale}/compatibility/${brand.slug}`,
          lastModified: brand.updatedAt,
          changeFrequency: 'monthly',
          priority: 0.65,
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
