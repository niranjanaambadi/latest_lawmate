// src/app/api/ai/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { ClaudeClient } from '@/lib/ai/core/claude-client';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { documentId, message, conversationHistory } = await req.json() as {
      documentId: string;
      message: string;
      conversationHistory?: ChatMessage[];
    };

    if (!documentId || !message) {
      return NextResponse.json(
        { error: 'Document ID and message are required' },
        { status: 400 }
      );
    }

    // Verify document access
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
        case: {
          advocateId: userId,
          isVisible: true
        }
      },
      include: {
        case: {
          select: {
            caseNumber: true,
            efilingNumber: true,
            caseType: true
          }
        }
      }
    });

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found or access denied' },
        { status: 404 }
      );
    }

    // Check if document has extracted text
    if (!document.extractedText) {
      return NextResponse.json(
        { error: 'Document text not available. Please wait for processing to complete.' },
        { status: 400 }
      );
    }

    // Build context
    const context = `
# Document Information
Title: ${document.title}
Category: ${document.category}
Case: ${document.case.caseNumber || document.case.efilingNumber}
Case Type: ${document.case.caseType}

# Document Content
${document.extractedText.substring(0, 50000)} // Limit to first 50k chars

# Instructions
You are a legal AI assistant helping an advocate analyze this document.
Provide accurate, helpful responses based on the document content.
If information is not in the document, clearly state that.
Cite specific sections when possible.
`;

    const claude = new ClaudeClient();

    // Build conversation for Claude
    const conversationMessages = [
      ...(conversationHistory || []).map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: 'user' as const,
        content: message
      }
    ];

    // For Claude, we need to format properly
    const formattedConversation = conversationMessages
      .map((msg, i) => {
        // Ensure alternating user/assistant messages
        if (i === 0 && msg.role === 'assistant') {
          return `Human: [Previous context]\n\nAssistant: ${msg.content}`;
        }
        return msg.role === 'user' 
          ? `Human: ${msg.content}`
          : `Assistant: ${msg.content}`;
      })
      .join('\n\n');

    const fullPrompt = `${formattedConversation}\n\nAssistant:`;

    // Get response from Claude
    const response = await claude.analyze(
      fullPrompt,
      context,
      4096
    );

    // Estimate token count (rough approximation)
    const tokenCount = Math.ceil(
      (context.length + fullPrompt.length + response.length) / 4
    );

    return NextResponse.json({
      response,
      tokenCount,
      documentTitle: document.title
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}