import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { Link } from '@/i18n/routing';
import {
  HelpCircle,
  MessageCircle,
  Mail,
  Phone,
  ChevronDown,
  Smartphone,
  CreditCard,
  Wifi,
  Settings,
  RefreshCw,
  Shield,
  Clock,
  ArrowRight,
} from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

interface HelpPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: HelpPageProps): Promise<Metadata> {
  const { locale } = await params;

  const title = 'Help Centre | Trvel eSIM';
  const description = 'Get help with your Trvel eSIM. Find answers to frequently asked questions about eSIM compatibility, installation, activation, and troubleshooting.';

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/help`,
      languages: {
        'x-default': `${BASE_URL}/en-au/help`,
        'en-AU': `${BASE_URL}/en-au/help`,
        'en-SG': `${BASE_URL}/en-sg/help`,
        'en-GB': `${BASE_URL}/en-gb/help`,
        'en-US': `${BASE_URL}/en-us/help`,
        'ms-MY': `${BASE_URL}/ms-my/help`,
        'id-ID': `${BASE_URL}/id-id/help`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/help`,
      type: 'website',
    },
  };
}

const faqCategories = [
  {
    id: 'getting-started',
    icon: Smartphone,
    title: 'Getting Started',
    faqs: [
      {
        question: 'What is an eSIM?',
        answer: 'An eSIM (embedded SIM) is a digital SIM that allows you to activate a mobile plan without using a physical SIM card. It\'s built into your phone and can be programmed with different carrier profiles. This means you can add a travel data plan without removing your home SIM.',
      },
      {
        question: 'Is my phone compatible with eSIM?',
        answer: 'Most phones manufactured from 2019 onwards support eSIM. This includes iPhone XS and newer, Samsung Galaxy S20 and newer, Google Pixel 3 and newer, and many other devices. Your phone must also be carrier-unlocked. You can check by going to Settings > General > About on iPhone, or Settings > Connections > SIM card manager on Samsung.',
      },
      {
        question: 'Can I use eSIM with a physical SIM at the same time?',
        answer: 'Yes! Most eSIM-compatible phones support Dual SIM functionality. This means you can keep your regular physical SIM for calls and SMS while using the eSIM for data abroad. Your phone number stays active, and you avoid expensive roaming charges.',
      },
      {
        question: 'When should I install my eSIM?',
        answer: 'We recommend installing your eSIM before you leave for your trip, while you still have WiFi access. You can install it days or even weeks before travel—it won\'t activate until you first use data in your destination country.',
      },
    ],
  },
  {
    id: 'purchase',
    icon: CreditCard,
    title: 'Purchase & Payment',
    faqs: [
      {
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit and debit cards (Visa, Mastercard, American Express), as well as Apple Pay and Google Pay. All payments are processed securely through Stripe.',
      },
      {
        question: 'How do I receive my eSIM?',
        answer: 'After purchase, you\'ll receive your eSIM QR code instantly via email. The email contains your unique QR code and step-by-step installation instructions. You can also access your eSIM anytime through your order confirmation.',
      },
      {
        question: 'Can I get a refund?',
        answer: 'Yes. If you haven\'t installed/scanned your eSIM QR code, you can request a full refund within 30 days of purchase. Once an eSIM is installed, it cannot be refunded as the QR code becomes single-use. We also offer our 10-minute connection guarantee—if we can\'t get you connected within 10 minutes of reaching out to support, you\'ll receive a full refund.',
      },
      {
        question: 'Are there any hidden fees?',
        answer: 'No. The price you see is the price you pay. There are no activation fees, no hidden charges, and no auto-renewal. You get exactly what you purchase—a set number of days with unlimited data.',
      },
    ],
  },
  {
    id: 'installation',
    icon: Settings,
    title: 'Installation & Setup',
    faqs: [
      {
        question: 'How do I install my eSIM?',
        answer: 'Open your phone\'s Settings, navigate to Mobile/Cellular settings, select "Add eSIM" or "Add Cellular Plan", then scan the QR code from your email. Follow the on-screen prompts to complete installation. We recommend labelling your eSIM with your destination (e.g., "Japan Trip") for easy identification.',
      },
      {
        question: 'Can I install the eSIM without WiFi?',
        answer: 'You need an internet connection to install your eSIM. This can be WiFi or mobile data from your existing plan. We recommend installing while on WiFi before your trip to ensure a smooth setup.',
      },
      {
        question: 'What do I do after installation?',
        answer: 'After installation, your eSIM is ready but not yet active. When you arrive at your destination, go to Settings, turn on data for your travel eSIM line, and turn off data roaming on your home line. The eSIM activates automatically when you first use data.',
      },
      {
        question: 'Can I delete and reinstall my eSIM?',
        answer: 'eSIM QR codes are single-use for security reasons. Once you\'ve scanned and installed your eSIM, the QR code cannot be used again. If you accidentally delete your eSIM before using it, please contact our support team for assistance.',
      },
    ],
  },
  {
    id: 'usage',
    icon: Wifi,
    title: 'Using Your eSIM',
    faqs: [
      {
        question: 'When does my eSIM plan start?',
        answer: 'Your plan starts when you first use data in your destination country. The countdown begins from your first data connection, not from purchase or installation. This means you can buy and install well in advance of your trip.',
      },
      {
        question: 'How much data do I get?',
        answer: 'All our plans include unlimited data. You get 1GB of high-speed data (5G where available) per day, then unlimited data at 1.25 Mbps. This is enough for messaging, maps, social media, music streaming, and general browsing even after the high-speed allowance.',
      },
      {
        question: 'Can I make calls and send SMS with the eSIM?',
        answer: 'Our eSIM plans are data-only. For calls and SMS, keep your home SIM active or use apps like WhatsApp, FaceTime, or Skype over data. Most travellers find this works perfectly for staying in touch.',
      },
      {
        question: 'Can I use my eSIM in multiple countries?',
        answer: 'Our eSIM plans are country-specific. If you\'re visiting multiple countries, you\'ll need a separate eSIM for each destination. However, you can install multiple eSIMs on your phone and switch between them as you travel.',
      },
    ],
  },
  {
    id: 'troubleshooting',
    icon: RefreshCw,
    title: 'Troubleshooting',
    faqs: [
      {
        question: 'My eSIM isn\'t connecting. What should I do?',
        answer: 'First, make sure data is enabled for your travel eSIM line and data roaming is turned on (Settings > Cellular > your eSIM line > Data Roaming). Try toggling airplane mode on and off. If it still doesn\'t work, try restarting your phone. If problems persist, contact our support team via live chat or phone.',
      },
      {
        question: 'The QR code won\'t scan. What should I do?',
        answer: 'Make sure you\'re scanning the QR code with your phone\'s camera through the eSIM setup screen (not a regular QR scanner app). Ensure good lighting and that the QR code is displayed clearly. You can also try entering the activation details manually—these are provided in your confirmation email.',
      },
      {
        question: 'I deleted my eSIM by accident. Can I reinstall it?',
        answer: 'eSIM QR codes are single-use. If you deleted your eSIM before using it, please contact our support team immediately. We\'ll verify your purchase and issue a replacement.',
      },
      {
        question: 'My internet is slow. Is something wrong?',
        answer: 'If you\'ve used your daily 1GB high-speed allowance, speeds are reduced to 1.25 Mbps for the remainder of the day (resets every 24 hours from first use). This is still sufficient for messaging, maps, and basic browsing. If speeds seem unusually slow, try moving to an area with better coverage or contact support.',
      },
    ],
  },
];

