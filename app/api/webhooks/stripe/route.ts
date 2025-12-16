import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { resend } from '@/lib/resend';
import { prisma } from '@/lib/db';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// Email sender - using verified Resend domain
const emailFrom = 'Trvel <noreply@e.trvel.co>';

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

      // 4. Format amount for email
      const amountPaid = session.amount_total
        ? `${(session.amount_total / 100).toFixed(2)} ${session.currency?.toUpperCase()}`
        : 'Paid';

      // 5. Send confirmation email
      console.log('Sending confirmation email to:', customerEmail);

      const { data: emailData, error: emailError } = await resend.emails.send({
        from: emailFrom,
        to: customerEmail,
        subject: `Order ${orderNumber} - Your eSIM for ${destinationName} is Ready!`,
        html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #1e3a5f; margin: 0; padding: 0; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <!-- Header -->
    <div style="text-align: center; margin-bottom: 40px;">
      <h1 style="color: #0284c7; font-size: 28px; margin: 0;">Trvel</h1>
      <p style="color: #64748b; margin: 8px 0 0;">Your Travel eSIM Provider</p>
    </div>

    <!-- Main Card -->
    <div style="background: white; border-radius: 16px; padding: 32px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
      <!-- Success Icon -->
      <div style="text-align: center; margin-bottom: 24px;">
        <div style="display: inline-block; background: #dcfce7; border-radius: 50%; padding: 16px;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </div>
      </div>

      <h2 style="text-align: center; font-size: 24px; color: #1e3a5f; margin: 0 0 8px;">Payment Confirmed!</h2>
      <p style="text-align: center; color: #64748b; margin: 0 0 32px;">Your eSIM is being prepared for your trip.</p>

      <!-- Order Number -->
      <div style="text-align: center; margin-bottom: 24px;">
        <p style="color: #64748b; margin: 0 0 4px; font-size: 14px;">Order Number</p>
        <p style="color: #0284c7; font-size: 20px; font-weight: 700; margin: 0; letter-spacing: 1px;">${orderNumber}</p>
      </div>

      <!-- Order Details -->
      <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
        <h3 style="font-size: 14px; text-transform: uppercase; color: #64748b; margin: 0 0 16px; letter-spacing: 0.5px;">Order Details</h3>

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="color: #64748b; padding: 8px 0;">Destination</td>
            <td style="font-weight: 600; color: #1e3a5f; text-align: right; padding: 8px 0;">${destinationName}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 8px 0;">Plan</td>
            <td style="font-weight: 600; color: #1e3a5f; text-align: right; padding: 8px 0;">${planName} (${duration} days)</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 8px 0;">Data</td>
            <td style="font-weight: 600; color: #22c55e; text-align: right; padding: 8px 0;">Unlimited</td>
          </tr>
        </table>

        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;">

        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="font-weight: 600; color: #1e3a5f; padding: 8px 0;">Total Paid</td>
            <td style="font-weight: 700; color: #0284c7; font-size: 18px; text-align: right; padding: 8px 0;">${amountPaid}</td>
          </tr>
        </table>
      </div>

      <!-- Next Steps -->
      <div style="margin-bottom: 24px;">
        <h3 style="font-size: 16px; color: #1e3a5f; margin: 0 0 16px;">What's Next?</h3>
        <ol style="margin: 0; padding-left: 20px; color: #475569;">
          <li style="margin-bottom: 8px;">You'll receive your eSIM QR code within 10 minutes</li>
          <li style="margin-bottom: 8px;">Scan the QR code to install your eSIM</li>
          <li style="margin-bottom: 8px;">Activate when you arrive in ${destinationName}</li>
          <li>Enjoy unlimited data on your trip!</li>
        </ol>
      </div>

      <!-- Support -->
      <div style="background: #eff6ff; border-radius: 12px; padding: 20px; text-align: center;">
        <p style="margin: 0 0 8px; color: #1e3a5f; font-weight: 500;">Need help?</p>
        <p style="margin: 0; color: #64748b; font-size: 14px;">
          Our support team is available 24/7 on WhatsApp<br>
          <span style="font-size: 12px;">Reference your order: <strong>${orderNumber}</strong></span>
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="text-align: center; margin-top: 32px; color: #94a3b8; font-size: 14px;">
      <p style="margin: 0 0 8px;">Thank you for choosing Trvel!</p>
      <p style="margin: 0;">Safe travels!</p>
    </div>
  </div>
</body>
</html>
        `,
      });

      // 6. Update order with email status
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
