// src/lib/hooks/useAnalysis.ts
'use client';

import useSWR from 'swr';
import { 
  getAIAnalysis, 
  getBundleAnalysis,
  getPrecedents,
  getRiskAssessment,
  getAllInsights
} from '@/lib/api/analysis';
import { AIAnalysis } from '@/types/analysis';

export function useAIAnalysis(caseId: string | null) {
  return useSWR<AIAnalysis | null>(
    caseId ? `/api/cases/${caseId}/analysis` : null,
    () => caseId ? getAIAnalysis(caseId) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );
}

export function useBundleAnalysis(caseId: string | null) {
  return useSWR(
    caseId ? `/api/ai/${caseId}/bundle-analysis` : null,
    () => caseId ? getBundleAnalysis(caseId) : null,
    {
      revalidateOnFocus: false
    }
  );
}

export function usePrecedents(caseId: string | null) {
  return useSWR(
    caseId ? `/api/ai/${caseId}/precedents` : null,
    () => caseId ? getPrecedents(caseId) : null,
    {
      revalidateOnFocus: false
    }
  );
}

export function useRiskAssessment(caseId: string | null) {
  return useSWR(
    caseId ? `/api/ai/${caseId}/risk-assessment` : null,
    () => caseId ? getRiskAssessment(caseId) : null,
    {
      revalidateOnFocus: false
    }
  );
}

export function useAllInsights(caseId: string | null) {
  return useSWR(
    caseId ? `/api/cases/${caseId}/ai-insights` : null,
    () => caseId ? getAllInsights(caseId) : null,
    {
      revalidateOnFocus: false
    }
  );
}