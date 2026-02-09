// src/app/api/cases/[caseId]/hearing-brief/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ClaudeClient } from '@/lib/ai/core/claude-client';
import { CaseBundleProcessor } from '@/lib/ai/core/case-bundle-processor';
import { buildCaseBundle } from '@/lib/utils/bundle-builder';
import { AIInsightType, InsightStatus } from '@prisma/client';

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

    const { hearingDate, focusAreas } = await req.json();

    const caseRecord = await prisma.case.findFirst({
      where: {
        id: caseId,
        advocateId: userId,
        isVisible: true
      },
      include: {
        documents: {
          where: { uploadStatus: 'COMPLETED' }
        }
      }
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const bundle = await buildCaseBundle(caseId);
    const claude = new ClaudeClient();

    // Get bundle analysis
    const processor = new CaseBundleProcessor(claude);
    const bundleAnalysis = await processor.analyzeBundle(bundle);

    // Get latest insights
    const insights = await prisma.aIInsight.findMany({
      where: {
        caseId,
        insightType: {
          in: [
            AIInsightType.PRECEDENTS,
            AIInsightType.RISK_ASSESSMENT,
            AIInsightType.RIGHTS_MAPPING,
            AIInsightType.COUNTER_ANTICIPATION
          ]
        },
        status: InsightStatus.COMPLETED,
        OR: [
          { expiresAt: { gte: new Date() } },
          { expiresAt: null }
        ]
      },
      orderBy: { createdAt: 'desc' },
      distinct: ['insightType']
    });

    const context = `
# Case Details
Case Number: ${caseRecord.caseNumber || 'Not assigned'}
Case Type: ${caseRecord.caseType}
Petitioner: ${caseRecord.petitionerName}
Respondent: ${caseRecord.respondentName}
Next Hearing: ${caseRecord.nextHearingDate?.toLocaleDateString() || 'Not scheduled'}

# Case Bundle Analysis
${JSON.stringify(bundleAnalysis, null, 2)}

# AI Insights
${insights.map(i => `## ${i.insightType}\n${JSON.stringify(i.result, null, 2)}`).join('\n\n')}
`;

    const prompt = `Generate a concise hearing day brief for ${hearingDate || caseRecord.nextHearingDate?.toLocaleDateString() || 'upcoming hearing'}.

Focus areas: ${focusAreas?.join(', ') || 'All aspects'}

The brief should include:
1. **Case Summary** (3-4 sentences)
2. **Key Facts** (bullet points, max 5)
3. **Relief Sought** (specific prayers)
4. **Main Arguments** (3-5 core points with supporting precedents)
5. **Anticipated Counter-Arguments** (with responses)
6. **Changes Since Last Hearing** (if applicable)
7. **Contradictions to Address** (if any)
8. **Constitutional Grounds** (Articles invoked)
9. **Critical Precedents** (top 3 with citations)
10. **Oral Submission Strategy** (key points to emphasize)

Format as structured markdown for easy reading in court.
This is NOT a rewritten petition - it's a brief for lawyer preparation.`;

    const brief = await claude.analyzeWithCache(
      prompt,
      context,
      `Hearing Date: ${hearingDate || 'Next scheduled'}`,
      8192
    );

    // Save the brief
    const savedBrief = await prisma.hearingBrief.create({
      data: {
        caseId,
        hearingDate: hearingDate ? new Date(hearingDate) : caseRecord.nextHearingDate || new Date(),
        content: brief,
        focusAreas: focusAreas || [],
        bundleSnapshot: bundleAnalysis as any
      }
    });

    return NextResponse.json({
      id: savedBrief.id,
      content: brief,
      generatedAt: savedBrief.createdAt,
      hearingDate: savedBrief.hearingDate
    });
  } catch (error) {
    console.error('Hearing brief error:', error);
    return NextResponse.json(
      { error: 'Failed to generate hearing brief' },
      { status: 500 }
    );
  }
}

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

    const briefs = await prisma.hearingBrief.findMany({
      where: { caseId },
      orderBy: { hearingDate: 'desc' },
      take: 10
    });

    return NextResponse.json({ 
      briefs,
      count: briefs.length
    });
  } catch (error) {
    console.error('Get briefs error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch hearing briefs' },
      { status: 500 }
    );
  }
}