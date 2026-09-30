import type { Flight, FlightLeg } from '@/lib/travel'
import { safeUrl } from '@/lib/travel'

function dateLabel(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'Zeit nicht verfügbar' : date.toLocaleString('de-CH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
function Leg({ leg, title }: { leg: FlightLeg; title: string }) {
  return <div className="space-y-1"><h3>{title}: {leg.departure.iataCode} → {leg.arrival.iataCode}</h3><p>Abflug: {dateLabel(leg.departure.at)}</p><p>Ankunft: {dateLabel(leg.arrival.at)}</p><p>{leg.stops === 0 ? 'Direktflug' : `${leg.stops} Zwischenstopp(s)`}{leg.duration ? ` · Dauer: ${leg.duration.replace(/^PT/, '').toLowerCase()}` : ''}</p></div>
}
export default function FlightCard({ flight }: { flight: Flight }) {
  const link = safeUrl(flight.bookingLink)
  return <article className="border border-blue-100 rounded-xl p-5 shadow-sm space-y-3">
    <p>{flight.airline}</p>
    <Leg leg={flight} title="Hinflug" />
    {flight.returnLeg && <Leg leg={flight.returnLeg} title="Rückflug" />}
    <p>{flight.price === null ? 'Preis nicht verfügbar' : `${flight.price.toLocaleString('de-CH', { minimumFractionDigits: 2 })} ${flight.currency} laut Anbieter`}</p>
    {link ? <a href={link} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 text-white px-4 py-2 rounded">Zum Angebot</a> : <p className="text-sm text-gray-500">Der Anbieter hat keinen Buchungslink geliefert.</p>}
  </article>
}
