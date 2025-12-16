/**
 * Stripe Products Setup Script
 *
 * Creates Stripe products and prices for all destinations and plan durations.
 * Uses the pricing from the database (synced from eSIM-Go).
 *
 * Usage: npx tsx prisma/setup-stripe-products.ts
 */

import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env file manually
const envPath = resolve(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split(/\r?\n/).forEach(line => {
  const trimmedLine = line.trim();
  if (!trimmedLine || trimmedLine.startsWith('#')) return;

  const equalIndex = trimmedLine.indexOf('=');
  if (equalIndex === -1) return;

  const key = trimmedLine.substring(0, equalIndex).trim();
  let value = trimmedLine.substring(equalIndex + 1).trim();

  // Remove surrounding quotes
  if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
    value = value.slice(1, -1);
  }

  process.env[key] = value;
});

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Destination display names
const DESTINATION_NAMES: Record<string, string> = {
  'japan': 'Japan',
  'thailand': 'Thailand',
  'south-korea': 'South Korea',
  'singapore': 'Singapore',
  'indonesia': 'Indonesia',
  'malaysia': 'Malaysia',
  'vietnam': 'Vietnam',
  'philippines': 'Philippines',
  'united-kingdom': 'United Kingdom',
  'france': 'France',
  'italy': 'Italy',
  'united-states': 'United States',
};

// Currency to Stripe currency code mapping
const CURRENCY_MAP: Record<string, string> = {
  'AUD': 'aud',
  'SGD': 'sgd',
  'GBP': 'gbp',
  'MYR': 'myr',
  'IDR': 'idr',
};

interface PlanPrice {
  duration: number;
  price: number | null;
  bundleName: string | null;
}

async function getExistingProducts(): Promise<Map<string, Stripe.Product>> {
  const products = new Map<string, Stripe.Product>();
  let hasMore = true;
  let startingAfter: string | undefined;

  while (hasMore) {
    const response = await stripe.products.list({
      limit: 100,
      starting_after: startingAfter,
      active: true,
    });

    for (const product of response.data) {
      if (product.metadata?.destination_slug) {
        const key = `${product.metadata.destination_slug}-${product.metadata.duration}`;
        products.set(key, product);
      }
    }

    hasMore = response.has_more;
    if (response.data.length > 0) {
      startingAfter = response.data[response.data.length - 1].id;
    }
  }

  return products;
}

async function getExistingPrices(productId: string): Promise<Map<string, Stripe.Price>> {
  const prices = new Map<string, Stripe.Price>();

  const response = await stripe.prices.list({
    product: productId,
    active: true,
    limit: 100,
  });

  for (const price of response.data) {
    if (price.currency) {
      prices.set(price.currency.toUpperCase(), price);
    }
  }

  return prices;
}

async function createOrUpdateProduct(
  destinationSlug: string,
  duration: number,
  bundleName: string | null,
  existingProducts: Map<string, Stripe.Product>
): Promise<Stripe.Product> {
  const key = `${destinationSlug}-${duration}`;
  const existing = existingProducts.get(key);
  const destinationName = DESTINATION_NAMES[destinationSlug] || destinationSlug;

  const productData = {
    name: `${destinationName} eSIM - ${duration} Days`,
    description: `Unlimited data eSIM for ${destinationName}. Valid for ${duration} days from first use.`,
    metadata: {
      destination_slug: destinationSlug,
      duration: duration.toString(),
      bundle_name: bundleName || '',
      type: 'esim',
    },
  };

  if (existing) {
    console.log(`  Updating product: ${productData.name}`);
    return await stripe.products.update(existing.id, productData);
  } else {
    console.log(`  Creating product: ${productData.name}`);
    return await stripe.products.create(productData);
  }
}

