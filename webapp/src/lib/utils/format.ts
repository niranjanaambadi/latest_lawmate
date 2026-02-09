// src/lib/utils/format.ts
import { CaseStatus } from '@prisma/client';

export function formatCaseStatus(status: CaseStatus): string {
  const statusMap: Record<CaseStatus, string> = {
    FILED: 'Filed',           // Changed from 'filed'
    REGISTERED: 'Registered', // Changed from 'registered'
    PENDING: 'Pending',       // Changed from 'pending'
    DISPOSED: 'Disposed',     // Changed from 'disposed'
    TRANSFERRED: 'Transferred' // Changed from 'transferred'
  };

  return statusMap[status] || status;
}

// If you have other enums in this file, fix them too:

export function formatDocumentCategory(category: string): string {
  const categoryMap: Record<string, string> = {
    CASE_FILE: 'Case File',
    ANNEXURE: 'Annexure',
    JUDGMENT: 'Judgment',
    ORDER: 'Order',
    MISC: 'Miscellaneous'
  };

  return categoryMap[category] || category;
}

export function formatUploadStatus(status: string): string {
  const statusMap: Record<string, string> = {
    PENDING: 'Pending',
    UPLOADING: 'Uploading',
    COMPLETED: 'Completed',
    FAILED: 'Failed'
  };

  return statusMap[status] || status;
}
