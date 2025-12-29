import { Metadata } from 'next';
import { Header, Footer } from '@/components/layout';
import { Link } from '@/i18n/routing';
import { FileText, ArrowRight } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.trvel.co';
const LAST_UPDATED = '17 December 2024';

interface TermsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: TermsPageProps): Promise<Metadata> {
  const { locale } = await params;

  const title = 'Terms of Service | Trvel eSIM';
  const description = 'Read the terms and conditions for using Trvel eSIM services. Understand your rights, our refund policy, and service guarantees.';

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE_URL}/${locale}/terms`,
      languages: {
        'x-default': `${BASE_URL}/en-au/terms`,
        'en-AU': `${BASE_URL}/en-au/terms`,
        'en-SG': `${BASE_URL}/en-sg/terms`,
        'en-GB': `${BASE_URL}/en-gb/terms`,
        'en-US': `${BASE_URL}/en-us/terms`,
        'ms-MY': `${BASE_URL}/ms-my/terms`,
        'id-ID': `${BASE_URL}/id-id/terms`,
      },
    },
    openGraph: {
      title,
      description,
      url: `${BASE_URL}/${locale}/terms`,
      type: 'website',
    },
  };
}

export default async function TermsPage({ params }: TermsPageProps) {
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
                <FileText className="w-4 h-4" />
                Legal Agreement
              </div>

              <h1 className="text-display md:text-display-lg font-bold text-navy-500 mb-4">
                Terms of Service
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
                <p className="text-navy-500 font-medium mb-2">Agreement to Terms</p>
                <p className="text-navy-400 text-sm">
                  These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you
                  and Vertial Holdings Pty Ltd (ABN 72 629 494 926) (&quot;Trvel&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;).
                  By accessing or using our website and services, you agree to be bound by these Terms.
                  If you do not agree to these Terms, please do not use our services.
                </p>
              </div>

              <h2>1. About Our Services</h2>

              <h3>1.1 Service Description</h3>
              <p>
                Trvel provides digital eSIM (embedded SIM) services that allow you to access mobile
                data services while travelling internationally. Our eSIMs are data-only and do not
                include voice calling or SMS services. Voice and messaging services may be accessed
                through internet-based applications using your data connection.
              </p>

              <h3>1.2 Service Availability</h3>
              <p>
                Our eSIM services are available in specific countries and regions as indicated on our
                website. Coverage, network availability, and data speeds may vary depending on your
                location, network conditions, and the local telecommunications infrastructure.
              </p>

              <h3>1.3 Eligibility</h3>
              <p>
                To use our services, you must:
              </p>
              <ul>
                <li>Be at least 18 years of age or the age of majority in your jurisdiction</li>
                <li>Have a compatible, carrier-unlocked device that supports eSIM technology</li>
                <li>Provide accurate and complete information when making a purchase</li>
                <li>Have legal authority to enter into these Terms</li>
              </ul>

              <h2>2. Orders and Payment</h2>

              <h3>2.1 Placing Orders</h3>
              <p>
                When you place an order, you are making an offer to purchase our services. We may
                accept or decline your order at our discretion. An order is only accepted when we
                send you an order confirmation email containing your eSIM QR code.
              </p>

              <h3>2.2 Pricing</h3>
              <p>
                All prices are displayed in your local currency where available (AUD, SGD, GBP, MYR, IDR)
                and include any applicable taxes. Prices are subject to change without notice, but changes
                will not affect orders that have already been confirmed.
              </p>

              <h3>2.3 Payment</h3>
              <p>
                Payment is processed securely through our payment provider, Stripe. We accept major
                credit and debit cards, as well as Apple Pay and Google Pay. You authorise us to charge
                the payment method you provide for the total amount of your order.
              </p>

              <h3>2.4 Order Confirmation</h3>
              <p>
                Upon successful payment, you will receive an email containing your eSIM QR code and
                installation instructions. Please check your spam folder if you do not receive this
                email within a few minutes of purchase.
              </p>

              <h2>3. eSIM Installation and Activation</h2>

              <h3>3.1 Installation</h3>
              <p>
                You are responsible for installing the eSIM on your compatible device. Installation
                requires an internet connection (WiFi or mobile data). We recommend installing your
                eSIM before travelling while you have stable internet access.
              </p>

              <h3>3.2 QR Code Usage</h3>
              <p>
                Each eSIM QR code is single-use and can only be installed on one device. Once scanned
                and installed, the QR code cannot be used again. Do not share your QR code with others.
                If you accidentally delete your eSIM before using it, contact our support team for assistance.
              </p>

              <h3>3.3 Activation</h3>
              <p>
                Your eSIM plan validity period begins when you first connect to a mobile network in
                your destination country, not from the date of purchase or installation. This allows
                you to install your eSIM in advance of your trip.
              </p>

              <h3>3.4 Compatibility</h3>
              <p>
                It is your responsibility to ensure your device is compatible with eSIM technology
                and is carrier-unlocked before purchase. We provide compatibility information on our
                website, but you should verify compatibility with your device manufacturer if unsure.
              </p>

              <h2>4. Data Plans and Usage</h2>

              <h3>4.1 Data Allowance</h3>
              <p>
                Our plans include a daily high-speed data allowance as specified at the time of purchase
                (typically 1GB per day). After the daily high-speed allowance is consumed, you will
                continue to have unlimited data access at reduced speeds until midnight local time.
              </p>

              <h3>4.2 Validity Period</h3>
              <p>
                Plans are available in various durations (5, 7, or 15 days as displayed). The validity
                period is counted in calendar days from the first data connection in your destination.
              </p>

              <h3>4.3 Fair Use</h3>
              <p>
                All usage is subject to our Fair Use Policy. We reserve the right to suspend or
                terminate service if we detect usage that violates our Fair Use Policy or these Terms.
              </p>

              <h2>5. Refunds and Guarantees</h2>

              <h3>5.1 Refund Policy</h3>
              <p>
                We offer refunds under the following circumstances:
              </p>
              <ul>
                <li>
                  <strong>Unused eSIM:</strong> If you have not installed (scanned) your eSIM QR code,
                  you may request a full refund within 30 days of purchase.
                </li>
                <li>
                  <strong>Technical Issues:</strong> If your eSIM fails to work due to a technical
                  fault on our end, we will provide a full refund or replacement.
                </li>
                <li>
                  <strong>10-Minute Connection Guarantee:</strong> If we cannot get you connected
                  within 10 minutes of you contacting our support team (during your trip), you will
                  receive a full refund.
                </li>
              </ul>

              <h3>5.2 Non-Refundable Situations</h3>
              <p>
                Refunds are generally not available once an eSIM has been installed, as the QR code
                becomes single-use upon installation. Refunds are also not available for:
              </p>
              <ul>
                <li>Incompatible or carrier-locked devices</li>
                <li>User error during installation</li>
                <li>Network issues outside our control</li>
                <li>Change of travel plans after installation</li>
              </ul>

              <h3>5.3 Australian Consumer Law</h3>
              <p>
                If you are an Australian consumer, you have certain rights under the Australian
                Consumer Law that cannot be excluded, restricted, or modified. These Terms do not
                exclude, restrict, or modify the application of any condition, warranty, guarantee,
                right, or remedy conferred by the Australian Consumer Law where to do so would be
                unlawful.
              </p>

              <h3>5.4 Consumer Guarantees</h3>
              <p>
                Our services come with guarantees that cannot be excluded under the Australian Consumer
                Law. For major failures with the service, you are entitled to cancel your service
                contract with us and receive a refund for the unused portion, or compensation for
                its reduced value. You are also entitled to be compensated for any other reasonably
                foreseeable loss or damage.
              </p>

              <h2>6. Acceptable Use</h2>

              <h3>6.1 Permitted Use</h3>
              <p>
                Our eSIM services are intended for personal, non-commercial use while travelling.
                You may use the services for lawful purposes including browsing, messaging,
                navigation, and general internet usage.
              </p>

              <h3>6.2 Prohibited Use</h3>
              <p>
                You must not use our services to:
              </p>
              <ul>
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Transmit spam, malware, or other harmful content</li>
                <li>Engage in illegal activities including fraud</li>
                <li>Resell or redistribute our services</li>
                <li>Use automated systems to consume excessive bandwidth</li>
                <li>Interfere with or disrupt our services or networks</li>
                <li>Bypass any usage limits or restrictions</li>
              </ul>

              <h2>7. Intellectual Property</h2>
              <p>
                All content on our website, including text, graphics, logos, and software, is the
                property of Vertial Holdings Pty Ltd or our licensors and is protected by intellectual
                property laws. You may not reproduce, distribute, modify, or create derivative works
                from our content without our express written permission.
              </p>

              <h2>8. Limitation of Liability</h2>

              <h3>8.1 Service Limitations</h3>
              <p>
                Our services depend on third-party mobile networks and infrastructure. We do not
                guarantee uninterrupted, error-free, or secure service. Network coverage, speeds,
                and availability may vary and are subject to factors outside our control.
              </p>

              <h3>8.2 Liability Cap</h3>
              <p>
                To the maximum extent permitted by law, our total liability for any claims arising
                from or related to these Terms or our services shall not exceed the amount you paid
                for the specific eSIM plan in question.
              </p>

              <h3>8.3 Exclusion of Consequential Damages</h3>
              <p>
                To the maximum extent permitted by law, we shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages, including but not limited
                to loss of profits, data, business opportunities, or goodwill.
              </p>

              <h3>8.4 Force Majeure</h3>
              <p>
                We shall not be liable for any failure or delay in performing our obligations due
                to circumstances beyond our reasonable control, including natural disasters, war,
                terrorism, government actions, network failures, or pandemic.
              </p>

              <h2>9. Indemnification</h2>
              <p>
                You agree to indemnify, defend, and hold harmless Vertial Holdings Pty Ltd and its
                officers, directors, employees, and agents from any claims, damages, losses, or
                expenses (including reasonable legal fees) arising from your use of our services
                or violation of these Terms.
              </p>

              <h2>10. Privacy</h2>
              <p>
                Your privacy is important to us. Our collection, use, and disclosure of personal
                information is governed by our Privacy Policy, which forms part of these Terms.
                By using our services, you consent to the practices described in our Privacy Policy.
              </p>

              <h2>11. Modifications to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Changes will be effective
                when posted on our website with an updated &quot;Last Updated&quot; date. Your continued use
                of our services after any changes indicates your acceptance of the modified Terms.
                We encourage you to review these Terms periodically.
              </p>

              <h2>12. Termination</h2>

              <h3>12.1 Termination by You</h3>
              <p>
                You may stop using our services at any time. Unused eSIMs may be eligible for
                refund in accordance with our refund policy.
              </p>

              <h3>12.2 Termination by Us</h3>
              <p>
                We may suspend or terminate your access to our services immediately if you breach
                these Terms, engage in prohibited activities, or if required by law. We may also
                discontinue our services at any time with reasonable notice.
              </p>

              <h2>13. Governing Law and Disputes</h2>

              <h3>13.1 Governing Law</h3>
              <p>
                These Terms are governed by the laws of New South Wales, Australia, without regard
                to conflict of law principles. You agree to submit to the exclusive jurisdiction
                of the courts of New South Wales for any disputes arising from these Terms.
              </p>

              <h3>13.2 Dispute Resolution</h3>
              <p>
                Before initiating any legal proceedings, you agree to contact us first to attempt
                to resolve any dispute informally. We will work with you in good faith to resolve
                any issues within 30 days.
              </p>

              <h3>13.3 International Users</h3>
              <p>
                If you access our services from outside Australia, you are responsible for compliance
                with local laws. These Terms shall be interpreted and enforced in accordance with
                Australian law, regardless of where you access our services.
              </p>

              <h2>14. General Provisions</h2>

              <h3>14.1 Entire Agreement</h3>
              <p>
                These Terms, together with our Privacy Policy and Fair Use Policy, constitute the
                entire agreement between you and Vertial Holdings Pty Ltd regarding our services.
              </p>

              <h3>14.2 Severability</h3>
              <p>
                If any provision of these Terms is found to be invalid or unenforceable, the
                remaining provisions shall continue in full force and effect.
              </p>

              <h3>14.3 Waiver</h3>
              <p>
                Our failure to enforce any provision of these Terms shall not constitute a waiver
                of that provision or our right to enforce it in the future.
              </p>

              <h3>14.4 Assignment</h3>
              <p>
                You may not assign or transfer your rights under these Terms without our prior
                written consent. We may assign our rights and obligations without restriction.
              </p>

              <h2>15. Contact Us</h2>
              <p>
                If you have questions about these Terms or our services, please contact us:
              </p>
              <div className="bg-cream-50 rounded-xl p-6 border border-cream-200 not-prose">
                <p className="font-semibold text-navy-500 mb-2">Vertial Holdings Pty Ltd</p>
                <p className="text-navy-400 text-sm mb-1">ABN: 72 629 494 926</p>
                <p className="text-navy-400 text-sm mb-1">Email: support@trvel.co</p>
                <p className="text-navy-400 text-sm">New South Wales, Australia</p>
              </div>

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
                  href="/privacy"
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-cream-200 hover:border-brand-300 transition-colors"
                >
                  <span className="font-medium text-navy-500">Privacy Policy</span>
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
