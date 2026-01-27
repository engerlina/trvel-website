'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Menu, X, Globe, Phone } from 'lucide-react';
import { Button } from '@/components/ui';
import { AU, SG, GB, US, MY, ID } from 'country-flag-icons/react/3x2';

const locales = [
  { code: 'en-au', label: 'Australia', Flag: AU, currency: 'AUD', phone: '+61 3 4052 7555' },
  { code: 'en-us', label: 'United States', Flag: US, currency: 'USD', phone: null },
  { code: 'en-sg', label: 'Singapore', Flag: SG, currency: 'SGD', phone: null },
  { code: 'en-gb', label: 'United Kingdom', Flag: GB, currency: 'GBP', phone: null },
  { code: 'ms-my', label: 'Malaysia', Flag: MY, currency: 'MYR', phone: null },
  { code: 'id-id', label: 'Indonesia', Flag: ID, currency: 'IDR', phone: null },
];

export function Header() {
  const t = useTranslations('common.nav');
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Find the current locale config
  const currentLocale = locales.find(l => l.code === locale) || locales[0];
  const CurrentFlag = currentLocale.Flag;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-base-100/80 backdrop-blur-lg border-b border-base-200">
      <nav className="navbar container-wide">
        {/* Logo */}
        <div className="navbar-start">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.svg"
              alt="Trvel"
              width={28}
              height={40}
              className="w-7 h-10"
            />
            <span className="text-xl font-bold text-navy-500">Trvel</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-center hidden lg:flex">
          <ul className="menu menu-horizontal px-1 gap-1">
            <li><Link href="/destinations" className="text-body">{t('destinations')}</Link></li>
            <li><Link href="/compatibility" className="text-body">Check Device</Link></li>
            <li><Link href="/how-it-works" className="text-body">How It Works</Link></li>
            <li><Link href="/help" className="text-body">Help</Link></li>
          </ul>
        </div>

        {/* Desktop Actions */}
        <div className="navbar-end">
          <div className="hidden lg:flex items-center">
            {/* Phone Number - Clean pill style */}
            {currentLocale.phone && (
              <a
                href={`tel:${currentLocale.phone.replace(/\s/g, '')}`}
                className="hidden 2xl:flex items-center gap-2 px-3 py-1.5 text-sm text-navy-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors mr-2"
              >
                <Phone className="w-4 h-4" />
                <span className="whitespace-nowrap">{currentLocale.phone}</span>
              </a>
            )}

            {/* Divider */}
            <div className="h-6 w-px bg-cream-300 mx-3" />

            {/* Locale Switcher - Cleaner style */}
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="flex items-center gap-2 px-3 py-1.5 hover:bg-cream-100 rounded-lg transition-colors cursor-pointer">
                <CurrentFlag className="w-5 h-3.5 rounded-sm shadow-sm" />
                <span className="text-sm font-medium text-navy-500">{currentLocale.currency}</span>
                <svg className="w-3.5 h-3.5 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-xl z-[1] w-56 p-2 shadow-lg border border-cream-200 mt-3">
                <li className="menu-title px-3 py-2 text-xs text-navy-400 uppercase tracking-wide">Select Region</li>
                {locales.map((loc) => (
                  <li key={loc.code}>
                    <Link
                      href="/"
                      locale={loc.code}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                        locale === loc.code ? 'bg-brand-50 text-brand-600' : 'hover:bg-cream-50'
                      }`}
                    >
                      <loc.Flag className="w-6 h-4 rounded-sm shadow-sm" />
                      <span className="flex-1 font-medium">{loc.label}</span>
                      <span className={`text-sm ${locale === loc.code ? 'text-brand-500' : 'text-navy-400'}`}>{loc.currency}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* CTA Button */}
            <Link href="/get-started" className="ml-4 flex-shrink-0">
              <Button variant="primary" size="sm" className="whitespace-nowrap">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Tablet: Simplified actions */}
          <div className="hidden md:flex lg:hidden items-center gap-3">
            <div className="dropdown dropdown-end">
              <div tabIndex={0} role="button" className="flex items-center gap-1.5 px-2 py-1.5 hover:bg-cream-100 rounded-lg transition-colors cursor-pointer">
                <CurrentFlag className="w-5 h-3.5 rounded-sm shadow-sm" />
                <svg className="w-3 h-3 text-navy-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-xl z-[1] w-56 p-2 shadow-lg border border-cream-200 mt-3">
                <li className="menu-title px-3 py-2 text-xs text-navy-400 uppercase tracking-wide">Select Region</li>
                {locales.map((loc) => (
                  <li key={loc.code}>
                    <Link
                      href="/"
                      locale={loc.code}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${
                        locale === loc.code ? 'bg-brand-50 text-brand-600' : 'hover:bg-cream-50'
                      }`}
                    >
                      <loc.Flag className="w-6 h-4 rounded-sm shadow-sm" />
                      <span className="flex-1 font-medium">{loc.label}</span>
                      <span className={`text-sm ${locale === loc.code ? 'text-brand-500' : 'text-navy-400'}`}>{loc.currency}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/get-started" className="flex-shrink-0">
              <Button variant="primary" size="sm" className="whitespace-nowrap">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="btn btn-ghost btn-square md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu - DaisyUI Collapse style */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-base-200 bg-base-100">
          <ul className="menu p-4">
            <li><Link href="/destinations" onClick={() => setMobileMenuOpen(false)}>{t('destinations')}</Link></li>
            <li><Link href="/compatibility" onClick={() => setMobileMenuOpen(false)}>Check Device</Link></li>
            <li><Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</Link></li>
            <li><Link href="/help" onClick={() => setMobileMenuOpen(false)}>Help</Link></li>
            <li className="mt-4">
              <Link href="/get-started" onClick={() => setMobileMenuOpen(false)} className="w-full">
                <Button variant="primary" size="md" className="w-full justify-center">
                  Get Started
                </Button>
              </Link>
            </li>
          </ul>

          {/* Mobile Phone Number */}
          {currentLocale.phone && (
            <div className="border-t border-base-200 p-4">
              <a
                href={`tel:${currentLocale.phone.replace(/\s/g, '')}`}
                className="flex items-center justify-center gap-3 p-3 bg-brand-50 rounded-xl text-brand-600 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Phone className="w-5 h-5" />
                <span>Call {currentLocale.phone}</span>
              </a>
            </div>
          )}

          {/* Mobile Locale Switcher */}
          <div className="border-t border-base-200 p-4">
            <div className="flex items-center gap-2 text-sm text-navy-400 mb-3">
              <Globe className="w-4 h-4" />
              <span>Region & Currency</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {locales.map((loc) => (
                <Link
                  key={loc.code}
                  href="/"
                  locale={loc.code}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                    locale === loc.code
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-cream-200 hover:border-brand-300'
                  }`}
                >
                  <loc.Flag className="w-5 h-auto rounded-sm flex-shrink-0" />
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-navy-600 block truncate">{loc.label}</span>
                    <span className="text-xs text-navy-400">{loc.currency}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
