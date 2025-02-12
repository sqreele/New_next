'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Building2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/app/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/app/components/ui/select';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { fetchProperties } from '@/app/lib/data';
import { Property } from '@/app/lib/types';
import { Room } from '@/app/lib/types';
import { useProperty } from '@/app/lib/PropertyContext';

const HeaderPropertyList: React.FC = () => {
  const { selectedProperty, setSelectedProperty } = useProperty(); // Use PropertyContext
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProperties = async () => {
      try {
        const data = await fetchProperties();
        setProperties(data);

        if (data.length > 0 && !selectedProperty) {
          setSelectedProperty(data[0].property_id); // Set the first property as default
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError('Failed to load properties. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [selectedProperty, setSelectedProperty]);

  const handlePropertyChange = (value: string) => {
    setSelectedProperty(value);
  };

  const getRoomTypeCounts = (rooms: Room[]) => {
    return rooms.reduce((acc, room) => {
      acc[room.room_type] = (acc[room.room_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const sortedProperties = useMemo(
    () => [...properties].sort((a, b) => a.name.localeCompare(b.name)),
    [properties]
  );

  if (loading) {
    return (
      <div className="flex items-center">
        <Button variant="ghost" disabled className="w-[180px] gap-2">
          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Loading
        </Button>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-sm">{error}</div>;
  }

  const renderPropertySelector = () => {
    if (!sortedProperties.length) {
      return <span className="text-gray-500">No properties available</span>;
    }

    return (
      <Select
        value={selectedProperty || ''}
        onValueChange={handlePropertyChange}
        aria-label="Select property"
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Property">
            {sortedProperties.find((p) => p.property_id === selectedProperty)?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {sortedProperties.map((property) => {
            const roomTypeCounts = getRoomTypeCounts(property.rooms);
            return (
              <SelectItem
                key={property.property_id}
                value={property.property_id}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{property.name}</span>
                  <div className="flex flex-col gap-0.5">
                    
                   
                  </div>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    );
  };

  return (
    <div className="flex items-center">
      <div className="hidden lg:block">{renderPropertySelector()}</div>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Select property">
            <Building2 className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-[300px]">
          <SheetHeader>
            <SheetTitle>Properties</SheetTitle>
          </SheetHeader>
          <div className="py-4">{renderPropertySelector()}</div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default HeaderPropertyList;
