// src/app/api/cases/[caseId]/ai-insights/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ClaudeClient } from '@/lib/ai/core/claude-client';
import { PrecedentValidator } from '@/lib/ai/processors/precedent-validator';
import { RiskAssessor } from '@/lib/ai/processors/risk-assessor';
import { RightsMapper } from '@/lib/ai/processors/rights-mapper';
import { NarrativeOptimizer } from '@/lib/ai/processors/narrative-optimizer';
import { CounterAnticipator } from '@/lib/ai/processors/counter-anticipator';
import { ReliefEvaluator } from '@/lib/ai/processors/relief-evaluator';
import { buildCaseBundle } from '@/lib/utils/bundle-builder';
import { AIInsightType, InsightStatus } from '@prisma/client';

type AnalysisType = 
  | 'precedents'
  | 'risk'
  | 'rights'
  | 'narrative'
  | 'counter'
  | 'relief';

const INSIGHT_TYPE_MAP: Record<AnalysisType, AIInsightType> = {
  precedents: AIInsightType.PRECEDENTS,
  risk: AIInsightType.RISK_ASSESSMENT,
  rights: AIInsightType.RIGHTS_MAPPING,
  narrative: AIInsightType.NARRATIVE,
  counter: AIInsightType.COUNTER_ANTICIPATION,
  relief: AIInsightType.RELIEF_EVALUATION
};

const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params; // Fixed: await params
    
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { analysisType, forceRefresh } = await req.json() as {
      analysisType: AnalysisType;
      forceRefresh?: boolean;
    };

    if (!INSIGHT_TYPE_MAP[analysisType]) {
      return NextResponse.json(
        { error: 'Invalid analysis type' },
        { status: 400 }
      );
    }
    
    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId, // Fixed: use caseId variable
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

    const insightType = INSIGHT_TYPE_MAP[analysisType];

    // Check cache
    if (!forceRefresh) {
      const cached = await prisma.aIInsight.findFirst({
        where: {
          caseId, // Fixed: use caseId variable
          insightType,
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
    }

    // Build bundle
    const bundle = await buildCaseBundle(caseId); // Fixed: use caseId variable
    const claude = new ClaudeClient();

    let result: any;
    let tokensUsed = 0;

    // Create pending record
    const pendingInsight = await prisma.aIInsight.create({
      data: {
        caseId, // Fixed: use caseId variable
        insightType,
        result: {},
        status: InsightStatus.PROCESSING
      }
    });

    try {
      const startTime = Date.now();

      switch (analysisType) {
        case 'precedents':
          const precedentValidator = new PrecedentValidator(claude);
          result = await precedentValidator.validate(bundle, caseRecord.caseType);
          break;

        case 'risk':
          const riskAssessor = new RiskAssessor(claude);
          result = await riskAssessor.assess(bundle, caseRecord.caseType);
          break;

        case 'rights':
          const rightsMapper = new RightsMapper(claude);
          result = await rightsMapper.mapRights(bundle);
          break;

        case 'narrative':
          const narrativeOptimizer = new NarrativeOptimizer(claude);
          result = await narrativeOptimizer.optimize(bundle);
          break;

        case 'counter':
          const counterAnticipator = new CounterAnticipator(claude);
          result = await counterAnticipator.anticipate(bundle, caseRecord.caseType);
          break;

        case 'relief':
          const reliefEvaluator = new ReliefEvaluator(claude);
          result = await reliefEvaluator.evaluate(bundle, caseRecord.caseType);
          break;

        default:
          throw new Error('Unsupported analysis type');
      }

      const processingTime = Math.floor((Date.now() - startTime) / 1000);

      // Update with results
      const completedInsight = await prisma.aIInsight.update({
        where: { id: pendingInsight.id },
        data: {
          result: result as any,
          status: InsightStatus.COMPLETED,
          tokensUsed,
          expiresAt: new Date(Date.now() + CACHE_DURATION)
        }
      });

      return NextResponse.json({
        cached: false,
        data: result,
        analyzedAt: completedInsight.createdAt,
        processingTime,
        tokensUsed
      });
    } catch (error) {
      // Update with error
      await prisma.aIInsight.update({
        where: { id: pendingInsight.id },
        data: {
          status: InsightStatus.FAILED,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      });

      throw error;
    }
  } catch (error) {
    console.error('AI insights error:', error);
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}

// Get all insights for a case
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> } // Fixed: Promise wrapper
) {
  try {
    const { caseId } = await params; // Fixed: await params
    
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId, // Fixed: use caseId variable
        advocateId: userId,
        isVisible: true
      }
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const insights = await prisma.aIInsight.findMany({
      where: {
        caseId, // Fixed: use caseId variable
        status: InsightStatus.COMPLETED,
        OR: [
          { expiresAt: { gte: new Date() } },
          { expiresAt: null }
        ]
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['insightType']
    });

    const insightMap = insights.reduce((acc, insight) => {
      const type = Object.entries(INSIGHT_TYPE_MAP).find(
        ([_, value]) => value === insight.insightType
      )?.[0];
      
      if (type) {
        acc[type] = {
          data: insight.result,
          analyzedAt: insight.createdAt,
          tokensUsed: insight.tokensUsed
        };
      }
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      insights: insightMap,
      availableTypes: Object.keys(insightMap)
    });
  } catch (error) {
    console.error('Get insights error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch insights' },
      { status: 500 }
    );
  }
}
