'use client'

import { useState } from 'react'
import iataCodes from '@/data/iata-codes.json'
import FlightCard from '@/components/FlightCard'
import HotelCard from '@/components/HotelCard'
import { Flight, Hotel, todayISO, validateAdults, validateDates } from '@/lib/travel'

async function requestJSON(url: string, options?: RequestInit) {
  const response = await fetch(url, options)
  let data
  try { data = await response.json() } catch { throw new Error('Der Server hat keine gültige Antwort geliefert.') }
  if (!response.ok || data?.error) throw new Error(typeof data?.error === 'string' ? data.error : 'Die Anfrage konnte nicht verarbeitet werden.')
  return data
}
function airportCode(input: string) {
  const normalized = input.trim().toLowerCase()
  return iataCodes.find(item => item.city.toLowerCase() === normalized || item.code.toLowerCase() === normalized)?.code ?? (/^[a-z]{3}$/i.test(normalized) ? normalized.toUpperCase() : null)
}
function hotelCity(input: string) {
  return iataCodes.find(item => item.code === input.trim().toUpperCase())?.city ?? input.trim()
}

export default function Home() {
  const [origin, setOrigin] = useState('ZRH')
  const [destination, setDestination] = useState('BER')
  const [date, setDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [people, setPeople] = useState('1')
  const [searchFlights, setSearchFlights] = useState(true)
  const [searchHotels, setSearchHotels] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [flightResults, setFlightResults] = useState<Flight[]>([])
  const [hotelResults, setHotelResults] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [searched, setSearched] = useState({ flights: false, hotels: false })

  async function handleSearch() {
    if (loading) return
    setLoading(true)
    setErrors([])
    setSearched({ flights: false, hotels: false })
    setFlightResults([])
    setHotelResults([])
    let trip = { origin, destination, date, returnDate, people }
    try {
      if (!searchFlights && !searchHotels) throw new Error('Bitte wähle Flüge oder Hotels aus.')
      if (prompt.trim()) {
        const parsed = await requestJSON('/api/parse-trip', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) })
        trip = {
          origin: parsed.origin || origin,
          destination: parsed.destination || destination,
          date: parsed.date || date,
          returnDate: parsed.returnDate || returnDate,
          people: parsed.people == null ? people : String(parsed.people),
        }
        setOrigin(trip.origin); setDestination(trip.destination); setDate(trip.date); setReturnDate(trip.returnDate); setPeople(trip.people)
      }
      const adults = validateAdults(trip.people)
      validateDates(trip.date, trip.returnDate, searchHotels)
      const from = airportCode(trip.origin)
      const to = airportCode(trip.destination)
      if (searchFlights && (!from || !to)) throw new Error('Bitte gib Flughafen-Codes ein, zum Beispiel ZRH und BER.')
      if (searchFlights && from === to) throw new Error('Abflug- und Zielort müssen unterschiedlich sein.')
      if (searchHotels && !trip.destination.trim()) throw new Error('Bitte gib einen Hotel-Ort ein.')
      const jobs: Promise<void>[] = []
      if (searchFlights) {
        const query = new URLSearchParams({ origin: from!, destination: to!, date: trip.date, adults: String(adults) })
        if (trip.returnDate) query.set('returnDate', trip.returnDate)
        jobs.push(requestJSON(`/api/flights-aggregated?${query}`).then(data => {
          if (!Array.isArray(data)) throw new Error('Die Flugsuche hat ein unerwartetes Antwortformat geliefert.')
          setFlightResults(data); setSearched(previous => ({ ...previous, flights: true }))
        }).catch(error => { setErrors(previous => [...previous, `Flüge: ${error.message}`]) }))
      }
      if (searchHotels) {
        const query = new URLSearchParams({ city: hotelCity(trip.destination), checkin: trip.date, checkout: trip.returnDate, adults: String(adults) })
        jobs.push(requestJSON(`/api/hotels?${query}`).then(data => {
          if (!Array.isArray(data.results)) throw new Error('Die Hotelsuche hat ein unerwartetes Antwortformat geliefert.')
          setHotelResults(data.results); setSearched(previous => ({ ...previous, hotels: true }))
        }).catch(error => { setErrors(previous => [...previous, `Hotels: ${error.message}`]) }))
      }
      await Promise.all(jobs)
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Die Suche ist fehlgeschlagen.'])
    } finally { setLoading(false) }
  }

  const inputClass = 'w-full px-4 py-2 rounded border border-gray-300'
  return (
    <div className="flex flex-col items-center px-4 space-y-8 w-full py-8">
      <form onSubmit={event => { event.preventDefault(); void handleSearch() }} className="bg-white shadow-lg rounded-xl p-6 max-w-xl w-full space-y-5">
        <fieldset disabled={loading} className="space-y-5">
          <legend className="text-xl mb-4">Deine Reise planen</legend>
          <label className="block">Reisewunsch (optional)
            <textarea value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="Zum Beispiel: Zwei Erwachsene von Zürich nach Berlin vom 10. bis 14. November" className={inputClass} rows={3} />
          </label>
          <p className="text-sm text-gray-500">Die KI ergänzt die Felder aus deinem Text. Für die manuelle Suche kannst du dieses Feld leer lassen.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label>Abflugort / Flughafen-Code<input value={origin} onChange={event => setOrigin(event.target.value)} className={inputClass} /></label>
            <label>Reiseziel<input value={destination} onChange={event => setDestination(event.target.value)} className={inputClass} /></label>
            <label>Hinflug / Check-in<input type="date" min={todayISO()} value={date} onChange={event => setDate(event.target.value)} className={inputClass} /></label>
            <label>Rückflug / Check-out<input type="date" min={date || todayISO()} value={returnDate} onChange={event => setReturnDate(event.target.value)} className={inputClass} /></label>
          </div>
          <label className="block">Erwachsene (1–9)<input type="number" min={1} max={9} step={1} value={people} onChange={event => setPeople(event.target.value)} className={inputClass} /></label>
          <p className="text-sm text-gray-500">Hotels: ein Zimmer für alle Erwachsenen. Check-out muss nach Check-in liegen.</p>
          <div className="flex gap-6">
            <label><input type="checkbox" checked={searchFlights} onChange={event => setSearchFlights(event.target.checked)} /> Flüge suchen</label>
            <label><input type="checkbox" checked={searchHotels} onChange={event => setSearchHotels(event.target.checked)} /> Hotels suchen</label>
          </div>
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white py-2 rounded disabled:opacity-50">{loading ? 'Suche läuft …' : 'Reise suchen'}</button>
        </fieldset>
        {errors.length > 0 && <div role="alert" className="bg-red-50 text-red-800 rounded p-4">{errors.map((error, index) => <p key={index}>{error}</p>)}</div>}
      </form>
      <div aria-live="polite" className="w-full max-w-3xl space-y-6">
        {loading && <p>Wir suchen passende Angebote …</p>}
        {searched.flights && <section className="space-y-4"><h2 className="text-2xl">Flugangebote ({flightResults.length})</h2><p className="text-sm text-gray-500">Preise laut Anbieter. Verfügbarkeit und endgültigen Preis vor der Buchung prüfen.</p>{flightResults.length ? flightResults.map(flight => <FlightCard key={flight.id} flight={flight} />) : <p>Keine passenden Flüge gefunden.</p>}</section>}
        {searched.hotels && <section className="space-y-4"><h2 className="text-2xl">Hotelangebote ({hotelResults.length})</h2><p className="text-sm text-gray-500">Preise laut Anbieter für den angefragten Aufenthalt. Steuern und Gebühren vor der Buchung prüfen.</p>{hotelResults.length ? hotelResults.map(hotel => <HotelCard key={hotel.id} hotel={hotel} />) : <p>Keine passenden Hotels gefunden.</p>}</section>}
      </div>
    </div>
  )
}
