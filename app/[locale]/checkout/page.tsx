import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';
import CheckoutButton from './CheckoutButton';
import { getCurrencySymbol } from '@/lib/pricing';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ destination?: string; duration?: string; plan?: string }>;
}

// Parse plan parameter (e.g., "7-day" -> 7)
function parsePlanDuration(plan: string | undefined): number | null {
  if (!plan) return null;
  const match = plan.match(/^(\d+)-?day/i);
  return match ? parseInt(match[1], 10) : null;
}

export default async function CheckoutPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { destination, duration: durationStr, plan: planStr } = await searchParams;
  const t = await getTranslations('checkout');
  const tPlans = await getTranslations('home.plans');

  // Parse duration from either `duration` or `plan` parameter
  const duration = durationStr
    ? parseInt(durationStr, 10)
    : parsePlanDuration(planStr);

  // Validate parameters
  if (!destination || !duration || ![5, 7, 15].includes(duration)) {
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

  // Get price for selected duration
  const price = duration === 5 ? plan.price_5day :
                duration === 7 ? plan.price_7day :
                plan.price_15day;

  if (!price) {
    notFound();
  }

  const priceNumber = typeof price === 'object' ? Number(price) : price;
  const currencySymbol = getCurrencySymbol(plan.currency);

  // Get plan name
  const planName = duration === 5 ? tPlans('short.name') :
                   duration === 7 ? tPlans('week.name') :
                   tPlans('extended.name');

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-lg mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">{t('title')}</h1>

        {/* Order Summary */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">{t('completePurchase')}</h2>
          </div>

          <div className="p-6 space-y-4">
            {/* Destination */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Destination</span>
              <span className="font-medium">{destinationInfo.name}</span>
            </div>

            {/* Plan */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Plan</span>
              <span className="font-medium">{planName} ({duration} {tPlans('days')})</span>
            </div>

            {/* Data */}
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Data</span>
              <span className="font-medium text-green-600">{tPlans('unlimitedData')}</span>
            </div>

            <hr className="my-4" />

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total</span>
              <span className="text-2xl font-bold text-brand-600">
                {currencySymbol}{plan.currency === 'IDR' ? Math.round(priceNumber).toLocaleString() : priceNumber.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="font-medium mb-4">Included with your eSIM:</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Instant QR code delivery via email
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Premium network coverage
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              24/7 WhatsApp support
            </li>
            <li className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              10-minute connection guarantee
            </li>
          </ul>
        </div>

        {/* Checkout Button */}
        <CheckoutButton
          destination={destination}
          duration={duration}
          locale={locale}
        />

        {/* Security Note */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Secure checkout powered by Stripe. Your payment info is never stored on our servers.
        </p>
      </div>
    </main>
  );
}
