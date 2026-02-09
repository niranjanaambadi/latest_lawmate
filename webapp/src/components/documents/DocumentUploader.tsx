// src/components/documents/DocumentUploader.tsx
"use client"

import { useState } from "react"
import { useUploadDocument } from "@/lib/hooks/useDocuments"
import { DocumentCategory } from "@prisma/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Upload, FileText, X, AlertCircle } from "lucide-react"

interface DocumentUploaderProps {
  caseId: string
  open: boolean
  onClose: () => void
}

function validatePDF(file: File): { valid: boolean; error?: string } {
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Only PDF files are supported' }
  }
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 50MB' }
  }
  return { valid: true }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

export function DocumentUploader({ caseId, open, onClose }: DocumentUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [category, setCategory] = useState<DocumentCategory>(DocumentCategory.CASE_FILE)
  const [title, setTitle] = useState("")
  const [dragActive, setDragActive] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)

  const { mutate: uploadDocument, isPending } = useUploadDocument()

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleFileSelect = (file: File) => {
    const validation = validatePDF(file)
    if (!validation.valid) {
      setValidationError(validation.error!)
      return
    }

    setValidationError(null)
    setSelectedFile(file)
    if (!title) {
      setTitle(file.name.replace(".pdf", ""))
    }
  }

  const handleSubmit = () => {
    if (!selectedFile || !title) return

    uploadDocument(
      {
        caseId,
        category,
        title,
        file: selectedFile,
      },
      {
        onSuccess: () => {
          resetForm()
          onClose()
        },
      }
    )
  }

  const resetForm = () => {
    setSelectedFile(null)
    setTitle("")
    setCategory(DocumentCategory.CASE_FILE)
    setValidationError(null)
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          resetForm()
          onClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            Add a new document to this case. Only PDF files are supported.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Drop Zone */}
          {!selectedFile && (
            <div
              className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-300 hover:border-slate-400"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload className="mx-auto h-12 w-12 text-slate-400 mb-4" />
              <div className="text-sm text-slate-600 mb-2">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer font-medium text-indigo-600 hover:text-indigo-500"
                >
                  <span>Upload a file</span>
                  <input
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".pdf"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleFileSelect(e.target.files[0])
                      }
                    }}
                  />
                </label>
                <span className="pl-1">or drag and drop</span>
              </div>
              <p className="text-xs text-slate-500">PDF up to 50MB</p>
            </div>
          )}

          {/* Selected File */}
          {selectedFile && (
            <div className="rounded-lg border border-slate-200 p-4 bg-slate-50">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded bg-red-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-red-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-900 truncate">
                    {selectedFile.name}
                  </div>
                  <div className="text-sm text-slate-600">
                    {formatFileSize(selectedFile.size)}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedFile(null)}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Validation Error */}
          {validationError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-700">{validationError}</div>
            </div>
          )}

          {/* Form Fields */}
          {selectedFile && (
            <>
              <div className="space-y-2">
                <Label htmlFor="title">Document Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Main Petition"
                  disabled={isPending}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={category}
                  onValueChange={(value) => setCategory(value as DocumentCategory)}
                  disabled={isPending}
                >
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={DocumentCategory.CASE_FILE}>
                      Case File
                    </SelectItem>
                    <SelectItem value={DocumentCategory.ANNEXURE}>
                      Annexure
                    </SelectItem>
                    <SelectItem value={DocumentCategory.JUDGMENT}>
                      Judgment
                    </SelectItem>
                    <SelectItem value={DocumentCategory.ORDER}>
                      Order
                    </SelectItem>
                    <SelectItem value={DocumentCategory.MISC}>
                      Miscellaneous
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Upload Progress */}
          {isPending && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Uploading...</span>
                <span className="font-medium text-slate-900">Processing</span>
              </div>
              <Progress value={100} className="animate-pulse" />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              resetForm()
              onClose()
            }} 
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedFile || !title || isPending}
          >
            {isPending ? "Uploading..." : "Upload Document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}