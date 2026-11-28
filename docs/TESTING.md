# Tests

## Automatisch (ohne API-Kosten)

| Befehl | Inhalt |
|---|---|
| `npm test` | Node-Tests (`tests/*.test.cjs`): Validierung, Adapter, Fehlerklassen, KI-ID-Auswahl, Buchungslinks, Stadterkennung, Rate Limit, Hotel-/Trip-Parameter |
| `npm run smoke` | startet den Production-Build ohne Schlüssel und prüft Seite + API-Fehlerfälle |
| `npm run e2e` | Playwright Desktop + iPhone 13; alle `/api/*`-Antworten gemockt |

Stand 28.11.2026: 62 Node-Tests, Smoke, 40 Browsertests grün. CI (`.github/workflows/ci.yml`) führt dieselben Schritte bei jedem PR aus.

## Abgedeckte Fälle (Mock)

Manuelle Flug-/Hotel-/Kombisuche, KI-Ausfall bei Prompt und Ranking, falsch geschriebene Stadt mit KI-Korrektur, unbekannte Stadt, IATA-Codes, Hin-/Rückreise, 1–9 Personen, ungültige/vergangene Daten, gleiche Flughäfen, keine Ergebnisse, Anbieter 403/429/Timeout/ungültige Antwort, Abbrechen, mobile Darstellung bis 320 px, unsichere Buchungslinks.

## Live-Tests (offen)

Mit gültigen Schlüsseln, bewusst wenige Aufrufe: `npm run verify:beta -- --live` (siehe `scripts/verify-beta-lib.cjs`). Vorgeschlagen: ZRH→BER einfach und retour, 1 und 2 Erwachsene, Hotel Berlin 1 Nacht, 1 Prompt. Ergebnisse hier mit Datum eintragen. Bisher kein erfolgreicher Live-Test (14.10.2026: 403 RapidAPI, 429 OpenAI).

## Live-Check nach Schlüsselwechsel (manuell, kostet API-Kontingent)

```
RAPIDAPI_KEY=... npm run live-check            # höchstens 3 RapidAPI-Abfragen
RAPIDAPI_KEY=... OPENAI_API_KEY=... npm run live-check -- --openai   # + 1 Mini-Abfrage an OpenAI
```

Prüft Hotel-Ort Berlin, Hotels Berlin und Flüge ZRH ⇄ BER (in 30 Tagen). Ausgegeben werden nur HTTP-Status, Feldnamen der Antwort (keine Werte) und wie viele Angebote die Adapter übernehmen. «SCHEMA PASST NICHT» heisst: Adapter in `src/lib/flight-offers.ts` bzw. `src/lib/hotel-offers.ts` an die gezeigte Struktur anpassen. Schlüssel werden nie ausgegeben. Nicht in CI ausführen.

Ohne lokalen Schlüssel: GitHub → Actions → «Live check (manual)» → «Run workflow». Voraussetzung: Repository-Secrets `RAPIDAPI_KEY` (und optional `OPENAI_API_KEY`) unter Settings → Secrets and variables → Actions. Läuft nie automatisch.
