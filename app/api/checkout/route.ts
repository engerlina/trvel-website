import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, isTestMode } from '@/lib/stripe';
import { prisma } from '@/lib/db';
import { DurationOption, DataTier } from '@/types';

// Get data label for display
function getDataLabel(dataType?: DataTier, dataAmountMb?: number): string {
  if (!dataType || dataType === 'unlimited') {
    return 'unlimited data';
  }
  if (dataAmountMb && dataAmountMb >= 1000) {
    return `${dataAmountMb / 1000}GB data`;
  }
  return `${dataType.toUpperCase()} data`;
}

// Plan names for display based on duration
function getPlanName(days: number): string {
  if (days === 1) return '1-Day Quick Trip';
  if (days === 3) return '3-Day Getaway';
  if (days === 5) return 'Quick Trip';
  if (days === 7) return 'Week Explorer';
  if (days === 10) return '10-Day Adventure';
  if (days === 15) return 'Extended Stay';
  if (days === 30) return 'Monthly Traveler';
  return `${days}-Day Plan`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, duration, locale, promoCode, gclid, dataType } = body;

    // Validate required fields
    if (!destination || !duration || !locale) {
      return NextResponse.json(
        { error: 'Missing required fields: destination, duration, locale' },
        { status: 400 }
      );
    }

    // Validate duration is a positive integer
    if (typeof duration !== 'number' || duration <= 0 || !Number.isInteger(duration)) {
      return NextResponse.json(
        { error: 'Invalid duration. Must be a positive integer.' },
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

    // Get the price and bundle from durations array
    const durations = plan.durations as unknown as DurationOption[];
    // If dataType is provided, match on both duration and data_type
    // Otherwise, prefer unlimited for backwards compatibility
    const selectedDuration = dataType
      ? durations.find(d => d.duration === duration && d.data_type === dataType)
      : durations.find(d => d.duration === duration && d.data_type === 'unlimited')
        || durations.find(d => d.duration === duration);

    if (!selectedDuration) {
      console.error('Duration not available for this destination', {
        destination,
        duration,
        locale,
        availableDurations: durations.map(d => d.duration),
      });
      return NextResponse.json(
        { error: `Duration ${duration} days is not available for this destination` },
        { status: 400 }
      );
    }

    const price = selectedDuration.retail_price;
    const bundleName = selectedDuration.bundle_name;

    if (!price || price <= 0) {
      console.error('Price not configured for plan', {
        destination,
        duration,
        locale,
        selectedDuration,
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
    const planName = getPlanName(duration);
    const dataLabel = getDataLabel(selectedDuration.data_type, selectedDuration.data_amount_mb);
    const productName = `${destinationName} eSIM - ${planName}`;
    const productDescription = `${duration}-day ${dataLabel} eSIM for ${destinationName}`;

    console.log(`Creating checkout session (${isTestMode ? 'TEST' : 'LIVE'} mode):`, {
      destination,
      destinationName,
      duration,
      price,
      priceInCents,
      currency: plan.currency,
      gclid: gclid || 'NOT PROVIDED',
    });

    // Get the origin for redirect URLs
    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Build checkout session options with dynamic pricing (price_data)
    // This approach doesn't require pre-created Stripe Products/Prices
    const sessionOptions: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      // Pass gclid as client_reference_id for Google Ads conversion tracking
      // This allows the webhook to attribute the conversion back to Google Ads
      ...(gclid && { client_reference_id: gclid }),
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
        data_type: selectedDuration.data_type || 'unlimited',
        data_amount_mb: selectedDuration.data_amount_mb?.toString() || '',
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
