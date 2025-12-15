'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { ChevronDown, Shield, Zap } from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';

const destinations = [
  { name: 'Japan', slug: 'japan', flag: '🇯🇵' },
  { name: 'Thailand', slug: 'thailand', flag: '🇹🇭' },
  { name: 'South Korea', slug: 'south-korea', flag: '🇰🇷' },
  { name: 'Singapore', slug: 'singapore', flag: '🇸🇬' },
  { name: 'Indonesia', slug: 'indonesia', flag: '🇮🇩' },
  { name: 'Malaysia', slug: 'malaysia', flag: '🇲🇾' },
  { name: 'Vietnam', slug: 'vietnam', flag: '🇻🇳' },
  { name: 'Philippines', slug: 'philippines', flag: '🇵🇭' },
  { name: 'United Kingdom', slug: 'united-kingdom', flag: '🇬🇧' },
  { name: 'France', slug: 'france', flag: '🇫🇷' },
  { name: 'Italy', slug: 'italy', flag: '🇮🇹' },
  { name: 'United States', slug: 'united-states', flag: '🇺🇸' },
];

export function Hero() {
  const t = useTranslations('home.hero');
  const router = useRouter();
  const [selectedDestination, setSelectedDestination] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const handleDestinationSelect = (slug: string) => {
    setSelectedDestination(slug);
    setIsOpen(false);
  };

  const handleGetStarted = () => {
    if (selectedDestination) {
      router.push(`/${selectedDestination}`);
    }
  };

  const selected = destinations.find(d => d.slug === selectedDestination);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-white" />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(14 165 233 / 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="container-wide relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust Badge */}
          <div className="animate-fade-up mb-8">
            <Badge variant="success" className="gap-2">
              <Shield className="w-4 h-4" />
              {t('trustBadge')}
            </Badge>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up animate-delay-100 text-display-lg md:text-display-xl font-bold text-gray-900 mb-6 text-balance">
            {t('headline')}
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-up animate-delay-200 text-body-lg md:text-heading text-gray-600 mb-10 max-w-2xl mx-auto text-balance">
            {t('subheadline')}
          </p>

          {/* Destination Selector */}
          <div className="animate-fade-up animate-delay-300 max-w-md mx-auto mb-8">
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 px-6 py-4 bg-white rounded-2xl border-2 border-gray-200 hover:border-brand-500 transition-all duration-200 shadow-soft focus:outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
              >
                <span className="flex items-center gap-3">
                  {selected ? (
                    <>
                      <span className="text-2xl">{selected.flag}</span>
                      <span className="text-body-lg font-medium text-gray-900">{selected.name}</span>
                    </>
                  ) : (
                    <span className="text-body-lg text-gray-400">{t('destinationPlaceholder')}</span>
                  )}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown */}
              {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-100 shadow-soft-lg z-50 max-h-72 overflow-y-auto">
                  {destinations.map((destination) => (
                    <button
                      key={destination.slug}
                      onClick={() => handleDestinationSelect(destination.slug)}
                      className="w-full flex items-center gap-3 px-6 py-3 text-left hover:bg-brand-50 transition-colors first:rounded-t-2xl last:rounded-b-2xl"
                    >
                      <span className="text-xl">{destination.flag}</span>
                      <span className="text-body font-medium text-gray-900">{destination.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* CTA Button */}
          <div className="animate-fade-up animate-delay-400 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={handleGetStarted}
              disabled={!selectedDestination}
              className={!selectedDestination ? 'opacity-50 cursor-not-allowed' : ''}
            >
              <Zap className="w-5 h-5" />
              {t('cta')}
            </Button>
            <p className="text-body-sm text-gray-500">{t('ctaSubtext')}</p>
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
