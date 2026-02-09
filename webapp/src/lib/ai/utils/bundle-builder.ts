// src/lib/ai/utils/bundle-builder.ts
import { CaseBundle, ClassifiedDocument } from '../core/case-bundle-processor';

export function buildCaseBundle(documents: any[]): CaseBundle {
  const classified: ClassifiedDocument[] = documents.map(d => ({
    id: d.id,
    type: d.classification?.type || 'OTHER',
    title: d.fileName,
    extractedText: d.extractedText || '',
    confidence: d.classification?.confidence || 0,
    metadata: d.classification?.metadata || {},
  }));

  return {
    caseId: documents[0]?.caseId || '',
    documents: classified,
    petition: classified.find(d => d.type === 'PETITION'),
    counter: classified.find(d => d.type === 'COUNTER_AFFIDAVIT'),
    rejoinder: classified.find(d => d.type === 'REJOINDER'),
    annexures: classified.filter(d => d.type === 'ANNEXURE'),
    orders: classified.filter(d => 
      d.type === 'INTERIM_ORDER' || d.type === 'DAILY_ORDER'
    ),
  };
}