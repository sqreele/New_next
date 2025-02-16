'use client';

import React, { useState } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/app/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Button } from "@/app/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface Room {
  room_id: number;
  name: string;
  room_type: string;
  properties: string[];
}

interface RoomAutocompleteProps {
  selectedRoom: Room;
  onSelect: (room: Room) => void;
  rooms?: Room[];
  disabled?: boolean;
  placeholder?: string;
}

export default function RoomAutocomplete({
  selectedRoom,
  onSelect,
  rooms = [],
  disabled = false,
  placeholder = "Select room..."
}: RoomAutocompleteProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRooms = rooms.filter((room) =>
    room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.room_type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between",
            !selectedRoom?.name && "text-muted-foreground"
          )}
        >
          {selectedRoom?.name 
            ? `${selectedRoom.name} - ${selectedRoom.room_type}` 
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search rooms..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty>No rooms found</CommandEmpty>
            <CommandGroup>
              {filteredRooms.map((room) => (
                <CommandItem
                  key={room.room_id}
                  value={room.name}
                  onSelect={() => {
                    onSelect(room);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedRoom?.room_id === room.room_id 
                        ? "opacity-100" 
                        : "opacity-0"
                    )}
                  />
                  <span>{room.name}</span>
                  <span className="ml-2 text-muted-foreground">
                    - {room.room_type}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}