// src/components/cases/CaseOverview.tsx
'use client'

import { Case, CaseStatus } from '@/types/case'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { 
  Calendar, 
  FileText, 
  User, 
  Scale, 
  MapPin, 
  Clock,
  ExternalLink,
  AlertCircle
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import Link from 'next/link'

interface CaseOverviewProps {
  caseData: Case
}

export function CaseOverview({ caseData }: CaseOverviewProps) {
  const formatDate = (date: string | Date | null | undefined) => {
    if (!date) return 'Not set'
    try {
      const dateObj = typeof date === 'string' ? parseISO(date) : date
      return format(dateObj, 'MMM dd, yyyy')
    } catch {
      return 'Invalid date'
    }
  }

  const getStatusColor = (status: CaseStatus) => {
    const colors = {
      FILED: 'bg-blue-100 text-blue-800',
      REGISTERED: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      DISPOSED: 'bg-gray-100 text-gray-800',
      TRANSFERRED: 'bg-purple-100 text-purple-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getPartyRoleLabel = (role: string) => {
    const labels = {
      PETITIONER: 'Petitioner',
      RESPONDENT: 'Respondent',
      APPELLANT: 'Appellant',
      DEFENDANT: 'Defendant'
    }
    return labels[role as keyof typeof labels] || role
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl">
                  {caseData.caseNumber || caseData.efilingNumber}
                </CardTitle>
                <Badge className={getStatusColor(caseData.status)}>
                  {caseData.status}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {caseData.caseType} • Year {caseData.caseYear}
              </p>
            </div>
            
            {caseData.khcSourceUrl && (
              <Button variant="outline" size="sm" asChild>
                <a 
                  href={caseData.khcSourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  View on Kerala HC
                  <ExternalLink className="ml-2 h-4 w-4" />
                </a>
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Parties Section */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Parties
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Petitioner
                </p>
                <p className="font-medium">{caseData.petitionerName}</p>
                <Badge variant="outline" className="mt-1">
                  {getPartyRoleLabel(caseData.partyRole)}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Respondent
                </p>
                <p className="font-medium">{caseData.respondentName}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Case Details */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Case Details
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <InfoItem 
                icon={Calendar}
                label="E-Filing Date"
                value={formatDate(caseData.efilingDate)}
              />
              <InfoItem 
                icon={FileText}
                label="E-Filing Number"
                value={caseData.efilingNumber}
              />
              <InfoItem 
                icon={Scale}
                label="Bench Type"
                value={caseData.benchType || 'Not assigned'}
              />
              <InfoItem 
                icon={User}
                label="Judge"
                value={caseData.judgeName || 'Not assigned'}
              />
              <InfoItem 
                icon={MapPin}
                label="Court Number"
                value={caseData.courtNumber || 'Not assigned'}
              />
              <InfoItem 
                icon={Clock}
                label="Next Hearing"
                value={formatDate(caseData.nextHearingDate)}
                highlight={!!caseData.nextHearingDate}
              />
            </div>
          </div>

          {caseData.efilingDetails && (
            <>
              <Separator />
              <div className="space-y-2">
                <h3 className="font-semibold">E-Filing Details</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {caseData.efilingDetails}
                </p>
              </div>
            </>
          )}

          {caseData.transferredReason && (
            <>
              <Separator />
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="h-4 w-4" />
                  <h3 className="font-semibold">Transfer Information</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  {caseData.transferredReason}
                </p>
                {caseData.transferredAt && (
                  <p className="text-xs text-muted-foreground">
                    Transferred on {formatDate(caseData.transferredAt)}
                  </p>
                )}
              </div>
            </>
          )}

          {/* Sync Status */}
          <Separator />
          <div className="flex items-center justify-between text-sm">
            <div className="text-muted-foreground">
              <span>Sync Status: </span>
              <Badge variant="outline" className="ml-2">
                {caseData.syncStatus}
              </Badge>
            </div>
            {caseData.lastSyncedAt && (
              <span className="text-muted-foreground">
                Last synced: {formatDate(caseData.lastSyncedAt)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/cases/${caseData.id}/documents`}>
                <FileText className="mr-2 h-4 w-4" />
                View Documents
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/cases/${caseData.id}/history`}>
                <Clock className="mr-2 h-4 w-4" />
                Case History
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/cases/${caseData.id}/ai-insights`}>
                <Scale className="mr-2 h-4 w-4" />
                AI Insights
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Created: {formatDate(caseData.createdAt)}</span>
            <span>Updated: {formatDate(caseData.updatedAt)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface InfoItemProps {
  icon: React.ElementType
  label: string
  value: string
  highlight?: boolean
}

function InfoItem({ icon: Icon, label, value, highlight }: InfoItemProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="h-4 w-4" />
        <span>{label}</span>
      </div>
      <p className={`font-medium ${highlight ? 'text-primary' : ''}`}>
        {value}
      </p>
    </div>
  )
}