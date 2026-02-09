// src/lib/api/documents.ts
import type { 
  Document, 
  DocumentUploadResult,
  CreateDocumentInput,
  DocumentFilters,
  BatchDocumentOperation,
  BatchOperationResult,
  DocumentStats,
  OCRRequest,
  OCRResult,
  DocumentCategory,
  UploadStatus
} from '@/types/document';
import apiClient from './client';

// ============================================
// DOCUMENT CRUD OPERATIONS
// ============================================

export const documentsApi = {
  /**
   * Get documents by case ID
   */
  async getByCaseId(caseId: string, filters?: Partial<DocumentFilters>): Promise<Document[]> {
    const { data } = await apiClient.get(`/api/v1/documents`, {
      params: { 
        case_id: caseId,
        ...filters 
      },
    });
    return data;
  },

  /**
   * Get single document by ID
   */
  async getById(id: string): Promise<Document> {
    const { data } = await apiClient.get(`/api/v1/documents/${id}`);
    return data;
  },

  /**
   * Get presigned URL for document download
   */
  async getPresignedUrl(s3Key: string): Promise<string> {
    const { data } = await apiClient.post('/api/v1/documents/presigned-url', {
      s3_key: s3Key,
      operation: 'get',
    });
    return data.url;
  },

  /**
   * Initiate document upload
   */
  async initiateUpload(
    request: Omit<CreateDocumentInput, 's3Key' | 'fileSize'> & { 
      fileName: string;
      fileSize: number;
      contentType: string;
    }
  ): Promise<{
    documentId: string;
    uploadUrl: string;
    s3Key: string;
  }> {
    const { data } = await apiClient.post('/api/v1/upload/initiate', request);
    return data;
  },

  /**
   * Upload file to S3
   */
  async uploadToS3(url: string, file: File): Promise<void> {
    await fetch(url, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });
  },

  /**
   * Confirm upload completion
   */
  async confirmUpload(documentId: string): Promise<Document> {
    const { data } = await apiClient.post(`/api/v1/documents/${documentId}/confirm`);
    return data;
  },

  /**
   * Update document
   */
  async updateDocument(id: string, updates: Partial<Document>): Promise<Document> {
    const { data } = await apiClient.patch(`/api/v1/documents/${id}`, updates);
    return data;
  },

  /**
   * Delete document
   */
  async deleteDocument(id: string): Promise<void> {
    await apiClient.delete(`/api/v1/documents/${id}`);
  },

  /**
   * Lock/Unlock document
   */
  async lockDocument(id: string, reason: string): Promise<Document> {
    const { data } = await apiClient.post(`/api/v1/documents/${id}/lock`, { reason });
    return data;
  },

  async unlockDocument(id: string): Promise<Document> {
    const { data } = await apiClient.post(`/api/v1/documents/${id}/unlock`);
    return data;
  },

  /**
   * Get document statistics
   */
  async getStats(caseId: string): Promise<DocumentStats> {
    const { data } = await apiClient.get(`/api/v1/documents/stats`, {
      params: { case_id: caseId }
    });
    return data;
  },
};

// ============================================
// AI & CLASSIFICATION OPERATIONS
// ============================================

/**
 * Classify a single document using AI
 */
