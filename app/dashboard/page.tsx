// app/dashboard/page.tsx
import { Suspense } from 'react';
import { fetchJobs, fetchProperties } from '@/app/lib/data';
import DashboardClient from '@/app/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Fetch jobs and properties on the server side
  const jobs = await fetchJobs();
  const properties = await fetchProperties();

  // Render the client component
  return (
    <div className="space-y-4">
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardClient jobs={jobs} properties={properties} />
      </Suspense>
    </div>
  );
}
