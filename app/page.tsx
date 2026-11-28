'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { airportCode, hotelCityName, resolveCity, unresolvedCityMessage } from '@/lib/city-lookup'
import FlightCard from '@/components/FlightCard'
import HotelCard from '@/components/HotelCard'
import SavedSearches from '@/components/SavedSearches'
import ServiceNotice from '@/components/ServiceNotice'
import FavoritesPanel from '@/components/FavoritesPanel'
import { useFavorites } from '@/components/useFavorites'
import { favoriteFromFlight, favoriteFromHotel, favoriteKey } from '@/lib/favorites'
import { cheapestCombination } from '@/lib/trip-total'
import TravelLanding, { DestinationIdeas } from '@/components/TravelLanding'
import type { HotelOffer } from '@/lib/hotel-offers'
import { flightQuery, hotelQuery, validateTravelDates } from '@/lib/trip-search'
import { record, type FlightOffer } from '@/lib/flight-offers'
import { normalizeParsedTrip } from '@/lib/parsed-trip'

import { requestJson, loadFlights, loadHotels, settleSearch } from '@/lib/search-client'

const correctCitySpellingWithGPT = async (input: string, signal?: AbortSignal): Promise<string> => {
  try {
    const data = await requestJson('/api/ai-correct-city', {
      signal,
      method: 'POST',
      body: JSON.stringify({ input }),
      headers: { 'Content-Type': 'application/json' }
    })
    const corrected = record(data).corrected
    return typeof corrected === 'string' && corrected.trim() ? corrected.trim() : input
  } catch (err) {
    if (signal?.aborted) throw err
    return input
  }
}

type ResolvedCity = { ok: true; code: string | null; name: string; corrected?: string } | { ok: false; message: string }

// Known cities and IATA codes are resolved locally; only unknown input goes to the OpenAI city correction.
const resolveCityInput = async (label: string, input: string, needsAirport: boolean, signal?: AbortSignal): Promise<ResolvedCity> => {
  const local = resolveCity(input)
  const code = airportCode(local)
  if (code) return { ok: true, code, name: local.kind === 'found' ? local.city : input.trim() }
  if (local.kind === 'ambiguous') return { ok: false, message: unresolvedCityMessage(label, input.trim(), local) }
  const corrected = await correctCitySpellingWithGPT(input.trim(), signal)
  const retry = resolveCity(corrected)
  const correctedCode = airportCode(retry)
  if (correctedCode) return { ok: true, code: correctedCode, name: retry.kind === 'found' ? retry.city : corrected, corrected: retry.kind === 'found' ? retry.city : corrected }
  // Hotels do not need an airport: the provider location search gets the (corrected) name.
  if (!needsAirport) return { ok: true, code: null, name: corrected, ...(cityKeyChanged(input, corrected) ? { corrected } : {}) }
  return { ok: false, message: unresolvedCityMessage(label, input.trim(), local) }
}
const cityKeyChanged = (a: string, b: string) => a.trim().toLowerCase() !== b.trim().toLowerCase()

