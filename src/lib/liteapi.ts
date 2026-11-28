import axios from 'axios'
import { httpsBookingLink, record } from './flight-offers'
import type { HotelOffer } from './hotel-offers'

// Nuitée (LiteAPI) hotel rates, sandbox only (see sandbox-providers.ts). Search only, no booking.
// The response schema is taken from the docs and still needs a live sandbox check (npm run live-check).
const BASE = 'https://api.liteapi.travel/v3.0'
const MAX_HOTELS = 20

export interface LiteQuery { cityName: string; countryCode: string; checkin: string; checkout: string; adults: number }

export function liteRequestBody(query: LiteQuery) {
  return {
    cityName: query.cityName, countryCode: query.countryCode, checkin: query.checkin, checkout: query.checkout,
    currency: 'CHF', guestNationality: 'CH', occupancies: [{ adults: query.adults }],
    timeout: 10, limit: MAX_HOTELS, maxRatesPerHotel: 1,
  }
}

function amountOf(value: unknown): { amount: number; currency: string } | null {
  const item = record(Array.isArray(value) ? value[0] : value)
  return typeof item.amount === 'number' && Number.isFinite(item.amount) && item.amount >= 0 && typeof item.currency === 'string' && /^[A-Z]{3}$/.test(item.currency)
    ? { amount: item.amount, currency: item.currency } : null
}

/** Cheapest offer per hotel; hotels without a name in the response are dropped rather than invented. */
export function normalizeLiteHotels(payload: unknown): HotelOffer[] {
  const body = record(payload)
  if (!Array.isArray(body.data)) throw new Error('Unexpected LiteAPI response')
  const details = new Map<string, Record<string, unknown>>()
  for (const raw of Array.isArray(body.hotels) ? body.hotels : []) {
    const hotel = record(raw)
    if (typeof hotel.id === 'string') details.set(hotel.id, hotel)
  }
  const result: HotelOffer[] = []
  for (const raw of body.data) {
    const entry = record(raw)
    if (typeof entry.hotelId !== 'string') continue
    const info = details.get(entry.hotelId) ?? {}
    const name = typeof info.name === 'string' ? info.name.trim() : ''
    if (!name) continue
    let best: { amount: number; currency: string } | null = null
    for (const roomType of Array.isArray(entry.roomTypes) ? entry.roomTypes : []) {
      const price = amountOf(record(roomType).offerRetailRate)
      if (price && (!best || price.amount < best.amount)) best = price
    }
    const rating = typeof info.rating === 'number' && Number.isFinite(info.rating) ? `Bewertung ${info.rating}` : ''
    const photo = httpsBookingLink(info.main_photo)
    result.push({
      id: entry.hotelId, name, address: typeof info.address === 'string' ? info.address : '', rating,
      price: best ? best.amount : null, currency: best ? best.currency : 'CHF',
      ...(photo ? { photo } : {}), testData: true,
    })
  }
  return result.slice(0, MAX_HOTELS)
}

export async function searchLiteHotels(key: string, query: LiteQuery): Promise<HotelOffer[]> {
  const response = await axios.post(`${BASE}/hotels/rates`, liteRequestBody(query), {
    timeout: 20000,
    headers: { 'X-API-Key': key, Accept: 'application/json', 'Content-Type': 'application/json' },
  })
  return normalizeLiteHotels(response.data)
}
