import { NextRequest, NextResponse } from 'next/server';
import { stripe, isTestMode } from '@/lib/stripe';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, duration, locale, promoCode } = body;

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

    // Get the appropriate Stripe price ID based on duration and test mode
    let stripePriceId: string | null = null;

    if (isTestMode) {
      // Use test price IDs
      switch (duration) {
        case 5:
          stripePriceId = plan.stripe_test_price_5day;
          break;
        case 7:
          stripePriceId = plan.stripe_test_price_7day;
          break;
        case 15:
          stripePriceId = plan.stripe_test_price_15day;
          break;
      }
    } else {
      // Use production price IDs
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
    }

    if (!stripePriceId) {
      console.error(`Stripe price not configured for ${isTestMode ? 'test' : 'production'} mode`, {
        destination,
        duration,
        locale,
        isTestMode,
      });
      return NextResponse.json(
        { error: `Stripe price not configured for this plan (${isTestMode ? 'test' : 'production'} mode)` },
        { status: 400 }
      );
    }

    console.log(`Creating checkout session (${isTestMode ? 'TEST' : 'LIVE'} mode):`, {
      destination,
      duration,
      stripePriceId,
    });

    // Get the origin for redirect URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Build checkout session options
    const sessionOptions: Parameters<typeof stripe.checkout.sessions.create>[0] = {
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
    };

    // If a promo code is provided, look it up and apply it
    // Otherwise, allow customers to enter promotion codes manually
    if (promoCode) {
      try {
        // Look up the promotion code
        const promotionCodes = await stripe.promotionCodes.list({
          code: promoCode,
          active: true,
          limit: 1,
        });

        if (promotionCodes.data.length > 0) {
          sessionOptions.discounts = [{ promotion_code: promotionCodes.data[0].id }];
          console.log(`Applied promotion code: ${promoCode}`);
        } else {
          // Promo code not found, still allow manual entry
          sessionOptions.allow_promotion_codes = true;
          console.log(`Promotion code not found: ${promoCode}, allowing manual entry`);
        }
      } catch (promoError) {
        console.error('Error looking up promotion code:', promoError);
        sessionOptions.allow_promotion_codes = true;
      }
    } else {
      // Allow customers to enter promotion/coupon codes manually
      sessionOptions.allow_promotion_codes = true;
    }

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create(sessionOptions);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout session error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
