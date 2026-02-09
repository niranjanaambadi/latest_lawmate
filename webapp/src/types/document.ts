// src/types/document.ts
import type {
  Document as PrismaDocument,
  DocumentCategory as PrismaDocumentCategory,
  UploadStatus as PrismaUploadStatus,
  OcrStatus as PrismaOcrStatus,
} from "@prisma/client"
import type { JsonValue } from "@prisma/client/runtime/library"

// Re-export Prisma enums
export type {
  DocumentCategory,
  UploadStatus,
  OcrStatus,
} from '@prisma/client'

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
  fileSize: bigint  // Change this from: bigint | number
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
  aiMetadata: DocumentAIMetadata | null
  isLocked: boolean
  lockReason: string | null
  lockedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

// ============================================
// AI METADATA STRUCTURE
// ============================================

export interface DocumentAIMetadata {
  suggestedCategory?: PrismaDocumentCategory
  keywords?: string[]
  summary?: string
  entities?: {
    persons?: string[]
    organizations?: string[]
    locations?: string[]
    dates?: string[]
  }
  sentiment?: 'positive' | 'negative' | 'neutral'
  language?: string
  pageCount?: number
  hasSignature?: boolean
  hasStamp?: boolean
  confidenceScore?: number
}

// ============================================
// FILTER & QUERY TYPES
// ============================================

export interface DocumentFilters {
  caseId?: string
  category?: PrismaDocumentCategory | 'all'
  uploadStatus?: PrismaUploadStatus
  ocrStatus?: PrismaOcrStatus
  search?: string
  isLocked?: boolean
  fromDate?: Date | string
  toDate?: Date | string
  page?: number
  perPage?: number
  sort?: 'title' | 'uploadedAt' | 'createdAt' | 'fileSize'
  order?: 'asc' | 'desc'
}

// ============================================
// INPUT TYPES
// ============================================

export interface CreateDocumentInput {
  caseId: string
  khcDocumentId: string
  category: PrismaDocumentCategory
  title: string
  description?: string | null
  s3Key: string
  s3Bucket?: string
  s3VersionId?: string | null
  fileSize: bigint | number
  contentType?: string
  checksumMd5?: string | null
  sourceUrl?: string | null
  isOcrRequired?: boolean
}

export interface UpdateDocumentInput {
  title?: string
  description?: string | null
  category?: PrismaDocumentCategory
  uploadStatus?: PrismaUploadStatus
  uploadedAt?: Date | string
  uploadError?: string | null
  ocrStatus?: PrismaOcrStatus
  ocrJobId?: string | null
  extractedText?: string | null
  classificationConfidence?: number | null
  aiMetadata?: DocumentAIMetadata | JsonValue
  isLocked?: boolean
  lockReason?: string | null
}

// ============================================
// UPLOAD TYPES
// ============================================

export interface DocumentUploadProgress {
  documentId: string
  fileName: string
  fileSize: number
  uploadedBytes: number
  percentage: number
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed'
  error?: string
}

export interface DocumentUploadResult {
  documentId: string
  s3Key: string
  s3Bucket: string
  fileSize: number
  checksumMd5: string
  uploadedAt: Date
}

// ============================================
// OCR TYPES
// ============================================

export interface OCRRequest {
  documentId: string
  s3Key: string
  s3Bucket: string
  language?: 'eng' | 'hin' | 'mal' // English, Hindi, Malayalam
  outputFormat?: 'text' | 'searchable_pdf'
}

export interface OCRResult {
  documentId: string
  extractedText: string
  confidence: number
  pageCount: number
  processingTime: number
  language: string
  error?: string
}

// ============================================
// DOWNLOAD TYPES
// ============================================

export interface DocumentDownloadOptions {
  includeMetadata?: boolean
  format?: 'original' | 'pdf' | 'text'
  watermark?: boolean
}

export interface DocumentDownloadResult {
  url: string
  expiresAt: Date
  fileName: string
  contentType: string
  fileSize: number
}

// ============================================
// BATCH OPERATIONS
// ============================================

export interface BatchDocumentOperation {
  documentIds: string[]
  operation: 'delete' | 'lock' | 'unlock' | 'categorize' | 'ocr'
  params?: {
    category?: PrismaDocumentCategory
    lockReason?: string
    ocrLanguage?: string
  }
}

export interface BatchOperationResult {
  succeeded: string[]
  failed: Array<{
    documentId: string
    error: string
  }>
  total: number
  successCount: number
  failureCount: number
}

// ============================================
// STATISTICS TYPES
// ============================================

