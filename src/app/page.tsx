// Testdeployment
'use client'

import { useState, useRef } from 'react'
import iataCodes from '@/data/iata-codes.json'
import FlightCard from '@/components/FlightCard'
import HotelCard from '@/components/HotelCard'
import type { HotelOffer } from '@/lib/hotel-offers'
import { flightQuery, hotelQuery, validateTravelDates } from '@/lib/trip-search'
import type { FlightOffer } from '@/lib/flight-offers'

import { requestJson, loadFlights, loadHotels, settleSearch } from '@/lib/search-client'

const translateCityName = (name: string): string => {
  const nameNormalized = name.trim().toLowerCase()
  const translations: Record<string, string> = {
    'zürich': 'Zurich', 'zurich': 'Zurich', 'lissabon': 'Lisbon', 'lisbon': 'Lisbon',
    'berlin': 'Berlin', 'genf': 'Geneva', 'geneva': 'Geneva', 'mailand': 'Milan',
    'milan': 'Milan', 'köln': 'Cologne', 'cologne': 'Cologne', 'münchen': 'Munich',
    'munich': 'Munich', 'venedig': 'Venice', 'venice': 'Venice', 'prag': 'Prague', 'prague': 'Prague'
  }
  return translations[nameNormalized] || name
}

const normalizeCity = (input: string): string => {
  const inputNormalized = input.toLowerCase().trim()
  const found = iataCodes.find((item: any) => (
    item.city.toLowerCase() === inputNormalized ||
    item.city.toLowerCase().includes(inputNormalized) ||
    input.toUpperCase() === item.code ||
    inputNormalized.includes(item.city.toLowerCase())
  ))
  return found?.city || input
}

