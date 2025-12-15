import { Link } from '@/i18n/routing';
import { Shield, Lock, MessageCircle, Mail, ChevronRight } from 'lucide-react';

const destinations = [
  { name: 'Japan', slug: 'japan' },
  { name: 'Thailand', slug: 'thailand' },
  { name: 'South Korea', slug: 'south-korea' },
  { name: 'Singapore', slug: 'singapore' },
  { name: 'Indonesia', slug: 'indonesia' },
  { name: 'Malaysia', slug: 'malaysia' },
];

const company = [
  { name: 'About Us', href: '/about' },
  { name: 'How It Works', href: '/how-it-works' },
  { name: 'Blog', href: '/blog' },
  { name: 'Help Center', href: '/help' },
];

const legal = [
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Fair Use Policy', href: '/fair-use' },
  { name: 'Refund Policy', href: '/refunds' },
];

const locales = [
  { code: 'en-au', label: 'Australia', flag: '🇦🇺', currency: 'AUD' },
  { code: 'en-sg', label: 'Singapore', flag: '🇸🇬', currency: 'SGD' },
  { code: 'en-gb', label: 'United Kingdom', flag: '🇬🇧', currency: 'GBP' },
  { code: 'ms-my', label: 'Malaysia', flag: '🇲🇾', currency: 'MYR' },
  { code: 'id-id', label: 'Indonesia', flag: '🇮🇩', currency: 'IDR' },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Trust Bar */}
      <div className="border-b border-gray-800">
        <div className="container-wide py-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-600/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-white">Money-Back Guarantee</p>
                <p className="text-body-sm text-gray-400">10-min connection or full refund</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success-600/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-success-500" />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-white">Secure Payment</p>
                <p className="text-body-sm text-gray-400">256-bit SSL encryption</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-600/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-white">Human Support</p>
                <p className="text-body-sm text-gray-400">Real people on WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-wide py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <span className="text-xl font-bold text-white">Trvel</span>
            </Link>
            <p className="text-body-sm text-gray-400 mb-6">
              Travel light. Stay connected. Premium eSIMs for travelers who demand reliability.
            </p>
            {/* Contact */}
            <div className="space-y-3">
              <a
                href="https://wa.me/61400000000"
                className="flex items-center gap-2 text-body-sm text-gray-400 hover:text-brand-400 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Support
              </a>
              <a
                href="mailto:support@trvel.co"
                className="flex items-center gap-2 text-body-sm text-gray-400 hover:text-brand-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@trvel.co
              </a>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-body font-semibold text-white mb-4">Destinations</h4>
            <ul className="space-y-3">
              {destinations.map((destination) => (
                <li key={destination.slug}>
                  <Link
                    href={`/${destination.slug}`}
                    className="text-body-sm text-gray-400 hover:text-brand-400 transition-colors"
                  >
                    {destination.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/destinations"
                  className="inline-flex items-center gap-1 text-body-sm text-brand-400 hover:text-brand-300 transition-colors"
                >
                  View all <ChevronRight className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-body font-semibold text-white mb-4">Company</h4>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-sm text-gray-400 hover:text-brand-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-body font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-3">
              {legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-sm text-gray-400 hover:text-brand-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Region */}
          <div>
            <h4 className="text-body font-semibold text-white mb-4">Region</h4>
            <ul className="space-y-3">
              {locales.map((locale) => (
                <li key={locale.code}>
                  <Link
                    href="/"
                    locale={locale.code}
                    className="flex items-center gap-2 text-body-sm text-gray-400 hover:text-brand-400 transition-colors"
                  >
                    <span>{locale.flag}</span>
                    <span>{locale.currency}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container-wide py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-body-sm text-gray-500">
              © {new Date().getFullYear()} Trvel. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <span className="text-body-sm text-gray-500">Payments secured by</span>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1 bg-gray-800 rounded text-body-sm text-gray-400">Stripe</div>
                <div className="px-3 py-1 bg-gray-800 rounded text-body-sm text-gray-400">Apple Pay</div>
                <div className="px-3 py-1 bg-gray-800 rounded text-body-sm text-gray-400">Google Pay</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
