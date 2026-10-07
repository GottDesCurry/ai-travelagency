import { fallbackFlights, isFlightOffer, type FlightOffer } from './flight-offers'
import { isHotelOffer, type HotelOffer } from './hotel-offers'

export async function requestJson(url: string, init: RequestInit = {}, timeoutMs = 20000): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...init, signal: controller.signal })
    let data
    try { data = await response.json() } catch { throw new Error('Der Dienst hat keine gültige JSON-Antwort geliefert.') }
    if (!response.ok) throw new Error(typeof data?.error === 'string' ? data.error : `Der Dienst meldet einen Fehler (${response.status}).`)
    return data
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Die Anfrage hat zu lange gedauert. Bitte erneut versuchen.')
    throw error
  } finally { clearTimeout(timer) }
}
export async function loadFlights(query: string): Promise<FlightOffer[]> {
  const offers = await requestJson(`/api/flights-aggregated?${query}`)
  if (!Array.isArray(offers) || !offers.every(isFlightOffer)) throw new Error('Ungültige Flugangebote')
  if (!offers.length) return []
  try {
    const ranked = await requestJson('/api/ai', { method: 'POST', body: JSON.stringify(offers), headers: { 'Content-Type': 'application/json' } })
    if (!Array.isArray(ranked) || !ranked.length || !ranked.every(isFlightOffer)) return fallbackFlights(offers)
    // Resolve ranking back to the original search offers, including at the client boundary.
    const originals = new Map(offers.map(offer => [offer.id, offer]))
    if (ranked.length > 3 || new Set(ranked.map(offer => offer.id)).size !== ranked.length || ranked.some(offer => !originals.has(offer.id))) return fallbackFlights(offers)
    return ranked.map(offer => originals.get(offer.id)!)
  } catch { return fallbackFlights(offers) }
}
export async function loadHotels(query: string): Promise<HotelOffer[]> {
  const data = await requestJson(`/api/hotels?${query}`)
  if (!Array.isArray(data?.results) || !data.results.every(isHotelOffer)) throw new Error('Ungültige Hotelangebote')
  return data.results
}
export async function settleSearch<T>(task: () => Promise<T>, success: (value: T) => void, failure: (message: string) => void): Promise<void> {
  try { success(await task()) } catch (error) { failure(error instanceof Error ? error.message : 'Die Suche ist vorübergehend nicht verfügbar.') }
}
