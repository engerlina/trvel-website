/**
 * Test script for Google Ads and GA4 conversion tracking
 *
 * Run with: npx tsx scripts/test-conversions.ts
 */

import { config } from 'dotenv';
// Load from .env (production vars) then .env.local (local overrides)
config({ path: '.env' });
config({ path: '.env.local', override: true });

async function getAccessToken(): Promise<string | null> {
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    console.log('❌ Google Ads OAuth credentials not configured');
    return null;
  }

  try {
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
      const error = await tokenResponse.text();
      console.log('❌ Failed to get access token:', error);
      return null;
    }

    const tokenData = await tokenResponse.json();
    console.log('✅ OAuth access token obtained');
    return tokenData.access_token;
  } catch (error) {
    console.log('❌ Error getting access token:', error);
    return null;
  }
}

async function testGoogleAdsConversion() {
  console.log('\n═══════════════════════════════════════');
  console.log('🔍 Testing Google Ads Conversion API');
  console.log('═══════════════════════════════════════\n');

  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  const conversionActionId = process.env.GOOGLE_ADS_CONVERSION_ACTION_ID;
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID;

  console.log('Configuration:');
  console.log('  Customer ID:', customerId || '❌ NOT SET');
  console.log('  Conversion Action ID:', conversionActionId || '❌ NOT SET');
  console.log('  Developer Token:', developerToken ? '✅ Set' : '❌ NOT SET');
  console.log('  Login Customer ID (MCC):', loginCustomerId || '(not using MCC)');

  if (!customerId || !conversionActionId || !developerToken) {
    console.log('\n❌ Missing required Google Ads configuration');
    return false;
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return false;
  }

  // Format conversion datetime
  const now = new Date();
  const offset = -now.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0');
  const offsetMinutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
  const offsetSign = offset >= 0 ? '+' : '-';
  const conversionDateTime = now.toISOString().replace('T', ' ').replace('Z', '').slice(0, 19) + offsetSign + offsetHours + ':' + offsetMinutes;

  const formattedCustomerId = customerId.replace(/-/g, '');
  const formattedLoginCustomerId = loginCustomerId?.replace(/-/g, '');
  const testGclid = `test_gclid_${Date.now()}`;
  const testOrderId = `TEST-${Date.now()}`;

  const requestBody = {
    conversions: [{
      gclid: testGclid,
      conversionAction: `customers/${formattedCustomerId}/conversionActions/${conversionActionId}`,
      conversionDateTime,
      conversionValue: 9.99,
      currencyCode: 'AUD',
      orderId: testOrderId,
    }],
    partialFailure: true,
  };

  console.log('\nTest conversion data:');
  console.log('  gclid:', testGclid);
  console.log('  value: $9.99 AUD');
  console.log('  orderId:', testOrderId);
  console.log('  dateTime:', conversionDateTime);
  console.log('  conversionAction:', `customers/${formattedCustomerId}/conversionActions/${conversionActionId}`);

  // Test with latest API version
  const version = 'v22';

  // Test different account configurations
  const configs = [
    {
      name: 'Client account (with MCC login)',
      customerId: formattedCustomerId,
      loginCustomerId: formattedLoginCustomerId,
      conversionAction: `customers/${formattedCustomerId}/conversionActions/${conversionActionId}`,
    },
    {
      name: 'Client account (without MCC login)',
      customerId: formattedCustomerId,
      loginCustomerId: null,
      conversionAction: `customers/${formattedCustomerId}/conversionActions/${conversionActionId}`,
    },
    {
      name: 'MCC account (as customer)',
      customerId: formattedLoginCustomerId,
      loginCustomerId: null,
      conversionAction: `customers/${formattedLoginCustomerId}/conversionActions/${conversionActionId}`,
    },
  ];

  for (const config of configs) {
    if (!config.customerId) continue;

    console.log(`\n--- Testing: ${config.name} ---`);

    const url = `https://googleads.googleapis.com/${version}/customers/${config.customerId}:uploadClickConversions`;
    console.log('  URL:', url);

    // Update conversion action in request body for this config
    const testRequestBody = {
      conversions: [{
        gclid: testGclid,
        conversionAction: config.conversionAction,
        conversionDateTime,
        conversionValue: 9.99,
        currencyCode: 'AUD',
        orderId: testOrderId,
      }],
      partialFailure: true,
    };

    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'developer-token': developerToken,
    };

    if (config.loginCustomerId) {
      headers['login-customer-id'] = config.loginCustomerId;
      console.log('  login-customer-id:', config.loginCustomerId);
    }

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(testRequestBody),
      });

      const responseText = await response.text();

      // Try to parse as JSON
      let responseData;
      try {
        responseData = JSON.parse(responseText);
      } catch {
        console.log(`  ❌ ${version}: HTTP ${response.status} - non-JSON response`);
        continue; // Try next version
      }

      if (!response.ok) {
        console.log(`  ❌ ${version}: HTTP ${response.status}`);
        console.log('     Error:', responseData.error?.message || JSON.stringify(responseData));

        // If we get a real error (not 404), this version works but has an issue
        if (response.status !== 404) {
          console.log('\n📋 Full error response:');
          console.log(JSON.stringify(responseData, null, 2));
        }
        continue;
      }

      // Success!
      if (responseData.partialFailureError) {
        console.log(`  ✅ ${version}: API is working! (partial failure expected for test gclid)`);
        console.log('     Message:', responseData.partialFailureError.message);
        return true;
      }

      console.log(`  ✅ ${version}: Conversion uploaded successfully!`);
      return true;
    } catch (error) {
      console.log(`  ❌ ${version}: Request failed -`, error);
      continue;
    }
  }

  console.log('\n❌ All API versions failed');
  return false;
}

