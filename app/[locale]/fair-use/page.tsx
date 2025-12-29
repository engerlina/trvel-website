import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { Link } from '@/i18n/routing';
import { Scale, ArrowRight, AlertCircle, CheckCircle, XCircle } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';
const LAST_UPDATED = '17 December 2024';

interface FairUsePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: FairUsePageProps): Promise<Metadata> {
  const { locale } = await params;

  const title = 'Fair Use Policy | Trvel eSIM';
  const description = 'Understand our fair use policy for Trvel eSIM data plans. Learn about data allowances, speed management, and acceptable use guidelines.';

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/fair-use`,
      languages: {
        'x-default': `${BASE_URL}/en-au/fair-use`,
        'en-AU': `${BASE_URL}/en-au/fair-use`,
        'en-SG': `${BASE_URL}/en-sg/fair-use`,
        'en-GB': `${BASE_URL}/en-gb/fair-use`,
        'en-US': `${BASE_URL}/en-us/fair-use`,
        'ms-MY': `${BASE_URL}/ms-my/fair-use`,
        'id-ID': `${BASE_URL}/id-id/fair-use`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/fair-use`,
      type: 'website',
    },
  };
}

export default async function FairUsePage({ params }: FairUsePageProps) {
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
                <Scale className="w-4 h-4" />
                Usage Guidelines
              </div>

              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-4">
                Fair Use Policy
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
                <p className="text-navy-500 font-medium mb-2">About This Policy</p>
                <p className="text-navy-400 text-sm">
                  This Fair Use Policy (&quot;Policy&quot;) is designed to ensure all Trvel customers can enjoy
                  reliable, high-quality mobile data services. It applies to all eSIM plans purchased
                  from Vertial Holdings Pty Ltd (ABN 72 629 494 926) trading as Trvel. By using our
                  services, you agree to comply with this Policy.
                </p>
              </div>

              <h2>1. Data Allowances</h2>

              <h3>1.1 High-Speed Data</h3>
              <p>
                Each Trvel eSIM plan includes a daily high-speed data allowance of 1GB per day.
                High-speed data provides full 5G/4G speeds where available, suitable for all
                typical travel activities including video calls, streaming, and navigation.
              </p>

              <h3>1.2 Unlimited Data After High-Speed Allowance</h3>
              <p>
                After you have used your daily 1GB high-speed allowance, you will continue to have
                unlimited data access at reduced speeds (1.25 Mbps) for the remainder
                of the day. This speed is sufficient for:
              </p>
              <ul>
                <li>Messaging applications (WhatsApp, Telegram, iMessage)</li>
                <li>Email and basic web browsing</li>
                <li>Maps and navigation</li>
                <li>Social media (text and compressed images)</li>
              </ul>

              <h3>1.3 Daily Reset</h3>
              <p>
                Your high-speed data allowance resets every 24 hours from your first data use.
                Unused high-speed data does not roll over to the next day.
              </p>

              <h2>2. What Is Fair Use?</h2>

              <p>
                Fair use means using our services in a reasonable manner consistent with typical
                travel needs. Our eSIM plans are designed for personal use by individual travellers,
                not for commercial purposes, permanent internet access, or to replace home broadband services.
              </p>

              <div className="bg-success-50 rounded-xl p-6 border border-success-200 not-prose my-8">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-6 h-6 text-success-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-success-800 mb-2">Examples of Fair Use</p>
                    <ul className="text-success-700 text-sm space-y-1">
                      <li>Browsing websites and checking social media</li>
                      <li>Using maps and navigation while exploring</li>
                      <li>Sending messages and making VoIP calls</li>
                      <li>Streaming music while sightseeing</li>
                      <li>Uploading photos to social media</li>
                      <li>Video calls with family and friends</li>
                      <li>Occasional video streaming (standard definition recommended)</li>
                      <li>Using your phone as intended while travelling</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h2>3. Prohibited Activities</h2>

              <p>
                To ensure all customers receive quality service, the following activities are not
                permitted and may result in service suspension or termination:
              </p>

              <div className="bg-error-50 rounded-xl p-6 border border-error-200 not-prose my-8">
                <div className="flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-error-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-error-800 mb-2">Prohibited Activities</p>
                    <ul className="text-error-700 text-sm space-y-1">
                      <li>Excessive tethering or mobile hotspot usage</li>
                      <li>Using the eSIM in routers, IoT devices, or non-mobile devices</li>
                      <li>Commercial or business-critical operations</li>
                      <li>Running servers, hosting websites, or peer-to-peer sharing</li>
                      <li>Continuous high-bandwidth streaming (24/7 video)</li>
                      <li>Automated or scripted data consumption</li>
                      <li>Reselling or redistributing the data connection</li>
                      <li>Using VPNs to circumvent geographic restrictions</li>
                      <li>Any illegal activities or content distribution</li>
                    </ul>
                  </div>
                </div>
              </div>

              <h3>3.1 Tethering and Hotspot</h3>
              <p>
                Limited tethering (sharing your mobile data with a laptop or tablet) for personal
                use is generally acceptable. However, excessive tethering that significantly exceeds
                normal mobile device usage, or using the connection as a primary internet source for
                multiple devices, is not permitted.
              </p>

              <h3>3.2 Commercial Use</h3>
              <p>
                Our eSIM plans are for personal travel use only. Using our services for business-critical
                operations, commercial activities, or as a primary business internet connection is not
                permitted. Business travellers using data for normal work activities (email, video
                conferencing) are welcome.
              </p>

              <h2>4. Network Management</h2>

              <h3>4.1 Speed Management</h3>
              <p>
                We employ speed management practices to ensure fair access for all users:
              </p>
              <ul>
                <li>
                  <strong>Daily High-Speed Cap:</strong> After consuming your daily high-speed
                  allowance, speeds are reduced to ensure continued service access.
                </li>
                <li>
                  <strong>Network Optimisation:</strong> During periods of network congestion,
                  data may be prioritised to ensure all users maintain reasonable connectivity.
                </li>
              </ul>

              <h3>4.2 Usage Monitoring</h3>
              <p>
                We monitor aggregate usage patterns to detect unusual activity that may indicate
                abuse or violation of this Policy. Individual browsing activity is not monitored
                or recorded. We only analyse usage volumes and patterns for service management purposes.
              </p>

              <h2>5. Consequences of Violation</h2>

              <p>
                If we detect usage that violates this Fair Use Policy, we may take the following actions:
              </p>

              <div className="bg-warning-50 rounded-xl p-6 border border-warning-200 not-prose my-8">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-6 h-6 text-warning-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-warning-800 mb-2">Enforcement Actions</p>
                    <ol className="text-warning-700 text-sm space-y-1 list-decimal list-inside">
                      <li>Warning notification via email</li>
                      <li>Temporary speed reduction or service restriction</li>
                      <li>Suspension of service without refund</li>
                      <li>Permanent ban from future purchases</li>
                    </ol>
                    <p className="text-warning-700 text-sm mt-2">
                      We will attempt to contact you before taking action where possible, but
                      reserve the right to act immediately in cases of severe abuse.
                    </p>
                  </div>
                </div>
              </div>

              <h2>6. Your Responsibilities</h2>

              <p>
                As a Trvel customer, you are responsible for:
              </p>
              <ul>
                <li>Using the service in accordance with this Policy and applicable laws</li>
                <li>Ensuring your device is secure and protected from malware</li>
                <li>Not sharing your eSIM or data connection for commercial purposes</li>
                <li>Reporting any suspected unauthorised use of your eSIM</li>
                <li>Understanding and respecting the data allowances of your plan</li>
              </ul>

              <h2>7. International Regulations</h2>

              <p>
                Our eSIM services operate across multiple jurisdictions through partnerships with
                local network operators. Your use must comply with:
              </p>
              <ul>
                <li>Local telecommunications regulations in your destination country</li>
                <li>Australian telecommunications laws</li>
                <li>The acceptable use policies of underlying network operators</li>
                <li>Any applicable international data transfer regulations</li>
              </ul>

              <h2>8. Changes to This Policy</h2>

              <p>
                We may update this Fair Use Policy from time to time to reflect changes in our
                services, network capabilities, or regulatory requirements. Changes will be
                effective when posted on our website. We encourage you to review this Policy
                periodically. Continued use of our services after changes constitutes acceptance
                of the updated Policy.
              </p>

              <h2>9. Questions and Support</h2>

              <p>
                If you have questions about this Fair Use Policy or believe your usage has been
                incorrectly flagged, please contact our support team:
              </p>

              <div className="bg-cream-50 rounded-xl p-6 border border-cream-200 not-prose">
                <p className="font-semibold text-navy-500 mb-2">Vertial Holdings Pty Ltd</p>
                <p className="text-navy-400 text-sm mb-1">ABN: 72 629 494 926</p>
                <p className="text-navy-400 text-sm mb-1">Email: support@trvel.co</p>
                <p className="text-navy-400 text-sm">New South Wales, Australia</p>
              </div>

              <p className="mt-6">
                We are committed to working with customers to resolve any concerns and ensure
                you can make the most of your Trvel eSIM while travelling.
              </p>

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
                  href="/privacy"
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-cream-200 hover:border-brand-300 transition-colors"
                >
                  <span className="font-medium text-navy-500">Privacy Policy</span>
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
