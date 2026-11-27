# Architektur

## Struktur

- `app/` – App Router: Startseite (`page.tsx`), Rechts-/Hilfeseiten, API-Routen `parse-trip`, `iata-code`, `hotels-location` (Legacy), `flights-booking` (Legacy).
- `pages/api/` – Pages-API: `flights` (Hauptsuche), `flights-aggregated` (Alias auf `flights`), `search-flights` (Legacy-Parameter), `hotels`, `ai` (Ranking), `ai-correct-city`.
- `src/lib/` – gemeinsame, getestete Logik (Typen, Validierung, Adapter).
- `src/components/` – FlightCard, HotelCard, BookingLink, SavedSearches, TravelLanding, FlightExperience.
- `src/data/` – `iata-codes.json` (Flughäfen mit Aliasen), `city-translations.json`.

App Router und Pages Router bestehen nebeneinander. Es gibt keine Pfadkonflikte (jede `/api/*`-Route existiert nur einmal). Eine Migration ist technisch nicht nötig und wurde bewusst nicht gemacht.

## Datenfluss

```
Formular + optionaler Reisewunsch (app/page.tsx)
  │  Prompt vorhanden → POST /api/parse-trip (OpenAI) → normalizeParsedTrip (Laufzeitprüfung)
  │  fehlende Angaben → Formularwerte, mit sichtbarem Hinweis
  ▼
Stadterkennung src/lib/city-lookup.ts (lokal, ohne KI)
  │  unbekannt → POST /api/ai-correct-city (OpenAI, Cache) → erneut lokal
  │  weiterhin unbekannt/mehrdeutig → Fehlermeldung, kein Anbieteraufruf
  ▼
GET /api/flights-aggregated → searchFlights → booking-com18 /flights/search
  │  normalizeFlightOffers (unknown → FlightOffer[], ungültige Angebote verworfen)
  ▼
alle Angebote anzeigen; bis 15 günstigste → POST /api/ai → nur IDs → selectFlightIds
  │  KI-Fehler/Limit → fallbackFlights (Preis, Stopps)
  ▼
GET /api/hotels → booking-com18 /stays/auto-complete → /stays/search → normalizeHotelOffers
  ▼
FlightCard / HotelCard → BookingLink (nur https, ohne Zugangsdaten in der URL)
```

Flug- und Hotelsuche laufen unabhängig (`settleSearch`): Ein Fehler in einem Bereich lässt die Ergebnisse des anderen stehen.

## Datenmodelle

`FlightOffer`, `FlightLeg`, `FlightSegment` (`src/lib/flight-offers.ts`), `HotelOffer` (`src/lib/hotel-offers.ts`). Alle Antworten externer Dienste werden als `unknown` gelesen und über Type Guards (`isFlightOffer`, `isHotelOffer`, `normalizeParsedTrip`) geprüft, auch im Browser.

## Schutzmechanismen

- Eingabevalidierung in jeder Route (IATA-Format, Datum ab heute, 1–9 Erwachsene, Längenlimits).
- Timeouts: Anbieter 15 s, OpenAI 15 s ohne Retries; Client-Timeouts 20/35 s, Abbrechen möglich.
- Rate Limits (`src/lib/rate-limit.ts`): je Client 40 KI- bzw. 30 Anbieteraufrufe pro 10 Minuten, je Instanz 400/300. In-Memory pro Serverless-Instanz, daher kein globales Kontingent.
- Prompt Injection: Ranking-Prompt erklärt Angebotsdaten als Daten; die KI kann nur IDs zurückgeben, die serverseitig geprüft werden. `parse-trip`-Ausgabe wird validiert, nichts davon wird ungeprüft ausgeführt oder angezeigt.
- Fehlerklassen (`provider-errors.ts`) geben keine Upstream-Bodies, Header oder Billingdetails weiter.
