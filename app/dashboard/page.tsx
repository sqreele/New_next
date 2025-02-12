// app/dashboard/page.tsx
import { Suspense } from 'react';
import { fetchJobs,fetchProperties } from '@/app/lib/data';
import JobsContent from '@/app/dashboard/JobsContent';
export const dynamic = 'force-dynamic';
export default async function DashboardPage() {
  const jobs = await fetchJobs();
  const properties = await fetchProperties();
  
  return (
    <div className="space-y-4">
      <Suspense fallback={<div>Loading...</div>}>
        <JobsContent jobs={jobs}  properties={properties}/>
       </Suspense>
    </div>
  );
}