async function testGA4Event() {
  console.log('\n═══════════════════════════════════════');
  console.log('🔍 Testing GA4 Measurement Protocol');
  console.log('═══════════════════════════════════════\n');

  const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || process.env.GA4_MEASUREMENT_ID;
  const apiSecret = process.env.GA4_API_SECRET;

  console.log('Configuration:');
  console.log('  Measurement ID:', measurementId || '❌ NOT SET');
  console.log('  API Secret:', apiSecret ? '✅ Set' : '❌ NOT SET');

  if (!measurementId || !apiSecret) {
    console.log('\n❌ Missing required GA4 configuration');
    return false;
  }

  const testClientId = `test.${Date.now()}`;
  const testTransactionId = `test_txn_${Date.now()}`;

  const payload = {
    client_id: testClientId,
    events: [{
      name: 'purchase',
      params: {
        transaction_id: testTransactionId,
        value: 9.99,
        currency: 'AUD',
        items: [{
          item_name: 'Test eSIM',
          item_category: 'eSIM',
          price: 9.99,
          quantity: 1,
        }],
      },
    }],
  };

  console.log('\nSending test purchase event:');
  console.log('  client_id:', testClientId);
  console.log('  transaction_id:', testTransactionId);
  console.log('  value: $9.99 AUD');

  try {
    const response = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    );

    if (response.status === 204 || response.ok) {
      console.log('\n✅ GA4 purchase event sent successfully!');
      console.log('   Check GA4 Realtime reports to see the event');
      return true;
    } else {
      const text = await response.text();
      console.log('\n❌ GA4 Error:', response.status, text);
      return false;
    }
  } catch (error) {
    console.log('\n❌ Request failed:', error);
    return false;
  }
}

async function main() {
  console.log('╔═══════════════════════════════════════════════════════╗');
  console.log('║     Conversion Tracking Test Script                   ║');
  console.log('╚═══════════════════════════════════════════════════════╝');

  const googleAdsResult = await testGoogleAdsConversion();
  const ga4Result = await testGA4Event();

  console.log('\n═══════════════════════════════════════');
  console.log('📊 Summary');
  console.log('═══════════════════════════════════════');
  console.log(`Google Ads API: ${googleAdsResult ? '✅ Working' : '❌ Failed'}`);
  console.log(`GA4 API:        ${ga4Result ? '✅ Working' : '❌ Failed'}`);

  if (googleAdsResult && ga4Result) {
    console.log('\n🎉 Both conversion APIs are working!');
  } else if (ga4Result && !googleAdsResult) {
    console.log('\n⚠️  GA4 is working. Google Ads may need:');
    console.log('   - Basic Access (not Explorer) in API Center');
    console.log('   - Google Ads API enabled in Cloud Console');
  }
}

main().catch(console.error);
