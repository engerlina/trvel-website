'use client';

import { useCallback, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from '@stripe/react-stripe-js';
import { getGclid } from '@/hooks/useGclid';

// Get the appropriate publishable key (supports test mode via env vars)
// Set TEST_MODE=true and TEST_NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY for test mode
const getPublishableKey = () => {
  if (process.env.NEXT_PUBLIC_TEST_MODE === 'true') {
    return process.env.NEXT_PUBLIC_TEST_STRIPE_PUBLISHABLE_KEY || '';
  }
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '';
};

// Initialize Stripe outside component to avoid recreating on each render
const stripePromise = loadStripe(getPublishableKey());

interface EmbeddedCheckoutProps {
  destination: string;
  duration: number;
  locale: string;
  promoCode?: string;
}

export default function EmbeddedCheckoutComponent({
  destination,
  duration,
  locale,
  promoCode,
}: EmbeddedCheckoutProps) {
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    // Get gclid for Google Ads attribution
    const gclid = getGclid();

    const response = await fetch('/api/checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        destination,
        duration,
        locale,
        promoCode,
        embedded: true,
        ...(gclid && { gclid }),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error || 'Failed to create checkout session');
      throw new Error(data.error || 'Failed to create checkout session');
    }

    return data.clientSecret;
  }, [destination, duration, locale, promoCode]);

  const options = { fetchClientSecret };

  if (error) {
    return (
      <div className="bg-accent-50 border border-accent-200 rounded-xl p-6 text-center">
        <p className="text-accent-600 font-medium">Unable to load checkout</p>
        <p className="text-accent-500 text-sm mt-2">{error}</p>
        <button
          onClick={() => {
            setError(null);
            window.location.reload();
          }}
          className="mt-4 px-4 py-2 bg-brand-400 text-white rounded-lg hover:bg-brand-500 transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div id="checkout" className="w-full">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout className="w-full" />
      </EmbeddedCheckoutProvider>
    </div>
  );
}
