// src/app/api/dashboard/stats/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { CaseStatus } from '@prisma/client';
import { startOfMonth, subMonths, format } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total cases
    const totalCases = await prisma.case.count({
      where: {
        advocateId: userId,
        isVisible: true
      }
    });

    // Get pending cases
    const pendingCases = await prisma.case.count({
      where: {
        advocateId: userId,
        isVisible: true,
        status: CaseStatus.PENDING
      }
    });

    // Get disposed cases
    const disposedCases = await prisma.case.count({
      where: {
        advocateId: userId,
        isVisible: true,
        status: CaseStatus.DISPOSED
      }
    });

    // Get upcoming hearings (next 7 days)
    const upcomingHearings = await prisma.case.count({
      where: {
        advocateId: userId,
        isVisible: true,
        nextHearingDate: {
          gte: new Date(),
          lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    // Get total documents
    const totalDocuments = await prisma.document.count({
      where: {
        case: {
          advocateId: userId,
          isVisible: true
        }
      }
    });

    // Get cases by status
    const casesByStatus = await prisma.case.groupBy({
      by: ['status'],
      where: {
        advocateId: userId,
        isVisible: true
      },
      _count: {
        status: true
      }
    });

    const statusCounts = casesByStatus.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {} as Record<CaseStatus, number>);

    // Get cases by type
    const casesByType = await prisma.case.groupBy({
      by: ['caseType'],
      where: {
        advocateId: userId,
        isVisible: true
      },
      _count: {
        caseType: true
      }
    });

    const typeCounts = casesByType.reduce((acc, item) => {
      acc[item.caseType] = item._count.caseType;
      return acc;
    }, {} as Record<string, number>);

    // Get monthly trend (last 6 months)
    const monthlyTrend = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = startOfMonth(subMonths(new Date(), i));
      const monthEnd = startOfMonth(subMonths(new Date(), i - 1));

      const count = await prisma.case.count({
        where: {
          advocateId: userId,
          isVisible: true,
          efilingDate: {
            gte: monthStart,
            lt: monthEnd
          }
        }
      });

      monthlyTrend.push({
        month: format(monthStart, 'MMM'),
        count
      });
    }

    const stats = {
      total_cases: totalCases,
      pending_cases: pendingCases,
      disposed_cases: disposedCases,
      upcoming_hearings: upcomingHearings,
      total_documents: totalDocuments,
      cases_by_status: {
        FILED: statusCounts.FILED || 0,
        REGISTERED: statusCounts.REGISTERED || 0,
        PENDING: statusCounts.PENDING || 0,
        DISPOSED: statusCounts.DISPOSED || 0,
        TRANSFERRED: statusCounts.TRANSFERRED || 0
      },
      cases_by_type: typeCounts,
      monthly_trend: monthlyTrend
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}