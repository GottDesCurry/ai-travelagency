'use client'
import Image from 'next/image'
import BookingLink from './BookingLink'
import type { HotelOffer } from '@/lib/hotel-offers'
export default function HotelCard({ hotel }: { hotel: HotelOffer }) {
  return <article className="HotelCard offer-card space-y-3">
    {hotel.photo && <div className="hotel-photo"><Image src={hotel.photo} alt={hotel.name} fill unoptimized className="object-cover" /></div>}
    <h3 className="text-lg font-bold">{hotel.name}</h3>
    {hotel.rating && <p>{hotel.rating}</p>}
    {hotel.address && <p>📍 {hotel.address}</p>}
    <p className="offer-price">{hotel.price === null ? 'Preis nicht verfügbar' : `${hotel.price.toLocaleString('de-CH', { minimumFractionDigits: 2 })} ${hotel.currency} laut Anbieter für den gewählten Aufenthalt`}</p>
    <BookingLink url={hotel.bookingLink} label="Zum Hotelangebot" />
  </article>
}
