'use client'
import Image from 'next/image'
import type { HotelOffer } from '@/lib/hotel-offers'
export default function HotelCard({ hotel }: { hotel: HotelOffer }) {
  return <article className="HotelCard border border-green-200 bg-white/70 rounded-xl p-5 shadow-md space-y-2">
    {hotel.photo && <div className="relative h-40 rounded overflow-hidden"><Image src={hotel.photo} alt={hotel.name} fill unoptimized className="object-cover" /></div>}
    <h3 className="text-lg font-bold">{hotel.name}</h3>
    {hotel.rating && <p>{hotel.rating}</p>}
    {hotel.address && <p>📍 {hotel.address}</p>}
    <p>{hotel.price === null ? 'Preis nicht verfügbar' : `${hotel.price.toLocaleString('de-CH', { minimumFractionDigits: 2 })} ${hotel.currency} laut Anbieter für den gewählten Aufenthalt`}</p>
    {hotel.bookingLink && <a href={hotel.bookingLink} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-600 text-white px-4 py-2 rounded">Zum Hotelangebot</a>}
  </article>
}
