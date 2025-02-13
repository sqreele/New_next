// app/lib/hooks/use-jobs.ts
'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import { useProperty } from '@/app/lib/PropertyContext';
import { Job } from '../types';
import { fetchJobsForProperty, updateJob, deleteJob } from '@/app/lib/data';

export const useJobsData = () => {
  const { data: session } = useSession();
  const { selectedProperty } = useProperty();
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchJobs = React.useCallback(async () => {
    if (!selectedProperty || !session?.user?.accessToken) {
      setJobs([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchJobsForProperty(selectedProperty, session.user.accessToken);
      setJobs(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedProperty, session?.user?.accessToken]);

  React.useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleUpdateJob = async (jobId: string, jobData: Partial<Job>) => {
    if (!session?.user?.accessToken) {
      throw new Error('No access token available');
    }

    const updatedJob = await updateJob(jobId, jobData, session.user.accessToken);
    setJobs(prevJobs =>
      prevJobs.map(job => (job.job_id === jobId ? updatedJob : job))
    );
    return updatedJob;
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!session?.user?.accessToken) {
      throw new Error('No access token available');
    }

    await deleteJob(jobId, session.user.accessToken);
    setJobs(prevJobs => prevJobs.filter(job => job.job_id !== jobId));
  };

  return {
    jobs,
    isLoading,
    error,
    refreshJobs: fetchJobs,
    updateJob: handleUpdateJob,
    deleteJob: handleDeleteJob
  };
};