async function createOrUpdatePrice(
  product: Stripe.Product,
  currency: string,
  amount: number,
  existingPrices: Map<string, Stripe.Price>
): Promise<Stripe.Price> {
  const stripeCurrency = CURRENCY_MAP[currency] || currency.toLowerCase();
  const existing = existingPrices.get(currency);

  // Convert to smallest currency unit (cents/pence/sen/etc)
  let unitAmount: number;
  if (currency === 'IDR') {
    // IDR doesn't use decimal places in Stripe
    unitAmount = Math.round(amount);
  } else {
    unitAmount = Math.round(amount * 100);
  }

  // Stripe doesn't allow updating price amounts, so we need to archive and create new
  if (existing && existing.unit_amount === unitAmount) {
    console.log(`    Price ${currency} ${amount} already exists (no change)`);
    return existing;
  }

  if (existing) {
    // Archive old price
    console.log(`    Archiving old price for ${currency}`);
    await stripe.prices.update(existing.id, { active: false });
  }

  console.log(`    Creating price: ${currency} ${amount}`);
  return await stripe.prices.create({
    product: product.id,
    currency: stripeCurrency,
    unit_amount: unitAmount,
    metadata: {
      display_amount: amount.toString(),
    },
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('Stripe Products Setup');
  console.log('='.repeat(60));
  console.log(`Stripe Key: ${process.env.STRIPE_SECRET_KEY?.startsWith('sk_test') ? '✓ Test Mode' : process.env.STRIPE_SECRET_KEY?.startsWith('sk_live') ? '⚠️ LIVE MODE' : '✗ Missing'}`);
  console.log('='.repeat(60));

  if (!process.env.STRIPE_SECRET_KEY) {
    console.error('STRIPE_SECRET_KEY is not set');
    process.exit(1);
  }

  // Warn if using live keys
  if (process.env.STRIPE_SECRET_KEY?.startsWith('sk_live')) {
    console.log('\n⚠️  WARNING: Using LIVE Stripe keys!');
    console.log('Press Ctrl+C within 5 seconds to cancel...\n');
    await new Promise(resolve => setTimeout(resolve, 5000));
  }

  try {
    // Get existing products from Stripe
    console.log('\nFetching existing Stripe products...');
    const existingProducts = await getExistingProducts();
    console.log(`Found ${existingProducts.size} existing eSIM products`);

    // Get all plans from database (use en-au as base, prices vary by locale)
    console.log('\nFetching plans from database...');
    const plans = await prisma.plan.findMany({
      orderBy: { destination_slug: 'asc' },
    });

    // Group plans by destination
    const plansByDestination = new Map<string, typeof plans>();
    for (const plan of plans) {
      const existing = plansByDestination.get(plan.destination_slug) || [];
      existing.push(plan);
      plansByDestination.set(plan.destination_slug, existing);
    }

    console.log(`Found ${plansByDestination.size} destinations with plans\n`);

    let productsCreated = 0;
    let productsUpdated = 0;
    let pricesCreated = 0;
    let plansUpdated = 0;

    // Process each destination
    for (const [destinationSlug, destPlans] of plansByDestination) {
      console.log(`\n${DESTINATION_NAMES[destinationSlug] || destinationSlug}:`);

      // Get a sample plan to get bundle names
      const samplePlan = destPlans[0];

      // Create products for each duration (5, 7, 15 days)
      const durations = [
        { days: 5, priceField: 'price_5day' as const, bundleField: 'bundle_5day' as const, stripePriceField: 'stripe_price_5day' as const },
        { days: 7, priceField: 'price_7day' as const, bundleField: 'bundle_7day' as const, stripePriceField: 'stripe_price_7day' as const },
        { days: 15, priceField: 'price_15day' as const, bundleField: 'bundle_15day' as const, stripePriceField: 'stripe_price_15day' as const },
      ];

      for (const { days, priceField, bundleField, stripePriceField } of durations) {
        const bundleName = samplePlan[bundleField];

        // Check if any plan has a price for this duration
        const hasPrice = destPlans.some(p => p[priceField] !== null);
        if (!hasPrice) {
          console.log(`  Skipping ${days}-day (no prices)`);
          continue;
        }

        // Create/update product
        const key = `${destinationSlug}-${days}`;
        const isNew = !existingProducts.has(key);
        const product = await createOrUpdateProduct(
          destinationSlug,
          days,
          bundleName,
          existingProducts
        );

        if (isNew) {
          productsCreated++;
        } else {
          productsUpdated++;
        }

        // Get existing prices for this product
        const existingPrices = await getExistingPrices(product.id);

        // Create prices for each currency/locale and save to database
        for (const plan of destPlans) {
          const price = plan[priceField];
          if (price === null) continue;

          const priceNumber = typeof price === 'object' ? Number(price) : price;
          const stripePrice = await createOrUpdatePrice(product, plan.currency, priceNumber, existingPrices);
          pricesCreated++;

          // Update Plan with Stripe price ID
          await prisma.plan.update({
            where: { id: plan.id },
            data: { [stripePriceField]: stripePrice.id },
          });
          plansUpdated++;
        }
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✓ Setup complete!');
    console.log('='.repeat(60));
    console.log(`Products created: ${productsCreated}`);
    console.log(`Products updated: ${productsUpdated}`);
    console.log(`Prices created/updated: ${pricesCreated}`);
    console.log(`Plans updated with Stripe price IDs: ${plansUpdated}`);

  } catch (error) {
    console.error('\n✗ Setup failed:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
