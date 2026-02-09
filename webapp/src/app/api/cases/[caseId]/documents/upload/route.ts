// src/app/api/cases/[caseId]/documents/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DocumentCategory, UploadStatus, OcrStatus } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DocumentClassifier } from '@/lib/ai/core/document-classifier';
import { extractTextFromPDF } from '@/lib/utils/pdf-extractor';

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params; // Added this line
    
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as DocumentCategory;
    const title = formData.get('title') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Verify case ownership
    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId, // Changed from params.caseId
        advocateId: userId,
        isVisible: true
      }
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Create document record with pending status
    const document = await prisma.document.create({
      data: {
        caseId, // Changed from params.caseId
        khcDocumentId: `doc-${Date.now()}`,
        category,
        title: title || file.name,
        s3Key: `cases/${caseId}/${Date.now()}-${file.name}`, // Changed
        s3Bucket: process.env.S3_BUCKET || 'lawmate-case-pdfs',
        fileSize: file.size,
        contentType: file.type,
        uploadStatus: UploadStatus.UPLOADING,
        isOcrRequired: true,
        ocrStatus: OcrStatus.PENDING
      }
    });

    try {
      // Upload to S3
      const buffer = Buffer.from(await file.arrayBuffer());
      await s3Client.send(
        new PutObjectCommand({
          Bucket: document.s3Bucket,
          Key: document.s3Key,
          Body: buffer,
          ContentType: file.type
        })
      );

      // Extract text for AI processing
      let extractedText = '';
      try {
        extractedText = await extractTextFromPDF(buffer);
      } catch (error) {
        console.error('PDF text extraction failed:', error);
      }

      // Classify document using AI
      let aiMetadata = null;
      let classificationConfidence = 0.5;

      if (extractedText) {
        try {
          const classifier = new DocumentClassifier();
          const classified = await classifier.classifyDocument(
            document.id,
            file.name,
            extractedText
          );
          
          aiMetadata = classified.metadata;
          classificationConfidence = classified.confidence;
        } catch (error) {
          console.error('Document classification failed:', error);
        }
      }

      // Update document with success status
      const updatedDocument = await prisma.document.update({
        where: { id: document.id },
        data: {
          uploadStatus: UploadStatus.COMPLETED,
          uploadedAt: new Date(),
          extractedText,
          classificationConfidence,
          aiMetadata: aiMetadata as any,
          ocrStatus: extractedText ? OcrStatus.COMPLETED : OcrStatus.FAILED
        }
      });

      // Invalidate case insights cache since new document added
      await prisma.aIInsight.updateMany({
        where: { caseId }, // Changed from params.caseId
        data: { expiresAt: new Date() }
      });

      return NextResponse.json({
        document: updatedDocument,
        message: 'Document uploaded successfully'
      });
    } catch (error) {
      // Update document with failed status
      await prisma.document.update({
        where: { id: document.id },
        data: {
          uploadStatus: UploadStatus.FAILED,
          uploadError: error instanceof Error ? error.message : 'Upload failed'
        }
      });

      throw error;
    }
  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload document' },
      { status: 500 }
    );
  }
}
