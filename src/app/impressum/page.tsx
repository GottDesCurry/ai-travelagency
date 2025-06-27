// app/impressum/page.tsx
export const metadata = {
  title: 'Impressum – Ba & Be Partners',
};

export default function ImpressumPage() {
  return (
    <section className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Impressum</h1>
      <div className="space-y-2">
        <p><strong>Betreiber:</strong> Ba & Be Partners KLG</p>
        <p><strong>Adresse:</strong><br/>
          Inwilerriedstrasse 65<br/>
          6340 Baar, Schweiz
        </p>
        <p><strong>Kontakt:</strong><br/>
          Telefon: +41 XX XXX XX XX<br/>
          E-Mail: <a href="mailto:info@ba-be-partners.ch" className="text-blue-600 underline">info@ba-be-partners.ch</a>
        </p>
        <p><strong>Vertretungsberechtigte:</strong><br/>
          Baskaran Visnujan &amp; Kenny Beck
        </p>
        <p><strong>Rechtsform:</strong> Kollektivgesellschaft (KLG)</p>
        <p><strong>UID:</strong> CHE-XX XXX XXX</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Haftungsausschluss</h2>
        <p>Alle Angaben sind ohne Gewähr. Für Inhalte externer Links übernehmen wir keine Verantwortung.</p>
      </div>
    </section>
  )
}
