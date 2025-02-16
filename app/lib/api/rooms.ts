// lib/api/rooms.ts
import { Room } from '@/app/lib/types';
import { axiosInstance, retryOperation } from './config';

export const roomsApi = {
  fetch: async (query: string, accessToken?: string): Promise<Room[]> => {
    try {
      const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};
      const response = await retryOperation(() =>
        axiosInstance.get<Room[]>('/api/rooms/', {
          params: { search: query },
          headers,
        })
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return [];
    }
  },
};