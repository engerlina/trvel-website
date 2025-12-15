'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, Shield, Check } from 'lucide-react';
import { Badge } from '@/components/ui';
import { JP, TH, KR, SG, ID, MY, VN, PH, GB, FR, IT, US, type FlagComponent } from 'country-flag-icons/react/3x2';
import { useDestination } from '@/contexts/DestinationContext';
import { cn } from '@/lib/utils';

export const destinations: { name: string; slug: string; Flag: FlagComponent }[] = [
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
  const { selectedDestination, setSelectedDestination, setDestinationName } = useDestination();
  const modalRef = useRef<HTMLDialogElement>(null);

  const openModal = () => modalRef.current?.showModal();
  const closeModal = () => modalRef.current?.close();

  const handleDestinationSelect = (slug: string, name: string) => {
    setSelectedDestination(slug);
    setDestinationName(name);
    closeModal();

    // Smooth scroll to plans section after a brief delay for modal to close
    setTimeout(() => {
      const plansSection = document.getElementById('plans');
      if (plansSection) {
        plansSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 150);
  };

  const selected = destinations.find(d => d.slug === selectedDestination);

  return (
    <section aria-labelledby="hero-heading" className="relative min-h-[90vh] flex items-center overflow-hidden">
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
          <h1 id="hero-heading" className="animate-fade-up animate-delay-100 text-display-lg md:text-display-xl font-bold text-gray-900 mb-6 text-balance">
            {t('headline')}
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-up animate-delay-200 text-body-lg md:text-heading text-gray-600 mb-10 max-w-2xl mx-auto text-balance">
            {t('subheadline')}
          </p>

          {/* Destination Selector */}
          <div id="hero-destination-selector" className="animate-fade-up animate-delay-300 max-w-md mx-auto mb-8">
            <button
              onClick={openModal}
              className="btn btn-outline w-full justify-between gap-3 px-6 py-4 h-auto bg-white rounded-2xl border-2 border-gray-200 hover:border-primary hover:bg-white transition-all duration-200 shadow-soft"
            >
              <span className="flex items-center gap-3">
                {selected ? (
                  <>
                    <selected.Flag className="w-7 h-auto rounded-sm" />
                    <span className="text-body-lg font-medium text-gray-900">{selected.name}</span>
                  </>
                ) : (
                  <span className="text-body-lg text-gray-400 font-normal">{t('destinationPlaceholder')}</span>
                )}
              </span>
              <ChevronDown className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Helper Text */}
          <div className="animate-fade-up animate-delay-400">
            <p className="text-body-sm text-gray-500">{t('ctaSubtext')}</p>
          </div>
        </div>
      </div>

      {/* DaisyUI Modal */}
      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-w-md p-0">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b border-base-200">
            <h3 className="text-heading font-semibold">Select destination</h3>
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost">✕</button>
            </form>
          </div>
          {/* Destination List */}
          <ul className="menu p-2 max-h-[60vh] overflow-y-auto">
            {destinations.map((destination) => (
              <li key={destination.slug}>
                <button
                  onClick={() => handleDestinationSelect(destination.slug, destination.name)}
                  className={cn(
                    'flex items-center gap-4 py-3',
                    selectedDestination === destination.slug && 'active'
                  )}
                >
                  <destination.Flag className="w-8 h-auto rounded-sm shadow-sm" />
                  <span className="text-body-lg font-medium flex-1">{destination.name}</span>
                  {selectedDestination === destination.slug && (
                    <Check className="w-5 h-5 text-primary" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}
