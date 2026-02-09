// src/app/api/cases/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CaseStatus } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const where = {
      advocateId: userId,
      isVisible: true,
    };

    // Get basic counts
    const [
      totalCases,
      pendingCases,
      disposedCases,
      upcomingHearings,
      totalDocuments,
    ] = await Promise.all([
      prisma.case.count({ where }),
      prisma.case.count({ where: { ...where, status: CaseStatus.PENDING } }),
      prisma.case.count({ where: { ...where, status: CaseStatus.DISPOSED } }),
      prisma.case.count({
        where: {
          ...where,
          nextHearingDate: {
            gte: new Date(),
            lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.document.count({
        where: {
          case: where,
        },
      }),
    ]);

    // Get cases by status
    const casesByStatusRaw = await prisma.case.groupBy({
      by: ['status'],
      where,
      _count: true,
    });

    const casesByStatus = Object.values(CaseStatus).reduce((acc, status) => {
      const found = casesByStatusRaw.find((item) => item.status === status);
      acc[status] = found?._count || 0;
      return acc;
    }, {} as Record<CaseStatus, number>);

    // Get cases by type
    const casesByTypeRaw = await prisma.case.groupBy({
      by: ['caseType'],
      where,
      _count: true,
    });

    const casesByType = casesByTypeRaw.reduce((acc, item) => {
      acc[item.caseType] = item._count;
      return acc;
    }, {} as Record<string, number>);

    // Get monthly trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyTrendData = await prisma.case.findMany({
      where: {
        ...where,
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        createdAt: true,
      },
    });

    const monthlyTrend = monthlyTrendData.reduce((acc, item) => {
      const month = new Date(item.createdAt).toLocaleString('default', {
        month: 'short',
        year: 'numeric',
      });
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const monthlyTrendArray = Object.entries(monthlyTrend).map(
      ([month, count]) => ({
        month,
        count,
      })
    );

    return NextResponse.json({
      totalCases,
      pendingCases,
      disposedCases,
      upcomingHearings,
      totalDocuments,
      casesByStatus,
      casesByType,
      monthlyTrend: monthlyTrendArray,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    );
  }
}