// src/app/(dashboard)/documents/page.tsx
"use client"

import { useDocument, useDocumentUrl } from "@/lib/hooks/useDocuments"
import { useCase } from "@/lib/hooks/useCases"
import { AIChat } from "@/components/documents/AIChat"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
import { ArrowLeft, Download, Share2, Printer, Maximize2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils/cn"

export default function DocumentViewerPage({
  params,
}: {
  params: { id: string }
}) {
  const [showChat, setShowChat] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const { data: document, isLoading: docLoading } = useDocument(params.id)
  const { data: pdfUrl, isLoading: urlLoading } = useDocumentUrl(
    document?.s3Key // Changed from s3_key
  )
  const { data: caseData } = useCase(document?.caseId || "") // Changed from case_id

  if (docLoading || urlLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <LoadingSkeleton className="h-96 w-96" />
      </div>
    )
  }

  if (!document) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Document not found
          </h2>
          <p className="text-slate-600 mb-4">
            The document you're looking for doesn't exist.
          </p>
          <Link href="/documents">
            <Button>Back to Documents</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col bg-slate-100">
      {/* Header */}
      {!isFullscreen && (
        <div className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/cases/${document.caseId}`}> {/* Changed from case_id */}
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Case
                </Button>
              </Link>

              <div className="border-l border-slate-200 pl-4">
                <h1 className="font-bold text-slate-900 text-lg">
                  {document.title}
                </h1>
                {caseData && (
                  <p className="text-sm text-slate-600">
                    {caseData.caseNumber || caseData.efilingNumber} {/* Changed field names */}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChat(!showChat)}
              >
                {showChat ? "Hide" : "Show"} AI Chat
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (pdfUrl) {
                    window.open(pdfUrl, '_blank')
                  }
                }}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (pdfUrl) {
                    window.open(pdfUrl, '_blank')?.print()
                  }
                }}
              >
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>

              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  if (navigator.share && pdfUrl) {
                    navigator.share({
                      title: document.title,
                      url: pdfUrl
                    })
                  }
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* PDF Viewer */}
        <div
          className={cn(
            "transition-all duration-300",
            showChat ? "w-2/3" : "w-full"
          )}
        >
          {pdfUrl ? (
            <iframe
              src={`${pdfUrl}#toolbar=0&navpanes=0&scrollbar=1`}
              className="w-full h-full border-0"
              title={document.title}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-50">
              <div className="text-center">
                <p className="text-slate-600">Loading PDF...</p>
              </div>
            </div>
          )}
        </div>

        {/* AI Chat Sidebar */}
        {showChat && (
          <div className="w-1/3 border-l border-slate-200 bg-white flex flex-col">
            <AIChat documentId={params.id} />
          </div>
        )}
      </div>
    </div>
  )
}
