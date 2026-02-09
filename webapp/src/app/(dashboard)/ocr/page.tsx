// src/app/(dashboard)/ocr/page.tsx
"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, FileText, CheckCircle2, XCircle } from "lucide-react"

interface OCRResult {
  success: boolean
  text?: string
  error?: string
  confidence?: number
}

export default function OCRPage() {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<OCRResult | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!file) {
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/ocr/process', {
        method: 'POST',
        body: formData,
        // No authorization header needed - middleware handles it
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'OCR processing failed')
      }

      setResult({
        success: true,
        text: data.text,
        confidence: data.confidence
      })
    } catch (error) {
      console.error('OCR error:', error)
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      })
    } finally {
      setLoading(false)
    }
  }

  if (!session) {
    return (
      <div className="container mx-auto py-8">
        <Alert>
          <AlertDescription>Please sign in to use OCR features.</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">OCR Document Processing</h1>
        <p className="text-muted-foreground mt-2">
          Extract text from scanned documents and images
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
            <CardDescription>
              Select a PDF or image file to extract text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="file">Document File</Label>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  disabled={loading}
                />
                {file && (
                  <p className="text-sm text-muted-foreground">
                    Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                disabled={!file || loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Process Document
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card>
          <CardHeader>
            <CardTitle>Extraction Result</CardTitle>
            <CardDescription>
              {result ? 'Text extracted from document' : 'Upload a document to see results'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {result && (
              <div className="space-y-4">
                {result.success ? (
                  <>
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">Success</span>
                    </div>
                    
                    {result.confidence && (
                      <div className="text-sm text-muted-foreground">
                        Confidence: {(result.confidence * 100).toFixed(1)}%
                      </div>
                    )}

                    <div className="mt-4">
                      <Label>Extracted Text</Label>
                      <div className="mt-2 p-4 bg-slate-50 rounded-lg border max-h-96 overflow-y-auto">
                        <pre className="text-sm whitespace-pre-wrap font-mono">
                          {result.text}
                        </pre>
                      </div>
                    </div>

                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => {
                        if (result.text) {
                          navigator.clipboard.writeText(result.text)
                        }
                      }}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Copy Text
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-5 w-5" />
                      <span className="font-medium">Error</span>
                    </div>
                    <Alert variant="destructive">
                      <AlertDescription>{result.error}</AlertDescription>
                    </Alert>
                  </div>
                )}
              </div>
            )}

            {!result && (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No results yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}