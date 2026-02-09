// src/components/cases/CaseCard.tsx
import { Case } from '@/types/case'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Calendar, FileText, User, Clock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO, differenceInDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface CaseCardProps {
  case: Case
  onClick?: () => void
}

export function CaseCard({ case: caseData, onClick }: CaseCardProps) {
  const nextHearingDate = caseData.nextHearingDate
    ? caseData.nextHearingDate instanceof Date
      ? caseData.nextHearingDate
      : parseISO(caseData.nextHearingDate as string)
    : null

  const daysUntilHearing = nextHearingDate
    ? differenceInDays(nextHearingDate, new Date())
    : null

  const isUrgent = daysUntilHearing !== null && daysUntilHearing <= 7 && daysUntilHearing >= 0

  return (
    <Link href={`/cases/${caseData.id}`}>
      <Card 
        className={cn(
          "hover:shadow-lg transition-shadow cursor-pointer",
          isUrgent && "border-orange-500 border-2"
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">
                  {caseData.caseNumber || caseData.efilingNumber}
                </h3>
                {isUrgent && (
                  <AlertCircle className="h-4 w-4 text-orange-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {caseData.caseType} • {caseData.caseYear}
              </p>
            </div>
            <Badge 
              variant={getStatusVariant(caseData.status)}
            >
              {caseData.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Parties */}
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Petitioner
                </p>
                <p className="text-sm truncate">
                  {caseData.petitionerName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <User className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">
                  Respondent
                </p>
                <p className="text-sm truncate">
                  {caseData.respondentName}
                </p>
              </div>
            </div>
          </div>

          {/* Next Hearing */}
          {nextHearingDate && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">
                  Next Hearing
                </p>
                <p className={cn(
                  "text-sm font-medium",
                  isUrgent && "text-orange-600"
                )}>
                  {format(nextHearingDate, 'MMM dd, yyyy')}
                  {daysUntilHearing !== null && daysUntilHearing >= 0 && (
                    <span className="text-xs ml-1">
                      ({daysUntilHearing === 0 ? 'Today' : `${daysUntilHearing} days`})
                    </span>
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Court Details */}
          {(caseData.courtNumber || caseData.judgeName) && (
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3 mt-0.5" />
              <div>
                {caseData.courtNumber && (
                  <p>Court: {caseData.courtNumber}</p>
                )}
                {caseData.judgeName && (
                  <p>Judge: {caseData.judgeName}</p>
                )}
              </div>
            </div>
          )}

          {/* Document Count */}
          {caseData._count?.documents !== undefined && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                {caseData._count.documents} document{caseData._count.documents !== 1 ? 's' : ''}
              </p>
            </div>
          )}

          {/* AI Analysis Indicator */}
          {caseData.aiAnalysis && (
            <div className="pt-2 border-t">
              <Badge variant="secondary" className="text-xs">
                AI Analysis Available
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}

function getStatusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status.toUpperCase()) {
    case 'FILED':
      return 'secondary'
    case 'REGISTERED':
      return 'default'
    case 'PENDING':
      return 'outline'
    case 'DISPOSED':
      return 'secondary'
    case 'TRANSFERRED':
      return 'destructive'
    default:
      return 'outline'
  }
}