import { NextRequest, NextResponse } from 'next/server'

type Flight = {
  id?: string
  price?: number
  currency?: string
  duration?: string
  stops?: number
  departure?: object
  arrival?: object
  airline?: string
}

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.searchParams.get('origin')
  const destination = req.nextUrl.searchParams.get('destination')
  const date = req.nextUrl.searchParams.get('date')

  if (!origin || !destination || !date) {
    return NextResponse.json(
      { error: 'Fehlende Parameter: origin, destination, date' },
      { status: 400 }
    )
  }

  const results: Flight[] = []

  try {
    // Fallback auf Umgebungsvariable z. B. in .env.production
    const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')


    const kiwi = await fetch(...)
    const kiwiText = await kiwi.text()
    console.log("KIWI API Antwort:", kiwiText)

    let kiwiData = []
    try {
    kiwiData = JSON.parse(kiwiText)
    } catch (e) {
    console.error("KIWI JSON Fehler:", e)
    }

    const amadeus = await fetch(
      `${baseUrl}/api/flights?provider=amadeus&origin=${origin}&destination=${destination}&date=${date}`
    )
    const amadeusData = await amadeus.json()

    results.push(...kiwiData, ...amadeusData)

    return NextResponse.json(results)
  } catch (err) {
    console.error('Fehler in /api/flights-aggregated:', err)
    return NextResponse.json([], { status: 500 })
  }
}
