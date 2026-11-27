import { httpsBookingLink, type FlightOffer } from './flight-offers'
import type { HotelOffer } from './hotel-offers'

// Device-local shortlist ("Merkliste"). Stores only what the card showed at the time of saving;
// prices are snapshots from the provider and are labelled as such in the UI.
export const FAVORITES_KEY = 'book-repeat:favorites:v1'
export const MAX_FAVORITES = 30

export interface Favorite {
  key: string
  kind: 'flight' | 'hotel'
  title: string
  detail: string
  price: number | null
  currency: string
  link?: string
  savedAt: string
}

function shortDate(value: string): string {
  const date = new Date(value)
  return Number.isFinite(date.getTime()) ? date.toLocaleString('de-CH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''
}

export function favoriteKey(kind: Favorite['kind'], id: string): string {
  return `${kind}:${id}`
}

export function favoriteFromFlight(offer: FlightOffer, now = new Date()): Favorite {
  const stops = offer.stops === 0 ? 'Direktflug' : `${offer.stops} Stopp(s)`
  return {
    key: favoriteKey('flight', offer.id),
    kind: 'flight',
    title: `${offer.departure.iataCode} → ${offer.arrival.iataCode}${offer.returnLeg ? ' und zurück' : ''}`,
    detail: [offer.airline, shortDate(offer.departure.at), stops].filter(Boolean).join(' · '),
    price: offer.price,
    currency: offer.currency,
    ...(offer.bookingLink ? { link: offer.bookingLink } : {}),
    savedAt: now.toISOString(),
  }
}

export function favoriteFromHotel(offer: HotelOffer, now = new Date()): Favorite {
  return {
    key: favoriteKey('hotel', offer.id || offer.name),
    kind: 'hotel',
    title: offer.name,
    detail: [offer.rating, offer.address].filter(Boolean).join(' · '),
    price: offer.price,
    currency: offer.currency,
    ...(offer.bookingLink ? { link: offer.bookingLink } : {}),
    savedAt: now.toISOString(),
  }
}

export function isFavorite(value: unknown): value is Favorite {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  const text = (field: unknown, max: number) => typeof field === 'string' && field.length <= max
  return text(v.key, 200) && /^(flight|hotel):.+/.test(String(v.key))
    && (v.kind === 'flight' || v.kind === 'hotel') && String(v.key).startsWith(`${v.kind}:`)
    && text(v.title, 200) && String(v.title).trim().length > 0 && text(v.detail, 300)
    && (v.price === null || (typeof v.price === 'number' && Number.isFinite(v.price) && v.price >= 0))
    && typeof v.currency === 'string' && /^[A-Z]{3}$/.test(v.currency)
    && (v.link === undefined || httpsBookingLink(v.link) !== undefined)
    && typeof v.savedAt === 'string' && Number.isFinite(Date.parse(v.savedAt))
}

function minimal(v: Favorite): Favorite {
  return { key: v.key, kind: v.kind, title: v.title, detail: v.detail, price: v.price, currency: v.currency, ...(v.link ? { link: v.link } : {}), savedAt: v.savedAt }
}

export function decodeFavorites(raw: string | null): Favorite[] {
  if (!raw || raw.length > 60000) return []
  try {
    const value: unknown = JSON.parse(raw)
    if (!value || typeof value !== 'object' || !('version' in value) || value.version !== 1 || !('items' in value) || !Array.isArray(value.items)) return []
    const keys = new Set<string>()
    return value.items.filter(isFavorite).filter((item: Favorite) => { if (keys.has(item.key)) return false; keys.add(item.key); return true }).slice(0, MAX_FAVORITES).map(minimal)
  } catch { return [] }
}

export function encodeFavorites(items: Favorite[]): string {
  return JSON.stringify({ version: 1, items: items.filter(isFavorite).slice(0, MAX_FAVORITES).map(minimal) })
}

/** Adds the item at the top, or removes it when it is already on the list. */
export function toggleFavorite(items: Favorite[], item: Favorite): Favorite[] {
  return items.some(existing => existing.key === item.key)
    ? items.filter(existing => existing.key !== item.key)
    : [item, ...items].slice(0, MAX_FAVORITES)
}
