"use client";

import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/app/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { Button } from "@/app/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { useUser } from '@/app/lib/user-context';
import { Room } from '@/app/lib/types';




interface RoomAutocompleteProps {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelect: (room: Room) => void;
}

const RoomAutocomplete = ({ rooms, selectedRoom, onSelect }: RoomAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { userProfile } = useUser();

  // Debug logging
  useEffect(() => {
 
  }, [userProfile, rooms]);

  const filteredRooms = rooms.filter((room) => {
    // First filter: Check if room belongs to user's property
    if (!userProfile?.properties[0]?.users) return false;

    const isUserProperty = room.properties.some(propId => 
      userProfile.properties[0].users.includes(propId)
    );

    if (!isUserProperty) return false;

    // Second filter: Apply search query if it exists
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      room.name.toLowerCase().includes(search) ||
      room.room_type.toLowerCase().includes(search)
    );
  });

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            !selectedRoom?.name && "text-muted-foreground"
          )}
        >
          {selectedRoom?.name ? 
            `${selectedRoom.name} - ${selectedRoom.room_type}` : 
            "Select room..."
          }
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Search room..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
            className="h-9"
          />
          <CommandList>
            <CommandEmpty className="py-2 px-4 text-sm">
              {rooms.length === 0 ? (
                "No rooms available."
              ) : filteredRooms.length === 0 ? (
                `No rooms found for ${userProfile?.properties[0]?.name}`
              ) : (
                "No matching rooms found."
              )}
            </CommandEmpty>
            <CommandGroup className="max-h-60 overflow-y-auto">
                {filteredRooms.map((room) => (
                  <CommandItem
                    key={room.room_id}
                    value={room.name}
                    onSelect={() => {
                      onSelect(room);
                      setSearchQuery("");
                      setOpen(false);
                    }}
                    className={cn(
                      "flex items-center justify-between px-4 py-2",
                      "bg-black text-white hover:bg-gray-800",
                      selectedRoom?.room_id === room.room_id ? "bg-gray-800" : ""
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Check
                        className={cn(
                          "h-4 w-4",
                          selectedRoom?.room_id === room.room_id ? "opacity-100" : "opacity-0",
                          "text-white" // Make check icon white
                        )}
                      />
                      <span className="font-medium text-white">{room.name}</span>
                      <span className="text-gray-300">- {room.room_type}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default RoomAutocomplete;