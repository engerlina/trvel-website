import { Metadata } from 'next';
import { prisma, withRetry } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { Link } from '@/i18n/routing';
import {
  Check,
  Zap,
  Globe,
  Shield,
  Clock,
  MessageCircle,
  Smartphone,
  Wifi,
  Signal,
  ArrowRight,
  Star,
  MapPin,
  Plane,
  Users,
} from 'lucide-react';
import { DestinationPlanCard } from '../DestinationPlanCard';
import {
  JP, TH, KR, SG, ID, MY, VN, PH, GB, FR, IT, US, AU, ES, GR, CN, TW,
  type FlagComponent,
} from 'country-flag-icons/react/3x2';
import { DurationOption } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

function formatPrice(price: unknown, currency: string): string {
  if (price === null || price === undefined) return '—';
  const num = typeof price === 'object' && price !== null && 'toNumber' in price
    ? (price as { toNumber: () => number }).toNumber()
    : typeof price === 'string'
      ? parseFloat(price)
      : Number(price);
  if (isNaN(num)) return '—';
  if (currency === 'IDR') return Math.round(num).toLocaleString('id-ID');
  return num.toFixed(2);
}

const flagMap: Record<string, FlagComponent> = {
  'JP': JP, 'TH': TH, 'KR': KR, 'SG': SG, 'ID': ID, 'MY': MY, 'VN': VN,
  'PH': PH, 'GB': GB, 'FR': FR, 'IT': IT, 'US': US, 'AU': AU, 'ES': ES,
  'GR': GR, 'CN': CN, 'TW': TW,
};

interface CityPageProps {
  params: Promise<{
    locale: string;
    destination: string;
    city: string;
  }>;
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { locale, destination, city } = await params;

  const cityData = await withRetry(() =>
    prisma.city.findUnique({
      where: { slug_locale: { slug: city, locale } },
      include: { destination: true },
    })
  );

  if (!cityData) {
    return { title: 'City Not Found' };
  }

  const planData = await withRetry(() =>
    prisma.plan.findUnique({
      where: { destination_slug_locale: { destination_slug: destination, locale } },
    })
  );

  const dailyRate = planData?.best_daily_rate ? formatPrice(planData.best_daily_rate, planData.currency) : '';
  const currencySymbol = planData?.currency === 'IDR' ? 'Rp' : planData?.currency === 'GBP' ? '£' : '$';

  const title = dailyRate
    ? `${cityData.name} eSIM | Data Plans from ${currencySymbol}${dailyRate}/day`
    : `${cityData.name} eSIM | Unlimited Data Plans`;

  const description = `Get unlimited data eSIM for ${cityData.name}. ${cityData.connectivity_notes?.substring(0, 100) || 'Instant activation, premium networks.'} Works at ${cityData.airport_name || 'the airport'}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/${destination}/${city}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/${destination}/${city}`,
      type: 'website',
    },
  };
}

