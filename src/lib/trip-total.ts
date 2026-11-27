import type { FlightOffer } from './flight-offers'
import type { HotelOffer } from './hotel-offers'

export interface TripCombination { flight: FlightOffer; hotel: HotelOffer; total: number; currency: string }

/**
 * Cheapest flight + cheapest priced hotel in the same currency. Only real provider prices are
 * added; nothing is converted or estimated. Returns null when no honest total is possible.
 */
export function cheapestCombination(flights: FlightOffer[], hotels: HotelOffer[]): TripCombination | null {
  let best: TripCombination | null = null
  for (const hotel of hotels) {
    if (hotel.price === null) continue
    for (const flight of flights) {
      if (flight.currency !== hotel.currency) continue
      const total = Math.round((flight.price + hotel.price) * 100) / 100
      if (!best || total < best.total) best = { flight, hotel, total, currency: flight.currency }
    }
  }
  return best
}
