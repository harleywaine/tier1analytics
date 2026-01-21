'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import DashboardContent from '@/components/DashboardContent'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface UserDetailResponse {
  user: {
    id: string
    email: string
    createdAt: string
    emailConfirmedAt: string | null
    lastSignInAt: string | null
  }
  summary: {
    totalPlays: number
    completedPlays: number
    completionRate: number
    totalMinutes: number
    avgProgress: number
    favorites: number
    feedback: number
  }
  timeBased: {
    today: { plays: number; minutes: number }
    last7d: { plays: number; minutes: number }
    last30d: { plays: number; minutes: number }
  }
  sessions: Array<{
    sessionId: string
    title: string | null
    plays: number
    totalMinutes: number
    avgProgress: number
    lastPlayed: string | null
  }>
  favorites: Array<{
    sessionId: string
    title: string | null
    favoritedAt: string
  }>
  feedback: Array<{
    id: string
    message: string
    createdAt: string
    appVersion: string | null
    deviceInfo: string | null
  }>
  dailyActivity: Array<{
    date: string
    plays: number
    minutes: number
  }>
}

function MetricCard({ title, value, subtitle }: { title: string; value: string | number; subtitle?: string }) {
  return (
    <div className="card animate-slide-up">
      <h3 className="text-label text-secondary uppercase">{title}</h3>
      <p className="mt-4 text-3xl font-light text-primary">{value}</p>
      {subtitle && <p className="mt-2 text-sm text-secondary">{subtitle}</p>}
    </div>
  )
}

// Chart colors for dark theme
const chartColors = {
  primary: '#A8C8E8',
  secondary: '#4D5260',
  accent: '#3B82F6',
  success: '#22C55E',
}

