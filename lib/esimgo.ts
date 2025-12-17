import { isTestMode } from './stripe';

const ESIMGO_API_BASE = 'https://api.esim-go.com/v2.5';

// eSIM Go API response types
export interface EsimGoOrderItem {
  type: string;
  item: string;
  quantity: number;
  esims?: Array<{
    iccid: string;
    smdpAddress: string;
    matchingId: string;
  }>;
  iccids?: string[];
}

export interface EsimGoOrderResponse {
  order: EsimGoOrderItem[];
  total?: number;
  currency?: string;
  status?: string;
  orderReference: string;
}

export interface EsimGoAssignmentResponse {
  iccid: string;
  smdpAddress: string;
  matchingId: string;
  profileStatus: string;
}

export interface EsimGoError {
  error: string;
  message: string;
}

// Generate QR code string from eSIM data
export function generateQrCodeString(smdpAddress: string, matchingId: string): string {
  return `LPA:1$${smdpAddress}$${matchingId}`;
}

// Create an order with eSIM Go
// type: "transaction" for real orders, "validate" for test/validation
export async function createEsimOrder(
  bundleName: string,
  orderReference: string
): Promise<EsimGoOrderResponse> {
  const apiKey = process.env.ESIMGO_API_KEY;

  if (!apiKey) {
    throw new Error('ESIMGO_API_KEY not configured');
  }

  // In test mode, use "validate" to test without charging
  const orderType = isTestMode ? 'validate' : 'transaction';

  console.log(`Creating eSIM Go order (${orderType}):`, { bundleName, orderReference });

  const response = await fetch(`${ESIMGO_API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: orderType,
      assign: true,
      Order: [
        {
          type: 'bundle',
          quantity: 1,
          item: bundleName,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    console.error('eSIM Go order failed:', response.status, errorData);
    throw new Error(`eSIM Go API error: ${response.status} - ${errorData.message || errorData.error || 'Unknown error'}`);
  }

  const data = await response.json();
  console.log('eSIM Go order response:', data);
  return data;
}

// Get eSIM assignment details by order reference
export async function getEsimAssignment(orderReference: string): Promise<EsimGoAssignmentResponse | null> {
  const apiKey = process.env.ESIMGO_API_KEY;

  if (!apiKey) {
    throw new Error('ESIMGO_API_KEY not configured');
  }

  const response = await fetch(
    `${ESIMGO_API_BASE}/esims/assignments?reference=${encodeURIComponent(orderReference)}`,
    {
      headers: {
        'X-API-Key': apiKey,
      },
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return null;
    }
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`eSIM Go API error: ${response.status} - ${errorData.message || errorData.error}`);
  }

  const data = await response.json();
  return data[0] || null;
}

// Get bundle status for an eSIM
export async function getBundleStatus(iccid: string, bundleName: string) {
  const apiKey = process.env.ESIMGO_API_KEY;

  if (!apiKey) {
    throw new Error('ESIMGO_API_KEY not configured');
  }

  const response = await fetch(
    `${ESIMGO_API_BASE}/esims/${iccid}/bundles/${encodeURIComponent(bundleName)}`,
    {
      headers: {
        'X-API-Key': apiKey,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`eSIM Go API error: ${response.status} - ${errorData.message || errorData.error}`);
  }

  return response.json();
}

// Revoke a bundle (for testing/refunds - only works if not started)
export async function revokeBundle(iccid: string, bundleName: string) {
  const apiKey = process.env.ESIMGO_API_KEY;

  if (!apiKey) {
    throw new Error('ESIMGO_API_KEY not configured');
  }

  const response = await fetch(
    `${ESIMGO_API_BASE}/esims/${iccid}/bundles/${encodeURIComponent(bundleName)}`,
    {
      method: 'DELETE',
      headers: {
        'X-API-Key': apiKey,
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`eSIM Go API error: ${response.status} - ${errorData.message || errorData.error}`);
  }

  return response.json();
}

// Refund from inventory (for testing - within 60 days, if not started)
export async function refundFromInventory(bundleName: string, quantity: number = 1) {
  const apiKey = process.env.ESIMGO_API_KEY;

  if (!apiKey) {
    throw new Error('ESIMGO_API_KEY not configured');
  }

  const response = await fetch(`${ESIMGO_API_BASE}/inventory/refund`, {
    method: 'POST',
    headers: {
      'X-API-Key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      item: bundleName,
      quantity,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(`eSIM Go API error: ${response.status} - ${errorData.message || errorData.error}`);
  }

  return response.json();
}
