import Image from 'next/image'

export default function TravelLanding() {
  return <section className="hero" aria-labelledby="landing-title">
    <div className="hero-copy-block">
      <p className="eyebrow">DEIN NÄCHSTES KAPITEL</p>
      <h1 id="landing-title">Deine nächste Reise.<br/><em>Eine neue Perspektive.</em></h1>
      <p className="hero-copy">Über den Wolken beginnt etwas Neues. Entdecke Flüge und Hotels, vergleiche deine Möglichkeiten und finde die Reise, die zu dir passt.</p>
      <a id="start-planning" href="#reise-suche" className="hero-cta">Reise entdecken <span aria-hidden="true">↗</span></a>
      <div className="hero-meta"><span>01 / FLÜGE</span><span>02 / HOTELS</span><span>03 / DEINE AUSZEIT</span></div>
    </div>
    <div className="sky-card" aria-hidden="true">
      <div className="hero-cloudscape"><Image src="/visuals/cloudscape-blue.webp" alt="" fill priority sizes="(max-width: 800px) 100vw, 55vw"/></div>
      <div className="hero-orbit orbit-a"/><div className="hero-orbit orbit-b"/>
      <div className="hero-plane"><Image src="/visuals/aircraft-blue.webp" alt="" width={1774} height={887} priority sizes="(max-width: 800px) 95vw, 50vw"/></div>
      <div className="sky-ticket"><small>YOUR NEXT DESTINATION</small><strong>ZRH <span>──────── ✈</span> ANYWHERE</strong><span className="ticket-note">Neue Orte. Neue Geschichten.</span></div>
      <div className="sky-caption"><span>ABOVE THE ORDINARY.</span><span>FLIGHT / 001</span></div>
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
