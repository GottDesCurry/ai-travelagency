import { validTravelDate } from './trip-search'
export const SAVED_SEARCH_KEY = 'book-repeat:saved-searches:v1'
export type SavedSearch = { id: string; origin: string; destination: string; date: string; returnDate: string; people: number; searchFlights: boolean; searchHotels: boolean }
export function isSavedSearch(value: unknown): value is SavedSearch {
 if (!value || typeof value !== 'object') return false
 const v = value as Record<string, unknown>
 return typeof v.id === 'string' && /^[a-zA-Z0-9-]{1,64}$/.test(v.id)
  && ['origin','destination'].every(key => typeof v[key] === 'string' && (v[key] as string).trim().length > 0 && (v[key] as string).length <= 120)
  && validTravelDate(v.date) && (v.returnDate === '' || validTravelDate(v.returnDate))
  && typeof v.people === 'number' && Number.isInteger(v.people) && v.people >= 1 && v.people <= 9
  && typeof v.searchFlights === 'boolean' && typeof v.searchHotels === 'boolean' && (v.searchFlights || v.searchHotels)
  && (v.returnDate === '' || v.returnDate >= v.date)
  && (!v.searchHotels || typeof v.returnDate === 'string' && v.returnDate > v.date)
}
function minimalSearch(v: SavedSearch): SavedSearch {
 return {id:v.id,origin:v.origin,destination:v.destination,date:v.date,returnDate:v.returnDate,people:v.people,searchFlights:v.searchFlights,searchHotels:v.searchHotels}
}
export function decodeSavedSearches(raw: string | null): SavedSearch[] {
 if (!raw || raw.length > 20000) return []
 try {
  const value = JSON.parse(raw)
  if (value?.version !== 1 || !Array.isArray(value.searches)) return []
  const ids = new Set<string>()
  return value.searches.filter(isSavedSearch).filter((v:SavedSearch) => {if(ids.has(v.id))return false;ids.add(v.id);return true}).slice(0,10).map(minimalSearch)
 } catch {return []}
}
export function encodeSavedSearches(searches: SavedSearch[]): string {
 return JSON.stringify({version:1, searches:searches.filter(isSavedSearch).slice(0,10).map(minimalSearch)})
}
