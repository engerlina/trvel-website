'use client';

import { useEffect } from 'react';

const LOCALE_TO_LANG: Record<string, string> = {
  'en-au': 'en-AU',
  'en-sg': 'en-SG',
  'en-gb': 'en-GB',
  'en-us': 'en-US',
  'ms-my': 'ms-MY',
  'id-id': 'id-ID',
  'en-ca': 'en-CA',
  'en-nz': 'en-NZ',
};

export function SetHtmlLang({ locale }: { locale: string }) {
  useEffect(() => {
    const lang = LOCALE_TO_LANG[locale] || locale;
    document.documentElement.lang = lang;
  }, [locale]);

  return null;
}
