'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight, Info } from 'lucide-react';
import { Button } from '@/components/ui';
import { Card } from '@/components/ui';
import { isDestinationExcluded } from '@/lib/utils';
import { useDestination } from '@/contexts/DestinationContext';
import { destinations } from './Hero';

// Get currency symbol
function getCurrencySymbol(currency: string): string {
  if (currency === 'IDR') return 'Rp';
  if (currency === 'GBP') return '£';
  if (currency === 'SGD') return 'S$';
  if (currency === 'MYR') return 'RM';
  return '$';
}

// Format price with proper decimal places
function formatPrice(price: number, currency: string): string {
  if (currency === 'IDR') return Math.round(price).toLocaleString('id-ID');
  return price.toFixed(2);
}

export function Destinations() {
  const t = useTranslations('home.destinations');
  const locale = useLocale();
  const { plansMap, plansLoading } = useDestination();

  return (
    <section aria-labelledby="destinations-heading" className="section bg-gray-50">
      <div className="container-wide">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-12">
          <div>
            <h2 id="destinations-heading" className="text-heading-xl md:text-display font-bold text-gray-900 mb-2">
              {t('title')}
            </h2>
            <p className="text-body-lg text-gray-600">
              {t('subtitle')}
            </p>
          </div>
          <Link href="/destinations" className="shrink-0">
            <Button variant="ghost" size="md">
              {t('viewAll')}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Destinations Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {destinations.map((destination) => {
            const isExcluded = isDestinationExcluded(destination.slug, locale);
            const plan = plansMap[destination.slug];
            const currency = plan?.currency || 'AUD';
            const currencySymbol = getCurrencySymbol(currency);
            // Calculate daily rate from 15-day price (lowest per-day rate)
            const dailyRate = plan?.price_15day ? plan.price_15day / 15 : null;

            if (isExcluded) {
              return (
                <div key={destination.slug} className="relative group">
                  <Card padding="none" className="overflow-hidden opacity-50 cursor-not-allowed">
                    <div className="p-6">
                      {/* Flag */}
                      <div className="mb-4">
                        <destination.Flag className="w-16 h-auto rounded shadow-sm grayscale" />
                      </div>

                      {/* Info */}
                      <h3 className="text-heading font-semibold text-gray-400 mb-1">
                        {destination.name}
                      </h3>
                      <p className="text-body-sm text-gray-400 flex items-center gap-1">
                        <Info className="w-3.5 h-3.5" />
                        You&apos;re here!
                      </p>

                      {/* Spacer to match height of other cards */}
                      <div className="mt-4 h-5" />
                    </div>
                  </Card>
                  {/* Tooltip */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="bg-navy-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg">
                      You don&apos;t need an eSIM for your home country
                    </div>
                  </div>
                </div>
              );
            }

            return (
              <Link key={destination.slug} href={`/${destination.slug}`}>
                <Card hover padding="none" className="group overflow-hidden">
                  <div className="p-6">
                    {/* Flag */}
                    <div className="mb-4 group-hover:scale-110 transition-transform duration-300">
                      <destination.Flag className="w-16 h-auto rounded shadow-sm" />
                    </div>

                    {/* Info */}
                    <h3 className="text-heading font-semibold text-gray-900 mb-1 group-hover:text-brand-600 transition-colors">
                      {destination.name}
                    </h3>
                    <p className="text-body-sm text-gray-500">
                      {plansLoading ? (
                        <span className="inline-block w-16 h-4 bg-gray-200 rounded animate-pulse" />
                      ) : dailyRate ? (
                        <>
                          {t('from')} <span className="font-semibold text-brand-600">{currencySymbol}{formatPrice(dailyRate, currency)}/day</span>
                        </>
                      ) : (
                        <span className="text-gray-400">Price unavailable</span>
                      )}
                    </p>

                    {/* Arrow */}
                    <div className="mt-4 flex items-center gap-2 text-body-sm font-medium text-brand-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t('viewPlans')}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
