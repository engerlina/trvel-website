import { Metadata } from 'next';
import { prisma, withRetry } from '@/lib/db';
import { notFound } from 'next/navigation';
import { Header, Footer } from '@/components/layout';
import { Link } from '@/i18n/routing';
import {
  Check,
  X,
  ArrowRight,
  Smartphone,
  ChevronRight,
} from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

interface BrandPageProps {
  params: Promise<{
    locale: string;
    brand: string;
  }>;
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { locale, brand } = await params;

  const brandData = await withRetry(() =>
    prisma.deviceBrand.findUnique({
      where: { slug: brand },
    })
  );

  if (!brandData) {
    return { title: 'Brand Not Found' };
  }

  const title = `${brandData.name} eSIM Compatible Phones | Trvel`;
  const description = `Find eSIM compatible ${brandData.name} phones. Check if your ${brandData.name} device supports eSIM for international travel.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/compatibility/${brand}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/compatibility/${brand}`,
      type: 'website',
    },
  };
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { locale, brand } = await params;

  const brandData = await withRetry(() =>
    prisma.deviceBrand.findUnique({
      where: { slug: brand },
      include: {
        devices: {
          orderBy: [
            { release_year: 'desc' },
            { sort_order: 'asc' },
          ],
        },
      },
    })
  );

  if (!brandData) {
    notFound();
  }

  // Get other brands for cross-linking
  const otherBrands = await withRetry(() =>
    prisma.deviceBrand.findMany({
      where: { slug: { not: brand } },
      orderBy: { sort_order: 'asc' },
      take: 5,
    })
  );

  const compatibleDevices = brandData.devices.filter(d => d.is_compatible);
  const incompatibleDevices = brandData.devices.filter(d => !d.is_compatible);

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-18">
        {/* Breadcrumb */}
        <nav className="bg-cream-100 py-3 border-b border-cream-200">
          <div className="container-wide">
            <ol className="flex items-center gap-2 text-sm text-navy-400">
              <li>
                <Link href="/" className="hover:text-brand-600 transition-colors">Home</Link>
              </li>
              <li>/</li>
              <li>
                <Link href="/compatibility" className="hover:text-brand-600 transition-colors">
                  Compatibility
                </Link>
              </li>
              <li>/</li>
              <li className="text-navy-600 font-medium">{brandData.name}</li>
            </ol>
          </div>
        </nav>

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
                {compatibleDevices.length} eSIM compatible devices
              </div>

              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-4">
                {brandData.name} eSIM Compatible Phones
              </h1>

              <p className="text-body-lg text-navy-300 max-w-2xl mx-auto">
                Find out which {brandData.name} phones support eSIM for seamless international travel connectivity.
              </p>
            </div>
          </div>
        </section>

        {/* Settings Path Info */}
        {brandData.settings_path && (
          <section className="py-8 bg-white border-b border-cream-200">
            <div className="container-wide">
              <div className="max-w-3xl mx-auto bg-brand-50 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-navy-500 mb-2">
                  How to add eSIM on {brandData.name}
                </h2>
                <p className="text-navy-400">
                  <code className="bg-brand-100 px-2 py-1 rounded text-brand-700">
                    {brandData.settings_path}
                  </code>
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Compatible Devices */}
        <section className="py-12 bg-white">
          <div className="container-wide">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-heading-lg font-bold text-navy-500 mb-6 flex items-center gap-3">
                <Check className="w-6 h-6 text-success-500" />
                eSIM Compatible ({compatibleDevices.length})
              </h2>

              {compatibleDevices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {compatibleDevices.map((device) => (
                    <Link
                      key={device.id}
                      href={`/compatibility/${brand}/${device.slug}`}
                      className="flex items-center gap-4 p-4 bg-success-50 rounded-xl border border-success-200 hover:border-success-300 hover:shadow-md transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-success-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy-500 truncate">
                          {device.model_name}
                        </p>
                        {device.release_year && (
                          <p className="text-sm text-navy-400">{device.release_year}</p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-navy-300 group-hover:text-brand-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-navy-400">No compatible devices found for this brand.</p>
              )}
            </div>
          </div>
        </section>

        {/* Incompatible Devices */}
        {incompatibleDevices.length > 0 && (
          <section className="py-12 bg-cream-50">
            <div className="container-wide">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-heading-lg font-bold text-navy-500 mb-6 flex items-center gap-3">
                  <X className="w-6 h-6 text-red-500" />
                  Not eSIM Compatible ({incompatibleDevices.length})
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {incompatibleDevices.map((device) => (
                    <Link
                      key={device.id}
                      href={`/compatibility/${brand}/${device.slug}`}
                      className="flex items-center gap-4 p-4 bg-white rounded-xl border border-cream-200 hover:border-red-200 hover:shadow-md transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <X className="w-5 h-5 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy-500 truncate">
                          {device.model_name}
                        </p>
                        {device.release_year && (
                          <p className="text-sm text-navy-400">{device.release_year}</p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-navy-300 group-hover:text-brand-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Other Brands */}
        {otherBrands.length > 0 && (
          <section className="py-12 bg-white">
            <div className="container-wide">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-heading-lg font-bold text-navy-500 mb-6">
                  Other Brands
                </h2>
                <div className="flex flex-wrap gap-3">
                  {otherBrands.map((otherBrand) => (
                    <Link
                      key={otherBrand.slug}
                      href={`/compatibility/${otherBrand.slug}`}
                      className="px-5 py-3 bg-cream-100 hover:bg-brand-100 rounded-xl border border-cream-200 hover:border-brand-300 text-navy-500 font-medium transition-all"
                    >
                      {otherBrand.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-navy-500 via-navy-500 to-navy-400 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent-400/10 blur-3xl" />

          <div className="container-wide relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-heading-xl font-bold text-cream-50 mb-4">
                Your {brandData.name} is eSIM Ready?
              </h2>
              <p className="text-cream-300 text-lg mb-8">
                Get your travel eSIM now and stay connected in 100+ destinations.
              </p>
              <Link
                href="/destinations"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-500/25 transition-all"
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

// Generate static params for all brands
export async function generateStaticParams() {
  try {
    const brands = await withRetry(() =>
      prisma.deviceBrand.findMany({
        select: { slug: true },
      })
    );

    const locales = ['en-au', 'en-sg', 'en-gb', 'en-us', 'ms-my', 'id-id'];
    const params: { locale: string; brand: string }[] = [];

    for (const brand of brands) {
      for (const locale of locales) {
        params.push({
          locale,
          brand: brand.slug,
        });
      }
    }

    return params;
  } catch (error) {
    console.log('generateStaticParams: Database unavailable, using dynamic rendering');
    return [];
  }
}
