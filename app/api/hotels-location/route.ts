import { NextRequest, NextResponse } from 'next/server'
export async function GET(req: NextRequest): Promise<NextResponse> {
  const name = new URL(req.url).searchParams.get('name')?.trim()
  if (!name || name.length > 120) return NextResponse.json({ error: 'Bitte einen Ortsnamen mit maximal 120 Zeichen eingeben.' }, { status: 400 })
  if (!process.env.RAPIDAPI_KEY) return NextResponse.json({ error: 'Die Ortssuche ist noch nicht konfiguriert.' }, { status: 503 })
  try {
    const query = new URLSearchParams({ name, locale: 'de' })
    const response = await fetch(`https://booking-com.p.rapidapi.com/v1/hotels/locations?${query}`, {
      signal: AbortSignal.timeout(15000), cache: 'no-store',
      headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 'X-RapidAPI-Host': 'booking-com.p.rapidapi.com' }
    })
    if (!response.ok) throw new Error('Provider error')
    const data: unknown = await response.json()
    if (!Array.isArray(data)) throw new Error('Invalid provider response')
    if (!data.length) return NextResponse.json({ error: 'Kein Ort gefunden.' }, { status: 404 })
    if (!data[0] || typeof data[0] !== 'object' || typeof data[0].dest_id !== 'string' && typeof data[0].dest_id !== 'number') throw new Error('Invalid location')
    return NextResponse.json(data[0])
  } catch {
    return NextResponse.json({ error: 'Der Anbieter der Ortssuche ist derzeit nicht verfügbar.' }, { status: 502 })
  }
}
