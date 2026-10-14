import { NextRequest, NextResponse } from 'next/server'
import iataCodes from '@/data/iata-codes.json'

type IataResult = {
  city: string
  code: string
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get('city')

  if (!city || city.trim().length === 0) {
    return NextResponse.json({ error: 'Stadtname fehlt oder ist ungültig.' }, { status: 400 })
  }

  const cityNormalized = city.trim().toLowerCase()

  const result = iataCodes.find((entry: IataResult) =>
    entry.city.toLowerCase() === cityNormalized ||
    entry.city.toLowerCase().includes(cityNormalized) ||
    cityNormalized.includes(entry.city.toLowerCase()) ||
    city.toUpperCase() === entry.code
  )

  if (!result) {
    return NextResponse.json({ error: 'Kein IATA-Code für die Stadt gefunden.' }, { status: 404 })
  }

  return NextResponse.json({ code: result.code })
}
