import { NextResponse } from 'next/server'
import { getKpis } from '@/lib/metrics'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const kpis = await getKpis()
    return NextResponse.json(kpis)
  } catch (error) {
    console.error('Error fetching KPIs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch KPIs' },
      { status: 500 }
    )
  }
}

