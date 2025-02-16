// app/components/jobs/CreateJobs.tsx

import React from 'react';
import { Button } from '@/app/components/ui/button';
import { Plus } from 'lucide-react';

interface CreateJobsProps {
  onJobCreated: () => void;
}

const CreateJobs: React.FC<CreateJobsProps> = ({ onJobCreated }) => {
  return (
    <Button variant="outline" size="sm" onClick={onJobCreated} className="flex items-center gap-2">
      <Plus className="h-4 w-4" />
      Create Job
    </Button>
  );
};

export default CreateJobs;
