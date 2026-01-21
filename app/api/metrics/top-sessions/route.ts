import { NextRequest, NextResponse } from 'next/server'
import { getTopSessions } from '@/lib/metrics'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '7', 10)
    const limit = parseInt(searchParams.get('limit') || '10', 10)

    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 365' },
        { status: 400 }
      )
    }

    if (limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 100' },
        { status: 400 }
      )
    }

    const topSessions = await getTopSessions(days, limit)
    return NextResponse.json(topSessions)
  } catch (error) {
    console.error('Error fetching top sessions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch top sessions' },
      { status: 500 }
    )
  }
}

