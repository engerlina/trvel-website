const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

export function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Trvel',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'Premium travel eSIM provider for 30+ destinations worldwide.',
    sameAs: [
      'https://twitter.com/trvelco',
      'https://www.facebook.com/trvelco',
      'https://www.instagram.com/trvelco',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['English', 'Malay', 'Indonesian'],
      areaServed: ['AU', 'SG', 'GB', 'MY', 'ID'],
    },
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'Trvel Travel eSIM',
    description: 'Unlimited data eSIM plans for international travel. Instant activation via QR code.',
    brand: {
      '@type': 'Brand',
      name: 'Trvel',
    },
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '19.99',
      highPrice: '59.99',
      priceCurrency: 'AUD',
      offerCount: '36',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '50000',
      bestRating: '5',
      worstRating: '1',
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Trvel',
    url: BASE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/destinations?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