export default async function CityPage({ params }: CityPageProps) {
  const { locale, destination, city } = await params;

  const cityData = await withRetry(() =>
    prisma.city.findUnique({
      where: { slug_locale: { slug: city, locale } },
      include: { destination: true },
    })
  );

  if (!cityData) {
    notFound();
  }

  const destinationData = cityData.destination || await withRetry(() =>
    prisma.destination.findUnique({
      where: { slug_locale: { slug: destination, locale } },
    })
  );

  if (!destinationData) {
    notFound();
  }

  const planData = await withRetry(() =>
    prisma.plan.findUnique({
      where: { destination_slug_locale: { destination_slug: destination, locale } },
    })
  );

  const competitorData = planData?.currency
    ? await withRetry(() =>
        prisma.competitor.findUnique({
          where: { currency: planData.currency },
        })
      )
    : null;

  // Get other cities in this destination for internal linking
  const otherCities = await withRetry(() =>
    prisma.city.findMany({
      where: {
        locale,
        destination_id: destinationData.id,
        NOT: { slug: city },
      },
      take: 5,
    })
  );

  const FlagIcon = flagMap[cityData.country_iso] || Globe;
  const currency = planData?.currency || 'AUD';
  const currencySymbol = currency === 'IDR' ? 'Rp' : currency === 'GBP' ? '£' : '$';

  // Get plans from durations array
  const durations = (planData?.durations || []) as unknown as DurationOption[];
  const defaultDurations = planData?.default_durations || [];

  // Use default durations if available, otherwise show first 3
  const plansToShow = defaultDurations.length > 0
    ? durations.filter(d => defaultDurations.includes(d.duration))
    : durations.slice(0, 3);

  const plans = plansToShow.map(d => ({
    name: `${d.duration} Day`,
    duration: d.duration,
    price: formatPrice(d.retail_price, currency),
    perDay: formatPrice(d.daily_rate, currency),
    popular: d.duration === 7,
  }));

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-18">
        {/* Breadcrumb */}
        <nav className="bg-cream-100 py-3 border-b border-cream-200">
          <div className="container-wide">
            <ol className="flex items-center gap-2 text-sm text-navy-400">
              <li>
                <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
              </li>
              <li>/</li>
              <li>
                <Link href={`/${destination}`} className="hover:text-brand-600 transition-colors">
                  {destinationData.name}
                </Link>
              </li>
              <li>/</li>
              <li className="text-navy-600 font-medium">{cityData.name}</li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-cream-200 via-cream-100 to-white py-16 md:py-24">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99 191 191 / 0.2) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />

          <div className="container-wide relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center justify-center mb-6">
                <div className="relative">
                  <FlagIcon className="w-20 h-auto rounded-lg shadow-soft-lg" />
                  <div className="absolute -bottom-2 -right-2 w-7 h-7 rounded-full bg-brand-500 flex items-center justify-center shadow-lg">
                    <Check className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>

              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-3">
                {cityData.name} eSIM
              </h1>

              <p className="text-body-lg text-navy-300 max-w-2xl mx-auto mb-6">
                Stay connected in {cityData.name} with unlimited data. Works instantly at {cityData.airport_name || 'the airport'}.
              </p>

              {/* City stats */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                {cityData.airport_code && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-soft">
                    <Plane className="w-4 h-4 text-brand-500" />
                    <span className="text-sm font-medium text-navy-500">{cityData.airport_code}</span>
                  </div>
                )}
                {cityData.network_quality && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-soft">
                    <Signal className="w-4 h-4 text-success-500" />
                    <span className="text-sm font-medium text-navy-500">
                      {cityData.network_quality}/5 Network
                    </span>
                  </div>
                )}
                {cityData.population && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-soft">
                    <Users className="w-4 h-4 text-accent-500" />
                    <span className="text-sm font-medium text-navy-500">
                      {(cityData.population / 1000000).toFixed(1)}M people
                    </span>
                  </div>
                )}
              </div>

              {planData?.best_daily_rate && (
                <div className="inline-flex items-baseline gap-2 px-6 py-3 bg-white rounded-2xl shadow-soft-lg">
                  <span className="text-navy-400">From</span>
                  <span className="text-heading-xl font-bold text-navy-500">
                    {currencySymbol}{formatPrice(planData.best_daily_rate, currency)}
                  </span>
                  <span className="text-navy-400">/day</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Connectivity Info */}
        {cityData.connectivity_notes && (
          <section className="py-12 bg-white border-b border-cream-200">
            <div className="container-wide">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-heading-lg font-bold text-navy-500 mb-4 flex items-center gap-3">
                  <Signal className="w-6 h-6 text-brand-500" />
                  Network Coverage in {cityData.name}
                </h2>
                <p className="text-navy-400 text-lg leading-relaxed">
                  {cityData.connectivity_notes}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Popular Areas */}
        {cityData.popular_areas && cityData.popular_areas.length > 0 && (
          <section className="py-12 bg-cream-50">
            <div className="container-wide">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-heading-lg font-bold text-navy-500 mb-6 flex items-center gap-3">
                  <MapPin className="w-6 h-6 text-accent-500" />
                  Popular Areas with Great Coverage
                </h2>
                <div className="flex flex-wrap gap-3">
                  {cityData.popular_areas.map((area, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-white rounded-full border border-cream-200 text-navy-500 font-medium shadow-soft"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Plans Section */}
        <section id="plans" className="py-16 bg-white">
          <div className="container-wide">
            <div className="text-center mb-10">
              <h2 className="text-heading-xl font-bold text-navy-500 mb-3">
                {cityData.name} eSIM Plans
              </h2>
              <p className="text-body-lg text-navy-300">
                Unlimited data plans for your trip to {cityData.name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {plans.map((plan) => (
                <DestinationPlanCard
                  key={plan.name}
                  name={plan.name}
                  price={plan.price}
                  perDay={plan.perDay}
                  popular={plan.popular}
                  currencySymbol={currencySymbol}
                  destination={destination}
                  duration={plan.duration}
                  locale={locale}
                />
              ))}
            </div>

            {competitorData && (
              <div className="mt-10 text-center">
                <p className="text-navy-400">
                  Compare to {competitorData.name} roaming at{' '}
                  <span className="font-semibold text-navy-500">
                    {currencySymbol}{formatPrice(competitorData.daily_rate, currency)}/day
                  </span>
                </p>
              </div>
            )}
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 bg-cream-50">
          <div className="container-wide">
            <div className="text-center mb-10">
              <h2 className="text-heading-xl font-bold text-navy-500 mb-3">
                How to Get Connected in {cityData.name}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: '1', title: 'Buy Before You Fly', description: `Purchase your ${cityData.name} eSIM before departure` },
                { step: '2', title: 'Scan at the Airport', description: `Scan your QR code when you land at ${cityData.airport_name || cityData.name}` },
                { step: '3', title: 'Explore Connected', description: `Enable data roaming and explore ${cityData.popular_areas?.[0] || cityData.name} with unlimited data` },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/25">
                    <span className="text-xl font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-navy-500 mb-2">{item.title}</h3>
                  <p className="text-navy-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Other Cities */}
        {otherCities.length > 0 && (
          <section className="py-16 bg-white">
            <div className="container-wide">
              <h2 className="text-heading-lg font-bold text-navy-500 mb-6 text-center">
                Other Cities in {destinationData.name}
              </h2>
              <div className="flex flex-wrap justify-center gap-4">
                {otherCities.map((otherCity) => (
                  <Link
                    key={otherCity.slug}
                    href={`/${destination}/${otherCity.slug}`}
                    className="px-6 py-3 bg-cream-100 hover:bg-brand-100 rounded-xl border border-cream-200 hover:border-brand-300 text-navy-500 font-medium transition-all"
                  >
                    {otherCity.name} eSIM
                  </Link>
                ))}
              </div>
              <div className="text-center mt-6">
                <Link
                  href={`/${destination}`}
                  className="text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
                >
                  View all {destinationData.name} plans
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-navy-500 via-navy-500 to-navy-400 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent-400/10 blur-3xl" />

          <div className="container-wide relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-heading-xl font-bold text-cream-50 mb-4">
                Ready for {cityData.name}?
              </h2>
              <p className="text-cream-300 text-lg mb-8">
                Get your eSIM now and be connected the moment you land at {cityData.airport_name || cityData.name}.
              </p>
              <Link
                href="#plans"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-500/25 transition-all"
              >
                Get Your eSIM
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

// Generate static params for all cities
export async function generateStaticParams() {
  try {
    const cities = await withRetry(() =>
      prisma.city.findMany({
        select: { slug: true, locale: true, destination: { select: { slug: true } } },
      })
    );

    return cities
      .filter((city) => city.destination)
      .map((city) => ({
        locale: city.locale,
        destination: city.destination!.slug,
        city: city.slug,
      }));
  } catch (error) {
    console.log('generateStaticParams: Database unavailable, using dynamic rendering');
    return [];
  }
}
