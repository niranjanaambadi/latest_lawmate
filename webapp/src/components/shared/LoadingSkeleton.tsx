import { cn } from "@/lib/utils/cn"

interface LoadingSkeletonProps {
  className?: string
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-slate-200",
        className
      )}
    />
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <LoadingSkeleton className="h-12 w-1/4" />
          <LoadingSkeleton className="h-12 w-1/3" />
          <LoadingSkeleton className="h-12 w-1/6" />
          <LoadingSkeleton className="h-12 w-1/6" />
        </div>
      ))}
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
      <LoadingSkeleton className="h-6 w-1/3" />
      <LoadingSkeleton className="h-20 w-full" />
      <LoadingSkeleton className="h-4 w-2/3" />
    </div>
  )
}