export interface DocumentStats {
  total: number
  byCategory: Record<PrismaDocumentCategory, number>
  byUploadStatus: Record<PrismaUploadStatus, number>
  byOcrStatus: Record<PrismaOcrStatus, number>
  totalSize: number // in bytes
  averageSize: number // in bytes
  locked: number
  requiresOcr: number
}

// ============================================
// EXTENDED TYPES
// ============================================

export interface DocumentWithCase extends Document {
  case: {
    id: string
    caseNumber: string | null
    efilingNumber: string
    petitionerName: string
    respondentName: string
  }
}

// ============================================
// TRANSFORMATION HELPERS
// ============================================

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
    s3Bucket: data.s3_bucket || data.s3Bucket || 'lawmate-case-pdfs',
    s3VersionId: data.s3_version_id ?? data.s3VersionId ?? null,
    fileSize: data.file_size || data.fileSize,
    contentType: data.content_type || data.contentType || 'application/pdf',
    checksumMd5: data.checksum_md5 ?? data.checksumMd5 ?? null,
    uploadStatus: data.upload_status || data.uploadStatus || 'PENDING',
    uploadedAt: data.uploaded_at || data.uploadedAt 
      ? new Date(data.uploaded_at || data.uploadedAt) 
      : null,
    uploadError: data.upload_error ?? data.uploadError ?? null,
    sourceUrl: data.source_url ?? data.sourceUrl ?? null,
    isOcrRequired: data.is_ocr_required ?? data.isOcrRequired ?? false,
    ocrStatus: data.ocr_status || data.ocrStatus || 'NOT_REQUIRED',
    ocrJobId: data.ocr_job_id ?? data.ocrJobId ?? null,
    extractedText: data.extracted_text ?? data.extractedText ?? null,
    classificationConfidence: data.classification_confidence ?? data.classificationConfidence ?? null,
    aiMetadata: parseAIMetadata(data.ai_metadata ?? data.aiMetadata),
    isLocked: data.is_locked ?? data.isLocked ?? false,
    lockReason: data.lock_reason ?? data.lockReason ?? null,
    lockedAt: data.locked_at || data.lockedAt 
      ? new Date(data.locked_at || data.lockedAt) 
      : null,
    createdAt: new Date(data.created_at || data.createdAt),
    updatedAt: new Date(data.updated_at || data.updatedAt),
  }
}

export function prepareDocumentForBackend(
  frontendDoc: Partial<Document> | CreateDocumentInput | UpdateDocumentInput
): any {
  const backendData: any = {}

  // Helper to set value if defined
  const set = (backendKey: string, value: any) => {
    if (value !== undefined) backendData[backendKey] = value
  }

  // Map all fields
  if ('caseId' in frontendDoc) set('case_id', frontendDoc.caseId)
  if ('khcDocumentId' in frontendDoc) set('khc_document_id', frontendDoc.khcDocumentId)
  if ('category' in frontendDoc) set('category', frontendDoc.category)
  if ('title' in frontendDoc) set('title', frontendDoc.title)
  if ('description' in frontendDoc) set('description', frontendDoc.description)
  if ('s3Key' in frontendDoc) set('s3_key', frontendDoc.s3Key)
  if ('s3Bucket' in frontendDoc) set('s3_bucket', frontendDoc.s3Bucket)
  if ('s3VersionId' in frontendDoc) set('s3_version_id', frontendDoc.s3VersionId)
  if ('fileSize' in frontendDoc) set('file_size', frontendDoc.fileSize)
  if ('contentType' in frontendDoc) set('content_type', frontendDoc.contentType)
  if ('checksumMd5' in frontendDoc) set('checksum_md5', frontendDoc.checksumMd5)
  if ('uploadStatus' in frontendDoc) set('upload_status', frontendDoc.uploadStatus)
  if ('uploadedAt' in frontendDoc) set('uploaded_at', frontendDoc.uploadedAt)
  if ('uploadError' in frontendDoc) set('upload_error', frontendDoc.uploadError)
  if ('sourceUrl' in frontendDoc) set('source_url', frontendDoc.sourceUrl)
  if ('isOcrRequired' in frontendDoc) set('is_ocr_required', frontendDoc.isOcrRequired)
  if ('ocrStatus' in frontendDoc) set('ocr_status', frontendDoc.ocrStatus)
  if ('ocrJobId' in frontendDoc) set('ocr_job_id', frontendDoc.ocrJobId)
  if ('extractedText' in frontendDoc) set('extracted_text', frontendDoc.extractedText)
  if ('classificationConfidence' in frontendDoc) set('classification_confidence', frontendDoc.classificationConfidence)
  if ('aiMetadata' in frontendDoc) set('ai_metadata', frontendDoc.aiMetadata)
  if ('isLocked' in frontendDoc) set('is_locked', frontendDoc.isLocked)
  if ('lockReason' in frontendDoc) set('lock_reason', frontendDoc.lockReason)
  if ('lockedAt' in frontendDoc) set('locked_at', frontendDoc.lockedAt)

  return backendData
}

