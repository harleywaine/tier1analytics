'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import DashboardContent from '@/components/DashboardContent'

interface KpisResponse {
  plays: { today: number; last7d: number; last30d: number }
  minutesListened: { today: number; last7d: number; last30d: number }
  completionRate: number
}

function KpiCard({ 
  title, 
  value, 
  subtitle
}: { 
  title: string
  value: string | number
  subtitle?: string
}) {
  return (
    <div className="card animate-slide-up">
      <h3 className="text-label text-secondary uppercase">{title}</h3>
      <div className="mt-4">
        <p className="text-3xl font-light text-primary">{value}</p>
      </div>
      {subtitle && <p className="mt-2 text-sm text-secondary">{subtitle}</p>}
    </div>
  )
}

export default function EngagementPage() {
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
        throw new Error('Failed to fetch engagement data')
      }

      const kpisData = await kpisRes.json()
      setKpis(kpisData)
      setLoading(false)
      setLastRefresh(new Date())
      setError(null)
    } catch (err) {
      console.error('Error loading engagement data:', err)
      setError('Failed to load engagement data')
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleRefresh = () => {
    setLoading(true)
    loadData()
  }

  if (loading && !kpis) {
    return (
      <div className="min-h-screen bg-primary flex">
        <Sidebar />
        <DashboardContent>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-secondary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-secondary">Loading engagement data...</p>
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
                <p className="text-secondary mb-6">{error || 'Failed to load engagement data'}</p>
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
              <h1 className="text-heading text-3xl text-primary">Engagement</h1>
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
            <h2 className="text-heading text-xl text-primary mb-6">Plays</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KpiCard 
                title="Plays (Today)" 
                value={kpis.plays.today.toLocaleString()}
              />
              <KpiCard 
                title="Plays (7d)" 
                value={kpis.plays.last7d.toLocaleString()}
              />
              <KpiCard 
                title="Plays (30d)" 
                value={kpis.plays.last30d.toLocaleString()}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-heading text-xl text-primary mb-6">Minutes Listened</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KpiCard
                title="Minutes Listened (Today)"
                value={Math.round(kpis.minutesListened.today).toLocaleString()}
              />
              <KpiCard
                title="Minutes Listened (7d)"
                value={Math.round(kpis.minutesListened.last7d).toLocaleString()}
              />
              <KpiCard
                title="Minutes Listened (30d)"
                value={Math.round(kpis.minutesListened.last30d).toLocaleString()}
              />
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-heading text-xl text-primary mb-6">Completion</h2>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 max-w-md">
              <KpiCard 
                title="Completion Rate" 
                value={`${kpis.completionRate.toFixed(1)}%`} 
                subtitle="Sessions completed"
              />
            </div>
          </div>
        </div>
      </DashboardContent>
    </div>
  )
}

