# Projektstatus

Stand: 28. November 2026. `main` = PR #9 (b635958), Production auf Vercel deployt. Weiterentwicklung auf `claude/beta-readiness`.

## Kurzfassung

Der Code baut, alle Prüfungen sind grün und die Bedienung ist mit Mock-Daten getestet. **Die Beta ist nicht live-fähig**, weil die externen Zugänge fehlen (siehe Blocker). Eine echte Flug- oder Hotelantwort von Booking über RapidAPI wurde nie erfolgreich empfangen; das Antwortschema der Adapter ist daher nicht live bestätigt.

## Git-Stand

| Ort | Stand | Bemerkung |
|---|---|---|
| GitHub `main` | 3c2b397 (27.11.2026) | PR #8 gemergt (PR #7 + Stabilisierung + neues Intro). Baut, CI grün, Production-Deployment erfolgreich. |
| PRs #1–#7 | geschlossen | Durch #8 ersetzt. Branch `fix/travel-search-dates-guests` (PR #1) bleibt als Referenz für KI-Tagesplan, gespeicherte Reisen und Airbnb-Link. |
| PR #9 `claude/ux-improvements` | gemergt 28.11.2026 | Merkliste, Kombination Flug + Hotel, Kalendersperre, Suche zuoberst. |
| PR #10 `claude/beta-readiness` | gemergt 28.11.2026 | Statusanzeige, Live-Check-Skript. |
| `claude/duffel-nuitee-sandbox` | neuer PR | Duffel- und Nuitée-Adapter, nur Sandbox. |
| Lokal `F:\ai-travelagency` | 0624547 (02.08.2025) | Veraltet, keine ungepushten neueren Änderungen. GitHub ist massgeblich. |

Der frühere Vercel-Fehler `Can't resolve '@/lib/amadeus'` (Commit dac2b9d) ist auf PR #7 behoben; Amadeus/Kiwi kommen im Code nicht mehr vor.

## Prüfergebnisse am 27.11.2026 (Cloud-Klon)

| Prüfung | Ergebnis |
|---|---|
| `npm audit --omit=dev` | 0 Schwachstellen (nach Update auf Next 15.5.29, axios 1.21) |
| `npx tsc --noEmit` | ok |
| `npx eslint .` | ok, `no-explicit-any` wieder aktiv, 0 `any` im Code |
| `npm test` | 68/68 |
| `npm run build` | ok |
| `npm run smoke` | ok (Seite + 10 API-Fälle ohne Schlüssel) |
| `npm run e2e` | 42/42 (Desktop + Mobile, alle APIs gemockt) |
| Echte API-Tests | **nicht möglich**: keine Schlüssel in dieser Umgebung, Zugänge laut letzter Live-Prüfung gesperrt |

## Externe Blocker (Entscheidung des Betreibers nötig)

1. **RapidAPI Booking COM 18** (`booking-com18.p.rapidapi.com`): HTTP 403 «You are not subscribed to this API» (Live-Prüfung 14.10.2026). Ohne Abo keine Flüge und keine Hotels. Abo mit Kostenlimit nötig, oder bewusst ein anderes, bereits abonniertes Booking-Produkt wählen (dann Adapter anhand echter Antworten anpassen).
2. **OpenAI**: HTTP 429 `insufficient_quota` (kein API-Guthaben). Die Suche funktioniert ohne KI weiter (Formular + deterministisches Ranking), aber KI-Suche, Rechtschreibkorrektur und KI-Ranking nicht.
3. **Vercel**: Vorschau-Deployments sind geschützt (403 für die bisherige Verbindung). Für Tester ist eine zugängliche URL nötig.
4. **RapidAPI-Schlüssel kompromittiert**: Ein Schlüssel stand früher als Fallback im Quellcode und ist in der öffentlichen Git-Historie sichtbar. Beim Anbieter rotieren und in Vercel ersetzen. Eine Bereinigung der Historie wäre destruktiv (Force-Push) und ersetzt die Rotation nicht.

## Funktionsstand

| Funktion | Stand |
|---|---|
| Manuelle Suche Flug / Hotel / beides | umgesetzt, Mock-getestet |
| KI-Reisesuche (`parse-trip`) | umgesetzt; fehlende Angaben werden nicht erfunden, Übernahme aus dem Formular wird angezeigt |
| Stadterkennung | lokal (112 Flughäfen, deutsche/englische Namen, Akzente, IATA), KI-Korrektur nur bei Unbekanntem, mit Cache; unklare Eingaben erzeugen eine Meldung |
| KI-Auswahl der besten 3 Flüge | umgesetzt (nur IDs, Originaldaten serverseitig), Fallback Preis/Stopps |
| Alle Flugangebote sichtbar, Sortierung, Direktflugfilter | umgesetzt |
| Hin-/Rückflug inkl. Segmente | umgesetzt |
| Fehler je Suchbereich, Ladeanzeige, Abbrechen, Timeouts | umgesetzt |
| Rate Limiting / Kostenbremse | umgesetzt (pro Serverless-Instanz, nicht global) |
| Gespeicherte Suchen (lokal, max. 10) | umgesetzt |
| Merkliste (Herz, lokal, max. 30) | umgesetzt, Mock-getestet |
| Günstigste Kombination Flug + Hotel | umgesetzt (nur gleiche Währung, keine Umrechnung) |
| Kalender sperrt vergangene Daten | umgesetzt |
| Duffel-Flüge / Nuitée-Hotels (Sandbox, nur Suche) | umgesetzt, Mock-getestet; Schema nicht live bestätigt, Sandbox-Konten fehlen noch |
| FlightCard: Airline-Logo | offen (früher externer Dienst airhex, Lizenz/Schlüssel ungeklärt) |
| HotelCard: Sterne, Bewertungszahl, Rezensionen, Tags | offen; erst nach Live-Schema von Booking COM 18 abbildbar (nichts erfinden) |
| Gepäckinformationen | nach der Beta |

## Nächste Schritte

1. Betreiber: RapidAPI-Abo/Schlüsselrotation, OpenAI-Guthaben mit Budget, Vercel-Zugang, Entscheid zum Namen «Book Repeat».
2. Nach Schlüsselwechsel: `npm run live-check` (siehe docs/TESTING.md), Adapter bei Schema-Abweichung anpassen.
3. Mit gültigen Schlüsseln: wenige echte Aufrufe (ZRH→BER einfach/retour, 1 und 2 Erwachsene, Hotel Berlin) und Adapter gegen das echte Schema prüfen.
4. Preview-Deployment testen, dann Production freigeben.
