/**
 * Script to manually process a Stripe checkout session
 * Run with: npx tsx prisma/process-session.ts <session_id>
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';

// Force-load .env file
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const prisma = new PrismaClient();
const isTestMode = envConfig.TEST_MODE === 'true';

const stripeKey = isTestMode ? envConfig.TEST_STRIPE_SECRET_KEY : envConfig.STRIPE_SECRET_KEY;
const stripe = new Stripe(stripeKey, { apiVersion: '2023-10-16' });

const resend = new Resend(envConfig.RESEND_API_KEY);

// eSIM Go API
const ESIMGO_API_URL = 'https://api.esim-go.com/v2.3';
const ESIMGO_API_TOKEN = envConfig.ESIMGO_API_TOKEN;

// Destination names
const destinationNames: Record<string, string> = {
  'france': 'France',
  'indonesia': 'Indonesia',
  'italy': 'Italy',
  'japan': 'Japan',
  'malaysia': 'Malaysia',
  'philippines': 'Philippines',
  'singapore': 'Singapore',
  'south-korea': 'South Korea',
  'thailand': 'Thailand',
  'united-kingdom': 'United Kingdom',
  'united-states': 'United States',
  'vietnam': 'Vietnam',
};

// Generate order number
async function generateOrderNumber(): Promise<string> {
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `TRV-${dateStr}-`;

  const lastOrder = await prisma.order.findFirst({
    where: { order_number: { startsWith: prefix } },
    orderBy: { order_number: 'desc' },
  });

  let nextNum = 1;
  if (lastOrder) {
    const lastNum = parseInt(lastOrder.order_number.split('-')[2], 10);
    nextNum = lastNum + 1;
  }

  return `${prefix}${nextNum.toString().padStart(3, '0')}`;
}

// Get plan name
function getPlanName(duration: string | undefined): string {
  switch (duration) {
    case '5': return 'Quick Trip';
    case '7': return 'Week Explorer';
    case '15': return 'Extended Stay';
    default: return `${duration}-Day Plan`;
  }
}

// Create eSIM order
async function createEsimOrder(bundleName: string) {
  const response = await fetch(`${ESIMGO_API_URL}/orders`, {
    method: 'POST',
    headers: {
      'X-API-Key': ESIMGO_API_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: isTestMode ? 'validate' : 'transaction',
      assign: true,
      Order: [{ type: 'bundle', item: bundleName, quantity: 1 }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`eSIM Go API error: ${error}`);
  }

  return response.json();
}

// Get eSIM details
async function getEsimDetails(iccid: string) {
  const response = await fetch(`${ESIMGO_API_URL}/esims/${iccid}?includeQrCode=true`, {
    headers: { 'X-API-Key': ESIMGO_API_TOKEN },
  });

  if (!response.ok) return null;
  return response.json();
}

// Generate QR code string
function generateQrCodeString(esimDetails: any): string | null {
  if (!esimDetails) return null;
  const { smdpAddress, matchingId } = esimDetails;
  if (!smdpAddress || !matchingId) return null;
  return `LPA:1$${smdpAddress}$${matchingId}`;
}

async function main() {
  const sessionId = process.argv[2];

  if (!sessionId) {
    console.error('Usage: npx tsx prisma/process-session.ts <session_id>');
    process.exit(1);
  }

  console.log(`Processing session: ${sessionId}`);
  console.log(`Mode: ${isTestMode ? 'TEST' : 'PRODUCTION'}`);

  // Fetch session from Stripe
  const session = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ['customer_details'],
  });

  console.log(`Session status: ${session.status}`);
  console.log(`Payment status: ${session.payment_status}`);

  if (session.payment_status !== 'paid') {
    console.error('Session is not paid!');
    process.exit(1);
  }

  const metadata = session.metadata || {};
  const customerEmail = session.customer_details?.email || '';
  const destinationSlug = metadata.destination_slug || '';
  const duration = metadata.duration || '';
  const bundleName = metadata.bundle_name || '';
  const locale = metadata.locale || 'en-au';

  const destinationName = destinationNames[destinationSlug] || destinationSlug;
  const planName = getPlanName(duration);

  console.log(`\nOrder details:`);
  console.log(`  Customer: ${customerEmail}`);
  console.log(`  Destination: ${destinationName}`);
  console.log(`  Plan: ${planName} (${duration} days)`);
  console.log(`  Bundle: ${bundleName}`);

  // Check if order already exists
  const existingOrder = await prisma.order.findUnique({
    where: { stripe_session_id: sessionId },
  });

  if (existingOrder) {
    console.log(`\nOrder already exists: ${existingOrder.order_number}`);
    console.log(`QR Code: ${existingOrder.esim_qr_code || 'Not available'}`);
    return;
  }

  // Create eSIM order
  let esimData: any = {
    orderReference: null,
    iccid: null,
    qrCodeString: null,
  };

  if (bundleName) {
    console.log(`\nOrdering eSIM...`);

    if (isTestMode) {
      // Mock data for test mode
      esimData = {
        orderReference: `MOCK-${Date.now()}`,
        iccid: `8901234567890123456`,
        qrCodeString: 'LPA:1$mock.smdp.test.com$MOCK-MATCHING-ID',
      };
      console.log(`  Mock eSIM created`);
    } else {
      try {
        const orderResult = await createEsimOrder(bundleName);
        console.log(`  eSIM Go order:`, orderResult);

        const iccid = orderResult.order?.[0]?.iccid || orderResult.order?.[0]?.iccids?.[0];
        if (iccid) {
          esimData.orderReference = orderResult.orderReference;
          esimData.iccid = iccid;

          // Get QR code
          const esimDetails = await getEsimDetails(iccid);
          esimData.qrCodeString = generateQrCodeString(esimDetails);
          console.log(`  QR Code: ${esimData.qrCodeString}`);
        }
      } catch (error) {
        console.error(`  eSIM order failed:`, error);
      }
    }
  }

  // Generate order number
  const orderNumber = await generateOrderNumber();
  console.log(`\nCreating order: ${orderNumber}`);

  // Create order in database
  const order = await prisma.order.create({
    data: {
      order_number: orderNumber,
      stripe_session_id: sessionId,
      stripe_payment_intent_id: session.payment_intent as string || null,
      customer_email: customerEmail,
      destination_slug: destinationSlug,
      destination_name: destinationName,
      plan_name: planName,
      duration: parseInt(duration, 10),
      amount_cents: session.amount_total || 0,
      currency: session.currency?.toUpperCase() || 'AUD',
      locale: locale,
      status: 'completed',
      esim_order_reference: esimData.orderReference,
      esim_iccid: esimData.iccid,
      esim_qr_code: esimData.qrCodeString,
      esim_status: esimData.qrCodeString ? 'delivered' : 'pending',
    },
  });

  console.log(`Order created!`);

  // Send email
  if (customerEmail && esimData.qrCodeString) {
    console.log(`\nSending email to ${customerEmail}...`);

    const amountPaid = session.amount_total === 0
      ? 'FREE'
      : `${session.currency?.toUpperCase()} ${((session.amount_total || 0) / 100).toFixed(2)}`;

    await resend.emails.send({
      from: 'Jonathan from Trvel <noreply@e.trvel.co>',
      to: customerEmail,
      subject: `Your ${destinationName} eSIM is ready! - Order ${orderNumber}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #63BFBF;">Your eSIM is Ready!</h1>
          <p>Hi there! Your eSIM for ${destinationName} is ready to install.</p>

          <div style="background: #f9f9f9; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <h3>Scan this QR code to install:</h3>
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(esimData.qrCodeString)}" alt="eSIM QR Code" width="200" height="200">
            <p style="font-size: 12px; color: #666; word-break: break-all;">${esimData.qrCodeString}</p>
          </div>

          <h3>Quick Install Steps:</h3>
          <ul>
            <li><strong>iPhone:</strong> Settings → Mobile Data → Add eSIM → Use QR Code</li>
            <li><strong>Android:</strong> Settings → Network → SIMs → Add eSIM</li>
            <li>Enable <strong>Data Roaming</strong> when you land!</li>
          </ul>

          <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Order:</strong> ${orderNumber}</p>
            <p><strong>Destination:</strong> ${destinationName}</p>
            <p><strong>Plan:</strong> ${planName} (${duration} days)</p>
            <p><strong>Total:</strong> ${amountPaid}</p>
          </div>

          <p>Questions? Reply to this email or message us on WhatsApp 24/7.</p>
          <p>Have a great trip!<br>- Jonathan from Trvel</p>
        </div>
      `,
    });

    console.log(`Email sent!`);
  }

  console.log(`\nDone! Refresh the success page to see the QR code.`);
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
