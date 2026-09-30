import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'



type ParsedTrip = {
  origin: string | null
  destination: string | null
  date: string | null
  returnDate: string | null
  people: number | null
  budget: number | null
  interests: string[] | null
}

export async function POST(req: NextRequest) {
  let prompt: unknown
  try { ({ prompt } = await req.json()) } catch { return NextResponse.json({ error: 'Ungültige Anfrage.' }, { status: 400 }) }
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 4000) return NextResponse.json({ error: 'Bitte gib einen Reisewunsch mit maximal 4000 Zeichen ein.' }, { status: 400 })
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Die KI ist noch nicht eingerichtet. Du kannst die Reise manuell eingeben.' }, { status: 503 })

  const systemPrompt = `
Heute ist ${new Date().toISOString().slice(0, 10)}. Verwende dieses Datum für relative Datumsangaben.
Gib Orte möglichst als Flughafen-Code an (zum Beispiel ZRH und BER).
Zähle die reisende Person bei Angaben wie 'ich mit drei Freunden' mit.
Extrahiere folgende Informationen aus dem Text:
- Abflugort (origin)
- Zielort (destination)
- Hinflugdatum (date)
- Rückflugdatum (returnDate), wenn vorhanden
- Anzahl erwachsener Personen (people), wenn erwähnt
- Gesamtbudget in CHF für alle Reisenden (budget), falls eindeutig erwähnt. Bei anderen Währungen ohne Umrechnung null.
- Interessen (interests) als Liste aus Strand, Essen & Kultur, Natur, Städtetrip, Abenteuer, Entspannung.

Gib nur folgendes JSON zurück:
{
  "origin": "...",
  "destination": "...",
  "date": "YYYY-MM-DD",
  "returnDate": "YYYY-MM-DD",
  "people": 1,
  "budget": null,
  "interests": []
}
Wenn du etwas nicht findest, gib einen leeren String oder null zurück.
Behebe einfache Rechtschreibfehler oder Erkennungsprobleme automatisch, z. B. bei Städtenamen.`

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 20000, maxRetries: 0 })
    const chatResponse = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      temperature: 0,
    })

    const parsed: ParsedTrip = JSON.parse(chatResponse.choices[0].message.content || '{}')
    const { date, returnDate, origin, destination, people, budget, interests } = parsed

    return NextResponse.json({
      origin: typeof origin === 'string' ? origin : null,
      destination: typeof destination === 'string' ? destination : null,
      date: typeof date === 'string' ? date : null,
      returnDate: typeof returnDate === 'string' ? returnDate : null,
      people: typeof people === 'number' ? people : null,
      budget: typeof budget === 'number' && Number.isFinite(budget) && budget > 0 ? budget : null,
      interests: Array.isArray(interests) ? interests.filter(item => typeof item === 'string').slice(0, 6) : null,
    })
  } catch (err) {
    console.error('❌ Fehler beim Parsen der Reiseinformationen:', err)
    return NextResponse.json({ error: 'Interner Fehler bei der Verarbeitung des Prompts.' }, { status: 500 })
  }
}

