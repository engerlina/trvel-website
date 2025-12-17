import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { EsimChecker } from '@/components/compatibility/EsimChecker';
import { Link } from '@/i18n/routing';
import { ArrowRight, Smartphone } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://trvel.co';

interface CompatibilityPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: CompatibilityPageProps): Promise<Metadata> {
  const { locale } = await params;

  const title = 'eSIM Compatibility Checker | Trvel';
  const description = 'Check if your phone supports eSIM. Works with iPhone, Samsung, Google Pixel, and more. Find out in seconds if you can use a travel eSIM.';

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/compatibility`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/compatibility`,
      type: 'website',
    },
  };
}

export default async function CompatibilityPage({ params }: CompatibilityPageProps) {
  return (
    <>
      <Header />
      <main className="pt-16 md:pt-18">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-cream-200 via-cream-100 to-white py-12 md:py-16">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99 191 191 / 0.2) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />

          <div className="container-wide relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-700 rounded-full text-sm font-medium mb-6">
                <Smartphone className="w-4 h-4" />
                Quick device check
              </div>

              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-4">
                Is Your Phone eSIM Ready?
              </h1>

              <p className="text-body-lg text-navy-300 max-w-2xl mx-auto">
                Check your phone&apos;s eSIM compatibility in seconds. Most phones from 2019 onwards support eSIM.
              </p>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* Checker Section */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container-wide">
            <div className="max-w-2xl mx-auto">
              <EsimChecker />
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-cream-50">
          <div className="container-wide">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-heading-lg font-bold text-navy-500 mb-4">
                Ready to get your eSIM?
              </h2>
              <p className="text-navy-400 mb-6">
                Browse our destinations and get connected in minutes.
              </p>
              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-brand-500/25 transition-all"
              >
                Browse Destinations
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
