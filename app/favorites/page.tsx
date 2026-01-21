import DashboardLayout from '@/components/DashboardLayout'
import { getFavorites, getFavoritesCount } from '@/lib/db/queries'
import DataTable from '@/components/DataTable'
import MetricCard from '@/components/MetricCard'

export default async function FavoritesPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams.page || '1')
  const limit = 50
  const offset = (page - 1) * limit

  const [favorites, totalCount] = await Promise.all([
    getFavorites(limit, offset),
    getFavoritesCount(),
  ])

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user_id', label: 'User ID' },
    { key: 'content_id', label: 'Content ID' },
    { key: 'content_type', label: 'Content Type' },
    { key: 'created_at', label: 'Created At' },
  ]

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        <h1 className="page-title">Favorites</h1>
        
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <MetricCard
            title="Total Favorites"
            value={totalCount.toLocaleString()}
          />
        </div>

        <DataTable
          data={favorites}
          columns={columns}
          currentPage={page}
          totalCount={totalCount}
          limit={limit}
          basePath="/favorites"
        />
      </div>
    </DashboardLayout>
  )
}

