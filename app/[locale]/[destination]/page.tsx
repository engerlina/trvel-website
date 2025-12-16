import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
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
} from 'lucide-react';
import { DestinationPlanCard } from './DestinationPlanCard';
import {
  JP, TH, KR, SG, ID, MY, VN, PH, GB, FR, IT, US,
  type FlagComponent,
} from 'country-flag-icons/react/3x2';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://trvel.co';

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

// Map slugs to flag components
const flagMap: Record<string, FlagComponent> = {
  'japan': JP,
  'thailand': TH,
  'south-korea': KR,
  'singapore': SG,
  'indonesia': ID,
  'malaysia': MY,
  'vietnam': VN,
  'philippines': PH,
  'united-kingdom': GB,
  'france': FR,
  'italy': IT,
  'united-states': US,
};

interface DestinationPageProps {
  params: Promise<{
    locale: string;
    destination: string;
  }>;
}

export async function generateMetadata({ params }: DestinationPageProps): Promise<Metadata> {
  const { locale, destination } = await params;

  const destinationData = await prisma.destination.findUnique({
    where: {
      slug_locale: { slug: destination, locale },
    },
  });

  if (!destinationData) {
    return { title: 'Destination Not Found' };
  }

  const planData = await prisma.plan.findUnique({
    where: {
      destination_slug_locale: { destination_slug: destination, locale },
    },
  });

  // Calculate daily rate from 15-day plan for best value display
  const dailyRate = planData?.price_15day ? (Number(planData.price_15day) / 15).toFixed(2) : '';
  const currencySymbol = planData?.currency === 'IDR' ? 'Rp' : planData?.currency === 'GBP' ? '£' : '$';
  const title = dailyRate
    ? `${destinationData.name} eSIM | From ${currencySymbol}${dailyRate}/day`
    : `${destinationData.name} eSIM | Unlimited Data`;
  const description = destinationData.tagline || `Get unlimited data eSIM for ${destinationData.name}. Instant activation, premium networks, human support.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/${destination}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/${destination}`,
      type: 'website',
    },
  };
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { locale, destination } = await params;
  const t = await getTranslations({ locale, namespace: 'destination' });

  const destinationData = await prisma.destination.findUnique({
    where: {
      slug_locale: { slug: destination, locale },
    },
  });

  const planData = await prisma.plan.findUnique({
    where: {
      destination_slug_locale: { destination_slug: destination, locale },
    },
  });

  // Fetch competitor data based on plan currency
  const competitorData = planData?.currency
    ? await prisma.competitor.findUnique({
        where: { currency: planData.currency },
      })
    : null;

  if (!destinationData) {
    notFound();
  }

  const FlagIcon = flagMap[destination] || Globe;

  const features = [
    { icon: Zap, title: 'Instant Activation', description: 'Scan QR code and connect in under 2 minutes' },
    { icon: Wifi, title: 'Unlimited Data', description: 'No throttling, no data caps, no surprises' },
    { icon: Signal, title: 'Premium Network', description: 'Connected to tier-1 local carriers' },
    { icon: Shield, title: '10-Min Guarantee', description: 'Connect in 10 minutes or full refund' },
    { icon: MessageCircle, title: 'Human Support', description: 'Real people on WhatsApp 24/7' },
    { icon: Smartphone, title: 'Keep Your Number', description: 'Works alongside your existing SIM' },
  ];

  const currency = planData?.currency || 'AUD';

  const plans = [
    {
      name: '5 Day',
      duration: 5,
      price: formatPrice(planData?.price_5day, currency),
      perDay: formatPrice(planData?.price_5day ? Number(planData.price_5day) / 5 : null, currency),
      popular: false,
    },
    {
      name: '7 Day',
      duration: 7,
      price: formatPrice(planData?.price_7day, currency),
      perDay: formatPrice(planData?.price_7day ? Number(planData.price_7day) / 7 : null, currency),
      popular: true,
    },
    {
      name: '15 Day',
      duration: 15,
      price: formatPrice(planData?.price_15day, currency),
      perDay: formatPrice(planData?.price_15day ? Number(planData.price_15day) / 15 : null, currency),
      popular: false,
    },
  ];
  const currencySymbol = currency === 'IDR' ? 'Rp' : currency === 'GBP' ? '£' : '$';

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-18">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-cream-200 via-cream-100 to-white py-20 md:py-28">
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
            <div className="max-w-4xl mx-auto text-center">
              {/* Flag */}
              <div className="inline-flex items-center justify-center mb-8">
                <div className="relative">
                  <FlagIcon className="w-24 h-auto rounded-lg shadow-soft-lg" />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center shadow-lg">
                    <Check className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-4">
                {destinationData.name} eSIM
              </h1>

              {/* Tagline */}
              {destinationData.tagline && (
                <p className="text-body-lg text-navy-300 max-w-2xl mx-auto mb-8">
                  {destinationData.tagline}
                </p>
              )}

              {/* Quick stats */}
              <div className="flex flex-wrap justify-center gap-6 mb-10">
                <div className="flex items-center gap-2 text-navy-400">
                  <Star className="w-5 h-5 text-accent-500 fill-accent-500" />
                  <span className="font-medium">4.9/5 rating</span>
                </div>
                <div className="flex items-center gap-2 text-navy-400">
                  <Clock className="w-5 h-5 text-brand-500" />
                  <span className="font-medium">2 min setup</span>
                </div>
                <div className="flex items-center gap-2 text-navy-400">
                  <Shield className="w-5 h-5 text-success-500" />
                  <span className="font-medium">Money-back guarantee</span>
                </div>
              </div>

              {/* Starting price - show lowest daily rate (15-day plan) */}
              {planData?.price_15day && (
                <div className="inline-flex items-baseline gap-2 px-6 py-3 bg-white rounded-2xl shadow-soft-lg">
                  <span className="text-navy-400">Starting from</span>
                  <span className="text-heading-xl font-bold text-navy-500">
                    {currencySymbol}{formatPrice(Number(planData.price_15day) / 15, currency)}
                  </span>
                  <span className="text-navy-400">/day</span>
                </div>
              )}
            </div>
          </div>

          {/* Bottom wave */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* Plans Section */}
        <section id="plans" className="py-20 bg-white">
          <div className="container-wide">
            <div className="text-center mb-12">
              <h2 className="text-heading-xl md:text-display font-bold text-navy-500 mb-4">
                Choose Your Plan
              </h2>
              <p className="text-body-lg text-navy-300">
                All plans include unlimited data, premium network access, and 24/7 support
              </p>
            </div>

            {/* Plan cards */}
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

            {/* Competitor comparison */}
            {competitorData && (
              <div className="mt-12 text-center">
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

        {/* Features Section */}
        <section className="py-20 bg-cream-50">
          <div className="container-wide">
            <div className="text-center mb-12">
              <h2 className="text-heading-xl font-bold text-navy-500 mb-4">
                Why Choose Trvel
              </h2>
              <p className="text-body-lg text-navy-300">
                Everything you need for seamless connectivity in {destinationData.name}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-6 border border-cream-200 hover:border-brand-200 hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-navy-500 mb-2">{feature.title}</h3>
                  <p className="text-navy-400">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-white">
          <div className="container-wide">
            <div className="text-center mb-12">
              <h2 className="text-heading-xl font-bold text-navy-500 mb-4">
                Get Connected in 3 Steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {[
                { step: '1', title: 'Purchase', description: 'Choose your plan and complete checkout in under 60 seconds' },
                { step: '2', title: 'Scan', description: 'Receive your QR code instantly via email and scan it' },
                { step: '3', title: 'Connect', description: 'Enable data roaming when you land and you\'re online!' },
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-brand-500/25">
                    <span className="text-2xl font-bold text-white">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-navy-500 mb-2">{item.title}</h3>
                  <p className="text-navy-400">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-br from-navy-500 via-navy-500 to-navy-400 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent-400/10 blur-3xl" />

          <div className="container-wide relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-heading-xl md:text-display font-bold text-cream-50 mb-4">
                Ready for {destinationData.name}?
              </h2>
              <p className="text-cream-300 text-lg mb-8">
                Get your eSIM now and be connected the moment you land. Instant delivery, premium network, human support.
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

// Generate static params for all destinations
// Returns empty array if database is unavailable (e.g., during Vercel build)
// Pages will be generated on-demand with ISR
export async function generateStaticParams() {
  try {
    const destinations = await prisma.destination.findMany({
      select: { slug: true, locale: true },
      distinct: ['slug', 'locale'],
    });

    return destinations.map((dest) => ({
      locale: dest.locale,
      destination: dest.slug,
    }));
  } catch (error) {
    // Database unavailable during build - pages will render dynamically
    console.log('generateStaticParams: Database unavailable, using dynamic rendering');
    return [];
  }
}
