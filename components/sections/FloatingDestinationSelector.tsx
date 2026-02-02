'use client';

import { useEffect, useState, useRef, useMemo } from 'react';
import { ChevronDown, Check, Globe, Search } from 'lucide-react';
import { useDestination } from '@/contexts/DestinationContext';
import { cn, isDestinationExcluded } from '@/lib/utils';
import { useLocale } from 'next-intl';
import * as Flags from 'country-flag-icons/react/3x2';

// Get flag component dynamically from country ISO code
function getFlagComponent(countryIso: string | null): React.ComponentType<React.SVGProps<SVGSVGElement>> {
  if (!countryIso) return Globe as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>;
  const code = countryIso.toUpperCase();
  const FlagComponent = (Flags as Record<string, React.ComponentType<React.SVGProps<SVGSVGElement>>>)[code];
  return FlagComponent || (Globe as unknown as React.ComponentType<React.SVGProps<SVGSVGElement>>);
}

export function FloatingDestinationSelector() {
  const locale = useLocale();
  const { selectedDestination, setSelectedDestination, setDestinationName, destinations, destinationsLoading } = useDestination();
  const [isSticky, setIsSticky] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = destinations.find(d => d.slug === selectedDestination);
  const SelectedFlag = selected ? getFlagComponent(selected.country_iso) : null;

  // Filter out home country
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

  // Group by region
  const groupedDestinations = useMemo(() => {
    const groups: Record<string, typeof filteredDestinations> = {};
    filteredDestinations.forEach(dest => {
      const region = dest.region || 'Other';
      if (!groups[region]) groups[region] = [];
      groups[region].push(dest);
    });

    const regionOrder = ['Asia', 'Europe', 'North America', 'Oceania', 'Middle East', 'South America', 'Central America', 'Caribbean', 'Africa', 'Central Asia', 'Other'];
    const sortedGroups: Record<string, typeof filteredDestinations> = {};
    regionOrder.forEach(region => {
      if (groups[region]) sortedGroups[region] = groups[region];
    });
    return sortedGroups;
  }, [filteredDestinations]);

  // Use IntersectionObserver instead of scroll + getBoundingClientRect to avoid forced reflow (Lighthouse)
  useEffect(() => {
    const heroDropdown = document.getElementById('hero-destination-selector');
    const plansSection = document.getElementById('plans');
    if (!heroDropdown || !plansSection) return;

    const headerHeight = 64;
    const rootMarginTop = `-${headerHeight}px 0px 0px 0px`;
    const rootMarginPlans = `-${headerHeight + 100}px 0px 0px 0px`;

    let heroAboveHeader = false;
    let plansVisible = true;

    const heroObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          heroAboveHeader = !entry.isIntersecting;
          setIsSticky(heroAboveHeader && plansVisible);
        });
      },
      { rootMargin: rootMarginTop, threshold: 0 }
    );

    const plansObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          plansVisible = entry.isIntersecting;
          setIsSticky(heroAboveHeader && plansVisible);
          if (!plansVisible) setIsDropdownOpen(false);
        });
      },
      { rootMargin: rootMarginPlans, threshold: 0 }
    );

    heroObserver.observe(heroDropdown);
    plansObserver.observe(plansSection);
    return () => {
      heroObserver.disconnect();
      plansObserver.disconnect();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (slug: string, name: string) => {
    setSelectedDestination(slug);
    setDestinationName(name);
    setIsDropdownOpen(false);
  };

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-40 transition-all duration-200 ease-out',
        'top-16', // Below header
        isSticky
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-4 pointer-events-none'
      )}
    >
      <div className="flex justify-center py-3">
        {/* Dropdown - matches Hero dropdown styling exactly */}
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => {
              setIsDropdownOpen(!isDropdownOpen);
              if (!isDropdownOpen) setSearchQuery('');
            }}
            className="btn btn-outline w-full justify-between gap-3 px-6 py-4 h-auto bg-white rounded-2xl border-2 border-gray-200 hover:border-primary hover:bg-white transition-all duration-200 shadow-lg min-w-[300px] sm:min-w-[350px]"
          >
            <span className="flex items-center gap-3">
              {selected && SelectedFlag ? (
                <>
                  <SelectedFlag className="w-7 h-auto rounded-sm" />
                  <span className="text-body-lg font-medium text-gray-900">{selected.name}</span>
                </>
              ) : (
                <span className="text-body-lg text-gray-400 font-normal">Where are you going?</span>
              )}
            </span>
            <ChevronDown
              className={cn(
                'w-5 h-5 text-gray-400 transition-transform duration-200',
                isDropdownOpen && 'rotate-180'
              )}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden z-50">
              {/* Search Input */}
              <div className="p-3 border-b border-cream-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-cream-50 border border-cream-200 rounded-lg text-sm text-navy-500 placeholder:text-navy-300 focus:outline-none focus:border-brand-400"
                    autoFocus
                  />
                </div>
              </div>

              <div className="max-h-[50vh] overflow-y-auto">
                {destinationsLoading ? (
                  <div className="p-6 text-center text-gray-400">
                    <div className="animate-spin w-5 h-5 border-2 border-brand-400 border-t-transparent rounded-full mx-auto mb-2" />
                    Loading...
                  </div>
                ) : filteredDestinations.length === 0 ? (
                  <div className="p-6 text-center text-gray-400 text-sm">
                    No destinations found
                  </div>
                ) : (
                  Object.entries(groupedDestinations).map(([region, dests]) => (
                    <div key={region}>
                      {/* Region Header */}
                      <div className="sticky top-0 bg-cream-100 px-4 py-2 border-b border-cream-200">
                        <span className="text-xs font-semibold text-navy-400 uppercase tracking-wide">{region}</span>
                      </div>
                      {dests.map((destination) => {
                        const FlagComponent = getFlagComponent(destination.country_iso);
                        return (
                          <button
                            key={destination.slug}
                            onClick={() => handleSelect(destination.slug, destination.name)}
                            className={cn(
                              'w-full flex items-center gap-4 px-5 py-3 hover:bg-brand-50 transition-colors',
                              selectedDestination === destination.slug && 'bg-brand-50'
                            )}
                          >
                            <FlagComponent className="w-7 h-auto rounded-sm shadow-sm" />
                            <span className="text-sm font-medium text-gray-900 flex-1 text-left">
                              {destination.name}
                            </span>
                            {selectedDestination === destination.slug && (
                              <Check className="w-5 h-5 text-brand-600" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              {!destinationsLoading && filteredDestinations.length > 0 && (
                <div className="px-4 py-2 border-t border-cream-200 bg-cream-50 text-center">
                  <span className="text-xs text-navy-400">
                    {filteredDestinations.length} destinations available
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
