import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

function checkBasicAuth(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return false
  }

  try {
    const base64Credentials = authHeader.split(' ')[1]
    const credentials = atob(base64Credentials)
    const [username, password] = credentials.split(':')

    const validUsername = process.env.DASHBOARD_USER
    const validPassword = process.env.DASHBOARD_PASS

    if (!validUsername || !validPassword) {
      console.error('Dashboard credentials not configured. Please set DASHBOARD_USER and DASHBOARD_PASS')
      return false
    }

    return username === validUsername && password === validPassword
  } catch (error) {
    console.error('Error parsing Basic Auth:', error)
    return false
  }
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const isDashboardRoute = pathname === '/dashboard' || pathname.startsWith('/dashboard/')
  const isMetricsApiRoute = pathname.startsWith('/api/metrics/')
  const isLoginPage = pathname === '/login'
  const isApiAuthRoute = pathname.startsWith('/api/auth/')
  const isRoot = pathname === '/'

  // Allow dashboard login page without auth
  const isDashboardLogin = pathname === '/dashboard/login'

  // Basic Auth for metrics API routes only
  // Dashboard page itself is a client component that handles auth client-side
  if (isMetricsApiRoute) {
    const validUsername = process.env.DASHBOARD_USER
    const validPassword = process.env.DASHBOARD_PASS

    if (!validUsername || !validPassword) {
      console.error('Dashboard credentials not configured. Please set DASHBOARD_USER and DASHBOARD_PASS in .env.local')
      return new NextResponse('Server configuration error: Dashboard credentials not set', {
        status: 500,
      })
    }

    if (!checkBasicAuth(request)) {
      return new NextResponse('Unauthorized', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Tier1 Metrics Dashboard"',
        },
      })
    }
    return NextResponse.next()
  }

  // Allow dashboard routes (they handle auth client-side)
  if (isDashboardRoute) {
    return NextResponse.next()
  }

  // Root path redirects to dashboard login
  if (isRoot) {
    return NextResponse.redirect(new URL('/dashboard/login', request.url))
  }

  // Session-based auth for other routes
  if (isLoginPage || isApiAuthRoute) {
    return NextResponse.next()
  }

  const sessionCookie = request.cookies.get('tier1_analytics_session')
  const isAuthenticated = sessionCookie?.value === 'authenticated'

  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

// Apply middleware to all routes except static files
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}

