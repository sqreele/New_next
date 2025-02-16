'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import FormField from './FormField';
import { RegisterFormData, ErrorState } from '@/app/lib/types';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/app/components/ui/alert';

// Environment variables with fallbacks (matching auth configuration)
const API_URL = typeof window === 'undefined'
  ? process.env.NEXT_PRIVATE_API_URL || 'http://django-backend:8000'
  : process.env.NEXT_PUBLIC_API_URL || 'https://pmcs.site';

// Debug logger function
const debugLog = (action: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 📝 Register Debug - ${action}:`, data);
  }
};

type AlertVariant = "default" | "destructive" | "info" | null | undefined;

// Create axios instance with consistent configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
  withCredentials: true,
});

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState<ErrorState | null>(null);
  const [loading, setLoading] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false); // New state for email confirmation

  const validateForm = (formData: FormData): boolean => {
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (password !== confirmPassword) {
      setError({ message: "Passwords do not match", field: "confirmPassword" });
      return false;
    }

    if (password.length < 8) {
      setError({ message: "Password must be at least 8 characters long", field: "password" });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    if (!validateForm(formData)) {
      setLoading(false);
      return;
    }

    const registrationData: RegisterFormData = {
      username: formData.get("username") as string,
      email: formData.get("email") as string,
      password: formData.get("password") as string,
    };

    try {
      const response = await api.post('/api/v1/auth/register/', registrationData);

      if (response.data.access) {
        setIsRegistered(true); // Set registration status to true when registration is successful
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errors = error.response?.data;
        const firstError = Object.values(errors || {})[0];
        setError({
          message: Array.isArray(firstError) ? firstError[0] : String(firstError),
          field: Object.keys(errors || {})[0]
        });
      } else {
        setError({ message: 'Registration failed' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {error.message}
          </AlertDescription>
        </Alert>
      )}

      {isRegistered && (
        <Alert variant="default">
          <AlertDescription>
            A confirmation email has been sent. Please check your inbox and follow the instructions to confirm your email.
          </AlertDescription>
        </Alert>
      )}

      <div className="rounded-md space-y-4">
        <FormField 
          id="username" 
          label="Username" 
          error={error?.field === 'username' ? error.message : undefined}
          required
        />
        <FormField 
          id="email" 
          label="Email" 
          type="email" 
          error={error?.field === 'email' ? error.message : undefined}
          required
        />
        <FormField 
          id="password" 
          label="Password" 
          type="password" 
          error={error?.field === 'password' ? error.message : undefined}
          required
        />
        <FormField 
          id="confirmPassword" 
          label="Confirm Password" 
          type="password" 
          error={error?.field === 'confirmPassword' ? error.message : undefined}
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
            Creating account...
          </>
        ) : (
          'Register'
        )}
      </button>

      <div className="text-center mt-4">
        <Link 
          href="/auth/signin" 
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </form>
  );
}
