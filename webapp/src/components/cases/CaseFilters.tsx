// src/components/cases/CaseFilters.tsx
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { CaseStatus } from '@prisma/client'
import { Search, X, Filter } from 'lucide-react'

const CASE_TYPES = [
  { value: 'WP_CR', label: 'Writ Petition (Criminal)' },
  { value: 'WP_CIVIL', label: 'Writ Petition (Civil)' },
  { value: 'CRIMINAL_APPEAL', label: 'Criminal Appeal' },
  { value: 'CIVIL_APPEAL', label: 'Civil Appeal' },
  { value: 'BAIL_APPLICATION', label: 'Bail Application' },
  { value: 'ANTICIPATORY_BAIL', label: 'Anticipatory Bail' },
  { value: 'QUASHING_PETITION', label: 'Quashing Petition' },
  { value: 'REVISION_PETITION', label: 'Revision Petition' },
  { value: 'CIVIL_SUIT', label: 'Civil Suit' },
  { value: 'CRIMINAL_COMPLAINT', label: 'Criminal Complaint' },
  { value: 'ARBITRATION', label: 'Arbitration' },
  { value: 'OTHER', label: 'Other' },
]

const CASE_STATUSES = [
  { value: 'FILED', label: 'Filed' },
  { value: 'REGISTERED', label: 'Registered' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'DISPOSED', label: 'Disposed' },
  { value: 'TRANSFERRED', label: 'Transferred' },
]

const SORT_OPTIONS = [
  { value: 'caseNumber', label: 'Case Number' },
  { value: 'nextHearingDate', label: 'Next Hearing Date' },
  { value: 'efilingDate', label: 'Filing Date' },
  { value: 'updatedAt', label: 'Last Updated' },
]

const CURRENT_YEAR = new Date().getFullYear()
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i)

export function CaseFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
    caseType: searchParams.get('caseType') || 'all',
    caseYear: searchParams.get('caseYear') || 'all',
    sort: searchParams.get('sort') || 'updatedAt',
    order: searchParams.get('order') || 'desc',
  })

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'all') {
        params.set(key, value)
      }
    })

    router.push(`/cases?${params.toString()}`)
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      status: 'all',
      caseType: 'all',
      caseYear: 'all',
      sort: 'updatedAt',
      order: 'desc',
    })
    router.push('/cases')
  }

  const hasActiveFilters = 
    filters.search !== '' ||
    filters.status !== 'all' ||
    filters.caseType !== 'all' ||
    filters.caseYear !== 'all'

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by case number, petitioner, or respondent..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyFilters()
              }
            }}
            className="pl-9"
          />
        </div>
        
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {[filters.status, filters.caseType, filters.caseYear].filter(v => v !== 'all').length}
            </span>
          )}
        </Button>

        <Button onClick={applyFilters}>
          Apply
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" onClick={clearFilters}>
            <X className="mr-2 h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status}
                  onValueChange={(value) => handleFilterChange('status', value)}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {CASE_STATUSES.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Case Type Filter */}
              <div className="space-y-2">
                <Label htmlFor="caseType">Case Type</Label>
                <Select
                  value={filters.caseType}
                  onValueChange={(value) => handleFilterChange('caseType', value)}
                >
                  <SelectTrigger id="caseType">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {CASE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Year Filter */}
              <div className="space-y-2">
                <Label htmlFor="caseYear">Year</Label>
                <Select
                  value={filters.caseYear}
                  onValueChange={(value) => handleFilterChange('caseYear', value)}
                >
                  <SelectTrigger id="caseYear">
                    <SelectValue placeholder="All Years" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {YEARS.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sort Options */}
              <div className="space-y-2">
                <Label htmlFor="sort">Sort By</Label>
                <div className="flex gap-2">
                  <Select
                    value={filters.sort}
                    onValueChange={(value) => handleFilterChange('sort', value)}
                  >
                    <SelectTrigger id="sort" className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.order}
                    onValueChange={(value) => handleFilterChange('order', value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Asc</SelectItem>
                      <SelectItem value="desc">Desc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}