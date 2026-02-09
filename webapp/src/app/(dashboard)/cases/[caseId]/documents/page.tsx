// src/app/(dashboard)/cases/[caseId]/documents/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { ClassifyButton } from '@/components/documents/classify-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DocumentsPage() {
  const params = useParams();
  const caseId = params.caseId as string;
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDocuments = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}/documents`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [caseId]);

  if (loading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Documents</h1>
        <ClassifyButton 
          caseId={caseId} 
          onComplete={loadDocuments}
        />
      </div>

      <div className="grid gap-4">
        {documents.map((doc: any) => (
          <Card key={doc.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{doc.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {doc.category}
                  </p>
                </div>
                <div className="flex gap-2">
                  {doc.classificationConfidence && (
                    <Badge variant="secondary">
                      {Math.round(doc.classificationConfidence * 100)}% confident
                    </Badge>
                  )}
                  <ClassifyButton 
                    caseId={caseId}
                    documentId={doc.id}
                    onComplete={loadDocuments}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {doc.aiMetadata && (
                <div className="text-sm">
                  <p><strong>Date:</strong> {doc.aiMetadata.date || 'N/A'}</p>
                  <p><strong>Parties:</strong> {doc.aiMetadata.parties?.join(', ') || 'N/A'}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}