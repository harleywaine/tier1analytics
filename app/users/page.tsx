import DashboardLayout from '@/components/DashboardLayout'
import { getUsers, getUserCount } from '@/lib/db/queries'
import DataTable from '@/components/DataTable'
import MetricCard from '@/components/MetricCard'

export default async function UsersPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams.page || '1')
  const limit = 50
  const offset = (page - 1) * limit

  const [users, totalCount] = await Promise.all([
    getUsers(limit, offset),
    getUserCount(),
  ])

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'email', label: 'Email' },
    { key: 'created_at', label: 'Created At' },
  ]

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        <h1 className="page-title">Users</h1>
        
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <MetricCard
            title="Total Users"
            value={totalCount.toLocaleString()}
          />
        </div>

        <DataTable
          data={users}
          columns={columns}
          currentPage={page}
          totalCount={totalCount}
          limit={limit}
          basePath="/users"
        />
      </div>
    </DashboardLayout>
  )
}

