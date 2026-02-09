// src/app/api/ai/[caseId]/precedents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ClaudeClient } from '@/lib/ai/core/claude-client';
import { PrecedentValidator } from '@/lib/ai/processors/precedent-validator';
import { buildCaseBundle } from '@/lib/utils/bundle-builder';
import { AIInsightType, InsightStatus } from '@prisma/client';

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

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

    // Check cache
    const cached = await prisma.aIInsight.findFirst({
      where: {
        caseId,
        insightType: AIInsightType.PRECEDENTS,
        status: InsightStatus.COMPLETED,
        OR: [
          { expiresAt: { gte: new Date() } },
          { expiresAt: null }
        ]
      },
      orderBy: { createdAt: 'desc' }
    });

    if (cached) {
      return NextResponse.json({
        cached: true,
        data: cached.result,
        analyzedAt: cached.createdAt,
        tokensUsed: cached.tokensUsed
      });
    }

    // Generate new analysis
    const bundle = await buildCaseBundle(caseId);
    const claude = new ClaudeClient();
    const validator = new PrecedentValidator(claude);
    
    const precedents = await validator.validate(bundle, caseRecord.caseType);

    // Cache result
    const insight = await prisma.aIInsight.create({
      data: {
        caseId,
        insightType: AIInsightType.PRECEDENTS,
        result: precedents as any,
        model: 'claude-3-5-sonnet-20241022',
        status: InsightStatus.COMPLETED,
        expiresAt: new Date(Date.now() + CACHE_DURATION)
      }
    });

    return NextResponse.json({
      cached: false,
      data: precedents,
      analyzedAt: insight.createdAt,
      tokensUsed: insight.tokensUsed
    });
  } catch (error) {
    console.error('Precedents analysis error:', error);
    
    try {
      const { caseId } = await params;
      await prisma.aIInsight.create({
        data: {
          caseId,
          insightType: AIInsightType.PRECEDENTS,
          result: {},
          status: InsightStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });
    } catch {}

    return NextResponse.json(
      { error: 'Failed to analyze precedents' },
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

    const { forceRefresh } = await req.json();

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

    if (forceRefresh) {
      await prisma.aIInsight.updateMany({
        where: {
          caseId,
          insightType: AIInsightType.PRECEDENTS
        },
        data: {
          expiresAt: new Date()
        }
      });
    }

    const bundle = await buildCaseBundle(caseId);
    const claude = new ClaudeClient();
    const validator = new PrecedentValidator(claude);
    
    const precedents = await validator.validate(bundle, caseRecord.caseType);

    const insight = await prisma.aIInsight.create({
      data: {
        caseId,
        insightType: AIInsightType.PRECEDENTS,
        result: precedents as any,
        model: 'claude-3-5-sonnet-20241022',
        status: InsightStatus.COMPLETED,
        expiresAt: new Date(Date.now() + CACHE_DURATION)
      }
    });

    return NextResponse.json({
      cached: false,
      data: precedents,
      analyzedAt: insight.createdAt,
      tokensUsed: insight.tokensUsed
    });
  } catch (error) {
    console.error('Precedents analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze precedents' },
      { status: 500 }
    );
  }
}