import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { normalizeHotelOffers } from '../../src/lib/hotel-offers'
import { validAdults, validateTravelDates } from '../../src/lib/trip-search'
const API_HOST = 'booking-com18.p.rapidapi.com'
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Nur GET wird unterstützt.' }) }
  const { city, checkin, checkout, adults = '1' } = req.query
  const dateError = validateTravelDates(checkin, checkout, true)
  if (typeof city !== 'string' || !city.trim() || !validAdults(adults) || dateError) return res.status(400).json({ error: dateError || 'Eine Stadt und 1–9 Erwachsene sind erforderlich.' })
  if (!process.env.RAPIDAPI_KEY) return res.status(503).json({ error: 'Die Hotelsuche ist noch nicht konfiguriert.' })
  const options = { timeout: 15000, headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 'X-RapidAPI-Host': API_HOST } }
  try {
    const locationRes = await axios.get(`https://${API_HOST}/stays/auto-complete`, { ...options, params: { query: city.trim() } })
    if (!Array.isArray(locationRes.data)) throw new Error('Unexpected location response')
    const locationId = locationRes.data[0]?.id
    if (!locationId) return res.status(404).json({ error: 'Kein Hotel-Ort gefunden.' })
    const hotelRes = await axios.get(`https://${API_HOST}/stays/search`, { ...options, params: { location_id: locationId, checkin_date: checkin, checkout_date: checkout, adults_number: adults, room_number: '1', locale: 'de', currency: 'CHF', order_by: 'popularity' } })
    return res.status(200).json({ city: city.trim(), results: normalizeHotelOffers(hotelRes.data) })
  } catch {
    return res.status(502).json({ error: 'Der Hotelanbieter hat keine gültige Antwort geliefert. Bitte später erneut versuchen.' })
  }
}
