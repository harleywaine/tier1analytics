import { NextRequest, NextResponse } from 'next/server'
import { validateCredentials } from '@/lib/auth'

const SESSION_COOKIE_NAME = 'tier1_analytics_session'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }

    // Check if credentials are configured
    const validUsername = process.env.BASIC_AUTH_USERNAME
    const validPassword = process.env.BASIC_AUTH_PASSWORD

    if (!validUsername || !validPassword) {
      console.error('Authentication credentials not configured. Please set BASIC_AUTH_USERNAME and BASIC_AUTH_PASSWORD in .env.local')
      return NextResponse.json(
        { error: 'Server configuration error. Please contact administrator.' },
        { status: 500 }
      )
    }

    if (!validateCredentials(username, password)) {
      console.log('Login attempt failed for username:', username)
      return NextResponse.json(
        { error: 'Invalid username or password' },
        { status: 401 }
      )
    }

    // Create response with session cookie
    const response = NextResponse.json({ success: true })
    response.cookies.set(SESSION_COOKIE_NAME, 'authenticated', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

