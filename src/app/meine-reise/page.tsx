'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import FlightCard from '@/components/FlightCard'
import HotelCard from '@/components/HotelCard'
import ItineraryView from '@/components/ItineraryView'
import { parseSavedTrip, SavedTrip, TRIP_KEY } from '@/lib/saved-trip'
export default function MyTrip() {
  const [trip, setTrip] = useState<SavedTrip | null>(null)
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TRIP_KEY)
      if (stored) {
        const parsed = parseSavedTrip(JSON.parse(stored))
        if (parsed) setTrip(parsed)
        else setMessage('Die gespeicherte Reise konnte nicht gelesen werden. Bitte speichere sie erneut.')
      }
    } catch { setMessage('Der Browserspeicher ist nicht verfügbar oder konnte nicht gelesen werden.') }
    setReady(true)
  }, [])
  function remove() {
    try { localStorage.removeItem(TRIP_KEY); setTrip(null); setMessage('Deine gespeicherte Reise wurde gelöscht.') } catch { setMessage('Die Reise konnte nicht gelöscht werden.') }
  }
  return <div className="section-wrap"><div className="section-heading"><div><p className="eyebrow">DEIN PERSÖNLICHER REISEPLAN</p><h1 className="text-4xl">Meine Reise</h1></div><Link href="/#reise-suche" className="secondary-button no-print">Neue Reise planen ↗</Link></div>
    {message && <p role="status" className="notice">{message}</p>}
    {!ready ? <p>Lade deine Reise …</p> : !trip ? <div className="planner-card"><h2 className="text-2xl">Hier beginnt deine nächste Reise.</h2><p className="subtle-note">Suche Angebote, wähle einen Flug und eine Unterkunft und speichere deinen Reiseplan.</p><Link href="/#reise-suche" className="primary-button">Reise planen →</Link></div> : <div className="space-y-6">
      <div className="planner-card"><p className="eyebrow">{trip.origin} → {trip.destination}</p><h2 className="text-3xl">{trip.destination}</h2><p>{trip.date}{trip.returnDate ? ` bis ${trip.returnDate}` : ''} · {trip.people} Erwachsene</p><p className="subtle-note">{trip.budget ? `Gewünschtes Gesamtbudget: ${trip.budget} CHF · ` : ''}{trip.interests.join(' · ')}</p><p className="subtle-note">Gespeichert auf diesem Gerät am {new Date(trip.savedAt).toLocaleDateString('de-CH')}. Angebote sind gemerkt, noch nicht gebucht.</p><div className="flex flex-wrap gap-3 no-print"><button onClick={() => window.print()} className="primary-button">Drucken / als PDF speichern</button><button onClick={remove} className="secondary-button">Gespeicherte Reise löschen</button></div></div>
      {trip.flight && <section><h2 className="text-2xl mb-4">Dein Flug</h2><FlightCard flight={trip.flight}/></section>}
      {trip.hotel && <section><h2 className="text-2xl mb-4">Deine Unterkunft</h2><HotelCard hotel={trip.hotel}/></section>}
      {trip.itinerary && <section><h2 className="text-2xl mb-4">Dein Tagesplan</h2><ItineraryView itinerary={trip.itinerary}/></section>}
      {!trip.itinerary && <p className="subtle-note">Du hast noch keinen Tagesplan gespeichert.</p>}
    </div>}
  </div>
}
