import { NextRequest, NextResponse } from 'next/server'
import { getUserDetailMetrics } from '@/lib/metrics'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const userMetrics = await getUserDetailMetrics(userId)
    return NextResponse.json(userMetrics)
  } catch (error: any) {
    console.error('Error fetching user detail metrics:', error)
    if (error.message === 'User not found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to fetch user detail metrics' },
      { status: 500 }
    )
  }
}

