import axios from 'axios'
import { normalizeFlightOffers, type FlightOffer } from './flight-offers'
import { validateTravelDates, validAdults } from './trip-search'

type Query = Record<string, unknown>
type SearchResult = { status: number; body: FlightOffer[] | { error: string } }
const API_HOST = 'booking-com18.p.rapidapi.com'

// Shared search contract. This creates no reservation.
export async function searchFlights(query: Query): Promise<SearchResult> {
  const { origin, destination, date, returnDate, adults = '1', provider } = query
  const invalid = (error: string, status = 400): SearchResult => ({ status, body: { error } })
  if (provider !== undefined && provider !== 'booking') return invalid('Nur der Provider booking wird unterstützt.')
  if (typeof origin !== 'string' || !/^[A-Z]{3}$/.test(origin) || typeof destination !== 'string' || !/^[A-Z]{3}$/.test(destination) || origin === destination || (returnDate !== undefined && typeof returnDate !== 'string') || !validAdults(adults)) return invalid('Zwei unterschiedliche IATA-Flughafencodes und 1–9 Erwachsene sind erforderlich.')
  const dateError = validateTravelDates(date, returnDate)
  if (dateError) return invalid(dateError)
  if (!process.env.RAPIDAPI_KEY) return invalid('Die Flugsuche ist noch nicht konfiguriert.', 503)
  try {
    const response = await axios.get(`https://${API_HOST}/flights/search`, {
      timeout: 15000,
      headers: { 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY, 'X-RapidAPI-Host': API_HOST },
      params: { fromId: origin, toId: destination, departDate: date, returnDate: returnDate || '', adults, cabinClass: 'ECONOMY', currency: 'CHF' }
    })
    return { status: 200, body: normalizeFlightOffers(response.data, Boolean(returnDate)) }
  } catch {
    return invalid('Der Fluganbieter hat keine gültige Antwort geliefert. Bitte später erneut versuchen.', 502)
  }
}
