// app/lib/api/types.ts
import { Job } from '@/app/lib/types';

export interface JobsApi {
  fetchAll: (accessToken?: string) => Promise<Job[]>;
  create: (formData: FormData, accessToken: string) => Promise<Job>;
  fetchForProperty: (propertyId: string, accessToken: string) => Promise<Job[]>;
  update: (jobId: string, jobData: Partial<Job>, accessToken: string) => Promise<Job>;
  delete: (jobId: string, accessToken: string) => Promise<void>;
}