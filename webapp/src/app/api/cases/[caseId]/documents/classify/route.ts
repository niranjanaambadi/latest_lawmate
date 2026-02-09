// src/app/api/cases/[caseId]/documents/classify/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { DocumentClassifier } from '@/lib/ai/core/document-classifier';
import { UploadStatus, OcrStatus } from '@prisma/client';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify case ownership
    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId,
        advocateId: userId,
        isVisible: true
      }
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const { documentId } = await req.json();

    if (!documentId) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Get document
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        caseId,
        uploadStatus: UploadStatus.COMPLETED
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or not uploaded' },
        { status: 404 }
      );
    }

    if (!document.extractedText) {
      return NextResponse.json(
        { error: 'Document has no extracted text. Run OCR first.' },
        { status: 400 }
      );
    }

    // Classify document
    const classifier = new DocumentClassifier();
    const classified = await classifier.classifyDocument(
      document.id,
      document.title,
      document.extractedText
    );

    // Update document with classification
    const updatedDocument = await prisma.document.update({
      where: { id: document.id },
      data: {
        classificationConfidence: classified.confidence,
        aiMetadata: classified.metadata as any,
        category: mapTypeToCategory(classified.type)
      }
    });

    // Invalidate AI insights cache since document classification changed
    await prisma.aIInsight.updateMany({
      where: { caseId },
      data: { expiresAt: new Date() }
    });

    return NextResponse.json({
      success: true,
      document: {
        id: updatedDocument.id,
        title: updatedDocument.title,
        classifiedType: classified.type,
        category: updatedDocument.category,
        confidence: classified.confidence,
        metadata: classified.metadata
      }
    });
  } catch (error) {
    console.error('Document classification error:', error);
    return NextResponse.json(
      { error: 'Failed to classify document' },
      { status: 500 }
    );
  }
}

// Classify all unclassified documents in a case
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify case ownership
    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId,
        advocateId: userId,
        isVisible: true
      }
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Find documents that need classification
    const documents = await prisma.document.findMany({
      where: {
        caseId,
        uploadStatus: UploadStatus.COMPLETED,
        ocrStatus: OcrStatus.COMPLETED,
        extractedText: { not: null },
        classificationConfidence: null // Not yet classified
      },
      take: 10 // Classify max 10 at a time
    });

    if (documents.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No documents need classification',
        classified: 0
      });
    }

    const classifier = new DocumentClassifier();
    const results = [];

    for (const doc of documents) {
      try {
        const classified = await classifier.classifyDocument(
          doc.id,
          doc.title,
          doc.extractedText!
        );

        await prisma.document.update({
          where: { id: doc.id },
          data: {
            classificationConfidence: classified.confidence,
            aiMetadata: classified.metadata as any,
            category: mapTypeToCategory(classified.type)
          }
        });

        results.push({
          id: doc.id,
          title: doc.title,
          type: classified.type,
          confidence: classified.confidence,
          status: 'success'
        });
      } catch (error) {
        console.error(`Failed to classify document ${doc.id}:`, error);
        results.push({
          id: doc.id,
          title: doc.title,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Invalidate cache if any documents were classified
    const successCount = results.filter(r => r.status === 'success').length;
    if (successCount > 0) {
      await prisma.aIInsight.updateMany({
        where: { caseId },
        data: { expiresAt: new Date() }
      });
    }

    return NextResponse.json({
      success: true,
      classified: successCount,
      failed: results.filter(r => r.status === 'failed').length,
      results
    });
  } catch (error) {
    console.error('Batch classification error:', error);
    return NextResponse.json(
      { error: 'Failed to classify documents' },
      { status: 500 }
    );
  }
}

// Helper function to map AI document type to database category
function mapTypeToCategory(type: string) {
  const mapping: Record<string, any> = {
    'PETITION': 'CASE_FILE',
    'COUNTER_AFFIDAVIT': 'CASE_FILE',
    'REJOINDER': 'CASE_FILE',
    'ANNEXURE': 'ANNEXURE',
    'INTERIM_ORDER': 'ORDER',
    'DAILY_ORDER': 'ORDER',
    'JUDGMENT': 'JUDGMENT',
    'EVIDENCE': 'MISC',
    'CORRESPONDENCE': 'MISC',
    'OTHER': 'MISC'
  };

  return mapping[type] || 'MISC';
}