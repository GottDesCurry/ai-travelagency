import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

function getNextFutureDateFromPartial(day: number, month: number): string {
  const today = new Date()
  const currentYear = today.getFullYear()

  const candidateThisYear = new Date(currentYear, month - 1, day)
  if (candidateThisYear >= today) return candidateThisYear.toISOString().split('T')[0]

  const candidateNextYear = new Date(currentYear + 1, month - 1, day)
  return candidateNextYear.toISOString().split('T')[0]
}

export async function POST(req: NextRequest) {
  const { prompt } = await req.json()

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
Behebe einfache Rechtschreibfehler oder Erkennungsprobleme automatisch, z.B. bei Städtenamen.`

  const chatResponse = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
    temperature: 0,
  })

  try {
    const parsed = JSON.parse(chatResponse.choices[0].message.content || '{}')
    let { date, returnDate, origin, destination, people } = parsed

    const today = new Date()
    const maxYear = today.getFullYear() + 1

    // Validierung: Datum
    if (date) {
      const parts = date.split('-').map(Number)
      if (parts.length === 3) {
        const year = parts[0]
        if (year > maxYear) {
          return NextResponse.json({ error: `Datum ${date} liegt zu weit in der Zukunft.` }, { status: 400 })
        }
        const parsedDate = new Date(date)
        if (parsedDate < today) {
          return NextResponse.json({ error: `Datum ${date} liegt in der Vergangenheit.` }, { status: 400 })
        }
      } else {
        return NextResponse.json({ error: `Ungültiges Datumsformat für date: ${date}` }, { status: 400 })
      }
    }

    if (returnDate) {
      const parts = returnDate.split('-').map(Number)
      if (parts.length === 3) {
        const year = parts[0]
        if (year > maxYear) {
          return NextResponse.json({ error: `Rückflugdatum ${returnDate} liegt zu weit in der Zukunft.` }, { status: 400 })
        }
        const parsedReturnDate = new Date(returnDate)
        if (parsedReturnDate < today) {
          return NextResponse.json({ error: `Rückflugdatum ${returnDate} liegt in der Vergangenheit.` }, { status: 400 })
        }
      } else {
        return NextResponse.json({ error: `Ungültiges Datumsformat für returnDate: ${returnDate}` }, { status: 400 })
      }
    }

    return NextResponse.json({
      origin: origin || '',
      destination: destination || '',
      date: date || '',
      returnDate: returnDate || '',
      people: people && Number.isInteger(people) && people > 0 ? people : 1
    })
  } catch (e) {
    console.error('Fehler beim Parsen der OpenAI-Antwort:', e)
    return NextResponse.json({
      origin: '',
      destination: '',
      date: '',
      returnDate: '',
      people: 1
    })
  }
}
