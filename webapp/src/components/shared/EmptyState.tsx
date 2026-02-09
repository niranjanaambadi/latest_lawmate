import { FileQuestion } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface EmptyStateProps {
  title?: string
  message?: string
  icon?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function EmptyState({
  title = "No data found",
  message = "There's nothing to display here yet.",
  icon,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center",
        className
      )}
    >
      <div className="rounded-full bg-slate-100 p-4 mb-4">
        {icon || <FileQuestion className="h-8 w-8 text-slate-400" />}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 max-w-sm mb-6">{message}</p>
      {action}
    </div>
  )
}