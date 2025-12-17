import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, isTestMode } from '@/lib/stripe';
import { prisma } from '@/lib/db';

// Plan names for display
const PLAN_NAMES: Record<number, string> = {
  5: 'Quick Trip',
  7: 'Week Explorer',
  15: 'Extended Stay',
};

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

    // Get the plan and destination from database
    const [plan, destinationData] = await Promise.all([
      prisma.plan.findUnique({
        where: {
          destination_slug_locale: {
            destination_slug: destination,
            locale: locale,
          },
        },
      }),
      prisma.destination.findUnique({
        where: {
          slug_locale: {
            slug: destination,
            locale: locale,
          },
        },
      }),
    ]);

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found for this destination and locale' },
        { status: 404 }
      );
    }

    // Get the price based on duration
    let price: number | null = null;
    let bundleName: string | null = null;

    switch (duration) {
      case 5:
        price = plan.price_5day ? Number(plan.price_5day) : null;
        bundleName = plan.bundle_5day;
        break;
      case 7:
        price = plan.price_7day ? Number(plan.price_7day) : null;
        bundleName = plan.bundle_7day;
        break;
      case 15:
        price = plan.price_15day ? Number(plan.price_15day) : null;
        bundleName = plan.bundle_15day;
        break;
    }

    if (!price || price <= 0) {
      console.error('Price not configured for plan', {
        destination,
        duration,
        locale,
        plan,
      });
      return NextResponse.json(
        { error: 'Price not configured for this plan' },
        { status: 400 }
      );
    }

    // Convert price to cents (Stripe uses smallest currency unit)
    const priceInCents = Math.round(price * 100);

    // Build product name for Stripe
    const destinationName = destinationData?.name || destination.replace(/-/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    const planName = PLAN_NAMES[duration] || `${duration}-Day Plan`;
    const productName = `${destinationName} eSIM - ${planName}`;
    const productDescription = `${duration}-day unlimited data eSIM for ${destinationName}`;

    console.log(`Creating checkout session (${isTestMode ? 'TEST' : 'LIVE'} mode):`, {
      destination,
      destinationName,
      duration,
      price,
      priceInCents,
      currency: plan.currency,
    });

    // Get the origin for redirect URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Build checkout session options with dynamic pricing (price_data)
    // This approach doesn't require pre-created Stripe Products/Prices
    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: plan.currency.toLowerCase(),
            product_data: {
              name: productName,
              description: productDescription,
              metadata: {
                destination_slug: destination,
                duration: duration.toString(),
                locale: locale,
              },
            },
            unit_amount: priceInCents,
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/${locale}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/${locale}/checkout/cancel`,
      metadata: {
        destination_slug: destination,
        destination_name: destinationName,
        duration: duration.toString(),
        locale: locale,
        bundle_name: bundleName || '',
        price_paid: price.toString(),
        currency: plan.currency,
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
