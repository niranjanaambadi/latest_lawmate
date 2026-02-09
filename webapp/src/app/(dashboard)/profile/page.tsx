// src/app/(dashboard)/profile/page.tsx
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from "@/lib/db"
import { ProfileSettings } from "@/components/settings/ProfileSettings"
import type { User, UserPreferences } from "@/types/user"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/auth/signin")
  }

  // Fetch full user data from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      mobile: true,
      khcAdvocateId: true,
      khcAdvocateName: true,
      khcEnrollmentNumber: true,
      role: true,
      isActive: true,
      isVerified: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
      lastSyncAt: true,
      preferences: true,
    },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  // Convert to plain object and ensure proper typing
  const safeUser: User = {
    id: user.id,
    email: user.email,
    mobile: user.mobile,
    khcAdvocateId: user.khcAdvocateId,
    khcAdvocateName: user.khcAdvocateName,
    khcEnrollmentNumber: user.khcEnrollmentNumber,
    role: user.role,
    isActive: user.isActive,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt,
    lastSyncAt: user.lastSyncAt,
    // Cast the JsonValue to your specific Interface
  // We use (user.preferences as UserPreferences) to tell TS we know the structure
  // We use || {} to ensure that if the DB returns null, it doesn't crash
    preferences: (user.preferences as UserPreferences) || {},
    
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Profile Settings
        </h1>
        <p className="text-slate-600 mt-1">
          Manage your account information and preferences
        </p>
      </div>

      <ProfileSettings user={safeUser} />
    </div>
  )
}