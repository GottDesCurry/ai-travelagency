'use client'

import { NextRequest } from 'next/server'

export async function GET(req: NextRequest) {
  const url = new URL(req.url)
  const query = url.searchParams.get('query')

  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing query parameter' }), { status: 400 })
  }

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'booking-com15.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPIDAPI_KEY || ''
    }
  }

  const searchURL = `https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlightLocation?query=${encodeURIComponent(query)}`

  try {
    const res = await fetch(searchURL, options)
    const json = await res.json()

    if (!json.locations || !Array.isArray(json.locations)) {
      return new Response(JSON.stringify({ error: 'Invalid response format from API' }), { status: 500 })
    }

    const matched = json.locations.find((loc: any) => loc.id && loc.id.includes('AIRPORT'))
    if (!matched) {
      return new Response(JSON.stringify({ error: 'No valid airport location found' }), { status: 404 })
    }

    return new Response(JSON.stringify({ id: matched.id }), { status: 200 })
  } catch (err: any) {
    console.error('Booking Location API Error:', err)
    return new Response(JSON.stringify({ error: 'Failed to fetch location' }), { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { origin, destination, date } = body

  if (!origin || !destination || !date) {
    return new Response(JSON.stringify({ error: 'Missing origin, destination, or date' }), { status: 400 })
  }

  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-host': 'booking-com15.p.rapidapi.com',
      'x-rapidapi-key': process.env.RAPIDAPI_KEY || ''
    }
  }

  const locationURL = (query: string) =>
    `https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlightLocation?query=${encodeURIComponent(query)}`

  const fetchLocationId = async (query: string) => {
    const res = await fetch(locationURL(query), options)
    const json = await res.json()
    const match = json?.locations?.find((loc: any) => loc?.id?.includes('AIRPORT'))
    return match?.id || null
  }

  const fromId = await fetchLocationId(origin)
  const toId = await fetchLocationId(destination)

  if (!fromId || !toId) {
    return new Response(JSON.stringify({ error: 'Could not resolve airport locations' }), { status: 404 })
  }

  const urlSearch = `https://booking-com15.p.rapidapi.com/api/v1/flights/searchFlights?fromId=${fromId}&toId=${toId}&date=${date}&stops=none&pageNo=1&adults=1&sort=BEST&cabinClass=ECONOMY&currency_code=CHF`

  try {
    const res = await fetch(urlSearch, options)
    const json = await res.json()

    const flights = json?.flights?.map((flight: any, index: number) => ({
      id: `booking-${index}`,
      departure: {
        iataCode: flight?.origin_info?.code,
        at: flight?.departure_time
      },
      arrival: {
        iataCode: flight?.destination_info?.code,
        at: flight?.arrival_time
      },
      duration: flight?.duration,
      stops: flight?.stops?.length || 0,
      airline: flight?.airline_name,
      price: flight?.price_detail?.base?.value,
      currency: flight?.price_detail?.base?.currency,
      bookingLink: flight?.deep_link
    })) || []

    return new Response(JSON.stringify(flights), { status: 200 })
  } catch (err: any) {
    console.error('Booking Flights API Error:', err)
    return new Response(JSON.stringify([]), { status: 500 })
  }
}
