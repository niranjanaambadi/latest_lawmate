// src/lib/auth/index.ts
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/db';
import { UserRole } from '@prisma/client';
import { redirect } from 'next/navigation';

/**
 * Get current authenticated user session
 * Returns null if not authenticated
 */
export async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * Get current user from database with full details
 */
export async function getCurrentUser() {
  const session = await getSession();
  
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
      updatedAt: true,
      lastLoginAt: true
    }
  });

  return user;
}

/**
 * Require authentication - redirects to login if not authenticated
 */
export async function requireAuth() {
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/auth/signin');
  }
  
  return session.user;
}

/**
 * Require specific role - throws error if insufficient permissions
 */
export async function requireRole(allowedRoles: UserRole[]) {
  const user = await requireAuth();
  
  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions');
  }
  
  return user;
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  return requireRole([UserRole.ADMIN]);
}

/**
 * Check if user has specific role
 */
export async function hasRole(role: UserRole): Promise<boolean> {
  const session = await getSession();
  return session?.user?.role === role;
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  return hasRole(UserRole.ADMIN);
}