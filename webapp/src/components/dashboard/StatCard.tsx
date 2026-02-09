import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface StatCardProps {
  title: string
  value: number | string
  change?: number
  icon: LucideIcon
  trend?: "up" | "down" | "neutral"
  description?: string
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  trend = "neutral",
  description,
}: StatCardProps) {
  const trendColors = {
    up: "text-emerald-700",
    down: "text-red-700",
    neutral: "text-slate-600",
  }

  const trendSymbols = {
    up: "↑",
    down: "↓",
    neutral: "→",
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">
          {title}
        </CardTitle>
        <div className="rounded-lg bg-indigo-50 p-2">
          <Icon className="h-4 w-4 text-indigo-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight text-slate-900">
          {value}
        </div>
        {change !== undefined && (
          <p className={cn("text-xs mt-2 flex items-center gap-1", trendColors[trend])}>
            <span>{trendSymbols[trend]}</span>
            <span>{Math.abs(change)}%</span>
            <span className="text-slate-600">from last month</span>
          </p>
        )}
        {description && (
          <p className="text-xs text-slate-600 mt-2">{description}</p>
        )}
      </CardContent>
    </Card>
  )
}