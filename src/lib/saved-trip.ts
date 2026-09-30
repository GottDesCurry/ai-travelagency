import type { Flight, Hotel } from './travel'
import { object, validDate, validateAdults } from './travel'
import type { Itinerary } from './itinerary'
import { readItinerary } from './itinerary'
export type SavedTrip = {
  version: 1; savedAt: string
  destination: string; origin: string; date: string; returnDate: string; people: string
  budget: string; interests: string[]
  flight: Flight | null; hotel: Hotel | null; itinerary: Itinerary | null
}
export const TRIP_KEY = 'bookrepeat-trip-v1'
export function parseSavedTrip(value: unknown): SavedTrip | null {
  const trip = object(value)
  if (trip.version !== 1 || !['destination', 'origin', 'date', 'returnDate', 'people', 'budget', 'savedAt'].every(key => typeof trip[key] === 'string') || !validDate(trip.date) || (trip.returnDate && (!validDate(trip.returnDate) || trip.returnDate < trip.date)) || !Array.isArray(trip.interests) || !trip.interests.every(item => typeof item === 'string')) return null
  try { validateAdults(trip.people) } catch { return null }
  const isLeg = (input: unknown) => {
    const leg = object(input), from = object(leg.departure), to = object(leg.arrival)
    return ['iataCode', 'at'].every(key => typeof from[key] === 'string' && typeof to[key] === 'string') && typeof leg.duration === 'string' && typeof leg.stops === 'number'
  }
  if (trip.flight) {
    const flight = object(trip.flight)
    if (!isLeg(flight) || (flight.returnLeg && !isLeg(flight.returnLeg)) || typeof flight.airline !== 'string' || typeof flight.currency !== 'string' || (flight.price !== null && typeof flight.price !== 'number')) return null
  }
  if (trip.hotel) {
    const hotel = object(trip.hotel)
    if (typeof hotel.name !== 'string' || typeof hotel.currency !== 'string' || (hotel.price !== null && typeof hotel.price !== 'number')) return null
  }
  if (trip.itinerary) {
    if (!trip.returnDate) return null
    try { trip.itinerary = readItinerary(trip.itinerary, Math.round((Date.parse(String(trip.returnDate)) - Date.parse(String(trip.date))) / 86400000) + 1) } catch { return null }
  }
  return trip as SavedTrip
}
