import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

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
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Ungültiges JSON.' }, { status: 400 }) }
  const prompt = body?.prompt
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 4000) return NextResponse.json({ error: 'Bitte einen Reiseplan mit maximal 4000 Zeichen eingeben.' }, { status: 400 })
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Die KI-Reiseplanung ist noch nicht konfiguriert.' }, { status: 503 })

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
    const chatResponse = await new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 15000, maxRetries: 0 }).chat.completions.create({
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
    return NextResponse.json({ error: 'Interner Fehler bei der Verarbeitung des Prompts.' }, { status: 500 })
  }
}
