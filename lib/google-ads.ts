/**
 * Google Ads Conversion API
 *
 * Server-side conversion tracking that bypasses:
 * - Ad blockers
 * - iOS tracking loss
 * - Safari cookie deletion
 * - Stripe redirect attribution loss
 *
 * Documentation: https://developers.google.com/google-ads/api/docs/conversions/upload-clicks
 */

interface ConversionData {
  gclid: string;
  conversionValue: number;
  currencyCode: string;
  orderId?: string;
}

interface GoogleAdsResponse {
  success: boolean;
  error?: string;
  partialFailureError?: string;
}

// Get OAuth2 access token using service account
async function getAccessToken(): Promise<string | null> {
  const serviceAccountEmail = process.env.GOOGLE_ADS_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_ADS_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!serviceAccountEmail || !privateKey) {
    console.warn('Google Ads service account credentials not configured');
    return null;
  }

  try {
    // Create JWT for service account authentication
    const now = Math.floor(Date.now() / 1000);
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };
    const payload = {
      iss: serviceAccountEmail,
      scope: 'https://www.googleapis.com/auth/adwords',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    };

    // Note: In production, use a proper JWT library like jose or jsonwebtoken
    // For now, we'll use the simpler refresh token approach
    const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
    const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      console.warn('Google Ads OAuth credentials not configured');
      return null;
    }

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
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

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Failed to get Google Ads access token:', error);
      return null;
    }

    const tokenData = await tokenResponse.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting Google Ads access token:', error);
    return null;
  }
}

/**
 * Upload a click conversion to Google Ads
 *
 * This sends the conversion data server-side, ensuring 100% of conversions
 * are tracked regardless of client-side blockers.
 */
export async function uploadClickConversion(data: ConversionData): Promise<GoogleAdsResponse> {
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  const conversionActionId = process.env.GOOGLE_ADS_CONVERSION_ACTION_ID;

  if (!customerId || !conversionActionId) {
    console.warn('Google Ads configuration missing - skipping conversion upload', {
      hasCustomerId: !!customerId,
      hasConversionActionId: !!conversionActionId,
    });
    return { success: false, error: 'Google Ads not configured' };
  }

  if (!data.gclid) {
    console.warn('No gclid provided - cannot attribute conversion to Google Ads');
    return { success: false, error: 'No gclid provided' };
  }

  const accessToken = await getAccessToken();
  if (!accessToken) {
    return { success: false, error: 'Failed to get access token' };
  }

  // Format conversion datetime in the required format: yyyy-mm-dd hh:mm:ss+|-hh:mm
  const now = new Date();
  const offset = -now.getTimezoneOffset();
  const offsetHours = Math.floor(Math.abs(offset) / 60).toString().padStart(2, '0');
  const offsetMinutes = (Math.abs(offset) % 60).toString().padStart(2, '0');
  const offsetSign = offset >= 0 ? '+' : '-';
  const conversionDateTime = now.toISOString().replace('T', ' ').replace('Z', '').slice(0, 19) + offsetSign + offsetHours + ':' + offsetMinutes;

  // Remove dashes from customer ID (Google Ads API format)
  const formattedCustomerId = customerId.replace(/-/g, '');

  const requestBody = {
    conversions: [
      {
        gclid: data.gclid,
        conversionAction: `customers/${formattedCustomerId}/conversionActions/${conversionActionId}`,
        conversionDateTime,
        conversionValue: data.conversionValue,
        currencyCode: data.currencyCode.toUpperCase(),
        ...(data.orderId && { orderId: data.orderId }),
      },
    ],
    partialFailure: true,
  };

  try {
    console.log('Uploading Google Ads conversion:', {
      customerId: formattedCustomerId,
      conversionActionId,
      gclid: data.gclid.substring(0, 20) + '...',
      value: data.conversionValue,
      currency: data.currencyCode,
      orderId: data.orderId,
    });

    const response = await fetch(
      `https://googleads.googleapis.com/v18/customers/${formattedCustomerId}:uploadClickConversions`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'developer-token': process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '',
          ...(process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID && {
            'login-customer-id': process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID.replace(/-/g, ''),
          }),
        },
        body: JSON.stringify(requestBody),
      }
    );

    const responseData = await response.json();

    if (!response.ok) {
      console.error('Google Ads conversion upload failed:', responseData);
      return {
        success: false,
        error: responseData.error?.message || 'Upload failed',
      };
    }

    // Check for partial failures
    if (responseData.partialFailureError) {
      console.warn('Google Ads partial failure:', responseData.partialFailureError);
      return {
        success: true,
        partialFailureError: responseData.partialFailureError.message,
      };
    }

    console.log('Google Ads conversion uploaded successfully:', {
      results: responseData.results,
    });

    return { success: true };
  } catch (error) {
    console.error('Error uploading Google Ads conversion:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Check if Google Ads conversion tracking is configured
 */
export function isGoogleAdsConfigured(): boolean {
  return !!(
    process.env.GOOGLE_ADS_CUSTOMER_ID &&
    process.env.GOOGLE_ADS_CONVERSION_ACTION_ID &&
    process.env.GOOGLE_ADS_DEVELOPER_TOKEN &&
    (process.env.GOOGLE_ADS_REFRESH_TOKEN || process.env.GOOGLE_ADS_PRIVATE_KEY)
  );
}
