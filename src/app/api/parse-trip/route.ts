import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { NextResponse } from 'next/server'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

type ParsedTrip = {
  origin: string | null
  destination: string | null
  date: string | null
  returnDate: string | null
  people: number | null
}

// ❌ Diese Funktion wird aktuell nicht verwendet → entfernt, um ESLint-Fehler zu vermeiden
/*
function getNextFutureDateFromPartial(day: number, month: number): string {
  const today = new Date()
  const currentYear = today.getFullYear()

  const thisYear = new Date(currentYear, month - 1, day)
  if (thisYear >= today) return thisYear.toISOString().split('T')[0]

  const nextYear = new Date(currentYear + 1, month - 1, day)
  return nextYear.toISOString().split('T')[0]
}
*/

export async function POST(req: NextRequest) {
  const { prompt } = (await req.json()) as { prompt: string }

  const systemPrompt = `
Extrahiere folgende Informationen aus dem Text:
- Abflugort (origin)
- Zielort (destination)
- Hinflugdatum (date)
- Rückflugdatum (returnDate), wenn vorhanden
- Anzahl Personen (people), wenn erwähnt

Gib nur folgendes JSON zurück:
{
  "origin": "...",
  "destination": "...",
  "date": "YYYY-MM-DD",
  "returnDate": "YYYY-MM-DD",
  "people": 1
}
Wenn du etwas nicht findest, gib einen leeren String oder null zurück.
Behebe einfache Rechtschreibfehler oder Erkennungsprobleme automatisch, z. B. bei Städtenamen.`

  try {
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0,
    })

    const parsed: ParsedTrip = JSON.parse(chatResponse.choices[0].message.content || '{}')
    const { date, returnDate, origin, destination, people } = parsed // ✅ const statt let

    const today = new Date()
    const maxYear = today.getFullYear() + 1

    if (date) {
      const parts = date.split('-').map(Number)
      if (parts.length === 3) {
        const year = parts[0]
        if (year > maxYear) {
          return NextResponse.json({ error: `Datum ${date} liegt zu weit in der Zukunft.` }, { status: 400 })
        }
      }
    }

    return NextResponse.json({
      origin: origin || null,
      destination: destination || null,
      date: date || null,
      returnDate: returnDate || null,
      people: people ?? null,
    })
  } catch (err) {
    console.error('❌ Fehler beim Parsen der Reiseinformationen:', err)
    return NextResponse.json({ error: '❌ city name fehlt' }, { status: 400 })
  }
}
