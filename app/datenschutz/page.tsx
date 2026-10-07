// app/datenschutz/page.tsx
import fs from 'fs'
import path from 'path'
import ReactMarkdown from 'react-markdown'

export const metadata = {
  title: 'Datenschutz – Book Repeat',
}

export default async function DatenschutzPage() {
  const filePath = path.join(process.cwd(), 'src', 'content', 'datenschutz.md')
  const fileContents = fs.readFileSync(filePath, 'utf8')

  return (
    <div className="max-w-5xl mx-auto p-6">
      <section
        id="settings"
        aria-labelledby="privacy-settings-title"
        tabIndex={-1}
        className="scroll-mt-6 mb-8 rounded-xl border border-gray-200 bg-gray-50 p-6"
      >
        <h2 id="privacy-settings-title" className="text-2xl mb-4">
          Datenschutz-Einstellungen
        </h2>
        <p className="mb-3">
          Gemäss unserer Datenschutzerklärung verwendet Book Repeat nur technisch
          notwendige Cookies. Optionale Analyse- oder Marketing-Cookies sind
          derzeit nicht vorgesehen.
        </p>
        <p className="mb-3">Wenn du eine Suche ausdrücklich speicherst, werden deren Formularangaben lokal in diesem Browser abgelegt. Du kannst einzelne oder alle gespeicherten Suchen auf der Startseite löschen. Es erfolgt keine Kontosynchronisierung.</p>
        <p>
          Deshalb gibt es aktuell keine optionalen Cookie-Einstellungen.
          Informationen zur Verarbeitung deiner Daten und zu deinen Rechten
          findest du in der nachfolgenden Datenschutzerklärung.
        </p>
      </section>

      <section aria-label="Datenschutzerklärung" className="prose prose-lg">
        <ReactMarkdown>{fileContents}</ReactMarkdown>
      </section>
    </div>
  )
}
