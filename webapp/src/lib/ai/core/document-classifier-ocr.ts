// src/lib/ai/core/document-classifier.ts (Enhanced)
import { ClaudeClient } from './claude-client';

export type DocumentType = 
  | 'PETITION'
  | 'COUNTER_AFFIDAVIT'
  | 'REJOINDER'
  | 'ANNEXURE'
  | 'INTERIM_ORDER'
  | 'DAILY_ORDER'
  | 'JUDGMENT'
  | 'EVIDENCE'
  | 'CORRESPONDENCE'
  | 'OTHER';

export interface ClassifiedDocument {
  id: string;
  type: DocumentType;
  title: string;
  extractedText: string;
  confidence: number;
  metadata: {
    date?: string;
    parties?: string[];
    keyPoints?: string[];
    documentNumber?: string;
  };
}

export class DocumentClassifier {
  private claude: ClaudeClient;

  constructor() {
    this.claude = new ClaudeClient();
  }

  async classifyDocument(
    documentId: string,
    fileName: string,
    text: string
  ): Promise<ClassifiedDocument> {
    // If text is very short, might be OCR failure
    if (text.length < 100) {
      return {
        id: documentId,
        type: 'OTHER',
        title: fileName,
        extractedText: text,
        confidence: 0.3,
        metadata: {}
      };
    }

    const prompt = `Classify this legal document and extract key metadata.

Document filename: ${fileName}
Document text (first 2000 chars):
${text.substring(0, 2000)}

Analyze:
1. Document type (petition, counter affidavit, rejoinder, annexure, order, judgment, etc.)
2. Date if mentioned
3. Party names
4. Key points/subject matter
5. Any document numbers or identifiers

Respond in JSON format:
{
  "type": "PETITION|COUNTER_AFFIDAVIT|REJOINDER|ANNEXURE|INTERIM_ORDER|DAILY_ORDER|JUDGMENT|EVIDENCE|CORRESPONDENCE|OTHER",
  "confidence": 0.0-1.0,
  "title": "descriptive title",
  "metadata": {
    "date": "YYYY-MM-DD or null",
    "parties": ["party names"],
    "keyPoints": ["main points"],
    "documentNumber": "if applicable"
  }
}`;

    try {
      const response = await this.claude.analyze(prompt, '', 2048);
      const parsed = JSON.parse(response);

      return {
        id: documentId,
        type: parsed.type,
        title: parsed.title || fileName,
        extractedText: text,
        confidence: parsed.confidence,
        metadata: parsed.metadata || {}
      };
    } catch (error) {
      console.error('Document classification error:', error);
      // Fallback classification based on filename
      return this.fallbackClassification(documentId, fileName, text);
    }
  }

  private fallbackClassification(
    documentId: string,
    fileName: string,
    text: string
  ): ClassifiedDocument {
    const lowerFileName = fileName.toLowerCase();
    
    let type: DocumentType = 'OTHER';
    if (lowerFileName.includes('petition') || lowerFileName.includes('writ')) {
      type = 'PETITION';
    } else if (lowerFileName.includes('counter') || lowerFileName.includes('affidavit')) {
      type = 'COUNTER_AFFIDAVIT';
    } else if (lowerFileName.includes('rejoinder')) {
      type = 'REJOINDER';
    } else if (lowerFileName.includes('order')) {
      type = 'INTERIM_ORDER';
    } else if (lowerFileName.includes('judgment')) {
      type = 'JUDGMENT';
    } else if (lowerFileName.includes('annex')) {
      type = 'ANNEXURE';
    }

    return {
      id: documentId,
      type,
      title: fileName,
      extractedText: text,
      confidence: 0.6,
      metadata: {}
    };
  }

  async classifyBatch(documents: Array<{id: string, fileName: string, text: string}>) {
    // Process in parallel with rate limiting
    const batchSize = 5;
    const results: ClassifiedDocument[] = [];
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = documents.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(doc => this.classifyDocument(doc.id, doc.fileName, doc.text))
      );
      results.push(...batchResults);
      
      // Rate limiting
      if (i + batchSize < documents.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return results;
  }
}