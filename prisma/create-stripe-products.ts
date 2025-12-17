/**
 * Script to create Stripe products and prices for all plans
 * Run with: npx tsx prisma/create-stripe-products.ts
 *
 * This script will:
 * 1. Move existing stripe price IDs to test price fields
 * 2. Create new production Stripe products and prices
 * 3. Update the database with the new production price IDs
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

// Force-load .env file and override any existing system env vars
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const prisma = new PrismaClient();

// Use PRODUCTION Stripe key from .env file (not system env)
const stripeKey = envConfig.STRIPE_SECRET_KEY;
console.log('Using Stripe key from .env:', stripeKey?.substring(0, 15) + '...');

const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
});

// Destination display names
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
  'uk': 'United Kingdom',
  'usa': 'United States',
  'vietnam': 'Vietnam',
};

// Plan names
const planNames: Record<number, string> = {
  5: 'Quick Trip',
  7: 'Week Explorer',
  15: 'Extended Stay',
};

// Currency to smallest unit multiplier
const currencyMultipliers: Record<string, number> = {
  'AUD': 100,
  'SGD': 100,
  'GBP': 100,
  'MYR': 100,
  'IDR': 1, // IDR is already in smallest unit
};

async function main() {
  console.log('Starting Stripe product creation...\n');

  // Check if we have the production Stripe key
  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('ERROR: STRIPE_SECRET_KEY not found in environment');
    process.exit(1);
  }

  if (process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
    console.error('ERROR: STRIPE_SECRET_KEY is a test key. This script requires the production key.');
    console.error('Set STRIPE_SECRET_KEY to your live key (sk_live_...)');
    process.exit(1);
  }

  console.log('Using PRODUCTION Stripe API\n');

  // Get all plans
  const plans = await prisma.plan.findMany({
    orderBy: [{ destination_slug: 'asc' }, { locale: 'asc' }],
  });

  console.log(`Found ${plans.length} plans to process\n`);

  // First, move existing stripe price IDs to test fields
  console.log('Step 1: Moving existing price IDs to test fields...\n');

  for (const plan of plans) {
    if (plan.stripe_price_5day || plan.stripe_price_7day || plan.stripe_price_15day) {
      await prisma.plan.update({
        where: { id: plan.id },
        data: {
          stripe_test_price_5day: plan.stripe_price_5day,
          stripe_test_price_7day: plan.stripe_price_7day,
          stripe_test_price_15day: plan.stripe_price_15day,
          // Clear production fields for now
          stripe_price_5day: null,
          stripe_price_7day: null,
          stripe_price_15day: null,
        },
      });
      console.log(`  Moved test prices for ${plan.destination_slug} (${plan.locale})`);
    }
  }

  console.log('\nStep 2: Creating production Stripe products and prices...\n');

  // Group plans by destination to create one product per destination
  const plansByDestination = new Map<string, typeof plans>();
  for (const plan of plans) {
    const key = plan.destination_slug;
    if (!plansByDestination.has(key)) {
      plansByDestination.set(key, []);
    }
    plansByDestination.get(key)!.push(plan);
  }

  // Create products for each destination
  for (const [destination, destinationPlans] of plansByDestination) {
    const displayName = destinationNames[destination] || destination;
    console.log(`\nProcessing ${displayName}...`);

    // Create a Stripe product for this destination
    const product = await stripe.products.create({
      name: `Trvel eSIM - ${displayName}`,
      description: `Unlimited data eSIM for ${displayName}. Stay connected with premium network coverage.`,
      metadata: {
        destination_slug: destination,
        type: 'esim',
      },
    });

    console.log(`  Created product: ${product.id}`);

    // Create prices for each plan (locale/currency combination)
    for (const plan of destinationPlans) {
      const multiplier = currencyMultipliers[plan.currency] || 100;

      // Create prices for each duration
      for (const duration of [5, 7, 15] as const) {
        const priceField = `price_${duration}day` as const;
        const priceValue = plan[priceField];

        if (!priceValue) {
          console.log(`    Skipping ${duration}-day (no price set)`);
          continue;
        }

        const priceNumber = typeof priceValue === 'object' ? Number(priceValue) : priceValue;
        const unitAmount = Math.round(priceNumber * multiplier);

        const stripePrice = await stripe.prices.create({
          product: product.id,
          unit_amount: unitAmount,
          currency: plan.currency.toLowerCase(),
          metadata: {
            destination_slug: destination,
            locale: plan.locale,
            duration: duration.toString(),
            plan_name: planNames[duration],
          },
        });

        // Update the database with the new price ID
        const updateField = `stripe_price_${duration}day`;
        await prisma.plan.update({
          where: { id: plan.id },
          data: {
            [updateField]: stripePrice.id,
          },
        });

        console.log(`    ${plan.locale} ${duration}d: ${stripePrice.id} (${plan.currency} ${priceNumber})`);
      }
    }
  }

  console.log('\n✅ Stripe products and prices created successfully!');
  console.log('\nSummary:');
  console.log(`  - Products created: ${plansByDestination.size}`);
  console.log(`  - Prices created: ~${plans.length * 3}`);
  console.log('\nTest price IDs have been preserved in stripe_test_price_* fields.');
  console.log('Production price IDs are now in stripe_price_* fields.');
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
