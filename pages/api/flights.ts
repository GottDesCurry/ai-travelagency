import type { NextApiRequest, NextApiResponse } from 'next'
import { searchFlights } from '../../src/lib/flight-search'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Nur GET wird unterstützt.' }) }
  const result = await searchFlights(req.query)
  return res.status(result.status).json(result.body)
}
