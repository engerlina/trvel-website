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

// Bundle groups to fetch - both unlimited and fixed data tiers
const BUNDLE_GROUPS = [
  'Standard Unlimited Essential',  // Unlimited data plans (1d, 3d)
  'Standard Fixed',                // Fixed data plans (1GB/7d, 2GB/15d, etc.)
];

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
  'CAD': 1.36,  // Canadian Dollar
  'NZD': 1.68,  // New Zealand Dollar
  'SGD': 1.34,
  'GBP': 0.79,
  'MYR': 4.47,
  'IDR': 15800,
};

// Map destination slugs to ISO country codes
const DESTINATION_TO_ISO: Record<string, string> = {
  // Original destinations
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
  'brunei-darussalam': 'BN',

  // All other destinations (177 added)
  'aland-islands': 'AX',
  'albania': 'AL',
  'algeria': 'DZ',
  'andorra': 'AD',
  'anguilla': 'AI',
  'antigua-and-barbuda': 'AG',
  'argentina': 'AR',
  'armenia': 'AM',
  'aruba': 'AW',
  'australia': 'AU',
  'austria': 'AT',
  'azerbaijan': 'AZ',
  'bahamas': 'BS',
  'bahrain': 'BH',
  'bangladesh': 'BD',
  'barbados': 'BB',
  'belarus': 'BY',
  'belgium': 'BE',
  'benin': 'BJ',
  'bermuda': 'BM',
  'bolivia': 'BO',
  'bonaire-sint-eustatius-and-saba': 'BQ',
  'bosnia-and-herzegovina': 'BA',
  'botswana': 'BW',
  'brazil': 'BR',
  'bulgaria': 'BG',
  'burkina-faso': 'BF',
  'cambodia': 'KH',
  'cameroon': 'CM',
  'canada': 'CA',
  'canary-islands': 'IC',
  'cape-verde': 'CV',
  'cayman-islands': 'KY',
  'central-african-republic': 'CF',
  'chad': 'TD',
  'chile': 'CL',
  'china': 'CN',
  'colombia': 'CO',
  'congo': 'CG',
  'costa-rica': 'CR',
  'cote-divoire': 'CI',
  'croatia': 'HR',
  'cuba': 'CU',
  'curacao': 'CW',
  'cyprus': 'CY',
  'czech-republic': 'CZ',
  'democratic-republic-of-the-congo': 'CD',
  'denmark': 'DK',
  'dominica': 'DM',
  'dominican-republic': 'DO',
  'ecuador': 'EC',
  'egypt': 'EG',
  'el-salvador': 'SV',
  'estonia': 'EE',
  'ethiopia': 'ET',
  'faroe-islands': 'FO',
  'fiji': 'FJ',
  'finland': 'FI',
  'french-guiana': 'GF',
  'gabon': 'GA',
  'georgia': 'GE',
  'germany': 'DE',
  'ghana': 'GH',
  'gibraltar': 'GI',
  'greece': 'GR',
  'greenland': 'GL',
  'grenada': 'GD',
  'guadeloupe': 'GP',
  'guam': 'GU',
  'guatemala': 'GT',
  'guernsey': 'GG',
  'guinea': 'GN',
  'guinea-bissau': 'GW',
  'guyana': 'GY',
  'haiti': 'HT',
  'holy-see-vatican-city-state': 'VA',
  'honduras': 'HN',
  'hong-kong-special-administrative-region-of-china': 'HK',
  'hungary': 'HU',
  'iceland': 'IS',
  'india': 'IN',
  'iraq': 'IQ',
  'ireland': 'IE',
  'isle-of-man': 'IM',
  'israel': 'IL',
  'jamaica': 'JM',
  'jersey': 'JE',
  'jordan': 'JO',
  'kazakhstan': 'KZ',
  'kenya': 'KE',
  'kosovo': 'XK',
  'kuwait': 'KW',
  'kyrgyzstan': 'KG',
  'lao-peoples-democratic-republic': 'LA',
  'latvia': 'LV',
  'lesotho': 'LS',
  'liberia': 'LR',
  'liechtenstein': 'LI',
  'lithuania': 'LT',
  'luxembourg': 'LU',
  'macau-special-administrative-region-of-china': 'MO',
  'madagascar': 'MG',
  'malawi': 'MW',
  'mali': 'ML',
  'malta': 'MT',
  'martinique': 'MQ',
  'mauritania': 'MR',
  'mauritius': 'MU',
  'mayotte': 'YT',
  'mexico': 'MX',
  'moldova-republic-of': 'MD',
  'monaco': 'MC',
  'mongolia': 'MN',
  'montenegro': 'ME',
  'montserrat': 'MS',
  'morocco': 'MA',
  'nauru': 'NR',
  'netherlands': 'NL',
  'netherlands-antilles': 'AN',
  'new-zealand': 'NZ',
  'nicaragua': 'NI',
  'niger': 'NE',
  'nigeria': 'NG',
  'north-macedonia-republic-of-north-macedonia': 'MK',
  'norway': 'NO',
  'oman': 'OM',
  'pakistan': 'PK',
  'panama': 'PA',
  'papua-new-guinea': 'PG',
  'paraguay': 'PY',
  'peru': 'PE',
  'poland': 'PL',
  'portugal': 'PT',
  'puerto-rico': 'PR',
  'qatar': 'QA',
  'republic-of-korea': 'KR',
  'reunion': 'RE',
  'romania': 'RO',
  'russian-federation': 'RU',
  'rwanda': 'RW',
  'saint-barthelemy': 'BL',
  'saint-kitts-and-nevis': 'KN',
  'saint-lucia': 'LC',
  'saint-martin-french': 'MF',
  'saint-vincent-and-the-grenadines': 'VC',
  'samoa': 'WS',
  'saudi-arabia': 'SA',
  'senegal': 'SN',
  'serbia': 'RS',
  'seychelles': 'SC',
  'slovakia': 'SK',
  'slovenia': 'SI',
  'south-africa': 'ZA',
  'spain': 'ES',
  'sri-lanka': 'LK',
  'sudan': 'SD',
  'suriname': 'SR',
  'swaziland': 'SZ',
  'sweden': 'SE',
  'switzerland': 'CH',
  'taiwan': 'TW',
  'tajikistan': 'TJ',
  'tanzania-united-republic-of': 'TZ',
  'tonga': 'TO',
  'trinidad-and-tobago': 'TT',
  'tunisia': 'TN',
  'turkey': 'TR',
  'turks-and-caicos-islands': 'TC',
  'uganda': 'UG',
  'ukraine': 'UA',
  'united-arab-emirates': 'AE',
  'uruguay': 'UY',
  'uzbekistan': 'UZ',
  'vanuatu': 'VU',
  'virgin-islands-british': 'VG',
  'virgin-islands-us': 'VI',
  'zambia': 'ZM',
};

