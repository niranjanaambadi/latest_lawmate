import { cn } from "@/lib/utils/cn"

interface CaseNumberProps {
  caseNumber: string
  className?: string
}

export function CaseNumber({ caseNumber, className }: CaseNumberProps) {
  return (
    <code
      className={cn(
        "font-mono text-xs bg-slate-100 px-2 py-1 rounded border border-slate-200 text-slate-900",
        className
      )}
    >
      {caseNumber}
    </code>
  )
}