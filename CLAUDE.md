# CLAUDE.md – Arbeitsregeln für KI-Agenten

Kurzkontext für jeden Agenten, der dieses Repo übernimmt. Details: [docs/PROJECT_STATUS.md](docs/PROJECT_STATUS.md).

## Projekt

AI TravelAgency (Arbeitsmarke «Book Repeat»): KI-gestützte Reisesuche. Next.js 15 (App Router unter `app/` und Pages-API unter `pages/api/`), React 19, TypeScript strict, Tailwind 4. Deployment: Vercel-Projekt `ai-travelagency` (Team `visnus-projects`).

## Verbindliche Regeln des Betreibers

1. Live-Anbieter: **Booking.com über RapidAPI** plus **OpenAI**. Zusätzlich vom Betreiber am 28.11.2026 freigegeben: **Duffel** (Flüge) und **Nuitée/LiteAPI** (Hotels), nur Testumgebung/Sandbox, nur Suche. Live-Schlüssel oder Buchungen erst nach ausdrücklicher Freigabe. Kein Amadeus, Skyscanner, Kiwi oder andere Anbieter, auch keine Platzhalter.
2. Bestehende OpenAI-Funktionen nie entfernen: `/api/parse-trip`, `/api/ai-correct-city`, `/api/ai` (Ranking).
3. Keine erfundenen Angebote, Preise, Verfügbarkeiten, Tags, Bewertungen oder Buchungslinks. Die KI wählt nur vorhandene Angebots-IDs; Originaldaten werden serverseitig zugeordnet.
4. Kein `any`, keine abgeschalteten ESLint-/TS-Regeln, Laufzeitvalidierung für alle externen Daten (`unknown` + Type Guards).
5. Keine Schlüssel im Code, in Logs, Docs oder mit `NEXT_PUBLIC_`. Nur `RAPIDAPI_KEY`, `OPENAI_API_KEY`, `DUFFEL_ACCESS_TOKEN` (Test) und `LITEAPI_KEY` (Sandbox), serverseitig.
6. Vor Kosten, neuen Konten/Abos, Löschungen, Domains oder nicht umkehrbaren Schritten den Betreiber fragen.
7. Kleine, nachvollziehbare Commits auf einem Branch, PR statt direktem Push auf `main`.
8. Nie behaupten, etwas funktioniere, ohne es getestet zu haben. Mock-Tests belegen keine Live-Fähigkeit.

## Prüfbefehle (alle müssen grün sein)

```
npm ci
npm audit --omit=dev --audit-level=high
npm test            # node --test, Mock-Daten, keine API-Kosten
npx tsc --noEmit
npx eslint .
npm run build
npm run smoke       # Production-Server ohne Schlüssel
npm run e2e         # Playwright, alle APIs gemockt
```

## Wichtige Dateien

- `app/page.tsx` – Suchformular, Ablauf Prompt → Stadterkennung → Flug-/Hotelsuche
- `src/lib/city-lookup.ts` – lokale Stadt-/IATA-Erkennung (vor jedem KI-Aufruf)
- `src/lib/flight-search.ts`, `src/lib/flight-offers.ts` – Booking-RapidAPI-Flugsuche und Normalisierung
- `pages/api/hotels.ts`, `src/lib/hotel-offers.ts` – Hotelsuche und Normalisierung
- `src/lib/duffel.ts`, `src/lib/liteapi.ts`, `src/lib/sandbox-providers.ts` – Sandbox-Anbieter (nur Test-/Sandbox-Schlüssel)
- `src/lib/rate-limit.ts` – Kosten-/Missbrauchsschutz (pro Instanz, nicht global)
- `src/lib/provider-errors.ts` – Fehlerklassen ohne Upstream-Details
- `docs/` – Status, Architektur, Entscheidungen, Tests, Deployment
