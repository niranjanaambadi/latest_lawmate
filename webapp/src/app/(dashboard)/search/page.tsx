"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CaseCard } from "@/components/cases/CaseCard"
import { EmptyState } from "@/components/shared/EmptyState"
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton"
import { Search as SearchIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { casesApi } from "@/lib/api/cases"

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const { data, isLoading } = useQuery({
    queryKey: ['search', searchQuery],
    queryFn: () => casesApi.search(searchQuery),
    enabled: searchQuery.length >= 2,
  })

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm.length >= 2) {
      setSearchQuery(searchTerm)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Search Cases
        </h1>
        <p className="text-slate-600 mt-1">
          Search by case number, party names, or keywords
        </p>
      </div>

      {/* Search Form */}
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search cases..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit" disabled={searchTerm.length < 2}>
              Search
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <LoadingSkeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : searchQuery && data?.cases ? (
        <div>
          <div className="mb-4 text-sm text-slate-600">
            Found {data.cases.length} result{data.cases.length !== 1 ? 's' : ''} for "{searchQuery}"
          </div>
          
          {data.cases.length === 0 ? (
            <EmptyState
              icon={<SearchIcon className="h-8 w-8 text-slate-400" />}
              title="No results found"
              message={`No cases match "${searchQuery}". Try different keywords.`}
            />
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {data.cases.map(caseItem => (
                <CaseCard key={caseItem.id} case={caseItem} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <EmptyState
          icon={<SearchIcon className="h-8 w-8 text-slate-400" />}
          title="Start searching"
          message="Enter at least 2 characters to search for cases"
        />
      )}
    </div>
  )
}
