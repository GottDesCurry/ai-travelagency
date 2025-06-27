import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import OpenAI from 'openai'
import { getAccessToken } from '@/lib/amadeus'
import { getCorrectedCity } from './ai-correct-city'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

type FlightOffer = {
  id: string
  price: string
  currency: string
  departure: {
    iataCode: string
    at: string
  }
  arrival: {
    iataCode: string
    at: string
  }
  duration: string
  stops: number
  airline: string
  bookingLink?: string
}

const reduceFlightData = (offers: any[]): FlightOffer[] => {
  return offers?.slice(0, 15).map((offer: any): FlightOffer => {
    const itinerary = offer.itineraries[0]
    const segment = itinerary.segments[0]
    return {
      id: offer.id,
      price: offer.price.total,
      currency: offer.price.currency,
      departure: {
        iataCode: segment.departure.iataCode,
        at: segment.departure.at,
      },
      arrival: {
        iataCode: segment.arrival.iataCode,
        at: segment.arrival.at,
      },
      duration: itinerary.duration,
      stops: itinerary.segments.length - 1,
      airline: segment.carrierCode,
      bookingLink:
        offer?.links?.[0]?.href ||
        `https://www.google.com/flights?hl=de#flt=${segment.departure.iataCode}.${segment.arrival.iataCode}.${offer.lastTicketingDate};c:CHF;e:1;sd:1;t:f`,
    }
  }) || []
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { origin, destination, date, adults = '1' } = req.query

  if (
    !origin ||
    !destination ||
    !date ||
    typeof origin !== 'string' ||
    typeof destination !== 'string'
  ) {
    return res
      .status(400)
      .json({ error: 'Fehlende oder ungültige Parameter: origin, destination oder date' })
  }

  const adultsInt = parseInt(adults as string)
  if (isNaN(adultsInt) || adultsInt < 1) {
    return res.status(400).json({ error: 'Ungültige Anzahl an Erwachsenen' })
  }

  try {
    const [correctedOrigin, correctedDestination] = await Promise.all([
      getCorrectedCity(origin),
      getCorrectedCity(destination),
    ])

    const token = await getAccessToken()
    const response = await axios.get(
      'https://test.api.amadeus.com/v2/shopping/flight-offers',
      {
        params: {
          originLocationCode: correctedOrigin,
          destinationLocationCode: correctedDestination,
          departureDate: date,
          adults: adultsInt,
          max: 20,
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    )

    const reducedFlights = reduceFlightData(response.data.data)

    const prompt = `Wähle aus diesen Flugangeboten die 3 besten aus. Kriterien: Günstigster Preis, gute Flugzeiten, möglichst wenig Stopps. Antworte im JSON-Array mit den besten 3 Flügen:\n\n${JSON.stringify(
      reducedFlights
    )}`

    const chat = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Du bist ein intelligenter Reiseberater.' },
        { role: 'user', content: prompt },
      ],
    })

    const resultText = chat.choices[0].message.content || '[]'
    try {
      res.status(200).json(JSON.parse(resultText))
    } catch {
      res.status(200).json([])
    }
  } catch (err: any) {
    console.error('Flug-Suche fehlgeschlagen:', err.response?.data || err.message)
    res.status(500).json({ error: 'Fehler beim Abrufen der Flüge' })
  }
}
