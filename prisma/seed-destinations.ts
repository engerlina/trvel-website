import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// Currency mapping per locale
const localeCurrencies: Record<string, string> = {
  'en-au': 'AUD',
  'en-sg': 'SGD',
  'en-gb': 'GBP',
  'en-us': 'USD',
  'ms-my': 'MYR',
  'id-id': 'IDR',
};

// Exchange rates from USD
const USD_EXCHANGE_RATES: Record<string, number> = {
  'USD': 1.0,
  'AUD': 1.55,
  'SGD': 1.34,
  'GBP': 0.79,
  'MYR': 4.47,
  'IDR': 15800,
};

// Competitor daily roaming rates by currency
const COMPETITORS: Record<string, { name: string; dailyRate: number }> = {
  'AUD': { name: 'Telstra', dailyRate: 10 },
  'SGD': { name: 'Singtel', dailyRate: 15 },
  'GBP': { name: 'EE', dailyRate: 3.54 },
  'USD': { name: 'AT&T', dailyRate: 12 },
  'MYR': { name: 'Maxis', dailyRate: 35 },
  'IDR': { name: 'Telkomsel', dailyRate: 100000 },
};

// Pricing constants
const MINIMUM_MARGIN_MULTIPLIER = 1.5; // 50% minimum margin
const COMPETITOR_DISCOUNT = 0.90; // 10% under competitor

// DurationOption interface matching the new schema
interface DurationOption {
  duration: number;
  wholesale_cents: number;
  retail_price: number;
  bundle_name: string;
  daily_rate: number;
}

// Destinations with wholesale costs in USD (approximate fallback values)
// These are used when eSIM-Go sync hasn't run. Real prices come from sync-esimgo.ts
const destinationsData = [
  {
    slug: 'japan',
    name: 'Japan',
    tagline: 'Stay connected from Tokyo to Osaka with unlimited data on NTT Docomo',
    // Wholesale USD costs per day (approximate)
    wholesaleDailyRate: 2.40,
  },
  {
    slug: 'thailand',
    name: 'Thailand',
    tagline: 'Explore Bangkok to Phuket with reliable 4G/5G coverage on AIS',
    wholesaleDailyRate: 2.00,
  },
  {
    slug: 'south-korea',
    name: 'South Korea',
    tagline: 'Navigate Seoul and beyond with blazing-fast 5G on SK Telecom',
    wholesaleDailyRate: 2.40,
  },
  {
    slug: 'singapore',
    name: 'Singapore',
    tagline: 'Experience the Lion City with premium Singtel connectivity',
    wholesaleDailyRate: 1.60,
  },
  {
    slug: 'indonesia',
    name: 'Indonesia',
    tagline: 'From Bali to Jakarta with wide coverage on Telkomsel',
    wholesaleDailyRate: 1.60,
  },
  {
    slug: 'malaysia',
    name: 'Malaysia',
    tagline: 'Discover KL to Langkawi with reliable Maxis network',
    wholesaleDailyRate: 1.60,
  },
  {
    slug: 'vietnam',
    name: 'Vietnam',
    tagline: 'Travel from Hanoi to Ho Chi Minh with Viettel coverage',
    wholesaleDailyRate: 1.60,
  },
  {
    slug: 'philippines',
    name: 'Philippines',
    tagline: 'Island hop connected with Globe Telecom across 7,000+ islands',
    wholesaleDailyRate: 1.60,
  },
  {
    slug: 'united-kingdom',
    name: 'United Kingdom',
    tagline: 'Explore London to Edinburgh with premium EE network',
    wholesaleDailyRate: 2.80,
  },
  {
    slug: 'france',
    name: 'France',
    tagline: 'From Paris to Nice with reliable Orange France coverage',
    wholesaleDailyRate: 2.80,
  },
  {
    slug: 'italy',
    name: 'Italy',
    tagline: 'Rome, Venice, and beyond with TIM Italia network',
    wholesaleDailyRate: 2.80,
  },
  {
    slug: 'united-states',
    name: 'United States',
    tagline: 'Coast to coast coverage on T-Mobile USA',
    wholesaleDailyRate: 3.20,
  },
];

// Available durations
const AVAILABLE_DURATIONS = [5, 7, 15];
const DEFAULT_DURATIONS = [5, 7, 15];

const locales = ['en-au', 'en-sg', 'en-gb', 'en-us', 'ms-my', 'id-id'];

