// lib/api/config.ts
import axios, { AxiosError, AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

// Create axios instance with default config
export const axiosInstance: AxiosInstance = axios.create({
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
export async function retryOperation<T>(
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

export function formatError(error: unknown): Error {
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