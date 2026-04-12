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
