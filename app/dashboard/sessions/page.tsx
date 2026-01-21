'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import DashboardContent from '@/components/DashboardContent'

interface TopSession {
  sessionId: string
  title: string | null
  plays: number
  minutesListened: number
  avgProgress: number
}

interface TopSessionsResponse {
  sessions: TopSession[]
}

export default function SessionsPage() {
  const router = useRouter()
  const [topSessions, setTopSessions] = useState<TopSessionsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [days, setDays] = useState(7)
  const [limit, setLimit] = useState(10)

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

      const sessionsRes = await fetch(`/api/metrics/top-sessions?days=${days}&limit=${limit}`, { headers })

      if (sessionsRes.status === 401) {
        sessionStorage.removeItem('dashboard_auth')
        router.push('/dashboard/login')
        return
      }

      if (!sessionsRes.ok) {
        throw new Error('Failed to fetch sessions data')
      }

      const sessionsData = await sessionsRes.json()
      setTopSessions(sessionsData)
      setLoading(false)
      setLastRefresh(new Date())
      setError(null)
    } catch (err) {
      console.error('Error loading sessions:', err)
      setError('Failed to load sessions data')
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days, limit])

  const handleRefresh = () => {
    setLoading(true)
    loadData()
  }

  if (loading && !topSessions) {
    return (
      <div className="min-h-screen bg-primary flex">
        <Sidebar />
        <DashboardContent>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-secondary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-secondary">Loading sessions...</p>
            </div>
          </div>
        </DashboardContent>
      </div>
    )
  }

  if (error || !topSessions) {
    return (
      <div className="min-h-screen bg-primary flex">
        <Sidebar />
        <DashboardContent>
          <div className="flex items-center justify-center h-screen p-4">
            <div className="card max-w-md w-full">
              <div className="text-center">
                <h2 className="text-heading text-2xl text-primary mb-4">Error</h2>
                <p className="text-secondary mb-6">{error || 'Failed to load sessions data'}</p>
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
              <h1 className="text-heading text-3xl text-primary">Top Sessions</h1>
              <p className="text-sm text-secondary mt-1">
                Last updated: {lastRefresh.toLocaleTimeString()}
              </p>
            </div>
            <div className="flex gap-3 items-center">
              <div className="flex gap-2">
                <select
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="input text-sm"
                >
                  <option value={7}>Last 7 days</option>
                  <option value={14}>Last 14 days</option>
                  <option value={30}>Last 30 days</option>
                </select>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="input text-sm"
                >
                  <option value={10}>Top 10</option>
                  <option value={25}>Top 25</option>
                  <option value={50}>Top 50</option>
                </select>
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
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="table-container">
            <div className="px-6 py-4 border-b border-card">
              <h2 className="text-heading text-xl text-primary">Top Sessions - Last {days} Days</h2>
              <p className="text-sm text-secondary mt-1">Ranked by number of plays</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-border-card">
                <thead className="table-header">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                      Rank
                    </th>
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
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-border-card">
                  {topSessions.sessions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-secondary">
                        No sessions found
                      </td>
                    </tr>
                  ) : (
                    topSessions.sessions.map((session, index) => (
                      <tr key={session.sessionId} className="table-row">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-primary">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-primary">
                          {session.title || 'Untitled Session'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                          {session.plays.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                          {Math.round(session.minutesListened).toLocaleString()} min
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
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </DashboardContent>
    </div>
  )
}

