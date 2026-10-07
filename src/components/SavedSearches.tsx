'use client'
import { useEffect, useState } from 'react'
import { SAVED_SEARCH_KEY, decodeSavedSearches, encodeSavedSearches, isSavedSearch, type SavedSearch } from '@/lib/saved-searches'

type Fields = Omit<SavedSearch, 'id'>
export default function SavedSearches({ current, onRestore, disabled }: { current: Fields; onRestore: (value: SavedSearch) => void; disabled: boolean }) {
 const [items,setItems] = useState<SavedSearch[]>([])
 const [ready,setReady] = useState(false)
 const [message,setMessage] = useState('')
 useEffect(() => {
  try {setItems(decodeSavedSearches(localStorage.getItem(SAVED_SEARCH_KEY)));setReady(true)}
  catch {setMessage('Der Browser erlaubt derzeit keine lokale Speicherung.')}
 }, [])
 const persist = (next: SavedSearch[]) => {
  try {if(next.length)localStorage.setItem(SAVED_SEARCH_KEY,encodeSavedSearches(next));else localStorage.removeItem(SAVED_SEARCH_KEY);setItems(next);return true}
  catch {setMessage('Die Suche konnte nicht lokal gespeichert oder gelöscht werden.');return false}
 }
 const save = () => {
  const value = {...current,id:crypto.randomUUID()}
  if(!isSavedSearch(value)){setMessage('Bitte zuerst gültige Reiseangaben mit Datum eingeben.');return}
  if(persist([value,...items].slice(0,10)))setMessage('Suche auf diesem Gerät gespeichert. Es wurde nichts gebucht.')
 }
 return <section aria-labelledby="saved-searches-title" className="space-y-3 border-t pt-4">
  <h2 id="saved-searches-title" className="font-semibold">Gespeicherte Suchen</h2>
  <p className="text-xs text-gray-600">Optional: bis zu zehn Suchen nur in diesem Browser speichern. Keine Preise, Reisebeschreibungen oder Buchungsdaten. Auf geteilten Geräten anschließend löschen.</p>
  <button type="button" disabled={!ready || disabled} onClick={save} className="rounded border px-3 py-2 disabled:opacity-50">Aktuelle Suche speichern</button>
  {message && <p role="status" className="text-sm">{message}</p>}
  <ul className="space-y-2">
   {items.map(item => <li key={item.id} className="flex flex-wrap items-center gap-2 text-sm">
    <span>{item.origin} → {item.destination} · {item.date}{item.returnDate ? ` bis ${item.returnDate}` : ''} · {item.people} Erwachsene</span>
    <button type="button" disabled={disabled} onClick={() => {onRestore(item);setMessage('Angaben übernommen. Bitte Daten prüfen und die Suche starten.')}} className="underline text-blue-700">Übernehmen</button>
    <button type="button" onClick={() => {if(persist(items.filter(v=>v.id!==item.id)))setMessage('Gespeicherte Suche gelöscht.')}} aria-label={`Suche ${item.origin} nach ${item.destination} löschen`} className="underline">Löschen</button>
   </li>)}
  </ul>
  {items.length > 0 && <button type="button" onClick={() => {if(persist([]))setMessage('Alle gespeicherten Suchen gelöscht.')}} className="text-sm underline">Alle gespeicherten Suchen löschen</button>}
 </section>
}
