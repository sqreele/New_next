'use client';

import { User2, Mail, Calendar, Shield, Pencil, Building2, Users } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
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

interface ProfileFieldProps {
  icon: React.ElementType;
  label: string;
  value: string | null | undefined;
}

function PropertyCard({ property }: { property: Property }) {
  // Early return if property is undefined or null
  if (!property) {
    return null;
  }

  // Ensure all arrays exist with default empty arrays
  const users = Array.isArray(property.users) ? property.users : [];
  const rooms = Array.isArray(property.rooms) ? property.rooms : [];

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">{property.name || 'Untitled'}</h3>
        </div>
        <Badge variant="outline">{property.property_id || 'N/A'}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{property.description || 'No description'}</p>
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {users.length} users assigned
          </span>
        </div>
        <span>{property.created_at ? new Date(property.created_at).toLocaleDateString() : 'Date not available'}</span>
      </div>
      {rooms.length > 0 && (
        <div className="text-sm text-muted-foreground">
          {rooms.length} rooms managed
        </div>
      )}
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

export default function ProfileDisplay() {
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  const { userProfile, loading, error } = useUser();

  if (loading || status === 'loading') {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!userProfile) {
    return (
      <Alert variant="info">
        <AlertDescription>No profile data available</AlertDescription>
      </Alert>
    );
  }

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
          <Link href="/profile/edit">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Pencil className="w-4 h-4" />
              Edit Profile
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex flex-col items-center justify-center space-y-4">
            <ProfileImage
              src={userProfile.profile_image}
              alt={`${userProfile.username}'s profile`}
              size="lg"
            />
            <div className="text-center">
              <h3 className="text-xl font-semibold">{userProfile.username}</h3>
              <Badge variant="secondary" className="mt-2">{userProfile.positions}</Badge>
            </div>
          </div>

          <div className="grid gap-6">
            {[
              { icon: User2, label: 'Username', value: userProfile.username },
              { icon: Mail, label: 'Email', value: userProfile.email },
              { icon: Shield, label: 'Position', value: userProfile.positions },
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

      {userProfile?.properties && Array.isArray(userProfile.properties) && userProfile.properties.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Managed Properties</CardTitle>
            <CardDescription>Properties under your supervision</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {userProfile.properties.map((property) => {
              if (!property) return null;
              return (
                <PropertyCard 
                  key={property.property_id || Math.random().toString()} 
                  property={property} 
                />
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}