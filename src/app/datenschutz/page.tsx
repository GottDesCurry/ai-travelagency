// app/datenschutz/page.tsx
export const metadata = {
  title: 'Datenschutz – Ba & Be Partners',
};

export default function DatenschutzPage() {
  return (
    <section className="max-w-5xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold">Datenschutzerklärung</h1>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">1. Verantwortlicher</h2>
        <p>
          Ba & Be Partners KLG<br/>
          Inwilerriedstrasse 65<br/>
          6340 Baar, Schweiz<br/>
          E-Mail: <a href="mailto:info@ba-be-partners.ch" className="text-blue-600 underline">info@ba-be-partners.ch</a>
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">2. Rechtsgrundlagen und Zwecke</h2>
        <p>Wir verarbeiten Ihre Daten zur Vertragserfüllung, zur Verbesserung unserer Dienste und zu Marketingzwecken nur mit Ihrer Einwilligung oder aufgrund gesetzlicher Vorgaben (revDSG, DSGVO).</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">3. Erhobene Daten</h2>
        <ul className="list-disc list-inside">
          <li>Kontaktdaten (Name, E-Mail)</li>
          <li>Reise- und Buchungsdaten</li>
          <li>Geräte- und Nutzungsinformationen</li>
          <li>IP-Adresse, Standort (sofern zugestimmt)</li>
        </ul>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">4. Weitergabe an Dritte</h2>
        <p>Eine Weitergabe erfolgt ausschließlich zum Zweck der Buchungsabwicklung an Flug- und Hotelanbieter sowie Zahlungsdienstleister. Ohne Ihre Einwilligung findet keine Datenweitergabe zu Werbezwecken statt.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">5. Speicherdauer</h2>
        <p>Wir speichern Ihre Daten nur so lange, wie es für die genannten Zwecke oder durch gesetzliche Vorgaben erforderlich ist.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">6. Ihre Rechte</h2>
        <p>Sie können Auskunft, Berichtigung, Löschung, Einschränkung der Verarbeitung sowie Datenübertragbarkeit verlangen. Widerspruchsrecht gegen Verarbeitung zu Marketingzwecken.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">7. Cookies &amp; Tracking</h2>
        <p>Unsere Website verwendet Cookies und Analysedienste. Sie können dies in Ihren Browsereinstellungen oder über das Cookie-Banner anpassen.</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">8. Änderungen</h2>
        <p>Diese Erklärung kann jederzeit angepasst werden. Die aktuelle Version finden Sie hier.</p>
      </div>
    </section>
  )
}
