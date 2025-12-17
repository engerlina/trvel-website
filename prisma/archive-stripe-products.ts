/**
 * Archive old Stripe products that are no longer needed
 *
 * We switched to dynamic pricing (price_data) so pre-created products are obsolete.
 * This script archives them in both live and test mode.
 *
 * Run with: npx tsx prisma/archive-stripe-products.ts
 */

import Stripe from 'stripe';

async function archiveProducts(secretKey: string, mode: string) {
  const stripe = new Stripe(secretKey, { apiVersion: '2023-10-16' });

  console.log(`\n=== ${mode} MODE ===`);

  // Get all active products
  const products = await stripe.products.list({ limit: 100, active: true });

  console.log(`Found ${products.data.length} active products`);

  // Filter to only our eSIM products (not dynamically created ones)
  const esimProducts = products.data.filter(p =>
    p.name.includes('Trvel eSIM') || p.name.includes('[TEST] Trvel eSIM')
  );

  console.log(`Found ${esimProducts.length} eSIM products to archive`);

  for (const product of esimProducts) {
    try {
      // Archive the product (set active: false)
      await stripe.products.update(product.id, { active: false });
      console.log(`✓ Archived: ${product.name} (${product.id})`);
    } catch (error) {
      console.error(`✗ Failed to archive ${product.name}:`, error);
    }
  }

  console.log(`\nDone archiving ${mode} products`);
}

async function main() {
  const liveKey = process.env.STRIPE_SECRET_KEY;
  const testKey = process.env.TEST_STRIPE_SECRET_KEY;

  if (!liveKey) {
    console.error('Missing STRIPE_SECRET_KEY');
    process.exit(1);
  }

  if (!testKey) {
    console.error('Missing TEST_STRIPE_SECRET_KEY');
    process.exit(1);
  }

  // Archive live products
  await archiveProducts(liveKey, 'LIVE');

  // Archive test products
  await archiveProducts(testKey, 'TEST');

  console.log('\n✅ All products archived successfully');
  console.log('Products are archived (inactive) but not deleted, so you can restore them if needed.');
}

main().catch(console.error);
