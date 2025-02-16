'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Button } from "@/app/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/app/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";

interface Room {
  room_id: number;
  name: string;
  room_type: string;
  is_active: boolean;
  created_at: string;
  property: number;
  properties: (string | number)[];
}

interface RoomAutocompleteProps {
  selectedRoom: Room;
  rooms: Room[];
  onSelect: (room: Room) => void;
  disabled?: boolean;
}

export default function RoomAutocomplete({ 
  selectedRoom, 
  rooms, 
  onSelect,
  disabled = false 
}: RoomAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>(rooms);

  // Debug logging
  useEffect(() => {
    console.log('RoomAutocomplete received rooms:', rooms);
    console.log('RoomAutocomplete selected room:', selectedRoom);
  }, [rooms, selectedRoom]);

  const handleSelect = useCallback((currentRoom: Room) => {
    console.log('Selected room:', currentRoom);
    onSelect(currentRoom);
    setOpen(false);
  }, [onSelect]);

  const handleSearch = useCallback((search: string) => {
    const filtered = rooms.filter(room => 
      room.name.toLowerCase().includes(search.toLowerCase()) ||
      room.room_type.toLowerCase().includes(search.toLowerCase())
    );
    console.log('Filtered rooms:', filtered);
    setFilteredRooms(filtered);
  }, [rooms]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedRoom?.name || "Select room..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput 
            placeholder="Search rooms..." 
            onValueChange={handleSearch}
          />
          <CommandEmpty>No room found.</CommandEmpty>
          <CommandGroup className="max-h-60 overflow-y-auto">
            {filteredRooms.map((room) => (
              <CommandItem
                key={room.room_id}
                value={room.name}
                onSelect={() => handleSelect(room)}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedRoom?.room_id === room.room_id ? "opacity-100" : "opacity-0"
                  )}
                />
                <div>
                  <div>{room.name}</div>
                  <div className="text-sm text-gray-500">{room.room_type}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}