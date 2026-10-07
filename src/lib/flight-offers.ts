export interface FlightSegment {
  departure: { iataCode: string; at: string }
  arrival: { iataCode: string; at: string }
  airlineCode: string
}
export interface FlightLeg {
  duration: string
  stops: number
  departure: { iataCode: string; at: string }
  arrival: { iataCode: string; at: string }
  airline: string
  airlineCode: string
  segments: FlightSegment[]
}
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
  outboundLeg?: FlightLeg
  returnLeg?: FlightLeg
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
function isFlightLeg(value: unknown): value is FlightLeg {
  const leg = record(value)
  return typeof leg.duration === 'string' && Number.isInteger(leg.stops) && leg.stops >= 0 && !!airport(leg.departure) && !!airport(leg.arrival) && typeof leg.airline === 'string' && typeof leg.airlineCode === 'string' && Array.isArray(leg.segments) && leg.segments.length > 0 && leg.segments.every((segment: unknown) => {
    const item = record(segment)
    return !!airport(item.departure) && !!airport(item.arrival) && typeof item.airlineCode === 'string'
  })
}
function normalizeLeg(value: unknown): FlightLeg | null {
  const itinerary = record(value)
  if (!Array.isArray(itinerary.segments) || !itinerary.segments.length || typeof itinerary.duration !== 'string') return null
  const segments: FlightSegment[] = []
  for (const value of itinerary.segments) {
    const raw = record(value), departure = airport(raw.departure), arrival = airport(raw.arrival)
    if (!departure || !arrival) return null
    segments.push({ departure, arrival, airlineCode: typeof raw.carrierCode === 'string' ? raw.carrierCode : '' })
  }
  const airlineCode = segments[0].airlineCode
  return { duration: itinerary.duration, stops: segments.length - 1, departure: segments[0].departure, arrival: segments[segments.length - 1].arrival, airlineCode, airline: airlineCode || 'Unbekannt', segments }
}
export function isFlightOffer(value: unknown): value is FlightOffer {
  const f = record(value)
  return typeof f.id === 'string' && f.id.length > 0 && typeof f.price === 'number' && Number.isFinite(f.price) && f.price >= 0 && typeof f.currency === 'string' && /^[A-Z]{3}$/.test(f.currency) && typeof f.duration === 'string' && Number.isInteger(f.stops) && f.stops >= 0 && !!airport(f.departure) && !!airport(f.arrival) && typeof f.airline === 'string' && typeof f.airlineCode === 'string' && (f.bookingLink === undefined || httpsBookingLink(f.bookingLink) !== undefined) && (f.outboundLeg === undefined || isFlightLeg(f.outboundLeg)) && (f.returnLeg === undefined || isFlightLeg(f.returnLeg))
}
// Adapter for the itinerary-shaped payload currently used by Booking COM 18.
// Unknown upstream envelopes are errors, rather than successful empty searches.
export function normalizeFlightOffers(payload: unknown, requireReturn = false): FlightOffer[] {
  const data = record(payload).data
  if (!Array.isArray(data)) throw new Error('Unexpected flight provider response')
  const offers: FlightOffer[] = []
  const ids = new Set<string>()
  for (const raw of data.slice(0, 15)) {
    const f = record(raw)
    const outboundLeg = normalizeLeg(f.itineraries?.[0])
    const hasReturn = Array.isArray(f.itineraries) && f.itineraries.length > 1
    const returnLeg = hasReturn ? normalizeLeg(f.itineraries[1]) : null
    if (!outboundLeg || (hasReturn && !returnLeg) || (requireReturn && !returnLeg)) continue
    const rawPrice = record(f.price).total
    if (!['string', 'number'].includes(typeof rawPrice) || rawPrice === '') continue
    const price = Number(rawPrice)
    const id = typeof f.id === 'string' ? f.id : typeof f.id === 'number' ? String(f.id) : ''
    const offer = { id, price, currency: record(f.price).currency, duration: outboundLeg.duration, stops: outboundLeg.stops, departure: outboundLeg.departure, arrival: outboundLeg.arrival, airline: outboundLeg.airline, airlineCode: outboundLeg.airlineCode, outboundLeg, ...(returnLeg ? { returnLeg } : {}), bookingLink: httpsBookingLink(f.bookingLink ?? f.booking_link) }
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
