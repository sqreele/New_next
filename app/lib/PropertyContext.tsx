'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { fetchProperties } from '@/app/lib/data';

interface PropertyContextType {
  selectedProperty: string | null;
  setSelectedProperty: (propertyId: string | null) => void;
  isLoading: boolean;
  error: string | null;
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize property selection on session load
  React.useEffect(() => {
    const initializeProperties = async () => {
      if (!session?.user?.accessToken) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const properties = await fetchProperties(session.user.accessToken);
        
        if (properties.length > 0 && !selectedProperty) {
          setSelectedProperty(properties[0].property_id);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error initializing properties:', err);
        setError('Failed to load properties');
      } finally {
        setIsLoading(false);
      }
    };

    initializeProperties();
  }, [session?.user?.accessToken, selectedProperty]);

  const value = {
    selectedProperty,
    setSelectedProperty,
    isLoading,
    error
  };

  return (
    <PropertyContext.Provider value={value}>
      {children}
    </PropertyContext.Provider>
  );
};

export const useProperty = (): PropertyContextType => {
  const context = useContext(PropertyContext);
  if (!context) {
    throw new Error('useProperty must be used within a PropertyProvider');
  }
  return context;
};