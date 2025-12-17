'use client';

import { useState, useEffect, useMemo } from 'react';
import { useLocale } from 'next-intl';
import { Header, Footer } from '@/components/layout';
import { Button } from '@/components/ui';
import {
  Globe,
  ChevronDown,
  Check,
  Zap,
  Star,
  TrendingUp,
  Shield,
  ArrowRight,
  Info,
} from 'lucide-react';
import {
  JP, TH, KR, SG, ID, MY, VN, PH, GB, FR, IT, US,
  type FlagComponent,
} from 'country-flag-icons/react/3x2';
import { isDestinationExcluded } from '@/lib/utils';

const destinations: { name: string; slug: string; Flag: FlagComponent }[] = [
  { name: 'Japan', slug: 'japan', Flag: JP },
  { name: 'Thailand', slug: 'thailand', Flag: TH },
  { name: 'South Korea', slug: 'south-korea', Flag: KR },
  { name: 'Singapore', slug: 'singapore', Flag: SG },
  { name: 'Indonesia', slug: 'indonesia', Flag: ID },
  { name: 'Malaysia', slug: 'malaysia', Flag: MY },
  { name: 'Vietnam', slug: 'vietnam', Flag: VN },
  { name: 'Philippines', slug: 'philippines', Flag: PH },
  { name: 'United Kingdom', slug: 'united-kingdom', Flag: GB },
  { name: 'France', slug: 'france', Flag: FR },
  { name: 'Italy', slug: 'italy', Flag: IT },
  { name: 'United States', slug: 'united-states', Flag: US },
];

interface Plan {
  currency: string;
  price_5day: number | null;
  price_7day: number | null;
  price_15day: number | null;
}

const planOptions = [
  { id: 'short', days: 5, priceKey: 'price_5day' as const, icon: Zap, label: '5 Days' },
  { id: 'week', days: 7, priceKey: 'price_7day' as const, icon: Star, label: '7 Days', popular: true },
  { id: 'extended', days: 15, priceKey: 'price_15day' as const, icon: TrendingUp, label: '15 Days' },
];

function getCurrencySymbol(currency: string): string {
  if (currency === 'IDR') return 'Rp';
  if (currency === 'GBP') return '£';
  if (currency === 'SGD') return 'S$';
  if (currency === 'MYR') return 'RM';
  return '$';
}

function formatPrice(price: number | null, currency: string): string {
  if (price === null) return '—';
  if (currency === 'IDR') return Math.round(price).toLocaleString('id-ID');
  return price.toFixed(2);
}

