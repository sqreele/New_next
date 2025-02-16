import axios, { AxiosError, AxiosInstance } from 'axios';
import { Job, Property } from '@/app/lib/types';
import { Room } from '@/app/lib/types';
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

// Add request interceptor for logging
axiosInstance.interceptors.request.use(
  (config) => {
    console.log(`🌐 Making request to: ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for logging
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ Successful response from: ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    console.error(`❌ Response error for ${error.config?.url}:`, {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
    });
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
    throw error;
  }
}

export async function fetchJobs(accessToken?: string): Promise<Job[]> {
  try {
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    const response = await retryOperation(() =>
      axiosInstance.get<Job[]>('/api/jobs/', { headers })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export async function fetchProperties(accessToken?: string): Promise<Property[]> {
  try {
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
    const response = await retryOperation(() =>
      axiosInstance.get<Property[]>('/api/properties/', { headers })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching properties:', error);
    return [];
  }
}

export async function fetchJobsForProperty(
  propertyId: string,
  accessToken: string
): Promise<Job[]> {
  try {
    const response = await retryOperation(() =>
      axiosInstance.get<Job[]>('/api/jobs/', {
        params: { property: propertyId },
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching jobs for property:', error);
    throw formatError(error);
  }
}

export async function searchItems(
  query: string,
  accessToken: string
): Promise<SearchResponse> {
  try {
    const response = await retryOperation(() =>
      axiosInstance.get<SearchResponse>('/api/search', {
        params: { q: query },
        headers: { Authorization: `Bearer ${accessToken}` },
      })
    );
    return response.data;
  } catch (error) {
    console.error('Search error:', error);
    return { jobs: [], properties: [] };
  }
}
export async function fetchRooms(query: string, accessToken?: string): Promise<Room[]> {
  try {
    // Prepare headers
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

    // Fetch rooms from the API
    const response = await retryOperation(() =>
      axiosInstance.get<Room[]>('/api/rooms/', {
        params: { search: query },  // Pass the search query
        headers,  // Add authorization header if available
      })
    );

    // Return the list of rooms
    return response.data;
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return []; // Return an empty array if there is an error
  }
}
export async function updateJob(
  jobId: string,
  jobData: Partial<Job>,
  accessToken: string
): Promise<Job> {
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
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      })
    );
    return response.data;
  } catch (error) {
    console.error('Error updating job:', error);
    throw formatError(error);
  }
}

export async function deleteJob(jobId: string, accessToken: string): Promise<void> {
  try {
    await retryOperation(() =>
      axiosInstance.delete(`/api/jobs/${jobId}/`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        withCredentials: true,
      })
    );
  } catch (error) {
    console.error('Error deleting job:', error);
    throw formatError(error);
  }
}

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
