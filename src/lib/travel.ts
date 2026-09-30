export type FlightLeg = {
  departure: { iataCode: string; at: string }
  arrival: { iataCode: string; at: string }
  duration: string
  stops: number
}
export type Flight = FlightLeg & {
  id: string
  airline: string
  airlineCode: string
  price: number | null
  currency: string
  bookingLink: string | null
  returnLeg?: FlightLeg
}
export type Hotel = {
  id: string
  name: string
  address: string
  rating: string
  price: number | null
  currency: string
  photo: string | null
  bookingLink: string | null
}

export class SearchError extends Error {
  constructor(message: string, public status = 400) { super(message) }
}
export function todayISO() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}
export function validDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}
export function validateDates(start: unknown, end?: unknown, hotel = false) {
  if (!validDate(start) || start < todayISO()) throw new SearchError('Bitte wähle ein gültiges Datum ab heute.')
  if (hotel && !end) throw new SearchError('Für Hotels wird ein Check-out-Datum benötigt.')
  if (end && (!validDate(end) || (hotel ? end <= start : end < start))) {
    throw new SearchError(hotel ? 'Check-out muss nach Check-in liegen.' : 'Der Rückflug darf nicht vor dem Hinflug liegen.')
  }
}
export function validateAdults(value: unknown = '1') {
  if (typeof value !== 'string' && typeof value !== 'number') throw new SearchError('Ungültige Personenanzahl.')
  const adults = Number(value)
  if (!Number.isInteger(adults) || adults < 1 || adults > 9) throw new SearchError('Bitte wähle 1 bis 9 erwachsene Personen.')
  return adults
}
export function safeUrl(value: unknown): string | null {
  if (typeof value !== 'string') return null
  try { const url = new URL(value); return url.protocol === 'https:' ? url.href : null } catch { return null }
}
export function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {}
}
function amount(value: unknown): number | null {
  if ((typeof value !== 'string' && typeof value !== 'number') || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : null
}
function text(value: unknown, fallback = '') { return typeof value === 'string' ? value : fallback }
function arrayAt(payload: unknown, key: string): unknown[] {
  if (Array.isArray(payload)) return payload
  const root = object(payload)
  if (Array.isArray(root[key])) return root[key] as unknown[]
  const data = object(root.data)
  if (Array.isArray(data[key])) return data[key] as unknown[]
  if (Array.isArray(root.data)) return root.data
  throw new SearchError('Der Suchanbieter hat ein unerwartetes Antwortformat geliefert.', 502)
}
function leg(value: unknown): FlightLeg | null {
  const itinerary = object(value)
  if (!Array.isArray(itinerary.segments) || !itinerary.segments.length) return null
  const departure = object(object(itinerary.segments[0]).departure)
  const arrival = object(object(itinerary.segments[itinerary.segments.length - 1]).arrival)
  if (!text(departure.iataCode) || !text(arrival.iataCode) || !text(departure.at) || !text(arrival.at)) return null
  return { departure: { iataCode: text(departure.iataCode), at: text(departure.at) }, arrival: { iataCode: text(arrival.iataCode), at: text(arrival.at) }, duration: text(itinerary.duration), stops: itinerary.segments.length - 1 }
}
export function normalizeFlights(payload: unknown): Flight[] {
  const rows = arrayAt(payload, 'flights')
  const flights = rows.flatMap((value, index) => {
    const offer = object(value)
    const itineraries = Array.isArray(offer.itineraries) ? offer.itineraries : []
    const outbound = leg(itineraries[0])
    if (!outbound) return []
    const price = object(offer.price)
    const firstSegment = object((object(itineraries[0]).segments as unknown[])[0])
    const returnLeg = leg(itineraries[1])
    return [{ ...outbound, id: text(offer.id, `flight-${index}`), airline: text(firstSegment.carrierCode, 'Unbekannt'), airlineCode: text(firstSegment.carrierCode), price: amount(price.total), currency: text(price.currency, 'CHF'), bookingLink: safeUrl(offer.bookingLink ?? offer.url), ...(returnLeg ? { returnLeg } : {}) }]
  })
  if (rows.length && !flights.length) throw new SearchError('Flugangebote konnten nicht gelesen werden. Bitte prüfe die Anbieter-Anbindung.', 502)
  return flights
}
export function normalizeHotels(payload: unknown): Hotel[] {
  const rows = arrayAt(payload, 'result')
  const hotels = rows.flatMap((value, index) => {
    const hotel = object(value)
    const property = object(hotel.property)
    const name = text(property.name ?? hotel.hotel_name ?? hotel.name)
    if (!name) return []
    const gross = object(object(hotel.composite_price_breakdown).gross_amount)
    const photos = Array.isArray(property.photo_urls) ? property.photo_urls : []
    return [{ id: String(property.id ?? hotel.hotel_id ?? index), name, address: text(property.address ?? hotel.address), rating: text(property.review_score_word ?? hotel.review_score_word), price: amount(gross.value ?? hotel.min_total_price), currency: text(gross.currency ?? hotel.currency, 'CHF'), photo: safeUrl(photos[0] ?? hotel.main_photo_url), bookingLink: safeUrl(property.url ?? hotel.url) }]
  })
  if (rows.length && !hotels.length) throw new SearchError('Hotelangebote konnten nicht gelesen werden. Bitte prüfe die Anbieter-Anbindung.', 502)
  return hotels
}
