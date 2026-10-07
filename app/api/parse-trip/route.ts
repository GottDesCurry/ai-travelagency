import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

import { normalizeParsedTrip } from '@/lib/parsed-trip'

export async function POST(req: NextRequest) {
  let body
  try { body = await req.json() } catch { return NextResponse.json({ error: 'Ungültiges JSON.' }, { status: 400 }) }
  const prompt = body?.prompt
  if (typeof prompt !== 'string' || !prompt.trim() || prompt.length > 4000) return NextResponse.json({ error: 'Bitte einen Reiseplan mit maximal 4000 Zeichen eingeben.' }, { status: 400 })
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: 'Die KI-Reiseplanung ist noch nicht konfiguriert.' }, { status: 503 })

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
  } catch {
    return NextResponse.json({ error: 'Die KI hat keine gültigen Reiseangaben geliefert. Bitte die Felder direkt ausfüllen.' }, { status: 502 })
  }
}
