'use client';

import { useState } from 'react';
import { Check, ArrowRight, Infinity, Database } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getGclid } from '@/hooks/useGclid';
import { DataTier } from '@/types';

interface DestinationPlanCardProps {
  name: string;
  subtext?: string;
  price: string;
  perDay: string;
  popular: boolean;
  currencySymbol: string;
  destination: string;
  duration: number;
  locale: string;
  dataType?: DataTier;
  dataAmountMb?: number;
}

// Get the data tier display info
function getDataTierInfo(dataType?: DataTier, dataAmountMb?: number): {
  label: string;
  shortLabel: string;
  isUnlimited: boolean;
  Icon: React.ComponentType<{ className?: string }>;
} {
  const isUnlimited = !dataType || dataType === 'unlimited';

  if (isUnlimited) {
    return {
      label: 'Unlimited data',
      shortLabel: 'Unlimited',
      isUnlimited: true,
      Icon: Infinity,
    };
  }

  // Calculate GB from MB
  const gbAmount = dataAmountMb ? Math.round(dataAmountMb / 1000) : parseInt(dataType?.replace('gb', '') || '1');

  return {
    label: `${gbAmount}GB data`,
    shortLabel: `${gbAmount}GB`,
    isUnlimited: false,
    Icon: Database,
  };
}

export function DestinationPlanCard({
  name,
  subtext,
  price,
  perDay,
  popular,
  currencySymbol,
  destination,
  duration,
  locale,
  dataType,
  dataAmountMb,
}: DestinationPlanCardProps) {
  const [isLoading, setIsLoading] = useState(false);
  const tierInfo = getDataTierInfo(dataType, dataAmountMb);
  const DataIcon = tierInfo.Icon;

  const handleCheckout = async () => {
    setIsLoading(true);

    // Get gclid for Google Ads attribution
    const gclid = getGclid();

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination,
          duration,
          locale,
          ...(gclid && { gclid }),
          ...(dataType && { dataType }),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session');
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      window.location.href = `/${locale}/checkout?destination=${destination}&duration=${duration}`;
    }
  };

  // Determine card styling based on tier and popularity
  const isUnlimited = tierInfo.isUnlimited;

  return (
    <div
      className={`relative rounded-2xl overflow-hidden transition-all ${
        popular
          ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-xl shadow-brand-500/25 scale-105 z-10'
          : isUnlimited
          ? 'bg-cream-50 border-2 border-brand-200 hover:border-brand-300 hover:shadow-lg'
          : 'bg-cream-50 border-2 border-amber-200 hover:border-amber-300 hover:shadow-lg'
      }`}
    >
      {/* Data Tier Indicator Bar - only for non-popular cards */}
      {!popular && (
        <div
          className={`h-1.5 w-full ${
            isUnlimited
              ? 'bg-gradient-to-r from-brand-400 to-brand-500'
              : 'bg-gradient-to-r from-amber-400 to-amber-500'
          }`}
        />
      )}

      {/* Popular badge */}
      {popular && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10">
          <span className="px-4 py-1 bg-accent-500 text-white text-sm font-semibold rounded-full shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      <div className={`text-center p-6 ${popular ? 'pt-10' : 'pt-5'}`}>
        {/* Data Tier Badge */}
        <div className="mb-3">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${
              popular
                ? 'bg-white/20 text-white'
                : isUnlimited
                ? 'bg-brand-100 text-brand-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            <DataIcon className="w-4 h-4" />
            {tierInfo.label}
          </span>
        </div>

        <h3 className={`text-lg font-semibold ${popular ? 'text-white' : 'text-navy-500'}`}>
          {name}
        </h3>
        {subtext && (
          <p className={`text-sm mb-2 ${popular ? 'text-brand-100' : 'text-navy-400'}`}>
            {subtext}
          </p>
        )}
        {!subtext && <div className="mb-2" />}

        <div className="mb-4">
          <span className={`text-4xl font-bold ${popular ? 'text-white' : 'text-navy-500'}`}>
            {currencySymbol}{price}
          </span>
        </div>

        <p className={`text-sm mb-6 ${popular ? 'text-brand-100' : 'text-navy-400'}`}>
          {currencySymbol}{perDay}/day
        </p>

        {/* Features */}
        <ul className={`space-y-3 mb-6 text-left ${popular ? 'text-brand-100' : 'text-navy-400'}`}>
          {/* Data feature - styled by tier */}
          <li className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                popular
                  ? 'bg-white/20'
                  : isUnlimited
                  ? 'bg-brand-100'
                  : 'bg-amber-100'
              }`}
            >
              <DataIcon
                className={`w-3 h-3 ${
                  popular
                    ? 'text-white'
                    : isUnlimited
                    ? 'text-brand-600'
                    : 'text-amber-600'
                }`}
              />
            </div>
            <span
              className={`font-medium ${
                popular
                  ? 'text-white'
                  : isUnlimited
                  ? 'text-brand-700'
                  : 'text-amber-700'
              }`}
            >
              {tierInfo.label}
            </span>
          </li>
          <li className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                popular ? 'bg-white/20' : 'bg-brand-100'
              }`}
            >
              <Check className={`w-3 h-3 ${popular ? 'text-white' : 'text-brand-600'}`} />
            </div>
            Premium network
          </li>
          <li className="flex items-center gap-2">
            <div
              className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                popular ? 'bg-white/20' : 'bg-brand-100'
              }`}
            >
              <Check className={`w-3 h-3 ${popular ? 'text-white' : 'text-brand-600'}`} />
            </div>
            24/7 live support
          </li>
        </ul>

        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className={`block w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50 ${
            popular
              ? 'bg-white text-brand-600 hover:bg-cream-50'
              : isUnlimited
              ? 'bg-brand-500 text-white hover:bg-brand-600'
              : 'bg-amber-500 text-white hover:bg-amber-600'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Processing...
            </span>
          ) : (
            'Get Started'
          )}
        </button>

        {/* Budget label for fixed data plans */}
        {!popular && !isUnlimited && (
          <p className="text-center text-sm text-amber-600 mt-3 font-medium">
            Great for maps, messaging & social media
          </p>
        )}

        {/* Link to duration-specific page for SEO */}
        <Link
          href={`/esim/${destination}/${duration}-day`}
          className={`mt-3 flex items-center justify-center gap-1 text-sm transition-colors ${
            popular
              ? 'text-brand-100 hover:text-white'
              : 'text-navy-400 hover:text-brand-600'
          }`}
        >
          Learn more
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
