// src/lib/api/auth.ts
import type { LoginRequest, RegisterRequest } from '@/types/api'
import type { User } from '@/types/user'
import apiClient from './client'

// Response from backend
interface BackendLoginResponse {
  access_token: string
  refresh_token?: string
  token_type: string
  user: {
    id: string
    email: string
    khc_advocate_id: string
    khc_advocate_name: string
    role?: string
    is_verified?: boolean
  }
}

// Transform to NextAuth expected format
export interface LoginResponse {
  access_token: string
  refresh_token: string
  token_type: string
  user: {
    id: string
    email: string
    khcAdvocateId: string
    khcAdvocateName: string
    role?: string
    isVerified?: boolean
  }
}

export const authApi = {
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // Note: Your client returns the data directly, not wrapped in { data }
    const response = await apiClient.post<BackendLoginResponse>(
      '/api/v1/auth/login',
      credentials
    )

    // Transform snake_case to camelCase for frontend
    return {
      access_token: response.access_token,
      refresh_token: response.refresh_token || response.access_token,
      token_type: response.token_type || 'bearer',
      user: {
        id: response.user.id,
        email: response.user.email,
        khcAdvocateId: response.user.khc_advocate_id,
        khcAdvocateName: response.user.khc_advocate_name,
        role: response.user.role,
        isVerified: response.user.is_verified,
      },
    }
  },

  async register(userData: RegisterRequest): Promise<User> {
    const response = await apiClient.post<any>('/api/v1/auth/register', userData)
    
    // Transform backend response to match User type
    return {
      id: response.id,
      email: response.email,
      mobile: response.mobile || null,
      khcAdvocateId: response.khc_advocate_id,
      khcAdvocateName: response.khc_advocate_name,
      khcEnrollmentNumber: response.khc_enrollment_number || null,
      role: response.role,
      isActive: response.is_active,
      isVerified: response.is_verified,
      createdAt: new Date(response.created_at),
      updatedAt: new Date(response.updated_at),
      lastLoginAt: response.last_login_at ? new Date(response.last_login_at) : null,
      lastSyncAt: response.last_sync_at ? new Date(response.last_sync_at) : null,
      preferences: response.preferences || {},
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<any>('/api/v1/auth/me')
    
    // Transform backend response to match User type
    return {
      id: response.id,
      email: response.email,
      mobile: response.mobile || null,
      khcAdvocateId: response.khc_advocate_id,
      khcAdvocateName: response.khc_advocate_name,
      khcEnrollmentNumber: response.khc_enrollment_number || null,
      role: response.role,
      isActive: response.is_active,
      isVerified: response.is_verified,
      createdAt: new Date(response.created_at),
      updatedAt: new Date(response.updated_at),
      lastLoginAt: response.last_login_at ? new Date(response.last_login_at) : null,
      lastSyncAt: response.last_sync_at ? new Date(response.last_sync_at) : null,
      preferences: response.preferences || {},
    }
  },

  async logout(): Promise<void> {
    await apiClient.post('/api/v1/auth/logout')
  },
}