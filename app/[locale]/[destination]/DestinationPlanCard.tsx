'use client';

import { useState } from 'react';
import { Check, ArrowRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { getGclid } from '@/hooks/useGclid';

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
}: DestinationPlanCardProps) {
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div
      className={`relative rounded-2xl p-6 transition-all ${
        popular
          ? 'bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-xl shadow-brand-500/25 scale-105 z-10'
          : 'bg-cream-50 border border-cream-200 hover:border-brand-200 hover:shadow-lg'
      }`}
    >
      {/* Popular badge */}
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="px-4 py-1 bg-accent-500 text-white text-sm font-semibold rounded-full shadow-lg">
            Most Popular
          </span>
        </div>
      )}

      <div className="text-center pt-4">
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
          <li className="flex items-center gap-2">
            <Check className={`w-4 h-4 ${popular ? 'text-brand-200' : 'text-brand-500'}`} />
            Unlimited data
          </li>
          <li className="flex items-center gap-2">
            <Check className={`w-4 h-4 ${popular ? 'text-brand-200' : 'text-brand-500'}`} />
            Premium network
          </li>
          <li className="flex items-center gap-2">
            <Check className={`w-4 h-4 ${popular ? 'text-brand-200' : 'text-brand-500'}`} />
            24/7 live chat & phone support
          </li>
        </ul>

        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className={`block w-full py-3 rounded-xl font-semibold transition-all disabled:opacity-50 ${
            popular
              ? 'bg-white text-brand-600 hover:bg-cream-50'
              : 'bg-brand-500 text-white hover:bg-brand-600'
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
