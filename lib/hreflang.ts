import { routing } from '@/i18n/routing';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

// Map locale slug to hreflang tag format
const LOCALE_TO_HREFLANG: Record<string, string> = {
  'en-au': 'en-AU',
  'en-sg': 'en-SG',
  'en-gb': 'en-GB',
  'en-us': 'en-US',
  'ms-my': 'ms-MY',
  'id-id': 'id-ID',
  'en-ca': 'en-CA',
  'en-nz': 'en-NZ',
};

// English locales consolidate to en-au for canonical purposes. The six
// English variants serve near-duplicate content (only prices/currency differ)
// which triggered GSC "Duplicate, Google chose different canonical than user"
// on hundreds of pages. Consolidating SEO signal to a single English canonical
// fixes that; hreflang still points users in each country at their local price
// variant.
const CANONICAL_LOCALE: Record<string, string> = {
  'en-au': 'en-au',
  'en-sg': 'en-au',
  'en-gb': 'en-au',
  'en-us': 'en-au',
  'en-ca': 'en-au',
  'en-nz': 'en-au',
  'ms-my': 'ms-my',
  'id-id': 'id-id',
};

/**
 * Return the canonical URL for the given locale/path. English locales point to
 * the en-au variant; non-English locales self-canonicalize.
 */
export function buildCanonicalUrl(locale: string, path: string): string {
  const canonicalLocale = CANONICAL_LOCALE[locale] || locale;
  return `${BASE_URL}/${canonicalLocale}${path}`;
}

/**
 * Generate hreflang alternate links for all locales.
 * Used in generateMetadata to produce correct alternate language tags.
 */
export function buildHreflangAlternates(path: string): Record<string, string> {
  const languages: Record<string, string> = {
    'x-default': `${BASE_URL}/en-au${path}`,
  };
  for (const locale of routing.locales) {
    const hreflang = LOCALE_TO_HREFLANG[locale];
    if (hreflang) {
      languages[hreflang] = `${BASE_URL}/${locale}${path}`;
    }
  }
  return languages;
}
