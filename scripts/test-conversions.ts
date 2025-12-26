/**
 * Test script to verify Google Ads and GA4 conversion tracking setup
 *
 * Run with: npx tsx scripts/test-conversions.ts
 */

import 'dotenv/config';

// Colors for terminal output
const green = '\x1b[32m';
const red = '\x1b[31m';
const yellow = '\x1b[33m';
const reset = '\x1b[0m';
const bold = '\x1b[1m';

async function testGoogleAdsConfig() {
  console.log('\n' + bold + '=== Google Ads Configuration ===' + reset);

  const config = {
    customerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
    conversionActionId: process.env.GOOGLE_ADS_CONVERSION_ACTION_ID,
    developerToken: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
    clientId: process.env.GOOGLE_ADS_CLIENT_ID,
    clientSecret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    refreshToken: process.env.GOOGLE_ADS_REFRESH_TOKEN,
    loginCustomerId: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
  };

  let allConfigured = true;

  // Check each required config
  const required = ['customerId', 'conversionActionId', 'developerToken', 'clientId', 'clientSecret', 'refreshToken'];

  for (const key of required) {
    const value = config[key as keyof typeof config];
    if (value) {
      const masked = key.includes('Secret') || key.includes('Token')
        ? value.substring(0, 10) + '...'
        : value;
      console.log(`${green}✓${reset} ${key}: ${masked}`);
    } else {
      console.log(`${red}✗${reset} ${key}: NOT SET`);
      allConfigured = false;
    }
  }

  // Optional config
  if (config.loginCustomerId) {
    console.log(`${green}✓${reset} loginCustomerId (MCC): ${config.loginCustomerId}`);
  } else {
    console.log(`${yellow}○${reset} loginCustomerId (MCC): Not set (OK if not using MCC)`);
  }

  return allConfigured;
}

async function testGoogleAdsAuth() {
  console.log('\n' + bold + '=== Testing Google Ads OAuth ===' + reset);

  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    console.log(`${red}✗${reset} Missing OAuth credentials - skipping auth test`);
    return false;
  }

  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(`${green}✓${reset} OAuth token refresh successful`);
      console.log(`  Access token: ${data.access_token.substring(0, 20)}...`);
      console.log(`  Expires in: ${data.expires_in} seconds`);
      return data.access_token;
    } else {
      const error = await response.text();
      console.log(`${red}✗${reset} OAuth token refresh failed: ${error}`);
      return null;
    }
  } catch (error) {
    console.log(`${red}✗${reset} OAuth error: ${error}`);
    return null;
  }
}

async function testGoogleAdsAPI(accessToken: string) {
  console.log('\n' + bold + '=== Testing Google Ads API Access ===' + reset);

  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID?.replace(/-/g, '');
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const loginCustomerId = process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID?.replace(/-/g, '');

  if (!customerId || !developerToken) {
    console.log(`${red}✗${reset} Missing customer ID or developer token`);
    return false;
  }

  try {
    // Test by fetching account info
    const headers: Record<string, string> = {
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'Content-Type': 'application/json',
    };

    if (loginCustomerId) {
      headers['login-customer-id'] = loginCustomerId;
    }

    const response = await fetch(
      `https://googleads.googleapis.com/v18/customers/${customerId}`,
      { headers }
    );

    if (response.ok) {
      const data = await response.json();
      console.log(`${green}✓${reset} Google Ads API accessible`);
      console.log(`  Account: ${data.descriptiveName || 'N/A'}`);
      console.log(`  Currency: ${data.currencyCode || 'N/A'}`);
      return true;
    } else {
      const error = await response.json();
      console.log(`${red}✗${reset} API error: ${JSON.stringify(error, null, 2)}`);

      // Common error explanations
      if (error.error?.status === 'PERMISSION_DENIED') {
        console.log(`${yellow}  Hint: Check that your developer token has the right access level`);
        console.log(`  Hint: If using MCC, set GOOGLE_ADS_LOGIN_CUSTOMER_ID to your MCC ID${reset}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`${red}✗${reset} Request failed: ${error}`);
    return false;
  }
}

async function testGA4Config() {
  console.log('\n' + bold + '=== GA4 Configuration ===' + reset);

  const measurementId = process.env.GA4_MEASUREMENT_ID || process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || 'G-LQP0KHTXLH';
  const apiSecret = process.env.GA4_API_SECRET;

  console.log(`${green}✓${reset} Measurement ID: ${measurementId}`);

  if (apiSecret) {
    console.log(`${green}✓${reset} API Secret: ${apiSecret.substring(0, 10)}...`);
    return { measurementId, apiSecret };
  } else {
    console.log(`${red}✗${reset} GA4_API_SECRET: NOT SET`);
    return null;
  }
}

async function testGA4Debug(measurementId: string, apiSecret: string) {
  console.log('\n' + bold + '=== Testing GA4 Debug Endpoint ===' + reset);

  const testPayload = {
    client_id: `test.${Date.now()}`,
    events: [
      {
        name: 'purchase',
        params: {
          transaction_id: `TEST-${Date.now()}`,
          value: 29.99,
          currency: 'AUD',
          items: [
            {
              item_name: 'Test eSIM',
              item_category: 'eSIM',
              price: 29.99,
              quantity: 1,
            },
          ],
        },
      },
    ],
  };

  try {
    const response = await fetch(
      `https://www.google-analytics.com/debug/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      }
    );

    const data = await response.json();

    if (data.validationMessages && data.validationMessages.length === 0) {
      console.log(`${green}✓${reset} GA4 event validation passed`);
      console.log(`  Event format is correct and will be accepted`);
      return true;
    } else if (data.validationMessages) {
      console.log(`${yellow}!${reset} GA4 validation warnings:`);
      for (const msg of data.validationMessages) {
        console.log(`  - ${msg.fieldPath}: ${msg.description}`);
      }
      return false;
    }
  } catch (error) {
    console.log(`${red}✗${reset} GA4 debug request failed: ${error}`);
    return false;
  }
}

async function main() {
  console.log(bold + '\n🔍 TRVEL CONVERSION TRACKING TEST\n' + reset);
  console.log('Testing your Google Ads and GA4 server-side conversion setup...\n');

  // Test Google Ads
  const googleAdsConfigured = await testGoogleAdsConfig();

  let googleAdsWorking = false;
  if (googleAdsConfigured) {
    const accessToken = await testGoogleAdsAuth();
    if (accessToken) {
      googleAdsWorking = await testGoogleAdsAPI(accessToken);
    }
  }

  // Test GA4
  const ga4Config = await testGA4Config();

  let ga4Working = false;
  if (ga4Config) {
    ga4Working = await testGA4Debug(ga4Config.measurementId, ga4Config.apiSecret);
  }

  // Summary
  console.log('\n' + bold + '=== SUMMARY ===' + reset);
  console.log(`Google Ads: ${googleAdsWorking ? green + '✓ Ready' : red + '✗ Not working'}${reset}`);
  console.log(`GA4:        ${ga4Working ? green + '✓ Ready' : red + '✗ Not working'}${reset}`);

  if (googleAdsWorking && ga4Working) {
    console.log(`\n${green}${bold}All systems ready!${reset}`);
    console.log('\nTo test a real conversion:');
    console.log('1. Visit your site with ?gclid=test_click_id_12345');
    console.log('2. Complete a test purchase');
    console.log('3. Check Vercel logs for "Google Ads conversion uploaded" and "GA4 purchase event sent"');
  } else {
    console.log(`\n${yellow}Some components need attention. Fix the issues above.${reset}`);
  }

  console.log('\n');
}

main().catch(console.error);
