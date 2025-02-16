'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/components/ui/alert-dialog";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Checkbox } from "@/app/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination";
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { useToast } from "@/app/components/ui/use-toast";
import {
  AlertCircle,
  Home,
  Plus,
  Pencil,
  Trash2,
  Loader2
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useProperty } from '@/app/lib/PropertyContext';
import { fetchJobsForProperty, updateJob, deleteJob } from '@/app/lib/data';
import { Job } from '@/app/lib/types';

// Constants
const ITEMS_PER_PAGE = 5;
const MAX_VISIBLE_PAGES = 5;

const PRIORITY_VARIANTS = {
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
  default: 'default'
} as const;

const STATUS_VARIANTS = {
  completed: 'outline',
  in_progress: 'secondary',
  pending: 'default',
  cancelled: 'destructive',
  waiting_sparepart: 'secondary',
  default: 'default'
} as const;

// Custom hooks
const useJobsData = (propertyId: string | null, accessToken: string | undefined) => {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    console.log('useJobsData effect:', { propertyId, hasAccessToken: !!accessToken });

    const fetchJobs = async () => {
      if (!propertyId || !accessToken) {
        console.log('Missing propertyId or accessToken');
        setJobs([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const data = await fetchJobsForProperty(propertyId, accessToken);
        console.log('Fetched jobs:', data);
        setJobs(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching jobs:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
        setJobs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [propertyId, accessToken]);

  return { jobs, setJobs, isLoading, error };
};

// Components
interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
}

const EditDialog: React.FC<EditDialogProps> = ({
  isOpen,
  onClose,
  job,
  onSubmit,
  isSubmitting
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Edit Maintenance Job</DialogTitle>
        <DialogDescription>
          Make changes to the maintenance job here.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit}>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={job?.description}
              className="min-h-[100px]"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Select name="priority" defaultValue={job?.priority}>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Textarea
              id="remarks"
              name="remarks"
              defaultValue={job?.remarks}
              className="min-h-[60px]"
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="is_defective"
              name="is_defective"
              defaultChecked={job?.is_defective}
            />
            <Label htmlFor="is_defective">Mark as defective</Label>
          </div>
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
);

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}

const DeleteDialog: React.FC<DeleteDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting
}) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone.  This will permanently delete the maintenance job
          and remove it from our servers.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
        <AlertDialogAction
          onClick={onConfirm}
          disabled={isSubmitting}
          className="bg-red-500 hover:bg-red-600"
        >
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Delete
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
);

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const JobsPagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange
}) => {
  const renderPaginationItems = () => {
    const items: React.ReactNode[] = [];

    if (totalPages <= MAX_VISIBLE_PAGES) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => onPageChange(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      // First page
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => onPageChange(1)}
            isActive={currentPage === 1}
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      // Show ellipsis if needed
      if (currentPage > 3) {
        items.push(
          <PaginationItem key="ellipsis1">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Pages around current page
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => onPageChange(i)}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      // Show ellipsis if needed
      if (currentPage < totalPages - 2) {
        items.push(
          <PaginationItem key="ellipsis2">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }

      // Last page (only if totalPages is greater than 1)
      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => onPageChange(totalPages)}
              isActive={currentPage === totalPages}
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={() => onPageChange(currentPage - 1)}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
        {renderPaginationItems()}
        <PaginationItem>
          <PaginationNext
            onClick={() => onPageChange(currentPage + 1)}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};

interface MyJobsProps { } // Correct: Added an interface for the component's props

const MyJobs: React.FC<MyJobsProps> = () => {  // Correct: Use the defined interface
  const { toast } = useToast();
  const { data: session } = useSession();
  const { selectedProperty } = useProperty(); // Corrected: Use selectedProperty

  console.log('MyJobs render:', {
    selectedProperty, // Corrected: Check selectedProperty
    hasSession: !!session,
    accessToken: session?.user?.accessToken ? 'present' : 'missing'
  });

  const { jobs, setJobs, isLoading, error } = useJobsData(
    selectedProperty, // Corrected: Pass selectedProperty
    session?.user?.accessToken
  );

  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Calculate pagination
  const totalPages = Math.ceil(jobs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, jobs.length);

  // Memoize current jobs
  const currentJobs = React.useMemo(() =>
    jobs.slice(startIndex, endIndex),
    [jobs, startIndex, endIndex]
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEdit = (job: Job) => {
    console.log('Editing job:', job);
    setSelectedJob(job);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (job: Job) => {
    console.log('Deleting job:', job);
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedJob || !session?.user?.accessToken) {
      console.log('Edit submission failed:', {
        hasSelectedJob: !!selectedJob,
        hasAccessToken: !!session?.user?.accessToken
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData(event.currentTarget);

      const updatedJobData = {
        description: formData.get('description') as string,
        priority: formData.get('priority') as Job['priority'],  // Correct: Cast to Job['priority']
        remarks: formData.get('remarks') as string || '',
        is_defective: formData.get('is_defective') === 'on',
      };

      console.log('Updating job:', {
        jobId: selectedJob.job_id, // Corrected: Use job_id
        updatedData: updatedJobData
      });

      const updatedJob = await updateJob(
        selectedJob.job_id, // Corrected: Use job_id
        updatedJobData,
        session.user.accessToken
      );

      // Optimistic update + merging with existing properties
      setJobs(prevJobs =>
        prevJobs.map(job =>
          job.job_id === selectedJob.job_id ? { ...job, ...updatedJob } : job // Corrected: Use job_id
        )
      );

      toast({
        title: "Success",
        description: "Maintenance job updated successfully.",
      });
      setIsEditDialogOpen(false);
      setSelectedJob(null); // Clear selected job after successful edit
    } catch (error) {
      console.error('Error updating job:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update job",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const handleDeleteConfirm = async () => {
    if (!selectedJob || !session?.user?.accessToken) {
      console.log('Delete confirmation failed:', {
        hasSelectedJob: !!selectedJob,
        hasAccessToken: !!session?.user?.accessToken
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await deleteJob(selectedJob.job_id, session.user.accessToken); // Corrected: Use job_id

      setJobs(prevJobs => prevJobs.filter(job => job.job_id !== selectedJob.job_id)); // Corrected: Use job_id
       // Adjust current page if necessary
      if (currentJobs.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }

      toast({
        title: "Success",
        description: "Maintenance job deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
      setSelectedJob(null); // Clear selected job

    } catch (error) {
      console.error('Error deleting job:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete job",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  // Display a message if no property is selected
  if (!selectedProperty) {
    return (
      <div className="p-6 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium">No Property Selected</h3>
        <p className="text-muted-foreground mt-1">
          Please select a property to view maintenance jobs.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-red-500 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        Error: {error}
      </div>
    );
  }



  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col gap-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Maintenance Jobs</h1>
            <p className="text-muted-foreground mt-1">
              Viewing {jobs.length} maintenance request{jobs.length !== 1 ? 's' : ''}
            </p>
          </div>
          {/* Placeholder for Add Job button */}
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Maintenance Request
          </Button>
        </div>
      </div>

      {/* Conditional rendering based on jobs */}
      {jobs.length > 0 ? (
        <>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Job Details</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentJobs.map((job) => (
                  <TableRow key={job.job_id}>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs">#{job.job_id}</div>
                        <Badge variant={PRIORITY_VARIANTS[job.priority]}>
                          {/* Capitalize the first letter of priority */}
                          {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-[300px] space-y-1">
                        {/* Truncate long descriptions */}
                        <p className="text-sm truncate">{job.description}</p>
                        {/* Display related topics */}
                        {job.topics?.map((topic) => (
                          <Badge key={topic.id} variant="outline" className="text-xs">
                            {topic.title}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      {/* Display room information */}
                      {job.rooms?.map((room) => (
                        <div key={room.room_id} className="flex items-center gap-1">
                          <Home className="h-4 w-4" />
                          {room.name}
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_VARIANTS[job.status] || 'default'}>
                        {/* Format status for display (replace underscores, capitalize) */}
                        {job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.replace('_', ' ').slice(1)}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      {/* Display creation date */}
                      {new Date(job.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleEdit(job)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => handleDelete(job)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Edit Dialog */}
          <EditDialog
            isOpen={isEditDialogOpen}
            onClose={() => { setIsEditDialogOpen(false); setSelectedJob(null) }} // Clear selectedJob on close
            job={selectedJob}
            onSubmit={handleEditSubmit}
            isSubmitting={isSubmitting}
          />

          {/* Delete Dialog */}
          <DeleteDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => { setIsDeleteDialogOpen(false); setSelectedJob(null) }} // Clear selectedJob on close
            onConfirm={handleDeleteConfirm}
            isSubmitting={isSubmitting}
          />

          <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
            <div>
              Showing {startIndex + 1} to {endIndex} of {jobs.length} results
            </div>
            <JobsPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </>
      ) : (
        // Displayed when there are no maintenance jobs
        <div className="text-center p-12 border rounded-lg bg-background">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No Maintenance Jobs</h3>
            <p className="text-muted-foreground mt-1">
              Create a new maintenance request to track repairs and issues
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;