// Locale to currency mapping
const LOCALE_CURRENCIES: Record<string, string> = {
  'en-au': 'AUD',
  'en-ca': 'CAD',  // Canada
  'en-nz': 'NZD',  // New Zealand
  'en-sg': 'SGD',
  'en-gb': 'GBP',
  'en-us': 'USD',
  'ms-my': 'MYR',
  'id-id': 'IDR',
};

// Competitor/incumbent info by currency (not locale)
const COMPETITORS: Record<string, { name: string; dailyRate: number }> = {
  'AUD': { name: 'Telstra', dailyRate: 10 },
  'CAD': { name: 'Rogers', dailyRate: 18 },    // Canada - highest roaming pain
  'NZD': { name: 'Spark', dailyRate: 2.14 },   // NZ - $30/14 days = ~$2.14/day
  'SGD': { name: 'Singtel', dailyRate: 15 },
  'GBP': { name: 'EE', dailyRate: 3.54 },
  'USD': { name: 'Verizon', dailyRate: 12 },   // Changed from T-Mobile (they have free roaming)
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

// Data tier type for pricing display
type DataTier = 'unlimited' | '1gb' | '2gb' | '3gb' | '5gb' | '10gb';

// Duration option stored in Plan.durations JSON array
interface DurationOption {
  duration: number;        // Days (1, 3, 5, 7, 10, 15, 30)
  wholesale_cents: number; // Wholesale price in USD cents
  retail_price: number;    // Retail price in local currency
  bundle_name: string;     // eSIM-Go bundle identifier for fulfillment
  daily_rate: number;      // Calculated: retail_price / duration
  data_type: DataTier;     // Data tier: 'unlimited', '1gb', '2gb', etc.
  data_amount_mb?: number; // Data amount in MB (null/undefined for unlimited)
}

// Helper to determine data tier from bundle
function getDataTier(bundle: EsimGoBundle): { tier: DataTier; amountMb?: number } {
  const dataAllowance = bundle.allowances?.find(a => a.type === 'DATA' && a.service === 'STANDARD');

  if (bundle.unlimited || dataAllowance?.unlimited) {
    return { tier: 'unlimited' };
  }

  const amountMb = dataAllowance?.amount || 0;
  const amountGb = amountMb / 1000;

  if (amountGb <= 1) return { tier: '1gb', amountMb };
  if (amountGb <= 2) return { tier: '2gb', amountMb };
  if (amountGb <= 3) return { tier: '3gb', amountMb };
  if (amountGb <= 5) return { tier: '5gb', amountMb };
  return { tier: '10gb', amountMb };
}

async function fetchCatalog(): Promise<EsimGoBundle[]> {
  if (!ESIMGO_API_TOKEN) {
    throw new Error('ESIMGO_API_TOKEN environment variable is not set');
  }

  console.log('Fetching eSIM-Go catalog...');
  console.log(`Groups to fetch: ${BUNDLE_GROUPS.join(', ')}`);

  const allBundles: EsimGoBundle[] = [];

  // Fetch from each bundle group
  for (const bundleGroup of BUNDLE_GROUPS) {
    console.log(`\n  Fetching group: ${bundleGroup}`);
    let page = 1;
    let hasMore = true;
    let groupTotal = 0;

    while (hasMore && page <= 50) {
      const url = new URL(`${ESIMGO_API_BASE}/catalogue`);
      url.searchParams.set('group', bundleGroup);
      url.searchParams.set('page', page.toString());
      url.searchParams.set('perPage', '100');

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
        groupTotal += bundles.length;

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

    console.log(`    Total from ${bundleGroup}: ${groupTotal} bundles`);
  }

  console.log(`\nTotal bundles fetched across all groups: ${allBundles.length}`);
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

      // Get the group from the bundle (first group in array)
      const bundleGroupName = bundle.groups?.[0] || 'Unknown';

      const bundleData = {
        description: bundle.description?.slice(0, 2000) || null, // Truncate if too long
        group: bundleGroupName,
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
 * Bundle with data tier info for pricing
 */
interface BundleWithTier {
  bundle: EsimGoBundle;
  dataTier: DataTier;
  dataAmountMb?: number;
}

/**
 * Find ALL available bundles for a country (both unlimited and fixed data)
 * Returns an array of bundles with tier info, keyed by a composite key (duration-dataTier)
 */
function findAllBundlesForCountry(bundles: EsimGoBundle[], countryIso: string): Map<string, BundleWithTier> {
  // Filter bundles for this country
  const countryBundles = bundles.filter(b =>
    b.countries.some(c => c.iso === countryIso)
  );

  const bundleMap = new Map<string, BundleWithTier>();

  for (const bundle of countryBundles) {
    const { tier, amountMb } = getDataTier(bundle);
    const key = `${bundle.duration}-${tier}`;

    // Keep the cheapest bundle for each duration-tier combination
    const existing = bundleMap.get(key);
    if (!existing || bundle.price < existing.bundle.price) {
      bundleMap.set(key, {
        bundle,
        dataTier: tier,
        dataAmountMb: amountMb,
      });
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
  console.log('\nSyncing plans with tiered pricing (unlimited + fixed data)...');
  console.log('Pricing: 60% markup default, 10% under competitor cap, 50% min margin');
  console.log('Data tiers: unlimited, 1gb, 2gb, 3gb, 5gb, 10gb\n');

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

    // Extract available products (composite keys like "7-1gb", "3-unlimited")
    const availableKeys = Array.from(bundleMap.keys());
    const availableDurations = [...new Set(availableKeys.map(k => parseInt(k.split('-')[0])))].sort((a, b) => a - b);
    const availableTiers = [...new Set(availableKeys.map(k => k.split('-')[1]))];

    // Choose default durations based on unlimited options first, then fixed
    const unlimitedDurations = availableKeys
      .filter(k => k.endsWith('-unlimited'))
      .map(k => parseInt(k.split('-')[0]))
      .sort((a, b) => a - b);

    const fixedDurations = availableKeys
      .filter(k => !k.endsWith('-unlimited'))
      .map(k => parseInt(k.split('-')[0]))
      .sort((a, b) => a - b);

    // Default to showing: 1 fixed budget option + 2 unlimited options (or best available)
    const defaultDurations = chooseDefaultDurations([...unlimitedDurations, ...fixedDurations]);

    console.log(`  ✓ ${destination} (${countryIso}):`);
    console.log(`      Tiers: [${availableTiers.join(', ')}]`);
    console.log(`      Durations: [${availableDurations.join(', ')}] days`);

    for (const locale of locales) {
      const currency = LOCALE_CURRENCIES[locale];
      const competitor = COMPETITORS[currency];
      const competitorDailyRate = competitor?.dailyRate || 10;

      // Build durations array with all pricing info (including tier info)
      const durations: DurationOption[] = [];
      let bestDailyRate = Infinity;

      for (const [key, bundleWithTier] of bundleMap) {
        const { bundle, dataTier, dataAmountMb } = bundleWithTier;
        const duration = bundle.duration;
        const wholesaleCents = Math.round(bundle.price * 100);
        const retailPrice = calculateRetailPrice(wholesaleCents, currency, competitorDailyRate, duration);
        const dailyRate = retailPrice / duration;

        durations.push({
          duration,
          wholesale_cents: wholesaleCents,
          retail_price: retailPrice,
          bundle_name: bundle.name,
          daily_rate: Math.round(dailyRate * 100) / 100,
          data_type: dataTier,
          data_amount_mb: dataAmountMb,
        });

        if (dailyRate < bestDailyRate) {
          bestDailyRate = dailyRate;
        }
      }

      // Sort durations by: data_type (fixed first for budget), then duration
      durations.sort((a, b) => {
        // Unlimited comes after fixed data
        if (a.data_type === 'unlimited' && b.data_type !== 'unlimited') return 1;
        if (a.data_type !== 'unlimited' && b.data_type === 'unlimited') return -1;
        // Then sort by duration
        return a.duration - b.duration;
      });

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
    const audPrices: string[] = [];
    for (const [key, bundleWithTier] of bundleMap) {
      const { bundle, dataTier } = bundleWithTier;
      const wholesaleCents = Math.round(bundle.price * 100);
      const price = calculateRetailPrice(wholesaleCents, 'AUD', audRate, bundle.duration);
      audPrices.push(`${bundle.duration}d/${dataTier}=$${price}`);
    }
    if (audPrices.length > 0) {
      console.log(`      Retail (AUD): ${audPrices.slice(0, 5).join(', ')}`);
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
