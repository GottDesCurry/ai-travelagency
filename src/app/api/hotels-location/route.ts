// src/app/api/hotels-location/route.ts – Optimiert mit Lösung B
import { NextRequest } from 'next/server'
import type { NextResponse } from 'next/server'

export async function GET(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')

  if (!name) {
    return new Response(JSON.stringify({ error: '❌ city name fehlt' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    })
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
      return new Response(JSON.stringify({ error: 'Fehler bei der Ortssuche' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const data = await response.json()
    return new Response(JSON.stringify(data?.[0] || {}), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    console.error('❌ Serverfehler in hotels-location:', err)
    return new Response(JSON.stringify({ error: 'Serverfehler bei Ortssuche' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}
