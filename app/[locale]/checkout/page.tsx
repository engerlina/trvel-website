import { getTranslations } from 'next-intl/server';

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('checkout');
  const tCommon = await getTranslations('common.buttons');

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">{t('title')}</h1>
        
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">{t('completePurchase')}</h2>
          <p className="text-gray-600 mb-6">
            Checkout functionality will be implemented here with Stripe integration.
          </p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            {tCommon('checkout')}
          </button>
        </div>
      </div>
    </main>
  );
}

