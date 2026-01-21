'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Create Basic Auth header
      const credentials = btoa(`${username}:${password}`)
      
      // Test authentication by calling the KPIs endpoint
      const response = await fetch('/api/metrics/kpis', {
        headers: {
          'Authorization': `Basic ${credentials}`,
        },
      })

      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid username or password')
        } else {
          setError('Authentication failed')
        }
        setLoading(false)
        return
      }

      // Store credentials in sessionStorage for subsequent requests
      sessionStorage.setItem('dashboard_auth', credentials)
      
      // Redirect to dashboard using full page navigation
      window.location.href = '/dashboard'
    } catch (err) {
      console.error('Login error:', err)
      setError('An error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="card max-w-md w-full animate-fade-in">
        <div className="text-center mb-8">
          <h1 className="text-heading text-4xl text-primary mb-2">Tier1 Metrics Dashboard</h1>
          <p className="text-secondary">Sign in to access analytics</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-button-danger-bg border border-theme-red text-button-danger-text px-4 py-3 rounded-input">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="username" className="text-label text-secondary mb-2 block">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="username"
              disabled={loading}
              className="input w-full"
            />
          </div>

          <div>
            <label htmlFor="password" className="text-label text-secondary mb-2 block">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={loading}
              className="input w-full"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
