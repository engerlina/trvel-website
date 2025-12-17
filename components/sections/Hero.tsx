'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDown, Shield, Check, Info } from 'lucide-react';
import { Badge } from '@/components/ui';
import { JP, TH, KR, SG, ID, MY, VN, PH, GB, FR, IT, US, type FlagComponent } from 'country-flag-icons/react/3x2';
import { useDestination } from '@/contexts/DestinationContext';
import { useTypewriter } from '@/hooks/useTypewriter';
import { cn, isDestinationExcluded } from '@/lib/utils';

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
  const locale = useLocale();
  const { selectedDestination, setSelectedDestination, setDestinationName, setCyclingIndex, highlightPlansDropdown } = useDestination();
  const modalRef = useRef<HTMLDialogElement>(null);

  // Filter out the user's home country destination for the typewriter
  const availableDestinations = useMemo(
    () => destinations.filter(d => !isDestinationExcluded(d.slug, locale)),
    [locale]
  );

  // Get destination names for typewriter effect (excluding home country)
  const destinationNames = useMemo(() => availableDestinations.map(d => d.name), [availableDestinations]);
  const { text: typedDestination, wordIndex } = useTypewriter({
    words: destinationNames,
    typeSpeed: 80,
    deleteSpeed: 40,
    delayAfterType: 2500,
    delayBetweenWords: 300,
  });

  // Share the cycling index with context so Plans section can sync
  // Map to the full destinations array index for consistency
  useEffect(() => {
    const currentDest = availableDestinations[wordIndex];
    if (currentDest) {
      const fullIndex = destinations.findIndex(d => d.slug === currentDest.slug);
      setCyclingIndex(fullIndex >= 0 ? fullIndex : wordIndex);
    }
  }, [wordIndex, availableDestinations, setCyclingIndex]);

  // Get current flag component from available destinations
  const CurrentFlag = availableDestinations[wordIndex]?.Flag;

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
      {/* Background gradient - cream to white */}
      <div className="absolute inset-0 bg-gradient-to-b from-cream-300 via-cream-50 to-white" />

      {/* Subtle pattern overlay - teal dots */}
      <div className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 191 191 / 0.3) 1px, transparent 0)`,
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

          {/* Headline with Typewriter Effect */}
          <h1 id="hero-heading" className="animate-fade-up animate-delay-100 text-display-lg md:text-display-xl font-bold text-navy-500 mb-6">
            <span className="block">Travelling to</span>
            <span className="flex items-center justify-center gap-4">
              <span className="text-brand-400">{typedDestination}</span>
              <span className="animate-blink text-brand-400 font-light">|</span>
              {CurrentFlag && typedDestination && (
                <CurrentFlag className="w-12 h-auto rounded shadow-sm inline-block" />
              )}
            </span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-up animate-delay-200 text-body-lg md:text-heading text-navy-300 mb-10 max-w-2xl mx-auto text-balance">
            {t('subheadline')}
          </p>

          {/* Destination Selector */}
          <div id="hero-destination-selector" className="animate-fade-up animate-delay-300 max-w-md mx-auto mb-8 relative">
            <button
              onClick={openModal}
              className={cn(
                "btn btn-outline w-full justify-between gap-3 px-6 py-4 h-auto bg-white rounded-2xl border-2 transition-all duration-200 shadow-soft",
                highlightPlansDropdown
                  ? "border-accent-500 ring-4 ring-accent-200 animate-shake"
                  : "border-cream-400 hover:border-brand-400 hover:bg-white"
              )}
            >
              <span className="flex items-center gap-3">
                {selected ? (
                  <>
                    <selected.Flag className="w-7 h-auto rounded-sm" />
                    <span className="text-body-lg font-medium text-navy-500">{selected.name}</span>
                  </>
                ) : (
                  <span className={cn(
                    "text-body-lg font-normal",
                    highlightPlansDropdown ? "text-accent-600 font-medium" : "text-navy-200"
                  )}>{t('destinationPlaceholder')}</span>
                )}
              </span>
              <ChevronDown className={cn("w-5 h-5", highlightPlansDropdown ? "text-accent-500" : "text-navy-200")} />
            </button>
            {/* Tooltip when highlighted */}
            {highlightPlansDropdown && (
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap animate-fade-up z-20">
                <div className="bg-navy-500 text-white text-sm px-4 py-2 rounded-lg shadow-lg">
                  Please select your travel destination first
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-navy-500 rotate-45" />
                </div>
              </div>
            )}
          </div>

          {/* Helper Text */}
          <div className="animate-fade-up animate-delay-400">
            <p className="text-body-sm text-navy-200">{t('ctaSubtext')}</p>
          </div>
        </div>
      </div>

      {/* Modal */}
      <dialog ref={modalRef} className="modal modal-bottom sm:modal-middle">
        <div className="modal-box max-w-sm p-0 rounded-2xl overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-cream-300">
            <h3 className="text-lg font-semibold text-navy-500">Select destination</h3>
            <form method="dialog">
              <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-200 transition-colors text-navy-200 hover:text-navy-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </form>
          </div>

          {/* Destination List */}
          <div className="max-h-[60vh] overflow-y-auto">
            {destinations.map((destination) => {
              const isExcluded = isDestinationExcluded(destination.slug, locale);

              return (
                <div key={destination.slug} className="relative group">
                  <button
                    onClick={() => !isExcluded && handleDestinationSelect(destination.slug, destination.name)}
                    disabled={isExcluded}
                    className={cn(
                      'w-full flex items-center gap-4 px-5 py-3.5 transition-colors text-left',
                      isExcluded
                        ? 'bg-gray-50 cursor-not-allowed opacity-50'
                        : 'hover:bg-cream-100',
                      !isExcluded && selectedDestination === destination.slug
                        ? 'bg-cream-200'
                        : !isExcluded && 'bg-white'
                    )}
                  >
                    <destination.Flag className={cn(
                      'w-8 h-auto rounded shadow-sm flex-shrink-0',
                      isExcluded && 'grayscale'
                    )} />
                    <span className={cn(
                      'text-base font-medium flex-1',
                      isExcluded ? 'text-gray-400' : 'text-navy-500'
                    )}>
                      {destination.name}
                    </span>
                    {isExcluded ? (
                      <Info className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    ) : selectedDestination === destination.slug ? (
                      <Check className="w-5 h-5 text-brand-400 flex-shrink-0" />
                    ) : null}
                  </button>
                  {/* Tooltip for excluded destinations */}
                  {isExcluded && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                      <div className="bg-navy-500 text-white text-xs px-3 py-2 rounded-lg shadow-lg whitespace-nowrap -translate-x-8">
                        You&apos;re already here!
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
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
