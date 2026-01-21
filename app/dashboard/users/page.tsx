'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import DashboardContent from '@/components/DashboardContent'

interface UserMetric {
  userId: string
  email: string
  createdAt: string
  totalPlays: number
  completedPlays: number
  completionRate: number
  totalMinutes: number
  avgProgress: number
  favorites: number
  feedback: number
  lastActivity: string | null
}

interface UsersResponse {
  users: UserMetric[]
  total: number
}

export default function UsersPage() {
  const router = useRouter()
  const [usersData, setUsersData] = useState<UsersResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const limit = 50

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

      const offset = (page - 1) * limit
      const response = await fetch(`/api/metrics/users?limit=${limit}&offset=${offset}`, { headers })

      if (response.status === 401) {
        sessionStorage.removeItem('dashboard_auth')
        router.push('/dashboard/login')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to fetch user metrics')
      }

      const data = await response.json()
      setUsersData(data)
      setLoading(false)
      setError(null)
    } catch (err) {
      console.error('Error loading users:', err)
      setError('Failed to load user metrics')
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page])

  const handleLogout = () => {
    sessionStorage.removeItem('dashboard_auth')
    router.push('/dashboard/login')
  }

  const totalPages = usersData ? Math.ceil(usersData.total / limit) : 0

  if (loading && !usersData) {
    return (
      <div className="min-h-screen bg-primary flex">
        <Sidebar />
        <DashboardContent>
          <div className="flex items-center justify-center h-screen">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-accent-secondary border-t-transparent mx-auto"></div>
              <p className="mt-4 text-secondary">Loading users...</p>
            </div>
          </div>
        </DashboardContent>
      </div>
    )
  }

  if (error || !usersData) {
    return (
      <div className="min-h-screen bg-primary flex">
        <Sidebar />
        <DashboardContent>
          <div className="flex items-center justify-center h-screen p-4">
            <div className="card max-w-md w-full">
              <div className="text-center">
                <h2 className="text-heading text-2xl text-primary mb-4">Error</h2>
                <p className="text-secondary mb-6">{error || 'Failed to load user metrics'}</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={loadData}
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
        {/* Header */}
        <div className="bg-secondary border-b border-card sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
            <div>
              <h1 className="text-heading text-3xl text-primary">User Metrics</h1>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary */}
        <div className="mb-6">
          <p className="text-secondary">
            Showing {usersData.users.length} of {usersData.total.toLocaleString()} users
          </p>
        </div>

        {/* Users Table */}
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border-card">
              <thead className="table-header">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                    Total Plays
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                    Completed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                    Completion Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                    Minutes Listened
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                    Avg Progress
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                    Favorites
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                    Feedback
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-light text-secondary uppercase tracking-wider">
                    Last Activity
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-border-card">
                {usersData.users.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-4 text-center text-secondary">
                      No users found
                    </td>
                  </tr>
                ) : (
                  usersData.users.map((user) => (
                    <tr key={user.userId} className="table-row">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/dashboard/users/${user.userId}`}
                          className="link text-sm font-light"
                        >
                          {user.email}
                        </Link>
                        <div className="text-xs text-tertiary">{user.userId.slice(0, 8)}...</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {new Date(user.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-light text-primary">
                        {user.totalPlays.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {user.completedPlays.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        <div className="flex items-center">
                          <span className="mr-2">{user.completionRate.toFixed(1)}%</span>
                          <div className="progress-bar flex-1 h-2 max-w-[60px]">
                            <div
                              className="progress-fill bg-theme-green"
                              style={{ width: `${Math.min(user.completionRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {Math.round(user.totalMinutes).toLocaleString()} min
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        <div className="flex items-center">
                          <span className="mr-2">{user.avgProgress.toFixed(1)}%</span>
                          <div className="progress-bar flex-1 h-2 max-w-[60px]">
                            <div
                              className="progress-fill bg-accent-secondary"
                              style={{ width: `${Math.min(user.avgProgress, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {user.favorites.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {user.feedback.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {user.lastActivity
                          ? new Date(user.lastActivity).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })
                          : 'Never'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-secondary px-6 py-4 border-t border-card flex items-center justify-between">
              <div className="text-sm text-secondary">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
        </div>
      </DashboardContent>
    </div>
  )
}
