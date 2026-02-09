// src/app/api/cron/process-documents/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { processUnprocessedDocuments } from '@/lib/jobs/process-documents';

export async function GET(request: NextRequest) {
  // Verify cron secret from Vercel
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await processUnprocessedDocuments();
    return NextResponse.json({ 
      success: true,
      message: 'Documents processed successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json({ 
      error: 'Failed to process documents',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Allow POST as well for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}