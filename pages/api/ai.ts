import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

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
  const flightData = req.body

  const reducedFlights = reduceFlightData(flightData)
  const prompt = `Wähle aus diesen Flugangeboten die 3 besten aus. Kriterien: Günstigster Preis, gute Flugzeiten, möglichst wenig Stopps. Antworte im JSON-Array mit den besten 3 Flügen:\n\n${JSON.stringify(reducedFlights)}`

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: 'system', content: 'Du bist ein intelligenter Reiseberater.' },
        { role: 'user', content: prompt }
      ]
    })

    const output = response.choices[0].message.content || '[]'
    try {
  res.status(200).json(JSON.parse(output))
} catch {
  res.status(200).json([])
}
  } catch (e) {
    console.error('Fehler bei der Verarbeitung in /api/ai:', e)
    res.status(500).json([])
  }
}
