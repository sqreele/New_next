'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface AuthError {
  message: string;
  code?: string;
  details?: string;
}

const debugLog = (action: string, data: any) => {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🔐 Auth Debug - ${action}:`, data);
  }
};

const SignIn = () => {
  const router = useRouter();
  const [error, setError] = useState<AuthError | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  debugLog('Component Mounted', { initialState: { error: null, loading: false, googleLoading: false }});

  const validateForm = (): AuthError | null => {
    if (!username.trim()) {
      debugLog('Validation Failed', { field: 'username', reason: 'empty' });
      return { message: 'Username is required' };
    }
    if (!password.trim()) {
      debugLog('Validation Failed', { field: 'password', reason: 'empty' });
      return { message: 'Password is required' };
    }
    if (password.length < 6) {
      debugLog('Validation Failed', { field: 'password', reason: 'too short' });
      return { message: 'Password must be at least 6 characters' };
    }
    debugLog('Validation Passed', { username: username.length, passwordLength: password.length });
    return null;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    debugLog('Form Submission Started', { timestamp: new Date().toISOString() });
    
    setLoading(true);
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      debugLog('Form Validation Error', validationError);
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      debugLog('Credential SignIn Attempt', { 
        username: username.trim(),
        timestamp: new Date().toISOString()
      });

      const res = await signIn('credentials', {
        username: username.trim(),
        password,
        redirect: false,
      });

      debugLog('SignIn Response', { 
        ok: res?.ok,
        error: res?.error,
        status: res?.status,
        timestamp: new Date().toISOString()
      });

      if (!res) {
        throw new Error('No response from authentication server');
      }

      if (res.error) {
        if (res.error === 'CredentialsSignin') {
          debugLog('Invalid Credentials', { error: res.error });
          setError({ message: 'Invalid username or password' });
        } else if (res.error.includes('JSON')) {
          debugLog('JSON Parse Error', { error: res.error });
          setError({
            message: 'Server communication error',
            code: 'JSON_PARSE_ERROR',
            details: 'Please try again or contact support if the issue persists',
          });
        } else {
          debugLog('Unknown Error', { error: res.error });
          setError({ message: res.error });
        }
      } else if (res.ok) {
        debugLog('Authentication Successful', { 
          redirectTo: '/dashboard',
          timestamp: new Date().toISOString()
        });
        router.replace('/dashboard');
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      debugLog('Authentication Error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });
      
      setError({
        message: 'An unexpected error occurred',
        details: error instanceof Error ? error.message : 'Please try again later',
      });
    } finally {
      setLoading(false);
      debugLog('Auth Process Completed', { 
        success: !error,
        timestamp: new Date().toISOString()
      });
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      
      debugLog('Google SignIn Started', { 
        timestamp: new Date().toISOString()
      });

      const response = await signIn('google', {
        callbackUrl: '/dashboard',
        redirect: false,
      });

      debugLog('Google SignIn Response', { 
        ok: response?.ok,
        error: response?.error,
        status: response?.status,
        timestamp: new Date().toISOString()
      });

      if (response?.error) {
        debugLog('Google SignIn Error', { 
          error: response.error,
          timestamp: new Date().toISOString()
        });
        
        setError({ 
          message: 'Google sign-in failed',
          details: response.error
        });
        return;
      }

      if (response?.ok) {
        debugLog('Google Auth Successful', { 
          redirectTo: '/dashboard',
          timestamp: new Date().toISOString()
        });
        router.replace('/dashboard');
      }
    } catch (error) {
      debugLog('Google Auth Error', { 
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      });

      setError({
        message: 'Google sign-in failed',
        details: error instanceof Error ? error.message : 'Please try again later'
      });
    } finally {
      setGoogleLoading(false);
      debugLog('Google Auth Process Completed', { 
        success: !error,
        timestamp: new Date().toISOString()
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign in to your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your credentials to access your account
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                {error.message}
                {error.details && (
                  <p className="mt-1 text-sm opacity-80">{error.details}</p>
                )}
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your username"
                autoComplete="username"
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Enter your password"
                autoComplete="current-password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              type="button"
            >
              {googleLoading ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                  Connecting to Google...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="currentColor"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="currentColor"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;