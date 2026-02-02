import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import EmbeddedCheckout from './EmbeddedCheckout';
import { getCurrencySymbol } from '@/lib/pricing';
import { DurationOption } from '@/types';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ destination?: string; duration?: string; plan?: string; promo?: string }>;
}

// Parse plan parameter (e.g., "7-day" -> 7)
function parsePlanDuration(plan: string | undefined): number | null {
  if (!plan) return null;
  const match = plan.match(/^(\d+)-?day/i);
  return match ? parseInt(match[1], 10) : null;
}

// Get plan name based on duration
function getPlanName(days: number): string {
  if (days === 1) return '1 Day';
  if (days === 3) return '3 Days';
  if (days === 5) return '5 Days';
  if (days === 7) return '1 Week';
  if (days === 10) return '10 Days';
  if (days === 15) return '2 Weeks';
  if (days === 30) return '1 Month';
  return `${days} Days`;
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { destination, duration: durationStr, plan: planStr, promo } = await searchParams;
  const t = await getTranslations('checkout');
  const tPlans = await getTranslations('home.plans');

  // Parse duration from either `duration` or `plan` parameter
  const duration = durationStr
    ? parseInt(durationStr, 10)
    : parsePlanDuration(planStr);

  // Validate parameters - duration must be positive integer
  if (!destination || !duration || duration <= 0) {
    notFound();
  }

  // Fetch plan and destination info
  const [plan, destinationInfo] = await Promise.all([
    prisma.plan.findUnique({
      where: {
        destination_slug_locale: {
          destination_slug: destination,
          locale: locale,
        },
      },
    }),
    prisma.destination.findUnique({
      where: {
        slug_locale: {
          slug: destination,
          locale: locale,
        },
      },
    }),
  ]);

  if (!plan || !destinationInfo) {
    notFound();
  }

  // Get price from durations array
  const durations = plan.durations as unknown as DurationOption[];
  const selectedDuration = durations.find(d => d.duration === duration);

  if (!selectedDuration) {
    notFound();
  }

  const priceNumber = selectedDuration.retail_price;
  const currencySymbol = getCurrencySymbol(plan.currency);

  // Get plan name
  const planName = getPlanName(duration);

  return (
    <main className="min-h-screen py-8 px-4 bg-cream-50">
      <div className="max-w-4xl mx-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href={`/${locale}`} className="inline-block">
            <img
              src="/android-chrome-192x192.png"
              alt="Trvel"
              className="w-10 h-10 mx-auto rounded-xl mb-1"
            />
            <span className="text-xl font-bold text-brand-400">trvel</span>
          </Link>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left column - Order Summary */}
          <div className="lg:col-span-2 space-y-6">
            <h1 className="text-2xl font-bold text-navy-500">{t('title')}</h1>

            {/* Order Summary */}
            <div className="bg-white border border-cream-300 rounded-2xl shadow-soft overflow-hidden">
              <div className="bg-cream-100 px-5 py-3 border-b border-cream-300">
                <h2 className="font-semibold text-navy-500">{t('completePurchase')}</h2>
              </div>

              <div className="p-5 space-y-3">
                {/* Destination */}
                <div className="flex justify-between items-center">
                  <span className="text-navy-300">Destination</span>
                  <span className="font-medium text-navy-500">{destinationInfo.name}</span>
                </div>

                {/* Plan */}
                <div className="flex justify-between items-center">
                  <span className="text-navy-300">Plan</span>
                  <span className="font-medium text-navy-500">{planName} ({duration} {tPlans('days')})</span>
                </div>

                {/* Data */}
                <div className="flex justify-between items-center">
                  <span className="text-navy-300">Data</span>
                  <span className="font-medium text-brand-500">{tPlans('unlimitedData')}</span>
                </div>

                <hr className="my-3 border-cream-300" />

                {/* Total */}
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-navy-500">Total</span>
                  <span className="text-2xl font-bold text-brand-500">
                    {currencySymbol}{plan.currency === 'IDR' ? Math.round(priceNumber).toLocaleString() : priceNumber.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-brand-50 rounded-2xl p-5 border border-brand-100">
              <h3 className="font-medium mb-3 text-navy-500 text-sm">Included with your eSIM:</h3>
              <ul className="space-y-2 text-sm text-navy-300">
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  Instant QR code delivery via email
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  Premium network coverage
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  24/7 live chat & phone support
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2.5 h-2.5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  10-minute connection guarantee
                </li>
              </ul>
            </div>

            {/* Security Note - Mobile only */}
            <p className="text-xs text-navy-200 text-center lg:hidden">
              Secure checkout powered by Stripe. Your payment info is never stored on our servers.
            </p>
          </div>

          {/* Right column - Embedded Checkout */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-cream-300 rounded-2xl shadow-soft overflow-hidden">
              <EmbeddedCheckout
                destination={destination}
                duration={duration}
                locale={locale}
                promoCode={promo}
              />
            </div>

            {/* Security Note - Desktop */}
            <p className="text-xs text-navy-200 text-center mt-4 hidden lg:block">
              Secure checkout powered by Stripe. Your payment info is never stored on our servers.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
