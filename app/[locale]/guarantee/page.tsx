import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { Link } from '@/i18n/routing';
import {
  Shield,
  Clock,
  RefreshCw,
  CheckCircle,
  ArrowRight,
  Phone,
  MessageCircle,
  Mail,
  Heart,
  Zap,
  Award,
  Users,
  ThumbsUp,
} from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';

interface GuaranteePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: GuaranteePageProps): Promise<Metadata> {
  const { locale } = await params;

  const title = 'Money-Back Guarantee | Trvel eSIM';
  const description = 'Trvel eSIM offers a no-questions-asked money-back guarantee and 10-minute connection guarantee. If we can\'t get you connected, you get a full refund.';

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/guarantee`,
      languages: {
        'x-default': `${BASE_URL}/en-au/guarantee`,
        'en-AU': `${BASE_URL}/en-au/guarantee`,
        'en-SG': `${BASE_URL}/en-sg/guarantee`,
        'en-GB': `${BASE_URL}/en-gb/guarantee`,
        'en-US': `${BASE_URL}/en-us/guarantee`,
        'ms-MY': `${BASE_URL}/ms-my/guarantee`,
        'id-ID': `${BASE_URL}/id-id/guarantee`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/guarantee`,
      type: 'website',
    },
  };
}

const guarantees = [
  {
    icon: RefreshCw,
    title: '30-Day Money-Back Guarantee',
    description: 'Haven\'t installed your eSIM yet? Get a full refund within 30 days of purchase. No questions asked, no hassle.',
    details: [
      'Full refund if eSIM QR code hasn\'t been scanned',
      'Refund processed within 3-5 business days',
      'No hidden fees or deductions',
      'Simply contact our support team',
    ],
  },
  {
    icon: Clock,
    title: '10-Minute Connection Guarantee',
    description: 'If our support team can\'t get you connected within 10 minutes of reaching out, you\'ll receive a complete refund.',
    details: [
      'Contact us via phone, email, or live chat',
      'Our team will troubleshoot with you',
      'If we can\'t solve it in 10 minutes, you\'re refunded',
      'This applies even after eSIM installation',
    ],
  },
  {
    icon: Shield,
    title: 'Quality Network Guarantee',
    description: 'We partner with the best local carriers in every country to ensure you get reliable, fast coverage wherever you travel.',
    details: [
      'Premium carrier partnerships (NTT Docomo, AIS, Telkomsel)',
      '4G/5G speeds where available',
      'Coverage verified before we offer a destination',
      'If coverage doesn\'t match our promise, we make it right',
    ],
  },
];

const faqs = [
  {
    question: 'How do I request a refund?',
    answer: 'Simply contact our support team via phone (+61 3 4052 7555), email (support@trvel.co), or live chat. Provide your order number and we\'ll process your refund within 3-5 business days.',
  },
  {
    question: 'What if I\'ve already installed my eSIM?',
    answer: 'Once an eSIM QR code is scanned and installed, it becomes single-use and cannot be transferred. However, our 10-minute connection guarantee still applies—if we can\'t get you connected within 10 minutes of contacting support, you\'ll receive a full refund.',
  },
  {
    question: 'Is there a time limit on the 10-minute guarantee?',
    answer: 'No. Whether you contact us on day 1 or day 14 of your plan, if we can\'t resolve your connection issue within 10 minutes, you\'re entitled to a full refund.',
  },
  {
    question: 'What counts as "connected"?',
    answer: 'Connected means your device is successfully using mobile data through your Trvel eSIM. You should be able to browse the web, use apps, and access the internet at the speeds described in your plan.',
  },
  {
    question: 'Do you offer partial refunds?',
    answer: 'For unused eSIMs, we offer full refunds. For connection issues partway through your plan, we\'ll assess on a case-by-case basis and ensure you\'re treated fairly. We\'re Australian—we believe in doing the right thing.',
  },
];

