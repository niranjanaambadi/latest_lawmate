// src/app/(dashboard)/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Case, CaseStats } from '@/types/case'
import { CaseStatus } from '@prisma/client'
import { 
  FileText, 
  Scale, 
  Calendar, 
  AlertTriangle, 
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'

export default function DashboardPage() {
  const [stats, setStats] = useState<CaseStats | null>(null)
  const [recentCases, setRecentCases] = useState<Case[]>([])
  const [upcomingHearings, setUpcomingHearings] = useState<Case[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, casesRes, hearingsRes] = await Promise.all([
        fetch('/api/dashboard/stats'),
        fetch('/api/cases?limit=5&sort=updatedAt&order=desc'),
        fetch('/api/cases?status=PENDING&limit=5&sort=nextHearingDate&order=asc')
      ])

      const [statsData, casesData, hearingsData] = await Promise.all([
        statsRes.json(),
        casesRes.json(),
        hearingsRes.json()
      ])

      setStats(statsData)
      setRecentCases(casesData.cases || [])
      setUpcomingHearings(hearingsData.cases || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your cases and upcoming hearings
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Cases"
            value={stats.total || 0}
            icon={FileText}
            description="All active cases"
          />
          <StatCard
            title="Pending"
            value={stats.byStatus.PENDING || 0}
            icon={Clock}
            description="Awaiting hearing"
            trend={stats.pendingCases > 0 ? 'up' : 'neutral'}
          />
          <StatCard
            title="Disposed"
            value={stats.byStatus.DISPOSED || 0}
            icon={CheckCircle}
            description="Completed cases"
            trend="neutral"
          />
          <StatCard
            title="Upcoming Hearings"
            value={stats.upcomingHearings}
            icon={Calendar}
            description="Next 7 days"
            trend={stats.upcomingHearings > 0 ? 'up' : 'neutral'}
          />
        </div>
      )}

      {/* Status Overview */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Case Status Overview</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatusBar
                label="Filed"
                count={stats.byStatus.FILED || 0}
                total={stats.total || 0}
                color="bg-blue-500"
                icon={FileText}
              />
              <StatusBar
                label="Registered"
                count={stats.byStatus.REGISTERED || 0}
                total={stats.total || 0}
                color="bg-green-500"
                icon={CheckCircle}
              />
              <StatusBar
                label="Pending"
                count={stats.byStatus.PENDING || 0}
                total={stats.total || 0}
                color="bg-amber-500"
                icon={AlertTriangle}
              />
              <StatusBar
                label="Disposed"
                count={stats.byStatus.DISPOSED || 0}
                total={stats.total || 0}
                color="bg-gray-500"
                icon={Scale}
              />
              <StatusBar
                label="Transferred"
                count={stats.byStatus.TRANSFERRED || 0}
                total={stats.total || 0}
                color="bg-purple-500"
                icon={TrendingUp}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Cases */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Cases</CardTitle>
              <Link href="/cases">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>Latest updates</CardDescription>
          </CardHeader>
          <CardContent>
            {recentCases.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No cases yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCases.map((caseItem) => (
                  <CaseListItem key={caseItem.id} caseItem={caseItem} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Hearings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Hearings</CardTitle>
              <Link href="/calendar">
                <Button variant="ghost" size="sm">
                  View Calendar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <CardDescription>Next scheduled hearings</CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingHearings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming hearings</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingHearings.map((hearing) => (
                  <HearingListItem key={hearing.id} hearing={hearing} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  description,
  trend = 'neutral'
}: { 
  title: string
  value: number
  icon: any
  description: string
  trend?: 'up' | 'down' | 'neutral'
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value.toLocaleString()}</div>
        <p className="text-xs text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

function StatusBar({
  label,
  count,
  total,
  color,
  icon: Icon
}: {
  label: string
  count: number
  total: number
  color: string
  icon: any
}) {
  const percentage = total > 0 ? (count / total) * 100 : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-muted-foreground">
          {count} ({percentage.toFixed(0)}%)
        </span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function CaseListItem({ caseItem }: { caseItem: Case }) {
  const getStatusVariant = (status: CaseStatus) => {
    switch (status) {
      case 'PENDING':
        return 'default'
      case 'DISPOSED':
        return 'secondary'
      case 'FILED':
        return 'outline'
      default:
        return 'secondary'
    }
  }

  return (
    <Link href={`/cases/${caseItem.id}`}>
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
        <div className="space-y-1 flex-1">
          <p className="font-medium">{caseItem.caseNumber || caseItem.efilingNumber}</p>
          <p className="text-sm text-muted-foreground">{caseItem.caseType}</p>
        </div>
        <Badge variant={getStatusVariant(caseItem.status)}>
          {caseItem.status}
        </Badge>
      </div>
    </Link>
  )
}

function HearingListItem({ hearing }: { hearing: Case }) {
  const formatHearingDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : parseISO(date as string)
    return format(dateObj, 'MMM d, yyyy')
  }

  const formatShortDate = (date: Date | string) => {
    const dateObj = date instanceof Date ? date : parseISO(date as string)
    return format(dateObj, 'MMM d')
  }

  return (
    <Link href={`/cases/${hearing.id}`}>
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
        <div className="space-y-1 flex-1">
          <p className="font-medium">{hearing.caseNumber || hearing.efilingNumber}</p>
          <p className="text-sm text-muted-foreground">{hearing.caseType}</p>
          {hearing.courtNumber && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Scale className="h-3 w-3" />
              <span>{hearing.courtNumber}</span>
            </div>
          )}
        </div>
        <div className="text-right">
          {hearing.nextHearingDate && (
            <>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium text-sm">
                  {formatShortDate(hearing.nextHearingDate)}
                </p>
              </div>
              {hearing.benchType && (
                <p className="text-xs text-muted-foreground mt-1">
                  {hearing.benchType}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </Link>
  )
}