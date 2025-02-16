import { signOut } from 'next-auth/react';
import { Button } from '@/app/components/ui/button';
import { LogOut } from 'lucide-react';

export function ProfileHeader() {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <Button
        variant="outline"
        onClick={() => signOut({ callbackUrl: '/auth/signin' })}
        className="flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Button>
    </div>
  );
}