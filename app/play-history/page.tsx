import DashboardLayout from '@/components/DashboardLayout'
import { getUserPlayHistory, getPlayHistoryCount } from '@/lib/db/queries'
import DataTable from '@/components/DataTable'
import MetricCard from '@/components/MetricCard'

export default async function PlayHistoryPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams.page || '1')
  const limit = 50
  const offset = (page - 1) * limit

  const [playHistory, totalCount] = await Promise.all([
    getUserPlayHistory(limit, offset),
    getPlayHistoryCount(),
  ])

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user_id', label: 'User ID' },
    { key: 'content_id', label: 'Content ID' },
    { key: 'content_type', label: 'Content Type' },
    { key: 'played_at', label: 'Played At' },
    { key: 'created_at', label: 'Created At' },
  ]

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        <h1 className="page-title">Play History</h1>
        
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <MetricCard
            title="Total Plays"
            value={totalCount.toLocaleString()}
          />
        </div>

        <DataTable
          data={playHistory}
          columns={columns}
          currentPage={page}
          totalCount={totalCount}
          limit={limit}
          basePath="/play-history"
        />
      </div>
    </DashboardLayout>
  )
}

