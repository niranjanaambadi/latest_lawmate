// src/types/history.ts
import { 
  CaseHistory as PrismaCaseHistory,
  CaseEventType as PrismaCaseEventType,
  Document 
} from '@prisma/client';

// Re-export Prisma enum
export type { CaseEventType } from '@prisma/client';

// Extend Prisma's CaseHistory type with optional relations
export interface CaseHistory extends PrismaCaseHistory {
  // Optional relations
  orderDocument?: Document | null;
}

// Helper type for creating case history
export interface CreateCaseHistory {
  caseId: string;
  eventType: PrismaCaseEventType;
  eventDate: Date | string;
  businessRecorded: string;
  judgeName?: string | null;
  benchType?: string | null;
  courtNumber?: string | null;
  nextHearingDate?: Date | string | null;
  orderDocumentId?: string | null;
}

// Helper type for case history filters
export interface CaseHistoryFilters {
  caseId?: string;
  eventType?: PrismaCaseEventType | PrismaCaseEventType[];
  startDate?: Date | string;
  endDate?: Date | string;
  judgeName?: string;
  sort?: 'eventDate' | 'createdAt';
  order?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Display helpers
export const EVENT_TYPE_LABELS: Record<PrismaCaseEventType, string> = {
  HEARING: 'Hearing',
  ORDER: 'Order',
  JUDGMENT: 'Judgment',
  FILING: 'Filing',
  NOTICE: 'Notice',
};

export const EVENT_TYPE_COLORS: Record<PrismaCaseEventType, string> = {
  HEARING: 'blue',
  ORDER: 'purple',
  JUDGMENT: 'green',
  FILING: 'orange',
  NOTICE: 'yellow',
};