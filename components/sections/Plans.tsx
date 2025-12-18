'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Check, Zap, Star, TrendingUp, AlertTriangle, Globe, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { Badge } from '@/components/ui';
import { Card } from '@/components/ui';
import { Button } from '@/components/ui';
import { useDestination, type PlansMap } from '@/contexts/DestinationContext';
import { DirectCheckoutButton } from './DirectCheckoutButton';
import { DurationOption } from '@/types';
import * as Flags from 'country-flag-icons/react/3x2';

// Icon mapping for different duration lengths
function getPlanIcon(days: number): React.ComponentType<{ className?: string }> {
  if (days <= 3) return Zap;
  if (days <= 7) return Star;
  return TrendingUp;
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

const features = [
  'unlimitedData',
  'instantActivation',
  'liveSupport',
  'moneyBackGuarantee',
];

// Format price with proper decimal places
function formatPrice(price: number | null, currency: string): string {
  if (price === null) return '—';
  if (currency === 'IDR') return Math.round(price).toLocaleString('id-ID');
  return price.toFixed(2);
}

// Get currency symbol
function getCurrencySymbol(currency: string): string {
  if (currency === 'IDR') return 'Rp';
  if (currency === 'GBP') return '£';
  if (currency === 'SGD') return 'S$';
  if (currency === 'MYR') return 'RM';
  return '$';
}

// Get flag component dynamically from country ISO code
function getFlagComponent(countryIso: string | null): React.ComponentType<React.SVGProps<SVGSVGElement>> {
  if (!countryIso) return Globe as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>;
  const code = countryIso.toUpperCase();
  const FlagComponent = (Flags as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[code];
  return FlagComponent || (Globe as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>);
}

export function Plans() {
  const t = useTranslations('home.plans');
  const locale = useLocale();
  const {
    selectedDestination,
    destinationName,
    cyclingIndex,
    plansMap,
    setPlansMap,
    plansLoading,
    setPlansLoading,
    destinations,
  } = useDestination();

  const [showAllOptions, setShowAllOptions] = useState(false);

  // Fetch all plans for this locale on mount
  useEffect(() => {
    async function fetchPlans() {
      try {
        setPlansLoading(true);
        const response = await fetch(`/api/plans?locale=${locale}`);
        if (response.ok) {
          const data: PlansMap = await response.json();
          setPlansMap(data);
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setPlansLoading(false);
      }
    }
    fetchPlans();
  }, [locale, setPlansMap, setPlansLoading]);

  // Determine which destination to show prices for
  const currentDestSlug = selectedDestination || destinations[cyclingIndex]?.slug || 'japan';
  const currentDestName = selectedDestination ? destinationName : (destinations[cyclingIndex]?.name || 'Japan');

  // Get the plan prices for the current destination
  const currentPlan = plansMap[currentDestSlug];
  const currency = currentPlan?.currency || 'AUD';
  const currencySymbol = getCurrencySymbol(currency);

  // Find the country ISO for the current destination
  const currentDest = destinations.find(d => d.slug === currentDestSlug);
  const FlagIcon = currentDest ? getFlagComponent(currentDest.country_iso) : null;

  // Get durations to display
  const { defaultPlans, additionalPlans, bestDailyDuration } = useMemo(() => {
    if (!currentPlan?.durations || currentPlan.durations.length === 0) {
      return { defaultPlans: [], additionalPlans: [], bestDailyDuration: null };
    }

    const durations = currentPlan.durations as DurationOption[];
    const defaultDurations = currentPlan.default_durations || [];

    // Sort by duration for display
    const sortedDurations = [...durations].sort((a, b) => a.duration - b.duration);

    // Find duration with best daily rate
    const best = sortedDurations.reduce((prev, curr) =>
      curr.daily_rate < prev.daily_rate ? curr : prev
    , sortedDurations[0]);

    // Separate into default and additional
    const defaults = sortedDurations.filter(d => defaultDurations.includes(d.duration));
    const additional = sortedDurations.filter(d => !defaultDurations.includes(d.duration));

    return {
      defaultPlans: defaults,
      additionalPlans: additional,
      bestDailyDuration: best
    };
  }, [currentPlan]);

  // Reset expanded state when destination changes
  useEffect(() => {
    setShowAllOptions(false);
  }, [currentDestSlug]);

  return (
    <section id="plans" aria-labelledby="plans-heading" className="section bg-base-100 scroll-mt-20">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            {FlagIcon && (
              <FlagIcon
                className="w-10 h-auto rounded shadow-sm transition-opacity duration-300"
                key={currentDestSlug}
              />
            )}
            <h2 id="plans-heading" className="text-heading-xl md:text-display font-bold text-base-content">
              <span className="transition-opacity duration-300" key={currentDestSlug}>
                {currentDestName}
              </span>{' '}
              eSIM Plans
            </h2>
          </div>
          <p className="text-body-lg text-base-content/70 max-w-2xl mx-auto">
            Choose the perfect plan for your trip to{' '}
            <span className="font-medium transition-opacity duration-300" key={`desc-${currentDestSlug}`}>
              {currentDestName}
            </span>
            . All plans include unlimited data.
          </p>
        </div>

        {/* Plans Grid */}
        <div className={`grid gap-6 lg:gap-8 max-w-5xl mx-auto mb-8 ${
          defaultPlans.length === 1 ? 'md:grid-cols-1 max-w-md' :
          defaultPlans.length === 2 ? 'md:grid-cols-2 max-w-3xl' :
          'md:grid-cols-3'
        }`}>
          {plansLoading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} padding="none" className="relative">
                <div className="p-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 animate-pulse" />
                    <div>
                      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse mb-1" />
                      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="h-12 bg-gray-200 rounded animate-pulse mb-6" />
                  <div className="space-y-3 mb-8">
                    {[1,2,3,4].map(j => (
                      <div key={j} className="h-5 bg-gray-100 rounded animate-pulse" />
                    ))}
                  </div>
                  <div className="h-12 bg-gray-200 rounded animate-pulse" />
                </div>
              </Card>
            ))
          ) : (
            defaultPlans.map((duration, index) => {
              const Icon = getPlanIcon(duration.duration);
              const isPopular = index === 1 && defaultPlans.length >= 3; // Middle option is popular
              const isBestValue = bestDailyDuration?.duration === duration.duration;

              return (
                <Card
                  key={duration.duration}
                  hover
                  padding="none"
                  className={`relative ${isPopular ? 'border-brand-500 border-2 shadow-glow' : ''}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="brand">
                        <Star className="w-3 h-3" />
                        {t('mostPopular')}
                      </Badge>
                    </div>
                  )}
                  {isBestValue && !isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="success">
                        <TrendingUp className="w-3 h-3" />
                        Best Value
                      </Badge>
                    </div>
                  )}

                  <div className="p-8">
                    {/* Plan Icon & Name */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isPopular ? 'bg-brand-100' : 'bg-gray-100'}`}>
                        <Icon className={`w-6 h-6 ${isPopular ? 'text-brand-600' : 'text-gray-600'}`} />
                      </div>
                      <div>
                        <h3 className="text-heading font-bold text-gray-900">
                          {getPlanName(duration.duration)}
                        </h3>
                        <p className="text-body-sm text-gray-500">
                          {duration.duration} {duration.duration === 1 ? 'day' : t('days')}
                        </p>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className="text-display font-bold text-gray-900 transition-all duration-300" key={`price-${currentDestSlug}-${duration.duration}`}>
                          {currencySymbol}{formatPrice(duration.retail_price, currency)}
                        </span>
                        <span className="text-body text-gray-500">{currency}</span>
                      </div>
                      <p className="text-body-sm text-gray-500 mt-1">
                        {currencySymbol}{formatPrice(duration.daily_rate, currency)}/day
                      </p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <div className="w-5 h-5 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-success-600" />
                          </div>
                          <span className="text-body-sm text-gray-600">{t(`features.${feature}`)}</span>
                        </li>
                      ))}
                    </ul>

                    {/* CTA */}
                    <DirectCheckoutButton
                      destination={currentDestSlug}
                      duration={duration.duration}
                      locale={locale}
                      variant={isPopular ? 'primary' : 'secondary'}
                    >
                      {t('selectPlan')}
                    </DirectCheckoutButton>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* More Options Toggle */}
        {additionalPlans.length > 0 && !plansLoading && (
          <div className="max-w-5xl mx-auto mb-8">
            <button
              onClick={() => setShowAllOptions(!showAllOptions)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-body font-medium text-brand-600 hover:text-brand-700 transition-colors border border-dashed border-brand-300 hover:border-brand-400 rounded-xl bg-brand-50/50 hover:bg-brand-50"
            >
              <Clock className="w-4 h-4" />
              {showAllOptions ? 'Show fewer options' : `${additionalPlans.length} more plan${additionalPlans.length > 1 ? 's' : ''} available`}
              {showAllOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        )}

        {/* Additional Plans (Expandable) */}
        {showAllOptions && additionalPlans.length > 0 && (
          <div className={`grid gap-4 lg:gap-6 max-w-5xl mx-auto mb-12 ${
            additionalPlans.length === 1 ? 'md:grid-cols-1 max-w-md' :
            additionalPlans.length === 2 ? 'md:grid-cols-2 max-w-3xl' :
            additionalPlans.length === 3 ? 'md:grid-cols-3' :
            'md:grid-cols-4'
          }`}>
            {additionalPlans.map((duration) => {
              const Icon = getPlanIcon(duration.duration);
              const isBestValue = bestDailyDuration?.duration === duration.duration;

              return (
                <Card
                  key={duration.duration}
                  hover
                  padding="none"
                  className="relative"
                >
                  {isBestValue && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge variant="success">
                        <TrendingUp className="w-3 h-3" />
                        Best Value
                      </Badge>
                    </div>
                  )}

                  <div className="p-6">
                    {/* Compact Plan Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-body font-bold text-gray-900">
                          {getPlanName(duration.duration)}
                        </h3>
                        <p className="text-body-sm text-gray-500">
                          {duration.duration} {duration.duration === 1 ? 'day' : 'days'}
                        </p>
                      </div>
                    </div>

                    {/* Compact Price */}
                    <div className="mb-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-heading-lg font-bold text-gray-900">
                          {currencySymbol}{formatPrice(duration.retail_price, currency)}
                        </span>
                        <span className="text-body-sm text-gray-500">{currency}</span>
                      </div>
                      <p className="text-body-sm text-gray-500">
                        {currencySymbol}{formatPrice(duration.daily_rate, currency)}/day
                      </p>
                    </div>

                    {/* CTA */}
                    <DirectCheckoutButton
                      destination={currentDestSlug}
                      duration={duration.duration}
                      locale={locale}
                      variant="secondary"
                    >
                      Select
                    </DirectCheckoutButton>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Competitor Comparison */}
        {currentPlan?.competitor_name && currentPlan?.competitor_daily_rate && currentPlan?.best_daily_rate && (() => {
          const trvelDailyRate = currentPlan.best_daily_rate;
          const savingsPercent = Math.round(((currentPlan.competitor_daily_rate - trvelDailyRate) / currentPlan.competitor_daily_rate) * 100);
          const hasSavings = savingsPercent > 0;

          return (
            <div className="mb-12">
              <div className={`max-w-2xl mx-auto bg-gradient-to-r ${hasSavings ? 'from-success-50 to-success-100/50 border-success-200' : 'from-brand-50 to-brand-100/50 border-brand-200'} rounded-2xl p-6 border`}>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full ${hasSavings ? 'bg-success-100' : 'bg-brand-100'} flex items-center justify-center`}>
                      <TrendingUp className={`w-5 h-5 ${hasSavings ? 'text-success-600' : 'text-brand-600'}`} />
                    </div>
                    <div className="text-center sm:text-left">
                      {hasSavings ? (
                        <>
                          <p className="text-body-sm text-success-700 font-medium">
                            Save up to{' '}
                            <span className="text-lg font-bold">
                              {savingsPercent}%
                            </span>{' '}
                            vs {currentPlan.competitor_name}
                          </p>
                          <p className="text-body-sm text-success-600">
                            {currentPlan.competitor_name} charges{' '}
                            <span className="font-semibold">
                              {currencySymbol}{formatPrice(currentPlan.competitor_daily_rate, currency)}/day
                            </span>
                            {' '}for roaming
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="text-body-sm text-brand-700 font-medium">
                            Unlimited data{' '}
                            <span className="text-lg font-bold">
                              included
                            </span>{' '}
                            vs {currentPlan.competitor_name}
                          </p>
                          <p className="text-body-sm text-brand-600">
                            {currentPlan.competitor_name} limits you to{' '}
                            <span className="font-semibold">
                              200MB/day
                            </span>
                            {' '}while roaming
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span className="text-body-sm text-gray-600">
                      Avoid bill shock
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Data Disclaimer */}
        <div className="text-center">
          <p className="text-body-sm text-gray-500 max-w-lg mx-auto">
            {t('dataDisclaimer')}
          </p>
        </div>
      </div>
    </section>
  );
}
