'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { ChevronDown, Shield, Zap, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { Badge } from '@/components/ui';
import { JP, TH, KR, SG, ID, MY, VN, PH, GB, FR, IT, US, type FlagComponent } from 'country-flag-icons/react/3x2';

const destinations: { name: string; slug: string; Flag: FlagComponent }[] = [
  { name: 'Japan', slug: 'japan', Flag: JP },
  { name: 'Thailand', slug: 'thailand', Flag: TH },
  { name: 'South Korea', slug: 'south-korea', Flag: KR },
  { name: 'Singapore', slug: 'singapore', Flag: SG },
  { name: 'Indonesia', slug: 'indonesia', Flag: ID },
  { name: 'Malaysia', slug: 'malaysia', Flag: MY },
  { name: 'Vietnam', slug: 'vietnam', Flag: VN },
  { name: 'Philippines', slug: 'philippines', Flag: PH },
  { name: 'United Kingdom', slug: 'united-kingdom', Flag: GB },
  { name: 'France', slug: 'france', Flag: FR },
  { name: 'Italy', slug: 'italy', Flag: IT },
  { name: 'United States', slug: 'united-states', Flag: US },
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

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
                      <selected.Flag className="w-7 h-auto rounded-sm" />
                      <span className="text-body-lg font-medium text-gray-900">{selected.name}</span>
                    </>
                  ) : (
                    <span className="text-body-lg text-gray-400">{t('destinationPlaceholder')}</span>
                  )}
                </span>
                <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Modal */}
              {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]">
                  {/* Backdrop */}
                  <div
                    className="absolute inset-0 bg-black/50 animate-fade-in"
                    onClick={() => setIsOpen(false)}
                  />
                  {/* Modal Content */}
                  <div className="relative mx-4 w-full max-w-md bg-white rounded-2xl shadow-2xl animate-fade-up max-h-[80vh] flex flex-col">
                    {/* Modal Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100">
                      <h3 className="text-heading font-semibold text-gray-900">Select destination</h3>
                      <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    {/* Destination List */}
                    <div className="overflow-y-auto flex-1 py-2">
                      {destinations.map((destination) => (
                        <button
                          key={destination.slug}
                          onClick={() => handleDestinationSelect(destination.slug)}
                          className={`w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-brand-50 transition-colors ${
                            selectedDestination === destination.slug ? 'bg-brand-50' : ''
                          }`}
                        >
                          <destination.Flag className="w-8 h-auto rounded-sm shadow-sm" />
                          <span className="text-body-lg font-medium text-gray-900">{destination.name}</span>
                          {selectedDestination === destination.slug && (
                            <span className="ml-auto text-brand-600">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
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
