// src/types/case.ts
import type {
  Case as PrismaCase,
  CaseStatus as PrismaCaseStatus,
  CasePartyRole as PrismaCasePartyRole,
  Document as PrismaDocument,
  DocumentCategory as PrismaDocumentCategory,
  UploadStatus as PrismaUploadStatus,
  OcrStatus as PrismaOcrStatus,
  CaseHistory as PrismaCaseHistory,
  CaseEventType as PrismaCaseEventType,
  AIAnalysis as PrismaAIAnalysis,
  AIAnalysisStatus as PrismaAIAnalysisStatus,
  UrgencyLevel as PrismaUrgencyLevel,
  HearingBrief as PrismaHearingBrief,
} from "@prisma/client"
import type { JsonValue } from "@prisma/client/runtime/library"

// Re-export Prisma enums
export type {
  CaseStatus,
  CasePartyRole,
  DocumentCategory,
  UploadStatus,
  OcrStatus,
  CaseEventType,
  AIAnalysisStatus,
  UrgencyLevel,
} from '@prisma/client'

// ============================================
// CASE TYPES
// ============================================

export interface Case {
  id: string
  advocateId: string
  caseNumber: string | null
  efilingNumber: string
  caseType: string
  caseYear: number
  partyRole: PrismaCasePartyRole
  petitionerName: string
  respondentName: string
  efilingDate: Date
  efilingDetails: string | null
  benchType: string | null
  judgeName: string | null
  courtNumber: string | null
  status: PrismaCaseStatus
  nextHearingDate: Date | null
  khcSourceUrl: string | null
  lastSyncedAt: Date | null
  syncStatus: string
  isVisible: boolean
  transferredReason: string | null
  transferredAt: Date | null
  createdAt: Date
  updatedAt: Date
  
  // Related data (optional, loaded with includes)
  documents?: Document[]
  history?: CaseHistory[]
  aiAnalysis?: AIAnalysis
  hearingBriefs?: HearingBrief[]
  _count?: {
    documents: number
    history: number
    hearingBriefs: number
  }
}

// ============================================
// DOCUMENT TYPES
// ============================================

export interface Document {
  id: string
  caseId: string
  khcDocumentId: string
  category: PrismaDocumentCategory
  title: string
  description: string | null
  s3Key: string
  s3Bucket: string
  s3VersionId: string | null
  fileSize: bigint | number
  contentType: string
  checksumMd5: string | null
  uploadStatus: PrismaUploadStatus
  uploadedAt: Date | null
  uploadError: string | null
  sourceUrl: string | null
  isOcrRequired: boolean
  ocrStatus: PrismaOcrStatus
  ocrJobId: string | null
  extractedText: string | null
  classificationConfidence: number | null
  aiMetadata: JsonValue | null
  isLocked: boolean
  lockReason: string | null
  lockedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// ============================================
// CASE HISTORY TYPES
// ============================================

export interface CaseHistory {
  id: string
  caseId: string
  eventType: PrismaCaseEventType
  eventDate: Date
  businessRecorded: string
  judgeName: string | null
  benchType: string | null
  courtNumber: string | null
  nextHearingDate: Date | null
  orderDocumentId: string | null
  createdAt: Date
  
