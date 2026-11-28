'use client'
import { useCallback, useEffect, useState } from 'react'
import { FAVORITES_KEY, decodeFavorites, encodeFavorites, toggleFavorite, type Favorite } from '@/lib/favorites'

/** Device-local shortlist. Storage is optional: without it the hearts are disabled and a note is shown. */
export function useFavorites() {
  const [items, setItems] = useState<Favorite[]>([])
  const [ready, setReady] = useState(false)
  const [message, setMessage] = useState('')
  useEffect(() => {
    try { setItems(decodeFavorites(localStorage.getItem(FAVORITES_KEY))); setReady(true) }
    catch { setMessage('Der Browser erlaubt derzeit keine lokale Speicherung. Die Merkliste ist nicht verfügbar.') }
  }, [])
  const persist = useCallback((next: Favorite[]) => {
    try {
      if (next.length) localStorage.setItem(FAVORITES_KEY, encodeFavorites(next)); else localStorage.removeItem(FAVORITES_KEY)
      setItems(next); return true
    } catch { setMessage('Die Merkliste konnte nicht lokal gespeichert werden.'); return false }
  }, [])
  const toggle = useCallback((item: Favorite) => {
    const saved = items.some(existing => existing.key === item.key)
    if (persist(toggleFavorite(items, item))) setMessage(saved ? `«${item.title}» von der Merkliste entfernt.` : `«${item.title}» auf die Merkliste gesetzt. Es wurde nichts gebucht.`)
  }, [items, persist])
  const remove = useCallback((key: string) => { if (persist(items.filter(item => item.key !== key))) setMessage('Eintrag entfernt.') }, [items, persist])
  const clear = useCallback(() => { if (persist([])) setMessage('Merkliste geleert.') }, [persist])
  const has = useCallback((key: string) => items.some(item => item.key === key), [items])
  return { items, ready, message, toggle, remove, clear, has }
}
