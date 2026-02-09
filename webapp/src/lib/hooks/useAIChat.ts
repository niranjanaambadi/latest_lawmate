// src/lib/hooks/useAIChat.ts
'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isLoading?: boolean;
  error?: boolean;
}

export interface ChatHistoryItem {
  documentId: string;
  documentTitle: string;
  messages: ChatMessage[];
  lastMessageAt: string;
}

interface UseAIChatOptions {
  documentId: string;
  documentTitle?: string;
  maxMessages?: number;
  persistHistory?: boolean;
}

interface UseAIChatReturn {
  messages: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  sendMessage: (content: string) => Promise<void>;
  clearMessages: () => void;
  retryLastMessage: () => Promise<void>;
  hasHistory: boolean;
  tokenCount: number;
}

export function useAIChat({
  documentId,
  documentTitle = 'Document',
  maxMessages = 50,
  persistHistory = true,
}: UseAIChatOptions): UseAIChatReturn {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenCount, setTokenCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastUserMessageRef = useRef<string | null>(null);

  // Storage keys
  const storageKey = `chat_history_${documentId}`;
  const allChatsKey = 'all_chat_histories';

  // Load chat history from localStorage on mount
  useEffect(() => {
    if (persistHistory && typeof window !== 'undefined') {
      try {
        const savedMessages = localStorage.getItem(storageKey);
        if (savedMessages) {
          const parsed = JSON.parse(savedMessages) as ChatMessage[];
          setMessages(parsed);
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      }
    }
  }, [documentId, persistHistory, storageKey]);

  // Save chat history to localStorage
  const saveHistory = useCallback((msgs: ChatMessage[]) => {
    if (!persistHistory || typeof window === 'undefined') return;

    try {
      // Save messages for this document
      localStorage.setItem(storageKey, JSON.stringify(msgs));

      // Update all chats index
      const allChats = localStorage.getItem(allChatsKey);
      const allChatsData: ChatHistoryItem[] = allChats ? JSON.parse(allChats) : [];
      
      const existingIndex = allChatsData.findIndex(
        (chat) => chat.documentId === documentId
      );

      const lastMessage = msgs[msgs.length - 1];
      const chatItem: ChatHistoryItem = {
        documentId,
        documentTitle,
        messages: msgs,
        lastMessageAt: lastMessage?.timestamp || new Date().toISOString(),
      };

      if (existingIndex >= 0) {
        allChatsData[existingIndex] = chatItem;
      } else {
        allChatsData.push(chatItem);
      }

      // Keep only last 20 chats
      const recentChats = allChatsData
        .sort((a, b) => 
          new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        )
        .slice(0, 20);

      localStorage.setItem(allChatsKey, JSON.stringify(recentChats));
    } catch (err) {
      console.error('Failed to save chat history:', err);
    }
  }, [documentId, documentTitle, persistHistory, storageKey, allChatsKey]);

  // Generate unique message ID
  const generateMessageId = useCallback(() => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  // Add message to state
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => {
      const newMessages = [...prev, message];
      // Limit message history
      if (newMessages.length > maxMessages) {
        return newMessages.slice(-maxMessages);
      }
      return newMessages;
    });
  }, [maxMessages]);

  // Update message in state
  const updateMessage = useCallback((messageId: string, updates: Partial<ChatMessage>) => {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? { ...msg, ...updates } : msg))
    );
  }, []);

  // Send message to API
  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      const trimmedContent = content.trim();
      lastUserMessageRef.current = trimmedContent;
      setError(null);

      // Add user message
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: 'user',
        content: trimmedContent,
        timestamp: new Date().toISOString(),
      };
      addMessage(userMessage);

      // Add loading assistant message
      const assistantMessageId = generateMessageId();
      const loadingMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isLoading: true,
      };
      addMessage(loadingMessage);

      setIsLoading(true);

      // Create abort controller for this request
      abortControllerRef.current = new AbortController();

      try {
        // Get conversation history (exclude the loading message)
        const conversationHistory = messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));

        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            documentId,
            message: trimmedContent,
            conversationHistory,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Server error: ${response.status}`);
        }

        const data = await response.json();

        // Update loading message with response
        updateMessage(assistantMessageId, {
          content: data.response,
          isLoading: false,
        });

        if (data.tokenCount) {
          setTokenCount((prev) => prev + data.tokenCount);
        }

        // Save history
        setMessages((currentMessages) => {
          const updatedMessages = currentMessages.map((msg) =>
            msg.id === assistantMessageId
              ? { ...msg, content: data.response, isLoading: false }
              : msg
          );
          saveHistory(updatedMessages);
          return updatedMessages;
        });
      } catch (err: any) {
        console.error('Chat error:', err);

        if (err.name === 'AbortError') {
          // Request was aborted
          updateMessage(assistantMessageId, {
            content: 'Request cancelled',
            isLoading: false,
            error: true,
          });
        } else {
          const errorMessage =
            err.message || 'Failed to get response. Please try again.';
          
          setError(errorMessage);
          toast.error(errorMessage);

          // Update loading message with error
          updateMessage(assistantMessageId, {
            content: 'Sorry, I encountered an error. Please try again.',
            isLoading: false,
            error: true,
          });
        }
      } finally {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    },
    [
      documentId,
      isLoading,
      messages,
      generateMessageId,
      addMessage,
      updateMessage,
      saveHistory,
    ]
  );

  // Retry last message
  const retryLastMessage = useCallback(async () => {
    if (!lastUserMessageRef.current || isLoading) return;

    // Remove last two messages (user + failed assistant)
    setMessages((prev) => prev.slice(0, -2));

    // Resend
    await sendMessage(lastUserMessageRef.current);
  }, [isLoading, sendMessage]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    setTokenCount(0);
    lastUserMessageRef.current = null;

    if (persistHistory && typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKey);
        
        // Update all chats index
        const allChats = localStorage.getItem(allChatsKey);
        if (allChats) {
          const allChatsData: ChatHistoryItem[] = JSON.parse(allChats);
          const filtered = allChatsData.filter(
            (chat) => chat.documentId !== documentId
          );
          localStorage.setItem(allChatsKey, JSON.stringify(filtered));
        }
      } catch (err) {
        console.error('Failed to clear chat history:', err);
      }
    }

    toast.success('Chat history cleared');
  }, [documentId, persistHistory, storageKey, allChatsKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearMessages,
    retryLastMessage,
    hasHistory: messages.length > 0,
    tokenCount,
  };
}

// Hook to get all chat histories
export function useAllChatHistories() {
  const [histories, setHistories] = useState<ChatHistoryItem[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const allChats = localStorage.getItem('all_chat_histories');
      if (allChats) {
        const parsed = JSON.parse(allChats) as ChatHistoryItem[];
        setHistories(
          parsed.sort(
            (a, b) =>
              new Date(b.lastMessageAt).getTime() -
              new Date(a.lastMessageAt).getTime()
          )
        );
      }
    } catch (err) {
      console.error('Failed to load chat histories:', err);
    }
  }, []);

  const deleteHistory = useCallback((documentId: string) => {
    try {
      // Remove from localStorage
      localStorage.removeItem(`chat_history_${documentId}`);

      // Update all chats index
      const allChats = localStorage.getItem('all_chat_histories');
      if (allChats) {
        const allChatsData: ChatHistoryItem[] = JSON.parse(allChats);
        const filtered = allChatsData.filter(
          (chat) => chat.documentId !== documentId
        );
        localStorage.setItem('all_chat_histories', JSON.stringify(filtered));
        setHistories(filtered);
      }

      toast.success('Chat history deleted');
    } catch (err) {
      console.error('Failed to delete chat history:', err);
      toast.error('Failed to delete chat history');
    }
  }, []);

  return {
    histories,
    deleteHistory,
  };
}