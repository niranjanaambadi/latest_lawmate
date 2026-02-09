// src/app/(dashboard)/cases/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { Case, CaseFilters as CaseFiltersType, CaseStatus } from '@/types/case'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Filter, Plus, FileText, Calendar, User } from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'

export default function CasesPage() {
  const [cases, setCases] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<CaseFiltersType>({
    status: "all",
    sort: "nextHearingDate", // Changed from "next_hearing_date"
    order: "asc",
    page: 1,
    perPage: 20,
  })

  useEffect(() => {
    fetchCases()
  }, [filters])

  const fetchCases = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          params.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/cases?${params}`)
      const data = await response.json()
      
      setCases(data.cases || [])
      setTotalPages(data.pagination?.totalPages || 1)
    } catch (error) {
      console.error('Failed to fetch cases:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof CaseFiltersType, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Cases</h1>
          <p className="text-muted-foreground">
            Manage and track your cases
          </p>
        </div>
        <Button asChild>
          <Link href="/cases/new">
            <Plus className="mr-2 h-4 w-4" />
            New Case
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search cases..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Status Filter */}
            <Select
              value={filters.status || 'all'}
              onValueChange={(value) => handleFilterChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="FILED">Filed</SelectItem>
                <SelectItem value="REGISTERED">Registered</SelectItem>
                <SelectItem value="PENDING">Pending</SelectItem>
                <SelectItem value="DISPOSED">Disposed</SelectItem>
                <SelectItem value="TRANSFERRED">Transferred</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select
              value={filters.sort || 'nextHearingDate'}
              onValueChange={(value) => handleFilterChange('sort', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="nextHearingDate">Next Hearing</SelectItem>
                <SelectItem value="caseNumber">Case Number</SelectItem>
                <SelectItem value="efilingDate">Filing Date</SelectItem>
                <SelectItem value="updatedAt">Last Updated</SelectItem>
              </SelectContent>
            </Select>

            {/* Order */}
            <Select
              value={filters.order || 'asc'}
              onValueChange={(value) => handleFilterChange('order', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Order" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Ascending</SelectItem>
                <SelectItem value="desc">Descending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Cases List */}
      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Loading cases...
          </CardContent>
        </Card>
      ) : cases.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No cases found</p>
            <Button asChild>
              <Link href="/cases/new">
                <Plus className="mr-2 h-4 w-4" />
                Create First Case
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4">
            {cases.map((caseItem) => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                disabled={filters.page === 1}
                onClick={() => handlePageChange((filters.page || 1) - 1)}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Page {filters.page} of {totalPages}
                </span>
              </div>
              <Button
                variant="outline"
                disabled={filters.page === totalPages}
                onClick={() => handlePageChange((filters.page || 1) + 1)}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

function CaseCard({ caseItem }: { caseItem: Case }) {
  const getStatusVariant = (status: CaseStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'PENDING':
        return 'default'
      case 'DISPOSED':
        return 'secondary'
      case 'TRANSFERRED':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  return (
    <Link href={`/cases/${caseItem.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-semibold text-lg mb-1">
                {caseItem.caseNumber || caseItem.efilingNumber}
              </h3>
              <p className="text-sm text-muted-foreground">
                {caseItem.caseType}
              </p>
            </div>
            <Badge variant={getStatusVariant(caseItem.status)}>
              {caseItem.status}
            </Badge>
          </div>

          <div className="grid gap-2 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Petitioner:</span>
              <span className="text-muted-foreground truncate">
                {caseItem.petitionerName}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Respondent:</span>
              <span className="text-muted-foreground truncate">
                {caseItem.respondentName}
              </span>
            </div>

            {caseItem.nextHearingDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Next Hearing:</span>
                <span className="text-muted-foreground">
                  {format(
                    caseItem.nextHearingDate instanceof Date
                      ? caseItem.nextHearingDate
                      : parseISO(caseItem.nextHearingDate as string),
                    'MMM d, yyyy'
                  )}
                </span>
              </div>
            )}

            {caseItem._count && (
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Documents:</span>
                <span className="text-muted-foreground">
                  {caseItem._count.documents}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
