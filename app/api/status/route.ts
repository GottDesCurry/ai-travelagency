import { NextResponse } from 'next/server'
import { serviceStatus } from '@/lib/service-status'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json(serviceStatus(), { headers: { 'Cache-Control': 'no-store' } })
}
