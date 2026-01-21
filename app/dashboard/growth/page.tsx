'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import DashboardContent from '@/components/DashboardContent'

interface KpisResponse {
  newUsers: { today: number; last7d: number; last30d: number }
  activeUsers: { dau: number; wau: number; mau: number }
}

function KpiCard({ 
  title, 
  value, 
  subtitle, 
  trend 
}: { 
  title: string
  value: string | number
  subtitle?: string
  trend?: { value: number; label: string }
}) {
  const trendColor = trend && trend.value > 0 ? 'text-theme-green' : trend && trend.value < 0 ? 'text-theme-red' : 'text-tertiary'
  const trendIcon = trend && trend.value > 0 ? '↑' : trend && trend.value < 0 ? '↓' : ''

  return (
    <div className="card animate-slide-up">
      <h3 className="text-label text-secondary uppercase">{title}</h3>
      <div className="mt-4 flex items-baseline justify-between">
        <p className="text-3xl font-light text-primary">{value}</p>
        {trend && (
          <span className={`text-sm font-light ${trendColor}`}>
            {trendIcon} {Math.abs(trend.value).toFixed(1)}% {trend.label}
          </span>
        )}
      </div>
      {subtitle && <p className="mt-2 text-sm text-secondary">{subtitle}</p>}
    </div>
  )
}

export default function GrowthPage() {
  const router = useRouter()
  const [kpis, setKpis] = useState<KpisResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const loadData = async () => {
    try {
      const auth = sessionStorage.getItem('dashboard_auth')
      
      if (!auth) {
        router.push('/dashboard/login')
        return
      }

      const headers = {
        'Authorization': `Basic ${auth}`,
      }

      const kpisRes = await fetch('/api/metrics/kpis', { headers })

      if (kpisRes.status === 401) {
        sessionStorage.removeItem('dashboard_auth')
        router.push('/dashboard/login')
        return
      }

      if (!kpisRes.ok) {
        throw new Error('Failed to fetch growth data')
      }

      const kpisData = await kpisRes.json()
      setKpis(kpisData)
      setLoading(false)
      setLastRefresh(new Date())
      setError(null)
    } catch (err) {
      console.error('Error loading growth data:', err)
      setError('Failed to load growth data')
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [router])

  const handleRefresh = () => {
    setLoading(true)
    loadData()
  }

  const calculateTrend = (current: number, previous: number): { value: number; label: string } | undefined => {
    if (previous === 0) return undefined
    const change = ((current - previous) / previous) * 100
    return { value: change, label: 'vs prev' }
  }

  if (loading && !kpis) {
    return (
      <div className="min-h-screen bg-primary flex">
        <Sidebar />
        <DashboardContent>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-secondary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-secondary">Loading growth data...</p>
            </div>
          </div>
        </DashboardContent>
      </div>
    )
  }

  if (error || !kpis) {
    return (
      <div className="min-h-screen bg-primary flex">
        <Sidebar />
        <DashboardContent>
          <div className="flex items-center justify-center h-screen p-4">
            <div className="card max-w-md w-full">
              <div className="text-center">
                <h2 className="text-heading text-2xl text-primary mb-4">Error</h2>
                <p className="text-secondary mb-6">{error || 'Failed to load growth data'}</p>
                <div className="flex gap-4 justify-center">
                  <button onClick={handleRefresh} className="btn-primary">Retry</button>
                </div>
              </div>
            </div>
          </div>
        </DashboardContent>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-primary flex">
      <Sidebar />
      
      <DashboardContent>
        <div className="bg-secondary border-b border-card sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-heading text-3xl text-primary">User Growth</h1>
              <p className="text-sm text-secondary mt-1">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h2 className="text-heading text-xl text-primary mb-6">New Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KpiCard 
                title="New Users (Today)" 
                value={kpis.newUsers.today.toLocaleString()}
                trend={calculateTrend(kpis.newUsers.today, kpis.newUsers.last7d / 7)}
              />
              <KpiCard 
                title="New Users (7d)" 
                value={kpis.newUsers.last7d.toLocaleString()}
                trend={calculateTrend(kpis.newUsers.last7d, kpis.newUsers.last30d * 7 / 30)}
              />
              <KpiCard 
                title="New Users (30d)" 
                value={kpis.newUsers.last30d.toLocaleString()}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-heading text-xl text-primary mb-6">Active Users</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KpiCard 
                title="Daily Active Users" 
                value={kpis.activeUsers.dau.toLocaleString()} 
                subtitle="Users who played today"
              />
              <KpiCard 
                title="Weekly Active Users" 
                value={kpis.activeUsers.wau.toLocaleString()} 
                subtitle="Users active in last 7 days"
              />
              <KpiCard 
                title="Monthly Active Users" 
                value={kpis.activeUsers.mau.toLocaleString()} 
                subtitle="Users active in last 30 days"
              />
            </div>
          </div>
        </div>
      </DashboardContent>
    </div>
  )
}

