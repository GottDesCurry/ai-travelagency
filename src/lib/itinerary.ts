import { object, SearchError, validateAdults, validateDates } from './travel'
export type PlanDay = { day: number; title: string; morning: string; afternoon: string; evening: string }
export type Itinerary = { summary: string; days: PlanDay[]; tips: string[] }
export function validatePlanRequest(value: unknown) {
  const input = object(value)
  validateDates(input.date, input.returnDate, true)
  const nights = Math.round((Date.parse(String(input.returnDate)) - Date.parse(String(input.date))) / 86400000)
  if (nights > 13) throw new SearchError('Der Tagesplan unterstützt aktuell Reisen bis 14 Tage.')
  if (typeof input.destination !== 'string' || !input.destination.trim() || input.destination.length > 100) throw new SearchError('Bitte gib ein Reiseziel ein.')
  const adults = validateAdults(input.people)
  const budget = input.budget === '' || input.budget == null ? null : Number(input.budget)
  if (budget !== null && (!Number.isFinite(budget) || budget <= 0 || budget > 1000000)) throw new SearchError('Bitte gib ein gültiges Gesamtbudget in CHF ein.')
  const interests = Array.isArray(input.interests) ? input.interests.filter((item): item is string => typeof item === 'string' && item.length < 50).slice(0, 8) : []
  return { destination: input.destination.trim(), date: String(input.date), returnDate: String(input.returnDate), people: adults, budget, interests, days: nights + 1 }
}
export function readItinerary(value: unknown, expectedDays: number): Itinerary {
  const input = object(value)
  const limited = (value: unknown) => typeof value === 'string' && value.length > 0 && value.length <= 2000
  if (!limited(input.summary) || !Array.isArray(input.days) || input.days.length !== expectedDays || !Array.isArray(input.tips) || input.tips.length > 6 || !input.tips.every(limited)) throw new SearchError('Der Reiseplan konnte nicht vollständig erstellt werden. Bitte versuche es erneut.', 502)
  const days = input.days.map((value, index) => {
    const day = object(value)
    if (day.day !== index + 1 || ![day.title, day.morning, day.afternoon, day.evening].every(limited)) throw new SearchError('Der Reiseplan ist unvollständig. Bitte versuche es erneut.', 502)
    return day as PlanDay
  })
  return { summary: input.summary as string, days, tips: input.tips as string[] }
}
