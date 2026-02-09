// src/types/userRole.ts
import { 
  User as PrismaUser,
  UserRole as PrismaUserRole
} from '@prisma/client';

export type { UserRole } from '@prisma/client';

export interface UserPreferences {
  autoSync?: boolean;
  notificationEmail?: boolean;
  notificationPush?: boolean;
  theme?: 'light' | 'dark' | 'system';
  dashboardLayout?: 'grid' | 'list';
  language?: 'en' | 'ml' | 'hi';
  timezone?: string;
}

export interface User extends Omit<PrismaUser, 'preferences'> {
  preferences: UserPreferences;
}

export interface CreateUserInput {
  email: string;
  mobile?: string;
  passwordHash: string;
  khcAdvocateId: string;
  khcAdvocateName: string;
  khcEnrollmentNumber?: string;
  role?: PrismaUserRole;
  preferences?: UserPreferences;
}

export interface UpdateUserInput {
  email?: string;
  mobile?: string;
  khcAdvocateName?: string;
  khcEnrollmentNumber?: string;
  isActive?: boolean;
  isVerified?: boolean;
  preferences?: Partial<UserPreferences>;
}

export interface UserWithRelations extends User {
  _count?: {
    cases: number;
    aiAnalyses: number;
    subscriptions: number;
  };
}

export interface PublicUser {
  id: string;
  khcAdvocateId: string;
  khcAdvocateName: string;
  khcEnrollmentNumber?: string | null;
  role: PrismaUserRole;
  isVerified: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  khcAdvocateId: string;
  khcAdvocateName: string;
  role: PrismaUserRole;
  isActive: boolean;
  isVerified: boolean;
  preferences: UserPreferences;
}

export function parseUserPreferences(json: any): UserPreferences {
  if (!json || typeof json !== 'object') return DEFAULT_USER_PREFERENCES;
  return json as UserPreferences;
}

export function getUserDisplayName(user: User | AuthUser): string {
  return user.khcAdvocateName || user.email.split('@')[0];
}

export function getUserInitials(user: User | AuthUser): string {
  const name = user.khcAdvocateName;
  if (!name) return user.email.charAt(0).toUpperCase();
  const parts = name.split(' ');
  return parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();
}

export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  autoSync: true,
  notificationEmail: true,
  notificationPush: false,
  theme: 'system',
  dashboardLayout: 'grid',
  language: 'en',
  timezone: 'Asia/Kolkata'
};