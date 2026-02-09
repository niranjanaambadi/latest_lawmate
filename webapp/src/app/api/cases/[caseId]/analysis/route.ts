// src/app/api/cases/[caseId]/analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ClaudeClient } from '@/lib/ai/core/claude-client';
import { AIAnalysisStatus, UrgencyLevel } from '@prisma/client';
import { AnalysisContent } from '@/types/analysis';

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

    // Verify case access
    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId,
        advocateId: userId,
        isVisible: true,
      },
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Get analysis
    const analysis = await prisma.aIAnalysis.findUnique({
      where: { caseId },
    });

    if (!analysis) {
      return NextResponse.json({ error: 'Analysis not found' }, { status: 404 });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Get analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analysis' },
      { status: 500 }
    );
  }
}

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

    // Verify case access
    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId,
        advocateId: userId,
        isVisible: true,
      },
      include: {
        documents: {
          where: {
            uploadStatus: 'COMPLETED',
            extractedText: { not: null },
          },
        },
      },
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    if (caseRecord.documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents available for analysis' },
        { status: 400 }
      );
    }

    // Check if analysis already exists
    const existingAnalysis = await prisma.aIAnalysis.findUnique({
      where: { caseId },
    });

    if (existingAnalysis && existingAnalysis.status === 'PROCESSING') {
      return NextResponse.json(
        { error: 'Analysis already in progress' },
        { status: 409 }
      );
    }

    // Create or update analysis record
    const analysis = await prisma.aIAnalysis.upsert({
      where: { caseId },
      create: {
        caseId,
        advocateId: userId,
        status: 'PROCESSING',
        retryCount: 0,
      },
      update: {
        status: 'PROCESSING',
        errorMessage: null,
        retryCount: existingAnalysis ? existingAnalysis.retryCount + 1 : 0,
      },
    });

    // Start analysis in background (don't await)
    performAnalysis(caseId, userId, caseRecord).catch((err) =>
      console.error('Background analysis error:', err)
    );

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Request analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to request analysis' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const userId = req.headers.get('x-user-id');

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify case access
    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId,
        advocateId: userId,
        isVisible: true,
      },
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    await prisma.aIAnalysis.delete({
      where: { caseId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to delete analysis' },
      { status: 500 }
    );
  }
}

// Background analysis function
async function performAnalysis(
  caseId: string,
  userId: string,
  caseData: any
) {
  const startTime = Date.now();

  try {
    const claude = new ClaudeClient();

    // Build context from documents
    const documentsContext = caseData.documents
      .map(
        (doc: any) => `
# Document: ${doc.title}
Category: ${doc.category}
${doc.extractedText}
---
`
      )
      .join('\n\n');

    const caseContext = `
# Case Information
Case Number: ${caseData.caseNumber || caseData.efilingNumber}
Case Type: ${caseData.caseType}
Petitioner: ${caseData.petitionerName}
Respondent: ${caseData.respondentName}
Status: ${caseData.status}
Filing Date: ${caseData.efilingDate}

# Documents
${documentsContext}
`;

    const prompt = `Analyze this legal case and provide comprehensive analysis in JSON format:

{
  "caseTypeClassification": "string - classify the case type",
  "keyLegalIssues": ["array of key legal issues"],
  "relevantStatutes": ["array of relevant statutes and sections"],
  "precedentCases": [
    {
      "name": "case name",
      "citation": "citation",
      "relevance": "how it's relevant",
      "summary": "brief summary"
    }
  ],
  "actionItems": ["array of immediate actions needed"],
  "urgencyLevel": "LOW|MEDIUM|HIGH|CRITICAL",
  "deadlineReminders": [
    {
      "task": "task description",
      "dueDate": "YYYY-MM-DD",
      "priority": "LOW|MEDIUM|HIGH|CRITICAL",
      "description": "details"
    }
  ],
  "caseSummary": "comprehensive case summary",
  "strengths": ["case strengths"],
  "weaknesses": ["case weaknesses"],
  "recommendations": ["strategic recommendations"]
}`;

    const response = await claude.analyze(prompt, caseContext, 8192);

    // Parse JSON response
    const analysisContent: AnalysisContent = JSON.parse(response);

    // Calculate processing time
    const processingTime = Math.floor((Date.now() - startTime) / 1000);

    // Estimate token count
    const tokenCount = Math.ceil(
      (caseContext.length + prompt.length + response.length) / 4
    );

    // Update analysis with results
    await prisma.aIAnalysis.update({
      where: { caseId },
      data: {
        status: 'COMPLETED',
        analysis: analysisContent as any,
        urgencyLevel: analysisContent.urgencyLevel as UrgencyLevel,
        caseSummary: analysisContent.caseSummary,
        processedAt: new Date(),
        processingTimeSeconds: processingTime,
        tokenCount,
      },
    });
  } catch (error) {
    console.error('Analysis processing error:', error);

    // Update with error
    await prisma.aIAnalysis.update({
      where: { caseId },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Analysis failed',
      },
    });
  }
}