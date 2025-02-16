import { Room } from '@/app/lib/types';
import { axiosInstance, retryOperation } from './config';

export const roomsApi = {
  fetch: async (query: string, accessToken?: string): Promise<Room[]> => {
    try {
      // Set headers if the access token is available
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

      // Make the API request
      const response = await retryOperation(() =>
        axiosInstance.get<Room[]>('/api/rooms/', {
          params: { search: query },
          headers,
        })
      );

      // Debug log to verify the response data
      console.log("Fetched Rooms Data:", response.data);

      // Return the fetched rooms data
      return response.data;
    } catch (error: unknown) {  // Ensure the type of error is narrowed down
      if (error instanceof Error) {
        // If error is an instance of Error, you can access its message and stack
        console.error('Error fetching rooms:', error.message);
        if (error.stack) {
          console.error('Error stack:', error.stack);
        }
      } else {
        // Handle the case when the error is not an instance of Error
        console.error('Unknown error occurred:', error);
      }

      // Return an empty array in case of error
      return [];
    }
  },
};
