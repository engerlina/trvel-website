import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/db';
import { notFound } from 'next/navigation';

interface DestinationPageProps {
  params: Promise<{
    locale: string;
    destination: string;
  }>;
}

export default async function DestinationPage({ params }: DestinationPageProps) {
  const { locale, destination } = await params;
  const t = await getTranslations('destination');

  const destinationData = await prisma.destination.findUnique({
    where: {
      slug_locale: {
        slug: destination,
        locale: locale,
      },
    },
  });

  const planData = await prisma.plan.findUnique({
    where: {
      destination_slug_locale: {
        destination_slug: destination,
        locale: locale,
      },
    },
  });

  if (!destinationData) {
    notFound();
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">
          {destinationData.name}
        </h1>
        {destinationData.tagline && (
          <p className="text-xl text-gray-600 mb-8">{destinationData.tagline}</p>
        )}

        {planData && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">{t('pricing')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {planData.price_5day && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold">5 Day Plan</h3>
                  <p className="text-2xl font-bold mt-2">
                    {planData.currency} {planData.price_5day.toString()}
                  </p>
                </div>
              )}
              {planData.price_7day && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold">7 Day Plan</h3>
                  <p className="text-2xl font-bold mt-2">
                    {planData.currency} {planData.price_7day.toString()}
                  </p>
                </div>
              )}
              {planData.price_15day && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold">15 Day Plan</h3>
                  <p className="text-2xl font-bold mt-2">
                    {planData.currency} {planData.price_15day.toString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

