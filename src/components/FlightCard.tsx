// components/FlightCard.tsx – Premium Version mit Visual Design & UX Boost + No-Result Fallback
'use client'

import React from 'react'
import Image from 'next/image'

export default function FlightCard({ flight }: { flight: any }) {
  if (!flight || Object.keys(flight).length === 0) {
    return (
      <div className="text-center text-sm text-gray-600 border border-gray-200 bg-white/70 backdrop-blur-md rounded-xl p-5">
        ❌ Leider wurden keine passenden Flüge gefunden.
      </div>
    )
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleString('de-CH', {
    weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
  })

  const logoUrl = `https://content.airhex.com/content/logos/airlines_${flight.airlineCode}_50_50_s.png?background=white&fallback=airline.png`

  return (
    <div className="FlightCard border border-blue-100 bg-white/70 backdrop-blur-md rounded-xl p-5 shadow-md flex flex-col md:flex-row gap-4 items-start md:items-center">
      {/* Airline & Route Info */}
      <div className="flex items-center gap-4 w-full md:w-1/3">
        <Image
          src={logoUrl}
          alt={flight.airline}
          width={50}
          height={50}
          className="rounded shadow-sm bg-white"
        />
        <div>
          <p className="text-sm text-gray-500">{flight.airline}</p>
          <p className="text-lg font-semibold text-gray-800">{flight.departure.iataCode} → {flight.arrival.iataCode}</p>
          <p className="text-xs text-gray-400">🔁 {flight.stops === 0 ? 'Direktflug' : `${flight.stops} Stop(s)`}</p>
        </div>
      </div>

      {/* Zeiten & Dauer */}
      <div className="text-sm text-gray-700 w-full md:w-1/3 space-y-1">
        <p>🕑 Abflug: {formatDate(flight.departure.at)}</p>
        <p>🛬 Ankunft: {formatDate(flight.arrival.at)}</p>
        <p>⏱️ Dauer: {flight.duration.replace('PT', '').toLowerCase()}</p>
      </div>

      {/* Preis + Button */}
      <div className="flex flex-col items-end w-full md:w-1/3">
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-xl font-bold">
          {flight.price} {flight.currency}
        </div>
        <a
          href={flight.bookingLink}
          target="_blank"
          className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow text-sm transition"
        >
          🔗 Jetzt buchen
        </a>
      </div>
    </div>
  )
}
