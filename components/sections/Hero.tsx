'use client';

import { useRef, useMemo, useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { ChevronDown, Shield, Check, Info, Globe, Search } from 'lucide-react';
import { Badge } from '@/components/ui';
import * as Flags from 'country-flag-icons/react/3x2';
import { useDestination } from '@/contexts/DestinationContext';
import { useTypewriter } from '@/hooks/useTypewriter';
import { cn, isDestinationExcluded } from '@/lib/utils';

interface Destination {
  id: string;
  name: string;
  slug: string;
  country_iso: string | null;
  region: string | null;
}

// Get flag component dynamically from country ISO code
function getFlagComponent(countryIso: string | null): React.ComponentType<React.SVGProps<SVGSVGElement>> {
  if (!countryIso) return Globe as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>;
  const code = countryIso.toUpperCase();
  const FlagComponent = (Flags as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[code];
  return FlagComponent || (Globe as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>);
}

// Popular destinations for typewriter effect (shown while loading full list)
const POPULAR_DESTINATIONS = ['Japan', 'Thailand', 'South Korea', 'Singapore', 'Indonesia', 'France', 'Italy'];

export function Hero() {
  const t = useTranslations('home.hero');
  const locale = useLocale();
  const { selectedDestination, setSelectedDestination, setDestinationName, setCyclingIndex, highlightPlansDropdown } = useDestination();
  const modalRef = useRef<HTMLDialogElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Dynamic destinations from API
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch destinations on mount
  useEffect(() => {
    async function fetchDestinations() {
      try {
        const response = await fetch(`/api/destinations?locale=${locale}`);
        if (response.ok) {
          const data = await response.json();
          setDestinations(data);
        }
      } catch (error) {
        console.error('Failed to fetch destinations:', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDestinations();
  }, [locale]);

  // Filter out the user's home country destination
  const availableDestinations = useMemo(
    () => destinations.filter(d => !isDestinationExcluded(d.slug, locale)),
    [destinations, locale]
  );

  // Filter by search query
  const filteredDestinations = useMemo(() => {
    if (!searchQuery.trim()) return availableDestinations;
    const query = searchQuery.toLowerCase();
    return availableDestinations.filter(d =>
      d.name.toLowerCase().includes(query) ||
      d.region?.toLowerCase().includes(query)
    );
  }, [availableDestinations, searchQuery]);

  // Group destinations by region for modal display
  const groupedDestinations = useMemo(() => {
    const groups: Record<string, Destination[]> = {};
    filteredDestinations.forEach(dest => {
      const region = dest.region || 'Other';
      if (!groups[region]) groups[region] = [];
      groups[region].push(dest);
    });

    // Sort regions by popularity
    const regionOrder = ['Asia', 'Europe', 'North America', 'Oceania', 'Middle East', 'South America', 'Central America', 'Caribbean', 'Africa', 'Central Asia', 'Other'];
    const sortedGroups: Record<string, Destination[]> = {};
    regionOrder.forEach(region => {
      if (groups[region]) sortedGroups[region] = groups[region];
    });
    return sortedGroups;
  }, [filteredDestinations]);

  // Get destination names for typewriter effect
  const destinationNames = useMemo(() => {
    if (availableDestinations.length > 0) {
      // Use top popular destinations that exist in our list
      return availableDestinations.slice(0, 7).map(d => d.name);
    }
    return POPULAR_DESTINATIONS;
  }, [availableDestinations]);

  const { text: typedDestination, wordIndex } = useTypewriter({
    words: destinationNames,
    typeSpeed: 80,
    deleteSpeed: 40,
    delayAfterType: 2500,
    delayBetweenWords: 300,
  });

  // Share the cycling index with context
  useEffect(() => {
    setCyclingIndex(wordIndex);
  }, [wordIndex, setCyclingIndex]);

  // Get current flag component
  const currentDest = availableDestinations[wordIndex];
  const CurrentFlag = currentDest ? getFlagComponent(currentDest.country_iso) : null;

  const openModal = () => {
    setSearchQuery('');
    modalRef.current?.showModal();
  };
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
  const SelectedFlag = selected ? getFlagComponent(selected.country_iso) : null;

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
                {selected && SelectedFlag ? (
                  <>
                    <SelectedFlag className="w-7 h-auto rounded-sm" />
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
        <div className="modal-box max-w-md p-0 rounded-2xl overflow-hidden">
          {/* Modal Header with Search */}
          <div className="px-5 py-4 border-b border-cream-300">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-navy-500">Select destination</h3>
              <form method="dialog">
                <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-cream-200 transition-colors text-navy-200 hover:text-navy-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </form>
            </div>
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-cream-50 border border-cream-200 rounded-lg text-sm text-navy-500 placeholder:text-navy-300 focus:outline-none focus:border-brand-400"
              />
            </div>
          </div>

          {/* Destination List */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="p-8 text-center text-navy-300">
                <div className="animate-spin w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full mx-auto mb-2" />
                Loading destinations...
              </div>
            ) : filteredDestinations.length === 0 ? (
              <div className="p-8 text-center text-navy-300">
                No destinations found matching &quot;{searchQuery}&quot;
              </div>
            ) : (
              Object.entries(groupedDestinations).map(([region, dests]) => (
                <div key={region}>
                  {/* Region Header */}
                  <div className="sticky top-0 bg-cream-100 px-5 py-2 border-b border-cream-200">
                    <span className="text-xs font-semibold text-navy-400 uppercase tracking-wide">{region}</span>
                  </div>
                  {/* Destinations in Region */}
                  {dests.map((destination) => {
                    const isExcluded = isDestinationExcluded(destination.slug, locale);
                    const FlagComponent = getFlagComponent(destination.country_iso);

                    return (
                      <div key={destination.slug} className="relative group">
                        <button
                          onClick={() => !isExcluded && handleDestinationSelect(destination.slug, destination.name)}
                          disabled={isExcluded}
                          className={cn(
                            'w-full flex items-center gap-4 px-5 py-3 transition-colors text-left',
                            isExcluded
                              ? 'bg-gray-50 cursor-not-allowed opacity-50'
                              : 'hover:bg-cream-100',
                            !isExcluded && selectedDestination === destination.slug
                              ? 'bg-cream-200'
                              : !isExcluded && 'bg-white'
                          )}
                        >
                          <FlagComponent className={cn(
                            'w-7 h-auto rounded shadow-sm flex-shrink-0',
                            isExcluded && 'grayscale'
                          )} />
                          <span className={cn(
                            'text-sm font-medium flex-1',
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
              ))
            )}
          </div>

          {/* Footer with count */}
          {!isLoading && filteredDestinations.length > 0 && (
            <div className="px-5 py-3 border-t border-cream-200 bg-cream-50 text-center">
              <span className="text-xs text-navy-400">
                {filteredDestinations.length} destinations available
              </span>
            </div>
          )}
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
