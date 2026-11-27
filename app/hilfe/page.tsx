import Link from 'next/link'
export const metadata = { title: 'Hilfe – Book Repeat' }
const answers = [
 ['Wie suche ich eine Reise?', 'Gib Abflugort und Reiseziel als Stadt oder Flughafencode ein. Wähle die Reisedaten und 1–9 Erwachsene. Für Hotels ist ein Check-out nach dem Check-in erforderlich. Du kannst Flüge und Hotels getrennt suchen.'],
 ['Brauche ich die KI?', 'Nein. Du kannst die Felder direkt ausfüllen. Die optionale Beschreibung hilft bei der Eingabe; prüfe die daraus übernommenen Angaben.'],
 ['Kann ich hier buchen und bezahlen?', 'Diese Beta zeigt Suchergebnisse und leitet zum jeweiligen Anbieter weiter. Buchung, Zahlung und Bestätigung erfolgen dort. Ein Klick auf ein Angebot ist noch keine Reservierung.'],
 ['Welche Kosten sind enthalten?', 'Die angezeigten Beträge stammen vom Suchanbieter. Prüfe vor einer Buchung dessen Gesamtpreis für alle Reisenden, Gepäck, Zimmerbelegung, Gebühren und Stornobedingungen. Die Beta garantiert keine vollständige Marktübersicht oder den niedrigsten Preis.'],
 ['Warum erscheint ein Fehler?', 'Ein Anbieter kann nicht konfiguriert, vorübergehend nicht erreichbar oder ohne passende Ergebnisse sein. Flug- und Hotelsuche laufen unabhängig; ein Fehler in einer Suche muss die andere nicht verhindern. Du kannst die Anfrage abbrechen und erneut starten.'],
 ['Wo werden gespeicherte Suchen abgelegt?', 'Nur wenn du eine Suche speicherst, werden ihre Formularangaben lokal in diesem Browser abgelegt. Sie werden nicht mit einem Konto synchronisiert. Auf gemeinsam genutzten Geräten solltest du sie löschen. Private Browsermodi oder gelöschte Browserdaten können die Liste entfernen.'],
 ['Was ist mit Airbnb, Kindern und Direktzahlungen?', 'Diese Funktionen sind noch nicht verfügbar. Der aktuelle Suchumfang umfasst Flüge und Hotels für Erwachsene mit Übergabe zum Anbieter.'],
 ['Wer hilft nach einer Buchung?', 'Der Anbieter und die Kontaktinformationen in seiner Bestätigung sind für deine dortige Buchung zuständig. Feedback zu dieser Website kannst du über unsere Kontaktseite senden.']
]
export default function HelpPage() {
 return <section className="max-w-3xl mx-auto p-6 space-y-6">
  <h1 className="text-3xl font-bold">Hilfe zur Beta</h1>
  <section aria-labelledby="beta-quickstart" className="space-y-3">
    <h2 id="beta-quickstart" className="text-xl">Dein erster Test in fünf Minuten</h2>
    <ol className="list-decimal pl-6 space-y-2">
      <li>Wähle eine Reise für Erwachsene, gib Ziel und zukünftige Reisedaten ein und starte die Suche.</li>
      <li>Prüfe Flüge und Hotels getrennt. Sortiere Flüge nach Preis und teste den Direktflugfilter.</li>
      <li>Speichere die Suche und übernimm sie nach dem Neuladen. Auf geteilten Geräten anschließend löschen.</li>
      <li>Falls echte Angebote verfügbar sind: Öffne einen Anbieterlink und vergleiche Daten, Gesamtpreis und Bedingungen. Für den Test ist kein Kauf nötig.</li>
      <li>Melde unverständliche Schritte und Fehlermeldungen über die Kontaktseite. Gesperrte Anbieter können wir nicht durch echte Suchergebnisse ersetzen.</li>
    </ol>
  </section>
  {answers.map(([question,answer]) => <details key={question} className="rounded border p-4"><summary className="cursor-pointer font-medium">{question}</summary><p className="mt-3">{answer}</p></details>)}
  <Link href="/kontakt" className="text-blue-700 underline">Kontakt und Fehler melden</Link>
 </section>
}
