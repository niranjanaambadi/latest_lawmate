'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  CaseWithCounts, 
  Document, 
  CaseHistory, 
  transformCase, 
  transformDocument, 
  transformCaseHistory 
} from '@/types/case'
import { Loader2, FileText, Calendar, AlertCircle, Scale, Brain, History } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'

export default function CaseDetailPage() {
  const params = useParams()
  const caseId = params.id as string
  
  const [caseData, setCaseData] = useState<CaseWithCounts | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadCaseDetails()
  }, [caseId])

  const loadCaseDetails = async () => {
    try {
      const response = await fetch(`/api/cases/${caseId}`)
      const data = await response.json()
      if (data.case) {
        // Use your transform helper to fix Dates and snake_case mapping
        setCaseData(transformCase(data.case) as CaseWithCounts)
      }
    } catch (error) {
      console.error('Failed to load case:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!caseData) {
    return (
      <div className="container mx-auto py-8">
        <Card className="border-destructive/50">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <h2 className="text-xl font-semibold mb-2">Case Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The case you're looking for doesn't exist or you don't have access to it.
            </p>
            <Link href="/cases">
              <Button>Back to Cases</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {caseData.caseNumber || caseData.efilingNumber}
            </h1>
            <Badge variant={caseData.status === 'PENDING' ? 'default' : 'secondary'}>
              {caseData.status}
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">
            {caseData.caseType} • {caseData.caseYear}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href={`/cases/${caseId}/ai-insights`}>
            <Button variant="outline" className="border-indigo-200 hover:bg-indigo-50">
              <Brain className="mr-2 h-4 w-4 text-indigo-600" />
              AI Insights
            </Button>
          </Link>
          <Button>Edit Case</Button>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          icon={<FileText className="text-blue-600" />} 
          label="Documents" 
          value={caseData._count?.documents || 0} 
        />
        <StatCard 
          icon={<Calendar className="text-emerald-600" />} 
          label="Next Hearing" 
          value={caseData.nextHearingDate ? format(caseData.nextHearingDate, 'MMM d, yyyy') : 'Not scheduled'} 
        />
        <StatCard 
          icon={<Scale className="text-amber-600" />} 
          label="Court / Bench" 
          value={caseData.courtNumber || caseData.benchType || 'Unassigned'} 
        />
        <StatCard 
          icon={<History className="text-purple-600" />} 
          label="Last Synced" 
          value={caseData.lastSyncedAt ? format(caseData.lastSyncedAt, 'MMM d, HH:mm') : 'Never'} 
        />
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="ai-analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="overview">
            <CaseOverview caseData={caseData} />
          </TabsContent>

          <TabsContent value="documents">
            <DocumentsList caseId={caseId} />
          </TabsContent>

          <TabsContent value="history">
            <CaseHistoryList caseId={caseId} />
          </TabsContent>

          <TabsContent value="ai-analysis">
            <AIAnalysisSection caseId={caseId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

/** * Sub-Components
 */

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number }) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-muted rounded-lg">{icon}</div>
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function CaseOverview({ caseData }: { caseData: CaseWithCounts }) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-lg">Filing Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Case Number" value={caseData.caseNumber} />
          <DetailRow label="E-Filing Number" value={caseData.efilingNumber} />
          <DetailRow label="Filing Date" value={format(caseData.efilingDate, 'MMMM d, yyyy')} />
          <DetailRow label="Case Type" value={caseData.caseType} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-lg">Parties & Bench</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <DetailRow label="Petitioner" value={caseData.petitionerName} />
          <DetailRow label="Respondent" value={caseData.respondentName} />
          <DetailRow label="Party Role" value={caseData.partyRole} className="capitalize" />
          <DetailRow label="Judge" value={caseData.judgeName} />
        </CardContent>
      </Card>

      {caseData.efilingDetails && (
        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-lg">E-Filing Details</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap text-slate-700">
              {caseData.efilingDetails}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function DetailRow({ label, value, className = "" }: { label: string, value: string | null, className?: string }) {
  return (
    <div className="flex justify-between border-b border-muted pb-2 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${className}`}>{value || '—'}</span>
    </div>
  )
}

function DocumentsList({ caseId }: { caseId: string }) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/cases/${caseId}/documents`)
        const data = await res.json()
        setDocuments(data.documents?.map(transformDocument) || [])
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [caseId])

  if (loading) return <Loader2 className="h-6 w-6 animate-spin mx-auto mt-12" />
  
  return (
    <div className="grid gap-3">
      {documents.length === 0 ? (
        <p className="text-center py-12 text-muted-foreground">No documents found.</p>
      ) : (
        documents.map(doc => (
          <Card key={doc.id} className="hover:bg-slate-50 transition-colors">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-slate-400" />
                <div>
                  <p className="font-medium text-sm">{doc.title}</p>
                  <p className="text-xs text-muted-foreground uppercase">{doc.category}</p>
                </div>
              </div>
              <Badge variant="outline">{doc.uploadStatus}</Badge>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

function CaseHistoryList({ caseId }: { caseId: string }) {
  const [history, setHistory] = useState<CaseHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/cases/${caseId}/history`)
        const data = await res.json()
        setHistory(data.history?.map(transformCaseHistory) || [])
      } catch (e) { console.error(e) } finally { setLoading(false) }
    }
    load()
  }, [caseId])

  if (loading) return <Loader2 className="h-6 w-6 animate-spin mx-auto mt-12" />

  return (
    <div className="relative border-l-2 border-muted ml-3 space-y-6 pb-4">
      {history.map(event => (
        <div key={event.id} className="relative pl-6">
          <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-background" />
          <div className="flex flex-col">
            <span className="text-xs font-bold text-primary uppercase">
              {format(event.eventDate, 'MMM d, yyyy')}
            </span>
            <span className="font-semibold">{event.eventType}</span>
            <p className="text-sm text-slate-600 mt-1 italic">"{event.businessRecorded}"</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function AIAnalysisSection({ caseId }: { caseId: string }) {
  return (
    <Card className="bg-indigo-50/50 border-indigo-100">
      <CardContent className="py-12 text-center">
        <Brain className="h-12 w-12 mx-auto mb-4 text-indigo-600" />
        <h3 className="text-lg font-bold">Deep AI Analysis</h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          Generate a comprehensive legal brief, extract key precedents, and analyze case risks.
        </p>
        <Link href={`/cases/${caseId}/ai-insights`}>
          <Button className="bg-indigo-600 hover:bg-indigo-700">
            Open AI Dashboard
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}