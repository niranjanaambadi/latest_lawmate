// src/types/api.ts
import { User } from '@prisma/client';

// Base API response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ApiError {
  detail: string;
  statusCode: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  user: Pick<User, 'id' | 'email' | 'khcAdvocateId' | 'khcAdvocateName' | 'role' | 'isVerified'>;
}

export interface RegisterRequest {
  email: string;
  mobile?: string;
  password: string;
  khcAdvocateId: string;
  khcAdvocateName: string;
  khcEnrollmentNumber?: string;
}