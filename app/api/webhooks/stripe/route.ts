import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe, getWebhookSecret, isTestMode } from '@/lib/stripe';
import { resend } from '@/lib/resend';
import { prisma } from '@/lib/db';
import {
  createEsimOrder,
  generateQrCodeString,
  EsimGoOrderResponse,
} from '@/lib/esimgo';

const webhookSecret = getWebhookSecret();

// Email sender - using verified Resend domain
const emailFrom = 'Jonathan from Trvel <noreply@e.trvel.co>';
const logoUrl = 'https://www.trvel.co/android-chrome-192x192.png';

// Generate order number: TRV-YYYYMMDD-XXX
async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `TRV-${dateStr}-`;

  // Find the highest order number for today
  const lastOrder = await prisma.order.findFirst({
    where: {
      order_number: {
        startsWith: prefix,
      },
    },
    orderBy: {
      order_number: 'desc',
    },
  });

  let nextNum = 1;
  if (lastOrder) {
    const lastNum = parseInt(lastOrder.order_number.split('-')[2], 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}${nextNum.toString().padStart(3, '0')}`;
}

// Get plan name based on duration
function getPlanName(duration: string | undefined): string {
  switch (duration) {
    case '5':
      return 'Quick Trip';
    case '7':
      return 'Week Explorer';
    case '15':
      return 'Extended Stay';
    default:
      return `${duration}-Day Plan`;
  }
}

// Helper function to retry provisioning and email for incomplete orders
async function retryOrderProvisioning(
  order: {
    id: number;
    order_number: string;
    destination_name: string;
    duration: number;
    esim_qr_code: string | null;
    confirmation_email_sent: boolean;
    bundle_name: string | null;
    amount_cents: number;
    currency: string;
  },
  session: Stripe.Checkout.Session,
  customerEmail: string,
  customerName: string | null,
  bundleName: string | undefined,
  destinationSlug: string | undefined,
  duration: string | undefined,
  locale: string | undefined
) {
  let esimData: {
    iccid: string | null;
    smdpAddress: string | null;
    matchingId: string | null;
    qrCodeString: string | null;
  } = {
    iccid: null,
    smdpAddress: null,
    matchingId: null,
    qrCodeString: order.esim_qr_code ? null : null, // Start fresh if not set
  };

  // If eSIM not yet provisioned, try to provision it
  if (!order.esim_qr_code && (bundleName || order.bundle_name)) {
    const bundle = bundleName || order.bundle_name;
    try {
      console.log(`Retrying eSIM provisioning (${isTestMode ? 'TEST' : 'LIVE'} mode):`, {
        bundle,
        orderReference: order.order_number,
      });

      if (isTestMode) {
        const mockIccid = `TEST-${Date.now()}`;
        const mockSmdpAddress = 'rsp.test.esim-go.io';
        const mockMatchingId = `TEST-${order.order_number}-${Math.random().toString(36).substring(7)}`;

        esimData = {
          iccid: mockIccid,
          smdpAddress: mockSmdpAddress,
          matchingId: mockMatchingId,
          qrCodeString: generateQrCodeString(mockSmdpAddress, mockMatchingId),
        };

        await prisma.order.update({
          where: { id: order.id },
          data: {
            esim_iccid: esimData.iccid,
            esim_smdp_address: esimData.smdpAddress,
            esim_matching_id: esimData.matchingId,
            esim_qr_code: esimData.qrCodeString,
            esim_provisioned_at: new Date(),
            esim_status: 'ordered',
          },
        });

        console.log('TEST MODE: Generated mock eSIM data for retry');
      } else {
        const esimResponse: EsimGoOrderResponse = await createEsimOrder(
          bundle!,
          order.order_number
        );

        console.log('eSIM Go retry response:', JSON.stringify(esimResponse, null, 2));

        const orderItem = esimResponse.order?.[0];
        const esimDetails = orderItem?.esims?.[0];

        if (esimDetails?.iccid && esimDetails?.smdpAddress && esimDetails?.matchingId) {
          esimData = {
            iccid: esimDetails.iccid,
            smdpAddress: esimDetails.smdpAddress,
            matchingId: esimDetails.matchingId,
            qrCodeString: generateQrCodeString(esimDetails.smdpAddress, esimDetails.matchingId),
          };

          await prisma.order.update({
            where: { id: order.id },
            data: {
              esim_iccid: esimData.iccid,
              esim_smdp_address: esimData.smdpAddress,
              esim_matching_id: esimData.matchingId,
              esim_qr_code: esimData.qrCodeString,
              esim_provisioned_at: new Date(),
              esim_status: 'ordered',
            },
          });

          console.log('eSIM provisioned successfully on retry:', { iccid: esimData.iccid });
        }
      }
    } catch (esimError) {
      console.error('Failed to provision eSIM on retry:', esimError);
      await prisma.order.update({
        where: { id: order.id },
        data: { esim_status: 'failed' },
      });
    }
  } else if (order.esim_qr_code) {
    // Order already has QR code, use it for email
    esimData.qrCodeString = order.esim_qr_code;
  }

  // If email not yet sent, send it
  if (!order.confirmation_email_sent) {
    const firstName = customerName?.split(' ')[0] || 'there';
    const planName = getPlanName(duration || String(order.duration));
    const destinationName = order.destination_name;
    const amountPaid = `${(order.amount_cents / 100).toFixed(2)} ${order.currency}`;

    console.log('Retrying confirmation email to:', customerEmail);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: emailFrom,
      to: customerEmail,
      subject: `Your ${destinationName} eSIM is ready! ✈️`,
      html: generateEmailHtml(
        firstName,
        esimData.qrCodeString,
        order.order_number,
        destinationName,
        planName,
        duration || String(order.duration),
        amountPaid
      ),
    });

    if (emailError) {
      console.error('Failed to send email on retry:', emailError);
    } else {
      console.log('Confirmation email sent on retry:', emailData);
      await prisma.order.update({
        where: { id: order.id },
        data: { confirmation_email_sent: true },
      });
    }
  }
}

// Generate email HTML (extracted to avoid duplication)
function generateEmailHtml(
  firstName: string,
  qrCodeString: string | null,
  orderNumber: string,
  destinationName: string,
  planName: string,
  duration: string,
  amountPaid: string
): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #010326; margin: 0; padding: 0; background-color: #fdfbf8;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px 20px;">

    <!-- Header with Logo -->
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${logoUrl}" alt="Trvel" width="48" height="48" style="border-radius: 12px; margin-bottom: 8px;">
      <h1 style="color: #63BFBF; font-size: 28px; margin: 0; font-weight: 700;">trvel</h1>
    </div>

    <!-- Main Card -->
    <div style="background: white; border-radius: 24px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(99, 191, 191, 0.15);">

      <!-- Greeting -->
      <p style="font-size: 18px; color: #010326; margin: 0 0 24px;">Hey ${firstName}! 👋</p>

      <!-- Success Message -->
      <div style="background: linear-gradient(135deg, #63BFBF 0%, #75cfcf 100%); border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: center;">
        <p style="color: white; font-size: 20px; font-weight: 600; margin: 0 0 8px;">${qrCodeString ? 'Your eSIM is ready!' : 'Payment confirmed!'}</p>
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 15px;">${qrCodeString ? 'Scan the QR code below to install' : 'Your eSIM for ' + destinationName + ' is on its way'}</p>
      </div>

      <!-- Order Number Badge -->
      <div style="text-align: center; margin-bottom: 32px;">
        <span style="display: inline-block; background: #e8f7f7; border: 2px solid #63BFBF; color: #4fa9a9; padding: 8px 20px; border-radius: 100px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">
          Order ${orderNumber}
        </span>
      </div>

      ${qrCodeString ? `
      <!-- QR Code Section -->
      <div style="background: #fdfbf8; border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: center;">
        <h3 style="font-size: 16px; color: #010326; margin: 0 0 16px; font-weight: 600;">📱 Your eSIM QR Code</h3>
        <div style="background: white; border-radius: 12px; padding: 16px; display: inline-block; border: 2px solid #F2E2CE;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeString)}" alt="eSIM QR Code" width="200" height="200" style="display: block;">
        </div>
        <p style="margin: 16px 0 8px; color: #585b76; font-size: 13px;">Scan this code from another device (laptop/tablet)</p>
        <p style="margin: 0; color: #888a9d; font-size: 11px; word-break: break-all;">Code: ${qrCodeString}</p>
      </div>

      <!-- Detailed Installation Instructions -->
      <div style="background: white; border: 2px solid #63BFBF; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <h3 style="font-size: 16px; color: #010326; margin: 0 0 20px; font-weight: 600;">📲 Step-by-step Installation</h3>

        <!-- iPhone Instructions -->
        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 12px; color: #010326; font-weight: 600; font-size: 14px;"> iPhone (iOS 17.4+)</p>
          <ol style="margin: 0; padding-left: 20px; color: #585b76; font-size: 14px; line-height: 1.8;">
            <li>Open <strong>Settings</strong> → <strong>Mobile Data</strong> → <strong>Add eSIM</strong></li>
            <li>Tap <strong>"Use QR Code"</strong></li>
            <li>Point camera at the QR code above</li>
            <li>Tap <strong>"Add eSIM"</strong> when prompted</li>
            <li>Label it as "Travel" or "${destinationName}"</li>
          </ol>
        </div>

        <!-- Android Instructions -->
        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 12px; color: #010326; font-weight: 600; font-size: 14px;">🤖 Android</p>
          <ol style="margin: 0; padding-left: 20px; color: #585b76; font-size: 14px; line-height: 1.8;">
            <li>Open <strong>Settings</strong> → <strong>Network & Internet</strong> → <strong>SIMs</strong></li>
            <li>Tap <strong>"Add eSIM"</strong> or <strong>"+"</strong></li>
            <li>Select <strong>"Scan QR code"</strong></li>
            <li>Point camera at the QR code above</li>
            <li>Follow prompts to complete setup</li>
          </ol>
        </div>

        <!-- Pro Tips -->
        <div style="background: #e8f7f7; border-radius: 12px; padding: 16px;">
          <p style="margin: 0 0 8px; color: #4fa9a9; font-weight: 600; font-size: 14px;">💡 Pro Tips</p>
          <ul style="margin: 0; padding-left: 18px; color: #585b76; font-size: 13px; line-height: 1.7;">
            <li><strong>Install before you travel</strong> - Set it up on WiFi at home</li>
            <li><strong>Don't delete it!</strong> - The QR code can only be used once</li>
            <li><strong>When you land:</strong> Turn on <strong>Data Roaming</strong> for the eSIM</li>
            <li>Your data plan starts when you first connect to a network in ${destinationName}</li>
          </ul>
        </div>
      </div>
      ` : ''}

      <!-- Order Details -->
      <div style="background: #fdfbf8; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #585b76; padding: 12px 0; border-bottom: 1px solid #F2E2CE; font-size: 15px;">Destination</td>
            <td style="font-weight: 600; color: #010326; text-align: right; padding: 12px 0; border-bottom: 1px solid #F2E2CE; font-size: 15px;">🌏 ${destinationName}</td>
          </tr>
          <tr>
            <td style="color: #585b76; padding: 12px 0; border-bottom: 1px solid #F2E2CE; font-size: 15px;">Plan</td>
            <td style="font-weight: 600; color: #010326; text-align: right; padding: 12px 0; border-bottom: 1px solid #F2E2CE; font-size: 15px;">${planName} (${duration} days)</td>
          </tr>
          <tr>
            <td style="color: #585b76; padding: 12px 0; border-bottom: 1px solid #F2E2CE; font-size: 15px;">Data</td>
            <td style="font-weight: 600; color: #63BFBF; text-align: right; padding: 12px 0; border-bottom: 1px solid #F2E2CE; font-size: 15px;">Unlimited</td>
          </tr>
          <tr>
            <td style="color: #010326; font-weight: 600; padding: 16px 0 0; font-size: 15px;">Total</td>
            <td style="font-weight: 700; color: #63BFBF; font-size: 20px; text-align: right; padding: 16px 0 0;">${amountPaid}</td>
          </tr>
        </table>
      </div>

      ${!qrCodeString ? `
      <!-- What's Next (only show when QR code NOT available) -->
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 18px; color: #010326; margin: 0 0 20px; font-weight: 600;">What happens next?</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; width: 44px; padding-bottom: 16px;">
              <div style="width: 32px; height: 32px; background: #63BFBF; border-radius: 50%; color: white; font-weight: 600; font-size: 14px; line-height: 32px; text-align: center;">1</div>
            </td>
            <td style="vertical-align: top; padding-bottom: 16px; padding-left: 12px;">
              <p style="margin: 0; color: #010326; font-weight: 500; font-size: 15px;">Check your inbox</p>
              <p style="margin: 4px 0 0; color: #585b76; font-size: 14px;">Your eSIM QR code arrives within 10 minutes</p>
            </td>
          </tr>
          <tr>
            <td style="vertical-align: top; width: 44px; padding-bottom: 16px;">
              <div style="width: 32px; height: 32px; background: #63BFBF; border-radius: 50%; color: white; font-weight: 600; font-size: 14px; line-height: 32px; text-align: center;">2</div>
            </td>
            <td style="vertical-align: top; padding-bottom: 16px; padding-left: 12px;">
              <p style="margin: 0; color: #010326; font-weight: 500; font-size: 15px;">Scan & install</p>
              <p style="margin: 4px 0 0; color: #585b76; font-size: 14px;">Use your phone camera to scan the QR code</p>
            </td>
          </tr>
          <tr>
            <td style="vertical-align: top; width: 44px;">
              <div style="width: 32px; height: 32px; background: #63BFBF; border-radius: 50%; color: white; font-weight: 600; font-size: 14px; line-height: 32px; text-align: center;">3</div>
            </td>
            <td style="vertical-align: top; padding-left: 12px;">
              <p style="margin: 0; color: #010326; font-weight: 500; font-size: 15px;">Land & connect</p>
              <p style="margin: 4px 0 0; color: #585b76; font-size: 14px;">Enable data roaming when you arrive - that's it!</p>
            </td>
          </tr>
        </table>
      </div>
      ` : ''}

      <!-- Support Card -->
      <div style="background: linear-gradient(135deg, #F2E2CE 0%, #f7efe4 100%); border-radius: 16px; padding: 20px; text-align: center;">
        <p style="margin: 0 0 4px; color: #010326; font-weight: 600;">Questions? I'm here to help!</p>
        <p style="margin: 0; color: #585b76; font-size: 14px;">
          Reply to this email or call us on +61 3 4052 7555
        </p>
      </div>
    </div>

    <!-- Personal Sign-off -->
    <div style="margin-top: 32px; padding: 0 8px;">
      <p style="color: #585b76; margin: 0 0 16px; font-size: 15px;">
        Thanks for choosing Trvel for your ${destinationName} trip! If you have any questions at all, just reply to this email - I personally read and respond to every message.
      </p>
      <p style="color: #010326; margin: 0; font-weight: 500;">
        Safe travels! ✈️<br>
        <span style="color: #63BFBF; font-weight: 600;">Jonathan</span><br>
        <span style="color: #585b76; font-size: 14px; font-weight: 400;">Founder of Trvel</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #F2E2CE;">
      <p style="color: #888a9d; font-size: 12px; margin: 0;">
        Trvel • Travel eSIMs made simple<br>
        <a href="https://www.trvel.co" style="color: #63BFBF; text-decoration: none;">trvel.co</a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function POST(request: NextRequest) {
  console.log('Webhook received');

  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  if (!signature || !webhookSecret) {
    console.error('Missing signature or webhook secret', {
      hasSignature: !!signature,
      hasSecret: !!webhookSecret,
    });
    return NextResponse.json(
      { error: 'Missing signature or webhook secret' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  // Handle the checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    console.log('Processing checkout.session.completed:', session.id);

    // Get customer email from the session
    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;
    const customerPhone = session.customer_details?.phone;

    if (!customerEmail) {
      console.error('No customer email found in session');
      return NextResponse.json({ received: true });
    }

    // Get metadata from the session
    const { destination_slug, duration, locale, bundle_name } = session.metadata || {};

    try {
      // Check if order already exists (webhook retry)
      const existingOrder = await prisma.order.findUnique({
        where: { stripe_session_id: session.id },
      });

      if (existingOrder) {
        // If order exists and is fully processed (eSIM + email), skip
        if (existingOrder.esim_qr_code && existingOrder.confirmation_email_sent) {
          console.log('Order already fully processed, skipping:', existingOrder.order_number);
          return NextResponse.json({ received: true, duplicate: true });
        }

        // Order exists but incomplete - need to retry provisioning/email
        console.log('Order exists but incomplete, retrying:', {
          orderNumber: existingOrder.order_number,
          hasQrCode: !!existingOrder.esim_qr_code,
          emailSent: existingOrder.confirmation_email_sent,
        });

        // Retry provisioning and email for this existing order
        await retryOrderProvisioning(
          existingOrder,
          session,
          customerEmail,
          customerName || null,
          bundle_name,
          destination_slug,
          duration,
          locale
        );

        return NextResponse.json({ received: true, retried: true });
      }

      // 1. Find or create customer
      let customer = await prisma.customer.findUnique({
        where: { email: customerEmail },
      });

      if (!customer) {
        customer = await prisma.customer.create({
          data: {
            email: customerEmail,
            name: customerName || null,
            phone: customerPhone || null,
          },
        });
        console.log('Created new customer:', customer.id);
      } else {
        // Update customer info if we have new data
        if (customerName || customerPhone) {
          customer = await prisma.customer.update({
            where: { id: customer.id },
            data: {
              name: customerName || customer.name,
              phone: customerPhone || customer.phone,
            },
          });
        }
        console.log('Found existing customer:', customer.id);
      }

      // 2. Fetch destination name from database
      let destinationName = destination_slug || 'your destination';
      if (destination_slug && locale) {
        const destination = await prisma.destination.findUnique({
          where: {
            slug_locale: {
              slug: destination_slug,
              locale: locale,
            },
          },
        });
        if (destination) {
          destinationName = destination.name;
        }
      }

      // 3. Generate order number and create order
      const orderNumber = await generateOrderNumber();
      const planName = getPlanName(duration);

      const order = await prisma.order.create({
        data: {
          order_number: orderNumber,
          customer_id: customer.id,
          destination_slug: destination_slug || 'unknown',
          destination_name: destinationName,
          duration: duration ? parseInt(duration, 10) : 0,
          plan_name: planName,
          bundle_name: bundle_name || null,
          amount_cents: session.amount_total || 0,
          currency: session.currency?.toUpperCase() || 'AUD',
          status: 'paid',
          stripe_session_id: session.id,
          stripe_payment_intent_id:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id || null,
          locale: locale || 'en-au',
          paidAt: new Date(),
        },
      });

      console.log('Created order:', order.order_number);

      // 4. Provision eSIM via eSIM Go API
      let esimData: {
        iccid: string | null;
        smdpAddress: string | null;
        matchingId: string | null;
        qrCodeString: string | null;
      } = {
        iccid: null,
        smdpAddress: null,
        matchingId: null,
        qrCodeString: null,
      };

      if (bundle_name) {
        try {
          console.log(`Provisioning eSIM via eSIM Go (${isTestMode ? 'TEST' : 'LIVE'} mode):`, {
            bundle_name,
            orderReference: orderNumber,
          });

          if (isTestMode) {
            // In TEST mode, eSIM Go "validate" doesn't return real eSIM data
            // Generate mock data for testing the email flow
            const mockIccid = `TEST-${Date.now()}`;
            const mockSmdpAddress = 'rsp.test.esim-go.io';
            const mockMatchingId = `TEST-${orderNumber}-${Math.random().toString(36).substring(7)}`;

            esimData = {
              iccid: mockIccid,
              smdpAddress: mockSmdpAddress,
              matchingId: mockMatchingId,
              qrCodeString: generateQrCodeString(mockSmdpAddress, mockMatchingId),
            };

            // Update order with test eSIM details
            await prisma.order.update({
              where: { id: order.id },
              data: {
                esim_iccid: esimData.iccid,
                esim_smdp_address: esimData.smdpAddress,
                esim_matching_id: esimData.matchingId,
                esim_qr_code: esimData.qrCodeString,
                esim_provisioned_at: new Date(),
                esim_status: 'ordered',
              },
            });

            console.log('TEST MODE: Generated mock eSIM data:', {
              iccid: esimData.iccid,
              qrCodeString: esimData.qrCodeString,
            });
          } else {
            // PRODUCTION mode: Call eSIM Go API
            const esimResponse: EsimGoOrderResponse = await createEsimOrder(
              bundle_name,
              orderNumber
            );

            console.log('eSIM Go full response:', JSON.stringify(esimResponse, null, 2));

            // Extract eSIM details from the response
            // Response format: { order: [{ type, item, quantity, esims: [{ iccid, smdpAddress, matchingId }] }], orderReference }
            const orderItem = esimResponse.order?.[0];
            const esimDetails = orderItem?.esims?.[0];

            if (esimDetails?.iccid && esimDetails?.smdpAddress && esimDetails?.matchingId) {
              esimData = {
                iccid: esimDetails.iccid,
                smdpAddress: esimDetails.smdpAddress,
                matchingId: esimDetails.matchingId,
                qrCodeString: generateQrCodeString(esimDetails.smdpAddress, esimDetails.matchingId),
              };

              // Update order with eSIM details
              await prisma.order.update({
                where: { id: order.id },
                data: {
                  esim_iccid: esimData.iccid,
                  esim_smdp_address: esimData.smdpAddress,
                  esim_matching_id: esimData.matchingId,
                  esim_qr_code: esimData.qrCodeString,
                  esim_provisioned_at: new Date(),
                  esim_status: 'ordered',
                },
              });

              console.log('eSIM provisioned successfully:', {
                iccid: esimData.iccid,
                orderReference: esimResponse.orderReference,
              });
            } else {
              console.warn('eSIM order created but missing assignment details:', {
                hasOrder: !!esimResponse.order,
                orderLength: esimResponse.order?.length,
                hasEsims: !!orderItem?.esims,
                esimsLength: orderItem?.esims?.length,
                response: esimResponse,
              });
            }
          }
        } catch (esimError) {
          console.error('Failed to provision eSIM:', esimError);
          // Update order status to indicate eSIM provisioning failed
          await prisma.order.update({
            where: { id: order.id },
            data: {
              esim_status: 'failed',
            },
          });
          // Continue to send email without QR code - manual intervention needed
        }
      } else {
        console.warn('No bundle_name in metadata, skipping eSIM provisioning');
      }

      // 5. Format amount for email
      const amountPaid = session.amount_total
        ? `${(session.amount_total / 100).toFixed(2)} ${session.currency?.toUpperCase()}`
        : 'Paid';

      // 6. Send confirmation email
      console.log('Sending confirmation email to:', customerEmail);

      // Get customer first name for personalization
      const firstName = customerName?.split(' ')[0] || 'there';

      const { data: emailData, error: emailError } = await resend.emails.send({
        from: emailFrom,
        to: customerEmail,
        subject: `Your ${destinationName} eSIM is ready! ✈️`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #010326; margin: 0; padding: 0; background-color: #fdfbf8;">
  <div style="max-width: 600px; margin: 0 auto; padding: 24px 20px;">

    <!-- Header with Logo -->
    <div style="text-align: center; margin-bottom: 20px;">
      <img src="${logoUrl}" alt="Trvel" width="48" height="48" style="border-radius: 12px; margin-bottom: 8px;">
      <h1 style="color: #63BFBF; font-size: 28px; margin: 0; font-weight: 700;">trvel</h1>
    </div>

    <!-- Main Card -->
    <div style="background: white; border-radius: 24px; padding: 40px 32px; box-shadow: 0 4px 24px rgba(99, 191, 191, 0.15);">

      <!-- Greeting -->
      <p style="font-size: 18px; color: #010326; margin: 0 0 24px;">Hey ${firstName}! 👋</p>

      <!-- Success Message -->
      <div style="background: linear-gradient(135deg, #63BFBF 0%, #75cfcf 100%); border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: center;">
        <p style="color: white; font-size: 20px; font-weight: 600; margin: 0 0 8px;">${esimData.qrCodeString ? 'Your eSIM is ready!' : 'Payment confirmed!'}</p>
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 15px;">${esimData.qrCodeString ? 'Scan the QR code below to install' : 'Your eSIM for ' + destinationName + ' is on its way'}</p>
      </div>

      <!-- Order Number Badge -->
      <div style="text-align: center; margin-bottom: 32px;">
        <span style="display: inline-block; background: #e8f7f7; border: 2px solid #63BFBF; color: #4fa9a9; padding: 8px 20px; border-radius: 100px; font-weight: 600; font-size: 14px; letter-spacing: 0.5px;">
          Order ${orderNumber}
        </span>
      </div>

      ${esimData.qrCodeString ? `
      <!-- QR Code Section -->
      <div style="background: #fdfbf8; border-radius: 16px; padding: 24px; margin-bottom: 32px; text-align: center;">
        <h3 style="font-size: 16px; color: #010326; margin: 0 0 16px; font-weight: 600;">📱 Your eSIM QR Code</h3>
        <div style="background: white; border-radius: 12px; padding: 16px; display: inline-block; border: 2px solid #F2E2CE;">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(esimData.qrCodeString)}" alt="eSIM QR Code" width="200" height="200" style="display: block;">
        </div>
        <p style="margin: 16px 0 8px; color: #585b76; font-size: 13px;">Scan this code from another device (laptop/tablet)</p>
        <p style="margin: 0; color: #888a9d; font-size: 11px; word-break: break-all;">Code: ${esimData.qrCodeString}</p>
      </div>

      <!-- Detailed Installation Instructions -->
      <div style="background: white; border: 2px solid #63BFBF; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <h3 style="font-size: 16px; color: #010326; margin: 0 0 20px; font-weight: 600;">📲 Step-by-step Installation</h3>

        <!-- iPhone Instructions -->
        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 12px; color: #010326; font-weight: 600; font-size: 14px;"> iPhone (iOS 17.4+)</p>
          <ol style="margin: 0; padding-left: 20px; color: #585b76; font-size: 14px; line-height: 1.8;">
            <li>Open <strong>Settings</strong> → <strong>Mobile Data</strong> → <strong>Add eSIM</strong></li>
            <li>Tap <strong>"Use QR Code"</strong></li>
            <li>Point camera at the QR code above</li>
            <li>Tap <strong>"Add eSIM"</strong> when prompted</li>
            <li>Label it as "Travel" or "${destinationName}"</li>
          </ol>
        </div>

        <!-- Android Instructions -->
        <div style="margin-bottom: 20px;">
          <p style="margin: 0 0 12px; color: #010326; font-weight: 600; font-size: 14px;">🤖 Android</p>
          <ol style="margin: 0; padding-left: 20px; color: #585b76; font-size: 14px; line-height: 1.8;">
            <li>Open <strong>Settings</strong> → <strong>Network & Internet</strong> → <strong>SIMs</strong></li>
            <li>Tap <strong>"Add eSIM"</strong> or <strong>"+"</strong></li>
            <li>Select <strong>"Scan QR code"</strong></li>
            <li>Point camera at the QR code above</li>
            <li>Follow prompts to complete setup</li>
          </ol>
        </div>

        <!-- Pro Tips -->
        <div style="background: #e8f7f7; border-radius: 12px; padding: 16px;">
          <p style="margin: 0 0 8px; color: #4fa9a9; font-weight: 600; font-size: 14px;">💡 Pro Tips</p>
          <ul style="margin: 0; padding-left: 18px; color: #585b76; font-size: 13px; line-height: 1.7;">
            <li><strong>Install before you travel</strong> - Set it up on WiFi at home</li>
            <li><strong>Don't delete it!</strong> - The QR code can only be used once</li>
            <li><strong>When you land:</strong> Turn on <strong>Data Roaming</strong> for the eSIM</li>
            <li>Your data plan starts when you first connect to a network in ${destinationName}</li>
          </ul>
        </div>
      </div>
      ` : ''}

      <!-- Order Details -->
      <div style="background: #fdfbf8; border-radius: 16px; padding: 24px; margin-bottom: 32px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #585b76; padding: 12px 0; border-bottom: 1px solid #F2E2CE; font-size: 15px;">Destination</td>
            <td style="font-weight: 600; color: #010326; text-align: right; padding: 12px 0; border-bottom: 1px solid #F2E2CE; font-size: 15px;">🌏 ${destinationName}</td>
          </tr>
          <tr>
            <td style="color: #585b76; padding: 12px 0; border-bottom: 1px solid #F2E2CE; font-size: 15px;">Plan</td>
            <td style="font-weight: 600; color: #010326; text-align: right; padding: 12px 0; border-bottom: 1px solid #F2E2CE; font-size: 15px;">${planName} (${duration} days)</td>
          </tr>
          <tr>
            <td style="color: #585b76; padding: 12px 0; border-bottom: 1px solid #F2E2CE; font-size: 15px;">Data</td>
            <td style="font-weight: 600; color: #63BFBF; text-align: right; padding: 12px 0; border-bottom: 1px solid #F2E2CE; font-size: 15px;">Unlimited</td>
          </tr>
          <tr>
            <td style="color: #010326; font-weight: 600; padding: 16px 0 0; font-size: 15px;">Total</td>
            <td style="font-weight: 700; color: #63BFBF; font-size: 20px; text-align: right; padding: 16px 0 0;">${amountPaid}</td>
          </tr>
        </table>
      </div>

      ${!esimData.qrCodeString ? `
      <!-- What's Next (only show when QR code NOT available) -->
      <div style="margin-bottom: 32px;">
        <h3 style="font-size: 18px; color: #010326; margin: 0 0 20px; font-weight: 600;">What happens next?</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="vertical-align: top; width: 44px; padding-bottom: 16px;">
              <div style="width: 32px; height: 32px; background: #63BFBF; border-radius: 50%; color: white; font-weight: 600; font-size: 14px; line-height: 32px; text-align: center;">1</div>
            </td>
            <td style="vertical-align: top; padding-bottom: 16px; padding-left: 12px;">
              <p style="margin: 0; color: #010326; font-weight: 500; font-size: 15px;">Check your inbox</p>
              <p style="margin: 4px 0 0; color: #585b76; font-size: 14px;">Your eSIM QR code arrives within 10 minutes</p>
            </td>
          </tr>
          <tr>
            <td style="vertical-align: top; width: 44px; padding-bottom: 16px;">
              <div style="width: 32px; height: 32px; background: #63BFBF; border-radius: 50%; color: white; font-weight: 600; font-size: 14px; line-height: 32px; text-align: center;">2</div>
            </td>
            <td style="vertical-align: top; padding-bottom: 16px; padding-left: 12px;">
              <p style="margin: 0; color: #010326; font-weight: 500; font-size: 15px;">Scan & install</p>
              <p style="margin: 4px 0 0; color: #585b76; font-size: 14px;">Use your phone camera to scan the QR code</p>
            </td>
          </tr>
          <tr>
            <td style="vertical-align: top; width: 44px;">
              <div style="width: 32px; height: 32px; background: #63BFBF; border-radius: 50%; color: white; font-weight: 600; font-size: 14px; line-height: 32px; text-align: center;">3</div>
            </td>
            <td style="vertical-align: top; padding-left: 12px;">
              <p style="margin: 0; color: #010326; font-weight: 500; font-size: 15px;">Land & connect</p>
              <p style="margin: 4px 0 0; color: #585b76; font-size: 14px;">Enable data roaming when you arrive - that's it!</p>
            </td>
          </tr>
        </table>
      </div>
      ` : ''}

      <!-- Support Card -->
      <div style="background: linear-gradient(135deg, #F2E2CE 0%, #f7efe4 100%); border-radius: 16px; padding: 20px; text-align: center;">
        <p style="margin: 0 0 4px; color: #010326; font-weight: 600;">Questions? I'm here to help!</p>
        <p style="margin: 0; color: #585b76; font-size: 14px;">
          Reply to this email or call us on +61 3 4052 7555
        </p>
      </div>
    </div>

    <!-- Personal Sign-off -->
    <div style="margin-top: 32px; padding: 0 8px;">
      <p style="color: #585b76; margin: 0 0 16px; font-size: 15px;">
        Thanks for choosing Trvel for your ${destinationName} trip! If you have any questions at all, just reply to this email - I personally read and respond to every message.
      </p>
      <p style="color: #010326; margin: 0; font-weight: 500;">
        Safe travels! ✈️<br>
        <span style="color: #63BFBF; font-weight: 600;">Jonathan</span><br>
        <span style="color: #585b76; font-size: 14px; font-weight: 400;">Founder of Trvel</span>
      </p>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #F2E2CE;">
      <p style="color: #888a9d; font-size: 12px; margin: 0;">
        Trvel • Travel eSIMs made simple<br>
        <a href="https://www.trvel.co" style="color: #63BFBF; text-decoration: none;">trvel.co</a>
      </p>
    </div>
  </div>
</body>
</html>
        `,
      });

      // 7. Update order with email status
      if (emailError) {
        console.error('Failed to send email:', emailError);
      } else {
        console.log('Confirmation email sent:', emailData);
        await prisma.order.update({
          where: { id: order.id },
          data: { confirmation_email_sent: true },
        });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      // Still return 200 to acknowledge receipt to Stripe
    }
  }

  return NextResponse.json({ received: true });
}