  // Related data (optional)
  orderDocument?: Document
}

// ============================================
// AI ANALYSIS TYPES
// ============================================

export interface AIAnalysis {
  id: string
  caseId: string
  advocateId: string
  status: PrismaAIAnalysisStatus
  modelVersion: string
  analysis: JsonValue | null
  urgencyLevel: PrismaUrgencyLevel | null
  caseSummary: string | null
  processedAt: Date | null
  processingTimeSeconds: number | null
  tokenCount: number | null
  errorMessage: string | null
  retryCount: number
  createdAt: Date
  updatedAt: Date
}

// ============================================
// HEARING BRIEF TYPES
// ============================================

export interface HearingBrief {
  id: string
  caseId: string
  hearingDate: Date
  content: string
  focusAreas: string[]
  bundleSnapshot: JsonValue | null
  createdAt: Date
  updatedAt: Date
}

// ============================================
// FILTER & QUERY TYPES
// ============================================

export interface CaseFilters {
  status?: string | 'all'
  sort?: string
  order?: 'asc' | 'desc'
  page?: number
  perPage?: number
  search?: string
  caseType?: string
  partyRole?: PrismaCasePartyRole
  urgencyLevel?: PrismaUrgencyLevel
  fromDate?: Date | string
  toDate?: Date | string
}

// ============================================
// STATS TYPES
// ============================================

export interface CaseStats {
  total: number
  byStatus: Record<PrismaCaseStatus, number>
  upcomingHearings: number
  pendingCases: number
  disposedCases: number
  avgProcessingTime?: number
  recentActivity?: number
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateCaseInput {
  advocateId: string
  caseNumber?: string | null
  efilingNumber: string
  caseType: string
  caseYear: number
  partyRole: PrismaCasePartyRole
  petitionerName: string
  respondentName: string
  efilingDate: Date | string
  efilingDetails?: string | null
  benchType?: string | null
  judgeName?: string | null
  courtNumber?: string | null
  status?: PrismaCaseStatus
  nextHearingDate?: Date | string | null
  khcSourceUrl?: string | null
}

export interface UpdateCaseInput {
  caseNumber?: string | null
  caseType?: string
  caseYear?: number
  partyRole?: PrismaCasePartyRole
  petitionerName?: string
  respondentName?: string
  efilingDetails?: string | null
  benchType?: string | null
  judgeName?: string | null
  courtNumber?: string | null
  status?: PrismaCaseStatus
  nextHearingDate?: Date | string | null
  syncStatus?: string
  isVisible?: boolean
  transferredReason?: string | null
}

// ============================================
// EXTENDED TYPES
// ============================================

// Case with all relations loaded
export interface CaseWithRelations extends Case {
  documents: Document[]
  history: CaseHistory[]
  aiAnalysis?: AIAnalysis
  hearingBriefs: HearingBrief[]
}

// Case with counts
export interface CaseWithCounts extends Case {
  _count?: {
    documents: number
    history: number
    hearingBriefs: number
  }
}

// ============================================
// TRANSFORMATION HELPERS
// ============================================

export function transformCase(data: any): Case {
  if (!data) return data

  return {
    id: data.id,
    advocateId: data.advocate_id || data.advocateId,
    caseNumber: data.case_number ?? data.caseNumber ?? null,
    efilingNumber: data.efiling_number || data.efilingNumber,
    caseType: data.case_type || data.caseType,
    caseYear: data.case_year || data.caseYear,
    partyRole: data.party_role || data.partyRole,
    petitionerName: data.petitioner_name || data.petitionerName,
    respondentName: data.respondent_name || data.respondentName,
    efilingDate: new Date(data.efiling_date || data.efilingDate),
    efilingDetails: data.efiling_details ?? data.efilingDetails ?? null,
    benchType: data.bench_type ?? data.benchType ?? null,
    judgeName: data.judge_name ?? data.judgeName ?? null,
    courtNumber: data.court_number ?? data.courtNumber ?? null,
    status: data.status,
    nextHearingDate: data.next_hearing_date || data.nextHearingDate 
      ? new Date(data.next_hearing_date || data.nextHearingDate) 
      : null,
    khcSourceUrl: data.khc_source_url ?? data.khcSourceUrl ?? null,
    lastSyncedAt: data.last_synced_at || data.lastSyncedAt 
      ? new Date(data.last_synced_at || data.lastSyncedAt) 
      : null,
    syncStatus: data.sync_status || data.syncStatus || 'pending',
    isVisible: data.is_visible ?? data.isVisible ?? true,
    transferredReason: data.transferred_reason ?? data.transferredReason ?? null,
    transferredAt: data.transferred_at || data.transferredAt 
      ? new Date(data.transferred_at || data.transferredAt) 
      : null,
    createdAt: new Date(data.created_at || data.createdAt),
    updatedAt: new Date(data.updated_at || data.updatedAt),
    
    // Transform related data if present
    documents: data.documents?.map(transformDocument),
    history: data.history?.map(transformCaseHistory),
    aiAnalysis: data.ai_analysis || data.aiAnalysis 
      ? transformAIAnalysis(data.ai_analysis || data.aiAnalysis) 
      : undefined,
    hearingBriefs: data.hearing_briefs?.map(transformHearingBrief) || data.hearingBriefs,
  }
}

export function transformDocument(data: any): Document {
  if (!data) return data

  return {
    id: data.id,
    caseId: data.case_id || data.caseId,
    khcDocumentId: data.khc_document_id || data.khcDocumentId,
    category: data.category,
    title: data.title,
    description: data.description ?? null,
    s3Key: data.s3_key || data.s3Key,
    s3Bucket: data.s3_bucket || data.s3Bucket,
    s3VersionId: data.s3_version_id ?? data.s3VersionId ?? null,
    fileSize: data.file_size || data.fileSize,
    contentType: data.content_type || data.contentType,
    checksumMd5: data.checksum_md5 ?? data.checksumMd5 ?? null,
    uploadStatus: data.upload_status || data.uploadStatus,
    uploadedAt: data.uploaded_at || data.uploadedAt 
      ? new Date(data.uploaded_at || data.uploadedAt) 
      : null,
    uploadError: data.upload_error ?? data.uploadError ?? null,
    sourceUrl: data.source_url ?? data.sourceUrl ?? null,
    isOcrRequired: data.is_ocr_required ?? data.isOcrRequired ?? false,
    ocrStatus: data.ocr_status || data.ocrStatus,
    ocrJobId: data.ocr_job_id ?? data.ocrJobId ?? null,
    extractedText: data.extracted_text ?? data.extractedText ?? null,
    classificationConfidence: data.classification_confidence ?? data.classificationConfidence ?? null,
    aiMetadata: data.ai_metadata ?? data.aiMetadata ?? null,
    isLocked: data.is_locked ?? data.isLocked ?? false,
    lockReason: data.lock_reason ?? data.lockReason ?? null,
    lockedAt: data.locked_at || data.lockedAt 
      ? new Date(data.locked_at || data.lockedAt) 
      : null,
    createdAt: new Date(data.created_at || data.createdAt),
    updatedAt: new Date(data.updated_at || data.updatedAt),
  }
}

export function transformCaseHistory(data: any): CaseHistory {
  if (!data) return data

  return {
    id: data.id,
    caseId: data.case_id || data.caseId,
    eventType: data.event_type || data.eventType,
    eventDate: new Date(data.event_date || data.eventDate),
    businessRecorded: data.business_recorded || data.businessRecorded,
    judgeName: data.judge_name ?? data.judgeName ?? null,
    benchType: data.bench_type ?? data.benchType ?? null,
    courtNumber: data.court_number ?? data.courtNumber ?? null,
    nextHearingDate: data.next_hearing_date || data.nextHearingDate 
      ? new Date(data.next_hearing_date || data.nextHearingDate) 
      : null,
    orderDocumentId: data.order_document_id ?? data.orderDocumentId ?? null,
    createdAt: new Date(data.created_at || data.createdAt),
    
    orderDocument: data.order_document || data.orderDocument 
      ? transformDocument(data.order_document || data.orderDocument) 
      : undefined,
  }
}

export function transformAIAnalysis(data: any): AIAnalysis {
  if (!data) return data

  return {
    id: data.id,
    caseId: data.case_id || data.caseId,
    advocateId: data.advocate_id || data.advocateId,
    status: data.status,
    modelVersion: data.model_version || data.modelVersion,
    analysis: data.analysis ?? null,
    urgencyLevel: data.urgency_level ?? data.urgencyLevel ?? null,
    caseSummary: data.case_summary ?? data.caseSummary ?? null,
    processedAt: data.processed_at || data.processedAt 
      ? new Date(data.processed_at || data.processedAt) 
      : null,
    processingTimeSeconds: data.processing_time_seconds ?? data.processingTimeSeconds ?? null,
    tokenCount: data.token_count ?? data.tokenCount ?? null,
    errorMessage: data.error_message ?? data.errorMessage ?? null,
    retryCount: data.retry_count ?? data.retryCount ?? 0,
    createdAt: new Date(data.created_at || data.createdAt),
    updatedAt: new Date(data.updated_at || data.updatedAt),
  }
}

export function transformHearingBrief(data: any): HearingBrief {
  if (!data) return data

  return {
    id: data.id,
    caseId: data.case_id || data.caseId,
    hearingDate: new Date(data.hearing_date || data.hearingDate),
    content: data.content,
    focusAreas: data.focus_areas || data.focusAreas || [],
    bundleSnapshot: data.bundle_snapshot ?? data.bundleSnapshot ?? null,
    createdAt: new Date(data.created_at || data.createdAt),
    updatedAt: new Date(data.updated_at || data.updatedAt),
  }
}

// Transform frontend data to backend format (camelCase → snake_case)
export function prepareCaseForBackend(frontendCase: Partial<Case> | CreateCaseInput | UpdateCaseInput): any {
  const backendData: any = {}

  // Helper to set value if defined
  const set = (backendKey: string, value: any) => {
    if (value !== undefined) backendData[backendKey] = value
  }

  // Map all fields
  if ('advocateId' in frontendCase) set('advocate_id', frontendCase.advocateId)
  if ('caseNumber' in frontendCase) set('case_number', frontendCase.caseNumber)
  if ('efilingNumber' in frontendCase) set('efiling_number', frontendCase.efilingNumber)
  if ('caseType' in frontendCase) set('case_type', frontendCase.caseType)
  if ('caseYear' in frontendCase) set('case_year', frontendCase.caseYear)
  if ('partyRole' in frontendCase) set('party_role', frontendCase.partyRole)
  if ('petitionerName' in frontendCase) set('petitioner_name', frontendCase.petitionerName)
  if ('respondentName' in frontendCase) set('respondent_name', frontendCase.respondentName)
  if ('efilingDate' in frontendCase) set('efiling_date', frontendCase.efilingDate)
  if ('efilingDetails' in frontendCase) set('efiling_details', frontendCase.efilingDetails)
  if ('benchType' in frontendCase) set('bench_type', frontendCase.benchType)
  if ('judgeName' in frontendCase) set('judge_name', frontendCase.judgeName)
  if ('courtNumber' in frontendCase) set('court_number', frontendCase.courtNumber)
  if ('status' in frontendCase) set('status', frontendCase.status)
  if ('nextHearingDate' in frontendCase) set('next_hearing_date', frontendCase.nextHearingDate)
  if ('khcSourceUrl' in frontendCase) set('khc_source_url', frontendCase.khcSourceUrl)
  if ('syncStatus' in frontendCase) set('sync_status', frontendCase.syncStatus)
  if ('isVisible' in frontendCase) set('is_visible', frontendCase.isVisible)
  if ('transferredReason' in frontendCase) set('transferred_reason', frontendCase.transferredReason)
  if ('transferredAt' in frontendCase) set('transferred_at', frontendCase.transferredAt)

  return backendData
}

// Transform filters to backend format
export function prepareCaseFiltersForBackend(filters: CaseFilters): any {
  return {
    status: filters.status,
    sort: filters.sort,
    order: filters.order,
    page: filters.page,
    per_page: filters.perPage,
    search: filters.search,
    case_type: filters.caseType,
    party_role: filters.partyRole,
    urgency_level: filters.urgencyLevel,
    from_date: filters.fromDate,
    to_date: filters.toDate,
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function getCaseDisplayName(caseItem: Case): string {
  return caseItem.caseNumber || caseItem.efilingNumber
}

export function getCaseTitle(caseItem: Case): string {
  return `${caseItem.petitionerName} vs ${caseItem.respondentName}`
}

export function getFileSizeDisplay(bytes: bigint | number): string {
  const numBytes = typeof bytes === 'bigint' ? Number(bytes) : bytes
  
  if (numBytes < 1024) return `${numBytes} B`
  if (numBytes < 1024 * 1024) return `${(numBytes / 1024).toFixed(2)} KB`
  if (numBytes < 1024 * 1024 * 1024) return `${(numBytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(numBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function getStatusColor(status: PrismaCaseStatus): string {
  const colors: Record<PrismaCaseStatus, string> = {
    FILED: 'blue',
    REGISTERED: 'indigo',
    PENDING: 'yellow',
    DISPOSED: 'green',
    TRANSFERRED: 'gray',
  }
  return colors[status] || 'gray'
}

export function getUrgencyColor(level: PrismaUrgencyLevel): string {
  const colors: Record<PrismaUrgencyLevel, string> = {
    LOW: 'green',
    MEDIUM: 'yellow',
    HIGH: 'orange',
    CRITICAL: 'red',
  }
  return colors[level] || 'gray'
}

export function isHearingUpcoming(nextHearingDate: Date | null, daysThreshold: number = 7): boolean {
  if (!nextHearingDate) return false
  
  const now = new Date()
  const diff = nextHearingDate.getTime() - now.getTime()
  const days = diff / (1000 * 60 * 60 * 24)
  
  return days >= 0 && days <= daysThreshold
}

export function isHearingOverdue(nextHearingDate: Date | null): boolean {
  if (!nextHearingDate) return false
  
  const now = new Date()
  return nextHearingDate.getTime() < now.getTime()
}