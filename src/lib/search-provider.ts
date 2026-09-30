import { normalizeFlights, normalizeHotels, object, SearchError, validateAdults, validateDates } from './travel'

const HOST = 'booking-com18.p.rapidapi.com'
export async function providerGet(path: string, params: URLSearchParams) {
  const key = process.env.RAPIDAPI_KEY
  if (!key) throw new SearchError('Die Reisesuche ist noch nicht eingerichtet. Bitte versuche es später erneut.', 503)
  let response: Response
  try {
    response = await fetch(`https://${HOST}${path}?${params}`, {
      headers: { 'X-RapidAPI-Key': key, 'X-RapidAPI-Host': HOST },
      cache: 'no-store', signal: AbortSignal.timeout(20000),
    })
  } catch { throw new SearchError('Der Suchanbieter ist derzeit nicht erreichbar. Bitte versuche es erneut.', 502) }
  if (!response.ok) throw new SearchError(response.status === 429 ? 'Der Suchanbieter ist ausgelastet. Bitte versuche es später erneut.' : 'Der Suchanbieter konnte die Anfrage nicht bearbeiten.', response.status === 429 ? 429 : 502)
  let payload: unknown
  try { payload = await response.json() } catch { throw new SearchError('Der Suchanbieter hat keine gültige Antwort geliefert.', 502) }
  const root = object(payload)
  if (root.error || root.status === false || root.success === false) throw new SearchError('Der Suchanbieter konnte die Anfrage nicht bearbeiten.', 502)
  return payload
}
export async function searchFlights(query: Record<string, unknown>) {
  const { origin, destination, date, returnDate } = query
  if (typeof origin !== 'string' || typeof destination !== 'string' || !/^[A-Z]{3}$/.test(origin) || !/^[A-Z]{3}$/.test(destination)) throw new SearchError('Bitte gib gültige Flughafen-Codes ein.')
  if (origin === destination) throw new SearchError('Abflug- und Zielort müssen unterschiedlich sein.')
  validateDates(date, returnDate)
  const adults = validateAdults(query.adults ?? '1')
  const params = new URLSearchParams({ fromId: origin, toId: destination, departDate: String(date), adults: String(adults), cabinClass: 'ECONOMY', currency: 'CHF' })
  if (returnDate) params.set('returnDate', String(returnDate))
  const flights = normalizeFlights(await providerGet('/flights/search', params))
  // A round-trip request must not silently turn into a one-way offer.
  if (returnDate && flights.some(flight => !flight.returnLeg)) throw new SearchError('Der Anbieter hat keine vollständigen Hin- und Rückflugangebote geliefert.', 502)
  return flights.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity))
}
export async function searchHotels(query: Record<string, unknown>) {
  const { city, checkin, checkout } = query
  if (typeof city !== 'string' || !city.trim() || city.length > 100) throw new SearchError('Bitte gib einen gültigen Hotel-Ort ein.')
  validateDates(checkin, checkout, true)
  const adults = validateAdults(query.adults ?? '1')
  const locations = await providerGet('/stays/auto-complete', new URLSearchParams({ query: city.trim() }))
  const root = object(locations)
  const data = object(root.data)
  const rows = Array.isArray(locations) ? locations : Array.isArray(root.data) ? root.data : Array.isArray(data.locations) ? data.locations : root.locations
  if (!Array.isArray(rows)) throw new SearchError('Die Ortssuche hat ein unerwartetes Antwortformat geliefert.', 502)
  if (!rows.length) throw new SearchError('Kein Hotel-Ort gefunden. Bitte überprüfe dein Reiseziel.', 404)
  const location = object(rows[0])
  if (typeof location.id !== 'string' && typeof location.id !== 'number') throw new SearchError('Die Ortssuche hat keine gültige Ortskennung geliefert.', 502)
  const params = new URLSearchParams({ location_id: String(location.id), checkin_date: String(checkin), checkout_date: String(checkout), adults_number: String(adults), room_number: '1', locale: 'de', currency: 'CHF', order_by: 'popularity' })
  return { city: city.trim(), results: normalizeHotels(await providerGet('/stays/search', params)) }
}
