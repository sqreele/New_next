'use client';

// app/auth/error/ErrorContent.tsx
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function ErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams?.get('error');

  useEffect(() => {
    if (error) {
      console.error('Authentication error:', error);
    }
  }, [error]);

  const getErrorMessage = () => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'RefreshTokenError':
        return 'Your session has expired. Please sign in again.';
      case 'Verification':
        return 'Unable to verify your credentials. Please try again.';
      default:
        return 'An unexpected authentication error occurred.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center text-red-600">
            Authentication Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{getErrorMessage()}</AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button 
            onClick={() => router.push('/auth/signin')}
            variant="outline"
          >
            Return to Sign In
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}