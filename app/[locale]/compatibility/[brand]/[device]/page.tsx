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
  Calendar,
  Settings,
  Info,
  ExternalLink,
  ChevronRight,
  Wifi,
  Globe,
  Zap,
} from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

interface DevicePageProps {
  params: Promise<{
    locale: string;
    brand: string;
    device: string;
  }>;
}

export async function generateMetadata({ params }: DevicePageProps): Promise<Metadata> {
  const { locale, brand, device } = await params;

  const deviceData = await withRetry(() =>
    prisma.device.findFirst({
      where: {
        slug: device,
        brand: { slug: brand },
      },
      include: { brand: true },
    })
  );

  if (!deviceData) {
    return { title: 'Device Not Found' };
  }

  const compatStatus = deviceData.is_compatible ? 'Yes' : 'No';
  const title = `${deviceData.model_name} eSIM Compatible? ${compatStatus} | Trvel`;
  const description = deviceData.is_compatible
    ? `${deviceData.model_name} supports eSIM. Get a travel eSIM for your ${deviceData.brand.name} phone and stay connected in 100+ countries.`
    : `${deviceData.model_name} does not support eSIM. ${deviceData.notes || 'Consider upgrading to a newer model for eSIM support.'}`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/compatibility/${brand}/${device}`,
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/compatibility/${brand}/${device}`,
      type: 'website',
    },
  };
}

