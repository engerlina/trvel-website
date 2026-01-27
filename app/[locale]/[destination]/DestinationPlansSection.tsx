'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Clock, TrendingUp, ArrowRight, Check, Infinity, Database } from 'lucide-react';
import { DestinationPlanCard } from './DestinationPlanCard';
import { DurationOption, DataTier } from '@/types';
import { Link } from '@/i18n/routing';
import { getGclid } from '@/hooks/useGclid';

// Get human-readable data label based on tier
function getDataLabel(dataType?: DataTier, dataAmountMb?: number): string {
  if (!dataType || dataType === 'unlimited') {
    return 'Unlimited';
  }
  if (dataAmountMb && dataAmountMb >= 1000) {
    return `${dataAmountMb / 1000}GB`;
  }
  return dataType.toUpperCase();
}

// Check if plan is unlimited
function isUnlimitedPlan(dataType?: DataTier): boolean {
  return !dataType || dataType === 'unlimited';
}

// Compact plan card for additional plans
function CompactPlanCard({
  plan,
  isBestValue,
  currencySymbol,
  destination,
  locale,
}: {
  plan: { name: string; duration: number; price: string; perDay: string; dataType?: DataTier; dataAmountMb?: number };
  isBestValue: boolean;
  currencySymbol: string;
  destination: string;
  locale: string;
}) {
  const [isLoading, setIsLoading] = useState(false);
  const isUnlimited = isUnlimitedPlan(plan.dataType);
  const DataIcon = isUnlimited ? Infinity : Database;

  const handleCheckout = async () => {
    setIsLoading(true);

    // Get gclid for Google Ads attribution
    const gclid = getGclid();

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination,
          duration: plan.duration,
          locale,
          ...(gclid && { gclid }),
          ...(plan.dataType && { dataType: plan.dataType }),
        }),
      });
      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      window.location.href = `/${locale}/checkout?destination=${destination}&duration=${plan.duration}`;
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-cream-50 hover:shadow-lg transition-all ${
      isUnlimited ? 'border-2 border-brand-200' : 'border-2 border-amber-200'
    }`}>
      {/* Data Tier Indicator Bar */}
      <div
        className={`h-1 w-full ${
          isUnlimited
            ? 'bg-gradient-to-r from-brand-400 to-brand-500'
            : 'bg-gradient-to-r from-amber-400 to-amber-500'
        }`}
      />

      {isBestValue && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1 px-3 py-1 bg-success-500 text-white text-xs font-semibold rounded-full shadow">
            <TrendingUp className="w-3 h-3" />
            Best Value
          </span>
        </div>
      )}

      <div className={`text-center p-5 ${isBestValue ? 'pt-8' : ''}`}>
        {/* Data tier badge */}
        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full mb-2 ${
          isUnlimited
            ? 'bg-brand-100 text-brand-700'
            : 'bg-amber-100 text-amber-700'
        }`}>
          <DataIcon className="w-3 h-3" />
          {getDataLabel(plan.dataType, plan.dataAmountMb)}
        </span>

        <h3 className="text-base font-semibold text-navy-500 mb-1">
          {plan.name}
        </h3>

        <div className="mb-2">
          <span className="text-2xl font-bold text-navy-500">
            {currencySymbol}{plan.price}
          </span>
        </div>

        <p className="text-sm text-navy-400 mb-4">
          {currencySymbol}{plan.perDay}/day
        </p>

        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className={`w-full py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 text-sm ${
            isUnlimited
              ? 'bg-brand-500 text-white hover:bg-brand-600'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          {isLoading ? 'Processing...' : 'Get Started'}
        </button>

        <Link
          href={`/esim/${destination}/${plan.duration}-day`}
          className="mt-2 flex items-center justify-center gap-1 text-xs text-navy-400 hover:text-brand-600 transition-colors"
        >
          Learn more
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

interface Plan {
  name: string;
  subtext?: string;
  duration: number;
  price: string;
  perDay: string;
  popular: boolean;
  dataType?: DataTier;
  dataAmountMb?: number;
}

interface DestinationPlansSectionProps {
  destinationName: string;
  destination: string;
  locale: string;
  currency: string;
  currencySymbol: string;
  durations: DurationOption[];
  defaultDurations: number[];
  competitorData: {
    name: string;
    daily_rate: number | string;
  } | null;
}

// Format price with proper decimal places
function formatPrice(price: number | null | undefined, currency: string): string {
  if (price === null || price === undefined) return '—';
  if (currency === 'IDR') return Math.round(price).toLocaleString('id-ID');
  return price.toFixed(2);
}

// Get plan name based on duration
function getPlanName(days: number): { name: string; subtext?: string } {
  if (days === 1) return { name: '1 Day' };
  if (days === 3) return { name: '3 Days' };
  if (days === 5) return { name: '5 Days' };
  if (days === 7) return { name: '1 Week', subtext: '7 days' };
  if (days === 10) return { name: '10 Days' };
  if (days === 15) return { name: '2 Weeks', subtext: '15 days' };
  if (days === 30) return { name: '1 Month', subtext: '30 days' };
  return { name: `${days} Days` };
}

export function DestinationPlansSection({
  destinationName,
  destination,
  locale,
  currency,
  currencySymbol,
  durations,
  defaultDurations,
  competitorData,
}: DestinationPlansSectionProps) {
  const [showAllOptions, setShowAllOptions] = useState(false);

  // Sort durations by duration
  const sortedDurations = [...durations].sort((a, b) => a.duration - b.duration);

  // Separate default and additional plans
  const defaultPlans = defaultDurations.length > 0
    ? sortedDurations.filter(d => defaultDurations.includes(d.duration))
    : sortedDurations.slice(0, 3);

  const additionalPlans = defaultDurations.length > 0
    ? sortedDurations.filter(d => !defaultDurations.includes(d.duration))
    : sortedDurations.slice(3);

  // Find best daily rate duration
  const bestDailyDuration = sortedDurations.length > 0
    ? sortedDurations.reduce((prev, curr) => curr.daily_rate < prev.daily_rate ? curr : prev)
    : null;

  // Convert to plan format for default plans
  const plans: Plan[] = defaultPlans.map((d, index) => {
    const planName = getPlanName(d.duration);
    return {
      name: planName.name,
      subtext: planName.subtext,
      duration: d.duration,
      price: formatPrice(d.retail_price, currency),
      perDay: formatPrice(d.daily_rate, currency),
      popular: index === 1 && defaultPlans.length >= 3,
      dataType: d.data_type,
      dataAmountMb: d.data_amount_mb,
    };
  });

  // Convert additional plans
  const additionalPlanCards: Plan[] = additionalPlans.map((d) => {
    const planName = getPlanName(d.duration);
    return {
      name: planName.name,
      subtext: planName.subtext,
      duration: d.duration,
      price: formatPrice(d.retail_price, currency),
      perDay: formatPrice(d.daily_rate, currency),
      popular: false,
      dataType: d.data_type,
      dataAmountMb: d.data_amount_mb,
    };
  });

  if (plans.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center">
        <div className="bg-cream-100 rounded-2xl p-8 border border-cream-200">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-amber-500" />
          </div>
          <h3 className="text-heading font-bold text-navy-500 mb-2">
            Plans Coming Soon
          </h3>
          <p className="text-body text-navy-400 mb-6">
            We're working on bringing eSIM coverage to {destinationName}.
            Check back soon or explore our other destinations below.
          </p>
          <Link
            href={`/${locale}#destinations`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors"
          >
            Browse Destinations
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  // Check if we have mixed plan types to show legend
  const hasMixedTypes = sortedDurations.some(d => isUnlimitedPlan(d.data_type)) &&
                        sortedDurations.some(d => !isUnlimitedPlan(d.data_type));

  // Generate a deterministic "random" number based on destination (8-24 range)
  // This ensures consistent results between server and client (no hydration mismatch)
  const destinationHash = destination.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const travellerCount = 8 + (destinationHash % 17); // Range: 8-24

  return (
    <>
      {/* Subtle Social Proof / Activity Indicator */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="flex -space-x-1.5">
          <div className="w-6 h-6 rounded-full bg-brand-200 border-2 border-white flex items-center justify-center">
            <span className="text-xs text-brand-700">👤</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-success-200 border-2 border-white flex items-center justify-center">
            <span className="text-xs text-success-700">👤</span>
          </div>
          <div className="w-6 h-6 rounded-full bg-accent-200 border-2 border-white flex items-center justify-center">
            <span className="text-xs text-accent-700">👤</span>
          </div>
        </div>
        <span className="text-sm text-navy-400">
          <span className="font-medium text-navy-500">{travellerCount} travellers</span> bought {destinationName} eSIM today
        </span>
      </div>

      {/* Plan Type Legend - only show if we have both types */}
      {hasMixedTypes && (
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200">
            <Infinity className="w-4 h-4 text-brand-600" />
            <span className="text-sm font-medium text-brand-700">Unlimited Data</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200">
            <Database className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">Fixed Data (Budget)</span>
          </div>
        </div>
      )}

      {/* Plan cards */}
      <div className={`grid gap-6 max-w-4xl mx-auto ${
        plans.length === 1 ? 'grid-cols-1 max-w-md' :
        plans.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl' :
        'grid-cols-1 md:grid-cols-3'
      }`}>
        {plans.map((plan) => (
          <DestinationPlanCard
            key={`${plan.duration}-${plan.dataType || 'unlimited'}`}
            name={plan.name}
            subtext={plan.subtext}
            price={plan.price}
            perDay={plan.perDay}
            popular={plan.popular}
            currencySymbol={currencySymbol}
            destination={destination}
            duration={plan.duration}
            locale={locale}
            dataType={plan.dataType}
            dataAmountMb={plan.dataAmountMb}
          />
        ))}
      </div>

      {/* More Options Toggle */}
      {additionalPlanCards.length > 0 && (
        <div className="max-w-4xl mx-auto mt-8">
          <button
            onClick={() => setShowAllOptions(!showAllOptions)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 text-body font-medium text-brand-600 hover:text-brand-700 transition-colors border border-dashed border-brand-300 hover:border-brand-400 rounded-xl bg-brand-50/50 hover:bg-brand-50"
          >
            <Clock className="w-4 h-4" />
            {showAllOptions ? 'Show fewer options' : `${additionalPlanCards.length} more plan${additionalPlanCards.length > 1 ? 's' : ''} available`}
            {showAllOptions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Additional Plans (Expandable) */}
      {showAllOptions && additionalPlanCards.length > 0 && (
        <div className={`grid gap-4 max-w-4xl mx-auto mt-6 ${
          additionalPlanCards.length === 1 ? 'grid-cols-1 max-w-md' :
          additionalPlanCards.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-3xl' :
          additionalPlanCards.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
          'grid-cols-2 md:grid-cols-4'
        }`}>
          {additionalPlanCards.map((plan) => {
            const isBestValue = bestDailyDuration?.duration === plan.duration &&
                               bestDailyDuration?.data_type === plan.dataType;
            return (
              <CompactPlanCard
                key={`${plan.duration}-${plan.dataType || 'unlimited'}`}
                plan={plan}
                isBestValue={isBestValue}
                currencySymbol={currencySymbol}
                destination={destination}
                locale={locale}
              />
            );
          })}
        </div>
      )}

      {/* Competitor comparison with link - only show if we have plans */}
      {competitorData && plans.length > 0 && (
        <div className="mt-12 text-center">
          <p className="text-navy-400 mb-3">
            Compare to {competitorData.name} roaming at{' '}
            <span className="font-semibold text-navy-500">
              {currencySymbol}{formatPrice(Number(competitorData.daily_rate), currency)}/day
            </span>
          </p>
          <Link
            href={`/compare/${competitorData.name.toLowerCase()}-vs-esim-${destination}`}
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium"
          >
            See full comparison
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </>
  );
}
