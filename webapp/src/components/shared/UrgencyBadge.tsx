import { Badge } from "@/components/ui/badge"
import type { UrgencyLevel } from "@/types/analysis"
import { AlertCircle, AlertTriangle, Info } from "lucide-react"

interface UrgencyBadgeProps {
  level: UrgencyLevel
  showIcon?: boolean
}

export function UrgencyBadge({ level, showIcon = true }: UrgencyBadgeProps) {
  const config: Record<UrgencyLevel, {
    variant: "default" | "success" | "warning" | "destructive"
    icon: typeof Info
    label: string
  }> = {
    LOW: {
      variant: "success",
      icon: Info,
      label: "Low Priority",
    },
    MEDIUM: {
      variant: "default",
      icon: Info,
      label: "Medium Priority",
    },
    HIGH: {
      variant: "warning",
      icon: AlertTriangle,
      label: "High Priority",
    },
    CRITICAL: {
      variant: "destructive",
      icon: AlertCircle,
      label: "Critical",
    },
  }

  const { variant, icon: Icon, label } = config[level]

  return (
    <Badge variant={variant} className="font-medium">
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  )
}