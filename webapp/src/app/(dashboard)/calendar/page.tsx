// src/app/(dashboard)/calendar/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format, parseISO } from 'date-fns'
import { Case } from '@/types/case'
import { Clock, MapPin, User, Calendar as CalendarIcon } from 'lucide-react'

export default function CalendarPage() {
  const [hearings, setHearings] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHearings()
  }, [])

  const fetchHearings = async () => {
    try {
      const response = await fetch('/api/cases?status=PENDING')
      const data = await response.json()
      setHearings(data.cases || [])
    } catch (error) {
      console.error('Failed to fetch hearings:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupHearingsByDate = () => {
    const grouped: Record<string, Case[]> = {}
    
    hearings
      .filter(h => h.nextHearingDate) // Filter out nulls first
      .forEach(hearing => {
        if (!hearing.nextHearingDate) return // Extra safety check
        
        const dateStr = hearing.nextHearingDate instanceof Date
          ? format(hearing.nextHearingDate, 'yyyy-MM-dd')
          : format(parseISO(hearing.nextHearingDate), 'yyyy-MM-dd') // No 'as string' needed after null check
        
        if (!grouped[dateStr]) {
          grouped[dateStr] = []
        }
        grouped[dateStr].push(hearing)
      })
    
    return Object.entries(grouped).sort((a, b) => a[0].localeCompare(b[0]))
  }

  const groupedHearings = groupHearingsByDate()

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-8 w-8" />
          Hearing Calendar
        </h1>
        <p className="text-muted-foreground">
          View and manage your upcoming court hearings
        </p>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading hearings...
          </CardContent>
        </Card>
      ) : groupedHearings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No upcoming hearings scheduled
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {groupedHearings.map(([dateStr, cases]) => (
            <Card key={dateStr}>
              <CardHeader>
                <CardTitle>{format(parseISO(dateStr), 'EEEE, MMMM d, yyyy')}</CardTitle>
                <CardDescription>
                  {cases.length} hearing{cases.length > 1 ? 's' : ''} scheduled
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {cases.map((hearing) => (
                  <HearingCard key={hearing.id} hearing={hearing} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

function HearingCard({ hearing }: { hearing: Case }) {
  const formatHearingDate = (date: Date | string | null) => {
    if (!date) return null
    return date instanceof Date ? date : parseISO(date)
  }

  const hearingDate = formatHearingDate(hearing.nextHearingDate)

  return (
    <div className="border rounded-lg p-4 space-y-3 hover:bg-accent transition-colors">
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h3 className="font-semibold">{hearing.caseNumber || hearing.efilingNumber}</h3>
          <p className="text-sm text-muted-foreground">
            {hearing.caseType}
          </p>
        </div>
        <Badge variant={hearing.status === 'PENDING' ? 'default' : 'secondary'}>
          {hearing.status}
        </Badge>
      </div>

      <div className="space-y-2 text-sm">
        {hearingDate && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Time:</span>
            <span className="text-muted-foreground">
              {format(hearingDate, 'h:mm a')}
            </span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Petitioner:</span>
          <span className="text-muted-foreground truncate">{hearing.petitionerName}</span>
        </div>

        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Respondent:</span>
          <span className="text-muted-foreground truncate">{hearing.respondentName}</span>
        </div>

        {hearing.judgeName && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Judge:</span>
            <span className="text-muted-foreground">{hearing.judgeName}</span>
          </div>
        )}

        {hearing.courtNumber && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Court:</span>
            <span className="text-muted-foreground">{hearing.courtNumber}</span>
          </div>
        )}

        {hearing.benchType && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">Bench:</span>
            <span className="text-muted-foreground">{hearing.benchType}</span>
          </div>
        )}
      </div>
    </div>
  )
}
