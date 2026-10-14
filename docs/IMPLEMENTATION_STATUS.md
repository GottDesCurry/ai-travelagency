# Umsetzung des Masterplans

Stand: 14. Oktober 2026. Basis: PR #7 / `fix/return-flight-display`. Kein Merge nach main und keine öffentliche Freigabe.

## Abgeschlossen und nachgewiesen

- Next.js 15.5.27; Produktionsbuild, TypeScript, Lint und HTTP-Smoke bestanden am bisherigen UI-Stand. Letzte UI-Version 29ad62e hatte erfolgreiche CI und ein READY-Vercel-Deployment.
- 46 Regressionstests bestehen lokal, einschließlich der neuen Beta-Abnahme. Der neue UI-Block wird zusätzlich durch CI-Browserprüfungen verifiziert.
- Futuristisches blaues Design; Original-Flugzeug und Wolken als Bildassets. Das aktuelle Intro ist eine Bildanimation; das gewünschte realistische Video bleibt offen.
- Alle gültigen Flugangebote bleiben erhalten. Preis-/Stoppsortierung, Hin-/Rückflugfilter, optionale Empfehlungen mit sicherem KI-Fallback.
- Unabhängige Flug-/Hotelsuche, Zeitlimits, Abbrechen, Fehler-/Leerzustände, Validierung und lokale Speicherung von bis zu zehn Suchen.
- KI kann weder Anbieterpreise überschreiben noch Angebote erfinden. Gesperrte APIs und fehlendes Guthaben werden ohne vertrauliche Lieferantendetails behandelt.
- Hilfe, E-Mail-Kontakt, Feedbackvorlage, Browser-Testaufgaben und Betreiber-Auswertung vorhanden. Erreichbarkeit und Firmenangaben vom Betreiber noch zu bestätigen.
- `npm run verify:beta`: prüft Deploymentzugang; mit ausdrücklichem `--live` echte Flug-/Hotelantworten. Kein erfolgreicher Live-Nachweis bisher.

## Neuer kostenloser Verbesserungsblock

- Ohne JavaScript bleibt die Website zugänglich; Hinweis auf die JavaScript-Abhängigkeit der Suche.
- Introassets werden erst nach den Präferenzprüfungen gerendert. Datensparmodus, 2G und reduzierte Bewegung überspringen das Intro.
- Formularfehler erhalten Tastaturfokus und markieren betroffene Felder. Gleiche Flughäfen und leere Hotelziele werden vor Anbieteraufrufen abgefangen.
- Status nennt ausgewählte Produkttypen und die Ergebnisanzahl. Gespeicherte Suchen setzen alte Validierungsfehler zurück.
- 44px-Bedienflächen, Fokus auf FAQ-Elementen, kontrastreiche Systemfarben und 320px-Regeln. Lange Ergebnislisten dürfen außerhalb des sichtbaren Bereichs verzögert gerendert werden; Angebote bleiben im Dokument.
- Browserfälle für diese Änderungen vorbereitet; CI-Ergebnis am neuen Commit prüfen.

## Tatsächliche externe Blocker

Siehe [BETA_LIVE_VALIDATION_2026-10-14.md](BETA_LIVE_VALIDATION_2026-10-14.md).

- Booking COM 18 Flug- und Hotel-Ortssuche: HTTP 403, Produkt nicht abonniert.
- OpenAI: HTTP 429, kein API-Guthaben. Für eine manuelle Such-Beta optional.
- Vercel: geschützter Inhaltszugriff der verbundenen Identität HTTP 403. Deployment READY beweist keinen Testerzugang.
- LiteAPI: Konto besteht, aber weder API-Schlüssel in Vercel noch Integration im Projekt.
- Echte Antwortschemas, Preisbasis, Hotel-Ort, Belegung und Weiterleitungsziele nicht live abgenommen.

Die Vercel-Konfiguration wurde am 14. Oktober erneut anhand der Metadaten geprüft: nur RAPIDAPI_KEY und OPENAI_API_KEY, unveränderte Änderungsdaten. Keine erneuten kostenpflichtigen Anbieteraufrufe, Abonnements oder Budgetänderungen.

## Was noch kostenlos möglich ist

- Tatsächliche Bedienung mit Testpersonen beobachten; größte Probleme beheben.
- Reale iOS-/Android-Geräte und Screenreader prüfen; Performance messen. Keine vollständige Barrierefreiheits- oder Leistungsfreigabe behauptet.
- Geschäfts-/Kontaktangaben, Zielgruppe und Pilotmärkte bestätigen; passende kostenlose Anbieteroptionen prüfen.
- PR #1 Reiseplanung und gespeicherte Reisen getrennt bewerten. Nur das Landingdesign wurde übernommen; lokale gespeicherte Suchen sind keine gespeicherten Reisen.
- Preview-/Produktionskonfiguration, Branchregeln und Rollback prüfen, sobald passende Rechte verfügbar sind.

## Freigabe

Erst echte Anbieterantworten und zugängliche Vorschau abnehmen, dann 5–10 Tester einladen. Flugvideo zuletzt; keine direkte Zahlung oder Buchung in der Beta. Späterer Checkout benötigt Lieferantenverträge, Zahlungsfreigabe sowie bestätigte Orders, Storno und Refund. Der Masterplan ist ein Endproduktplan und kein Beleg bereits implementierter Funktionen.
