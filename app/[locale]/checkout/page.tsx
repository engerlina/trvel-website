import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import CheckoutButton from './CheckoutButton';
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
    <main className="min-h-screen py-12 px-4 bg-cream-50">
      <div className="max-w-lg mx-auto">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href={`/${locale}`} className="inline-block">
            <img
              src="/android-chrome-192x192.png"
              alt="Trvel"
              className="w-12 h-12 mx-auto rounded-xl mb-2"
            />
            <span className="text-2xl font-bold text-brand-400">trvel</span>
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8 text-center text-navy-500">{t('title')}</h1>

        {/* Order Summary */}
        <div className="bg-white border border-cream-300 rounded-2xl shadow-soft overflow-hidden mb-8">
          <div className="bg-cream-100 px-6 py-4 border-b border-cream-300">
            <h2 className="font-semibold text-navy-500">{t('completePurchase')}</h2>
          </div>

          <div className="p-6 space-y-4">
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

            <hr className="my-4 border-cream-300" />

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
        <div className="bg-brand-50 rounded-2xl p-6 mb-8 border border-brand-100">
          <h3 className="font-medium mb-4 text-navy-500">Included with your eSIM:</h3>
          <ul className="space-y-3 text-sm text-navy-300">
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Instant QR code delivery via email
            </li>
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              Premium network coverage
            </li>
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              24/7 live chat & phone support
            </li>
            <li className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-3 h-3 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              10-minute connection guarantee
            </li>
          </ul>
        </div>

        {/* Checkout Button */}
        <CheckoutButton
          destination={destination}
          duration={duration}
          locale={locale}
          promoCode={promo}
        />

        {/* Payment Methods */}
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            {/* Visa */}
            <div className="w-12 h-8 bg-white rounded border border-cream-200 flex items-center justify-center">
              <svg viewBox="0 0 48 32" className="w-8 h-5">
                <path fill="#1434CB" d="M19.5 23.5h-3.9l2.4-15h3.9l-2.4 15zm16.1-14.6c-.8-.3-2-.6-3.5-.6-3.9 0-6.6 2.1-6.6 5 0 2.2 2 3.4 3.5 4.1 1.5.7 2 1.2 2 1.9 0 1-.6 1.5-1.8 1.5-1.2 0-1.8-.2-2.8-.6l-.4-.2-.4 2.6c.7.3 2 .6 3.3.6 4.1 0 6.8-2 6.8-5.2 0-1.7-1-3-3.3-4.1-1.4-.7-2.2-1.2-2.2-1.9 0-.6.7-1.3 2.2-1.3 1.3 0 2.2.3 2.9.6l.4.2.4-2.6zm5.9-.4h-3c-.9 0-1.6.3-2 1.2l-5.7 13.8h4l.8-2.2h4.9l.5 2.2h3.5l-3-15zm-4.7 9.7l1.5-4.2.4-1.2.2 1.2.9 4.2h-3zm-23.3-9.7l-3.8 10.2-.4-2.1c-.7-2.4-2.9-5-5.4-6.3l3.5 13.2h4.1l6.1-15h-4.1z"/>
              </svg>
            </div>
            {/* Mastercard */}
            <div className="w-12 h-8 bg-white rounded border border-cream-200 flex items-center justify-center">
              <svg viewBox="0 0 48 32" className="w-8 h-5">
                <circle fill="#EB001B" cx="16" cy="16" r="10"/>
                <circle fill="#F79E1B" cx="32" cy="16" r="10"/>
                <path fill="#FF5F00" d="M24 8c2.4 1.8 4 4.7 4 8s-1.6 6.2-4 8c-2.4-1.8-4-4.7-4-8s1.6-6.2 4-8z"/>
              </svg>
            </div>
            {/* Apple Pay */}
            <div className="w-12 h-8 bg-white rounded border border-cream-200 flex items-center justify-center">
              <svg viewBox="0 0 48 32" className="w-8 h-5">
                <path fill="#000" d="M16.5 9.5c-.8.9-2 1.6-3.2 1.5-.2-1.2.4-2.5 1.1-3.3.8-.9 2.1-1.5 3.2-1.5.1 1.3-.4 2.5-1.1 3.3zm1.1 1.7c-1.8-.1-3.3 1-4.1 1s-2.2-1-3.6-1c-1.8 0-3.5 1.1-4.5 2.7-1.9 3.3-.5 8.2 1.4 10.9.9 1.3 2 2.8 3.5 2.7 1.4-.1 1.9-.9 3.6-.9s2.2.9 3.6.9c1.5 0 2.4-1.3 3.3-2.6 1-1.5 1.4-3 1.5-3.1-.1 0-2.8-1.1-2.8-4.3 0-2.7 2.2-4 2.3-4.1-1.3-1.9-3.2-2.1-3.9-2.2h-.3z"/>
                <path fill="#000" d="M30.4 7.1c1.4 0 2.9 1 3.8 2.7-.1.1-2.1 1.2-2.1 3.7 0 2.9 2.5 3.9 2.6 3.9 0 .1-.4 1.4-1.3 2.8-.8 1.2-1.7 2.4-3 2.4-1.3 0-1.7-.8-3.2-.8-1.5 0-2 .8-3.2.8-1.3 0-2.2-1.3-3-2.5-1.8-2.7-3.2-7.6-1.3-10.9.9-1.6 2.5-2.7 4.3-2.7 1.3 0 2.4.9 3.2.9.8 0 2.3-1.1 3.9-1 .3 0 1.5.1 2.3.8z"/>
              </svg>
            </div>
            {/* Google Pay */}
            <div className="w-12 h-8 bg-white rounded border border-cream-200 flex items-center justify-center">
              <svg viewBox="0 0 48 32" className="w-8 h-5">
                <path fill="#4285F4" d="M24 14.4v4.3h6.1c-.3 1.5-1 2.7-2.1 3.5l3.4 2.6c2-1.8 3.1-4.5 3.1-7.7 0-.7-.1-1.4-.2-2.1H24z"/>
                <path fill="#34A853" d="M16.5 18.6l-.8.6-2.7 2.1c1.7 3.4 5.2 5.7 9.2 5.7 2.8 0 5.1-.9 6.8-2.5l-3.4-2.6c-.9.6-2.1 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2l-.1-.1z"/>
                <path fill="#FBBC05" d="M10.9 14.2c-.3.9-.5 1.9-.5 2.9s.2 2 .5 2.9l3.5-2.7c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2l-3.5-1.1z"/>
                <path fill="#EA4335" d="M22.2 11.8c1.5 0 2.8.5 3.9 1.5l2.9-2.9c-1.8-1.6-4.1-2.7-6.8-2.7-4 0-7.5 2.3-9.2 5.7l3.5 2.7c.8-2.3 3-4.3 5.7-4.3z"/>
              </svg>
            </div>
          </div>

          {/* Security Note */}
          <p className="text-xs text-navy-200 text-center">
            Secure checkout powered by Stripe. Your payment info is never stored on our servers.
          </p>
        </div>
      </div>
    </main>
  );
}
