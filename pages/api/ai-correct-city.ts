import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

// Typisierung für die Anfrage und Antwort
type CorrectCityRequest = { input: string }
type CorrectCityResponse = { corrected?: string; error?: string }

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CorrectCityResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Methode nicht erlaubt. Nur POST wird unterstützt.' })
  }

  const { input } = req.body as CorrectCityRequest

  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'Ungültige Eingabe. Erwartet wird ein Textstring.' })
  }

  try {
    const completion = await openai.chat.completions.create({
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
    return res.status(200).json({ corrected })
  } catch (err: unknown) {
    console.error('❌ GPT-Anfragefehler:', (err as Error).message)
    return res.status(500).json({ error: 'Interner Fehler bei der GPT-Verarbeitung.' })
  }
}
