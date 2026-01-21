'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import {
  ChartLineUp,
  TrendUp,
  Heart,
  Play,
  Users,
  SignOut,
  List,
  X,
  CaretLeft,
  CaretRight,
} from 'phosphor-react'
import { useSidebar } from './SidebarContext'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ size?: number; weight?: string; className?: string }>
}

const navigation: NavItem[] = [
  { name: 'Overview', href: '/dashboard', icon: ChartLineUp },
  { name: 'Growth', href: '/dashboard/growth', icon: TrendUp },
  { name: 'Engagement', href: '/dashboard/engagement', icon: Heart },
  { name: 'Sessions', href: '/dashboard/sessions', icon: Play },
  { name: 'Users', href: '/dashboard/users', icon: Users },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { isCollapsed, setIsCollapsed } = useSidebar()

  const handleLogout = () => {
    sessionStorage.removeItem('dashboard_auth')
    router.push('/dashboard/login')
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="btn-secondary p-3"
          aria-label="Toggle menu"
        >
          {isMobileOpen ? (
            <X size={24} weight="regular" />
          ) : (
            <List size={24} weight="regular" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-70 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-secondary border-r border-card z-40
          transform transition-all duration-300 ease-in-out
          lg:translate-x-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'w-20' : 'w-64'}
        `}
      >
        <div className="flex flex-col h-full">
          {/* Logo/Brand */}
          <div className="px-6 py-6 border-b border-card flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex-1">
                <h1 className="text-heading text-2xl text-primary">Tier1 Analytics</h1>
                <p className="text-sm text-secondary mt-1">Metrics Dashboard</p>
              </div>
            )}
            {isCollapsed && (
              <div className="w-full flex justify-center">
                <div className="w-8 h-8 rounded-input bg-accent-primary-bg flex items-center justify-center">
                  <span className="text-primary font-light text-sm">T1</span>
                </div>
              </div>
            )}
            {/* Collapse Toggle Button - Desktop only */}
            <button
              onClick={toggleCollapse}
              className="hidden lg:flex items-center justify-center w-8 h-8 rounded-input hover:bg-accent-primary-bg transition-colors text-secondary hover:text-primary ml-2"
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <CaretRight size={20} weight="regular" />
              ) : (
                <CaretLeft size={20} weight="regular" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/dashboard' && pathname.startsWith(item.href + '/'))
              const Icon = item.icon

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-input transition-all duration-200 group
                    ${
                      isActive
                        ? 'bg-accent-primary-bg border border-accent-primary-border text-primary shadow-glow-primary'
                        : 'text-secondary hover:bg-accent-primary-bg hover:text-primary border border-transparent'
                    }
                    ${isCollapsed ? 'justify-center px-3' : ''}
                  `}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon
                    size={20}
                    weight={isActive ? 'fill' : 'regular'}
                    className={`flex-shrink-0 ${isActive ? 'text-accent-secondary' : ''}`}
                  />
                  {!isCollapsed && (
                    <span className="text-sm font-light whitespace-nowrap">{item.name}</span>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* Logout Button */}
          <div className="px-4 py-4 border-t border-card">
            <button
              onClick={handleLogout}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-input text-secondary hover:bg-button-danger-bg hover:text-button-danger-text border border-transparent hover:border-theme-red transition-all duration-200
                ${isCollapsed ? 'justify-center px-3' : ''}
              `}
              title={isCollapsed ? 'Sign Out' : undefined}
            >
              <SignOut size={20} weight="regular" className="flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-light">Sign Out</span>}
            </button>
          </div>

          {/* Footer */}
          {!isCollapsed && (
            <div className="px-6 py-4 border-t border-card">
              <p className="text-xs text-tertiary text-center">
                © {new Date().getFullYear()} Tier1
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
