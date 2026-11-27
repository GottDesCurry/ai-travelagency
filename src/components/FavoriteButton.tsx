'use client'
export default function FavoriteButton({ saved, disabled, label, onToggle }: { saved: boolean; disabled?: boolean; label: string; onToggle: () => void }) {
  return <button type="button" className={`favorite-button${saved ? ' is-saved' : ''}`} aria-pressed={saved} disabled={disabled} onClick={onToggle}
    aria-label={saved ? `${label} von der Merkliste entfernen` : `${label} merken`} title={saved ? 'Von der Merkliste entfernen' : 'Merken'}>
    <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.3-9.2C1.4 8 3.4 4.5 6.9 4.5c2 0 3.6 1.1 5.1 3 1.5-1.9 3.1-3 5.1-3 3.5 0 5.5 3.5 4.2 6.8-1.8 4.6-9.3 9.2-9.3 9.2z"/></svg>
  </button>
}
