// src/app/api/hotels-location/route.ts – Korrigiert mit NextResponse
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')

  if (!name) {
    return NextResponse.json({ error: '❌ city name fehlt' }, { status: 400 })
  }

  try {
    const response = await fetch(`https://booking-com.p.rapidapi.com/v1/hotels/locations?name=${name}&locale=de`, {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': process.env.RAPIDAPI_KEY || '',
        'X-RapidAPI-Host': 'booking-com.p.rapidapi.com'
      }
    })

    if (!response.ok) {
      console.error('❌ Fehler bei Hotels-Location:', response.statusText)
      return NextResponse.json({ error: 'Fehler bei der Ortssuche' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json(data?.[0] || {}, { status: 200 })
  } catch (err: any) {
    console.error('❌ Serverfehler in hotels-location:', err)
    return NextResponse.json({ error: 'Serverfehler bei Ortssuche' }, { status: 500 })
  }
}