export function prepareDocumentFiltersForBackend(filters: DocumentFilters): any {
  return {
    case_id: filters.caseId,
    category: filters.category,
    upload_status: filters.uploadStatus,
    ocr_status: filters.ocrStatus,
    search: filters.search,
    is_locked: filters.isLocked,
    from_date: filters.fromDate,
    to_date: filters.toDate,
    page: filters.page,
    per_page: filters.perPage,
    sort: filters.sort,
    order: filters.order,
  }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

export function parseAIMetadata(json: JsonValue | null): DocumentAIMetadata | null {
  if (!json || json === null) return null
  
  try {
    const data = typeof json === 'string' ? JSON.parse(json) : json
    return data as DocumentAIMetadata
  } catch (error) {
    console.error('Failed to parse AI metadata:', error)
    return null
  }
}

export function serializeAIMetadata(metadata: DocumentAIMetadata): JsonValue {
  try {
    return JSON.parse(JSON.stringify(metadata)) as JsonValue
  } catch (error) {
    console.error('Failed to serialize AI metadata:', error)
    return {} as JsonValue
  }
}

export function getFileSizeDisplay(bytes: bigint | number): string {
  const numBytes = typeof bytes === 'bigint' ? Number(bytes) : bytes
  
  if (numBytes < 1024) return `${numBytes} B`
  if (numBytes < 1024 * 1024) return `${(numBytes / 1024).toFixed(2)} KB`
  if (numBytes < 1024 * 1024 * 1024) return `${(numBytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(numBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function getFileSizeInBytes(sizeStr: string): number {
  const match = sizeStr.match(/^([\d.]+)\s*(B|KB|MB|GB)$/i)
  if (!match) return 0
  
  const [, value, unit] = match
  const numValue = parseFloat(value)
  
  switch (unit.toUpperCase()) {
    case 'B': return numValue
    case 'KB': return numValue * 1024
    case 'MB': return numValue * 1024 * 1024
    case 'GB': return numValue * 1024 * 1024 * 1024
    default: return 0
  }
}

export function getCategoryDisplay(category: PrismaDocumentCategory): string {
  const displays: Record<PrismaDocumentCategory, string> = {
    CASE_FILE: 'Case File',
    ANNEXURE: 'Annexure',
    JUDGMENT: 'Judgment',
    ORDER: 'Order',
    MISC: 'Miscellaneous',
  }
  return displays[category] || category
}

export function getCategoryColor(category: PrismaDocumentCategory): string {
  const colors: Record<PrismaDocumentCategory, string> = {
    CASE_FILE: 'blue',
    ANNEXURE: 'purple',
    JUDGMENT: 'green',
    ORDER: 'orange',
    MISC: 'gray',
  }
  return colors[category] || 'gray'
}

export function getUploadStatusDisplay(status: PrismaUploadStatus): string {
  const displays: Record<PrismaUploadStatus, string> = {
    PENDING: 'Pending',
    UPLOADING: 'Uploading',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  }
  return displays[status] || status
}

export function getUploadStatusColor(status: PrismaUploadStatus): string {
  const colors: Record<PrismaUploadStatus, string> = {
    PENDING: 'yellow',
    UPLOADING: 'blue',
    COMPLETED: 'green',
    FAILED: 'red',
  }
  return colors[status] || 'gray'
}

export function getOcrStatusDisplay(status: PrismaOcrStatus): string {
  const displays: Record<PrismaOcrStatus, string> = {
    NOT_REQUIRED: 'Not Required',
    PENDING: 'Pending',
    PROCESSING: 'Processing',
    COMPLETED: 'Completed',
    FAILED: 'Failed',
  }
  return displays[status] || status
}

export function getOcrStatusColor(status: PrismaOcrStatus): string {
  const colors: Record<PrismaOcrStatus, string> = {
    NOT_REQUIRED: 'gray',
    PENDING: 'yellow',
    PROCESSING: 'blue',
    COMPLETED: 'green',
    FAILED: 'red',
  }
  return colors[status] || 'gray'
}

export function getFileIcon(contentType: string): string {
  if (contentType.includes('pdf')) return '📄'
  if (contentType.includes('word') || contentType.includes('doc')) return '📝'
  if (contentType.includes('image')) return '🖼️'
  if (contentType.includes('zip') || contentType.includes('compress')) return '📦'
  return '📎'
}

export function isDocumentLocked(document: Document): boolean {
  return document.isLocked
}

export function canEditDocument(document: Document): boolean {
  return !document.isLocked && document.uploadStatus === 'COMPLETED'
}

export function canDeleteDocument(document: Document): boolean {
  return !document.isLocked
}

export function requiresOcr(document: Document): boolean {
  return document.isOcrRequired && 
         (document.ocrStatus === 'NOT_REQUIRED' || document.ocrStatus === 'PENDING' || document.ocrStatus === 'FAILED')
}

export function isOcrInProgress(document: Document): boolean {
  return document.ocrStatus === 'PROCESSING'
}

export function isOcrCompleted(document: Document): boolean {
  return document.ocrStatus === 'COMPLETED'
}

export function getDocumentUrl(document: Document): string {
  // This would typically be an API endpoint that generates a signed URL
  return `/api/documents/${document.id}/download`
}

export function getDocumentPreviewUrl(document: Document): string {
  // This would typically be an API endpoint that generates a preview URL
  return `/api/documents/${document.id}/preview`
}

export function validateDocumentUpload(file: File): { valid: boolean; error?: string } {
  const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: 'File size must be less than 50MB' }
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: 'File type not supported. Please upload PDF, JPG, PNG, or DOC files.' }
  }

  return { valid: true }
}

export function generateS3Key(caseId: string, fileName: string): string {
  const timestamp = Date.now()
  const randomStr = Math.random().toString(36).substring(2, 15)
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  return `cases/${caseId}/${timestamp}_${randomStr}_${sanitizedFileName}`
}

export function calculateUploadProgress(uploadedBytes: number, totalBytes: number): number {
  if (totalBytes === 0) return 0
  return Math.min(Math.round((uploadedBytes / totalBytes) * 100), 100)
}

// ============================================
// SORTING & FILTERING HELPERS
// ============================================

export function sortDocuments(
  documents: Document[],
  sortBy: 'title' | 'uploadedAt' | 'createdAt' | 'fileSize' = 'createdAt',
  order: 'asc' | 'desc' = 'desc'
): Document[] {
  return [...documents].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case 'title':
        comparison = a.title.localeCompare(b.title)
        break
      case 'uploadedAt':
        comparison = (a.uploadedAt?.getTime() || 0) - (b.uploadedAt?.getTime() || 0)
        break
      case 'createdAt':
        comparison = a.createdAt.getTime() - b.createdAt.getTime()
        break
      case 'fileSize':
        const aSizeNum = typeof a.fileSize === 'bigint' ? Number(a.fileSize) : a.fileSize
        const bSizeNum = typeof b.fileSize === 'bigint' ? Number(b.fileSize) : b.fileSize
        comparison = aSizeNum - bSizeNum
        break
    }

    return order === 'asc' ? comparison : -comparison
  })
}

export function filterDocuments(
  documents: Document[],
  filters: Partial<DocumentFilters>
): Document[] {
  return documents.filter(doc => {
    if (filters.category && filters.category !== 'all' && doc.category !== filters.category) {
      return false
    }

    if (filters.uploadStatus && doc.uploadStatus !== filters.uploadStatus) {
      return false
    }

    if (filters.ocrStatus && doc.ocrStatus !== filters.ocrStatus) {
      return false
    }

    if (filters.isLocked !== undefined && doc.isLocked !== filters.isLocked) {
      return false
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const titleMatch = doc.title.toLowerCase().includes(searchLower)
      const descMatch = doc.description?.toLowerCase().includes(searchLower)
      const textMatch = doc.extractedText?.toLowerCase().includes(searchLower)
      
      if (!titleMatch && !descMatch && !textMatch) {
        return false
      }
    }

    return true
  })
}

export function groupDocumentsByCategory(documents: Document[]): Record<PrismaDocumentCategory, Document[]> {
  const grouped: Record<string, Document[]> = {
    CASE_FILE: [],
    ANNEXURE: [],
    JUDGMENT: [],
    ORDER: [],
    MISC: [],
  }

  documents.forEach(doc => {
    if (grouped[doc.category]) {
      grouped[doc.category].push(doc)
    }
  })

  return grouped as Record<PrismaDocumentCategory, Document[]>
}