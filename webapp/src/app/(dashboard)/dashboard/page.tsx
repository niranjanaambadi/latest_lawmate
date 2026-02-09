// src/app/(dashboard)/dashboard/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Case } from '@/types/case'
import { CaseStatus } from '@prisma/client'
import { 
  FileText, 
  Scale, 
  Calendar, 
  AlertTriangle, 
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'

interface CaseStats {
  totalCases: number
  pendingCases: number
  disposedCases: number
  upcomingHearings: number
  totalDocuments: number
  casesByStatus: Record<CaseStatus, number>
  casesByType: Record<string, number>
  monthlyTrend: Array<{
    month: string
    count: number
  }>
}

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
        <div className="text-center">Loading dashboard...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your cases and upcoming hearings
        </p>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Cases"
            value={stats.totalCases}
            icon={FileText}
            description="All active cases"
          />
          <StatCard
            title="Pending"
            value={stats.casesByStatus.PENDING || 0}
            icon={Clock}
            description="Awaiting hearing"
          />
          <StatCard
            title="Disposed"
            value={stats.casesByStatus.DISPOSED || 0}
            icon={CheckCircle}
            description="Completed cases"
          />
          <StatCard
            title="Upcoming Hearings"
            value={stats.upcomingHearings}
            icon={Calendar}
            description="Next 7 days"
          />
        </div>
      )}

      {stats && (
        <Card>
          <CardHeader>
            <CardTitle>Case Status Overview</CardTitle>
            <CardDescription>Distribution by status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <StatusBar label="Filed" count={stats.casesByStatus.FILED || 0} total={stats.totalCases} color="bg-blue-500" icon={FileText} />
              <StatusBar label="Registered" count={stats.casesByStatus.REGISTERED || 0} total={stats.totalCases} color="bg-green-500" icon={CheckCircle} />
              <StatusBar label="Pending" count={stats.casesByStatus.PENDING || 0} total={stats.totalCases} color="bg-amber-500" icon={AlertTriangle} />
              <StatusBar label="Disposed" count={stats.casesByStatus.DISPOSED || 0} total={stats.totalCases} color="bg-gray-500" icon={Scale} />
              <StatusBar label="Transferred" count={stats.casesByStatus.TRANSFERRED || 0} total={stats.totalCases} color="bg-purple-500" icon={TrendingUp} />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">
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
              <div className="text-center py-8 text-muted-foreground">No cases yet</div>
            ) : (
              <div className="space-y-4">
                {recentCases.map((c) => (
                  <CaseListItem key={c.id} case_={c} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

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
              <div className="text-center py-8 text-muted-foreground">No upcoming hearings</div>
            ) : (
              <div className="space-y-4">
                {upcomingHearings.map((h) => (
                  <HearingListItem key={h.id} hearing={h} />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {stats && stats.monthlyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
            <CardDescription>Cases filed over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-64 gap-2">
              {stats.monthlyTrend.map((item, index) => {
                const maxCount = Math.max(...stats.monthlyTrend.map(t => t.count))
                const height = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="text-sm font-medium">{item.count}</div>
                    <div 
                      className="w-full bg-primary rounded-t-md transition-all hover:opacity-80"
                      style={{ height: `${height}%`, minHeight: item.count > 0 ? '20px' : '0' }}
                    />
                    <div className="text-xs text-muted-foreground">{item.month}</div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function StatCard({ title, value, icon: Icon, description }: { title: string; value: number; icon: any; description: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function StatusBar({ label, count, total, color, icon: Icon }: { label: string; count: number; total: number; color: string; icon: any }) {
  const percentage = total > 0 ? (count / total) * 100 : 0
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-muted-foreground">{count} ({percentage.toFixed(0)}%)</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  )
}

function CaseListItem({ case_ }: { case_: Case }) {
  return (
    <Link href={`/cases/${case_.id}`}>
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
        <div className="space-y-1">
          <p className="font-medium">{case_.caseNumber || case_.efilingNumber}</p>
          <p className="text-sm text-muted-foreground">{case_.caseType}</p>
        </div>
        <Badge variant={case_.status === 'PENDING' ? 'default' : 'secondary'}>{case_.status}</Badge>
      </div>
    </Link>
  )
}

function HearingListItem({ hearing }: { hearing: Case }) {
  return (
    <Link href={`/cases/${hearing.id}`}>
      <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors cursor-pointer">
        <div className="space-y-1">
          <p className="font-medium">{hearing.caseNumber || hearing.efilingNumber}</p>
          <p className="text-sm text-muted-foreground">{hearing.caseType}</p>
        </div>
        <div className="text-right">
          {hearing.nextHearingDate && (
            <>
              <p className="font-medium text-sm">
                {format(hearing.nextHearingDate instanceof Date ? hearing.nextHearingDate : parseISO(hearing.nextHearingDate as string), 'MMM d')}
              </p>
              {hearing.courtNumber && <p className="text-xs text-muted-foreground">{hearing.courtNumber}</p>}
            </>
          )}
        </div>
      </div>
    </Link>
  )
}