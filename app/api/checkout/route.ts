import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, duration, locale } = body;

    // Validate required fields
    if (!destination || !duration || !locale) {
      return NextResponse.json(
        { error: 'Missing required fields: destination, duration, locale' },
        { status: 400 }
      );
    }

    // Validate duration
    if (![5, 7, 15].includes(duration)) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be 5, 7, or 15.' },
        { status: 400 }
      );
    }

    // Get the plan from database
    const plan = await prisma.plan.findUnique({
      where: {
        destination_slug_locale: {
          destination_slug: destination,
          locale: locale,
        },
      },
    });

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found for this destination and locale' },
        { status: 404 }
      );
    }

    // Get the appropriate Stripe price ID based on duration
    let stripePriceId: string | null = null;
    switch (duration) {
      case 5:
        stripePriceId = plan.stripe_price_5day;
        break;
      case 7:
        stripePriceId = plan.stripe_price_7day;
        break;
      case 15:
        stripePriceId = plan.stripe_price_15day;
        break;
    }

    if (!stripePriceId) {
      return NextResponse.json(
        { error: 'Stripe price not configured for this plan' },
        { status: 400 }
      );
    }

    // Get the origin for redirect URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripePriceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/checkout/cancel`,
      metadata: {
        destination_slug: destination,
        duration: duration.toString(),
        locale: locale,
        bundle_name: duration === 5 ? plan.bundle_5day || '' :
                     duration === 7 ? plan.bundle_7day || '' :
                     plan.bundle_15day || '',
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
