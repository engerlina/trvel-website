'use client';

import { Link, usePathname } from '@/i18n/routing';
import Image from 'next/image';
import { Shield, Lock, MessageCircle, Mail, ChevronRight, Phone } from 'lucide-react';
import { AU, SG, GB, US, MY, ID, CA, NZ, type FlagComponent } from 'country-flag-icons/react/3x2';
import type { Locale } from '@/types';


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
  { name: 'Customer Reviews', href: '/reviews' },
  { name: 'Our Guarantee', href: '/guarantee' },
  { name: 'Blog', href: '/blog' },
  { name: 'Help Center', href: '/help' },
];

const resources = [
  { name: 'Check Device Compatibility', href: '/compatibility' },
  { name: 'iPhone eSIM Guide', href: '/compatibility/apple' },
  { name: 'Samsung eSIM Guide', href: '/compatibility/samsung' },
  { name: 'Google Pixel eSIM', href: '/compatibility/google' },
];

const legal = [
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Fair Use Policy', href: '/fair-use' },
  { name: 'Refund Policy', href: '/refunds' },
];

const locales: { code: string; label: string; Flag: FlagComponent; currency: string }[] = [
  { code: 'en-au', label: 'Australia', Flag: AU, currency: 'AUD' },
  { code: 'en-nz', label: 'New Zealand', Flag: NZ, currency: 'NZD' },
  { code: 'en-us', label: 'United States', Flag: US, currency: 'USD' },
  { code: 'en-ca', label: 'Canada', Flag: CA, currency: 'CAD' },
  { code: 'en-sg', label: 'Singapore', Flag: SG, currency: 'SGD' },
  { code: 'en-gb', label: 'United Kingdom', Flag: GB, currency: 'GBP' },
  { code: 'ms-my', label: 'Malaysia', Flag: MY, currency: 'MYR' },
  { code: 'id-id', label: 'Indonesia', Flag: ID, currency: 'IDR' },
];

export function Footer() {
  const pathname = usePathname();

  // Handle locale switch by constructing the full URL
  const switchLocale = (newLocale: Locale) => {
    // Use window.location for hard navigation to bypass Next.js locale middleware
    const newPath = `/${newLocale}${pathname === '/' ? '' : pathname}`;
    window.location.href = newPath;
  };

  return (
    <footer
      className="relative z-10 bg-navy-500 text-cream-300 no-decoration overflow-hidden"
      style={{ backgroundColor: '#010326', backgroundImage: 'none', isolation: 'isolate' }}
    >
      {/* Trust Bar */}
      <div className="border-b border-solid border-navy-400">
        <div className="container-wide py-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-400/20 flex items-center justify-center">
                <Shield className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-cream-100">Money-Back Guarantee</p>
                <p className="text-body-sm text-cream-400">10-min connection or full refund</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-400/20 flex items-center justify-center">
                <Lock className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-cream-100">Secure Payment</p>
                <p className="text-body-sm text-cream-400">256-bit SSL encryption</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-accent-400/20 flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <p className="text-body-sm font-semibold text-cream-100">24/7 Support</p>
                <p className="text-body-sm text-cream-400">Live chat & phone anytime</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-wide py-16" style={{ backgroundColor: '#010326' }}>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 lg:gap-12" style={{ backgroundColor: '#010326' }}>
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Image
                src="/logo.svg"
                alt="Trvel"
                width={28}
                height={40}
                className="w-7 h-10"
              />
              <span className="text-xl font-bold text-cream-100">Trvel</span>
            </Link>
            <p className="text-body-sm text-cream-400 mb-6">
              Travel light. Stay connected. Premium{' '}
              <a
                href="https://www.gsma.com/esim/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-400 hover:text-brand-300 transition-colors"
              >
                eSIMs
              </a>{' '}
              for travelers who demand reliability.
            </p>
            {/* Contact */}
            <div className="space-y-3">
              <a
                href="tel:+61340527555"
                className="flex items-center gap-2 text-body-sm text-cream-400 hover:text-brand-400 transition-colors"
              >
                <Phone className="w-4 h-4" />
                +61 3 4052 7555
              </a>
              <a
                href="mailto:support@trvel.co"
                className="flex items-center gap-2 text-body-sm text-cream-400 hover:text-brand-400 transition-colors"
              >
                <Mail className="w-4 h-4" />
                support@trvel.co
              </a>
            </div>
          </div>

          {/* Destinations */}
          <div>
            <h4 className="text-body font-semibold text-cream-100 mb-4">Destinations</h4>
            <ul className="space-y-3">
              {destinations.map((destination) => (
                <li key={destination.slug}>
                  <Link
                    href={`/${destination.slug}`}
                    className="text-body-sm text-cream-400 hover:text-brand-400 transition-colors"
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
            <h4 className="text-body font-semibold text-cream-100 mb-4">Company</h4>
            <ul className="space-y-3">
              {company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-sm text-cream-400 hover:text-brand-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-body font-semibold text-cream-100 mb-4">Resources</h4>
            <ul className="space-y-3">
              {resources.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-sm text-cream-400 hover:text-brand-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-body font-semibold text-cream-100 mb-4">Legal</h4>
            <ul className="space-y-3">
              {legal.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-body-sm text-cream-400 hover:text-brand-400 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Region */}
          <div>
            <h4 className="text-body font-semibold text-cream-100 mb-4">Region</h4>
            <ul className="space-y-3">
              {locales.map((loc) => (
                <li key={loc.code}>
                  <button
                    onClick={() => switchLocale(loc.code as Locale)}
                    className="flex items-center gap-2 text-body-sm text-cream-400 hover:text-brand-400 transition-colors"
                  >
                    <loc.Flag className="w-5 h-auto" />
                    <span>{loc.currency}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-solid border-navy-400">
        <div className="container-wide py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-body-sm text-cream-500">
              © {new Date().getFullYear()} Trvel. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-body-sm text-cream-500">Payments secured by</span>
              <div className="flex items-center gap-4">
                <a
                  href="https://stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <Image src="/stripe.png" alt="Stripe" width={50} height={21} className="h-5 w-auto brightness-0 invert" />
                </a>
                <a
                  href="https://www.apple.com/apple-pay/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <Image src="/apple-logo.png" alt="Apple Pay" width={50} height={21} className="h-5 w-auto brightness-0 invert" />
                </a>
                <a
                  href="https://pay.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 transition-opacity"
                >
                  <Image src="/google.png" alt="Google Pay" width={50} height={21} className="h-5 w-auto brightness-0 invert" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
