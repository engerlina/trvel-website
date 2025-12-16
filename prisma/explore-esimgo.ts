/**
 * eSIM-Go API Explorer
 * Fetches catalog to understand available bundles, groups, and durations
 */

import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env file manually
const envPath = resolve(process.cwd(), '.env');
const envContent = readFileSync(envPath, 'utf-8');
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length) {
    process.env[key.trim()] = valueParts.join('=').trim();
  }
});

const ESIMGO_API_BASE = 'https://api.esim-go.com/v2.5';
const ESIMGO_API_TOKEN = process.env.ESIMGO_API_TOKEN;

// Countries we care about
const TARGET_COUNTRIES = ['JP', 'TH', 'KR', 'SG', 'ID', 'MY', 'VN', 'PH', 'GB', 'FR', 'IT', 'US'];

// Groups to check
const GROUPS_TO_CHECK = [
  'Standard Unlimited Essential',
  'Standard Unlimited',
  'Standard Fixed',
  'Unlimited',
  '', // No filter - get all
];

interface EsimGoBundle {
  name: string;
  description: string;
  groups: string[];
  countries: Array<{ name: string; region: string; iso: string }>;
  duration: number;
  price: number;
  speed: string[];
  unlimited: boolean;
  allowances: Array<{
    type: string;
    amount: number;
    unit: string;
    unlimited: boolean;
  }>;
}

async function fetchBundles(group?: string): Promise<EsimGoBundle[]> {
  if (!ESIMGO_API_TOKEN) {
    throw new Error('ESIMGO_API_TOKEN not set');
  }

  const allBundles: EsimGoBundle[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 50) {
    const url = new URL(`${ESIMGO_API_BASE}/catalogue`);
    if (group) {
      url.searchParams.set('group', group);
    }
    url.searchParams.set('page', page.toString());
    url.searchParams.set('perPage', '100');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'X-API-Key': ESIMGO_API_TOKEN,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`API error for group "${group}": ${response.status}`);
      break;
    }

    const data = await response.json();

    // Debug: print response structure on first page
    if (page === 1) {
      console.log(`    Response keys: ${Object.keys(data).join(', ')}`);
      if (data.pagination) {
        console.log(`    Pagination: ${JSON.stringify(data.pagination)}`);
      }
    }

    // The API returns an array directly, not wrapped in { bundles: [] }
    const bundles = Array.isArray(data) ? data : (data.bundles || []);

    if (bundles.length > 0) {
      allBundles.push(...bundles);
      console.log(`    Page ${page}: ${bundles.length} bundles`);

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

  return allBundles;
}

async function main() {
  console.log('='.repeat(70));
  console.log('eSIM-Go API Explorer');
  console.log('='.repeat(70));
  console.log(`API Token: ${ESIMGO_API_TOKEN?.slice(0, 10)}...`);
  console.log('');

  // Fetch from each group
  const allBundlesByGroup: Map<string, EsimGoBundle[]> = new Map();

  for (const group of GROUPS_TO_CHECK) {
    console.log(`\nFetching group: "${group || 'ALL (no filter)'}"`);
    const bundles = await fetchBundles(group || undefined);
    console.log(`  Found: ${bundles.length} bundles`);
    allBundlesByGroup.set(group, bundles);
  }

  // Merge all unique bundles
  const allUniqueBundles = new Map<string, EsimGoBundle>();
  allBundlesByGroup.forEach(bundles => {
    bundles.forEach(b => allUniqueBundles.set(b.name, b));
  });

  console.log('\n' + '='.repeat(70));
  console.log(`TOTAL UNIQUE BUNDLES: ${allUniqueBundles.size}`);
  console.log('='.repeat(70));

  const bundles = Array.from(allUniqueBundles.values());

  // Find all unique groups
  const groups = new Set<string>();
  bundles.forEach(b => b.groups?.forEach(g => groups.add(g)));

  console.log('\n📁 ALL BUNDLE GROUPS FOUND:');
  Array.from(groups).sort().forEach(g => console.log(`  - ${g}`));

  // Find all unique durations
  const durations = new Set<number>();
  bundles.forEach(b => durations.add(b.duration));

  console.log('\n⏱️ ALL DURATIONS (days):');
  console.log(`  ${Array.from(durations).sort((a, b) => a - b).join(', ')}`);

  // For each target country, find available bundles
  console.log('\n🌍 BUNDLES BY COUNTRY:');

  for (const iso of TARGET_COUNTRIES) {
    const countryBundles = bundles.filter(b =>
      b.countries?.some(c => c.iso === iso)
    );

    if (countryBundles.length === 0) {
      console.log(`\n  ${iso}: ❌ No bundles found`);
      continue;
    }

    const countryName = countryBundles[0].countries.find(c => c.iso === iso)?.name || iso;
    console.log(`\n  ${iso} (${countryName}): ${countryBundles.length} bundles`);

    // Group by duration
    const byDuration = new Map<number, EsimGoBundle[]>();
    countryBundles.forEach(b => {
      const existing = byDuration.get(b.duration) || [];
      existing.push(b);
      byDuration.set(b.duration, existing);
    });

    // Show bundles by duration
    Array.from(byDuration.keys()).sort((a, b) => a - b).forEach(duration => {
      const dBundles = byDuration.get(duration)!;
      console.log(`    ${duration} day(s): ${dBundles.length} bundles`);

      // Show examples with prices, focusing on unlimited ones
      const unlimitedFirst = [...dBundles].sort((a, b) => {
        const aUnlimited = a.unlimited || a.allowances?.some(al => al.unlimited) ? 1 : 0;
        const bUnlimited = b.unlimited || b.allowances?.some(al => al.unlimited) ? 1 : 0;
        return bUnlimited - aUnlimited;
      });

      unlimitedFirst.slice(0, 5).forEach(b => {
        const priceUsd = (b.price / 100).toFixed(4);
        const isUnlimited = b.unlimited || b.allowances?.some(al => al.unlimited);
        const unlimitedTag = isUnlimited ? ' [UNLIMITED]' : '';
        const groupStr = b.groups?.slice(0, 1).join('') || '';
        console.log(`      - ${b.name}: $${priceUsd}${unlimitedTag} (${groupStr})`);
      });
      if (dBundles.length > 5) {
        console.log(`      ... and ${dBundles.length - 5} more`);
      }
    });
  }

  // Show detailed info for Japan as example
  console.log('\n\n📋 DETAILED: Japan Bundles');
  const jpBundles = bundles.filter(b => b.countries?.some(c => c.iso === 'JP'));
  jpBundles.sort((a, b) => a.duration - b.duration || a.price - b.price);

  jpBundles.forEach(b => {
    const priceUsd = (b.price / 100).toFixed(4);
    const dataAllowance = b.allowances?.find(a => a.type === 'DATA');
    const dataStr = dataAllowance?.unlimited
      ? 'Unlimited'
      : `${dataAllowance?.amount || '?'}${dataAllowance?.unit || 'MB'}`;

    console.log(`  ${b.duration}d | $${priceUsd} | ${dataStr} | ${b.name}`);
    console.log(`      Groups: ${b.groups?.join(', ') || 'none'}`);
  });
}

main().catch(console.error);
