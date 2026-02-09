import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { FileText, Upload, CheckCircle2, AlertCircle } from "lucide-react"
import { formatRelativeDate } from "@/lib/utils/date"
import { cn } from "@/lib/utils/cn"

interface Activity {
  id: string
  type: "case_synced" | "document_uploaded" | "analysis_completed" | "deadline_approaching"
  title: string
  description: string
  timestamp: string
  metadata?: Record<string, any>
}

// Mock data - will be replaced with real API
const mockActivities: Activity[] = [
  {
    id: "1",
    type: "case_synced",
    title: "New case synced",
    description: "WP(C) 123/2026 has been added to your dashboard",
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2",
    type: "document_uploaded",
    title: "Document uploaded",
    description: "Main petition uploaded for WP(C) 123/2026",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "3",
    type: "analysis_completed",
    title: "AI analysis completed",
    description: "Case WP(C) 123/2026 has been analyzed",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
]

export function ActivityFeed() {
  const getActivityIcon = (type: Activity["type"]) => {
    const iconMap = {
      case_synced: CheckCircle2,
      document_uploaded: Upload,
      analysis_completed: FileText,
      deadline_approaching: AlertCircle,
    }
    return iconMap[type]
  }

  const getActivityColor = (type: Activity["type"]) => {
    const colorMap = {
      case_synced: "bg-emerald-100 text-emerald-700",
      document_uploaded: "bg-indigo-100 text-indigo-700",
      analysis_completed: "bg-blue-100 text-blue-700",
      deadline_approaching: "bg-amber-100 text-amber-700",
    }
    return colorMap[type]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {mockActivities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type)
              const colorClass = getActivityColor(activity.type)

              return (
                <div key={activity.id} className="flex gap-4">
                  {/* Timeline */}
                  <div className="flex flex-col items-center">
                    <div className={cn("rounded-full p-2", colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {index < mockActivities.length - 1 && (
                      <div className="w-px h-full bg-slate-200 my-2" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 pb-4">
                    <h4 className="font-bold text-slate-900 text-sm mb-1">
                      {activity.title}
                    </h4>
                    <p className="text-sm text-slate-600 mb-2">
                      {activity.description}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatRelativeDate(activity.timestamp)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}