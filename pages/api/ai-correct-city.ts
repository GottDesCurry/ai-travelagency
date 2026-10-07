import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

// Typisierung für die Anfrage und Antwort
type CorrectCityResponse = { corrected?: string; error?: string }

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CorrectCityResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'Methode nicht erlaubt. Nur POST wird unterstützt.' })
  }

  const input = req.body?.input

  if (typeof input !== 'string' || !input.trim() || input.length > 120) {
    return res.status(400).json({ error: 'Ungültige Eingabe. Erwartet wird ein Textstring.' })
  }

  if (!process.env.OPENAI_API_KEY) return res.status(503).json({ error: 'Die KI-Ortskorrektur ist noch nicht konfiguriert.' })

  try {
    const completion = await new OpenAI({ apiKey: process.env.OPENAI_API_KEY, timeout: 15000, maxRetries: 0 }).chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Korrigiere den Städtenamen oder gib den korrekten Namen einer Stadt mit bekanntem Flughafen zurück. Nur ein einziges Wort zurückgeben – keine Zusatzinfos.',
        },
        {
          role: 'user',
          content: input,
        },
      ],
    })

    const corrected = completion.choices?.[0]?.message?.content?.trim()
    if (!corrected || corrected.length > 120) throw new Error('Invalid city response')
    return res.status(200).json({ corrected })
  } catch {
    return res.status(502).json({ error: 'Interner Fehler bei der GPT-Verarbeitung.' })
  }
}
