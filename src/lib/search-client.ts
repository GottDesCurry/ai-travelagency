import { fallbackFlights, isFlightOffer, type FlightOffer } from './flight-offers'
import { isHotelOffer, type HotelOffer } from './hotel-offers'

export async function requestJson(url: string, init: RequestInit = {}, timeoutMs = 20000): Promise<any> {
  const controller = new AbortController()
  const cancel = () => controller.abort()
  if (init.signal?.aborted) throw new Error('Die Suche wurde abgebrochen.')
  init.signal?.addEventListener('abort', cancel, { once: true })
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { ...init, signal: controller.signal })
    let data
    try { data = await response.json() } catch { throw new Error('Der Dienst hat keine gültige JSON-Antwort geliefert.') }
    if (!response.ok) throw new Error(typeof data?.error === 'string' ? data.error : `Der Dienst meldet einen Fehler (${response.status}).`)
    return data
  } catch (error) {
    if (init.signal?.aborted) throw new Error('Die Suche wurde abgebrochen.')
    if (controller.signal.aborted) throw new Error('Die Anfrage hat zu lange gedauert. Bitte erneut versuchen.')
    throw error
  } finally { clearTimeout(timer); init.signal?.removeEventListener('abort', cancel) }
}
export async function loadFlights(query: string, signal?: AbortSignal, onRecommendations?: (ids: string[]) => void): Promise<FlightOffer[]> {
  const offers = await requestJson(`/api/flights-aggregated?${query}`, { signal })
  if (!Array.isArray(offers) || !offers.every(isFlightOffer) || new Set(offers.map(offer => offer.id)).size !== offers.length) throw new Error('Ungültige Flugangebote')
  if (!offers.length) { onRecommendations?.([]); return [] }
  // Preserve every valid provider offer. Only the optional ranking input is bounded.
  const sorted = [...offers].sort((a, b) => a.price - b.price || a.stops - b.stops)
  const candidates = sorted.slice(0, 15)
  let recommendations = fallbackFlights(candidates)
  try {
    const ranked = await requestJson('/api/ai', { signal, method: 'POST', body: JSON.stringify(candidates), headers: { 'Content-Type': 'application/json' } })
    const originals = new Map(candidates.map(offer => [offer.id, offer]))
    if (Array.isArray(ranked) && ranked.length === Math.min(3, candidates.length) && ranked.every(isFlightOffer) && new Set(ranked.map(offer => offer.id)).size === ranked.length && ranked.every(offer => originals.has(offer.id))) {
      recommendations = ranked.map(offer => originals.get(offer.id)!)
    }
  } catch (error) { if (signal?.aborted) throw error }
  if (signal?.aborted) throw new Error('Die Suche wurde abgebrochen.')
  onRecommendations?.(recommendations.map(offer => offer.id))
  return sorted
}
export async function loadHotels(query: string, signal?: AbortSignal): Promise<HotelOffer[]> {
  const data = await requestJson(`/api/hotels?${query}`, { signal }, 35000)
  if (!Array.isArray(data?.results) || !data.results.every(isHotelOffer)) throw new Error('Ungültige Hotelangebote')
  return data.results
}
export async function settleSearch<T>(task: () => Promise<T>, success: (value: T) => void, failure: (message: string) => void): Promise<void> {
  try { success(await task()) } catch (error) { failure(error instanceof Error ? error.message : 'Die Suche ist vorübergehend nicht verfügbar.') }
}
