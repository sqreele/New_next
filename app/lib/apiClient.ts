// src/lib/apiClient.ts (or src/utils/api.ts)
import axios from 'axios';
// Removed unnecessary and problematic import of useUser from '@/app/lib/user-context';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://pmcs.site', // Use your API base URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor to Inject Token
api.interceptors.request.use(
  (config) => {
    // Retrieve accessToken from localStorage
    const accessToken = localStorage.getItem('accessToken');

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor (Example - You can add error handling here if needed)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Example: Handle 401 errors globally if needed, e.g., redirect to sign-in
    if (error.response?.status === 401) {
      console.error("Unauthorized API request:", error.config.url);
      // You might want to redirect to sign-in page here if refresh fails
      // Example: window.location.href = '/signin?error=Unauthorized';
    }
    return Promise.reject(error);
  }
);

export default api;