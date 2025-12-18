/**
 * eSIM-Go Catalog Sync Script
 *
 * This script:
 * 1. Fetches the catalog from eSIM-Go API (Standard Unlimited Essential group)
 * 2. Stores bundles in EsimBundle table
 * 3. Updates exchange rates
 * 4. Calculates retail prices using Trvel pricing rules and updates Plan table
 *
 * NEW: Supports flexible durations (1, 3, 5, 7, 10, 15, 30 days)
 * - Stores all available durations per destination in JSON format
 * - Chooses smart defaults (prefer 5, 7, 15 or alternatives)
 * - Calculates best daily rate across all durations
 *
 * Pricing Rules:
 * - Target: 10% under competitor trip cost
 * - Minimum margin: 50% over wholesale
 * - Default: 60% markup over wholesale
 * - Round to .99 or .49 endings (.900 for IDR)
 *
 * Usage: npx tsx prisma/sync-esimgo.ts
 */

import { PrismaClient, Prisma } from '@prisma/client';
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
const DEFAULT_MARKUP = 1.60; // 60% markup (the default)
const COMPETITOR_DISCOUNT = 0.90; // Target 10% under competitor

// All supported durations
const ALL_DURATIONS = [1, 3, 5, 7, 10, 15, 30];

// Preferred default durations (in order of preference)
const PREFERRED_DEFAULTS = [5, 7, 15];

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
  'en-us': 'USD',
  'ms-my': 'MYR',
  'id-id': 'IDR',
};

// Competitor/incumbent info by currency (not locale)
const COMPETITORS: Record<string, { name: string; dailyRate: number }> = {
  'AUD': { name: 'Telstra', dailyRate: 10 },
  'SGD': { name: 'Singtel', dailyRate: 15 },
  'GBP': { name: 'EE', dailyRate: 3.54 },
  'USD': { name: 'T-Mobile', dailyRate: 15 },
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
  price: number; // in dollars
  allowances: Array<{
    type: string;
    service: string;
    description: string;
    amount: number;
    unit: string;
    unlimited: boolean;
  }>;
}