const correctCitySpellingWithGPT = async (input: string): Promise<string> => {
  try {
    const data = await requestJson('/api/ai-correct-city', {
      method: 'POST',
      body: JSON.stringify({ input }),
      headers: { 'Content-Type': 'application/json' }
    })
    return data.corrected || input
  } catch (err) {
    console.warn('GPT-Korrektur fehlgeschlagen:', err)
    return input
  }
}

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
  const [hotelResults, setHotelResults] = useState<HotelOffer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [flightError, setFlightError] = useState('')
  const [hotelError, setHotelError] = useState('')
  const [flightDone, setFlightDone] = useState(false)
  const [hotelDone, setHotelDone] = useState(false)
  const searchInProgress = useRef(false)

  const getIataCode = (cityName: string): string | null => {
    const match = iataCodes.find(
      (item: any) => item.city.toLowerCase() === cityName.toLowerCase()
    )
    return match ? match.code : null
  }

  const handleSearch = async () => {
    if (searchInProgress.current) return
    searchInProgress.current = true
    setError('')
    setFlightError('')
    setHotelError('')
    setFlightDone(false)
    setHotelDone(false)
    setLoading(true)
    setFlightResults([])
    setHotelResults([])

    let newOrigin = origin
    let newDestination = destination
    let newDate = date
    let newReturnDate = returnDate
    let newPeople = people

    try {
      if (prompt.trim() !== '') {
        const parsed = await requestJson('/api/parse-trip', {
          method: 'POST',
          body: JSON.stringify({ prompt }),
          headers: { 'Content-Type': 'application/json' }
        })

        if (typeof parsed?.origin === 'string' && parsed.origin) {
          const corrected = await correctCitySpellingWithGPT(parsed.origin)
          const city = normalizeCity(corrected)
          if (getIataCode(city)) {
            newOrigin = city
            setOrigin(city)
          }
        }

        if (typeof parsed?.destination === 'string' && parsed.destination) {
          const corrected = await correctCitySpellingWithGPT(parsed.destination)
          const city = normalizeCity(corrected)
          if (getIataCode(city)) {
            newDestination = city
            setDestination(city)
          }
        }

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
      }

      const dateError = validateTravelDates(newDate, newReturnDate, searchHotels)
      if (dateError || !Number.isInteger(newPeople) || newPeople < 1 || newPeople > 9 || (!searchFlights && !searchHotels)) {
        setError(dateError || 'Bitte 1–9 Erwachsene und mindestens eine Suchoption wählen.')
        return
      }

      const originCode = getIataCode(newOrigin) || (newOrigin.length === 3 ? newOrigin.toUpperCase() : null)
      const destinationCode = getIataCode(newDestination) || (newDestination.length === 3 ? newDestination.toUpperCase() : null)

      if (searchFlights && (!originCode || !destinationCode)) {
        setError('Ungültiger Abflug- oder Zielort – bitte gib eine Stadt mit bekanntem Flughafen ein.')
        return
      }

      const tasks: Promise<void>[] = []
      if (searchFlights) {
        tasks.push(settleSearch(
          () => loadFlights(flightQuery(originCode!, destinationCode!, newDate, newReturnDate, newPeople)),
          offers => { setFlightResults(offers); setFlightDone(true) },
          message => { setFlightError(message); setFlightDone(true) }
        ))
      }
      if (searchHotels) {
        const cityName = iataCodes.find(item => item.code === newDestination.toUpperCase())?.city || newDestination
        tasks.push(settleSearch(
          () => loadHotels(hotelQuery(translateCityName(cityName), newDate, newReturnDate, newPeople)),
          offers => { setHotelResults(offers); setHotelDone(true) },
          message => { setHotelError(message); setHotelDone(true) }
        ))
      }
      await Promise.all(tasks)
    } catch (err) {
      console.error('Fehler bei der Suche:', err)
      setError(err instanceof Error ? err.message : 'Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.')
    } finally {
      searchInProgress.current = false
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 space-y-12 w-full">
      <div className="bg-white/80 backdrop-blur-lg shadow-lg rounded-xl p-6 md:p-10 max-w-xl w-full space-y-6">
        <p className="text-sm text-gray-500">
          z. B. Ich reise mit 3 Freunden nach Malaga vom 10. bis 14. August
        </p>
        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Reiseplan beschreiben..."
          className="w-full border border-gray-300 rounded px-4 py-2 text-sm"
          rows={2}
        />
        <div className="grid grid-cols-2 gap-4">
          <input value={origin} onChange={e => setOrigin(e.target.value)} placeholder="ZRH" className="px-4 py-2 rounded border border-gray-300" />
          <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="BER" className="px-4 py-2 rounded border border-gray-300" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="px-4 py-2 rounded border border-gray-300" />
          <input type="date" value={returnDate} onChange={e => setReturnDate(e.target.value)} className="px-4 py-2 rounded border border-gray-300" />
        </div>
        <input
          type="number"
          min={1}
          value={people || ''}
          onChange={e => setPeople(parseInt(e.target.value))}
          placeholder="Anzahl Personen"
          className="w-full px-4 py-2 rounded border border-gray-300"
        />
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={searchFlights} onChange={e => setSearchFlights(e.target.checked)} />
            ✈️ Flüge suchen
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={searchHotels} onChange={e => setSearchHotels(e.target.checked)} />
            🏨 Hotels suchen
          </label>
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          aria-busy={loading}
          className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
        >
          🔍 Suche starten
        </button>

        {error && (
          <div
            role="alert"
            className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 text-sm rounded text-center"
          >
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-800" />
          </div>
        )}

        {flightError && <p role="alert" className="text-red-700">Flüge: {flightError}</p>}
        {hotelError && <p role="alert" className="text-red-700">Hotels: {hotelError}</p>}
        {flightDone && !flightError && flightResults.length === 0 && <p role="status">Keine passenden Flüge gefunden.</p>}
        {hotelDone && !hotelError && hotelResults.length === 0 && <p role="status">Keine passenden Hotels gefunden.</p>}
      </div>

      {hotelResults.length > 0 && (
        <div className="w-full max-w-3xl space-y-4">
          <h2 className="text-2xl font-semibold">🏨 Hotelvorschläge</h2>
          {hotelResults.map((hotel, i) => (
            <HotelCard key={i} hotel={hotel} />
          ))}
        </div>
      )}

      {flightResults.length > 0 && (
        <div className="w-full max-w-3xl space-y-4">
          <h2 className="text-2xl font-semibold">✈️ Top 3 Flüge</h2>
          {flightResults.map((flight, i) => (
            <FlightCard key={i} flight={flight} />
          ))}
        </div>
      )}
    </div>
  )
}
