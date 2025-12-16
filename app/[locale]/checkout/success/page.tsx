import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

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
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-8 h-8 text-green-600"
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

        <h1 className="text-3xl font-bold mb-4">{t('success.title')}</h1>
        <p className="text-gray-600 mb-8">{t('success.message')}</p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="font-semibold mb-4">{t('success.nextSteps')}</h2>
          <ol className="text-left text-sm text-gray-600 space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
              <span>{t('success.step1')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
              <span>{t('success.step2')}</span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-brand-100 text-brand-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
              <span>{t('success.step3')}</span>
            </li>
          </ol>
        </div>

        <Link
          href={`/${locale}`}
          className="inline-flex items-center justify-center px-6 py-3 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors"
        >
          {t('success.backHome')}
        </Link>
      </div>
    </main>
  );
}
