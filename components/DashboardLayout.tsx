import Link from 'next/link'
import LogoutButton from './LogoutButton'
import './DashboardLayout.css'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Tier1 Analytics</h2>
        </div>
        <nav className="sidebar-nav">
          <Link href="/" className="nav-link">
            Overview
          </Link>
          <Link href="/users" className="nav-link">
            Users
          </Link>
          <Link href="/play-history" className="nav-link">
            Play History
          </Link>
          <Link href="/sessions" className="nav-link">
            Sessions
          </Link>
          <Link href="/favorites" className="nav-link">
            Favorites
          </Link>
          <Link href="/feedback" className="nav-link">
            Feedback
          </Link>
        </nav>
        <div className="sidebar-footer">
          <LogoutButton />
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

