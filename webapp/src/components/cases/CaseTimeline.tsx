"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EmptyState } from "@/components/shared/EmptyState"
import { formatDate } from "@/lib/utils/date"
import { Calendar, FileText, Gavel, Bell, Clock } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface CaseTimelineProps {
  caseId: string
}

// Mock data - will be replaced with real API
const mockEvents = [
  {
    id: "1",
    type: "hearing",
    date: "2026-01-15T10:30:00Z",
    title: "Case Hearing",
    description: "Notice issued to respondents. Counter-affidavit to be filed within 4 weeks.",
    judge: "Justice A.K. Jayasankaran Nambiar",
  },
  {
    id: "2",
    type: "order",
    date: "2026-01-10T14:00:00Z",
    title: "Interim Order Passed",
    description: "Court granted stay on the impugned order until next hearing.",
    judge: "Justice A.K. Jayasankaran Nambiar",
  },
  {
    id: "3",
    type: "filing",
    date: "2026-01-05T09:00:00Z",
    title: "Case Filed",
    description: "Writ petition filed and admitted for hearing.",
  },
]

export function CaseTimeline({ caseId }: CaseTimelineProps) {
  if (mockEvents.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <EmptyState
            icon={<Clock className="h-8 w-8 text-slate-400" />}
            title="No timeline events"
            message="Case events and history will appear here."
          />
        </CardContent>
      </Card>
    )
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case "hearing":
        return Calendar
      case "order":
        return Gavel
      case "filing":
        return FileText
      case "notice":
        return Bell
      default:
        return Clock
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "hearing":
        return "bg-blue-100 text-blue-700 border-blue-200"
      case "order":
        return "bg-purple-100 text-purple-700 border-purple-200"
      case "filing":
        return "bg-green-100 text-green-700 border-green-200"
      case "notice":
        return "bg-amber-100 text-amber-700 border-amber-200"
      default:
        return "bg-slate-100 text-slate-700 border-slate-200"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Case Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {mockEvents.map((event, index) => {
            const Icon = getEventIcon(event.type)
            const colorClass = getEventColor(event.type)

            return (
              <div key={event.id} className="flex gap-4">
                {/* Timeline Line */}
                <div className="flex flex-col items-center">
                  <div className={cn("rounded-full p-2 border-2", colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  {index < mockEvents.length - 1 && (
                    <div className="w-px h-full bg-slate-200 my-2" />
                  )}
                </div>

                {/* Event Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h4 className="font-bold text-slate-900">{event.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      {event.type}
                    </Badge>
                  </div>

                  <p className="text-sm text-slate-600 mb-2">
                    {event.description}
                  </p>

                  {event.judge && (
                    <p className="text-xs text-slate-600 mb-2">
                      <span className="font-medium">Judge:</span> {event.judge}
                    </p>
                  )}

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>{formatDate(event.date, "PPP 'at' p")}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}