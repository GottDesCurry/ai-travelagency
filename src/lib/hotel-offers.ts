import { httpsBookingLink, record } from './flight-offers'
export interface HotelOffer {
  id: string
  name: string
  address: string
  rating: string
  price: number | null
  currency: string
  photo?: string
  bookingLink?: string
  /** Offer from a provider sandbox: shown, but marked and not bookable. */
  testData?: boolean
}
export function isHotelOffer(value: unknown): value is HotelOffer {
  if (!value || typeof value !== 'object') return false
  const h = value as HotelOffer
  return typeof h.id === 'string' && typeof h.name === 'string' && !!h.name && typeof h.address === 'string' && typeof h.rating === 'string' && (h.price === null || (typeof h.price === 'number' && Number.isFinite(h.price) && h.price >= 0)) && typeof h.currency === 'string' && /^[A-Z]{3}$/.test(h.currency) && (h.photo === undefined || !!httpsBookingLink(h.photo)) && (h.bookingLink === undefined || !!httpsBookingLink(h.bookingLink)) && (h.testData === undefined || typeof h.testData === 'boolean')
}
function optionalString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}
function hotelId(value: unknown): string {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : ''
}
export function normalizeHotelOffers(payload: unknown): HotelOffer[] {
  const result = record(payload).result
  if (!Array.isArray(result)) throw new Error('Unexpected hotel response')
  const offers = result.slice(0, 3).map((raw: unknown) => {
    const hotel = record(raw)
    const property = record(hotel.property)
    const amount = record(record(hotel.composite_price_breakdown).gross_amount)
    const value = amount.value
    const price = typeof value === 'number' || (typeof value === 'string' && value.trim()) ? Number(value) : null
    const photos: unknown[] = Array.isArray(property.photo_urls) ? property.photo_urls : []
    return { id: hotelId(hotel.hotel_id ?? property.id), name: optionalString(property.name), address: optionalString(property.address), rating: optionalString(property.review_score_word), price, currency: optionalString(amount.currency), photo: httpsBookingLink(photos[0]), bookingLink: httpsBookingLink(property.url) }
  }).filter(isHotelOffer)
  if (result.length && !offers.length) throw new Error('No valid hotel offers')
  return offers
}
