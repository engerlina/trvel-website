/**
 * Script to clean up duplicate Stripe products
 * Run with: npx tsx prisma/cleanup-stripe-products.ts
 *
 * This script will:
 * 1. Get all price IDs currently stored in the database
 * 2. List all products/prices in Stripe
 * 3. Archive products that are not used in the database
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

// We need to clean up both test and production Stripe accounts
const productionStripe = new Stripe(envConfig.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

const testStripe = new Stripe(envConfig.TEST_STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
});

async function getUsedPriceIds(): Promise<{ production: Set<string>; test: Set<string> }> {
  const plans = await prisma.plan.findMany();

  const productionPriceIds = new Set<string>();
  const testPriceIds = new Set<string>();

  for (const plan of plans) {
    // Production price IDs
    if (plan.stripe_price_5day) productionPriceIds.add(plan.stripe_price_5day);
    if (plan.stripe_price_7day) productionPriceIds.add(plan.stripe_price_7day);
    if (plan.stripe_price_15day) productionPriceIds.add(plan.stripe_price_15day);

    // Test price IDs
    if (plan.stripe_test_price_5day) testPriceIds.add(plan.stripe_test_price_5day);
    if (plan.stripe_test_price_7day) testPriceIds.add(plan.stripe_test_price_7day);
    if (plan.stripe_test_price_15day) testPriceIds.add(plan.stripe_test_price_15day);
  }

  return { production: productionPriceIds, test: testPriceIds };
}

async function cleanupStripeProducts(
  stripe: Stripe,
  usedPriceIds: Set<string>,
  mode: 'production' | 'test'
) {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`Cleaning up ${mode.toUpperCase()} Stripe products...`);
  console.log(`${'='.repeat(50)}`);
  console.log(`Used price IDs in database: ${usedPriceIds.size}`);

  // Get all products
  const products: Stripe.Product[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const response = await stripe.products.list({
      limit: 100,
      starting_after: startingAfter,
      active: true,
    });

    products.push(...response.data);
    hasMore = response.has_more;
    if (response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    }
  }

  console.log(`Total active products in Stripe: ${products.length}`);

  // For each product, check if any of its prices are used
  const productsToArchive: Stripe.Product[] = [];
  const productsToKeep: Stripe.Product[] = [];

  for (const product of products) {
    // Get prices for this product
    const prices = await stripe.prices.list({
      product: product.id,
      limit: 100,
    });

    const hasUsedPrice = prices.data.some((price) => usedPriceIds.has(price.id));

    if (hasUsedPrice) {
      productsToKeep.push(product);
    } else {
      productsToArchive.push(product);
    }
  }

  console.log(`\nProducts to KEEP: ${productsToKeep.length}`);
  for (const p of productsToKeep) {
    console.log(`  ✓ ${p.name} (${p.id})`);
  }

  console.log(`\nProducts to ARCHIVE: ${productsToArchive.length}`);
  for (const p of productsToArchive) {
    console.log(`  ✗ ${p.name} (${p.id})`);
  }

  if (productsToArchive.length === 0) {
    console.log('\nNo products to archive.');
    return;
  }

  // Archive unused products
  console.log('\nArchiving unused products...');
  for (const product of productsToArchive) {
    try {
      // First, deactivate all prices for this product
      const prices = await stripe.prices.list({
        product: product.id,
        active: true,
        limit: 100,
      });

      for (const price of prices.data) {
        await stripe.prices.update(price.id, { active: false });
      }

      // Then archive the product
      await stripe.products.update(product.id, { active: false });
      console.log(`  Archived: ${product.name}`);
    } catch (error) {
      console.error(`  Failed to archive ${product.name}:`, error);
    }
  }

  console.log('\nCleanup complete!');
}

async function main() {
  console.log('Starting Stripe cleanup...\n');

  // Get used price IDs from database
  const { production: productionPriceIds, test: testPriceIds } = await getUsedPriceIds();

  console.log('Price IDs in database:');
  console.log(`  Production: ${productionPriceIds.size}`);
  console.log(`  Test: ${testPriceIds.size}`);

  // Clean up production
  await cleanupStripeProducts(productionStripe, productionPriceIds, 'production');

  // Clean up test
  await cleanupStripeProducts(testStripe, testPriceIds, 'test');

  console.log('\n✅ All cleanup complete!');
}

main()
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
