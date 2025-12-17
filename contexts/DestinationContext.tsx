'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useLocale } from 'next-intl';

// Plan prices for a destination
export interface PlanPrices {
  price_5day: number | null;
  price_7day: number | null;
  price_15day: number | null;
  currency: string;
  competitor_name: string | null;
  competitor_daily_rate: number | null;
}

// All plans keyed by destination slug
export type PlansMap = Record<string, PlanPrices>;

// Destination type from API
export interface Destination {
  id: string;
  name: string;
  slug: string;
  country_iso: string | null;
  region: string | null;
}

interface DestinationContextType {
  selectedDestination: string;
  setSelectedDestination: (slug: string) => void;
  destinationName: string;
  setDestinationName: (name: string) => void;
  // Cycling index from Hero typewriter (for syncing Plans)
  cyclingIndex: number;
  setCyclingIndex: (index: number) => void;
  // Plans data fetched from API
  plansMap: PlansMap;
  setPlansMap: (plans: PlansMap) => void;
  plansLoading: boolean;
  setPlansLoading: (loading: boolean) => void;
  // Destinations data fetched from API
  destinations: Destination[];
  destinationsLoading: boolean;
  // Highlight the plans dropdown when user tries to checkout without selecting destination
  highlightPlansDropdown: boolean;
  triggerPlansDropdownHighlight: () => void;
}

const DestinationContext = createContext<DestinationContextType | undefined>(undefined);

export function DestinationProvider({ children }: { children: ReactNode }) {
  const locale = useLocale();
  const [selectedDestination, setSelectedDestination] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [cyclingIndex, setCyclingIndex] = useState(0);
  const [plansMap, setPlansMap] = useState<PlansMap>({});
  const [plansLoading, setPlansLoading] = useState(true);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [destinationsLoading, setDestinationsLoading] = useState(true);
  const [highlightPlansDropdown, setHighlightPlansDropdown] = useState(false);

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
        setDestinationsLoading(false);
      }
    }
    fetchDestinations();
  }, [locale]);

  const triggerPlansDropdownHighlight = useCallback(() => {
    // Scroll to the Hero dropdown so user can see the highlight
    const heroDropdown = document.getElementById('hero-destination-selector');
    if (heroDropdown) {
      heroDropdown.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    // Slight delay to let scroll happen before showing highlight
    setTimeout(() => {
      setHighlightPlansDropdown(true);
      setTimeout(() => setHighlightPlansDropdown(false), 3000);
    }, 300);
  }, []);

  return (
    <DestinationContext.Provider value={{
      selectedDestination,
      setSelectedDestination,
      destinationName,
      setDestinationName,
      cyclingIndex,
      setCyclingIndex,
      plansMap,
      setPlansMap,
      plansLoading,
      setPlansLoading,
      destinations,
      destinationsLoading,
      highlightPlansDropdown,
      triggerPlansDropdownHighlight,
    }}>
      {children}
    </DestinationContext.Provider>
  );
}

export function useDestination() {
  const context = useContext(DestinationContext);
  if (!context) {
    throw new Error('useDestination must be used within a DestinationProvider');
  }
  return context;
}