export default function GetStartedPage() {
  const locale = useLocale();
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number>(7);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [plansMap, setPlansMap] = useState<Record<string, Plan>>({});
  const [plansLoading, setPlansLoading] = useState(true);

  // Filter out home country
  const availableDestinations = useMemo(
    () => destinations.filter(d => !isDestinationExcluded(d.slug, locale)),
    [locale]
  );

  // Fetch plans on mount
  useEffect(() => {
    async function fetchPlans() {
      try {
        const response = await fetch(`/api/plans?locale=${locale}`);
        if (response.ok) {
          const data = await response.json();
          setPlansMap(data);
        }
      } catch (error) {
        console.error('Failed to fetch plans:', error);
      } finally {
        setPlansLoading(false);
      }
    }
    fetchPlans();
  }, [locale]);

  const selectedDest = destinations.find(d => d.slug === selectedDestination);
  const currentPlan = selectedDestination ? plansMap[selectedDestination] : null;
  const currency = currentPlan?.currency || 'AUD';
  const currencySymbol = getCurrencySymbol(currency);

  const handleCheckout = async () => {
    if (!selectedDestination) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: selectedDestination,
          duration: selectedDuration,
          locale,
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
      window.location.href = `/${locale}/checkout?destination=${selectedDestination}&duration=${selectedDuration}`;
    }
  };

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-18 min-h-screen bg-gradient-to-b from-cream-200 via-cream-100 to-white">
        <div className="container-wide py-12 md:py-20">
          <div className="max-w-xl mx-auto">
            {/* Header */}
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-700 rounded-full text-sm font-medium mb-4">
                <Globe className="w-4 h-4" />
                Travel eSIM
              </div>
              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-3">
                Get Started
              </h1>
              <p className="text-body-lg text-navy-300">
                Select your destination and plan to continue
              </p>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-soft border border-cream-200">
              {/* Step 1: Destination */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-navy-500 mb-3">
                  1. Where are you travelling to?
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full flex items-center justify-between gap-3 p-4 bg-cream-50 border border-cream-200 rounded-xl hover:border-brand-300 transition-colors text-left"
                  >
                    {selectedDest ? (
                      <div className="flex items-center gap-3">
                        <selectedDest.Flag className="w-8 h-auto rounded shadow-sm" />
                        <span className="font-medium text-navy-500">{selectedDest.name}</span>
                      </div>
                    ) : (
                      <span className="text-navy-400">Select a destination</span>
                    )}
                    <ChevronDown className={`w-5 h-5 text-navy-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white border border-cream-200 rounded-xl shadow-lg max-h-80 overflow-y-auto">
                      {availableDestinations.map((dest) => (
                        <button
                          key={dest.slug}
                          type="button"
                          onClick={() => {
                            setSelectedDestination(dest.slug);
                            setIsDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-4 hover:bg-cream-50 transition-colors text-left first:rounded-t-xl last:rounded-b-xl"
                        >
                          <dest.Flag className="w-8 h-auto rounded shadow-sm" />
                          <span className="font-medium text-navy-500">{dest.name}</span>
                          {selectedDestination === dest.slug && (
                            <Check className="w-5 h-5 text-brand-600 ml-auto" />
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Plan Duration */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-navy-500 mb-3">
                  2. How long is your trip?
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {planOptions.map((plan) => {
                    const Icon = plan.icon;
                    const price = currentPlan?.[plan.priceKey] ?? null;
                    const isSelected = selectedDuration === plan.days;

                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedDuration(plan.days)}
                        className={`relative p-4 rounded-xl border-2 transition-all text-center ${
                          isSelected
                            ? 'border-brand-500 bg-brand-50'
                            : 'border-cream-200 bg-cream-50 hover:border-brand-300'
                        }`}
                      >
                        {plan.popular && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                            <span className="px-2 py-0.5 bg-brand-500 text-white text-xs font-medium rounded-full">
                              Popular
                            </span>
                          </div>
                        )}
                        <Icon className={`w-5 h-5 mx-auto mb-2 ${isSelected ? 'text-brand-600' : 'text-navy-400'}`} />
                        <p className={`font-semibold ${isSelected ? 'text-brand-600' : 'text-navy-500'}`}>
                          {plan.label}
                        </p>
                        {plansLoading ? (
                          <div className="h-4 w-12 mx-auto mt-1 bg-gray-200 rounded animate-pulse" />
                        ) : price !== null ? (
                          <p className="text-sm text-navy-400 mt-1">
                            {currencySymbol}{formatPrice(price, currency)}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 mt-1">—</p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Plan Summary */}
              {selectedDestination && currentPlan && (() => {
                const totalPrice = currentPlan[`price_${selectedDuration}day` as keyof Plan] as number | null;
                const dailyRate = totalPrice ? totalPrice / selectedDuration : null;
                return (
                  <div className="bg-cream-50 rounded-xl p-4 mb-6 border border-cream-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-navy-400 text-sm">Your Plan</span>
                      <span className="font-semibold text-navy-500">
                        {selectedDest?.name} - {selectedDuration} Days
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-navy-400 text-sm">Total</span>
                      <div className="text-right">
                        <span className="text-xl font-bold text-brand-600">
                          {currencySymbol}{formatPrice(totalPrice, currency)}
                          <span className="text-sm font-normal text-navy-400 ml-1">{currency}</span>
                        </span>
                        {dailyRate && (
                          <p className="text-sm text-navy-400">
                            {currencySymbol}{formatPrice(dailyRate, currency)}/day
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Checkout Button */}
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handleCheckout}
                disabled={!selectedDestination || isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    Continue to Checkout
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>

              {/* Trust Signals */}
              <div className="flex items-center justify-center gap-4 mt-6 text-sm text-navy-400">
                <div className="flex items-center gap-1">
                  <Shield className="w-4 h-4 text-success-500" />
                  Secure checkout
                </div>
                <div className="flex items-center gap-1">
                  <Check className="w-4 h-4 text-success-500" />
                  Instant delivery
                </div>
              </div>
            </div>

            {/* Plan Features */}
            <div className="mt-8 bg-white rounded-2xl p-6 border border-cream-200">
              <h3 className="font-semibold text-navy-500 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-brand-600" />
                All Plans Include
              </h3>
              <ul className="space-y-3">
                {[
                  '1GB high-speed data per day (5G where available)',
                  'Unlimited data after at 1.25 Mbps',
                  'Instant eSIM delivery via email',
                  '24/7 WhatsApp support',
                  '10-minute connection guarantee',
                ].map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-navy-400">
                    <Check className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
