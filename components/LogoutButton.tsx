'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import './LogoutButton.css'

export default function LogoutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLogout = async () => {
    setLoading(true)
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      })
      router.push('/login')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="logout-button"
      disabled={loading}
    >
      {loading ? 'Signing out...' : 'Sign Out'}
    </button>
  )
}

