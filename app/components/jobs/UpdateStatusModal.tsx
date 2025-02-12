'use client';

import { useState } from 'react';
import { Job, JobStatus } from '@/app/lib/types';
import axios from 'axios';
import {
 Dialog,
 DialogContent,
 DialogHeader,
 DialogTitle,
 DialogFooter,
 DialogTrigger,
} from "@/app/components/ui/dialog";
import { Button } from "@/app/components/ui/button";
import { Label } from "@/app/components/ui/label";
import { Circle, Loader2 } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const axiosInstance = axios.create({
 baseURL: API_BASE_URL,
 headers: {
   'Content-Type': 'application/json',
 }
});

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface UpdateStatusModalProps {
 job: Job;
 onComplete?: () => void;
}

export function UpdateStatusModal({ job, onComplete }: UpdateStatusModalProps) {
 const [selectedStatus, setSelectedStatus] = useState<JobStatus>(job.status);
 const [isUpdating, setIsUpdating] = useState(false);
 const [open, setOpen] = useState(false);
 const [error, setError] = useState<string | null>(null);

 const statuses = [
   { value: 'pending' as JobStatus, label: 'Pending' },
   { value: 'in_progress' as JobStatus, label: 'In Progress' },
   { value: 'completed' as JobStatus, label: 'Completed' },
   { value: 'cancelled' as JobStatus, label: 'Cancelled' },
   { value: 'waiting_sparepart' as JobStatus, label: 'Waiting for Sparepart' }
 ].filter(status => status.value !== job.status);

 const handleUpdate = async () => {
   if (selectedStatus === job.status) return;

   setIsUpdating(true);
   setError(null);

   try {
     await delay(1500);
     await axiosInstance.patch(`/api/jobs/${job.job_id}/`, {
       status: selectedStatus
     });

     await delay(500);
     setOpen(false);
     onComplete?.();
   } catch (error) {
     console.error('Failed to update status:', error);
     setError(axios.isAxiosError(error) ? error.response?.data?.detail || error.message : 'Failed to update status');
   } finally {
     setIsUpdating(false);
   }
 };

 const handleStatusChange = (value: JobStatus) => {
   setSelectedStatus(value);
   setError(null);
 };

 if (job.status === 'completed') return null;

 return (
   <Dialog open={open} onOpenChange={setOpen}>
     <DialogTrigger asChild>
       <Button variant="outline" className="w-full mt-4">
         Update Status
       </Button>
     </DialogTrigger>
     <DialogContent className="sm:max-w-[425px]">
       <DialogHeader>
         <DialogTitle>Update Job Status</DialogTitle>
       </DialogHeader>
       <div className="grid gap-4 py-4">
         {error && (
           <div className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm">
             {error}
           </div>
         )}
         <div className="space-y-2">
           <div className="font-medium">Current Status:</div>
           <div className="px-3 py-2 bg-gray-100 rounded-md text-sm capitalize">
             {job.status.replace('_', ' ')}
           </div>
         </div>
         <div className="space-y-2">
           <div className="font-medium">New Status:</div>
           <div className="space-y-3">
             {statuses.map((status) => (
               <div key={status.value} className="flex items-center space-x-2">
                 <button
                   onClick={() => handleStatusChange(status.value)}
                   className={`flex items-center justify-center w-4 h-4 rounded-full border ${
                     selectedStatus === status.value 
                       ? 'border-blue-500 bg-blue-500' 
                       : 'border-gray-300 hover:border-blue-400'
                   }`}
                 >
                   {selectedStatus === status.value && (
                     <Circle className="w-2 h-2 text-white fill-current" />
                   )}
                 </button>
                 <Label 
                   className="capitalize cursor-pointer" 
                   onClick={() => handleStatusChange(status.value)}
                 >
                   {status.label}
                 </Label>
               </div>
             ))}
           </div>
         </div>
       </div>
       <DialogFooter>
         <Button
           variant="outline"
           onClick={() => setOpen(false)}
           disabled={isUpdating}
         >
           Cancel
         </Button>
         <Button
           onClick={handleUpdate}
           disabled={isUpdating || selectedStatus === job.status}
           className="flex items-center gap-2"
         >
           {isUpdating ? (
             <>
               <Loader2 className="w-4 h-4 animate-spin" />
               Updating...
             </>
           ) : (
             "Update Status"
           )}
         </Button>
       </DialogFooter>
     </DialogContent>
   </Dialog>
 );
}