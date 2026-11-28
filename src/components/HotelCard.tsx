'use client'
import Image from 'next/image'
import BookingLink from './BookingLink'
import FavoriteButton from './FavoriteButton'
import type { FavoriteControl } from './FlightCard'
import type { HotelOffer } from '@/lib/hotel-offers'
export default function HotelCard({ hotel, favorite }: { hotel: HotelOffer; favorite?: FavoriteControl }) {
  return <article className="HotelCard offer-card space-y-3">
    {hotel.photo && <div className="hotel-photo"><Image src={hotel.photo} alt={hotel.name} fill unoptimized className="object-cover" /></div>}
    <div className="offer-card-top"><h3 className="text-lg font-bold">{hotel.name}</h3>{favorite && <FavoriteButton {...favorite} label={`Hotel ${hotel.name}`}/>}</div>
    {hotel.rating && <p>{hotel.rating}</p>}
    {hotel.address && <p>📍 {hotel.address}</p>}
    <p className="offer-price">{hotel.price === null ? 'Preis nicht verfügbar' : `${hotel.price.toLocaleString('de-CH', { minimumFractionDigits: 2 })} ${hotel.currency} laut Anbieter für den gewählten Aufenthalt`}</p>
    <BookingLink url={hotel.bookingLink} label="Zum Hotelangebot" />
  </article>
}
