// src/app/api/flights-booking/route.ts
import { NextRequest } from 'next/server'

const API_HOST = 'booking-com15.p.rapidapi.com'
const API_KEY = process.env.RAPIDAPI_KEY || ''
const BASE_URL = `https://${API_HOST}`

const headers = {
  'x-rapidapi-host': API_HOST,
  'x-rapidapi-key': API_KEY
}

async function fetchAirportId(query: string): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/v1/flights/searchFlightLocation?query=${encodeURIComponent(query)}`, { headers })
    const data = await res.json()
    const match = data?.locations?.find((loc: any) => loc?.id?.includes('AIRPORT'))
    return match?.id || null
  } catch (error) {
    console.error(`❌ Fehler bei Airport-Fetch (${query}):`, error)
    return null
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { origin, destination, date } = body

    if (!origin || !destination || !date) {
      return new Response(JSON.stringify({ error: 'origin, destination und date sind erforderlich.' }), { status: 400 })
    }

    const fromId = await fetchAirportId(origin)
    const toId = await fetchAirportId(destination)

    if (!fromId || !toId) {
      return new Response(JSON.stringify({ error: 'Konnte Flughafen nicht ermitteln' }), { status: 404 })
    }

    const url = `${BASE_URL}/api/v1/flights/searchFlights?fromId=${fromId}&toId=${toId}&date=${date}&stops=none&pageNo=1&adults=1&sort=BEST&cabinClass=ECONOMY&currency_code=CHF`

    const res = await fetch(url, { headers })
    const data = await res.json()

    const flights = (data?.flights || []).map((flight: any, index: number) => ({
      id: `booking-${index}`,
      departure: {
        iataCode: flight?.origin_info?.code,
        at: flight?.departure_time
      },
      arrival: {
        iataCode: flight?.destination_info?.code,
        at: flight?.arrival_time
      },
      duration: flight?.flight_duration,
      stops: flight?.stops || 0,
      airline: flight?.carrier_name,
      airlineCode: flight?.carrier_code,
      price: flight?.price,
      currency: flight?.currency,
      bookingLink: flight?.booking_link || ''
    }))

    return new Response(JSON.stringify(flights), { status: 200 })
  } catch (err) {
    console.error('❌ Fehler in /api/flights-booking:', err)
    return new Response(JSON.stringify({ error: 'Serverfehler bei der Flugsuche' }), { status: 500 })
  }
}
