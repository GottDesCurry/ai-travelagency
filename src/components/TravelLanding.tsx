export default function TravelLanding() {
  return <section className="hero" aria-labelledby="landing-title">
    <div>
      <p className="eyebrow">DEINE IDEE. DEINE REISE.</p>
      <h1 id="landing-title">Weniger planen.<br/><em>Mehr erleben.</em></h1>
      <p className="hero-copy">Ein Wochenende am Meer. Eine neue Lieblingsstadt. Oder einfach mal raus. Entdecke passende Flüge und Hotels für deine nächste Reise.</p>
      <a href="#reise-suche" className="hero-cta">Meine Reise beginnt hier <span aria-hidden="true">↗</span></a>
      <p className="hero-note">FLÜGE · HOTELS · DEIN NÄCHSTES REISEZIEL</p>
    </div>
    <div className="sky-card" aria-hidden="true">
      <div className="sky-sun"/><div className="sky-cloud cloud-a"/><div className="sky-cloud cloud-b"/>
      <div className="hero-plane"><svg viewBox="0 0 220 100" fill="none"><path d="M20 57 92 46 134 8 153 9 132 43 186 45C216 46 219 56 187 60L129 65 151 89 132 92 96 68 40 73 21 87 9 85 20 64 5 61Z" fill="currentColor"/><path d="m132 43 52 2" stroke="#7793a4" strokeWidth="3"/></svg></div>
      <div className="sky-ticket"><small>DEIN NÄCHSTES KAPITEL</small>Zürich · Irgendwo neu</div>
      <div className="sky-caption"><span>ZEIT FÜR EINE AUSZEIT.</span><span>01 / ∞</span></div>
    </div>
  </section>
}

export function DestinationIdeas({ onChoose, disabled }: { onChoose: (code: string) => void; disabled: boolean }) {
  const destinations = [
    { code: 'LIS', name: 'Lissabon', theme: 'AM MEER', icon: '☀', style: 'dest-coast', copy: 'Kleine Gassen, salzige Luft und ein Pastel de Nata.' },
    { code: 'BCN', name: 'Barcelona', theme: 'IN DER STADT', icon: '◈', style: 'dest-city', copy: 'Architektur, Tapas und ein Abend am Mittelmeer.' },
    { code: 'KEF', name: 'Island', theme: 'DRAUSSEN', icon: '△', style: 'dest-nature', copy: 'Weite Landschaften für deine nächste Auszeit.' },
  ]
  return <section id="entdecken" className="section-wrap" aria-labelledby="destinations-title">
    <div className="section-heading"><div><p className="eyebrow">EIN BISSCHEN FERNWEH</p><h2 id="destinations-title">Worauf hast du Lust?</h2></div><p>Ziel auswählen und deine Reisedaten ergänzen.</p></div>
    <div className="destinations">{destinations.map((destination, index) => <button key={destination.code} type="button" className={`destination ${destination.style}`} disabled={disabled} onClick={() => onChoose(destination.code)} aria-label={`${destination.name} als Reiseziel wählen`}>
      <span className="destination-icon" aria-hidden="true">{destination.icon}</span><small>0{index + 1} / {destination.theme}</small><h3>{destination.name}</h3><p>{destination.copy}</p>
    </button>)}</div>
  </section>
}
