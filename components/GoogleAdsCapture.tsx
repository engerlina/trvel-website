'use client';

import { useGclidCapture } from '@/hooks/useGclid';

/**
 * Invisible component that captures Google Click ID (gclid) from URL
 *
 * Add this to your root layout to capture gclid on every page load.
 * When a user clicks a Google Ad, they arrive with ?gclid=... in the URL.
 * This component captures that value and stores it in localStorage.
 *
 * The gclid is then passed to Stripe checkout as client_reference_id,
 * which allows the webhook to attribute the conversion back to Google Ads.
 */
export function GoogleAdsCapture() {
  useGclidCapture();

  // This component renders nothing - it just captures the gclid
  return null;
}
