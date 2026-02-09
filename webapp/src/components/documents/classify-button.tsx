// src/components/documents/classify-button.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface ClassifyButtonProps {
  caseId: string;
  documentId?: string;
  onComplete?: () => void;
}

export function ClassifyButton({ caseId, documentId, onComplete }: ClassifyButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClassify = async () => {
    setLoading(true);
    try {
      let response;
      
      if (documentId) {
        // Classify single document
        response = await fetch(`/api/cases/${caseId}/documents/classify`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ documentId })
        });
      } else {
        // Classify all documents
        response = await fetch(`/api/cases/${caseId}/documents/classify`);
      }

      const data = await response.json();

      if (data.success) {
        toast.success(
          documentId 
            ? 'Document classified successfully' 
            : `Classified ${data.classified} documents`
        );
        onComplete?.();
      } else {
        toast.error(data.error || 'Classification failed');
      }
    } catch (error) {
      console.error('Classification error:', error);
      toast.error('Failed to classify documents');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleClassify} 
      disabled={loading}
      variant="outline"
      size="sm"
    >
      {loading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Sparkles className="mr-2 h-4 w-4" />
      )}
      {loading ? 'Classifying...' : 'AI Classify'}
    </Button>
  );
}