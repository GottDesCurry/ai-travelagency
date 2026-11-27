# Projektstatus

Stand: 27. November 2026. Branch `claude/beta-stabilization` (basiert auf PR #7 `fix/return-flight-display`).

## Kurzfassung

Der Code baut, alle Prüfungen sind grün und die Bedienung ist mit Mock-Daten getestet. **Die Beta ist nicht live-fähig**, weil die externen Zugänge fehlen (siehe Blocker). Eine echte Flug- oder Hotelantwort von Booking über RapidAPI wurde nie erfolgreich empfangen; das Antwortschema der Adapter ist daher nicht live bestätigt.

## Git-Stand

| Ort | Stand | Bemerkung |
|---|---|---|
| GitHub `main` | f698970 (30.09.2026) | **Baut nicht**: `pages/api/flights-aggregated.ts` enthält wörtlich `fetch(...)` sowie Kiwi-/Amadeus-Aufrufe. |
| PR #7 `fix/return-flight-display` | 46e9273 (14.10.2026) | Konsolidierter Beta-Stand, nie nach `main` gemergt. |
| `claude/beta-stabilization` | dieser Branch | PR #7 + Stabilisierung vom 27.11.2026. |
| Lokal `F:\ai-travelagency` | 0624547 (02.08.2025) | Veraltet, keine ungepushten neueren Änderungen. GitHub ist massgeblich. |

Der frühere Vercel-Fehler `Can't resolve '@/lib/amadeus'` (Commit dac2b9d) ist auf PR #7 behoben; Amadeus/Kiwi kommen im Code nicht mehr vor.

## Prüfergebnisse am 27.11.2026 (Cloud-Klon)

| Prüfung | Ergebnis |
|---|---|
| `npm audit --omit=dev` | 0 Schwachstellen (nach Update auf Next 15.5.29, axios 1.21) |
| `npx tsc --noEmit` | ok |
| `npx eslint .` | ok, `no-explicit-any` wieder aktiv, 0 `any` im Code |
| `npm test` | 55/55 |
| `npm run build` | ok |
| `npm run smoke` | ok (Seite + 10 API-Fälle ohne Schlüssel) |
| `npm run e2e` | 36/36 (Desktop + Mobile, alle APIs gemockt) |
| Echte API-Tests | **nicht möglich**: keine Schlüssel in dieser Umgebung, Zugänge laut letzter Live-Prüfung gesperrt |

## Externe Blocker (Entscheidung des Betreibers nötig)

1. **RapidAPI Booking COM 18** (`booking-com18.p.rapidapi.com`): HTTP 403 «You are not subscribed to this API» (Live-Prüfung 14.10.2026). Ohne Abo keine Flüge und keine Hotels. Abo mit Kostenlimit nötig, oder bewusst ein anderes, bereits abonniertes Booking-Produkt wählen (dann Adapter anhand echter Antworten anpassen).
2. **OpenAI**: HTTP 429 `insufficient_quota` (kein API-Guthaben). Die Suche funktioniert ohne KI weiter (Formular + deterministisches Ranking), aber KI-Suche, Rechtschreibkorrektur und KI-Ranking nicht.
3. **Vercel**: Vorschau-Deployments sind geschützt (403 für die bisherige Verbindung). Für Tester ist eine zugängliche URL nötig.
4. **RapidAPI-Schlüssel kompromittiert**: Ein Schlüssel stand früher als Fallback im Quellcode und ist in der öffentlichen Git-Historie sichtbar. Beim Anbieter rotieren und in Vercel ersetzen. Eine Bereinigung der Historie wäre destruktiv (Force-Push) und ersetzt die Rotation nicht.
5. **GitHub-Verbindung** für Agenten fehlt (Push/PR aus der Cloud-Sitzung nicht möglich).

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
| FlightCard: Airline-Logo | offen (früher externer Dienst airhex, Lizenz/Schlüssel ungeklärt) |
| HotelCard: Sterne, Bewertungszahl, Rezensionen, Tags, Favoriten | offen; erst nach Live-Schema von Booking COM 18 abbildbar (nichts erfinden) |
| Gepäckinformationen | nach der Beta |

## Nächste Schritte

1. Betreiber: GitHub verbinden, RapidAPI-Abo/Schlüsselrotation, OpenAI-Guthaben mit Budget, Vercel-Zugang.
2. PR dieses Branches gegen `main` prüfen und mergen (ersetzt den kaputten `main`).
3. Mit gültigen Schlüsseln: wenige echte Aufrufe (ZRH→BER einfach/retour, 1 und 2 Erwachsene, Hotel Berlin) und Adapter gegen das echte Schema prüfen.
4. Preview-Deployment testen, dann Production freigeben.
