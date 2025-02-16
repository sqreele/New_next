'use client';

// app/auth/error/page.tsx
import { Suspense } from 'react';
import ErrorContent from './ErrorContent';

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}