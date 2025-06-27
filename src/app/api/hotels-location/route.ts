import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const name = searchParams.get('name')

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  // Hotel Destination Mapping (simuliert dest_id wie bei Booking.com API)
  const destinations: Record<string, string> = {
    Barcelona: 'bcn123',
    Berlin: 'ber456',
    Malaga: 'agp789',
    Zurich: 'zrh321',
    Paris: 'cdg654',
    London: 'lhr987',
    Rome: 'fco234',
    Amsterdam: 'ams345',
    Madrid: 'mad456',
    Vienna: 'vie678',
    Munich: 'muc789',
    Geneva: 'gva101',
    Lisbon: 'lis202',
    Frankfurt: 'fra303'
  }

  const normalized = name.trim().toLowerCase()
  const match = Object.entries(destinations).find(([city]) => city.toLowerCase() === normalized)

  if (!match) {
    return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
  }

  const [, dest_id] = match
  return NextResponse.json({ dest_id })
}
