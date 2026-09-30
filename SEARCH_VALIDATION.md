# Reise-Suche: Einrichtung und Prüfung

Die aktive Suche verwendet die bereits im Projekt vorhandene Booking COM API
`booking-com18.p.rapidapi.com`. Der RapidAPI-Schlüssel muss für genau diesen
Anbieter freigeschaltet sein. Andere Booking-API-Abonnements sind nicht austauschbar.
`RAPIDAPI_KEY` wird serverseitig benötigt, `OPENAI_API_KEY` nur für die Texteingabe.
Die manuelle Suche benötigt keinen OpenAI-Schlüssel.

## Verhalten

- `/api/flights` und `/api/flights-aggregated` verwenden dieselbe GET-Suche.
- Erwachsene und optionales Rückflugdatum werden an die Flug-API übergeben.
- `/api/hotels` erwartet city, checkin, checkout und adults und liefert `{ city, results }`.
- Hotels werden für ein Zimmer und 1–9 Erwachsene gesucht; Kinder und mehrere Zimmer
  sind in dieser Version nicht unterstützt.
- Die KI interpretiert den Reisewunsch. Flugangebote werden nach Anbieterpreis sortiert,
  ohne eine zweite KI-Anfrage, die Preise oder Angebotsdaten verändern könnte.
- Hin- und Rückflug müssen bei einer Rückreise in der Antwort vorhanden sein.
- Buchungslinks werden nur angezeigt, wenn der Anbieter eine HTTPS-URL liefert.
- Leere Suchergebnisse, Anbieterfehler und unlesbare Antworten werden unterschieden.

## Prüfung

`npm ci`, `npm test`, `npx tsc --noEmit`, `npm run lint`, `npm run build`.
Die Tests simulieren Anbieterantworten. Sie bestätigen Parameterübergabe, Datums-
und Personenprüfung, Darstellungsschema und Fehlerbehandlung, aber nicht den
aktuellen Vertrag der externen API.

## Vor Freigabe mit echten Angeboten prüfen

1. In einer Preview mit dem eigenen Booking-COM-18-Abonnement eine einfache
   Flugsuche ZRH–BER für ein zukünftiges Datum und zwei Erwachsene ausführen.
2. Hin-/Rückflug und drei Erwachsene prüfen; beide Flugstrecken müssen sichtbar sein.
3. Hotels Berlin für zwei Erwachsene und drei Nächte suchen. Ort, Gäste und Zeitraum
   mit dem Anbieter-Angebot vergleichen; insbesondere die Bedeutung des Preises
   (pro Person/Zimmer/Aufenthalt) verifizieren.
4. Nur Hotels und nur Flüge separat testen. Eine leere Trefferliste und Anbieterfehler
   dürfen keinen Erfolg vortäuschen.
5. Reisewunsch in Alltagssprache testen und die daraus erkannten Felder prüfen.
6. Echte Antwortschemas und Parameternamen im abonnementspezifischen RapidAPI-
   Playground mit `src/lib/search-provider.ts` und `src/lib/travel.ts` abgleichen.

Die öffentlich lesbare Anbieter-Seite dokumentiert die Parameter und Antwortschemas
nicht ausreichend. Diese Reparatur erhält die bisherigen Provider-Endpunkte und
Parameternamen und behandelt abweichende Schemas explizit als Fehler. Ohne Zugriff
auf den abonnierten Playground und echte Antworten ist die Provider-Integration
noch nicht live verifiziert. Es wurden keine Preise oder Buchungslinks erfunden.

## Erweiterte Website

- Die Startseite zeigt eine überspringbare Flugzeug-/Wolkenanimation einmal pro
  Browser-Sitzung. Bei reduzierter Bewegung wird sie ausgelassen.
- Budget und Interessen werden für den KI-Tagesplan verwendet; die Angebotssuche
  garantiert keine Reise innerhalb des Budgets und ermittelt keinen Paketpreis.
- `/api/itinerary` benötigt den OpenAI-Schlüssel und erstellt Vorschläge für maximal
  14 Reisetage. Aktivitätsvorschläge sind keine live geprüften Angebote oder Buchungen.
- „Meine Reise“ speichert genau eine Reise lokal in diesem Browser. Eine neue
  Speicherung ersetzt die vorherige; Löschen und Drucken sind möglich.
- Airbnb öffnet eine externe Suche. Es gibt keinen Import von Airbnb-Angeboten,
  keinen Airbnb-Checkout und keine behauptete Partnerschaft.
- Eine direkte Buchung, Zahlung, Stornierungsverwaltung und geräteübergreifende
  Konten sind noch nicht implementiert. Anbieter-Verträge und die Buchungsabwicklung
  müssen vor einer solchen Erweiterung festgelegt werden.
- `tests/browser-smoke.cjs` prüft die Benutzerabläufe mit simulierten Suchantworten.
  Beispiel: `PLAYWRIGHT_MODULE=/path/to/playwright node tests/browser-smoke.cjs` bei
  laufendem Produktionsserver auf Port 3100. `TEST_BASE_URL` überschreibt die URL.
