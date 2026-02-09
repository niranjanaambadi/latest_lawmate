// src/app/api/cases/[caseId]/ai-insights/batch/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ClaudeClient } from '@/lib/ai/core/claude-client';
import { PrecedentValidator } from '@/lib/ai/processors/precedent-validator';
import { RiskAssessor } from '@/lib/ai/processors/risk-assessor';
import { RightsMapper } from '@/lib/ai/processors/rights-mapper';
import { ReliefEvaluator } from '@/lib/ai/processors/relief-evaluator';
import { buildCaseBundle } from '@/lib/utils/bundle-builder';
import { AIInsightType, InsightStatus } from '@prisma/client';

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params; // Add this line
    
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId,
        advocateId: userId,
        isVisible: true
      },
      include: {
        documents: {
          where: { uploadStatus: 'COMPLETED' },
          orderBy: { uploadedAt: 'asc' }
        }
      }
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const bundle = await buildCaseBundle(caseId);
    const claude = new ClaudeClient();

    const startTime = Date.now();

    // Phase 1: Initial Assessment (parallel)
    const [riskAssessment, reliefEvaluation] = await Promise.all([
      new RiskAssessor(claude).assess(bundle, caseRecord.caseType),
      new ReliefEvaluator(claude).evaluate(bundle, caseRecord.caseType)
    ]);

    // Phase 2: Legal Foundation (parallel)
    const [precedents, rights] = await Promise.all([
      new PrecedentValidator(claude).validate(bundle, caseRecord.caseType),
      new RightsMapper(claude).mapRights(bundle)
    ]);

    const totalTime = Math.floor((Date.now() - startTime) / 1000);

    // Cache all results in transaction
    await prisma.$transaction([
      prisma.aIInsight.create({
        data: {
          caseId,
          insightType: AIInsightType.RISK_ASSESSMENT,
          result: riskAssessment as any,
          model: 'claude-3-5-sonnet-20241022',
          status: InsightStatus.COMPLETED,
          expiresAt: new Date(Date.now() + CACHE_DURATION)
        }
      }),
      prisma.aIInsight.create({
        data: {
          caseId,
          insightType: AIInsightType.RELIEF_EVALUATION,
          result: reliefEvaluation as any,
          model: 'claude-3-5-sonnet-20241022',
          status: InsightStatus.COMPLETED,
          expiresAt: new Date(Date.now() + CACHE_DURATION)
        }
      }),
      prisma.aIInsight.create({
        data: {
          caseId,
          insightType: AIInsightType.PRECEDENTS,
          result: precedents as any,
          model: 'claude-3-5-sonnet-20241022',
          status: InsightStatus.COMPLETED,
          expiresAt: new Date(Date.now() + CACHE_DURATION)
        }
      }),
      prisma.aIInsight.create({
        data: {
          caseId,
          insightType: AIInsightType.RIGHTS_MAPPING,
          result: rights as any,
          model: 'claude-3-5-sonnet-20241022',
          status: InsightStatus.COMPLETED,
          expiresAt: new Date(Date.now() + CACHE_DURATION)
        }
      })
    ]);

    return NextResponse.json({
      phase1: {
        risk: riskAssessment,
        relief: reliefEvaluation
      },
      phase2: {
        precedents,
        rights
      },
      metadata: {
        totalTime,
        analyzedAt: new Date(),
        caseType: caseRecord.caseType
      }
    });
  } catch (error) {
    console.error('Batch analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate batch insights' },
      { status: 500 }
    );
  }
}