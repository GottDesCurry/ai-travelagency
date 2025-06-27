// /pages/api/search-flights.ts – Beta-Version mit RAPID API
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

const RAPID_API_KEY = process.env.RAPIDAPI_KEY || ''
const RAPID_API_HOST = 'booking-com18.p.rapidapi.com'
const RAPID_API_URL = `https://${RAPID_API_HOST}`

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { from, to, departure } = req.query

  if (!from || !to || !departure) {
    return res.status(400).json({ error: 'Fehlende Parameter: from, to oder departure' })
  }

  try {
    const response = await axios.get(`${RAPID_API_URL}/flights/search-oneway`, {
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': RAPID_API_HOST
      },
      params: {
        from: from.toString(),
        to: to.toString(),
        date: departure.toString(),
        adults: '1',
        cabinClass: 'ECONOMY'
      }
    })

    if (!response.data?.data || response.data.data.length === 0) {
      return res.status(404).json({ error: 'Keine Flüge gefunden' })
    }

    const topFlights = response.data.data.slice(0, 5).map((flight: any) => ({
      airline: flight.airline.name,
      airlineCode: flight.airline.code,
      departure: {
        iataCode: flight.departureAirport.code,
        at: flight.departureTime
      },
      arrival: {
        iataCode: flight.arrivalAirport.code,
        at: flight.arrivalTime
      },
      duration: flight.duration,
      stops: flight.stops,
      price: flight.price.amount,
      currency: flight.price.currency,
      bookingLink: flight.bookingLink
    }))

    res.status(200).json(topFlights)
  } catch (error: any) {
    console.error('❌ Fehler in /api/search-flights:', error?.response?.data || error.message)
    res.status(500).json({ error: 'Interner Fehler bei der Flugsuche' })
  }
}