export default function Home() {
  const [origin, setOrigin] = useState('ZRH')
  const [destination, setDestination] = useState('BER')
  const [date, setDate] = useState('')
  const [returnDate, setReturnDate] = useState('')
  const [people, setPeople] = useState<number>(1)
  const [searchFlights, setSearchFlights] = useState(true)
  const [searchHotels, setSearchHotels] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [flightResults, setFlightResults] = useState<FlightOffer[]>([])
  const [recommendedFlightIds, setRecommendedFlightIds] = useState<string[]>([])
  const [promptWarning, setPromptWarning] = useState('')
  const [directOnly, setDirectOnly] = useState(false)
  const [flightSort, setFlightSort] = useState<'price' | 'price-desc' | 'stops'>('price')
  const [hotelResults, setHotelResults] = useState<HotelOffer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [invalidFields, setInvalidFields] = useState<string[]>([])
  const errorSummary = useRef<HTMLParagraphElement>(null)

  const [flightError, setFlightError] = useState('')
  const [hotelError, setHotelError] = useState('')
  const [flightDone, setFlightDone] = useState(false)
  const [hotelDone, setHotelDone] = useState(false)
  const [today, setToday] = useState('')
  const favorites = useFavorites()
  // Set after mount so server and client render the same markup.
  useEffect(() => { setToday(new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' })) }, [])
  const searchInProgress = useRef(false)
  const activeSearch = useRef<AbortController | null>(null)
  useEffect(() => () => activeSearch.current?.abort(), [])
  useEffect(() => {
    if (error && !loading) errorSummary.current?.focus()
  }, [error, loading])

  const handleSearch = async () => {
    if (searchInProgress.current) return
    searchInProgress.current = true
    const controller = new AbortController()
    activeSearch.current = controller
    setError('')
    setInvalidFields([])
    setFlightError('')
    setHotelError('')
    setFlightDone(false)
    setHotelDone(false)
    setLoading(true)
    setFlightResults([])
    setRecommendedFlightIds([])
    setPromptWarning('')
    setHotelResults([])

    let newOrigin = origin.trim()
    let newDestination = destination.trim()
    let newDate = date
    let newReturnDate = returnDate
    let newPeople = people
    const notes: string[] = []

    try {
      if (prompt.trim() !== '') {
        try {
        const parsed = normalizeParsedTrip(await requestJson('/api/parse-trip', {
          signal: controller.signal,
          method: 'POST',
          body: JSON.stringify({ prompt }),
          headers: { 'Content-Type': 'application/json' }
        }))

        if (parsed.origin) { newOrigin = parsed.origin; setOrigin(parsed.origin) }
        else if (searchFlights) notes.push(`Kein Abflugort im Reisewunsch erkannt, verwendet wird «${newOrigin}» aus dem Formular.`)
        if (parsed.destination) { newDestination = parsed.destination; setDestination(parsed.destination) }
        else notes.push(`Kein Reiseziel im Reisewunsch erkannt, verwendet wird «${newDestination}» aus dem Formular.`)
        if (!parsed.date) notes.push(newDate ? `Kein Reisedatum im Reisewunsch erkannt, verwendet wird ${newDate} aus dem Formular.` : 'Kein Reisedatum im Reisewunsch erkannt. Bitte das Datum im Formular wählen.')
        if (!parsed.people) notes.push(`Keine Personenzahl im Reisewunsch erkannt, verwendet wird die Angabe aus dem Formular (Erwachsene: ${newPeople}).`)

        if (typeof parsed?.date === 'string' && parsed.date) {
          newDate = parsed.date
          setDate(newDate)
        }
        if (typeof parsed?.returnDate === 'string' && parsed.returnDate) {
          newReturnDate = parsed.returnDate
          setReturnDate(newReturnDate)
        }

        if (typeof parsed?.people === 'number' && parsed.people > 0) {
          newPeople = parsed.people
          setPeople(newPeople)
        }
        } catch (err) {
          if (controller.signal.aborted) throw err
          notes.push('Der Reisewunsch konnte nicht ausgewertet werden. Wir verwenden die Angaben in den Formularfeldern. Bitte prüfe sie vor der Buchung.')
        }
      }

      setPromptWarning(notes.join(' '))
      const dateError = validateTravelDates(newDate, newReturnDate, searchHotels)
      if (dateError || !Number.isInteger(newPeople) || newPeople < 1 || newPeople > 9 || (!searchFlights && !searchHotels)) {
        setInvalidFields(dateError ? ['departure-date', 'return-date'] : !Number.isInteger(newPeople) || newPeople < 1 || newPeople > 9 ? ['adults'] : ['search-flights', 'search-hotels'])
        setError(dateError || 'Bitte 1–9 Erwachsene und mindestens eine Suchoption wählen.')
        return
      }

      if (!newDestination) {
        setInvalidFields(['destination'])
        setError('Bitte ein Reiseziel eingeben.')
        return
      }
      if (searchFlights && !newOrigin) {
        setInvalidFields(['origin'])
        setError('Bitte einen Abflugort eingeben.')
        return
      }
      const originResult = searchFlights ? await resolveCityInput('Abflugort', newOrigin, true, controller.signal) : null
      const destinationResult = await resolveCityInput('Reiseziel', newDestination, searchFlights, controller.signal)
      for (const [result, field, setField, label] of [[originResult, 'origin', setOrigin, 'Abflugort'], [destinationResult, 'destination', setDestination, 'Reiseziel']] as const) {
        if (!result) continue
        if (!result.ok) {
          setPromptWarning(notes.join(' '))
          setInvalidFields([field])
          setError(result.message)
          return
        }
        if (result.corrected) { setField(result.corrected); notes.push(`${label} erkannt als «${result.corrected}»${result.code ? ` (${result.code})` : ''}.`) }
      }
      const originCode = originResult?.ok ? originResult.code : null
      const destinationCode = destinationResult.ok ? destinationResult.code : null
      setPromptWarning(notes.join(' '))

      if (searchFlights && (!originCode || !destinationCode || originCode === destinationCode)) {
        setInvalidFields(['origin', 'destination'])
        setError('Bitte zwei unterschiedliche Städte oder gültige Flughafencodes eingeben.')
        return
      }

      const tasks: Promise<void>[] = []
      if (searchFlights) {
        tasks.push(settleSearch(
          () => loadFlights(flightQuery(originCode!, destinationCode!, newDate, newReturnDate, newPeople), controller.signal, setRecommendedFlightIds),
          offers => { setFlightResults(offers); setFlightDone(true) },
          message => { setFlightError(message); setFlightDone(true) }
        ))
      }
      if (searchHotels) {
        const cityName = destinationResult.ok ? hotelCityName(destinationResult.name) : newDestination
        tasks.push(settleSearch(
          () => loadHotels(hotelQuery(cityName, newDate, newReturnDate, newPeople), controller.signal),
          offers => { setHotelResults(offers); setHotelDone(true) },
          message => { setHotelError(message); setHotelDone(true) }
        ))
      }
      await Promise.all(tasks)
    } catch (err) {
      console.error('Fehler bei der Suche:', err)
      setError(err instanceof Error ? err.message : 'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.')
    } finally {
      activeSearch.current = null
      searchInProgress.current = false
      setLoading(false)
    }
  }

  const visibleFlights = useMemo(() => flightResults.filter(flight => !directOnly || (flight.stops === 0 && (!flight.returnLeg || flight.returnLeg.stops === 0))).sort((a, b) => {
    if (flightSort === 'price-desc') return b.price - a.price
    if (flightSort === 'stops') return (a.stops + (a.returnLeg?.stops || 0)) - (b.stops + (b.returnLeg?.stops || 0)) || a.price - b.price
    return a.price - b.price
  }), [flightResults, directOnly, flightSort])
  const combination = useMemo(() => cheapestCombination(flightResults, hotelResults), [flightResults, hotelResults])
  const fieldAccessibility = (id: string) => ({
    'aria-invalid': invalidFields.includes(id) || undefined,
    'aria-describedby': invalidFields.includes(id) ? 'search-error' : undefined,
  })

  const chooseDestination = (code: string) => {
    setDestination(code)
    setPrompt('')
    const field = document.getElementById('destination')
    field?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'center' })
    field?.focus({ preventScroll: true })
  }

  return <>
    <section id="reise-suche" className="section-wrap search-first" aria-labelledby="search-title">
      <div className="section-heading"><div><p className="eyebrow">VON DER IDEE ZUR REISE</p><h1 id="search-title" tabIndex={-1}>Wohin zieht es dich?</h1></div><p>Dein Ziel. Deine Daten. Deine Auswahl.</p></div>
      <ServiceNotice/>
      <div className="planner-card planner-grid">
        <div>
          <form onSubmit={event => { event.preventDefault(); void handleSearch() }} className="planner-form">
            <fieldset disabled={loading} className="planner-form">
              <legend className="sr-only">Reisedaten</legend>
              <label htmlFor="trip-prompt"><span className="field-label">Reisewunsch (optional)</span>
                <textarea id="trip-prompt" maxLength={4000} value={prompt} onChange={event => setPrompt(event.target.value)} placeholder="Zum Beispiel: Zwei Erwachsene ab Zürich nach Berlin vom 10. bis 14. November." className="travel-input prompt-field" rows={3}/>
              </label>
              <p className="form-note">Die KI kann deine Reisedaten ergänzen. Du kannst die Felder auch selbst ausfüllen.</p>
              <div className="field-grid">
                <label htmlFor="origin"><span className="field-label">Abflugort</span><input id="origin" {...fieldAccessibility('origin')} value={origin} maxLength={120} onChange={event => setOrigin(event.target.value)} placeholder="ZRH / Zürich" className="travel-input"/></label>
                <label htmlFor="destination"><span className="field-label">Reiseziel</span><input id="destination" {...fieldAccessibility('destination')} value={destination} maxLength={120} onChange={event => setDestination(event.target.value)} placeholder="BER / Berlin" className="travel-input"/></label>
                <label htmlFor="departure-date"><span className="field-label">Hinreise / Check-in</span><input id="departure-date" {...fieldAccessibility('departure-date')} type="date" min={today || undefined} value={date} onChange={event => setDate(event.target.value)} className="travel-input"/></label>
                <label htmlFor="return-date"><span className="field-label">Rückreise / Check-out</span><input id="return-date" {...fieldAccessibility('return-date')} type="date" min={date || today || undefined} value={returnDate} onChange={event => setReturnDate(event.target.value)} className="travel-input"/></label>
                <label htmlFor="adults"><span className="field-label">Erwachsene (1–9)</span><input id="adults" {...fieldAccessibility('adults')} type="number" min={1} max={9} step={1} value={people || ''} onChange={event => setPeople(Number(event.target.value))} className="travel-input"/></label>
              </div>
              <div className="search-options">
                <label><input id="search-flights" {...fieldAccessibility('search-flights')} type="checkbox" checked={searchFlights} onChange={event => setSearchFlights(event.target.checked)}/> Flüge suchen</label>
                <label><input id="search-hotels" {...fieldAccessibility('search-hotels')} type="checkbox" checked={searchHotels} onChange={event => setSearchHotels(event.target.checked)}/> Hotels suchen</label>
              </div>
              <p className="form-note">Hotelsuche: ein Zimmer für alle Erwachsenen. Bitte ein Check-out-Datum angeben.</p>
              <button type="submit" disabled={loading} aria-busy={loading} className="primary-button">{loading ? 'Angebote werden gesucht …' : 'Suche starten'} <span aria-hidden="true">↗</span></button>
            </fieldset>
            {loading && <button type="button" onClick={() => activeSearch.current?.abort()} className="secondary-button">Suche abbrechen</button>}
            {promptWarning && <p role="status" className="notice notice-warning">{promptWarning}</p>}
            {error && <p id="search-error" ref={errorSummary} tabIndex={-1} role="alert" className="notice">{error}</p>}
            <p role="status" aria-atomic="true" className="loading-state">{loading ? `Wir suchen deine ${searchFlights && searchHotels ? 'Flug- und Hotelangebote' : searchFlights ? 'Flugangebote' : 'Hotelangebote'} …` : flightDone || hotelDone ? `Suche beendet. ${flightDone ? `${flightResults.length} Flugangebote. ` : ''}${hotelDone ? `${hotelResults.length} Hotelangebote.` : ''}` : ''}</p>
            {flightError && <p role="alert" className="notice">Flüge: {flightError}</p>}
            {hotelError && <p role="alert" className="notice">Hotels: {hotelError}</p>}
            {flightDone && !flightError && flightResults.length === 0 && <p role="status" className="empty-results">Keine passenden Flüge gefunden.</p>}
            {hotelDone && !hotelError && hotelResults.length === 0 && <p role="status" className="empty-results">Keine passenden Hotels gefunden.</p>}
          </form>
          <SavedSearches current={{ origin, destination, date, returnDate, people, searchFlights, searchHotels }} disabled={loading} onRestore={value => {
            setOrigin(value.origin); setDestination(value.destination); setDate(value.date); setReturnDate(value.returnDate)
            setPeople(value.people); setSearchFlights(value.searchFlights); setSearchHotels(value.searchHotels); setPrompt('')
            setFlightResults([]); setRecommendedFlightIds([]); setPromptWarning(''); setHotelResults([]); setError(''); setInvalidFields([]); setFlightError(''); setHotelError(''); setFlightDone(false); setHotelDone(false)
            setDirectOnly(false); setFlightSort('price')
          }}/>
        </div>
        <aside className="planner-sidebar" aria-label="So funktioniert die Suche">
          <p className="eyebrow">ALLES IM BLICK</p><h3>Eine Reise.<br/>Viele Möglichkeiten.</h3>
          <div className="sidebar-step"><span>1</span>Reisedaten eingeben</div><div className="sidebar-step"><span>2</span>Flüge und Hotels vergleichen</div><div className="sidebar-step"><span>3</span>Beim Anbieter buchen</div>
          <p className="sidebar-rule">Du buchst und bezahlst direkt beim jeweiligen Anbieter. Verfügbarkeit, Endpreis und Bedingungen bitte dort prüfen.</p>
        </aside>
      </div>
      <p className="subtle-note" style={{ marginTop: 16 }}>Die Beta hilft dir beim Vergleichen. Buchung und Zahlung erfolgen beim Anbieter.</p>
      <Link href="/kontakt#beta-feedback" className="feedback-link">Problem melden oder Feedback geben</Link>
    </section>
    {combination && <section className="section-wrap" aria-labelledby="combination-title">
      <div className="combination-card">
        <p className="eyebrow">GÜNSTIGSTE KOMBINATION</p>
        <h2 id="combination-title">Flug + Hotel ab {combination.total.toLocaleString('de-CH', { minimumFractionDigits: 2 })} {combination.currency}</h2>
        <p>{combination.flight.departure.iataCode} → {combination.flight.arrival.iataCode} mit {combination.flight.airline} ({combination.flight.price.toLocaleString('de-CH', { minimumFractionDigits: 2 })} {combination.currency}) und {combination.hotel.name} ({(combination.hotel.price ?? 0).toLocaleString('de-CH', { minimumFractionDigits: 2 })} {combination.currency}).</p>
        <p className="subtle-note">Summe der Anbieterpreise in derselben Währung, ohne Umrechnung. Ob ein Preis pro Person oder für alle Reisenden gilt, beim Anbieter prüfen. Beide Angebote werden separat gebucht.</p>
      </div>
    </section>}
    {flightResults.length > 0 && <section className="section-wrap" aria-labelledby="flights-title">
      <div className="section-heading"><h2 id="flights-title">Flüge · {flightResults.length} Angebote</h2><p>Alle gültigen Angebote aus der aktuellen Anbieterantwort.</p></div>
      <div className="result-toolbar">
        <label htmlFor="flight-sort">Sortieren nach<br/><select id="flight-sort" value={flightSort} onChange={event => setFlightSort(event.target.value as typeof flightSort)}><option value="price">Preis: günstig zuerst</option><option value="price-desc">Preis: teuer zuerst</option><option value="stops">Wenigste Zwischenstopps</option></select></label>
        <label><input type="checkbox" checked={directOnly} onChange={event => setDirectOnly(event.target.checked)}/> Nur Direktflüge (Hin- und Rückflug)</label>
        <p role="status" className="subtle-note">{visibleFlights.length} von {flightResults.length} Angeboten sichtbar</p>
      </div>
      <p className="subtle-note">Empfehlungen vergleichen eine Auswahl der günstigsten Angebote. Bei KI-Ausfall zählen Preis und Zwischenstopps.</p>
      {visibleFlights.length === 0 ? <div className="empty-results"><p>Keine Direktflüge in diesen Angeboten gefunden.</p><button type="button" onClick={() => setDirectOnly(false)} className="secondary-button">Alle Flüge anzeigen</button></div> : <div className="offer-grid">{visibleFlights.map(flight => <div key={flight.id} className="offer-wrap">
        <FlightCard flight={flight} recommended={recommendedFlightIds.includes(flight.id)} favorite={{ saved: favorites.has(favoriteKey('flight', flight.id)), disabled: !favorites.ready, onToggle: () => favorites.toggle(favoriteFromFlight(flight)) }}/>
      </div>)}</div>}
    </section>}
    {hotelResults.length > 0 && <section className="section-wrap" aria-labelledby="hotels-title">
      <div className="section-heading"><h2 id="hotels-title">Hotels · {hotelResults.length} Angebote</h2><p>Für deinen angefragten Aufenthalt.</p></div>
      <div className="offer-grid">{hotelResults.map(hotel => <HotelCard key={hotel.id} hotel={hotel} favorite={{ saved: favorites.has(favoriteKey('hotel', hotel.id || hotel.name)), disabled: !favorites.ready, onToggle: () => favorites.toggle(favoriteFromHotel(hotel)) }}/>)}</div>
    </section>}
    <FavoritesPanel items={favorites.items} message={favorites.message} onRemove={favorites.remove} onClear={favorites.clear}/>
    <TravelLanding />
    <DestinationIdeas onChoose={chooseDestination} disabled={loading}/>
  </>
}
