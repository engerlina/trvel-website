/**
 * Re-send a failed Google Ads conversion
 *
 * Usage: npx tsx scripts/resend-conversion.ts <gclid> <value> <currency> <orderId>
 */

import 'dotenv/config';

const GCLID = process.argv[2];
const VALUE = parseFloat(process.argv[3] || '33.49');
const CURRENCY = process.argv[4] || 'AUD';
const ORDER_ID = process.argv[5] || 'TRV-20251229-001';
const DATETIME = process.argv[6]; // Optional: specific datetime in format "2025-12-29 01:18:58+00:00"

if (!GCLID) {
  console.error('Usage: npx tsx scripts/resend-conversion.ts <gclid> [value] [currency] [orderId]');
  console.error('Example: npx tsx scripts/resend-conversion.ts "Cj0KCQiAx8..." 33.49 AUD TRV-20251229-001');
  process.exit(1);
}

async function getAccessToken(): Promise<string | null> {
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    console.error('Missing OAuth credentials');
    return null;
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!tokenResponse.ok) {
    console.error('Failed to get access token:', await tokenResponse.text());
    return null;
  }

  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

async function uploadConversion() {
  console.log('═══════════════════════════════════════');
  console.log('Re-sending Google Ads Conversion');
  console.log('═══════════════════════════════════════\n');

  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '');
  const conversionActionId = process.env.GOOGLE_ADS_CONVERSION_ACTION_ID;
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;

  if (!customerId || !conversionActionId || !developerToken) {
    console.error('Missing Google Ads configuration');
    process.exit(1);
  }

  console.log('Configuration:');
  console.log('  Customer ID:', customerId);
  console.log('  Conversion Action ID:', conversionActionId);
  console.log('  gclid:', GCLID.substring(0, 30) + '...');
  console.log('  Value:', VALUE, CURRENCY);
  console.log('  Order ID:', ORDER_ID);
  console.log();

  const accessToken = await getAccessToken();
  if (!accessToken) {
    console.error('Failed to get access token');
    process.exit(1);
  }
  console.log('✅ OAuth access token obtained\n');

  // Format conversion datetime
  let conversionDateTime: string;
  if (DATETIME) {
    conversionDateTime = DATETIME;
  } else {
    const now = new Date();
    const offset = -now.getTimezoneOffset();
    const offsetHours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0');
    const offsetMinutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
    const offsetSign = offset >= 0 ? '+' : '-';
    conversionDateTime = now.toISOString().replace('T', ' ').replace('Z', '').slice(0, 19) + offsetSign + offsetHours + ':' + offsetMinutes;
  }

  const requestBody = {
    conversions: [{
      gclid: GCLID,
      conversionAction: `customers/${customerId}/conversionActions/${conversionActionId}`,
      conversionDateTime,
      conversionValue: VALUE,
      currencyCode: CURRENCY,
      orderId: ORDER_ID,
    }],
    partialFailure: true,
  };

  console.log('Sending to Google Ads API v22...');
  console.log('  DateTime:', conversionDateTime);
  console.log();

  const response = await fetch(
    `https://googleads.googleapis.com/v22/customers/${customerId}:uploadClickConversions`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'developer-token': developerToken,
        // Note: Do NOT use login-customer-id - it causes permission errors
      },
      body: JSON.stringify(requestBody),
    }
  );

  const responseData = await response.json();

  if (!response.ok) {
    console.error('❌ Upload failed:', response.status);
    console.error(JSON.stringify(responseData, null, 2));
    process.exit(1);
  }

  if (responseData.partialFailureError) {
    console.log('⚠️  Partial failure:');
    console.log(JSON.stringify(responseData.partialFailureError, null, 2));
  } else {
    console.log('✅ Conversion uploaded successfully!');
    console.log(JSON.stringify(responseData, null, 2));
  }
}

uploadConversion().catch(console.error);
