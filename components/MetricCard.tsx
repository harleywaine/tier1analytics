import './MetricCard.css'

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
}

export default function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <div className="metric-card">
      <h3 className="metric-title">{title}</h3>
      <div className="metric-value">{value}</div>
      {description && <p className="metric-description">{description}</p>}
    </div>
  )
}

