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
  Calendar,
  ArrowRight,
  Star,
  Wifi,
  Signal,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
} from 'lucide-react';
import { DestinationPlanCard } from '@/app/[locale]/[destination]/DestinationPlanCard';
import {
  JP, TH, KR, SG, ID, MY, VN, PH, GB, FR, IT, US, AU, ES, GR, CN, TW,
  type FlagComponent,
} from 'country-flag-icons/react/3x2';
import { DurationOption } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

// Parse duration from slug (e.g., "7-day" -> 7)
function parseDuration(slug: string): number | null {
  const match = slug.match(/^(\d+)-day$/);
  if (!match) return null;
  const days = parseInt(match[1], 10);
  return days > 0 ? days : null;
}

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
  'japan': JP, 'thailand': TH, 'south-korea': KR, 'singapore': SG,
  'indonesia': ID, 'malaysia': MY, 'vietnam': VN, 'philippines': PH,
  'united-kingdom': GB, 'france': FR, 'italy': IT, 'united-states': US,
  'australia': AU, 'spain': ES, 'greece': GR, 'china': CN, 'taiwan': TW,
};

// Duration-specific icons and descriptions
function getDurationInfo(days: number): {
  icon: typeof CalendarDays;
  tripType: string;
  description: string;
  useCases: string[];
} {
  if (days <= 3) {
    return {
      icon: CalendarDays,
      tripType: 'Quick Trip',
      description: 'Perfect for a quick getaway or weekend escape',
      useCases: ['Weekend trips', 'Business meetings', 'City breaks', 'Quick stopovers'],
    };
  }
  if (days <= 7) {
    return {
      icon: CalendarRange,
      tripType: 'Week Trip',
      description: 'Ideal for a full week of exploration and adventure',
      useCases: ['Holiday getaways', 'Cultural exploration', 'Relaxation trips', 'Family vacations'],
    };
  }
  if (days <= 15) {
    return {
      icon: CalendarCheck,
      tripType: 'Extended Stay',
      description: 'Best value for longer stays and deep exploration',
      useCases: ['Extended holidays', 'Remote work', 'Multi-city tours', 'Slow travel'],
    };
  }
  return {
    icon: CalendarCheck,
    tripType: 'Long Stay',
    description: 'Maximum value for extended stays',
    useCases: ['Extended holidays', 'Remote work', 'Multi-city tours', 'Digital nomads'],
  };
}

interface DurationPageProps {
  params: Promise<{
    locale: string;
    destination: string;
    duration: string;
  }>;
}

export async function generateMetadata({ params }: DurationPageProps): Promise<Metadata> {
  const { locale, destination, duration } = await params;

  const days = parseDuration(duration);
  if (!days) {
    return { title: 'Plan Not Found' };
  }

  const destinationData = await withRetry(() =>
    prisma.destination.findUnique({
      where: { slug_locale: { slug: destination, locale } },
    })
  );

  if (!destinationData) {
    return { title: 'Destination Not Found' };
  }

  const planData = await withRetry(() =>
    prisma.plan.findUnique({
      where: { destination_slug_locale: { destination_slug: destination, locale } },
    })
  );

  // Find price from durations array
  const durations = (planData?.durations || []) as unknown as DurationOption[];
  const selectedDuration = durations.find(d => d.duration === days);
  const price = selectedDuration?.retail_price || null;
  const currencySymbol = planData?.currency === 'IDR' ? 'Rp' : planData?.currency === 'GBP' ? '£' : '$';
  const currency = planData?.currency || 'AUD';

  const title = price
    ? `${destinationData.name} ${days}-Day eSIM | ${currencySymbol}${formatPrice(price, currency)}`
    : `${destinationData.name} ${days}-Day eSIM Plan`;

  const description = `Get a ${days}-day unlimited data eSIM for ${destinationData.name}. ${price ? `Only ${currencySymbol}${formatPrice(price, currency)} total.` : ''} Instant activation, premium networks, 24/7 support.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/esim/${destination}/${duration}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/esim/${destination}/${duration}`,
      type: 'website',
    },
  };
}