export default async function GuaranteePage({ params }: GuaranteePageProps) {
  const { locale } = await params;

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-18">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-success-50 via-cream-50 to-white py-16 md:py-24">
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgb(34 197 94 / 0.15) 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />

          <div className="container-wide relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-success-100 rounded-full mb-6">
                <Shield className="w-10 h-10 text-success-600" />
              </div>

              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-4">
                Our Promise to You
              </h1>

              <p className="text-body-lg text-navy-300 max-w-2xl mx-auto mb-8">
                We stand behind every eSIM we sell. If you&apos;re not completely satisfied,
                we&apos;ll make it right—no questions asked.
              </p>

              {/* Key Promise */}
              <div className="inline-flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-soft border border-success-200">
                <CheckCircle className="w-6 h-6 text-success-500" />
                <span className="text-lg font-semibold text-navy-500">
                  100% Money-Back Guarantee
                </span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent" />
        </section>

        {/* Trust Stats */}
        <section className="py-12 bg-white border-b border-cream-200">
          <div className="container-wide">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Users className="w-6 h-6 text-brand-500" />
                </div>
                <p className="text-heading-lg font-bold text-navy-500">50,000+</p>
                <p className="text-sm text-navy-400">Happy Customers</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <ThumbsUp className="w-6 h-6 text-brand-500" />
                </div>
                <p className="text-heading-lg font-bold text-navy-500">99.2%</p>
                <p className="text-sm text-navy-400">Satisfaction Rate</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Clock className="w-6 h-6 text-brand-500" />
                </div>
                <p className="text-heading-lg font-bold text-navy-500">&lt;3 min</p>
                <p className="text-sm text-navy-400">Avg Support Response</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Award className="w-6 h-6 text-brand-500" />
                </div>
                <p className="text-heading-lg font-bold text-navy-500">Australian</p>
                <p className="text-sm text-navy-400">Owned & Operated</p>
              </div>
            </div>
          </div>
        </section>

        {/* Guarantees Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-wide">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-heading-xl md:text-display font-bold text-navy-500 mb-4">
                  Three Guarantees. Zero Risk.
                </h2>
                <p className="text-body-lg text-navy-400 max-w-2xl mx-auto">
                  We want you to book with confidence. That&apos;s why we offer not one,
                  but three guarantees on every eSIM purchase.
                </p>
              </div>

              <div className="space-y-8">
                {guarantees.map((guarantee, index) => (
                  <div
                    key={index}
                    className="bg-cream-50 rounded-2xl border border-cream-200 p-8 md:p-10"
                  >
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-success-500 to-success-600 flex items-center justify-center shadow-lg shadow-success-500/25">
                          <guarantee.icon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-heading-lg font-bold text-navy-500 mb-2">
                          {guarantee.title}
                        </h3>
                        <p className="text-navy-400 mb-4">
                          {guarantee.description}
                        </p>
                        <ul className="space-y-2">
                          {guarantee.details.map((detail, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckCircle className="w-5 h-5 text-success-500 flex-shrink-0 mt-0.5" />
                              <span className="text-navy-500">{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Why We Offer This */}
        <section className="py-16 bg-cream-50">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10">
                <Heart className="w-12 h-12 text-accent-500 mx-auto mb-4" />
                <h2 className="text-heading-xl font-bold text-navy-500 mb-4">
                  Why We Offer This Guarantee
                </h2>
              </div>

              <div className="prose prose-lg mx-auto text-navy-400">
                <p>
                  We&apos;re travellers too. We know the stress of landing in a foreign country
                  and not being able to connect—can&apos;t call an Uber, can&apos;t find your hotel,
                  can&apos;t let your family know you landed safely.
                </p>
                <p>
                  That&apos;s why we built Trvel. And that&apos;s why we stand behind it completely.
                </p>
                <p>
                  We&apos;re an Australian company with real people answering the phones.
                  When something goes wrong (and technology being technology, sometimes it does),
                  we fix it fast. If we can&apos;t fix it, we refund it. Simple as that.
                </p>
                <p className="font-semibold text-navy-500">
                  Because at the end of the day, we want you to travel with confidence—not worry
                  about your data plan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 md:py-24 bg-white">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-heading-xl font-bold text-navy-500 mb-4">
                  Guarantee FAQs
                </h2>
              </div>

              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <details
                    key={index}
                    className="group bg-cream-50 rounded-2xl border border-cream-200 overflow-hidden"
                  >
                    <summary className="flex items-center justify-between gap-4 p-6 cursor-pointer list-none">
                      <h3 className="text-lg font-semibold text-navy-500 text-left">
                        {faq.question}
                      </h3>
                      <Zap className="w-5 h-5 text-brand-500 flex-shrink-0 transition-transform group-open:rotate-90" />
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

        {/* Contact Section */}
        <section className="py-16 bg-cream-50">
          <div className="container-wide">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-heading-xl font-bold text-navy-500 mb-4">
                Need Help? We&apos;re Here.
              </h2>
              <p className="text-navy-400 mb-8">
                Our Australian support team is available to help with refunds,
                connection issues, or any questions you have.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                <a
                  href="tel:+61340527555"
                  className="flex flex-col items-center gap-2 p-6 bg-white rounded-2xl border border-cream-200 hover:border-brand-300 transition-colors"
                >
                  <Phone className="w-6 h-6 text-brand-600" />
                  <span className="font-medium text-navy-500">Call Us</span>
                  <span className="text-sm text-navy-400">+61 3 4052 7555</span>
                </a>
                <a
                  href="mailto:support@trvel.co"
                  className="flex flex-col items-center gap-2 p-6 bg-white rounded-2xl border border-cream-200 hover:border-brand-300 transition-colors"
                >
                  <Mail className="w-6 h-6 text-brand-600" />
                  <span className="font-medium text-navy-500">Email</span>
                  <span className="text-sm text-navy-400">support@trvel.co</span>
                </a>
                <div className="flex flex-col items-center gap-2 p-6 bg-white rounded-2xl border border-cream-200">
                  <MessageCircle className="w-6 h-6 text-brand-600" />
                  <span className="font-medium text-navy-500">Live Chat</span>
                  <span className="text-sm text-navy-400">Available 24/7</span>
                </div>
              </div>

              <p className="text-sm text-navy-400">
                Average response time: under 3 minutes
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-br from-navy-500 via-navy-500 to-navy-400 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-success-400/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-brand-400/10 blur-3xl" />

          <div className="container-wide relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <Shield className="w-12 h-12 text-success-400 mx-auto mb-4" />
              <h2 className="text-heading-xl md:text-display font-bold text-cream-50 mb-4">
                Ready to Travel with Confidence?
              </h2>
              <p className="text-cream-300 text-lg mb-8">
                Get your eSIM now. If anything goes wrong, we&apos;ve got you covered.
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
