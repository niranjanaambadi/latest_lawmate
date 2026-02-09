// src/components/cases/CaseDocuments.tsx
"use client"

import { useState } from "react"
import { useDocuments } from "@/lib/hooks/useDocuments"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DocumentUploader } from "@/components/documents/DocumentUploader"
import { DocumentList } from "@/components/documents/DocumentList"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
import { Upload, FileText } from "lucide-react"

interface CaseDocumentsProps {
  caseId: string
}

export function CaseDocuments({ caseId }: CaseDocumentsProps) {
  const [showUploader, setShowUploader] = useState(false)
  const { data: documents, isLoading } = useDocuments(caseId)

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <LoadingSkeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    )
  }

  if (!documents || documents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={<FileText className="h-8 w-8 text-slate-400" />}
            title="No documents yet"
            message="Upload documents related to this case to get started."
            action={
              <Button onClick={() => setShowUploader(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            }
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Case Documents</CardTitle>
          <Button onClick={() => setShowUploader(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </CardHeader>
        <CardContent>
          <DocumentList documents={documents as any} caseId={caseId} />
        </CardContent>
      </Card>

      <DocumentUploader
        caseId={caseId}
        open={showUploader}
        onClose={() => setShowUploader(false)}
      />
    </div>
  )
}