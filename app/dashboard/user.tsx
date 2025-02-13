'use client';

import React from 'react';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { User2, Settings, UserCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/app/components/ui/dropdown-menu';
import { useUser } from '@/app/lib/user-context';

export function User() {
  const { userProfile, loading } = useUser();

  if (loading) {
    return (
      <Button variant="ghost" size="icon" className="w-8 h-8">
        <div className="animate-pulse rounded-full bg-muted w-full h-full" />
      </Button>
    );
  }

  if (!userProfile) {
    return (
      <Button variant="ghost" asChild>
        <Link href="/auth/signin">Sign In</Link>
      </Button>
    );
  }

  const profileImage = userProfile.profile_image || null;
  const displayName = userProfile.username;

  const handleSignOut = async () => {
    try {
      await signOut({ callbackUrl: '/auth/signin' });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button 
        variant="ghost" 
        size="icon" 
        className="relative h-8 w-8 rounded-full ring-2 ring-offset-2 ring-offset-background hover:ring-primary/80 transition-all"
      >
        {profileImage ? (
          <Image
            src={profileImage}
            alt={`${displayName}'s profile`}
            width={32}
            height={32}
            className="rounded-full object-cover"
            priority
          />
        ) : (
          <User2 className="h-5 w-5" />
        )}
        <span className="sr-only">Open user menu</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-56 bg-white dark:bg-gray-800">
      <DropdownMenuLabel className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col space-y-1">
          <p className="text-sm font-medium leading-none">{displayName}</p>
          {typeof userProfile.email !== 'undefined' && userProfile.email !== null && (
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile.email}
            </p>
          )}
          {userProfile.positions && (
            <p className="text-xs leading-none text-muted-foreground">
              {userProfile.positions}
            </p>
          )}
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-gray-700">
        <Link href="/dashboard/profile" className="flex items-center">
          <UserCircle className="mr-2 h-4 w-4" />
          Profile
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-gray-700">
        <Link href="/dashboard/myJobs" className="flex items-center">
          <Settings className="mr-2 h-4 w-4" />
         myjobs
        </Link>
      </DropdownMenuItem>
      <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-gray-700">
        <Link href="/settings" className="flex items-center">
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </Link>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        onClick={handleSignOut}
        className="text-red-600 cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 focus:text-red-600 focus:bg-red-50"
      >
        Sign out
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
  );
}

export default User;