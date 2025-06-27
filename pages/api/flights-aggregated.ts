import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { origin, destination, date } = req.query

  if (!origin || !destination || !date) {
    return res.status(400).json({ error: 'Fehlende Parameter: origin, destination, date' })
  }

  try {
    const [amadeusRes, bookingRes] = await Promise.allSettled([
      fetch(`http://localhost:3000/api/flights?origin=${origin}&destination=${destination}&date=${date}`),
      fetch(`http://localhost:3000/api/flights-booking?origin=${origin}&destination=${destination}&date=${date}`)
    ])

    const results: any[] = []

    if (amadeusRes.status === 'fulfilled') {
      const data = await amadeusRes.value.json()
      if (Array.isArray(data)) results.push(...data)
    }

    if (bookingRes.status === 'fulfilled') {
      const data = await bookingRes.value.json()
      if (Array.isArray(data)) results.push(...data)
    }

    res.status(200).json(results)
  } catch (err: any) {
    console.error('Fehler bei der aggregierten Flugsuche:', err)
    res.status(500).json({ error: 'Fehler beim Abrufen der aggregierten Flüge' })
  }
}
