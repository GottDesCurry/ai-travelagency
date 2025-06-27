// pages/api/hotels.ts – GPT-gestützte Hotelsuche mit Rechtschreibkorrektur & sauberer Typisierung
import type { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'
import axios from 'axios'

const RAPID_API_KEY = process.env.RAPIDAPI_KEY || ''
const API_HOST = 'booking-com18.p.rapidapi.com'
const BASE_URL = `https://${API_HOST}`
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// In-Memory Cache für korrigierte Städtenamen
const cityCorrectionCache = new Map<string, string>()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { city, checkin, checkout, adults = '1' } = req.query

  if (!city || typeof city !== 'string') {
    return res.status(400).json({ error: 'city fehlt oder ungültig' })
  }

  try {
    const correctedCity = await getCorrectedCity(city)

    const locationRes = await axios.get(`${BASE_URL}/stays/auto-complete`, {
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': API_HOST
      },
      params: { query: correctedCity }
    })

    const locationId = locationRes.data?.[0]?.id
    if (!locationId) {
      return res.status(404).json({ error: 'Ort nicht gefunden' })
    }

    const checkinDate = checkin || '2025-08-01'
    const checkoutDate = checkout || '2025-08-05'

    const hotelRes = await axios.get(`${BASE_URL}/stays/search`, {
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': API_HOST
      },
      params: {
        location_id: locationId,
        checkin_date: checkinDate,
        checkout_date: checkoutDate,
        adults_number: adults,
        room_number: '1',
        locale: 'de',
        currency: 'CHF',
        order_by: 'popularity'
      }
    })

    const topHotels = (hotelRes.data?.result || []).slice(0, 3).map((hotel: any) => ({
      name: hotel.property?.name,
      address: hotel.property?.address,
      rating: hotel.property?.review_score_word,
      price: hotel.composite_price_breakdown?.gross_amount?.value,
      currency: hotel.composite_price_breakdown?.gross_amount?.currency,
      photo: hotel.property?.photo_urls?.[0] || null,
      bookingLink: hotel.property?.url || null
    }))

    res.status(200).json({ city: correctedCity, results: topHotels })
  } catch (error: any) {
    console.error('❌ Fehler bei der Hotelsuche:', error?.response?.data || error.message)
    res.status(500).json({ error: 'Serverfehler bei der Hotelsuche' })
  }
}

async function getCorrectedCity(input: string): Promise<string> {
  if (cityCorrectionCache.has(input)) return cityCorrectionCache.get(input)!

  const prompt = `Du bist ein Reiseassistent. Korrigiere Rechtschreibfehler und gib nur den englischen Namen der Stadt zurück.\n\nEingabe: "${input}"\nAusgabe:`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Du bist ein hilfreicher KI-Reiseassistent.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0
    })

    const corrected = completion.choices[0].message.content?.trim() || input
    cityCorrectionCache.set(input, corrected)
    return corrected
  } catch (err) {
    console.warn('⚠️ GPT-Korrektur fehlgeschlagen:', err)
    return input
  }
}
