import { NextRequest, NextResponse } from 'next/server'
import { getUserMetrics } from '@/lib/metrics'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (limit < 1 || limit > 200) {
      return NextResponse.json(
        { error: 'Limit must be between 1 and 200' },
        { status: 400 }
      )
    }

    if (offset < 0) {
      return NextResponse.json(
        { error: 'Offset must be >= 0' },
        { status: 400 }
      )
    }

    const result = await getUserMetrics(limit, offset)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching user metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user metrics' },
      { status: 500 }
    )
  }
}

