// app/components/User.tsx
'use client';

import React, { useCallback } from 'react'; // Import useCallback
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { User2, Settings, UserCircle, BriefcaseIcon } from 'lucide-react';
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

// Debug logger
const debugLog = (action: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 👤 User Component - ${action}:`, data);
  }
};

export function User() {
  const { data: session } = useSession();
  const { userProfile, loading } = useUser();

  // Debug user state
  debugLog('Component State', {
    hasSession: !!session,
    hasProfile: !!userProfile,
    loading,
    timestamp: new Date().toISOString()
  });

  if (loading) {
    debugLog('Loading State', { timestamp: new Date().toISOString() });
    return (
      <Button variant="ghost" size="icon" className="w-8 h-8">
        <div className="animate-pulse rounded-full bg-muted w-full h-full" />
      </Button>
    );
  }

  if (!session?.user) {
    debugLog('Unauthenticated State', { timestamp: new Date().toISOString() });
    return (
      <Button variant="ghost" asChild>
        <Link href="/auth/signin">Sign In</Link>
      </Button>
    );
  }

  const profileImage = session.user.profile_image || userProfile?.profile_image || null;  // Safe chaining here.  userProfile could be undefined
  const displayName = session.user.username || userProfile?.username;          // And here
  const userEmail = session.user.email || userProfile?.email;                  // And here
  const userPosition = session.user.positions || userProfile?.positions;          // and here

  debugLog('User Data', {
    profileImage: !!profileImage,
    displayName,
    hasEmail: !!userEmail,
    hasPosition: !!userPosition,
  });

    // Use useCallback for handleSignOut for stability and prevent re-renders
    const handleSignOut = useCallback(async () => {
        try {
            debugLog('SignOut Started', { timestamp: new Date().toISOString() });

            // Clear any stored tokens - Not usually needed with NextAuth's default setup
            // localStorage.removeItem('accessToken');
            // localStorage.removeItem('refreshToken');

            await signOut({
                callbackUrl: '/auth/signin',
                redirect: true
            });

            debugLog('SignOut Completed', {
                redirectTo: '/auth/signin',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'; //Safely unwrap
            debugLog('SignOut Error', {
                error: errorMessage,
                timestamp: new Date().toISOString()
            });
            console.error('Error signing out:', error);
        }
    }, []); // Corrected dependency array: []

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
            {userEmail && (
              <p className="text-xs leading-none text-muted-foreground">
                {userEmail}
              </p>
            )}
            {userPosition && (
              <p className="text-xs leading-none text-muted-foreground">
                {userPosition}
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
            <BriefcaseIcon className="mr-2 h-4 w-4" />
            My Jobs
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="hover:bg-gray-100 dark:hover:bg-gray-700">
          <Link href="/dashboard/settings" className="flex items-center">
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