//src/app/(dashboard)/settings/profile/page.tsx
import { ProfileSettings } from '@/components/settings/ProfileSettings';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { User } from "@/types/user";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/signin');
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>
      {/* <ProfileSettings initialUser={safeUser} /> */}
    </div>
  );
}