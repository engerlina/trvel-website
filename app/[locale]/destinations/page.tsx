import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { prisma, withRetry } from '@/lib/db';
import { Header, Footer } from '@/components/layout';
import { Link } from '@/i18n/routing';
import {
  Globe,
  ArrowRight,
  Star,
  Zap,
  Shield,
  Info,
} from 'lucide-react';
import { isDestinationExcluded } from '@/lib/utils';
import * as Flags from 'country-flag-icons/react/3x2';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

// Format price with proper decimal places (always show 2 decimals, except IDR)
// Accepts number, string, Prisma Decimal, or null/undefined
function formatPrice(price: unknown, currency: string): string {
  if (price === null || price === undefined) return '—';
  // Convert to number - handles Prisma Decimal (has toString/toNumber), string, and number
  const num = typeof price === 'object' && price !== null && 'toNumber' in price
    ? (price as { toNumber: () => number }).toNumber()
    : typeof price === 'string'
      ? parseFloat(price)
      : Number(price);
  if (isNaN(num)) return '—';
  // IDR doesn't use decimals
  if (currency === 'IDR') return Math.round(num).toLocaleString('id-ID');
  return num.toFixed(2);
}

// Get flag component by country ISO code
function getFlagComponent(countryIso: string | null): React.ComponentType<React.SVGProps<SVGSVGElement>> {
  if (!countryIso) return Globe as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>;
  const code = countryIso.toUpperCase();
  const FlagComponent = (Flags as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[code];
  return FlagComponent || (Globe as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>);
}

// Region display order (most popular first)
const REGION_ORDER = [
  'Asia',
  'Europe',
  'North America',
  'Oceania',
  'Middle East',
  'South America',
  'Central America',
  'Caribbean',
  'Africa',
  'Central Asia',
  'Other',
];

interface DestinationsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: DestinationsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'destinations' });

  const title = t('pageTitle');
  const description = t('pageDescription');

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/destinations`,
      languages: {
        'x-default': `${BASE_URL}/en-au/destinations`,
        'en-AU': `${BASE_URL}/en-au/destinations`,
        'en-SG': `${BASE_URL}/en-sg/destinations`,
        'en-GB': `${BASE_URL}/en-gb/destinations`,
        'en-US': `${BASE_URL}/en-us/destinations`,
        'ms-MY': `${BASE_URL}/ms-my/destinations`,
        'id-ID': `${BASE_URL}/id-id/destinations`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/destinations`,
      type: 'website',
    },
  };
}

