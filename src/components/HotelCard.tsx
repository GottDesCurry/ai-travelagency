// components/HotelCard.tsx – Ultimate Version mit Score, Bewertungen, Tags & UI-Finesse
'use client'

import React from 'react'
import Image from 'next/image'
import { Heart } from 'lucide-react'

export default function HotelCard({ hotel }: { hotel: any }) {
  if (!hotel || Object.keys(hotel).length === 0) {
    return (
      <div className="text-center text-sm text-gray-600 border border-gray-200 bg-white/70 backdrop-blur-md rounded-xl p-5">
        ❌ Leider wurden keine passenden Hotels gefunden.
      </div>
    )
  }

  return (
    <div className="HotelCard border border-green-200 bg-white/70 backdrop-blur-md rounded-xl p-5 shadow-md flex flex-col md:flex-row gap-4">
      {/* Hotelbild */}
      {hotel.main_photo_url && (
        <div className="w-full md:w-48 h-32 relative rounded overflow-hidden">
          <Image
            src={hotel.main_photo_url}
            alt={hotel.hotel_name}
            fill
            className="object-cover"
          />
        </div>
      )}

      {/* Hotelinfo */}
      <div className="flex-1 space-y-1">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-gray-800">{hotel.hotel_name}</h3>
          <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 cursor-pointer" />
        </div>

        {hotel.class && <p className="text-yellow-500">{'★'.repeat(hotel.class)}</p>}

        <div className="flex items-center gap-2 text-sm">
          {hotel.review_score && (
            <span className="bg-green-600 text-white px-2 py-1 rounded text-xs font-semibold">
              {hotel.review_score.toFixed(1)} / 10
            </span>
          )}
          {hotel.review_score_word && (
            <span className="text-gray-700">{hotel.review_score_word}</span>
          )}
          {hotel.review_nr && (
            <span className="text-gray-500">({hotel.review_nr.toLocaleString()} Bewertungen)</span>
          )}
        </div>

        <p className="text-sm text-gray-700">📍 {hotel.address}</p>
        <p className="text-sm text-gray-600">💵 Preis ab: <span className="font-medium">{hotel.min_total_price} CHF</span></p>

        {/* Tags */}
        {hotel.tags && hotel.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {hotel.tags.slice(0, 3).map((tag: string, i: number) => (
              <span key={i} className="bg-green-100 text-green-700 px-2 py-0.5 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}

        {hotel.url && (
          <a
            href={hotel.url}
            target="_blank"
            className="inline-block mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm transition"
          >
            🔗 Zur Buchung
          </a>
        )}
      </div>
    </div>
  )
}
