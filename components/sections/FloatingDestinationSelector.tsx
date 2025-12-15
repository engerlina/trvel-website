'use client';

import { useEffect, useState, useRef } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useDestination } from '@/contexts/DestinationContext';
import { destinations } from './Hero';
import { cn } from '@/lib/utils';

export function FloatingDestinationSelector() {
  const { selectedDestination, setSelectedDestination, setDestinationName } = useDestination();
  const [isSticky, setIsSticky] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selected = destinations.find(d => d.slug === selectedDestination);

  useEffect(() => {
    const heroDropdown = document.getElementById('hero-destination-selector');
    const plansSection = document.getElementById('plans');
    if (!heroDropdown || !plansSection) return;

    const handleScroll = () => {
      const heroRect = heroDropdown.getBoundingClientRect();
      const plansRect = plansSection.getBoundingClientRect();
      const headerHeight = 64; // 16 * 4 = 64px header

      // Show sticky when hero dropdown scrolls above header AND plans section is still visible
      const heroScrolledPast = heroRect.bottom < headerHeight;
      const plansStillVisible = plansRect.bottom > headerHeight + 100;

      setIsSticky(heroScrolledPast && plansStillVisible);

      // Close dropdown when scrolling away from plans
      if (!plansStillVisible) {
        setIsDropdownOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
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
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="btn btn-outline w-full justify-between gap-3 px-6 py-4 h-auto bg-white rounded-2xl border-2 border-gray-200 hover:border-primary hover:bg-white transition-all duration-200 shadow-lg min-w-[300px] sm:min-w-[350px]"
          >
            <span className="flex items-center gap-3">
              {selected ? (
                <>
                  <selected.Flag className="w-7 h-auto rounded-sm" />
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
              <div className="max-h-[50vh] overflow-y-auto py-2">
                {destinations.map((destination) => (
                  <button
                    key={destination.slug}
                    onClick={() => handleSelect(destination.slug, destination.name)}
                    className={cn(
                      'w-full flex items-center gap-4 px-5 py-3 hover:bg-brand-50 transition-colors',
                      selectedDestination === destination.slug && 'bg-brand-50'
                    )}
                  >
                    <destination.Flag className="w-8 h-auto rounded-sm shadow-sm" />
                    <span className="text-body-lg font-medium text-gray-900 flex-1 text-left">
                      {destination.name}
                    </span>
                    {selectedDestination === destination.slug && (
                      <Check className="w-5 h-5 text-brand-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
