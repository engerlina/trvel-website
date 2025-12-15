'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface DestinationContextType {
  selectedDestination: string;
  setSelectedDestination: (slug: string) => void;
  destinationName: string;
  setDestinationName: (name: string) => void;
}

const DestinationContext = createContext<DestinationContextType | undefined>(undefined);

export function DestinationProvider({ children }: { children: ReactNode }) {
  const [selectedDestination, setSelectedDestination] = useState('');
  const [destinationName, setDestinationName] = useState('');

  return (
    <DestinationContext.Provider value={{
      selectedDestination,
      setSelectedDestination,
      destinationName,
      setDestinationName
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
