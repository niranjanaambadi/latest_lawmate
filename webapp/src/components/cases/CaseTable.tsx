// src/components/cases/CaseTable.tsx
'use client'

import { Case, CaseStatus } from '@/types/case'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { format, parseISO } from 'date-fns'
import { Eye, FileText, Calendar, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface CaseTableProps {
  cases: Case[]
  loading?: boolean
}

export function CaseTable({ cases, loading }: CaseTableProps) {
  if (loading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Case Number</TableHead>
              <TableHead>Case Type</TableHead>
              <TableHead>Parties</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next Hearing</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <div className="h-4 w-32 bg-slate-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-48 bg-slate-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-6 w-20 bg-slate-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
                </TableCell>
                <TableCell>
                  <div className="h-8 w-8 bg-slate-200 rounded animate-pulse ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (cases.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-12 text-center">
        <FileText className="mx-auto h-12 w-12 text-slate-400" />
        <h3 className="mt-4 text-lg font-semibold">No cases found</h3>
        <p className="mt-2 text-sm text-slate-500">
          Get started by creating a new case or adjust your filters.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Case Number</TableHead>
            <TableHead>Case Type</TableHead>
            <TableHead>Parties</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Next Hearing</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {cases.map((caseItem) => (
            <TableRow key={caseItem.id} className="hover:bg-slate-50">
              <TableCell className="font-medium">
                <Link
                  href={`/cases/${caseItem.id}`}
                  className="hover:underline"
                >
                  {caseItem.caseNumber || caseItem.efilingNumber}
                </Link>
                <div className="text-xs text-slate-500 mt-1">
                  {caseItem.caseType}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  {formatCaseType(caseItem.caseType)}
                </div>
                <div className="text-xs text-slate-500">
                  Year: {caseItem.caseYear}
                </div>
              </TableCell>
              <TableCell>
                <div className="max-w-xs">
                  <div className="text-sm font-medium truncate">
                    {caseItem.petitionerName}
                  </div>
                  <div className="text-xs text-slate-500 truncate">
                    vs {caseItem.respondentName}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={caseItem.status} />
              </TableCell>
              <TableCell>
                {caseItem.nextHearingDate ? (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <div>
                      <div className="text-sm">
                        {format(
                          caseItem.nextHearingDate instanceof Date
                            ? caseItem.nextHearingDate
                            : parseISO(caseItem.nextHearingDate as string),
                          'MMM d, yyyy'
                        )}
                      </div>
                      {caseItem.courtNumber && (
                        <div className="text-xs text-slate-500">
                          Court {caseItem.courtNumber}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400">Not scheduled</span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/cases/${caseItem.id}`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                  </Link>
                  <CaseActions caseItem={caseItem} />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function StatusBadge({ status }: { status: CaseStatus }) {
  const variants: Record<CaseStatus, {
    variant: 'default' | 'secondary' | 'destructive' | 'outline'
    label: string
  }> = {
    FILED: { variant: 'outline', label: 'Filed' },
    REGISTERED: { variant: 'secondary', label: 'Registered' },
    PENDING: { variant: 'default', label: 'Pending' },
    DISPOSED: { variant: 'secondary', label: 'Disposed' },
    TRANSFERRED: { variant: 'outline', label: 'Transferred' },
  }

  const config = variants[status] || { variant: 'outline', label: status }

  return <Badge variant={config.variant}>{config.label}</Badge>
}

function CaseActions({ caseItem }: { caseItem: Case }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/cases/${caseItem.id}`}>
            View Details
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/cases/${caseItem.id}/documents`}>
            View Documents
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/cases/${caseItem.id}/ai-insights`}>
            AI Insights
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/cases/${caseItem.id}/timeline`}>
            Case Timeline
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-red-600"
          onClick={() => {
            // Handle archive/delete
            console.log('Archive case:', caseItem.id)
          }}
        >
          Archive Case
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function formatCaseType(caseType: string): string {
  const types: Record<string, string> = {
    'WP_CR': 'WP (Criminal)',
    'WP_CIVIL': 'WP (Civil)',
    'CRIMINAL_APPEAL': 'Criminal Appeal',
    'CIVIL_APPEAL': 'Civil Appeal',
    'BAIL_APPLICATION': 'Bail Application',
    'ANTICIPATORY_BAIL': 'Anticipatory Bail',
    'QUASHING_PETITION': 'Quashing Petition',
    'REVISION_PETITION': 'Revision Petition',
    'CIVIL_SUIT': 'Civil Suit',
    'CRIMINAL_COMPLAINT': 'Criminal Complaint',
    'ARBITRATION': 'Arbitration',
    'OTHER': 'Other'
  }

  return types[caseType] || caseType
}