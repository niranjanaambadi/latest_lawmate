// src/components/documents/AIChat.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { useAIChat } from '@/lib/hooks/useAIChat';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Send, Trash2, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AIChatProps {
  documentId: string;
  documentTitle?: string;
}

export function AIChat({ documentId, documentTitle }: AIChatProps) {
  // FIX: Pass options object instead of just documentId
  const {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
    hasHistory,
    tokenCount,
  } = useAIChat({ 
    documentId,           // ✅ Pass as part of options object
    documentTitle,        // ✅ Optional
    persistHistory: true, // ✅ Optional
    maxMessages: 50       // ✅ Optional
  });

  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    await sendMessage(input);
    setInput('');
  };

  const lastMessage = messages[messages.length - 1];
  const showRetry = lastMessage?.error;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b p-4 flex justify-between items-center">
        <div>
          <h3 className="font-semibold">AI Assistant</h3>
          <p className="text-xs text-muted-foreground">
            Ask questions about {documentTitle || 'this document'}
          </p>
        </div>
        {hasHistory && (
          <Button
            variant="ghost"
            size="icon"
            onClick={clearMessages}
            disabled={isLoading}
            title="Clear chat history"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea ref={scrollRef} className="flex-1 p-4">
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <p className="text-sm">
              Ask me anything about this document!
            </p>
            <p className="text-xs mt-2">
              I can help you understand legal terms, find specific information,
              or summarize sections.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex',
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'rounded-lg px-4 py-2 max-w-[80%]',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : message.error
                      ? 'bg-destructive/10 text-destructive border border-destructive'
                      : 'bg-muted'
                  )}
                >
                  {message.isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                  )}
                  {message.role === 'assistant' && !message.isLoading && !message.error && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {error && (
          <div className="mt-4 p-3 bg-destructive/10 text-destructive text-sm rounded-lg border border-destructive">
            {error}
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t p-4">
        {showRetry && (
          <Button
            variant="outline"
            size="sm"
            onClick={retryLastMessage}
            disabled={isLoading}
            className="mb-2 w-full"
          >
            <RotateCw className="mr-2 h-4 w-4" />
            Retry Last Message
          </Button>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about this document..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
        
        {tokenCount > 0 && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Tokens used: {tokenCount.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}