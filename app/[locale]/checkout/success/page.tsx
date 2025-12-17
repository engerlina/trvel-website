import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import OrderStatus from './OrderStatus';

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { locale } = await params;
  const { session_id } = await searchParams;
  const t = await getTranslations('checkout');

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-cream-50">
      <div className="max-w-lg w-full text-center">
        {/* Logo */}
        <div className="mb-8">
          <Link href={`/${locale}`} className="inline-block">
            <img
              src="/android-chrome-192x192.png"
              alt="Trvel"
              className="w-12 h-12 mx-auto rounded-xl mb-2"
            />
            <span className="text-2xl font-bold text-brand-400">trvel</span>
          </Link>
        </div>

        <div className="w-20 h-20 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-brand-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-navy-500">{t('success.title')}</h1>
        <p className="text-navy-300 mb-8">{t('success.message')}</p>

        {/* Order Status with Polling */}
        {session_id && (
          <OrderStatus
            sessionId={session_id}
            translations={{
              nextSteps: t('success.nextSteps'),
              step1: t('success.step1'),
              step2: t('success.step2'),
              step3: t('success.step3'),
            }}
          />
        )}

        {/* Email Reminder */}
        <p className="text-sm text-navy-300 my-6">
          We've also sent the QR code and instructions to your email.
        </p>

        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center px-6 py-3 bg-brand-400 text-white rounded-xl font-medium hover:bg-brand-500 transition-colors shadow-soft"
        >
          {t('success.backHome')}
        </Link>
      </div>
    </main>
  );
}
