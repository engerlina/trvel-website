const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

export function JsonLd() {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${BASE_URL}/#organization`,
    name: 'Trvel',
    alternateName: 'Trvel eSIM',
    url: BASE_URL,
    logo: {
      '@type': 'ImageObject',
      url: `${BASE_URL}/logo.png`,
      width: 600,
      height: 60,
    },
    image: `${BASE_URL}/og-image.png`,
    description: 'Premium travel eSIM provider offering unlimited data plans for 190+ destinations worldwide. Instant QR code delivery, 24/7 live support, and 10-minute connection guarantee.',
    sameAs: [
      'https://twitter.com/trvelco',
      'https://www.facebook.com/trvelco',
      'https://www.instagram.com/trvelco',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      telephone: '+61345027555',
      email: 'support@trvel.co',
      url: `${BASE_URL}/en-au/help`,
      availableLanguage: ['English', 'Malay', 'Indonesian'],
      areaServed: ['AU', 'SG', 'GB', 'MY', 'ID', 'US', 'CA', 'NZ'],
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
        opens: '00:00',
        closes: '23:59',
      },
    },
    knowsAbout: ['eSIM', 'travel data plans', 'international roaming', 'mobile connectivity'],
    slogan: 'Premium data abroad without the roaming bill',
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${BASE_URL}/#product`,
    name: 'Trvel Travel eSIM',
    description: 'Unlimited data eSIM plans for international travel to 190+ destinations. Instant QR code activation, 24/7 live support, 10-minute connection guarantee or full refund.',
    image: `${BASE_URL}/og-image.png`,
    brand: {
      '@type': 'Brand',
      name: 'Trvel',
    },
    category: 'Telecommunications',
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '4.99',
      highPrice: '72.99',
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
    '@id': `${BASE_URL}/#website`,
    name: 'Trvel',
    url: BASE_URL,
    publisher: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
    },
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
