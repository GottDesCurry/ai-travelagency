// /pages/api/hotels.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import OpenAI from 'openai'

const RAPID_API_KEY = process.env.RAPIDAPI_KEY || '77e2e78fe3msh883792c267e9a38p18657cjsnc5b44737e464'
const API_HOST = 'booking-com18.p.rapidapi.com'
const BASE_URL = `https://${API_HOST}`
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

// In-Memory Cache für GPT-Korrekturen
const cityCorrectionCache = new Map<string, string>()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { city, checkin, checkout, adults = '1' } = req.query

  if (!city || typeof city !== 'string') {
    return res.status(400).json({ error: 'City is required' })
  }

  try {
    // Schritt 1: Rechtschreibkorrektur (AI-basierte Verbesserung mit Caching)
    const correctedCity = await getCorrectedCity(city)

    // Schritt 2: Autovervollständigung → location_id abrufen
    const autocompleteRes = await axios.get(`${BASE_URL}/stays/auto-complete`, {
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': API_HOST
      },
      params: {
        query: correctedCity
      }
    })

    const locationId = autocompleteRes.data?.[0]?.id
    if (!locationId) {
      return res.status(404).json({ error: 'Ort nicht gefunden' })
    }

    // Schritt 3: Hotelsuche mit locationId
    const hotelSearchRes = await axios.get(`${BASE_URL}/stays/search`, {
      headers: {
        'X-RapidAPI-Key': RAPID_API_KEY,
        'X-RapidAPI-Host': API_HOST
      },
      params: {
        location_id: locationId,
        checkin_date: checkin || '2025-08-01',
        checkout_date: checkout || '2025-08-05',
        adults_number: adults,
        room_number: '1',
        locale: 'de',
        currency: 'EUR',
        order_by: 'popularity'
      }
    })

    const topHotels = hotelSearchRes.data?.result?.slice(0, 3).map((hotel: any) => ({
      name: hotel.property.name,
      address: hotel.property.address,
      rating: hotel.property.review_score_word,
      price: hotel.composite_price_breakdown?.gross_amount?.value,
      currency: hotel.composite_price_breakdown?.gross_amount?.currency,
      photo: hotel.property.photo_urls?.[0] || null,
      bookingLink: hotel.property.url || null
    })) || []

    res.status(200).json({ city: correctedCity, results: topHotels })
  } catch (error: any) {
    console.error('Fehler bei der Hotelsuche:', error?.response?.data || error.message)
    res.status(500).json({ error: 'Interner Fehler bei der Hotelsuche' })
  }
}

async function getCorrectedCity(input: string): Promise<string> {
  if (cityCorrectionCache.has(input)) {
    return cityCorrectionCache.get(input)!
  }

  const prompt = `Du bist ein Reiseassistent. Deine Aufgabe ist es, den Städtenamen aus folgendem Nutzereingabetext zu extrahieren, Rechtschreibfehler zu korrigieren und den korrekten Namen auf Englisch zurückzugeben. Gib **nur den Namen der Stadt** zurück, wie er in internationalen Reisesystemen verwendet wird.\n\nInput: "${input}"\nErwartete Ausgabe (nur Stadtname, z.\u202fB. "Zurich"): `

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'Du bist ein hilfreicher KI-Reiseassistent.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0
    })

    const output = completion.choices[0].message.content?.trim()
    const result = output || input
    cityCorrectionCache.set(input, result)
    return result
  } catch (err) {
    console.error('Fehler bei GPT-Korrektur:', err)
    return input
  }
}
