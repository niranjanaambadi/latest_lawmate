// src/lib/jobs/process-documents.ts
import { prisma } from '@/lib/db';
import { DocumentClassifier } from '@/lib/ai/core/document-classifier';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { extractTextFromPDF } from '@/lib/utils/pdf-extractor';
import { UploadStatus, OcrStatus } from '@prisma/client';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export async function processUnprocessedDocuments() {
  console.log('[CRON] Starting document processing...');

  // Find documents that need processing
  const documents = await prisma.document.findMany({
    where: {
      uploadStatus: UploadStatus.COMPLETED,
      ocrStatus: OcrStatus.PENDING,
      extractedText: null
    },
    take: 10, // Process 10 at a time
    orderBy: { uploadedAt: 'asc' }
  });

  console.log(`[CRON] Found ${documents.length} documents to process`);

  const results = {
    processed: 0,
    failed: 0,
    skipped: 0
  };

  for (const doc of documents) {
    try {
      console.log(`[CRON] Processing document ${doc.id}: ${doc.title}`);

      // Update status to processing
      await prisma.document.update({
        where: { id: doc.id },
        data: { ocrStatus: OcrStatus.PROCESSING }
      });

      // Download from S3
      const command = new GetObjectCommand({
        Bucket: doc.s3Bucket,
        Key: doc.s3Key
      });

      const response = await s3Client.send(command);
      const stream = response.Body;
      
      if (!stream) {
        throw new Error('Empty S3 response');
      }

      // Convert stream to buffer
      const chunks: Uint8Array[] = [];
      for await (const chunk of stream as any) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // Extract text from PDF
      let extractedText = '';
      try {
        extractedText = await extractTextFromPDF(buffer);
      } catch (error) {
        console.error(`[CRON] PDF extraction failed for ${doc.id}:`, error);
        // Continue with empty text - will be marked as failed
      }

      if (!extractedText || extractedText.length < 50) {
        throw new Error('Insufficient text extracted from PDF');
      }

      // Classify document using AI
      const classifier = new DocumentClassifier();
      const classified = await classifier.classifyDocument(
        doc.id,
        doc.title,
        extractedText
      );

      // Update document with extracted data
      await prisma.document.update({
        where: { id: doc.id },
        data: {
          extractedText,
          classificationConfidence: classified.confidence,
          aiMetadata: classified.metadata as any,
          ocrStatus: OcrStatus.COMPLETED
        }
      });

      // Invalidate AI insights cache for this case
      await prisma.aIInsight.updateMany({
        where: { caseId: doc.caseId },
        data: { expiresAt: new Date() } // Expire immediately
      });

      results.processed++;
      console.log(`[CRON] ✓ Successfully processed document ${doc.id}`);

    } catch (error) {
      console.error(`[CRON] ✗ Failed to process document ${doc.id}:`, error);
      
      results.failed++;

      // Mark as failed
      await prisma.document.update({
        where: { id: doc.id },
        data: {
          ocrStatus: OcrStatus.FAILED,
          uploadError: error instanceof Error ? error.message : 'Processing failed'
        }
      });
    }
  }

  console.log('[CRON] Document processing complete:', results);
  return results;
}