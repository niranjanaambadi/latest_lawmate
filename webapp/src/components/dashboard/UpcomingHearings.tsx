// src/components/dashboard/UpcomingHearings.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, AlertTriangle, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Case } from "@/types/case"
import { format, differenceInDays, parseISO } from "date-fns"

export function UpcomingHearings() {
  const [hearings, setHearings] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUpcomingHearings()
  }, [])

  const fetchUpcomingHearings = async () => {
    try {
      const response = await fetch('/api/cases?status=PENDING&sort=nextHearingDate&order=asc&limit=5')
      const data = await response.json()
      
      // Filter cases with upcoming hearings
      const casesWithHearings = (data.cases || []).filter((c: Case) => c.nextHearingDate)
      setHearings(casesWithHearings)
    } catch (error) {
      console.error('Failed to fetch upcoming hearings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getDaysUntil = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return differenceInDays(date, new Date())
  }

  const formatHearingDate = (dateString: string | Date) => {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return format(date, 'MMM d, yyyy')
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Hearings</CardTitle>
          <CardDescription>Loading hearings...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (hearings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Hearings</CardTitle>
          <CardDescription>No upcoming hearings scheduled</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground">
              You have no hearings scheduled at the moment.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Upcoming Hearings</CardTitle>
          <CardDescription>Your next {hearings.length} scheduled hearings</CardDescription>
        </div>
        <Link href="/calendar">
          <Button variant="outline" size="sm">
            View Calendar
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {hearings.map((hearing) => {
            const daysUntil = getDaysUntil(hearing.nextHearingDate!)
            const isUrgent = daysUntil <= 2

            return (
              <Link 
                key={hearing.id} 
                href={`/cases/${hearing.id}`}
                className="block"
              >
                <div className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-accent transition-colors">
                  <div className={`mt-1 ${isUrgent ? 'text-red-500' : 'text-blue-500'}`}>
                    <Calendar className="h-5 w-5" />
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="font-medium leading-none">
                          {hearing.caseNumber || hearing.efilingNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {hearing.caseType}
                        </p>
                      </div>
                      
                      {isUrgent && (
                        <Badge variant="destructive" className="ml-2">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Urgent
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{formatHearingDate(hearing.nextHearingDate!)}</span>
                      </div>
                      
                      <Badge variant="secondary" className="text-xs">
                        {daysUntil === 0 
                          ? 'Today' 
                          : daysUntil === 1 
                          ? 'Tomorrow' 
                          : `In ${daysUntil} days`}
                      </Badge>
                    </div>

                    {hearing.courtNumber && (
                      <p className="text-sm text-muted-foreground">
                        Court: {hearing.courtNumber}
                      </p>
                    )}

                    {hearing.judgeName && (
                      <p className="text-sm text-muted-foreground">
                        Judge: {hearing.judgeName}
                      </p>
                    )}
                  </div>

                  <ChevronRight className="h-5 w-5 text-muted-foreground mt-2" />
                </div>
              </Link>
            )
          })}
        </div>

        {hearings.length >= 5 && (
          <div className="mt-4 text-center">
            <Link href="/calendar">
              <Button variant="link" size="sm">
                View all hearings
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}