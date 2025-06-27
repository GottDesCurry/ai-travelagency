// /pages/api/flights.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

let accessToken: string | null = null
let tokenExpiry: number | null = null

async function getAccessToken(): Promise<string> {
  const now = Date.now()
  if (accessToken && tokenExpiry && now < tokenExpiry) {
    return accessToken
  }

  const tokenRes = await axios.post('https://test.api.amadeus.com/v1/security/oauth2/token',
    new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: process.env.AMADEUS_CLIENT_ID!,
      client_secret: process.env.AMADEUS_CLIENT_SECRET!
    }),
    {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }
  )

  accessToken = tokenRes.data.access_token
  tokenExpiry = now + tokenRes.data.expires_in * 1000 - 60_000 // 1 Min Puffer
  return accessToken
}

// In-Memory Cache für GPT-Korrekturen
const correctionCache = new Map<string, string>()

async function getCorrectedCity(input: string): Promise<string> {
  if (correctionCache.has(input)) {
    return correctionCache.get(input)!
  }

  const prompt = `Korrigiere die Eingabe zu einem internationalen Flughafencode (IATA) oder Stadtnamen. Berücksichtige Sprache, Schreibfehler und Synonyme. Gib nur den korrekten Stadtnamen oder Code zurück.\nEingabe: "${input}"`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Du bist ein smarter Reiseassistent, der Flughafencodes und Städtenamen erkennt, korrigiert und lokalisiert.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0
    })

    const corrected = completion.choices[0].message.content?.trim() || input
    correctionCache.set(input, corrected)
    return corrected
  } catch (err) {
    console.error('Fehler bei GPT-Korrektur:', err)
    return input
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { origin, destination, date, adults = '1' } = req.query

  if (!origin || !destination || !date || typeof origin !== 'string' || typeof destination !== 'string') {
    return res.status(400).json({ error: 'Fehlende oder ungültige Parameter: origin, destination oder date' })
  }

  const adultsInt = parseInt(adults as string)
  if (isNaN(adultsInt) || adultsInt < 1) {
    return res.status(400).json({ error: 'Ungültige Anzahl an Erwachsenen' })
  }

  try {
    const [correctedOrigin, correctedDestination] = await Promise.all([
      getCorrectedCity(origin),
      getCorrectedCity(destination)
    ])

    const token = await getAccessToken()
    const flightRes = await axios.get('https://test.api.amadeus.com/v2/shopping/flight-offers', {
      params: {
        originLocationCode: correctedOrigin,
        destinationLocationCode: correctedDestination,
        departureDate: date,
        adults: adultsInt,
        max: 20
      },
      headers: { Authorization: `Bearer ${token}` }
    })

    const results = flightRes.data?.data?.slice(0, 3).map((offer: any) => {
      const itinerary = offer.itineraries[0]
      const segment = itinerary.segments[0]
      return {
        id: offer.id,
        price: offer.price.total,
        currency: offer.price.currency,
        departure: {
          iataCode: segment.departure.iataCode,
          at: segment.departure.at
        },
        arrival: {
          iataCode: segment.arrival.iataCode,
          at: segment.arrival.at
        },
        duration: itinerary.duration,
        stops: itinerary.segments.length - 1,
        airline: segment.carrierCode,
        bookingLink: offer?.links?.[0]?.href || `https://www.google.com/flights?hl=de#flt=${segment.departure.iataCode}.${segment.arrival.iataCode}.${date};c:EUR;e:1;sd:1;t:f`
      }
    }) || []

    res.status(200).json({ from: correctedOrigin, to: correctedDestination, results })
  } catch (err: any) {
    console.error('Flug-Suche fehlgeschlagen:', err.response?.data || err.message)
    res.status(500).json({ error: 'Fehler beim Abrufen der Flüge' })
  }
}