// Localized destination names
const localizedNames: Record<string, Record<string, { name: string; tagline: string }>> = {
  'ms-my': {
    'japan': { name: 'Jepun', tagline: 'Kekal berhubung dari Tokyo ke Osaka dengan data tanpa had di NTT Docomo' },
    'thailand': { name: 'Thailand', tagline: 'Teroka Bangkok ke Phuket dengan liputan 4G/5G yang boleh dipercayai di AIS' },
    'south-korea': { name: 'Korea Selatan', tagline: 'Navigasi Seoul dengan 5G pantas di SK Telecom' },
    'singapore': { name: 'Singapura', tagline: 'Alami Bandar Singa dengan sambungan Singtel premium' },
    'indonesia': { name: 'Indonesia', tagline: 'Dari Bali ke Jakarta dengan liputan luas di Telkomsel' },
    'malaysia': { name: 'Malaysia', tagline: 'Temui KL ke Langkawi dengan rangkaian Maxis yang boleh dipercayai' },
    'vietnam': { name: 'Vietnam', tagline: 'Perjalanan dari Hanoi ke Ho Chi Minh dengan liputan Viettel' },
    'philippines': { name: 'Filipina', tagline: 'Hop pulau berhubung dengan Globe Telecom' },
    'united-kingdom': { name: 'United Kingdom', tagline: 'Teroka London ke Edinburgh dengan rangkaian EE premium' },
    'france': { name: 'Perancis', tagline: 'Dari Paris ke Nice dengan liputan Orange France' },
    'italy': { name: 'Itali', tagline: 'Rom, Venice, dan seterusnya dengan rangkaian TIM Italia' },
    'united-states': { name: 'Amerika Syarikat', tagline: 'Liputan pantai ke pantai di T-Mobile USA' },
  },
  'id-id': {
    'japan': { name: 'Jepang', tagline: 'Tetap terhubung dari Tokyo ke Osaka dengan data tak terbatas di NTT Docomo' },
    'thailand': { name: 'Thailand', tagline: 'Jelajahi Bangkok ke Phuket dengan jaringan 4G/5G AIS' },
    'south-korea': { name: 'Korea Selatan', tagline: 'Navigasi Seoul dengan 5G cepat di SK Telecom' },
    'singapore': { name: 'Singapura', tagline: 'Nikmati Kota Singa dengan koneksi Singtel premium' },
    'indonesia': { name: 'Indonesia', tagline: 'Dari Bali ke Jakarta dengan cakupan luas di Telkomsel' },
    'malaysia': { name: 'Malaysia', tagline: 'Temukan KL ke Langkawi dengan jaringan Maxis' },
    'vietnam': { name: 'Vietnam', tagline: 'Perjalanan dari Hanoi ke Ho Chi Minh dengan cakupan Viettel' },
    'philippines': { name: 'Filipina', tagline: 'Jelajahi pulau dengan Globe Telecom' },
    'united-kingdom': { name: 'Inggris', tagline: 'Jelajahi London ke Edinburgh dengan jaringan EE premium' },
    'france': { name: 'Prancis', tagline: 'Dari Paris ke Nice dengan cakupan Orange France' },
    'italy': { name: 'Italia', tagline: 'Roma, Venesia, dan sekitarnya dengan jaringan TIM Italia' },
    'united-states': { name: 'Amerika Serikat', tagline: 'Cakupan pantai ke pantai di T-Mobile USA' },
  },
};

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
  wholesaleUsd: number,
  currency: string,
  planDuration: number
): number {
  const exchangeRate = USD_EXCHANGE_RATES[currency] || 1;
  const wholesaleLocal = wholesaleUsd * exchangeRate;
  const competitor = COMPETITORS[currency];
  const competitorDailyRate = competitor?.dailyRate || 10;

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

async function main() {
  console.log('Seeding destinations and plans...\n');
  console.log('Pricing: 60% markup, .99/.49 rounding\n');
  console.log('NOTE: This seed creates basic fallback data. Run sync-esimgo.ts for real pricing.\n');

  // Clear existing data
  console.log('Clearing existing destinations and plans...');
  await prisma.plan.deleteMany({});
  await prisma.destination.deleteMany({});

  let destinationCount = 0;
  let planCount = 0;

  for (const dest of destinationsData) {
    for (const locale of locales) {
      const currency = localeCurrencies[locale];

      // Get localized name/tagline or use English default
      const localized = localizedNames[locale]?.[dest.slug];
      const name = localized?.name || dest.name;
      const tagline = localized?.tagline || dest.tagline;

      // Create destination
      console.log(`  Creating destination: ${name} (${locale})`);
      await prisma.destination.create({
        data: {
          slug: dest.slug,
          locale,
          name,
          tagline,
        },
      });
      destinationCount++;

      // Build durations array using new schema
      const durations: DurationOption[] = AVAILABLE_DURATIONS.map(days => {
        const wholesaleUsd = dest.wholesaleDailyRate * days;
        const retailPrice = calculateRetailPrice(wholesaleUsd, currency, days);
        const dailyRate = retailPrice / days;

        return {
          duration: days,
          wholesale_cents: Math.round(wholesaleUsd * 100),
          retail_price: retailPrice,
          bundle_name: `seed-${dest.slug}-${days}day`,
          daily_rate: dailyRate,
        };
      });

      // Find best daily rate (lowest rate per day across all durations)
      const bestDailyRate = Math.min(...durations.map(d => d.daily_rate));

      // Create plan with new schema
      console.log(`    Creating plan: ${currency} - ${durations.length} durations`);
      await prisma.plan.create({
        data: {
          destination_slug: dest.slug,
          locale,
          currency,
          durations: durations as unknown as Prisma.InputJsonValue,
          default_durations: DEFAULT_DURATIONS,
          best_daily_rate: bestDailyRate,
        },
      });
      planCount++;
    }
  }

  console.log('\n✓ Done! Seeded:');
  console.log(`  - ${destinationCount} destinations`);
  console.log(`  - ${planCount} plans`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
