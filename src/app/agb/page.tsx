// app/agb/page.tsx
export const metadata = {
  title: 'AGB – Ba & Be Partners',
};

export default function AGBPage() {
  return (
    <section className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Allgemeine Geschäftsbedingungen (AGB)</h1>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Geltungsbereich</h2>
        <p>Diese Allgemeinen Geschäftsbedingungen (AGB) regeln die Nutzung der durch Ba & Be Partners KLG betriebenen Plattform sowie aller darüber angebotenen Dienste. Mit der Registrierung und/oder Nutzung erklären Sie sich mit diesen AGB einverstanden.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Leistungsangebot</h2>
        <p>Wir bieten Ihnen KI-gestützte Empfehlungen zur Suche und Planung von Flügen, Hotels und reisebezogenen Zusatzleistungen. Die tatsächliche Buchung und Zahlung erfolgt über externe Partner-APIs. Wir sind kein Reiseveranstalter, sondern fungieren ausschließlich als Vermittler.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Nutzerkonto</h2>
        <p>Für die Nutzung ist eine Registrierung erforderlich. Sie verpflichten sich, wahrheitsgemäße Angaben zu machen und Ihre Zugangsdaten vertraulich zu behandeln.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Haftungsausschluss</h2>
        <p>Da Buchungen über Drittanbieter abgewickelt werden, übernehmen wir keine Haftung für deren Verfügbarkeit, Qualität oder Durchführung. Unsere Haftung beschränkt sich auf Vorsatz und grobe Fahrlässigkeit.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Zahlungen &amp; Gebühren</h2>
        <p>Preise richten sich nach den Konditionen der jeweiligen Anbieter. Für Premiumfunktionen behalten wir uns gesonderte Gebühren vor, die transparent ausgewiesen werden.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Verfügbarkeit &amp; Systembetrieb</h2>
        <p>Wir streben eine hohe Verfügbarkeit an, können Wartungsarbeiten und technische Unterbrechungen jedoch nicht ausschließen. Ein Anspruch auf Dauerverfügbarkeit besteht nicht.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Datenschutz</h2>
        <p>Der Schutz Ihrer Daten ist uns wichtig. Details finden Sie in unserer <a href="/datenschutz" className="text-blue-600 underline">Datenschutzerklärung</a>.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">8. Änderungen der AGB</h2>
        <p>Wir behalten uns vor, diese AGB anzupassen. Änderungen werden auf der Plattform veröffentlicht; die weitere Nutzung gilt als Zustimmung.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">9. Gerichtsstand &amp; anwendbares Recht</h2>
        <p>Es gilt Schweizer Recht. Gerichtsstand ist, soweit zulässig, der Sitz der Ba & Be Partners KLG in Baar.</p>
      </div>
    </section>
  )
}
