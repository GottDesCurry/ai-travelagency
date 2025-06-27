// Testdeployment
'use client'

import { useState } from 'react'
import iataCodes from '@/data/iata-codes.json'
import cityTranslations from '@/data/city-translations.json'
import FlightCard from '@/components/FlightCard'
import HotelCard from '@/components/HotelCard'
import { useEffect } from 'react'


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

const MAX_YEARS_INTO_FUTURE = 2

const isValidFutureDate = (inputDate: string): boolean => {
  const date = new Date(inputDate)
  const now = new Date()
  return date.getTime() > now.getTime() && date.getFullYear() - now.getFullYear() <= MAX_YEARS_INTO_FUTURE
}

const getClosestFutureDate = (month: number, day: number): string => {
  const now = new Date()
  const year = (now.getMonth() + 1 > month || (now.getMonth() + 1 === month && now.getDate() > day))
    ? now.getFullYear() + 1
    : now.getFullYear()
  const futureDate = new Date(year, month - 1, day)
  console.log(`⚠️ Fallback auf zukünftiges Datum: ${futureDate.toISOString().split('T')[0]}`)
  return futureDate.toISOString().split('T')[0]
}

const normalizeCity = (input: string): string => {
  const inputNormalized = input.toLowerCase().trim()
  const found = iataCodes.find((item: any) => {
    return (
      item.city.toLowerCase() === inputNormalized ||
      item.city.toLowerCase().includes(inputNormalized) ||
      input.toUpperCase() === item.code ||
      inputNormalized.includes(item.city.toLowerCase())
    )
  })
  return found?.city || input
}

const correctCitySpellingWithGPT = async (input: string): Promise<string> => {
  try {
    const res = await fetch('/api/ai-correct-city', {
      method: 'POST',
      body: JSON.stringify({ input }),
      headers: { 'Content-Type': 'application/json' }
    })
    const data = await res.json()
    return data.corrected || input
  } catch (err) {
    console.warn('GPT-Korrektur fehlgeschlagen:', err)
    return input
  }
}

export default function Home() {
  const [origin, setOrigin] = useState('ZRH')
  const [destination, setDestination] = useState('BER')
  const [date, setDate] = useState('2025-07-01')
  const [returnDate, setReturnDate] = useState('')
  const [people, setPeople] = useState<number>(1)
  const [searchFlights, setSearchFlights] = useState(true)
  const [searchHotels, setSearchHotels] = useState(true)
  const [prompt, setPrompt] = useState('')
  const [flightResults, setFlightResults] = useState<any[]>([])
  const [hotelResults, setHotelResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

useEffect(() => {
  const timeout = setTimeout(() => {
    const errorBox = document.getElementById('error-box')
    if (errorBox) errorBox.style.display = 'none'
  }, 5000)
  return () => clearTimeout(timeout)
}, [])


  const getIataCode = (cityName: string): string | null => {
    const match = iataCodes.find(
      (item: any) => item.city.toLowerCase() === cityName.toLowerCase()
    )
    return match ? match.code : null
  }

  const handleSearch = async () => {
	setError('')
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
        const promptRes = await fetch('/api/parse-trip', {
          method: 'POST',
          body: JSON.stringify({ prompt }),
          headers: { 'Content-Type': 'application/json' }
        })
        const parsed = await promptRes.json()

        if (parsed.origin) {
          const corrected = await correctCitySpellingWithGPT(parsed.origin)
          const city = normalizeCity(corrected)
          if (getIataCode(city)) {
            newOrigin = city
            setOrigin(city)
          }
        }

        if (parsed.destination) {
          const corrected = await correctCitySpellingWithGPT(parsed.destination)
          const city = normalizeCity(corrected)
          if (getIataCode(city)) {
            newDestination = city
            setDestination(city)
          }
        }

        if (parsed.date) {
          const d = new Date(parsed.date)
          newDate = isValidFutureDate(parsed.date)
            ? parsed.date
            : getClosestFutureDate(d.getMonth() + 1, d.getDate())
          setDate(newDate)
        }

        if (parsed.returnDate) {
          const d = new Date(parsed.returnDate)
          newReturnDate = isValidFutureDate(parsed.returnDate)
            ? parsed.returnDate
            : getClosestFutureDate(d.getMonth() + 1, d.getDate())
          setReturnDate(newReturnDate)
        }

        if (parsed.people !== undefined && parsed.people > 0) {
          newPeople = parsed.people
          setPeople(newPeople)
        }
      }

      if (newDate && newReturnDate && newReturnDate < newDate) {
        setError('Das Rückflugdatum darf nicht vor dem Hinflugdatum liegen.')
        return
      }

      const originCode = getIataCode(newOrigin) || (newOrigin.length === 3 ? newOrigin.toUpperCase() : null)
      const destinationCode = getIataCode(newDestination) || (newDestination.length === 3 ? newDestination.toUpperCase() : null)

      if (!originCode || !destinationCode) {
        setError('Ungültiger Abflug- oder Zielort – bitte gib eine Stadt mit bekanntem Flughafen ein.')
        return
      }

      if (searchFlights) {
        const combinedRes = await fetch(`/api/flights-aggregated?origin=${originCode}&destination=${destinationCode}&date=${newDate}`)
		const combined = await combinedRes.json()


        const aiRes = await fetch('/api/ai', {
          method: 'POST',
          body: JSON.stringify(combined),
          headers: { 'Content-Type': 'application/json' }
        })

        const topFlights = await aiRes.json()
        setFlightResults(topFlights)
      }

      if (searchHotels) {
        const translatedCity = translateCityName(newDestination)
        const locRes = await fetch(`/api/hotels-location?name=${translatedCity}`)
        const locData = await locRes.json()
        const destId = locData?.dest_id

        if (!destId) {
          setError('Kein Hotel-Ort gefunden – bitte überprüfe dein Reiseziel.')
          return
        }

        const hotelRes = await fetch(`/api/hotels?dest_id=${destId}`)
        const hotels = await hotelRes.json()
        setHotelResults(hotels?.result || [])
      }
    } catch (err) {
      console.error('Fehler bei der Suche:', err)
      setError('Es ist ein Fehler aufgetreten. Bitte versuche es später erneut.')
    } finally {
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
        className="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700 transition"
      >
        🔍 Suche starten
      </button>

      {error && (
        <div
          id="error-box"
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

      {!loading && (flightResults.length > 0 || hotelResults.length > 0) && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 text-sm rounded text-center">
          ✅ Reisevorschläge erfolgreich geladen!
        </div>
      )}
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
);
} 

export default Page;



