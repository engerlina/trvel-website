import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Header, Footer } from '@/components/layout';
import {
  Hero,
  Plans,
  WhyTrvel,
  Comparison,
  HowItWorks,
  Testimonials,
  Destinations,
  FloatingDestinationSelector,
} from '@/components/sections';
import { DestinationProvider } from '@/contexts/DestinationContext';
import { JsonLd } from '@/components/seo';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

interface PageProps {
  params: Promise<{ locale: string }>;
}

const localeToOgLocale: Record<string, string> = {
  'en-au': 'en_AU',
  'en-sg': 'en_SG',
  'en-gb': 'en_GB',
  'en-us': 'en_US',
  'ms-my': 'ms_MY',
  'id-id': 'id_ID',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.hero' });

  // Use optimized OG title/description (50-60 chars title, 110-160 chars description)
  const ogTitle = t('ogTitle');
  const ogDescription = t('ogDescription');

  return {
    title: ogTitle,
    description: ogDescription,
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        'en-AU': `${BASE_URL}/en-au`,
        'en-SG': `${BASE_URL}/en-sg`,
        'en-GB': `${BASE_URL}/en-gb`,
        'en-US': `${BASE_URL}/en-us`,
        'ms-MY': `${BASE_URL}/ms-my`,
        'id-ID': `${BASE_URL}/id-id`,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: `${BASE_URL}/${locale}`,
      locale: localeToOgLocale[locale] || 'en_AU',
      alternateLocale: Object.values(localeToOgLocale).filter(l => l !== localeToOgLocale[locale]),
      type: 'website',
      siteName: 'Trvel',
      images: [
        {
          url: `${BASE_URL}/og-image.png`,
          width: 1200,
          height: 630,
          alt: 'Trvel - Travel eSIM Plans',
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [`${BASE_URL}/og-image.png`],
    },
  };
}

export default async function HomePage() {
  return (
    <DestinationProvider>
      <JsonLd />
      <Header />
      <FloatingDestinationSelector />
      <main className="pt-16 md:pt-18">
        <Hero />
        <Plans />
        <WhyTrvel />
        <Comparison />
        <HowItWorks />
        <Testimonials />
        <Destinations />
      </main>
      <Footer />
    </DestinationProvider>
  );
}
