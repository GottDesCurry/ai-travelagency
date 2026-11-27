# Tests

## Automatisch (ohne API-Kosten)

| Befehl | Inhalt |
|---|---|
| `npm test` | Node-Tests (`tests/*.test.cjs`): Validierung, Adapter, Fehlerklassen, KI-ID-Auswahl, Buchungslinks, Stadterkennung, Rate Limit, Hotel-/Trip-Parameter |
| `npm run smoke` | startet den Production-Build ohne Schlüssel und prüft Seite + API-Fehlerfälle |
| `npm run e2e` | Playwright Desktop + iPhone 13; alle `/api/*`-Antworten gemockt |

Stand 27.11.2026: 55 Node-Tests, Smoke, 36 Browsertests grün. CI (`.github/workflows/ci.yml`) führt dieselben Schritte bei jedem PR aus.

## Abgedeckte Fälle (Mock)

Manuelle Flug-/Hotel-/Kombisuche, KI-Ausfall bei Prompt und Ranking, falsch geschriebene Stadt mit KI-Korrektur, unbekannte Stadt, IATA-Codes, Hin-/Rückreise, 1–9 Personen, ungültige/vergangene Daten, gleiche Flughäfen, keine Ergebnisse, Anbieter 403/429/Timeout/ungültige Antwort, Abbrechen, mobile Darstellung bis 320 px, unsichere Buchungslinks.

## Live-Tests (offen)

Mit gültigen Schlüsseln, bewusst wenige Aufrufe: `npm run verify:beta -- --live` (siehe `scripts/verify-beta-lib.cjs`). Vorgeschlagen: ZRH→BER einfach und retour, 1 und 2 Erwachsene, Hotel Berlin 1 Nacht, 1 Prompt. Ergebnisse hier mit Datum eintragen. Bisher kein erfolgreicher Live-Test (14.10.2026: 403 RapidAPI, 429 OpenAI).
