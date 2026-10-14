import { validTravelDate, validateTravelDates } from './trip-search'

export function normalizeParsedTrip(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Invalid trip')
  const raw = value as Record<string, unknown>
  const text = (field: string): string | null => {
    const item = raw[field]
    if (item === null || item === undefined || item === '') return null
    if (typeof item !== 'string' || item.trim().length > 120) throw new Error('Invalid trip field')
    return item.trim() || null
  }
  const origin = text('origin'), destination = text('destination')
  const date = text('date'), returnDate = text('returnDate')
  if (date && validateTravelDates(date, returnDate)) throw new Error('Invalid dates')
  if (returnDate && !validTravelDate(returnDate)) throw new Error('Invalid return date')
  const people = raw.people === null || raw.people === undefined ? null : raw.people
  if (people !== null && (typeof people !== 'number' || !Number.isInteger(people) || people < 1 || people > 9)) throw new Error('Invalid people')
  return { origin, destination, date, returnDate, people }
}
