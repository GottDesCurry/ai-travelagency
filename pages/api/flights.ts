// pages/api/flights.ts – GPT-Auswertung der besten 3 Flüge (Booking-RapidAPI)
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import OpenAI from 'openai'

const API_HOST = 'booking-com18.p.rapidapi.com'
const BASE_URL = `https://${API_HOST}`
const RAPID_API_KEY = process.env.RAPIDAPI_KEY || ''
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

function reduceFlightData(data: any): any[] {
  return data?.data?.slice(0, 15).map((flight: any) => ({
    id: flight.id,
    price: flight?.price?.total,
    currency: flight?.price?.currency,
    duration: flight?.itineraries?.[0]?.duration,
    stops: flight?.itineraries?.[0]?.segments?.length - 1,
    departure: flight?.itineraries?.[0]?.segments?.[0]?.departure,
    arrival: flight?.itineraries?.[0]?.segments?.slice(-1)[0]?.arrival,
    airline: flight?.itineraries?.[0]?.segments?.[0]?.carrierCode
  })) || []
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { origin, destination, date, returnDate, adults = 1 } = req.query

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: 'origin, destination und date sind erforderlich' })
  }

  try {
    const response = await axios.get(`${BASE_URL}/flights/search`, {
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': API_HOST
      },
      params: {
        fromId: origin,
        toId: destination,
        departDate: date,
        returnDate: returnDate || '',
        adults: adults,
        cabinClass: 'ECONOMY',
        currency: 'CHF'
      }
    })

    const flightData = response.data
    const reduced = reduceFlightData(flightData)

    const prompt = `Wähle aus diesen Flugangeboten die 3 besten aus. Kriterien: Günstigster Preis, gute Flugzeiten, möglichst wenig Stopps. Antworte im JSON-Array mit den besten 3 Flügen:\n\n${JSON.stringify(reduced)}`

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Du bist ein intelligenter Reiseberater.' },
        { role: 'user', content: prompt }
      ]
    })

    const output = gptResponse.choices[0].message.content || '[]'

    try {
      res.status(200).json(JSON.parse(output))
    } catch {
      res.status(200).json([])
    }

  } catch (err: any) {
    console.error('Fehler bei der Flugsuche:', err?.response?.data || err.message)
    res.status(500).json({ error: 'Fehler bei der Flugsuche' })
  }
}