// Duration option stored in Plan.durations JSON array
interface DurationOption {
  duration: number;        // Days (1, 3, 5, 7, 10, 15, 30)
  wholesale_cents: number; // Wholesale price in USD cents
  retail_price: number;    // Retail price in local currency
  bundle_name: string;     // eSIM-Go bundle identifier for fulfillment
  daily_rate: number;      // Calculated: retail_price / duration
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

/**
 * Find ALL available unlimited bundles for a country
 * Returns a Map of duration -> bundle (cheapest unlimited at each duration)
 */
function findAllBundlesForCountry(bundles: EsimGoBundle[], countryIso: string): Map<number, EsimGoBundle> {
  const countryBundles = bundles.filter(b =>
    b.countries.some(c => c.iso === countryIso) &&
    (b.unlimited || b.allowances?.some(a => a.unlimited))
  );

  const bundleMap = new Map<number, EsimGoBundle>();

  for (const duration of ALL_DURATIONS) {
    const matches = countryBundles.filter(b => b.duration === duration);
    if (matches.length > 0) {
      // Pick the cheapest unlimited bundle at this duration
      const cheapest = matches.sort((a, b) => a.price - b.price)[0];
      bundleMap.set(duration, cheapest);
    }
  }

  return bundleMap;
}

/**
 * Choose default durations to display
 * Prefer [5, 7, 15], but fall back to alternatives if not all available
 */
function chooseDefaultDurations(availableDurations: number[]): number[] {
  // If we have all preferred durations, use them
  const hasAllPreferred = PREFERRED_DEFAULTS.every(d => availableDurations.includes(d));
  if (hasAllPreferred) {
    return PREFERRED_DEFAULTS;
  }

  // Otherwise, pick up to 3 durations, favoring mid-range options
  // Priority: 7, 5, 15, 10, 3, 30, 1
  const priorityOrder = [7, 5, 15, 10, 3, 30, 1];
  const defaults: number[] = [];

  for (const duration of priorityOrder) {
    if (availableDurations.includes(duration) && defaults.length < 3) {
      defaults.push(duration);
    }
  }

  // Sort by duration (ascending) for display
  return defaults.sort((a, b) => a - b);
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
  const basePrice = wholesaleLocal * DEFAULT_MARKUP;

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
  console.log('\nSyncing plans with flexible durations...');
  console.log('Pricing: 60% markup default, 10% under competitor cap, 50% min margin');
  console.log('Supporting durations: 1, 3, 5, 7, 10, 15, 30 days\n');

  const locales = Object.keys(LOCALE_CURRENCIES);
  const destinations = Object.keys(DESTINATION_TO_ISO);

  let plansCreated = 0;
  let plansUpdated = 0;
  let destinationsSkipped = 0;

  for (const destination of destinations) {
    const countryIso = DESTINATION_TO_ISO[destination];
    const bundleMap = findAllBundlesForCountry(bundles, countryIso);

    // Need at least one bundle to proceed
    if (bundleMap.size === 0) {
      console.log(`  ⚠️  ${destination} (${countryIso}): No bundles found - SKIPPING`);
      destinationsSkipped++;
      continue;
    }

    const availableDurations = Array.from(bundleMap.keys()).sort((a, b) => a - b);
    const defaultDurations = chooseDefaultDurations(availableDurations);

    console.log(`  ✓ ${destination} (${countryIso}):`);
    console.log(`      Available: [${availableDurations.join(', ')}] days`);
    console.log(`      Defaults:  [${defaultDurations.join(', ')}] days`);

    for (const locale of locales) {
      const currency = LOCALE_CURRENCIES[locale];
      const competitor = COMPETITORS[currency];
      const competitorDailyRate = competitor?.dailyRate || 10;

      // Build durations array with all pricing info
      const durations: DurationOption[] = [];
      let bestDailyRate = Infinity;

      for (const [duration, bundle] of bundleMap) {
        const wholesaleCents = Math.round(bundle.price * 100);
        const retailPrice = calculateRetailPrice(wholesaleCents, currency, competitorDailyRate, duration);
        const dailyRate = retailPrice / duration;

        durations.push({
          duration,
          wholesale_cents: wholesaleCents,
          retail_price: retailPrice,
          bundle_name: bundle.name,
          daily_rate: Math.round(dailyRate * 100) / 100, // Round to 2 decimal places
        });

        if (dailyRate < bestDailyRate) {
          bestDailyRate = dailyRate;
        }
      }

      // Sort durations by duration ascending
      durations.sort((a, b) => a.duration - b.duration);

      // Round best daily rate
      const finalBestDailyRate = Math.round(bestDailyRate * 100) / 100;

      const planData = {
        currency,
        durations: durations as unknown as Prisma.InputJsonValue,
        default_durations: defaultDurations,
        best_daily_rate: finalBestDailyRate,
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
    const audCompetitor = COMPETITORS['AUD'];
    const audRate = audCompetitor?.dailyRate || 10;
    const sampleDurations = defaultDurations.slice(0, 3);
    const audPrices = sampleDurations.map(d => {
      const bundle = bundleMap.get(d);
      if (!bundle) return null;
      const wholesaleCents = Math.round(bundle.price * 100);
      const price = calculateRetailPrice(wholesaleCents, 'AUD', audRate, d);
      return `${d}d=$${price}`;
    }).filter(Boolean);
    if (audPrices.length > 0) {
      console.log(`      Retail (AUD): ${audPrices.join(', ')}`);
    }
  }

  console.log(`\n  Plans created: ${plansCreated}`);
  console.log(`  Plans updated: ${plansUpdated}`);
  console.log(`  Destinations skipped (no bundle): ${destinationsSkipped}`);
}

async function main() {
  console.log('='.repeat(60));
  console.log('eSIM-Go Catalog Sync (Flexible Durations)');
  console.log('='.repeat(60));
  console.log(`API Token: ${ESIMGO_API_TOKEN ? '✓ Set' : '✗ Missing'}`);
  console.log('Pricing: 60% markup, 10% under competitor, 50% min margin');
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

    // Step 5: Update plans with retail prices (flexible durations)
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
