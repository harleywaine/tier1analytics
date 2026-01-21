import { NextRequest, NextResponse } from 'next/server'
import { getDailyMinutes } from '@/lib/metrics'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '14', 10)

    if (days < 1 || days > 365) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 365' },
        { status: 400 }
      )
    }

    const dailyMinutes = await getDailyMinutes(days)
    return NextResponse.json(dailyMinutes)
  } catch (error) {
    console.error('Error fetching daily minutes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily minutes' },
      { status: 500 }
    )
  }
}

