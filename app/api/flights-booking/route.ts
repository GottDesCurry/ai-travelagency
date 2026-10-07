import { NextRequest, NextResponse } from 'next/server'
import { searchFlights } from '@/lib/flight-search'
// Legacy endpoint: search only, never a booking operation.
export async function POST(req: NextRequest) {
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Ungültiges JSON.' }, { status: 400 }) }
  if (!body || typeof body !== 'object' || Array.isArray(body)) return NextResponse.json({ error: 'Ein Suchobjekt wird erwartet.' }, { status: 400 })
  const result = await searchFlights({ ...body, adults: typeof body.adults === 'number' ? String(body.adults) : body.adults })
  return NextResponse.json(result.body, { status: result.status })
}
