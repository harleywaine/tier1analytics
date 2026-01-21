'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import DashboardContent from '@/components/DashboardContent'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface KpisResponse {
  newUsers: { today: number; last7d: number; last30d: number }
  activeUsers: { dau: number; wau: number; mau: number }
  plays: { today: number; last7d: number; last30d: number }
  minutesListened: { today: number; last7d: number; last30d: number }
  completionRate: number
  favorites: { last7d: number; last30d: number }
  feedback: { last7d: number; last30d: number }
}

interface TrendsResponse {
  data: Array<{ date: string; dau: number }>
}

interface DailyMinutesResponse {
  data: Array<{ date: string; minutes: number }>
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

// Custom chart colors for dark theme
const chartColors = {
  primary: '#A8C8E8',
  secondary: '#4D5260',
  accent: '#3B82F6',
  success: '#22C55E',
}

// Custom tooltip for charts
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card-bg border border-card rounded-input p-3 shadow-card">
        <p className="text-sm text-secondary mb-2">
          {new Date(label).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-primary" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function DashboardPage() {
  const router = useRouter()
  const [kpis, setKpis] = useState<KpisResponse | null>(null)
  const [trends, setTrends] = useState<TrendsResponse | null>(null)
  const [dailyMinutes, setDailyMinutes] = useState<DailyMinutesResponse | null>(null)
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

      const [kpisRes, trendsRes, minutesRes] = await Promise.all([
        fetch('/api/metrics/kpis', { headers }),
        fetch('/api/metrics/trends?days=30', { headers }),
        fetch('/api/metrics/daily-minutes?days=14', { headers }),
      ])

      if (kpisRes.status === 401 || trendsRes.status === 401 || minutesRes.status === 401) {
        sessionStorage.removeItem('dashboard_auth')
        router.push('/dashboard/login')
        return
      }

      if (!kpisRes.ok || !trendsRes.ok || !minutesRes.ok) {
        throw new Error('Failed to fetch dashboard data')
      }

      const [kpisData, trendsData, minutesData] = await Promise.all([
        kpisRes.json(),
        trendsRes.json(),
        minutesRes.json(),
      ])

      setKpis(kpisData)
      setTrends(trendsData)
      setDailyMinutes(minutesData)
      setLoading(false)
      setLastRefresh(new Date())
      setError(null)
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setError('Failed to load dashboard data')
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
              <p className="mt-4 text-secondary">Loading dashboard...</p>
            </div>
          </div>
        </DashboardContent>
      </div>
    )
  }

  if (error || !kpis || !trends || !dailyMinutes) {
    return (
      <div className="min-h-screen bg-primary flex">
        <Sidebar />
        <DashboardContent>
          <div className="flex items-center justify-center h-screen p-4">
            <div className="card max-w-md w-full">
              <div className="text-center">
                <h2 className="text-heading text-2xl text-primary mb-4">Error</h2>
                <p className="text-secondary mb-6">{error || 'Failed to load dashboard data'}</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={handleRefresh}
                    className="btn-primary"
                  >
                    Retry
                  </button>
                  <button
                    onClick={() => router.push('/dashboard/login')}
                    className="btn-secondary"
                  >
                    Return to Login
                  </button>
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
              <h1 className="text-heading text-3xl text-primary">Overview</h1>
              <p className="text-sm text-secondary mt-1">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Key Metrics Section */}
          <div className="mb-8">
            <h2 className="text-heading text-xl text-primary mb-6">Key Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
              <KpiCard 
                title="Completion Rate" 
                value={`${kpis.completionRate.toFixed(1)}%`} 
                subtitle="Sessions completed"
              />
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="card">
              <h2 className="text-heading text-xl text-primary mb-6">Daily Active Users - Last 30 Days</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trends.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.secondary} opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    stroke={chartColors.secondary}
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis stroke={chartColors.secondary} style={{ fontSize: '11px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: chartColors.secondary }} />
                  <Line 
                    type="monotone" 
                    dataKey="dau" 
                    stroke={chartColors.primary} 
                    strokeWidth={2} 
                    name="DAU" 
                    dot={{ r: 3, fill: chartColors.primary }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="card">
              <h2 className="text-heading text-xl text-primary mb-6">Minutes Listened - Last 14 Days</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dailyMinutes.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.secondary} opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    stroke={chartColors.secondary}
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis stroke={chartColors.secondary} style={{ fontSize: '11px' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: '11px', color: chartColors.secondary }} />
                  <Bar 
                    dataKey="minutes" 
                    fill={chartColors.success} 
                    name="Minutes" 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </DashboardContent>
    </div>
  )
}
