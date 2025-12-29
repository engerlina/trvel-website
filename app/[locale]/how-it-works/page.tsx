import { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Header, Footer } from '@/components/layout';
import { Link } from '@/i18n/routing';
import { EsimChecker } from '@/components/compatibility/EsimChecker';
import {
  Smartphone,
  QrCode,
  Wifi,
  CheckCircle,
  ArrowRight,
  Shield,
  Zap,
  Clock,
  Download,
  Settings,
  Globe,
} from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

interface HowItWorksPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: HowItWorksPageProps): Promise<Metadata> {
  const { locale } = await params;

  const title = 'How It Works | Trvel eSIM';
  const description = 'Learn how to get connected with Trvel eSIM in 3 simple steps. Purchase, install, and activate your eSIM before you travel.';

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/how-it-works`,
      languages: {
        'x-default': `${BASE_URL}/en-au/how-it-works`,
        'en-AU': `${BASE_URL}/en-au/how-it-works`,
        'en-SG': `${BASE_URL}/en-sg/how-it-works`,
        'en-GB': `${BASE_URL}/en-gb/how-it-works`,
        'en-US': `${BASE_URL}/en-us/how-it-works`,
        'ms-MY': `${BASE_URL}/ms-my/how-it-works`,
        'id-ID': `${BASE_URL}/id-id/how-it-works`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/how-it-works`,
      type: 'website',
    },
  };
}

const steps = [
  {
    number: '1',
    icon: Smartphone,
    title: 'Check Compatibility',
    description: 'Make sure your phone supports eSIM. Most phones from 2019 onwards do, including iPhone XS and newer, Samsung Galaxy S20 and newer, and Google Pixel 3 and newer.',
    details: [
      'Go to Settings > General > About on iPhone',
      'Look for "EID" or "Digital SIM" option',
      'Your phone must be unlocked from any carrier',
    ],
  },
  {
    number: '2',
    icon: QrCode,
    title: 'Purchase & Receive QR Code',
    description: 'Select your destination and plan. After payment, you\'ll receive your eSIM QR code instantly via email. You can also find it in your account.',
    details: [
      'Choose your destination country',
      'Select 5, 7, or 15-day plan',
      'QR code delivered to your email in seconds',
    ],
  },
  {
    number: '3',
    icon: Download,
    title: 'Install Before You Travel',
    description: 'Scan the QR code to install your eSIM while connected to WiFi. We recommend doing this at home or your hotel before departing.',
    details: [
      'Go to Settings > Mobile/Cellular > Add eSIM',
      'Scan the QR code from your email',
      'Label it with your destination (e.g., "Japan Trip")',
    ],
  },
  {
    number: '4',
    icon: Wifi,
    title: 'Activate on Arrival',
    description: 'When you land, simply turn on your eSIM data. Your connection activates automatically when you first use data in your destination country.',
    details: [
      'Turn off your home carrier data roaming',
      'Enable your travel eSIM line for data',
      'Connected within seconds of landing',
    ],
  },
];

const faqs = [
  {
    question: 'Will my phone number still work?',
    answer: 'Yes! Your regular phone number stays active for calls and SMS. The eSIM is only used for data. Keep your home SIM active for calls or use apps like WhatsApp to call over data.',
  },
  {
    question: 'Can I install the eSIM before my trip?',
    answer: 'Absolutely! We recommend installing your eSIM before you leave. You can install it days or weeks ahead—it only activates when you first use data in your destination.',
  },
  {
    question: 'What if I have trouble connecting?',
    answer: 'Our support team is available via live chat and phone to help you get connected. If we can\'t get you online within 10 minutes, you\'ll receive a full refund.',
  },
  {
    question: 'Can I top up if I need more days?',
    answer: 'Yes, you can purchase additional plans anytime. Simply buy a new eSIM and install it before your current plan expires.',
  },
];

export default async function HowItWorksPage({ params }: HowItWorksPageProps) {
  const { locale } = await params;

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-18">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-cream-200 via-cream-100 to-white py-16 md:py-24">
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
                <Zap className="w-4 h-4" />
                Setup in under 5 minutes
              </div>

              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-4">
                How It Works
              </h1>

              <p className="text-body-lg text-navy-300 max-w-2xl mx-auto mb-8">
                Get connected abroad in 4 simple steps. No physical SIM cards, no store visits,
                no waiting in line. Just instant mobile data wherever you travel.
              </p>

              <div className="flex flex-wrap justify-center gap-6">
                <div className="flex items-center gap-2 text-navy-400">
                  <Clock className="w-5 h-5 text-brand-500" />
                  <span className="font-medium">2-minute setup</span>
                </div>
                <div className="flex items-center gap-2 text-navy-400">
                  <Shield className="w-5 h-5 text-success-500" />
                  <span className="font-medium">10-min guarantee</span>
                </div>
                <div className="flex items-center gap-2 text-navy-400">
                  <Globe className="w-5 h-5 text-accent-500" />
                  <span className="font-medium">Works in 190+ countries</span>
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* Steps Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-wide">
            <div className="max-w-4xl mx-auto">
              {steps.map((step, index) => (
                <div key={step.number} className="relative">
                  {/* Connector line */}
                  {index < steps.length - 1 && (
                    <div className="absolute left-8 top-20 bottom-0 w-0.5 bg-cream-300 hidden md:block" />
                  )}

                  <div className="flex gap-6 md:gap-8 mb-12 md:mb-16">
                    {/* Step number */}
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-brand-500/25">
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <step.icon className="w-6 h-6 text-brand-600" />
                        <h2 className="text-heading-lg font-bold text-navy-500">
                          {step.title}
                        </h2>
                      </div>

                      <p className="text-body-lg text-navy-400 mb-4">
                        {step.description}
                      </p>

                      <ul className="space-y-2">
                        {step.details.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                            <span className="text-navy-400">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Compatibility Section */}
        <section className="py-16 bg-cream-50">
          <div className="container-wide">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-heading-xl md:text-display font-bold text-navy-500 mb-4">
                  Check Your Device
                </h2>
                <p className="text-body-lg text-navy-400 max-w-2xl mx-auto">
                  Find out if your phone supports eSIM in seconds.
                </p>
              </div>

              <EsimChecker />
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-heading-xl md:text-display font-bold text-navy-500 mb-4">
                  Common Questions
                </h2>
              </div>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-cream-50 rounded-2xl p-6 border border-cream-200">
                    <h3 className="text-lg font-semibold text-navy-500 mb-2">
                      {faq.question}
                    </h3>
                    <p className="text-navy-400">
                      {faq.answer}
                    </p>
                  </div>
                ))}
              </div>

              <div className="text-center mt-8">
                <Link
                  href="/help"
                  className="inline-flex items-center gap-2 text-brand-600 font-medium hover:text-brand-700"
                >
                  View all FAQs
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-navy-500 via-navy-500 to-navy-400 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-brand-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-accent-400/10 blur-3xl" />

          <div className="container-wide relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-heading-xl md:text-display font-bold text-cream-50 mb-4">
                Ready to get connected?
              </h2>
              <p className="text-cream-300 text-lg mb-8">
                Choose your destination and get your eSIM delivered instantly.
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
