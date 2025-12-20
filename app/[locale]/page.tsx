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
  'ms-my': 'ms_MY',
  'id-id': 'id_ID',
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'home.hero' });

  return {
    title: t('headline'),
    description: t('subheadline'),
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        'en-AU': `${BASE_URL}/en-au`,
        'en-SG': `${BASE_URL}/en-sg`,
        'en-GB': `${BASE_URL}/en-gb`,
        'ms-MY': `${BASE_URL}/ms-my`,
        'id-ID': `${BASE_URL}/id-id`,
      },
    },
    openGraph: {
      title: t('headline'),
      description: t('subheadline'),
      url: `${BASE_URL}/${locale}`,
      locale: localeToOgLocale[locale] || 'en_AU',
      alternateLocale: Object.values(localeToOgLocale).filter(l => l !== localeToOgLocale[locale]),
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
