// lib/fetch-client.ts
import { getSession, signOut } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function refreshToken(refreshToken: string) {
  try {
    const response = await fetch(`${API_URL}/api/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    return data.access;
  } catch (error) {
    console.error('Token refresh failed:', error);
    throw error;
  }
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  let session = await getSession();
  
  if (!session?.user?.accessToken) {
    throw new Error('No access token');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${session.user.accessToken}`);

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    // Handle 401 Unauthorized error
    if (response.status === 401) {
      if (session?.user?.refreshToken) {
        try {
          // Try to refresh the token
          const newAccessToken = await refreshToken(session.user.refreshToken);
          
          // Update headers with new token
          headers.set('Authorization', `Bearer ${newAccessToken}`);
          
          // Retry the original request with new token
          const retryResponse = await fetch(url, {
            ...options,
            headers,
            credentials: 'include',
          });

          if (!retryResponse.ok) {
            throw new Error(`Retry failed with status ${retryResponse.status}`);
          }

          return retryResponse;
        } catch (refreshError) {
          // If refresh fails, sign out user
          await signOut({ redirect: true, callbackUrl: '/signin' });
          throw new Error('Session expired. Please sign in again.');
        }
      } else {
        // No refresh token available
        await signOut({ redirect: true, callbackUrl: '/signin' });
        throw new Error('Session expired. Please sign in again.');
      }
    }

    // Handle other error responses
    if (!response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        const errorData = await response.json();
        if (errorData.detail) {
          throw new Error(errorData.detail);
        }
        throw new Error(JSON.stringify(errorData));
      }
      throw new Error(`Request failed with status ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Fetch error:', error);
    throw error;
  }
}

// Helper function for JSON requests
export async function fetchJSON<T = any>(url: string, options: RequestInit = {}): Promise<T> {
  const response = await fetchWithAuth(url, {
    ...options,
    headers: {
      ...options.headers,
      'Content-Type': 'application/json',
    },
  });
  return response.json();
}

// Helper function for form data requests
export async function fetchFormData<T = any>(url: string, formData: FormData, method: string = 'POST'): Promise<T> {
  const response = await fetchWithAuth(url, {
    method,
    body: formData,
  });
  return response.json();
}