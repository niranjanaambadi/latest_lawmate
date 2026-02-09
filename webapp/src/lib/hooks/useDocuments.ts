// src/lib/hooks/useDocuments.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { DocumentCategory } from '@prisma/client';
import { uploadDocument } from '@/lib/api/documents';
import type { Document } from '@/types/document';
import { toast } from 'sonner';

interface UploadDocumentParams {
  caseId: string;
  file: File;
  title: string;
  category: DocumentCategory;
  description?: string;
}

export function useUploadDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, file, title, category, description }: UploadDocumentParams) => {
      return uploadDocument(caseId, file, { title, category, description });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['case', variables.caseId] });
      toast.success('Document uploaded successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    },
  });
}

export function useDocuments(caseId: string) {
  return useQuery({
    queryKey: ['documents', caseId],
    queryFn: async () => {
      const response = await fetch(`/api/cases/${caseId}/documents`);
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      const data = await response.json();
      return data.documents as Document[];
    },
    enabled: !!caseId,
  });
}

export function useDocument(documentId: string) {
  return useQuery({
    queryKey: ['document', documentId],
    queryFn: async () => {
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch document');
      }
      const data = await response.json();
      return data.document as Document;
    },
    enabled: !!documentId,
  });
}

export function useDocumentUrl(s3Key: string | undefined) {
  return useQuery({
    queryKey: ['document-url', s3Key],
    queryFn: async () => {
      if (!s3Key) return null;
      
      const response = await fetch(`/api/documents/url?key=${encodeURIComponent(s3Key)}`);
      if (!response.ok) {
        throw new Error('Failed to get document URL');
      }
      const data = await response.json();
      return data.url as string;
    },
    enabled: !!s3Key,
    staleTime: 5 * 60 * 1000,
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ documentId, caseId }: { documentId: string; caseId: string }) => {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Delete failed');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.caseId] });
      toast.success('Document deleted successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Delete failed');
    },
  });
}

export function useClassifyDocument() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ caseId, documentId }: { caseId: string; documentId: string }) => {
      const response = await fetch(`/api/cases/${caseId}/documents/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Classification failed');
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.caseId] });
      queryClient.invalidateQueries({ queryKey: ['document', variables.documentId] });
      toast.success('Document classified successfully');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Classification failed');
    },
  });
}