import type { NextApiRequest, NextApiResponse } from 'next'
import { searchFlights } from '../../src/lib/flight-search'
// Preserve the old parameter names while using the same validated search contract.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Nur GET wird unterstützt.' }) }
  const { from, to, departure, ...rest } = req.query
  const result = await searchFlights({ ...rest, origin: from, destination: to, date: departure })
  return res.status(result.status).json(result.body)
}
