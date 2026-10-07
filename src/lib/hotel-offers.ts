import { httpsBookingLink } from './flight-offers'
export interface HotelOffer {
  id: string
  name: string
  address: string
  rating: string
  price: number | null
  currency: string
  photo?: string
  bookingLink?: string
}
export function isHotelOffer(value: unknown): value is HotelOffer {
  if (!value || typeof value !== 'object') return false
  const h = value as HotelOffer
  return typeof h.id === 'string' && typeof h.name === 'string' && !!h.name && typeof h.address === 'string' && typeof h.rating === 'string' && (h.price === null || (typeof h.price === 'number' && Number.isFinite(h.price) && h.price >= 0)) && typeof h.currency === 'string' && /^[A-Z]{3}$/.test(h.currency) && (h.photo === undefined || !!httpsBookingLink(h.photo)) && (h.bookingLink === undefined || !!httpsBookingLink(h.bookingLink))
}
export function normalizeHotelOffers(payload: any): HotelOffer[] {
  if (!Array.isArray(payload?.result)) throw new Error('Unexpected hotel response')
  const offers = payload.result.slice(0, 3).map((hotel: any) => {
    const property = hotel?.property
    const amount = hotel?.composite_price_breakdown?.gross_amount
    const price = typeof amount?.value === 'number' || (typeof amount?.value === 'string' && amount.value.trim()) ? Number(amount.value) : null
    return { id: String(hotel?.hotel_id ?? property?.id ?? ''), name: property?.name, address: property?.address || '', rating: property?.review_score_word || '', price, currency: amount?.currency, photo: httpsBookingLink(property?.photo_urls?.[0]), bookingLink: httpsBookingLink(property?.url) }
  }).filter(isHotelOffer)
  if (payload.result.length && !offers.length) throw new Error('No valid hotel offers')
  return offers
}