// Custom tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
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

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const userId = params.userId as string
  const [data, setData] = useState<UserDetailResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
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

        const response = await fetch(`/api/metrics/users/${userId}`, { headers })

        if (response.status === 401) {
          sessionStorage.removeItem('dashboard_auth')
          router.push('/dashboard/login')
          return
        }

        if (response.status === 404) {
          setError('User not found')
          setLoading(false)
          return
        }

        if (!response.ok) {
          throw new Error('Failed to fetch user details')
        }

        const userData = await response.json()
        setData(userData)
        setLoading(false)
        setError(null)
      } catch (err) {
        console.error('Error loading user details:', err)
        setError('Failed to load user details')
        setLoading(false)
      }
    }

    if (userId) {
      loadData()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const handleLogout = () => {
    sessionStorage.removeItem('dashboard_auth')
    router.push('/dashboard/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex">
        <Sidebar />
        <DashboardContent>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-secondary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-secondary">Loading user details...</p>
            </div>
          </div>
        </DashboardContent>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-primary flex">
        <Sidebar />
        <DashboardContent>
          <div className="flex items-center justify-center h-screen p-4">
            <div className="card max-w-md w-full">
              <div className="text-center">
                <h2 className="text-heading text-2xl text-primary mb-4">Error</h2>
                <p className="text-secondary mb-6">{error || 'Failed to load user details'}</p>
                <div className="flex gap-4 justify-center">
                  <Link
                    href="/dashboard/users"
                    className="btn-primary"
                  >
                    Back to Users
                  </Link>
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
        {/* Header */}
        <div className="bg-secondary border-b border-card sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-heading text-3xl text-primary">{data.user.email}</h1>
              <p className="text-sm text-secondary mt-1">User ID: {data.user.id}</p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info */}
        <div className="card mb-8">
          <h2 className="text-heading text-xl text-primary mb-6">User Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-label text-secondary">Account Created</p>
              <p className="text-sm font-light text-primary mt-2">
                {new Date(data.user.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            {data.user.emailConfirmedAt && (
              <div>
                <p className="text-label text-secondary">Email Confirmed</p>
                <p className="text-sm font-light text-primary mt-2">
                  {new Date(data.user.emailConfirmedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
            {data.user.lastSignInAt && (
              <div>
                <p className="text-label text-secondary">Last Sign In</p>
                <p className="text-sm font-light text-primary mt-2">
                  {new Date(data.user.lastSignInAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Summary Metrics */}
        <div className="mb-8">
          <h2 className="text-heading text-xl text-primary mb-6">Summary Metrics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard title="Total Plays" value={data.summary.totalPlays.toLocaleString()} />
            <MetricCard title="Completed Plays" value={data.summary.completedPlays.toLocaleString()} />
            <MetricCard title="Completion Rate" value={`${data.summary.completionRate.toFixed(1)}%`} />
            <MetricCard title="Total Minutes" value={Math.round(data.summary.totalMinutes).toLocaleString()} />
            <MetricCard title="Avg Progress" value={`${data.summary.avgProgress.toFixed(1)}%`} />
            <MetricCard title="Favorites" value={data.summary.favorites.toLocaleString()} />
            <MetricCard title="Feedback" value={data.summary.feedback.toLocaleString()} />
          </div>
        </div>

        {/* Time-Based Metrics */}
        <div className="mb-8">
          <h2 className="text-heading text-xl text-primary mb-6">Activity by Period</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MetricCard
              title="Today"
              value={data.timeBased.today.plays.toLocaleString()}
              subtitle={`${Math.round(data.timeBased.today.minutes)} minutes`}
            />
            <MetricCard
              title="Last 7 Days"
              value={data.timeBased.last7d.plays.toLocaleString()}
              subtitle={`${Math.round(data.timeBased.last7d.minutes)} minutes`}
            />
            <MetricCard
              title="Last 30 Days"
              value={data.timeBased.last30d.plays.toLocaleString()}
              subtitle={`${Math.round(data.timeBased.last30d.minutes)} minutes`}
            />
          </div>
        </div>

        {/* Daily Activity Chart */}
        <div className="card mb-8">
          <h2 className="text-heading text-xl text-primary mb-6">Daily Activity - Last 30 Days</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.dailyActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke={chartColors.secondary} opacity={0.2} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                stroke={chartColors.secondary}
                style={{ fontSize: '11px' }}
              />
              <YAxis yAxisId="left" stroke={chartColors.secondary} style={{ fontSize: '11px' }} />
              <YAxis yAxisId="right" orientation="right" stroke={chartColors.secondary} style={{ fontSize: '11px' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: '11px', color: chartColors.secondary }} />
              <Line yAxisId="left" type="monotone" dataKey="plays" stroke={chartColors.primary} strokeWidth={2} name="Plays" dot={{ r: 3, fill: chartColors.primary }} />
              <Line yAxisId="right" type="monotone" dataKey="minutes" stroke={chartColors.success} strokeWidth={2} name="Minutes" dot={{ r: 3, fill: chartColors.success }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Sessions Table */}
        <div className="table-container mb-8">
          <div className="px-6 py-4 border-b border-card">
            <h2 className="text-heading text-xl text-primary">Session Usage</h2>
            <p className="text-sm text-secondary mt-1">Sessions ranked by number of plays</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-card">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                    Plays
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                    Minutes Listened
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                    Avg Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                    Last Played
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-border-card">
                {data.sessions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-secondary">
                      No sessions found
                    </td>
                  </tr>
                ) : (
                  data.sessions.map((session) => (
                    <tr key={session.sessionId} className="table-row">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-primary">
                        {session.title || 'Untitled Session'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {session.plays.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {Math.round(session.totalMinutes).toLocaleString()} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        <div className="flex items-center">
                          <span className="mr-2">{session.avgProgress.toFixed(1)}%</span>
                          <div className="progress-bar flex-1 h-2 max-w-[100px]">
                            <div
                              className="progress-fill bg-accent-secondary"
                              style={{ width: `${Math.min(session.avgProgress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {session.lastPlayed
                          ? new Date(session.lastPlayed).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : 'Never'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Favorites */}
        {data.favorites.length > 0 && (
          <div className="table-container mb-8">
            <div className="px-6 py-4 border-b border-card">
              <h2 className="text-heading text-xl text-primary">Favorites ({data.favorites.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-card">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                      Favorited At
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-border-card">
                  {data.favorites.map((fav) => (
                    <tr key={fav.sessionId} className="table-row">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-primary">
                        {fav.title || 'Untitled Session'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {new Date(fav.favoritedAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Feedback */}
        {data.feedback.length > 0 && (
          <div className="table-container">
            <div className="px-6 py-4 border-b border-card">
              <h2 className="text-heading text-xl text-primary">Feedback ({data.feedback.length})</h2>
            </div>
            <div className="divide-y divide-border-card">
              {data.feedback.map((fb) => (
                <div key={fb.id} className="px-6 py-4">
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm text-secondary">
                      {new Date(fb.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    {(fb.appVersion || fb.deviceInfo) && (
                      <div className="text-xs text-tertiary">
                        {fb.appVersion && <span>v{fb.appVersion}</span>}
                        {fb.appVersion && fb.deviceInfo && <span> • </span>}
                        {fb.deviceInfo && <span>{fb.deviceInfo}</span>}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-primary">{fb.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </DashboardContent>
    </div>
  )
}
