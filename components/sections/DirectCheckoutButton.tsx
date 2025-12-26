'use client';

import { useState } from 'react';
import { Button } from '@/components/ui';
import { useDestination } from '@/contexts/DestinationContext';
import { getGclid } from '@/hooks/useGclid';

interface DirectCheckoutButtonProps {
  destination: string;
  duration: number;
  locale: string;
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

export function DirectCheckoutButton({
  destination,
  duration,
  locale,
  variant = 'primary',
  children,
}: DirectCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { selectedDestination, triggerPlansDropdownHighlight } = useDestination();

  const handleCheckout = async () => {
    // If no destination is selected (cycling mode), highlight the dropdown
    if (!selectedDestination) {
      triggerPlansDropdownHighlight();
      return;
    }

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
      // Fallback to checkout page on error
      window.location.href = `/${locale}/checkout?destination=${destination}&duration=${duration}`;
    }
  };

  return (
    <Button
      variant={variant}
      size="md"
      className="w-full"
      onClick={handleCheckout}
      disabled={isLoading}
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
        children
      )}
    </Button>
  );
}
