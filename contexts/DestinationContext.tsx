'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

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
}

const DestinationContext = createContext<DestinationContextType | undefined>(undefined);

export function DestinationProvider({ children }: { children: ReactNode }) {
  const [selectedDestination, setSelectedDestination] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [cyclingIndex, setCyclingIndex] = useState(0);
  const [plansMap, setPlansMap] = useState<PlansMap>({});
  const [plansLoading, setPlansLoading] = useState(true);

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
