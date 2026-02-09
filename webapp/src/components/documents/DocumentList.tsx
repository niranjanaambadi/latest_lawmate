// src/components/documents/DocumentList.tsx
"use client"

import { Document } from "@prisma/client"
import { FileText, Download, Eye, Lock, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns" // Keep this import
import { cn } from "@/lib/utils/cn"
import Link from "next/link"

interface DocumentListProps {
  documents: Document[]
  caseId?: string
  onDocumentClick?: (doc: Document) => void
}

export function DocumentList({ 
  documents, 
  caseId,
  onDocumentClick 
}: DocumentListProps) {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-semibold text-slate-900">
          No documents
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Upload a document to get started.
        </p>
      </div>
    )
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      CASE_FILE: "bg-blue-100 text-blue-800",
      ANNEXURE: "bg-green-100 text-green-800",
      JUDGMENT: "bg-purple-100 text-purple-800",
      ORDER: "bg-orange-100 text-orange-800",
      MISC: "bg-slate-100 text-slate-800"
    }
    return colors[category] || colors.MISC
  }

  const getUploadStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: any }> = {
      COMPLETED: { label: "Uploaded", variant: "default" },
      PENDING: { label: "Pending", variant: "secondary" },
      UPLOADING: { label: "Uploading...", variant: "secondary" },
      FAILED: { label: "Failed", variant: "destructive" }
    }
    const config = statusConfig[status] || statusConfig.PENDING
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatFileSize = (bytes: bigint) => {
    const kb = Number(bytes) / 1024
    const mb = kb / 1024
    return mb > 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`
  }

  return (
    <div className="space-y-4">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className={cn(
            "rounded-lg border border-slate-200 p-4 hover:shadow-md transition-all group",
            doc.isLocked && "bg-slate-50"
          )}
        >
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-lg bg-slate-100 flex items-center justify-center">
                {doc.isLocked ? (
                  <Lock className="h-6 w-6 text-slate-400" />
                ) : (
                  <FileText className="h-6 w-6 text-slate-600" />
                )}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-900 truncate">
                    {doc.title}
                  </h3>
                  
                  {doc.description && (
                    <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                      {doc.description}
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                    <span>{formatFileSize(doc.fileSize)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDistanceToNow(new Date(doc.uploadedAt || doc.createdAt), {
                        addSuffix: true
                      })}
                    </span>
                    {doc.classificationConfidence && (
                      <>
                        <span>•</span>
                        <span>
                          {Math.round(doc.classificationConfidence * 100)}% confident
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="flex flex-col items-end gap-2">
                  <Badge className={getCategoryColor(doc.category)}>
                    {doc.category.replace('_', ' ')}
                  </Badge>
                  {getUploadStatusBadge(doc.uploadStatus)}
                  {doc.ocrStatus === 'COMPLETED' && (
                    <Badge variant="outline" className="text-xs">
                      OCR Ready
                    </Badge>
                  )}
                </div>
              </div>

              {/* AI Metadata */}
              {doc.aiMetadata && typeof doc.aiMetadata === 'object' && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-xs font-semibold text-blue-900 mb-2">
                    AI Classification
                  </p>
                  <div className="space-y-1 text-xs text-blue-800">
                    {(doc.aiMetadata as any).date && (
                      <p>
                        <span className="font-medium">Date:</span>{' '}
                        {(doc.aiMetadata as any).date}
                      </p>
                    )}
                    {(doc.aiMetadata as any).parties && 
                     Array.isArray((doc.aiMetadata as any).parties) && (
                      <p>
                        <span className="font-medium">Parties:</span>{' '}
                        {(doc.aiMetadata as any).parties.join(', ')}
                      </p>
                    )}
                    {(doc.aiMetadata as any).keyPoints && 
                     Array.isArray((doc.aiMetadata as any).keyPoints) && 
                     (doc.aiMetadata as any).keyPoints.length > 0 && (
                      <div>
                        <span className="font-medium">Key Points:</span>
                        <ul className="list-disc list-inside mt-1 ml-2">
                          {(doc.aiMetadata as any).keyPoints.slice(0, 3).map(
                            (point: string, i: number) => (
                              <li key={i}>{point}</li>
                            )
                          )}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Lock Info */}
              {doc.isLocked && doc.lockReason && (
                <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-start gap-2">
                    <Lock className="h-4 w-4 text-amber-600 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-amber-900">
                        Document Locked
                      </p>
                      <p className="text-xs text-amber-800 mt-1">
                        {doc.lockReason}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 mt-4">
                {doc.uploadStatus === 'COMPLETED' && !doc.isLocked && (
                  <>
                    <Link href={`/documents/${doc.id}`}>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </Link>

                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        window.open(`/api/documents/${doc.id}/download`, '_blank')
                      }}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>

                    {onDocumentClick && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onDocumentClick(doc)}
                      >
                        More Actions
                      </Button>
                    )}
                  </>
                )}

                {doc.uploadStatus === 'FAILED' && (
                  <div className="text-sm text-red-600">
                    Upload failed: {doc.uploadError}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// Optional: Simplified card view
export function DocumentGrid({ 
  documents, 
  caseId 
}: { 
  documents: Document[]
  caseId?: string 
}) {
  if (!documents || documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-2 text-sm font-semibold text-slate-900">
          No documents
        </h3>
      </div>
    )
  }

  const formatFileSize = (bytes: bigint) => {
    const kb = Number(bytes) / 1024
    const mb = kb / 1024
    return mb > 1 ? `${mb.toFixed(2)} MB` : `${kb.toFixed(2)} KB`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {documents.map((doc) => (
        <Link
          key={doc.id}
          href={`/documents/${doc.id}`}
          className="block group"
        >
          <div className={cn(
            "border rounded-lg p-4 hover:shadow-lg transition-all",
            doc.isLocked && "bg-slate-50"
          )}>
            <div className="flex items-start justify-between mb-3">
              <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
                {doc.isLocked ? (
                  <Lock className="h-5 w-5 text-slate-400" />
                ) : (
                  <FileText className="h-5 w-5 text-slate-600" />
                )}
              </div>
              <Badge variant="secondary" className="text-xs">
                {doc.category.replace('_', ' ')}
              </Badge>
            </div>

            <h3 className="font-medium text-slate-900 truncate mb-1">
              {doc.title}
            </h3>
            
            <p className="text-xs text-slate-500">
              {formatDistanceToNow(new Date(doc.uploadedAt || doc.createdAt), {
                addSuffix: true
              })}
            </p>

            {doc.classificationConfidence && (
              <div className="mt-2">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span>AI Confidence</span>
                  <span>{Math.round(doc.classificationConfidence * 100)}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full"
                    style={{ width: `${doc.classificationConfidence * 100}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}

// REMOVED: The custom formatDistanceToNow function at the bottom
// We're using the one from date-fns instead