export function validTravelDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}
export function validateTravelDates(date: unknown, returnDate: unknown, requireStay = false): string | null {
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Europe/Zurich' })
  if (!validTravelDate(date) || date < today) return 'Bitte ein gültiges Reisedatum ab heute wählen.'
  if (requireStay && !returnDate) return 'Für Hotels bitte ein Abreisedatum wählen.'
  if (returnDate && (!validTravelDate(returnDate) || returnDate < date || (requireStay && returnDate === date))) return 'Das Enddatum muss nach dem Startdatum liegen (Hotels: mindestens eine Nacht).'
  return null
}
export function validAdults(value: unknown): boolean {
  return typeof value === 'string' && /^[1-9]$/.test(value)
}
export function flightQuery(origin: string, destination: string, date: string, returnDate: string, adults: number): string {
  return new URLSearchParams({ origin, destination, date, ...(returnDate ? { returnDate } : {}), adults: String(adults) }).toString()
}
export function hotelQuery(city: string, checkin: string, checkout: string, adults: number): string {
  return new URLSearchParams({ city, checkin, checkout, adults: String(adults) }).toString()
}