export default async function HelpPage({ params }: HelpPageProps) {
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
                <HelpCircle className="w-4 h-4" />
                Help Centre
              </div>

              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-4">
                How can we help?
              </h1>

              <p className="text-body-lg text-navy-300 max-w-2xl mx-auto mb-8">
                Find answers to common questions or reach out to our support team.
                We&apos;re here to help you stay connected.
              </p>

              {/* Contact Options */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+61340527555"
                  className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  Call +61 3 4052 7555
                </a>
                <a
                  href="mailto:support@trvel.co"
                  className="inline-flex items-center justify-center gap-3 px-6 py-4 bg-white text-navy-500 font-semibold rounded-xl border border-cream-300 hover:border-brand-300 transition-colors"
                >
                  <Mail className="w-5 h-5" />
                  Email Support
                </a>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* Quick Links */}
        <section className="py-12 bg-white border-b border-cream-200">
          <div className="container-wide">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {faqCategories.map((category) => (
                <a
                  key={category.id}
                  href={`#${category.id}`}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-cream-50 transition-colors text-center"
                >
                  <category.icon className="w-6 h-6 text-brand-600" />
                  <span className="text-sm font-medium text-navy-500">{category.title}</span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        {faqCategories.map((category) => (
          <section key={category.id} id={category.id} className="py-12 bg-white scroll-mt-20">
            <div className="container-wide">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
                    <category.icon className="w-6 h-6 text-brand-600" />
                  </div>
                  <h2 className="text-heading-xl font-bold text-navy-500">
                    {category.title}
                  </h2>
                </div>

                <div className="space-y-4">
                  {category.faqs.map((faq, index) => (
                    <details
                      key={index}
                      className="group bg-cream-50 rounded-2xl border border-cream-200 overflow-hidden"
                    >
                      <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none">
                        <h3 className="text-lg font-semibold text-navy-500 text-left">
                          {faq.question}
                        </h3>
                        <ChevronDown className="w-5 h-5 text-navy-400 flex-shrink-0 transition-transform group-open:rotate-180" />
                      </summary>
                      <div className="px-6 pb-6 pt-0">
                        <p className="text-navy-400 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            </div>
          </section>
        ))}

        {/* Still Need Help Section */}
        <section className="py-16 bg-cream-50">
          <div className="container-wide">
            <div className="max-w-2xl mx-auto text-center">
              <Shield className="w-12 h-12 text-brand-600 mx-auto mb-4" />
              <h2 className="text-heading-xl font-bold text-navy-500 mb-4">
                Still need help?
              </h2>
              <p className="text-navy-400 mb-6">
                Our support team is available to help you get connected.
                We offer a 10-minute connection guarantee—if we can&apos;t get you online,
                you&apos;ll receive a full refund.
              </p>
              <div className="flex items-center justify-center gap-2 text-navy-300 mb-8">
                <Clock className="w-5 h-5" />
                <span>Typical response time: under 5 minutes</span>
              </div>
              <a
                href="tel:+61340527555"
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-500 text-white font-semibold rounded-xl hover:bg-brand-600 transition-colors"
              >
                <Phone className="w-5 h-5" />
                Call +61 3 4052 7555
              </a>
            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-12 bg-white border-t border-cream-200">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-lg font-semibold text-navy-500 mb-6 text-center">
                Helpful Resources
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                <Link
                  href="/how-it-works"
                  className="flex items-center justify-between p-4 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors"
                >
                  <span className="font-medium text-navy-500">How It Works</span>
                  <ArrowRight className="w-4 h-4 text-brand-600" />
                </Link>
                <Link
                  href="/terms"
                  className="flex items-center justify-between p-4 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors"
                >
                  <span className="font-medium text-navy-500">Terms of Service</span>
                  <ArrowRight className="w-4 h-4 text-brand-600" />
                </Link>
                <Link
                  href="/fair-use"
                  className="flex items-center justify-between p-4 bg-cream-50 rounded-xl hover:bg-cream-100 transition-colors"
                >
                  <span className="font-medium text-navy-500">Fair Use Policy</span>
                  <ArrowRight className="w-4 h-4 text-brand-600" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
