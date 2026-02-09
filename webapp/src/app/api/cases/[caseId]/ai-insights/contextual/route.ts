// src/app/api/cases/[caseId]/ai-insights/contextual/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { ClaudeClient } from '@/lib/ai/core/claude-client';
import { buildCaseBundle } from '@/lib/utils/bundle-builder';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const { caseId } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { section, currentText } = await req.json();

    const bundle = await buildCaseBundle(caseId);
    const claude = new ClaudeClient();

    const prompt = `Provide contextual suggestions for the ${section} section being written.

Current text being written:
${currentText || '[Section not started yet]'}

Provide 3-5 highly relevant suggestions including:
1. Relevant precedents that apply to what's being written
2. Constitutional angles to consider
3. Potential counter-arguments to address
4. Improvements to clarity or persuasiveness

Format as JSON array of suggestions with: type, title, content, relevance (0-1)`;

    const context = `# Case Bundle\n${JSON.stringify(bundle, null, 2)}`;

    const response = await claude.analyzeWithCache(
      prompt,
      context,
      `Section: ${section}`,
      4096
    );

    const suggestions = JSON.parse(response);

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error('Contextual analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to generate suggestions' },
      { status: 500 }
    );
  }
}