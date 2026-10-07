import Link from 'next/link'
export const metadata = { title: 'Kontakt – Book Repeat' }
export default function KontaktPage() {
  return <section className="max-w-3xl mx-auto p-6 space-y-6">
    <h1 className="text-3xl font-bold">Kontakt</h1>
    <p>Fragen zur Beta, Feedback oder Partneranfragen kannst du per E-Mail an uns richten.</p>
    <a href="mailto:info@book-repeat.ch" className="inline-block rounded bg-blue-600 text-white px-4 py-2">E-Mail-Programm öffnen</a>
    <p className="text-sm">info@book-repeat.ch · Die Nachricht wird in deinem E-Mail-Programm erstellt und erst durch dich versendet.</p>
    <p>Baskaran &amp; Beck Partners KLG<br />Spechtenstrasse 28<br />6036 Dierikon, Schweiz</p>
    <p>Für eine bereits beim Anbieter gebuchte Reise wende dich an den Ansprechpartner in dessen Buchungsbestätigung. Book Repeat erstellt in dieser Beta keine Buchungen und nimmt keine Zahlungen entgegen.</p>
    <p>Bitte sende keine Ausweiskopien, Karteninformationen oder Passwörter. Für einen Fehlerbericht helfen Datum, gewählte Suchoptionen und die angezeigte Fehlermeldung.</p>
    <Link href="/hilfe" className="text-blue-700 underline">Hilfe zur Suche</Link>
  </section>
}
