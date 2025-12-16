'use client';

import { useTranslations } from 'next-intl';
import { Check, X, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui';
import Image from 'next/image';
import { useDestination } from '@/contexts/DestinationContext';
import { destinations } from './Hero';

interface ComparisonRow {
  feature: string;
  trvel: string | boolean;
  competitor: string | boolean;
}

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

export function Comparison() {
  const t = useTranslations('home.comparison');
  const { selectedDestination, cyclingIndex, plansMap, plansLoading } = useDestination();

  // Determine which destination to show
  const currentDestSlug = selectedDestination || destinations[cyclingIndex]?.slug || 'japan';
  const currentPlan = plansMap[currentDestSlug];
  const currentDestName = destinations.find(d => d.slug === currentDestSlug)?.name || 'your trip';

  // Get competitor info from the current plan
  const competitorName = currentPlan?.competitor_name || 'Carrier';
  const competitorDailyRate = currentPlan?.competitor_daily_rate || 10;
  const currency = currentPlan?.currency || 'AUD';
  const currencySymbol = getCurrencySymbol(currency);

  // Calculate Trvel daily rate from 7-day plan (most popular)
  const trvelDailyRate = currentPlan?.price_7day ? currentPlan.price_7day / 7 : 5.71;

  // Calculate savings for a 7-day trip
  const competitorTotal = competitorDailyRate * 7;
  const trvelTotal = currentPlan?.price_7day || 40;
  const savings = competitorTotal - trvelTotal;

  const comparisonData: ComparisonRow[] = [
    {
      feature: 'dailyCost',
      trvel: `${currencySymbol}${formatPrice(trvelDailyRate, currency)}/day`,
      competitor: `${currencySymbol}${formatPrice(competitorDailyRate, currency)}/day`
    },
    { feature: 'data', trvel: true, competitor: '200MB/day' },
    { feature: 'support', trvel: true, competitor: false },
    { feature: 'setup', trvel: '2 minutes', competitor: 'Auto-roam' },
    { feature: 'guarantee', trvel: true, competitor: false },
  ];

  const renderValue = (value: string | boolean, isPositive: boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-success-100 flex items-center justify-center">
            <Check className="w-4 h-4 text-success-600" />
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
            <X className="w-4 h-4 text-gray-400" />
          </div>
        </div>
      );
    }
    return (
      <span className={`text-body font-medium ${isPositive ? 'text-gray-900' : 'text-gray-500'}`}>
        {value}
      </span>
    );
  };

  return (
    <section className="section bg-white">
      <div className="container-tight">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-heading-xl md:text-display font-bold text-gray-900 mb-4">
            {t('title', { competitor: competitorName })}
          </h2>
          <p className="text-body-lg text-gray-600 max-w-2xl mx-auto">
            {t('subtitle', { competitor: competitorName })}
          </p>
        </div>

        {/* Comparison Table */}
        <Card padding="none" className="overflow-hidden mb-8">
          {/* Header */}
          <div className="grid grid-cols-3 bg-gray-50 border-b border-gray-100">
            <div className="p-4 md:p-6">
              <span className="text-body-sm font-medium text-gray-500 uppercase tracking-wide">
                {t('feature')}
              </span>
            </div>
            <div className="p-4 md:p-6 text-center border-l border-gray-100 bg-brand-50">
              <div className="flex items-center justify-center gap-2">
                <Image
                  src="/logo.svg"
                  alt="Trvel"
                  width={21}
                  height={30}
                  className="w-5 h-7"
                />
                <span className="text-body font-bold text-brand-700">Trvel</span>
              </div>
            </div>
            <div className="p-4 md:p-6 text-center border-l border-gray-100">
              <span className="text-body font-medium text-gray-600">{competitorName}</span>
            </div>
          </div>

          {/* Rows */}
          {comparisonData.map((row, index) => (
            <div
              key={row.feature}
              className={`grid grid-cols-3 ${index !== comparisonData.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="p-4 md:p-6 flex items-center">
                <span className="text-body text-gray-700">{t(`features.${row.feature}`)}</span>
              </div>
              <div className="p-4 md:p-6 flex items-center justify-center border-l border-gray-100 bg-brand-50/50">
                {renderValue(row.trvel, true)}
              </div>
              <div className="p-4 md:p-6 flex items-center justify-center border-l border-gray-100">
                {renderValue(row.competitor, false)}
              </div>
            </div>
          ))}
        </Card>

        {/* Savings Highlight */}
        <div className="text-center">
          {savings > 0 ? (
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-success-50 to-brand-50 rounded-2xl border border-success-200">
              <TrendingUp className="w-8 h-8 text-success-600" />
              <div className="text-left">
                <p className="text-body-sm text-gray-600">
                  Your savings on a 7-day trip to{' '}
                  <span className="font-medium" key={currentDestSlug}>{currentDestName}</span>
                </p>
                <p className="text-heading-lg font-bold text-success-700">
                  {plansLoading ? '...' : `${currencySymbol}${formatPrice(savings, currency)}+`}
                </p>
              </div>
            </div>
          ) : (
            <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-brand-50 to-brand-100/50 rounded-2xl border border-brand-200">
              <TrendingUp className="w-8 h-8 text-brand-600" />
              <div className="text-left">
                <p className="text-body-sm text-gray-600">
                  Unlimited data on a 7-day trip to{' '}
                  <span className="font-medium" key={currentDestSlug}>{currentDestName}</span>
                </p>
                <p className="text-heading-lg font-bold text-brand-700">
                  No data limits
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
