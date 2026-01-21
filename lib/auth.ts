import { cookies } from 'next/headers'

const SESSION_COOKIE_NAME = 'tier1_analytics_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/**
 * Validate credentials against environment variables
 */
export function validateCredentials(username: string, password: string): boolean {
  const validUsername = process.env.BASIC_AUTH_USERNAME
  const validPassword = process.env.BASIC_AUTH_PASSWORD

  if (!validUsername || !validPassword) {
    return false
  }

  return username === validUsername && password === validPassword
}

/**
 * Create a session cookie
 */
export async function createSession() {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, 'authenticated', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })
}

/**
 * Check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE_NAME)
  return session?.value === 'authenticated'
}

/**
 * Destroy session (logout)
 */
export async function destroySession() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

