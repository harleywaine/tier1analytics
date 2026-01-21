import Link from 'next/link'
import './DataTable.css'
import { format } from 'date-fns'

interface Column {
  key: string
  label: string
}

interface DataTableProps {
  data: Record<string, any>[]
  columns: Column[]
  currentPage: number
  totalCount: number
  limit: number
  basePath: string
}

export default function DataTable({
  data,
  columns,
  currentPage,
  totalCount,
  limit,
  basePath,
}: DataTableProps) {
  const totalPages = Math.ceil(totalCount / limit)
  const hasNextPage = currentPage < totalPages
  const hasPrevPage = currentPage > 1

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return '-'
    if (typeof value === 'boolean') return value ? 'Yes' : 'No'
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      try {
        return format(new Date(value), 'MMM dd, yyyy HH:mm')
      } catch {
        return value
      }
    }
    if (typeof value === 'object') return JSON.stringify(value)
    return String(value)
  }

  return (
    <div className="data-table-container">
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key}>{column.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="empty-state">
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr key={row.id || index}>
                  {columns.map((column) => (
                    <td key={column.key}>
                      <div className="cell-content">
                        {formatValue(row[column.key])}
                      </div>
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <Link
            href={`${basePath}?page=${currentPage - 1}`}
            className={`pagination-button ${!hasPrevPage ? 'disabled' : ''}`}
            aria-disabled={!hasPrevPage}
          >
            Previous
          </Link>
          <span className="pagination-info">
            Page {currentPage} of {totalPages} ({totalCount.toLocaleString()} total)
          </span>
          <Link
            href={`${basePath}?page=${currentPage + 1}`}
            className={`pagination-button ${!hasNextPage ? 'disabled' : ''}`}
            aria-disabled={!hasNextPage}
          >
            Next
          </Link>
        </div>
      )}
    </div>
  )
}

