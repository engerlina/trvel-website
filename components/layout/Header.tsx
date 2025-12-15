'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Menu, X, Globe, ChevronDown } from 'lucide-react';
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
  const [localeMenuOpen, setLocaleMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
      <nav className="container-wide">
        <div className="flex items-center justify-between h-16 md:h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <span className="text-white font-bold text-lg">T</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Trvel</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-body text-gray-600 hover:text-brand-600 transition-colors">
              {t('home')}
            </Link>
            <Link href="/destinations" className="text-body text-gray-600 hover:text-brand-600 transition-colors">
              {t('destinations')}
            </Link>
            <Link href="/how-it-works" className="text-body text-gray-600 hover:text-brand-600 transition-colors">
              How It Works
            </Link>
            <Link href="/help" className="text-body text-gray-600 hover:text-brand-600 transition-colors">
              Help
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            {/* Locale Switcher */}
            <div className="relative">
              <button
                onClick={() => setLocaleMenuOpen(!localeMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 text-body-sm text-gray-600 hover:text-brand-600 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <AU className="w-5 h-auto rounded-sm" />
                <span>AUD</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              {localeMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-soft-lg border border-gray-100 py-2">
                  {locales.map((locale) => (
                    <Link
                      key={locale.code}
                      href="/"
                      locale={locale.code}
                      className="flex items-center gap-3 px-4 py-2 text-body-sm text-gray-700 hover:bg-brand-50 hover:text-brand-600 transition-colors"
                      onClick={() => setLocaleMenuOpen(false)}
                    >
                      <locale.Flag className="w-5 h-auto rounded-sm" />
                      <span>{locale.label}</span>
                      <span className="ml-auto text-gray-400">{locale.currency}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Button variant="primary" size="sm">
              Get Started
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-gray-600"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="flex flex-col gap-4">
              <Link href="/" className="text-body text-gray-600 hover:text-brand-600 transition-colors py-2">
                {t('home')}
              </Link>
              <Link href="/destinations" className="text-body text-gray-600 hover:text-brand-600 transition-colors py-2">
                {t('destinations')}
              </Link>
              <Link href="/how-it-works" className="text-body text-gray-600 hover:text-brand-600 transition-colors py-2">
                How It Works
              </Link>
              <Link href="/help" className="text-body text-gray-600 hover:text-brand-600 transition-colors py-2">
                Help
              </Link>
              <div className="pt-4 border-t border-gray-100">
                <Button variant="primary" size="md" className="w-full">
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