export default async function DevicePage({ params }: DevicePageProps) {
  const { locale, brand, device } = await params;

  const deviceData = await withRetry(() =>
    prisma.device.findFirst({
      where: {
        slug: device,
        brand: { slug: brand },
      },
      include: { brand: true },
    })
  );

  if (!deviceData) {
    notFound();
  }

  // Get other devices from same brand for cross-linking
  const relatedDevices = await withRetry(() =>
    prisma.device.findMany({
      where: {
        brand: { slug: brand },
        slug: { not: device },
        is_compatible: true,
      },
      orderBy: [
        { release_year: 'desc' },
        { sort_order: 'asc' },
      ],
      take: 6,
    })
  );

  // Get some popular destinations for CTA
  const destinations = await withRetry(() =>
    prisma.destination.findMany({
      where: { locale },
      take: 4,
      orderBy: { name: 'asc' },
    })
  );

  const setupSteps = deviceData.brand.name === 'Apple'
    ? [
        'Open Settings',
        'Tap Cellular or Mobile Data',
        'Tap Add eSIM or Add Cellular Plan',
        'Scan the QR code from your email',
        'Follow the prompts to activate',
      ]
    : deviceData.brand.name === 'Samsung'
    ? [
        'Open Settings',
        'Tap Connections > SIM manager',
        'Tap Add eSIM',
        'Tap Scan QR code from service provider',
        'Scan the QR code from your email',
      ]
    : deviceData.brand.name === 'Google'
    ? [
        'Open Settings',
        'Tap Network & internet > SIMs',
        'Tap Add or + next to SIMs',
        'Tap Download a SIM instead?',
        'Scan the QR code from your email',
      ]
    : [
        'Open Settings',
        'Navigate to SIM or Network settings',
        'Select Add eSIM option',
        'Scan the QR code from your email',
        'Follow the prompts to activate',
      ];

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-18">
        {/* Breadcrumb */}
        <nav className="bg-cream-100 py-3 border-b border-cream-200">
          <div className="container-wide">
            <ol className="flex items-center gap-2 text-sm text-navy-400 flex-wrap">
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
              <li>
                <Link href={`/compatibility/${brand}`} className="hover:text-brand-600 transition-colors">
                  {deviceData.brand.name}
                </Link>
              </li>
              <li>/</li>
              <li className="text-navy-600 font-medium">{deviceData.model_name}</li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-cream-200 via-cream-100 to-white py-12 md:py-20">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99 191 191 / 0.2) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />

          <div className="container-wide relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              {/* Status Badge */}
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-6 ${
                deviceData.is_compatible
                  ? 'bg-success-100 text-success-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {deviceData.is_compatible ? (
                  <>
                    <Check className="w-4 h-4" />
                    eSIM Compatible
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4" />
                    Not eSIM Compatible
                  </>
                )}
              </div>

              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-4">
                {deviceData.model_name}
              </h1>

              <p className="text-body-lg text-navy-300 max-w-2xl mx-auto mb-6">
                {deviceData.is_compatible
                  ? `Great news! Your ${deviceData.model_name} supports eSIM technology for seamless travel connectivity.`
                  : `Unfortunately, the ${deviceData.model_name} does not support eSIM technology.`
                }
              </p>

              {/* Quick Stats */}
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-soft">
                  <Smartphone className="w-4 h-4 text-brand-500" />
                  <span className="text-sm font-medium text-navy-500">{deviceData.brand.name}</span>
                </div>
                {deviceData.release_year && (
                  <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-soft">
                    <Calendar className="w-4 h-4 text-accent-500" />
                    <span className="text-sm font-medium text-navy-500">{deviceData.release_year}</span>
                  </div>
                )}
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl shadow-soft ${
                  deviceData.is_compatible ? 'bg-success-50' : 'bg-red-50'
                }`}>
                  {deviceData.is_compatible ? (
                    <Check className="w-4 h-4 text-success-600" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                  <span className={`text-sm font-medium ${
                    deviceData.is_compatible ? 'text-success-700' : 'text-red-700'
                  }`}>
                    {deviceData.is_compatible ? 'eSIM Ready' : 'No eSIM'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Device Notes */}
        {deviceData.notes && (
          <section className="py-8 bg-white border-b border-cream-200">
            <div className="container-wide">
              <div className="max-w-3xl mx-auto bg-amber-50 rounded-xl p-6 border border-amber-200">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h2 className="text-lg font-semibold text-navy-500 mb-2">
                      Important Note
                    </h2>
                    <p className="text-navy-400">
                      {deviceData.notes}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Setup Instructions (only for compatible devices) */}
        {deviceData.is_compatible && (
          <section className="py-12 bg-white">
            <div className="container-wide">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-heading-lg font-bold text-navy-500 mb-6 flex items-center gap-3">
                  <Settings className="w-6 h-6 text-brand-500" />
                  How to Add eSIM on {deviceData.model_name}
                </h2>

                <div className="space-y-4">
                  {setupSteps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-4 p-4 bg-cream-50 rounded-xl"
                    >
                      <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-navy-500 font-medium pt-1">{step}</p>
                    </div>
                  ))}
                </div>

                {deviceData.brand.settings_path && (
                  <div className="mt-6 p-4 bg-brand-50 rounded-xl">
                    <p className="text-sm text-navy-400">
                      <span className="font-medium">Quick path: </span>
                      <code className="bg-brand-100 px-2 py-1 rounded text-brand-700">
                        {deviceData.brand.settings_path}
                      </code>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Benefits (for compatible) or Alternatives (for incompatible) */}
        {deviceData.is_compatible ? (
          <section className="py-12 bg-cream-50">
            <div className="container-wide">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-heading-lg font-bold text-navy-500 mb-6">
                  eSIM Benefits for {deviceData.model_name}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { icon: Wifi, title: 'Unlimited Data', description: 'No throttling or data caps while traveling' },
                    { icon: Zap, title: 'Instant Setup', description: 'Scan QR code and connect in 2 minutes' },
                    { icon: Globe, title: '100+ Countries', description: 'One eSIM works in multiple destinations' },
                  ].map((benefit, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-xl p-6 border border-cream-200"
                    >
                      <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center mb-4">
                        <benefit.icon className="w-5 h-5 text-brand-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-navy-500 mb-2">{benefit.title}</h3>
                      <p className="text-navy-400 text-sm">{benefit.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="py-12 bg-cream-50">
            <div className="container-wide">
              <div className="max-w-3xl mx-auto">
                <h2 className="text-heading-lg font-bold text-navy-500 mb-6">
                  Alternatives for Your Device
                </h2>
                <div className="bg-white rounded-xl p-6 border border-cream-200">
                  <ul className="space-y-3 text-navy-400">
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                      <span>Purchase a local SIM card at your destination airport</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                      <span>Use pocket WiFi rental services</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                      <span>Consider upgrading to an eSIM-compatible device</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Related Devices */}
        {relatedDevices.length > 0 && (
          <section className="py-12 bg-white">
            <div className="container-wide">
              <div className="max-w-4xl mx-auto">
                <h2 className="text-heading-lg font-bold text-navy-500 mb-6">
                  Other {deviceData.brand.name} eSIM Devices
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedDevices.map((relatedDevice) => (
                    <Link
                      key={relatedDevice.id}
                      href={`/compatibility/${brand}/${relatedDevice.slug}`}
                      className="flex items-center gap-4 p-4 bg-cream-50 rounded-xl border border-cream-200 hover:border-brand-300 hover:shadow-md transition-all group"
                    >
                      <div className="w-10 h-10 rounded-full bg-success-100 flex items-center justify-center flex-shrink-0">
                        <Check className="w-5 h-5 text-success-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-navy-500 truncate">
                          {relatedDevice.model_name}
                        </p>
                        {relatedDevice.release_year && (
                          <p className="text-sm text-navy-400">{relatedDevice.release_year}</p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-navy-300 group-hover:text-brand-500 transition-colors" />
                    </Link>
                  ))}
                </div>
                <div className="text-center mt-6">
                  <Link
                    href={`/compatibility/${brand}`}
                    className="text-brand-600 hover:text-brand-700 font-medium inline-flex items-center gap-1"
                  >
                    View all {deviceData.brand.name} devices
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        {deviceData.is_compatible && destinations.length > 0 && (
          <section className="py-16 bg-gradient-to-br from-navy-500 via-navy-500 to-navy-400 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-400/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent-400/10 blur-3xl" />

            <div className="container-wide relative z-10">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="text-heading-xl font-bold text-cream-50 mb-4">
                  Get an eSIM for Your {deviceData.model_name}
                </h2>
                <p className="text-cream-300 text-lg mb-8">
                  Stay connected in 100+ destinations with unlimited data.
                </p>

                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {destinations.map((dest) => (
                    <Link
                      key={dest.slug}
                      href={`/${dest.slug}`}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-cream-100 text-sm font-medium transition-colors"
                    >
                      {dest.name}
                    </Link>
                  ))}
                </div>

                <Link
                  href="/destinations"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-accent-500/25 transition-all"
                >
                  Browse All Destinations
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}

// Generate static params for all brand/device combinations
export async function generateStaticParams() {
  try {
    const devices = await withRetry(() =>
      prisma.device.findMany({
        select: { slug: true, brand: { select: { slug: true } } },
      })
    );

    const locales = ['en-au', 'en-sg', 'en-gb', 'en-us', 'ms-my', 'id-id'];
    const params: { locale: string; brand: string; device: string }[] = [];

    for (const device of devices) {
      for (const locale of locales) {
        params.push({
          locale,
          brand: device.brand.slug,
          device: device.slug,
        });
      }
    }

    return params;
  } catch (error) {
    console.log('generateStaticParams: Database unavailable, using dynamic rendering');
    return [];
  }
}
