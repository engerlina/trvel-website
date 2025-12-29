import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { Link } from '@/i18n/routing';
import { Shield, ArrowRight } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';
const LAST_UPDATED = '17 December 2024';

interface PrivacyPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: PrivacyPageProps): Promise<Metadata> {
  const { locale } = await params;

  const title = 'Privacy Policy | Trvel eSIM';
  const description = 'Learn how Trvel collects, uses, and protects your personal information. Our privacy policy complies with Australian Privacy Principles and international data protection laws.';

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/privacy`,
      languages: {
        'x-default': `${BASE_URL}/en-au/privacy`,
        'en-AU': `${BASE_URL}/en-au/privacy`,
        'en-SG': `${BASE_URL}/en-sg/privacy`,
        'en-GB': `${BASE_URL}/en-gb/privacy`,
        'en-US': `${BASE_URL}/en-us/privacy`,
        'ms-MY': `${BASE_URL}/ms-my/privacy`,
        'id-ID': `${BASE_URL}/id-id/privacy`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/privacy`,
      type: 'website',
    },
  };
}

export default async function PrivacyPage({ params }: PrivacyPageProps) {
  const { locale } = await params;

  return (
    <>
      <Header />
      <main className="pt-16 md:pt-18">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-cream-200 via-cream-100 to-white py-12 md:py-16">
          <div className="container-wide relative z-10">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-100 text-brand-700 rounded-full text-sm font-medium mb-6">
                <Shield className="w-4 h-4" />
                Your Privacy Matters
              </div>

              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-4">
                Privacy Policy
              </h1>

              <p className="text-body text-navy-400">
                Last updated: {LAST_UPDATED}
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="py-12 md:py-16 bg-white">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto prose prose-navy prose-lg">

              <div className="bg-cream-50 rounded-2xl p-6 border border-cream-200 mb-8 not-prose">
                <p className="text-navy-500 font-medium mb-2">About this Policy</p>
                <p className="text-navy-400 text-sm">
                  This Privacy Policy explains how Vertial Holdings Pty Ltd (ABN 72 629 494 926)
                  (&quot;Trvel&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) collects, uses, discloses, and protects
                  your personal information. We are committed to protecting your privacy in accordance
                  with the Australian Privacy Act 1988 (Cth) and the Australian Privacy Principles (APPs),
                  as well as applicable privacy laws in jurisdictions where we operate.
                </p>
              </div>

              <h2>1. Information We Collect</h2>

              <h3>1.1 Information You Provide</h3>
              <p>When you use our services, we may collect:</p>
              <ul>
                <li><strong>Contact Information:</strong> Email address, name (if provided)</li>
                <li><strong>Payment Information:</strong> Payment card details are processed securely by our payment processor (Stripe) and are not stored on our servers</li>
                <li><strong>Order Information:</strong> Destination country, plan selected, purchase date</li>
                <li><strong>Communications:</strong> Messages you send to our support team</li>
              </ul>

              <h3>1.2 Information Collected Automatically</h3>
              <p>When you visit our website, we automatically collect:</p>
              <ul>
                <li><strong>Device Information:</strong> Browser type, operating system, device type</li>
                <li><strong>Usage Information:</strong> Pages visited, time spent on pages, referral source</li>
                <li><strong>Technical Information:</strong> IP address, general location (country/region level)</li>
              </ul>

              <h3>1.3 Cookies and Similar Technologies</h3>
              <p>
                We use cookies and similar technologies to improve your experience, analyse site traffic,
                and understand how our services are used. You can control cookies through your browser settings.
                Essential cookies are required for the website to function properly.
              </p>

              <h2>2. How We Use Your Information</h2>
              <p>We use your personal information to:</p>
              <ul>
                <li>Process and fulfill your eSIM orders</li>
                <li>Send order confirmations and eSIM delivery via email</li>
                <li>Provide customer support and respond to enquiries</li>
                <li>Process refunds and handle disputes</li>
                <li>Improve our products and services</li>
                <li>Comply with legal obligations</li>
                <li>Detect and prevent fraud</li>
              </ul>

              <h2>3. Legal Basis for Processing</h2>
              <p>We process your personal information based on:</p>
              <ul>
                <li><strong>Contract Performance:</strong> To fulfill our obligations when you purchase from us</li>
                <li><strong>Legal Obligations:</strong> To comply with applicable laws and regulations</li>
                <li><strong>Legitimate Interests:</strong> To improve our services and prevent fraud</li>
                <li><strong>Consent:</strong> Where you have given explicit consent (e.g., marketing communications)</li>
              </ul>

              <h2>4. Information Sharing and Disclosure</h2>
              <p>We may share your information with:</p>
              <ul>
                <li><strong>Service Providers:</strong> Third parties who help us operate our business, including:
                  <ul>
                    <li>Payment processors (Stripe)</li>
                    <li>Email service providers</li>
                    <li>eSIM infrastructure providers (for order fulfillment only)</li>
                    <li>Analytics providers</li>
                  </ul>
                </li>
                <li><strong>Legal Requirements:</strong> When required by law, court order, or government request</li>
                <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
              </ul>
              <p>
                We do not sell, rent, or trade your personal information to third parties for their
                marketing purposes.
              </p>

              <h2>5. International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than your
                country of residence. We ensure appropriate safeguards are in place to protect your
                information in accordance with applicable data protection laws.
              </p>
              <p>
                For customers in the European Economic Area (EEA) or United Kingdom, we ensure transfers
                are made using appropriate safeguards such as Standard Contractual Clauses approved by
                relevant authorities.
              </p>

              <h2>6. Data Security</h2>
              <p>
                We implement appropriate technical and organisational measures to protect your personal
                information, including:
              </p>
              <ul>
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Secure payment processing through PCI-compliant providers</li>
                <li>Regular security assessments and updates</li>
                <li>Access controls and authentication measures</li>
                <li>Employee training on data protection</li>
              </ul>

              <h2>7. Data Retention</h2>
              <p>
                We retain your personal information for as long as necessary to fulfill the purposes
                for which it was collected, including:
              </p>
              <ul>
                <li>Order records: 7 years (for tax and accounting purposes)</li>
                <li>Support communications: 2 years after resolution</li>
                <li>Marketing preferences: Until you withdraw consent</li>
                <li>Website analytics: 26 months</li>
              </ul>

              <h2>8. Your Rights</h2>
              <p>Depending on your location, you may have the following rights:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request your data in a portable format</li>
                <li><strong>Objection:</strong> Object to certain processing activities</li>
                <li><strong>Withdrawal:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us at support@trvel.co. We will respond to
                your request within 30 days (or sooner where required by law).
              </p>

              <h3>8.1 Australian Residents</h3>
              <p>
                Under the Privacy Act 1988 (Cth), you have the right to access and correct your personal
                information. If you believe we have breached the Australian Privacy Principles, you may
                lodge a complaint with us or the Office of the Australian Information Commissioner (OAIC).
              </p>

              <h3>8.2 UK and EEA Residents</h3>
              <p>
                Under the UK GDPR and EU GDPR, you have additional rights including the right to lodge
                a complaint with your local supervisory authority (e.g., the Information Commissioner&apos;s
                Office in the UK).
              </p>

              <h3>8.3 Singapore Residents</h3>
              <p>
                Under the Personal Data Protection Act 2012 (PDPA), you have rights regarding access
                and correction of your personal data. You may contact us or the Personal Data Protection
                Commission (PDPC) regarding your data protection concerns.
              </p>

              <h2>9. Children&apos;s Privacy</h2>
              <p>
                Our services are not directed to individuals under 18 years of age. We do not knowingly
                collect personal information from children. If you become aware that a child has provided
                us with personal information, please contact us immediately.
              </p>

              <h2>10. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites. We are not responsible for the
                privacy practices of these websites. We encourage you to review the privacy policies
                of any third-party sites you visit.
              </p>

              <h2>11. Marketing Communications</h2>
              <p>
                We will only send you marketing communications if you have opted in to receive them.
                You can unsubscribe at any time by clicking the &quot;unsubscribe&quot; link in any marketing
                email or by contacting us directly.
              </p>

              <h2>12. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any material
                changes by posting the updated policy on our website with a new &quot;Last Updated&quot; date.
                Your continued use of our services after any changes indicates your acceptance of the
                updated policy.
              </p>

              <h2>13. Contact Us</h2>
              <p>
                If you have questions, concerns, or complaints about this Privacy Policy or our
                data practices, please contact us:
              </p>
              <div className="bg-cream-50 rounded-xl p-6 border border-cream-200 not-prose">
                <p className="font-semibold text-navy-500 mb-2">Vertial Holdings Pty Ltd</p>
                <p className="text-navy-400 text-sm mb-1">ABN: 72 629 494 926</p>
                <p className="text-navy-400 text-sm mb-1">Email: support@trvel.co</p>
                <p className="text-navy-400 text-sm">New South Wales, Australia</p>
              </div>

              <p className="mt-6">
                For Australian privacy complaints that are not resolved to your satisfaction, you
                may lodge a complaint with the Office of the Australian Information Commissioner:
              </p>
              <ul>
                <li>Website: <a href="https://www.oaic.gov.au" target="_blank" rel="noopener noreferrer">www.oaic.gov.au</a></li>
                <li>Phone: 1300 363 992</li>
              </ul>

            </div>
          </div>
        </section>

        {/* Related Links */}
        <section className="py-12 bg-cream-50 border-t border-cream-200">
          <div className="container-wide">
            <div className="max-w-3xl mx-auto">
              <h3 className="text-lg font-semibold text-navy-500 mb-6 text-center">
                Related Policies
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  href="/terms"
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-cream-200 hover:border-brand-300 transition-colors"
                >
                  <span className="font-medium text-navy-500">Terms of Service</span>
                  <ArrowRight className="w-4 h-4 text-brand-600" />
                </Link>
                <Link
                  href="/fair-use"
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-cream-200 hover:border-brand-300 transition-colors"
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
