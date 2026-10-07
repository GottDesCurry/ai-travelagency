import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { normalizeFlightOffers } from '../../src/lib/flight-offers'

import { validateTravelDates } from '../../src/lib/trip-search'

const API_HOST = 'booking-com18.p.rapidapi.com'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Nur GET wird unterstützt.' }) }
  const { origin, destination, date, returnDate, adults = '1', provider } = req.query
  if (provider !== undefined && provider !== 'booking') return res.status(400).json({ error: 'Nur der Provider booking wird unterstützt.' })
  if (typeof origin !== 'string' || typeof destination !== 'string' || typeof date !== 'string' || (returnDate !== undefined && typeof returnDate !== 'string') || typeof adults !== 'string' || !/^\d+$/.test(adults) || Number(adults) < 1 || Number(adults) > 9) {
    return res.status(400).json({ error: 'origin, destination, date und eine gültige Personenzahl sind erforderlich.' })
  }
  const dateError = validateTravelDates(date, returnDate)
  if (dateError) return res.status(400).json({ error: dateError })
  if (!process.env.RAPIDAPI_KEY) return res.status(503).json({ error: 'Die Flugsuche ist noch nicht konfiguriert.' })
  try {
    const response = await axios.get(`https://${API_HOST}/flights/search`, {
      timeout: 15000,
      headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 'X-RapidAPI-Host': API_HOST },
      params: { fromId: origin, toId: destination, departDate: date, returnDate: returnDate || '', adults, cabinClass: 'ECONOMY', currency: 'CHF' }
    })
    return res.status(200).json(normalizeFlightOffers(response.data, Boolean(returnDate)))
  } catch {
    return res.status(502).json({ error: 'Der Fluganbieter hat keine gültige Antwort geliefert. Bitte später erneut versuchen.' })
  }
}
