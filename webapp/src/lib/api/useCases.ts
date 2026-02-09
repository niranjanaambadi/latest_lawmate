// src/lib/api/useCases.ts
import useSWR from 'swr';
import { Case, CaseStatus } from '@prisma/client';
import { CaseFilters } from '@/types/case';

// Types for API responses
interface CasesResponse {
  cases: Case[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CaseStatsResponse {
  totalCases: number;
  pendingCases: number;
  disposedCases: number;
  upcomingHearings: number;
  totalDocuments: number;
  casesByStatus: Record<CaseStatus, number>;
  casesByType: Record<string, number>;
  monthlyTrend: Array<{
    month: string;
    count: number;
  }>;
}

// Fetcher function
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch');
  }
  return response.json();
};

// Build query string from filters
function buildQueryString(filters?: CaseFilters): string {
  if (!filters) return '';
  
  const params = new URLSearchParams();
  
  if (filters.status && filters.status !== 'all') {
    params.append('status', filters.status);
  }
  if (filters.caseType) {
    params.append('caseType', filters.caseType);
  }
  
  if (filters.search) {
    params.append('search', filters.search);
  }
  if (filters.sort) {
    params.append('sort', filters.sort);
  }
  if (filters.order) {
    params.append('order', filters.order);
  }
  if (filters.page) {
    params.append('page', filters.page.toString());
  }
  if (filters.perPage) {
    params.append('limit', filters.perPage.toString());
  }

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

// Hook to fetch multiple cases
export function useCases(filters?: CaseFilters) {
  const queryString = buildQueryString(filters);
  
  const { data, error, isLoading, mutate } = useSWR<CasesResponse>(
    `/api/cases${queryString}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    cases: data?.cases || [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    error: error?.message,
    mutate,
  };
}

// Hook to fetch a single case
export function useCase(caseId?: string) {
  const { data, error, isLoading, mutate } = useSWR<Case>(
    caseId ? `/api/cases/${caseId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    case: data,
    isLoading,
    isError: error,
    error: error?.message,
    mutate,
  };
}

// Hook to fetch case statistics
export function useCaseStats() {
  const { data, error, isLoading, mutate } = useSWR<CaseStatsResponse>(
    '/api/cases/stats',
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 60000, // Refresh every minute
    }
  );

  return {
    stats: data,
    isLoading,
    isError: error,
    error: error?.message,
    mutate,
  };
}

// Hook to fetch upcoming hearings
export function useUpcomingHearings(days: number = 7) {
  const { data, error, isLoading, mutate } = useSWR<Case[]>(
    `/api/cases/hearings?days=${days}`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 300000, // Refresh every 5 minutes
    }
  );

  return {
    hearings: data || [],
    isLoading,
    isError: error,
    error: error?.message,
    mutate,
  };
}

// Mutation functions for case operations

export async function createCase(data: {
  caseNumber?: string;
  efilingNumber: string;
  caseType: string;
  caseYear: number;
  partyRole: string;
  petitionerName: string;
  respondentName: string;
  efilingDate: string;
  efilingDetails?: string;
  benchType?: string;
  judgeName?: string;
  courtNumber?: string;
  nextHearingDate?: string;
  khcSourceUrl?: string;
}) {
  const response = await fetch('/api/cases', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create case');
  }

  return response.json();
}

export async function updateCase(caseId: string, data: Partial<Case>) {
  const response = await fetch(`/api/cases/${caseId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update case');
  }

  return response.json();
}

export async function deleteCase(caseId: string) {
  const response = await fetch(`/api/cases/${caseId}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete case');
  }

  return response.json();
}

export async function transferCase(
  caseId: string,
  reason: string
) {
  const response = await fetch(`/api/cases/${caseId}/transfer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to transfer case');
  }

  return response.json();
}

export async function syncCase(caseId: string) {
  const response = await fetch(`/api/cases/${caseId}/sync`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync case');
  }

  return response.json();
}

export async function syncAllCases() {
  const response = await fetch('/api/cases/sync-all', {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to sync cases');
  }

  return response.json();
}

// Hook for case documents
export function useCaseDocuments(caseId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    caseId ? `/api/cases/${caseId}/documents` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    documents: data?.documents || [],
    isLoading,
    isError: error,
    error: error?.message,
    mutate,
  };
}

// Hook for case history
export function useCaseHistory(caseId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    caseId ? `/api/cases/${caseId}/history` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  return {
    history: data?.history || [],
    isLoading,
    isError: error,
    error: error?.message,
    mutate,
  };
}

// Hook for AI analysis
export function useCaseAIAnalysis(caseId?: string) {
  const { data, error, isLoading, mutate } = useSWR(
    caseId ? `/api/cases/${caseId}/ai-analysis` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 30000, // Cache for 30 seconds
    }
  );

  return {
    analysis: data?.analysis,
    isLoading,
    isError: error,
    error: error?.message,
    mutate,
  };
}

// Trigger AI analysis
export async function triggerAIAnalysis(caseId: string) {
  const response = await fetch(`/api/cases/${caseId}/ai-analysis`, {
    method: 'POST',
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to trigger AI analysis');
  }

  return response.json();
}

// Export all hooks and functions
export default {
  useCases,
  useCase,
  useCaseStats,
  useUpcomingHearings,
  useCaseDocuments,
  useCaseHistory,
  useCaseAIAnalysis,
  createCase,
  updateCase,
  deleteCase,
  transferCase,
  syncCase,
  syncAllCases,
  triggerAIAnalysis,
};