import { DurationOption } from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

interface DestinationJsonLdProps {
  destinationName: string;
  destinationSlug: string;
  locale: string;
  currency: string;
  durations: DurationOption[];
  tagline?: string | null;
}

export function DestinationJsonLd({
  destinationName,
  destinationSlug,
  locale,
  currency,
  durations,
  tagline,
}: DestinationJsonLdProps) {
  const pageUrl = `${BASE_URL}/${locale}/${destinationSlug}`;
  const description = tagline || `Unlimited data eSIM for ${destinationName}. Instant QR code delivery, 24/7 support, 10-minute connection guarantee.`;

  // Build individual Offer objects from plan durations
  const offers = durations.map((d) => ({
    '@type': 'Offer',
    name: `${destinationName} eSIM - ${d.duration} Day${d.duration > 1 ? 's' : ''}`,
    description: `${d.duration}-day ${d.data_type === 'unlimited' ? 'unlimited data' : d.data_type} eSIM for ${destinationName}`,
    price: d.retail_price.toFixed(2),
    priceCurrency: currency,
    availability: 'https://schema.org/InStock',
    url: `${BASE_URL}/${locale}/esim/${destinationSlug}/${d.duration}-day`,
    itemCondition: 'https://schema.org/NewCondition',
    seller: {
      '@type': 'Organization',
      '@id': `${BASE_URL}/#organization`,
    },
  }));

  // Find price range
  const prices = durations.map((d) => d.retail_price);
  const lowPrice = Math.min(...prices);
  const highPrice = Math.max(...prices);

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${pageUrl}/#product`,
    name: `${destinationName} eSIM - Trvel`,
    description,
    image: `${BASE_URL}/og-image.png`,
    brand: {
      '@type': 'Brand',
      name: 'Trvel',
    },
    category: 'Telecommunications',
    offers: durations.length > 1
      ? {
          '@type': 'AggregateOffer',
          lowPrice: lowPrice.toFixed(2),
          highPrice: highPrice.toFixed(2),
          priceCurrency: currency,
          offerCount: String(durations.length),
          availability: 'https://schema.org/InStock',
          offers,
        }
      : offers[0] || undefined,
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Will this eSIM work with my phone?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes, if your phone supports eSIM. This includes iPhone XS and newer, Samsung Galaxy S20+, Google Pixel 3+, and most phones from 2020 onwards. Check our compatibility page to confirm your device.`,
        },
      },
      {
        '@type': 'Question',
        name: `What if the eSIM doesn't work in ${destinationName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Trvel offers a 10-minute connection guarantee. If you can't get online within 10 minutes of landing in ${destinationName}, you'll receive a full refund with no questions asked. 24/7 support is always available.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Can I keep my phone number while using this eSIM?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Yes. Your eSIM works alongside your existing SIM card. Keep your number for calls and texts while using Trvel for data in ${destinationName}. Disable data roaming on your home SIM to avoid extra charges.`,
        },
      },
      {
        '@type': 'Question',
        name: `When should I install the ${destinationName} eSIM?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Install before you leave home, ideally 24-48 hours before your trip while you still have WiFi. The eSIM won't activate until you enable it in ${destinationName}, so there's no rush.`,
        },
      },
      {
        '@type': 'Question',
        name: `How fast is the internet in ${destinationName}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Full 4G/5G speeds on tier-1 local networks - the same towers used by locals. Typical speeds are 20-100 Mbps, suitable for streaming, video calls, Google Maps, and social media.`,
        },
      },
    ],
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${BASE_URL}/${locale}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Destinations',
        item: `${BASE_URL}/${locale}/destinations`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: `${destinationName} eSIM`,
        item: pageUrl,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
    </>
  );
}
