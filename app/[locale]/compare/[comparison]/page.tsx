import { Metadata } from 'next';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { Link } from '@/i18n/routing';
import {
  Check,
  X,
  ArrowRight,
  Calculator,
  TrendingDown,
  Zap,
  Wifi,
  Shield,
  Clock,
  Phone,
} from 'lucide-react';
import { DurationOption } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

// Parse comparison slug: "{carrier}-vs-esim-{destination}"
function parseComparisonSlug(slug: string): { carrier: string; destination: string } | null {
  const match = slug.match(/^(.+)-vs-esim-(.+)$/);
  if (!match) return null;
  return { carrier: match[1], destination: match[2] };
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

// Carrier display names
const CARRIER_NAMES: Record<string, string> = {
  telstra: 'Telstra',
  att: 'AT&T',
  singtel: 'Singtel',
  ee: 'EE',
  maxis: 'Maxis',
  telkomsel: 'Telkomsel',
};

// Locale to carrier mapping
const LOCALE_CARRIERS: Record<string, string> = {
  'en-au': 'telstra',
  'en-us': 'att',
  'en-sg': 'singtel',
  'en-gb': 'ee',
  'ms-my': 'maxis',
  'id-id': 'telkomsel',
};

interface ComparisonPageProps {
  params: Promise<{
    locale: string;
    comparison: string;
  }>;
}

export async function generateMetadata({ params }: ComparisonPageProps): Promise<Metadata> {
  const { locale, comparison } = await params;
  const parsed = parseComparisonSlug(comparison);

  if (!parsed) {
    return { title: 'Comparison Not Found' };
  }

  const carrierName = CARRIER_NAMES[parsed.carrier] || parsed.carrier;

  // Use try-catch to handle missing data gracefully
  try {
    const destinationData = await prisma.destination.findUnique({
      where: { slug_locale: { slug: parsed.destination, locale } },
    });

    if (!destinationData) {
      return { title: `${carrierName} Roaming vs eSIM | Trvel` };
    }

    const title = `${carrierName} Roaming vs eSIM for ${destinationData.name} | Save Money`;
    const description = `Compare ${carrierName} international roaming prices vs Trvel eSIM for ${destinationData.name}. See how much you can save with an eSIM instead of carrier roaming.`;

    return {
      title,
      description,
      alternates: {
        canonical: `${BASE_URL}/${locale}/compare/${comparison}`,
      },
      openGraph: {
        title,
        description,
        url: `${BASE_URL}/${locale}/compare/${comparison}`,
        type: 'website',
      },
    };
  } catch {
    return { title: `${carrierName} Roaming vs eSIM | Trvel` };
  }
}

export default async function ComparisonPage({ params }: ComparisonPageProps) {
  const { locale, comparison } = await params;
  const parsed = parseComparisonSlug(comparison);

  if (!parsed) {
    notFound();
  }

  const { carrier, destination } = parsed;

  // Parallel database calls for better performance
  const [destinationData, planData] = await Promise.all([
    prisma.destination.findUnique({
      where: { slug_locale: { slug: destination, locale } },
    }),
    prisma.plan.findUnique({
      where: { destination_slug_locale: { destination_slug: destination, locale } },
    }),
  ]);

  if (!destinationData) {
    notFound();
  }

  // Fetch competitor data (depends on planData.currency)
  const competitorData = planData?.currency
    ? await prisma.competitor.findUnique({
        where: { currency: planData.currency },
      })
    : null;

  const carrierName = competitorData?.name || CARRIER_NAMES[carrier] || carrier;
  const currency = planData?.currency || 'AUD';
  const currencySymbol = currency === 'IDR' ? 'Rp' : currency === 'GBP' ? '£' : '$';

  // Calculate costs for 7 days (most common trip duration)
  const tripDays = 7;
  const carrierDailyCost = competitorData?.daily_rate ? Number(competitorData.daily_rate) : 20;
  const carrierTotalCost = carrierDailyCost * tripDays;

  // Get the 7-day plan price from durations array, or fallback to closest option
  const durations = (planData?.durations || []) as unknown as DurationOption[];
  const sevenDayPlan = durations.find(d => d.duration === 7);
  const closestPlan = !sevenDayPlan && durations.length > 0
    ? durations.reduce((prev, curr) => Math.abs(curr.duration - tripDays) < Math.abs(prev.duration - tripDays) ? curr : prev)
    : null;
  const comparisonPlan = sevenDayPlan || closestPlan;
  const esimCost = comparisonPlan?.retail_price || 0;
  const esimDailyRate = comparisonPlan?.daily_rate || (esimCost / tripDays);

  const savings = carrierTotalCost - esimCost;
  const savingsPercent = carrierTotalCost > 0 ? Math.round((savings / carrierTotalCost) * 100) : 0;

  // Feature comparison data
  const features = [
    { feature: 'Daily cost', carrier: `${currencySymbol}${formatPrice(carrierDailyCost, currency)}`, esim: `${currencySymbol}${formatPrice(esimDailyRate, currency)}`, esimWins: true },
    { feature: `${tripDays}-day total`, carrier: `${currencySymbol}${formatPrice(carrierTotalCost, currency)}`, esim: `${currencySymbol}${formatPrice(esimCost, currency)}`, esimWins: true },
    { feature: 'Data limit', carrier: 'Usually capped', esim: 'Unlimited', esimWins: true },
    { feature: 'Setup time', carrier: 'Auto on arrival', esim: '2 minutes', esimWins: true },
    { feature: 'Activate in advance', carrier: 'No', esim: 'Yes', esimWins: true },
    { feature: 'Bill shock risk', carrier: 'Yes', esim: 'No', esimWins: true },
    { feature: 'Keep your number', carrier: 'Yes', esim: 'Yes', esimWins: false },
    { feature: 'Receive calls/SMS', carrier: 'Yes', esim: 'Via WiFi apps', esimWins: false },
  ];

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
              <li className="text-navy-600 font-medium">Compare</li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-cream-200 via-cream-100 to-white py-16 md:py-20">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99 191 191 / 0.2) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />

          <div className="container-wide relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-success-100 text-success-700 rounded-full text-sm font-medium mb-6">
                <TrendingDown className="w-4 h-4" />
                Save {savingsPercent}% on your trip
              </div>

              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-4">
                {carrierName} Roaming vs eSIM
              </h1>
              <p className="text-body-lg text-navy-300 mb-3">
                for {destinationData.name}
              </p>

              <p className="text-heading-lg text-navy-400 max-w-2xl mx-auto mb-8">
                Compare the cost of {carrierName} international roaming with a Trvel eSIM for your trip to {destinationData.name}.
              </p>

              {/* Savings highlight */}
              {savings > 0 && (
                <div className="inline-flex items-baseline gap-3 px-8 py-4 bg-white rounded-2xl shadow-soft-lg border border-cream-200">
                  <span className="text-navy-400">Save up to</span>
                  <span className="text-display font-bold text-success-600">
                    {currencySymbol}{formatPrice(savings, currency)}
                  </span>
                  <span className="text-navy-400">on a {tripDays}-day trip</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Cost Calculator */}
        <section className="py-16 bg-white">
          <div className="container-wide">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-heading-xl font-bold text-navy-500 mb-3 flex items-center justify-center gap-3">
                  <Calculator className="w-7 h-7 text-brand-500" />
                  Cost Comparison ({tripDays}-Day Trip)
                </h2>
              </div>

              {/* Comparison cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {/* Carrier card */}
                <div className="p-6 bg-cream-50 rounded-2xl border border-cream-200">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-navy-500">{carrierName} Roaming</h3>
                    <span className="px-3 py-1 bg-cream-200 text-navy-500 rounded-full text-sm">Traditional</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-navy-400">Daily rate</span>
                      <span className="font-semibold text-navy-500">{currencySymbol}{formatPrice(carrierDailyCost, currency)}/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-400">{tripDays} days total</span>
                      <span className="font-bold text-xl text-navy-500">{currencySymbol}{formatPrice(carrierTotalCost, currency)}</span>
                    </div>
                  </div>
                </div>

                {/* eSIM card */}
                <div className="p-6 bg-brand-50 rounded-2xl border-2 border-brand-300 relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-brand-500 text-white rounded-full text-xs font-semibold">
                    RECOMMENDED
                  </div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-navy-500">Trvel eSIM</h3>
                    <span className="px-3 py-1 bg-brand-200 text-brand-700 rounded-full text-sm">Smart Choice</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-navy-400">Daily rate</span>
                      <span className="font-semibold text-navy-500">{currencySymbol}{formatPrice(esimDailyRate, currency)}/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy-400">{tripDays} days total</span>
                      <span className="font-bold text-xl text-brand-600">{currencySymbol}{formatPrice(esimCost, currency)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Your savings */}
              {savings > 0 && (
                <div className="p-6 bg-success-50 rounded-2xl border border-success-200 text-center">
                  <p className="text-success-700 font-medium mb-2">Your savings with Trvel eSIM</p>
                  <p className="text-3xl font-bold text-success-600">
                    {currencySymbol}{formatPrice(savings, currency)}
                  </p>
                  <p className="text-success-600 text-sm mt-1">That&apos;s {savingsPercent}% less than {carrierName} roaming</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Feature Comparison Table */}
        <section className="py-16 bg-cream-50">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-heading-xl font-bold text-navy-500 mb-8 text-center">
                Feature Comparison
              </h2>

              <div className="bg-white rounded-2xl border border-cream-200 overflow-hidden">
                {/* Table header */}
                <div className="grid grid-cols-3 bg-cream-100 border-b border-cream-200">
                  <div className="p-4 font-semibold text-navy-500">Feature</div>
                  <div className="p-4 font-semibold text-navy-500 text-center">{carrierName}</div>
                  <div className="p-4 font-semibold text-brand-600 text-center">Trvel eSIM</div>
                </div>

                {/* Table rows */}
                {features.map((row, index) => (
                  <div
                    key={index}
                    className={`grid grid-cols-3 ${index < features.length - 1 ? 'border-b border-cream-200' : ''}`}
                  >
                    <div className="p-4 text-navy-500 font-medium">{row.feature}</div>
                    <div className="p-4 text-center text-navy-400">{row.carrier}</div>
                    <div className={`p-4 text-center font-medium ${row.esimWins ? 'text-success-600' : 'text-navy-500'}`}>
                      {row.esim}
                      {row.esimWins && <Check className="w-4 h-4 inline ml-1 text-success-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why eSIM is better */}
        <section className="py-16 bg-white">
          <div className="container-wide">
            <h2 className="text-heading-xl font-bold text-navy-500 mb-10 text-center">
              Why Choose eSIM Over {carrierName} Roaming
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {[
                { icon: TrendingDown, title: 'Save Money', description: `Save ${savingsPercent}% compared to ${carrierName} daily roaming rates` },
                { icon: Wifi, title: 'Unlimited Data', description: 'No data caps or throttling, unlike carrier roaming packages' },
                { icon: Shield, title: 'No Bill Shock', description: 'Pay upfront, avoid surprise charges on your next bill' },
                { icon: Zap, title: 'Instant Setup', description: 'Activate before you travel, connect on arrival' },
              ].map((item, index) => (
                <div
                  key={index}
                  className="p-6 bg-cream-50 rounded-xl border border-cream-200"
                >
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-navy-500 mb-2">{item.title}</h3>
                  <p className="text-navy-400 text-sm">{item.description}</p>
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
                Ready to Save {currencySymbol}{formatPrice(savings, currency)}?
              </h2>
              <p className="text-cream-300 text-lg mb-8">
                Get your {destinationData.name} eSIM now. Skip {carrierName} roaming charges and enjoy unlimited data.
              </p>
              <Link
                href={`/${destination}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-500/25 transition-all"
              >
                Get {destinationData.name} eSIM
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

// Generate static params for common comparisons
export async function generateStaticParams() {
  try {
    const destinations = await prisma.destination.findMany({
      select: { slug: true, locale: true },
    });

    const params: { locale: string; comparison: string }[] = [];

    for (const dest of destinations) {
      const carrier = LOCALE_CARRIERS[dest.locale];
      if (carrier) {
        params.push({
          locale: dest.locale,
          comparison: `${carrier}-vs-esim-${dest.slug}`,
        });
      }
    }

    return params;
  } catch (error) {
    console.log('generateStaticParams: Database unavailable, using dynamic rendering');
    return [];
  }
}
