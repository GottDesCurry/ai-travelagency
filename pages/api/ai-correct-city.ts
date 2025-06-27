import { NextApiRequest, NextApiResponse } from 'next'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { input } = req.body
  if (!input) return res.status(400).json({ error: 'Kein Eingabetext übermittelt.' })

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Korrigiere den Städtenamen oder gib den korrekten Namen der Stadt mit bekanntem Flughafen zurück. Gib nur den korrekten Namen, keine weiteren Informationen.'
        },
        {
          role: 'user',
          content: input
        }
      ]
    })

    const corrected = completion.choices?.[0]?.message?.content?.trim()
    return res.status(200).json({ corrected })
  } catch (err: any) {
    console.error('Fehler bei GPT:', err.message)
    return res.status(500).json({ error: 'Fehler bei GPT-Anfrage.' })
  }
}
