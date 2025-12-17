/**
 * Script to create Stripe TEST products and prices for all plans
 * Run with: npx tsx prisma/create-test-stripe-products.ts
 *
 * This script creates test prices on the TEST Stripe account
 */

import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

// Force-load .env file
const envPath = path.resolve(process.cwd(), '.env');
const envConfig = dotenv.parse(fs.readFileSync(envPath));

const prisma = new PrismaClient();

// Use TEST Stripe key from .env file
const stripeKey = envConfig.TEST_STRIPE_SECRET_KEY;
console.log('Using TEST Stripe key from .env:', stripeKey?.substring(0, 20) + '...');

if (!stripeKey || !stripeKey.startsWith('sk_test_')) {
  console.error('ERROR: TEST_STRIPE_SECRET_KEY not found or invalid');
  process.exit(1);
}

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
  'united-kingdom': 'United Kingdom',
  'united-states': 'United States',
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
  'IDR': 1,
};

async function main() {
  console.log('Starting TEST Stripe product creation...\n');
  console.log('Using TEST Stripe API\n');

  // Get all plans
  const plans = await prisma.plan.findMany({
    orderBy: [{ destination_slug: 'asc' }, { locale: 'asc' }],
  });

  console.log(`Found ${plans.length} plans to process\n`);

  // Group plans by destination
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

    // Create a Stripe product for this destination (TEST)
    const product = await stripe.products.create({
      name: `[TEST] Trvel eSIM - ${displayName}`,
      description: `[TEST] Unlimited data eSIM for ${displayName}. Stay connected with premium network coverage.`,
      metadata: {
        destination_slug: destination,
        type: 'esim',
        environment: 'test',
      },
    });

    console.log(`  Created TEST product: ${product.id}`);

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
            environment: 'test',
          },
        });

        // Update the database with the new TEST price ID
        const updateField = `stripe_test_price_${duration}day`;
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

  console.log('\n✅ TEST Stripe products and prices created successfully!');
  console.log('\nSummary:');
  console.log(`  - Products created: ${plansByDestination.size}`);
  console.log(`  - Prices created: ~${plans.length * 3}`);
  console.log('\nTest price IDs are now in stripe_test_price_* fields.');
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
