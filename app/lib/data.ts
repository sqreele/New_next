// data.ts (or your API file)
import axios, { AxiosError, AxiosInstance } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import { Job, Property, Room } from '@/app/lib/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

interface SearchResponse {
  jobs: Job[];
  properties: Property[];
}

// Create axios instance with default config
const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging and authentication
axiosInstance.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.user?.accessToken) {
      config.headers.Authorization = `Bearer ${session.user.accessToken}`;
    }
    console.log(`🌐 Making request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling and token refresh
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ Successful response from: ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    console.error(`❌ Response error for ${originalRequest.url}:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });

    // Handle 401 error and token refresh
    if (error.response?.status === 401 && !(originalRequest as any)._retry) {
      (originalRequest as any)._retry = true;

      try {
        const session = await getSession();
        if (session?.error === 'RefreshAccessTokenError') {
          await signOut({ redirect: true, callbackUrl: '/signin' });
          return Promise.reject(new Error('Session expired. Please sign in again.'));
        }

        const newSession = await getSession();
        if (newSession?.user?.accessToken) {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newSession.user.accessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        await signOut({ redirect: true, callbackUrl: '/signin' });
        return Promise.reject(new Error('Failed to refresh authentication.'));
      }
    }

    return Promise.reject(error);
  }
);

// Retry function with exponential backoff
async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryOperation(operation, retries - 1, delay * 2);
    }
    throw error;  // After max retries, throw the error
  }
}

// API Functions
export async function fetchJobs(accessToken?: string): Promise<Job[]> { // Optional accessToken
  try {
    const response = await retryOperation(() =>
      axiosInstance.get<Job[]>('/api/jobs/', {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}, // Use accessToken if provided
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export async function fetchProperties(accessToken?: string): Promise<Property[]> { // Optional accessToken
  try {
    const response = await retryOperation(() =>
      axiosInstance.get<Property[]>('/api/properties/', {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}, // Use accessToken if provided

      })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

export async function fetchRooms(query: string = '', accessToken?: string): Promise<Room[]> { // Optional accessToken
  try {
    const response = await retryOperation(() =>
      axiosInstance.get<Room[]>('/api/rooms/', {
        params: { search: query },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}, // Use accessToken if provided
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return [];
  }
}

export async function fetchJobsForProperty(propertyId: string, accessToken?: string): Promise<Job[]> { // Optional accessToken
  try {
    const response = await retryOperation(() =>
      axiosInstance.get<Job[]>('/api/jobs/', {
        params: { property: propertyId },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}, // Use accessToken if provided
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs for property:', error);
    throw formatError(error);
  }
}

export async function searchItems(query: string, accessToken?: string): Promise<SearchResponse> {  // Optional accessToken
  try {
    const response = await retryOperation(() =>
      axiosInstance.get<SearchResponse>('/api/search', {
        params: { q: query },
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}, // Use accessToken if provided
      })
    );
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    return { jobs: [], properties: [] };
  }
}

export async function createJob(formData: FormData, accessToken?: string): Promise<Job> {  // Optional accessToken
  try {
    const response = await retryOperation(() =>
      axiosInstance.post<Job>('/api/jobs/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), // Include Authorization if accessToken is present
        },
         // Keep withCredentials for multipart/form-data
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error creating job:', error);
    throw formatError(error);
  }
}

export async function updateJob(jobId: string, jobData: Partial<Job>, accessToken?: string): Promise<Job> {  // Optional accessToken
  const updateData = {
    description: jobData.description,
    priority: jobData.priority,
    status: jobData.status,
    remarks: jobData.remarks,
    is_defective: jobData.is_defective,
    topic_data: {
      title: jobData.topics?.[0]?.title || 'General Maintenance',
      description: jobData.topics?.[0]?.description || '',
    },
    room_id: jobData.rooms?.[0]?.room_id?.toString() || '0',
    property_id: jobData.property_id,
  };

  try {
    const response = await retryOperation(() =>
      axiosInstance.put<Job>(`/api/jobs/${jobId}/`, updateData, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}, // Use accessToken if provided
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error updating job:', error);
    throw formatError(error);
  }
}

export async function deleteJob(jobId: string, accessToken?: string): Promise<void> {  // Optional accessToken
  try {
    await retryOperation(() =>
      axiosInstance.delete(`/api/jobs/${jobId}/`, {
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {}, // Use accessToken if provided
      })
    );
  } catch (error) {
    console.error('Error deleting job:', error);
    throw formatError(error);
  }
}

// Utility function to format API errors
function formatError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.data && typeof axiosError.response.data === 'object') {
      const errorData = axiosError.response.data as { detail?: string };
      if (errorData.detail) {
        return new Error(errorData.detail);
      }
    }
    return new Error(axiosError.message);
  }
  return error instanceof Error ? error : new Error('An unexpected error occurred');
}