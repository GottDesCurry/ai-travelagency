import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end('Method Not Allowed')

  const { from, to, departure } = JSON.parse(req.body)

  try {
    const response = await fetch(
      `https://booking-com.p.rapidapi.com/v1/flights/search-airport-codes?query=${from}`,
      {
        method: 'GET',
        headers: {
          'X-RapidAPI-Key': process.env.RAPIDAPI_KEY!,
          'X-RapidAPI-Host': 'booking-com.p.rapidapi.com',
        },
      }
    )

    const data = await response.json()

    // Hier später: weitere Endpoints nutzen für echte Flugsuche
    res.status(200).json(data)
  } catch (error) {
    console.error('Fehler bei API-Anfrage:', error)
    res.status(500).json({ error: 'Interner Serverfehler bei Flugabfrage' })
  }
}
