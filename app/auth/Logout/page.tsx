// app/auth/signout/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const SignOutPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Optionally, you can trigger any additional actions here
    setTimeout(() => {
      router.push('/auth/signin'); // Redirect to the sign-in page after 3 seconds
    }, 3000);
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl">You have been signed out</h2>
        <p className="mt-2">Redirecting you to the sign-in page...</p>
      </div>
    </div>
  );
};

export default SignOutPage;
