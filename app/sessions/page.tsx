import DashboardLayout from '@/components/DashboardLayout'
import { getUnifiedSessions, getUnifiedSessionsCount } from '@/lib/db/queries'
import DataTable from '@/components/DataTable'
import MetricCard from '@/components/MetricCard'

export default async function SessionsPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams.page || '1')
  const limit = 50
  const offset = (page - 1) * limit

  const [sessions, totalCount] = await Promise.all([
    getUnifiedSessions(limit, offset),
    getUnifiedSessionsCount(),
  ])

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user_id', label: 'User ID' },
    { key: 'session_start', label: 'Session Start' },
    { key: 'session_end', label: 'Session End' },
    { key: 'created_at', label: 'Created At' },
  ]

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        <h1 className="page-title">Unified Sessions</h1>
        
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <MetricCard
            title="Total Sessions"
            value={totalCount.toLocaleString()}
          />
        </div>

        <DataTable
          data={sessions}
          columns={columns}
          currentPage={page}
          totalCount={totalCount}
          limit={limit}
          basePath="/sessions"
        />
      </div>
    </DashboardLayout>
  )
}

