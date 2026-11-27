'use client'
import BookingLink from './BookingLink'
import type { FlightOffer, FlightLeg } from '@/lib/flight-offers'

function formatDate(value: string): string {
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return 'Zeit nicht verfügbar'
  return date.toLocaleString('de-CH', { weekday: 'short', year: 'numeric', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
function Leg({ leg, label }: { leg: FlightLeg; label: string }) {
  return <section className="space-y-1">
    <h3 className="font-semibold">{label}: {leg.departure.iataCode} → {leg.arrival.iataCode}</h3>
    <p>{leg.airline} · {leg.stops === 0 ? 'Direktflug' : `${leg.stops} Zwischenstopp(s)`}</p>
    <p>Abflug: {formatDate(leg.departure.at)}</p>
    <p>Ankunft: {formatDate(leg.arrival.at)}</p>
    {leg.duration && <p>Dauer: {leg.duration.replace(/^PT/, '').toLowerCase()}</p>}
    {leg.segments.length > 1 && <ol className="text-xs text-gray-600 space-y-1">
      {leg.segments.map((segment, index) => <li key={index}>{segment.departure.iataCode} → {segment.arrival.iataCode} · {segment.airlineCode} · {formatDate(segment.departure.at)} bis {formatDate(segment.arrival.at)}</li>)}
    </ol>}
  </section>
}
export default function FlightCard({ flight, recommended = false }: { flight: FlightOffer; recommended?: boolean }) {
  const outbound = flight.outboundLeg || { duration: flight.duration, stops: flight.stops, departure: flight.departure, arrival: flight.arrival, airline: flight.airline, airlineCode: flight.airlineCode, segments: [] }
  return <article className="FlightCard offer-card space-y-4">
    {recommended && <span className="recommendation">Empfohlen</span>}
    <Leg leg={outbound} label="Hinflug" />
    {flight.returnLeg && <Leg leg={flight.returnLeg} label="Rückflug" />}
    <p className="offer-price">{flight.price.toLocaleString('de-CH', { minimumFractionDigits: 2 })} {flight.currency} laut Anbieter{flight.returnLeg ? ' für Hin- und Rückflug' : ''}</p>
    <BookingLink url={flight.bookingLink} label="Zum Flugangebot" />
  </article>
}
