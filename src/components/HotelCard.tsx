import Image from 'next/image'
import type { Hotel } from '@/lib/travel'
import { safeUrl } from '@/lib/travel'

export default function HotelCard({ hotel }: { hotel: Hotel }) {
  const link = safeUrl(hotel.bookingLink)
  const photo = safeUrl(hotel.photo)
  return <article className="border border-green-100 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-4">
    {/* Provider image hosts vary; a native image avoids Next Image host errors. */}
    {photo && <Image unoptimized src={photo} alt={hotel.name} width={192} height={128} loading="lazy" referrerPolicy="no-referrer" className="w-48 h-32 object-cover rounded" />}
    <div className="space-y-2"><h3 className="text-xl">{hotel.name}</h3>
      {hotel.address && <p>{hotel.address}</p>}
      {hotel.rating && <p>{hotel.rating}</p>}
      <p>{hotel.price === null ? 'Preis nicht verfügbar' : `${hotel.price.toLocaleString('de-CH', { minimumFractionDigits: 2 })} ${hotel.currency} laut Anbieter`}</p>
      {link ? <a href={link} target="_blank" rel="noopener noreferrer" className="inline-block bg-green-700 text-white px-4 py-2 rounded">Zum Angebot</a> : <p className="text-sm text-gray-500">Der Anbieter hat keinen Buchungslink geliefert.</p>}
    </div>
  </article>
}
