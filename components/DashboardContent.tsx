'use client'

import { useSidebar } from './SidebarContext'
import { useEffect, useState } from 'react'

export default function DashboardContent({ children }: { children: React.ReactNode }) {
  const { sidebarWidth } = useSidebar()
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const checkDesktop = () => {
      setIsDesktop(window.innerWidth >= 1024)
    }
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  return (
    <div
      className="flex-1 transition-all duration-300"
      style={isDesktop ? { marginLeft: sidebarWidth } : {}}
    >
      {children}
    </div>
  )
}
