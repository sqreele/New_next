// lib/api/search.ts
import { SearchResponse } from '@/app/lib/types';
import { axiosInstance, retryOperation } from './config';

export const searchApi = {
  search: async (query: string, accessToken: string): Promise<SearchResponse> => {
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
  },
};