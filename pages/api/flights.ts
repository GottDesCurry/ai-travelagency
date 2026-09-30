import type { NextApiRequest, NextApiResponse } from 'next'
import { searchFlights } from '../../src/lib/search-provider'
import { SearchError } from '../../src/lib/travel'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ error: 'Nur GET wird unterstützt.' })
  }
  try { return res.status(200).json(await searchFlights(req.query)) }
  catch (error) {
    return res.status(error instanceof SearchError ? error.status : 500).json({ error: error instanceof SearchError ? error.message : 'Die Flugsuche ist vorübergehend nicht verfügbar.' })
  }
}
