// src/lib/api/cases.ts
import type { Case, CaseFilters, CaseStats } from '@/types/case'
import type { PaginatedResponse } from '@/types/api'
import apiClient from './client'

export const casesApi = {
  async getAll(filters?: CaseFilters): Promise<PaginatedResponse<Case>> {
    // Client returns data directly, not wrapped in { data }
    const response = await apiClient.get<any>('/api/v1/cases', { params: filters })
    
    // Transform backend response
    return {
      items: (response.items || response.cases || []).map(transformCase),
      total: response.total || 0,
      page: response.page || filters?.page || 1,
      perPage: response.per_page || response.perPage || filters?.perPage || 20,
      totalPages: response.total_pages || response.totalPages || 0,
    }
  },

  async getById(id: string): Promise<Case> {
    const response = await apiClient.get<any>(`/api/v1/cases/${id}`)
    return transformCase(response)
  },

  async getStats(): Promise<CaseStats> {
    const response = await apiClient.get<CaseStats>('/api/v1/cases/stats')
    return response
  },

  async getUpcomingHearings(days: number = 7): Promise<Case[]> {
    const response = await apiClient.get<any>('/api/v1/cases/upcoming-hearings', {
      params: { days },
    })
    return (response.cases || response || []).map(transformCase)
  },

  async search(query: string): Promise<{ cases: Case[] }> {
    const response = await apiClient.get<any>('/api/v1/cases/search', {
      params: { q: query },
    })
    return {
      cases: (response.cases || response || []).map(transformCase)
    }
  },

  async syncCase(caseData: Partial<Case>): Promise<Case> {
    // Transform camelCase to snake_case for backend
    const backendData = prepareBackendCaseData(caseData)
    const response = await apiClient.post<any>('/api/v1/sync/cases', backendData)
    return transformCase(response)
  },

  async updateCase(id: string, updates: Partial<Case>): Promise<Case> {
    // Transform camelCase to snake_case for backend
    const backendData = prepareBackendCaseData(updates)
    const response = await apiClient.patch<any>(`/api/v1/cases/${id}`, backendData)
    return transformCase(response)
  },

  async deleteCase(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/cases/${id}`)
  },
}

// Helper function to transform backend case data (snake_case) to frontend format (camelCase)
function transformCase(backendCase: any): Case {
  if (!backendCase) return backendCase

  return {
    id: backendCase.id,
    advocateId: backendCase.advocate_id,
    caseNumber: backendCase.case_number,
    efilingNumber: backendCase.efiling_number,
    caseType: backendCase.case_type,
    caseYear: backendCase.case_year,
    partyRole: backendCase.party_role,
    petitionerName: backendCase.petitioner_name,
    respondentName: backendCase.respondent_name,
    efilingDate: backendCase.efiling_date ? new Date(backendCase.efiling_date) : new Date(),
    efilingDetails: backendCase.efiling_details,
    benchType: backendCase.bench_type,
    judgeName: backendCase.judge_name,
    courtNumber: backendCase.court_number,
    status: backendCase.status,
    nextHearingDate: backendCase.next_hearing_date ? new Date(backendCase.next_hearing_date) : null,
    khcSourceUrl: backendCase.khc_source_url,
    lastSyncedAt: backendCase.last_synced_at ? new Date(backendCase.last_synced_at) : null,
    syncStatus: backendCase.sync_status,
    isVisible: backendCase.is_visible ?? true,
    transferredReason: backendCase.transferred_reason,
    transferredAt: backendCase.transferred_at ? new Date(backendCase.transferred_at) : null,
    createdAt: backendCase.created_at ? new Date(backendCase.created_at) : new Date(),
    updatedAt: backendCase.updated_at ? new Date(backendCase.updated_at) : new Date(),
    
    // Include related data if present
    documents: backendCase.documents?.map((doc: any) => ({
      id: doc.id,
      caseId: doc.case_id,
      khcDocumentId: doc.khc_document_id,
      category: doc.category,
      title: doc.title,
      description: doc.description,
      s3Key: doc.s3_key,
      s3Bucket: doc.s3_bucket,
      s3VersionId: doc.s3_version_id,
      fileSize: doc.file_size,
      contentType: doc.content_type,
      checksumMd5: doc.checksum_md5,
      uploadStatus: doc.upload_status,
      uploadedAt: doc.uploaded_at ? new Date(doc.uploaded_at) : null,
      uploadError: doc.upload_error,
      sourceUrl: doc.source_url,
      isOcrRequired: doc.is_ocr_required,
      ocrStatus: doc.ocr_status,
      ocrJobId: doc.ocr_job_id,
      extractedText: doc.extracted_text,
      classificationConfidence: doc.classification_confidence,
      aiMetadata: doc.ai_metadata,
      isLocked: doc.is_locked,
      lockReason: doc.lock_reason,
      lockedAt: doc.locked_at ? new Date(doc.locked_at) : null,
      createdAt: doc.created_at ? new Date(doc.created_at) : new Date(),
      updatedAt: doc.updated_at ? new Date(doc.updated_at) : new Date(),
    })),
    
    history: backendCase.history,
    
    aiAnalysis: backendCase.ai_analysis ? {
      id: backendCase.ai_analysis.id,
      caseId: backendCase.ai_analysis.case_id,
      advocateId: backendCase.ai_analysis.advocate_id,
      status: backendCase.ai_analysis.status,
      modelVersion: backendCase.ai_analysis.model_version,
      analysis: backendCase.ai_analysis.analysis,
      urgencyLevel: backendCase.ai_analysis.urgency_level,
      caseSummary: backendCase.ai_analysis.case_summary,
      processedAt: backendCase.ai_analysis.processed_at ? new Date(backendCase.ai_analysis.processed_at) : null,
      processingTimeSeconds: backendCase.ai_analysis.processing_time_seconds,
      tokenCount: backendCase.ai_analysis.token_count,
      errorMessage: backendCase.ai_analysis.error_message,
      retryCount: backendCase.ai_analysis.retry_count,
      createdAt: backendCase.ai_analysis.created_at ? new Date(backendCase.ai_analysis.created_at) : new Date(),
      updatedAt: backendCase.ai_analysis.updated_at ? new Date(backendCase.ai_analysis.updated_at) : new Date(),
    } : undefined,
    
    hearingBriefs: backendCase.hearing_briefs,
  }
}

// Helper function to transform frontend case data (camelCase) to backend format (snake_case)
function prepareBackendCaseData(frontendCase: Partial<Case>): any {
  const backendData: any = {}

  // Only include fields that are present
  if (frontendCase.advocateId !== undefined) backendData.advocate_id = frontendCase.advocateId
  if (frontendCase.caseNumber !== undefined) backendData.case_number = frontendCase.caseNumber
  if (frontendCase.efilingNumber !== undefined) backendData.efiling_number = frontendCase.efilingNumber
  if (frontendCase.caseType !== undefined) backendData.case_type = frontendCase.caseType
  if (frontendCase.caseYear !== undefined) backendData.case_year = frontendCase.caseYear
  if (frontendCase.partyRole !== undefined) backendData.party_role = frontendCase.partyRole
  if (frontendCase.petitionerName !== undefined) backendData.petitioner_name = frontendCase.petitionerName
  if (frontendCase.respondentName !== undefined) backendData.respondent_name = frontendCase.respondentName
  if (frontendCase.efilingDate !== undefined) backendData.efiling_date = frontendCase.efilingDate
  if (frontendCase.efilingDetails !== undefined) backendData.efiling_details = frontendCase.efilingDetails
  if (frontendCase.benchType !== undefined) backendData.bench_type = frontendCase.benchType
  if (frontendCase.judgeName !== undefined) backendData.judge_name = frontendCase.judgeName
  if (frontendCase.courtNumber !== undefined) backendData.court_number = frontendCase.courtNumber
  if (frontendCase.status !== undefined) backendData.status = frontendCase.status
  if (frontendCase.nextHearingDate !== undefined) backendData.next_hearing_date = frontendCase.nextHearingDate
  if (frontendCase.khcSourceUrl !== undefined) backendData.khc_source_url = frontendCase.khcSourceUrl
  if (frontendCase.lastSyncedAt !== undefined) backendData.last_synced_at = frontendCase.lastSyncedAt
  if (frontendCase.syncStatus !== undefined) backendData.sync_status = frontendCase.syncStatus
  if (frontendCase.isVisible !== undefined) backendData.is_visible = frontendCase.isVisible
  if (frontendCase.transferredReason !== undefined) backendData.transferred_reason = frontendCase.transferredReason
  if (frontendCase.transferredAt !== undefined) backendData.transferred_at = frontendCase.transferredAt

  return backendData
}