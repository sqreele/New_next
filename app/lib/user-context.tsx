'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { UserProfile } from '@/app/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export interface UserContextType {
  userProfile: UserProfile | null;
  selectedProperty: string;
  setSelectedProperty: (propertyId: string) => void;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<UserProfile | null>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false); // Initialize loading as false
  const [error, setError] = useState<string | null>(null);
  const [selectedProperty, setSelectedProperty] = useState('');
  const [lastFetched, setLastFetched] = useState(0);

  const fetchUserProfile = useCallback(async () => {
    if (!session?.user?.accessToken) {
      return null; // Do not proceed if no access token
    }

    if (Date.now() - lastFetched < CACHE_DURATION && userProfile) {
      return userProfile; // Return cached profile if within cache duration
    }

    setLoading(true); // Start loading before API call
    setError(null); // Clear previous errors

    try {
      const response = await fetch(`${API_URL}/api/user-profiles/`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.user.accessToken}`,
        },
      });

      if (!response.ok) {
        const message = `Failed to fetch profile: ${response.status} ${response.statusText}`; // Include status text
        console.error('API Error:', message); // Log detailed error
        throw new Error(message);
      }

      const data = await response.json();
      const profile = Array.isArray(data) && data.length > 0 ? data[0] : null; // Safely access the profile

      if (!profile) {
        const message = 'No profile data found in API response';
        console.error('API Warning:', message); // Log warning if no profile
        throw new Error(message);
      }

      setUserProfile(profile);
      setLastFetched(Date.now());

      if (profile.properties?.[0]?.property_id && !selectedProperty) {
        setSelectedProperty(profile.properties[0].property_id);
      }

      return profile;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
      console.error('User Context Error:', errorMessage); // Log error to console
      setError(errorMessage); // Set error state for UI display
      setUserProfile(null); // Clear user profile on error
      return null;
    } finally {
      setLoading(false); // Ensure loading is set to false after API call, regardless of success or failure
    }
  }, [session?.user?.accessToken, selectedProperty, lastFetched, userProfile]);

  useEffect(() => {
    let mounted = true;

    const initializeData = async () => {
      if (status !== 'authenticated' || !mounted) {
        setLoading(false); // Ensure loading is false if not authenticated or unmounted
        return;
      }
      await fetchUserProfile(); // Fetch profile on authentication
    };

    initializeData();

    return () => {
      mounted = false; // Cleanup on unmount
    };
  }, [fetchUserProfile, status]);

  const contextValue: UserContextType = {
    userProfile,
    selectedProperty,
    setSelectedProperty,
    loading,
    error,
    refetch: fetchUserProfile,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}