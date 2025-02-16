'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { fetchProperties } from '@/app/lib/data';
import { Property } from '@/app/lib/types'; // Assuming Property type is available

interface PropertyContextType {
  selectedProperty: string | null;
  setSelectedProperty: (propertyId: string | null) => void;
  isLoading: boolean;
  error: string | null;
  properties: Property[] | null; // Add properties to the context value
  refetchProperties: () => Promise<void>; // Function to refetch properties
}

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Initialize isLoading as false
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<Property[] | null>(null); // State to hold fetched properties

  const fetchPropertiesData = useCallback(async (accessToken: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedProperties = await fetchProperties(accessToken);
      if (!fetchedProperties || !Array.isArray(fetchedProperties)) {
        const message = 'Failed to fetch properties: Invalid data format from API';
        console.error('Property Provider Error:', message);
        throw new Error(message);
      }
      setProperties(fetchedProperties);
      if (fetchedProperties.length > 0 && !selectedProperty) {
        setSelectedProperty(fetchedProperties[0].property_id);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load properties';
      console.error('Property Provider Error:', errorMessage);
      setError(errorMessage);
      setProperties(null); // Clear properties on error
    } finally {
      setIsLoading(false);
    }
  }, [selectedProperty]);

  const refetchProperties = useCallback(async () => {
    if (session?.user?.accessToken) {
      await fetchPropertiesData(session.user.accessToken);
    }
  }, [session?.user?.accessToken, fetchPropertiesData]);


  // Initialize property selection on session load
  useEffect(() => {
    const initializeProperties = async () => {
      if (!session?.user?.accessToken) {
        setIsLoading(false); // Ensure loading is false even if no session
        return;
      }
      await fetchPropertiesData(session.user.accessToken);
    };

    initializeProperties();
  }, [session?.user?.accessToken, fetchPropertiesData]); // Dependency array includes fetchPropertiesData

  const value: PropertyContextType = {
    selectedProperty,
    setSelectedProperty,
    isLoading,
    error,
    properties, // Expose properties in context
    refetchProperties, // Expose refetch function
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