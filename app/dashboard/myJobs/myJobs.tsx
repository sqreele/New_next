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
import { useUser } from '@/app/lib/user-context';
import { fetchJobsForProperty, updateJob, deleteJob } from '@/app/lib/data';
import { Job, JobStatus, JobPriority } from '@/app/lib/types';
import { useSession } from 'next-auth/react';

// Constants
const ITEMS_PER_PAGE = 5;
const MAX_VISIBLE_PAGES = 5;

const PRIORITY_VARIANTS = {
  high: 'destructive',
  medium: 'secondary',  // Changed from 'warning'
  low: 'outline',      // Changed from 'secondary'
  default: 'default'
} as const;

const STATUS_VARIANTS = {
  completed: 'outline',    // Changed from 'success'
  in_progress: 'secondary', // Changed from 'warning'
  pending: 'default',      // Changed from 'secondary'
  cancelled: 'destructive',
  default: 'default'
} as const;

// Types
interface JobTableRowProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
}

interface EditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job | null;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => Promise<void>;
  isSubmitting: boolean;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Subcomponents
const JobTableHeader = () => (
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
);


const JobTableRow: React.FC<JobTableRowProps> = ({ job, onEdit, onDelete }) => (
  <TableRow key={job.job_id} className="cursor-pointer hover:bg-gray-50">
    <TableCell>
      <div className="space-y-1">
        <div className=" text-xs">#{job.job_id}</div>
        <Badge variant={PRIORITY_VARIANTS[job.priority as keyof typeof PRIORITY_VARIANTS]}>
          {job.priority.charAt(0).toUpperCase() + job.priority.slice(1)}
        </Badge>
      </div>
    </TableCell>
    <TableCell>
      <div className="max-w-[300px] space-y-1">
        <p className="text-sm truncate">{job.description}</p>
        {job.topics?.map((topic) => (
          <Badge key={topic.id} variant="outline" className="text-xs">
            {topic.title}
          </Badge>
        ))}
      </div>
    </TableCell>
    <TableCell>
      {job.rooms?.map((room) => (
        <div key={room.room_id} className="flex items-center gap-1">
          <Home className="h-4 w-4" />
          {room.name}
        </div>
      ))}
    </TableCell>
    <TableCell>
      <Badge variant={STATUS_VARIANTS[job.status as keyof typeof STATUS_VARIANTS]}>
        {job.status.replace('_', ' ').charAt(0).toUpperCase() + job.status.replace('_', ' ').slice(1)}
      </Badge>
    </TableCell>
    <TableCell>
      {new Date(job.created_at).toLocaleDateString()}
    </TableCell>
    <TableCell>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(job);
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(job);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </TableCell>
  </TableRow>
);

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

const DeleteDialog: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting: boolean;
}> = ({ isOpen, onClose, onConfirm, isSubmitting }) => (
  <AlertDialog open={isOpen} onOpenChange={onClose}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
        <AlertDialogDescription>
          This action cannot be undone. This will permanently delete the maintenance job
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

      // Last page
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

// Custom hooks
const useJobsData = (selectedProperty: string | null, session: any, userProfile: any) => {
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchJobs = async () => {
      if (!selectedProperty || !session?.user?.accessToken) return;
      
      try {
        setIsLoading(true);
        const jobsData = await fetchJobsForProperty(selectedProperty, session.user.accessToken);
        const userJobs = jobsData.filter(job => userProfile?.username === job.user);
        setJobs(userJobs);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch jobs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobs();
  }, [selectedProperty, session?.user?.accessToken, userProfile?.username]);

  return { jobs, setJobs, isLoading, error };
};

const usePagination = (totalItems: number, itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    handlePageChange
  };
};

// Main component
const MyJobs: React.FC = () => {
  const { toast } = useToast();
  const { data: session } = useSession();
  const { userProfile, selectedProperty, setSelectedProperty, loading: userLoading } = useUser();
  
  const { jobs, setJobs, isLoading, error } = useJobsData(selectedProperty, session, userProfile);
  const { currentPage, totalPages, startIndex, endIndex, handlePageChange } = usePagination(jobs.length, ITEMS_PER_PAGE);

  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const currentJobs = jobs.slice(startIndex, endIndex);

  // Initialize selected property if not set
  React.useEffect(() => {
    if (userProfile?.properties?.[0]?.property_id && !selectedProperty) {
      setSelectedProperty(userProfile.properties[0].property_id);
    }
  }, [userProfile, selectedProperty, setSelectedProperty]);

  const handleEdit = (job: Job) => {
    setSelectedJob(job);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (job: Job) => {
    setSelectedJob(job);
    setIsDeleteDialogOpen(true);
  };

  const handleEditSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedJob || !session?.user?.accessToken) return;
  
    setIsSubmitting(true);
    try {
      const formData = new FormData(event.currentTarget);
      
      const updatedJobData: Partial<Job> = {
        description: formData.get('description') as string,
        priority: formData.get('priority') as JobPriority,
        status: selectedJob.status,
        remarks: formData.get('remarks') as string || '',
        is_defective: formData.get('is_defective') === 'on',
        topics: selectedJob.topics,
        rooms: selectedJob.rooms,
        property_id: selectedJob.property_id,
        properties: selectedJob.properties
      };
  
      const updatedJob = await updateJob(
        selectedJob.job_id,
        updatedJobData,
        session.user.accessToken
      );
  
      setJobs(prevJobs => 
        prevJobs.map(job => 
          job.job_id === selectedJob.job_id ? { ...job, ...updatedJob } : job
        )
      );
  
      toast({
        title: "Success",
        description: "Maintenance job updated successfully.",
      });
      setIsEditDialogOpen(false);
    } catch (error) {
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
    if (!selectedJob || !session?.user?.accessToken) return;

    setIsSubmitting(true);
    try {
      await deleteJob(selectedJob.job_id, session.user.accessToken);

      setJobs(prevJobs => prevJobs.filter(job => job.job_id !== selectedJob.job_id));

      toast({
        title: "Success",
        description: "Maintenance job deleted successfully.",
      });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete job",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (userLoading || isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="p-6 text-red-500 flex items-center">
        <AlertCircle className="h-5 w-5 mr-2" />
        Error: User profile not found
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
            <h1 className="text-3xl font-bold tracking-tight">My Maintenance Jobs</h1>
            <p className="text-muted-foreground mt-1">
              Viewing {jobs.length} maintenance request{jobs.length !== 1 ? 's' : ''} for {userProfile.username}
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Maintenance Request
          </Button>
        </div>
      </div>

      {jobs.length > 0 ? (
        <>
          <div className="border rounded-lg">
            <Table>
              <JobTableHeader />
              <TableBody>
                {currentJobs.map((job) => (
                  <JobTableRow
                    key={job.job_id}
                    job={job}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </TableBody>
            </Table>
          </div>

          <EditDialog
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            job={selectedJob}
            onSubmit={handleEditSubmit}
            isSubmitting={isSubmitting}
          />

          <DeleteDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
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
        <div className="text-center p-12 border rounded-lg bg-background">
          <div className="flex flex-col items-center text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No maintenance jobs found</h3>
            <p className="text-muted-foreground mt-1">
              You haven't created any maintenance requests for this property
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;
