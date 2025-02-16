// lib/api/properties.ts
import { Property } from '@/app/lib/types';
import { axiosInstance, retryOperation } from './config';

export const propertiesApi = {
  fetchAll: async (accessToken?: string): Promise<Property[]> => {
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
  },
};