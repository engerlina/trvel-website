/**
 * eSIM-Go Catalog Sync Script
 *
 * This script:
 * 1. Fetches the catalog from eSIM-Go API (Standard Unlimited Essential group)
 * 2. Stores bundles in EsimBundle table
 * 3. Updates exchange rates
 * 4. Calculates retail prices using Trvel pricing rules and updates Plan table
 *
 * Pricing Rules:
 * - Target: 10% under competitor trip cost
 * - Minimum margin: 50% over wholesale
 * - Round to .99 or .49 endings
 *
 * Usage: npx tsx prisma/sync-esimgo.ts
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env file manually BEFORE creating Prisma client
const envPath = resolve(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    // Remove surrounding quotes if present
    let value = valueParts.join('=').trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    process.env[key.trim()] = value;
  }
});

// Create Prisma client after env is loaded
const prisma = new PrismaClient();

// eSIM-Go API configuration
const ESIMGO_API_BASE = 'https://api.esim-go.com/v2.5';
const ESIMGO_API_TOKEN = process.env.ESIMGO_API_TOKEN;
const BUNDLE_GROUP = 'Standard Unlimited Essential';

// Pricing constants
const MINIMUM_MARGIN_MULTIPLIER = 1.5; // 50% minimum margin over wholesale
const COMPETITOR_DISCOUNT = 0.90; // Target 10% under competitor

// Currency exchange rates from USD (approximate, update regularly)
const USD_EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.0,
  'AUD': 1.55,
  'SGD': 1.34,
  'GBP': 0.79,
  'MYR': 4.47,
  'IDR': 15800,
};

// Map destination slugs to ISO country codes
const DESTINATION_TO_ISO: Record<string, string> = {
  'japan': 'JP',
  'thailand': 'TH',
  'south-korea': 'KR',
  'singapore': 'SG',
  'indonesia': 'ID',
  'malaysia': 'MY',
  'vietnam': 'VN',
  'philippines': 'PH',
  'united-kingdom': 'GB',
  'france': 'FR',
  'italy': 'IT',
  'united-states': 'US',
};

// Locale to currency mapping
const LOCALE_CURRENCIES: Record<string, string> = {
  'en-au': 'AUD',
  'en-sg': 'SGD',
  'en-gb': 'GBP',
  'ms-my': 'MYR',
  'id-id': 'IDR',
};

// Competitor/incumbent info by currency (not locale)
const COMPETITORS: Record<string, { name: string; dailyRate: number }> = {
  'AUD': { name: 'Telstra', dailyRate: 10 },
  'SGD': { name: 'Singtel', dailyRate: 15 },
  'GBP': { name: 'EE', dailyRate: 3.54 },
  'MYR': { name: 'Maxis', dailyRate: 35 },
  'IDR': { name: 'Telkomsel', dailyRate: 100000 },
};

interface EsimGoBundle {
  name: string;
  description: string;
  groups: string[];
  countries: Array<{
    name: string;
    region: string;
    iso: string;
  }>;
  duration: number;
  speed: string[];
  autostart: boolean;
  unlimited: boolean;
  price: number; // in cents
  allowances: Array<{
    type: string;
    service: string;
    description: string;
    amount: number;
    unit: string;
    unlimited: boolean;
  }>;
}

async function fetchCatalog(): Promise<EsimGoBundle[]> {
  if (!ESIMGO_API_TOKEN) {
    throw new Error('ESIMGO_API_TOKEN environment variable is not set');
  }

  console.log('Fetching eSIM-Go catalog...');
  console.log(`Group filter: ${BUNDLE_GROUP}`);

  const allBundles: EsimGoBundle[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 50) {
    const url = new URL(`${ESIMGO_API_BASE}/catalogue`);
    url.searchParams.set('group', BUNDLE_GROUP);
    url.searchParams.set('page', page.toString());
    url.searchParams.set('perPage', '100');

    console.log(`  Fetching page ${page}...`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': ESIMGO_API_TOKEN,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`eSIM-Go API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    // API returns { bundles: [...], pageCount, rows, pageSize }
    const bundles = data.bundles || [];

    if (bundles.length > 0) {
      allBundles.push(...bundles);
      console.log(`    Found ${bundles.length} bundles on page ${page}`);

      // Continue if we got a full page (might be more)
      if (bundles.length >= 100) {
        page++;
      } else {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  console.log(`Total bundles fetched: ${allBundles.length}`);
  return allBundles;
}

async function syncExchangeRates(): Promise<void> {
  console.log('\nSyncing exchange rates...');

  for (const [currency, rate] of Object.entries(USD_EXCHANGE_RATES)) {
    await prisma.exchangeRate.upsert({
      where: { currency },
      update: { rate },
      create: { currency, rate },
    });
    console.log(`  ${currency}: ${rate}`);
  }
}

async function syncCompetitors(): Promise<void> {
  console.log('\nSyncing competitors...');

  for (const [currency, competitor] of Object.entries(COMPETITORS)) {
    await prisma.competitor.upsert({
      where: { currency },
      update: {
        name: competitor.name,
        daily_rate: competitor.dailyRate,
      },
      create: {
        currency,
        name: competitor.name,
        daily_rate: competitor.dailyRate,
      },
    });
    console.log(`  ${currency}: ${competitor.name} @ ${competitor.dailyRate}/day`);
  }
}

// Target country ISO codes we care about
const TARGET_ISO_CODES = new Set(Object.values(DESTINATION_TO_ISO));

async function syncBundles(bundles: EsimGoBundle[]): Promise<void> {
  console.log('\nSyncing bundles to database...');

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const bundle of bundles) {
    const primaryCountry = bundle.countries[0];
    if (!primaryCountry) continue;

    // Skip regional bundles and non-target countries
    if (!TARGET_ISO_CODES.has(primaryCountry.iso)) {
      skipped++;
      continue;
    }

    const dataAllowance = bundle.allowances?.find(a => a.type === 'DATA' && a.service === 'STANDARD');
    const dataAmountMb = dataAllowance?.unlimited ? null : (dataAllowance?.amount || null);

    try {
      const existing = await prisma.esimBundle.findUnique({
        where: { name: bundle.name },
      });

      // API returns price in dollars as a float, convert to cents for storage
    const priceInCents = Math.round(bundle.price * 100);

    const bundleData = {
        description: bundle.description?.slice(0, 2000) || null, // Truncate if too long
        group: BUNDLE_GROUP,
        country_iso: primaryCountry.iso,
        country_name: primaryCountry.name,
        region: primaryCountry.region || null,
        duration: bundle.duration,
        price_usd_cents: priceInCents,
        data_amount_mb: dataAmountMb,
        unlimited: bundle.unlimited || dataAllowance?.unlimited || false,
        speed: bundle.speed || [],
        autostart: bundle.autostart,
        raw_data: bundle as any,
      };

      if (existing) {
        await prisma.esimBundle.update({
          where: { name: bundle.name },
          data: bundleData,
        });
        updated++;
      } else {
        await prisma.esimBundle.create({
          data: {
            name: bundle.name,
            ...bundleData,
          },
        });
        created++;
      }
    } catch (error) {
      errors++;
      console.error(`  Error syncing bundle ${bundle.name}:`, (error as Error).message);
    }
  }

  console.log(`  Created: ${created}, Updated: ${updated}, Skipped: ${skipped}, Errors: ${errors}`);
}

interface BundleSet {
  bundle5day: EsimGoBundle | null;
  bundle7day: EsimGoBundle | null;
  bundle15day: EsimGoBundle | null;
}

function findBundlesForCountry(bundles: EsimGoBundle[], countryIso: string): BundleSet {
  // Find unlimited bundles for this country at specific durations
  const countryBundles = bundles.filter(b =>
    b.countries.some(c => c.iso === countryIso) &&
    (b.unlimited || b.allowances?.some(a => a.unlimited))
  );

  const findBestBundle = (duration: number): EsimGoBundle | null => {
    const matches = countryBundles.filter(b => b.duration === duration);
    if (matches.length === 0) return null;
    // Return the cheapest unlimited bundle at this duration
    return matches.sort((a, b) => a.price - b.price)[0];
  };

  return {
    bundle5day: findBestBundle(5),
    bundle7day: findBestBundle(7),
    bundle15day: findBestBundle(15),
  };
}

/**
 * Round price to nearest .99 or .49 (whichever is closer, rounding down)
 */