export default async function DestinationsPage({ params }: DestinationsPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'destinations' });

  // Fetch all destinations with their plans for the current locale
  const destinations = await withRetry(() =>
    prisma.destination.findMany({
      where: { locale },
      orderBy: { name: 'asc' },
    })
  );

  // Fetch all plans for this locale
  const plans = await withRetry(() =>
    prisma.plan.findMany({
      where: { locale },
    })
  );

  // Create a map of destination slug to plan
  const planMap = new Map(plans.map(p => [p.destination_slug, p]));

  // Get currency info from the first plan
  const firstPlan = plans[0];
  const currency = firstPlan?.currency || 'AUD';
  const currencySymbol = currency === 'IDR' ? 'Rp' : currency === 'GBP' ? '£' : '$';

  // Group destinations by region from database
  const destinationsByRegion: Record<string, typeof destinations> = {};
  for (const dest of destinations) {
    const region = dest.region || 'Other';
    if (!destinationsByRegion[region]) {
      destinationsByRegion[region] = [];
    }
    destinationsByRegion[region].push(dest);
  }

  // Sort regions by preferred order
  const sortedRegions = Object.keys(destinationsByRegion).sort((a, b) => {
    const aIndex = REGION_ORDER.indexOf(a);
    const bIndex = REGION_ORDER.indexOf(b);
    // If not in order list, put at the end
    if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-18">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-cream-200 via-cream-100 to-white py-16 md:py-24">
          {/* Decorative background */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99 191 191 / 0.2) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />

          {/* Floating elements */}
          <div className="absolute top-20 left-10 w-16 h-16 rounded-full bg-brand-200/40 blur-2xl" />
          <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-accent-200/30 blur-3xl" />

          <div className="container-wide relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-700 rounded-full text-sm font-medium mb-6">
                <Globe className="w-4 h-4" />
                {t('badge')}
              </div>

              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-4">
                {t('title')}
              </h1>

              <p className="text-body-lg text-navy-300 max-w-2xl mx-auto mb-8">
                {t('subtitle')}
              </p>

              {/* Quick stats */}
              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2 text-navy-400">
                  <Star className="w-5 h-5 text-accent-500 fill-accent-500" />
                  <span className="font-medium">{t('stats.rating')}</span>
                </div>
                <div className="flex items-center gap-2 text-navy-400">
                  <Zap className="w-5 h-5 text-brand-500" />
                  <span className="font-medium">{t('stats.instant')}</span>
                </div>
                <div className="flex items-center gap-2 text-navy-400">
                  <Shield className="w-5 h-5 text-success-500" />
                  <span className="font-medium">{t('stats.guarantee')}</span>
                </div>
              </div>

              {/* Total destinations count */}
              <p className="text-navy-400 mt-6">
                {destinations.length} {t('countriesAvailable')}
              </p>
            </div>
          </div>

          {/* Bottom gradient */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* Destinations by Region */}
        {sortedRegions.map((region) => {
          const regionDestinations = destinationsByRegion[region];
          if (!regionDestinations || regionDestinations.length === 0) return null;

          return (
            <section key={region} className="py-12 bg-white even:bg-cream-50">
              <div className="container-wide">
                <div className="flex items-center gap-3 mb-8">
                  <h2 className="text-heading-xl font-bold text-navy-500">
                    {region}
                  </h2>
                  <span className="px-3 py-1 bg-cream-100 text-navy-400 text-sm rounded-full">
                    {regionDestinations.length} {regionDestinations.length === 1 ? t('country') : t('countries')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {regionDestinations.map((destination) => {
                    const plan = planMap.get(destination.slug);
                    const FlagIcon = getFlagComponent(destination.country_iso);
                    const isExcluded = isDestinationExcluded(destination.slug, locale);

                    if (isExcluded) {
                      return (
                        <div key={destination.slug} className="relative group h-full">
                          <div className="bg-cream-50 rounded-2xl p-6 border border-cream-200 opacity-50 cursor-not-allowed h-full flex flex-col">
                            {/* Flag */}
                            <div className="mb-4 relative">
                              <FlagIcon className="w-16 h-auto rounded-lg shadow-soft grayscale" />
                            </div>

                            {/* Info */}
                            <h3 className="text-lg font-semibold text-gray-400 mb-1">
                              {destination.name}
                            </h3>

                            <p className="text-body-sm text-gray-400 flex items-center gap-1">
                              <Info className="w-3.5 h-3.5" />
                              You&apos;re here!
                            </p>

                            {/* Spacer to fill remaining height */}
                            <div className="flex-grow" />
                          </div>
                          {/* Tooltip */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            <div className="bg-navy-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                              You don&apos;t need an eSIM for your home country
                            </div>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={destination.slug}
                        href={`/${destination.slug}`}
                        className="group h-full"
                      >
                        <div className="bg-white rounded-2xl p-6 border border-cream-200 hover:border-brand-300 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                          {/* Flag */}
                          <div className="mb-4 relative">
                            <FlagIcon className="w-16 h-auto rounded-lg shadow-soft group-hover:scale-105 transition-transform duration-300" />
                          </div>

                          {/* Info */}
                          <h3 className="text-lg font-semibold text-navy-500 mb-1 group-hover:text-brand-600 transition-colors">
                            {destination.name}
                          </h3>

                          {destination.tagline && (
                            <p className="text-body-sm text-navy-400 line-clamp-2 mb-4">
                              {destination.tagline}
                            </p>
                          )}

                          {/* Price - show best daily rate from any duration */}
                          {plan?.best_daily_rate && (
                            <div className="flex items-baseline gap-2">
                              <span className="text-navy-400 text-sm">{t('from')}</span>
                              <span className="text-xl font-bold text-brand-600">
                                {currencySymbol}{formatPrice(plan.best_daily_rate, currency)}
                              </span>
                              <span className="text-navy-400 text-sm">/day</span>
                            </div>
                          )}

                          {/* Spacer to push CTA to bottom */}
                          <div className="flex-grow" />

                          {/* CTA */}
                          <div className="flex items-center gap-2 text-brand-600 font-medium text-sm group-hover:gap-3 transition-all mt-4">
                            {t('viewPlans')}
                            <ArrowRight className="w-4 h-4" />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-navy-500 via-navy-500 to-navy-400 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent-400/10 blur-3xl" />

          <div className="container-wide relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-heading-xl md:text-display font-bold text-cream-50 mb-4">
                {t('cta.title')}
              </h2>
              <p className="text-cream-300 text-lg mb-8">
                {t('cta.subtitle')}
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-500/25 transition-all"
              >
                {t('cta.button')}
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
