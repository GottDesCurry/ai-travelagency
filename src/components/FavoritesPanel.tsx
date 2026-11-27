'use client'
import BookingLink from './BookingLink'
import type { Favorite } from '@/lib/favorites'

function savedDate(value: string): string {
  return new Date(value).toLocaleString('de-CH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function FavoritesPanel({ items, message, onRemove, onClear }: { items: Favorite[]; message: string; onRemove: (key: string) => void; onClear: () => void }) {
  if (!items.length && !message) return null
  return <section className="section-wrap" aria-labelledby="favorites-title">
    <div className="section-heading"><h2 id="favorites-title">Merkliste · {items.length}</h2><p>Nur in diesem Browser gespeichert. Preise stammen vom Zeitpunkt des Merkens und können sich geändert haben.</p></div>
    {message && <p role="status" className="subtle-note">{message}</p>}
    {items.length > 0 && <ul className="favorites-list">
      {items.map(item => <li key={item.key} className="favorite-item">
        <div>
          <span className="favorite-kind">{item.kind === 'flight' ? 'Flug' : 'Hotel'}</span>
          <strong>{item.title}</strong>
          {item.detail && <p>{item.detail}</p>}
          <p>{item.price === null ? 'Preis war nicht verfügbar' : `${item.price.toLocaleString('de-CH', { minimumFractionDigits: 2 })} ${item.currency} laut Anbieter`} · gemerkt {savedDate(item.savedAt)}</p>
        </div>
        <div className="favorite-actions">
          <BookingLink url={item.link} label={item.kind === 'flight' ? 'Zum Flugangebot' : 'Zum Hotelangebot'}/>
          <button type="button" className="secondary-button" onClick={() => onRemove(item.key)} aria-label={`${item.title} von der Merkliste entfernen`}>Entfernen</button>
        </div>
      </li>)}
    </ul>}
    {items.length > 1 && <button type="button" className="text-sm underline" onClick={onClear}>Merkliste leeren</button>}
  </section>
}