function roundToFriendlyPrice(price: number, currency: string): number {
  // For IDR, round to nearest 1000 with 900 ending
  if (currency === 'IDR') {
    const thousands = Math.floor(price / 1000);
    return (thousands * 1000) + 900;
  }

  const integerPart = Math.floor(price);
  const decimal = price - integerPart;

  if (decimal < 0.49) {
    // Round down to previous .99
    if (integerPart > 0) {
      return integerPart - 0.01;
    }
    return 0.49;
  } else if (decimal < 0.99) {
    return integerPart + 0.49;
  } else {
    return integerPart + 0.99;
  }
}

/**
 * Calculate retail price using Trvel pricing formula
 *
 * Priority:
 * 1. Start with 60% markup over wholesale (base price)
 * 2. If base price > competitor cost: discount down to 10% under competitor
 * 3. But never go below 50% minimum margin
 */
function calculateRetailPrice(
  wholesaleCents: number,
  currency: string,
  competitorDailyRate: number,
  planDuration: number
): number {
  const exchangeRate = USD_EXCHANGE_RATES[currency] || 1;
  const wholesaleUsd = wholesaleCents / 100;
  const wholesaleLocal = wholesaleUsd * exchangeRate;

  // Step 1: Base price (60% markup - the default)
  const basePrice = wholesaleLocal * 1.60;

  // Competitor trip cost in local currency
  const competitorTripCost = competitorDailyRate * planDuration;

  // Target price: 10% under competitor (max discount we offer)
  const targetPrice = competitorTripCost * COMPETITOR_DISCOUNT;

  // Minimum margin floor (50% markup)
  const floorPrice = wholesaleLocal * MINIMUM_MARGIN_MULTIPLIER;

  // Determine final pre-round price
  let finalPreRoundPrice: number;

  if (basePrice <= competitorTripCost) {
    // Base price is already at or below competitor - use base price
    finalPreRoundPrice = basePrice;
  } else {
    // Base price is above competitor - try to discount
    // Offer up to 10% savings vs competitor, but not below 50% margin
    finalPreRoundPrice = Math.max(targetPrice, floorPrice);
  }

  return roundToFriendlyPrice(finalPreRoundPrice, currency);
}

