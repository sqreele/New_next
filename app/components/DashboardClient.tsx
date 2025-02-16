// app/dashboard/DashboardClient.tsx
'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import JobsContent from '@/app/dashboard/JobsContent';


export default function DashboardClient({ jobs, properties }: { jobs: any; properties: any }) {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  // Debugging the session
  console.log('Session:', session);

  if (status === 'loading') {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return <div>No session found. Please log in.</div>;
  }

  return (
    <div className="space-y-4">
      <Suspense fallback={<div>Loading...</div>}>
        <JobsContent jobs={jobs} properties={properties} />
      </Suspense>
    </div>
  );
}
