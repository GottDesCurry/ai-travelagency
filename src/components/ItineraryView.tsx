import type { Itinerary } from '@/lib/itinerary'
export default function ItineraryView({ itinerary }: { itinerary: Itinerary }) {
  return <div className="itinerary-days"><p className="subtle-note">{itinerary.summary}</p><p className="subtle-note">KI-Vorschlag: Öffnungszeiten, Wege und Verfügbarkeit bitte vor Ort prüfen. Aktivitäten sind noch nicht gebucht.</p>
    {itinerary.days.map(day => <article key={day.day} className="day-card"><p className="day-number">TAG {String(day.day).padStart(2, '0')}</p><h3>{day.title}</h3><div className="day-slots"><p><span>Vormittag</span>{day.morning}</p><p><span>Nachmittag</span>{day.afternoon}</p><p><span>Abend</span>{day.evening}</p></div></article>)}
    {itinerary.tips.length > 0 && <aside className="day-card"><h3>Gut zu wissen</h3><ul className="subtle-note list-disc pl-5">{itinerary.tips.map((tip,index) => <li key={index}>{tip}</li>)}</ul></aside>}
  </div>
}
