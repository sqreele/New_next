"use client";

import { useSession, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Suspense, useEffect } from 'react';
import JobsContent from '@/app/dashboard/JobsContent';
import type { Job, Property } from '@/app/lib/types';

// Define props interface using the proper types
interface DashboardClientProps {
  jobs: Job[];
  properties: Property[];
}

export default function DashboardClient({ jobs, properties }: DashboardClientProps) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  useEffect(() => {
    if (status === 'authenticated' && session?.error === 'RefreshTokenError') {
      console.error('Refresh token failed. Signing out user.');
      signOut();
    }
  }, [session, status]);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return <div>No session found. Please log in.</div>;
  }

  return (
    <div className="space-y-4">
      <Suspense fallback={<div>Loading...</div>}>
        <JobsContent 
          jobs={jobs} 
          properties={properties} 
          session={session}
        />
      </Suspense>
    </div>
  );
}