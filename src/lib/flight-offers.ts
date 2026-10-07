export interface FlightOffer {
  id: string
  price: number
  currency: string
  duration: string
  stops: number
  departure: { iataCode: string; at: string }
  arrival: { iataCode: string; at: string }
  airline: string
  airlineCode: string
  bookingLink?: string
}

function record(value: unknown): Record<string, any> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, any> : {}
}
function airport(value: unknown) {
  const item = record(value)
  if (typeof item.iataCode !== 'string' || !/^[A-Z]{3}$/.test(item.iataCode) || typeof item.at !== 'string' || !Number.isFinite(Date.parse(item.at))) return null
  return { iataCode: item.iataCode, at: item.at }
}
export function httpsBookingLink(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined
  try { const url = new URL(value); return url.protocol === 'https:' && !url.username && !url.password ? url.href : undefined } catch { return undefined }
}
export function isFlightOffer(value: unknown): value is FlightOffer {
  const f = record(value)
  return typeof f.id === 'string' && f.id.length > 0 && typeof f.price === 'number' && Number.isFinite(f.price) && f.price >= 0 && typeof f.currency === 'string' && /^[A-Z]{3}$/.test(f.currency) && typeof f.duration === 'string' && Number.isInteger(f.stops) && f.stops >= 0 && !!airport(f.departure) && !!airport(f.arrival) && typeof f.airline === 'string' && typeof f.airlineCode === 'string' && (f.bookingLink === undefined || httpsBookingLink(f.bookingLink) !== undefined)
}
// Adapter for the itinerary-shaped payload currently used by Booking COM 18.
// Unknown upstream envelopes are errors, rather than successful empty searches.
export function normalizeFlightOffers(payload: unknown): FlightOffer[] {
  const data = record(payload).data
  if (!Array.isArray(data)) throw new Error('Unexpected flight provider response')
  const offers: FlightOffer[] = []
  const ids = new Set<string>()
  for (const raw of data.slice(0, 15)) {
    const f = record(raw), itinerary = record(f.itineraries?.[0])
    const segments = itinerary.segments
    if (!Array.isArray(segments) || !segments.length) continue
    const first = record(segments[0]), last = record(segments[segments.length - 1])
    const departure = airport(first.departure), arrival = airport(last.arrival)
    const rawPrice = record(f.price).total
    if (!['string', 'number'].includes(typeof rawPrice) || rawPrice === '') continue
    const price = Number(rawPrice)
    const id = typeof f.id === 'string' ? f.id : typeof f.id === 'number' ? String(f.id) : ''
    const airlineCode = typeof first.carrierCode === 'string' ? first.carrierCode : ''
    const offer = { id, price, currency: record(f.price).currency, duration: itinerary.duration, stops: segments.length - 1, departure, arrival, airline: airlineCode || 'Unbekannt', airlineCode, bookingLink: httpsBookingLink(f.bookingLink ?? f.booking_link) }
    if (!isFlightOffer(offer) || ids.has(id)) continue
    ids.add(id); offers.push(offer)
  }
  if (data.length && !offers.length) throw new Error('No valid offers in flight provider response')
  return offers
}
export function fallbackFlights(offers: FlightOffer[]): FlightOffer[] {
  return [...offers].sort((a, b) => a.price - b.price || a.stops - b.stops).slice(0, 3)
}
export function selectFlightIds(offers: FlightOffer[], ids: unknown): FlightOffer[] {
  if (!Array.isArray(ids) || ids.length !== Math.min(3, offers.length) || ids.some(id => typeof id !== 'string') || new Set(ids).size !== ids.length) return fallbackFlights(offers)
  const lookup = new Map(offers.map(offer => [offer.id, offer]))
  if (ids.some(id => !lookup.has(id))) return fallbackFlights(offers)
  return ids.map(id => lookup.get(id)!)
}
