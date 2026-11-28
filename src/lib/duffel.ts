import axios from 'axios'
import { record, type FlightLeg, type FlightOffer, type FlightSegment } from './flight-offers'

// Duffel Flights API, test mode only (see sandbox-providers.ts). Search only: Duffel offers
// have no booking link; booking would need a separate order step with passenger data.
const BASE = 'https://api.duffel.com'
const MAX_OFFERS = 50

export interface DuffelQuery { origin: string; destination: string; date: string; returnDate?: string; adults: number }

export function duffelRequestBody(query: DuffelQuery) {
  const slices = [{ origin: query.origin, destination: query.destination, departure_date: query.date }]
  if (query.returnDate) slices.push({ origin: query.destination, destination: query.origin, departure_date: query.returnDate })
  return { data: { slices, passengers: Array.from({ length: query.adults }, () => ({ type: 'adult' })), cabin_class: 'economy' } }
}

function iata(value: unknown): string | null {
  const code = record(value).iata_code
  return typeof code === 'string' && /^[A-Z]{3}$/.test(code) ? code : null
}
function time(value: unknown): string | null {
  return typeof value === 'string' && Number.isFinite(Date.parse(value)) ? value : null
}

function leg(value: unknown, fallbackAirline: { name: string; code: string }): FlightLeg | null {
  const slice = record(value)
  if (!Array.isArray(slice.segments) || !slice.segments.length) return null
  const segments: FlightSegment[] = []
  for (const raw of slice.segments) {
    const s = record(raw), from = iata(s.origin), to = iata(s.destination), dep = time(s.departing_at), arr = time(s.arriving_at)
    if (!from || !to || !dep || !arr) return null
    const carrier = record(s.marketing_carrier).iata_code
    segments.push({ departure: { iataCode: from, at: dep }, arrival: { iataCode: to, at: arr }, airlineCode: typeof carrier === 'string' ? carrier : '' })
  }
  const first = record(record(slice.segments[0]).marketing_carrier)
  return {
    duration: typeof slice.duration === 'string' ? slice.duration : '',
    stops: segments.length - 1,
    departure: segments[0].departure,
    arrival: segments[segments.length - 1].arrival,
    airline: typeof first.name === 'string' && first.name ? first.name : fallbackAirline.name,
    airlineCode: segments[0].airlineCode || fallbackAirline.code,
    segments,
  }
}

/** Maps a Duffel offer request response to our offers. Offers that do not match the search are dropped. */
export function normalizeDuffelOffers(payload: unknown, roundTrip: boolean): FlightOffer[] {
  const offers = record(record(payload).data).offers
  if (!Array.isArray(offers)) throw new Error('Unexpected Duffel response')
  const result: FlightOffer[] = []
  for (const raw of offers) {
    const o = record(raw), owner = record(o.owner)
    const price = typeof o.total_amount === 'string' ? Number(o.total_amount) : NaN
    if (typeof o.id !== 'string' || !o.id || !Number.isFinite(price) || price < 0 || typeof o.total_currency !== 'string' || !/^[A-Z]{3}$/.test(o.total_currency)) continue
    if (!Array.isArray(o.slices) || o.slices.length !== (roundTrip ? 2 : 1)) continue
    const airline = { name: typeof owner.name === 'string' ? owner.name : '', code: typeof owner.iata_code === 'string' ? owner.iata_code : '' }
    const outbound = leg(o.slices[0], airline)
    const inbound = roundTrip ? leg(o.slices[1], airline) : null
    if (!outbound || (roundTrip && !inbound)) continue
    result.push({
      id: o.id, price, currency: o.total_currency,
      duration: outbound.duration, stops: outbound.stops, departure: outbound.departure, arrival: outbound.arrival,
      airline: airline.name || outbound.airline, airlineCode: airline.code || outbound.airlineCode,
      outboundLeg: outbound, ...(inbound ? { returnLeg: inbound } : {}),
      testData: true,
    })
  }
  return result.sort((a, b) => a.price - b.price).slice(0, MAX_OFFERS)
}

export async function searchDuffel(token: string, query: DuffelQuery): Promise<FlightOffer[]> {
  const response = await axios.post(`${BASE}/air/offer_requests`, duffelRequestBody(query), {
    timeout: 20000,
    params: { return_offers: true, supplier_timeout: 15000 },
    headers: { Authorization: `Bearer ${token}`, 'Duffel-Version': 'v2', Accept: 'application/json', 'Content-Type': 'application/json' },
  })
  return normalizeDuffelOffers(response.data, Boolean(query.returnDate))
}
