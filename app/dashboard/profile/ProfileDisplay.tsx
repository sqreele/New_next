'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { redirect } from 'next/navigation';
import { User2, Mail, Calendar, Shield, Pencil, Building2, Users, LogOut } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/app/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Alert, AlertDescription } from '@/app/components/ui/alert';
import { useUser } from '@/app/lib/user-context';
import type { Property } from '@/app/lib/types';
import { ProfileImage } from '@/app/dashboard/profile/ProfileImage';
import { useState } from 'react';

interface ProfileFieldProps {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}

function PropertyCard({ property }: { property: Property }) {
  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">{property.name}</h3>
        </div>
        <Badge variant="outline">{property.property_id}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{property.description}</p>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {property.users.length} users assigned
          </span>
        </div>
        <span>{new Date(property.created_at).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function ProfileField({ icon: Icon, label, value }: ProfileFieldProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium leading-none">{label}</p>
        <p className="text-sm text-muted-foreground">{value ?? 'N/A'}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <Card>
        <CardContent className="flex justify-center py-20">
          <div className="animate-pulse space-y-8 w-full max-w-md">
            <div className="flex justify-center">
              <div className="w-24 h-24 bg-muted rounded-full" />
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-muted rounded w-3/4 mx-auto" />
              <div className="h-4 bg-muted rounded w-1/2 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await signIn('google', {
        callbackUrl: '/dashboard/profile',
        redirect: true,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

    } catch (error) {
      console.error('Google sign-in error:', error);
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Button
        onClick={handleSignIn}
        disabled={isLoading}
        className="w-full max-w-xs flex items-center justify-center gap-2 bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
        variant="outline"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
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
        )}
        {isLoading ? 'Signing in...' : 'Sign in with Google'}
      </Button>
    </div>
  );
}

export default function ProfileDisplay() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  const { userProfile, loading, error } = useUser();

  if (loading || status === 'loading') {
    return <LoadingSkeleton />;
  }

  if (!session?.user) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Welcome</CardTitle>
            <CardDescription>Sign in to access your profile</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <ProfileImage src={null} alt="Profile" size="md" />
              <GoogleSignInButton />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!userProfile) return null;

  const userData = session.user;

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Profile</CardTitle>
            <CardDescription>
              Manage your personal information and preferences
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/profile/edit">
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Pencil className="w-4 h-4" />
                Edit Profile
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <ProfileImage 
              src={userData.profile_image}
              alt={`${userData.username}'s profile`}
              size="lg"
            />
            <div className="text-center">
              <h3 className="text-xl font-semibold">
                {userData.username}
              </h3>
              <Badge variant="secondary" className="mt-2">{userData.positions}</Badge>
            </div>
          </div>

          <div className="grid gap-6">
            {[
              { icon: User2, label: 'Username', value: userData.username },
              { icon: Mail, label: 'Email', value: userData.email },
              { icon: Shield, label: 'Position', value: userData.positions },
              {
                icon: Calendar,
                label: 'Member Since',
                value: new Date(userProfile.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })
              }
            ].map((field, idx) => (
              <ProfileField key={idx} {...field} />
            ))}
          </div>
        </CardContent>
      </Card>

      {userData.properties?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Managed Properties</CardTitle>
            <CardDescription>Properties under your supervision</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userData.properties.map((property) => (
              <PropertyCard key={property.property_id} property={property} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}