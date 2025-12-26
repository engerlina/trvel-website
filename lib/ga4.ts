/**
 * GA4 Measurement Protocol
 *
 * Server-side event tracking that ensures 100% of purchase events are tracked,
 * bypassing client-side blockers and tracking prevention.
 *
 * Documentation: https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */

interface GA4PurchaseEvent {
  clientId: string;
  transactionId: string;
  value: number;
  currency: string;
  items?: Array<{
    item_id?: string;
    item_name: string;
    item_category?: string;
    price?: number;
    quantity?: number;
  }>;
  // Additional parameters
  destination?: string;
  duration?: number;
  locale?: string;
}

interface GA4Response {
  success: boolean;
  error?: string;
}

/**
 * Send a purchase event to GA4 via Measurement Protocol
 *
 * This sends the event server-side, ensuring it's tracked even when:
 * - Client-side GA4 is blocked
 * - User has ad blockers
 * - iOS tracking prevention is active
 */
export async function sendGA4PurchaseEvent(data: GA4PurchaseEvent): Promise<GA4Response> {
  const measurementId = process.env.GA4_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-LQP0KHTXLH';
  const apiSecret = process.env.GA4_API_SECRET;

  if (!apiSecret) {
    console.warn('GA4 API secret not configured - skipping server-side tracking');
    return { success: false, error: 'GA4 API secret not configured' };
  }

  // Use gclid as client_id for attribution, or generate a unique one
  // If we have a gclid, use it to maintain attribution chain
  const clientId = data.clientId || `server.${Date.now()}.${Math.random().toString(36).substring(2)}`;

  const payload = {
    client_id: clientId,
    events: [
      {
        name: 'purchase',
        params: {
          transaction_id: data.transactionId,
          value: data.value,
          currency: data.currency.toUpperCase(),
          items: data.items || [
            {
              item_name: data.destination ? `${data.destination} eSIM` : 'eSIM',
              item_category: 'eSIM',
              price: data.value,
              quantity: 1,
            },
          ],
          // Custom parameters for analysis
          ...(data.destination && { destination: data.destination }),
          ...(data.duration && { duration: data.duration }),
          ...(data.locale && { locale: data.locale }),
        },
      },
    ],
  };

  try {
    console.log('Sending GA4 purchase event:', {
      measurementId,
      clientId: clientId.substring(0, 20) + '...',
      transactionId: data.transactionId,
      value: data.value,
      currency: data.currency,
    });

    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    // GA4 Measurement Protocol returns 204 No Content on success
    // It doesn't return error details, so we check status code
    if (response.status === 204 || response.ok) {
      console.log('GA4 purchase event sent successfully');
      return { success: true };
    }

    const errorText = await response.text();
    console.error('GA4 event failed:', { status: response.status, error: errorText });
    return {
      success: false,
      error: `HTTP ${response.status}: ${errorText}`,
    };
  } catch (error) {
    console.error('Error sending GA4 purchase event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send a custom event to GA4 via Measurement Protocol
 *
 * Useful for tracking other server-side events like:
 * - Refunds
 * - eSIM provisioning success/failure
 * - Email delivery status
 */
export async function sendGA4Event(
  eventName: string,
  clientId: string,
  params: Record<string, string | number | boolean>
): Promise<GA4Response> {
  const measurementId = process.env.GA4_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-LQP0KHTXLH';
  const apiSecret = process.env.GA4_API_SECRET;

  if (!apiSecret) {
    console.warn('GA4 API secret not configured - skipping server-side tracking');
    return { success: false, error: 'GA4 API secret not configured' };
  }

  const payload = {
    client_id: clientId || `server.${Date.now()}.${Math.random().toString(36).substring(2)}`,
    events: [
      {
        name: eventName,
        params,
      },
    ],
  };

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    if (response.status === 204 || response.ok) {
      return { success: true };
    }

    return { success: false, error: `HTTP ${response.status}` };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if GA4 Measurement Protocol is configured
 */
export function isGA4Configured(): boolean {
  return !!process.env.GA4_API_SECRET;
}

/**
 * Validate the GA4 Measurement Protocol setup using the debug endpoint
 *
 * Use this during development to verify events are correctly formatted.
 * Returns validation messages from Google.
 */
export async function validateGA4Event(
  eventName: string,
  clientId: string,
  params: Record<string, string | number | boolean>
): Promise<{ valid: boolean; messages: string[] }> {
  const measurementId = process.env.GA4_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-LQP0KHTXLH';
  const apiSecret = process.env.GA4_API_SECRET;

  if (!apiSecret) {
    return { valid: false, messages: ['GA4 API secret not configured'] };
  }

  const payload = {
    client_id: clientId || `debug.${Date.now()}`,
    events: [
      {
        name: eventName,
        params,
      },
    ],
  };

  try {
    const response = await fetch(
      `https://www.google-analytics.com/debug/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }
    );

    const data = await response.json();

    const messages: string[] = [];
    if (data.validationMessages) {
      for (const msg of data.validationMessages) {
        messages.push(`${msg.fieldPath}: ${msg.description}`);
      }
    }

    return {
      valid: data.validationMessages?.length === 0,
      messages,
    };
  } catch (error) {
    return {
      valid: false,
      messages: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
}
