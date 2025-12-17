import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { prisma } from '@/lib/db';

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

  // Fetch order details using the session ID
  let order = null;
  if (session_id) {
    order = await prisma.order.findUnique({
      where: { stripe_session_id: session_id },
    });
  }

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

        {/* Order Details */}
        {order && (
          <div className="bg-white rounded-2xl p-6 mb-6 border border-cream-300 shadow-soft text-left">
            <div className="flex justify-between items-center mb-4">
              <span className="text-navy-300 text-sm">Order</span>
              <span className="font-mono text-sm font-medium text-navy-500">{order.order_number}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-navy-300 text-sm">Destination</span>
              <span className="font-medium text-navy-500">{order.destination_name}</span>
            </div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-navy-300 text-sm">Plan</span>
              <span className="font-medium text-navy-500">{order.plan_name} ({order.duration} days)</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-cream-200">
              <span className="font-semibold text-navy-500">Total</span>
              <span className="font-bold text-brand-500 text-lg">
                {order.currency} {(order.amount_cents / 100).toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* QR Code Section */}
        {order?.esim_qr_code && (
          <div className="bg-white rounded-2xl p-6 mb-6 border-2 border-brand-300 shadow-soft">
            <h2 className="font-semibold mb-4 text-navy-500 flex items-center justify-center gap-2">
              <span>Your eSIM QR Code</span>
            </h2>

            <div className="bg-cream-50 rounded-xl p-4 inline-block mb-4">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(order.esim_qr_code)}`}
                alt="eSIM QR Code"
                width={200}
                height={200}
                className="mx-auto"
              />
            </div>

            <p className="text-sm text-navy-300 mb-4">
              Scan this code from another device to install your eSIM
            </p>

            <div className="bg-brand-50 rounded-xl p-4 text-left">
              <p className="text-sm font-medium text-brand-600 mb-2">Quick Install Steps:</p>
              <ol className="text-xs text-navy-400 space-y-1">
                <li><strong>iPhone:</strong> Settings → Mobile Data → Add eSIM → Use QR Code</li>
                <li><strong>Android:</strong> Settings → Network → SIMs → Add eSIM</li>
                <li>Enable <strong>Data Roaming</strong> when you land!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Fallback Next Steps (when no QR code yet) */}
        {!order?.esim_qr_code && (
          <div className="bg-white rounded-2xl p-6 mb-8 border border-cream-300 shadow-soft">
            <h2 className="font-semibold mb-4 text-navy-500">{t('success.nextSteps')}</h2>
            <ol className="text-left text-sm text-navy-300 space-y-3">
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-400 text-white rounded-full flex items-center justify-center text-xs font-semibold">1</span>
                <span>{t('success.step1')}</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-400 text-white rounded-full flex items-center justify-center text-xs font-semibold">2</span>
                <span>{t('success.step2')}</span>
              </li>
              <li className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-brand-400 text-white rounded-full flex items-center justify-center text-xs font-semibold">3</span>
                <span>{t('success.step3')}</span>
              </li>
            </ol>
          </div>
        )}

        {/* Email Reminder */}
        <p className="text-sm text-navy-300 mb-6">
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
