// src/lib/ai/core/document-classifier.ts
import { ClaudeClient } from './claude-client';

export type DocumentType = 
  | 'PETITION'
  | 'COUNTER_AFFIDAVIT'
  | 'REJOINDER'
  | 'ANNEXURE'
  | 'INTERIM_ORDER'
  | 'DAILY_ORDER'
  | 'JUDGMENT'        // Add this
  | 'EVIDENCE'
  | 'CORRESPONDENCE'
  | 'OTHER';
export interface ClassifiedDocument {
  id: string;
  type: DocumentType;
  title: string;
  extractedText: string;
  confidence: number;
  metadata: Record<string, any>;
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
    const prompt = `Classify this legal document and extract key metadata.

Document filename: ${fileName}
Document text (first 1000 chars):
${text.substring(0, 1000)}

Respond in JSON format:
{
  "type": "PETITION|COUNTER_AFFIDAVIT|REJOINDER|ANNEXURE|INTERIM_ORDER|DAILY_ORDER|EVIDENCE|CORRESPONDENCE|OTHER",
  "confidence": 0.0-1.0,
  "title": "descriptive title",
  "metadata": {
    "date": "YYYY-MM-DD or null",
    "parties": ["party names"],
    "keyPoints": ["main points"],
    "documentNumber": "if applicable"
  }
}`;

    const response = await this.claude.analyze(prompt, '', 2048);
    const parsed = JSON.parse(response);

    return {
      id: documentId,
      type: parsed.type,
      title: parsed.title,
      extractedText: text,
      confidence: parsed.confidence,
      metadata: parsed.metadata
    };
  }

  async classifyBatch(documents: Array<{id: string, fileName: string, text: string}>) {
    return Promise.all(
      documents.map(doc => this.classifyDocument(doc.id, doc.fileName, doc.text))
    );
  }
}
