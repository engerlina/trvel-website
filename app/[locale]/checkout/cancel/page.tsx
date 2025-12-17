import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function CheckoutCancelPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('checkout');

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-cream-50">
      <div className="max-w-lg text-center">
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

        <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-accent-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold mb-4 text-navy-500">{t('cancel.title')}</h1>
        <p className="text-navy-300 mb-8">{t('cancel.message')}</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center px-6 py-3 bg-brand-400 text-white rounded-xl font-medium hover:bg-brand-500 transition-colors shadow-soft"
          >
            {t('cancel.tryAgain')}
          </Link>
          <Link
            href={`/${locale}/help`}
            className="inline-flex items-center justify-center px-6 py-3 border-2 border-cream-400 text-navy-400 rounded-xl font-medium hover:bg-cream-100 transition-colors"
          >
            {t('cancel.getHelp')}
          </Link>
        </div>
      </div>
    </main>
  );
}
