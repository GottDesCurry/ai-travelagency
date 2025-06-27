// src/app/api/iata-code/route.ts

import iataCodes from './data/iata-codes.json'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get('city')

  if (!city) {
    return NextResponse.json({ error: 'Missing city parameter' }, { status: 400 })
  }

  const match = iataCodes.find(
    (item: any) => item.city.toLowerCase() === city.toLowerCase()
  )

  if (!match) {
    return NextResponse.json({ error: 'City not found' }, { status: 404 })
  }

  return NextResponse.json({ code: match.code })
}
