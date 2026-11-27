import iataCodes from '../data/iata-codes.json'
import cityTranslations from '../data/city-translations.json'

export interface AirportEntry {
  city: string
  code: string
  country: string
  airport: string
  aliases?: string[]
}

export const airports: AirportEntry[] = iataCodes
const translations: Record<string, string> = cityTranslations

/** Case-, accent- and whitespace-insensitive key: "Zürich" and "zurich" match, "Zuerich" via alias. */
export function cityKey(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/ß/g, 'ss').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
}

const byName = new Map<string, AirportEntry[]>()
function index(name: string, entry: AirportEntry) {
  const key = cityKey(name)
  if (!key) return
  const list = byName.get(key) ?? []
  if (!list.includes(entry)) list.push(entry)
  byName.set(key, list)
}
for (const entry of airports) {
  index(entry.city, entry)
  for (const alias of entry.aliases ?? []) index(alias, entry)
}
for (const [german, english] of Object.entries(translations)) {
  for (const entry of byName.get(cityKey(english)) ?? []) index(german, entry)
}
const byCode = new Map(airports.map(entry => [entry.code, entry]))

export type CityResolution =
  | { kind: 'found'; code: string; city: string }
  | { kind: 'code'; code: string }
  | { kind: 'ambiguous'; options: AirportEntry[] }
  | { kind: 'unknown' }

/**
 * Deterministic lookup without AI. Exact names/aliases win; a 3-letter input that is not a
 * known city is treated as an IATA code (as before). No substring guessing, so an unclear
 * input is never silently mapped to a different airport.
 */
export function resolveCity(input: string): CityResolution {
  const trimmed = input.trim()
  const matches = byName.get(cityKey(trimmed)) ?? []
  if (matches.length === 1) return { kind: 'found', code: matches[0].code, city: matches[0].city }
  if (matches.length > 1) return { kind: 'ambiguous', options: matches }
  if (/^[A-Za-z]{3}$/.test(trimmed)) {
    const code = trimmed.toUpperCase()
    const known = byCode.get(code)
    return known ? { kind: 'found', code, city: known.city } : { kind: 'code', code }
  }
  return { kind: 'unknown' }
}

/** Code for a resolved input, or null. */
export function airportCode(resolution: CityResolution): string | null {
  return resolution.kind === 'found' || resolution.kind === 'code' ? resolution.code : null
}

/** English city name for the hotel provider (e.g. "Zürich" → "Zurich", "ZRH" → "Zurich"). */
export function hotelCityName(input: string): string {
  const resolution = resolveCity(input)
  const city = resolution.kind === 'found' ? resolution.city : input.trim()
  return translations[city] ?? city
}

export function unresolvedCityMessage(label: string, input: string, resolution: CityResolution): string {
  if (resolution.kind === 'ambiguous') return `${label} «${input}» ist mehrdeutig (${resolution.options.map(option => `${option.city} ${option.code}`).join(', ')}). Bitte den Flughafencode eingeben.`
  return `${label} «${input}» wurde nicht erkannt. Bitte die Schreibweise prüfen oder den Flughafencode (z. B. ZRH) eingeben.`
}
