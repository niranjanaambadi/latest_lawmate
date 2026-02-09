// src/app/api/cases/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CaseStatus, AIInsightType, InsightStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') as CaseStatus | null;
    const caseType = searchParams.get('caseType');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: any = {
      advocateId: userId,
      isVisible: true
    };

    if (status) {
      where.status = status;
    }

    if (caseType) {
      where.caseType = caseType;
    }

    if (search) {
      where.OR = [
        { caseNumber: { contains: search, mode: 'insensitive' } },
        { petitionerName: { contains: search, mode: 'insensitive' } },
        { respondentName: { contains: search, mode: 'insensitive' } },
        { efilingNumber: { contains: search, mode: 'insensitive' } }
      ];
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          documents: {
            select: {
              id: true,
              title: true,
              category: true,
              uploadedAt: true
            },
            take: 5,
            orderBy: { uploadedAt: 'desc' }
          },
          aiAnalysis: {
            select: {
              status: true,
              urgencyLevel: true,
              caseSummary: true,
              processedAt: true
            }
          },
          _count: {
            select: {
              documents: true,
              history: true
            }
          }
        },
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.case.count({ where })
    ]);

    // Get AI insights status for each case
    const casesWithInsights = await Promise.all(
      cases.map(async (caseItem) => {
        const insightCount = await prisma.aIInsight.count({
          where: {
            caseId: caseItem.id,
            status: InsightStatus.COMPLETED,
            OR: [
              { expiresAt: { gte: new Date() } },
              { expiresAt: null }
            ]
          }
        });

        return {
          ...caseItem,
          aiInsightsAvailable: insightCount,
          aiInsightsTotal: 6 // Total number of insight types
        };
      })
    );

    return NextResponse.json({
      cases: casesWithInsights,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Cases list error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}