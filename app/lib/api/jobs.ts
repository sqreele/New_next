// app/lib/api/jobs.ts
import axios, { AxiosError } from 'axios';
import { Job } from '@/app/lib/types';
import { JobsApi } from './types';
import { axiosInstance } from './config';

// Define the error response type
interface ErrorResponse {
  detail?: string;
  message?: string;
}

export const jobsApi: JobsApi = {
  fetchAll: async (accessToken?: string) => {
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      const response = await axiosInstance.get<Job[]>('/api/jobs/', { headers });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      return [];
    }
  },

  create: async (formData: FormData, accessToken: string) => {
    try {
      const response = await axiosInstance.post<Job>('/api/jobs/', formData, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error creating job:', error);
      if (axios.isAxiosError(error)) {
        const errorData = (error as AxiosError<ErrorResponse>).response?.data;
        throw new Error(errorData?.detail || errorData?.message || 'Failed to create job');
      }
      throw new Error('Failed to create job');
    }
  },

  fetchForProperty: async (propertyId: string, accessToken: string) => {
    try {
      const response = await axiosInstance.get<Job[]>('/api/jobs/', {
        params: { property: propertyId },
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching jobs for property:', error);
      return [];
    }
  },

  update: async (jobId: string, jobData: Partial<Job>, accessToken: string) => {
    try {
      const response = await axiosInstance.put<Job>(`/api/jobs/${jobId}/`, jobData, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return response.data;
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  delete: async (jobId: string, accessToken: string) => {
    try {
      await axiosInstance.delete(`/api/jobs/${jobId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  },
};