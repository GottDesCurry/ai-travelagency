// ✅ IMPRESSUM FÜR BOOK REPEAT
// Datei: /app/impressum/page.tsx

import React from 'react'

export default function ImpressumPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Impressum</h1>
      <p className="mb-4">Angaben gemäß § 5 TMG / Art. 322 OR:</p>
      <p className="mb-2"><strong>Firma:</strong> Baskaran & Beck Partners KLG</p>
      <p className="mb-2"><strong>Adresse:</strong> Spechtenstrasse 28, 6036 Dierikon, Schweiz</p>
      <p className="mb-2"><strong>Handelsregister-Nummer:</strong> CHE-184.357.425</p>
      <p className="mb-2"><strong>Vertretungsberechtigte Personen:</strong> Visnujan Baskaran, Kenyatta Lorenzo Beck</p>
      <p className="mb-2"><strong>E-Mail:</strong> info@book-repeat.ch</p>
      <p className="mb-2"><strong>Telefon:</strong> +41 79 000 00 00 (Platzhalter)</p>
      <p className="mt-6 text-sm text-gray-600">
        Haftung für Inhalte: Trotz sorgfältiger Pflege der Inhalte übernehmen wir keine Haftung für die Richtigkeit, Vollständigkeit oder Aktualität der Inhalte dieser Website.
      </p>
      <p className="mt-2 text-sm text-gray-600">
        Haftung für Links: Unsere Website enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
      </p>
    </main>
  )
}
