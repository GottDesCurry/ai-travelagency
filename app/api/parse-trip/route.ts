import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

import { normalizeParsedTrip } from '@/lib/parsed-trip'
import { aiInputFailure } from '@/lib/provider-errors'
import { allowRequest, routeClient, RATE_LIMIT_MESSAGE } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Ungültiges JSON.' }, { status: 400 }) }
  const prompt = body?.prompt
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 4000) return NextResponse.json({ error: 'Bitte einen Reiseplan mit maximal 4000 Zeichen eingeben.' }, { status: 400 })
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Die KI-Reiseplanung ist noch nicht konfiguriert.' }, { status: 503 })
  if (!allowRequest('ai', routeClient(req))) return NextResponse.json({ error: RATE_LIMIT_MESSAGE }, { status: 429 })

  const systemPrompt = `
Heute ist ${new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' })}. Erfinde keine fehlenden Angaben.
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
Zähle bei "people" die schreibende Person mit, z. B. "ich und drei Freunde" = 4. Ohne Personenangabe: null.
Fehlt bei einem Datum die Jahreszahl, nimm das nächste Datum ab heute. Ungültige Kalenderdaten (z. B. 30. Februar) nicht korrigieren, sondern null zurückgeben.
Ist eine Angabe mehrdeutig, gib null zurück statt zu raten.
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

    return NextResponse.json(normalizeParsedTrip(JSON.parse(chatResponse.choices[0]?.message.content || '{}')))
  } catch (error) {
    const failure = aiInputFailure(error)
    console.warn(`[trip-ai] ${failure.code}`)
    return NextResponse.json({ error: failure.message }, { status: failure.status })
  }
}
