// app/dashboard/chartdashboad/page.tsx
import { Suspense } from 'react';
import { fetchJobs } from '@/app/lib/data';

import PropertyJobsDashboard from '@/app/dashboard/chartdashboad/PropertyJobsDashboard';
export default async function DashboardPage() {
  const jobs = await fetchJobs();

  return (
    <div className="space-y-4">
      <Suspense fallback={<div>Loading...</div>}>
        <PropertyJobsDashboard jobs={jobs || []} />
      </Suspense>
    </div>
  );
}
export const dynamic = 'force-dynamic'
