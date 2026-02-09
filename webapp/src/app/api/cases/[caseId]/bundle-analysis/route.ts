// src/app/api/cases/[caseId]/bundle-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ClaudeClient } from '@/lib/ai/core/claude-client';
import { CaseBundleProcessor } from '@/lib/ai/core/case-bundle-processor';
import { buildCaseBundle } from '@/lib/utils/bundle-builder';
import { AIInsightType, InsightStatus } from '@prisma/client';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    
    // Get user from session/token
    const userId = req.headers.get('x-user-id'); // Implement your auth
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify case belongs to user
    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId,
        advocateId: userId,
        isVisible: true
      },
      include: {
        documents: {
          where: {
            uploadStatus: 'COMPLETED'
          },
          orderBy: { uploadedAt: 'asc' }
        }
      }
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    // Check for cached analysis (24 hours)
    const cached = await prisma.aIInsight.findFirst({
      where: {
        caseId,
        insightType: AIInsightType.BUNDLE_ANALYSIS,
        status: InsightStatus.COMPLETED,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (cached) {
      return NextResponse.json({
        cached: true,
        data: cached.result,
        analyzedAt: cached.createdAt
      });
    }

    // Build bundle and analyze
    const bundle = await buildCaseBundle(caseRecord.id);
    const claude = new ClaudeClient();
    const processor = new CaseBundleProcessor(claude);
    
    const analysis = await processor.analyzeBundle(bundle);

    // Cache result
    const insight = await prisma.aIInsight.create({
      data: {
        caseId,
        insightType: AIInsightType.BUNDLE_ANALYSIS,
        result: analysis as any,
        model: 'claude-3-5-sonnet-20241022',
        status: InsightStatus.COMPLETED,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      }
    });

    return NextResponse.json({
      cached: false,
      data: analysis,
      analyzedAt: insight.createdAt
    });
  } catch (error) {
    console.error('Bundle analysis error:', error);
    
    // Log failed analysis
    try {
      const { caseId } = await params;
      await prisma.aIInsight.create({
        data: {
          caseId,
          insightType: AIInsightType.BUNDLE_ANALYSIS,
          result: {},
          status: InsightStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } catch {}

    return NextResponse.json(
      { error: 'Failed to analyze bundle' },
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

    // Force refresh - invalidate cache
    await prisma.aIInsight.updateMany({
      where: {
        caseId,
        insightType: AIInsightType.BUNDLE_ANALYSIS
      },
      data: {
        expiresAt: new Date() // Expire immediately
      }
    });

    const bundle = await buildCaseBundle(caseId);
    const claude = new ClaudeClient();
    const processor = new CaseBundleProcessor(claude);
    const analysis = await processor.analyzeBundle(bundle);

    const insight = await prisma.aIInsight.create({
      data: {
        caseId,
        insightType: AIInsightType.BUNDLE_ANALYSIS,
        result: analysis as any,
        model: 'claude-3-5-sonnet-20241022',
        status: InsightStatus.COMPLETED,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return NextResponse.json({
      cached: false,
      data: analysis,
      analyzedAt: insight.createdAt
    });
  } catch (error) {
    console.error('Bundle analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze bundle' },
      { status: 500 }
    );
  }
}
