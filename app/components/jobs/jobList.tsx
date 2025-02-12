"use client";

import { useState, useEffect } from 'react';
import { useProperty } from '@/app/lib/PropertyContext';
import JobCard from '@/app/components/jobs/JobCard';
import Pagination from '@/app/components/jobs/Pagination';
import { Job, TabValue, SortOrder } from '@/app/lib/types';
import { Loader2 } from 'lucide-react';

interface JobListProps {
  jobs: Job[];
  filter: TabValue;
  sortOrder: SortOrder;
}

export default function JobList({ jobs, filter, sortOrder }: JobListProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedProperty } = useProperty();
  const itemsPerPage = 15; // Adjusted to be divisible by 5

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, sortOrder, selectedProperty]);

  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, [filter, sortOrder, selectedProperty]);

  // Filter jobs based on property_id
  const propertyFilteredJobs = jobs.filter((job) => 
    job.profile_image?.properties.some(
      (property) => property.property_id === selectedProperty
    ) ?? false
  );

  // Apply status filter
  const statusFilteredJobs = propertyFilteredJobs.filter((job) => {
    switch (filter) {
      case 'waiting_sparepart':
        return ['in_progress', 'waiting_sparepart'].includes(job.status);
      case 'pending':
        return job.status === 'pending';
      case 'completed':
        return job.status === 'completed';
      case 'cancelled':
        return job.status === 'cancelled';
      case 'defect':
        return job.is_defective === true;
      case 'all':
      default:
        return true;
    }
  });

  // Apply sorting
  const sortedJobs = [...statusFilteredJobs].sort((a, b) => {
    const dateA = new Date(a.created_at).getTime();
    const dateB = new Date(b.created_at).getTime();
    return sortOrder === 'Newest first' ? dateB - dateA : dateA - dateB;
  });

  const totalPages = Math.ceil(sortedJobs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentJobs = sortedJobs.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setIsLoading(true);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => setIsLoading(false), 300);
  };

  if (sortedJobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] p-4 sm:p-8 text-center">
        <p className="text-base sm:text-lg font-medium text-gray-600 mb-2">
          No jobs found
        </p>
        <p className="text-sm text-gray-500">
          {selectedProperty
            ? `Property ${selectedProperty} has no jobs matching the current filters`
            : 'No property selected.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[200px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {currentJobs.map((job) => (
            <div
              key={job.job_id}
              className="transition-all duration-300 ease-in-out h-full"
            >
              <JobCard 
                job={job} 
                propertyName={selectedProperty || undefined}
              />
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pt-4 sm:pt-6 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}