export default async function DurationPage({ params }: DurationPageProps) {
  const { locale, destination, duration } = await params;

  const days = parseDuration(duration);
  if (!days) {
    notFound();
  }

  const destinationData = await withRetry(() =>
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

  const FlagIcon = flagMap[destination] || Globe;
  const currency = planData?.currency || 'AUD';
  const currencySymbol = currency === 'IDR' ? 'Rp' : currency === 'GBP' ? '£' : '$';

  // Get price from durations array
  const durations = (planData?.durations || []) as unknown as DurationOption[];
  const selectedDuration = durations.find(d => d.duration === days);
  const price = selectedDuration?.retail_price || null;
  const perDay = price ? price / days : null;

  // If the requested duration is not available for this destination, show 404
  if (!selectedDuration && planData) {
    notFound();
  }

  const info = getDurationInfo(days);
  const DurationIcon = info.icon;

  // Other duration options for cross-linking (all available durations except current)
  const otherDurations = durations.filter(d => d.duration !== days);

  // Calculate competitor comparison for this duration
  const competitorCost = competitorData?.daily_rate ? Number(competitorData.daily_rate) * days : null;
  const savings = competitorCost && price ? competitorCost - Number(price) : null;

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
                  {destinationData.name} eSIM
                </Link>
              </li>
              <li>/</li>
              <li className="text-navy-600 font-medium">{days}-Day Plan</li>
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
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">{days}d</span>
                  </div>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 rounded-full text-brand-700 font-medium mb-4">
                <DurationIcon className="w-4 h-4" />
                {info.tripType}
              </div>

              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-3">
                {destinationData.name} {days}-Day eSIM
              </h1>

              <p className="text-body-lg text-navy-300 max-w-2xl mx-auto mb-6">
                {info.description}. Unlimited data for your entire {days}-day trip.
              </p>

              {/* Price highlight */}
              {price && (
                <div className="inline-flex flex-col items-center gap-2 px-8 py-5 bg-white rounded-2xl shadow-soft-lg mb-6">
                  <div className="flex items-baseline gap-2">
                    <span className="text-display font-bold text-navy-500">
                      {currencySymbol}{formatPrice(price, currency)}
                    </span>
                    <span className="text-navy-400">total</span>
                  </div>
                  {perDay && (
                    <p className="text-brand-600 font-medium">
                      {currencySymbol}{formatPrice(perDay, currency)}/day · Unlimited data
                    </p>
                  )}
                </div>
              )}

              {/* Quick stats */}
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-soft">
                  <Calendar className="w-4 h-4 text-brand-500" />
                  <span className="text-sm font-medium text-navy-500">{days} Days</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-soft">
                  <Wifi className="w-4 h-4 text-success-500" />
                  <span className="text-sm font-medium text-navy-500">Unlimited Data</span>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-soft">
                  <Zap className="w-4 h-4 text-accent-500" />
                  <span className="text-sm font-medium text-navy-500">Instant Setup</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className="py-12 bg-white border-b border-cream-200">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-heading-lg font-bold text-navy-500 mb-6 flex items-center gap-3">
                <DurationIcon className="w-6 h-6 text-brand-500" />
                Perfect For {days}-Day Trips
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {info.useCases.map((useCase, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-4 bg-cream-50 rounded-xl"
                  >
                    <Check className="w-5 h-5 text-success-500 flex-shrink-0" />
                    <span className="text-navy-500 font-medium">{useCase}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Savings Comparison */}
        {competitorData && savings && savings > 0 && (
          <section className="py-12 bg-success-50">
            <div className="container-wide">
              <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-heading-lg font-bold text-navy-500 mb-4">
                  Save {currencySymbol}{formatPrice(savings, currency)} vs {competitorData.name}
                </h2>
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white rounded-xl p-6 border border-cream-200">
                    <p className="text-sm text-navy-400 mb-2">{competitorData.name} Roaming ({days} days)</p>
                    <p className="text-heading-xl font-bold text-navy-300 line-through">
                      {currencySymbol}{formatPrice(competitorCost, currency)}
                    </p>
                  </div>
                  <div className="bg-white rounded-xl p-6 border-2 border-success-500">
                    <p className="text-sm text-navy-400 mb-2">Trvel eSIM ({days} days)</p>
                    <p className="text-heading-xl font-bold text-success-600">
                      {currencySymbol}{formatPrice(price, currency)}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/compare/${competitorData.name.toLowerCase()}-vs-esim-${destination}`}
                  className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium"
                >
                  See detailed comparison
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Main Plan Card */}
        <section id="plans" className="py-16 bg-white">
          <div className="container-wide">
            <div className="max-w-md mx-auto">
              <h2 className="text-heading-xl font-bold text-navy-500 mb-8 text-center">
                Get Your {days}-Day Plan
              </h2>
              <DestinationPlanCard
                name={`${days} Day`}
                price={formatPrice(price, currency)}
                perDay={formatPrice(perDay, currency)}
                popular={days === 7}
                currencySymbol={currencySymbol}
                destination={destination}
                duration={days}
                locale={locale}
              />
            </div>
          </div>
        </section>

        {/* Other Duration Options */}
        {otherDurations.length > 0 && (
          <section className="py-12 bg-cream-50">
            <div className="container-wide">
              <h2 className="text-heading-lg font-bold text-navy-500 mb-6 text-center">
                Other Duration Options
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                {otherDurations.map((durationOption) => {
                  const otherInfo = getDurationInfo(durationOption.duration);
                  const OtherIcon = otherInfo.icon;
                  return (
                    <Link
                      key={durationOption.duration}
                      href={`/esim/${destination}/${durationOption.duration}-day`}
                      className="flex items-center gap-4 p-5 bg-white rounded-xl border border-cream-200 hover:border-brand-300 hover:shadow-lg transition-all"
                    >
                      <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center flex-shrink-0">
                        <OtherIcon className="w-6 h-6 text-brand-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-navy-500">{durationOption.duration}-Day Plan</p>
                        <p className="text-sm text-navy-400">{otherInfo.tripType}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-navy-500">
                          {currencySymbol}{formatPrice(durationOption.retail_price, currency)}
                        </p>
                        <p className="text-xs text-navy-400">
                          {currencySymbol}{formatPrice(durationOption.daily_rate, currency)}/day
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-navy-300" />
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Features */}
        <section className="py-16 bg-white">
          <div className="container-wide">
            <h2 className="text-heading-xl font-bold text-navy-500 mb-10 text-center">
              What's Included in Your {days}-Day Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Wifi, title: 'Unlimited Data', description: `Full speed data for all ${days} days` },
                { icon: Signal, title: 'Premium Networks', description: `Connected to ${destinationData.name}'s best carriers` },
                { icon: Zap, title: 'Instant Activation', description: 'Scan QR code and connect in 2 minutes' },
                { icon: Shield, title: '10-Min Guarantee', description: 'Connect in 10 minutes or full refund' },
                { icon: Clock, title: `${days}-Day Validity`, description: `Valid for ${days} days from activation` },
                { icon: Star, title: '24/7 Support', description: 'Live chat & phone support anytime' },
              ].map((feature, index) => (
                <div
                  key={index}
                  className="bg-cream-50 rounded-xl p-6 border border-cream-200"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-navy-500 mb-2">{feature.title}</h3>
                  <p className="text-navy-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-navy-500 via-navy-500 to-navy-400 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent-400/10 blur-3xl" />

          <div className="container-wide relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-heading-xl font-bold text-cream-50 mb-4">
                Ready for Your {days}-Day {destinationData.name} Trip?
              </h2>
              <p className="text-cream-300 text-lg mb-8">
                Get your eSIM now and stay connected from the moment you land.
              </p>
              <Link
                href="#plans"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-500/25 transition-all"
              >
                Get {days}-Day eSIM
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

// Generate static params for all destination/duration combinations
export async function generateStaticParams() {
  try {
    // Get all plans with their available durations
    const plans = await withRetry(() =>
      prisma.plan.findMany({
        select: { destination_slug: true, locale: true, durations: true },
      })
    );

    const params: { locale: string; destination: string; duration: string }[] = [];

    for (const plan of plans) {
      const durations = (plan.durations || []) as unknown as DurationOption[];
      for (const durationOption of durations) {
        params.push({
          locale: plan.locale,
          destination: plan.destination_slug,
          duration: `${durationOption.duration}-day`,
        });
      }
    }

    return params;
  } catch (error) {
    console.log('generateStaticParams: Database unavailable, using dynamic rendering');
    return [];
  }
}
