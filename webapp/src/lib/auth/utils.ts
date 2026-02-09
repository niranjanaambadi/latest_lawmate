// src/lib/auth/utils.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      khcAdvocateId: true,
      khcAdvocateName: true,
      khcEnrollmentNumber: true,
      role: true,
      isActive: true,
      isVerified: true,
      preferences: true,
      createdAt: true,
      updatedAt: true
    }
  });

  return user;
}

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  
  return session.user;
}

export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
  
  return user;
}

export async function requireAdmin() {
  return requireRole([UserRole.ADMIN]);
}