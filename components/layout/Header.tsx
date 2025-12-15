'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Menu, X, Globe } from 'lucide-react';
import { Button } from '@/components/ui';
import { AU, SG, GB, MY, ID } from 'country-flag-icons/react/3x2';

const locales = [
  { code: 'en-au', label: 'Australia', Flag: AU, currency: 'AUD' },
  { code: 'en-sg', label: 'Singapore', Flag: SG, currency: 'SGD' },
  { code: 'en-gb', label: 'United Kingdom', Flag: GB, currency: 'GBP' },
  { code: 'ms-my', label: 'Malaysia', Flag: MY, currency: 'MYR' },
  { code: 'id-id', label: 'Indonesia', Flag: ID, currency: 'IDR' },
];

export function Header() {
  const t = useTranslations('common.nav');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-base-100/80 backdrop-blur-lg border-b border-base-200">
      <nav className="navbar container-wide">
        {/* Logo */}
        <div className="navbar-start">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-base-content">Trvel</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="navbar-center hidden md:flex">
          <ul className="menu menu-horizontal px-1 gap-2">
            <li><Link href="/" className="text-body">{t('home')}</Link></li>
            <li><Link href="/destinations" className="text-body">{t('destinations')}</Link></li>
            <li><Link href="/how-it-works" className="text-body">How It Works</Link></li>
            <li><Link href="/help" className="text-body">Help</Link></li>
          </ul>
        </div>

        {/* Desktop Actions */}
        <div className="navbar-end gap-2">
          {/* Locale Switcher - DaisyUI Dropdown */}
          <div className="dropdown dropdown-end hidden md:block">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-2">
              <Globe className="w-4 h-4" />
              <AU className="w-5 h-auto rounded-sm" />
              <span>AUD</span>
            </div>
            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow-soft-lg border border-base-200 mt-2">
              {locales.map((locale) => (
                <li key={locale.code}>
                  <Link href="/" locale={locale.code} className="flex items-center gap-3">
                    <locale.Flag className="w-5 h-auto rounded-sm" />
                    <span>{locale.label}</span>
                    <span className="ml-auto text-base-content/50 text-sm">{locale.currency}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Button variant="primary" size="sm" className="hidden md:flex">
            Get Started
          </Button>

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
            <li><Link href="/" onClick={() => setMobileMenuOpen(false)}>{t('home')}</Link></li>
            <li><Link href="/destinations" onClick={() => setMobileMenuOpen(false)}>{t('destinations')}</Link></li>
            <li><Link href="/how-it-works" onClick={() => setMobileMenuOpen(false)}>How It Works</Link></li>
            <li><Link href="/help" onClick={() => setMobileMenuOpen(false)}>Help</Link></li>
            <li className="mt-4">
              <Button variant="primary" size="md" className="w-full justify-center">
                Get Started
              </Button>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
