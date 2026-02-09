// src/lib/utils/bundle-builder.ts
import { prisma } from '@/lib/db';
import { DocumentCategory, UploadStatus } from '@prisma/client';
import { CaseBundle, ClassifiedDocument, DocumentType } from '@/lib/ai/core/case-bundle-processor';

export async function buildCaseBundle(caseId: string): Promise<CaseBundle> {
  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      documents: {
        where: {
          uploadStatus: UploadStatus.COMPLETED
        },
        orderBy: { uploadedAt: 'asc' }
      }
    }
  });

  if (!caseData) {
    throw new Error('Case not found');
  }

  const classifiedDocs: ClassifiedDocument[] = caseData.documents.map(doc => ({
    id: doc.id,
    type: mapDocumentCategoryToType(doc.category, doc.title),
    title: doc.title,
    extractedText: doc.extractedText || '',
    confidence: doc.classificationConfidence || 1.0,
    metadata: (doc.aiMetadata as Record<string, any>) || {}
  }));

  return {
    caseId: caseData.id,
    documents: classifiedDocs,
    petition: classifiedDocs.find(d => d.type === 'PETITION'),
    counter: classifiedDocs.find(d => d.type === 'COUNTER_AFFIDAVIT'),
    rejoinder: classifiedDocs.find(d => d.type === 'REJOINDER'),
    annexures: classifiedDocs.filter(d => d.type === 'ANNEXURE'),
    orders: classifiedDocs.filter(d => 
      d.type === 'INTERIM_ORDER' || d.type === 'DAILY_ORDER'
    )
  };
}

function mapDocumentCategoryToType(
  category: DocumentCategory, 
  title: string
): DocumentType {
  // Use AI-enhanced classification if available
  const titleLower = title.toLowerCase();

  if (category === DocumentCategory.CASE_FILE) {
    if (titleLower.includes('counter') || titleLower.includes('affidavit')) {
      return 'COUNTER_AFFIDAVIT';
    }
    if (titleLower.includes('rejoinder')) {
      return 'REJOINDER';
    }
    return 'PETITION';
  }

  const mapping: Record<DocumentCategory, DocumentType> = {
    CASE_FILE: 'PETITION',
    ANNEXURE: 'ANNEXURE',
    JUDGMENT: 'OTHER', // Changed from 'JUDGMENT' to 'OTHER'
    ORDER: 'INTERIM_ORDER',
    MISC: 'OTHER'
  };

  return mapping[category] || 'OTHER';
}
