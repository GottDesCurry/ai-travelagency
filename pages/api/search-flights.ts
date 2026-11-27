import type { NextApiRequest, NextApiResponse } from 'next'
import { searchFlights } from '../../src/lib/flight-search'
import { allowRequest, pagesClient, RATE_LIMIT_MESSAGE } from '../../src/lib/rate-limit'
// Preserve the old parameter names while using the same validated search contract.
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Nur GET wird unterstützt.' }) }
  if (!allowRequest('provider', pagesClient(req))) return res.status(429).json({ error: RATE_LIMIT_MESSAGE })
  const { from, to, departure, ...rest } = req.query
  const result = await searchFlights({ ...rest, origin: from, destination: to, date: departure })
  return res.status(result.status).json(result.body)
}