export async function classifyDocument(caseId: string, documentId: string) {
  const response = await fetch(`/api/cases/${caseId}/documents/classify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ documentId })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to classify document');
  }
  
  return response.json();
}

/**
 * Classify all unclassified documents in a case
 */
export async function classifyAllDocuments(caseId: string) {
  const response = await fetch(`/api/cases/${caseId}/documents/classify`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to classify documents');
  }
  
  return response.json();
}

// ============================================
// UPLOAD OPERATIONS
// ============================================

/**
 * Upload a document with progress tracking
 */
export async function uploadDocument(
  caseId: string, 
  file: File, 
  metadata: { 
    category: DocumentCategory; 
    title: string;
    description?: string;
  },
  onProgress?: (progress: number) => void
): Promise<DocumentUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', metadata.category);
  formData.append('title', metadata.title);
  if (metadata.description) {
    formData.append('description', metadata.description);
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    // Track upload progress
    if (onProgress) {
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = (e.loaded / e.total) * 100;
          onProgress(percentComplete);
        }
      });
    }

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.document);
        } catch (error) {
          reject(new Error('Failed to parse response'));
        }
      } else {
        try {
          const error = JSON.parse(xhr.responseText);
          reject(new Error(error.error || 'Upload failed'));
        } catch {
          reject(new Error('Upload failed'));
        }
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Network error during upload'));
    });

    xhr.addEventListener('abort', () => {
      reject(new Error('Upload cancelled'));
    });

    xhr.open('POST', `/api/cases/${caseId}/documents/upload`);
    xhr.send(formData);
  });
}

/**
 * Simple upload without progress tracking
 */
export async function uploadDocumentSimple(
  caseId: string, 
  file: File, 
  metadata: { 
    category: DocumentCategory; 
    title: string;
    description?: string;
  }
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', metadata.category);
  formData.append('title', metadata.title);
  if (metadata.description) {
    formData.append('description', metadata.description);
  }

  const response = await fetch(`/api/cases/${caseId}/documents/upload`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload document');
  }

  return response.json();
}

/**
 * Upload multiple documents
 */
export async function uploadMultipleDocuments(
  caseId: string,
  files: Array<{
    file: File;
    metadata: {
      category: DocumentCategory;
      title: string;
      description?: string;
    };
  }>,
  onProgress?: (fileIndex: number, progress: number) => void
): Promise<DocumentUploadResult[]> {
  const results: DocumentUploadResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const { file, metadata } = files[i];
    try {
      const result = await uploadDocument(
        caseId,
        file,
        metadata,
        onProgress ? (progress) => onProgress(i, progress) : undefined
      );
      results.push(result);
    } catch (error) {
      console.error(`Failed to upload file ${i}:`, error);
      throw error;
    }
  }

  return results;
}

// ============================================
// OCR OPERATIONS
// ============================================

/**
 * Request OCR processing for a document
 */
export async function requestOCR(request: OCRRequest): Promise<{ jobId: string }> {
  const response = await fetch('/api/documents/ocr', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to request OCR');
  }

  return response.json();
}

/**
 * Get OCR result
 */
export async function getOCRResult(documentId: string): Promise<OCRResult> {
  const response = await fetch(`/api/documents/${documentId}/ocr`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get OCR result');
  }

  return response.json();
}

/**
 * Process documents for a case
 */
export async function processDocuments(caseId: string) {
  const response = await fetch(`/api/cases/${caseId}/documents/process`, {
    method: 'POST'
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to process documents');
  }

  return response.json();
}

// ============================================
// BATCH OPERATIONS
// ============================================

/**
 * Perform batch operation on documents
 */
export async function batchOperation(
  operation: BatchDocumentOperation
): Promise<BatchOperationResult> {
  const response = await fetch('/api/documents/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(operation)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Batch operation failed');
  }

  return response.json();
}

/**
 * Delete multiple documents
 */
export async function deleteMultipleDocuments(documentIds: string[]): Promise<BatchOperationResult> {
  return batchOperation({
    documentIds,
    operation: 'delete'
  });
}

/**
 * Lock multiple documents
 */
export async function lockMultipleDocuments(
  documentIds: string[],
  reason: string
): Promise<BatchOperationResult> {
  return batchOperation({
    documentIds,
    operation: 'lock',
    params: { lockReason: reason }
  });
}

/**
 * Categorize multiple documents
 */
export async function categorizeMultipleDocuments(
  documentIds: string[],
  category: DocumentCategory
): Promise<BatchOperationResult> {
  return batchOperation({
    documentIds,
    operation: 'categorize',
    params: { category }
  });
}

// ============================================
// DOWNLOAD OPERATIONS
// ============================================

/**
 * Get document download URL
 */
export async function getDocumentDownloadUrl(documentId: string): Promise<string> {
  const response = await fetch(`/api/documents/${documentId}/download-url`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get download URL');
  }

  const data = await response.json();
  return data.url;
}

/**
 * Download document directly
 */
export async function downloadDocument(documentId: string, fileName?: string) {
  try {
    const url = await getDocumentDownloadUrl(documentId);
    
    // Create temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Download failed:', error);
    throw error;
  }
}

/**
 * Get document preview URL
 */
export async function getDocumentPreviewUrl(documentId: string): Promise<string> {
  const response = await fetch(`/api/documents/${documentId}/preview-url`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to get preview URL');
  }

  const data = await response.json();
  return data.url;
}

// ============================================
// SEARCH & FILTER OPERATIONS
// ============================================

/**
 * Search documents
 */
export async function searchDocuments(
  query: string,
  filters?: Partial<DocumentFilters>
): Promise<Document[]> {
  const params = new URLSearchParams({
    search: query,
    ...filters
  } as any);

  const response = await fetch(`/api/documents/search?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Search failed');
  }

  const data = await response.json();
  return data.documents;
}

/**
 * Get documents with filters
 */
export async function getDocumentsWithFilters(
  filters: DocumentFilters
): Promise<{
  documents: Document[];
  total: number;
  page: number;
  perPage: number;
}> {
  const params = new URLSearchParams(filters as any);
  const response = await fetch(`/api/documents?${params}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch documents');
  }

  return response.json();
}

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  ...documentsApi,
  classifyDocument,
  classifyAllDocuments,
  uploadDocument,
  uploadDocumentSimple,
  uploadMultipleDocuments,
  requestOCR,
  getOCRResult,
  processDocuments,
  batchOperation,
  deleteMultipleDocuments,
  lockMultipleDocuments,
  categorizeMultipleDocuments,
  getDocumentDownloadUrl,
  downloadDocument,
  getDocumentPreviewUrl,
  searchDocuments,
  getDocumentsWithFilters,
};