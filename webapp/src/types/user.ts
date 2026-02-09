// src/types/user.ts
// src/types/user.ts
import type { 
  User as PrismaUser,
  UserRole as PrismaUserRole 
} from "@prisma/client"
import type { JsonValue } from "@prisma/client/runtime/library"

// Re-export Prisma enum for convenience
export type { UserRole } from '@prisma/client'

// ============================================
// USER PREFERENCES
// ============================================

// User preferences structure (stored in JSON field)
export interface UserPreferences {
  autoSync?: boolean
  notificationEmail?: boolean
  notificationPush?: boolean
  theme?: 'light' | 'dark' | 'system'
  dashboardLayout?: 'grid' | 'list'
  language?: 'en' | 'ml' | 'hi'
  timezone?: string
}

// Default preferences
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
  autoSync: true,
  notificationEmail: true,
  notificationPush: false,
  theme: 'system',
  dashboardLayout: 'grid',
  language: 'en',
  timezone: 'Asia/Kolkata'
}

// ============================================
// CORE USER TYPES
// ============================================

// Session user type (minimal info stored in JWT)
export interface SessionUser {
  id: string
  email: string
  name: string
  role: PrismaUserRole
  khcAdvocateId: string
  khcAdvocateName: string
  isVerified: boolean
}

// Full user type from database (matches Prisma schema)
// This is the parsed version with typed preferences
export interface User {
  id: string
  email: string
  mobile: string | null
  khcAdvocateId: string
  khcAdvocateName: string
  khcEnrollmentNumber: string | null
  role: PrismaUserRole
  isActive: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
  lastSyncAt: Date | null
  preferences: UserPreferences // Typed preferences (parsed from JSON)
}

// Raw user type from Prisma (with JsonValue preferences)
export interface RawUser {
  id: string
  email: string
  mobile: string | null
  khcAdvocateId: string
  khcAdvocateName: string
  khcEnrollmentNumber: string | null
  role: PrismaUserRole
  isActive: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
  lastLoginAt: Date | null
  lastSyncAt: Date | null
  preferences: JsonValue // Raw JSON from database
}

// Type for user without sensitive fields
export type SafeUser = Omit<PrismaUser, 'passwordHash'>

// Public user info (safe to expose in API)
export interface PublicUser {
  id: string
  khcAdvocateId: string
  khcAdvocateName: string
  khcEnrollmentNumber: string | null
  role: PrismaUserRole
  isVerified: boolean
}

// Auth user type (for session/authentication contexts)
export interface AuthUser {
  id: string
  email: string
  khcAdvocateId: string
  khcAdvocateName: string
  role: PrismaUserRole
  isActive: boolean
  isVerified: boolean
  preferences: UserPreferences
}

// ============================================
// INPUT TYPES
// ============================================

// Type for user creation (without generated fields)
export interface CreateUserInput {
  email: string
  mobile?: string | null
  passwordHash: string
  khcAdvocateId: string
  khcAdvocateName: string
  khcEnrollmentNumber?: string | null
  role?: PrismaUserRole
  preferences?: UserPreferences | JsonValue
}

// Type for user update
export interface UpdateUserInput {
  email?: string
  mobile?: string | null
  khcAdvocateName?: string
  khcEnrollmentNumber?: string | null
  isActive?: boolean
  isVerified?: boolean
  preferences?: Partial<UserPreferences> | JsonValue
}

// Profile update type (fields that can be updated by user)
export interface ProfileUpdateInput {
  email?: string
  mobile?: string | null
  khcEnrollmentNumber?: string | null
  preferences?: Partial<UserPreferences>
}

// ============================================
// EXTENDED TYPES
// ============================================

// User with related data (for detailed views)
export interface UserWithRelations extends User {
  _count?: {
    cases: number
    aiAnalyses: number
  }
}

// ============================================
// TYPE GUARDS & PARSERS
// ============================================

export function isUserPreferences(obj: any): obj is UserPreferences {
  return obj && typeof obj === 'object'
}

export function parseUserPreferences(json: JsonValue): UserPreferences {
  if (!json || json === null) return { ...DEFAULT_USER_PREFERENCES }
  
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json
    if (!isUserPreferences(data)) return { ...DEFAULT_USER_PREFERENCES }
    
    // Merge with defaults to ensure all fields exist
    return { ...DEFAULT_USER_PREFERENCES, ...data }
  } catch (error) {
    console.error('Failed to parse user preferences:', error)
    return { ...DEFAULT_USER_PREFERENCES }
  }
}

// ADDED: Serialize UserPreferences to JsonValue for database storage
export function serializeUserPreferences(preferences: Partial<UserPreferences>): JsonValue {
  try {
    // Convert to plain object and ensure it's valid JSON
    const serialized = JSON.parse(JSON.stringify(preferences))
    return serialized as JsonValue
  } catch (error) {
    console.error('Failed to serialize user preferences:', error)
    return {} as JsonValue
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

// Helper to get user display name
export function getUserDisplayName(user: User | AuthUser | SessionUser): string {
  if ('khcAdvocateName' in user && user.khcAdvocateName) {
    return user.khcAdvocateName
  }
  if ('name' in user && user.name) {
    return user.name
  }
  return user.email.split('@')[0]
}

// Helper to get user initials
export function getUserInitials(user: User | AuthUser | SessionUser): string {
  const name = ('khcAdvocateName' in user && user.khcAdvocateName) || 
               ('name' in user && user.name) || 
               ''
  
  if (!name) return user.email.charAt(0).toUpperCase()
  
  const parts = name.split(' ').filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

// Helper to convert Prisma user to safe user
export function toSafeUser(user: PrismaUser): SafeUser {
  const { passwordHash, ...safeUser } = user
  return safeUser
}

// Helper to convert raw Prisma user to User with typed preferences
export function toParsedUser(user: PrismaUser | RawUser): User {
  return {
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
    preferences: parseUserPreferences(user.preferences)
  }
}

// Helper to convert User to PublicUser
export function toPublicUser(user: User | PrismaUser): PublicUser {
  return {
    id: user.id,
    khcAdvocateId: user.khcAdvocateId,
    khcAdvocateName: user.khcAdvocateName,
    khcEnrollmentNumber: user.khcEnrollmentNumber,
    role: user.role,
    isVerified: user.isVerified
  }
}

// Helper to prepare user data for database insertion/update
export function prepareUserForDb(
  user: Partial<User> | Partial<CreateUserInput> | Partial<UpdateUserInput>
): Partial<Omit<PrismaUser, 'id' | 'createdAt' | 'updatedAt'>> {
  const { preferences, ...rest } = user
  
  // Create a base object for the return value
  const result: any = { ...rest }

  if (preferences) {
    // Narrow the type: only serialize if it's actually an object
    if (typeof preferences === 'object' && !Array.isArray(preferences)) {
      result.preferences = serializeUserPreferences(preferences as Partial<UserPreferences>)
    } else {
      // If it's already a basic JsonValue (string/number/etc), pass it directly
      result.preferences = preferences as JsonValue
    }
  }
  
  return result
}
