/**
 * Hook to capture and manage Google Click ID (gclid)
 *
 * When someone clicks a Google Ad, Google adds ?gclid=... to the URL.
 * This hook captures it and stores it in localStorage so we can pass it
 * to Stripe checkout for server-side conversion attribution.
 *
 * The gclid is valid for 90 days according to Google's documentation.
 */

import { useEffect, useCallback } from 'react';

const GCLID_STORAGE_KEY = 'gclid';
const GCLID_TIMESTAMP_KEY = 'gclid_timestamp';
const GCLID_EXPIRY_DAYS = 90;

/**
 * Get the stored gclid from localStorage
 * Returns null if not found or expired
 */
export function getGclid(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const gclid = localStorage.getItem(GCLID_STORAGE_KEY);
    const timestamp = localStorage.getItem(GCLID_TIMESTAMP_KEY);

    console.log('getGclid called:', { gclid, timestamp });

    if (!gclid || !timestamp) {
      console.log('getGclid returning null - missing gclid or timestamp');
      return null;
    }

    // Check if gclid has expired (90 days)
    const storedTime = parseInt(timestamp, 10);
    const now = Date.now();
    const expiryMs = GCLID_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

    if (now - storedTime > expiryMs) {
      // Expired - clean up
      localStorage.removeItem(GCLID_STORAGE_KEY);
      localStorage.removeItem(GCLID_TIMESTAMP_KEY);
      return null;
    }

    return gclid;
  } catch (error) {
    // localStorage might be blocked
    console.warn('Failed to get gclid from localStorage:', error);
    return null;
  }
}

/**
 * Store gclid in localStorage with timestamp
 */
function setGclid(gclid: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(GCLID_STORAGE_KEY, gclid);
    localStorage.setItem(GCLID_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Failed to store gclid in localStorage:', error);
  }
}

/**
 * Hook to capture gclid from URL and manage it in localStorage
 *
 * Usage:
 * ```tsx
 * function MyComponent() {
 *   const gclid = useGclid();
 *   // gclid is available to pass to checkout
 * }
 * ```
 */
export function useGclid(): string | null {
  // Capture gclid from URL on mount
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const gclidFromUrl = urlParams.get('gclid');

    if (gclidFromUrl) {
      // New gclid from URL - store it
      setGclid(gclidFromUrl);
      console.log('Captured gclid from URL:', gclidFromUrl.substring(0, 20) + '...');
    }
  }, []);

  // Return stored gclid (from URL or previous session)
  return getGclid();
}

/**
 * Hook that provides gclid capture on page load
 *
 * This is used in the GoogleAdsCapture component that's
 * added to the root layout.
 */
export function useGclidCapture(): void {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const gclidFromUrl = urlParams.get('gclid');

    if (gclidFromUrl) {
      setGclid(gclidFromUrl);
      console.log('Captured gclid from Google Ads click:', gclidFromUrl.substring(0, 20) + '...');
    }
  }, []);
}

/**
 * Clear stored gclid
 * Useful after successful conversion or for testing
 */
export function clearGclid(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(GCLID_STORAGE_KEY);
    localStorage.removeItem(GCLID_TIMESTAMP_KEY);
  } catch (error) {
    console.warn('Failed to clear gclid from localStorage:', error);
  }
}
