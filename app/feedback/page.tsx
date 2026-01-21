import DashboardLayout from '@/components/DashboardLayout'
import { getFeedback, getFeedbackCount } from '@/lib/db/queries'
import DataTable from '@/components/DataTable'
import MetricCard from '@/components/MetricCard'

export default async function FeedbackPage({
  searchParams,
}: {
  searchParams: { page?: string }
}) {
  const page = parseInt(searchParams.page || '1')
  const limit = 50
  const offset = (page - 1) * limit

  const [feedback, totalCount] = await Promise.all([
    getFeedback(limit, offset),
    getFeedbackCount(),
  ])

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'user_id', label: 'User ID' },
    { key: 'feedback_type', label: 'Type' },
    { key: 'rating', label: 'Rating' },
    { key: 'message', label: 'Message' },
    { key: 'created_at', label: 'Created At' },
  ]

  return (
    <DashboardLayout>
      <div className="dashboard-container">
        <h1 className="page-title">Feedback</h1>
        
        <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <MetricCard
            title="Total Feedback"
            value={totalCount.toLocaleString()}
          />
        </div>

        <DataTable
          data={feedback}
          columns={columns}
          currentPage={page}
          totalCount={totalCount}
          limit={limit}
          basePath="/feedback"
        />
      </div>
    </DashboardLayout>
  )
}

