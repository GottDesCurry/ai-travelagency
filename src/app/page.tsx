'use client'

import Link from 'next/link'
import FlightIntro, { Plane } from '@/components/FlightIntro'
import ItineraryView from '@/components/ItineraryView'
import type { Itinerary } from '@/lib/itinerary'
import { TRIP_KEY, SavedTrip } from '@/lib/saved-trip'
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
  const knownCities: Record<string, string> = { LIS: 'Lisbon', BCN: 'Barcelona', KEF: 'Reykjavik', ZRH: 'Zurich', BER: 'Berlin' }
  return knownCities[input.trim().toUpperCase()] ?? iataCodes.find(item => item.code === input.trim().toUpperCase())?.city ?? input.trim()
}

export default function Home() {
  const [budget, setBudget] = useState('')
  const [interests, setInterests] = useState<string[]>([])
  const [selectedFlight, setSelectedFlight] = useState<Flight | null>(null)
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [planning, setPlanning] = useState(false)
  const [saveMessage, setSaveMessage] = useState('')
  const [resultTrip, setResultTrip] = useState<{ origin: string; destination: string; date: string; returnDate: string; people: string; budget: string; interests: string[] } | null>(null)
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
    setSelectedFlight(null); setSelectedHotel(null); setItinerary(null); setSaveMessage(''); setResultTrip(null)
    setErrors([])
    setSearched({ flights: false, hotels: false })
    setFlightResults([])
    setHotelResults([])
    let trip = { origin, destination, date, returnDate, people, budget, interests }
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
          budget: parsed.budget == null ? budget : String(parsed.budget),
          interests: Array.isArray(parsed.interests) && parsed.interests.length ? parsed.interests.filter((item: unknown) => typeof item === 'string') : interests,
        }
        setOrigin(trip.origin); setDestination(trip.destination); setDate(trip.date); setReturnDate(trip.returnDate); setPeople(trip.people); setBudget(trip.budget); setInterests(trip.interests)
      }
      if (trip.budget && (!Number.isFinite(Number(trip.budget)) || Number(trip.budget) <= 0 || Number(trip.budget) > 1000000)) throw new Error('Bitte gib ein gültiges Gesamtbudget in CHF ein.')
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
      setResultTrip({ ...trip, interests: [...trip.interests] })
      await Promise.all(jobs)
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Die Suche ist fehlgeschlagen.'])
    } finally { setLoading(false) }
  }

  async function createPlan() {
    if (!resultTrip) return
    setPlanning(true); setErrors([])
    try {
      const plan = await requestJSON('/api/itinerary', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...resultTrip, destination: hotelCity(resultTrip.destination) }) })
      setItinerary(plan); setSaveMessage('')
    } catch (error) { setErrors([error instanceof Error ? error.message : 'Der Reiseplan konnte nicht erstellt werden.']) }
    finally { setPlanning(false) }
  }
  function saveTrip() {
    if (!resultTrip) return
    const trip: SavedTrip = { version: 1, savedAt: new Date().toISOString(), ...resultTrip, flight: selectedFlight, hotel: selectedHotel, itinerary }
    try { localStorage.setItem(TRIP_KEY, JSON.stringify(trip)); setSaveMessage('Gespeichert. Deine Reise findest du unter „Meine Reise“.') }
    catch { setSaveMessage('Speichern ist auf diesem Gerät nicht möglich. Du kannst den Tagesplan drucken.') }
  }
  function chooseDestination(code: string, themes: string[]) {
    setDestination(code); setInterests(themes); setPrompt('')
    document.getElementById('reise-suche')?.scrollIntoView({ behavior: 'smooth' })
  }
  const inputClass = 'travel-input'
  const activeDestination = resultTrip?.destination || destination
  const airbnbUrl = `https://www.airbnb.com/s/${encodeURIComponent(hotelCity(activeDestination))}/homes`
  return <>
    <FlightIntro />
    <section className="hero"><div><p className="eyebrow">DEINE IDEE. DEINE REISE. DEINE KI.</p><h1>Weniger planen.<br/><em>Mehr erleben.</em></h1><p className="hero-copy">Ein Wochenende am Meer. Eine neue Lieblingsstadt. Oder einfach mal raus. Beschreibe deinen Wunsch – wir helfen dir, deine Reise zusammenzustellen.</p><a href="#reise-suche" className="hero-cta">Meine Reise beginnt hier <span>↗</span></a><p className="hero-note">FLÜGE · UNTERKÜNFTE · DEIN PERSÖNLICHER TAGESPLAN</p></div><div className="sky-card" aria-hidden="true"><div className="sky-sun"/><div className="sky-cloud cloud-a"/><div className="sky-cloud cloud-b"/><Plane className="hero-plane"/><div className="sky-ticket"><small>DEIN NÄCHSTES KAPITEL</small>Zürich &nbsp; ─── ✦ ─── &nbsp; Irgendwo neu</div><div className="sky-caption"><span>TAKE A LITTLE TIME OFF.</span><span>01 / ∞</span></div></div></section>
    <section id="reise-suche" className="section-wrap"><div className="section-heading"><div><p className="eyebrow">VON DER IDEE ZUM REISEPLAN</p><h2>Wohin zieht es dich?</h2></div><p>Dein Tempo. Deine Interessen. Dein Budget.</p></div>
      <div className="planner-card planner-grid"><form onSubmit={event => { event.preventDefault(); void handleSearch() }} className="planner-form"><fieldset disabled={loading || planning} className="planner-form"><legend className="sr-only">Reisedaten</legend>
        <label><span className="field-label">Erzähl uns von deiner Reise</span><textarea value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="Zum Beispiel: Zwei Erwachsene ab Zürich, fünf Tage in Lissabon im November. Wir mögen gutes Essen und das Meer." className={`${inputClass} prompt-field`} rows={3}/></label>
        <p className="form-note">Die KI ergänzt deine Reisedaten. Du kannst die Felder auch selbst ausfüllen. Budget und Interessen kannst du unten ergänzen.</p>
        <div className="field-grid"><label><span className="field-label">Von</span><input value={origin} onChange={event => setOrigin(event.target.value)} className={inputClass} placeholder="ZRH / Zürich"/></label><label><span className="field-label">Nach</span><input value={destination} onChange={event => setDestination(event.target.value)} className={inputClass} placeholder="Reiseziel"/></label><label><span className="field-label">Hinflug / Check-in</span><input type="date" min={todayISO()} value={date} onChange={event => setDate(event.target.value)} className={inputClass}/></label><label><span className="field-label">Rückflug / Check-out</span><input type="date" min={date || todayISO()} value={returnDate} onChange={event => setReturnDate(event.target.value)} className={inputClass}/></label><label><span className="field-label">Erwachsene</span><input type="number" min={1} max={9} step={1} value={people} onChange={event => setPeople(event.target.value)} className={inputClass}/></label><label><span className="field-label">Gesamtbudget CHF · optional</span><input type="number" min={1} max={1000000} value={budget} onChange={event => setBudget(event.target.value)} placeholder="Für alle Reisenden" className={inputClass}/></label></div>
        <div><span className="field-label">Was macht deine Reise besonders?</span><div className="interest-list">{['Strand', 'Essen & Kultur', 'Natur', 'Städtetrip', 'Abenteuer', 'Entspannung'].map(interest => <button key={interest} type="button" aria-pressed={interests.includes(interest)} className="interest-chip" onClick={() => setInterests(previous => previous.includes(interest) ? previous.filter(item => item !== interest) : [...previous, interest])}>{interest}</button>)}</div></div>
        <div className="search-options"><label><input type="checkbox" checked={searchFlights} onChange={event => setSearchFlights(event.target.checked)}/> Flüge</label><label><input type="checkbox" checked={searchHotels} onChange={event => setSearchHotels(event.target.checked)}/> Unterkünfte</label></div>
        <p className="form-note">Unterkünfte: ein Zimmer für alle Erwachsenen. Für die Hotelsuche brauchst du ein Check-out-Datum.</p>
        <button type="submit" disabled={loading || planning} className="primary-button">{loading ? 'Deine Angebote werden gesucht …' : 'Passende Angebote finden'} <span>↗</span></button>
      </fieldset>{errors.length > 0 && <div role="alert" className="notice">{errors.map((error,index) => <p key={index}>{error}</p>)}</div>}</form>
      <aside className="planner-sidebar"><p className="eyebrow">ALLES IM BLICK</p><h3>Eine Reise.<br/>Viele Möglichkeiten.</h3><div className="sidebar-step"><span>1</span>Reisewunsch beschreiben</div><div className="sidebar-step"><span>2</span>Flug & Unterkunft auswählen</div><div className="sidebar-step"><span>3</span>Persönlichen Tagesplan erstellen</div><p className="sidebar-rule">Du entscheidest, was zu dir passt. Angebote buchst du aktuell direkt beim jeweiligen Anbieter.</p></aside></div>
    </section>
    {resultTrip && <section className="section-wrap"><div className="section-heading"><h2>Deine Reise nimmt Form an.</h2><p>{hotelCity(resultTrip.destination)} · {resultTrip.people} Erwachsene</p></div><div className="results-layout"><div className="result-group" aria-live="polite">
      {loading && <p>Wir suchen deine Angebote …</p>}
      {searched.flights && <section className="result-group"><h3 className="text-xl">Flüge · {flightResults.length} Angebote</h3><p className="subtle-note">Preise laut Anbieter. Verfügbarkeit und endgültigen Preis vor der Buchung prüfen.</p>{flightResults.length ? flightResults.map(flight => <div key={flight.id}><FlightCard flight={flight}/><button className={`secondary-button offer-select ${selectedFlight?.id === flight.id ? 'chosen' : ''}`} aria-pressed={selectedFlight?.id === flight.id} onClick={() => { setSelectedFlight(selectedFlight?.id === flight.id ? null : flight); setSaveMessage('') }}>{selectedFlight?.id === flight.id ? '✓ In deiner Reise · entfernen' : 'Diesen Flug merken'}</button></div>) : <p>Keine passenden Flüge gefunden.</p>}</section>}
      {searched.hotels && <section className="result-group"><h3 className="text-xl">Unterkünfte · {hotelResults.length} Angebote</h3><p className="subtle-note">Preise für den angefragten Aufenthalt laut Anbieter. Steuern und Gebühren vor der Buchung prüfen.</p>{hotelResults.length ? hotelResults.map(hotel => <div key={hotel.id}><HotelCard hotel={hotel}/><button className={`secondary-button offer-select ${selectedHotel?.id === hotel.id ? 'chosen' : ''}`} aria-pressed={selectedHotel?.id === hotel.id} onClick={() => { setSelectedHotel(selectedHotel?.id === hotel.id ? null : hotel); setSaveMessage('') }}>{selectedHotel?.id === hotel.id ? '✓ In deiner Reise · entfernen' : 'Diese Unterkunft merken'}</button></div>) : <p>Keine passenden Unterkünfte gefunden.</p>}</section>}
      <div className="day-card"><h3>Lieber eine Ferienwohnung?</h3><p className="subtle-note">Entdecke weitere Unterkünfte auf Airbnb. Die Suche öffnet eine externe Seite; Angebote werden nicht in Book Repeat importiert.</p><a href={airbnbUrl} target="_blank" rel="noopener noreferrer" className="secondary-button">Auf Airbnb suchen ↗</a></div>
    </div><aside className="trip-panel no-print"><p className="eyebrow text-white">DEINE REISE</p><h3>{hotelCity(resultTrip.destination)}</h3><p>{resultTrip.date}{resultTrip.returnDate ? ` bis ${resultTrip.returnDate}` : ''}<br/>{resultTrip.people} Erwachsene{resultTrip.budget ? <><br/>Wunschbudget: {resultTrip.budget} CHF</> : null}</p><p>{selectedFlight ? '✓ Flug gemerkt' : '○ Flug auswählen'}<br/>{selectedHotel ? '✓ Unterkunft gemerkt' : '○ Unterkunft auswählen'}</p><p>Preise der Anbieter sind noch nicht als gemeinsame Gesamtkosten bestätigt. Deine Auswahl ist keine Buchung.</p><button disabled={loading || planning} onClick={createPlan}>{planning ? 'Dein Tagesplan entsteht …' : 'KI-Tagesplan erstellen'}</button><button disabled={loading || planning} onClick={saveTrip}>Reise auf diesem Gerät speichern</button><p>Speichert die aktuelle Reise im Browser. Eine vorherige Reise wird ersetzt.</p>{saveMessage && <p role="status">{saveMessage}</p>}<Link href="/meine-reise">Meine gespeicherte Reise ↗</Link></aside></div></section>}
    {itinerary && <section className="section-wrap"><div className="section-heading"><h2>Deine Tage. Dein Rhythmus.</h2><button className="secondary-button no-print" onClick={() => window.print()}>Reiseplan drucken</button></div><ItineraryView itinerary={itinerary}/></section>}
    <section id="entdecken" className="section-wrap"><div className="section-heading"><div><p className="eyebrow">EIN BISSCHEN FERNWEH</p><h2>Worauf hast du Lust?</h2></div><p>Inspiration wählen und deine Reisedaten ergänzen.</p></div><div className="destinations"><button className="destination dest-coast" onClick={() => chooseDestination('LIS', ['Strand', 'Essen & Kultur'])}><span className="destination-icon" aria-hidden="true">☀</span><small>01 / AM MEER</small><h3>Lissabon</h3><p>Salzige Luft. Kleine Gassen.<br/>Und Zeit für einen Pastel de Nata.</p></button><button className="destination dest-city" onClick={() => chooseDestination('BCN', ['Städtetrip', 'Essen & Kultur'])}><span className="destination-icon" aria-hidden="true">◈</span><small>02 / IN DER STADT</small><h3>Barcelona</h3><p>Architektur, Tapas und<br/>ein Abend am Mittelmeer.</p></button><button className="destination dest-nature" onClick={() => chooseDestination('KEF', ['Natur', 'Abenteuer'])}><span className="destination-icon" aria-hidden="true">△</span><small>03 / DRAUSSEN</small><h3>Island</h3><p>Weite Landschaften.<br/>Für deine nächste Auszeit.</p></button></div></section>
  </>
}