async function syncPlans(bundles: EsimGoBundle[]): Promise<void> {
  console.log('\nSyncing plans with retail prices...');
  console.log('Pricing: 10% under competitor, min 50% margin, .99/.49 rounding');
  console.log('Using native 5/7/15-day unlimited bundles\n');

  const locales = Object.keys(LOCALE_CURRENCIES);
  const destinations = Object.keys(DESTINATION_TO_ISO);

  let plansCreated = 0;
  let plansUpdated = 0;
  let destinationsSkipped = 0;

  for (const destination of destinations) {
    const countryIso = DESTINATION_TO_ISO[destination];
    const bundleSet = findBundlesForCountry(bundles, countryIso);

    // Need at least one bundle to proceed
    if (!bundleSet.bundle5day && !bundleSet.bundle7day && !bundleSet.bundle15day) {
      console.log(`  ⚠️  ${destination} (${countryIso}): No bundles found - SKIPPING`);
      destinationsSkipped++;
      continue;
    }

    // API prices are in dollars, convert to cents for storage
    const price5dayCents = bundleSet.bundle5day ? Math.round(bundleSet.bundle5day.price * 100) : null;
    const price7dayCents = bundleSet.bundle7day ? Math.round(bundleSet.bundle7day.price * 100) : null;
    const price15dayCents = bundleSet.bundle15day ? Math.round(bundleSet.bundle15day.price * 100) : null;

    console.log(`  ✓ ${destination} (${countryIso}):`);
    if (bundleSet.bundle5day) {
      console.log(`      5-day: ${bundleSet.bundle5day.name} @ $${bundleSet.bundle5day.price.toFixed(2)} USD`);
    }
    if (bundleSet.bundle7day) {
      console.log(`      7-day: ${bundleSet.bundle7day.name} @ $${bundleSet.bundle7day.price.toFixed(2)} USD`);
    }
    if (bundleSet.bundle15day) {
      console.log(`      15-day: ${bundleSet.bundle15day.name} @ $${bundleSet.bundle15day.price.toFixed(2)} USD`);
    }

    for (const locale of locales) {
      const currency = LOCALE_CURRENCIES[locale];
      const competitor = COMPETITORS[currency];
      const competitorDailyRate = competitor?.dailyRate || 10;

      const planData = {
        currency,
        wholesale_5day_cents: price5dayCents,
        wholesale_7day_cents: price7dayCents,
        wholesale_15day_cents: price15dayCents,
        price_5day: price5dayCents ? calculateRetailPrice(price5dayCents, currency, competitorDailyRate, 5) : null,
        price_7day: price7dayCents ? calculateRetailPrice(price7dayCents, currency, competitorDailyRate, 7) : null,
        price_15day: price15dayCents ? calculateRetailPrice(price15dayCents, currency, competitorDailyRate, 15) : null,
        bundle_5day: bundleSet.bundle5day?.name || null,
        bundle_7day: bundleSet.bundle7day?.name || null,
        bundle_15day: bundleSet.bundle15day?.name || null,
      };

      const existing = await prisma.plan.findUnique({
        where: {
          destination_slug_locale: {
            destination_slug: destination,
            locale,
          },
        },
      });

      if (existing) {
        await prisma.plan.update({
          where: { id: existing.id },
          data: planData,
        });
        plansUpdated++;
      } else {
        await prisma.plan.create({
          data: {
            destination_slug: destination,
            locale,
            ...planData,
          },
        });
        plansCreated++;
      }
    }

    // Show example retail prices for AUD
    if (price5dayCents && price7dayCents && price15dayCents) {
      const audCompetitor = COMPETITORS['AUD'];
      const audRate = audCompetitor?.dailyRate || 10;
      const audPrice5 = calculateRetailPrice(price5dayCents, 'AUD', audRate, 5);
      const audPrice7 = calculateRetailPrice(price7dayCents, 'AUD', audRate, 7);
      const audPrice15 = calculateRetailPrice(price15dayCents, 'AUD', audRate, 15);
      console.log(`      Retail (AUD): 5d=$${audPrice5}, 7d=$${audPrice7}, 15d=$${audPrice15}`);
    }
  }

  console.log(`\n  Plans created: ${plansCreated}`);
  console.log(`  Plans updated: ${plansUpdated}`);
  console.log(`  Destinations skipped (no bundle): ${destinationsSkipped}`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('eSIM-Go Catalog Sync');
  console.log('='.repeat(60));
  console.log(`API Token: ${ESIMGO_API_TOKEN ? '✓ Set' : '✗ Missing'}`);
  console.log('Pricing: 10% under competitor, min 50% margin');
  console.log('='.repeat(60));

  try {
    // Step 1: Fetch catalog from eSIM-Go
    const bundles = await fetchCatalog();

    if (bundles.length === 0) {
      console.log('\nNo bundles found in catalog. Exiting.');
      return;
    }

    // Step 2: Sync exchange rates
    await syncExchangeRates();

    // Step 3: Sync competitors
    await syncCompetitors();

    // Step 4: Sync bundles to database
    await syncBundles(bundles);

    // Step 5: Update plans with retail prices
    await syncPlans(bundles);

    console.log('\n' + '='.repeat(60));
    console.log('✓ Sync complete!');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('\n✗ Sync failed:', error);
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
